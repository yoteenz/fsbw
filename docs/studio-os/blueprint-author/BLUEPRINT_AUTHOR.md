# Blueprint Author™

The Blueprint Author is the **first stage** of every Studio World compile. No AI model may generate architecture, assets, or rooms directly.

## Responsibilities

Blueprint Author owns:

- Room topology and architecture definitions
- Asset sockets and navigation graph
- Camera anchors and lighting profiles
- Approved materials and interaction zones
- Room purpose, organization rules, validation rules
- Visual language via style profiles

Blueprint Author performs **zero image generation**.

## Founder benefit

Founders inspect the **Blueprint** before any AI cost:

- Architecture plan and room layout
- Sockets, materials, lighting, navigation
- Interaction zones and validation rules

## API

```typescript
import { authorConstructionPlan, runBlueprintCompile } from 'studio-os-core/blueprint-author';

const plan = authorConstructionPlan(founderRequest);
const result = runBlueprintCompile(founderRequest);
```

## Principle

> If AI output disappears tomorrow, Studio World rebuilds from Blueprint alone.
