import { canSwitchOrganizations } from '../application/portfolio-access';
import type { TimelineOrganizationId } from '../executive-timeline/types';
import { resolveModuleTenantId, type ModuleTenantId } from '../workspace/tenant-ids';
import { readActiveWorkspaceIdFromStorage } from '../workspace/storage';
import type { WorkspaceSchema } from '../workspace/types';
import {
  getOrganizationConcierges,
  getOrganizationExecutives,
  getOrganizationKnowledge,
} from './org-profiles';
import type { ActiveOrganizationContext } from './types';

const PLATFORM_TO_TIMELINE_ORG: Record<string, TimelineOrganizationId> = {
  'frontal-slayer': 'frontal-slayer',
  'ai-media': 'ndxbook',
  'vxd-inc': 'vxd-inc',
  'all-in-one-enterprise': 'all-in-one-enterprise',
};

export function resolveTimelineOrganizationId(platformWorkspaceId: string): TimelineOrganizationId {
  return PLATFORM_TO_TIMELINE_ORG[platformWorkspaceId] ?? 'frontal-slayer';
}

export function getActiveModuleTenantId(): ModuleTenantId {
  return resolveModuleTenantId(readActiveWorkspaceIdFromStorage());
}

export function getActivePlatformOrganizationId(): string {
  return readActiveWorkspaceIdFromStorage();
}

export function buildActiveOrganizationContext(
  workspace: WorkspaceSchema,
  moduleTenantId: ModuleTenantId,
  resolveModulePath: (segment: string) => string,
  studioEntryPath: string
): ActiveOrganizationContext {
  const timelineOrganizationId = resolveTimelineOrganizationId(workspace.id);

  return {
    organizationId: workspace.id,
    moduleTenantId,
    timelineOrganizationId,
    organizationName: workspace.displayName,
    organizationBrand: {
      brandName: workspace.brandName,
      displayName: workspace.displayName,
      colors: workspace.colors,
      typography: workspace.typography,
      brandVoice: workspace.brandVoice,
      logoSrc: workspace.logoSrc,
    },
    organizationGenome: {
      industry: workspace.metadata.industry,
      brandVoice: workspace.brandVoice,
      brandRules: workspace.brandRules,
      dnaLayers: ['company', 'creative', 'leadership', 'operational', 'writing'],
    },
    organizationSettings: {
      industry: workspace.metadata.industry,
      description: workspace.metadata.description,
      tags: workspace.metadata.tags,
    },
    organizationPermissions: workspace.permissions,
    organizationExecutives: getOrganizationExecutives(moduleTenantId),
    organizationConcierges: getOrganizationConcierges(moduleTenantId),
    organizationKnowledge: getOrganizationKnowledge(moduleTenantId).map((entry) => ({
      ...entry,
      route: entry.route ? resolveModulePath(entry.route) : undefined,
    })),
    studioModulePath: resolveModulePath,
    studioEntryPath,
    accentColor: workspace.colors.primary,
    isPortfolioAdministration: canSwitchOrganizations(),
  };
}
