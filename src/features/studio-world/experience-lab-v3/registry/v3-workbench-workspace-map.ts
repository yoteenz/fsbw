import type { WorkbenchEditingToolId } from '../../experience-lab-v2/experience-lab-v2-workbench-config';
import type { V3CoreWorkspaceId } from '../experience-lab-v3.types';

const ENVIRONMENT_TOOLS = new Set<WorkbenchEditingToolId>([
  'architectural-tools',
  'material-library',
  'lighting-studio',
  'camera-studio',
  'composition-studio',
  'character-studio',
  'animation-studio',
  'material-lab',
]);

const PRODUCTION_TOOLS = new Set<WorkbenchEditingToolId>(['workforce-center', 'permit-center']);

const ASSETS_TOOLS = new Set<WorkbenchEditingToolId>(['asset-reference']);

const COMMAND_TOOLS = new Set<WorkbenchEditingToolId>(['budget-forecast']);

/** Workbench tool selection drives active viewport workspace. */
export function resolveV3WorkspaceForWorkbenchTool(toolId: WorkbenchEditingToolId | null): V3CoreWorkspaceId | null {
  if (!toolId) return null;
  if (ENVIRONMENT_TOOLS.has(toolId)) return 'environment';
  if (PRODUCTION_TOOLS.has(toolId)) return 'production';
  if (ASSETS_TOOLS.has(toolId)) return 'assets';
  if (COMMAND_TOOLS.has(toolId)) return 'command';
  return null;
}
