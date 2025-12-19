import { useNavigate } from "react-router-dom";

import { Button } from "../Button/Button";
import "./HomeIntro.scss";

export const HomeIntro = () => {
  const navigate = useNavigate();

  return (
    <section className="home-intro" aria-label="Intro">
      <h1>SåSmart</h1>
      <p>
        Planera din odling på ett enkelt sätt: välj fröer, sätt ett skördedatum
        och få en kalender med viktiga datum för sådd, avhärdning och skörd.
      </p>

      <div className="home-intro__actions">
        <Button onClick={() => navigate("/plants")}>Börja i Fröbanken</Button>
      </div>
    </section>
  );
};


