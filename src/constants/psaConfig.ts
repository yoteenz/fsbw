/** PSA (Personal Slay Assistant) frontend config — avatar assets and copy. */

import { getCurrentUserFirstNameFromStorage } from '../utils/perUserStorage';
import {
  resolvePsaWelcomeKind,
  type PsaWelcomeKind,
} from '../utils/psaWelcomeState';

/** All PSA avatar expression PNGs live in `public/assets/` (transparent background). */
export type PsaAvatarExpression =
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
  | 'presenting';

/** Bump when avatar PNGs change so browsers/CDN drop cached checkerboard versions. */
export const PSA_AVATAR_ASSET_VERSION = '5';

/** Expression → asset path (filename must match exactly in `public/assets/`). */
export const PSA_AVATAR_SRC: Record<PsaAvatarExpression, string> = {
  neutral: '/assets/psa-avatar-neutral.png',
  'neutral-smiling': '/assets/psa-avatar-neutral-smiling.png',
  waving: '/assets/psa-avatar-waving.png',
  listening: '/assets/psa-avatar-listening.png',
  'thinking-smiling': '/assets/psa-avatar-thinking-smiling.png',
  thinking: '/assets/psa-avatar-thinking.png',
  delighted: '/assets/psa-avatar-delighted.png',
  sorry: '/assets/psa-avatar-sorry.png',
  pointing: '/assets/psa-avatar-pointing.png',
  talking: '/assets/psa-avatar-talking.png',
  presenting: '/assets/psa-avatar-presenting.png',
};

/** Default FAB when chat is closed. */
export const PSA_AVATAR_DEFAULT_EXPRESSION: PsaAvatarExpression = 'neutral';

/** Fallback if a specific PNG is missing. */
export const PSA_AVATAR_FALLBACK_SRC = PSA_AVATAR_SRC.neutral;

/** @deprecated Use PSA_AVATAR_SRC.neutral — kept for older references. */
export const PSA_AVATAR_IDLE_SRC = PSA_AVATAR_SRC.neutral;

/** @deprecated Use PSA_AVATAR_SRC.thinking */
export const PSA_AVATAR_THINKING_SRC = PSA_AVATAR_SRC.thinking;

export const PSA_WIDGET_LABEL = 'PSA';
export const PSA_WIDGET_SUBLABEL = 'PERSONAL SLAY ASSISTANT';

/** FAB caption under avatar — action-oriented so members know it is tappable. */
export const PSA_WIDGET_CTA = 'TAP TO CHAT';

/** When a recent thread exists, FAB shows continue copy instead. */
export const PSA_CONTINUE_CTA = 'CONTINUE CHAT';

/** Crossfade duration when switching avatar PNG expressions (ms). */
export const PSA_EXPRESSION_CROSSFADE_MS = 1200;

/** @deprecated Idle uses PSA_IDLE_EXPRESSION_CYCLE step holds instead. */
export const PSA_IDLE_EXPRESSION_MS = 3500;

/** How often the closed FAB plays a brief waving expression (ms). */
export const PSA_IDLE_WAVE_INTERVAL_MS = 30_000;

export const PSA_CHAT_TITLE = 'PSA';
export const PSA_CHAT_SUBTITLE = 'PERSONAL SLAY ASSISTANT';

/** Title-case first name for greetings (Settings often stores ALL CAPS). */
export function formatPsaMemberFirstName(raw: string): string {
  const first = raw.trim().split(/\s+/)[0];
  if (!first) return '';
  if (first.length > 1 && first === first.toUpperCase()) {
    return first.charAt(0) + first.slice(1).toLowerCase();
  }
  return first.charAt(0).toUpperCase() + first.slice(1);
}

/** Welcome bubble when chat opens with no prior thread. */
export function buildPsaWelcomeMessage(options?: {
  firstName?: string | null;
  kind?: PsaWelcomeKind;
}): string {
  const rawName = options?.firstName ?? getCurrentUserFirstNameFromStorage();
  const formatted = rawName?.trim() ? formatPsaMemberFirstName(rawName) : '';
  const kind = options?.kind ?? 'default';

  let greeting = '';
  if (kind === 'first') {
    greeting = formatted ? `Welcome, ${formatted}!` : 'Welcome!';
  } else if (kind === 'returning') {
    greeting = formatted ? `Welcome back, ${formatted}!` : 'Welcome back!';
  }

  const intro = greeting ? `${greeting} I'm your PSA.` : `I'm your PSA.`;
  return `${intro} What are you looking for today: new hair, maintenance, customization or a little bit of everything?`;
}

/** Welcome message using Settings first name + first-unlock / return-session rules. */
export function readPsaWelcomeMessageFromStorage(): string {
  return buildPsaWelcomeMessage({
    firstName: getCurrentUserFirstNameFromStorage(),
    kind: resolvePsaWelcomeKind(),
  });
}

/** @deprecated Prefer readPsaWelcomeMessageFromStorage() or buildPsaWelcomeMessage(). */
export const PSA_WELCOME_MESSAGE = buildPsaWelcomeMessage();

/** Starter quick-reply chips when the thread is welcome-only (empty chat). */
export const PSA_STARTER_QUICK_REPLIES = [
  'HELP ME CHOOSE',
  'WHAT WOULD YOU PICK?',
  'TRACK MY ORDER',
  'SHOULD I REALLY BUY THIS?',
  'GET ME EVENT READY',
] as const;

/** How long to show waving when the chat panel opens or during idle wave. */
export const PSA_WAVING_MS = 3200;

/** How long to show talking after an assistant reply lands. */
export const PSA_TALKING_AFTER_REPLY_MS = 2800;

/** Routes where the floating PSA widget is hidden (admin chrome, full-screen checkout modals). */
export const PSA_HIDDEN_PATH_PREFIXES = ['/admin'];

export function isPsaHiddenPath(pathname: string): boolean {
  return PSA_HIDDEN_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function getPsaAvatarSrc(expression: PsaAvatarExpression): string {
  const base = PSA_AVATAR_SRC[expression] ?? PSA_AVATAR_FALLBACK_SRC;
  return `${base}?v=${PSA_AVATAR_ASSET_VERSION}`;
}
