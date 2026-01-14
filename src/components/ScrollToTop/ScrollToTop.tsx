import { useEffect, useState } from "react";
import "./ScrollToTop.scss";

export const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const scrollThreshold = windowHeight * 1.25; // Show after scrolling 75vh
      const topHideThreshold = windowHeight * 0.095; // Hide when 9.5vh from top
      
      // Show button if we've scrolled more than threshold from top
      // Hide button only when near top (9.5vh)
      setIsVisible(scrollTop > topHideThreshold && scrollTop >= scrollThreshold);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      type="button"
      className="scroll-to-top"
      onClick={scrollToTop}
      aria-label="Scrolla till toppen"
    >
    </button>
  );
};

