/** Semantic CSS variable names (ADR 0006 Onda). Values live in `src/styles/globals.css`. */
export const REQUIRED_THEME_CSS_VARIABLES = [
  '--background',
  '--foreground',
  '--card',
  '--card-foreground',
  '--primary',
  '--primary-foreground',
  '--primary-hover',
  '--muted',
  '--muted-foreground',
  '--border',
  '--ring',
  '--radius',
  '--shadow-card',
  '--shadow-subtle',
  '--font-sans',
  '--sidebar',
  '--sidebar-accent',
  '--sidebar-border',
  '--surface',
  '--brand',
  '--transition-fast',
  '--transition-base',
] as const;

/** HOPE-era variables that must not appear in web-next theme. */
export const FORBIDDEN_HOPE_CSS_VARIABLES = [
  '--border-weight',
  '--shadow-offset-sm',
  '--shadow-offset-md',
] as const;
