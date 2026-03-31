# Server-side checkout quote & Stripe product payments

This project historically totals carts **in the browser**. The following adds a **server-authoritative USD** path you can grow into full hardening.

## What is implemented

1. **`POST /api/checkout/quote`** (public)  
   - Body: `{ "lines": [ ... ] }` — same shape as `cartItemsToQuoteLines()` in `src/utils/checkoutQuote.ts` (identity fields only; **ignore** client `price` on the server).  
   - Response: `{ ok: true, quote }` with `totalCents`, `lines[]`, `fullyResolved`, `warnings`.

2. **Server pricing** — `api/_lib/pricing/resolveQuote.ts`  
   - **Fully resolved:** `booking-appointment` (install + add-ons), `booking-consult` ($40 deposit), simple **unit** names in the catalog (`NOIR`, `BLANCO`, `SOFT CURL`, …) + cap-size surcharge.  
   - **Not fully resolved yet:** `bcfBundleDeal` lines, build-a-wig custom lines, gift cards, membership — these return `resolved: false` and warnings.

3. **Checkout UI** — `src/pages/checkout/page.tsx`  
   - Fetches the quote when the cart changes and shows **SERVER LIST (USD, VERIFIED LINES)** when the server total is &gt; 0.  
   - **Order amount / subtotal** on the page still use the existing client pipeline (taxes, shipping, vouchers, etc.). The server line is a **parity / verification** row until you wire payment to Stripe.

4. **`POST /api/stripe/create-product-payment-intent`** (requires Supabase **Bearer** token)  
   - Recomputes the total from `lines` (same as quote).  
   - Returns `{ clientSecret, paymentIntentId, quote }`.  
   - **Rejects** if any line is unresolved (`400`).  
   - Frontend helper: `createProductPaymentIntent(lines)` in `src/utils/api.ts`.

5. **Stripe webhook** — `api/stripe/webhook.ts`  
   - Handles **`payment_intent.succeeded`** when `metadata.purpose === 'product_order'`.  
   - Appends a minimal order object to the user’s **`orders`** JSONB (`active_orders`) via service role, **idempotent** on `stripePaymentIntentId`.

## Environment

- Same as existing Stripe membership: **`STRIPE_SECRET_KEY`**, **`STRIPE_WEBHOOK_SECRET`**, **`SUPABASE_SERVICE_ROLE_KEY`** (for webhook + PaymentIntent metadata → profile).  
- **`SITE_URL`** is only required for **Stripe Checkout** redirects (membership); PaymentIntents still need a valid Stripe secret.

## Stripe Dashboard

On your webhook endpoint, add:

- `payment_intent.succeeded` → `https://<your-deployment>/api/stripe/webhook`

(Existing membership events stay as they are.)

## Currency policy (for now)

- **Settlement:** USD only for PaymentIntents created here.  
- **Currency selector** in the app remains **display / conversion** until you add a **server FX rate table** and charge in non-USD currencies.

## Next steps (optional)

- Expand `resolveQuote.ts` with BCF bundle math (bundle list subtotal − discount) using the same rules as `bcfProductOptions.ts`.  
- Replace `CONFIRM ORDER` on card pay with **Stripe.js** + `createProductPaymentIntent` + `confirmCardPayment`.  
- After payment succeeds, **clear cart** and navigate to summary using **client** flow only after PI confirms (or rely on webhook + sync).
