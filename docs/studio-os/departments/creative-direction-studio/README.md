# Creative Direction Studio™ v1 — Golden Department Definition

**Version:** 1.0.0  
**Status:** First official Department Definition generated through Studio Department Generator™  
**Department ID:** `creative-direction`  
**Package ID:** `pkg-creative-direction-golden-v1`  
**Type:** Generated department blueprint — not implementation

**Generator:** [Studio Department Generator™](../../department-generator/README.md)  
**Experience intent:** [Golden Department Experience Spec](../../golden-department/creative-direction-studio/README.md)  
**Engine:** [`docs/studio-os/engine/department-generator/`](../../engine/department-generator/README.md)

---

> **"I've entered the creative brain of my company."**

Creative Direction Studio™ is the **living creative brain of every Project™** — where creative intent is formed, challenged, evolved, and approved **before** work enters production. It exists above production. It is the Golden Department every future Studio OS department learns from.

This folder is the **complete Department Definition package** — the generated output that will later pass into:

- **Studio Asset Compiler™** → FAL generation
- **Department Runtime™** → living interactive room
- **Cursor** → handler wiring and project state

**No React · No CSS · No Three.js · No static webpage.**

---

## Department Purpose

| Attribute | Value |
|-----------|-------|
| **Purpose** | Living creative brain — strategic direction before production |
| **Metaphor** | Luxury editorial atelier × Hollywood writers' room × Apple Industrial Design Lab |
| **Emotional goals** | Inspired · Curious · Creative · Powerful · Focused · Supported |
| **Layout** | Stage (double-height hero) |
| **Hero object** | Living Mood Wall™ |
| **Ceremony** | Creative Direction Approval |
| **Position** | Above Production Engine — continuous, not locked at project creation |

---

## Package Contents

| File | Schema | Purpose |
|------|--------|---------|
| [department.json](./department.json) | Department Manifest | Identity · profiles · concierges · unlocks |
| [room-dna.json](./room-dna.json) | Room DNA™ | Aesthetic slider snapshot |
| [environment-blueprint.md](./environment-blueprint.md) | Environment Blueprint | Architecture · lighting · zones · navigation |
| [asset-blueprint.md](./asset-blueprint.md) | Asset Blueprint | Per-object specs · dependencies |
| [asset-manifest.json](./asset-manifest.json) | Asset Manifest | Full inventory for Asset Compiler |
| [interaction-manifest.json](./interaction-manifest.json) | Interaction Manifest | Verb bindings per zone |
| [scene-assembly-blueprint.md](./scene-assembly-blueprint.md) | Scene Assembly | Runtime + Cursor assembly rules |
| [fal-prompt-package/](./fal-prompt-package/) | Environment Prompt Package | FAL-ready generation prompts |

---

## Seven Interactive Zones

| Zone | Asset ID | Purpose |
|------|----------|---------|
| Creative Brief Wall™ | `wall-brief-cds` | Mission · objective · audience · founder truth |
| Living Mood Wall™ | `wall-mood-cds` | Infinite inspiration — hero surface |
| Company Genome Observatory™ | `observatory-cds` | Living Genome visualization |
| Project Timeline Table™ | `table-timeline-cds` | Temporal command — branches · approvals |
| Creative Sandbox™ | `table-sandbox-cds` | Isolated experimentation |
| Reference Library™ | `shelf-library-cds` | Permanent visual memory |
| Orb Command Center™ | `orb-cds` · `pedestal-orb-cds` | Intelligence anchor |

---

## Handoff Pipeline

```
Creative Direction Studio™ Definition (this folder)
         ↓
Studio Asset Compiler™
  ← asset-manifest.json + fal-prompt-package/
         ↓
DepartmentPackage.zip (cooked assets)
         ↓
Studio Validation Loop™
         ↓
Department Runtime™
  ← scene-assembly-blueprint.md + interaction-manifest.json
         ↓
Cursor (project state · production signals)
```

---

## Design Laws (Golden)

1. **No flattened backgrounds** — 45 modular assets, max 120 MB
2. **Every object is its own asset** — independent FAL prompt + behavior
3. **Genome-native** — materials · lighting · voice via injection slots, never baked
4. **Physical verbs** — pin · branch · approve — not tabs or forms
5. **Sandbox isolation** — experiments do not touch main Project until approved
6. **Orb is furniture** — pedestal anchor, not chat bubble

---

## Inheritance

Every future department must answer: **Does it feel as alive as Creative Direction Studio™?**

| Inherit | From CDS |
|---------|----------|
| Modular asset pipeline | ✓ |
| Room DNA™ slider machinery | ✓ |
| Zone-based interaction model | ✓ |
| Genome injection pattern | ✓ |
| Arrival ceremony + approval ceremony | ✓ |
| Orb + Concierge stack | ✓ |

See [Golden Department Marketplace & Inheritance](../../golden-department/creative-direction-studio/12_MARKETPLACE_AND_INHERITANCE.md).

---

_Creative Direction Studio™ — Golden Department Definition v1.0.0_
