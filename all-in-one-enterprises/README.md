# All In One Enterprises Inc. — Standalone Application

**ALL IN ONE ENTERPRISES INC.** — The business office behind the truck.

This is the **canonical** All In One application (Sprint 22+). It runs independently of the Frontal Slayer repository.

---

## Quick start (Demo Mode)

```bash
cd all-in-one-enterprises
npm install
cp .env.example .env.local   # optional — demo is default
npm run dev
```

Open **http://localhost:5173**

Use the preview banner to switch demo organizations, open Office, or reset demo data.

---

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server (port 5173) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm test` | Vitest unit/domain tests (188+) |
| `npm run test:e2e` | Playwright smoke tests |
| `npm run qa` | typecheck + tests + isolation scan |
| `npm run check:isolation` | Forbidden FS dependency scan |
| `npm run migrate:verify` | Migration guard (requires AIO Supabase env) |

---

## Environment

See `.env.example` and `docs/ENVIRONMENT_CONFIGURATION.md`.

**Default:** `VITE_AIO_DATA_MODE=demo` — no Supabase required.

**Never** point All In One at the Frontal Slayer Supabase project (`hyycomvcaqxxvyrfupes`).

---

## Architecture

- **Entry:** `src/main.tsx` → `src/App.tsx` → `src/routes/AllInOneRoutes.tsx`
- **Routes:** Standalone paths (`/`, `/portal`, `/office`, …) — no `/all-in-one` prefix
- **Data:** Demo store + future Supabase repositories under `src/data/`
- **Migrations:** `supabase/migrations/`
- **Docs:** `docs/` (canonical product + architecture)

See `docs/STANDALONE_ARCHITECTURE.md`.

---

## Legacy Frontal Slayer host

The Frontal Slayer repo still serves **frozen** legacy routes at `/all-in-one` and `/debug/all-in-one` with a “moved to standalone” notice. Do not develop features there.

---

## Production status

**Extraction:** COMPLETE (standalone)  
**Production launch:** BLOCKED — dedicated Supabase, domain, and provider configuration (Sprint 23+)

See `docs/EXTRACTION_COMPLETION_REPORT.md` and `docs/PRODUCTION_SECURITY_CHECKLIST.md`.
