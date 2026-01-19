// src/components/Navbar.jsx
import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import "../index.css";

export default function Navbar() {
  const [openSchedule, setOpenSchedule] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const location = useLocation();
  const isSchedule = location.pathname === "/schedule";

  return (
    <nav className="navbar">
      <div className="logo">Vision360</div>

      {/* Bouton burger */}
      <button
        className="burger"
        onClick={() => setMenuOpen((m) => !m)}
      >
        ☰
      </button>

      <div className={`nav-links ${menuOpen ? "open" : ""}`}>
        <NavLink to="/" end onClick={() => setMenuOpen(false)}>
          home
        </NavLink>

        {/* Dropdown */}
        <div
          className="nav-dropdown"
          onMouseLeave={() => setOpenSchedule(false)}
        >
          <button
            type="button"
            className={`nav-linkButton ${isSchedule ? "active" : ""}`}
            onClick={() => setOpenSchedule((v) => !v)}
          >
            emploi du temps ▾
          </button>

          {openSchedule && (
            <div className="nav-dropdownMenu">
              <NavLink
                to="/schedule?mode=promo"
                onClick={() => {
                  setOpenSchedule(false);
                  setMenuOpen(false);
                }}
              >
                élève
              </NavLink>

              <NavLink
                to="/schedule?mode=prof"
                onClick={() => {
                  setOpenSchedule(false);
                  setMenuOpen(false);
                }}
              >
                professeur
              </NavLink>
            </div>
          )}
        </div>

        <NavLink to="/campus" onClick={() => setMenuOpen(false)}>campus</NavLink>
        <NavLink to="/presence" onClick={() => setMenuOpen(false)}>présence</NavLink>
      </div>
    </nav>
  );
}
