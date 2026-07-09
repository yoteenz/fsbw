import { buildHeadquartersCompanyProjection } from '../../executive-headquarters/projections/company-projection';
import {
  buildHeadquartersBriefingProjection,
  buildHeadquartersRecommendedAction,
} from '../../executive-headquarters/projections/briefing-projection';
import { buildHeadquartersRoomPath } from '../../executive-headquarters/navigation/routing';
import type { HqRoomId } from '../../executive-headquarters/constants';
import type { OrbExecutiveBriefing, OrbRuntimeInput } from '../types';
import { buildOrbContextBundle, orbEngineNow } from '../context/context-engine';

/** Executive Briefing Engine — calm founder clarity at session start */
export function buildOrbExecutiveBriefing(_input: OrbRuntimeInput): OrbExecutiveBriefing {
  const company = buildHeadquartersCompanyProjection();
  const hqBriefing = buildHeadquartersBriefingProjection(company);
  const recommended = buildHeadquartersRecommendedAction(company);

  return {
    briefingId: `orb-briefing-${company.companyIdentityId}`,
    greeting: hqBriefing.greeting,
    paragraph: hqBriefing.briefingParagraph,
    whatChanged: hqBriefing.whatChanged,
    requiresAttention: hqBriefing.requiresAttention,
    canWait: hqBriefing.canWait,
    recommendedAction: recommended.action,
    sourceSystems: ['Ambient Awareness™', 'Executive Headquarters™', 'Mission Engine™'],
    generatedAt: orbEngineNow(),
  };
}

export function buildOrbArrivalGreeting(input: OrbRuntimeInput): string {
  const briefing = buildOrbExecutiveBriefing(input);
  return `${briefing.greeting} You are in ${buildOrbContextBundle(input).roomLabel}. ${briefing.recommendedAction}`;
}

export function buildHeadquartersPathForRoom(roomId: HqRoomId): string {
  return buildHeadquartersRoomPath(roomId);
}
