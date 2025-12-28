/**
 * Helper functions for calculating spans between months.
 */

import { getDaysInMonth } from "./monthToDays";

/**
 * Get the order of a month in the year (1-12).
 * Used to determine if one month comes before or after another.
 */
const getMonthOrder = (monthName: string): number | null => {
  if (!monthName || typeof monthName !== "string") {
    return null;
  }

  const normalized = monthName.toLowerCase().trim();

  const monthOrderMap: Record<string, number> = {
    "jan": 1,
    "feb": 2,
    "mars": 3,
    "april": 4,
    "maj": 5,
    "juni": 6,
    "juli": 7,
    "aug": 8,
    "sept": 9,
    "okt": 10,
    "nov": 11,
    "dec": 12,
  };

  return monthOrderMap[normalized] ?? null;
};

/**
 * Get month name from order (1-12).
 */
const getMonthNameFromOrder = (order: number): string | null => {
  const monthNames: Record<number, string> = {
    1: "jan",
    2: "feb",
    3: "mars",
    4: "april",
    5: "maj",
    6: "juni",
    7: "juli",
    8: "aug",
    9: "sept",
    10: "okt",
    11: "nov",
    12: "dec",
  };

  return monthNames[order] ?? null;
};

/**
 * Calculate the number of days from the first day of startMonth to the last day of endMonth.
 * 
 * @param startMonth - Start month name (e.g., "feb")
 * @param endMonth - End month name (e.g., "april")
 * @returns Number of days from first day of startMonth to last day of endMonth, or null if invalid
 * 
 * @example
 * getMonthSpan("feb", "april") // Returns 89 (1 feb to 30 april)
 * getMonthSpan("jan", "jan") // Returns 31 (1 jan to 31 jan)
 * getMonthSpan("april", "feb") // Returns null (endMonth before startMonth)
 * getMonthSpan(null, "april") // Returns null
 */
export const getMonthSpan = (
  startMonth: string | null,
  endMonth: string | null
): number | null => {
  // Handle null values
  if (!startMonth || !endMonth) {
    return null;
  }

  const startOrder = getMonthOrder(startMonth);
  const endOrder = getMonthOrder(endMonth);

  // Check if months are valid
  if (startOrder === null || endOrder === null) {
    return null;
  }

  // If endMonth comes before startMonth, return null
  // (we don't handle year wraparound in this calculation)
  if (endOrder < startOrder) {
    return null;
  }

  // If same month, return days in that month
  if (startOrder === endOrder) {
    return getDaysInMonth(startMonth);
  }

  // Calculate span: sum all days from startMonth to endMonth (inclusive)
  let totalDays = 0;

  for (let monthOrder = startOrder; monthOrder <= endOrder; monthOrder++) {
    const currentMonthName = getMonthNameFromOrder(monthOrder);
    if (!currentMonthName) {
      return null;
    }

    const daysInMonth = getDaysInMonth(currentMonthName);
    if (daysInMonth === null) {
      return null;
    }

    totalDays += daysInMonth;
  }

  return totalDays;
};

