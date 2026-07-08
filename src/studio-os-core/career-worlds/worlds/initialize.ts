import type { CareerWorldBlueprint } from '../types';
import type { CareerWorldState, CareerWorldSeason } from '../core/schemas';

function seasonForMonth(month: number): CareerWorldSeason {
  const m = ((month - 1) % 12) + 1;
  if (m <= 3) return 'spring';
  if (m <= 6) return 'summer';
  if (m <= 9) return 'autumn';
  return 'winter';
}

export function createInitialWorldState(blueprint: CareerWorldBlueprint, now = new Date()): CareerWorldState {
  const ts = now.toISOString();
  return {
    worldId: blueprint.id,
    simulatedDay: 1,
    simulatedWeek: 1,
    simulatedMonth: 1,
    simulatedYear: 1,
    season: 'spring',
    economyIndex: 1,
    industryTrend: blueprint.economy.marketForces[0] ?? 'Stable demand',
    companyGrowthIndex: 0.15,
    activeTrends: blueprint.economy.marketForces.slice(0, 3),
    openJobs: [
      {
        id: `${blueprint.slug}-job-entry`,
        title: `${blueprint.profession} Apprentice`,
        company: `${blueprint.profession} Collective`,
        district: blueprint.canonicalDistricts[0] ?? 'Central District',
        postedDay: 1,
        urgency: 'medium',
      },
    ],
    activeProjects: [],
    clientHistory: [],
    worldEvents: [],
    communityChallenges: [
      {
        id: `${blueprint.slug}-challenge-welcome`,
        title: `Establish your ${blueprint.profession} reputation`,
        progress: 0,
        target: 100,
        reward: 'Community recognition',
        expiresDay: 30,
      },
    ],
    seasonalContent: [`${blueprint.profession} ${seasonForMonth(1)} orientation`],
    npcRelationshipSummary: {},
    lastTickAt: ts,
  };
}

export function advanceWorldCalendar(state: CareerWorldState, days: number): CareerWorldState {
  let day = state.simulatedDay + days;
  let week = state.simulatedWeek;
  let month = state.simulatedMonth;
  let year = state.simulatedYear;

  while (day > 7) {
    day -= 7;
    week += 1;
  }
  while (week > 4) {
    week -= 4;
    month += 1;
  }
  while (month > 12) {
    month -= 12;
    year += 1;
  }

  return {
    ...state,
    simulatedDay: day,
    simulatedWeek: week,
    simulatedMonth: month,
    simulatedYear: year,
    season: seasonForMonth(month),
    seasonalContent: [`Season ${seasonForMonth(month)} — ${state.worldId}`],
  };
}
