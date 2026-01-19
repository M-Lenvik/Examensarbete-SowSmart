import { useNavigate, NavLink } from "react-router-dom";

import { Button } from "../Button/Button";
import { Panel } from "../Panel/Panel";
import greenImage from "../../assets/green.png";
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
        <ol>
          <li>Välj dina fröer i <NavLink to="/plants" className="home-intro__link">Fröbanken</NavLink>.</li>
          <li>Välj skördedatum i <NavLink to="/planner" className="home-intro__link">Planeraren</NavLink>.</li>
          <li>Se dina datum i <NavLink to="/calendar" className="home-intro__link">Kalendern</NavLink>.</li>
          <li>Se alla dina val och hela din plan på <NavLink to="/my-garden" className="home-intro__link">Min Frösida</NavLink>.</li>
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


