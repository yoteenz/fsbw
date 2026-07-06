import { SDK_REGISTRATION_CAPABILITIES } from './constants';
import type { SdkCapabilityEntry, SdkRegistrationCapability } from './types';

const CAPABILITY_META: Record<
  SdkRegistrationCapability,
  { label: string; description: string; registeredCount: number }
> = {
  'register-pages': {
    label: 'Register Pages',
    description: 'Add routes and admin pages as first-class Studio OS surfaces.',
    registeredCount: 12,
  },
  'register-components': {
    label: 'Register Components',
    description: 'Contribute UI to Component Registry™ with token inheritance.',
    registeredCount: 28,
  },
  'register-commands': {
    label: 'Register Commands',
    description: 'Expose Command Dock skills and named executive commands.',
    registeredCount: 18,
  },
  'register-automations': {
    label: 'Register Automations',
    description: 'Publish automation actions through Automation Registry™.',
    registeredCount: 14,
  },
  'register-events': {
    label: 'Register Events',
    description: 'Publish and subscribe via Event Bus™ — no direct coupling.',
    registeredCount: 22,
  },
  'register-permissions': {
    label: 'Register Permissions',
    description: 'Declare capability modules for Permission Engine™.',
    registeredCount: 16,
  },
  'register-policies': {
    label: 'Register Policies',
    description: 'Contribute policy templates to Policy Engine™.',
    registeredCount: 9,
  },
  'register-assets': {
    label: 'Register Assets',
    description: 'Add visual assets to Asset Director and brand libraries.',
    registeredCount: 34,
  },
  'register-documentation': {
    label: 'Register Documentation',
    description: 'Sync help content to Documentation Registry™ automatically.',
    registeredCount: 11,
  },
  'register-academy-lessons': {
    label: 'Register Academy Lessons',
    description: 'Publish Studio Institute™ courses from plugin knowledge.',
    registeredCount: 7,
  },
  'register-search-entries': {
    label: 'Register Search Entries',
    description: 'Index plugin surfaces in System Registry™ discovery.',
    registeredCount: 19,
  },
  'register-tooltips': {
    label: 'Register Tooltips',
    description: 'Contextual help tooltips via Knowledge Hub page guides.',
    registeredCount: 24,
  },
};

export function buildSdkCapabilities(): SdkCapabilityEntry[] {
  return SDK_REGISTRATION_CAPABILITIES.map((capabilityId) => ({
    capabilityId,
    firstClassCitizen: true as const,
    ...CAPABILITY_META[capabilityId],
  }));
}

export function countRegisteredCapabilities(): number {
  return buildSdkCapabilities().reduce((sum, c) => sum + c.registeredCount, 0);
}
