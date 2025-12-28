/**
 * Helper functions for date calculations and formatting.
 */

/**
 * Add days to a date.
 * 
 * Exempel: Om vi har datumet 2026-05-15 och lägger till 10 dagar,
 * får vi 2026-05-25.
 * 
 * Hur det fungerar:
 * 1. Skapar en kopia av datumet (så vi inte ändrar originalet)
 * 2. Använder setDate() som automatiskt hanterar månadsskiften
 *    (t.ex. om vi är den 28:e och lägger till 5 dagar → blir 3:e nästa månad)
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
 * Exempel: Om vi har datumet 2026-05-25 och subtraherar 10 dagar,
 * får vi 2026-05-15.
 * 
 * Hur det fungerar:
 * Använder addDays() med negativt värde (lägg till -10 = subtrahera 10).
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
 * Exempel: Date objektet för 2026-05-15 blir strängen "2026-05-15".
 * 
 * Hur det fungerar:
 * 1. getFullYear() ger året (2026)
 * 2. getMonth() ger 0-11 (maj = 4), så vi lägger till 1
 * 3. padStart(2, "0") säkerställer två siffror (5 → "05")
 * 4. getDate() ger dagen (15)
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
 * Exempel: Strängen "2026-05-15" blir ett Date objekt för den 15:e maj 2026.
 * 
 * Hur det fungerar:
 * 1. new Date(iso) kan parsa ISO-format direkt
 * 2. Kontrollerar att datumet är giltigt (inte NaN)
 * 3. Kastar fel om datumet är ogiltigt
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

