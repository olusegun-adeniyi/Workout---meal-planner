# Design System — Forge

> Source of truth for all UI decisions. Every screen, every component, every interaction must be traceable back to this document. If you reach for something not defined here, stop and define it first.

---

## 1. Design Philosophy

### What Forge Is

Forge is a personal accountability tool, not a lifestyle app. Its job is to interrupt you at exactly the right moment ("eat now") and then get out of the way. The UI functions like picking up a trusted, well-organised notebook — always ready, never demanding, shows exactly what you need.

The design borrows structure from health-tracking apps: data-forward cards, stat rings, timeline layouts — and restraint from productivity tools: Linear's typographic density, Notion's warm off-white ground. The result is a personal operations dashboard: purposeful, minimal, and confident.

### Product Personality

**Disciplined. Warm. Direct.**

Not a cheerleader-motivational app ("You're crushing it! 💪"). Not cold and clinical. Somewhere between a personal trainer who respects your time and a well-designed calendar. The app trusts that you know why you opened it.

### Emotional Tone

- **Calm** when things are going well. Neutral surfaces, measured type, no celebration of ordinary actions.
- **Informative** by default. Every visible element should answer a question, not fill space.
- **Urgent, but not panicked**, when a meal is due or a goal is at risk. Urgency is conveyed through position and colour, not animation or copy.
- **Celebratory only at genuine milestones**: streak count increments, weekly goal completion. Not routine taps.

### What the UI Should Feel Like

- Opening at 8am immediately answers: "What's next?" — no loading, no dashboard, no hello.
- Logging a meal feels like checking a box on a paper list. One tap, done.
- The progress screen feels like a post-week review with a trusted coach, not an analytics dashboard.
- Numbers are the hero. Descriptions support. Layout enforces.

### What the UI Should Avoid

- Motivational copy in empty states or success messages
- Dense data dumps — every metric on screen must earn its presence
- Purple gradients, glassmorphism, drop shadows on cards
- Animations that delay action (nothing > 150ms before the user can act)
- "Cute" empty states — useful copy only
- Emoji in UI copy (one exception: 🔥 on streak milestones only)
- Multiple accent colours competing for attention
- iOS-native blue links — all interactive text uses black or near-black

---

## 2. Design Principles

### 1. One Screen, One Question
**The home screen answers "what now?" and nothing else.**
- Implementation rules:
  - Every element on Today must be answerable with: "does this help the user know what to eat or do next?"
  - Remove or collapse anything that fails that test
  - The next meal card is always the first visible element, above the fold, every time

### 2. Numbers Over Descriptions
**Show "720 cal · 52g protein" not "a hearty meal."**
- Implementation rules:
  - Macro data is displayed as numbers first, always
  - Meal names are secondary — macros are in a stronger weight when space is limited
  - Use Google Sans Mono for all quantitative values; the font switch is a visual signal that "this is a number to act on"
  - Round at write time. Display integers only. Never show "720.4 cal"

### 3. Calm by Default, Urgent Only When Earned
**The app does not shout. Urgency is reserved.**
- Implementation rules:
  - Black (#000000) appears only in: primary CTA buttons, active progress fills, streak numbers, and "meal due now" indicators
  - Error states use muted red, not black — black is for action, not alarm
  - The only animation that draws attention is the streak counter confetti burst on meal log
  - Use near-black text at reduced opacity for secondary information, not a different colour

### 4. One Tap to Log
**Confirming a planned meal takes one tap. No form, no modal, no confirmation.**
- Implementation rules:
  - "Ate it" on a planned meal: fires immediately, optimistic UI updates the timeline, toast confirms
  - Only "Ate something else" (custom log) shows a form
  - Destructive actions (skip, delete logged meal) do require a single confirmation press — but it lives inline, not in a dialog
  - Never require re-entering information the app already has (meal name, macros are pre-filled)

### 5. Progressive Disclosure
**Show the summary. Reveal the detail on demand.**
- Implementation rules:
  - Workout card on Today screen: collapsed by default, shows day + muscle group + total volume
  - Meal plan grid: shows meal name + macros only; tap for recipe
  - Progress charts: show the 7-day trend by default, tap to see per-day breakdown
  - Section headers with "See all" indicate there is more beneath the fold

### 6. Mono for Numbers, Sans for Everything Else
**Font variety is semantic, not decorative.**
- Implementation rules:
  - Google Sans Mono: all quantitative values — calories, protein, carbs, fat, weight, reps, sets, duration, dates in data tables
  - Google Sans Flex: all labels, headings, body copy, button text, nav labels
  - Never mix fonts within a single label (e.g., not "Calories: 720" where "Calories" is Sans and "720" is Mono on the same baseline inline — that's fine and correct)
  - Numbers in Google Sans Mono should not have letter-spacing adjustments

### 7. Earned Celebration Only
**One animation. One moment. Make it count.**
- Implementation rules:
  - Confetti burst fires only when the streak counter increments after a meal log
  - No sparkle on save, no pulse on tap, no shimmer on load
  - Success toasts for routine actions (weight logged, exercise logged) are plain text — no icon animation
  - Badge increments and progress ring fills animate with a 150ms ease-out — nothing more

### 8. Borders, Not Shadows
**Cards are defined by 1px borders. The surface is flat.**
- Implementation rules:
  - Card border: `1px solid rgba(10,10,10,0.06)`
  - Hover state lifts border opacity to `rgba(10,10,10,0.12)`
  - Modals and bottom sheets have a single, slightly stronger border: `1px solid rgba(10,10,10,0.10)`
  - The only permitted shadows are: modal overlay scrim, floating action button (very subtle `0 2px 8px rgba(0,0,0,0.08)`)
  - Never: `box-shadow: 0 4px 20px rgba(0,0,0,0.15)` or any large diffuse shadow

### 9. Generous Margins, Dense Data
**Sections breathe. Rows are compact.**
- Implementation rules:
  - Page horizontal padding: 16px (mobile) — consistent across all screens
  - Section gap (between card groups): 24px minimum, 32px preferred
  - Card internal padding: 16px
  - List row height: 52px (single line), 68px (two lines)
  - Space between a section header and its first item: 8px
  - Space between the last item and the next section header: 24px

### 10. Black Is Precious
**If everything is emphasised, nothing is.**
- Implementation rules:
  - Black (#000000) appears in: primary button backgrounds, filled progress arcs, streak flame number, active bottom nav tab, "due now" meal card accent
  - Not in: secondary buttons, informational icons, chart backgrounds, error states, hover states
  - Secondary palette (macro rings, charts) uses blue for protein and amber for carbs — but these are data colours, not UI action colours
  - When in doubt: use near-black, not black

---

## 3. Design Tokens

### Colour Tokens

#### Background Colours

| Token | Value | Usage | Avoid |
|---|---|---|---|
| `color.bg.primary` | `#fafaf9` | Main app background, all screen surfaces | Cards, modals, input backgrounds |
| `color.bg.secondary` | `#f2f2f0` | Grouped section backgrounds, subtle inset areas, skeleton loaders | Primary page background |
| `color.bg.tertiary` | `#ebebea` | Pressed states on rows, active segment in segmented control | Large background areas |
| `color.bg.inverse` | `#0a0a0a` | Dark contexts only (not used in v1) | Any light-mode surface |

#### Surface Colours

| Token | Value | Usage | Avoid |
|---|---|---|---|
| `color.surface.default` | `#ffffff` | Cards, input fields, dropdown menus | Page background |
| `color.surface.raised` | `#ffffff` | Modals, bottom sheets, popovers | Inline cards |
| `color.surface.sunken` | `#f0f0ee` | Read-only input backgrounds, disabled input areas, stepper button backgrounds | Active inputs |
| `color.surface.overlay` | `rgba(10,10,10,0.50)` | Modal/sheet backdrop scrim | Any persistent background |

#### Text Colours

| Token | Value | Usage | Avoid |
|---|---|---|---|
| `color.text.primary` | `#0a0a0a` | All primary labels, headings, body copy | Secondary metadata |
| `color.text.secondary` | `#5c5c5a` | Subheadings, meta labels, secondary descriptions | Primary headings |
| `color.text.tertiary` | `#9a9a98` | Timestamps, placeholder text, dimmed values | Body copy |
| `color.text.disabled` | `#c4c4c2` | Disabled form labels, inactive nav items | Active states |
| `color.text.inverse` | `#ffffff` | Text on black buttons, text on dark surfaces | Light backgrounds |
| `color.text.accent` | `#000000` | Active tab labels, tappable text links, streak numbers | General body copy |
| `color.text.error` | `#dc2626` | Validation errors, destructive action labels | Regular text |
| `color.text.success` | `#16a34a` | Confirmation messages, met-goal indicators | Neutral labels |

#### Border Colours

| Token | Value | Usage | Avoid |
|---|---|---|---|
| `color.border.default` | `rgba(10,10,10,0.06)` | Default card borders, list dividers, input borders | Focus states |
| `color.border.strong` | `rgba(10,10,10,0.12)` | Hovered card borders, active input borders | Default resting state |
| `color.border.focus` | `#000000` | Focused input ring, selected item outline | General borders |
| `color.border.error` | `#dc2626` | Invalid input borders | Non-error contexts |
| `color.border.divider` | `rgba(10,10,10,0.05)` | Row dividers inside lists, section dividers | Card outlines |

#### Primary / Action Colours

| Token | Value | Usage | Avoid |
|---|---|---|---|
| `color.action.primary` | `#000000` | Primary CTA button background, filled progress arcs, streak counter, "meal due" accent | Secondary buttons, icons, informational colour |
| `color.action.primary.hover` | `#1a1a1a` | Primary button hover/pressed state | Resting buttons |
| `color.action.primary.subtle` | `rgba(0, 0, 0, 0.08)` | Tinted card backgrounds for active states, selected row highlight | Anything requiring strong black |
| `color.action.secondary` | `#ffffff` | Secondary button background | Primary CTAs |
| `color.action.secondary.border` | `rgba(10,10,10,0.15)` | Secondary button border | Primary button borders |

#### Data / Chart Colours

| Token | Value | Usage | Avoid |
|---|---|---|---|
| `color.data.calories` | `#000000` | Calorie ring fill, calorie bar in charts | UI action elements |
| `color.data.protein` | `#2563eb` | Protein ring fill, protein bar in charts | UI action elements |
| `color.data.carbs` | `#d97706` | Carbs ring fill (progress page only) | Primary UI |
| `color.data.fat` | `#7c3aed` | Fat ring fill (progress page only) | Primary UI |
| `color.data.track` | `rgba(10,10,10,0.07)` | Progress ring backgrounds, bar chart backgrounds | Filled data states |
| `color.data.volume` | `#0ea5e9` | Workout volume bars in progress chart | Nutrition data |

#### Semantic State Colours

| Token | Value | Usage | Avoid |
|---|---|---|---|
| `color.state.success` | `#16a34a` | Logged meal checkmarks, streak intact, goal met | Active/primary actions |
| `color.state.success.bg` | `#f0fdf4` | Success toast background, logged meal row tint | Large background areas |
| `color.state.warning` | `#d97706` | Macro slightly under target, upcoming deadline | Primary actions |
| `color.state.warning.bg` | `#fffbeb` | Warning banner background | Large background areas |
| `color.state.error` | `#dc2626` | API failure, validation error, streak broken | Active actions |
| `color.state.error.bg` | `#fef2f2` | Error toast background, skipped meal row tint | Large background areas |
| `color.state.skipped` | `#9a9a98` | Skipped meal slot, cancelled workout | Active or logged states |
| `color.state.disabled` | `#c4c4c2` | Disabled controls, locked plan items | Active controls |

---

### Typography Tokens

**Font families:**
- Body / UI: `Google Sans Flex` — all labels, headings, copy, button text, nav
- Numbers / Data: `Google Sans Mono` — all quantitative values: macros, weights, reps, durations, dates in tables

**Fallback stack:**
- Sans: `"Google Sans Flex", "Google Sans", "Google Sans Text", "Product Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
- Mono: `"Google Sans Mono", "Roboto Mono", "SFMono-Regular", Consolas, "Liberation Mono", "Courier New", monospace`

#### Type Scale

| Token | Size | Line Height | Weight | Letter Spacing | Usage |
|---|---|---|---|---|---|
| `type.display` | 40px | 44px | 700 | -0.5px | Hero stat numbers on Today screen (e.g., streaks, daily calorie total displayed large) |
| `type.largeTitle` | 32px | 36px | 700 | -0.3px | Screen titles on feature-focused pages (e.g., "Progress") |
| `type.title` | 24px | 28px | 600 | -0.2px | Card section titles, modal titles, plan week header |
| `type.heading` | 17px | 22px | 600 | 0px | In-card headings, list section labels (sentence case), workout names |
| `type.body` | 15px | 22px | 400 | 0px | Primary body copy, list item primary labels, descriptions |
| `type.bodyStrong` | 15px | 22px | 600 | 0px | Emphasised body content, meal names in timeline, exercise names |
| `type.bodySmall` | 13px | 18px | 400 | 0px | Secondary list item labels, meta information, ingredient lists |
| `type.caption` | 12px | 16px | 500 | 0.4px | Section headers (ALL CAPS), nav tab labels, pill/chip labels |
| `type.label` | 11px | 14px | 500 | 0.6px | ALLCAPS section group headers ("ACTIVITY", "NUTRITION") |
| `type.button` | 16px | 20px | 600 | 0px | All button text, primary and secondary |
| `type.buttonSmall` | 14px | 18px | 600 | 0px | Small inline action buttons ("Swap", "Skip") |

#### Numeric Type Scale (Google Sans Mono)

| Token | Size | Weight | Usage |
|---|---|---|---|
| `type.num.hero` | 40px | 700 | Today screen streak counter, total calories consumed large display |
| `type.num.large` | 28px | 600 | Primary stat in a metric card (e.g., "2,325" steps, "720 cal") |
| `type.num.medium` | 20px | 600 | Secondary stats, macro ring labels |
| `type.num.body` | 15px | 500 | Inline numbers within copy ("52g protein"), times, dates in lists |
| `type.num.small` | 13px | 400 | Set/rep notation ("3 × 8"), weights in exercise rows |
| `type.num.caption` | 11px | 400 | Chart axis labels, timestamps in notification logs |

---

### Spacing Tokens

Base unit: **4px**. All spacing is a multiple of 4.

| Token | Value | Usage |
|---|---|---|
| `space.1` | 4px | Icon-to-label gap, micro adjustments, badge positioning |
| `space.2` | 8px | Between an icon and its text label, within a chip, between stacked labels |
| `space.3` | 12px | Between a section header and its first item, tighter card padding contexts |
| `space.4` | 16px | Standard horizontal page margin, standard card padding, input vertical padding |
| `space.5` | 20px | Between items in a vertical form, between a title and its subtitle |
| `space.6` | 24px | Section gap (between groups of cards), between major card sections |
| `space.8` | 32px | Large section gap, between page header and first content, generous card padding |
| `space.10` | 40px | Screen top padding (below nav), large modal internal padding |
| `space.12` | 48px | Bottom safe area minimum, FAB clearance from bottom nav |
| `space.16` | 64px | Hero section vertical breathing room |

**Default layout rhythm:**
- Horizontal page padding: `space.4` (16px) on both sides
- Between card groups: `space.6` (24px)
- Between page header and first card: `space.8` (32px)
- Card internal padding: `space.4` (16px)
- Bottom nav height: 56px + safe area inset

---

### Radius Tokens

| Token | Value | Usage |
|---|---|---|
| `radius.sm` | 4px | Small controls: checkboxes, toggle track, tiny badges |
| `radius.md` | 6px | Input fields, dropdown menus, filter chips, tag pills |
| `radius.lg` | 8px | Cards, list group containers, image thumbnails |
| `radius.xl` | 12px | Bottom sheet top corners, large modal corners |
| `radius.pill` | 100px | Primary CTA buttons, segmented control containers |
| `radius.full` | 9999px | Avatars, circular progress rings container, icon badges |

---

### Shadow and Elevation Tokens

Forge uses flat design. Shadows are minimal and purposeful.

| Token | Value | Usage |
|---|---|---|
| `shadow.none` | `none` | All cards, all list rows, all inline components |
| `shadow.subtle` | `0 1px 3px rgba(0,0,0,0.06)` | Floating action button resting state, autocomplete dropdown |
| `shadow.floating` | `0 4px 12px rgba(0,0,0,0.10)` | FAB hover state, tooltip |
| `shadow.modal` | `0 8px 32px rgba(0,0,0,0.12)` | Modal cards, bottom sheet |
| `shadow.overlay` | `rgba(10,10,10,0.50)` background | Backdrop behind modals and bottom sheets — not a box-shadow |

**Rule:** If you reach for `box-shadow` on a card, stop. Use a border instead.

---

### Border Tokens

| Token | Value | Usage |
|---|---|---|
| `border.default` | `1px solid rgba(10,10,10,0.06)` | Cards, input resting state, list containers |
| `border.strong` | `1px solid rgba(10,10,10,0.12)` | Hover state on cards, active input |
| `border.focus` | `1px solid #000000` | Focused input field ring |
| `border.error` | `1px solid #dc2626` | Invalid input field |
| `border.divider` | `1px solid rgba(10,10,10,0.05)` | Row dividers inside a list, section breaks |
| `border.selected` | `1px solid #000000` | Selected card, selected option |

---

### Icon Tokens

**Style:** Outline (stroke) icons by default. Filled icons for active/selected states only.

| Token | Value | Usage |
|---|---|---|
| `icon.size.sm` | 16px | Inline contextual icons (meta labels: "· 21 min · Workout") |
| `icon.size.md` | 20px | List row icons, nav tab icons |
| `icon.size.lg` | 24px | Card header icons, action icons in headers |
| `icon.size.xl` | 32px | Feature section icon in an illustrated card |
| `icon.size.hero` | 48px | Empty state illustration icons |
| `icon.stroke` | 1.5px | Standard stroke weight for all outline icons |
| `icon.stroke.bold` | 2px | Active nav tab icons, strong emphasis |

**Filled vs. Outline rules:**
- Bottom nav: outline when inactive, filled when active tab
- Checkmarks / completion: always filled
- Metric ring icons (food, flame, steps): outline only, coloured with their data token
- Action icons (back arrow, close X, edit pencil): always outline

**Recommended icon set:** Lucide React — consistent stroke weight, MIT licensed, tree-shakeable.

---

### Motion Tokens

| Token | Duration | Easing | Usage |
|---|---|---|---|
| `motion.fast` | 100ms | `ease-out` | Button press feedback, checkbox state flip, row tap highlight |
| `motion.standard` | 150ms | `ease-out` | Progress ring fill, card border on hover, tab switch |
| `motion.slow` | 250ms | `ease-in-out` | Bottom sheet slide up/down, modal fade in/out |
| `motion.deliberate` | 400ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Streak counter number increment (spring feel) |
| `motion.confetti` | 600ms | Natural physics | Confetti burst on meal log streak increment — one time only |

**Motion rules:**
- Default for all interactive state changes: `motion.standard` (150ms ease-out)
- Never animate layout shifts that affect scrollable content
- Respect `prefers-reduced-motion`: all animations collapse to instant state changes
- Do not use enter/exit animations on page navigation in v1 — the content change is the signal

---

## 4. Layout System

### Safe Areas

- Honour iOS safe area insets via CSS `env(safe-area-inset-*)`.
- Top: content starts below the status bar + `env(safe-area-inset-top)`.
- Bottom: bottom nav sits above `env(safe-area-inset-bottom)` — the nav itself is 56px, the safe area is added on top of that.
- Horizontal: The 16px page margin is applied *inside* the safe area, not in addition to it.

```css
/* Pattern */
padding-top: calc(env(safe-area-inset-top) + 0px);
padding-bottom: calc(env(safe-area-inset-bottom) + 56px); /* 56px = nav height */
padding-left: max(16px, env(safe-area-inset-left));
padding-right: max(16px, env(safe-area-inset-right));
```

### Page Padding

- Horizontal margin: **16px** on both sides — applied to all screen containers
- Vertical top padding: **16px** below the navigation header
- Vertical bottom padding: **24px** above the bottom navigation, plus the nav height

### Section Spacing

- Between named sections (e.g., "Activity" → "Nutrition"): **24px**
- Between a section label and the first card below it: **8px**
- Between cards within the same section: **8px** (they're siblings in a group)
- Between the page header and the first section: **20px**

### Card Spacing

- Card internal padding: **16px** on all sides
- Between a card title and its data: **8px**
- Between data rows inside a card: **0px** (separated by a 1px divider only)
- When a card contains action buttons at the bottom: add **12px** above the button row

### Header Spacing

Screen headers follow a consistent pattern:

```
[← Back or Cancel]  [Centered Title]  [Action or blank]
```

- Header height: **52px** (touch target + visual weight)
- Horizontal padding matches page: **16px**
- Title: `type.heading` weight 600, centered
- Left action: text button ("Back", "Cancel") or icon (chevron-left, X)
- Right action: text button ("Save", "Done") using `color.text.accent` or muted if disabled

### Bottom Navigation

- Fixed to the bottom of the viewport
- Height: **56px** + `env(safe-area-inset-bottom)`
- Background: `color.surface.default` (#ffffff)
- Top border: `border.divider`
- Items: 4 (Today, Plan, Progress, Log)
- Each item: icon (20px) centred above label (11px, `type.caption`)
- Active: icon is filled, label is `color.text.accent`, icon uses `color.action.primary`
- Inactive: icon is outline, both icon and label use `color.text.tertiary`

### Scroll Behaviour

- All screens are vertically scrollable by default
- The bottom navigation is sticky (fixed)
- Section headers within a scrollable list are **not** sticky (v1)
- The Today screen's "next action" hero card is the first visible element and does not scroll behind a header
- Charts on the Progress screen: horizontal scroll within a fixed-height container, chevron indicators show more content is available
- Lists of 10+ items: no pagination in v1 — scroll to end

### Sticky Elements

- Bottom navigation: always fixed
- The "Ate it / Swap / Skip" action row on the Today next-action card: stays visible as long as the meal is unlogged (not sticky to the viewport — it scrolls with the card)
- Form action buttons (Save, Confirm): fixed to the bottom of the screen above the safe area, separated from scrollable content with a subtle border

### Maximum Content Width

- This is a mobile PWA. Max content width is the device width.
- On tablet or wider desktop (if ever opened): constrain to **430px** centred. Beyond this width the design has not been optimised and layout may appear stretched.

---

## 5. Component Library

---

### App Shell

#### Screen Container

**Purpose:** Wraps every screen. Handles safe areas, background, scroll context.

**Anatomy:**
```
<ScreenContainer>
  <Header /> (optional — not all screens have one)
  <ScrollArea>
    {children}
  </ScrollArea>
  <BottomNav />
</ScreenContainer>
```

**Rules:**
- Background: `color.bg.primary` (#fafaf9) on all screens
- Scrollable area accounts for header height above and nav height + safe area below
- Never use `overflow: hidden` on the root container

---

#### Top Navigation Header

**Purpose:** Screen-level header with title and contextual actions.

**Variants:**
1. **Back nav** — left: `← Back`, centre: title, right: optional action
2. **Modal nav** — left: `Cancel`, centre: title, right: `Save` / `Done`
3. **Home nav** — no back button, title aligned left with page title style, right: optional icon

**States:** Default, right-action disabled (greyed text, not tappable)

**Behaviour:**
- Tapping "Back" performs a pop navigation (no confirmation unless unsaved changes exist)
- Tapping "Cancel" on a modal/form nav discards changes — if changes exist, show inline confirmation (not a dialog for v1)

**Token usage:**
- Background: `color.surface.default`
- Border-bottom: `border.divider`
- Title: `type.heading`, `color.text.primary`
- Back/Cancel: `type.body`, `color.text.secondary`
- Active right action: `type.bodyStrong`, `color.text.accent`
- Disabled right action: `type.body`, `color.text.disabled`

**Do:**
- Keep titles to 2–3 words max
- Use "Cancel" for modals, "← Back" for nested navigation

**Don't:**
- Don't show a back arrow and a cancel simultaneously
- Don't use `color.action.primary` for the header background

---

#### Bottom Navigation

**Purpose:** Primary navigation between the four main areas of the app.

**Items:** Today · Plan · Progress · Log

**Anatomy per item:**
```
[Icon 20px]
[Label 11px, type.caption]
```

**States:** Active (filled icon, black label), Inactive (outline icon, tertiary label), Pressed (bg.tertiary flash 100ms)

**Token usage:**
- Background: `color.surface.default`
- Top border: `border.divider`
- Active icon: `color.action.primary`
- Active label: `color.text.accent`
- Inactive icon & label: `color.text.disabled`

**Accessibility:** Each tab has `aria-label` + `aria-current="page"` when active. Touch target is the full column width × 56px height.

---

### Buttons

#### Primary Button

**Purpose:** The single most important action on a screen. One per screen.

**Anatomy:** Full-width pill, centred label

**States:** Default, Hover (darker fill), Pressed (scale 0.98, 100ms), Disabled (opacity 0.4), Loading (label replaced with spinner)

**Specs:**
- Height: **52px**
- Border-radius: `radius.pill` (100px)
- Background: `color.action.primary` (#000000)
- Text: `type.button`, `color.text.inverse`
- Padding: 0 24px (pill shape distributes this)
- Margin: Applied externally — buttons themselves have no margin

**Behaviour:**
- Tapping fires the action immediately. No double-tap, no hold.
- Loading state: label text replaced by a 20px spinner (white), button remains disabled while in-flight
- Error state: button returns to default state with an error toast below

**Do:** One primary button per screen. Position at the bottom of the form or page.
**Don't:** Don't use black background for secondary actions, navigation triggers, or destructive actions.

---

#### Secondary Button

**Purpose:** Alternative action when a primary button is present, or the sole action when it's reversible/low stakes.

**Specs:**
- Same height/radius as primary
- Background: `color.action.secondary` (#ffffff)
- Border: `border.strong` (1px, rgba(10,10,10,0.12))
- Text: `type.button`, `color.text.primary`
- Hover: border becomes `border.strong` + background tints to `color.bg.secondary`

**Do:** Use for "Cancel", "Skip this week", "View all"
**Don't:** Don't use as the only button when a primary action exists

---

#### Tertiary / Text Button

**Purpose:** Low-prominence actions, typically inline or in footers.

**Specs:**
- No background, no border
- Text: `type.body` or `type.bodySmall`, `color.text.accent`
- Underline: none by default, appears on hover/focus
- Touch target: min 44px height achieved via padding

**Do:** Use for "Learn more", "See all", "Shop Fitbit Products"-style secondary navigation links
**Don't:** Don't use tertiary buttons for primary or destructive actions

---

#### Destructive Button

**Purpose:** Irreversible actions — delete a meal log, clear a week's plan.

**Specs:**
- Same dimensions as secondary button
- Text: `color.state.error` (#dc2626)
- Border: `1px solid rgba(220,38,38,0.20)`
- Background: white by default, `color.state.error.bg` on hover

**Behaviour:** Always requires a second tap confirmation via an inline inline confirmation row (not a dialog in most cases). Pattern: first tap turns the button into a "Confirm delete" state in-place; second tap executes.

---

#### Small Inline Action Buttons

**Purpose:** The "Ate it", "Swap", "Skip" buttons on the Today screen's next-meal card. Compact, tappable, horizontally arranged.

**Specs:**
- Height: **36px**
- Border-radius: `radius.md` (6px)
- "Ate it": Background `color.action.primary`, text `color.text.inverse` — `type.buttonSmall`
- "Swap": Background `color.surface.sunken`, border `border.default`, text `color.text.primary` — `type.buttonSmall`
- "Skip": No background, text `color.text.tertiary` — `type.buttonSmall`
- Horizontal arrangement: `gap.space.2` (8px) between buttons
- "Ate it" stretches to fill remaining space; "Swap" and "Skip" are fixed-width

---

#### Icon Button

**Purpose:** Navigation actions, close buttons, edit triggers where text would be too heavy.

**Specs:**
- Size: **40px × 40px** (touch target)
- Icon inside: 20px
- Background: transparent
- Hover: `color.bg.secondary`
- Border-radius: `radius.md`

---

#### Floating Action Button (FAB)

**Purpose:** Quick log shortcut (the `+` button visible on the Today screen — "log something now").

**Specs:**
- Size: **52px × 52px**
- Border-radius: `radius.full`
- Background: `color.action.primary`
- Icon: `+` (24px, white)
- Position: fixed, bottom-right, `16px` from right edge, `16px` above bottom nav
- Shadow: `shadow.subtle`
- Hover: `shadow.floating` + background darkens to `color.action.primary.hover`

---

### Inputs

#### Text Input

**Purpose:** Free text entry — meal names, notes, search queries.

**Anatomy:**
```
[Label — above]
[Input field — full width]
[Helper text or error — below]
```

**Specs:**
- Height: **52px**
- Background: `color.surface.default`
- Border: `border.default`
- Border-radius: `radius.md` (6px)
- Padding: `space.4` (16px) horizontal, vertically centred
- Label: `type.bodySmall`, `color.text.secondary`, 4px above field
- Placeholder: `color.text.tertiary`
- Active border: `border.strong`
- Focus ring: `border.focus` (black, 1px)
- Error border: `border.error`
- Error message: `type.bodySmall`, `color.text.error`, 4px below field
- Clear button (X): appears inside field when value exists, 16px icon, taps to clear

**States:** Empty, Focused, Filled, Error, Disabled (background `color.surface.sunken`, text `color.text.disabled`)

---

#### Search Input

**Purpose:** Filtering content — food search (custom log), exercise search (future).

**Specs:**
- Same dimensions as Text Input
- Leading icon: magnifying glass (20px, `color.text.tertiary`)
- Placeholder: "Search foods…" — neutral, not "Type to search"
- Results appear below in a floating dropdown (`shadow.modal`) or in an inline list on the same screen

---

#### Textarea

**Purpose:** Meal notes, custom meal description for AI macro estimation.

**Specs:**
- Min height: **96px** (4 lines)
- Max height: **200px** (auto-grows, then scrolls internally)
- Same border/background/padding as Text Input
- Character count shown bottom-right when near limit

---

#### Stepper (Number Picker)

**Purpose:** Setting numeric goals, logging weight, reps in exercise rows. Used where precision matters and a drum roll would be overkill.

**Anatomy:**
```
[Large central number — Google Sans Mono, type.num.hero or type.num.large]
[Subtext below number — e.g., "Days per week"]
[— button left]  [+ button right]
```

**Specs:**
- Button size: fills half-width each, height 56px
- Background: `color.surface.sunken`
- Border-radius: `radius.md`
- Divider between buttons: `border.divider`
- Number font: `type.num.large` (28px, Google Sans Mono, weight 600)
- Long-press: accelerates increment (repeat on hold)

---

#### Drum Roll Picker

**Purpose:** iOS-native style picker for time selection, serving size. Used only when a stepper would require too many taps (e.g., selecting a time from 00:00–23:45).

**Specs:**
- Rendered as 3 visible items
- Selected row: slightly elevated background (`color.bg.secondary`), `type.body` weight 600
- Adjacent rows: `color.text.tertiary`, slightly smaller (0.9 scale)
- Separator lines above and below selected row: `border.divider`
- Haptic on iOS: `UISelectionFeedbackGenerator` equivalent (handled by native; on PWA no haptic available)

---

#### Checkbox

- Size: **20px × 20px**
- Border-radius: `radius.sm` (4px)
- Unchecked: `color.surface.default`, `border.default`
- Checked: `color.action.primary` background, white checkmark icon
- Transition: `motion.fast` (100ms)

---

#### Toggle / Switch

- iOS-style capsule switch
- Width: 51px, height: 31px
- Active: `color.action.primary` track
- Inactive: `color.bg.tertiary` track
- Thumb: white circle, shadow.subtle
- Transition: `motion.standard` (150ms)

---

#### Segmented Control

**Purpose:** Switching between related views — Day/Week/Month/Year on Progress, filter tabs.

**Anatomy:**
```
[Pill container: bg.secondary, radius.pill]
  [Segment] [Segment*] [Segment]
```

**Specs:**
- Container: `color.bg.secondary`, `radius.pill`, height 36px
- Active segment: `color.surface.default`, `radius.pill`, `shadow.subtle`, `type.caption` weight 600
- Inactive segment: transparent, `type.caption`, `color.text.secondary`
- Minimum segment width: 60px
- Transition: `motion.standard`

---

### Content Components

#### Metric Card (Stat Card)

**Purpose:** Displays a single health/nutrition metric with a progress indicator. The primary building block of the Today screen.

**Anatomy:**
```
[Card — border, radius.lg, padding space.4]
  [Label — type.caption ALLCAPS, color.text.secondary]
  [Value — type.num.large, Google Sans Mono, color.text.primary]
  [Sublabel — type.bodySmall, color.text.secondary] ← e.g., "Today" or "vs 2,800 target"
  [Right side — circular progress ring, 44×44px]
```

**Variants:**
1. **Standard** — label, large number, sublabel, ring
2. **With trend** — adds a small 7-bar mini sparkline below the number
3. **Empty/not started** — number replaced with "Get started", sublabel replaced with "Tap to set up", ring is empty
4. **Loading** — skeleton: label rectangle, number rectangle, ring circle (animated `color.bg.secondary` pulse)

**Progress Ring:**
- Size: 44px × 44px
- Track colour: `color.data.track`
- Fill colour: based on metric type (`color.data.calories`, `color.data.protein`, etc.)
- Stroke width: 3px
- Filled icon in centre: 16px, matching fill colour
- Completes at 100% — does not overflow or show over-target visually in the ring (keep it clean)

**States:** Default, Hover (border lifts to `border.strong`), Loading, Error (ring replaced with "—"), Goal met (ring fully filled, no visual celebration on the card itself)

**Accessibility:** `aria-label="Calories: 1200 of 2800 target"` on the card element.

---

#### The Next Action Card

**Purpose:** The hero component of the Today screen. Always first. Answers "what now?"

**Anatomy:**
```
[Card — border.default, radius.lg, padding space.4]
  [Context label — "EAT IN 23 MIN" — type.label, color.action.primary]
  [Meal name — type.title, color.text.primary]
  [Macros row — "720 cal · 52g protein" — type.num.body, Google Sans Mono, color.text.secondary]
  [Action row — [Ate it ←primary] [Swap] [Skip] ]
```

**States:**
- **Upcoming** (> 30 min away): context label in `color.text.secondary` ("EAT AT 12:30")
- **Due soon** (< 30 min): context label in `color.action.primary` black ("EAT IN 23 MIN")
- **Overdue** (past meal time, not logged): left border accent `color.state.error`, label "OVERDUE — LOG NOW"
- **Logged**: card collapses to a smaller confirmed state with a green check — next meal slides up
- **Skipped**: card shows "Skipped" label, muted styling, next meal shows immediately below
- **No plan today**: replaced with a prompt card to generate a plan

**Behaviour:**
- "Ate it": immediate optimistic update. Card collapses with a tick animation. Streak counter increments if applicable.
- "Swap": opens bottom sheet with 2–3 AI-suggested alternatives with similar macros
- "Skip": inline confirmation ("Skip this meal?") + [Confirm skip] [Keep it] — no dialog

---

#### Meal Timeline

**Purpose:** Shows all 5 meal slots for the day with status.

**Anatomy per row:**
```
[Time — type.num.caption, color.text.tertiary]
[Status dot — 8px circle]
[Meal name — type.bodyStrong, color.text.primary]
[Macros — type.bodySmall, color.text.secondary]
[Status label — "Eaten" / "Upcoming" / "Skipped"]
```

**Status dot colours:**
- Eaten: `color.state.success` (green)
- Upcoming: `color.text.disabled` (light gray ring)
- Due soon: `color.action.primary` (black, pulsing if overdue)
- Skipped: `color.state.skipped` (gray filled)

**Behaviour:** Tapping a logged meal row opens its detail (macros breakdown). Tapping an upcoming row opens the meal detail with log options.

---

#### Card

**Purpose:** Container for grouped content. The base card.

**Specs:**
- Background: `color.surface.default`
- Border: `border.default`
- Border-radius: `radius.lg` (8px)
- Padding: `space.4` (16px)
- No shadow

**Variants:**
- **Standard card**: full border, internal padding
- **List card**: contains multiple rows separated by `border.divider` — no padding on the container, rows have their own horizontal padding
- **Tinted card**: background uses `color.action.primary.subtle` for "active" or highlighted context (e.g., today's workout card when a session is in progress)

---

#### List Item / Row

**Purpose:** The fundamental unit for settings, selectable options, navigation rows, and data lists.

**Anatomy:**
```
[16px padding left]
[Leading icon OR avatar — optional, 20px]
[8px gap]
[Primary label — type.body, color.text.primary]
  [Secondary label — type.bodySmall, color.text.secondary — below primary]
[Auto flex spacer]
[Trailing value — type.body, color.text.secondary — OR]
[Trailing chevron — 16px, color.text.tertiary]
[16px padding right]
```

**Height:**
- Single line (label only): **52px**
- Two lines (label + sublabel): **68px**

**States:**
- Default: transparent background
- Pressed: `color.bg.secondary` background (100ms flash)
- Disabled: all text at `color.text.disabled`, no press state
- Selected (radio style): trailing checkmark in `color.action.primary`

**Dividers:** `border.divider` between rows, full width (not inset). Omit after the last row in a group.

---

#### Section Header

**Purpose:** Labels a group of cards or list items.

**Anatomy:**
```
[Label — ALL CAPS, type.label, color.text.secondary, letter-spacing 0.6px]
[Optional "See all" link — type.bodySmall, color.text.accent, right-aligned]
```

**Spacing:**
- Top margin (from previous card): `space.6` (24px)
- Bottom margin (to first card): `space.2` (8px)
- Horizontal: standard page margin (16px)

---

#### Workout Card

**Purpose:** Shows today's workout on the Today screen. Collapsible.

**Collapsed anatomy:**
```
[Card]
  [Left: "PUSH DAY" — type.label, color.text.secondary]
  [Left: "Chest, Shoulders, Triceps" — type.bodyStrong]
  [Left: "6 exercises · est. 52 min" — type.bodySmall]
  [Right: chevron-down 20px]
```

**Expanded anatomy:**
```
[Card]
  [Header — same as collapsed + chevron-up]
  [Exercise list — rows]
    [Exercise name — type.bodyStrong]
    [Target — "3 × 8 @ 80kg" — type.num.small, Google Sans Mono]
    [Log row — set inputs inline]
  [Complete workout button — secondary, full width, inside card]
```

**States:** Collapsed, Expanded, In progress (tinted card background), Completed (green check, "Completed · 45 min" sublabel)

---

#### Macro Rings

**Purpose:** Shows daily calorie and protein progress against target. Used on the Today screen.

**Anatomy:**
```
[Container — flex row, gap space.6]
  [Ring 1: Calories]
    [SVG ring — 72px × 72px]
    [Centre label — icon + value in Google Sans Mono]
  [Between rings: vertical separator — border.divider, height 40px]
  [Ring 2: Protein]
    [SVG ring — 72px × 72px]
  [Right: stack of text labels]
    ["2,340 / 2,800 cal" — type.num.body, Google Sans Mono]
    ["89 / 168g protein" — type.num.body, Google Sans Mono]
```

**Ring colours:**
- Calories: fill `color.data.calories` (#000000)
- Protein: fill `color.data.protein` (#2563eb)
- Both tracks: `color.data.track`

**Behaviour:** On first load, rings animate from 0 to current value over 400ms (only once per session — cached in component state).

---

#### Streak Counter

**Purpose:** Shows consecutive days with no skipped meals. The single celebratory element.

**Anatomy:**
```
[Inline row in Today header]
  [🔥 emoji — only permitted emoji in the app]
  [Number — type.num.medium, Google Sans Mono, color.text.accent]
  [" day streak" — type.body, color.text.secondary]
```

**Behaviour:** When a meal is logged and the streak increments, the number animates from old → new (spring easing, `motion.deliberate` 400ms) + confetti burst fires once (600ms) then stops.

**Zero state:** Shows "Start your streak" in `type.body`, `color.text.tertiary`. No emoji at zero.

---

#### Empty State

**Purpose:** Communicates that a list or section has no data, with a clear path forward.

**Anatomy:**
```
[Container — centred, padding space.8 top/bottom]
  [Icon — 48px, color.text.disabled, outline stroke]
  [space.3 gap]
  [Heading — type.heading, color.text.secondary]
  [space.2 gap]
  [Body — type.body, color.text.tertiary, max 2 lines, centred]
  [space.6 gap]
  [CTA button — secondary or primary depending on context]
```

**Rules:**
- Always include an icon from the domain (fork for meals, dumbbell for workouts)
- Copy is instructive, not motivational — "No meals planned for today. Generate this week's plan." not "Wow, so empty here! 🥺"
- CTA is optional for read-only contexts (e.g., no workout data exists yet)

---

#### Badge

**Purpose:** Numeric indicator for notification counts, unread items.

**Specs:**
- Size: 18px diameter for single digits, extends horizontally for 2+ digits
- Background: `color.state.error` (red)
- Text: `type.label`, white, weight 600
- Position: top-right of parent icon, offset (-4px, -4px)
- Border: 2px white (to separate from icon background)

---

#### Tag / Chip

**Purpose:** Metadata labels (cuisine type, workout split, meal slot), filter pills.

**Variants:**
1. **Static tag** — read-only label (e.g., "Nigerian", "Push Day")
2. **Filter chip** — toggleable, shows active state

**Specs:**
- Height: **28px**
- Padding: 0 10px
- Border-radius: `radius.md` (6px)
- Font: `type.caption`
- Static: background `color.bg.secondary`, text `color.text.secondary`, no border
- Filter inactive: background transparent, border `border.default`, text `color.text.secondary`
- Filter active: background `color.action.primary.subtle`, border `color.action.primary` 1px, text `color.text.accent`

---

#### Progress Bar (Linear)

**Purpose:** Week-level completion (e.g., "4 of 5 exercise days this week").

**Specs:**
- Height: **6px**
- Border-radius: `radius.pill`
- Track: `color.data.track`
- Fill: `color.action.primary`
- Animate on mount: fill from 0 → current value, `motion.slow` (250ms)

---

#### Skeleton Loader

**Purpose:** Placeholder for content while data loads.

**Pattern:**
- Replaces text lines, card shapes, progress rings with animated rectangles/circles
- Shape matches the component it's replacing (same height, approximate width)
- Animation: opacity pulse between `color.bg.secondary` and `color.bg.tertiary`, `motion.slow` cycle on a 1.5s loop
- Never show a skeleton for longer than 3 seconds — show an error state if data hasn't arrived

---

### Feedback Components

#### Toast

**Purpose:** Brief confirmation of an action. Appears at the top of the screen for 3 seconds then dismisses.

**Anatomy:**
```
[Container — centred horizontally, fixed top (below status bar), border, radius.lg]
  [Leading icon — 16px, coloured by type]
  [Message — type.body, color.text.primary]
  [Optional dismiss X]
```

**Variants:**
- **Success** (meal logged, weight saved): `color.state.success.bg` background, `color.state.success` icon
- **Error** (API failure): `color.state.error.bg` background, `color.state.error` icon
- **Neutral** (informational): `color.surface.default`, `border.default`

**Rules:**
- One toast at a time. Queue additional toasts, don't stack.
- No toast for routine, expected success (e.g., don't toast "Saved" on every keystroke)
- Max 2 lines of text. If more context is needed, use a Banner.
- Auto-dismiss: 3 seconds. Swipe up to dismiss manually.

---

#### Loading Spinner

**Purpose:** Indicates an in-progress async operation.

**Variants:**
- **Inline** (inside a button): 20px, white, replaces button label text
- **Page** (full-screen load, rare): 32px, `color.action.primary`, centred in viewport
- **Card** (loading card content): 24px, `color.text.tertiary`, centred in card

**Do not:** Show a page spinner for anything that should be covered by a skeleton loader.

---

#### Error State

**Purpose:** Full card or screen-level communication of a failed operation.

**Anatomy:**
```
[Error icon — 32px, color.state.error]
[Heading — type.heading, "Something went wrong"]
[Body — type.body, specific error context — 1–2 sentences]
[Retry button — secondary]
```

**Rules:**
- Always offer a way to retry
- Surface the error message from the API if it's user-interpretable. Otherwise: "We couldn't load your meals. Check your connection and try again."
- Do not use toast for errors that require user action to resolve

---

### Overlays

#### Modal (Dialog)

**Purpose:** Confirmations, destructive action warnings, brief informational contexts that don't warrant a full screen.

**Anatomy:**
```
[Backdrop — color.surface.overlay]
[Modal card — color.surface.raised, radius.xl, padding space.8, width calc(100% - 64px), max-width 360px]
  [Title — type.title, color.text.primary]
  [space.3 gap]
  [Body — type.body, color.text.secondary]
  [space.6 gap]
  [Button row — stacked vertically: primary action on top, secondary below]
  [Optional dismiss X — top right, icon button]
```

**Animation:** Fade in backdrop + scale up card from 0.95 → 1.0 in `motion.slow` (250ms).

**Rules:**
- Use modals sparingly — only for truly interruptive decisions (destructive action confirmation, rare permissions)
- Buttons are always stacked vertically, never side-by-side (prevents thumb ambiguity)
- Modal disappears on backdrop tap unless the action is destructive

---

#### Bottom Sheet

**Purpose:** Action sheets, AI suggestions (Swap alternatives), date/time pickers, log customisation.

**Anatomy:**
```
[Backdrop — color.surface.overlay]
[Sheet — color.surface.raised, radius.xl top-only, min-height 40vh]
  [Drag handle — 4px × 32px, color.bg.tertiary, centred, 12px from top]
  [Header (optional) — type.heading, 16px top padding]
  [Content — scrollable if needed]
  [Action area — fixed, separated by border.divider if scrollable]
```

**Animation:** Slides up from the bottom in `motion.slow` (250ms). Dismisses by dragging down or tapping backdrop.

**Rules:**
- Drag handle always present
- Content inside should not have horizontal page margins — the sheet provides them
- Maximum height: 85vh. If content needs more space, consider a full navigation push instead

---

#### Action Sheet

**Purpose:** Presenting a short list of contextual actions (e.g., long-press on a meal slot).

**Anatomy:** Bottom sheet with no header, just a list of action rows followed by a "Cancel" row.

**Specs:**
- Each action: full-width row, 52px, `type.body` centred text
- Destructive action: `color.text.error`
- Cancel: always last, separated by `space.4` gap, `type.body` weight 600

---

### Navigation Components

#### Tab Bar — see Bottom Navigation above

#### Horizontal Filter Tabs

**Purpose:** Category browsing within a screen (e.g., workout categories, meal plan days).

**Anatomy:**
```
[Horizontal scroll container — no scrollbar visible]
  [Tab pill] [Tab pill*] [Tab pill] [Tab pill]
```

**Specs:**
- Pill height: **32px**
- Padding: 0 14px
- Border-radius: `radius.pill`
- Active: `color.surface.default` background, `border.default` border, `type.caption` weight 600, `color.text.primary`
- Inactive: transparent, `type.caption`, `color.text.secondary`
- Scrollable row: `padding-left: 16px` to align with page, `padding-right: 16px`
- First active tab is always visible on load (no scroll-into-view animation needed)

---

## 6. Screen Patterns

### Today Screen (Home / Dashboard)

**Purpose:** Answers "what do I eat next and what's my training today?"

**Layout structure (top to bottom, scrollable):**
```
[Page header — "Monday, 25 May" + streak counter right-aligned]
[space.5]
[Next Action Card — always first, full width]
[space.6]
[Macro Rings Card — calories + protein progress]
[space.6]
[Section header: "TODAY'S MEALS"]
[Meal Timeline — 5 rows in a list card]
[space.6]
[Section header: "WORKOUT" — only on training days]
[Workout Card — collapsible]
[space.6]
[Weight log widget — single row card: "Log today's weight" or last logged value]
[space.8]
[FAB — "+" for custom log, fixed bottom-right]
```

**Primary action:** "Ate it" on the Next Action Card
**Secondary action:** "Swap" on Next Action Card, "Log weight" widget
**State handling:**
- All meals logged for the day → Next Action Card replaced with a congratulatory card ("All meals logged · 2,840 cal consumed")
- No plan generated → Next Action Card replaced with empty state ("No plan for today. Generate this week's plan.")
- Loading: Skeleton for Next Action Card + Macro Rings; rest of content below fades in
- Workout rest day: Workout Card section omitted entirely

**Common mistakes to avoid:**
- Don't show yesterday's meals if today's aren't loaded yet
- Don't collapse the macro rings — they're always visible
- Don't show the FAB when the custom log form is open

---

### Plan Screen (Weekly Plan Review)

**Purpose:** Sunday ritual — review, edit, and confirm the AI-generated weekly plan.

**Layout structure:**
```
[Screen header — "This Week" + "Generate plan" button (right, only if no plan exists)]
[space.5]
[Week date strip — Mon 26 · Tue 27 · Wed 28 · (scrollable horizontal)]
[space.4]
[Selected day's meals — 5 card rows]
  [Each row: meal slot label, meal name, macros, "Swap" button]
[space.6]
[Workout strip — 7-day mini calendar showing push/pull/legs/rest]
[space.6]
[Confirm plan button — primary, full width, "Lock in this week's plan"]
```

**Primary action:** "Lock in this week's plan"
**Secondary action:** "Swap" on any individual meal, "Generate plan" in header
**State handling:**
- No plan yet: full-width card with "Plan your week" empty state + Generate button
- Plan generating (AI in flight): skeleton grid + progress banner "Generating your week…" with estimated time
- Plan locked (confirmed): Swap buttons hidden, "Locked" chip in header, edit still possible but requires explicit unlock

---

### Progress Screen

**Purpose:** Post-week review. Weight trend + adherence + workout volume.

**Layout structure:**
```
[Screen header — "Progress"]
[Segmented control — Week / Month / Year]
[space.6]
[Weight trend card]
  [7-day line chart]
  [Rolling average callout: "7-day avg: 74.2 kg"]
[space.6]
[Adherence card]
  [Section header: "MEAL ADHERENCE"]
  [Bar chart: 7 days, hit % per day]
  ["5 of 7 days on target" summary]
[space.6]
[Section header: "WORKOUT VOLUME"]
[Volume chart card — stacked bars by muscle group]
```

**Primary action:** None (read-only screen)
**State handling:**
- Less than 3 days of data: show a gentle empty state with instruction ("Log your meals for 3 days to see trends")
- Chart loading: skeleton rectangles matching chart shape
- Year view: monthly bars, not daily

**Common mistakes to avoid:**
- Don't show daily weight entries as individual spiky data points — show rolling average as the primary line, daily entries as muted dots
- Don't label every data point — let the chart breathe

---

### Log Screen (Quick Custom Entry)

**Purpose:** Log something you ate that wasn't planned, or a workout that deviated from the plan.

**Layout structure:**
```
[Screen header — "Log" + no right action]
[Tabs: "Meal" | "Workout" | "Weight"]
[space.4]
[Tab content]
  [Meal tab: text field "Describe what you ate", photo upload area, AI estimate card (shows after input)]
  [Workout tab: exercise search, add sets/reps form]
  [Weight tab: stepper + large number + "Log weight" button]
[space.6]
[Primary action button — "Save log" / "Estimate macros" depending on state]
```

**Primary action:** "Log meal" / "Save workout" / "Log weight"
**State handling:**
- AI estimating macros: loading state inside the estimate card ("Estimating…" with spinner)
- AI returns estimate: shows "~720 cal · ~52g protein (estimated)" with confidence indicator, "Looks right? Log it." primary button
- Upload in progress: progress indicator on photo area

---

### Empty Screen / Error Recovery

**Purpose:** Handles cases where data can't load or a first-time state is encountered.

**Layout:** Centred vertically and horizontally in the available screen space.

**Anatomy:**
```
[Icon — 48px, color.text.disabled]
[Heading — type.heading, color.text.secondary]
[Body — type.body, color.text.tertiary, max-width 260px, centred]
[Primary action — secondary button]
[Optional tertiary action — text link]
```

---

## 7. Interaction Rules

### Tap Feedback

- Every tappable element must have a visible press state (background change, opacity shift, or scale)
- Minimum press feedback duration: 100ms even if the action resolves faster
- Rows: background flash `color.bg.secondary` → transparent over 150ms
- Buttons: scale to 0.98 over 100ms on press, return to 1.0 on release
- Icon buttons: background circle expands to full touch-target size on press

### Pressed States

- Primary button: scale 0.98, darken background to `color.action.primary.hover`
- Secondary button: background tints to `color.bg.secondary`
- List row: background flashes `color.bg.secondary`
- Card: border opacity lifts to `border.strong`

### Loading Feedback

- Loading state appears within 16ms of the triggering action (effectively immediate)
- For actions < 300ms: no spinner needed — the result appears fast enough
- For actions 300ms–3s: show inline spinner in the button or card
- For actions > 3s (AI generation): show a named progress state ("Generating your meal plan…") with an estimated time

### Form Validation

- Validate on blur (when leaving a field), not on change
- Required field error appears immediately on blur if empty
- Submit-level errors appear as a banner above the submit button
- Fix indicators: errors clear the moment the user begins correcting them
- Never disable the submit button to prevent submission — let the user try, then show what's wrong

### Error Handling

- Network error: toast with retry button for read operations; form persists with error banner for write operations
- AI failure (after 2 retries): surface a card-level error with manual retry option — never silently fail
- Partial failure (some meals generated, some failed): show what was generated, flag the gaps explicitly

### Success Confirmation

- Meal logged: optimistic UI (immediate), toast confirms ("Breakfast logged") — 3 seconds
- Weight logged: value updates inline immediately, toast "Weight logged"
- Workout logged: exercise row shows completion state immediately
- Plan generated: navigate to plan screen with a success banner

### Navigation Transitions

- Push navigation: standard iOS-style horizontal slide (provided by Next.js/browser default)
- Modal overlay: fade + scale as defined in Motion tokens
- Bottom sheet: slide up
- Back navigation: slide right (standard back gesture)

### Modal and Bottom Sheet Behaviour

- Modals: backdrop tap dismisses unless the content has unsaved changes (in which case, do nothing — user must use Cancel)
- Bottom sheets: backdrop tap dismisses; downward drag dismisses once threshold (40% of sheet height) is passed
- Bottom sheet with form input: keyboard lifts the sheet above the keyboard (CSS `env(keyboard-inset-height)`)

### Destructive Action Confirmation

- Inline confirmation pattern — no dialog for most cases:
  1. Tap "Skip" → row shows inline "Skip this meal? [Confirm] [Cancel]" replacing the actions for 3 seconds
  2. If no action taken in 3 seconds, reverts to default
- Modal confirmation only for: deleting a week's plan, clearing all logs

### Haptic Feedback (PWA limitations)

- PWA on iOS: no programmatic haptic access — rely on visual feedback
- PWA on Android: `navigator.vibrate(10)` for success confirmations; `navigator.vibrate([10, 50, 10])` for errors
- Never use haptics for routine navigation taps

---

## 8. UX Writing Guidelines

### Voice and Tone

- **Direct, not chatty.** "Breakfast logged" not "Great job logging your breakfast! 🎉"
- **Personal, not broadcast.** This app has one user. Write as if speaking to that person, not a crowd.
- **Action-oriented.** Labels tell you what to do or what happened, not how to feel about it.
- **Metric-first.** Include the numbers whenever they add meaning. "Log 720 cal meal" beats "Log meal"

### Button Label Rules

- Primary actions: verb-first, specific. "Log breakfast" > "Submit" > "OK"
- Cancel actions: always "Cancel" (not "Nevermind", "Go back", "Abort")
- Destructive actions: state the consequence. "Skip meal" not "Confirm"
- Completion actions: "Save" for edits, "Done" for review screens, "Log it" for quick confirmations

| Good | Bad |
|---|---|
| "Ate it" | "Mark as consumed" |
| "Lock in plan" | "Save plan" |
| "Swap meal" | "Change this" |
| "Log 140 kg" | "Submit entry" |
| "Retry" | "Try again later" |
| "Generate plan" | "Create meal plan with AI" |

### Empty State Copy Rules

- State the fact first: "No meals planned for today."
- Then tell them what to do: "Generate this week's plan to get started."
- Never: emotional language ("looks so empty here!"), humour, emojis in empty states
- Keep body text to 1–2 sentences maximum

| Good | Bad |
|---|---|
| "No workout logged yet. Start a session from your plan." | "Looks like you haven't logged a workout! Time to get moving 💪" |
| "No data for this period." | "Hmm, nothing to show here yet!" |

### Error Message Rules

- Tell the user what happened and what to do next — both in one message
- Never: "An error occurred" alone (useless), error codes visible to the user
- For network errors: "Couldn't load your meals. Check your connection, then retry."
- For validation: specific to the field. "Weight must be between 30 and 300 kg."
- For AI failures: "Couldn't generate plan — Claude didn't return a valid response. Try again."

### Success Message Rules

- Short. 2–5 words. "Breakfast logged." "Weight saved." "Plan locked in."
- Include the key data point when space allows: "Breakfast logged · 540 cal"
- No congratulatory language for routine actions

### Notification Copy Rules (applicable to push notifications)

- Title: meal name only, no emoji. "Breakfast due in 15 min"
- Body: macros + call to action. "Jollof rice + grilled chicken · 720 cal · 52g protein. Tap [Ate it] to log."
- Escalation: "You haven't logged breakfast. Log it now or skip it."
- Morning briefing: "Today: 5 meals, 2,800 cal target. First meal at 08:00."
- Never: emoji in notification titles, vague subject ("You have a reminder")

---

## 9. Accessibility Rules

### Touch Targets

- Minimum touch target size: **44px × 44px** for all interactive elements
- Visual size can be smaller (e.g., a 20px icon) but the tap target must extend to 44px via padding
- For inline text links: min 44px height via line-height or padding

### Colour Contrast

- Normal text (`type.body`) on `color.bg.primary`: must meet **WCAG AA (4.5:1)**
- Large text (`type.title` and above): must meet **WCAG AA (3:1)**
- UI components (button borders, input borders): 3:1 against adjacent background
- Never rely on colour alone to convey state — always pair with an icon or text label (e.g., "Eaten" text, not just a green dot)

**Checked contrasts:**
- `color.text.primary` (#0a0a0a) on `color.bg.primary` (#fafaf9): ~18:1 ✓
- `color.text.secondary` (#5c5c5a) on `color.bg.primary`: ~6.5:1 ✓
- `color.text.accent` (#000000) on `color.surface.default` (#ffffff): ~6.45:1 ✓
- White text on `color.action.primary` (#000000): ~6.45:1 ✓

### Text Scaling

- All font sizes use `rem` units (not `px`) to respect the user's system font-size setting
- Layout must not break at iOS "Large Text" accessibility setting (effectively 1.2–1.4× scale)
- Number display cards should reflow to a smaller variant when text scale > 1.3

### Screen Reader Labels

- All icons that carry meaning must have `aria-label` or be accompanied by visible text
- Progress rings: `aria-label="Calories: 1,240 of 2,800 consumed"` on the SVG element
- Meal timeline rows: `aria-label="Breakfast · Jollof rice · Eaten at 08:14"`
- Bottom nav tabs: `aria-label` on each `<button>` — "Today", "Plan", "Progress", "Log"
- FAB: `aria-label="Log something"`

### Form Labels

- Every input must have an associated visible `<label>` (not just placeholder text)
- Placeholder text is supplementary, never the primary label
- Error messages are associated to their input via `aria-describedby`

### Focus States

- All interactive elements must show a visible focus ring on keyboard navigation
- Focus ring: `border.focus` (1px black) or equivalent high-contrast ring
- Do not use `outline: none` without providing an alternative focus indicator

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

All animations must degrade gracefully: state changes happen instantly, no movement-based feedback, confetti burst is suppressed.

---

## 10. Implementation Guidelines

### Tailwind v4 Token Wiring

Define all tokens in `app/globals.css` inside a `@theme` block:

```css
@theme {
  --color-bg-primary: #fafaf9;
  --color-bg-secondary: #f2f2f0;
  --color-surface-default: #ffffff;
  --color-text-primary: #0a0a0a;
  --color-text-secondary: #5c5c5a;
  --color-text-tertiary: #9a9a98;
  --color-text-accent: #000000;
  --color-action-primary: #000000;
  --color-action-primary-hover: #1a1a1a;
  --color-data-calories: #000000;
  --color-data-protein: #2563eb;
  --color-border-default: rgba(10, 10, 10, 0.06);
  --color-border-strong: rgba(10, 10, 10, 0.12);
  --font-sans: "Google Sans Flex", "Google Sans", "Google Sans Text", "Product Sans", system-ui, sans-serif;
  --font-mono: "Google Sans Mono", "Roboto Mono", monospace;
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-pill: 100px;
}
```

Reference tokens in Tailwind classes: `bg-[var(--color-bg-primary)]` or configure Tailwind's `theme.extend` to alias them.

### shadcn/ui Integration Rules

- shadcn components live in `components/ui/` — do not modify them directly
- Extend via wrapper components: `components/today/next-action-card.tsx` wraps a shadcn `Card` with its own variants
- Use shadcn's `cn()` utility for conditional class merging
- Override shadcn's default blue/gray palette in `globals.css` via its CSS variable contract (`--primary`, `--card`, etc.)
- Never reach for shadcn's default `Button` for primary CTAs — the pill shape and black colour require a custom variant

### Component Creation Rules

- Before creating a new component, check if an existing one can be extended with a variant
- New components require: all visual states defined (default, hover, pressed, disabled, loading, error), accessibility props, token-only values (no hardcoded hex or px)
- Component files over 200 lines: split into sub-components
- One component per file, named identically to the export

### Token Usage Rules

- **Never hardcode a hex colour** in a component. Reference a CSS variable or Tailwind token.
- **Never hardcode a pixel spacing value** outside the spacing scale. Use `space.4` (16px) not `p-[17px]`.
- **Never use a font-size not in the type scale.** If you need a new size, define it in the token system first.
- **Never invent a new accent colour.** If black doesn't work for the use case, question whether an accent is needed at all.
- Opacity variants of a colour (e.g., `color.action.primary.subtle`) are defined tokens, not ad-hoc `bg-black/10`.

### State Completeness Rule

Every interactive component must implement:
1. Default state
2. Hover state (on capable devices)
3. Pressed/active state
4. Focus state (keyboard accessible)
5. Disabled state
6. Loading state (if the component triggers async work)
7. Error state (if the component can fail)

Every data-displaying screen must implement:
1. Loading state (skeleton)
2. Empty state
3. Error state
4. Populated state

---

## 11. Do and Don't Rules

### Visual

| Do | Don't |
|---|---|
| Use `#fafaf9` as the page background | Use pure white `#ffffff` as the page background |
| Use 1px borders to define cards | Add drop shadows to cards |
| Use `#000000` black for the single primary action on a screen | Use black for icons, section headers, decorative elements |
| Use Google Sans Mono for every number that matters | Mix sans and mono arbitrarily |
| Keep border-radius consistent per component type | Use different radii on similar components within the same screen |
| Leave generous vertical space between sections (24–32px) | Stack sections with < 16px between them |
| Use ALL CAPS only for section header labels | Use ALL CAPS in body copy, headings, or buttons |
| Use muted secondary colours for metadata | Colour-code metadata with bright accent colours |

### UX

| Do | Don't |
|---|---|
| Log planned meals with one tap | Require a confirmation dialog for one-tap logging |
| Show the most important number at max size for its context | Equalise all numbers to the same size |
| Show skipped meals in the timeline (greyed) | Hide skipped meals from the timeline |
| Animate the streak counter when it increments | Animate every success state with confetti |
| Make "Ate it" the dominant CTA in every meal interaction | Make "Skip" as visually prominent as "Ate it" |
| Collapse the workout card by default | Show the full exercise list expanded on the Today screen |
| Use a bottom sheet for Swap suggestions | Navigate to a new screen for meal swap |

### Implementation

| Do | Don't |
|---|---|
| Reference CSS token variables for all colours | Hardcode hex values in component files |
| Use the defined spacing scale (`space.4`, `space.6`) | Use arbitrary pixel values (`p-[18px]`) |
| Wrap shadcn primitives rather than modifying them | Edit files inside `components/ui/` |
| Import `useLondonTime` for any date displayed to the user | Use `new Date()` in a component |
| Define Zod schemas for all API responses before using the data | Render unvalidated API data directly |
| Use skeleton loaders for all data-dependent content | Show a full-page spinner while data loads |
| Add `aria-label` to all icon-only interactive elements | Rely on `title` attributes for accessibility |

---

## 12. Design QA Checklist

Use this checklist before marking any screen as complete.

### Visual Hierarchy
- [ ] The most important element on the screen is visually dominant (size, weight, or position)
- [ ] Secondary content does not compete with primary content for attention
- [ ] Black (#000000) appears in at most one primary action per screen

### Spacing Consistency
- [ ] Horizontal page margin is 16px on both sides
- [ ] Gaps between card sections are 24px minimum
- [ ] No spacing values outside the defined token scale

### Typography Consistency
- [ ] All quantitative values use Google Sans Mono
- [ ] All labels, body, buttons use Google Sans Flex
- [ ] No font sizes outside the defined type scale
- [ ] Section headers use ALL CAPS with correct letter-spacing

### Component Reuse
- [ ] No one-off components when an existing component with a variant could be used
- [ ] Button variants are used correctly (primary for main action, secondary for alternatives)
- [ ] Card styles match the defined variants (standard, list, tinted)

### State Completeness
- [ ] Loading state is defined and implemented
- [ ] Empty state is defined and implemented (with appropriate copy and CTA)
- [ ] Error state is defined and implemented (with retry path)
- [ ] All interactive components show hover, pressed, and disabled states

### Accessibility
- [ ] All touch targets are minimum 44×44px
- [ ] All icon-only elements have `aria-label`
- [ ] Focus states are visible (black outline ring)
- [ ] No information is conveyed by colour alone
- [ ] Screen reader labels are correct on metric cards and progress rings
- [ ] `prefers-reduced-motion` is respected

### Mobile-Native Behaviour
- [ ] Safe area insets are respected (top and bottom)
- [ ] Bottom navigation does not cover content
- [ ] Bottom sheet lifts above keyboard when containing an input
- [ ] No horizontal scrollbars on any screen
- [ ] Text does not overflow its container at 1.2× system font size

### UX Writing
- [ ] Button labels are verb-first and specific
- [ ] Empty state copy is instructive, not emotional
- [ ] Error messages specify what happened and what to do
- [ ] No placeholder text serving as a label
- [ ] No emoji outside of streak counter (🔥 only)
- [ ] Notification copy is within defined format (title: meal name only; body: macros + action)

### Error and Edge Cases
- [ ] API failure shows an error state with a retry option
- [ ] Skipped meals appear in the timeline (greyed), not hidden
- [ ] AI-estimated macros are marked as estimates with confidence indicator
- [ ] Zero state (0 cal, 0g protein) renders correctly without layout breaks

### Design System Compliance
- [ ] No hardcoded hex values in component files
- [ ] No hardcoded pixel values outside the spacing token scale
- [ ] No new accent colours introduced
- [ ] Any new component is documented in this file before use in production
- [ ] `pnpm typecheck` and `pnpm lint` pass with no errors
