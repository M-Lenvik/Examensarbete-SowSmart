import type React from "react";

import { CollapsibleSection } from "../CollapsibleSection/CollapsibleSection";
import "./Panel.scss";

type PanelProps = {
  title?: string;
  children: React.ReactNode;
  variant?: "default" | "nested"; // nested removes border and shadow
  collapsible?: boolean;
  defaultExpanded?: boolean;
};

export const Panel = ({ 
  title, 
  children, 
  variant = "default",
  collapsible = false,
  defaultExpanded = true,
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

  return (
    <section 
      className={`panel ${variant === "nested" ? "panel--nested" : ""}`} 
      aria-label={title || "Panel"}
    >
      {title && <h2 className="panel__title">{title}</h2>}
      <div className="panel__content">{children}</div>
    </section>
  );
};


