/**
 * Common utility functions for the Vision 360 application.
 */

export function pad2(n) {
  return String(n).padStart(2, "0");
}

export function todayYMD() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function ymdToDMY(ymd) {
  if (!ymd || typeof ymd !== "string" || ymd.length !== 10) return "";
  const [y, m, d] = ymd.split("-");
  return `${d}/${m}/${y}`;
}

export function ymdToNice(ymd) {
  const d = new Date(`${ymd}T12:00:00`);
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

export function shiftYMD(ymd, deltaDays) {
  const d = new Date(`${ymd}T12:00:00`);
  d.setDate(d.getDate() + deltaDays);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function getWeekRange(ymd) {
  const d = new Date(`${ymd}T12:00:00`);
  const day = d.getDay(); // 0(Sun) - 6(Sat)
  const diffToMon = day === 0 ? -6 : 1 - day;

  const mon = new Date(d);
  mon.setDate(d.getDate() + diffToMon);

  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);

  return {
    start: `${mon.getFullYear()}-${pad2(mon.getMonth() + 1)}-${pad2(mon.getDate())}`,
    end: `${sun.getFullYear()}-${pad2(sun.getMonth() + 1)}-${pad2(sun.getDate())}`
  };
}

export function startOfWeekMonday(ymd) {
  const d = new Date(`${ymd}T12:00:00`);
  const day = d.getDay(); // 0=dimanche, 1=lundi...
  const diff = (day + 6) % 7; // nb de jours depuis lundi
  d.setDate(d.getDate() - diff);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function ymdRangeLabel(mondayYmd) {
  const mon = mondayYmd;
  const sat = shiftYMD(mondayYmd, 5);
  const [y1, m1, d1] = mon.split("-");
  const [y2, m2, d2] = sat.split("-");
  return `Semaine du ${d1}/${m1}/${y1} au ${d2}/${m2}/${y2}`;
}

export function minutesOf(isoLike) {
  if (!isoLike || typeof isoLike !== "string" || isoLike.length < 16) {
      // In some cases we only have HH:MM
      if (isoLike && isoLike.length === 5 && isoLike.includes(":")) {
          const [h, m] = isoLike.split(":").map(Number);
          return h * 60 + m;
      }
      return null;
  }
  const hh = Number(isoLike.slice(11, 13));
  const mm = Number(isoLike.slice(14, 16));
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
  return hh * 60 + mm;
}

export function overlaps(event, period) {
  const s = minutesOf(event?.start);
  const e = minutesOf(event?.end);
  if (s == null || e == null) return false;
  return s < period.endMin && e > period.startMin;
}

export function diffDays(ymd1, ymd2) {
  const d1 = new Date(`${ymd1}T00:00:00`);
  const d2 = new Date(`${ymd2}T00:00:00`);
  return Math.round((d1 - d2) / 86400000);
}

export function formatTimeRange(start, end) {
  const s = start?.slice(11, 16) ?? "";
  const e = end?.slice(11, 16) ?? "";
  return `${s} – ${e}`;
}

export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

/** 
 * Returns a short promo code like "CIR2" or "Adi 1" from longer strings.
 */
export function promoShort(code = "", label = "") {
  const c = String(code).toUpperCase();
  const l = String(label).toUpperCase();

  // Special case for Adimaker as requested by user
  if (c.includes("ADIMAKER") || l.includes("ADIMAKER")) {
    if (c.includes("_A1") || l.includes("1ÈRE ANNÉE") || l.includes("1ERE ANNEE")) return "Adi 1";
    if (c.includes("_A2") || l.includes("2ÈME ANNÉE") || l.includes("2EME ANNEE")) return "Adi 2";
    return "Adi";
  }

  const parts = c.split("_");
  const ignore = [
    "2526", "2425", "ISEN", "BORDEAUX", "BREST", "NANTES", "COURS", "TD", "TP", 
    "CONFERENCE", "EVAL", "S1", "S2", "S3", "S4", "S5", "S6", "DS", "SURV"
  ];
  
  const filtered = parts.filter(p => !ignore.includes(p) && !/^\d+$/.test(p));
  
  if (filtered.length > 0) {
    return filtered.join(" ");
  }

  // Fallback to searching the label for a pattern like CIR2 or AP5
  const match = l.match(/\b([A-Z]{1,4}\d{1,2})\b/);
  if (match?.[1]) return match[1].toUpperCase();

  return "?";
}

/** 
 * Rend "J102" depuis "J102_COURS" or "BDX_J102_FA140_COURS", etc.
 */
export function roomShort(x = "") {
  const raw = String(x).trim();
  if (!raw) return "";

  const parts = raw.split(/[_\s-]+/).filter(Boolean);

  // Ex: J101 / J102 / J201 / A123 / B204 / AMPHI1...
  const strict = parts.find((p) => /^[A-Z]{1,4}\d{2,4}$/i.test(p));
  if (strict) return strict.toUpperCase();

  // Sinon on cherche un token "J102" dans la string
  const m = raw.match(/\b([A-Z]{1,4}\d{2,4})\b/i);
  if (m?.[1]) return m[1].toUpperCase();

  // If it's something like "salle101", extract the "101"
  const numOnly = raw.match(/\d+/);
  if (numOnly) return numOnly[0];

  // fallback
  return (parts[0] ?? raw).toUpperCase();
}

/**
 * Returns "FirstName LastName" or "(inconnu)".
 */
export function personName(p) {
  const first = p?.firstName ? String(p.firstName).trim() : "";
  const last = p?.lastName ? String(p.lastName).trim() : "";
  return `${first} ${last}`.trim() || "(inconnu)";
}

/**
 * Returns a unique and sorted array of strings.
 */
export function uniqueSorted(arr) {
  return Array.from(new Set(arr))
    .filter(Boolean)
    .sort((a, b) =>
      String(a).localeCompare(String(b), "fr", { numeric: true, sensitivity: "base" })
    );
}
