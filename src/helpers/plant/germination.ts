/**
 * Helper functions for parsing germination-related data.
 * 
 * Data sources:
 * - germinationTime strings come from plants.json (Plant.germinationTime)
 * - Format: "5-15 dagar" (range) or "10 dagar" (single value)
 */

/**
 * Parse a germination time string to a number (in days).
 * Handles formats like:
 * - "5-15 dagar" → 10 (average of 5 and 15)
 * - "20-30 dagar" → 25 (average of 20 and 30)
 * - "5 dagar" → 5
 * - "10 dagar" → 10
 * 
 * @param germinationTime - Germination time string (e.g., "5-15 dagar" or "10 dagar")
 * @returns Number of days (average if range), or null if invalid or missing
 */
export const parseGerminationTime = (germinationTime: string | null): number | null => {
  if (!germinationTime || typeof germinationTime !== "string") {
    return null;
  }

  // Step 1: Remove whitespace at start and end
  const trimmed = germinationTime.trim();
  if (trimmed.length === 0) {
    return null;
  }

  // Step 2: Remove "dagar" suffix if present
  // Example: "5-15 dagar" → "5-15", "10 dagar" → "10"
  const lowerTrimmed = trimmed.toLowerCase();
  let withoutSuffix: string;
  
  if (lowerTrimmed.endsWith("dagar")) {
    // "dagar" is 5 characters, so remove the last 5 characters
    // Example: "5-15 dagar" (10 chars) → remove last 5 → "5-15" (5 chars)
    const dagarLength = 5;
    withoutSuffix = trimmed.slice(0, trimmed.length - dagarLength).trim();
  } else {
    withoutSuffix = trimmed;
  }

  // Step 3: Check if it's a range (e.g., "5-15" or "20-30")
  if (withoutSuffix.includes("-")) {
    const parts = withoutSuffix.split("-");
    
    if (parts.length === 2) {
      const startText = parts[0].trim(); // "5"
      const endText = parts[1].trim();   // "15"
      
      const start = parseInt(startText, 10); // 5
      const end = parseInt(endText, 10);     // 15
      
      // Check that both are valid numbers and start <= end
      if (!isNaN(start) && !isNaN(end) && start > 0 && end > 0 && start <= end) {
        // Calculate average: (5 + 15) / 2 = 10
        const average = (start + end) / 2;
        return Math.round(average); // Round to nearest integer
      }
    }
  }

  // Step 4: Check if it's a single number (e.g., "5" or "10")
  // Use parseInt directly - if it's only digits it will work
  const trimmedNumber = withoutSuffix.trim();
  if (trimmedNumber.length > 0) {
    // Check that all characters are digits
    let isAllDigits = true;
    for (let i = 0; i < trimmedNumber.length; i++) {
      const char = trimmedNumber[i];
      if (char < "0" || char > "9") {
        isAllDigits = false;
        break;
      }
    }
    
    if (isAllDigits) {
      const value = parseInt(trimmedNumber, 10);
      // Check that it's a valid number and greater than 0
      if (!isNaN(value) && value > 0) {
        return value;
      }
    }
  }

  // Step 5: If we couldn't parse the string, return null
  return null;
};

