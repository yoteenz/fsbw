# Iteration Engine

Every iteration affects **only selected objects**. The rest of the world remains untouched.

## Object-local versioning

```
Reception Desk v7
    ↓ Founder changes countertop
Reception Desk v8
```

- Entire room remains at current revision
- Only desk DNA, Render Intent, and manufacturing job re-queue
- Sibling objects (landmark, furniture) unchanged
- Architecture shell unchanged unless explicitly selected

## Iteration contract (documentation only)

```typescript
// Conceptual
type ObjectIterationRequest = {
  objectId: string;
  currentVersion: string;
  changeType: 'replace' | 'material-change' | 'move' | 'resize' | 'copy-rewrite';
  selectedAttribute: string;       // e.g. 'countertop', 'material', 'position'
  newValue: string | MaterialRef;
  propagateDependencies: boolean;  // default false for object-local
};
```

## Version bump rules

| Change scope | Version bump | Rebuild scope |
|--------------|--------------|---------------|
| Single attribute | Patch (v7.0 → v7.1) | Targeted repair |
| Material swap | Minor (v7 → v8) | Material layer only |
| Full replace | Major (v7 → v8) | Single object job |
| Socket move | Minor + dependency check | Object + placement metadata |

## Relationship to Blueprint Author

Blueprint Author produces the **initial** Construction Plan. Iteration Engine produces **delta plans** for selected objects only — never full room regeneration.

## Cross-references

- Targeted Repair: `docs/studio-os/manufacturing-engine/TARGETED_REPAIR.md`
- Blueprint Versioning: `docs/studio-os/blueprint-author/BLUEPRINT_VERSIONING.md`
- Change Propagation: [CHANGE_PROPAGATION.md](./CHANGE_PROPAGATION.md)
