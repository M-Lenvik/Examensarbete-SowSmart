/**
 * HomeIntro component - introduction section on home page explaining how SåSmart works.
 * 
 * Data sources:
 * - Static content and images
 * 
 * Results:
 * - Returns: JSX (intro panel with instructions and navigation button)
 * 
 * Uses:
 * - components/shared/Button/Button.tsx (Button)
 * - components/shared/Panel/Panel.tsx (Panel)
 * - react-router-dom (useNavigate, NavLink)
 * - assets (tomato, chili, aubergin, cucumber, green images)
 * 
 * Used by:
 * - pages/Home.tsx - for displaying home page introduction
 */

import { useNavigate, NavLink } from "react-router-dom";

import { Button } from "../../shared/Button/Button";
import { Panel } from "../../shared/Panel/Panel";
import tomatoImage from "../../../assets/tomato.webp";
import chiliImage from "../../../assets/chili.webp";
import auberginImage from "../../../assets/aubergin.webp";
import cucumberImage from "../../../assets/cucumber.webp";
import greenImage from "../../../assets/green.webp";
import "./HomeIntro.scss";

export const HomeIntro = () => {
  const navigate = useNavigate();

  return (
    <Panel title="Så fungerar SåSmart">
      <div className="home-intro">
        <p>
          SåSmart är till för dig med odlingsintresse som tycker att det kan vara svårt att planera dina odlingar och för dig som vill samla dina sådatum och dina fröpåsars information på ett ställe. <br/>
          SåSmart hjälper dig att ta reda på viktiga datum för ditt odlingsår. 
          Allt du behöver fundera över är när du vill skörda din första gröda.</p>
          
          <h3>Du gör såhär:</h3>
        <ol className="home-intro__list">
          <li>
            <img
              src={tomatoImage}
              alt=""
              aria-hidden="true"
              className="home-intro__list-icon"
              width={24}
              height={24}
              loading="lazy"
            />
            <span className="home-intro__list-text">
              Välj dina fröer i{" "}
              <NavLink to="/plants" className="home-intro__link">Fröbanken</NavLink>.
            </span>
          </li>
          <li>
            <img
              src={chiliImage}
              alt=""
              aria-hidden="true"
              className="home-intro__list-icon"
              width={24}
              height={24}
              loading="lazy"
            />
            <span className="home-intro__list-text">
              Välj skördedatum i{" "}
              <NavLink to="/planner" className="home-intro__link">Planeraren</NavLink>.
            </span>
          </li>
          <li>
            <img
              src={auberginImage}
              alt=""
              aria-hidden="true"
              className="home-intro__list-icon"
              width={24}
              height={24}
              loading="lazy"
            />
            <span className="home-intro__list-text">
              Se dina datum i{" "}
              <NavLink to="/calendar" className="home-intro__link">Kalendern</NavLink>.
            </span>
          </li>
          <li>
            <img
              src={cucumberImage}
              alt=""
              aria-hidden="true"
              className="home-intro__list-icon"
              width={24}
              height={24}
              loading="lazy"
            />
            <span className="home-intro__list-text">
              Se alla dina val och hela din plan på{" "}
              <NavLink to="/my-garden" className="home-intro__link">Min Frösida</NavLink>.
            </span>
          </li>
        </ol>
        <div className="home-intro__actions">
          <img 
            src={greenImage} 
            alt="" 
            className="home-intro__arrow home-intro__arrow--right"
            aria-hidden="true"
          />
          <Button onClick={() => navigate("/plants")}>
            Börja i Fröbanken
          </Button>
          <img 
            src={greenImage} 
            alt="" 
            className="home-intro__arrow home-intro__arrow--left"
            aria-hidden="true"
          />
        </div>
      </div>
    </Panel>
  );
};


