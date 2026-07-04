/**
 * studio os Workspace schema — industry-agnostic workspace model.
 */

import type { StudioOsCoreModuleId } from '../core/modules';

export type WorkspaceId = string;

export type WorkspaceStatus = 'active' | 'placeholder' | 'archived';

export type WorkspaceBrandColors = {
  primary: string;
  accent: string;
  secondary?: string;
};

export type WorkspaceTypography = {
  labelFont: string;
  accentFont: string;
};

export type WorkspacePermissions = {
  canSwitchWorkspace: boolean;
  canEditBrand: boolean;
  canManageUsers: boolean;
  canAccessStudioModules: boolean;
};

export type WorkspaceModuleCopy = Partial<
  Record<
    StudioOsCoreModuleId,
    {
      title?: string;
      subtitle?: string;
    }
  >
> & {
  studioHub?: {
    title?: string;
    subtitle?: string;
    dashboardFooter?: string;
  };
};

/** Workspace-level brand and operational configuration (no industry assumptions in schema). */
export type WorkspaceSchema = {
  id: WorkspaceId;
  slug: WorkspaceId;
  brandName: string;
  displayName: string;
  status: WorkspaceStatus;
  logoSrc: string;
  colors: WorkspaceBrandColors;
  typography: WorkspaceTypography;
  brandVoice: string;
  brandRules: string[];
  permissions: WorkspacePermissions;
  moduleCopy: WorkspaceModuleCopy;
  /** Whether this workspace loads the full Studio module tree. */
  studioEnabled: boolean;
  /** Entry route after workspace selection (workspace-relative). */
  studioEntryPath: string;
  metadata: {
    industry?: string;
    description: string;
    tags: string[];
  };
};

export type WorkspaceListItem = Pick<
  WorkspaceSchema,
  'id' | 'displayName' | 'brandName' | 'status' | 'logoSrc' | 'studioEnabled' | 'metadata'
>;
