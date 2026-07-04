/**
 * Experiment Engine — auto-create experiment on every published asset.
 */

import { LABS_VERSION } from './constants';
import type { Experiment, ExperimentVariables, PerformanceMetrics, PublishAssetInput } from './types';

function generateExperimentId(): string {
  return `exp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function emptyMetrics(): PerformanceMetrics {
  const now = new Date().toISOString();
  return {
    views: 0,
    watchTimeSec: 0,
    averageViewDurationSec: 0,
    completionRate: 0,
    rewatches: 0,
    likes: 0,
    shares: 0,
    comments: 0,
    saves: 0,
    follows: 0,
    profileVisits: 0,
    websiteClicks: 0,
    emailSignups: 0,
    affiliateClicks: 0,
    sales: 0,
    revenue: 0,
    platformRpm: 0,
    platformCpm: 0,
    platformCpc: 0,
    engagementRate: 0,
    conversionRate: 0,
    returnViewers: 0,
    retentionCurve: [],
    audienceDemographics: '',
    trafficSources: '',
    collectedAt: now,
  };
}

function buildVariables(input: PublishAssetInput): ExperimentVariables {
  const now = new Date();
  return {
    topic: input.topic,
    pillar: input.pillar,
    series: input.series ?? '',
    campaign: input.campaign ?? '',
    workspace: input.workspaceId,
    publishingPlatform: input.publishingPlatform ?? 'tiktok',
    publishDate: input.publishDate ?? now.toISOString().slice(0, 10),
    publishTime: input.publishTime ?? now.toISOString().slice(11, 16),
    hook: input.hook,
    openingLine: input.openingLine ?? '',
    script: input.script ?? '',
    storyboard: input.storyboard ?? '',
    voice: input.voice ?? 'voice-a',
    thumbnail: input.thumbnail ?? '',
    caption: input.caption ?? '',
    hashtags: input.hashtags ?? [],
    cta: input.cta ?? '',
    music: input.music ?? '',
    videoDurationSec: input.videoDurationSec ?? 0,
    animationStyle: input.animationStyle ?? '',
    editingStyle: input.editingStyle ?? '',
    aiModelsUsed: input.aiModelsUsed ?? [],
    promptVersions: input.promptVersions ?? [],
    creativeDnaVersion: input.creativeDnaVersion ?? 'v1.0',
    writingBibleVersion: input.writingBibleVersion ?? 'v1.0',
    companyDnaVersion: input.companyDnaVersion ?? 'v1.0',
  };
}

/** Create a new experiment from a published asset — every publish becomes an experiment. */
export function createExperimentFromPublish(input: PublishAssetInput): Experiment {
  const id = generateExperimentId();
  const now = new Date().toISOString();
  return {
    id,
    workspaceId: input.workspaceId,
    status: 'active',
    variables: buildVariables(input),
    metrics: emptyMetrics(),
    knowledgeGraphNodeId: `node-experiment-${id}`,
    createdAt: now,
    updatedAt: now,
  };
}

export function experimentSummary(experiment: Experiment): string {
  const v = experiment.variables;
  return `${v.topic} · ${v.pillar} · ${v.publishingPlatform} · ${experiment.status}`;
}

export { LABS_VERSION };
