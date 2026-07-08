import type { OrbSurfaceActionId } from './context-registry/types';

export type HeroObjectOrbAction =
  | { kind: 'surface'; surface: OrbSurfaceActionId }
  | { kind: 'navigate'; path: string };

/** Hero Object destination → Orb interaction (surface open vs route navigation). */
const HERO_OBJECT_ACTIONS: Record<string, HeroObjectOrbAction> = {
  'world-atlas-globe': { kind: 'surface', surface: 'world-atlas' },
  'daily-brief-lens': { kind: 'surface', surface: 'daily-brief' },
  'mission-control-console': { kind: 'navigate', path: '/admin/studio/overview' },
  'knowledge-core-crystal': { kind: 'navigate', path: '/admin/studio/knowledge-hub' },
  'production-board-slate': { kind: 'navigate', path: '/admin/studio/production-orchestrator' },
  'story-table-relic': { kind: 'navigate', path: '/admin/studio/department/creative-direction' },
  'mood-wall-prism': { kind: 'navigate', path: '/admin/studio/design-dna-canon' },
  'studio-foundry-crucible': { kind: 'navigate', path: '/admin/studio/studio-foundry' },
  'asset-registry-vault': { kind: 'navigate', path: '/admin/studio/asset-registry' },
  'golden-review-marquee': { kind: 'navigate', path: '/admin/studio/concierge-approval-flow' },
  'generation-bay-engine': { kind: 'navigate', path: '/admin/studio/asset-factory' },
  'materials-library-tower': { kind: 'navigate', path: '/admin/studio/asset-library' },
  'blueprint-archive-scroll': { kind: 'navigate', path: '/admin/studio/blueprint-manager' },
  'marketplace-pavilion-arch': { kind: 'navigate', path: '/admin/studio/marketplace' },
  'hero-object-vault': { kind: 'navigate', path: '/admin/studio/studio-foundry' },
  'campaign-studio-beacon': { kind: 'navigate', path: '/admin/studio/campaign-engine' },
  'launch-theater-marquee': { kind: 'navigate', path: '/admin/studio/shows' },
  'social-media-lab-signal': { kind: 'navigate', path: '/admin/studio/social-accounts' },
  'brand-partnerships-handshake': { kind: 'navigate', path: '/admin/studio/brand-architect' },
  'performance-wall-monolith': { kind: 'navigate', path: '/admin/studio/analytics' },
};

export function resolveHeroObjectOrbAction(
  heroObjectId: string,
  fallbackPath?: string
): HeroObjectOrbAction {
  const mapped = HERO_OBJECT_ACTIONS[heroObjectId];
  if (mapped) return mapped;
  if (fallbackPath) return { kind: 'navigate', path: fallbackPath };
  return { kind: 'navigate', path: '/admin/studio/overview' };
}

export function resolveContextActionSurface(actionId: string): OrbSurfaceActionId | null {
  const surfaces: Record<string, OrbSurfaceActionId> = {
    'world-atlas': 'world-atlas',
    'command-dock': 'command-dock',
    'page-guide': 'page-guide',
    voice: 'voice',
    'daily-brief': 'daily-brief',
    'life-culture': 'life-culture',
  };
  return surfaces[actionId] ?? null;
}

/** Foundry / sculpture bridge slugs for Hero Objects. */
export const HERO_OBJECT_FOUNDRY_SLUG: Record<string, string> = {
  'world-atlas-globe': 'hero-icon.world-atlas',
  'mission-control-console': 'hero-icon.mission-control',
  'daily-brief-lens': 'hero-icon.daily-brief',
  'knowledge-core-crystal': 'hero-icon.knowledge-core',
  'production-board-slate': 'hero-object.production-board-slate',
  'story-table-relic': 'hero-object.story-table-relic',
  'mood-wall-prism': 'hero-object.mood-wall-prism',
  'studio-foundry-crucible': 'hero-object.studio-foundry-crucible',
  'asset-registry-vault': 'hero-object.asset-registry-vault',
  'golden-review-marquee': 'hero-object.golden-review-marquee',
  'generation-bay-engine': 'hero-object.generation-bay-engine',
  'materials-library-tower': 'hero-object.materials-library-tower',
  'blueprint-archive-scroll': 'hero-object.blueprint-archive-scroll',
  'marketplace-pavilion-arch': 'hero-icon.marketplace',
  'hero-object-vault': 'hero-object.hero-object-vault',
  'campaign-studio-beacon': 'hero-icon.marketing',
  'launch-theater-marquee': 'hero-object.launch-theater-marquee',
  'social-media-lab-signal': 'hero-object.social-media-lab-signal',
  'brand-partnerships-handshake': 'hero-object.brand-partnerships-handshake',
  'performance-wall-monolith': 'hero-object.performance-wall-monolith',
};

export function foundrySlugFromHeroObjectId(heroObjectId: string): string {
  return HERO_OBJECT_FOUNDRY_SLUG[heroObjectId] ?? 'hero-icon.dormant';
}

/** Context action id → sculpture icon for universal surfaces. */
export const CONTEXT_ACTION_SCULPTURE_ICON: Record<string, string> = {
  'page-guide': 'hero-icon.page-guide',
  voice: 'hero-icon.voice-mode',
  'command-dock': 'hero-icon.command-dock',
  'world-atlas': 'hero-icon.world-atlas',
  'daily-brief': 'hero-icon.daily-brief',
  'life-culture': 'hero-icon.life-culture',
};

export function foundrySlugFromContextAction(actionId: string, heroObjectId?: string): string {
  if (heroObjectId) {
    const fromHero = HERO_OBJECT_FOUNDRY_SLUG[heroObjectId];
    if (fromHero) return fromHero;
  }
  return CONTEXT_ACTION_SCULPTURE_ICON[actionId] ?? 'hero-icon.dormant';
}
