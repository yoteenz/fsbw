/**
 * Mentor schema — guides learners inside the workplace simulation.
 */

import type { PersistentNPCState } from '../characters/schema';

export type MentorNote = {
  id: string;
  mentorCharacterId: string;
  summary: string;
  focusAreas: string[];
  recordedAt: string;
};

export type MentorSessionBrief = {
  mentor: PersistentNPCState;
  preShiftNotes: MentorNote[];
  postShiftDebrief?: string;
  promotionRecommendation?: 'not-ready' | 'approaching' | 'ready';
};

export function buildMentorSessionBrief(
  mentor: PersistentNPCState,
  shiftSummary: string
): MentorSessionBrief {
  return {
    mentor,
    preShiftNotes: [
      {
        id: `${mentor.characterId}-pre-shift`,
        mentorCharacterId: mentor.characterId,
        summary: `${mentor.displayName} expects professional standards from the first client interaction.`,
        focusAreas: mentor.knowledge.slice(0, 2).map((slice) => slice.label),
        recordedAt: new Date().toISOString(),
      },
    ],
    postShiftDebrief: `${mentor.displayName} reviewed the shift: ${shiftSummary}`,
    promotionRecommendation: 'approaching',
  };
}
