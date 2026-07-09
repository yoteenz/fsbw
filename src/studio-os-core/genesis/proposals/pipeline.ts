import { mutateGenesisStore, readGenesisStore } from '../persistence/store';
import { createGenesisObject } from '../objects/factory';
import { getNextPipelineStage } from '../framework/hierarchy';
import type { GenesisPipelineStage, GenesisProposal } from '../types';

function now(): string {
  return new Date().toISOString();
}

function createProposalId(): string {
  return `prop-${Date.now().toString(36)}`;
}

export function listGenesisProposals(): GenesisProposal[] {
  return readGenesisStore().proposals;
}

export function getGenesisProposal(proposalId: string): GenesisProposal | undefined {
  return readGenesisStore().proposals.find((p) => p.proposalId === proposalId);
}

export function listOpenProposals(): GenesisProposal[] {
  return readGenesisStore().proposals.filter(
    (p) => p.status === 'open' || p.status === 'in-review' || p.status === 'accepted'
  );
}

/** Proposal Pipeline™ — entry point for pre-canonical change. */
export function submitGenesisProposal(input: {
  title: string;
  problem: string;
  proposedChange: string;
  author: string;
  category?: string;
  affectedObjectIds?: string[];
  requiredEvidence?: string[];
  tags?: string[];
}): GenesisProposal {
  const object = createGenesisObject({
    type: 'proposal',
    title: input.title,
    category: input.category ?? 'Proposal',
    author: input.author,
    slug: input.title,
    summary: input.proposedChange,
    tags: input.tags ?? ['genesis-proposal'],
    pipelineStage: 'proposal',
    payload: {
      problem: input.problem,
      proposedChange: input.proposedChange,
      requiredEvidence: input.requiredEvidence ?? [],
    },
  });

  const proposal: GenesisProposal = {
    proposalId: createProposalId(),
    objectId: object.objectId,
    title: input.title.trim(),
    problem: input.problem.trim(),
    proposedChange: input.proposedChange.trim(),
    affectedObjectIds: input.affectedObjectIds ?? [],
    requiredEvidence: input.requiredEvidence ?? [],
    pipelineStage: 'proposal',
    status: 'open',
    author: input.author,
    createdAt: now(),
    updatedAt: now(),
  };

  mutateGenesisStore((store) => ({
    ...store,
    proposals: [...store.proposals, proposal],
  }));

  return proposal;
}

export function advanceProposalStage(
  proposalId: string,
  targetStage?: GenesisPipelineStage
): GenesisProposal | undefined {
  let updated: GenesisProposal | undefined;

  mutateGenesisStore((store) => {
    const idx = store.proposals.findIndex((p) => p.proposalId === proposalId);
    if (idx < 0) return store;

    const proposal = store.proposals[idx];
    const nextStage = targetStage ?? getNextPipelineStage(proposal.pipelineStage);
    if (!nextStage) return store;

    updated = {
      ...proposal,
      pipelineStage: nextStage,
      updatedAt: now(),
    };

    const proposals = [...store.proposals];
    proposals[idx] = updated;

    const objects = store.objects.map((obj) =>
      obj.objectId === proposal.objectId
        ? { ...obj, pipelineStage: nextStage, updatedAt: now() }
        : obj
    );

    return { ...store, proposals, objects };
  });

  return updated;
}

export function resolveProposal(
  proposalId: string,
  outcome: 'accepted' | 'returned' | 'rejected'
): GenesisProposal | undefined {
  let updated: GenesisProposal | undefined;

  mutateGenesisStore((store) => {
    const idx = store.proposals.findIndex((p) => p.proposalId === proposalId);
    if (idx < 0) return store;

    updated = {
      ...store.proposals[idx],
      status: outcome,
      updatedAt: now(),
    };

    const proposals = [...store.proposals];
    proposals[idx] = updated;
    return { ...store, proposals };
  });

  return updated;
}

export function markProposalPromoted(proposalId: string): GenesisProposal | undefined {
  let updated: GenesisProposal | undefined;

  mutateGenesisStore((store) => {
    const idx = store.proposals.findIndex((p) => p.proposalId === proposalId);
    if (idx < 0) return store;

    updated = {
      ...store.proposals[idx],
      status: 'promoted',
      pipelineStage: 'genesis',
      updatedAt: now(),
    };

    const proposals = [...store.proposals];
    proposals[idx] = updated;
    return { ...store, proposals };
  });

  return updated;
}
