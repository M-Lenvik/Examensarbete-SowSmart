import type React from "react";

import { Input } from "../Input/Input";
import "./PlannerDateInput.scss";

type PlannerDateInputProps = {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  error: string | null;
  warning?: string | null;
  required?: boolean;
};

export const PlannerDateInput = ({
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  warning,
  required = true,
}: PlannerDateInputProps) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  const handleBlur = () => {
    if (onBlur) {
      onBlur();
    }
  };

  const handleFocus = () => {
    if (onFocus) {
      onFocus();
    }
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
        type="date"
        value={value}
        required={required}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        aria-label="Välj skördedatum"
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

