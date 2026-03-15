# Activity tracking (admin Activity tab)

The admin client detail page has an **Activity** tab that shows a timeline of the client’s actions on the site (sign in/out, view product, add to cart, place order, etc.).

## Backend

- **Table:** `user_activity` (see `supabase/migrations/003_user_activity.sql`). Run this migration after `002_admin_gaps.sql`.
- **Record:** `POST /api/activity` — body: `{ eventType: string, payload?: object }`. Requires authenticated user (Bearer token).
- **Admin read:** `GET /api/admin/activity?user_id=...` — returns events for that user, newest first.

## Frontend

- **Record:** `recordActivity(eventType, payload)` in `src/utils/api.ts`, or `trackActivity(eventType, payload)` in `src/utils/activity.ts` (same thing, with typed event names).
- **Event types:** `sign_in`, `sign_out`, `view_product`, `view_page`, `add_to_cart`, `add_to_wishlist`, `remove_from_cart`, `remove_from_wishlist`, `place_order`, `cancel_order`, `add_review`, `redeem_points`, `profile_update`, `checkout_start`, `checkout_complete`.

## Where to call `trackActivity`

To populate the Activity tab, call `trackActivity(eventType, payload)` (from `src/utils/activity`) in these flows:

| Event            | Where to call |
|------------------|----------------|
| `sign_in`        | After successful sign-in (e.g. sign-in page when auth succeeds and you set currentUser / redirect). |
| `sign_out`       | Wherever sign-out runs (e.g. account menu or sign-out button). |
| `view_product`   | When entering a product/unit page (e.g. Noir, Blanco). Payload: `{ productName, path }`. |
| `view_page`      | Optional: on key pages (account, cart, checkout). Payload: `{ page: pathname }`. |
| `add_to_cart`    | After successfully adding an item to cart. Payload: `{ productName, ... }`. |
| `add_to_wishlist`| After adding to wishlist. Payload: `{ productName, ... }`. |
| `remove_from_cart` / `remove_from_wishlist` | After remove. |
| `place_order`    | After order is placed. Payload: `{ orderId, total, ... }`. |
| `cancel_order`   | When user cancels an order. Payload: `{ orderId }`. |
| `add_review`     | After review is submitted. Payload: `{ productName, rating }`. |
| `redeem_points`  | When loyalty points are redeemed. |
| `profile_update` | After profile is saved (e.g. after PATCH profile). |
| `checkout_start` | When entering checkout. |
| `checkout_complete` | When checkout is completed. |

Example:

```ts
import { trackActivity } from '../utils/activity';

// After sign-in success:
trackActivity('sign_in');

// When viewing a product page (e.g. in useEffect or on mount):
trackActivity('view_product', { productName: 'NOIR', path: location.pathname });

// After add to cart:
trackActivity('add_to_cart', { productName: 'BLANCO' });
```

Events are stored per user and shown on the admin **Clients → [Client] → Activity** tab with date/time and optional payload.

## Implemented

| Event | Location |
|-------|----------|
| `sign_in` | Sign-in page (Supabase sign-in, local sign-in, admin bootstrap, sign-up Supabase, sign-up local). |
| `sign_out` | Account page `handleSignOut`; Noir product page `handleSignOut`. |
| `view_product` | Noir, Blanco, Soft Wave, Beach Wave, Soft Curl, Ocean Curl (useEffect on mount with `location.pathname`). |
| `add_to_wishlist` / `remove_from_wishlist` | All six product pages in `handleToggleWishlist`. |
| `profile_update` | Settings page after successful `patchProfile` (personal info save). |
| `add_to_cart` | All six product pages in `handleAddToBag` after cart update and dispatch (payload: `productName`, `quantity`). |
| `remove_from_cart` | `CartDropdown.tsx` in `confirmRemoveItem` after updating cart (payload: `productName` from removed item). |
| `checkout_start` | `pages/checkout/page.tsx` in a `useEffect` on mount. |
| `place_order` / `checkout_complete` | `pages/checkout/confirm/page.tsx` in a `useEffect` when `orderData.orderNumber` is set (once per visit via ref). |
| `add_review` | `pages/account/reviews/leave-review-order/page.tsx` after saving review to localStorage and dispatching `reviewsUpdated` (payload: `productName`, `rating`). |

**Not yet wired:** `cancel_order` (when user cancels an order); `redeem_points` (when loyalty points are redeemed); optional `view_page` on account/cart/checkout.

---

## How to hook up remaining flows

1. **Import**  
   In the file where the action happens, add:
   ```ts
   import { trackActivity } from '../utils/activity';  // adjust path to your file
   ```

2. **Call after the action succeeds**  
   Call `trackActivity('event_type', { ...payload })` once the operation has completed (e.g. after localStorage/API update and any event dispatch). Use a ref if you need to fire only once per flow (e.g. confirm page).

3. **Where to add each remaining event**
   - **`cancel_order`** — In the handler that cancels an order (e.g. orders page or account order-detail). After the cancel logic runs, call `trackActivity('cancel_order', { orderId })`.
   - **`redeem_points`** — In the handler that redeems loyalty/rewards points (e.g. membership or rewards page). After redemption succeeds, call `trackActivity('redeem_points', { amount, ... })`.
   - **`view_page`** (optional) — In a `useEffect` on key pages (account, bag, checkout) that runs on mount: `trackActivity('view_page', { page: location.pathname })`.
