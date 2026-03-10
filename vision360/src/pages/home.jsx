import { useMemo, useState, useEffect } from "react";
import events from "../data/data.json";
import "./home.css";
import { 
  todayYMD, 
  ymdToDMY, 
  ymdToNice, 
  shiftYMD, 
  getWeekRange, 
  overlaps, 
  promoShort, 
  roomShort, 
  personName, 
  uniqueSorted 
} from "../utils/appUtils";

const PERIODS = {
  matin: { label: "Matin", startMin: 8 * 60, endMin: 13 * 60 },
  aprem: { label: "Après-midi", startMin: 13 * 60, endMin: 19 * 60 },
};

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

  // Map of teacher name -> first date they appear in the entire dataset
  const teacherFirstSeenMap = useMemo(() => {
    const map = {};
    for (const e of events) {
      if (!e.lecturers || !e.start) continue;
      const date = String(e.start).slice(0, 10);
      for (const l of e.lecturers) {
        const name = personName(l);
        if (!name) continue;
        if (!map[name] || date < map[name]) {
          map[name] = date;
        }
      }
    }
    return map;
  }, []);

  const evalStats = useMemo(() => {
    const range = getWeekRange(selectedDate);
    const weekEvents = events.filter(e => {
      const d = String(e?.start ?? "").slice(0, 10);
      return d >= range.start && d <= range.end;
    });

    const evals = weekEvents.filter(e => e.className === "Evaluation" || e.className === "est-epreuve");
    const promos = new Set();
    evals.forEach(e => {
      (e.groups ?? []).forEach(g => {
        const s = promoShort(g.code, g.label);
        if (s !== "?") promos.add(s);
      });
    });

    return {
      count: evals.length,
      promos: Array.from(promos).sort()
    };
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
        const items = new Set();
        for (const e of dayEvents) {
          const eventPromos = (e?.groups ?? []).map((g) => promoShort(g?.code, g?.label));
          if (!eventPromos.includes(promo)) continue;
          if (!overlaps(e, period)) continue;

          for (const r of e?.resources ?? []) {
            const rr = roomShort(r?.label ?? r?.code ?? "");
            if (rr) items.add(rr);
          }
        }
        return items.size ? Array.from(items).join(", ") : null;
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
        isNew: teacherFirstSeenMap[r.prof] === selectedDate
      }))
      .sort((a, b) => a.prof.localeCompare(b.prof, "fr", { sensitivity: "base" }));

    return rows.filter((r) => (q ? r.prof.toLowerCase().includes(q) : true));
  }, [dayEvents, query, teacherFirstSeenMap, selectedDate]);

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
      <header className="dashboard-header">
        <div className="header-titles">
          <h1 className="header-title">Tableau de bord</h1>
          <p className="header-subtitle">Vue d'ensemble de l'occupation et des cours</p>
        </div>

        <div className="header-controls">
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

      <div className="dashboard-stats">
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

        <div className="stat-card stat-eval">
          <div className="stat-icon">📝</div>
          <div className="stat-info">
            <div className="stat-value">{evalStats.count}</div>
            <div className="stat-label">Évaluations (Semaine)</div>
          </div>
          <div className="stat-detail text-truncate">
            {evalStats.promos.length > 0 ? evalStats.promos.join(", ") : "Aucune éval"}
          </div>
        </div>
      </div>

      <div className="dashboard-content">
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
                  <tr key={r.prof} className={r.isNew ? "row-new" : ""}>
                    <td>
                      <strong>{r.prof}</strong>
                      {r.isNew && <span className="prof-new-badge">Nouveau</span>}
                    </td>
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
    </section>
  );
}
