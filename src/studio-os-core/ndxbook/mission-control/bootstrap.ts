/**
 * NDXBOOK Mission Control V1.0 — demo operational seed (Milestone 37).
 */

import { LAUNCH_VOLUMES, VOLUME_LABELS } from '../constants';
import { PRODUCTION_STAGES } from './constants';
import { bootstrapNdxbookMissionControlStore } from './store';
import type { NdxbookMissionControlStore } from './types';

function todayAt(hour: number, minute: number): string {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3600_000).toISOString();
}

function minsFromNow(m: number): string {
  return new Date(Date.now() + m * 60_000).toISOString();
}

export function buildNdxbookMissionControlSeed(): Partial<NdxbookMissionControlStore> {
  const launchAt = minsFromNow(47);

  return {
    briefing: {
      greeting: 'good morning',
      pagesPublishingToday: 6,
      pagesInProduction: 14,
      pendingApprovals: 3,
      estimatedReachToday: 284_500,
      estimatedRevenueToday: 428.75,
      highestPerformingPage: 'page 019 — why your credit score drops after paying off debt',
      highestPerformingVolume: VOLUME_LABELS.money,
      highestPerformingHost: 'Pending — Money Host',
      studioRecommendation: 'publish page 028 at 2:00 PM — Money Monday slot has highest Tuesday carryover',
      topOpportunity: 'mind volume retention up 18% — add 2 pages to habits chapter this week',
      topRisk: '3 pages stuck in thumbnail review > 24h — bottleneck may delay Friday schedule',
      nextSuggestedAction: 'approve page 028 production & connect instagram OAuth',
    },
    companyHealth: [
      { id: 'overall', label: 'OVERALL COMPANY HEALTH', score: 78, trend: 'up', trendLabel: '+4% vs last week' },
      { id: 'publishing', label: 'PUBLISHING', score: 82, trend: 'up', trendLabel: '+6% on-time rate' },
      { id: 'growth', label: 'GROWTH', score: 71, trend: 'up', trendLabel: '+12% reader velocity' },
      { id: 'operations', label: 'OPERATIONS', score: 74, trend: 'flat', trendLabel: 'stable throughput' },
      { id: 'automation', label: 'AUTOMATION', score: 65, trend: 'up', trendLabel: '+3 automations live' },
      { id: 'quality', label: 'QUALITY', score: 88, trend: 'up', trendLabel: '+2% completion rate' },
      { id: 'reader-growth', label: 'READER GROWTH', score: 76, trend: 'up', trendLabel: '+840 new readers/wk' },
      { id: 'revenue', label: 'REVENUE', score: 62, trend: 'up', trendLabel: '+9% MTD' },
      { id: 'experiments', label: 'EXPERIMENTS', score: 69, trend: 'up', trendLabel: '4 active tests' },
      { id: 'knowledge', label: 'KNOWLEDGE MATURITY', score: 58, trend: 'up', trendLabel: '+2 graph nodes' },
    ],
    newsroomStages: PRODUCTION_STAGES.map((stage, i) => ({
      id: stage.id,
      label: stage.label,
      pageCount: [3, 2, 4, 3, 2, 2, 3, 2, 4, 8, 6][i] ?? 1,
      activeItems: [1, 1, 2, 1, 1, 1, 2, 1, 2, 0, 1][i] ?? 0,
      estimatedCompletionMins: [45, 90, 120, 60, 75, 180, 40, 30, 15, 0, 20][i] ?? 30,
      assignedExecutive: ['Content Brain', 'Research AI', 'Writing Bible', 'Approval Queue', 'Voice Lab', 'Animation Engine', 'Asset Director', 'Caption AI', 'Scheduler', 'Distribution', 'Analytics'][i] ?? 'Studio OS',
    })),
    publishingSchedule: [
      {
        id: 'pub-1',
        scheduledAt: todayAt(9, 0),
        platform: 'tiktok',
        pageNumber: 24,
        pageLabel: 'page 024',
        volumeId: 'money',
        chapter: 'credit',
        status: 'published',
        estimatedPublishAt: todayAt(9, 0),
      },
      {
        id: 'pub-2',
        scheduledAt: todayAt(11, 30),
        platform: 'instagram',
        pageNumber: 25,
        pageLabel: 'page 025',
        volumeId: 'body',
        chapter: 'sleep',
        status: 'published',
        estimatedPublishAt: todayAt(11, 30),
      },
      {
        id: 'pub-3',
        scheduledAt: todayAt(14, 0),
        platform: 'youtube-shorts',
        pageNumber: 28,
        pageLabel: 'page 028',
        volumeId: 'money',
        chapter: 'credit',
        status: 'ready',
        estimatedPublishAt: todayAt(14, 0),
      },
      {
        id: 'pub-4',
        scheduledAt: todayAt(16, 30),
        platform: 'tiktok',
        pageNumber: 29,
        pageLabel: 'page 029',
        volumeId: 'mind',
        chapter: 'habits',
        status: 'queued',
        estimatedPublishAt: todayAt(16, 30),
      },
      {
        id: 'pub-5',
        scheduledAt: todayAt(18, 0),
        platform: 'instagram',
        pageNumber: 30,
        pageLabel: 'page 030',
        volumeId: 'tech',
        chapter: 'ai tools',
        status: 'queued',
        estimatedPublishAt: todayAt(18, 0),
      },
      {
        id: 'pub-6',
        scheduledAt: todayAt(20, 0),
        platform: 'facebook',
        pageNumber: 31,
        pageLabel: 'page 031',
        volumeId: 'consumer',
        chapter: 'deals',
        status: 'queued',
        estimatedPublishAt: todayAt(20, 0),
      },
    ],
    pageOfTheDay: {
      pageNumber: 28,
      pageLabel: 'page 028',
      title: 'why lenders care more about utilization than your balance',
      volumeId: 'money',
      chapter: 'credit',
      hostName: 'Pending — Money Host',
      thumbnailNote: 'bold stat overlay · red accent · page number badge',
      platforms: ['youtube-shorts', 'tiktok', 'instagram'],
      status: 'ready for publish',
      predictedPerformance: 'top 15% for money volume · est. 42K views first 48h',
      launchAt,
    },
    library: {
      latestPages: [
        { id: 'p-31', pageNumber: 31, pageLabel: 'page 031', volumeId: 'consumer', chapter: 'deals', title: 'the psychology behind limited-time offers', status: 'scheduled', performanceSnapshot: '—', updatedAt: hoursAgo(2) },
        { id: 'p-30', pageNumber: 30, pageLabel: 'page 030', volumeId: 'tech', chapter: 'ai tools', title: '5 ai workflows that save 10 hours a week', status: 'scheduled', performanceSnapshot: '—', updatedAt: hoursAgo(4) },
        { id: 'p-29', pageNumber: 29, pageLabel: 'page 029', volumeId: 'mind', chapter: 'habits', title: 'why your brain avoids hard tasks', status: 'review', performanceSnapshot: '—', updatedAt: hoursAgo(6) },
        { id: 'p-28', pageNumber: 28, pageLabel: 'page 028', volumeId: 'money', chapter: 'credit', title: 'why lenders care more about utilization than your balance', status: 'ready', performanceSnapshot: 'predicted top 15%', updatedAt: hoursAgo(8) },
      ],
      recentlyUpdated: [
        { id: 'p-27', pageNumber: 27, pageLabel: 'page 027', volumeId: 'body', chapter: 'nutrition', title: 'protein timing myths debunked', status: 'published', performanceSnapshot: '31K views · 68% completion', updatedAt: hoursAgo(1) },
        { id: 'p-26', pageNumber: 26, pageLabel: 'page 026', volumeId: 'mind', chapter: 'focus', title: 'the 90-minute focus rule', status: 'published', performanceSnapshot: '28K views · 71% completion', updatedAt: hoursAgo(3) },
        { id: 'p-25', pageNumber: 25, pageLabel: 'page 025', volumeId: 'body', chapter: 'sleep', title: 'why waking at the same time matters more than bedtime', status: 'published', performanceSnapshot: '35K views · 74% completion', updatedAt: hoursAgo(5) },
      ],
      mostBookmarked: [
        { id: 'p-19', pageNumber: 19, pageLabel: 'page 019', volumeId: 'money', chapter: 'credit', title: 'why your credit score drops after paying off debt', status: 'published', performanceSnapshot: '2.4K bookmarks', bookmarks: 2400, updatedAt: hoursAgo(72) },
        { id: 'p-14', pageNumber: 14, pageLabel: 'page 014', volumeId: 'mind', chapter: 'habits', title: 'why your brain avoids hard tasks', status: 'published', performanceSnapshot: '1.9K bookmarks', bookmarks: 1900, updatedAt: hoursAgo(96) },
      ],
      highestShared: [
        { id: 'p-19', pageNumber: 19, pageLabel: 'page 019', volumeId: 'money', chapter: 'credit', title: 'why your credit score drops after paying off debt', status: 'published', performanceSnapshot: '8.2K shares', shares: 8200, updatedAt: hoursAgo(72) },
        { id: 'p-12', pageNumber: 12, pageLabel: 'page 012', volumeId: 'tech', chapter: 'automation', title: 'automate your finances in 30 minutes', status: 'published', performanceSnapshot: '5.1K shares', shares: 5100, updatedAt: hoursAgo(120) },
      ],
      highestRetention: [
        { id: 'p-25', pageNumber: 25, pageLabel: 'page 025', volumeId: 'body', chapter: 'sleep', title: 'why waking at the same time matters more than bedtime', status: 'published', performanceSnapshot: '74% avg completion', retentionPct: 74, updatedAt: hoursAgo(5) },
        { id: 'p-19', pageNumber: 19, pageLabel: 'page 019', volumeId: 'money', chapter: 'credit', title: 'why your credit score drops after paying off debt', status: 'published', performanceSnapshot: '72% avg completion', retentionPct: 72, updatedAt: hoursAgo(72) },
      ],
      recentCollections: [
        { id: 'col-1', title: 'Money Monday — March cycle', pageCount: 8, updatedAt: hoursAgo(12) },
        { id: 'col-2', title: 'Truth Tuesday — body & mind crossover', pageCount: 6, updatedAt: hoursAgo(36) },
        { id: 'col-3', title: 'Launch volume sampler', pageCount: 10, updatedAt: hoursAgo(168) },
      ],
    },
    volumes: LAUNCH_VOLUMES.map((vol) => ({
      volumeId: vol.id,
      label: VOLUME_LABELS[vol.id],
      pageCount: { money: 12, body: 8, mind: 9, tech: 7, consumer: 5 }[vol.id] ?? 4,
      chapterCount: vol.chapters.length,
      avgRetentionPct: { money: 71, body: 68, mind: 74, tech: 65, consumer: 62 }[vol.id] ?? 60,
      shares: { money: 12400, body: 8200, mind: 9800, tech: 6100, consumer: 4300 }[vol.id] ?? 2000,
      growthPct: { money: 14, body: 9, mind: 18, tech: 11, consumer: 7 }[vol.id] ?? 5,
      trend: 'up' as const,
    })),
    chaptersByVolume: {
      money: [
        { id: 'ch-credit', name: 'credit', pageCount: 5, performanceScore: 88, engagementPct: 76, recommendedNextPage: 'page 032 — utilization vs balance explained', knowledgeGaps: ['debt snowball vs avalanche', 'authorized user strategy'] },
        { id: 'ch-saving', name: 'saving', pageCount: 4, performanceScore: 72, engagementPct: 68, recommendedNextPage: 'page 033 — emergency fund sizing by income', knowledgeGaps: ['high-yield account comparison'] },
        { id: 'ch-investing', name: 'investing', pageCount: 3, performanceScore: 65, engagementPct: 61, recommendedNextPage: 'page 034 — index funds vs individual stocks', knowledgeGaps: ['Roth vs traditional IRA'] },
      ],
      mind: [
        { id: 'ch-habits', name: 'habits', pageCount: 4, performanceScore: 82, engagementPct: 74, recommendedNextPage: 'page 035 — habit stacking for busy readers', knowledgeGaps: ['motivation vs discipline'] },
        { id: 'ch-focus', name: 'focus', pageCount: 3, performanceScore: 78, engagementPct: 70, recommendedNextPage: 'page 036 — deep work blocks on mobile', knowledgeGaps: ['attention residue'] },
        { id: 'ch-psychology', name: 'psychology', pageCount: 2, performanceScore: 71, engagementPct: 67, recommendedNextPage: 'page 037 — cognitive bias in daily decisions', knowledgeGaps: ['loss aversion examples'] },
      ],
      body: [
        { id: 'ch-sleep', name: 'sleep', pageCount: 3, performanceScore: 85, engagementPct: 72, recommendedNextPage: 'page 038 — circadian rhythm reset', knowledgeGaps: ['melatonin timing'] },
        { id: 'ch-nutrition', name: 'nutrition', pageCount: 3, performanceScore: 74, engagementPct: 65, recommendedNextPage: 'page 039 — protein per meal guide', knowledgeGaps: ['micronutrient basics'] },
        { id: 'ch-fitness', name: 'fitness', pageCount: 2, performanceScore: 68, engagementPct: 63, recommendedNextPage: 'page 040 — minimum effective dose training', knowledgeGaps: ['recovery protocols'] },
      ],
      tech: [
        { id: 'ch-ai', name: 'ai tools', pageCount: 3, performanceScore: 70, engagementPct: 64, recommendedNextPage: 'page 041 — ai prompt templates for creators', knowledgeGaps: ['model selection guide'] },
        { id: 'ch-automation', name: 'automation', pageCount: 2, performanceScore: 66, engagementPct: 60, recommendedNextPage: 'page 042 — no-code automation stack', knowledgeGaps: ['Zapier vs Make'] },
        { id: 'ch-security', name: 'security', pageCount: 2, performanceScore: 62, engagementPct: 58, recommendedNextPage: 'page 043 — password manager setup', knowledgeGaps: ['2FA best practices'] },
      ],
      consumer: [
        { id: 'ch-deals', name: 'deals', pageCount: 2, performanceScore: 64, engagementPct: 59, recommendedNextPage: 'page 044 — price tracking tools compared', knowledgeGaps: ['cashback stacking'] },
        { id: 'ch-reviews', name: 'reviews', pageCount: 2, performanceScore: 60, engagementPct: 55, recommendedNextPage: 'page 045 — how to read product reviews', knowledgeGaps: ['fake review detection'] },
        { id: 'ch-trends', name: 'trends', pageCount: 1, performanceScore: 58, engagementPct: 52, recommendedNextPage: 'page 046 — trend vs fad framework', knowledgeGaps: ['seasonal buying windows'] },
      ],
    },
    readerIntelligence: {
      newReaders: 842,
      returningReaders: 3_218,
      retentionPct: 68,
      bookmarks: 12_400,
      shares: 8_900,
      comments: 1_240,
      watchTimeHours: 4_820,
      avgCompletionPct: 69,
      bestPublishingHour: '2:00 PM EST',
      topCountries: ['United States', 'United Kingdom', 'Canada', 'Nigeria', 'Australia'],
      topAgeGroups: ['25–34', '18–24', '35–44'],
      topInterests: ['personal finance', 'productivity', 'health & wellness', 'ai & technology'],
    },
    intelligence: [
      { id: 'intel-1', category: 'daily', title: 'Publish page 028 at 2 PM — Money Monday carryover peak', why: 'Historical Tuesday 2 PM slot shows 22% higher completion for money volume pages', confidencePct: 84, expectedImpact: '+18K estimated views vs off-peak', recommendedAction: 'Approve & schedule page 028 for 2:00 PM today' },
      { id: 'intel-2', category: 'content', title: 'Expand habits chapter — mind volume outperforming', why: 'Mind volume retention +18% WoW; habits chapter has highest bookmark rate', confidencePct: 79, expectedImpact: '+12% weekly reader growth if 2 pages added', recommendedAction: 'Create pages 035–036 in habits chapter' },
      { id: 'intel-3', category: 'trend', title: 'Credit utilization content trending across platforms', why: 'Cross-platform signal: utilization explainers up 34% in category searches', confidencePct: 76, expectedImpact: 'High share potential for page 028', recommendedAction: 'Prioritize credit chapter for next 3 pages' },
      { id: 'intel-4', category: 'market', title: 'Short-form finance creators shifting to carousel + short mix', why: 'Competitive scan: top 10 finance accounts posting 60% shorts / 40% carousels', confidencePct: 71, expectedImpact: 'Format diversification may lift Instagram reach 15%', recommendedAction: 'Test carousel format for page 031' },
      { id: 'intel-5', category: 'algorithm', title: 'TikTok favoring 45–60s completion-optimized hooks', why: 'Platform algorithm update detected in Labs experiment #42 results', confidencePct: 82, expectedImpact: '+8% avg completion if hooks adjusted', recommendedAction: 'Apply winning hook template to page 029' },
      { id: 'intel-6', category: 'competitive', title: '3 competitor channels launched credit series this week', why: 'Competitive intelligence flagged overlapping topic clusters in money volume', confidencePct: 68, expectedImpact: 'First-mover advantage window ~5 days', recommendedAction: 'Accelerate page 028 publish to today' },
      { id: 'intel-7', category: 'risk', title: 'Thumbnail review bottleneck — 3 pages > 24h', why: 'Approval queue aging beyond SLA; may cascade to Friday schedule', confidencePct: 91, expectedImpact: 'Potential 2-page delay on Future Friday slot', recommendedAction: 'Clear thumbnail approvals before EOD' },
    ],
    revenue: {
      today: 428.75,
      thisWeek: 2_840.5,
      thisMonth: 11_420,
      thisYear: 48_600,
      breakdown: {
        youtube: 142.5,
        instagram: 98.25,
        tiktok: 86.0,
        facebook: 42.0,
        affiliate: 28.5,
        brandPartnerships: 0,
        marketplace: 18.0,
        digitalProducts: 13.5,
        futureMemberships: 0,
      },
      forecastNextMonth: 14_200,
      forecastConfidencePct: 72,
    },
    experiments: [
      { id: 'exp-42', name: 'Hook testing — credit hooks A/B/C', type: 'hook testing', winner: 'Variant B — question hook', confidencePct: 82, currentLeader: 'Variant B', historicalResults: 'B +12% completion vs A', recommendedRollout: 'Apply to all money volume pages', status: 'active' },
      { id: 'exp-38', name: 'Thumbnail — stat overlay vs face close-up', type: 'thumbnail testing', winner: 'Stat overlay', confidencePct: 76, currentLeader: 'Stat overlay', historicalResults: '+18% CTR on TikTok', recommendedRollout: 'Default template for money + mind', status: 'active' },
      { id: 'exp-35', name: 'Caption length — short vs medium', type: 'caption testing', winner: 'Medium (2 lines)', confidencePct: 71, currentLeader: 'Medium', historicalResults: '+6% saves on Instagram', recommendedRollout: 'Update caption template', status: 'active' },
      { id: 'exp-31', name: 'Host comparison — voice A vs voice B', type: 'host comparison', winner: 'Voice A', confidencePct: 68, currentLeader: 'Voice A', historicalResults: '+4% completion', recommendedRollout: 'Pending talent network integration', status: 'active' },
      { id: 'exp-28', name: 'Posting schedule — 2 PM vs 6 PM', type: 'posting schedule', winner: '2 PM EST', confidencePct: 84, currentLeader: '2 PM', historicalResults: '+22% first-hour views', recommendedRollout: 'Already applied to schedule', status: 'completed' },
      { id: 'exp-24', name: 'Video length — 45s vs 60s', type: 'video length', winner: '52s sweet spot', confidencePct: 79, currentLeader: '52s range', historicalResults: 'Peak completion at 52s', recommendedRollout: 'Script template updated', status: 'completed' },
      { id: 'exp-20', name: 'Voice testing — energetic vs calm', type: 'voice testing', winner: 'Calm + confident', confidencePct: 74, currentLeader: 'Calm', historicalResults: '+7% watch time', recommendedRollout: 'Voice Lab default preset', status: 'completed' },
    ],
    talentBoard: [
      { id: 'host-money', displayName: 'Pending — Money Host', role: 'money host', volumeId: 'money', status: 'scheduled', currentPage: 'page 028', nextSlot: '2:00 PM' },
      { id: 'host-body', displayName: 'Pending — Body Host', role: 'body host', volumeId: 'body', status: 'editing', currentPage: 'page 027', nextSlot: '4:30 PM' },
      { id: 'host-mind', displayName: 'Pending — Mind Host', role: 'mind host', volumeId: 'mind', status: 'recording', currentPage: 'page 029', nextSlot: '6:00 PM' },
      { id: 'host-tech', displayName: 'Pending — Tech Host', role: 'tech host', volumeId: 'tech', status: 'researching', currentPage: 'page 030', nextSlot: 'Tomorrow 10 AM' },
      { id: 'host-consumer', displayName: 'Pending — Consumer Host', role: 'consumer host', volumeId: 'consumer', status: 'available', nextSlot: 'Friday Smart Living' },
      { id: 'host-future', displayName: 'Pending — Future Host', role: 'future host', volumeId: 'tech', status: 'rendering', currentPage: 'page 026 B-roll', nextSlot: 'Future Friday' },
    ],
    missionActions: [
      { id: 'chief-of-staff', label: 'CHIEF OF STAFF', route: '/admin/studio/chief-of-staff', priority: 2, frequencyScore: 92 },
      { id: 'publish', label: 'REVIEW & POST', route: '/admin/studio/distribution-network?brand=ndxbook', priority: 1, frequencyScore: 95 },
      { id: 'create-page', label: 'CREATE PAGE', route: '/admin/studio/ndxbook?tab=pages', priority: 2, frequencyScore: 90 },
      { id: 'approve', label: 'APPROVE PRODUCTION', route: '/admin/studio/ndxbook?tab=checklist', priority: 3, frequencyScore: 88 },
      { id: 'socials', label: 'SOCIAL CONNECTORS', route: '/admin/studio/ndxbook?tab=socials', priority: 4, frequencyScore: 82 },
      { id: 'experiment', label: 'LAUNCH EXPERIMENT', route: '/admin/studio/labs', priority: 4, frequencyScore: 74 },
      { id: 'simulation', label: 'RUN SIMULATION', route: '/admin/studio/simulation-engine', priority: 5, frequencyScore: 62 },
      { id: 'intelligence', label: 'VIEW INTELLIGENCE', route: '/admin/studio/studio-intelligence', priority: 6, frequencyScore: 78 },
      { id: 'knowledge-graph', label: 'KNOWLEDGE GRAPH', route: '/admin/studio/knowledge-hub', priority: 7, frequencyScore: 58 },
      { id: 'memory-bible', label: 'MEMORY BIBLE', route: '/admin/studio/memory-bible', priority: 8, frequencyScore: 65 },
      { id: 'marketplace', label: 'MARKETPLACE', route: '/admin/studio/marketplace', priority: 9, frequencyScore: 48 },
      { id: 'talent', label: 'TALENT NETWORK', route: '/admin/studio/talent-network', priority: 10, frequencyScore: 55 },
    ],
    activityFeed: [
      { id: 'act-1', timestamp: minsFromNow(-2), message: 'page 028 approved for production', category: 'production' },
      { id: 'act-2', timestamp: minsFromNow(-8), message: 'thumbnail updated for page 029', category: 'production' },
      { id: 'act-3', timestamp: minsFromNow(-15), message: 'experiment #42 completed — hook variant B wins', category: 'experiment' },
      { id: 'act-4', timestamp: minsFromNow(-22), message: 'studio intelligence: publish page 028 at 2 PM recommended', category: 'intelligence' },
      { id: 'act-5', timestamp: minsFromNow(-35), message: 'instagram connector configured — awaiting OAuth', category: 'social' },
      { id: 'act-6', timestamp: minsFromNow(-48), message: 'page 025 published to instagram + tiktok', category: 'publish' },
      { id: 'act-7', timestamp: minsFromNow(-62), message: 'revenue milestone: $400 day pace reached', category: 'revenue' },
      { id: 'act-8', timestamp: minsFromNow(-75), message: 'mind host assigned to page 029', category: 'talent' },
      { id: 'act-9', timestamp: minsFromNow(-90), message: 'page 024 published — 12K views first hour', category: 'publish' },
      { id: 'act-10', timestamp: minsFromNow(-120), message: 'volume 001 money chapter credit knowledge gap flagged', category: 'intelligence' },
    ],
  };
}

export function bootstrapAiMediaNdxbookMissionControl(): void {
  bootstrapNdxbookMissionControlStore(buildNdxbookMissionControlSeed());
}
