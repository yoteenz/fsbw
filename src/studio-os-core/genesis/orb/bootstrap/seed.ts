import { buildHeadquartersRoomPath } from '../../executive-headquarters/navigation/routing';
import { buildOrbContextBundle } from '../context/context-engine';
import { seedOrbMemoryEngine } from '../memory/memory-engine';
import { seedOrbConversationTimeline } from '../conversation/timeline';
import { mutateOrbStore, readOrbStore } from '../persistence';
import type { OrbRuntimeInput, OrbSessionState } from '../types';

function now(): string {
  return new Date().toISOString();
}

function createSession(input: OrbRuntimeInput): OrbSessionState {
  const context = buildOrbContextBundle(input);
  const timestamp = now();
  return {
    sessionId: `orb-session-${timestamp}`,
    actorIdentityId: context.actorIdentityId,
    companyIdentityId: context.companyIdentityId,
    presenceState: 'idle',
    activeRole: 'executive-advisor',
    pathname: input.pathname,
    startedAt: timestamp,
    lastInteractionAt: timestamp,
  };
}

export function seedOrbStore(input: OrbRuntimeInput): void {
  const existing = readOrbStore();
  if (existing.seededAt) {
    return;
  }

  const context = buildOrbContextBundle(input);
  const timestamp = now();

  seedOrbMemoryEngine(context.companyIdentityId);
  seedOrbConversationTimeline(input);

  mutateOrbStore(() => ({
    version: existing.version,
    session: createSession(input),
    memoryEntries: readOrbStore().memoryEntries,
    conversationTimeline: readOrbStore().conversationTimeline,
    recommendationOverrides: [],
    seededAt: timestamp,
    bootstrappedAt: timestamp,
    lastOpenedAt: timestamp,
  }));
}

export function ensureOrbStore(input: OrbRuntimeInput) {
  const store = readOrbStore();
  if (!store.seededAt) {
    seedOrbStore(input);
    return readOrbStore();
  }
  if (!store.bootstrappedAt) {
    mutateOrbStore((current) => ({
      ...current,
      bootstrappedAt: now(),
    }));
  }
  return readOrbStore();
}

export function recordOrbOpened(input: OrbRuntimeInput): void {
  mutateOrbStore((store) => ({
    ...store,
    lastOpenedAt: now(),
    session: store.session ?? createSession(input),
  }));
}

export function updateOrbSessionPath(pathname: string): void {
  mutateOrbStore((store) => {
    const session = store.session;
    if (!session) return store;
    return {
      ...store,
      session: {
        ...session,
        pathname,
        lastInteractionAt: now(),
      },
    };
  });
}

export function buildOrbQuickActions(): import('../types').OrbQuickAction[] {
  return [
    {
      actionId: 'open-briefing',
      label: 'Daily Briefing',
      detail: 'Executive clarity for today',
      targetPath: buildHeadquartersRoomPath('daily-briefing'),
    },
    {
      actionId: 'review-missions',
      label: 'Mission Queue',
      detail: 'Operational runway review',
      targetPath: buildHeadquartersRoomPath('mission-control'),
    },
    {
      actionId: 'founder-office',
      label: 'Founder Office',
      detail: 'Strategic deep work',
      targetPath: buildHeadquartersRoomPath('founder-office'),
    },
    {
      actionId: 'command-path',
      label: 'Command Path',
      detail: 'Guarded action routing',
      targetPath: buildHeadquartersRoomPath('command-center'),
    },
    {
      actionId: 'knowledge-wing',
      label: 'Knowledge Wing',
      detail: 'Source-backed references',
      targetPath: buildHeadquartersRoomPath('knowledge-wing'),
    },
    {
      actionId: 'creative-studio',
      label: 'Content Studio',
      detail: 'Creative planning room',
      targetPath: buildHeadquartersRoomPath('content-studio'),
    },
    {
      actionId: 'department-map',
      label: 'Department Map',
      detail: 'Company wing navigation',
      targetPath: buildHeadquartersRoomPath('department-directory'),
    },
  ];
}
