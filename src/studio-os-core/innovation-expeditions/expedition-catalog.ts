import type { ExpeditionPathLevel, ExpeditionStop, InnovationExpedition } from './types';

function stop(
  id: string,
  order: number,
  title: string,
  locationLabel: string,
  worldPath: string,
  routePath: string,
  exhibitKind: ExpeditionStop['exhibitKind'],
  storyBeat: string,
  principle: string,
  orbPrompt: string
): ExpeditionStop {
  return {
    id,
    order,
    title,
    locationLabel,
    worldPath,
    routePath,
    exhibitKind,
    storyBeat,
    principle,
    orbPrompt,
    interactiveAvailable: exhibitKind !== 'decision',
  };
}

export function buildDemoExpeditionCatalog(): InnovationExpedition[] {
  return [
    {
      id: 'exp-luxury-beauty',
      type: 'industry',
      title: 'Luxury Beauty™',
      subtitle: 'Walk through the evolution of premium beauty operations',
      industry: 'beauty',
      durationMinutes: 45,
      stopCount: 5,
      principleSummary: 'Luxury is systems — not aesthetics alone.',
      pathLevels: ['beginner', 'intermediate', 'founder', 'creative'],
      featured: true,
      stops: [
        stop('lb-1', 1, 'Grand Entrance™', 'Studio Archives™', 'archives/grand-entrance', '/admin/studio/studio-archives', 'gallery', 'Every luxury brand begins with preserved knowledge.', 'Archives are competitive advantage.', 'Notice how masterpieces are preserved before they are sold.'),
        stop('lb-2', 2, 'Customer Experience HQ™', 'Headquarters™', 'headquarters/customer-experience', '/admin/headquarters', 'headquarters', 'Luxury retail shifted when customer experience became headquarters.', 'Experience is a department — not a feature.', 'This Headquarters introduced a revolutionary customer experience.'),
        stop('lb-3', 3, 'Innovation Lineage Gallery™', 'Museum Wing™', 'archives/museum-wing/innovation-lineage-gallery', '/admin/studio/innovation-lineage-gallery', 'gallery', 'Every invention has a family tree preserved forever.', 'Lineage compounds Creative Equity™.', 'This Blueprint changed the Beauty Galaxy forever.'),
        stop('lb-4', 4, 'Marketplace Pavilion™', 'Marketplace™', 'marketplace/pavilion', '/admin/studio/marketplace', 'marketplace', 'Marketplace turned inventions into civilization-scale adoption.', 'Distribution completes innovation.', 'Would you like to explore the next breakthrough?'),
        stop('lb-5', 5, 'Innovation Constellations™', 'Living Universe Observatory™', 'archives/innovation-constellations', '/admin/studio/innovation-constellations', 'monument', 'Constellations reveal how entire categories evolved.', 'Industries are living universes.', 'Notice how this Innovation Graph connects to three industries.'),
      ],
      missions: [
        { id: 'm-lb-1', expeditionId: 'exp-luxury-beauty', title: 'Design a better headquarters', challenge: 'Reorganize the Customer Experience wing for luxury concierge flow.', skillArea: 'design', optional: true, completed: false },
        { id: 'm-lb-2', expeditionId: 'exp-luxury-beauty', title: 'Increase Marketplace value', challenge: 'Improve the Blueprint listing story for Creative Equity™.', skillArea: 'marketplace', optional: true, completed: false },
      ],
      rewards: [
        { id: 'r-lb-1', kind: 'knowledge', title: 'Luxury Beauty Knowledge™', description: 'Industry principles unlocked', unlocked: false },
        { id: 'r-lb-2', kind: 'certificate', title: 'Innovation Certificate™', description: 'Luxury Beauty expedition complete', unlocked: false },
      ],
    },
    {
      id: 'exp-cx-evolution',
      type: 'innovation',
      title: 'The Evolution of Customer Experience™',
      subtitle: 'From service desks to living headquarters',
      durationMinutes: 35,
      stopCount: 4,
      principleSummary: 'Customer experience evolves through headquarters — not slides.',
      pathLevels: ['beginner', 'operations', 'strategy', 'enterprise'],
      featured: true,
      stops: [
        stop('cx-1', 1, 'Innovation District™', 'Innovation Campus™', 'archives/innovation-district', '/admin/studio/innovation-district', 'district', 'Co-invention accelerated customer experience innovation.', 'Collaboration before competition.', 'Founders built CX together — not in isolation.'),
        stop('cx-2', 2, 'Hall of Innovation™', 'Studio Archives™', 'archives/hall-of-innovation', '/admin/studio/innovation-lab', 'gallery', 'The Hall documents every breakthrough.', 'Innovation must be visible.', 'Walk through real inventions — not case studies.'),
        stop('cx-3', 3, 'Marketing Headquarters™', 'Headquarters™', 'headquarters/marketing', '/admin/studio/campaign-engine', 'headquarters', 'Marketing became experience orchestration.', 'Brand is lived experience.', 'Observe how campaigns connect to headquarters.'),
        stop('cx-4', 4, 'Mission Control™', 'Command Center™', 'command-center', '/admin/studio/overview', 'decision', 'Executives unified CX decisions at Mission Control.', 'Strategy lives where decisions happen.', 'Replay the major decision that scaled CX.'),
      ],
      missions: [
        { id: 'm-cx-1', expeditionId: 'exp-cx-evolution', title: 'Improve navigation', challenge: 'Expand the Innovation District campus flow.', skillArea: 'navigation', optional: true, completed: false },
      ],
      rewards: [
        { id: 'r-cx-1', kind: 'blueprint', title: 'CX Blueprint™', description: 'Customer experience blueprint unlocked', unlocked: false },
      ],
    },
    {
      id: 'exp-founder-luxury-retail',
      type: 'founder',
      title: 'Legendary Luxury Retail Founder™',
      subtitle: 'Study headquarters growth and pivotal decisions',
      durationMinutes: 50,
      stopCount: 4,
      principleSummary: 'Founders win by replaying decisions — not reading advice.',
      pathLevels: ['founder', 'advanced', 'strategy'],
      featured: false,
      stops: [
        stop('fl-1', 1, 'Founder Operating System™', 'Executive District™', 'command-center/founder-os', '/admin/studio/founder-operating-system', 'headquarters', 'The founder built systems before scale.', 'Personal OS precedes company OS.', 'Walk through their daily operating rhythm.'),
        stop('fl-2', 2, 'Blueprint Archive™', 'Studio Archives™', 'archives/blueprint-archive', '/admin/studio/blueprint-manager', 'blueprint', 'Their first Blueprint became an industry standard.', 'Blueprints are founding documents.', 'Understand why this Blueprint succeeded.'),
        stop('fl-3', 3, 'Innovation Lineage Gallery™', 'Museum Wing™', 'archives/museum-wing/innovation-lineage-gallery', '/admin/studio/innovation-lineage-gallery', 'gallery', 'Failures were preserved — and became lessons.', 'Learn from failures as well as successes.', 'Study the fork that almost failed.'),
        stop('fl-4', 4, 'World Atlas™', 'Command Center™', 'command-center/world-atlas', '/admin/studio/world-atlas', 'monument', 'The company physically grew across Studio World.', 'Headquarters expansion tells the story.', 'Watch headquarters grow over time on the Atlas.'),
      ],
      missions: [
        { id: 'm-fl-1', expeditionId: 'exp-founder-luxury-retail', title: 'Replay a major decision', challenge: 'Choose the alternate path at Mission Control.', skillArea: 'operations', optional: false, completed: false },
      ],
      rewards: [
        { id: 'r-fl-1', kind: 'artifact', title: 'Founder Decision Artifact™', description: 'Historical decision preserved', unlocked: false },
      ],
    },
    {
      id: 'exp-frontal-slayer',
      type: 'company',
      title: 'The Evolution of Frontal Slayer™',
      subtitle: 'From idea to enterprise inside Studio World',
      durationMinutes: 60,
      stopCount: 5,
      principleSummary: 'Companies are physical places that grow.',
      pathLevels: ['beginner', 'founder', 'enterprise', 'operations'],
      featured: true,
      stops: [
        stop('fs-1', 1, 'Business Discovery Blueprint™', 'Expedition Hub™', 'expedition/discovery', '/admin/studio/business-discovery-blueprint', 'gallery', 'Every company begins with a living Blueprint.', 'Discovery is the birth certificate.', 'From idea — the Blueprint captured the vision.'),
        stop('fs-2', 2, 'Organization Inauguration™', 'Command Center™', 'command-center/inauguration', '/admin/studio/organization-inauguration', 'monument', 'Inauguration activated Headquarters.', 'Ceremony creates memory.', 'Watch the headquarters physically activate.'),
        stop('fs-3', 3, 'Mission Control™', 'Executive Atrium™', 'command-center', '/admin/studio/overview', 'headquarters', 'Startup became operations at Mission Control.', 'Scale requires executive systems.', 'Observe daily operations at scale.'),
        stop('fs-4', 4, 'Studio Warehouse™', 'Production Wing™', 'warehouse', '/admin/studio/studio-warehouse', 'district', 'Production scaled in the Warehouse.', 'Creation requires infrastructure.', 'Walk the production floor.'),
        stop('fs-5', 5, 'Marketplace Pavilion™', 'Marketplace™', 'marketplace/pavilion', '/admin/studio/marketplace', 'marketplace', 'Enterprise distribution through Marketplace.', 'Marketplace completes the loop.', 'See how the company teaches others.'),
      ],
      missions: [
        { id: 'm-fs-1', expeditionId: 'exp-frontal-slayer', title: 'Reduce Creative Budget', challenge: 'Optimize a production workflow in Studio Warehouse.', skillArea: 'operations', optional: true, completed: false },
        { id: 'm-fs-2', expeditionId: 'exp-frontal-slayer', title: 'Expand Innovation District', challenge: 'Propose a new co-invention campus wing.', skillArea: 'innovation', optional: true, completed: false },
      ],
      rewards: [
        { id: 'r-fs-1', kind: 'district', title: 'Innovation District Access™', description: 'New district pathways unlocked', unlocked: false },
        { id: 'r-fs-2', kind: 'creative-equity', title: 'Creative Equity™ +12', description: 'Company expedition contribution', unlocked: false },
      ],
    },
    {
      id: 'exp-luxury-cx-blueprint',
      type: 'blueprint',
      title: 'Luxury Customer Experience HQ™ Blueprint',
      subtitle: 'Original invention through forks, merges, and descendants',
      durationMinutes: 40,
      stopCount: 4,
      principleSummary: 'Blueprints evolve — lineage is permanent.',
      pathLevels: ['intermediate', 'advanced', 'creative', 'operations'],
      featured: true,
      stops: [
        stop('bp-1', 1, 'Blueprint Archive™', 'Studio Archives™', 'archives/blueprint-archive', '/admin/studio/blueprint-manager', 'blueprint', 'Original invention — the founding Blueprint.', 'Every fork preserves lineage.', 'Follow the original invention.'),
        stop('bp-2', 2, 'Innovation Lineage Gallery™', 'Museum Wing™', 'archives/museum-wing/innovation-lineage-gallery', '/admin/studio/innovation-lineage-gallery', 'gallery', 'Five generations of evolution documented.', 'Forks and merges tell the truth.', 'Study forks, merges, and contributors.'),
        stop('bp-3', 3, 'Innovation Constellations™', 'Observatory™', 'archives/innovation-constellations', '/admin/studio/innovation-constellations', 'monument', 'Industry adoption visible as constellation stars.', 'Adoption is celestial — not a metric.', 'See current descendants in the universe.'),
        stop('bp-4', 4, 'Marketplace Pavilion™', 'Marketplace™', 'marketplace/pavilion', '/admin/studio/marketplace', 'marketplace', 'Marketplace Bestseller™ — 18,400+ companies.', 'Success is civilization-scale.', 'Marketplace performance and business impact.'),
      ],
      missions: [
        { id: 'm-bp-1', expeditionId: 'exp-luxury-cx-blueprint', title: 'Improve this Blueprint', challenge: 'Propose one enhancement that preserves lineage.', skillArea: 'design', optional: true, completed: false },
      ],
      rewards: [
        { id: 'r-bp-1', kind: 'blueprint', title: 'Blueprint Fork License™', description: 'Fork with lineage preserved', unlocked: false },
        { id: 'r-bp-2', kind: 'collectible', title: 'Lineage Collectible™', description: 'Museum artifact unlocked', unlocked: false },
      ],
    },
  ];
}

export function filterStopsForPath(
  expedition: InnovationExpedition,
  pathLevel: ExpeditionPathLevel
): ExpeditionStop[] {
  if (!expedition.pathLevels.includes(pathLevel)) {
    return expedition.stops.slice(0, Math.max(2, Math.ceil(expedition.stops.length * 0.6)));
  }
  if (pathLevel === 'beginner') return expedition.stops.slice(0, Math.min(3, expedition.stops.length));
  if (pathLevel === 'advanced' || pathLevel === 'enterprise') return expedition.stops;
  return expedition.stops;
}

export function getExpeditionById(
  expeditions: InnovationExpedition[],
  id: string
): InnovationExpedition | null {
  return expeditions.find((e) => e.id === id) ?? null;
}
