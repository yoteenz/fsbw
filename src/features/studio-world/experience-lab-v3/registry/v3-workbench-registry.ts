import type {
  V3CoreWorkspaceId,
  V3InspectorModeId,
  V3WorkbenchToolId,
} from '../experience-lab-v3.types';
import type { ExperienceLabIconName } from '../../icons/experience-lab-icon-registry';

export type V3WorkbenchToolDef = {
  id: V3WorkbenchToolId;
  label: string;
  icon: ExperienceLabIconName;
  inspectorMode: V3InspectorModeId | null;
};

const ENVIRONMENT_TOOLS: V3WorkbenchToolDef[] = [
  { id: 'blueprint', label: 'BLUEPRINT', icon: 'blueprint', inspectorMode: 'blueprint-detail' },
  { id: 'lighting', label: 'LIGHTING', icon: 'lighting', inspectorMode: 'lighting' },
  { id: 'materials', label: 'MATERIALS', icon: 'materials', inspectorMode: 'materials' },
  { id: 'construction', label: 'CONSTRUCTION', icon: 'construction', inspectorMode: 'construction' },
  { id: 'camera', label: 'CAMERA', icon: 'camera', inspectorMode: 'camera' },
  { id: 'compare', label: 'COMPARE', icon: 'splitView', inspectorMode: null },
  { id: 'split-view', label: 'SPLIT VIEW', icon: 'grid', inspectorMode: null },
];

const PRODUCTION_TOOLS: V3WorkbenchToolDef[] = [
  { id: 'pause', label: 'PAUSE', icon: 'pause', inspectorMode: null },
  { id: 'retry', label: 'RETRY', icon: 'loop', inspectorMode: null },
  { id: 'dependencies', label: 'DEPENDENCIES', icon: 'link', inspectorMode: 'dependencies' },
  { id: 'outputs', label: 'OUTPUTS', icon: 'export', inspectorMode: 'work-order' },
  { id: 'logs', label: 'LOGS', icon: 'terminal', inspectorMode: null },
  { id: 'priority', label: 'PRIORITY', icon: 'flag', inspectorMode: null },
  { id: 'assign', label: 'ASSIGN', icon: 'users', inspectorMode: null },
];

const REVIEW_TOOLS: V3WorkbenchToolDef[] = [
  { id: 'approve', label: 'APPROVE', icon: 'approved', inspectorMode: 'design-brief' },
  { id: 'reject', label: 'REJECT', icon: 'stop', inspectorMode: 'design-brief' },
  { id: 'compare', label: 'COMPARE', icon: 'splitView', inspectorMode: 'review-compare' },
  { id: 'comment', label: 'COMMENT', icon: 'comments', inspectorMode: 'design-brief' },
  { id: 'promote', label: 'PROMOTE', icon: 'favorite', inspectorMode: 'revision-timeline' },
  { id: 'request-revision', label: 'REQUEST REVISION', icon: 'revisions', inspectorMode: 'revision-timeline' },
  { id: 'history', label: 'HISTORY', icon: 'history', inspectorMode: 'revision-timeline' },
];

const ASSETS_TOOLS: V3WorkbenchToolDef[] = [
  { id: 'publish', label: 'PUBLISH', icon: 'share', inspectorMode: 'package-detail' },
  { id: 'save', label: 'SAVE', icon: 'database', inspectorMode: 'package-detail' },
  { id: 'duplicate', label: 'DUPLICATE', icon: 'duplicate', inspectorMode: null },
  { id: 'archive', label: 'ARCHIVE', icon: 'hide', inspectorMode: null },
  { id: 'export', label: 'EXPORT', icon: 'export', inspectorMode: null },
  { id: 'marketplace', label: 'MARKETPLACE', icon: 'projects', inspectorMode: 'material-library' },
  { id: 'metadata', label: 'METADATA', icon: 'settings', inspectorMode: 'package-detail' },
];

const COMMAND_TOOLS: V3WorkbenchToolDef[] = [
  { id: 'budget', label: 'BUDGET', icon: 'analytics', inspectorMode: 'budget-forecast' },
  { id: 'forecast', label: 'FORECAST', icon: 'milestones', inspectorMode: 'budget-forecast' },
  { id: 'providers', label: 'PROVIDERS', icon: 'cloudSync', inspectorMode: 'provider-health' },
  { id: 'diagnostics', label: 'DIAGNOSTICS', icon: 'diagnostics', inspectorMode: 'provider-health' },
  { id: 'reports', label: 'REPORTS', icon: 'notes', inspectorMode: null },
  { id: 'performance', label: 'PERFORMANCE', icon: 'performance', inspectorMode: 'queue-analytics' },
  { id: 'queue-health', label: 'QUEUE HEALTH', icon: 'schedule', inspectorMode: 'queue-analytics' },
];

const TOOLS_BY_WORKSPACE: Record<V3CoreWorkspaceId, V3WorkbenchToolDef[]> = {
  environment: ENVIRONMENT_TOOLS,
  production: PRODUCTION_TOOLS,
  review: REVIEW_TOOLS,
  assets: ASSETS_TOOLS,
  command: COMMAND_TOOLS,
};

export function resolveV3WorkbenchTools(workspace: V3CoreWorkspaceId): V3WorkbenchToolDef[] {
  return TOOLS_BY_WORKSPACE[workspace];
}

export function defaultV3WorkbenchTool(workspace: V3CoreWorkspaceId): V3WorkbenchToolId {
  return resolveV3WorkbenchTools(workspace)[0]!.id;
}

export function resolveV3InspectorModeForTool(
  workspace: V3CoreWorkspaceId,
  toolId: V3WorkbenchToolId | null
): V3InspectorModeId | null {
  if (!toolId) return null;
  const tool = resolveV3WorkbenchTools(workspace).find((t) => t.id === toolId);
  return tool?.inspectorMode ?? null;
}

export const V3_INSPECTOR_COPY: Record<V3InspectorModeId, { title: string; body: string }> = {
  lighting: { title: 'Lighting Inspector', body: 'Key fill, rim, ambient, and exposure controls for the active environment package.' },
  materials: { title: 'Materials Inspector', body: 'Surface assignments, PBR presets, and finish overrides bound to the canonical package.' },
  camera: { title: 'Camera Inspector', body: 'Lens, framing, depth, and hero angle for the immersive viewport render.' },
  construction: { title: 'Construction Inspector', body: 'Structural volumes, partitions, and build layers for the environment shell.' },
  'blueprint-detail': { title: 'Blueprint Detail', body: 'Architectural blueprint context for the active design variant.' },
  'work-order': { title: 'Active Work Order', body: 'Current production task, outputs, and execution status.' },
  dependencies: { title: 'Dependencies', body: 'Upstream and downstream work order graph for the active package.' },
  'queue-health': { title: 'Queue Health', body: 'Generation queue depth, retries, and blocked job diagnostics.' },
  'design-brief': { title: 'Design Brief', body: 'Founder review brief, comments, and decision context.' },
  'revision-timeline': { title: 'Revision Timeline', body: 'Version history, promotions, and canonical lineage.' },
  'review-compare': { title: 'Compare', body: 'Side-by-side variant comparison for founder approval.' },
  'package-detail': { title: 'Package Detail', body: 'Environment package metadata, outputs, and asset bindings.' },
  'material-library': { title: 'Materials Library', body: 'Reusable material assets from the studio warehouse.' },
  'budget-forecast': { title: 'Budget & Forecast', body: 'Spend today, projected cost, and credit runway.' },
  'provider-health': { title: 'Provider Health', body: 'FAL, GPU, and generation provider status.' },
  'queue-analytics': { title: 'Queue Analytics', body: 'Throughput, failure rate, and render history metrics.' },
};
