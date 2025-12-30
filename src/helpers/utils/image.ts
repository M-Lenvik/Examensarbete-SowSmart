/**
 * Handle broken images by swapping to a safe fallback.
 * This avoids broken image icons and prevents infinite error loops.
 * 
 * Data sources:
 * - Image URLs come from plants.json (Plant.imageUrl)
 * - Fallback SVG is generated programmatically when image fails to load
 */
import type React from "react";

export const FALLBACK_PLANT_IMAGE_SRC = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
    <rect width="800" height="450" fill="#F3F4F6"/>
    <path d="M210 330c70-90 160-150 300-150s230 60 300 150" fill="none" stroke="#CBD5E1" stroke-width="14" stroke-linecap="round"/>
    <circle cx="290" cy="210" r="34" fill="#CBD5E1"/>
    <circle cx="520" cy="190" r="26" fill="#CBD5E1"/>
    <text x="400" y="255" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="#64748B">Bild saknas</text>
  </svg>`
)}`;

export const handleImageError = (
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackSrc: string
) => {
  const img = event.currentTarget;
  if (img.dataset.fallbackApplied === "true") return;
  img.dataset.fallbackApplied = "true";
  img.src = fallbackSrc;
};


//TODO, add funny broken picture image as fallbackSrc