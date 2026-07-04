/** Marketplace v1.0 — demo seeds & UI config. */

import type { MarketplaceStore } from '../studio-os-core/marketplace/types';
import { buildMarketplaceStorePatch } from '../workspaces/ai-media/marketplace/bootstrap';

export const ADMIN_STUDIO_MARKETPLACE_SUBTITLE =
  'PROFESSIONAL OPERATING NETWORK — DISCOVER · COLLABORATE · HIRE · GROW · NOT A FREELANCER MARKETPLACE';

export const MARKETPLACE_INHERITANCE_CHAIN = [
  'PARTICIPANT PROFILES',
  'INTELLIGENT MATCHING',
  'DEAL CENTER',
  'COLLABORATION HUB',
  'TRUST & VERIFICATION',
  'PAYMENT ARCHITECTURE',
  'BUSINESS ECOSYSTEM',
  'KNOWLEDGE GRAPH',
] as const;

export type MarketplaceTabId =
  | 'overview'
  | 'participants'
  | 'matching'
  | 'deal-center'
  | 'collaboration'
  | 'trust'
  | 'verification'
  | 'pricing'
  | 'payments'
  | 'ecosystem'
  | 'relationships'
  | 'reviews'
  | 'deals'
  | 'history';

export const MARKETPLACE_TABS: Array<{ id: MarketplaceTabId; label: string }> = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'participants', label: 'PARTICIPANTS' },
  { id: 'matching', label: 'MATCHING' },
  { id: 'deal-center', label: 'DEAL CENTER' },
  { id: 'collaboration', label: 'COLLABORATION' },
  { id: 'trust', label: 'TRUST' },
  { id: 'verification', label: 'VERIFICATION' },
  { id: 'pricing', label: 'PRICING' },
  { id: 'payments', label: 'PAYMENTS' },
  { id: 'ecosystem', label: 'ECOSYSTEM' },
  { id: 'relationships', label: 'RELATIONSHIPS' },
  { id: 'reviews', label: 'REVIEWS' },
  { id: 'deals', label: 'ACTIVE DEALS' },
  { id: 'history', label: 'HISTORY' },
];

export function buildDemoMarketplaceStorePatch(): Partial<MarketplaceStore> {
  return buildMarketplaceStorePatch();
}
