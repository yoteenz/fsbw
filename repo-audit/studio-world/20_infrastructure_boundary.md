# Studio World — Infrastructure Boundary

What prevents Studio World from operating independently **today**?

---

## Repository & package

| Item | Shared with FS? | Blocks independence? |
| --- | --- | --- |
| Single GitHub repo (`fsbw`) | Yes | **Yes** — no separate source repo |
| Root `package.json` / lockfile | Yes | **Yes** — one dependency graph |
| `node_modules` | Yes | **Yes** |
| TypeScript / ESLint config | Yes | **Yes** for separate CI without split |

---

## Vite / build

| Item | Shared? | Blocks? |
| --- | --- | --- |
| `vite.config.ts` | Yes | **Yes** — single client bundle |
| `index.html` entry | Yes | **Yes** |
| Code-splitting includes FS + SW chunks | Yes | **Yes** |

---

## Deployment platform

| Item | Observation | Blocks? |
| --- | --- | --- |
| Vercel (per AGENTS/CORE) | FS production deploy on push `master` | **Yes** — Studio ships with FS |
| Separate Vercel project for SW | **Not present** | **Yes** |
| Serverless `api/` directory | All functions one project | **Yes** |

---

## Domains

| Item | Observation | Blocks? |
| --- | --- | --- |
| Studio on FS customer domain under `/admin/studio` | Observed routing model | **Yes** |
| Independent Studio domain | **Not configured in repo audit** | **Yes** |

---

## Environment variables

| Variable (from `.env.example` patterns) | Used by | Blocks? |
| --- | --- | --- |
| `VITE_SUPABASE_*` | Entire SPA | **Yes** |
| `SUPABASE_SERVICE_ROLE_KEY` | FS + Studio APIs | **Yes** |
| FAL / AI keys | FS preview + Studio generation | **Yes** |
| `ADMIN_PORTFOLIO_OWNER_EMAILS` | Studio canonical API | Partial — SW-specific but same deploy |
| Stripe, email, etc. | Primarily FS | FS blocks FS independence from SW N/A |

---

## Supabase

| Item | Blocks SW independence? |
| --- | --- |
| Single production project id documented in rules (`hyycomvcaqxxvyrfupes`) | **Yes** |
| Migrations in shared repo | **Yes** |
| Auth, DB, Storage one project | **Yes** |

---

## Edge / serverless functions

| Item | Observation |
| --- | --- |
| ~30+ Studio-related `api/admin/studio*` handlers | Deployed with FS |
| `studio-generation-worker` | Shared cron/worker infra |
| Bundle `studio-os-server.bundle.js` | Committed artifact in FS repo |

---

## External APIs

| API | Shared? |
| --- | --- |
| FAL | Yes — FS + Studio |
| Supabase | Yes |
| Others in FS commerce | FS-only (SW does not require for HQ core) |

---

## Email / analytics / monitoring

| Item | Observation |
| --- | --- |
| Email providers in `.env.example` | FS-oriented; Studio not separately documented |
| Analytics | **Unclear** split — likely shared or absent for Studio |
| Vercel logs | Shared |
| Studio immune-system-health API | SW-specific endpoint, shared deploy |

---

## Scheduled jobs / webhooks

| Item | Observation |
| --- | --- |
| Generation worker | Studio — same Vercel project |
| FS webhooks (Stripe, etc.) | FS — unrelated to SW HQ |

---

## Secrets & CI/CD

| Item | Observation |
| --- | --- |
| Cursor cloud secrets | Repo environment — shared |
| `./scripts/agent-commit.sh` | One push deploys all |
| GitHub Actions (if any) | Not fully enumerated; repo-level |

---

## Summary: independence blockers (infrastructure)

1. **Monolithic repo + build + deploy**  
2. **Single Supabase project (auth, DB, storage)**  
3. **Single domain/path namespace for HQ**  
4. **Shared environment secrets**  
5. **No Studio-only hosting configuration in repo**

No changes made in this audit.
