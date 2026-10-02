import type { DomainEntityKind } from './types-core';

export type TrainingCanonDocument = {
  canonId: string;
  companyId: string;
  domain: string;
  title: string;
  source: string;
  version: string;
  approvalStatus: 'approved' | 'draft' | 'superseded';
  effectiveDate: string;
  supersededBy?: string;
  roleScope: string[];
  bodySummary: string;
};

export type HumanEmployeeLearningProfile = {
  employeeId: string;
  entityKind: Extract<DomainEntityKind, 'HUMAN_EMPLOYEE'>;
  role: string;
  completedModules: string[];
  strengths: string[];
  weakAreas: string[];
  authorizedTasks: string[];
  supervisedTasks: string[];
  trainingRequired: string[];
  notYetCleared: string[];
  inTraining: boolean;
};

export type TrainingSessionState = {
  sessionId: string;
  employeeId: string;
  curriculumId: string;
  startedAt: string;
  status: 'active' | 'completed';
};

export type TrainerAuthorityAnswer = {
  tier:
    | 'APPROVED_COMPANY_CANON'
    | 'VERIFIED_EXTERNAL_AUTHORITY'
    | 'LIKELY_BUT_NOT_CANON'
    | 'UNKNOWN'
    | 'REQUIRES_MANAGER'
    | 'REQUIRES_LEGAL_OR_COMPLIANCE_REVIEW';
  summary: string;
  canonId?: string;
};

export type ProposedCanonCorrection = {
  correctionId: string;
  companyId: string;
  proposedBy: string;
  source: string;
  summary: string;
  reviewStatus: 'pending' | 'approved' | 'rejected';
  targetCanonId?: string;
};

export type TrainingEscalationRecord = {
  escalationId: string;
  employeeId: string;
  reason: string;
  riskArea: string;
  at: string;
};

export function evaluateTrainerAnswer(
  questionRisk: 'low' | 'high',
  canonMatch: TrainingCanonDocument | undefined
): TrainerAuthorityAnswer {
  if (questionRisk === 'high' && !canonMatch) {
    return {
      tier: 'REQUIRES_LEGAL_OR_COMPLIANCE_REVIEW',
      summary: 'High-risk area without approved canon — escalate to manager/compliance',
    };
  }
  if (canonMatch?.approvalStatus === 'approved') {
    return {
      tier: 'APPROVED_COMPANY_CANON',
      summary: canonMatch.bodySummary,
      canonId: canonMatch.canonId,
    };
  }
  return {
    tier: 'UNKNOWN',
    summary: 'No approved company canon — do not invent policy',
  };
}

export function proposeTrainingCanonCorrection(
  input: Omit<ProposedCanonCorrection, 'correctionId' | 'reviewStatus'>
): ProposedCanonCorrection {
  return {
    ...input,
    correctionId: `tcc-${Date.now()}`,
    reviewStatus: 'pending',
  };
}

/** Manager correction must not silently mutate global canon until approved. */
export function applyApprovedTrainingCorrection(
  canon: TrainingCanonDocument,
  correction: ProposedCanonCorrection
): TrainingCanonDocument | null {
  if (correction.reviewStatus !== 'approved') return null;
  return {
    ...canon,
    version: `${canon.version}-rev`,
    bodySummary: correction.summary,
    source: correction.source,
  };
}
