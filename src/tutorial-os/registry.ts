import type { TutorialTour, TutorialStep } from './types';
import { MANSION_TOUR } from './tours/mansionTour';
import { PLACEHOLDER_TOURS } from './tours/placeholders';

const ALL_TOURS: TutorialTour[] = [MANSION_TOUR, ...PLACEHOLDER_TOURS];

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
