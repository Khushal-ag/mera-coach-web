# Manual verification — Mera Coach web

## Env (website)

Copy `.env.example` → `.env.local`:

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Yes | meracoachapi origin, no trailing slash |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical origin for OG / sitemap |
| `NEXT_PUBLIC_IMAGE_HOSTS` | Optional | Extra `next/image` remote hosts |

**Do not** put Razorpay key id or secret in the website. Checkout uses `keyId` from `POST /v1/Coach/premium-order`.

## Env (API — live Razorpay)

Configure on **meracoachapi** (`appsettings` / Azure App Settings), not in this repo’s web `.env`:

| Setting | Purpose |
| --- | --- |
| `Razorpay:KeyId` | Public key returned to web as `keyId` |
| `Razorpay:KeySecret` | Server-only; signs orders + verifies Checkout signature |
| `Razorpay:WebhookSecret` | Optional fallback for `POST /v1/Coach/premium-webhook` |
| `AppSettings:PaymentPageUrl` | Should point at `{web}/premium` |

Without KeyId + KeySecret, order create returns an error such as “Razorpay is not configured.”

---

## 1. Register image upload

1. Open `/register`.
2. Fill coach name, mobile, email.
3. Choose logo and/or profile photo (JPG/PNG/WebP, ≤ 2 MB). Invalid type/size should show an **AlertBanner** and not submit.
4. Submit. Expected calls:
   - `POST /v1/Coach/save` (create) → `coachId` + `coachCode`
   - `POST /v1/Document/upload` per image (`docType` `LOGO` / `PROFILE_PIC`, `refType` `COACH`)
   - `POST /v1/Coach/save` (update) with `logo_Url` / `profile_Pic_Url`
5. Success → login hint; if images fail after account create, banner still offers login.

## 2. Favicons / OG

1. View page source / DevTools → `<link rel="icon">` points at `/favicon.ico`, `/favicon-32x32.png`, brand PNGs (not Next template placeholders).
2. `/site.webmanifest` theme `#004B3E`, icons 192/512.
3. OG/Twitter: `/mc-images/og-image.png` (1200×630) via `siteConfig.ogImage`.
4. Optional: [opengraph.xyz](https://www.opengraph.xyz/) against `NEXT_PUBLIC_SITE_URL` after deploy.

## 3. Premium / Razorpay E2E

### Code path (no live keys)

1. `NEXT_PUBLIC_API_BASE_URL` set; `bun run dev`.
2. Open `/premium?coachId=<id>&coachCode=<code>` (same query the app builds).
3. Plans load from `GET /v1/Coach/premium-plans`.
4. Pay → `POST /v1/Coach/premium-order` with **coachId > 0** (code-only is resolved via `profile-by-id` first). Client **does not** send a guessed amount (API quotes).
5. If API lacks Razorpay secrets: AlertBanner with configuration message — **expected**; do not fake success.

### Live charge (staging/live Razorpay on API)

1. Confirm API has `Razorpay:KeyId` + `Razorpay:KeySecret` for the intended mode (test vs live).
2. Use a real coach id from staging DB / app Pay Now.
3. Complete Checkout → web calls `POST /v1/Coach/premium-confirm` with `razorpayOrderId`, `razorpayPaymentId`, `razorpaySignature`.
4. On `isPaid: true` → redirect `/premium/success?orderId=…&plan=…&periodEnd=…`.
5. In app: pull-to-refresh profile; premium period should match.

### Failure cases to spot-check

| Case | Expected |
| --- | --- |
| Missing coachId/code | AlertBanner validation |
| Invalid promo / amount mismatch | API error in banner |
| Dismiss Razorpay modal | Banner: checkout closed |
| Payment failed event | Banner: payment not completed |
| Confirm signature invalid | Banner; do not show success |

---

## 4. Themed error / form surfaces

1. Visit a missing route → branded 404 (`not-found.tsx`), not Next default.
2. Force a client error (or open a broken segment) → branded `error.tsx` with Try again.
3. Forms on `/register`, `/coach-login`, `/feedback`, `/premium`, coach enquiry: labels, focus ring (teal), disabled/read-only use `mc-field` — no unstyled browser defaults.

## Commands

```bash
cd mera-coach-web
bun run lint
bun run build
```
