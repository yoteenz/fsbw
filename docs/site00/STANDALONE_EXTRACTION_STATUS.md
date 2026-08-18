# SITE 00 Standalone Extraction — Sprint Status

**Spatial Architecture Review: SKIPPED — infrastructure/repository extraction sprint (no new product surfaces).**

## Standalone application location

| Environment | Path |
|-------------|------|
| **Cloud agent (canonical)** | **`/workspace/site00-standalone/`** inside fsbw repo (git-tracked) |
| Ephemeral VM copy | `/home/ubuntu/site-00` (optional; may not exist on fresh agents) |
| Founder machine (target) | Sibling to `frontal-slayer/`, e.g. `Development/site-00/` |
| GitHub product repo | https://github.com/yoteenz/SITE00 |

**Publish to SITE00:** `./scripts/site00-push-to-github.sh` (needs `SITE00_GITHUB_TOKEN` secret).

## Git

| Repo | Branch | Initial commit |
|------|--------|----------------|
| SITE 00 standalone | `main` @ `/home/ubuntu/site-00` | `6e4e69f` (+ docs commit) |
| Frontal Slayer (unchanged SITE 00 source) | `master` @ `/workspace` | Rollback preserved — **Phase 23 not started** |

## Validation matrix (2026-08-18)

### SITE 00 standalone

- [x] installs independently (`npm ci`)
- [x] builds independently (`npm run build` — tsc + vite)
- [x] production preview serves routes (HTTP 200 on `/`, `/services`, `/control`, `/assts`, `/admin/site00`, etc.)
- [x] no `studio-os-core` imports in frontend
- [x] `.env.example` only (no secrets committed)
- [x] Git initialized on `main`
- [x] GitHub remote `https://github.com/yoteenz/SITE00.git` on `main` @ `a43f53c` (pushed via `SITE00_GITHUB_TOKEN`)
- [ ] Full auth E2E (requires Supabase env + API host)
- [ ] ASSTS generation E2E (requires `FAL_KEY`, service role, API runtime)
- [ ] GoDaddy hosting product confirmed
- [ ] DNS for site00.com
- [ ] Phase 23: remove SITE 00 from Frontal Slayer

### Frontal Slayer

- [x] Still builds after extraction work (`npm run build` verified)
- [ ] Phase 23 cleanup not performed

## API / Vercel migration notes

Serverless handlers copied to `site-00/api/`:

- `api/admin/site00-assts.ts`
- `api/admin/site00-production.ts`
- `api/site00/client-production.ts`
- `api/site00/loader-geometry.ts`

These require a **Node runtime** or Supabase Edge migration for GoDaddy static hosting. Dev: `scripts/vite-site00-assts-local-api.mjs` plugin.

## Supabase

Currently configured for shared project `hyycomvcaqxxvyrfupes`. Migrations copied to `site-00/supabase/migrations/`. **No destructive split** — document independent project migration separately.

## Next manual steps (ordered)

1. Confirm GoDaddy product (cPanel vs Node.js)
2. Create private GitHub repo `site-00` under founder account; `git remote add origin …`; push from `/home/ubuntu/site-00`
3. Configure `.env.local` with Supabase + API base
4. Deploy `dist/` to GoDaddy; configure DNS apex + www redirect
5. Host API (Node on GoDaddy or Edge Functions)
6. Update Supabase Site URL / redirect allowlist to `https://site00.com`
7. Run full auth + ASSTS validation
8. Phase 23: remove SITE 00 from Frontal Slayer monorepo
