# Forge

Personal nutrition + training PWA. Single user. Built to make me gain weight and muscle by never skipping meals.

## Start here

1. `PRD.md` — what we're building and why
2. `ARCHITECTURE.md` — how it's structured
3. `CLAUDE.md` — rules for AI assistants working on this repo
4. `UI-REVIEW.md` — checklist every screen must pass before it ships

## Stack

Next.js 15 · TypeScript · Tailwind v4 · shadcn/ui · Supabase · Anthropic SDK · Web Push · Vercel

## Local setup

```bash
pnpm install
cp .env.example .env       # fill in keys
pnpm dev                   # http://localhost:3000
```

Run `supabase/schema.sql` in the Supabase SQL editor before submitting onboarding locally.

## Scripts

```
pnpm dev          # next dev
pnpm build        # next build
pnpm typecheck    # tsc --noEmit
pnpm lint         # next lint
```

## Deploy

Vercel. Set Supabase env vars from `.env.example`. Cron is configured in `vercel.json`.

## License

Personal. Not open source.
