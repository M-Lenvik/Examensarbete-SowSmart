import "./PlantsCategoryButtons.scss";

type PlantsCategoryButtonsProps = {
  options: string[];
  selectedValue: string | null;
  onSelect: (value: string | null) => void;
  showBackButton?: boolean;
  onBack?: () => void;
};

export const PlantsCategoryButtons = ({
  options,
  selectedValue,
  onSelect,
  showBackButton = false,
  onBack,
}: PlantsCategoryButtonsProps) => {
  // Capitalize first letter of string
  const capitalizeFirst = (str: string): string => {
    if (str.length === 0) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className="plants-category-buttons">

      <div className="plants-category-buttons__grid">
        {options.map((option) => {
          const isSelected = selectedValue === option;
          return (
            <button
              key={option}
              type="button"
              className={`plants-category-buttons__button ${
                isSelected ? "plants-category-buttons__button--selected" : ""
              }`}
              onClick={() => onSelect(isSelected ? null : option)}
              aria-label={`Välj ${option}`}
              aria-pressed={isSelected}
            >
              {capitalizeFirst(option)}
            </button>
          );
        })}
      </div>
      {showBackButton && onBack && (
        <button
          type="button"
          className="plants-category-buttons__back-button"
          onClick={onBack}
          aria-label="Tillbaka till kategorier"
        >
          ← Tillbaka
        </button>
      )}
    </div>
  );
};

