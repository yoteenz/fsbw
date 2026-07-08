# Marketplace Integration™ — Packs Enter the Registry

**Module:** `studio.asset-intelligence.v1.marketplace`  
**Status:** Purchase · license · publish · search

---

## Principle

> Everything enters the Asset Registry™.

Marketplace assets are not side-channel downloads. They are **first-class Registry items** entitled per organization — searchable by Asset Intelligence Engine™ like any company-created asset.

---

## Pack Types

| Pack Type | Categories | Intelligence Behavior |
|-----------|------------|----------------------|
| **Asset Packs™** | Mixed | Bundle search · sibling recommendations |
| **Lighting Packs™** | Lighting™ · Atmosphere™ | High reuse priority when entitled |
| **Furniture Collections™** | Furniture™ · Decor™ | Modify-friendly recommendations |
| **Material Libraries™** | Materials™ · Glass™ · Stone™ · Metal™ | DNA seeding for new orgs |
| **Atmosphere Packs™** | Atmosphere™ · Particles™ | Scene Stack layer candidates |
| **Architectural Components™** | Environment Shell™ · Landmarks™ | Department bootstrap |
| **Transition Systems™** | Transitions™ | Platform-wide reuse |

---

## Entitlement Flow

```
Studio purchases / licenses Pack™
         ↓
Pack items injected into org Registry view
         ↓
Intelligence searches entitled items + org-created items
         ↓
Unentitled pack matches → "Available in Marketplace" (no auto-reuse)
         ↓
Founder purchases → immediate reuse candidates
```

Aligns with [pack-support.md](../engines/studio-asset-registry/pack-support.md).

---

## Search Priority

| Source | Priority |
|--------|----------|
| Org-created approved | Highest (DNA-aligned) |
| Org-licensed packs | High |
| Platform universal | High for universal assets (Orb) |
| Unentitled marketplace | Suggest only · no link |

---

## Publish Flow

Organizations may **publish** approved assets as Marketplace offerings:

```
Org asset approved in Registry
         ↓
Founder selects Publish to Marketplace™
         ↓
License tier set (educational · commercial · exclusive)
         ↓
Marketplace listing · other orgs may license
         ↓
Publisher org retains canonical item · licensees get entitled copy refs
```

Intelligence tracks publisher vs licensee provenance in `Creator™` field.

---

## Pack-Aware Recommendations

When request matches pack item:

> *"Creative Library Shelving™ is in your licensed Furniture Collection Pack (91% match). Reuse saves generation — already entitled."*

When match requires purchase:

> *"Editorial Lighting Pack™ matches 94% — available in Marketplace Lighting Pack ($X). Purchase to reuse across Marketing and CDS."*

Never auto-charge. Present · founder decides.

---

## Studio Originals™

[Studio Originals™](../marketplace/studio-originals.md) HQ templates seed DNA for new companies:

- Pre-populated Registry candidates
- Intelligence boosts Originals-aligned reuse during first Golden Build™
- Reduces cold-start generation volume

---

## Expert Marketplace™

Published Profession Brain™ surfaces may include **approved visual asset subsets** — private ops knowledge stays private until approved for marketplace.

See [Expert Marketplace™](../expert-marketplace.md).

---

## Anti-Patterns

| Anti-Pattern | Why |
|--------------|-----|
| Pack assets outside Registry | Breaks search |
| Silent pack injection without metadata | Breaks compatibility |
| Cross-org reuse without license | Legal + trust violation |
| Marketplace bypass of Founder Control™ | Same gate applies |

---

_Marketplace Integration™ — buy once, search forever._
