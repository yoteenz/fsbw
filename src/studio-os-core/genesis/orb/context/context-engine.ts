import { buildHeadquartersCompanyProjection } from '../../executive-headquarters/projections/company-projection';
import { buildHeadquartersMissionProjection } from '../../executive-headquarters/projections/briefing-projection';
import { resolveHeadquartersRoomFromSlug, getHeadquartersRoom } from '../../executive-headquarters/rooms/registry';
import type { OrbContextBundle, OrbRuntimeInput } from '../types';

function now(): string {
  return new Date().toISOString();
}

function resolveRoomFromPath(pathname: string): string {
  if (pathname.includes('/executive-headquarters/')) {
    const slug = pathname.split('/executive-headquarters/')[1]?.split('/')[0];
    const roomId = resolveHeadquartersRoomFromSlug(slug);
    return getHeadquartersRoom(roomId)?.officialName ?? 'Executive Headquarters™';
  }
  if (pathname.includes('/overview')) return 'Executive Atrium™';
  if (pathname.includes('/mission-control')) return 'Mission Control™';
  if (pathname.includes('/genesis')) return 'Genesis Foundation™';
  if (pathname.includes('/creative-direction')) return 'Creative Direction Studio™';
  if (pathname.includes('/knowledge')) return 'Knowledge Wing™';
  return 'Studio OS';
}

/** OrbContextEngine — assembles founder/company/room/mission context with provenance */
export function buildOrbContextBundle(input: OrbRuntimeInput): OrbContextBundle {
  const companyProjection = buildHeadquartersCompanyProjection();
  const missions = buildHeadquartersMissionProjection(companyProjection);
  const roomLabel = input.roomLabel ?? resolveRoomFromPath(input.pathname);

  return {
    bundleId: `orb-context-${now()}`,
    founderDisplayName: input.founderDisplayName ?? companyProjection.founderDisplayName,
    companyDisplayName: input.companyDisplayName ?? companyProjection.companyDisplayName,
    companyIdentityId: input.companyIdentityId ?? companyProjection.companyIdentityId,
    actorIdentityId: input.actorIdentityId ?? companyProjection.actorIdentityId,
    pathname: input.pathname,
    roomLabel,
    departmentLabel: input.departmentLabel ?? null,
    missionLabel: missions.queue[0]?.title ?? null,
    projectLabel: null,
    creativeLabel: input.pathname.includes('creative') ? 'Creative Direction active' : null,
    atmosphereLabel: companyProjection.atmosphereLabel,
    layers: [
      {
        layerId: 'founder',
        label: 'Founder',
        value: input.founderDisplayName ?? companyProjection.founderDisplayName,
        sourceSystem: 'Identity Engine™',
        priority: 1,
      },
      {
        layerId: 'company',
        label: 'Company',
        value: input.companyDisplayName ?? companyProjection.companyDisplayName,
        sourceSystem: 'Identity Engine™ / Company Genome™',
        priority: 1,
      },
      {
        layerId: 'room',
        label: 'Room',
        value: roomLabel,
        sourceSystem: 'Executive Headquarters™',
        priority: 2,
      },
      {
        layerId: 'mission',
        label: 'Active mission',
        value: missions.queue[0]?.title ?? 'None staged',
        sourceSystem: 'Mission Engine™',
        priority: 2,
      },
      {
        layerId: 'department',
        label: 'Department',
        value: input.departmentLabel ?? missions.queue[0]?.departmentLabel ?? 'Executive',
        sourceSystem: 'Department Framework™',
        priority: 3,
      },
    ],
    resolvedAt: now(),
  };
}

export { now as orbEngineNow };
