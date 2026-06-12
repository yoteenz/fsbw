export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  type?: string;
  /** BCF PDP: `bundles` | `closures` | `frontals` (with `type: 'shop-texture-category'`). */
  category?: string;
  balance?: number;
  capSize?: string;
  capSizePrice?: number;
  length?: string;
  density?: string;
  color?: string;
  texture?: string;
  lace?: string;
  hairline?: string;
  styling?: string;
  partSelection?: string;
  addOns?: string[];
  /** BCF bundles PDP: 3× line with bundle-deal discount off combined (see `BCF_BUNDLE_DEAL_DISCOUNT_USD` in bcfProductOptions). */
  bcfBundleDeal?: boolean;
  /** Pre-discount line subtotal (3× list unit price) for strikethrough at checkout/bag. */
  bcfBundleDealListSubtotal?: number;
  /** Booking appointment/consult: premium vs standard PDP and gating. */
  bookingTier?: string;
  /** Consult: WIG + INSTALL | WIG ONLY (red line + VIEW DETAILS). */
  bookingHairOption?: string;
  bookingHeadMeasurements?: Record<string, string>;
  /** Booking appointment (server quote / PaymentIntent). */
  bookingInstallKind?: string;
  bookingStyle?: string;
  bookingPartDirection?: string;
  bookingAddonIds?: string[];
  bookingNotes?: string;
  bookingInspoFileName?: string;
  bookingPreferredDate?: string;
  bookingPreferredTime?: string;
  /** Makeup add-on: selected skin tone label (e.g. FAIR, MEDIUM DEEP). */
  bookingMakeupSkinTone?: string;
  /** Mink lashes add-on: NATURAL | DRAMATIC. */
  bookingMinkLashVolume?: string;
  /** NEW INSTALL: JSON snapshot of custom unit from build-a-wig (appointment flow). */
  bookingNewInstallUnitJson?: string;
  /** NEW INSTALL: prior order id when user attaches an owned unit. */
  bookingAttachedOrderId?: string;
  /** NEW INSTALL: display line for attached order (e.g. product + order #). */
  bookingAttachedOrderSummary?: string;
  /** Consult: multiple inspo filenames (max 3 on PDP). */
  bookingInspoFileNames?: string[];
  /** Consult: hair inspo data URLs (checkout / admin fulfillment). */
  bookingInspoPhotoUrls?: string[];
  /** Consult: $40 deposit portion when style analysis add-on is bundled in `price`. */
  consultDepositUsd?: number;
  /** Consult style analysis add-on — 1 / 4 comparison options ($20 / $60, non-refundable). */
  consultStyleAnalysisComparisonCount?: 1 | 4;
  consultStyleAnalysisNonRefundable?: boolean;
  /** Standalone hairstyle analysis purchase — 1 / 4 comparisons ($20 / $60, non-refundable). */
  hairstyleAnalysisComparisonCount?: 1 | 4;
  hairstyleAnalysisNonRefundable?: boolean;
  bookingBagSubtitle?: string;
}





