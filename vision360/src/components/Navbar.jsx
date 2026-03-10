import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Navbar.css";
import { isPathAllowed } from "../utils/permissions";

export default function Navbar({ role }) {
  const [openSchedule, setOpenSchedule] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState("dark");

  const [refreshing, setRefreshing] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const isSchedule = location.pathname === "/schedule";

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

  // Refresh: déclenche la sync en arrière-plan puis recharge après 35s
  const handleRefreshJson = async () => {
    try {
      setRefreshing(true);

      const API_BASE =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

      // Lance la sync (répond immédiatement en 202)
      const res = await fetch(`${API_BASE}/api/export/data?file=data.json`, {
        method: "GET",
      });

      const payload = await res.json().catch(() => ({}));

      if (!res.ok || payload.ok !== true) {
        throw new Error(payload.message || payload.error || `HTTP ${res.status}`);
      }

      // Attendre ~35s pour que la sync Aurion se finisse, puis recharger
      await new Promise((resolve) => setTimeout(resolve, 35000));
      window.location.reload();
    } catch (e) {
      alert(`Erreur refresh JSON: ${e?.message || e}`);
    } finally {
      setRefreshing(false);
      setMenuOpen(false);
    }
  };

  return (
    <nav className="navbar">
      <div
        className="logo"
        onClick={() => navigate("/")}
        style={{ cursor: "pointer" }}
      >
        Vision360
      </div>

      <button className="burger" onClick={() => setMenuOpen((m) => !m)}>
        ☰
      </button>

      <div className={`nav-links ${menuOpen ? "open" : ""}`}>
        {isPathAllowed(role, "/") && (
          <NavLink to="/" end onClick={() => setMenuOpen(false)}>
            home
          </NavLink>
        )}

        {isPathAllowed(role, "/schedule") && (
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
        )}

        {isPathAllowed(role, "/campus") && (
          <NavLink to="/campus" onClick={() => setMenuOpen(false)}>
            campus
          </NavLink>
        )}

        {isPathAllowed(role, "/presence") && (
          <NavLink to="/presence" onClick={() => setMenuOpen(false)}>
            présence
          </NavLink>
        )}

        {/* Bouton thème (reste le premier à droite grâce au marginLeft:auto) */}
        <button
          className="nav-linkButton"
          onClick={() => {
            toggleTheme();
            setMenuOpen(false);
          }}
          title={theme === "light" ? "Passer en mode nuit" : "Passer en mode jour"}
          style={{ marginLeft: "auto", gap: "8px" }}
        >
          <span>{theme === "light" ? "🌙" : "☀️"}</span>
          <span>{theme === "light" ? "Nuit" : "Jour"}</span>
        </button>

        <button
          className="nav-linkButton"
          onClick={handleRefreshJson}
          disabled={refreshing}
          title={refreshing ? "Synchronisation en cours (~35s)..." : "Synchroniser les données depuis Aurion"}
          style={{ gap: "8px" }}
        >
          <span>{refreshing ? "⏳ Sync..." : "🔄 Refresh"}</span>
        </button>

        <button
          className="nav-linkButton logout-btn"
          onClick={handleLogout}
          style={{ color: "#ff4757", fontWeight: "600" }}
        >
          Déconnexion
        </button>
      </div>
    </nav>
  );
}
