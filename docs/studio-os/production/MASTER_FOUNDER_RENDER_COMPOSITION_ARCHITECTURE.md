# Master Founder Render™ + Multi-Device Composition System

**Status:** P0 foundational layer  
**Spatial review:** `docs/studio-os/investigations/SPATIAL_ARCHITECTURE_REVIEW_MASTER_FOUNDER_RENDER.md` (Approved 4.7)  
**Module:** `src/studio-os-core/master-founder-render/`

---

## Core principle

**Stop:** Desktop Room · Mobile Room · Tablet Room (separate generations)  
**Start:** Master Founder Render → Composition Pack → device framing only

The room never changes. Only the framing changes.

---

## Two master renders

| Master | Aspect | Role |
|--------|--------|------|
| **Master Landscape** | 21:9 · 4K | Canonical architectural truth — generated first |
| **Master Portrait** | 9:16 · 4K | Camera recomposition of **approved** landscape — NOT a new room |

Portrait pipeline:
```
Approved Landscape → reference locked → Generate Portrait (img2img)
  → DO NOT redesign · move architecture · replace furniture · change lighting
  → ONLY reposition virtual camera for portrait composition
```

---

## Composition Pack™ (replaces Camera Pack)

Every room receives composition profiles derived from masters — **no new room generation**:

Desktop Hero · Desktop Wide · Desktop Detail · Tablet Landscape · Tablet Portrait · Mobile Hero · Mobile Tight · Instagram Story · TikTok · Marketplace Thumbnail · Presentation · Construction · Blueprint Overlay · Review Mode

Future devices (Vision Pro, AR, TV, foldables) add **CompositionProfile** entries only.

---

## Composition Studio™ (replaces Camera Studio)

Decides **what the founder sees** — framing, FOV, safe areas, focus priority, device optimization. Does **not** redesign architecture.

Smart composition uses Blueprint metadata: hero objects, architectural anchors, walking direction, focal length recommendations.

---

## Brand asset locking

Portrait and composition derivation **must** reuse:
- Approved Master Landscape
- Approved Material Library · Brand Vault · Marble · Glass · Acrylic · Lighting · Furniture

Never regenerate locked brand assets during recomposition.

---

## Quality Guard

Validates portrait matches landscape:
- Architecture · materials · lighting · furniture · brand assets identical
- **Only framing differs**
- Rejects: different room, chandelier, marble, walls, furniture, layout, lighting, architecture

---

## Downstream consumers

| Consumer | Receives |
|----------|----------|
| **CDS** | Master Landscape + Master Portrait + Composition Pack + frozen blueprint |
| **Construction Mode** | Master Blueprint + both masters + department metadata |
| **Marketplace** | Composition-derived previews |
| **Experience Lab** | Founder Review shows both masters + composition pack before approval |

---

## Persistence

`studio_master_founder_renders`, `studio_master_portrait_renders`, `studio_composition_packs`, `studio_composition_profiles`, `studio_blueprint_composition_metadata`

---

## Code entry points

| Export | Role |
|--------|------|
| `buildMasterLandscapeRenderRecord()` | Canonical 21:9 source of truth |
| `buildMasterPortraitRecomposeRequest()` | Portrait after landscape approval |
| `buildDefaultCompositionPack()` | All device profiles from masters |
| `resolveSmartCompositionGuidance()` | Blueprint-aware framing |
| `validatePortraitLandscapeParity()` | Quality Guard composition check |
| `assertBrandAssetsLocked()` | Portrait generation gate |
