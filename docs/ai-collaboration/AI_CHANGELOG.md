# AI Changelog™ — Project Decision History

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

**Dependencies:** Founder onboarding report review; future CLI automation Phase 2

---

## 2026-07-10 — AI Context Capsule v0.1 manual prototype

**Decision:** First complete manually generated capsule folder for external AI onboarding validation — no export automation.

**Reason:** Validate AI Context Protocol by onboarding brand-new ChatGPT without re-explaining Studio OS.

**Impact:** `StudioOS_ContextCapsule_v0.1/` — README_FIRST, MANIFEST, 12 content docs, KNOWN_BLOCKERS, OPEN_QUESTIONS. Flat md layout.

**Files:** `StudioOS_ContextCapsule_v0.1/*`, `docs/ai-collaboration/README.md`

**Supersedes:** Using partial doc pastes for onboarding test

**Dependencies:** Founder reviews onboarding report from test session

---

## 2026-07-10 — AI Context Capsule Export System™ (admin UI)

**Decision:** Studio OS admin page packages existing capsule folder into versioned ZIP with validation, history, and one-click onboarding prompt — no content regeneration.

**Reason:** Founder should never manually download 15 markdown files from GitHub; one downloadable package with version history.

**Impact:** `/admin/studio/context-capsule` — export, validate (6 checks), download history (Supabase + local), copy onboarding prompt. ZIP at `/downloads/context-capsules/StudioOS_ContextCapsule_v{version}.zip`. `prebuild` still packages via script.

**Files:** `api/admin/context-capsule.ts`, `api/_lib/contextCapsuleExport.ts`, `src/pages/admin/studio/context-capsule/`, `src/components/admin/studio/context-capsule/`, `src/hooks/useContextCapsuleExport.ts`, `src/studio-os-core/context-capsule-export/constants.ts`, `scripts/package-ai-context-capsule-zip.mjs`, `public/downloads/context-capsules/`

**Supersedes:** Script-only download (`npm run download:ai-context-capsule`) as sole distribution path

**Dependencies:** Capsule source folder `StudioOS_ContextCapsule_v0.1/` unchanged

---

## 2026-07-10 — The Spatial Computing Philosophy™ (Studio OS Bible)

**Decision:** Permanent design constitution — every capability exists as a real place in Studio World; **Where does it live?** rule before implementation.

**Reason:** Founders should operate a living company, not navigate software; philosophy becomes lens for all future features.

**Impact:** `STUDIO_OS_BIBLE/THE_SPATIAL_COMPUTING_PHILOSOPHY.md` — core belief, ecosystem hierarchy, Genesis principle, language constitution, presence/experience principles, design review checklist, marketing implications. Cross-referenced from Studio World Bible, foundation sprint, studio-os README.

**Files:** `STUDIO_OS_BIBLE/*`, `docs/studio-os/README.md`, `STUDIO_WORLD_BIBLE.md`, `foundation-sprint/*`, `CURRENT_HANDOFF.md`

**Supersedes:** Implicit placement rules scattered across sprint docs

**Dependencies:** Future architecture docs must cite spatial alignment block

---

## 2026-07-10 — Spatial Architecture Review Engine™ (Studio OS Bible)

**Decision:** Constitutional enforcement protocol — complete Spatial Architecture Review before any Studio OS implementation; Composer acts as Chief Architect.

**Reason:** Philosophy alone does not prevent dashboard drift; automated review gate before code generation.

**Impact:** `STUDIO_OS_BIBLE/SPATIAL_ARCHITECTURE_REVIEW.md` — workflow, 10 questions, Genesis/world review, design score (7 dimensions + Overall World Score), red flags, review template. Integrated: `AGENTS.md`, `.cursor/rules/spatial-architecture-review.mdc`, `PROMPT_TEMPLATES.md` §13, `CHATGPT_OPERATING_MANUAL.md` §9. Skip for P0/debugging unless founder requests.

**Files:** `STUDIO_OS_BIBLE/SPATIAL_ARCHITECTURE_REVIEW.md`, `STUDIO_OS_BIBLE/README.md`, `THE_SPATIAL_COMPUTING_PHILOSOPHY.md`, planning docs

**Supersedes:** Ad-hoc architecture review without scored gate

**Dependencies:** Future Studio OS subsystem (Genesis pre-flight) builds on this protocol

---

## 2026-07-10 — Brand Language Engine™ (Studio OS Bible)

**Decision:** Permanent naming constitution — tiers, frameworks, scorecard, social handle methodology without generating final handles.

**Reason:** Studio recognizable by coherent language across products, places, systems, and public identities — civilization not feature list.

**Impact:** `STUDIO_OS_BIBLE/BRAND_LANGUAGE_ENGINE.md` — core philosophy, naming constitution (8 articles), four tiers, product/place/AI/system frameworks, social handle engine + availability workflow, Studio Test, north star, roadmap. No usernames generated this sprint.

**Files:** `STUDIO_OS_BIBLE/BRAND_LANGUAGE_ENGINE.md`, `STUDIO_OS_BIBLE/README.md`, cross-refs in studio-os README, STUDIO_WORLD_BIBLE, CURRENT_HANDOFF

**Supersedes:** Ad-hoc product naming without tier discipline

**Dependencies:** Future handle sprint runs methodology Phase 1–4 separately

---

## 2026-07-10 — AI Context Capsule v0.2 — Onboarding & Validation

**Decision:** Standardize onboarding via `ONBOARDING_REPORT.md` template, expand founder operating profile, add `context-capsule.json`, export validation gate.

**Reason:** Deterministic onboarding — no inferred reports; measurable confidence and canon verification.

**Impact:** Capsule v0.2.0 ZIP; admin export validates onboarding completeness.

**Files:** `StudioOS_ContextCapsule_v0.1/`, export constants, prebuild packager

**Supersedes:** v0.1 free-form onboarding report instruction

**Dependencies:** Prebuild packaging script

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
