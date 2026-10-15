/**
 * Brand colours for places CSS variables cannot reach: SVG charts, canvas,
 * generated avatars and image routes. They mirror the tokens in
 * styles/globals.css (:root); change both together.
 */
export const BRAND = {
  /** Primary action. */
  rust: "#c04b2b",
  rustDark: "#9e3b1f",
  /** Structure: sidebar, headers, dark surfaces. */
  forest: "#1b4332",
  forestMid: "#2d6a4f",
  forestLight: "#3b8a65",
  /** Status and premium accent. */
  gold: "#c9882a",
  goldDark: "#b07520",
  /** Text. */
  ink: "#2c1810",
  inkMuted: "#8b6553",
} as const;

/** Colours for generated initials avatars: brand shades only. */
export const AVATAR_COLORS = [
  BRAND.forest,
  BRAND.forestMid,
  BRAND.gold,
  BRAND.rust,
  BRAND.rustDark,
  BRAND.goldDark,
  BRAND.forestLight,
  BRAND.inkMuted,
] as const;

/** Gold used on the share-preview image; slightly warmer than the site gold. */
export const OG_GOLD = "#d4912b";
