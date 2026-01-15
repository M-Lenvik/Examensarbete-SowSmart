import { NavLink } from "react-router-dom";
import { useState } from "react";
import sowsmartImage from "../../assets/sowsmart.png";
import "./Header.scss";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">
          <img 
            src={sowsmartImage} 
            alt="" 
            className="header-title-image"
            aria-hidden="true"
          />
          <NavLink to="/" className="header-title-link">
            SåSmart
          </NavLink>
        </h1>

        <button
          type="button"
          className="header-menu-button"
          aria-label={isMenuOpen ? "Stäng meny" : "Öppna meny"}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          Meny
        </button>

        <nav className={`header-nav ${isMenuOpen ? "header-nav--open" : ""}`}>
          <NavLink to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            Startsida
          </NavLink>
          <NavLink
            to="/plants"
            className="nav-link"
            onClick={() => setIsMenuOpen(false)}
          >
            Fröbanken
          </NavLink>
          <NavLink
            to="/planner"
            className="nav-link"
            onClick={() => setIsMenuOpen(false)}
          >
            Planeraren
          </NavLink>
          <NavLink
            to="/calendar"
            className="nav-link"
            onClick={() => setIsMenuOpen(false)}
          >
            Kalendern
          </NavLink>
          <NavLink
            to="/my-garden"
            className="nav-link"
            onClick={() => setIsMenuOpen(false)}
          >
            Min Frösida
          </NavLink>
          <NavLink
            to="/about"
            className="nav-link"
            onClick={() => setIsMenuOpen(false)}
          >
            Om SåSmart
          </NavLink>
        </nav>
      </div>
    </header>
  );
};

