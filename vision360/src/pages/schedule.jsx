import { useMemo, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { X, Clock, MapPin, User, Users, GraduationCap } from "lucide-react";
import events from "../data/data.json";
import "./schedule.css";

const DAY_START_MIN = 7.5 * 60; // 07h30 au lieu de 08h00 pour avoir de l'air en haut
const DAY_END_MIN = 19 * 60;
const DAY_SPAN_MIN = DAY_END_MIN - DAY_START_MIN;

const WEEKDAY_LABELS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];

const COLORS = [
  "#dcd3ff", // Lavender
  "#c4b5fd", // Soft Purple
  "#a0c4ff", // Muted Blue
  "#b2f2bb", // Mint Green
  "#fff3bf", // Pale Yellow
  "#ffd8a8", // Soft Orange
  "#ffc9c9", // Soft Rose
  "#95e1d3", // Aqua
];

/* -------- helpers -------- */

function pad2(n) {
  return String(n).padStart(2, "0");
}

function todayYMD() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function shiftYMD(ymd, deltaDays) {
  const d = new Date(`${ymd}T12:00:00`);
  d.setDate(d.getDate() + deltaDays);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function startOfWeekMonday(ymd) {
  const d = new Date(`${ymd}T12:00:00`);
  const day = d.getDay(); // 0=dimanche, 1=lundi...
  const diff = (day + 6) % 7; // nb de jours depuis lundi
  d.setDate(d.getDate() - diff);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function ymdRangeLabel(mondayYmd) {
  const mon = mondayYmd;
  const fri = shiftYMD(mondayYmd, 4);
  const [y1, m1, d1] = mon.split("-");
  const [y2, m2, d2] = fri.split("-");
  return `Semaine du ${d1}/${m1}/${y1} au ${d2}/${m2}/${y2}`;
}

function ymdToDMY(ymd) {
  if (!ymd || typeof ymd !== "string" || ymd.length !== 10) return "";
  const [y, m, d] = ymd.split("-");
  return `${d}/${m}/${y}`;
}

function minutesOf(iso) {
  if (!iso || typeof iso !== "string" || iso.length < 16) return null;
  const hh = Number(iso.slice(11, 13));
  const mm = Number(iso.slice(14, 16));
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
  return hh * 60 + mm;
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function promoShort(code = "", label = "") {
  const fromCode = String(code).split("_").pop();
  if (fromCode && fromCode.length <= 8) return fromCode;
  const m = String(label).match(/\b([A-Z]{2,4}\d)\b/);
  return m?.[1] ?? "?";
}

function roomShort(x = "") {
  const raw = String(x).trim();
  if (!raw) return "";
  const parts = raw.split(/[_\s-]+/).filter(Boolean);
  const strict = parts.find((p) => /^[A-Z]{1,4}\d{2,4}$/i.test(p));
  if (strict) return strict.toUpperCase();
  const m = raw.match(/\b([A-Z]{1,4}\d{2,4})\b/i);
  if (m?.[1]) return m[1].toUpperCase();
  return (parts[0] ?? raw).toUpperCase();
}

function personName(p) {
  const first = p?.firstName ? String(p.firstName).trim() : "";
  const last = p?.lastName ? String(p.lastName).trim() : "";
  return `${first} ${last}`.trim() || "(inconnu)";
}

function diffDays(ymd1, ymd2) {
  const d1 = new Date(`${ymd1}T00:00:00`);
  const d2 = new Date(`${ymd2}T00:00:00`);
  return Math.round((d1 - d2) / 86400000);
}

function formatTimeRange(start, end) {
  const s = start?.slice(11, 16) ?? "";
  const e = end?.slice(11, 16) ?? "";
  return `${s} – ${e}`;
}

function uniqueSorted(arr) {
  return Array.from(new Set(arr))
    .filter(Boolean)
    .sort((a, b) =>
      String(a).localeCompare(String(b), "fr", {
        sensitivity: "base",
        numeric: true,
      })
    );
}

// assombrir une couleur hex pour le dégradé
function darkenColor(hex, factor = 0.35) {
  if (!hex || typeof hex !== "string") return "#4b5563";
  let c = hex.trim();
  if (c.startsWith("#")) c = c.slice(1);
  if (c.length === 3) {
    c = c
      .split("")
      .map((ch) => ch + ch)
      .join("");
  }
  const num = parseInt(c, 16);
  if (Number.isNaN(num)) return "#4b5563";

  let r = (num >> 16) & 255;
  let g = (num >> 8) & 255;
  let b = num & 255;

  const k = 1 - factor;
  r = Math.round(r * k);
  g = Math.round(g * k);
  b = Math.round(b * k);

  return `rgb(${r}, ${g}, ${b})`;
}

// Calcule un layout "colonnes" pour les événements qui se chevauchent,
// afin de les afficher côte à côte plutôt que superposés.
function layoutOverlaps(dayEvents) {
  if (!Array.isArray(dayEvents) || dayEvents.length <= 1) {
    return (dayEvents ?? []).map((e) => ({ ...e, _col: 0, _cols: 1 }));
  }

  const sorted = dayEvents
    .map((e) => {
      const start = clamp(
        e._startMin ?? DAY_START_MIN,
        DAY_START_MIN,
        DAY_END_MIN
      );
      const endRaw = clamp(
        e._endMin ?? DAY_END_MIN,
        DAY_START_MIN,
        DAY_END_MIN
      );
      const end = Math.max(endRaw, start + 1);

      return {
        e,
        start,
        end,
        key:
          e?._renderKey ??
          `${e?.id ?? "noid"}-${e?.start ?? ""}-${e?.end ?? ""}`,
      };
    })
    .sort((a, b) => a.start - b.start || b.end - a.end);

  const layoutByKey = new Map();
  let active = []; // { end, col }
  let group = []; // { key, col }
  let groupMaxCol = 0;

  const flushGroup = () => {
    if (!group.length) return;
    const cols = groupMaxCol + 1;
    for (const g of group) {
      layoutByKey.set(g.key, { col: g.col, cols });
    }
    group = [];
    groupMaxCol = 0;
  };

  for (const item of sorted) {
    // Retire ceux qui ne chevauchent plus
    active = active.filter((a) => a.end > item.start);

    // Si plus rien n'est actif, on termine le groupe précédent
    if (active.length === 0) flushGroup();

    const used = new Set(active.map((a) => a.col));
    let col = 0;
    while (used.has(col)) col += 1;

    active.push({ end: item.end, col });
    group.push({ key: item.key, col });
    groupMaxCol = Math.max(groupMaxCol, col);
  }
  flushGroup();

  return dayEvents.map((e) => {
    const key =
      e?._renderKey ?? `${e?.id ?? "noid"}-${e?.start ?? ""}-${e?.end ?? ""}`;
    const l = layoutByKey.get(key) ?? { col: 0, cols: 1 };
    return { ...e, _col: l.col, _cols: l.cols };
  });
}

/* -------- exports pour les tests -------- */
export {
  pad2,
  todayYMD,
  shiftYMD,
  startOfWeekMonday,
  ymdRangeLabel,
  ymdToDMY,
  minutesOf,
  clamp,
  promoShort,
  roomShort,
  personName,
  diffDays,
  formatTimeRange,
  uniqueSorted,
  darkenColor,
  layoutOverlaps,
};

/* -------- page emploi du temps -------- */

export default function Schedule() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const urlMode = searchParams.get("mode");

  // état local pour la vue (promo/prof)
  const [viewMode, setViewMode] = useState(
    urlMode === "prof" ? "prof" : "promo"
  );

  // si le mode dans l’URL change (via la navbar), on synchronise
  useEffect(() => {
    setViewMode(urlMode === "prof" ? "prof" : "promo");
  }, [urlMode]);

  const [anchorDate, setAnchorDate] = useState(startOfWeekMonday(todayYMD()));
  const [selectedPromos, setSelectedPromos] = useState([]);
  const [selectedProfs, setSelectedProfs] = useState([]);
  const ALL_DAYS = [0, 1, 2, 3, 4];
  const [selectedDays, setSelectedDays] = useState(ALL_DAYS); // multi-sélection
  const [searchQuery, setSearchQuery] = useState(""); // Re-ajouté
  const [selectedEvent, setSelectedEvent] = useState(null); // État pour la popup

  // Dé-doublonnage à la source (le JSON peut contenir des événements strictement identiques).
  // C'est crucial pour éviter des keys React dupliquées et des "fantômes" qui restent affichés
  // ou dont l'ombre s'empile au fil des changements de filtre.
  const uniqueEvents = useMemo(() => {
    const seen = new Set();
    const out = [];
    for (const e of events ?? []) {
      const groupCodes = (e?.groups ?? [])
        .map((g) => String(g?.code ?? g?.label ?? "").trim())
        .filter(Boolean)
        .sort()
        .join("|");
      const lecturerNames = (e?.lecturers ?? [])
        .map(personName)
        .filter(Boolean)
        .sort()
        .join("|");
      const key = [
        String(e?.id ?? ""),
        String(e?.start ?? ""),
        String(e?.end ?? ""),
        String(e?.title ?? ""),
        groupCodes,
        lecturerNames,
      ].join("::");

      if (seen.has(key)) continue;
      seen.add(key);
      out.push(e);
    }
    return out;
  }, []);

  const weekStart = useMemo(() => startOfWeekMonday(anchorDate), [anchorDate]);

  const allPromos = useMemo(() => {
    const list = [];
    for (const e of uniqueEvents) {
      for (const g of e?.groups ?? []) {
        list.push(promoShort(g?.code, g?.label));
      }
    }
    return uniqueSorted(list).filter((p) => p !== "?");
  }, [uniqueEvents]);

  const allProfs = useMemo(() => {
    const list = [];
    for (const e of uniqueEvents) {
      for (const l of e?.lecturers ?? []) {
        list.push(personName(l));
      }
    }
    return uniqueSorted(list);
  }, [uniqueEvents]);

  const promoColors = useMemo(() => {
    const map = new Map();
    allPromos.forEach((p, i) => {
      map.set(p, COLORS[i % COLORS.length]);
    });
    return map;
  }, [allPromos]);

  const profColors = useMemo(() => {
    const map = new Map();
    allProfs.forEach((p, i) => {
      map.set(p, COLORS[i % COLORS.length]);
    });
    return map;
  }, [allProfs]);

  // évènements filtrés sur la semaine + filtres (promo/prof)
  const filteredEvents = useMemo(() => {
    const monday = weekStart;
    const activePromos = selectedPromos.length ? selectedPromos : allPromos;
    const activeProfs = selectedProfs.length ? selectedProfs : allProfs;

    return uniqueEvents
      .map((e) => {
        const dateStr = String(e.start ?? "").slice(0, 10);
        const offset = diffDays(dateStr, monday); // 0 = lundi

        const promos = (e?.groups ?? []).map((g) =>
          promoShort(g?.code, g?.label)
        );
        const profs = (e?.lecturers ?? []).map(personName);
        const room = roomShort(
          e?.resources?.[0]?.label ?? e?.resources?.[0]?.code ?? ""
        );

        // Key stable + réellement unique (même si `id` est dupliqué dans le JSON)
        const renderKey = [
          String(e?.id ?? "noid"),
          String(e?.start ?? ""),
          String(e?.end ?? ""),
          promos.join("|"),
          profs.join("|"),
          room,
        ].join("::");

        return {
          ...e,
          _date: dateStr,
          _dayIndex: offset,
          _promos: promos,
          _profs: profs,
          _room: room,
          _courseName: e.courses?.[0]?.course || e.title?.split("\n")[0] || "Cours ?",
          _courseType: e.className || e.title?.split("\n")[1] || "",
          _startMin: minutesOf(e.start),
          _endMin: minutesOf(e.end),
          _renderKey: renderKey,
        };
      })
      .filter((e) => e._dayIndex >= 0 && e._dayIndex < 5) // dans la semaine lun-ven
      .filter((e) => {
        // Filtrage par texte (recherche) - Re-ajouté
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const titleMatch = (e.title || "").toLowerCase().includes(q);
          const courseMatch = (e._courseName || "").toLowerCase().includes(q);
          const promoMatch = e._promos.some((p) => p.toLowerCase().includes(q));
          const profMatch = e._profs.some((p) => p.toLowerCase().includes(q));
          const roomMatch = (e._room || "").toLowerCase().includes(q);
          if (!titleMatch && !courseMatch && !promoMatch && !profMatch && !roomMatch) return false;
        }

        if (viewMode === "promo") {
          if (!e._promos.length) return false;
          return e._promos.some((p) => activePromos.includes(p));
        }
        if (viewMode === "prof") {
          if (!e._profs.length) return false;
          return e._profs.some((p) => activeProfs.includes(p));
        }
        return true;
      });
  }, [
    weekStart,
    viewMode,
    selectedPromos,
    selectedProfs,
    allPromos,
    allProfs,
    uniqueEvents,
    searchQuery,
  ]);

  // groupé par jour
  const eventsByDay = useMemo(() => {
    const days = Array.from({ length: 5 }, () => []);
    for (const e of filteredEvents) {
      if (e._dayIndex >= 0 && e._dayIndex < 5) {
        days[e._dayIndex].push(e);
      }
    }
    days.forEach((list) =>
      list.sort((a, b) => (a._startMin ?? 0) - (b._startMin ?? 0))
    );
    return days;
  }, [filteredEvents]);

  // Répartit les événements se chevauchant en colonnes (côte à côte)
  const layoutByDay = useMemo(
    () => eventsByDay.map((day) => layoutOverlaps(day)),
    [eventsByDay]
  );

  const warningText = useMemo(() => {
    const total = filteredEvents.length;
    const maxPerDay = eventsByDay.reduce((m, d) => Math.max(m, d.length), 0);
    if (!total) return null;
    if (maxPerDay > 12 || total > 45) {
      return "Emploi du temps très chargé : pensez à filtrer par journée ou à réduire le nombre de promos/profs sélectionnés.";
    }
    return null;
  }, [filteredEvents, eventsByDay]);

  const weekDays = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => {
        const ymd = shiftYMD(weekStart, i);
        return { ymd, label: WEEKDAY_LABELS[i] };
      }),
    [weekStart]
  );

  const colorMap = viewMode === "promo" ? promoColors : profColors;

  const handleMultiSelectChange = (event, setter) => {
    const values = Array.from(event.target.selectedOptions).map((o) => o.value);
    setter(values);
  };

  const handlePrevWeek = () => {
    setAnchorDate((d) => shiftYMD(startOfWeekMonday(d), -7));
  };

  const handleNextWeek = () => {
    setAnchorDate((d) => shiftYMD(startOfWeekMonday(d), 7));
  };

  const toggleDay = (dayIndex) => {
    setSelectedDays((prev) => {
      const has = prev.includes(dayIndex);
      if (has) return prev.filter((d) => d !== dayIndex);
      return [...prev, dayIndex].sort((a, b) => a - b);
    });
  };

  const selectAllDays = () => {
    setSelectedDays(ALL_DAYS);
  };


  const isSingleDay = selectedDays.length === 1;
  const isAllDaysSelected = selectedDays.length === 5;

  const handlePrint = () => {
    window.print();
  };


  return (
    <section className="schedule-page">
      {/* Filtres */}
      <div className="schedule-filtersCard">
        <div className="schedule-filtersTop">
          <div className="schedule-modeToggle">
            <span className="filters-label">Vue</span>
            <button
              type="button"
              className={viewMode === "promo" ? "chip chip-active" : "chip"}
              onClick={() => setViewMode("promo")}
            >
              Par promotion
            </button>
            <button
              type="button"
              className={viewMode === "prof" ? "chip chip-active" : "chip"}
              onClick={() => setViewMode("prof")}
            >
              Par professeur
            </button>

            {/* Nouveau champ recherche - Intégré à droite des boutons de vue */}
            <input
              type="text"
              className="input schedule-searchInput"
              placeholder="Rechercher (promo, prof, cours...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="schedule-weekControls">
            <span className="filters-label">Semaine</span>
            <button className="button" type="button" onClick={handlePrevWeek}>
              ◀
            </button>
            <button className="button" type="button" onClick={handleNextWeek}>
              ▶
            </button>

            <button
              className="button schedule-printButton"
              type="button"
              onClick={handlePrint}
              title="Imprimer l'emploi du temps"
            >
              🖨️ Imprimer
            </button>

            {/* date de semaine (lundi) en jj/mm/aaaa + input natif caché */}
            <div className="dateField">
              <input
                className="input input-dateText schedule-weekDateInput"
                type="text"
                value={ymdToDMY(weekStart)}
                readOnly
              />
              <input
                className="input input-dateNative"
                type="date"
                value={weekStart}
                onChange={(e) => {
                  const value = e.target.value || todayYMD();
                  setAnchorDate(startOfWeekMonday(value));
                }}
                aria-label="Sélectionner une semaine"
              />
            </div>

            <span className="week-label">{ymdRangeLabel(weekStart)}</span>
          </div>
        </div>

        <div className="schedule-filtersBottom">
          <div className="schedule-mainFilter">
            <span className="filters-label">
              {viewMode === "promo"
                ? "Promotions (Ctrl+clic pour plusieurs)"
                : "Profs (Ctrl+clic pour plusieurs)"}
            </span>
            {viewMode === "promo" ? (
              <select
                multiple
                className="input multiSelect"
                value={selectedPromos}
                onChange={(e) => handleMultiSelectChange(e, setSelectedPromos)}
              >
                {allPromos.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            ) : (
              <select
                multiple
                className="input multiSelect"
                value={selectedProfs}
                onChange={(e) => handleMultiSelectChange(e, setSelectedProfs)}
              >
                {allProfs.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            )}
            <div className="smallNote">
              Aucun choix = tout est affiché (emploi du temps global).
            </div>
          </div>

          <div className="schedule-dayFilter">
            <span className="filters-label">Filtre journée</span>
            <div className="dayChips">
              <button
                type="button"
                className={isAllDaysSelected ? "chip chip-active" : "chip"}
                onClick={selectAllDays}
              >
                Toute la semaine
              </button>

              {weekDays.map((d, idx) => {
                const active = selectedDays.includes(idx);
                return (
                  <button
                    key={d.ymd}
                    type="button"
                    className={active ? "chip chip-active" : "chip"}
                    onClick={() => toggleDay(idx)}
                  >
                    {WEEKDAY_LABELS[idx].slice(0, 3).toLowerCase()}
                  </button>
                );
              })}
            </div>

          </div>
        </div>

        {warningText && <div className="schedule-warning">⚠️ {warningText}</div>}
      </div>

      {/* Modal de détails du cours */}
      {selectedEvent && (
        <div className="schedule-modalOverlay" onClick={() => setSelectedEvent(null)}>
          <div className="schedule-modal" onClick={(e) => e.stopPropagation()}>
            <button className="schedule-modalClose" onClick={() => setSelectedEvent(null)}>
              <X size={24} />
            </button>
            <div className="schedule-modalHeader">
              <div className="schedule-modalTag">{selectedEvent._courseType}</div>
              <h2>{selectedEvent._courseName}</h2>
            </div>
            <div className="schedule-modalBody">
              <div className="schedule-modalInfo">
                <div className="info-item">
                  <Clock size={18} />
                  <span>{formatTimeRange(selectedEvent.start, selectedEvent.end)}</span>
                </div>
                <div className="info-item">
                  <MapPin size={18} />
                  <span>{selectedEvent._room || "Salle non spécifiée"}</span>
                </div>
                {selectedEvent._profs && selectedEvent._profs.length > 0 && (
                  <div className="info-item">
                    <User size={18} />
                    <span>{selectedEvent._profs.join(", ")}</span>
                  </div>
                )}
                {selectedEvent._promos && selectedEvent._promos.length > 0 && (
                  <div className="info-item">
                    <GraduationCap size={18} />
                    <span>{selectedEvent._promos.join(", ")}</span>
                  </div>
                )}
              </div>

              {selectedEvent.students && selectedEvent.students.length > 0 && (
                <div className="schedule-modalStudents">
                  <h3>
                    <Users size={18} />
                    Étudiants ({selectedEvent.students.length})
                  </h3>
                  <div className="students-list">
                    {selectedEvent.students.map((student, idx) => (
                      <div key={idx} className="student-badge">
                        {student.firstName} {student.lastName}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tableau emploi du temps */}
      {/* Tableau emploi du temps */}
      {selectedDays.length === 0 ? (
        <div className="schedule-noDay smallNote">
          Sélectionne au moins un jour (ou clique sur “Toute la semaine”).
        </div>
      ) : (
        <div
          className={`schedule-grid ${isSingleDay ? "schedule-grid--single" : ""}`}
          style={{ "--schedule-cols": String(selectedDays.length) }}
        >
          {weekDays.map((day, index) => {
            if (!selectedDays.includes(index)) return null;

            const eventsForDay = layoutByDay[index] ?? [];

            return (
              <div key={day.ymd} className="schedule-dayColumn">
                <div className="schedule-dayHeader">
                  <div className="schedule-dayName">{day.label}</div>
                  <div className="schedule-dayDate">
                    {day.ymd.split("-").reverse().join("/")}
                  </div>
                </div>

                <div className="schedule-dayBody">
                  <div className="schedule-timeRail">
                    <span>07h30</span>
                    <span>12h</span>
                    <span>16h</span>
                    <span>19h</span>
                  </div>

                  {eventsForDay.map((ev, idxEv) => {
                    const start = clamp(
                      ev._startMin ?? DAY_START_MIN,
                      DAY_START_MIN,
                      DAY_END_MIN
                    );
                    const end = clamp(
                      ev._endMin ?? DAY_END_MIN,
                      DAY_START_MIN,
                      DAY_END_MIN
                    );

                    const topPct = ((start - DAY_START_MIN) / DAY_SPAN_MIN) * 100;
                    const heightPct = Math.max(
                      8,
                      ((end - start) / DAY_SPAN_MIN) * 100
                    );

                    const labelKey =
                      viewMode === "promo" ? ev._promos[0] ?? "?" : ev._profs[0] ?? "?";
                    const baseColor = colorMap.get(labelKey) ?? "#4b5563";
                    const darkerColor = darkenColor(baseColor, 0.4);

                    const cols = Math.max(1, ev._cols ?? 1);
                    const col = clamp(ev._col ?? 0, 0, cols - 1);
                    const widthPct = 100 / cols;
                    const leftPct = col * widthPct;

                    return (
                      <div
                        key={
                          ev._renderKey ??
                          `${ev.id ?? "noid"}-${ev.start ?? ""}-${ev.end ?? ""}-${idxEv}-${index}`
                        }
                        className="schedule-event"
                        onClick={() => setSelectedEvent(ev)}
                        style={{
                          top: `${topPct}%`,
                          height: `${heightPct}%`,
                          left: `calc(${leftPct}% + 6px)`,
                          width: `calc(${widthPct}% - 12px)`,
                          backgroundImage: `linear-gradient(135deg, ${baseColor}, ${darkerColor})`,
                        }}
                      >
                        <div className="event-time">
                          {formatTimeRange(ev.start, ev.end)}
                        </div>
                        <div className="event-title">
                          <strong>{ev._courseName}</strong>
                          {ev._courseType && <span className="event-type"> ({ev._courseType})</span>}
                        </div>
                        <div className="event-main">
                          {viewMode === "promo"
                            ? ev._promos.join(", ") || "Promotion ?"
                            : ev._profs.join(", ") || "Prof ?"}
                        </div>
                        <div className="event-meta">{ev._room || "Salle ?"}</div>
                      </div>
                    );
                  })}

                  {!eventsForDay.length && (
                    <div className="schedule-emptyDay smallNote">
                      Aucun cours ce jour dans la sélection.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )

      }</section>)
}
