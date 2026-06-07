/**
 * Client PSA mood — shapes reply tone via session context (not avatar PNG).
 */
import type { PsaSessionMode } from './psaSessionContext';
import type { HallOfSlayMilestoneId } from './psaSlayJournal';

export type PsaMoodId =
  | 'default'
  | 'proud'
  | 'excited'
  | 'celebratory'
  | 'thoughtful'
  | 'private_client';

export function resolvePsaMood(input: {
  mode?: PsaSessionMode;
  tierLabel?: string | null;
  pendingMilestone?: HallOfSlayMilestoneId | null;
  hasRecentPlacedOrder?: boolean;
  hasDeliveredOrder?: boolean;
}): { mood: PsaMoodId; moodReason?: string } {
  const tier = (input.tierLabel ?? '').trim().toUpperCase();

  if (input.mode === 'what_might_i_regret' || input.mode === 'talk_me_out_of_it') {
    return { mood: 'thoughtful', moodReason: 'Honesty / regret-prevention mode' };
  }

  if (input.pendingMilestone) {
    return {
      mood: 'celebratory',
      moodReason: `Hall of Slay milestone pending: ${input.pendingMilestone}`,
    };
  }

  if (input.hasDeliveredOrder) {
    return { mood: 'proud', moodReason: 'Recent delivery milestone' };
  }

  if (input.hasRecentPlacedOrder) {
    return { mood: 'excited', moodReason: 'New order in motion' };
  }

  if (tier === 'BLACK') {
    return { mood: 'private_client', moodReason: 'BLACK tier private client energy' };
  }

  if (input.mode === 'build_my_look' || input.mode === 'slay_forecast') {
    return { mood: 'excited', moodReason: 'Event planning mode' };
  }

  return { mood: 'default' };
}
