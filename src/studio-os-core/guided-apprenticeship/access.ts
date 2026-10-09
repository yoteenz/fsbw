import type { ApprenticeshipSession, KnowledgeLayer, TraineeRole } from './types';

export type TrainingView = {
  organizationId: string;
  workflowId: string;
  titles: string[];
  includesPrivate: boolean;
  toolsGranted: false;
};

export function canReadLayer(input: {
  readerOrganizationId: string;
  noteOrganizationId: string;
  role: TraineeRole;
  layer: KnowledgeLayer;
}): boolean {
  if (input.readerOrganizationId !== input.noteOrganizationId) return false;
  if (input.layer === 'industry' || input.layer === 'company') return input.role !== 'ai_team_member' || input.layer === 'industry';
  if (input.layer === 'private') return input.role === 'founder' || input.role === 'manager';
  return false;
}

export function trainingView(input: {
  session: ApprenticeshipSession;
  readerOrganizationId: string;
  role: TraineeRole;
  privateNote: string | null;
}): TrainingView | null {
  if (input.session.knowledgeStatus !== 'approved_for_training') return null;
  if (input.readerOrganizationId !== input.session.organizationId) return null;
  const companyVisible = canReadLayer({
    readerOrganizationId: input.readerOrganizationId,
    noteOrganizationId: input.session.organizationId,
    role: input.role,
    layer: 'company',
  });
  if (!companyVisible && input.role === 'ai_team_member') {
    return {
      organizationId: input.session.organizationId,
      workflowId: input.session.workflowId,
      titles: [],
      includesPrivate: false,
      toolsGranted: false,
    };
  }
  if (!companyVisible) return null;
  const seesPrivate = Boolean(input.privateNote) && canReadLayer({
    readerOrganizationId: input.readerOrganizationId,
    noteOrganizationId: input.session.organizationId,
    role: input.role,
    layer: 'private',
  });
  return {
    organizationId: input.session.organizationId,
    workflowId: input.session.workflowId,
    titles: input.session.proposed.map((step) => step.title),
    includesPrivate: seesPrivate,
    toolsGranted: false,
  };
}

/** Company procedure never erases a legal step. */
export function legalConflict(session: ApprenticeshipSession, removedStepId: string): string | null {
  const step = session.baseline.find((item) => item.id === removedStepId);
  if (!step || step.requirement !== 'legal_requirement') return null;
  return `Qualified review required. “${step.title}” is marked as a legal requirement and was not removed.`;
}
