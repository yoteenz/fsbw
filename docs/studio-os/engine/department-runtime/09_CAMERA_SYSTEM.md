# 09 — Camera System

**Engine Module:** `studio.department-runtime.v1.camera`  
**Status:** Cinematic camera specification  
**Parent:** SDK [02 — Spatial Layout](../../sdk/02_SPATIAL_LAYOUT_SYSTEM.md) · [08 — Motion Standard](../../sdk/08_MOTION_STANDARD.md)

---

## Definition

The **Camera System** controls all viewpoint behavior in a department — presets, travel, orbit, focus, and ceremony framing. Camera movement is **cinematic**, never utilitarian.

---

## Camera Presets (Required)

Loaded from package `camera/camera.json`:

| Preset | Purpose | FOV |
|--------|---------|-----|
| `arrival` | Entry portal, looking in | 60° |
| `hero` | Back wall identity | 45° |
| `primary` | Default work view | 50° |
| `orb` | Conversation with Orb | 40° |
| `ceremony` | Approval / launch | 55° elevated |
| `departure` | Exit portal | 60° |

---

## Camera Modes

| Mode | Trigger | Behavior |
|------|---------|----------|
| **Arrival fly-through** | State → READY | arrival → hero → primary |
| **Focus transition** | Object selected | Ease to object framing |
| **Zoom / Inspect** | Inspect verb | Subtle dolly toward object |
| **Conversation** | Orb activated | orb preset |
| **Presentation** | Media Display fullscreen | Wide ceremony framing |
| **Overview** | Command / gesture | Elevated wide of full envelope |
| **World** | Quick travel map | HQ-level (outside department) |
| **User orbit** | Drag | ±30° H, ±15° V from preset |
| **Zone transition** | Zone change | Orbit between zone presets |

---

## Cinematic Rules

| Rule | Value |
|------|-------|
| Max travel speed | 2.0 units/second |
| Easing | cubic-bezier(0.4, 0, 0.2, 1) for cinematic |
| FOV change per transition | 5°–15° |
| Idle return | 5s idle → return to primary preset |
| Reduced motion | Instant preset set |
| Interruptible | User orbit cancels auto-travel |
| No vestibular triggers | Speed cap enforced |

---

## Camera + Subsystem Coordination

```
Navigation arrival → arrival → hero → primary sequence
Approval verb → ceremony preset (non-skippable)
Orb conversation → orb preset
Zone walk → zone-specific offset from primary
Departure → departure preset
Genome refresh → no camera change
```

---

## Depth of Field

| Focus Target | Effect |
|--------------|--------|
| Active object | Sharp |
| Inactive zone objects | Slight softening |
| Background hero | Atmospheric soft |
| Ceremony subject | Sharp + background bokeh |

Tied to Object Manager `focusLevel`.

---

## Camera State

```yaml
CameraState:
  activePreset: string
  position: Vector3
  rotation: Quaternion
  fov: number
  mode: enum
  traveling: boolean
  userOverride: boolean
  reducedMotion: boolean
```

Persisted in State Manager for BACKGROUND resume.

---

_Next: [10 — Animation Engine](./10_ANIMATION_ENGINE.md)_
