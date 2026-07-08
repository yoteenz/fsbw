# Object Catalog — Creative Direction Studio™ Alpha

**Discipline owners:** Technical art · Asset production · Environment art  
**Total objects:** 35 modular assets · 120 MB budget · **zero** flattened room

---

## Catalog Law

Every object is **independently mountable · replaceable · generatable**. The room is assembled — not painted as one texture.

---

## Legend

| Source | Meaning |
|--------|---------|
| **GEN** | Alpha generation required |
| **REG** | Registry reuse (exact/adapt) |
| **META** | Metadata / behavior only |
| **SEED** | Content seed — evolves per project |
| **PACK** | Future Pack™ (not Alpha v0.1) |
| **PERM** | Permanent platform object |

| Permanence | Meaning |
|------------|---------|
| **P** | Permanent — Registry golden |
| **E** | Evolves — versioned regen |
| **S** | Session — project-scoped content |

---

## Environment Shell

| Object ID | Display Name | Source | GEN/REG | Perm | Interactive | Notes |
|-----------|--------------|--------|---------|------|-------------|-------|
| `env-shell-cds` | Atelier Shell | GEN | GEN | P | collision | 18×12m envelope · defines all proportions |
| `env-floor-cds` | Polished Floor | GEN | GEN | P | walk | Reflection shader · genome tint |
| `env-ceiling-cds` | Coffered Ceiling | GEN | GEN | P | — | Diffused panel · track slots |
| `env-window-cds` | Glass Exterior Wall | GEN | GEN | E | parallax | Right flank · atmospheric plate |
| `env-alcove-cds` | Observatory Alcove | GEN | GEN | P | zone boundary | Left niche · stone platform |

---

## Navigation & Thresholds

| Object ID | Display Name | Source | GEN/REG | Perm | Interactive |
|-----------|--------------|--------|---------|------|-------------|
| `portal-entry-cds` | Entry Portal | GEN | GEN | P | enter |
| `portal-exit-cds` | Exit Portal | GEN | GEN | P | enter |
| `camera-paths-cds` | Camera Path Splines | META | META | P | — |

---

## Hero & Zone Surfaces

| Object ID | Display Name | Source | GEN/REG | Perm | Interactive |
|-----------|--------------|--------|---------|------|-------------|
| `wall-mood-cds` | Living Mood Wall™ | GEN | GEN | P | **HERO** — pin·cluster·compare |
| `wall-brief-cds` | Creative Brief Wall™ | GEN | GEN | P | pin·annotate·compare |
| `table-timeline-cds` | Project Timeline Table™ | GEN | GEN | P | scrub·branch·approve |
| `table-sandbox-cds` | Creative Sandbox™ | GEN | GEN | E | branch·preview·isolate |
| `shelf-library-cds` | Reference Library™ | GEN | GEN | P | browse·drag·filter |
| `observatory-cds` | Genome Observatory™ | GEN | GEN | P | inspect·compare |
| `screen-compare-cds` | Branch Comparison Screen | GEN | GEN | E | compare·approve |

---

## Intelligence & Orb

| Object ID | Display Name | Source | GEN/REG | Perm | Interactive |
|-----------|--------------|--------|---------|------|-------------|
| `pedestal-orb-cds` | Orb Pedestal | GEN | GEN | P | — |
| `orb-cds` | Studio Orb | REG | REG | **PERM** | speak·navigate |
| `ai-creative-director-cds` | Creative Director Concierge | META | META | PERM | routed via Orb |
| `ai-research-concierge-cds` | Research Concierge | META | META | PERM | reference tagging |
| `ai-brand-concierge-cds` | Brand Concierge | META | META | PERM | genome guard |

---

## Glass · UI Surfaces (Physical Acrylic)

| Object ID | Display Name | Source | GEN/REG | Perm | Interactive |
|-----------|--------------|--------|---------|------|-------------|
| `glass-panels-cds` | Inspect Glass Panels | REG | adapt | P | inspect·context |
| `panel-context-float-cds` | Floating Context Panel | REG | adapt | E | dismiss·inspect |
| `panel-founder-notes-cds` | Founder Notes Panel | GEN | GEN | E | speak·annotate |
| `markers-walk-room-cds` | Walk the Room Markers | META | META | P | critique anchors |

---

## Atmosphere

| Object ID | Display Name | Source | GEN/REG | Perm | Interactive |
|-----------|--------------|--------|---------|------|-------------|
| `lighting-rig-cds` | Editorial Lighting Rig | REG | adapt | P | — |
| `particles-ambient-cds` | Ambient Particles | GEN | GEN | E | — |
| `audio-ambient-cds` | Room Ambient Bed | GEN | GEN | P | — |
| `audio-ceremony-cds` | Approval Stinger | GEN | GEN | P | ceremony |
| `audio-orb-cds` | Orb Acknowledge SFX | GEN | GEN | P | greeting |

---

## Founder Tools & Ceremony

| Object ID | Display Name | Source | GEN/REG | Perm | Interactive |
|-----------|--------------|--------|---------|------|-------------|
| `zone-inspiration-drop-cds` | Inspiration Drop Zone | GEN | GEN | E | reference-drop |
| `pedestal-approval-cds` | Approval Pedestal | GEN | GEN | P | approve·reject |
| `ceremony-approval-cds` | Approval Ceremony Choreography | META | META | PERM | ceremony |

---

## Content Seeds (Evolve per Project)

| Object ID | Display Name | Source | Perm | Notes |
|-----------|--------------|--------|------|-------|
| `seed-mood-cds` | Mood Wall seed content | SEED | S | Boot references |
| `seed-brief-cds` | Brief Wall seed content | SEED | S | Mission · audience |
| `seed-library-cds` | Library seed volumes | SEED | S | Starter shelf |

---

## Pack™ Objects (Future — Not Alpha v0.1)

| Pack | Potential objects | Alpha |
|------|-------------------|-------|
| Luxury Office Pack™ | Executive variant furniture | ○ Phase 2 |
| Creator Pack™ | Extended mood wall templates | ○ Phase 2 |

Alpha uses **default editorial luxury** only.

---

## Modular Assembly Order

```
1. env-shell → floor → ceiling
2. lighting-rig
3. walls (brief · mood) · windows · alcove
4. furniture tables · shelves
5. hero interactive surfaces
6. orb pedestal → orb
7. glass panels · founder panels
8. particles · audio
9. portals · camera paths · markers
10. content seeds hydrate
```

Matches Generation Manager queue — see production docs.

---

## Replacement Rules

| Object | Replaceable without rebuilding room? |
|--------|-----------------------------------|
| Mood Wall mesh | ✓ |
| Floor shader only | ✓ |
| Timeline table | ✓ |
| Entire shell | ✓ — but rare |
| Zone positions | ✗ — layout fixed Alpha v0.1 |
| Orb universal | ✗ — platform permanent |

---

## Alpha Minimum Viable Objects

For first walkable Alpha, **cannot ship without**:

1. `env-shell-cds` · `env-floor-cds` · `env-ceiling-cds`
2. `lighting-rig-cds`
3. `wall-mood-cds` (hero)
4. `wall-brief-cds`
5. `table-timeline-cds`
6. `orb-cds` · `pedestal-orb-cds`
7. `portal-entry-cds`
8. `audio-ambient-cds` · `audio-orb-cds`
9. `camera-paths-cds`

All others: iterative Alpha passes.

---

## Golden Rule Test

> Every visible surface maps to **one catalog object** — no mystery baked background.

Pass: Camera orbit reveals modular depth.  
Fail: Single texture plane is the entire room.

---

_Object catalog — what exists in the room, piece by piece._
