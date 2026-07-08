---
schema: studio.department-generator.v1/prompt-file
departmentId: creative-direction
file: timeline-table.md
version: 1.0.0
packageId: pkg-creative-direction-golden-v1
compiledAt: 2026-07-08T00:00:00Z
roomDnaRef: room-dna.json
providerHints: [fal, openai]
negativePromptUniversal: Gantt chart UI, spreadsheet table, SaaS timeline widget, Excel grid
---

# Project Timeline Table™ — table-timeline-cds

## Purpose

**Temporal command surface** — project evolution, branches, versions, approvals, milestones on glass. Center stage dominant furniture.

## Asset

| Field | Value |
|-------|-------|
| assetId | table-timeline-cds |
| objectClass | timeline-table + glass-table |
| zone | timeline-table |
| reuseCategory | timeline-surface |

## Genome Slots

- {{genome.editorialDirection}}

---

## Primary Prompt

Project Timeline Table center stage command surface, 2.4m × 1.0m thick glass top 40mm apparent depth, brushed metal frame legs, low profile 0.72m height human-scale standing work, horizontal timeline axis etched subtly in glass subsurface, branch ribbon rise zones suggested in glass layers, luxury editorial creative atelier furniture, photorealistic glass refraction and edge glow, {{genome.editorialDirection}} proportion, studio product lighting, transparent background.

## Negative Prompt

Gantt chart screenshot, spreadsheet grid, SaaS project management UI, Excel table, office desk with monitor, plastic laminate top

## Dimensions

| Dimension | Value |
|-----------|-------|
| Width | 2.4 m |
| Depth | 1.0 m |
| Glass thickness | 40 mm apparent |
| Height | 0.72 m surface |

---

## Content Representation (Runtime — Not Baked)

| Element | Visual |
|---------|--------|
| Project evolution | Horizontal timeline event nodes |
| Branches | Parallel glass ribbons rising above surface |
| Versions | Stacked glass sheets per milestone |
| Founder Notes | Floating glass cards on table |
| Approvals | Seal markers on approved nodes |
| Milestones | Elevated crystal nodes |

---

## Interaction Affordances

- Horizontal scrub axis along table length
- Node click targets — glass elevation change
- Branch spawn point — ribbon extrusion origin
- Approve seal position — ceremony focal point

---

## Animation

| Event | Motion |
|-------|--------|
| Item place | Reflection shimmer 400ms |
| Branch spawn | Glass ribbon extrude 600ms |
| Approve | Seal glow bloom |
| Reject | Node fade |

---

## AI Presence

Creative Director + Production Manager — timeline conflict and dependency ambient notes.

---

## Ceremony

**creative-approval** triggers on approve verb — camera travel, seal glow, production unlock.

---

## Output

- path: zones/timeline-table.glb
- dependencies: env-floor-cds, lighting-rig-cds
- stageOrder: 5
- clearance: 1.2m circulation
