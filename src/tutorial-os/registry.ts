import type { TutorialTour, TutorialStep } from './types';
import { compileAllTourDefinitionsV2 } from './v2/compiler';
import { MANSION_TOUR_V2_DEF } from './tours/v2/mansionTourV2';
import { VOUCHERS_WALKTHROUGH_DEF } from './tours/v2/vouchersWalkthrough';
import {
  WISHLIST_TOUR_DEF,
  CHECKOUT_TOUR_DEF,
  REWARDS_TOUR_DEF,
  BUILD_A_WIG_TOUR_DEF,
} from './tours/v2/expandedTours';
import { PLACEHOLDER_TOURS } from './tours/placeholders';

const V2_DEFINITIONS = [
  MANSION_TOUR_V2_DEF,
  VOUCHERS_WALKTHROUGH_DEF,
  WISHLIST_TOUR_DEF,
  CHECKOUT_TOUR_DEF,
  REWARDS_TOUR_DEF,
  BUILD_A_WIG_TOUR_DEF,
];

const V2_TOURS = compileAllTourDefinitionsV2(V2_DEFINITIONS);

/** Legacy placeholder tours not yet migrated to V2 defs. */
const LEGACY_PLACEHOLDERS = PLACEHOLDER_TOURS.filter(
  (t) => !V2_TOURS.some((v2) => v2.id === t.id)
);

const ALL_TOURS: TutorialTour[] = [...V2_TOURS, ...LEGACY_PLACEHOLDERS];

export function getAllTours(): TutorialTour[] {
  return ALL_TOURS.map((t) => ({
    ...t,
    steps: [...t.steps].sort((a, b) => a.order - b.order),
  }));
}

export function getTourById(tourId: string): TutorialTour | undefined {
  return getAllTours().find((t) => t.id === tourId);
}

export function getEnabledTours(): TutorialTour[] {
  return getAllTours().filter((t) => t.status === 'enabled' && t.steps.length > 0);
}

export function getFeaturedTour(): TutorialTour | undefined {
  return getEnabledTours().find((t) => t.featured);
}

export function getTourSteps(tourId: string): TutorialStep[] {
  return getTourById(tourId)?.steps ?? [];
}

export function getStepById(tourId: string, stepId: string): TutorialStep | undefined {
  return getTourSteps(tourId).find((s) => s.id === stepId);
}

export function findStepIndex(tourId: string, stepId: string): number {
  return getTourSteps(tourId).findIndex((s) => s.id === stepId);
}
