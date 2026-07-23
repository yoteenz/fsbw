# Studio World — AI & Agents Inventory

**Scope:** AI-related Studio systems (not customer PSA chat unless shared infra—PSA not inventoried).

---

## Server-side orchestration

| Component | Path | Role |
| --- | --- | --- |
| **Generation gateway** | `api/_lib/creativeProduction/generation-gateway.ts` | Routes generation intents |
| **Async governed generation** | `api/_lib/creativeProduction/async-governed-generation.ts` | Job lifecycle |
| **studio-os-server** | `api/_lib/creativeProduction/studio-os-server.ts` + `.bundle.js` | Bundled server entry for serverless |
| **Verified asset pipeline** | Referenced in blockers (`runVerifiedAssetProductionPipeline`) | Quality/background removal |
| **studioBuilderGeneration** | `api/_lib/studioBuilderGeneration.ts` | FAL NBP edit for builder |
| **studioAssetGeneration** | `api/_lib/studioAssetGeneration.ts` | Asset helpers |
| **Worker** | `api/admin/studio-generation-worker.ts` | Processes `studio_governed_generation_jobs` |
| **Creative intelligence API** | `api/admin/studio-creative-intelligence.ts` | Decisions/learning persistence |

**Execution flow (observed):** UI → POST generate endpoint → job row → worker → FAL → storage → registry/status poll.

---

## Client / UI “AI” modules

| Module | Path | Notes |
| --- | --- | --- |
| **AI orchestrator** | route + page | UI shell |
| **AI production engine** | `AdminStudioAiProduction*` | Run monitoring UI |
| **AI studio** | route `ai-studio` | Creative tools entry |
| **Model orchestrator** | page | Model routing UI |
| **Studio foundation models** | workspace | Foundation model UI |
| **Global AI (portfolio)** | `/admin/studio-os/global-ai` | Administration |
| **Executive AI director** | route + world registry | Observatory room |
| **AI red team / AI media network** | core + UI folders | Specialized modules |

These are **product surfaces**; underlying LLM/agent wiring varies per module (not unified single agent runtime in one file).

---

## Genesis AI engines (in-process)

Located under `src/studio-os-core/genesis/`:

| Engine area | Examples |
| --- | --- |
| **Narrative intelligence** | `campaign-generator`, `episode-generator`, `course-generator`, `narrative-blueprint-generator`, … |
| **Live validation** | learning, proposal, confidence, value engines |
| **FAT** | evidence, graduation, replacement, withdrawal engines |
| **Decision engine context** | `genesis/decision-engine/context/engine.ts` |

These run **client-side or server-imported** TypeScript logic with seeded data/bootstrap files—not necessarily external LLM calls unless wired in specific generators (per-file providers not fully enumerated in audit).

---

## Prompt systems

| System | Location |
| --- | --- |
| **Prompt library UI** | `prompt-library` route, `architects-prompt-library/` |
| **Prompt registry** | `prompt-registry` route, core registries |
| **Prompt QA** | `prompt-qa` route |
| **Docs** | `docs/studio-os/` prompt-related specs |

---

## Knowledge retrieval & context

| System | Location |
| --- | --- |
| **Knowledge vault (expert)** | `studio-os-core/expert-capture/trust-vault/` |
| **Context capsule export** | `context-capsule-export/`, `api/admin/context-capsule.ts` |
| **Onboarding pack export** | `onboarding-pack-export/` |
| **Collaboration/founder intelligence capsules** | repo folders + release zips |
| **World knowledge engine** | UI route (demo) |
| **Knowledge registries** | UI routes |

**Capsules:** `StudioOS_ContextCapsule_v0.1/` for operational AI handoff (`AI_CONTEXT`, handoff markdown).

---

## Automation

| System | Location |
| --- | --- |
| **Automation registry** | `automation-registry/` core + route |
| **Studio generation worker** | Cron/worker API |
| **Environment package worker** | `environment-package-worker` API |
| **Canonical department generation** | `canonical-department-generation.ts` |
| **Social publish** | `studio_social_*` + admin APIs |

---

## “AI employees” / agents (documented vs code)

| Source | Observation |
| --- | --- |
| **Docs** | `docs/studio-os/sdk/05_AI_EMPLOYEE_SYSTEM.md`, `STUDIO_OS_BIBLE/THE_LIVING_ORGANIZATION.md` |
| **Code** | No single `/admin/studio/workers` agent runtime; institute field `worker_being_created` on invites |
| **Concierge layer** | `concierge-layer/`, `concierge-routing/` modules + UI routes—routing/orchestration concept |

Agent framework is **spec + modular engines**, not one deployed agent server in repo audit.

---

## Dependencies

| Dependency | Use |
| --- | --- |
| **FAL** | Image generation (nano-banana-pro/edit, founder full-room) |
| **Supabase** | Jobs, registry, state |
| **Pre-bundled server JS** | Avoid serverless import failures (B0 blocker history) |

---

## Execution flow summary

```
[Experience Lab | CDS | Builder UI]
        POST /api/admin/studio-*-generate
                → generation-gateway / bundle
                → studio_governed_generation_jobs
                → studio-generation-worker
                → FAL + storage + asset registry
                ← poll studio-generation-status
[Genesis narrative generators] — local/seed-driven TS engines (parallel track)
[Expert capture] — session APIs + vault storage (human knowledge, not generative default)
```

---

## Health (documented, not fixed)

See `KNOWN_BLOCKERS.md`: B1-Parity (FS vs Studio pipeline), B1-FounderRender verify pending, B1-Layer1/E2E gates for Experience Lab validation narrative.
