import { HomeHowItWorks } from "../components/HomeHowItWorks/HomeHowItWorks";
import { HomeIntro } from "../components/HomeIntro/HomeIntro";

export const Home = () => {
  return (
    <section className="home">
      <h1>SåSmart</h1>
      <HomeIntro />
      <HomeHowItWorks />
    </section>
  );
};

