/**
 * Feature inheritance — every organization automatically receives platform capabilities.
 * Modules are dynamically instantiated per workspace; no company-specific implementations.
 */

import type { StudioOsCoreModuleId } from '../core/modules';

export type InheritedPlatformCapability = {
  id: StudioOsCoreModuleId | string;
  label: string;
  category: 'headquarters' | 'production' | 'publishing' | 'intelligence' | 'automation' | 'institute';
};

/** Capabilities every organization inherits from Studio OS on provisioning. */
export const INHERITED_PLATFORM_CAPABILITIES: readonly InheritedPlatformCapability[] = [
  { id: 'mission-control', label: 'Mission Control', category: 'headquarters' },
  { id: 'production-studio', label: 'Production Studio', category: 'production' },
  { id: 'render-queue', label: 'Render Queue', category: 'production' },
  { id: 'screening-room', label: 'Screening Room', category: 'production' },
  { id: 'distribution-engine', label: 'Publishing', category: 'publishing' },
  { id: 'distribution-network', label: 'Distribution Network', category: 'publishing' },
  { id: 'publishing-queue', label: 'Publishing Queue', category: 'publishing' },
  { id: 'intelligence-engine', label: 'Analytics', category: 'intelligence' },
  { id: 'asset-library', label: 'Library', category: 'production' },
  { id: 'knowledge-hub', label: 'Knowledge', category: 'intelligence' },
  { id: 'studio-institute', label: 'Institute', category: 'institute' },
  { id: 'executive-council', label: 'Executive Council', category: 'headquarters' },
  { id: 'executive-timeline', label: 'Executive Timeline', category: 'headquarters' },
  { id: 'concierge-routing', label: 'Concierge Routing', category: 'headquarters' },
  { id: 'command-dock', label: 'Command Dock', category: 'headquarters' },
  { id: 'concierge-layer', label: 'Concierge Team', category: 'headquarters' },
  { id: 'campaign-engine', label: 'Campaign Engine', category: 'automation' },
  { id: 'work-orchestration', label: 'Automation', category: 'automation' },
  { id: 'revenue', label: 'Revenue', category: 'intelligence' },
] as const;

export type WorkspaceFeatureManifest = {
  workspaceId: string;
  inheritedCapabilities: InheritedPlatformCapability[];
  provisionedAt: string;
};

/** Build the feature manifest for a newly provisioned organization workspace. */
export function buildInheritedFeatureManifest(workspaceId: string): WorkspaceFeatureManifest {
  return {
    workspaceId,
    inheritedCapabilities: [...INHERITED_PLATFORM_CAPABILITIES],
    provisionedAt: new Date().toISOString(),
  };
}

export function listCapabilitiesByCategory(
  category: InheritedPlatformCapability['category']
): InheritedPlatformCapability[] {
  return INHERITED_PLATFORM_CAPABILITIES.filter((c) => c.category === category);
}
