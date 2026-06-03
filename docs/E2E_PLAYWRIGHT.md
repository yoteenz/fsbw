# Playwright E2E (mobile browser QA)

Mobile-first end-to-end tests using [Playwright](https://playwright.dev/). Default device profile: **iPhone 13** (matches the project’s mobile-only QA target).

## What this gives you

| Project | Needs credentials? | What it does |
|---------|-------------------|--------------|
| **guest** | No | Visits shop, bag, checkout, sign-in, NOIR PDP, BAW, tools, brand, booking — checks pages load without the red error boundary |
| **standard-user** | `E2E_STANDARD_*` | Signed-in account, concierge, rewards, orders, wishlist; add NOIR to bag |
| **premium-user** | `E2E_PREMIUM_*` | Rewards, PSA FAB, premium booking route |

This replaces “API + architecture review only” with **real mobile browser click-through** on every listed screen.

## One-time setup

```bash
npm install
npm run test:e2e:install   # downloads WebKit/Chromium browsers
```

**Linux (first time only):** if tests fail with “Host system is missing dependencies”, run:

```bash
sudo npx playwright install-deps webkit
```

(or the `apt-get` package list Playwright prints in the error).

```bash
cp .env.e2e.example .env.e2e.local
```

Edit `.env.e2e.local`:

- Create two **confirmed** Supabase Auth users (standard + premium), or use existing test accounts.
- Premium account must have `membership_type` / `subscription_tier` or BLACK tier in **`profiles`** (same as production PSA gate).

## Run tests

**Guest smoke only** (no secrets — hits live site by default):

```bash
npm run test:e2e:guest
```

**Full suite** (guest + signed-in, if credentials set):

```bash
npm run test:e2e
```

**Interactive UI mode** (debug failures):

```bash
npm run test:e2e:ui
```

**Headed** (watch the phone viewport):

```bash
npm run test:e2e:headed
```

**Against local dev** (needs `.env.local` with `VITE_SUPABASE_*` for sign-in):

```bash
# .env.e2e.local:
# E2E_BASE_URL=http://localhost:3001
# E2E_LOCAL_SERVER=1
npm run test:e2e
```

## Reports

After a run, open the HTML report:

```bash
npx playwright show-report
```

Artifacts: `test-results/`, `playwright-report/` (gitignored).

## Adding more coverage

1. Add routes to `e2e/helpers/routes.ts`.
2. Add a spec under `e2e/` (e.g. `checkout-journey.spec.ts`).
3. Use role/name selectors already in the app (`SIGN IN`, `ADD TO BAG`, `CONFIRM ORDER`).

Prefer **user-visible** selectors over CSS classes. Add `data-testid` only when a control has no stable text (optional follow-up).

## CI (optional)

Set secrets `E2E_STANDARD_EMAIL`, `E2E_STANDARD_PASSWORD`, `E2E_PREMIUM_EMAIL`, `E2E_PREMIUM_PASSWORD`, and run:

```bash
npm run test:e2e:install
npm run test:e2e
```

Use `E2E_BASE_URL` pointing at your Vercel preview URL for PR checks.

## Notes

- Checkout **CONFIRM ORDER** still uses the client-side flow (no Stripe PI in UI yet) — E2E can click through but does not assert real payment capture.
- PSA chat tests that call OpenAI should stay in API/integration tests unless you add a mock or dedicated staging key.
- Sold-out NOIR skips “add to bag” automatically when the button is **OUT OF STOCK**.
