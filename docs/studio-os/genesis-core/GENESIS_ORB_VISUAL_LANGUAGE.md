# Genesis Orb — Visual Language Guide

**Version:** 1.0.0  
**Canonical direction:** Direction A — Luminous Crystal Nucleus (pending founder review)

---

## Design intent

The Genesis Orb contains a **warm, intelligent star** inside **precision-cut milky crystal** — alive, powerful, luxurious, unmistakably Studio OS.

**Reference sensation only:** Deep internal illumination (object lit from within) — **not** Xbox symbol, X cutout, green, or external brand silhouette.

---

## Five-layer material architecture

Render order (back → front):

### Layer 1 — Inner Energy Core

| Property | Spec |
|----------|------|
| Color | `#FFFFFF` center → `#FFF9EE` edge |
| Brightness | Strongest at geometric center |
| Edge | No hard bulb circle — gaussian falloff |
| Motion | Slow internal drift (6–8s breathe) |
| Size | ~35% of orb diameter |

### Layer 2 — Energy Diffusion

| Property | Spec |
|----------|------|
| Color | `#FFFDF8`, `#F8EEDB` (champagne tint, not yellow) |
| Falloff | Volumetric — multiple overlapping soft gradients |
| Bloom | Controlled `filter: blur()` — not oversized halo |
| Motion | Cloud-like displacement, 0.5–1px amplitude |
| Anti-pattern | Single CSS `radial-gradient(circle, white, transparent)` |

### Layer 3 — Translucent Crystal Body

| Property | Spec |
|----------|------|
| Material | Milky translucent — `rgba(255,253,248,0.45)` |
| SSS | Approximate via inset shadows + secondary radial |
| Refraction | Offset highlight at 25% 20% — not centered |
| Depth | Slight inner shadow at equator |
| Anti-pattern | Flat frosted glass bubble |

### Layer 4 — Clear Protective Shell

| Property | Spec |
|----------|------|
| Material | Thin glossy crystal |
| Highlight | Curved specular arc upper-left |
| Reflection | Subtle environmental gradient (marble tone) |
| Finish | Polished luxury — not chrome |
| Border | `0.5px rgba(255,255,255,0.5)` |

### Layer 5 — Atmospheric Field

| Property | Spec |
|----------|------|
| Bloom radius | ≤ 1.4× orb diameter |
| Particles | 3–8 points, opacity 0.15–0.35 |
| Haze | `rgba(255,249,238,0.08)` ambient |
| Spill | Nearby UI may receive `box-shadow` warm spill when High tier |
| Anti-pattern | Lens flare, oversized halo, neon outline |

---

## Color system

### Primary emission (internal)

```
#FFFFFF  pure warm-white core
#FFFDF8  ivory diffusion
#FFF9EE  cream body tint
#F8EEDB  champagne optical edge (subtle)
```

### Forbidden primaries

- Green (any Xbox association)
- Cold blue as core light
- Obvious gold / yellow orb
- Brand red `#EB1C24` as internal emission (red is storefront — not Genesis Core)

### State color shifts (subtle only)

| State | Shift |
|-------|-------|
| Warning | Warm-white + controlled amber undertone `#E8C89A` at core edge — **not full orb** |
| Critical | Core dimming; fracture-like light gaps — shell intact |
| Success | Brief core brightening `#FFFFFF` — no green flash |

---

## Shape language

- **Base form:** Sphere or near-perfect sphere (40px default, scalable)
- **Silhouette:** Recognizable at 16px — bright center + soft shell
- **No literal logo** inside orb
- **Original Studio OS structures allowed:**
  - Floating inner nucleus (Direction A — **canonical**)
  - Curved crystal apertures (Direction B)
  - Concentric energy rings (Direction C)
  - Subtle vertical energy axis (all directions, very faint)

**Forbidden:** X-shaped cutouts, segmented plates that read as gaming controller geometry.

---

## Living behavior — motion specifications

### Idle (6–8s cycle)

```
scale: 1.0 → 1.012 → 1.0
core brightness: 1.0 → 1.05 → 1.0
particle drift: ±1px
refraction shift: ±2% highlight position
```

### Listening

- Shell brightness +8%
- Core focus shifts toward user (highlight moves down-right ~5%)
- No aggressive pulse

### Thinking

- Inner layers circulate (12–16s rotation)
- Nucleus +15% brightness
- Soft outward pulses every 2s — **not** spinner

### Speaking

- Core responds to audio envelope (smoothed RMS)
- Organic waves — **not** equalizer bars
- Max scale perturbation 1.06

### Success

- Core expansion 1.0 → 1.08 → 1.0 over 600ms
- Bloom peak 1 frame then settle
- ≤ 6 celebratory particles

### Warning

- Irregular pulse period 4–5s (not 2s alarm)
- Amber undertone 20% mix at diffusion layer only

### Critical

- Core luminance 40% of idle
- Intermittent fracture gaps in diffusion layer
- Shell remains structurally visible

---

## Brand recognition rule

Recognizable without text, logos, or UI chrome:

1. **Warm internal star** in milky sphere
2. **Breathing** cadence
3. **Compiler accumulation** (light fills inward, never resets mid-run)

---

## Token file (to create)

`src/studio-os-core/genesis-core/genesis-orb-tokens.ts` — exports layer colors, timings, tier caps.  
Deprecate gold-heavy `ORB_VISUAL.champagne` dominance in `studioOrbTheme.ts`.
