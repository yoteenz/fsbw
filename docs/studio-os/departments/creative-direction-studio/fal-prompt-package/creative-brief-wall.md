---
schema: studio.department-generator.v1/prompt-file
departmentId: creative-direction
file: creative-brief-wall.md
version: 1.0.0
packageId: pkg-creative-direction-golden-v1
compiledAt: 2026-07-08T00:00:00Z
roomDnaRef: room-dna.json
providerHints: [fal, openai]
negativePromptUniversal: whiteboard, sticky notes, kanban, PowerPoint slide wall, SaaS form
---

# Creative Brief Wall™ — wall-brief-cds

## Purpose

**Strategic anchor** — mission, objective, audience, intent, founder truth pinned where visible during all creative work.

## Asset

| Field | Value |
|-------|-------|
| assetId | wall-brief-cds |
| objectClass | interactive-wall |
| zone | brief-wall |
| reuseCategory | interactive-wall-brief |

## Genome Slots

- {{genome.editorialDirection}}
- {{genome.voice}}

---

## Primary Prompt

Creative Brief Wall full-height left wall, 3.5m wide × 6m tall, matte plaster surface with horizontal brushed brass pin rails every 0.4m, subtle etched section lines demarcating Mission Objective Audience Intent Creative Direction Founder Notes, luxury editorial atelier, physical pin affordance rails, no UI dividers, no digital form layout, {{genome.editorialDirection}} typography character suggested in etched labels, photorealistic 3D wall element, studio lighting, transparent background.

## Negative Prompt

whiteboard, sticky note cluster, kanban columns, PowerPoint slide grid, SaaS briefing form, digital input fields, checkbox UI

---

## Content Sections (Pinned — Not Baked)

| Section | Source |
|---------|--------|
| Mission | Company Genome + Project brief |
| Objective | Project Intent |
| Audience | Project audience + customerEmotions |
| Project Intent | Founder / Creative Direction |
| Creative Direction | Living summary — auto-updates |
| Founder Notes | Voice transcripts, sketches |

---

## Interaction Affordances

- Pin rails — physical stick metaphor
- Section etched lines — subtle, not UI tabs
- Compare split — two brief versions side-by-side
- Voice capture zone near lower rail

---

## Animation

- Pin gentle sway 0.5px (air current)
- Sequential section illuminate on arrival ceremony
- Creative Director ambient note appears on rail when direction shifts

---

## Genome Adaptation

| Register | Expression |
|----------|------------|
| Luxury beauty | Rose-gold rails, soft plaster |
| Law firm | Leather-bound aesthetic, dark walnut |
| Tech minimal | Precise etched lines, steel rails |

---

## Output

- path: zones/brief-wall.glb
- dimensions: 3.5 × 6 × 0.1 m
- stageOrder: 6
