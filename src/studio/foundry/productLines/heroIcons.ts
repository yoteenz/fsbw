/**
 * Hero Icons™ — first Studio Foundry product line.
 * Seeds define manufacturing intent; Orb/UI resolve by slug only.
 */

import type { FoundryAssetSeed } from '../foundryTypes';

const BASE: Omit<FoundryAssetSeed, 'slug' | 'name' | 'description' | 'promptIntent' | 'tags' | 'defaultUsage'> = {
  assetClass: 'hero-icon',
  recipeId: 'hero-icon',
  registryDestination: 'hero-icons',
};

function heroSeed(
  slugSuffix: string,
  name: string,
  description: string,
  promptIntent: string,
  tags: string[],
  defaultUsage: string[]
): FoundryAssetSeed {
  return {
    ...BASE,
    slug: `hero-icon.${slugSuffix}`,
    name,
    description,
    promptIntent,
    tags,
    defaultUsage,
  };
}

/** Canonical Hero Icon seed registry — every department eventually receives a manufactured icon. */
export const HERO_ICON_SEEDS: FoundryAssetSeed[] = [
  heroSeed(
    'world-atlas',
    'World Atlas',
    'Crystal globe in orbital rings — Mission Control spatial civilization map.',
    'Collectible World Atlas hero icon: crystal geography table, holographic orbital rings, luxury glass and chrome.',
    ['hero-icon', 'orb', 'atlas', 'mission-control'],
    ['Studio Orb radial', 'World Atlas', 'Mission Control']
  ),
  heroSeed(
    'voice-mode',
    'Voice Mode',
    'Resonant crystal voice chamber — Orb listening state.',
    'Collectible voice mode hero icon: acoustic crystal chamber, inner glow, premium chrome microphone sculpture.',
    ['hero-icon', 'orb', 'voice'],
    ['Studio Orb radial', 'Voice Mode panel']
  ),
  heroSeed(
    'daily-brief',
    'Daily Brief',
    'Executive briefing crystal dossier — notifications and daily intelligence.',
    'Collectible daily brief hero icon: folded crystal briefing folio, champagne light, executive luxury.',
    ['hero-icon', 'orb', 'briefing'],
    ['Studio Orb radial', 'Daily Brief overlay']
  ),
  heroSeed(
    'page-guide',
    'Page Guide',
    'Illuminated architectural page marker — contextual guidance.',
    'Collectible page guide hero icon: glowing glass bookmark monolith, crystal spine, soft museum light.',
    ['hero-icon', 'orb', 'guide'],
    ['Studio Orb radial', 'Page Guide panel']
  ),
  heroSeed(
    'command-dock',
    'Command Dock',
    'Executive command console crystal — primary Orb conversation surface.',
    'Collectible command dock hero icon: miniature glass command plinth, orbiting control rings, internal glow.',
    ['hero-icon', 'orb', 'command-dock'],
    ['Studio Orb radial', 'Command Dock conversation']
  ),
  heroSeed(
    'mission-control',
    'Mission Control',
    'Holographic atlas table artifact — civilization command center.',
    'Collectible mission control hero icon: holographic table crystal, spatial projection beams, luxury headquarters.',
    ['hero-icon', 'mission-control', 'atlas'],
    ['Mission Control', 'World Atlas room']
  ),
  heroSeed(
    'knowledge-core',
    'Knowledge Core',
    'Memory crystal archive — institutional knowledge engine.',
    'Collectible knowledge core hero icon: stacked crystal memory cores, soft internal archive glow.',
    ['hero-icon', 'knowledge-core', 'archives'],
    ['Knowledge Core Observatory', 'Studio Archives']
  ),
  heroSeed(
    'constitution-hall',
    'Constitution Hall',
    'Marble constitutional exhibit plinth — ADR and governance museum.',
    'Collectible constitution hall hero icon: marble plinth with crystal law tablet, museum lighting.',
    ['hero-icon', 'constitution', 'governance'],
    ['Constitution Hall', 'ADR exhibits']
  ),
  heroSeed(
    'world-graph',
    'World Graph',
    'Interconnected crystal node constellation — civilization graph truth.',
    'Collectible world graph hero icon: floating crystal nodes with golden relationship filaments.',
    ['hero-icon', 'world-graph', 'civilization'],
    ['World Graph compile', 'Orb Archivist']
  ),
  heroSeed(
    'experience-engine',
    'Experience Engine',
    'Experience crystal projector — Progressive Presence and immersion quality.',
    'Collectible experience engine hero icon: prismatic experience projector, ambient luxury glow.',
    ['hero-icon', 'experience-engine'],
    ['Experience Engine workspace', 'Progressive Presence gates']
  ),
  heroSeed(
    'production-board',
    'Production Board',
    'Film production command wall crystal — pipeline orchestration.',
    'Collectible production board hero icon: glass production wall tiles, cinematic chrome, studio lighting.',
    ['hero-icon', 'production', 'pipeline'],
    ['Production Orchestrator', 'Creative Pipeline']
  ),
  heroSeed(
    'studio-archives',
    'Studio Archives',
    'Archive vault crystal stacks — Studio World memory wing.',
    'Collectible studio archives hero icon: vault crystal stacks, warm archive glow, marble base.',
    ['hero-icon', 'archives', 'memory'],
    ['Studio Archives wing', 'Knowledge Library projection']
  ),
  heroSeed(
    'creative-direction',
    'Creative Direction',
    'Mood wall crystal panel — Creative Direction Studio signature object.',
    'Collectible creative direction hero icon: editorial mood wall crystal, glass depth, luxury studio.',
    ['hero-icon', 'creative-direction', 'department'],
    ['Creative Direction Studio', 'Mood Wall']
  ),
  heroSeed(
    'marketplace',
    'Marketplace',
    'Marketplace pavilion crystal — commerce and pack exchange.',
    'Collectible marketplace hero icon: pavilion crystal canopy, commerce glow, architectural luxury.',
    ['hero-icon', 'marketplace', 'commerce'],
    ['Marketplace Pavilion', 'Discovery Packs']
  ),
  heroSeed(
    'warehouse',
    'Warehouse',
    'Industrial warehouse crystal crate — asset storage campus.',
    'Collectible warehouse hero icon: crystal storage crate on marble industrial plinth.',
    ['hero-icon', 'warehouse', 'assets'],
    ['Warehouse Wing', 'Asset storage']
  ),
  heroSeed(
    'museum',
    'Museum',
    'Museum wing crystal exhibit — legacy and golden builds.',
    'Collectible museum hero icon: crystal exhibit case, golden artifact glow, museum spotlight.',
    ['hero-icon', 'museum', 'legacy'],
    ['Museum Wing', 'Hall of Legacy']
  ),
  heroSeed(
    'innovation',
    'Innovation',
    'Innovation lab crystal spark — expeditions and constellations.',
    'Collectible innovation hero icon: crystal innovation spark inside glass laboratory orb.',
    ['hero-icon', 'innovation', 'lab'],
    ['Innovation Hall', 'Innovation Expeditions']
  ),
  heroSeed(
    'finance',
    'Finance',
    'Finance crystal ledger — executive treasury object.',
    'Collectible finance hero icon: crystal ledger monolith, precise chrome inlays, calm luxury light.',
    ['hero-icon', 'finance', 'executive'],
    ['Finance department', 'Executive treasury views']
  ),
  heroSeed(
    'operations',
    'Operations',
    'Operations crystal gear — execution and orchestration.',
    'Collectible operations hero icon: interlocking crystal operations rings, industrial luxury.',
    ['hero-icon', 'operations'],
    ['Operations department']
  ),
  heroSeed(
    'hiring',
    'Hiring',
    'Hiring crystal portal — talent and team growth.',
    'Collectible hiring hero icon: crystal portal frame, welcoming inner glow, executive polish.',
    ['hero-icon', 'hiring', 'talent'],
    ['Hiring department']
  ),
  heroSeed(
    'legal',
    'Legal',
    'Legal crystal scales — governance and compliance.',
    'Collectible legal hero icon: balanced crystal scales on marble base, authoritative light.',
    ['hero-icon', 'legal', 'compliance'],
    ['Legal department']
  ),
  heroSeed(
    'marketing',
    'Marketing',
    'Marketing crystal broadcast — brand amplification object.',
    'Collectible marketing hero icon: crystal broadcast tower, radiant campaign glow.',
    ['hero-icon', 'marketing', 'brand'],
    ['Marketing department', 'Campaign Engine']
  ),
  heroSeed(
    'product',
    'Product',
    'Product crystal prototype — build and ship artifact.',
    'Collectible product hero icon: crystal prototype cube with inner blueprint glow.',
    ['hero-icon', 'product'],
    ['Product department']
  ),
  heroSeed(
    'customer-experience',
    'Customer Experience',
    'Customer experience crystal halo — service excellence object.',
    'Collectible customer experience hero icon: crystal service halo, warm hospitality glow.',
    ['hero-icon', 'customer-experience', 'cx'],
    ['Customer Experience department']
  ),
  heroSeed(
    'intelligence',
    'Intelligence',
    'Intelligence crystal lens — analytics and strategic insight.',
    'Collectible intelligence hero icon: faceted intelligence lens, data caustics, executive clarity.',
    ['hero-icon', 'intelligence', 'analytics'],
    ['Intelligence headquarters', 'Studio Intelligence']
  ),
  heroSeed(
    'distribution',
    'Distribution',
    'Distribution crystal conduit — publishing and reach.',
    'Collectible distribution hero icon: crystal distribution conduit, flowing light channels.',
    ['hero-icon', 'distribution', 'publishing'],
    ['Distribution Engine', 'Publishing Studio']
  ),
  heroSeed(
    'life-culture',
    'Life & Culture',
    'Life and culture crystal garden — people and culture wing.',
    'Collectible life and culture hero icon: crystal terrarium sculpture, organic inner glow.',
    ['hero-icon', 'life-culture', 'people'],
    ['Studio Orb radial', 'Life & Culture panel']
  ),
  heroSeed(
    'dormant',
    'Dormant',
    'Dormant crystal shell — reserved for future Orb projections.',
    'Dormant placeholder hero icon: inert crystal shell, minimal glow, reserved for future activation.',
    ['hero-icon', 'dormant', 'placeholder'],
    ['Disabled Orb projections']
  ),
];

export const HERO_ICON_SEED_BY_SLUG: Record<string, FoundryAssetSeed> = Object.fromEntries(
  HERO_ICON_SEEDS.map((seed) => [seed.slug, seed])
);

/** Legacy Orb radial `iconId` → Foundry slug. */
export const ORB_ICON_ID_TO_FOUNDRY_SLUG: Record<string, string> = {
  atlas: 'hero-icon.world-atlas',
  voice: 'hero-icon.voice-mode',
  'daily-brief': 'hero-icon.daily-brief',
  'page-guide': 'hero-icon.page-guide',
  'command-dock': 'hero-icon.command-dock',
  'life-culture': 'hero-icon.life-culture',
  museum: 'hero-icon.museum',
  marketplace: 'hero-icon.marketplace',
  knowledge: 'hero-icon.knowledge-core',
  innovation: 'hero-icon.innovation',
  disabled: 'hero-icon.dormant',
};

/** Legacy hero icon id → Foundry slug. */
export const HERO_ICON_ID_TO_FOUNDRY_SLUG: Record<string, string> = {
  'world-atlas': 'hero-icon.world-atlas',
  voice: 'hero-icon.voice-mode',
  'daily-brief': 'hero-icon.daily-brief',
  'page-guide': 'hero-icon.page-guide',
  'command-dock': 'hero-icon.command-dock',
  'life-culture': 'hero-icon.life-culture',
  'mission-control': 'hero-icon.mission-control',
  'knowledge-core': 'hero-icon.knowledge-core',
  'constitution-hall': 'hero-icon.constitution-hall',
  'creative-direction': 'hero-icon.creative-direction',
  marketplace: 'hero-icon.marketplace',
  warehouse: 'hero-icon.warehouse',
  museum: 'hero-icon.museum',
  innovation: 'hero-icon.innovation',
  finance: 'hero-icon.finance',
  operations: 'hero-icon.operations',
  hiring: 'hero-icon.hiring',
  legal: 'hero-icon.legal',
  marketing: 'hero-icon.marketing',
  product: 'hero-icon.product',
  'customer-experience': 'hero-icon.customer-experience',
  dormant: 'hero-icon.dormant',
};

export function foundrySlugFromOrbIconId(orbIconId: string): string {
  return ORB_ICON_ID_TO_FOUNDRY_SLUG[orbIconId] ?? 'hero-icon.dormant';
}

export function foundrySlugFromHeroIconId(heroIconId: string): string {
  return HERO_ICON_ID_TO_FOUNDRY_SLUG[heroIconId] ?? 'hero-icon.dormant';
}
