/**
 * Input component - reusable input field with label.
 * 
 * Data sources:
 * - Props: id, label, type, value, name, placeholder, required, disabled, onChange, onBlur, onFocus, aria-label
 * 
 * Results:
 * - Returns: JSX (input field with optional label)
 * 
 * Uses:
 * - (none - pure UI component)
 * 
 * Used by:
 * - components/shared/SelectedPlantsList/SelectedPlantsList.tsx - for individual plant harvest dates
 * - components/planner/PlannerDateInput/PlannerDateInput.tsx - for harvest date input
 * - components/plantSelection/PlantsSearch/PlantsSearch.tsx - for search input
 */

import type React from "react";

import "./Input.scss";

type InputProps = {
  id: string;
  label?: string;
  type?: "text" | "date";
  value: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  "aria-label"?: string;
};

export const Input = ({
  id,
  label,
  type = "text",
  value,
  name,
  placeholder,
  required = false,
  disabled = false,
  onChange,
  onBlur,
  onFocus,
  "aria-label": ariaLabel,
}: InputProps) => {
  return (
    <div className="input-field">
      {label && (
        <label className="input-field__label" htmlFor={id}>
          {label}
        </label>
      )}
      <input
        id={id}
        className="input-field__input"
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        aria-label={ariaLabel || label}
      />
    </div>
  );
};


