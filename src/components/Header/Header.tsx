import { NavLink } from "react-router-dom";
import "./Header.scss";

export const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">
          <NavLink to="/" className="header-title-link">
            SåSmart
          </NavLink>
        </h1>
        <nav className="header-nav">
          <NavLink to="/" className="nav-link">
            Startsida
          </NavLink>
          <NavLink to="/plants" className="nav-link">
            Fröbanken
          </NavLink>
          <NavLink to="/planner" className="nav-link">
            Planera
          </NavLink>
          <NavLink to="/calendar" className="nav-link">
            Kalender
          </NavLink>
          <NavLink to="/my-garden" className="nav-link">
            Min frösida
          </NavLink>
          <NavLink to="/about" className="nav-link">
            Om
          </NavLink>
        </nav>
      </div>
    </header>
  );
};

