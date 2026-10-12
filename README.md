# mera-coach-web

Public marketing and checkout website for **Mera Coach**, built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4, and Bun.

- Legacy port source: `../mera-coach-web-old` (ASP.NET `MVDUSA`)
- Design tokens: `../mera-coach-app` (`src/constants/theme.ts`)
- API: `../meracoachapi`

## Quick start

```bash
cd mera-coach-web
bun install
cp .env.example .env.local
# edit NEXT_PUBLIC_API_BASE_URL if needed
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (no trailing slash). Defaults to `https://mera-coach.com` |
| `NEXT_PUBLIC_API_BASE_URL` | meracoachapi origin (no trailing slash). **Required** for API-backed pages |
| `NEXT_PUBLIC_IMAGE_HOSTS` | Optional extra `next/image` remote hostnames |

Razorpay **key id / secret** live on the API. The website receives `keyId` from `POST /v1/Coach/premium-order`.

## Architecture

```
src/
  app/                 # routes (Server Components by default)
  components/          # site shell + feature forms + ui/
  config/env.ts        # typed public env
  config/site.ts       # marketing config from env
  lib/api/             # feature API modules (client, coach, auth, premium, feedback)
  types/               # shared response/request types
  styles/globals.css   # app design tokens as CSS variables
```

## Main routes

| Route | Notes |
| --- | --- |
| `/` | Marketing home |
| `/coach` | Public coach directory (+ city filters) |
| `/coach/[code]` | Profile + enquiry |
| `/services` | Services marketing |
| `/register` | Coach registration |
| `/coach-login` | Coach login → `/dashboard` |
| `/dashboard` | Authenticated coach practice (clients, leads, packages, events, profile) |
| `/premium` | Plans + Razorpay (`?coachId=&coachCode=` from app `buildCoachPaymentUrl`) |
| `/premium/success` | Post-confirm return page |
| `/feedback` | `?coachCode=&clientCode=` |
| `/terms` `/privacy` | Legal |

## Verify flows

1. **Find coach** → `/coach` → open a profile → submit enquiry (API must be up).
2. **Register** → `/register` → check welcome email / then `/coach-login`.
3. **Premium** → from app Pay Now or `/premium?coachId=…&coachCode=…` → pick plan → Razorpay → `/premium/success`.
4. **Feedback** → `/feedback?coachCode=…&clientCode=…`.

## Scripts

| Script | Description |
| --- | --- |
| `bun dev` | Dev server (Turbopack) |
| `bun run build` | Production build |
| `bun run lint` | ESLint + TypeScript |
| `bun run type-check` | `tsc --noEmit` |
| `bun run validate` | Lint, format check, and build |
