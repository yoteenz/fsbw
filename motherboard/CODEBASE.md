# Codebase snapshot — Build-a-Wig / Frontal Slayer / Studio OS

Structured map of the **current** repository. Refreshed 2026-07-12 for cross-context synchronization with the Unified Studio OS Onboarding Pack.

**Operational authority for volatile state:** `StudioOS_ContextCapsule_v0.1/CURRENT_HANDOFF.md` and `KNOWN_BLOCKERS.md` — not duplicated here.

---

## Top-level layout

| Path | Role |
|------|------|
| `src/` | React 19 + TypeScript + Vite frontend |
| `api/` | Vercel serverless API routes |
| `public/` | Static assets, compiled world-graph, capsule release JSON |
| `scripts/` | Build, capsule packaging, FAL batch jobs, verification probes |
| `docs/` | Product canon (storefront, Studio OS, Studio World, Institute) |
| `motherboard/` | Cursor agent persistent memory (README, CORE, CODEBASE, MEMORY) |
| `genesis/` | Constitutional / build-order source articles |
| `STUDIO_OS_BIBLE/` | Spatial architecture review canon |
| `StudioOS_ContextCapsule_v0.1/` | AI Context Capsule source |
| `StudioOS_StudioDNACapsule_v1.0/` | Studio DNA Capsule source |
| `founder-intelligence/` | Founder Intelligence Capsule source |
| `collaboration-intelligence/` | Collaboration Intelligence Capsule source |
| `onboarding-pack/` | Unified pack templates (ONBOARDING_GUIDE, REPORT_TEMPLATE) |
| `supabase/migrations/` | Postgres schema migrations |
| `e2e/` | Playwright mobile-first E2E |
| Root | `package.json`, `vite.config.ts`, `vercel.json`, `index.html`, `AGENTS.md` |

---

## Frontend entry and boot

```
index.html → public/pre-main-probe.js → src/main.tsx
  → src/entry-dispatch.ts
      /__studio-os-*  → src/diagnostic-entry/diagnostic-main.tsx (isolated Black Box)
      else            → src/main-app.tsx → global-boot → main-legacy or shell-v2
```

**Key paths:**

| Path | Purpose |
|------|---------|
| `src/main.tsx` | Probe; dispatches to diagnostic or main app |
| `src/entry-dispatch.ts` | Route fork: isolated diagnostics vs full app |
| `src/diagnostic-entry/` | Black Box boot (`/__studio-os-flight-recorder`, recovery, live-runtime, session-report) |
| `src/main-legacy.tsx` | Default app shell, Studio Bootstrap, lazy `App.tsx` |
| `src/routes/StudioDebugRoutes.tsx` | Lightweight debug routes without full admin bootstrap |
| `src/App.tsx` | React Router — account, admin, build-a-wig, Studio OS admin |

**Public debug / forensic routes:** `/__studio-health`, `/__boot-debug`, `/__world-compiler-investigation`, `/__experience-lab-safe`, `/__studio-os-recovery`

**Vite:** `vite.config.ts` — dev `/api` proxy to production or local target.

---

## `src/studio-os-core/` — platform package

Reusable Studio OS logic (~180 module folders). Key subsystems:

| Subsystem | Path |
|-----------|------|
| Bootstrap / kernel | `bootstrap/`, `boot-registry/`, `kernel/` |
| Workspace / org | `workspace/`, `auth/`, `tenant/`, `application/` |
| Genesis runtime | `genesis/` (executive HQ, orb, experience engine, build-order, …) |
| Experience Lab runtime | `experience-lab-runtime/` — render runtime, scene-stack driver |
| Scene Stack | `scene-stack/` — layers, compose, reference-chain, shell diagnostics |
| World Compiler | `scene-stack/world-compiler/` — compile pipeline, render validation |
| Creative Direction Studio | `creative-direction-studio/` |
| Creative Studio preview | `creative-studio-preview/` — validation shell pipeline |
| Creative Production (types) | `creative-production/` — governed generation contracts |
| Model Orchestrator | `model-orchestrator/` |
| Experience Lab DNA | `genesis/experience-lab/` |
| Studio Institute / expert capture | `studio-institute/`, `expert-capture/` |
| Capsule export constants | `onboarding-pack-export/constants.ts` |
| Module registry | `core/modules.ts` |

Public re-export: `src/studio-os-core/index.ts`

---

## `src/studio-os/` and `src/workspaces/`

**`src/studio-os/`** — diagnostics and product-photography shim:

- `diagnostics/flight-recorder/` — Black Box / Flight Recorder
- `diagnostics/world-compiler-investigation/` — Layer 1 forensic, HTTP capture, stall evidence
- `product-photography/` — Creative DNA photography pipeline

**`src/workspaces/`** — tenant implementations:

- `frontal-slayer/` — first production org (commerce host)
- `ai-media/`, `all-in-one-enterprise/`, `vxd-inc/`, `sandbox/`, etc.
- `_shared/` — shared placeholders

---

## Experience Lab · Scene Stack · World Compiler · CDS

**Shared route:** `/admin/studio/experience-lab` — Creative Studio and Experience Engine converge here.

| Layer | Path |
|-------|------|
| Render runtime | `src/studio-os-core/experience-lab-runtime/experience-lab-render-runtime.ts` |
| Scene Stack hook | `src/hooks/useSceneStack.ts` |
| Creative Studio preview | `src/hooks/useCreativeStudioRenderPreview.ts` |
| UI workspace | `src/components/admin/studio/experience-lab/ExperienceLabWorkspace.tsx` |
| World Compiler | `src/studio-os-core/scene-stack/world-compiler/` |
| CDS UI | `src/components/admin/studio-os/creative-direction-studio/` |
| Forensics UI | `src/pages/debug/world-compiler-investigation/` |

**Diagnostic mode:** `?compilerDiag=1` — one manual run, freeze on first failure.

**Layer 1:** `signature-landmark` via governed `POST /api/admin/studio-builder-generate`.

---

## Creative Production Gateway · FAL · Model Orchestrator

**Server gateway:** `api/_lib/creativeProduction/generation-gateway.ts` → `executeGovernedGeneration()`

**Support modules:** `legacy-adapters.ts`, `ephemeral-validation-auth.ts`, `authorization-signing.ts`, `generation-error-diagnostics.ts`, `registry-transaction.ts`

**Primary generation routes:**

| Route | File |
|-------|------|
| Studio Builder (Layer 1) | `api/admin/studio-builder-generate.ts` |
| Studio asset | `api/admin/studio-generate-asset.ts` |
| Studio foundry | `api/admin/studio-foundry-generate.ts` |
| Ephemeral validation auth | `api/admin/experience-lab-ephemeral-authorization.ts` |

**FAL:** `api/_lib/studioBuilderGeneration.ts` — model `fal-ai/nano-banana-pro/edit`; uploads to Supabase `live-preview` bucket.

**Client API:** `src/services/studio/studioBuilder/api.ts` → `requestStudioBuilderGenerate()`

**Model Orchestrator UI:** `src/pages/admin/studio/model-orchestrator/`

**CIE:** `api/_lib/creativeIntelligenceEngine/` — decision engine on governed paths.

---

## Studio Institute

**Public routes:** `/studio-institute`, `/studio-institute/invites`, `/studio-institute/interview`, `/studio-institute/knowledge-vault`

**Admin:** `/admin/studio/studio-institute`, `/admin/studio/institute`

**API:** `api/studio-institute/invites.ts`, `api/studio-institute/invite-capture.ts`, `api/expert-capture/*`

**Core:** `src/studio-os-core/studio-institute/`, `expert-capture/`

---

## Storefront and admin (Frontal Slayer)

**Pages:** `src/pages/` — account, build-a-wig, shop/units, checkout, admin dashboard, admin studio routes.

**Admin API:** `api/admin/` — sync-profile, clients, orders, revenue, meetings, marketing, studio-os-membership, etc.

**Auth:** `src/utils/adminAuth.ts`, `api/_lib/adminAuth.ts` — Supabase session + admin email list.

---

## Context systems (Motherboard ↔ Onboarding Pack)

| System | Location | Role |
|--------|----------|------|
| **Motherboard** | `motherboard/` | Cursor implementation memory — CORE, CODEBASE, append-only MEMORY |
| **AI Context Capsule** | `StudioOS_ContextCapsule_v0.1/` | Operational handoff, blockers, AI_CONTEXT for external AI |
| **Unified Onboarding Pack** | Built to `public/downloads/onboarding-packs/` | Full deterministic onboarding ZIP — `/onboarding/latest` |
| **Delta Context** | `scripts/package-delta-context-capsule-zip.mjs` | Incremental updates for already-onboarded AI |

**Cross-context rule:** After onboarding approval, agents with repo access reconcile CURRENT_HANDOFF + KNOWN_BLOCKERS + Motherboard CORE/CODEBASE + latest MEMORY + founder production evidence. The pack does not replace live operational state.

---

## Onboarding pack generation

**Prebuild chain** (`package.json` → `prebuild`):

```
compile-master-spec.mjs → compile-world-graph.mjs
→ package-ai-context-capsule-zip.mjs
→ package-studio-dna-capsule-zip.mjs
→ package-founder-intelligence-capsule-zip.mjs
→ package-collaboration-intelligence-capsule-zip.mjs
→ package-onboarding-pack-zip.mjs
→ package-delta-context-capsule-zip.mjs
→ sync-capsule-latest-vercel-routes.mjs
```

**Key scripts:**

| Script | Output |
|--------|--------|
| `scripts/package-onboarding-pack-zip.mjs` | Unified pack ZIP + machine-readable index |
| `scripts/lib/onboarding-pack-machine-readable.mjs` | Inventory validation, coverage maps |
| `scripts/package-ai-context-capsule-zip.mjs` | Context capsule ZIP |

**Constants:** `api/_lib/onboardingPackConstants.ts`, `src/studio-os-core/onboarding-pack-export/constants.ts`

**Public hubs:** `/onboarding`, `/context`, `/founder-intelligence`, `/collaboration-intelligence`

---

## Supabase and storage

| Layer | File |
|-------|------|
| Server admin client | `api/_lib/supabase.ts` |
| Frontend client | `src/utils/supabase.ts` |
| Studio assets bucket | `STUDIO_ASSETS_BUCKET` (default `live-preview`) |
| Workspace cloud sync | `api/admin/studio-workspace-state.ts` |

Generation flow: Admin UI → governed API → FAL → Supabase upload → asset registry lineage.

---

## Deployment and git policy

- **Branch:** `master` only — no feature branches for agent delivery
- **Deploy:** One `./scripts/agent-commit.sh` per completed task = one Vercel production deploy
- **MEMORY:** Append before commit; same commit as code/docs
- **Mobile-first:** Real-device verification default for UI work

---

## Current operational authority

Do **not** treat this snapshot as sprint status. For active blockers and verification state, read:

1. `StudioOS_ContextCapsule_v0.1/CURRENT_HANDOFF.md`
2. `StudioOS_ContextCapsule_v0.1/KNOWN_BLOCKERS.md`
3. Founder-verified production evidence (Black Box exports, device tests)

Forensic references: `docs/studio-os/forensics/LAYER1_GENERATION_500_REPAIR.md`, `GENERATION_FAILED_500_TRACE.md`

---

## When to refresh

Run **"Snapshot codebase to motherboard"** after major structural changes, new platform subsystems, or route reorganizations. Overwrite this file only — do not append.
