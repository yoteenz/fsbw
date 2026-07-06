export { ExecutivePageShell } from './ExecutivePageShell';
export { ExecutiveHeroCard, ExecutiveHeroLabel } from './ExecutiveHeroCard';
export { ExecutiveIconNav, ExecutiveIconNavMetric, type ExecutiveIconNavItem } from './ExecutiveIconNav';
export {
  ExecutiveDepartmentCard,
  ExecutiveDepartmentCards,
  type ExecutiveDepartmentCardProps,
} from './ExecutiveDepartmentCard';
export { ExecutiveVisualSummary } from './ExecutiveVisualSummary';
export { ExecutiveFocusPanel, ExecutiveFocusList } from './ExecutiveFocusPanel';
export { ExecutiveSecondaryGrid, ExecutiveSecondaryCard } from './ExecutiveSecondaryGrid';
export { ExecutiveCollapsibleSection } from './ExecutiveCollapsibleSection';
export { ExecutiveHealthRing } from './ExecutiveHealthRing';
export { ExecutivePipelineViz, type PipelineStage } from './ExecutivePipelineViz';
export { ExecutiveTrendSparkline } from './ExecutiveTrendSparkline';
export { ExecutiveModuleSummary } from './ExecutiveModuleSummary';
export { ExecutiveWorkspaceZone } from './ExecutiveWorkspaceZone';
export { useExecutiveDepartment } from './useExecutiveDepartment';
export {
  EXECUTIVE_DEPARTMENT_ICONS,
  EXECUTIVE_DEPARTMENT_WINGS,
  healthToDepartmentStatus,
  type ExecutiveDepartmentStatus,
} from './executiveIaDepartments';
export { EXECUTIVE_IA_STYLES } from './executiveIaStyles';
export { EIA, eiaActionBtn, eiaCaption, eiaGrace, eiaPanel, eiaSectionTitle } from './executiveIaTheme';

/** M83 milestone identifier — every Studio module should inherit these primitives. */
export const EXECUTIVE_IA_MILESTONE = 'M83' as const;
export const EXECUTIVE_IA_VERSION = '1.0' as const;
