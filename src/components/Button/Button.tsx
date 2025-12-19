import type React from "react";

import "./Button.scss";

type ButtonVariant = "primary" | "secondary" | "text";

type ButtonProps = {
  children: React.ReactNode;
  variant?: ButtonVariant;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
};

export const Button = ({
  children,
  variant = "primary",
  type = "button",
  disabled = false,
  onClick,
}: ButtonProps) => {
  return (
    <button
      type={type}
      className={`button button--${variant}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};


