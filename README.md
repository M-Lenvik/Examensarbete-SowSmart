Helpers
Här i sker beräkningarna och är appens hjärta.
date/
date.ts - Grundläggande datum-operationer: lägg till/subtrahera dagar, formatera/parsa ISO-datum.
dateValidation.ts - Validerar skördedatum och ger kontextuella varningar per planta (för tidigt, utanför fönster, etc.).
monthSpan.ts - Beräknar antal dagar mellan två månader (används för att räkna totalDaysFromSeed).
monthToDays.ts - Konverterar svenska månadsnamn till antal dagar i månaden.
plant/
plantDefaults.ts - Default-värden per subcategory (plantingMethod, hardeningDays, frostTolerant, germinationTime, temperaturer, daysIndoorGrowth).
germination.ts - Parsar germinationTime-strängar (t.ex. "5-15 dagar") till nummer (använder medelvärde vid intervall).
validation.ts - Normaliserar rå plant-data till Plant-typ med fallback till defaults och validering.
calculation/
sowDate.ts - Beräknar sådatum med seedConstant-formel baserat på skördedatums position i skördefönster.
totalDaysFromSeed.ts - Beräknar totala dagar från första dagen i plantingWindows till sista dagen i harvestTime.
daysOutdoorToHarvest.ts - Beräknar antal dagar plantan står utomhus från utplantering till skörd.
recommendations.ts - Genererar kompletta recommendations med alla datum (sådatum, avhärdning, utplantering) för valda plantor.
utils/
image.ts - Hanterar trasiga bilder med fallback-SVG och förhindrar oändliga error-loops.
sorting.ts - Sorterar plantor först på subcategory (A-Z), sedan på namn (A-Z).