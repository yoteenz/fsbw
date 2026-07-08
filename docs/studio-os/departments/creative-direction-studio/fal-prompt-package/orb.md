---
schema: studio.department-generator.v1/prompt-file
departmentId: creative-direction
file: orb.md
version: 1.0.0
packageId: pkg-creative-direction-golden-v1
compiledAt: 2026-07-08T00:00:00Z
roomDnaRef: room-dna.json
providerHints: [fal, openai]
negativePromptUniversal: chat bubble, speech balloon, floating UI widget, Alexa device, generic sci-fi hologram
---

# Studio Orb — orb-cds + pedestal-orb-cds

## Purpose

**Permanent intelligence anchor** — voice, route, generate, navigate. Not a chat bubble.

---

## orb-cds — Studio Orb

### Asset

| Field | Value |
|-------|-------|
| assetId | orb-cds |
| objectClass | orb |
| zone | orb-command |
| reuseCategory | orb-universal |

### Genome Slots

- {{genome.voice}}

### Primary Prompt

Studio Orb luminous sphere 0.12m diameter, floats 0.15m above pedestal, soft internal glow with breathe rhythm, luxury editorial intelligence object, subtle surface depth, no literal face, no chat UI, no speech balloon shape, photorealistic 3D product, studio lighting, {{genome.accentColor}} glow tint, transparent background.

### Negative Prompt

chat bubble, speech balloon, floating help widget, Alexa cylinder, Siri orb knockoff, generic hologram UI, robot face

### States (Animation)

| State | Visual |
|-------|--------|
| idle | Slow breathe glow 4s |
| listening | Ring brightens, particles gather |
| thinking | Inner swirl 1.2s |
| speaking | Pulse sync to voice |
| routing | Brief flash toward target zone |
| ceremony | Elevated glow, ring expand |

### Output

- path: intelligence/orb.glb
- dependencies: pedestal-orb-cds

---

## pedestal-orb-cds — Orb Pedestal {#pedestal}

### Asset

| Field | Value |
|-------|-------|
| assetId | pedestal-orb-cds |
| objectClass | orb-pedestal |
| zone | orb-command |

### Primary Prompt

Orb Command Center pedestal, stone or brushed metal cylinder 0.9m height 0.5m diameter, command ring etched on top surface for touch activation, Genome accent glow ring uplight channel, luxury editorial atelier furniture, sculptural intelligence anchor, photorealistic 3D, studio lighting, transparent background.

### Placement

- Position: X=0.35, Y=0.55, Z=0.4
- Visible from entry within 2 seconds
- Peripheral during table work, focal during conversation

### Negative Prompt

desk stand, monitor arm, speaker box, generic plinth with logo

### Output

- path: intelligence/orb-pedestal.glb
- stageOrder: 6

---

## Orb Capabilities

triage · voice · route · suggest · ceremony-trigger · generate-alternatives · navigate-departure

---

## Example Voice Routes

| Command | Target Zone |
|---------|-------------|
| "Find stronger references" | reference-library |
| "Generate three luxury directions" | sandbox |
| "Approve this direction" | timeline-table + ceremony |
| "Take me to Storyboarding" | departure-threshold |
| "What does our brand say about lighting?" | observatory |

---

## Audio

- assetId: audio-orb-cds
- Idle hum, listen activation, voice bed — Runtime audio manifest
