# AI Context — Studio OS High-Level Onboarding

**Capsule:** StudioOS_ContextCapsule_v0.1 · **v0.3.0**  
**Last updated:** 2026-07-10  
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
| Experience Lab render pipeline | Shell → Layer 1 → full stack | **Blocked on Layer 1 auth** |
| Studio World canon | Master Plan, Atlas, Knowledge Graph, Civilization bibles | Docs delivered |
| Institute intelligence | V3 Cognitive Engine, Learning DNA bibles | Docs delivered |
| Creative Direction Studio | Scene Stack production UI | Active, coupled to compiler |
| Governed generation | ProductionAuthorization on all material routes | Production gate live |

Detailed roadmap: `docs/studio-world/010_IMPLEMENTATION_ROADMAP.md`, `motherboard/CORE.md`.

---

## 12. Current blockers (2026-07-10)

| Priority | Blocker | Detail |
|----------|---------|--------|
| **P0** | Layer 1 Landmark generation | `AUTH_REQUIRED` on `/api/admin/studio-builder-generate` — validation client sends no `productionAuthorizationId`; shell succeeds via canvas fallback, Landmark does not |
| **P0** | Diagnostic normal-tab reliability | Isolation shipped (`ef969cb7d`); device verification pending on iOS Safari/Chrome normal tabs |
| — | Experience Lab → full compile | Do not resume until Layer 1 auth fixed + diagnostics verified |

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

| System | Audience |
|--------|----------|
| `docs/ai-collaboration/` | ChatGPT / external AI |
| `motherboard/MEMORY.md` | Cursor agents (append-only timeline) |
| `motherboard/CORE.md` | Permanent design facts |
| `motherboard/CODEBASE.md` | Code structure snapshot |

External AI: start here + `CURRENT_HANDOFF.md`.  
Cursor agents: motherboard auto-load at chat start.

---

## 15. Verification culture

- **Mobile-first** — real phone preferred over desktop DevTools
- **Normal tab** — private/incognito is not acceptable as permanent workflow
- **Forensic before repair** — preserve failure state, prove transition
- **One deploy per task** — Composer commits once per founder request

---

*End of AI Context v1.0.0*
