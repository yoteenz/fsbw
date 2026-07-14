import type { ExperienceLabProgram } from '../experience-lab-v2-program-registry';
import type { WorkbenchEditingToolId } from '../experience-lab-v2-workbench-config';
import {
  EXPERIENCE_LAB_WORKBENCH_TOOLS_PRIMARY,
  EXPERIENCE_LAB_WORKBENCH_TOOLS_EXTENDED,
  type WorkbenchEditingTool,
} from '../experience-lab-v2-workbench-config';

export const EXPERIENCE_LAB_V2_PAGE_ID = 'experience-lab-v2' as const;
export const CREATIVE_DIRECTOR_STUDIO_PAGE_ID = 'creative-director-studio' as const;
export const ASSET_MANUFACTURING_PAGE_ID = 'asset-manufacturing' as const;

export type WorkbenchRegistryPageId =
  | typeof EXPERIENCE_LAB_V2_PAGE_ID
  | typeof CREATIVE_DIRECTOR_STUDIO_PAGE_ID
  | typeof ASSET_MANUFACTURING_PAGE_ID;

export type WorkbenchRegistryInput = {
  pageId: WorkbenchRegistryPageId;
  programId: ExperienceLabProgram;
  departmentId: string | null;
  industryPackId: string | null;
  environmentId: string | null;
  packageLifecycleState?: string;
  hasAdminPermission?: boolean;
};

export type WorkbenchRegistryEntry = WorkbenchEditingTool & {
  moduleId: string;
  enabled: boolean;
};

const CDS_TOOLS: WorkbenchEditingTool[] = [
  { id: 'composition-studio', label: 'COMPOSITION STUDIO', icon: 'composition-studio' as WorkbenchEditingTool['icon'] },
  { id: 'character-studio', label: 'CHARACTER STUDIO', icon: 'character-studio' as WorkbenchEditingTool['icon'] },
  { id: 'animation-studio', label: 'ANIMATION STUDIO', icon: 'animation-studio' as WorkbenchEditingTool['icon'] },
  { id: 'lighting-studio', label: 'LIGHTING STUDIO', icon: 'lighting-studio' as WorkbenchEditingTool['icon'] },
  { id: 'camera-studio', label: 'CAMERA STUDIO', icon: 'camera-studio' as WorkbenchEditingTool['icon'] },
  { id: 'material-lab', label: 'MATERIAL LAB', icon: 'material-lab' as WorkbenchEditingTool['icon'] },
];

const ASSET_MFG_TOOLS: WorkbenchEditingTool[] = [
  { id: 'asset-reference', label: 'ASSET QUEUE', icon: 'asset-reference' as WorkbenchEditingTool['icon'] },
  { id: 'material-library', label: 'SOURCE REFERENCES', icon: 'material-library' as WorkbenchEditingTool['icon'] },
  { id: 'architectural-tools', label: 'ISOLATION', icon: 'architectural-tools' as WorkbenchEditingTool['icon'] },
  { id: 'workforce-center', label: 'CLEANUP', icon: 'workforce-center' as WorkbenchEditingTool['icon'] },
  { id: 'budget-forecast', label: 'EXPORT', icon: 'budget-forecast' as WorkbenchEditingTool['icon'] },
  { id: 'permit-center', label: 'QA', icon: 'permit-center' as WorkbenchEditingTool['icon'] },
];

/** Page-aware workbench registry — Experience Lab default tool set is primary, not global hardcode. */
export function resolveStudioWorldWorkbenchRegistry(
  input: WorkbenchRegistryInput
): WorkbenchRegistryEntry[] {
  const enabled = input.hasAdminPermission !== false;

  if (input.pageId === CREATIVE_DIRECTOR_STUDIO_PAGE_ID) {
    return CDS_TOOLS.map((tool) => ({
      ...tool,
      moduleId: tool.id,
      enabled,
    }));
  }

  if (input.pageId === ASSET_MANUFACTURING_PAGE_ID) {
    return ASSET_MFG_TOOLS.map((tool) => ({
      ...tool,
      moduleId: tool.id,
      enabled,
    }));
  }

  const primary = EXPERIENCE_LAB_WORKBENCH_TOOLS_PRIMARY.map((tool) => ({
    ...tool,
    moduleId: tool.id,
    enabled,
  }));

  const extended = EXPERIENCE_LAB_WORKBENCH_TOOLS_EXTENDED.map((tool) => ({
    ...tool,
    moduleId: tool.id,
    enabled: enabled && input.programId === 'studio-world',
  }));

  return [...primary, ...extended];
}

export function resolveDefaultWorkbenchTool(
  registry: WorkbenchRegistryEntry[]
): WorkbenchEditingToolId | null {
  const first = registry.find((e) => e.enabled);
  return first?.id ?? null;
}

export function isWorkbenchToolInRegistry(
  registry: WorkbenchRegistryEntry[],
  toolId: WorkbenchEditingToolId | null
): boolean {
  if (!toolId) return false;
  return registry.some((e) => e.id === toolId && e.enabled);
}

export const WORKBENCH_TOOL_STORAGE_KEY = 'experience_lab_v2_workbench_tool_v1';

export function readPersistedWorkbenchTool(pageId: string): WorkbenchEditingToolId | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(WORKBENCH_TOOL_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, WorkbenchEditingToolId>;
    return parsed[pageId] ?? null;
  } catch {
    return null;
  }
}

export function writePersistedWorkbenchTool(pageId: string, toolId: WorkbenchEditingToolId | null): void {
  if (typeof localStorage === 'undefined') return;
  try {
    const raw = localStorage.getItem(WORKBENCH_TOOL_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, WorkbenchEditingToolId | null>) : {};
    if (toolId) parsed[pageId] = toolId;
    else delete parsed[pageId];
    localStorage.setItem(WORKBENCH_TOOL_STORAGE_KEY, JSON.stringify(parsed));
  } catch {
    // ignore
  }
}

export function resolveActiveWorkbenchTool(input: {
  pageId: string;
  registry: WorkbenchRegistryEntry[];
  requestedTool: WorkbenchEditingToolId | null;
}): WorkbenchEditingToolId | null {
  if (input.requestedTool && isWorkbenchToolInRegistry(input.registry, input.requestedTool)) {
    return input.requestedTool;
  }
  const persisted = readPersistedWorkbenchTool(input.pageId);
  if (persisted && isWorkbenchToolInRegistry(input.registry, persisted)) {
    return persisted;
  }
  return resolveDefaultWorkbenchTool(input.registry);
}

/** @deprecated Use resolveStudioWorldWorkbenchRegistry */
export const StudioWorldWorkbenchRegistry = {
  resolve: resolveStudioWorldWorkbenchRegistry,
  resolveDefaultTool: resolveDefaultWorkbenchTool,
  resolveActiveTool: resolveActiveWorkbenchTool,
};
