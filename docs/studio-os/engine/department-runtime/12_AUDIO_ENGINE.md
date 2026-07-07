# 12 — Audio Engine

**Engine Module:** `studio.department-runtime.v1.audio`  
**Status:** Spatial audio specification  
**Parent:** SDK [09 — Audio Standard](../../sdk/09_AUDIO_STANDARD.md)

---

## Definition

The **Audio Engine** mixes department ambience, interaction SFX, ceremonies, Orb voice, and adaptive music with Genome-driven character and Experience DNA density.

---

## Audio Layers

| Layer | Source | Loop | Volume |
|-------|--------|------|--------|
| Ambient environment | `ambient-loop.ogg` | Yes | 15–25% |
| Department ambience | Optional second layer | Yes | 10–20% |
| Environmental SFX | Object interactions | No | 20–30% |
| Interaction feedback | Verb confirmation | No | 30–40% |
| Notifications | AI, blockers | No | 30–40% |
| Ceremony | Approval, launch | No | 50–70% |
| Orb voice | TTS | No | 70–80% |
| Celebration | Launch | No | 60–80% |

---

## Adaptive Behavior

| Condition | Adaptation |
|-----------|------------|
| Ceremony active | Duck ambient to 10–30% |
| Orb speaking | Duck all to 10% except voice |
| Voice mode | Duck ambient to 10% |
| Late hours (Life & Culture) | Ambient −50% |
| Quiet mode preference | Ambient muted |
| Zone change | Subtle environmental texture shift |
| Genome musicStyle change | Crossfade ambient track |

---

## Spatial Audio

| Source | Spatial |
|--------|---------|
| Orb voice | 3D at Orb position |
| Object SFX | 3D at object |
| Ambient | Global |
| Ceremony | Global with room reverb |

---

## Audio State Machine

```
SILENT (LOADING)
    ↓ fade in 2s
AMBIENT_ACTIVE
    ↓ verb feedback
AMBIENT + SFX
    ↓ ceremony
CEREMONY (ducked ambient)
    ↓ complete
AMBIENT_ACTIVE
    ↓ departure
CROSSFADE_OUT
```

---

## Genome Selection

Runtime selects audio character from Genome `musicStyle` and `soundDesign` — may swap tracks on Genome refresh without asset recompile when alternate tracks exist in package.

---

## Silence Rules

Per SDK 09 — silence is designed:

- Pre-decision ceremony zone: ambient ducks to 30%
- Contemplative Genome: ambient at 50%
- Recording mode: all ducked to 10%

---

_Next: [13 — Genome Injection](./13_GENOME_INJECTION.md)_
