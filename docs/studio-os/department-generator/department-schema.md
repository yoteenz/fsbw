# Department Schema — `department.json`

**Schema ID:** `studio.department-generator.v1.department-manifest`  
**Output file:** `department.json`  
**Status:** Canonical Department Manifest specification

---

## Purpose

`department.json` is the **top-level manifest** for a generated department — identity, behavioral profiles, asset inventory references, AI team, and unlock rules. One file describes the entire department before any asset is cooked.

---

## Department Manifest Schema

```json
{
  "$schema": "studio.department-generator.v1/department.json",
  "id": "creative-direction",
  "version": "1.0.0",
  "displayName": "Creative Direction Studio™",
  "schemaVersion": "1.0.0",

  "identity": {
    "purpose": "Living creative brain — strategic direction before production",
    "personality": "Editorial luxury atelier — inspired, powerful, supported",
    "category": "creative",
    "metaphor": "The creative brain of the company",
    "emotionalGoals": ["inspired", "curious", "powerful", "supported"]
  },

  "profiles": {
    "lighting": "editorial-three-point-warm",
    "environment": "double-height-stage-atelier",
    "interaction": "physical-verbs-editorial",
    "music": "ambient-editorial-piano-stems",
    "navigation": "zone-exploration-arrival-ceremony",
    "animation": "continuous-ambient-ceremony-weight"
  },

  "roomDnaRef": "room-dna.json",
  "departmentDnaRef": "department-dna-snapshot.json",

  "spatial": {
    "layoutTemplate": "stage",
    "zones": ["brief-wall", "mood-wall", "observatory", "timeline-table", "sandbox", "reference-library", "orb-command"],
    "heroObjectId": "wall-mood-cds",
    "entryZoneId": "arrival-threshold"
  },

  "assets": {
    "manifestRef": "assets.json",
    "count": 45,
    "budgetMB": 120
  },

  "interactions": {
    "manifestRef": "interactions.json",
    "primaryVerbs": ["pin", "annotate", "compare", "branch", "approve", "reject", "scrub", "speak"],
    "ceremonies": ["creative-approval"]
  },

  "aiConcierges": [
    { "roleId": "creative-director", "required": true },
    { "roleId": "brand-concierge", "required": true },
    { "roleId": "research-concierge", "required": false }
  ],

  "orb": {
    "placement": "orb-command-center",
    "capabilities": ["triage", "voice", "route", "suggest", "ceremony-trigger"],
    "pedestalAssetId": "orb-pedestal-cds"
  },

  "unlockRequirements": {
    "companyMaturity": "building",
    "founderStage": ["building", "launching", "growing"],
    "prerequisiteDepartments": [],
    "marketplaceExpansionId": null
  },

  "blueprints": {
    "environment": "environment-blueprint.json",
    "assembly": "assembly-blueprint.json",
    "promptPackage": "prompts/"
  },

  "handoff": {
    "generationInstructionSet": "handoff/generation-instruction-set.json",
    "runtimeAssemblyManifest": "handoff/runtime-assembly-manifest.json"
  },

  "genome": {
    "snapshotId": "genome-snapshot-v1",
    "injectionSlots": ["materialLanguage", "lightingStyle", "editorialDirection", "sonicIdentity"]
  },

  "validation": {
    "goldenDepartment": true,
    "validationProject": "creative-direction-studio-v1"
  }
}
```

---

## Field Reference

| Field | Required | Description |
|-------|----------|-------------|
| `id` | ✓ | Canonical department type ID |
| `identity.purpose` | ✓ | Why this department exists |
| `identity.personality` | ✓ | Atmospheric + behavioral character |
| `profiles.*` | ✓ | Profile IDs for lighting · environment · interaction · music · navigation · animation |
| `roomDnaRef` | ✓ | Link to Room DNA™ snapshot |
| `assets.manifestRef` | ✓ | `assets.json` path |
| `interactions.manifestRef` | ✓ | `interactions.json` path |
| `aiConcierges` | ✓ | Required and optional AI roles |
| `orb` | ✓ | Placement · capabilities · pedestal asset |
| `unlockRequirements` | ✓ | When department appears in HQ |
| `blueprints` | ✓ | Environment · assembly · prompts |
| `handoff` | ✓ | Compiler + Runtime contracts |

---

## Profile ID Registry (Examples)

| Profile Type | Example IDs |
|--------------|-------------|
| `lighting` | `editorial-three-point-warm` · `clinical-cool` · `salon-soft` |
| `environment` | `double-height-stage-atelier` · `workshop-floor` · `executive-suite` |
| `interaction` | `physical-verbs-editorial` · `command-table` · `gallery-inspect` |
| `music` | `ambient-editorial-piano-stems` · `law-firm-hushed` |
| `navigation` | `zone-exploration-arrival-ceremony` · `linear-pipeline` |
| `animation` | `continuous-ambient-ceremony-weight` · `minimal-idle` |

Profiles resolve to full specs in engine compilers ([02–09](../engine/department-generator/README.md)).

---

## Relationship to Engine

| This schema | Engine doc |
|-------------|------------|
| `department.json` identity | `03_DEPARTMENT_DNA.md` |
| `profiles` | Compilers 04–09 |
| `handoff` | `11_ASSET_COMPILER_HANDOFF.md` · `12_RUNTIME_HANDOFF.md` |
| Full zip output | `13_PACKAGE_SPEC.md` |

`department.json` is the **human- and machine-readable index** at generation output root.

---

## Anti-Patterns

| Forbidden | Canonical |
|-----------|-----------|
| Single `background.png` reference | `assets.json` with modular list |
| Embedded FAL prompts in department.json | `prompts/` package + asset blueprints |
| Hardcoded brand colors | `genome.injectionSlots` |
