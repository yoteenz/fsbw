import { STUDIO_WORLD_ROUTE_REGISTRY } from '../studio-world/route-registry';
import { buildRetentionOrbRecommendations } from '../knowledge-retention-engine/orb-reminders/integration';
import { buildProfessionalMemoryOrbRecommendations } from '../professional-memory-wisdom-engine/orb-integration/integration';
import type {
  OrbCompanyContext,
  OrbPersonalizationProfile,
  OrbRecommendation,
  OrbRecommendationCategory,
  OrbRecommendationPriority,
} from './types';

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function legacyPath(routeId: string): string | undefined {
  return STUDIO_WORLD_ROUTE_REGISTRY.find((r) => r.id === routeId)?.legacyPath;
}

function nodeIdForFlagship(flagshipId: string): string {
  return `atlas-flagship-${flagshipId}`;
}

function rec(
  partial: Omit<OrbRecommendation, 'id' | 'actionable'> & { actionable?: boolean }
): OrbRecommendation {
  return { ...partial, id: uid('orb-rec'), actionable: partial.actionable ?? true };
}

const PRIORITY_WEIGHT: Record<OrbRecommendationPriority, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

/** Build the full proactive recommendation set with reasoning and impact metadata. */
export function buildOrbRecommendations(
  context: OrbCompanyContext,
  profile: OrbPersonalizationProfile
): OrbRecommendation[] {
  const recs: OrbRecommendation[] = [];

  if (context.unfinishedProjects > 0) {
    recs.push(
      rec({
        title: 'Continue unfinished Scene Stack assembly',
        reasoning:
          'Creative Direction Studio has an in-progress Golden Build — completing it unlocks reuse across Campaign Studio and Archives.',
        category: 'continue-work',
        priority: 'high',
        estimatedImpact: 'high',
        estimatedMinutes: 25,
        estimatedCost: '$0 — resume existing work',
        potentialSavings: null,
        departmentsAffected: ['Creative Direction', 'Production'],
        creativeEquityGained: '+120 Creative Equity',
        confidenceScore: 91,
        targetPath: legacyPath('creative-direction-immersive'),
        targetNodeId: nodeIdForFlagship('creative-direction-studio'),
      })
    );
  }

  if (context.pendingApprovals > 0) {
    recs.push(
      rec({
        title: `Approve ${context.pendingApprovals} completed generation${context.pendingApprovals === 1 ? '' : 's'}`,
        reasoning:
          'Marketing Headquarters generations finished overnight — approvals release assets to Campaign Studio and Marketplace.',
        category: 'approve-generation',
        priority: 'critical',
        estimatedImpact: 'transformative',
        estimatedMinutes: 12,
        estimatedCost: '$0',
        potentialSavings: null,
        departmentsAffected: ['Marketing', 'Operations'],
        creativeEquityGained: '+85 Creative Equity',
        confidenceScore: 96,
        targetPath: '/admin/studio/campaign-engine',
        targetNodeId: 'hq-marketing-headquarters',
      })
    );
  }

  recs.push(
    rec({
      title: 'Reuse Warehouse environment instead of generating',
      reasoning:
        'Company Genome™ match: an existing glass atrium environment scores 94% fit for your next Marketing wing — skip generation budget.',
      category: 'reuse-asset',
      priority: 'high',
      estimatedImpact: 'high',
      estimatedMinutes: 8,
      estimatedCost: '$0',
      potentialSavings: '61%',
      departmentsAffected: ['Marketing', 'Creative Budget'],
      creativeEquityGained: '+40 Creative Equity',
      confidenceScore: 94,
      targetPath: '/admin/studio/studio-warehouse',
      targetNodeId: nodeIdForFlagship('headquarters'),
    })
  );

  if (context.reusableAssets >= 3) {
    recs.push(
      rec({
        title: 'Archive completed campaign assets',
        reasoning:
          'Studio Archives capacity is optimal — archiving completed generations frees Creative Budget for the next launch cycle.',
        category: 'archive-asset',
        priority: 'medium',
        estimatedImpact: 'moderate',
        estimatedMinutes: 15,
        estimatedCost: '$0',
        potentialSavings: '18% budget headroom',
        departmentsAffected: ['Archives', 'Creative Budget'],
        creativeEquityGained: '+55 Creative Equity',
        confidenceScore: 87,
        targetPath: legacyPath('studio-archives-entry') ?? '/admin/studio/studio-archives',
        targetNodeId: nodeIdForFlagship('studio-archives'),
      })
    );
  }

  if (context.creativeBudgetPct > 70) {
    recs.push(
      rec({
        title: 'Optimize Creative Budget before next generation',
        reasoning: `Creative Budget at ${context.creativeBudgetPct}% — rebalancing reuse vs. new generation prevents overspend this week.`,
        category: 'optimize-budget',
        priority: 'high',
        estimatedImpact: 'high',
        estimatedMinutes: 10,
        estimatedCost: '$0',
        potentialSavings: '22%',
        departmentsAffected: ['Finance', 'Creative'],
        creativeEquityGained: null,
        confidenceScore: 89,
        targetPath: '/admin/studio/world-atlas',
        targetNodeId: nodeIdForFlagship('studio-command-center'),
      })
    );
  }

  if (context.masterPlanCount === 0 || profile.focusMode === 'growth') {
    recs.push(
      rec({
        title: 'Expand Marketing Headquarters capacity',
        reasoning:
          'Organization Pulse indicates Marketing momentum — reserving northern campus land now improves future navigation and AI traffic.',
        category: 'expand-headquarters',
        priority: profile.focusMode === 'growth' ? 'critical' : 'medium',
        estimatedImpact: 'high',
        estimatedMinutes: 20,
        estimatedCost: 'Est. $2.4K generation',
        potentialSavings: null,
        departmentsAffected: ['Marketing', 'Operations'],
        creativeEquityGained: '+200 Creative Equity',
        confidenceScore: 84,
        targetPath: '/admin/studio/world-atlas',
        targetNodeId: nodeIdForFlagship('expedition-hub'),
      })
    );
  }

  recs.push(
    rec({
      title: 'Start guided Expedition for Innovation District',
      reasoning:
        'Expedition Hub recommends a structured expansion path — simulate placement on the Atlas before committing generation budget.',
      category: 'start-expedition',
      priority: 'medium',
      estimatedImpact: 'moderate',
      estimatedMinutes: 30,
      estimatedCost: 'Est. $1.8K',
      potentialSavings: null,
      departmentsAffected: ['Innovation', 'Strategy'],
      creativeEquityGained: '+150 Creative Equity',
      confidenceScore: 82,
      targetPath: legacyPath('expedition-hub-entry') ?? '/admin/studio/expansion-center',
      targetNodeId: nodeIdForFlagship('expedition-hub'),
    })
  );

  recs.push(
    rec({
      title: 'Review new Golden Build in Studio Archives',
      reasoning:
        'Overnight Asset Registry scored a Golden Build at 97% — review before it enters the Marketplace Pavilion.',
      category: 'review-golden-build',
      priority: 'high',
      estimatedImpact: 'high',
      estimatedMinutes: 18,
      estimatedCost: '$0',
      potentialSavings: null,
      departmentsAffected: ['Archives', 'Marketplace'],
      creativeEquityGained: '+95 Creative Equity',
      confidenceScore: 93,
      targetPath: legacyPath('studio-archives-entry') ?? '/admin/studio/studio-archives',
      targetNodeId: nodeIdForFlagship('studio-archives'),
    })
  );

  if (context.marketplaceOpportunities > 0) {
    recs.push(
      rec({
        title: 'Purchase Marketplace Blueprint matching Company Genome™',
        reasoning:
          'A Blueprint Wing listing aligns with your Company Genome signature — purchasing now accelerates Campaign Studio setup.',
        category: 'purchase-blueprint',
        priority: 'medium',
        estimatedImpact: 'moderate',
        estimatedMinutes: 12,
        estimatedCost: 'Est. $340',
        potentialSavings: '40% vs. custom generation',
        departmentsAffected: ['Marketplace', 'Marketing'],
        creativeEquityGained: '+60 Creative Equity',
        confidenceScore: 88,
        targetPath: '/admin/studio/marketplace',
        targetNodeId: nodeIdForFlagship('studio-archives'),
      })
    );
  }

  if (context.aiActivityLevel === 'high') {
    recs.push(
      rec({
        title: 'Visit Operations Wing — AI activity elevated',
        reasoning:
          'Three AI concierges are coordinating overnight — Operations Wing needs founder attention before afternoon launches.',
        category: 'visit-department',
        priority: 'high',
        estimatedImpact: 'high',
        estimatedMinutes: 15,
        estimatedCost: '$0',
        potentialSavings: null,
        departmentsAffected: ['Operations', 'AI Workforce'],
        creativeEquityGained: null,
        confidenceScore: 90,
        targetPath: '/admin/studio/overview',
        targetNodeId: 'scc-operations-wing',
      })
    );
  }

  if (profile.focusMode === 'launch') {
    recs.push(
      rec({
        title: 'Ship Campaign Studio deliverables',
        reasoning: 'Launch Mode™ — Campaign Studio has three assets ready for final review and distribution.',
        category: 'continue-work',
        priority: 'critical',
        estimatedImpact: 'transformative',
        estimatedMinutes: 35,
        estimatedCost: '$0',
        potentialSavings: null,
        departmentsAffected: ['Marketing', 'Distribution'],
        creativeEquityGained: '+180 Creative Equity',
        confidenceScore: 92,
        targetPath: '/admin/studio/campaign-engine',
        targetNodeId: 'hq-marketing-headquarters',
      })
    );
  }

  if (context.constructionActive > 0) {
    recs.push(
      rec({
        title: 'Monitor active campus construction',
        reasoning:
          'A district is mid-construction on the Atlas — reviewing phase progress prevents sequencing conflicts.',
        category: 'visit-department',
        priority: 'medium',
        estimatedImpact: 'moderate',
        estimatedMinutes: 10,
        estimatedCost: '$0',
        potentialSavings: null,
        departmentsAffected: ['Operations', 'Blueprint Archive'],
        creativeEquityGained: null,
        confidenceScore: 86,
        targetPath: '/admin/studio/world-atlas',
        targetNodeId: nodeIdForFlagship('expedition-hub'),
      })
    );
  }

  recs.push(
    rec({
      title: 'Celebrate milestone — campus growth this quarter',
      reasoning:
        'Studio World reached a new district count — acknowledging milestones reinforces intentional master planning.',
      category: 'celebrate-milestone',
      priority: 'low',
      estimatedImpact: 'moderate',
      estimatedMinutes: 5,
      estimatedCost: '$0',
      potentialSavings: null,
      departmentsAffected: ['Executive', 'Legacy'],
      creativeEquityGained: '+25 Creative Equity',
      confidenceScore: 78,
      targetPath: '/admin/studio/overview',
      targetNodeId: nodeIdForFlagship('studio-command-center'),
    })
  );

  if (profile.focusMode === 'builder') {
    recs.push(
      rec({
        title: 'Generate new department wing blueprint',
        reasoning: 'Builder Mode™ — Blueprint Archive has an approved spec ready for Asset Factory generation.',
        category: 'generate-department',
        priority: 'high',
        estimatedImpact: 'high',
        estimatedMinutes: 45,
        estimatedCost: 'Est. $3.2K',
        potentialSavings: null,
        departmentsAffected: ['Blueprint Archive', 'Asset Factory'],
        creativeEquityGained: '+240 Creative Equity',
        confidenceScore: 85,
        targetPath: '/admin/studio/asset-factory',
        targetNodeId: nodeIdForFlagship('creative-direction-studio'),
      })
    );
  }

  recs.push(...buildRetentionOrbRecommendations(context.organizationId, 'studio-local-learner'));
  recs.push(
    ...buildProfessionalMemoryOrbRecommendations(context.organizationId, 'studio-local-learner')
  );

  return recs.sort((a, b) => PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority]);
}

export function categoryLabel(category: OrbRecommendationCategory): string {
  return category.replace(/-/g, ' ').toUpperCase();
}
