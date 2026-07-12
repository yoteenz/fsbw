import type { RoomOperationalSubsystem, SubsystemHealthState } from './contract';
import { SUBSYSTEM_SYSTEM_CLASS } from './contract';
import type { SubsystemHealthRecord } from './room-health';

export const IMMUNE_ROOM_RECOVERY_VERSION = 'immune-room-recovery.v1';

export type LocalizedRecoveryAction =
  | 'regenerate-subsystem'
  | 'load-fallback-asset'
  | 'remove-decor'
  | 'rebake-lighting'
  | 'repair-blueprint-shell'
  | 'manual-review'
  | 'none';

export type LocalizedRecoveryDecision = {
  subsystem: RoomOperationalSubsystem;
  failedState: SubsystemHealthState;
  action: LocalizedRecoveryAction;
  scope: RoomOperationalSubsystem;
  roomRemainsOperational: boolean;
  forbiddenActions: string[];
  reason: string;
};

const FORBIDDEN_CASCADE = [
  'rebuild-room',
  'rebuild-floor',
  'rebuild-building',
  'regenerate-architecture-for-furniture-failure',
  'regenerate-room-for-landmark-failure',
  'regenerate-entire-scene',
];

export function decideLocalizedRecovery(
  subsystem: RoomOperationalSubsystem,
  state: SubsystemHealthState
): LocalizedRecoveryDecision {
  const systemClass = SUBSYSTEM_SYSTEM_CLASS[subsystem];
  let action: LocalizedRecoveryAction = 'none';
  let roomRemainsOperational = true;

  if (state === 'healthy' || state === 'warning') {
    return {
      subsystem,
      failedState: state,
      action: 'none',
      scope: subsystem,
      roomRemainsOperational: true,
      forbiddenActions: FORBIDDEN_CASCADE,
      reason: 'Subsystem healthy or warning only — no recovery required.',
    };
  }

  switch (subsystem) {
    case 'architecture':
      action = 'repair-blueprint-shell';
      roomRemainsOperational = false;
      break;
    case 'hero-assets':
      action = 'regenerate-subsystem';
      break;
    case 'furniture':
      action = 'load-fallback-asset';
      break;
    case 'decor':
      action = 'remove-decor';
      break;
    case 'lighting':
      action = 'rebake-lighting';
      break;
    case 'materials':
      action = 'regenerate-subsystem';
      break;
    case 'effects':
      action = 'rebake-lighting';
      break;
    case 'interaction':
      action = 'manual-review';
      break;
  }

  if (systemClass === 'decoration' && subsystem === 'decor') {
    action = 'remove-decor';
  }

  return {
    subsystem,
    failedState: state,
    action,
    scope: subsystem,
    roomRemainsOperational: subsystem !== 'architecture' && roomRemainsOperational,
    forbiddenActions: FORBIDDEN_CASCADE,
    reason: `Localized recovery for ${subsystem} — ${systemClass} tier; room ${roomRemainsOperational ? 'remains operational' : 'blocked until architecture repaired'}.`,
  };
}

export function planRoomImmuneRecovery(
  subsystems: SubsystemHealthRecord[]
): LocalizedRecoveryDecision[] {
  return subsystems
    .filter((s) => s.state !== 'healthy')
    .map((s) => decideLocalizedRecovery(s.subsystem, s.state));
}

export function assertNoForbiddenCascade(action: string): boolean {
  return !FORBIDDEN_CASCADE.some((f) => action.toLowerCase().includes(f.replace(/-/g, ' ').split(' ')[0] ?? ''));
}
