# Memory Engine™ V1.0 (Milestone 96)

**Route:** `/admin/studio/memory-engine`

## Purpose

The **Memory Engine™** transforms Studio OS from an assistant into an **organization that remembers**.

- **Knowledge** (Profession Brain™) explains **why** something works.
- **Memory** proves **whether** it actually worked.

Studio OS should **remember forever**.

## What Memory preserves

Projects · campaigns · experiments · decisions · successes · failures · lessons · customer history · meeting outcomes · workflow improvements · historical metrics · professional insights.

## Three continuous questions

1. **Have we done this before?**
2. **What happened?**
3. **Would we recommend doing it again?**

Core API: `recallOrganizationalMemory()` · `recallMemoryForQuery()`

## Auto-generated project artifacts

Every completed project/campaign/experiment generates:

- Lessons Learned
- Best Practices
- Mistakes to Avoid
- Recommendations
- Future Improvements

Core API: `generateProjectCompletionArtifact()` · `buildArtifactsFromCompletedProjects()`

## Compounding recommendations

`buildCompoundingRecommendations()` powers future guidance — repeat success · avoid failure · apply lessons · improve workflows.

## Sync sources

1. **Business Discovery Blueprint™** — wisdom, decision mistakes
2. **Profession Brain™** — judgment patterns, living signals, human knowledge
3. **Demo organizational history** — campaigns, experiments, customer patterns (localStorage)

Sync triggers: Profession Brain upsert · Blueprint upsert · organization boundary activation.

## Code

| Area | Path |
|------|------|
| Core | `src/studio-os-core/memory-engine/` |
| UI | `MemoryEngineWorkspace.tsx` — 6 tabs |
| Page | `/admin/studio/memory-engine` |
| Command Dock | `resolveMemoryEngineAdvice()` · proactive on Memory route |

## Relationship to Memory Bible

**Memory Bible** — curated institutional knowledge packages for AI context.

**Memory Engine™** (M96) — operational organizational memory with recall, artifacts, and compounding recommendations. Complementary layers.

## Brand voice

*"Remember what worked. Prove it forever."*
