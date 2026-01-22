import "./RemoveButton.scss";

type RemoveButtonProps = {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  ariaLabel: string;
};

/**
 * Reusable remove button component with × symbol.
 * Used for removing items from lists (plants, etc.).
 */
export const RemoveButton = ({ onClick, ariaLabel }: RemoveButtonProps) => {
  return (
    <button
      type="button"
      className="remove-button"
      onClick={onClick}
      aria-label={ariaLabel}
      title="Ta bort"
    >
      <span className="remove-button__text">Ta bort frösort</span>
      <span className="remove-button__icon" aria-hidden="true">×</span>
    </button>
  );
};

