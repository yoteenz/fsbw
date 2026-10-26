# 03 — Environment Isolation Gates

Every gate must pass before any rehearsal touches an external environment. "Verified" means it was executed this sprint, with evidence in `evidence/results/`.

| Gate | Rule | Mechanism | Status |
|---|---|---|---|
| G-1 Approval | A1a, H2 and H3 recorded as founder decisions | Board decision store (doc 21) | **NOT MET** (0 recorded; store read 2026-10-26) |
| G-2 Target identity | The SQL session's project ref equals the approved staging ref, never `hyycomvcaqxxvyrfupes` or `soocqbyjkxeubfjnuwvf` | `schema_import.sh` refusals; V0 P1 output reviewed | Prepared |
| G-3 No production data | Schema-only export; fixtures are synthetic; no auth identities copied | `schema_export.sh` (`--schema-only`), with a data-statement count that must be 0 | Prepared |
| G-4 Credential separation | Staging keys belong to the staging ref; the service key is present; no privileged `VITE_` variable | `env_guard.cjs` (decodes **only** the role and ref claims; never prints values) | **Verified locally** with synthetic tokens: 7/7 cases correct (`env_guard_tests.txt`) |
| G-5 Payment mode | Staging uses Stripe test mode only; production never uses test mode | `env_guard.cjs` | Verified locally (2 cases) |
| G-6 Outbound safety | `SITE_URL` is not production in staging; email sandbox set | `env_guard.cjs` + mailer change (S0B-2) | Guard verified; mailer pending |
| G-7 Cross-product safety | No change to triggers, profiles columns, auth or SITE00 objects | Candidate scope review (doc 07) + catalog diff | **Verified locally**: triggers unchanged; only intended ACLs, policies and bodies changed (doc 13) |
| G-8 Reversibility | Rollback restores the exact prior state; forward re-apply is idempotent | Rollback rehearsal + catalog diff | **Verified locally**: rollback catalog diff = 0 lines; re-apply idempotent (doc 14) |
| G-9 Drift safety | A migration aborts with no change if the schema differs from what was reviewed | In-transaction precondition guards | **Verified locally**: drifted schema → M1A aborted, 0 catalog lines changed |
| G-10 Production untouched | No write, DDL or RPC execution against production | Session log: only SELECT catalog reads, log aggregates and project metadata | Verified (process; doc 13 §1) |

## Guard test cases (synthetic)

| Case | Expected | Result |
|---|---|---|
| Staging correctly isolated | OK | **OK (exit 0)** |
| Staging pointed at the production Supabase project | Refuse | **Refused** (4 problems) |
| Staging holding live Stripe keys | Refuse | **Refused** |
| Staging missing the service-role key (today the app would silently use anon) | Refuse | **Refused** |
| Service-role token placed in a `VITE_` variable | Refuse | **Refused** (2 problems) |
| Staging pointed at `site00-staging` | Refuse | **Refused** |
| Production holding Stripe test keys | Refuse | **Refused** |
