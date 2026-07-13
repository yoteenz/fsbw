# Cross-Department Render Contamination — Forensic Investigation

**Sprint:** P0 — Eliminate Cross-Department Render Contamination  
**Date:** 2026-07-13  
**Verdict:** ROOT CAUSE CONFIRMED AND REPAIRED

## Symptom

Selecting Experience Lab, Creative Director Studio, Reception, Executive Atrium only changed the **label**. Rendered architecture remained the reception scene.

## End-to-End Trace

```
Founder selects Experience Lab
  → buildCanonicalDepartmentConstructionPlan('experience-lab')
  → [BEFORE FIX] fixtureReceptionConstructionPlan() — ReceptionShell for ALL departments
  → Blueprint Author session opened with contaminated plan
  → buildFounderFullRoomPreviewPrompt() — embedded ReceptionShell, concierge desk, crystal landmark
  → prepareFounderRenderDispatch() — generic founder-full-room-preview-prompt.v1
  → FAL NBP — reception architecture in effective prompt
  → studio_founder_render_jobs — room_id correct but blueprint was ReceptionShell
  → Founder Review UI — displayed reception room with Experience Lab label
```

## Root Cause

**`buildCanonicalDepartmentConstructionPlan()` called `fixtureReceptionConstructionPlan()` for every canonical department.**

This forced shared contamination:

| Field | Contaminated Value |
|-------|-------------------|
| `architectureId` | `ReceptionShell` |
| `shellSpecId` | `shell-reception-v4` |
| Hero assets | ReceptionDesk, CrystalLandmark |
| Furniture | LeftSeating, RightSeating, CoffeeTable |
| Lighting | ExecutiveReceptionLighting |
| Prompt | Generic `founder-full-room-preview-prompt.v1` |

Registry was correct (per-department `blueprintTemplateId`, `departmentPromptVersion`) but construction plan builder ignored it.

## Secondary Contamination Paths

1. **Prompt builder** — `buildFounderFullRoomPreviewPrompt()` serialized plan assets (reception furniture) into FAL prompt
2. **Job persistence** — `prompt_version` hardcoded to generic version; department identity not in diagnostics
3. **Cache** — `productionGroupId` was `founder-render-{roomId}` without revision/architecture isolation

## Repair

| Layer | Fix |
|-------|-----|
| Blueprint | `department-blueprint-builder.ts` — per-department shells (ExperienceLabShell, CreativeDirectorStudioShell, etc.) |
| Prompt | `canonical-founder-render-prompt.ts` — per-department `canonical-*-founder-render.v1` effective prompts |
| Fingerprints | `department-architectural-fingerprints.ts` — signature elements + reception forbidden markers |
| Charters | Expanded `mustInclude` / `neverInclude` for EL, CDS, Command Center, Marketplace, Founder Suite |
| Cache | `founder-render-cache-identity.ts` — org + departmentId + all revisions + architecture |
| Validator | `department-distinctness-validator.ts` — rejects RECEPTION_CONTAMINATION and DEPARTMENT_NOT_DISTINCT |
| Persistence | `founderRenderJobs.ts` — departmentId, departmentClass, cacheKey, fingerprint in diagnostics |
| Diagnostics | `FounderRenderDiagnosticsPanel` — department, blueprint, prompt, cache key, fingerprint |
| Polling | Already job-scoped by jobId; approval gate filters by `room_id = departmentId` |

## Effective Prompt Verification (Post-Fix)

Experience Lab effective prompt contains:
- `DEPARTMENT ID: experience-lab`
- `BLUEPRINT: ExperienceLabShell`
- `canonical-experience-lab-founder-render.v1`
- `NEVER INCLUDE: reception desk · waiting room · ReceptionShell`

Does NOT contain: `ReceptionShell`, `concierge desk`, `ReceptionDesk`

## Tests

`department-render-isolation.test.ts` — proves blueprint, prompt, cache, and validator isolation across 5 canonical departments.
