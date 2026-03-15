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
