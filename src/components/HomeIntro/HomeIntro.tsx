import { useNavigate } from "react-router-dom";

import { Button } from "../Button/Button";
import { Panel } from "../Panel/Panel";
import "./HomeIntro.scss";

export const HomeIntro = () => {
  const navigate = useNavigate();

  return (
    <Panel>
      <article>
        <p>
          Planera din odling på ett enkelt sätt: välj fröer, sätt ett skördedatum
          och få en kalender med viktiga datum för sådd, avhärdning och skörd.
        </p>

        <Button className="home-intro__actions" onClick={() => navigate("/plants")}>
          Börja i Fröbanken
        </Button>
      </article>
    </Panel>
  );
};


