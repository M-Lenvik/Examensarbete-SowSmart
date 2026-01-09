import { useEffect, useMemo, useRef, useState } from "react";
import type { Plant } from "../../models/Plant";
import "./FilterDropdown.scss";

type FilterOption = {
  id: string;
  type: "all" | "subcategory" | "plant";
  label: string;
  plantId?: number; // Only for plant type
  subcategory?: string; // Only for subcategory type
  parentSubcategory?: string; // Only for plant type - which subcategory it belongs to
};

type FilterDropdownProps = {
  selectedPlantIds: number[];
  plants: Plant[];
  selectedFilterIds: string[];
  onFilterChange: (filterIds: string[]) => void;
};

export const FilterDropdown = ({
  selectedPlantIds,
  plants,
  selectedFilterIds,
  onFilterChange,
}: FilterDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Get selected plants
  const selectedPlants = useMemo(() => {
    const selectedSet = new Set(selectedPlantIds);
    return plants.filter((plant) => selectedSet.has(plant.id));
  }, [plants, selectedPlantIds]);

  // Build filter options
  const filterOptions = useMemo<FilterOption[]>(() => {
    const options: FilterOption[] = [];

    // Add "Alla" option
    options.push({
      id: "all",
      type: "all",
      label: "Alla",
    });

    // Group by subcategory
    const subcategoryMap = new Map<string, Plant[]>();
    selectedPlants.forEach((plant) => {
      const subcategory = plant.subcategory || "Övrigt";
      if (!subcategoryMap.has(subcategory)) {
        subcategoryMap.set(subcategory, []);
      }
      subcategoryMap.get(subcategory)!.push(plant);
    });

    // Add subcategory options
    const sortedSubcategories = Array.from(subcategoryMap.keys()).sort((a, b) => {
      if (a === "Övrigt") return 1;
      if (b === "Övrigt") return -1;
      return a.localeCompare(b, "sv");
    });

    sortedSubcategories.forEach((subcategory) => {
      // Add subcategory option
      options.push({
        id: `subcategory-${subcategory}`,
        type: "subcategory",
        label: subcategory.charAt(0).toUpperCase() + subcategory.slice(1),
        subcategory,
      });

      // Add plants for this subcategory, sorted by name
      const plantsInSubcategory = subcategoryMap.get(subcategory)!;
      plantsInSubcategory
        .sort((a, b) => a.name.localeCompare(b.name, "sv"))
        .forEach((plant) => {
          options.push({
            id: `plant-${plant.id}`,
            type: "plant",
            label: plant.name,
            plantId: plant.id,
            parentSubcategory: subcategory,
          });
        });
    });

    return options;
  }, [selectedPlants]);

  const handleToggleOption = (optionId: string) => {
    if (optionId === "all") {
      // Toggle "Alla" - if selected, deselect all; if not selected, select all
      if (selectedFilterIds.includes("all")) {
        onFilterChange([]);
      } else {
        onFilterChange(filterOptions.map((opt) => opt.id));
      }
    } else {
      const option = filterOptions.find((opt) => opt.id === optionId);
      if (!option) return;

      let newFilterIds: string[];

      if (option.type === "subcategory") {
        // Toggle subcategory - select/deselect all plants in this subcategory
        const subcategory = option.subcategory!;
        const plantsInSubcategory = filterOptions.filter(
          (opt) => opt.type === "plant" && opt.parentSubcategory === subcategory
        );
        const plantIds = plantsInSubcategory.map((opt) => opt.id);
        const subcategoryId = `subcategory-${subcategory}`;

        const isSubcategorySelected = selectedFilterIds.includes(subcategoryId);
        const allPlantsSelected = plantIds.every((id) => selectedFilterIds.includes(id));

        if (isSubcategorySelected || allPlantsSelected) {
          // Deselect subcategory and all its plants
          newFilterIds = selectedFilterIds.filter(
            (id) => id !== subcategoryId && id !== "all" && !plantIds.includes(id)
          );
        } else {
          // Select subcategory and all its plants
          newFilterIds = [
            ...selectedFilterIds.filter((id) => id !== "all"),
            subcategoryId,
            ...plantIds,
          ];
        }
      } else {
        // Toggle individual plant
        const isSelected = selectedFilterIds.includes(optionId);
        newFilterIds = isSelected
          ? selectedFilterIds.filter((id) => id !== optionId && id !== "all")
          : [...selectedFilterIds.filter((id) => id !== "all"), optionId];

        // Check if all plants in the parent subcategory are now selected
        if (option.parentSubcategory) {
          const subcategoryId = `subcategory-${option.parentSubcategory}`;
          const plantsInSubcategory = filterOptions.filter(
            (opt) => opt.type === "plant" && opt.parentSubcategory === option.parentSubcategory
          );
          const plantIds = plantsInSubcategory.map((opt) => opt.id);
          const allPlantsSelected = plantIds.every((id) => newFilterIds.includes(id));

          if (allPlantsSelected) {
            // All plants selected, also select subcategory
            if (!newFilterIds.includes(subcategoryId)) {
              newFilterIds.push(subcategoryId);
            }
          } else {
            // Not all plants selected, deselect subcategory
            newFilterIds = newFilterIds.filter((id) => id !== subcategoryId);
          }
        }
      }

      // If all non-"all" options are selected, also select "all"
      const nonAllOptions = filterOptions.filter((opt) => opt.id !== "all");
      if (nonAllOptions.every((opt) => newFilterIds.includes(opt.id))) {
        newFilterIds.push("all");
      }

      onFilterChange(newFilterIds);
    }
    // Don't close dropdown on selection - allow multiple selections
  };

  const getDisplayText = () => {
    if (selectedFilterIds.length === 0) {
      return "Välj filter...";
    }
    if (selectedFilterIds.includes("all") && selectedFilterIds.length === filterOptions.length) {
      return "Alla";
    }
    if (selectedFilterIds.length === 1) {
      const option = filterOptions.find((opt) => opt.id === selectedFilterIds[0]);
      return option?.label || "Välj filter...";
    }
    return `${selectedFilterIds.length} valda`;
  };

  return (
    <div className="filter-dropdown" ref={dropdownRef}>
      <button
        type="button"
        className="filter-dropdown__trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>{getDisplayText()}</span>
        <span className={`filter-dropdown__arrow ${isOpen ? "filter-dropdown__arrow--open" : ""}`}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="filter-dropdown__menu" role="listbox">
          {filterOptions.map((option) => {
            const isPlant = option.type === "plant";
            let isSelected: boolean;

            if (option.type === "subcategory") {
              // Subcategory is selected if all its plants are selected
              const plantsInSubcategory = filterOptions.filter(
                (opt) => opt.type === "plant" && opt.parentSubcategory === option.subcategory
              );
              const plantIds = plantsInSubcategory.map((opt) => opt.id);
              isSelected = plantIds.length > 0 && plantIds.every((id) => selectedFilterIds.includes(id));
            } else {
              isSelected = selectedFilterIds.includes(option.id);
            }

            return (
              <button
                key={option.id}
                type="button"
                className={`filter-dropdown__option ${isSelected ? "filter-dropdown__option--selected" : ""} ${isPlant ? "filter-dropdown__option--plant" : ""}`}
                onClick={() => handleToggleOption(option.id)}
                role="option"
                aria-selected={isSelected}
              >
                <span className="filter-dropdown__checkbox">{isSelected ? "✓" : ""}</span>
                <span className="filter-dropdown__label">{option.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

