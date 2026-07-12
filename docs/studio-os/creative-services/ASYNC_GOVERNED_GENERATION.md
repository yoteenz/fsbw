# Async Governed Generation Work Orders

**Sprint:** P0 — “Turn the decorating call into a tracked work order”  
**Flag:** `ASYNC_GOVERNED_GENERATION_V1` (Experience Lab validation async by default when unset; set `0` to rollback)

---

## Problem (Documented Fact)

- `requestStudioBuilderGenerate` held a synchronous HTTP connection for ~95.5s
- Browser threw `TypeError: Load failed` before a usable JSON response arrived
- Package resolution, authorization, and governed routing succeeded; transport was the failure boundary

## Inference

- FAL generation duration likely exceeds mobile/browser connection lifetime for a single long-lived request

## Solution

Governed generation work-order lifecycle:

```
submit → accepted → queued → generating → normalizing → storing → registering → complete
```

or `submit → accepted → failed`

### Architecture

| Component | Path |
|-----------|------|
| Job table | `supabase/migrations/20260712180000_studio_governed_generation_jobs.sql` |
| Job contract | `src/studio-os-core/creative-production/governed-generation-job.ts` |
| Server orchestration | `api/_lib/creativeProduction/async-governed-generation.ts` |
| FAL queue | `api/_lib/studioBuilderGeneration.ts` (`fal.queue.submit` + poll) |
| Submit (202) | `api/admin/studio-builder-generate.ts` when async enabled |
| Status | `GET /api/admin/studio-generation-status?jobId=` |
| Worker | `POST /api/admin/studio-generation-worker` (fire-and-forget after submit) |
| Client poll/resume | `src/services/studio/studioBuilder/async-job-client.ts` |
| Shared caller | `requestStudioBuilderGenerate` handles 202 + poll |

### Governance preserved

- `validateGovernedGenerationForExecution` — auth, graph, CIE
- FAL remains primary provider (`fal-ai/nano-banana-pro/edit`)
- Asset registry registration on material paths
- No parallel pipeline; sync path retained when async disabled

### Rollout

| Surface | Async when |
|---------|------------|
| Experience Lab validation | Default on (`validationMode: true`) unless `ASYNC_GOVERNED_GENERATION_V1=0` |
| Creative Studio | `ASYNC_GOVERNED_GENERATION_V1=1` **and** `ASYNC_GOVERNED_GENERATION_CREATIVE_STUDIO=1` |

### Immune System™ integration (schema drift)

When `studio_governed_generation_jobs` is missing from production:

1. Job insert fails with schema-cache error
2. Immune System diagnoses missing table → maps to `20260712180000_studio_governed_generation_jobs`
3. Class A repair authorized when `IMMUNE_SYSTEM_AUTO_REPAIR=1` + DDL channel configured
4. Migration applied server-side; schema contract verified; insert retried once
5. Response includes `immuneRecovery` structured payload

**Preflight:** feature-entry readiness probe blocks submit with 503 only when table missing **and** auto-repair disabled.

**Admin visibility:** Experience Lab `?compilerDiag=1` → Immune System panel; APIs `GET /api/admin/immune-system-health`, `GET /api/admin/immune-system-incidents`.

Canon: `docs/studio-os/autonomous-operations/STUDIO_OS_IMMUNE_SYSTEM.md`

### Mobile recovery

1. Submit returns `jobId` in <2s (target)
2. `localStorage` persists job per layer key
3. Client polls with backoff; may stop polling on page exit
4. FAL continues on provider queue; worker + status endpoint advance job
5. Reopen page → `resumePersistedGovernedGenerationJob` continues monitoring

### UI labels

See `GOVERNED_GENERATION_JOB_UI_LABELS` — Work order accepted, Waiting for decorator, Decorating in progress, etc.

### Status

**In Progress** — shipped pending founder mobile production proof. Not declared Production restored.

---

## Environment variables

| Variable | Purpose |
|----------|---------|
| `ASYNC_GOVERNED_GENERATION_V1` | Master flag (`0` disables; `1` enables explicit; unset = validation async on) |
| `ASYNC_GOVERNED_GENERATION_CREATIVE_STUDIO` | Enable async for non-validation Creative Studio |
| `STUDIO_GENERATION_WORKER_SECRET` | Protects worker endpoint in production |
| `FAL_KEY` | Required (unchanged) |

---

## Evidence authority for first run

Record: submit response time, jobId, providerRequestId, FAL duration, page-exit continuity, resume, asset registration, shell mount.
