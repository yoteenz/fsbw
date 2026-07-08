# Marketplace Lifecycle — Packs · Templates · Third-Party

**Version:** 1.0.0  
**Status:** Canonical  
**Applies to:** Marketplace Packs™ · department templates · AI staff packs · asset bundles

---

## Purpose

Marketplace offerings follow the **same six-stage Production Lifecycle™** as first-party departments — with additional **Marketplace Certified™** requirements.

Founders and publishers share one language:

- *"This pack is still in Blueprint™."*
- *"The Editorial Mood Kit reached Golden Build™."*
- *"Luxury Retail Template is Marketplace Certified™."*
- *"Our acquired brand pack is Live™."*

---

## Marketplace Lifecycle Flow

```
Publisher Blueprint™ (pack spec · compatibility)
         ↓
Publisher Golden Build™ (installable preview · one department proof)
         ↓
Marketplace Certified™ (security · compatibility · quality)
         ↓
Live™ in Marketplace (discoverable · installable)
         ↓
Evolution™ (version bumps · compatibility updates)
         ↓
Legacy™ (superseded pack → Archive™ gallery)
```

---

## Stage Definitions for Marketplace

### Blueprint™

| Output | Description |
|--------|-------------|
| Pack manifest | Identity · version · dependencies |
| Compatibility matrix | Supported genomes · runtime versions |
| Preview storyboard | How install feels in Headquarters |
| Publisher vision | Positioning · target industries |

---

### Golden Build™

| Output | Description |
|--------|-------------|
| Installable preview | Founder can trial in sandbox |
| One proof department or object set | Smallest magical install |
| Genome adaptation sample | 2+ industry previews |
| Install / uninstall flow | Clean lifecycle |

Publisher proves the pack works — not feature completeness.

---

### Certified™ + Marketplace Certified™

| Certification | Marketplace-specific requirement |
|---------------|-------------------------------|
| Studio Certified™ | Base quality |
| Marketplace Certified™ | **Required** — security scan · IP · compatibility |
| Genome Certified™ | Adapts without breaking org genome |
| Performance Certified™ | Install size · load SLA |

Third-party packs **cannot go Live™** without Marketplace Certified™.

---

### Live™

| Behavior | Description |
|----------|-------------|
| Marketplace listing | Discoverable · trust score visible |
| Install to Headquarters | Standard lifecycle on installed instance |
| Usage analytics | Publisher + Studio Intelligence™ |
| Revenue / licensing | Per monetization architecture |

**Installed pack instances** inherit org lifecycle independently — a Live™ pack can install into a Blueprint™ department.

---

### Evolution™

| Activity | Description |
|----------|-------------|
| Version bumps | `pack-v2` · migration path |
| Compatibility updates | Runtime version pins |
| Changelog | Founder-visible improvements |
| Deprecation notices | 90-day window before Legacy™ |

---

### Legacy™

| Trigger | Example |
|---------|---------|
| Pack superseded | Editorial Mood Kit v1 → v2 |
| Publisher retired | Pack removed from Live™ marketplace |
| Acquired catalog | Historic packs in Archive™ |

Legacy packs remain **installable for existing users** (pinned) — exhibits in Archive™ for narrative.

---

## Publisher vs Founder Lifecycle

| Actor | Sees |
|-------|------|
| **Publisher** | Pack lifecycle on publisher dashboard |
| **Founder (buyer)** | Installed instance lifecycle in Headquarters |
| **Studio** | Both — certification authority |

```
Publisher: Pack "Luxury Retail" → Live™ in Marketplace
Founder:   Installs pack → new Department instance → Blueprint™ or Golden Build™ per install config
```

---

## Marketplace Quality Gates

Extends [quality-gates.md](./quality-gates.md):

| Gate | Marketplace addition |
|------|---------------------|
| Golden Build Gate | Sandbox install proof |
| Certification Gate | Marketplace Certified™ mandatory |
| Live Gate | Listing approval · pricing |
| Legacy Gate | User notification · migration guide |

---

## Trust Score Integration

[Marketplace trust score](../studio-os-core/marketplace/) (when Live™) reflects:

| Signal | Weight |
|--------|--------|
| Certification level | High |
| Lifecycle stage | Live™ + Evolution™ preferred |
| Founder reviews | Medium |
| Install success rate | Medium |
| Chronicle-worthy moments | Low · narrative |

---

## Relationship to Department Lifecycle

| Scenario | Lifecycle |
|----------|-----------|
| Pack contains full department | Pack lifecycle + installed department lifecycle |
| Pack contains assets only | Assets register in Registry™ with pack provenance |
| Pack contains AI staff | Staff entity lifecycle |

Installed entities reference `sourcePackId` in lifecycle metadata.

---

## Founder Language

- *"Browse Certified™ packs only."*
- *"This template is Golden Build™ — try before full install."*
- *"The v1 pack entered Legacy™ — we're on v2."*

---

## Cross-References

- [certification-system.md](./certification-system.md) — Marketplace Certified™
- [marketplace engine](../../src/studio-os-core/marketplace/) — implementation (future)
- [monetization architecture](../monetization-architecture/) — licensing
