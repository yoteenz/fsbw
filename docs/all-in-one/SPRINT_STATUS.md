# All In One — Sprint Status

**Sprint:** 04 — Production Data Foundation + Auth + Permissions  
**Last updated:** 2026-08-15

---

## ARCHITECTURE COMPLETE (Sprint 04)

- **Data mode architecture** — `demo` | `backend` via `VITE_AIO_DATA_MODE`
- **Isolated env config** — `VITE_AIO_SUPABASE_URL`, `VITE_AIO_SUPABASE_ANON_KEY` (never Frontal Slayer)
- **Repository layer** — `src/all-in-one/data/repositories/` demo + supabase implementations
- **Dedicated migrations** — `all-in-one/supabase/migrations/` (identity, business data, RLS)
- **Auth foundation** — sign-up, login, logout, forgot/reset password, email verification UI
- **Route protection** — portal + office guards (backend mode)
- **Identity model** — users, organizations, memberships, internal staff roles
- **Persistent domains (backend-ready)** — intake, roadmap, requests, tasks, documents, notes, messages, activity, dispatch, factoring, brokerage, invoices
- **Demo mode retained** — seed data, reset, internal demo entry
- **Documentation** — `BACKEND_SETUP.md`, `AUTHORIZATION_MATRIX.md`, `SECURITY_FOUNDATION.md`

---

## BACKEND ACTIVATION PENDING

Dedicated All In One Supabase project credentials are **not yet configured** in the environment.

Until `VITE_AIO_SUPABASE_*` is set:

- App runs in **Demo Mode** (default)
- Migrations are ready to apply — see `docs/all-in-one/BACKEND_SETUP.md`
- No tables created in Frontal Slayer Supabase

---

## UI PROTOTYPE COMPLETE (Sprint 03)

- All In One Office, CRM, shared demo store, cross-portal sync

---

## UI PROTOTYPE COMPLETE (Sprint 02)

- Smart Intake, Roadmap, Service Marketplace, mock requests, portal

---

## UI PROTOTYPE COMPLETE (Sprint 01)

- Isolated architecture, public website, design system, factoring division

---

## PRODUCTION BACKEND PENDING

- Apply migrations to dedicated AIO Supabase project
- End-to-end backend QA with real accounts
- Document file storage (dedicated bucket)
- Email/SMS messaging, payments, government/insurance/factoring integrations
- Full Office UI wired to Supabase operational snapshot (demo store still used in demo mode)

---

## Assumptions

1. Default data mode is `demo` — no backend credentials required for review
2. Frontal Slayer schema/auth/storage remain untouched
3. Financial figures remain illustrative until payments sprint
4. Internal notes enforced via separate table + RLS in backend mode
