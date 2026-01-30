/**
 * FilterDropdown component - dropdown for filtering plants by subcategory or individual plant.
 * 
 * Data sources:
 * - Props: selectedPlantIds, plants, selectedFilterIds, onFilterChange
 * 
 * Results:
 * - Returns: JSX (dropdown with filter options)
 * 
 * Uses:
 * - helpers/utils/text.ts (capitalizeFirst)
 * - helpers/utils/sorting.ts (sortSubcategories)
 * 
 * Used by:
 * - pages/CalendarView.tsx - for filtering calendar events
 * - pages/HarvestPlanner.tsx - for filtering selected plants
 */

import { useEffect, useMemo, useRef, useState } from "react";
import type { Plant } from "../../../models/Plant";
import { capitalizeFirst } from "../../../helpers/utils/text";
import { sortSubcategories } from "../../../helpers/utils/sorting";
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
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Close dropdown when clicking outside or pressing ESC
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  // Reset focused index when dropdown closes and focus first option when opening
  useEffect(() => {
    if (!isOpen) {
      setFocusedIndex(-1);
    } else {
      // Auto-focus first option when opening
      setFocusedIndex(0);
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        if (optionRefs.current[0]) {
          optionRefs.current[0].focus();
        }
      });
    }
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
    const sortedSubcategories = sortSubcategories(Array.from(subcategoryMap.keys()));

    sortedSubcategories.forEach((subcategory) => {
      // Add subcategory option
      options.push({
        id: `subcategory-${subcategory}`,
        type: "subcategory",
        label: capitalizeFirst(subcategory),
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

  // Reset optionRefs when filterOptions change
  useEffect(() => {
    optionRefs.current = new Array(filterOptions.length).fill(null);
  }, [filterOptions.length]);

  const handleToggleOption = (optionId: string) => {
    if (optionId === "all") {
      // Toggle "Alla" - if selected, deselect all; if not selected, select all
      if (selectedFilterIds.includes("all")) {
        onFilterChange([]);
      } else {
        onFilterChange(filterOptions.map((filterOption) => filterOption.id));
      }
    } else {
      const option = filterOptions.find((filterOption) => filterOption.id === optionId);
      if (!option) return;

      let newFilterIds: string[];

      if (option.type === "subcategory") {
        // Toggle subcategory - select/deselect all plants in this subcategory
        const subcategory = option.subcategory!;
        const plantsInSubcategory = filterOptions.filter(
          (filterOption) => filterOption.type === "plant" && filterOption.parentSubcategory === subcategory
        );
        const plantIds = plantsInSubcategory.map((filterOption) => filterOption.id);
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
            (filterOption) => filterOption.type === "plant" && filterOption.parentSubcategory === option.parentSubcategory
          );
          const plantIds = plantsInSubcategory.map((filterOption) => filterOption.id);
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
      const nonAllOptions = filterOptions.filter((filterOption) => filterOption.id !== "all");
      if (nonAllOptions.every((filterOption) => newFilterIds.includes(filterOption.id))) {
        newFilterIds.push("all");
      }

      onFilterChange(newFilterIds);
    }
    // Don't close dropdown on selection - allow multiple selections
  };

  const getDisplayText = () => {
    if (selectedFilterIds.length === 0) {
      return "Välj dina fröer...";
    }
    if (selectedFilterIds.includes("all") && selectedFilterIds.length === filterOptions.length) {
      return "Alla";
    }
    
    // Count only plants, exclude subcategories and "all"
    const selectedPlantCount = selectedFilterIds.filter(
      (id) => id !== "all" && id.startsWith("plant-")
    ).length;
    
    if (selectedPlantCount === 0) {
      return "Välj dina fröer...";
    }
    if (selectedPlantCount === 1) {
      const plantId = selectedFilterIds.find((id) => id.startsWith("plant-"));
      const option = filterOptions.find((filterOption) => filterOption.id === plantId);
      return option?.label || "Välj dina fröer...";
    }
    return `${selectedPlantCount} valda`;
  };

  //AI generated code for ally, manually adjusted
  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setIsOpen(!isOpen);
      if (!isOpen) {
        setFocusedIndex(0);
      }
    } else if (event.key === "ArrowDown" && !isOpen) {
      event.preventDefault();
      setIsOpen(true);
      setFocusedIndex(0);
    } else if (event.key === "ArrowUp" && !isOpen) {
      event.preventDefault();
      setIsOpen(true);
      setFocusedIndex(filterOptions.length - 1);
    } else if (event.key === "Tab" && isOpen) {
      setIsOpen(false);
      setFocusedIndex(-1);
    }
  };

  const handleMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      const currentIndex = focusedIndex < 0 ? 0 : focusedIndex;
      const nextIndex = currentIndex < filterOptions.length - 1 ? currentIndex + 1 : 0;
      setFocusedIndex(nextIndex);
      setTimeout(() => {
        optionRefs.current[nextIndex]?.focus();
      }, 0);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      const currentIndex = focusedIndex < 0 ? filterOptions.length - 1 : focusedIndex;
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : filterOptions.length - 1;
      setFocusedIndex(prevIndex);
      setTimeout(() => {
        optionRefs.current[prevIndex]?.focus();
      }, 0);
    } else if (event.key === "Tab") {
      setIsOpen(false);
      setFocusedIndex(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      setFocusedIndex(0);
      setTimeout(() => {
        optionRefs.current[0]?.focus();
      }, 0);
    } else if (event.key === "End") {
      event.preventDefault();
      const lastIndex = filterOptions.length - 1;
      setFocusedIndex(lastIndex);
      setTimeout(() => {
        optionRefs.current[lastIndex]?.focus();
      }, 0);
    }
  };

  const handleOptionKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, optionId: string, index: number) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleToggleOption(optionId);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      const nextIndex = index < filterOptions.length - 1 ? index + 1 : 0;
      setFocusedIndex(nextIndex);
      setTimeout(() => {
        optionRefs.current[nextIndex]?.focus();
      }, 0);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      const prevIndex = index > 0 ? index - 1 : filterOptions.length - 1;
      setFocusedIndex(prevIndex);
      setTimeout(() => {
        optionRefs.current[prevIndex]?.focus();
      }, 0);
    } else if (event.key === "Tab") {
      setIsOpen(false);
      setFocusedIndex(-1);
    }
  };

  return (
    <div className="filter-dropdown" ref={dropdownRef}>
      <button
        type="button"
        className="filter-dropdown__trigger"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleTriggerKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>{getDisplayText()}</span>
        <span className={`filter-dropdown__arrow ${isOpen ? "filter-dropdown__arrow--open" : ""}`}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div 
          className="filter-dropdown__menu" 
          role="listbox"
          onKeyDown={handleMenuKeyDown}
          tabIndex={-1}
        >
          {filterOptions.map((option, index) => {
            const isPlant = option.type === "plant";
            let isSelected: boolean;

            if (option.type === "subcategory") {
              // Subcategory is selected if all its plants are selected
              const plantsInSubcategory = filterOptions.filter(
                (filterOption) => filterOption.type === "plant" && filterOption.parentSubcategory === option.subcategory
              );
              const plantIds = plantsInSubcategory.map((filterOption) => filterOption.id);
              isSelected = plantIds.length > 0 && plantIds.every((id) => selectedFilterIds.includes(id));
            } else {
              isSelected = selectedFilterIds.includes(option.id);
            }

            return (
              <button
                key={option.id}
                ref={(el) => {
                  optionRefs.current[index] = el;
                }}
                type="button"
                className={`filter-dropdown__option ${isSelected ? "filter-dropdown__option--selected" : ""} ${isPlant ? "filter-dropdown__option--plant" : ""}`}
                onClick={() => handleToggleOption(option.id)}
                onKeyDown={(e) => handleOptionKeyDown(e, option.id, index)}
                onFocus={() => setFocusedIndex(index)}
                role="option"
                aria-selected={isSelected}
                tabIndex={focusedIndex === index ? 0 : -1}
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

