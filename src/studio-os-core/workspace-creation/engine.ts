/**
 * Workspace Creation Engine — provision companies from blueprints.
 */

import { getBlueprintById } from './blueprints';
import { buildExecutiveTeamForBlueprint } from './executiveTeam';
import type {
  WorkspaceBranding,
  WorkspaceCreationDraft,
  WorkspaceRegistryRecord,
  WorkspaceType,
  BlueprintModuleId,
} from './types';

export const STUDIO_OS_PLACEHOLDER_LOGO = '/assets/marble-half.png';
export const STUDIO_OS_PLACEHOLDER_COVER = '/assets/marble-half.png';

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

function defaultBranding(_blueprintId: string, accent: string): WorkspaceBranding {
  return {
    theme: 'studio-os-glass',
    typography: 'Futura PT',
    primaryColor: accent,
    secondaryColor: '#808080',
    glassStyle: 'marble-white-60-blur',
    buttonStyle: 'futura-uppercase-red',
    panelStyle: 'white-60-border-black',
  };
}

export type CreateWorkspaceInput = WorkspaceCreationDraft & {
  owner?: string;
  isReferencePilot?: boolean;
  slugOverride?: string;
};

export function buildWorkspaceFromDraft(input: CreateWorkspaceInput): WorkspaceRegistryRecord {
  const blueprint = getBlueprintById(input.blueprintId);
  if (!blueprint) {
    throw new Error(`Unknown blueprint: ${input.blueprintId}`);
  }

  const now = new Date().toISOString();
  const slug = input.slugOverride ?? slugify(input.name);
  const id = slug;
  const accent = input.accentColor || blueprint.defaultAccentColor;
  const enabledModules: BlueprintModuleId[] = [
    ...blueprint.requiredModules,
    ...input.enabledOptionalModules.filter((m) => blueprint.optionalModules.includes(m)),
    'growth-network',
  ];

  return {
    id,
    name: input.name,
    slug,
    description: input.description,
    icon: input.icon || blueprint.icon,
    coverImage: input.coverImage || STUDIO_OS_PLACEHOLDER_COVER,
    accentColor: accent,
    owner: input.owner ?? 'VXD Inc. · Founder',
    blueprintId: input.blueprintId,
    workspaceType: input.workspaceType,
    deploymentStage: 'provisioning',
    version: '1.0',
    createdAt: now,
    updatedAt: now,
    branding: input.branding ?? {
      ...defaultBranding(input.blueprintId, accent),
      ...blueprint.defaultBranding,
      primaryColor: accent,
    },
    enabledModules: [...new Set(enabledModules)],
    requiredModules: [...blueprint.requiredModules],
    isReferencePilot: input.isReferencePilot ?? input.workspaceType === 'pilot',
    executiveTeamId: `exec-team-${slug}`,
    logoSrc: input.logoSrc || STUDIO_OS_PLACEHOLDER_LOGO,
  };
}

export function finalizeProvisionedWorkspace(record: WorkspaceRegistryRecord): WorkspaceRegistryRecord {
  const stage =
    record.workspaceType === 'pilot'
      ? 'pilot'
      : record.workspaceType === 'production'
        ? 'production'
        : 'active-development';

  return {
    ...record,
    deploymentStage: stage,
    updatedAt: new Date().toISOString(),
  };
}

/** Pre-filled draft for the permanent AI Media pilot workspace. */
export function buildAiMediaPilotDraft(): CreateWorkspaceInput {
  return {
    blueprintId: 'ai-media-company',
    name: 'AI Media',
    description:
      'AI-powered educational media company producing highly engaging short-form content across multiple social platforms. Permanent pilot workspace — validates every production system inside studio os before promotion into Frontal Slayer.',
    logoSrc: STUDIO_OS_PLACEHOLDER_LOGO,
    icon: '🎬',
    coverImage: STUDIO_OS_PLACEHOLDER_COVER,
    accentColor: '#6366F1',
    workspaceType: 'pilot' as WorkspaceType,
    enabledOptionalModules: [
      'campaigns',
      'asset-factory',
      'distribution',
      'analytics',
      'revenue',
      'social-accounts',
      'system-health',
      'automation',
      'prompt-library',
      'approval-workflows',
    ],
    branding: {
      theme: 'studio-os-glass',
      typography: 'Futura PT',
      primaryColor: '#6366F1',
      secondaryColor: '#808080',
      glassStyle: 'marble-white-60-blur',
      buttonStyle: 'futura-uppercase-indigo',
      panelStyle: 'white-60-border-black',
    },
    owner: 'VXD Inc. · Founder',
    isReferencePilot: true,
    slugOverride: 'ai-media',
  };
}

export function getExecutiveTeamForWorkspace(record: WorkspaceRegistryRecord) {
  return buildExecutiveTeamForBlueprint(record.id, record.blueprintId);
}
