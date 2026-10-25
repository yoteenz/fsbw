# 10 — Community, Affiliate and Content Architecture

Evidence: audit doc 17, `appendix/B` §7–8 and `appendix/F` §4. Reward values are **not set here**; they come from founder decisions D6 and D7 (doc 16, with reconciliation in doc 08).

## 1. One content pipeline

Reviews media, affiliate submissions and Slay Cam looks become rows in a single **`content_submissions`** model. The existing `pending_affiliate_submissions` and `pending_review_supplemental` queues are migrated into it or exposed as views, so admins moderate in one place (APPROVALS).

```
customer submits ─► storage bucket (private, size/type limits)
                 ─► content_submissions (status: pending, consent_version, owner, kind, links to order/review/unit)
admin APPROVALS ─► approve  ─► status approved · reward ledger entry (idempotent per source) · customer alert
                ─► decline  ─► status declined · reason (customer-visible) · customer alert
                ─► feature  ─► (Slay Cam) featured=true · MVP flag (decision F4) · public read endpoint
customer ─► REVIEWS & CONTENT › SUBMISSIONS shows status + reason · can withdraw before approval · delete own
```

| Kind | Source surface | Moderation | Reward (decision) | Public display |
|---|---|---|---|---|
| Review (+ photo/video) | Order detail › LEAVE A REVIEW (server-verified purchase) | APPROVALS › REVIEWS | D7 (review content points) | Product reviews tab + `/brand/reviews` (decision F3) |
| Supplemental review media | REVIEWS & CONTENT | APPROVALS › REVIEWS | D7 | with the review |
| Affiliate photo / video / social | `/account/affiliate` | APPROVALS › AFFILIATE | D6 (400/600/600 and caps, pending reconciliation) | none by default |
| Slay Cam look | `/slay-cam` → "SUBMIT YOUR LOOK" (from REVIEWS & CONTENT) | APPROVALS › SLAY CAM | D6/F4 (MVP reward) | `/slay-cam` gallery (featured only) |
| Lounge comment | Lounge | Posted live; **REPORTED COMMENTS** queue in APPROVALS (threshold decision F5) | none | Lounge |

## 2. Rules the server enforces

- **Ownership.** `owner_id` comes from the JWT. Emails come from the account, never the request body (today `client/submissions` trusts the body email).
- **Purchase verification for reviews.** The `order_id` must belong to the customer and be **delivered**. `verified_purchase` is derived from that, never hardcoded.
- **Consent.** Each submission stores `consent_version` and timestamp. The wording is decision F2. Nothing is publicly displayed without consent plus approval.
- **Caps and duplicates for rewards.** Ledger source key `(kind, unit_or_order, period, platform)` unique. Caps are checked inside the approval transaction. Re-approval cannot pay twice.
- **Withdrawal and removal.** The customer can withdraw while pending and delete their own reviews. On account deletion, submissions are anonymised or removed (decision F2 retention).
- **Media.** A private bucket with signed URLs. Approved public items are copied to a public path. Limits: images ≤10 MB, video ≤100 MB, MIME allow-list. The base64-in-database pattern is retired.
- **Reporting.** Report dedupe per user; auto-hide at a threshold (decision F5); every moderation action is audit-logged.

## 3. Slay Cam

| Stage | Plan |
|---|---|
| Now (S0B-2) | Remove or label the fabricated stats and named testimonials (decision F1). "SUBMIT YOUR LOOK" goes to REVIEWS & CONTENT with "Opening soon". |
| S5 | Submission flow (photo plus optional unit link); APPROVALS › SLAY CAM; featured gallery from approved, consented rows; MVP flag per period (decision F4) |
| Visual | **Keep the existing `/slay-cam` page design.** Only its data source changes from `SLAY_CAM_POSTS` to approved rows. Empty state: "The first Slay Cam features are coming." |

## 4. Affiliate program

- **Eligibility:** any signed-in customer with a delivered order for the unit (code evidence: per-order submissions). Whether an application or activation step is wanted is decision D6.
- **Points:** posted to `loyalty_ledger` on approval, at canonical amounts. Caps are enforced on the server by period (6-month cycles, per doc 08) and by product or unit.
- **Customer view:** points per order from the ledger (fixes the bug where purchase points show as content points); caps remaining; status and decline reasons in SUBMISSIONS.
- **Admin view:** APPROVALS › AFFILIATE (moderation), REWARDS console (points ledger and caps).

## 5. Referral program

`referral_code` gets a unique index on the server. Validation at checkout runs on the server (code exists; not self; buyer's first purchase). Qualification fires on the order status chosen in decision D8 (confirmed, shipped or delivered). The credit is a `wallet_ledger` entry (amount per D8) with a reversal if the order is refunded or cancelled. The referrals page and admin referrals tab read `referral_earnings` and the ledger.

## 6. Customer support (content-adjacent)

`support_requests` with messages: one thread model behind Concierge priority messages, SETTINGS › MY REQUESTS, order-detail "Need help?", brand contact and FAQ questions. Admin INBOX shows threads with reply, assign and resolve. Every reply notifies the customer (email + alert) and shows in their thread.
