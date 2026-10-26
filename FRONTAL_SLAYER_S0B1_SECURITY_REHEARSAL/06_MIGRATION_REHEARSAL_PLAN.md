# 06 — Migration Rehearsal Plan

Two tracks. Track L was executed this sprint. Track S is prepared and BLOCKED.

## Track L: isolated local replica (EXECUTED)

Permitted as a safe local test. No provider, no network, no production object, synthetic data.

| Step (brief §09) | Track L action | Result |
|---|---|---|
| 1. Verify target is staging | Target is a local, socket-only cluster (`/tmp/fsrehearsal_pg1`); databases `fs_baseline`, `fs_post`, `fs_rt`, `fs_drift`, `fs_u21` | Verified (no remote connection exists) |
| 2. Verify migration checksum/version | sha256 recorded per file (doc 13). Files are the committed S0A candidates, byte-for-byte | Verified |
| 3. Inspect actual schema | Replica built from the 2026-10-26 live capture; parity checks (doc 05 §2) | Verified |
| 4. Confirm dependency inventory | Callers re-grepped (FS `api/`, SITE00, JURNL): doc 11 | Verified |
| 5. Confirm recovery mechanism | Rollback files rehearsed; catalog diff = 0 (doc 14) | Verified |
| 6. Confirm founder approval gate | Not needed for local tests. **Recorded as absent** for staging and production | Gate respected |
| 7. Capture baseline | `baseline.json` (doc 05 §3) | Done |
| Apply | V0 → M1A → M2 → M3 → V1 | All exit 0 (second run, after fixing a replica gap; doc 13) |
| Post-checks | Grants, policies, pack check, triggers (V1 Part A); 52-test matrix | Done (doc 15) |
| Recovery | Rollback (reverse order) → tests = baseline → re-apply → tests = post → re-run (idempotency) → tests = post | Done |
| Drift guard | Drop one overload, apply M1A | Aborted, 0 changes |
| Extra experiment | Post-migration + debug trigger disabled (evidence for the U-21/R-18 decision; **not a candidate**) | Done (doc 15 §3) |

**Limits of Track L.** It does not exercise the real Supabase stack: PostgREST routing, GoTrue signup and email, Storage, connection pooling, platform default privileges, or extensions beyond pgcrypto. It does not exercise the deployed API code or Stripe. **It does not prove production behaviour.**

## Track S: Supabase staging (BLOCKED)

Preconditions: A1a + H2 + H3 recorded; cost approved; staging provisioned per doc 02; `env_guard.cjs` OK.

1. V0 on staging; compare with the doc 05 capture.
2. Run the same harness (`22_…/harness/run.cjs`) through PostgREST-equivalent sessions, plus real **HTTP** probes with the staging anon key and synthetic user JWTs:
   - `POST /rest/v1/rpc/hairstyle_analysis_grant_purchase_credits` → expect 401/403 after M1A.
   - `PATCH /rest/v1/orders?user_id=eq.<A>` → expect 0 rows after M2.
3. Apply M1A → M2 → M3 with fresh version numbers (> highest applied, unused in both repos).
4. Run the application on the Preview environment: hair-analysis generate (test), PSA chat, lounge helpful and view, booking request, consult offer notification, review submission, Stripe test 4-pack purchase with webhook replay.
5. SITE00 smoke (SITE00 owner): sign-in + `/api/profile` against FS staging. **Expected to FAIL on U-21** independently of S0B-1. Run it before and after the migrations to show the migrations change nothing.
6. JURNL: signup on FS staging → profile row via `handle_new_user` (NOT APPLICABLE beyond this; doc 11).
7. Evidence pack → founder A1b.

## Track P: production (NOT IN THIS SPRINT)

Only after A1b. Same files, same order, V0/V1 Part A, advisor 17 → 7, 24h log watch.
