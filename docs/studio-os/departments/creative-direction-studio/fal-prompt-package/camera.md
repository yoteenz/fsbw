---
schema: studio.department-generator.v1/prompt-file
departmentId: creative-direction
file: camera.md
version: 1.0.0
packageId: pkg-creative-direction-golden-v1
compiledAt: 2026-07-08T00:00:00Z
providerHints: [fal, openai]
---

# Camera — Creative Direction Studio™

## Purpose

Arrival · hero · primary work · orb conversation · inspect · ceremony · departure positions. Feeds `camera-paths-cds`.

## Output

- assetId: camera-paths-cds
- format: json
- path: camera/paths.json

---

## Camera Positions

| ID | Focal Length | Position | Purpose |
|----|--------------|----------|---------|
| `arrival-exterior` | 24mm | Outside entry portal | Pre-entry establish |
| `arrival-threshold` | 35mm | Entry portal interior | Arrival ceremony end — mood wall 55% FOV |
| `hero-mood-wall` | 50mm | Center facing mood wall | Hero framing, pin/scrub work |
| `primary-work` | 40mm | Timeline table approach | Default active work camera |
| `timeline-inspect` | 85mm | Close orbit table | Event node detail |
| `sandbox-compare` | 45mm | Sandbox twin screens | Branch comparison |
| `library-browse` | 35mm | Reference library flank | Shelf scroll perspective |
| `observatory-inspect` | 85mm | Observatory alcove | Domain ring zoom |
| `orb-conversation` | 50mm | Orb pedestal medium shot | Voice conversation mode |
| `brief-wall` | 40mm | Left wall approach | Brief review |
| `ceremony-approve` | 35mm | Timeline elevated | Creative approval ceremony |
| `departure` | 28mm | Exit portal path | Leave to next department |

---

## Arrival Sequence Cameras

| Phase | Camera | Motion |
|-------|--------|--------|
| 1 Materialize | arrival-exterior → arrival-threshold | Dolly forward 1.5s |
| 2 Reveal | arrival-threshold rise | Rise 0.5s — mood wall reveal |
| 3 Identity | hero-mood-wall glimpse | Crossfade 1.0s |
| 4 Orb greet | orb-conversation partial | 15° pedestal rotate |
| 5 Settle | primary-work | Descend 1.0s |

Total: 5s standard · 7s first visit with zone reveal.

---

## Transition Specs

| Transition | From → To | Duration | Easing |
|------------|-----------|----------|--------|
| arrival | arrival-exterior → arrival-threshold → primary-work | 5000ms | ceremony-dolly |
| focus-object | any → inspect position | 1200ms | inspect-orbit |
| orb-conversation | primary-work → orb-conversation | 800ms | smooth-shift |
| creative-approval | primary-work → ceremony-approve | 3000ms | ceremony-weight |
| zone-walk | current → target zone default | 1500ms | editorial-pace |
| departure | primary-work → departure | 2000ms | fade-dolly |

---

## Composition Notes (Image Generation Reference)

### arrival-threshold

Wide establishing shot, double-height mood wall dominates upper 55% frame, timeline table center lower third, brief wall left edge, glass exterior right depth, polished floor reflection visible, editorial luxury atelier, 35mm lens character, cinematic framing.

### hero-mood-wall

Mood wall fills frame width, slight low angle emphasizing double height, soft hero key from above, parallax depth planes suggested, 50mm compression, editorial beauty campaign register.

### orb-conversation

Orb and pedestal right of center, timeline table soft background, shallow depth of field on orb, warm accent uplight, conversation intimacy without chat UI overlay.

---

## Reference Plate Generation

Optional FAL plates per position for Asset Compiler mesh alignment validation. Not flattened room — position reference only.
