import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <header className="navbar">
      <div className="logo">Vision360</div>

      <nav className="nav-links">
        <NavLink to="/" end>
          home
        </NavLink>
        <NavLink to="/schedule">
          emploi du temps
        </NavLink>
        <NavLink to="/campus">
          campus
        </NavLink>
        <NavLink to="/enseignant">
          enseignant
        </NavLink>
      </nav>
    </header>
  );
}

export default Navbar;
