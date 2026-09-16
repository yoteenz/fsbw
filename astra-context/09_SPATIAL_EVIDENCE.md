# Current Spatial Evidence

Do not invent geometry not supported by repo. **UNKNOWN** marked explicitly.

---

## World entry — desktop (AW_D_01)

| Evidence | Value | Source |
|----------|-------|--------|
| Canonical stage | 1536×1024 | `awD01LayeredAssets.ts` |
| Source shell | 1672×941 (+ normalization from extended canvas) | same |
| Background authority | V2 PNG full-bleed | `AW_D_01_WORLD_ENTRY_BACKGROUND_V2` |
| Overlay system | Percent-rect anchors on shared stage | `AW_D_01_OVERLAY_ANCHORS`, `CanonicalScreenStage` |
| Horizon / camera | **UNKNOWN** explicit angle — inferred **elevated city panorama** from reference board & background art | REFERENCE A, background slots |
| Focal hierarchy | Hero center → Astréa left block → destinations list → right rail actions | `AwD01WorldEntryScreen.tsx` |
| Depth | 2.5D via single plate + DOM overlays (not 3D engine) | implementation |

---

## World entry — mobile (AW_M_01)

| Evidence | Value | Source |
|----------|-------|--------|
| Canonical stage | 854×1842 | `awM01LayeredAssets.ts` |
| Source shell | 941×1672 normalized | same |
| Background authority | V2 (853×1844 founder shell → 854×1842) | same |
| Vertical rhythm | Hero top → avatar shell → Astréa center → destination rows → quick actions → bottom nav | `AwM01WorldEntryScreen.tsx` |
| Framing | Portrait full-screen environment | REFERENCE B |

---

## District (Astréa) scene

- Hotspots + destination activity — `MobileAstreaScene.tsx`, `hotspotRegistry.ts`
- Emblem visual language tuned FT3.2 — audit doc

---

## Destination placement on entry

Three **medallion + text row** links anchored on environment (not floating cards grid on current D01/M01).

Reference **A** also shows **circular destination orbs** and **bottom showcase panels** — present on reference board; **partial** convergence on layered screens (verify against REFERENCE A when redesigning).

---

## Find My Reader spatial stack

Astréa backdrop + invoke field + sigils + **portrait orbit** + brass tray — documented FT3.2.

---

## Mobile vs desktop

Separate stage configs — **never** treat mobile as cropped desktop (`REFERENCE_FIDELITY.md`, FT5.2D tests).

---

## UNKNOWN / missing

- Exact camera FOV, lens, or 3D nav mesh
- Standalone clean city panorama PNG (called out as missing in REFERENCE_FIDELITY)
- Per-destination isolated environment photography (interim crops only)
- Ambient audio/spatial audio (not encoded in entry screen)
