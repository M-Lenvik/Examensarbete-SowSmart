/**
 * Capitalizes the first letter of a string.
 * 
 * @param str - The string to capitalize
 * @returns The string with the first letter capitalized, or empty string if input is empty
 */
export const capitalizeFirst = (str: string): string => {
  if (str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

