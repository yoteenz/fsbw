---
schema: studio.department-generator.v1/prompt-file
departmentId: creative-direction
file: mood-wall.md
version: 1.0.0
packageId: pkg-creative-direction-golden-v1
compiledAt: 2026-07-08T00:00:00Z
roomDnaRef: room-dna.json
providerHints: [fal, openai]
negativePromptUniversal: whiteboard, cork board, kanban, sticky notes, pinterest grid UI, dashboard widget wall
---

# Living Mood Wall™ — wall-mood-cds

## Purpose

**Hero object** — infinite inspiration surface, emotional and visual heart of Creative Direction Studio™. Occupies 55% vertical FOV from entry.

## Asset

| Field | Value |
|-------|-------|
| assetId | wall-mood-cds |
| objectClass | mood-wall |
| zone | mood-wall |
| reuseCategory | interactive-wall-hero |

## Room DNA

- creativity: 0.95 → exploratory artistic surface
- glass: 0.80 → frosted depth planes
- luxury: 0.92 → editorial beauty register

## Genome Slots

- {{genome.photographyDirection}}
- {{genome.customerEmotions}}

---

## Primary Prompt

Living Mood Wall hero surface, entire double-height back wall, floor-to-ceiling infinite inspiration canvas, continuous surface without frames between references, three parallax depth planes suggested in frosted glass layers, luxury editorial creative atelier, pin-ready surface with subtle rail detail, soft internal glow in hero key light, gallery-scale proportions 14m wide × 5.5m tall, photorealistic 3D architectural element, studio lighting, {{genome.photographyDirection}} character, {{genome.customerEmotions}} mood register.

## Negative Prompt

whiteboard, cork board, kanban board, sticky note grid, Pinterest UI mockup, dashboard analytics wall, framed poster grid, stock photo collage template, SaaS moodboard widget

## Generation Parameters

| Parameter | Value |
|-----------|-------|
| aspect_ratio | 21:9 |
| output_type | mesh + content-plane metadata |
| format | glb |

---

## Physical Form

- Full back wall, double height
- Continuous surface — no frames between references
- 3 depth planes for parallax (foreground · mid · back)
- Archive shelf zone below main canvas for rejected references

---

## Interaction Affordances (Visual Hints)

- Pin zones without literal UI buttons
- Cluster ring suggestion on multi-select
- Split-line etching for compare mode
- Horizontal scrub affordance — infinite canvas implication
- Approve glow tier — promoted references brighter

---

## Animation Behavior

| Behavior | Spec |
|----------|------|
| Parallax drift | 0.5px/s depth planes |
| Color breathe | 8s temperature cycle synced to Project mood |
| Pin land | Stick-bounce 400ms |
| Reject | Dissolve toward archive shelf |
| Approve | Reference glow — direction tier |

---

## Supported Reference Categories

Social · Design · Photography · Packaging · UI · Motion · Audio · Material · Typography · Product — rendered on content planes, not baked into mesh.

---

## Intelligence

Research Concierge auto-tags: lighting, composition, mood, materials, typography, motion, luxury cues, palette, hierarchy.

---

## Output

- path: zones/mood-wall.glb
- dependencies: env-shell-cds, lighting-rig-cds
- stageOrder: 6
