import type { PromotionPipelineItem, PromotionStage } from './types';

export const PROMOTION_STAGE_ORDER: PromotionStage[] = [
  'develop',
  'deploy-pilot',
  'production-testing',
  'analytics',
  'bug-fixes',
  'approval',
  'promote-production',
  'release-all-workspaces',
];

export const PROMOTION_STAGE_LABELS: Record<PromotionStage, string> = {
  develop: 'Develop',
  'deploy-pilot': 'Deploy to AI Media',
  'production-testing': 'Real Production Testing',
  analytics: 'Analytics',
  'bug-fixes': 'Bug Fixes',
  approval: 'Approval',
  'promote-production': 'Promote to Frontal Slayer',
  'release-all-workspaces': 'Release to Every Future Workspace',
};

export const DEFAULT_PILOT_WORKSPACE_ID = 'ai-media';
export const DEFAULT_PRODUCTION_WORKSPACE_ID = 'frontal-slayer';

export function createDefaultPromotionPipeline(): PromotionPipelineItem[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'promo-workspace-creation-engine',
      featureName: 'Workspace Creation Engine v1.0',
      description: 'Blueprint provisioning, wizard, registry, and AI executive teams.',
      currentStage: 'deploy-pilot',
      pilotWorkspaceId: DEFAULT_PILOT_WORKSPACE_ID,
      productionWorkspaceId: DEFAULT_PRODUCTION_WORKSPACE_ID,
      updatedAt: now,
    },
    {
      id: 'promo-memory-bible',
      featureName: 'Memory Bible + AI Context Builder',
      description: 'Institutional memory sections and context export for AI systems.',
      currentStage: 'production-testing',
      pilotWorkspaceId: DEFAULT_PILOT_WORKSPACE_ID,
      productionWorkspaceId: DEFAULT_PRODUCTION_WORKSPACE_ID,
      updatedAt: now,
    },
    {
      id: 'promo-photography-bible-gpt2',
      featureName: 'Photography Bible GPT Image 2 Preset',
      description: 'Locked master hero provider preset and generation package validation.',
      currentStage: 'analytics',
      pilotWorkspaceId: DEFAULT_PILOT_WORKSPACE_ID,
      productionWorkspaceId: DEFAULT_PRODUCTION_WORKSPACE_ID,
      updatedAt: now,
    },
    {
      id: 'promo-growth-network-v1',
      featureName: 'Growth Network v1.0',
      description: 'Growth profiles, opportunity engine, deal pipeline CRM, revenue center, and marketplaces.',
      currentStage: 'develop',
      pilotWorkspaceId: DEFAULT_PILOT_WORKSPACE_ID,
      productionWorkspaceId: DEFAULT_PRODUCTION_WORKSPACE_ID,
      updatedAt: now,
    },
  ];
}

export function advancePromotionStage(item: PromotionPipelineItem): PromotionPipelineItem {
  const idx = PROMOTION_STAGE_ORDER.indexOf(item.currentStage);
  if (idx < 0 || idx >= PROMOTION_STAGE_ORDER.length - 1) return item;
  return {
    ...item,
    currentStage: PROMOTION_STAGE_ORDER[idx + 1],
    updatedAt: new Date().toISOString(),
  };
}

export function promotionStageProgress(stage: PromotionStage): number {
  const idx = PROMOTION_STAGE_ORDER.indexOf(stage);
  if (idx < 0) return 0;
  return Math.round(((idx + 1) / PROMOTION_STAGE_ORDER.length) * 100);
}
