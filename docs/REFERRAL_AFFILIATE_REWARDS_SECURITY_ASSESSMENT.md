# Referral, Affiliate & Rewards – Security & Loophole Assessment

## Summary

Assessment of the referral, affiliate, and rewards programs for loopholes and abuse. **One critical fix was implemented:** blocking use of one’s own referral code (apply + credit). Remaining issues are documented below with recommended mitigations.

---

## 1. REFERRAL PROGRAM

### 1.1 Fixed: Own referral code (implemented)

- **Risk:** User could apply their own referral code, get $20 off, and receive $20 digital cash when the order was confirmed.
- **Fix:** 
  - At apply time: if `ownerResult.user.email` equals current user `email`, show error: "YOU CANNOT USE YOUR OWN REFERRAL CODE."
  - At credit time: do not credit referrer when `(email || '').trim().toLowerCase() === (referrer.email || '').trim().toLowerCase()`.

### 1.2 Guest checkout + referral (addressed)

- **Behavior:** Referral code could previously be applied as a guest; referrer was credited and first purchase was not tied to an account.
- **Loophole:** Same person can (1) checkout as guest with code A → $20 off, referrer A gets $20; (2) later create an account with the same email → “first purchase” for that account; (3) use another referral code B → $20 off again. So one physical person can get multiple “first purchase” referral discounts by guest-then-signup or multiple accounts.
- **Recommendation:** Either (a) require sign-in to use a referral code and tie “first purchase” to account, or (b) persist “this email already used a referral” (e.g. `referralUsedByEmail` set) and block referral use for that email even for new accounts.

### 1.3 First-purchase check is client-only (leak)

- **Behavior:** `currentUserHasExistingOrders()` reads `userOrders_${email}` from `localStorage`.
- **Loophole:** User can clear `localStorage`, use another device, or create a new account with a new email. Each new “account” gets one “first purchase” referral discount. No server-side check that the same person already used a referral.
- **Recommendation:** Back referral eligibility and “first purchase” on server (e.g. by account id and/or persistent email → “used referral” flag). Treat `localStorage` as UI cache only.

### 1.4 No revocation when order is canceled (leak)

- **Behavior:** Referrer is credited $20 when the order is **confirmed** at checkout. There is no flow that deducts $20 if the order is later canceled or refunded.
- **Loophole:** Referrer keeps $20 even if the referred order is canceled.
- **Recommendation:** When an order that had a referral code is marked canceled/refunded, (a) deduct $20 from the referrer’s digital balance (or mark as reversed in ledger), and (b) update or remove the corresponding `referralEarnings` entry so “Invitees” / “You earned” stay correct.

### 1.5 Referral credit before delivery (design vs policy)

- **Behavior:** Referrer is credited as soon as the order is placed (confirmed), not when the order is marked **delivered**.
- **Note:** Code **activation** correctly requires the code owner to have a **delivered** order; only the **credit** to the referrer happens at confirm. If policy is “credit only after referred order is delivered,” credit should be moved to when that order’s status becomes DELIVERED (with cancellation handling as above).

---

## 2. AFFILIATE PROGRAM

### 2.1 Points and content status in localStorage (leak)

- **Behavior:** Delivered orders come from `userOrders_${email}`; submitted content (photos/videos/socials) and their `status` (pending/approved/rejected) are in `affiliateSubmittedContent` in `localStorage`. Points are derived from this data.
- **Loophole:** A user can edit `localStorage`: set content to `status: 'approved'`, add `pointsEarned` on orders, or add fake delivered orders. They can inflate affiliate points without real approvals.
- **Recommendation:** Store orders, content submissions, and approval state on the server. Admin approves content via backend; points are computed server-side and exposed via API. Frontend only reads and displays.

### 2.2 No server-side approval workflow

- **Behavior:** “Approval” is effectively a client-side or mock state. There is no backend that an admin uses to approve/reject content and then update points.
- **Recommendation:** Implement an admin approval flow that updates persistent state (DB) and recalculates points so the affiliate page reflects true approved points only.

---

## 3. REWARDS / MEMBERSHIP

### 3.1 Points from same localStorage sources (leak)

- **Behavior:** Membership/rewards points (e.g. `calculateTotalAffiliatePoints`) use the same orders and `pointsEarned` / `socialTags` from `userOrders_` and affiliate logic.
- **Loophole:** Same as affiliate: tampering with `localStorage` (orders, points, approved content) can inflate rewards/membership points.
- **Recommendation:** Same as affiliate: server-side orders, server-side approval, server-computed points. Frontend reads from API.

### 3.2 Loyalty points at checkout

- **Behavior:** Points earned at checkout are computed in the frontend and likely stored or used from client state.
- **Recommendation:** Ensure points are granted only after payment is confirmed by the backend, and that the backend persists and returns the user’s point balance so it cannot be forged client-side.

---

## 4. CROSS-CUTTING

### 4.1 All state in localStorage

- **Risk:** `registeredUsers`, `currentUser`, `userOrders_*`, `referralEarnings`, `affiliateSubmittedContent`, `giftCardBalance`, etc. are all in `localStorage`. Any determined user can alter or clear them.
- **Recommendation:** Move all authoritative state (users, orders, referral ledger, affiliate content/approvals, balances, points) to a backend with authentication. Use `localStorage` only for session/cache if needed.

### 4.2 No server-side validation of referral at order confirm

- **Risk:** A modified client could skip the “own code” or “first purchase” checks and still submit an order with a referral code; without server checks, the backend might still credit the referrer.
- **Recommendation:** When persisting an order (or processing payment), the server should (a) validate the referral code, (b) ensure referrer ≠ buyer, (c) ensure “first purchase” for that buyer (e.g. no prior order with a referral), and (d) credit the referrer only after these checks pass.

---

## 5. IMPLEMENTED FIX (code change)

- **File:** `src/pages/checkout/page.tsx`
  - In `handleApplyDiscountCode`, after `!ownerResult.isActive`: if `email` (buyer) equals `ownerResult.user.email` (code owner), show `"YOU CANNOT USE YOUR OWN REFERRAL CODE."` and return.
  - Before crediting the referrer: only credit when `(email || '').trim().toLowerCase() !== (referrer.email || '').trim().toLowerCase()`.

---

## 6. PRIORITY RECOMMENDATIONS

| Priority | Issue | Action |
|----------|--------|--------|
| High | Own referral code | Done (apply + credit blocked) |
| High | Referrer credit on cancel | Add cancel/refund flow that reverses $20 and updates referral ledger |
| High | Server-side referral checks | Validate referral + first-purchase + referrer≠buyer on order confirm/payment |
| Medium | Guest + multi-account referral | Require sign-in for referral and/or persist “email used referral” and enforce once per email |
| Medium | Credit after delivery | If policy is “credit when referred order delivered,” move credit to DELIVERED and tie to referral ledger |
| Medium | Affiliate/rewards tampering | Move orders, approvals, and points to backend; admin approval workflow |
| Long-term | Full backend | Move users, orders, referral, affiliate, rewards, and balances off localStorage to a secure backend |
