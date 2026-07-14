import type { WorkbenchToolId } from '../experience-lab-v3.types';

export type WorkbenchToolDefinition = {
  id: WorkbenchToolId;
  label: string;
  description: string;
};

const RECEPTION_TOOLS: WorkbenchToolDefinition[] = [
  { id: 'lighting', label: 'Lighting', description: 'Scene lighting controls' },
  { id: 'materials', label: 'Materials', description: 'Surface and finish library' },
  { id: 'construction', label: 'Construction', description: 'Structural assembly' },
  { id: 'architectural-tools', label: 'Architectural', description: 'Blueprint and spatial tools' },
  { id: 'permit', label: 'Permit', description: 'Readiness and blockers' },
];

const MARKETPLACE_TOOLS: WorkbenchToolDefinition[] = [
  { id: 'packaging', label: 'Packaging', description: 'Listing presentation' },
  { id: 'pricing', label: 'Pricing', description: 'Revenue and tiers' },
  { id: 'listings', label: 'Listings', description: 'Marketplace catalog' },
];

const REWARDS_TOOLS: WorkbenchToolDefinition[] = [
  { id: 'collectibles', label: 'Collectibles', description: 'Reward artifacts' },
  { id: 'points', label: 'Points', description: 'Loyalty economy' },
  { id: 'unlockables', label: 'Unlockables', description: 'Gated content' },
];

const DEFAULT_TOOLS: WorkbenchToolDefinition[] = [
  { id: 'architectural-tools', label: 'Architectural', description: 'Blueprint tools' },
  { id: 'materials', label: 'Materials', description: 'Material library' },
  { id: 'budget', label: 'Budget', description: 'Cost forecast' },
  { id: 'camera', label: 'Camera', description: 'Shot composition' },
  { id: 'permit', label: 'Permit', description: 'Production readiness' },
  { id: 'workforce', label: 'Workforce', description: 'Scheduler jobs' },
];

/** Department-owned workbench — tools change by department, never duplicated. */
export function resolveV3WorkbenchTools(departmentId: string): WorkbenchToolDefinition[] {
  if (departmentId === 'reception' || departmentId === 'lobby' || departmentId === 'gallery') {
    return RECEPTION_TOOLS;
  }
  if (departmentId === 'marketplace') return MARKETPLACE_TOOLS;
  if (departmentId === 'rewards') return REWARDS_TOOLS;
  return DEFAULT_TOOLS;
}

export function defaultV3WorkbenchTool(departmentId: string): WorkbenchToolId {
  return resolveV3WorkbenchTools(departmentId)[0]?.id ?? 'architectural-tools';
}
