---
schema: studio.department-generator.v1/prompt-file
departmentId: creative-direction
file: furniture.md
version: 1.0.0
packageId: pkg-creative-direction-golden-v1
compiledAt: 2026-07-08T00:00:00Z
roomDnaRef: room-dna.json
providerHints: [fal, openai]
negativePromptUniversal: office cubicle, IKEA desk, rolling chair, monitor arm, generic conference table
---

# Furniture — Creative Direction Studio™

## Purpose

Zone furniture placement rules and per-object generation prompts. Human-scale standing workspace — not seated SaaS desk.

## Room DNA Modifier

Bespoke editorial furniture, low-profile luxury, no office cubicle aesthetics — {{roomDna.promptModifiers.furniture}}

---

## Layout Rules

| Zone | Furniture | Placement Rule |
|------|-----------|----------------|
| timeline-table | table-timeline-cds | Center stage, dominant, 0.72m height |
| sandbox | table-sandbox-cds, screen-compare-cds | Behind timeline, lower elevation, subordinate |
| reference-library | shelf-library-cds | Right flank, wall-adjacent |
| orb-command | pedestal-orb-cds | Elevated right of center, Y=0.55 |
| brief-wall | wall-brief-cds | Left wall flush — see creative-brief-wall.md |
| mood-wall | wall-mood-cds | Hero back wall — see mood-wall.md |

Clearance: 1.2m around timeline table for circulation.

---

## table-timeline-cds — Project Timeline Table™

See dedicated: [timeline-table.md](./timeline-table.md)

---

## table-sandbox-cds — Creative Sandbox™

### Prompt

Creative Sandbox secondary glass work surface, frosted glass when inactive, lower elevation behind main timeline table, matte white Corian-equivalent edge, brushed metal legs, luxury editorial experimentation zone, photorealistic 3D asset, studio product lighting, transparent background.

### Negative

office desk, cubicle partition, monitor stand

### Output

- dimensions: 1.8 × 0.9 × 0.65 m
- format: glb

---

## shelf-library-cds — Reference Library™

### Prompt

Reference Library open shelving unit, walnut or brushed steel, luxury design archive aesthetic, vertical touch surface integrated, categorized spine labels, right flank placement, editorial atelier register, photorealistic 3D asset, {{genome.materialLanguage}}.

### Dimensions

4.0 × 3.5 × 0.6 m

### Output

- format: glb
- zone: reference-library

---

## screen-compare-cds — Comparison Screens

See: [objects.md#compare-screens](./objects.md)

---

## Pedestal (Orb)

See: [orb.md#pedestal](./orb.md)

---

## Optional Seating

Genome-dependent — luxury brands only. Alcove near Observatory. Low-profile editorial bench, velvet or linen upholstery, {{genome.materialLanguage}}. Not required for v1 package.
