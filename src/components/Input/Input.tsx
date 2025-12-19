import type React from "react";

import "./Input.scss";

type InputProps = {
  id: string;
  label: string;
  type?: "text" | "date";
  value: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
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
}: InputProps) => {
  return (
    <div className="input-field">
      <label className="input-field__label" htmlFor={id}>
        {label}
      </label>
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
      />
    </div>
  );
};


