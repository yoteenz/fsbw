import { STUDIO_OS_PLATFORM_ASSETS } from '../core/assets';
import type { WorkspaceSchema } from '../workspace/types';
import { DEFAULT_WORKSPACE_PERMISSIONS } from '../workspace/permissions';
import type { WorkspaceRegistryRecord } from './types';

/** Convert a provisioned workspace registry record into a runtime WorkspaceSchema. */
export function registryRecordToWorkspaceSchema(record: WorkspaceRegistryRecord): WorkspaceSchema {
  return {
    id: record.id,
    slug: record.slug,
    brandName: record.name.toUpperCase(),
    displayName: record.name.toUpperCase(),
    status: record.deploymentStage === 'archived' ? 'archived' : 'active',
    logoSrc: record.logoSrc || record.icon || STUDIO_OS_PLATFORM_ASSETS.placeholderThumb,
    colors: {
      primary: record.branding.primaryColor,
      accent: record.accentColor,
      secondary: record.branding.secondaryColor,
    },
    typography: {
      labelFont: record.branding.typography || 'Futura PT',
      accentFont: 'Covered By Your Grace',
    },
    brandVoice: record.description,
    brandRules: [
      `${record.workspaceType.toUpperCase()} WORKSPACE · ${record.blueprintId}`,
      record.isReferencePilot ? 'REFERENCE PILOT — VALIDATE BEFORE PRODUCTION PROMOTION' : '',
    ].filter(Boolean),
    permissions: {
      ...DEFAULT_WORKSPACE_PERMISSIONS,
      canAccessStudioModules: true,
    },
    moduleCopy: {
      'mission-control': {
        title: `${record.name.toUpperCase()} MISSION CONTROL`,
        subtitle: record.description,
      },
    },
    studioEnabled: true,
    studioEntryPath: `/admin/studio-os/workspace/${record.slug}/dashboard`,
    metadata: {
      industry: record.blueprintId,
      description: record.description,
      tags: record.isReferencePilot ? ['pilot', 'reference', record.workspaceType] : [record.workspaceType],
    },
  };
}

export function isProvisionedWorkspaceActive(record: WorkspaceRegistryRecord): boolean {
  return (
    record.deploymentStage !== 'planning' &&
    record.deploymentStage !== 'provisioning' &&
    record.deploymentStage !== 'archived'
  );
}

export function workspaceDashboardPath(slug: string): string {
  return `/admin/studio-os/workspace/${slug}/dashboard`;
}
