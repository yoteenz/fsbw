import { buildDailyBriefingLines } from '../briefing/daily-briefing';
import { constitutionalExpansionSummary } from '../maturity/promotion-gate';
import { readHeadquartersPrinciplesStore } from '../persistence/store';
import { getRoutingPhilosophyLines } from '../routing';
import { listCanonicalTerminology } from '../terminology';

export function buildHeadquartersOrbLines(): string[] {
  const store = readHeadquartersPrinciplesStore();
  const expansion = constitutionalExpansionSummary(store.subsystems);

  return [
    'Studio OS is Company Headquarters™ — not an admin dashboard.',
    `${expansion.eligibleCount} subsystems have earned external expansion eligibility.`,
    ...buildDailyBriefingLines().slice(0, 2),
    'The Orb cites constitutional readiness — capabilities prove value internally first.',
  ];
}

export function resolveHeadquartersPrinciplesOrbLine(query: string): string | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  if (/headquarters|dashboard|atrium|executive/i.test(q)) {
    return 'Studio OS is Company Headquarters™. Founders arrive at Executive Atrium™ — dashboards display; headquarters direct.';
  }

  if (/proof before expansion|platform maturity|readiness|expand|commercial/i.test(q)) {
    const expansion = constitutionalExpansionSummary(readHeadquartersPrinciplesStore().subsystems);
    return `${expansion.eligibleCount} subsystems are expansion-eligible. ${expansion.blockedCount} remain blocked until constitutional readiness is proven internally.`;
  }

  if (/terminology|widget|notification|report|settings|assistant|atlas|orb/i.test(q)) {
    const sample = listCanonicalTerminology().slice(0, 3).map((t) => `${t.legacyTerm} → ${t.constitutionalTerm}`);
    return `Constitutional vocabulary: ${sample.join(' · ')}.`;
  }

  return null;
}

export type HeadquartersOrbAdvice = {
  response: string;
  concierge: 'Headquarters Advisor™';
  briefingLines: string[];
};

export function resolveHeadquartersPrinciplesAdvice(input: string): HeadquartersOrbAdvice | null {
  const line = resolveHeadquartersPrinciplesOrbLine(input);
  if (!line) return null;
  return {
    response: line,
    concierge: 'Headquarters Advisor™',
    briefingLines: [...getRoutingPhilosophyLines(), ...buildDailyBriefingLines()].slice(0, 4),
  };
}
