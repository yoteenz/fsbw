# PRODUCTION INFRASTRUCTURE — All In One Enterprises Inc.

**Sprint:** 23  
**Status:** Architecture READY · Provisioning BLOCKED (owner action)  
**Last updated:** 2026-08-16

---

## Summary

All In One operates as a **standalone application** (`all-in-one-enterprises/`) with explicit environment identity, guarded migrations, production gates, and a **Production Config Center** at `/office/system/production`.

| State | Value |
|-------|-------|
| APPLICATION COMPLETE | YES |
| INFRASTRUCTURE READY | PARTIAL — architecture + guards; live projects pending owner |
| PUBLIC LAUNCH READY | NO — Sprint 24 |

---

## Environment model

```
LOCAL / DEMO / DEVELOPMENT
        │
        ├── STAGING (dedicated non-production backend)
        │
        └── PRODUCTION (dedicated production backend)
```

Environment variables (explicit):

- `VITE_AIO_ENVIRONMENT` / `AIO_ENVIRONMENT`: `local` | `demo` | `staging` | `production`
- `VITE_AIO_DATA_MODE`: `demo` | `local` | `supabase`
- `VITE_AIO_AUTH_MODE`: `demo` | `supabase`
- `VITE_AIO_STORAGE_MODE`: `demo` | `supabase`

**Never** use Frontal Slayer Supabase project `hyycomvcaqxxvyrfupes`.

---

## Provider decisions

| Layer | Choice |
|-------|--------|
| Application host | Vercel — **separate** All In One project |
| Database / Auth / Storage | Supabase — **dedicated** staging + production projects |
| Edge / DNS | Cloudflare (when selected) — domain pending |
| Email / SMS / Payments | Architecture prepared — credentials pending business approval |
| Error monitoring | Adapter ready — provider account pending |

---

## Code modules

| Module | Path |
|--------|------|
| Infrastructure core | `src/infrastructure/` |
| Production gates | `canPrepareProduction()`, `canLaunchPublicly()` |
| Environment validation | `validateProductionBuildConfig()` |
| Production Config UI | `/office/system/production` |
| Migration guard | `scripts/verify-migration-environment.sh` |
| Build gate | `scripts/prebuild-validate.mjs` |

---

## Manual provisioning boundary

The following require **owner action** — not fabricated by agents:

1. Create dedicated **Supabase staging** project
2. Create dedicated **Supabase production** project (distinct ref)
3. Create dedicated **Vercel/host** staging + production projects
4. Select and purchase **domain**
5. Configure **email/SMS/payment** merchant accounts

Until configured, status remains `NOT_CONFIGURED` in Production Config Center.

---

## Security baseline

- Service role: **server-only**, never `VITE_*`
- Production: **no silent demo fallback** (`effectiveDataMode()` throws)
- Demo reset: **hard blocked** in production
- Debug banner / persona switcher: **hidden** in production
- RLS gate: `RLS_NOT_TESTED` until staging suite runs on live DB

---

## Related documents

- `ENVIRONMENT_MATRIX.md`
- `PRODUCTION_READINESS_REPORT.md`
- `DEPLOYMENT_RUNBOOK.md`
- `DATABASE_OPERATIONS.md`
- `SECRET_MANAGEMENT.md`
