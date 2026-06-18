# Creative Preview (designer showcase)

**Creative Preview** lets graphic designers and collaborators explore the full mobile app on a **Vercel preview deployment** without signing up, paying, or holding a real membership. It uses **sample data** only and **blocks all checkout payments**.

## Who this is for

- Designers reviewing brand heroes, account flows, Build-a-Wig, lobby, etc.
- Not a replacement for `/debug-mode` (founder layout editor) or admin QA.

## Setup (one time)

1. Generate a long random secret (e.g. 32+ characters).
2. In **Vercel → Project → Settings → Environment Variables**, add:
   - **Name:** `VITE_CREATIVE_PREVIEW_TOKEN`
   - **Value:** your secret
   - **Environment:** **Preview** only (do **not** set on Production)
3. Redeploy or push a commit so preview builds pick up the variable.

For **local dev**, add the same key to `.env.local` and restart the Vite dev server.

## Link to send designers

```
https://<your-preview-deployment-url>/?creativePreview=<your-secret-token>
```

Example:

```
https://build-a-wig-git-preview-mobile-yourteam.vercel.app/?creativePreview=abc123-your-secret-here
```

After the first load:

- The token is removed from the address bar (session stays active for that browser tab).
- A red banner appears: **Creative preview — sample data only · payments disabled**
- The visitor is signed in as a demo **premium / BLACK** member with sample orders.

## What is unlocked

- Account routes (no sign-in redirect)
- Premium-gated areas: lobby, lounge, Build-a-Wig premium steps, PSA entry UI, premium booking paths
- Commerce routes without a Supabase session

## What is blocked

- Real **Stripe** product checkout and membership subscribe
- Admin (`/admin/*`) — demo user is not an admin

## Security notes

- Mode activates only when **both** are true:
  1. **Preview environment** (localhost, LAN, `*.vercel.app`, or Vercel preview build)
  2. Valid `?creativePreview=` token matching `VITE_CREATIVE_PREVIEW_TOKEN`
- Without the env var, the URL param does nothing.
- Production custom domains without preview env should not activate creative preview.

## Code references

- `src/utils/creativePreviewMode.ts` — activation, demo seed, checkout guard
- `src/components/CreativePreviewBanner.tsx` — top banner
- Bootstrap: `src/main.tsx` (before auth restore)
