# Construction Mode™

Construction Mode is the digital construction site of Studio World — not AutoCAD, Unreal, Unity, or a scene graph.

The Founder explores the future world before construction begins.

## API

```typescript
const result = runConstructionModeCompile(founderRequest);
// result.session.dashboard — plan before AI cost
// result.session.worldPreview — procedural clay model
// result.session.approvalStatus — founder gate
```

Manufacturing is blocked until `founderApproved: true`.
