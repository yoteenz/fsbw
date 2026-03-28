# Stripe membership (production subscriptions)

Premium checkout can use **Stripe Billing** so renewals charge automatically on the same cadence as the in-app chart (3 / 6 / 12 months at **$280 / $520 / $960** USD). The app still supports the **in-app** `/checkout/upgrade` flow for demos or non-Stripe methods.

## 1. Supabase schema

Run the migration in the Supabase SQL Editor (or CLI):

- `supabase/migrations/20260327120000_stripe_membership.sql`

This adds to `profiles`:

- `stripe_customer_id`, `stripe_subscription_id`
- `auto_renew_membership`, `subscription_period_end`, `subscription_purchased_at`

…and creates `membership_payments` (ledger rows inserted from webhooks).

Run **`supabase/migrations/20260328120000_stripe_payment_failures.sql`** as well: adds `profiles.stripe_subscription_status`, `profiles.last_payment_failure_at`, and table **`membership_payment_failures`** (one row per `invoice.payment_failed` for admin visibility).

## 2. Stripe Dashboard

1. **Products / Prices** — Create one recurring price per tier (interval **every 3 months**, **6 months**, **12 months**; currency USD; amounts **280**, **520**, **960**). Copy each **Price id** (`price_...`).
2. **Developers → Webhooks → Add endpoint**  
   - URL: `https://<your-vercel-app>/api/stripe/webhook`  
   - Events:  
     `checkout.session.completed`  
     `invoice.paid`  
     `invoice.payment_failed` (failed renewal or other unpaid invoice)  
     `customer.subscription.updated` (includes status changes, e.g. `past_due`)  
     `customer.subscription.deleted`  
   - Copy the **Signing secret** (`whsec_...`).

## 3. Vercel environment variables

| Variable | Purpose |
|----------|---------|
| `STRIPE_SECRET_KEY` | Secret API key |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret |
| `STRIPE_PRICE_ID_3MONTHS` | Price id for 3-month tier |
| `STRIPE_PRICE_ID_6MONTHS` | Price id for 6-month tier |
| `STRIPE_PRICE_ID_12MONTHS` | Price id for 12-month tier |
| `SITE_URL` | Public origin, e.g. `https://your-app.vercel.app` (used for Checkout `success_url` / `cancel_url`) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Required** for webhook profile updates, `create-checkout-session` customer id writes, and `GET /api/admin/membership-payments` |

Redeploy after changing env vars.

## 4. App behavior

- **Account → Rewards** (route **`/account/rewards`**; the premium chart lives here): Tap **UPGRADE SUBSCRIPTION** (or **CHANGE SUBSCRIPTION**) so the **premium comparison chart** is open, **select a tier (3 / 6 / 12 mo)**, then **Subscribe with card (Stripe)** appears **below CONFIRM SUBSCRIPTION** when:
  1. **`GET /api/stripe/membership-available`** returns `{ "available": true }` (Vercel has **`STRIPE_SECRET_KEY`** + all three **`STRIPE_PRICE_ID_*`**), and  
  2. The user has a **Supabase Auth session** (Bearer token from email sign-in — not local-only demo sign-in without Supabase).
- After Checkout success, Stripe redirects to **`/account/rewards?stripe=success`**, which triggers a profile sync so `currentUser` gets `stripeSubscriptionId`, `membershipType`, `subscriptionTier`, etc.
- **Webhooks**: Update `profiles` and append rows to `membership_payments` (initial + renewal via `invoice.paid`). **`invoice.payment_failed`** sets `last_payment_failure_at` and inserts into **`membership_payment_failures`**. **`customer.subscription.updated`** stores **`stripe_subscription_status`** (e.g. `active`, `past_due`, `unpaid`). Successful **`invoice.paid`** clears **`last_payment_failure_at`**. The app does **not** auto-downgrade PREMIUM on `past_due` (Stripe retries; you can add that rule later).
- **Admin → Revenue → Payments**: Merges **localStorage** demo rows with **Supabase** rows; lines from Stripe show **· STRIPE** in the list.

## 5. Local development

The Vite app proxies `/api` to `VITE_DEV_PROXY_TARGET` / `VITE_API_BASE`. Stripe webhooks need a **public** URL; use [Stripe CLI](https://stripe.com/docs/stripe-cli) to forward:

```bash
stripe listen --forward-to https://<your-vercel-preview>/api/stripe/webhook
```

Use test keys and test price ids in a non-production Vercel env.

## 6. Security notes

- Clients **cannot** PATCH `stripeCustomerId` / `stripeSubscriptionId` via `/api/profile`; the API strips those fields. Only server routes and webhooks update them.
- The webhook handler runs on the **Edge** runtime so the raw body is available for signature verification.
