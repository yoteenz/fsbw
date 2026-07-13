# Founder Preview™

Before spending AI compute — founder sees Construction Plan summary.

## Preview panel

- Room name + Blueprint revision
- Architecture, Hero Assets, Furniture, Materials, Lighting sections
- Job list with status
- Estimates: time, AI cost, tokens, models, retries
- **Compile** button when `compileReady`

## API

```typescript
const preview = buildFounderPreview({ plan, queue, dnaRecords });
```

No AI cost until founder approves compile.
