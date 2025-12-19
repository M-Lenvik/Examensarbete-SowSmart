import type React from "react";

import "./Panel.scss";

type PanelProps = {
  title: string;
  children: React.ReactNode;
};

export const Panel = ({ title, children }: PanelProps) => {
  return (
    <section className="panel" aria-label={title}>
      <h2 className="panel__title">{title}</h2>
      <div className="panel__content">{children}</div>
    </section>
  );
};


