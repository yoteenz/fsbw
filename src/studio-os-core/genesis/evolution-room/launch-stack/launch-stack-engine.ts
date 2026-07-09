import { buildLaunchStackProgress } from '../../founder-acceptance-testing/launch-stack/progress';
import type { ErLaunchStackProgressItem } from '../types';

export function buildEvolutionLaunchStackProgress(): ErLaunchStackProgressItem[] {
  return buildLaunchStackProgress().map((m) => {
    const blocked = !m.architecturePass || !m.implementationPass;
    const status = m.launchStackComplete
      ? 'graduated'
      : blocked
        ? 'blocked'
        : m.founderAcceptanceStatus === 'pending'
          ? 'validating'
          : 'advancing';

    return {
      systemId: m.systemId,
      officialName: m.officialName,
      status,
      progressPercent: Math.min(100, Math.round(m.overallScore)),
      validationLevel: m.founderAcceptanceStatus,
      blockedReason: blocked
        ? !m.architecturePass
          ? 'Architectural validation incomplete'
          : 'Implementation validation incomplete'
        : undefined,
      nextAction: blocked
        ? `Complete ${!m.architecturePass ? 'architectural' : 'implementation'} validation`
        : m.launchStackComplete
          ? 'Schedule graduation review in Evolution Council'
          : 'Continue Founder Acceptance validation',
    };
  });
}

export function computeLaunchStackProgressPercent(): number {
  const items = buildEvolutionLaunchStackProgress();
  if (items.length === 0) return 0;
  const total = items.reduce((sum, i) => sum + i.progressPercent, 0);
  return Math.round(total / items.length);
}
