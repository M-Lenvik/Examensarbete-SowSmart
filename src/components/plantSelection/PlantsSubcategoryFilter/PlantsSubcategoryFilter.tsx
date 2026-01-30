/**
 * PlantsSubcategoryFilter component - dropdown filter for plant subcategories.
 * 
 * Data sources:
 * - Props: options, value, onChange
 * 
 * Results:
 * - Returns: JSX (select dropdown for filtering by subcategory)
 * 
 * Uses:
 * - (none - pure UI component)
 * 
 * Used by:
 * - pages/PlantSelection.tsx - for filtering plants by subcategory
 */

import "./PlantsSubcategoryFilter.scss";

type PlantsSubcategoryFilterProps = {
  options: string[];
  value: string;
  onChange: (value: string) => void;
};

export const PlantsSubcategoryFilter = ({
  options,
  value,
  onChange,
}: PlantsSubcategoryFilterProps) => {
  return (
    <div className="plants-subcategory-filter">
      <label className="plants-subcategory-filter__label" htmlFor="subcategory-filter">
        Kategori
      </label>
      <select
        id="subcategory-filter"
        className="plants-subcategory-filter__select"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="all">Alla</option>
        {options.map((subcategory) => (
          <option key={subcategory} value={subcategory}>
            {subcategory}
          </option>
        ))}
      </select>
    </div>
  );
};


