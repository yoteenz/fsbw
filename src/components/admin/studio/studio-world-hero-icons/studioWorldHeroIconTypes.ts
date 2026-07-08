/**
 * Studio World Hero Icon Library™ — ARTICLE-D08
 * Collectible three-dimensional architectural objects — never flat glyphs or emoji.
 */

/** Orb radial + department destinations share one industrial design language. */
export type StudioWorldHeroIconId =
  | 'world-atlas'
  | 'voice'
  | 'daily-brief'
  | 'page-guide'
  | 'command-dock'
  | 'life-culture'
  | 'mission-control'
  | 'knowledge-core'
  | 'constitution-hall'
  | 'creative-direction'
  | 'marketplace'
  | 'warehouse'
  | 'museum'
  | 'innovation'
  | 'finance'
  | 'operations'
  | 'hiring'
  | 'legal'
  | 'marketing'
  | 'product'
  | 'customer-experience'
  | 'dormant';

export type StudioWorldHeroIconMeta = {
  id: StudioWorldHeroIconId;
  label: string;
  trademark?: string;
};

/** Canonical registry — every department eventually receives its collectible icon. */
export const STUDIO_WORLD_HERO_ICON_REGISTRY: StudioWorldHeroIconMeta[] = [
  { id: 'world-atlas', label: 'World Atlas', trademark: 'World Atlas™' },
  { id: 'voice', label: 'Voice', trademark: 'Voice™' },
  { id: 'daily-brief', label: 'Daily Brief', trademark: 'Daily Brief™' },
  { id: 'page-guide', label: 'Page Guide', trademark: 'Page Guide™' },
  { id: 'command-dock', label: 'Command Dock', trademark: 'Command Dock™' },
  { id: 'life-culture', label: 'Life & Culture', trademark: 'Life & Culture™' },
  { id: 'mission-control', label: 'Mission Control', trademark: 'Mission Control™' },
  { id: 'knowledge-core', label: 'Knowledge Core', trademark: 'Knowledge Core™' },
  { id: 'constitution-hall', label: 'Constitution Hall', trademark: 'Constitution Hall™' },
  { id: 'creative-direction', label: 'Creative Direction', trademark: 'Creative Direction™' },
  { id: 'marketplace', label: 'Marketplace', trademark: 'Marketplace™' },
  { id: 'warehouse', label: 'Warehouse', trademark: 'Warehouse™' },
  { id: 'museum', label: 'Museum', trademark: 'Museum™' },
  { id: 'innovation', label: 'Innovation', trademark: 'Innovation™' },
  { id: 'finance', label: 'Finance', trademark: 'Finance™' },
  { id: 'operations', label: 'Operations', trademark: 'Operations™' },
  { id: 'hiring', label: 'Hiring', trademark: 'Hiring™' },
  { id: 'legal', label: 'Legal', trademark: 'Legal™' },
  { id: 'marketing', label: 'Marketing', trademark: 'Marketing™' },
  { id: 'product', label: 'Product', trademark: 'Product™' },
  { id: 'customer-experience', label: 'Customer Experience', trademark: 'Customer Experience™' },
  { id: 'dormant', label: 'Dormant', trademark: undefined },
];

/** Maps legacy Orb icon IDs to Hero Icon Library IDs. */
export function orbIconIdToHeroIconId(
  iconId: string
): StudioWorldHeroIconId {
  const map: Record<string, StudioWorldHeroIconId> = {
    atlas: 'world-atlas',
    voice: 'voice',
    'daily-brief': 'daily-brief',
    'page-guide': 'page-guide',
    'command-dock': 'command-dock',
    'life-culture': 'life-culture',
    museum: 'museum',
    marketplace: 'marketplace',
    knowledge: 'knowledge-core',
    innovation: 'innovation',
    disabled: 'dormant',
  };
  return map[iconId] ?? 'dormant';
}
