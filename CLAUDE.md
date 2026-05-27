# CLAUDE.md

Rules of engagement for AI coding assistants (Claude Code, Codex) working on this repo. Read this every session. If something here conflicts with the PRD or ARCHITECTURE.md, ask before deviating.

## Who you're working with

Olusegun. Senior product designer, 6+ years, deep familiarity with shipping web products. He wants you to act like a senior engineer pair — write production-grade code, push back on bad ideas, and never hand him work that compiles but is structurally wrong.

He is the only user of this app. There is no team, no audience, no marketing. Optimise for shipping, not for theoretical scale.

## Project context (one paragraph)

Forge is a personal PWA that solves "I forget to eat" by chasing him through the day with meal reminders, AI-generated weekly meal + workout plans (Nigerian/British mix), and progress tracking — built to make him gain weight and muscle. Stack: Next.js 15 + TypeScript + Tailwind v4 + shadcn/ui + Neon Postgres + Drizzle + Anthropic SDK + Web Push + Vercel. Read PRD.md and ARCHITECTURE.md before doing anything.

## Operating rules

1. **Read PRD.md and ARCHITECTURE.md before writing code in a new area.** They are the source of truth. Don't reinvent decisions that are already locked.

   **Before finishing any UI work, run it against `UI-REVIEW.md`.** Every screen, every component state. Failed items either get fixed or get logged as a deliberate exception in the commit message (`[UI-EXCEPTION: <item #> — <reason>]`).

2. **Stay in scope.** P0 features ship first. If a P0 task is in flight, don't propose P1 or P2 work. If a feature isn't in the PRD, ask whether to add it before building.

3. **Follow the folder structure exactly.** `ARCHITECTURE.md` defines where every file goes. Don't put queries in components. Don't put AI calls in route handlers directly. Don't create new top-level folders without asking.

4. **Validate at every boundary.** Zod schemas for API inputs, AI outputs, form inputs. No `any`. No `unknown` that goes unchecked.

5. **Server components by default.** `'use client'` only when you genuinely need browser APIs, interactivity, or hooks. If you're adding `'use client'`, write a one-line comment explaining why.

6. **Optimistic UI for logging.** When the user taps "Ate it", the meal flips to logged immediately. Roll back on failure. Don't make him wait for a round trip to feel like the app responded.

7. **Single user is a feature.** Don't add multi-tenant patterns "just in case". Don't add user_id columns to every table. Don't build settings UI. Profile is seeded from `config/profile.json`.

8. **Time math goes through `lib/time/london.ts`.** No `new Date()` in components or routes. Server stores UTC, display uses Europe/London. Cron triggers in UTC — translate at the boundary.

9. **Money math doesn't exist here, but macro math does.** Calories and protein are integers in the DB. Round at write time, not display time. Never store floats.

10. **AI calls always return JSON validated by Zod.** If the schema fails, retry once with a stricter prompt. If it fails twice, surface the error and let the user retry manually — never write malformed data.

## What "good code" means here

- **Types first.** Define the type, then write the function.
- **Pure functions where possible.** `lib/targets/calculate.ts` should have zero side effects and be unit-testable.
- **Single responsibility.** A route handler validates input, calls a query function, returns. It does not contain business logic.
- **No comments that restate the code.** Comments explain *why*, not *what*. `// loop through meals` is noise. `// london timezone offset matters here because cron fires in UTC` is signal.
- **Small files.** If a file is over 200 lines, ask whether to split it.
- **Naming honestly.** `getMealsForToday` not `fetchData`. `MealLogSchema` not `Schema1`.

## What "bad code" looks like (reject this in PRs and from yourself)

- Anything that adds a dependency without checking it against the locked stack
- Anything that imports Drizzle into a component
- Anything that hardcodes a calorie or protein number outside `lib/targets/`
- Anything that calls `fetch('/api/...')` from a server component (call the query directly)
- Anything that uses `any`, `as any`, or `// @ts-ignore`
- Anything that adds a settings UI, multi-user support, or analytics
- Anything that uses moment.js or dayjs (use `date-fns` + `date-fns-tz` if needed)

## Aesthetic non-negotiables

- Off-white background `#fafaf9`, near-black text `#0a0a0a`, single accent warm coral `#ff5a36`
- Geist Sans for body, Geist Mono for numbers (macros, weights, reps, dates in tables)
- 1px borders, no shadows on cards
- Generous spacing — `gap-6` and `gap-8` are the defaults, not `gap-2`
- Subtle motion only — `transition-all duration-150 ease-out`
- The one celebratory moment: meal logged → streak counter ticks up with a brief confetti burst. Everything else stays calm.

If you find yourself reaching for purple gradients, glassmorphism, or "modern SaaS" tropes — stop. The reference is Linear and Notion, not a Dribbble shot.

## Push notification rules

- Notifications carry a deep link via `data.url`. Click opens app at that URL.
- Meal reminder payload includes the meal name and macros in the body — actionable at a glance from the lock screen.
- Two action buttons on meal reminders: `[Ate it]` and `[Skip]` — wired through the service worker so the user logs without opening the app.
- No notification ever uses emoji in the title. Body can use one if it adds meaning (🔥 for streak milestones). Restraint.

## When you're unsure

Ask. Don't guess on:
- Whether to add a new dependency
- Whether to introduce a new pattern not in this doc
- Whether something is P0 vs P1
- Whether to modify the schema
- Whether to deviate from the folder structure

A 30-second question saves a 30-minute rewrite.

## When you're confident

Move fast. If the task is clearly within PRD scope and follows ARCHITECTURE.md conventions, build it without asking permission for each step. Show working code, then explain the choices.

## What to say at the end of a task

- What you built
- What's now broken or untested
- What the next logical task is
- Any decision you made that I should know about

Skip: apologies, restating the prompt, summarising what the code does line-by-line. I can read code.

## Specifically for Claude Code

- Use the planning mode before large multi-file changes
- Run `pnpm typecheck` and `pnpm lint` after non-trivial changes
- Don't run `pnpm dev` and leave it hanging — start, verify, kill
- Migrations: always `drizzle-kit generate` first, review the SQL, then `migrate`
- Don't commit `.env` ever, don't commit `node_modules`, don't commit Drizzle migration meta unless intentional

## Specifically for Codex

- Same rules apply
- Prefer small, reviewable diffs over sweeping rewrites
- When in doubt about a path or convention, grep the repo first
