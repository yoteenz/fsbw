# PREVIEW DEPLOYMENT

## Platform

Vite SPA — deploy `dist/` to Vercel, Cloudflare Pages, or static host.

## Build

```bash
npm ci
npm run build
```

Output: `dist/`

## Vercel

`vercel.json` included — SPA rewrite to `index.html`.

Set environment:

- `VITE_AIO_ENVIRONMENT=preview`
- `VITE_AIO_DATA_MODE=demo`
- `VITE_AIO_APP_URL=https://your-preview-url.vercel.app`

## Preview data

Use **Demo Mode** — no real customer data.

Banner shows: `STANDALONE PREVIEW · DEMO`.

## Verification after deploy

1. `/` loads public home
2. `/portal` loads demo portal
3. `/office` loads with staff selector
4. No network calls to Frontal Slayer Supabase/API
5. Assets load (favicon, no 404 on `/brand/`)

## Search indexing

Preview should use `noindex` (see `index.html` meta).
