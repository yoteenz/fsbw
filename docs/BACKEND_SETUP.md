# Backend sync setup (Supabase + Vercel API)

This project can use **Supabase** for auth and storage so profile, orders, cart, and wishlist sync across browsers and devices. Follow these steps to turn it on.

---

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. **New project** → choose org, name, database password, region.
3. Wait for the project to be ready.

---

## 2. Run the database migration

1. In the Supabase dashboard, open **SQL Editor**.
2. Copy the contents of **`supabase/migrations/001_initial_schema.sql`** and run it.
3. This creates tables: `profiles`, `orders`, `cart`, `wishlist`, `notifications`, and RLS policies.

---

## 3. Get your API keys

1. In Supabase: **Settings** → **API**.
2. Copy:
   - **Project URL** → `VITE_SUPABASE_URL` and `SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY` and `SUPABASE_ANON_KEY`

---

## 4. Configure environment variables

**Local development**

1. Copy `.env.example` to `.env.local`.
2. Set:
   - `VITE_SUPABASE_URL` = your Project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
   - `VITE_API_BASE` = leave empty if you run with `vercel dev` (API and app on same host)
   - `SUPABASE_URL` and `SUPABASE_ANON_KEY` = same values (used by API routes)

**Vercel (production)**

1. Project → **Settings** → **Environment Variables**.
2. Add the same variables. For API routes, Vercel uses `SUPABASE_URL` and `SUPABASE_ANON_KEY` (and optionally `SUPABASE_SERVICE_ROLE_KEY`).

---

## 5. Run locally with the API

From the project root:

```bash
npm install
npx vercel dev
```

This runs the Vite app and the `/api/*` serverless functions so sign-in and sync work locally.

---

## 6. Create an account (sign-up)

When the backend env vars are set, **Create account** uses Supabase: it calls `supabase.auth.signUp()`, then creates a profile row via the API and syncs to localStorage so you’re signed in. If your Supabase project has “Confirm email” enabled, the user will see a message to confirm their email before signing in.

You can also create a user manually in Supabase (**Authentication** → **Users** → **Add user**) and then sign in on the app.

---

## What’s implemented

| Area      | Backend              | Frontend behavior |
|----------|----------------------|-------------------|
| Auth     | Supabase Auth        | Sign-in uses Supabase when env is set; session restored on load; sign-out calls `signOut()`. |
| Profile  | `GET/PATCH /api/profile` | After sign-in, profile is fetched and written to `currentUser` / `registeredUsers`. |
| Orders   | `GET /api/orders`    | After sign-in, orders are fetched and written to `userOrders_${email}`. |
| Cart     | `GET/PUT /api/cart`  | After sign-in, cart is fetched and written to `cartItems` / `cartCount`. |
| Wishlist | `GET/PUT /api/wishlist` | After sign-in, wishlist is fetched and written to `wishlistItems`. |

Saving profile/cart/wishlist back to the API on user edits can be added by calling `patchProfile`, `putCart`, `putWishlist` from the relevant pages (e.g. account settings, cart page, wishlist page).

---

## Troubleshooting

- **401 Unauthorized** on API calls: Ensure the frontend sends the Supabase session token. The app uses `getSession().access_token` and sends it as `Authorization: Bearer <token>`.
- **CORS**: API routes set `Access-Control-Allow-Origin: *`. For production you may want to restrict this.
- **Profile not found**: The first time a user signs in, there may be no profile row yet. The API’s PATCH profile will create one. You can also create a row in `profiles` for that user’s `id` (from `auth.users`).
