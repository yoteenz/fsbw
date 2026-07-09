import { mutateLiveValidationSystemStore, readLiveValidationSystemStore } from '../persistence';
import type {
  LvsArchitecturalHistoryEntry,
  LvsGenesisImprovementProposal,
} from '../types';
import type { LvsEscapeClassification, LvsEscapeOutcome, LvsProposalStatus } from '../constants';
import { listAllLearningCandidates } from './learning-engine';

/** Genesis Proposal Engine™ — queue improvement proposals for founder review (never auto-modify Genesis) */
export function listImprovementProposals(status?: LvsProposalStatus): LvsGenesisImprovementProposal[] {
  const proposals = readLiveValidationSystemStore().genesisProposals;
  const filtered = status ? proposals.filter((p) => p.status === status) : proposals;
  return [...filtered].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getGenesisProposal(proposalId: string): LvsGenesisImprovementProposal | undefined {
  return readLiveValidationSystemStore().genesisProposals.find((p) => p.proposalId === proposalId);
}

export function countProposalsByStatus(): Record<LvsProposalStatus, number> {
  const counts = {
    queued: 0,
    'under-review': 0,
    accepted: 0,
    rejected: 0,
    deferred: 0,
  } satisfies Record<LvsProposalStatus, number>;

  for (const p of readLiveValidationSystemStore().genesisProposals) {
    counts[p.status] += 1;
  }
  return counts;
}

export function appendArchitecturalHistory(
  entry: Omit<LvsArchitecturalHistoryEntry, 'entryId' | 'timestamp'> & { timestamp?: string }
): void {
  const full: LvsArchitecturalHistoryEntry = {
    ...entry,
    entryId: `lvs-history-${Date.now()}`,
    timestamp: entry.timestamp ?? new Date().toISOString(),
  };
  mutateLiveValidationSystemStore((store) => ({
    ...store,
    architecturalHistory: [...store.architecturalHistory, full],
  }));
}

export function createGenesisImprovementProposal(input: {
  title: string;
  systemIds: string[];
  signalSummary: string;
  evidenceQuality: LvsGenesisImprovementProposal['evidenceQuality'];
  proposedGenesisChange: string;
  escapeClassifications?: LvsEscapeClassification[];
  recommendedOutcome?: LvsEscapeOutcome | 'none';
  graduationImpact?: string;
  risksOfInaction?: string;
  diaryExcerpts?: string[];
}): LvsGenesisImprovementProposal {
  const proposal: LvsGenesisImprovementProposal = {
    proposalId: `genesis-proposal-${Date.now()}`,
    title: input.title,
    status: 'queued',
    systemIds: input.systemIds,
    missionIds: [],
    signalSummary: input.signalSummary,
    evidenceQuality: input.evidenceQuality,
    diaryExcerpts: input.diaryExcerpts ?? [],
    escapeClassifications: input.escapeClassifications ?? [],
    metricTrend: 'Derived from live validation signals',
    proposedGenesisChange: input.proposedGenesisChange,
    recommendedOutcome: input.recommendedOutcome ?? 'none',
    graduationImpact: input.graduationImpact ?? 'May affect Launch Stack graduation readiness.',
    risksOfInaction: input.risksOfInaction ?? 'Platform may drift from founder operating reality.',
    createdAt: new Date().toISOString(),
  };

  mutateLiveValidationSystemStore((store) => ({
    ...store,
    genesisProposals: [...store.genesisProposals, proposal],
  }));

  appendArchitecturalHistory({
    proposalId: proposal.proposalId,
    action: 'proposal-created',
    detail: `Queued Genesis Improvement Proposal: ${proposal.title}`,
    actor: 'genesis-proposal-engine',
  });

  return proposal;
}

export function reviewGenesisProposal(
  proposalId: string,
  decision: 'accepted' | 'rejected' | 'deferred',
  reviewNote: string
): LvsGenesisImprovementProposal | undefined {
  let updated: LvsGenesisImprovementProposal | undefined;

  mutateLiveValidationSystemStore((store) => {
    const genesisProposals = store.genesisProposals.map((p) => {
      if (p.proposalId !== proposalId) return p;
      updated = {
        ...p,
        status: decision,
        reviewedAt: new Date().toISOString(),
        reviewNote,
      };
      return updated;
    });
    return { ...store, genesisProposals };
  });

  if (updated) {
    appendArchitecturalHistory({
      proposalId,
      action:
        decision === 'accepted'
          ? 'proposal-accepted'
          : decision === 'rejected'
            ? 'proposal-rejected'
            : 'proposal-deferred',
      detail: reviewNote,
      actor: 'founder',
    });
  }

  return updated;
}

export function syncLearningCandidatesToProposals(): LvsGenesisImprovementProposal[] {
  const candidates = listAllLearningCandidates().filter((c) => c.evidenceQuality !== 'low');
  const existingTitles = new Set(
    readLiveValidationSystemStore().genesisProposals.map((p) => p.title)
  );
  const created: LvsGenesisImprovementProposal[] = [];

  for (const candidate of candidates) {
    if (existingTitles.has(candidate.title)) continue;
    if (candidate.evidenceQuality === 'high' || candidate.sourceKinds.includes('escape')) {
      created.push(
        createGenesisImprovementProposal({
          title: candidate.title,
          systemIds: candidate.systemIds,
          signalSummary: candidate.summary,
          evidenceQuality: candidate.evidenceQuality,
          proposedGenesisChange: candidate.assumptionsChanged.join(' '),
          diaryExcerpts: candidate.sourceKinds.includes('reflection') ? [candidate.summary] : [],
        })
      );
    }
  }

  return created;
}

export function listArchitecturalHistory(limit = 50): LvsArchitecturalHistoryEntry[] {
  return [...readLiveValidationSystemStore().architecturalHistory]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}
