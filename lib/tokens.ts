/**
 * Design tokens for Forge — TypeScript source of truth.
 *
 * Use these in: Recharts configs, inline SVG styles, motion configs,
 * and anywhere Tailwind utility classes cannot reach.
 *
 * For Tailwind usage, these values are mirrored as CSS variables
 * in app/globals.css inside the @theme block.
 *
 * Every value here must match docs/design.md exactly.
 * Never hardcode a hex, px, or duration value in a component.
 */

// ---------------------------------------------------------------------------
// Colours
// ---------------------------------------------------------------------------

export const colors = {
  bg: {
    primary: '#fafaf9',   // Main app background
    secondary: '#f2f2f0', // Subtle section tints, skeleton loaders
    tertiary: '#ebebea',  // Pressed row states, active segmented-control segment
    inverse: '#0a0a0a',
  },

  surface: {
    default: '#ffffff',               // Cards, inputs, dropdowns
    raised: '#ffffff',                // Modals, bottom sheets
    sunken: '#f0f0ee',                // Read-only inputs, disabled fields, stepper buttons
    overlay: 'rgba(10, 10, 10, 0.50)', // Modal / sheet backdrop scrim
  },

  text: {
    primary: '#000000',   // All headings and body copy
    secondary: '#5c5c5a', // Labels, meta, descriptions
    tertiary: '#9a9a98',  // Timestamps, placeholders, dimmed values
    disabled: '#c4c4c2',  // Disabled controls, inactive nav items
    inverse: '#ffffff',   // Text on black buttons or dark surfaces
    accent: '#000000',    // Active tab labels, tappable links, streak numbers
    error: '#dc2626',     // Validation errors, destructive labels
    success: '#16a34a',   // Confirmed / met-goal labels
  },

  border: {
    default: '#ebebeb',                 // Cards, inputs at rest
    strong: 'rgba(10, 10, 10, 0.12)',   // Hovered cards, active inputs
    focus: '#000000',                   // Focused input ring (1px)
    error: '#dc2626',                   // Invalid input border
    divider: 'rgba(10, 10, 10, 0.05)', // Row dividers inside lists
    selected: '#000000',                // Selected card or option outline
  },

  action: {
    primary: '#000000',                     // Primary CTA background
    primaryHover: '#1a1a1a',                // Primary button hover / pressed
    primarySubtle: 'rgba(0, 0, 0, 0.08)',   // Tinted bg for active/highlighted states
    secondary: '#ffffff',                   // Secondary button background
    secondaryBorder: 'rgba(10, 10, 10, 0.15)', // Secondary button border
  },

  // Data / chart colours — separate from UI action colours
  data: {
    calories: '#000000', // Calorie ring and bar fill
    protein: '#2563eb',  // Protein ring and bar fill
    carbs: '#d97706',    // Carbs ring fill (progress screen only)
    fat: '#7c3aed',      // Fat ring fill (progress screen only)
    track: 'rgba(10, 10, 10, 0.07)', // Progress ring and bar backgrounds
    volume: '#0ea5e9',   // Workout volume chart bars
  },

  state: {
    success: '#16a34a',
    successBg: '#f0fdf4',
    warning: '#d97706',
    warningBg: '#fffbeb',
    error: '#dc2626',
    errorBg: '#fef2f2',
    skipped: '#9a9a98',
    disabled: '#c4c4c2',
  },
} as const

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------

export const fontFamily = {
  sans: '"Google Sans Flex", "Google Sans", "Google Sans Text", "Product Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  mono: '"Google Sans Mono", "Roboto Mono", "SFMono-Regular", Consolas, "Liberation Mono", "Courier New", monospace',
} as const

// px values — Tailwind translates to rem; use these for inline/Recharts contexts
export const fontSize = {
  // Google Sans Flex — UI text
  display: 40,
  largeTitle: 32,
  title: 24,
  heading: 17,
  body: 15,
  bodySmall: 13,
  caption: 12,
  label: 11,
  button: 16,
  buttonSmall: 14,
  // Google Sans Mono — numeric / quantitative values only
  numHero: 40,
  numLarge: 28,
  numMedium: 20,
  numBody: 15,
  numSmall: 13,
  numCaption: 11,
} as const

export const lineHeight = {
  display: 44,
  largeTitle: 36,
  title: 28,
  heading: 22,
  body: 22,
  bodySmall: 18,
  caption: 16,
  label: 14,
  button: 20,
  buttonSmall: 18,
} as const

export const fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const

export const letterSpacing = {
  tight: '-0.5px',
  normal: '0px',
  wide: '0.4px',   // Captions, type.caption
  wider: '0.6px',  // Section labels, type.label (ALL CAPS)
} as const

// ---------------------------------------------------------------------------
// Spacing
// ---------------------------------------------------------------------------

// All values are multiples of the 4px base unit.
export const spacing = {
  1: 4,   // Icon-to-label gap, micro adjustments
  2: 8,   // Between stacked labels, inside chips
  3: 12,  // Section header → first item, tighter card contexts
  4: 16,  // Standard horizontal page margin, standard card padding
  5: 20,  // Between form items, title → subtitle
  6: 24,  // Section gap between card groups
  8: 32,  // Large section gap, page header → first card
  10: 40, // Screen top padding below nav, modal internal padding
  12: 48, // Bottom safe-area minimum, FAB clearance
  16: 64, // Hero section vertical breathing room
} as const

// ---------------------------------------------------------------------------
// Border radius
// ---------------------------------------------------------------------------

export const radius = {
  sm: 4,    // Checkboxes, toggle track, tiny badges
  md: 6,   // Inputs, dropdowns, filter chips, tags
  lg: 8,   // Cards, list group containers, image thumbnails
  xl: 12,   // Bottom sheet top corners, large modals
  pill: 100, // Primary CTA buttons, segmented control containers
  full: 9999, // Avatars, progress ring containers, icon badges
} as const

// ---------------------------------------------------------------------------
// Shadows
// ---------------------------------------------------------------------------

// Cards use borders, not shadows. Shadows are reserved for floating elements.
export const shadow = {
  none: 'none',
  subtle: '0 1px 3px rgba(0, 0, 0, 0.06)',   // FAB at rest, autocomplete dropdown
  floating: '0 4px 12px rgba(0, 0, 0, 0.10)', // FAB hover, tooltip
  modal: '0 8px 32px rgba(0, 0, 0, 0.12)',    // Modal card, bottom sheet
} as const

// ---------------------------------------------------------------------------
// Motion
// ---------------------------------------------------------------------------

export const motion = {
  duration: {
    fast: 100,       // Button press, checkbox flip, row tap highlight
    standard: 150,   // Progress ring fill, border hover, tab switch
    slow: 250,       // Bottom sheet slide, modal fade
    deliberate: 400, // Streak counter spring increment
    confetti: 600,   // Confetti burst — fires once only on streak increment
  },
  easing: {
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Streak number bounce
  },
  // Pre-composed CSS transition strings — use with Tailwind `transition` or inline styles
  transition: {
    fast: 'all 100ms ease-out',
    standard: 'all 150ms ease-out',
    slow: 'all 250ms ease-in-out',
  },
} as const

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

export const iconSize = {
  sm: 16,   // Inline meta icons (duration, type labels)
  md: 20,   // List row icons, bottom nav icons
  lg: 24,   // Card header icons, action icons in headers
  xl: 32,   // Feature section icons
  hero: 48, // Empty state illustrations
} as const

export const strokeWidth = {
  default: 1.5, // All outline icons at rest
  bold: 2,      // Active nav tab icons, strong-emphasis icons
} as const

// ---------------------------------------------------------------------------
// Layout constants
// ---------------------------------------------------------------------------

export const layout = {
  pageMargin: spacing[4],        // 16px horizontal margin on all screens
  cardPadding: spacing[4],       // 16px internal card padding
  sectionGap: spacing[6],        // 24px between card groups
  largeGap: spacing[8],          // 32px between major page sections
  rowHeightSingle: 52,           // Single-line list row
  rowHeightDouble: 68,           // Two-line list row
  navHeight: 56,                 // Bottom navigation bar height (px, excl. safe area)
  headerHeight: 52,              // Top navigation header height
  fabSize: 52,                   // Floating action button diameter
  progressRingSize: 44,          // Metric card circular progress ring
  progressRingStroke: 3,         // Stroke width for progress rings
  maxContentWidth: 430,          // PWA max-width on wide screens
} as const

// ---------------------------------------------------------------------------
// Convenience bundles for Recharts
// ---------------------------------------------------------------------------

export const chartTokens = {
  calories: {
    fill: colors.data.calories,
    track: colors.data.track,
  },
  protein: {
    fill: colors.data.protein,
    track: colors.data.track,
  },
  carbs: {
    fill: colors.data.carbs,
    track: colors.data.track,
  },
  fat: {
    fill: colors.data.fat,
    track: colors.data.track,
  },
  volume: {
    fill: colors.data.volume,
    track: colors.data.track,
  },
  axis: {
    tick: colors.text.tertiary,
    grid: colors.border.divider,
    label: colors.text.secondary,
  },
  tooltip: {
    background: colors.surface.raised,
    border: colors.border.default,
    text: colors.text.primary,
    subtext: colors.text.secondary,
  },
} as const

// ---------------------------------------------------------------------------
// Type exports
// ---------------------------------------------------------------------------

export type Colors = typeof colors
export type FontSize = typeof fontSize
export type Spacing = typeof spacing
export type Radius = typeof radius
export type Motion = typeof motion
export type ChartTokens = typeof chartTokens
