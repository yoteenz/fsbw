# WFE PR stack reconciliation (2026-10-09)

| PR | Branch | Base | SHA (head) | Status |
|----|--------|------|------------|--------|
| #49 | cursor/studioos-world-fabrication-engine-v1-foundation1-21dc | master | 93fc92e1d | OPEN |
| #50 | cursor/studioos-world-fabrication-engine-v1-game-art-standards1-21dc | #49 branch | 553e8b3dc | OPEN |
| #51 | cursor/studioos-wfe-v1-codex-blender-benchmark1-21dc | #50 branch | 2ba5e3673 | OPEN |
| #52 | cursor/studioos-wfe-v1-full-validation-blender-loop1-21dc | #51 branch | ae6b383b1 | OPEN |
| #53 | cursor/studioos-wfe-v1-codex-dispatch-integration1-21dc | #52 branch | 651f89bd8 | OPEN |
| #54 | cursor/studioos-wfe-v1-codex-pipeline-activation1-21dc | #53 branch | be296b20 | OPEN |
| — | cursor/studioos-wfe-v1-codex-auth-unblock1-21dc | #54 branch | 752cb4df8 | OPEN (fix tip) |
| — | cursor/studioos-wfe-v1-pr-stack-consolidation1-8c25 | master | (see consolidation PR) | MERGE READY |

Merge order (historical stack): #49 → #50 → #51 → #52 → #53 → #54 → **auth-unblock fix**.

**Recommended baseline:** merge **`cursor/studioos-wfe-v1-pr-stack-consolidation1-8c25`** to master (one diff) instead of force-merging conflicting #49 first.

**#49 vs master:** still **CONFLICTING** on GitHub; consolidation branch resolves by merging verified tip onto current master.

**master SHA (2026-10-09):** `b488a7eee`

See **`PR_DEPENDENCY_MAP_CONSOLIDATION1.md`** and **`BENCHMARK_FIXTURE_ACQUISITION_V1.md`**.

No force-merge performed in agent runs; branch protections and reviews apply on GitHub.
