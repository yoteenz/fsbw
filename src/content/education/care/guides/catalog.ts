import type { CareGuide } from '../../types';
import { CARE_GUIDE_SLOTS } from './slots';

const byId = new Map(CARE_GUIDE_SLOTS.map((g) => [g.id, g]));
const bySlug = new Map(CARE_GUIDE_SLOTS.map((g) => [g.slug, g]));

export function getAllCareGuides(): CareGuide[] {
  return CARE_GUIDE_SLOTS.filter((g) => g.published !== false);
}

export function getCareGuideById(id: string): CareGuide | undefined {
  return byId.get(id);
}

export function getCareGuideBySlug(slug: string): CareGuide | undefined {
  return bySlug.get(slug);
}

export function getCareGuidesByCategory(category: string): CareGuide[] {
  return getAllCareGuides().filter((g) => g.category === category);
}

export const CARE_GUIDE_LIBRARY_RAIL = {
  id: 'care-your-care-guides',
  title: 'YOUR CARE GUIDES',
} as const;

export function getCareGuidesForLibrary(unlockedIds: Set<string>): CareGuide[] {
  return getAllCareGuides().filter((g) => unlockedIds.has(g.id));
}
