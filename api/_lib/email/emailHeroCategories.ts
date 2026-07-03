/** Template types grouped by debug-page category (Account / Orders / Rewards / Affiliate / Shop). */
export const EMAIL_HERO_CATEGORIES = {
  account: [
    'welcome',
    'email_verification',
    'email_confirmed',
    'password_reset',
    'password_reset_success',
    'password_changed',
    'profile_updated',
    'email_updated',
    'account_login_alert',
    'newsletter',
  ],
  orders: [
    'order_received',
    'order_confirmed',
    'order_processing',
    'order_shipped',
    'order_out_for_delivery',
    'order_delivered',
    'order_delayed',
    'order_canceled',
    'payment_received',
    'partially_shipped',
  ],
  rewards: [
    'points_earned',
    'points_redeemed',
    'points_expiring',
    'voucher_expiring',
    'referral_redeemed',
    'digital_cash_update',
    'membership_welcome',
    'tier_upgraded',
    'birthday_reward',
    'special_offer',
  ],
  affiliate: [
    'affiliate_content_received',
    'affiliate_content_pending',
    'affiliate_content_approved',
    'affiliate_content_denied',
    'affiliate_points_earned',
    'affiliate_payment_sent',
  ],
  shop: [
    'back_in_stock',
    'wishlist_price_drop',
    'consult_offer_sent',
    'meeting_reschedule',
    'meeting_cancel',
  ],
} as const;

export type EmailHeroCategoryId = keyof typeof EMAIL_HERO_CATEGORIES;

export const EMAIL_HERO_CATEGORY_ORDER: EmailHeroCategoryId[] = [
  'account',
  'orders',
  'rewards',
  'affiliate',
  'shop',
];

export function templatesForHeroCategory(category: string): string[] {
  const key = category.trim().toLowerCase() as EmailHeroCategoryId;
  if (key === 'all') {
    return EMAIL_HERO_CATEGORY_ORDER.flatMap((c) => [...EMAIL_HERO_CATEGORIES[c]]);
  }
  const list = EMAIL_HERO_CATEGORIES[key];
  return list ? [...list] : [];
}
