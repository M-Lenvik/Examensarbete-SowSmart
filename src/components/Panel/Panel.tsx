import type React from "react";

import "./Panel.scss";

type PanelProps = {
  title?: string;
  children: React.ReactNode;
  variant?: "default" | "nested"; // nested removes border and shadow
};

export const Panel = ({ title, children, variant = "default" }: PanelProps) => {
  return (
    <section className={`panel ${variant === "nested" ? "panel--nested" : ""}`} aria-label={title || "Panel"}>
      {title && <h2 className="panel__title">{title}</h2>}
      <div className="panel__content">{children}</div>
    </section>
  );
};


