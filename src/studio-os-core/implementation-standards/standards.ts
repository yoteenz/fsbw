import type { ImplementationStandard } from './types';

/** Engineering patterns — evolve continuously; subordinate to Physics and Constitution. */
export const IMPLEMENTATION_STANDARDS: ImplementationStandard[] = [
  {
    id: 'world-graph-compile-gate',
    title: 'World Graph Compile Gate™',
    summary: 'prebuild runs compile-world-graph; build fails on dangling edges and validation errors.',
    docPaths: ['docs/studio-os/world-graph/STUDIO_WORLD_GRAPH_ARCHITECTURE.md'],
    codePaths: ['scripts/compile-world-graph-runner.ts', 'src/studio-os-core/world-graph/validator.ts'],
    implementsLaws: ['world-memory', 'no-orphan-objects', 'relationship-gravity'],
  },
  {
    id: 'w-id-registry',
    title: 'W-ID Registry™',
    summary: 'Stable World Graph IDs via worldNodeId(); prefixes per node type; no identity churn.',
    docPaths: ['knowledge/schema/node-types.yaml'],
    codePaths: ['src/studio-os-core/world-graph/id.ts'],
    implementsLaws: ['identity-persistence', 'world-memory'],
  },
  {
    id: 'route-registry-pattern',
    title: 'Route Registry Pattern™',
    summary: 'Every admin studio route registers room + flagship + located-in edge in World Graph.',
    docPaths: ['docs/studio-os/studio-world-responsibility-framework.md'],
    codePaths: ['src/studio-os-core/studio-world/route-registry.ts'],
    implementsLaws: ['physical-place-law', 'spatial-continuity'],
  },
  {
    id: 'scene-stack-prompt-version',
    title: 'Scene Stack Prompt Version™',
    summary: 'Pinned prompt versions (scene-stack.v2) for Blueprint Determinism and reproducible assembly.',
    docPaths: ['docs/studio-os/scene-stack/quality-preservation-law.md'],
    codePaths: ['src/studio-os-core/scene-stack/prompt-compiler.ts'],
    implementsLaws: ['blueprint-determinism', 'scene-integrity'],
  },
  {
    id: 'era-evaluation-gate',
    title: 'Era Evaluation Gate™',
    summary: 'Major implementations evaluated against Three Eras Roadmap before shipping.',
    docPaths: ['docs/studio-os/world-graph/STUDIO_WORLD_THREE_ERAS_ROADMAP.md'],
    codePaths: ['src/studio-os-core/world-graph/era-evaluation.ts'],
    implementsLaws: ['world-memory', 'temporal-continuity'],
  },
  {
    id: 'motherboard-sync-contract',
    title: 'Motherboard Sync Contract™',
    summary: 'Agent memory appends to MEMORY.md; graph ingestion is canon. One deploy per task.',
    docPaths: ['motherboard/ADDING.md', '.cursor/rules/one-deploy-per-task.mdc'],
    codePaths: ['motherboard/MEMORY.md'],
    implementsLaws: ['agent-memory', 'world-memory'],
  },
  {
    id: 'one-deploy-per-task',
    title: 'One Deploy Per Task™',
    summary: 'Each completed task = one commit + one push; MEMORY folded into same commit.',
    docPaths: ['.cursor/rules/one-deploy-per-task.mdc'],
    codePaths: ['scripts/agent-commit.sh'],
    implementsLaws: ['knowledge-conservation', 'temporal-continuity'],
  },
];
