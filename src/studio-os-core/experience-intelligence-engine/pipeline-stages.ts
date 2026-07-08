/**
 * Studio World™ production pipeline — Experience Intelligence Engine™ at stage 8.
 */

export type ExperiencePipelineStageId =
  | 'founder-intent'
  | 'creative-intelligence'
  | 'asset-intelligence'
  | 'generation-gate'
  | 'scene-assembly'
  | 'architecture-auditor'
  | 'experience-intelligence'
  | 'quality-inspector'
  | 'founder-approval'
  | 'deploy';

export type ExperiencePipelineStage = {
  id: ExperiencePipelineStageId;
  order: number;
  label: string;
  description: string;
};

export const STUDIO_WORLD_EXPERIENCE_PIPELINE: ExperiencePipelineStage[] = [
  { id: 'founder-intent', order: 1, label: 'Founder Intent™', description: 'Raw creative intent captured' },
  { id: 'creative-intelligence', order: 2, label: 'Creative Intelligence Engine™', description: 'Reuse vs generate decision' },
  { id: 'asset-intelligence', order: 3, label: 'Asset Intelligence Engine™', description: 'Registry search and reuse' },
  { id: 'generation-gate', order: 4, label: 'Generation Gate™', description: 'Token and cost approval' },
  { id: 'scene-assembly', order: 5, label: 'Scene Assembly™', description: 'Layer compositing and runtime mount' },
  {
    id: 'architecture-auditor',
    order: 6,
    label: 'Architecture Auditor™',
    description: 'Physical place law · webpage detection · Scene Stack™ · continuity',
  },
  {
    id: 'experience-intelligence',
    order: 7,
    label: 'Experience Intelligence Engine™',
    description: 'Creative Director — magic, wonder, luxury, discovery, flow, founder delight',
  },
  { id: 'quality-inspector', order: 8, label: 'Quality Inspector™', description: 'Visual and technical QA' },
  { id: 'founder-approval', order: 9, label: 'Founder Approval™', description: 'Golden Build™ certification' },
  { id: 'deploy', order: 10, label: 'Deploy™', description: 'Live™ promotion to Studio World' },
];
