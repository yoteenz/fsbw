# 17 — Slay Cam, Community and Affiliate Workflow Audit

Full evidence: `appendix/F_hair_baw_slaycam.md` §4 and `appendix/B_membership_rewards.md` §8.

## 1. What Slay Cam actually is

`/slay-cam` is **a static marketing gallery**. It is not a camera, a try-on tool or a live UGC feed.
- 8 hardcoded posts with fabricated names ("MAYA R.", "JANELLE K.", "ARI S."), save counts and points.
- Fabricated stats: "128 FEATURED SLAYS / 42K LOOK SAVES / 18 MVP WINNERS".
- The Slay MVP is simply `SLAY_CAM_POSTS[0]`.
- "SUBMIT YOUR LOOK" goes to `/account`, whose SLAY CAM card links back to `/slay-cam`. This is a circular dead end.
- No table, API or storage bucket exists for Slay Cam.
- `/mobile/slay-cam` is a placeholder and `/desktop/slay-cam` is a deprecated redirect.

**Risk:** fabricated testimonials and engagement numbers presented as real community activity. **Immediate recommendation (FD-C11):** label the gallery as editorial or curated, or remove the stats and named testimonials, until real submissions exist. This is copy only and can be done without redesign.

## 2. UGC capability matrix

| Capability | Status | Notes |
|---|---|---|
| UGC submission (Slay Cam) | MISSING | — |
| Media upload | Reviews and affiliate media go in as **base64 data URLs into DB columns / localStorage**, with no storage bucket. Large videos fail silently. | Needs a bucket with size and type limits |
| Submission ownership | Reviews: JWT user, but `orderId` is not sent and `verified_purchase: true` is hardcoded | M3 |
| Moderation queue | `/admin/pending` REVIEWS and AFFILIATE tabs **work and are audited**. No `.catch` on failure, so failures are silent | Keep, harden |
| Approval / rejection | Works. A rejection deletes the review from the customer's list with **no reason shown**. Supplemental-media decline reasons are stored but not shown. | — |
| Customer-visible status | Pending is hidden; declined disappears; a "new approved review" badge is set at submit time | Fix in MY REVIEWS & CONTENT |
| Slay MVP selection | MISSING (hardcoded) | — |
| Reward issuance on approval | **None for reviews.** Affiliate approval writes `points ?? 100` to JSON only | Ledger (S4) |
| Publication | **Published reviews appear nowhere public** (brand and PDP show "coming soon") | Needs a public review read endpoint |
| Permissions / consent before publishing | **No consent capture** for review, affiliate or Slay Cam media | Required before any public display |
| Content removal | Admin unpublish API exists with **no UI**. Customers cannot delete their own reviews. Reviews keep PII after account deletion (`on delete set null`). | — |
| Reporting | Lounge comments: report increments a counter with no dedupe and **no admin queue**. Reviews: no reporting. | — |
| Lounge TV content | An admin-authored CMS (works). Not UGC. | — |

## 3. Affiliate workflow

| Step | Status |
|---|---|
| Eligibility / activation | No affiliate role or application. Any signed-in customer with orders can submit per order. |
| Tracking | Per-order photo/video/social submissions |
| Submission | Server insert into `pending_affiliate_submissions` **works**. The UI always shows success even if the call fails. |
| Verification | Admin approve/decline with reason, audited, with email |
| Reward calculation | **Wrong:** 100 points written to JSON instead of 400/600, and never credited to a ledger |
| Limits (caps per unit per 6-month cycle) | Client-side display only |
| Manual review | Yes (Approvals) |
| Rejection explanations | Reason stored and emailed (default "DOES NOT MEET GUIDELINES") |
| Audit history | `audit_log` rows `pending_affiliate.approve/decline` |
| Duplicate-award prevention | Re-approval is not blocked (harmless only because no points are credited). Customer delete is local only, so the server row stays approvable. |
| Customer ↔ admin reconciliation | **No.** The customer's points view shows purchase points; the admin tally reads the admin's own localStorage. |

## 4. Recommended path

1. **Now (copy only, FD-C11):** remove fabricated Slay Cam stats and testimonials, or label them; point "SUBMIT YOUR LOOK" at MY REVIEWS & CONTENT with an honest "coming soon".
2. **Phase 5:**
   - `content_submissions` table and storage bucket (S10).
   - Consent checkbox and usage-rights text (founder-approved wording).
   - An APPROVALS › SLAY CAM tab using the existing Approvals modal.
   - An MVP flag.
   - A public read endpoint for published reviews and featured Slay Cam posts.
   - MY REVIEWS & CONTENT showing status and reason.
   - A Lounge reported-comments queue tab in Approvals.
3. **Phase 6:**
   - The affiliate approval writes `loyalty_ledger` with the canonical amounts (FD-R10) and server-side caps keyed by `(user, order/unit, period)` for duplicate prevention.
   - Fix the honest submit result.
