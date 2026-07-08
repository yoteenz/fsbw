# Layer Architecture™

**The 10 Layers of Scene Stack™**

---

## Layer 01 — Environment Shell™

| Attribute | Value |
|-----------|-------|
| **Contains** | Walls · ceiling · floor · proportions · structural architecture |
| **Excludes** | Furniture · hero objects · lighting FX · atmosphere · UI |
| **Regeneratable alone** | ✅ |
| **Maps to production group** | `environment` |

The room exists — empty of story.

---

## Layer 02 — Signature Landmark™

| Attribute | Value |
|-----------|-------|
| **Contains** | Department hero object per [Architectural Icons™](../architectural-icons/department-landmarks.md) |
| **CDS** | Story Table™ at `story-table` station |
| **Excludes** | Full room rebuild · UI |
| **Maps to** | `hero-objects` |

---

## Layer 03 — Furniture & Physical Objects™

Workstations · shelving · desks · props — not architecture.

---

## Layer 04 — Lighting Systems™

Compositing pass: `mix-blend-mode: soft-light`

Key · fill · accent · coffer glow · reflection pools.

---

## Layer 05 — Atmospheric Systems™

Compositing pass: `mix-blend-mode: screen`

Volumetric haze · depth · air quality.

---

## Layer 06 — Surface Materials & Detail™

Compositing pass: `mix-blend-mode: overlay`

Bronze · stone · glass · brushed metal richness.

---

## Layer 07 — Ambient Motion™

Compositing pass: animated opacity/scale

Idle life shimmer — not Cursor CSS architecture.

---

## Layer 08 — Interaction Layer™ (Cursor)

| Attribute | Value |
|-----------|-------|
| **Owner** | Cursor |
| **Generatable** | ❌ |
| **Contains** | Hotspots · glass input panels · Orb speech · pipeline UI |

Placed **inside** the composed world — invisible to layer generation.

---

## Layer 09 — Runtime Effects™ (Cursor)

| Attribute | Value |
|-----------|-------|
| **Owner** | Cursor |
| **Generatable** | ❌ |
| **Contains** | Vignette · review mode wash · state-driven overlays |

No architectural fakery.

---

## Layer 10 — Founder Personalization™

Genome-adapted accents · brand expression overlay.

`mix-blend-mode: color` — adapts without rebuilding shell.

---

## Z-Order & Blend Table

| Layer | z-index | blend-mode | opacity |
|-------|---------|------------|---------|
| Environment Shell | 1 | normal | 1 |
| Signature Landmark | 2 | normal | 1 |
| Furniture | 3 | normal | 1 |
| Lighting | 4 | soft-light | 0.85 |
| Atmospheric | 5 | screen | 0.55 |
| Surface Materials | 6 | overlay | 0.45 |
| Ambient Motion | 7 | screen | 0.35 |
| Founder Personalization | 8 | color | 0.25 |
| Runtime Effects | 9 | — | CSS only |
| Interaction | 10+ | — | DOM |

---

## Forbidden Pattern

❌ Single prompt: *"Generate complete luxury creative studio with table wall lighting furniture"*

✅ Seven prompts — one per visual layer — composed at runtime.
