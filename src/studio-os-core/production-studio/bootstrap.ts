import { PRODUCTION_ASSET_TYPES } from './constants';
import { bootstrapProductionStudioStore } from './store';
import type { ProductionAsset, ProductionJob, ProductionStudioStore } from './types';

function buildAssets(overrides: Partial<Record<string, { aiValue: string; status?: ProductionAsset['status'] }>> = {}): ProductionAsset[] {
  return PRODUCTION_ASSET_TYPES.map(({ id }) => ({
    type: id,
    status: overrides[id]?.status ?? 'ready',
    aiValue: overrides[id]?.aiValue ?? `${id.replace(/-/g, ' ').toUpperCase()} · AUTO-GENERATED FROM APPROVED PAGE`,
  }));
}

function buildJob(partial: Omit<ProductionJob, 'assets'> & { assetOverrides?: Partial<Record<string, { aiValue: string; status?: ProductionAsset['status'] }>> }): ProductionJob {
  const { assetOverrides, ...rest } = partial;
  return { ...rest, assets: buildAssets(assetOverrides) };
}

export function buildProductionStudioSeed(): Partial<ProductionStudioStore> {
  const jobs: ProductionJob[] = [
    buildJob({
      id: 'ps-job-lace-mastery',
      pageTitle: 'CUTTING YOUR LACE · LACE MASTERY',
      pageRoute: '/ndxbook/lace-mastery/cutting-your-lace',
      approvedAt: '2026-07-04T09:00:00.000Z',
      queueStatus: 'ready',
      pipelineStage: 'page-ready',
      estimatedRuntimeSec: 248,
      hostName: 'KATEENA · NDXBOOK HOST',
      voiceProfile: 'WARM EDUCATOR · CONFIDENT · TRUST-FIRST',
      thumbnailPreview: 'LACE CLOSE-UP · MARBLE STUDIO · RED ACCENT',
      scenes: [
        { id: 'sc-1', label: 'OPEN · HOOK', durationSec: 12, visualNote: 'Slow push-in on lace edge · marble backdrop' },
        { id: 'sc-2', label: 'DEMONSTRATION', durationSec: 96, visualNote: 'Hands · mirror · step-by-step overlay' },
        { id: 'sc-3', label: 'COMMON MISTAKES', durationSec: 54, visualNote: 'Split screen · before/after' },
        { id: 'sc-4', label: 'CLOSE · CTA', durationSec: 18, visualNote: 'Host direct address · soft bloom' },
      ],
      waveform: [12, 28, 45, 62, 48, 71, 55, 38, 66, 52, 44, 58, 72, 49, 35, 61],
      platformVersions: [
        { platform: 'INSTAGRAM REELS', aspect: '9:16', runtimeSec: 90, status: 'draft' },
        { platform: 'TIKTOK', aspect: '9:16', runtimeSec: 90, status: 'draft' },
        { platform: 'YOUTUBE SHORTS', aspect: '9:16', runtimeSec: 58, status: 'draft' },
        { platform: 'LINKEDIN', aspect: '1:1', runtimeSec: 45, status: 'draft' },
      ],
      productionNotes: [
        'Page approved in Newsroom · editorial QA complete.',
        'Brand Concierge aligned tone with Writing DNA.',
        'Experience Concierge flagged trust-first pacing for beginners.',
      ],
      intelligence: {
        hookImprovement: 'Open with “Most lace fails happen in the first 30 seconds” — retention lift +14%.',
        thumbnailRecommendation: 'High-contrast lace edge + red thread · avoid busy background.',
        voiceRecommendation: 'Slightly slower cadence on step 2 · warmth over urgency.',
        estimatedRetentionPct: 78,
        confidenceScore: 91,
        predictedPerformance: 'STRONG · EDUCATIONAL EVERGREEN',
        productionRecommendations: [
          'Add 3-second pattern interrupt at 0:18',
          'Include on-screen checklist for mobile viewers',
          'Cross-post Shorts cut at 0:58 mark',
        ],
      },
      assetOverrides: {
        script: { aiValue: 'HOOK → WHY LACE MATTERS → 4-STEP CUT → MISTAKES → CONFIDENT CLOSE' },
        title: { aiValue: 'CUT YOUR LACE LIKE A PRO — 4 STEPS NO ONE SHOWS YOU' },
        hashtags: { aiValue: '#LaceMastery #WigTips #FrontalSlayer #NDXBOOK #HairEducation' },
      },
    }),
    buildJob({
      id: 'ps-job-slay-report',
      pageTitle: 'SLAY REPORT · WEEK 12',
      pageRoute: '/ndxbook/slay-report/week-12',
      approvedAt: '2026-07-03T14:30:00.000Z',
      queueStatus: 'in-production',
      pipelineStage: 'voice-generation',
      estimatedRuntimeSec: 312,
      hostName: 'AI HOST · SLAY REPORT DESK',
      voiceProfile: 'EDITORIAL · ENERGETIC · LUXURY BROADCAST',
      thumbnailPreview: 'WEEK 12 · MARBLE DESK · GOLD TYPE',
      scenes: [
        { id: 'sr-1', label: 'COLD OPEN', durationSec: 8, visualNote: 'Typography over marble · week number' },
        { id: 'sr-2', label: 'TOP STORY', durationSec: 72, visualNote: 'B-roll montage · chart overlay' },
        { id: 'sr-3', label: 'COMMUNITY SPOTLIGHT', durationSec: 48, visualNote: 'Reader graph highlights' },
        { id: 'sr-4', label: 'WHAT\'S NEXT', durationSec: 24, visualNote: 'Preview cards · soft parallax' },
      ],
      waveform: [18, 42, 55, 68, 74, 61, 48, 52, 66, 58, 44, 70, 63, 51, 47, 59],
      platformVersions: [
        { platform: 'YOUTUBE', aspect: '16:9', runtimeSec: 312, status: 'draft' },
        { platform: 'INSTAGRAM FEED', aspect: '4:5', runtimeSec: 60, status: 'draft' },
        { platform: 'EMAIL PREVIEW', aspect: '16:9', runtimeSec: 45, status: 'draft' },
      ],
      productionNotes: [
        'Voice generation in progress · Growth Concierge approved headline batch.',
        'Motion graphics team queued chart animations.',
      ],
      intelligence: {
        hookImprovement: 'Lead with community win stat from Reader Graph — social proof first.',
        thumbnailRecommendation: 'Week number in Covered By Your Grace · red accent bar.',
        voiceRecommendation: 'Broadcast energy · pause before community spotlight.',
        estimatedRetentionPct: 71,
        confidenceScore: 86,
        predictedPerformance: 'SOLID · WEEKLY RITUAL',
        productionRecommendations: [
          'Tease next week at 4:45 mark',
          'Include 15-second vertical cut for Reels',
        ],
      },
      assetOverrides: {
        voice: { aiValue: 'GENERATING · ELEVENLABS PROFILE SLAY-REPORT-V2', status: 'generating' },
        'motion-graphics': { aiValue: 'CHART ANIMATIONS · QUEUED', status: 'pending' },
      },
    }),
    buildJob({
      id: 'ps-job-noir-color',
      pageTitle: 'NOIR COLOR THEORY · DEPTH & DIMENSION',
      pageRoute: '/ndxbook/noir/color-theory',
      approvedAt: '2026-07-02T11:15:00.000Z',
      queueStatus: 'rendering',
      pipelineStage: 'render-queue',
      estimatedRuntimeSec: 186,
      hostName: 'NOIR SPECIALIST · TALENT NETWORK',
      voiceProfile: 'TECHNICAL · CALM · PREMIUM EDUCATOR',
      thumbnailPreview: 'NOIR SWATCH GRID · CINEMATIC LIGHT',
      scenes: [
        { id: 'nc-1', label: 'INTRO', durationSec: 14, visualNote: 'Product hero · slow orbit' },
        { id: 'nc-2', label: 'COLOR LAYERS', durationSec: 88, visualNote: 'Macro shots · diagram overlays' },
        { id: 'nc-3', label: 'APPLICATION', durationSec: 56, visualNote: 'Hands · lighting diagram' },
        { id: 'nc-4', label: 'OUTRO', durationSec: 12, visualNote: 'Logo resolve · marble fade' },
      ],
      waveform: [22, 38, 51, 64, 58, 72, 66, 49, 55, 61, 47, 53, 68, 44, 39, 57],
      platformVersions: [
        { platform: 'YOUTUBE', aspect: '16:9', runtimeSec: 186, status: 'optimized' },
        { platform: 'INSTAGRAM REELS', aspect: '9:16', runtimeSec: 52, status: 'optimized' },
        { platform: 'PINTEREST', aspect: '2:3', runtimeSec: 30, status: 'draft' },
      ],
      productionNotes: [
        'Render queue position 2 · Technology Concierge monitoring codec settings.',
        'B-roll from Asset Director approved NOIR macro set.',
      ],
      intelligence: {
        hookImprovement: 'Open on color swatch comparison — visual hook before voice.',
        thumbnailRecommendation: 'NOIR unit at 3/4 angle · single red accent thread.',
        voiceRecommendation: 'Maintain technical clarity · avoid jargon in first 20 seconds.',
        estimatedRetentionPct: 82,
        confidenceScore: 94,
        predictedPerformance: 'HIGH · PRODUCT EDUCATION',
        productionRecommendations: [
          'Pin Pinterest cut with static hero frame',
          'Add chapter markers for color layers section',
        ],
      },
    }),
    buildJob({
      id: 'ps-job-membership-guide',
      pageTitle: 'MEMBERSHIP VALUE GUIDE · PREMIUM PATH',
      pageRoute: '/ndxbook/membership/value-guide',
      approvedAt: '2026-07-01T16:00:00.000Z',
      queueStatus: 'needs-review',
      pipelineStage: 'preview',
      estimatedRuntimeSec: 142,
      hostName: 'CHIEF CONCIERGE · FOUNDER VOICE',
      voiceProfile: 'HOSPITALITY · WARM · TRUST-BUILDING',
      thumbnailPreview: 'PREMIUM CARD · MARBLE · CHAMPAGNE ACCENT',
      scenes: [
        { id: 'mg-1', label: 'WELCOME', durationSec: 10, visualNote: 'Concierge welcome · soft light' },
        { id: 'mg-2', label: 'VALUE STACK', durationSec: 68, visualNote: 'Icon cards · benefit reveal' },
        { id: 'mg-3', label: 'SOCIAL PROOF', durationSec: 42, visualNote: 'Testimonial cards · subtle motion' },
        { id: 'mg-4', label: 'INVITATION', durationSec: 16, visualNote: 'CTA · calm close' },
      ],
      waveform: [15, 32, 48, 56, 62, 54, 46, 58, 64, 50, 42, 55, 60, 48, 36, 52],
      platformVersions: [
        { platform: 'INSTAGRAM REELS', aspect: '9:16', runtimeSec: 60, status: 'optimized' },
        { platform: 'EMAIL EMBED', aspect: '16:9', runtimeSec: 90, status: 'approved' },
        { platform: 'WEB HERO', aspect: '21:9', runtimeSec: 30, status: 'optimized' },
      ],
      productionNotes: [
        'Preview ready · Experience Concierge requested softer CTA pacing.',
        'Founder may override voice profile before final render.',
      ],
      intelligence: {
        hookImprovement: 'Replace feature list open with “What premium actually feels like” story.',
        thumbnailRecommendation: 'Champagne accent · avoid aggressive red on membership content.',
        voiceRecommendation: 'Chief Concierge tone · hospitality over sales.',
        estimatedRetentionPct: 69,
        confidenceScore: 88,
        predictedPerformance: 'MODERATE · CONVERSION SUPPORT',
        productionRecommendations: [
          'A/B test softer hook vs benefit stack open',
          'Add 5-second pause before CTA card',
        ],
      },
      assetOverrides: {
        voice: {
          aiValue: 'CHIEF CONCIERGE PROFILE · HOSPITALITY V1',
          status: 'overridden',
        },
      },
    }),
    buildJob({
      id: 'ps-job-spring-launch',
      pageTitle: 'SPRING COLLECTION LAUNCH · CAMPAIGN FILM',
      pageRoute: '/ndxbook/campaigns/spring-collection',
      approvedAt: '2026-06-28T10:00:00.000Z',
      queueStatus: 'completed',
      pipelineStage: 'render-queue',
      estimatedRuntimeSec: 95,
      hostName: 'CAMPAIGN HOST · GROWTH CONCIERGE',
      voiceProfile: 'CINEMATIC · ASPIRATIONAL · BRAND FORWARD',
      thumbnailPreview: 'SPRING PALETTE · MARBLE RUNWAY',
      scenes: [
        { id: 'sp-1', label: 'TEASE', durationSec: 6, visualNote: 'Logo sting · light sweep' },
        { id: 'sp-2', label: 'COLLECTION', durationSec: 52, visualNote: 'Runway · product cards' },
        { id: 'sp-3', label: 'CLOSE', durationSec: 12, visualNote: 'Tagline · date reveal' },
      ],
      waveform: [25, 45, 58, 72, 65, 78, 62, 55, 68, 52, 48, 61, 70, 58, 42, 50],
      platformVersions: [
        { platform: 'INSTAGRAM REELS', aspect: '9:16', runtimeSec: 30, status: 'approved' },
        { platform: 'TIKTOK', aspect: '9:16', runtimeSec: 30, status: 'approved' },
        { platform: 'YOUTUBE PRE-ROLL', aspect: '16:9', runtimeSec: 15, status: 'approved' },
      ],
      productionNotes: [
        'Completed · published to Library and Distribution Engine.',
        'All platform variations approved · Brand Concierge signed off.',
      ],
      intelligence: {
        hookImprovement: 'N/A — completed production.',
        thumbnailRecommendation: 'Approved · spring palette hero.',
        voiceRecommendation: 'Approved · cinematic profile.',
        estimatedRetentionPct: 74,
        confidenceScore: 92,
        predictedPerformance: 'STRONG · CAMPAIGN LAUNCH',
        productionRecommendations: ['Archive master in Knowledge Asset Engine'],
      },
    }),
  ];

  return {
    companyName: 'NDXBOOK',
    selectedJobId: jobs[0]?.id ?? null,
    queueFilter: 'all',
    dashboard: {
      summary:
        'PRODUCTION STUDIO V1.0 · NDXBOOK · 5 approved pages in pipeline · AI teams active · cinematic headquarters.',
      jobsReady: 1,
      jobsInProduction: 1,
      jobsRendering: 1,
      jobsNeedsReview: 1,
      jobsCompleted: 1,
      avgConfidencePct: 90,
      pagesAwaitingProduction: 1,
    },
    philosophy: [
      'Every approved page becomes production-ready media — automatically.',
      'Enter a luxury creative studio where AI production teams are already working.',
      'Not a traditional video editor — Pixar craft meets Apple Pro Studio.',
      'Founders override any AI decision · glass panels · cinematic calm.',
    ],
    jobs,
  };
}

export function bootstrapProductionStudioPlatform(): void {
  bootstrapProductionStudioStore(buildProductionStudioSeed());
}
