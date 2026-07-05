import type { RENDER_PIPELINE_STAGES } from './constants';

export type RenderPipelineStageId = (typeof RENDER_PIPELINE_STAGES)[number]['id'];

export type RenderControlState = 'running' | 'paused' | 'cancelled' | 'complete';

export type RenderPriority = 'normal' | 'high';

export type RenderJob = {
  id: string;
  productionTitle: string;
  pageRoute: string;
  stage: RenderPipelineStageId;
  controlState: RenderControlState;
  priority: RenderPriority;
  batchId?: string;
  progressPct: number;
  startedAt: string;
  elapsedSec: number;
  estimatedCompletionSec: number;
  aiWorker: string;
  confidencePct: number;
  warnings: string[];
  sourceProductionJobId?: string;
};

export type RenderIntelligenceAlert = {
  id: string;
  renderJobId: string;
  message: string;
  severity: 'info' | 'warning';
  createdAt: string;
};

export type RenderQueueStore = {
  version: string;
  lastUpdatedAt: string;
  companyName: string;
  selectedRenderId: string | null;
  batchMode: boolean;
  selectedBatchIds: string[];
  dashboard: {
    summary: string;
    activeRenders: number;
    pausedRenders: number;
    queuedCount: number;
    readyForReview: number;
    avgConfidencePct: number;
    floorActivityPct: number;
  };
  philosophy: string[];
  renders: RenderJob[];
  intelligenceAlerts: RenderIntelligenceAlert[];
};
