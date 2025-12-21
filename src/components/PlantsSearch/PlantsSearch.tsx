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
  return (
    <div className="plants-search">
      <Input
        id="plants-search"
        label="Sök"
        value={searchQuery}
        placeholder="Sök frö..."
        onChange={(event) => onSearchQueryChange(event.target.value)}
      />
    </div>
  );
};


