import { getOrganizationPerformanceMonitorProfile } from '../performance-monitor/store';
import { getOrganizationAccessibilityAuditorProfile } from '../accessibility-auditor/store';
import { getOrganizationVisualDiffEngineProfile } from '../visual-diff-engine/store';
import {
  REGRESSION_CATEGORY_LABELS,
  REGRESSION_CATEGORIES,
} from './constants';
import type { BrokenFeature, CategoryRegressionScore, RegressionCategory } from './types';

export const SYSTEM_SEEDS = [
  { systemId: 'mission-control', systemLabel: 'Mission Control', route: '/admin/studio/mission-control' },
  { systemId: 'qa-headquarters', systemLabel: 'QA Headquarters', route: '/admin/studio/qa-headquarters' },
  { systemId: 'regression-engine', systemLabel: 'Regression Engine', route: '/admin/studio/regression-engine' },
  { systemId: 'performance-monitor', systemLabel: 'Performance Monitor', route: '/admin/studio/performance-monitor' },
  { systemId: 'accessibility-auditor', systemLabel: 'Accessibility Auditor', route: '/admin/studio/accessibility-auditor' },
  { systemId: 'visual-diff-engine', systemLabel: 'Visual Diff Engine', route: '/admin/studio/visual-diff-engine' },
  { systemId: 'profession-brain', systemLabel: 'Profession Brain', route: '/admin/studio/profession-brain' },
  { systemId: 'studio-intelligence', systemLabel: 'Studio Intelligence', route: '/admin/studio/studio-intelligence' },
];

const BROKEN_FEATURE_SEEDS: Omit<
  BrokenFeature,
  'id' | 'categoryLabel' | 'featureId' | 'featureLabel'
>[] = [
  {
    category: 'navigation',
    severity: 'critical',
    description: 'Intelligence wing nav item routes to stale QA page after route refactor.',
    unexpectedChange: 'Route segment renamed without nav registry update.',
    affectedSystems: ['Mission Control', 'Admin Studio Navigation', 'QA Headquarters'],
    rootCause: 'adminStudioNavigation.ts not synced with App.tsx route rename.',
    suggestedFix: 'Run documentation-sync registry validation · update nav route map.',
    rollbackRecommendation: 'Revert route rename or patch nav registry before next deploy.',
  },
  {
    category: 'ui-components',
    severity: 'warning',
    description: 'ExecutiveHealthRing renders 0% when profile sync returns null during boundary change.',
    unexpectedChange: 'Null guard removed in Mission Control panel refactor.',
    affectedSystems: ['Mission Control', 'Performance Monitor', 'Accessibility Auditor'],
    rootCause: 'Optional chaining removed from panel health ring value prop.',
    suggestedFix: 'Restore null guard · show loading skeleton until profile sync completes.',
    rollbackRecommendation: 'Revert panel refactor commit affecting health ring props.',
  },
  {
    category: 'profession-brains',
    severity: 'critical',
    description: 'Profession Brain prompt routing fails when prompt complexity exceeds token threshold.',
    unexpectedChange: 'Prompt chunking logic disabled in latest brain sync.',
    affectedSystems: ['Profession Brain', 'Prompt QA', 'Studio Intelligence'],
    rootCause: 'Chunk threshold lowered without fallback routing path.',
    suggestedFix: 'Re-enable prompt chunking · add complexity guard before brain invocation.',
    rollbackRecommendation: 'Rollback Profession Brain sync engine changes from last release.',
  },
  {
    category: 'permissions',
    severity: 'critical',
    description: 'Employee workflow loses admin access after permission matrix update.',
    unexpectedChange: 'Permission inheritance rule changed for intelligence wing modules.',
    affectedSystems: ['Permission Engine', 'Workflows', 'Mission Control'],
    rootCause: 'New permission group not mapped to existing role templates.',
    suggestedFix: 'Migrate role templates · add regression test for permission inheritance.',
    rollbackRecommendation: 'Revert permission matrix update · restore previous role mappings.',
  },
  {
    category: 'workflows',
    severity: 'warning',
    description: 'Onboarding checklist skips Knowledge Hub step after workflow reorder.',
    unexpectedChange: 'Step order changed without updating completion validators.',
    affectedSystems: ['Workflow Engine', 'Knowledge Hub', 'Onboarding'],
    rootCause: 'Validator still references deprecated step index.',
    suggestedFix: 'Update step validators to use step IDs instead of indices.',
    rollbackRecommendation: 'Restore previous onboarding step order until validators fixed.',
  },
  {
    category: 'automations',
    severity: 'warning',
    description: 'Automation chain fires duplicate notifications on org boundary sync.',
    unexpectedChange: 'Event listener deduplication removed from cascade sync.',
    affectedSystems: ['Event Bus', 'Automations', 'Notifications'],
    rootCause: 'Duplicate listeners registered on each boundary change event.',
    suggestedFix: 'Re-add listener deduplication · debounce cascade triggers.',
    rollbackRecommendation: 'Disable duplicate automation triggers until patch deployed.',
  },
  {
    category: 'ai-concierges',
    severity: 'advisory',
    description: 'Concierge routing returns stale Performance Monitor advice after module rename.',
    unexpectedChange: 'Dock advisor registry not updated for new module slug.',
    affectedSystems: ['Command Dock', 'Performance Monitor', 'Regression Engine'],
    rootCause: 'Advisor resolver chain missing new module registration.',
    suggestedFix: 'Register Regression Engine dock advisor · refresh advisor index.',
    rollbackRecommendation: 'No rollback needed — patch advisor registry only.',
  },
  {
    category: 'marketplace',
    severity: 'warning',
    description: 'Marketplace purchase flow fails at checkout when Expert Marketplace pack selected.',
    unexpectedChange: 'Pack registry ID renamed without checkout adapter update.',
    affectedSystems: ['Expert Marketplace', 'Expansion Center', 'Knowledge Commerce'],
    rootCause: 'Checkout adapter references deprecated pack slug.',
    suggestedFix: 'Update checkout adapter pack IDs · add marketplace regression replay.',
    rollbackRecommendation: 'Revert pack registry rename or hotfix checkout adapter.',
  },
  {
    category: 'knowledge-graph',
    severity: 'advisory',
    description: 'Knowledge publishing creates orphan nodes after graph schema migration.',
    unexpectedChange: 'Parent node reference field renamed in schema.',
    affectedSystems: ['Knowledge Hub', 'Knowledge Graph', 'Documentation Sync'],
    rootCause: 'Migration script did not backfill parent references.',
    suggestedFix: 'Run backfill migration · validate graph integrity on publish.',
    rollbackRecommendation: 'Pause knowledge publishing until backfill completes.',
  },
  {
    category: 'integrations',
    severity: 'warning',
    description: 'External calendar integration returns 403 after API scope change.',
    unexpectedChange: 'OAuth scope expanded without re-authorization flow.',
    affectedSystems: ['Integrations', 'Appointment Booking', 'Workflows'],
    rootCause: 'Existing tokens lack new required scopes.',
    suggestedFix: 'Trigger re-authorization for affected integrations.',
    rollbackRecommendation: 'Revert scope change or provide scope migration path.',
  },
  {
    category: 'notifications',
    severity: 'advisory',
    description: 'Push notifications duplicate for regression report alerts.',
    unexpectedChange: 'Alert deduplication window reduced from 5min to 0.',
    affectedSystems: ['Notifications', 'Regression Engine', 'QA Headquarters'],
    rootCause: 'Config default changed in notification engine.',
    suggestedFix: 'Restore 5-minute deduplication window for regression alerts.',
    rollbackRecommendation: 'Revert notification engine config default.',
  },
  {
    category: 'reports',
    severity: 'warning',
    description: 'Executive report export missing Performance Monitor section after template update.',
    unexpectedChange: 'Report template sections reordered without data binding update.',
    affectedSystems: ['Reports', 'Performance Monitor', 'Mission Control'],
    rootCause: 'Template binding still references old section key.',
    suggestedFix: 'Update report template bindings · add export regression test.',
    rollbackRecommendation: 'Revert report template until bindings fixed.',
  },
  {
    category: 'dashboards',
    severity: 'warning',
    description: 'Company Pulse dashboard shows stale regression score after sync.',
    unexpectedChange: 'Dashboard cache TTL increased to 24h for performance.',
    affectedSystems: ['Mission Control', 'Regression Engine', 'Organization Pulse'],
    rootCause: 'Cache invalidation not triggered on regression sync event.',
    suggestedFix: 'Invalidate dashboard cache on STUDIO_OS_REGRESSION_ENGINE_UPDATED.',
    rollbackRecommendation: 'Reduce cache TTL until invalidation hook added.',
  },
  {
    category: 'studio-orb',
    severity: 'advisory',
    description: 'Studio Orb mount fails silently when Living Headquarters profile missing.',
    unexpectedChange: 'Fallback mount path removed in Orb refactor.',
    affectedSystems: ['Studio Orb', 'Living Headquarters', 'Mission Control'],
    rootCause: 'Orb bootstrap assumes HQ profile always present.',
    suggestedFix: 'Restore fallback mount · show graceful empty state.',
    rollbackRecommendation: 'Revert Orb refactor commit removing fallback path.',
  },
  {
    category: 'living-headquarters',
    severity: 'warning',
    description: 'Living Headquarters ambient briefing uses wrong organization after boundary switch.',
    unexpectedChange: 'Organization context listener not re-bound on workspace change.',
    affectedSystems: ['Living Headquarters', 'Organization Context', 'Ambient Briefing'],
    rootCause: 'Stale closure captures previous organizationId in briefing hook.',
    suggestedFix: 'Re-bind organization listener on workspaceId change.',
    rollbackRecommendation: 'Revert briefing hook changes affecting org context binding.',
  },
  {
    category: 'studio-intelligence',
    severity: 'critical',
    description: 'Studio Intelligence flags false positive on unchanged modules after scorer recalibration.',
    unexpectedChange: 'Regression score threshold lowered without baseline recalibration.',
    affectedSystems: ['Studio Intelligence', 'Regression Engine', 'QA Headquarters'],
    rootCause: 'New threshold applied to historical baselines without migration.',
    suggestedFix: 'Recalibrate baselines · adjust threshold with Historical Memory™ patterns.',
    rollbackRecommendation: 'Restore previous scorer threshold until baselines migrated.',
  },
];

export function buildCategoryScores(organizationId: string): CategoryRegressionScore[] {
  const performance = getOrganizationPerformanceMonitorProfile(organizationId);
  const accessibility = getOrganizationAccessibilityAuditorProfile(organizationId);
  const visualDiff = getOrganizationVisualDiffEngineProfile(organizationId);

  const perfScore = performance?.overallPerformanceScore ?? 82;
  const a11yScore = accessibility?.overallAccessibilityScore ?? 86;
  const visualScore = visualDiff?.visualMemoryScore ?? 84;

  const baseByCategory: Partial<Record<RegressionCategory, number>> = {
    'ui-components': visualScore,
    navigation: Math.max(70, perfScore - 6),
    'profession-brains': 78,
    'studio-intelligence': 80,
    'ai-concierges': 76,
    workflows: 82,
    automations: 79,
    marketplace: 81,
    'knowledge-graph': 83,
    integrations: 77,
    permissions: 74,
    notifications: 85,
    reports: 80,
    dashboards: Math.max(72, perfScore - 4),
    'studio-orb': a11yScore - 8,
    'living-headquarters': 78,
  };

  return REGRESSION_CATEGORIES.map((category) => {
    const score = baseByCategory[category] ?? 80;
    const regressionsCount = score < 78 ? 2 : score < 85 ? 1 : 0;
    return {
      category,
      label: REGRESSION_CATEGORY_LABELS[category],
      score,
      status: score >= 88 ? 'stable' : score >= 75 ? 'watch' : 'regressed',
      summary:
        score >= 88
          ? 'No regressions detected — functionality preserved.'
          : regressionsCount > 0
            ? `${regressionsCount} regression(s) detected in recent builds.`
            : 'Monitoring — related systems retested on change.',
      regressionsCount,
    };
  });
}

export function buildBrokenFeatures(organizationId: string): BrokenFeature[] {
  void organizationId;
  return BROKEN_FEATURE_SEEDS.map((seed, i) => ({
    ...seed,
    id: `broken-${seed.category}-${i}`,
    featureId: `feature-${seed.category}-${i}`,
    featureLabel: seed.description.split('.')[0] ?? seed.category,
    categoryLabel: REGRESSION_CATEGORY_LABELS[seed.category],
  }));
}

export function countBrokenFeatures(features: BrokenFeature[]): number {
  return features.filter((f) => f.severity === 'critical' || f.severity === 'warning').length;
}

export function computeOverallRegressionScore(reports: import('./types').BuildRegressionReport[]): number {
  if (reports.length === 0) return 88;
  return Math.round(reports.reduce((s, r) => s + r.regressionScore, 0) / reports.length);
}

export function countRecurringPatterns(memory: import('./types').HistoricalMemoryEntry[]): number {
  return memory.filter((m) => m.status === 'recurring' || m.recurrenceCount >= 2).length;
}
