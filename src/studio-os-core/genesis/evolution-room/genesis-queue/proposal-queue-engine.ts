import { listImprovementProposals } from '../../live-validation-system/genesis-learning/proposal-engine';
import type { ErGenesisProposalQueueItem } from '../types';

export function buildGenesisProposalQueue(): ErGenesisProposalQueueItem[] {
  return listImprovementProposals().map((p) => ({
    proposalId: p.proposalId,
    title: p.title,
    status: p.status,
    signalSummary: p.signalSummary,
    evidenceQuality: p.evidenceQuality,
    proposedGenesisChange: p.proposedGenesisChange,
    systemIds: p.systemIds,
    createdAt: p.createdAt,
  }));
}

export function countQueuedGenesisProposals(): number {
  return buildGenesisProposalQueue().filter(
    (p) => p.status === 'queued' || p.status === 'under-review'
  ).length;
}
