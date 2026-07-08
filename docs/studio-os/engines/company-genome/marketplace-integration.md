# Marketplace Integration™

**Engine Module:** `studio.company-genome.v2.marketplace`  
**Status:** Purchases as learning signals

---

## Law

> Every purchased scene · workspace · asset · lighting system · material pack **updates Company Genome™**.

Purchases are **additional learning signals** — not separate from Decision DNA™.

---

## Purchase Types

| Purchase | Traits imported |
|----------|-----------------|
| **Scene** | Atmosphere · scale · composition |
| **Workspace** | Layout · zone patterns · landmark style |
| **Asset** | Material · object · lighting profile |
| **Lighting system** | Rig behavior · color temperature |
| **Material pack** | Texture vocabulary · PBR families |
| **Blueprint pack** | Creative · visual systems bundle |

---

## Purchase Learning Flow

```
Marketplace transaction complete
         ↓
Pack metadata → trait extraction
         ↓
GenomeDecision (type: purchased)
         ↓
Import beliefs with initial confidence 70–85
         ↓
EvidenceCount seed from pack quality tier
         ↓
Orb: "Luxury Materials Pack™ expanded your material vocabulary."
```

---

## Schema

```yaml
MarketplaceGenomeImport:
  importId: uuid
  orgId: string
  packId: string
  packType: scene | workspace | asset | lighting | material | blueprint
  importedTraits: ImportedTrait[]
  importedAt: ISO8601

ImportedTrait:
  key: string
  strand: visual | creative | brand | operational
  initialConfidence: number
  sourcePackItemId: string
```

---

## Conflict Resolution

| Conflict | Resolution |
|----------|------------|
| Purchase vs existing belief | Higher confidence wins · merge if compatible |
| Purchase vs negative constraint | Flag Creative Drift · founder confirm |
| Duplicate pack purchase | Increment evidenceCount only |

---

## Entitlement vs Learning

| Action | Genome effect |
|--------|---------------|
| Pack entitled (owned) | Boost reuse recommendations |
| Pack purchased new | Import traits + entitlement |
| Pack preview only | No import until purchase |

---

## Marketplace Equity Link

[Creative Equity™ Marketplace Equity](../../creative-equity/marketplace-equity.md) tracks wealth.

Company Genome™ tracks **taste import** — complementary systems.

---

## Universal Schema

Pack trait extraction uses **generic trait keys** — not Frontal Slayer-specific mappings.

```yaml
traitKeyPattern: "{category}-{descriptor}-{variant}"
# e.g. lighting-warm-editorial-v1
```

Works for any marketplace publisher · any customer org.

---

_Marketplace Integration — every purchase teaches taste._
