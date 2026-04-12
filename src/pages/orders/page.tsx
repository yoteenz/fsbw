import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DynamicCartIcon from '../../components/DynamicCartIcon';
import ConfirmationModal from '../../components/ConfirmationModal';
import ConsultOfferClaimModal from '../../components/ConsultOfferClaimModal';
import BrandMenuLinks from '../../components/BrandMenuLinks';
import SocialMenuIcons from '../../components/SocialMenuIcons';
import {
  ADMIN_SUBSCRIPTION_OVERRIDE_KEY,
  isAyoteenzAdminAccount,
  isMockDataAccount,
  isMockProfileChromeActive,
  readFounderAccountViewAsClientFromStorage,
  excludeFounderSeedMockOrders,
  clearAppAuth,
  getEffectiveSubscriptionTier,
  MEMBERSHIP_SUBSCRIPTION_PREVIEW_CHANGED_EVENT,
} from '../../utils/adminAuth';
import { getPerUserKey, getCurrentUserEmailFromStorage, PER_USER_KEYS } from '../../utils/perUserStorage';
import { formatCountryDisplay } from '../../utils/formatCountry';
import {
  getCarrierTrackingUrl,
  getOrderTrackingStageFromOrder,
  ORDER_TRACKING_PULSATE_ANIMATION,
  ORDER_TRACKING_PULSATE_KEYFRAMES_CSS,
  ORDER_TRACKING_STAGE_LABELS,
  orderFormAwaitingAdminApproval,
  orderTrackingDeliveredRowIsCurrent,
  orderTrackingStageRowIsCurrent,
  orderShowsDeliveredTrackingLine,
} from '../../utils/orderTracking';
import {
  consultDigitalOrderTrackingBarFillPct,
  digitalFulfillmentStageLabels,
  getDigitalFulfillmentStageIndex,
  orderUsesDigitalFulfillmentTimeline
} from '../../utils/digitalOrderFulfillment';
import summaryIcon from '../../assets/icons/summary-icon.svg?url';
import { ShopMobileMenuShopTab } from '../../components/ShopMobileMenuShopTab';
import { ShopMobileMenuToolsTab } from '../../components/ShopMobileMenuToolsTab';
import { signInHrefWithReturnTo } from '../../utils/signInReturnTo';
import { MENU_TOGGLE_PANEL_HEIGHT } from '../../layouts/menuToggleHeights';
import { processingTimelineWeekRangeFromLabel } from '../../utils/checkoutBcfProcessing';
import {
  filterOutPremiumMembershipUpgradeOrders,
  normalizeUserOrdersBuckets,
  orderStatusIsCanceled,
  sortOrdersNewestFirst,
} from '../../utils/userOrdersBuckets';
import { advanceConsultOrdersPlacedToProcessing } from '../../utils/consultOrderLifecycle';
import { orderNeedsClientAuthFormSignature } from '../../utils/giftCardFirstPurchaseForm';
import { allOrderLineItemsReviewed } from '../../utils/orderReviewSubmissionPersist';
import { bookingCartItemThumbnailSrc } from '../../utils/bookingBadges';
import { getConsultQuote } from '../../utils/api';
import { isSupabaseConfigured } from '../../utils/supabase';
import type { ConsultOfferPersistedSnapshot } from '../../utils/consultOfferFromQuote';
import {
  consultQuoteIdFromConsultOfferRoute,
  consultQuoteRowFromPersistedSnapshot,
  mergeConsultQuoteWithPersistedThumbnail,
} from '../../utils/consultOfferFromQuote';

interface OrderLineItem {
  productName: string;
  options?: Record<string, string>; // e.g. { color: 'OFF BLACK', length: '24"', capSize: 'M' } for uniqueness
  /** Per-item pre-tax amount (when set, used for this line's price instead of splitting order total) */
  subtotal?: number;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: string;
  productName: string;
  productImage: string;
  total: number;
  /** Pre-tax subtotal (product amounts as on checkout); when set, used for per-product price instead of total */
  subtotal?: number;
  items: number;
  /** 6-character confirmation number (always set for mock orders; real orders may have from checkout/localStorage) */
  confirmationNumber?: string;
  reviewInfo?: string; // Optional review/points information
  trackingNumber?: string; // Optional tracking number
  trackingCarrier?: string; // Optional tracking carrier (e.g., "DHL", "FEDEX")
  trackingTimelineShiftDays?: number;
  adminTrackingStageOverride?: number | null;
  trackingStageNotes?: Record<string, string>;
  deliveredAt?: number; // Timestamp when order was delivered (for 48-hour archive logic)
  placedAt?: number; // Timestamp when order was placed (for 24-hour authorization countdown)
  canceledAt?: number; // Timestamp when order was canceled (for 24-hour archive logic)
  orderFormSigned?: boolean; // Whether the order form has been signed
  /** Client submitted authorization; false until admin approves (Pending → FORMS). */
  orderFormClientSubmitted?: boolean;
  orderFormAdminApproved?: boolean;
  orderFormAdminDeclined?: boolean;
  orderFormAdminDeclineReason?: string;
  bookingFlowType?: 'appointment' | 'consult';
  /** Standard vs premium booking cart line — used with bookingFlowType for cart-matching thumbnails. */
  bookingTier?: 'standard' | 'premium';
  bookingHairOption?: string;
  /** Gift card / membership / other checkout that skips shipping — 3-stage timeline only, no order form. */
  digitalFulfillmentOnly?: boolean;
  /** When status is COMPLETE (digital flow), optional deep link for "VIEW OFFER" (e.g. consult quote). */
  consultOfferRoute?: string;
  /** Copy of admin-sent offer (localStorage) for modal when API unavailable. */
  consultOfferSnapshot?: ConsultOfferPersistedSnapshot;
  /** Consult: when status moved PLACED → PROCESSING after 2h. */
  consultProcessingStartedAt?: number;
  /** Consult: linked admin quote id after offer sent. */
  consultQuoteId?: string;
  /** Consult: client-submitted hair inspo (data URLs or remote), max 3 at checkout. */
  bookingInspoPhotoUrls?: string[];
  completedAt?: number;
  lineItems?: OrderLineItem[]; // Optional per-item detail for review eligibility (unique by product + options)
  /** Loyalty points earned on this order (set at checkout); avoids falling back to account lifetime balance. */
  pointsEarned?: number;
  /** When false, no 24h authorization form flow (e.g. bookings-only). Omitted = legacy non-digital orders need form. */
  requiresOrderAuthorizationForm?: boolean;
  /** First gift-card-only purchase: one-time ID verification via order form. */
  requiresGiftCardIdentityForm?: boolean;
}

function OrdersPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartCount, setCartCount] = useState(() => {
    try {
      return parseInt(localStorage.getItem('cartCount') || '0', 10);
    } catch (e) {
      return 0;
    }
  });
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
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [consultOfferModalOpen, setConsultOfferModalOpen] = useState(false);
  const [consultOfferModalLoading, setConsultOfferModalLoading] = useState(false);
  const [consultOfferModalError, setConsultOfferModalError] = useState<string | null>(null);
  const [consultOfferModalQuote, setConsultOfferModalQuote] = useState<Record<string, unknown> | null>(null);
  const [consultOfferModalOrderLabel, setConsultOfferModalOrderLabel] = useState<string>('');
  const consultOfferFetchGen = useRef(0);
  
  // Get current user data
  const [currentUser, setCurrentUser] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      try {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Keep currentUser in sync with signed-in user so new accounts see their own data, not a previous (e.g. admin) user's
  useEffect(() => {
    const syncUser = () => {
      try {
        const user = localStorage.getItem('currentUser');
        const signedIn = localStorage.getItem('isSignedIn') === 'true';
        if (signedIn && user) {
          setCurrentUser(JSON.parse(user));
        } else {
          setCurrentUser(null);
        }
      } catch {
        setCurrentUser(null);
      }
    };
    syncUser();
    window.addEventListener('storage', syncUser);
    window.addEventListener('signInStateChanged', syncUser);
    window.addEventListener('focus', syncUser);
    return () => {
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('signInStateChanged', syncUser);
      window.removeEventListener('focus', syncUser);
    };
  }, []);

  const [reviewSubmissionUiBump, setReviewSubmissionUiBump] = useState(0);
  useEffect(() => {
    const bump = () => setReviewSubmissionUiBump((n) => n + 1);
    window.addEventListener('reviewsUpdated', bump);
    return () => window.removeEventListener('reviewsUpdated', bump);
  }, []);

  /** Re-render A/C booking badges when membership / admin preview changes (`storage` skips same-tab writes). */
  const [bookingBadgeMembershipBump, setBookingBadgeMembershipBump] = useState(0);
  useEffect(() => {
    const bump = () => setBookingBadgeMembershipBump((n) => n + 1);
    window.addEventListener(MEMBERSHIP_SUBSCRIPTION_PREVIEW_CHANGED_EVENT, bump as EventListener);
    const onStorage = (e: StorageEvent) => {
      if (e.key === ADMIN_SUBSCRIPTION_OVERRIDE_KEY) bump();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(MEMBERSHIP_SUBSCRIPTION_PREVIEW_CHANGED_EVENT, bump as EventListener);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  // Only mock profile chrome (not VIEW AS CLIENT) gets seeded test orders
  const isMockOrdersAccount = () => isMockProfileChromeActive(currentUser);

  // Currency state - per user
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
  
  // Currency exchange rates
  const currencyRates = React.useMemo(() => ({
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

  // Helper function to get 2D mannequin image based on product name
  const getProductImage = (productName: string): string => {
    switch (productName.toUpperCase()) {
      case 'BLANCO':
        return '/assets/2D BLANCO FRONT.png';
      case 'SOFT WAVE':
      case 'BEACH WAVE':
        return '/assets/2D WAVY FRONT.png';
      case 'SOFT CURL':
      case 'OCEAN CURL':
        return '/assets/2D CURLY FRONT.png';
      case 'NOIR':
      default:
        // For NOIR, use natural front image (2D version without background)
        return '/assets/natural front.png';
    }
  };

  /**
   * A/C badge tier: **current membership / subscription only** (`getEffectiveSubscriptionTier`), including
   * founder **`adminSubscriptionOverride`**. Not spend tier (BLACK alone stays **standard** consult badge) and
   * not `isPremiumMemberForGatedFeatures` (that mixes in BLACK for lobby gates).
   */
  const ordersPageBookingBadgeTierForViewer = (): 'premium' | 'standard' =>
    getEffectiveSubscriptionTier(currentUser) != null ? 'premium' : 'standard';

  /** List / expanded-row thumbnail: A/C booking orders use the same badge PNGs as the cart. */
  const ordersPageOrderThumbnailSrc = (order: Order): string => {
    void bookingBadgeMembershipBump;
    const tier = ordersPageBookingBadgeTierForViewer();
    if (order.bookingFlowType === 'appointment') {
      return bookingCartItemThumbnailSrc({ type: 'booking-appointment', bookingTier: tier }) || order.productImage;
    }
    if (order.bookingFlowType === 'consult') {
      return bookingCartItemThumbnailSrc({ type: 'booking-consult', bookingTier: tier }) || order.productImage;
    }
    return order.productImage;
  };

  const ORDER_LIST_THUMB_PX = 102;
  /** A/C booking badge thumbs vs wig list thumbs: base **0.65** of column width, **+10%** → **0.715** (list + expanded). */
  const ORDER_AC_THUMB_SCALE = 0.65 * 1.1;
  const ORDER_AC_LIST_THUMB_PX = Math.round(ORDER_LIST_THUMB_PX * ORDER_AC_THUMB_SCALE);
  const ordersPageListThumbnailSizePx = (order: Order): number =>
    order.bookingFlowType === 'appointment' || order.bookingFlowType === 'consult'
      ? ORDER_AC_LIST_THUMB_PX
      : ORDER_LIST_THUMB_PX;
  /** Top margin for the "N ITEM(S)" line under list thumbnails (wig / non–A-C orders only). */
  const ordersPageListItemsLabelMarginTopPx = (): number => 2;
  /** Fixed column so A/C badges (smaller img) share the same x-axis as 102px wig thumbs; wig rows show ITEMS label below. */
  const ORDER_LIST_THUMB_SLOT_STYLE: React.CSSProperties = {
    flexShrink: 0,
    width: ORDER_LIST_THUMB_PX,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };
  const ORDER_LIST_THUMB_BUTTON_STYLE: React.CSSProperties = {
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    width: ORDER_LIST_THUMB_PX,
    height: ORDER_LIST_THUMB_PX,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
  };
  /** Nudge A/C list badges up vs wig thumbs (same 102×102 tap target). */
  const ORDER_AC_THUMB_TRANSLATE_Y_PX = -4;
  const ordersPageListThumbButtonStyleForOrder = (order: Order): React.CSSProperties =>
    order.bookingFlowType === 'appointment' || order.bookingFlowType === 'consult'
      ? { ...ORDER_LIST_THUMB_BUTTON_STYLE, transform: `translateY(${ORDER_AC_THUMB_TRANSLATE_Y_PX}px)` }
      : ORDER_LIST_THUMB_BUTTON_STYLE;

  const ORDER_EXPANDED_PRODUCT_THUMB_PX = 120;
  const ORDER_AC_EXPANDED_PRODUCT_THUMB_PX = Math.round(ORDER_EXPANDED_PRODUCT_THUMB_PX * ORDER_AC_THUMB_SCALE);

  // Hair origin by product (matches cart for "X RAW Y" line)
  const getHairOrigin = (productName: string): string => {
    switch (productName.toUpperCase()) {
      case 'NOIR': return 'CAMBODIAN';
      case 'BLANCO': return 'RUSSIAN';
      case 'SOFT CURL': return 'FILIPINO';
      case 'OCEAN CURL': return 'VIETNAMESE';
      case 'SOFT WAVE': return 'INDIAN';
      case 'BEACH WAVE': return 'INDONESIAN';
      default: return 'CAMBODIAN';
    }
  };

  /** Details for expanded order: cap size always first for units; then only non-default options. A/C booking rows omit cap size. */
  const getNonDefaultDetailLines = (
    productName: string,
    options: Record<string, string> | undefined,
    omitCapSizeLine?: boolean
  ): string[] => {
    const fmt = (label: string, value: string) => `${label}: ${value.toLowerCase()}`;
    const opts = options ? Object.fromEntries(Object.entries(options).filter(([k]) => !k.startsWith('_'))) : {};
    const name = productName.toUpperCase();
    const lines: string[] = [];
    if (!omitCapSizeLine) {
      const capSize = opts.capSize || 'M';
      lines.push(fmt('cap size', capSize.replace(/\//g, ' / ')));
    }
    if (Object.keys(opts).length === 0 && !options) return lines;
    const defaultDensity = name === 'BLANCO' ? '250%' : '200%';
    if (opts.density && opts.density !== defaultDensity) {
      lines.push(fmt('density', opts.density));
    }
    if (opts.lace && opts.lace !== '13X6') {
      lines.push(fmt('lace', opts.lace));
    }
    let color = opts.color;
    // BLANCO only: GOLDEN, PLATINUM, ASH (default PLATINUM). NOIR/others: OFF BLACK default, JET BLACK, ESPRESSO, HONEY, etc. (no PLATINUM)
    if (name === 'BLANCO' && color && !['GOLDEN', 'PLATINUM', 'ASH'].includes(color)) color = 'PLATINUM';
    const isDefaultColor = name === 'BLANCO' ? (color === 'PLATINUM') : (color === 'OFF BLACK');
    if (color && !isDefaultColor) lines.push(fmt('color', color));
    if (opts.hairline && opts.hairline !== 'NATURAL') {
      lines.push(fmt('hairline', opts.hairline)); // e.g. "hairline: lagos" or "hairline: lagos + peak"
    }
    const hairStylingOptions = ['BANGS', 'CRIMPS', 'FLAT IRON', 'LAYERS'];
    if (opts.styling && opts.styling !== 'NONE' && hairStylingOptions.includes(opts.styling)) {
      lines.push(fmt('styling', opts.styling));
    }
    if (opts.addOns) lines.push(fmt('add-ons', opts.addOns));
    return lines;
  };

  // Helper function to get unit page route based on product name
  const getProductRoute = (productName: string): string => {
    switch (productName.toUpperCase()) {
      case 'NOIR':
        return '/straight/noir';
      case 'BLANCO':
        return '/straight/blanco';
      case 'SOFT WAVE':
        return '/wavy/soft-wave';
      case 'BEACH WAVE':
        return '/wavy/beach-wave';
      case 'SOFT CURL':
        return '/curly/soft-curl';
      case 'OCEAN CURL':
        return '/curly/ocean-curl';
      default:
        return '/straight/noir';
    }
  };

  // Helper function to format date as MM-DD-YYYY
  const formatDate = (date: Date): string => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  };

  // Helper function to get a date X days ago
  const getDateDaysAgo = (daysAgo: number): string => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return formatDate(date);
  };

  // Helper function to get a timestamp X hours ago
  const getTimestampHoursAgo = (hoursAgo: number): number => {
    return Date.now() - (hoursAgo * 60 * 60 * 1000);
  };

  /** Demo consult COMPLETE + offer snapshot — same row as Kateena mock chrome; injected for founder admin when not using mock chrome. */
  const buildFounderDemoConsultOrder331 = (): Order => ({
    id: 'kateena-consult-2',
    orderNumber: 'ORDER #331',
    confirmationNumber: 'K3C3Q1',
    date: getDateDaysAgo(2),
    status: 'COMPLETE',
    productName: 'WIG CONSULT',
    productImage: '/assets/gallery-mock.png',
    total: 40,
    subtotal: 40,
    items: 1,
    trackingNumber: undefined,
    trackingCarrier: undefined,
    placedAt: Date.now() - (30 * 60 * 60 * 1000),
    consultProcessingStartedAt: Date.now() - (6 * 60 * 60 * 1000),
    completedAt: Date.now() - (2 * 60 * 60 * 1000),
    orderFormSigned: false,
    bookingFlowType: 'consult',
    bookingTier: 'standard',
    bookingHairOption: 'WIG ONLY',
    bookingInspoPhotoUrls: ['/assets/NOIR/noir-thumb.png'],
    consultQuoteId: '00000000-0000-4000-8000-000000000088',
    consultOfferSnapshot: {
      unitKey: 'NOIR',
      selections: {
        capSize: 'M',
        length: '24"',
        density: '200%',
        texture: 'SILKY',
        lace: '13X6',
        hairline: 'NATURAL',
        color: 'OFF BLACK',
        styling: 'NONE',
        addOns: [],
      },
      priceBreakdown: [
        { label: 'UNIT', value: 'NOIR +$740 USD' },
        { label: 'ESTIMATED TOTAL', value: '$740 USD' },
      ],
      adminMessage:
        'BASED ON YOUR INSPO AND NOTES, THESE SELECTIONS WILL GIVE YOU THE CLOSEST MATCH TO YOUR GOAL LOOK.',
      thumbnailSrc: '/assets/NOIR/noir-thumb.png',
      discountCode: 'CONSULT-DEMO88',
      expiresAt: new Date(Date.now() + 70 * 60 * 60 * 1000).toISOString(),
    },
  });

  const mergeFounderAdminConsultOrder331Demo = (
    user: { email?: string } | null,
    activeOrders: Order[],
    pastOrders: Order[]
  ): { activeOrders: Order[]; pastOrders: Order[]; merged: boolean } => {
    if (!user?.email || !isAyoteenzAdminAccount(user)) {
      return { activeOrders, pastOrders, merged: false };
    }
    if (isMockProfileChromeActive(user)) return { activeOrders, pastOrders, merged: false };
    if (readFounderAccountViewAsClientFromStorage()) return { activeOrders, pastOrders, merged: false };
    const normNum = (s: string) => s.replace(/\s+/g, ' ').trim().toUpperCase();
    const has331 = [...activeOrders, ...pastOrders].some((o) => normNum(String(o.orderNumber || '')) === 'ORDER #331');
    if (has331) return { activeOrders, pastOrders, merged: false };
    return {
      activeOrders: [buildFounderDemoConsultOrder331(), ...activeOrders],
      pastOrders,
      merged: true,
    };
  };

  // Helper function to format countdown time
  const formatCountdown = (remainingMs: number): string => {
    if (remainingMs <= 0) return '0 HOURS REMAINING';
    
    const hours = Math.floor(remainingMs / (60 * 60 * 1000));
    
    return `${hours} HOUR${hours !== 1 ? 'S' : ''} REMAINING`;
  };

  // Helper function to get remaining time for authorization
  const getAuthorizationRemainingTime = (placedAt: number): number => {
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const elapsed = Date.now() - placedAt;
    return Math.max(0, twentyFourHours - elapsed);
  };

  const getOrdinalSuffix = (day: number): string => {
    if (day >= 11 && day <= 13) return 'TH';
    const lastDigit = day % 10;
    switch (lastDigit) {
      case 1: return 'ST';
      case 2: return 'ND';
      case 3: return 'RD';
      default: return 'TH';
    }
  };

  const calculateProcessingTimeline = (orderDateStr: string, processingTime: string): string => {
    try {
      const [month, day, year] = orderDateStr.split('-').map(Number);
      const orderDate = new Date(year, month - 1, day);
      const { min: minWeeks, max: maxWeeks } = processingTimelineWeekRangeFromLabel(processingTime || '');
      const minDate = new Date(orderDate);
      minDate.setDate(minDate.getDate() + (minWeeks * 7));
      const maxDate = new Date(orderDate);
      maxDate.setDate(maxDate.getDate() + (maxWeeks * 7));
      const monthNames = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
      const minMonth = monthNames[minDate.getMonth()];
      const maxMonth = monthNames[maxDate.getMonth()];
      const minDay = minDate.getDate();
      const maxDay = maxDate.getDate();
      const minSuffix = getOrdinalSuffix(minDay);
      const maxSuffix = getOrdinalSuffix(maxDay);
      if (minMonth === maxMonth) return `${minMonth} ${minDay}${minSuffix} - ${maxDay}${maxSuffix}`;
      return `${minMonth} ${minDay}${minSuffix} - ${maxMonth} ${maxDay}${maxSuffix}`;
    } catch {
      return processingTime || '6-8 WEEKS';
    }
  };

  // Legacy mock order data (kept for reference; only admin mock-data account uses kateenaMock* now)
  const mockActiveOrders: Order[] = [
    {
      id: 'test-order-3',
      orderNumber: 'ORDER #777',
      confirmationNumber: 'X7R7S7',
      date: getDateDaysAgo(20), // 20 days ago (matching concierge - multi-unit order date)
      status: 'PREPARING',
      productName: 'NOIR',
      productImage: getProductImage('NOIR'),
      total: 1635,
      subtotal: 1635,
      items: 2,
      trackingNumber: undefined,
      trackingCarrier: undefined,
      placedAt: Date.now() - (20 * 24 * 60 * 60 * 1000), // 20 days ago
      orderFormSigned: true,
      lineItems: [
        { productName: 'NOIR', options: { capSize: 'M', color: 'ESPRESSO', length: '22"' }, subtotal: 835 },
        { productName: 'NOIR', options: { capSize: 'M', color: 'OFF BLACK', length: '24"', hairline: 'LAGOS' }, subtotal: 800 }
      ]
    },
    {
      id: 'test-order-4',
      orderNumber: 'ORDER #666',
      confirmationNumber: 'X6R6S6',
      date: getDateDaysAgo(2), // 2 days ago (matching concierge)
      status: 'CANCELED',
      productName: 'BLANCO',
      productImage: getProductImage('BLANCO'),
      total: 820,
      items: 1,
      trackingNumber: undefined,
      trackingCarrier: undefined,
      placedAt: Date.now() - (25 * 60 * 60 * 1000), // 25 hours ago (past 24 hour limit)
      canceledAt: Date.now() - (12 * 60 * 60 * 1000), // Canceled 12 hours ago
      orderFormSigned: false
    },
    {
      id: 'test-order-5',
      orderNumber: 'ORDER #555',
      confirmationNumber: 'X5R5S5',
      date: getDateDaysAgo(0), // Today (matching concierge - 12 hours ago)
      status: 'PLACED',
      productName: 'NOIR',
      productImage: getProductImage('NOIR'),
      total: 920,
      items: 1,
      trackingNumber: undefined,
      trackingCarrier: undefined,
      placedAt: Date.now() - (12 * 60 * 60 * 1000), // 12 hours ago (within 24 hour limit)
      orderFormSigned: false
    },
    {
      id: '1',
      orderNumber: 'ORDER #237',
      confirmationNumber: 'X2R3S7',
      date: getDateDaysAgo(2), // 2 days ago
      status: 'PLACED',
      productName: 'NOIR',
      productImage: getProductImage('NOIR'),
      total: 740,
      items: 1,
      trackingNumber: undefined,
      trackingCarrier: undefined,
      placedAt: getTimestampHoursAgo(2) // Placed 2 hours ago
    },
    {
      id: '2',
      orderNumber: 'ORDER #239',
      confirmationNumber: 'X2R3S9',
      date: getDateDaysAgo(5), // 5 days ago
      status: 'CONFIRMED',
      productName: 'BLANCO',
      productImage: getProductImage('BLANCO'),
      total: 1640,
      items: 2,
      trackingNumber: undefined,
      trackingCarrier: undefined
    },
    {
      id: '10',
      orderNumber: 'ORDER #244',
      confirmationNumber: 'X2R4S4',
      date: getDateDaysAgo(1), // 1 day ago
      status: 'PLACED',
      productName: 'SOFT WAVE',
      productImage: getProductImage('SOFT WAVE'),
      total: 980,
      items: 1,
      trackingNumber: undefined,
      trackingCarrier: undefined,
      placedAt: getTimestampHoursAgo(3), // Placed 3 hours ago
      orderFormSigned: true // Order form has been signed
    },
    {
      id: '3',
      orderNumber: 'ORDER #241',
      confirmationNumber: 'X2R4S1',
      date: getDateDaysAgo(8), // 8 days ago
      status: 'PREPARING',
      productName: 'NOIR',
      productImage: getProductImage('NOIR'),
      total: 2220,
      items: 3,
      trackingNumber: undefined,
      trackingCarrier: undefined
    },
    {
      id: '4',
      orderNumber: 'ORDER #242',
      confirmationNumber: 'X2R4S2',
      date: getDateDaysAgo(12), // 12 days ago
      status: 'SHIPPED',
      productName: 'BLANCO',
      productImage: getProductImage('BLANCO'),
      total: 1640,
      items: 2,
      trackingNumber: '9400136106023046913338',
      trackingCarrier: 'DHL'
    },
    {
      id: '11',
      orderNumber: 'ORDER #245',
      confirmationNumber: 'X2R4S5',
      date: getDateDaysAgo(6), // 6 days ago
      status: 'SHIPPED',
      productName: 'SOFT CURL',
      productImage: getProductImage('SOFT CURL'),
      total: 1200,
      items: 1,
      trackingNumber: undefined,
      trackingCarrier: undefined
    },
    {
      id: '8',
      orderNumber: 'ORDER #240',
      confirmationNumber: 'X2R4S0',
      date: getDateDaysAgo(3), // 3 days ago
      status: 'CANCELED',
      productName: 'SOFT CURL',
      productImage: getProductImage('SOFT CURL'),
      total: 780,
      items: 1,
      trackingNumber: undefined,
      trackingCarrier: undefined,
      placedAt: getTimestampHoursAgo(50), // Placed 50 hours ago (expired)
      canceledAt: getTimestampHoursAgo(12) // Canceled 12 hours ago (still in active, not archived yet)
    },
    {
      id: '9',
      orderNumber: 'ORDER #238',
      confirmationNumber: 'X2R3S8',
      date: getDateDaysAgo(4), // 4 days ago
      status: 'CANCELED',
      productName: 'BEACH WAVE',
      productImage: getProductImage('BEACH WAVE'),
      total: 1520,
      items: 2,
      trackingNumber: undefined,
      trackingCarrier: undefined,
      placedAt: getTimestampHoursAgo(52), // Placed 52 hours ago (expired)
      canceledAt: getTimestampHoursAgo(18) // Canceled 18 hours ago (still in active, not archived yet)
    }
  ];
  void mockActiveOrders; // kept for reference

  const mockPastOrders: Order[] = [
    {
      id: 'test-order-1',
      orderNumber: 'ORDER #888',
      confirmationNumber: 'X8R8S8',
      date: getDateDaysAgo(13), // 13 days ago (matching concierge)
      status: 'DELIVERED',
      productName: 'NOIR',
      productImage: getProductImage('NOIR'),
      total: 740,
      items: 1,
      reviewInfo: 'REVIEW MISSING',
      trackingNumber: '1Z888AA10123456784',
      trackingCarrier: 'FEDEX',
      deliveredAt: Date.now() - (1 * 24 * 60 * 60 * 1000), // Delivered 1 day ago
      placedAt: Date.now() - (13 * 24 * 60 * 60 * 1000), // 13 days ago
      orderFormSigned: true
    },
    {
      id: 'test-order-2',
      orderNumber: 'ORDER #999',
      confirmationNumber: 'X9R9S9',
      date: getDateDaysAgo(60), // 60 days ago (matching concierge)
      status: 'DELIVERED',
      productName: 'NOIR',
      productImage: getProductImage('NOIR'),
      total: 740,
      items: 1,
      reviewInfo: 'REVIEW MISSING',
      trackingNumber: '1Z999AA10123456784',
      trackingCarrier: 'DHL',
      deliveredAt: Date.now() - (1 * 24 * 60 * 60 * 1000), // Delivered 1 day ago
      placedAt: Date.now() - (60 * 24 * 60 * 60 * 1000), // 60 days ago
      orderFormSigned: true
    },
    {
      id: '10',
      orderNumber: 'ORDER #236',
      confirmationNumber: 'X2R3S6',
      date: getDateDaysAgo(3), // 3 days ago
      status: 'CANCELED',
      productName: 'OCEAN CURL',
      productImage: getProductImage('OCEAN CURL'),
      total: 1560,
      items: 2,
      trackingNumber: undefined,
      trackingCarrier: undefined,
      placedAt: getTimestampHoursAgo(72), // Placed 72 hours ago (expired)
      canceledAt: getTimestampHoursAgo(30) // Canceled 30 hours ago (archived after 24 hours)
    },
    {
      id: '5',
      orderNumber: 'ORDER #243',
      confirmationNumber: 'X2R4S3',
      date: getDateDaysAgo(25), // 25 days ago
      status: 'DELIVERED',
      productName: 'NOIR',
      productImage: getProductImage('NOIR'),
      total: 2220,
      items: 3,
      reviewInfo: 'REVIEW MISSING',
      trackingNumber: '9400136106023046913326',
      trackingCarrier: 'FEDEX',
      deliveredAt: Date.now() - (30 * 60 * 60 * 1000) // Delivered 30 hours ago (archived but still shows in active for 48 hours)
    },
    {
      id: '4',
      orderNumber: 'ORDER #234',
      confirmationNumber: 'X2R3S4',
      date: getDateDaysAgo(42), // 42 days ago
      status: 'DELIVERED',
      productName: 'NOIR',
      productImage: getProductImage('NOIR'),
      total: 1575,
      subtotal: 1575,
      items: 2,
      reviewInfo: 'REVIEW MISSING',
      trackingNumber: '9400136106023046913338',
      trackingCarrier: 'DHL',
      deliveredAt: Date.now() - (42 * 24 * 60 * 60 * 1000),
      lineItems: [
        { productName: 'NOIR', options: { capSize: 'M', color: 'OFF BLACK', length: '24"' }, subtotal: 740 },
        { productName: 'NOIR', options: { capSize: 'M', color: 'ESPRESSO', length: '22"' }, subtotal: 835 }
      ]
    },
    {
      id: '5',
      orderNumber: 'ORDER #233',
      confirmationNumber: 'X2R3S3',
      date: getDateDaysAgo(58), // 58 days ago
      status: 'DELIVERED',
      productName: 'SOFT CURL',
      productImage: getProductImage('SOFT CURL'),
      total: 780,
      items: 1,
      reviewInfo: 'POINTS TO EARN',
      trackingNumber: '9400136106023046913326',
      trackingCarrier: 'FEDEX',
      deliveredAt: Date.now() - (58 * 24 * 60 * 60 * 1000)
    },
    {
      id: '6',
      orderNumber: 'ORDER #232',
      confirmationNumber: 'X2R3S2',
      date: getDateDaysAgo(75), // 75 days ago
      status: 'DELIVERED',
      productName: 'BLANCO',
      productImage: getProductImage('BLANCO'),
      total: 820,
      items: 1,
      reviewInfo: 'REVIEW MISSING',
      trackingNumber: '9400136106023046913338',
      trackingCarrier: 'DHL',
      deliveredAt: Date.now() - (75 * 24 * 60 * 60 * 1000)
    },
    {
      id: '7',
      orderNumber: 'ORDER #231',
      confirmationNumber: 'X2R3S1',
      date: getDateDaysAgo(92), // 92 days ago
      status: 'DELIVERED',
      productName: 'NOIR',
      productImage: getProductImage('NOIR'),
      total: 740,
      items: 1,
      reviewInfo: 'POINTS TO EARN',
      trackingNumber: '9400136106023046913326',
      trackingCarrier: 'FEDEX',
      deliveredAt: Date.now() - (92 * 24 * 60 * 60 * 1000)
    }
  ];
  void mockPastOrders; // kept for reference

  // Helper function to get user's actual orders from localStorage
  const getUserOrders = (): { activeOrders: Order[], pastOrders: Order[] } => {
    if (typeof window === 'undefined' || !currentUser) {
      return { activeOrders: [], pastOrders: [] };
    }

    try {
      const userOrdersKey = `userOrders_${currentUser.email}`;
      const storedOrders = localStorage.getItem(userOrdersKey);
      if (storedOrders) {
        const orders = JSON.parse(storedOrders);
        let activeOrders = orders.activeOrders || [];
        let pastOrders = orders.pastOrders || [];
        const founder331 = mergeFounderAdminConsultOrder331Demo(currentUser, activeOrders, pastOrders);
        if (founder331.merged) {
          activeOrders = founder331.activeOrders;
          pastOrders = founder331.pastOrders;
          try {
            localStorage.setItem(
              userOrdersKey,
              JSON.stringify({ activeOrders, pastOrders })
            );
            window.dispatchEvent(new CustomEvent('ordersUpdated'));
          } catch (_) {
            /* ignore */
          }
        }
        if (isMockDataAccount(currentUser) && readFounderAccountViewAsClientFromStorage()) {
          activeOrders = excludeFounderSeedMockOrders(activeOrders);
          pastOrders = excludeFounderSeedMockOrders(pastOrders);
        }
        const norm = normalizeUserOrdersBuckets<Order>(activeOrders, pastOrders);
        const filtered = filterOutPremiumMembershipUpgradeOrders(norm.activeOrders, norm.pastOrders);
        const sorted = {
          activeOrders: sortOrdersNewestFirst(filtered.activeOrders),
          pastOrders: sortOrdersNewestFirst(filtered.pastOrders),
        };
        const consultAdvanced = {
          activeOrders: sortOrdersNewestFirst(advanceConsultOrdersPlacedToProcessing(sorted.activeOrders)),
          pastOrders: sortOrdersNewestFirst(advanceConsultOrdersPlacedToProcessing(sorted.pastOrders)),
        };
        try {
          const sortedNormOnly = {
            activeOrders: sortOrdersNewestFirst(norm.activeOrders),
            pastOrders: sortOrdersNewestFirst(norm.pastOrders),
          };
          const needsSortPersist =
            JSON.stringify({ activeOrders: norm.activeOrders, pastOrders: norm.pastOrders }) !==
            JSON.stringify(sortedNormOnly);
          const needsFilterPersist = JSON.stringify(sortedNormOnly) !== JSON.stringify(sorted);
          const needsConsultPersist = JSON.stringify(sorted) !== JSON.stringify(consultAdvanced);
          if (needsSortPersist || needsFilterPersist || needsConsultPersist) {
            localStorage.setItem(userOrdersKey, JSON.stringify(consultAdvanced));
            window.dispatchEvent(new CustomEvent('ordersUpdated'));
          }
        } catch (_) {}
        return consultAdvanced;
      }
    } catch (e) {
      console.error('Error loading user orders:', e);
    }

    return { activeOrders: [], pastOrders: [] };
  };

  // Mock order data for Kateena Armstrong (ORDER #344 tracking)
  // ORDER #344 progression: Confirmed (1 week ago) -> Shipped (2 days ago) -> Delivered (yesterday)
  const kateenaMockActiveOrders: Order[] = [
    {
      id: 'test-order-3',
      orderNumber: 'ORDER #777',
      confirmationNumber: 'X7R7S7',
      date: getDateDaysAgo(20), // 20 days ago (matching concierge - multi-unit order date)
      status: 'PREPARING',
      productName: 'NOIR',
      productImage: getProductImage('NOIR'),
      total: 1635,
      subtotal: 1635,
      items: 2,
      trackingNumber: undefined,
      trackingCarrier: undefined,
      placedAt: Date.now() - (20 * 24 * 60 * 60 * 1000), // 20 days ago
      orderFormSigned: true,
      lineItems: [
        { productName: 'NOIR', options: { capSize: 'M', color: 'ESPRESSO', length: '22"' }, subtotal: 835 },
        { productName: 'NOIR', options: { capSize: 'M', color: 'OFF BLACK', length: '24"', hairline: 'LAGOS' }, subtotal: 800 }
      ]
    },
    {
      id: 'test-order-5',
      orderNumber: 'ORDER #555',
      confirmationNumber: 'X5R5S5',
      date: getDateDaysAgo(0), // Today (matching concierge - 12 hours ago)
      status: 'PLACED',
      productName: 'NOIR',
      productImage: getProductImage('NOIR'),
      total: 920,
      items: 1,
      trackingNumber: undefined,
      trackingCarrier: undefined,
      placedAt: Date.now() - (12 * 60 * 60 * 1000), // 12 hours ago (within 24 hour limit)
      orderFormSigned: false
    },
    {
      id: 'kateena-1',
      orderNumber: 'ORDER #344',
      confirmationNumber: 'X3R4S4',
      date: getDateDaysAgo(7), // 1 week ago (confirmed)
      status: 'DELIVERED',
      productName: 'NOIR',
      productImage: getProductImage('NOIR'),
      total: 1640,
      items: 2,
      reviewInfo: 'REVIEW MISSING',
      trackingNumber: '9400136106023046913440',
      trackingCarrier: 'DHL',
      deliveredAt: getTimestampHoursAgo(24), // Delivered yesterday (24 hours ago)
      placedAt: getTimestampHoursAgo(7 * 24) // Placed 1 week ago
    },
    {
      id: 'kateena-2',
      orderNumber: 'ORDER #345',
      confirmationNumber: 'X3R4S5',
      date: getDateDaysAgo(3), // 3 days ago
      status: 'SHIPPED',
      productName: 'BLANCO',
      productImage: getProductImage('BLANCO'),
      total: 820,
      items: 1,
      trackingNumber: '9400136106023046913441',
      trackingCarrier: 'FEDEX',
      placedAt: getTimestampHoursAgo(3 * 24) // Placed 3 days ago
    },
    {
      id: 'kateena-3',
      orderNumber: 'ORDER #346',
      confirmationNumber: 'X3R4S6',
      date: getDateDaysAgo(1), // 1 day ago
      status: 'PREPARING',
      productName: 'SOFT WAVE',
      productImage: getProductImage('SOFT WAVE'),
      total: 980,
      items: 1,
      trackingNumber: undefined,
      trackingCarrier: undefined,
      placedAt: getTimestampHoursAgo(24) // Placed 1 day ago
    },
    {
      id: 'kateena-consult-1',
      orderNumber: 'ORDER #332',
      confirmationNumber: 'K3C3Q2',
      date: getDateDaysAgo(0),
      status: 'PLACED',
      productName: 'WIG CONSULT',
      productImage: '/assets/gallery-mock.png',
      total: 40,
      subtotal: 40,
      items: 1,
      trackingNumber: undefined,
      trackingCarrier: undefined,
      placedAt: Date.now() - (2 * 60 * 60 * 1000),
      orderFormSigned: false,
      bookingFlowType: 'consult',
      bookingTier: 'standard',
      bookingHairOption: 'WIG + INSTALL',
      bookingInspoPhotoUrls: ['/assets/gallery-mock.png', '/assets/mock-image.png'],
    },
    buildFounderDemoConsultOrder331(),
  ];

  const kateenaMockPastOrders: Order[] = [
    {
      id: 'kateena-consult-archived-offer',
      orderNumber: 'ORDER #320',
      confirmationNumber: 'C3O2V0',
      date: getDateDaysAgo(1),
      status: 'COMPLETE',
      productName: 'WIG CONSULT',
      productImage: '/assets/gallery-mock.png',
      total: 40,
      subtotal: 40,
      items: 1,
      placedAt: Date.now() - (80 * 60 * 60 * 1000),
      completedAt: Date.now() - (48 * 60 * 60 * 1000),
      bookingFlowType: 'consult',
      bookingTier: 'standard',
      bookingHairOption: 'WIG ONLY',
      consultQuoteId: '00000000-0000-4000-8000-000000000099',
      consultOfferSnapshot: {
        unitKey: 'NOIR',
        selections: {
          capSize: 'M',
          length: '24"',
          density: '200%',
          texture: 'SILKY',
          lace: '13X6',
          hairline: 'NATURAL',
          color: 'OFF BLACK',
          styling: 'NONE',
          addOns: [],
        },
        priceBreakdown: [
          { label: 'UNIT', value: 'NOIR +$740 USD' },
          { label: 'ESTIMATED TOTAL', value: '$740 USD' },
        ],
        adminMessage: 'BASED ON YOUR INSPO AND NOTES, THESE SELECTIONS WILL GIVE YOU THE CLOSEST MATCH TO YOUR GOAL LOOK.',
        thumbnailSrc: '/assets/NOIR/noir-thumb.png',
        discountCode: 'CONSULT-DEMO99',
        expiresAt: new Date(Date.now() + 70 * 60 * 60 * 1000).toISOString(),
      },
    },
    {
      id: 'test-order-4',
      orderNumber: 'ORDER #666',
      confirmationNumber: 'X6R6S6',
      date: getDateDaysAgo(2),
      status: 'CANCELED',
      productName: 'BLANCO',
      productImage: getProductImage('BLANCO'),
      total: 820,
      items: 1,
      trackingNumber: undefined,
      trackingCarrier: undefined,
      placedAt: Date.now() - (25 * 60 * 60 * 1000),
      canceledAt: Date.now() - (12 * 60 * 60 * 1000),
      orderFormSigned: false
    },
    // Mock order with one product showing 6 lines of detail (cap size, density, lace, color, hairline, styling)
    {
      id: 'detail-lines-test',
      orderNumber: 'ORDER #351',
      confirmationNumber: 'X3R5S1',
      date: getDateDaysAgo(14),
      status: 'DELIVERED',
      productName: 'NOIR',
      productImage: getProductImage('NOIR'),
      total: 1000,
      subtotal: 1000,
      items: 1,
      reviewInfo: 'REVIEW MISSING',
      trackingNumber: '1Z351AA10123456789',
      trackingCarrier: 'FEDEX',
      deliveredAt: Date.now() - (14 * 24 * 60 * 60 * 1000),
      placedAt: Date.now() - (14 * 24 * 60 * 60 * 1000),
      orderFormSigned: true,
      lineItems: [
        { productName: 'NOIR', options: { capSize: 'M', density: '250%', lace: '13X4', color: 'ESPRESSO', hairline: 'LAGOS', styling: 'BANGS', length: '24"' }, subtotal: 1000 }
      ]
    },
    // Mock order with multiple different products – for testing NEXT ITEM and product details in expanded summary
    {
      id: 'multi-product-test',
      orderNumber: 'ORDER #350',
      confirmationNumber: 'X3R5S0',
      date: getDateDaysAgo(5),
      status: 'DELIVERED',
      productName: 'NOIR',
      productImage: getProductImage('NOIR'),
      total: 2405,
      subtotal: 2405,
      items: 3,
      reviewInfo: 'REVIEW MISSING',
      trackingNumber: '1Z350AA10123456789',
      trackingCarrier: 'FEDEX',
      deliveredAt: Date.now() - (30 * 60 * 60 * 1000), // 30 hours ago – eligible for leave review
      placedAt: Date.now() - (5 * 24 * 60 * 60 * 1000),
      orderFormSigned: true,
      lineItems: [
        { productName: 'NOIR', options: { capSize: 'M', color: 'ESPRESSO', length: '24"' }, subtotal: 840 },
        { productName: 'BLANCO', options: { capSize: 'M', color: 'GOLDEN', length: '22"' }, subtotal: 795 },
        { productName: 'SOFT CURL', options: { capSize: 'M', color: 'HONEY', length: '20"' }, subtotal: 770 }
      ]
    },
    {
      id: 'test-order-1',
      orderNumber: 'ORDER #888',
      confirmationNumber: 'X8R8S8',
      date: getDateDaysAgo(13), // 13 days ago (matching concierge)
      status: 'DELIVERED',
      productName: 'NOIR',
      productImage: getProductImage('NOIR'),
      total: 740,
      items: 1,
      reviewInfo: 'REVIEW MISSING',
      trackingNumber: '1Z888AA10123456784',
      trackingCarrier: 'FEDEX',
      deliveredAt: Date.now() - (25 * 60 * 60 * 1000), // Delivered 25 hours ago (24+ for leave review)
      placedAt: Date.now() - (13 * 24 * 60 * 60 * 1000), // 13 days ago
      orderFormSigned: true
    },
    {
      id: 'test-order-2',
      orderNumber: 'ORDER #999',
      confirmationNumber: 'X9R9S9',
      date: getDateDaysAgo(60), // 60 days ago (matching concierge)
      status: 'DELIVERED',
      productName: 'NOIR',
      productImage: getProductImage('NOIR'),
      total: 740,
      items: 1,
      reviewInfo: 'REVIEW MISSING',
      trackingNumber: '1Z999AA10123456784',
      trackingCarrier: 'DHL',
      deliveredAt: Date.now() - (1 * 24 * 60 * 60 * 1000), // Delivered 1 day ago
      placedAt: Date.now() - (60 * 24 * 60 * 60 * 1000), // 60 days ago
      orderFormSigned: true
    }
  ];

  // Get orders: seeded mocks only when mock profile chrome is on (not VIEW AS CLIENT); otherwise real LS orders (seed IDs stripped for founder client view)
  const getUserOrdersData = () => {
    if (isMockOrdersAccount()) {
      return {
        activeOrders: sortOrdersNewestFirst(kateenaMockActiveOrders),
        pastOrders: sortOrdersNewestFirst(kateenaMockPastOrders),
      };
    }
    return getUserOrders();
  };

  const [activeOrders, setActiveOrders] = useState<Order[]>(() => {
    return getUserOrdersData().activeOrders;
  });

  const [pastOrders, setPastOrders] = useState<Order[]>(() => {
    return getUserOrdersData().pastOrders;
  });

  useEffect(() => {
    const id = new URLSearchParams(location.search).get('orderId');
    if (!id) return;
    const all = [...activeOrders, ...pastOrders];
    if (all.some((o) => o.id === id)) {
      setExpandedOrderId(id);
    }
  }, [location.search, activeOrders, pastOrders]);

  // Refs for auto-scrolling
  const activeOrdersRef = useRef<HTMLDivElement>(null);
  const pastOrdersReviewRef = useRef<HTMLDivElement>(null);

  const [ordersAnimationsEnabled, setOrdersAnimationsEnabled] = useState(() => {
    try {
      const key = getPerUserKey(PER_USER_KEYS.ordersPageAnimationsEnabled, getCurrentUserEmailFromStorage());
      return localStorage.getItem(key) !== 'false';
    } catch {
      return true;
    }
  });

  // Real accounts: keep userOrders_* in localStorage in sync with React state so cloud push (App + Supabase) sees updates
  useEffect(() => {
    if (typeof window === 'undefined' || !currentUser?.email) return;
    if (isMockProfileChromeActive(currentUser)) return;
    try {
      const key = `userOrders_${currentUser.email}`;
      localStorage.setItem(key, JSON.stringify({ activeOrders, pastOrders }));
      window.dispatchEvent(new CustomEvent('ordersUpdated'));
    } catch (_) {}
  }, [activeOrders, pastOrders, currentUser?.email]);

  // Update orders when user changes
  useEffect(() => {
    const updateUser = () => {
      try {
        const user = localStorage.getItem('currentUser');
        const parsedUser = user ? JSON.parse(user) : null;
        setCurrentUser(parsedUser);

        // Compute orders: mock only for admin (mock-data) account
        const useMock = parsedUser ? isMockProfileChromeActive(parsedUser) : false;
        let ordersData: { activeOrders: Order[]; pastOrders: Order[] };
        if (useMock) {
          ordersData = {
            activeOrders: advanceConsultOrdersPlacedToProcessing(kateenaMockActiveOrders),
            pastOrders: advanceConsultOrdersPlacedToProcessing(kateenaMockPastOrders),
          };
        } else {
          ordersData = parsedUser?.email
            ? (() => {
                try {
                  const key = `userOrders_${parsedUser.email}`;
                  const stored = localStorage.getItem(key);
                    if (stored) {
                    const o = JSON.parse(stored);
                    let activeOrders: Order[] = o.activeOrders || [];
                    let pastOrders: Order[] = o.pastOrders || [];
                    const founder331Upd = mergeFounderAdminConsultOrder331Demo(parsedUser, activeOrders, pastOrders);
                    if (founder331Upd.merged) {
                      activeOrders = founder331Upd.activeOrders;
                      pastOrders = founder331Upd.pastOrders;
                      try {
                        localStorage.setItem(
                          key,
                          JSON.stringify({ activeOrders, pastOrders })
                        );
                        window.dispatchEvent(new CustomEvent('ordersUpdated'));
                      } catch (_) {
                        /* ignore */
                      }
                    }
                    if (
                      parsedUser &&
                      isMockDataAccount(parsedUser) &&
                      readFounderAccountViewAsClientFromStorage()
                    ) {
                      activeOrders = excludeFounderSeedMockOrders(activeOrders);
                      pastOrders = excludeFounderSeedMockOrders(pastOrders);
                    }
                    const norm = normalizeUserOrdersBuckets<Order>(activeOrders, pastOrders);
                    const filtered = filterOutPremiumMembershipUpgradeOrders(norm.activeOrders, norm.pastOrders);
                    const sorted = {
                      activeOrders: sortOrdersNewestFirst(filtered.activeOrders),
                      pastOrders: sortOrdersNewestFirst(filtered.pastOrders),
                    };
                    const consultAdvanced = {
                      activeOrders: sortOrdersNewestFirst(advanceConsultOrdersPlacedToProcessing(sorted.activeOrders)),
                      pastOrders: sortOrdersNewestFirst(advanceConsultOrdersPlacedToProcessing(sorted.pastOrders)),
                    };
                    const sortedNormOnly = {
                      activeOrders: sortOrdersNewestFirst(norm.activeOrders),
                      pastOrders: sortOrdersNewestFirst(norm.pastOrders),
                    };
                    const needsConsultPersist = JSON.stringify(sorted) !== JSON.stringify(consultAdvanced);
                    if (
                      sorted.activeOrders.length !== activeOrders.length ||
                      sorted.pastOrders.length !== pastOrders.length ||
                      norm.activeOrders.length !== activeOrders.length ||
                      norm.pastOrders.length !== pastOrders.length ||
                      JSON.stringify(sortedNormOnly) !== JSON.stringify(sorted) ||
                      needsConsultPersist
                    ) {
                      try {
                        localStorage.setItem(
                          key,
                          JSON.stringify({
                            activeOrders: consultAdvanced.activeOrders,
                            pastOrders: consultAdvanced.pastOrders,
                          })
                        );
                        window.dispatchEvent(new CustomEvent('ordersUpdated'));
                      } catch (_) {}
                    }
                    return consultAdvanced;
                  }
                } catch (_) {}
                return { activeOrders: [], pastOrders: [] };
              })()
            : { activeOrders: [], pastOrders: [] };
        }

        setActiveOrders(sortOrdersNewestFirst(ordersData.activeOrders));
        setPastOrders(sortOrdersNewestFirst(ordersData.pastOrders));

        // Keep localStorage in sync for mock-data account so account profile card count matches orders page
        if (parsedUser?.email && useMock) {
          const key = `userOrders_${parsedUser.email}`;
          localStorage.setItem(
            key,
            JSON.stringify({
              activeOrders: sortOrdersNewestFirst(ordersData.activeOrders),
              pastOrders: sortOrdersNewestFirst(ordersData.pastOrders),
            })
          );
          window.dispatchEvent(new CustomEvent('ordersUpdated'));
        }
      } catch (e) {
        console.error('Error updating user:', e);
      }
    };

    // Initial update
    updateUser();

    // Listen for sign in/out events
    const onViewAsClient = () => updateUser();

    window.addEventListener('signInStateChanged', updateUser);
    window.addEventListener('storage', updateUser);
    window.addEventListener('focus', updateUser);
    window.addEventListener('founderAccountViewAsClientChanged', onViewAsClient);

    return () => {
      window.removeEventListener('signInStateChanged', updateUser);
      window.removeEventListener('storage', updateUser);
      window.removeEventListener('focus', updateUser);
      window.removeEventListener('founderAccountViewAsClientChanged', onViewAsClient);
    };
  }, []);

  // Clear order-status alerts when user visits orders page (they've seen the updates)
  useEffect(() => {
    try {
      const user = localStorage.getItem('currentUser');
      const parsed = user ? JSON.parse(user) : null;
      const email = parsed?.email;
      if (!email) return;
      const key = `userOrders_${email}`;
      const stored = localStorage.getItem(key);
      if (!stored) return;
      const data = JSON.parse(stored);
      const all = [...(data.activeOrders || []), ...(data.pastOrders || [])];
      const statusUpdates = ['SHIPPED', 'PREPARING', 'CONFIRMED'];
      all.forEach((order: Order) => {
        if (order.status && order.id && statusUpdates.includes(order.status)) {
          localStorage.setItem(`orderStatusSeen_${order.id}_${order.status}`, 'true');
        }
      });
      window.dispatchEvent(new CustomEvent('accountCardAlertsViewed'));
    } catch (_) {}
  }, []);

  // Listen for cart count changes
  useEffect(() => {
    const handleCartCountUpdate = (event: CustomEvent) => {
      setCartCount(event.detail);
    };

    const handleStorageChange = () => {
      try {
        const newCartCount = parseInt(localStorage.getItem('cartCount') || '0', 10);
        setCartCount(newCartCount);
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

  // Listen for currency changes (per-user key)
  useEffect(() => {
    const handleCurrencyChange = () => {
      try {
        const key = getPerUserKey(PER_USER_KEYS.selectedCurrency, getCurrentUserEmailFromStorage());
        const savedCurrency = localStorage.getItem(key);
        if (savedCurrency) {
          setSelectedCurrency(savedCurrency);
        }
      } catch (e) {
        // Ignore errors
      }
    };

    window.addEventListener('currencyChanged', handleCurrencyChange);
    window.addEventListener('storage', handleCurrencyChange);

    return () => {
      window.removeEventListener('currencyChanged', handleCurrencyChange);
      window.removeEventListener('storage', handleCurrencyChange);
    };
  }, []);

  useEffect(() => {
    const handleOrdersAnimationsChange = () => {
      try {
        const key = getPerUserKey(PER_USER_KEYS.ordersPageAnimationsEnabled, getCurrentUserEmailFromStorage());
        setOrdersAnimationsEnabled(localStorage.getItem(key) !== 'false');
      } catch (_) {}
    };
    window.addEventListener('ordersAnimationsChanged', handleOrdersAnimationsChange as EventListener);
    window.addEventListener('storage', handleOrdersAnimationsChange);
    return () => {
      window.removeEventListener('ordersAnimationsChanged', handleOrdersAnimationsChange as EventListener);
      window.removeEventListener('storage', handleOrdersAnimationsChange);
    };
  }, []);

  // Auto-scroll effect for order lists (with manual scroll support)
  useEffect(() => {
    if (!ordersAnimationsEnabled) {
      return;
    }
    // Only initialize scrolling when menu is closed and no order is expanded
    if (showMobileMenu || expandedOrderId) {
      return;
    }

    const scrollElements = [
      { ref: activeOrdersRef, content: activeOrders.length > 0 ? 'active' : null },
      { ref: pastOrdersReviewRef, content: pastOrders.some(o => o.reviewInfo) ? 'pastReview' : null }
    ];

    const intervals: ReturnType<typeof setTimeout>[] = [];
    const manualScrollTimeouts: ReturnType<typeof setTimeout>[] = [];
    const isManuallyScrolling: { [key: string]: boolean } = {};
    const eventListeners: Array<{ element: HTMLElement; event: string; handler: () => void }> = [];

    scrollElements.forEach(({ ref, content }) => {
      if (ref.current && content) {
        const element = ref.current;
        const elementId = content;
        
        setTimeout(() => {
          const scrollWidth = element.scrollWidth;
          const clientWidth = element.clientWidth;

          if (scrollWidth > clientWidth) {
            let scrollPosition = 0;
            const scrollSpeed = 1;
            const pauseTime = 2000;
            const scrollInterval = 50;
            let isPaused = false;
            let pauseCounter = 0;
            let direction = 1;
            let lastScrollLeft = 0;

            isPaused = true;
            pauseCounter = pauseTime / scrollInterval;

            // Handle manual scrolling - pause auto-scroll when user scrolls
            const handleManualScroll = () => {
              const currentScrollLeft = element.scrollLeft;
              if (Math.abs(currentScrollLeft - lastScrollLeft) > 2) {
                // User is manually scrolling
                isManuallyScrolling[elementId] = true;
                scrollPosition = currentScrollLeft;
                
                // Resume auto-scroll after 3 seconds of no manual scrolling
                clearTimeout(manualScrollTimeouts.find(t => t) as any);
                const timeout = setTimeout(() => {
                  isManuallyScrolling[elementId] = false;
                  lastScrollLeft = element.scrollLeft;
                  scrollPosition = lastScrollLeft;
                }, 3000);
                manualScrollTimeouts.push(timeout);
              }
              lastScrollLeft = currentScrollLeft;
            };

            element.addEventListener('scroll', handleManualScroll);
            element.addEventListener('touchstart', handleManualScroll);
            element.addEventListener('mousedown', handleManualScroll);
            
            eventListeners.push(
              { element, event: 'scroll', handler: handleManualScroll },
              { element, event: 'touchstart', handler: handleManualScroll },
              { element, event: 'mousedown', handler: handleManualScroll }
            );

            const interval = setInterval(() => {
              // Don't auto-scroll if user is manually scrolling
              if (isManuallyScrolling[elementId]) {
                return;
              }

              if (isPaused) {
                pauseCounter--;
                if (pauseCounter <= 0) {
                  isPaused = false;
                }
                return;
              }

              scrollPosition += scrollSpeed * direction;
              
              if (direction === 1 && scrollPosition >= scrollWidth - clientWidth) {
                scrollPosition = scrollWidth - clientWidth;
                direction = -1;
                isPaused = true;
                pauseCounter = pauseTime / scrollInterval;
              } else if (direction === -1 && scrollPosition <= 0) {
                scrollPosition = 0;
                direction = 1;
                isPaused = true;
                pauseCounter = pauseTime / scrollInterval;
              }
              
              element.scrollLeft = scrollPosition;
              lastScrollLeft = scrollPosition;
            }, scrollInterval);

            intervals.push(interval);
          }
        }, 100);
      }
    });

    return () => {
      intervals.forEach(interval => clearInterval(interval));
      manualScrollTimeouts.forEach(timeout => clearTimeout(timeout));
      eventListeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
      });
    };
  }, [ordersAnimationsEnabled, activeOrders, pastOrders, showMobileMenu, expandedOrderId]);

  // State for forcing re-render to update countdown
  const [_countdownTick, setCountdownTick] = useState(0);
  // Update countdown display every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdownTick(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Consult checkout: after 2h on PLACED, status becomes PROCESSING (persisted via userOrders sync effect)
  useEffect(() => {
    const tick = () => {
      setActiveOrders((prev) => advanceConsultOrdersPlacedToProcessing(prev));
      setPastOrders((prev) => advanceConsultOrdersPlacedToProcessing(prev));
    };
    tick();
    const interval = setInterval(tick, 60000);
    return () => clearInterval(interval);
  }, []);

  // Auto-cancel PLACED orders after 24h if the client never signed/submitted the auth form.
  // If they did submit (orderFormSigned + clientSubmitted, admin not approved yet), we show
  // "ORDER FORM PENDING ADMIN APPROVAL" and do NOT 24h-cancel—admin approve/decline handles it.
  useEffect(() => {
    const checkAndCancelExpired = () => {
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

      setActiveOrders((prevActive) => {
        const mapped = prevActive.map((order) => {
          if (
            order.status === 'PLACED' &&
            order.placedAt &&
            orderFormAwaitingAdminApproval(order as unknown as Record<string, unknown>)
          ) {
            return order;
          }
          if (
            order.status === 'PLACED' &&
            order.placedAt &&
            !order.orderFormSigned &&
            !orderUsesDigitalFulfillmentTimeline(order) &&
            orderNeedsClientAuthFormSignature(order as unknown as Record<string, unknown>)
          ) {
            const timeSincePlaced = now - order.placedAt;
            if (timeSincePlaced >= twentyFourHours) {
              return {
                ...order,
                status: 'CANCELED',
                canceledAt: now,
              };
            }
          }
          return order;
        });
        const toArchive = mapped.filter((o) => orderStatusIsCanceled(o.status));
        const nextActive = mapped.filter((o) => !orderStatusIsCanceled(o.status));
        if (toArchive.length > 0) {
          setPastOrders((prevPast) => {
            const ids = new Set(prevPast.map((o) => o.id).filter(Boolean) as string[]);
            const append = toArchive.filter((o) => !o.id || !ids.has(o.id));
            if (append.length === 0) return prevPast;
            return sortOrdersNewestFirst([...prevPast, ...append]);
          });
        }
        return sortOrdersNewestFirst(nextActive);
      });
    };

    // Check immediately
    checkAndCancelExpired();

    // Check every minute
    const interval = setInterval(checkAndCancelExpired, 60000);

    return () => clearInterval(interval);
  }, []);


  // Auto-archive delivered and canceled orders after 24 hours
  // If there are no active orders (excluding delivered), archive all delivered orders immediately
  useEffect(() => {
    const checkAndArchive = () => {
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

      setActiveOrders(prevActive => {
        const toArchive: Order[] = [];
        const toKeep: Order[] = [];

        // Check if there are any non-delivered active orders (digital "COMPLETE" counts as terminal)
        const hasNonDeliveredOrders = prevActive.some(
          (order) => order.status !== 'DELIVERED' && order.status !== 'COMPLETE'
        );

        prevActive.forEach(order => {
          // Archive DELIVERED orders after 24 hours OR immediately if no other active orders
          if (order.status === 'DELIVERED' && order.deliveredAt) {
            const timeSinceDelivered = now - order.deliveredAt;
            // Archive immediately if no other active orders, otherwise wait 24 hours
            if (!hasNonDeliveredOrders || timeSinceDelivered >= twentyFourHours) {
              // Move to archived
              toArchive.push(order);
            } else {
              toKeep.push(order);
            }
          }
          // Digital / A&C: archive COMPLETE after 24h from completedAt (or immediately if no other active orders)
          else if (order.status === 'COMPLETE' && order.completedAt) {
            const timeSince = now - order.completedAt;
            if (!hasNonDeliveredOrders || timeSince >= twentyFourHours) {
              toArchive.push(order);
            } else {
              toKeep.push(order);
            }
          }
          else if (orderStatusIsCanceled(order.status)) {
            toArchive.push(order);
          } else {
            toKeep.push(order);
          }
        });

        if (toArchive.length > 0) {
          setPastOrders(prevPast => {
            const existingIds = new Set(prevPast.map(o => o.id));
            const newOrders = toArchive.filter(o => !existingIds.has(o.id));
            if (newOrders.length === 0) return sortOrdersNewestFirst(prevPast);
            return sortOrdersNewestFirst([...prevPast, ...newOrders]);
          });
        }

        return sortOrdersNewestFirst(toKeep);
      });
    };

    // Check immediately
    checkAndArchive();

    // Check every hour
    const interval = setInterval(checkAndArchive, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    const currency = currencyRates[selectedCurrency as keyof typeof currencyRates] || currencyRates.USD;
    if (!currency) {
      const formatted = price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
      return `$${formatted}`;
    }
    const convertedPrice = price * currency.rate;
    const formattedPrice = convertedPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    return `${currency.symbol.replace('&#36;', '$').replace('&euro;', '€').replace('&pound;', '£').replace('&yen;', '¥').replace('&#8377;', '₹')}${formattedPrice}`;
  };

  /** 6- or 12-month premium subscription only (not 3-month); matches Concierge long-premium perks. */
  const showLongPremiumConciergeExtras = (user: { email?: string; membershipType?: string; subscriptionTier?: string } | null | undefined) => {
    if (!user) return false;
    const st = getEffectiveSubscriptionTier(user);
    return st === '6months' || st === '12months';
  };

  /** Points line on expanded card: use per-order checkout value when present; else estimate from order subtotal/total (not account lifetime balance). */
  const displayLoyaltyPointsForExpandedOrder = (order: Order): number => {
    const pe = (order as Order & { pointsEarned?: unknown }).pointsEarned;
    if (typeof pe === 'number' && Number.isFinite(pe)) return Math.round(pe);
    if (order.subtotal != null && Number.isFinite(Number(order.subtotal))) return Math.round(Number(order.subtotal));
    if (order.total != null && Number.isFinite(Number(order.total))) return Math.round(Number(order.total));
    return 0;
  };

  const ORDER_TRACK_BUBBLE_PX = 6;
  const orderTrackBubbleStyle = (filled: boolean, pulsate = false): React.CSSProperties => ({
    width: ORDER_TRACK_BUBBLE_PX,
    height: ORDER_TRACK_BUBBLE_PX,
    borderRadius: '50%',
    border: '1px solid #000',
    background: filled ? '#EB1C24' : '#fff',
    flexShrink: 0,
    boxSizing: 'border-box',
    ...(pulsate && filled && ordersAnimationsEnabled ? { animation: ORDER_TRACKING_PULSATE_ANIMATION } : {}),
  });

  const orderTrackStepLabelStyle = (isCurrent: boolean): React.CSSProperties => ({
    fontFamily: isCurrent ? '"Futura PT Medium"' : '"Futura PT Book"',
    fontSize: '9px',
    color: isCurrent ? '#EB1C24' : '#000',
    margin: 0,
    textTransform: 'uppercase',
    ...(isCurrent && ordersAnimationsEnabled ? { animation: ORDER_TRACKING_PULSATE_ANIMATION } : {}),
  });

  const closeConsultOfferModal = () => {
    setConsultOfferModalOpen(false);
    setConsultOfferModalQuote(null);
    setConsultOfferModalError(null);
    setConsultOfferModalLoading(false);
    setConsultOfferModalOrderLabel('');
  };

  const consultOfferQuoteIdForOrder = (order: Order): string => {
    const direct = String(order.consultQuoteId || '').trim();
    if (direct) return direct;
    return consultQuoteIdFromConsultOfferRoute(order.consultOfferRoute);
  };

  const openConsultOfferForOrder = (order: Order) => {
    const gen = ++consultOfferFetchGen.current;
    const quoteId = consultOfferQuoteIdForOrder(order);
    const snap = order.consultOfferSnapshot;
    const orderLabel =
      String(order.orderNumber || '')
        .trim()
        .toUpperCase() || `ORDER #${String(order.id || '').trim().toUpperCase()}`;

    const showSnapshot = () => {
      if (gen !== consultOfferFetchGen.current) return;
      if (!snap) {
        setConsultOfferModalError('OFFER NOT AVAILABLE.');
        setConsultOfferModalQuote(null);
        setConsultOfferModalLoading(false);
        setConsultOfferModalOrderLabel(orderLabel);
        setConsultOfferModalOpen(true);
        return;
      }
      const idForRow = quoteId || String(order.id || '').trim() || 'consult-offer';
      setConsultOfferModalError(null);
      setConsultOfferModalQuote(consultQuoteRowFromPersistedSnapshot(snap, idForRow));
      setConsultOfferModalLoading(false);
      setConsultOfferModalOrderLabel(orderLabel);
      setConsultOfferModalOpen(true);
    };

    const showError = () => {
      if (gen !== consultOfferFetchGen.current) return;
      setConsultOfferModalError('OFFER NOT AVAILABLE.');
      setConsultOfferModalQuote(null);
      setConsultOfferModalLoading(false);
      setConsultOfferModalOrderLabel(orderLabel);
      setConsultOfferModalOpen(true);
    };

    if (!quoteId && !snap) {
      showError();
      return;
    }

    if (!quoteId) {
      showSnapshot();
      return;
    }

    if (!isSupabaseConfigured()) {
      showSnapshot();
      return;
    }

    setConsultOfferModalOpen(true);
    setConsultOfferModalLoading(true);
    setConsultOfferModalError(null);
    setConsultOfferModalQuote(null);
    setConsultOfferModalOrderLabel(orderLabel);
    void (async () => {
      try {
        const res = await getConsultQuote(quoteId);
        if (gen !== consultOfferFetchGen.current) return;
        if (res?.quote) {
          const merged = mergeConsultQuoteWithPersistedThumbnail(
            res.quote as Record<string, unknown>,
            snap || undefined
          );
          setConsultOfferModalQuote(merged);
          setConsultOfferModalError(null);
        } else {
          showSnapshot();
          return;
        }
      } catch {
        if (gen !== consultOfferFetchGen.current) return;
        showSnapshot();
        return;
      } finally {
        if (gen === consultOfferFetchGen.current) setConsultOfferModalLoading(false);
      }
    })();
  };

  /** Compact order row: digital / A&C — no order-form line; no fake tracking; VIEW OFFER only when COMPLETE. */
  const renderDigitalFulfillmentAmountRowExtras = (order: Order) => {
    if (!orderUsesDigitalFulfillmentTimeline(order)) return null;
    const isConsultComplete =
      order.status === 'COMPLETE' && String(order.bookingFlowType || '').toLowerCase() === 'consult';
    const onOfferClick = () => {
      if (!isConsultComplete) return;
      openConsultOfferForOrder(order);
    };
    return (
      <>
        {isConsultComplete ? (
          <p
            role="button"
            style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', margin: 0, lineHeight: '1.2', cursor: 'pointer' }}
            onClick={onOfferClick}
          >
            <span style={{ color: '#000000' }}>CLICK </span>
            <span style={{ color: '#EB1C24' }}>HERE</span>
            <span style={{ color: '#000000' }}> TO VIEW OFFER</span>
          </p>
        ) : null}
      </>
    );
  };

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
      // Navigate to sign-in page
      navigate(signInHrefWithReturnTo(location));
    }
  };

  const handleSignOut = () => {
    setIsSignedIn(false);
    clearAppAuth();
    window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'false' }));
    setShowSignOutConfirm(false);
    setShowMobileMenu(false);
    navigate(signInHrefWithReturnTo(location));
  };

  // Sync isSignedIn state with localStorage and sign-in events
  useEffect(() => {
    const handleSignInStateChange = (event: CustomEvent) => {
      setIsSignedIn(event.detail === 'true');
    };

    window.addEventListener('signInStateChanged', handleSignInStateChange as EventListener);

    return () => {
      window.removeEventListener('signInStateChanged', handleSignInStateChange as EventListener);
    };
  }, []);

  // Expand order when returning from leave-review page (single-item REVIEW SUBMITTED)
  useEffect(() => {
    const expandId = (location.state as { expandOrderId?: string } | null)?.expandOrderId;
    if (expandId) {
      setExpandedOrderId(expandId);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  // Update mobile menu active tab based on current pathname when menu opens
  useEffect(() => {
    if (showMobileMenu) {
      const pathname = window.location.pathname;
      if (pathname.includes('/tools') || pathname === '/tools/gift-card') {
        setMobileMenuActiveTab('TOOLS');
      } else if (pathname.includes('/brand') || pathname.includes('/about') || pathname.includes('/contact') || pathname.includes('/faq') || pathname.includes('/reviews') || pathname.includes('/terms')) {
        setMobileMenuActiveTab('BRAND');
      } else {
        setMobileMenuActiveTab('SHOP');
      }
    }
  }, [showMobileMenu]);

  return (
    <div className="min-h-screen" style={{ position: 'relative' }}>
      <style>{ORDER_TRACKING_PULSATE_KEYFRAMES_CSS}</style>
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
                    onClick={() => navigate(-1)} 
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
                </>
              )}
            </div>

            {/* Text in the middle */}
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
                    style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '400' }}
                  >
                    MENU
                  </span>
                </>
              ) : (
                <>
                  <span 
                    style={{ fontFamily: '"Futura PT Book"', fontWeight: '400', cursor: 'pointer' }}
                    onClick={() => navigate('/account')}
                  >
                    ACCOUNT &gt;
                  </span>{' '}
                  <span
                    style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '400' }}
                  >
                    ORDERS
                  </span>
                </>
              )}
            </p>

            {/* Right side icons */}
            <div className="gap-5 flex absolute" style={{ right: '17px' }}>
              <div style={{ transform: `translateX(${cartCount === 0 ? 7 : 5}px)` }}>
                <DynamicCartIcon count={cartCount} width={22} height={19} variant="nav" />
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

          {/* CONTENT */}
          <div
            className="flex flex-col pb-4 mb-2 w-full"
            style={{ 
              minWidth: '100%', 
              maxWidth: 'none', 
              overflow: 'visible',
              minHeight: showMobileMenu ? '560px' : 'auto'
            }}
          >
            {showMobileMenu ? (
              /* MENU CONTENT */
              <div
                className="border border-black flex flex-col pt-6 pb-4 px-5 bg-white/60 backdrop-blur-sm w-full"
                style={{ 
                  borderWidth: '1.3px', 
                  minWidth: '100%', 
                  maxWidth: 'none', 
                  overflow: 'visible',
                  backgroundColor: 'rgba(255, 255, 255, 0.6)',
                  minHeight: MENU_TOGGLE_PANEL_HEIGHT,
                  height: MENU_TOGGLE_PANEL_HEIGHT
                }}
              >
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

                {/* Menu Items - Fixed height with scroll if needed */}
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
                      // SHOP tab with dropdown functionality
                                            <ShopMobileMenuShopTab
                                              navigate={navigate}
                                              mobileMenuExpandedItems={mobileMenuExpandedItems}
                                              handleMobileMenuItemToggle={handleMobileMenuItemToggle}
                                              closeSubItemMenu={() => setShowMobileMenu(false)}
                                              labelTranslateX="13px"
                                            />
                    )}
                  </div>
          </div>

                {/* Sign In/Out - Fixed at bottom */}
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

                {/* Social Media Icons - Fixed at bottom */}
                <div style={{ marginBottom: '20px' }}><SocialMenuIcons /></div>
                </div>
              </div>
            ) : (
              /* ORDERS CONTENT */
          <div className="flex flex-col gap-4 mb-5">
            {/* Active Orders Card - Hide when archived order is expanded; same height as account alerts card when no archived orders */}
            {!(expandedOrderId && pastOrders.find(o => o.id === expandedOrderId)) && (
            <div className="bg-white/60 backdrop-blur-sm border border-black p-4 flex flex-col overflow-hidden transition-all duration-300 ease-out" style={{ borderWidth: '1.3px', minHeight: pastOrders.length === 0 ? '560px' : '360px' }}>
                {/* Header */}
                <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200">
                  {expandedOrderId ? (
                    <>
                      <button
                        className="text-red-500 font-bold text-lg tracking-wider truncate hover:text-red-600 transition-colors text-left uppercase"
                        style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '12px', fontWeight: '500' }}
                      >
                        {(activeOrders.find(o => o.id === expandedOrderId) || pastOrders.find(o => o.id === expandedOrderId))?.orderNumber || 'ORDER'}
                      </button>
                      <button
                        onClick={() => setExpandedOrderId(null)}
                        style={{ 
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <img
                          src="/assets/close-icon.svg"
                          alt="Close"
                          style={{
                            width: '16px',
                            height: '16px',
                            filter: 'brightness(0) saturate(100%) invert(20%) sepia(93%) saturate(7151%) hue-rotate(346deg) brightness(92%) contrast(92%)'
                          }}
                        />
                      </button>
                    </>
                  ) : (
                    <>
                  <button
                    className="text-red-500 font-bold text-lg tracking-wider truncate hover:text-red-600 transition-colors text-left uppercase"
                    style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '12px', fontWeight: '500' }}
                  >
                    ACTIVE ORDERS
                  </button>
                  <span
                    className="text-black font-bold text-lg flex-shrink-0 ml-2 uppercase"
                    style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', fontSize: '17px' }}
                  >
                    {activeOrders.length}
                  </span>
                    </>
                  )}
                </div>

                 {/* Body */}
                 <div className="flex-1 flex flex-col overflow-hidden mt-2">
                   {(() => {
                     const expandedOrder = activeOrders.find(o => o.id === expandedOrderId) || pastOrders.find(o => o.id === expandedOrderId);
                     if (expandedOrderId && expandedOrder) {
                       // Products for horizontal scroll: use lineItems when present (with options), else one per order.items
                         const orderAmount = (expandedOrder.subtotal != null ? expandedOrder.subtotal : expandedOrder.total);
const orderProducts = expandedOrder.lineItems && expandedOrder.lineItems.length > 0
                          ? expandedOrder.lineItems.map((line, i) => ({
                              id: `${expandedOrder.id}-product-${i}`,
                              name: line.productName,
                              image: getProductImage(line.productName),
                              price: line.subtotal != null ? line.subtotal : orderAmount / expandedOrder.lineItems!.length,
                              options: line.options
                            }))
                           : Array.from({ length: expandedOrder.items }, (_, i) => ({
                               id: `${expandedOrder.id}-product-${i}`,
                               name: expandedOrder.productName,
                               image: ordersPageOrderThumbnailSrc(expandedOrder),
                               price: orderAmount / expandedOrder.items,
                               options: undefined as Record<string, string> | undefined
                             }));
                         return (
                         <div className="flex flex-col gap-6" style={{ marginTop: '10px' }}>
                           {/* Products Horizontal Scroll: black product name, red RAW line, gray price, black details (non-default only) */}
                           <div 
                             className="relative overflow-x-auto"
                             style={{ 
                               minHeight: '180px',
                               height: 'auto',
                               marginBottom: '20px',
                               display: 'flex',
                               justifyContent: orderProducts.length === 1 ? 'center' : 'flex-start'
                             }}
                           >
                             <div
                               className="flex"
                               style={{
                                 gap: '20px',
                                 minHeight: '180px',
                                 alignItems: 'flex-start',
                                 justifyContent: orderProducts.length === 1 ? 'center' : orderProducts.length === 2 ? 'center' : 'flex-start',
                                 paddingRight: '10px',
                                 paddingLeft: orderProducts.length >= 3 ? 'calc(50% - 160px)' : undefined,
                                 marginLeft: orderProducts.length === 1 ? 0 : orderProducts.length >= 2 ? '-10px' : undefined,
                               }}
                             >
                              {orderProducts.map((product) => {
                                const opts = product.options || {};
                                const lengthVal = opts.length || '24"';
                                const isAcExpanded =
                                  expandedOrder.bookingFlowType === 'appointment' ||
                                  expandedOrder.bookingFlowType === 'consult';
                                const nonDefaultDetails = getNonDefaultDetailLines(product.name, opts, isAcExpanded);
                                const expandedProductThumbPx = isAcExpanded
                                    ? ORDER_AC_EXPANDED_PRODUCT_THUMB_PX
                                    : ORDER_EXPANDED_PRODUCT_THUMB_PX;
                                return (
                                <div
                                  key={product.id}
                                  className="flex-shrink-0"
                                  style={{
                                     width: '150px',
                                     minHeight: '150px',
                                     display: 'flex',
                                     flexDirection: 'column',
                                     alignItems: 'center',
                                     justifyContent: 'center',
                                     padding: '8px'
                                   }}
                                 >
                                   <img
                                     src={product.image}
                                     alt={product.name}
                                     onClick={() => navigate(getProductRoute(product.name))}
                                     style={{
                                       width: `${expandedProductThumbPx}px`,
                                       height: `${expandedProductThumbPx}px`,
                                       objectFit: 'contain',
                                       cursor: 'pointer',
                                       ...(isAcExpanded ? { transform: `translateY(${ORDER_AC_THUMB_TRANSLATE_Y_PX}px)` } : {}),
                                     }}
                                   />
                                   <p
                                     style={{
                                       fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                                       fontSize: product.name === 'NOIR' ? '22px' : '21px',
                                       color: '#000000',
                                       marginTop: '4px',
                                       marginBottom: '0',
                                       textTransform: 'uppercase',
                                       textAlign: 'center',
                                       lineHeight: '1.1'
                                     }}
                                   >
                                     {product.name.replace(/WIG/gi, '').trim()}
                                   </p>
                                   <p
                                     style={{
                                       fontFamily: '"Futura PT Medium", Futura, Inter, sans-serif',
                                       fontSize: '9px',
                                       color: '#EB1C24',
                                       marginTop: '3px',
                                       marginBottom: 0,
                                       textTransform: 'uppercase',
                                       textAlign: 'center',
                                       lineHeight: '1.1'
                                     }}
                                   >
                                     {`${lengthVal} RAW ${getHairOrigin(product.name)}`}
                                   </p>
                                   <p
                                     style={{
fontFamily: '"Futura PT Demi", Futura, Inter, sans-serif',
                                      fontSize: '9px',
                                      color: '#808080',
                                      marginTop: '6px',
                                       marginBottom: 0,
                                       textTransform: 'uppercase',
                                       textAlign: 'center',
                                       lineHeight: '1.1'
                                     }}
                                   >
                                     {formatPrice(product.price)} {selectedCurrency}
                                   </p>
{nonDefaultDetails.length > 0 ? (
                                    <div style={{ marginTop: '4px', textAlign: 'center' }}>
                                      {nonDefaultDetails.map((line, idx) => (
                                        <div
                                          key={idx}
                                          style={{
                                            fontFamily: '"Futura PT Book", Futura, Inter, sans-serif',
                                            fontSize: '9px',
                                            color: '#000000',
                                            marginTop: idx === 0 ? 0 : '4px',
                                            marginBottom: 0,
                                            textTransform: 'uppercase',
                                            lineHeight: '1.2'
                                          }}
                                        >
                                          {line}
                                        </div>
                                      ))}
                                    </div>
                                   ) : null}
                                 </div>
                               ); })}
                             </div>
                           </div>
                           
                           {/* ORDER SUMMARY */}
                           <div style={{ marginBottom: '20px' }}>
                             <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '10px', marginTop: '-12px' }}>
                               <h2
                                 style={{
                                   fontFamily: '"Futura PT Medium"',
                                   fontSize: '12px',
                                   color: '#EB1C24',
                                   fontWeight: '500',
                                   textTransform: 'uppercase',
                                   margin: '0'
                                 }}
                               >
                                 ORDER SUMMARY
                               </h2>
                               <img src={summaryIcon} alt="" style={{ width: 12.75, height: 12.75, opacity: 1 }} />
                             </div>
                             <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                 <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>
                                   ORDER DATE
                                 </span>
                                 <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>
                                   {expandedOrder.date}
                                 </span>
                               </div>
                               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                 <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>
                                   ORDER NUMBER
                                 </span>
                                 <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>
                                   {expandedOrder.orderNumber.replace(/^ORDER\s+/i, '')}
                                 </span>
                               </div>
                               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                 <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>
                                   ORDER TOTAL
                                 </span>
                                 <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>
                                   {formatPrice(expandedOrder.total)} {selectedCurrency}
                                 </span>
                               </div>
                             </div>
                           </div>
                           
                           {/* SHIPPING — hidden for digital / A&C orders */}
                           {currentUser && !orderUsesDigitalFulfillmentTimeline(expandedOrder) && (
                             <div style={{ marginBottom: '20px' }}>
                               <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '10px', marginTop: '-12px' }}>
                                 <h2
                                   style={{
                                     fontFamily: '"Futura PT Medium"',
                                     fontSize: '12px',
                                     color: '#EB1C24',
                                     fontWeight: '500',
                                     textTransform: 'uppercase',
                                     margin: '0'
                                   }}
                                 >
                                   SHIPPING
                                 </h2>
                                 <img src="/assets/ship-icon.svg" alt="" style={{ width: 12.75, height: 12.75, opacity: 1 }} />
                               </div>
                               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                   <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>
                                     COMPLETION TIMELINE
                                   </span>
                                   <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>
                                     {expandedOrder.date ? calculateProcessingTimeline(expandedOrder.date, (expandedOrder as any).processingTime || '6-8 WEEKS') : ((expandedOrder as any).processingTime || '6-8 WEEKS')}
                                   </span>
                                 </div>
                                 {expandedOrder.trackingNumber && (() => {
                                   const trackingUrl = getCarrierTrackingUrl(
                                     (expandedOrder as Order).trackingCarrier,
                                     expandedOrder.trackingNumber
                                   );
                                   return (
                                     <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                       <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>
                                         TRACKING NUMBER
                                       </span>
                                       <a href={trackingUrl} target="_blank" rel="noopener noreferrer" style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#808080', textTransform: 'uppercase', cursor: 'pointer' }}>
                                         {expandedOrder.trackingNumber}
                                       </a>
                                     </div>
                                   );
                                 })()}
                                 {(() => {
                                   const shipCountry = currentUser.defaultAddress?.country || currentUser.shippingAddress?.country || '';
                                   const isDomestic = !shipCountry || /^US$|^USA$|^UNITED\s*STATES$/i.test(String(shipCountry).trim());
                                   const carrierFromOrder = (expandedOrder as Order).trackingCarrier?.trim();
                                   const carrierLabel = carrierFromOrder
                                     ? carrierFromOrder.toUpperCase()
                                     : isDomestic
                                       ? 'DOMESTIC'
                                       : 'INTERNATIONAL';
                                   return (
                                     <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                       <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>
                                         CARRIER
                                       </span>
                                       <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>
                                         {carrierLabel}
                                       </span>
                                     </div>
                                   );
                                 })()}
                                 <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', margin: '0', textTransform: 'uppercase' }}>
                                   {currentUser.firstName || ''} {currentUser.lastName || ''}
                                 </p>
                                 <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', margin: '0', textTransform: 'uppercase' }}>
                                   {currentUser.defaultAddress?.address || currentUser.shippingAddress?.address || ''}
                                 </p>
                                 <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', margin: '0', textTransform: 'uppercase' }}>
                                   {currentUser.defaultAddress?.city || currentUser.shippingAddress?.city || ''}, {currentUser.defaultAddress?.state || currentUser.shippingAddress?.state || ''} {currentUser.defaultAddress?.zip || currentUser.shippingAddress?.zip || ''}
                                 </p>
                                 <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', margin: '0', textTransform: 'uppercase' }}>
                                   {formatCountryDisplay(currentUser.defaultAddress?.country || currentUser.shippingAddress?.country)}
                                 </p>
                               </div>
                             </div>
                           )}

                           {expandedOrder.status !== 'CANCELED' && expandedOrder.status !== 'CANCELLED' && orderUsesDigitalFulfillmentTimeline(expandedOrder) && (
                               <div style={{ marginBottom: '20px' }}>
                                 <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '10px', marginTop: '-12px' }}>
                                   <h2 style={{ fontFamily: '"Futura PT Medium"', fontSize: '12px', color: '#EB1C24', fontWeight: '500', textTransform: 'uppercase', margin: '0' }}>
                                     ORDER STATUS
                                   </h2>
                                   <img src="/assets/order-tracking.svg" alt="" style={{ width: 18, height: 18, filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)' }} />
                                 </div>
                                 {!(
                                   expandedOrder.bookingFlowType === 'appointment' ||
                                   expandedOrder.bookingFlowType === 'consult'
                                 ) && (
                                   <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#666', margin: '0 0 10px 0', textTransform: 'uppercase', lineHeight: 1.45 }}>
                                     DIGITAL SERVICE — NO SHIPPING OR ORDER FORM. STATUS UPDATES HERE.
                                   </p>
                                 )}
                                 {(() => {
                                   void _countdownTick;
                                   const di = getDigitalFulfillmentStageIndex(expandedOrder);
                                   const labels = digitalFulfillmentStageLabels();
                                   const consultBarPct = consultDigitalOrderTrackingBarFillPct(
                                     expandedOrder,
                                     Date.now()
                                   );
                                   return (
                                     <>
                                     <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
                                       {labels.map((label, i) => {
                                         const isCurrent = i === di;
                                         return (
                                           <div
                                             key={`${expandedOrder.id}-dig-${i}`}
                                             style={{
                                               display: 'flex',
                                               alignItems: 'center',
                                               gap: '6px',
                                               margin: 0
                                             }}
                                           >
                                             <span style={orderTrackBubbleStyle(isCurrent, isCurrent)} aria-hidden />
                                             <p style={orderTrackStepLabelStyle(isCurrent)}>{label}</p>
                                           </div>
                                         );
                                       })}
                                     </div>
                                     {consultBarPct != null && (
                                       <div style={{ marginTop: '12px' }}>
                                         <div
                                           style={{
                                             width: '100%',
                                             height: '7px',
                                             backgroundColor: '#E0E0E0',
                                             borderRadius: consultBarPct > 0 ? '4px' : '0',
                                             overflow: 'hidden',
                                             border: consultBarPct === 0 ? '1px solid #808080' : 'none',
                                             boxSizing: 'border-box',
                                           }}
                                         >
                                           <div
                                             style={{
                                               width: `${consultBarPct}%`,
                                               height: '100%',
                                               backgroundColor: '#EB1C24',
                                               transition: 'width 0.3s ease',
                                               borderRadius: consultBarPct > 0 ? '4px' : '0',
                                             }}
                                           />
                                         </div>
                                       </div>
                                     )}
                                     </>
                                   );
                                 })()}
                               </div>
                           )}
                           
                           {/* PAYMENT */}
                           {currentUser && (
                             <div style={{ marginBottom: '20px' }}>
                               <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '10px', marginTop: '-12px' }}>
                                 <h2
                                   style={{
                                     fontFamily: '"Futura PT Medium"',
                                     fontSize: '12px',
                                     color: '#EB1C24',
                                     fontWeight: '500',
                                     textTransform: 'uppercase',
                                     margin: '0'
                                   }}
                                 >
                                   PAYMENT
                                 </h2>
                                 <img src="/assets/payment-icon.svg" alt="" style={{ width: 14.25, height: 14.25, opacity: 1 }} />
                               </div>
                               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                 {(() => {
                                   let methodName = '';
                                   let last4 = '';
                                   const fromOrder = (expandedOrder as any)?.paymentMethod;
                                   if (fromOrder) {
                                     const endingMatch = String(fromOrder).match(/ENDING IN (\d+)/i);
                                     last4 = endingMatch ? endingMatch[1] : '';
                                     let brandPart = String(fromOrder).replace(/\s*ENDING IN \d+.*$/i, '').trim().replace(/_/g, ' ');
                                     methodName = (brandPart === 'EXPRESS' ? 'AMERICAN EXPRESS' : brandPart).toUpperCase();
                                   }
                                   if (!methodName || !last4) {
                                     const def = currentUser.defaultPaymentMethod;
                                     if (def && def.cardNumber) {
                                       last4 = String(def.cardNumber).replace(/\D/g, '').slice(-4);
                                       const b = (def.cardBrand || '').toUpperCase().replace(/_/g, ' ');
                                       methodName = (b === 'EXPRESS' || b === 'AMEX') ? 'AMERICAN EXPRESS' : (b || 'CARD');
                                     }
                                   }
                                   if (!methodName) methodName = 'CARD';
                                   if (!last4) last4 = '****';
                                   return (
                                     <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                       <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>
                                         {methodName}
                                       </span>
                                       <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>
                                         ENDING IN {last4}
                                       </span>
                                     </div>
                                   );
                                 })()}
                                 {((expandedOrder as any).discountCode ?? (expandedOrder as any).discount_code ?? (expandedOrder as any).discount) && (
                                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                     <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>DISCOUNT CODE</span>
                                     <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>{String((expandedOrder as any).discountCode ?? (expandedOrder as any).discount_code ?? (expandedOrder as any).discount).toUpperCase()}</span>
                                   </div>
                                 )}
                                 {((expandedOrder as any).giftCard ?? (expandedOrder as any).gift_card ?? (expandedOrder as any).giftCardNumber ?? (expandedOrder as any).giftCardCode) && (
                                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                     <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>GIFT CARD</span>
                                     <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>{String((expandedOrder as any).giftCard ?? (expandedOrder as any).gift_card ?? (expandedOrder as any).giftCardNumber ?? (expandedOrder as any).giftCardCode).toUpperCase()}</span>
                                   </div>
                                 )}
                                 {((expandedOrder as any).referralCode ?? (expandedOrder as any).referral_code) && (
                                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                     <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>REFERRAL CODE</span>
                                     <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>{String((expandedOrder as any).referralCode ?? (expandedOrder as any).referral_code).toUpperCase()}</span>
                                   </div>
                                 )}
                                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                   <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>
                                     CONFIRMATION EMAIL
                                   </span>
                                   <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>
                                     {currentUser.email || ''}
                                   </span>
                                 </div>
                                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                   <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>
                                     CONFIRMATION NUMBER
                                   </span>
                                   <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>
                                     #{(() => {
                                       const orderNum = expandedOrder.orderNumber?.replace(/^ORDER\s+/i, '').trim();
                                       const key = orderNum ? (orderNum.startsWith('#') ? orderNum : `#${orderNum}`) : null;
                                       if (key) {
                                         const orderConfirmations = JSON.parse(localStorage.getItem('orderConfirmations') || '{}');
                                         const stored = orderConfirmations[key] || orderConfirmations[expandedOrder.orderNumber];
                                         if (stored) return stored;
                                       }
                                       const onOrder = (expandedOrder as any).confirmationNumber;
                                       if (onOrder) return onOrder;
                                       const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                                       const seed = orderNum ? orderNum.replace(/\D/g, '') : '0';
                                       let hash = 0;
                                       for (let i = 0; i < seed.length; i++) hash = ((hash << 5) - hash) + seed.charCodeAt(i);
                                       let gen = '';
                                       for (let i = 0; i < 6; i++) { const idx = Math.abs((hash + i) % chars.length); gen += chars[idx]; }
                                       return gen;
                                     })()}
                                   </span>
                                 </div>
                               </div>
                             </div>
                           )}
                           {expandedOrder.status !== 'CANCELED' &&
                             expandedOrder.status !== 'CANCELLED' &&
                             !orderUsesDigitalFulfillmentTimeline(expandedOrder) &&
                             currentUser &&
                             showLongPremiumConciergeExtras(currentUser) && (
                               <div style={{ marginBottom: '20px' }}>
                                 <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '10px', marginTop: '-12px' }}>
                                   <h2 style={{ fontFamily: '"Futura PT Medium"', fontSize: '12px', color: '#EB1C24', fontWeight: '500', textTransform: 'uppercase', margin: '0' }}>
                                     ORDER TRACKING
                                   </h2>
                                   <img src="/assets/order-tracking.svg" alt="" style={{ width: 18, height: 18, filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)' }} />
                                 </div>
                                 {(() => {
                                   const st = getOrderTrackingStageFromOrder(expandedOrder as unknown as Record<string, unknown>);
                                   const shift = Number((expandedOrder as Order).trackingTimelineShiftDays) || 0;
                                   const ordRec = expandedOrder as unknown as Record<string, unknown>;
                                   const deliveredRowCurrent = orderTrackingDeliveredRowIsCurrent(ordRec, st);
                                   return (
                                     <>
                                       {shift !== 0 && (
                                         <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#808080', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
                                           TIMELINE ADJUSTMENT: {shift > 0 ? `+${shift}` : shift} DAY{Math.abs(shift) === 1 ? '' : 'S'}
                                         </p>
                                       )}
                                       <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
                                         {ORDER_TRACKING_STAGE_LABELS.map((label, i) => {
                                           const note = (expandedOrder as Order).trackingStageNotes?.[String(i)]?.trim();
                                           const isCurrent = orderTrackingStageRowIsCurrent(ordRec, i, st);
                                           return (
                                             <div key={`${expandedOrder.id}-st-${i}`}>
                                               <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                 <span style={orderTrackBubbleStyle(isCurrent, isCurrent)} aria-hidden />
                                                 <p style={orderTrackStepLabelStyle(isCurrent)}>{label}</p>
                                               </div>
                                               {note ? (
                                                 <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#666', margin: '2px 0 0 0', textTransform: 'uppercase', lineHeight: 1.35, paddingLeft: `${ORDER_TRACK_BUBBLE_PX + 6}px` }}>
                                                   {note}
                                                 </p>
                                               ) : null}
                                             </div>
                                           );
                                         })}
                                         {orderShowsDeliveredTrackingLine(ordRec) ? (
                                           <div key={`${expandedOrder.id}-st-delivered`}>
                                             <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                               <span style={orderTrackBubbleStyle(deliveredRowCurrent, deliveredRowCurrent)} aria-hidden />
                                               <p style={orderTrackStepLabelStyle(deliveredRowCurrent)}>DELIVERED</p>
                                             </div>
                                           </div>
                                         ) : null}
                                       </div>
                                     </>
                                   );
                                 })()}
                               </div>
                             )}
                           {/* REWARDS */}
                           {currentUser && (
                             <div style={{ marginBottom: '5px' }}>
                               <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '10px', marginTop: '-12px' }}>
                                 <h2 style={{ fontFamily: '"Futura PT Medium"', fontSize: '12px', color: '#EB1C24', fontWeight: '500', textTransform: 'uppercase', margin: '0' }}>
                                   REWARDS
                                 </h2>
                                 <img src="/assets/rewards-icon.svg" alt="" style={{ width: 15, height: 15, opacity: 1, filter: 'invert(27%) sepia(98%) saturate(7151%) hue-rotate(346deg) brightness(92%) contrast(92%)' }} />
                               </div>
                               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                   <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', margin: '0', textTransform: 'uppercase' }}>
                                     {(() => {
                                       const pts = displayLoyaltyPointsForExpandedOrder(expandedOrder);
                                       return (
                                         <>
                                           YOU'VE EARNED <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"' }}>{pts.toLocaleString()}</span> LOYALTY POINTS{pts === 0 ? '.' : '!'}
                                         </>
                                       );
                                     })()}
                                   </p>
                                   <span style={{
                                     fontFamily: ((expandedOrder as any).tier || currentUser?.tier || 'SILVER').toUpperCase() === 'RED' || ((expandedOrder as any).tier || currentUser?.tier || 'SILVER').toUpperCase() === 'GOLD' ? '"Futura PT Medium"' : '"Futura PT Demi"',
                                     fontSize: '10px',
                                     color: (() => { const t = ((expandedOrder as any).tier || currentUser?.tier || 'SILVER').toUpperCase(); if (t === 'RED') return '#EB1C24'; if (t === 'SILVER') return '#808080'; if (t === 'GOLD') return '#000000'; return '#808080'; })(),
                                     textTransform: 'uppercase'
                                   }}>
                                     {((expandedOrder as any).tier || currentUser?.tier || 'SILVER').toUpperCase()} TIER
                                   </span>
                                 </div>
                               </div>
                             </div>
                           )}
                         </div>
                       );
                   }
                   if (activeOrders.length === 0) {
                     return (
                     <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 20px', color: '#000' }}>
                       <p
                         style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '11px', color: '#808080', textTransform: 'uppercase', margin: '0' }}
                         dangerouslySetInnerHTML={{ __html: "YOU DON'T HAVE ANY ACTIVE ORDERS.<br>LET'S GO SHOPPING!" }}
                       />
                     </div>
                     );
                   }
                   return (
                   <div className="flex flex-col justify-start items-start gap-4 my-2 flex-shrink-0 overflow-y-auto" style={{ maxHeight: '265px', scrollBehavior: 'smooth' }}>
                     {activeOrders.map((order) => (
                       <div key={order.id} className="flex items-center gap-3" style={{ flexShrink: 0 }}>
                         {/* Thumbnail */}
                         <div style={ORDER_LIST_THUMB_SLOT_STYLE}>
                           <button
                             onClick={() => setExpandedOrderId(order.id === expandedOrderId ? null : order.id)}
                             style={ordersPageListThumbButtonStyleForOrder(order)}
                           >
                             <img
                               src={ordersPageOrderThumbnailSrc(order)}
                               alt={order.productName}
                               style={{
                                 width: `${ordersPageListThumbnailSizePx(order)}px`,
                                 height: `${ordersPageListThumbnailSizePx(order)}px`,
                                 objectFit: 'contain'
                               }}
                             />
                           </button>
                           {order.bookingFlowType !== 'appointment' && order.bookingFlowType !== 'consult' && (
                           <p
                             style={{
                               fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                               color: '#EB1C24',
                               fontSize: '12px',
                               margin: `${ordersPageListItemsLabelMarginTopPx()}px 0 0 0`,
                               textTransform: 'uppercase',
                               textAlign: 'center',
                               width: '100%',
                             }}
                           >
                             {order.items} {order.items === 1 ? 'ITEM' : 'ITEMS'}
                           </p>
                           )}
                         </div>
                         
                         {/* Order Context Text */}
                         <div className="flex flex-col gap-1" style={{ flexShrink: 0, transform: 'translateY(-6px)' }}>
                           <p style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', fontSize: '13px', color: '#000000', margin: 0, lineHeight: '1.2' }}>
                             {order.date}
                           </p>
                           <p 
                             onClick={() => setExpandedOrderId(order.id === expandedOrderId ? null : order.id)}
                             style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', color: '#EB1C24', margin: 0, lineHeight: '1.2', cursor: 'pointer' }}
                           >
                             {order.orderNumber}
                           </p>
                           <p style={{ fontFamily: '"Futura PT Demi", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', color: '#808080', margin: 0, lineHeight: '1.2' }}>
                             {formatPrice(order.total)} {selectedCurrency}
                           </p>
                           <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', margin: 0, lineHeight: '1.2' }}>
                             <span style={{ color: '#EB1C24' }}>STATUS: </span>
                             <span style={{ 
                               color: (order.status === 'CONFIRMED' || order.status === 'SHIPPED' || order.status === 'DELIVERED' || order.status === 'COMPLETE' || order.status === 'CANCELED' || order.status === 'PROCESSING') ? '#EB1C24' : '#808080',
                               fontFamily: (order.status === 'CONFIRMED' || order.status === 'SHIPPED' || order.status === 'DELIVERED' || order.status === 'COMPLETE' || order.status === 'CANCELED' || order.status === 'PROCESSING') ? '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' : '"Futura PT Demi", futuristic-pt, Futura, Inter, sans-serif'
                             }}>{order.status}</span>
                           </p>
                           {renderDigitalFulfillmentAmountRowExtras(order)}
                           {order.status === 'PLACED' &&
                             orderFormAwaitingAdminApproval(order as unknown as Record<string, unknown>) &&
                             orderNeedsClientAuthFormSignature(order as unknown as Record<string, unknown>) && (
                             <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', color: '#000000', margin: 0, lineHeight: '1.2' }}>
                               ORDER FORM PENDING ADMIN APPROVAL
                             </p>
                           )}
                           {order.status === 'PLACED' &&
                             order.placedAt &&
                             !order.orderFormSigned &&
                             !orderUsesDigitalFulfillmentTimeline(order) &&
                             orderNeedsClientAuthFormSignature(order as unknown as Record<string, unknown>) && (
                             <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', margin: 0, lineHeight: '1.2', cursor: 'pointer' }} onClick={() => {
                              let customerData: any = {};
                              const orderNumber = order.orderNumber.replace(/^ORDER\s+/i, '');
                              if (currentUser) {
                                customerData = {
                                  orderId: order.id,
                                  orderNumber: orderNumber,
                                  orderDate: order.date,
                                  firstName: currentUser.firstName || '',
                                  lastName: currentUser.lastName || '',
                                  email: currentUser.email || '',
                                  shippingAddress: currentUser.defaultAddress?.address || currentUser.shippingAddress?.address || '',
                                  city: currentUser.defaultAddress?.city || currentUser.shippingAddress?.city || '',
                                  state: currentUser.defaultAddress?.state || currentUser.shippingAddress?.state || '',
                                  zip: currentUser.defaultAddress?.zip || currentUser.shippingAddress?.zip || '',
                                  country: currentUser.defaultAddress?.country || currentUser.shippingAddress?.country || 'UNITED STATES'
                                };
                              } else {
                                customerData = { orderId: order.id, orderNumber: orderNumber, orderDate: order.date };
                              }
                              navigate('/tools/order-form', {
                                state: {
                                  ...customerData,
                                  giftCardIdentityVerificationOnly: (order as { requiresGiftCardIdentityForm?: boolean }).requiresGiftCardIdentityForm === true,
                                },
                              });
                             }}>
                               <span style={{ color: '#000000' }}>CLICK </span>
                               <span style={{ color: '#EB1C24' }}>HERE</span>
                               <span style={{ color: '#000000' }}>
                                 {(order as { requiresGiftCardIdentityForm?: boolean }).requiresGiftCardIdentityForm
                                   ? ' TO VERIFY ID (ONE-TIME FOR GIFT CARDS)'
                                   : ' TO SIGN ORDER FORM'}
                               </span>
                             </p>
                           )}
                           {order.status === 'PLACED' &&
                             order.orderFormSigned &&
                             !orderFormAwaitingAdminApproval(order as unknown as Record<string, unknown>) &&
                             orderNeedsClientAuthFormSignature(order as unknown as Record<string, unknown>) && (
                             <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', color: '#000000', margin: 0, lineHeight: '1.2' }}>
                               {(order as { requiresGiftCardIdentityForm?: boolean }).requiresGiftCardIdentityForm
                                 ? 'GIFT CARD VERIFICATION ON FILE'
                                 : 'ORDER FORM IN REVIEW'}
                             </p>
                           )}
                           {!orderUsesDigitalFulfillmentTimeline(order) ? (
                             order.trackingNumber ? (
                               <div>
                                 <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10.5px', color: '#000000', margin: 0, lineHeight: '1.2', transform: 'translateY(-1px)' }}>
                                   <a href={getCarrierTrackingUrl(order.trackingCarrier, order.trackingNumber)} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', cursor: 'pointer' }}>
                                     {order.trackingNumber}
                                   </a>
                                 </p>
                                 <p style={{ fontFamily: '"Futura PT Demi", futuristic-pt, Futura, Inter, sans-serif', fontSize: '9px', color: '#808080', margin: 0, lineHeight: '1.2', transform: 'translateY(3px)' }}>
                                   TRACK VIA {currentUser && /^US$|^USA$|^UNITED\s*STATES$/i.test(String(currentUser.defaultAddress?.country || currentUser.shippingAddress?.country || 'US').trim()) ? 'DOMESTIC' : 'INTERNATIONAL'}
                                 </p>
                               </div>
                             ) : order.status === 'CONFIRMED' ? (
                               <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', color: '#000000', margin: 0, lineHeight: '1.2' }}>
                                 PROCESSING YOUR ORDER
                               </p>
                             ) : order.status === 'PREPARING' ? (
                               <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', margin: 0, lineHeight: '1.2' }}>
                                 <span style={{ color: '#000000' }}>CLICK </span>
                                 <span 
                                   style={{ color: '#EB1C24', cursor: 'pointer' }}
                                   onClick={() => {
                                     if (order.bookingFlowType === 'appointment' || order.bookingFlowType === 'consult') {
                                       setExpandedOrderId(order.id === expandedOrderId ? null : order.id);
                                       return;
                                     }
                                     // Check if user is premium member
                                     try {
                                       const isSignedIn = localStorage.getItem('isSignedIn') === 'true';
                                       if (isSignedIn) {
                                         const currentUser = localStorage.getItem('currentUser');
                                         if (currentUser) {
                                           const user = JSON.parse(currentUser);
                                           const isPremium = user?.membershipType === 'PREMIUM' || user?.membershipType === 'Premium';
                                           if (isPremium) {
                                             // Premium members: navigate to concierge page with order ID
                                             navigate(`/account/concierge?orderId=${order.id}`);
                                           } else {
                                             // Standard members: expand order on orders page
                                             setExpandedOrderId(order.id === expandedOrderId ? null : order.id);
                                           }
                                         } else {
                                           // Default to expanding order if user data not found
                                           setExpandedOrderId(order.id === expandedOrderId ? null : order.id);
                                         }
                                       } else {
                                         // Not signed in: expand order
                                         setExpandedOrderId(order.id === expandedOrderId ? null : order.id);
                                       }
                                     } catch (e) {
                                       // On error, default to expanding order
                                       setExpandedOrderId(order.id === expandedOrderId ? null : order.id);
                                     }
                                   }}
                                 >
                                   HERE
                                 </span>
                                 <span style={{ color: '#000000' }}> TO TRACK ORDER STATUS</span>
                               </p>
                             ) : order.status !== 'PLACED' && order.status !== 'CANCELED' && order.status !== 'COMPLETE' ? (
                               <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', color: '#000000', margin: 0, lineHeight: '1.2' }}>
                                 TRACKING LOADING
                               </p>
                             ) : null
                           ) : null}
                         </div>
                       </div>
                     ))}
                   </div>
                   );
                  })()}
                 </div>

                {/* Scrolling Order Information - Bottom of card */}
                {activeOrders.length > 0 && !expandedOrderId && (
                <div className="overflow-hidden mt-auto pt-2">
                  {/* Gray line separator */}
                  <div className="border-t border-gray-200" style={{ paddingTop: '2px', marginTop: '1px' }}></div>
                  <div 
                    ref={activeOrdersRef}
                    className="overflow-x-auto scrollbar-hide whitespace-nowrap"
                    style={{ scrollBehavior: 'auto' }}
                  >
                    {(() => {
                      const now = Date.now();
                      const fortyEightHours = 48 * 60 * 60 * 1000; // 48 hours in milliseconds
                      
                      // Get all orders to display: active orders + archived orders delivered within 48 hours
                      // Only show archived delivered orders if there are active orders
                      const ordersToDisplay: Order[] = [];
                      const hasNonDeliveredActiveOrders = activeOrders.some(
                        (order) => order.status !== 'DELIVERED' && order.status !== 'COMPLETE'
                      );
                      
                      // Add active orders
                      activeOrders.forEach(order => {
                        ordersToDisplay.push(order);
                      });
                      
                      // Add archived orders that were delivered within 48 hours (only if there are active orders)
                      if (hasNonDeliveredActiveOrders) {
                        pastOrders.forEach(order => {
                          if (order.status === 'DELIVERED' && order.deliveredAt) {
                            const timeSinceDelivered = now - order.deliveredAt;
                            if (timeSinceDelivered < fortyEightHours) {
                              ordersToDisplay.push(order);
                            }
                          }
                        });
                      }

                      const stripSorted = sortOrdersNewestFirst(ordersToDisplay);
                      
                      return stripSorted.map((order, _index) => {
                        // For delivered orders, only show "DELIVERED" status, hide all other statuses
                        if (order.status === 'DELIVERED') {
                          return (
                            <span key={order.id} className="text-[9px] text-left font-futura uppercase" style={{ fontWeight: '500', marginRight: '10px' }}>
                              <span className="text-black" style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' }}>
                                {order.orderNumber}:{' '}
                              </span>
                              <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' }}>
                                DELIVERED
                              </span>
                            </span>
                          );
                        }
                        if (
                          order.status === 'PLACED' &&
                          orderFormAwaitingAdminApproval(order as unknown as Record<string, unknown>) &&
                          orderNeedsClientAuthFormSignature(order as unknown as Record<string, unknown>)
                        ) {
                          return (
                            <span key={order.id} className="text-[9px] text-left font-futura uppercase" style={{ fontWeight: '500', marginRight: '10px' }}>
                              <span className="text-black" style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' }}>
                                {order.orderNumber}:{' '}
                              </span>
                              <span style={{ color: '#000000', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' }}>
                                ORDER FORM PENDING ADMIN APPROVAL
                              </span>
                            </span>
                          );
                        }
                        // For PLACED orders with signed form, show "ORDER FORM IN REVIEW" (unit/bundle/F&C only)
                        if (
                          order.status === 'PLACED' &&
                          order.orderFormSigned &&
                          !orderFormAwaitingAdminApproval(order as unknown as Record<string, unknown>) &&
                          orderNeedsClientAuthFormSignature(order as unknown as Record<string, unknown>)
                        ) {
                          return (
                            <span key={order.id} className="text-[9px] text-left font-futura uppercase" style={{ fontWeight: '500', marginRight: '10px' }}>
                              <span className="text-black" style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' }}>
                                {order.orderNumber}:{' '}
                              </span>
                              <span style={{ color: '#000000', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' }}>
                                ORDER FORM IN REVIEW
                              </span>
                            </span>
                          );
                        }
                        // For PLACED orders without signed form, show countdown (authorization required only)
                        if (
                          order.status === 'PLACED' &&
                          order.placedAt &&
                          orderNeedsClientAuthFormSignature(order as unknown as Record<string, unknown>) &&
                          !order.orderFormSigned
                        ) {
                          return (
                            <span key={order.id} className="text-[9px] text-left font-futura uppercase" style={{ fontWeight: '500', marginRight: '10px' }}>
                              <span className="text-black" style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' }}>
                                {order.orderNumber}:{' '}
                              </span>
                              <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' }}>
                                {formatCountdown(getAuthorizationRemainingTime(order.placedAt))}
                              </span>
                            </span>
                          );
                        }
                        // For CANCELED orders, show in red Futura PT Medium
                        if (order.status === 'CANCELED') {
                          return (
                            <span key={order.id} className="text-[9px] text-left font-futura uppercase" style={{ fontWeight: '500', marginRight: '10px' }}>
                              <span className="text-black" style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' }}>
                                {order.orderNumber}:{' '}
                              </span>
                              <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' }}>
                                {order.status}
                              </span>
                            </span>
                          );
                        }
                        // For non-delivered orders, show their current status
                        return (
                          <span key={order.id} className="text-[9px] text-left font-futura uppercase" style={{ fontWeight: '500', marginRight: '10px' }}>
                            <span className="text-black" style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' }}>
                              {order.orderNumber}:{' '}
                            </span>
                            <span style={{ 
                              color: (order.status === 'CONFIRMED' || order.status === 'SHIPPED' || order.status === 'PROCESSING') ? '#EB1C24' : '#808080',
                              fontFamily: (order.status === 'CONFIRMED' || order.status === 'SHIPPED' || order.status === 'PROCESSING') ? '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' : '"Futura PT Demi", futuristic-pt, Futura, Inter, sans-serif'
                            }}>
                              {order.status === 'PLACED' &&
                              orderFormAwaitingAdminApproval(order as unknown as Record<string, unknown>) &&
                              orderNeedsClientAuthFormSignature(order as unknown as Record<string, unknown>)
                                ? 'ORDER FORM PENDING ADMIN APPROVAL'
                                : order.status === 'PLACED' &&
                                    order.orderFormSigned &&
                                    !orderFormAwaitingAdminApproval(order as unknown as Record<string, unknown>) &&
                                    orderNeedsClientAuthFormSignature(order as unknown as Record<string, unknown>)
                                  ? 'ORDER FORM IN REVIEW'
                                  : order.status}
                            </span>
                          </span>
                        );
                      });
                    })()}
                  </div>
                </div>
                )}
              </div>
            )}

              {/* Past Orders Card - Only show when there are archived orders; hide when an active order is expanded */}
              {pastOrders.length > 0 && !(expandedOrderId && activeOrders.find(o => o.id === expandedOrderId)) && (
              <div className={`bg-white/60 backdrop-blur-sm border border-black p-4 flex flex-col transition-all duration-300 ease-out ${pastOrders.length > 1 ? 'min-h-[360px] overflow-hidden' : ''}`} style={{ borderWidth: '1.3px', minHeight: pastOrders.length > 1 ? '360px' : 'auto' }}>
                {/* Header */}
                <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200">
                  {expandedOrderId && pastOrders.find(o => o.id === expandedOrderId) ? (
                    <>
                      <button
                        className="text-red-500 font-bold text-lg tracking-wider truncate hover:text-red-600 transition-colors text-left uppercase"
                        style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '12px', fontWeight: '500' }}
                      >
                        {pastOrders.find(o => o.id === expandedOrderId)?.orderNumber || 'ORDER'}
                      </button>
                      <button
                        onClick={() => setExpandedOrderId(null)}
                        style={{ 
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <img
                          src="/assets/close-icon.svg"
                          alt="Close"
                          style={{
                            width: '16px',
                            height: '16px',
                            filter: 'brightness(0) saturate(100%) invert(20%) sepia(93%) saturate(7151%) hue-rotate(346deg) brightness(92%) contrast(92%)'
                          }}
                        />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="text-red-500 font-bold text-lg tracking-wider truncate hover:text-red-600 transition-colors text-left uppercase"
                        style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '12px', fontWeight: '500' }}
                      >
                        ARCHIVED ORDERS
                      </button>
                      <span
                        className="text-black font-bold text-lg flex-shrink-0 ml-2 uppercase"
                        style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', fontSize: '17px' }}
                      >
                        {pastOrders.length}
                      </span>
                    </>
                  )}
                </div>

                 {/* Body: when an archived order is expanded show only that order (list hidden); otherwise show list - same pattern as Active Orders */}
                 {(() => {
                   const isArchivedOrderExpanded = Boolean(expandedOrderId && pastOrders.some(o => o.id === expandedOrderId));
                   const expandedOrder = pastOrders.find(o => o.id === expandedOrderId) ?? null;
                   if (isArchivedOrderExpanded && expandedOrder) {
                     const orderAmountArchived = (expandedOrder.subtotal != null ? expandedOrder.subtotal : expandedOrder.total);
const orderProductsArchived = expandedOrder.lineItems && expandedOrder.lineItems.length > 0
                        ? expandedOrder.lineItems.map((line, i) => ({
                            id: `${expandedOrder.id}-product-${i}`,
                            name: line.productName,
                            image: getProductImage(line.productName),
                            price: line.subtotal != null ? line.subtotal : orderAmountArchived / expandedOrder.lineItems!.length,
                            options: line.options
                          }))
                       : Array.from({ length: expandedOrder.items }, (_, i) => ({
                           id: `${expandedOrder.id}-product-${i}`,
                           name: expandedOrder.productName,
                           image: ordersPageOrderThumbnailSrc(expandedOrder),
                           price: orderAmountArchived / expandedOrder.items,
                           options: undefined as Record<string, string> | undefined
                         }));
                     return (
                       <div key="archived-expanded" className={`${pastOrders.length > 1 ? 'flex-1' : ''} flex flex-col overflow-hidden mt-2`}>
                         <div className="flex flex-col gap-6" style={{ marginTop: '10px' }}>
                           {/* Products Horizontal Scroll: black product name, red RAW line, gray price, black details (non-default only) */}
                           <div 
                             className="relative overflow-x-auto"
                             style={{ 
                               minHeight: '180px',
                               height: 'auto',
                               marginBottom: '20px',
                               display: 'flex',
                               justifyContent: orderProductsArchived.length === 1 ? 'center' : 'flex-start'
                             }}
                           >
                             <div
                               className="flex"
                               style={{
                                 gap: '20px',
                                 minHeight: '180px',
                                 alignItems: 'flex-start',
                                 justifyContent: orderProductsArchived.length === 1 ? 'center' : orderProductsArchived.length === 2 ? 'center' : 'flex-start',
                                 paddingRight: '10px',
                                 paddingLeft: orderProductsArchived.length >= 3 ? 'calc(50% - 160px)' : undefined,
                                 marginLeft: orderProductsArchived.length === 1 ? 0 : orderProductsArchived.length >= 2 ? '-10px' : undefined,
                               }}
                             >
                              {orderProductsArchived.map((product) => {
                                const opts = product.options || {};
                                const lengthVal = opts.length || '24"';
                                const isAcExpandedArchived =
                                  expandedOrder.bookingFlowType === 'appointment' ||
                                  expandedOrder.bookingFlowType === 'consult';
                                const nonDefaultDetails = getNonDefaultDetailLines(product.name, opts, isAcExpandedArchived);
                                const expandedArchivedThumbPx = isAcExpandedArchived
                                    ? ORDER_AC_EXPANDED_PRODUCT_THUMB_PX
                                    : ORDER_EXPANDED_PRODUCT_THUMB_PX;
                                return (
                                <div
                                  key={product.id}
                                  className="flex-shrink-0"
                                  style={{
                                     width: '150px',
                                     minHeight: '150px',
                                     display: 'flex',
                                     flexDirection: 'column',
                                     alignItems: 'center',
                                     justifyContent: 'center',
                                     padding: '8px'
                                   }}
                                 >
                                   <img
                                     src={product.image}
                                     alt={product.name}
                                     onClick={() => navigate(getProductRoute(product.name))}
                                     style={{
                                       width: `${expandedArchivedThumbPx}px`,
                                       height: `${expandedArchivedThumbPx}px`,
                                       objectFit: 'contain',
                                       cursor: 'pointer',
                                       ...(isAcExpandedArchived ? { transform: `translateY(${ORDER_AC_THUMB_TRANSLATE_Y_PX}px)` } : {}),
                                     }}
                                   />
                                   <p
                                     style={{
                                       fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                                       fontSize: product.name === 'NOIR' ? '22px' : '21px',
                                       color: '#000000',
                                       marginTop: '4px',
                                       marginBottom: '0',
                                       textTransform: 'uppercase',
                                       textAlign: 'center',
                                       lineHeight: '1.1'
                                     }}
                                   >
                                     {product.name.replace(/WIG/gi, '').trim()}
                                   </p>
                                   <p
                                     style={{
                                       fontFamily: '"Futura PT Medium", Futura, Inter, sans-serif',
                                       fontSize: '9px',
                                       color: '#EB1C24',
                                       marginTop: '3px',
                                       marginBottom: 0,
                                       textTransform: 'uppercase',
                                       textAlign: 'center',
                                       lineHeight: '1.1'
                                     }}
                                   >
                                     {`${lengthVal} RAW ${getHairOrigin(product.name)}`}
                                   </p>
                                   <p
                                     style={{
fontFamily: '"Futura PT Demi", Futura, Inter, sans-serif',
                                      fontSize: '9px',
                                      color: '#808080',
                                      marginTop: '6px',
                                       marginBottom: 0,
                                       textTransform: 'uppercase',
                                       textAlign: 'center',
                                       lineHeight: '1.1'
                                     }}
                                   >
                                     {formatPrice(product.price)} {selectedCurrency}
                                   </p>
{nonDefaultDetails.length > 0 ? (
                                    <div style={{ marginTop: '4px', textAlign: 'center' }}>
                                      {nonDefaultDetails.map((line, idx) => (
                                        <div
                                          key={idx}
                                          style={{
                                            fontFamily: '"Futura PT Book", Futura, Inter, sans-serif',
                                            fontSize: '9px',
                                            color: '#000000',
                                            marginTop: idx === 0 ? 0 : '4px',
                                            marginBottom: 0,
                                            textTransform: 'uppercase',
                                            lineHeight: '1.2'
                                          }}
                                        >
                                          {line}
                                        </div>
                                      ))}
                                    </div>
                                   ) : null}
                                 </div>
                               ); })}
                             </div>
                           </div>
                           
                           {/* ORDER SUMMARY */}
                           <div style={{ marginBottom: '20px' }}>
                             <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '10px', marginTop: '-12px' }}>
                               <h2
                                 style={{
                                   fontFamily: '"Futura PT Medium"',
                                   fontSize: '12px',
                                   color: '#EB1C24',
                                   fontWeight: '500',
                                   textTransform: 'uppercase',
                                   margin: '0'
                                 }}
                               >
                                 ORDER SUMMARY
                               </h2>
                               <img src={summaryIcon} alt="" style={{ width: 12.75, height: 12.75, opacity: 1 }} />
                             </div>
                             <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                 <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>
                                   ORDER DATE
                                 </span>
                                 <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>
                                   {expandedOrder.date}
                                 </span>
                               </div>
                               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                 <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>
                                   ORDER NUMBER
                                 </span>
                                 <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>
                                   {expandedOrder.orderNumber.replace(/^ORDER\s+/i, '')}
                                 </span>
                               </div>
                               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                 <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>
                                   ORDER TOTAL
                                 </span>
                                 <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>
                                   {formatPrice(expandedOrder.total)} {selectedCurrency}
                                 </span>
                               </div>
                             </div>
                           </div>
                           
                           {/* SHIPPING — hidden for digital / A&C orders */}
                           {currentUser && !orderUsesDigitalFulfillmentTimeline(expandedOrder) && (
                             <div style={{ marginBottom: '20px' }}>
                               <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '10px', marginTop: '-12px' }}>
                                 <h2
                                   style={{
                                     fontFamily: '"Futura PT Medium"',
                                     fontSize: '12px',
                                     color: '#EB1C24',
                                     fontWeight: '500',
                                     textTransform: 'uppercase',
                                     margin: '0'
                                   }}
                                 >
                                   SHIPPING
                                 </h2>
                                 <img src="/assets/ship-icon.svg" alt="" style={{ width: 12.75, height: 12.75, opacity: 1 }} />
                               </div>
                               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                   <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>
                                     COMPLETION TIMELINE
                                   </span>
                                   <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>
                                     {expandedOrder.date ? calculateProcessingTimeline(expandedOrder.date, (expandedOrder as any).processingTime || '6-8 WEEKS') : ((expandedOrder as any).processingTime || '6-8 WEEKS')}
                                   </span>
                                 </div>
                                 {expandedOrder.trackingNumber && (() => {
                                   const trackingUrl = getCarrierTrackingUrl(
                                     (expandedOrder as Order).trackingCarrier,
                                     expandedOrder.trackingNumber
                                   );
                                   return (
                                     <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                       <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>
                                         TRACKING NUMBER
                                       </span>
                                       <a href={trackingUrl} target="_blank" rel="noopener noreferrer" style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#808080', textTransform: 'uppercase', cursor: 'pointer' }}>
                                         {expandedOrder.trackingNumber}
                                       </a>
                                     </div>
                                   );
                                 })()}
                                 {(() => {
                                   const shipCountry = currentUser.defaultAddress?.country || currentUser.shippingAddress?.country || '';
                                   const isDomestic = !shipCountry || /^US$|^USA$|^UNITED\s*STATES$/i.test(String(shipCountry).trim());
                                   const carrierFromOrder = (expandedOrder as Order).trackingCarrier?.trim();
                                   const carrierLabel = carrierFromOrder
                                     ? carrierFromOrder.toUpperCase()
                                     : isDomestic
                                       ? 'DOMESTIC'
                                       : 'INTERNATIONAL';
                                   return (
                                     <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                       <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>
                                         CARRIER
                                       </span>
                                       <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>
                                         {carrierLabel}
                                       </span>
                                     </div>
                                   );
                                 })()}
                                 <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', margin: '0', textTransform: 'uppercase' }}>
                                   {currentUser.firstName || ''} {currentUser.lastName || ''}
                                 </p>
                                 <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', margin: '0', textTransform: 'uppercase' }}>
                                   {currentUser.defaultAddress?.address || currentUser.shippingAddress?.address || ''}
                                 </p>
                                 <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', margin: '0', textTransform: 'uppercase' }}>
                                   {currentUser.defaultAddress?.city || currentUser.shippingAddress?.city || ''}, {currentUser.defaultAddress?.state || currentUser.shippingAddress?.state || ''} {currentUser.defaultAddress?.zip || currentUser.shippingAddress?.zip || ''}
                                 </p>
                                 <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', margin: '0', textTransform: 'uppercase' }}>
                                   {formatCountryDisplay(currentUser.defaultAddress?.country || currentUser.shippingAddress?.country)}
                                 </p>
                               </div>
                             </div>
                           )}

                           {expandedOrder.status !== 'CANCELED' && expandedOrder.status !== 'CANCELLED' && orderUsesDigitalFulfillmentTimeline(expandedOrder) && (
                               <div style={{ marginBottom: '20px' }}>
                                 <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '10px', marginTop: '-12px' }}>
                                   <h2 style={{ fontFamily: '"Futura PT Medium"', fontSize: '12px', color: '#EB1C24', fontWeight: '500', textTransform: 'uppercase', margin: '0' }}>
                                     ORDER STATUS
                                   </h2>
                                   <img src="/assets/order-tracking.svg" alt="" style={{ width: 18, height: 18, filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)' }} />
                                 </div>
                                 {!(
                                   expandedOrder.bookingFlowType === 'appointment' ||
                                   expandedOrder.bookingFlowType === 'consult'
                                 ) && (
                                   <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#666', margin: '0 0 10px 0', textTransform: 'uppercase', lineHeight: 1.45 }}>
                                     DIGITAL SERVICE — NO SHIPPING OR ORDER FORM. STATUS UPDATES HERE.
                                   </p>
                                 )}
                                 {(() => {
                                   void _countdownTick;
                                   const di = getDigitalFulfillmentStageIndex(expandedOrder);
                                   const labels = digitalFulfillmentStageLabels();
                                   const consultBarPct = consultDigitalOrderTrackingBarFillPct(
                                     expandedOrder,
                                     Date.now()
                                   );
                                   return (
                                     <>
                                     <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
                                       {labels.map((label, i) => {
                                         const isCurrent = i === di;
                                         return (
                                           <div
                                             key={`${expandedOrder.id}-dig-${i}`}
                                             style={{
                                               display: 'flex',
                                               alignItems: 'center',
                                               gap: '6px',
                                               margin: 0
                                             }}
                                           >
                                             <span style={orderTrackBubbleStyle(isCurrent, isCurrent)} aria-hidden />
                                             <p style={orderTrackStepLabelStyle(isCurrent)}>{label}</p>
                                           </div>
                                         );
                                       })}
                                     </div>
                                     {consultBarPct != null && (
                                       <div style={{ marginTop: '12px' }}>
                                         <div
                                           style={{
                                             width: '100%',
                                             height: '7px',
                                             backgroundColor: '#E0E0E0',
                                             borderRadius: consultBarPct > 0 ? '4px' : '0',
                                             overflow: 'hidden',
                                             border: consultBarPct === 0 ? '1px solid #808080' : 'none',
                                             boxSizing: 'border-box',
                                           }}
                                         >
                                           <div
                                             style={{
                                               width: `${consultBarPct}%`,
                                               height: '100%',
                                               backgroundColor: '#EB1C24',
                                               transition: 'width 0.3s ease',
                                               borderRadius: consultBarPct > 0 ? '4px' : '0',
                                             }}
                                           />
                                         </div>
                                       </div>
                                     )}
                                     </>
                                   );
                                 })()}
                               </div>
                           )}
                           
                           {/* PAYMENT */}
                           {currentUser && (
                             <div style={{ marginBottom: '20px' }}>
                               <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '10px', marginTop: '-12px' }}>
                                 <h2
                                   style={{
                                     fontFamily: '"Futura PT Medium"',
                                     fontSize: '12px',
                                     color: '#EB1C24',
                                     fontWeight: '500',
                                     textTransform: 'uppercase',
                                     margin: '0'
                                   }}
                                 >
                                   PAYMENT
                                 </h2>
                                 <img src="/assets/payment-icon.svg" alt="" style={{ width: 14.25, height: 14.25, opacity: 1 }} />
                               </div>
                               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                 {(() => {
                                   let methodName = '';
                                   let last4 = '';
                                   const fromOrder = (expandedOrder as any)?.paymentMethod;
                                   if (fromOrder) {
                                     const endingMatch = String(fromOrder).match(/ENDING IN (\d+)/i);
                                     last4 = endingMatch ? endingMatch[1] : '';
                                     let brandPart = String(fromOrder).replace(/\s*ENDING IN \d+.*$/i, '').trim().replace(/_/g, ' ');
                                     methodName = (brandPart === 'EXPRESS' ? 'AMERICAN EXPRESS' : brandPart).toUpperCase();
                                   }
                                   if (!methodName || !last4) {
                                     const def = currentUser.defaultPaymentMethod;
                                     if (def && def.cardNumber) {
                                       last4 = String(def.cardNumber).replace(/\D/g, '').slice(-4);
                                       const b = (def.cardBrand || '').toUpperCase().replace(/_/g, ' ');
                                       methodName = (b === 'EXPRESS' || b === 'AMEX') ? 'AMERICAN EXPRESS' : (b || 'CARD');
                                     }
                                   }
                                   if (!methodName) methodName = 'CARD';
                                   if (!last4) last4 = '****';
                                   return (
                                     <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                       <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>
                                         {methodName}
                                       </span>
                                       <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>
                                         ENDING IN {last4}
                                       </span>
                                     </div>
                                   );
                                 })()}
                                 {((expandedOrder as any).discountCode ?? (expandedOrder as any).discount_code ?? (expandedOrder as any).discount) && (
                                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                     <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>DISCOUNT CODE</span>
                                     <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>{String((expandedOrder as any).discountCode ?? (expandedOrder as any).discount_code ?? (expandedOrder as any).discount).toUpperCase()}</span>
                                   </div>
                                 )}
                                 {((expandedOrder as any).giftCard ?? (expandedOrder as any).gift_card ?? (expandedOrder as any).giftCardNumber ?? (expandedOrder as any).giftCardCode) && (
                                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                     <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>GIFT CARD</span>
                                     <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>{String((expandedOrder as any).giftCard ?? (expandedOrder as any).gift_card ?? (expandedOrder as any).giftCardNumber ?? (expandedOrder as any).giftCardCode).toUpperCase()}</span>
                                   </div>
                                 )}
                                 {((expandedOrder as any).referralCode ?? (expandedOrder as any).referral_code) && (
                                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                     <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>REFERRAL CODE</span>
                                     <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>{String((expandedOrder as any).referralCode ?? (expandedOrder as any).referral_code).toUpperCase()}</span>
                                   </div>
                                 )}
                                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                   <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>
                                     CONFIRMATION EMAIL
                                   </span>
                                   <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>
                                     {currentUser.email || ''}
                                   </span>
                                 </div>
                                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                   <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>
                                     CONFIRMATION NUMBER
                                   </span>
                                   <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>
                                     #{(() => {
                                       const orderNum = expandedOrder.orderNumber?.replace(/^ORDER\s+/i, '').trim();
                                       const key = orderNum ? (orderNum.startsWith('#') ? orderNum : `#${orderNum}`) : null;
                                       if (key) {
                                         const orderConfirmations = JSON.parse(localStorage.getItem('orderConfirmations') || '{}');
                                         const stored = orderConfirmations[key] || orderConfirmations[expandedOrder.orderNumber];
                                         if (stored) return stored;
                                       }
                                       const onOrder = (expandedOrder as any).confirmationNumber;
                                       if (onOrder) return onOrder;
                                       const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                                       const seed = orderNum ? orderNum.replace(/\D/g, '') : '0';
                                       let hash = 0;
                                       for (let i = 0; i < seed.length; i++) hash = ((hash << 5) - hash) + seed.charCodeAt(i);
                                       let gen = '';
                                       for (let i = 0; i < 6; i++) { const idx = Math.abs((hash + i) % chars.length); gen += chars[idx]; }
                                       return gen;
                                     })()}
                                   </span>
                                 </div>
                               </div>
                             </div>
                           )}
                           {expandedOrder.status !== 'CANCELED' &&
                             expandedOrder.status !== 'CANCELLED' &&
                             !orderUsesDigitalFulfillmentTimeline(expandedOrder) &&
                             currentUser &&
                             showLongPremiumConciergeExtras(currentUser) && (
                               <div style={{ marginBottom: '20px' }}>
                                 <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '10px', marginTop: '-12px' }}>
                                   <h2 style={{ fontFamily: '"Futura PT Medium"', fontSize: '12px', color: '#EB1C24', fontWeight: '500', textTransform: 'uppercase', margin: '0' }}>
                                     ORDER TRACKING
                                   </h2>
                                   <img src="/assets/order-tracking.svg" alt="" style={{ width: 18, height: 18, filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)' }} />
                                 </div>
                                 {(() => {
                                   const st = getOrderTrackingStageFromOrder(expandedOrder as unknown as Record<string, unknown>);
                                   const shift = Number((expandedOrder as Order).trackingTimelineShiftDays) || 0;
                                   const ordRec = expandedOrder as unknown as Record<string, unknown>;
                                   const deliveredRowCurrent = orderTrackingDeliveredRowIsCurrent(ordRec, st);
                                   return (
                                     <>
                                       {shift !== 0 && (
                                         <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#808080', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
                                           TIMELINE ADJUSTMENT: {shift > 0 ? `+${shift}` : shift} DAY{Math.abs(shift) === 1 ? '' : 'S'}
                                         </p>
                                       )}
                                       <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
                                         {ORDER_TRACKING_STAGE_LABELS.map((label, i) => {
                                           const note = (expandedOrder as Order).trackingStageNotes?.[String(i)]?.trim();
                                           const isCurrent = orderTrackingStageRowIsCurrent(ordRec, i, st);
                                           return (
                                             <div key={`${expandedOrder.id}-st-arch-${i}`}>
                                               <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                 <span style={orderTrackBubbleStyle(isCurrent, isCurrent)} aria-hidden />
                                                 <p style={orderTrackStepLabelStyle(isCurrent)}>{label}</p>
                                               </div>
                                               {note ? (
                                                 <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#666', margin: '2px 0 0 0', textTransform: 'uppercase', lineHeight: 1.35, paddingLeft: `${ORDER_TRACK_BUBBLE_PX + 6}px` }}>
                                                   {note}
                                                 </p>
                                               ) : null}
                                             </div>
                                           );
                                         })}
                                         {orderShowsDeliveredTrackingLine(ordRec) ? (
                                           <div key={`${expandedOrder.id}-st-arch-delivered`}>
                                             <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                               <span style={orderTrackBubbleStyle(deliveredRowCurrent, deliveredRowCurrent)} aria-hidden />
                                               <p style={orderTrackStepLabelStyle(deliveredRowCurrent)}>DELIVERED</p>
                                             </div>
                                           </div>
                                         ) : null}
                                       </div>
                                     </>
                                   );
                                 })()}
                               </div>
                             )}
                           {/* REWARDS */}
                           {currentUser && (
                             <div style={{ marginBottom: '5px' }}>
                               <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '10px', marginTop: '-12px' }}>
                                 <h2 style={{ fontFamily: '"Futura PT Medium"', fontSize: '12px', color: '#EB1C24', fontWeight: '500', textTransform: 'uppercase', margin: '0' }}>
                                   REWARDS
                                 </h2>
                                 <img src="/assets/rewards-icon.svg" alt="" style={{ width: 15, height: 15, opacity: 1, filter: 'invert(27%) sepia(98%) saturate(7151%) hue-rotate(346deg) brightness(92%) contrast(92%)' }} />
                               </div>
                               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                   <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', margin: '0', textTransform: 'uppercase' }}>
                                     {(() => {
                                       const pts = displayLoyaltyPointsForExpandedOrder(expandedOrder);
                                       return (
                                         <>
                                           YOU'VE EARNED <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"' }}>{pts.toLocaleString()}</span> LOYALTY POINTS{pts === 0 ? '.' : '!'}
                                         </>
                                       );
                                     })()}
                                   </p>
                                   <span style={{
                                     fontFamily: ((expandedOrder as any).tier || currentUser?.tier || 'SILVER').toUpperCase() === 'RED' || ((expandedOrder as any).tier || currentUser?.tier || 'SILVER').toUpperCase() === 'GOLD' ? '"Futura PT Medium"' : '"Futura PT Demi"',
                                     fontSize: '10px',
                                     color: (() => { const t = ((expandedOrder as any).tier || currentUser?.tier || 'SILVER').toUpperCase(); if (t === 'RED') return '#EB1C24'; if (t === 'SILVER') return '#808080'; if (t === 'GOLD') return '#000000'; return '#808080'; })(),
                                     textTransform: 'uppercase'
                                   }}>
                                     {((expandedOrder as any).tier || currentUser?.tier || 'SILVER').toUpperCase()} TIER
                                   </span>
                                 </div>
                               </div>
                             </div>
                           )}
                         </div>
                       </div>
                     );
                   }
                   return (
                     <div key="archived-list" className={`${pastOrders.length > 1 ? 'flex-1' : ''} flex flex-col overflow-hidden mt-2`}>
                   <div className={`flex flex-col justify-start items-start gap-4 my-2 flex-shrink-0 ${pastOrders.length > 1 ? 'overflow-y-auto' : ''}`} style={{ maxHeight: pastOrders.length > 1 ? '265px' : 'auto', scrollBehavior: 'smooth' }}>
                     {pastOrders.map((order) => (
                       <div key={order.id} className="flex items-center gap-3" style={{ flexShrink: 0 }}>
                         {/* Thumbnail */}
                         <div style={ORDER_LIST_THUMB_SLOT_STYLE}>
                           <button
                             onClick={() => setExpandedOrderId(order.id === expandedOrderId ? null : order.id)}
                             style={ordersPageListThumbButtonStyleForOrder(order)}
                           >
                             <img
                               src={ordersPageOrderThumbnailSrc(order)}
                               alt={order.productName}
                               style={{
                                 width: `${ordersPageListThumbnailSizePx(order)}px`,
                                 height: `${ordersPageListThumbnailSizePx(order)}px`,
                                 objectFit: 'contain'
                               }}
                             />
                           </button>
                           {order.bookingFlowType !== 'appointment' && order.bookingFlowType !== 'consult' && (
                           <p
                             style={{
                               fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                               color: '#EB1C24',
                               fontSize: '12px',
                               margin: `${ordersPageListItemsLabelMarginTopPx()}px 0 0 0`,
                               textTransform: 'uppercase',
                               textAlign: 'center',
                               width: '100%',
                             }}
                           >
                             {order.items} {order.items === 1 ? 'ITEM' : 'ITEMS'}
                           </p>
                           )}
                         </div>
                         
                         {/* Order Context Text */}
                         <div className="flex flex-col gap-1" style={{ flexShrink: 0, transform: 'translateY(-6px)' }}>
                           <p style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', fontSize: '13px', color: '#000000', margin: 0, lineHeight: '1.2' }}>
                             {order.date}
                           </p>
                           <p 
                             onClick={() => setExpandedOrderId(order.id === expandedOrderId ? null : order.id)}
                             style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', color: '#EB1C24', margin: 0, lineHeight: '1.2', cursor: 'pointer' }}
                           >
                             {order.orderNumber}
                           </p>
                           <p style={{ fontFamily: '"Futura PT Demi", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', color: '#808080', margin: 0, lineHeight: '1.2' }}>
                             {formatPrice(order.total)} {selectedCurrency}
                           </p>
                           <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', margin: 0, lineHeight: '1.2' }}>
                             <span style={{ color: '#EB1C24' }}>STATUS: </span>
                             <span style={{ 
                               color: (order.status === 'CONFIRMED' || order.status === 'SHIPPED' || order.status === 'DELIVERED' || order.status === 'COMPLETE' || order.status === 'CANCELED' || order.status === 'PROCESSING') ? '#EB1C24' : '#808080',
                               fontFamily: (order.status === 'CONFIRMED' || order.status === 'SHIPPED' || order.status === 'DELIVERED' || order.status === 'COMPLETE' || order.status === 'CANCELED' || order.status === 'PROCESSING') ? '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' : '"Futura PT Demi", futuristic-pt, Futura, Inter, sans-serif'
                             }}>{order.status}</span>
                           </p>
                           {renderDigitalFulfillmentAmountRowExtras(order)}
                           {order.status === 'PLACED' &&
                             orderFormAwaitingAdminApproval(order as unknown as Record<string, unknown>) &&
                             orderNeedsClientAuthFormSignature(order as unknown as Record<string, unknown>) && (
                             <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', color: '#000000', margin: 0, lineHeight: '1.2' }}>
                               ORDER FORM PENDING ADMIN APPROVAL
                             </p>
                           )}
                           {order.status === 'PLACED' &&
                             order.placedAt &&
                             !order.orderFormSigned &&
                             !orderUsesDigitalFulfillmentTimeline(order) &&
                             orderNeedsClientAuthFormSignature(order as unknown as Record<string, unknown>) && (
                             <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', margin: 0, lineHeight: '1.2', cursor: 'pointer' }} onClick={() => {
                              let customerData: any = {};
                              const orderNumber = order.orderNumber.replace(/^ORDER\s+/i, '');
                              if (currentUser) {
                                customerData = {
                                  orderId: order.id,
                                  orderNumber: orderNumber,
                                  orderDate: order.date,
                                  firstName: currentUser.firstName || '',
                                  lastName: currentUser.lastName || '',
                                  email: currentUser.email || '',
                                  shippingAddress: currentUser.defaultAddress?.address || currentUser.shippingAddress?.address || '',
                                  city: currentUser.defaultAddress?.city || currentUser.shippingAddress?.city || '',
                                  state: currentUser.defaultAddress?.state || currentUser.shippingAddress?.state || '',
                                  zip: currentUser.defaultAddress?.zip || currentUser.shippingAddress?.zip || '',
                                  country: currentUser.defaultAddress?.country || currentUser.shippingAddress?.country || 'UNITED STATES'
                                };
                              } else {
                                customerData = { orderId: order.id, orderNumber: orderNumber, orderDate: order.date };
                              }
                              navigate('/tools/order-form', {
                                state: {
                                  ...customerData,
                                  giftCardIdentityVerificationOnly: (order as { requiresGiftCardIdentityForm?: boolean }).requiresGiftCardIdentityForm === true,
                                },
                              });
                             }}>
                               <span style={{ color: '#000000' }}>CLICK </span>
                               <span style={{ color: '#EB1C24' }}>HERE</span>
                               <span style={{ color: '#000000' }}>
                                 {(order as { requiresGiftCardIdentityForm?: boolean }).requiresGiftCardIdentityForm
                                   ? ' TO VERIFY ID (ONE-TIME FOR GIFT CARDS)'
                                   : ' TO SIGN ORDER FORM'}
                               </span>
                             </p>
                           )}
                           {order.status === 'PLACED' &&
                             order.orderFormSigned &&
                             !orderFormAwaitingAdminApproval(order as unknown as Record<string, unknown>) &&
                             orderNeedsClientAuthFormSignature(order as unknown as Record<string, unknown>) && (
                             <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', color: '#000000', margin: 0, lineHeight: '1.2' }}>
                               {(order as { requiresGiftCardIdentityForm?: boolean }).requiresGiftCardIdentityForm
                                 ? 'GIFT CARD VERIFICATION ON FILE'
                                 : 'ORDER FORM IN REVIEW'}
                             </p>
                           )}
                           {!orderUsesDigitalFulfillmentTimeline(order) ? (
                             order.trackingNumber ? (
                               <div>
                                 <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10.5px', color: '#000000', margin: 0, lineHeight: '1.2', transform: 'translateY(-1px)' }}>
                                   <a href={getCarrierTrackingUrl(order.trackingCarrier, order.trackingNumber)} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', cursor: 'pointer' }}>
                                     {order.trackingNumber}
                                   </a>
                                 </p>
                                 <p style={{ fontFamily: '"Futura PT Demi", futuristic-pt, Futura, Inter, sans-serif', fontSize: '9px', color: '#808080', margin: 0, lineHeight: '1.2', transform: 'translateY(3px)' }}>
                                   TRACK VIA {currentUser && /^US$|^USA$|^UNITED\s*STATES$/i.test(String(currentUser.defaultAddress?.country || currentUser.shippingAddress?.country || 'US').trim()) ? 'DOMESTIC' : 'INTERNATIONAL'}
                                 </p>
                               </div>
                             ) : order.status === 'CONFIRMED' ? (
                               <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', color: '#000000', margin: 0, lineHeight: '1.2' }}>
                                 PROCESSING YOUR ORDER
                               </p>
                             ) : order.status === 'PREPARING' ? (
                               <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', margin: 0, lineHeight: '1.2' }}>
                                 <span style={{ color: '#000000' }}>CLICK </span>
                                 <span 
                                   style={{ color: '#EB1C24', cursor: 'pointer' }}
                                   onClick={() => {
                                     if (order.bookingFlowType === 'appointment' || order.bookingFlowType === 'consult') {
                                       setExpandedOrderId(order.id === expandedOrderId ? null : order.id);
                                       return;
                                     }
                                     // Check if user is premium member
                                     try {
                                       const isSignedIn = localStorage.getItem('isSignedIn') === 'true';
                                       if (isSignedIn) {
                                         const currentUser = localStorage.getItem('currentUser');
                                         if (currentUser) {
                                           const user = JSON.parse(currentUser);
                                           const isPremium = user?.membershipType === 'PREMIUM' || user?.membershipType === 'Premium';
                                           if (isPremium) {
                                             // Premium members: navigate to concierge page with order ID
                                             navigate(`/account/concierge?orderId=${order.id}`);
                                           } else {
                                             // Standard members: expand order on orders page
                                             setExpandedOrderId(order.id === expandedOrderId ? null : order.id);
                                           }
                                         } else {
                                           // Default to expanding order if user data not found
                                           setExpandedOrderId(order.id === expandedOrderId ? null : order.id);
                                         }
                                       } else {
                                         // Not signed in: expand order
                                         setExpandedOrderId(order.id === expandedOrderId ? null : order.id);
                                       }
                                     } catch (e) {
                                       // On error, default to expanding order
                                       setExpandedOrderId(order.id === expandedOrderId ? null : order.id);
                                     }
                                   }}
                                 >
                                   HERE
                                 </span>
                                 <span style={{ color: '#000000' }}> TO TRACK ORDER STATUS</span>
                               </p>
                             ) : order.status !== 'PLACED' && order.status !== 'CANCELED' && order.status !== 'COMPLETE' ? (
                               <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', color: '#000000', margin: 0, lineHeight: '1.2' }}>
                                 TRACKING LOADING
                               </p>
                             ) : null
                           ) : null}
                         </div>
                       </div>
                     ))}
                   </div>
                     </div>
                 );
                 })()}

                {/* Scrolling Order Information - Bottom of card - hide when an archived order is expanded */}
                {pastOrders.length > 0 && !(expandedOrderId && pastOrders.some(o => o.id === expandedOrderId)) && (
                <div className="overflow-hidden mt-auto pt-2">
                  {/* Gray line separator */}
                  <div className="border-t border-gray-200" style={{ paddingTop: '2px', marginTop: '1px' }}></div>
                  
                  {/* Review/Points info in red */}
                  <div 
                    ref={pastOrdersReviewRef}
                    className="overflow-x-auto scrollbar-hide whitespace-nowrap"
                    style={{ scrollBehavior: 'auto' }}
                  >
                      {pastOrders.map((order, _index) => (
                        order.reviewInfo && (
                          <span key={`${order.id}-review`} className="text-[9px] text-left font-futura uppercase" style={{ fontWeight: '500', marginRight: '10px' }}>
                            <span style={{ color: '#000000', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' }}>
                              {order.orderNumber}:{' '}
                            </span>
                            <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' }}>
                              {order.reviewInfo}
                            </span>
                          </span>
                        )
                      ))}
                  </div>
                </div>
                )}
              </div>
              )}

              {/* Leave a review - archived only, 3 days after delivered through review window end (same top spacing as concierge) */}
              {(() => {
                void reviewSubmissionUiBump;
                const expandedArchived = expandedOrderId ? pastOrders.find(o => o.id === expandedOrderId) : null;
                const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
                const showLeaveReview =
                  expandedArchived?.status === 'DELIVERED' &&
                  expandedArchived.deliveredAt != null &&
                  Date.now() - expandedArchived.deliveredAt >= THREE_DAYS_MS;
                if (!showLeaveReview || !expandedArchived) return null;
                const allReviewed = allOrderLineItemsReviewed(expandedArchived.id, expandedArchived);
                return (
                  <div className="px-0 w-full" style={{ marginTop: '-5px', marginBottom: '20px' }}>
                    <button
                      type="button"
                      disabled={allReviewed}
                      className={`relative z-10 border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white uppercase cursor-pointer disabled:opacity-100 ${allReviewed ? '' : 'hover:bg-gray-50'}`}
                      style={{ borderWidth: '1.3px', color: '#EB1C24', fontFamily: '"Futura PT Medium"', opacity: 1 }}
                      onClick={() =>
                        !allReviewed &&
                        navigate(`/account/orders/${expandedArchived.id}/review`, { state: { order: expandedArchived } })
                      }
                    >
                      {allReviewed ? 'REVIEW(S) SUBMITTED' : 'LEAVE A REVIEW'}
                    </button>
                  </div>
                );
              })()}
              {(() => {
                if (!expandedOrderId || !currentUser || !showLongPremiumConciergeExtras(currentUser)) return null;
                const expandedForConcierge = activeOrders.find((o) => o.id === expandedOrderId);
                if (!expandedForConcierge) return null;
                return (
                  <div className="px-0 w-full" style={{ marginTop: '-5px', marginBottom: '8px' }}>
                    <button
                      type="button"
                      className="relative z-10 border border-black w-full text-center py-2 bg-white cursor-pointer hover:bg-gray-50 uppercase"
                      style={{ borderWidth: '1.3px', color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontSize: '11px', fontWeight: 500 }}
                      onClick={() =>
                        navigate(
                          `/account/concierge?orderId=${encodeURIComponent(expandedForConcierge.id)}#order-tracking`
                        )
                      }
                    >
                      GO TO CONCIERGE
                    </button>
                  </div>
                );
              })()}
            </div>
            )}
          </div>
        </div>
      </div>

      {/* Sign Out Confirmation Modal */}
      <ConfirmationModal
        isOpen={showSignOutConfirm}
        onClose={() => setShowSignOutConfirm(false)}
        onConfirm={handleSignOut}
        title="SIGN OUT?"
        message="ARE YOU SURE YOU WANT TO SIGN OUT?"
        confirmText="SIGN OUT"
        cancelText="CANCEL"
      />

      <ConsultOfferClaimModal
        isOpen={consultOfferModalOpen}
        onClose={closeConsultOfferModal}
        quote={consultOfferModalQuote}
        loading={consultOfferModalLoading}
        error={consultOfferModalError}
        locationForSignIn={location}
        orderNumberDisplay={consultOfferModalOrderLabel}
      />
      </div>
  );
}

export default OrdersPage;
