//AI discussed code, manually written, AI corrected

/**
 * Helper functions for calendar operations.
 * 
 * Data sources:
 * - year, month: From CalendarMonth component (user navigation)
 * 
 * Results:
 * - getDaysInMonth: Returns number (days in month)
 * - getFirstDayOfMonth: Returns number (day of week, 0-6)
 * - getCalendarDays: Returns Date[] (all days for calendar grid including previous/next month days)
 * - isSameDay: Returns boolean (if two dates are the same day)
 * - isToday: Returns boolean (if date is today)
 * 
 * Uses:
 * - (none - pure JavaScript Date operations)
 * 
 * Used by:
 * - components/calendar/CalendarMonth/CalendarMonth.tsx - for building calendar grid
 */

/**
 * Get the number of days in a specific month.
 * 
 * Example: January 2026 has 31 days, February 2026 has 28 days.
 * 
 * How it works:
 * Uses Date constructor with day 0 of the next month, which gives us
 * the last day of the current month.
 * 
 * @param year - The year (e.g., 2026)
 * @param month - The month (0-11, where 0 = January, 11 = December)
 * @returns Number of days in the month (28-31)
 */
export const getDaysInMonth = (year: number, month: number): number => {
  // Create a date for the first day of the next month
  // Then get the last day of the current month by using day 0
  const nextMonth = new Date(year, month + 1, 0);
  return nextMonth.getDate();
};

/**
 * Get the day of the week for the first day of a month.
 * 
 * Example: January 2026 starts on a Wednesday (3).
 * 
 * How it works:
 * getDay() returns 0-6 where 0 = Sunday, 1 = Monday, ..., 6 = Saturday.
 * 
 * @param year - The year (e.g., 2026)
 * @param month - The month (0-11, where 0 = January, 11 = December)
 * @returns Day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
 */
export const getFirstDayOfMonth = (year: number, month: number): number => {
  const firstDay = new Date(year, month, 1);
  return firstDay.getDay();
};

/**
 * Get all days that should be displayed in a calendar grid for a month.
 * 
 * This includes days from the previous month (to fill the first week)
 * and days from the next month (to fill the last week).
 * 
 * Example: For January 2026, we might include Dec 29-31 from previous month
 * and Feb 1-7 from next month to create a complete 7-column grid.
 * 
 * How it works:
 * 1. Gets the first day of the month and its day of week
 * 2. Calculates how many days from previous month to include
 * 3. Creates all days for the current month
 * 4. Calculates how many days from next month to include (to fill last week)
 * 5. Returns array of Date objects for the complete calendar grid
 * 
 * @param year - The year (e.g., 2026)
 * @param month - The month (0-11, where 0 = January, 11 = December)
 * @returns Array of Date objects for all days in the calendar grid
 */
export const getCalendarDays = (year: number, month: number): Date[] => {
  const days: Date[] = [];
  
  // Get first day of the month and its day of week
  const firstDayOfWeek = getFirstDayOfMonth(year, month);
  const daysInMonth = getDaysInMonth(year, month);
  
  // Calculate days from previous month to include
  // If first day is Sunday (0), we don't need previous month days
  // If first day is Monday (1), we need 1 day from previous month, etc.
  const daysFromPreviousMonth = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  
  // Add days from previous month
  const previousMonth = month === 0 ? 11 : month - 1;
  const previousYear = month === 0 ? year - 1 : year;
  const daysInPreviousMonth = getDaysInMonth(previousYear, previousMonth);
  
  for (let i = daysFromPreviousMonth; i > 0; i--) {
    const day = daysInPreviousMonth - i + 1;
    days.push(new Date(previousYear, previousMonth, day));
  }
  
  // Add days from current month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }
  
  // Calculate days from next month to include
  // For a complete grid we need to fill up to 7 columns
  // Total days should be divisible by 7
  const totalDaysSoFar = days.length;
  const remainingDays = totalDaysSoFar % 7;
  const daysFromNextMonth = remainingDays === 0 ? 0 : 7 - remainingDays;
  
  // Add days from next month
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  
  for (let day = 1; day <= daysFromNextMonth; day++) {
    days.push(new Date(nextYear, nextMonth, day));
  }
  
  return days;
};

/**
 * Check if two dates represent the same day (ignoring time).
 * 
 * Example: 2026-01-15 10:30 and 2026-01-15 14:45 are the same day.
 * 
 * How it works:
 * Compares year, month, and day of both dates.
 * 
 * @param date1 - First date to compare
 * @param date2 - Second date to compare
 * @returns true if both dates are the same day, false otherwise
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Check if a date is today.
 * 
 * Example: If today is 2026-01-15, then a date for 2026-01-15 returns true.
 * 
 * How it works:
 * Uses isSameDay() to compare the date with today's date.
 * 
 * @param date - The date to check
 * @returns true if the date is today, false otherwise
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return isSameDay(date, today);
};

