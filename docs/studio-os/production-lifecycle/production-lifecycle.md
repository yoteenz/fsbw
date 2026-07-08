# Studio OS Production Lifecycle™ — Master Specification

**Version:** 1.0.0  
**Status:** Canonical  
**Schema:** `studio.production-lifecycle.v1`

---

## Purpose

Every experience inside Studio OS follows **one unified production lifecycle** — replacing generic software language (Draft · Beta · Production) with founder-native production language.

This document is the **master reference** for stage definitions, transitions, applicability, and governance.

---

## Lifecycle Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    STUDIO OS PRODUCTION LIFECYCLE™                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. Blueprint™     Creative conception — intent only                        │
│         │                                                                   │
│         ▼                                                                   │
│  2. Golden Build™  First production-quality proof — engine validation       │
│         │                                                                   │
│         ▼                                                                   │
│  3. Certified™     Quality assurance — Walk · Validation · Founder Review   │
│         │                                                                   │
│         ▼                                                                   │
│  4. Live™          Joins Headquarters — real operations begin               │
│         │                                                                   │
│         ▼                                                                   │
│  5. Evolution™     Continuous improvement — never finished                  │
│         │                                                                   │
│         ▼ (when meaningful)                                                 │
│  6. Legacy™        Preservation — experienced through The Archive™          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Stage Definitions

### 1. Blueprint™

**Purpose:** Creative conception. Ideas become direction. Nothing has been built.

**Outputs:** Company Genome™ · Department Definitions · Room DNA™ · Mood Boards · Creative Briefs · Storyboards · Technical Planning · Founder Vision

**Detail:** [blueprint.md](./blueprint.md)

---

### 2. Golden Build™

**Purpose:** First production-quality implementation. Proves engine · pipeline · founder experience · runtime · immersive vision.

**Nature:** Experience complete — not feature complete. Founder immediately understands the vision.

**Outputs:** Interactive experience · Walk the Room™ · Initial runtime · Core interactions · First asset generation · Production validation

**Detail:** [golden-build.md](./golden-build.md)

**Pilot:** Creative Direction Studio™ — first Golden Build in Studio OS history (Sprint 001).

---

### 3. Certified™

**Purpose:** Studio OS quality assurance. Nothing becomes Live™ without certification.

**Validation stack:** Walk the Room™ · Studio Validation Loop™ · AI Braintrust™ · Founder Review™ · Accessibility · Performance · Company Genome™ validation · Runtime validation

**Certification types:** Studio Certified™ · Luxury Certified™ · Genome Certified™ · Marketplace Certified™ · Performance Certified™ · Experience Certified™

**Detail:** [certification-system.md](./certification-system.md)

---

### 4. Live™

**Purpose:** Experience officially joins Headquarters. Real founders · real analytics · real learning.

**Participates in:** Walk the Business™ · Adaptive Walk™ · Studio Intelligence™ · Daily Operations™

**Detail:** [live-system.md](./live-system.md)

---

### 5. Evolution™

**Purpose:** Studio OS is never finished. Continuous improvement through feedback · analytics · AI · Genome evolution · Marketplace Packs™ · new technology.

**Detail:** [evolution-system.md](./evolution-system.md)

---

### 6. Legacy™

**Purpose:** Final lifecycle stage. Nothing meaningful disappears. Preservation — not abandonment.

**Examples:** Previous Golden Builds™ · Historic Headquarters · Original Creative Direction Studio™ · Landmark launches · Major redesigns · Historic AI employees · Acquired companies · Milestone campaigns · Original Company Genome™ · Historic Founder Journeys™

**Physical destination:** [The Archive™](./archive-system.md)

**Detail:** [legacy-system.md](./legacy-system.md)

---

## Lifecycle Rules

| Rule | Enforcement |
|------|-------------|
| Nothing skips Blueprint™ | No Golden Build without Blueprint artifacts |
| Nothing skips Golden Build™ | No Certification without Golden Build proof |
| Nothing becomes Live™ without Certification | `certificationToken` required |
| Everything continues through Evolution™ | Live experiences never frozen |
| Meaningful milestones enter Legacy™ | Founder or system ceremony |
| Legacy™ experienced through Archive™ | No file-folder abandonment |

---

## Applicability Matrix

| Entity | Blueprint™ | Golden Build™ | Certified™ | Live™ | Evolution™ | Legacy™ |
|--------|:----------:|:-------------:|:----------:|:-----:|:----------:|:-------:|
| Departments | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Marketplace Packs™ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Assets | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| AI Employees | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Workflows | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Experiences | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Headquarters | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Interactions | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Templates | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Projects | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Runtime Features | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Studio Builder™ | — | ✓ | ✓ | ✓ | ✓ | — |
| Generation Pipelines | — | ✓ | ✓ | ✓ | ✓ | — |
| Automations | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Founder Experiences | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

---

## Stage Transitions

```
Blueprint™ ──[Blueprint Complete Gate]──► Golden Build™
Golden Build™ ──[Golden Build Gate]──► Certified™ (in review)
Certified™ ──[Certification Gate]──► Live™
Live™ ──[continuous]──► Evolution™
Evolution™ ──[Legacy Ceremony Gate]──► Legacy™
Legacy™ ──[permanent]──► Archive™ exhibit
```

**Gate definitions:** [quality-gates.md](./quality-gates.md)

---

## Lifecycle Metadata Schema

Every lifecycle-bearing entity carries:

```json
{
  "lifecycle": {
    "stage": "blueprint | golden-build | certified | live | evolution | legacy",
    "stageEnteredAt": "ISO8601",
    "certifications": ["studio-certified", "luxury-certified"],
    "certificationToken": "optional — required for live",
    "goldenBuildId": "optional — links to first proof",
    "legacyArchiveId": "optional — Archive™ exhibit reference",
    "chronicleEntries": ["chronicle-entry-ids"],
    "history": [
      { "stage": "blueprint", "enteredAt": "ISO8601", "exitedAt": "ISO8601" }
    ]
  }
}
```

---

## Founder Dual Awareness

Every experience communicates:

1. **Where something is today** — current lifecycle stage badge
2. **Where it lives historically** — Archive™ link when applicable

**Detail:** [founder-experience.md](./founder-experience.md)

---

## Archive™ and Founder Chronicle™

| System | Role |
|--------|------|
| [The Archive™](./archive-system.md) | Physical wing of Headquarters — immersive company history |
| [Founder Chronicle™](./founder-chronicle.md) | Autobiography of the company — automatic preservation |

Legacy™ without Archive™ is incomplete. Chronicle without Archive™ is orphaned narrative.

---

## Marketplace Lifecycle

Third-party and first-party packs follow the same six stages with additional Marketplace Certified™ gate.

**Detail:** [marketplace-lifecycle.md](./marketplace-lifecycle.md)

---

## Relationship to Production Pipeline

The [nine-stage Production Pipeline](../production/README.md) maps to lifecycle stages:

| Production Stage | Lifecycle Stage |
|------------------|-----------------|
| 01 Creative Direction™ | Blueprint™ |
| 02–07 Asset Planning → Runtime | Golden Build™ |
| 08 Validation™ | Certified™ (in progress) |
| 09 Golden Department™ | Certified™ (complete) |
| Headquarters deployment | Live™ |
| Post-launch iteration | Evolution™ |
| Historic preservation | Legacy™ → Archive™ |

Production Pipeline describes **how to build**. Production Lifecycle describes **where things are**.

---

## Cross-References

| Document | Path |
|----------|------|
| Alpha Golden Build implementation | [`../alpha/README.md`](../alpha/README.md) |
| Production methodology | [`../production/README.md`](../production/README.md) |
| Validation Loop | [`../engine/validation-loop/README.md`](../engine/validation-loop/README.md) |
| Walk the Room | [`../engine/walk-the-room/README.md`](../engine/walk-the-room/README.md) |
| Founder Journey Legacy stage | [`../alpha/founder-journey.md`](../alpha/founder-journey.md) |

---

## Future

[v2+ lifecycle automation](./future-roadmap.md) — Studio Intelligence™ stage recommendations · automatic Chronicle capture · Archive™ exhibit generation.
