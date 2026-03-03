import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Navbar.css";
import { isPathAllowed } from "../utils/permissions";

export default function Navbar({ role }) {
  const [openSchedule, setOpenSchedule] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState("dark");
  const navigate = useNavigate();

  const location = useLocation();
  const isSchedule = location.pathname === "/schedule";

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    navigate("/login");
    window.location.reload();
  };

  return (
    <nav className="navbar">
      <div className="logo" onClick={() => navigate("/")} style={{ cursor: 'pointer' }}>Vision360</div>

      <button className="burger" onClick={() => setMenuOpen((m) => !m)}>☰</button>

      <div className={`nav-links ${menuOpen ? "open" : ""}`}>
        {isPathAllowed(role, "/") && (
          <NavLink to="/" end onClick={() => setMenuOpen(false)}>home</NavLink>
        )}

        {isPathAllowed(role, "/schedule") && (
          <div className="nav-dropdown" onMouseLeave={() => setOpenSchedule(false)}>
            <button
              type="button"
              className={`nav-linkButton ${isSchedule ? "active" : ""}`}
              onClick={() => setOpenSchedule((v) => !v)}
            >
              emploi du temps ▾
            </button>

            {openSchedule && (
              <div className="nav-dropdownMenu">
                <NavLink to="/schedule?mode=promo" onClick={() => { setOpenSchedule(false); setMenuOpen(false); }}>élève</NavLink>
                <NavLink to="/schedule?mode=prof" onClick={() => { setOpenSchedule(false); setMenuOpen(false); }}>professeur</NavLink>
              </div>
            )}
          </div>
        )}

        {isPathAllowed(role, "/campus") && (
          <NavLink to="/campus" onClick={() => setMenuOpen(false)}>campus</NavLink>
        )}

        {isPathAllowed(role, "/presence") && (
          <NavLink to="/presence" onClick={() => setMenuOpen(false)}>présence</NavLink>
        )}

        <button
          className="nav-linkButton"
          onClick={() => { toggleTheme(); setMenuOpen(false); }}
          title={theme === "light" ? "Passer en mode nuit" : "Passer en mode jour"}
          style={{ marginLeft: 'auto', gap: '8px' }}
        >
          <span>{theme === "light" ? "🌙" : "☀️"}</span>
          <span>{theme === "light" ? "Nuit" : "Jour"}</span>
        </button>

        <button
          className="nav-linkButton logout-btn"
          onClick={handleLogout}
          style={{ color: '#ff4757', fontWeight: '600' }}
        >
          Déconnexion
        </button>
      </div>
    </nav>
  );
}
