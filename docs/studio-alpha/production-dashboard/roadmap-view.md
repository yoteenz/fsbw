# Roadmap View™

**Module:** `studio-alpha.production-dashboard.v1.roadmap`  
**Status:** Hierarchical production progress tree

---

## Hierarchy

```
Studio World™
    ↓
Department™
    ↓
Scene™
    ↓
Station™
    ↓
Layer™
    ↓
Asset™
```

Every node displays **production progress**.

---

## Roadmap Node Schema

```yaml
RoadmapNode:
  nodeId: string
  nodeType: studio_world | department | scene | station | layer | asset
  label: string
  completionPercent: number
  status: not_started | in_progress | blocked | complete | golden
  costUsd: number
  estimatedRemainingUsd: number
  children: RoadmapNode[]
  metadata:
    goldenBuildStatus: string | null
    blueprintId: string | null
    queueStatus: string | null
```

---

## Visual Layout (Spec)

```
Studio World™                           34%  $18,442 / $59,642 est.
├── Creative Direction Studio™        72%  $1,842
│   ├── Story Table™ (scene)            88%
│   │   ├── Arrival (station)         100%
│   │   ├── Story Table (station)        92%
│   │   │   ├── environment-shell      Golden
│   │   │   ├── signature-landmark     Golden
│   │   │   ├── lighting-systems       Generating
│   │   │   └── ...
│   │   └── Mood Wall™ (scene)          64%
│   └── Observatory™ (scene)            45%
├── Finance™                            18%  $412
│   └── Capital Vault™                  22%
└── Hiring™                             8%   $186
    └── Talent Observatory™             12%
```

---

## Node Status Colors (Future UI)

| Status | Meaning |
|--------|---------|
| **Not started** | No generation scoped |
| **In progress** | Active production |
| **Blocked** | Dependency or approval block |
| **Complete** | Approved · not yet golden |
| **Golden** | Golden version designated |

---

## Progress Roll-Up

```
node.completion = weighted average of children.completion
  OR layer/asset specific rules at leaf nodes
```

Leaf asset nodes: `approved ? 100 : generationInProgress ? 50 : 0`

---

## Navigation

Click any node → drill to relevant module:

| Node type | Opens |
|-----------|-------|
| Department | [Department Analytics](./department-analytics.md) |
| Scene / Layer | [Scene Analytics](./scene-analytics.md) |
| Asset | [Asset ROI™](./asset-roi.md) |
| Any · queue active | [Production Queue](./production-queue.md) |

---

## Build Plan Sync

Roadmap tree structure syncs from Studio World™ **build plan manifest** — authoritative list of departments · scenes · stations to manufacture.

---

_Roadmap View™ — civilization scale, node by node._
