import { mutateConstitutionStore, readConstitutionStore } from '../persistence';
import type { ConstitutionVote } from '../types';

function now(): string {
  return new Date().toISOString();
}

function createVoteId(): string {
  return `con-vote-${Date.now().toString(36)}`;
}

export function listConstitutionVotes(amendmentId?: string): ConstitutionVote[] {
  const votes = readConstitutionStore().votes;
  return amendmentId ? votes.filter((v) => v.amendmentId === amendmentId) : votes;
}

export function castConstitutionVote(input: {
  amendmentId: string;
  voter: string;
  decision: ConstitutionVote['decision'];
  notes?: string;
}): ConstitutionVote {
  const vote: ConstitutionVote = {
    voteId: createVoteId(),
    amendmentId: input.amendmentId,
    voter: input.voter,
    decision: input.decision,
    notes: input.notes,
    createdAt: now(),
  };

  mutateConstitutionStore((store) => ({
    ...store,
    votes: [...store.votes, vote],
  }));

  return vote;
}

export function summarizeConstitutionVotes(amendmentId: string) {
  const votes = listConstitutionVotes(amendmentId);
  return {
    approve: votes.filter((v) => v.decision === 'approve').length,
    reject: votes.filter((v) => v.decision === 'reject').length,
    abstain: votes.filter((v) => v.decision === 'abstain').length,
    total: votes.length,
  };
}
