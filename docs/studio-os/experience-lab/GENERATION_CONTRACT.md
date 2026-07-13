# Experience Lab Generation Contract

## Artifact intents

| Layer | Intent |
|-------|--------|
| `environment-shell` | `environment-shell` |
| `signature-landmark` | `isolated-object` |
| `furniture-objects` | `object-group` |
| Overlays | `transparent-overlay` / `material-map` |
| Final composite | `final-scene` |

## Validation order (isolated layers)

```
generate → identity → structure (salvageable-opaque deferral) → background classify
→ background removal (when eligible) → postprocess → approval → mount
```

## Failure recovery

- Salvageable opaque studio plates: extraction before REGENERATE
- True full-scene rerender: reject, preserve shell, regenerate layer only (max 2)
