import {
  PSA_TALKING_AFTER_REPLY_MS,
  type PsaAvatarExpression,
} from '../../constants/psaConfig';
import type { PsaChatMessage } from './usePsaChat';

const PRODUCT_KEYWORDS =
  /\b(noir|blanco|soft wave|beach wave|soft curl|ocean curl|unit|wig|build-a-wig|texture|straight|wavy|curly)\b/i;

const DELIGHTED_KEYWORDS =
  /\b(perfect|great choice|love that|absolutely|happy to help|you're all set|sounds great)\b/i;

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
  lastReplyAt: number | null;
  now?: number;
  messages: PsaChatMessage[];
};

/**
 * Pick avatar expression — highest-priority state wins.
 * See docs/PSA_SETUP.md for expression → filename map.
 */
export function resolvePsaAvatarExpression(input: ResolvePsaAvatarExpressionInput): PsaAvatarExpression {
  const now = input.now ?? Date.now();
  const last = input.messages[input.messages.length - 1];

  if (input.isSending) return 'thinking';

  if (last?.role === 'system') return 'sorry';

  if (input.showWelcomeWave && input.isChatOpen) return 'waving';

  if (input.isChatOpen && input.isInputFocused) {
    return input.inputHasText ? 'listening-smiling' : 'listening';
  }

  if (input.isChatOpen && last?.role === 'assistant') {
    const text = last.content;

    if (psaMessageHasNavPaths(text)) return 'pointing';

    if (psaMessageHasProductMention(text)) return 'presenting';

    if (
      input.lastReplyAt != null &&
      now - input.lastReplyAt < PSA_TALKING_AFTER_REPLY_MS
    ) {
      return 'talking';
    }

    if (DELIGHTED_KEYWORDS.test(text)) return 'delighted';
  }

  if (input.isChatOpen) return 'neutral-smiling';

  return 'neutral';
}
