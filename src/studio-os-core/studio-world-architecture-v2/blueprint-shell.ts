import type { SubsystemHealthState } from './contract';

export const BLUEPRINT_SHELL_VERSION = 'blueprint-shell.v1';

/** Architecture only — no furniture, landmark, decor, people */
export type BlueprintShellContent = {
  walls: boolean;
  ceiling: boolean;
  floor: boolean;
  windows: boolean;
  glass: boolean;
  stairs: boolean;
  elevatorOpenings: boolean;
  circulation: boolean;
  lightingCavities: boolean;
  structuralOpenings: boolean;
  architecturalFraming: boolean;
};

export type BlueprintShellRecord = {
  shellId: string;
  organizationId: string;
  buildingId: string;
  floorId: string;
  roomId: string;
  version: number;
  immutable: boolean;
  lockedAt: string | null;
  sourceUrl: string | null;
  promptVersion: string;
  providerModel: string;
  content: BlueprintShellContent;
  health: SubsystemHealthState;
  repairHistory: string[];
  createdAt: string;
  updatedAt: string;
};

export type BlueprintShellValidationInput = {
  shell: BlueprintShellRecord;
  roomProportionsValid?: boolean;
  wallContinuity?: boolean;
  floorContinuity?: boolean;
  ceilingContinuity?: boolean;
  cameraContinuity?: boolean;
  walkabilityValid?: boolean;
  collisionZonesClear?: boolean;
};

export type BlueprintShellValidationResult = {
  passed: boolean;
  health: SubsystemHealthState;
  issues: string[];
  repairScope: 'blueprint-shell-only';
};

export function validateBlueprintShell(
  input: BlueprintShellValidationInput
): BlueprintShellValidationResult {
  const issues: string[] = [];
  const c = input.shell.content;

  if (!c.walls) issues.push('Missing walls in BlueprintShell.');
  if (!c.floor) issues.push('Missing floor in BlueprintShell.');
  if (!c.ceiling) issues.push('Missing ceiling in BlueprintShell.');
  if (input.roomProportionsValid === false) issues.push('Room proportions invalid.');
  if (input.wallContinuity === false) issues.push('Wall continuity broken.');
  if (input.floorContinuity === false) issues.push('Floor continuity broken.');
  if (input.ceilingContinuity === false) issues.push('Ceiling continuity broken.');
  if (input.cameraContinuity === false) issues.push('Camera continuity broken.');
  if (input.walkabilityValid === false) issues.push('Walkability zones invalid.');
  if (input.collisionZonesClear === false) issues.push('Collision zones obstructed.');

  const passed = issues.length === 0;
  return {
    passed,
    health: passed ? 'healthy' : 'critical',
    issues,
    repairScope: 'blueprint-shell-only',
  };
}

export function assertBlueprintShellImmutable(shell: BlueprintShellRecord): boolean {
  return shell.immutable && shell.lockedAt !== null;
}
