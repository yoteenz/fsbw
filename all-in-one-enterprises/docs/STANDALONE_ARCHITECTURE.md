# STANDALONE ARCHITECTURE

## Entrypoint

```
index.html → src/main.tsx → BrowserRouter → App.tsx → AllInOneRoutes.tsx
```

## Route families

| Family | Base | Guard |
|--------|------|-------|
| Public | `/`, `/services`, … | None |
| Auth | `/login`, `/sign-up`, … | AIOAuthLayout |
| Customer portal | `/portal/*` | CustomerRouteGuard |
| Shipper | `/shipper/*` | CustomerRouteGuard |
| Office | `/office/*` | OfficeRouteGuard |
| Management | `/office/management/*` | Office + permissions |

## Data layer

- **Demo:** `demo/demoStore.ts` — localStorage keys prefixed `aio_*`
- **Supabase:** `data/supabase/` — future production mode
- **Repositories:** UI uses repository contracts, not raw storage

## Security boundary

- No imports from Frontal Slayer modules
- FS Supabase project ID blocked in env validation
- `scripts/check-isolation.sh` in CI/qa script

## Deployment

- Vite SPA → `dist/`
- `vercel.json` for preview (SPA rewrites)
- Demo Mode default for preview
