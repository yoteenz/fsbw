import type { CareGuide, CareLesson } from '../types';
import {
  getAllCareGuides,
  getCareGuideById,
  getCareGuideBySlug,
  getCareGuidesByCategory,
  getCareGuidesForLibrary,
  CARE_GUIDE_LIBRARY_RAIL,
} from './guides/catalog';
import {
  resolveCareAccessForGuides,
  resolveUnlockedCareGuideIds,
  resolveCareAccessForLessons,
  resolveUnlockedCareLessonIds,
  type CareAccessResolution,
} from './careAccessResolver';

export {
  getAllCareGuides,
  getCareGuideById,
  getCareGuideBySlug,
  getCareGuidesByCategory,
  getCareGuidesForLibrary,
  CARE_GUIDE_LIBRARY_RAIL,
};

export function getAllCareLessons(): CareLesson[] {
  return getAllCareGuides() as CareLesson[];
}

export function getCareLessonById(id: string): CareLesson | undefined {
  return getCareGuideById(id) as CareLesson | undefined;
}

export function getCareLessonBySlug(slug: string): CareLesson | undefined {
  return getCareGuideBySlug(slug) as CareLesson | undefined;
}

export function getCareLessonsByCategory(category: string): CareLesson[] {
  return getCareGuidesByCategory(category) as CareLesson[];
}

export {
  resolveCareAccessForGuides,
  resolveUnlockedCareGuideIds,
  resolveCareAccessForLessons,
  resolveUnlockedCareLessonIds,
  type CareAccessResolution,
};

export const CARE_LEARN_RAILS = [
  { id: 'care-your-care-guides', title: 'YOUR CARE GUIDES' },
  { id: 'care-your-library', title: 'YOUR CARE LIBRARY' },
  { id: 'care-universal', title: 'UNIVERSAL HAIR CARE' },
  { id: 'care-unit', title: 'UNIT CARE' },
  { id: 'care-texture', title: 'TEXTURE CARE' },
] as const;

export function getCareGuidesForLearnRail(railId: string, unlockedIds: Set<string>): CareGuide[] {
  const all = getAllCareGuides();
  switch (railId) {
    case 'care-your-care-guides':
    case 'care-your-library':
      return all.filter((g) => unlockedIds.has(g.id));
    case 'care-universal':
      return all.filter((g) => g.tags?.includes('universal'));
    case 'care-unit':
      return all.filter((g) => g.applicableProductTypes?.includes('unit'));
    case 'care-texture':
      return all.filter((g) => g.applicableTextures?.length);
    default:
      return [];
  }
}

/** @deprecated Use getCareGuidesForLearnRail */
export function getCareLessonsForLearnRail(railId: string, unlockedIds: Set<string>): CareLesson[] {
  return getCareGuidesForLearnRail(railId, unlockedIds) as CareLesson[];
}
