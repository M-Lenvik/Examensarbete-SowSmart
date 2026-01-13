import { useEffect, useState } from "react";
import "./ScrollToBottom.scss";

export const ScrollToBottom = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkScrollPosition = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const distanceFromBottom = documentHeight - (scrollTop + windowHeight);
      const threshold = windowHeight * 0.25; // 25vh from bottom
      
      // Show button if we're more than 25vh from bottom
      setIsVisible(distanceFromBottom > threshold);
    };

    checkScrollPosition();
    window.addEventListener("scroll", checkScrollPosition);
    window.addEventListener("resize", checkScrollPosition);

    // Use MutationObserver to check when DOM changes
    const observer = new MutationObserver(checkScrollPosition);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      window.removeEventListener("scroll", checkScrollPosition);
      window.removeEventListener("resize", checkScrollPosition);
      observer.disconnect();
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

