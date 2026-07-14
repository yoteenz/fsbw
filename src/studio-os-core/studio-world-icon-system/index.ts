export * from './StudioWorldIconDefinition';
export * from './StudioWorldIconCategories';
export * from './StudioWorldIconState';
export * from './StudioWorldIconTheme';
export * from './StudioWorldIconRegistry';
export * from './StudioWorldIconSearch';
export * from './StudioWorldIconThemeResolver';
export * from './StudioWorldIconStateResolver';
export * from './StudioWorldIconLoader';
export * from './StudioWorldIconManifest';
export * from './StudioWorldIconVersionManager';
export * from './StudioWorldIconDiagnostics';
export * from './resolveRuntimeIcon';
export * from './resolveWorkbenchIcon';
export * from './resolveCommandDockIcon';

export function resolveDepartmentIcons(departmentId: string): string[] {
  return [`department.${departmentId}`, `workspace.${departmentId}`];
}
