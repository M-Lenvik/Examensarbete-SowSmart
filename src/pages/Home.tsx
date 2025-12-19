import { HomeHowItWorks } from "../components/HomeHowItWorks/HomeHowItWorks";
import { HomeIntro } from "../components/HomeIntro/HomeIntro";
import { HomeTestComponent } from "../components/HomeTestComponent/HomeTestComponent";
import "./Home.scss";

export const Home = () => {
  return (
    <section className="home">
      <HomeIntro />
      <HomeHowItWorks />
      <HomeTestComponent />
    </section>
  );
};

