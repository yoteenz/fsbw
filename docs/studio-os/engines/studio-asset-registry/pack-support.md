# Pack Support — Studio Asset Registry™

**Engine Module:** `studio.asset-registry.v1.pack-support`  
**Status:** Pack ownership · Marketplace injection · entitlements

---

## Purpose

Registry items understand **Pack ownership**. Marketplace purchases inject Registry items into Studio OS — permanently, with proper licensing and org entitlements.

Packs are **containers**, not silos. Licensed items remain discoverable when policy permits.

---

## Pack Registry Item Schema

```json
{
  "registryId": "registry:pack-luxury-office-v1",
  "version": "1.2.0",
  "identity": {
    "name": "Luxury Office Pack™",
    "category": "pack",
    "subcategory": "pack.luxury-office",
    "creator": { "type": "studio", "id": "studio-os-core" }
  },
  "status": { "lifecycle": "marketplace" },
  "packManifest": {
    "packId": "pack-luxury-office-v1",
    "displayName": "Luxury Office Pack™",
    "tagline": "Executive environments for premium professional headquarters",
    "tier": "premium",
    "industries": ["agency", "law", "finance", "consulting"],
    "departments": ["executive", "creative-direction", "legal"],
    "itemCount": 47,
    "items": [
      {
        "registryId": "registry:executive-chair-luxury-v3",
        "versionConstraint": "^3.0.0",
        "exclusive": false
      },
      {
        "registryId": "registry:conference-table-marble-v2",
        "versionConstraint": "^2.0.0",
        "exclusive": false
      },
      {
        "registryId": "registry:pack-exclusive-hologram-executive-v1",
        "versionConstraint": "1.0.0",
        "exclusive": true
      }
    ],
    "promptBundle": [
      "registry:prompt-recipe-luxury-office-environment-v1"
    ],
    "departmentTemplates": [
      "registry:dept-template-executive-suite-v1"
    ],
    "genomePresets": [
      "registry:genome-preset-luxury-office-v1"
    ]
  },
  "licensing": {
    "ownership": "studio",
    "licenseType": "marketplace-purchase",
    "marketplaceSku": "pack-luxury-office-v1",
    "redistribution": "org-scoped-compile"
  },
  "preview": {
    "thumbnailRef": "artifact://thumbnails/pack-luxury-office-v1.webp",
    "heroRef": "artifact://previews/pack-luxury-office-hero.webp"
  }
}
```

---

## Canonical Pack Catalog (Examples)

| Pack ID | Display Name | Primary Industries |
|---------|--------------|-------------------|
| `pack-luxury-office-v1` | Luxury Office Pack™ | Agency · Law · Finance |
| `pack-luxury-salon-v1` | Luxury Salon Pack™ | Beauty · Wellness |
| `pack-law-office-v1` | Law Office Pack™ | Legal |
| `pack-restaurant-v1` | Restaurant Pack™ | Hospitality |
| `pack-medical-v1` | Medical Pack™ | Healthcare |
| `pack-retail-v1` | Retail Pack™ | Commerce |
| `pack-construction-v1` | Construction Pack™ | Trades · Contracting |
| `pack-podcast-v1` | Podcast Pack™ | Media · Creator |
| `pack-music-studio-v1` | Music Studio Pack™ | Music · Production |
| `pack-creator-v1` | Creator Pack™ | Creator · Influencer |

Each pack registers as `registry:pack-{slug}-v1` with full manifest.

---

## Pack Ownership Fields

Every Registry Item includes `packOwnership`:

```json
{
  "packOwnership": {
    "ownedByPack": "registry:pack-luxury-office-v1",
    "introducedByPack": "registry:pack-luxury-office-v1",
    "packExclusive": true
  }
}
```

| Field | Meaning |
|-------|---------|
| `ownedByPack` | Pack that holds license authority |
| `introducedByPack` | Pack that first brought item to platform |
| `packExclusive` | Reuse limited to entitled orgs |

Non-pack items:

```json
{
  "packOwnership": {
    "ownedByPack": null,
    "introducedByPack": null,
    "packExclusive": false
  }
}
```

Platform-wide Approved items have null pack ownership.

---

## Marketplace Purchase Injection

```
User purchases pack-luxury-office-v1
         ↓
Marketplace records entitlement (orgId + packId + purchaseAt)
         ↓
Registry.injectPack(packId, orgId):
  1. Load pack manifest
  2. For each item in manifest.items[]:
     a. Verify item lifecycle (marketplace | premium | approved)
     b. Create org entitlement edge
     c. Append pack.injected event
  3. Register promptBundle items (if not already entitled)
  4. Unlock departmentTemplates for Generator
  5. Apply genomePresets as optional org overlay
         ↓
Org RegistrySnapshot now includes pack items
         ↓
Compiler + Runtime + Generator see entitled items
```

**Injection is permanent** — purchase grants perpetual org access to pinned manifest versions (with upgrade path).

---

## Entitlement Model

```yaml
PackEntitlement:
  orgId: string
  packId: string
  registryId: registry:pack-luxury-office-v1
  purchasedAt: ISO8601
  manifestVersion: "1.2.0"
  itemEntitlements:
    - registryId: registry:executive-chair-luxury-v3
      versionConstraint: "^3.0.0"
      access: reuse-and-compile
  status: active | refunded | suspended
```

| Access Level | Compiler | Runtime | Export |
|--------------|----------|---------|--------|
| `reuse-and-compile` | Full reuse | Full mount | Into org packages |
| `runtime-only` | No compile | Mount only | No |
| `view-only` | No reuse | Preview in Marketplace | No |

Default purchase: `reuse-and-compile`.

---

## Pack-Exclusive Reuse Rules

When `packExclusive: true`:

| Consumer | Without Entitlement | With Entitlement |
|----------|---------------------|------------------|
| Smart Reuse | Item invisible | Normal reuse |
| Search | Hidden | Visible |
| Compiler | Generate alternative | Link pack item |
| Runtime | Fallback placeholder | Mount artifact |

Reuse Engine filters snapshot by `orgEntitled` flag on `ReuseIndexEntry`.

---

## Department Pack Integration

Department Generator™ outputs may reference Pack templates:

```json
{
  "departmentType": "executive",
  "packTemplateRef": "registry:dept-template-executive-suite-v1",
  "requiredPack": "registry:pack-luxury-office-v1"
}
```

Generator validates org entitlement before emitting definition.

Expansion Center (M88) department pack installs trigger Registry injection when pack includes Registry manifest.

---

## Pack Composition Rules

| Rule | Description |
|------|-------------|
| Minimum items | Pack manifest ≥ 5 Registry items |
| Category diversity | ≥ 3 top-level categories represented |
| Prompt bundle | Environment packs include `prompt.recipe` |
| Version pins | Each item has `versionConstraint` |
| Exclusive limit | ≤ 30% of items may be `packExclusive` |
| Dependency closure | All `requires` deps included or platform-approved |
| Preview assets | Pack thumbnail + hero required |

---

## Pack Updates

| Update Type | Behavior |
|-------------|----------|
| New items added | Existing purchasers get items (manifest minor bump) |
| Item version bump | Purchasers get `^constraint` range upgrade |
| Item removed | Deprecated · grandfathered for existing purchasers |
| Pack deprecated | Successor pack declared · migration guide |

`packManifest.changelog[]` tracks all changes.

---

## Cross-Pack Item Sharing

Items may appear in multiple packs:

```
registry:executive-chair-luxury-v3
  ├── pack-luxury-office-v1 (member)
  ├── pack-law-office-v1 (member)
  └── packOwnership.ownedByPack: null (platform item)
```

Shared platform items are not pack-exclusive. Pack adds **curated collection**, not lock-in.

---

## Compiler Pack Context

Compile request includes pack scope:

```json
{
  "registryContext": {
    "registrySnapshotRef": "snapshot-org-frontal-slayer-v1",
    "entitledPacks": [
      "registry:pack-luxury-office-v1",
      "registry:pack-creator-v1"
    ],
    "preferPackItems": true
  }
}
```

`preferPackItems: true` boosts reuse score +5 for entitled pack members.

---

## Revenue & Attribution

Marketplace items track:

```json
{
  "licensing": {
    "marketplaceSku": "pack-luxury-office-v1",
    "contributorId": "studio-os-core",
    "royaltySplit": { "studio": 0.7, "contributor": 0.3 },
    "attributionRequired": true
  }
}
```

`usageHistory` per item enables contributor analytics.

---

## Event Bus

| Event | Payload |
|-------|---------|
| `pack.registered` | packId · itemCount |
| `pack.purchased` | orgId · packId |
| `pack.injected` | orgId · items[] |
| `pack.upgraded` | orgId · oldVersion · newVersion |
| `pack.refunded` | orgId · packId · revokedItems[] |

---

_Pack Support — purchases become permanent library additions._
