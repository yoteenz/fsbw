# Studio World Knowledge Repository

**Parent system:** [World Graph™](../../docs/studio-os/world-graph/STUDIO_WORLD_GRAPH_ARCHITECTURE.md)

This folder holds **canonical knowledge artifacts** that compile into the World Graph™.  
The graph is truth; these files are structured canon inputs and schema definitions.

**Article K22 — Studio World Knowledge Core™:** Studio World should not rely on external AI memory. The Knowledge Core is the internal memory of the civilization: domains, statuses, prompt memory, Architect's Memory™, and searchable entries that compile into `knowledge-object` nodes.

**Article K23 — Studio World Memory System™:** Conversations are history, knowledge is understanding, and canon is approval. Raw conversations live in `knowledge/archive/conversations/`; extraction reports live in `knowledge/working/extraction-reports/`; only reviewed knowledge enters the Knowledge Core.

**Article D09 — Hero Objects™ & Contextual Orb™:** Studio World navigation uses collectible living artifacts, not software icons. Hero Objects are manufactured by Studio Foundry™, registered in Asset Registry™, tracked by World Graph™, and surfaced contextually through the Orb™.

## Structure

```
knowledge/
├── schema/          # Node types, edge types, lifecycle states
├── canon/           # Approved constitutional and architectural truth
├── registry/        # Master indexes (future)
├── working/         # Lifecycle < Approved (future)
├── historical/      # Superseded canon (future)
├── publications/    # Bible volumes — projections (future)
└── .generated/      # CI output (graph projections)
```

## Rules

1. Every canon file should map to a `W-*` World Graph node ID.
2. Promote Working → Canon only through Review™.
3. Never duplicate truth in `docs/` without a graph node reference.
4. Only **Canon™** Knowledge Entries may influence future architecture automatically.
5. Never overwrite major history; create a new version and preserve the previous entry.
6. Never confuse Conversation Archive™ with Canon™; extraction requires Architect Review™ before promotion.

## Compile

```bash
npm run compile-world-graph
```

Output: `public/studio-os/world-graph/graph.json`
