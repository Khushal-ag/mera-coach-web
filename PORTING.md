# Website port checklist (.NET → Next.js)

**Source of truth (legacy):** `../mera-coach-web-old` — ASP.NET Web Forms 4.7.2 (`MVDUSA/`).

**Design source of truth:** `../mera-coach-app` (`src/constants/theme.ts` — teal/header greens, `brandCoach` orange, Montserrat + Poppins).

**API source of truth:** `../meracoachapi` (`/v1/Coach/*`, `/v1/Auth/login`).

## Ported

- [x] Strip nextjs-template identity (`package.json` name, site config, demo landing)
- [x] App design tokens in CSS variables / Tailwind theme (not Festava yellow/cyan/purple)
- [x] Montserrat headings + Poppins body
- [x] Feature API modules under `src/lib/api/` (client, coach, auth, premium, feedback)
- [x] Typed env via `src/config/env.ts` (no hardcoded API host in TS)
- [x] Static assets under `public/mc-images/` and hero video `public/mc-video/`
- [x] `/` Home
- [x] `/services` Services (`health-services.aspx`)
- [x] `/coach` Find a Coach (API list + city chips via `/v1/Coach/public-cities`)
- [x] `/coach/[code]` Coach public profile + enquiry form
- [x] `/register` Coach registration (API `/v1/Coach/save`)
- [x] `/coach-login` Coach login (direct meracoachapi `/v1/Auth/login` + Bearer in sessionStorage)
- [x] `/dashboard` Coach practice MVP (clients, leads, packages, events, profile essentials)
- [x] `/member-login` Placeholder pointing clients to the app
- [x] `/premium` Plans + Razorpay checkout (`premium-plans` / `premium-order` / `premium-confirm`)
- [x] `/premium/success` Post-checkout confirmation (app deep-link return friendly)
- [x] `/feedback` Client feedback (API)
- [x] `/terms` Terms & Conditions
- [x] `/privacy` Privacy Policy
- [x] Sitemap routes + `.env.example`
- [x] UI error banners (no `alert()` spam)

## Legacy inventory (MVDUSA public surface)

| Legacy | Status |
| --- | --- |
| `home.aspx` / `default.aspx` | Ported → `/` |
| `health-services.aspx` | Ported → `/services` |
| `coach.aspx` | Ported → `/coach` |
| `coach-pro.aspx` | Ported → `/coach/[code]` |
| `register.aspx` | Ported → `/register` |
| `coach-login.aspx` | Ported → `/coach-login` |
| `member-login.aspx` | Ported → `/member-login` (app handoff) |
| `feedback.aspx` | Ported → `/feedback` |
| `update-password.aspx` | **Deprecated on web** — use app / Auth APIs |
| `blog.aspx` / `our-blogs.aspx` | **Deprecated** — not linked from current nav |
| `get-diet-plan.aspx` / `health-checkup.aspx` | **Deprecated** — older `web-health` theme; app owns these |
| `testmail.aspx` | Dev only — not ported |
| `About.aspx` / `Contact.aspx` | VS scaffold — not porting |
| `Health/` `Operation/` `Member/` `Client/` `Ctrlpnl/` | **Out of scope** (app + API) |

## Remaining / polish

- [x] Register: logo + profile image upload (`/v1/Document/upload` after `/v1/Coach/save`, then media patch)
- [ ] Social footer profile URLs (were `#` in old site; still omitted until final handles exist)
- [x] Favicon / PWA icons from app `logo-mark` (teal pad) + OG `mc-images/og-image.png`
- [x] Production OG / Twitter meta wired via `siteConfig` + `layout.tsx`
- [ ] Wire home consult form to enquiry API if product wants anonymous leads without a coach code
- [ ] Production `NEXT_PUBLIC_API_BASE_URL` + CORS on API for the live web origin
- [x] Premium checkout code path (coachId resolve, order → Razorpay → confirm → success); live charge needs API Razorpay secrets — see VERIFY.md
- [x] Branded `not-found` / `error` / `global-error` / `loading` status panels
- [x] Shared themed form fields (`components/ui/field.tsx` + `mc-field` states)

## Not porting (by design)

- Festava pixel-perfect CSS parity
- Next.js BFF / proxy routes that duplicate meracoachapi (call the .NET API directly)
- Direct SQL / `appSetting.xml` secrets (use meracoachapi)
- App-side subscription paywall UI (web hosts checkout; practice CRM uses the same API)
