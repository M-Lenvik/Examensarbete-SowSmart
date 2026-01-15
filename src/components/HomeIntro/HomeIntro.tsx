import { useNavigate } from "react-router-dom";

import { Button } from "../Button/Button";
import { Panel } from "../Panel/Panel";
import greenImage from "../../assets/green.png";
import "./HomeIntro.scss";

export const HomeIntro = () => {
  const navigate = useNavigate();

  return (
    <Panel title="Så fungerar det">
      <div className="home-intro">
        <p>
          Planera din odling på ett enkelt sätt: välj fröer, sätt ett skördedatum
          och få en kalender med viktiga datum för sådd, avhärdning och skörd.
        </p>
        <ol>
          <li>Välj dina fröer i Fröbanken.</li>
          <li>Välj skördedatum i Planeraren.</li>
          <li>Se dina datum i Kalendern.</li>
          <li>Se alla dina val och hela din plan på Min Frösida.</li>
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


