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
| `Razorpay:RefundsEnabled` | `true` lets a coach cancel a plan that has not started and refunds it in full (`POST /v1/Coach/premium-cancel-upcoming`). Default `false`. Turn it on only after a test-mode refund works on staging. |
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

### Subscription rules (run on staging after deploying the API)

Access is `MstCoach.ValidUpto`. A payment starts where the last **paid** period ends (or today when none is running) and `ValidUpto` becomes the end of the new period. Free days (sign-up trial, validity set by hand) are replaced, never added on. For each case, check the new `TxnCoachSubscription` row (`PeriodStart`, `PeriodEnd`), `MstCoach.ValidUpto`, and `GET /v1/Coach/premium`.

| Case | Expected |
| --- | --- |
| Coach still on the free trial (for example 5 days left) pays Monthly | `ValidUpto` = today + 1 month, **not** trial days + 1 month; `PeriodStart` ≈ now |
| Coach with long free validity (set by hand) pays Quarterly | `ValidUpto` = today + 3 months |
| New coach pays Monthly | `PeriodStart` ≈ now, `ValidUpto` = now + 1 month, status `active`, no `nextPlanName` |
| Active coach (more than 15 days left) buys a different plan | Row `PeriodStart` = old `ValidUpto`; `GET premium` shows `nextPlanName`, `hasUpcomingPlan: true` |
| Same coach tries any plan again | `premium-order` returns error code 645, no order row created |
| Active coach (more than 15 days left) tries the plan they have | Error code 645 |
| Same plan with 15 days or fewer left | Order created; payment extends from `ValidUpto` |
| Expired coach buys the old plan | Allowed; `PeriodStart` ≈ now |
| `premium-confirm` and `premium-webhook` for one order, back to back | One period only; second call returns already-paid, `ValidUpto` unchanged |
| Pay tapped twice within 30 minutes for the same coach, plan and promo | Second `premium-order` returns the first Razorpay order, no new `TxnCoachSubscription` row |
| Cancel the lined-up plan (`premium-cancel-upcoming`, refunds enabled, Razorpay test mode) | Row becomes `Refunded`, Razorpay refund created with the order id as receipt, `ValidUpto` back to the lined-up plan's `PeriodStart`, `hasUpcomingPlan` false |
| Same cancel called again after it succeeded | Error "no plan lined up", no second refund |
| Cancel when Razorpay refuses (for example a payment that is not captured) | Row back to `Paid`, plan unchanged, error shown |
| Cancel interrupted after Razorpay refunded (kill the API between the two steps) | Row stays `Refunding`; calling cancel again completes it ("already refunded" from Razorpay), no second refund |
| Cancel with `RefundsEnabled` false | Error "not available right now", nothing changes |
| `/premium?coachId=…&planId=<id>` | Checkout opens on that plan; an unknown id falls back to the shortest |
| `GET /v1/Coach/premium-history` | Paid orders only, newest first, reference masked to its last 6 characters |

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
