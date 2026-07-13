import type { BusinessArchetype, BusinessArchetypeId } from './contract';
import { INDUSTRY_PACKS_VERSION } from './contract';

function archetype(
  archetypeId: BusinessArchetypeId,
  displayName: string,
  description: string
): BusinessArchetype {
  return { archetypeId, displayName, description, registryVersion: INDUSTRY_PACKS_VERSION };
}

/** Permanent Business Archetype Registry™ — categories containing Industry Packs. */
export const BUSINESS_ARCHETYPE_REGISTRY: BusinessArchetype[] = [
  archetype('beauty', 'Beauty', 'Salons, spas, and personal care headquarters'),
  archetype('healthcare', 'Healthcare', 'Medical, dental, and wellness practices'),
  archetype('professional-services', 'Professional Services', 'Law, accounting, marketing, and consulting firms'),
  archetype('retail', 'Retail', 'Boutiques, shops, and consumer retail headquarters'),
  archetype('hospitality', 'Hospitality', 'Hotels, venues, and guest experience campuses'),
  archetype('fitness', 'Fitness', 'Gyms, studios, and athletic facilities'),
  archetype('education', 'Education', 'Academies, training, and learning campuses'),
  archetype('entertainment', 'Entertainment', 'Studios, venues, and production headquarters'),
  archetype('technology', 'Technology', 'Software, hardware, and innovation campuses'),
  archetype('finance', 'Finance', 'Banks, advisory, and financial operations'),
  archetype('construction', 'Construction', 'Builders, contractors, and field operations'),
  archetype('manufacturing', 'Manufacturing', 'Production floors and industrial headquarters'),
  archetype('automotive', 'Automotive', 'Dealerships, service, and mobility campuses'),
  archetype('government', 'Government', 'Municipal and civic operations'),
  archetype('non-profit', 'Non-Profit', 'Mission-driven organization headquarters'),
  archetype('food-beverage', 'Food & Beverage', 'Restaurants, cafes, and culinary brands'),
  archetype('creative', 'Creative', 'Design, media, and creative agency campuses'),
  archetype('real-estate', 'Real Estate', 'Brokerages and property operations'),
  archetype('wellness', 'Wellness', 'Holistic health and lifestyle brands'),
  archetype('custom', 'Custom', 'Founder-defined archetype for bespoke headquarters'),
];

export function getBusinessArchetype(id: BusinessArchetypeId): BusinessArchetype | undefined {
  return BUSINESS_ARCHETYPE_REGISTRY.find((a) => a.archetypeId === id);
}

export function listArchetypes(): BusinessArchetype[] {
  return [...BUSINESS_ARCHETYPE_REGISTRY];
}

export function listArchetypeIds(): BusinessArchetypeId[] {
  return BUSINESS_ARCHETYPE_REGISTRY.map((a) => a.archetypeId);
}
