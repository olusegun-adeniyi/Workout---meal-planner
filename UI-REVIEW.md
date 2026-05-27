# UI Review Checklist

Run this against every screen before considering it done. This is not a suggestion — it's the bar. If a screen fails any item, it ships only after the failure is named and a deliberate exception is logged in the commit message.

Use this checklist on:
- Every new page (`app/**/page.tsx`)
- Every significant component (anything in `components/today/`, `components/plan/`, `components/progress/`)
- Every state of every component (loading, empty, error, success, populated)

---

## 1. Does this screen use only approved tokens?

**Pass criteria:**
- Colors come from CSS variables defined in `globals.css` `@theme` block. No hex codes in component files.
- Approved palette only: `--background` (`#fafaf9`), `--foreground` (`#0a0a0a`), `--accent` (`#ff5a36`), `--muted`, `--muted-foreground`, `--border` (`rgba(0,0,0,0.06)`), `--border-hover` (`rgba(0,0,0,0.12)`), `--success`, `--warning`, `--danger`.
- Spacing uses Tailwind scale (`gap-2`, `gap-4`, `gap-6`, `gap-8`) — no arbitrary values like `gap-[13px]`.
- Border radii from token set only: `rounded-md` (6px), `rounded-lg` (10px), `rounded-xl` (16px), `rounded-full`. No `rounded-[7px]`.
- Fonts: Geist Sans for everything, Geist Mono for numbers (calories, protein, weight, reps, dates in tables). No third font.

**Fail signals:**
- Any `style={{ color: '#...' }}` in JSX
- Any `bg-purple-500`, `text-blue-600`, or other Tailwind palette colors not mapped to tokens
- Any arbitrary spacing or radius value
- A new font import

---

## 2. Is there a clear primary action?

**Pass criteria:**
- Each screen has exactly one primary action, visually dominant — coral accent fill, larger weight than secondary actions.
- Secondary actions are ghost or outline variant, in `--muted-foreground`.
- Destructive actions (skip meal, delete log) are never primary-styled. They're ghost-styled in `--danger` color, often behind a confirmation or in a less prominent position.
- Within a card, the same rule applies: one primary, others recede.

**Fail signals:**
- Two coral-filled buttons side by side
- A "Skip" button styled identically to "Ate it"
- A screen where the eye doesn't know where to land first
- Primary action below the fold on mobile

**Forge-specific:** On the Today screen, "Ate it" on the next-action card is *the* primary action of the entire app. Nothing competes with it visually.

---

## 3. Is spacing consistent?

**Pass criteria:**
- Vertical rhythm: section gaps use `gap-8` (32px), card-internal gaps use `gap-6` (24px), tight groupings use `gap-2` (8px) or `gap-3` (12px). Pick a scale and stick to it within a screen.
- Horizontal padding: `px-4` on mobile, `px-6` on larger viewports, set at the layout level not per-component.
- Cards have consistent internal padding — `p-6` for standard cards, `p-4` for compact list items. Don't mix `p-5` and `p-7` on similar cards.
- Equal spacing above and below dividers, or no divider at all.

**Fail signals:**
- Two cards on the same screen with different internal padding values for no semantic reason
- Vertical gaps that look "almost the same" — they should be identical or clearly different (`gap-4` vs `gap-8`, not `gap-5` vs `gap-6`)
- Custom margin overrides on individual children to "fix" spacing

---

## 4. Are touch targets at least 44px?

**Pass criteria:**
- All interactive elements (buttons, icon buttons, swipe handles, log row taps) have minimum 44×44px hit area on mobile.
- Icon-only buttons use `size-11` (44px) minimum, with the icon at `size-5` centered inside.
- Tap targets on adjacent rows have at least 8px of clear space between them — no thumb-fat-finger mis-taps.
- Form inputs are minimum 44px tall (use shadcn `Input` defaults — they're set correctly).
- Checkbox and radio hit areas extend beyond the visible square via `before:` pseudo or padding, since the visible control is ~16px.

**Fail signals:**
- A `<button>` with `p-1` and an icon — visible click area is ~20px
- Tightly stacked list rows where tapping one accidentally taps the next
- Mobile-rendered `text-xs` link that's the only way to perform an action

**How to verify:** Open the screen on a real phone (you'll be installing this as a PWA on yours anyway), try to tap every interactive element with your thumb while walking. If you miss, the target is too small or too close to a neighbor.

---

## 5. Are loading, empty, and error states included?

**Pass criteria:**
- **Loading:** Skeleton matches the shape of the loaded content. Same dimensions, same number of rows. Uses `animate-pulse` on `bg-muted`. No spinner-in-the-middle-of-empty-space pattern except for explicit async actions like AI plan generation (which gets a labeled progress state, see below).
- **Empty:** A real empty state with one line of plain-language copy explaining why it's empty and one action button to fix it. Example: "No meals logged yet today. [Log your first meal]"
- **Error:** Plain language, no stack traces. Names what failed and offers a retry. Example: "Couldn't load today's plan. [Try again]"
- **AI generation states:** Multi-step progress for plan generation — "Reading last week's logs..." → "Generating meals..." → "Generating workouts..." → "Saving plan..." Not a generic spinner.

**Fail signals:**
- A page that renders nothing while data loads
- An empty state that just shows nothing (a blank list)
- An error toast that says "An error occurred" or shows raw JSON
- Loading skeleton that's a different shape than the final content (causes layout shift)

---

## 6. Is the hierarchy obvious within 3 seconds?

**Pass criteria:**
- Squint test: if you blur the screen, you can still identify the most important element by size and weight alone.
- One H1 per screen, semantically and visually. H2s for major sections. H3s sparingly.
- Numbers that matter (today's calories, streak count, weight) are visually dominant — large, mono font, high contrast.
- Supporting data recedes — `text-muted-foreground`, smaller size.
- Three-second rule: if you put the screen in front of yourself fresh, can you state in three seconds what you should do next? If no, the hierarchy failed.

**Fail signals:**
- A screen where every text element is the same size
- Critical numbers buried in body text
- Multiple competing headlines
- The most important action is the same visual weight as a secondary one

**Forge-specific:** On the Today screen, the eye should land in this order: (1) next meal name + time, (2) "Ate it" button, (3) macro rings, (4) workout card, (5) streak counter. If a new user followed the wrong order, the layout is wrong.

---

## 7. Does the screen feel native to mobile?

**Pass criteria:**
- Designed mobile-first. The mobile layout isn't a desktop layout shrunk down.
- Thumb-reach: primary actions live in the bottom 60% of the screen, not the top corners.
- Bottom navigation OR a clear back affordance — never both, never neither.
- Scroll behavior is natural — no horizontal scroll except for intentional carousels. Sticky elements (top nav, action bar) use `position: sticky` correctly without breaking scroll.
- Native form behaviors respected: `<input type="number" inputMode="decimal">` for weight, `<input type="time">` for meal times, etc. Don't reinvent native pickers.
- Safe area insets respected on iOS: `pb-[env(safe-area-inset-bottom)]` on bottom-fixed elements.
- Tap feedback exists — `active:bg-muted` or `active:scale-[0.98]` on tappable cards. No interaction should feel dead.

**Fail signals:**
- A multi-column grid that breaks awkwardly on mobile
- Primary action in the top-right corner where the thumb can't reach
- Custom date or time picker when the native one works fine
- Buttons that don't visibly respond to a tap
- Content cut off by the iOS home indicator

---

## 8. Are there any one-off styles?

**Pass criteria:**
- Every style choice can be traced to a token or a reusable component class.
- Repeated patterns (card, list row, stat block, badge) are extracted into components in `components/ui/` or domain folders. If you've written the same className combo twice, extract it.
- No inline `style={{ ... }}` props unless calculating a dynamic value (e.g. `style={{ width: \`${progress}%\` }}` on a progress fill).
- No `className` strings longer than ~80 chars without a reason — long classNames are a smell that the component should be split or that a utility is missing.

**Fail signals:**
- A button somewhere that's "almost a primary button but with a different rounded corner"
- Two cards that look 95% identical but have different markup
- An `!important` anywhere
- A `<div className="bg-[#fafaf9] text-[#0a0a0a] border-[rgba(0,0,0,0.06)] ...">` that should be using tokens

---

## 9. Is the UI too dense?

**Pass criteria:**
- A screen has breathing room. Generous whitespace is the aesthetic — Linear and Notion don't cram.
- No more than ~7 distinct interactive elements visible at once on a mobile screen. If there are more, the screen is doing too much; split it.
- Information hierarchy uses whitespace as a tool — sections separated by `gap-8`+, not just by borders.
- A card showing data shows the data, not data + chrome + decoration + helper text + edit button + delete button — pick what matters, hide the rest behind a tap.

**Fail signals:**
- Every pixel is full
- You can't tell where one section ends and the next begins without reading
- The screen feels like a dashboard when it should feel like a focused tool
- Edit/delete buttons clutter every row instead of appearing on tap-hold or swipe

**Inverse failure (also reject):** The screen is *so* empty it feels broken or unfinished. Generous ≠ vacant.

---

## 10. Is the copy clear and human?

**Pass criteria:**
- Plain English, not product-speak. "Log your meal" not "Submit nutritional intake entry".
- Microcopy assumes the user is intelligent and busy. No hand-holding paragraphs.
- Numbers in copy are specific: "12 days no skipped meals" not "Great streak!".
- Empty state copy is honest and useful, not cute. "No workouts logged this week" not "Looks like you're taking it easy! 💪".
- Error copy says what failed and what to do: "Couldn't save your weight. Check your connection and try again." Not "Something went wrong."
- Button labels are verbs: "Eat it", "Skip", "Generate plan", "Log weight". Not "OK", "Submit", "Confirm".
- No emojis in UI copy except the streak flame (🔥) on milestones. Restraint.
- Capitalization: sentence case throughout. Buttons, headings, labels — all sentence case. Not Title Case. Not lowercase-everywhere.

**Fail signals:**
- "Awesome! 🎉 You crushed your goals today!"
- "Please enter a valid value"
- Button labeled "Click here"
- A toast message longer than 8 words
- Mixed capitalization conventions across the same screen

**Forge-specific tone:** Direct, capable, slightly understated. Treats the user as a competent adult who chose to install this app. Not a coach, not a friend, not a cheerleader — a tool that respects the user's time.

---

## Process

When Claude Code finishes a screen:
1. Open this file
2. Walk every item against the screen
3. For each item: pass, fail (with reason), or N/A (with reason)
4. If any fails: fix before marking the task done
5. If a fail is intentional: log it in the commit message with `[UI-EXCEPTION: <item #> — <reason>]`

When in doubt on a judgment call (item 6, 9, or 10 especially), screenshot the screen and ask Olusegun. Don't ship a contested call silently.
