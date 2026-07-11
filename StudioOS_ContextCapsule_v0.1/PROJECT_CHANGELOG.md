# Project Changelog™ — Architectural Decision History

**Capsule:** StudioOS_ContextCapsule_v0.1 · v0.3.0  
**Format:** Append-only. Newest entries at bottom.  
**Each entry:** Date · Decision · Reason · Impact · Files/docs · Supersedes · Dependencies

---

## 2026-07-08 — Multi-Company Route Architecture

**Decision:** Company-scoped routes use `/admin/studio/companies/{companySlug}/...`; global routes stay at command-center, atlas, etc.

**Reason:** Studio World is multi-company native; hardcoded `frontal-slayer` paths do not scale.

**Impact:** All new company-scoped UI must use `useCompanyRoute()`.

**Files:** `src/studio-os-core/company-routes/`, `motherboard/CORE.md`

**Supersedes:** Implicit single-company admin paths

**Dependencies:** CompanyRouteProvider on admin studio routes

---

## 2026-07-08 — Production Completion System (ARTICLE-K24)

**Decision:** Production Package auto-includes Production Completion Checklist + Quality Gates in Production Orchestrator.

**Reason:** Definition of Done for Studio World production packages.

**Impact:** COMPLETION tab on Production Board; scope inference skips irrelevant checkpoints.

**Files:** `src/studio-os-core/production-completion-system/`

---

## 2026-07-09 — studio-world-atlas Department Package Registration

**Decision:** Bundled canonical `studio-world-atlas` package in `DepartmentPackageRegistry` with boot-time validation.

**Reason:** Experience Lab referenced `studio-world-atlas` but static registry had only 3 entries — pipeline failed before Layer 1.

**Impact:** Package lookup resolves; Black Box registry events; dist verification script.

**Files:** `src/studio-os-core/department-package/`, commit `03726eaf9`

**Dependencies:** Scene stack render bindings, Experience Lab atlas department

---

## 2026-07-10 — Layer 1 Forensic Pass (No Repair)

**Decision:** Forensic sprint only for Layer 1 failure — freeze `FAILED_AT_LAYER_1`, fix misleading shell retry UI, do not repair generation.

**Reason:** UI concealed Landmark failure as shell failure; root cause needed before fix.

**Impact:** `?compilerDiag=1`, `layer1-forensic.ts`, LANDMARK GENERATION FAILED UI.

**Proven root cause:** `AUTH_REQUIRED` on governed generation — shell uses canvas fallback, Landmark does not.

**Files:** `useSceneStack.ts`, `SceneStackViewport.tsx`, `layer1-forensic.ts`, commit `506d77169`

**Supersedes:** Treating Layer 1 failure as shell invalidation

**Dependencies:** Future auth repair sprint before Experience Lab resume

---

## 2026-07-10 — Diagnostic Route Isolation

**Decision:** `/__studio-os-*` routes load via isolated `diagnostic-main.tsx`; pre-main probe before React; recovery page at `/__studio-os-recovery`.

**Reason:** Normal tabs failed (stale cache + global-boot before route split); private tabs worked.

**Impact:** Split entry architecture; scoped quarantine; export diagnostics; chunk reload disabled on diagnostic paths.

**Files:** `public/pre-main-probe.js`, `src/entry-dispatch.ts`, `src/diagnostic-entry/*`, commit `ef969cb7d`

**Supersedes:** Single `main.tsx` always importing `global-boot` before route detection

**Dependencies:** Normal-tab device verification

---

## 2026-07-10 — ChatGPT Operating Manual Package

**Decision:** Permanent external-AI onboarding at `docs/ai-collaboration/` separate from motherboard and product bibles.

**Reason:** Brand-new ChatGPT conversations need near-perfect continuity in minutes.

**Impact:** Eight core docs + export specification; maintenance strategy; NEW_CHAT_CHECKLIST.

**Files:** `docs/ai-collaboration/*`

**Dependencies:** Founder updates `CURRENT_HANDOFF.md` each sprint; future AI Context Capsule automation

---

*Append new decisions below this line.*

## 2026-07-10 — ChatGPT Operating Manual Package (delivered)

**Decision:** Permanent external-AI onboarding at `docs/ai-collaboration/` with eight core docs, export spec, and CLI stub `npm run export:ai-context-capsule`.

**Reason:** Brand-new ChatGPT conversations need near-perfect continuity in minutes; separate from motherboard (Cursor) and product bibles.

**Impact:** NEW_CHAT_CHECKLIST onboarding path; CURRENT_HANDOFF as living sprint snapshot; PROMPT_TEMPLATES for Composer/Terra; no Studio OS app features changed.

**Files:** `docs/ai-collaboration/*`, `scripts/export-ai-context-capsule.mjs`, `package.json` script

**Supersedes:** Ad-hoc ChatGPT context pastes without structure

**Dependencies:** Founder maintains CURRENT_HANDOFF; Phase 2 automates capsule on release

---

## 2026-07-10 — AI Context Capsule™ v2 canonical architecture (docs only)

**Decision:** Single portable `.studiocapsule` ZIP replaces dozens of loose Markdown exports as the canonical AI continuity layer.

**Reason:** Founder should upload one file; any AI (ChatGPT, Claude, Gemini, Cursor) onboarded in minutes without manual re-explaining Studio OS.

**Impact:** `AI_CONTEXT_CAPSULE_SPECIFICATION.md` v2.0.0 — package layout, manifest v2 schema, versioning, compression, import/export workflows, smart export types, HQ Archive path, automation roadmap. Source docs: `FOUNDER_PROFILE.md`, `PROJECT_DNA.md`, `AI_MEMORY_SNAPSHOT.md`. `EXPORT_SPECIFICATION.md` demoted to v1 appendix.

**Files:** `docs/ai-collaboration/AI_CONTEXT_CAPSULE_SPECIFICATION.md`, `schemas/manifest.v2.schema.json`, supporting sources, README/NEW_CHAT_CHECKLIST updates.

**Supersedes:** Flat md+json as primary deliverable (CLI remains Phase 1 interim)

**Dependencies:** Phase 2 CLI `.studiocapsule` builder; Phase 4 HQ Archive UI

---

## 2026-07-10 — AI Context Protocol™ v1.0 (institutional memory — docs only)

**Decision:** AI Context Protocol™ becomes the canonical onboarding standard; AI Context Capsule™ is one implementation. Goal shifts from exporting documentation to transferring institutional memory.

**Reason:** Receiving AI should behave as though it participated for months — knowing why, how decisions were made, and how collaboration works. North star: "Git clones code; AI Context Protocol clones organizational understanding."

**Impact:** `AI_CONTEXT_PROTOCOL_SPECIFICATION.md` v1.0.0 + fifteen module specs under `protocol/` (bootstrap, health, memory graph, decision memory, collaboration memory, Founder DNA, Project DNA, canon engine, timeline, onboarding report, knowledge diff, AI Passport, Institutional Memory Engine, compatibility matrix, evolution roadmap). `schemas/manifest.v3.schema.json` adds protocol module paths. Capsule target layout v3 documented; no CLI/HQ code.

**Files:** `docs/ai-collaboration/AI_CONTEXT_PROTOCOL_SPECIFICATION.md`, `docs/ai-collaboration/protocol/*`, `schemas/manifest.v3.schema.json`, README/CURRENT_HANDOFF updates.

**Supersedes:** Treating capsule as documentation zip only (capsule now implements protocol)

**Dependencies:** Phase 2 capsule builder v3; Phase 3 HQ Archive; B1/B2 unchanged

---

## 2026-07-10 — Studio AI™ v1.0 (persistent intelligence layer — docs only)

**Decision:** Studio AI is the permanent intelligence layer of Studio OS — not an LLM. Foundation models are interchangeable reasoning engines; Studio AI owns identity, roles, persona, and institutional memory continuity.

**Reason:** Models evolve; founder relationships, projects, culture, and memory must persist across upgrades. North star: founders ask "What version of Studio AI?" not "What model are you?"

**Impact:** `docs/studio-os/studio-ai/` — Vision Bible + Persistent Intelligence Architecture, REA, AI Succession System, Institutional Memory Architecture, Executive Role Model, Persona Continuity, Model Compatibility Layer, Upgrade Workflow, Long-Term Roadmap. Succession ceremony treats model upgrades as executive succession. Roles (Creative Director, Professors) survive engine changes.

**Files:** `docs/studio-os/studio-ai/*`, CURRENT_HANDOFF, README cross-links.

**Supersedes:** Identifying platform AI with vendor model names

**Dependencies:** AI Context Protocol + IME (memory transfer); Genesis Core (visual layer); native runtime Phase 2+

---

## 2026-07-10 — AI Context Capsule v0.1 manual prototype

**Decision:** First complete manually generated capsule folder (`StudioOS_ContextCapsule_v0.1/`) for protocol validation — no export automation.

**Reason:** Validate AI Context Protocol by onboarding brand-new ChatGPT without founder re-explaining Studio OS.

**Impact:** 14 markdown files including README_FIRST (mandatory onboarding protocol), MANIFEST, KNOWN_BLOCKERS, OPEN_QUESTIONS, full collaboration package. Flat layout pre-ZIP.

**Files:** `StudioOS_ContextCapsule_v0.1/*`

**Supersedes:** Ad-hoc partial pastes as onboarding path for external AI test

**Dependencies:** Founder onboarding report review; future CLI automation Phase 2

---

## 2026-07-10 — AI Context Capsule v0.2 — Onboarding & Validation

**Decision:** Standardize onboarding via `ONBOARDING_REPORT.md` template, expand `FOUNDER_PROFILE.md`, add `context-capsule.json` metadata, and block ZIP export when required onboarding docs are missing.

**Reason:** v0.1 validation showed strong project transfer but inferred onboarding reports and partial founder workflow reconstruction.

**Impact:** External AI completes fixed report (Founder Preference Verification, Canon Verification, Confidence Assessment) and waits for approval; prebuild validates 15 markdown files + metadata.

**Files:** `StudioOS_ContextCapsule_v0.1/*`, export pipeline, `docs/ai-collaboration/protocol/ONBOARDING_REPORT.md`

**Supersedes:** v0.1 "generate an onboarding report" (invented format)

**Dependencies:** `npm run package:ai-context-capsule-zip` in prebuild

---

## 2026-07-10 — AI Context Capsule v0.3 — Deterministic verification onboarding

**Decision:** Upgrade onboarding from summary-style to **verification-style** — compliance checklist, operational source-of-truth hierarchy, documented-vs-inferred labels, documentation review with certainty tags, auto-generated `CAPSULE_VALIDATION.md`.

**Reason:** v0.2 still allowed false confidence (recovery-style summaries, generic "capsule is truth"); ChatGPT sessions needed stricter evidence-first protocol.

**Impact:** ONBOARDING_REPORT restructured; export validation checks version sync + v0.3 sections; generator 0.3.0; versioned ZIP `StudioOS_ContextCapsule_v0.3.0.zip`.

**Files:** `StudioOS_ContextCapsule_v0.1/README_FIRST.md`, `ONBOARDING_REPORT.md`, `MANIFEST.md`, `CAPSULE_VALIDATION.md`, `scripts/package-ai-context-capsule-zip.mjs`, `context-capsule-export/constants.ts`

**Supersedes:** v0.2 onboarding template sections (Founder Preference Verification → Founder Understanding; added Compliance Checklist, Operational Source of Truth, Documentation Review)

**Dependencies:** `npm run package:ai-context-capsule-zip` in prebuild

---

## 2026-07-11 — Shared Generation Pipeline Regression (Creative Studio restoration)

**Decision:** Gate Experience Lab `validationMode` on complete compile scope (compileRunId, previewSessionId, organizationId, departmentId, stationId, projectId). Retain lazy `ensureValidationEphemeralAuth` on `studio-builder-generate`; do not restore blocking pre-pipeline ephemeral auth call.

**Reason:** B1 commits `2408310f3`–`ff19d5016` leaked validation fields into shared governed generation, causing `AUTH_REQUIRED` on Creative Studio and blocking Compile Preview Spec when the ephemeral auth endpoint failed on Vercel.

**Impact:** Creative Studio validation compiles receive server-issued ephemeral authorization when scope is complete; incomplete scope no longer poisons shared requests. Experience Engine Layer 1 remains a separate blocker.

**Files:** `docs/studio-os/forensics/SHARED_GENERATION_PIPELINE_REGRESSION.md`, `src/studio-os-core/creative-production/validation-compile-context.ts`, `api/_lib/creativeProduction/legacy-adapters.ts`, `src/hooks/useSceneStack.ts`, `shared-generation-pipeline-regression.test.ts`

**Supersedes:** Unscoped global `isExperienceLabValidationRender()` default for generation payloads

**Dependencies:** Founder mobile verify on `/admin/studio/experience-lab`; Black Box at `/__world-compiler-investigation`

---

## Template for new entries

```markdown
## YYYY-MM-DD — Short title

**Decision:** …

**Reason:** …

**Impact:** …

**Files:** …

**Supersedes:** … (or "None")

**Dependencies:** …
```

---

*Append new decisions above the Template section.*
