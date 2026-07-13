import type { ConstructionModeStatus } from './contract';

export const WORLD_COMPLETION_VERSION = 'world-completion.v1';

export type WorldCompletionTransition = {
  transitionVersion: typeof WORLD_COMPLETION_VERSION;
  fromMode: 'construction-mode';
  toMode: 'living-world';
  planId: string;
  roomDisplayName: string;
  scaffoldingFade: true;
  fullyInteractive: true;
  completedAt: string;
  success: boolean;
};

export function buildWorldCompletionTransition(input: {
  planId: string;
  roomDisplayName: string;
  success: boolean;
}): WorldCompletionTransition {
  return {
    transitionVersion: WORLD_COMPLETION_VERSION,
    fromMode: 'construction-mode',
    toMode: 'living-world',
    planId: input.planId,
    roomDisplayName: input.roomDisplayName,
    scaffoldingFade: true,
    fullyInteractive: true,
    completedAt: new Date().toISOString(),
    success: input.success,
  };
}

export function resolveConstructionModeStatus(input: {
  approved: boolean;
  manufacturing: boolean;
  installing: boolean;
  complete: boolean;
}): ConstructionModeStatus {
  if (input.complete) return 'living-world';
  if (input.installing) return 'installing';
  if (input.manufacturing) return 'manufacturing';
  if (!input.approved) return 'awaiting-approval';
  return 'previewing';
}
