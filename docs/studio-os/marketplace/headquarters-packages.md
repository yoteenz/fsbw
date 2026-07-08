# Headquarters Packages™

**Everything required to recreate an environment — automatically packaged**

**Version:** 1.0.0  
**Status:** Canonical package schema (docs only)  
**Schema ID:** `studio.headquarters-package.v1`  
**Parent:** [Studio Marketplace™](./README.md)

---

## Purpose

When a creator publishes a Living Set™ or entire Headquarters™, Studio OS **automatically packages everything** required to recreate the environment on any purchaser's Studio World™.

No manual asset bundling.

No disconnected file uploads.

One **Headquarters Package™** = one installable world.

---

## Core Law

```
IF IT IS REQUIRED TO WALK THE ENVIRONMENT, IT IS IN THE PACKAGE
```

Think: buying an entire **architectural vision** — not parts.

---

## Package Contents (Canonical)

| Artifact | Description |
|----------|-------------|
| **Living Set™** | Department environment definition |
| **Scene Blueprint™** | Production truth · spatial layout |
| **Environment DNA™** | Full regeneration manifest |
| **Asset Graph™** | Every object node · dependencies |
| **Room DNA™** | Legacy compatibility layer |
| **Lighting rig** | Key · fill · rim · ceremony |
| **Materials library** | Surfaces · metals · fabrics |
| **Interactive objects** | Workstations · hero objects |
| **Camera anchors** | Arrival · walk · review · orbit |
| **Transitions™** | In/out edges · corridor character |
| **Animations** | Idle Life™ · ceremony · interactive |
| **Audio profile** | Ambient · SFX · stings |
| **Navigation graph** | Walk paths · zone boundaries |
| **Orb placement** | Host anchor · dialogue profile |
| **Production stations** | Pipeline · Review · Branch · Timeline maps |
| **Topology manifest** | HQ graph nodes · wings (full HQ packages) |
| **Genome adaptation matrix** | Industry · brand modulation rules |
| **Install manifest** | Dependencies · compatibility · footprint |

---

## Package Schema (Overview)

```json
{
  "headquartersPackage": {
    "schemaVersion": "studio.headquarters-package.v1",
    "packageId": "pkg-luxury-editorial-atelier-v1",
    "displayName": "Luxury Editorial Atelier™",
    "packageType": "living-set",
    "qualityTier": "studio-certified",
    "publisher": { "type": "creator", "id": "creator-uuid" },

    "livingSet": { },
    "sceneBlueprint": { },
    "environmentDna": { },
    "assetGraph": { },
    "roomDna": { },

    "sensory": {
      "lighting": { },
      "materials": { },
      "audio": { },
      "animations": { }
    },

    "spatial": {
      "cameraAnchors": [ ],
      "navigationGraph": { },
      "transitions": [ ],
      "orbPlacement": { },
      "productionStations": { }
    },

    "topology": {
      "scope": "department",
      "nodes": [ ],
      "edges": [ ]
    },

    "adaptation": {
      "genomeMatrix": { },
      "industryVariants": [ ]
    },

    "install": {
      "minRuntimeVersion": "studio.alpha.v1",
      "footprint": "single-department",
      "gpuRequired": false,
      "estimatedInstallMs": 0
    },

    "provenance": {
      "lifecycleStage": "live",
      "certificationId": "studio-certified-2026-07",
      "version": "1.0.0",
      "lineage": [ ]
    }
  }
}
```

---

## Package Types

| Type | Scope | Install footprint |
|------|-------|-------------------|
| `living-set` | Single department | One topology node |
| `department-pack` | Department + annexes | Small wing |
| `creative-headquarters` | Creative wing | Multi-node wing |
| `brand-world` | Brand campus slice | Campus subgraph |
| `entire-headquarters` | Full HQ | Complete topology |

All types share schema — `topology.scope` differs.

---

## Auto-Packaging Pipeline

When creator submits for publication:

```
1. VALIDATE FRAMEWORK
   Framework Lock™ zones · production stations present

2. COLLECT ARTIFACTS
   Pull Environment DNA™ · Asset Graph™ · Scene Blueprint™ from project

3. RESOLVE DEPENDENCIES
   Transitions · audio · animations · camera paths

4. BUILD ADAPTATION MATRIX
   Genome modulation rules · industry variants

5. STRIP CREATOR-SPECIFIC GENOME
   Remove hardcoded company identity · keep design intent

6. PACKAGE & SEAL
   Schema validation · checksum · provenance

7. CERTIFICATION QUEUE
   Quality tier review path
```

Creator does not manually zip files.

---

## Install Behavior

| Property | Law |
|----------|-----|
| **GPU required** | `false` for all pre-built packages |
| **Install time** | Seconds — assets pre-generated |
| **Genome merge** | Purchaser Company Genome™ modulates on install |
| **Framework preservation** | Zones never stripped |
| **Rollback** | Prior HQ state archived before install |
| **Uninstall** | Clean removal · Archive™ retains copy |

---

## NOT in the Package (Explicit Exclusions)

| Excluded | Why |
|----------|-----|
| Loose texture files | Asset-store pattern |
| Individual chair mesh | Disconnected piece |
| CSS theme tokens | Skinning — not place |
| Prompt files only | Not walkable environment |
| Partial zone export | Breaks framework integrity |

---

## Studio Originals™ Packages

Studio Originals™ ship as pre-sealed **Headquarters Packages™**:

- `gpuRequired: false`
- `qualityTier: studio-original`
- `publisher.type: studio-os`
- Maintained by platform version bumps

---

## Premium Generation™ Output

When founder completes Premium Generation™ path, output **auto-packages** as Private™ Headquarters Package™:

- Available for personal reuse
- Eligible for publishing path
- GPU cost already absorbed at generation time

---

## Versioning

| Event | Version behavior |
|-------|------------------|
| Creator patch | Semver bump · migration manifest |
| Renovation™ by buyer | Forked Private™ package · new lineage |
| Studio Original update | Platform pushes compatible bump |
| Breaking runtime change | Compatibility gate · Evolution™ stage |

---

## Anti-Patterns

| Anti-pattern | Violation |
|--------------|-----------|
| Manual asset zip upload | Bypasses auto-packaging |
| Package missing transitions | Broken World Immersion™ |
| Package missing Orb placement | Broken host law |
| GPU install flag on pre-built | Breaks cost strategy |

---

## Relationship to Canon

| System | Role |
|--------|------|
| [Environment DNA™](../world/environment-dna.md) | Core payload |
| [Creative Direction Pipeline™](../creative-direction-pipeline/README.md) | Premium generation source |
| [Asset Graph™](../creative-direction-pipeline/asset-graph.md) | Object dependencies |
| [Archive Integration™](../world/archive-integration.md) | Pre-install snapshot |
| [Production Lifecycle™](../production-lifecycle/marketplace-lifecycle.md) | Stage gates |

---

## Implementation Status

**Docs only.** Schema spec — no packager runtime this sprint.
