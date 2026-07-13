# Model Scoreboard™

Every model earns manufacturing statistics. Routing becomes evidence-based.

## Seed data

| Model | Task | Success |
|-------|------|---------|
| nano-banana-pro/edit | Architecture | 98% |
| nano-banana-2/edit | Hero Assets | 88% |
| gpt-image-2/edit | Hero Assets | 95% |
| gpt-image-2/edit | Isolation | 84% |

## API

```typescript
const board = getModelScoreboard();
const best = resolveBestModelForTask({ taskType: 'hero-asset' });
recordModelOutcome({ scoreboard, providerModel, taskType, success, backgroundLeakage });
```

Studio OS continuously learns which worker performs best per task.
