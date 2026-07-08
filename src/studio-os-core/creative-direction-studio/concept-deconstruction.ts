import type { CreativeConceptFuture, SceneDeconstructionLayer } from './creative-pipeline-types';
import { analyzeConceptAssetReuse } from './concept-reuse';

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

const LAYER_DEFS: Array<{
  kind: SceneDeconstructionLayer['kind'];
  label: string;
  field: keyof CreativeConceptFuture;
}> = [
  { kind: 'environment', label: 'Environment Shell™', field: 'environment' },
  { kind: 'lighting', label: 'Lighting™', field: 'lighting' },
  { kind: 'architecture', label: 'Architecture™', field: 'architecture' },
  { kind: 'materials', label: 'Materials™', field: 'materials' },
  { kind: 'furniture', label: 'Furniture™', field: 'furniture' },
  { kind: 'props', label: 'Props™', field: 'furniture' },
  { kind: 'atmosphere', label: 'Atmosphere™', field: 'atmosphere' },
  { kind: 'particles', label: 'Particles™', field: 'atmosphere' },
  { kind: 'hero-objects', label: 'Hero Objects™', field: 'heroObjects' },
  { kind: 'animations', label: 'Animations™', field: 'motionLanguage' },
  { kind: 'textures', label: 'Textures™', field: 'materials' },
  { kind: 'audio', label: 'Audio™', field: 'atmosphere' },
];

/** Scene Deconstruction™ — reverse-engineer approved concept into reusable assets. */
export function deconstructApprovedConcept(
  concept: CreativeConceptFuture,
  projectId: string
): SceneDeconstructionLayer[] {
  const reusePlan = analyzeConceptAssetReuse(projectId, concept);

  return LAYER_DEFS.map((def, index) => {
    const reuse = reusePlan.layers[index % reusePlan.layers.length];
    return {
      id: uid('decon'),
      kind: def.kind,
      label: def.label,
      sourceConceptId: concept.id,
      reusable: reuse.reusable,
      reuseSource: reuse.reuseSource,
      generateRequired: reuse.generateRequired,
      estimatedCost: reuse.generateRequired ? reuse.estimatedCost : '$0 (reuse)',
    };
  });
}

export function deconstructionSummaryLines(layers: SceneDeconstructionLayer[]): string[] {
  const reuse = layers.filter((l) => l.reusable && !l.generateRequired).length;
  const generate = layers.filter((l) => l.generateRequired).length;
  return [
    `${layers.length} components identified`,
    `${reuse} reusable · ${generate} to generate`,
    'Every layer becomes an independent Asset Registry™ entry',
  ];
}
