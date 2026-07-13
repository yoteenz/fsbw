# Canonical Studio World Department Generation

**Version:** `canonical-department-generation.v1`  
**Program:** Experience Lab — **BUILD STUDIO WORLD** (Program A)

## Overview

Experience Lab supports two **separate** administrative creation programs:

| Program | Mode | Purpose |
|---------|------|---------|
| **A** | BUILD STUDIO WORLD | Create, revise, render, approve, and publish **canonical Studio World main departments** |
| **B** | BUILD INDUSTRY PACKS | Create, revise, render, approve, and publish **official Industry Headquarters Packs** |

Canonical main departments are **global Studio World infrastructure**. They exist once. Founders use them but do not own or regenerate them.

## Canonical generation pipeline

```
Select Canonical Department
→ Review Department Charter
→ Author Blueprint
→ Generate Master Landscape Founder Render (NBP)
→ Approve Landscape
→ Generate Portrait Companion Render (NBP edit/recompose)
→ Validate Cross-Device Consistency
→ Generate Command Dock Placeholder Architecture
→ Generate Workbench Placeholder Architecture
→ Generate Socket Metadata
→ Approve Department
→ Send to Creative Director Studio
→ Manufacture Department Assets (NB2 isolated)
→ Construction Mode Assembly
→ Quality Guard
→ Immune System
→ Publish Canonical Department
→ Add to Studio World Registry
```

## Architecture Law #001

All canonical Founder Renders must comply with Architecture Law #001:

- AI generates **architecture only** — rooms, furniture, Command Dock shells, Workbench consoles
- **No readable text**, labels, logos, charts, or production UI
- React mounts live interface into registered UI sockets after approval

## Model routing

| Intent | Route |
|--------|-------|
| Full-scene canonical department | `nano-banana-pro-full-scene` |
| Portrait companion | `nano-banana-pro-edit-recompose` |
| Isolated CDS assets | `nano-banana-2` |

## Access control

Restricted to:

- Admin Founder
- Authorized Studio World system administrators
- Approved internal architecture workers

Server enforcement: `POST /api/admin/canonical-department-generation` via `studioWorldAdminAccess.ts`.

## Batch generation

Admin batch actions require explicit confirmation and cost review before dispatch:

- Department count
- Expected render count
- Estimated AI cost
- Queue capacity
- Permit requirements

## Key modules

- `canonical-department-registry.ts` — CanonicalStudioWorldDepartmentRegistry™
- `department-charters.ts` — locked Department Charters
- `canonical-department-generation.ts` — pipeline + cost governance
- `cds-canonical-handoff.ts` — Creative Director Studio handoff
- `prompt-contracts.ts` — versioned per-department prompts
- `shell-profiles.ts` — Command Dock / Workbench placeholder maps

## UI

- `ExperienceLabProgramSelector` — Program A vs B
- `CanonicalDepartmentTree` — dynamic category tree from registry
- `CanonicalDepartmentBatchPanel` — controlled batch queue (dispatches to live Founder Render queue)
- `CanonicalDepartmentQueuePanel` — physical queue status (queued · generating · ready · failed)

## Canonical render queue (Program A runtime)

**Approval gate required:** Batch generation is locked until the NBP Founder Render preview is approved in **FOUNDER RENDER REVIEW (NBP)** — same gate as Industry Pack HQ planning.

1. Select canonical department(s) in **STUDIO WORLD MAIN DEPARTMENTS**
2. **FOUNDER RENDER REVIEW** — submit intent → **Generate Founder Preview** (NBP) → review photoreal full-room → **Approve Preview**
3. After approval, **ADMIN BATCH GENERATION** and **CANONICAL RENDER QUEUE** unlock
4. Confirm batch checkbox → **Queue selected department**
5. Portrait jobs auto-queue after landscape READY

API: `POST /api/admin/canonical-department-generation` with `action: queue` (requires `approval_status=approved` founder render for department) | `action: queue-status` · `GET ?view=queue`

## Founder mod promotion gate

Experience Lab **must not** silently promote a founder-created mod into an official Industry Pack default.

To promote or license a founder-created feature into an official pack, require an explicit `content_rights_records` acquisition or licensing record (rights holder, territory, duration, compensation, royalty terms, attribution, exclusivity, modification/sublicensing rights, termination).

Without that record, founder-created work (e.g. **Build-A-Wig Atelier™** by Frontal Slayer) remains `FOUNDER_CREATED_MODDED_SCENE` outside official defaults. See `src/studio-os-core/founder-mods/experience-lab-rights-gate.ts` and `docs/studio-os/industry-packs/BRAND_NEUTRALITY_STANDARD.md`.
