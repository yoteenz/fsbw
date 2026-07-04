/** AI Media Network v1.0 — demo seeds & UI config. */

import type { AiMediaNetworkStore } from '../studio-os-core/ai-media-network/types';
import { buildAiMediaNetworkStorePatch } from '../workspaces/ai-media/network/bootstrap';

export const ADMIN_STUDIO_AI_MEDIA_NETWORK_SUBTITLE =
  'DIGITAL MEDIA NETWORK — TV NETWORK + AI PUBLISHING COMPANY · AI MEDIA PILOT · EVERY EPISODE TEACHES STUDIO OS';

export const AI_MEDIA_NETWORK_INHERITANCE_CHAIN = [
  'COMPANY DNA',
  'CONTENT PILLARS',
  'PROGRAMMING NETWORK',
  'SERIES MANAGEMENT',
  'CONTENT CALENDAR',
  'CROSS-PLATFORM',
  'MONETIZATION',
  'STUDIO OS LABS',
  'KNOWLEDGE GRAPH',
] as const;

export type AiMediaNetworkTabId =
  | 'overview'
  | 'company-dna'
  | 'pillars'
  | 'programming'
  | 'series'
  | 'calendar'
  | 'cross-platform'
  | 'monetization'
  | 'labs';

export const AI_MEDIA_NETWORK_TABS: Array<{ id: AiMediaNetworkTabId; label: string }> = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'company-dna', label: 'COMPANY DNA' },
  { id: 'pillars', label: 'PILLARS' },
  { id: 'programming', label: 'PROGRAMMING' },
  { id: 'series', label: 'SERIES MGMT' },
  { id: 'calendar', label: 'CALENDAR' },
  { id: 'cross-platform', label: 'CROSS-PLATFORM' },
  { id: 'monetization', label: 'MONETIZATION' },
  { id: 'labs', label: 'LABS INTEGRATION' },
];

export function buildDemoAiMediaNetworkStorePatch(): Partial<AiMediaNetworkStore> {
  return buildAiMediaNetworkStorePatch();
}
