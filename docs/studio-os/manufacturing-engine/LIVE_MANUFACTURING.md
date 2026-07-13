# Live Manufacturing View™

During compile — founder watches manufacturing progress.

## Stage display

```
Architecture  ██████████  Completed
Desk          ██████░░░░  Inspecting
Landmark      ██░░░░░░░░  Rendering
Furniture     Pending
```

## API

```typescript
let view = initLiveManufacturingView(queue);
view = updateLiveManufacturingStage(view, jobId, 'rendering', 60, 'Rendering');
formatProgressBar(60); // "██████░░░░"
```

No mystery. Everything visible.
