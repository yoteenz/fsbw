# Project Memory Graph

**Capsule path:** `Graph/memory-graph.json`  
**Purpose:** Export **relationships**, not only files.

---

## Graph model

Nodes = concepts, systems, docs, decisions, people-roles (AI professors), milestones.  
Edges = typed relationships.

```json
{
  "schemaVersion": 1,
  "generatedAt": "ISO-8601",
  "nodes": [
    {
      "id": "genesis-core",
      "kind": "system",
      "label": "Genesis Core™",
      "canonRef": "docs/studio-os/genesis/",
      "maturity": "constitutional"
    },
    {
      "id": "world-compiler",
      "kind": "system",
      "label": "World Compiler™",
      "codeRef": "src/studio-os-core/scene-stack/world-compiler/"
    },
    {
      "id": "experience-lab",
      "kind": "system",
      "label": "Experience Lab™",
      "status": "blocked-layer-1-auth"
    }
  ],
  "edges": [
    {
      "from": "genesis-core",
      "to": "world-compiler",
      "type": "governs",
      "weight": 1.0
    },
    {
      "from": "world-compiler",
      "to": "experience-lab",
      "type": "powers",
      "weight": 1.0
    },
    {
      "from": "experience-lab",
      "to": "studio-atlas",
      "type": "preview-context-for",
      "weight": 0.8
    },
    {
      "from": "studio-institute",
      "to": "learning-dna",
      "type": "implements",
      "weight": 1.0
    },
    {
      "from": "learning-dna",
      "to": "knowledge-graph",
      "type": "feeds",
      "weight": 0.9
    },
    {
      "from": "knowledge-graph",
      "to": "studio-atlas",
      "type": "projects-to",
      "weight": 1.0
    },
    {
      "from": "studio-headquarters",
      "to": "studio-archive",
      "type": "contains",
      "weight": 1.0
    }
  ],
  "clusters": [
    { "id": "compile-pipeline", "label": "Compile Pipeline", "nodeIds": ["world-compiler", "experience-lab", "scene-stack"] }
  ]
}
```

---

## Canonical Studio OS spine (seed)

```
Genesis Core
    ↓ governs
World Compiler
    ↓ powers
Experience Lab
    ↓ preview-context-for
Studio Atlas / Studio World geography
    ↓ connected-via
Studio Institute
    ↓ implements
Learning DNA
    ↓ feeds
Living Knowledge Graph
    ↓ projects-to
Studio Atlas
    ↓ hosted-in
Studio Headquarters → Studio Archive
```

---

## Edge types (extensible)

| Type | Meaning |
|------|---------|
| `governs` | Constitutional / policy authority |
| `powers` | Runtime dependency |
| `implements` | Realizes design |
| `feeds` | Data/intelligence flow |
| `projects-to` | Geographic projection |
| `contains` | Spatial containment |
| `blocked-by` | Active blocker |
| `supersedes` | Replaced relationship |
| `documents` | Doc describes system |

---

## Generation sources

- `docs/studio-world/` bibles
- `AI_GLOSSARY.md` term relationships
- `AI_CHANGELOG.md` decision dependencies
- `motherboard/CODEBASE.md` code paths
- World Graph compile output (future sync)

---

## AI queries enabled

- "What depends on World Compiler?"
- "Show path from Genesis to Experience Lab"
- "What is blocked right now?"
- "What canon docs describe this node?"

---

*Protocol module — specification only*
