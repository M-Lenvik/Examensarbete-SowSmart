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
        <label className="plants-search__label" htmlFor="plants-search">
          Sök
        </label>
        <p className="plants-search__help-text">
          Om du vet precis vad du vill ha kan du söka efter det här.
        </p>
        <div className="plants-search__input-wrapper">
          <Input
            id="plants-search"
            value={searchQuery}
            placeholder="Sök frö..."
            onChange={(event) => onSearchQueryChange(event.target.value)}
            aria-label="Sök"
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


