# 00 — S0B-1 Staging Isolation and Database Security Rehearsal

**Sprint:** `P0.FRONTAL-SLAYER.OPUS.S0B1-STAGING-ISOLATION-AND-DATABASE-SECURITY-REHEARSAL.V1`
**Status: PARTIAL.** The rehearsal ran on an **isolated local replica**. External staging is **BLOCKED**: A1a, H2 and H3 are not recorded and the staging cost is not approved. **Production is unchanged.**

## 1. Results in plain words

1. **No FS staging exists.** `site00-staging` exists but belongs to SITE00 and must not be used. A separate FS staging project is **prepared** (configuration, guard, export/import scripts, fixtures) but **not provisioned** (docs 01–03).
2. **Rehearsal on a local replica.** It was built from definitions, ACLs and policies captured read-only from production on 2026-10-26, with synthetic users only. On that replica the three candidate migrations (M1A, M2, M3):
   - **Blocked 31 of 31 attack tests.** At baseline, 16 of them succeeded.
   - **Kept 19 of 20 legitimate server and customer workflows working.** The one failure, REG-18, is a pre-existing defect (U-21). It fails identically before the migrations.
   - **Rolled back exactly** (catalog diff 0 lines), re-applied cleanly, and were idempotent.
   - **Aborted with zero changes on a drifted schema** (docs 13–15).
3. **Status of the database risks.** R-01, R-04 and R-10 are **REHEARSED (LOCAL REPLICA) · PASS**. They remain **OPEN in production**. A local PASS does not mean production is fixed.
4. **Status of the application risks.** R-03, R-05 and R-15 are unchanged by any migration. R-03 and R-05 were reproduced in code. They belong to S0B-2 (doc 18). R-11 is PREPARED: its dependencies are analysed and nothing conflicts (docs 12 and 19).
5. **New finding: U-21 is coupled to R-18.** An out-of-band debug trigger makes every customer profile edit fail; this affects both FS and SITE00 `api/profile.ts`. Removing that trigger would expose R-18, so the two must be fixed together. The trigger owner must be identified and the founder must decide (doc 15 §3, doc 20 B-07).
6. **Cross-product.** SITE00 is compatible at database level: 0 references to the migrated objects, and signup is unchanged. JURNL is NOT APPLICABLE / NOT AFFECTED (doc 11).
7. **Board corrected.** V3.1 at the same URL. Every decision now starts as **PENDING DECISION**, and FOUNDER APPROVED appears only after a recorded decision. The manifest v4 separates recommendation, selection, recorded approval, authorization, implementation and verification. The store was read back after the publish: **0 decisions recorded** (folder 21).

## 2. What the founder or operator needs to do next

| # | Who | Action |
|---|---|---|
| 1 | Founder | Record **H2** (staging option), **A1a** (staging rehearsal), **H3** (acknowledge) and approve the staging **cost**, on the board |
| 2 | Operator | Yes/no facts only, no secret values: U-01 (service-role key present in Vercel/Railway), U-17 (production domain), U-20 (Stripe test-mode set-up), U-22 (backups/PITR) |
| 3 | SITE00 owner | Say whether they created `trg_log_profile_changes`, and agree to run the staging smoke test |
| 4 | Founder | Decide the joint U-21 / R-18 fix, and A8 (remediation for customers affected by money defects, e.g. buyers of the $60 4-pack) |

## 3. Deliverables

| # | File | Content |
|---|---|---|
| 01 | `01_STAGING_DISCOVERY.md` | Supabase projects and branches, `site00-staging`, unknowns |
| 02 | `02_STAGING_ENVIRONMENT_CONFIGURATION.md` | Target staging design, variable matrix, provisioning sequence |
| 03 | `03_ENVIRONMENT_ISOLATION_GATES.md` | G-1…G-10; env guard 7/7 |
| 04 | `04_SERVICE_ROLE_VERIFICATION.md` | U-01 OPEN; fail-closed analysis |
| 05 | `05_DATABASE_BASELINE.md` | Live capture, replica parity, baseline results |
| 06 | `06_MIGRATION_REHEARSAL_PLAN.md` | Track L (executed), Track S (blocked), Track P |
| 07 | `07_CANDIDATE_MIGRATION_REVIEW.md` + `07_CANDIDATE_MIGRATION_REVISIONS/` | Review; M2 rev2 proposal |
| 08 | `08_SECURITY_TEST_MATRIX.csv` | 32 tests, every phase |
| 09 | `09_AUTHORIZED_WORKFLOW_REGRESSION.csv` | 20 tests, every phase |
| 10 | `10_STRIPE_TEST_MODE_REHEARSAL.md` | Offline checks; Stripe BLOCKED; test-mode script |
| 11 | `11_CROSS_PRODUCT_IMPACT.md` | SITE00, JURNL |
| 12 | `12_ORDER_SYSTEM_DEPENDENCIES.md` | R-11 coexistence and S1 contracts |
| 13 | `13_MIGRATION_EXECUTION_LOG.md` | Production read-only calls; runs, checksums, timings |
| 14 | `14_MIGRATION_RECOVERY_PLAN.md` | Rehearsed rollback; decision table |
| 15 | `15_SECURITY_REHEARSAL_RESULTS.md` | Per-risk results (§15 format); U-21/R-18 |
| 16 | `16_PRODUCTION_READINESS_GATES.md` | P-1…P-14: **NOT READY** |
| 17 | `17_FOUNDER_APPROVAL_STATUS.md` | 0 recorded; what is required |
| 18 | `18_NEXT_S0B2_APPLICATION_CONTAINMENT.md` | S0B-2 items + new items |
| 19 | `19_NEXT_S1_ORDER_OF_RECORD.md` | S1 plan |
| 20 | `20_UNRESOLVED_BLOCKERS.md` | B-01…B-11 |
| 21 | `21_BOARD_APPROVAL_STATE_CORRECTION/` | Board V3.1, manifest v4, render check |
| 22 | `22_ENVIRONMENT_AND_TEST_SCRIPTS/` | Replica SQL, harness, app checks, staging scripts |
| 23 | `23_EVIDENCE_MANIFEST.json` | Files, checksums, environment, provider calls, statuses |
| — | `evidence/results/` | Raw outputs |
| — | `exports/SMALL_HANDOFF.zip`, `exports/FULL_HANDOFF.zip` | Handoffs |

## 4. Boundaries respected

- **Production:** no database mutation, DDL, RPC execution, deployment or Stripe change.
- **Data:** no customer data copied; no auth identity cloned.
- **Secrets:** none requested or printed.
- **Process:** no paid resource created; no merge; no PR.
- **Other repositories:** SITE00 and JURNL not modified.
- **Experiences:** XD-1, XD-2 and XD-3 not implemented. Mobile, Desktop/Tablet and Admin remain independent experience authorities.
- **Production calls:** read-only only (doc 13 §1).
