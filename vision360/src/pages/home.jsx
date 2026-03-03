import { useMemo, useState, useEffect } from "react";
import events from "../data/data.json";
import "./home.css";

const PERIODS = {
  matin: { label: "Matin", startMin: 8 * 60, endMin: 13 * 60 },
  aprem: { label: "Après-midi", startMin: 13 * 60, endMin: 19 * 60 },
};

function pad2(n) {
  return String(n).padStart(2, "0");
}

function todayYMD() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function ymdToDMY(ymd) {
  if (!ymd || typeof ymd !== "string" || ymd.length !== 10) return "";
  const [y, m, d] = ymd.split("-");
  return `${d}/${m}/${y}`;
}

function ymdToNice(ymd) {
  const d = new Date(`${ymd}T12:00:00`);
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

function shiftYMD(ymd, deltaDays) {
  const d = new Date(`${ymd}T12:00:00`);
  d.setDate(d.getDate() + deltaDays);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function minutesOf(isoLike) {
  if (!isoLike || typeof isoLike !== "string" || isoLike.length < 16) return null;
  const hh = Number(isoLike.slice(11, 13));
  const mm = Number(isoLike.slice(14, 16));
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
  return hh * 60 + mm;
}

function overlaps(event, period) {
  const s = minutesOf(event?.start);
  const e = minutesOf(event?.end);
  if (s == null || e == null) return false;
  return s < period.endMin && e > period.startMin;
}

function promoShort(code = "", label = "") {
  const fromCode = String(code).split("_").pop();
  if (fromCode && fromCode.length <= 8) return fromCode;

  const m = String(label).match(/\b([A-Z]{2,4}\d)\b/);
  return m?.[1] ?? "?";
}

/** Rend "J102" depuis "J102_COURS" ou "BDX_J102_FA140_COURS", etc. */
function roomShort(x = "") {
  const raw = String(x).trim();
  if (!raw) return "";

  const parts = raw.split(/[_\s-]+/).filter(Boolean);

  // Ex: J101 / J102 / J201 / A123 / B204 / AMPHI1...
  const strict = parts.find((p) => /^[A-Z]{1,4}\d{2,4}$/i.test(p));
  if (strict) return strict.toUpperCase();

  // Sinon on cherche un token "J102" dans la string
  const m = raw.match(/\b([A-Z]{1,4}\d{2,4})\b/i);
  if (m?.[1]) return m[1].toUpperCase();

  // fallback
  return (parts[0] ?? raw).toUpperCase();
}

function personName(p) {
  const first = p?.firstName ? String(p.firstName).trim() : "";
  const last = p?.lastName ? String(p.lastName).trim() : "";
  return `${first} ${last}`.trim() || "(inconnu)";
}

function uniqueSorted(arr) {
  return Array.from(new Set(arr))
    .filter(Boolean)
    .sort((a, b) =>
      String(a).localeCompare(String(b), "fr", { numeric: true, sensitivity: "base" })
    );
}

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(todayYMD());
  const [query, setQuery] = useState("");

  const allRooms = useMemo(() => {
    const rooms = [];
    for (const e of events) {
      for (const r of e?.resources ?? []) {
        rooms.push(roomShort(r?.label ?? r?.code ?? ""));
      }
    }
    return uniqueSorted(rooms);
  }, []);

  const allPromos = useMemo(() => {
    const promos = [];
    for (const e of events) {
      for (const g of e?.groups ?? []) {
        promos.push(promoShort(g?.code, g?.label));
      }
    }
    return uniqueSorted(promos).filter((p) => p !== "?");
  }, []);

  const dayEvents = useMemo(() => {
    return events.filter((e) => String(e?.start ?? "").slice(0, 10) === selectedDate);
  }, [selectedDate]);

  const occupiedRooms = useMemo(() => {
    const matin = new Set();
    const aprem = new Set();

    for (const e of dayEvents) {
      const rooms = (e?.resources ?? [])
        .map((r) => roomShort(r?.label ?? r?.code ?? ""))
        .filter(Boolean);

      if (overlaps(e, PERIODS.matin)) rooms.forEach((r) => matin.add(r));
      if (overlaps(e, PERIODS.aprem)) rooms.forEach((r) => aprem.add(r));
    }

    return { matin, aprem };
  }, [dayEvents]);

  const availableRooms = useMemo(() => {
    const all = new Set(allRooms);
    const matin = Array.from(all).filter((r) => !occupiedRooms.matin.has(r));
    const aprem = Array.from(all).filter((r) => !occupiedRooms.aprem.has(r));
    return { matin: uniqueSorted(matin), aprem: uniqueSorted(aprem) };
  }, [allRooms, occupiedRooms]);

  const promoRows = useMemo(() => {
    const q = query.trim().toLowerCase();

    const rows = allPromos.map((promo) => {
      const roomsFor = (period) => {
        const rooms = new Set();
        for (const e of dayEvents) {
          const eventPromos = (e?.groups ?? []).map((g) => promoShort(g?.code, g?.label));
          if (!eventPromos.includes(promo)) continue;
          if (!overlaps(e, period)) continue;

          for (const r of e?.resources ?? []) {
            const rr = roomShort(r?.label ?? r?.code ?? "");
            if (rr) rooms.add(rr);
          }
        }
        return rooms.size ? Array.from(rooms).join(", ") : null;
      };

      return {
        promo,
        matin: roomsFor(PERIODS.matin) ?? "Absent",
        aprem: roomsFor(PERIODS.aprem) ?? "Absent",
      };
    });

    return rows.filter((r) => (q ? r.promo.toLowerCase().includes(q) : true));
  }, [allPromos, dayEvents, query]);

  const profRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const map = new Map();

    for (const e of dayEvents) {
      const rooms = (e?.resources ?? [])
        .map((r) => roomShort(r?.label ?? r?.code ?? ""))
        .filter(Boolean);

      const lecturers = (e?.lecturers ?? []).map(personName).filter(Boolean);

      for (const prof of lecturers) {
        if (!map.has(prof)) map.set(prof, { prof, matin: new Set(), aprem: new Set() });
        const rec = map.get(prof);
        if (overlaps(e, PERIODS.matin)) rooms.forEach((r) => rec.matin.add(r));
        if (overlaps(e, PERIODS.aprem)) rooms.forEach((r) => rec.aprem.add(r));
      }
    }

    const rows = Array.from(map.values())
      .map((r) => ({
        prof: r.prof,
        matin: r.matin.size ? Array.from(r.matin).join(", ") : "Absent",
        aprem: r.aprem.size ? Array.from(r.aprem).join(", ") : "Absent",
      }))
      .sort((a, b) => a.prof.localeCompare(b.prof, "fr", { sensitivity: "base" }));

    // Important: ici, un prof n’apparaît que s’il a au moins un event du jour (map construit depuis dayEvents)
    return rows.filter((r) => (q ? r.prof.toLowerCase().includes(q) : true));
  }, [dayEvents, query]);

  const studentsOnSite = useMemo(() => {
    const set = new Set();
    for (const e of dayEvents) {
      for (const s of e?.students ?? []) {
        const k = `${String(s?.firstName ?? "").trim()}|${String(s?.lastName ?? "").trim()}`;
        if (k !== "|") set.add(k);
      }
    }
    return set.size;
  }, [dayEvents]);

  const occupancy = useMemo(() => {
    const total = allRooms.length || 1;
    const om = occupiedRooms.matin.size;
    const oa = occupiedRooms.aprem.size;
    const pm = Math.round((om / total) * 100);
    const pa = Math.round((oa / total) * 100);
    const overall = Math.round(((pm + pa) / 2) * 10) / 10;
    return { total, om, oa, pm, pa, overall };
  }, [allRooms.length, occupiedRooms]);

  const roomsPreview = (rooms, max = 10) => {
    if (!rooms.length) return "—";
    if (rooms.length <= max) return rooms.join(", ");
    return `${rooms.slice(0, max).join(", ")} +${rooms.length - max}`;
  };

  return (
    <section className="dashboard-page" aria-label="Dashboard">

      {/* 1. Top Bar / Header */}
      <header className="dashboard-header">
        <div className="header-titles">
          <h1 className="header-title">Tableau de bord</h1>
          <p className="header-subtitle">Vue d'ensemble de l'occupation et des cours</p>
        </div>

        <div className="header-controls">
          {/* Date Picker */}
          <div className="control-group">
            <label htmlFor="dateNative">Date</label>
            <div className="dateField">
              <input
                className="input input-dateText"
                type="text"
                value={ymdToNice(selectedDate)}
                readOnly
              />
              <input
                id="dateNative"
                className="input input-dateNative"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                aria-label="Sélectionner une date"
              />
            </div>
            <div className="date-nav">
              <button className="button-icon" onClick={() => setSelectedDate((d) => shiftYMD(d, -1))}>◀</button>
              <button className="button-icon" onClick={() => setSelectedDate(todayYMD())}>Auj.</button>
              <button className="button-icon" onClick={() => setSelectedDate((d) => shiftYMD(d, 1))}>▶</button>
            </div>
          </div>

          {/* Search */}
          <div className="control-group">
            <label htmlFor="q">Recherche rapide</label>
            <input
              id="q"
              className="input search-input"
              placeholder="Promo, prof..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>



        </div>
      </header>

      {/* 2. Hero KPI Stats */}
      <div className="dashboard-stats">

        {/* Card 1: Global */}
        <div className="stat-card stat-global">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <div className="stat-value">{studentsOnSite}</div>
            <div className="stat-label">Élèves sur site</div>
          </div>
          <div className="stat-detail">
            Taux d'occupation global: <strong>{occupancy.overall}%</strong>
          </div>
        </div>

        {/* Card 2: Matin */}
        <div className="stat-card stat-morning">
          <div className="stat-icon">🌅</div>
          <div className="stat-info">
            <div className="stat-value">{availableRooms.matin.length} <small>/ {allRooms.length}</small></div>
            <div className="stat-label">Salles libres (Matin)</div>
          </div>
          <div className="stat-detail text-truncate">
            {roomsPreview(availableRooms.matin, 6)}
          </div>
        </div>

        {/* Card 3: Aprems */}
        <div className="stat-card stat-afternoon">
          <div className="stat-icon">🌇</div>
          <div className="stat-info">
            <div className="stat-value">{availableRooms.aprem.length} <small>/ {allRooms.length}</small></div>
            <div className="stat-label">Salles libres (Après-midi)</div>
          </div>
          <div className="stat-detail text-truncate">
            {roomsPreview(availableRooms.aprem, 6)}
          </div>
        </div>
      </div>

      {/* 3. Content Grid (Split View) */}
      <div className="dashboard-content">

        {/* Left: Promos */}
        <div className="content-panel">
          <div className="panel-header">
            <h2>Promotions présentes</h2>
            <span className="badge">{promoRows.length}</span>
          </div>
          <div className="panel-body scrollArea">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 100 }}>Promo</th>
                  <th>Matin</th>
                  <th>Après-midi</th>
                </tr>
              </thead>
              <tbody>
                {promoRows.map((r) => (
                  <tr key={r.promo}>
                    <td><strong>{r.promo}</strong></td>
                    <td className={r.matin === "Absent" ? "cell-absent" : ""}>{r.matin}</td>
                    <td className={r.aprem === "Absent" ? "cell-absent" : ""}>{r.aprem}</td>
                  </tr>
                ))}
                {promoRows.length === 0 && (
                  <tr><td colSpan={3} className="cell-muted">Aucune promotion trouvée.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Profs */}
        <div className="content-panel">
          <div className="panel-header">
            <h2>Professeurs</h2>
            <span className="badge">{profRows.length}</span>
          </div>
          <div className="panel-body scrollArea">
            <table className="table">
              <thead>
                <tr>
                  <th>Professeur</th>
                  <th>Matin</th>
                  <th>Après-midi</th>
                </tr>
              </thead>
              <tbody>
                {profRows.map((r) => (
                  <tr key={r.prof}>
                    <td><strong>{r.prof}</strong></td>
                    <td className={r.matin === "Absent" ? "cell-absent" : ""}>{r.matin}</td>
                    <td className={r.aprem === "Absent" ? "cell-absent" : ""}>{r.aprem}</td>
                  </tr>
                ))}
                {profRows.length === 0 && (
                  <tr><td colSpan={3} className="cell-muted">Aucun professeur trouvé.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </section >
  );
}
