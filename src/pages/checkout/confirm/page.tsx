import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DynamicCartIcon from '../../../components/DynamicCartIcon';
import ConfirmationModal from '../../../components/ConfirmationModal';
import { getPointsMultiplier } from '../../../constants/tiers';
import { getEffectiveSubscriptionTier, getEffectiveTierName, clearAppAuth } from '../../../utils/adminAuth';
import BrandMenuLinks from '../../../components/BrandMenuLinks';
import SocialMenuIcons from '../../../components/SocialMenuIcons';
import summaryIcon from '../../../assets/icons/summary-icon.svg?url';
import { trackActivity } from '../../../utils/activity';
import { getPerUserKey, getCurrentUserEmailFromStorage, PER_USER_KEYS } from '../../../utils/perUserStorage';
import { ShopMobileMenuShopTab } from '../../../components/ShopMobileMenuShopTab';
import { ShopMobileMenuToolsTab } from '../../../components/ShopMobileMenuToolsTab';
import { bcfBundleDealResolvedListSubtotal } from '../../../utils/bcfProductOptions';
import { stripIneligibleBcfBundleDealLines } from '../../../utils/premiumMemberAccess';
import {
  orderStripRedSubtitle,
  orderStripThumbnailSrc,
  orderStripThumbMetrics,
  orderStripTitleFontPx,
  orderStripTitleLine,
  orderStripUseDigitalStackLayout
} from '../../../utils/checkoutOrderStripDisplay';
import { isBookingCartLine } from '../../../utils/bookingCheckout';
import { signInHrefWithReturnTo } from '../../../utils/signInReturnTo';
import {
  consultDigitalOrderTrackingBarFillPct,
  digitalFulfillmentStageLabels,
  getDigitalFulfillmentStageIndex,
  orderUsesDigitalFulfillmentTimeline,
} from '../../../utils/digitalOrderFulfillment';
import {
  getOrderTrackingStageFromOrder,
  ORDER_TRACKING_PULSATE_ANIMATION,
  ORDER_TRACKING_PULSATE_KEYFRAMES_CSS,
  ORDER_TRACKING_STAGE_LABELS,
  orderTrackingDeliveredRowIsCurrent,
  orderTrackingStageRowIsCurrent,
  orderShowsDeliveredTrackingLine,
} from '../../../utils/orderTracking';
import { cartRequiresOrderAuthorizationForm } from '../../../utils/orderAuthorizationForm';
import { giftCardLineTotalUsd, isGiftCardCartLine } from '../../../utils/giftCardCheckout';
import {
  getConfirmPageFallbackProcessingLabel,
  processingTimelineWeekRangeFromLabel,
} from '../../../utils/checkoutBcfProcessing';
import {
  cartHasAnyLoyaltyEarningLine,
  isMembershipSubscriptionCartLine,
} from '../../../utils/loyaltyPointsEligibleNet';

/** Line item is a premium subscription tier (matches checkout upgrade cart shape). */
function isMembershipTierCartItem(item: any): boolean {
  return isMembershipSubscriptionCartLine(item);
}

function isPremiumMembershipUpgradeSummary(cartItems: any[], orderData: any): boolean {
  if (orderData?.isSubscriptionUpgrade === true) return true;
  if (!cartItems?.length) return false;
  return cartItems.every(isMembershipTierCartItem);
}

const ORDER_TRACK_BUBBLE_PX = 6;

function summaryScrollItemWidthPx(item: any, isSubscriptionUpgrade: boolean): number {
  return orderStripThumbMetrics(item, isSubscriptionUpgrade, { checkoutStrip: true }).cellWidthPx;
}

function CheckoutConfirmPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [cartItems, setCartItems] = useState<any[]>([]);
  const isBookingsOnlyOrder = React.useMemo(
    () => cartItems.length > 0 && cartItems.every(isBookingCartLine),
    [cartItems]
  );
  const [cartCount] = useState(() => {
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
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
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

  const [ordersAnimationsEnabled, setOrdersAnimationsEnabled] = useState(() => {
    try {
      const key = getPerUserKey(PER_USER_KEYS.ordersPageAnimationsEnabled, getCurrentUserEmailFromStorage());
      return localStorage.getItem(key) !== 'false';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    const sync = () => {
      try {
        const key = getPerUserKey(PER_USER_KEYS.ordersPageAnimationsEnabled, getCurrentUserEmailFromStorage());
        setOrdersAnimationsEnabled(localStorage.getItem(key) !== 'false');
      } catch (_) {}
    };
    window.addEventListener('ordersAnimationsChanged', sync as EventListener);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('ordersAnimationsChanged', sync as EventListener);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const orderTrackBubbleStyleConfirm = React.useCallback(
    (filled: boolean, pulsate = false): React.CSSProperties => ({
      width: ORDER_TRACK_BUBBLE_PX,
      height: ORDER_TRACK_BUBBLE_PX,
      borderRadius: '50%',
      border: '1px solid #000',
      background: filled ? '#EB1C24' : '#fff',
      flexShrink: 0,
      boxSizing: 'border-box',
      ...(pulsate && filled && ordersAnimationsEnabled ? { animation: ORDER_TRACKING_PULSATE_ANIMATION } : {}),
    }),
    [ordersAnimationsEnabled]
  );

  const orderTrackStepLabelStyleConfirm = React.useCallback(
    (isCurrent: boolean): React.CSSProperties => ({
      fontFamily: isCurrent ? '"Futura PT Medium"' : '"Futura PT Book"',
      fontSize: '9px',
      color: isCurrent ? '#EB1C24' : '#000',
      margin: 0,
      textTransform: 'uppercase',
      ...(isCurrent && ordersAnimationsEnabled ? { animation: ORDER_TRACKING_PULSATE_ANIMATION } : {}),
    }),
    [ordersAnimationsEnabled]
  );
  
  // Order data - get from location state, payment return, or generate
  const [orderData, setOrderData] = useState(() => {
    // Check if returning from payment provider
    const urlParams = new URLSearchParams(window.location.search);
    const paymentReturn = urlParams.get('paymentReturn');
    const provider = urlParams.get('provider');
    
    if (paymentReturn && provider) {
      // Retrieve stored order data from payment redirect
      const storedOrderKey = `pendingOrder_${provider}`;
      const storedOrderData = localStorage.getItem(storedOrderKey);
      if (storedOrderData) {
        try {
          const orderData = JSON.parse(storedOrderData);
          // Clear the stored data after retrieving
          localStorage.removeItem(storedOrderKey);
          // Clean up URL parameters
          window.history.replaceState({}, '', '/checkout/summary');
          return orderData;
        } catch (e) {
          console.error('Error parsing stored order data:', e);
        }
      }
    }
    
    if (location.state) {
      return location.state;
    }
    // Fallback data if no state passed - include mock rewards data
    // Calculate a mock order total (base price + taxes + shipping)
    const mockBaseTotal = 1290; // Mock base order amount
    const mockTaxesProcessing = mockBaseTotal * 0.10;
    const mockShippingHandling = 60;
    const mockOrderTotal = mockBaseTotal + mockTaxesProcessing + mockShippingHandling;
    
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
    
    return {
      orderNumber: orderNumber,
      orderInternalId: `order-${nextOrderNumber}`,
      confirmationNumber: confirmationNumber,
      orderDate: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, '-'),
      orderTotal: mockOrderTotal,
      shippingMethod: '',
      firstName: '',
      lastName: '',
      shippingAddress: '',
      city: '',
      state: '',
      zip: '',
      country: '',
      paymentMethod: '',
      email: '',
      pointsEarned: 1290, // Mock rewards data
      tier: 'RED' // Mock tier
    };
  });

  // Horizontal scroll state for products
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startScrollPosition, setStartScrollPosition] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hasTrackedOrderRef = useRef(false);

  // Track place_order and checkout_complete once when order is confirmed (for admin Activity tab)
  useEffect(() => {
    if (!orderData?.orderNumber || hasTrackedOrderRef.current) return;
    hasTrackedOrderRef.current = true;
    trackActivity('place_order', { orderId: orderData.orderNumber, total: orderData.orderTotal });
    trackActivity('checkout_complete');
  }, [orderData?.orderNumber, orderData?.orderTotal]);

  // Authoritative points/tier from checkout (sessionStorage written by checkout before navigate; survives location.state loss)
  const [rewardsFromCheckout, setRewardsFromCheckout] = useState<{ pointsEarned?: number; tier?: string }>(() => {
    try {
      const raw = sessionStorage.getItem('checkoutSummaryRewards');
      if (raw) {
        const p = JSON.parse(raw);
        return { pointsEarned: p.pointsEarned, tier: p.tier };
      }
    } catch (_) {}
    return {};
  });

  const isPremiumMembershipSummary = React.useMemo(
    () => isPremiumMembershipUpgradeSummary(cartItems, orderData),
    [cartItems, orderData]
  );

  const isOnlyDigitalProductsSummary = React.useMemo(
    () =>
      cartItems.length > 0 &&
      cartItems.every(
        (item: any) =>
          item?.name === 'GIFT CARD' || item?.type === 'gift-card' || item?.type === 'digital'
      ),
    [cartItems]
  );

  const summaryRequiresGiftCardIdentityForm = React.useMemo(() => {
    const v = (orderData as { requiresGiftCardIdentityForm?: boolean } | null)?.requiresGiftCardIdentityForm;
    if (v === true || v === false) return v;
    return false;
  }, [orderData]);

  /** No order form or shipping-style tracking on summary: membership, A/C bookings, gift cards (after ID verified), other digital lines. */
  const isDigitalFulfillmentSummary =
    isPremiumMembershipSummary ||
    isBookingsOnlyOrder ||
    (isOnlyDigitalProductsSummary && !summaryRequiresGiftCardIdentityForm);

  /** Units / BCF bundles|closures|frontals only — from navigate state or recomputed from cart. */
  const summaryRequiresOrderAuthorizationForm = React.useMemo(() => {
    const v = (orderData as { requiresOrderAuthorizationForm?: boolean } | null)?.requiresOrderAuthorizationForm;
    if (v === true || v === false) return v;
    return cartRequiresOrderAuthorizationForm(cartItems);
  }, [orderData, cartItems]);

  const summaryShowSignOrderFormButton =
    summaryRequiresOrderAuthorizationForm || summaryRequiresGiftCardIdentityForm;

  const showLongPremiumConfirmSummary = React.useMemo(() => {
    try {
      const cu = localStorage.getItem('currentUser');
      if (!cu) return false;
      const u = JSON.parse(cu);
      const st = getEffectiveSubscriptionTier(u);
      return st === '6months' || st === '12months';
    } catch {
      return false;
    }
  }, []);

  const summaryOrderForTracking = React.useMemo(() => {
    const idRaw = (orderData as { orderInternalId?: string }).orderInternalId;
    const giftFirst = summaryRequiresGiftCardIdentityForm;
    if (typeof idRaw === 'string' && idRaw.trim()) {
      return {
        id: idRaw.trim(),
        status: (giftFirst ? 'PLACED' : 'PREPARING') as string,
        digitalFulfillmentOnly: giftFirst ? (true as const) : (false as const),
        ...(giftFirst ? { requiresGiftCardIdentityForm: true as const, orderFormSigned: false as const } : {}),
        adminTrackingStageOverride: null as null,
        trackingTimelineShiftDays: 0,
        trackingStageNotes: {} as Record<string, string>,
      };
    }
    const bookingFlowType = isBookingsOnlyOrder
      ? cartItems.some((i: { type?: string }) => i?.type === 'booking-appointment')
        ? 'appointment'
        : 'consult'
      : undefined;
    return {
      id: 'checkout-summary',
      status: (isDigitalFulfillmentSummary ? 'PLACED' : 'PREPARING') as string,
      digitalFulfillmentOnly: Boolean(isPremiumMembershipSummary || isOnlyDigitalProductsSummary),
      ...(bookingFlowType ? { bookingFlowType } : {}),
      adminTrackingStageOverride: null as null,
      trackingTimelineShiftDays: 0,
      trackingStageNotes: {} as Record<string, string>,
    };
  }, [
    orderData,
    cartItems,
    isBookingsOnlyOrder,
    isDigitalFulfillmentSummary,
    isPremiumMembershipSummary,
    isOnlyDigitalProductsSummary,
    summaryRequiresGiftCardIdentityForm,
  ]);

  // Helper function to get ordinal suffix (ST, ND, RD, TH)
  const getOrdinalSuffix = (day: number): string => {
    if (day >= 11 && day <= 13) {
      return 'TH';
    }
    const lastDigit = day % 10;
    switch (lastDigit) {
      case 1: return 'ST';
      case 2: return 'ND';
      case 3: return 'RD';
      default: return 'TH';
    }
  };

  // Helper: processing timeline date range from orderData.processingTime
  const calculateProcessingTimeline = (orderDateStr: string, processingTime: string): string => {
    try {
      const [month, day, year] = orderDateStr.split('-').map(Number);
      const orderDate = new Date(year, month - 1, day);
      const { min: minWeeks, max: maxWeeks } = processingTimelineWeekRangeFromLabel(processingTime);
      
      // Calculate dates
      const minDate = new Date(orderDate);
      minDate.setDate(minDate.getDate() + (minWeeks * 7));
      
      const maxDate = new Date(orderDate);
      maxDate.setDate(maxDate.getDate() + (maxWeeks * 7));
      
      // Format month names
      const monthNames = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 
                          'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
      
      const minMonth = monthNames[minDate.getMonth()];
      const maxMonth = monthNames[maxDate.getMonth()];
      const minDay = minDate.getDate();
      const maxDay = maxDate.getDate();
      
      const minSuffix = getOrdinalSuffix(minDay);
      const maxSuffix = getOrdinalSuffix(maxDay);
      
      // If same month, format as "MONTH DAYTH - DAYTH", otherwise "MONTH DAYTH - MONTH DAYTH"
      if (minMonth === maxMonth) {
        return `${minMonth} ${minDay}${minSuffix} - ${maxDay}${maxSuffix}`;
      } else {
        return `${minMonth} ${minDay}${minSuffix} - ${maxMonth} ${maxDay}${maxSuffix}`;
      }
    } catch (e) {
      // Fallback to original format if parsing fails
      return processingTime || '6-8 WEEKS';
    }
  };

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
  }), []);

  // Load cart items from location state or localStorage (strip bundle-deal lines from storage if user lost premium)
  useEffect(() => {
    if (location.state && location.state.cartItems) {
      setCartItems(location.state.cartItems);
    } else {
      try {
        const savedCart = localStorage.getItem('cartItems');
        if (savedCart) {
          const items = JSON.parse(savedCart);
          const strip = stripIneligibleBcfBundleDealLines(Array.isArray(items) ? items : []);
          if (strip.removedUnitCount > 0) {
            localStorage.setItem('cartItems', JSON.stringify(strip.next));
            const newCount = strip.next.reduce((sum: number, ci: any) => sum + (ci.quantity || 1), 0);
            localStorage.setItem('cartCount', String(newCount));
            window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: newCount }));
            window.dispatchEvent(new CustomEvent('cartItemsChanged'));
            window.dispatchEvent(new Event('cartUpdated'));
          }
          setCartItems(strip.next);
        }
      } catch (e) {
        console.error('Error loading cart items:', e);
      }
    }
  }, [location.state]);

  // Sync points + tier from checkout (location.state + sessionStorage) into orderData and rewards state so summary always matches
  useEffect(() => {
    const state = location.state as { pointsEarned?: number; tier?: string } | null;
    const hasPoints = state?.pointsEarned !== undefined && state?.pointsEarned !== null;
    const hasTier = state?.tier != null && state?.tier !== '';
    if (hasPoints || hasTier) {
      const next = { pointsEarned: hasPoints ? state!.pointsEarned : undefined, tier: hasTier ? state!.tier : undefined };
      setRewardsFromCheckout((prev) => ({ ...prev, ...next }));
      try {
        sessionStorage.setItem('checkoutSummaryRewards', JSON.stringify({ pointsEarned: next.pointsEarned, tier: next.tier }));
      } catch (_) {}
      setOrderData((prev: any) => ({
        ...prev,
        ...(hasPoints && { pointsEarned: state!.pointsEarned }),
        ...(hasTier && { tier: state!.tier }),
      }));
      return;
    }
    try {
      const raw = sessionStorage.getItem('checkoutSummaryRewards');
      if (raw) {
        const p = JSON.parse(raw);
        if (p.pointsEarned !== undefined || (p.tier != null && p.tier !== '')) {
          setRewardsFromCheckout((prev) => ({ ...prev, pointsEarned: p.pointsEarned, tier: p.tier }));
          setOrderData((prev: any) => ({
            ...prev,
            ...(p.pointsEarned !== undefined && { pointsEarned: p.pointsEarned }),
            ...(p.tier != null && p.tier !== '' && { tier: p.tier }),
          }));
        }
      }
    } catch (_) {}
  }, [location.state]);

  // Save selected currency to localStorage (per-user key)
  useEffect(() => {
    const key = getPerUserKey(PER_USER_KEYS.selectedCurrency, getCurrentUserEmailFromStorage());
    localStorage.setItem(key, selectedCurrency);
  }, [selectedCurrency]);

  // Listen for currency changes from cart dropdown
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
    
    // Poll localStorage periodically to catch any currency changes
    const interval = setInterval(() => {
      handleCurrencyChange();
    }, 500);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleCurrencyChange);
      window.removeEventListener('currencyChanged', handleCustomCurrencyChange as EventListener);
    };
  }, [currencyRates]);

  // Check if signed in and populate mock data if needed
  useEffect(() => {
    // Check localStorage or session for sign-in status
    const signedIn = localStorage.getItem('isSignedIn') === 'true';
    setIsSignedIn(signedIn);
    
    // Listen for sign-in state changes
    const handleSignInStateChange = (event: CustomEvent) => {
      setIsSignedIn(event.detail === 'true');
    };
    
    window.addEventListener('signInStateChanged', handleSignInStateChange as EventListener);
    
    return () => {
      window.removeEventListener('signInStateChanged', handleSignInStateChange as EventListener);
    };
    
    // If no order data from location state, populate with mock data
    if (!location.state) {
      // Calculate order total from cart items (use 1290 as default if cart is empty)
      const calculatedTotal = cartItems.length > 0 
        ? cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0)
        : 1290;
      
      // Calculate taxable amount (exclude gift cards and digital items)
      const taxableAmount = cartItems.length > 0
        ? cartItems.reduce((sum, item) => {
            // Skip gift cards and digital items
            const isGiftCard = item.name === 'GIFT CARD' || item.type === 'gift-card';
            const isDigital = item.type === 'digital';
            
            if (isGiftCard || isDigital) {
              return sum; // Don't add to taxable amount
            }
            
            return sum + (item.price || 0) * (item.quantity || 1);
          }, 0)
        : 1290; // Default taxable amount if cart is empty
      
      // Use pointsEarned from location.state (passed from checkout page) when available so summary always matches checkout
      const pointsEarnedFromState = location.state?.pointsEarned;
      let pointsEarned: number | undefined =
        typeof pointsEarnedFromState === 'number' ? pointsEarnedFromState : undefined;

      // Only recalculate when not passed from checkout; use same formula as checkout page
      if (pointsEarned === undefined) {
        // Points-eligible amount: exclude gift cards and digital items; 0 when cart empty (match checkout)
        const pointsEligibleAmount = cartItems.length > 0
          ? cartItems.reduce((sum, item) => {
              const isGiftCard = item.name === 'GIFT CARD' || item.type === 'gift-card';
              const isDigital = item.type === 'digital';
              const isConsultBooking = item.type === 'booking-consult';
              if (isGiftCard || isDigital || isConsultBooking || isMembershipSubscriptionCartLine(item)) return sum;
              return sum + (item.price || 0) * (item.quantity || 1);
            }, 0)
          : 0;

        let multiplier = 1;
        try {
          const currentUser = localStorage.getItem('currentUser');
          const signedIn = localStorage.getItem('isSignedIn') === 'true';
          if (signedIn && currentUser) {
            const user = JSON.parse(currentUser as string);
            const tier: string | null = getEffectiveTierName(user) || (user.currentTierName || user.tier || (user.email ? localStorage.getItem(`lastKnownTier_${(user.email || '').trim().toLowerCase()}`) : null) || '').toString().toUpperCase() || null;
            const subTier: string | null = getEffectiveSubscriptionTier(user);
            multiplier = getPointsMultiplier(tier, subTier).multiplier;
          }
        } catch (_) {}

        // Same as checkout: base on net merchandise after discounts when snapshot exists
        const signedIn = localStorage.getItem('isSignedIn') === 'true';
        let baseUsd = pointsEligibleAmount;
        try {
          const snap = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('checkoutLoyaltyBaseUsd') : null;
          if (typeof snap === 'string' && snap !== '') {
            const n = parseFloat(String(snap));
            if (Number.isFinite(n) && n >= 0) baseUsd = n;
          }
        } catch (_) {}
        const basePoints =
          signedIn && cartHasAnyLoyaltyEarningLine(cartItems) ? Math.round(baseUsd) : 0;
        pointsEarned = Math.round(basePoints * multiplier);
      }

      const taxesProcessing = taxableAmount * 0.10;

      // Shipping with premium discount (match checkout logic): domestic vs international + tier discounts
      const rawCountry = (location.state as any)?.country ?? orderData?.country ?? 'US';
      const countryStr = String(rawCountry).trim().toUpperCase() || 'US';
      const isDomesticCountry = countryStr === 'US' || countryStr === 'USA' || countryStr === 'U.S.' || countryStr === 'U.S.A.' || /^UNITED\s*STATES(\s+OF\s+AMERICA)?$/i.test(countryStr);
      const shippingMethodLabel = (location.state as any)?.shippingMethod || orderData?.shippingMethod || '';
      const isExpress = /express/i.test(shippingMethodLabel);
      const originalShipping = isDomesticCountry ? (isExpress ? 100 : 60) : (isExpress ? 160 : 100);
      let shippingDiscount = 0;
      try {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
          const user = JSON.parse(currentUser as string);
          const premiumTier = getEffectiveSubscriptionTier(user);
          const isDigitalOnly = cartItems.length > 0 && cartItems.every((item: any) => item.type === 'digital' || item.name === 'GIFT CARD' || item.type === 'gift-card');
          if (premiumTier && !isDigitalOnly) {
            if (isDomesticCountry) {
              if (!isExpress) {
                if (premiumTier === '3months') shippingDiscount = 20;
                else if (premiumTier === '6months') shippingDiscount = 40;
                else if (premiumTier === '12months') shippingDiscount = 60;
              } else {
                if (premiumTier === '6months') shippingDiscount = 40;
                else if (premiumTier === '12months') shippingDiscount = 40;
              }
            } else {
              if (premiumTier === '12months') shippingDiscount = 40;
            }
          }
        }
      } catch (_) {}
      const shippingHandling = Math.max(0, originalShipping - shippingDiscount);
      const subtotal = calculatedTotal + taxesProcessing + shippingHandling;

      // Tier must match checkout + rewards page toggle (effective tier), not derived from points
      let tier = 'SILVER';
      try {
        const currentUserForTier = localStorage.getItem('currentUser');
        const signedInForTier = localStorage.getItem('isSignedIn') === 'true';
        if (signedInForTier && currentUserForTier) {
          const userForTier = JSON.parse(currentUserForTier as string);
          tier = getEffectiveTierName(userForTier) || 'SILVER';
        }
      } catch (_) {}
      
      const processingTime = getConfirmPageFallbackProcessingLabel(cartItems);
      
      setOrderData((prev: any) => {
        // Get and increment order number if not already set
        let orderNum = prev.orderNumber;
        let confirmNum = prev.confirmationNumber;
        if (!orderNum) {
          const lastOrderNumber = parseInt(localStorage.getItem('lastOrderNumber') || '0', 10);
          const nextOrderNumber = lastOrderNumber + 1;
          localStorage.setItem('lastOrderNumber', nextOrderNumber.toString());
          orderNum = `#${String(nextOrderNumber).padStart(3, '0')}`;
          
          // Generate random 6-character alphanumeric confirmation number and tie it to order number
          const generateConfirmationNumber = () => {
            const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            let result = '';
            for (let i = 0; i < 6; i++) {
              result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
          };
          confirmNum = generateConfirmationNumber();
          const orderConfirmations = JSON.parse(localStorage.getItem('orderConfirmations') || '{}');
          orderConfirmations[orderNum] = confirmNum;
          localStorage.setItem('orderConfirmations', JSON.stringify(orderConfirmations));
        } else if (!confirmNum) {
          // If order number exists but confirmation number doesn't, retrieve or generate it
          const orderConfirmations = JSON.parse(localStorage.getItem('orderConfirmations') || '{}');
          confirmNum = orderConfirmations[orderNum];
          if (!confirmNum) {
            // Generate if not found in storage
            const generateConfirmationNumber = () => {
              const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
              let result = '';
              for (let i = 0; i < 6; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
              }
              return result;
            };
            confirmNum = generateConfirmationNumber();
            orderConfirmations[orderNum] = confirmNum;
            localStorage.setItem('orderConfirmations', JSON.stringify(orderConfirmations));
          }
        }
        
        return {
          ...prev,
          orderNumber: orderNum,
          confirmationNumber: confirmNum,
          orderDate: prev.orderDate || new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, '-'),
          orderTotal: prev.orderTotal && prev.orderTotal > 0 ? prev.orderTotal : subtotal,
          shippingMethod: prev.shippingMethod || 'UPS DOMESTIC STANDARD +$60',
          processingTime: prev.processingTime || processingTime,
          firstName: prev.firstName || 'ASHLEY',
          lastName: prev.lastName || 'EVANS',
          shippingAddress: prev.shippingAddress || '3374 E SHELBY DR APT #106',
          city: prev.city || 'MEMPHIS',
          state: prev.state || 'TN',
          zip: prev.zip || '38035',
          country: prev.country || 'UNITED STATES',
          paymentMethod: prev.paymentMethod || 'CARD ENDING IN XXXX',
          email: prev.email || 'ASHLEYEVANS@GMAIL.COM',
          pointsEarned: (typeof pointsEarned === 'number' ? pointsEarned : prev.pointsEarned) ?? 0, // Prefer points from this run (checkout state or recalc), then prev, then 0
          tier: prev.tier || tier
        };
      });
    } else if (location.state && !location.state.processingTime) {
      const processingTime = getConfirmPageFallbackProcessingLabel(cartItems);
      
      setOrderData((prev: any) => ({
        ...prev,
        processingTime: processingTime
      }));
    }
  }, [location.state, cartItems]);

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
    
    // Calculate scroll limits dynamically based on container and item widths
    const containerWidth = scrollContainerRef.current?.offsetWidth || 0;
    const gap = 20;
    const paddingRight = 10;
    
    // Calculate total content width
    const totalContentWidth = cartItems.reduce((sum, item) => {
      return sum + summaryScrollItemWidthPx(item, Boolean(orderData?.isSubscriptionUpgrade)) + gap;
    }, 0) + paddingRight - gap; // Subtract last gap, add padding
    
    const maxScroll = 0;
    const minScroll = containerWidth - totalContentWidth;
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
    
    // Calculate scroll limits dynamically based on container and item widths
    const containerWidth = scrollContainerRef.current?.offsetWidth || 0;
    const gap = 20;
    const paddingRight = 10;
    
    // Calculate total content width
    const totalContentWidth = cartItems.reduce((sum, item) => {
      return sum + summaryScrollItemWidthPx(item, Boolean(orderData?.isSubscriptionUpgrade)) + gap;
    }, 0) + paddingRight - gap; // Subtract last gap, add padding
    
    const maxScroll = 0;
    const minScroll = containerWidth - totalContentWidth;
    setScrollPosition(Math.max(minScroll, Math.min(maxScroll, newPosition)));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Format price with currency
  const formatPrice = React.useCallback((price: number) => {
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
      navigate(signInHrefWithReturnTo(location));
    }
  };

  const handleSignOut = () => {
    setIsSignedIn(false);
    clearAppAuth();
    // Dispatch custom event to update other pages in same tab
    window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'false' }));
    setShowSignOutConfirm(false);
    // Close mobile menu
    setShowMobileMenu(false);
  };

  const handleHomeClick = () => {
    navigate('/lobby');
  };

  return (
    <>
      <style>{`
${ORDER_TRACKING_PULSATE_KEYFRAMES_CSS}
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
          background-color: #FFFFFF !important;
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
                      onClick={() => navigate('/bag')} 
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
                    <button className="cursor-pointer" style={{ transform: 'translateX(-2px)' }}>
                      <img
                        alt="Search icon"
                        width="16"
                        height="15"
                        src="/assets/search-icon.svg"
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
                      style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}
                    >
                      MENU
                    </span>
                  </>
                ) : (
                  <>
                    <span 
                      style={{ fontFamily: '"Futura PT Book"', fontWeight: '400', cursor: 'pointer' }}
                      onClick={() => navigate('/checkout')}
                    >
                      CHECKOUT &gt;
                    </span>{' '}
                    <span
                      style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}
                    >
                      SUMMARY
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
              className="flex flex-col w-full"
              style={{ 
                minWidth: '100%', 
                maxWidth: 'none', 
                overflow: 'visible',
                minHeight: showMobileMenu ? 'calc(100dvh - 80px)' : 'auto',
                height: showMobileMenu ? 'calc(100dvh - 80px)' : 'auto',
                paddingBottom: showMobileMenu ? '1rem' : '0'
              }}
            >
            {showMobileMenu ? (
              /* MENU CONTENT */
              <div
                className="menu-toggle-card border border-black flex flex-col pt-6 pb-4 px-5 bg-white/60 backdrop-blur-sm w-full transition-all duration-300 ease-out"
                style={{ 
                  borderWidth: '1.3px', 
                  minWidth: '100%', 
                  maxWidth: 'none', 
                  overflow: 'visible',
                  backgroundColor: 'rgba(255, 255, 255, 0.6)',
                  minHeight: 'calc(100dvh - 80px)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
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
              /* REGULAR CONTENT */
              <>
              {/* MAIN CARD */}
              <div
                className="border border-black flex flex-col pt-6 pb-4 px-5 mb-2 bg-white/60 backdrop-blur-sm transition-all duration-300 ease-out"
                style={{ 
                  borderWidth: '1.3px',
                  minWidth: '100%', 
                  maxWidth: 'none', 
                  overflow: 'visible',
                  backgroundColor: 'rgba(255, 255, 255, 0.6)'
                }}
              >
              {/* CONGRATS Header */}
              <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '10px', marginTop: '-10px' }}>
                <h1
                  style={{
                    fontFamily: '"Futura PT Medium"',
                    fontSize: '12px',
                    color: '#EB1C24',
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    margin: '0'
                  }}
                >
                  CONGRATS!
                </h1>
                <span
                  className="text-black font-bold text-lg flex-shrink-0 ml-2 uppercase"
                  style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', fontSize: '15px' }}
                >
                  {cartItems.length}
                </span>
              </div>

              {/* Products Horizontal Scroll */}
              <div 
                ref={scrollContainerRef}
                className="relative overflow-x-auto mb-6"
                style={{ 
                  height: '180px',
                  cursor: isDragging ? 'grabbing' : 'grab',
                  userSelect: 'none',
                  display: 'flex',
                  justifyContent: cartItems.length === 1 ? 'center' : 'flex-start',
                  alignItems: 'center'
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div
                  className="flex"
                  style={{
                    transform: `translateX(${scrollPosition}px)`,
                    transition: 'none',
                    gap: '20px',
                    height: '100%',
                    alignItems: 'flex-start',
                    willChange: 'transform',
                    paddingRight: '10px',
                    justifyContent: cartItems.length === 1 ? 'center' : cartItems.length === 2 ? 'center' : 'flex-start',
                    paddingLeft: cartItems.length >= 3 ? 'calc(50% - 160px)' : undefined,
                    marginLeft: cartItems.length === 1 ? 0 : cartItems.length >= 2 ? '-10px' : undefined,
                  }}
                >
                  {cartItems.map((item, index) => {
                    const stripUpgrade = Boolean(orderData?.isSubscriptionUpgrade);
                    const thumbM = orderStripThumbMetrics(item, stripUpgrade, { checkoutStrip: true });
                    const itemImage = orderStripThumbnailSrc(item, stripUpgrade);
                    const displayTitle = orderStripTitleLine(item);
                    const itemLength = item.length || '24"';
                    const redSubtitle = orderStripRedSubtitle(item, itemLength);
                    const isGiftLineConfirm = isGiftCardCartLine(item);
                    const itemPrice = isGiftLineConfirm
                      ? giftCardLineTotalUsd(item)
                      : item.price || 580;
                    const useDigitalStack = orderStripUseDigitalStackLayout(item, stripUpgrade);
                    const isBcfBundleDeal = Boolean(item.bcfBundleDeal);
                    const bundleDealListSum = bcfBundleDealResolvedListSubtotal(item);
                    const bundleLineTotalSum = itemPrice * (item.quantity || 1);
                    const titleFontPx = orderStripTitleFontPx(item);

                    return (
                      <div
                        key={index}
                        className="flex-shrink-0"
                        style={{
                          width: `${thumbM.cellWidthPx}px`,
                          minHeight: '150px',
                          height: 'auto',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'flex-start',
                          paddingTop:
                            item?.type === 'booking-appointment' || item?.type === 'booking-consult'
                              ? '2px'
                              : '8px',
                          paddingRight: '8px',
                          paddingBottom: '8px',
                          paddingLeft: '8px'
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
                            transform: useDigitalStack ? 'translateY(-1px)' : 'none'
                          }}
                        >
                          {displayTitle}
                        </p>
                        <p
                          style={{
                            fontFamily: '"Futura PT Medium"',
                            fontSize: '8px',
                            color: '#EB1C24',
                            marginTop: (() => {
                              const hasSpecs = (item.density && item.density !== '200%') || 
                                             (item.lace && item.lace !== '13X6') || 
                                             (item.color && item.color !== (item.name === 'BLANCO' ? 'PLATINUM' : 'OFF BLACK')) || 
                                             (item.hairline && item.hairline !== 'NATURAL') || 
                                             (item.styling && item.styling !== 'NONE') || 
                                             (item.addOns && item.addOns.length > 0) ||
                                             (item.capSize && (item.capSize === 'XXS/XS/S' || item.capSize === 'S/M/L')) ||
                                             (item.length && item.length !== '24"');
                              const isBlancoNoSpecs = item.name === 'BLANCO' && !hasSpecs;
                              if (useDigitalStack) return '-2px';
                              if (isBlancoNoSpecs) return '-2px';
                              return '-2px';
                            })(),
                            transform: 'translateY(3px)',
                            lineHeight: '1.1',
                            marginBottom: '0',
                            textTransform: 'uppercase',
                            textAlign: 'center'
                          }}
                        >
                          {redSubtitle}
                        </p>
                        {!useDigitalStack && item.capSize && (
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
                              margin: '1px 0 0 0',
                              textAlign: 'center',
                              textTransform: 'uppercase'
                            }}
                          >
                            {bundleDealListSum != null && bundleDealListSum > bundleLineTotalSum && (
                              <span
                                style={{
                                  fontFamily: '"Futura PT Medium"',
                                  fontSize: '9px',
                                  fontWeight: '500',
                                  color: '#808080',
                                  textDecoration: 'line-through',
                                  marginRight: '6px'
                                }}
                                dangerouslySetInnerHTML={formatPrice(bundleDealListSum)}
                              />
                            )}
                            <span
                              style={{
                                fontFamily: '"Futura PT Medium"',
                                fontSize: '10px',
                                fontWeight: '500',
                                color: '#000000'
                              }}
                              dangerouslySetInnerHTML={formatPrice(bundleLineTotalSum)}
                            />
                          </div>
                        ) : (
                        <p
                          style={{
                            fontFamily: '"Futura PT Medium"',
                            fontSize: '10px',
                            fontWeight: '500',
                            color: '#000000',
                            margin: useDigitalStack ? '4px 0 0 0' : '1px 0 0 0',
                            textTransform: 'uppercase',
                            textAlign: 'center'
                          }}
                          dangerouslySetInnerHTML={formatPrice(itemPrice)}
                        />
                        )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Border line above Order Processing Message */}
              <div>
              <div style={{ 
                  paddingTop: '0',
                  paddingBottom: '1px',
                borderTop: '1.3px solid #000',
                  marginTop: '-6px'
              }}>
                </div>
              </div>

              {/* Order Processing Message */}
              <p
                style={{
                  fontFamily: '"Futura PT Book"',
                  fontSize: '10px',
                  color: '#000000',
                  margin: '13px 0 0 0',
                  textTransform: 'uppercase',
                  lineHeight: '1.4',
                  textAlign: 'center',
                  fontWeight: '600'
                }}
              >
                {isPremiumMembershipSummary ? (
                  <>THANK YOU! YOUR <span style={{ color: '#EB1C24' }}>PREMIUM MEMBERSHIP</span> PURCHASE IS COMPLETE.<br />ACCESS AND BENEFITS WILL REFLECT ON YOUR ACCOUNT SHORTLY.</>
                ) : isDigitalFulfillmentSummary ? (
                  <>THANK YOU! YOUR ORDER IS <span style={{ color: '#EB1C24' }}>PLACED</span>. STATUS MOVES <span style={{ color: '#EB1C24' }}>PLACED → PROCESSING → COMPLETE</span> ON YOUR ORDERS PAGE — NO SHIPPING OR ORDER FORM FOR THIS PURCHASE.</>
                ) : summaryRequiresOrderAuthorizationForm ? (
                  <>YOUR ORDER IS BEING PROCESSED BUT YOU'RE NOT FINISHED YET.<br/>YOU STILL NEED TO <span style={{ color: '#EB1C24' }}>COMPLETE + SIGN</span> AN ORDER FORM WITHIN 24 HOURS OR YOUR ORDER WILL BE <span style={{ color: '#EB1C24' }}>CANCELED + REFUNDED</span>.</>
                ) : (
                  <>THANK YOU! YOUR ORDER IS <span style={{ color: '#EB1C24' }}>PLACED</span>. VIEW STATUS ON YOUR ORDERS PAGE.</>
                )}
              </p>
              </div>
              </>
            )}
            </div>

            {/* ORDER SUMMARY CARD - Only show when menu is closed */}
            {!showMobileMenu && (() => {
              const accountUser = (() => { try { const u = localStorage.getItem('currentUser'); return u ? JSON.parse(u) : null; } catch { return null; } })();
              const addr = accountUser?.defaultAddress || accountUser?.shippingAddress;
              return (
              <div
                className="border border-black flex flex-col pt-6 pb-4 px-5 mb-2 bg-white/60 backdrop-blur-sm transition-all duration-300 ease-out"
                style={{ borderWidth: '1.3px' }}
              >
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
                    <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>
                      {orderData.orderDate}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>
                      ORDER TOTAL
                    </span>
                    <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }} dangerouslySetInnerHTML={formatPrice(orderData.orderTotal || 0)} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>
                      ORDER NUMBER
                    </span>
                    <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>
                      {orderData.orderNumber}
                    </span>
                  </div>
                </div>
              </div>

              {/* SHIPPING — hidden for digital / A&C / membership (no ship tracking on summary) */}
              {!isDigitalFulfillmentSummary && (
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
                  <img src="/assets/ship-icon.svg" alt="" style={{ width: 12.83, height: 12.83, opacity: 1 }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>
                      COMPLETION TIMELINE
                    </span>
                    <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>
                      {orderData.orderDate ? calculateProcessingTimeline(orderData.orderDate, orderData.processingTime || '6-8 WEEKS') : (orderData.processingTime || '6-8 WEEKS')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>
                      CARRIER
                    </span>
                    <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>
                      {(() => {
                        const c = String(orderData.country || addr?.country || 'UNITED STATES').trim().toUpperCase();
                        const isDomestic = c === 'US' || c === 'USA' || c === 'U.S.' || c === 'U.S.A.' || /^UNITED\s*STATES(\s+OF\s+AMERICA)?$/i.test(c);
                        return isDomestic ? 'DOMESTIC' : 'INTERNATIONAL';
                      })()}
                    </span>
                  </div>
                  {(() => {
                    const shippingMethod = orderData.shippingMethod || 'UPS DOMESTIC STANDARD +$60';
                    const methodUpper = shippingMethod.toUpperCase();
                    const isExpress = methodUpper.includes('EXPRESS');
                    const processingTime = (orderData.processingTime || '').toUpperCase();
                    const isRush = /RUSH|3\s*[-–]\s*4|3\s*TO\s*4|4\s*[-–]\s*6|4\s*TO\s*6/.test(processingTime);
                    const displayLabel = (isRush ? 'RUSH ' : '') + (isExpress ? 'EXPRESS' : 'STANDARD') + ' SHIPPING';
                    const c = String(orderData.country || addr?.country || 'UNITED STATES').trim().toUpperCase();
                    const isDomestic = c === 'US' || c === 'USA' || c === 'U.S.' || c === 'U.S.A.' || /^UNITED\s*STATES(\s+OF\s+AMERICA)?$/i.test(c);
                    const shippingTime = isDomestic
                      ? (isExpress ? '1-2 BUSINESS DAYS' : '3-5 BUSINESS DAYS')
                      : (isExpress ? '3-5 BUSINESS DAYS' : '7-14 BUSINESS DAYS');
                    return (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>
                          {displayLabel}
                        </span>
                        <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>
                          {shippingTime}
                        </span>
                      </div>
                    );
                  })()}
                  <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', margin: '0', textTransform: 'uppercase' }}>
                    {orderData.firstName || accountUser?.firstName || ''} {orderData.lastName || accountUser?.lastName || ''}
                  </p>
                  <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', margin: '0', textTransform: 'uppercase' }}>
                    {orderData.shippingAddress || addr?.address || ''}
                  </p>
                  <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', margin: '0', textTransform: 'uppercase' }}>
                    {orderData.city || addr?.city || ''}, {orderData.state || addr?.state || ''} {orderData.zip || addr?.zip || ''}
                  </p>
                  <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', margin: '0', textTransform: 'uppercase' }}>
                    {orderData.country || addr?.country || 'UNITED STATES'}
                  </p>
                </div>
              </div>
              )}

              {isDigitalFulfillmentSummary && (
                <div style={{ marginBottom: '20px' }}>
                  <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '10px', marginTop: '-12px' }}>
                    <h2
                      style={{
                        fontFamily: '"Futura PT Medium"',
                        fontSize: '12px',
                        color: '#EB1C24',
                        fontWeight: '500',
                        textTransform: 'uppercase',
                        margin: '0',
                      }}
                    >
                      ORDER STATUS
                    </h2>
                    <img
                      src="/assets/order-tracking.svg"
                      alt=""
                      style={{
                        width: 18,
                        height: 18,
                        filter:
                          'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)',
                      }}
                    />
                  </div>
                  <p
                    style={{
                      fontFamily: '"Futura PT Book"',
                      fontSize: '9px',
                      color: '#666',
                      margin: '0 0 10px 0',
                      textTransform: 'uppercase',
                      lineHeight: 1.45,
                    }}
                  >
                    DIGITAL SERVICE — NO SHIPPING OR ORDER FORM. STATUS UPDATES HERE.
                  </p>
                  {(() => {
                    const di = getDigitalFulfillmentStageIndex(summaryOrderForTracking);
                    const labels = digitalFulfillmentStageLabels();
                    const consultBarPct = consultDigitalOrderTrackingBarFillPct(
                      summaryOrderForTracking,
                      Date.now()
                    );
                    return (
                      <>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
                        {labels.map((label, i) => {
                          const isCurrent = i === di;
                          return (
                            <div
                              key={`confirm-dig-${i}`}
                              style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}
                            >
                              <span style={orderTrackBubbleStyleConfirm(isCurrent, isCurrent)} aria-hidden />
                              <p style={orderTrackStepLabelStyleConfirm(isCurrent)}>{label}</p>
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
                    let methodName = ''; // Left: VISA, MASTERCARD, AMERICAN EXPRESS, etc.
                    let last4 = '';     // Right: last 4 digits only (no XXXX when we have data)
                    const fromOrder = orderData.paymentMethod;
                    if (fromOrder) {
                      const endingMatch = fromOrder.match(/ENDING IN (\d+)/i);
                      last4 = endingMatch ? endingMatch[1] : '';
                      let brandPart = fromOrder.replace(/\s*ENDING IN \d+.*$/i, '').trim().replace(/_/g, ' ');
                      methodName = (brandPart === 'EXPRESS' ? 'AMERICAN EXPRESS' : brandPart).toUpperCase();
                    }
                    if (!methodName || !last4) {
                      try {
                        const currentUser = localStorage.getItem('currentUser');
                        if (currentUser) {
                          const user = JSON.parse(currentUser);
                          const def = user.defaultPaymentMethod;
                          if (def && def.cardNumber) {
                            last4 = String(def.cardNumber).replace(/\D/g, '').slice(-4);
                            const b = (def.cardBrand || '').toUpperCase().replace(/_/g, ' ');
                            methodName = (b === 'EXPRESS' || b === 'AMEX') ? 'AMERICAN EXPRESS' : (b || 'CARD');
                          }
                        }
                      } catch (_e) {}
                    }
                    if (!methodName) methodName = 'CARD';
                    if (!last4) last4 = '****';
                    return (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>
                          {methodName}
                        </span>
                        <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>
                          ENDING IN {last4}
                        </span>
                      </div>
                    );
                  })()}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>
                      CONFIRMATION EMAIL
                    </span>
                    <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>
                      {orderData.email || accountUser?.email || ''}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>
                      CONFIRMATION NUMBER
                    </span>
                    <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>
                      #{orderData.confirmationNumber || (() => {
                        // Retrieve confirmation number from localStorage if order number exists
                        if (orderData.orderNumber) {
                          const orderConfirmations = JSON.parse(localStorage.getItem('orderConfirmations') || '{}');
                          const storedConfirmation = orderConfirmations[orderData.orderNumber];
                          if (storedConfirmation) {
                            return storedConfirmation;
                          }
                        }
                        // Generate new confirmation number if not found
                        const generateConfirmationNumber = () => {
                          const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                          let result = '';
                          for (let i = 0; i < 6; i++) {
                            result += chars.charAt(Math.floor(Math.random() * chars.length));
                          }
                          return result;
                        };
                        const confirmationNumber = generateConfirmationNumber();
                        if (orderData.orderNumber) {
                          const orderConfirmations = JSON.parse(localStorage.getItem('orderConfirmations') || '{}');
                          orderConfirmations[orderData.orderNumber] = confirmationNumber;
                          localStorage.setItem('orderConfirmations', JSON.stringify(orderConfirmations));
                        }
                        return confirmationNumber;
                      })()}
                    </span>
                  </div>
                </div>
              </div>

              {!isDigitalFulfillmentSummary &&
                showLongPremiumConfirmSummary &&
                !orderUsesDigitalFulfillmentTimeline(summaryOrderForTracking) && (
                  <div style={{ marginBottom: '20px' }}>
                    <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '10px', marginTop: '-12px' }}>
                      <h2
                        style={{
                          fontFamily: '"Futura PT Medium"',
                          fontSize: '12px',
                          color: '#EB1C24',
                          fontWeight: '500',
                          textTransform: 'uppercase',
                          margin: '0',
                        }}
                      >
                        ORDER TRACKING
                      </h2>
                      <img
                        src="/assets/order-tracking.svg"
                        alt=""
                        style={{
                          width: 18,
                          height: 18,
                          filter:
                            'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)',
                        }}
                      />
                    </div>
                    {(() => {
                      const ord = summaryOrderForTracking as unknown as Record<string, unknown>;
                      const st = getOrderTrackingStageFromOrder(ord);
                      const shift = Number((summaryOrderForTracking as { trackingTimelineShiftDays?: number }).trackingTimelineShiftDays) || 0;
                      const deliveredRowCurrent = orderTrackingDeliveredRowIsCurrent(ord, st);
                      return (
                        <>
                          {shift !== 0 && (
                            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#808080', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
                              TIMELINE ADJUSTMENT: {shift > 0 ? `+${shift}` : shift} DAY{Math.abs(shift) === 1 ? '' : 'S'}
                            </p>
                          )}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
                            {ORDER_TRACKING_STAGE_LABELS.map((label, i) => {
                              const notes = (summaryOrderForTracking as { trackingStageNotes?: Record<string, string> }).trackingStageNotes;
                              const note = notes?.[String(i)]?.trim();
                              const isCurrent = orderTrackingStageRowIsCurrent(ord, i, st);
                              return (
                                <div key={`confirm-st-${i}`}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={orderTrackBubbleStyleConfirm(isCurrent, isCurrent)} aria-hidden />
                                    <p style={orderTrackStepLabelStyleConfirm(isCurrent)}>{label}</p>
                                  </div>
                                  {note ? (
                                    <p
                                      style={{
                                        fontFamily: '"Futura PT Book"',
                                        fontSize: '9px',
                                        color: '#666',
                                        margin: '2px 0 0 0',
                                        textTransform: 'uppercase',
                                        lineHeight: 1.35,
                                        paddingLeft: `${ORDER_TRACK_BUBBLE_PX + 6}px`,
                                      }}
                                    >
                                      {note}
                                    </p>
                                  ) : null}
                                </div>
                              );
                            })}
                            {orderShowsDeliveredTrackingLine(ord) ? (
                              <div key="confirm-st-delivered">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={orderTrackBubbleStyleConfirm(deliveredRowCurrent, deliveredRowCurrent)} aria-hidden />
                                  <p style={orderTrackStepLabelStyleConfirm(deliveredRowCurrent)}>DELIVERED</p>
                                </div>
                              </div>
                            ) : null}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

              {/* REWARDS - sessionStorage (from checkout) first, then compute from same logic as checkout so toggle + cart always match (hidden for premium membership — no points) */}
              {(() => {
                if (isPremiumMembershipSummary) return null;
                let displayPoints: number | undefined;
                let displayTier: string | undefined;
                try {
                  const raw = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('checkoutSummaryRewards') : null;
                  if (raw) {
                    const p = JSON.parse(raw);
                    if (p.pointsEarned !== undefined && p.pointsEarned !== null) displayPoints = p.pointsEarned;
                    if (p.tier != null && p.tier !== '') displayTier = p.tier;
                  }
                } catch (_) {}
                if (displayPoints === undefined || displayTier === undefined) {
                  try {
                    const signedIn = typeof localStorage !== 'undefined' && localStorage.getItem('isSignedIn') === 'true';
                    const currentUserRaw = typeof localStorage !== 'undefined' ? localStorage.getItem('currentUser') : null;
                    const user = currentUserRaw ? JSON.parse(currentUserRaw) : null;
                    const tier = getEffectiveTierName(user) || (user?.currentTierName || user?.tier || '')?.toString().toUpperCase() || null;
                    const subTier = getEffectiveSubscriptionTier(user);
                    const mult = getPointsMultiplier(tier, subTier).multiplier;
                    let pointsEligibleAmount = (cartItems || []).reduce((sum: number, item: any) => {
                      if (
                        item?.name === 'GIFT CARD' ||
                        item?.type === 'gift-card' ||
                        item?.type === 'digital' ||
                        item?.type === 'booking-consult' ||
                        isMembershipSubscriptionCartLine(item)
                      )
                        return sum;
                      return sum + (item?.price || 0) * (item?.quantity || 1);
                    }, 0);
                    try {
                      const snap = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('checkoutLoyaltyBaseUsd') : null;
                      if (snap != null && snap !== '') {
                        const n = parseFloat(String(snap));
                        if (Number.isFinite(n) && n >= 0) pointsEligibleAmount = n;
                      }
                    } catch (_) {}
                    const basePoints =
                      signedIn && cartHasAnyLoyaltyEarningLine(cartItems)
                        ? Math.round(pointsEligibleAmount)
                        : 0;
                    if (displayPoints === undefined) displayPoints = Math.round(basePoints * mult);
                    if (displayTier === undefined) displayTier = (getEffectiveTierName(user) || orderData.tier || accountUser?.tier || 'SILVER').toString().toUpperCase();
                  } catch (_) {}
                }
                if (displayPoints === undefined) {
                  displayPoints =
                    rewardsFromCheckout.pointsEarned ??
                    (location.state as any)?.pointsEarned ??
                    orderData.pointsEarned ??
                    orderData.orderTotal ??
                    0;
                }
                if (!cartHasAnyLoyaltyEarningLine(cartItems)) displayPoints = 0;
                if (displayTier === undefined) displayTier = rewardsFromCheckout.tier || (location.state as any)?.tier || orderData.tier || accountUser?.tier || 'SILVER';
                const tierUpper = String(displayTier).toUpperCase();
                return (
                <div style={{ marginBottom: '5px' }}>
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
                      REWARDS
                    </h2>
                    <img src="/assets/rewards-icon.svg" alt="" style={{ width: 15, height: 15, opacity: 1, filter: 'invert(27%) sepia(98%) saturate(7151%) hue-rotate(346deg) brightness(92%) contrast(92%)' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', margin: '0', textTransform: 'uppercase' }}>
                        YOU'VE EARNED <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"' }}>{Number(displayPoints).toLocaleString()}</span> LOYALTY POINTS{Number(displayPoints) === 0 ? '.' : '!'}
                      </p>
                      <span style={{ 
                        fontFamily: (tierUpper === 'RED' || tierUpper === 'GOLD') ? '"Futura PT Medium"' : '"Futura PT Demi"',
                        fontSize: '10px', 
                        color: tierUpper === 'RED' ? '#EB1C24' : tierUpper === 'SILVER' ? '#808080' : (tierUpper === 'GOLD' || tierUpper === 'BLACK') ? '#000000' : '#808080',
                        textTransform: 'uppercase' 
                      }}>
                        {tierUpper} TIER
                      </span>
                    </div>
                  </div>
                </div>
              );
              })()}
              </div>
            );
            })()}

            {/* Sign Order Form — below summary card (aligned with Orders expanded flow) */}
            {!showMobileMenu && !isDigitalFulfillmentSummary && summaryShowSignOrderFormButton && (
              <div className="px-0 md:px-0" style={{ marginTop: '2px', marginBottom: '20px' }}>
                <button
                  onClick={() => {
                    navigate('/tools/order-form', {
                      state: {
                        orderId: (orderData as { orderInternalId?: string }).orderInternalId,
                        orderNumber: orderData.orderNumber,
                        orderDate: orderData.orderDate,
                        firstName: orderData.firstName,
                        lastName: orderData.lastName,
                        email: orderData.email,
                        shippingAddress: orderData.shippingAddress,
                        city: orderData.city,
                        state: orderData.state,
                        zip: orderData.zip,
                        country: orderData.country,
                        giftCardIdentityVerificationOnly: summaryRequiresGiftCardIdentityForm,
                      },
                    });
                  }}
                  className="border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
                  style={{
                    borderWidth: '1.3px',
                    color: '#EB1C24',
                    fontFamily: '"Futura PT Medium"',
                    backgroundColor: '#FFFFFF',
                    textTransform: 'uppercase',
                  }}
                  type="button"
                >
                  {summaryRequiresGiftCardIdentityForm && !summaryRequiresOrderAuthorizationForm
                    ? 'VERIFY ID — ONE-TIME FOR GIFT CARDS'
                    : 'SIGN ORDER FORM'}
                </button>
              </div>
            )}

            {showLongPremiumConfirmSummary && (orderData as { orderInternalId?: string }).orderInternalId && (
              <div className="px-0 w-full" style={{ marginTop: '2px', marginBottom: '12px' }}>
                <button
                  type="button"
                  className="relative z-10 border border-black w-full text-center py-2 bg-white cursor-pointer hover:bg-gray-50 uppercase"
                  style={{ borderWidth: '1.3px', color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontSize: '11px', fontWeight: 500 }}
                  onClick={() =>
                    navigate(
                      `/account/concierge?orderId=${encodeURIComponent(String((orderData as { orderInternalId?: string }).orderInternalId))}#order-tracking`
                    )
                  }
                >
                  GO TO CONCIERGE
                </button>
              </div>
            )}

            {/* Navigation Buttons */}
            {!showMobileMenu && (
              <>
                <div className="px-0 md:px-0" style={{ marginTop: '2px' }}>
                  <button
                    onClick={handleHomeClick}
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
                    HOME
                  </button>
                </div>
                {!isBookingsOnlyOrder && (
                <div className="px-0 md:px-0" style={{ marginTop: '10px' }}>
                  <button
                    onClick={() => {
                      if (isSignedIn) {
                        navigate('/account/orders');
                      } else {
                        navigate(signInHrefWithReturnTo(location));
                      }
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
                    TRACK YOUR ORDERS
                  </button>
                </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
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

export default CheckoutConfirmPage;

