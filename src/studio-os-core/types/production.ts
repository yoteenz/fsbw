/**
 * StudioOS Production — pipeline and builder platform types.
 */

export type ProductionStageId =
  | 'brief'
  | 'script'
  | 'assets'
  | 'generation'
  | 'review'
  | 'publish'
  | 'archive';

export type ProductionDepartmentStatus = 'waiting' | 'working' | 'ready' | 'complete';

export type ProductionOutputTypeId =
  | 'episode'
  | 'short'
  | 'carousel'
  | 'email'
  | 'thumbnail'
  | 'social'
  | 'product'
  | 'campaign';

export type ProductionScene = {
  id: string;
  title: string;
  status: ProductionDepartmentStatus;
  notes?: string;
};

export type ProductionDraft = {
  id: string;
  title: string;
  stage: ProductionStageId;
  scenes: ProductionScene[];
  status: string;
};

/** Platform show record — workspace adapters supply concrete instances. */
export type WorkspaceShowRecord = {
  id: string;
  name: string;
  description: string;
  host: string;
  openingLine: string;
  closingLine: string;
  environment: string;
  membershipTier: string;
  publishingFrequency: string;
  thumbnailStyle: string;
  music: string;
  transitions: string;
  voiceStyle: string;
  promptTemplate: string;
  cta: string;
  rewardIntegration: string;
  brandColors: string;
  thumbnailSrc: string;
  accentHex: string;
};

export type AiProductionProviderId = 'openai' | 'fal' | 'openart' | 'voice' | 'resend' | 'future';

export type AiProductionRunStatus = 'draft' | 'running' | 'paused' | 'draft-complete' | 'rejected';
