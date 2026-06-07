import {
  PSA_TALKING_AFTER_REPLY_MS,
  type PsaAvatarExpression,
} from '../../constants/psaConfig';
import type { PsaMoodId } from '../../utils/psaMood';
import {
  inferPsaSessionModeFromUserText,
  type PsaSessionMode,
} from '../../utils/psaSessionContext';
import type { PsaChatMessage } from './usePsaChat';

const PRODUCT_KEYWORDS =
  /\b(noir|blanco|soft wave|beach wave|soft curl|ocean curl|unit|wig|build-a-wig|texture|straight|wavy|curly)\b/i;

const DELIGHTED_KEYWORDS =
  /\b(perfect|great choice|love that|absolutely|happy to help|you're all set|sounds great)\b/i;

const REASSURING_KEYWORDS =
  /\b(don't worry|do not worry|you're good|you are good|you've got this|we've got you|take your time|no rush|you're covered|you are covered)\b/i;

const CURATOR_KEYWORDS =
  /\b(lounge|founder pick|curator|lesson|hall of slay|private selection)\b/i;

const BLUEPRINT_KEYWORDS =
  /\b(blueprint|install date|maintenance plan|full look|entire look|event ready|slay forecast)\b/i;

const CELEBRATION_KEYWORDS =
  /\b(congratulations|celebrate|milestone|hall of slay|order placed|shipped|delivered)\b/i;

const ARCHETYPE_REVEAL_PATTERN = /\bYOUR SLAY ARCHETYPE IS\b/i;

const MEMORY_RECALL_PATTERN =
  /\b(I remember you|still shopping with your|remember you chose|don't forget why)\b/i;

/** In-app paths like /account/concierge */
export function psaMessageHasNavPaths(text: string): boolean {
  return /\/(?:[a-z0-9-]+\/)*[a-z0-9-]+/i.test(text);
}

export function psaMessageHasProductMention(text: string): boolean {
  return PRODUCT_KEYWORDS.test(text);
}

export type ResolvePsaAvatarExpressionInput = {
  isChatOpen: boolean;
  isSending: boolean;
  isInputFocused: boolean;
  inputHasText: boolean;
  showWelcomeWave: boolean;
  redCarpetMode?: boolean;
  sessionMode?: PsaSessionMode;
  mood?: PsaMoodId;
  welcomeHasMemoryHint?: boolean;
  proactiveNudgeKind?: string | null;
  lastReplyAt: number | null;
  now?: number;
  messages: PsaChatMessage[];
};

export function resolveActivePsaSessionMode(
  messages: PsaChatMessage[],
  redCarpetMode?: boolean
): PsaSessionMode | undefined {
  if (redCarpetMode) return 'red_carpet';
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message.role !== 'user') continue;
    const mode = inferPsaSessionModeFromUserText(message.content);
    if (mode) return mode;
  }
  return undefined;
}

/**
 * Pick avatar expression — highest-priority state wins.
 * See docs/PSA_SETUP.md for expression → filename map.
 */
export function resolvePsaAvatarExpression(input: ResolvePsaAvatarExpressionInput): PsaAvatarExpression {
  const now = input.now ?? Date.now();
  const last = input.messages[input.messages.length - 1];
  const sessionMode =
    input.sessionMode ?? resolveActivePsaSessionMode(input.messages, input.redCarpetMode);
  const lastAssistantText = last?.role === 'assistant' ? last.content : '';
  const withinTalkingWindow =
    input.lastReplyAt != null && now - input.lastReplyAt < PSA_TALKING_AFTER_REPLY_MS;

  if (input.isSending) return 'thinking';

  if (last?.role === 'system') return 'sorry';

  if (input.showWelcomeWave && input.isChatOpen) return 'waving';

  if (input.isChatOpen && input.isInputFocused) {
    return input.inputHasText ? 'thinking-smiling' : 'listening';
  }

  if (
    input.isChatOpen &&
    last?.role === 'assistant' &&
    ARCHETYPE_REVEAL_PATTERN.test(lastAssistantText) &&
    withinTalkingWindow
  ) {
    return 'archetype-reveal';
  }

  if (input.isChatOpen && input.redCarpetMode && !input.isInputFocused && !input.isSending) {
    return 'red-carpet';
  }

  if (
    input.isChatOpen &&
    last?.role === 'assistant' &&
    (sessionMode === 'talk_me_out_of_it' ||
      sessionMode === 'what_might_i_regret' ||
      sessionMode === 'why_this')
  ) {
    return 'honest-pushback';
  }

  if (input.isChatOpen && last?.role === 'assistant' && sessionMode === 'what_would_you_pick') {
    return 'spotlight';
  }

  if (
    input.isChatOpen &&
    last?.role === 'assistant' &&
    (sessionMode === 'build_my_look' ||
      sessionMode === 'event_ready' ||
      sessionMode === 'slay_forecast' ||
      BLUEPRINT_KEYWORDS.test(lastAssistantText))
  ) {
    return 'blueprint';
  }

  if (
    input.isChatOpen &&
    last?.role === 'assistant' &&
    (input.mood === 'celebratory' ||
      input.mood === 'proud' ||
      input.mood === 'excited' ||
      input.proactiveNudgeKind === 'order_celebration' ||
      input.proactiveNudgeKind === 'member_milestone' ||
      CELEBRATION_KEYWORDS.test(lastAssistantText))
  ) {
    return 'celebrating';
  }

  if (
    input.isChatOpen &&
    last?.role === 'assistant' &&
    (input.mood === 'private_client' || CURATOR_KEYWORDS.test(lastAssistantText))
  ) {
    return 'curator';
  }

  if (
    input.isChatOpen &&
    (input.welcomeHasMemoryHint ||
      input.proactiveNudgeKind === 'purchase_memory' ||
      (last?.role === 'assistant' && MEMORY_RECALL_PATTERN.test(lastAssistantText)))
  ) {
    const fewMessages = input.messages.length <= 3;
    if (fewMessages || MEMORY_RECALL_PATTERN.test(lastAssistantText)) {
      return 'remembering';
    }
  }

  if (input.isChatOpen && last?.role === 'assistant' && REASSURING_KEYWORDS.test(lastAssistantText)) {
    return 'reassuring';
  }

  if (input.isChatOpen && last?.role === 'assistant') {
    const text = lastAssistantText;

    if (psaMessageHasNavPaths(text)) return 'pointing';

    if (psaMessageHasProductMention(text)) return 'presenting';

    if (withinTalkingWindow) {
      return 'talking';
    }

    if (DELIGHTED_KEYWORDS.test(text)) return 'delighted';
  }

  if (input.isChatOpen) return 'neutral-smiling';

  return 'neutral';
}
