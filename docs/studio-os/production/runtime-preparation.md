# Runtime Preparation — Studio OS v1

**Stage:** 07 — Runtime™  
**Engine:** [Studio Department Runtime™](../engine/department-runtime/README.md)  
**Pilot:** Creative Direction Studio™

---

## Purpose

Prepare and boot the assembled department into **active operation** — Orb, concierges, interactions, animation, lighting, particles, audio, camera, and state management.

---

## Runtime Lifecycle

```
LOADING
    ↓ Load DepartmentPackage.zip + assembly handoff
ASSEMBLING
    ↓ Verify mounts · resolve registry refs
GENOME_INJECTING
    ↓ Apply Company Genome™ + Room DNA™ live
ACTIVE
    ↓ Full interactive operation
```

Runtime blocks at any phase failure — returns diagnostic to assembly (Stage 06).

---

## Boot Checklist

| Step | System | Verification |
|------|--------|--------------|
| 1 | Package loader | `pkg-creative-direction-golden-v1` integrity |
| 2 | Registry resolver | Pinned versions match assembly manifest |
| 3 | World assembler | 10 zones · 35 assets · spatial envelope |
| 4 | Genome injector | All `genomeSlots[]` resolve from org snapshot |
| 5 | Object manager | Hero · orb · interactives registered |
| 6 | Interaction engine | 42 verb bindings active |
| 7 | Orb runtime | Greeting · command routing · ceremony states |
| 8 | Concierge runtime | 3 AI staff routable |
| 9 | Navigation | Camera paths · portals · walk collision |
| 10 | Animation | Arrival · panel reveal · orb idle |
| 11 | Lighting | Rig active · zone coverage |
| 12 | Particles | Ambient dust within budget |
| 13 | Audio | Ambient loop · orb SFX · ceremony stinger |
| 14 | State manager | Session · branch · approval state |
| 15 | Project runtime | Project Genome overlay if scoped |

---

## Orb Runtime

| Behavior | Contract |
|----------|----------|
| Arrival greeting | Founder Journey phase-aware register |
| Creative commands | Route to Creative Director concierge |
| Genome inspect | Trigger observatory highlight |
| Approval ceremony | Orchestrate pedestal + mood wall + audio |
| Walk the Room | Enter presentation mode · mute interruptions |
| Exit discover | Portal to Discover Department™ |

Orb uses `registry:orb-universal-v2` behavior profile — department-specific ceremony weights from Room DNA.

---

## AI Concierges

| Concierge | ID | Routes | Never |
|-----------|-----|--------|-------|
| Creative Director | `ai-creative-director-cds` | Brief · mood · branch · approve guidance | Auto-approve creative |
| Research | `ai-research-concierge-cds` | Reference analysis · inspiration | Invent references |
| Brand | `ai-brand-concierge-cds` | Genome compliance · tone guard | Override founder |

Concierges consult Organization Genome™ before every response. Profession Brain™ policies apply where relevant.

---

## Interactive Objects

| Object | Runtime States | Key Transitions |
|--------|----------------|-----------------|
| Mood wall | empty → pinned → clustered → comparing → approved | pin · cluster · compare · approve |
| Timeline table | single → branched → merged | branch · scrub · spawn |
| Sandbox | isolated → active | isolate from timeline |
| Inspiration drop | idle → receiving → processed | drop · paste · upload |
| Approval pedestal | idle → ceremony → complete | approve · reject |
| Founder notes | editing → saved → chronicle | voice · append |
| Compare screen | split → focused | compare branches |
| Glass panels | hidden → inspect → dismiss | context overlay |

State persisted per session · branch isolation enforced.

---

## Walk the Room™ Integration

| Component | Runtime Binding |
|-----------|-----------------|
| `markers-walk-room-cds` | Critique anchor positions |
| Camera path | Presentation mode orbit |
| Presentation mode | Suppress non-essential UI |
| Critique session | Bind to Walk the Room engine |
| Zone highlights | Sequential zone activation on path |

Walk the Room requires Runtime `ACTIVE` — used heavily in Stage 08 Validation.

---

## Animation & Motion

| Animation | Trigger | Source |
|-----------|---------|--------|
| Arrival | Portal entry | `camera-paths-cds` + arrival metadata |
| Panel reveal | Zone approach | `10_animation/` per panel |
| Orb idle | Always | `orb-cds` behavior profile |
| Ceremony | Approval verb | `ceremony-approval-cds` choreography |
| Branch spawn | Timeline action | Sandbox isolation animation |

Motion respects Interaction Engine™ timing standards and reduced-motion accessibility.

---

## Lighting & Particles

| System | Runtime Behavior |
|--------|------------------|
| Lighting rig | Three-point editorial · zone accent overrides |
| Genome lighting slot | `lightingStyle` modulates key-fill ratio |
| Particles | Ambient dust · celebration burst on approval |
| Performance | LOD within 120 MB budget |

---

## Audio Runtime

| Layer | Asset | Behavior |
|-------|-------|----------|
| Ambient | `audio-ambient-cds` | Loop · crossfade on zone |
| Orb | `audio-orb-cds` | Greeting · acknowledge |
| Ceremony | `audio-ceremony-cds` | One-shot on approval |
| Founder voice | Optional | Chronicle capture |

---

## Camera System

| Mode | Use |
|------|-----|
| Walk | Default founder navigation |
| Inspect | Object focus · genome overlay |
| Presentation | Walk the Room · critique |
| Product | Marketing still capture (optional) |
| Arrival | Entry ceremony path |

`camera-paths-cds` defines spline anchors per zone.

---

## State Management

```yaml
DepartmentState:
  sessionId: string
  projectId: string | null
  activeBranch: string | null
  moodWallState: enum
  approvalStatus: enum
  chronicleEntries: ChronicleEntry[]
  walkTheRoomActive: boolean
  conciergeContext: object
  genomeSnapshotRef: string
  roomDnaSnapshot: object
```

State manager syncs with Memory Engine™ for session chronicle append.

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Boot to ACTIVE | < 8s (mobile target) |
| Frame budget | 60fps proxy · 30fps floor on mobile |
| Memory | ≤ 120 MB department budget |
| Interaction latency | < 100ms verb response |
| Orb greeting | < 2s after arrival |

---

## Runtime Handoff Package

Prepared at end of Stage 06 for Stage 07 boot:

```
runtime-handoff/
├── assembly-report.md
├── 15_runtime/assembly-manifest.json
├── interaction-bindings.json
├── genome-bindings.json
├── boot-checklist.json
└── diagnostic-endpoints.json
```

---

## Stage 07 Gate

**Runtime Active** when:

- [ ] Lifecycle state = `ACTIVE`
- [ ] All 15 boot checklist steps pass
- [ ] Orb greeting executes
- [ ] 3 concierges routable
- [ ] Hero mood wall interactive (pin test)
- [ ] Approval ceremony executable
- [ ] Walk the Room path navigable
- [ ] No genome slot resolution failures
- [ ] Performance within budget

---

_Runtime Preparation — the place becomes alive._
