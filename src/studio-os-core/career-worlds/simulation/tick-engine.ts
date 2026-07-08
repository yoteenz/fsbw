import { CAREER_WORLD_HOURS_PER_SIM_DAY } from '../constants';
import type { CareerWorldSave } from '../core/schemas';
import { tickEconomy, estimateIncomeMultiplier } from '../economy/engine';
import { tickCompanyLife } from '../company-life/engine';
import { advanceWorldClock, dueScheduleEntries } from '../world-clock/clock';
import { advanceWorldCalendar } from '../worlds/initialize';
import {
  pickRandomEventTemplate,
  spawnEventFromTemplate,
} from '../industry-events/registry';
import { adjustReputation, promotionProgress } from '../reputation/engine';
import { npcTrustSummary, mentorFeedback } from '../social-network/ecosystem';
import { appendCareerHistoryEntry } from '../career-history/store';
import { eligibleAward, grantAward } from '../awards/registry';
import { bundleCareerWorldSave } from '../worlds/registry';
import { CAREER_WORLD_BLUEPRINT_BY_ID } from '../catalog';

export type SimulationTickResult = {
  save: CareerWorldSave;
  simulatedDaysAdvanced: number;
  eventsTriggered: string[];
  reputationDelta: number;
};

export function offlineHoursToSimulatedDays(offlineHours: number): number {
  return Math.max(0, Math.floor(offlineHours / CAREER_WORLD_HOURS_PER_SIM_DAY));
}

export function runSimulationTick(save: CareerWorldSave, options?: { forceDays?: number }): SimulationTickResult {
  const bundle = bundleCareerWorldSave(save);
  const blueprint = CAREER_WORLD_BLUEPRINT_BY_ID[save.worldId];
  if (!blueprint) {
    return { save, simulatedDaysAdvanced: 0, eventsTriggered: [], reputationDelta: 0 };
  }
  const now = new Date();
  const lastSeen = new Date(save.lastSeenAt);
  const offlineHours = Math.max(0, (now.getTime() - lastSeen.getTime()) / 3_600_000);
  const simulatedDays = options?.forceDays ?? offlineHoursToSimulatedDays(offlineHours);

  if (simulatedDays <= 0) {
    return { save, simulatedDaysAdvanced: 0, eventsTriggered: [], reputationDelta: 0 };
  }

  let worldState = advanceWorldCalendar(bundle.worldState, simulatedDays);
  worldState = tickEconomy(worldState, blueprint, simulatedDays);
  worldState = tickCompanyLife(worldState, blueprint, simulatedDays);

  const clock = advanceWorldClock(bundle.clock, simulatedDays);
  const totalDays =
    (worldState.simulatedYear - 1) * 12 * 4 * 7 +
    (worldState.simulatedMonth - 1) * 4 * 7 +
    (worldState.simulatedWeek - 1) * 7 +
    worldState.simulatedDay;

  const dueEntries = dueScheduleEntries(clock, totalDays);
  const eventsTriggered: string[] = [];

  for (const entry of dueEntries) {
    const template = pickRandomEventTemplate();
    if (template.category === entry.category || Math.random() > 0.5) {
      worldState.worldEvents = [
        spawnEventFromTemplate(template, worldState.simulatedDay),
        ...worldState.worldEvents,
      ].slice(0, 12);
      eventsTriggered.push(entry.title);
    }
  }

  if (Math.random() > 0.4) {
    const spontaneous = spawnEventFromTemplate(pickRandomEventTemplate(), worldState.simulatedDay);
    worldState.worldEvents = [spontaneous, ...worldState.worldEvents].slice(0, 12);
    eventsTriggered.push(spontaneous.title);
  }

  const incomeMultiplier = estimateIncomeMultiplier(worldState.economyIndex);
  const reputationDelta = Math.min(5, simulatedDays);
  let playerProfile = adjustReputation(bundle.playerProfile, reputationDelta);
  playerProfile = {
    ...playerProfile,
    experience: playerProfile.experience + simulatedDays,
    income: Math.round(playerProfile.income + simulatedDays * 25 * incomeMultiplier),
    updatedAt: now.toISOString(),
  };

  let awards = bundle.awards;
  const awardTemplate = eligibleAward(playerProfile.professionalReputation, playerProfile.experience);
  if (awardTemplate && !awards.some((a) => a.title === awardTemplate.title)) {
    awards = grantAward(awards, awardTemplate, worldState.simulatedDay);
    playerProfile = { ...playerProfile, awards: awards.map((a) => a.title) };
  }

  let careerHistory = bundle.careerHistory;
  if (eventsTriggered.length) {
    careerHistory = appendCareerHistoryEntry(careerHistory, {
      day: worldState.simulatedDay,
      type: 'project',
      title: eventsTriggered[0]!,
      summary: 'World evolved while you were away.',
    });
  }

  worldState.npcRelationshipSummary = npcTrustSummary(bundle.npcs);
  worldState.lastTickAt = now.toISOString();

  const nextSave: CareerWorldSave = {
    ...save,
    worldState,
    clock,
    playerProfile,
    awards,
    careerHistory,
    lastSeenAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  return {
    save: nextSave,
    simulatedDaysAdvanced: simulatedDays,
    eventsTriggered,
    reputationDelta,
  };
}

export function getPromotionProgressForSave(save: CareerWorldSave): number {
  return promotionProgress(save.playerProfile);
}

export function getMentorFeedbackForSave(save: CareerWorldSave): string[] {
  return mentorFeedback(save.npcs);
}
