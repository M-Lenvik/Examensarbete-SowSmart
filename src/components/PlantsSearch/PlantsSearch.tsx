import { Input } from "../Input/Input";
import "./PlantsSearch.scss";

type PlantsSearchProps = {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
};

export const PlantsSearch = ({
  searchQuery,
  onSearchQueryChange,
}: PlantsSearchProps) => {
  const handleClear = () => {
    onSearchQueryChange("");
  };

  return (
    <div className="plants-search">
      <div className="plants-search__wrapper">
        <p>
          Om du vet precis vad du vill ha kan du söka efter sortnamnet eller kategorin här.
        </p>
        <div className="plants-search__input-wrapper">
          <Input
            id="plants-search"
            label="Sök frö"
            value={searchQuery}
            placeholder="Sök frö..."
            onChange={(event) => onSearchQueryChange(event.target.value)}
          />
          {searchQuery.length > 0 && (
            <button
              type="button"
              className="plants-search__clear"
              onClick={handleClear}
              aria-label="Rensa sökning"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


