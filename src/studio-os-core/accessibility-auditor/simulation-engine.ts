import { SIMULATION_USER_LABELS, SIMULATION_USER_TYPES } from './constants';
import { PAGE_SEEDS } from './audit-engine';
import type { AccessibilityPageReport, SimulationUserType, UserSimulationResult } from './types';

const USER_MODIFIERS: Record<
  SimulationUserType,
  { scoreDelta: number; barriers: number; note: string }
> = {
  'low-vision': { scoreDelta: -8, barriers: 2, note: 'Requires high contrast and font scaling support' },
  blindness: { scoreDelta: -14, barriers: 4, note: 'Requires complete screen reader and keyboard path' },
  'color-blindness': { scoreDelta: -6, barriers: 1, note: 'Cannot rely on color alone for state communication' },
  'motor-impairments': { scoreDelta: -10, barriers: 3, note: 'Requires large touch targets and keyboard alternatives' },
  'hearing-impairments': { scoreDelta: -4, barriers: 1, note: 'Requires captions and visual alternatives to audio' },
  'cognitive-accessibility-needs': { scoreDelta: -9, barriers: 2, note: 'Requires clear structure, plain language, low cognitive load' },
  'temporary-limitations': { scoreDelta: -5, barriers: 1, note: 'Broken arm, bright sunlight, noisy environment — situational barriers' },
};

export function buildUserSimulations(pageReports: AccessibilityPageReport[]): UserSimulationResult[] {
  const simulations: UserSimulationResult[] = [];
  const pages = pageReports.length > 0 ? pageReports : PAGE_SEEDS.map((p) => ({
    pageId: p.pageId,
    pageLabel: p.pageLabel,
    accessibilityScore: 82,
  }));

  for (const page of pages.slice(0, 6)) {
    for (const userType of SIMULATION_USER_TYPES) {
      const mod = USER_MODIFIERS[userType];
      const base = 'accessibilityScore' in page ? page.accessibilityScore : 82;
      const accessibilityScore = Math.max(35, Math.min(99, base + mod.scoreDelta));
      const barriersEncountered = mod.barriers + (base < 80 ? 1 : 0);
      const passed = accessibilityScore >= 78 && barriersEncountered <= 1;

      simulations.push({
        id: `sim-${userType}-${page.pageId}`,
        userType,
        userTypeLabel: SIMULATION_USER_LABELS[userType],
        pageId: page.pageId,
        pageLabel: page.pageLabel,
        accessibilityScore,
        barriersEncountered,
        summary: `${SIMULATION_USER_LABELS[userType]} on ${page.pageLabel}: ${mod.note}. ${passed ? 'Experience remains inclusive and usable.' : `${barriersEncountered} barrier(s) detected.`}`,
        passed,
      });
    }
  }

  return simulations;
}
