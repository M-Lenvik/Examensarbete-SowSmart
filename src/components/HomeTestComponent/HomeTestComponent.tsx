import { useState } from "react";

import { Button } from "../Button/Button";
import { Input } from "../Input/Input";
import { Panel } from "../Panel/Panel";
import "./HomeTestComponent.scss";

export const HomeTestComponent = () => {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");

  return (
    <section className="home-test-component" aria-label="Home test component">
      <Panel title="HomeTestComponent">
        <Input
          id="home-test-name"
          label="Test (text)"
          value={name}
          placeholder="Skriv något..."
          onChange={(event) => setName(event.target.value)}
        />
        <Input
          id="home-test-date"
          label="Test (date)"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
        <Button
          onClick={() => alert(`Name: ${name || "—"}\nDate: ${date || "—"}`)}
        >
          Test button
        </Button>
      </Panel>
    </section>
  );
};


