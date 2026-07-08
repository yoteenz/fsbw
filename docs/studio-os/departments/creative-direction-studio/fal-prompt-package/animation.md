---
schema: studio.department-generator.v1/prompt-file
departmentId: creative-direction
file: animation.md
version: 1.0.0
packageId: pkg-creative-direction-golden-v1
compiledAt: 2026-07-08T00:00:00Z
providerHints: []
---

# Animation — Creative Direction Studio™

## Purpose

Motion personality · ceremony cues · idle behavior · event catalog. Profile: `continuous-ambient-ceremony-weight`.

## Principles

- Editorial pace — slow, confident, no snappy SaaS transitions
- Physical metaphor — pins stick, ribbons rise, glass refracts
- Ambient always-on — sub-perceptual breathe
- Ceremony weight — approval slower and louder than daily verbs
- {{genome.experienceDNA}} pacing multiplier 0.8–1.2×

---

## Continuous Ambient Motion

| Element | Animation | Rate | Zone |
|---------|-----------|------|------|
| Mood Wall parallax | Depth plane drift | 0.5px/s | mood-wall |
| Mood Wall breathe | Color temperature oscillation | 8s cycle | mood-wall |
| Floor reflection | Shimmer on light movement | synced to key | global |
| Particles | Ambient dust rise + fade | slow | mood-wall |
| Window exterior | Cloud/sky shift | 120s cycle | right flank |
| Observatory rings | Node orbit | 20s/ring | observatory |
| Glass table | Reflection shimmer on place | 400ms trigger | timeline-table |
| Brief pins | Gentle sway (air current) | 0.5px amplitude | brief-wall |
| Orb idle | Glow breathe | 4s cycle | orb-command |
| Library spines | Highlight on browse | inertia follow | reference-library |

---

## Arrival Ceremony — creative-direction-arrival

| Phase | Motion | Duration |
|-------|--------|----------|
| Materialize | Floor reflection fade in | 500ms |
| Reveal | Camera dolly forward + rise | 1500ms |
| Identity | Mood Wall crossfade, Brief pins illuminate sequential | 1000ms |
| Orb greeting | Pedestal rotate 15°, Orb pulse | 1000ms |
| Settle | Camera descend to primary-work | 1000ms |

**Total:** 5000ms · 7000ms first visit

---

## Event Motion

### Pin Land (400ms ease-out)

1. Asset flies from cursor to wall/table plane
2. Stick-bounce — 8px overshoot, settle
3. Shadow deepens, tag shimmer

### Branch Spawn (600ms)

1. Timeline node glow
2. Glass ribbon extrudes upward 40mm
3. Etched label fades in

### Approve Ceremony (3000ms)

1. Camera travel to ceremony-approve position
2. Seal glow bloom on direction node
3. Ceiling grid accent pulse
4. Audio ceremony stamp sync

### Reject Dissolve (800ms)

1. Reference/node opacity fade
2. Particle scatter toward library archive shelf
3. Library spine animate receive

### Sandbox Promote (1200ms)

1. Sandbox concept lift
2. Ribbon merge into timeline main path
3. Sandbox refrost

---

## Orb State Animations

| State | Animation |
|-------|-----------|
| idle | Glow breathe 4s |
| listening | Ring brighten, particles gather |
| thinking | Inner swirl 1.2s |
| speaking | Pulse sync to voice |
| routing | Flash toward target zone |
| ceremony | Ring expand, elevated glow |

---

## Reduced Motion Fallback

| Verb | Fallback |
|------|----------|
| scrub | Discrete step — no inertia |
| parallax | Static depth layers |
| stick-bounce | Instant land |
| ceremony | Static seal — no camera travel |
| particles | Off |
| continuous breathe | Off |

All verbs remain functional.

---

## Ceremony {#ceremony}

### creative-approval

- Trigger: approve verb on timeline-table
- Duration: 3000ms
- Contract: project.commitCreativeApproval
- Audio: audio-ceremony-cds
- Production unlock signal on complete
