import type { CareGuide, CareLesson } from '../../types';
import { CARE_LESSON_SLOTS } from '../lessons/slots';

function lessonToCareGuide(lesson: CareLesson): CareGuide {
  return {
    ...lesson,
    contentType: 'care-guide',
    accessType: 'qualifying-product',
    format: lesson.videoUrl ? 'video' : 'mixed',
    shortDescription: lesson.shortDescription,
    applicability: lesson.careApplicability ?? lesson.applicability,
    visibility: 'owner-library-only',
  };
}

/** Canonical Care Guide registry — structural slots only, NOT final owner curriculum. */
export const CARE_GUIDE_SLOTS: CareGuide[] = CARE_LESSON_SLOTS.map(lessonToCareGuide);
