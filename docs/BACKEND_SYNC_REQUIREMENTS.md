# Backend & sync requirements for a functioning, synced site (excluding checkout)

This doc lists **every data area** that currently lives only in localStorage and what backend/sync work is needed so the site behaves as a single, synced experience across browsers and devices. **Checkout** is excluded as requested.

---

## Current state (no real backend)

- **Auth**: Email/password stored in `registeredUsers` (localStorage). No server validation; “sign-in” is a local lookup. WebAuthn exists but points to an optional external API.
- **Profile**: `currentUser`, `profileImage`, `registeredUsers` — all localStorage. Admin can Export/Import JSON; no automatic sync for normal users.
- **Cart**: `cartItems`, `cartCount`, build/edit state (e.g. `selectedCapSize`, `*Price`) — all localStorage.
- **Wishlist**: `wishlistItems` — localStorage.
- **Orders**: `userOrders_${email}` (active + past) — localStorage. No server record.
- **Notifications / alerts**: `notifications_${email}`, `alertsPageViewed_*`, and many “seen” flags — localStorage.
- **Reviews**: `userSubmittedReviews_${email}`, last-seen counts — localStorage.
- **Referrals / affiliate**: `referralEarnings`, `referralNewActivity_*`, `affiliateSubmittedContent`, “seen” flags — localStorage.
- **Preferences**: `selectedCurrency`, `ordersPageAnimationsEnabled`, tier/subscription overrides (admin) — localStorage.

Anything that must “follow the user” across browsers/devices needs to move to a **backend** (your API or BaaS) and be loaded on sign-in and saved on change.

---

## 1. Auth (foundation)

**What you have:** Local array `registeredUsers`; sign-in = find user by email + compare password (normalized). No server check.

**What you need:**

- **Real authentication** so “signed in” is consistent and secure across devices:
  - **Option A – Backend auth API:** Your server (or serverless) validates email/password, returns a session token (e.g. JWT) or sets an HTTP-only cookie. Front end sends token/cookie on requests. Sign-in = call `POST /auth/signin`; sign-up = `POST /auth/signup`; sign-out = invalidate server-side.
  - **Option B – BaaS (Firebase Auth, Supabase Auth, Auth0, etc.):** They handle sign-up/sign-in/session. You get a stable user id (and often email). Front end uses that id for all “per-user” API calls.

**Best approach:** Use a **backend auth API** or **BaaS auth** so every device/browser shares the same notion of “who is signed in.” All other sync (profile, orders, etc.) is then keyed by this user id (or email).

**Scope:** Sign-up, sign-in, sign-out, session (and optionally password reset). Excludes checkout payment/auth.

---

## 2. User profile (account data)

**What you have:** `currentUser` (and mirror in `registeredUsers`): name, email, phone, birthday, addresses, membership, referral code, gift card balance, vouchers, digital cash history, social handles, etc. `profileImage` in localStorage.

**What you need:**

- **Profile API** (or BaaS tables):
  - **GET /users/me** (or `/profile`) — return full profile for the signed-in user. Called after sign-in and when opening account.
  - **PATCH /users/me** (or `/profile`) — update profile (name, phone, birthday, addresses, etc.). Called when user saves account/shipping/settings.
  - **Profile image:** Either store URL after upload (your API + storage, e.g. S3/Vercel Blob) or base64 in profile (simpler but heavier). Sync via the same GET/PATCH.

**Best approach:**  
- On **sign-in** (any browser): call GET profile, then write into `currentUser` (and optionally `registeredUsers`) so existing UI keeps working while you migrate.  
- On **profile/address/settings save**: call PATCH, then update local state/localStorage from response.  
- Treat backend as **source of truth**; localStorage as cache so the same profile appears everywhere.

**Scope:** Account profile, shipping addresses, settings, profile photo. Excludes payment methods (those are checkout-related if you treat them as such).

---

## 3. Orders (order history)

**What you have:** `userOrders_${email}` with `activeOrders` and `pastOrders` in localStorage. Concierge/notifications use this plus `orderStatusSeen_*` / `conciergeOrderSeen_*`.

**What you need:**

- **Orders API:**
  - **GET /orders** (or `/users/me/orders`) — list orders for the signed-in user (active + past). Replace or populate `userOrders_${email}` from this on sign-in and when opening account/orders/concierge.
  - **POST /orders** — create order (likely called from checkout; excluded here, but the backend must exist so GET can return the same data).
  - **PATCH /orders/:id** (optional) — if you support cancel or status updates from the app.
  - “Seen” state (e.g. which status updates the user has seen) can stay in localStorage per device, or be stored per user in the backend for full cross-device sync.

**Best approach:**  
- Backend is source of truth for order list and status.  
- On sign-in / account / orders page load: GET orders, merge into `userOrders_${email}` (or into app state if you phase out that key).  
- Order creation stays in checkout; the rest of the app only reads (and optionally marks seen).

**Scope:** Order list, status, concierge data. Excludes payment and checkout flow.

---

## 4. Cart

**What you have:** `cartItems`, `cartCount`, and many build/edit keys (selected options, prices) in localStorage. Cart is per browser.

**What you need:**

- **Cart API** (if you want cart to sync across devices):
  - **GET /cart** — return cart for signed-in user (items + optional build state).  
  - **PUT /cart** or **POST /cart/items** + **DELETE /cart/items/:id** — add/update/remove items.  
  - Optional: store “build state” (selected options) in backend so “build-a-wig” progress syncs too; or keep build state local and only sync final `cartItems`.

**Best approach:**  
- Sync **cart items** (and count) via API; on sign-in and when opening cart/shop, GET cart and replace `cartItems`/`cartCount`.  
- On add/remove/update: call API, then update local state from response.  
- Build/edit state can stay local at first; add later if you want it synced.

**Scope:** Cart contents (and optionally build state). Excludes checkout.

---

## 5. Wishlist

**What you have:** `wishlistItems` in localStorage.

**What you need:**

- **Wishlist API:**
  - **GET /wishlist** (or `/users/me/wishlist`) — list items.  
  - **POST /wishlist** (add), **DELETE /wishlist/:id** (remove).  
  - Optional: **PUT /wishlist** to replace whole list.

**Best approach:**  
- On sign-in and when opening wishlist: GET wishlist, write into `wishlistItems`.  
- On add/remove: call API, then update `wishlistItems` from response.  
- Backend is source of truth so the same list appears on every browser/device.

**Scope:** Wishlist items only. Excludes checkout.

---

## 6. Notifications / alerts

**What you have:** `notifications_${email}`, `alertsPageViewed_${email}`, and many “seen” flags (order status, concierge, affiliate, etc.) in localStorage.

**What you need:**

- **Notifications API** (if you want alerts to sync and “read” state to follow the user):
  - **GET /notifications** (or `/users/me/notifications**) — list notifications + read/unread.  
  - **PATCH /notifications/:id/read** or **POST /notifications/mark-read** — mark as read.  
  - Optionally: **alertsPageViewed** and other “seen” state stored per user so badges are consistent everywhere.

**Best approach:**  
- Backend stores notifications (and optionally “seen” state).  
- On sign-in and when opening alerts: GET notifications, replace or merge into `notifications_${email}` and update badge state.  
- When user marks read or views alerts: PATCH, then update local state.  
- You can phase in: start with “list + mark read” and move “seen” flags to the backend later.

**Scope:** In-app notifications and alert badges. Excludes checkout.

---

## 7. Reviews (user-submitted + “last seen” counts)

**What you have:** `userSubmittedReviews_${email}`, `reviewsNewApproved_*`, `reviewsLastSeenShopCount_*`, `reviewsLastSeenToolCount_*` in localStorage.

**What you need:**

- **Reviews API** (so “my reviews” and review-related alerts sync):
  - **GET /reviews/mine** (or `/users/me/reviews`) — list user’s submitted reviews.  
  - **POST /reviews** — submit review (may already be in checkout/order flow; if not, expose here).  
  - Optional: store “last seen” counts for shop/tool in backend so “new reviews” badge is consistent across devices.

**Best approach:**  
- Backend is source of truth for “my reviews.”  
- On sign-in and when opening reviews: GET and sync to local keys if you still use them.  
- “Last seen” can stay local at first, then move to backend if you want badges synced.

**Scope:** User’s reviews and review-related UI. Excludes checkout.

---

## 8. Referrals & affiliate

**What you have:** `referralEarnings`, `referralNewActivity_*`, `referralLastSeenCount_*`, `affiliateSubmittedContent`, `affiliateSeen_*` in localStorage.

**What you need:**

- **Referrals API:**
  - **GET /referrals/earnings** (or `/users/me/referrals`) — earnings and activity.  
  - **GET /referrals/activity** or include in same endpoint — for “new activity” and last-seen sync.  
- **Affiliate API** (if you use it):
  - **GET /affiliate/submissions** — list submitted content.  
  - **POST /affiliate/submit** — submit content.  
  - **PATCH /affiliate/.../seen** — mark items seen (optional, for cross-device badges).

**Best approach:**  
- Backend stores referral and affiliate data per user.  
- On sign-in and when opening referrals/affiliate: GET and populate or replace the current localStorage keys.  
- On submit or “mark seen”: call API, then update local state.

**Scope:** Referrals and affiliate content/state. Excludes checkout.

---

## 9. Preferences (currency, UI toggles, admin overrides)

**What you have:** `selectedCurrency`, `ordersPageAnimationsEnabled`, and (admin) `adminTierOverride`, `adminSubscriptionOverride` in localStorage.

**What you need:**

- **Preferences API** (optional but nice for full sync):
  - **GET /users/me/preferences** — currency, UI flags, etc.  
  - **PATCH /users/me/preferences** — save.  
  - Admin overrides can stay local or be stored in backend under admin-only endpoints.

**Best approach:**  
- If you want the same currency and key preferences everywhere: store in backend, GET on sign-in and when opening settings, PATCH on save.  
- If not critical, keep preferences localStorage-only and add API later.

**Scope:** User preferences and optional admin overrides. Excludes checkout.

---

## 10. Summary table (excluding checkout)

| Area            | Current store     | Backend needed                          | Load when           | Save when              |
|----------------|-------------------|-----------------------------------------|---------------------|------------------------|
| Auth           | registeredUsers   | Auth API or BaaS (sign-up/sign-in/session) | —                   | Sign-in / sign-up      |
| Profile        | currentUser, etc. | GET/PATCH profile (+ optional image)    | Sign-in, account    | Profile/address/settings save |
| Orders         | userOrders_*      | GET (and POST from checkout)            | Sign-in, orders/concierge | (Checkout only)        |
| Cart           | cartItems, etc.   | GET/PUT or POST/DELETE cart             | Sign-in, cart/shop  | Add/remove/update cart |
| Wishlist       | wishlistItems     | GET/POST/DELETE wishlist                | Sign-in, wishlist   | Add/remove wishlist     |
| Notifications  | notifications_*   | GET/PATCH notifications                | Sign-in, alerts     | Mark read / view        |
| Reviews        | userSubmittedReviews_* | GET/POST reviews (+ optional last-seen) | Sign-in, reviews    | Submit / mark seen      |
| Referrals      | referralEarnings, etc. | GET (and POST if you add server-side referral logic) | Sign-in, referrals  | (Server-side or submit) |
| Affiliate      | affiliateSubmittedContent | GET/POST/PATCH affiliate              | Sign-in, affiliate  | Submit / mark seen      |
| Preferences    | selectedCurrency, etc. | GET/PATCH preferences (optional)     | Sign-in, settings   | Save preferences        |

---

## Recommended implementation order

1. **Auth** — Backend or BaaS sign-up/sign-in/session. Everything else keys off “current user.”
2. **Profile** — GET on sign-in and account load; PATCH on profile/address/settings save. Enables “same account everywhere.”
3. **Orders** — GET orders for the user so history and concierge work across devices (order creation stays in checkout).
4. **Cart** — GET/PUT cart so the same cart appears on every device.
5. **Wishlist** — GET/POST/DELETE so wishlist syncs.
6. **Notifications** — GET/PATCH so alerts and “read” state sync (optional: “seen” flags later).
7. **Reviews** — GET/POST so “my reviews” and submission sync; optional “last seen” later.
8. **Referrals / affiliate** — GET (and POST/PATCH as needed) so those pages are synced.
9. **Preferences** — GET/PATCH last, or keep local if not critical.

---

## Tech options (high level)

- **Your own API:** Node (Express/Fastify), serverless (Vercel/Netlify functions), or similar. You own DB (e.g. Postgres) and schema. Full control; you implement every endpoint.
- **BaaS:** Firebase (Firestore + Auth), Supabase (Postgres + Auth), etc. Faster to ship; auth + CRUD per user are built-in. You still define “profile,” “orders,” “cart,” etc. as collections/tables and secure by user id.
- **Hybrid:** BaaS for auth (and maybe profile); your API for orders, cart, notifications, etc., keyed by the same user id.

---

## What is explicitly out of scope here

- **Checkout page** — Payment, payment methods, and order **creation** are excluded from this list. The **orders list** (GET) and “order history” sync are in scope; the act of paying and creating the order is not.
- **Route package protection** — Currently front end; docs say secret should live on backend. That’s checkout-adjacent; not covered in this sync list.
- **WebAuthn** — Already optional and points to an external API; can stay as-is or be integrated with your new auth backend.

---

## Before implementing

- Choose **auth** approach (your API vs BaaS).  
- Choose **storage** (your DB vs BaaS DB).  
- Implement **auth** first, then **profile**, then **orders/cart/wishlist**, then notifications/reviews/referrals/affiliate/preferences as needed.  
- For each area: add backend endpoints, then in the app call them on sign-in/load and on save, and keep writing to localStorage only as a cache from API responses so the app stays synced everywhere.
