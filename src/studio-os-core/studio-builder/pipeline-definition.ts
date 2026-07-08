/** Creative Approval Pipeline™ — canonical 10-stage director workflow. */

export type PipelineStageId =
  | 'environment-shell'
  | 'lighting'
  | 'architecture'
  | 'furniture'
  | 'hero-objects'
  | 'decor'
  | 'interactive-objects'
  | 'ambient-systems'
  | 'runtime'
  | 'golden-build-review';

export type PipelineStageDefinition = {
  id: PipelineStageId;
  order: number;
  displayName: string;
  productionGroupId: string;
  downstreamImpact: string[];
  requiresGeneration: boolean;
};

export const CREATIVE_APPROVAL_PIPELINE_STAGES: PipelineStageDefinition[] = [
  {
    id: 'environment-shell',
    order: 1,
    displayName: 'Environment Shell™',
    productionGroupId: 'environment',
    downstreamImpact: ['Lighting', 'Reflections', 'Camera Paths', 'Furniture Placement'],
    requiresGeneration: true,
  },
  {
    id: 'lighting',
    order: 2,
    displayName: 'Lighting™',
    productionGroupId: 'lighting',
    downstreamImpact: ['Material Read', 'Hero Object Highlights', 'Ambient FX'],
    requiresGeneration: true,
  },
  {
    id: 'architecture',
    order: 3,
    displayName: 'Architecture™',
    productionGroupId: 'architecture',
    downstreamImpact: ['Furniture Placement', 'Window Reflections', 'Walk Paths'],
    requiresGeneration: true,
  },
  {
    id: 'furniture',
    order: 4,
    displayName: 'Furniture™',
    productionGroupId: 'furniture',
    downstreamImpact: ['Hero Object Placement', 'Decor Layering', 'Interaction Zones'],
    requiresGeneration: true,
  },
  {
    id: 'hero-objects',
    order: 5,
    displayName: 'Hero Objects™',
    productionGroupId: 'hero-objects',
    downstreamImpact: ['Decor Accents', 'Interactive Bindings', 'Orb Behaviors'],
    requiresGeneration: true,
  },
  {
    id: 'decor',
    order: 6,
    displayName: 'Decor™',
    productionGroupId: 'decor',
    downstreamImpact: ['Ambient Density', 'Visual Clutter', 'Idle Life Props'],
    requiresGeneration: true,
  },
  {
    id: 'interactive-objects',
    order: 7,
    displayName: 'Interactive Objects™',
    productionGroupId: 'interactive-objects',
    downstreamImpact: ['Runtime Interactions', 'Walk the Room Stops'],
    requiresGeneration: true,
  },
  {
    id: 'ambient-systems',
    order: 8,
    displayName: 'Ambient Systems™',
    productionGroupId: 'ambient-systems',
    downstreamImpact: ['Idle Life™', 'Audio Atmosphere', 'Particle Layers'],
    requiresGeneration: true,
  },
  {
    id: 'runtime',
    order: 9,
    displayName: 'Runtime™',
    productionGroupId: 'runtime',
    downstreamImpact: ['Walk the Room™', 'Navigation', 'Orb Behaviors'],
    requiresGeneration: true,
  },
  {
    id: 'golden-build-review',
    order: 10,
    displayName: 'Golden Build™ Review',
    productionGroupId: 'golden-build-review',
    downstreamImpact: ['Certification', 'Live™ Promotion'],
    requiresGeneration: false,
  },
];

export function getPipelineStage(stageId: PipelineStageId): PipelineStageDefinition {
  const stage = CREATIVE_APPROVAL_PIPELINE_STAGES.find((s) => s.id === stageId);
  if (!stage) throw new Error(`Unknown pipeline stage: ${stageId}`);
  return stage;
}

export function getNextPipelineStage(stageId: PipelineStageId): PipelineStageDefinition | null {
  const current = getPipelineStage(stageId);
  return CREATIVE_APPROVAL_PIPELINE_STAGES.find((s) => s.order === current.order + 1) ?? null;
}

export function getDownstreamApprovedStages(
  stageId: PipelineStageId,
  approvedStageIds: PipelineStageId[]
): PipelineStageDefinition[] {
  const current = getPipelineStage(stageId);
  return CREATIVE_APPROVAL_PIPELINE_STAGES.filter(
    (s) => s.order > current.order && approvedStageIds.includes(s.id)
  );
}
