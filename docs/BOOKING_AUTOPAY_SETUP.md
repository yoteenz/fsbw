# Booking final-payment autopay (install / re-install)

This project now supports a backend autopay pipeline for booking final balances (48 hours before appointment), with retries, failure tracking, and admin visibility endpoints.

## What is implemented

1. **Checkout → meeting metadata**
   - `postBookingAppointmentMeeting(...)` now supports:
     - `bookingStripeCustomerId`
     - `bookingStripePaymentMethodId`
     - `bookingAutopayConsent`
     - `bookingAutopayConsentAt`
   - API route `POST /api/booking/appointment-meeting` stores these fields in `meetings.metadata`.

2. **Stripe PaymentIntent enrollment support**
   - `POST /api/stripe/create-product-payment-intent` accepts:
     - `savePaymentMethodForFuture: boolean`
     - `stripeCustomerId?: string`
   - When enabled, it:
     - creates/uses Stripe customer,
     - sets `setup_future_usage: 'off_session'`,
     - returns `stripeCustomerId`.
   - Webhook (`payment_intent.succeeded`) now stores:
     - `profiles.stripe_customer_id`
     - `profiles.stripe_default_payment_method_id`
     for checkout enrollments.

3. **Autopay scheduler endpoint**
   - `POST /api/booking/autopay-final-payment`
   - Auth required:
     - `Authorization: Bearer <BOOKING_AUTOPAY_CRON_SECRET>`
   - Works by scanning due meetings and charging off-session via Stripe.
   - Supports retries with exponential backoff and writes attempt rows.

4. **Failure handling + user notifications**
   - On success/failure/skipped, writes to `booking_autopay_attempts`.
   - Updates `meetings.metadata.bookingAutopayStatus` and related fields.
   - Appends account notifications for success/failure outcomes.

5. **Admin visibility endpoint**
   - `GET /api/admin/booking-autopay-attempts`
   - Optional query params:
     - `meeting_id`
     - `user_id`
     - `status` (`succeeded` | `failed` | `cancelled` | `skipped`)
     - `limit`

## Required DB migrations

Run both:

- `supabase/migrations/20260403200000_booking_autopay_attempts.sql`
- `supabase/migrations/20260403203000_profiles_stripe_default_payment_method.sql`

## Required environment variables

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `BOOKING_AUTOPAY_CRON_SECRET` (new; random long secret)

## Vercel cron

`vercel.json` includes:

- `0 * * * *` → `/api/booking/autopay-final-payment`

Vercel cron requests must include the bearer token. If your cron integration does not inject Authorization automatically, call this endpoint from a secured external scheduler or a Vercel workflow that can add headers.

## Important current limitation

The backend autopay pipeline is fully implemented, but **booking checkout currently still uses the local/manual card flow** in `src/pages/checkout/page.tsx`, not Stripe.js card confirmation for product orders.

Result:

- You can schedule and run autopay only when a user profile already has:
  - `stripe_customer_id`
  - `stripe_default_payment_method_id`
- Membership Stripe flow can populate customer id, but booking product checkout does not yet natively confirm card via Stripe.js in this UI path.

For true always-on booking autopay from the same initial booking card, wire booking card checkout to Stripe PaymentIntents + Stripe.js confirmation in the checkout UI.

