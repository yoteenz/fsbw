import { BUSINESS_DISCOVERY_PHASES } from '../phases';
import { PHASE_COMPLETION_THRESHOLD, GENOME_COMPLETION_THRESHOLD } from '../constants';
import type {
  BusinessDiscoveryPhaseId,
  DiscoveryPhaseProgress,
  DiscoverySession,
  DiscoverySessionStatus,
  DiscoveryTimelineEntry,
} from '../types';

export function computePhaseProgress(session: DiscoverySession): DiscoveryPhaseProgress[] {
  return BUSINESS_DISCOVERY_PHASES.map((phase) => {
    const responses = session.responses.filter((response) => response.phaseId === phase.id);
    const answeredCount = responses.length;
    const totalCount = phase.questionsAsked.length;
    const percentComplete = totalCount ? Math.round((answeredCount / totalCount) * 100) : 0;
    let status: DiscoveryPhaseProgress['status'] = 'not-started';
    if (percentComplete >= PHASE_COMPLETION_THRESHOLD) status = 'complete';
    else if (answeredCount > 0) status = 'in-progress';

    const lastActivityAt = responses.length
      ? responses.reduce((latest, response) =>
          response.answeredAt > latest ? response.answeredAt : latest
        , responses[0].answeredAt)
      : undefined;

    return {
      phaseId: phase.id,
      answeredCount,
      totalCount,
      percentComplete,
      status,
      lastActivityAt,
    };
  });
}

export function computeOverallProgress(progress: DiscoveryPhaseProgress[]): number {
  if (!progress.length) return 0;
  const total = progress.reduce((sum, phase) => sum + phase.percentComplete, 0);
  return Math.round(total / progress.length);
}

export function computeGenomeCompletion(session: DiscoverySession): number {
  const signals = [
    session.discoveredSystems.length >= 3,
    session.relationships.length >= 2,
    session.dependencies.length >= 1,
    session.insights.length >= 3,
    session.risks.length >= 1,
    session.recommendations.length >= 2,
    session.companyGenome !== null,
  ];
  const score = signals.filter(Boolean).length;
  return Math.round((score / signals.length) * 100);
}

export function resolveCurrentPhase(progress: DiscoveryPhaseProgress[]): BusinessDiscoveryPhaseId {
  const inProgress = progress.find((phase) => phase.status === 'in-progress');
  if (inProgress) return inProgress.phaseId;
  const notStarted = progress.find((phase) => phase.status === 'not-started');
  if (notStarted) return notStarted.phaseId;
  return progress[progress.length - 1]?.phaseId ?? 'founder-discovery';
}

export function resolveSessionStatus(
  session: DiscoverySession,
  overallProgress: number,
  genomeCompletion: number
): DiscoverySessionStatus {
  if (session.generatedHeadquarters?.maturityLevel === 'ready' && overallProgress >= PHASE_COMPLETION_THRESHOLD) {
    return 'complete';
  }
  if (session.generatedHeadquarters) return 'headquarters-ready';
  if (genomeCompletion >= GENOME_COMPLETION_THRESHOLD || session.companyGenome) return 'genome-ready';
  if (overallProgress > 0) return 'in-progress';
  return 'not-started';
}

export function buildDiscoveryTimeline(session: DiscoverySession): DiscoveryTimelineEntry[] {
  const entries: DiscoveryTimelineEntry[] = [
    {
      id: `${session.id}-started`,
      kind: 'phase-started',
      phaseId: 'founder-discovery',
      title: 'Discovery session began',
      summary: `${session.company.companyName} onboarding started.`,
      occurredAt: session.startedAt,
    },
  ];

  for (const phase of session.progress.filter((item) => item.status === 'complete')) {
    const phaseDef = BUSINESS_DISCOVERY_PHASES.find((p) => p.id === phase.phaseId);
    entries.push({
      id: `${session.id}-${phase.phaseId}-complete`,
      kind: 'phase-completed',
      phaseId: phase.phaseId,
      title: `${phaseDef?.title ?? phase.phaseId} complete`,
      summary: phaseDef?.purpose ?? '',
      occurredAt: phase.lastActivityAt ?? session.updatedAt,
    });
  }

  for (const insight of session.insights) {
    entries.push({
      id: insight.id,
      kind: insight.founderMoment ? 'founder-moment' : 'insight',
      phaseId: insight.sourcePhaseId,
      title: insight.title,
      summary: insight.summary,
      occurredAt: insight.generatedAt,
    });
  }

  if (session.companyGenome) {
    entries.push({
      id: `${session.id}-genome`,
      kind: 'genome-generated',
      phaseId: 'business-genome',
      title: 'Company Genome™ generated',
      summary: `Genome completion at ${session.genomeCompletionPercent}%.`,
      occurredAt: session.companyGenome.generatedAt,
    });
  }

  if (session.generatedHeadquarters) {
    entries.push({
      id: `${session.id}-hq`,
      kind: 'headquarters-ready',
      phaseId: 'headquarters-generation',
      title: session.generatedHeadquarters.title,
      summary: session.generatedHeadquarters.description,
      occurredAt: session.generatedHeadquarters.generatedAt,
    });
  }

  return entries.sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
}

export function buildFounderJourney(session: DiscoverySession) {
  return session.progress.map((phase) => {
    const phaseDef = BUSINESS_DISCOVERY_PHASES.find((p) => p.id === phase.phaseId);
    const insight = session.insights.find((item) => item.sourcePhaseId === phase.phaseId);
    return {
      phaseId: phase.phaseId,
      title: phaseDef?.title ?? phase.phaseId,
      status: phase.status,
      highlight: insight?.founderMoment ?? insight?.title,
    };
  });
}
