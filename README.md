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

| Variable                            | Purpose                                                                                     |
| ----------------------------------- | ------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`              | Canonical site URL (no trailing slash). Defaults to `https://mera-coach.com`                |
| `NEXT_PUBLIC_API_BASE_URL`          | meracoachapi origin (no trailing slash). **Required** for API-backed pages                  |
| `NEXT_PUBLIC_IMAGE_HOSTS`           | Extra hostnames for coach photos, such as a CDN. The API origin is allowed automatically    |
| `NEXT_PUBLIC_SOCIAL_*`              | Facebook, Instagram, X, YouTube and LinkedIn URLs. Only configured icons show in the footer |
| `NEXT_PUBLIC_SUBSCRIPTION_REQUIRED` | `true` gates Add Client behind a premium plan; `false` lets every coach add clients         |

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

| Route               | Notes                                                                     |
| ------------------- | ------------------------------------------------------------------------- |
| `/`                 | Marketing home                                                            |
| `/coach`            | Public coach directory (+ city filters)                                   |
| `/coach/[code]`     | Profile + enquiry                                                         |
| `/services`         | Services marketing                                                        |
| `/register`         | Coach registration                                                        |
| `/coach-login`      | Coach login → `/dashboard`                                                |
| `/dashboard`        | Authenticated coach practice (clients, leads, packages, events, profile)  |
| `/premium`          | Plans + Razorpay (`?coachId=&coachCode=` from app `buildCoachPaymentUrl`) |
| `/premium/success`  | Post-confirm return page                                                  |
| `/feedback`         | `?coachCode=&clientCode=`                                                 |
| `/bmi`              | Public BMI calculator with a callback form                                |
| `/forgot-password`  | Utility page (noindex)                                                    |
| `/terms` `/privacy` | Legal. Have counsel review the wording before launch                      |

## Verify flows

1. **Find coach** → `/coach` → open a profile → submit enquiry (API must be up).
2. **Register** → `/register` → check welcome email / then `/coach-login`.
3. **Premium** → from app Pay Now or `/premium?coachId=…&coachCode=…` → pick plan → Razorpay → `/premium/success`.
4. **Feedback** → `/feedback?coachCode=…&clientCode=…`.

## Scripts

| Script               | Description                   |
| -------------------- | ----------------------------- |
| `bun dev`            | Dev server (Turbopack)        |
| `bun run build`      | Production build              |
| `bun run lint`       | ESLint + TypeScript           |
| `bun run type-check` | `tsc --noEmit`                |
| `bun run validate`   | Lint, format check, and build |

## Before deploying

1. Set `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_API_BASE_URL` (https) for the production environment. A production build fails if the API origin is missing or not https.
2. Confirm the API is the build that exposes `GET /v1/Coach/premium`; older builds return 404 and the premium status shows as unavailable.
3. Run `bun run validate`.
4. Utility pages (`/coach-login`, `/forgot-password`, `/feedback`, `/premium`) are `noindex` and disallowed in `robots.txt`. The sitemap lists public pages and coach profiles only.

## Registration and uploads

`POST v1/Coach/save` for a new coach returns a short-lived `uploadToken` (30 minutes). The register form sends it as a bearer token to upload the logo and photo and to save the service details, so no account exists with open write access before sign-in. The API now requires a JWT on every `Client/*` and `Document/*` call and only serves public coach images anonymously.
