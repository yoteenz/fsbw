/**
 * Sprint 24 — operational health indicators for launch command center.
 */

import type { OperationalHealth } from './types';
import { getOpenP0Blockers, getOpenP1Blockers } from './launchBlockers';
import { evaluateLaunchReadiness } from './launchReadiness';
import { buildHealthSnapshot } from '../infrastructure/health';

export interface OperationalHealthSnapshot {
  overall: OperationalHealth;
  technical: OperationalHealth;
  operational: OperationalHealth;
  financial: OperationalHealth;
  customer: OperationalHealth;
  notes: string[];
}

export function evaluateOperationalHealth(): OperationalHealthSnapshot {
  const p0 = getOpenP0Blockers().length;
  const p1 = getOpenP1Blockers().length;
  const launch = evaluateLaunchReadiness();
  const infra = buildHealthSnapshot();
  const notes: string[] = [];

  let overall: OperationalHealth = 'HEALTHY';
  if (p0 > 0) overall = 'CRITICAL';
  else if (p1 > 2 || launch.status === 'BLOCKED') overall = 'DEGRADED';
  else if (p1 > 0) overall = 'WATCH';

  const technical: OperationalHealth =
    infra.liveness === 'ERROR' || p0 > 0 ? 'CRITICAL' : infra.readiness === 'NOT_READY' ? 'DEGRADED' : 'HEALTHY';

  const operational: OperationalHealth = launch.staff === 'BLOCKED' ? 'DEGRADED' : 'WATCH';

  const financial: OperationalHealth = 'WATCH';
  notes.push('Payment production mode not active — sandbox/demo only');

  const customer: OperationalHealth = launch.support === 'BLOCKED' ? 'DEGRADED' : 'WATCH';

  return { overall, technical, operational, financial, customer, notes };
}
