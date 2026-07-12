# Creative Services Department™ — Long-Term Architecture Roadmap

**Status:** **Planned** / **Conceptual** — documentation only  
**Sprint:** P0 Dispatch Office Forensic + Creative Services Roadmap  
**Report date:** 2026-07-12  
**Scope:** Future evolution of governed creative generation in Studio OS  
**Does NOT change runtime behavior**

---

## Classification key

| Label | Meaning |
|-------|---------|
| **Documented Fact** | Verified in production or codebase today |
| **Inference** | Supported conclusion, not independently proven |
| **Planned** | Approved direction; not implemented |
| **Conceptual** | Design exploration; may change before build |

---

## 1. Current state (Documented Fact)

| Item | State |
|------|-------|
| Governed generation entry (Dispatch Office) | **Production** — deployed, currently failing pre-handler (see forensics) |
| `executeGovernedGeneration()` gateway | **Production** code path — not reached in current production failure |
| FAL via `studioBuilderGeneration.ts` | **Production** adapter — primary image provider today |
| Model Orchestrator UI (`/admin/studio/model-orchestrator`) | **Production** — demo/localStorage profile |
| Multi-provider routing at runtime | **Not implemented** |
| Async creative job queue | **In Progress** — `ASYNC_GOVERNED_GENERATION_V1` shipped; see `ASYNC_GOVERNED_GENERATION.md` |
| Provider failover in governed generation | **Not implemented** |
| Creative Services as Studio World department | **Conceptual** (this document) |

**Documented Fact:** Studio Builder and governed routes today call FAL **indirectly** through `generation-gateway` → `studioBuilderGeneration` — not through a fully provider-agnostic Model Orchestrator routing layer for material image generation.

**Documented Fact:** Users and modules must not assume provider switching, async jobs, or failover exist today.

---

## 2. Objective 1 — Model Orchestrator as Head of Creative Services (Planned)

### 2.1 Role evolution (Conceptual → Planned)

Today, **Model Orchestrator™** is documented primarily as the AI abstraction layer for reasoning tasks (Command Dock, concierges, research, summaries). **Planned:** expand Model Orchestrator to serve as **Head of Creative Services** — the routing authority for all **material creative output** (images, video, audio, 3D, motion).

| Responsibility | Today | Planned |
|----------------|-------|---------|
| Provider selection | FAL hard-wired in builder path | Policy-based route per asset intent |
| Capability routing | Asset type implicit in gateway | Explicit specialty → provider map |
| Cost optimization | **Not implemented** | Budget-aware routing |
| Quality optimization | CIE evaluates before generate | Orchestrator + CIE joint scoring |
| Availability / failover | **Not implemented** | Health-based reroute |
| Policy routing | ProductionAuthorization gates | Org policy + genome + department rules |

### 2.2 Routing desk architecture (Planned)

```
Studio Builder / Foundry / Asset Director / Experience Lab
         │
         ▼
  Governed Generation Gateway (Dispatch Office)
         │
         ▼
  Model Orchestrator™  ← Head of Creative Services (Planned)
    ├── resolve specialty (Interior Design, Motion, Audio, …)
    ├── select provider + model
    ├── apply cost / quality / policy constraints
    ├── enqueue sync or async job (Planned)
    └── audit decision + lineage
         │
         ▼
  Provider Adapter Layer (Planned abstraction)
    ├── FAL (current primary — not replaced)
    ├── OpenAI Images
    ├── Flux / BFL
    ├── Ideogram
    ├── Runway / Luma (video/3D)
    └── Future internal models
```

**Law (Planned):** No creative module calls a provider directly. All material generation requests pass through Model Orchestrator.

**Related canon:** [`../model-orchestrator.md`](../model-orchestrator.md) · [`../engine/asset-compiler/14_FUTURE_AI_PROVIDERS.md`](../engine/asset-compiler/14_FUTURE_AI_PROVIDERS.md)

---

## 3. Objective 2 — Multi-provider architecture (Planned)

### 3.1 Provider abstraction (Planned)

A common **Provider Adapter** interface (specified in Asset Compiler provider doc) becomes the execution boundary:

| Concern | Owner |
|---------|-------|
| Standardized generation request | Asset Compiler / governed gateway |
| Adapter implementation | Per provider (FAL, OpenAI, Flux, Ideogram, …) |
| Routing decision | Model Orchestrator |
| Audit + lineage | Governed generation gateway + Asset Registry |

### 3.2 Example providers (Conceptual roster)

| Provider | Specialty alignment | Status |
|----------|---------------------|--------|
| FAL | Interior Design, fast image edit, audio drafts | **Documented Fact** — in use today |
| OpenAI Images | Product visualization, previews, text-in-image | **Planned** |
| Flux / BFL | Environment textures, high-fidelity stills | **Planned** |
| Ideogram | Typography, branding assets, cutouts | **Planned** |
| Runway | Motion graphics, video | **Conceptual** |
| Luma | 3D environments, spatial assets | **Conceptual** |
| Internal models | Future Studio Foundation Models | **Conceptual** |

**Does not replace FAL.** FAL remains the primary production adapter until a Planned migration explicitly promotes an alternative per specialty.

### 3.3 User experience law (Planned)

> Users request **outcomes** ("Decorate the lobby", "Lock shell layer", "Hero product shot") — never providers ("Use FAL nano-banana").

Provider choice is an internal Creative Services decision visible only in admin audit trails and founder diagnostics.

---

## 4. Objective 3 — Asynchronous creative jobs (Planned)

### 4.1 Mental model shift (Conceptual)

| Today (synchronous) | Future (Planned) |
|---------------------|------------------|
| Guest waits at concierge while room is decorated | Guest submits a **work order** |
| HTTP request blocks until generate completes or fails | Creative Services **accepts the job** |
| Failure surfaces inline in Experience Lab compile | Guest is **notified when the room is ready** |

### 4.2 Async workflow components (Planned)

| Component | Purpose |
|-----------|---------|
| **Creative job queue** | Durable work orders decoupled from HTTP invocation |
| **Job status** | `queued` · `routing` · `generating` · `validating` · `approved` · `failed` · `cancelled` |
| **Progress** | Per-asset and per-package completion percentage |
| **Notifications** | Command Dock, account alerts, optional email/push |
| **Cancellation** | Founder/admin revoke in-flight jobs |
| **Retries** | Policy-based retry with provider switch (Planned — not today) |
| **Asset approval** | Validation Loop handoff before registry write |
| **Audit trail** | ProductionAuthorization + orchestrator decision + provider response |
| **Generation history** | Immutable lineage in Asset Registry |

### 4.3 Alignment with existing specs (Planned integration)

The **Studio Generation Manager™** orchestration spec ([`../engines/generation-manager/future-roadmap.md`](../engines/generation-manager/future-roadmap.md)) already defines queue, dependency, retry, and provider abstraction at the **department package** level. **Planned:** converge governed Experience Lab / Studio Builder paths with Generation Manager job semantics so Dispatch Office submits jobs instead of blocking serverless invocations.

**Documented Fact:** No queue is implemented today. Current synchronous HTTP behavior is unchanged by this roadmap.

---

## 5. Objective 4 — Creative Services District (Conceptual)

### 5.1 Studio World placement

**Creative Services Department™** is a future **district** in Studio World — the unified front door for all AI-assisted material production. Specialists (providers) work behind the district; founders and departments see one Creative Services experience.

**Physical metaphor (Conceptual):** Dispatch Office (reception) → specialty studios (Interior Design, Motion, Audio, …) → Quality Review → Asset Registry warehouse.

### 5.2 Specialty roster (Conceptual)

| Specialty | Example outputs | Hidden providers (Planned) |
|-----------|-----------------|------------------------------|
| Interior Design | Scene shells, environment layers, room decoration | FAL, OpenAI Images, Flux |
| Architecture | Spatial layouts, structural visuals | Luma, FAL, internal |
| Environment Design | Biomes, lighting moods, weather | FAL, BFL |
| Furniture Design | Props, set dressing | Luma, FAL |
| Lighting Design | Light rigs, HDR, exposure | Deterministic + AI assist |
| Typography | Logotype, type treatments | Ideogram, OpenAI |
| Branding | Campaign visuals, lockups | Ideogram, OpenAI, FAL |
| Product Visualization | PDP heroes, pack shots | OpenAI, FAL (Documented Fact: product photography path exists separately) |
| Animation | Loops, UI motion | Runway, FAL |
| Motion Graphics | Titles, lower thirds | Runway |
| Video | B-roll, tours | Runway, Luma |
| Audio | VO, ambience, SFX | FAL, ElevenLabs (Planned) |
| 3D | GLB/GLTF assets | Luma, FAL |
| Marketing Assets | Social, email heroes | Multi-provider via orchestrator |

### 5.3 Department schema (Planned)

See [`../../studio-world/003_DEPARTMENTS.md`](../../studio-world/003_DEPARTMENTS.md) — Creative Services Department™ entry added in this sprint.

---

## 6. Implementation phasing (Planned — not scheduled)

| Phase | Focus | Prerequisite |
|-------|-------|--------------|
| **P0** | Dispatch Office pre-handler repair | Forensic boundary in [`../forensics/DISPATCH_OFFICE_PREHANDLER_FORENSIC.md`](../forensics/DISPATCH_OFFICE_PREHANDLER_FORENSIC.md) |
| **P1** | Restore synchronous governed generation (FAL path) | P0 |
| **P2** | Provider adapter interface + FAL adapter refactor behind orchestrator | P1 |
| **P3** | Second provider (e.g. OpenAI Images) per specialty | P2 |
| **P4** | Async job queue for Experience Lab / Studio Builder | P2 |
| **P5** | Failover + cost routing | P3 + P4 |
| **P6** | Creative Services District in Studio World UI | P4 |

**Conceptual:** Phases are architecture sequencing — not calendar commitments.

---

## 7. Explicit non-goals (this roadmap)

| Non-goal | Reason |
|----------|--------|
| Replace FAL today | Current production adapter; migration is Planned |
| Implement provider switching | Roadmap only |
| Implement async queue | Roadmap only |
| Modify Dispatch Office runtime | Separate repair sprint |
| Add fallbacks / canvas masking | Forbidden by governance |

---

## 8. Related documents

| Document | Role |
|----------|------|
| [`../model-orchestrator.md`](../model-orchestrator.md) | Model Orchestrator canon — updated with Creative Services role |
| [`../engines/generation-manager/future-roadmap.md`](../engines/generation-manager/future-roadmap.md) | Queue + async evolution |
| [`../engine/asset-compiler/14_FUTURE_AI_PROVIDERS.md`](../engine/asset-compiler/14_FUTURE_AI_PROVIDERS.md) | Provider adapter spec |
| [`../../studio-world/003_DEPARTMENTS.md`](../../studio-world/003_DEPARTMENTS.md) | Studio World department entry |
| [`../forensics/DISPATCH_OFFICE_PREHANDLER_FORENSIC.md`](../forensics/DISPATCH_OFFICE_PREHANDLER_FORENSIC.md) | Current P0 blocker |

---

*Roadmap documentation only. No runtime changes.*
