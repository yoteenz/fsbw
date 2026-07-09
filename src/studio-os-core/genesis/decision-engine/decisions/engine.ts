import { INITIAL_GENESIS_VERSION } from '../../versioning/semver';
import { mutateDecisionEngineStore, readDecisionEngineStore } from '../persistence';
import { buildDecisionContext } from '../context/engine';
import { buildDecisionConfidence } from '../confidence/model';
import { createDecisionEvidence } from '../evidence/model';
import { recordDecisionAudit } from '../audit/audit';
import { recordDecisionHistory } from '../history/history';
import type {
  CanonicalDecisionTypeId,
  ContextScope,
  DecisionStatus,
  DecisionVisibility,
  ReviewStatus,
  ReviewThreshold,
  ConfidenceLevel,
} from '../constants';
import type {
  DecisionAlternative,
  DecisionContextPackage,
  DecisionEvidenceRecord,
  DecisionIntent,
  DecisionTradeoff,
  DecisionValidationReport,
  StudioDecision,
} from '../types';

function now(): string {
  return new Date().toISOString();
}

export function createDecisionId(type: string, slug: string): string {
  const typeToken = type.toUpperCase().replace(/[^A-Z0-9]+/g, '-');
  const slugToken = (slug.trim() || 'decision')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `DEC-${typeToken}-${slugToken}-${Date.now().toString(36)}`;
}

export type SubmitDecisionInput = {
  decisionType: CanonicalDecisionTypeId | string;
  officialName: string;
  initiatorObjectId: string;
  decisionMakerObjectId: string;
  slug?: string;
  purpose?: string;
  affectedObjectIds?: string[];
  intent?: Partial<DecisionIntent> & { summary: string };
  context?: DecisionContextPackage | {
    scope: ContextScope;
    constraintObjectIds?: string[];
    relevantObjectIds?: string[];
    summary?: string;
  };
  evidence?: DecisionEvidenceRecord[];
  confidence?: { score?: number; level?: ConfidenceLevel; rationale: string };
  recommendation?: string;
  reasoning?: { summary: string; steps?: string[] };
  tradeoffs?: DecisionTradeoff[];
  alternatives?: DecisionAlternative[];
  dependencies?: string[];
  reviewStatus?: ReviewStatus;
  reviewThreshold?: ReviewThreshold;
  reviewerObjectIds?: string[];
  visibility?: DecisionVisibility;
  metadata?: Record<string, unknown>;
  correlationId?: string;
};

/** Decision Engine — submit and lifecycle manage decisions */
export function submitStudioDecision(input: SubmitDecisionInput): StudioDecision {
  const timestamp = now();
  const decisionType = input.decisionType.trim();

  const evidence = input.evidence ?? [];
  const context =
    input.context && 'contextId' in input.context
      ? input.context
      : buildDecisionContext({
          scope: input.context?.scope ?? 'workspace',
          constraintObjectIds: input.context?.constraintObjectIds,
          relevantObjectIds: input.context?.relevantObjectIds,
          summary: input.context?.summary,
        });

  const intent: DecisionIntent = {
    intentId: `INT-${Date.now().toString(36)}`,
    summary: input.intent?.summary ?? input.officialName,
    sourceObjectId: input.intent?.sourceObjectId ?? input.initiatorObjectId,
    interpretedAt: timestamp,
  };

  const confidence = buildDecisionConfidence({
    ...input.confidence,
    rationale: input.confidence?.rationale ?? 'Initial confidence at submission',
    evidence,
  });

  const decision: StudioDecision = {
    decisionId: createDecisionId(decisionType, input.slug ?? input.officialName),
    decisionType,
    version: { ...INITIAL_GENESIS_VERSION },
    officialName: input.officialName.trim(),
    purpose: input.purpose,
    status: 'proposed',
    initiatorObjectId: input.initiatorObjectId,
    decisionMakerObjectId: input.decisionMakerObjectId,
    affectedObjectIds: input.affectedObjectIds ?? [],
    intent,
    context,
    evidence,
    confidence,
    recommendation: input.recommendation,
    reasoning: {
      summary: input.reasoning?.summary ?? '',
      steps: input.reasoning?.steps ?? [],
    },
    tradeoffs: input.tradeoffs ?? [],
    alternatives: input.alternatives ?? [],
    dependencies: input.dependencies ?? [],
    reviewStatus: input.reviewStatus ?? 'not_required',
    reviewThreshold: input.reviewThreshold,
    reviewerObjectIds: input.reviewerObjectIds ?? [],
    humanOverrides: [],
    auditHistory: [],
    learningHistory: [],
    visibility: input.visibility ?? 'participant-visible',
    metadata: input.metadata ?? {},
    correlationId: input.correlationId,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  if (!decision.initiatorObjectId || !decision.decisionMakerObjectId) {
    throw new Error('Decision requires initiator and decision maker object IDs');
  }

  mutateDecisionEngineStore((store) => ({
    ...store,
    decisions: [...store.decisions, decision],
    evidenceRecords: [
      ...store.evidenceRecords,
      ...evidence.filter((e) => !store.evidenceRecords.some((x) => x.evidenceId === e.evidenceId)),
    ],
  }));

  recordDecisionAudit({
    decisionId: decision.decisionId,
    level: 'decision-record',
    action: 'decision.submitted',
    actorObjectId: decision.initiatorObjectId,
    visibility: decision.visibility,
    notes: decisionType,
  });

  recordDecisionHistory({
    decisionId: decision.decisionId,
    status: 'proposed',
    summary: 'Decision submitted',
    actorObjectId: decision.initiatorObjectId,
  });

  return decision;
}

export function getStudioDecision(decisionId: string): StudioDecision | undefined {
  return readDecisionEngineStore().decisions.find((d) => d.decisionId === decisionId);
}

export function advanceStudioDecision(
  decisionId: string,
  status: DecisionStatus,
  patch?: Partial<
    Pick<
      StudioDecision,
      'recommendation' | 'reasoning' | 'confidence' | 'metadata' | 'reviewStatus'
    >
  >
): StudioDecision | undefined {
  let updated: StudioDecision | undefined;

  mutateDecisionEngineStore((store) => {
    const idx = store.decisions.findIndex((d) => d.decisionId === decisionId);
    if (idx < 0) return store;

    updated = {
      ...store.decisions[idx],
      ...patch,
      status,
      updatedAt: now(),
    };

    const decisions = [...store.decisions];
    decisions[idx] = updated;
    return { ...store, decisions };
  });

  if (updated) {
    recordDecisionAudit({
      decisionId,
      level: status === 'rejected' ? 'event' : 'trace',
      action: `decision.${status}`,
      actorObjectId: updated.decisionMakerObjectId,
      visibility: updated.visibility,
    });
    recordDecisionHistory({
      decisionId,
      status,
      summary: `Decision ${status}`,
      actorObjectId: updated.decisionMakerObjectId,
    });
  }

  return updated;
}

export function applyHumanOverride(input: {
  decisionId: string;
  actorObjectId: string;
  reason: string;
  newStatus: DecisionStatus;
}): StudioDecision | undefined {
  let updated: StudioDecision | undefined;

  mutateDecisionEngineStore((store) => {
    const idx = store.decisions.findIndex((d) => d.decisionId === input.decisionId);
    if (idx < 0) return store;

    const current = store.decisions[idx];
    const override = {
      overrideId: `OVR-${Date.now().toString(36)}`,
      actorObjectId: input.actorObjectId,
      reason: input.reason.trim(),
      previousStatus: current.status,
      newStatus: input.newStatus,
      createdAt: now(),
    };

    updated = {
      ...current,
      status: input.newStatus,
      humanOverrides: [...current.humanOverrides, override],
      updatedAt: now(),
    };

    const decisions = [...store.decisions];
    decisions[idx] = updated;
    return { ...store, decisions };
  });

  if (updated) {
    recordDecisionAudit({
      decisionId: input.decisionId,
      level: 'decision-record',
      action: 'decision.human_override',
      actorObjectId: input.actorObjectId,
      visibility: updated.visibility,
      notes: input.reason,
    });
    recordDecisionHistory({
      decisionId: input.decisionId,
      status: input.newStatus,
      summary: `Human override: ${input.reason}`,
      actorObjectId: input.actorObjectId,
    });
  }

  return updated;
}

export function addDecisionEvidence(
  decisionId: string,
  evidenceInput: {
    sourceObjectId: string;
    summary: string;
    confidence?: ConfidenceLevel;
    relevance?: string;
  }
): StudioDecision | undefined {
  const evidence = createDecisionEvidence(evidenceInput);
  let updated: StudioDecision | undefined;

  mutateDecisionEngineStore((store) => {
    const idx = store.decisions.findIndex((d) => d.decisionId === decisionId);
    if (idx < 0) return store;

    const decision = store.decisions[idx];
    updated = {
      ...decision,
      evidence: [...decision.evidence, evidence],
      confidence: buildDecisionConfidence({
        rationale: decision.confidence.rationale,
        evidence: [...decision.evidence, evidence],
      }),
      updatedAt: now(),
    };

    const decisions = [...store.decisions];
    decisions[idx] = updated;

    return {
      ...store,
      decisions,
      evidenceRecords: [...store.evidenceRecords, evidence],
    };
  });

  return updated;
}

export function validateDecisionEnvelope(decision: StudioDecision): string[] {
  const errors: string[] = [];
  if (!decision.decisionId) errors.push('Missing decision ID');
  if (!decision.decisionType) errors.push('Missing decision type');
  if (!decision.initiatorObjectId) errors.push('Missing initiator');
  if (!decision.decisionMakerObjectId) errors.push('Missing decision maker');
  if (!decision.intent?.summary) errors.push('Missing intent');
  if (!decision.confidence) errors.push('Missing confidence');
  return errors;
}

export function validateDecisionEngineStore(): DecisionValidationReport {
  const store = readDecisionEngineStore();
  const issues: DecisionValidationReport['issues'] = [];

  for (const decision of store.decisions) {
    for (const message of validateDecisionEnvelope(decision)) {
      issues.push({
        code: 'invalid-decision',
        message,
        decisionId: decision.decisionId,
      });
    }
  }

  return { valid: issues.length === 0, issues };
}

export { createDecisionEvidence };
