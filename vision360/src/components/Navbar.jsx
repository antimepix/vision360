// src/components/Navbar.jsx
import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import "../index.css";

export default  function Navbar() {
  const [openSchedule, setOpenSchedule] = useState(false);
  const location = useLocation();
  const isSchedule = location.pathname === "/schedule";

  return (
    <nav className="navbar">
      <div className="logo">Vision360</div>

      <div className="nav-links">
        <NavLink to="/" end>
          home
        </NavLink>

        {/* bouton avec dropdown */}
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
                onClick={() => setOpenSchedule(false)}
              >
                élève
              </NavLink>
              <NavLink
                to="/schedule?mode=prof"
                onClick={() => setOpenSchedule(false)}
              >
                professeur
              </NavLink>
            </div>
          )}
        </div>

        <NavLink to="/campus">campus</NavLink>
        <NavLink to="/presence">présence</NavLink>
      </div>
    </nav>
  );
}
