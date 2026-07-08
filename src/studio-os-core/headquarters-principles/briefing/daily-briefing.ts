import { constitutionalExpansionSummary } from '../maturity/promotion-gate';
import { getLowestReadinessDimension } from '../maturity/readiness';
import { listExpansionCandidates } from '../maturity/registry';
import { readHeadquartersPrinciplesStore } from '../persistence/store';
import { PLATFORM_MATURITY_STAGE_LABELS } from '../maturity/stages';
import type { DailyBriefingLine } from '../types';

export function buildDailyBriefing(): DailyBriefingLine[] {
  const store = readHeadquartersPrinciplesStore();
  const expansion = constitutionalExpansionSummary(store.subsystems);
  const candidates = listExpansionCandidates(store.subsystems);
  const topReady = [...store.subsystems].sort((a, b) => b.platformReadiness - a.platformReadiness)[0];
  const lowest = topReady ? getLowestReadinessDimension(topReady.readinessDimensions) : undefined;

  const lines: DailyBriefingLine[] = [
    {
      kind: 'priority',
      title: 'Executive Atrium™',
      detail: 'You are in Company Headquarters™ — lead the organization, do not merely monitor it.',
      routePath: '/admin/studio/overview',
    },
    {
      kind: 'readiness',
      title: 'Platform Readiness',
      detail: `${expansion.eligibleCount} subsystems eligible for external expansion · ${expansion.blockedCount} blocked by constitutional proof requirements.`,
      routePath: '/admin/studio/headquarters-principles',
    },
  ];

  if (candidates[0]) {
    lines.push({
      kind: 'maturity',
      title: candidates[0].title,
      detail: `${PLATFORM_MATURITY_STAGE_LABELS[candidates[0].currentStage]} · readiness ${candidates[0].platformReadiness}% — ${candidates[0].expansionEligible ? 'expansion eligible' : candidates[0].expansionBlockers[0] ?? 'proof in progress'}.`,
      routePath: candidates[0].routePath,
    });
  }

  if (lowest) {
    lines.push({
      kind: 'advisory',
      title: 'Proof Before Expansion',
      detail: `Improve ${lowest.label.toLowerCase()} (${lowest.score}%) before promoting ${topReady?.title ?? 'platform capabilities'} externally.`,
      routePath: '/admin/studio/headquarters-principles',
    });
  }

  lines.push({
    kind: 'navigation',
    title: 'Atlas™',
    detail: 'Navigate through space — departments, wings, and rooms replace dashboard menus.',
    routePath: '/admin/studio/world-atlas',
  });

  return lines;
}

export function buildDailyBriefingLines(): string[] {
  return buildDailyBriefing().map((line) => `${line.title}: ${line.detail}`);
}
