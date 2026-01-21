import { useState } from "react";
import "./CollapsibleSection.scss";

type CollapsibleSectionProps = {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  ariaLabel?: string;
};

export const CollapsibleSection = ({
  title,
  children,
  defaultExpanded = false,
  ariaLabel,
}: CollapsibleSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const label = ariaLabel || `${isExpanded ? "Dölj" : "Visa"} innehåll`;

  return (
    <div className="collapsible-section">
      <button
        type="button"
        className="collapsible-section__header-button"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-label={label}
      >
        <span className="collapsible-section__title">{title}</span>
        <span className={`collapsible-section__icon ${isExpanded ? "collapsible-section__icon--expanded" : ""}`}>
          ▼
        </span>
      </button>
      {isExpanded && (
        <div className="collapsible-section__content">
          {children}
        </div>
      )}
    </div>
  );
};

