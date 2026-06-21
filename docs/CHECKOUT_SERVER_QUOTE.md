# Server-side checkout quote & Stripe product payments

This project historically totals carts **in the browser**. The following adds a **server-authoritative USD** path you can grow into full hardening, plus **multi-currency Stripe charges** for server-resolvable carts.

## What is implemented

1. **`POST /api/checkout/quote`** (public)  
   - Body: `{ "lines": [ ... ], "chargeCurrency": "EUR" }` — same shape as `cartItemsToQuoteLines()` in `src/utils/checkoutQuote.ts` (identity fields only; **ignore** client `price` on the server).  
   - Response: `{ ok: true, quote }` with `totalCents` (USD), `chargeCurrency`, `chargeAmountMinor`, `fxRate`, `fxAsOf`, `lines[]`, `fullyResolved`, `warnings`.

2. **`GET /api/fx/rates`** (public)  
   - Returns `{ ok: true, asOf, base: "USD", rates }` — same table as `src/utils/defaultCurrencyRates.ts` / `api/_lib/pricing/fxRates.ts`.

3. **Server pricing** — `api/_lib/pricing/resolveQuote.ts`  
   - **Fully resolved:** `booking-appointment` (install + add-ons), `booking-consult` ($40 deposit), simple **unit** names in the catalog (`NOIR`, `BLANCO`, `SOFT CURL`, …) + cap-size surcharge.  
   - **Not fully resolved yet:** `bcfBundleDeal` lines, build-a-wig custom lines, gift cards, membership — these return `resolved: false` and warnings.

4. **FX conversion** — `api/_lib/pricing/fxRates.ts`  
   - Converts USD cents → Stripe minor units in `chargeCurrency` (zero-decimal currencies: JPY, KRW, VND, CLP, …).  
   - Used by quote + PaymentIntent; metadata stores `usd_total_cents`, `charge_currency`, `charge_amount_minor`, `fx_rate`, `fx_as_of`.

5. **Checkout UI** — `src/pages/checkout/page.tsx`  
   - Uses shared `DEFAULT_CURRENCY_RATES` for display (full currency list).  
   - When Stripe product card fields are active, fetches server quote in `selectedCurrency` and shows **“YOUR CARD WILL BE CHARGED …”** disclosure.  
   - **Order subtotal / tax / shipping** still use the client pipeline for display; Stripe PI uses **server line-item USD** converted to charge currency (not full checkout subtotal yet).

6. **`POST /api/stripe/create-product-payment-intent`** (requires Supabase **Bearer** token)  
   - Body: `{ lines, chargeCurrency? }` — recomputes USD total, converts to `chargeCurrency`, creates PI in that currency.  
   - Returns `{ clientSecret, paymentIntentId, quote }`.  
   - **Rejects** if any line is unresolved (`400`).  
   - Frontend: `createProductPaymentIntent(lines, chargeCurrency)` → `confirmProductCheckoutPayment` in `productCheckoutStripe.ts`.

7. **Stripe webhook** — `api/stripe/webhook.ts`  
   - Handles **`payment_intent.succeeded`** when `metadata.purpose === 'product_order'`.  
   - Appends a minimal order object to the user’s **`orders`** JSONB (`active_orders`) via service role, **idempotent** on `stripePaymentIntentId`.

## Environment

- Same as existing Stripe membership: **`STRIPE_SECRET_KEY`**, **`STRIPE_WEBHOOK_SECRET`**, **`SUPABASE_SERVICE_ROLE_KEY`** (for webhook + PaymentIntent metadata → profile).  
- **`SITE_URL`** is only required for **Stripe Checkout** redirects (membership); PaymentIntents still need a valid Stripe secret.

## Stripe Dashboard

On your webhook endpoint, add:

- `payment_intent.succeeded` → `https://<your-deployment>/api/stripe/webhook`

(Existing membership events stay as they are.)

## Currency policy

- **Catalog / settlement reference:** USD on the server (`resolveQuote.ts`).  
- **Shopper picker:** `selectedCurrency` in localStorage (per user).  
- **Stripe product checkout:** PaymentIntent amount + currency match server quote `chargeCurrency` / `chargeAmountMinor` when the cart is fully server-resolvable.  
- **Not multi-currency yet:** membership Checkout Session, booking autopay, gift-card ledger, carts with BCF/BAW custom lines.

## Next steps (optional)

- Expand `resolveQuote.ts` with BCF bundle math (bundle list subtotal − discount) using the same rules as `bcfProductOptions.ts`.  
- Align server quote with full checkout subtotal (tax, shipping, vouchers) for PI amount.  
- Replace static FX table with a daily provider feed; store `fx_as_of` from provider.  
- After payment succeeds, **clear cart** and navigate to summary using **client** flow only after PI confirms (or rely on webhook + sync).
