import type { XniNarrativeBlueprint } from '../types';
import type { XniBlueprintStatus } from '../constants';

export function evaluateProductionGate(blueprint: Pick<XniNarrativeBlueprint, 'status' | 'blueprintId' | 'topic'>): {
  allowed: boolean;
  reason: string;
} {
  if (blueprint.status === 'approved') {
    return {
      allowed: true,
      reason: `Narrative Blueprint™ ${blueprint.blueprintId} approved — downstream production may proceed.`,
    };
  }
  if (blueprint.status === 'pending-approval') {
    return {
      allowed: false,
      reason: `Blueprint "${blueprint.topic}" awaits founder approval — no assets may be created.`,
    };
  }
  if (blueprint.status === 'rejected') {
    return {
      allowed: false,
      reason: `Blueprint "${blueprint.topic}" was rejected — revise narrative before production.`,
    };
  }
  return {
    allowed: false,
    reason: `Blueprint "${blueprint.topic}" is draft — submit for approval before any asset production.`,
  };
}

export function canProduceAssets(status: XniBlueprintStatus): boolean {
  return status === 'approved';
}
