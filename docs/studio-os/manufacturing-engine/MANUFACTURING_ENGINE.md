# Manufacturing Engine

Studio World manufactures environments through deterministic construction plans.

## Principle

> Blueprints are architecture. Asset DNA is engineering. Render Intent is manufacturing instructions. AI is the factory.

## API

```typescript
import { runManufacturingCompile } from 'studio-os-core/manufacturing-engine';

const result = runManufacturingCompile(founderRequest);
// result.founderPreview — inspect before AI cost
// result.liveView — watch manufacturing live
// result.digitalTwin — room health like server monitoring
```

## What changed from Blueprint Author v1

| v1 | v2 Manufacturing |
|----|------------------|
| Job Queue | Manufacturing Queue (cost, retry, inspection policies) |
| AI Workers | Specialized Factory Workers |
| Quality vs Blueprint | Quality: Blueprint → DNA → Render Intent → Output |
| Immune vs Blueprint | Immune: Expected DNA vs Actual DNA |
| Prompts forbidden | Render Intent only |
