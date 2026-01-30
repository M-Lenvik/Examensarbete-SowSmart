/**
 * Panel component - container with optional title and collapsible functionality.
 * 
 * Data sources:
 * - Props: title, children, variant, collapsible, defaultExpanded, titleHeadingLevel
 * 
 * Results:
 * - Returns: JSX (panel section with title and content)
 * 
 * Uses:
 * - components/shared/CollapsibleSection/CollapsibleSection.tsx (CollapsibleSection) - when collapsible is true
 * 
 * Used by:
 * - All pages and components that need panel containers
 */

import type { ReactNode } from "react";
import { CollapsibleSection } from "../CollapsibleSection/CollapsibleSection";
import "./Panel.scss";

type PanelProps = {
  title?: string;
  children: ReactNode;
  variant?: "default" | "nested"; // nested removes border and shadow
  collapsible?: boolean;
  defaultExpanded?: boolean;
  titleHeadingLevel?: "h2" | "h3"; // Heading level for title (default: h2)
};

export const Panel = ({ 
  title, 
  children, 
  variant = "default",
  collapsible = false,
  defaultExpanded = true,
  titleHeadingLevel = "h2",
}: PanelProps) => {
  if (collapsible && title) {
    return (
      <section 
        className={`panel ${variant === "nested" ? "panel--nested" : ""} panel--collapsible`} 
        aria-label={title || "Panel"}
      >
        <CollapsibleSection
          title={title}
          defaultExpanded={defaultExpanded}
          ariaLabel={`${defaultExpanded ? "Dölj" : "Visa"} ${title}`}
        >
          {children}
        </CollapsibleSection>
      </section>
    );
  }

  const TitleTag = titleHeadingLevel === "h3" ? "h3" : "h2";

  return (
    <section 
      className={`panel ${variant === "nested" ? "panel--nested" : ""}`} 
      aria-label={title || "Panel"}
    >
      {title && <TitleTag className="panel__title">{title}</TitleTag>}
      <div className="panel__content">{children}</div>
    </section>
  );
};


