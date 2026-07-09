import { readGenesisStore } from '../persistence/store';
import { getGenesisObject, updateGenesisObject } from '../objects/factory';
import { advanceProposalStage, getGenesisProposal } from '../proposals/pipeline';
import { acceptGenesisAdr } from '../adr/pipeline';
import {
  beginGenesisReview,
  completeGenesisReview,
  promoteObjectToCanonical,
} from '../reviews/pipeline';
import type { GenesisPipelineStage } from '../types';

/** Orchestrates Proposal → Review → Prototype → ADR → Genesis → Implementation → Verification → Canonical */

export function advanceGenesisLifecycle(
  objectId: string,
  targetStage: GenesisPipelineStage
): boolean {
  const object = getGenesisObject(objectId);
  if (!object) return false;

  updateGenesisObject(objectId, { pipelineStage: targetStage });

  const proposal = readGenesisStore().proposals.find((p) => p.objectId === objectId);
  if (proposal) {
    advanceProposalStage(proposal.proposalId, targetStage);
  }

  return true;
}

export function advanceProposalToReview(proposalId: string, reviewer: string): boolean {
  const proposal = getGenesisProposal(proposalId);
  if (!proposal) return false;

  advanceProposalStage(proposalId, 'review');
  beginGenesisReview({
    objectId: proposal.objectId,
    stage: 'review',
    reviewer,
    proposalId,
  });

  return true;
}

export function advanceReviewToPrototype(proposalId: string): boolean {
  const proposal = getGenesisProposal(proposalId);
  if (!proposal) return false;

  advanceProposalStage(proposalId, 'prototype');
  updateGenesisObject(proposal.objectId, { pipelineStage: 'prototype', status: 'draft' });
  return true;
}

export function advancePrototypeToAdr(proposalId: string, adrId: string): boolean {
  const proposal = getGenesisProposal(proposalId);
  if (!proposal) return false;

  advanceProposalStage(proposalId, 'adr');
  acceptGenesisAdr(adrId);
  updateGenesisObject(proposal.objectId, { pipelineStage: 'adr' });
  return true;
}

export function advanceAdrToGenesis(objectId: string): boolean {
  return advanceGenesisLifecycle(objectId, 'genesis');
}

export function advanceGenesisToImplementation(objectId: string): boolean {
  updateGenesisObject(objectId, {
    pipelineStage: 'implementation',
    canonicalStatus: 'working',
  });
  return true;
}

export function advanceImplementationToVerification(objectId: string): boolean {
  updateGenesisObject(objectId, { pipelineStage: 'verification' });
  return true;
}

export function advanceVerificationToCanonical(objectId: string, reviewer: string): boolean {
  const session = beginGenesisReview({
    objectId,
    stage: 'verification',
    reviewer,
  });

  if (!session) return false;

  completeGenesisReview(session.sessionId, 'passed', reviewer, 'Verification complete');
  promoteObjectToCanonical(objectId, reviewer);
  return true;
}

export function getLifecycleSummary(objectId: string) {
  const object = getGenesisObject(objectId);
  if (!object) return undefined;

  const store = readGenesisStore();
  const proposal = store.proposals.find((p) => p.objectId === objectId);
  const adr = store.adrs.find((a) => a.objectId === objectId || a.proposalId === proposal?.proposalId);
  const reviews = store.reviews.filter((r) => r.objectId === objectId);

  return {
    objectId,
    currentStage: object.pipelineStage,
    status: object.status,
    canonicalStatus: object.canonicalStatus,
    proposalStatus: proposal?.status,
    adrStatus: adr?.status,
    reviewCount: reviews.length,
    pendingReviews: reviews.filter((r) => r.status === 'pending' || r.status === 'in-progress').length,
  };
}
