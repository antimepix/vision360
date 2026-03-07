import { useMemo, useState, useEffect } from "react";
import events from "../data/data.json";
import pedagogicalStaff from "../data/outlook_calendar.json";
import "./presence.css";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function todayYMD() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function promoShort(code = "", label = "") {
  const fromCode = String(code).split("_").pop();
  if (fromCode && fromCode.length <= 8 && fromCode !== "COURS" && fromCode !== "TD" && fromCode !== "TP") return fromCode;
  const m = String(label).match(/\b([A-Z]{2,4}\d)\b/);
  if (m?.[1]) return m[1];
  if (code && code.length <= 8) return code;
  return "?";
}

function personName(p) {
  const first = p?.firstName ? String(p.firstName).trim() : "";
  const last = p?.lastName ? String(p.lastName).trim() : "";
  return `${first} ${last}`.trim() || "(inconnu)";
}

export default function Presence() {
  const [selectedDay, setSelectedDay] = useState(todayYMD());

  // Date picker state initialized from selectedDay
  const [day, setDay] = useState(selectedDay.slice(8, 10));
  const [month, setMonth] = useState(selectedDay.slice(5, 7));
  const [year, setYear] = useState(selectedDay.slice(0, 4));

  useEffect(() => {
    setSelectedDay(`${year}-${month}-${day}`);
  }, [day, month, year]);

  const dailyData = useMemo(() => {
    const promos = new Set();
    const profs = new Set();
    const dayEvents = events.filter(e => String(e?.start ?? "").slice(0, 10) === selectedDay);

    for (const e of dayEvents) {
      for (const g of e.groups ?? []) {
        const s = promoShort(g.code, g.label);
        if (s !== "?") promos.add(s);
      }
      for (const l of e.lecturers ?? []) {
        const n = personName(l);
        if (n && n !== "(inconnu)") profs.add(n);
      }
    }

    return {
      promotions: Array.from(promos).sort(),
      professors: Array.from(profs).sort()
    };
  }, [selectedDay]);

  const pedagogicalStatusList = useMemo(() => {
    const map = new Map();
    const now = new Date();
    const currentHMin = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
    const isTodaySelected = selectedDay === todayYMD();

    // On identifie tous les noms pour garder la liste complète
    for (const entry of pedagogicalStaff) {
      if (entry.calendar && !map.has(entry.calendar)) {
        map.set(entry.calendar, { busyRanges: [], isAlwaysFree: true });
      }
    }

    // On ne garde que les entrées du jour sélectionné
    const entriesToday = pedagogicalStaff.filter(e =>
      e.day === selectedDay || (e.day === null && isTodaySelected)
    );

    for (const entry of entriesToday) {
      const name = entry.calendar;
      if (!name) continue;

      const status = String(entry.title || "").toLowerCase();
      const isOccupied = status === "busy" || status === "away" || status === "tentative" || status === "working elsewhere";

      if (isOccupied) {
        const rec = map.get(name);
        if (rec) {
          rec.isAlwaysFree = false;

          if (entry.allDay) {
            rec.busyRanges.push({ start: "00:00", end: "23:59", label: "Journée", isLive: isTodaySelected });
          } else {
            const start = entry.start || "??:??";
            const end = entry.end || "??:??";
            const isLive = isTodaySelected && start !== "??:??" && end !== "??:??" && currentHMin >= start && currentHMin <= end;
            rec.busyRanges.push({ start, end, label: `${start} - ${end}`, isLive });
          }
        }
      }
    }

    return Array.from(map.entries()).map(([name, data]) => {
      if (data.isAlwaysFree) {
        return {
          name,
          statusText: "Libre",
          isBusy: false,
          isLive: false
        };
      }

      const sortedRanges = data.busyRanges.sort((a, b) => a.start.localeCompare(b.start));
      const uniqueLabels = Array.from(new Set(sortedRanges.map(r => r.label)));
      const isAnyLive = sortedRanges.some(r => r.isLive);

      return {
        name,
        statusText: `Occupé (${uniqueLabels.join(", ")})`,
        isBusy: isTodaySelected ? isAnyLive : true,
        isLive: isAnyLive
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedDay, pedagogicalStaff]);

  // Listes J/M/A
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const currentY = new Date().getFullYear();
  const years = [currentY - 1, currentY, currentY + 1];

  return (
    <div className="presence-container">
      <div className="presence-filter presence-filter-custom">
        <select value={day} onChange={(e) => setDay(e.target.value)}>
          {days.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={month} onChange={(e) => setMonth(e.target.value)}>
          {months.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={year} onChange={(e) => setYear(e.target.value)}>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="presence-grid">
        <div className="presence-card">
          <h2>Promotions présentes</h2>
          {dailyData.promotions.length === 0 ? (
            <p className="presence-empty">Aucune promotion présente</p>
          ) : (
            <ul>{dailyData.promotions.map((p, i) => <li key={i} className="presence-item">{p}</li>)}</ul>
          )}
        </div>

        <div className="presence-card">
          <h2>Professeurs présents</h2>
          {dailyData.professors.length === 0 ? (
            <p className="presence-empty">Aucun professeur présent</p>
          ) : (
            <ul>{dailyData.professors.map((p, i) => <li key={i} className="presence-item">{p}</li>)}</ul>
          )}
        </div>

        <div className="presence-card">
          <h2>Equipe Administrative</h2>
          {pedagogicalStatusList.length === 0 ? (
            <p className="presence-empty">Aucune donnée disponible</p>
          ) : (
            <ul className="presence-list">
              {pedagogicalStatusList.map((p, i) => (
                <li key={i} className={`presence-item-staff ${p.isBusy ? 'is-busy' : 'is-free'} ${p.isLive ? 'is-live' : ''}`}>
                  <div className="staff-info">
                    <span className="staff-name">{p.name}</span>
                    {p.isLive && <span className="live-badge">EN DIRECT</span>}
                  </div>
                  <span className="staff-status">{p.statusText}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
