/** Experience Lab Workbench — editing tools + world navigation registry. */

export const EXPERIENCE_LAB_WORKBENCH_CENTER_LOGO_PATH =
  '/storage/v1/object/public/live-preview/Studio%20World/D2161224-8335-4CE3-A4D8-794014DDAD32.png';

export function resolveExperienceLabWorkbenchCenterLogoUrl(): string {
  const base =
    (import.meta as unknown as { env?: { VITE_SUPABASE_URL?: string } }).env?.VITE_SUPABASE_URL?.trim() || '';
  if (!base) return EXPERIENCE_LAB_WORKBENCH_CENTER_LOGO_PATH;
  return `${base.replace(/\/$/, '')}${EXPERIENCE_LAB_WORKBENCH_CENTER_LOGO_PATH}`;
}

export type WorkbenchEditingToolId =
  | 'architectural-tools'
  | 'material-library'
  | 'asset-reference'
  | 'budget-forecast'
  | 'workforce-center'
  | 'permit-center'
  | 'lighting-studio'
  | 'camera-studio'
  | 'composition-studio'
  | 'character-studio'
  | 'animation-studio'
  | 'material-lab';

export type WorkbenchEditingTool = {
  id: WorkbenchEditingToolId;
  label: string;
  icon: string;
};

/** Primary scroll page — visible before horizontal scroll. */
export const EXPERIENCE_LAB_WORKBENCH_TOOLS_PRIMARY: WorkbenchEditingTool[] = [
  { id: 'architectural-tools', label: 'ARCHITECTURAL TOOLS', icon: '◎' },
  { id: 'material-library', label: 'MATERIAL LIBRARY', icon: '◉' },
  { id: 'asset-reference', label: 'ASSET REFERENCE', icon: '▣' },
  { id: 'budget-forecast', label: 'BUDGET FORECAST', icon: '▥' },
  { id: 'workforce-center', label: 'WORKFORCE CENTER', icon: '⬡' },
  { id: 'permit-center', label: 'PERMIT CENTER', icon: '⛊' },
];

/** Revealed after horizontal scroll / snap. */
export const EXPERIENCE_LAB_WORKBENCH_TOOLS_EXTENDED: WorkbenchEditingTool[] = [
  { id: 'lighting-studio', label: 'LIGHTING STUDIO', icon: '☀' },
  { id: 'camera-studio', label: 'CAMERA STUDIO', icon: '▦' },
  { id: 'composition-studio', label: 'COMPOSITION STUDIO', icon: '◫' },
  { id: 'character-studio', label: 'CHARACTER STUDIO', icon: '◐' },
  { id: 'animation-studio', label: 'ANIMATION STUDIO', icon: '▶' },
  { id: 'material-lab', label: 'MATERIAL LAB', icon: '◈' },
];

export const EXPERIENCE_LAB_WORKBENCH_EDITING_TOOLS: WorkbenchEditingTool[] = [
  ...EXPERIENCE_LAB_WORKBENCH_TOOLS_PRIMARY,
  ...EXPERIENCE_LAB_WORKBENCH_TOOLS_EXTENDED,
];

export type WorkbenchWorldNavId = 'dashboard' | 'studio-world' | 'marketplace' | 'command-center';

type WorkbenchWorldNavItem = {
  id: WorkbenchWorldNavId;
  label: string;
  icon: 'dashboard' | 'globe' | 'marketplace' | 'command';
};

export const EXPERIENCE_LAB_WORKBENCH_WORLD_NAV: WorkbenchWorldNavItem[] = [
  { id: 'dashboard', label: 'DASHBOARD', icon: 'dashboard' },
  { id: 'studio-world', label: 'STUDIO WORLD', icon: 'globe' },
  { id: 'marketplace', label: 'MARKETPLACE', icon: 'marketplace' },
  { id: 'command-center', label: 'COMMAND CENTER', icon: 'command' },
];
