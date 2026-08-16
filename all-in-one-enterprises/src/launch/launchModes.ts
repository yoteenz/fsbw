/**
 * Sprint 24 — launch mode configuration.
 */

import type { LaunchMode } from './types';

/** Current launch mode — INTERNAL until explicit approval */
export const CURRENT_LAUNCH_MODE: LaunchMode = 'INTERNAL';

export function getLaunchModeLabel(mode: LaunchMode = CURRENT_LAUNCH_MODE): string {
  switch (mode) {
    case 'INTERNAL':
      return 'Phase 0 — Internal Verification';
    case 'PILOT':
      return 'Phase 1 — Controlled Pilot';
    case 'LIMITED_PUBLIC':
      return 'Phase 2 — Limited Public Launch';
    case 'PUBLIC':
      return 'Phase 3 — Full Public Availability';
    default:
      return mode;
  }
}

export function allowsPublicCustomerAcquisition(mode: LaunchMode = CURRENT_LAUNCH_MODE): boolean {
  return mode === 'LIMITED_PUBLIC' || mode === 'PUBLIC';
}

export function allowsPilotCustomers(mode: LaunchMode = CURRENT_LAUNCH_MODE): boolean {
  return mode === 'PILOT' || mode === 'LIMITED_PUBLIC' || mode === 'PUBLIC';
}
