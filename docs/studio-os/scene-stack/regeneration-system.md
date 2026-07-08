# Regeneration System™

**Per-Layer Regeneration · Versioning · Replacement**

---

## Law

Regenerating one layer **must not** invalidate other approved layers.

---

## Regenerate Lighting Only

```
Founder: "The lighting feels too cold."
        ↓
regenerateLayer(stationId, 'lighting-systems')
        ↓
version: 2 → 3 (new FAL pass)
        ↓
environment-shell v1 · signature-landmark v2 · furniture v1 — UNCHANGED
        ↓
Recompose stack with lighting v3
```

---

## Version History

All versions retained in `studioOsSceneStack_v1`:

- Enables rollback to `lighting-systems` v2
- Archive integration for Legacy™ departments

---

## Replace Layer (Marketplace)

Future: swap `furniture-objects` layer from Marketplace pack without touching shell.

Framework invariant: Environment Shell™ + Signature Landmark™ structure persists ([Living Sets™](../world/living-sets.md)).

---

## Failure Isolation

If `atmospheric-systems` fails:

- Station remains `partial` with lower layers visible
- Retry only failed layer
- No full station regen required

---

## API

```typescript
generateLayer(stationId, layerId)
regenerateLayer(stationId, layerId)  // force new version
approveLayer(departmentId, projectId, stationId, layerId)
```

---

## See Also

- [golden-build-pipeline.md](./golden-build-pipeline.md)
