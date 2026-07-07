# 11 — Compiler & Runtime

**Golden Department:** Creative Direction Studio™  
**Section:** FAL Generation Strategy & Runtime Execution

---

## Pipeline Position

```
Company Genome™
       ↓
Studio Asset Compiler™  →  pkg-creative-direction-golden-v1
       ↓
Studio Department Runtime™  →  Living Creative Direction Studio
       ↓
Cursor handlers  →  Founder tools · Project state · Production signals
```

Golden Department spec defines **what** to generate and **how** it behaves. Engines define **how** to generate and **how** to execute.

---

## Compiler Profile

| Field | Value |
|-------|-------|
| Profile ID | `creative-direction` |
| Golden Department | `true` |
| Layout | Stage |
| Atmosphere | Editorial creative studio — inspiration-rich, reference-heavy |
| Asset Budget | 45 |
| Size Budget | 120 MB |

Full profile: `engine/asset-compiler/07_DEPARTMENT_COMPILER.md`

---

## FAL Generation Strategy

### Stage Order (Ordered — Never Parallelize Dependencies)

| Stage | Assets Generated | Prompt Count |
|-------|------------------|--------------|
| 1. Environment shell | env-shell, env-floor, env-ceiling, env-window, env-alcove | 5–8 |
| 2. Zone furniture | wall-mood, wall-brief, table-timeline, table-sandbox, shelf-library | 8–12 |
| 3. Intelligence objects | pedestal-orb, orb, observatory, screen-compare | 4–6 |
| 4. Lighting | lighting-rig | 2–3 |
| 5. Materials | glass-panels, floor shader variants | 3–5 |
| 6. Particles | particles-ambient | 1–2 |
| 7. Portals | portal-entry, portal-exit | 2 |
| 8. Interactions | interactions manifest | 0 (data) |
| 9. Ceremonies | ceremony-approval | 1 (data + audio) |
| 10. Audio | ambient, ceremony, orb stems | 3–5 |
| 11. Camera | camera-paths | 0 (data) |
| 12. AI triggers | creative-director, research, brand | 0 (data) |
| 13. Content seeds | mood, brief, library seeds | 3–6 |
| 14. Assembly | world manifest | 0 |
| 15. Validation | QA pass | 0 |

**Total prompts:** 35–50 (Compiler standard range).

### Prompt Modifier Strategy

Each prompt receives Genome injection:

```yaml
promptStack:
  base: "Double-height editorial creative studio, luxury architecture..."
  genomeModifiers:
    materialLanguage: "{{genome.materialLanguage}}"
    lightingStyle: "{{genome.lightingStyle}}"
    photographyDirection: "{{genome.photographyDirection}}"
    editorialDirection: "{{genome.editorialDirection}}"
  negativePrompt: "dashboard, UI, cards, sidebar, chat bubble, stock photo banner"
```

### Provider Strategy

| Asset Type | Preferred Provider | Fallback |
|------------|-------------------|----------|
| Environment GLB | FAL 3D / image-to-mesh pipeline | Prebuilt Stage shell |
| Textures | FAL image generation | Genome shader procedural |
| Audio stems | Audio generation API | Licensed stem library |
| Orb mesh | Prebuilt universal orb + Genome glow shader | — |

Provider-agnostic per Compiler spec — FAL is primary, not exclusive.

### Regeneration Granularity

| Change Scope | Regenerate |
|--------------|------------|
| Single material family | env-floor, affected furniture |
| Lighting only | lighting-rig, particles, window |
| Mood wall variant | wall-mood only |
| Full Genome industry switch | Stages 1–7 + seeds |
| Marketplace asset swap | Single asset ID override |

---

## Runtime Behavior

### Boot Sequence

| Phase | Subsystem | Duration |
|-------|-----------|----------|
| 1. Load package | Asset Loader | < 2s target |
| 2. Genome inject | Genome Injection | < 500ms |
| 3. Assemble world | World Assembler | < 1s |
| 4. Hydrate project | Project Runtime | Variable |
| 5. Arrival sequence | Camera + Animation + Audio | 5–7s |
| 6. State ACTIVE | State Manager | — |

### Active State Behaviors

| Subsystem | CDS Behavior |
|-----------|--------------|
| Object Manager | 7 zones · 45 objects · z-order depth planes |
| Interaction Engine | 16 verbs · zone routing per `08_INTERACTION_MAP.md` |
| Orb Runtime | State machine · voice route · zone camera shift |
| Animation | Continuous ambient + event catalog |
| Particle | Hero dust · Genome character |
| Audio | Layered stems · spatial · duck on speak |
| State Manager | Branch-aware Project state · sandbox isolation |
| Project Runtime | Creative Direction summary · reference graph |
| Navigation | Entry/exit portals · inter-department routing |

### Sandbox Isolation Contract

```yaml
sandboxRule:
  isolated: true
  promoteVerb: approve
  promoteTarget: timeline-main-path
  breachAction: hard-block
  message: "Approve required before main project changes."
```

**Runtime enforces** — not UI honor system.

### Ceremony Runtime

```yaml
ceremony:
  id: creative-approval
  trigger: approve on timeline direction node
  camera: ceremony preset
  audio: audio-ceremony-cds
  duration: 3500ms
  sideEffects:
    - lockDirectionNode
    - signalProductionEngine
    - updateBriefWallSummary
```

### Project Hydration

On project load, Runtime places:

| Data | Surface |
|------|---------|
| Brief sections | Brief Wall pins |
| References | Mood Wall + Library spines |
| Branches | Timeline ribbons |
| Genome snapshot | Observatory rings |
| Founder notes | Brief + Timeline cards |
| Sandbox experiments | Sandbox surface (frosted if inactive) |

Hydration animation: sequential illuminate — not spinner.

### Performance Budget

| Metric | Target |
|--------|--------|
| Frame rate | 60fps desktop · 30fps mobile minimum |
| Draw calls | < 200 assembled |
| Texture memory | < 80 MB |
| Audio channels | < 8 simultaneous |
| Interaction latency | < 100ms verb response |

### Error Recovery

| Failure | Recovery |
|---------|----------|
| Asset load fail | Fallback shell · retry single asset |
| Reference ingest fail | Orb message · manual drop retry |
| Genome slot empty | Observatory gap visualization |
| State conflict | Branch merge prompt via Orb |

---

## Cursor Integration Points

Runtime exposes handlers for Cursor wiring (`sdk/15_CURSOR_RUNTIME_REQUIREMENTS.md`):

| Handler | Purpose |
|---------|---------|
| `onReferenceDrop` | Ingest pipeline |
| `onApprove` | Ceremony + Production signal |
| `onBranch` | Sandbox / Timeline fork |
| `onGenomeUpdate` | Shader + audio crossfade |
| `onDepart` | Navigation to next department |

**No React in this spec** — handlers are contracts only.

---

## Validation Gates

| Gate | Document |
|------|----------|
| Package validates | `engine/asset-compiler/05_ASSET_PACKAGE_SPEC.md` |
| World assembles | `engine/asset-compiler/09_WORLD_ASSEMBLY.md` |
| Runtime QA | `engine/department-runtime/20_RUNTIME_QA.md` |
| SDK QA | `sdk/17_QA_CHECKLIST.md` |
| Golden inheritance | `12_MARKETPLACE_AND_INHERITANCE.md` |

---

## Storage Contract (Pilot)

| Key | Content |
|-----|---------|
| `studioOsCreativeDirection_v1` | Project branches, references, direction state |
| Package ref | `pkg-creative-direction-golden-v1` version pin |

Pilot route: `/admin/studio/ndxbook/creative-direction` — implementation follows this spec.

---

_Next: [12 — Marketplace & Inheritance](./12_MARKETPLACE_AND_INHERITANCE.md)_
