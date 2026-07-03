import { resolveSiteOrigin } from './brandAssets.js';

/** In-app Concierge priority message form — wired to POST /api/client/priority-messages + admin /admin/messages inbox. */
export const EMAIL_CONCIERGE_MESSAGE_PATH = '/account/concierge#priority-messages';

export const EMAIL_SUPPORT_FOOTER_COPY =
  'Need help? Log into your account and send a message from the concierge page.';

export const EMAIL_SUPPORT_CTA_LABEL = 'MESSAGE PSA';

export function resolveConciergeMessageUrl(): string {
  const origin = resolveSiteOrigin();
  return `${origin}${EMAIL_CONCIERGE_MESSAGE_PATH}`;
}
