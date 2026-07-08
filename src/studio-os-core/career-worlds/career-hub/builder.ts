import type { CareerWorldSave } from '../core/schemas';
import { CAREER_WORLD_BLUEPRINT_BY_ID } from '../catalog';
import { reputationTier, promotionProgress } from '../reputation/engine';
import { getMentorFeedbackForSave } from '../simulation/tick-engine';
import { mentorFeedback } from '../social-network/ecosystem';

export type CareerHubViewModel = {
  worldName: string;
  profession: string;
  coreQuestion: string;
  currentRole: string;
  currentPhase: string;
  todaysSchedule: CareerHubScheduleItem[];
  upcomingAppointments: CareerHubScheduleItem[];
  promotionProgress: number;
  reputationScore: number;
  reputationTier: string;
  mentorFeedback: string[];
  worldNews: string[];
  communityActivity: string[];
  industryChallenges: string[];
  activeProjects: string[];
  openJobs: string[];
  simulatedTimeLabel: string;
};

export type CareerHubScheduleItem = {
  id: string;
  time: string;
  title: string;
  type: 'appointment' | 'event' | 'challenge';
};

export function buildCareerHubViewModel(save: CareerWorldSave): CareerHubViewModel {
  const blueprint = CAREER_WORLD_BLUEPRINT_BY_ID[save.worldId];
  if (!blueprint) {
    throw new Error(`Unknown career world: ${save.worldId}`);
  }
  const { worldState, playerProfile } = save;

  const simulatedTimeLabel = `Year ${worldState.simulatedYear} · Month ${worldState.simulatedMonth} · Week ${worldState.simulatedWeek} · Day ${worldState.simulatedDay}`;

  const todaysSchedule: CareerHubScheduleItem[] = worldState.activeProjects.slice(0, 3).map((project) => ({
    id: project.id,
    time: 'Today',
    title: project.name,
    type: 'appointment',
  }));

  const upcomingAppointments: CareerHubScheduleItem[] = worldState.worldEvents
    .filter((event) => event.status !== 'resolved')
    .slice(0, 4)
    .map((event) => ({
      id: event.id,
      time: `Day ${event.startsDay}`,
      title: event.title,
      type: 'event',
    }));

  return {
    worldName: blueprint.name,
    profession: blueprint.profession,
    coreQuestion: blueprint.worldQuestion,
    currentRole: playerProfile.careerTitle,
    currentPhase: playerProfile.currentPhase,
    todaysSchedule,
    upcomingAppointments,
    promotionProgress: promotionProgress(playerProfile),
    reputationScore: playerProfile.professionalReputation,
    reputationTier: reputationTier(playerProfile.professionalReputation),
    mentorFeedback: getMentorFeedbackForSave(save).length
      ? getMentorFeedbackForSave(save)
      : mentorFeedback(save.npcs),
    worldNews: [
      worldState.industryTrend,
      ...worldState.activeTrends.slice(0, 2),
      `Economy index ${worldState.economyIndex.toFixed(2)}`,
    ],
    communityActivity: save.careerHistory.slice(0, 3).map((entry) => entry.title),
    industryChallenges: worldState.communityChallenges.map(
      (challenge) => `${challenge.title} (${challenge.progress}/${challenge.target})`
    ),
    activeProjects: worldState.activeProjects.map((project) => `${project.name} — ${project.status}`),
    openJobs: worldState.openJobs.map((job) => `${job.title} @ ${job.company}`),
    simulatedTimeLabel,
  };
}
