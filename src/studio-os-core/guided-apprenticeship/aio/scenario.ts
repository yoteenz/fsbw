import type { PracticeStep } from '../types';

/** First pilot content. Not part of the reusable core vocabulary. */
export const AIO_ORGANIZATION_ID = 'all-in-one';
export const AIO_AUTHORITY_WORKFLOW_ID = 'operating-authority-application';

export const AIO_AUTHORITY_BASELINE: PracticeStep[] = [
  {
    id: 'collect',
    order: 1,
    title: 'Collect client information',
    surfaceId: 'intake',
    requirement: 'industry_practice',
    sourceIds: ['fmcsa-operating-authority'],
  },
  {
    id: 'prepare',
    order: 2,
    title: 'Prepare application',
    surfaceId: 'application',
    requirement: 'industry_practice',
    sourceIds: ['fmcsa-operating-authority'],
  },
  {
    id: 'verify',
    order: 3,
    title: 'Verify details',
    surfaceId: 'review',
    requirement: 'industry_practice',
    sourceIds: ['fmcsa-operating-authority'],
  },
  {
    id: 'submit',
    order: 4,
    title: 'Review and submit',
    surfaceId: 'application',
    requirement: 'legal_requirement',
    sourceIds: ['fmcsa-operating-authority'],
  },
];

export const SAMPLE_CLIENT = {
  name: 'Northline Hauling (sample)',
  note: 'Fictional practice record. Not a customer.',
};
