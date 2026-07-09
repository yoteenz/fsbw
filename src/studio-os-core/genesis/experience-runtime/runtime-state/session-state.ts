import { readExperienceRuntimeStore, mutateExperienceRuntimeStore } from '../persistence';
import type { XerStateDna, XerStateSlot } from '../types';

export function getStateDnaForScene(sceneId: string): XerStateDna | undefined {
  const store = readExperienceRuntimeStore();
  return store.stateDnaProfiles.find((p) => p.sceneId === sceneId);
}

export function hydrateSessionState(sceneId: string): Record<string, string> {
  const store = readExperienceRuntimeStore();
  const stateDna = getStateDnaForScene(sceneId);
  if (!stateDna) return { ...store.sessionState };

  const hydrated: Record<string, string> = {};
  for (const slot of stateDna.slots) {
    hydrated[slot.slotId] = store.sessionState[slot.slotId] ?? slot.defaultValue;
  }
  return hydrated;
}

export function updateSessionStateSlot(slotId: string, value: string): Record<string, string> {
  return mutateExperienceRuntimeStore((store) => ({
    ...store,
    sessionState: { ...store.sessionState, [slotId]: value },
  })).sessionState;
}

export function preserveStateOnBrandSwitch(
  sceneId: string,
  previous: Record<string, string>
): Record<string, string> {
  const stateDna = getStateDnaForScene(sceneId);
  if (!stateDna) return previous;

  const next: Record<string, string> = { ...previous };
  for (const slotId of stateDna.liveSwitchPolicy.preserveSlots) {
    if (previous[slotId] !== undefined) next[slotId] = previous[slotId];
  }
  for (const slotId of stateDna.liveSwitchPolicy.resetSlots) {
    const slot = stateDna.slots.find((s) => s.slotId === slotId);
    if (slot) next[slotId] = slot.defaultValue;
  }
  return next;
}

export function listStateSlots(sceneId: string): XerStateSlot[] {
  return getStateDnaForScene(sceneId)?.slots ?? [];
}

export function incrementBrandSwitchCount(): number {
  return mutateExperienceRuntimeStore((store) => ({
    ...store,
    brandSwitchCount: store.brandSwitchCount + 1,
  })).brandSwitchCount;
}

export function ensureRuntimeSessionId(): string {
  const store = readExperienceRuntimeStore();
  if (store.sessionId) return store.sessionId;
  const sessionId = `xer-${Date.now().toString(36)}`;
  mutateExperienceRuntimeStore((s) => ({ ...s, sessionId }));
  return sessionId;
}
