# 04 — Service-Role Verification (U-01)

**U-01 remains OPEN.** This session has no Vercel or Railway access, and the production hosts are blocked by network policy, so deployment secret presence cannot be observed. Nothing below is marked verified because the code merely references a variable.

| Check (brief §08) | Result | Evidence | Status |
|---|---|---|---|
| Privileged backend requirements | Mapped: ~20 fail-closed service-role call sites (webhook, hair analysis, PSA, lounge, account deletion …) and 78 FS files using `getSupabaseAdmin()` (silent anon fallback); SITE00 has 99 such files | `FRONTAL_SLAYER_S0A_S0B1_READINESS/evidence/S_app_containment_and_secrets.md` Part 2 | VERIFIED (code) |
| Server-only environment configuration | No privileged `VITE_` name in either repo; `vite.config` has no `envPrefix` override; `define` inlines build IDs only | same | VERIFIED (code) |
| Deployment secret availability | Unknown | — | **OPEN**: needs Vercel → Env Vars (FS) and Railway → Variables (SITE00), presence only |
| Staging / production credential separation | There is no staging, so nothing to separate yet. The proposed separation is enforced by `env_guard.cjs` | doc 03 | PREPARED |
| No service-role values in browser bundles | Local production build of fsbw (2026-10-25): 0 JWTs, 0 Stripe/Resend/OpenAI keys, 0 `service_role` strings. Deployed bundle not fetched (network policy) | prior evidence; this sprint did not rebuild | Source/build VERIFIED; **deployed bundle OPEN** |
| No accidental secret logging | `console.*` statements printing env values: grep of `api/` finds error messages that name variables, not values (e.g. "Set SUPABASE_SERVICE_ROLE_KEY …") | prior evidence S | VERIFIED (code) |
| No public exposure through Vite variables | `VITE_ADMIN_EMAILS` exposes the admin allow-list (information exposure, not a key) | prior evidence S | VERIFIED (code); recommendation in S0B-2 |
| Privileged execution environment | Vercel serverless (FS `api/`); Railway (SITE00 API) | repo config | VERIFIED (config) |
| Least-privilege access paths | **Gap:** `getSupabaseAdmin()` and two inline helpers silently fall back to the anon key, so a missing key degrades silently instead of failing | `api/_lib/supabase.ts:30`, `api/lounge-tv-config.ts:41`, `api/special-offer-config.ts:44` | Gap confirmed; fix in S0B-2 |

## Why U-01 matters to the rehearsed migrations

- **M1A callers fail closed** (`getSupabaseAdminServiceRole`, inline `serviceSupabase` → 503). If the key were missing in production, those features would **already** be failing today. M1A neither adds nor removes that dependency. U-01 is therefore **recommended, not blocking**, for M1A.
- **M2 writers** (webhook order append, admin notifications, booking APIs, review submissions) use `getSupabaseAdmin()`. Without the key they would run as anon, and anon writes are **already** denied by RLS today (anon has no `auth.uid()`), so M2 does not change their behaviour.
- **M1B stays BLOCKED**: its callers use `getSupabaseAdmin()`, and today they *do* work as anon because anon holds EXECUTE. Revoking would break them if the key is missing.

## Secure verification steps (operator; no values, no screenshots of values)

1. **Vercel (FS):** Settings → Environment Variables. For Production and Preview, record **present / absent** and **Sensitive yes/no** for `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, `SUPABASE_URL` (write down only the project ref), `STRIPE_SECRET_KEY` (write down only the mode: test/live), `STRIPE_WEBHOOK_SECRET`.
2. **Railway (SITE00 API):** the same presence checks for `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_URL` (ref only).
3. **Runtime proof without values:** signed in as a test account, `GET /api/slay-tickets` or `GET /api/collectibles`. A **503 "Supabase not configured"** means the key is missing; a 200 means it is present.
4. **Deployed bundle:** in a normal browser on the production domain, DevTools → Sources → search `eyJ`. Decode **only** the `role` field of each match: every one must read `anon`.
5. Record the results (date, operator, yes/no) in `17_APPROVAL_MANIFEST` → `evidenceItems.U-01`.
