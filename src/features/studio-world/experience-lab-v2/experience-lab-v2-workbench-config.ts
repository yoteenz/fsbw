/** Experience Lab Workbench — editing tools + world navigation registry. */

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

import type { ExperienceLabIconName } from '../icons/experience-lab-icon-registry';
import { WORKBENCH_NAV_ICON, WORKBENCH_TOOL_ICON } from './experience-lab-v2-icon-bindings';

export type WorkbenchEditingTool = {
  id: WorkbenchEditingToolId;
  label: string;
  icon: ExperienceLabIconName;
};

/** Primary scroll page — visible before horizontal scroll. */
export const EXPERIENCE_LAB_WORKBENCH_TOOLS_PRIMARY: WorkbenchEditingTool[] = [
  { id: 'architectural-tools', label: 'ARCHITECTURAL TOOLS', icon: WORKBENCH_TOOL_ICON['architectural-tools'] },
  { id: 'material-library', label: 'MATERIAL LIBRARY', icon: WORKBENCH_TOOL_ICON['material-library'] },
  { id: 'asset-reference', label: 'ASSET REFERENCE', icon: WORKBENCH_TOOL_ICON['asset-reference'] },
  { id: 'budget-forecast', label: 'BUDGET FORECAST', icon: WORKBENCH_TOOL_ICON['budget-forecast'] },
  { id: 'workforce-center', label: 'WORKFORCE CENTER', icon: WORKBENCH_TOOL_ICON['workforce-center'] },
  { id: 'permit-center', label: 'PERMIT CENTER', icon: WORKBENCH_TOOL_ICON['permit-center'] },
];

/** Revealed after horizontal scroll / snap. */
export const EXPERIENCE_LAB_WORKBENCH_TOOLS_EXTENDED: WorkbenchEditingTool[] = [
  { id: 'lighting-studio', label: 'LIGHTING STUDIO', icon: WORKBENCH_TOOL_ICON['lighting-studio'] },
  { id: 'camera-studio', label: 'CAMERA STUDIO', icon: WORKBENCH_TOOL_ICON['camera-studio'] },
  { id: 'composition-studio', label: 'COMPOSITION STUDIO', icon: WORKBENCH_TOOL_ICON['composition-studio'] },
  { id: 'character-studio', label: 'CHARACTER STUDIO', icon: WORKBENCH_TOOL_ICON['character-studio'] },
  { id: 'animation-studio', label: 'ANIMATION STUDIO', icon: WORKBENCH_TOOL_ICON['animation-studio'] },
  { id: 'material-lab', label: 'MATERIAL LAB', icon: WORKBENCH_TOOL_ICON['material-lab'] },
];

export const EXPERIENCE_LAB_WORKBENCH_EDITING_TOOLS: WorkbenchEditingTool[] = [
  ...EXPERIENCE_LAB_WORKBENCH_TOOLS_PRIMARY,
  ...EXPERIENCE_LAB_WORKBENCH_TOOLS_EXTENDED,
];

export type WorkbenchWorldNavId = 'dashboard' | 'studio-world' | 'marketplace' | 'command-center';

type WorkbenchWorldNavItem = {
  id: WorkbenchWorldNavId;
  label: string;
  icon: ExperienceLabIconName;
};

export const EXPERIENCE_LAB_WORKBENCH_WORLD_NAV: WorkbenchWorldNavItem[] = [
  { id: 'dashboard', label: 'DASHBOARD', icon: WORKBENCH_NAV_ICON.dashboard },
  { id: 'studio-world', label: 'STUDIO WORLD', icon: WORKBENCH_NAV_ICON['studio-world'] },
  { id: 'marketplace', label: 'MARKETPLACE', icon: WORKBENCH_NAV_ICON.marketplace },
  { id: 'command-center', label: 'COMMAND CENTER', icon: WORKBENCH_NAV_ICON['command-center'] },
];

/** Split tool label into two display lines for compact panels. */
export function splitWorkbenchToolLabel(label: string): [string, string] {
  const words = label.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 1) return [words[0] ?? '', ''];
  const splitAt = Math.ceil(words.length / 2);
  return [words.slice(0, splitAt).join(' '), words.slice(splitAt).join(' ')];
}
