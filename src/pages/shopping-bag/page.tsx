import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DynamicCartIcon from '../../components/DynamicCartIcon';
import ConfirmationModal from '../../components/ConfirmationModal';
import AddToListModal from '../../components/AddToListModal';
import BrandMenuLinks from '../../components/BrandMenuLinks';
import SocialMenuIcons from '../../components/SocialMenuIcons';
import { getPerUserKey, getCurrentUserEmailFromStorage, PER_USER_KEYS } from '../../utils/perUserStorage';
import { sortCartPremiumBookingFirst } from '../../utils/bookingCart';
import { bookingAppointmentHrefForCartItem, bookingConsultationHrefForCartItem } from '../../utils/bookingMemberRoutes';
import {
  beginEditAppointmentFromCart,
  bookingEditLinkClassName,
  bookingEditLinkStyle
} from '../../utils/bookingAppointmentFormDraft';
import {
  bookingCartItemThumbnailSrc,
  BOOKING_APPOINTMENT_CART_BADGE_IMG_PX,
  BOOKING_CART_BADGE_IMG_PX
} from '../../utils/bookingBadges';
import {
  shopBcfPdpHrefFromCartItem,
  shopBcfCartLineThumbnailSrc,
  bcfBundleDealResolvedListSubtotal
} from '../../utils/bcfProductOptions';
import {
  CART_RED_LINE_BCF_BOOKING,
  bookingCartRedSubtitle,
  bookingCartViewDetailsHtml
} from '../../utils/cartLineRedAndDetails';
import { getPointsMultiplier } from '../../constants/tiers';
import { getEffectiveTierName, getEffectiveSubscriptionTier, clearAppAuth } from '../../utils/adminAuth';
import {
  isPremiumGatedCartLine,
  isPremiumMemberForGatedFeatures,
  stripIneligibleBcfBundleDealLines
} from '../../utils/premiumMemberAccess';
import { trackActivity } from '../../utils/activity';
import { ShopMobileMenuShopTab } from '../../components/ShopMobileMenuShopTab';
import { ShopMobileMenuToolsTab } from '../../components/ShopMobileMenuToolsTab';
import { signInHrefWithReturnTo } from '../../utils/signInReturnTo';
import { useShopNavSearchBar } from '../../components/shop/useShopNavSearchBar';
import { checkoutPathForCartItems } from '../../utils/checkoutNavigatePath';
import {
  applyGiftCardBagQuantityDelta,
  isGiftCardCartLine,
  migrateGiftCardCartLinesForStorage,
} from '../../utils/giftCardCheckout';

/** Match `CartDropdown` thumb sizes / booking + BCF layout. */
const BAG_UNIT_THUMB_PX = 88;
const BAG_BCF_THUMB_PX = Math.round(BAG_UNIT_THUMB_PX * 0.85 * 1.05);
const BAG_BOOKING_BADGE_PX = BOOKING_CART_BADGE_IMG_PX;
const BAG_BOOKING_APPOINTMENT_BADGE_PX = BOOKING_APPOINTMENT_CART_BADGE_IMG_PX;
const BAG_GIFT_THUMB_PX = 108;

function bagRowCartThumbBoxPx(item: { name?: string; type?: string }): number {
  if (item.name === 'GIFT CARD' || item.type === 'gift-card') return BAG_GIFT_THUMB_PX;
  if (item.type === 'booking-appointment') return BAG_BOOKING_APPOINTMENT_BADGE_PX;
  if (item.type === 'booking-consult') return BAG_BOOKING_BADGE_PX;
  if (item.type === 'shop-texture-category') return BAG_BCF_THUMB_PX;
  return BAG_UNIT_THUMB_PX;
}

/** Black title line — same rules as cart dropdown. */
function bagProductTitleLine(item: { name?: string; type?: string; category?: string; balance?: number; price?: number }): string {
  if (isGiftCardCartLine(item)) {
    return 'GIFT CARD';
  }
  if (item.type === 'booking-appointment') {
    return 'BOOKING';
  }
  if (item.type === 'booking-consult') {
    return 'CONSULT';
  }
  if (item.type === 'shop-texture-category') {
    const c = item.category;
    if (c === 'bundles') return 'BUNDLES';
    if (c === 'closures') return 'CLOSURES';
    if (c === 'frontals') return 'FRONTALS';
    const head = (item.name || '').split('·')[0]?.trim();
    return head ? head.toUpperCase() : (item.name || '').replace(/WIG/gi, '').trim();
  }
  return (item.name || 'NOIR').replace(/WIG/gi, '').trim();
}

/** Red subtitle — same rules as cart dropdown. */
function bagProductRedSubtitle(item: any, itemLength: string, hairOriginForName: (productName: string) => string): string {
  if (item.name === 'GIFT CARD' || item.type === 'gift-card') return 'DIGITAL ONLY';
  if (item.type === 'booking-consult' || item.type === 'booking-appointment') {
    return bookingCartRedSubtitle(item);
  }
  if (item.type === 'shop-texture-category') {
    return CART_RED_LINE_BCF_BOOKING;
  }
  return `${itemLength} RAW ${hairOriginForName(item.name || 'NOIR')}`;
}

/** Unit wig lines: same origins as cart dropdown. */
/** Gift card bag row: +/- changes **value**; counter shows steps of `giftCardUnitUsd` (default per-card value). */
function giftCardBagStepCount(item: { type?: string; name?: string; giftCardUnitUsd?: number; price?: number; balance?: number }): number {
  if (!isGiftCardCartLine(item)) return 0;
  const u = Math.round(Number(item.giftCardUnitUsd) || Number(item.price) || Number(item.balance) || 0);
  const total = Math.round(Number(item.balance ?? item.price) || 0);
  if (u <= 0) return total > 0 ? 1 : 0;
  return Math.max(0, Math.round(total / u));
}

function bagHairOriginForProductName(productName: string): string {
  switch (productName) {
    case 'NOIR':
      return 'CAMBODIAN';
    case 'BLANCO':
      return 'RUSSIAN';
    case 'SOFT CURL':
      return 'FILIPINO';
    case 'OCEAN CURL':
      return 'VIETNAMESE';
    case 'SOFT WAVE':
      return 'INDIAN';
    case 'BEACH WAVE':
      return 'INDONESIAN';
    default:
      return 'CAMBODIAN';
  }
}

function ShoppingBagLineThumb({
  item,
  itemImage,
  itemName,
  navigate,
  onEditUnit,
  onEditAppointment
}: {
  item: any;
  itemImage: string;
  itemName: string;
  navigate: (path: string) => void;
  onEditUnit?: (item: any) => void;
  onEditAppointment?: (item: any) => void;
}) {
  const isGift = item.name === 'GIFT CARD' || item.type === 'gift-card';
  const isBooking = item.type === 'booking-consult' || item.type === 'booking-appointment';
  const isBcf = item.type === 'shop-texture-category';
  const cartThumbBoxPx = bagRowCartThumbBoxPx(item);
  const bookingBadgeImgPx =
    item.type === 'booking-appointment' ? BAG_BOOKING_APPOINTMENT_BADGE_PX : BAG_BOOKING_BADGE_PX;

  const goPdp = () => {
    let productRoute = '/straight/noir';
    if (isGift) {
      productRoute = '/tools/gift-card';
    } else if (item.type === 'booking-consult') {
      productRoute = bookingConsultationHrefForCartItem(item);
    } else if (item.type === 'booking-appointment') {
      productRoute = bookingAppointmentHrefForCartItem(item);
    } else {
      const bcfHref = shopBcfPdpHrefFromCartItem(item);
      if (bcfHref) productRoute = bcfHref;
      else if (item.name === 'NOIR') productRoute = '/straight/noir';
      else if (item.name === 'BLANCO') productRoute = '/straight/blanco';
      else if (item.name === 'SOFT WAVE') productRoute = '/wavy/soft-wave';
      else if (item.name === 'SOFT CURL') productRoute = '/curly/soft-curl';
      else if (item.name === 'BEACH WAVE') productRoute = '/wavy/beach-wave';
      else if (item.name === 'OCEAN CURL') productRoute = '/curly/ocean-curl';
    }
    navigate(productRoute);
  };

  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{
        flexShrink: 0,
        width: `${BAG_UNIT_THUMB_PX}px`,
        height: '120px',
        minHeight: '120px',
        alignSelf: isBcf || isBooking ? 'center' : 'flex-start'
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transform: isBcf || isBooking ? 'none' : 'translateY(-8px)',
          position: 'relative'
        }}
      >
        <div
          className="flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
          style={{
            width: `${isBooking ? BAG_UNIT_THUMB_PX : cartThumbBoxPx}px`,
            height: `${isBooking ? BAG_UNIT_THUMB_PX : cartThumbBoxPx}px`,
            margin: '0'
          }}
          onClick={goPdp}
        >
          {isBooking ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: 'translateX(2px)'
              }}
            >
              <img
                src={itemImage}
                alt={itemName}
                className="object-contain rounded"
                style={{ width: `${bookingBadgeImgPx}px`, height: `${bookingBadgeImgPx}px` }}
              />
            </div>
          ) : (
            (() => {
              const imgEl = (
                <img
                  src={itemImage}
                  alt={itemName}
                  className={isBcf ? 'object-contain rounded' : 'object-cover rounded'}
                  style={{ width: `${cartThumbBoxPx}px`, height: `${cartThumbBoxPx}px` }}
                />
              );
              return isBcf ? <div style={{ transform: 'translateX(4px)' }}>{imgEl}</div> : imgEl;
            })()
          )}
        </div>
        {item.type === 'booking-appointment' && onEditAppointment ? (
          <p
            className={bookingEditLinkClassName}
            style={bookingEditLinkStyle}
            onClick={(e) => {
              e.stopPropagation();
              onEditAppointment(item);
            }}
          >
            EDIT APPOINTMENT
          </p>
        ) : !isGift && !isBooking && !isBcf && onEditUnit ? (
          <p
            className="font-bold text-center cursor-pointer hover:opacity-80 transition-opacity"
            style={{
              fontFamily: '"Futura PT Book"',
              color: '#EB1C24',
              textTransform: 'uppercase',
              fontSize: '8px',
              marginTop: '4px',
              marginBottom: '0',
              lineHeight: '1.1'
            }}
            onClick={() => onEditUnit(item)}
          >
            EDIT IN BUILD-A-WIG
          </p>
        ) : null}
      </div>
    </div>
  );
}

function ShoppingBagPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { NavCenter, SearchTrigger } = useShopNavSearchBar();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [savedForLater, setSavedForLater] = useState<any[]>([]);
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
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showEmptyBagConfirm, setShowEmptyBagConfirm] = useState(false);
  const [deleteItemConfirm, setDeleteItemConfirm] = useState<{ itemId: string; type: 'cart' | 'saved'; previousQuantity?: number } | null>(null);
  const deleteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [addToListModalOpen, setAddToListModalOpen] = useState(false);
  const [addToListModalItem, setAddToListModalItem] = useState<any>(null);
  const [bagViewDetailsFor, setBagViewDetailsFor] = useState<string | null>(null);

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
  
  // Currency exchange rates (same as CartDropdown)
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

  // Listen for cart count changes and reload items
  useEffect(() => {
    const handleCartCountUpdate = (event: CustomEvent) => {
      setCartCount(event.detail);
      loadCartItems();
      loadSavedForLater();
    };

    const handleStorageChange = () => {
      try {
        const newCartCount = parseInt(localStorage.getItem('cartCount') || '0', 10);
        setCartCount(newCartCount);
        loadCartItems();
        loadSavedForLater();
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

  const loadCartItems = () => {
    try {
      const stored = localStorage.getItem('cartItems');
      if (stored) {
        const items = JSON.parse(stored);
        if (Array.isArray(items)) {
          const clamped = items.map((i: any) => {
            let row = i;
            if (i.consultOfferQtyLocked === true) row = { ...row, quantity: 1 };
            if (i.isSpecialOffer && (i.quantity ?? 1) > 2) row = { ...row, quantity: 2 };
            if (i.bcfBundleDeal) row = { ...row, quantity: 3 };
            return row;
          });
          const cartChanged = items.some((i: any, idx: number) => (i.quantity ?? 1) !== (clamped[idx].quantity ?? 1));
          if (cartChanged) {
            localStorage.setItem('cartItems', JSON.stringify(clamped));
            const newCount = clamped.reduce((sum: number, ci: any) => sum + (ci.quantity || 1), 0);
            localStorage.setItem('cartCount', String(newCount));
            window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: newCount }));
          }
          const giftMigrated = migrateGiftCardCartLinesForStorage(clamped);
          let afterGift = giftMigrated.next;
          if (giftMigrated.changed) {
            localStorage.setItem('cartItems', JSON.stringify(afterGift));
            const newCount = afterGift.reduce((sum: number, ci: any) => sum + (ci.quantity || 1), 0);
            localStorage.setItem('cartCount', String(newCount));
            window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: newCount }));
            window.dispatchEvent(new CustomEvent('cartItemsChanged'));
          }
          const strip = stripIneligibleBcfBundleDealLines(afterGift);
          if (strip.removedUnitCount > 0) {
            localStorage.setItem('cartItems', JSON.stringify(strip.next));
            const newCount = strip.next.reduce((sum: number, ci: any) => sum + (ci.quantity || 1), 0);
            localStorage.setItem('cartCount', String(newCount));
            window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: newCount }));
            window.dispatchEvent(new CustomEvent('cartItemsChanged'));
            window.dispatchEvent(new Event('cartUpdated'));
          }
          setCartItems(sortCartPremiumBookingFirst(strip.next));
        }
      }
    } catch (e) {
      console.error('Error loading cart items:', e);
      setCartItems([]);
    }
  };

  const loadSavedForLater = () => {
    try {
      const stored = localStorage.getItem('savedForLater');
      if (stored) {
        const items = JSON.parse(stored);
        if (Array.isArray(items)) {
          const clamped = items.map((i: any) => {
            let row = i;
            if (i.consultOfferQtyLocked === true) row = { ...row, quantity: 1 };
            if (i.isSpecialOffer && (i.quantity ?? 1) > 2) row = { ...row, quantity: 2 };
            if (i.bcfBundleDeal) row = { ...row, quantity: 3 };
            return row;
          });
          const savedChanged = items.some((i: any, idx: number) => (i.quantity ?? 1) !== (clamped[idx].quantity ?? 1));
          if (savedChanged) {
            localStorage.setItem('savedForLater', JSON.stringify(clamped));
          }
          const giftMigrated = migrateGiftCardCartLinesForStorage(clamped);
          if (giftMigrated.changed) {
            localStorage.setItem('savedForLater', JSON.stringify(giftMigrated.next));
            window.dispatchEvent(new Event('savedItemsChanged'));
          }
          const stripSaved = stripIneligibleBcfBundleDealLines(giftMigrated.next);
          if (stripSaved.removedUnitCount > 0) {
            localStorage.setItem('savedForLater', JSON.stringify(stripSaved.next));
            window.dispatchEvent(new Event('savedItemsChanged'));
          }
          setSavedForLater(stripSaved.next);
        }
      }
    } catch (e) {
      console.error('Error loading saved for later:', e);
      setSavedForLater([]);
    }
  };

  useEffect(() => {
    loadCartItems();
    loadSavedForLater();
  }, []);

  // When user lands on or returns to /bag, always refresh from localStorage so edits from build-a-wig are shown
  useEffect(() => {
    if (location.pathname === '/bag') {
      loadSavedForLater();
      loadCartItems();
    }
  }, [location.pathname]);

  // Sync cart items and saved items when localStorage changes (for real-time updates)
  useEffect(() => {
    const handleCartItemsChange = () => {
      loadCartItems();
    };

    const handleSavedItemsChange = () => {
      loadSavedForLater();
    };

    // Listen for custom events
    window.addEventListener('cartItemsChanged', handleCartItemsChange);
    window.addEventListener('savedItemsChanged', handleSavedItemsChange);

    return () => {
      window.removeEventListener('cartItemsChanged', handleCartItemsChange);
      window.removeEventListener('savedItemsChanged', handleSavedItemsChange);
    };
  }, []);

  // Load selected currency from localStorage on mount (per-user key)
  useEffect(() => {
    const key = getPerUserKey(PER_USER_KEYS.selectedCurrency, getCurrentUserEmailFromStorage());
    const savedCurrency = localStorage.getItem(key);
    if (savedCurrency && currencyRates[savedCurrency as keyof typeof currencyRates]) {
      if (savedCurrency !== selectedCurrency) setSelectedCurrency(savedCurrency);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    
    const interval = setInterval(() => {
      handleCurrencyChange();
    }, 500);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleCurrencyChange);
      window.removeEventListener('currencyChanged', handleCustomCurrencyChange as EventListener);
    };
  }, [currencyRates]);

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

  // Points-eligible amount (exclude gift cards and digital) for loyalty line
  const pointsEligibleAmount = cartItems.reduce((sum, item) => {
    const isGiftCard = item.name === 'GIFT CARD' || item.type === 'gift-card';
    const isDigital = item.type === 'digital';
    if (isGiftCard || isDigital) return sum;
    return sum + (item.price || 0) * (item.quantity || 1);
  }, 0);

  const getPointsMultiplierForUser = (): number => {
    if (!isSignedIn) return 1;
    try {
      const currentUser = localStorage.getItem('currentUser');
      if (!currentUser) return 1;
      const user = JSON.parse(currentUser);
      const tier = getEffectiveTierName(user) || (user.currentTierName || user.tier || (user.email ? localStorage.getItem(`lastKnownTier_${(user.email || '').trim().toLowerCase()}`) : null) || '').toString().toUpperCase() || null;
      const subscriptionTier = (() => {
        try {
          const u = JSON.parse(localStorage.getItem('currentUser') || '{}');
          return getEffectiveSubscriptionTier(u);
        } catch (_) { return null; }
      })();
      const { multiplier } = getPointsMultiplier(tier, subscriptionTier);
      return multiplier;
    } catch (_) {
      return 1;
    }
  };

  const cartLineLabel = (item: { name?: string; productName?: string } | undefined) =>
    (item?.name || item?.productName || '').toString().trim();

  const handleQuantityChange = (itemId: string, delta: number) => {
    try {
      const currentItem = cartItems.find(i => i.id === itemId);
      if (!currentItem) return;
      if (currentItem.consultOfferQtyLocked === true) return;
      if (currentItem.bcfBundleDeal) return;

      const giftDelta = applyGiftCardBagQuantityDelta(
        currentItem,
        delta > 0 ? 1 : -1
      );
      if (giftDelta) {
        if (giftDelta.atMax) return;
        if (giftDelta.removeLine) {
          if (deleteTimeoutRef.current) {
            clearTimeout(deleteTimeoutRef.current);
            deleteTimeoutRef.current = null;
          }
          setDeleteItemConfirm({ itemId, type: 'cart' });
          return;
        }
        const newItems = cartItems.map((i) => (i.id === itemId ? giftDelta.next : i));
        setCartItems(newItems);
        localStorage.setItem('cartItems', JSON.stringify(newItems));
        window.dispatchEvent(new CustomEvent('cartItemsChanged'));
        const newCount = newItems.reduce((sum: number, ci: any) => sum + (ci.quantity || 0), 0);
        localStorage.setItem('cartCount', newCount.toString());
        setCartCount(newCount);
        window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: newCount }));
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        const nm = cartLineLabel(currentItem);
        if (delta === 1) {
          trackActivity('add_to_cart', { source: 'shopping_bag', change: 'quantity_up', productName: nm || undefined });
        } else if (delta === -1) {
          trackActivity('remove_from_cart', { source: 'shopping_bag', change: 'quantity_down', productName: nm || undefined });
        }
        if (deleteTimeoutRef.current) {
          clearTimeout(deleteTimeoutRef.current);
          deleteTimeoutRef.current = null;
        }
        return;
      }

      const maxQty = currentItem.isSpecialOffer ? 2 : 10;
      const currentQty = currentItem.quantity ?? 0;
      const newQty = currentQty + delta;
      
      // If trying to go below 0, show confirmation to delete immediately
      if (newQty < 0) {
        // Clear any existing timeout
        if (deleteTimeoutRef.current) {
          clearTimeout(deleteTimeoutRef.current);
          deleteTimeoutRef.current = null;
        }
        setDeleteItemConfirm({ itemId, type: 'cart' });
        return;
      }
      
      const clampedQty = Math.max(0, Math.min(maxQty, newQty));
      const newItems = cartItems.map((i) => {
        if (i.id !== itemId) return i;
        return { ...i, quantity: clampedQty };
      });
      setCartItems(newItems);
      localStorage.setItem('cartItems', JSON.stringify(newItems));
      window.dispatchEvent(new CustomEvent('cartItemsChanged'));
      
      // Update cart count (treat 0 as 0, not 1)
      const newCount = newItems.reduce((sum: number, ci: any) => sum + (ci.quantity || 0), 0);
      localStorage.setItem('cartCount', newCount.toString());
      setCartCount(newCount);
      window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: newCount }));
      window.dispatchEvent(new CustomEvent('cartUpdated'));

      const nm = cartLineLabel(currentItem);
      if (delta === 1 && newQty >= 1) {
        trackActivity('add_to_cart', { source: 'shopping_bag', change: 'quantity_up', productName: nm || undefined });
      } else if (delta === -1 && newQty > 0) {
        trackActivity('remove_from_cart', { source: 'shopping_bag', change: 'quantity_down', productName: nm || undefined });
      }
      
      // If quantity becomes 0, set timeout to show popup after 400ms
      if (newQty === 0) {
        // Clear any existing timeout
        if (deleteTimeoutRef.current) {
          clearTimeout(deleteTimeoutRef.current);
        }
        deleteTimeoutRef.current = setTimeout(() => {
          setDeleteItemConfirm({ itemId, type: 'cart', previousQuantity: currentQty });
          deleteTimeoutRef.current = null;
        }, 400);
      } else {
        // If quantity is not 0, clear any pending timeout
        if (deleteTimeoutRef.current) {
          clearTimeout(deleteTimeoutRef.current);
          deleteTimeoutRef.current = null;
        }
      }
    } catch (e) {
      console.error('Error updating quantity:', e);
    }
  };

  const confirmDeleteItem = () => {
    if (!deleteItemConfirm) return;
    
    // Clear any pending timeout
    if (deleteTimeoutRef.current) {
      clearTimeout(deleteTimeoutRef.current);
      deleteTimeoutRef.current = null;
    }
    
    if (deleteItemConfirm.type === 'cart') {
      handleRemoveItem(deleteItemConfirm.itemId);
    } else {
      handleRemoveFromSaved(deleteItemConfirm.itemId);
    }
    
    setDeleteItemConfirm(null);
  };

  const handleRemoveItem = (itemId: string) => {
    try {
      const removed = cartItems.find((i) => i.id === itemId);
      const nm = cartLineLabel(removed);
      const newItems = cartItems.filter(i => i.id !== itemId);
      setCartItems(newItems);
      localStorage.setItem('cartItems', JSON.stringify(newItems));
      window.dispatchEvent(new CustomEvent('cartItemsChanged'));
      
      // Update cart count
      const newCount = newItems.reduce((sum: number, ci: any) => sum + (ci.quantity || 1), 0);
      localStorage.setItem('cartCount', newCount.toString());
      setCartCount(newCount);
      window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: newCount }));
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      trackActivity('remove_from_cart', { source: 'shopping_bag', change: 'removed_line', productName: nm || undefined });
    } catch (e) {
      console.error('Error removing item:', e);
    }
  };

  const handleSaveForLater = (item: any) => {
    try {
      // Remove from cart
      const newCartItems = cartItems.filter(i => i.id !== item.id);
      setCartItems(newCartItems);
      localStorage.setItem('cartItems', JSON.stringify(newCartItems));
      window.dispatchEvent(new CustomEvent('cartItemsChanged'));
      
      // Add to saved for later
      const newSavedForLater = [item, ...savedForLater];
      setSavedForLater(newSavedForLater);
      localStorage.setItem('savedForLater', JSON.stringify(newSavedForLater));
      window.dispatchEvent(new CustomEvent('savedItemsChanged'));
      
      // Update cart count
      const newCount = newCartItems.reduce((sum: number, ci: any) => sum + (ci.quantity || 1), 0);
      localStorage.setItem('cartCount', newCount.toString());
      setCartCount(newCount);
      window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: newCount }));
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      trackActivity('save_for_later', { productName: cartLineLabel(item) || undefined });
    } catch (e) {
      console.error('Error saving for later:', e);
    }
  };

  const handleMoveToCart = (item: any) => {
    try {
      if (!isPremiumMemberForGatedFeatures() && isPremiumGatedCartLine(item)) {
        return;
      }
      // Remove from saved for later
      const newSavedForLater = savedForLater.filter(i => i.id !== item.id);
      setSavedForLater(newSavedForLater);
      localStorage.setItem('savedForLater', JSON.stringify(newSavedForLater));
      window.dispatchEvent(new CustomEvent('savedItemsChanged'));
      
      // Add to cart
      const newCartItems = [item, ...cartItems];
      setCartItems(newCartItems);
      localStorage.setItem('cartItems', JSON.stringify(newCartItems));
      window.dispatchEvent(new CustomEvent('cartItemsChanged'));
      
      // Update cart count
      const newCount = newCartItems.reduce((sum: number, ci: any) => sum + (ci.quantity || 1), 0);
      localStorage.setItem('cartCount', newCount.toString());
      setCartCount(newCount);
      window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: newCount }));
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      trackActivity('move_saved_to_cart', { productName: cartLineLabel(item) || undefined });
    } catch (e) {
      console.error('Error moving to cart:', e);
    }
  };

  const handleRemoveFromSaved = (itemId: string) => {
    try {
      const removed = savedForLater.find((i) => i.id === itemId);
      const nm = cartLineLabel(removed);
      const newSavedForLater = savedForLater.filter(i => i.id !== itemId);
      setSavedForLater(newSavedForLater);
      localStorage.setItem('savedForLater', JSON.stringify(newSavedForLater));
      window.dispatchEvent(new CustomEvent('savedItemsChanged'));
      trackActivity('remove_saved_item', { productName: nm || undefined });
    } catch (e) {
      console.error('Error removing from saved:', e);
    }
  };

  const handleSavedQuantityChange = (itemId: string, delta: number) => {
    try {
      const currentItem = savedForLater.find(i => i.id === itemId);
      if (!currentItem) return;
      if (currentItem.bcfBundleDeal) return;

      const giftDelta = applyGiftCardBagQuantityDelta(
        currentItem,
        delta > 0 ? 1 : -1
      );
      if (giftDelta) {
        if (giftDelta.atMax) return;
        if (giftDelta.removeLine) {
          if (deleteTimeoutRef.current) {
            clearTimeout(deleteTimeoutRef.current);
            deleteTimeoutRef.current = null;
          }
          setDeleteItemConfirm({ itemId, type: 'saved' });
          return;
        }
        const newSavedForLater = savedForLater.map((i) => (i.id === itemId ? giftDelta.next : i));
        setSavedForLater(newSavedForLater);
        localStorage.setItem('savedForLater', JSON.stringify(newSavedForLater));
        window.dispatchEvent(new CustomEvent('savedItemsChanged'));
        if (deleteTimeoutRef.current) {
          clearTimeout(deleteTimeoutRef.current);
          deleteTimeoutRef.current = null;
        }
        return;
      }

      const maxQty = currentItem.isSpecialOffer ? 2 : 10;
      const currentQty = currentItem.quantity ?? 0;
      const newQty = currentQty + delta;
      
      // If trying to go below 0, show confirmation to delete immediately
      if (newQty < 0) {
        // Clear any existing timeout
        if (deleteTimeoutRef.current) {
          clearTimeout(deleteTimeoutRef.current);
          deleteTimeoutRef.current = null;
        }
        setDeleteItemConfirm({ itemId, type: 'saved', previousQuantity: currentQty });
        return;
      }
      
      const clampedSavedQty = Math.max(0, Math.min(maxQty, newQty));
      const newSavedForLater = savedForLater.map((i) => {
        if (i.id !== itemId) return i;
        return { ...i, quantity: clampedSavedQty };
      });
      setSavedForLater(newSavedForLater);
      localStorage.setItem('savedForLater', JSON.stringify(newSavedForLater));
      window.dispatchEvent(new CustomEvent('savedItemsChanged'));
      
      // If quantity becomes 0, set timeout to show popup after 400ms
      if (newQty === 0) {
        // Clear any existing timeout
        if (deleteTimeoutRef.current) {
          clearTimeout(deleteTimeoutRef.current);
        }
        deleteTimeoutRef.current = setTimeout(() => {
          setDeleteItemConfirm({ itemId, type: 'saved', previousQuantity: currentQty });
          deleteTimeoutRef.current = null;
        }, 400);
      } else {
        // If quantity is not 0, clear any pending timeout
        if (deleteTimeoutRef.current) {
          clearTimeout(deleteTimeoutRef.current);
          deleteTimeoutRef.current = null;
        }
      }
    } catch (e) {
      console.error('Error updating saved item quantity:', e);
    }
  };

  const handleClearSavedItems = () => {
    setShowClearConfirm(true);
  };

  const confirmClearSavedItems = () => {
    try {
      setSavedForLater([]);
      localStorage.setItem('savedForLater', JSON.stringify([]));
      window.dispatchEvent(new CustomEvent('savedItemsChanged'));
      setShowClearConfirm(false);
    } catch (e) {
      console.error('Error clearing saved items:', e);
    }
  };

  const confirmEmptyBag = () => {
    try {
      setCartItems([]);
      setCartCount(0);
      localStorage.setItem('cartItems', JSON.stringify([]));
      localStorage.setItem('cartCount', '0');
      window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: 0 }));
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      setShowEmptyBagConfirm(false);
    } catch (e) {
      console.error('Error emptying bag:', e);
    }
  };

  const handleEdit = (item: any) => {
    try {
      // Match CartDropdown: set both editingCartItem and editingCartItemId so build-a-wig loads correct item
      localStorage.setItem('editingCartItem', JSON.stringify(item));
      localStorage.setItem('editingCartItemId', item.id);
      localStorage.removeItem('editingSource'); // edit opened from bag → save updates cart/saved for later

      // Store individual customization options (same as CartDropdown) so edit mode loads correct selections
      const capSize = item.capSize || 'M';
      const length = item.length || '24"';
      const density = item.density || '200%';
      let color = item.color;
      if (item.name === 'BLANCO') {
        const validBlancoColors = ['GOLDEN', 'PLATINUM', 'ASH'];
        if (!color || !validBlancoColors.includes(color)) color = 'PLATINUM';
      } else {
        color = color || 'OFF BLACK';
      }
      const texture = item.texture || 'SILKY';
      const lace = item.lace || '13X6';
      const hairline = item.hairline || 'NATURAL';
      const partSelection = item.partSelection || 'MIDDLE';
      const styling = item.styling || 'NONE';
      const addOns = item.addOns || [];
      const capSizePrice = (capSize === 'XXS/XS/S' || capSize === 'S/M/L') ? '40' : '0';

      localStorage.setItem('selectedCapSize', capSize);
      localStorage.setItem('selectedCapSizePrice', capSizePrice);
      localStorage.setItem('selectedLength', length);
      localStorage.setItem('selectedDensity', density);
      localStorage.setItem('selectedColor', color);
      localStorage.setItem('selectedTexture', texture);
      localStorage.setItem('selectedLace', lace);
      localStorage.setItem('selectedHairline', hairline);
      localStorage.setItem('selectedPartSelection', partSelection);
      localStorage.setItem('selectedStyling', styling);
      localStorage.setItem('selectedAddOns', JSON.stringify(addOns));

      localStorage.setItem('editSelectedCapSize', capSize);
      localStorage.setItem('editSelectedCapSizePrice', capSizePrice);
      localStorage.setItem('editSelectedLength', length);
      localStorage.setItem('editSelectedDensity', density);
      localStorage.setItem('editSelectedColor', color);
      localStorage.setItem('editSelectedTexture', texture);
      localStorage.setItem('editSelectedLace', lace);
      localStorage.setItem('editSelectedHairline', hairline);
      localStorage.setItem('editSelectedStyling', styling);
      localStorage.setItem('editSelectedAddOns', JSON.stringify(addOns));

      window.dispatchEvent(new CustomEvent('editingCartItemChanged', { detail: { itemId: item.id } }));

      let editRoute = '/build-a-wig/edit';
      if (item.name === 'NOIR') {
        editRoute = '/build-a-wig/noir/edit';
      } else if (item.name === 'BLANCO') {
        editRoute = '/build-a-wig/blanco/edit';
      } else if (item.name === 'SOFT WAVE') {
        editRoute = '/build-a-wig/soft-wave/edit';
      } else if (item.name === 'SOFT CURL') {
        editRoute = '/build-a-wig/soft-curl/edit';
      } else if (item.name === 'BEACH WAVE') {
        editRoute = '/build-a-wig/beach-wave/edit';
      } else if (item.name === 'OCEAN CURL') {
        editRoute = '/build-a-wig/ocean-curl/edit';
      }

      navigate(editRoute);
    } catch (e) {
      console.error('Error setting edit item:', e);
    }
  };

  const handleEditAppointment = (item: any) => {
    beginEditAppointmentFromCart(item, navigate);
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
    window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'false' }));
    setShowSignOutConfirm(false);
    setShowMobileMenu(false);
  };

  // Calculate subtotal
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

  return (
    <div className="min-h-screen" style={{ position: 'relative', minHeight: '100vh' }}>
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
                    onClick={() => navigate('/')} 
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
                    onClick={() => navigate('/lobby')}
                  >
                    HOME &gt;
                  </span>{' '}
                  <span
                    style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}
                  >
                    BAG
                  </span>
                </>
              )}
            </p>
            </NavCenter>

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

          {/* MAIN BUILD AREA */}
          <div
            className={`${showMobileMenu ? 'menu-toggle-card ' : ''}border border-black flex flex-col p-4 mb-2 bg-white/60 backdrop-blur-sm overflow-hidden transition-all duration-300 ease-out`}
            style={{ 
              borderWidth: '1.3px', 
              minWidth: '100%', 
              maxWidth: 'none', 
              overflow: showMobileMenu ? 'visible' : 'hidden',
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              ...(showMobileMenu
                ? {
                    minHeight: 'calc(100dvh - 80px)',
                    height: 'calc(100dvh - 80px)',
                  }
                : {
                    height: 'calc(100vh - 270px)',
                    minHeight: 'calc(100vh - 270px)',
                    maxHeight: 'calc(100vh - 270px)',
                  }),
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
                                              duplicateRowClickForStaticLinks
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
            ) : (
              /* CART ITEMS - match wishlist: flex column with flex-1 + minHeight:0 so scroll fills space, paddingBottom inside scroll */
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0, flex: 1, minHeight: 0, overflow: 'hidden' }}>
                 {/* Shopping Bag Header */}
                 <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ flexShrink: 0 }}>
                   <button
                     className="text-red-500 font-bold text-lg tracking-wider truncate hover:text-red-600 transition-colors text-left uppercase"
                     style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '12px', fontWeight: '500' }}
                   >
                     SHOPPING BAG
                   </button>
                   <span
                     className="text-black font-bold text-lg flex-shrink-0 ml-2 uppercase"
                     style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', fontSize: '17px' }}
                   >
                     {cartItems.length}
                   </span>
                 </div>

                 {/* Loyalty points line - same position and styling as Saved for Later stock line (top, below header) */}
                 {cartItems.length > 0 && (
                   <p className="text-center w-full flex-shrink-0" style={{ marginTop: '10px', marginBottom: '6px', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>
                     {isSignedIn ? (
                       (() => {
                         const basePoints = Math.round(pointsEligibleAmount);
                         const multiplier = getPointsMultiplierForUser();
                         const actualPoints = Math.round(basePoints * multiplier);
                         const punctuation = actualPoints === 0 ? '.' : '!';
                         return <>YOU&apos;RE EARNING <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' }}>{actualPoints.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span> LOYALTY POINTS WITH THIS ORDER{punctuation}</>;
                       })()
                     ) : (
                       <>SIGN IN TO EARN LOYALTY POINTS FOR THIS ORDER.</>
                     )}
                   </p>
                 )}

                 {/* Body - flex-1 minHeight:0; single 4.8px below loyalty line to match saved-for-later spacing */}
                 <div className="flex flex-col" style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                   {/* Cart Items - scrollable; paddingTop 4.8px matches saved card spacing below status line */}
                   <div className={`flex flex-col justify-start items-start gap-0 ${cartItems.length > 1 ? 'overflow-y-auto' : ''}`} style={{ flex: 1, minHeight: 0, scrollBehavior: 'smooth', width: '100%', paddingTop: '4.8px', paddingBottom: cartItems.length > 1 ? '16px' : '0' }}>
                     {cartItems.length === 0 ? (
                       <div style={{ 
                         flex: 1,
                         textAlign: 'center', 
                         padding: '40px 20px',
                         display: 'flex',
                         flexDirection: 'column',
                         alignItems: 'center',
                         justifyContent: 'center',
                         width: '100%'
                       }}>
                         <p 
                           style={{ 
                             fontSize: '11px',
                             fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                             color: '#808080',
                             textTransform: 'uppercase',
                             margin: '0'
                           }}
                           dangerouslySetInnerHTML={{ __html: "YOUR BAG IS CURRENTLY EMPTY.<br>LET'S GO SHOPPING!" }}
                         />
                       </div>
                     ) : (
                       <>
                         {cartItems.map((item, index) => {
                      const itemId = item.id || `cart-item-${index}`;
                      const itemName = item.name || 'NOIR';
                      
                      // Get the correct image based on product name and hairline (same logic as cart dropdown)
                      const getItemImage = () => {
                        // Gift card uses specific thumbnail
                        if (item.name === 'GIFT CARD' || item.type === 'gift-card') {
                          return '/assets/gift-card asset.png';
                        }
                        const bookingThumb = bookingCartItemThumbnailSrc(item);
                        if (bookingThumb) return bookingThumb;
                        const bcfThumb = shopBcfCartLineThumbnailSrc(item);
                        if (bcfThumb) return bcfThumb;

                        // Determine thumbnail based on product name and hairline selection
                        const hairline = item.hairline || 'NATURAL';
                        const hairlineUpper = hairline.toUpperCase();
                        const hasPeak = hairlineUpper.includes('PEAK');
                        const hasLagos = hairlineUpper.includes('LAGOS');
                        
                        // For NOIR product: use peak/lagos thumbnails if selected
                        if (item.name === 'NOIR') {
                          if (hasPeak) {
                            return '/assets/noir-peak-thumb.png';
                          } else if (hasLagos) {
                            return '/assets/noir-lagos-thumb.png';
                          }
                          return item.image || '/assets/NOIR/noir-thumb.png';
                        }
                        
                        // Default: use the product's default thumbnail
                        return item.image || '/assets/NOIR/noir-thumb.png';
                      };
                      const itemImage = getItemImage();

                      const itemLength = item.length || '24"';
                      const isGiftLine = isGiftCardCartLine(item);
                      const itemPrice = isGiftLine
                        ? Number(item.balance ?? item.price) || 0
                        : item.price || 580;
                      const itemQuantity = isGiftLine ? giftCardBagStepCount(item) : item.quantity ?? 1;
                      const isBookingLine =
                        item.type === 'booking-consult' || item.type === 'booking-appointment';
                      const isBundleDealLine = Boolean(item.bcfBundleDeal);
                      const isConsultOfferQtyLocked = item.consultOfferQtyLocked === true;
                      const isQtyOnlyLine = isBookingLine || isBundleDealLine || isConsultOfferQtyLocked;
                      const consultOfferListTotUsd =
                        typeof item.consultOfferLinePreDiscountUsd === 'number' &&
                        !Number.isNaN(item.consultOfferLinePreDiscountUsd)
                          ? Math.round(item.consultOfferLinePreDiscountUsd) * (isGiftLine ? 1 : itemQuantity)
                          : null;
                      const consultOfferLineTotUsd = itemPrice * (isGiftLine ? 1 : itemQuantity);
                      const bundleDealListTot = bcfBundleDealResolvedListSubtotal(item);
                      const bundleDealLineTot = itemPrice * (isGiftLine ? 1 : itemQuantity);

                       return (
                         <div key={itemId} className="bg-white border border-gray-200 p-2 mb-2 w-full" style={{ boxSizing: 'border-box' }}>
                           <div
                             className="flex items-center justify-start space-x-3"
                             style={{
                               height: '130px',
                               paddingTop: '0',
                               paddingBottom: '0',
                               width: '100%',
                               flexShrink: 0
                             }}
                           >
                          <ShoppingBagLineThumb
                            item={item}
                            itemImage={itemImage}
                            itemName={itemName}
                            navigate={navigate}
                            onEditUnit={handleEdit}
                            onEditAppointment={handleEditAppointment}
                          />

                          {/* Item Details - Matching cart dropdown */}
                          <div className="flex-1 min-w-0 flex flex-col relative justify-center" style={{ marginLeft: '18px', height: '100%' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                              <p 
                                className="font-medium truncate cart-product-name"
                                style={{ 
                                  fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                                  color: '#000000',
                                  textTransform: 'uppercase',
                                  fontSize: (() => {
                                    if (item.name === 'NOIR') {
                                      return '22px';
                                    }
                                    return '21px';
                                  })(),
                                  lineHeight: '1.1',
                                  margin: '0'
                                }}
                              >
                                {bagProductTitleLine(item)}
                              </p>
                              <p 
                                className="font-bold"
                                style={{ 
                                  fontFamily: '"Futura PT Book"',
                                  color: '#EB1C24',
                                  textTransform: 'uppercase',
                                  fontSize: '9px',
                                  marginTop: '2px',
                                  marginBottom: '0',
                                  lineHeight: '1.1'
                                }}
                              >
                                {bagProductRedSubtitle(item, itemLength, bagHairOriginForProductName)}
                              </p>
                              {(() => {
                                const detailsKey = `c-${itemId}`;
                                const showBookingDetailsOnBag = isBookingLine;
                                return (
                                  <>
                                    {bagViewDetailsFor === detailsKey && showBookingDetailsOnBag && (
                                      <p
                                        className="font-bold"
                                        style={{
                                          fontFamily: '"Futura PT Book"',
                                          color: '#000000',
                                          textTransform: 'uppercase',
                                          fontSize: '9px',
                                          marginTop: '2px',
                                          marginBottom: '6px',
                                          marginRight: '20px',
                                          lineHeight: '1.44',
                                          wordBreak: 'break-word',
                                          maxWidth: 'calc(100% - 20px)'
                                        }}
                                        dangerouslySetInnerHTML={{
                                          __html: bookingCartViewDetailsHtml(item)
                                        }}
                                      />
                                    )}
                                    {showBookingDetailsOnBag && (
                                      <span
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            setBagViewDetailsFor((v) =>
                                              v === detailsKey ? null : detailsKey
                                            );
                                          }
                                        }}
                                        style={{
                                          fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                                          fontSize: '8px',
                                          color: '#EB1C24',
                                          textTransform: 'uppercase',
                                          marginTop: '2px',
                                          marginBottom: '0',
                                          cursor: 'pointer',
                                          display: 'inline-block'
                                        }}
                                        onClick={() =>
                                          setBagViewDetailsFor((v) =>
                                            v === detailsKey ? null : detailsKey
                                          )
                                        }
                                      >
                                        {bagViewDetailsFor === detailsKey ? 'CLOSE DETAILS' : 'VIEW DETAILS'}
                                      </span>
                                    )}
                                  </>
                                );
                              })()}
                              {item.capSize && (
                                <p 
                                  className="font-semibold"
                                  style={{ 
                                    fontFamily: '"Futura PT Medium"',
                                    color: '#808080',
                                    textTransform: 'uppercase',
                                    fontSize: '10px',
                                    marginTop: (() => {
                                      // Check if there's black detail text (specifications)
                                      const hasSpecs = (item.density && item.density !== '200%') || 
                                                     (item.lace && item.lace !== '13X6') || 
                                                     (item.texture && item.texture !== 'SILKY') || 
                                                     (item.color && item.color !== (item.name === 'BLANCO' ? 'PLATINUM' : 'OFF BLACK')) || 
                                                     (item.hairline && item.hairline !== 'NATURAL') || 
                                                     (item.styling && item.styling !== 'NONE') || 
                                                     (item.addOns && item.addOns.length > 0);
                                      const baseMargin = hasSpecs ? '2px' : '0px';
                                      // Add 2px for SOFT WAVE and SOFT CURL only
                                      if (item.name === 'SOFT WAVE' || item.name === 'SOFT CURL') {
                                        const numValue = parseInt(baseMargin);
                                        return `${numValue + 2}px`;
                                      }
                                      // Add 2px for OCEAN CURL only
                                      if (item.name === 'OCEAN CURL') {
                                        const numValue = parseInt(baseMargin);
                                        return `${numValue + 2}px`;
                                      }
                                      return baseMargin;
                                    })(),
                                    marginBottom: '0',
                                    lineHeight: '1.1'
                                  }}
                                >
                                  CAP SIZE: {item.capSize}
                                </p>
                              )}
                              {isBundleDealLine ? (
                                <div
                                  style={{
                                    fontFamily: '"Futura PT Book"',
                                    color: '#000000',
                                    fontSize: '12px',
                                    marginTop: item.name === 'BLANCO' ? '0px' : '2px',
                                    marginBottom: '0',
                                    fontWeight: '600',
                                    textAlign: 'left',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    gap: '2px',
                                    lineHeight: '1.15'
                                  }}
                                >
                                  {bundleDealListTot != null && bundleDealListTot > bundleDealLineTot && (
                                    <span
                                      style={{
                                        color: '#808080',
                                        textDecoration: 'line-through',
                                        fontSize: '11px',
                                        whiteSpace: 'nowrap'
                                      }}
                                      dangerouslySetInnerHTML={formatPrice(bundleDealListTot)}
                                    />
                                  )}
                                  <span style={{ whiteSpace: 'nowrap' }} dangerouslySetInnerHTML={formatPrice(bundleDealLineTot)} />
                                </div>
                              ) : isConsultOfferQtyLocked &&
                                consultOfferListTotUsd != null &&
                                consultOfferListTotUsd > consultOfferLineTotUsd ? (
                                <div
                                  style={{
                                    fontFamily: '"Futura PT Book"',
                                    color: '#000000',
                                    fontSize: '12px',
                                    marginTop: item.name === 'BLANCO' ? '0px' : '2px',
                                    marginBottom: '0',
                                    fontWeight: '600',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    gap: '2px',
                                    lineHeight: '1.15',
                                  }}
                                >
                                  <span
                                    style={{
                                      color: '#808080',
                                      textDecoration: 'line-through',
                                      fontSize: '11px',
                                      whiteSpace: 'nowrap',
                                    }}
                                    dangerouslySetInnerHTML={formatPrice(consultOfferListTotUsd)}
                                  />
                                  <span style={{ whiteSpace: 'nowrap' }} dangerouslySetInnerHTML={formatPrice(consultOfferLineTotUsd)} />
                                </div>
                              ) : (
                              <p
                                style={{
                                  fontFamily: '"Futura PT Book"',
                                  color: '#000000',
                                  fontSize: '12px',
                                  marginTop: item.name === 'BLANCO' ? '0px' : '2px',
                                  marginBottom: '0',
                                  marginLeft: '0',
                                  marginRight: '0',
                                  fontWeight: '600'
                                }}
                                dangerouslySetInnerHTML={formatPrice(itemPrice)}
                              />
                              )}
                            </div>

                            {/* Booking + bundle deal: QTY + × only (same inset as cart dropdown booking) */}
                            <div
                              className="flex flex-col items-center justify-center absolute"
                              style={{
                                right: isQtyOnlyLine ? '14px' : '8px',
                                top: '0',
                                bottom: '0',
                                marginLeft: 'auto'
                              }}
                            >
                              {isQtyOnlyLine ? (
                                <>
                                  <span
                                    style={{
                                      fontFamily: '"Futura PT Medium"',
                                      fontSize: '8px',
                                      color: '#000000',
                                      textTransform: 'uppercase',
                                      marginBottom: '6px'
                                    }}
                                  >
                                    QTY: {itemQuantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setDeleteItemConfirm({ itemId, type: 'cart' })}
                                    className="px-2 py-1 text-red-500 bg-white hover:bg-gray-50 flex items-center justify-center cursor-pointer"
                                    style={{
                                      border: '1.3px solid black',
                                      height: '25px',
                                      minHeight: '25px',
                                      maxHeight: '25px',
                                      boxSizing: 'border-box',
                                      outline: 'none',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                  >
                                    <span style={{ fontFamily: 'Cascadia Code, monospace', fontSize: '11px' }}>×</span>
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setAddToListModalItem(item);
                                      setAddToListModalOpen(true);
                                    }}
                                    style={{
                                      fontFamily: '"Futura PT Medium"',
                                      fontSize: '9px',
                                      color: '#EB1C24',
                                      textTransform: 'uppercase',
                                      marginBottom: '6px',
                                      background: 'none',
                                      border: 'none',
                                      cursor: 'pointer',
                                      padding: 0
                                    }}
                                  >
                                    + LIST
                                  </button>
                                  <div
                                    className={`flex items-center ${isBundleDealLine ? 'opacity-60' : ''}`}
                                  >
                                    <button
                                      type="button"
                                      onClick={() => handleQuantityChange(itemId, -1)}
                                      disabled={isBundleDealLine}
                                      className={`px-2 py-0.5 text-red-500 bg-white quantity-minus-btn flex items-center justify-center ${
                                        isBundleDealLine ? 'cursor-not-allowed opacity-70' : 'hover:bg-gray-50 cursor-pointer'
                                      }`}
                                      style={{
                                        borderTop: '1.3px solid black !important',
                                        borderLeft: '1.3px solid black !important',
                                        borderBottom: '1.3px solid black !important',
                                        borderRight: 'none !important',
                                        height: '20.25px',
                                        minHeight: '20.25px',
                                        maxHeight: '20.25px',
                                        boxSizing: 'border-box',
                                        outline: 'none',
                                        border: 'none !important',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}
                                    >
                                      <span style={{ fontFamily: 'Cascadia Code, monospace', fontSize: '8.25px' }}>-</span>
                                    </button>
                                    <div
                                      className="px-3 py-0.5 text-black bg-white flex items-center justify-center relative quantity-number"
                                      style={{
                                        borderTop: '1.3px solid black !important',
                                        borderBottom: '1.3px solid black !important',
                                        borderLeft: 'none !important',
                                        borderRight: 'none !important',
                                        fontFamily: '"Futura PT Medium"',
                                        fontWeight: '500',
                                        fontSize: '9px',
                                        height: '20.25px',
                                        minHeight: '20.25px',
                                        maxHeight: '20.25px',
                                        boxSizing: 'border-box',
                                        border: 'none !important'
                                      }}
                                    >
                                      <div className="absolute left-0 top-0 bottom-0 w-px bg-black"></div>
                                      <div className="absolute right-0 top-0 bottom-0 w-px bg-black"></div>
                                      {itemQuantity}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleQuantityChange(itemId, 1)}
                                      disabled={
                                        isBundleDealLine ||
                                        itemQuantity >=
                                          (isGiftLine ? 10 : item.isSpecialOffer ? 2 : 10)
                                      }
                                      className={`px-2 py-0.5 text-red-500 bg-white quantity-plus-btn flex items-center justify-center ${
                                        isBundleDealLine ||
                                        itemQuantity >=
                                          (isGiftLine ? 10 : item.isSpecialOffer ? 2 : 10)
                                          ? 'opacity-50 cursor-not-allowed'
                                          : 'hover:bg-gray-50 cursor-pointer'
                                      }`}
                                      style={{
                                        borderTop: '1.3px solid black !important',
                                        borderRight: '1.3px solid black !important',
                                        borderBottom: '1.3px solid black !important',
                                        borderLeft: 'none !important',
                                        height: '20.25px',
                                        minHeight: '20.25px',
                                        maxHeight: '20.25px',
                                        boxSizing: 'border-box',
                                        outline: 'none',
                                        border: 'none !important',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}
                                    >
                                      <span style={{ fontFamily: 'Cascadia Code, monospace', fontSize: '8.25px' }}>+</span>
                                    </button>
                                  </div>
                                  <button
                                    onClick={() => handleSaveForLater(item)}
                                    style={{
                                      fontFamily: '"Futura PT Demi"',
                                      fontSize: '9px',
                                      color: '#808080',
                                      background: 'none',
                                      border: 'none',
                                      cursor: 'pointer',
                                      padding: '0',
                                      textTransform: 'uppercase',
                                      marginTop: '6px',
                                      textAlign: 'center'
                                    }}
                                    type="button"
                                  >
                                    SAVE FOR LATER
                                  </button>
                                </>
                              )}
                            </div>
                            </div>
                          </div>
                         </div>
                      );
                    })}
                       </>
                     )}
                   </div>
                 </div>

                 {/* Subtotal - Fixed at bottom; match Saved for Later spacing above (pt-1 when 2+, same inner margin/padding) */}
                 {cartItems.length > 0 && (
                   <div className={`overflow-hidden mt-auto flex-shrink-0 ${cartItems.length === 1 ? '' : 'pt-1'}`}>
                     <div style={{ 
                       marginTop: cartItems.length === 1 ? '2px' : '5px', 
                       paddingTop: cartItems.length === 1 ? '4px' : '7px',
                       borderTop: '1.3px solid #000',
                       display: 'flex',
                       justifyContent: 'space-between',
                       alignItems: 'center'
                     }}>
                       <p style={{
                         fontFamily: '"Futura PT Book"',
                         fontSize: '12px',
                         fontWeight: '600',
                         margin: '0'
                       }}>
                         SUBTOTAL:
                       </p>
                       <p
                         style={{
                           fontFamily: '"Futura PT Book"',
                           fontSize: '12px',
                           fontWeight: '600',
                           margin: '0'
                         }}
                         dangerouslySetInnerHTML={formatPrice(subtotal)}
                       />
                     </div>
                   </div>
                 )}
              </div>
            )}
          </div>

          {/* EMPTY BAG & PROCEED TO CHECKOUT - Only show when menu is closed and there are cart items */}
          {!showMobileMenu && cartItems.length > 0 && (
            <div className="px-0 md:px-0" style={{ marginTop: '2px', marginBottom: '20px' }}>
              <button
                onClick={() => setShowEmptyBagConfirm(true)}
                className="border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50 mb-2"
                style={{ 
                  borderWidth: '1.3px', 
                  color: '#EB1C24',
                  fontFamily: '"Futura PT Medium"',
                  backgroundColor: '#FFFFFF'
                }}
                type="button"
              >
                EMPTY BAG
              </button>
              <button
                onClick={() => navigate(checkoutPathForCartItems(cartItems))}
                className="border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
                style={{ 
                  borderWidth: '1.3px', 
                  color: '#EB1C24',
                  fontFamily: '"Futura PT Medium"',
                  backgroundColor: '#FFFFFF'
                }}
                type="button"
              >
                PROCEED TO CHECKOUT
              </button>
            </div>
          )}

          {/* SAVED FOR LATER SECTION - Only show when menu is closed and there are saved items */}
          {!showMobileMenu && savedForLater.length > 0 && (
            <div
              className="border border-black flex flex-col p-4 mb-2 bg-white/60 backdrop-blur-sm overflow-hidden transition-all duration-300 ease-out"
              style={{ 
                borderWidth: '1.3px', 
                minWidth: '100%', 
                maxWidth: 'none', 
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                WebkitBackdropFilter: 'blur(10px)',
                willChange: 'backdrop-filter',
                marginTop: '10px',
                ...(savedForLater.length > 1 ? { height: 'calc(100vh - 270px)', minHeight: 'calc(100vh - 270px)', maxHeight: 'calc(100vh - 270px)' } : {})
              }}
            >
              {/* Saved For Later - match wishlist: flex column with flex-1 + minHeight:0, scroll fills space, paddingBottom inside scroll */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0, flex: 1, minHeight: 0, overflow: 'hidden' }}>
              {/* Saved For Later Header */}
              <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ flexShrink: 0 }}>
                <button
                  className="text-red-500 font-bold text-lg tracking-wider truncate hover:text-red-600 transition-colors text-left uppercase"
                  style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '12px', fontWeight: '500' }}
                >
                  SAVED FOR LATER
                </button>
                <span
                  className="text-black font-bold text-lg flex-shrink-0 ml-2 uppercase"
                  style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', fontSize: '17px' }}
                >
                  {savedForLater.length}
                </span>
              </div>

              {/* Stock status line - same spacing as cart dropdown "you're earning" (when saved items exist) */}
              {savedForLater.length > 0 && (() => {
                const outOfStockCount = savedForLater.filter((i: any) => (i.stockStatus || 'in_stock') === 'out_of_stock').length;
                const lowStockCount = savedForLater.filter((i: any) => (i.stockStatus || 'in_stock') === 'low_stock').length;
                const allInStock = outOfStockCount === 0 && lowStockCount === 0;
                if (allInStock) {
                  return (
                    <p className="text-center w-full flex-shrink-0" style={{ marginTop: '10px', marginBottom: '6px', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>
                      ALL OF YOUR SAVED ITEMS ARE IN STOCK!
                    </p>
                  );
                }
                if (outOfStockCount > 0) {
                  const n = outOfStockCount;
                  const isOne = n === 1;
                  return (
                    <p className="text-center w-full flex-shrink-0" style={{ marginTop: '10px', marginBottom: '6px', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>
                      <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' }}>{n}</span>
                      {isOne ? ' ITEM IN YOUR SAVED ITEMS IS OUT OF STOCK.' : ' ITEMS IN YOUR SAVED ITEMS ARE OUT OF STOCK.'}
                    </p>
                  );
                }
                const n = lowStockCount;
                const isOne = n === 1;
                return (
                  <p className="text-center w-full flex-shrink-0" style={{ marginTop: '10px', marginBottom: '6px', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>
                    <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' }}>{n}</span>
                    {isOne ? ' ITEM IN YOUR SAVED ITEMS IS LOW IN STOCK.' : ' ITEMS IN YOUR SAVED ITEMS ARE LOW IN STOCK.'}
                  </p>
                );
              })()}

              {/* Body - flex-1 minHeight:0 so scroll area gets remaining height; single 4.8px below stock line to match wishlist */}
              <div className="flex flex-col" style={{ flex: savedForLater.length > 1 ? 1 : undefined, minHeight: savedForLater.length > 1 ? 0 : undefined, overflow: 'hidden' }}>
                {/* Saved Items - scrollable; paddingTop 4.8px matches wishlist spacing below stock line */}
                <div className={`flex flex-col justify-start items-start gap-0 ${savedForLater.length > 1 ? 'overflow-y-auto' : ''}`} style={{ flex: savedForLater.length > 1 ? 1 : undefined, minHeight: savedForLater.length > 1 ? 0 : undefined, scrollBehavior: 'smooth', width: '100%', paddingTop: '4.8px', paddingBottom: savedForLater.length > 1 ? '16px' : '0' }}>
                  {savedForLater.map((item, index) => {
                  const itemId = item.id || `saved-item-${index}`;
                  const itemName = item.name || 'NOIR';
                  
                  // Get the correct image based on product name and hairline (same logic as cart dropdown)
                  const getItemImage = () => {
                    if (item.name === 'GIFT CARD' || item.type === 'gift-card') {
                      return '/assets/gift-card asset.png';
                    }
                    const bookingThumb = bookingCartItemThumbnailSrc(item);
                    if (bookingThumb) return bookingThumb;
                    const bcfSaved = shopBcfCartLineThumbnailSrc(item);
                    if (bcfSaved) return bcfSaved;
                    const hairline = item.hairline || 'NATURAL';
                    const hairlineUpper = hairline.toUpperCase();
                    const hasPeak = hairlineUpper.includes('PEAK');
                    const hasLagos = hairlineUpper.includes('LAGOS');
                    if (item.name === 'NOIR') {
                      if (hasPeak) {
                        return '/assets/noir-peak-thumb.png';
                      } else if (hasLagos) {
                        return '/assets/noir-lagos-thumb.png';
                      }
                      return item.image || '/assets/NOIR/noir-thumb.png';
                    }
                    return item.image || '/assets/NOIR/noir-thumb.png';
                  };
                  const itemImage = getItemImage();

                  const itemLength = item.length || '24"';
                  const isSavedGiftLine = isGiftCardCartLine(item);
                  const itemPrice = isSavedGiftLine
                    ? Number(item.balance ?? item.price) || 0
                    : item.price || 580;
                  const itemQuantity = isSavedGiftLine
                    ? giftCardBagStepCount(item)
                    : item.quantity ?? 0;
                  const isSavedBundleDeal = Boolean(item.bcfBundleDeal);
                  const savedBundleListTot = bcfBundleDealResolvedListSubtotal(item);
                  const savedBundleLineTot = itemPrice * (isSavedGiftLine ? 1 : itemQuantity);
                  const isSavedBookingLine =
                    item.type === 'booking-consult' || item.type === 'booking-appointment';
                  const isSavedQtyOnlyLine = isSavedBookingLine || isSavedBundleDeal;

                  return (
                    <div key={itemId} className="bg-white border border-gray-200 p-2 mb-2 w-full" style={{ boxSizing: 'border-box' }}>
                      <div
                        className="flex items-center justify-start space-x-3"
                        style={{
                          height: '130px',
                          paddingTop: '0',
                          paddingBottom: '0',
                          width: '100%',
                          flexShrink: 0
                        }}
                      >
                      <ShoppingBagLineThumb
                        item={item}
                        itemImage={itemImage}
                        itemName={itemName}
                        navigate={navigate}
                        onEditUnit={handleEdit}
                        onEditAppointment={handleEditAppointment}
                      />

                      {/* Product Details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center" style={{ marginLeft: '18px', position: 'relative', height: '100%' }}>
                         <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                           <p 
                             className="font-medium truncate cart-product-name"
                             style={{ 
                               fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                               color: '#000000',
                               textTransform: 'uppercase',
                               fontSize: (() => {
                                 if (item.name === 'NOIR') {
                                   return '22px';
                                 }
                                 return '21px';
                               })(),
                               lineHeight: '1.1',
                               margin: '0'
                             }}
                           >
                             {bagProductTitleLine(item)}
                           </p>
                           <p 
                             className="font-bold"
                             style={{ 
                               fontFamily: '"Futura PT Book"',
                               color: '#EB1C24',
                               textTransform: 'uppercase',
                               fontSize: '9px',
                               marginTop: '2px',
                               marginBottom: '0',
                               lineHeight: '1.1'
                             }}
                           >
                             {bagProductRedSubtitle(item, itemLength, bagHairOriginForProductName)}
                           </p>
                           {(() => {
                             const detailsKey = `s-${itemId}`;
                             const showBookingDetailsOnBag = isSavedBookingLine;
                             return (
                               <>
                                 {bagViewDetailsFor === detailsKey && showBookingDetailsOnBag && (
                                   <p
                                     className="font-bold"
                                     style={{
                                       fontFamily: '"Futura PT Book"',
                                       color: '#000000',
                                       textTransform: 'uppercase',
                                       fontSize: '9px',
                                       marginTop: '2px',
                                       marginBottom: '6px',
                                       marginRight: '20px',
                                       lineHeight: '1.44',
                                       wordBreak: 'break-word',
                                       maxWidth: 'calc(100% - 20px)'
                                     }}
                                     dangerouslySetInnerHTML={{
                                       __html: bookingCartViewDetailsHtml(item)
                                     }}
                                   />
                                 )}
                                 {showBookingDetailsOnBag && (
                                   <span
                                     role="button"
                                     tabIndex={0}
                                     onKeyDown={(e) => {
                                       if (e.key === 'Enter' || e.key === ' ') {
                                         e.preventDefault();
                                         setBagViewDetailsFor((v) =>
                                           v === detailsKey ? null : detailsKey
                                         );
                                       }
                                     }}
                                     style={{
                                       fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                                       fontSize: '8px',
                                       color: '#EB1C24',
                                       textTransform: 'uppercase',
                                       marginTop: '2px',
                                       marginBottom: '0',
                                       cursor: 'pointer',
                                       display: 'inline-block'
                                     }}
                                     onClick={() =>
                                       setBagViewDetailsFor((v) =>
                                         v === detailsKey ? null : detailsKey
                                       )
                                     }
                                   >
                                     {bagViewDetailsFor === detailsKey ? 'CLOSE DETAILS' : 'VIEW DETAILS'}
                                   </span>
                                 )}
                               </>
                             );
                           })()}
                           {/* Removed black detail text for symmetry */}
                           {item.capSize && (
                             <p 
                               className="font-semibold"
                               style={{ 
                                 fontFamily: '"Futura PT Medium"',
                                 color: '#808080',
                                 textTransform: 'uppercase',
                                 fontSize: '10px',
                                 marginTop: (() => {
                                   // Check if there's black detail text (specifications)
                                   const hasSpecs = (item.density && item.density !== '200%') || 
                                                  (item.lace && item.lace !== '13X6') || 
                                                  (item.texture && item.texture !== 'SILKY') || 
                                                  (item.color && item.color !== (item.name === 'BLANCO' ? 'PLATINUM' : 'OFF BLACK')) || 
                                                  (item.hairline && item.hairline !== 'NATURAL') || 
                                                  (item.styling && item.styling !== 'NONE') || 
                                                  (item.addOns && item.addOns.length > 0);
                                   const baseMargin = hasSpecs ? '2px' : '0px';
                                   // Add 2px for SOFT WAVE and SOFT CURL only
                                   if (item.name === 'SOFT WAVE' || item.name === 'SOFT CURL') {
                                     const numValue = parseInt(baseMargin);
                                     return `${numValue + 2}px`;
                                   }
                                   // Add 2px for OCEAN CURL only
                                   if (item.name === 'OCEAN CURL') {
                                     const numValue = parseInt(baseMargin);
                                     return `${numValue + 2}px`;
                                   }
                                   return baseMargin;
                                 })(),
                                 marginBottom: '0',
                                 lineHeight: '1.1'
                               }}
                             >
                               CAP SIZE: {item.capSize}
                             </p>
                           )}
                           {isSavedBundleDeal ? (
                             <div
                               style={{
                                 fontFamily: '"Futura PT Book"',
                                 color: '#000000',
                                 fontSize: '12px',
                                 marginTop: item.name === 'BLANCO' ? '0px' : '2px',
                                 marginBottom: '0',
                                 fontWeight: '600',
                                 display: 'flex',
                                 flexDirection: 'column',
                                 alignItems: 'flex-start',
                                 gap: '2px',
                                 lineHeight: '1.15'
                               }}
                             >
                               {savedBundleListTot != null && savedBundleListTot > savedBundleLineTot && (
                                 <span
                                   style={{
                                     color: '#808080',
                                     textDecoration: 'line-through',
                                     fontSize: '11px',
                                     whiteSpace: 'nowrap'
                                   }}
                                   dangerouslySetInnerHTML={formatPrice(savedBundleListTot)}
                                 />
                               )}
                               <span style={{ whiteSpace: 'nowrap' }} dangerouslySetInnerHTML={formatPrice(savedBundleLineTot)} />
                             </div>
                           ) : (
                           <p
                             style={{
                               fontFamily: '"Futura PT Book"',
                               color: '#000000',
                               fontSize: '12px',
                               marginTop: item.name === 'BLANCO' ? '0px' : '2px',
                               marginBottom: '0',
                               marginLeft: '0',
                               marginRight: '0',
                               fontWeight: '600'
                             }}
                             dangerouslySetInnerHTML={formatPrice(itemPrice)}
                           />
                           )}
                         </div>

                         {/* Quantity / +LIST — booking + bundle deal: QTY only (like bag); else full controls */}
                         <div
                           className="flex flex-col items-center justify-center absolute"
                           style={{ right: isSavedQtyOnlyLine ? '14px' : '8px', top: '0', bottom: '0', marginLeft: 'auto' }}
                         >
                           {isSavedQtyOnlyLine ? (
                             <span
                               style={{
                                 fontFamily: '"Futura PT Medium"',
                                 fontSize: '8px',
                                 color: '#000000',
                                 textTransform: 'uppercase',
                                 marginBottom: '6px'
                               }}
                             >
                               QTY: {itemQuantity}
                             </span>
                           ) : (
                             <>
                               <button
                                 type="button"
                                 onClick={() => {
                                   setAddToListModalItem(item);
                                   setAddToListModalOpen(true);
                                 }}
                                 style={{
                                   fontFamily: '"Futura PT Medium"',
                                   fontSize: '9px',
                                   color: '#EB1C24',
                                   textTransform: 'uppercase',
                                   marginBottom: '6px',
                                   background: 'none',
                                   border: 'none',
                                   cursor: 'pointer',
                                   padding: 0
                                 }}
                               >
                                 + LIST
                               </button>
                               <div className="flex items-center">
                                 <button
                                   type="button"
                                   onClick={() => handleSavedQuantityChange(itemId, -1)}
                                   className="px-2 py-0.5 text-red-500 bg-white quantity-minus-btn flex items-center justify-center hover:bg-gray-50 cursor-pointer"
                                   style={{
                                     borderTop: '1.3px solid black !important',
                                     borderLeft: '1.3px solid black !important',
                                     borderBottom: '1.3px solid black !important',
                                     borderRight: 'none !important',
                                     height: '20.25px',
                                     minHeight: '20.25px',
                                     maxHeight: '20.25px',
                                     boxSizing: 'border-box',
                                     outline: 'none',
                                     border: 'none !important',
                                     display: 'flex',
                                     alignItems: 'center',
                                     justifyContent: 'center'
                                   }}
                                 >
                                   <span style={{ fontFamily: 'Cascadia Code, monospace', fontSize: '8.25px' }}>-</span>
                                 </button>
                                 <div
                                   className="px-3 py-0.5 text-black bg-white flex items-center justify-center relative quantity-number"
                                   style={{
                                     borderTop: '1.3px solid black !important',
                                     borderBottom: '1.3px solid black !important',
                                     borderLeft: 'none !important',
                                     borderRight: 'none !important',
                                     fontFamily: '"Futura PT Medium"',
                                     fontWeight: '500',
                                     fontSize: '9px',
                                     height: '20.25px',
                                     minHeight: '20.25px',
                                     maxHeight: '20.25px',
                                     boxSizing: 'border-box',
                                     border: 'none !important'
                                   }}
                                 >
                                   <div className="absolute left-0 top-0 bottom-0 w-px bg-black"></div>
                                   <div className="absolute right-0 top-0 bottom-0 w-px bg-black"></div>
                                   {itemQuantity}
                                 </div>
                                 <button
                                   type="button"
                                   onClick={() => handleSavedQuantityChange(itemId, 1)}
                                   disabled={
                                     itemQuantity >=
                                       (isSavedGiftLine ? 10 : item.isSpecialOffer ? 2 : 10)
                                   }
                                   className={`px-2 py-0.5 text-red-500 bg-white quantity-plus-btn flex items-center justify-center ${
                                     itemQuantity >=
                                       (isSavedGiftLine ? 10 : item.isSpecialOffer ? 2 : 10)
                                       ? 'opacity-50 cursor-not-allowed'
                                       : 'hover:bg-gray-50 cursor-pointer'
                                   }`}
                                   style={{
                                     borderTop: '1.3px solid black !important',
                                     borderRight: '1.3px solid black !important',
                                     borderBottom: '1.3px solid black !important',
                                     borderLeft: 'none !important',
                                     height: '20.25px',
                                     minHeight: '20.25px',
                                     maxHeight: '20.25px',
                                     boxSizing: 'border-box',
                                     outline: 'none',
                                     border: 'none !important',
                                     display: 'flex',
                                     alignItems: 'center',
                                     justifyContent: 'center'
                                   }}
                                 >
                                   <span style={{ fontFamily: 'Cascadia Code, monospace', fontSize: '8.25px' }}>+</span>
                                 </button>
                               </div>
                             </>
                           )}
                           {(item.stockStatus || 'in_stock') === 'out_of_stock' ? (
                             <span
                               style={{
                                 fontFamily: '"Futura PT Demi"',
                                 fontSize: '9px',
                                 color: '#808080',
                                 textTransform: 'uppercase',
                                 marginTop: '6px',
                                 textAlign: 'center'
                               }}
                             >
                               OUT OF STOCK
                             </span>
                           ) : (
                             <button
                               onClick={() => handleMoveToCart(item)}
                               style={{
                                 fontFamily: '"Futura PT Demi"',
                                 fontSize: '9px',
                                 color: '#808080',
                                 background: 'none',
                                 border: 'none',
                                 cursor: 'pointer',
                                 padding: '0',
                                 textTransform: 'uppercase',
                                 marginTop: '6px',
                                 textAlign: 'center'
                               }}
                               type="button"
                             >
                              MOVE TO BAG
                             </button>
                           )}
                         </div>
                      </div>
                    </div>
                    </div>
                  );
                  })}
                </div>
              </div>

              {/* Subtotal - Fixed at bottom (match Vercel/original: pt-1 wrapper, conditional inner spacing) */}
              {savedForLater.length > 0 && (
                <div className={`overflow-hidden mt-auto flex-shrink-0 ${savedForLater.length === 1 ? '' : 'pt-1'}`}>
                  <div style={{ 
                    marginTop: savedForLater.length === 1 ? '2px' : '5px', 
                    paddingTop: savedForLater.length === 1 ? '4px' : '7px',
                    borderTop: '1.3px solid #000',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <p style={{
                      fontFamily: '"Futura PT Book"',
                      fontSize: '12px',
                      fontWeight: '600',
                      margin: '0'
                    }}>
                      SUBTOTAL:
                    </p>
                    <p
                      style={{
                        fontFamily: '"Futura PT Book"',
                        fontSize: '12px',
                        fontWeight: '600',
                        margin: '0'
                      }}
                      dangerouslySetInnerHTML={formatPrice(savedForLater.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0))}
                    />
                  </div>
                </div>
              )}
              </div>
            </div>
          )}

          {/* CLEAR SAVED ITEMS BUTTON - Only show when menu is closed and there are saved items */}
          {!showMobileMenu && savedForLater.length > 0 && (
            <div className="px-0 md:px-0" style={{ marginTop: '2px', marginBottom: '20px' }}>
              <button
                onClick={handleClearSavedItems}
                className="border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
                style={{ 
                  borderWidth: '1.3px', 
                  color: '#EB1C24',
                  fontFamily: '"Futura PT Medium"',
                  backgroundColor: '#FFFFFF'
                }}
                type="button"
              >
                DELETE SAVED ITEMS
              </button>
            </div>
          )}

          {/* Clear Saved Items Confirmation Modal */}
          <ConfirmationModal
            isOpen={showClearConfirm}
            onClose={() => setShowClearConfirm(false)}
            onConfirm={confirmClearSavedItems}
            title="DELETE SAVED ITEMS?"
            message="ARE YOU SURE YOU WANT TO REMOVE ALL SAVED ITEMS?"
            confirmText="CONFIRM"
            cancelText="CANCEL"
            dataAttribute="clear-saved-items-confirm"
          />

          {/* Empty Bag Confirmation Modal */}
          <ConfirmationModal
            isOpen={showEmptyBagConfirm}
            onClose={() => setShowEmptyBagConfirm(false)}
            onConfirm={confirmEmptyBag}
            title="EMPTY BAG?"
            message="ARE YOU SURE YOU WANT TO REMOVE ALL ITEMS FROM YOUR BAG?"
            confirmText="CONFIRM"
            cancelText="CANCEL"
            dataAttribute="empty-bag-confirm"
          />

          {/* Delete Item Confirmation Modal */}
          <ConfirmationModal
            isOpen={deleteItemConfirm !== null}
            onClose={() => {
              // Clear any pending timeout when closing
              if (deleteTimeoutRef.current) {
                clearTimeout(deleteTimeoutRef.current);
                deleteTimeoutRef.current = null;
              }
              
              // Restore previous quantity if it exists
              if (deleteItemConfirm?.previousQuantity !== undefined) {
                if (deleteItemConfirm.type === 'cart') {
                  const newItems = cartItems.map(i => {
                    if (i.id === deleteItemConfirm.itemId) {
                      return { ...i, quantity: deleteItemConfirm.previousQuantity };
                    }
                    return i;
                  });
                  setCartItems(newItems);
                  localStorage.setItem('cartItems', JSON.stringify(newItems));
                  window.dispatchEvent(new CustomEvent('cartItemsChanged'));
                  
                  // Update cart count
                  const newCount = newItems.reduce((sum: number, ci: any) => sum + (ci.quantity || 0), 0);
                  localStorage.setItem('cartCount', newCount.toString());
                  setCartCount(newCount);
                  window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: newCount }));
                  window.dispatchEvent(new CustomEvent('cartUpdated'));
                } else {
                  const newSavedForLater = savedForLater.map(i => {
                    if (i.id === deleteItemConfirm.itemId) {
                      return { ...i, quantity: deleteItemConfirm.previousQuantity };
                    }
                    return i;
                  });
                  setSavedForLater(newSavedForLater);
                  localStorage.setItem('savedForLater', JSON.stringify(newSavedForLater));
                  window.dispatchEvent(new CustomEvent('savedItemsChanged'));
                }
              }
              
              setDeleteItemConfirm(null);
            }}
            onConfirm={confirmDeleteItem}
            title="REMOVE ITEM?"
            message={deleteItemConfirm?.type === 'cart' ? "ARE YOU SURE YOU WANT TO REMOVE THIS ITEM FROM YOUR BAG?" : "ARE YOU SURE YOU WANT TO REMOVE THIS ITEM FROM SAVED?"}
            confirmText="CONFIRM"
            cancelText="CANCEL"
            dataAttribute="delete-item-confirm"
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

          {/* Add to List modal - + LIST popup */}
          <AddToListModal
            isOpen={addToListModalOpen}
            onClose={() => {
              setAddToListModalOpen(false);
              setAddToListModalItem(null);
            }}
            item={addToListModalItem}
          />
        </div>
      </div>
    </div>
  );
}

export default ShoppingBagPage;

