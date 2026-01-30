/**
 * RemoveButton component - reusable remove button with × symbol.
 * 
 * Data sources:
 * - Props: onClick, ariaLabel, onMouseDown
 * 
 * Results:
 * - Returns: JSX (remove button with × icon)
 * 
 * Uses:
 * - (none - pure UI component)
 * 
 * Used by:
 * - components/shared/SelectedPlantsList/SelectedPlantsList.tsx - for removing plants from selection
 */

import "./RemoveButton.scss";

type RemoveButtonProps = {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  ariaLabel: string;
  onMouseDown?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

/**
 * Reusable remove button component with × symbol.
 * Used for removing items from lists (plants, etc.).
 */
export const RemoveButton = ({ onClick, ariaLabel, onMouseDown }: RemoveButtonProps) => {
  return (
    <button
      type="button"
      className="remove-button"
      onClick={onClick}
      onMouseDown={onMouseDown}
      aria-label={ariaLabel}
      title="Ta bort"
    >
      <span className="remove-button__text">Ta bort frösort</span>
      <span className="remove-button__icon" aria-hidden="true">×</span>
    </button>
  );
};

