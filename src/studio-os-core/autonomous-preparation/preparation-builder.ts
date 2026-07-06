import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { recordLivingBrainSignal } from '../profession-brain/store';
import { countAwaitingApproval } from './approval-workflow';
import { buildLearningLoopSnapshot, summarizeLearningLoop } from './learning-loop';
import { buildPendingPreparationQueue, summarizePendingQueue } from './preparation-engine';
import type { OrganizationAutonomousPreparationProfile, PendingPreparation } from './types';

export function computePreparationScore(
  queueCount: number,
  awaitingApproval: number,
  qualityImprovementPct: number
): number {
  return Math.min(
    96,
    Math.round(queueCount * 5 + awaitingApproval * 3 + qualityImprovementPct * 0.35)
  );
}

export function buildDockPreparationLine(preparations: PendingPreparation[]): string {
  const pending = preparations.filter((p) => p.status === 'pending');
  const briefing = pending.find((p) => p.type === 'executive-summary');
  const quarterly = pending.find((p) => p.type === 'presentation');
  const launch = pending.find((p) => p.type === 'launch-checklist' || p.type === 'social-calendar');
  const marketing = pending.find((p) => p.type === 'email-campaign');

  if (briefing) return "I've prepared tomorrow's executive briefing — awaiting your approval.";
  if (quarterly) return "Your quarterly review is approaching. I've assembled all supporting reports.";
  if (launch && marketing) {
    return "I noticed you're nearing launch week. Three promotional assets are ready for review.";
  }
  if (pending[0]) return `${pending[0].title} — prepared quietly, awaiting approval (${pending[0].confidencePct}% confidence).`;
  return 'Autonomous Preparation monitoring — leverage appears before you ask.';
}

export function mergePreparationStatuses(
  fresh: PendingPreparation[],
  existing: PendingPreparation[] | undefined
): PendingPreparation[] {
  if (!existing?.length) return fresh;
  const statusById = new Map(existing.map((p) => [p.id, p.status]));
  return fresh.map((p) => ({
    ...p,
    status: statusById.get(p.id) ?? p.status,
  }));
}

export function buildOrganizationAutonomousPreparationProfile(
  organizationId: string,
  existingPreparations?: PendingPreparation[]
): OrganizationAutonomousPreparationProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const industryId = brain?.industryId ?? organizationId;

  const freshQueue = buildPendingPreparationQueue(organizationId, companyName);
  const pendingPreparations = mergePreparationStatuses(freshQueue, existingPreparations);
  const learningLoop = buildLearningLoopSnapshot(pendingPreparations);
  const awaitingApprovalCount = countAwaitingApproval(pendingPreparations);

  const profile: OrganizationAutonomousPreparationProfile = {
    organizationId,
    companyName,
    industryId,
    updatedAt: new Date().toISOString(),
    preparationScore: 0,
    pendingQueueCount: pendingPreparations.length,
    awaitingApprovalCount,
    pendingPreparations,
    learningLoop,
    dockPreparationLine: '',
    nothingAutoExecutes: true,
    syncedSources: [
      'predictive-organization',
      'anticipation-engine',
      'relationship-memory',
      'ambient-awareness',
      'founder-cognitive-load',
      'organization-pulse',
      'company-health-index',
      'profession-brain',
      'business-discovery-blueprint',
      'command-dock',
    ],
  };

  profile.preparationScore = computePreparationScore(
    profile.pendingQueueCount,
    profile.awaitingApprovalCount,
    profile.learningLoop.qualityImprovementPct
  );
  profile.dockPreparationLine = buildDockPreparationLine(pendingPreparations);
  return profile;
}

export function summarizeAutonomousPreparationProfile(profile: OrganizationAutonomousPreparationProfile): string {
  return [
    profile.dockPreparationLine,
    `${profile.awaitingApprovalCount} awaiting approval · ${profile.pendingQueueCount} in queue · preparation score ${profile.preparationScore}%.`,
    summarizePendingQueue(profile.pendingPreparations),
    summarizeLearningLoop(profile.learningLoop),
    'Nothing executes automatically — approve, edit, reject, schedule, delegate, or archive.',
  ].join(' ');
}

export function logRejectionToProfessionBrain(organizationId: string, prep: PendingPreparation): void {
  recordLivingBrainSignal(
    organizationId,
    `Autonomous Preparation rejected: ${prep.type} — ${prep.title}. Trigger: ${prep.trigger.slice(0, 80)}`
  );
}

export function logApprovalToProfessionBrain(organizationId: string, prep: PendingPreparation): void {
  recordLivingBrainSignal(
    organizationId,
    `Autonomous Preparation approved: ${prep.type} — ${prep.title}. Quality signal for future preparations.`
  );
}
