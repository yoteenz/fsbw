import type { CanonicalMainDepartmentId } from './canonical-department-registry';

export const SHELL_PROFILE_VERSION = 'shell-profile.v1' as const;

export type CommandDockShellProfile = {
  profileId: string;
  departmentId: CanonicalMainDepartmentId;
  contextModules: string[];
  physicalElements: string[];
};

export type WorkbenchShellProfile = {
  profileId: string;
  departmentId: CanonicalMainDepartmentId;
  toolModules: string[];
  physicalElements: string[];
};

export const COMMAND_DOCK_SHELL_PROFILES: Record<string, CommandDockShellProfile> = {
  'el-command-dock.v1': {
    profileId: 'el-command-dock.v1',
    departmentId: 'experience-lab',
    contextModules: ['world-registry-context', 'blueprint-context', 'revision-context', 'permit-status', 'cost-forecast'],
    physicalElements: ['glass-deck', 'chrome-rail', 'blank-status-zones', 'blank-navigation-rails'],
  },
  'cds-command-dock.v1': {
    profileId: 'cds-command-dock.v1',
    departmentId: 'creative-director-studio',
    contextModules: ['project-context', 'selected-asset', 'manufacturing-status', 'approvals', 'render-queue'],
    physicalElements: ['glass-deck', 'embedded-displays', 'blank-button-housings'],
  },
  'cc-command-dock.v1': {
    profileId: 'cc-command-dock.v1',
    departmentId: 'command-center',
    contextModules: ['global-operating-state', 'alerts', 'infrastructure-health', 'active-incidents'],
    physicalElements: ['command-bridge-console', 'blank-alert-surfaces', 'blank-metric-zones'],
  },
  'council-command-dock.v1': {
    profileId: 'council-command-dock.v1',
    departmentId: 'city-council',
    contextModules: ['jurisdiction', 'permit-class', 'applicant', 'review-state', 'vote-state'],
    physicalElements: ['council-dais', 'blank-vote-panels', 'blank-name-plates'],
  },
};

export const WORKBENCH_SHELL_PROFILES: Record<string, WorkbenchShellProfile> = {
  'el-workbench.v1': {
    profileId: 'el-workbench.v1',
    departmentId: 'experience-lab',
    toolModules: ['architectural-tools', 'material-intent', 'lighting-intent', 'composition', 'budget-forecast', 'permit-center'],
    physicalElements: ['glass-console', 'acrylic-surfaces', 'blank-touch-surfaces', 'tool-slot-housings'],
  },
  'cds-workbench.v1': {
    profileId: 'cds-workbench.v1',
    departmentId: 'creative-director-studio',
    toolModules: ['asset-workbench', 'material-lab', 'lighting-studio', 'composition-suite', 'asset-library', 'render-queue'],
    physicalElements: ['production-console', 'blank-tool-slots', 'blank-display-bezels'],
  },
  'cc-workbench.v1': {
    profileId: 'cc-workbench.v1',
    departmentId: 'command-center',
    toolModules: ['deployment-controls', 'ai-workforce', 'queue-management', 'immune-system', 'diagnostics', 'budget-controls'],
    physicalElements: ['operations-console', 'blank-control-housings', 'blank-action-surfaces'],
  },
  'council-workbench.v1': {
    profileId: 'council-workbench.v1',
    departmentId: 'city-council',
    toolModules: ['zoning', 'code-review', 'utility-review', 'security-review', 'fee-assessment', 'approval-controls'],
    physicalElements: ['review-console', 'blank-review-panels', 'blank-approval-housings'],
  },
};

export function resolveCommandDockProfile(profileId: string): CommandDockShellProfile | undefined {
  return COMMAND_DOCK_SHELL_PROFILES[profileId];
}

export function resolveWorkbenchProfile(profileId: string): WorkbenchShellProfile | undefined {
  return WORKBENCH_SHELL_PROFILES[profileId];
}
