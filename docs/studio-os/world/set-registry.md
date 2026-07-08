# Set Registry™ — Canonical Set Catalog

**Version:** 1.0.0  
**Status:** Canonical registry (docs only)  
**Registry ID:** `studio.set-registry.v1`

---

## Purpose

The **Set Registry™** is the canonical catalog of all Sets™ — first-party headquarters Sets™ and Marketplace publishable Sets™.

Every Set™ has a stable identity · Set DNA™ reference · department mapping · lifecycle stage.

---

## First-Party Headquarters Sets™

| Set ID | Display Name | Department | Primary Emotion | Hero Object | Lifecycle (pilot) |
|--------|--------------|------------|-----------------|-------------|-------------------|
| `creative-atelier-v1` | Creative Atelier™ Set | creative-direction | Inspired | Living Mood Wall™ | Golden Build™ |
| `discovery-lab-v1` | Discovery Lab™ Set | discovery | Curious | Research Map™ | Blueprint™ |
| `production-floor-v1` | Production Floor™ Set | production | Focused | Status Board™ | Blueprint™ |
| `marketing-war-room-v1` | Marketing War Room™ Set | marketing | Energized | Campaign Wall™ | Blueprint™ |
| `packaging-atelier-v1` | Packaging Atelier™ Set | packaging | Crafted | Prototype Table™ | Blueprint™ |
| `finance-vault-v1` | Finance Vault™ Set | finance | Confident | Ledger Sanctum™ | Blueprint™ |
| `legal-chamber-v1` | Legal Chamber™ Set | legal | Protected | Counsel Table™ | Blueprint™ |
| `guest-lounge-v1` | Guest Lounge™ Set | customer-experience | Empathetic | Welcome Hearth™ | Blueprint™ |
| `founder-office-v1` | Founder Office™ Set | founder | Leading | Decision Desk™ | Blueprint™ |
| `hall-of-legacy-v1` | Hall of Legacy™ Set | archive | Nostalgic | Chronicle Hall™ | Blueprint™ |

---

## Creative Atelier™ Set — Registry Entry (Pilot)

```json
{
  "setRegistryEntry": {
    "setId": "creative-atelier-v1",
    "displayName": "Creative Atelier™ Set",
    "departmentId": "creative-direction",
    "packageId": "pkg-creative-direction-golden-v1",
    "setDnaId": "set-dna-creative-atelier-v1",
    "primaryEmotion": "inspired",
    "heroObjectId": "living-mood-wall",
    "lifecycle": {
      "stage": "golden-build",
      "goldenBuildRoute": "/admin/studio/department/creative-direction"
    },
    "foundationalSystems": {
      "arrivalSequence": "arrival-creative-atelier-v1",
      "idleLife": "idle-creative-atelier-v1",
      "worldPersistence": true,
      "ambientStorytelling": true
    },
    "founderPhrases": [
      "I'm heading into the Creative Atelier",
      "Meet me in Creative Direction",
      "The Atelier is ready"
    ],
    "zones": [
      "arrival-threshold",
      "brief-wall",
      "mood-wall",
      "observatory",
      "timeline-table",
      "sandbox",
      "reference-library",
      "founder-review",
      "orb-command",
      "departure-threshold"
    ]
  }
}
```

---

## Registry Entry Schema

```json
{
  "setRegistryEntry": {
    "setId": "string — stable identifier",
    "displayName": "string — founder-facing name",
    "departmentId": "string | null — org mapping",
    "packageId": "string — department package",
    "setDnaId": "string — Set DNA artifact",
    "primaryEmotion": "string",
    "heroObjectId": "string",
    "lifecycle": {
      "stage": "blueprint | golden-build | certified | live | evolution | legacy",
      "goldenBuildRoute": "string — implementation doorway only"
    },
    "marketplace": {
      "publishable": false,
      "packId": null,
      "trustScore": null
    },
    "foundationalSystems": {
      "arrivalSequence": "string profile id",
      "idleLife": "string profile id",
      "worldPersistence": true,
      "ambientStorytelling": true
    },
    "founderPhrases": ["string"],
    "zones": ["string"]
  }
}
```

---

## Registry Operations (Future)

| Operation | Description |
|-----------|-------------|
| **Register** | New Set™ after Blueprint Complete |
| **Promote** | Lifecycle stage advance |
| **Publish** | Marketplace listing |
| **Fork** | Industry adaptation from base Set™ |
| **Archive** | Legacy™ → Hall of Legacy™ exhibit |

Aligns with [Studio Asset Registry™](../engines/studio-asset-registry/README.md) at Set scope.

---

## Relationship to Department Package Registry

| Registry | Scope |
|----------|-------|
| `department-package/registry.ts` | Organization packages (implementation) |
| Set Registry™ | Environment catalog (canonical) |

One department package maps to one Set Registry™ entry in alpha 1:1 model.

---

## Lifecycle by Set

| Set™ | Current stage | Notes |
|------|---------------|-------|
| Creative Atelier™ | Golden Build™ | Sprint 001 pilot |
| All others | Blueprint™ | Spec only |

---

## Cross-References

- [Set DNA](./set-dna.md)
- [Production Lifecycle](../production-lifecycle/README.md)
- [Marketplace Set System](./marketplace-set-system.md)
