import { Panel } from "../Panel/Panel";
import "./HomeHowItWorks.scss";

export const HomeHowItWorks = () => {
  return (
    <Panel title="Så fungerar det">
      <ol className="home-how-it-works__steps">
        <li>Välj dina fröer i Fröbanken.</li>
        <li>Välj skördedatum i Planeraren.</li>
        <li>Se allt i kalendern.</li>
      </ol>
    </Panel>
  );
};


