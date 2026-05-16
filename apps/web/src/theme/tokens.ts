/** Semantic CSS variable names (ADR 0002). Values live in `src/styles/globals.css`. */
export const REQUIRED_THEME_CSS_VARIABLES = [
  '--background',
  '--foreground',
  '--surface',
  '--surface-foreground',
  '--muted-foreground',
  '--brand',
  '--brand-foreground',
  '--primary',
  '--primary-foreground',
  '--destructive',
  '--destructive-foreground',
  '--border',
  '--ring',
  '--radius',
] as const;
