# Environment DNA™

**The regeneration blueprint for Living Sets™**

**Version:** 1.0.0  
**Status:** Canonical schema (docs only)  
**Schema ID:** `studio.environment-dna.v1`  
**Predecessor:** [Set DNA™](./set-dna.md) — static environment blueprint  
**Parent:** [Living Sets™](./living-sets.md)

---

## Purpose

**Set DNA™** described a reusable environment profile.

**Environment DNA™** describes a **full regeneration manifest** — the complete instruction set for transforming a department's physical world while preserving its functional framework.

Environment DNA™ is **not** a theme file.

It is the **genetic code of place**.

---

## Set DNA™ → Environment DNA™

| Set DNA™ (v1) | Environment DNA™ (Living Sets™) |
|---------------|-----------------------------------|
| Single static profile | Regenerated per intelligence stack |
| Brand genome influence field | Full Company + Taste + Founder modulation |
| Industry influence | Company Expression System™ integration |
| One emotional target | Stage-aware emotional arc |
| Fixed hero asset | Continuity-aware hero + milestone props |
| Department personality | Orb brief + ambient storytelling |

Set DNA™ remains valid for **Marketplace pack authoring** and **Golden Department™** reference sets.

Living Sets™ runtime uses **Environment DNA™**.

---

## Schema Overview

```json
{
  "environmentDna": {
    "schemaVersion": "studio.environment-dna.v1",
    "livingSetId": "creative-direction/frontal-slayer/launch-week-v3",
    "departmentId": "creative-direction",
    "orgId": "frontal-slayer",

    "frameworkLock": {
      "invariantZones": [
        "arrival-zone",
        "orb-anchor",
        "story-table",
        "mood-wall",
        "founder-review",
        "reference-library",
        "production-pipeline",
        "branch-gallery",
        "timeline"
      ],
      "workflowGraph": "creative-direction-pipeline.v2"
    },

    "intelligenceProvenance": {
      "companyGenomeVersion": "cg-2026-07-08",
      "founderGenomeVersion": "fg-kateena-v4",
      "tasteGenomeVersion": "ftg-luxury-editorial-v2",
      "departmentDnaVersion": "dept-creative-direction-v2",
      "projectGenomeId": "proj-summer-campaign-2026",
      "creativeDirectionId": "cd-locked-vision-12",
      "productionStage": "launch"
    },

    "architecture": { },
    "materials": { },
    "lighting": { },
    "scale": { },
    "furniture": { },
    "displays": { },
    "props": { },
    "heroObjects": { },
    "ambientAudio": { },
    "environmentalStorytelling": { },
    "animations": { },
    "atmosphere": { },
    "interactiveEquipment": { },
    "transitions": { },
    "continuityArtifacts": { },
    "orbBrief": { }
  }
}
```

---

## Framework Lock™

**Non-negotiable.** Every Environment DNA™ must declare invariant zones.

| Zone ID | Physical role | Never |
|---------|---------------|-------|
| `arrival-zone` | First space · reveal | Replaced by dashboard hero |
| `orb-anchor` | Spatial center above Story Table™ | Moved to corner widget |
| `story-table` | Narrative · brief surface | Collapsed into modal |
| `mood-wall` | Taste · references | Reduced to thumbnail strip |
| `founder-review` | Creative Review™ seating | Popup panel |
| `reference-library` | Shelving · canon | Link list |
| `production-pipeline` | Wall board · stage | Sidebar tabs |
| `branch-gallery` | Parallel concepts | Dropdown |
| `timeline` | Production chronology | Footer widget |

Framework Lock™ ensures **workflow identity** survives every company expression.

---

## Regeneration Domains

### Architecture

| Field | Description |
|-------|-------------|
| `envelope` | Editorial atelier · innovation lab · war room · culinary studio |
| `ceilingHeight` | Intimate · double-height · industrial loft |
| `circulation` | Open sightlines · corridor mystery · gallery procession |
| `threshold` | Marble portal · glass airlock · walnut door |
| `structuralCharacter` | Columns · beams · floating planes · vault |

### Materials

| Field | Description |
|-------|-------------|
| `primarySurfaces` | Marble · walnut · brushed steel · terrazzo |
| `secondarySurfaces` | Glass · acrylic · leather · concrete |
| `accentMetals` | Chrome · brass · blackened steel |
| `tactileStory` | What founder touches first |

### Lighting

| Field | Description |
|-------|-------------|
| `key` | Editorial drama · clinical even · warm hospitality |
| `fill` | Soft ambient · cool lab · golden restaurant |
| `rim` | Chrome edge · holographic accent · candle warmth |
| `ceremony` | Approval pulse · Golden Build™ reveal |
| `timeOfDay` | Synced with Headquarters world state |

### Scale

| Field | Description |
|-------|-------------|
| `intimacy` | Boutique atelier vs museum gallery |
| `ceilingBreathing` | Compression vs expansion at arrival |
| `objectHeroScale` | Product plinth size · projection table span |
| `humanProportion` | Founder seat dominance vs egalitarian circle |

### Furniture & Displays

| Field | Description |
|-------|-------------|
| `primaryFurniture` | Story Table™ form · review seating · library stacks |
| `displaySystems` | Product walls · evidence boards · ingredient racks |
| `workstations` | Physical pipeline board · projection table · tasting station |

### Props & Hero Objects

| Field | Description |
|-------|-------------|
| `industryProps` | Wig forms · UX devices · legal binders · mise en place |
| `projectHero` | Active campaign centerpiece |
| `continuityProps` | Awards · milestones · customer artifacts |
| `ambientClutter` | Lived-in credibility — never messy SaaS |

### Ambient Audio

| Field | Description |
|-------|-------------|
| `baseLoop` | Showroom hush · lab hum · kitchen · corridor |
| `environmentalSfx` | Glass clink · keyboard · gavel · sizzle |
| `distantPresence` | Muffled adjacent department · elevator |
| `ceremonyStings` | Approval · Golden Build™ · launch |

### Environmental Storytelling

| Field | Description |
|-------|-------------|
| `narrativePosters` | Campaign · case · menu · product |
| `materialSamples` | Swatches · finishes · ingredients |
| `historicalMarks` | Scuffs · patina · earned wear |
| `founderPersonalization` | Taste-aligned artifacts |

### Animations & Atmosphere

| Field | Description |
|-------|-------------|
| `idleLife` | Dust motes · hologram drift · steam · reflection |
| `interactiveFeedback` | Touch glow · board update · projection response |
| `transitionCharacter` | Door weight · corridor pace |
| `emotionalTarget` | Inspired · focused · celebratory · reflective |

### Interactive Equipment

| Field | Description |
|-------|-------------|
| `moodWallTech` | Holographic pins · physical cork · projection |
| `pipelineInterface` | Physical board · light table · digital hybrid |
| `reviewTools` | Annotated glass · collaborative table |
| `branchComparison` | Gallery frames · lightbox wall |

---

## Continuity Artifacts Block

Links Environment DNA™ to [Set Continuity™](./set-continuity.md):

```json
"continuityArtifacts": {
  "milestones": [
    { "id": "golden-build-03", "placement": "hero-shelf-east", "stage": "golden-build" },
    { "id": "launch-week-campaign", "placement": "mood-wall-center", "stage": "launch" }
  ],
  "historicalPatina": "moderate",
  "archiveEligible": true
}
```

---

## Orb Brief Block

```json
"orbBrief": {
  "arrivalLine": "Welcome back to your luxury editorial atelier.",
  "transformationSummary": "Reconfigured around Frontal Slayer's identity.",
  "tasteNote": "Reflects your preference for chrome and editorial lighting.",
  "continuityNote": "Your last three Golden Builds™ are on the east shelf.",
  "stageNote": "Launch week — the room is in celebration posture."
}
```

---

## Generation Inputs

Environment DNA™ is **never hand-authored per session**.

| Input | Engine |
|-------|--------|
| Intelligence stack | [Department Transformation Engine™](./department-transformation-engine.md) |
| Company expression | [Company Expression System™](./company-expression-system.md) |
| Stage evolution | [Set Continuity™](./set-continuity.md) |
| HQ context | [Headquarters Evolution™](./headquarters-evolution.md) |
| Archive lineage | [Archive Integration™](./archive-integration.md) |

---

## Validation Rules

1. **Framework Lock™** — all invariant zones present
2. **Provenance** — every genome version recorded
3. **No theme-only diff** — regeneration must touch ≥3 domains (architecture · materials · lighting minimum)
4. **Company recognizability** — blind shoulder test must pass
5. **Stage honesty** — props match actual production stage
6. **Taste alignment score** — ≥ threshold or Orb flags refinement
7. **Archive snapshot** — major versions auto-eligible

---

## Anti-Patterns

| Anti-pattern | Violation |
|--------------|-----------|
| `primaryColor: #fff` only | Theme swap — not Environment DNA™ |
| Omitting frameworkLock | Breaks Living Sets™ law |
| Static Environment DNA per org | Must evolve with Set Continuity™ |
| Copy-paste Set DNA™ without regeneration | Loses intelligence stack |

---

## Relationship to Canon

| Document | Relationship |
|----------|--------------|
| [Set DNA™](./set-dna.md) | Predecessor schema |
| [Department Transformation Engine™](./department-transformation-engine.md) | Compiler |
| [Living Architecture™](./living-architecture.md) | Architectural domain detail |
| [Studio Asset Compiler™](../engines/studio-asset-compiler/) | Asset generation from DNA |

---

## Implementation Status

**Docs only.** Schema definition — no codegen this sprint.
