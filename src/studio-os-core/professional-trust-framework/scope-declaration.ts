import type { OrganizationProfessionBrain } from '../profession-brain/types';
import type { ProfessionalScope } from './types';

const BRAIN_SCOPE_OVERRIDES: Partial<
  Record<string, Pick<ProfessionalScope, 'canDo' | 'cannotDo' | 'reviewRecommended' | 'reviewRequired'>>
> = {
  'fuel-tax': {
    canDo: [
      'Organize receipts and mileage documentation',
      'Prepare quarterly filing worksheets',
      'Explain compliance requirements',
      'Flag reconciliation exceptions',
    ],
    cannotDo: [
      'File returns as a licensed tax professional',
      'Provide legal tax advice without review',
      'Sign or submit on behalf of a licensed preparer',
    ],
    reviewRecommended: ['Complex multi-state filings', 'Audit responses', 'Amended returns'],
    reviewRequired: ['Final submission to tax authorities', 'Penalty abatement requests'],
  },
  'legal-intake': {
    canDo: ['Collect intake information', 'Organize case facts', 'Route to appropriate attorney'],
    cannotDo: ['Provide legal advice', 'Interpret statutes for clients', 'Represent clients in court'],
    reviewRecommended: ['Conflict checks', 'Jurisdiction questions'],
    reviewRequired: ['Any legal opinion', 'Contract review', 'Filing legal documents'],
  },
  bookkeeping: {
    canDo: ['Categorize transactions', 'Prepare reconciliation reports', 'Organize documentation'],
    cannotDo: ['Sign audited financial statements', 'Provide CPA attestations'],
    reviewRecommended: ['Year-end close', 'Complex adjustments'],
    reviewRequired: ['Tax return preparation', 'Regulatory filings'],
  },
  'hair-color': {
    canDo: ['Educate on color theory', 'Prepare consultation notes', 'Recommend preparation steps'],
    cannotDo: ['Diagnose scalp conditions', 'Prescribe medical treatments'],
    reviewRecommended: ['Chemical sensitivity concerns', 'Severe damage assessment'],
    reviewRequired: ['Medical scalp conditions'],
  },
  marketing: {
    canDo: ['Draft campaign concepts', 'Organize brand voice guidelines', 'Prepare content calendars'],
    cannotDo: ['Guarantee regulatory compliance for all industries without review'],
    reviewRecommended: ['Regulated industry advertising', 'Health claims'],
    reviewRequired: ['Financial services marketing', 'Medical advertising'],
  },
};

const DEFAULT_SCOPE = {
  canDo: ['Educate from organizational expertise', 'Prepare workflows and checklists', 'Organize documentation'],
  cannotDo: ['Replace licensed professional judgment', 'Misrepresent organizational authority'],
  reviewRecommended: ['High-stakes customer decisions', 'Regulated industry actions'],
  reviewRequired: ['Licensed professional services', 'Final regulatory submissions'],
};

export function buildProfessionalScope(
  brain: OrganizationProfessionBrain,
  industryId: string
): ProfessionalScope {
  const override = BRAIN_SCOPE_OVERRIDES[brain.definitionId];
  const base = override ?? DEFAULT_SCOPE;

  const regulated = ['law-firm', 'medical', 'dental', 'financial-services', 'insurance'].includes(industryId);
  const reviewRequired = regulated
    ? [...base.reviewRequired, 'Licensed professional sign-off on regulated outcomes']
    : base.reviewRequired;

  return {
    brainId: brain.id,
    canDo: base.canDo,
    cannotDo: base.cannotDo,
    reviewRecommended: base.reviewRecommended,
    reviewRequired: reviewRequired,
    internalVisible: true,
    externalVisible: true,
  };
}
