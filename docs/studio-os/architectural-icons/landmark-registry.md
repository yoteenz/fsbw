# Landmark Registry™

**Canonical Registry of Signature Landmarks™**

---

## Purpose

Single source of truth for every **Signature Landmark™** in Studio World™.

Used by:

- Department Generator™ (Blueprint™ validation)
- Validation Loop™ (uniqueness check)
- Marketplace™ (framework invariant enforcement)
- Scene Architecture™ (scene catalog)
- Studio Preview™ (demo landmark selection)
- Founder Memory™ (landmark ID reference)

---

## Registry Rules

1. **One landmark per department** — no exceptions
2. **Archetype uniqueness** — no duplicate archetypes across departments
3. **Immutable ID** — `landmarkId` never changes once Certified™
4. **Expression mutable** — Living Set™ changes materials · not structure
5. **HQ landmark** — separate registry entry · one per Headquarters™

---

## Department Registry

| departmentId | Department™ | landmarkId | Signature Landmark™ | Archetype | Status |
|--------------|-------------|------------|---------------------|-----------|--------|
| `creative-direction` | Creative Direction Studio™ | `story-table` | **Story Table™** | Illuminated creative altar | **Pilot** · CDS Golden Build™ |
| `intelligence` | Intelligence™ | `living-company-genome` | **Living Company Genome™** | Suspended knowledge constellation | Canonical |
| `marketing` | Marketing™ | `launch-constellation` | **Launch Constellation™** | Suspended global map | Canonical |
| `finance` | Finance™ | `capital-vault` | **Capital Vault™** | Monumental financial chamber | Canonical |
| `hiring` | Hiring™ | `talent-observatory` | **Talent Observatory™** | Celestial talent dome | Canonical |
| `distribution` | Distribution™ | `fulfillment-nexus` | **Fulfillment Nexus™** | Living logistics network | Canonical |
| `legal` | Legal™ | `charter-hall` | **Charter Hall™** | Monumental legal archive hall | Canonical |
| `customer-experience` | Customer Experience™ | `relationship-gallery` | **Relationship Gallery™** | Evolving customer gallery | Canonical |
| `operations` | Operations™ | `operations-engine` | **Operations Engine™** | Massive kinetic machine | Canonical |

---

## Reserved · Future Departments

| departmentId | Department™ | landmarkId | Signature Landmark™ | Archetype | Status |
|--------------|-------------|------------|---------------------|-----------|--------|
| `research` | Research™ | `insight-observatory` | Insight Observatory™ | Signal lens array | Reserved |
| `brand` | Brand™ | `identity-monolith` | Identity Monolith™ | Carved brand pillar | Reserved |
| `automation` | Automation™ | `circuit-forge` | Circuit Forge™ | Living circuit foundry | Reserved |
| `analytics` | Analytics™ | `metrics-cathedral` | Metrics Cathedral™ | Data spire | Reserved |
| `marketplace` | Marketplace™ | `exchange-atrium` | Exchange Atrium™ | Trading floor gallery | Reserved |
| `publishing` | Publishing™ | `press-rotunda` | Press Rotunda™ | Publication drum | Reserved |

**Reserved** entries may be promoted to **Canonical** when department Blueprint™ is approved.

---

## Headquarters Registry

| entityId | landmarkId | Signature Landmark™ | Archetype | Status |
|----------|------------|---------------------|-----------|--------|
| `headquarters` | `grand-atrium` | **Grand Atrium™** (recommended default) | Central arrival hall | **Pending selection** |
| — | `founder-hall` | Founder Hall™ | Portrait journey gallery | Candidate |
| — | `central-orb` | Central Orb™ | Monumental Orb installation | Candidate |
| — | `living-tree` | Living Tree™ | Organic growth sculpture | Candidate |
| — | `infinite-stair` | Infinite Stair™ | Monumental staircase | Candidate |
| — | `hall-of-companies` | Hall of Companies™ | Multi-company gallery | Candidate |
| — | `heart-of-studio-world` | Heart of Studio World™ | Pulsing central core | Candidate |

**Selection:** One HQ landmark promoted to `status: Canonical` at Headquarters Golden Build™.

---

## Archetype Uniqueness Matrix

| Archetype category | Assigned to | Blocked for |
|--------------------|-------------|-------------|
| Horizontal altar / table | Story Table™ | All others |
| Suspended constellation (knowledge) | Living Company Genome™ | Analytics™ must differ |
| Suspended map (geographic) | Launch Constellation™ | Distribution™ (logistics network differs) |
| Vault / chamber | Capital Vault™ | Legal™ (Charter Hall differs) |
| Observatory dome (people) | Talent Observatory™ | Research™ (Insight Observatory differs) |
| Network / nexus | Fulfillment Nexus™ | Operations Engine™ (kinetic machine differs) |
| Gallery (customers) | Relationship Gallery™ | Founder Hall™ (founder-focused) |
| Kinetic machine | Operations Engine™ | Automation™ (Circuit Forge differs) |
| Legal hall | Charter Hall™ | — |

---

## Department Package Schema Extension

```json
{
  "departmentId": "creative-direction",
  "signatureLandmark": {
    "landmarkId": "story-table",
    "displayName": "Story Table™",
    "archetype": "illuminated-creative-altar",
    "frameworkInvariant": true,
    "orbInteraction": "projection",
    "scenesOrbit": [
      "mood-wall",
      "pipeline-board",
      "founder-notes",
      "reference-library"
    ]
  }
}
```

**Required** for all new `department.json` manifests.

---

## Validation Checklist

| Check | Gate |
|-------|------|
| `landmarkId` present | Blueprint™ |
| Unique in registry | Generator™ |
| Passes Design Law™ (5 rules) | Validation Loop™ |
| `frameworkInvariant: true` | Marketplace™ seal |
| Orb interaction declared | Runtime manifest |
| Founder Memory™ tag supported | Expedition Engine™ |

---

## CDS Pilot Entry

```json
{
  "departmentId": "creative-direction",
  "signatureLandmark": {
    "landmarkId": "story-table",
    "displayName": "Story Table™",
    "status": "pilot",
    "implementationNotes": "Environmental Pass V1 expresses atmosphere; landmark law codified Architectural Icons™ sprint"
  }
}
```

**No CDS redesign required** — registry documents existing identity.

---

## See Also

- [department-landmarks.md](./department-landmarks.md)
- [headquarters-landmarks.md](./headquarters-landmarks.md)
- [design-law.md](./design-law.md)
- [future-roadmap.md](./future-roadmap.md)
