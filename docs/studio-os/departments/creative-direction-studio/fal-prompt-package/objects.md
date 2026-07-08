---
schema: studio.department-generator.v1/prompt-file
departmentId: creative-direction
file: objects.md
version: 1.0.0
packageId: pkg-creative-direction-golden-v1
compiledAt: 2026-07-08T00:00:00Z
providerHints: [fal, openai]
negativePromptUniversal: UI mockup, flat icon, screenshot, dashboard widget
---

# Objects — Creative Direction Studio™

## Purpose

Secondary and supporting object prompts not covered by dedicated zone files. Modular 3D assets — transparent background product shots for mesh generation.

---

## glass-panels-cds — Inspect Overlay Panels

### Prompt

Frosted glass floating inspect panel, subtle Genome tint, rounded editorial corners, refractive edge glow, luxury UI-surface-as-furniture metaphor, no literal buttons, photorealistic glass object, studio lighting, transparent background.

### Output

- format: glb
- reuse: glass-inspect-panels

---

## screen-compare-cds — Compare Screens {#compare-screens}

### Prompt

Twin frosted glass comparison screens, side-by-side sandbox panels, slim brushed metal frames, slider compare affordance suggested in frosted etching, luxury editorial atelier, photorealistic 3D pair, studio product lighting, transparent background.

### Dimensions

0.8 × 1.2 × 0.05 m each

### Output

- format: glb
- zone: sandbox

---

## portal-entry-cds / portal-exit-cds

### Prompt

Editorial metal portal threshold frame, brushed brass or steel, minimal luxury atelier doorframe without literal door, threshold line on floor, photorealistic architectural detail, 2m × 2.8m, transparent background optional.

---

## seed Content Objects (Metadata — Not Meshes)

| Asset | Type |
|-------|------|
| seed-mood-cds | Genome-default mood wall pin references |
| seed-brief-cds | Project brief template section pins |
| seed-library-cds | Starter reference shelf entries |

Content seeds are JSON metadata — not FAL mesh generation.

---

## Universal Object Rules

1. Every object = independent glb with replaceable: true
2. Interaction on mesh forbidden — see interaction-manifest.json
3. Genome slots per asset-manifest.json
4. Negative: no UI screenshots, no flat icons as 3D stand-ins

---

## Dedicated Object Prompts

| Object | Dedicated File |
|--------|----------------|
| Living Mood Wall™ | [mood-wall.md](./mood-wall.md) |
| Creative Brief Wall™ | [creative-brief-wall.md](./creative-brief-wall.md) |
| Timeline Table™ | [timeline-table.md](./timeline-table.md) |
| Genome Observatory™ | [genome-observatory.md](./genome-observatory.md) |
| Studio Orb + Pedestal | [orb.md](./orb.md) |
