# Security hardening (2026-06)

## What was fixed in code

1. **`POST /api/build-a-wig-unit-image`** — requires Supabase JWT; rate limit per IP + user.
2. **`PATCH /api/profile`** — strips membership/tier/role/points/gift card (server).
3. **`PUT /api/orders`** — returns **403**; orders appended by Stripe webhook (service role).
4. **`GET /api/psa/health`** — public response is minimal; `?probe=1` requires **admin** JWT.
5. **Product checkout** — when Stripe keys are set and `ALLOW_LEGACY_CHECKOUT` is **not** `1`, **CONFIRM ORDER** uses Stripe PaymentIntent + Stripe.js Card Element (server-priced lines only).
6. **Concierge priority messages** — `POST /api/client/priority-messages`; admin inbox `GET /api/admin/priority-messages`.

## Supabase migrations to run

In **Supabase → SQL Editor**, run (if not already):

1. `supabase/migrations/20260603180000_priority_messages.sql`
2. `supabase/migrations/20260604120000_security_profiles_orders_guard.sql`

## Vercel env (production)

| Variable | Notes |
|----------|--------|
| `STRIPE_SECRET_KEY` | Required for product + membership payments |
| `STRIPE_PUBLISHABLE_KEY` or `VITE_STRIPE_PUBLISHABLE_KEY` | Client Stripe.js |
| `STRIPE_WEBHOOK_SECRET` | Must include `payment_intent.succeeded` |
| `SUPABASE_SERVICE_ROLE_KEY` | Webhook order writes + admin priority inbox |
| **Do not set** `ALLOW_LEGACY_CHECKOUT` in production | Blocks fake card-only checkout |
| `OPENAI_API_KEY` | PSA chat |

**Redeploy** after env changes.

## Founder / dev testing only

Set on **Preview** or local `.env.local`:

```env
ALLOW_LEGACY_CHECKOUT=1
VITE_ALLOW_LEGACY_CHECKOUT=1
```

Allows founder test PAN (`4242…`) and legacy CONFIRM ORDER without Stripe PI.

## Product checkout behavior

- Cart must be **fully server-priced** (simple units, booking lines) — BCF bundle / custom BAW lines still block Stripe until catalog is expanded.
- User must be **signed in** for Stripe product pay (PaymentIntent metadata includes `supabase_user_id`).
- After success, **`payment_intent.succeeded`** webhook appends order server-side; client keeps local order for UI + summary page.

## PSA health check

- Public: `GET /api/psa/health` → `{ openaiConfigured, model }` only.
- Admin probe: `GET /api/psa/health?probe=1` with admin Bearer token.

See also: `docs/PSA_SUPABASE_TABLES.md`, `docs/CHECKOUT_SERVER_QUOTE.md`.
