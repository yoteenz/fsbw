import type { CanonicalMainDepartmentId } from '../../../studio-os-core/canonical-studio-world/canonical-department-registry';
import type { ExperienceLabProgram } from '../../../studio-os-core/canonical-studio-world/experience-lab-program';
import type { FounderRenderJobView } from '../../../studio-os-core/founder-render';

export const EXPERIENCE_LAB_V2_ROUTE = '/admin/studio/experience-lab-v2' as const;
export const EXPERIENCE_LAB_V2_ALIAS_ROUTE = '/admin/studio/experience-lab/test-v2' as const;

export const STUDIO_VIEWPORT_MODES = [
  'BLUEPRINT',
  'FOUNDER_RENDER',
  'CONSTRUCTION_PLAN',
  'MATERIALS',
  'LIGHTING',
  'CAMERA',
  'SPLIT_VIEW',
  'EMPTY_STATE',
  'LOADING',
  'ERROR',
] as const;

export type StudioViewportMode = (typeof STUDIO_VIEWPORT_MODES)[number];

export const EXPERIENCE_LAB_V2_TEST_MODES = ['MOCK', 'READ_ONLY', 'CONTROLLED_LIVE'] as const;
export type ExperienceLabV2TestMode = (typeof EXPERIENCE_LAB_V2_TEST_MODES)[number];

export type ExperienceLabV2EnvironmentConfig = {
  desktopEnvironmentUrl: string | null;
  mobileEnvironmentUrl: string | null;
  environmentOpacity: number;
  environmentPosition: string;
  environmentScale: number;
  centerSafeZone: string;
  sideSafeZones: string;
  topSafeZone: string;
  bottomSafeZone: string;
  scrimStrength: number;
};

export type ExperienceLabV2ArtifactRef = {
  kind: 'blueprint' | 'founder-render' | 'construction-plan' | 'materials' | 'lighting' | 'camera';
  label: string;
  revision: number;
  status: 'ready' | 'loading' | 'stale' | 'missing' | 'error';
  previewUrl: string | null;
  thumbnailUrl: string | null;
  summary: string;
};

export type ExperienceLabV2ApprovalState = {
  canApprove: boolean;
  disabledReasons: string[];
  primaryActionLabel: string;
  permitStatus: 'clear' | 'pending' | 'blocked';
  approvalRecorded: boolean;
};

export type ExperienceLabV2MigrationReadiness = {
  mobileApproved: boolean;
  desktopApproved: boolean;
  viewportApproved: boolean;
  dataParityApproved: boolean;
  generationParityApproved: boolean;
  accessibilityApproved: boolean;
  performanceApproved: boolean;
  productionNavigationApproved: boolean;
};

export type ExperienceLabV2ViewModel = {
  version: string;
  program: ExperienceLabProgram;
  departmentId: CanonicalMainDepartmentId;
  departmentName: string;
  revision: number;
  approvalStatus: string;
  permitStatus: string;
  costEstimate: string;
  healthState: string;
  testMode: ExperienceLabV2TestMode;
  liveBackendMode: boolean;
  viewportMode: StudioViewportMode;
  artifacts: Record<string, ExperienceLabV2ArtifactRef>;
  founderRender: FounderRenderJobView | null;
  blueprintSummary: string;
  constructionSummary: string;
  charterSummary: string;
  dependencies: string[];
  approval: ExperienceLabV2ApprovalState;
  migrationReadiness: ExperienceLabV2MigrationReadiness;
  diagnostics: string[];
  isStale: boolean;
  imageLoaded: boolean;
  /** Canonical live workspace — single source when provider is active. */
  liveWorkspace?: import('./live-workspace/ExperienceLabLiveWorkspaceViewModel').ExperienceLabLiveWorkspaceViewModel;
};

export type ExperienceLabV2InspectorModule = {
  id: string;
  label: string;
  viewportMode: StudioViewportMode;
  summary: string;
};
