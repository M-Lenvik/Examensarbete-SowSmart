import type React from "react";

import { Input } from "../Input/Input";
import "./PlannerDateInput.scss";

type PlannerDateInputProps = {
  value: string;
  onChange: (value: string) => void;
  error: string | null;
  warning?: string | null;
  required?: boolean;
};

export const PlannerDateInput = ({
  value,
  onChange,
  error,
  warning,
  required = true,
}: PlannerDateInputProps) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  const inputId = "harvest-date-input";
  const errorId = "harvest-date-error";
  const warningId = "harvest-date-warning";
  const describedBy = [error ? errorId : null, warning ? warningId : null]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div className="planner-date-input">
      <Input
        id={inputId}
        label="Välj skördedatum här"
        type="date" //placeholder calendar icon
        value={value}
        required={required}
        onChange={handleChange}
        aria-describedby={describedBy}
      />
      {error && (
        <div id={errorId} className="planner-date-input__error" role="alert">
          {error}
        </div>
      )}
      {warning && (
        <div id={warningId} className="planner-date-input__warning" role="status">
          {warning}
        </div>
      )}
    </div>
  );
};

