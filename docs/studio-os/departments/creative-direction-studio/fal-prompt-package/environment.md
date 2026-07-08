---
schema: studio.department-generator.v1/prompt-file
departmentId: creative-direction
file: environment.md
version: 1.0.0
packageId: pkg-creative-direction-golden-v1
compiledAt: 2026-07-08T00:00:00Z
roomDnaRef: room-dna.json
providerHints: [fal, openai]
negativePromptUniversal: dashboard, card grid, sidebar, white void, stock photo banner, UI chrome, SaaS office, cubicle furniture
---

# Environment — Creative Direction Studio™

## Purpose

Overall room character — floor · atmosphere · composition · scale. Establishes the double-height editorial atelier envelope before zone objects load.

## Room DNA Modifiers

- luxury: 0.92 → premium materials, ceremony weight, generous negative space
- warmth: 0.75 → inviting gallery register, not clinical
- creativity: 0.95 → exploratory artistic atmosphere
- glass: 0.80 → reflection depth, luminous surfaces

## Genome Slots

- {{genome.materialLanguage}}
- {{genome.editorialDirection}}
- {{genome.lightingStyle}}

---

## Primary Prompt

Double-height editorial creative atelier, luxury architecture studio headquarters, Stage layout 3:2 proportion, generous horizontal sweep, polished stone floor with deep reflection, gallery-white hero wall zone, warm material honesty, photorealistic architectural interior visualization, 8K detail, cinematic editorial grade, human-scale standing workspace, no office cubicles, no computer monitors as furniture.

## Negative Prompt

dashboard, card grid, sidebar navigation, white void, stock photo banner, UI chrome, SaaS office, fluorescent overhead panels, cubicle partitions, generic conference room, flat background plate

## Generation Parameters

| Parameter | Value |
|-----------|-------|
| aspect_ratio | 16:9 |
| resolution | 2048×1152 |
| style | architectural-interior-editorial |
| output_type | environment-reference-plate |

---

## Floor

### Prompt

Polished stone floor, wide-plank alternative acceptable, deep reflection capturing hero wall glow, subtle grain direction leading to timeline table center, luxury editorial atelier, photorealistic PBR material, {{genome.materialLanguage}} surface character, no carpet, no vinyl office tile.

### Output

- assetId: env-floor-cds
- format: shader + normal map
- dimensions: 18 × 12 m

---

## Atmosphere

### Prompt

Gallery air atmosphere — clean, faint material warmth, three depth planes visible: foreground timeline zone, midground shelving, background hero mood wall, gold dust motes suggestion in hero light cone, floor reflects mood wall ambient glow, intentional temperature from {{genome.lightingStyle}}.

### Output

- feeds: particles-ambient-cds, vfx.md

---

## Composition

### Prompt

Framing from entry threshold: Living Mood Wall occupies 55% vertical field of view, Timeline Table center stage dominant horizontal element, Brief Wall left anchor, glass exterior right flank depth, Orb pedestal visible within 2 seconds of entry sightline, severe negative space — no clutter, editorial restraint.

### Rules

- Hero sightline: entry → mood wall → timeline table
- Orb peripheral during table work, focal during conversation
- Sandbox visually subordinate — lower elevation behind timeline

---

## Scale Reference

| Element | Height |
|---------|--------|
| Hero ceiling zone | 6.5 m equivalent |
| Work zone ceiling | 3.2 m equivalent |
| Timeline table surface | 0.72 m |
| Orb pedestal top | 0.9 m + 0.15 m float |
| Human scale | Standing / leaning — not seated SaaS desk |
