# Knowledge Diff Engine

**Protocol module:** L3 — Incremental catch-up  
**Capsule path:** `Manifest/knowledge-diff.json`  
**Purpose:** Answer **"What changed since the last capsule?"** without rereading everything.

---

## Purpose

When the founder exports an incremental capsule, the receiving AI immediately catches up via structured diff — like `git diff` for institutional memory.

---

## knowledge-diff.json schema

```json
{
  "schemaVersion": 1,
  "generatedAt": "ISO-8601",
  "diffKind": "incremental",
  "baseCapsule": {
    "capsuleId": "capsule-2026-07-10-48a77da",
    "capsuleVersion": "2.0.0",
    "contextVersion": "2026-07-10T12:00:00Z",
    "checksumSha256": "abc..."
  },
  "targetCapsule": {
    "capsuleId": "capsule-2026-07-10-protocol-v1",
    "capsuleVersion": "3.0.0",
    "contextVersion": "2026-07-10T16:00:00Z",
    "checksumSha256": "def..."
  },
  "summary": {
    "addedCount": 12,
    "removedCount": 0,
    "changedCount": 4,
    "deprecatedCount": 1,
    "supersededCount": 1,
    "pendingCount": 2
  },
  "added": [
    {
      "path": "Manifest/bootstrap.json",
      "kind": "protocol-module",
      "description": "Self-describing capsule entry point"
    },
    {
      "path": "Graph/memory-graph.json",
      "kind": "protocol-module",
      "description": "Studio OS system relationship graph"
    }
  ],
  "removed": [],
  "changed": [
    {
      "path": "CurrentSprint/handoff.md",
      "changeType": "content",
      "summary": "Sprint updated to AI Context Protocol; blockers unchanged",
      "previousHash": "sha256:...",
      "currentHash": "sha256:..."
    }
  ],
  "deprecated": [
    {
      "term": "EXPORT_SPECIFICATION v1 as primary",
      "reason": "Superseded by AI_CONTEXT_CAPSULE_SPECIFICATION v2",
      "replacement": "AI_CONTEXT_CAPSULE_SPECIFICATION.md"
    }
  ],
  "superseded": [
    {
      "id": "dec-flat-export-primary",
      "by": "dec-capsule-v2-zip",
      "summary": "Flat markdown export is appendix; ZIP capsule is canonical"
    }
  ],
  "pending": [
    {
      "item": "Layer 1 auth repair sprint",
      "status": "documented-as-blocker-not-fix"
    },
    {
      "item": "HQ Archive export button",
      "status": "roadmap-only"
    }
  ],
  "decisionDiff": [
    {
      "action": "added",
      "decisionId": "dec-2026-07-10-ai-context-protocol",
      "title": "AI Context Protocol as canonical onboarding standard"
    }
  ],
  "graphDiff": {
    "nodesAdded": ["ai-context-protocol", "institutional-memory-engine"],
    "edgesAdded": [
      { "from": "studio-archive", "to": "ai-context-protocol", "type": "exports" }
    ]
  },
  "readOrderDelta": {
    "prepend": ["Manifest/bootstrap.json", "Manifest/health.json"],
    "append": []
  }
}
```

---

## Diff categories

| Category | Meaning |
|----------|---------|
| **Added** | New files, terms, decisions, graph nodes |
| **Removed** | Deliberately stripped (rare; log reason) |
| **Changed** | Content hash or semantic change |
| **Deprecated** | Still present but must not be used in new work |
| **Superseded** | Replaced by newer decision or doc |
| **Pending** | Known gap — not yet in canon |

---

## Export types and diff behavior

| exportType | Diff behavior |
|------------|---------------|
| `full` | No baseCapsule; knowledge-diff optional snapshot vs last export |
| `incremental` | Required knowledge-diff.json |
| `sprint` | Diff scoped to sprint-touched sections |
| `milestone` | Diff + timeline event anchor |
| `handoff-only` | Minimal diff — handoff + blockers only |

---

## AI import workflow

```
IF knowledge-diff.json present:
  1. Read diff summary first
  2. Load only changed + added paths (unless confidence < threshold)
  3. Merge understanding with prior session context
  4. Note deprecated/superseded in onboarding report
ELSE:
  Full readOrder ingest
```

---

## Generation algorithm (spec)

1. Load `previousCapsuleReference` from manifest  
2. Compare file checksums from both manifests  
3. Semantic diff on JSON modules (decisions, canon, graph)  
4. Changelog cross-check for decision diff  
5. Compute summary counts  
6. Fail export if incremental requested but no previous reference  

---

## Relationship to Git

| Git | Knowledge Diff |
|-----|----------------|
| `git diff A B` | `knowledge-diff.json` |
| Commit range | `baseCapsule` → `targetCapsule` |
| Rename detection | Path change in `changed[]` with `changeType: rename` |

Protocol memory diff is **content-oriented**, not line-oriented — optimized for AI ingestion.

---

*Protocol module — specification only*
