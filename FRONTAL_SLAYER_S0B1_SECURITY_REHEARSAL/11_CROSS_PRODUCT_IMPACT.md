# 11 — Cross-Product Impact (SITE00, JURNL)

Dependencies were verified before testing, by grepping the SITE00 repository (read-only, unmodified) for every object M1A, M2 and M3 touch, and by object-level analysis of the shared project.

## 1. Object dependency check

| Object touched by S0B-1 | FRONTAL SLAYER callers | SITE00 callers | JURNL callers |
|---|---|---|---|
| 10 value/quota RPC signatures (M1A) | server only, service role | **none** | **none** |
| Write policies on orders, meetings, notifications, reviews (M2) | server only, service role | **none** | **none** |
| Hair-analysis grant and refund bodies (M3) | webhook / generate (service role) | **none** | **none** |
| `psa_tool_events` RLS (M2; a no-op live) | server | none | none |
| Triggers, `profiles` policies or columns, `auth` | **not touched** | — | — |

Grep evidence (this sprint): 0 SITE00 files reference the migrated functions or the four tables. JURNL directories (`src/projects/jurnl`, `api/jurnl`, `scripts/jurnl`) have 0 references. JURNL uses only Supabase Auth (`signUp` ×2, `signInWithPassword`, `updateUser`).

## 2. SITE00

| Check | Method | Result |
|---|---|---|
| Signup compatibility (shared `auth.users` → `handle_new_user`) | Replica: an auth user insert creates a profile, before and after the migrations (REG-16) | **PASS** both phases (trigger untouched) |
| Authorised profile access (read own) | Replica REG-17 | **PASS** both phases |
| Profile update with a user token (SITE00 `api/profile.ts` upsert path) | Replica REG-18 | **FAIL in BOTH phases**: a pre-existing defect (U-21, out-of-band debug trigger), **not caused by S0B-1** |
| Required shared function availability | SITE00 calls only `site00_allocate_access_credential_code`, which S0B-1 does not touch | **Unaffected** |
| Representative SITE00 staging test | `site00-staging` exists but is SITE00's own environment with its own data; not used | **NOT RUN** (no approved FS staging; must not use SITE00 staging) |

**Verdict:** S0B-1 is **compatible with SITE00** at the database level (local evidence). The S0B-1 rehearsal **surfaced a pre-existing SITE00/FS defect**: on the replica, which matches live definitions, any user-token update of `profiles` is rejected by RLS on `profile_debug_log`. Production impact is **INFERRED, high confidence**: identical definitions and grants were captured live. It was not observed in logs, because the 24h window held only 10 API requests. **Owner of the trigger: unknown** (in neither repo). Hand-off to the SITE00 owner and the founder: doc 20, B-07.

## 3. JURNL

| Question | Answer |
|---|---|
| Database dependency on migrated objects? | **None** |
| Identity dependency? | **Yes**: shared Supabase Auth and the `on_auth_user_created` trigger. S0B-1 does not change either. REG-16 shows the signup path unchanged |
| API dependency? | None on FS APIs |
| Deployment dependency? | None (SITE00 repository, separate deployment) |
| **Verdict** | **NOT APPLICABLE / NOT AFFECTED** by S0B-1. The signup trigger was regression-tested locally (PASS) |

## 4. Production cross-product checks still required at A1b

1. SITE00 owner: sign in on site00.com and open one data page. Expect no new errors in the Supabase logs.
2. JURNL: one signup on the production JURNL app by its owner, if they want that check. S0B-1 does not touch that path.
3. Advisor counts: `anon_security_definer_function_executable` 17 → 7. `site00_*` items are unchanged and remain SITE00's.
