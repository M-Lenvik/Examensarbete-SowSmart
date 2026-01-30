/**
 * Button component - reusable button with variants.
 * 
 * Data sources:
 * - Props: children, variant, type, disabled, onClick, className
 * 
 * Results:
 * - Returns: JSX (button element with styling)
 * 
 * Uses:
 * - (none - pure UI component)
 * 
 * Used by:
 * - All pages and components that need buttons
 */

import type React from "react";

import "./Button.scss";

type ButtonVariant = "primary" | "secondary" | "text";

type ButtonProps = {
  children: React.ReactNode;
  variant?: ButtonVariant;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
};

export const Button = ({
  children,
  variant = "primary",
  type = "button",
  disabled = false,
  onClick,
  className,
}: ButtonProps) => {
  return (
    <button
      type={type}
      className={`button button--${variant} ${className || ""}`.trim()}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};


