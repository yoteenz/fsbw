import { buildHeadquartersCompanyProjection } from '../../executive-headquarters/projections/company-projection';
import { buildHeadquartersMissionProjection } from '../../executive-headquarters/projections/briefing-projection';
import { buildHeadquartersRoomPath } from '../../executive-headquarters/navigation/routing';
import type { OrbMissionAdvice } from '../types';

/** Mission Advisor — operational runway guidance from Mission Engine™ projection */
export function buildOrbMissionAdvice(): OrbMissionAdvice[] {
  const company = buildHeadquartersCompanyProjection();
  const missions = buildHeadquartersMissionProjection(company);

  return missions.queue.map((mission) => ({
    adviceId: `advice-${mission.missionId}`,
    missionTitle: mission.title,
    status: mission.status,
    departmentLabel: mission.departmentLabel,
    advisorNote:
      mission.status === 'blocked'
        ? 'This mission needs upstream dependency resolution before founder attention.'
        : mission.status === 'awaiting-approval'
          ? 'Founder approval will unlock the next operational sequence.'
          : 'Progressing steadily — confirm priority if tradeoffs emerge.',
    blockerNote: mission.blockerNote,
    targetPath: buildHeadquartersRoomPath(mission.targetRoomId),
    posture: mission.status === 'blocked' ? 'operations-advisor' : 'mission-coordinator',
  }));
}
