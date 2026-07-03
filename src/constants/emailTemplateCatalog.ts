/** Client-side email template catalog (mirrors api/_lib/email/templateCatalog.ts). */

export type EmailTemplateCategoryId = 'account' | 'orders' | 'rewards' | 'affiliate' | 'shop';

export interface EmailTemplateCatalogEntry {
  type: string;
  label: string;
  description: string;
}

export interface EmailTemplateCategory {
  id: EmailTemplateCategoryId;
  label: string;
  templates: EmailTemplateCatalogEntry[];
}

export const EMAIL_TEMPLATE_CATEGORIES: EmailTemplateCategory[] = [
  {
    id: 'account',
    label: 'Account & Security',
    templates: [
      { type: 'welcome', label: 'Welcome', description: 'New member welcome to Slay Society' },
      { type: 'email_verification', label: 'Verify Email', description: 'Confirm email address' },
      { type: 'email_confirmed', label: 'Email Confirmed', description: 'Email verified success' },
      { type: 'password_reset', label: 'Password Reset', description: 'Reset password link' },
      { type: 'password_reset_success', label: 'Password Reset Success', description: 'Password updated' },
      { type: 'password_changed', label: 'Password Changed', description: 'Security alert — password changed' },
      { type: 'profile_updated', label: 'Profile Updated', description: 'Profile saved' },
      { type: 'email_updated', label: 'Email Updated', description: 'Account email changed' },
      { type: 'account_login_alert', label: 'Login Alert', description: 'New sign-in detected' },
      { type: 'newsletter', label: 'Newsletter', description: 'Marketing wrapper with custom HTML body' },
    ],
  },
  {
    id: 'orders',
    label: 'Orders & Shipping',
    templates: [
      { type: 'order_received', label: 'Order Received', description: 'Order received acknowledgment' },
      { type: 'order_confirmed', label: 'Order Confirmed', description: 'Payment confirmed' },
      { type: 'order_processing', label: 'Processing', description: 'Order being prepared' },
      { type: 'order_shipped', label: 'Shipped', description: 'Tracking number included' },
      { type: 'order_out_for_delivery', label: 'Out For Delivery', description: 'Delivery today' },
      { type: 'order_delivered', label: 'Delivered', description: 'Package arrived' },
      { type: 'order_delayed', label: 'Delayed', description: 'Ship date update' },
      { type: 'order_canceled', label: 'Canceled', description: 'Order canceled' },
      { type: 'payment_received', label: 'Payment Received', description: 'Payment confirmation' },
      { type: 'partially_shipped', label: 'Partial Shipment', description: 'Split shipment notice' },
    ],
  },
  {
    id: 'rewards',
    label: 'Rewards & Loyalty',
    templates: [
      { type: 'points_earned', label: 'Points Earned', description: 'Loyalty points credited' },
      { type: 'points_redeemed', label: 'Points Redeemed', description: 'Points used for reward' },
      { type: 'points_expiring', label: 'Points Expiring', description: 'Use points before expiry' },
      { type: 'voucher_expiring', label: 'Voucher Expiring', description: 'Member voucher deadline' },
      { type: 'referral_redeemed', label: 'Referral Redeemed', description: 'Referral reward earned' },
      { type: 'digital_cash_update', label: 'Digital Cash Update', description: 'Balance deposit or change' },
      { type: 'membership_welcome', label: 'Premium Welcome', description: 'Subscription activated' },
      { type: 'tier_upgraded', label: 'Tier Upgraded', description: 'Rewards tier unlocked' },
      { type: 'birthday_reward', label: 'Birthday Reward', description: 'Birthday gift' },
      { type: 'special_offer', label: 'Special Offer', description: 'Exclusive discount code' },
    ],
  },
  {
    id: 'affiliate',
    label: 'Affiliate Program',
    templates: [
      { type: 'affiliate_content_received', label: 'Content Received', description: 'Submission received' },
      { type: 'affiliate_content_pending', label: 'Pending Review', description: 'Awaiting approval' },
      { type: 'affiliate_content_approved', label: 'Approved', description: 'Content approved + points' },
      { type: 'affiliate_content_denied', label: 'Denied', description: 'Content not approved' },
      { type: 'affiliate_points_earned', label: 'Affiliate Points', description: 'Affiliate points credited' },
      { type: 'affiliate_payment_sent', label: 'Payment Sent', description: 'Affiliate payout sent' },
    ],
  },
  {
    id: 'shop',
    label: 'Shop & Appointments',
    templates: [
      { type: 'back_in_stock', label: 'Back In Stock', description: 'Waitlist restock alert' },
      { type: 'wishlist_price_drop', label: 'Wishlist Price Drop', description: 'Saved item price drop' },
      { type: 'consult_offer_sent', label: 'Consult Offer', description: 'Custom unit offer ready' },
      { type: 'meeting_reschedule', label: 'Meeting Reschedule', description: 'Appointment reschedule request' },
      { type: 'meeting_cancel', label: 'Meeting Cancel', description: 'Appointment cancel request' },
    ],
  },
];

export const EMAIL_PREVIEW_SAMPLE_VARIABLES: Record<string, string | number> = {
  customerName: 'KATEENA',
  orderNumber: 'ORDER #FS12345',
  pointsAmount: '250',
  balance: '1,250',
  expirationDate: 'AUG 15, 2026',
  trackingNumber: '1Z999AA1234567890',
  trackingLink: 'https://tools.usps.com/go/TrackConfirmAction?tLabels=1Z999AA1234567890',
  paymentAmount: '$480.00',
  submissionDate: 'JUL 3, 2026',
  platformName: 'INSTAGRAM',
  contentType: 'REEL',
  voucherType: '1X COLOR',
  resetLink: 'https://fsbw.vercel.app/sign-in?reset=sample',
  verifyLink: 'https://fsbw.vercel.app/sign-in?verify=sample',
  estimatedDate: 'JUL 10, 2026',
  productName: 'NOIR',
  referralPoints: '200',
  digitalCashAmount: '$50.00',
  declineReason: 'CONTENT DOES NOT MEET BRAND GUIDELINES',
  tierName: 'DIAMOND',
  discountCode: 'SLAY15',
  meetingReason: 'SCHEDULING CONFLICT',
  meetingMessage: 'PLEASE CHOOSE A NEW TIME FROM YOUR ACCOUNT.',
  loginLocation: 'HOUSTON, TX',
  loginDevice: 'IPHONE SAFARI',
  loginDateTime: 'JUL 3, 2026 3:30 PM CST',
  redeemedFor: '$50 STORE CREDIT',
  ctaUrl: 'https://fsbw.vercel.app/account/rewards',
};
