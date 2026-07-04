/** Studio OS Governance Engine v1.0 — demo seeds & UI config. */

import type { GovernanceStore } from '../studio-os-core/governance/types';
import { buildGovernanceStorePatch } from '../workspaces/ai-media/governance/bootstrap';

export const ADMIN_STUDIO_GOVERNANCE_SUBTITLE =
  'TRUST · QUALITY · COMPLIANCE · MODERATION · VERIFICATION · ECOSYSTEM HEALTH · PLATFORM CONSTITUTION';

export const GOVERNANCE_INHERITANCE_CHAIN = [
  'GOVERNANCE DASHBOARD',
  'TRUST & VERIFICATION',
  'QUALITY & CERTIFICATION',
  'MODERATION & POLICY',
  'APPEALS & FRAUD',
  'REPUTATION & HEALTH',
  'AI GOVERNANCE',
  'AUDIT & ENTERPRISE',
  'KNOWLEDGE GRAPH',
] as const;

export type GovernanceTabId =
  | 'overview'
  | 'trust'
  | 'verification'
  | 'quality'
  | 'certifications'
  | 'moderation'
  | 'policy'
  | 'appeals'
  | 'fraud'
  | 'reputation'
  | 'ecosystem-health'
  | 'ai-governance'
  | 'audit'
  | 'enterprise';

export const GOVERNANCE_TABS: Array<{ id: GovernanceTabId; label: string }> = [
  { id: 'overview', label: 'GOVERNANCE DASHBOARD' },
  { id: 'trust', label: 'TRUST ENGINE' },
  { id: 'verification', label: 'VERIFICATION' },
  { id: 'quality', label: 'QUALITY ASSURANCE' },
  { id: 'certifications', label: 'CERTIFICATIONS' },
  { id: 'moderation', label: 'MODERATION' },
  { id: 'policy', label: 'POLICY ENGINE' },
  { id: 'appeals', label: 'APPEALS' },
  { id: 'fraud', label: 'FRAUD DETECTION' },
  { id: 'reputation', label: 'REPUTATION' },
  { id: 'ecosystem-health', label: 'ECOSYSTEM HEALTH' },
  { id: 'ai-governance', label: 'AI GOVERNANCE' },
  { id: 'audit', label: 'AUDIT CENTER' },
  { id: 'enterprise', label: 'ENTERPRISE' },
];

export function buildDemoGovernanceStorePatch(): Partial<GovernanceStore> {
  return buildGovernanceStorePatch();
}
