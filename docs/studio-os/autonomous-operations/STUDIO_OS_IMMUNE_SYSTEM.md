# Studio OS Immune System™

**Version:** 1.0.0 (schema drift foundation)  
**Status:** In Progress — shipped pending production auto-repair proof with `IMMUNE_SYSTEM_AUTO_REPAIR=1`

---

## Purpose

The Immune System performs **authorized recovery** when Studio OS detects deterministic infrastructure drift. The Nervous System observes; the Immune System responds.

**Bounded Founder authorization (2026-07-12):** Studio OS may automatically repair additive, non-destructive schema drift using pre-approved repository migrations when checksum-verified and target-project allowlisted.

## Reference incident

**Missing `public.studio_governed_generation_jobs`** blocked async governed generation job submit. Recovery maps to migration `20260712180000_studio_governed_generation_jobs.sql`.

## Architecture

| Layer | Path |
|-------|------|
| Contracts & policy | `src/studio-os-core/immune-system/` |
| Server orchestration | `api/_lib/immuneSystem/` |
| Governed generation bridge | `async-governed-generation.ts` insert + retry |
| Admin visibility | `ImmuneSystemPanel.tsx` (`?compilerDiag=1`) |
| Health API | `GET /api/admin/immune-system-health` |
| Incidents API | `GET /api/admin/immune-system-incidents` |

## Recovery chain (Nervous System signals)

```
SchemaDriftDetected → DiagnosisCompleted → RepairAuthorizationEvaluated
→ RepairStarted → RepairApplied → RepairVerified
→ OriginalOperationRetried → IncidentRecovered
```

or `RepairDenied → FounderEscalationRequired`

## Risk classes

| Class | Auto-repair |
|-------|-------------|
| **A** SAFE AUTOMATIC | Yes (additive migration, checksum verified) |
| **B** GUARDED | Only with extra preconditions (not in V1 runtime) |
| **C** FOUNDER APPROVAL | Never automatic |
| **D** PROHIBITED | Never (RLS bypass, arbitrary SQL, credential exposure) |

## Environment

| Variable | Purpose |
|----------|---------|
| `IMMUNE_SYSTEM_AUTO_REPAIR=1` | Enable automatic Class A repair |
| `SUPABASE_DB_URL` or `DATABASE_URL` | Postgres DDL channel |
| `SUPABASE_MANAGEMENT_ACCESS_TOKEN` | Management API DDL fallback |
| `SUPABASE_PROJECT_REF` | Target verification (default from `SUPABASE_URL`) |

## Future domains (Planned — not this sprint)

Missing env vars, storage buckets, queue workers, provider failover, deployment rollback automation.

## Mansion translation

When the Dispatch Office filing cabinet is missing, the superintendent installs the approved blueprint, verifies security, retries the work order, and records the incident — calling the Founder only when unsafe or unsuccessful.
