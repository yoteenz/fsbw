/** Business Model Engine v1.0 — demo seeds & UI config. */

import type { BusinessModelEngineStore } from '../studio-os-core/business-model-engine/types';
import { buildBusinessModelEngineStorePatch } from '../workspaces/ai-media/business-model-engine/bootstrap';

export const ADMIN_STUDIO_BME_SUBTITLE =
  'ECONOMIC ENGINE — SUBSCRIPTIONS · MARKETPLACE · ROYALTIES · WALLETS · ENTERPRISE · ALIGNED INCENTIVES';

export const BME_INHERITANCE_CHAIN = [
  'MEMBERSHIP ENGINE',
  'WORKSPACE BILLING',
  'USAGE & FEES',
  'PAYMENT ARCHITECTURE',
  'WALLETS & ROYALTIES',
  'ASSET MARKETPLACES',
  'ECONOMIC DASHBOARD',
  'KNOWLEDGE GRAPH',
] as const;

export type BusinessModelEngineTabId =
  | 'overview'
  | 'membership'
  | 'billing'
  | 'usage'
  | 'fees'
  | 'payments'
  | 'wallets'
  | 'affiliates'
  | 'royalties'
  | 'marketplaces'
  | 'enterprise'
  | 'certifications'
  | 'economics'
  | 'ecosystem';

export const BME_TABS: Array<{ id: BusinessModelEngineTabId; label: string }> = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'membership', label: 'MEMBERSHIP' },
  { id: 'billing', label: 'BILLING' },
  { id: 'usage', label: 'USAGE' },
  { id: 'fees', label: 'PLATFORM FEES' },
  { id: 'payments', label: 'PAYMENTS' },
  { id: 'wallets', label: 'WALLETS' },
  { id: 'affiliates', label: 'AFFILIATES' },
  { id: 'royalties', label: 'ROYALTIES' },
  { id: 'marketplaces', label: 'ASSET MARKETS' },
  { id: 'enterprise', label: 'ENTERPRISE' },
  { id: 'certifications', label: 'CERTIFICATIONS' },
  { id: 'economics', label: 'ECONOMICS' },
  { id: 'ecosystem', label: 'ECOSYSTEM HEALTH' },
];

export function buildDemoBusinessModelEngineStorePatch(): Partial<BusinessModelEngineStore> {
  return buildBusinessModelEngineStorePatch();
}
