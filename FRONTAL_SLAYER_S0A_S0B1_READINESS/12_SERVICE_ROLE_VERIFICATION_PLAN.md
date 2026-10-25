# 12 — Service-Role Key Verification Plan (U-01)

**U-01 remains OPEN.** This sprint has no access to the Vercel or Railway dashboards. The production hosts (`frontalslayer.com`, `www.frontalslayer.com`, `fsbw.vercel.app`) were refused by this session's network policy, so the deployed bundles could not be fetched. Nothing here marks U-01 as resolved.

**Secret handling rule for everyone running this plan:** record **names, scopes, presence (yes/no) and the role claim only**. Never paste, screenshot, log or chat a secret value. Do not send any key to Claude or put it in a ticket.

## 1. Which backend services need privileged access

| Product | Runtime | Needs `SUPABASE_SERVICE_ROLE_KEY` for | Behaviour if missing |
|---|---|---|---|
| FRONTAL SLAYER | Vercel serverless `api/` | Stripe webhook (membership, orders, analysis credits); hair-analysis usage RPCs; PSA quotas and threads; lounge engagement; admin APIs; checkout and booking writes; account deletion | **Mixed.** ~20 call sites fail closed (503 or throw), including the webhook, hair analysis, PSA and lounge. **78 files use `getSupabaseAdmin()`, which silently falls back to the anon key**: admin APIs, booking, consult quotes, client submissions, Studio budget, trend/forecast public payloads. Two inline fallbacks too (`api/lounge-tv-config.ts:41`, `api/special-offer-config.ts:44`). |
| SITE00 | Railway API (`api.site00.com`) | Almost all `site00_*` persistence (99 files via `getSupabaseAdmin()`); access-credential RPC | Silent anon fallback in `getSupabaseAdmin()`. Store adapters refuse memory fallback in production, but their data calls still use the fallback client (INFERRED). |
| SITE00 static site | GoDaddy cPanel | **None** (build-time `VITE_*` only) | n/a |
| SITE00 CI | GitHub Actions | Production-project tests (`site00-production-deploy.yml`, `jurnl-live-production-sync-proof.yml`) | CI only |

Full file:line map: `evidence/S_app_containment_and_secrets.md` Part 2.

## 2. Checks already done this sprint (non-mutating)

| Check | Result |
|---|---|
| Source scan of both repos for hardcoded keys and JWTs (src, public, shared, api, server) | **None found.** Two base64-image false positives. Variable names appear only as help text. |
| `VITE_*` names that look privileged | **None privileged.** `VITE_ADMIN_EMAILS` (exposes the admin allow-list), `VITE_CREATIVE_PREVIEW_TOKEN` (effectively public) and `VITE_PREVIEW_ADMIN_ALLOWED_IP` are noted as information exposure, not key exposure. |
| `vite.config.ts` in both repos | No `envPrefix` override; `define` inlines build ids only. Server env cannot reach the bundle. |
| **Local production build of fsbw, scanned (2026-10-25)** | 1,040 JS files. **0** JWTs, **0** Stripe secret/webhook keys, **0** Resend/OpenAI/Fal-shaped keys, **0** `service_role` strings. `SUPABASE_SERVICE_ROLE_KEY` appears twice, as **admin help text** ("Set SUPABASE_SERVICE_ROLE_KEY in your API environment…"). The local build had no `.env`, so it proves the **source** is clean, not the **deployed** environment. |

## 3. Secure verification checklist (operator with dashboard access)

Each step yields a yes/no record. "Role claim" means decoding only the JWT payload's `role` field, which anyone can do from a public bundle. It never requires the secret.

### A. FRONTAL SLAYER: Vercel project
1. Vercel → Project → Settings → Environment Variables. For **Production** and **Preview** separately, record whether each exists: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_3MONTHS/6MONTHS/12MONTHS`, `CRON_SECRET`, `BOOKING_AUTOPAY_CRON_SECRET`, `RESEND_API_KEY`, `ADMIN_EMAILS`, `SESSION_COOKIE_SECRET`, `CREATIVE_PRODUCTION_AUTH_SECRET`. Note: several are missing from `.env.example`.
2. For each secret, confirm it is marked **Sensitive** (write-only) and that **no `VITE_`-prefixed copy** of it exists.
3. Confirm `SUPABASE_URL` in Production points to the intended project ref, and record the ref only.
4. Confirm `ALLOW_LEGACY_CHECKOUT` is **not set** in Production (`docs/SECURITY_HARDENING.md:27`).
5. Record which domains serve Production. The question is whether `fsbw.vercel.app` is the production host: `isPreviewEnvironment()` treats every `*.vercel.app` as preview, which enables mock and demo paths (evidence S §g).

### B. FRONTAL SLAYER: deployed bundle (from any normal browser)
6. Open `https://frontalslayer.com`, DevTools → Sources, search the JS for `eyJ`. Decode the middle segment of each hit at a local JWT decoder. **Every `role` must be `anon`.** Any `service_role` is a P0 incident: rotate the key immediately.
7. Search for `sk_live`, `sk_test`, `whsec_`, `service_role`. Expect 0.

### C. FRONTAL SLAYER: runtime proof without exposing anything
8. Make one read-only call, as a signed-in test account, to an endpoint that fails closed when the key is missing: `GET /api/slay-tickets` (`api/slay-tickets/index.ts:43-45`) or `GET /api/collectibles` (`api/collectibles/index.ts:48-50`). **A 503 with "Supabase not configured" means the key is missing; a 200 means it is present.** Both are balance and list reads with no side effects. Do **not** use `/api/hairstyle-analysis-usage`: without the key it returns 200 with empty usage instead of failing.
9. Optional (S0B-2): add `GET /api/health/privileged` (admin-only) that returns `{serviceRole: true|false, stripe: true|false}` booleans and never values.

### D. SITE00: Railway API service
10. Railway → service → Variables: record presence of `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL` (project ref), `STRIPE_SECRET_KEY` or `SITE00_STRIPE_SECRET_KEY`, and the webhook secrets. Confirm they are service variables, not shared with any static-site build.
11. GoDaddy static build secrets (GitHub → SITE00 repo → Settings → Secrets): confirm only `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` and `VITE_API_BASE` are used by the static build.
12. Decode the `role` claim of the anon key in the deployed site00.com bundle: it must be `anon`.

### E. Staging (once doc 13 exists)
13. The staging Vercel environment's `SUPABASE_URL` points to the **staging** project ref, never `hyycomvcaqxxvyrfupes`. Stripe keys are `sk_test_…` (record the prefix only).
14. The production environment never holds test keys, and staging never holds live keys.

## 4. What closes U-01

U-01 is **RESOLVED** only when steps 1–8 (FRONTAL SLAYER) and 10–12 (SITE00) are recorded with a date and the operator's name. Until then:
- M1A and M2 may still be **rehearsed** on staging. Their production callers fail closed or never write.
- **M1B stays BLOCKED.**

## 5. Follow-up engineering defaults (S0B-2 / S3, no founder decision needed)
- Make `getSupabaseAdmin()` fail closed (throw) in production in both repos. SITE00 needs its owner's agreement.
- Remove the inline anon fallbacks (`lounge-tv-config.ts:41`, `special-offer-config.ts:44`).
- Stop deriving `CREATIVE_PRODUCTION_AUTH_SECRET` from a prefix of the service key, and remove the hardcoded fallback (`api/_lib/creativeProduction/authorization-signing.ts:10-14`).
- Add the missing variable names to `.env.example`, as names only.
