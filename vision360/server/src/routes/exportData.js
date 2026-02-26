// server/src/routes/exportData.js
import { Router } from "express";
import { pool } from "../db.js";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const router = Router();

// Dans ton data.json actuel, les dates sont en +0100 (semaine de novembre)
const TZ_SUFFIX = "+0100";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// routes/ -> src/ -> server/
const SERVER_ROOT = path.resolve(__dirname, "../.."); // vision360/server
const PROJECT_ROOT = path.resolve(SERVER_ROOT, ".."); // vision360
const OUT_DIR = path.join(PROJECT_ROOT, "src", "data"); // vision360/src/data

function toIsoLocal(dtStr) {
  // dtStr = "YYYY-MM-DD HH:MM:SS"
  return String(dtStr).replace(" ", "T") + TZ_SUFFIX;
}

function uniqBy(arr, keyFn) {
  const seen = new Set();
  const out = [];
  for (const x of arr) {
    const k = keyFn(x);
    if (!seen.has(k)) {
      seen.add(k);
      out.push(x);
    }
  }
  return out;
}

/**
 * Fix mojibake fréquent (UTF-8 mal décodé en Windows-1252/Latin1).
 * Exemple: "Ã‰loÃ¯se" -> "Éloïse"
 */
const CP1252_EXTRA = new Map([
  [0x20ac, 0x80],
  [0x201a, 0x82],
  [0x0192, 0x83],
  [0x201e, 0x84],
  [0x2026, 0x85],
  [0x2020, 0x86],
  [0x2021, 0x87],
  [0x02c6, 0x88],
  [0x2030, 0x89],
  [0x0160, 0x8a],
  [0x2039, 0x8b],
  [0x0152, 0x8c],
  [0x017d, 0x8e],
  [0x2018, 0x91],
  [0x2019, 0x92],
  [0x201c, 0x93],
  [0x201d, 0x94],
  [0x2022, 0x95],
  [0x2013, 0x96],
  [0x2014, 0x97],
  [0x02dc, 0x98],
  [0x2122, 0x99],
  [0x0161, 0x9a],
  [0x203a, 0x9b],
  [0x0153, 0x9c],
  [0x017e, 0x9e],
  [0x0178, 0x9f],
]);

function toWin1252Bytes(str) {
  const bytes = [];
  for (const ch of String(str)) {
    const cp = ch.codePointAt(0);
    if (cp <= 0xff) bytes.push(cp);
    else if (CP1252_EXTRA.has(cp)) bytes.push(CP1252_EXTRA.get(cp));
    else return null;
  }
  return Buffer.from(bytes);
}

function fixMojibake(str) {
  if (typeof str !== "string") return str;
  if (!/[ÃÂ]/.test(str)) return str;

  // 1) tentative "escape trick"
  try {
    // eslint-disable-next-line no-undef
    const t = decodeURIComponent(escape(str));
    if (!/[ÃÂ]/.test(t)) return t;
  } catch {
    // ignore
  }

  // 2) tentative win1252 -> utf8
  const buf = toWin1252Bytes(str);
  if (!buf) return str;
  const t = buf.toString("utf8");
  return t.includes("�") ? str : t;
}

// Log uniquement si une correction a été appliquée (pratique pour vérifier champ par champ)
function fixField(value, label = "") {
  if (value == null) return "";
  const original = String(value);
  const fixed = fixMojibake(original);
  if (label && fixed !== original) {
    console.warn(`[encoding-fix] ${label}: "${original}" -> "${fixed}"`);
  }
  return fixed;
}

router.get("/data", async (req, res) => {
  try {
    const fileName = (req.query.file ?? "data.fromdb.json").toString();
    const outPath = path.join(OUT_DIR, fileName);

    // ⚠️ IMPORTANT :
    // en v3, `events.title` est déjà dans le bon format (avec \n et _ comme data.json).
    const [eventsRows] = await pool.query(`
      SELECT event_id, title, debut, fin, all_day, editable, class_name
      FROM events
      ORDER BY debut ASC
    `);

    const [eventStudentsRows] = await pool.query(`
      SELECT es.event_id, s.last_name, s.first_name
      FROM event_students es
      JOIN students s ON s.student_id = es.student_id
      ORDER BY es.event_id ASC, s.last_name ASC, s.first_name ASC
    `);

    const [eventLecturersRows] = await pool.query(`
      SELECT el.event_id, l.last_name, l.first_name
      FROM event_lecturers el
      JOIN lecturers l ON l.lecturer_id = el.lecturer_id
      ORDER BY el.event_id ASC, l.last_name ASC, l.first_name ASC
    `);

    const [eventResourcesRows] = await pool.query(`
      SELECT er.event_id, r.code AS code, r.label AS label
      FROM event_resources er
      JOIN resources r ON r.resource_id = er.resource_id
      ORDER BY er.event_id ASC, r.resource_id ASC
    `);

    const [eventGroupesRows] = await pool.query(`
      SELECT eg.event_id, g.code, g.label
      FROM event_groupes eg
      JOIN groupes g ON g.groupes_id = eg.groupes_id
      ORDER BY eg.event_id ASC, g.code ASC
    `);

    const [eventCoursesRows] = await pool.query(`
      SELECT ec.event_id, c.code, c.course, c.modules
      FROM event_courses ec
      JOIN courses c ON c.course_id = ec.course_id
      ORDER BY ec.event_id ASC, c.code ASC
    `);

    // ---- Maps par event_id ----
    const studentsByEventId = new Map();
    for (const r of eventStudentsRows) {
      const id = String(r.event_id);
      const st = {
        lastName: fixField(r.last_name, "students.last_name"),
        firstName: fixField(r.first_name, "students.first_name"),
      };
      if (!studentsByEventId.has(id)) studentsByEventId.set(id, []);
      studentsByEventId.get(id).push(st);
    }

    // Dedup “par nom” au cas où
    for (const [eid, list] of studentsByEventId.entries()) {
      const unique = uniqBy(list, (s) => `${s.lastName}::${s.firstName}`);
      unique.sort(
        (a, b) =>
          a.lastName.localeCompare(b.lastName, "fr", { sensitivity: "base" }) ||
          a.firstName.localeCompare(b.firstName, "fr", { sensitivity: "base" })
      );
      studentsByEventId.set(eid, unique);
    }

    const lecturersByEventId = new Map();
    for (const r of eventLecturersRows) {
      const id = String(r.event_id);
      const lec = {
        lastName: fixField(r.last_name, "lecturers.last_name"),
        firstName: fixField(r.first_name, "lecturers.first_name"),
      };
      if (!lecturersByEventId.has(id)) lecturersByEventId.set(id, []);
      lecturersByEventId.get(id).push(lec);
    }

    const resourcesByEventId = new Map();
    for (const r of eventResourcesRows) {
      const id = String(r.event_id);
      const item = {
        code: fixField(r.code, "resources.code(BDX)"),
        label: fixField(r.label, "resources.label(Jxxx)"),
      };
      if (!resourcesByEventId.has(id)) resourcesByEventId.set(id, []);
      resourcesByEventId.get(id).push(item);
    }

    for (const [eid, list] of resourcesByEventId.entries()) {
      list.sort((a, b) => a.label.localeCompare(b.label, "fr", { sensitivity: "base" }));
    }

    const groupesByEventId = new Map();
    for (const r of eventGroupesRows) {
      const id = String(r.event_id);
      const grp = {
        code: fixField(r.code, "groupes.code"),
        label: fixField(r.label, "groupes.label"),
      };
      if (!groupesByEventId.has(id)) groupesByEventId.set(id, []);
      groupesByEventId.get(id).push(grp);
    }

    const coursesByEventId = new Map();
    for (const r of eventCoursesRows) {
      const id = String(r.event_id);
      const c = {
        code: fixField(r.code, "courses.code"),
        course: fixField(r.course, "courses.course"),
        module: fixField(r.modules, "courses.modules"),
      };
      if (!coursesByEventId.has(id)) coursesByEventId.set(id, []);
      coursesByEventId.get(id).push(c);
    }

    // ---- Construit les events au format data.json ----
    const out = [];

    for (const e of eventsRows) {
      const id = String(e.event_id);

      out.push({
        id,
        title: fixField(e.title, "events.title"),
        start: toIsoLocal(e.debut),
        end: toIsoLocal(e.fin),
        allDay: Boolean(e.all_day),
        editable: Boolean(e.editable),
        className: String(e.class_name ?? ""),
        students: studentsByEventId.get(id) ?? [],
        lecturers: lecturersByEventId.get(id) ?? [],
        resources: resourcesByEventId.get(id) ?? [],
        groups: groupesByEventId.get(id) ?? [],
        courses: coursesByEventId.get(id) ?? [],
      });
    }

    // ---- Écrit le JSON dans /src/data ----
    await fs.mkdir(OUT_DIR, { recursive: true });
    await fs.writeFile(outPath, JSON.stringify(out, null, 2), "utf-8");

    res.json({
      ok: true,
      written: outPath,
      count: out.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      ok: false,
      code: err.code,
      message: err.sqlMessage || err.message,
      sql: err.sql || null,
    });
  }
});

export default router;