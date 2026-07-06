/**
 * Org-scoped quick-link targets for NDXBOOK Mission Control.
 * Uses workspace module paths so StudioWorkspaceGuard preserves query params and subpaths.
 */
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

export function buildNdxbookMissionActionLinks(
  toModule: (segment: string) => string
): NdxbookMissionActionLink[] {
  return [
    { id: 'create-page', label: 'CREATE PAGE', route: `${toModule('ndxbook')}?tab=pages` },
    { id: 'approve', label: 'APPROVE PRODUCTION', route: `${toModule('ndxbook')}?tab=checklist` },
    { id: 'publish', label: 'PUBLISH', route: `${toModule('distribution-network')}?brand=ndxbook` },
    { id: 'intelligence', label: 'OPEN STUDIO INTELLIGENCE', route: toModule('studio-intelligence') },
    { id: 'experiment', label: 'LAUNCH EXPERIMENT', route: toModule('labs') },
    { id: 'knowledge-graph', label: 'OPEN KNOWLEDGE GRAPH', route: toModule('knowledge-hub') },
    { id: 'talent', label: 'OPEN TALENT NETWORK', route: toModule('talent-network') },
    { id: 'marketplace', label: 'OPEN MARKETPLACE', route: toModule('marketplace') },
    { id: 'connect-instagram', label: 'CONNECT INSTAGRAM', route: `${toModule('ndxbook')}?tab=socials` },
  ];
}

export function ndxbookDistributionQuickLink(toModule: (segment: string) => string): string {
  return `${toModule('distribution-network')}?brand=ndxbook`;
}

export function ndxbookSocialsQuickLink(toModule: (segment: string) => string): string {
  return `${toModule('ndxbook')}?tab=socials`;
}

export function ndxbookPagesQuickLink(toModule: (segment: string) => string, stage?: string): string {
  const base = `${toModule('ndxbook')}?tab=pages`;
  return stage ? `${base}&stage=${encodeURIComponent(stage)}` : base;
}
