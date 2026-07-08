# Golden Build™ Pipeline (Layered)

**Scene Stack™ Generation Flow**

---

## Pipeline Position

```
Founder / Genome context
        ↓
compileSceneStackLayerPrompt(station, layer)
        ↓
POST /api/admin/studio-builder-generate
        ↓
FAL nano-banana-pro/edit (single layer pass)
        ↓
Supabase live-preview storage
        ↓
Layer record (versioned · approvable)
        ↓
SceneStackViewport composition
        ↓
Interaction Layer™ (Cursor)
```

---

## Per-Station Build Sequence

Recommended generation order:

1. Environment Shell™
2. Signature Landmark™
3. Furniture & Objects™
4. Lighting Systems™
5. Atmospheric Systems™
6. Surface Materials™
7. Ambient Motion™
8. Founder Personalization™

Layers 08–09 applied by Cursor at runtime — not queued to FAL.

---

## Approval Model

Each layer record:

```typescript
{
  stationId: string;
  layerId: SceneStackLayerId;
  version: number;
  status: 'idle' | 'generating' | 'approved' | 'failed';
  publicUrl?: string;
  approvedAt?: string;
}
```

Extends Creative Approval Pipeline™ philosophy to **per-layer** granularity.

---

## Composition Status

| Status | Meaning |
|--------|---------|
| `idle` | No layers |
| `building` | One or more layers generating |
| `partial` | Some layers approved · not all |
| `ready` | All generatable layers approved |
| `failed` | One or more layers failed |

---

## Intelligence Gate (Mandatory)

Before any layer generation, **Asset Intelligence Engine™** searches Registry for compatible existing layers.

See [Asset Intelligence Engine™](../asset-intelligence-engine/generation-order.md) · [Scene Stack regeneration](../asset-intelligence-engine/asset-categories.md).

---

## Golden Build™ Output

Golden Build™ no longer outputs **images**.

Golden Build™ outputs **layered environments** — a versioned stack of approved production layers composable at runtime.

---

## CDS Pilot Stations

6 stations × up to 8 FAL layers = up to 48 independent generation units per project (lazy-generated on visit).

---

## See Also

- [regeneration-system.md](./regeneration-system.md)
- [../scene-genesis/README.md](../scene-genesis/README.md) (deprecated)
