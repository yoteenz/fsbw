import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import DynamicCartIcon from '../../components/DynamicCartIcon';
import ConfirmationModal from '../../components/ConfirmationModal';
import BrandTermsBody from '../../components/brand/BrandTermsBody';
import { handlePaymentOption, PaymentProvider, PaymentData } from '../../utils/paymentHandlers';
import { createRouteProtection, prepareRouteProtectionData } from '../../utils/routeProtection';
import { getPointsMultiplier } from '../../constants/tiers';
import { getSubscriptionPriceUsd, isSubscriptionTierId } from '../../constants/subscriptionPricing';
import { recordMembershipPayment } from '../../utils/membershipPayments';
import {
  getEffectiveSubscriptionTier,
  getEffectiveTierName,
  signOutAppAndSupabaseSession,
} from '../../utils/adminAuth';
import { validateCheckoutCardInput } from '../../utils/checkoutCardValidation';
import { hasIdentityAlreadyUsedReferralCode, recordReferralCodeUsedByClient } from '../../utils/blockedClients';
import BrandMenuLinks from '../../components/BrandMenuLinks';
import SocialMenuIcons from '../../components/SocialMenuIcons';
import { trackActivity } from '../../utils/activity';
import { getPerUserKey, getCurrentUserEmailFromStorage, PER_USER_KEYS } from '../../utils/perUserStorage';
import {
  fetchStripeMembershipAvailable,
  createStripeMembershipCheckoutSession,
  getAccessToken,
  getConsultQuote,
  postBookingAppointmentMeeting,
  postBookingConsultMeeting,
  redeemConsultQuote,
  validateConsultDiscountCode,
} from '../../utils/api';
import { SESSION_CONSULT_CLAIM_CODE, SESSION_CONSULT_CLAIM_QUOTE_ID } from '../../utils/consultOfferFromQuote';
import { appendOrderReceivedAccountAlert } from '../../utils/orderAccountAlerts';
import {
  filterBookingCartLines,
  isBookingCartLine,
  isBookingsCheckoutPath,
  isBookingsOnlyCheckoutState,
} from '../../utils/bookingCheckout';
import {
  filterGiftCardCartLines,
  isGiftCardCartLine,
  isGiftCardCheckoutPath,
} from '../../utils/giftCardCheckout';
import {
  clearGiftCardCheckoutCartBackup,
  maybeRestoreGiftCardCheckoutCartAfterAbandon,
} from '../../utils/giftCardCheckoutSession';
import { syncProfileFromApi } from '../../utils/syncFromApi';
import { pushLocalUserOrdersAfterCheckout } from '../../utils/checkoutOrderServerSync';
import {
  discountPromoCheckoutBlockReason,
  findDiscountPromoByNormalizedCode,
  loadBrandPromoCodes,
  parseDiscountPercent,
  recordBrandGeneratedDiscountOrderEvent,
  updateBrandPromoCode,
} from '../../utils/adminBrandCodes';
import { ShopMobileMenuShopTab } from '../../components/ShopMobileMenuShopTab';
import { ShopMobileMenuToolsTab } from '../../components/ShopMobileMenuToolsTab';
import { stripIneligibleBcfBundleDealLines } from '../../utils/premiumMemberAccess';
import {
  orderStripRedSubtitle,
  orderStripThumbnailSrc,
  orderStripThumbMetrics,
  orderStripTitleFontPx,
  orderStripTitleLine,
  orderStripUseDigitalStackLayout,
  expandCartLinesForOrderStrip
} from '../../utils/checkoutOrderStripDisplay';
import {
  cartHasAnyLoyaltyEarningLine,
  computePointsEligibleNetUsd,
} from '../../utils/loyaltyPointsEligibleNet';
import { signInHrefWithReturnTo } from '../../utils/signInReturnTo';
import { useShopNavSearchBar } from '../../components/shop/useShopNavSearchBar';
import { saveLastSubmittedBookingConsultHeadMeasurements } from '../../utils/bookingConsultHeadMeasurementsPersist';
import { bookingCartItemThumbnailSrc } from '../../utils/bookingBadges';
import { cartRequiresOrderAuthorizationForm } from '../../utils/orderAuthorizationForm';
import { buildPersistedLineItemsFromCart } from '../../utils/orderLineItemsPersist';
import {
  cartUsesBcfOnlyProcessingWindows,
  checkoutExpressProcessingAllowed,
  getCheckoutProcessingTimePersistentLabel,
} from '../../utils/checkoutBcfProcessing';
import { cartRequiresGiftCardIdentityForm } from '../../utils/giftCardFirstPurchaseForm';
import {
  cartBillableQuantityUnits,
  cartBillableSubtotal,
  cartBillableSubtotalExcludingSpecialOffer,
  cartBillableTaxableSubtotal,
  cartLineExtendedPriceUsd,
  filterBillableCartLines,
  isBillableCartLine,
} from '../../utils/cartBillableLines';
import { useProductInventorySnapshot } from '../../hooks/useProductInventorySnapshot';

/** Special-offer-only cart: block codes, referral, gift card, service vouchers (COLOR/HAIRLINE/STYLING); free gifts stay combinable. */
const SPECIAL_OFFER_CHECKOUT_COMBO_MESSAGE =
  "SPECIAL OFFERS CAN'T BE COMBINED WITH DISCOUNT CODES, GIFT CARDS, REFERRAL CODES OR SERVICE VOUCHERS. FREE GIFTS STILL APPLY.";

function getCardBrandDisplay(fullNumber: string): string {
  const digits = fullNumber.replace(/\D/g, '');
  if (digits.length < 4) return 'CARD';
  if (digits.startsWith('4')) return 'VISA';
  if (digits.startsWith('5') && /^5[1-5]/.test(digits)) return 'MASTERCARD';
  if (/^5[6-9]|^2[2-7]/.test(digits)) return 'MASTERCARD';
  if (/^3[47]/.test(digits)) return 'AMERICAN EXPRESS';
  if (digits.startsWith('6011') || digits.startsWith('65') || /^64[4-9]/.test(digits)) return 'DISCOVER';
  return 'CARD';
}

/** Map account profile `country` strings to checkout shipping-calculator `<select>` values. */
function countryFullNameToCheckoutCode(country: unknown): string {
  const s = String(country ?? '')
    .trim()
    .toUpperCase();
  if (!s) return '';
  if (s === 'US' || s === 'USA') return 'US';
  if (s === 'UNITED STATES' || s === 'UNITED STATES OF AMERICA') return 'US';
  if (s === 'CA' || s === 'CANADA') return 'CA';
  if (s === 'GB' || s === 'UK' || s === 'UNITED KINGDOM') return 'GB';
  if (s === 'AU' || s === 'AUSTRALIA') return 'AU';
  if (s === 'OTHER') return 'OTHER';
  return '';
}

/** Normalize unit display name so "Blanco" / "BLANCO" / " blanco " all match voucher + rush logic. */
function normalizeCartUnitName(name: unknown): string {
  return (name || '').toString().toUpperCase().trim();
}

/** Default included hair color: Blanco → Platinum; all other units → Off Black. */
function defaultHairColorForUnit(itemName: unknown): string {
  return normalizeCartUnitName(itemName) === 'BLANCO' ? 'PLATINUM' : 'OFF BLACK';
}

/** Single source of truth for voucher types: cart option key, default value, and item price key. Add new voucher types here to match vouchers available vs cart. */
const VOUCHER_TYPE_CONFIG: Record<string, { optionKey: string; getDefault: (item: any) => string; priceKey: string }> = {
  COLOR: { optionKey: 'color', getDefault: (item) => defaultHairColorForUnit(item?.name), priceKey: 'colorPrice' },
  HAIRLINE: { optionKey: 'hairline', getDefault: () => 'NATURAL', priceKey: 'hairlinePrice' },
  STYLING: { optionKey: 'styling', getDefault: () => 'NONE', priceKey: 'stylingPrice' }
};

/** Get add-on price for one unit of this voucher type on the item. Uses stored price if present, else fallback lookup so voucher discount always shows (-$120) etc. */
function getVoucherAddOnPriceForItem(item: any, type: string): number {
  const config = VOUCHER_TYPE_CONFIG[type];
  if (!config) return 0;
  // COLOR: always derive from selection so voucher matches BAW color sub-page (ignore stale cart colorPrice e.g. old $100)
  if (type !== 'COLOR') {
    const stored = item[config.priceKey];
    if (stored != null && stored !== '' && !Number.isNaN(Number(stored))) return Number(stored);
  }
  const val = (item[config.optionKey] || '').toString().trim().toUpperCase();
  if (type === 'COLOR') {
    if (!val || val === 'OFF BLACK' || val === 'PLATINUM') return 0;
    const isBlanco = normalizeCartUnitName(item?.name) === 'BLANCO';
    if (isBlanco && ['GOLDEN', 'PLATINUM', 'ASH'].includes(val)) {
      if (val === 'GOLDEN') return -20;
      if (val === 'ASH') return 20;
      return 0; // PLATINUM
    }
    // Match build-a-wig color sub-page `getSelectedPrice()` for customize/edit (non-Blanco): flat $120 for any non-default color
    return 120;
  }
  if (type === 'HAIRLINE') {
    if (!val || val === 'NATURAL') return 0;
    const parts = val.split(',').map((s: string) => s.trim());
    let total = 0;
    parts.forEach((h: string) => { if (h === 'PEAK') total += 40; else if (h === 'LAGOS') total += 60; });
    if (parts.includes('LAGOS') && parts.includes('PEAK')) total -= 20;
    return total;
  }
  if (type === 'STYLING') {
    if (!val || val === 'NONE') return 0;
    const stylingPrices: Record<string, number> = { 'BANGS': 40, 'CRIMPS': 80, 'FLAT IRON': 80, 'LAYERS': 120 };
    const arr = val.split(',').map((s: string) => s.trim());
    const hasBangs = arr.includes('BANGS');
    const other = arr.find((s: string) => s !== 'BANGS');
    const isLong = item.length && /3[0-6]|40/.test(String(item.length));
    if (hasBangs && other) {
      let sec = stylingPrices[other] || 0;
      if (isLong && ['CRIMPS', 'FLAT IRON', 'LAYERS'].includes(other)) sec += 40;
      return sec + 20;
    }
    if (hasBangs) return 40;
    const first = arr[0];
    let base = stylingPrices[first] || 0;
    if (isLong && ['CRIMPS', 'FLAT IRON', 'LAYERS'].includes(first)) base += 40;
    return base;
  }
  return 0;
}

/** Loyalty free-gift rows (not service vouchers); may stack with a service voucher at checkout. */
function isFreeGiftVoucherKey(type: string): boolean {
  return /\bFREE\s*GIFT\b/i.test((type || '').trim());
}

/** Opening voucher modal: drop inapplicable service vouchers; keep free gifts; at most one service type selected. */
function normalizeVoucherQuantitiesForModalOpen(
  applied: Record<string, number>,
  available: Record<string, number>,
  cartApplicable: Record<string, boolean | undefined>
): Record<string, number> {
  const next: Record<string, number> = { ...applied };
  Object.keys(available).forEach((t) => {
    if (!cartApplicable[t] && !isFreeGiftVoucherKey(t)) next[t] = 0;
  });
  const serviceKeys = Object.keys(VOUCHER_TYPE_CONFIG);
  const serviceSum = serviceKeys.reduce((s, k) => s + (next[k] || 0), 0);
  if (serviceSum > 1) {
    const first = serviceKeys.find((k) => (next[k] || 0) > 0);
    serviceKeys.forEach((k) => {
      next[k] = k === first ? Math.min(1, next[k] || 0) : 0;
    });
  }
  return next;
}

/** Apply modal: service vouchers from cart applicability; free gifts keep chosen or prior counts (combinable). */
function buildAppliedVoucherQuantitiesFromModal(
  modalQty: Record<string, number>,
  priorApplied: Record<string, number>,
  available: Record<string, number>,
  cartApplicable: Record<string, boolean | undefined>
): Record<string, number> {
  const raw: Record<string, number> = {};
  Object.keys(available).forEach((type) => {
    if (isFreeGiftVoucherKey(type)) {
      const avail = available[type] || 0;
      const q = modalQty[type] ?? priorApplied[type] ?? Math.min(1, avail);
      raw[type] = Math.min(avail, Math.max(0, q));
    } else {
      raw[type] = cartApplicable[type] ? (modalQty[type] ?? 0) : 0;
    }
  });
  const serviceKeys = Object.keys(VOUCHER_TYPE_CONFIG);
  const serviceSum = serviceKeys.reduce((s, k) => s + (raw[k] || 0), 0);
  const next = { ...raw };
  if (serviceSum > 1) {
    const first = serviceKeys.find((k) => (raw[k] || 0) > 0);
    serviceKeys.forEach((k) => {
      next[k] = k === first ? Math.min(1, raw[k] || 0) : 0;
    });
  }
  return next;
}

function CheckoutPage() {
  const inventory = useProductInventorySnapshot();
  const navigate = useNavigate();
  const location = useLocation();
  const { NavCenter, SearchTrigger } = useShopNavSearchBar();
  const isBookingsCheckoutRoute = isBookingsCheckoutPath(location.pathname);
  const isGiftCardCheckoutRoute = isGiftCardCheckoutPath(location.pathname);
  const [searchParams, setSearchParams] = useSearchParams();
  const applyDiscountCodeRef = useRef<() => Promise<void>>(async () => {});
  const [pendingConsultDiscountCode, setPendingConsultDiscountCode] = useState<string | null>(null);
  const consultClaimBootstrapDoneRef = useRef(false);

  useEffect(() => {
    consultClaimBootstrapDoneRef.current = false;
  }, [location.pathname]);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [cartCount, setCartCount] = useState(() => {
    try {
      return parseInt(localStorage.getItem('cartCount') || '0', 10);
    } catch (e) {
      return 0;
    }
  });
  /** Header badge: sum line quantities when checkout cart state is loaded (matches bag + dropdown; fixes stale `cartCount` after qty edits). */
  const headerCartCount = useMemo(() => {
    const path = location.pathname;
    if (path === '/checkout/upgrade') return undefined;
    if (path.includes('/checkout/bookings') || path.includes('/checkout/gift-card')) return undefined;
    const fromLines = cartBillableQuantityUnits(cartItems);
    return cartItems.length > 0 ? fromLines : undefined;
  }, [cartItems, location.pathname, inventory.version]);
  const billableCartItems = useMemo(
    () => filterBillableCartLines(cartItems),
    [cartItems, inventory.version]
  );
  /** Horizontal strip: one tile per unit (qty &gt; 1 → repeated tiles); sold-out wig units omitted. */
  const orderStripExpandedEntries = useMemo(
    () => expandCartLinesForOrderStrip(billableCartItems),
    [billableCartItems]
  );
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mobileMenuActiveTab, setMobileMenuActiveTab] = useState(() => {
    const pathname = window.location.pathname;
    if (pathname.includes('/tools') || pathname === '/tools/gift-card') {
      return 'TOOLS';
    } else if (pathname.includes('/brand') || pathname.includes('/about') || pathname.includes('/contact') || pathname.includes('/faq') || pathname.includes('/reviews') || pathname.includes('/terms')) {
      return 'BRAND';
    }
    return 'SHOP';
  });
  const [mobileMenuExpandedItems, setMobileMenuExpandedItems] = useState<string[]>([]);
  const [isSignedIn, setIsSignedIn] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('isSignedIn') === 'true';
      } catch (e) {
        return false;
      }
    }
    return false;
  });

  // Form state
  const [sameAsBilling, setSameAsBilling] = useState(false);
  const [useDefaultMethod, setUseDefaultMethod] = useState(false);
  const [savePaymentMethod, setSavePaymentMethod] = useState(false);
  const [useDefaultPaymentMethod, setUseDefaultPaymentMethod] = useState(false);
  const [savePaymentMethodCard, setSavePaymentMethodCard] = useState(false);
  const [bookingAutopayConsent, setBookingAutopayConsent] = useState(false);
  const [autoRenewMembership, setAutoRenewMembership] = useState(false);
  // Initialize newsletter subscription based on mailing list status
  // Auto-select if NOT on mailing list, auto-deselect if ON mailing list
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const isSignedIn = localStorage.getItem('isSignedIn') === 'true';
        if (isSignedIn) {
          const currentUser = localStorage.getItem('currentUser');
          if (currentUser) {
            const user = JSON.parse(currentUser);
            // If user is on mailing list, auto-deselect (false)
            // If user is NOT on mailing list, auto-select (true)
            const onMailingList = user.onMailingList === true;
            return !onMailingList; // Invert: not on list = subscribe (true), on list = don't subscribe (false)
          }
        }
      } catch (e) {
        // If error, default to true (subscribe) for new users
      }
    }
    // Default to true (auto-select) if not signed in or user not found
    return true;
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [addressConfirmed, setAddressConfirmed] = useState(false);
  const [showTermsRequiredModal, setShowTermsRequiredModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [checkoutNotice, setCheckoutNotice] = useState<{ title: string; message: string } | null>(null);
  const [selectedProcessing, setSelectedProcessing] = useState('standard');
  const [packageProtection, setPackageProtection] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [zipCodeError, setZipCodeError] = useState('');
  const [shippingCalculated, setShippingCalculated] = useState(false);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<{carrier: string, speed: string, cost: number, originalCost?: number} | null>(null);
  
  // Required form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [aptSuite, setAptSuite] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [cardholder, setCardholder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [billingFirstName, setBillingFirstName] = useState('');
  const [billingLastName, setBillingLastName] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [billingAptSuite, setBillingAptSuite] = useState('');
  const [billingCity, setBillingCity] = useState('');
  const [billingState, setBillingState] = useState('');
  const [billingZip, setBillingZip] = useState('');
  
  // Discount code state
  const [discountCode, setDiscountCode] = useState('');
  const [discountCodeDisplay, setDiscountCodeDisplay] = useState('');
  const [discountCodeError, setDiscountCodeError] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  /** Admin Brand → CODES discount promo (% off eligible subtotal). Mutually exclusive with legacy flat codes. */
  const [appliedBrandDiscountPromo, setAppliedBrandDiscountPromo] = useState<{
    id: string;
    code: string;
    percent: number;
  } | null>(null);
  /** Admin consult quote: flat $ off eligible custom-unit subtotal (excludes A/C booking lines); one-time redeem server-side. */
  const [appliedConsultQuote, setAppliedConsultQuote] = useState<{
    quoteId: string;
    code: string;
    amountUsd: number;
  } | null>(null);
  const [isDiscountCodeFocused, setIsDiscountCodeFocused] = useState(false);
  
  // Referral code state
  const [appliedReferralCode, setAppliedReferralCode] = useState('');
  const [referralDiscount, setReferralDiscount] = useState(0);
  
  // Gift card balance state
  const [giftCardBalance, setGiftCardBalance] = useState(0);
  const [appliedGiftCardBalance, setAppliedGiftCardBalance] = useState(0);
  const userSelectedDigitalCashRef = useRef<number | null>(null);
  const [showDigitalCashModal, setShowDigitalCashModal] = useState(false);
  const [digitalCashModalAmount, setDigitalCashModalAmount] = useState(0);

  // Vouchers: available by type (from user), applied quantities (editable at checkout like digital cash)
  const [availableVouchersByType, setAvailableVouchersByType] = useState<Record<string, number>>({});
  const [appliedVoucherQuantities, setAppliedVoucherQuantities] = useState<Record<string, number>>({});
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [voucherModalQuantities, setVoucherModalQuantities] = useState<Record<string, number>>({});
  
  // Tip state - store percentage (0-100) or custom dollar amount (negative values indicate custom dollar amount)
  const [tipPercentage, setTipPercentage] = useState<number | null>(null);
  const [customTipAmount, setCustomTipAmount] = useState(0);
  const [customTipApplied, setCustomTipApplied] = useState(false);
  const [customTipDisplay, setCustomTipDisplay] = useState('');
  const [hasSupabaseCheckoutSession, setHasSupabaseCheckoutSession] = useState(false);
  const [bookingStripeProfile, setBookingStripeProfile] = useState<{
    stripeCustomerId: string;
    stripePaymentMethodId: string;
  }>({ stripeCustomerId: '', stripePaymentMethodId: '' });
  const hasBookingAppointmentItems = useMemo(
    () => cartItems.some((item: any) => item?.type === 'booking-appointment'),
    [cartItems]
  );
  const bookingAutopayStripeReady =
    hasBookingAppointmentItems &&
    hasSupabaseCheckoutSession &&
    Boolean(bookingStripeProfile.stripeCustomerId) &&
    Boolean(bookingStripeProfile.stripePaymentMethodId);

  useEffect(() => {
    let cancelled = false;
    const hydrate = () => {
      void getAccessToken().then((token) => {
        if (!cancelled) setHasSupabaseCheckoutSession(Boolean(token));
      });
      try {
        const raw = localStorage.getItem('currentUser');
        const user = raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
        const stripeCustomerId = String(
          user?.stripeCustomerId ?? user?.stripe_customer_id ?? ''
        ).trim();
        const stripePaymentMethodId = String(
          user?.stripeDefaultPaymentMethodId ?? user?.stripe_default_payment_method_id ?? ''
        ).trim();
        if (!cancelled) {
          setBookingStripeProfile({
            stripeCustomerId,
            stripePaymentMethodId,
          });
        }
      } catch {
        if (!cancelled) {
          setBookingStripeProfile({ stripeCustomerId: '', stripePaymentMethodId: '' });
        }
      }
    };
    hydrate();
    window.addEventListener('signInStateChanged', hydrate);
    window.addEventListener('focus', hydrate);
    return () => {
      cancelled = true;
      window.removeEventListener('signInStateChanged', hydrate);
      window.removeEventListener('focus', hydrate);
    };
  }, []);

  useEffect(() => {
    if (!hasBookingAppointmentItems && bookingAutopayConsent) setBookingAutopayConsent(false);
  }, [hasBookingAppointmentItems, bookingAutopayConsent]);

  const syncBookingAppointmentsToAdminMeetings = useCallback(
    async (
      orderNumberForNotes: string,
      orderTotalPaidUsd: number,
      paymentMethodLabel: string,
      autopay?: {
        consent: boolean;
        stripeCustomerId?: string;
        stripePaymentMethodId?: string;
      }
    ) => {
      const appointmentItems = cartItems.filter(
        (item: any) =>
          item?.type === 'booking-appointment' &&
          typeof item?.bookingPreferredDate === 'string' &&
          item.bookingPreferredDate.trim() &&
          typeof item?.bookingPreferredTime === 'string' &&
          item.bookingPreferredTime.trim()
      );
      if (appointmentItems.length === 0) return;

      /** In-salon duration only; travel fee excluded from appointment block time. */
      const durationByAddonId: Record<string, number> = {
        braids: 60,
        'brow-clean': 40,
        'brow-tint': 60,
        'mink-lashes': 20,
        makeup: 150,
        'clean-lace': 40
      };

      await Promise.allSettled(
        appointmentItems.map(async (item: any, idx: number) => {
          const installKind = String(item?.bookingInstallKind || '').toUpperCase();
          const baseDuration = installKind === 'RE_INSTALL' ? 120 : 150;
          const addonIds = Array.isArray(item?.bookingAddonIds)
            ? item.bookingAddonIds.filter((id: unknown): id is string => typeof id === 'string')
            : [];
          const addonDuration = addonIds.reduce(
            (sum: number, id: string) => sum + (durationByAddonId[id] || 0),
            0
          );
          const durationMinutes = baseDuration + addonDuration;

          const serviceTypeLabel = installKind === 'RE_INSTALL' ? 'RE-INSTALL' : 'NEW INSTALL';
          const styleLabel = String(item?.bookingStyle || '').trim().toUpperCase();
          const partDirectionLabel = String(item?.bookingPartDirection || '').trim().toUpperCase();
          const type = [serviceTypeLabel, styleLabel, partDirectionLabel].filter(Boolean).join(' · ') || serviceTypeLabel;

          const subtitle = String(item?.bookingBagSubtitle || '')
            .trim()
            .toUpperCase();
          const notes = subtitle ? `BOOKING DETAILS: ${subtitle}` : 'BOOKING DETAILS';
          const meetingDate = String(item.bookingPreferredDate).trim();
          const meetingTime = String(item.bookingPreferredTime).trim();
          const idempotencyKey = `BOOKING_APPT:${orderNumberForNotes}:${meetingDate}:${meetingTime}:${idx}`;

          const installFeeUsd = installKind === 'RE_INSTALL' ? 225 : 275;
          await postBookingAppointmentMeeting({
            meetingDate,
            meetingTime,
            type,
            durationMinutes,
            notes,
            orderNumber: orderNumberForNotes,
            idempotencyKey,
            bookingInstallKind: installKind,
            bookingInstallFeeUsd: installFeeUsd,
            bookingOrderTotalPaidUsd: Math.max(0, Math.round(Number(orderTotalPaidUsd) || 0)),
            bookingLineTotalPaidUsd: Math.max(0, Math.round(Number(item?.price || 0))),
            bookingBalancePaidUsd: Math.max(0, Math.round((Number(orderTotalPaidUsd) || 0) - installFeeUsd)),
            bookingFinalDueUsd: installFeeUsd,
            bookingPaymentMethodLabel: paymentMethodLabel,
            bookingBookedAtIso: new Date().toISOString(),
            bookingStripeCustomerId: autopay?.stripeCustomerId,
            bookingStripePaymentMethodId: autopay?.stripePaymentMethodId,
            bookingAutopayConsent: autopay?.consent === true,
            bookingAutopayConsentAt: autopay?.consent === true ? new Date().toISOString() : undefined,
          });
        })
      );
    },
    [cartItems]
  );

  const syncBookingConsultsToAdminMeetings = useCallback(
    async (orderNumberForNotes: string) => {
      const consultItems = cartItems.filter((item: any) => item?.type === 'booking-consult');
      if (consultItems.length === 0) return;

      await Promise.allSettled(
        consultItems.map(async (item: any, idx: number) => {
          const photoUrls = Array.isArray(item?.bookingInspoPhotoUrls)
            ? item.bookingInspoPhotoUrls
                .filter((x: unknown): x is string => typeof x === 'string')
                .map((x: string) => x.trim())
                .filter((x: string) => x.startsWith('data:image/') || /^https?:\/\//i.test(x) || x.startsWith('/'))
                .slice(0, 3)
            : [];
          const idempotencyKey = `BOOKING_CONSULT:${orderNumberForNotes}:${idx}`;
          const names = Array.isArray(item?.bookingInspoFileNames)
            ? item.bookingInspoFileNames.filter((x: unknown): x is string => typeof x === 'string')
            : [];
          await postBookingConsultMeeting({
            meetingDate: typeof item?.bookingPreferredDate === 'string' ? item.bookingPreferredDate : undefined,
            meetingTime: typeof item?.bookingPreferredTime === 'string' ? item.bookingPreferredTime : undefined,
            tier: item?.bookingTier,
            hairOption: item?.bookingHairOption,
            notes: item?.bookingNotes,
            headMeasurements:
              item?.bookingHeadMeasurements && typeof item.bookingHeadMeasurements === 'object'
                ? item.bookingHeadMeasurements
                : undefined,
            orderNumber: orderNumberForNotes,
            idempotencyKey,
            inspoPhotoUrls: photoUrls,
            inspoFileNames: names,
          });
        })
      );
    },
    [cartItems]
  );
  
  // Validation modals
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [fieldToFocus, setFieldToFocus] = useState<string | null>(null);
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());
  // Refs for input fields
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const shippingAddressRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const stateRef = useRef<HTMLInputElement>(null);
  const zipRef = useRef<HTMLInputElement>(null);
  const phoneNumberRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const cardholderRef = useRef<HTMLInputElement>(null);
  const cardNumberRef = useRef<HTMLInputElement>(null);
  const expirationDateRef = useRef<HTMLInputElement>(null);
  const cvvRef = useRef<HTMLInputElement>(null);
  /** When "use default payment" fills card number with last-4 placeholder, validation uses this for `validateCheckoutCardInput`. */
  const defaultPaymentLast4Ref = useRef<string | null>(null);
  const billingAddressRef = useRef<HTMLInputElement>(null);
  const billingCityRef = useRef<HTMLInputElement>(null);
  const billingStateRef = useRef<HTMLInputElement>(null);
  const billingZipRef = useRef<HTMLInputElement>(null);

  // Payment processing state
  const [processingPayment, setProcessingPayment] = useState(false);

  // Horizontal scroll state for products
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startScrollPosition, setStartScrollPosition] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Track when user enters checkout (for admin Activity tab)
  useEffect(() => {
    trackActivity('checkout_start', {
      path: location.pathname,
      upgrade: location.pathname === '/checkout/upgrade',
      giftCard: isGiftCardCheckoutRoute,
      bookings: isBookingsCheckoutRoute,
    });
  }, [location.pathname, isGiftCardCheckoutRoute, isBookingsCheckoutRoute]);

  // Currency state - per user so it doesn't bleed between accounts
  const [selectedCurrency, setSelectedCurrency] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const key = getPerUserKey(PER_USER_KEYS.selectedCurrency, getCurrentUserEmailFromStorage());
        const savedCurrency = localStorage.getItem(key);
        return savedCurrency || 'USD';
      } catch (e) {
        return 'USD';
      }
    }
    return 'USD';
  });

  // Check if any product has color, styling, or add-ons (non-default values)
  const hasColorStylingOrAddOns = useMemo(() => {
    return cartItems.some((item) => {
      // Skip gift cards
      if (item.name === 'GIFT CARD' || item.type === 'gift-card') {
        return false;
      }

      // Check for non-default color (case-insensitive; Blanco default is Platinum, not Off Black)
      const defaultColor = defaultHairColorForUnit(item.name);
      const colorNorm = (item.color || '').toString().trim().toUpperCase();
      const hasNonDefaultColor = Boolean(colorNorm && colorNorm !== defaultColor);

      // Check for non-default styling
      const stylingNorm = (item.styling || '').toString().trim().toUpperCase();
      const hasNonDefaultStyling = Boolean(stylingNorm && stylingNorm !== 'NONE');

      // Check for add-ons
      const hasAddOns = item.addOns && Array.isArray(item.addOns) && item.addOns.length > 0;

      return hasNonDefaultColor || hasNonDefaultStyling || hasAddOns;
    });
  }, [cartItems, navigate]);

  const bcfOnlyProcessingWindows = useMemo(() => cartUsesBcfOnlyProcessingWindows(cartItems as unknown[]), [cartItems]);

  const checkoutExpressAllowed = useMemo(
    () =>
      checkoutExpressProcessingAllowed({
        cartItems: cartItems as unknown[],
        hasColorStylingOrAddOns,
      }),
    [cartItems, hasColorStylingOrAddOns]
  );

  const persistentProcessingTimeLabel = useMemo(
    () =>
      getCheckoutProcessingTimePersistentLabel({
        cartItems: cartItems as unknown[],
        selectedProcessing: selectedProcessing === 'rush' ? 'rush' : 'standard',
        hasColorStylingOrAddOns,
      }),
    [cartItems, selectedProcessing, hasColorStylingOrAddOns]
  );

  // Voucher applicability: service vouchers only (COLOR/HAIRLINE/STYLING); add-on price > 0. Excludes special-offer lines (no service voucher discount there). Free gifts are separate loyalty redemptions and remain combinable.
  const cartVoucherApplicability = useMemo(() => {
    const isPhysical = (item: any) => item.name !== 'GIFT CARD' && item.type !== 'gift-card' && item.type !== 'digital' && !item.isSpecialOffer;
    const out: Record<string, boolean> = {};
    Object.keys(VOUCHER_TYPE_CONFIG).forEach((type) => {
      out[type] = cartItems.some((item) => {
        if (!isPhysical(item)) return false;
        const addOnPrice = getVoucherAddOnPriceForItem(item, type);
        return addOnPrice > 0;
      });
    });
    return out;
  }, [cartItems]);

  const voucherLineApplicable = useMemo(() => {
    if (Object.keys(availableVouchersByType).length === 0) return false;
    return Object.keys(availableVouchersByType).some((type) => {
      const available = (availableVouchersByType[type] || 0) > 0;
      if (!available) return false;
      if (isFreeGiftVoucherKey(type)) return true;
      return cartVoucherApplicability[type] === true;
    });
  }, [availableVouchersByType, cartVoucherApplicability]);
  
  const currencyRates = useMemo(() => ({
    USD: { symbol: '&#36;', rate: 1.0, name: 'US Dollar' },
    EUR: { symbol: '&euro;', rate: 0.85, name: 'Euro' },
    GBP: { symbol: '&pound;', rate: 0.73, name: 'British Pound' },
    CAD: { symbol: 'C&#36;', rate: 1.25, name: 'Canadian Dollar' },
    AUD: { symbol: 'A&#36;', rate: 1.35, name: 'Australian Dollar' },
    JPY: { symbol: '&yen;', rate: 110.0, name: 'Japanese Yen' },
    CNY: { symbol: '&yen;', rate: 6.45, name: 'Chinese Yuan' },
    INR: { symbol: '&#8377;', rate: 75.0, name: 'Indian Rupee' },
    BRL: { symbol: 'R&#36;', rate: 5.2, name: 'Brazilian Real' },
    MXN: { symbol: '&#36;', rate: 20.0, name: 'Mexican Peso' }
  }), []);


  // Check if this is a subscription upgrade
  const [isSubscriptionUpgrade, setIsSubscriptionUpgrade] = useState(false);

  /** Keep label + totals aligned: inventory load sets applied = full `byType` (multiple service rows). Discount only redeems one service voucher — normalize whenever cart or availability changes so refresh does not show phantom rows. */
  useEffect(() => {
    if (isSubscriptionUpgrade) return;
    if (!isSignedIn) return;
    setAppliedVoucherQuantities((prev) =>
      normalizeVoucherQuantitiesForModalOpen(prev, availableVouchersByType, cartVoucherApplicability)
    );
  }, [availableVouchersByType, cartVoucherApplicability, isSubscriptionUpgrade, isSignedIn]);

  const [stripeMembershipAvailable, setStripeMembershipAvailable] = useState(false);
  const [hasSupabaseSession, setHasSupabaseSession] = useState(false);
  const [stripeCheckoutLoading, setStripeCheckoutLoading] = useState(false);

  // Load cart items from localStorage
  const loadCartItems = () => {
    try {
      // Check the route pathname to determine checkout type
      const isUpgradeRoute = location.pathname === '/checkout/upgrade';
      
      if (location.pathname.includes('/checkout/bookings')) {
        const stored = localStorage.getItem('cartItems');
        let regularCartItems: any[] = [];
        if (stored) {
          const items = JSON.parse(stored);
          if (Array.isArray(items) && items.length > 0) {
            regularCartItems = items;
          }
        }
        const onlyBookings = filterBookingCartLines(regularCartItems);
        setIsSubscriptionUpgrade(false);
        setCartItems(onlyBookings);
        return;
      }

      if (location.pathname.includes('/checkout/gift-card')) {
        const stored = localStorage.getItem('cartItems');
        let regularCartItems: any[] = [];
        if (stored) {
          const items = JSON.parse(stored);
          if (Array.isArray(items) && items.length > 0) {
            regularCartItems = items;
          }
        }
        const onlyGift = filterGiftCardCartLines(regularCartItems);
        setIsSubscriptionUpgrade(false);
        setCartItems(onlyGift);
        return;
      }

      if (isUpgradeRoute) {
        // This is a subscription upgrade checkout
        const subscriptionItem = localStorage.getItem('subscriptionUpgrade');
        if (subscriptionItem) {
          const item = JSON.parse(subscriptionItem);
          // Clean up name if it has old format "PREMIUM MEMBERSHIP -"
          if (item.name && item.name.includes('PREMIUM MEMBERSHIP -')) {
            item.name = item.name.replace('PREMIUM MEMBERSHIP - ', '').trim();
          }
          setIsSubscriptionUpgrade(true);
          setCartItems([item]);
          return;
        } else {
          // No subscription item found, redirect to regular checkout
          setIsSubscriptionUpgrade(false);
          setCartItems([]);
          return;
        }
      } else {
        // This is a regular checkout
        const stored = localStorage.getItem('cartItems');
        let regularCartItems: any[] = [];
        if (stored) {
          const items = JSON.parse(stored);
          if (Array.isArray(items) && items.length > 0) {
            regularCartItems = items;
          }
        }
        const strip = stripIneligibleBcfBundleDealLines(regularCartItems);
        if (strip.removedUnitCount > 0) {
          localStorage.setItem('cartItems', JSON.stringify(strip.next));
          const newCount = strip.next.reduce((sum: number, ci: any) => sum + (ci.quantity || 1), 0);
          localStorage.setItem('cartCount', String(newCount));
          window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: newCount }));
          window.dispatchEvent(new CustomEvent('cartItemsChanged'));
          window.dispatchEvent(new Event('cartUpdated'));
          regularCartItems = strip.next;
        }

        setIsSubscriptionUpgrade(false);
        setCartItems(regularCartItems);
        if (location.pathname === '/checkout' && regularCartItems.length > 0) {
          if (regularCartItems.every((i: { type?: string }) => isBookingCartLine(i))) {
            navigate('/checkout/bookings', { replace: true });
            return;
          }
          if (regularCartItems.every((i: { type?: string; name?: string }) => isGiftCardCartLine(i))) {
            navigate('/checkout/gift-card', { replace: true });
            return;
          }
        }
        return;
      }
    } catch (e) {
      console.error('Error loading cart items:', e);
      setCartItems([]);
      setIsSubscriptionUpgrade(false);
    }
  };

  useEffect(() => {
    loadCartItems();
  }, [location.pathname]);

  /**
   * Isolated gift-card checkout with nothing to buy → back to gift card PDP.
   * Must not run in the same commit as the first paint: `cartItems` state is still `[]` until
   * the `loadCartItems` effect runs; an immediate check can false-empty and `replace` to the PDP.
   * That remounts GiftCardPage → `usePersistentQueryState` ↔ URL sync → Safari's 100 replaceState/10s cap.
   * Defer one tick and decide from **localStorage** (same source as `loadCartItems`).
   */
  useEffect(() => {
    if (!isGiftCardCheckoutRoute) return;
    const run = () => {
      let giftLines: unknown[] = [];
      try {
        const stored = localStorage.getItem('cartItems');
        const parsed = stored ? JSON.parse(stored) : [];
        giftLines = filterGiftCardCartLines(Array.isArray(parsed) ? parsed : []);
      } catch {
        /* ignore */
      }
      if (giftLines.length > 0) return;
      maybeRestoreGiftCardCheckoutCartAfterAbandon([]);
      navigate('/tools/gift-card', { replace: true });
    };
    const t = window.setTimeout(run, 0);
    return () => clearTimeout(t);
  }, [isGiftCardCheckoutRoute, navigate, cartItems.length]);

  /** Return to Account → Rewards with the premium comparison chart open (tier selection), not the default rewards cards. */
  const goBackToMembershipUpgradeChart = useCallback(() => {
    try {
      sessionStorage.setItem('returningFromCheckout', 'true');
      localStorage.setItem('membershipShowPremiumView', 'true');
    } catch {
      /* ignore */
    }
    navigate('/account/rewards');
  }, [navigate]);

  const handleCheckoutBack = useCallback(() => {
    if (isSubscriptionUpgrade) {
      goBackToMembershipUpgradeChart();
      return;
    }
    if (isGiftCardCheckoutRoute) {
      let giftLines: { type?: string; name?: string }[] = [];
      try {
        const stored = localStorage.getItem('cartItems');
        const parsed = stored ? JSON.parse(stored) : [];
        giftLines = filterGiftCardCartLines(Array.isArray(parsed) ? parsed : []);
      } catch {
        /* ignore */
      }
      const restoredCount = maybeRestoreGiftCardCheckoutCartAfterAbandon(giftLines);
      if (restoredCount != null) {
        setCartCount(restoredCount);
      }
      navigate('/bag');
      return;
    }
    navigate('/bag');
  }, [goBackToMembershipUpgradeChart, isGiftCardCheckoutRoute, isSubscriptionUpgrade, navigate]);

  useEffect(() => {
    if (!isSubscriptionUpgrade) {
      setStripeMembershipAvailable(false);
      setHasSupabaseSession(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const [avail, token] = await Promise.all([fetchStripeMembershipAvailable(), getAccessToken()]);
        if (!cancelled) {
          setStripeMembershipAvailable(avail);
          setHasSupabaseSession(Boolean(token));
        }
      } catch {
        if (!cancelled) {
          setStripeMembershipAvailable(false);
          setHasSupabaseSession(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isSubscriptionUpgrade]);

  useEffect(() => {
    if (isSubscriptionUpgrade) return;
    let cancelled = false;
    void (async () => {
      try {
        const token = await getAccessToken();
        if (!cancelled) setHasSupabaseCheckoutSession(Boolean(token));
      } catch {
        if (!cancelled) setHasSupabaseCheckoutSession(false);
      }
    })();
    const refreshSession = () => {
      void getAccessToken()
        .then((t) => setHasSupabaseCheckoutSession(Boolean(t)))
        .catch(() => setHasSupabaseCheckoutSession(false));
    };
    window.addEventListener('signInStateChanged', refreshSession);
    window.addEventListener('focus', refreshSession);
    return () => {
      cancelled = true;
      window.removeEventListener('signInStateChanged', refreshSession);
      window.removeEventListener('focus', refreshSession);
    };
  }, [isSubscriptionUpgrade]);

  useEffect(() => {
    if (isSubscriptionUpgrade || !hasBookingAppointmentItems || !hasSupabaseCheckoutSession || !isSignedIn) {
      setBookingStripeProfile({ stripeCustomerId: '', stripePaymentMethodId: '' });
      if (!hasBookingAppointmentItems) setBookingAutopayConsent(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const token = await getAccessToken();
        if (!token || cancelled) {
          if (!cancelled) setBookingStripeProfile({ stripeCustomerId: '', stripePaymentMethodId: '' });
          return;
        }
        const base = ((import.meta as unknown as { env?: { VITE_API_BASE?: string } }).env?.VITE_API_BASE || '').replace(/\/$/, '');
        const url = base ? `${base}/api/profile` : '/api/profile';
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok || cancelled) {
          if (!cancelled) setBookingStripeProfile({ stripeCustomerId: '', stripePaymentMethodId: '' });
          return;
        }
        const profile = (await res.json()) as { stripeCustomerId?: string; stripeDefaultPaymentMethodId?: string };
        if (!cancelled) {
          setBookingStripeProfile({
            stripeCustomerId: String(profile?.stripeCustomerId || '').trim(),
            stripePaymentMethodId: String(profile?.stripeDefaultPaymentMethodId || '').trim(),
          });
        }
      } catch {
        if (!cancelled) setBookingStripeProfile({ stripeCustomerId: '', stripePaymentMethodId: '' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isSubscriptionUpgrade, hasBookingAppointmentItems, hasSupabaseCheckoutSession, isSignedIn]);

  useEffect(() => {
    if (!isSubscriptionUpgrade) return;
    const refreshSession = () => {
      void getAccessToken().then((t) => setHasSupabaseSession(Boolean(t)));
    };
    window.addEventListener('signInStateChanged', refreshSession);
    window.addEventListener('focus', refreshSession);
    return () => {
      window.removeEventListener('signInStateChanged', refreshSession);
      window.removeEventListener('focus', refreshSession);
    };
  }, [isSubscriptionUpgrade]);

  useEffect(() => {
    if (location.pathname !== '/checkout/upgrade') return;
    const stripeStatus = searchParams.get('stripe');
    if (stripeStatus === 'cancel') {
      setSearchParams({}, { replace: true });
      return;
    }
    if (stripeStatus !== 'success') return;
    const sessionId = searchParams.get('session_id');
    const dedupeKey = sessionId ? `baw_stripe_membership_return_${sessionId}` : null;
    if (dedupeKey) {
      try {
        if (sessionStorage.getItem(dedupeKey)) {
          setSearchParams({}, { replace: true });
          try {
            localStorage.removeItem('membershipShowPremiumView');
            sessionStorage.removeItem('returningFromCheckout');
            localStorage.removeItem('membershipSelectedTier');
          } catch {
            /* ignore */
          }
          navigate('/account/rewards', { replace: true });
          return;
        }
        sessionStorage.setItem(dedupeKey, '1');
      } catch {
        /* ignore storage; still try sync */
      }
    }
    trackActivity('membership_stripe_return', { status: 'success' });
    let cancelled = false;
    void (async () => {
      await syncProfileFromApi();
      if (cancelled) return;
      try {
        localStorage.removeItem('subscriptionUpgrade');
        localStorage.removeItem('isSubscriptionUpgrade');
        localStorage.removeItem('isSubscriptionChange');
        localStorage.removeItem('membershipShowPremiumView');
        sessionStorage.removeItem('returningFromCheckout');
        localStorage.removeItem('membershipSelectedTier');
      } catch {
        /* ignore */
      }
      setSearchParams({}, { replace: true });
      navigate('/account/rewards', { replace: true });
    })();
    return () => {
      cancelled = true;
    };
  }, [location.pathname, searchParams, navigate, setSearchParams]);

  const handleStripeMembershipSubscribe = useCallback(async () => {
    const tierRaw = cartItems[0]?.subscriptionTier;
    if (!isSubscriptionTierId(tierRaw)) {
      setCheckoutNotice({
        title: 'SUBSCRIPTION',
        message: 'SUBSCRIPTION TIER MISSING. RETURN TO REWARDS AND CHOOSE A TIER AGAIN.',
      });
      return;
    }
    setStripeCheckoutLoading(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        setCheckoutNotice({
          title: 'FORGETTING SOMETHING?',
          message: 'SIGN IN WITH YOUR SUPABASE ACCOUNT TO USE STRIPE SUBSCRIPTIONS.',
        });
        return;
      }
      trackActivity('membership_checkout_start', { tier: tierRaw });
      const result = await createStripeMembershipCheckoutSession(tierRaw, '/checkout/upgrade');
      if (result.mode === 'checkout') {
        window.location.assign(result.url);
        return;
      }
      await syncProfileFromApi();
      const defaultMessage =
        result.changeType === 'upgrade'
          ? 'UPGRADE COMPLETE. WE CHARGED THE FULL NEW MEMBERSHIP CYCLE AND REFUNDED THE UNUSED TIME FROM YOUR PREVIOUS TIER.'
          : result.changeType === 'downgrade'
            ? 'DOWNGRADE SCHEDULED. YOUR CURRENT MEMBERSHIP STAYS ACTIVE UNTIL RENEWAL, THEN THE LOWER TIER PRICE WILL BE CHARGED.'
            : 'YOU ARE ALREADY ON THIS MEMBERSHIP TIER.';
      setCheckoutNotice({
        title: 'SUBSCRIPTION',
        message: (result.message || defaultMessage).toUpperCase(),
      });
      try {
        localStorage.removeItem('subscriptionUpgrade');
        localStorage.removeItem('isSubscriptionUpgrade');
        localStorage.removeItem('isSubscriptionChange');
        localStorage.removeItem('membershipShowPremiumView');
        sessionStorage.removeItem('returningFromCheckout');
        localStorage.removeItem('membershipSelectedTier');
      } catch {
        /* ignore */
      }
      navigate('/account/rewards');
    } catch (e) {
      setCheckoutNotice({
        title: 'CHECKOUT',
        message: e instanceof Error ? e.message : 'COULD NOT START CHECKOUT',
      });
    } finally {
      setStripeCheckoutLoading(false);
    }
  }, [cartItems]);

  // Subscription upgrades default to auto-renew; when auto-renew is enabled we hide Pay-in-4 style plans.
  useEffect(() => {
    setAutoRenewMembership(isSubscriptionUpgrade);
  }, [isSubscriptionUpgrade]);

  // Special offer: when cart has ONLY special offer items, clear codes and show message; when mixed, codes apply only to non–special-offer amount
  const hasSpecialOfferInCart = cartItems.some((item: any) => item.isSpecialOffer);
  const hasOnlySpecialOfferInCart = hasSpecialOfferInCart && cartItems.length > 0 && cartItems.every((item: any) => item.isSpecialOffer);
  useEffect(() => {
    if (hasOnlySpecialOfferInCart) {
      setAppliedReferralCode('');
      setReferralDiscount(0);
      setAppliedDiscount(0);
      setAppliedBrandDiscountPromo(null);
      setDiscountCode('');
      setDiscountCodeDisplay('');
      setDiscountCodeError(SPECIAL_OFFER_CHECKOUT_COMBO_MESSAGE);
    } else {
      setDiscountCodeError((prev) =>
        typeof prev === 'string' && prev.startsWith("SPECIAL OFFERS CAN'T BE COMBINED") ? '' : prev
      );
    }
  }, [hasOnlySpecialOfferInCart]);

  // Listen for cart count changes
  useEffect(() => {
    const handleCartCountUpdate = (event: CustomEvent) => {
      setCartCount(event.detail);
    };

    const handleStorageChange = () => {
      try {
        const newCartCount = parseInt(localStorage.getItem('cartCount') || '0', 10);
        setCartCount(newCartCount);
        loadCartItems();
      } catch (e) {
        setCartCount(0);
      }
    };

    window.addEventListener('cartCountUpdated', handleCartCountUpdate as EventListener);
    window.addEventListener('cartUpdated', handleStorageChange);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);

    return () => {
      window.removeEventListener('cartCountUpdated', handleCartCountUpdate as EventListener);
      window.removeEventListener('cartUpdated', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);

  // Load selected currency (per-user key)
  useEffect(() => {
    const key = getPerUserKey(PER_USER_KEYS.selectedCurrency, getCurrentUserEmailFromStorage());
    const savedCurrency = localStorage.getItem(key);
    if (savedCurrency && currencyRates[savedCurrency as keyof typeof currencyRates]) {
      if (savedCurrency !== selectedCurrency) {
        setSelectedCurrency(savedCurrency);
      }
    }
  }, []);

  // Automatically switch to standard processing if rush becomes unavailable
  useEffect(() => {
    if (!checkoutExpressAllowed && selectedProcessing === 'rush') {
      setSelectedProcessing('standard');
    }
  }, [checkoutExpressAllowed, selectedProcessing]);

  useEffect(() => {
    const key = getPerUserKey(PER_USER_KEYS.selectedCurrency, getCurrentUserEmailFromStorage());
    localStorage.setItem(key, selectedCurrency);
  }, [selectedCurrency]);

  // Check sign-in status on mount and listen for changes
  useEffect(() => {
    const checkSignInStatus = () => {
      try {
        const signedIn = localStorage.getItem('isSignedIn') === 'true';
        setIsSignedIn(prev => {
          // Only update if value has changed to prevent unnecessary re-renders
          if (prev !== signedIn) {
            return signedIn;
          }
          return prev;
        });
      } catch (e) {
        setIsSignedIn(prev => {
          if (prev !== false) {
            return false;
          }
          return prev;
        });
      }
    };

    // Skip initial check since useState already reads from localStorage
    // Only set up listeners for future changes

    // Listen for storage changes (when user signs in/out in another tab)
    const handleStorageChange = () => {
      checkSignInStatus();
    };

    // Listen for sign-in state changes from sign-in page
    const handleSignInStateChange = () => {
      checkSignInStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);
    window.addEventListener('signInStateChanged', handleSignInStateChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
      window.removeEventListener('signInStateChanged', handleSignInStateChange as EventListener);
    };
  }, []);

  // Auto-populate billing address from shipping address when checkbox is checked
  useEffect(() => {
    if (sameAsBilling) {
      setBillingFirstName(firstName);
      setBillingLastName(lastName);
      setBillingAddress(shippingAddress);
      setBillingAptSuite(aptSuite);
      setBillingCity(city);
      setBillingState(state);
      setBillingZip(zip);
    } else {
      // Clear billing fields when unchecked
      setBillingFirstName('');
      setBillingLastName('');
      setBillingAddress('');
      setBillingCity('');
      setBillingState('');
      setBillingZip('');
      setBillingAptSuite('');
    }
  }, [sameAsBilling, firstName, lastName, shippingAddress, aptSuite, city, state, zip]);

  // Load and apply gift card balance (NOT for subscription upgrades)
  useEffect(() => {
    // Don't apply gift card to subscription upgrades
    if (isSubscriptionUpgrade) {
      setGiftCardBalance(0);
      setAppliedGiftCardBalance(0);
      setAvailableVouchersByType({});
      setAppliedVoucherQuantities({});
      return;
    }
    
    if (isSignedIn) {
      try {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
          const user = JSON.parse(currentUser);
          const balance = user.giftCardBalance || 0;
          setGiftCardBalance(balance);
          setAppliedGiftCardBalance(balance);
          const list = user.voucherList && Array.isArray(user.voucherList) ? user.voucherList as string[] : [];
          const byType: Record<string, number> = {};
          for (const v of list) {
            const spaceIdx = v.indexOf(' ');
            if (spaceIdx <= 0) continue;
            const prefix = v.slice(0, spaceIdx).replace(/[xX]/g, '').trim();
            const type = v.slice(spaceIdx + 1).trim();
            const num = parseInt(prefix, 10) || 1;
            byType[type] = (byType[type] || 0) + num;
          }
          setAvailableVouchersByType(byType);
          setAppliedVoucherQuantities({ ...byType });
        }
      } catch (e) {
        setGiftCardBalance(0);
        setAppliedGiftCardBalance(0);
        setAvailableVouchersByType({});
        setAppliedVoucherQuantities({});
      }
    } else {
      setGiftCardBalance(0);
      setAppliedGiftCardBalance(0);
      setAvailableVouchersByType({});
      setAppliedVoucherQuantities({});
    }
  }, [isSignedIn, isSubscriptionUpgrade]);

  // Auto-populate email from signed-in user's account
  useEffect(() => {
    if (isSignedIn && !email) {
      try {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
          const user = JSON.parse(currentUser);
          if (user.email) {
            setEmail(user.email);
          }
        }
      } catch (error) {
        console.error('Error loading user email:', error);
      }
    }
  }, [isSignedIn]);

  // Auto-select/deselect newsletter subscription based on mailing list status
  useEffect(() => {
    if (isSignedIn) {
      try {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
          const user = JSON.parse(currentUser);
          // If user is on mailing list, auto-deselect (false)
          // If user is NOT on mailing list, auto-select (true)
          const onMailingList = user.onMailingList === true;
          setSubscribeNewsletter(!onMailingList);
        }
      } catch (error) {
        console.error('Error checking mailing list status:', error);
        // Default to true (subscribe) if error
        setSubscribeNewsletter(true);
      }
    } else {
      // If not signed in, default to true (auto-select)
      setSubscribeNewsletter(true);
    }
  }, [isSignedIn]);

  // Auto-populate shipping address from default method when checkbox is checked
  useEffect(() => {
    if (useDefaultMethod && isSignedIn) {
      try {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
          const user = JSON.parse(currentUser);
          // Check if user has a default address saved (same shape as account → shipping)
          const defaultAddress = user.defaultAddress || user.shippingAddress;
          if (defaultAddress && typeof defaultAddress === 'object') {
            const a = defaultAddress as Record<string, unknown>;
            setFirstName(
              typeof a.firstName === 'string' ? a.firstName : String(a.firstName ?? '')
            );
            setLastName(typeof a.lastName === 'string' ? a.lastName : String(a.lastName ?? ''));
            setShippingAddress(
              typeof a.address === 'string' ? a.address : String(a.address ?? '')
            );
            setAptSuite(
              typeof a.aptSuite === 'string'
                ? a.aptSuite
                : a.aptSuite != null
                  ? String(a.aptSuite)
                  : ''
            );
            setCity(typeof a.city === 'string' ? a.city : String(a.city ?? ''));
            setState(typeof a.state === 'string' ? a.state : String(a.state ?? ''));
            setZip(typeof a.zip === 'string' ? a.zip : String(a.zip ?? ''));
            setPhoneNumber(
              typeof a.phoneNumber === 'string'
                ? a.phoneNumber
                : String(a.phoneNumber ?? user.phoneNumber ?? user.phone ?? '')
            );
            setEmail(
              (typeof a.email === 'string' ? a.email : String(a.email ?? '')).trim() ||
                (user.email || email || '')
            );
            const cc = countryFullNameToCheckoutCode(a.country);
            if (cc) setSelectedCountry(cc);
          } else if (user.email) {
            setEmail(user.email || email);
          }
        }
      } catch (error) {
        console.error('Error loading default address:', error);
      }
    } else if (!useDefaultMethod) {
      // Clear fields when checkbox is unchecked (but keep email if user is signed in)
      setFirstName('');
      setLastName('');
      setShippingAddress('');
      setAptSuite('');
      setCity('');
      setState('');
      setZip('');
      setPhoneNumber('');
      // Don't clear email - it should remain from signed-in user
    }
  }, [useDefaultMethod, isSignedIn, email]);

  // Save payment method when checkbox is checked and form is submitted
  useEffect(() => {
    if (savePaymentMethod && isSignedIn && firstName && lastName && shippingAddress && city && state && zip) {
      // This will be saved when the order is placed
      // For now, we just track the state
    }
  }, [savePaymentMethod, isSignedIn, firstName, lastName, shippingAddress, city, state, zip]);

  // Auto-populate payment fields from default payment method when checkbox is checked
  useEffect(() => {
    if (useDefaultPaymentMethod && isSignedIn) {
      try {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
          const user = JSON.parse(currentUser);
          // Check if user has a default payment method saved (same shape as account → payment)
          const defaultPayment = user.defaultPaymentMethod;
          if (defaultPayment && typeof defaultPayment === 'object') {
            const p = defaultPayment as Record<string, unknown>;
            setCardholder(typeof p.cardholder === 'string' ? p.cardholder : String(p.cardholder ?? ''));
            const last4 = String(p.cardNumber ?? '').replace(/\D/g, '').slice(-4);
            if (last4.length === 4) {
              defaultPaymentLast4Ref.current = last4;
              setCardNumber(last4);
            } else {
              defaultPaymentLast4Ref.current = null;
              setCardNumber('');
            }
            setExpirationDate(
              typeof p.expirationDate === 'string' ? p.expirationDate : String(p.expirationDate ?? '')
            );
            setBillingZip(typeof p.billingZip === 'string' ? p.billingZip : String(p.billingZip ?? ''));
            setCvv('');
          } else {
            defaultPaymentLast4Ref.current = null;
          }
        }
      } catch (error) {
        console.error('Error loading default payment method:', error);
      }
    } else if (!useDefaultPaymentMethod) {
      defaultPaymentLast4Ref.current = null;
      // Clear payment fields when checkbox is unchecked
      setCardholder('');
      setCardNumber('');
      setExpirationDate('');
      setCvv('');
      setBillingZip('');
    }
  }, [useDefaultPaymentMethod, isSignedIn]);

  useEffect(() => {
    const handleCurrencyChange = () => {
      const key = getPerUserKey(PER_USER_KEYS.selectedCurrency, getCurrentUserEmailFromStorage());
      const savedCurrency = localStorage.getItem(key);
      if (savedCurrency && currencyRates[savedCurrency as keyof typeof currencyRates]) {
        setSelectedCurrency(savedCurrency);
      }
    };

    window.addEventListener('storage', handleCurrencyChange);
    
    const handleCustomCurrencyChange = (event: CustomEvent) => {
      const newCurrency = event.detail;
      if (newCurrency && currencyRates[newCurrency as keyof typeof currencyRates]) {
        setSelectedCurrency(newCurrency);
        const key = getPerUserKey(PER_USER_KEYS.selectedCurrency, getCurrentUserEmailFromStorage());
        localStorage.setItem(key, newCurrency);
      }
    };
    
    window.addEventListener('currencyChanged', handleCustomCurrencyChange as EventListener);
    
    const interval = setInterval(() => {
      handleCurrencyChange();
    }, 500);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleCurrencyChange);
      window.removeEventListener('currencyChanged', handleCustomCurrencyChange as EventListener);
    };
  }, [currencyRates]);

  const formatPrice = useCallback((price: number) => {
    if (!price || isNaN(price)) {
      const currency = currencyRates[selectedCurrency as keyof typeof currencyRates] || currencyRates.USD;
      return { __html: currency.symbol + '0 ' + selectedCurrency };
    }
    const currency = currencyRates[selectedCurrency as keyof typeof currencyRates] || currencyRates.USD;
    const convertedPrice = price * currency.rate;
    return {
      __html: currency.symbol + convertedPrice.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }) + ' ' + selectedCurrency
    };
  }, [currencyRates, selectedCurrency]);


  // Format expiration date as MM/YY
  const formatExpirationDate = (value: string) => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '');
    
    // Limit to 4 digits (MMYY)
    const limited = numbers.slice(0, 4);
    
    // Add slash after 2 digits
    if (limited.length >= 2) {
      return limited.slice(0, 2) + '/' + limited.slice(2);
    }
    
    return limited;
  };

  // Format CVV to max 3 digits
  const formatCVV = (value: string) => {
    // Remove all non-numeric characters and limit to 3 digits
    return value.replace(/\D/g, '').slice(0, 3);
  };

  // Check if country uses alphanumeric postal codes
  const usesAlphanumericPostalCode = (country: string): boolean => {
    // Countries that use alphanumeric postal codes
    const alphanumericCountries = ['GB', 'CA', 'OTHER'];
    return alphanumericCountries.includes(country);
  };

  // Validate zip code against state (for US)
  const validateZipCodeForState = (zip: string, state: string, country: string): boolean => {
    if (country !== 'US' || !state || !zip) return true; // Skip validation for non-US or missing data
    
    const zipNum = parseInt(zip, 10);
    if (isNaN(zipNum)) return false;
    
    // Basic zip code range validation for US states
    // This is a simplified validation - in production, you'd use a comprehensive zip code database
    const stateZipRanges: { [key: string]: { min: number, max: number } } = {
      'AL': { min: 35000, max: 36999 },
      'AK': { min: 99500, max: 99999 },
      'AZ': { min: 85000, max: 86999 },
      'AR': { min: 71600, max: 72999 },
      'CA': { min: 90000, max: 96999 },
      'CO': { min: 80000, max: 81999 },
      'CT': { min: 6000, max: 6999 },
      'DE': { min: 19700, max: 19999 },
      'FL': { min: 32000, max: 34999 },
      'GA': { min: 30000, max: 31999 },
      'HI': { min: 96700, max: 96999 },
      'ID': { min: 83200, max: 83999 },
      'IL': { min: 60000, max: 62999 },
      'IN': { min: 46000, max: 47999 },
      'IA': { min: 50000, max: 52999 },
      'KS': { min: 66000, max: 67999 },
      'KY': { min: 40000, max: 42999 },
      'LA': { min: 70000, max: 71999 },
      'ME': { min: 3900, max: 4999 },
      'MD': { min: 20600, max: 21999 },
      'MA': { min: 1000, max: 2799 },
      'MI': { min: 48000, max: 49999 },
      'MN': { min: 55000, max: 56999 },
      'MS': { min: 38600, max: 39999 },
      'MO': { min: 63000, max: 65999 },
      'MT': { min: 59000, max: 59999 },
      'NE': { min: 68000, max: 69999 },
      'NV': { min: 88900, max: 89999 },
      'NH': { min: 3000, max: 3899 },
      'NJ': { min: 7000, max: 8999 },
      'NM': { min: 87000, max: 88999 },
      'NY': { min: 10000, max: 14999 },
      'NC': { min: 27000, max: 28999 },
      'ND': { min: 58000, max: 58999 },
      'OH': { min: 43000, max: 45999 },
      'OK': { min: 73000, max: 74999 },
      'OR': { min: 97000, max: 97999 },
      'PA': { min: 15000, max: 19999 },
      'RI': { min: 2800, max: 2999 },
      'SC': { min: 29000, max: 29999 },
      'SD': { min: 57000, max: 57999 },
      'TN': { min: 37000, max: 38999 },
      'TX': { min: 75000, max: 79999 },
      'UT': { min: 84000, max: 84999 },
      'VT': { min: 5000, max: 5999 },
      'VA': { min: 22000, max: 24699 },
      'WA': { min: 98000, max: 99999 },
      'WV': { min: 24700, max: 26999 },
      'WI': { min: 53000, max: 54999 },
      'WY': { min: 82000, max: 83999 },
    };
    
    const range = stateZipRanges[state];
    if (!range) return true; // If state not in list, assume valid
    
    return zipNum >= range.min && zipNum <= range.max;
  };

  // Format zip code based on country
  const formatZipCode = (value: string, country: string) => {
    if (usesAlphanumericPostalCode(country)) {
      // Allow alphanumeric characters, remove spaces and convert to uppercase
      // UK format: SW1A 1AA, M1 1AA, etc. (up to 8 characters)
      // Canada format: A1A 1A1 (6 characters)
      const alphanumeric = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      if (country === 'GB') {
        return alphanumeric.slice(0, 8); // UK postal codes can be up to 7-8 characters
      } else if (country === 'CA') {
        return alphanumeric.slice(0, 6); // Canada postal codes are 6 characters
      } else {
        return alphanumeric.slice(0, 10); // Other countries, allow up to 10
      }
    } else {
      // Numeric-only postal codes
      const numbers = value.replace(/\D/g, '');
      
      // US zip codes are 5 digits
      if (country === 'US') {
        return numbers.slice(0, 5);
      }
      // Australia uses 4 digits
      else if (country === 'AU') {
        return numbers.slice(0, 4);
      }
      // For other numeric countries, allow up to 10 digits
      return numbers.slice(0, 10);
    }
  };

  // Update active tab based on current route
  useEffect(() => {
    const pathname = location.pathname;
    if (pathname.includes('/tools') || pathname === '/tools/gift-card') {
      setMobileMenuActiveTab('TOOLS');
    } else if (pathname.includes('/brand') || pathname.includes('/about') || pathname.includes('/contact') || pathname.includes('/faq') || pathname.includes('/reviews') || pathname.includes('/terms')) {
      setMobileMenuActiveTab('BRAND');
    } else {
      setMobileMenuActiveTab('SHOP');
    }
  }, [location.pathname]);

  // Ensure active tab is set correctly when menu opens
  useEffect(() => {
    if (showMobileMenu) {
      const pathname = location.pathname;
      if (pathname.includes('/tools') || pathname === '/tools/gift-card') {
        setMobileMenuActiveTab('TOOLS');
      } else if (pathname.includes('/brand') || pathname.includes('/about') || pathname.includes('/contact') || pathname.includes('/faq') || pathname.includes('/reviews') || pathname.includes('/terms')) {
        setMobileMenuActiveTab('BRAND');
      } else {
        setMobileMenuActiveTab('SHOP');
      }
    }
  }, [showMobileMenu, location.pathname]);

  const handleMobileMenuToggle = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const handleMobileMenuTabClick = (tab: string) => {
    setMobileMenuActiveTab(tab);
  };

  const handleMobileMenuItemToggle = (item: string) => {
    setMobileMenuExpandedItems(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const handleMobileMenuSignInToggle = () => {
    if (isSignedIn) {
      // Show confirmation modal when signing out
      setShowSignOutConfirm(true);
    } else {
      // Navigate to sign-in page with returnTo parameter
      navigate(signInHrefWithReturnTo(location));
    }
  };

  // Horizontal scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setStartScrollPosition(scrollPosition);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const currentX = e.clientX;
    const diff = currentX - startX;
    const newPosition = startScrollPosition + diff;
    
    // Calculate scroll limits
    const gap = 20;
    const paddingRight = 10;
    const containerWidth = scrollContainerRef.current?.offsetWidth || window.innerWidth - 32; // Account for page padding
    
    // Calculate total content width
    let totalContentWidth = paddingRight; // Start with padding
    orderStripExpandedEntries.forEach((entry, index) => {
      const thumbM = orderStripThumbMetrics(entry.item, isSubscriptionUpgrade, { checkoutStrip: true });
      totalContentWidth += thumbM.cellWidthPx;
      if (index < orderStripExpandedEntries.length - 1) {
        totalContentWidth += gap;
      }
    });
    
    const maxScroll = 0;
    const minScroll = -(totalContentWidth - containerWidth);
    setScrollPosition(Math.max(minScroll, Math.min(maxScroll, newPosition)));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setStartScrollPosition(scrollPosition);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    const newPosition = startScrollPosition + diff;
    
    // Calculate scroll limits
    const gap = 20;
    const paddingRight = 10;
    const containerWidth = scrollContainerRef.current?.offsetWidth || window.innerWidth - 32; // Account for page padding
    
    // Calculate total content width
    let totalContentWidth = paddingRight; // Start with padding
    orderStripExpandedEntries.forEach((entry, index) => {
      const thumbM = orderStripThumbMetrics(entry.item, isSubscriptionUpgrade, { checkoutStrip: true });
      totalContentWidth += thumbM.cellWidthPx;
      if (index < orderStripExpandedEntries.length - 1) {
        totalContentWidth += gap;
      }
    });
    
    const maxScroll = 0;
    const minScroll = -(totalContentWidth - containerWidth);
    setScrollPosition(Math.max(minScroll, Math.min(maxScroll, newPosition)));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleSignOut = async () => {
    setIsSignedIn(false);
    await signOutAppAndSupabaseSession();
    setShowSignOutConfirm(false);
    setShowMobileMenu(false);
  };

  // Get user's premium membership tier

  const getPremiumTier = (): string | null => {
    if (!isSignedIn) return null;
    try {
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        const user = JSON.parse(currentUser);
        return getEffectiveSubscriptionTier(user);
      }
    } catch (e) {
      console.error('Error getting premium tier:', e);
    }
    return null;
  };

  /** Points multiplier: 12mo premium = 2x (takes precedence); else Red 1.25x, Black 1.5x, Standard 1x. No stacking. Uses effective tier (admin override) when set. */
  const getPointsMultiplierForUser = (): number => {
    if (!isSignedIn) return 1;
    try {
      const currentUser = localStorage.getItem('currentUser');
      if (!currentUser) return 1;
      const user = JSON.parse(currentUser);
      const tier = getEffectiveTierName(user) || (user.currentTierName || user.tier || (user.email ? localStorage.getItem(`lastKnownTier_${(user.email || '').trim().toLowerCase()}`) : null) || '').toString().toUpperCase() || null;
      const subscriptionTier = getPremiumTier();
      const { multiplier } = getPointsMultiplier(tier, subscriptionTier);
      return multiplier;
    } catch (_) {
      return 1;
    }
  };

  // Calculate available shipping options based on address (shows original prices, discounts applied in order summary)
  const calculateShippingOptions = () => {
    if (!selectedCountry || !zipCode) return [];
    
    const isDomestic = selectedCountry === 'US';
    
    if (isDomestic) {
      // Domestic options: standard or express (original prices)
      return [
        { carrier: 'DOMESTIC', speed: 'standard', cost: 60, label: 'DOMESTIC STANDARD +$60', originalCost: 60 },
        { carrier: 'DOMESTIC', speed: 'express', cost: 100, label: 'DOMESTIC EXPRESS +$100', originalCost: 100 },
      ];
    } else {
      // International options: standard and express (original prices)
      return [
        { carrier: 'INTERNATIONAL', speed: 'standard', cost: 100, label: 'INTERNATIONAL STANDARD +$100', originalCost: 100 },
        { carrier: 'INTERNATIONAL', speed: 'express', cost: 160, label: 'INTERNATIONAL EXPRESS +$160', originalCost: 160 },
      ];
    }
  };

  // Calculate premium shipping discount based on selected method and tier
  const calculatePremiumShippingDiscount = (): { discount: number; originalCost: number; finalCost: number } => {
    if (
      !selectedShippingMethod ||
      isSubscriptionUpgrade ||
      isOnlyDigitalProducts ||
      isBookingsOnlyCheckoutState(location.pathname, cartItems)
    ) {
      return { discount: 0, originalCost: 0, finalCost: 0 };
    }

    const originalCost = selectedShippingMethod.originalCost || selectedShippingMethod.cost || 0;
    const isDomestic = selectedCountry === 'US';
    let discount = 0;
    let finalCost = originalCost;

    // Premium tier shipping discounts
    const premiumTier = getPremiumTier();
    if (!premiumTier) {
      return { discount: 0, originalCost, finalCost: originalCost };
    }

    if (isDomestic) {
      if (selectedShippingMethod.speed === 'standard') {
        if (premiumTier === '3months') {
          discount = 20;
        } else if (premiumTier === '6months') {
          discount = 40;
        } else if (premiumTier === '12months') {
          discount = 60; // Free
        }
      } else if (selectedShippingMethod.speed === 'express') {
        if (premiumTier === '6months') {
          discount = 40;
        } else if (premiumTier === '12months') {
          discount = 40;
        }
      }
    } else {
      // International
      if (selectedShippingMethod.speed === 'standard' && premiumTier === '12months') {
        discount = 40;
      } else if (selectedShippingMethod.speed === 'express' && premiumTier === '12months') {
        discount = 40;
      }
    }

    finalCost = Math.max(0, originalCost - discount);
    return { discount, originalCost, finalCost };
  };

  const availableShippingOptions = calculateShippingOptions();

  // Check if cart only contains digital products (gift cards or digital items)
  const isOnlyDigitalProducts = cartItems.length > 0 && cartItems.every((item) => {
    const isGiftCard = item.name === 'GIFT CARD' || item.type === 'gift-card';
    const isDigital = item.type === 'digital';
    return isGiftCard || isDigital;
  });

  // Check if cart only contains gift cards
  const isOnlyGiftCards = cartItems.length > 0 && cartItems.every((item) => {
    return item.name === 'GIFT CARD' || item.type === 'gift-card';
  });

  const isBookingsOnlyCheckout = isBookingsOnlyCheckoutState(location.pathname, cartItems);
  const checkoutSkipsShipping =
    isSubscriptionUpgrade || isOnlyDigitalProducts || isBookingsOnlyCheckout;

  // Calculate Route protection fee based on order value (scales with cart total)
  // Structure: Flat $20 for orders up to $1,000, then percentage-based for larger orders
  // This aligns with Route's typical 2.5% rate for high-value orders
  // Always rounds UP to nearest $10 increment
  const calculateProtectionFee = (orderTotal: number): number => {
    if (orderTotal <= 1000) {
      return 20; // Flat $20 for orders up to $1,000 (covers typical $740-$820 orders)
    } else {
      let calculatedFee = 0;
      if (orderTotal <= 2500) {
        calculatedFee = orderTotal * 0.02; // 2% for orders $1,000-$2,500
      } else if (orderTotal <= 5000) {
        calculatedFee = orderTotal * 0.0225; // 2.25% for orders $2,500-$5,000
      } else {
        calculatedFee = orderTotal * 0.025; // 2.5% for orders $5,000+
      }
      // Round up to nearest $10 increment
      return Math.ceil(calculatedFee / 10) * 10;
    }
  };

  // Calculate order totals (sold-out wig units remain in bag but do not count toward payment)
  const orderAmount = cartBillableSubtotal(cartItems);
  const orderAmountExcludingSpecialOffer = cartBillableSubtotalExcludingSpecialOffer(cartItems);

  // Calculate taxable amount (exclude gift cards, digital items, sold-out units, and bookings-only A/C checkout)
  const taxableAmount = isBookingsOnlyCheckout ? 0 : cartBillableTaxableSubtotal(cartItems);

  const taxesProcessing = taxableAmount * 0.10; // 10% sales tax on taxable amount only (excluding gift cards, digital items, shipping & discounts)
  
  // Calculate shipping based on selected method (applies premium discount)
  const getShippingCost = () => {
    if (checkoutSkipsShipping) return 0; // No shipping for upgrades, digital-only carts, or A/C bookings checkout
    if (!selectedShippingMethod) return 0;
    
    // Get premium discount
    const premiumDiscount = calculatePremiumShippingDiscount();
    return premiumDiscount.finalCost;
  };
  const shippingHandling = getShippingCost();
  
  // Get premium shipping discount info for display
  const premiumShippingDiscount = calculatePremiumShippingDiscount();

  // Update applied gift card balance when order amount changes (cap at order total)
  // NOT applied to subscription upgrades
  // Cannot be combined with referral codes or discount codes
  // Note: Adding a gift card (code) at checkout replaces the digital cash line; digital cash (account balance) and gift card code cannot be applied together.
  // When user has chosen an amount in the digital cash modal, we cap that choice by the new max but do not reset to full cap.
  useEffect(() => {
    if (isSubscriptionUpgrade) {
      setAppliedGiftCardBalance(0);
      userSelectedDigitalCashRef.current = null;
      return;
    }
    if (appliedReferralCode || appliedDiscount > 0 || appliedBrandDiscountPromo || appliedConsultQuote) {
      setAppliedGiftCardBalance(0);
      userSelectedDigitalCashRef.current = null;
      return;
    }
    if (giftCardBalance <= 0) {
      setAppliedGiftCardBalance(0);
      userSelectedDigitalCashRef.current = null;
      return;
    }
    const protectionFeeForDiscount = packageProtection ? calculateProtectionFee(orderAmount) : 0;
    const baseForGiftCard = (hasSpecialOfferInCart && !hasOnlySpecialOfferInCart) ? orderAmountExcludingSpecialOffer : orderAmount;
    const maxDiscountable = baseForGiftCard + taxesProcessing + shippingHandling + (selectedProcessing === 'rush' ? 100 : 0) + protectionFeeForDiscount;
    const cappedBalance = Math.min(giftCardBalance, maxDiscountable);
    if (userSelectedDigitalCashRef.current !== null) {
      setAppliedGiftCardBalance(Math.min(userSelectedDigitalCashRef.current, cappedBalance));
    } else {
      setAppliedGiftCardBalance(cappedBalance);
    }
  }, [giftCardBalance, orderAmount, orderAmountExcludingSpecialOffer, hasSpecialOfferInCart, hasOnlySpecialOfferInCart, taxesProcessing, shippingHandling, selectedProcessing, packageProtection, isSubscriptionUpgrade, appliedReferralCode, appliedDiscount, appliedBrandDiscountPromo, appliedConsultQuote]);
  
  // Check if code is a referral code (matches referralCode or referralNumber so admin-created codes work)
  const isReferralCode = (code: string): boolean => {
    try {
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const upperCode = code.trim().toUpperCase();
      return registeredUsers.some((user: any) => {
        const codeMatch = (user.referralCode && user.referralCode.toUpperCase() === upperCode) ||
          (user.referralNumber && user.referralNumber.toUpperCase() === upperCode);
        return !!codeMatch;
      });
    } catch (e) {
      return false;
    }
  };

  // Referral codes are inactive until the owner has an order marked complete & delivered (or SHIPPED). Existing users with orders but no hasMadeFirstPurchase flag are treated as active.
  const getReferralCodeOwner = (code: string): { user: any; isActive: boolean } | null => {
    try {
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const upperCode = code.trim().toUpperCase();
      const owner = registeredUsers.find((user: any) =>
        (user.referralCode && user.referralCode.toUpperCase() === upperCode) ||
        (user.referralNumber && user.referralNumber.toUpperCase() === upperCode)
      );
      if (!owner) return null;
      let isActive = false;
      if (owner.email) {
        const key = `userOrders_${String(owner.email).trim().toLowerCase()}`;
        const raw = localStorage.getItem(key);
        if (raw) {
          const data = JSON.parse(raw);
          const activeOrders = data.activeOrders || [];
          const pastOrders = data.pastOrders || [];
          const allOrders = [...activeOrders, ...pastOrders];
          const hasDelivered = allOrders.some((o: any) => (o.status || '').toUpperCase() === 'DELIVERED' || (o.status || '').toUpperCase() === 'SHIPPED');
          if (hasDelivered) isActive = true;
          if (!isActive && owner.hasMadeFirstPurchase !== true && allOrders.length > 0) isActive = true;
        }
      }
      return { user: owner, isActive };
    } catch (e) {
      return null;
    }
  };

  // Check if current user has ever completed a purchase (referral codes only valid on first purchase)
  const currentUserHasExistingOrders = (): boolean => {
    if (!isSignedIn || !email) return false;
    try {
      const key = `userOrders_${email.trim().toLowerCase()}`;
      const raw = localStorage.getItem(key);
      if (!raw) return false;
      const data = JSON.parse(raw);
      const active = (data.activeOrders || []).length;
      const past = (data.pastOrders || []).length;
      return active + past > 0;
    } catch (e) {
      return false;
    }
  };
  
  // Check if code is a gift card (numeric)
  const isGiftCardCode = (code: string): boolean => {
    const numericValue = code.replace(/[$€£¥₹,.\s]/g, '');
    return /^\d+$/.test(numericValue) && numericValue.length > 0;
  };
  
  // Discount code validation function
  const validateDiscountCode = (code: string): number => {
    // Define valid discount codes and their discount amounts
    // You can expand this list with actual discount codes
    const validCodes: { [key: string]: number } = {
      'WELCOME10': 10,
      'SAVE20': 20,
      'FIRST25': 25,
      // Add more valid codes here
    };
    
    const upperCode = code.trim().toUpperCase();
    return validCodes[upperCode] || 0;
  };
  
  const handleApplyDiscountCode = async () => {
    if (!discountCode.trim()) {
      setDiscountCodeError('');
      setAppliedDiscount(0);
      setAppliedBrandDiscountPromo(null);
      setAppliedConsultQuote(null);
      setAppliedReferralCode('');
      setReferralDiscount(0);
      return;
    }
    
    // When cart contains only special offer items, codes cannot be applied
    if (hasOnlySpecialOfferInCart) {
      setDiscountCodeError(SPECIAL_OFFER_CHECKOUT_COMBO_MESSAGE);
      return;
    }
    
    // Show error for digital products (subscription upgrades or gift cards)
    if (isSubscriptionUpgrade || isOnlyGiftCards) {
      setDiscountCodeError('SORRY, THIS CODE IS NOT VALID.');
      setAppliedDiscount(0);
      setAppliedBrandDiscountPromo(null);
      setAppliedConsultQuote(null);
      setAppliedReferralCode('');
      setReferralDiscount(0);
      return;
    }
    
    const code = discountCode.trim();
    const codeNorm = code.toUpperCase();

    // Admin-sent consult quote codes ($40 / 72h / one-time) — server-validated
    if (codeNorm.startsWith('CONSULT-')) {
      if (isBookingsCheckoutRoute) {
        setDiscountCodeError('CONSULT CODES APPLY TO CUSTOM UNIT ORDERS, NOT BOOKINGS-ONLY CHECKOUT.');
        setAppliedConsultQuote(null);
        return;
      }
      if (!isSignedIn) {
        setDiscountCodeError('SIGN IN TO USE YOUR CONSULT CODE.');
        return;
      }
      if (appliedReferralCode) {
        setDiscountCodeError('CONSULT CODES CANNOT BE COMBINED WITH REFERRAL CODES.');
        return;
      }
      if (appliedGiftCardBalance > 0) {
        setDiscountCodeError('CONSULT CODES CANNOT BE COMBINED WITH GIFT CARDS.');
        return;
      }
      const base =
        hasSpecialOfferInCart && !hasOnlySpecialOfferInCart
          ? orderAmountExcludingSpecialOffer
          : orderAmount;
      const bookingPortion = cartItems.reduce((sum, item: { price?: number; quantity?: number; type?: string }) => {
        if (!isBillableCartLine(item)) return sum;
        if (item?.type === 'booking-appointment' || item?.type === 'booking-consult') {
          return sum + cartLineExtendedPriceUsd(item);
        }
        return sum;
      }, 0);
      const eligibleConsult = Math.round(Math.max(0, base - bookingPortion) * 100) / 100;
      if (eligibleConsult <= 0) {
        setDiscountCodeError('ADD ELIGIBLE CUSTOM UNIT ITEMS TO USE THIS CONSULT CODE. (BOOKINGS ARE EXCLUDED.)');
        setAppliedConsultQuote(null);
        return;
      }
      try {
        const token = await getAccessToken();
        if (!token) {
          setDiscountCodeError('SIGN IN TO USE YOUR CONSULT CODE.');
          return;
        }
        const v = await validateConsultDiscountCode(code);
        setAppliedConsultQuote({
          quoteId: v.quoteId,
          code: (v.code || codeNorm).toUpperCase(),
          amountUsd: typeof v.amountUsd === 'number' ? v.amountUsd : 40,
        });
        setAppliedDiscount(0);
        setAppliedBrandDiscountPromo(null);
        setAppliedReferralCode('');
        setReferralDiscount(0);
        setDiscountCodeError('');
      } catch (e) {
        setAppliedConsultQuote(null);
        setDiscountCodeError(e instanceof Error ? e.message : 'CODE NOT VALID.');
      }
      return;
    }
    
    // Check if it's a referral code
    if (isReferralCode(code)) {
      if (!isSignedIn) {
        setDiscountCodeError('SIGN IN OR CREATE AN ACCOUNT TO USE A REFERRAL CODE.');
        return;
      }
      if (appliedDiscount > 0 || appliedBrandDiscountPromo || appliedConsultQuote) {
        setDiscountCodeError('REFERRAL CODES CANNOT BE COMBINED WITH DISCOUNT CODES.');
        setAppliedReferralCode('');
        setReferralDiscount(0);
        return;
      }
      if (appliedGiftCardBalance > 0) {
        setDiscountCodeError('REFERRAL CODES CANNOT BE COMBINED WITH GIFT CARDS.');
        setAppliedReferralCode('');
        setReferralDiscount(0);
        return;
      }
      // Referral code is only valid (shareable/redeemable) once the code owner has made their first purchase
      const ownerResult = getReferralCodeOwner(code);
      if (!ownerResult) {
        setDiscountCodeError('THIS REFERRAL CODE IS NOT VALID.');
        return;
      }
      if (!ownerResult.isActive) {
        setDiscountCodeError('THIS REFERRAL CODE IS NOT YET ACTIVE.');
        return;
      }
      // Rule: users cannot use their own referral code
      const buyerEmail = (email || '').trim().toLowerCase();
      const ownerEmail = (ownerResult.user?.email || '').trim().toLowerCase();
      if (buyerEmail && ownerEmail && buyerEmail === ownerEmail) {
        setDiscountCodeError('YOU CANNOT USE YOUR OWN REFERRAL CODE.');
        return;
      }
      // Rule: referral codes apply to first purchase only; existing customers cannot use a referral code
      if (currentUserHasExistingOrders()) {
        setDiscountCodeError('REFERRAL CODES CAN ONLY BE USED ON YOUR FIRST PURCHASE.');
        return;
      }
      // Rule: same customer identity (name, phone, email, address) cannot use a referral code more than once across any account
      let currentUser: any = null;
      try {
        currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      } catch {
        // ignore
      }
      const addressStr = [shippingAddress, city, state, zip].filter(Boolean).join(', ').trim();
      const buyerIdentity = {
        email: (email || currentUser?.email || '').trim(),
        firstName: (firstName || currentUser?.firstName || '').trim(),
        lastName: (lastName || currentUser?.lastName || '').trim(),
        phone: (phoneNumber || currentUser?.phoneNumber || currentUser?.phone || '').trim(),
        address: addressStr,
      };
      if (hasIdentityAlreadyUsedReferralCode(buyerIdentity)) {
        setDiscountCodeError('REFERRAL CODES ARE FOR FIRST TIME CUSTOMERS ONLY.');
        return;
      }
      if (appliedGiftCardBalance > 0) {
        setAppliedGiftCardBalance(0);
      }
      setAppliedReferralCode(code.toUpperCase());
      setReferralDiscount(20);
      setDiscountCodeError('');
      setAppliedDiscount(0);
      setAppliedBrandDiscountPromo(null);
      setAppliedConsultQuote(null);
      return;
    }
    
    // Check if it's a gift card (numeric)
    if (isGiftCardCode(code)) {
      // Check if referral code or discount code is already applied
      if (appliedReferralCode) {
        setDiscountCodeError('GIFT CARDS CANNOT BE COMBINED WITH REFERRAL CODES.');
        return;
      }
      if (appliedDiscount > 0 || appliedBrandDiscountPromo || appliedConsultQuote) {
        setDiscountCodeError('GIFT CARDS CANNOT BE COMBINED WITH DISCOUNT CODES.');
        return;
      }
      // Gift card is handled separately via giftCardBalance
      setDiscountCodeError('PLEASE USE YOUR GIFT CARD BALANCE FROM YOUR ACCOUNT.');
      setAppliedDiscount(0);
      setAppliedBrandDiscountPromo(null);
      setAppliedConsultQuote(null);
      setAppliedReferralCode('');
      setReferralDiscount(0);
      return;
    }
    
    // Check if referral code or gift card is already applied before applying discount code
    if (appliedReferralCode) {
      setDiscountCodeError('DISCOUNT CODES CANNOT BE COMBINED WITH REFERRAL CODES.');
      setAppliedDiscount(0);
      setAppliedBrandDiscountPromo(null);
      setAppliedConsultQuote(null);
      return;
    }
    if (appliedGiftCardBalance > 0) {
      setDiscountCodeError('DISCOUNT CODES CANNOT BE COMBINED WITH GIFT CARDS.');
      setAppliedDiscount(0);
      setAppliedBrandDiscountPromo(null);
      setAppliedConsultQuote(null);
      return;
    }
    
    // Admin Brand → CODES: percent discount from generated codes
    const brandPromo = findDiscountPromoByNormalizedCode(code);
    if (brandPromo) {
      const block = discountPromoCheckoutBlockReason(brandPromo);
      if (block) {
        const msg =
          block === 'CODE INACTIVE'
            ? 'THIS CODE IS INACTIVE.'
            : block === 'CODE EXPIRED'
              ? 'THIS CODE HAS EXPIRED.'
              : block === 'CODE NO LONGER VALID'
                ? 'THIS CODE CAN NO LONGER BE USED.'
                : 'SORRY, THIS CODE IS NOT VALID.';
        setDiscountCodeError(msg);
        setAppliedDiscount(0);
        setAppliedBrandDiscountPromo(null);
        setAppliedConsultQuote(null);
        setAppliedReferralCode('');
        setReferralDiscount(0);
        return;
      }
      const pct = parseDiscountPercent(brandPromo.valueLabel);
      if (pct == null) {
        setDiscountCodeError('SORRY, THIS CODE IS NOT VALID.');
        setAppliedDiscount(0);
        setAppliedBrandDiscountPromo(null);
        setAppliedConsultQuote(null);
        setAppliedReferralCode('');
        setReferralDiscount(0);
        return;
      }
      if (appliedGiftCardBalance > 0) {
        setAppliedGiftCardBalance(0);
      }
      setAppliedBrandDiscountPromo({ id: brandPromo.id, code: brandPromo.code, percent: pct });
      setAppliedDiscount(0);
      setAppliedConsultQuote(null);
      setDiscountCodeError('');
      setAppliedReferralCode('');
      setReferralDiscount(0);
      return;
    }
    
    // Try to validate as built-in flat discount code
    const discountAmount = validateDiscountCode(code);
    
    if (discountAmount > 0) {
      // Clear gift card balance if applied
      if (appliedGiftCardBalance > 0) {
        setAppliedGiftCardBalance(0);
      }
      setAppliedBrandDiscountPromo(null);
      setAppliedConsultQuote(null);
      setAppliedDiscount(discountAmount);
      setDiscountCodeError('');
      setAppliedReferralCode('');
      setReferralDiscount(0);
    } else {
      setAppliedDiscount(0);
      setAppliedBrandDiscountPromo(null);
      setAppliedConsultQuote(null);
      setDiscountCodeError('SORRY, THIS CODE IS NOT VALID.');
      setAppliedReferralCode('');
      setReferralDiscount(0);
    }
  };

  applyDiscountCodeRef.current = handleApplyDiscountCode;

  /** After "Claim offer" adds a unit to the bag, queue CONSULT-* from session or `?consultClaim=` + fetch quote. */
  useEffect(() => {
    if (consultClaimBootstrapDoneRef.current) return;
    if (isSubscriptionUpgrade || isBookingsCheckoutRoute || isGiftCardCheckoutRoute) return;

    let claimId = '';
    let claimCode = '';
    try {
      claimId = (searchParams.get('consultClaim') || '').trim();
      claimCode = (sessionStorage.getItem(SESSION_CONSULT_CLAIM_CODE) || '').trim().toUpperCase();
      if (!claimId) claimId = (sessionStorage.getItem(SESSION_CONSULT_CLAIM_QUOTE_ID) || '').trim();
    } catch {
      /* ignore */
    }
    if (!claimId && !claimCode) return;

    consultClaimBootstrapDoneRef.current = true;
    let cancelled = false;
    void (async () => {
      let code = claimCode;
      if (!code && claimId) {
        try {
          const res = await getConsultQuote(claimId);
          const q = res?.quote as { discount_code?: string } | undefined;
          code = String(q?.discount_code || '').trim().toUpperCase();
        } catch {
          code = '';
        }
      }
      if (cancelled || !code || !code.startsWith('CONSULT-')) {
        try {
          sessionStorage.removeItem(SESSION_CONSULT_CLAIM_CODE);
          sessionStorage.removeItem(SESSION_CONSULT_CLAIM_QUOTE_ID);
        } catch {
          /* ignore */
        }
        if (searchParams.get('consultClaim')) {
          const next = new URLSearchParams(searchParams);
          next.delete('consultClaim');
          setSearchParams(next, { replace: true });
        }
        return;
      }

      try {
        sessionStorage.removeItem(SESSION_CONSULT_CLAIM_CODE);
        sessionStorage.removeItem(SESSION_CONSULT_CLAIM_QUOTE_ID);
      } catch {
        /* ignore */
      }
      if (searchParams.get('consultClaim')) {
        const next = new URLSearchParams(searchParams);
        next.delete('consultClaim');
        setSearchParams(next, { replace: true });
      }

      setDiscountCodeError('');
      setPendingConsultDiscountCode(code);
    })();

    return () => {
      cancelled = true;
    };
  }, [isSubscriptionUpgrade, isBookingsCheckoutRoute, isGiftCardCheckoutRoute, searchParams, setSearchParams]);

  useEffect(() => {
    if (!pendingConsultDiscountCode) return;
    if (cartItems.length === 0) return;
    const c = pendingConsultDiscountCode;
    setPendingConsultDiscountCode(null);
    setDiscountCode(c);
    setDiscountCodeDisplay(c);
    void applyDiscountCodeRef.current();
  }, [pendingConsultDiscountCode, cartItems.length]);

  // Gift card discount should NOT be applied to subscription upgrades. When applied, this is shown as "DIGITAL CASH" (account balance). This balance includes tier welcome discount (Silver $10, Red $40, Black $80) credited when the user reaches each spend tier. If a gift card code is applied instead, that replaces this line (label "GIFT CARD"); both cannot be applied together.
  const giftCardDiscount = isSubscriptionUpgrade ? 0 : appliedGiftCardBalance; // Automatically applied gift card balance (digital cash)
  // Voucher discount: one voucher at a time, cannot combine. Subtract add-on price for the single voucher (uses stored price or fallback so red (-$120) etc. always shows).
  const voucherDiscount = useMemo(() => {
    if (!voucherLineApplicable) return 0;
    const normalized: Record<string, number> = {};
    const firstWithQty = Object.keys(VOUCHER_TYPE_CONFIG).find((type) => (appliedVoucherQuantities[type] || 0) > 0);
    Object.keys(VOUCHER_TYPE_CONFIG).forEach((type) => { normalized[type] = type === firstWithQty ? Math.min(1, appliedVoucherQuantities[type] || 0) : 0; });
    const isPhysical = (item: any) => item.name !== 'GIFT CARD' && item.type !== 'gift-card' && item.type !== 'digital' && !item.isSpecialOffer;
    let total = 0;
    Object.keys(VOUCHER_TYPE_CONFIG).forEach((type) => {
      const vouchersToUse = normalized[type] || 0;
      if (vouchersToUse <= 0) return;
      const { optionKey, getDefault } = VOUCHER_TYPE_CONFIG[type];
      let left = vouchersToUse;
      cartItems.forEach((item: any) => {
        if (!isPhysical(item) || left <= 0) return;
        const val = item[optionKey];
        const def = getDefault(item);
        const valNorm = val != null && val !== '' ? String(val).trim().toUpperCase() : '';
        const defNorm = String(def).trim().toUpperCase();
        const hasOption = valNorm !== '' && valNorm !== defNorm;
        if (!hasOption) return;
        const pricePerUnit = getVoucherAddOnPriceForItem(item, type);
        const qty = item.quantity || 1;
        const units = Math.min(left, qty);
        total += units * pricePerUnit;
        left -= units;
      });
    });
    return total;
  }, [voucherLineApplicable, appliedVoucherQuantities, cartItems]);

  const brandDiscountAmount = useMemo(() => {
    if (!appliedBrandDiscountPromo) return 0;
    const eligible =
      !hasSpecialOfferInCart || hasOnlySpecialOfferInCart
        ? orderAmount
        : orderAmountExcludingSpecialOffer;
    const raw = (eligible * appliedBrandDiscountPromo.percent) / 100;
    return Math.round(raw * 100) / 100;
  }, [
    appliedBrandDiscountPromo,
    hasSpecialOfferInCart,
    hasOnlySpecialOfferInCart,
    orderAmount,
    orderAmountExcludingSpecialOffer,
  ]);

  const legacyAndBrandDiscount = appliedDiscount + brandDiscountAmount;

  const consultCodeEligibleUsd = useMemo(() => {
    if (hasOnlySpecialOfferInCart) return 0;
    const base =
      hasSpecialOfferInCart && !hasOnlySpecialOfferInCart
        ? orderAmountExcludingSpecialOffer
        : orderAmount;
    const bookingPortion = cartItems.reduce((sum, item: { price?: number; quantity?: number; type?: string }) => {
      if (!isBillableCartLine(item)) return sum;
      if (item?.type === 'booking-appointment' || item?.type === 'booking-consult') {
        return sum + cartLineExtendedPriceUsd(item);
      }
      return sum;
    }, 0);
    return Math.round(Math.max(0, base - bookingPortion) * 100) / 100;
  }, [
    cartItems,
    orderAmount,
    orderAmountExcludingSpecialOffer,
    hasSpecialOfferInCart,
    hasOnlySpecialOfferInCart,
  ]);

  const consultRedeemQuoteIdsFromCart = useMemo(() => {
    const ids = new Set<string>();
    for (const item of cartItems as any[]) {
      if (item?.consultOfferQtyLocked === true) {
        const id = String(item?.consultOfferQuoteId || '').trim();
        if (id) ids.add(id);
      }
    }
    return ids;
  }, [cartItems]);

  const consultDiscountAmount = useMemo(() => {
    if (!appliedConsultQuote) return 0;
    return Math.min(appliedConsultQuote.amountUsd, consultCodeEligibleUsd);
  }, [appliedConsultQuote, consultCodeEligibleUsd]);

  // When cart has special offer + other items, discount/referral/gift card apply only to the non–special-offer amount (legacy + brand % only; consult $ is capped separately).
  const { effectiveDiscount, effectiveReferralDiscount, effectiveGiftCardDiscount } = useMemo(() => {
    if (!hasSpecialOfferInCart || hasOnlySpecialOfferInCart) {
      return {
        effectiveDiscount: legacyAndBrandDiscount,
        effectiveReferralDiscount: referralDiscount,
        effectiveGiftCardDiscount: giftCardDiscount,
      };
    }
    const eligible = orderAmountExcludingSpecialOffer;
    const d = Math.min(legacyAndBrandDiscount, eligible);
    const r = Math.min(referralDiscount, Math.max(0, eligible - d));
    const g = Math.min(giftCardDiscount, Math.max(0, eligible - d - r));
    return { effectiveDiscount: d, effectiveReferralDiscount: r, effectiveGiftCardDiscount: g };
  }, [
    hasSpecialOfferInCart,
    hasOnlySpecialOfferInCart,
    orderAmountExcludingSpecialOffer,
    legacyAndBrandDiscount,
    referralDiscount,
    giftCardDiscount,
  ]);
  const totalDiscount =
    effectiveDiscount +
    effectiveReferralDiscount +
    effectiveGiftCardDiscount +
    voucherDiscount +
    consultDiscountAmount;

  const pointsEligibleNetAmount = useMemo(
    () =>
      !cartHasAnyLoyaltyEarningLine(cartItems)
        ? 0
        : computePointsEligibleNetUsd({
            cartItems,
            hasSpecialOfferInCart,
            hasOnlySpecialOfferInCart,
            orderAmount,
            orderAmountExcludingSpecialOffer,
            effectiveDiscount,
            effectiveReferralDiscount,
            effectiveGiftCardDiscount,
            voucherDiscount,
            consultDiscountAmount,
          }),
    [
      cartItems,
      hasSpecialOfferInCart,
      hasOnlySpecialOfferInCart,
      orderAmount,
      orderAmountExcludingSpecialOffer,
      effectiveDiscount,
      effectiveReferralDiscount,
      effectiveGiftCardDiscount,
      voucherDiscount,
      consultDiscountAmount,
    ],
  );

  useEffect(() => {
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('checkoutLoyaltyBaseUsd', String(pointsEligibleNetAmount));
      }
    } catch {
      /* ignore */
    }
  }, [pointsEligibleNetAmount]);

  /** Persist new order to local `userOrders_*` and mirror to Supabase when configured. */
  const persistUserOrderAfterCheckoutAfterCartSaved = useCallback(
    (args: {
      nextOrderNumber: number;
      orderNumber: string;
      orderDate: string;
      orderAmount: number;
      subtotal: number;
      pointsEarned: number;
      appliedGiftCardBalance: number;
    }) => {
      if (!isSignedIn || !email?.trim()) return;
      const {
        nextOrderNumber,
        orderNumber,
        orderDate,
        orderAmount,
        subtotal,
        pointsEarned,
        appliedGiftCardBalance: giftApplied,
      } = args;
      try {
        const userOrdersKey = `userOrders_${email.trim().toLowerCase()}`;
        const existing = localStorage.getItem(userOrdersKey);
        const ordersData = existing ? JSON.parse(existing) : { activeOrders: [], pastOrders: [] };
        const activeOrders = ordersData.activeOrders || [];
        const pastOrdersBucket = ordersData.pastOrders || [];
        const wasFirstOrder = activeOrders.length === 0 && pastOrdersBucket.length === 0;

        if (!isSubscriptionUpgrade) {
          const firstItem = cartItems[0];
          const productName = firstItem?.name || 'Order';
          const onlyGiftOrDigital =
            cartItems.length > 0 &&
            cartItems.every(
              (i: any) =>
                i?.name === 'GIFT CARD' || i?.type === 'gift-card' || i?.type === 'digital'
            );
          if (onlyGiftOrDigital && cartItems.every((i: any) => isGiftCardCartLine(i))) {
            clearGiftCardCheckoutCartBackup();
          }
          const digitalFulfillmentOnly = Boolean(onlyGiftOrDigital);
          const bookingsOnlyAc = isBookingsOnlyCheckoutState(location.pathname, cartItems);
          const useDigitalTimeline = digitalFulfillmentOnly || bookingsOnlyAc;
          const bookingFlowTypePersist = bookingsOnlyAc
            ? cartItems.some((item: any) => item?.type === 'booking-appointment')
              ? 'appointment'
              : 'consult'
            : undefined;
          const bookingCartLineForPersist =
            bookingsOnlyAc && bookingFlowTypePersist
              ? (cartItems as any[]).find((item: any) =>
                  bookingFlowTypePersist === 'appointment'
                    ? item?.type === 'booking-appointment'
                    : item?.type === 'booking-consult'
                )
              : undefined;
          const bookingTierPersist: 'standard' | 'premium' =
            bookingCartLineForPersist?.bookingTier === 'premium' ? 'premium' : 'standard';
          const bookingOrderThumb =
            bookingFlowTypePersist &&
            bookingCartItemThumbnailSrc({
              type:
                bookingFlowTypePersist === 'appointment' ? 'booking-appointment' : 'booking-consult',
              bookingTier: bookingTierPersist,
            });
          const requiresOrderAuthorizationForm = cartRequiresOrderAuthorizationForm(cartItems as any[]);
          const requiresGiftCardIdentityForm = cartRequiresGiftCardIdentityForm(
            cartItems as unknown[],
            email
          );
          const consultInspoPersist =
            bookingFlowTypePersist === 'consult' &&
            Array.isArray(bookingCartLineForPersist?.bookingInspoPhotoUrls)
              ? (bookingCartLineForPersist.bookingInspoPhotoUrls as unknown[]).filter(
                  (u): u is string => typeof u === 'string' && u.trim().length > 0
                )
              : undefined;
          const persistedLineItems =
            digitalFulfillmentOnly ? undefined : buildPersistedLineItemsFromCart(cartItems as any[]);
          const newOrder = {
            id: `order-${nextOrderNumber}`,
            orderNumber: `ORDER ${orderNumber}`,
            date: orderDate,
            status: useDigitalTimeline ? 'PLACED' : 'PREPARING',
            productName,
            productImage: bookingOrderThumb ?? '/assets/natural front.png',
            total: subtotal,
            subtotal: orderAmount,
            items: cartBillableQuantityUnits(cartItems),
            placedAt: Date.now(),
            pointsEarned,
            requiresOrderAuthorizationForm,
            ...(requiresGiftCardIdentityForm ? { requiresGiftCardIdentityForm: true as const } : {}),
            ...(persistedLineItems && persistedLineItems.length > 0 ? { lineItems: persistedLineItems } : {}),
            ...(giftApplied > 0 ? { giftCardAppliedUsd: giftApplied } : {}),
            ...(digitalFulfillmentOnly ? { digitalFulfillmentOnly: true as const } : {}),
            ...(bookingFlowTypePersist
              ? {
                  bookingFlowType: bookingFlowTypePersist,
                  bookingTier: bookingTierPersist,
                }
              : {}),
            ...(consultInspoPersist && consultInspoPersist.length > 0
              ? { bookingInspoPhotoUrls: consultInspoPersist }
              : {}),
          };
          activeOrders.push(newOrder);
          localStorage.setItem(userOrdersKey, JSON.stringify({ ...ordersData, activeOrders }));
          const consultWithMeasurements = (cartItems as any[]).find(
            (item: any) =>
              item?.type === 'booking-consult' &&
              item?.bookingHeadMeasurements &&
              typeof item.bookingHeadMeasurements === 'object'
          );
          if (consultWithMeasurements?.bookingHeadMeasurements) {
            saveLastSubmittedBookingConsultHeadMeasurements(
              email,
              consultWithMeasurements.bookingHeadMeasurements as Record<string, unknown>
            );
            window.dispatchEvent(new CustomEvent('ordersUpdated'));
          }
          const currentUserRaw = localStorage.getItem('currentUser');
          const currentUserForAlert = currentUserRaw ? JSON.parse(currentUserRaw) : { email };
          appendOrderReceivedAccountAlert(currentUserForAlert, {
            id: newOrder.id,
            orderNumber: newOrder.orderNumber,
            bookingFlowType: cartItems.some((item: any) => item?.type === 'booking-appointment')
              ? 'appointment'
              : cartItems.some((item: any) => item?.type === 'booking-consult')
                ? 'consult'
                : undefined,
          });
        }

        if (wasFirstOrder) {
          const currentUser = localStorage.getItem('currentUser');
          if (currentUser) {
            const user = JSON.parse(currentUser);
            const updatedUser = { ...user, hasMadeFirstPurchase: true };
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            const uIndex = registeredUsers.findIndex((u: any) => u.email === user.email);
            if (uIndex !== -1) {
              registeredUsers[uIndex] = updatedUser;
              localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
            }
          }
        }

        void pushLocalUserOrdersAfterCheckout(userOrdersKey, {
          markFirstPurchaseOnProfile: wasFirstOrder,
        });
      } catch (error) {
        console.error('Error saving order / first purchase:', error);
      }
    },
    [isSignedIn, email, isSubscriptionUpgrade, cartItems, location.pathname, appliedGiftCardBalance]
  );

  const rushProcessing = selectedProcessing === 'rush' ? 120 : 0;
  // Always calculate the protection fee amount (for display), but only add to total if selected
  const protectionFeeAmount = calculateProtectionFee(orderAmount);
  const protectionFee = packageProtection ? protectionFeeAmount : 0;
  // Calculate tip amount: if percentage is set, use that; otherwise use custom dollar amount (only if applied)
  const tipAmount = tipPercentage !== null ? Math.round(orderAmount * (tipPercentage / 100)) : (customTipApplied ? customTipAmount : 0);
  const subtotal = orderAmount + taxesProcessing + shippingHandling + rushProcessing + protectionFee - totalDiscount + tipAmount;

  // Prepare payment data for payment handlers
  const preparePaymentData = (): PaymentData => {
    const currency = currencyRates[selectedCurrency as keyof typeof currencyRates] || currencyRates.USD;
    const convertedOrderAmount = orderAmount * currency.rate;
    const convertedTaxes = taxesProcessing * currency.rate;
    const convertedShipping = shippingHandling * currency.rate;
    const convertedDiscount = totalDiscount * currency.rate; // Use totalDiscount (includes gift card)
    const convertedTip = tipAmount * currency.rate;
    const convertedRush = rushProcessing * currency.rate;
    const convertedProtection = protectionFee * currency.rate;
    
    const totalAmount = convertedOrderAmount + convertedTaxes + convertedShipping - convertedDiscount + convertedTip + convertedRush + convertedProtection;
    
    return {
      amount: totalAmount,
      currency: selectedCurrency,
      items: filterBillableCartLines(cartItems).map((item) => ({
        name: item.name || 'Product',
        quantity: item.quantity || 1,
        price: (item.price || 0) * currency.rate
      })),
      customer: {
        email: email || undefined,
        firstName: firstName || undefined,
        lastName: lastName || undefined
      }
    };
  };

  // Handle payment option click
  const handlePaymentClick = async (provider: PaymentProvider) => {
    if (processingPayment) return; // Prevent multiple clicks

    // Validate shipping method is selected (skip when checkout does not collect shipping)
    if (!checkoutSkipsShipping && !selectedShippingMethod) {
      setValidationMessage('SHIPPING METHOD IS REQUIRED.');
      setShowValidationModal(true);
      return;
    }
    
    setProcessingPayment(true);
    
    try {
      const paymentData = preparePaymentData();
      const result = await handlePaymentOption(provider, paymentData);
      
      if (result.success) {
        let effectiveTier = 'SILVER';
        try {
          const cu = localStorage.getItem('currentUser');
          if (cu) { const u = JSON.parse(cu); effectiveTier = getEffectiveTierName(u) || 'SILVER'; }
        } catch (_) {}

        if (result.redirectUrl) {
          // Prepare order data before redirecting (for return after payment completion)
          const lastOrderNumber = parseInt(localStorage.getItem('lastOrderNumber') || '0', 10);
          const nextOrderNumber = lastOrderNumber + 1;
          localStorage.setItem('lastOrderNumber', nextOrderNumber.toString());
          const orderNumber = `#${String(nextOrderNumber).padStart(3, '0')}`;
          
          // Generate random 6-character alphanumeric confirmation number
          const generateConfirmationNumber = () => {
            const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            let result = '';
            for (let i = 0; i < 6; i++) {
              result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
          };
          const confirmationNumber = generateConfirmationNumber();
          const orderConfirmations = JSON.parse(localStorage.getItem('orderConfirmations') || '{}');
          orderConfirmations[orderNumber] = confirmationNumber;
          localStorage.setItem('orderConfirmations', JSON.stringify(orderConfirmations));
          
          // Calculate points earned (tier + 12mo premium multiplier)
          const basePoints =
            isSignedIn && !isSubscriptionUpgrade && cartHasAnyLoyaltyEarningLine(cartItems)
              ? Math.round(pointsEligibleNetAmount)
              : 0;
          const multiplier = getPointsMultiplierForUser();
          const pointsEarned = Math.round(basePoints * multiplier);
          
          // Store order data for return from payment provider (tier matches rewards page toggle for summary display)
          const orderDataForReturn = {
            orderNumber: orderNumber,
            confirmationNumber: confirmationNumber,
            orderDate: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, '-'),
            orderTotal: paymentData.amount,
            paymentMethod: provider,
            cartItems: cartItems,
            pointsEarned: pointsEarned,
            tier: effectiveTier,
            isSubscriptionUpgrade,
            firstName: firstName,
            lastName: lastName,
            shippingAddress: shippingAddress,
            city: city,
            state: state,
            zip: zip,
            country: selectedCountry || 'US',
            email: email,
            shippingMethod: selectedShippingMethod ? (() => {
              const options = calculateShippingOptions();
              const option = options.find(opt => 
                opt.carrier === selectedShippingMethod.carrier && 
                opt.speed === selectedShippingMethod.speed &&
                opt.cost === selectedShippingMethod.cost
              );
              return option?.label || `${selectedShippingMethod.carrier} ${selectedShippingMethod.speed.toUpperCase()}`;
            })() : 'STANDARD SHIPPING',
            processingTime: persistentProcessingTimeLabel,
            requiresGiftCardIdentityForm: cartRequiresGiftCardIdentityForm(cartItems as unknown[], email),
          };
          
          // Store order data with a key that includes the provider for retrieval after redirect
          localStorage.setItem(`pendingOrder_${provider}`, JSON.stringify(orderDataForReturn));
          
          // Redirect to payment provider's checkout page
          // For placeholder implementations, this will route directly to order summary
          // For real implementations, payment provider will redirect back to the returnUrl in the redirect URL
          window.location.href = result.redirectUrl;
        } else if (result.transactionId) {
          // Payment completed successfully (e.g., Apple Pay)
          // Navigate to confirmation page
          // Get and increment order number
          const lastOrderNumber = parseInt(localStorage.getItem('lastOrderNumber') || '0', 10);
          const nextOrderNumber = lastOrderNumber + 1;
          localStorage.setItem('lastOrderNumber', nextOrderNumber.toString());
          const orderNumber = `#${String(nextOrderNumber).padStart(3, '0')}`;
          
          // Generate random 6-character alphanumeric confirmation number and tie it to order number
          const generateConfirmationNumber = () => {
            const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            let result = '';
            for (let i = 0; i < 6; i++) {
              result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
          };
          const confirmationNumber = generateConfirmationNumber();
          const orderConfirmations = JSON.parse(localStorage.getItem('orderConfirmations') || '{}');
          orderConfirmations[orderNumber] = confirmationNumber;
          localStorage.setItem('orderConfirmations', JSON.stringify(orderConfirmations));
          
          // Calculate points earned (if signed in) - exclude gift cards, digital, membership, consult; tier + 12mo premium multiplier
          const basePoints =
            isSignedIn && !isSubscriptionUpgrade && cartHasAnyLoyaltyEarningLine(cartItems)
              ? Math.round(pointsEligibleNetAmount)
              : 0;
          const multiplier = getPointsMultiplierForUser();
          const pointsEarned = Math.round(basePoints * multiplier);
          
          // Create Route protection if package protection is selected (non-blocking)
          if (packageProtection && !checkoutSkipsShipping) {
            try {
              const routeProtectionData = prepareRouteProtectionData(
                `order-${nextOrderNumber}`,
                orderNumber,
                paymentData.amount,
                selectedCurrency,
                cartItems,
                email,
                firstName,
                lastName,
                phoneNumber,
                shippingAddress,
                city,
                state,
                zip,
                selectedCountry || 'US',
                protectionFee
              );
              
              // Call Route API asynchronously (don't block navigation)
              createRouteProtection(routeProtectionData).then((routeResult) => {
                if (routeResult.success && routeResult.protectionId) {
                  console.log('Route protection created successfully:', routeResult.protectionId);
                } else {
                  console.warn('Route protection creation failed:', routeResult.error);
                }
              }).catch((error) => {
                console.error('Error creating Route protection:', error);
              });
            } catch (error) {
              console.error('Error preparing Route protection data:', error);
            }
          }

          if (appliedConsultQuote && consultDiscountAmount > 0 && !isSubscriptionUpgrade) {
            void redeemConsultQuote(appliedConsultQuote.quoteId).catch((err: unknown) =>
              console.error('Error redeeming consult quote code:', err)
            );
          } else if (!appliedConsultQuote && consultRedeemQuoteIdsFromCart.size > 0 && !isSubscriptionUpgrade) {
            for (const qid of consultRedeemQuoteIdsFromCart) {
              void redeemConsultQuote(qid).catch((err: unknown) =>
                console.error('Error redeeming consult quote code:', err)
              );
            }
          }

          const summaryOrderDate = new Date()
            .toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
            .replace(/\//g, '-');
          if (isSignedIn && email) {
            persistUserOrderAfterCheckoutAfterCartSaved({
              nextOrderNumber,
              orderNumber,
              orderDate: summaryOrderDate,
              orderAmount,
              subtotal,
              pointsEarned,
              appliedGiftCardBalance,
            });
          }
          
          sessionStorage.setItem(
            'checkoutSummaryRewards',
            JSON.stringify({
              pointsEarned:
                isSubscriptionUpgrade || !cartHasAnyLoyaltyEarningLine(cartItems) ? 0 : pointsEarned,
              tier: effectiveTier
            })
          );
          navigate('/checkout/summary', {
            state: {
              orderNumber: orderNumber,
              orderInternalId: `order-${nextOrderNumber}`,
              confirmationNumber: confirmationNumber,
              orderDate: summaryOrderDate,
              orderTotal: paymentData.amount,
              transactionId: result.transactionId,
              paymentMethod: provider,
              cartItems: cartItems,
              processingTime: persistentProcessingTimeLabel,
              pointsEarned:
                isSubscriptionUpgrade || !cartHasAnyLoyaltyEarningLine(cartItems) ? 0 : pointsEarned,
              tier: effectiveTier,
              isSubscriptionUpgrade,
              requiresOrderAuthorizationForm: cartRequiresOrderAuthorizationForm(cartItems as any[]),
              requiresGiftCardIdentityForm: cartRequiresGiftCardIdentityForm(cartItems as unknown[], email),
            }
          });
        }
      } else {
        setShowValidationModal(true);
        setValidationMessage(result.error || 'Payment initialization failed. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setShowValidationModal(true);
      setValidationMessage(error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <>
      <style>{`
        input::placeholder,
        textarea::placeholder {
          font-family: "Futura PT Demi", "Futura PT Medium", "Futura PT Book", "Covered By Your Grace", "Covered By Your Grace Preload" !important;
          font-weight: 500;
          color: #808080 !important;
        }
        input,
        textarea {
          font-family: "Futura PT Demi", "Futura PT Medium", "Futura PT Book", "Covered By Your Grace", "Covered By Your Grace Preload" !important;
          font-weight: 500 !important;
          color: #808080 !important;
          text-transform: uppercase !important;
          background-color: #FFFFFF !important;
        }
        input:focus,
        textarea:focus {
          outline: none !important;
          box-shadow: none !important;
        }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 100px #FFFFFF inset !important;
          -webkit-text-fill-color: #808080 !important;
          box-shadow: 0 0 0 100px #FFFFFF inset !important;
          background-color: #FFFFFF !important;
        }
        label span[style*="#EB1C24"] {
          color: #EB1C24 !important;
        }
        label span {
          color: #EB1C24 !important;
        }
        .delivery-price {
          color: #000000 !important;
        }
        .discount-code-input {
          font-family: "Futura PT Medium", "Futura PT Book", "Covered By Your Grace", "Covered By Your Grace Preload" !important;
          font-weight: 500 !important;
          color: #EB1C24 !important;
        }
        .custom-tip-input {
          font-family: "Futura PT Medium", "Futura PT Book", "Covered By Your Grace", "Covered By Your Grace Preload" !important;
          font-weight: 500 !important;
          color: #EB1C24 !important;
          font-size: 11px !important;
        }
        .custom-tip-input::placeholder {
          font-size: 10px !important;
        }
        .shipping-calculator-input,
        .shipping-calculator-select {
          font-family: "Futura PT Demi", "Futura PT Medium", "Futura PT Book", "Covered By Your Grace", "Covered By Your Grace Preload" !important;
          font-weight: 500 !important;
          color: #808080 !important;
        }
        .shipping-calculator-input::placeholder {
          font-family: "Futura PT Demi", "Futura PT Medium", "Futura PT Book", "Covered By Your Grace", "Covered By Your Grace Preload" !important;
          font-weight: 500 !important;
          color: #808080 !important;
        }
        .shipping-calculator-select {
          appearance: none !important;
          -webkit-appearance: none !important;
          -moz-appearance: none !important;
          background-image: url('/assets/dropdown.svg') !important;
          background-repeat: no-repeat !important;
          background-position: right 8px center !important;
          background-size: 7.2px !important;
          padding-right: 28px !important;
        }
        .shipping-calculator-select option {
          font-family: "Futura PT Demi", "Futura PT Medium", "Futura PT Book", "Covered By Your Grace", "Covered By Your Grace Preload" !important;
          font-weight: 500 !important;
          color: #808080 !important;
        }
        @media (min-width: 1024px) {
          /* Class name must not contain substring "thumbnail" — global index.css uses [class*="thumbnail"] p { … !important } which would force script font on all lines below */
          .checkout-cart-items-center-lg {
            display: flex;
            width: 100%;
            align-items: flex-start;
            justify-content: center;
            box-sizing: border-box;
          }
        }
      `}</style>
      <div className="min-h-screen" style={{ position: 'relative' }}>
        {/* Marble Background */}
        <div 
          className="fixed inset-0 -z-10"
          style={{
            backgroundImage: `url('/assets/marble-half.png')`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'repeat',
            backgroundAttachment: 'fixed'
          }}
        />
        
        {/* Scrollable Content */}
        <div className="relative z-10">
          <div className="flex flex-col py-5 px-4" style={{ minWidth: '100%', maxWidth: 'none', overflow: 'visible' }}>
            {/* NAV BAR CONTAINER */}
          <div
            className="border-solid border-black flex justify-center items-center py-3 w-full mb-5 px-5 bg-white/60 backdrop-blur-sm relative"
            style={{ border: '1.3px solid black' }}
          >
            {/* Left side buttons */}
            <div className="flex gap-5 absolute left-4">
              {showMobileMenu ? (
                <>
                  <button 
                    onClick={() => navigate(isSignedIn ? '/account' : signInHrefWithReturnTo(location))}
                    className="cursor-pointer" 
                    style={{ height: '15px !important', width: '21px !important', padding: '0 !important', border: 'none !important', background: 'none !important', transform: 'translateX(4px)' }}
                  >
                    <img
                      alt="Account icon"
                      width="16"
                      height="16"
                      src="/assets/NOIR/account-icon.svg"
                    />
                  </button>
                  <button 
                    onClick={() => navigate(isSignedIn ? '/wishlist' : signInHrefWithReturnTo(location))} 
                    className="cursor-pointer"
                    style={{ height: '21px !important', width: '21px !important', padding: '0 !important', border: 'none !important', background: 'none !important', transform: 'translateX(2px)' }}
                  >
                    <img
                      alt="Wishlist"
                      width="18"
                      height="18"
                      src="/assets/wishlist-heart.svg"
                    />
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={handleCheckoutBack}
                    className="cursor-pointer"
                    style={{ height: '15px !important', width: '21px !important', padding: '0 !important', border: 'none !important', background: 'none !important' }}
                  >
                    <img
                      alt="Back"
                      width="21"
                      height="15"
                      src="/assets/back-button.svg"
                    />
                  </button>
                  <SearchTrigger className="cursor-pointer" style={{ transform: 'translateX(-2px)' }}>
                <img
                  alt=""
                      width="16"
                      height="15"
                      src="/assets/search-icon.svg"
                    />
                  </SearchTrigger>
                </>
              )}
            </div>

            {/* Text in the middle */}
            <NavCenter showMobileMenu={showMobileMenu}>
              <p className="text-sm" style={{ fontFamily: '"Futura PT Book"', transform: 'translateY(1px)' }}>
              {showMobileMenu ? (
                <>
                  <span 
                    style={{ fontFamily: '"Futura PT Book"', fontWeight: '400', cursor: 'pointer' }}
                    onClick={() => navigate('/lobby')}
                  >
                    HOME &gt;
                  </span>{' '}
                  <span
                    style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}
                  >
                    MENU
                  </span>
                </>
              ) : (
                <>
                  <span 
                    style={{ fontFamily: '"Futura PT Book"', fontWeight: '400', cursor: 'pointer' }}
                    onClick={handleCheckoutBack}
                  >
                    CHECKOUT &gt;
                  </span>{' '}
                  <span
                    style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}
                  >
                    {isSubscriptionUpgrade
                      ? 'UPGRADE'
                      : isBookingsCheckoutRoute
                        ? 'BOOKING'
                        : isGiftCardCheckoutRoute
                          ? 'GIFT CARD'
                          : 'BAG'}
                  </span>
                </>
              )}
            </p>
            </NavCenter>

            {/* Right side icons */}
            <div className="gap-5 flex absolute" style={{ right: '17px' }}>
              <div style={{ transform: `translateX(${(headerCartCount ?? cartCount) === 0 ? 7 : 5}px)` }}>
                <DynamicCartIcon count={headerCartCount ?? cartCount} width={22} height={19} variant="nav" />
              </div>
              <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg
                  width="17"
                  height="18"
                  viewBox="0 0 16 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="cursor-pointer"
                  onClick={handleMobileMenuToggle}
                  style={{ marginTop: '2px' }}
                >
                  <path d="M0 0H15.75V0.7H7.875H0V0ZM5.25 6.7H10.5H15.375V7.4H10.5H5.25V6.7ZM0 13.1H15.75V13.8H0V13.1Z" fill="black"/>
                </svg>
              </div>
            </div>
          </div>

          {/* MAIN CARD - only apply menu-toggle-card when menu is open so main card height is not forced when showing checkout form. Inset box-shadow used for even border on all sides (avoids subpixel unevenness with flex + % width). */}
          <div
            className={showMobileMenu ? 'menu-toggle-card flex flex-col pt-6 pb-4 px-5 mb-2 bg-white/60 backdrop-blur-sm transition-all duration-300 ease-out' : 'flex flex-col pt-6 pb-4 px-5 mb-2 bg-white/60 backdrop-blur-sm transition-all duration-300 ease-out'}
            style={{ 
              boxShadow: 'inset 0 0 0 1px #000000',
              minWidth: '100%', 
              maxWidth: 'none', 
              overflow: 'visible',
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              minHeight: showMobileMenu ? 'calc(100dvh - 80px)' : 'auto',
              height: showMobileMenu ? 'calc(100dvh - 80px)' : 'auto',
              boxSizing: 'border-box'
            }}
          >
            {showMobileMenu ? (
              /* MENU CONTENT */
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', paddingTop: '20px', flex: 1, minHeight: 0, position: 'relative' }}>
                {/* Navigation Links */}
                <div className="flex justify-center gap-8" style={{ marginBottom: '30px' }}>
                  <button
                    onClick={() => handleMobileMenuTabClick('SHOP')}
                    style={{ 
                      fontFamily: mobileMenuActiveTab === 'SHOP' ? '"Futura PT Medium"' : '"Futura PT Book"',
                      fontSize: '14px',
                      color: mobileMenuActiveTab === 'SHOP' ? '#EB1C24' : 'black',
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      borderBottom: mobileMenuActiveTab === 'SHOP' ? '1px solid #EB1C24' : 'none',
                      borderTop: 'none',
                      borderLeft: 'none',
                      borderRight: 'none',
                      paddingBottom: '4px',
                      background: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    SHOP
                  </button>
                  <button
                    onClick={() => handleMobileMenuTabClick('TOOLS')}
                    style={{ 
                      fontFamily: mobileMenuActiveTab === 'TOOLS' ? '"Futura PT Medium"' : '"Futura PT Book"',
                      fontSize: '14px',
                      color: mobileMenuActiveTab === 'TOOLS' ? '#EB1C24' : 'black',
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      borderBottom: mobileMenuActiveTab === 'TOOLS' ? '1px solid #EB1C24' : 'none',
                      borderTop: 'none',
                      borderLeft: 'none',
                      borderRight: 'none',
                      paddingBottom: '4px',
                      background: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    TOOLS
                  </button>
                  <button
                    onClick={() => handleMobileMenuTabClick('BRAND')}
                    style={{ 
                      fontFamily: mobileMenuActiveTab === 'BRAND' ? '"Futura PT Medium"' : '"Futura PT Book"',
                      fontSize: '14px',
                      color: mobileMenuActiveTab === 'BRAND' ? '#EB1C24' : 'black',
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      borderBottom: mobileMenuActiveTab === 'BRAND' ? '1px solid #EB1C24' : 'none',
                      borderTop: 'none',
                      borderLeft: 'none',
                      borderRight: 'none',
                      paddingBottom: '4px',
                      background: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    BRAND
                  </button>
                </div>

                {/* Menu Items */}
                <div style={{ flex: '1', overflowY: 'auto', marginBottom: '20px', minHeight: '0' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
                    {mobileMenuActiveTab === 'TOOLS' ? (
                      <ShopMobileMenuToolsTab
                        navigate={navigate}
                        closeMenu={() => setShowMobileMenu(false)}
                        labelTranslateX="13px"
                      />
                    ) : mobileMenuActiveTab === 'BRAND' ? (
                      <BrandMenuLinks onClose={() => setShowMobileMenu(false)} />
                    ) : (
                                            <ShopMobileMenuShopTab
                                              navigate={navigate}
                                              mobileMenuExpandedItems={mobileMenuExpandedItems}
                                              handleMobileMenuItemToggle={handleMobileMenuItemToggle}
                                              closeSubItemMenu={() => setShowMobileMenu(false)}
                                              labelTranslateX="13px"
                                              duplicateRowClickForStaticLinks
                                            />
                    )}
                  </div>
                </div>

                {/* Sign In/Out */}
                <div className="flex justify-center" style={{ marginBottom: '20px', marginTop: 'auto' }}>
                  <span 
                    onClick={handleMobileMenuSignInToggle}
                    style={{ 
                      fontFamily: '"Futura PT Medium"',
                      fontSize: '14px',
                      color: '#EB1C24',
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      cursor: 'pointer'
                    }}
                  >
                    {isSignedIn ? 'SIGN OUT' : 'SIGN IN'}
                  </span>
                </div>

                {/* Social Media Icons */}
                <div style={{ marginBottom: '20px' }}><SocialMenuIcons /></div>
              </div>
            ) : (
              /* CHECKOUT CONTENT */
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '24px', rowGap: '24px' }}>
                {/* ORDER SUMMARY HEADER */}
                <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '-1px', marginTop: '-12px' }}>
                  <button
                    className="text-red-500 font-bold text-lg tracking-wider truncate hover:text-red-600 transition-colors text-left uppercase"
                    style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '12px', fontWeight: '500' }}
                  >
                    ORDER SUMMARY
                  </button>
                  <span
                    className="text-black font-bold text-lg flex-shrink-0 ml-2 uppercase"
                    style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', fontSize: '15px' }}
                  >
                    {cartBillableQuantityUnits(cartItems)}
                  </span>
                </div>

                {/* SHOPPING BAG CARD */}
                {billableCartItems.length > 0 && (
                  <div
                    className="flex flex-col"
                    style={{ 
                      minWidth: '100%', 
                      maxWidth: 'none', 
                      marginTop: '-10px'
                    }}
                  >
                    {/* Body — flexShrink 0; no overflow-hidden (was clipping tops of tall cart tiles). Horizontal swipe still contained via overflow-x. */}
                    <div className="flex-1 flex flex-col" style={{ flexShrink: 0, minHeight: 0, overflow: 'visible' }}>
                      {/* Space above thumbnails only (not via loyalty margin, which squeezed this row) */}
                      <div style={{ paddingTop: '0px', marginTop: '-12px', flexShrink: 0 }}>
                      {/* Cart Items - horizontal scrollable; height auto so image+labels are never vertically clipped */}
                      <div 
                        ref={scrollContainerRef}
                        className="relative"
                        style={{ 
                          minHeight: '200px',
                          height: 'auto',
                          overflowX: 'hidden',
                          overflowY: 'visible',
                          cursor: isDragging ? 'grabbing' : 'grab',
                          userSelect: 'none'
                        }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                      >
                        <div className="checkout-cart-items-center-lg">
                        <div
                          className="flex"
                          style={{
                            transform: orderStripExpandedEntries.length === 1 ? 'none' : `translateX(${scrollPosition}px)`,
                            transition: 'none',
                            gap: '20px',
                            alignItems: 'flex-start',
                            justifyContent: orderStripExpandedEntries.length === 1 ? 'center' : undefined,
                            willChange: 'transform',
                            paddingRight: orderStripExpandedEntries.length === 1 ? 0 : '10px',
                            paddingTop: isSubscriptionUpgrade ? '0px' : '2px',
                            paddingBottom: '4px',
                            boxSizing: 'border-box',
                          }}
                        >
                          {orderStripExpandedEntries.map((stripEntry) => {
                          const item = stripEntry.item;
                          const itemId = stripEntry.stripKey;
                          const thumbM = orderStripThumbMetrics(item, isSubscriptionUpgrade, {
                            checkoutStrip: true
                          });
                          const itemImage = orderStripThumbnailSrc(item, isSubscriptionUpgrade);
                          const displayTitle = orderStripTitleLine(item);
                          const useDigitalStack = orderStripUseDigitalStackLayout(item, isSubscriptionUpgrade);

                          const itemLength = item.length || '24"';
                          const redSubtitle = orderStripRedSubtitle(item, itemLength);
                          const itemPrice = stripEntry.displayUnitPriceUsd;
                          const isBcfBundleDeal = Boolean((item as { bcfBundleDeal?: boolean }).bcfBundleDeal);
                          const bundleDealListUnit = stripEntry.bundleDealListUnitUsd;
                          const bundleLineTotalCheckout = itemPrice;

                          const titleFontPx = orderStripTitleFontPx(item);

                          return (
                            <div
                              key={itemId}
                              className="flex-shrink-0"
                              style={{
                                width: `${thumbM.cellWidthPx}px`,
                                minHeight: '150px',
                                height: 'auto',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                                paddingTop: (() => {
                                  if (isSubscriptionUpgrade && thumbM.kind === 'membership') return '5px';
                                  if (
                                    item?.type === 'booking-appointment' ||
                                    item?.type === 'booking-consult'
                                  ) {
                                    return '2px';
                                  }
                                  return '8px';
                                })(),
                                paddingRight: '8px',
                                paddingBottom: '8px',
                                paddingLeft: '8px',
                                boxSizing: 'border-box',
                              }}
                            >
                              {thumbM.imgWrapperTransform ? (
                                <div
                                  className="flex items-center justify-center"
                                  style={{
                                    width: `${thumbM.slotPx}px`,
                                    minHeight: `${thumbM.slotPx}px`
                                  }}
                                >
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      transform: thumbM.imgWrapperTransform
                                    }}
                                  >
                                    <img
                                      src={itemImage}
                                      alt={displayTitle}
                                      className="object-contain rounded"
                                      style={{
                                        width: `${thumbM.imgPx}px`,
                                        height: `${thumbM.imgPx}px`,
                                        objectFit: 'contain'
                                      }}
                                      draggable={false}
                                    />
                                  </div>
                                </div>
                              ) : (
                                <img
                                  src={itemImage}
                                  alt={displayTitle}
                                  className="object-contain rounded"
                                  style={{
                                    width: `${thumbM.imgPx}px`,
                                    height: `${thumbM.imgPx}px`,
                                    objectFit: 'contain'
                                  }}
                                  draggable={false}
                                />
                              )}
                              <div
                                style={{
                                  transform: useDigitalStack ? 'translateY(-25px)' : 'none'
                                }}
                              >
                              <p
                                style={{
                                  fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                                  fontSize: titleFontPx,
                                  color: '#000000',
                                    marginTop: '4px',
                                    marginBottom: '0',
                                    textTransform: 'uppercase',
                                    textAlign: 'center',
                                    lineHeight: '1.2',
                                    transform:
                                      useDigitalStack ? 'translateY(-1px)' : 'none'
                                  }}
                                >
                                  {displayTitle}
                              </p>
                              <div
                                style={
                                  isSubscriptionUpgrade && thumbM.kind === 'membership'
                                    ? { transform: 'translateY(1.5px)' }
                                    : undefined
                                }
                              >
                              <p
                                style={{
                                    fontFamily: '"Futura PT Medium"',
                                    fontSize: '8px',
                                  color: '#EB1C24',
                                  marginTop: (() => {
                                    const isGiftCard = item.name === 'GIFT CARD' || item.type === 'gift-card';
                                    const isNoirProduct = String(item?.name || '').trim().toUpperCase() === 'NOIR';
                                    if (isGiftCard) return '-2px';
                                    if (isNoirProduct) return '-2px';
                                    return '0px';
                                  })(),
                                  transform: 'translateY(3px)',
                                  lineHeight: '1.1',
                                  marginBottom: redSubtitle === 'DIGITAL ONLY' ? '2px' : '0',
                                    textTransform: 'uppercase',
                                    textAlign: 'center'
                                }}
                              >
                                {redSubtitle}
                              </p>
                                {!(item.name === 'GIFT CARD' || item.type === 'gift-card') && item.capSize && (
                                  <p
                                      style={{
                                      fontFamily: '"Futura PT Demi"',
                                      fontSize: '9px',
                                      color: '#808080',
                                      margin: '7px 0 0 0',
                                        textTransform: 'uppercase',
                                      lineHeight: '1.1',
                                      textAlign: 'center'
                                    }}
                                  >
                                    CAP SIZE: {item.capSize}
                                  </p>
                                )}
                                {isBcfBundleDeal ? (
                                  <div
                                    style={{
                                      margin: '7px 0 0 0',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      gap: '2px',
                                      lineHeight: '1.15',
                                      textAlign: 'center',
                                      textTransform: 'uppercase'
                                    }}
                                  >
                                    {bundleDealListUnit != null &&
                                      bundleDealListUnit > bundleLineTotalCheckout && (
                                        <span
                                          style={{
                                            fontFamily: '"Futura PT Medium"',
                                            fontSize: '9px',
                                            fontWeight: '500',
                                            color: '#808080',
                                            textDecoration: 'line-through'
                                          }}
                                          dangerouslySetInnerHTML={formatPrice(bundleDealListUnit)}
                                        />
                                      )}
                                    <span
                                      style={{
                                        fontFamily: '"Futura PT Medium"',
                                        fontSize: '10px',
                                        fontWeight: '500',
                                        color: '#000000'
                                      }}
                                      dangerouslySetInnerHTML={formatPrice(bundleLineTotalCheckout)}
                                    />
                                  </div>
                                ) : (
                                <p
                                  style={{
                                    fontFamily: '"Futura PT Medium"',
                                    fontSize: '10px',
                                    fontWeight: '500',
                                    color: '#000000',
                                    margin:
                                      useDigitalStack
                                        ? '4px 0 0 0'
                                        : item.type === 'shop-texture-category'
                                          ? '3px 0 0 0'
                                          : '1px 0 0 0',
                                    textTransform: 'uppercase',
                                    textAlign: 'center'
                                  }}
                                  dangerouslySetInnerHTML={formatPrice(itemPrice)}
                                />
                                )}
                              </div>
                              </div>
                            </div>
                          );
                        })}
                        </div>
                        </div>
                      </div>
                      </div>
                    </div>

                    {/* Loyalty line — only when something in the cart earns points (hide gift/digital/membership/consult-only) */}
                    {!isSubscriptionUpgrade && cartHasAnyLoyaltyEarningLine(cartItems) && (
                    <div className="overflow-hidden mt-auto pt-2">
                      {/* Loyalty Points Text — keep gap below cart strip without stealing height from thumbnails */}
                      <div style={{ 
                        marginTop: '10px', 
                        marginBottom: '0',
                        textAlign: 'center'
                      }}>
                        <p style={{
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000000',
                          textTransform: 'uppercase',
                          margin: '0'
                        }}>
                          {isSignedIn ? (
                            <>
                              {(() => {
                                const basePoints = Math.round(pointsEligibleNetAmount);
                                const multiplier = getPointsMultiplierForUser();
                                const actualPoints = Math.round(basePoints * multiplier);
                                const punctuation = actualPoints === 0 ? '.' : '!';
                                return <>YOU'RE EARNING <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' }}>{actualPoints.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span> LOYALTY POINTS WITH THIS ORDER{punctuation}</>;
                              })()}
                            </>
                          ) : (
                            <>
                              <span 
                                onClick={() => navigate(signInHrefWithReturnTo(location))}
                                style={{ 
                                  color: '#EB1C24', 
                                  cursor: 'pointer'
                                }}
                              >
                                SIGN IN
                              </span>
                              {' TO EARN LOYALTY POINTS FOR THIS ORDER.'}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    )}
                  </div>
                )}

                {/* BLACK LINE SEPARATOR — when loyalty row is hidden, pull line up to match spacing */}
                <div>
                      <div style={{ 
                    paddingTop: '0', 
                    paddingBottom: '1px',
                        borderTop: '1.3px solid #000',
                    marginTop:
                      isSubscriptionUpgrade || !cartHasAnyLoyaltyEarningLine(cartItems) ? '-14px' : '-8px'
                  }}>
                  </div>
                </div>

                {/* DISCOUNT CODE SECTION */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0' }}>
                    <input
                      type="text"
                      className="discount-code-input"
                      placeholder="REFERRAL CODE, DISCOUNT CODE OR GIFT CARD"
                      value={isDiscountCodeFocused ? discountCode : discountCodeDisplay || discountCode}
                      onChange={(e) => {
                        let rawValue = e.target.value;
                        
                        // Check if input is purely numeric (for gift card amounts)
                        const numericValue = rawValue.replace(/[$€£¥₹,.\s]/g, '');
                        const isNumeric = /^\d+$/.test(numericValue) && numericValue.length > 0;
                        
                        if (isNumeric) {
                          // Format as dollar amount
                          const currency = currencyRates[selectedCurrency as keyof typeof currencyRates] || currencyRates.USD;
                          const symbol = currency ? currency.symbol.replace('&#36;', '$').replace('&euro;', '€').replace('&pound;', '£').replace('&yen;', '¥').replace('&#8377;', '₹') : '$';
                          const formatted = symbol + numericValue + '.00';
                          setDiscountCodeDisplay(formatted);
                          setDiscountCode(numericValue);
                        } else {
                          // Text code - no formatting
                          setDiscountCode(rawValue);
                          setDiscountCodeDisplay(rawValue);
                        }
                        
                        setDiscountCodeError('');
                        setAppliedDiscount(0);
                        setAppliedBrandDiscountPromo(null);
                        setAppliedConsultQuote(null);
                        setAppliedReferralCode('');
                        setReferralDiscount(0);
                      }}
                      onFocus={() => {
                        setIsDiscountCodeFocused(true);
                        // Show raw value when focused for easier editing
                        if (discountCode && /^\d+$/.test(discountCode)) {
                          setDiscountCodeDisplay(discountCode);
                        }
                      }}
                      onBlur={() => {
                        setIsDiscountCodeFocused(false);
                        // Format numeric values on blur
                        if (discountCode && /^\d+$/.test(discountCode)) {
                          const currency = currencyRates[selectedCurrency as keyof typeof currencyRates] || currencyRates.USD;
                          const symbol = currency ? currency.symbol.replace('&#36;', '$').replace('&euro;', '€').replace('&pound;', '£').replace('&yen;', '¥').replace('&#8377;', '₹') : '$';
                          setDiscountCodeDisplay(symbol + discountCode + '.00');
                        } else {
                          setDiscountCodeDisplay(discountCode);
                        }
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          void handleApplyDiscountCode();
                        }
                      }}
                          style={{
                        flex: 1,
                        height: '36px',
                        padding: '8px',
                        border: '1.3px solid #000000',
                        fontFamily: '"Futura PT Medium"',
                        fontSize: '10px',
                        color: '#EB1C24',
                        backgroundColor: '#FFFFFF',
                        boxSizing: 'border-box',
                        borderRadius: '0'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => void handleApplyDiscountCode()}
                      style={{
                        width: '36px',
                        height: '36px',
                        border: '1.3px solid #000000',
                        backgroundColor: '#FFFFFF',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        flexShrink: 0
                      }}
                    >
                      <img 
                        src="/assets/discount-check.svg" 
                        alt="apply discount" 
                        style={{ width: '10.4px', height: '10.4px', position: 'absolute', objectFit: 'contain' }}
                      />
                    </button>
                      </div>
                  {discountCodeError && (
                        <p
                          style={{
                        fontFamily: '"Futura PT Medium"',
                        fontSize: '9px',
                        color: '#EB1C24',
                        margin: '4px 0 0 3px',
                        textTransform: 'uppercase'
                      }}
                    >
                      {discountCodeError}
                    </p>
                  )}
                    </div>

                {/* OTHER PAYMENT OPTIONS SECTION */}
                <div>
                  <h2 
                    style={{ 
                      fontFamily: '"Futura PT Medium"',
                            fontSize: '12px',
                      color: '#EB1C24',
                      margin: '0 0 12px 0',
                      textTransform: 'uppercase',
                      fontWeight: '500'
                    }}
                  >
                    EXPRESS PAYMENT OPTIONS:
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                    <button
                      onClick={() => handlePaymentClick('APPLE_PAY')}
                      disabled={processingPayment}
                      style={{
                        width: '100%',
                        height: '36px',
                        padding: '10px 20px',
                        border: '1.3px solid #000000',
                        backgroundColor: '#FFFFFF',
                        fontFamily: '"Futura PT Book"',
                        fontSize: '11px',
                        cursor: processingPayment ? 'not-allowed' : 'pointer',
                        textTransform: 'uppercase',
                        boxSizing: 'border-box',
                        opacity: processingPayment ? 0.6 : 1
                      }}
                    >
                      {processingPayment ? 'PROCESSING...' : 'APPLE PAY'}
                    </button>
                    <button
                      onClick={() => handlePaymentClick('SHOP_PAY')}
                      disabled={processingPayment}
                      style={{
                        width: '100%',
                        height: '36px',
                        padding: '10px 20px',
                        border: '1.3px solid #000000',
                        backgroundColor: '#FFFFFF',
                        fontFamily: '"Futura PT Book"',
                        fontSize: '11px',
                        cursor: processingPayment ? 'not-allowed' : 'pointer',
                        textTransform: 'uppercase',
                        boxSizing: 'border-box',
                        opacity: processingPayment ? 0.6 : 1
                      }}
                    >
                      {processingPayment ? 'PROCESSING...' : 'SHOP PAY'}
                    </button>
                    <button
                      onClick={() => handlePaymentClick('PAYPAL')}
                      disabled={processingPayment}
                      style={{
                        width: '100%',
                        height: '36px',
                        padding: '10px 20px',
                        border: '1.3px solid #000000',
                        backgroundColor: '#FFFFFF',
                        fontFamily: '"Futura PT Book"',
                        fontSize: '11px',
                        cursor: processingPayment ? 'not-allowed' : 'pointer',
                        textTransform: 'uppercase',
                        boxSizing: 'border-box',
                        opacity: processingPayment ? 0.6 : 1
                      }}
                    >
                      {processingPayment ? 'PROCESSING...' : 'PAYPAL'}
                    </button>
                      </div>
                    </div>

                {/* PAYMENT PLANS SECTION */}
                {(!isSubscriptionUpgrade || !autoRenewMembership) && (
                  <div>
                    <h2
                      style={{
                        fontFamily: '"Futura PT Medium"',
                        fontSize: '12px',
                        color: '#EB1C24',
                        margin: '0 0 12px 0',
                        textTransform: 'uppercase',
                        fontWeight: '500'
                      }}
                    >
                      PAYMENT PLAN OPTIONS:
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                      <button
                        onClick={() => handlePaymentClick('AFFIRM')}
                        disabled={processingPayment}
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '10px 20px',
                          border: '1.3px solid #000000',
                          backgroundColor: '#FFFFFF',
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                          cursor: processingPayment ? 'not-allowed' : 'pointer',
                          textTransform: 'uppercase',
                          boxSizing: 'border-box',
                          opacity: processingPayment ? 0.6 : 1
                        }}
                      >
                        {processingPayment ? 'PROCESSING...' : 'AFFIRM'}
                      </button>
                      <button
                        onClick={() => handlePaymentClick('AFTERPAY')}
                        disabled={processingPayment}
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '10px 20px',
                          border: '1.3px solid #000000',
                          backgroundColor: '#FFFFFF',
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                          cursor: processingPayment ? 'not-allowed' : 'pointer',
                          textTransform: 'uppercase',
                          boxSizing: 'border-box',
                          opacity: processingPayment ? 0.6 : 1
                        }}
                      >
                        {processingPayment ? 'PROCESSING...' : 'AFTERPAY'}
                      </button>
                      <button
                        onClick={() => handlePaymentClick('KLARNA')}
                        disabled={processingPayment}
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '10px 20px',
                          border: '1.3px solid #000000',
                          backgroundColor: '#FFFFFF',
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                          cursor: processingPayment ? 'not-allowed' : 'pointer',
                          textTransform: 'uppercase',
                          boxSizing: 'border-box',
                          opacity: processingPayment ? 0.6 : 1
                        }}
                      >
                        {processingPayment ? 'PROCESSING...' : 'KLARNA'}
                      </button>
                    </div>
                  </div>
                )}

                {/* SHIPPING ADDRESS SECTION - hidden for digital-only (membership upgrade / gift card only) */}
                {!checkoutSkipsShipping && (
                <div>
                  <h2 
                    style={{ 
                      fontFamily: '"Futura PT Medium"',
                      fontSize: '12px',
                      color: '#EB1C24',
                      margin: '0 0 12px 0',
                      textTransform: 'uppercase',
                      fontWeight: '500'
                    }}
                  >
                    SHIPPING ADDRESS:
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label 
                        style={{ 
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000000',
                          display: 'block',
                          marginBottom: '4px',
                          textTransform: 'uppercase'
                        }}
                      >
                          FIRST NAME<span style={{ color: '#EB1C24', fontWeight: 'normal' }}>*</span>
                      </label>
                      <input
                        ref={firstNameRef}
                        type="text"
                          value={firstName}
                          onChange={(e) => {
                            setFirstName(e.target.value);
                            if (e.target.value.trim()) {
                              setInvalidFields(prev => {
                                const next = new Set(prev);
                                next.delete('firstName');
                                return next;
                              });
                            }
                          }}
                          disabled={savePaymentMethod}
                        style={{
                          width: '100%',
                            height: '36px',
                          padding: '8px',
                          border: `1.3px solid ${invalidFields.has('firstName') ? '#EB1C24' : '#000000'}`,
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                          backgroundColor: '#FFFFFF',
                          color: '#808080',
                            boxSizing: 'border-box',
                            borderRadius: '0',
                          outline: 'none',
                          cursor: savePaymentMethod ? 'not-allowed' : 'text'
                        }}
                      />
                    </div>
                    <div>
                      <label 
                        style={{ 
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000000',
                          display: 'block',
                          marginBottom: '4px',
                          textTransform: 'uppercase'
                        }}
                      >
                          LAST NAME<span style={{ color: '#EB1C24', fontWeight: 'normal' }}>*</span>
                      </label>
                      <input
                        ref={lastNameRef}
                        type="text"
                          value={lastName}
                          onChange={(e) => {
                            setLastName(e.target.value);
                            if (e.target.value.trim()) {
                              setInvalidFields(prev => {
                                const next = new Set(prev);
                                next.delete('lastName');
                                return next;
                              });
                            }
                          }}
                          disabled={savePaymentMethod}
                        style={{
                          width: '100%',
                            height: '36px',
                          padding: '8px',
                          border: `1.3px solid ${invalidFields.has('lastName') ? '#EB1C24' : '#000000'}`,
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                          backgroundColor: '#FFFFFF',
                          color: '#808080',
                            boxSizing: 'border-box',
                            borderRadius: '0',
                          outline: 'none',
                          cursor: savePaymentMethod ? 'not-allowed' : 'text'
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label 
                        style={{ 
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000000',
                          display: 'block',
                          marginBottom: '4px',
                          textTransform: 'uppercase'
                        }}
                      >
                        SHIPPING ADDRESS<span style={{ color: '#EB1C24' }}>*</span>
                      </label>
                      <input
                        ref={shippingAddressRef}
                        type="text"
                        value={shippingAddress}
                        onChange={(e) => {
                          setShippingAddress(e.target.value);
                          if (e.target.value.trim()) {
                            setInvalidFields(prev => {
                              const next = new Set(prev);
                              next.delete('shippingAddress');
                              return next;
                            });
                          }
                        }}
                        disabled={savePaymentMethod}
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '8px',
                          border: `1.3px solid ${invalidFields.has('shippingAddress') ? '#EB1C24' : '#000000'}`,
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                          backgroundColor: '#FFFFFF',
                          color: '#808080',
                          boxSizing: 'border-box',
                          borderRadius: '0',
                          outline: 'none',
                          cursor: savePaymentMethod ? 'not-allowed' : 'text'
                        }}
                      />
                    </div>
                    <div>
                      <label 
                        style={{ 
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000000',
                          display: 'block',
                          marginBottom: '4px',
                          textTransform: 'uppercase'
                        }}
                      >
                        APT OR SUITE
                      </label>
                      <input
                        type="text"
                        value={aptSuite}
                        onChange={(e) => setAptSuite(e.target.value)}
                        disabled={savePaymentMethod}
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '8px',
                          border: '1.3px solid #000000',
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                          backgroundColor: '#FFFFFF',
                          color: '#808080',
                          boxSizing: 'border-box',
                          borderRadius: '0',
                          cursor: savePaymentMethod ? 'not-allowed' : 'text'
                        }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div>
                      <label 
                        style={{ 
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000000',
                          display: 'block',
                          marginBottom: '4px',
                          textTransform: 'uppercase'
                        }}
                      >
                          CITY<span style={{ color: '#EB1C24' }}>*</span>
                      </label>
                      <input
                        ref={cityRef}
                        type="text"
                          value={city}
                          onChange={(e) => {
                            setCity(e.target.value);
                            if (e.target.value.trim()) {
                              setInvalidFields(prev => {
                                const next = new Set(prev);
                                next.delete('city');
                                return next;
                              });
                            }
                          }}
                          disabled={savePaymentMethod}
                        style={{
                          width: '100%',
                            height: '36px',
                          padding: '8px',
                          border: `1.3px solid ${invalidFields.has('city') ? '#EB1C24' : '#000000'}`,
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                          backgroundColor: '#FFFFFF',
                          color: '#808080',
                            boxSizing: 'border-box',
                            borderRadius: '0',
                          outline: 'none',
                          cursor: savePaymentMethod ? 'not-allowed' : 'text'
                        }}
                      />
                    </div>
                    <div>
                      <label 
                        style={{ 
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000000',
                          display: 'block',
                          marginBottom: '4px',
                          textTransform: 'uppercase'
                        }}
                      >
                          STATE<span style={{ color: '#EB1C24' }}>*</span>
                        </label>
                        <input
                          ref={stateRef}
                          type="text"
                          value={state}
                          onChange={(e) => {
                            setState(e.target.value);
                            if (e.target.value.trim()) {
                              setInvalidFields(prev => {
                                const next = new Set(prev);
                                next.delete('state');
                                return next;
                              });
                            }
                          }}
                          disabled={savePaymentMethod}
                          style={{
                            width: '100%',
                            height: '36px',
                            padding: '8px',
                            border: `1.3px solid ${invalidFields.has('state') ? '#EB1C24' : '#000000'}`,
                            fontFamily: '"Futura PT Book"',
                            fontSize: '11px',
                            backgroundColor: '#FFFFFF',
                            color: '#808080',
                            boxSizing: 'border-box',
                            borderRadius: '0',
                            outline: 'none',
                            cursor: savePaymentMethod ? 'not-allowed' : 'text'
                          }}
                        />
                      </div>
                      <div>
                        <label 
                          style={{ 
                            fontFamily: '"Futura PT Book"',
                            fontSize: '10px',
                            color: '#000000',
                            display: 'block',
                            marginBottom: '4px',
                            textTransform: 'uppercase'
                          }}
                        >
                          ZIP<span style={{ color: '#EB1C24' }}>*</span>
                        </label>
                        <input
                          ref={zipRef}
                          type="text"
                          value={zip}
                          onChange={(e) => {
                            setZip(e.target.value);
                            if (e.target.value.trim()) {
                              setInvalidFields(prev => {
                                const next = new Set(prev);
                                next.delete('zip');
                                return next;
                              });
                            }
                          }}
                          disabled={savePaymentMethod}
                          style={{
                            width: '100%',
                            height: '36px',
                            padding: '8px',
                            border: `1.3px solid ${invalidFields.has('zip') ? '#EB1C24' : '#000000'}`,
                            fontFamily: '"Futura PT Book"',
                            fontSize: '11px',
                            backgroundColor: '#FFFFFF',
                            color: '#808080',
                            boxSizing: 'border-box',
                            borderRadius: '0',
                            outline: 'none',
                            cursor: savePaymentMethod ? 'not-allowed' : 'text'
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label 
                        style={{ 
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000000',
                          display: 'block',
                          marginBottom: '4px',
                          textTransform: 'uppercase'
                        }}
                      >
                        PHONE NUMBER<span style={{ color: '#EB1C24' }}>*</span>
                      </label>
                      <input
                        ref={phoneNumberRef}
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => {
                          setPhoneNumber(e.target.value);
                          if (e.target.value.trim()) {
                            setInvalidFields(prev => {
                              const next = new Set(prev);
                              next.delete('phoneNumber');
                              return next;
                            });
                          }
                        }}
                        disabled={savePaymentMethod}
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '8px',
                          border: `1.3px solid ${invalidFields.has('phoneNumber') ? '#EB1C24' : '#000000'}`,
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                          backgroundColor: '#FFFFFF',
                          color: '#808080',
                          boxSizing: 'border-box',
                          borderRadius: '0',
                          outline: 'none',
                          cursor: savePaymentMethod ? 'not-allowed' : 'text'
                        }}
                      />
                    </div>
                    <div>
                      <label 
                        style={{ 
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000000',
                          display: 'block',
                          marginBottom: '4px',
                          textTransform: 'uppercase'
                        }}
                      >
                        EMAIL<span style={{ color: '#EB1C24' }}>*</span>
                      </label>
                      <input
                        ref={emailRef}
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value.toUpperCase());
                          if (e.target.value.trim()) {
                            setInvalidFields(prev => {
                              const next = new Set(prev);
                              next.delete('email');
                              return next;
                            });
                          }
                        }}
                        disabled={savePaymentMethod}
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '8px',
                          border: `1.3px solid ${invalidFields.has('email') ? '#EB1C24' : '#000000'}`,
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                          backgroundColor: '#FFFFFF',
                          color: '#808080',
                          boxSizing: 'border-box',
                          borderRadius: '0',
                          outline: 'none',
                          cursor: savePaymentMethod ? 'not-allowed' : 'text',
                          textTransform: 'uppercase'
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '1px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          onClick={() => setUseDefaultMethod(!useDefaultMethod)}
                          style={{
                            width: '16px',
                            height: '16px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1.3px solid #000000',
                            backgroundColor: 'transparent',
                            position: 'relative'
                          }}
                        >
                          {useDefaultMethod && (
                            <img 
                              src="/assets/checkbox.svg" 
                              alt="checked" 
                              style={{ width: '16px', height: '16px', position: 'absolute' }}
                            />
                          )}
                        </div>
                        <label 
                          onClick={() => setUseDefaultMethod(!useDefaultMethod)}
                          style={{ 
                            fontFamily: '"Futura PT Book"',
                            fontSize: '10px',
                            color: '#000000',
                            cursor: 'pointer',
                            textTransform: 'uppercase'
                          }}
                        >
                          USE DEFAULT ADDRESS
                        </label>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          onClick={() => setSavePaymentMethod(!savePaymentMethod)}
                          style={{
                            width: '16px',
                            height: '16px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1.3px solid #000000',
                            backgroundColor: 'transparent',
                            position: 'relative'
                          }}
                        >
                          {savePaymentMethod && (
                            <img 
                              src="/assets/checkbox.svg" 
                              alt="checked" 
                              style={{ width: '16px', height: '16px', position: 'absolute' }}
                            />
                          )}
                        </div>
                        <label 
                          onClick={() => setSavePaymentMethod(!savePaymentMethod)}
                          style={{ 
                            fontFamily: '"Futura PT Book"',
                            fontSize: '10px',
                            color: '#000000',
                            cursor: 'pointer',
                            textTransform: 'uppercase'
                          }}
                        >
                          SAVE SHIPPING ADDRESS
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                )}

                {/* BILLING ADDRESS SECTION */}
                <div>
                  <h2 
                    style={{ 
                      fontFamily: '"Futura PT Medium"',
                      fontSize: '12px',
                      color: '#EB1C24',
                      margin: '0 0 12px 0',
                      textTransform: 'uppercase',
                      fontWeight: '500'
                    }}
                  >
                    BILLING ADDRESS:
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label 
                        style={{ 
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000000',
                          display: 'block',
                          marginBottom: '4px',
                          textTransform: 'uppercase'
                        }}
                      >
                            FIRST NAME<span style={{ color: '#EB1C24', fontWeight: 'normal' }}>*</span>
                      </label>
                      <input
                        type="text"
                          value={billingFirstName}
                          onChange={(e) => setBillingFirstName(e.target.value)}
                          disabled={sameAsBilling}
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '8px',
                          border: '1.3px solid #000000',
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                            backgroundColor: '#FFFFFF',
                            color: '#808080',
                          boxSizing: 'border-box',
                            borderRadius: '0',
                            cursor: sameAsBilling ? 'not-allowed' : 'text'
                        }}
                      />
                    </div>
                    <div>
                      <label 
                        style={{ 
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000000',
                          display: 'block',
                          marginBottom: '4px',
                          textTransform: 'uppercase'
                        }}
                      >
                            LAST NAME<span style={{ color: '#EB1C24', fontWeight: 'normal' }}>*</span>
                      </label>
                      <input
                        type="text"
                          value={billingLastName}
                          onChange={(e) => setBillingLastName(e.target.value)}
                          disabled={sameAsBilling}
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '8px',
                          border: '1.3px solid #000000',
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                            backgroundColor: '#FFFFFF',
                            color: '#808080',
                          boxSizing: 'border-box',
                            borderRadius: '0',
                            cursor: sameAsBilling ? 'not-allowed' : 'text'
                        }}
                      />
                    </div>
                    </div>
                      <div>
                        <label 
                          style={{ 
                            fontFamily: '"Futura PT Book"',
                            fontSize: '10px',
                            color: '#000000',
                            display: 'block',
                            marginBottom: '4px',
                            textTransform: 'uppercase'
                          }}
                        >
                        BILLING ADDRESS<span style={{ color: '#EB1C24' }}>*</span>
                        </label>
                        <input
                          ref={billingAddressRef}
                          type="text"
                        value={billingAddress}
                        onChange={(e) => {
                          setBillingAddress(e.target.value);
                          if (e.target.value.trim()) {
                            setInvalidFields(prev => {
                              const next = new Set(prev);
                              next.delete('billingAddress');
                              return next;
                            });
                          }
                        }}
                        disabled={sameAsBilling}
                          style={{
                            width: '100%',
                          height: '36px',
                            padding: '8px',
                            border: `1.3px solid ${invalidFields.has('billingAddress') ? '#EB1C24' : '#000000'}`,
                            fontFamily: '"Futura PT Book"',
                            fontSize: '11px',
                          backgroundColor: '#FFFFFF',
                          color: '#808080',
                          boxSizing: 'border-box',
                          borderRadius: '0',
                          cursor: sameAsBilling ? 'not-allowed' : 'text',
                          outline: 'none'
                          }}
                        />
                      </div>
                      <div>
                        <label 
                          style={{ 
                            fontFamily: '"Futura PT Book"',
                            fontSize: '10px',
                            color: '#000000',
                            display: 'block',
                            marginBottom: '4px',
                            textTransform: 'uppercase'
                          }}
                        >
                        APT OR SUITE
                        </label>
                        <input
                          type="text"
                        value={billingAptSuite}
                        onChange={(e) => setBillingAptSuite(e.target.value)}
                        disabled={sameAsBilling}
                          style={{
                            width: '100%',
                          height: '36px',
                            padding: '8px',
                            border: '1.3px solid #000000',
                            fontFamily: '"Futura PT Book"',
                            fontSize: '11px',
                          backgroundColor: '#FFFFFF',
                          color: '#808080',
                          boxSizing: 'border-box',
                          borderRadius: '0',
                          cursor: sameAsBilling ? 'not-allowed' : 'text'
                          }}
                        />
                      </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                        <div>
                          <label 
                            style={{ 
                              fontFamily: '"Futura PT Book"',
                              fontSize: '10px',
                              color: '#000000',
                              display: 'block',
                              marginBottom: '4px',
                              textTransform: 'uppercase'
                            }}
                          >
                            CITY<span style={{ color: '#EB1C24' }}>*</span>
                          </label>
                          <input
                            ref={billingCityRef}
                            type="text"
                          value={billingCity}
                          onChange={(e) => {
                            setBillingCity(e.target.value);
                            if (e.target.value.trim()) {
                              setInvalidFields(prev => {
                                const next = new Set(prev);
                                next.delete('billingCity');
                                return next;
                              });
                            }
                          }}
                          disabled={sameAsBilling}
                            style={{
                              width: '100%',
                              height: '36px',
                              padding: '8px',
                              border: `1.3px solid ${invalidFields.has('billingCity') ? '#EB1C24' : '#000000'}`,
                              fontFamily: '"Futura PT Book"',
                              fontSize: '11px',
                            backgroundColor: '#FFFFFF',
                            color: '#808080',
                              boxSizing: 'border-box',
                            borderRadius: '0',
                            cursor: sameAsBilling ? 'not-allowed' : 'text',
                            outline: 'none'
                            }}
                          />
                    </div>
                        <div>
                          <label 
                            style={{ 
                              fontFamily: '"Futura PT Book"',
                              fontSize: '10px',
                              color: '#000000',
                              display: 'block',
                              marginBottom: '4px',
                              textTransform: 'uppercase'
                            }}
                          >
                            STATE<span style={{ color: '#EB1C24' }}>*</span>
                          </label>
                          <input
                            ref={billingStateRef}
                            type="text"
                              value={billingState}
                              onChange={(e) => {
                                setBillingState(e.target.value);
                                if (e.target.value.trim()) {
                                  setInvalidFields(prev => {
                                    const next = new Set(prev);
                                    next.delete('billingState');
                                    return next;
                                  });
                                }
                              }}
                              disabled={sameAsBilling}
                            style={{
                              width: '100%',
                              height: '36px',
                              padding: '8px',
                              border: `1.3px solid ${invalidFields.has('billingState') ? '#EB1C24' : '#000000'}`,
                              fontFamily: '"Futura PT Book"',
                              fontSize: '11px',
                                backgroundColor: '#FFFFFF',
                                color: '#808080',
                              boxSizing: 'border-box',
                                borderRadius: '0',
                                cursor: sameAsBilling ? 'not-allowed' : 'text',
                                outline: 'none'
                            }}
                          />
                        </div>
                        <div>
                          <label 
                            style={{ 
                              fontFamily: '"Futura PT Book"',
                              fontSize: '10px',
                              color: '#000000',
                              display: 'block',
                              marginBottom: '4px',
                              textTransform: 'uppercase'
                            }}
                          >
                          ZIP<span style={{ color: '#EB1C24' }}>*</span>
                          </label>
                          <input
                            ref={billingZipRef}
                            type="text"
                            value={billingZip}
                            onChange={(e) => {
                              setBillingZip(e.target.value);
                              if (e.target.value.trim()) {
                                setInvalidFields(prev => {
                                  const next = new Set(prev);
                                  next.delete('billingZip');
                                  return next;
                                });
                              }
                            }}
                            disabled={sameAsBilling}
                            style={{
                              width: '100%',
                                height: '36px',
                              padding: '8px',
                              border: `1.3px solid ${invalidFields.has('billingZip') ? '#EB1C24' : '#000000'}`,
                              fontFamily: '"Futura PT Book"',
                              fontSize: '11px',
                              backgroundColor: '#FFFFFF',
                              color: '#808080',
                                boxSizing: 'border-box',
                              borderRadius: '0',
                              cursor: sameAsBilling ? 'not-allowed' : 'text',
                              outline: 'none'
                          }}
                        />
                    </div>
                  </div>
                  </div>
                  {!checkoutSkipsShipping && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                    <div
                      onClick={() => setSameAsBilling(!sameAsBilling)}
                      style={{
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1.3px solid #000000',
                        backgroundColor: 'transparent',
                        position: 'relative'
                      }}
                    >
                      {sameAsBilling && (
                        <img 
                          src="/assets/checkbox.svg" 
                          alt="checked" 
                          style={{ width: '16px', height: '16px', position: 'absolute' }}
                        />
                      )}
                    </div>
                    <label 
                      onClick={() => setSameAsBilling(!sameAsBilling)}
                      style={{ 
                        fontFamily: '"Futura PT Book"',
                        fontSize: '10px',
                        color: '#000000',
                        cursor: 'pointer',
                        textTransform: 'uppercase'
                      }}
                    >
                      SAME AS SHIPPING ADDRESS
                    </label>
                  </div>
                  )}
                </div>

                {/* PAYMENT SECTION */}
                <div>
                  <h2 
                    style={{ 
                      fontFamily: '"Futura PT Medium"',
                      fontSize: '12px',
                      color: '#EB1C24',
                      margin: '0 0 12px 0',
                      textTransform: 'uppercase',
                      fontWeight: '500'
                    }}
                  >
                    PAYMENT:
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div>
                            <label 
                              style={{ 
                                fontFamily: '"Futura PT Book"',
                                fontSize: '10px',
                                color: '#000000',
                                display: 'block',
                                marginBottom: '4px',
                                textTransform: 'uppercase'
                              }}
                            >
                        CARDHOLDER<span style={{ color: '#EB1C24' }}>*</span>
                            </label>
                            <input
                              ref={cardholderRef}
                              type="text"
                        value={cardholder}
                        onChange={(e) => {
                          setCardholder(e.target.value);
                          if (e.target.value.trim()) {
                            setInvalidFields(prev => {
                              const next = new Set(prev);
                              next.delete('cardholder');
                              return next;
                            });
                          }
                        }}
                              style={{
                                width: '100%',
                                height: '36px',
                                padding: '8px',
                                border: `1.3px solid ${invalidFields.has('cardholder') ? '#EB1C24' : '#000000'}`,
                                fontFamily: '"Futura PT Book"',
                                fontSize: '11px',
                                backgroundColor: '#FFFFFF',
                                boxSizing: 'border-box',
                                borderRadius: '0',
                                outline: 'none'
                              }}
                            />
                          </div>
                          <div>
                            <label 
                              style={{ 
                                fontFamily: '"Futura PT Book"',
                                fontSize: '10px',
                                color: '#000000',
                                display: 'block',
                                marginBottom: '4px',
                                textTransform: 'uppercase'
                              }}
                            >
                        CARD NUMBER<span style={{ color: '#EB1C24' }}>*</span>
                            </label>
                            <input
                              ref={cardNumberRef}
                              type="text"
                        value={cardNumber}
                        onChange={(e) => {
                          const v = e.target.value;
                          setCardNumber(v);
                          const d = v.replace(/\D/g, '');
                          if (
                            defaultPaymentLast4Ref.current &&
                            d !== defaultPaymentLast4Ref.current
                          ) {
                            defaultPaymentLast4Ref.current = null;
                          }
                          if (v.trim()) {
                            setInvalidFields(prev => {
                              const next = new Set(prev);
                              next.delete('cardNumber');
                              return next;
                            });
                          }
                        }}
                              style={{
                                width: '100%',
                                height: '36px',
                                padding: '8px',
                                border: `1.3px solid ${invalidFields.has('cardNumber') ? '#EB1C24' : '#000000'}`,
                                fontFamily: '"Futura PT Book"',
                                fontSize: '11px',
                                backgroundColor: '#FFFFFF',
                                boxSizing: 'border-box',
                                borderRadius: '0',
                                outline: 'none'
                              }}
                            />
                          </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                      <div>
                      <label 
                        style={{ 
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000000',
                            display: 'block',
                            marginBottom: '4px',
                          textTransform: 'uppercase'
                        }}
                      >
                          EXPIRATION DATE<span style={{ color: '#EB1C24' }}>*</span>
                      </label>
                      <input
                          ref={expirationDateRef}
                          type="tel"
                          value={expirationDate}
                          onChange={(e) => {
                            setExpirationDate(formatExpirationDate(e.target.value));
                            if (formatExpirationDate(e.target.value).trim()) {
                              setInvalidFields(prev => {
                                const next = new Set(prev);
                                next.delete('expirationDate');
                                return next;
                              });
                            }
                          }}
                          style={{
                            width: '100%',
                          height: '36px',
                          padding: '8px',
                            border: `1.3px solid ${invalidFields.has('expirationDate') ? '#EB1C24' : '#000000'}`,
                            fontFamily: '"Futura PT Book"',
                            fontSize: '11px',
                          backgroundColor: '#FFFFFF',
                          boxSizing: 'border-box',
                          borderRadius: '0',
                          outline: 'none'
                        }}
                      />
                      </div>
                      <div>
                      <label 
                        style={{ 
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000000',
                            display: 'block',
                            marginBottom: '4px',
                            textTransform: 'uppercase'
                          }}
                        >
                          CVV<span style={{ color: '#EB1C24' }}>*</span>
                        </label>
                        <input
                          ref={cvvRef}
                          type="tel"
                          value={cvv}
                          onChange={(e) => {
                            setCvv(formatCVV(e.target.value));
                            if (formatCVV(e.target.value).trim()) {
                              setInvalidFields(prev => {
                                const next = new Set(prev);
                                next.delete('cvv');
                                return next;
                              });
                            }
                          }}
                          style={{
                            width: '100%',
                            height: '36px',
                            padding: '8px',
                            border: `1.3px solid ${invalidFields.has('cvv') ? '#EB1C24' : '#000000'}`,
                            fontFamily: '"Futura PT Book"',
                            fontSize: '11px',
                            backgroundColor: '#FFFFFF',
                            boxSizing: 'border-box',
                            borderRadius: '0',
                            outline: 'none'
                          }}
                        />
                      </div>
                      <div>
                      <label 
                        style={{ 
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000000',
                            display: 'block',
                            marginBottom: '4px',
                            textTransform: 'uppercase'
                          }}
                        >
                          BILLING ZIP<span style={{ color: '#EB1C24' }}>*</span>
                      </label>
                      <input
                        ref={billingZipRef}
                        type="text"
                          value={billingZip}
                          onChange={(e) => setBillingZip(e.target.value)}
                          disabled={sameAsBilling}
                        style={{
                            width: '100%',
                          height: '36px',
                          padding: '8px',
                          border: '1.3px solid #000000',
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                            backgroundColor: '#FFFFFF',
                            color: '#808080',
                            boxSizing: 'border-box',
                            borderRadius: '0',
                            cursor: sameAsBilling ? 'not-allowed' : 'text'
                          }}
                        />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        onClick={() => setUseDefaultPaymentMethod(!useDefaultPaymentMethod)}
                        style={{
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1.3px solid #000000',
                          backgroundColor: 'transparent',
                          position: 'relative'
                        }}
                      >
                        {useDefaultPaymentMethod && (
                          <img 
                            src="/assets/checkbox.svg" 
                            alt="checked" 
                            style={{ width: '16px', height: '16px', position: 'absolute' }}
                          />
                        )}
                      </div>
                      <label 
                        onClick={() => setUseDefaultPaymentMethod(!useDefaultPaymentMethod)}
                        style={{ 
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000000',
                          cursor: 'pointer',
                          textTransform: 'uppercase'
                        }}
                      >
                        USE DEFAULT PAYMENT
                      </label>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        onClick={() => setSavePaymentMethodCard(!savePaymentMethodCard)}
                        style={{
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1.3px solid #000000',
                          backgroundColor: 'transparent',
                          position: 'relative'
                        }}
                      >
                        {savePaymentMethodCard && (
                          <img 
                            src="/assets/checkbox.svg" 
                            alt="checked" 
                            style={{ width: '16px', height: '16px', position: 'absolute' }}
                          />
                        )}
                      </div>
                      <label 
                        onClick={() => setSavePaymentMethodCard(!savePaymentMethodCard)}
                        style={{ 
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000000',
                          cursor: 'pointer',
                          textTransform: 'uppercase'
                        }}
                      >
                        SAVE PAYMENT METHOD
                      </label>
                    </div>
                    {hasBookingAppointmentItems && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          onClick={() => setBookingAutopayConsent(!bookingAutopayConsent)}
                          style={{
                            width: '16px',
                            height: '16px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1.3px solid #000000',
                            backgroundColor: 'transparent',
                            position: 'relative'
                          }}
                        >
                          {bookingAutopayConsent && (
                            <img
                              src="/assets/checkbox.svg"
                              alt="checked"
                              style={{ width: '16px', height: '16px', position: 'absolute' }}
                            />
                          )}
                        </div>
                        <label
                          onClick={() => setBookingAutopayConsent(!bookingAutopayConsent)}
                          style={{
                            fontFamily: '"Futura PT Book"',
                            fontSize: '10px',
                            color: '#000000',
                            cursor: 'pointer',
                            textTransform: 'uppercase'
                          }}
                        >
                          I AUTHORIZE THE REMAINING BOOKING BALANCE TO AUTO-DRAFT 48 HOURS BEFORE APPOINTMENT.<span style={{ color: '#EB1C24' }}>*</span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* SHIPPING CALCULATOR SECTION - Hidden for subscription upgrades and digital-only carts */}
                {!checkoutSkipsShipping && (
                  <div style={{ marginTop: '24px', marginBottom: '24px' }}>
                  <h2 
                      style={{ 
                      fontFamily: '"Futura PT Medium"',
                      fontSize: '12px',
                      color: '#EB1C24',
                      margin: '0 0 12px 0',
                        textTransform: 'uppercase',
                        fontWeight: '500'
                      }}
                    >
                    SHIPPING CALCULATOR:
                  </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {/* First line: Country, State, Zip */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: selectedCountry === 'US' ? '1.5' : '1.8', minWidth: 0 }}>
                      <select
                        className="shipping-calculator-select"
                        value={selectedCountry}
                        onChange={(e) => {
                          setSelectedCountry(e.target.value);
                          setSelectedState('');
                          setZipCode('');
                          setShippingCalculated(false);
                          setSelectedShippingMethod(null);
                        }}
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '8px',
                          border: '1.3px solid #000000',
                          fontFamily: '"Futura PT Demi"',
                          fontSize: '11px',
                          color: '#808080',
                          backgroundColor: '#FFFFFF',
                          boxSizing: 'border-box',
                          borderRadius: '0'
                        }}
                      >
                        <option value="">COUNTRY</option>
                        <option value="US">UNITED STATES</option>
                        <option value="CA">CANADA</option>
                        <option value="GB">UNITED KINGDOM</option>
                        <option value="AU">AUSTRALIA</option>
                        <option value="OTHER">OTHER</option>
                      </select>
                      </div>
                      {selectedCountry === 'US' && (
                        <div style={{ flex: '0.8', minWidth: 0 }}>
                      <select
                        className="shipping-calculator-select"
                          value={selectedState}
                          onChange={(e) => {
                            setSelectedState(e.target.value);
                            setShippingCalculated(false);
                            setSelectedShippingMethod(null);
                            setZipCodeError(''); // Clear error when state changes (validation happens on submit)
                          }}
                        style={{
                          width: '100%',
                            height: '36px',
                          padding: '8px',
                          border: '1.3px solid #000000',
                          fontFamily: '"Futura PT Demi"',
                          fontSize: '11px',
                          color: '#808080',
                          backgroundColor: '#FFFFFF',
                            boxSizing: 'border-box',
                            borderRadius: '0'
                          }}
                        >
                          <option value="">STATE</option>
                          <option value="AL">AL</option>
                          <option value="AK">AK</option>
                          <option value="AZ">AZ</option>
                          <option value="AR">AR</option>
                          <option value="CA">CA</option>
                          <option value="CO">CO</option>
                          <option value="CT">CT</option>
                          <option value="DE">DE</option>
                          <option value="FL">FL</option>
                          <option value="GA">GA</option>
                          <option value="HI">HI</option>
                          <option value="ID">ID</option>
                          <option value="IL">IL</option>
                          <option value="IN">IN</option>
                          <option value="IA">IA</option>
                          <option value="KS">KS</option>
                          <option value="KY">KY</option>
                          <option value="LA">LA</option>
                          <option value="ME">ME</option>
                          <option value="MD">MD</option>
                          <option value="MA">MA</option>
                          <option value="MI">MI</option>
                          <option value="MN">MN</option>
                          <option value="MS">MS</option>
                          <option value="MO">MO</option>
                          <option value="MT">MT</option>
                          <option value="NE">NE</option>
                          <option value="NV">NV</option>
                          <option value="NH">NH</option>
                          <option value="NJ">NJ</option>
                          <option value="NM">NM</option>
                          <option value="NY">NY</option>
                          <option value="NC">NC</option>
                          <option value="ND">ND</option>
                          <option value="OH">OH</option>
                          <option value="OK">OK</option>
                          <option value="OR">OR</option>
                          <option value="PA">PA</option>
                          <option value="RI">RI</option>
                          <option value="SC">SC</option>
                          <option value="SD">SD</option>
                          <option value="TN">TN</option>
                          <option value="TX">TX</option>
                          <option value="UT">UT</option>
                          <option value="VT">VT</option>
                          <option value="VA">VA</option>
                          <option value="WA">WA</option>
                          <option value="WV">WV</option>
                          <option value="WI">WI</option>
                          <option value="WY">WY</option>
                      </select>
                        </div>
                      )}
                      <div style={{ flex: '0.8', minWidth: 0 }}>
                        <input
                          type={usesAlphanumericPostalCode(selectedCountry) ? "text" : "tel"}
                          className="shipping-calculator-input"
                          placeholder="ZIP"
                          value={zipCode}
                          onChange={(e) => {
                            const formatted = formatZipCode(e.target.value, selectedCountry);
                            setZipCode(formatted);
                            setShippingCalculated(false);
                            setSelectedShippingMethod(null);
                            setZipCodeError(''); // Clear error while typing
                          }}
                          style={{
                            width: '100%',
                            height: '36px',
                            padding: '8px',
                            border: '1.3px solid #000000',
                            fontFamily: '"Futura PT Demi"',
                            fontSize: '11px',
                            color: '#808080',
                          backgroundColor: '#FFFFFF',
                          boxSizing: 'border-box',
                          borderRadius: '0'
                        }}
                      />
                      </div>
                      <button
                        onClick={() => {
                          if (selectedCountry && zipCode) {
                            // Validate zip code when checkmark is clicked
                            if (selectedCountry === 'US' && selectedState) {
                              if (!validateZipCodeForState(zipCode, selectedState, selectedCountry)) {
                                setZipCodeError('SORRY, THIS ZIP CODE DOES NOT MATCH.');
                                setShippingCalculated(false);
                                setSelectedShippingMethod(null);
                                return;
                              } else {
                                setZipCodeError('');
                              }
                            }
                            
                            // Only toggle if no error
                            if (!zipCodeError) {
                              setShippingCalculated(!shippingCalculated);
                            }
                          }
                        }}
                        style={{
                          width: '36px',
                          height: '36px',
                          border: '1.3px solid #000000',
                          backgroundColor: '#FFFFFF',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          flexShrink: 0
                        }}
                      >
                        <img 
                          src="/assets/discount-check.svg" 
                            alt="calculate shipping" 
                            style={{ 
                              width: '10.4px', 
                              height: '10.4px', 
                              position: 'absolute', 
                              objectFit: 'contain'}}
                        />
                      </button>
                    </div>
                    {zipCodeError && (
                      <p
                        style={{
                          fontFamily: '"Futura PT Medium"',
                          fontSize: '9px',
                          color: '#EB1C24',
                          margin: '-3px 0 0 3px',
                          textTransform: 'uppercase'
                        }}
                      >
                        {zipCodeError}
                      </p>
                    )}
                  </div>
                  
                  {/* SHIPPING METHOD SELECTION - Hidden when checkout skips shipping */}
                  {!checkoutSkipsShipping && shippingCalculated && availableShippingOptions.length > 0 && !zipCodeError && (
                    <div style={{ marginTop: '26px', marginBottom: '5px' }}>
                      <h2 
                        style={{ 
                          fontFamily: '"Futura PT Medium"',
                          fontSize: '12px',
                          color: '#EB1C24',
                          margin: '0 0 12px 0',
                          textTransform: 'uppercase',
                          fontWeight: '500'
                        }}
                      >
                        CHOOSE SHIPPING METHOD:
                      </h2>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {availableShippingOptions.map((option, index) => {
                          const isSelected = selectedShippingMethod?.carrier === option.carrier && 
                                           selectedShippingMethod?.speed === option.speed;
                          return (
                            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div
                                onClick={() => setSelectedShippingMethod({
                                  carrier: option.carrier,
                                  speed: option.speed,
                                  cost: option.cost,
                                  originalCost: option.originalCost || option.cost
                                })}
                                style={{
                                  width: '16px',
                                  height: '16px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: '1.3px solid #000000',
                                  backgroundColor: 'transparent',
                                  position: 'relative'
                                }}
                              >
                                {isSelected && (
                                  <img 
                                    src="/assets/checkbox.svg" 
                                    alt="checked" 
                                    style={{ width: '16px', height: '16px', position: 'absolute' }}
                                  />
                                )}
                              </div>
                              <label 
                                style={{ 
                                  fontFamily: '"Futura PT Book"',
                                  fontSize: '10px',
                                  color: '#000000',
                                  cursor: 'pointer',
                                  textTransform: 'uppercase'
                                }}
                              >
                                {option.label}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                )}

                {/* DELIVERY METHOD SECTION */}
                {!checkoutSkipsShipping && (
                <div style={{ marginBottom: '24px' }}>
                  <h2 
                    style={{ 
                      fontFamily: '"Futura PT Medium"',
                      fontSize: '12px',
                      color: '#EB1C24',
                      margin: '0 0 12px 0',
                      textTransform: 'uppercase',
                      fontWeight: '500'
                    }}
                  >
                    DELIVERY METHOD:
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        onClick={() => setSelectedProcessing('standard')}
                        style={{
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1.3px solid #000000',
                          backgroundColor: 'transparent',
                          position: 'relative'
                        }}
                      >
                        {selectedProcessing === 'standard' && (
                          <img 
                            src="/assets/checkbox.svg" 
                            alt="checked" 
                            style={{ width: '16px', height: '16px', position: 'absolute' }}
                          />
                        )}
                      </div>
                      <label 
                        style={{ 
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000000',
                          cursor: 'pointer',
                          textTransform: 'uppercase'
                        }}
                      >
                        {bcfOnlyProcessingWindows ? '4-6 WEEKS STANDARD PROCESSING' : '6-8 WEEKS STANDARD PROCESSING'}
                      </label>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', opacity: checkoutExpressAllowed ? 1 : 0.5 }}>
                      <div
                        onClick={() => {
                          if (checkoutExpressAllowed) {
                            setSelectedProcessing('rush');
                          }
                        }}
                        style={{
                          width: '16px',
                          height: '16px',
                          cursor: checkoutExpressAllowed ? 'pointer' : 'not-allowed',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1.3px solid #000000',
                          backgroundColor: 'transparent',
                          marginTop: '2px',
                          flexShrink: 0,
                          position: 'relative'
                        }}
                      >
                        {selectedProcessing === 'rush' && checkoutExpressAllowed && (
                          <img 
                            src="/assets/checkbox.svg" 
                            alt="checked" 
                            style={{ width: '16px', height: '16px', position: 'absolute' }}
                          />
                        )}
                      </div>
                      <div 
                        style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          cursor: checkoutExpressAllowed ? 'pointer' : 'not-allowed' 
                        }} 
                        onClick={() => {
                          if (checkoutExpressAllowed) {
                            setSelectedProcessing('rush');
                          }
                        }}
                      >
                      <label 
                        style={{ 
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000000',
                            cursor: checkoutExpressAllowed ? 'pointer' : 'not-allowed',
                          textTransform: 'uppercase'
                        }}
                      >
                          {bcfOnlyProcessingWindows ? '3-4 WEEKS EXPRESS PROCESSING' : '4-6 WEEKS RUSH PROCESSING'}{' '}
                          <span className="delivery-price" dangerouslySetInnerHTML={formatPrice(120)}></span>
                        </label>
                        <label 
                          style={{ 
                            fontFamily: '"Futura PT Book"',
                            fontSize: '9px',
                            color: '#EB1C24',
                            cursor: checkoutExpressAllowed ? 'pointer' : 'not-allowed',
                            textTransform: 'uppercase',
                            marginTop: '2px'
                          }}
                        >
                          {bcfOnlyProcessingWindows ? '(EXCLUDING CUSTOM HAIR COLOR)' : '(EXCLUDING COLOR, STYLING & ADD-ONS)'}
                      </label>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        onClick={() => setPackageProtection(!packageProtection)}
                        style={{
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1.3px solid #000000',
                          backgroundColor: 'transparent',
                          position: 'relative'
                        }}
                      >
                        {packageProtection && (
                          <img 
                            src="/assets/checkbox.svg" 
                            alt="checked" 
                            style={{ width: '16px', height: '16px', position: 'absolute' }}
                          />
                        )}
                      </div>
                      <label 
                        style={{ 
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000000',
                          cursor: 'pointer',
                          textTransform: 'uppercase'
                        }}
                      >
                        PACKAGE PROTECTION +<span className="delivery-price" dangerouslySetInnerHTML={formatPrice(protectionFeeAmount)}></span>
                      </label>
                    </div>
                  </div>
                </div>
                )}

                {/* TIPPING SECTION */}
                <div style={{ marginTop: isSubscriptionUpgrade ? '24px' : '4px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'nowrap', width: '100%' }}>
                      {[10, 15, 20, 25, 30].map((percentage) => (
                        <button
                          key={percentage}
                          onClick={() => {
                            if (tipPercentage === percentage) {
                              setTipPercentage(null);
                            } else {
                              setTipPercentage(percentage);
                              setCustomTipAmount(0);
                            }
                        }}
                        style={{
                            flex: '1 1 0',
                            minWidth: 0,
                            padding: '8px 0',
                          border: '1.3px solid #000000',
                            backgroundColor: '#FFFFFF',
                            color: tipPercentage === percentage ? '#EB1C24' : '#000000',
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                            fontWeight: tipPercentage === percentage ? '600' : '400',
                            textAlign: 'center'
                          }}
                        >
                          {percentage}%
                        </button>
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative', marginTop: '3px' }}>
                      <input
                        type="tel"
                        className="custom-tip-input"
                        placeholder="CUSTOM TIP AMOUNT (OPTIONAL)"
                        value={customTipDisplay}
                          onChange={(e) => {
                          let rawValue = e.target.value;
                          
                          // Remove currency symbol (handle all possible symbols)
                          rawValue = rawValue.replace(/[$€£¥₹]/g, '');
                          
                          // Remove commas for processing
                          rawValue = rawValue.replace(/,/g, '');
                          
                          // Remove any decimal point and everything after it
                          if (rawValue.includes('.')) {
                            rawValue = rawValue.split('.')[0];
                          }
                          
                          // Extract only digits
                          const numericValue = rawValue.replace(/[^0-9]/g, '');
                          
                          // Set the numeric value (without commas for calculations)
                          const newAmount = numericValue === '' ? 0 : parseInt(numericValue, 10);
                          setCustomTipAmount(newAmount);
                          
                          // Format display value with commas
                          if (numericValue === '') {
                            setCustomTipDisplay('');
                          } else {
                            const formattedValue = parseInt(numericValue, 10).toLocaleString('en-US');
                            setCustomTipDisplay(formattedValue);
                          }
                          
                          if (numericValue) {
                            setTipPercentage(null);
                            setCustomTipApplied(false);
                          } else {
                            setCustomTipApplied(false);
                          }
                        }}
                        onBlur={() => {
                          // Format the display value when user leaves the field (keep commas)
                          if (customTipAmount > 0) {
                            const formattedAmount = customTipAmount.toLocaleString('en-US');
                            const currency = currencyRates[selectedCurrency as keyof typeof currencyRates] || currencyRates.USD;
                            if (!currency) {
                              setCustomTipDisplay('$' + formattedAmount + '.00');
                            } else {
                              const symbol = currency.symbol.replace('&#36;', '$').replace('&euro;', '€').replace('&pound;', '£').replace('&yen;', '¥').replace('&#8377;', '₹');
                              setCustomTipDisplay(symbol + formattedAmount + '.00');
                            }
                          } else {
                            setCustomTipDisplay('');
                          }
                        }}
                        onFocus={() => {
                          // Show formatted numeric value with commas when focused
                          if (customTipAmount > 0) {
                            setCustomTipDisplay(customTipAmount.toLocaleString('en-US'));
                          }
                          }}
                          style={{
                            flex: 1,
                          height: '36px',
                            padding: '8px',
                            border: '1.3px solid #000000',
                          fontFamily: '"Futura PT Medium"',
                            fontSize: '11px',
                          color: '#EB1C24',
                            backgroundColor: '#FFFFFF',
                          boxSizing: 'border-box',
                            borderRadius: '0'
                          }}
                        />
                      {customTipAmount > 0 && (
                        <button
                          onClick={() => {
                            if (customTipApplied) {
                              // Remove tip: clear amount and reset applied state
                              setCustomTipAmount(0);
                              setCustomTipDisplay('');
                              setCustomTipApplied(false);
                            } else {
                              // Apply tip: set applied state to true and format display
                              setCustomTipApplied(true);
                              setTipPercentage(null);
                              // Format the display value with currency symbol, commas, and .00
                              const formattedAmount = customTipAmount.toLocaleString('en-US');
                              const currency = currencyRates[selectedCurrency as keyof typeof currencyRates] || currencyRates.USD;
                              if (!currency) {
                                setCustomTipDisplay('$' + formattedAmount + '.00');
                              } else {
                                const symbol = currency.symbol.replace('&#36;', '$').replace('&euro;', '€').replace('&pound;', '£').replace('&yen;', '¥').replace('&#8377;', '₹');
                                setCustomTipDisplay(symbol + formattedAmount + '.00');
                              }
                            }
                          }}
                          style={{
                            width: '36px',
                            height: '36px',
                            border: '1.3px solid #000000',
                            backgroundColor: '#FFFFFF',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                            position: 'relative',
                            flexShrink: 0
                          }}
                        >
                          {customTipApplied ? (
                            <img 
                              src="/assets/close-icon.svg" 
                              alt="remove tip" 
                              style={{ width: '16px', height: '16px', position: 'absolute', objectFit: 'contain'}}
                            />
                          ) : (
                            <img 
                              src="/assets/discount-check.svg" 
                              alt="apply tip" 
                              style={{ width: '10.4px', height: '10.4px', position: 'absolute', objectFit: 'contain'}}
                            />
                          )}
                        </button>
                                )}
                              </div>
                            </div>
                </div>

                {/* ORDER SUMMARY (COST BREAKDOWN) */}
                <div style={{ marginBottom: '24px' }}>
                  <h2 
                    style={{ 
                      fontFamily: '"Futura PT Medium"',
                      fontSize: '12px',
                      color: '#EB1C24',
                      margin: '0 0 12px 0',
                      textTransform: 'uppercase',
                      fontWeight: '500'
                    }}
                  >
                    ORDER SUMMARY:
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000000' }}>
                        ORDER AMOUNT:
                      </span>
                      <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000000' }} dangerouslySetInnerHTML={formatPrice(orderAmount)}></span>
                    </div>
                    {!checkoutSkipsShipping && (
                      <>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000000' }}>
                        SALES TAX:
                      </span>
                      <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000000' }} dangerouslySetInnerHTML={formatPrice(taxesProcessing)}></span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000000' }}>
                        SHIPPING + HANDLING:{premiumShippingDiscount.discount > 0 && <span style={{ fontFamily: '"Futura PT Demi"', color: '#808080' }}> PREMIUM</span>}
                      </span>
                      <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000000', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {premiumShippingDiscount.discount > 0 ? (
                          <>
                            {premiumShippingDiscount.finalCost === 0 ? (
                              <>
                                <span style={{ color: '#EB1C24' }}>FREE</span>
                                <span style={{ textDecoration: 'line-through' }} dangerouslySetInnerHTML={formatPrice(premiumShippingDiscount.originalCost)}></span>
                              </>
                            ) : (
                              <>
                                <span style={{ color: '#EB1C24' }}>(-${premiumShippingDiscount.discount})</span>
                                <span dangerouslySetInnerHTML={formatPrice(premiumShippingDiscount.finalCost)}></span>
                              </>
                            )}
                          </>
                        ) : (
                          <span dangerouslySetInnerHTML={formatPrice(shippingHandling)}></span>
                        )}
                      </span>
                    </div>
                      </>
                    )}
                    {rushProcessing > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000000' }}>
                          RUSH PROCESSING:
                        </span>
                        <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000000' }} dangerouslySetInnerHTML={formatPrice(rushProcessing)}></span>
                      </div>
                    )}
                    {protectionFee > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000000' }}>
                          PACKAGE PROTECTION:
                        </span>
                        <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000000' }} dangerouslySetInnerHTML={formatPrice(protectionFee)}></span>
                      </div>
                    )}
                    {tipAmount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000000' }}>
                          {tipPercentage !== null ? `${tipPercentage}% TIP:` : customTipApplied ? 'CUSTOM TIP:' : 'TIP AMOUNT:'}
                        </span>
                        <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000000' }} dangerouslySetInnerHTML={formatPrice(tipAmount)}></span>
                      </div>
                    )}
                    {/* Digital cash (account balance; includes tier welcome discount). Only show when balance > 0. Gift card code replaces this line when applied. */}
                    {giftCardBalance > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000000', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        DISCOUNT: <span
                          role="button"
                          tabIndex={0}
                          onClick={() => {
                            const protectionFeeForOpen = packageProtection ? calculateProtectionFee(orderAmount) : 0;
                            const maxDisc = orderAmount + taxesProcessing + shippingHandling + (selectedProcessing === 'rush' ? 100 : 0) + protectionFeeForOpen;
                            const maxA = Math.min(giftCardBalance, Math.round(maxDisc));
                            setDigitalCashModalAmount(Math.min(appliedGiftCardBalance, maxA));
                            setShowDigitalCashModal(true);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              const protectionFeeForOpen = packageProtection ? calculateProtectionFee(orderAmount) : 0;
                              const maxDisc = orderAmount + taxesProcessing + shippingHandling + (selectedProcessing === 'rush' ? 100 : 0) + protectionFeeForOpen;
                              const maxA = Math.min(giftCardBalance, Math.round(maxDisc));
                              setDigitalCashModalAmount(Math.min(appliedGiftCardBalance, maxA));
                              setShowDigitalCashModal(true);
                            }
                          }}
                          style={{ fontFamily: '"Futura PT Demi"', color: '#808080', cursor: 'pointer' }}
                        >DIGITAL CASH</span>
                        <button
                          type="button"
                          onClick={() => {
                          const protectionFeeForOpen = packageProtection ? calculateProtectionFee(orderAmount) : 0;
                          const maxDisc = orderAmount + taxesProcessing + shippingHandling + (selectedProcessing === 'rush' ? 100 : 0) + protectionFeeForOpen;
                          const maxA = Math.min(giftCardBalance, Math.round(maxDisc));
                          setDigitalCashModalAmount(Math.min(appliedGiftCardBalance, maxA));
                          setShowDigitalCashModal(true);
                        }}
                          style={{ padding: 0, border: 'none', background: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                          aria-label="Edit digital cash amount"
                        >
                          <img src="/assets/edit-icon.svg" alt="" width={9} height={9} style={{ display: 'block', filter: 'brightness(0) saturate(0%)', opacity: 0.6, transform: 'translateY(-1px)' }} />
                        </button>
                      </span>
                      <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>
                        {(() => {
                          const currency = currencyRates[selectedCurrency as keyof typeof currencyRates] || currencyRates.USD;
                          const symbol = currency.symbol.replace(/&#36;/g, '$').replace(/&euro;/g, '€').replace(/&pound;/g, '£').replace(/&yen;/g, '¥').replace(/&#8377;/g, '₹');
                          const amountToShow = hasSpecialOfferInCart ? effectiveGiftCardDiscount : appliedGiftCardBalance;
                          if (amountToShow <= 0) {
                            return `(${symbol}0)`;
                          }
                          const convertedAmount = amountToShow * currency.rate;
                          const wholeAmount = Math.round(convertedAmount);
                          return `(-${symbol}${wholeAmount.toLocaleString('en-US')})`;
                        })()}
                      </span>
                    </div>
                    )}
                    {/* Voucher – only when cart has color/hairline/styling and user has matching vouchers (same logic as digital cash at $0) */}
                    {voucherLineApplicable && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000000', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        VOUCHER: <span
                          role="button"
                          tabIndex={0}
                          onClick={() => {
                            const next = normalizeVoucherQuantitiesForModalOpen(
                              appliedVoucherQuantities,
                              availableVouchersByType,
                              cartVoucherApplicability
                            );
                            setVoucherModalQuantities(next);
                            setShowVoucherModal(true);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              const next = normalizeVoucherQuantitiesForModalOpen(
                                appliedVoucherQuantities,
                                availableVouchersByType,
                                cartVoucherApplicability
                              );
                              setVoucherModalQuantities(next);
                              setShowVoucherModal(true);
                            }
                          }}
                          style={{ fontFamily: '"Futura PT Demi"', color: '#808080', cursor: 'pointer' }}
                        >
                          {Object.entries(appliedVoucherQuantities)
                            .filter(([type, n]) => n > 0 && (cartVoucherApplicability[type] || isFreeGiftVoucherKey(type)))
                            .map(([type, n]) => `${n}X ${type}`)
                            .join(', ') || 'NONE'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const next = normalizeVoucherQuantitiesForModalOpen(
                              appliedVoucherQuantities,
                              availableVouchersByType,
                              cartVoucherApplicability
                            );
                            setVoucherModalQuantities(next);
                            setShowVoucherModal(true);
                          }}
                          style={{ padding: 0, border: 'none', background: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                          aria-label="Edit voucher amount"
                        >
                          <img src="/assets/edit-icon.svg" alt="" width={9} height={9} style={{ display: 'block', filter: 'brightness(0) saturate(0%)', opacity: 0.6, transform: 'translateY(-1px)' }} />
                        </button>
                      </span>
                      {voucherDiscount > 0 && (
                        <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>
                          {(() => {
                            const currency = currencyRates[selectedCurrency as keyof typeof currencyRates] || currencyRates.USD;
                            const symbol = currency.symbol.replace(/&#36;/g, '$').replace(/&euro;/g, '€').replace(/&pound;/g, '£').replace(/&yen;/g, '¥').replace(/&#8377;/g, '₹');
                            const converted = Math.round(voucherDiscount * currency.rate);
                            return `(-${symbol}${converted.toLocaleString('en-US')})`;
                          })()}
                        </span>
                      )}
                    </div>
                    )}
                    {referralDiscount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '11px', color: '#808080' }}>
                        DISCOUNT: REFERRAL CODE {appliedReferralCode}
                      </span>
                      <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000000' }} dangerouslySetInnerHTML={formatPrice(effectiveReferralDiscount)}></span>
                    </div>
                    )}
                    {legacyAndBrandDiscount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000000' }}>
                        DISCOUNT: <span style={{ fontFamily: '"Futura PT Demi"', color: '#808080' }}>{discountCode.toUpperCase()}</span>
                      </span>
                      <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000000' }} dangerouslySetInnerHTML={formatPrice(effectiveDiscount)}></span>
                    </div>
                    )}
                    {consultDiscountAmount > 0 && appliedConsultQuote && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000000' }}>
                        DISCOUNT: <span style={{ fontFamily: '"Futura PT Demi"', color: '#808080' }}>{appliedConsultQuote.code}</span>
                        <span style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#808080' }}> (CONSULT)</span>
                      </span>
                      <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000000' }} dangerouslySetInnerHTML={formatPrice(consultDiscountAmount)}></span>
                    </div>
                    )}
                    <div style={{ borderTop: '1.3px solid #000000', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#000000', fontWeight: '500' }}>
                        SUBTOTAL
                      </span>
                      <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#000000', fontWeight: '500' }} dangerouslySetInnerHTML={formatPrice(subtotal)}></span>
                    </div>
                  </div>
                </div>

                {/* ORDER NOTES */}
                <div style={{ marginBottom: '24px' }}>
                  <h2 
                    style={{ 
                      fontFamily: '"Futura PT Medium"',
                      fontSize: '12px',
                      color: '#EB1C24',
                      margin: '0 0 12px 0',
                      textTransform: 'uppercase',
                      fontWeight: '500'
                    }}
                  >
                    ORDER NOTES:
                  </h2>
                  <textarea
                    rows={6}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1.3px solid #000000',
                      fontFamily: '"Futura PT Book"',
                      fontSize: '11px',
                      backgroundColor: '#FFFFFF',
                      resize: 'vertical',
                      borderRadius: '0'
                    }}
                  />
                </div>

                {/* CHECKBOXES AND SUBMIT BUTTON */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '-4px' }}>
                  {/* AUTO RENEW MEMBERSHIP - Only for subscription upgrades */}
                  {isSubscriptionUpgrade && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        onClick={() => setAutoRenewMembership(!autoRenewMembership)}
                        style={{
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1.3px solid #000000',
                          backgroundColor: 'transparent',
                          position: 'relative'
                        }}
                      >
                        {autoRenewMembership && (
                          <img 
                            src="/assets/checkbox.svg" 
                            alt="checked" 
                            style={{ width: '16px', height: '16px', position: 'absolute' }}
                          />
                        )}
                      </div>
                      <label 
                        onClick={() => setAutoRenewMembership(!autoRenewMembership)}
                        style={{ 
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000000',
                          cursor: 'pointer',
                          textTransform: 'uppercase'
                        }}
                      >
                        AUTO RENEW MEMBERSHIP
                      </label>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      onClick={() => setSubscribeNewsletter(!subscribeNewsletter)}
                      style={{
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1.3px solid #000000',
                        backgroundColor: 'transparent',
                        position: 'relative'
                      }}
                    >
                      {subscribeNewsletter && (
                        <img 
                          src="/assets/checkbox.svg" 
                          alt="checked" 
                          style={{ width: '16px', height: '16px', position: 'absolute' }}
                        />
                      )}
                    </div>
                    <label 
                      style={{ 
                        fontFamily: '"Futura PT Book"',
                        fontSize: '10px',
                        color: '#000000',
                        cursor: 'pointer',
                        textTransform: 'uppercase'
                      }}
                    >
                      SUBSCRIBE TO EMAIL NEWSLETTER
                    </label>
                  </div>
                  {!checkoutSkipsShipping && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      onClick={() => setAddressConfirmed(!addressConfirmed)}
                      style={{
                        width: '16px',
                        height: '16px',
                        minWidth: '16px',
                        minHeight: '16px',
                        flexShrink: 0,
                        boxSizing: 'border-box',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1.3px solid #000000',
                        backgroundColor: 'transparent',
                        position: 'relative'
                      }}
                    >
                      {addressConfirmed && (
                        <img 
                          src="/assets/checkbox.svg" 
                          alt="checked" 
                          style={{ width: '16px', height: '16px', position: 'absolute' }}
                        />
                      )}
                    </div>
                    <label 
                      onClick={() => setAddressConfirmed(!addressConfirmed)}
                      style={{ 
                        fontFamily: '"Futura PT Book"',
                        fontSize: '10px',
                        color: '#000000',
                        cursor: 'pointer',
                        textTransform: 'uppercase'
                      }}
                    >
                      I ACKNOWLEDGE MY <span style={{ color: '#EB1C24' }}>SHIPPING ADDRESS</span> IS CORRECT & CAN NOT BE CHANGED BEYOND THIS POINT.<span style={{ color: '#EB1C24' }}>*</span>
                    </label>
                  </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <div
                      onClick={() => setAgreeToTerms(!agreeToTerms)}
                      style={{
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1.3px solid #000000',
                        backgroundColor: 'transparent',
                        position: 'relative'
                      }}
                    >
                      {agreeToTerms && (
                        <img 
                          src="/assets/checkbox.svg" 
                          alt="checked" 
                          style={{ width: '16px', height: '16px', position: 'absolute' }}
                        />
                      )}
                    </div>
                    <label 
                      style={{ 
                        fontFamily: '"Futura PT Book"',
                        fontSize: '10px',
                        color: '#000000',
                        cursor: 'pointer',
                        textTransform: 'uppercase'
                      }}
                    >
                      I HAVE READ & AGREE TO THE <span 
                        style={{ color: '#EB1C24', cursor: 'pointer' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowTermsModal(true);
                        }}
                      >TERMS + CONDITIONS</span><span style={{ color: '#EB1C24' }}>*</span>
                    </label>
                  </div>
                </div>
              </div>
              </div>
            )}
          </div>
          
          {/* Stripe Billing — only on subscription upgrade checkout (`/checkout/upgrade`) */}
          {!showMobileMenu && isSubscriptionUpgrade && (
            <div className="px-0 md:px-0" style={{ marginTop: '8px', marginBottom: '12px' }}>
              {stripeMembershipAvailable && hasSupabaseSession && (
                <>
                  <button
                    type="button"
                    onClick={() => void handleStripeMembershipSubscribe()}
                    disabled={stripeCheckoutLoading}
                    className="border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50 disabled:opacity-50"
                    style={{
                      borderWidth: '1.3px',
                      color: '#000000',
                      fontFamily: '"Futura PT Medium"',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    {stripeCheckoutLoading ? 'REDIRECTING…' : 'SUBSCRIBE WITH CARD (STRIPE)'}
                  </button>
                </>
              )}
            </div>
          )}

          {/* CONFIRM ORDER BUTTON - Outside main card */}
          {!showMobileMenu && (
            <div className="px-0 md:px-0" style={{ marginTop: '2px', marginBottom: '20px' }}>
                  <button
                    onClick={() => {
                  // Validate required fields (shipping fields only when checkout collects shipping)
                  if (!checkoutSkipsShipping) {
                    if (!firstName.trim()) {
                      setValidationMessage('FIRST NAME IS REQUIRED.');
                      setFieldToFocus('firstName');
                      setInvalidFields(prev => new Set(prev).add('firstName'));
                      setShowValidationModal(true);
                      return;
                    }
                    if (!lastName.trim()) {
                      setValidationMessage('LAST NAME IS REQUIRED.');
                      setFieldToFocus('lastName');
                      setInvalidFields(prev => new Set(prev).add('lastName'));
                      setShowValidationModal(true);
                      return;
                    }
                    if (!shippingAddress.trim()) {
                      setValidationMessage('SHIPPING ADDRESS IS REQUIRED.');
                      setFieldToFocus('shippingAddress');
                      setInvalidFields(prev => new Set(prev).add('shippingAddress'));
                      setShowValidationModal(true);
                      return;
                    }
                    if (!city.trim()) {
                      setValidationMessage('CITY IS REQUIRED.');
                      setFieldToFocus('city');
                      setInvalidFields(prev => new Set(prev).add('city'));
                      setShowValidationModal(true);
                      return;
                    }
                    if (!state.trim()) {
                      setValidationMessage('STATE IS REQUIRED.');
                      setFieldToFocus('state');
                      setInvalidFields(prev => new Set(prev).add('state'));
                      setShowValidationModal(true);
                      return;
                    }
                    if (!zip.trim()) {
                      setValidationMessage('ZIP CODE IS REQUIRED.');
                      setFieldToFocus('zip');
                      setInvalidFields(prev => new Set(prev).add('zip'));
                      setShowValidationModal(true);
                      return;
                    }
                  }
                  if (!phoneNumber.trim()) {
                    setValidationMessage('PHONE NUMBER IS REQUIRED.');
                    setFieldToFocus('phoneNumber');
                    setInvalidFields(prev => new Set(prev).add('phoneNumber'));
                    setShowValidationModal(true);
                    return;
                  }
                  if (!email.trim()) {
                    setValidationMessage('EMAIL IS REQUIRED.');
                    setFieldToFocus('email');
                    setInvalidFields(prev => new Set(prev).add('email'));
                    setShowValidationModal(true);
                    return;
                  }
                  if (!cardholder.trim()) {
                    setValidationMessage('CARDHOLDER NAME IS REQUIRED.');
                    setFieldToFocus('cardholder');
                    setInvalidFields(prev => new Set(prev).add('cardholder'));
                    setShowValidationModal(true);
                    return;
                  }
                  if (!cardNumber.trim()) {
                    setValidationMessage('CARD NUMBER IS REQUIRED.');
                    setFieldToFocus('cardNumber');
                    setInvalidFields(prev => new Set(prev).add('cardNumber'));
                    setShowValidationModal(true);
                    return;
                  }
                  if (!expirationDate.trim()) {
                    setValidationMessage('EXPIRATION DATE IS REQUIRED.');
                    setFieldToFocus('expirationDate');
                    setInvalidFields(prev => new Set(prev).add('expirationDate'));
                    setShowValidationModal(true);
                    return;
                  }
                  if (!cvv.trim()) {
                    setValidationMessage('CVV IS REQUIRED.');
                    setFieldToFocus('cvv');
                    setInvalidFields(prev => new Set(prev).add('cvv'));
                    setShowValidationModal(true);
                    return;
                  }

                  let signedInUserForCard: { email?: string } | null = null;
                  try {
                    const rawUser = isSignedIn ? localStorage.getItem('currentUser') : null;
                    signedInUserForCard = rawUser ? JSON.parse(rawUser) : null;
                  } catch {
                    signedInUserForCard = null;
                  }
                  const cardCheck = validateCheckoutCardInput({
                    signedInUser: signedInUserForCard,
                    checkoutEmail: email,
                    cardNumber,
                    expirationDate,
                    cvv,
                    savedCardLast4:
                      useDefaultPaymentMethod ? defaultPaymentLast4Ref.current : null,
                  });
                  if (!cardCheck.ok) {
                    setValidationMessage(cardCheck.message);
                    setFieldToFocus('cardNumber');
                    setInvalidFields((prev) => new Set(prev).add('cardNumber'));
                    setShowValidationModal(true);
                    return;
                  }
                  const usedFounderDummyPan = cardCheck.usedFounderDummyPan;

                  // Billing required when not same-as-shipping, or when checkout skips shipping
                  const requireBilling = !sameAsBilling || checkoutSkipsShipping;
                  if (requireBilling) {
                    if (!billingFirstName?.trim()) {
                      setValidationMessage('BILLING FIRST NAME IS REQUIRED.');
                      setFieldToFocus('billingFirstName');
                      setInvalidFields(prev => new Set(prev).add('billingFirstName'));
                      setShowValidationModal(true);
                      return;
                    }
                    if (!billingLastName?.trim()) {
                      setValidationMessage('BILLING LAST NAME IS REQUIRED.');
                      setFieldToFocus('billingLastName');
                      setInvalidFields(prev => new Set(prev).add('billingLastName'));
                      setShowValidationModal(true);
                      return;
                    }
                    if (!billingAddress.trim()) {
                      setValidationMessage('BILLING ADDRESS IS REQUIRED.');
                      setFieldToFocus('billingAddress');
                      setInvalidFields(prev => new Set(prev).add('billingAddress'));
                      setShowValidationModal(true);
                      return;
                    }
                    if (!billingCity.trim()) {
                      setValidationMessage('BILLING CITY IS REQUIRED.');
                      setFieldToFocus('billingCity');
                      setInvalidFields(prev => new Set(prev).add('billingCity'));
                      setShowValidationModal(true);
                      return;
                    }
                    if (!billingState.trim()) {
                      setValidationMessage('BILLING STATE IS REQUIRED.');
                      setFieldToFocus('billingState');
                      setInvalidFields(prev => new Set(prev).add('billingState'));
                      setShowValidationModal(true);
                      return;
                    }
                    if (!billingZip.trim()) {
                      setValidationMessage('BILLING ZIP CODE IS REQUIRED.');
                      setFieldToFocus('billingZip');
                      setInvalidFields(prev => new Set(prev).add('billingZip'));
                      setShowValidationModal(true);
                      return;
                    }
                  }
                  
                  // Check if shipping method is selected (skip when checkout skips shipping)
                  if (!checkoutSkipsShipping && !selectedShippingMethod) {
                    setValidationMessage('SHIPPING METHOD IS REQUIRED.');
                    setShowValidationModal(true);
                    return;
                  }
                  
                  // Check if address is confirmed (required before checkout; skip when no shipping address flow)
                  if (!checkoutSkipsShipping && !addressConfirmed) {
                    setValidationMessage('PLEASE CONFIRM THAT YOUR ADDRESS IS ACCURATE.');
                    setShowValidationModal(true);
                    return;
                  }
                  
                  // Check if terms are agreed to (check last, after all other validations)
                  if (!agreeToTerms) {
                    setShowTermsRequiredModal(true);
                    return;
                  }
                  if (hasBookingAppointmentItems && !bookingAutopayConsent) {
                    setValidationMessage('BOOKING AUTO-DRAFT AUTHORIZATION IS REQUIRED.');
                    setShowValidationModal(true);
                    return;
                  }
                  if (hasBookingAppointmentItems && bookingAutopayConsent && !bookingAutopayStripeReady) {
                    setValidationMessage('BOOKING AUTO-DRAFT NEEDS A SAVED STRIPE CARD ON FILE. SIGN IN WITH SUPABASE AND ADD A STRIPE CARD FIRST.');
                    setShowValidationModal(true);
                    return;
                  }
                  
                  // Calculate points earned (if signed in) — net eligible USD; zero when no earning lines (gift/digital/membership/consult-only)
                  const basePoints =
                    isSignedIn && !isSubscriptionUpgrade && cartHasAnyLoyaltyEarningLine(cartItems)
                      ? Math.round(pointsEligibleNetAmount)
                      : 0;
                  const multiplier = getPointsMultiplierForUser();
                  const pointsEarned = Math.round(basePoints * multiplier);
                  
                  // Get and increment order number
                  const lastOrderNumber = parseInt(localStorage.getItem('lastOrderNumber') || '0', 10);
                  const nextOrderNumber = lastOrderNumber + 1;
                  localStorage.setItem('lastOrderNumber', nextOrderNumber.toString());
                  const orderNumber = `#${String(nextOrderNumber).padStart(3, '0')}`;
                  
                  // Generate random 6-character alphanumeric confirmation number and tie it to order number
                  const generateConfirmationNumber = () => {
                    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                    let result = '';
                    for (let i = 0; i < 6; i++) {
                      result += chars.charAt(Math.floor(Math.random() * chars.length));
                    }
                    return result;
                  };
                  const confirmationNumber = generateConfirmationNumber();
                  const orderConfirmations = JSON.parse(localStorage.getItem('orderConfirmations') || '{}');
                  orderConfirmations[orderNumber] = confirmationNumber;
                  localStorage.setItem('orderConfirmations', JSON.stringify(orderConfirmations));
                  
                  // Format order date
                  const orderDate = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, '-');
                  
                  // Get payment method display (single brand: VISA, MASTERCARD, AMERICAN EXPRESS, etc.)
                  const cardBrandDisplay = getCardBrandDisplay(cardNumber);
                  const panDigits = cardNumber.replace(/\D/g, '');
                  const paymentMethodDisplay = usedFounderDummyPan
                    ? 'VISA (FOUNDER TEST) ENDING IN 4242'
                    : panDigits.length >= 4
                      ? `${cardBrandDisplay} ENDING IN ${panDigits.slice(-4)}`
                      : 'CARD ENDING IN XXXX';
                  
                  // Get shipping method display
                  const shippingMethodDisplay = selectedShippingMethod 
                    ? (() => {
                        const options = calculateShippingOptions();
                        const option = options.find(opt => 
                          opt.carrier === selectedShippingMethod.carrier && 
                          opt.speed === selectedShippingMethod.speed &&
                          opt.cost === selectedShippingMethod.cost
                        );
                        return option?.label || `${selectedShippingMethod.carrier} ${selectedShippingMethod.speed.toUpperCase()}`;
                      })()
                    : 'STANDARD SHIPPING';
                  
                  const processingTimeText = persistentProcessingTimeLabel;
                  
                  // Save payment method/address if checkbox is checked
                  if (savePaymentMethod && isSignedIn) {
                    try {
                      const currentUser = localStorage.getItem('currentUser');
                      if (currentUser) {
                        const user = JSON.parse(currentUser);
                        const addressToSave = {
                          firstName: firstName.trim(),
                          lastName: lastName.trim(),
                          address: shippingAddress.trim(),
                          ...(aptSuite.trim() ? { aptSuite: aptSuite.trim() } : {}),
                          city: city.trim(),
                          state: state.trim(),
                          zip: zip.trim(),
                          phoneNumber: phoneNumber.trim(),
                          email: email.trim(),
                          country: selectedCountry || 'US',
                          isDefault: !user.defaultAddress, // Set as default if no default exists
                          savedAt: new Date().toISOString()
                        };
                        
                        // Update user with saved address
                        const updatedUser = {
                          ...user,
                          defaultAddress: !user.defaultAddress ? addressToSave : user.defaultAddress,
                          savedAddresses: user.savedAddresses ? [...user.savedAddresses, addressToSave] : [addressToSave]
                        };
                        
                        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                        
                        // Also update in registered users list
                        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                        const userIndex = registeredUsers.findIndex((u: any) => u.email === user.email);
                        if (userIndex !== -1) {
                          registeredUsers[userIndex] = updatedUser;
                          localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
                        }
                      }
                    } catch (error) {
                      console.error('Error saving address:', error);
                    }
                  }
                  
                  // Save payment method if checkbox is checked
                  if (savePaymentMethodCard && isSignedIn) {
                    try {
                      const currentUser = localStorage.getItem('currentUser');
                      if (currentUser) {
                        const user = JSON.parse(currentUser);
                        const displayBrand = getCardBrandDisplay(cardNumber);
                        const cardBrandForStorage = displayBrand === 'EXPRESS' ? 'AMERICAN EXPRESS' : displayBrand;
                        const paymentMethodToSave = {
                          cardholder: cardholder.trim(),
                          cardNumber: cardNumber.slice(-4), // Only save last 4 digits for security
                          cardBrand: cardBrandForStorage,
                          expirationDate: expirationDate.trim(),
                          billingZip: billingZip.trim(),
                          isDefault: !user.defaultPaymentMethod, // Set as default if no default exists
                          savedAt: new Date().toISOString()
                        };
                        
                        // Update user with saved payment method
                        const updatedUser = {
                          ...user,
                          defaultPaymentMethod: !user.defaultPaymentMethod ? paymentMethodToSave : user.defaultPaymentMethod,
                          savedPaymentMethods: user.savedPaymentMethods ? [...user.savedPaymentMethods, paymentMethodToSave] : [paymentMethodToSave]
                        };
                        
                        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                        
                        // Also update in registered users list
                        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                        const userIndex = registeredUsers.findIndex((u: any) => u.email === user.email);
                        if (userIndex !== -1) {
                          registeredUsers[userIndex] = updatedUser;
                          localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
                        }
                      }
                    } catch (error) {
                      console.error('Error saving payment method:', error);
                    }
                  }
                  
                  // Save subscription tier if this is a subscription upgrade
                  if (isSubscriptionUpgrade && isSignedIn) {
                    try {
                      const subscriptionItem = localStorage.getItem('subscriptionUpgrade');
                      if (subscriptionItem) {
                        const item = JSON.parse(subscriptionItem);
                        const subscriptionTier = item.subscriptionTier; // '3months', '6months', or '12months'
                        
                        if (subscriptionTier) {
                          const currentUser = localStorage.getItem('currentUser');
                          if (currentUser) {
                            const user = JSON.parse(currentUser);
                            
                            // Calculate subscription end date based on tier
                            const subscriptionEndDate = new Date();
                            const monthsToAdd = subscriptionTier === '3months' ? 3 : subscriptionTier === '6months' ? 6 : 12;
                            subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + monthsToAdd);
                            
                            // Check which discounts have been unlocked
                            // If user doesn't have unlockedDiscounts field, initialize it
                            // If they already have a subscriptionTier, mark that as already unlocked (migration for existing users)
                            let unlockedDiscounts = user.unlockedDiscounts || [];
                            if (!user.unlockedDiscounts && user.subscriptionTier) {
                              // Existing user with subscription but no unlockedDiscounts - mark their current tier as unlocked
                              unlockedDiscounts = [user.subscriptionTier];
                            }
                            
                            // Calculate welcome gift card balance based on subscription tier
                            // Only apply welcome discount if this tier hasn't been unlocked before
                            let welcomeGiftCardAmount = 0;
                            if (!unlockedDiscounts.includes(subscriptionTier)) {
                              welcomeGiftCardAmount = subscriptionTier === '3months' ? 10 : subscriptionTier === '6months' ? 20 : 40;
                            }
                            
                            const currentGiftCardBalance = user.giftCardBalance || 0;
                            
                            // Track this tier as unlocked if we're applying the discount
                            const updatedUnlockedDiscounts = welcomeGiftCardAmount > 0 
                              ? [...unlockedDiscounts, subscriptionTier]
                              : unlockedDiscounts;
                            
                            const subNow = new Date();
                            const subDateStr = `${subNow.getMonth() + 1}-${subNow.getDate()}-${subNow.getFullYear()}`;
                            const subEntry = welcomeGiftCardAmount > 0 ? { date: subDateStr, transaction: 'SUBSCRIPTION', amount: welcomeGiftCardAmount } : null;
                            const updatedUser = {
                              ...user,
                              membershipType: 'PREMIUM',
                              subscriptionTier: subscriptionTier,
                              subscriptionPurchasedAt: new Date().toISOString(),
                              subscriptionEndDate: subscriptionEndDate.toISOString(),
                              autoRenewMembership: autoRenewMembership,
                              giftCardBalance: currentGiftCardBalance + welcomeGiftCardAmount,
                              unlockedDiscounts: updatedUnlockedDiscounts,
                              ...(subEntry && { digitalCashHistory: [...(user.digitalCashHistory || []), subEntry] })
                            };
                            
                            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                            
                            // Also update in registered users list
                            const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                            const userIndex = registeredUsers.findIndex((u: any) => u.email === user.email);
                            if (userIndex !== -1) {
                              registeredUsers[userIndex] = updatedUser;
                              localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
                            }

                            // Admin Revenue → Payments: record membership charge (chart USD; renewals in production come from Stripe/webhooks)
                            const payEmail = (user.email || email || '').trim();
                            const rawPrice = typeof item.price === 'number' ? item.price : Number(item.price);
                            const amountUsd =
                              Number.isFinite(rawPrice) && rawPrice > 0
                                ? rawPrice
                                : isSubscriptionTierId(subscriptionTier)
                                  ? getSubscriptionPriceUsd(subscriptionTier)
                                  : 0;
                            if (payEmail && amountUsd > 0) {
                              recordMembershipPayment({
                                userEmail: payEmail,
                                subscriptionTier,
                                amountUsd,
                                autoRenew: autoRenewMembership,
                                kind: 'initial',
                                nextBillingAt: autoRenewMembership ? subscriptionEndDate.toISOString() : undefined,
                              });
                            }
                            
                            // Clear subscription upgrade flags
                            localStorage.removeItem('subscriptionUpgrade');
                            localStorage.removeItem('isSubscriptionUpgrade');
                          }
                        }
                      }
                    } catch (error) {
                      console.error('Error saving subscription tier:', error);
                    }
                  }
                  
                  // Deduct gift card balance from user account after successful order
                  if (isSignedIn && appliedGiftCardBalance > 0) {
                    try {
                      const currentUser = localStorage.getItem('currentUser');
                      if (currentUser) {
                        const user = JSON.parse(currentUser);
                        const currentBalance = user.giftCardBalance || 0;
                        const newBalance = Math.max(0, currentBalance - appliedGiftCardBalance);
                        const now = new Date();
                        const dateStr = `${now.getMonth() + 1}-${now.getDate()}-${now.getFullYear()}`;
                        const checkoutEntry = { date: dateStr, transaction: 'CHECKOUT', amount: -appliedGiftCardBalance };
                        const updatedUser = {
                          ...user,
                          giftCardBalance: newBalance,
                          digitalCashHistory: [...(user.digitalCashHistory || []), checkoutEntry]
                        };
                        
                        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                        
                        // Also update in registered users list
                        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                        const userIndex = registeredUsers.findIndex((u: any) => u.email === user.email);
                        if (userIndex !== -1) {
                          registeredUsers[userIndex] = updatedUser;
                          localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
                        }
                      }
                    } catch (error) {
                      console.error('Error deducting gift card balance:', error);
                    }
                  }
                  
                  // Referral: credit code owner $20 digital cash when order is confirmed (only when buyer is signed in; if order is canceled later, that would need separate handling)
                  if (appliedReferralCode && appliedReferralCode.trim() && isSignedIn && email) {
                    try {
                      const ownerResult = getReferralCodeOwner(appliedReferralCode);
                      const buyerEmailNorm = (email || '').trim().toLowerCase();
                      const referrerEmailNorm = (ownerResult?.user?.email || '').trim().toLowerCase();
                      if (ownerResult && ownerResult.user?.email && buyerEmailNorm !== referrerEmailNorm) {
                        const referrer = ownerResult.user;
                        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                        const refIndex = registeredUsers.findIndex((u: any) => u.email === referrer.email);
                        if (refIndex !== -1) {
                          const currentBalance = referrer.giftCardBalance || 0;
                          const refNow = new Date();
                          const refDateStr = `${refNow.getMonth() + 1}-${refNow.getDate()}-${refNow.getFullYear()}`;
                          const referralEntry = { date: refDateStr, transaction: 'REFERRAL', amount: 20 };
                          const updatedReferrer = {
                            ...referrer,
                            giftCardBalance: currentBalance + 20,
                            digitalCashHistory: [...(referrer.digitalCashHistory || []), referralEntry]
                          };
                          registeredUsers[refIndex] = updatedReferrer;
                          localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
                          if (isSignedIn) {
                            const cur = localStorage.getItem('currentUser');
                            if (cur) {
                              const parsed = JSON.parse(cur);
                              if (parsed.email === referrer.email) {
                                localStorage.setItem('currentUser', JSON.stringify(updatedReferrer));
                              }
                            }
                          }
                          const referrerEmail = (referrer.email || '').trim().toLowerCase();
                          const earningsKey = getPerUserKey(PER_USER_KEYS.referralEarnings, referrerEmail);
                          const referralLog = JSON.parse(localStorage.getItem(earningsKey) || '[]');
                          const newEntry = {
                            referrerEmail: referrer.email,
                            referredEmail: email || '',
                            orderId: `order-${nextOrderNumber}`,
                            orderNumber,
                            amount: 20,
                            status: 'confirmed',
                            date: new Date().toISOString()
                          };
                          referralLog.push(newEntry);
                          localStorage.setItem(earningsKey, JSON.stringify(referralLog));
                          // Also append to global list so admin referrals/clients can show full list
                          try {
                            const allLog = JSON.parse(localStorage.getItem('referralEarnings') || '[]');
                            allLog.push(newEntry);
                            localStorage.setItem('referralEarnings', JSON.stringify(allLog));
                          } catch (_) {}
                          const referrerKey = `referralNewActivity_${(referrer.email || '').trim().toLowerCase()}`;
                          localStorage.setItem(referrerKey, 'true');
                        }
                      }
                    } catch (error) {
                      console.error('Error crediting referrer:', error);
                    }
                  }
                  
                  // Record this identity as having used a referral code (prevents same person reusing on another account)
                  if (appliedReferralCode && appliedReferralCode.trim() && email) {
                    try {
                      const addressStr = [shippingAddress, city, state, zip].filter(Boolean).join(', ').trim();
                      recordReferralCodeUsedByClient({
                        email: (email || '').trim(),
                        firstName: (firstName || '').trim(),
                        lastName: (lastName || '').trim(),
                        phone: (phoneNumber || '').trim(),
                        address: addressStr,
                      });
                    } catch (e) {
                      // non-fatal
                    }
                  }
                  
                  // Persist order to user's order history + server (membership upgrades skip product orders).
                  if (isSignedIn && email) {
                    persistUserOrderAfterCheckoutAfterCartSaved({
                      nextOrderNumber,
                      orderNumber,
                      orderDate,
                      orderAmount,
                      subtotal,
                      pointsEarned,
                      appliedGiftCardBalance,
                    });
                  }

                  // Admin Brand → CODES: record $ off from generated discount codes on confirmed checkout
                  if (appliedBrandDiscountPromo && !isSubscriptionUpgrade) {
                    try {
                      const eligible =
                        !hasSpecialOfferInCart || hasOnlySpecialOfferInCart
                          ? orderAmount
                          : orderAmountExcludingSpecialOffer;
                      const raw = (eligible * appliedBrandDiscountPromo.percent) / 100;
                      const discountUsd = Math.round(Math.min(raw, eligible) * 100) / 100;
                      if (discountUsd > 0) {
                        const list = loadBrandPromoCodes();
                        const promo = list.find((c) => c.id === appliedBrandDiscountPromo.id);
                        if (promo && promo.kind === 'discount') {
                          updateBrandPromoCode(promo.id, { uses: (promo.uses ?? 0) + 1 });
                          recordBrandGeneratedDiscountOrderEvent({
                            orderId: `order-${nextOrderNumber}`,
                            promoId: promo.id,
                            code: promo.code,
                            discountUsd,
                            confirmedAt: new Date().toISOString(),
                          });
                        }
                      }
                    } catch (err) {
                      console.error('Error recording brand discount order:', err);
                    }
                  }

                  if (appliedConsultQuote && consultDiscountAmount > 0 && !isSubscriptionUpgrade) {
                    void redeemConsultQuote(appliedConsultQuote.quoteId).catch((err: unknown) =>
                      console.error('Error redeeming consult quote code:', err)
                    );
                  } else if (!appliedConsultQuote && consultRedeemQuoteIdsFromCart.size > 0 && !isSubscriptionUpgrade) {
                    for (const qid of consultRedeemQuoteIdsFromCart) {
                      void redeemConsultQuote(qid).catch((err: unknown) =>
                        console.error('Error redeeming consult quote code:', err)
                      );
                    }
                  }
                  
                  // Create Route protection if package protection is selected (non-blocking)
                  if (packageProtection && !checkoutSkipsShipping) {
                    try {
                      const orderId = `order-${nextOrderNumber}`;
                      const routeProtectionData = prepareRouteProtectionData(
                        orderId,
                        orderNumber,
                        subtotal,
                        selectedCurrency,
                        cartItems,
                        email,
                        firstName,
                        lastName,
                        phoneNumber,
                        shippingAddress,
                        city,
                        state,
                        zip,
                        selectedCountry || 'US',
                        protectionFee
                      );
                      
                      // Call Route API asynchronously (don't block navigation)
                      createRouteProtection(routeProtectionData).then((routeResult) => {
                        if (routeResult.success && routeResult.protectionId) {
                          console.log('Route protection created successfully:', routeResult.protectionId);
                        } else {
                          console.warn('Route protection creation failed:', routeResult.error);
                        }
                      }).catch((error) => {
                        console.error('Error creating Route protection:', error);
                      });
                    } catch (error) {
                      console.error('Error preparing Route protection data:', error);
                    }
                  }
                  
                  // Effective tier (matches rewards page toggle) so summary shows same tier + points
                  let effectiveTierSummary = 'SILVER';
                  try {
                    const cu = localStorage.getItem('currentUser');
                    if (cu) { const u = JSON.parse(cu); effectiveTierSummary = getEffectiveTierName(u) || 'SILVER'; }
                  } catch (_) {}

                  sessionStorage.setItem(
                    'checkoutSummaryRewards',
                    JSON.stringify({
                      pointsEarned:
                        isSubscriptionUpgrade || !cartHasAnyLoyaltyEarningLine(cartItems) ? 0 : pointsEarned,
                      tier: effectiveTierSummary
                    })
                  );

                  if (usedFounderDummyPan) {
                    trackActivity('founder_test_checkout_order', { orderNumber: nextOrderNumber });
                  }

                  void (async () => {
                    try {
                      await syncBookingAppointmentsToAdminMeetings(orderNumber, subtotal, paymentMethodDisplay, {
                        consent: hasBookingAppointmentItems && bookingAutopayConsent && bookingAutopayStripeReady,
                        stripeCustomerId: bookingStripeProfile.stripeCustomerId,
                        stripePaymentMethodId: bookingStripeProfile.stripePaymentMethodId,
                      });
                      await syncBookingConsultsToAdminMeetings(orderNumber);
                    } catch (e) {
                      console.error('Failed to sync booking appointments to admin meetings:', e);
                    }
                    navigate('/checkout/summary', {
                      state: {
                        orderNumber,
                        orderInternalId: `order-${nextOrderNumber}`,
                        orderDate,
                        orderTotal: subtotal,
                        shippingMethod: shippingMethodDisplay,
                        processingTime: processingTimeText,
                        firstName,
                        lastName,
                        shippingAddress,
                        city,
                        state,
                        zip,
                        country: selectedCountry || 'US',
                        paymentMethod: paymentMethodDisplay,
                        email,
                        pointsEarned:
                          isSubscriptionUpgrade || !cartHasAnyLoyaltyEarningLine(cartItems) ? 0 : pointsEarned,
                        tier: effectiveTierSummary,
                        cartItems: cartItems,
                        isSubscriptionUpgrade,
                        requiresOrderAuthorizationForm: cartRequiresOrderAuthorizationForm(cartItems as any[]),
                        requiresGiftCardIdentityForm: cartRequiresGiftCardIdentityForm(cartItems as unknown[], email),
                      }
                    });
                  })();
                    }}
                className="border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
                    style={{
                  borderWidth: '1.3px', 
                  color: '#EB1C24',
                      fontFamily: '"Futura PT Medium"',
                  backgroundColor: '#FFFFFF',
                  textTransform: 'uppercase'
                }}
                type="button"
              >
                CONFIRM ORDER
                  </button>
              </div>
            )}
          </div>
        </div>
      </div>
    
      {/* Digital Cash amount modal */}
      {showDigitalCashModal && (() => {
        const protectionFeeForDiscount = packageProtection ? calculateProtectionFee(orderAmount) : 0;
        const maxDiscountable = orderAmount + taxesProcessing + shippingHandling + (selectedProcessing === 'rush' ? 100 : 0) + protectionFeeForDiscount;
        const maxApplicable = Math.min(giftCardBalance, Math.round(maxDiscountable));
        return (
        <div
          className="fixed z-50 backdrop-blur-md"
          style={{
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 999999999,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(3px)',
            WebkitBackdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDigitalCashModal(false);
          }}
        >
          <div
            className="p-6 bg-white border border-black baw-brand-modal-shell"
            style={{ width: 'calc(100vw - 32px)', maxWidth: 'none', borderWidth: '1.3px', boxSizing: 'border-box' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="-mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p
                style={{
                  fontFamily: '"Futura PT Medium"',
                  color: '#EB1C24',
                  fontSize: '12px',
                  margin: '0',
                  textTransform: 'uppercase',
                  fontWeight: '500',
                  textAlign: 'left'
                }}
              >
                DIGITAL CASH
              </p>
              <img
                src="/assets/points-history.svg"
                alt=""
                style={{
                  width: '16px',
                  height: '16px',
                  flexShrink: 0,
                  objectFit: 'contain'}}
              />
            </div>
            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', marginBottom: '16px', textTransform: 'uppercase' }}>
              Select the amount of digital cash to apply to your order.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', textTransform: 'uppercase' }}>Remaining balance</span>
                <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#EB1C24', fontWeight: 500 }}>${Math.max(0, giftCardBalance - digitalCashModalAmount)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={maxApplicable}
                step={1}
                value={digitalCashModalAmount}
                onChange={(e) => setDigitalCashModalAmount(Math.max(0, Math.min(maxApplicable, parseInt(e.target.value, 10) || 0)))}
                style={{
                  width: '100%',
                  height: '6px',
                  accentColor: '#EB1C24',
                  cursor: 'pointer'
                }}
              />
            </div>
            {/* Buttons inside container - APPLY left, CANCEL right */}
            <div className="flex space-x-3" style={{ marginTop: '24px' }}>
              <button
                type="button"
                onClick={() => {
                  const amount = Math.max(0, Math.min(maxApplicable, digitalCashModalAmount));
                  setAppliedGiftCardBalance(amount);
                  userSelectedDigitalCashRef.current = amount;
                  setShowDigitalCashModal(false);
                }}
                className="flex-1 py-2 px-4 border border-black font-medium hover:bg-gray-50 transition-colors"
                style={{
                  borderWidth: '1.3px',
                  fontSize: '11px',
                  fontFamily: '"Futura PT Medium"',
                  backgroundColor: '#FFFFFF',
                  color: '#EB1C24',
                  textTransform: 'uppercase'
                }}
              >
                APPLY
              </button>
              <button
                type="button"
                onClick={() => setShowDigitalCashModal(false)}
                className="flex-1 py-2 px-4 border border-black bg-white font-medium hover:bg-gray-50 transition-colors"
                style={{
                  borderWidth: '1.3px',
                  fontSize: '11px',
                  fontFamily: '"Futura PT Medium"',
                  color: '#000000',
                  textTransform: 'uppercase'
                }}
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
        );
      })()}

      {/* Voucher amount modal – choose how many of each voucher type to apply (like digital cash) */}
      {showVoucherModal && (
        <div
          className="fixed z-50 backdrop-blur-md"
          style={{
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 999999999,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(3px)',
            WebkitBackdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowVoucherModal(false); }}
        >
          <div
            className="p-6 bg-white border border-black baw-brand-modal-shell"
            style={{ width: 'calc(100vw - 32px)', maxWidth: 'none', borderWidth: '1.3px', boxSizing: 'border-box' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="-mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p
                style={{
                  fontFamily: '"Futura PT Medium"',
                  color: '#EB1C24',
                  fontSize: '12px',
                  margin: '0',
                  textTransform: 'uppercase',
                  fontWeight: '500',
                  textAlign: 'left'
                }}
              >
                VOUCHER
              </p>
              <img
                src="/assets/points-history.svg"
                alt=""
                style={{
                  width: '16px',
                  height: '16px',
                  flexShrink: 0,
                  objectFit: 'contain'}}
              />
            </div>
            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', marginBottom: '8px', textTransform: 'uppercase' }}>
              You can only use one service voucher at a time (color, hairline, styling). Those vouchers cannot be combined with each other.
            </p>
            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#808080', marginBottom: '16px', textTransform: 'uppercase' }}>
              Free gifts from rewards are separate and can be combined with this voucher and other checkout offers. Choose one service voucher to apply to this order.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {!Object.entries(availableVouchersByType).some(
                ([t, n]) => (n || 0) > 0 && Object.prototype.hasOwnProperty.call(VOUCHER_TYPE_CONFIG, t)
              ) && (
                <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#808080', margin: '0 0 4px 0', textTransform: 'uppercase' }}>
                  No service vouchers apply to this cart. Free gifts on your account still apply when you tap apply.
                </p>
              )}
              {Object.entries(availableVouchersByType)
                .filter(([type]) => Object.prototype.hasOwnProperty.call(VOUCHER_TYPE_CONFIG, type))
                .map(([type, available]) => {
                const inCart = cartVoucherApplicability[type] === true;
                const current = inCart ? (voucherModalQuantities[type] ?? 0) : 0;
                const totalServiceVouchersSelected = Object.keys(VOUCHER_TYPE_CONFIG).reduce(
                  (s, k) => s + (voucherModalQuantities[k] || 0),
                  0
                );
                const canAddThis = inCart && available >= 1 && current < 1 && totalServiceVouchersSelected === 0;
                return (
                <div key={type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', textTransform: 'uppercase' }}>
                    {available === 0 ? (
                      <><span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"' }}>0</span> OF <span style={{ color: '#808080', fontFamily: '"Futura PT Demi"' }}>{type}</span></>
                    ) : (
                      <><span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"' }}>{available}X</span> OF <span style={{ color: '#808080', fontFamily: '"Futura PT Demi"' }}>{type}</span></>
                    )}
                  </span>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => inCart && setVoucherModalQuantities(prev => ({ ...prev, [type]: 0 }))}
                      disabled={!inCart || current <= 0}
                      className={(!inCart || current <= 0) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      style={{
                        borderTop: '1.3px solid black',
                        borderLeft: '1.3px solid black',
                        borderBottom: '1.3px solid black',
                        borderRight: 'none',
                        height: '20.25px',
                        minHeight: '20.25px',
                        maxHeight: '20.25px',
                        width: '28px',
                        boxSizing: 'border-box',
                        outline: 'none',
                        background: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <span style={{ fontFamily: 'Cascadia Code, monospace', fontSize: '8.25px', color: '#EB1C24' }}>-</span>
                    </button>
                    <div
                      style={{
                        borderTop: '1.3px solid black',
                        borderBottom: '1.3px solid black',
                        borderLeft: '1px solid black',
                        borderRight: '1px solid black',
                        fontFamily: '"Futura PT Medium"',
                        fontWeight: 500,
                        fontSize: '9px',
                        height: '20.25px',
                        minHeight: '20.25px',
                        maxHeight: '20.25px',
                        minWidth: '28px',
                        boxSizing: 'border-box',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#fff',
                        color: '#000'
                      }}
                    >
                      {current}
                    </div>
                    <button
                      type="button"
                      onClick={() => inCart && setVoucherModalQuantities((prev) => {
                        const next = { ...prev };
                        Object.keys(availableVouchersByType).forEach((t) => {
                          if (isFreeGiftVoucherKey(t)) return;
                          next[t] = t === type ? 1 : 0;
                        });
                        return next;
                      })}
                      disabled={!canAddThis}
                      className={!canAddThis ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      style={{
                        borderTop: '1.3px solid black',
                        borderRight: '1.3px solid black',
                        borderBottom: '1.3px solid black',
                        borderLeft: 'none',
                        height: '20.25px',
                        minHeight: '20.25px',
                        maxHeight: '20.25px',
                        width: '28px',
                        boxSizing: 'border-box',
                        outline: 'none',
                        background: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <span style={{ fontFamily: 'Cascadia Code, monospace', fontSize: '8.25px', color: '#EB1C24' }}>+</span>
                    </button>
                  </div>
                </div>
                );
              })}
            </div>
            <div className="flex space-x-3" style={{ marginTop: '24px' }}>
              <button
                type="button"
                onClick={() => {
                  const next = buildAppliedVoucherQuantitiesFromModal(
                    voucherModalQuantities,
                    appliedVoucherQuantities,
                    availableVouchersByType,
                    cartVoucherApplicability
                  );
                  setAppliedVoucherQuantities(next);
                  setShowVoucherModal(false);
                }}
                className="flex-1 py-2 px-4 border border-black font-medium hover:bg-gray-50 transition-colors"
                style={{
                  borderWidth: '1.3px',
                  fontSize: '11px',
                  fontFamily: '"Futura PT Medium"',
                  backgroundColor: '#FFFFFF',
                  color: '#EB1C24',
                  textTransform: 'uppercase'
                }}
              >
                APPLY
              </button>
              <button
                type="button"
                onClick={() => setShowVoucherModal(false)}
                className="flex-1 py-2 px-4 border border-black bg-white font-medium hover:bg-gray-50 transition-colors"
                style={{
                  borderWidth: '1.3px',
                  fontSize: '11px',
                  fontFamily: '"Futura PT Medium"',
                  color: '#000000',
                  textTransform: 'uppercase'
                }}
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div 
        className="fixed z-50 backdrop-blur-md"
        style={{
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          zIndex: 999999999,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowTermsModal(false);
          }
        }}
      >
        <div
          className="p-6 baw-brand-modal-shell"
          style={{
            maxWidth: '400px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            overflowX: 'hidden',
            border: '1.3px solid black',
            borderRadius: '0',
            transform: 'translateY(-6px)',
            backgroundImage: 'url(/assets/marble-tc.png)',
            backgroundSize: '100% auto',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            boxSizing: 'border-box'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h3
            style={{
              fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '16px',
              textAlign: 'center',
              color: '#EB1C24',
              textTransform: 'uppercase'
            }}
          >
            TERMS OF SERVICE
          </h3>
          <div style={{ marginBottom: '20px', width: '100%' }}>
            <BrandTermsBody />
          </div>

          {/* Buttons — primary left, dismiss right */}
          <div className="flex space-x-3">
            <button
              onClick={() => {
                setAgreeToTerms(true);
                setShowTermsModal(false);
              }}
              className="flex-1 py-2 px-4 border border-black font-medium hover:bg-gray-50 transition-colors"
              style={{
                borderWidth: '1.3px',
                fontSize: '11px',
                fontFamily: '"Futura PT Medium"',
                backgroundColor: '#FFFFFF',
                color: '#EB1C24',
                textTransform: 'uppercase'
              }}
            >
              ACCEPT
            </button>
            <button
              onClick={() => setShowTermsModal(false)}
              className="flex-1 py-2 px-4 border border-black bg-white font-medium hover:bg-gray-50 transition-colors"
              style={{
                borderWidth: '1.3px',
                fontSize: '11px',
                fontFamily: '"Futura PT Medium"',
                color: '#000000',
                textTransform: 'uppercase'
              }}
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>
        )}

      {/* Terms Required Modal */}
      <ConfirmationModal
      isOpen={showTermsRequiredModal}
      onClose={() => setShowTermsRequiredModal(false)}
      onConfirm={() => setShowTermsRequiredModal(false)}
      title="AGREE TO TERMS + CONDITIONS"
      message=" YOU MUST AGREE TO THE TERMS TO FINALIZE THIS PURCHASE."
      confirmText="OK"
      cancelText="CLOSE"
    />

      {/* Validation Modal */}
      <ConfirmationModal
      isOpen={showValidationModal}
      onClose={() => {
        setShowValidationModal(false);
        // Focus the field after modal closes
        setTimeout(() => {
          if (fieldToFocus) {
            const refMap: { [key: string]: React.RefObject<HTMLInputElement> } = {
              firstName: firstNameRef,
              lastName: lastNameRef,
              shippingAddress: shippingAddressRef,
              city: cityRef,
              state: stateRef,
              zip: zipRef,
              phoneNumber: phoneNumberRef,
              email: emailRef,
              cardholder: cardholderRef,
              cardNumber: cardNumberRef,
              expirationDate: expirationDateRef,
              cvv: cvvRef,
              billingAddress: billingAddressRef,
              billingCity: billingCityRef,
              billingState: billingStateRef,
              billingZip: billingZipRef
            };
            const ref = refMap[fieldToFocus];
            if (ref?.current) {
              ref.current.focus();
            }
            setFieldToFocus(null);
          }
        }, 100);
      }}
      onConfirm={() => {
        setShowValidationModal(false);
        // Focus the field after modal closes
        setTimeout(() => {
          if (fieldToFocus) {
            const refMap: { [key: string]: React.RefObject<HTMLInputElement> } = {
              firstName: firstNameRef,
              lastName: lastNameRef,
              shippingAddress: shippingAddressRef,
              city: cityRef,
              state: stateRef,
              zip: zipRef,
              phoneNumber: phoneNumberRef,
              email: emailRef,
              cardholder: cardholderRef,
              cardNumber: cardNumberRef,
              expirationDate: expirationDateRef,
              cvv: cvvRef,
              billingAddress: billingAddressRef,
              billingCity: billingCityRef,
              billingState: billingStateRef,
              billingZip: billingZipRef
            };
            const ref = refMap[fieldToFocus];
            if (ref?.current) {
              ref.current.focus();
            }
            setFieldToFocus(null);
          }
        }, 100);
      }}
      title="FORGETTING SOMETHING?"
      message={validationMessage}
      confirmText="OK"
      cancelText="CLOSE"
    />

      <ConfirmationModal
        isOpen={checkoutNotice !== null}
        onClose={() => setCheckoutNotice(null)}
        onConfirm={() => setCheckoutNotice(null)}
        title={checkoutNotice?.title ?? ''}
        message={checkoutNotice?.message ?? ''}
        confirmText="OK"
        cancelText=""
        dataAttribute="checkout-notice"
      />

      {/* Sign Out Confirmation Modal */}
      <ConfirmationModal
      isOpen={showSignOutConfirm}
      onClose={() => setShowSignOutConfirm(false)}
      onConfirm={handleSignOut}
      title="SIGN OUT"
      message="ARE YOU SURE YOU WANT TO SIGN OUT?"
      confirmText="CONFIRM"
      cancelText="CANCEL"
      dataAttribute="sign-out-confirm"
    />
    </>
  );
}

export default CheckoutPage;

