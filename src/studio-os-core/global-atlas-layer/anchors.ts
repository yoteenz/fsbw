/**
 * Global Atlas Layer™ — Atlas Anchor™ definitions.
 * One Atlas — projected from native architectural objects in each workspace.
 */

import type { StudioWorldFlagshipId } from '../studio-world/types';
import type { AtlasAnchor, AtlasAnchorKind } from './types';

const ANCHOR_BY_KIND: Record<AtlasAnchorKind, Omit<AtlasAnchor, 'flagshipId'>> = {
  'story-table': {
    kind: 'story-table',
    displayName: 'Story Table™',
    projectionLine: 'Projected from the Story Table™',
    overlayClass: 'gal-anchor-story-table',
  },
  'founder-office': {
    kind: 'founder-office',
    displayName: 'Founder Office™',
    projectionLine: 'Projected from the executive desk',
    overlayClass: 'gal-anchor-founder-office',
  },
  'warehouse-floor': {
    kind: 'warehouse-floor',
    displayName: 'Warehouse Floor™',
    projectionLine: 'Projected from the warehouse floor',
    overlayClass: 'gal-anchor-warehouse-floor',
  },
  'museum-exhibit': {
    kind: 'museum-exhibit',
    displayName: 'Museum Exhibit™',
    projectionLine: 'Projected from a legacy holographic exhibit',
    overlayClass: 'gal-anchor-museum-exhibit',
  },
  'marketplace-pavilion': {
    kind: 'marketplace-pavilion',
    displayName: 'Marketplace Pavilion™',
    projectionLine: 'Projected from the central pavilion',
    overlayClass: 'gal-anchor-marketplace',
  },
  'strategy-wall': {
    kind: 'strategy-wall',
    displayName: 'Strategy Wall™',
    projectionLine: 'Projected from the strategy wall',
    overlayClass: 'gal-anchor-strategy-wall',
  },
  'capital-table': {
    kind: 'capital-table',
    displayName: 'Capital Table™',
    projectionLine: 'Projected from the Capital Table™',
    overlayClass: 'gal-anchor-capital-table',
  },
  'mission-control': {
    kind: 'mission-control',
    displayName: 'Mission Control™',
    projectionLine: 'Projected from Mission Control™',
    overlayClass: 'gal-anchor-mission-control',
  },
  'holographic-table': {
    kind: 'holographic-table',
    displayName: 'Holographic Table™',
    projectionLine: 'Projected from the holographic command table',
    overlayClass: 'gal-anchor-holographic-table',
  },
  'constitution-hall': {
    kind: 'constitution-hall',
    displayName: 'Constitution Hall™',
    projectionLine: 'Projected from the constitutional monument',
    overlayClass: 'gal-anchor-constitution',
  },
  'innovation-campus': {
    kind: 'innovation-campus',
    displayName: 'Innovation Campus™',
    projectionLine: 'Projected from the Innovation District holographic pavilion',
    overlayClass: 'gal-anchor-innovation-campus',
  },
  'generic-room': {
    kind: 'generic-room',
    displayName: 'Workspace Anchor™',
    projectionLine: 'Projected from this workspace',
    overlayClass: 'gal-anchor-generic',
  },
};

type PathRule = {
  test: (p: string) => boolean;
  kind: AtlasAnchorKind;
  flagshipId?: StudioWorldFlagshipId;
};

const PATH_RULES: PathRule[] = [
  {
    test: (p) => p.includes('creative-direction') || p.includes('/department/creative'),
    kind: 'story-table',
    flagshipId: 'creative-direction-studio',
  },
  { test: (p) => p.includes('studio-warehouse') || p.includes('/world/warehouse'), kind: 'warehouse-floor', flagshipId: 'studio-warehouse' },
  { test: (p) => p.includes('studio-museum') || p.includes('museum-wing'), kind: 'museum-exhibit', flagshipId: 'studio-archives' },
  { test: (p) => p.includes('studio-archives'), kind: 'museum-exhibit', flagshipId: 'studio-archives' },
  { test: (p) => p.includes('marketplace'), kind: 'marketplace-pavilion', flagshipId: 'marketplace' },
  { test: (p) => p.includes('innovation-district'), kind: 'innovation-campus', flagshipId: 'studio-archives' },
  { test: (p) => p.includes('constitution-hall'), kind: 'constitution-hall', flagshipId: 'studio-command-center' },
  { test: (p) => p.includes('world-atlas'), kind: 'holographic-table', flagshipId: 'studio-command-center' },
  { test: (p) => p.includes('mission-control') || p.includes('/overview'), kind: 'mission-control', flagshipId: 'studio-command-center' },
  { test: (p) => p.includes('company-health') || p.includes('finance'), kind: 'capital-table', flagshipId: 'headquarters' },
  { test: (p) => p.includes('marketing') || p.includes('brand-architect') || p.includes('campaign-engine'), kind: 'strategy-wall', flagshipId: 'headquarters' },
  { test: (p) => p.includes('chief-of-staff') || p.includes('executive'), kind: 'founder-office', flagshipId: 'studio-command-center' },
  { test: (p) => p.includes('expansion-center') || p.includes('expedition'), kind: 'holographic-table', flagshipId: 'expedition-hub' },
  { test: (p) => p.includes('/headquarters'), kind: 'founder-office', flagshipId: 'headquarters' },
];

export function resolveAtlasAnchorForPath(pathname: string): AtlasAnchor {
  const p = pathname.toLowerCase();
  const rule = PATH_RULES.find((r) => r.test(p));
  const kind = rule?.kind ?? 'generic-room';
  const base = ANCHOR_BY_KIND[kind];
  return { ...base, flagshipId: rule?.flagshipId };
}

export function listAtlasAnchorKinds(): AtlasAnchorKind[] {
  return Object.keys(ANCHOR_BY_KIND) as AtlasAnchorKind[];
}
