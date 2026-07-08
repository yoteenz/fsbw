# Studio World Knowledge Repository

**Parent system:** [World Graph™](../../docs/studio-os/world-graph/STUDIO_WORLD_GRAPH_ARCHITECTURE.md)

This folder holds **canonical knowledge artifacts** that compile into the World Graph™.  
The graph is truth; these files are structured canon inputs and schema definitions.

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

## Compile

```bash
npm run compile-world-graph
```

Output: `public/studio-os/world-graph/graph.json`
