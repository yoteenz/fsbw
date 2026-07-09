import { mutateGenesisStore, readGenesisStore } from '../persistence/store';
import { validateGenesisObject } from '../schemas/validate';
import { getGenesisObject, updateGenesisObject } from '../objects/factory';
import type { GenesisPipelineStage, GenesisReviewSession } from '../types';

function now(): string {
  return new Date().toISOString();
}

function createSessionId(): string {
  return `rev-${Date.now().toString(36)}`;
}

export const GENESIS_REVIEW_GATES = [
  'identity',
  'hierarchy',
  'schema',
  'relationship',
  'constitution',
  'institute',
  'implementation',
  'compilation',
  'audit',
] as const;

export type GenesisReviewGate = (typeof GENESIS_REVIEW_GATES)[number];

export function listGenesisReviewSessions(): GenesisReviewSession[] {
  return readGenesisStore().reviews;
}

export function getGenesisReviewSession(sessionId: string): GenesisReviewSession | undefined {
  return readGenesisStore().reviews.find((r) => r.sessionId === sessionId);
}

export function listPendingReviewSessions(): GenesisReviewSession[] {
  return readGenesisStore().reviews.filter(
    (r) => r.status === 'pending' || r.status === 'in-progress'
  );
}

/** Review Pipeline™ — canonical review gates before promotion. */
export function beginGenesisReview(input: {
  objectId: string;
  stage: GenesisPipelineStage;
  reviewer?: string;
  proposalId?: string;
  adrId?: string;
}): GenesisReviewSession | undefined {
  const object = getGenesisObject(input.objectId);
  if (!object) return undefined;

  const session: GenesisReviewSession = {
    sessionId: createSessionId(),
    objectId: input.objectId,
    proposalId: input.proposalId,
    adrId: input.adrId,
    stage: input.stage,
    status: input.reviewer ? 'in-progress' : 'pending',
    reviewer: input.reviewer,
    gatesPassed: [],
    gatesFailed: [],
    notes: [],
    createdAt: now(),
    updatedAt: now(),
  };

  mutateGenesisStore((store) => ({
    ...store,
    reviews: [...store.reviews, session],
    objects: store.objects.map((obj) =>
      obj.objectId === input.objectId
        ? {
            ...obj,
            status: 'review',
            canonicalStatus: 'review-pending',
            updatedAt: now(),
          }
        : obj
    ),
  }));

  return session;
}

export function runGenesisReviewGate(
  sessionId: string,
  gate: GenesisReviewGate,
  passed: boolean,
  note?: string
): GenesisReviewSession | undefined {
  let updated: GenesisReviewSession | undefined;

  mutateGenesisStore((store) => {
    const idx = store.reviews.findIndex((r) => r.sessionId === sessionId);
    if (idx < 0) return store;

    const session = store.reviews[idx];
    const gatesPassed = passed
      ? [...new Set([...session.gatesPassed, gate])]
      : session.gatesPassed.filter((g) => g !== gate);
    const gatesFailed = passed
      ? session.gatesFailed.filter((g) => g !== gate)
      : [...new Set([...session.gatesFailed, gate])];
    const notes = note ? [...session.notes, `${gate}: ${note}`] : session.notes;

    updated = {
      ...session,
      status: 'in-progress',
      gatesPassed,
      gatesFailed,
      notes,
      updatedAt: now(),
    };

    const reviews = [...store.reviews];
    reviews[idx] = updated;
    return { ...store, reviews };
  });

  return updated;
}

export function autoRunSchemaReviewGate(sessionId: string): GenesisReviewSession | undefined {
  const session = getGenesisReviewSession(sessionId);
  if (!session) return undefined;

  const object = getGenesisObject(session.objectId);
  if (!object) return undefined;

  const report = validateGenesisObject(object);
  return runGenesisReviewGate(
    sessionId,
    'schema',
    report.valid,
    report.valid ? 'Schema validation passed' : report.errors.join('; ')
  );
}

export function completeGenesisReview(
  sessionId: string,
  decision: 'passed' | 'failed' | 'returned',
  reviewer: string,
  notes?: string
): GenesisReviewSession | undefined {
  let updated: GenesisReviewSession | undefined;

  mutateGenesisStore((store) => {
    const idx = store.reviews.findIndex((r) => r.sessionId === sessionId);
    if (idx < 0) return store;

    const session = store.reviews[idx];
    updated = {
      ...session,
      status: decision,
      reviewer,
      notes: notes ? [...session.notes, notes] : session.notes,
      updatedAt: now(),
    };

    const reviews = [...store.reviews];
    reviews[idx] = updated;

    const objects = store.objects.map((obj) => {
      if (obj.objectId !== session.objectId) return obj;
      const reviewRecord = {
        reviewId: `rec-${sessionId}`,
        stage: session.stage,
        decision:
          decision === 'passed' ? ('pass' as const) : decision === 'failed' ? ('fail' as const) : ('return' as const),
        reviewer,
        notes: notes ?? '',
        createdAt: now(),
      };
      return {
        ...obj,
        reviewHistory: [...obj.reviewHistory, reviewRecord],
        updatedAt: now(),
      };
    });

    return { ...store, reviews, objects };
  });

  if (updated && decision === 'passed') {
    updateGenesisObject(updated.objectId, { status: 'approved' });
  }

  return updated;
}

export function promoteObjectToCanonical(objectId: string, reviewer: string): boolean {
  const object = getGenesisObject(objectId);
  if (!object) return false;

  updateGenesisObject(objectId, {
    status: 'canonical',
    pipelineStage: 'canonical',
    canonicalStatus: 'canonical',
  });

  mutateGenesisStore((store) => ({
    ...store,
    objects: store.objects.map((obj) =>
      obj.objectId === objectId
        ? {
            ...obj,
            reviewHistory: [
              ...obj.reviewHistory,
              {
                reviewId: `rec-canonical-${Date.now().toString(36)}`,
                stage: 'canonical',
                decision: 'pass' as const,
                reviewer,
                notes: 'Promoted to canonical Genesis truth',
                createdAt: now(),
              },
            ],
          }
        : obj
    ),
  }));

  return true;
}
