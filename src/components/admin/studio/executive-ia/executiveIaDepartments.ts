/** M83 — canonical department iconography for Studio OS Executive IA. */
import type { StudioNavGroupId } from '../../../../utils/adminStudioNavigation';

export const EXECUTIVE_DEPARTMENT_ICONS: Record<StudioNavGroupId, string> = {
  overview: '📊',
  create: '✨',
  visuals: '🎨',
  production: '🎬',
  distribution: '🚀',
  intelligence: '🧠',
  legacy: '🏛️',
  settings: '⚙️',
};

export const EXECUTIVE_DEPARTMENT_WINGS: Record<StudioNavGroupId, string> = {
  overview: 'COMMAND SURFACE',
  create: 'IDEATION WING',
  visuals: 'VISUAL STUDIO WING',
  production: 'PRODUCTION FLOOR',
  distribution: 'DISTRIBUTION WING',
  intelligence: 'INTELLIGENCE CENTER',
  legacy: 'ARCHIVE',
  settings: 'OPERATIONS',
};

export type ExecutiveDepartmentStatus = 'active' | 'attention' | 'idle' | 'blocked';

export function healthToDepartmentStatus(healthPct: number, hasBlockers = false, needsAttention = false): ExecutiveDepartmentStatus {
  if (hasBlockers) return 'blocked';
  if (needsAttention) return 'attention';
  if (healthPct >= 85) return 'active';
  return 'idle';
}
