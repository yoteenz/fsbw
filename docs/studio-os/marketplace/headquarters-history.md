# Headquarters History™

**Every headquarters remembered · restored · forked · sold**

**Version:** 1.0.0  
**Status:** Canonical history architecture (docs only)  
**Parent:** [Studio Marketplace™](./README.md)

---

## Purpose

Every purchased, generated, or renovated headquarters becomes part of **Studio World™** history.

Founders revisit previous versions · restore them · fork them · create Alternate Branches™ · or sell them.

**Nothing is lost.**

Extends [Archive Integration™](../world/archive-integration.md) to marketplace-owned headquarters.

---

## Core Law

```
EVERY HEADQUARTERS HAS LINEAGE
```

---

## What Enters History

| Event | History entry |
|-------|---------------|
| Studio Original™ selection | `founding-hq` |
| Marketplace purchase | `purchase-{packageId}` |
| Premium Generation™ completion | `generated-{conceptId}` |
| Renovation™ applied | `renovation-{scope}-{version}` |
| Rebrand regeneration | `rebrand-{version}` |
| Publish to Community™ | `published-{listingId}` |
| Studio Certified™ award | `certified-{date}` |
| Fork / Alternate Branch™ | `branch-{parentId}` |

---

## History Entry Schema

```json
{
  "headquartersHistoryEntry": {
    "id": "hq-history/frontal-slayer/launch-week-cds-v2",
    "orgId": "frontal-slayer",
    "type": "renovation",
    "label": "Launch Week CDS Renovation",
    "headquartersPackageSnapshot": { },
    "environmentDnaSnapshots": [ ],
    "topologySnapshot": { },
    "capturedAt": "2026-07-08T00:00:00Z",
    "productionStage": "launch",
    "source": "marketplace-purchase | generation | renovation | original",
    "lineage": {
      "parentEntryId": "founding-hq",
      "childEntryIds": [ ]
    },
    "replayEligible": true,
    "publishEligible": false,
    "archiveEntryId": "archive/..."
  }
}
```

---

## Founder Actions

| Action | Experience |
|--------|------------|
| **Revisit** | Walk into archived headquarters (Arrival Sequence™) |
| **Restore** | Replace current HQ with historical snapshot |
| **Fork** | Copy snapshot to new Private™ branch |
| **Alternate Branch™** | Parallel timeline — explore without replacing |
| **Compare** | Side-by-side current vs historical |
| **Sell** | Publish forked version to marketplace (if rights allow) |
| **Export** | Full Headquarters Package™ download |

---

## Revisit Experience

Founder does not view thumbnails.

Founder **enters** the past:

> *"This is your Creative Direction Studio™ during Launch Week 2025."*

Orb hosts historical context.

Aligns with [Archive Integration™](../world/archive-integration.md) walk-in replay.

---

## Restore vs Fork

| Action | Current HQ | History |
|--------|------------|---------|
| **Restore** | Replaced by snapshot | Current archived first |
| **Fork** | Unchanged | New branch created |
| **Alternate Branch™** | Unchanged | Parallel exploration timeline |

Restore requires confirmation — Orb explains what will be archived.

---

## Selling a Headquarters™

Publishing path for founder-created environments:

```
Private™
    ↓
Share With Team™
    ↓
Submit For Review™
    ↓
Community Marketplace™
    ↓
Studio Certified™
    ↓
Featured Collection™
```

### Publishing Rules

| Rule | Law |
|------|-----|
| Must own rights | No stolen packages |
| Golden Build™ minimum | Complete environment |
| Genome stripped | Buyer adaptation required |
| History preserved | Original founder copy retained |
| Revenue attribution | Creator royalty on installs |

**Prestigious** — not anonymous upload.

**Detail:** [quality-certification.md](./quality-certification.md) · [creator-economy.md](./creator-economy.md)

---

## Purchase History

Founders track marketplace acquisitions:

| Metadata | Purpose |
|----------|---------|
| Purchase date | Provenance |
| Creator attribution | Economy transparency |
| Version installed | Update notifications |
| Renovation lineage | Upgrade path |
| License scope | Org · team · resale rights |

---

## Integration with Set Continuity™

| System | Scope |
|--------|-------|
| **Set Continuity™** | Automatic milestone evolution inside a version |
| **Headquarters History™** | Version boundaries · purchases · renames · forks |

A single history entry may contain rich Set Continuity™ artifact layers.

---

## Integration with Alternate Branch™

Founder explores *"What if we kept the pre-rebrand headquarters?"*

Alternate Branch™ creates parallel history entry — not destructive.

Rejected concepts and rejected headquarters expressions preserved per [Canon & Branches™](../founder-taste-engine/canon-and-branches.md).

---

## Orb History Dialogue

| Moment | Orb pattern |
|--------|-------------|
| Open history | *"You have six headquarters chapters — nothing was lost."* |
| Revisit | *"Launch Week, 2025. Campaign surfaces were live."* |
| Before restore | *"I'll archive your current HQ before restoring."* |
| Publish offer | *"This headquarters is exceptional — consider submitting for Studio Certified™."* |

---

## Anti-Patterns

| Anti-pattern | Violation |
|--------------|-----------|
| Overwrite without snapshot | History loss |
| Delete purchase history | Breaks provenance |
| Sell without review path | Quality collapse |
| History as file list | Not experiential |

---

## Relationship to Canon

| System | Role |
|--------|------|
| [Archive Integration™](../world/archive-integration.md) | Permanent storage |
| [Headquarters Packages™](./headquarters-packages.md) | Snapshot payload |
| [Renovation System™](./renovation-system.md) | Pre-renovation capture |
| [GPU Generation Strategy™](./gpu-generation-strategy.md) | Generated entry type |

---

## Implementation Status

**Docs only.** History spec — no version browser UI this sprint.
