# Department vs Set™ — Organization vs Environment

**Version:** 1.0.0  
**Status:** Canonical distinction

---

## The Core Distinction

| Concept | What it is | Analogy |
|---------|------------|---------|
| **Department** | Organization — function · staff · workflows · accountability | Studio **division** (Creative · Production · Legal) |
| **Set™** | Physical environment — architecture · objects · mood · where work happens | **Soundstage set** on the lot |

```
Founder walks headquarters
    ↓
Enters Department (organization boundary)
    ↓
Arrives in Set™ (physical environment)
    ↓
Interacts with objects · Orb · AI in Set™
```

---

## Department Responsibilities

A **Department** defines:

| Artifact | Purpose |
|----------|---------|
| `department.json` | Identity · purpose · staff · workflows |
| Department Definition | Organizational role in company |
| Production groups | What the department manufactures |
| AI employee roles | Concierges · specialists |
| Lifecycle stage | Blueprint → Golden Build → Live |

Department = **who does what** and **why the org unit exists**.

---

## Set™ Responsibilities

A **Set™** defines:

| Artifact | Purpose |
|----------|---------|
| Set DNA™ | Physical environment blueprint |
| Hero object | Primary interactive centerpiece |
| Arrival Sequence™ | How founder enters this place |
| Idle Life™ | How place behaves when founder is still |
| Interactive objects | Mood Wall · Notes · tables · walls |
| Lighting · materials · audio | Sensory identity |

Set™ = **where work feels like it happens**.

---

## One Department · One Primary Set™ (Alpha Model)

Alpha Studio OS uses **1:1 mapping** — each department has one primary Set™:

| Department | Set™ |
|------------|------|
| Creative Direction | Creative Atelier™ Set |
| Discovery | Discovery Lab™ Set |
| Production | Production Floor™ Set |
| Marketing | Marketing War Room™ Set |
| Packaging | Packaging Atelier™ Set |
| Finance | Finance Vault™ Set |
| Legal | Legal Chamber™ Set |
| Customer Experience | Guest Lounge™ Set |
| Founder | Founder Office™ Set |
| Archive | Hall of Legacy™ Set |

**Future:** One department may contain multiple Sets™ (e.g. Production Floor + Quality Review alcove).

---

## Creative Direction — Worked Example

| Layer | CDS instance |
|-------|--------------|
| **Department** | Creative Direction Department™ — sets visual direction for all projects |
| **Set™** | Creative Atelier™ Set — editorial stage · Mood Wall hero · marble threshold |
| **Golden Build** | First production-quality proof of Creative Atelier™ Set |
| **Route (implementation)** | `/admin/studio/department/creative-direction` — doorway, not the Set identity |

Founder says: *"I'm heading into the Creative Atelier."*  
Founder does **not** say: *"Open the creative-direction route."*

---

## What Is NOT a Set™

| Entity | Classification |
|--------|----------------|
| Admin dashboard | **Not a Set™** — doorway infrastructure |
| Mission Control overview | Headquarters circulation hub — not a department Set™ |
| Modal · panel · form | Object **within** a Set™ — not a Set™ |
| Marketplace listing page | Storefront — not a work Set™ |
| API route | Implementation detail — invisible to founder |

---

## What IS a Set™

| Entity | Classification |
|--------|----------------|
| Creative Atelier™ | Set™ |
| Hall of Legacy™ | Set™ |
| Luxury Packaging Atelier™ (Marketplace) | Publishable Set™ pack |
| Golden Build environment | Set™ at Golden Build™ lifecycle stage |

---

## Package Architecture (Conceptual)

```
Department Package
├── department.json          ← organization
├── set-dna.json             ← environment (successor to room-dna.json)
├── asset-manifest.json      ← objects in Set™
├── production-groups.json   ← what to generate for Set™
└── interaction-manifest.json ← verbs in Set™
```

Alpha implementation uses `room-dna.json` — semantically maps to Set DNA™. **No file rename this sprint.**

---

## Runtime Mapping

| Runtime concept | Department | Set™ |
|-----------------|------------|------|
| LOADING | Resolve department package | Load Set DNA™ |
| ASSEMBLING | Wire department services | Build Set geometry + objects |
| GENOME_INJECTING | Company + project context | Modulate Set materials · light |
| ACTIVE | Department operations live | Founder walks Set™ |

---

## Founder Navigation Language

| Old (forbidden) | New (Sets™) |
|-----------------|-------------|
| "Go to Creative Direction page" | "Walk to the Creative Atelier" |
| "Open Production tab" | "Step onto the Production Floor" |
| "Switch to Archive view" | "Enter the Hall of Legacy" |
| "Load department" | "Arrive at the Set™" |

---

## Cross-References

- [Sets philosophy](./sets-philosophy.md)
- [Headquarters layout](./headquarters-layout.md)
- [Set registry](./set-registry.md)
- [Department Package](../../src/studio-os-core/department-package/) (implementation)
