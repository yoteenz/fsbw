# FRONTAL SLAYER DECOUPLING

## What existed

- All In One UI/domain in `src/all-in-one/` (~368 files)
- Lazy mount via `StudioDebugRoutes.tsx` → `/all-in-one/*`
- Shared root `package.json`, Vite build, Cloudflare preview tunnel

## Sprint 22 actions

1. Copied canonical implementation to `all-in-one-enterprises/`
2. Created independent entrypoint, package.json, vite config, env contract
3. Routes migrated to standalone paths (no `/all-in-one` prefix)
4. Removed `src/all-in-one/` from Frontal Slayer repo
5. Legacy routes show `LegacyAioMovedNotice` with link to standalone dev URL

## What remains in FS (intentional)

- Expert capture: `/expert-capture/all-in-one-permitting/*` (Studio OS, not customer AIO app)
- Documentation references in `docs/all-in-one/` (historical; canonical docs copied to standalone)

## FS regression

- `npm run build` PASS after AIO removal
- No AIO styles in FS bundle for customer routes
- `scripts/aio-qa-check.sh` runs FS build + standalone `npm run qa`

## Removal complete

- No runtime import of AIO business code from FS
- No FS Supabase/auth/storage for AIO data
