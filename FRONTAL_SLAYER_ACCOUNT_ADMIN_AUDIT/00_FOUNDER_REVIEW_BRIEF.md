# Founder Review Brief: Account and Admin

*A short version for decisions. The detail lives in the numbered docs; nothing here requires reading them.*
*Visual board of both trees: `PAGE_TREE_BOARD.html` (also published as a private page).*

---

## 1. Current account page tree

```
ACCOUNT (hub) ─ Concierge · Alerts · Orders (→ review) · Rewards (→ upgrade checkout) · Collectibles ·
               Slay Cam* · Reviews · Affiliate · Referrals · Payment · Shipping · Settings · Load Gift Card
WISHLIST ─ Lists ─ Shared list
Unlinked: Consult offer · Hairstyle analysis tool      Placeholders: /mobile/profile, concierge, rewards, analysis
```

## 2. Recommended account page tree

```
OVERVIEW (status panels + the same card grid)
├ ORDERS ── ORDER DETAIL (new) ── Leave a review
├ CONCIERGE (premium: messages with replies, offers, gifts)
├ REWARDS ── Membership · Points · Wallet (→ Load gift card) · Slay Challenge · Collectibles
├ MY HAIR (new) ── Hair profile · Analyses · Saved builds
├ WISHLIST ── Lists ── Shared list
├ REVIEWS & CONTENT ── Reviews · Submissions
├ EARN & SHARE ── Affiliate · Referrals
├ ALERTS
└ SETTINGS ── Addresses · Payment methods · My requests · Delete account
```

## 3. Current admin page tree

```
DASHBOARD (12 link cards, 2 of them Studio OS) ─ Revenue (5 sub-pages) · Clients (deleted) · Meetings ·
Pending · Reviews · Referrals · Marketing · Workers · Brand (copy editors) · Backend (Trend Desk, PSA Broadcast)
Bells → Messages · Alerts            Unlinked: Users · Notifications · Audit · Analytics · Schedule · Offers
No admin menu exists.
```

## 4. Recommended admin page tree

```
COMMAND CENTER (queues first)
ORDERS (new) ─ order detail · APPROVALS ─ published reviews · CUSTOMERS ─ customer detail (new), deleted ·
MEMBERSHIP & REWARDS (new) · MEETINGS ─ new appointment · INBOX (reply) · CATALOG & INVENTORY (new) ·
MARKETING ─ copy editors · FINANCE ─ accounting, fraud · BRAND · CONTENT STUDIO · TEAM · SYSTEM · STUDIO ↗
One admin menu (drawer) on every page.
```

## 5. Pages that are already usable

Settings (profile, password, delete account) · Wishlist · Sign-in · Stripe membership subscribe/upgrade · Consult offer modal · Admin Approvals queue (server-backed) · Admin Backend (audit log, users, Lounge TV) · Trend Desk · PSA Broadcast · Newsletter · Special offer config.

## 6. Pages that look finished but don't work

Account hub · Orders · Rewards · Affiliate · Shipping addresses · Slay Cam · Admin dashboard · Clients · Deleted accounts · Revenue · Edit inventory · Admin reviews.

## 7. Pages missing entirely

Customer order detail · My Hair · Support request history · Admin orders · Admin order detail · Admin customer detail · Membership & rewards console · Inventory.

## 8. Major navigation inconsistencies

- There is no shared account layout. Twelve pages carry their own copy of the nav bar, and there are four different sign-outs.
- Every move between account pages reloads behind a "Loading…" screen.
- Back arrows go to different places.
- There is no admin menu, and six real admin pages can't be reached from any link.
- "Notifications" means four different things in admin.
- Studio OS cards sit at the top of the business dashboard.
- On tablet and desktop, `/account` jumps to the Desktop Penthouse, which uses different numbers.

## 9. Customer features with no admin counterpart

Loyalty points · Vouchers · Digital cash / gift-card codes (admin codes never reach customers) · Slay Challenge · Slay Quests · Hair-analysis credits and results · Saved builds · Free and birthday gifts · Referral credits · Customer support replies.

## 10. Admin actions customers never see

- Tracking numbers and stage changes
- Order cancel and "refund"
- Inventory edits
- Promo and gift codes
- Block or restore client
- Alerts and nudge copy edits
- Meeting cancel and reschedule

## 11. Shared architectural fixes

1. Security and money hotfix pack
2. A real server order record
3. Shared page shells and one account sign-in check (no visual change)
4. One rewards ledger (points, wallet, vouchers, codes)
5. Remove mock data from live screens

## 12. Most efficient completion sequence

0A approve trees → 0B hotfixes → 1 orders and shared shells → 2 customer core ∥ 3 admin core → 4 rewards → 5 Hair, Build-A-Wig and community → 6 affiliate, marketing, support → 7 QA

## 13. Approvals required from you

| # | Decision | Recommendation |
|---|---|---|
| 1 | Run a security and money hotfix sprint, including a production database migration | **Yes, first** |
| 2 | Add the server order tables now (0 live orders, so lowest risk) | **Yes** |
| 3 | Build-A-Wig card checkout until server pricing exists | Pause card checkout for custom builds and confirm quotes manually |
| 4 | Turn off the non-Stripe "confirm order" for membership in production | **Yes** |
| 5 | Make "cancel subscription" open the Stripe customer portal | **Yes** |
| 6 | Remove mock/demo data from live screens (keep it behind a demo flag) | **Yes** |
| 7 | Approve the customer tree (adds Order detail and My Hair; retires the consult-offer page) | Approve |
| 8 | Approve the admin tree (adds Orders, Customer detail, Rewards console, Inventory; folds 10 URLs into tabs) | Approve |
| 9 | Slay Challenge: 3 phases vs 4 tiers? Who is eligible? | Your call |
| 10 | Points formula, affiliate (400/600?) and referral ($20?) amounts | Your call |
| 11 | Remove or label the invented Slay Cam stats and testimonials | **Yes, now** |
| 12 | Consent wording for customer photos, videos and selfies | Your wording |
| 13 | Stage durations (SLAs) for "delayed order" alerts | Your numbers |

The full list is in doc 24.
