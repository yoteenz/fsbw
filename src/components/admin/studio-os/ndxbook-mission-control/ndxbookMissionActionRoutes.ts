/**
 * Org-scoped quick-link targets for NDXBOOK Mission Control.
 * Always resolves through ai-media workspace paths — stable regardless of guard/workspace churn.
 */
import { NDXBOOK_WORKSPACE_ID } from '../../../../studio-os-core/ndxbook/constants';
import { STUDIO_OS_ROUTES } from '../../../../studio-os-core/workspace/routes';

export type NdxbookMissionActionId =
  | 'create-page'
  | 'approve'
  | 'publish'
  | 'intelligence'
  | 'experiment'
  | 'knowledge-graph'
  | 'talent'
  | 'marketplace'
  | 'connect-instagram';

export type NdxbookMissionActionLink = {
  id: NdxbookMissionActionId;
  label: string;
  route: string;
};

function ndxModule(segment: string, workspaceId = NDXBOOK_WORKSPACE_ID): string {
  if (workspaceId === NDXBOOK_WORKSPACE_ID) {
    return `/admin/studio/${segment.replace(/^\//, '')}`;
  }
  return `${STUDIO_OS_ROUTES.workspaceShell(workspaceId).replace(/\/$/, '')}/studio/${segment.replace(/^\//, '')}`;
}

/** @internal exported for panel deep links */
export function ndxbookModulePath(segment: string, workspaceId: string = NDXBOOK_WORKSPACE_ID): string {
  return ndxModule(segment, workspaceId);
}

/** Rewrite legacy /admin/studio/* seed routes to workspace-scoped NDXBOOK paths. */
export function migrateLegacyNdxbookActionRoute(route: string): string {
  if (route.startsWith('/admin/studio-os/workspace/')) return route;
  if (!route.startsWith('/admin/studio/')) return route;

  const withoutPrefix = route.slice('/admin/studio/'.length);
  const [pathPart, queryPart] = withoutPrefix.split('?');
  const target = ndxModule(pathPart);
  return queryPart ? `${target}?${queryPart}` : target;
}

export function ndxbookNewsroomQuickLink(workspaceId: string = NDXBOOK_WORKSPACE_ID): string {
  if (workspaceId === NDXBOOK_WORKSPACE_ID) {
    return '/admin/studio/ndxbook/newsroom';
  }
  return STUDIO_OS_ROUTES.workspaceNewsroom(workspaceId);
}

export function buildNdxbookMissionActionLinks(
  workspaceId: string = NDXBOOK_WORKSPACE_ID
): NdxbookMissionActionLink[] {
  return [
    { id: 'create-page', label: 'CREATE PAGE', route: ndxbookNewsroomQuickLink(workspaceId) },
    { id: 'approve', label: 'APPROVE PRODUCTION', route: ndxbookNewsroomQuickLink(workspaceId) },
    { id: 'publish', label: 'PUBLISH', route: ndxbookNewsroomQuickLink(workspaceId) },
    { id: 'intelligence', label: 'OPEN STUDIO INTELLIGENCE', route: ndxModule('studio-intelligence', workspaceId) },
    { id: 'experiment', label: 'LAUNCH EXPERIMENT', route: ndxModule('labs', workspaceId) },
    { id: 'knowledge-graph', label: 'OPEN KNOWLEDGE GRAPH', route: ndxModule('knowledge-hub', workspaceId) },
    { id: 'talent', label: 'OPEN TALENT NETWORK', route: ndxModule('talent-network', workspaceId) },
    { id: 'marketplace', label: 'OPEN MARKETPLACE', route: ndxModule('marketplace', workspaceId) },
    { id: 'connect-instagram', label: 'CONNECT INSTAGRAM', route: `${ndxModule('ndxbook', workspaceId)}?tab=socials` },
  ];
}

export function ndxbookDistributionQuickLink(workspaceId: string = NDXBOOK_WORKSPACE_ID): string {
  return `${ndxModule('distribution-network', workspaceId)}?brand=ndxbook`;
}

export function ndxbookSocialsQuickLink(workspaceId: string = NDXBOOK_WORKSPACE_ID): string {
  return `${ndxModule('ndxbook', workspaceId)}?tab=socials`;
}

export function ndxbookMissionControlQuickLink(workspaceId: string = NDXBOOK_WORKSPACE_ID): string {
  return ndxModule('ndxbook/mission-control', workspaceId);
}

export function ndxbookPagesQuickLink(_stage?: string, workspaceId: string = NDXBOOK_WORKSPACE_ID): string {
  return ndxbookNewsroomQuickLink(workspaceId);
}
