/** Composition markers — used by tests to verify immersive workstation structure (not dashboard cards). */
export const ELAB_V2_COMPOSITION = {
  applicationShell: 'data-elab-application-shell',
  commandDock: 'data-elab-command-dock',
  viewportStage: 'data-elab-viewport-stage',
  studioViewport: 'data-studio-viewport',
  floatingInspector: 'data-elab-floating-inspector',
  founderWorkbench: 'data-elab-founder-workbench',
  founderReviewConsole: 'data-elab-founder-review-console',
  workbenchTabs: 'data-elab-workbench-tabs',
  approvalBridge: 'data-elab-approval-bridge',
  blockerSheet: 'data-elab-blocker-sheet',
  workbenchDock: 'data-elab-workbench-dock',
  departmentDock: 'data-elab-department-dock',
  registrySidebar: 'data-elab-registry-sidebar',
  governanceSidebar: 'data-elab-governance-sidebar',
  viewAngles: 'data-elab-view-angles',
  designVariants: 'data-elab-design-variants',
  modeRail: 'data-elab-viewport-mode-rail',
  contextualHud: 'data-elab-viewport-contextual-hud',
  blueprintCard: 'data-elab-blueprint-card',
  dynamicContextCard: 'data-elab-dynamic-context-card',
  archPerspective: 'data-elab-arch-perspective',
  environmentDisplayHost: 'data-env-display-host',
  environmentDisplayTransform: 'data-env-display-transform-owner',
  environmentDisplaySurface: 'data-env-display-visible-surface',
  anchorDiagnostics: 'data-elab-anchor-diagnostics',
  focusMode: 'data-elab-focus-mode',
  sheet: 'data-elab-sheet',
  inspectorSwitcher: 'data-elab-inspector-switcher',
  panelOrchestrator: 'data-elab-panel-orchestrator',
  workstationFrame: 'data-elab-workstation-frame',
  componentReviewChrome: 'data-elab-component-review-chrome',
  componentReviewSandbox: 'data-elab-review-sandbox',
} as const;

export const VIEWPORT_MODE_LABELS: Record<string, string> = {
  BLUEPRINT: 'BLUEPRINT',
  FOUNDER_RENDER: 'FOUNDER RENDER',
  CONSTRUCTION_PLAN: 'CONSTRUCTION',
  MATERIALS: 'MATERIALS',
  LIGHTING: 'LIGHTING',
  CAMERA: 'CAMERA',
  SPLIT_VIEW: 'SPLIT',
};

export const REGISTRY_TREE = [
  { id: 'fs-hq', label: 'FRONTAL SLAYER HQ', children: [
    { id: 'reception', label: 'RECEPTION', revision: 18, active: true },
    { id: 'lobby', label: 'GRAND LOBBY', revision: 12 },
    { id: 'cds', label: 'CREATIVE DIRECTOR STUDIO', revision: 9 },
  ]},
  { id: 'studio-os', label: 'STUDIO OS', children: [
    { id: 'experience-lab', label: 'EXPERIENCE LAB', revision: 4 },
    { id: 'command', label: 'COMMAND CENTER', revision: 3 },
  ]},
] as const;
