import { useEffect, useState } from "react";
import "./presence.css";

export default function Presence() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");

  const [day, setDay] = useState(dd);
  const [month, setMonth] = useState(mm);
  const [year, setYear] = useState(yyyy);

  const [selectedDay, setSelectedDay] = useState(`${yyyy}-${mm}-${dd}`);

  const [promotions, setPromotions] = useState([]);
  const [professors, setProfessors] = useState([]);

  // Reconstruit une date ISO dès qu’un select change
useEffect(() => {
  const dateObj = new Date(`${year}-${month}-${day}T00:00:00`);

  // On reconstruit une date ISO propre même si la date était invalide
  const iso = dateObj.toISOString().split("T")[0];

  setSelectedDay(iso);
}, [day, month, year]);


  useEffect(() => {
    fetch("/data.json")
      .then((res) => res.json())
      .then((data) => {
        const events = data.events || [];

        const promosSet = new Set();
        const profsSet = new Set();

        for (const e of events) {
          if (e.date === selectedDay) {
            if (e.promotion) promosSet.add(e.promotion);
            if (e.professor)  profsSet.add(e.professor);
          }
        }

        setPromotions([...promosSet]);
        setProfessors([...profsSet]);
      });
  }, [selectedDay]);

  // Générer les listes J/M/A
  const days = Array.from({ length: 31 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );
  const months = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );
  const years = [yyyy - 1, yyyy, yyyy + 1];

  return (
    <div className="presence-container">

      {/* FILTRE CUSTOM */}
      <div className="presence-filter presence-filter-custom">
        <select value={day} onChange={(e) => setDay(e.target.value)}>
          {days.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <select value={month} onChange={(e) => setMonth(e.target.value)}>
          {months.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <select value={year} onChange={(e) => setYear(e.target.value)}>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* 3 COLONNES */}
      <div className="presence-grid">
        <div className="presence-card">
          <h2>Promotions présentes</h2>
          {promotions.length === 0 ? (
            <p className="presence-empty">Aucune promotion présente</p>
          ) : (
            <ul>{promotions.map((p, i) => <li key={i}>{p}</li>)}</ul>
          )}
        </div>

        <div className="presence-card">
          <h2>Professeurs présents</h2>
          {professors.length === 0 ? (
            <p className="presence-empty">Aucun professeur présent</p>
          ) : (
            <ul>{professors.map((p, i) => <li key={i}>{p}</li>)}</ul>
          )}
        </div>

        <div className="presence-card">
          <h2>Personnel pédagogique</h2>
          <p className="presence-empty">Aucune donnée disponible</p>
        </div>
      </div>
    </div>
  );
}
