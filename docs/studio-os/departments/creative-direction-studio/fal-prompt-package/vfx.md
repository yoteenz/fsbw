---
schema: studio.department-generator.v1/prompt-file
departmentId: creative-direction
file: vfx.md
version: 1.0.0
packageId: pkg-creative-direction-golden-v1
compiledAt: 2026-07-08T00:00:00Z
roomDnaRef: room-dna.json
providerHints: [fal, openai]
negativePromptUniversal: heavy fog, smoke machine, disco particles, lens flare abuse
---

# VFX — Creative Direction Studio™

## Purpose

Particles · haze · depth · ambient motion layers. Feeds `particles-ambient-cds` and atmosphere assembly.

## Room DNA

- luxury: 0.92 → gold dust motes in hero light
- minimalism: 0.68 → restrained particle density
- {{genome.experienceDNA}} multiplies intensity 0.8–1.2×

---

## Primary Prompt

Subtle gold dust motes floating in hero key light cone above mood wall, slow rise and fade particle field, gentle volumetric haze near ceiling coffer, depth haze separating foreground timeline from background hero wall, floor reflection shimmer synced to light movement, editorial luxury atmosphere, not heavy fog, photorealistic subtle VFX.

## Negative Prompt

heavy fog, smoke machine effect, disco glitter, excessive lens flare, snow, rain indoors, sci-fi hologram noise

## Output

- assetId: particles-ambient-cds
- format: json (particle system definition)
- path: particles/ambient.json
- zone: mood-wall (hero cone) + global subtle

---

## Particle Layers

| Layer | Zone | Rate | Character |
|-------|------|------|-----------|
| Hero dust | mood-wall | 12 particles/s | Gold motes, slow rise 0.3m/s, 4s life |
| Ambient haze | ceiling coffer | volume fill | 5% opacity, warm tint |
| Floor shimmer | env-floor | on light move | Reflection ripple 0.2 amplitude |
| Orb gather | orb-command | on listen state | Particles drift toward orb |

---

## Window Exterior VFX

| Effect | Cycle | Notes |
|--------|-------|-------|
| Sky breathe | 120s | Slow cloud/sky shift on exterior plate |
| Parallax | 0.3× foreground | Exterior moves slower than interior |

Not video loop — Genome-driven still with subtle animation.

---

## Observatory VFX

| Effect | Trigger |
|--------|---------|
| Ring node orbit | Continuous 20s per ring |
| Domain pulse | On Genome update |
| Data stream particles | Alcove wall channels to Brief + Mood |

---

## Ceremony VFX

| Ceremony | VFX |
|----------|-----|
| creative-approval | Seal glow bloom, ceiling grid pulse |
| pin land | Stick-bounce shadow deepen, tag shimmer |
| reject | Dissolve particle scatter toward library |
| branch spawn | Glass ribbon extrusion glow trail |

---

## Reduced Motion

All continuous VFX off. Pin land instant. Ceremony static seal. Particles disabled. Verbs remain functional.
