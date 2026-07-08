---
schema: studio.department-generator.v1/prompt-file
departmentId: creative-direction
file: genome-observatory.md
version: 1.0.0
packageId: pkg-creative-direction-golden-v1
compiledAt: 2026-07-08T00:00:00Z
roomDnaRef: room-dna.json
providerHints: [fal, openai]
negativePromptUniversal: settings page, JSON viewer, dashboard analytics, pie chart UI, admin panel
---

# Company Genome Observatory™ — observatory-cds

## Purpose

**Visualize living Company Genome** — not a text settings page. Founder sees company DNA as living constellation.

## Asset

| Field | Value |
|-------|-------|
| assetId | observatory-cds |
| objectClass | interactive-object |
| zone | observatory |
| reuseCategory | genome-observatory |

## Genome Slots

- {{genome.brandDNA}}
- {{genome.values}}
- {{genome.experienceDNA}}

---

## Primary Prompt

Company Genome Observatory hemispherical glass display vessel 1.2m diameter on stone pedestal 1.5m total height, left alcove placement, abstract visualization interior with orbiting domain rings and central mission core glow, frosted glass hemisphere with subtle internal luminous data streams, luxury editorial atelier sculptural object, living data metaphor not literal charts, photorealistic glass and stone materials, studio lighting, transparent background.

## Negative Prompt

settings screen, JSON code display, dashboard pie charts, admin analytics panel, spreadsheet data, raw text labels floating

---

## Visualized Domains (Runtime Content)

| Domain | Visualization |
|--------|---------------|
| Mission | Central core glow |
| Values | Orbiting principle ring nodes |
| Brand DNA | Material texture samples on ring |
| Experience DNA | Motion trails |
| Voice | Waveform ribbon |
| Photography | Thumbnail constellation |
| Lighting | Temperature gradient arc |
| Emotion | Color field aura |

**Rule:** Never raw JSON — always visual metaphor.

---

## Physical Form

- Left alcove — env-alcove-cds
- Hemispherical glass 1.2m diameter
- Stone pedestal base
- Surrounding wall: subtle data streams to Brief Wall + Mood Wall

---

## Interaction Affordances

- Inspect zoom into domain ring
- Compare Genome snapshot vs Project overlay
- Speak — Orb explains domain
- Pin insight flies to Brief Wall
- Scrub — manual ring orbit

---

## Animation

| Behavior | Spec |
|----------|------|
| Ring orbit | 20s per ring continuous |
| Domain pulse | On Genome update |
| Ring expansion | On new learning from Creative Direction |
| Data streams | Particles along alcove wall channels |

---

## AI Presence

**Brand Concierge** guards Observatory — flags Project directions diverging from Genome.

---

## Behavior

- Domains pulse when Genome updates
- New learning causes ring expansion animation
- Compare mode overlays Project direction against Genome baseline

---

## Output

- path: zones/observatory.glb
- dependencies: env-alcove-cds
- stageOrder: 6
