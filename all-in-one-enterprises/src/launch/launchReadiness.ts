/**
 * Sprint 24 — canonical launch readiness evaluation.
 */

import { isStandaloneExtractionComplete } from '../qa/extractionGate';
import { canPrepareProduction } from '../infrastructure/productionGates';
import { runFsIsolationSelfCheck } from '../security/fsIsolation';
import { isSupabaseConfigured } from '../config/env';
import { getLaunchBlockers, getOpenP0Blockers, getOpenP1Blockers } from './launchBlockers';
import { CURRENT_LAUNCH_MODE } from './launchModes';
import { getPilotServices, SERVICE_LAUNCH_MATRIX } from './serviceActivationLaunch';
import { getTrainingCompletionSummary } from './staffTraining';
import type {
  FinalLaunchRecommendation,
  LaunchReadinessResult,
  LaunchReadinessStatus,
  OverallLaunchState,
} from './types';

function aggregateStatus(...statuses: LaunchReadinessStatus[]): LaunchReadinessStatus {
  if (statuses.some((s) => s === 'BLOCKED')) return 'BLOCKED';
  if (statuses.every((s) => s === 'READY')) return 'READY';
  return 'PARTIAL';
}

export function canEnterLaunchPreparation(): { allowed: boolean; blockers: string[] } {
  const blockers: string[] = [];
  const extraction = isStandaloneExtractionComplete();
  if (!extraction.complete) blockers.push('Standalone extraction incomplete');

  const fs = runFsIsolationSelfCheck();
  if (!fs.ok) blockers.push('Frontal Slayer isolation failed');

  if (!isSupabaseConfigured()) {
    blockers.push('Production database not configured — launch preparation may continue but PUBLIC LAUNCH BLOCKED');
  }

  const prepare = canPrepareProduction();
  if (prepare.status === 'BLOCKED') {
    blockers.push(...prepare.blockers.slice(0, 5));
  }

  return { allowed: blockers.length === 0 || blockers.every((b) => b.includes('PUBLIC LAUNCH BLOCKED')), blockers };
}

export function evaluateLaunchReadiness(): LaunchReadinessResult {
  const blockers = getLaunchBlockers();
  const p0 = getOpenP0Blockers();
  const p1 = getOpenP1Blockers();
  const warnings: string[] = [];
  const training = getTrainingCompletionSummary();

  const technical: LaunchReadinessStatus =
    p0.some((b) => b.category === 'TECHNICAL' || b.category === 'SECURITY') ? 'BLOCKED' : isSupabaseConfigured() ? 'PARTIAL' : 'BLOCKED';

  const business: LaunchReadinessStatus =
    p0.some((b) => b.category === 'BUSINESS' || b.category === 'LEGAL') || p1.length > 3 ? 'BLOCKED' : 'PARTIAL';

  const staff: LaunchReadinessStatus = training.percentComplete >= 80 ? 'PARTIAL' : 'BLOCKED';

  const security: LaunchReadinessStatus = runFsIsolationSelfCheck().ok ? 'PARTIAL' : 'BLOCKED';

  const support: LaunchReadinessStatus = p1.some((b) => b.category === 'SUPPORT') ? 'PARTIAL' : 'BLOCKED';

  const status = aggregateStatus(technical, business, staff, security, support);

  let overallState: OverallLaunchState = 'NOT_READY';
  if (status === 'PARTIAL') overallState = 'PREPARING';
  if (CURRENT_LAUNCH_MODE === 'PILOT') overallState = 'PILOT_ACTIVE';
  if (p0.length === 0 && status !== 'BLOCKED') overallState = 'PILOT_READY';

  let recommendation: FinalLaunchRecommendation = 'BLOCKED';
  if (p0.length === 0 && getPilotServices().length > 0) recommendation = 'PILOT_READY';
  if (p0.length > 0) recommendation = 'BLOCKED';
  if (CURRENT_LAUNCH_MODE === 'INTERNAL') recommendation = 'INTERNAL_ONLY';

  if (p1.length > 0) warnings.push(`${p1.length} P1 blockers open — review before pilot`);

  return {
    status,
    overallState,
    recommendation,
    technical,
    business,
    staff,
    security,
    support,
    blockers,
    warnings,
  };
}

export function canExitPilot(): { allowed: boolean; blockers: string[] } {
  const p0 = getOpenP0Blockers();
  const readiness = evaluateLaunchReadiness();
  const blockers: string[] = [];

  if (p0.length > 0) blockers.push('Open P0 blockers remain');
  if (readiness.technical === 'BLOCKED') blockers.push('Technical readiness blocked');
  if (readiness.staff === 'BLOCKED') blockers.push('Staff training incomplete');

  const pilotServices = getPilotServices();
  if (pilotServices.length === 0) blockers.push('No services marked GO or LIMITED_PILOT');

  return { allowed: blockers.length === 0, blockers };
}

export function getGoLiveRecommendation(): FinalLaunchRecommendation {
  return evaluateLaunchReadiness().recommendation;
}

export function countServicesByLaunchState(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const s of SERVICE_LAUNCH_MATRIX) {
    counts[s.activationState] = (counts[s.activationState] ?? 0) + 1;
  }
  return counts;
}
