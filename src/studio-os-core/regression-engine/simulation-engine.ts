import { REGRESSION_CATEGORY_LABELS, REGRESSION_REPLAY_LABELS, REGRESSION_REPLAYS } from './constants';
import { SYSTEM_SEEDS } from './regression-engine';
import type { BrokenFeature, RegressionReplay, RegressionReplayResult } from './types';

const REPLAY_SYSTEMS: Record<RegressionReplay, string[]> = {
  'customer-journeys': ['Mission Control', 'Studio Orb', 'Knowledge Hub'],
  'employee-workflows': ['Workflow Engine', 'Permission Engine', 'Mission Control'],
  'expert-consultations': ['Expert Marketplace', 'AI Concierges', 'Profession Brain'],
  'marketplace-purchases': ['Expert Marketplace', 'Expansion Center', 'Knowledge Commerce'],
  'knowledge-publishing': ['Knowledge Hub', 'Knowledge Graph', 'Documentation Sync'],
  'appointment-booking': ['Integrations', 'Workflows', 'Notifications'],
  'ai-conversations': ['AI Concierges', 'Studio Intelligence', 'Command Dock'],
  'automation-chains': ['Automations', 'Event Bus', 'Workflow Engine'],
  onboarding: ['Workflows', 'Living Headquarters', 'Knowledge Hub'],
  'organization-creation': ['Organization Context', 'Profession Brain', 'Mission Control'],
};

const REPLAY_MODIFIERS: Record<RegressionReplay, { scoreDelta: number; steps: number; note: string }> = {
  'customer-journeys': { scoreDelta: -4, steps: 12, note: 'End-to-end customer path through HQ and Orb' },
  'employee-workflows': { scoreDelta: -8, steps: 18, note: 'Permission-gated employee daily workflow' },
  'expert-consultations': { scoreDelta: -6, steps: 9, note: 'Expert booking and AI-assisted consultation' },
  'marketplace-purchases': { scoreDelta: -10, steps: 14, note: 'Pack selection through checkout completion' },
  'knowledge-publishing': { scoreDelta: -5, steps: 11, note: 'Draft to published knowledge node' },
  'appointment-booking': { scoreDelta: -12, steps: 8, note: 'Calendar integration and confirmation flow' },
  'ai-conversations': { scoreDelta: -7, steps: 16, note: 'Multi-turn Concierge routing chain' },
  'automation-chains': { scoreDelta: -9, steps: 22, note: 'Trigger through automation completion' },
  onboarding: { scoreDelta: -6, steps: 15, note: 'New user onboarding checklist completion' },
  'organization-creation': { scoreDelta: -11, steps: 20, note: 'Org bootstrap through first Mission Control visit' },
};

export function buildRegressionReplayResults(
  brokenFeatures: BrokenFeature[],
  baseScore: number
): RegressionReplayResult[] {
  const results: RegressionReplayResult[] = [];
  const systems = SYSTEM_SEEDS.slice(0, 6);

  for (const sys of systems) {
    for (const replay of REGRESSION_REPLAYS) {
      const mod = REPLAY_MODIFIERS[replay];
      const relatedBreaks = brokenFeatures.filter((b) =>
        REPLAY_SYSTEMS[replay].some((s) => b.affectedSystems.some((a) => a.includes(s.split(' ')[0] ?? s)))
      );
      const breakPenalty = relatedBreaks.length * 6;
      const regressionScore = Math.max(38, Math.min(99, baseScore + mod.scoreDelta - breakPenalty));
      const passed = regressionScore >= 82 && relatedBreaks.filter((b) => b.severity === 'critical').length === 0;
      const category = brokenFeatures.find((b) =>
        REPLAY_SYSTEMS[replay].some((s) => b.affectedSystems.includes(s))
      )?.category ?? 'workflows';

      results.push({
        id: `replay-${replay}-${sys.systemId}`,
        replay,
        replayLabel: REGRESSION_REPLAY_LABELS[replay],
        category,
        categoryLabel: REGRESSION_CATEGORY_LABELS[category],
        systemsTested: REPLAY_SYSTEMS[replay],
        passed,
        regressionScore,
        stepsReplayed: mod.steps,
        summary: `${REGRESSION_REPLAY_LABELS[replay]} replay on ${sys.systemLabel}: ${mod.note}. ${passed ? 'All steps passed — no regressions.' : 'Regression detected — see build report.'}`,
      });
    }
  }

  return results.slice(0, 40);
}
