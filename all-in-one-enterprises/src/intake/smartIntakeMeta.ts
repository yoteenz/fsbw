import type { IntakeSection } from './intakeTypes';

/** Journey rail + workspace metadata keyed by section id (actual workflow truth). */
export interface SmartIntakeStepMeta {
  journeyLabel: string;
  journeySubtitle: string;
  workspaceTitle: string;
  workspaceDescription: string;
}

const SECTION_META: Record<string, SmartIntakeStepMeta> = {
  goal: {
    journeyLabel: 'journey.goal.label',
    journeySubtitle: 'journey.goal.subtitle',
    workspaceTitle: 'steps.goal.title',
    workspaceDescription: 'steps.goal.description',
  },
  journey: {
    journeyLabel: 'journey.status.label',
    journeySubtitle: 'journey.status.subtitle',
    workspaceTitle: 'steps.journey.title',
    workspaceDescription: 'steps.journey.description',
  },
  business: {
    journeyLabel: 'journey.business.label',
    journeySubtitle: 'journey.business.subtitle',
    workspaceTitle: 'steps.business.title',
    workspaceDescription: 'steps.business.description',
  },
  operating: {
    journeyLabel: 'journey.operating.label',
    journeySubtitle: 'journey.operating.subtitle',
    workspaceTitle: 'steps.operating.title',
    workspaceDescription: 'steps.operating.description',
  },
  assets: {
    journeyLabel: 'journey.assets.label',
    journeySubtitle: 'journey.assets.subtitle',
    workspaceTitle: 'steps.assets.title',
    workspaceDescription: 'steps.assets.description',
  },
  pain_points: {
    journeyLabel: 'journey.painPoints.label',
    journeySubtitle: 'journey.painPoints.subtitle',
    workspaceTitle: 'steps.painPoints.title',
    workspaceDescription: 'steps.painPoints.description',
  },
  factoring_branch: {
    journeyLabel: 'journey.factoring.label',
    journeySubtitle: 'journey.factoring.subtitle',
    workspaceTitle: 'steps.factoring.title',
    workspaceDescription: 'steps.factoring.description',
  },
  insurance_branch: {
    journeyLabel: 'journey.insurance.label',
    journeySubtitle: 'journey.insurance.subtitle',
    workspaceTitle: 'steps.insurance.title',
    workspaceDescription: 'steps.insurance.description',
  },
  shipper: {
    journeyLabel: 'journey.shipper.label',
    journeySubtitle: 'journey.shipper.subtitle',
    workspaceTitle: 'steps.shipper.title',
    workspaceDescription: 'steps.shipper.description',
  },
  contact: {
    journeyLabel: 'journey.contact.label',
    journeySubtitle: 'journey.contact.subtitle',
    workspaceTitle: 'steps.contact.title',
    workspaceDescription: 'steps.contact.description',
  },
};

export function getSmartIntakeStepMeta(section: IntakeSection): SmartIntakeStepMeta {
  return (
    SECTION_META[section.id] ?? {
      journeyLabel: section.title,
      journeySubtitle: section.description ?? '',
      workspaceTitle: section.title,
      workspaceDescription: section.description ?? '',
    }
  );
}

/** Visual layout hint for single-select questions in Smart Intake. */
export type SmartIntakeChoiceLayout = 'goal' | 'structure' | 'compact' | 'default';

export function choiceLayoutForQuestion(questionId: string, field: string): SmartIntakeChoiceLayout {
  if (questionId === 'goal' || questionId === 'journey') return 'goal';
  if (field === 'business.structure') return 'structure';
  if (field === 'business.operationType' || field.startsWith('operating.') || field.startsWith('assets.')) return 'compact';
  return 'default';
}
