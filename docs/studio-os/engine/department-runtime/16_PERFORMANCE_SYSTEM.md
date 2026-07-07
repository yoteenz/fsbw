# 16 — Performance System

**Engine Module:** `studio.department-runtime.v1.performance`  
**Status:** Optimization specification

---

## Definition

The **Performance System** ensures departments load fast, render smoothly, and scale across desktop and mobile — without sacrificing living-place quality.

---

## Targets

| Metric | Desktop | Mobile |
|--------|---------|--------|
| Time to first paint | ≤ 2s | ≤ 3s |
| Time to interactive | ≤ 5s | ≤ 8s |
| Frame rate (interaction) | ≥ 30 fps | ≥ 24 fps |
| Frame rate (ceremony) | ≥ 24 fps | ≥ 20 fps |
| Memory per department | ≤ 150 MB | ≤ 100 MB |
| Package size budget | ≤ 50 MB org / 25 MB marketplace | same |

---

## Lazy Loading

Delegated to Asset Loader (02):

- Particles, decor, lazy audio, LOD 1+, zone animations
- Frustum-based object activation

---

## Asset Streaming

```
Priority queue: materials → env → primary furniture → secondary → lazy
Progressive GLB decode: coarse mesh → full detail
Background prefetch: adjacent department packages on HQ map hover
```

---

## Memory Optimization

| Technique | Application |
|-----------|-------------|
| BACKGROUND unload | Release GPU buffers; keep state snapshot |
| LOD switching | Distance-based mesh swap |
| Texture atlas | Shared Genome materials |
| Audio buffer pool | Reuse decoded buffers |
| Object culling | Off-frustum objects sleep |

---

## Animation Optimization

- Skip idle loops when off-screen
- Reduced particle count on mobile
- Ceremony particles only during ceremony
- `will-change` sparingly

---

## GPU Optimization

| Technique | Use |
|-----------|-----|
| Instancing | Repeated decor |
| Baked lighting probes | Static environment |
| Shader LOD | Simplified glass on mobile |
| Particle GPU budget cap | 50 max |

---

## Caching

| Tier | Policy |
|------|--------|
| Session | Hot assets in GPU memory |
| Persistent LRU | 50 modules disk/memory |
| Platform | Orb + fallbacks always resident |
| Genome | 5 min snapshot cache |

---

## Desktop vs Mobile Scaling

```yaml
PerformanceProfile:
  platform: enum                      # desktop | mobile | tablet
  particleDensity: number           # 1.0 desktop, 0.5 mobile
  lodBias: number                     # 0 desktop, 1 mobile
  shadowQuality: enum
  audioLayers: number               # 2 desktop, 1 mobile
  maxConcurrentLoads: number          # 6 desktop, 3 mobile
```

Auto-detected; user override in preferences.

---

## Telemetry

```yaml
RuntimeMetrics:
  fps: number
  memoryMB: number
  loadTimeMs: number
  cacheHitRate: number
  fallbackCount: number
  gpuTier: string
```

Emitted to Event Bus for Engineering Excellence Dashboard.

---

_Next: [17 — Marketplace Runtime](./17_MARKETPLACE_RUNTIME.md)_
