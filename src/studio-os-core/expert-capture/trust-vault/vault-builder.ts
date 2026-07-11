import type { ExpertCaptureSession } from '../types';
import type { KnowledgeProgram } from '../knowledge-mirror/types';
import type { ExpertCaptureProfile } from '../profiles/profile-types';
import { buildWorkerIsolationManifest, resolveWorkerDisplayName } from './worker-isolation';
import { loadAuditLog, seedTrustAuditIfEmpty } from './audit-log';
import { VAULT_SECTIONS } from './vault-sections';
import type {
  KnowledgeVaultSnapshot,
  LivingWorkerSnapshot,
  TrustDashboardMetrics,
  VaultTimelineEvent,
  WorkerEvolutionVersion,
} from './types';

function estimateHoursRecorded(session: ExpertCaptureSession | null): number {
  if (!session) return 0;
  const withMedia = session.answers.filter((a) => !a.deleted && (a.media.videoBlobId || a.media.audioBlobId));
  return Math.round(withMedia.length * 0.08 * 10) / 10;
}

export function buildVaultTimeline(
  session: ExpertCaptureSession | null,
  program: KnowledgeProgram | null
): VaultTimelineEvent[] {
  const events: VaultTimelineEvent[] = [];

  if (session?.meta.trustFramework?.agreementsSignedAt) {
    events.push({
      id: 'tl-trust',
      timestamp: session.meta.trustFramework.agreementsSignedAt,
      stage: 'expert_review',
      title: 'Trust Framework signed',
      summary: 'Expert agreements and vault access established.',
      actor: session.meta.expertName,
      entryId: null,
      sessionId: session.meta.id,
    });
  }

  for (const a of session?.answers.filter((x) => !x.deleted) ?? []) {
    events.push({
      id: `tl-ans-${a.id}`,
      timestamp: a.recordedAt ?? session!.meta.updatedAt,
      stage: a.status === 'approved' ? 'published' : 'recorded',
      title: a.questionText.slice(0, 80),
      summary: a.aiUnderstanding?.slice(0, 120) ?? a.transcript.slice(0, 120) ?? 'Recording captured',
      actor: session!.meta.expertName,
      entryId: null,
      sessionId: session!.meta.id,
    });
    if (a.status === 'approved') {
      events.push({
        id: `tl-appr-${a.id}`,
        timestamp: session!.meta.updatedAt,
        stage: 'expert_review',
        title: 'Expert approved answer',
        summary: a.questionText.slice(0, 100),
        actor: session!.meta.expertName,
        entryId: null,
        sessionId: session!.meta.id,
      });
    }
  }

  for (const e of program?.entries ?? []) {
    events.push({
      id: `tl-ke-${e.id}`,
      timestamp: e.updatedAt,
      stage: e.lifecycleStatus,
      title: e.knowledgeArea,
      summary: e.statement.slice(0, 140),
      actor: e.expertName,
      entryId: e.id,
      sessionId: e.source.sessionId,
    });
  }

  for (const v of program?.versions ?? []) {
    events.push({
      id: `tl-kv-${v.id}`,
      timestamp: v.createdAt,
      stage: 'updated',
      title: `Knowledge version ${v.version}`,
      summary: v.changeSummary,
      actor: v.createdBy,
      entryId: v.entryId,
      sessionId: v.sourceSessionId,
    });
  }

  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function buildLivingWorkerSnapshot(
  profile: ExpertCaptureProfile,
  organizationLabel: string,
  program: KnowledgeProgram | null
): LivingWorkerSnapshot {
  const workerName = resolveWorkerDisplayName(profile, organizationLabel);
  const competencies = program?.competencies ?? [];
  const weakAreas = competencies.filter((c) => c.level === 'learning' || c.level === 'needs_refresh').map((c) => c.area);
  const needsReview = program?.entries.filter((e) => e.freshnessStatus === 'review_due' || e.lifecycleStatus === 'outdated').map((e) => e.knowledgeArea) ?? [];

  const evolutionVersions: WorkerEvolutionVersion[] = (program?.packets ?? [])
    .filter((p) => p.status === 'active' || p.status === 'passed')
    .map((p, i) => ({
      version: i + 1,
      label: `Version ${i + 1}`,
      changedAt: p.updatedAt,
      changeSummary: `${p.title} — ${p.approvedStatements.length} approved rules`,
      packetIds: [p.id],
    }));

  if (!evolutionVersions.length && program) {
    evolutionVersions.push({
      version: 1,
      label: 'Version 1',
      changedAt: program.updatedAt,
      changeSummary: 'Worker initialized — awaiting approved training packets',
      packetIds: [],
    });
  }

  const maxVersion = program?.versions.length ? Math.max(...program.versions.map((v) => v.version)) : 1;
  const competent = competencies.filter((c) => c.level === 'competent' || c.level === 'expert_approved').length;
  const progress = competencies.length ? Math.round((competent / competencies.length) * 100) : 0;

  return {
    workerName,
    knowledgeVersion: maxVersion,
    competencyLevel: competent ? 'Developing' : 'Not yet trained',
    lastUpdated: program?.updatedAt ?? new Date().toISOString(),
    pendingLessons: program?.continuingEducation.filter((c) => c.completionStatus !== 'passed').length ?? 0,
    trainingProgressPercent: progress,
    confidenceSummary: progress >= 70 ? 'Evidence-based competency building' : 'Training gated until owner approval',
    weakAreas: [...new Set(weakAreas)],
    needsReview: [...new Set(needsReview)],
    sourceCount: program?.entries.filter((e) => e.lifecycleStatus === 'active_knowledge').length ?? 0,
    evolutionVersions,
  };
}

export function buildTrustDashboard(
  session: ExpertCaptureSession | null,
  program: KnowledgeProgram | null
): TrustDashboardMetrics {
  const approved = program?.entries.filter((e) =>
    ['approved_for_training', 'active_knowledge', 'scenario_tested'].includes(e.lifecycleStatus)
  ).length ?? 0;
  const pending = program?.entries.filter((e) => e.lifecycleStatus === 'owner_visible' || e.lifecycleStatus === 'expert_reviewed').length ?? 0;
  const corrections = session?.answers.filter((a) => a.transcriptExpertCorrected || a.status === 'corrected').length ?? 0;
  const competencies = program?.competencies ?? [];
  const trained = competencies.filter((c) => c.level === 'competent' || c.level === 'expert_approved').length;
  const trainingPct = competencies.length ? Math.round((trained / competencies.length) * 100) : 0;
  const health = Math.min(100, Math.round(approved * 8 + trainingPct * 0.4 + (session?.meta.trustFramework?.agreementsSignedAt ? 20 : 0)));

  return {
    knowledgeUploaded: program?.entries.length ?? session?.answers.filter((a) => !a.deleted).length ?? 0,
    hoursRecorded: estimateHoursRecorded(session),
    trainingCompletionPercent: trainingPct,
    approvalQueueCount: pending,
    pendingReviews: pending,
    correctionsNeeded: corrections,
    workerAccuracyLabel: trained ? `${trained} competent areas` : 'Awaiting approved packets',
    workerConfidenceLabel: trainingPct >= 50 ? 'Evidence-based' : 'Not yet authorized',
    latestSessionAt: session?.meta.updatedAt ?? null,
    recentUpdatesCount: program?.notifications.filter((n) => !n.read).length ?? 0,
    knowledgeHealthScore: health,
  };
}

export function buildKnowledgeVaultSnapshot(input: {
  profile: ExpertCaptureProfile;
  session: ExpertCaptureSession | null;
  program: KnowledgeProgram | null;
}): KnowledgeVaultSnapshot {
  const { profile, session, program } = input;
  const organizationLabel = session?.meta.organizationLabel ?? profile.defaultOrganization;
  const expertName = session?.meta.expertName ?? 'Expert';
  const workerIsolation = buildWorkerIsolationManifest(profile, organizationLabel);
  seedTrustAuditIfEmpty(profile.companyId, profile.id, expertName, workerIsolation.workerName);

  const timeline = buildVaultTimeline(session, program);
  const dashboard = buildTrustDashboard(session, program);
  const livingWorker = buildLivingWorkerSnapshot(profile, organizationLabel, program);

  const searchableItems = [
    ...(program?.entries ?? []).map((e) => ({
      id: e.id,
      sectionId: e.visibility === 'private_draft' ? ('draft_knowledge' as const) : ('published_knowledge' as const),
      title: e.knowledgeArea,
      snippet: e.statement.slice(0, 160),
      timestamp: e.updatedAt,
    })),
    ...(session?.answers.filter((a) => !a.deleted) ?? []).map((a) => ({
      id: a.id,
      sectionId: 'transcripts' as const,
      title: a.questionText.slice(0, 80),
      snippet: (a.correctedTranscript ?? a.transcript).slice(0, 160),
      timestamp: a.recordedAt ?? session!.meta.updatedAt,
    })),
  ];

  return {
    organizationId: profile.companyId,
    organizationLabel,
    expertName,
    profileId: profile.id,
    workerIsolation,
    trustRecord: session?.meta.trustFramework ?? null,
    sections: VAULT_SECTIONS,
    timeline,
    auditLog: loadAuditLog(profile.companyId, profile.id),
    dashboard,
    livingWorker,
    searchableItems,
  };
}
