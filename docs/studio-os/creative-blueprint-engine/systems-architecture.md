# Systems Architecture™ — Coordinated Design Bundles

**Module:** `studio.creative-blueprint.v1.systems`  
**Status:** Systems travel together — founder never manages atoms

---

## Principle

> Each Blueprint™ contains multiple coordinated systems. The founder never manages these individually. They travel together.

---

## System Definition

A **System™** is a coordinated bundle of parameters, asset bindings, and rules that express one design dimension consistently.

Systems are the **unit of inheritance** between Blueprint™ and Assets™.

---

## Example — Editorial Lighting System™

```
Editorial Lighting System™
├── Indirect Lighting        (ceiling wash · coffer pools)
├── Accent Lighting          (hero object pools · landmark rims)
├── Practical Lights         (desk lamps · practicals in frame)
├── Volumetrics              (haze density · depth scatter)
├── Reflection Profiles      (warm floor bounce · glass spec)
├── Color Temperature        (3200K–3800K warm editorial band)
├── Shadow Profiles          (soft long · architectural)
├── Bloom Settings           (restrained · hero-only)
└── Ambient Glow             (Orb host · station idle breathe)
```

Founder selects **Editorial Lighting System™** — not nine separate sliders per department.

---

## System Schema

```yaml
System:
  systemId: system:editorial-lighting-v1
  name: Editorial Lighting System™
  blueprintId: blueprint:editorial-luxury-v1
  category: lighting
  version: semver
  parameters:
    colorTemperature:
      default: 3500
      range: [3000, 4000]
      unit: kelvin
    volumetricDensity:
      default: 0.35
      range: [0.1, 0.6]
    bloomIntensity:
      default: 0.2
      range: [0, 0.5]
  subsystems:                    # internal — not founder-facing
    - indirect
    - accent
    - practical
    - volumetrics
    - reflections
    - shadows
    - bloom
    - ambientGlow
  assetBindings:
    - registryId: registry:editorial-lighting-pack
      role: primary-rig
    - registryId: registry:volumetric-haze-warm-v2
      role: atmosphere-pass
  sceneStackMapping:
    layer: lighting-systems
  runtimeManifestRef: manifest://systems/editorial-lighting-v1/runtime
```

---

## System Categories

| Category | Systems |
|----------|---------|
| **Materials** | Luxury Material · Glass Language · Stone · Metal |
| **Lighting** | Editorial Lighting · Executive Lighting · Hospitality Warm |
| **Architecture** | Architectural Language · Proportion · Threshold |
| **Atmosphere** | Atmospheric Language · Particle philosophy |
| **Motion** | Motion Language · Ambient Motion rules |
| **Audio** | Audio Language · UI · ambient beds |
| **Interaction** | Orb Interaction · Hotspot chrome rules |
| **Transitions** | Transition Language · arrival character |
| **Color** | Color Language · palette enforcement |
| **Typography** | Typography Language · display hierarchy |
| **FX** | Environmental FX · milestone · focus |

---

## System → Asset Binding

Systems **reference** Registry assets — they do not embed binaries:

```
System: Editorial Lighting System™
    ↓ binds
Assets: registry:editorial-lighting-pack (primary)
        registry:warm-pool-accent-v1 (accent)
    ↓ gaps trigger
Asset Intelligence → Generate only missing bindings
```

---

## System Evolution

When founder upgrades a system:

```yaml
SystemEvolution:
  systemId: system:editorial-lighting-v1
  fromVersion: 1.2.0
  toVersion: 1.3.0
  change: bloomIntensity default 0.2 → 0.28
  propagation: optional-inherit | force-inherit | pin-old
  affectedDepartments: [creative-direction, marketing, finance]
```

See [evolution-system.md](./evolution-system.md).

---

## Forbidden Fragmentation

| Forbidden | Correct |
|-----------|---------|
| Founder sets bloom per station | System default + blueprint variant |
| Marketing uses different color temp without variant | Declare `accent-open` variant |
| Regen lighting asset without system context | Upgrade System™ · rebind assets |
| Mix two lighting systems in one department without rules | Primary + declared accent only |

---

## Runtime Application

Department Runtime™ receives **System bundle** — not loose assets:

```
BlueprintContext.activeSystems[]
    ↓
Runtime applies parameters + asset refs per layer
    ↓
Scene Stack compositor uses system-ordered layers
```

Cursor assembles interaction from **Orb Interaction System™** — never invents chrome outside blueprint.

---

_Systems Architecture™ — coordinated bundles, not atoms._
