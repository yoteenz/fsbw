import { OPERATING_AUTHORITY_STEPS } from '../research/operating-authority';
import { buildProposedMap } from '../review-engine';
import type { JournalDocument } from '../types';

export const AIO_ORGANIZATION_ID = 'all-in-one';
export const AIO_REVIEW_WORKFLOW_ID = 'operating-authority-application';

export const AIO_JOURNAL_BRAND = {
  productName: 'Workflow Journal',
  invitation: "Let's document how you get it done.",
  support: "We've prepared the typical process. Review it, make changes, and add what makes your approach different.",
  organizationName: 'All In One Enterprises',
  colors: {
    ivory: '#f6f1ea',
    champagne: '#e7d3a1',
    black: '#141414',
    gold: '#b8893a',
    silver: '#c5c6c4',
  },
} as const;

export function createOperatingAuthorityDraft(nowIso = '2026-10-09T00:00:00.000Z'): JournalDocument {
  const doc: JournalDocument = {
    id: 'journal-aio-operating-authority',
    organizationId: AIO_ORGANIZATION_ID,
    workflowId: AIO_REVIEW_WORKFLOW_ID,
    serviceFamilyId: 'permitting-authorities',
    expertLabel: 'Permitting lead',
    lifecycle: 'researched',
    steps: OPERATING_AUTHORITY_STEPS.map((step) => ({ ...step })),
    privateNotes: [],
    map: { status: 'proposed', executable: false, nodes: [] },
    workerUseGranted: false,
    updatedAt: nowIso,
    appliedMutationIds: [],
    persistence: 'device',
  };
  doc.map = buildProposedMap(doc);
  return doc;
}
