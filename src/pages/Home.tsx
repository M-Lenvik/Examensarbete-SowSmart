/**
 * Home page component.
 * 
 * Data sources:
 * - Static content (no external data)
 * 
 * Results:
 * - Returns: JSX (home page with intro section)
 * 
 * Uses:
 * - components/home/HomeIntro/HomeIntro.tsx (HomeIntro)
 * 
 * Used by:
 * - Router.tsx - for "/" route
 */

import { HomeIntro } from "../components/home/HomeIntro/HomeIntro";

export const Home = () => {
  return (
    <section className="home">
      <HomeIntro />
    </section>
  );
};

