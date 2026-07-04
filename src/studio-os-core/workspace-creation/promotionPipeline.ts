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
    {
      id: 'promo-labs-v1',
      featureName: 'Studio OS Labs + Experiment Engine v1.0',
      description: 'Every published asset becomes an experiment — learning engine, hook/thumbnail/caption intel, benchmarks, promotion pipeline.',
      currentStage: 'deploy-pilot',
      pilotWorkspaceId: DEFAULT_PILOT_WORKSPACE_ID,
      productionWorkspaceId: DEFAULT_PRODUCTION_WORKSPACE_ID,
      updatedAt: now,
    },
    {
      id: 'promo-ai-media-network-v1',
      featureName: 'AI Media Network v1.0',
      description: 'Digital media network — Company DNA, pillars, programming, calendar, monetization, Labs integration.',
      currentStage: 'deploy-pilot',
      pilotWorkspaceId: DEFAULT_PILOT_WORKSPACE_ID,
      productionWorkspaceId: DEFAULT_PRODUCTION_WORKSPACE_ID,
      updatedAt: now,
    },
    {
      id: 'promo-talent-network-v1',
      featureName: 'Talent Network v1.0',
      description: 'Unified talent OS — AI + human registry, casting, wardrobe, contracts, talent score, character evolution, Growth Network bridge.',
      currentStage: 'develop',
      pilotWorkspaceId: DEFAULT_PILOT_WORKSPACE_ID,
      productionWorkspaceId: DEFAULT_PRODUCTION_WORKSPACE_ID,
      updatedAt: now,
    },
    {
      id: 'promo-marketplace-v1',
      featureName: 'Marketplace + Business Ecosystem v1.0',
      description: 'Professional operating network — intelligent matching, deal center, collaboration hubs, trust, payment architecture, relationship-first ecosystem.',
      currentStage: 'develop',
      pilotWorkspaceId: DEFAULT_PILOT_WORKSPACE_ID,
      productionWorkspaceId: DEFAULT_PRODUCTION_WORKSPACE_ID,
      updatedAt: now,
    },
    {
      id: 'promo-business-model-engine-v1',
      featureName: 'Business Model Engine v1.0',
      description: 'Economic engine — membership, workspace billing, usage, platform fees, wallets, royalties, asset marketplaces, enterprise, pricing simulator.',
      currentStage: 'develop',
      pilotWorkspaceId: DEFAULT_PILOT_WORKSPACE_ID,
      productionWorkspaceId: DEFAULT_PRODUCTION_WORKSPACE_ID,
      updatedAt: now,
    },
    {
      id: 'promo-ecosystem-v1',
      featureName: 'Studio OS Ecosystem v1.0',
      description: 'Business operating ecosystem — publishing center, dependency/installation engines, creator/developer centers, asset marketplaces, enterprise libraries.',
      currentStage: 'develop',
      pilotWorkspaceId: DEFAULT_PILOT_WORKSPACE_ID,
      productionWorkspaceId: DEFAULT_PRODUCTION_WORKSPACE_ID,
      updatedAt: now,
    },
    {
      id: 'promo-governance-v1',
      featureName: 'Studio OS Governance Engine v1.0',
      description: 'Trust, quality, compliance, moderation, verification, certification, AI governance, audit center — platform constitution for responsible growth.',
      currentStage: 'develop',
      pilotWorkspaceId: DEFAULT_PILOT_WORKSPACE_ID,
      productionWorkspaceId: DEFAULT_PRODUCTION_WORKSPACE_ID,
      updatedAt: now,
    },
    {
      id: 'promo-studio-intelligence-v1',
      featureName: 'Studio Intelligence v1.0',
      description: 'Operating intelligence — executive briefings, opportunity/risk engines, business health, decision journal, learning engine, confidence scoring.',
      currentStage: 'develop',
      pilotWorkspaceId: DEFAULT_PILOT_WORKSPACE_ID,
      productionWorkspaceId: DEFAULT_PRODUCTION_WORKSPACE_ID,
      updatedAt: now,
    },
    {
      id: 'promo-simulation-engine-v1',
      featureName: 'Simulation Engine v1.0',
      description: 'Model decisions before committing — scenario comparison, risk/financial/marketing/content sims, decision support, learning loop. Not predictions.',
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
