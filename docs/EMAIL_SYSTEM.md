# Frontal Slayer transactional email system

Server-side automated emails using **Resend** and reusable **Frontal Slayer** HTML templates (marble background, `#EB1C24` accents, glass panels, uppercase UI text). API keys never touch the frontend.

## Setup

1. **Resend** — set on Vercel (and `.env.local` for local API testing):
   - `RESEND_API_KEY=re_...`
   - `TRANSACTIONAL_FROM_EMAIL=Frontal Slayer <hello@yourdomain.com>` (or reuse `NEWSLETTER_FROM_EMAIL`)
   - `SITE_URL=https://your-app.vercel.app` (CTA links)

2. **Supabase Storage assets** (optional but recommended for production):
   - Run migration `supabase/migrations/20260703120000_email_assets_bucket.sql`
   - Upload assets: `npm run email:upload-assets` (needs `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`)
   - Bucket: `email-assets` — marble background, rose, diamond, FS monogram

3. **Internal send API** (optional):
   - `EMAIL_SEND_SECRET` — long random string; send header `X-Email-Send-Secret` with `POST /api/email/send`

## Server-side `sendEmail`

```ts
import { sendEmail } from '../_lib/email/sendEmail.js';

await sendEmail({
  templateType: 'order_confirmed',
  recipientEmail: 'member@example.com',
  subject: 'Optional override',
  variables: {
    customerName: 'Kateena',
    orderNumber: 'ORDER #FS12345',
    ctaUrl: 'https://fsbw.vercel.app/account/orders',
  },
});
```

### `templateType` values

| Category | Types |
|----------|--------|
| Account | `welcome`, `email_verification`, `email_confirmed`, `password_reset`, `password_reset_success`, `password_changed`, `profile_updated`, `email_updated`, `account_login_alert` |
| Orders | `order_received`, `order_confirmed`, `order_processing`, `order_shipped`, `order_out_for_delivery`, `order_delivered`, `order_delayed`, `order_canceled`, `payment_received`, `partially_shipped` |
| Rewards | `points_earned`, `points_redeemed`, `points_expiring`, `voucher_expiring`, `referral_redeemed`, `digital_cash_update`, `tier_upgraded`, `birthday_reward`, `membership_welcome`, `special_offer` |
| Affiliate | `affiliate_content_received`, `affiliate_content_pending`, `affiliate_content_approved`, `affiliate_content_denied`, `affiliate_points_earned`, `affiliate_payment_sent` |
| Shop / alerts | `back_in_stock`, `wishlist_price_drop`, `consult_offer_sent`, `meeting_reschedule`, `meeting_cancel`, `newsletter` |

### Common variables

`customerName`, `orderNumber`, `pointsAmount`, `balance`, `expirationDate`, `trackingNumber`, `trackingLink`, `paymentAmount`, `submissionDate`, `platformName`, `contentType`, `voucherType`, `ctaUrl`, `ctaLabel`, `resetLink`, `verifyLink`, `estimatedDate`, `productName`, `referralPoints`, `digitalCashAmount`, `declineReason`, `tierName`, `discountCode`, `redeemedFor`, `htmlBody`

Use `{{variableName}}` in template copy where supported.

## HTTP API

**POST `/api/email/send`** — admin session **or** `X-Email-Send-Secret`.

```json
{
  "templateType": "welcome",
  "recipientEmail": "you@example.com",
  "variables": { "customerName": "SLAYER" }
}
```

Preview HTML without sending: `"preview": true`

## Wired triggers (current codebase)

| Event | Template |
|-------|----------|
| Stripe product `payment_intent.succeeded` → new order | `order_confirmed`, `payment_received` |
| Stripe subscription checkout completed | `membership_welcome` |
| Client affiliate submission | `affiliate_content_pending` |
| Admin pending affiliate approve / decline | `affiliate_content_approved` / `affiliate_content_denied` |
| Admin password reset | `password_reset` (branded link via Supabase `generateLink`) |
| Admin meeting reschedule / cancel alert | `meeting_reschedule` / `meeting_cancel` |
| Admin consult offer sent | `consult_offer_sent` |
| First profile create (PATCH /api/profile) | `welcome` |
| Stripe order + points | `points_earned` (with order confirm) |
| Admin revenue — tracking saved | `order_shipped` / status-based |
| Unit restock waitlist | `back_in_stock` |
| Daily cron (14:00 UTC) | `voucher_expiring` |

## Debug preview page

**`/tools/email-templates`** (admin only) — tabbed catalog by category (Account, Orders, Rewards, Affiliate, Shop) with live HTML iframe previews via `POST /api/email/send` (`preview: true`).

Call `triggerTransactionalEmail` / `triggerTransactionalEmailForUser` from `api/_lib/email/triggers.ts` when adding new server events.

## Admin newsletter

Admin → Marketing → Newsletter still sends custom HTML via `POST /api/admin/newsletter-send`. To wrap content in the brand shell, use `templateType: 'newsletter'` with `variables.htmlBody`.
