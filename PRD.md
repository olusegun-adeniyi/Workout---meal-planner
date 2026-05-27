# PRD — [Working title: Forge]

A personal nutrition + training PWA for one user (Olusegun) to gain weight and build muscle by never skipping meals.

---

## 1. Problem

I work too much and forget to eat. When I do eat, it's usually once a day and not enough. I want to gain weight and build muscle but my eating pattern guarantees I won't. I have a full gym, I'm willing to cook, and I know what I should be doing in principle — I just don't do it consistently.

Existing apps fail me because:
- **MyFitnessPal / Cronometer:** Built for weight loss. Logging is friction. No proactive nudges.
- **Strong / Hevy:** Workout-only, no nutrition tie-in.
- **Future / Fitbod:** Coach-style apps don't solve the "I forgot to eat" problem.
- **Generic meal planners:** Don't adapt to what I actually ate last week.

The gap: nothing **chases me down through the day** with "eat now, here's exactly what" — and ties that to a weekly training plan I'm progressing on.

## 2. User

Single user. Me.
- 1 active account, no auth wizard, no settings UI in v1
- Profile seeded from a config file: height, current weight, target weight, dietary preferences, cuisine bias (Nigerian + British mix), training experience, gym access, schedule
- All planning targeted at: **gain weight + build muscle, with caloric surplus + high protein**

## 3. Success metrics

In priority order. The home screen is designed around #1.

1. **No skipped meals.** Daily target: 5 logged meals. Weekly streak counter.
2. **Hit calorie + protein targets.** Daily target: TDEE + 500 cal, 1.8g protein per kg bodyweight.
3. **Progressive overload.** Weekly: weight on the bar trending up on compound lifts.
4. **Scale weight trending up.** Weekly average, not daily reading.

If I'm hitting 1 and 2, 3 and 4 follow. The app is built around making 1 and 2 unmissable.

## 4. Core principles

These are non-negotiable design constraints. Every feature decision tests against these.

- **Frequency beats volume.** 5–6 small meals/snacks > 3 huge ones. The app pushes cadence, not calorie cliffs.
- **The nudge is the product.** A meal suggestion I never see is worth nothing. Notifications are designed with escalation, not single-shot.
- **One screen answers "what now?".** Home screen always tells me the next thing to eat or do, with no scrolling.
- **Sunday is the ritual.** Weekly plan generation happens once on Sunday evening. I review it. The rest of the week is execution.
- **Logging takes < 5 seconds.** One tap to confirm a planned meal. Custom logging available but never required.
- **Daily scale is noise.** Weight shown as 7-day rolling average. Daily entry is allowed but the number displayed is the trend.

## 5. Features

### P0 — must ship in week 1

**Today screen (home)**
- Next action card: "Eat in 23 min: Jollof rice + grilled chicken, 720 cal, 52g protein" with [Ate it] [Swap] [Skip] buttons
- Day's meal timeline: 5 meal slots with status (eaten / upcoming / skipped)
- Day's macro rings: calories, protein, vs target
- Day's workout card if it's a training day: collapsed view, expand to see exercises
- Streak counter: "12 days no skipped meals"

**Meal logging**
- One-tap confirm planned meal → logged with planned macros
- "Swap" → AI suggests alternative with similar macros from saved favourites or generates one
- "Skip" → logged as skipped, contributes to streak break
- "Ate something else" → free text + photo, AI estimates macros (Claude vision)

**Workout logging**
- Today's workout from the weekly plan
- Per-exercise: target sets × reps × weight, log actual
- Progressive overload suggestions: "+2.5kg from last week" baked into the target

**Weight logging**
- Daily entry (optional)
- Shows 7-day rolling average and weekly trend chart

**Progress page**
- Weekly weight trend (line chart)
- Weekly calorie + protein hit rate (bar chart, % of days on target)
- Workout volume trend (total weight moved per week per muscle group)
- Photo gallery (one per week)

### P1 — week 2

**Weekly plan generation (Sunday ritual)**
- Sunday 6pm push notification: "Time to plan next week"
- Generates a 7-day meal plan based on:
  - Previous week's logged meals (what I actually ate vs. skipped)
  - Calorie + protein targets
  - Cuisine mix preference (Nigerian + British)
  - Cook time tolerance per meal slot (5/15/30/45 min)
- Generates a 7-day workout split (PPL or Upper/Lower based on profile)
- I review, edit (swap meals, change workout days), confirm
- Plan locked for the week, stored in DB

**Push notification system**
- Meal reminders: 15 min before each planned meal time
- Escalation: if not logged within 30 min of meal time, second notification with "log skipped?" prompt
- Workout reminder: 1 hour before scheduled workout time
- Sunday plan reminder: 6pm Sunday
- Morning briefing: 7am daily push with day's targets + first meal

**Backup email briefing**
- 7am daily email: "Today's plan" — meals, workout, targets. Insurance against push failures (especially iOS).

**Custom meal logging with AI macro estimation**
- Photo → Claude vision → estimated calories + protein + ingredients
- Free text → Claude → estimated macros
- Saved as logged meal, contributes to favourites library

### P2 — if time permits in week 2, otherwise defer

- Favourites library (saved swappable meals)
- Recipe view (full ingredients + steps for cooked meals)
- Grocery list generation from weekly plan
- Fitness tracker integration hooks (Fitbit/Apple Health — endpoints stubbed, not wired)

### Explicitly out of scope (do not build)

- Multi-user / social / sharing
- Onboarding flow (profile is seeded in config)
- Settings UI (edit JSON config file directly)
- Barcode scanning
- Restaurant database
- Native mobile app (PWA only)
- Payment / subscription
- Cookie banner / GDPR (single user, my data)

## 6. Data model

Postgres via Supabase. Supabase client for application reads/writes; generated database types keep queries type-safe.

```
user_profile (single row, seeded from config)
  id, height_cm, starting_weight_kg, target_weight_kg, sex, dob,
  activity_level, training_split, cuisine_preferences (jsonb),
  dietary_restrictions (jsonb), meal_times (jsonb e.g. [08:00, 11:00, 14:00, 17:00, 20:00])

weight_log
  id, date, weight_kg, photo_url (nullable), notes

meal_plan
  id, week_starting_date, generated_at, locked, source ('ai' | 'manual')

planned_meal
  id, meal_plan_id, date, slot (breakfast | snack_am | lunch | snack_pm | dinner),
  scheduled_time, name, description, ingredients (jsonb), recipe_steps (jsonb),
  calories, protein_g, carbs_g, fat_g, cook_time_min, cuisine_tag

meal_log
  id, planned_meal_id (nullable, null if custom), date, slot, eaten_at,
  status ('eaten' | 'skipped' | 'swapped'), name, calories, protein_g, carbs_g, fat_g,
  source ('planned' | 'custom_text' | 'custom_photo'), photo_url (nullable), notes

workout_plan
  id, meal_plan_id (linked to same week), week_starting_date

planned_workout
  id, workout_plan_id, date, split_day (push | pull | legs | rest | etc), name

planned_exercise
  id, planned_workout_id, exercise_name, target_sets, target_reps, target_weight_kg,
  order_index, muscle_group, notes

exercise_log
  id, planned_exercise_id (nullable), date, exercise_name, sets (jsonb: [{reps, weight_kg}]),
  notes, completed_at

notification_log
  id, sent_at, type, channel ('push' | 'email'), payload (jsonb), delivered, opened
```

## 7. API surface

Next.js Route Handlers under `/app/api`. All return JSON, all server-side.

```
GET  /api/today                     → today's plan + logs aggregated
POST /api/meal-log                  → log a meal (planned, custom text, custom photo)
POST /api/meal-log/:id/skip         → mark skipped
POST /api/exercise-log              → log exercise sets
POST /api/weight-log                → log weight (one per day)
GET  /api/progress                  → weekly aggregates for charts
POST /api/plan/generate             → trigger AI weekly plan generation
GET  /api/plan/:weekStarting        → fetch a week's plan
PATCH /api/plan/meal/:id            → swap or edit a planned meal
POST /api/notifications/subscribe   → register push subscription
POST /api/notifications/test        → fire a test push
POST /api/ai/estimate-macros        → photo or text → estimated macros
POST /api/cron/morning-briefing     → Vercel Cron: 7am daily email + push
POST /api/cron/meal-reminder        → Vercel Cron: runs every 15 min, checks if any meals due
POST /api/cron/sunday-plan          → Vercel Cron: 6pm Sunday push to plan next week
```

## 8. AI prompts (canonical)

Two prompts. Both call Claude Sonnet 4.5 via the Anthropic SDK. Both return strict JSON validated with Zod before DB write.

**Weekly meal plan generation** — input: profile + last week's logs + targets. Output: 7 days × 5 slots of planned meals with macros, ingredients, recipe steps.

**Macro estimation** — input: photo or text description. Output: estimated calories, protein, carbs, fat, confidence score, breakdown of assumed ingredients.

Full prompt templates live in `/lib/ai/prompts.ts`.

## 9. Notifications

Web Push API via service worker. VAPID keys generated once, stored in env.

**Delivery rules:**
- Meal reminder: 15 min before scheduled meal time
- Meal escalation: if not logged 30 min after scheduled time, second push
- Workout reminder: 1 hour before workout
- Morning briefing: 7am daily (push + email)
- Sunday planning: 6pm Sunday

**Vercel Cron** triggers a `/api/cron/meal-reminder` route every 15 min. The route checks `planned_meal` rows for the current day, finds any meal whose scheduled_time is 15 min away and not yet logged, fires the push.

**Backup email** via Resend (free tier covers personal use). Same content as morning briefing.

## 10. Tech stack — locked

- **Framework:** Next.js 15 (App Router) + TypeScript (strict)
- **Styling:** Tailwind v4 + shadcn/ui + Geist Sans + Geist Mono (Linear/Notion aesthetic)
- **DB:** Supabase Postgres + Supabase JS client
- **Auth:** None in v1. Single hardcoded session token in env, middleware checks cookie. Add Clerk later if needed.
- **AI:** Anthropic SDK, `claude-sonnet-4-5`, structured JSON output validated by Zod
- **Notifications:** Web Push API + `web-push` npm package, VAPID keys
- **Email:** Resend
- **Cron:** Vercel Cron
- **Hosting:** Vercel
- **Cache / rate limit:** Skip Redis in v1, Postgres is enough for one user

## 11. Build sequence

**Day 1–3:** Foundation
- Next.js init, Tailwind, shadcn, Geist fonts, Drizzle schema, Neon connected, seed profile, basic shell, Today screen reading seed data

**Day 4–6:** Logging loops
- Meal log (planned + custom text + photo), exercise log, weight log, all the POST routes, optimistic UI

**Day 7–9:** AI + notifications
- Weekly plan generation, prompt + Zod validation, Sunday review flow, web push setup, service worker, VAPID, cron route for meal reminders, morning briefing email

**Day 10–14:** Polish + ship
- Progress page charts, photo upload to Vercel Blob, micro-interactions, install as PWA on phone, deploy to Vercel, dogfood for 48 hours, fix what breaks

## 12. Non-goals for v1 (saying out loud)

- It won't be beautiful enough to ship publicly. It will be beautiful enough that I want to open it.
- It won't handle edge cases like timezone changes mid-week. I'm in London, it stays London.
- It won't have undo. If I mis-log a meal, I edit the row in the DB.
- It won't survive me using it from two devices simultaneously without weird states. One device.

## 13. Success criteria for v1 launch

I have used it for 7 consecutive days and:
- Logged at least 4 meals per day on 6 of 7 days
- Logged every workout on a training day
- Logged weight on at least 5 of 7 days
- Received and acted on at least one push notification per day
- Gained at least 0.3 kg by weekly average (realistic week-1 target)
