# AI Context — Studio OS High-Level Onboarding

**Capsule:** StudioOS_ContextCapsule_v0.1 · **0.3.2**  
**Last updated:** 2026-07-12  
**Purpose:** Compressed orientation for external AI — not a substitute for full repo bibles (paths below point to canonical docs in the host repository)

---

## 1. Current vision

**Studio OS** is a standalone creative operating system — a **living headquarters** where every capability has a physical home in **Studio World™**. Frontal Slayer is the first organization; the platform is multi-company native.

The founder is building:

- A **place-driven** OS (not menu-driven SaaS)
- **Genesis** as constitutional creative DNA
- **Studio World** as immersive spatial experience
- **Studio Institute** as the learning operating system woven through the city
- **Production governance** for real asset generation (FAL, governed routes)

**North star:** Users feel like they **travel through a civilization**, not open software pages.

---

## 2. Products (layers)

| Layer | What it is | Code / docs home |
|-------|------------|------------------|
| **Build-a-Wig / Frontal Slayer storefront** | Customer commerce, Build-a-Wig, PSA, bookings | `src/pages/`, `motherboard/CORE.md` |
| **Studio OS platform** | Admin HQ, workspaces, org boundary | `src/studio-os-core/`, `docs/studio-os/` |
| **Genesis Core** | Constitutional DNA, company genome, experience runtime | `docs/studio-os/genesis/`, `src/studio-os-core/genesis/` |
| **Studio World** | Spatial districts, Atlas, Knowledge Graph, civilization | `docs/studio-world/` |
| **Studio Institute** | Learning OS, professors, Learning DNA | `docs/studio-institute/` |
| **Experience Lab** | Brand preview / validation render mode | `src/studio-os-core/experience-lab-runtime/` |
| **World Compiler** | Scene assembly pipeline (shell → layers → mount) | `src/studio-os-core/scene-stack/world-compiler/` |
| **Creative Direction Studio** | Scene Stack UI, layer generation | `src/components/admin/studio-os/creative-direction-studio/` |
| **Black Box / Flight Recorder** | Operational diagnostics | `src/studio-os/diagnostics/` |

---

## 3. Architecture (technical)

### Stack

- **Frontend:** React 19, TypeScript, Vite 5, React Router 6, Tailwind
- **Backend:** Vercel serverless `api/`, Supabase (auth, DB, storage)
- **Generation:** FAL (`fal-ai/nano-banana-pro/edit`), governed via Creative Production Gateway
- **Deploy:** Vercel production on `master` — **one push = one deploy**

### Code layout

```
src/studio-os-core/     — Platform logic (reusable)
src/workspaces/         — Brand implementations (Frontal Slayer first)
src/studio-os/          — Application wiring, diagnostics
motherboard/            — Cursor agent persistent memory
docs/studio-os/         — Product architecture bible
docs/studio-world/      — Spatial / civilization canon
docs/ai-collaboration/  — This ChatGPT onboarding package
```

### Boot paths (2026-07-10)

```
index.html → pre-main-probe.js → entry-dispatch
  /__studio-os-*  → diagnostic-main (isolated, no App.tsx)
  else            → main-app → global-boot → main-legacy
```

### Multi-company routes

Company-scoped: `/admin/studio/companies/{companySlug}/...`  
Global: command-center, atlas, mission-control, etc.  
Never hardcode `frontal-slayer` in new company-scoped components.

---

## 4. Genesis

**Genesis** is the constitutional layer — company genome, experience DNA, organizational memory, creative operating system rules.

Key docs:

- `docs/studio-os/genesis/README.md`
- `docs/studio-os/genesis/GENESIS_V1_CONSTITUTIONAL_CLOSURE.md`
- `docs/studio-os/genesis/EXPERIENCE_LAB_PLATFORM.md`

Persisted client-side as `genesis_v1` (validated/quarantined on diagnostic boot).

---

## 5. Studio World

Permanent spatial blueprint — ten foundational districts (Institute, Works, World District, Forge, Labs, Research, Council, Archive, Observatory, Arena).

Key docs:

- `docs/studio-world/STUDIO_WORLD_MASTER_PLAN.md` — where things live
- `docs/studio-world/STUDIO_ATLAS_BIBLE.md` — geographic projection
- `docs/studio-world/STUDIO_WORLD_LIVING_KNOWLEDGE_GRAPH_BIBLE.md` — intelligence layer
- `docs/studio-world/STUDIO_WORLD_CIVILIZATION_BIBLE.md` — culture / belonging

**Rule:** Every new capability answers **"Where does this live?"** first.

---

## 6. Studio Institute

Spatial learning OS — professors, simulations, Learning DNA Global Engine.

Key docs:

- `docs/studio-institute/STUDIO_INSTITUTE_BIBLE.md`
- `docs/studio-institute/STUDIO_INSTITUTE_VISION_BIBLE_V3.md`
- `docs/studio-institute/STUDIO_INSTITUTE_LEARNING_DNA_BIBLE.md`

---

## 7. Genesis Core (runtime)

The executable Genesis layer — Genesis Orb, experience engine, brand discovery, narrative intelligence. Distinct from Genesis *documentation*.

Orb = primary navigation / attention surface in HQ.  
Experience Engine = runtime state for experiences and previews.

---

## 8. Experience Lab

Validation render mode for previewing brand environments **without** promoting to Asset Registry.

- Route context: company + concept (A/B/C) previews
- Uses ephemeral shell pipeline + Scene Stack layer generation
- Diagnostic mode: `?compilerDiag=1` — one tap = one compile run, freeze on Layer 1 failure
- **Not production-canonical** until governance + authorization satisfied

---

## 9. World Compiler

Assembles a **station** through ordered stages:

1. Environment shell (reference / locked)
2. Layer 1: **Signature Landmark™** (`signature-landmark` / `mount-landmark`)
3. Subsequent Scene Stack layers (furniture, lighting, atmosphere, …)

Compile reports, scene graph, render validation in `src/studio-os-core/scene-stack/world-compiler/`.

---

## 10. Department Package Registry

Executable department packages (e.g. `studio-world-atlas`) must register in `DepartmentPackageRegistry` at boot. Missing package = pipeline failure before Layer 1.

Recent fix: bundled `studio-world-atlas` golden package + boot validation.

---

## 11. Current roadmap (compressed)

| Phase | Focus | Status |
|-------|-------|--------|
| Platform stabilization | Boot bisection, storage guard, diagnostic isolation | In progress |
| Experience Lab render pipeline | Shell → Layer 1 → full stack | **In Progress** — Layer 1 repair shipped; production verify pending |
| Studio World canon | Master Plan, Atlas, Knowledge Graph, Civilization bibles | Docs delivered |
| Institute intelligence | V3 Cognitive Engine, Learning DNA bibles | Docs delivered |
| Creative Direction Studio | Scene Stack production UI | Active, coupled to compiler |
| Governed generation | ProductionAuthorization on all material routes | Production gate live |
| Cross-context sync | Motherboard ↔ Unified Onboarding Pack interoperability | Shipped (v1.2.2 / capsule 0.3.2) |

Detailed roadmap: `docs/studio-world/010_IMPLEMENTATION_ROADMAP.md`, `motherboard/CORE.md`.

---

## 12. Current blockers (2026-07-12)

| Priority | Blocker | Detail | Classification |
|----------|---------|--------|----------------|
| **P0** | Layer 1 `signature-landmark` governed generation | Repair `7a8869404` shipped — JSON diagnostics, FAL preservation, maxDuration 120. **Incident NOT resolved.** Founder mobile verification pending on **both** Creative Studio and Experience Engine (shared runtime). | **In Progress** |
| **P0** | Diagnostic normal-tab reliability | Isolation shipped; device verification pending | **In Progress** |

**Do not say Creative Studio was restored.** Both surfaces share `/admin/studio/experience-lab`.

**Leading explanation for original non-JSON 500:** Vercel platform termination / invocation failure (`Inference`). **Not definitively proven** until authenticated production traces confirm.

**Proven failure position:** After M1–M7 and shell lock — first failure at Layer 1 `signature-landmark` (`Documented Fact`).

**UI caveat:** "Retry Shell Layer" is not reliable failure-stage evidence.

---

## Motherboard and Live Frontal Slayer Implementation Context

The **Motherboard** (`motherboard/`) is Cursor's in-repository implementation memory. It complements this capsule; it does not replace it.

| File | Role |
|------|------|
| `motherboard/CORE.md` | Persistent storefront + Studio OS implementation rules |
| `motherboard/CODEBASE.md` | Live codebase map (refreshed on snapshot) |
| `motherboard/MEMORY.md` | Append-only implementation history |

**When to consult Motherboard:** Tasks touching actual Frontal Slayer commerce behavior, admin flows, Build-a-Wig, PSA, bookings, deployment policy, or Studio OS code paths in `src/`.

**Authority:** `CURRENT_HANDOFF.md` and `KNOWN_BLOCKERS.md` **override** older Motherboard `MEMORY.md` for current blockers and runtime status. `CORE.md` + `CODEBASE.md` override old `MEMORY` for current implementation behavior.

**Frontal Slayer context (concise):**

- First production organization and active commerce host in this repository
- Includes storefront, account, admin, commerce, Build-a-Wig, PSA, bookings, Studio OS, Institute, diagnostics, and governed generation
- **Mobile-first** real-device verification is the default
- Production deploys from `master` — **one governed task = one commit + one deploy**
- **Composer** performs implementation; external AI does not commit unless founder changes operating model

Do not copy all of `motherboard/CORE.md` into this capsule — use the cross-reference above.

---

## 13. Canonical terminology (short list)

Full definitions: `AI_GLOSSARY.md`

| Term | One line |
|------|----------|
| Genesis Core | Constitutional runtime + DNA vault |
| Genesis Orb | HQ navigation / attention surface |
| Studio World | Spatial city housing all capabilities |
| Studio Atlas | Geographic map of the city |
| Experience Lab | Validation preview mode for brand environments |
| World Compiler | Station assembly pipeline |
| Scene Stack | Ordered generatable layers for a station |
| Department Package | Executable unit registered for a department |
| Black Box | Global flight recorder / diagnostic event bus |

---

## 14. Agent context systems

| System | Audience | Role |
|--------|----------|------|
| Unified Onboarding Pack | External AI (ChatGPT) | Deterministic architecture + founder onboarding |
| `docs/ai-collaboration/` | External AI | Collaboration docs and templates |
| `motherboard/` | Cursor agents | Implementation memory — CORE, CODEBASE, MEMORY |
| This capsule | External AI + repo agents | Operational handoff, blockers, compressed orientation |

**Cross-context workflow:**

- External AI: complete onboarding pack → then reconcile `CURRENT_HANDOFF`, `KNOWN_BLOCKERS`, and (with repo access) `motherboard/CORE.md`, `motherboard/CODEBASE.md`, latest `MEMORY.md`
- Cursor agents: auto-load Motherboard at chat start; for Studio OS work also read `CURRENT_HANDOFF` + `KNOWN_BLOCKERS`
- Neither system replaces the other; newer operational evidence wins over historical memory

---

## 15. Verification culture

- **Mobile-first** — real phone preferred over desktop DevTools
- **Normal tab** — private/incognito is not acceptable as permanent workflow
- **Forensic before repair** — preserve failure state, prove transition
- **One deploy per task** — Composer commits once per founder request

---

*End of AI Context v1.0.0*
