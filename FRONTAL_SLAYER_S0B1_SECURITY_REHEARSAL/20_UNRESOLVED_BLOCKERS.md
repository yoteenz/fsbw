# 20 — Unresolved Blockers

| ID | Blocker | Blocks | Owner | Unblock action | Status |
|---|---|---|---|---|---|
| B-01 | A1a, H2, H3 not recorded | External staging, Track S | Founder | Record on the board (doc 17 §4) | **OPEN** |
| B-02 | Staging cost not approved (provider, plan, cost) | Provisioning | Founder | Approve with the H2 record | **OPEN** |
| B-03 | U-01 service-role key presence in deployments unverified | M1B; recommended for M1A | Operator | Names + yes/no (doc 04) | **OPEN** |
| B-04 | U-17 production domain unknown | Staging domain choice; mock-path quarantine | Operator | Vercel → Domains | **OPEN** |
| B-05 | U-20 Stripe test-mode configuration unknown | Stripe rehearsal (R-10 live path, R-15) | Operator | Yes/no (doc 01) | **OPEN** |
| B-06 | U-22 backups / PITR unverified | A1b | Operator | Supabase → Backups | **OPEN** |
| B-07 | U-21 out-of-band debug trigger blocks customer profile edits; coupled to R-18 | Profile edits (FS and SITE00); any R-18 fix | SITE00 owner (identify trigger owner) + founder (joint-fix decision) | Doc 18 §3 | **OPEN** (reproduced locally; production INFERRED) |
| B-08 | No Vercel / Railway / Stripe access in this session | Deployed-app and Stripe tests | Operator | Run Track S steps with the operator, or grant scoped access | **OPEN** |
| B-09 | M1B (4 shared server-only functions) | R-01 remainder | Engineering | After B-03 | **BLOCKED** |
| B-10 | A8 (remediation for customers affected by money defects, e.g. past $60 4-pack buyers) and wave-2 decisions (A2, A4, A5, F1, C4) | S0B-2, S1, remediation | Founder (A8 also needs a read-only Stripe check) | Board | **OPEN** |
| B-11 | U-23 callers outside both repos | Only detectable after production M1A | — | 24h log watch (accepted risk) | **ACCEPTED** |
| — | XD-1, XD-2, XD-3 | Desktop/tablet work | Founder | Not this sprint | **UNTOUCHED (by instruction)** |

## Not blockers (resolved by evidence this sprint)

- U-19: the FS organisation is on the Pro plan (metadata, read-only).
- Prior statement "no staging exists anywhere": corrected. `site00-staging` exists but is SITE00's and must not be used for FS.
