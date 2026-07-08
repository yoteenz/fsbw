# Time Capsule™ — Forever Preserved

**Module:** `studio.living-company-genome.v1.time-capsule`  
**Status:** Immutable chapter snapshots

---

## Law

> Every Golden Build™ · approved scene™ · major version™ · headquarters redesign™ · brand identity™ is preserved forever.

The founder can revisit **any point** in company history.

---

## What Gets Capsuled

| Trigger | Capsule Contents |
|---------|------------------|
| **Golden Build™ certified** | Scene stacks · blueprint pin · asset manifest |
| **Approved scene™** | Full layer stack · hotspot map |
| **Major blueprint version** | Systems bundle · genome creative strand |
| **HQ redesign / evolution** | Wing state · material tier · skyline ref |
| **Brand identity chapter** | Logos · typography · voice snapshot |
| **Genome Event™ (significant)** | Full 8-strand genome · narrative |
| **Expedition complete** | Arc outcomes · HQ delta |
| **Founder-declared moment** | Custom · with evidence |

---

## Capsule Schema

```yaml
TimeCapsule:
  capsuleId: capsule:{org}:{slug}-{timestamp}
  orgId: string
  title: string
  chapterLabel: string                # "Company Year One™"
  sealedAt: datetime
  triggerEventId: string | null
  immutable: true
  contents:
    genomeSnapshot: GenomeSnapshot
    visualDnaId: string
    blueprintSnapshot: BlueprintSnapshot
    hqSnapshot: HQWorldSnapshot
    departmentSnapshots: DepartmentSnapshot[]
    sceneSnapshots: SceneStackSnapshot[]
    brandSnapshot: BrandSnapshot
    artifactRefs: string[]
  storage:
    primary: legacy-vault
    redundancy: org-export-eligible
  access:
    founder: full
    team: policy-gated
    marketplace: publish-optional
```

Stored in [Legacy Vault™](../legacy-vault.md) — never overwrite.

---

## Revisit Experience

```
Founder opens Time Capsule™
    ↓
Select: Company Year One™
    ↓
Multiple Timelines™ loads capsule world state
    ↓
Walk HQ · departments as they were
    ↓
Legacy Layer™ anchors narrate
    ↓
Return to Company Today™
```

Read-only by default — **branch from capsule** creates new timeline fork (Alternate Branch™).

---

## Sealing Rules

| Rule | Behavior |
|------|----------|
| Auto-seal on certification | Golden Build™ · Live™ |
| Auto-seal on evolution | Before material tier upgrade |
| Manual seal | Founder "Preserve this moment" |
| Duplicate seal | New capsule ID — never replace |

---

## Relationship to Production Lifecycle

| Lifecycle Stage | Capsule Event |
|-----------------|---------------|
| Golden Build™ achieved | Department scene capsule |
| Certified™ | Certification capsule |
| Evolution™ | Pre/post evolution pair |
| Legacy™ | Final era capsule → Archive™ |

---

## Storage Philosophy

> Studio OS becomes the memory of the business.

Capsules are **first-class** — not backup dumps. Indexed · searchable · timeline-linked.

---

_Time Capsule™ — every chapter sealed forever._
