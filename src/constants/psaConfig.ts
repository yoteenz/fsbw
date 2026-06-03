/** PSA (Personal Slay Assistant) frontend config — avatar assets and copy. */

/** Replace with your Fal-generated transparent PNG when ready (see docs/PSA_SETUP.md). */
export const PSA_AVATAR_IDLE_SRC = '/assets/psa-avatar-idle.png';

/** Optional thinking state image (falls back to idle if missing). */
export const PSA_AVATAR_THINKING_SRC = '/assets/psa-avatar-thinking.png';

export const PSA_WIDGET_LABEL = 'PSA';
export const PSA_WIDGET_SUBLABEL = 'PERSONAL SLAY ASSISTANT';

export const PSA_CHAT_TITLE = 'PSA';
export const PSA_CHAT_SUBTITLE = 'PERSONAL SLAY ASSISTANT';

export const PSA_WELCOME_MESSAGE =
  'Hey slayer — I\'m PSA, your Personal Slay Assistant. Ask me about units, policies, or where to go in the app.';

/** Routes where the floating PSA widget is hidden (admin chrome, full-screen checkout modals). */
export const PSA_HIDDEN_PATH_PREFIXES = ['/admin'];

export function isPsaHiddenPath(pathname: string): boolean {
  return PSA_HIDDEN_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}
