/**
 * ScrollToBottom component - button that appears when user scrolls, allows scrolling to bottom.
 * 
 * Data sources:
 * - window.scrollY: Current scroll position
 * - document.documentElement.scrollHeight: Total document height
 * - window.innerHeight: Window height for threshold calculation
 * 
 * Results:
 * - Returns: JSX (scroll to bottom button, or null if not visible)
 * 
 * Uses:
 * - (none - pure UI component using browser APIs)
 * 
 * Used by:
 * - components/shared/Layout/Layout.tsx - as global scroll helper
 */

import { useEffect, useState } from "react";
import "./ScrollToBottom.scss";

export const ScrollToBottom = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollThreshold = windowHeight * 0.75; // 150vh from top
      const distanceFromBottom = documentHeight - (scrollTop + windowHeight);
      const hideThreshold = windowHeight * 0.75; // 75vh from bottom
      
      // Show button if we've scrolled more than 150vh from top
      // Hide button when we're less than 75vh from bottom
      setIsVisible(scrollTop >= scrollThreshold && distanceFromBottom > hideThreshold);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      type="button"
      className="scroll-to-bottom"
      onClick={scrollToBottom}
      aria-label="Scrolla till botten"
    >
    </button>
  );
};

