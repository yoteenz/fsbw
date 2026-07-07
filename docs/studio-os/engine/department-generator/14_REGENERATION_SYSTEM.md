# 14 — Regeneration System

**Engine Module:** `studio.department-generator.v1.regeneration`  
**Status:** Surgical non-destructive iteration system  
**Philosophy:** Users never regenerate entire departments unless requested. Change one thing → regenerate one thing.

---

## Design Principle

| Change | Regenerates |
|--------|-------------|
| Lighting | Lighting only |
| Mood Wall | Mood Wall only |
| Orb | Orb only |
| Genome materials | Material-family assets only |
| Interaction map | Data only — no visual regen |
| Full department | Everything — explicit founder request only |

---

## Regeneration Scope Schema

```yaml
RegenerationScope:
  scopeType: enum
  assetIds: string[]
  preserveVersion: boolean          # default true
  mergeStrategy: enum             # replace | overlay | merge-manifest
  trigger: enum                     # founder-request | genome-update | marketplace-swap | qa-retry
```

### Scope Types

| scopeType | Asset IDs Included | Typical Trigger |
|-----------|-------------------|-----------------|
| `lighting` | lighting-rig-* · env-ceiling partial | Genome lightingStyle change |
| `materials` | env-floor-* · furniture materials · decor | Genome materialLanguage change |
| `mood-wall` | wall-mood-{dept} | Marketplace variant · direction change |
| `orb` | orb-{dept} · pedestal-orb-{dept} | Voice pack swap |
| `audio` | audio-ambient-* · audio-ceremony-* · audio-orb-* | Genome customerEmotions |
| `atmosphere` | particles-ambient-* · env-view-plate | Experience DNA change |
| `object` | single asset ID | Object damage · QA fail |
| `interaction` | interaction-map.json only | Verb binding change — no mesh |
| `ai-team` | ai/*.json only | Role expansion |
| `full` | all assets | Explicit founder rebuild |

---

## Regeneration Pipeline

```
Regeneration Request
       ↓
Scope Resolver (maps change → asset IDs)
       ↓
Dependency Check (include dependent assets if required)
       ↓
Partial GenerationInstructionSet
       ↓
Asset Compiler surgical execute
       ↓
Manifest merge (preserve unchanged assets)
       ↓
Version bump (patch default · minor if new object)
       ↓
QA on affected assets only
       ↓
Runtime hot-swap (no full department restart)
```

---

## Non-Destructive Rules

| Rule | Specification |
|------|---------------|
| Preserve manifest entries | Unchanged assets retain IDs and versions |
| Preserve project state | Regen never clears Project references |
| Preserve branches | Timeline state untouched |
| Preserve approvals | Locked nodes remain locked |
| Rollback generation | Previous asset version retained 1 generation |
| Runtime continuity | Hot-swap shader/audio without arrival replay |

---

## Genome-Driven Auto-Regeneration

| Genome Field Change | Auto Scope |
|--------------------|------------|
| materialLanguage | materials |
| lightingStyle | lighting + atmosphere |
| voice | orb + audio-orb |
| photographyDirection | mood-wall seeds only |
| customerEmotions | audio-ambient + particles |

**Rule:** Auto-regen requires founder confirm for mood-wall and full scopes.

---

## Marketplace Object Swap

```yaml
MarketplaceSwap:
  targetAssetId: string
  replacementPackageId: string
  compatibilityCheck: semver
  mergeStrategy: replace
```

Generator validates object class + zone binding compatibility before handoff.

---

## Versioning on Regeneration

| Change | Version Bump |
|--------|--------------|
| Single asset replace | Package patch |
| New optional asset | Package minor |
| Topology change | Package major — forbidden in surgical regen |
| Interaction-only | Package patch · asset versions unchanged |

Aligns with Asset Compiler Versioning (10).

---

## Founder Experience

| Founder Says | Scope Resolved |
|--------------|----------------|
| *"Regenerate the lighting"* | `lighting` |
| *"New Mood Wall variant"* | `mood-wall` |
| *"Update Orb voice"* | `orb` + `audio-orb` |
| *"Rebuild this department"* | `full` — confirmation ceremony |
| *"Fix the Timeline Table"* | `object: table-timeline-{dept}` |

Founder never selects asset IDs — Generator resolves from natural language via Orb routing.

---

## QA on Regeneration

| Check | Scope |
|-------|-------|
| Affected asset validates | Changed assets only |
| Manifest integrity | Full dependency graph |
| Genome slots intact | Changed assets |
| Interaction compatibility | If object geometry changed |
| Runtime hot-swap test | Changed assets mount correctly |

---

_Next: [15 — Marketplace Export](./15_MARKETPLACE_EXPORT.md)_
