/**
 * PSA mood — founder-led emotional state for replies (not just avatar expressions).
 * Avatar PNG hints mirror client `resolvePsaAvatarExpression.ts` (v5 slugs).
 */
export type PsaAvatarExpressionSlug =
  | 'neutral'
  | 'neutral-smiling'
  | 'waving'
  | 'listening'
  | 'thinking-smiling'
  | 'thinking'
  | 'delighted'
  | 'sorry'
  | 'pointing'
  | 'talking'
  | 'presenting'
  | 'remembering'
  | 'remembering-ask'
  | 'memory-locked'
  | 'curator'
  | 'honest-pushback'
  | 'archetype-quiz'
  | 'archetype-reveal'
  | 'red-carpet'
  | 'blueprint'
  | 'slay-forecast'
  | 'celebrating'
  | 'reassuring'
  | 'spotlight';

export type PsaMoodId =
  | 'default'
  | 'proud'
  | 'excited'
  | 'celebratory'
  | 'thoughtful'
  | 'private_client';

export type PsaSessionModeSlug =
  | 'talk_me_out_of_it'
  | 'event_ready'
  | 'what_would_you_pick'
  | 'what_might_i_regret'
  | 'slay_forecast'
  | 'build_my_look'
  | 'why_this'
  | 'red_carpet';

export type PsaMoodPayload = {
  mood?: PsaMoodId;
  moodReason?: string;
  isBlackTier?: boolean;
  pendingMilestone?: string | null;
  sessionMode?: PsaSessionModeSlug;
  redCarpetMode?: boolean;
};

/** Suggested avatar slug for instructions / future server-driven avatar hints. */
export function resolvePsaAvatarExpressionHint(payload: PsaMoodPayload): PsaAvatarExpressionSlug | null {
  if (payload.redCarpetMode || payload.sessionMode === 'red_carpet') {
    return 'red-carpet';
  }

  const mood = payload.mood ?? 'default';

  if (
    payload.sessionMode === 'talk_me_out_of_it' ||
    payload.sessionMode === 'what_might_i_regret' ||
    payload.sessionMode === 'why_this'
  ) {
    return 'honest-pushback';
  }

  if (payload.sessionMode === 'what_would_you_pick') {
    return 'spotlight';
  }

  if (payload.sessionMode === 'slay_forecast') {
    return 'slay-forecast';
  }

  if (payload.sessionMode === 'build_my_look' || payload.sessionMode === 'event_ready') {
    return 'blueprint';
  }

  if (mood === 'celebratory' || mood === 'proud' || mood === 'excited') {
    return 'celebrating';
  }

  if (mood === 'private_client' || payload.isBlackTier) {
    return 'curator';
  }

  if (mood === 'thoughtful') {
    return 'honest-pushback';
  }

  return null;
}

export function resolvePsaMoodInstruction(payload: PsaMoodPayload): string {
  const mood = payload.mood ?? 'default';
  if (mood === 'default' && !payload.isBlackTier) return '';

  const lines = ['## PSA mood (this session — shape tone, not sales pressure)'];

  if (payload.isBlackTier) {
    lines.push(
      '- **Private client energy (BLACK):** Subtle, exclusive, never popup promo tone. You may open with "I have something I think you would like" only when you have a genuine catalog or Lounge match. No fake scarcity.'
    );
  }

  switch (mood) {
    case 'proud':
      lines.push(
        '- **Proud mode:** They hit a meaningful milestone (first install, first order, profile set). Celebrate with conviction. Example energy: "Okay — now we are getting somewhere." No pet name stacking.'
      );
      break;
    case 'excited':
      lines.push(
        '- **Excited mode:** Something positive is in motion (new order placed, restock on wishlist). High energy but still luxury, not cheesy.'
      );
      break;
    case 'celebratory':
      lines.push(
        `- **Celebratory mode:** Hall of Slay milestone${payload.pendingMilestone ? ` (${payload.pendingMilestone})` : ''}. Commemorate, do not gamify. One short celebration block, then helpful next step.`
      );
      break;
    case 'thoughtful':
      lines.push(
        '- **Thoughtful mode:** They are in regret-prevention or honesty mode. Slow down, ask one sharp question, disagree respectfully when needed.'
      );
      break;
    case 'private_client':
      lines.push(
        '- **Private client mode:** BLACK tier — curator energy, fewer options, more conviction.'
      );
      break;
    default:
      break;
  }

  if (payload.moodReason?.trim()) {
    lines.push(`- Mood trigger: ${payload.moodReason.trim()}`);
  }

  return lines.length > 1 ? `\n${lines.join('\n')}\n` : '';
}
