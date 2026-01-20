# Beskrivning av sådatumberäkning

## Generell beskrivning

Uträkningen av sådatum görs i funktionen `calculateSowDate` i filen `src/helpers/calculation/sowDate.ts`.

### Process

1. **Välj såfönster**: Baserat på växtens `plantingMethod` väljs rätt såfönster från `plantingWindows` (indoors eller outdoors). Funktionen `selectPlantingWindow` i `src/helpers/plant/plantingWindow.ts` används för detta.

2. **Beräkna spann**: 
   - `plantingWindowsSpan`: Antal dagar från första dagen i såfönstrets startmånad till sista dagen i såfönstrets slutmånad (beräknas med `getMonthSpan` från `src/helpers/date/monthSpan.ts`)
   - `harvestTimeSpan`: Antal dagar från första dagen i skördefönstrets startmånad till sista dagen i skördefönstrets slutmånad (beräknas med `getMonthSpan`)

3. **Beräkna seedConstant**: 
   ```
   seedConstant = harvestTimeSpan / plantingWindowsSpan
   ```
   Detta är en proportionalitetsfaktor som beskriver förhållandet mellan såfönster och skördefönster.

4. **Beräkna harvestDaySpan**: 
   Antal dagar från första dagen i skördefönstrets startmånad till valt skördedatum. Om skördedatumet är utanför skördefönstret används ett "clamped" värde (0 om före, harvestTimeSpan om efter).

5. **Beräkna sowDateOffset**: 
   ```
   sowDateOffset = clampedHarvestDaySpan / seedConstant
   ```

6. **Beräkna sådatum**: 
   ```
   sowDate = första dagen i såfönstrets startmånad + sowDateOffset (avrundat)
   ```

### Referenser

- **Huvudfunktion**: `src/helpers/calculation/sowDate.ts` - `calculateSowDate`
- **Val av såfönster**: `src/helpers/plant/plantingWindow.ts` - `selectPlantingWindow`
- **Månadsspann**: `src/helpers/date/monthSpan.ts` - `getMonthSpan`
- **Månad till dagar**: `src/helpers/date/monthToDays.ts` - `getDaysInMonth`
- **Datumfunktioner**: `src/helpers/date/date.ts` - `addDays`, `subtractDays`, `formatDateIso`
- **Validering**: `src/helpers/date/dateValidation.ts` - `getPlantSowResult` (använder `calculateSowDate`)

## Konkret exempel: Plant ID 186 (Biquinho)

### Data från plants.json (rad 10965-11012)

```json
{
  "id": 186,
  "name": "Biquinho",
  "plantingWindows": {
    "indoors": {
      "start": "feb",
      "end": "mars"
    },
    "outdoors": {
      "start": null,
      "end": null
    }
  },
  "harvestTime": {
    "start": "juli",
    "end": "okt"
  },
  "plantingMethod": "indoor"
}
```

### Exempel: Skördedatum 2026-08-15

**Steg 1: Välj såfönster**
- `plantingMethod` = "indoor"
- Vald window: `indoors` → start: "feb", end: "mars"

**Steg 2: Beräkna spann**
- **plantingWindowsSpan**: 
  - Start: 1 februari 2026 (28 dagar i februari)
  - Slut: 31 mars 2026 (31 dagar i mars)
  - Span = 28 + 31 = **59 dagar**

- **harvestTimeSpan**:
  - Start: 1 juli 2026 (31 dagar i juli)
  - Slut: 31 oktober 2026 (31 dagar i juli + 31 i aug + 30 i sept + 31 i okt = 123 dagar)
  - Span = 31 + 31 + 30 + 31 = **123 dagar**

**Steg 3: Beräkna seedConstant**
```
seedConstant = 123 / 59 = 2.0847...
```

**Steg 4: Beräkna harvestDaySpan**
- Första dagen i skördefönster: 1 juli 2026
- Valt skördedatum: 15 augusti 2026
- Antal dagar: 31 (juli) + 15 (augusti) - 1 = **45 dagar**

**Steg 5: Beräkna sowDateOffset**
```
sowDateOffset = 45 / 2.0847 = 21.59... ≈ 22 dagar (avrundat)
```

**Steg 6: Beräkna sådatum**
- Första dagen i såfönster: 1 februari 2026
- Sådatum = 1 februari 2026 + 22 dagar = **23 februari 2026**

### Resultat
För plant ID 186 (Biquinho) med skördedatum 2026-08-15 blir sådatumet **2026-02-23**.

