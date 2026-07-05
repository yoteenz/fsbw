/** Production Studio — cinematic content production headquarters. */

import type {
  PRODUCTION_ASSET_TYPES,
  PRODUCTION_PIPELINE_STAGES,
  PRODUCTION_QUEUE_STATUSES,
} from './constants';

export type ProductionPipelineStageId = (typeof PRODUCTION_PIPELINE_STAGES)[number]['id'];
export type ProductionQueueStatusId = (typeof PRODUCTION_QUEUE_STATUSES)[number]['id'];
export type ProductionAssetTypeId = (typeof PRODUCTION_ASSET_TYPES)[number]['id'];

export type ProductionAssetStatus = 'pending' | 'generating' | 'ready' | 'overridden';

export type ProductionAsset = {
  type: ProductionAssetTypeId;
  status: ProductionAssetStatus;
  aiValue: string;
  founderOverride?: string;
};

export type ProductionSceneCard = {
  id: string;
  label: string;
  durationSec: number;
  visualNote: string;
};

export type ProductionPlatformVersion = {
  platform: string;
  aspect: string;
  runtimeSec: number;
  status: 'draft' | 'optimized' | 'approved';
};

export type ProductionIntelligence = {
  hookImprovement: string;
  thumbnailRecommendation: string;
  voiceRecommendation: string;
  estimatedRetentionPct: number;
  confidenceScore: number;
  predictedPerformance: string;
  productionRecommendations: string[];
};

export type ProductionJob = {
  id: string;
  pageTitle: string;
  pageRoute: string;
  approvedAt: string;
  queueStatus: ProductionQueueStatusId;
  pipelineStage: ProductionPipelineStageId;
  estimatedRuntimeSec: number;
  hostName: string;
  voiceProfile: string;
  assets: ProductionAsset[];
  scenes: ProductionSceneCard[];
  waveform: number[];
  platformVersions: ProductionPlatformVersion[];
  productionNotes: string[];
  intelligence: ProductionIntelligence;
  thumbnailPreview: string;
};

export type ProductionStudioStore = {
  version: string;
  lastUpdatedAt: string;
  companyName: string;
  selectedJobId: string | null;
  queueFilter: ProductionQueueStatusId | 'all';
  dashboard: {
    summary: string;
    jobsReady: number;
    jobsInProduction: number;
    jobsRendering: number;
    jobsNeedsReview: number;
    jobsCompleted: number;
    avgConfidencePct: number;
    pagesAwaitingProduction: number;
  };
  philosophy: string[];
  jobs: ProductionJob[];
};

export type ProductionStudioFieldOverride = {
  jobId: string;
  assetType: ProductionAssetTypeId;
  value: string;
};
