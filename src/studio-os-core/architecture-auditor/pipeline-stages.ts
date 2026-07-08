/**
 * Studio World™ complete production pipeline — Architecture Auditor™ at stage 7.
 */

export type StudioWorldPipelineStageId =
  | 'founder-intent'
  | 'creative-intelligence'
  | 'scene-planner'
  | 'asset-intelligence'
  | 'generation-gate'
  | 'scene-assembly'
  | 'architecture-auditor'
  | 'experience-intelligence'
  | 'quality-inspector'
  | 'founder-approval'
  | 'deploy';

export type StudioWorldPipelineStage = {
  id: StudioWorldPipelineStageId;
  order: number;
  label: string;
  description: string;
};

export const STUDIO_WORLD_PRODUCTION_PIPELINE: StudioWorldPipelineStage[] = [
  { id: 'founder-intent', order: 1, label: 'Founder Intent™', description: 'Raw creative intent captured' },
  { id: 'creative-intelligence', order: 2, label: 'Creative Intelligence Engine™', description: 'Reuse vs generate decision' },
  { id: 'scene-planner', order: 3, label: 'Scene Planner™', description: 'Station and layer plan' },
  { id: 'asset-intelligence', order: 4, label: 'Asset Intelligence Engine™', description: 'Registry search and reuse' },
  { id: 'generation-gate', order: 5, label: 'Generation Gate™', description: 'Token and cost approval' },
  { id: 'scene-assembly', order: 6, label: 'Scene Assembly™', description: 'Layer compositing and runtime mount' },
  {
    id: 'architecture-auditor',
    order: 7,
    label: 'Architecture Auditor™',
    description: 'Studio World integrity — physical place law, webpage detection, Scene Stack™, continuity',
  },
  {
    id: 'experience-intelligence',
    order: 8,
    label: 'Experience Intelligence Engine™',
    description: 'Creative Director — magic, wonder, luxury, discovery, founder delight',
  },
  { id: 'quality-inspector', order: 9, label: 'Quality Inspector™', description: 'Visual and experiential QA' },
  { id: 'founder-approval', order: 10, label: 'Founder Approval™', description: 'Golden Build™ certification' },
  { id: 'deploy', order: 11, label: 'Deploy™', description: 'Live™ promotion to Studio World' },
];

export function getPipelineStage(id: StudioWorldPipelineStageId): StudioWorldPipelineStage {
  const stage = STUDIO_WORLD_PRODUCTION_PIPELINE.find((s) => s.id === id);
  if (!stage) throw new Error(`Unknown pipeline stage: ${id}`);
  return stage;
}

export function stageComesBefore(a: StudioWorldPipelineStageId, b: StudioWorldPipelineStageId): boolean {
  return getPipelineStage(a).order < getPipelineStage(b).order;
}
