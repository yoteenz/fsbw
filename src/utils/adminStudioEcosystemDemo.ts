/** Studio OS Ecosystem v1.0 — demo seeds & UI config. */

import type { EcosystemStore } from '../studio-os-core/ecosystem/types';
import { buildEcosystemStorePatch } from '../workspaces/ai-media/ecosystem/bootstrap';

export const ADMIN_STUDIO_ECOSYSTEM_SUBTITLE =
  'BUSINESS OPERATING ECOSYSTEM — BLUEPRINTS · DNA · AUTOMATIONS · EXECUTIVES · NOT AN APP STORE';

export const ECOSYSTEM_INHERITANCE_CHAIN = [
  'ECOSYSTEM HUB',
  'PUBLISHING CENTER',
  'REVIEW & DEPENDENCIES',
  'INSTALLATION ENGINE',
  'CREATOR & DEVELOPER',
  'RECOMMENDATIONS',
  'ENTERPRISE LIBRARY',
  'KNOWLEDGE GRAPH',
] as const;

export type EcosystemTabId =
  | 'overview'
  | 'categories'
  | 'publishing'
  | 'review'
  | 'listings'
  | 'dependencies'
  | 'installation'
  | 'updates'
  | 'developer'
  | 'creator'
  | 'recommendations'
  | 'analytics'
  | 'enterprise'
  | 'community';

export const ECOSYSTEM_TABS: Array<{ id: EcosystemTabId; label: string }> = [
  { id: 'overview', label: 'ECOSYSTEM HUB' },
  { id: 'categories', label: 'CATEGORIES' },
  { id: 'publishing', label: 'PUBLISHING' },
  { id: 'review', label: 'REVIEW' },
  { id: 'listings', label: 'LISTINGS' },
  { id: 'dependencies', label: 'DEPENDENCIES' },
  { id: 'installation', label: 'INSTALLATION' },
  { id: 'updates', label: 'UPDATES' },
  { id: 'developer', label: 'DEVELOPER' },
  { id: 'creator', label: 'CREATOR' },
  { id: 'recommendations', label: 'RECOMMENDATIONS' },
  { id: 'analytics', label: 'ANALYTICS' },
  { id: 'enterprise', label: 'ENTERPRISE' },
  { id: 'community', label: 'COMMUNITY' },
];

export function buildDemoEcosystemStorePatch(): Partial<EcosystemStore> {
  return buildEcosystemStorePatch();
}
