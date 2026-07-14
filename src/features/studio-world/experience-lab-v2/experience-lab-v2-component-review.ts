/** Experience Lab Component Review Mode — one production component at a time. */

export const COMPONENT_REVIEW_STORAGE_KEY = 'experience_lab_v2_component_review_v1';

export const COMPONENT_REVIEW_IDS = [
  'command-dock',
  'workbench',
  'studio-viewport',
  'floating-inspectors',
  'approval-bridge',
  'bottom-tool-dock',
  'diagnostics',
  'view-angle-strip',
  'environment-layer',
] as const;

export type ComponentReviewId = (typeof COMPONENT_REVIEW_IDS)[number];

/** Mandatory implementation order — do not skip ahead when perfecting components. */
export const COMPONENT_IMPLEMENTATION_PHASES: ComponentReviewId[] = [
  'command-dock',
  'workbench',
  'studio-viewport',
  'floating-inspectors',
  'approval-bridge',
  'bottom-tool-dock',
  'diagnostics',
  'view-angle-strip',
  'environment-layer',
];

export type ComponentReviewDefinition = {
  id: ComponentReviewId;
  label: string;
  versionName: string;
  phase: number;
};

export const COMPONENT_REVIEW_REGISTRY: ComponentReviewDefinition[] = COMPONENT_IMPLEMENTATION_PHASES.map(
  (id, index) => ({
    id,
    label: componentReviewLabel(id),
    versionName: componentVersionName(id),
    phase: index + 1,
  })
);

/** Approved + locked component versions (immutable once set). */
export const LOCKED_COMPONENT_VERSIONS: Partial<Record<ComponentReviewId, string>> = {
  // e.g. 'command-dock': 'StudioWorldCommandDock v1' — set after founder approval
};

export const DEFAULT_REVIEW_COMPONENT: ComponentReviewId = 'command-dock';

export type ComponentReviewState = {
  enabled: boolean;
  activeComponent: ComponentReviewId;
  lockedVersions: Partial<Record<ComponentReviewId, string>>;
};

function componentReviewLabel(id: ComponentReviewId): string {
  const labels: Record<ComponentReviewId, string> = {
    'command-dock': 'COMMAND DOCK',
    workbench: 'WORKBENCH',
    'studio-viewport': 'STUDIO VIEWPORT',
    'floating-inspectors': 'FLOATING INSPECTORS',
    'approval-bridge': 'APPROVAL BRIDGE',
    'bottom-tool-dock': 'BOTTOM TOOL DOCK',
    diagnostics: 'DIAGNOSTICS',
    'view-angle-strip': 'DESIGN VARIANT STRIP',
    'environment-layer': 'ENVIRONMENT LAYER',
  };
  return labels[id];
}

function componentVersionName(id: ComponentReviewId): string {
  const names: Record<ComponentReviewId, string> = {
    'command-dock': 'StudioWorldCommandDock v1',
    workbench: 'StudioWorldWorkbench v1',
    'studio-viewport': 'StudioViewport v1',
    'floating-inspectors': 'StudioInspectorSystem v1',
    'approval-bridge': 'StudioApprovalBridge v1',
    'bottom-tool-dock': 'StudioToolDock v1',
    diagnostics: 'StudioDiagnosticsPanel v1',
    'view-angle-strip': 'StudioDesignVariantStrip v1',
    'environment-layer': 'StudioEnvironmentLayer v1',
  };
  return names[id];
}

export function defaultComponentReviewState(): ComponentReviewState {
  return {
    enabled: false,
    activeComponent: DEFAULT_REVIEW_COMPONENT,
    lockedVersions: { ...LOCKED_COMPONENT_VERSIONS },
  };
}

export function parseReviewComponentFromQuery(search: string): ComponentReviewId | null {
  const params = new URLSearchParams(search);
  const raw = params.get('elabReview');
  if (!raw || raw === 'off' || raw === '0') return null;
  if (COMPONENT_REVIEW_IDS.includes(raw as ComponentReviewId)) return raw as ComponentReviewId;
  return null;
}

export function isReviewModeDisabledInQuery(search: string): boolean {
  const params = new URLSearchParams(search);
  const raw = params.get('elabReview');
  return raw === 'off' || raw === '0' || params.get('elabReviewMode') === 'off';
}

export function isComponentVisibleInReview(
  enabled: boolean,
  active: ComponentReviewId,
  target: ComponentReviewId
): boolean {
  if (!enabled) return true;
  return active === target;
}

export function currentImplementationPhase(locked: Partial<Record<ComponentReviewId, string>>): ComponentReviewId {
  for (const id of COMPONENT_IMPLEMENTATION_PHASES) {
    if (!locked[id]) return id;
  }
  return COMPONENT_IMPLEMENTATION_PHASES[COMPONENT_IMPLEMENTATION_PHASES.length - 1];
}

export function canAdvanceToPhase(
  target: ComponentReviewId,
  locked: Partial<Record<ComponentReviewId, string>>
): boolean {
  const targetIndex = COMPONENT_IMPLEMENTATION_PHASES.indexOf(target);
  if (targetIndex <= 0) return true;
  for (let i = 0; i < targetIndex; i += 1) {
    const prior = COMPONENT_IMPLEMENTATION_PHASES[i];
    if (!locked[prior]) return false;
  }
  return true;
}

export function componentsHiddenInReview(active: ComponentReviewId): ComponentReviewId[] {
  return COMPONENT_REVIEW_IDS.filter((id) => id !== active);
}
