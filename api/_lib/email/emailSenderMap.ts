import { EMAIL_HERO_CATEGORIES } from './emailHeroCategories.js';
import type { EmailTemplateType } from './types.js';

/** Branded Resend `from` categories — verified @frontalslayer.com addresses (no separate inboxes). */
export type EmailSenderCategory = 'orders' | 'rewards' | 'concierge' | 'contact' | 'support' | 'hello';

export const EMAIL_SENDER_ADDRESSES: Record<EmailSenderCategory, string> = {
  orders: 'Frontal Slayer Orders <orders@frontalslayer.com>',
  rewards: 'Frontal Slayer Rewards <rewards@frontalslayer.com>',
  concierge: 'Frontal Slayer Concierge <concierge@frontalslayer.com>',
  contact: 'Frontal Slayer Contact <contact@frontalslayer.com>',
  support: 'Frontal Slayer Support <support@frontalslayer.com>',
  hello: 'Frontal Slayer <hello@frontalslayer.com>',
};

const SUPPORT_TEMPLATES = new Set<EmailTemplateType>([
  'email_verification',
  'password_reset',
  'password_reset_success',
  'password_changed',
  'account_login_alert',
]);

const CONCIERGE_TEMPLATES = new Set<EmailTemplateType>([
  'consult_offer_sent',
  'meeting_reschedule',
  'meeting_cancel',
]);

function buildTemplateSenderCategoryMap(): Record<EmailTemplateType, EmailSenderCategory> {
  const map = {} as Record<EmailTemplateType, EmailSenderCategory>;

  for (const templateType of EMAIL_HERO_CATEGORIES.orders) {
    map[templateType] = 'orders';
  }
  for (const templateType of EMAIL_HERO_CATEGORIES.rewards) {
    map[templateType] = 'rewards';
  }
  for (const templateType of EMAIL_HERO_CATEGORIES.affiliate) {
    map[templateType] = 'contact';
  }
  for (const templateType of EMAIL_HERO_CATEGORIES.shop) {
    map[templateType] = CONCIERGE_TEMPLATES.has(templateType) ? 'concierge' : 'hello';
  }
  for (const templateType of EMAIL_HERO_CATEGORIES.account) {
    map[templateType] = SUPPORT_TEMPLATES.has(templateType) ? 'support' : 'hello';
  }

  return map;
}

export const EMAIL_TEMPLATE_SENDER_CATEGORY = buildTemplateSenderCategoryMap();

export function emailSenderCategoryForTemplate(templateType: EmailTemplateType): EmailSenderCategory {
  return EMAIL_TEMPLATE_SENDER_CATEGORY[templateType] ?? 'hello';
}

function envCategoryOverride(category: EmailSenderCategory): string | undefined {
  const key = `EMAIL_FROM_${category.toUpperCase()}`;
  return process.env[key]?.trim() || undefined;
}

/**
 * Resolve the Resend `from` address for a transactional template.
 * Optional dev overrides: TRANSACTIONAL_FROM_EMAIL (all), EMAIL_FROM_<CATEGORY> (per category).
 */
export function resolveEmailFromAddress(templateType: EmailTemplateType): string {
  const globalOverride =
    process.env.TRANSACTIONAL_FROM_EMAIL?.trim() || process.env.EMAIL_FROM_OVERRIDE?.trim();
  if (globalOverride) return globalOverride;

  const category = emailSenderCategoryForTemplate(templateType);
  return envCategoryOverride(category) || EMAIL_SENDER_ADDRESSES[category];
}

/** Resolve branded `from` for non-template sends (newsletter bulk, brand contact notify, etc.). */
export function resolveEmailFromAddressForCategory(category: EmailSenderCategory): string {
  const globalOverride =
    process.env.TRANSACTIONAL_FROM_EMAIL?.trim() || process.env.EMAIL_FROM_OVERRIDE?.trim();
  if (globalOverride) return globalOverride;

  return envCategoryOverride(category) || EMAIL_SENDER_ADDRESSES[category];
}
