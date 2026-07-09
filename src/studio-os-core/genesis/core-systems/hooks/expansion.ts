import { mutateCoreSystemsStore, readCoreSystemsStore } from '../persistence';
import type { ExpansionHookRecord } from '../types';
import type { ExpansionHookType } from '../constants';

function now(): string {
  return new Date().toISOString();
}

export function createHookId(systemId: string, hookName: string): string {
  const name = hookName.toUpperCase().replace(/[^A-Z0-9]+/g, '-');
  return `HK-${systemId}-${name}-${Date.now().toString(36)}`;
}

export type RegisterExpansionHookInput = {
  systemId: string;
  hookName: string;
  hookType: ExpansionHookType | string;
  description?: string;
  expansionPointId?: string;
};

/** Expansion Hooks™ */
export function registerExpansionHook(input: RegisterExpansionHookInput): ExpansionHookRecord {
  const record: ExpansionHookRecord = {
    hookId: createHookId(input.systemId, input.hookName),
    systemId: input.systemId.trim(),
    hookName: input.hookName.trim(),
    hookType: input.hookType,
    description: input.description,
    expansionPointId: input.expansionPointId,
    createdAt: now(),
  };

  mutateCoreSystemsStore((store) => ({
    ...store,
    expansionHooks: [...store.expansionHooks, record],
  }));

  return record;
}

export function listExpansionHooks(): ExpansionHookRecord[] {
  return readCoreSystemsStore().expansionHooks;
}

export function listExpansionHooksForSystem(systemId: string): ExpansionHookRecord[] {
  return listExpansionHooks().filter((h) => h.systemId === systemId);
}

export function listExpansionHooksByType(
  hookType: ExpansionHookType | string
): ExpansionHookRecord[] {
  return listExpansionHooks().filter((h) => h.hookType === hookType);
}

export function resolveExpansionHooks(
  systemId: string,
  hookType?: ExpansionHookType | string
): ExpansionHookRecord[] {
  return listExpansionHooksForSystem(systemId).filter(
    (h) => !hookType || h.hookType === hookType
  );
}
