/**
 * CollapsibleSection component - expandable/collapsible content section.
 * 
 * Data sources:
 * - Props: title, children, defaultExpanded, ariaLabel
 * - Local state: isExpanded (controls visibility)
 * 
 * Results:
 * - Returns: JSX (collapsible section with button and content)
 * 
 * Uses:
 * - (none - pure UI component)
 * 
 * Used by:
 * - components/shared/Panel/Panel.tsx - when panel is collapsible
 * - components/shared/SelectedPlantsList/SelectedPlantsList.tsx - for expandable plant details
 */

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

