/** Milestone 90.5 — Organization Inauguration & Founder Ceremony V1.0 */

export const ORGANIZATION_INAUGURATION_STORAGE_KEY = 'studioOs_organizationInauguration_v1';
export const ORGANIZATION_INAUGURATION_VERSION = '1.0.0';

export const INAUGURATION_PHILOSOPHY = [
  'The founder has not completed onboarding — they have documented the DNA of their company.',
  'Studio OS celebrates the moment the organization\'s foundation is preserved.',
  'This is the official birth of an organization — not software setup.',
];

import { getBrandVoice, STUDIO_OS_OFFICIAL_TAGLINE } from '../brand-positioning';

export const INAUGURATION_TAGLINE = getBrandVoice('organization-inauguration');

export const INAUGURATION_MASTER_TAGLINE = STUDIO_OS_OFFICIAL_TAGLINE;

export const CEREMONIAL_LINES = [
  'Your Headquarters has been established.',
  'Your organization\'s foundation has been documented.',
  'Studio OS now understands how your company thinks.',
  'This is the beginning of your organization\'s digital legacy.',
] as const;

export const ENTER_HEADQUARTERS_LABEL = 'ENTER HEADQUARTERS';

/** Forbidden conclusion copy — breaks the ceremonial illusion. */
export const FORBIDDEN_CEREMONY_LABELS = ['Finish', 'Done', 'Continue', 'Close'] as const;

export const STUDIO_OS_INAUGURATION_ENTERED = 'studio-os-inauguration-entered';
export const STUDIO_OS_BLUEPRINT_READY_FOR_INAUGURATION = 'studio-os-blueprint-ready-for-inauguration';
