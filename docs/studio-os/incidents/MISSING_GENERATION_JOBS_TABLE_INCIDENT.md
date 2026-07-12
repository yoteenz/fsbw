# Incident: Missing Generation Jobs Table

**Date:** 2026-07-12  
**Signature:** `missing-schema-resource:public.studio_governed_generation_jobs`  
**Status:** Resolved manually; Immune System auto-repair shipped as prevention

---

## Documented facts

1. Async governed generation required `public.studio_governed_generation_jobs`
2. Table was missing from production Supabase (`hyycomvcaqxxvyrfupes`)
3. Application returned structured schema-cache / relation-not-found errors
4. FAL was not the active failure boundary at diagnosis time
5. No generation job could be persisted
6. Adding the table restored the workflow
7. Investigation time was excessive for a deterministic cause

## Approved repair

| Field | Value |
|-------|-------|
| Migration | `20260712180000_studio_governed_generation_jobs.sql` |
| Risk class | A (SAFE AUTOMATIC) |
| Rollback | Drop table only with founder approval after zero production rows |

## Immune System response (post-sprint)

When `IMMUNE_SYSTEM_AUTO_REPAIR=1` and DDL channel configured:

1. Detect missing table on job insert  
2. Map to approved migration  
3. Apply + verify contract  
4. Retry insert once  
5. Return `immuneRecovery` structured response  

## Founder action

None when auto-repair succeeds. Escalation when repair denied or verification fails.
