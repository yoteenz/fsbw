import { readIdentityEngineStore } from '../../identity-engine/persistence';
import type {
  HeadquartersCompanyProjection,
  HeadquartersDepartmentEntry,
  HeadquartersRoomProjection,
} from '../types';
import { listHeadquartersRooms } from '../rooms/registry';
import type { HqRoomId } from '../constants';

function now(): string {
  return new Date().toISOString();
}

/** HeadquartersCompanyProjection — Identity Engine™ + Company Genome™ adapter */
export function buildHeadquartersCompanyProjection(): HeadquartersCompanyProjection {
  const identity = readIdentityEngineStore();
  const founder = identity.identities.find(
    (i) => i.identityType === 'founder' || i.metadata?.platformRole === 'steward'
  );
  const company = identity.identities.find((i) => i.identityType === 'company');
  const org = identity.identities.find((i) => i.identityType === 'organization');

  const actorIdentityId = founder?.identityId ?? 'actor-generic';
  const companyIdentityId = company?.identityId ?? 'company-generic';

  return {
    projectionId: `hq-company-${companyIdentityId}`,
    owningSystem: 'Identity Engine™',
    replacementPlan: 'Replace with Company Genome™ tone and structure when genome runtime ships.',
    companyDisplayName: company?.displayName ?? 'Your Company',
    companyOfficialName: company?.officialName ?? 'Your Company',
    founderDisplayName: founder?.displayName ?? 'Founder',
    organizationDisplayName: org?.displayName ?? 'Organization',
    atmosphereLabel: 'Calm executive focus',
    currentFocus: 'Launch Stack readiness and founder clarity',
    companyIdentityId,
    actorIdentityId,
  };
}

export function buildHeadquartersRoomProjection(
  activeRoomId: HqRoomId
): HeadquartersRoomProjection {
  const rooms = listHeadquartersRooms();
  const departmentDirectory: HeadquartersDepartmentEntry[] = rooms
    .filter((r) => r.departmentId)
    .map((r) => ({
      departmentId: r.departmentId!,
      title: r.officialName,
      purpose: r.purpose,
      roomId: r.roomId,
      maturityLevel: r.maturityLevel,
      locked: r.locked,
      headcountLabel: r.locked ? undefined : 'Active wing',
    }));

  return {
    projectionId: `hq-rooms-${activeRoomId}`,
    owningSystem: 'Executive Headquarters™',
    replacementPlan: 'Atlas™ will own structural overlays; HQ retains room composition.',
    rooms,
    activeRoomId,
    departmentDirectory,
  };
}

export { now as headquartersProjectionNow };
