//AI discussed code, manually written, AI corrected

/**
 * Helper functions for converting month names to number of days.
 * 
 * Data sources:
 * - Month names come from plants.json (plantingWindows, harvestTime)
 * - Uses fixed calendar values (non-leap year)
 * 
 * Results:
 * - getDaysInMonth: Returns number | null (days in month, 28-31)
 * 
 * Uses:
 * - (none - fixed calendar values)
 * 
 * Used by:
 * - date/monthSpan.ts - for calculating spans between months
 */

/**
 * Get number of days in a month by month name.
 * Uses fixed values (non-leap year).
 * 
 * @param monthName - Month name in Swedish (e.g., "jan", "feb", "mars")
 * @returns Number of days in the month, or null if month name is unknown
 * 
 * @example
 * getDaysInMonth("feb") // Returns 28
 * getDaysInMonth("april") // Returns 30
 * getDaysInMonth("unknown") // Returns null
 */
export const getDaysInMonth = (monthName: string): number | null => {
  if (!monthName || typeof monthName !== "string") {
    return null;
  }

  const normalized = monthName.toLowerCase().trim();

  const monthDaysMap: Record<string, number> = {
    "jan": 31,
    "feb": 28,
    "mars": 31,
    "april": 30,
    "maj": 31,
    "juni": 30,
    "juli": 31,
    "aug": 31,
    "sept": 30,
    "sep": 30, // Alias for "sept" (used in plants.json)
    "okt": 31,
    "nov": 30,
    "dec": 31,
  };

  const days = monthDaysMap[normalized];
  return days !== undefined ? days : null;
};

