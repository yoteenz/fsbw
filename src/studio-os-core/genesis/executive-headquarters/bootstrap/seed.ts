import { HQ_DEFAULT_ROOM_ID } from '../constants';
import type {
  HeadquartersAdvisory,
  HeadquartersArrivalSession,
  HeadquartersPriorityCard,
} from '../types';
import { mutateExecutiveHeadquartersStore, readExecutiveHeadquartersStore } from '../persistence';
import { HEADQUARTERS_ROOM_REGISTRY } from '../rooms/registry';
import { buildHeadquartersCompanyProjection } from '../projections/company-projection';
import {
  buildHeadquartersRecommendedAction,
} from '../projections/briefing-projection';

function now(): string {
  return new Date().toISOString();
}

function buildGenericPriorities(): HeadquartersPriorityCard[] {
  const timestamp = now();
  return [
    {
      priorityId: 'priority-critical-decision',
      kind: 'critical-decision',
      title: 'Confirm Launch Stack priority',
      detail: 'Decide whether to prioritize platform readiness or department wing expansion this week.',
      confidence: 0.88,
      sourceSystems: ['Decision Engine™', 'Mission Engine™'],
      targetRoomId: 'founder-office',
      createdAt: timestamp,
    },
    {
      priorityId: 'priority-active-mission',
      kind: 'active-mission',
      title: 'Mission queue review',
      detail: 'One mission is blocked on Knowledge Core™; one awaits founder approval.',
      confidence: 0.91,
      sourceSystems: ['Mission Engine™'],
      targetRoomId: 'mission-control',
      createdAt: timestamp,
    },
    {
      priorityId: 'priority-opportunity',
      kind: 'opportunity-risk',
      title: 'Department Directory expansion',
      detail: 'Marketing and Operations wings are projection-ready — preview before full operational unlock.',
      confidence: 0.79,
      sourceSystems: ['Department Framework™', 'Atlas™'],
      targetRoomId: 'department-directory',
      createdAt: timestamp,
    },
  ];
}

function buildGenericAdvisories(): HeadquartersAdvisory[] {
  return [
    {
      advisoryId: 'adv-knowledge-blocker',
      kind: 'dependency',
      title: 'Knowledge Wing blocked',
      detail: 'Knowledge Core™ connector required before source-backed references go live.',
      severity: 'medium',
      sourceSystems: ['Knowledge Core™'],
      targetRoomId: 'knowledge-wing',
    },
    {
      advisoryId: 'adv-automation-locked',
      kind: 'readiness',
      title: 'Automation Lab remains locked',
      detail: 'Command Center™, Permissions Engine™, and Workflow Engine™ must mature first.',
      severity: 'low',
      sourceSystems: ['Automation Engine™', 'Command Center™'],
      targetRoomId: 'automation-lab',
    },
    {
      advisoryId: 'adv-pulse-stable',
      kind: 'opportunity',
      title: 'Company pulse trending up',
      detail: 'Operations and customer experience metrics improved since last session.',
      severity: 'low',
      sourceSystems: ['Company Health Index™', 'Analytics™'],
      targetRoomId: 'executive-atrium',
    },
  ];
}

function createArrivalSession(): HeadquartersArrivalSession {
  const company = buildHeadquartersCompanyProjection();
  const timestamp = now();
  return {
    sessionId: `hq-session-${timestamp}`,
    actorIdentityId: company.actorIdentityId,
    companyIdentityId: company.companyIdentityId,
    organizationIdentityId: null,
    activeRoomId: HQ_DEFAULT_ROOM_ID,
    arrivedAt: timestamp,
    lastRoomChangeAt: timestamp,
    orbMode: 'greeting',
    founderFocusActive: false,
  };
}

/**
 * Bootstrap generic Headquarters fixtures — no brand-specific hardcoding.
 */
export function seedExecutiveHeadquartersStore(): void {
  const existing = readExecutiveHeadquartersStore();
  if (existing.seededAt && existing.rooms.length > 0) {
    return;
  }

  const timestamp = now();
  const company = buildHeadquartersCompanyProjection();
  const recommendedAction = buildHeadquartersRecommendedAction(company);

  mutateExecutiveHeadquartersStore(() => ({
    version: existing.version,
    rooms: [...HEADQUARTERS_ROOM_REGISTRY],
    arrivalSession: createArrivalSession(),
    priorities: buildGenericPriorities(),
    recommendedAction,
    advisories: buildGenericAdvisories(),
    seededAt: timestamp,
    bootstrappedAt: timestamp,
    lastOpenedAt: timestamp,
  }));
}

export function ensureExecutiveHeadquartersStore() {
  const store = readExecutiveHeadquartersStore();
  if (!store.seededAt || store.rooms.length === 0) {
    seedExecutiveHeadquartersStore();
    return readExecutiveHeadquartersStore();
  }
  if (!store.bootstrappedAt) {
    mutateExecutiveHeadquartersStore((current) => ({
      ...current,
      bootstrappedAt: now(),
    }));
  }
  return readExecutiveHeadquartersStore();
}

export function recordHeadquartersOpened(): void {
  mutateExecutiveHeadquartersStore((store) => ({
    ...store,
    lastOpenedAt: now(),
    arrivalSession: store.arrivalSession ?? createArrivalSession(),
  }));
}

export function selectExecutiveHeadquartersRoom(roomId: HeadquartersArrivalSession['activeRoomId']): void {
  mutateExecutiveHeadquartersStore((store) => {
    const session = store.arrivalSession ?? createArrivalSession();
    return {
      ...store,
      arrivalSession: {
        ...session,
        activeRoomId: roomId,
        lastRoomChangeAt: now(),
        orbMode: roomId === 'founder-office' ? 'focus' : roomId === 'command-center' ? 'command' : 'room-guide',
        founderFocusActive: roomId === 'founder-office',
      },
    };
  });
}

export function setFounderFocusActive(active: boolean): void {
  mutateExecutiveHeadquartersStore((store) => {
    const session = store.arrivalSession ?? createArrivalSession();
    return {
      ...store,
      arrivalSession: {
        ...session,
        founderFocusActive: active,
        orbMode: active ? 'focus' : session.orbMode,
        activeRoomId: active ? 'founder-office' : session.activeRoomId,
        lastRoomChangeAt: now(),
      },
    };
  });
}
