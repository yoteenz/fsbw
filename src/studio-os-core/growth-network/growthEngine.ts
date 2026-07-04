import type { GrowthProfile, GrowthOpportunity, GrowthRecommendation } from './types';

export function calculateGrowthScore(profile: GrowthProfile): number {
  let score = 30;
  if (profile.socialPlatforms.length >= 2) score += 8;
  if (profile.revenueChannels.length >= 2) score += 10;
  if (profile.partnerships.length >= 1) score += 8;
  if (profile.affiliatePrograms.length >= 1) score += 5;
  if (profile.currentGoals.length >= 3) score += 4;
  if (profile.engagementSummary.includes('%')) score += 6;
  if (profile.monthlyGrowth.startsWith('+')) score += 8;
  if (profile.roadmapStage === 'traction') score += 6;
  if (profile.roadmapStage === 'growth') score += 10;
  if (profile.roadmapStage === 'scale') score += 14;
  return Math.min(100, Math.max(0, score));
}

export function matchOpportunitiesForProfile(
  profile: GrowthProfile,
  catalog: Omit<GrowthOpportunity, 'workspaceId' | 'matchScore' | 'matchReason'>[]
): GrowthOpportunity[] {
  const preferred = new Set(profile.memoryBibleGrowth.preferredPartnershipTypes);

  return catalog
    .map((opp) => {
      let matchScore = 50;
      const reasons: string[] = [];

      if (preferred.has(opp.type)) {
        matchScore += 25;
        reasons.push('Matches preferred partnership types in Memory Bible growth strategy');
      }
      if (profile.niche.toLowerCase().includes('media') && opp.type.includes('sponsorship')) {
        matchScore += 10;
        reasons.push('Media company niche aligns with sponsorship format');
      }
      if (profile.socialPlatforms.length >= 3 && ['ugc-opportunity', 'brand-partnership'].includes(opp.type)) {
        matchScore += 8;
        reasons.push('Multi-platform presence supports campaign deliverables');
      }
      if (profile.revenueChannels.includes('affiliate-income') && opp.type === 'affiliate-program') {
        matchScore += 12;
        reasons.push('Existing affiliate revenue channel — natural expansion');
      }
      if (profile.roadmapStage === 'traction' && ['collaboration', 'podcast-appearance'].includes(opp.type)) {
        matchScore += 6;
        reasons.push('Traction stage benefits visibility partnerships');
      }

      return {
        ...opp,
        workspaceId: profile.workspaceId,
        matchScore: Math.min(99, matchScore),
        matchReason: reasons.join(' · ') || 'General fit based on company profile',
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}

export function buildGrowthRecommendations(profile: GrowthProfile): GrowthRecommendation[] {
  const recs: GrowthRecommendation[] = [];
  const ws = profile.workspaceId;

  if (profile.revenueChannels.length < 3) {
    recs.push({
      id: `${ws}-rec-diversify-revenue`,
      title: 'Diversify revenue channels',
      rationale: `Only ${profile.revenueChannels.length} revenue channel(s) detected. Adding affiliate or digital product streams reduces platform dependency.`,
      category: 'Revenue',
      priority: 'high',
      workspaceId: ws,
    });
  }
  if (profile.socialPlatforms.length < 2) {
    recs.push({
      id: `${ws}-rec-expand-platform`,
      title: 'Expand to another platform',
      rationale: 'Single-platform presence limits discovery and partnership leverage. Cross-posting increases match quality for brand deals.',
      category: 'Distribution',
      priority: 'medium',
      workspaceId: ws,
    });
  }
  if (profile.growthScore < 60) {
    recs.push({
      id: `${ws}-rec-consistency`,
      title: 'Increase posting consistency',
      rationale: 'Growth score indicates content consistency and analytics maturity gaps. Steady publishing improves engagement signals for sponsors.',
      category: 'Content',
      priority: 'high',
      workspaceId: ws,
    });
  }
  if (profile.companyType === 'media-company') {
    recs.push({
      id: `${ws}-rec-sponsorship-pricing`,
      title: 'Raise sponsorship pricing',
      rationale: `${profile.engagementSummary} supports higher CPM tiers — review rate card against comparable creators in niche.`,
      category: 'Partnerships',
      priority: 'medium',
      workspaceId: ws,
    });
  }
  recs.push({
    id: `${ws}-rec-email`,
    title: 'Launch email marketing',
    rationale: 'Owned audience reduces platform algorithm risk and improves partnership conversion for launches.',
    category: 'Marketing',
    priority: 'medium',
    workspaceId: ws,
  });

  return recs;
}

export function roadmapPriorities(stage: GrowthProfile['roadmapStage']): string[] {
  const map: Record<GrowthProfile['roadmapStage'], string[]> = {
    launch: ['Complete growth profile', 'Define niche & audience', 'First content cadence'],
    traction: ['First brand partnerships', 'Affiliate program setup', 'Analytics baseline'],
    growth: ['Scale partnerships', 'Hire editor or VA', 'Membership or course launch'],
    scale: ['Team expansion', 'Enterprise partnerships', 'Revenue diversification audit'],
    enterprise: ['Institutional deals', 'Licensing programs', 'Multi-workspace ops'],
    legacy: ['Succession planning', 'IP licensing', 'Long-term philanthropy or foundation'],
  };
  return map[stage];
}
