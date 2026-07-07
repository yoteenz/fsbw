# 12 — Marketplace & Inheritance

**Golden Department:** Creative Direction Studio™  
**Section:** Packaging for Marketplace · Template for All Future Departments

---

## Dual Purpose

This document serves two mandates:

1. **Marketplace compatibility** — Creative Direction Studio™ packages are installable, swappable, and versioned
2. **Department inheritance** — Every future Studio OS department inherits Golden Department principles

---

## Marketplace Packaging

### Package Manifest

```yaml
marketplace:
  listingId: golden-creative-direction-v1
  departmentId: creative-direction
  goldenDepartment: true
  displayName: Creative Direction Studio™
  tagline: The creative brain of your company
  category: flagship
  version: 1.0.0
  compatibility:
    sdk: ">=1.0.0"
    runtime: ">=1.0.0"
    compiler: ">=1.0.0"
  assets: 45
  sizeMB: 120
  genomeRequired: true
```

### Install Modes

| Mode | Description |
|------|-------------|
| **Full install** | Complete golden package — default |
| **Zone pack** | Single zone assets (e.g., Mood Wall variant) |
| **Atmosphere pack** | Lighting + particles + audio only |
| **Object swap** | Replace single asset by ID |

### Overlay Rules

| Rule | Specification |
|------|---------------|
| Asset override | Same asset ID replaces — merge manifest |
| Genome recompile | Required on full install · optional on object swap |
| Version pin | Runtime rejects incompatible semver |
| Rollback | Previous package version retained 1 generation |

### Marketplace Variants (Future)

| Variant | Description |
|---------|-------------|
| `mood-wall-editorial` | Alternate hero wall treatment |
| `timeline-ceremony-luxury` | Enhanced approval assets |
| `observatory-minimal` | Reduced visualization for performance |
| `orb-voice-alternate` | Voice stem pack per industry |

Variants **never** break zone topology or interaction contracts.

---

## Licensing & Permissions

| Permission | Gate |
|------------|------|
| `creative-direction.approve` | Founder / authorized admin |
| `creative-direction.branch` | Founder + collaborators |
| `creative-direction.install` | Headquarters admin |
| `creative-direction.marketplace` | Marketplace entitlement |

---

## Inheritance Framework

### What Every Future Department MUST Inherit

| Principle | Source | Invariant |
|-----------|--------|-----------|
| Room as place | `01_THE_ROOM.md` | Full spatial envelope — no void |
| Arrival sequence | `02_THE_EXPERIENCE.md` | 5-phase materialize → settle |
| Physical verbs | `08_INTERACTION_MAP.md` | No form-based primary interactions |
| Orb physical presence | `09_ORB_AND_CONCIERGE.md` | Pedestal — never chat bubble |
| Genome adaptation | `06_GENOME_ADAPTATION.md` | Fixed topology · variable soul |
| Modular assets | `07_ASSET_STRATEGY.md` | Compiler-regeneratable packages |
| Ceremony structure | `11_COMPILER_AND_RUNTIME.md` | Approval as spatial event |
| Motion philosophy | `10_MOTION_AND_AUDIO.md` | Continuous ambient life |
| Anti-SaaS law | `05_ART_DIRECTION.md` | SaaS test rejection |
| Sandbox isolation | `03_INTERACTIVE_ZONES.md` | Experiment without main-path breach |

### Inheritance Checklist (Per New Department)

Before engineering any department:

- [ ] Read full Creative Direction Studio™ Golden Department spec (01–13)
- [ ] Map department zones to CDS zone archetypes
- [ ] Define department-specific hero focal point
- [ ] Inherit arrival sequence structure (timing may adjust ±20%)
- [ ] Inherit Orb + Concierge interaction patterns
- [ ] Define department ceremonies (may differ from creative-approval)
- [ ] Create Compiler profile extending CDS asset graph
- [ ] Pass SDK QA Checklist (17)
- [ ] Pass Runtime QA (20)
- [ ] Answer: *"Does it feel as alive as Creative Direction Studio™?"*

---

## Department Archetype Mapping

| Future Department | CDS Zone Archetype | Hero Focal Point |
|-------------------|-------------------|------------------|
| **Discovery** | Reference Library + Mood Wall | Trend signal wall |
| **Storyboarding** | Timeline Table + Sandbox | Storyboard strip table |
| **Production** | Timeline Table + Brief Wall | Production command table |
| **Review** | Sandbox compare + Mood Wall | Quality comparison screens |
| **Marketing** | Mood Wall + Brief Wall | Campaign mood surface |
| **Publishing** | Timeline Table | Launch timeline |
| **Marketplace** | Reference Library | Asset gallery wall |
| **Executive** | Observatory + Brief Wall | Strategy observatory |

**Topology adapts.** Principles do not.

---

## Spatial Philosophy Inheritance

```
CDS Golden Pattern:
  Entry → Reveal hero → Primary work surface → Secondary zones → Orb anchor → Exit

Future departments:
  Entry → Reveal [department hero] → Primary [department work] → Secondary → Orb → Exit
```

Camera presets inherit naming: `arrival` · `hero` · `primary` · `orb` · `ceremony` · `departure`

---

## Object System Inheritance

| CDS Object Class | Future Departments Reuse |
|------------------|--------------------------|
| `interactive-wall` | Any pinned content wall |
| `glass-table` | Any command/review surface |
| `timeline-table` | Any temporal department |
| `asset-shelf` | Any archive/library zone |
| `orb-pedestal` | Universal — identical placement rules |
| `mood-wall` | Any inspiration-heavy department |
| `preview-screen` | Any comparison/preview zone |
| `portal` | Entry/exit — universal |

New departments **extend** object inventory — never omit SDK required classes.

---

## Experience Principles Inheritance

| Emotional Goal (CDS) | Future Department Translation |
|----------------------|------------------------------|
| Inspired | Discovery: curious · Production: capable |
| Curious | Discovery: exploratory |
| Creative | Story: imaginative |
| Powerful | Executive: commanding |
| Focused | Review: discerning |
| Supported | All: Orb + Concierge presence |

---

## Anti-Inheritance (Forbidden Shortcuts)

| Shortcut | Why Rejected |
|----------|--------------|
| "We'll add spatial later" | Spatial is day one — not phase 2 |
| "Dashboard is faster" | Speed ≠ Golden Department standard |
| "Orb as chat widget" | Breaks physical presence principle |
| "One screen for all departments" | Each department is a place |
| "Skip ceremony" | Approval is spatial event — not API call |
| "CSS theme = Genome" | Genome is material/light/voice — not color swap |

---

## Golden Department Registry

| Department | Golden Status | Spec Version |
|------------|---------------|--------------|
| Creative Direction Studio™ | **Canonical** | 1.0.0 |
| All others | Pending | Must cite CDS v1.0.0 |

When a second department achieves Golden status, it joins the registry — but CDS remains the **first** and **reference** implementation.

---

## Cross-References

| Engine | Path |
|--------|------|
| SDK Marketplace | `sdk/13_MARKETPLACE_PACKAGING.md` |
| Compiler packaging | `engine/asset-compiler/05_ASSET_PACKAGE_SPEC.md` |
| Runtime marketplace | `engine/department-runtime/16_MARKETPLACE_RUNTIME.md` |
| Department creation | `sdk/16_DEPARTMENT_CREATION_GUIDE.md` |

---

_Next: [13 — Experience Narrative](./13_EXPERIENCE_NARRATIVE.md)_
