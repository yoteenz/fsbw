# Service role audit

**Rule:** `AIO_SUPABASE_SERVICE_ROLE_KEY` is **VALID_SERVER_ONLY** — used in live test fixtures and autopilot persistence, never in Vite client bundle.

| Location | Classification |
|----------|----------------|
| `src/freight/autopilot/supabaseFreightAutopilotPersistence.ts` | VALID_SERVER_ONLY (test/CI) |
| `src/config/env.ts` | SECRET registry only |
| Client `getAioSupabase()` | anon key only |

**SERVICE_ROLE_CLIENT_EXPOSURE:** NO (verified by isolation scripts + env validation).
