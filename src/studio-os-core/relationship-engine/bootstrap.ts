import { bootstrapRelationshipEngineStore } from './store';
import type { RelationshipEngineStore, RelationshipWorkspace } from './types';

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function daysAgo(days: number): string {
  return daysFromNow(-days);
}

export function buildRelationshipEngineSeed(): Partial<RelationshipEngineStore> {
  const relationships: RelationshipWorkspace[] = [
    {
      id: 'rel-maya-k',
      readerGraphId: 'reader-maya-k',
      workspaceId: 'ndxbook',
      displayName: 'MAYA K · ENGAGED READER',
      currentStage: 'engaged-reader',
      trustScore: 82,
      engagementScore: 74,
      advocacyScore: 38,
      communityScore: 45,
      knowledgeScore: 71,
      relationshipHealthPct: 76,
      purchaseHistory: [],
      interactionSummary: '12 pages completed · 2 bookmarks · Tue-Wed evening reader',
      communicationSummary: 'Newsletter open 68% · 1 email reply · no fatigue risk',
      campaignParticipation: ['MONEY MONDAY · MARCH CYCLE'],
      companyIds: ['ndxbook'],
    },
    {
      id: 'rel-jordan-t',
      readerGraphId: 'reader-jordan-t',
      workspaceId: 'ndxbook',
      displayName: 'JORDAN T · AMBASSADOR',
      currentStage: 'ambassador',
      trustScore: 94,
      engagementScore: 88,
      advocacyScore: 85,
      communityScore: 72,
      knowledgeScore: 86,
      relationshipHealthPct: 89,
      purchaseHistory: ['Affiliate revenue $240 attributed'],
      interactionSummary: 'Daily reader · 95% completion · 5 referrals · TikTok advocate',
      communicationSummary: 'Personalized creator outreach · low fatigue · high response',
      campaignParticipation: ['TRUTH TUESDAY · FACT-FORWARD', 'MONEY MONDAY · MARCH CYCLE'],
      companyIds: ['ndxbook'],
    },
    {
      id: 'rel-sam-l',
      readerGraphId: 'reader-sam-l',
      workspaceId: 'ndxbook',
      displayName: 'SAM L · MEMBER',
      currentStage: 'member',
      trustScore: 88,
      engagementScore: 82,
      advocacyScore: 55,
      communityScore: 68,
      knowledgeScore: 79,
      relationshipHealthPct: 84,
      purchaseHistory: ['Membership $48/qtr'],
      interactionSummary: 'Member since Q1 · Finance Readers community · daily pages',
      communicationSummary: 'Member updates · community messages · optimal frequency',
      campaignParticipation: ['NEWSLETTER LAUNCH · Q3'],
      companyIds: ['ndxbook'],
    },
    {
      id: 'rel-alex-r',
      readerGraphId: 'reader-alex-r',
      workspaceId: 'frontal-slayer',
      displayName: 'ALEX R · REPEAT CUSTOMER',
      currentStage: 'repeat-customer',
      trustScore: 92,
      engagementScore: 76,
      advocacyScore: 62,
      communityScore: 58,
      knowledgeScore: 65,
      relationshipHealthPct: 81,
      purchaseHistory: ['NOIR unit $840', 'Premium membership', 'BAW customization'],
      interactionSummary: 'Lounge TV engaged · Concierge · ndxbook health reader cross-brand',
      communicationSummary: 'Concierge personalized · event invitations · premium cadence',
      campaignParticipation: ['NOIR · LIVE PREVIEW LAUNCH'],
      companyIds: ['frontal-slayer', 'ndxbook'],
    },
  ];

  return {
    dashboard: {
      summary:
        'RELATIONSHIP ENGINE V1.0 — active relationship operating system. Not a CRM · nurture every relationship · strengthen trust · deepen community · create long-term value. Relationships are organizational assets.',
      activeRelationships: 0,
      avgHealthPct: 0,
      pendingActions: 0,
      communityLeaders: 0,
      recognitionsDue: 0,
      portfolioRelationships: 0,
      trustTrendPct: 8,
    },
    activeWorkspaceId: 'ndxbook',
    relationships,
    healthDetails: {
      'rel-maya-k': { relationshipId: 'rel-maya-k', trust: 82, consistency: 78, engagement: 74, communication: 70, communityParticipation: 45, knowledgeProgression: 71, brandAffinity: 80, purchaseBehavior: 35, referrals: 20, advocacy: 38, overallPct: 76 },
      'rel-jordan-t': { relationshipId: 'rel-jordan-t', trust: 94, consistency: 91, engagement: 88, communication: 85, communityParticipation: 72, knowledgeProgression: 86, brandAffinity: 92, purchaseBehavior: 68, referrals: 88, advocacy: 85, overallPct: 89 },
      'rel-sam-l': { relationshipId: 'rel-sam-l', trust: 88, consistency: 85, engagement: 82, communication: 80, communityParticipation: 68, knowledgeProgression: 79, brandAffinity: 86, purchaseBehavior: 72, referrals: 45, advocacy: 55, overallPct: 84 },
      'rel-alex-r': { relationshipId: 'rel-alex-r', trust: 92, consistency: 70, engagement: 76, communication: 78, communityParticipation: 58, knowledgeProgression: 65, brandAffinity: 94, purchaseBehavior: 88, referrals: 40, advocacy: 62, overallPct: 81 },
    },
    nextBestActions: [
      { id: 'nba-1', relationshipId: 'rel-maya-k', type: 'membership', label: 'INVITE TO MEMBERSHIP', why: '82% trust · 78% engagement · money volume completion pattern · finance interest rising', expectedImpact: 'Projected $320/yr LTV · advocate pipeline in 6 months', confidencePct: 82, priority: 'high' },
      { id: 'nba-2', relationshipId: 'rel-maya-k', type: 'educational-series', label: 'RECOMMEND MONEY VOLUME LEARNING PATH', why: 'Finance interest 88% · aligns with returning reader strategy', expectedImpact: 'Knowledge depth → trust → membership conversion', confidencePct: 76, priority: 'medium' },
      { id: 'nba-3', relationshipId: 'rel-jordan-t', type: 'creator-marketplace', label: 'INVITE TO CREATOR MARKETPLACE', why: '91% advocate signal · TikTok reach · brand alignment · 5 referrals', expectedImpact: 'Ambassador tier · UGC pipeline · affiliate revenue growth', confidencePct: 91, priority: 'critical' },
      { id: 'nba-4', relationshipId: 'rel-jordan-t', type: 'ambassador', label: 'INVITE TO AMBASSADOR PROGRAM', why: '94% trust · sharing behavior · health expertise', expectedImpact: 'Sustainable referral revenue · community growth', confidencePct: 88, priority: 'high' },
      { id: 'nba-5', relationshipId: 'rel-sam-l', type: 'community', label: 'RECOMMEND FINANCE READERS LEADERSHIP', why: 'Member · community score 68 · early adopter cluster fit', expectedImpact: 'Community involvement → advocacy → retention', confidencePct: 74, priority: 'medium' },
      { id: 'nba-6', relationshipId: 'rel-sam-l', type: 'loyalty-reward', label: 'RECOMMEND LOYALTY RECOGNITION', why: '60-day membership milestone approaching', expectedImpact: 'Trust reinforcement · reduced churn risk', confidencePct: 80, priority: 'medium' },
      { id: 'nba-7', relationshipId: 'rel-alex-r', type: 'partnership', label: 'CROSS-BRAND WELLNESS BRIDGE', why: 'FS customer · ndxbook health reader · portfolio LTV $2K+', expectedImpact: 'Portfolio relationship deepening · cross-company value', confidencePct: 78, priority: 'high' },
      { id: 'nba-8', relationshipId: 'rel-alex-r', type: 'exclusive-access', label: 'RECOMMEND LOUNGE TV EXCLUSIVE', why: 'Premium member · Lounge engaged · luxury affinity 95%', expectedImpact: 'Brand affinity → repeat purchase → advocacy', confidencePct: 72, priority: 'medium' },
    ],
    timelines: [
      { id: 'rt-1', relationshipId: 'rel-maya-k', type: 'first-discovery', label: 'Discovered via Money Monday TikTok', at: daysAgo(120) },
      { id: 'rt-2', relationshipId: 'rel-maya-k', type: 'first-bookmark', label: 'Bookmarked Page 042 · Money habits', at: daysAgo(45) },
      { id: 'rt-3', relationshipId: 'rel-maya-k', type: 'milestone', label: '12 pages completed · Money + Mind volumes', at: daysAgo(14) },
      { id: 'rt-4', relationshipId: 'rel-jordan-t', type: 'first-discovery', label: 'Discovered via Truth Tuesday', at: daysAgo(400) },
      { id: 'rt-5', relationshipId: 'rel-jordan-t', type: 'first-share', label: 'Shared Page 041 · sleep debt', at: daysAgo(180) },
      { id: 'rt-6', relationshipId: 'rel-jordan-t', type: 'first-referral', label: 'First referral · 5 total', at: daysAgo(60) },
      { id: 'rt-7', relationshipId: 'rel-jordan-t', type: 'recognition', label: 'Top contributor · Truth Tuesday', at: daysAgo(30) },
      { id: 'rt-8', relationshipId: 'rel-sam-l', type: 'first-membership', label: 'ndxbook member · Q1 founding', at: daysAgo(60) },
      { id: 'rt-9', relationshipId: 'rel-alex-r', type: 'first-purchase', label: 'NOIR unit · Build-a-Wig', at: daysAgo(180) },
      { id: 'rt-10', relationshipId: 'rel-alex-r', type: 'first-event', label: 'Lounge TV · CUTTING YOUR LACE', at: daysAgo(90) },
    ],
    intelligenceSignals: [
      { id: 'ris-1', relationshipId: 'rel-maya-k', category: 'future-member', label: 'FUTURE MEMBER · HIGH CONFIDENCE', confidencePct: 82, proactiveAction: 'Invite before competitor capture · personalized money volume path' },
      { id: 'ris-2', relationshipId: 'rel-maya-k', category: 'future-affiliate', label: 'FUTURE AFFILIATE · BUILDING', confidencePct: 58, proactiveAction: 'Continue trust building · no hard sell until advocate signals' },
      { id: 'ris-3', relationshipId: 'rel-jordan-t', category: 'future-creator', label: 'FUTURE CREATOR · MARKETPLACE READY', confidencePct: 91, proactiveAction: 'Creator marketplace outreach this week' },
      { id: 'ris-4', relationshipId: 'rel-jordan-t', category: 'future-ambassador', label: 'FUTURE AMBASSADOR · ACTIVE', confidencePct: 88, proactiveAction: 'Formal ambassador invitation · recognition ceremony' },
      { id: 'ris-5', relationshipId: 'rel-sam-l', category: 'future-advocate', label: 'EMERGING ADVOCATE · COMMUNITY LEADER', confidencePct: 74, proactiveAction: 'Community moderator invitation · event co-host' },
      { id: 'ris-6', relationshipId: 'rel-alex-r', category: 'future-partner', label: 'PORTFOLIO PARTNER · CROSS-BRAND', confidencePct: 78, proactiveAction: 'Wellness bridge · exclusive access · advisor pipeline' },
    ],
    communities: [
      { id: 'ce-1', workspaceId: 'ndxbook', label: 'FINANCE READERS', description: 'Money-curious · stat-forward · returning reader focus', memberCount: 1240, sharedInterests: ['finance', 'entrepreneurship'], recommendations: ['Money Monday events', 'Affiliate pipeline', 'Membership invites'] },
      { id: 'ce-2', workspaceId: 'ndxbook', label: 'HEALTH READERS', description: 'Truth Tuesday loyalists · research-gated', memberCount: 890, sharedInterests: ['health', 'wellness', 'psychology'], recommendations: ['Wellness learning path', 'Podcast series', 'Creator collaborations'] },
      { id: 'ce-3', workspaceId: 'ndxbook', label: 'FOUNDERS', description: 'Entrepreneurship · AI builders · early adopters', memberCount: 420, sharedInterests: ['entrepreneurship', 'ai', 'marketing'], recommendations: ['Partnership introductions', 'Mentorship matching'] },
      { id: 'ce-4', workspaceId: 'frontal-slayer', label: 'LUXURY ENTHUSIASTS', description: 'Premium raw hair · BAW · concierge engaged', memberCount: 520, sharedInterests: ['luxury', 'hair', 'beauty'], recommendations: ['Lounge TV exclusives', 'Event invitations', 'Ambassador program'] },
    ],
    communications: [
      { id: 'com-1', relationshipId: 'rel-maya-k', channel: 'email', label: 'Membership invitation · personalized', scheduledAt: daysFromNow(3), frequency: 'One-time · high intent', fatigueRisk: 'low', personalized: true },
      { id: 'com-2', relationshipId: 'rel-jordan-t', channel: 'creator-outreach', label: 'Creator marketplace invitation', scheduledAt: daysFromNow(1), frequency: 'One-time · relationship milestone', fatigueRisk: 'low', personalized: true },
      { id: 'com-3', relationshipId: 'rel-sam-l', channel: 'community', label: 'Finance Readers community highlight', scheduledAt: daysFromNow(5), frequency: 'Weekly digest', fatigueRisk: 'low', personalized: true },
      { id: 'com-4', relationshipId: 'rel-alex-r', channel: 'event', label: 'Lounge TV exclusive session invite', scheduledAt: daysFromNow(7), frequency: 'Monthly · premium cadence', fatigueRisk: 'low', personalized: true },
    ],
    recognitions: [
      { id: 'rec-1', relationshipId: 'rel-jordan-t', type: 'top-contributor', title: 'TOP CONTRIBUTOR · TRUTH TUESDAY', message: 'Thank you for 5 referrals and consistent advocacy · your impact matters', at: daysAgo(30), sent: true },
      { id: 'rec-2', relationshipId: 'rel-sam-l', type: 'founding-member', title: 'FOUNDING MEMBER · Q1 2026', message: 'You were among our first members · thank you for believing early', at: daysAgo(60), sent: true },
      { id: 'rec-3', relationshipId: 'rel-maya-k', type: 'milestone', title: '100TH PAGE APPROACHING', message: 'You\'re 3 pages from your 100th · celebrate with us', at: daysFromNow(14), sent: false },
      { id: 'rec-4', relationshipId: 'rel-alex-r', type: 'purchase-anniversary', title: 'ONE YEAR · NOIR PURCHASE', message: 'A year of luxury raw hair · thank you for your trust', at: daysFromNow(30), sent: false },
    ],
    loyaltyIntel: {
      'rel-maya-k': { relationshipId: 'rel-maya-k', participation: 72, education: 78, contributions: 35, communityImpact: 40, referrals: 15, support: 60, brandAdvocacy: 38, knowledgeSharing: 45, overallLoyaltyPct: 68, rewardRecommendation: 'Educational series completion badge · membership preview' },
      'rel-jordan-t': { relationshipId: 'rel-jordan-t', participation: 91, education: 88, contributions: 92, communityImpact: 85, referrals: 88, support: 75, brandAdvocacy: 90, knowledgeSharing: 82, overallLoyaltyPct: 91, rewardRecommendation: 'Ambassador tier · creator marketplace priority · recognition ceremony' },
      'rel-sam-l': { relationshipId: 'rel-sam-l', participation: 82, education: 79, contributions: 55, communityImpact: 68, referrals: 45, support: 70, brandAdvocacy: 55, knowledgeSharing: 60, overallLoyaltyPct: 76, rewardRecommendation: 'Community leadership role · founding member recognition' },
      'rel-alex-r': { relationshipId: 'rel-alex-r', participation: 76, education: 65, contributions: 58, communityImpact: 55, referrals: 40, support: 85, brandAdvocacy: 62, knowledgeSharing: 48, overallLoyaltyPct: 74, rewardRecommendation: 'Premium exclusive access · cross-brand wellness bridge' },
    },
    portfolio: [
      { id: 'pf-1', relationshipId: 'rel-alex-r', displayName: 'ALEX R', companies: ['Frontal Slayer', 'NDXBOOK'], roles: ['Repeat customer', 'Premium member', 'Health reader', 'Lounge engaged'], portfolioValue: '$2,080 combined LTV · high cross-brand potential', opportunities: ['Wellness content bridge', 'Portfolio membership bundle', 'Advisor pipeline'] },
    ],
    cosAlerts: [
      { id: 'cos-1', relationshipId: 'rel-maya-k', type: 'needs-attention', label: 'HIGH-VALUE RELATIONSHIP · MEMBERSHIP WINDOW', recommendation: 'Invite to membership within 7 days · trust peak · finance interest rising', urgency: 'high' },
      { id: 'cos-2', relationshipId: 'rel-jordan-t', type: 'recognition-due', label: 'COMMUNITY LEADER DESERVES RECOGNITION', recommendation: 'Schedule ambassador ceremony · creator marketplace onboarding', urgency: 'medium' },
      { id: 'cos-3', relationshipId: 'rel-jordan-t', type: 'future-partner', label: 'FUTURE PARTNER IDENTIFIED', recommendation: 'Proactive creator collaboration · protect long-term trust', urgency: 'high' },
      { id: 'cos-4', relationshipId: 'rel-alex-r', type: 'intervention', label: 'RECENCY DECLINING · PREMIUM MEMBER', recommendation: 'Personalized Lounge TV invite · concierge check-in · prevent weakening', urgency: 'medium' },
    ],
    simulations: [
      { id: 'rsim-1', campaignId: 'camp-money-monday-mar', campaignLabel: 'MONEY MONDAY · MARCH CYCLE', relationshipImpact: '+820 new relationships · 74% engage-to-trust conversion', trustImpact: '+4% avg trust · stat overlay builds authority', communityGrowth: 'Finance Readers +12%', memberGrowth: '8% membership conversion from engaged readers', advocacy: '3 new advocate signals · 12 referral candidates', retention: '+12% returning reader retention', referralGrowth: '+18% referral pipeline', confidencePct: 86 },
      { id: 'rsim-2', campaignId: 'camp-newsletter-q3', campaignLabel: 'NEWSLETTER LAUNCH · Q3', relationshipImpact: '4K owned relationships · reduced platform dependency', trustImpact: 'Owned channel strengthens trust · +6% avg', communityGrowth: 'Early Adopters +28%', memberGrowth: '15% member conversion from subscribers', advocacy: 'Community leader pipeline +5', retention: '+15% retention lift', referralGrowth: '+22% word-of-mouth', confidencePct: 78 },
    ],
    institutionalLearning: [
      { id: 'il-1', type: 'successful-engagement', title: 'Personalized membership invite · 82% conversion on high-trust readers', detail: 'Finance readers with 80%+ trust convert at 3x when invite follows page completion milestone', updatesSystems: ['Reader Graph', 'Studio Intelligence', 'Operational DNA'] },
      { id: 'il-2', type: 'trust-builder', title: 'Question hooks outperform statement hooks for new relationships', detail: 'Discover-stage readers engage 2.1x more with question-based outreach', updatesSystems: ['Distribution Engine', 'Company DNA'] },
      { id: 'il-3', type: 'community-insight', title: 'Finance Readers community accelerates membership conversion', detail: 'Community members convert to membership 40% faster than solo readers', updatesSystems: ['Reader Graph', 'Knowledge Graph'] },
      { id: 'il-4', type: 'pattern', title: 'Advocate pipeline: share → referral → creator marketplace', detail: 'Readers who share 2+ times within 90 days are 85% likely to become advocates', updatesSystems: ['Studio Intelligence', 'Leadership DNA'] },
    ],
    selectedRelationshipId: 'rel-maya-k',
  };
}

export function bootstrapRelationshipEnginePlatform(): void {
  bootstrapRelationshipEngineStore(buildRelationshipEngineSeed());
}
