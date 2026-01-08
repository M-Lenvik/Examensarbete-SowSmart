/**
 * Helper functions for date calculations and formatting.
 * 
 * Data sources:
 * - Input dates come from user input (harvest date) or calculated dates from other helpers
 * - These are pure utility functions that operate on Date objects
 */

/**
 * Add days to a date.
 * 
 * Example: If we have the date 2026-05-15 and add 10 days,
 * we get 2026-05-25.
 * 
 * How it works:
 * 1. Creates a copy of the date (so we don't modify the original)
 * 2. Uses setDate() which automatically handles month transitions
 *    (e.g., if we're on the 28th and add 5 days → becomes the 3rd of next month)
 * 
 * @param date - The date to add days to
 * @param days - Number of days to add (can be negative to subtract)
 * @returns New Date object with days added
 */
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Subtract days from a date.
 * 
 * Example: If we have the date 2026-05-25 and subtract 10 days,
 * we get 2026-05-15.
 * 
 * How it works:
 * Uses addDays() with a negative value (add -10 = subtract 10).
 * 
 * @param date - The date to subtract days from
 * @param days - Number of days to subtract (can be negative to add)
 * @returns New Date object with days subtracted
 */
export const subtractDays = (date: Date, days: number): Date => {
  return addDays(date, -days);
};

/**
 * Format a date to ISO string (YYYY-MM-DD format).
 * 
 * Example: The Date object for 2026-05-15 becomes the string "2026-05-15".
 * 
 * How it works:
 * 1. getFullYear() returns the year (2026)
 * 2. getMonth() returns 0-11 (May = 4), so we add 1
 * 3. padStart(2, "0") ensures two digits (5 → "05")
 * 4. getDate() returns the day (15)
 * 
 * @param date - The date to format
 * @returns ISO date string (YYYY-MM-DD)
 */
export const formatDateIso = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Parse an ISO date string (YYYY-MM-DD) to a Date object.
 * 
 * Example: The string "2026-05-15" becomes a Date object for May 15, 2026.
 * 
 * How it works:
 * 1. new Date(iso) can parse ISO format directly
 * 2. Checks that the date is valid (not NaN)
 * 3. Throws an error if the date is invalid
 * 
 * @param iso - ISO date string (YYYY-MM-DD)
 * @returns Date object
 * @throws Error if the string is not a valid ISO date format
 */
export const parseDateIso = (iso: string): Date => {
  const date = new Date(iso);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid ISO date string: ${iso}`);
  }
  return date;
};

/**
 * Format a date to Swedish format (e.g., "15 mars 2026").
 * 
 * Takes an ISO date string and formats it as a full Swedish date.
 * 
 * @param dateIso - ISO date string (YYYY-MM-DD)
 * @returns Formatted date string in Swedish (e.g., "15 mars 2026")
 */
export const formatDateSwedish = (dateIso: string): string => {
  try {
    const date = parseDateIso(dateIso);
    return date.toLocaleDateString("sv-SE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateIso;
  }
};

/**
 * Format a date to Swedish month and year format (e.g., "mars 2026").
 * 
 * @param date - Date object
 * @returns Formatted month and year string in Swedish (e.g., "mars 2026")
 */
export const formatMonthYearSwedish = (date: Date): string => {
  return date.toLocaleDateString("sv-SE", {
    month: "long",
    year: "numeric",
  });
};

