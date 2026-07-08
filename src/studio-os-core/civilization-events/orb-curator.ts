/**
 * Civilization Curator™ — Orb identifies talent, collaborations, and opportunities.
 */

import type {
  CivilizationEvent,
  CivilizationEventsSnapshot,
  CrossDisciplineTeam,
  GrandChallenge,
} from './types';

type CuratorInsight = {
  priority: number;
  line: string;
};

export function buildOrbCuratorLine(input: {
  activeEvents: CivilizationEvent[];
  grandChallenge: GrandChallenge | null;
  crossDisciplineTeams: CrossDisciplineTeam[];
  participationEligible: string[];
  collaborationCapital: number;
  unlockedDiscoveryCount: number;
}): string | null {
  const insights: CuratorInsight[] = [];

  const crossEvent = input.activeEvents.find((e) => e.category === 'cross-discipline-championship');
  if (crossEvent && input.collaborationCapital >= 45) {
    insights.push({
      priority: 95,
      line: `Cross-Discipline Championship™ active — collaboration weighted 2×. I see ${input.crossDisciplineTeams.length} teams forming. Your professions could unite for a civilization discovery.`,
    });
  }

  if (input.grandChallenge && input.grandChallenge.status === 'active') {
    insights.push({
      priority: 92,
      line: `The Grand Challenge™ "${input.grandChallenge.theme}" is ${input.grandChallenge.communityProgressPct}% complete. Winning ideas permanently expand Studio World — not badges, but new districts.`,
    });
  }

  const expo = input.activeEvents.find((e) => e.category === 'world-expo');
  if (expo) {
    insights.push({
      priority: 88,
      line: 'Studio World Expo™ approaching — exhibit your Blueprints, HQ, and AI. Visitors explore, vote, purchase, license, and collaborate.',
    });
  }

  if (input.participationEligible.length > 0) {
    insights.push({
      priority: 85,
      line: `You are eligible for: ${input.participationEligible.slice(0, 2).join(' · ')}. Participation permanently enriches the World Graph™.`,
    });
  }

  const formingTeam = input.crossDisciplineTeams.find((t) => t.status === 'forming');
  if (formingTeam) {
    insights.push({
      priority: 80,
      line: `"${formingTeam.label}" seeks ${formingTeam.professions.slice(-2).join(' + ')} — a community that should meet for cross-profession innovation.`,
    });
  }

  if (input.unlockedDiscoveryCount > 0) {
    insights.push({
      priority: 75,
      line: `${input.unlockedDiscoveryCount} Civilization Discoveries™ unlocked — earned rewards that permanently expanded the world.`,
    });
  }

  const hqShowcase = input.activeEvents.find((e) => e.category === 'headquarters-showcase');
  if (hqShowcase) {
    insights.push({
      priority: 78,
      line: 'Headquarters Showcase™ — submit your campus. Greatest headquarters become permanent Living Museum™ exhibits.',
    });
  }

  if (insights.length === 0) {
    return 'Civilization Events™ await — every challenge leaves Studio World smarter than before. I will identify emerging talent and collaborations.';
  }

  insights.sort((a, b) => b.priority - a.priority);
  return insights[0]!.line;
}

export function buildEventsSummary(snapshot: Pick<CivilizationEventsSnapshot, 'activeEvents' | 'grandChallenge' | 'worldExpo'>): string {
  const active = snapshot.activeEvents.length;
  const parts: string[] = [];
  if (active > 0) parts.push(`${active} active event${active > 1 ? 's' : ''}`);
  if (snapshot.grandChallenge?.status === 'active') parts.push('Grand Challenge live');
  if (snapshot.worldExpo) parts.push(`Expo ${snapshot.worldExpo.year}`);
  if (parts.length === 0) return 'Civilization Events™ — discoveries await';
  return `Civilization Events™ — ${parts.join(' · ')}`;
}
