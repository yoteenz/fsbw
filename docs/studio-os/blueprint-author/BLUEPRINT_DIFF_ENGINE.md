# Blueprint Diff Engine

**Version:** `blueprint-diff-engine.v1`

Immune System asks: **"What differs from Blueprint?"** — not "What happened?"

## Diff categories

| Category | Example |
|----------|---------|
| `asset-version` | Expected `ReceptionDesk.v7`, actual `v6` |
| `material` | Expected `founder-marble`, actual `Generic Marble` |
| `socket` | Asset in wrong socket |
| `transparency` | Expected alpha, got full-scene render |
| `missing-asset` | Blueprint asset not present |
| `architecture` | Shell drift |

## API

```typescript
diffAssetVersion({ expected, actualVersion });
diffMaterial({ expectedMaterialId, actualMaterialLabel });
diffTransparency({ assetId, expected, actual });
diffBlueprintAgainstActual({ plan, actualAssets });
```

## Repair mapping

| Diff | Repair action |
|------|---------------|
| asset-version | `upgrade-asset` |
| material | `rebuild-material-layer` |
| socket | `reposition-to-socket` |
| transparency (full-scene) | `reject-and-requeue` |
| missing-asset | `requeue-asset-job` |

Repair always references Blueprint. Generated content is disposable.

## Future

- Blueprint diff UI for founders
- Historical diff across revisions
- Organization-wide drift reports
