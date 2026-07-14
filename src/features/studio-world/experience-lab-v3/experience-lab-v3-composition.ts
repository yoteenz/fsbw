/** V3 composition markers — parallel to V2 ELAB_V2_COMPOSITION, separate namespace. */

export const ELAB_V3_COMPOSITION = {
  applicationShell: 'data-elab-v3-application-shell',
  commandDock: 'data-elab-v3-command-dock',
  workspaceStage: 'data-elab-v3-workspace-stage',
  workspacePills: 'data-elab-v3-workspace-pills',
  blueprintPanel: 'data-elab-v3-blueprint-panel',
  contextInspector: 'data-elab-v3-context-inspector',
  designVariants: 'data-elab-v3-design-variants',
  contextWorkbench: 'data-elab-v3-context-workbench',
  environmentWorkspace: 'data-elab-v3-workspace-environment',
  productionWorkspace: 'data-elab-v3-workspace-production',
  reviewWorkspace: 'data-elab-v3-workspace-review',
  assetsWorkspace: 'data-elab-v3-workspace-assets',
  intelligenceWorkspace: 'data-elab-v3-workspace-intelligence',
} as const;

export const V3_WORKSPACE_LABELS: Record<string, string> = {
  environment: 'Environment',
  production: 'Production',
  review: 'Review',
  assets: 'Assets',
  intelligence: 'Intelligence',
};
