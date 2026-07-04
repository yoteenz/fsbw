/** Talent Network v1.0 — demo seeds & UI config. */

import type { TalentNetworkStore } from '../studio-os-core/talent-network/types';
import { buildTalentNetworkStorePatch } from '../workspaces/ai-media/talent-network/bootstrap';

export const ADMIN_STUDIO_TALENT_NETWORK_SUBTITLE =
  'UNIFIED TALENT OPERATING SYSTEM — AI + HUMAN · ONE REGISTRY · ONE ARCHITECTURE';

export const TALENT_NETWORK_INHERITANCE_CHAIN = [
  'TALENT REGISTRY',
  'AI & HUMAN PROFILES',
  'WARDROBE MANAGER',
  'CASTING SYSTEM',
  'SERIES ASSIGNMENT',
  'PERFORMANCE & SCORE',
  'GROWTH NETWORK',
  'KNOWLEDGE GRAPH',
] as const;

export type TalentNetworkTabId =
  | 'overview'
  | 'active-productions'
  | 'performance'
  | 'analytics'
  | 'wardrobe'
  | 'contracts'
  | 'earnings'
  | 'campaigns'
  | 'availability'
  | 'growth'
  | 'auditions'
  | 'casting'
  | 'history'
  | 'versioning';

export const TALENT_NETWORK_TABS: Array<{ id: TalentNetworkTabId; label: string }> = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'active-productions', label: 'ACTIVE PRODUCTIONS' },
  { id: 'performance', label: 'PERFORMANCE' },
  { id: 'analytics', label: 'ANALYTICS' },
  { id: 'wardrobe', label: 'WARDROBE' },
  { id: 'contracts', label: 'CONTRACTS' },
  { id: 'earnings', label: 'EARNINGS' },
  { id: 'campaigns', label: 'CAMPAIGNS' },
  { id: 'availability', label: 'AVAILABILITY' },
  { id: 'growth', label: 'GROWTH' },
  { id: 'auditions', label: 'AUDITIONS' },
  { id: 'casting', label: 'CASTING' },
  { id: 'history', label: 'HISTORY' },
  { id: 'versioning', label: 'VERSIONING' },
];

export function buildDemoTalentNetworkStorePatch(): Partial<TalentNetworkStore> {
  return buildTalentNetworkStorePatch();
}
