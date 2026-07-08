/**
 * Studio World Physics™ — immutable natural laws of the civilization.
 * Comparable to gravity. Nothing inside Studio World may violate these rules.
 */

import type { FoundationalPhysicsLaw } from './types';

export const WORLD_PHYSICS_PREAMBLE =
  'World Physics™ defines what is fundamentally possible inside Studio World. These are natural laws — not policies. The Constitution governs behavior; Physics governs reality.';

export const FOUNDATIONAL_PHYSICS_LAWS: FoundationalPhysicsLaw[] = [
  {
    id: 'physical-place-law',
    number: 1,
    title: 'Physical Place Law™',
    summary: 'Every object must physically exist somewhere inside Studio World. Everything has a home.',
    violation: 'Orphan objects, webpage-only features, and disconnected modules cannot exist as canon.',
    examples: ['Room in a wing', 'Engine in a flagship', 'Publication in Archives', 'Asset in Warehouse'],
    enforcementPaths: [
      'src/studio-os-core/architecture-auditor/',
      'src/studio-os-core/studio-world/route-registry.ts',
    ],
  },
  {
    id: 'relationship-gravity',
    number: 2,
    title: 'Relationship Gravity™',
    summary: 'Nothing exists in isolation. Every node attracts relationships. Unrelated objects are incomplete.',
    violation: 'Nodes without meaningful edges are incomplete — not ready for canon.',
    examples: ['depends-on', 'located-in', 'integrates-with', 'spawned-from', 'reused-by'],
    enforcementPaths: ['src/studio-os-core/world-graph/validator.ts'],
  },
  {
    id: 'knowledge-conservation',
    number: 3,
    title: 'Knowledge Conservation™',
    summary:
      'Knowledge is never destroyed. Objects may evolve, archive, or become historical — never simply disappear.',
    violation: 'Hard deletes of canon nodes, erasing history, or silent removal of approved work.',
    examples: ['Spark → Legacy lifecycle', 'supersedes chains', 'historical plane', 'deprecated-by edges'],
    enforcementPaths: ['src/studio-os-core/world-graph/lifecycle.ts'],
  },
  {
    id: 'identity-persistence',
    number: 4,
    title: 'Identity Persistence™',
    summary: 'Every object has one permanent identity. Versions evolve. Identity remains.',
    violation: 'Renaming W-IDs, forked truth without supersedes, or duplicate competing identities.',
    examples: ['W-FLG-studio-archives', 'W-ENG-world-graph', 'versioned lifecycle without id change'],
    enforcementPaths: ['src/studio-os-core/world-graph/id.ts'],
  },
  {
    id: 'scene-integrity',
    number: 5,
    title: 'Scene Integrity™',
    summary:
      'Approved Scene Graph layers cannot mutate other approved layers. Only the active layer may change.',
    violation: 'Sending prior approved generative layers back into image models; cumulative degradation.',
    examples: [
      'Environment shell as sole FAL reference',
      'Immutable approved layers',
      'Runtime composite only',
    ],
    enforcementPaths: [
      'src/studio-os-core/scene-stack/assembly-law.ts',
      'api/_lib/sceneStackReferenceEnforcement.ts',
    ],
  },
  {
    id: 'asset-conservation',
    number: 6,
    title: 'Asset Conservation™',
    summary: 'Existing assets should always be reused before regeneration. Reuse is default; generation is last resort.',
    violation: 'Regenerating assets that exist in Registry, Warehouse, or Marketplace without reuse attempt.',
    examples: ['Asset Registry™', 'reused-by traversals', 'Golden Build™', 'Blueprint Archive™'],
    enforcementPaths: ['src/studio-os-core/studio-warehouse/'],
  },
  {
    id: 'blueprint-determinism',
    number: 7,
    title: 'Blueprint Determinism™',
    summary:
      'Given the same Blueprint, Scene Graph, Asset Registry, and generation settings — Studio World produces an equivalent result.',
    violation: 'Non-reproducible builds, undocumented prompt drift, or untracked generation variance.',
    examples: ['Master Scene Blueprint™', 'prompt version pins', 'scene-stack.v2', 'golden-build nodes'],
    enforcementPaths: ['src/studio-os-core/scene-stack/master-scene-blueprint.ts'],
  },
  {
    id: 'spatial-continuity',
    number: 8,
    title: 'Spatial Continuity™',
    summary:
      'Departments are physical destinations. Rooms → wings → headquarters → districts → Atlas. No disconnected place.',
    violation: 'Floating pages, broken walkways, destinations invisible on Atlas, orphaned routes.',
    examples: ['Studio World Atlas™', 'flagship-destinations', 'Global Atlas Layer™', 'located-in edges'],
    enforcementPaths: [
      'src/studio-os-core/studio-world-atlas/',
      'src/studio-os-core/global-atlas-layer/',
    ],
  },
  {
    id: 'temporal-continuity',
    number: 9,
    title: 'Temporal Continuity™',
    summary:
      'Everything has a timeline, history, origin, and evolution. All history is explorable.',
    violation: 'State without provenance, features without lifecycle, decisions without historical chain.',
    examples: ['historical-event nodes', 'supersedes', 'provenance.ingestedAt', 'Executive Timeline™'],
    enforcementPaths: ['src/studio-os-core/world-graph/'],
  },
  {
    id: 'world-memory',
    number: 10,
    title: 'World Memory™',
    summary: 'The World Graph™ remembers everything. Documentation is one projection of that memory.',
    violation: 'Competing sources of truth, markdown canon outside the graph, projections overriding graph.',
    examples: ['World Graph Is Truth™', 'Bible as publication', 'Knowledge Library as projection'],
    enforcementPaths: [
      'src/studio-os-core/world-graph/',
      'scripts/compile-world-graph-runner.ts',
    ],
  },
];

export function getFoundationalPhysicsLaw(
  id: FoundationalPhysicsLaw['id'],
): FoundationalPhysicsLaw {
  const law = FOUNDATIONAL_PHYSICS_LAWS.find((l) => l.id === id);
  if (!law) throw new Error(`Unknown physics law: ${id}`);
  return law;
}
