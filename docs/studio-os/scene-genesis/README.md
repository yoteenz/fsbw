# Golden Build™ Scene Genesis™

**Scene first. UI second.**

---

## Architecture

```
Station™
    ↓
FAL generates cinematic environment (architecture · lighting · materials · hero objects)
    ↓
SceneGenesisViewport displays full-viewport plate
    ↓
Interaction hotspots float invisibly inside the world
```

| Layer | Owner | Technology |
|-------|-------|------------|
| **Environment** | FAL · Golden Build™ pipeline | `nano-banana-pro/edit` → Supabase `live-preview` |
| **Interaction** | Cursor | Hotspots · camera · Orb · nav · state · logic |
| **Forbidden** | — | HTML/CSS faux architecture (columns · gradients · panels as rooms) |

---

## CDS Pilot

| Station | FAL scene | Interaction hotspot |
|---------|-----------|---------------------|
| Arrival™ | `portal-entry-cds` | Enter threshold |
| Story Table™ | `table-timeline-cds` (Signature Landmark™) | Orb · speech · chips |
| Mood Wall™ | `wall-mood-cds` | Pin console |
| Notes Desk™ | `panel-founder-notes-cds` | Notes form |
| Pipeline™ | `glass-panels-cds` | Mission control board |
| Library™ | `shelf-library-cds` | Shelf browser |

---

## Module paths

- `src/studio-os-core/scene-genesis/` — types · manifest · prompt compiler · store
- `src/studio-os-core/department-package/bundles/creative-direction/scene-genesis-stations.json`
- `src/hooks/useSceneGenesis.ts`
- `src/components/admin/studio-os/creative-direction-studio/SceneGenesisViewport.tsx`
- `src/components/admin/studio-os/creative-direction-studio/cdsInteractionLayerTheme.ts`

---

## API

Reuses `POST /api/admin/studio-builder-generate` with `productionGroupId: scene-genesis-{stationId}`.

Scenes cached in `studioOsSceneGenesis_v1` localStorage + Studio Asset Registry.

---

## Route

`/admin/studio/department/creative-direction`
