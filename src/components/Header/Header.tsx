import { NavLink } from "react-router-dom";
import "./Header.scss";

export const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">SowSmart</h1>
        <nav className="header-nav">
          <NavLink to="/" className="nav-link">
            Hem
          </NavLink>
        </nav>
      </div>
    </header>
  );
};

