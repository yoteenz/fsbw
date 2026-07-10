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
