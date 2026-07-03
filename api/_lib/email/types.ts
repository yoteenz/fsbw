/** Transactional email template identifiers for Frontal Slayer. */
export type EmailTemplateType =
  | 'welcome'
  | 'newsletter'
  | 'email_verification'
  | 'email_confirmed'
  | 'password_reset'
  | 'password_reset_success'
  | 'order_received'
  | 'order_confirmed'
  | 'order_processing'
  | 'order_shipped'
  | 'order_out_for_delivery'
  | 'order_delivered'
  | 'order_delayed'
  | 'order_canceled'
  | 'payment_received'
  | 'partially_shipped'
  | 'points_earned'
  | 'points_redeemed'
  | 'points_expiring'
  | 'voucher_expiring'
  | 'referral_redeemed'
  | 'digital_cash_update'
  | 'affiliate_content_received'
  | 'affiliate_content_pending'
  | 'affiliate_content_approved'
  | 'affiliate_content_denied'
  | 'affiliate_points_earned'
  | 'affiliate_payment_sent'
  | 'membership_welcome'
  | 'tier_upgraded'
  | 'birthday_reward'
  | 'special_offer'
  | 'back_in_stock'
  | 'wishlist_price_drop'
  | 'consult_offer_sent'
  | 'meeting_reschedule'
  | 'meeting_cancel'
  | 'account_login_alert'
  | 'profile_updated'
  | 'password_changed'
  | 'email_updated';

/** Dynamic placeholders available across templates. */
export interface EmailTemplateVariables {
  customerName?: string;
  orderNumber?: string;
  pointsAmount?: string | number;
  balance?: string | number;
  expirationDate?: string;
  trackingNumber?: string;
  trackingLink?: string;
  paymentAmount?: string | number;
  submissionDate?: string;
  platformName?: string;
  contentType?: string;
  voucherType?: string;
  ctaUrl?: string;
  ctaLabel?: string;
  resetLink?: string;
  verifyLink?: string;
  estimatedDate?: string;
  productName?: string;
  referralPoints?: string | number;
  digitalCashAmount?: string | number;
  declineReason?: string;
  tierName?: string;
  discountCode?: string;
  meetingReason?: string;
  meetingMessage?: string;
  loginLocation?: string;
  loginDevice?: string;
  loginDateTime?: string;
  redeemedFor?: string;
  htmlBody?: string;
  preheader?: string;
  [key: string]: string | number | undefined;
}

export interface SendEmailParams {
  templateType: EmailTemplateType;
  recipientEmail: string;
  subject?: string;
  variables?: EmailTemplateVariables;
}

export interface SendEmailResult {
  sent: boolean;
  id?: string;
  error?: string;
  templateType: EmailTemplateType;
  recipientEmail: string;
}

export type EmailHeroIcon =
  | 'welcome'
  | 'check'
  | 'bag'
  | 'gear'
  | 'truck'
  | 'pin'
  | 'hourglass'
  | 'x'
  | 'diamond'
  | 'gift'
  | 'lock'
  | 'envelope'
  | 'heart'
  | 'crown'
  | 'trophy'
  | 'fs'
  | 'payment';

export interface EmailDataRow {
  label: string;
  valueKey: keyof EmailTemplateVariables | string;
  fallback?: string;
}

export interface EmailTemplateDefinition {
  defaultSubject: string;
  scriptAccent: string;
  headline: string;
  bodyParagraphs: string[];
  heroIcon: EmailHeroIcon;
  dataRows?: EmailDataRow[];
  defaultCtaLabel: string;
  defaultCtaPath: string;
  preheader?: string;
}
