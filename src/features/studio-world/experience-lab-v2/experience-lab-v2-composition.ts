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
  focusMode: 'data-elab-focus-mode',
  sheet: 'data-elab-sheet',
  inspectorSwitcher: 'data-elab-inspector-switcher',
  panelOrchestrator: 'data-elab-panel-orchestrator',
  workstationFrame: 'data-elab-workstation-frame',
  componentReviewChrome: 'data-elab-component-review-chrome',
  componentReviewSandbox: 'data-elab-review-sandbox',
} as const;

export const VIEWPORT_MODE_LABELS: Record<string, string> = {
  BLUEPRINT: 'Blueprint',
  FOUNDER_RENDER: 'Founder Render',
  CONSTRUCTION_PLAN: 'Construction',
  MATERIALS: 'Materials',
  LIGHTING: 'Lighting',
  CAMERA: 'Camera',
  SPLIT_VIEW: 'Split',
};

export const REGISTRY_TREE = [
  { id: 'fs-hq', label: 'FRONTAL SLAYER HQ', children: [
    { id: 'reception', label: 'Reception', revision: 18, active: true },
    { id: 'lobby', label: 'Grand Lobby', revision: 12 },
    { id: 'cds', label: 'Creative Director Studio', revision: 9 },
  ]},
  { id: 'studio-os', label: 'STUDIO OS', children: [
    { id: 'experience-lab', label: 'Experience Lab', revision: 4 },
    { id: 'command', label: 'Command Center', revision: 3 },
  ]},
] as const;
