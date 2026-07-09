import {
  ensureExecutiveHeadquartersStore,
  recordHeadquartersOpened,
  seedExecutiveHeadquartersStore,
  selectExecutiveHeadquartersRoom,
  setFounderFocusActive,
} from './bootstrap/seed';
import {
  EXECUTIVE_HEADQUARTERS_SUBSYSTEM_NAME,
  EXECUTIVE_HEADQUARTERS_SUBSYSTEM_VERSION,
  HQ_DEFAULT_ROOM_ID,
  type HqRoomId,
} from './constants';
import {
  buildHeadquartersRoomPath,
  listHeadquartersNavigationRooms,
  resolveHeadquartersNavigationTarget,
  HEADQUARTERS_SPATIAL_NAV_PHILOSOPHY,
} from './navigation/routing';
import {
  buildHeadquartersCompanyProjection,
  buildHeadquartersRoomProjection,
} from './projections/company-projection';
import {
  buildHeadquartersBriefingProjection,
  buildHeadquartersHealthProjection,
  buildHeadquartersMissionProjection,
  buildHeadquartersOrbDockState,
  buildHeadquartersRecommendedAction,
} from './projections/briefing-projection';
import { readExecutiveHeadquartersStore, mutateExecutiveHeadquartersStore } from './persistence';
import {
  getHeadquartersRoom,
  listHeadquartersRooms,
  listLaunchStackRooms,
  listLockedHeadquartersRooms,
  resolveHeadquartersRoomFromSlug,
} from './rooms/registry';
import type {
  ExecutiveHeadquartersReadyView,
  ExecutiveHeadquartersStats,
  HeadquartersArrivalSession,
} from './types';

export function ensureExecutiveHeadquartersSubsystem() {
  return ensureExecutiveHeadquartersStore();
}

export function getExecutiveHeadquartersPlatformStats(): ExecutiveHeadquartersStats {
  const store = readExecutiveHeadquartersStore();
  const activeRoomId = store.arrivalSession?.activeRoomId ?? HQ_DEFAULT_ROOM_ID;
  const rooms = listHeadquartersRooms();
  return {
    roomCount: rooms.length,
    launchStackRoomCount: listLaunchStackRooms().length,
    lockedRoomCount: listLockedHeadquartersRooms().length,
    priorityCount: store.priorities.length,
    missionCount: buildHeadquartersMissionProjection(buildHeadquartersCompanyProjection()).queue.length,
    advisoryCount: store.advisories.length,
    activeRoomId,
  };
}

export function getExecutiveHeadquartersReadyView(
  roomOverride?: HqRoomId
): ExecutiveHeadquartersReadyView {
  ensureExecutiveHeadquartersSubsystem();

  const store = readExecutiveHeadquartersStore();
  const company = buildHeadquartersCompanyProjection();
  const activeRoomId =
    roomOverride ?? store.arrivalSession?.activeRoomId ?? HQ_DEFAULT_ROOM_ID;

  const briefing = buildHeadquartersBriefingProjection(company);
  const health = buildHeadquartersHealthProjection(company);
  const missions = buildHeadquartersMissionProjection(company);
  const rooms = buildHeadquartersRoomProjection(activeRoomId);
  const recommendedAction =
    store.recommendedAction ?? buildHeadquartersRecommendedAction(company);
  const orb = buildHeadquartersOrbDockState(
    briefing,
    store.arrivalSession?.orbMode ?? 'greeting'
  );

  const arrivalSession: HeadquartersArrivalSession = store.arrivalSession ?? {
    sessionId: `hq-session-fallback`,
    actorIdentityId: company.actorIdentityId,
    companyIdentityId: company.companyIdentityId,
    organizationIdentityId: null,
    activeRoomId,
    arrivedAt: new Date().toISOString(),
    lastRoomChangeAt: new Date().toISOString(),
    orbMode: 'greeting',
    founderFocusActive: false,
  };

  return {
    company,
    briefing,
    health,
    missions,
    rooms,
    priorities: store.priorities,
    recommendedAction,
    advisories: store.advisories,
    orb,
    arrivalSession: { ...arrivalSession, activeRoomId },
  };
}

export function openExecutiveHeadquartersRoom(roomId: HqRoomId): ExecutiveHeadquartersReadyView {
  const room = getHeadquartersRoom(roomId);
  if (room && !room.locked) {
    selectExecutiveHeadquartersRoom(roomId);
  }
  return getExecutiveHeadquartersReadyView(roomId);
}

export {
  EXECUTIVE_HEADQUARTERS_SUBSYSTEM_NAME,
  EXECUTIVE_HEADQUARTERS_SUBSYSTEM_VERSION,
  HQ_DEFAULT_ROOM_ID,
  HEADQUARTERS_SPATIAL_NAV_PHILOSOPHY,
  readExecutiveHeadquartersStore,
  mutateExecutiveHeadquartersStore,
  seedExecutiveHeadquartersStore,
  ensureExecutiveHeadquartersStore,
  recordHeadquartersOpened,
  selectExecutiveHeadquartersRoom,
  setFounderFocusActive,
  listHeadquartersRooms,
  listLaunchStackRooms,
  listLockedHeadquartersRooms,
  getHeadquartersRoom,
  resolveHeadquartersRoomFromSlug,
  buildHeadquartersRoomPath,
  listHeadquartersNavigationRooms,
  resolveHeadquartersNavigationTarget,
  buildHeadquartersCompanyProjection,
  buildHeadquartersBriefingProjection,
  buildHeadquartersHealthProjection,
  buildHeadquartersMissionProjection,
  buildHeadquartersOrbDockState,
  buildHeadquartersRecommendedAction,
  buildHeadquartersRoomProjection,
};

export type {
  ExecutiveHeadquartersReadyView,
  ExecutiveHeadquartersStats,
  ExecutiveHeadquartersStore,
  HeadquartersRoomRecord,
  HeadquartersArrivalSession,
  HeadquartersPriorityCard,
  HeadquartersRecommendedAction,
  HeadquartersMissionItem,
  HeadquartersAdvisory,
  HeadquartersPulseMetric,
  HeadquartersBriefingProjection,
  HeadquartersHealthProjection,
  HeadquartersMissionProjection,
  HeadquartersCompanyProjection,
  HeadquartersRoomProjection,
  HeadquartersOrbDockState,
  HeadquartersDepartmentEntry,
} from './types';

export type { HqRoomId, HqOrbMode, HqRoomMaturityLevel } from './constants';
