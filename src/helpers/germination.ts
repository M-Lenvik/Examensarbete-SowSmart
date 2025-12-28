/**
 * Helper functions for parsing germination-related data.
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

  // Steg 1: Ta bort mellanslag i början och slutet
  const trimmed = germinationTime.trim();
  if (trimmed.length === 0) {
    return null;
  }

  // Steg 2: Ta bort ordet "dagar" eller "dag" i slutet (om det finns)
  // Exempel: "5-15 dagar" → "5-15", "10 dagar" → "10"
  const lowerTrimmed = trimmed.toLowerCase();
  let withoutSuffix: string;
  
  if (lowerTrimmed.endsWith("dagar")) {
    // "dagar" är 5 bokstäver, så ta bort de sista 5 tecknen
    // Exempel: "5-15 dagar" (10 tecken) → ta bort sista 5 → "5-15" (5 tecken)
    const dagarLength = 5;
    withoutSuffix = trimmed.slice(0, trimmed.length - dagarLength).trim();
  } else if (lowerTrimmed.endsWith("dag")) {
    // "dag" är 3 bokstäver, så ta bort de sista 3 tecknen
    // Exempel: "10 dag" (6 tecken) → ta bort sista 3 → "10" (3 tecken)
    const dagLength = 3;
    withoutSuffix = trimmed.slice(0, trimmed.length - dagLength).trim();
  } else {
    withoutSuffix = trimmed;
  }

  // Steg 3: Kolla om det är ett intervall (t.ex. "5-15" eller "20-30")
  // Använd split() istället för regex för att dela upp vid bindestrecket
  if (withoutSuffix.includes("-")) {
    const parts = withoutSuffix.split("-");
    
    if (parts.length === 2) {
      const startText = parts[0].trim(); // "5"
      const endText = parts[1].trim();   // "15"
      
      const start = parseInt(startText, 10); // 5
      const end = parseInt(endText, 10);     // 15
      
      // Kontrollera att båda är giltiga nummer och att start <= end
      if (!isNaN(start) && !isNaN(end) && start > 0 && end > 0 && start <= end) {
        // Räkna ut medelvärdet: (5 + 15) / 2 = 10
        const average = (start + end) / 2;
        return Math.round(average); // Avrunda till närmaste heltal
      }
    }
  }

  // Steg 4: Kolla om det är ett enskilt nummer (t.ex. "5" eller "10")
  // Använd parseInt direkt - om det bara är siffror kommer det att fungera
  const trimmedNumber = withoutSuffix.trim();
  if (trimmedNumber.length > 0) {
    // Kontrollera att alla tecken är siffror
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
      // Kontrollera att det är ett giltigt nummer och större än 0
      if (!isNaN(value) && value > 0) {
        return value;
      }
    }
  }

  // Steg 5: Om vi inte kunde parsa strängen, returnera null
  return null;
};

