import { TIME_MACHINE_STORAGE_KEY, TIME_MACHINE_VERSION, STUDIO_OS_TIME_MACHINE_UPDATED } from './constants';
import { readFirstEnsure } from '../sync/profile-cache';
import { buildOrganizationTimeMachineProfile } from './engine-profile-builder';
import { filterReplayEvents } from './playback-engine';
import type {
  OrganizationTimeMachineProfile,
  PlaybackState,
  TimeMachineStore,
} from './types';

function emptyStore(): TimeMachineStore {
  return { version: TIME_MACHINE_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_TIME_MACHINE_UPDATED));
  }
}

export function readTimeMachineStore(): TimeMachineStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(TIME_MACHINE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as TimeMachineStore;
    return { ...emptyStore(), ...parsed, version: TIME_MACHINE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeTimeMachineStore(store: TimeMachineStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(TIME_MACHINE_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationTimeMachineProfile(organizationId: string): OrganizationTimeMachineProfile | null {
  return readTimeMachineStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationTimeMachineProfile): OrganizationTimeMachineProfile {
  const store = readTimeMachineStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeTimeMachineStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function syncTimeMachineFromSources(organizationId: string): OrganizationTimeMachineProfile {
  const existing = getOrganizationTimeMachineProfile(organizationId);
  const built = buildOrganizationTimeMachineProfile(organizationId);
  const profile = upsertProfile({
    ...built,
    playbackState: existing?.playbackState ?? 'idle',
    currentReplayId: existing?.currentReplayId ?? built.currentReplayId,
    currentStepIndex: existing?.currentStepIndex ?? 0,
    activeFilter: existing?.activeFilter ?? built.activeFilter,
  });
  return profile;
}

export function ensureOrganizationTimeMachineProfile(organizationId: string): OrganizationTimeMachineProfile {
  return readFirstEnsure(organizationId, getOrganizationTimeMachineProfile, syncTimeMachineFromSources);
}

function withPlayback(
  organizationId: string,
  update: (p: OrganizationTimeMachineProfile) => OrganizationTimeMachineProfile
): OrganizationTimeMachineProfile {
  const profile = ensureOrganizationTimeMachineProfile(organizationId);
  return upsertProfile(update({ ...profile, updatedAt: new Date().toISOString() }));
}

export function selectReplayEvent(organizationId: string, replayId: string): OrganizationTimeMachineProfile {
  return withPlayback(organizationId, (p) => ({
    ...p,
    currentReplayId: replayId,
    currentStepIndex: 0,
    playbackState: 'paused',
  }));
}

export function setPlaybackState(organizationId: string, state: PlaybackState): OrganizationTimeMachineProfile {
  return withPlayback(organizationId, (p) => ({ ...p, playbackState: state }));
}

export function stepForward(organizationId: string): OrganizationTimeMachineProfile {
  return withPlayback(organizationId, (p) => {
    const event = p.replayEvents.find((e) => e.id === p.currentReplayId);
    if (!event) return p;
    return {
      ...p,
      currentStepIndex: Math.min(p.currentStepIndex + 1, event.steps.length - 1),
      playbackState: 'stepping',
    };
  });
}

export function stepBackward(organizationId: string): OrganizationTimeMachineProfile {
  return withPlayback(organizationId, (p) => ({
    ...p,
    currentStepIndex: Math.max(0, p.currentStepIndex - 1),
    playbackState: 'stepping',
  }));
}

export function jumpToStep(organizationId: string, stepIndex: number): OrganizationTimeMachineProfile {
  return withPlayback(organizationId, (p) => {
    const event = p.replayEvents.find((e) => e.id === p.currentReplayId);
    if (!event) return p;
    return {
      ...p,
      currentStepIndex: Math.max(0, Math.min(stepIndex, event.steps.length - 1)),
      playbackState: 'paused',
    };
  });
}

export function setTimelineFilter(
  organizationId: string,
  filter: Partial<OrganizationTimeMachineProfile['activeFilter']>
): OrganizationTimeMachineProfile {
  return withPlayback(organizationId, (p) => ({
    ...p,
    activeFilter: { ...p.activeFilter, ...filter },
  }));
}

export function compareMoments(organizationId: string, replayIdA: string, replayIdB: string): OrganizationTimeMachineProfile {
  return withPlayback(organizationId, (p) => {
    const a = p.replayEvents.find((e) => e.id === replayIdA);
    const b = p.replayEvents.find((e) => e.id === replayIdB);
    if (!a || !b) return p;
    return {
      ...p,
      momentComparison: {
        momentA: { label: a.title, timestamp: a.occurredAt, summary: a.commentary.whatHappened },
        momentB: { label: b.title, timestamp: b.occurredAt, summary: b.commentary.whatHappened },
        differences: [
          `${a.eventLabel} vs ${b.eventLabel}`,
          `Duration ${a.durationMinutes}m vs ${b.durationMinutes}m`,
          a.commentary.whyItHappened.slice(0, 80),
        ],
      },
    };
  });
}

export function getFilteredEvents(profile: OrganizationTimeMachineProfile) {
  return filterReplayEvents(profile.replayEvents, profile.activeFilter);
}

export function getCurrentReplayEvent(profile: OrganizationTimeMachineProfile) {
  return profile.replayEvents.find((e) => e.id === profile.currentReplayId) ?? profile.replayEvents[0] ?? null;
}

export { filterReplayEvents };
