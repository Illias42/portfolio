export type Rgb01 = readonly [number, number, number];

const FALLBACK = "#000000";

function normalizeCssColor(raw: string): string {
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return FALLBACK;
  ctx.fillStyle = raw;
  return typeof ctx.fillStyle === "string" ? ctx.fillStyle : FALLBACK;
}

function hexToRgb01(hex: string): Rgb01 {
  const value = Number.parseInt(hex.slice(1, 7), 16);
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
}

export function cssColorRgb(varName: string): Rgb01 {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  const hex = normalizeCssColor(raw || FALLBACK);
  return hex.startsWith("#") ? hexToRgb01(hex) : hexToRgb01(FALLBACK);
}
