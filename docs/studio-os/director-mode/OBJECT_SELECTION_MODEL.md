# Object Selection Model

Founders never describe changes that can be selected. **Selection replaces prompting.**

## Interaction patterns

| Founder action | Selection | System response |
|----------------|-----------|-----------------|
| Replace desk | Select desk → Replace | Queue hero-asset job for desk only |
| Change marble | Select wall → Change material | Queue material-application job |
| Swap icon | Select logo → Swap icon | Queue brand worker job |
| Replace model | Select campaign model → Replace | Queue photography/model worker |
| Rewrite CTA | Select CTA → Rewrite copy | Queue copy worker (no image regen) |
| Move chair | Select chair → Move | Update socket placement metadata |
| Replace animation | Select animation → Replace | Queue motion worker |
| Change packaging | Select product → Change packaging | Queue packaging worker |

## Selection contract (documentation only)

```typescript
// Conceptual
type ObjectSelection = {
  objectId: string;
  objectFamily: string;
  bounds: { left: string; top: string; width: string; height: string };
  socketId: string | null;
  availableActions: DirectorAction[];
};

type DirectorAction =
  | 'replace'
  | 'change-material'
  | 'move'
  | 'resize'
  | 'swap'
  | 'rewrite'
  | 'upgrade'
  | 'inspect-dna'
  | 'inspect-render-intent'
  | 'view-history';
```

## Rules

1. **Selectable objects must have Object ID.** No anonymous region selection.
2. **Actions are bounded.** Each action maps to one worker type.
3. **Multi-select is deferred.** Single-object selection is canonical v1.
4. **Prompt fallback only for conception.** Draft stage may use natural language; directing stage uses selection.

## Shipped foundation

Asset Inspector and socket visualization in Construction Mode support click-to-inspect for environment objects. Full selection UI is **Planned**.

## Cross-references

- Asset Inspector: `docs/studio-os/construction-mode/ASSET_INSPECTOR.md`
- Asset Socket System: `docs/studio-os/blueprint-author/ASSET_SOCKET_SYSTEM.md`
