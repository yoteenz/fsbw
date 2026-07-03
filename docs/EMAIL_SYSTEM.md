# Frontal Slayer transactional email system

Server-side automated emails using **Resend** and reusable **Frontal Slayer** HTML templates (marble background, `#EB1C24` accents, glass panels, uppercase UI text). API keys never touch the frontend.

## Setup

1. **Resend** — set on Vercel (and `.env.local` for local API testing):
   - `RESEND_API_KEY=re_...`
   - `SITE_URL=https://your-app.vercel.app` (CTA links)
   - Branded senders use verified `@frontalslayer.com` addresses automatically per template (see **Sender addresses** below). Optional dev override: `TRANSACTIONAL_FROM_EMAIL` or `EMAIL_FROM_<CATEGORY>`.

2. **Supabase Storage assets** (optional but recommended for production):
   - Run migration `supabase/migrations/20260703120000_email_assets_bucket.sql`
   - Upload base assets: `npm run email:upload-assets` (needs `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`)
   - **Generate Fal hero scenes** (matches reference design boards): `FAL_KEY=... npm run email:generate-heroes` then `npm run email:upload-assets`
   - Bucket: `email-assets` — marble background, rose, diamond, FS monogram, `heroes/{templateType}.webp`
   - Optional: `REFERENCE_IMAGE=path/to/cropped-reference.png` when running generate script for closer Fal edit match
   - After generation, `public/assets/email/heroes/manifest.json` lists ready heroes; layout uses Fal WebPs when listed, rich HTML glass fallback otherwise

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

### Sender addresses (Resend `from`)

Each `templateType` maps to a branded `@frontalslayer.com` sender via `api/_lib/email/emailSenderMap.ts`:

| Sender category | From address | Template groups |
|-----------------|--------------|-----------------|
| `orders` | Frontal Slayer Orders `<orders@frontalslayer.com>` | All order lifecycle templates |
| `rewards` | Frontal Slayer Rewards `<rewards@frontalslayer.com>` | Points, vouchers, tier, birthday, special offer, membership welcome |
| `concierge` | Frontal Slayer Concierge `<concierge@frontalslayer.com>` | Consult offers, meeting reschedule/cancel |
| `creators` | Frontal Slayer Creators `<creators@frontalslayer.com>` | Affiliate program emails |
| `contact` | Frontal Slayer Contact `<contact@frontalslayer.com>` | Brand contact form notifications to admin (inbound only) |
| `support` | Frontal Slayer Support `<support@frontalslayer.com>` | Password reset, verification, login alerts |
| `hello` | Frontal Slayer `<hello@frontalslayer.com>` | Welcome, profile updates, newsletter, back-in-stock, wishlist alerts |

Admin Marketing newsletter bulk sends use `hello@`. No separate inboxes — Resend routes by verified domain + `from` field only. **Do not reply by email** — every transactional template includes a support footer linking members to **Account → Concierge → Priority Messages** (`/account/concierge#priority-messages`), which posts to **`POST /api/client/priority-messages`** and appears in **Admin → Messages** inbox.

Optional overrides: `TRANSACTIONAL_FROM_EMAIL` (all sends), `EMAIL_FROM_ORDERS`, `EMAIL_FROM_REWARDS`, `EMAIL_FROM_CREATORS`, etc.

### Common variables

`customerName`, `orderNumber`, `pointsAmount`, `balance`, `expirationDate`, `trackingNumber`, `trackingLink`, `paymentAmount`, `submissionDate`, `platformName`, `contentType`, `voucherType`, `ctaUrl`, `ctaLabel`, `resetLink`, `verifyLink`, `estimatedDate`, `productName`, `referralPoints`, `digitalCashAmount`, `declineReason`, `tierName`, `discountCode`, `redeemedFor`, `htmlBody`

Use `{{variableName}}` in template copy where supported.

## HTTP API

**POST `/api/send-email`** or **POST `/api/email/send`** — admin session **or** `X-Email-Send-Secret`.

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
