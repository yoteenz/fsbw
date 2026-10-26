# 16 — Production Readiness Gates (S0B-1 → A1b)

**Production readiness: NOT READY.** The local replica rehearsal passed. That is necessary, not sufficient. Production stays unchanged until the founder records **A1b**, which can only be requested once every gate below is MET.

| # | Gate | Evidence required | Status |
|---|---|---|---|
| P-1 | A1a recorded (rehearsal on staging authorized) | Decision record in the board store | **NOT MET** |
| P-2 | H2 recorded (staging option chosen) and cost approved | Decision record + provider, plan and cost stated | **NOT MET** |
| P-3 | H3 acknowledged (shared-database rules) | Decision record | **NOT MET** |
| P-4 | Isolated staging provisioned and `env_guard.cjs` prints OK | Guard output (names only) | **BLOCKED** (P-1…P-3) |
| P-5 | Local replica rehearsal | Docs 13–15 | **MET** (this sprint: 31/31 negative blocked, 19/20 regression, the 1 failure pre-existing) |
| P-6 | Track S on staging: same files, same order, V1 Part A + B, HTTP probes, rollback rehearsal | Staging evidence pack | **BLOCKED** |
| P-7 | Deployed-app regression on staging (hair analysis, PSA, lounge, booking, notifications, reviews, Stripe test 4-pack + replay) | Staging evidence pack | **BLOCKED** |
| P-8 | SITE00 smoke on staging by the SITE00 owner, before and after | Owner sign-off | **BLOCKED** (expected to show U-21 in both phases) |
| P-9 | U-22 backups / PITR available on the shared project | Dashboard check (operator) | **OPEN** |
| P-10 | U-01 service-role key presence in Vercel production (and Railway if used) | Names and yes/no (doc 04) | **OPEN** (recommended for M1A, required for M1B) |
| P-11 | Fresh V0 on production immediately before apply matches the 2026-10-26 capture | V0 output | Pending (at A1b time) |
| P-12 | Migration versions assigned (> highest applied, unused in both repos) | Version list | Pending (Track S) |
| P-13 | Named on-call owner for the 24h watch and the rollback files | Name in the A1b record | **OPEN** |
| P-14 | A1b recorded, referencing the staging evidence pack | Decision record | **NOT MET** (cannot be requested yet) |

## After A1b (Track P outline, not authorized)

1. V0 (read-only) → compare.
2. M1A → M2 (rev2) → M3, one transaction each, in a low-traffic window.
3. V1 Part A → all expected.
4. Advisor `anon_security_definer_function_executable`: 17 → 7.
5. SITE00 owner smoke on site00.com; one JURNL sign-in if wanted.
6. 24h log watch for `permission denied for function` and 401/403 on `/rest/v1/rpc/*`; follow doc 14 §3.

## What production readiness does **not** cover

R-03, R-05, R-15 (S0B-2), R-11 (S1), M1B and U-21/R-18 (later DB sprint). A1b closes only the database exposures R-01, R-04 and R-10.
