import { Panel } from "../components/shared/Panel/Panel";
import tomatoImage from "../assets/tomato.webp";
import chiliImage from "../assets/chili.webp";
import auberginImage from "../assets/aubergin.webp";
import cucumberImage from "../assets/cucumber.webp";
import "./About.scss";

export const About = () => {
  return (
    <section>
      <h1>Om SåSmart</h1>
      <Panel title="Om projektet">
        <p>
          SåSmart är ett examensarbete från Frontend-utbildningen på Medieinstitutet.
          Applikationen är utvecklad för att hjälpa svenska trädgårdsentusiaster att planera sin odling
          så att de kan få optimal skörd innan hösten och vintern. Genom att ta hänsyn till svenska klimatförhållanden 
          och växtspecifika tillväxtcykler ger appen personliga rekommendationer för när frön ska sås.
        </p>
        <p>
          Projektet växte fram ur personliga utmaningar med att planera och underhålla en svensk trädgård.
          Många hobbyodlare stöter på problem som förlorade fröpåsar med viktiga instruktioner, manuella beräkningar
          av sådatum och spridd information över flera källor. SåSmart löser dessa utmaningar genom att samla all
          information på ett ställe och automatiskt beräkna optimala sådatum baserat på önskat skördedatum.
        </p>

      <h2>Data och källor</h2>
        <p>
          All information om växter, såfönster, skördetider och odlingsinstruktioner kommer från{" "}
          <a 
            href="https://www.impecta.se" 
            target="_blank" 
            rel="noreferrer"
            className="about__link"
          >
            Impecta
          </a>
          , en svensk leverantör av ekologiska frön.
        </p>
        <p>
          Data har normaliserats och beräknats för att ge bästa möjliga vägledning för odlingen,
          men det är alltid viktigt att anpassa odlingen efter lokala förhållanden och klimat.
        </p>

        <h2>Hur det fungerar</h2>
        <p>
          SåSmart hjälper dig att planera din odling från början till slut. Processen börjar med att du väljer
          vilka grönsaker du vill odla från vår fröbank. Sedan anger du när du vill skörda.
        </p>
        <p>
          Appen beräknar sedan automatiskt när varje växt ska sås, både för inomhus- och utomhussådd.
          Du får också rekommendationer för när plantorna ska avhärdas och planteras ut, allt anpassat efter
          svenska klimatförhållanden. Alla dina odlingsuppgifter visas i en översiktlig kalender
          och en lista, så du alltid vet vad som ska göras och när.
        </p>
        <p>
          Genom hela säsongen kan du enkelt hålla koll på dina planer och läsa mer om olika odlingsmetoder
          och termer direkt i appen. All information om varje växt, inklusive såfönster, skördetider och
          odlingsinstruktioner, finns samlad på ett ställe så att du inte behöver leta efter förlorade fröpåsar
          eller spridd information.
        </p>
        <p className="about__intro-text">
          Appen riktar sig till hobbyodlare och stadsodlare som vill:
        </p>
        <ul className="about__list">
          <li>
            <img
              src={tomatoImage}
              alt=""
              aria-hidden="true"
              className="about__list-icon"
              width={16}
              height={16}
              loading="lazy"
            />
            Spara tid genom automatiska beräkningar istället för manuell planering
          </li>
          <li>
            <img
              src={chiliImage}
              alt=""
              aria-hidden="true"
              className="about__list-icon"
              width={16}
              height={16}
              loading="lazy"
            />
            Förbättra skörderesultatet med rekommendationer anpassade för svenska klimatförhållanden
          </li>
          <li>
            <img
              src={auberginImage}
              alt=""
              aria-hidden="true"
              className="about__list-icon"
              width={16}
              height={16}
              loading="lazy"
            />
            Ha all odlingsinformation samlad på ett ställe och spara viktiga instruktioner digitalt
          </li>
          <li>
            <img
              src={cucumberImage}
              alt=""
              aria-hidden="true"
              className="about__list-icon"
              width={16}
              height={16}
              loading="lazy"
            />
            Planera sin odling baserat på önskat skördedatum eller före första frosten
          </li>
          <li>
            <img
              src={tomatoImage}
              alt=""
              aria-hidden="true"
              className="about__list-icon"
              width={16}
              height={16}
              loading="lazy"
            />
            Få tydlig vägledning om när olika växter ska sås, planteras ut och skördas
          </li>
        </ul>
      </Panel>
    </section>
  );
};
