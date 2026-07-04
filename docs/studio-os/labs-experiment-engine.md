# Studio OS Labs + Experiment Engine v1.0

**Milestone 28** — Research & experimentation division of Studio OS.

## Purpose

Studio OS Labs is **not an analytics dashboard**. It is a **learning engine** that gets smarter every time content is published. Every published asset inside AI Media (and future workspaces) automatically becomes an **experiment**.

## Architecture

```
src/studio-os-core/labs/
├── types.ts              # Experiment, metrics, learnings, intel records
├── constants.ts          # Pillars, platforms, storage keys
├── experimentEngine.ts   # Auto-create experiment on publish
├── learningEngine.ts     # Generate insights from metrics
├── recommendationEngine.ts
├── benchmarkEngine.ts
├── promotionPipeline.ts  # Promote winners to DNA / templates
├── intelligenceAggregator.ts  # Hook, caption, series, pillar intel
├── comparisonEngine.ts
├── labsExecutives.ts     # CCO, Analytics Director, etc.
└── store.ts              # localStorage CRUD + sync

src/workspaces/ai-media/labs/
└── bootstrap.ts          # Demo experiments (first workspace pilot)

src/components/admin/studio/labs/
└── LabsWorkspace.tsx     # 14-tab dashboard

Route: /admin/studio/labs
```

## Experiment Engine

On every publish, `registerPublishedAsset()` creates:

- Unique experiment ID + Knowledge Graph node
- Full variable capture: topic, pillar, series, campaign, hook, script, voice, thumbnail, caption, hashtags, CTA, AI models, DNA versions, etc.
- Empty performance metrics (filled as data arrives)

## Learning Engine

After enough data, generates **insights** (not raw metrics):

- Thumbnail style CTR deltas
- Optimal video length ranges
- Question vs statement hook performance
- Pillar revenue and retention patterns

Discoveries flow to **Memory Bible**, **Knowledge Graph**, and **promotion pipeline**.

## Admin Dashboard Tabs

1. Overview — active/completed experiments, top hooks, surprises, recommendations
2. Experiments — all experiments with variables
3. Learnings — generated insights
4. Hook Library — templates with success scores
5. Thumbnail Intel — composition, colors, CTR
6. Caption Intel — length, emoji, engagement patterns
7. Series Intel — recurring series performance
8. Pillar Intel — ROI and investment recommendations
9. Compare — side-by-side with meaningful diffs
10. Recommendations — backed by experiment history
11. Benchmarks — platform records to beat
12. Promotion — pending promotions to DNA/templates
13. Labs Executives — CCO, Analytics, Growth, Creative, BD directors
14. Knowledge Gained — institutional memory

## Integration Points

| System | Connection |
|--------|------------|
| AI Media | First workspace pilot — `bootstrapAiMediaLabs()` |
| Knowledge Graph | `node-studio-os-labs`, experiment & learning nodes |
| Memory Bible | Naming + decision log entries |
| Promotion Center | `promo-labs-v1` pipeline item |
| Workspace Creation | Auto-provision `labs` module per workspace |

## Future

- Server-persisted experiments (Supabase)
- Distribution Network auto-hook on publish
- Vision AI / executive AI notifications on experiment completion
