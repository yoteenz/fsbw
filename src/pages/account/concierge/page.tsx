import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DynamicCartIcon from '../../../components/DynamicCartIcon';
import ConfirmationModal from '../../../components/ConfirmationModal';
import BrandMenuLinks from '../../../components/BrandMenuLinks';
import SocialMenuIcons from '../../../components/SocialMenuIcons';
import { getCurrentUser, getEffectiveSubscriptionTier, isMockDataAccount, isAyoteenzAdminAccount, clearAppAuth } from '../../../utils/adminAuth';
import { calculateSpecialOfferPrice } from '../../../utils/specialOfferPrice';
import { getOptionsForUnit, type UnitId } from '../../../utils/productOptions';
import { getPerUserKey, getCurrentUserEmailFromStorage, PER_USER_KEYS } from '../../../utils/perUserStorage';
import { normalizeUserOrdersBuckets } from '../../../utils/userOrdersBuckets';
import { getOrderTrackingStageFromOrder } from '../../../utils/orderTracking';
import { getSpecialOfferAdminConfig } from '../../../utils/api';
import specialOfferIconUrl from '../../../assets/special-offer2.svg?url';
import { ShopMobileMenuShopTab } from '../../../components/ShopMobileMenuShopTab';
import { ShopMobileMenuToolsTab } from '../../../components/ShopMobileMenuToolsTab';
import { signInHrefWithReturnTo } from '../../../utils/signInReturnTo';
import { ACCOUNT_MAIN_COLUMN_MIN_HEIGHT, MENU_TOGGLE_PANEL_HEIGHT } from '../../../layouts/menuToggleHeights';

/** Currency rates (USD base) and display symbols for special offer and elsewhere. */
const CURRENCY_RATES: Record<string, { rate: number; symbol: string }> = {
  USD: { rate: 1.0, symbol: '$' },
  EUR: { rate: 0.85, symbol: '€' },
  GBP: { rate: 0.73, symbol: '£' },
  CAD: { rate: 1.25, symbol: 'C$' },
  AUD: { rate: 1.35, symbol: 'A$' },
  JPY: { rate: 110.0, symbol: '¥' },
  CNY: { rate: 6.45, symbol: '¥' },
  INR: { rate: 75.0, symbol: '₹' },
  BRL: { rate: 5.2, symbol: 'R$' },
  MXN: { rate: 20.0, symbol: '$' },
};

// Add pulsating animation style (recording indicator style)
const pulsateStyle = `
  @keyframes pulsate {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.2;
    }
  }
`;

function ConciergePage() {
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
  const [isSignedIn] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('isSignedIn') === 'true';
      } catch (e) {
        return false;
      }
    }
    return false;
  });

  // Priority message state
  const [priorityMessage, setPriorityMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isOrderRelated, setIsOrderRelated] = useState<'yes' | 'no'>('no');
  const [isUrgent, setIsUrgent] = useState<'yes' | 'no'>('no');
  const [relatedOrderId, setRelatedOrderId] = useState<string>('');
  
  // Gift confirmation modal state
  const [showFreeGiftModal, setShowFreeGiftModal] = useState(false);
  const [showBirthdayGiftModal, setShowBirthdayGiftModal] = useState(false);
  const [freeGiftModalMessage, setFreeGiftModalMessage] = useState('');
  const [birthdayGiftModalMessage, setBirthdayGiftModalMessage] = useState('');
  
  // Free gift state - load from localStorage
  const [selectedFreeGift, setSelectedFreeGift] = useState<'melt-band' | 'wig-brush' | ''>(() => {
    try {
      const saved = localStorage.getItem('selectedFreeGift');
      return (saved === 'melt-band' || saved === 'wig-brush') ? saved : '';
    } catch (e) {
      return '';
    }
  });
  
  // Birthday gift state - load from localStorage
  const [selectedBirthdayGift, setSelectedBirthdayGift] = useState<'points' | 'gift-card' | ''>(() => {
    try {
      const saved = localStorage.getItem('selectedBirthdayGift');
      return (saved === 'points' || saved === 'gift-card') ? saved : '';
    } catch (e) {
      return '';
    }
  });

  // Slay Challenge: 6-month cycles (Jan–Jun, Jul–Dec). Selection window = last 3 days of cycle.
  const SLAY_CHALLENGE_SELECTION_DAYS = 3;
  const getSlayChallengeCycleEnd = (): Date => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-11
    if (month < 6) return new Date(year, 5, 30); // Jun 30
    return new Date(year, 11, 31); // Dec 31
  };
  const getSlayChallengeSelectionStart = (): Date => {
    const end = getSlayChallengeCycleEnd();
    const start = new Date(end);
    start.setDate(start.getDate() - SLAY_CHALLENGE_SELECTION_DAYS + 1);
    return start;
  };
  const isInSlayChallengeSelectionWindow = (): boolean => {
    const now = new Date();
    const selectionStart = getSlayChallengeSelectionStart();
    const cycleEnd = getSlayChallengeCycleEnd();
    return now >= selectionStart && now <= cycleEnd;
  };
  const getNextSlayChallengeCycleLabel = (): string => {
    const end = getSlayChallengeCycleEnd();
    const year = end.getFullYear();
    if (end.getMonth() >= 6) return `${year + 1}-H1`; // after Dec 31 -> next year Jan–Jun
    return `${year}-H2`; // after Jun 30 -> same year Jul–Dec
  };

  const [slayChallengeTier1Reward, setSlayChallengeTier1Reward] = useState<'voucher' | '200points' | ''>(() => {
    try {
      const saved = localStorage.getItem('slayChallengeTier1Reward');
      if (saved === 'voucher' || saved === '200points') return saved;
      // Default: show as if user made selection in time
      return '200points';
    } catch (e) { return '200points'; }
  });
  const [slayChallengeTier2Reward, setSlayChallengeTier2Reward] = useState<'2xpoints' | '1000points' | ''>(() => {
    try {
      const saved = localStorage.getItem('slayChallengeTier2Reward');
      if (saved === '2xpoints' || saved === '1000points') return saved;
      // Default: show as if user made selection in time
      return '1000points';
    } catch (e) { return '1000points'; }
  });
  const [slayChallengeSelectedCycle, setSlayChallengeSelectedCycle] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('slayChallengeSelectedCycle');
      if (saved) return saved;
      // Default: show as if user made selection in time (current cycle = active challenge)
      const now = new Date();
      return now.getMonth() < 6 ? `${now.getFullYear()}-H1` : `${now.getFullYear()}-H2`;
    } catch (e) {
      const now = new Date();
      return now.getMonth() < 6 ? `${now.getFullYear()}-H1` : `${now.getFullYear()}-H2`;
    }
  });
  const [slayChallengeTier1Progress, setSlayChallengeTier1Progress] = useState<{ purchase: boolean; review: boolean; post: boolean }>(() => {
    try {
      const raw = localStorage.getItem('slayChallengeTier1Progress');
      if (!raw) return { purchase: false, review: false, post: false };
      const p = JSON.parse(raw);
      return { purchase: !!p.purchase, review: !!p.review, post: !!p.post };
    } catch (e) { return { purchase: false, review: false, post: false }; }
  });
  const [slayChallengeTier2Progress, setSlayChallengeTier2Progress] = useState<{ purchase: boolean; review: boolean; socialTag: boolean }>(() => {
    try {
      const raw = localStorage.getItem('slayChallengeTier2Progress');
      if (!raw) return { purchase: false, review: false, socialTag: false };
      const p = JSON.parse(raw);
      return { purchase: !!p.purchase, review: !!p.review, socialTag: !!p.socialTag };
    } catch (e) { return { purchase: false, review: false, socialTag: false }; }
  });

  const getCurrentSlayChallengeCycleLabel = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    return now.getMonth() < 6 ? `${year}-H1` : `${year}-H2`;
  };
  const slayChallengeNextCycleLabel = getNextSlayChallengeCycleLabel();
  const slayChallengeCurrentCycleLabel = getCurrentSlayChallengeCycleLabel();
  const slayChallengeInSelectionWindow = isInSlayChallengeSelectionWindow();
  const slayChallengeHasSelectedForNext = slayChallengeSelectedCycle === slayChallengeNextCycleLabel;
  const slayChallengeActive = slayChallengeSelectedCycle === slayChallengeCurrentCycleLabel;
  const slayChallengeTier1Complete = slayChallengeTier1Progress.purchase && slayChallengeTier1Progress.review && slayChallengeTier1Progress.post;

  // Ayoteenz admin: disable time limit and force stage for testing (selection | selected_waiting | active | closed)
  const SLAY_CHALLENGE_ADMIN_STAGE_KEY = 'slayChallengeAdminStage';
  const isSlayChallengeAdmin = isAyoteenzAdminAccount(getCurrentUser());
  const [slayChallengeAdminStage, setSlayChallengeAdminStage] = useState<string>(() => {
    try {
      if (!isAyoteenzAdminAccount(getCurrentUser())) return '';
      return localStorage.getItem(SLAY_CHALLENGE_ADMIN_STAGE_KEY) || 'selection';
    } catch (e) { return ''; }
  });
  const effectiveInSelectionWindow = isSlayChallengeAdmin && slayChallengeAdminStage
    ? (slayChallengeAdminStage === 'selection' || slayChallengeAdminStage === 'selected_waiting')
    : slayChallengeInSelectionWindow;
  const effectiveHasSelectedForNext = isSlayChallengeAdmin && slayChallengeAdminStage
    ? slayChallengeAdminStage === 'selected_waiting'
    : slayChallengeHasSelectedForNext;
  const effectiveActive = isSlayChallengeAdmin && slayChallengeAdminStage
    ? slayChallengeAdminStage === 'active'
    : slayChallengeActive;
  const effectiveHasSelectedCycle = isSlayChallengeAdmin && slayChallengeAdminStage === 'closed'
    ? false
    : !!slayChallengeSelectedCycle;
  const setSlayChallengeAdminStageAndSave = (stage: string) => {
    setSlayChallengeAdminStage(stage);
    try {
      if (stage) localStorage.setItem(SLAY_CHALLENGE_ADMIN_STAGE_KEY, stage);
      else localStorage.removeItem(SLAY_CHALLENGE_ADMIN_STAGE_KEY);
    } catch (_) {}
  };

  const handleSlayChallengeConfirmSelection = () => {
    if (!slayChallengeTier1Reward || !slayChallengeTier2Reward) return;
    try {
      localStorage.setItem('slayChallengeSelectedCycle', slayChallengeNextCycleLabel);
      localStorage.setItem('slayChallengeTier1Reward', slayChallengeTier1Reward);
      localStorage.setItem('slayChallengeTier2Reward', slayChallengeTier2Reward);
      localStorage.setItem('slayChallengeTier1Progress', JSON.stringify({ purchase: false, review: false, post: false }));
      localStorage.setItem('slayChallengeTier2Progress', JSON.stringify({ purchase: false, review: false, socialTag: false }));
      setSlayChallengeSelectedCycle(slayChallengeNextCycleLabel);
      setSlayChallengeTier1Progress({ purchase: false, review: false, post: false });
      setSlayChallengeTier2Progress({ purchase: false, review: false, socialTag: false });
    } catch (e) {
      console.error('Error saving Slay Challenge selection:', e);
    }
  };

  // Persist tier progress when it changes (e.g. from other pages)
  useEffect(() => {
    try {
      localStorage.setItem('slayChallengeTier1Progress', JSON.stringify(slayChallengeTier1Progress));
      localStorage.setItem('slayChallengeTier2Progress', JSON.stringify(slayChallengeTier2Progress));
    } catch (_) {}
  }, [slayChallengeTier1Progress, slayChallengeTier2Progress]);

  // Special Offer: random unit of 6, random premium options, $40 off; expires on the 1st of every other month (Jan, Mar, May, Jul, Sep, Nov) — ~58–62 days per period
  const SPECIAL_OFFER_UNITS = [
    { id: 'noir', name: 'NOIR', route: '/straight/noir', basePrice: 740, image: '/assets/natural front.png' },
    { id: 'blanco', name: 'BLANCO', route: '/straight/blanco', basePrice: 820, image: '/assets/2D BLANCO FRONT.png' },
    { id: 'soft-wave', name: 'SOFT WAVE', route: '/wavy/soft-wave', basePrice: 980, image: '/assets/natural front.png' },
    { id: 'beach-wave', name: 'BEACH WAVE', route: '/wavy/beach-wave', basePrice: 980, image: '/assets/natural front.png' },
    { id: 'soft-curl', name: 'SOFT CURL', route: '/curly/soft-curl', basePrice: 900, image: '/assets/natural front.png' },
    { id: 'ocean-curl', name: 'OCEAN CURL', route: '/curly/ocean-curl', basePrice: 900, image: '/assets/natural front.png' }
  ] as const;
  const SPECIAL_OFFER_DISCOUNT = 40;
  const SPECIAL_OFFER_DAYS = 60; // approximate; actual run is 58–62 days so expiration lands on the 1st
  /** Expiration months: 1st of every other month — Jan, Mar, May, Jul, Sep, Nov. */
  const SPECIAL_OFFER_EXPIRATION_MONTHS = [0, 2, 4, 6, 8, 10]; // Jan, Mar, May, Jul, Sep, Nov
  /** Next offer expiration: 1st of the next expiration month (end of that day). Never any other day. */
  const getNextSpecialOfferExpirationDate = (): Date => {
    const now = new Date();
    const year = now.getFullYear();
    for (const m of SPECIAL_OFFER_EXPIRATION_MONTHS) {
      const exp = new Date(year, m, 1, 23, 59, 59, 999);
      if (exp.getTime() >= now.getTime()) return exp;
    }
    return new Date(year + 1, 0, 1, 23, 59, 59, 999); // next Jan 1
  };
  /** Given a timestamp, return the next expiration date (1st of Jan/Mar/May/Jul/Sep/Nov at end of day) strictly after that time. */
  const getNextExpirationAfter = (afterMs: number): number => {
    const after = new Date(afterMs);
    const year = after.getFullYear();
    const candidates: number[] = [];
    for (const m of SPECIAL_OFFER_EXPIRATION_MONTHS) {
      candidates.push(new Date(year, m, 1, 23, 59, 59, 999).getTime());
    }
    candidates.push(new Date(year + 1, 0, 1, 23, 59, 59, 999).getTime());
    const next = candidates.find((t) => t > afterMs);
    return next ?? new Date(year + 1, 0, 1, 23, 59, 59, 999).getTime();
  };
  const pickRandom = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

  const SPECIAL_OFFER_ADMIN_KEY = 'specialOfferAdminConfig';
  const [specialOffer, setSpecialOffer] = useState<{
    unitId: string;
    unitName: string;
    route: string;
    originalPrice: number;
    discountedPrice: number;
    options: { length?: string; density?: string; texture?: string; lace?: string; color?: string; hairline?: string; styling?: string; addOns?: string[] };
    expiresAt: number;
    thumbnailDataUrl?: string;
  } | null>(() => {
    try {
      const raw = localStorage.getItem('specialOffer');
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (data.expiresAt && Date.now() >= data.expiresAt) return null;
      return data;
    } catch (e) { return null; }
  });

  useEffect(() => {
    if (specialOffer !== null && specialOffer.expiresAt > Date.now()) return;
    let cancelled = false;

    const applyAdminConfig = (adminConfig: Record<string, unknown>): boolean => {
      const uid = adminConfig.unitId;
      const start = adminConfig.startDate;
      if (typeof uid !== 'string' || typeof start !== 'string') return false;
      const unit = SPECIAL_OFFER_UNITS.find((u) => u.id === uid) ?? SPECIAL_OFFER_UNITS[0];
      const startMs = new Date(start).getTime();
      const expiresAt = getNextExpirationAfter(startMs);
      if (expiresAt <= Date.now()) return false;
      const rawAddOns = Array.isArray(adminConfig.addOns)
        ? adminConfig.addOns
        : Array.isArray(adminConfig.addons)
          ? adminConfig.addons
          : [];
      const options = {
        length: (typeof adminConfig.length === 'string' ? adminConfig.length : undefined) ?? '24"',
        density: (typeof adminConfig.density === 'string' ? adminConfig.density : undefined) ?? '200%',
        texture: (typeof adminConfig.texture === 'string' ? adminConfig.texture : undefined) ?? 'SILKY',
        lace: (typeof adminConfig.lace === 'string' ? adminConfig.lace : undefined) ?? '13X6',
        color: (typeof adminConfig.color === 'string' ? adminConfig.color : undefined) ?? 'OFF BLACK',
        hairline: (typeof adminConfig.hairline === 'string' ? adminConfig.hairline : undefined) ?? 'NATURAL',
        styling: (typeof adminConfig.styling === 'string' ? adminConfig.styling : undefined) ?? 'NONE',
        addOns: rawAddOns.map((a: unknown) => String(a).trim()).filter(Boolean)
      };
      const originalPrice = calculateSpecialOfferPrice(unit.id, options);
      const thumb = adminConfig.thumbnailDataUrl;
      const next = {
        unitId: unit.id,
        unitName: unit.name,
        route: unit.route,
        originalPrice,
        discountedPrice: originalPrice - SPECIAL_OFFER_DISCOUNT,
        options,
        expiresAt,
        thumbnailDataUrl: typeof thumb === 'string' && thumb ? thumb : undefined
      };
      if (cancelled) return true;
      setSpecialOffer(next);
      try {
        localStorage.setItem('specialOffer', JSON.stringify(next));
      } catch (_) { /* ignore */ }
      return true;
    };

    void (async () => {
      let adminConfig: Record<string, unknown> | null = null;
      try {
        const fromApi = await getSpecialOfferAdminConfig();
        if (fromApi && typeof fromApi.unitId === 'string' && fromApi.startDate) {
          adminConfig = fromApi;
          try {
            localStorage.setItem(SPECIAL_OFFER_ADMIN_KEY, JSON.stringify(fromApi));
          } catch (_) { /* ignore */ }
        }
      } catch (_) { /* ignore */ }
      if (!adminConfig) {
        try {
          const rawAdmin = localStorage.getItem(SPECIAL_OFFER_ADMIN_KEY);
          if (rawAdmin) adminConfig = JSON.parse(rawAdmin) as Record<string, unknown>;
        } catch (_) {
          adminConfig = null;
        }
      }
      if (cancelled) return;
      try {
        if (adminConfig && applyAdminConfig(adminConfig)) return;
      } catch (_) { /* fall through to random */ }
      if (cancelled) return;
      const unit = pickRandom(SPECIAL_OFFER_UNITS);
      const unitOpts = getOptionsForUnit(unit.id as UnitId);
      const options = {
        length: pickRandom(unitOpts.length),
        density: pickRandom(unitOpts.density),
        texture: pickRandom(unitOpts.texture),
        lace: pickRandom(unitOpts.lace),
        color: pickRandom(unitOpts.color)
      };
      const originalPrice = calculateSpecialOfferPrice(unit.id, options);
      const expirationDate = getNextSpecialOfferExpirationDate();
      const expiresAt = expirationDate.getTime();
      const next = {
        unitId: unit.id,
        unitName: unit.name,
        route: unit.route,
        originalPrice,
        discountedPrice: originalPrice - SPECIAL_OFFER_DISCOUNT,
        options,
        expiresAt
      };
      if (cancelled) return;
      setSpecialOffer(next);
      try {
        localStorage.setItem('specialOffer', JSON.stringify(next));
      } catch (_) { /* ignore */ }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const specialOfferExpiresOnLabel = specialOffer
    ? (() => {
        const d = new Date(specialOffer.expiresAt);
        const month = d.toLocaleDateString('en-US', { month: 'short' });
        const day = d.getDate();
        return `${month} ${day}`;
      })()
    : '';
  const specialOfferProgress = specialOffer
    ? (() => {
        const periodMs = SPECIAL_OFFER_DAYS * 24 * 60 * 60 * 1000;
        const startAt = specialOffer.expiresAt - periodMs;
        return Math.min(1, Math.max(0, (Date.now() - startAt) / periodMs));
      })()
    : 0;
  const specialOfferDaysLeft = specialOffer
    ? Math.max(0, Math.floor((specialOffer.expiresAt - Date.now()) / (24 * 60 * 60 * 1000)))
    : 0;

  const [specialOfferCapSize, setSpecialOfferCapSize] = useState('M');
  const SPECIAL_OFFER_CAP_SIZES = ['XS', 'S', 'M', 'L'] as const;

  const [selectedCurrency, setSelectedCurrency] = useState<string>(() => {
    try {
      const key = getPerUserKey(PER_USER_KEYS.selectedCurrency, getCurrentUserEmailFromStorage());
      const saved = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
      return (saved && CURRENCY_RATES[saved]) ? saved : 'USD';
    } catch {
      return 'USD';
    }
  });

  useEffect(() => {
    const key = getPerUserKey(PER_USER_KEYS.selectedCurrency, getCurrentUserEmailFromStorage());
    const saved = localStorage.getItem(key);
    if (saved && CURRENCY_RATES[saved] && saved !== selectedCurrency) setSelectedCurrency(saved);
    const onStorage = () => {
      const k = getPerUserKey(PER_USER_KEYS.selectedCurrency, getCurrentUserEmailFromStorage());
      const s = localStorage.getItem(k);
      if (s && CURRENCY_RATES[s]) setSelectedCurrency(s);
    };
    const onCurrencyChange = (e: Event) => {
      const code = (e as CustomEvent).detail;
      if (code && CURRENCY_RATES[code]) setSelectedCurrency(code);
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('currencyChanged', onCurrencyChange as EventListener);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('currencyChanged', onCurrencyChange as EventListener);
    };
  }, [selectedCurrency]);

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

  const SPECIAL_OFFER_MAX_QUANTITY = 2;

  const formatSpecialOfferPrice = (usdAmount: number): string => {
    const cur = CURRENCY_RATES[selectedCurrency] || CURRENCY_RATES.USD;
    const amount = usdAmount * cur.rate;
    const formatted = amount % 1 === 0
      ? Math.round(amount).toLocaleString(undefined, { maximumFractionDigits: 0 })
      : amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    return `${cur.symbol}${formatted}`;
  };

  const handleClaimSpecialOffer = () => {
    if (!specialOffer) return;
    try {
      const unit = SPECIAL_OFFER_UNITS.find((u) => u.id === specialOffer.unitId);
      const image = unit?.image ?? '/assets/natural front.png';
      const length = specialOffer.options?.length ?? '24"';
      const density = specialOffer.options?.density ?? '200%';
      const texture = specialOffer.options?.texture ?? 'SILKY';
      const lace = specialOffer.options?.lace ?? '13X6';
      const color = specialOffer.options?.color ?? 'OFF BLACK';
      const hairline = specialOffer.options?.hairline ?? 'NATURAL';
      const styling = specialOffer.options?.styling ?? 'NONE';
      const addOns = Array.isArray(specialOffer.options?.addOns) ? specialOffer.options.addOns : [];

      const stored = localStorage.getItem('cartItems');
      const cartItems: any[] = stored ? JSON.parse(stored) : [];

      const isSameSpecialOffer = (item: any) =>
        item.isSpecialOffer &&
        item.name === specialOffer.unitName &&
        item.capSize === specialOfferCapSize &&
        (item.length ?? '24"') === length &&
        (item.density ?? '200%') === density &&
        (item.texture ?? 'SILKY') === texture &&
        (item.lace ?? '13X6') === lace &&
        (item.color ?? 'OFF BLACK') === color &&
        (item.hairline ?? 'NATURAL') === hairline &&
        (item.styling ?? 'NONE') === styling &&
        JSON.stringify(item.addOns || []) === JSON.stringify(addOns);

      const existingIndex = cartItems.findIndex(isSameSpecialOffer);
      let updated: any[];

      if (existingIndex >= 0) {
        const existing = cartItems[existingIndex];
        const currentQty = existing.quantity ?? 1;
        if (currentQty >= SPECIAL_OFFER_MAX_QUANTITY) return;
        updated = cartItems.slice();
        updated[existingIndex] = { ...existing, quantity: currentQty + 1 };
      } else {
        const cartItem = {
          id: `special-offer-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          name: specialOffer.unitName,
          price: specialOffer.discountedPrice,
          quantity: 1,
          image,
          capSize: specialOfferCapSize,
          length,
          density,
          texture,
          lace,
          color,
          hairline,
          styling,
          addOns,
          isSpecialOffer: true
        };
        updated = [cartItem, ...cartItems];
      }

      localStorage.setItem('cartItems', JSON.stringify(updated));
      const newCount = updated.length;
      localStorage.setItem('cartCount', String(newCount));
      setCartCount(newCount);
      window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: newCount }));
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (e) {
      console.error('Error adding special offer to cart:', e);
    }
  };

  // Check if user is eligible for birthday gift (within 12 months of premium membership start)
  const isEligibleForBirthdayGift = () => {
    try {
      const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (!userData?.membershipType || userData.membershipType !== 'PREMIUM') {
        return false;
      }
      
      // Check if user has subscriptionPurchasedAt date
      if (!userData.subscriptionPurchasedAt) {
        return false;
      }
      
      const startDate = new Date(userData.subscriptionPurchasedAt);
      const now = new Date();
      const twelveMonthsLater = new Date(startDate);
      twelveMonthsLater.setMonth(twelveMonthsLater.getMonth() + 12);
      
      // Eligible if current date is within 12 months of premium membership start
      return now <= twelveMonthsLater;
    } catch (e) {
      console.error('Error checking birthday gift eligibility:', e);
      return false;
    }
  };
  
  // Check if user is eligible for birthday gift
  // Note: This is calculated but may not be used in current render logic
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // @ts-ignore - intentionally unused, may be used in future
  const _eligibleForBirthdayGift = isEligibleForBirthdayGift();
  
  // Admin (mock-data) account only – gets test orders; all others start with no orders
  const isMockOrdersAccount = () => isMockDataAccount(getCurrentUser());
  // Special Offer & Slay Challenge: only for 6-month or 12-month premium (not 3-month)
  const effectiveSubscriptionTier = getEffectiveSubscriptionTier(getCurrentUser());
  const showSlayAndSpecialOffer = effectiveSubscriptionTier === '6months' || effectiveSubscriptionTier === '12months';
  
  // Order tracking state
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const orderTrackingSectionRef = useRef<HTMLDivElement | null>(null);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [expandedStages, setExpandedStages] = useState<Set<number>>(new Set());

  const CONCIERGE_TRACKING_STATUSES = [
    'PLACED', 'CONFIRMED', 'PREPARING', 'SHIPPED_TO_HUB', 'IN_TRANSIT',
    'PROCESSING', 'CUSTOMIZING', 'FINALIZING', 'SHIPPED', 'DELIVERED'
  ];

  // Get active orders for tracking
  useEffect(() => {
    const getActiveOrders = () => {
      try {
        const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (!userData?.email) {
          setActiveOrders([]);
          return;
        }
        
        const userOrdersKey = `userOrders_${userData.email}`;
        let storedOrders = localStorage.getItem(userOrdersKey);
        
        // If no orders exist: only seed test orders for admin (mock-data) account. New/other accounts start empty.
        if (!storedOrders) {
          if (!isMockOrdersAccount()) {
            const emptyOrders = { activeOrders: [], pastOrders: [] };
            localStorage.setItem(userOrdersKey, JSON.stringify(emptyOrders));
            setActiveOrders([]);
            return;
          }
          // Create order date 13 days ago to show 20% progress in CONSTRUCTING UNIT stage (admin test only)
          // Constructing starts at day 5 (after sourcing ends: 2 + 3 = 5), takes 28 days. To be at 20%: 5 + (28 * 0.2) = 10.6 days ? 11 days
          const constructingOrderDate = new Date();
          constructingOrderDate.setDate(constructingOrderDate.getDate() - 13);
          // Format as MM-DD-YYYY for consistent parsing
          const month = String(constructingOrderDate.getMonth() + 1).padStart(2, '0');
          const day = String(constructingOrderDate.getDate()).padStart(2, '0');
          const year = constructingOrderDate.getFullYear();
          const formattedDate = `${month}-${day}-${year}`;
          
          const testOrder = {
            id: 'test-order-1',
            orderNumber: 'ORDER #888',
            date: formattedDate,
            status: 'DELIVERED',
            productName: 'NOIR',
            productImage: '/assets/natural front.png',
            total: 740,
            items: 1,
            trackingStage: 8, // All stages completed for delivered order
            orderFormSigned: true, // Form was signed (order progressed to delivered)
            placedAt: constructingOrderDate.getTime(), // Timestamp when order was placed
            trackingNumber: '1Z888AA10123456784',
            deliveryDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            deliveryTime: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
            deliveryLocation: 'FRONT DOOR',
            requiresSignature: true,
            // Selection data for icons
            length: '16"',
            density: '200%',
            texture: 'SILKY',
            capSize: 'L',
            lace: '13X6',
            hairline: 'NATURAL',
            color: 'OFF BLACK',
            styling: 'BANGS',
            addOns: ['BLEACH']
          };
          
          const deliveredOrderDate = new Date();
          deliveredOrderDate.setDate(deliveredOrderDate.getDate() - 60); // 60 days ago for delivered order
          const deliveredOrder = {
            id: 'test-order-2',
            orderNumber: 'ORDER #999',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            status: 'DELIVERED',
            productName: 'NOIR',
            productImage: '/assets/natural front.png',
            total: 740,
            items: 1,
            trackingStage: 8, // All stages completed for delivered order
            orderFormSigned: true, // Form was signed (order progressed to delivered)
            placedAt: deliveredOrderDate.getTime(), // Timestamp when order was placed
            trackingNumber: '1Z999AA10123456784',
            deliveryDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            deliveryTime: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
            deliveryLocation: 'FRONT DOOR',
            requiresSignature: true,
            // Selection data for icons
            length: '24"',
            density: '250%',
            texture: 'SILKY',
            capSize: 'M',
            lace: '13X6',
            hairline: 'LAGOS',
            color: 'OFF BLACK',
            styling: 'NONE', // No styling selected - icon should not appear
            addOns: [] // No add-ons selected - icon should not appear
          };
          
          // Create a canceled order (form not signed + past 24 hours) for initial setup
          const canceledOrderDate = new Date();
          canceledOrderDate.setDate(canceledOrderDate.getDate() - 2); // 2 days ago (past 24 hour limit)
          const canceledMonth = String(canceledOrderDate.getMonth() + 1).padStart(2, '0');
          const canceledDay = String(canceledOrderDate.getDate()).padStart(2, '0');
          const canceledYear = canceledOrderDate.getFullYear();
          const canceledFormattedDate = `${canceledMonth}-${canceledDay}-${canceledYear}`;
          
          const canceledOrder = {
            id: 'test-order-4',
            orderNumber: 'ORDER #666',
            date: canceledFormattedDate,
            status: 'CANCELED',
            productName: 'BLANCO',
            productImage: '/assets/natural front.png',
            total: 820,
            items: 1,
            trackingStage: 0,
            orderFormSigned: false,
            canceledAt: Date.now(),
            placedAt: canceledOrderDate.getTime() - (25 * 60 * 60 * 1000), // 25 hours ago (past 24 hour limit)
            // Selection data for icons
            length: '18"',
            density: '200%',
            texture: 'SILKY',
            capSize: 'M',
            lace: '13X6',
            hairline: 'NATURAL',
            color: 'PLATINUM',
            styling: 'NONE',
            addOns: []
          };
          
          // Create an order awaiting signature (form not signed + within 24 hours)
          const awaitingSignatureOrderDate = new Date();
          awaitingSignatureOrderDate.setHours(awaitingSignatureOrderDate.getHours() - 12); // 12 hours ago (within 24 hour limit)
          const awaitingMonth = String(awaitingSignatureOrderDate.getMonth() + 1).padStart(2, '0');
          const awaitingDay = String(awaitingSignatureOrderDate.getDate()).padStart(2, '0');
          const awaitingYear = awaitingSignatureOrderDate.getFullYear();
          const awaitingFormattedDate = `${awaitingMonth}-${awaitingDay}-${awaitingYear}`;
          
          const awaitingSignatureOrder = {
            id: 'test-order-5',
            orderNumber: 'ORDER #555',
            date: awaitingFormattedDate,
            status: 'PLACED', // Still in PLACED status (awaiting signature)
            productName: 'NOIR',
            productImage: '/assets/natural front.png',
            total: 920,
            items: 1,
            trackingStage: 0, // Still at confirmed stage
            orderFormSigned: false, // Form was NOT signed yet
            placedAt: awaitingSignatureOrderDate.getTime(), // 12 hours ago (within 24 hour limit)
            // Selection data for icons
            length: '20"',
            density: '200%',
            texture: 'SILKY',
            capSize: 'M',
            lace: '13X6',
            hairline: 'NATURAL',
            color: 'OFF BLACK',
            styling: 'NONE',
            addOns: []
          };
          
          const testOrdersData = {
            activeOrders: [testOrder, deliveredOrder, awaitingSignatureOrder],
            pastOrders: [canceledOrder],
          };
          
          localStorage.setItem(userOrdersKey, JSON.stringify(testOrdersData));
          storedOrders = JSON.stringify(testOrdersData);
        }
        
        if (storedOrders) {
          const orders = JSON.parse(storedOrders);
          let active = [...(orders.activeOrders || [])];
          let past = [...(orders.pastOrders || [])];
          
          // Check if there's already a test order for testing
          const existingTestOrderIndex = [...active, ...past].findIndex((order: any) => 
            order.id === 'test-order-1' || (order.orderNumber === 'ORDER #888')
          );
          
          // Check if there's already a delivered order for testing
          const existingDeliveredOrderIndex = [...active, ...past].findIndex((order: any) => 
            order.id === 'test-order-2' || (order.status === 'DELIVERED' && order.orderNumber === 'ORDER #999')
          );
          
          // Check if there's already a multi-unit test order
          const existingMultiUnitOrderIndex = [...active, ...past].findIndex((order: any) => 
            order.id === 'test-order-3' || order.orderNumber === 'ORDER #777'
          );
          
          // Create or update the test order with 20% progress in CONSTRUCTING UNIT
          // Constructing starts at day 5 (after sourcing ends: 2 + 3 = 5), takes 28 days. To be at 20%: 5 + (28 * 0.2) = 10.6 days ? 11 days
          const constructingOrderDate = new Date();
          constructingOrderDate.setDate(constructingOrderDate.getDate() - 13);
          // Format as MM-DD-YYYY for consistent parsing
          const month = String(constructingOrderDate.getMonth() + 1).padStart(2, '0');
          const day = String(constructingOrderDate.getDate()).padStart(2, '0');
          const year = constructingOrderDate.getFullYear();
          const formattedDate = `${month}-${day}-${year}`;
          
          const testOrder = {
            id: 'test-order-1',
            orderNumber: 'ORDER #888',
            date: formattedDate,
            status: 'DELIVERED',
            productName: 'NOIR',
            productImage: '/assets/natural front.png',
            total: 740,
            items: 1,
            trackingStage: 8, // All stages completed for delivered order
            orderFormSigned: true, // Form was signed (order progressed to delivered)
            placedAt: constructingOrderDate.getTime(), // Timestamp when order was placed
            trackingNumber: '1Z888AA10123456784',
            deliveryDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            deliveryTime: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
            deliveryLocation: 'FRONT DOOR',
            requiresSignature: true,
            // Selection data for icons
            length: '16"',
            density: '200%',
            texture: 'SILKY',
            capSize: 'L',
            lace: '13X6',
            hairline: 'NATURAL',
            color: 'OFF BLACK',
            styling: 'BANGS',
            addOns: ['BLEACH']
          };
          
          if (existingTestOrderIndex >= 0) {
            // Update existing test order
            if (existingTestOrderIndex < active.length) {
              active[existingTestOrderIndex] = testOrder;
            } else {
              const pastIndex = existingTestOrderIndex - active.length;
              past[pastIndex] = testOrder;
            }
          } else {
            // Add new test order if it doesn't exist
            active.push(testOrder);
          }
          
          // Create or update the delivered test order with correct signature and location
          const deliveredOrderDate = new Date();
          deliveredOrderDate.setDate(deliveredOrderDate.getDate() - 60); // 60 days ago for delivered order
          const deliveredOrder = {
            id: 'test-order-2',
            orderNumber: 'ORDER #999',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            status: 'DELIVERED',
            productName: 'NOIR',
            productImage: '/assets/natural front.png',
            total: 740,
            items: 1,
            trackingStage: 8, // All stages completed for delivered order
            orderFormSigned: true, // Form was signed (order progressed to delivered)
            placedAt: deliveredOrderDate.getTime(), // Timestamp when order was placed
            trackingNumber: '1Z999AA10123456784',
            deliveryDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            deliveryTime: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
            deliveryLocation: 'FRONT DOOR',
            requiresSignature: true,
            // Selection data for icons
            length: '24"',
            density: '250%',
            texture: 'SILKY',
            capSize: 'M',
            lace: '13X6',
            hairline: 'LAGOS',
            color: 'JET BLACK', // Custom color for customizing stage
            styling: 'CRIMPS', // Custom styling for customizing stage
            addOns: ['PLUCK', 'BLEACH'] // Add-ons for customizing stage
          };
          
          if (existingDeliveredOrderIndex >= 0) {
            // Update existing order
            if (existingDeliveredOrderIndex < active.length) {
              active[existingDeliveredOrderIndex] = deliveredOrder;
            } else {
              const pastIndex = existingDeliveredOrderIndex - active.length;
              past[pastIndex] = deliveredOrder;
            }
          } else {
            // Add new order
            active.push(deliveredOrder);
          }
          
          // Create or update multi-unit test order for icon positioning/design testing
          const multiUnitOrderDate = new Date();
          multiUnitOrderDate.setDate(multiUnitOrderDate.getDate() - 20);
          const multiUnitMonth = String(multiUnitOrderDate.getMonth() + 1).padStart(2, '0');
          const multiUnitDay = String(multiUnitOrderDate.getDate()).padStart(2, '0');
          const multiUnitYear = multiUnitOrderDate.getFullYear();
          const multiUnitFormattedDate = `${multiUnitMonth}-${multiUnitDay}-${multiUnitYear}`;
          
          const multiUnitOrder = {
            id: 'test-order-3',
            orderNumber: 'ORDER #777',
            date: multiUnitFormattedDate,
            status: 'PREPARING',
            productName: 'NOIR',
            productImage: '/assets/natural front.png',
            total: 1480,
            items: 2,
            trackingStage: 2, // PREPARING status = constructing stage (2)
            orderFormSigned: true, // Form was signed (order progressed to sourcing)
            placedAt: multiUnitOrderDate.getTime(), // Timestamp when order was placed
            // Multi-unit selection data - array of units with different selections
            units: [
              {
                // Unit 1
                length: '16"',
                density: '200%',
                texture: 'SILKY',
                capSize: 'L',
                lace: '13X6',
                hairline: 'NATURAL',
                color: 'OFF BLACK',
                styling: 'BANGS',
                addOns: ['BLEACH']
              },
              {
                // Unit 2 - different selections
                length: '20"',
                density: '250%',
                texture: 'SILKY',
                capSize: 'M',
                lace: '13X4',
                hairline: 'LAGOS',
                color: 'JET BLACK',
                styling: 'CRIMPS',
                addOns: ['PLUCK', 'BLEACH']
              }
            ],
            // For backward compatibility, also set first unit's values at root level
            length: '16"',
            density: '200%',
            texture: 'SILKY',
            capSize: 'L',
            lace: '13X6',
            hairline: 'NATURAL',
            color: 'OFF BLACK',
            styling: 'BANGS',
            addOns: ['BLEACH']
          };
          
          if (existingMultiUnitOrderIndex >= 0) {
            // Update existing multi-unit order
            if (existingMultiUnitOrderIndex < active.length) {
              active[existingMultiUnitOrderIndex] = multiUnitOrder;
            } else {
              const pastIndex = existingMultiUnitOrderIndex - active.length;
              past[pastIndex] = multiUnitOrder;
            }
          } else {
            // Add new multi-unit order
            active.push(multiUnitOrder);
          }
          
          // Create a canceled order (form not signed + past 24 hours)
          const canceledOrderDate = new Date();
          canceledOrderDate.setDate(canceledOrderDate.getDate() - 2); // 2 days ago (past 24 hour limit)
          const canceledMonth = String(canceledOrderDate.getMonth() + 1).padStart(2, '0');
          const canceledDay = String(canceledOrderDate.getDate()).padStart(2, '0');
          const canceledYear = canceledOrderDate.getFullYear();
          const canceledFormattedDate = `${canceledMonth}-${canceledDay}-${canceledYear}`;
          
          const canceledOrder = {
            id: 'test-order-4',
            orderNumber: 'ORDER #666',
            date: canceledFormattedDate,
            status: 'CANCELED',
            productName: 'BLANCO',
            productImage: '/assets/natural front.png',
            total: 820,
            items: 1,
            trackingStage: 0,
            orderFormSigned: false,
            canceledAt: Date.now(),
            placedAt: canceledOrderDate.getTime() - (25 * 60 * 60 * 1000),
            // Selection data for icons
            length: '18"',
            density: '200%',
            texture: 'SILKY',
            capSize: 'M',
            lace: '13X6',
            hairline: 'NATURAL',
            color: 'PLATINUM',
            styling: 'NONE',
            addOns: []
          };
          
          // Check if canceled order already exists
          const existingCanceledOrderIndex = [...active, ...past].findIndex((order: any) => 
            order.id === 'test-order-4' || order.orderNumber === 'ORDER #666'
          );
          
          if (existingCanceledOrderIndex >= 0) {
            if (existingCanceledOrderIndex < active.length) {
              active.splice(existingCanceledOrderIndex, 1);
            } else {
              const pastIndex = existingCanceledOrderIndex - active.length;
              past.splice(pastIndex, 1);
            }
            past.push(canceledOrder);
          } else {
            past.push(canceledOrder);
          }
          
          // Create or update an order awaiting signature (form not signed + within 24 hours)
          const awaitingSignatureOrderDate = new Date();
          awaitingSignatureOrderDate.setHours(awaitingSignatureOrderDate.getHours() - 12); // 12 hours ago (within 24 hour limit)
          const awaitingMonth = String(awaitingSignatureOrderDate.getMonth() + 1).padStart(2, '0');
          const awaitingDay = String(awaitingSignatureOrderDate.getDate()).padStart(2, '0');
          const awaitingYear = awaitingSignatureOrderDate.getFullYear();
          const awaitingFormattedDate = `${awaitingMonth}-${awaitingDay}-${awaitingYear}`;
          
          const awaitingSignatureOrder = {
            id: 'test-order-5',
            orderNumber: 'ORDER #555',
            date: awaitingFormattedDate,
            status: 'PLACED', // Still in PLACED status (awaiting signature)
            productName: 'NOIR',
            productImage: '/assets/natural front.png',
            total: 920,
            items: 1,
            trackingStage: 0, // Still at confirmed stage
            orderFormSigned: false, // Form was NOT signed yet
            placedAt: awaitingSignatureOrderDate.getTime(), // 12 hours ago (within 24 hour limit)
            // Selection data for icons
            length: '20"',
            density: '200%',
            texture: 'SILKY',
            capSize: 'M',
            lace: '13X6',
            hairline: 'NATURAL',
            color: 'OFF BLACK',
            styling: 'NONE',
            addOns: []
          };
          
          // Check if awaiting signature order already exists
          const existingAwaitingOrderIndex = [...active, ...past].findIndex((order: any) => 
            order.id === 'test-order-5' || order.orderNumber === 'ORDER #555'
          );
          
          if (existingAwaitingOrderIndex >= 0) {
            // Update existing awaiting signature order
            if (existingAwaitingOrderIndex < active.length) {
              active[existingAwaitingOrderIndex] = awaitingSignatureOrder;
            } else {
              const pastIndex = existingAwaitingOrderIndex - active.length;
              past[pastIndex] = awaitingSignatureOrder;
            }
          } else {
            // Add new awaiting signature order
            active.push(awaitingSignatureOrder);
          }
          
          const norm = normalizeUserOrdersBuckets(active, past);
          active = norm.activeOrders;
          past = norm.pastOrders;

          // Save back to localStorage
          const updatedOrders = {
            activeOrders: active,
            pastOrders: past
          };
          localStorage.setItem(userOrdersKey, JSON.stringify(updatedOrders));
          
          // Orders with unseen tracking alerts (for auto-select and badge)
          const allOrdersForAlerts = [...active, ...past];
          const unseen = allOrdersForAlerts.filter(
            (o: any) => o?.id != null && o?.status && CONCIERGE_TRACKING_STATUSES.includes(o.status) && !localStorage.getItem(`conciergeOrderSeen_${o.id}_${o.status}`)
          );
          unseen.sort((a: any, b: any) => (a.placedAt || 0) - (b.placedAt || 0));

          // Check if orderId is in URL query params (from orders page click)
          const urlParams = new URLSearchParams(location.search);
          const orderIdFromUrl = urlParams.get('orderId');
          
          if (orderIdFromUrl) {
            // Check if the order exists in active or past orders
            const orderFromUrl = active.find((o: any) => o.id === orderIdFromUrl) || past.find((o: any) => o.id === orderIdFromUrl);
            if (orderFromUrl) {
              // If order is in past orders, add it to active temporarily for display
              if (past.find((o: any) => o.id === orderIdFromUrl)) {
                active.push(orderFromUrl);
              }
              setSelectedOrderId(orderIdFromUrl);
            }
          } else if (unseen.length > 0) {
            // Auto-select order with oldest unread tracking update so it appears in dropdown
            const oldestUnseen = unseen[0];
            if (past.find((o: any) => o.id === oldestUnseen.id)) {
              active.push(oldestUnseen);
            }
            setSelectedOrderId(oldestUnseen.id);
          } else if (!selectedOrderId) {
            // Auto-select order 999 (completed) if it exists and user is Kateena admin, otherwise first active order
            // Only auto-load order 999 for Kateena admin account (for mock order testing)
            if (isMockOrdersAccount()) {
              // First, try to find order 999 in past orders (delivered/completed)
              const order999 = past.find((order: any) => order.orderNumber === 'ORDER #999');
              if (order999) {
                // Add order 999 to active orders temporarily so tracking can display it
                active.push(order999);
                setSelectedOrderId(order999.id);
              } else if (active.length > 0) {
                // Fall back to first active order if order 999 not found
                setSelectedOrderId(active[0].id);
              }
            } else if (active.length > 0) {
              // For non-admin accounts, select first active order
              setSelectedOrderId(active[0].id);
            }
          }
          
          // Only include active orders (exclude archived/past orders)
          // Priority messages and order tracking should only show active orders
          setActiveOrders(active);
        } else {
          setActiveOrders([]);
        }
      } catch (e) {
        console.error('Error loading active orders:', e);
        setActiveOrders([]);
      }
    };

    getActiveOrders();
    // Re-fetch orders when signed-in user changes (e.g. new account) so page shows that account's data
    window.addEventListener('storage', getActiveOrders);
    window.addEventListener('signInStateChanged', getActiveOrders);
    window.addEventListener('focus', getActiveOrders);
    return () => {
      window.removeEventListener('storage', getActiveOrders);
      window.removeEventListener('signInStateChanged', getActiveOrders);
      window.removeEventListener('focus', getActiveOrders);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // Orders page: /account/concierge?orderId=…#order-tracking — scroll to Order Tracking once order is selected
  useEffect(() => {
    if (location.hash !== '#order-tracking') return;
    const id = new URLSearchParams(location.search).get('orderId');
    if (!id || selectedOrderId !== id) return;
    const t = window.setTimeout(() => {
      orderTrackingSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    return () => window.clearTimeout(t);
  }, [location.hash, location.search, selectedOrderId]);

  // Mark selected order's tracking status as seen when user views it (so badge can clear as they view each)
  useEffect(() => {
    if (!selectedOrderId) return;
    const order = activeOrders.find((o: any) => o.id === selectedOrderId);
    if (!order?.id || !order?.status || !CONCIERGE_TRACKING_STATUSES.includes(order.status)) return;
    try {
      localStorage.setItem(`conciergeOrderSeen_${order.id}_${order.status}`, 'true');
      window.dispatchEvent(new CustomEvent('accountCardAlertsViewed'));
    } catch (_) {}
  }, [selectedOrderId, activeOrders]);

  // On visit: mark all orders with tracking status as seen so the Concierge card badge clears (same as Referrals/Affiliate)
  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const email = userData?.email;
      if (!email) return;
      const userOrdersKey = `userOrders_${email}`;
      const stored = localStorage.getItem(userOrdersKey);
      if (!stored) return;
      const orders = JSON.parse(stored);
      const allOrders = [...(orders.activeOrders || []), ...(orders.pastOrders || [])];
      let anyMarked = false;
      allOrders.forEach((order: any) => {
        if (order?.id && order?.status && CONCIERGE_TRACKING_STATUSES.includes(order.status)) {
          const key = `conciergeOrderSeen_${order.id}_${order.status}`;
          if (!localStorage.getItem(key)) {
            localStorage.setItem(key, 'true');
            anyMarked = true;
          }
        }
      });
      if (anyMarked) window.dispatchEvent(new CustomEvent('accountCardAlertsViewed'));
    } catch (_) {}
  }, []);

  const getOrderTrackingStage = (orderId: string): number => {
    if (!orderId) return 0;
    const order = activeOrders.find((o: any) => o.id === orderId);
    return getOrderTrackingStageFromOrder(order);
  };
  
  const currentTrackingStage = getOrderTrackingStage(selectedOrderId);
  
  // Auto-expand current tracking stage when order is selected or on page refresh (only initial expansion)
  useEffect(() => {
    if (selectedOrderId && currentTrackingStage !== undefined && currentTrackingStage !== null) {
      const selectedOrder = activeOrders.find((o: any) => o.id === selectedOrderId);
      
      if (selectedOrder) {
        const processingTime = selectedOrder.processingTime || '6-8 WEEKS';
        const hasCustomization = !processingTime.includes('4');
        const tShift = Number(selectedOrder.trackingTimelineShiftDays) || 0;
        
        // Get the progress for the current stage
        const currentStageProgress = getStageProgress(currentTrackingStage, selectedOrder.date, hasCustomization, false, tShift);
        
        // Find the next stage index (accounting for filtered stages)
        const trackingStagesArray = [
          'CONFIRMED', 'SOURCING', 'CONSTRUCTING', 'MATERIALS SHIPPED', 
          'ARRIVED AT HUB', 'CLEANSING', 'CUSTOMIZING', 'FINALIZING', 'PACKAGE SHIPPED'
        ];
        
        // Filter out customizing if no customization
        const filteredStages = trackingStagesArray
          .map((stage, originalIndex) => ({ stage, originalIndex }))
          .filter(({ originalIndex }) => {
            if (originalIndex === 6) { // CUSTOMIZING stage
              return hasCustomization;
            }
            return true;
          });
        
        // Find current stage in filtered array
        const currentStageInFiltered = filteredStages.findIndex(s => s.originalIndex === currentTrackingStage);
        
        setExpandedStages(prev => {
          const newSet = new Set(prev);
          
          // Only auto-expand if not already expanded (respect user manual collapses)
          if (!prev.has(currentTrackingStage)) {
            newSet.add(currentTrackingStage);
            
            // If current stage is 100% complete, also expand the next stage (only on initial expansion)
            if (currentStageProgress >= 100 && currentStageInFiltered >= 0 && currentStageInFiltered < filteredStages.length - 1) {
              const nextStageOriginalIndex = filteredStages[currentStageInFiltered + 1].originalIndex;
              newSet.add(nextStageOriginalIndex);
            }
          }
          
          return newSet;
        });
      } else {
        // Fallback: just expand current stage if order not found (only if not already expanded)
        setExpandedStages(prev => {
          const newSet = new Set(prev);
          if (!prev.has(currentTrackingStage)) {
            newSet.add(currentTrackingStage);
          }
          return newSet;
        });
      }
    } else if (!selectedOrderId) {
      // Clear expanded stages when no order is selected
      setExpandedStages(new Set());
    }
  }, [selectedOrderId, currentTrackingStage, activeOrders]);
  
  // Ensure current stage is expanded on initial load/refresh
  useEffect(() => {
    if (selectedOrderId && currentTrackingStage !== undefined && currentTrackingStage !== null && activeOrders.length > 0) {
      setExpandedStages(prev => {
        // Only add if not already expanded (to avoid unnecessary updates)
        if (!prev.has(currentTrackingStage)) {
          const newSet = new Set(prev);
          newSet.add(currentTrackingStage);
          return newSet;
        }
        return prev;
      });
    }
  }, [selectedOrderId, currentTrackingStage, activeOrders.length]);
  
  // Note: Progress calculation uses Date.now() directly, so no need for currentTime state
  
  // Auto-update expansion based on stage progress (only when currentTrackingStage changes, not every second)
  useEffect(() => {
    if (selectedOrderId && currentTrackingStage !== undefined && currentTrackingStage !== null) {
      const selectedOrder = activeOrders.find((o: any) => o.id === selectedOrderId);
      if (selectedOrder) {
        const processingTime = selectedOrder.processingTime || '6-8 WEEKS';
        const hasCustomization = !processingTime.includes('4');
        const tShift = Number(selectedOrder.trackingTimelineShiftDays) || 0;
        
        // Get the progress for the current stage
        const currentStageProgress = getStageProgress(currentTrackingStage, selectedOrder.date, hasCustomization, false, tShift);
        
        // Find the next stage index (accounting for filtered stages)
        const trackingStagesArray = [
          'CONFIRMED', 'SOURCING', 'CONSTRUCTING', 'MATERIALS SHIPPED', 
          'ARRIVED AT HUB', 'CLEANSING', 'CUSTOMIZING', 'FINALIZING', 'PACKAGE SHIPPED'
        ];
        
        // Filter out customizing if no customization
        const filteredStages = trackingStagesArray
          .map((stage, originalIndex) => ({ stage, originalIndex }))
          .filter(({ originalIndex }) => {
            if (originalIndex === 6) { // CUSTOMIZING stage
              return hasCustomization;
            }
            return true;
          });
        
        // Find current stage in filtered array
        const currentStageInFiltered = filteredStages.findIndex(s => s.originalIndex === currentTrackingStage);
        
        // Update expansion: only auto-expand on stage change, respect user manual collapses
        setExpandedStages(prevExpanded => {
          const newSet = new Set(prevExpanded);
          
          // Only auto-expand current stage if it's not already in the set (initial expansion)
          // This allows users to manually collapse stages without them immediately reopening
          if (!prevExpanded.has(currentTrackingStage)) {
            newSet.add(currentTrackingStage);
          }
          
          // Check progress for all stages up to and including current
          // If any stage is 100% complete, ensure the next stage is expanded (but only if not manually collapsed)
          for (let i = 0; i <= currentTrackingStage; i++) {
            // Calculate actual progress for this stage (force calculation)
            const stageProgress = getStageProgress(i, selectedOrder.date, hasCustomization, true, tShift);
            
            const stageInFiltered = filteredStages.findIndex(s => s.originalIndex === i);
            
            // If this stage is 100% complete and there's a next stage, expand the next one
            // But only if it's not already manually collapsed (check if it was in previous set)
            if (stageProgress >= 100 && stageInFiltered >= 0 && stageInFiltered < filteredStages.length - 1) {
              const nextStageOriginalIndex = filteredStages[stageInFiltered + 1].originalIndex;
              // Only auto-expand if it was already expanded or if it's the immediate next stage after current
              if (prevExpanded.has(nextStageOriginalIndex) || i === currentTrackingStage) {
                newSet.add(nextStageOriginalIndex);
              }
            }
          }
          
          // Special case: if current stage is 100% complete, also expand the next stage (only on initial expansion)
          if (currentStageProgress >= 100 && currentStageInFiltered >= 0 && currentStageInFiltered < filteredStages.length - 1) {
            const nextStageOriginalIndex = filteredStages[currentStageInFiltered + 1].originalIndex;
            // Only auto-expand next stage if current stage was just completed (not already in set)
            if (!prevExpanded.has(currentTrackingStage)) {
              newSet.add(nextStageOriginalIndex);
            }
          }
          
          // Don't remove any stages - preserve user-expanded completed stages
          return newSet;
        });
      }
    }
  }, [selectedOrderId, currentTrackingStage, activeOrders]); // Removed currentTime dependency to prevent constant re-expansion
  
  // Helper function to get stage duration in days
  const getStageDuration = (stageIndex: number, hasCustomization: boolean = true, shippingMethod?: string): number => {
    switch (stageIndex) {
      case 0: // ORDER CONFIRMED
        return 0; // Pending
      case 1: // SOURCING + COLLECTING
        return 3; // 3 days
      case 2: // CONSTRUCTING UNIT
        return 28; // 4 weeks (28 days)
      case 3: // SHIPPED TO HUB
        return 5; // 5 days
      case 4: // ARRIVED AT HUB
        return 2; // 2 days
      case 5: // PREPPING
        return 2; // 2 days
      case 6: // CUSTOMIZING
        return hasCustomization ? 10 : 0; // 10 days if customization
      case 7: // FINALIZING
        return 3; // 3 days
      case 8: // PACKAGING
        return 3; // 3 days
      case 9: // ORDER SHIPPED
        // Duration depends on shipping method: domestic vs international, standard vs express
        if (!shippingMethod) {
          return 3; // Default to 3 days if not specified
        }
        
        const shippingLower = shippingMethod.toLowerCase();
        const isDomestic = shippingLower.includes('domestic');
        const isInternational = shippingLower.includes('international');
        const isExpress = shippingLower.includes('express');
        const isStandard = shippingLower.includes('standard');
        
        if (isDomestic) {
          if (isExpress) {
            return 2; // Domestic express: 1-2 days (return 2 for display as range)
          } else if (isStandard) {
            return 5; // Domestic standard: 3-5 days (return 5 for display as range)
          }
        } else if (isInternational) {
          if (isExpress) {
            return 3; // International express: 1-3 days (return 3 for display as range)
          } else if (isStandard) {
            return 10; // International standard: 7-14 days (return 10 for display as range)
          }
        }
        
        // Fallback: check for express/standard without domestic/international prefix
        if (isExpress) {
          return 2; // Default express to 1-2 days
        } else if (isStandard) {
          return 5; // Default standard to 3-5 days
        }
        
        return 3; // Default to 3 days
      default:
        return 0;
    }
  };
  
  // Helper function to calculate progress percentage for any stage
  const getStageProgress = (
    stageIndex: number,
    orderDate: string | undefined,
    hasCustomization: boolean = true,
    forceCalculate: boolean = false,
    timelineShiftDays: number = 0
  ): number => {
    if (!orderDate) {
      return stageIndex < currentTrackingStage ? 100 : 0;
    }
    
    // If not current stage and not forcing calculation, return based on position
    if (!forceCalculate && stageIndex !== currentTrackingStage) {
      return stageIndex < currentTrackingStage ? 100 : 0;
    }
    
    try {
      // Parse order date
      let orderDateObj: Date;
      if (orderDate.includes('-')) {
        const [month, day, year] = orderDate.split('-').map(Number);
        orderDateObj = new Date(year, month - 1, day);
      } else if (orderDate.includes(',')) {
        // Handle format like "Jan 15, 2024"
        orderDateObj = new Date(orderDate);
      } else {
        orderDateObj = new Date(orderDate);
      }
      
      // Validate date
      if (isNaN(orderDateObj.getTime())) {
        return stageIndex < currentTrackingStage ? 100 : 0;
      }
      
      // Normalize order date to midnight for accurate calculation
      orderDateObj.setHours(0, 0, 0, 0);
      if (timelineShiftDays) {
        orderDateObj.setDate(orderDateObj.getDate() + timelineShiftDays);
      }
      
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Normalize to midnight for consistent calculation
      const stageStartDate = getStageStartDate(stageIndex, orderDateObj, hasCustomization);
      const stageEndDate = getStageEndDate(stageIndex, orderDateObj, hasCustomization);
      
      if (now <= stageStartDate) return 0;
      if (now >= stageEndDate) return 100;
      
      const totalDuration = stageEndDate.getTime() - stageStartDate.getTime();
      const elapsed = now.getTime() - stageStartDate.getTime();
      return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    } catch (e) {
      return 0;
    }
  };
  
  // Helper function to get stage start date (matches getStageTimestamp logic)
  const getStageStartDate = (stageIndex: number, orderDate: Date, hasCustomization: boolean): Date => {
    const startDate = new Date(orderDate);
    
    if (stageIndex === 0) {
      // ORDER CONFIRMED - same day
      return new Date(orderDate);
    } else if (stageIndex === 1) {
      // SOURCING + COLLECTING - starts 2 days after order (for payment processing), takes 3 days
      startDate.setDate(startDate.getDate() + 2);
    } else if (stageIndex === 2) {
      // CONSTRUCTING UNIT - starts after sourcing (2 + 5 = 7 days), takes 28 days (4 weeks)
      startDate.setDate(startDate.getDate() + 2 + 5);
    } else if (stageIndex === 3) {
      // SHIPPED TO HUB - starts after construction (2 + 3 + 28 = 33 days), takes 5 days
      startDate.setDate(startDate.getDate() + 2 + 3 + 28);
    } else if (stageIndex === 4) {
      // ARRIVED AT HUB - starts after shipped (35 + 5 = 40 days), takes 2 days
      startDate.setDate(startDate.getDate() + 2 + 5 + 28 + 5);
    } else if (stageIndex === 5) {
      // PREPPING - starts after arrived (40 + 2 = 42 days), takes 2 days
      startDate.setDate(startDate.getDate() + 2 + 3 + 28 + 5 + 2);
    } else if (stageIndex === 6) {
      // CUSTOMIZING - starts after prepping (42 + 2 = 44 days), takes 10 days (if customization)
      if (!hasCustomization) return new Date(orderDate);
      startDate.setDate(startDate.getDate() + 2 + 5 + 28 + 5 + 2 + 2);
    } else if (stageIndex === 7) {
      // FINALIZING - starts after customizing/prepping, takes 3 days
      const baseDays = 2 + 3 + 28 + 5 + 2 + 2; // up to prepping
      if (hasCustomization) {
        startDate.setDate(startDate.getDate() + baseDays + 10); // after customizing
      } else {
        startDate.setDate(startDate.getDate() + baseDays); // after prepping
      }
    } else if (stageIndex === 8) {
      // ORDER SHIPPED - starts after finalizing, takes 3-5 days
      const baseDays = 2 + 3 + 28 + 5 + 2 + 2; // up to prepping
      if (hasCustomization) {
        startDate.setDate(startDate.getDate() + baseDays + 10 + 3); // after finalizing (3 days)
      } else {
        startDate.setDate(startDate.getDate() + baseDays + 3); // after finalizing (3 days)
      }
    }
    
    return startDate;
  };
  
  // Helper function to get stage end date
  const getStageEndDate = (stageIndex: number, orderDate: Date, hasCustomization: boolean): Date => {
    const startDate = getStageStartDate(stageIndex, orderDate, hasCustomization);
    const endDate = new Date(startDate);
    const duration = getStageDuration(stageIndex, hasCustomization);
    
    if (stageIndex === 4) {
      // ARRIVED AT HUB uses business days
      return addBusinessDays(startDate, duration);
    } else {
      endDate.setDate(endDate.getDate() + duration);
    }
    
    return endDate;
  };
  
  // Toggle stage expansion
  const toggleStageExpansion = (stageIndex: number) => {
    setExpandedStages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stageIndex)) {
        newSet.delete(stageIndex);
      } else {
        newSet.add(stageIndex);
      }
      return newSet;
    });
  };
  
  // Helper function to format date as "FEBRUARY 21"
  const formatDate = (date: Date): string => {
    const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    return `${month} ${day}`;
  };
  
  // Helper function to get the current ORDER SHIPPED sub-status
  // Returns: 'PREPARING LABEL' | tracking number string | 'DELIVERED'
  const getOrderShippedSubStatus = (order: any): string => {
    if (!order) return 'PREPARING LABEL';
    
    // If delivered, show "DELIVERED"
    if (order.status === 'DELIVERED' || order.trackingStage === 9) {
      return 'DELIVERED';
    }
    
    // If tracking number exists, show it
    if (order.trackingNumber) {
      return order.trackingNumber;
    }
    
    // Otherwise, show "PREPARING LABEL"
    return 'PREPARING LABEL';
  };
  
  // Helper function to format time as "9:07 PM"
  const formatTime = (date: Date): string => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  };

  // Helper functions to get icon paths for selections
  const getLengthIcon = (length: string): string => {
    if (['16"', '18"', '20"', '22"'].includes(length)) {
      return '/assets/back length-icon.svg';
    } else if (['24"', '26"', '28"', '30"'].includes(length)) {
      return '/assets/b length thumb.png';
    } else {
      return '/assets/thigh length thumb.png';
    }
  };

  const getDensityIcon = (productName: string): string => {
    if (productName === 'BLANCO') {
      return '/assets/density-blanco.png';
    }
    return '/assets/density.png';
  };

  const getTextureIcon = (productName: string): string => {
    if (productName === 'BLANCO') {
      return '/assets/blanco texture.svg';
    }
    return '/assets/Texture-icon.svg';
  };

  const getCapSizeIcon = (): string => {
    return '/assets/cap size-icon.svg';
  };

  const getLaceIcon = (productName: string): string => {
    if (productName === 'BLANCO') {
      return '/assets/lace-blanco.png';
    }
    return '/assets/lace-icon.svg';
  };

  const getHairlineIcon = (hairline: string): string => {
    const hairlineArray = hairline.split(',');
    const correctOrder = ['NATURAL', 'LAGOS', 'PEAK'];
    const sortedSelections = hairlineArray.sort((a, b) => {
      const indexA = correctOrder.indexOf(a);
      const indexB = correctOrder.indexOf(b);
      return indexA - indexB;
    });
    const firstHairline = sortedSelections[0];
    
    switch (firstHairline) {
      case 'NATURAL':
        return '/assets/Natural Hairline-icon.svg';
      case 'LAGOS':
        return '/assets/Lagos Hairline-icon.svg';
      case 'PEAK':
        return '/assets/Peak Hairline-icon.svg';
      default:
        return '/assets/Natural Hairline-icon.svg';
    }
  };

  const getStylingIcon = (styling: string): string => {
    if (!styling || styling === 'NONE') {
      return '/assets/none-icon.svg';
    }
    const stylingArray = styling.split(',');
    const correctOrder = ['BANGS', 'CRIMPS', 'FLAT IRON', 'LAYERS'];
    const sortedSelections = stylingArray.sort((a, b) => {
      const indexA = correctOrder.indexOf(a);
      const indexB = correctOrder.indexOf(b);
      return indexA - indexB;
    });
    const firstStyling = sortedSelections[0];
    
    const hairStylingIconMap: { [key: string]: string } = {
      'BANGS': '/assets/Bangs-icon.svg',
      'CRIMPS': '/assets/Crimps-icon.svg',
      'FLAT IRON': '/assets/Flat iron-icon.svg',
      'LAYERS': '/assets/Layers-icon.svg'
    };
    
    return hairStylingIconMap[firstStyling] || '/assets/none-icon.svg';
  };

  const getAddOnsIcon = (addOns: string[]): string => {
    if (!addOns || addOns.length === 0) {
      return '/assets/none-icon.svg';
    }
    // Addon icon mapping based on the addon sub page
    const addOnIconMap: { [key: string]: string } = {
      'BLEACH': '/assets/Bleach-icon.svg',
      'PLUCK': '/assets/Pluck-icon.svg',
      'BLUNT CUT': '/assets/clip ends-icon.svg'
    };
    
    // Show the first selected addon icon
    const firstAddOn = addOns[0];
    return firstAddOn ? (addOnIconMap[firstAddOn] || '/assets/none-icon.svg') : '/assets/none-icon.svg';
  };

  // Helper functions to get display text for selections
  const getLengthDisplayText = (length: string): string => {
    return length || '24"';
  };

  const getDensityDisplayText = (density: string): string => {
    return density || '200%';
  };

  const getTextureDisplayText = (texture: string): string => {
    return texture || 'SILKY';
  };

  const getCapSizeDisplayText = (capSize: string): string => {
    return capSize || 'M';
  };

  const getLaceDisplayText = (lace: string): string => {
    return lace || '13X6';
  };

  const getHairlineDisplayText = (hairline: string): string => {
    if (!hairline) return 'NATURAL';
    const hairlineArray = hairline.split(',');
    const correctOrder = ['NATURAL', 'LAGOS', 'PEAK'];
    const sortedSelections = hairlineArray.sort((a, b) => {
      const indexA = correctOrder.indexOf(a);
      const indexB = correctOrder.indexOf(b);
      return indexA - indexB;
    });
    return sortedSelections[0];
  };

  const getColorDisplayText = (color: string): string => {
    return color || 'OFF BLACK';
  };

  const getStylingDisplayText = (styling: string): string => {
    if (!styling || styling === 'NONE') return 'NONE';
    const stylingArray = styling.split(',');
    const correctOrder = ['BANGS', 'CRIMPS', 'FLAT IRON', 'LAYERS'];
    const sortedSelections = stylingArray.sort((a, b) => {
      const indexA = correctOrder.indexOf(a);
      const indexB = correctOrder.indexOf(b);
      return indexA - indexB;
    });
    return sortedSelections[0];
  };

  const getAddOnsDisplayText = (addOns: string[]): string => {
    if (!addOns || addOns.length === 0) return 'NONE';
    return addOns[0]; // Show first add-on
  };

  // Helper function to get color hex code
  const getColorCode = (color: string, productName: string): string => {
    const isBlanco = productName === 'BLANCO';
    const selectedColor = color || (isBlanco ? 'PLATINUM' : 'OFF BLACK');
    
    // Color mapping based on the color sub page
    const colorMap: { [key: string]: string } = {
      // Blanco colors
      'GOLDEN': '#FBF08B',
      'PLATINUM': '#F6F3D2',
      'ASH': '#E5E3CB',
      // Noir/other colors
      'JET BLACK': '#000000',
      'OFF BLACK': '#2A2424',
      'ESPRESSO': '#3B1301',
      'CHESTNUT': '#6C2D11',
      'HONEY': '#C58628',
      'AUBURN': '#9C5617',
      'COPPER': '#802F02',
      'GINGER': '#F64F07',
      'SANGRIA': '#7E0A1E',
      'CHERRY': '#D70808',
      'RASPBERRY': '#EF0461',
      'PLUM': '#640E82',
      'COBALT': '#290481',
      'TEAL': '#46EBCA',
      'SLIME': '#03D92A',
      'CITRINE': '#E2E91C'
    };
    
    // Default to PLATINUM for blanco routes, OFF BLACK for others
    return colorMap[selectedColor] || (isBlanco ? '#F6F3D2' : '#2A2424');
  };
  
  // Helper function to add business days to a date
  const addBusinessDays = (date: Date, businessDays: number): Date => {
    const result = new Date(date);
    let added = 0;
    while (added < businessDays) {
      result.setDate(result.getDate() + 1);
      if (result.getDay() !== 0 && result.getDay() !== 6) {
        added++;
      }
    }
    return result;
  };

  // Helper function to get timestamp for a stage based on order date
  const getStageTimestamp = (
    stageIndex: number,
    orderDate: string | undefined,
    hasCustomization: boolean = true,
    timelineShiftDays: number = 0
  ): { date: string; time: string } | null => {
    if (!orderDate) return null;
    
    try {
      // Parse order date (could be MM-DD-YYYY or other formats)
      let orderDateObj: Date;
      if (orderDate.includes('-')) {
        const [month, day, year] = orderDate.split('-').map(Number);
        orderDateObj = new Date(year, month - 1, day);
      } else {
        orderDateObj = new Date(orderDate);
      }
      if (timelineShiftDays) {
        orderDateObj.setDate(orderDateObj.getDate() + timelineShiftDays);
      }
      
      let stageDate = new Date(orderDateObj);
      
      // Calculate cumulative days for each stage based on timeline
      // Stage 0: ORDER CONFIRMED - same day (0 days)
      // Stage 1: SOURCING + COLLECTING - starts 2 days after order (for payment processing), takes 5 days
      // Stage 2: CONSTRUCTING UNIT - starts after sourcing ends (2 + 5 = 7 days)
      // Stage 3: SHIPPED TO USA - 4 weeks (28 days) from constructing
      // Stage 4: ARRIVED AT HUB - 5 business days from shipped
      // Stage 5: PREPPING + WASHING - 2 days from arrived
      // Stage 6: CUSTOMIZING - 2 days from prepping (only if customization)
      // Stage 7: FINALIZING - 10 days from customizing (or 0 if no customization)
      // Stage 8: PACKAGING - 2 days from finalizing
      // Stage 9: ORDER SHIPPED - 3 days from packaging
      
      if (stageIndex === 0) {
        // ORDER CONFIRMED - same day
        stageDate = new Date(orderDateObj);
      } else if (stageIndex === 1) {
        // SOURCING + COLLECTING - starts 2 days after order (for payment processing), takes 3 days
        stageDate = new Date(orderDateObj);
        stageDate.setDate(stageDate.getDate() + 2);
      } else if (stageIndex === 2) {
        // CONSTRUCTING UNIT - starts after sourcing (2 + 3 = 5 days), takes 28 days (4 weeks)
        stageDate = new Date(orderDateObj);
        stageDate.setDate(stageDate.getDate() + 2 + 3);
      } else if (stageIndex === 3) {
        // SHIPPED TO HUB - starts after construction (2 + 5 + 28 = 35 days), takes 5 days
        stageDate = new Date(orderDateObj);
        stageDate.setDate(stageDate.getDate() + 2 + 5 + 28);
      } else if (stageIndex === 4) {
        // ARRIVED AT HUB - starts after shipped (35 + 5 = 40 days), takes 2 days
        stageDate = new Date(orderDateObj);
        stageDate.setDate(stageDate.getDate() + 2 + 3 + 28 + 5);
      } else if (stageIndex === 5) {
        // PREPPING - starts after arrived (40 + 2 = 42 days), takes 2 days
        stageDate = new Date(orderDateObj);
        stageDate.setDate(stageDate.getDate() + 2 + 3 + 28 + 5 + 2);
      } else if (stageIndex === 6) {
        // CUSTOMIZING - starts after prepping (42 + 2 = 44 days), takes 10 days (only if customization)
        if (!hasCustomization) {
          return null; // Skip this stage
        }
        stageDate = new Date(orderDateObj);
        stageDate.setDate(stageDate.getDate() + 2 + 5 + 28 + 5 + 2 + 2);
      } else if (stageIndex === 7) {
        // FINALIZING - starts after customizing/prepping, takes 3 days
        const baseDays = 2 + 3 + 28 + 5 + 2 + 2; // up to prepping
        stageDate = new Date(orderDateObj);
        if (hasCustomization) {
          stageDate.setDate(stageDate.getDate() + baseDays + 10); // after customizing
        } else {
          stageDate.setDate(stageDate.getDate() + baseDays); // after prepping
        }
      } else if (stageIndex === 8) {
        // PACKAGING - starts after finalizing, takes 3 days
        const baseDays = 2 + 3 + 28 + 5 + 2 + 2; // up to prepping
        stageDate = new Date(orderDateObj);
        if (hasCustomization) {
          stageDate.setDate(stageDate.getDate() + baseDays + 10 + 3); // after customizing + finalizing
        } else {
          stageDate.setDate(stageDate.getDate() + baseDays + 3); // after prepping + finalizing
        }
      } else if (stageIndex === 9) {
        // ORDER SHIPPED - starts after packaging, takes 3-5 days (default to 3)
        const baseDays = 3 + 28 + 5 + 2 + 2; // up to prepping
        stageDate = new Date(orderDateObj);
        const shippingDays = 3; // Default, could be 3-5 based on shipping method
        if (hasCustomization) {
          stageDate.setDate(stageDate.getDate() + baseDays + 10 + 2 + 3 + shippingDays); // after packaging + shipping
        } else {
          stageDate.setDate(stageDate.getDate() + baseDays + 2 + 3 + shippingDays); // after packaging + shipping
        }
      }
      
      stageDate.setHours(9 + (stageIndex % 12), 7 + (stageIndex * 3) % 60); // Vary time slightly
      
      return {
        date: formatDate(stageDate),
        time: formatTime(stageDate)
      };
    } catch (e) {
      return null;
    }
  };
  
  const trackingStages = [
    { name: 'CONFIRMED', description: 'PROCESSING YOUR ORDER.' },
    { name: 'SOURCING', description: 'GATHERING RAW MATERIALS.' },
    { name: 'CONSTRUCTING', description: 'WEFTING TRACKS + VENTILATING LACE.' },
    { name: 'MATERIALS SHIPPED', description: 'HEADED TO HUB.' },
    { name: 'ARRIVED AT HUB', description: 'PERFORMING QUALITY CHECK.' },
    { name: 'CLEANSING', description: 'DEEP CONDITIONING THE HAIR.' },
    { name: 'CUSTOMIZING', description: 'COLORING + STYLING YOUR UNIT.' },
    { name: 'FINALIZING', description: 'PREPARING TO SHIP YOUR ORDER.' },
    { name: 'PACKAGE SHIPPED', description: 'YOUR ORDER IS ON THE WAY!' }
  ];

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
      clearAppAuth();
      window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'false' }));
      setShowMobileMenu(false);
      navigate(signInHrefWithReturnTo(location));
    } else {
      navigate(signInHrefWithReturnTo(location));
    }
  };

  const handleSubmitPriorityMessage = () => {
    if (!priorityMessage.trim()) {
      return;
    }
    
    // Save to localStorage for admin dashboard
    try {
      const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const messages = JSON.parse(localStorage.getItem('adminPriorityMessages') || '[]');
      const newMessage = {
        id: Date.now().toString(),
        userId: userData.email || 'unknown',
        userName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Unknown User',
        message: priorityMessage,
        type: 'priority',
        timestamp: new Date().toISOString(),
        status: 'new'
      };
      messages.unshift(newMessage);
      localStorage.setItem('adminPriorityMessages', JSON.stringify(messages));
      
      setPriorityMessage('');
      setSuccessMessage('PRIORITY MESSAGE SUBMITTED SUCCESSFULLY');
      setShowSuccessModal(true);
    } catch (e) {
      console.error('Error saving priority message:', e);
    }
  };

  // Helper function to get gift display name
  const getFreeGiftDisplayName = (giftType: string): string => {
    switch (giftType) {
      case 'melt-band':
        return 'MELT BAND';
      case 'wig-brush':
        return 'WIG BRUSH';
      default:
        return '';
    }
  };
  
  const getBirthdayGiftDisplayName = (giftType: string): string => {
    switch (giftType) {
      case 'points':
        return '200 LOYALTY POINTS';
      case 'gift-card':
        return '$20 GIFT CARD';
      default:
        return '';
    }
  };

  const handleSubmitFreeGift = () => {
    try {
      // Save selection to localStorage (can be empty string to clear)
      if (selectedFreeGift) {
        localStorage.setItem('selectedFreeGift', selectedFreeGift);
        
        // Also save to adminFreeGifts for admin dashboard
      const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const freeGifts = JSON.parse(localStorage.getItem('adminFreeGifts') || '[]');
        const newGift = {
        id: Date.now().toString(),
        userId: userData.email || 'unknown',
        userName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Unknown User',
          giftType: selectedFreeGift,
          type: 'free_gift',
        timestamp: new Date().toISOString(),
        status: 'new'
      };
        freeGifts.unshift(newGift);
        localStorage.setItem('adminFreeGifts', JSON.stringify(freeGifts));
        
        // Show confirmation modal with selection message
        const giftName = getFreeGiftDisplayName(selectedFreeGift);
        setFreeGiftModalMessage(`YOU'LL RECEIVE A ${giftName} WITH YOUR NEXT PURCHASE.`);
        setShowFreeGiftModal(true);
      } else {
        // Clear selection
        localStorage.removeItem('selectedFreeGift');
        
        // Show confirmation modal with deselection message
        setFreeGiftModalMessage("YOU WON'T RECEIVE A FREE GIFT WITH YOUR NEXT PURCHASE.");
        setShowFreeGiftModal(true);
      }
    } catch (e) {
      console.error('Error saving free gift request:', e);
    }
  };
  
  const handleSubmitBirthdayGift = () => {
    try {
      // Save selection to localStorage (can be empty string to clear)
      if (selectedBirthdayGift) {
        localStorage.setItem('selectedBirthdayGift', selectedBirthdayGift);
        
        // Also save to adminBirthdayGifts for admin dashboard
      const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const birthdayGifts = JSON.parse(localStorage.getItem('adminBirthdayGifts') || '[]');
        const newGift = {
        id: Date.now().toString(),
        userId: userData.email || 'unknown',
        userName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Unknown User',
          giftType: selectedBirthdayGift,
          type: 'birthday_gift',
        timestamp: new Date().toISOString(),
        status: 'new'
      };
        birthdayGifts.unshift(newGift);
        localStorage.setItem('adminBirthdayGifts', JSON.stringify(birthdayGifts));
        
        // Lock birthday for this OAuth user from now on (no more edits in settings)
        const email = (userData.email || '').trim().toLowerCase();
        if (email) {
          const updatedUser = { ...userData, birthdayGiftClaimed: true };
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          const registered = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
          const idx = registered.findIndex((u: any) => (u.email || '').trim().toLowerCase() === email);
          if (idx !== -1) {
            registered[idx] = { ...registered[idx], birthdayGiftClaimed: true };
            localStorage.setItem('registeredUsers', JSON.stringify(registered));
          }
        }
        
        // Show confirmation modal with selection message
        const giftName = getBirthdayGiftDisplayName(selectedBirthdayGift);
        // Only add "A" for gift card, not for loyalty points
        const message = selectedBirthdayGift === 'gift-card' 
          ? `YOU'LL RECEIVE A ${giftName} AS YOUR BIRTHDAY GIFT.`
          : `YOU'LL RECEIVE ${giftName} AS YOUR BIRTHDAY GIFT.`;
        setBirthdayGiftModalMessage(message);
        setShowBirthdayGiftModal(true);
      } else {
        // Clear selection
        localStorage.removeItem('selectedBirthdayGift');
        
        // Show confirmation modal with deselection message
        setBirthdayGiftModalMessage("YOU WON'T RECEIVE A FREE GIFT FOR YOUR BIRTHDAY THIS YEAR.");
        setShowBirthdayGiftModal(true);
      }
    } catch (e) {
      console.error('Error saving birthday gift request:', e);
    }
  };

  return (
    <>
      <style>{pulsateStyle}</style>
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
                    style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}
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
                    style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}
                  >
                    CONCIERGE
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
              minHeight: ACCOUNT_MAIN_COLUMN_MIN_HEIGHT
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
              /* CONCIERGE CONTENT */
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {/* Priority Messages Section */}
                <div
                  className="border border-black bg-white/60 backdrop-blur-sm w-full mb-2 transition-all duration-300 ease-out"
                  style={{
                    borderWidth: '1.3px',
                    paddingTop: '20px',
                    paddingLeft: '20px',
                    paddingRight: '20px',
                    paddingBottom: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.6)'
                  }}
                >
                  <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '22px' }}>
                    <h2
                      style={{
                        fontFamily: '"Futura PT Medium"',
                        color: '#EB1C24',
                        fontSize: '12px',
                        fontWeight: '500',
                        margin: '0',
                        textTransform: 'uppercase'
                      }}
                    >
                      PRIORITY MESSAGES
                    </h2>
                    <img
                      src="/assets/priority2.svg"
                      alt="Priority Messages"
                      style={{
                        width: '19.76px',
                        height: '19.76px',
                        objectFit: 'contain',
                        filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%) drop-shadow(0 0 0.15px #EB1C24) drop-shadow(0 0 0.15px #EB1C24) drop-shadow(0 0 0.1px #EB1C24) drop-shadow(0 0 0.2px #EB1C24)'
                      }}
                    />
                  </div>
                  
                  {/* IS THIS ORDER RELATED? Prompt */}
                  <div style={{ marginBottom: '12px' }}>
                  <p
                    style={{
                        fontFamily: '"Futura PT Book"',
                        color: '#000000',
                      fontSize: '10px',
                        margin: '0 0 8px 0',
                        textTransform: 'uppercase'
                      }}
                    >
                      IS THIS ORDER RELATED?
                    </p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={() => setIsOrderRelated('yes')}
                        style={{
                          flex: 1,
                          height: '32px',
                          border: isOrderRelated === 'yes' ? '1.3px solid #EB1C24' : '1.3px solid #000000',
                          backgroundColor: '#FFFFFF',
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: isOrderRelated === 'yes' ? '#EB1C24' : '#000000',
                      textTransform: 'uppercase',
                          cursor: 'pointer',
                          borderRadius: '0'
                        }}
                      >
                        YES
                      </button>
                      <button
                        onClick={() => setIsOrderRelated('no')}
                        style={{
                          flex: 1,
                          height: '32px',
                          border: isOrderRelated === 'no' ? '1.3px solid #EB1C24' : '1.3px solid #000000',
                          backgroundColor: '#FFFFFF',
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: isOrderRelated === 'no' ? '#EB1C24' : '#000000',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          borderRadius: '0'
                        }}
                      >
                        NO
                      </button>
                    </div>
                    
                    {/* Order Selection - Show when YES is selected */}
                    {isOrderRelated === 'yes' && (
                      <div style={{ marginTop: '12px' }}>
                        <select
                          value={relatedOrderId}
                          onChange={(e) => setRelatedOrderId(e.target.value)}
                          style={{
                            width: '100%',
                            height: '36px',
                            padding: '8px',
                            paddingLeft: '12px',
                            border: '1.3px solid #000000',
                            fontFamily: '"Futura PT Book"',
                            fontSize: '11px',
                            backgroundColor: '#FFFFFF',
                            boxSizing: 'border-box',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            borderRadius: '0',
                            appearance: 'none',
                            WebkitAppearance: 'none',
                            MozAppearance: 'none',
                            backgroundImage: 'url("/assets/dropdown.svg")',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 12px center',
                            backgroundSize: '7.2px',
                            paddingRight: '28px'
                          }}
                        >
                          <option value="">SELECT AN ORDER</option>
                          {activeOrders.map((order: any) => (
                            <option key={order.id} value={order.id}>
                              {order.orderNumber.replace('ORDER ', '')}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                  
                  {/* IS THIS URGENT? Prompt */}
                  <div style={{ marginBottom: '20px' }}>
                    <p
                      style={{
                        fontFamily: '"Futura PT Book"',
                        color: '#000000',
                        fontSize: '10px',
                        margin: '0 0 8px 0',
                        textTransform: 'uppercase'
                      }}
                    >
                      IS THIS URGENT?
                    </p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={() => setIsUrgent('yes')}
                        style={{
                          flex: 1,
                          height: '32px',
                          border: isUrgent === 'yes' ? '1.3px solid #EB1C24' : '1.3px solid #000000',
                          backgroundColor: '#FFFFFF',
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: isUrgent === 'yes' ? '#EB1C24' : '#000000',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          borderRadius: '0'
                        }}
                      >
                        YES
                      </button>
                      <button
                        onClick={() => setIsUrgent('no')}
                        style={{
                          flex: 1,
                          height: '32px',
                          border: isUrgent === 'no' ? '1.3px solid #EB1C24' : '1.3px solid #000000',
                          backgroundColor: '#FFFFFF',
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: isUrgent === 'no' ? '#EB1C24' : '#000000',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          borderRadius: '0'
                        }}
                      >
                        NO
                      </button>
                    </div>
                  </div>
                  
                  <textarea
                    value={priorityMessage}
                    onChange={(e) => setPriorityMessage(e.target.value.toUpperCase())}
                    rows={6}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1.3px solid #000000',
                      fontFamily: '"Futura PT Book"',
                      fontSize: '11px',
                      resize: 'vertical',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box',
                      textTransform: 'uppercase',
                      borderRadius: '0'
                    }}
                  />
                </div>
                <div className="px-0 md:px-0" style={{ marginTop: '2px', marginBottom: '20px', transform: 'translateY(-2px)' }}>
                  <button
                    onClick={handleSubmitPriorityMessage}
                    className="border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
                    style={{
                      borderWidth: '1.3px',
                      color: '#EB1C24',
                      fontFamily: '"Futura PT Medium"',
                      backgroundColor: '#FFFFFF'
                    }}
                    type="button"
                  >
                    SUBMIT MESSAGE
                  </button>
                </div>

                {/* Special Offer Section - 6 & 12 month premium only; below Priority Messages, above Order Tracking */}
                {showSlayAndSpecialOffer && specialOffer && specialOffer.expiresAt > Date.now() && (
                  <>
                    <div
                      className="border border-black bg-white/60 backdrop-blur-sm w-full mb-0 transition-all duration-300 ease-out"
                      style={{
                        borderWidth: '1.3px',
                        paddingTop: '20px',
                        paddingLeft: '20px',
                        paddingRight: '20px',
                        paddingBottom: '16px',
                        backgroundColor: 'rgba(255, 255, 255, 0.6)'
                      }}
                    >
                      <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '14px' }}>
                        <h2
                          style={{
                            fontFamily: '"Futura PT Medium"',
                            color: '#EB1C24',
                            fontSize: '12px',
                            fontWeight: '500',
                            margin: '0',
                            textTransform: 'uppercase'
                          }}
                        >
                          SPECIAL OFFER
                        </h2>
                        <img
                          src={specialOfferIconUrl}
                          alt="Special Offer"
                          style={{
                            width: '18.76px',
                            height: '18.76px',
                            objectFit: 'contain'
                          }}
                        />
                      </div>
                      <p style={{ fontFamily: '"Futura PT Book"', color: '#000', fontSize: '10px', margin: '0 0 25px 0', textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.45 }}>
                        CAN NOT BE COMBINED WITH SERVICE VOUCHER OR DISCOUNT CODE. FREE GIFTS MAY STILL BE APPLIED.
                        <br />
                        YOU MAY REDEEM A TOTAL OF <span style={{ color: '#EB1C24' }}>2</span> QTY AMOUNTS FOR EACH CAP SIZE.
                        <br />
                        OFFER IS ONLY VALID WHILE SUPPLIES LAST. TERMS APPLY.
                      </p>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{ width: '72px', height: '72px', flexShrink: 0, border: '1px solid #e5e7eb', overflow: 'hidden', backgroundColor: '#f9fafb' }}>
                          <img src={specialOffer.thumbnailDataUrl || SPECIAL_OFFER_UNITS.find(u => u.id === specialOffer.unitId)?.image || '/assets/natural front.png'} alt={specialOffer.unitName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontFamily: '"Covered By Your Grace"', color: '#000', fontSize: '17px', margin: '0 0 4px 0', textTransform: 'uppercase' }}>{specialOffer.unitName}</p>
                          <p style={{ fontFamily: '"Futura PT Book"', color: '#666', fontSize: '9px', margin: '0 0 2px 0', textTransform: 'uppercase' }}>
                            {specialOffer.options.length} · {specialOffer.options.density} · {specialOffer.options.texture} · {specialOffer.options.lace} · {specialOffer.options.color}
                          </p>
                          <p style={{ margin: '4px 0 0 0', fontSize: '11px' }}>
                            <span style={{ fontFamily: '"Futura PT Book"', color: '#999', textDecoration: 'line-through' }}>{formatSpecialOfferPrice(Number(specialOffer.originalPrice))}</span>
                            <span style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', marginLeft: '8px' }}>{formatSpecialOfferPrice(Number(specialOffer.discountedPrice))}</span>
                            <span style={{ fontFamily: '"Futura PT Book"', color: '#000', fontSize: '10px', marginLeft: '4px' }}>({formatSpecialOfferPrice(40)} OFF)</span>
                          </p>
                        </div>
                      </div>
                      {/* Cap size selection (custom sizes only; single row) — 15px space above */}
                      <div style={{ display: 'flex', gap: '6px', paddingTop: '15px', marginBottom: '12px', flexWrap: 'nowrap' }}>
                        {SPECIAL_OFFER_CAP_SIZES.map((size) => {
                          const isSelected = specialOfferCapSize === size;
                          return (
                            <button
                              key={size}
                              type="button"
                              onClick={() => setSpecialOfferCapSize(size)}
                              style={{
                                flex: 1,
                                minWidth: 0,
                                minHeight: '28px',
                                padding: '6px 4px',
                                border: isSelected ? '1.3px solid #EB1C24' : '1.3px solid #000',
                                backgroundColor: '#fff',
                                fontFamily: isSelected ? '"Futura PT Medium"' : '"Futura PT Book"',
                                fontSize: '10px',
                                color: isSelected ? '#EB1C24' : '#000',
                                textTransform: 'uppercase',
                                cursor: 'pointer'
                              }}
                            >
                              {size}
                            </button>
                          );
                        })}
                      </div>
                      {/* ~60-day period; expires on the 1st of Jan, Mar, May, Jul, Sep, Nov only */}
                      <div style={{ paddingTop: '12px', marginTop: '4px', borderTop: '1px solid #e5e7eb' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                          <p style={{ fontFamily: '"Futura PT Book"', color: '#666', fontSize: '10px', margin: 0, textTransform: 'uppercase' }}>
                            Offer expires on {specialOfferExpiresOnLabel}
                          </p>
                          <p style={{ fontFamily: '"Futura PT Book"', color: '#666', fontSize: '10px', margin: 0, textTransform: 'uppercase' }}>
                            <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"' }}>{specialOfferDaysLeft}</span> days remaining
                          </p>
                        </div>
                        <div style={{ height: '6px', backgroundColor: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${Math.min(100, Math.max(0, specialOfferProgress * 100))}%`,
                              backgroundColor: '#EB1C24',
                              borderRadius: '3px',
                              transition: 'width 0.3s ease'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="px-0 md:px-0" style={{ marginTop: '10px', marginBottom: '20px', transform: 'translateY(-2px)' }}>
                      <button
                        type="button"
                        onClick={handleClaimSpecialOffer}
                        className="border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
                        style={{
                          borderWidth: '1.3px',
                          color: '#EB1C24',
                          fontFamily: '"Futura PT Medium"',
                          backgroundColor: '#FFFFFF'
                        }}
                      >
                        CLAIM OFFER
                      </button>
                    </div>
                  </>
                )}
                {showSlayAndSpecialOffer && (!specialOffer || specialOffer.expiresAt <= Date.now()) && (
                  <div
                    className="border border-black bg-white/60 backdrop-blur-sm w-full mb-2 transition-all duration-300 ease-out"
                    style={{
                      borderWidth: '1.3px',
                      paddingTop: '20px',
                      paddingLeft: '20px',
                      paddingRight: '20px',
                      paddingBottom: '16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.6)'
                    }}
                  >
                    <p style={{ fontFamily: '"Futura PT Book"', color: '#666', fontSize: '10px', margin: 0, textTransform: 'uppercase', lineHeight: 1.5 }}>
                      THERE ARE NO OFFERS AVAILABLE AT THIS TIME.
                      <br />
                      CHECK BACK SOON!
                    </p>
                  </div>
                )}

                {/* Order Tracking Section */}
                <div
                  ref={orderTrackingSectionRef}
                  id="order-tracking"
                  className="border border-black bg-white/60 backdrop-blur-sm w-full mb-2 transition-all duration-300 ease-out"
                  style={{
                    borderWidth: '1.3px',
                    paddingTop: '20px',
                    paddingLeft: '20px',
                    paddingRight: '20px',
                    paddingBottom: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.6)'
                  }}
                >
                  <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '12px' }}>
                    <h2
                      style={{
                        fontFamily: '"Futura PT Medium"',
                        color: '#EB1C24',
                        fontSize: '12px',
                        fontWeight: '500',
                        margin: '0',
                        textTransform: 'uppercase'
                      }}
                    >
                      ORDER TRACKING
                    </h2>
                    <img
                      src="/assets/order-tracking.svg"
                      alt="Order Tracking"
                      style={{
                        width: '22.4px',
                        height: '22.4px',
                        objectFit: 'contain',
                        filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%) drop-shadow(0 0 0.15px #EB1C24) drop-shadow(0 0 0.15px #EB1C24)'
                      }}
                    />
                  </div>
                  {(activeOrders.length > 0) ? (
                    <>
                      <select
                        value={selectedOrderId}
                        onChange={(e) => setSelectedOrderId(e.target.value)}
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '8px',
                          paddingLeft: '12px',
                          border: '1.3px solid #000000',
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                          backgroundColor: '#FFFFFF',
                          boxSizing: 'border-box',
                          marginTop: '10px',
                          marginBottom: selectedOrderId ? '16px' : '10px',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          borderRadius: '0',
                          appearance: 'none',
                          WebkitAppearance: 'none',
                          MozAppearance: 'none',
                          backgroundImage: 'url("/assets/dropdown.svg")',
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 12px center',
                          backgroundSize: '7.2px',
                          paddingRight: '28px'
                        }}
                      >
                        <option value="">SELECT AN ORDER</option>
                        {activeOrders.map((order: any) => (
                          <option key={order.id} value={order.id}>
                            {order.orderNumber.replace('ORDER ', '')}
                          </option>
                        ))}
                      </select>
                      
                      {/* Tracking Stages - Show when order is selected */}
                      {selectedOrderId && (
                        <div style={{ marginTop: '16px' }}>
                          {/* Order Number or Delivery Estimate Display */}
                          {currentTrackingStage === 9 ? (
                            // Show delivery estimate when status is "shipped" or "PACKAGE DELIVERED" for delivered orders
                            (() => {
                              const selectedOrder = activeOrders.find((o: any) => o.id === selectedOrderId);
                              const isDelivered = selectedOrder?.status === 'DELIVERED';
                              
                              // If delivered, show "PACKAGE DELIVERED" with date, time, and location
                              if (isDelivered) {
                                // Format delivery date to get weekday, month, and day
                                const formatDeliveryDate = (dateStr: string | undefined) => {
                                  if (!dateStr) return null;
                                  try {
                                    const date = new Date(dateStr);
                                    // Check if date is valid
                                    if (isNaN(date.getTime())) {
                                      return null;
                                    }
                                    const weekdays = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
                                    const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
                                    return {
                                      weekday: weekdays[date.getDay()],
                                      month: months[date.getMonth()],
                                      day: date.getDate()
                                    };
                                  } catch (e) {
                                    return null;
                                  }
                                };
                                
                                const formatDeliveryTime = (timeStr: string | undefined) => {
                                  if (!timeStr) return null;
                                  // Format time with space between time and AM/PM (e.g., "9:07 AM")
                                  return timeStr.replace(/(\d+:\d+)\s*(AM|PM)/i, '$1 $2').toUpperCase();
                                };
                                
                                // Use deliveryDate if available, otherwise use order date as fallback
                                const dateToFormat = selectedOrder?.deliveryDate || selectedOrder?.date;
                                const deliveryDateInfo = formatDeliveryDate(dateToFormat);
                                const deliveryTimeFormatted = formatDeliveryTime(selectedOrder?.deliveryTime);
                                
                                // Format delivery location with signature information
                                const formatDeliveryLocation = () => {
                                  const location = selectedOrder?.deliveryLocation;
                                  const requiresSignature = selectedOrder?.requiresSignature;
                                  
                                  if (!location) {
                                    // Fallback to tracking number if available
                                    if (selectedOrder?.trackingNumber) {
                                      return `NO SIGNATURE: ${selectedOrder.trackingNumber}`;
                                    }
                                    return 'LOCATION UNAVAILABLE';
                                  }
                                  
                                  const signatureText = requiresSignature === true ? 'SIGNATURE' : 'NO SIGNATURE';
                                  return `${signatureText}: ${location.toUpperCase()}`;
                                };
                                
                                const deliveryLocation = formatDeliveryLocation();
                                
                                return (
                                  <div style={{ textAlign: 'center', marginBottom: '16px', marginTop: '-10px' }}>
                                    <p
                                      style={{
                                        fontFamily: '"Futura PT Demi", Futura, Inter, sans-serif',
                                        color: '#808080',
                                        fontSize: '12px',
                                        margin: '0 0 2px 0',
                                        textTransform: 'uppercase'
                                      }}
                                    >
                                      PACKAGE DELIVERED
                                    </p>
                                    {deliveryDateInfo && (
                                      <>
                                        <p
                                          style={{
                                            fontFamily: '"Futura PT Medium"',
                                            color: '#000000',
                                            fontSize: '12px',
                                            margin: '0 0 0 0',
                                            textTransform: 'uppercase'
                                          }}
                                        >
                                          {deliveryDateInfo.month}
                                        </p>
                                        <p
                                          style={{
                                            fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                      color: '#EB1C24',
                                            fontSize: '20px',
                                            margin: '-2px 0 4px 0',
                                            textTransform: 'none'
                                          }}
                                        >
                                          {deliveryDateInfo.day}
                                        </p>
                                      </>
                                    )}
                                    {deliveryTimeFormatted && (
                                      <p
                                        style={{
                                          fontFamily: '"Futura PT Medium"',
                                          color: '#000000',
                                          fontSize: '11px',
                                          margin: '-2px 0 4px 0',
                                          textTransform: 'uppercase'
                                        }}
                                      >
                                        {deliveryTimeFormatted}
                                      </p>
                                    )}
                                    <p
                                      style={{
                                        fontFamily: '"Futura PT Medium"',
                                        color: '#EB1C24',
                                        fontSize: '10px',
                                        margin: '0',
                                        textTransform: 'uppercase'
                                      }}
                                    >
                                      {deliveryLocation}
                                    </p>
                                  </div>
                                );
                              }
                              
                              // Calculate delivery date based on order date and processing time
                              const calculateDeliveryDate = () => {
                                if (!selectedOrder?.date) {
                                  // Fallback: 5-7 business days from now
                                  const today = new Date();
                                  let deliveryDate = new Date(today);
                                  deliveryDate.setDate(today.getDate() + 5);
                                  while (deliveryDate.getDay() === 0 || deliveryDate.getDay() === 6) {
                                    deliveryDate.setDate(deliveryDate.getDate() + 1);
                                  }
                                  return deliveryDate;
                                }
                                
                                try {
                                  // Parse order date
                                  let orderDate: Date;
                                  if (selectedOrder.date.includes('-')) {
                                    const [month, day, year] = selectedOrder.date.split('-').map(Number);
                                    orderDate = new Date(year, month - 1, day);
                                  } else {
                                    orderDate = new Date(selectedOrder.date);
                                  }
                                  
                                  // Determine weeks based on processing time
                                  // Base timeline: 8 weeks with customization, 6 weeks without
                                  const processingTime = selectedOrder.processingTime || '6-8 WEEKS';
                                  let maxWeeks = 8; // Default: with customization
                                  
                                  if (processingTime.includes('4')) {
                                    // Rush processing: 4-6 weeks (no customization)
                                    maxWeeks = 6;
                                  } else if (processingTime.includes('10')) {
                                    // Customized units: up to 10 weeks
                                    maxWeeks = 10;
                                  } else {
                                    // Default 6-8 weeks: assume customization (8 weeks)
                                    maxWeeks = 8;
                                  }
                                  
                                  // Calculate max delivery date
                                  const deliveryDate = new Date(orderDate);
                                  deliveryDate.setDate(deliveryDate.getDate() + (maxWeeks * 7));
                                  
                                  // Ensure it's a weekday
                                  while (deliveryDate.getDay() === 0 || deliveryDate.getDay() === 6) {
                                    deliveryDate.setDate(deliveryDate.getDate() + 1);
                                  }
                                  
                                  return deliveryDate;
                                } catch (e) {
                                  // Fallback
                                  const today = new Date();
                                  let deliveryDate = new Date(today);
                                  deliveryDate.setDate(today.getDate() + 5);
                                  while (deliveryDate.getDay() === 0 || deliveryDate.getDay() === 6) {
                                    deliveryDate.setDate(deliveryDate.getDate() + 1);
                                  }
                                  return deliveryDate;
                                }
                              };
                              
                              const deliveryDate = calculateDeliveryDate();
                              const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
                              
                              const month = months[deliveryDate.getMonth()];
                              const day = deliveryDate.getDate();
                              
                              return (
                                <div style={{ textAlign: 'center', marginBottom: '16px', marginTop: '-10px' }}>
                                  <p
                                    style={{
                                      fontFamily: '"Futura PT Demi", Futura, Inter, sans-serif',
                                      color: '#808080',
                                      fontSize: '12px',
                                      margin: '0 0 2px 0',
                                      textTransform: 'uppercase'
                                    }}
                                  >
                                    DELIVERY ESTIMATE
                                  </p>
                                  <p
                    style={{
                                      fontFamily: '"Futura PT Medium"',
                                      color: '#000000',
                                      fontSize: '12px',
                                      margin: '0 0 0 0',
                                      textTransform: 'uppercase'
                                    }}
                                  >
                                    {month}
                                  </p>
                                  <p
                                    style={{
                      fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                                      color: '#EB1C24',
                                      fontSize: '22px',
                                      margin: '-2px 0 0 0',
                      textTransform: 'none'
                    }}
                                  >
                                    {day}
                                  </p>
                                </div>
                              );
                            })()
                          ) : (
                            // Show "ESTIMATED DELIVERY" with date or "DELIVERED" for delivered orders
                            (() => {
                              const selectedOrder = activeOrders.find((o: any) => o.id === selectedOrderId);
                              const isDelivered = selectedOrder?.status === 'DELIVERED';
                              
                              if (isDelivered) {
                                // Format delivery date to get weekday, month, and day
                                const formatDeliveryDate = (dateStr: string | undefined) => {
                                  if (!dateStr) return null;
                                  try {
                                    const date = new Date(dateStr);
                                    // Check if date is valid
                                    if (isNaN(date.getTime())) {
                                      return null;
                                    }
                                    const weekdays = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
                                    const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
                                    return {
                                      weekday: weekdays[date.getDay()],
                                      month: months[date.getMonth()],
                                      day: date.getDate()
                                    };
                                  } catch (e) {
                                    return null;
                                  }
                                };
                                
                                const formatDeliveryTime = (timeStr: string | undefined) => {
                                  if (!timeStr) return null;
                                  // Format time with space between time and AM/PM (e.g., "9:07 AM")
                                  return timeStr.replace(/(\d+:\d+)\s*(AM|PM)/i, '$1 $2').toUpperCase();
                                };
                                
                                // Use deliveryDate if available, otherwise use order date as fallback
                                const dateToFormat = selectedOrder?.deliveryDate || selectedOrder?.date;
                                const deliveryDateInfo = formatDeliveryDate(dateToFormat);
                                const deliveryTimeFormatted = formatDeliveryTime(selectedOrder?.deliveryTime);
                                
                                // Format delivery location with signature information
                                const formatDeliveryLocation = () => {
                                  const location = selectedOrder?.deliveryLocation;
                                  const requiresSignature = selectedOrder?.requiresSignature;
                                  
                                  if (!location) {
                                    // Fallback to tracking number if available
                                    if (selectedOrder?.trackingNumber) {
                                      return `NO SIGNATURE: ${selectedOrder.trackingNumber}`;
                                    }
                                    return 'LOCATION UNAVAILABLE';
                                  }
                                  
                                  const signatureText = requiresSignature === true ? 'SIGNATURE' : 'NO SIGNATURE';
                                  return `${signatureText}: ${location.toUpperCase()}`;
                                };
                                
                                const deliveryLocation = formatDeliveryLocation();
                                
                                return (
                                  <div style={{ marginBottom: '16px', marginTop: '-10px', textAlign: 'center' }}>
                                    <p
                    style={{
                                        fontFamily: '"Futura PT Demi", Futura, Inter, sans-serif',
                                        color: '#808080',
                                        fontSize: '12px',
                                        margin: '0 0 2px 0',
                                        textTransform: 'uppercase'
                                      }}
                                    >
                                      PACKAGE DELIVERED
                                    </p>
                                    {deliveryDateInfo && (
                                      <>
                                        <p
                    style={{
                                            fontFamily: '"Futura PT Medium"',
                                            color: '#000000',
                                            fontSize: '12px',
                                            margin: '0 0 0 0',
                                            textTransform: 'uppercase'
                                          }}
                                        >
                                          {deliveryDateInfo.month}
                                        </p>
                                        <p
                                          style={{
                      fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                                            color: '#EB1C24',
                                            fontSize: '20px',
                                            margin: '-2px 0 4px 0',
                                            textTransform: 'none'
                                          }}
                                        >
                                          {deliveryDateInfo.day}
                                        </p>
                                      </>
                                    )}
                                    {deliveryTimeFormatted && (
                                      <p
                                        style={{
                                          fontFamily: '"Futura PT Medium"',
                                          color: '#000000',
                      fontSize: '11px',
                                          margin: '-2px 0 4px 0',
                      textTransform: 'uppercase'
                                        }}
                                      >
                                        {deliveryTimeFormatted}
                                      </p>
                                    )}
                                    <p
                                      style={{
                                        fontFamily: '"Futura PT Medium"',
                                        color: '#EB1C24',
                                        fontSize: '10px',
                                        margin: '0',
                                        textTransform: 'uppercase'
                                      }}
                                    >
                                      {deliveryLocation}
                                    </p>
                                  </div>
                                );
                              }
                              
                              // Calculate estimated delivery date based on order date and processing time
                              const calculateEstimatedDelivery = () => {
                                if (!selectedOrder?.date) return null;
                                
                                try {
                                  // Parse order date (could be MM-DD-YYYY or other formats)
                                  let orderDate: Date;
                                  if (selectedOrder.date.includes('-')) {
                                    const [month, day, year] = selectedOrder.date.split('-').map(Number);
                                    orderDate = new Date(year, month - 1, day);
                                  } else {
                                    orderDate = new Date(selectedOrder.date);
                                  }
                                  
                                  // Determine weeks based on processing time
                                  // Base timeline: 8 weeks with customization, 6 weeks without
                                  const processingTime = selectedOrder.processingTime || '6-8 WEEKS';
                                  let maxWeeks = 8; // Default: with customization
                                  
                                  if (processingTime.includes('4')) {
                                    // Rush processing: 4-6 weeks (no customization)
                                    maxWeeks = 6;
                                  } else if (processingTime.includes('10')) {
                                    // Customized units: up to 10 weeks
                                    maxWeeks = 10;
                                  } else {
                                    // Default 6-8 weeks: assume customization (8 weeks)
                                    maxWeeks = 8;
                                  }
                                  
                                  // Calculate max delivery date
                                  const deliveryDate = new Date(orderDate);
                                  deliveryDate.setDate(deliveryDate.getDate() + (maxWeeks * 7));
                                  
                                  // Ensure it's a weekday (Monday-Friday)
                                  while (deliveryDate.getDay() === 0 || deliveryDate.getDay() === 6) {
                                    deliveryDate.setDate(deliveryDate.getDate() + 1);
                                  }
                                  
                                  const weekdays = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
                                  const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
                                  
                                  return {
                                    weekday: weekdays[deliveryDate.getDay()],
                                    month: months[deliveryDate.getMonth()],
                                    day: deliveryDate.getDate()
                                  };
                                } catch (e) {
                                  return null;
                                }
                              };
                              
                              const deliveryInfo = calculateEstimatedDelivery();
                              
                              return (
                                <div style={{ marginBottom: '16px', marginTop: '-10px', textAlign: 'center' }}>
                                  <p
                    style={{
                                      fontFamily: '"Futura PT Demi", Futura, Inter, sans-serif',
                                      color: '#808080',
                                      fontSize: '12px',
                                      margin: '0 0 2px 0',
                                      textTransform: 'uppercase'
                                    }}
                                  >
                                    DELIVERY ESTIMATE
                                  </p>
                                  {deliveryInfo && (
                                    <>
                                      <p
                                        style={{
                                          fontFamily: '"Futura PT Medium"',
                                          color: '#000000',
                                          fontSize: '12px',
                                          margin: '0 0 0 0',
                                          textTransform: 'uppercase'
                                        }}
                                      >
                                        {deliveryInfo.month}
                                      </p>
                                      <p
                                        style={{
                                          fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                                          color: '#EB1C24',
                                          fontSize: '22px',
                                          margin: '-2px 0 0 0',
                                          textTransform: 'none'
                                        }}
                                      >
                                        {deliveryInfo.day}
                                      </p>
                                    </>
                                  )}
                                </div>
                              );
                            })()
                          )}
                          
                          {/* Tracking Stages */}
                          <div style={{ position: 'relative', paddingLeft: '12px' }}>
                            {(() => {
                              const selectedOrder = activeOrders.find((o: any) => o.id === selectedOrderId);
                              const tShift = Number(selectedOrder?.trackingTimelineShiftDays) || 0;
                              const processingTime = selectedOrder?.processingTime || '6-8 WEEKS';
                              const hasCustomization = !processingTime.includes('4'); // Rush (4-6 weeks) = no customization
                              
                              // Filter out customizing stage (index 6) if no customization
                              const filteredStages = trackingStages.map((stage, originalIndex) => ({ stage, originalIndex }))
                                .filter(({ originalIndex }) => {
                                  if (originalIndex === 6) { // CUSTOMIZING stage
                                    return hasCustomization;
                                  }
                                  return true;
                                });
                              
                              // Adjust currentTrackingStage to account for filtered stages
                              let adjustedCurrentStage = currentTrackingStage;
                              if (!hasCustomization && currentTrackingStage > 6) {
                                adjustedCurrentStage = currentTrackingStage - 1;
                              } else if (!hasCustomization && currentTrackingStage === 6) {
                                adjustedCurrentStage = 5; // Move to prepping stage
                              }
                              
                              return filteredStages.map(({ stage, originalIndex: index }) => {
                                // Adjust stage indices for display
                                const displayIndex = filteredStages.findIndex(s => s.originalIndex === index);
                                
                                const isCurrent = displayIndex === adjustedCurrentStage;
                                
                                // Check if order is canceled or awaiting signature
                                // An order is considered canceled if:
                                // 1. Status is explicitly 'CANCELED', OR
                                // 2. Status is 'PLACED' with form not signed AND past 24 hours
                                let isCanceled = selectedOrder?.status === 'CANCELED';
                                if (!isCanceled && selectedOrder?.status === 'PLACED' && !selectedOrder?.orderFormSigned) {
                                  // Check if 24 hours have passed since order was placed
                                  const placedAt = selectedOrder?.placedAt;
                                  if (placedAt) {
                                    const timeSincePlaced = Date.now() - placedAt;
                                    const hoursSincePlaced = timeSincePlaced / (1000 * 60 * 60);
                                    isCanceled = hoursSincePlaced > 24;
                                  } else if (selectedOrder?.date) {
                                    // Fallback: use order date if placedAt not available
                                    try {
                                      const orderDate = selectedOrder.date;
                                      let orderDateObj: Date;
                                      if (orderDate.includes('-')) {
                                        const [month, day, year] = orderDate.split('-').map(Number);
                                        orderDateObj = new Date(year, month - 1, day);
                                      } else {
                                        orderDateObj = new Date(orderDate);
                                      }
                                      const timeSincePlaced = Date.now() - orderDateObj.getTime();
                                      const hoursSincePlaced = timeSincePlaced / (1000 * 60 * 60);
                                      isCanceled = hoursSincePlaced > 24;
                                    } catch (e) {
                                      isCanceled = false;
                                    }
                                  }
                                }
                                const isAwaitingSignature = selectedOrder?.status === 'PLACED' && !selectedOrder?.orderFormSigned && !isCanceled;
                                
                                // Check if this is the last stage and order is delivered
                                const isLastStage = index === 8; // ORDER SHIPPED is the last stage
                                const isDelivered = selectedOrder?.status === 'DELIVERED';
                                const isDeliveredLastStage = isLastStage && isDelivered;
                                
                                // Get stage duration and progress FIRST
                                const shippingMethod = selectedOrder?.shippingMethod || '';
                                const stageDuration = getStageDuration(index, hasCustomization, shippingMethod);
                                // CANCELED orders should not show progress - freeze at 0% or current progress
                                let progress = isDeliveredLastStage ? 100 : 
                                  (isCanceled ? 0 : getStageProgress(index, selectedOrder?.date, hasCustomization, true, tShift));
                                
                                // Check if previous stage is complete (100% progress) - needed for upcoming stage logic
                                let previousStageComplete = false;
                                if (displayIndex > 0) {
                                  const previousStageIndex = filteredStages[displayIndex - 1].originalIndex;
                                  const previousStageProgress = getStageProgress(previousStageIndex, selectedOrder?.date, hasCustomization, true, tShift);
                                  previousStageComplete = previousStageProgress >= 100;
                                }
                                
                                // Upcoming stages should ONLY show if:
                                // 1. Not canceled
                                // 2. Not awaiting signature
                                // 3. Previous stage is complete (100%)
                                const isUpcoming = displayIndex > adjustedCurrentStage && 
                                  !isCanceled && 
                                  !isAwaitingSignature && 
                                  (displayIndex === 0 || previousStageComplete);
                                
                                // Don't render upcoming stages if they shouldn't be shown
                                if (displayIndex > adjustedCurrentStage && (!previousStageComplete || isCanceled || isAwaitingSignature) && displayIndex > 0) {
                                  return null;
                                }
                                
                                const isExpanded = expandedStages.has(index);
                                
                                // Determine if stage is completed:
                                // 1. If it's before the current stage (already passed)
                                // 2. If progress is 100% AND it's not the current stage
                                // 3. Special case: confirmed stage (index 0) is completed if form is signed
                                // 4. CRITICAL: If order is CANCELED, all stages should show red checkmark (completed)
                                // IMPORTANT: Current stage should NEVER be marked as completed (it should show beeping dot)
                                // EXCEPTION: Cancelled orders should show red checkmark on all stages
                                let isCompleted = false;
                                
                                // CRITICAL: If order is cancelled, mark all stages as completed to show red checkmark
                                if (isCanceled) {
                                  isCompleted = true;
                                } else if (!isCurrent) {
                                  // NEVER mark current stage as completed - it should always show beeping dot
                                  // (unless order is cancelled, handled above)
                                  
                                  // Check if stage is before current stage
                                  if (displayIndex < adjustedCurrentStage) {
                                    isCompleted = true;
                                  }
                                  
                                  // Special case: confirmed stage (index 0) is completed if form is signed
                                  if (index === 0 && selectedOrder?.orderFormSigned === true) {
                                    isCompleted = true;
                                  }
                                  
                                  // CRITICAL: If progress is 100% and NOT current, mark as completed
                                  // This ensures 100% complete stages show checkmark, not beeping dot
                                  if (progress >= 100) {
                                    isCompleted = true;
                                  }
                                }
                                
                                // Format duration text with ranges for package shipped stage
                                let durationText = '';
                                if (index === 0) {
                                  // Confirmed stage: show duration based on form signature status
                                  const isFormSigned = selectedOrder?.orderFormSigned === true;
                                  const orderDate = selectedOrder?.date;
                                  const placedAt = selectedOrder?.placedAt;
                                  
                                  // Check if 24 hours have passed since order was placed
                                  let isPastTimeLimit = false;
                                  if (placedAt) {
                                    const timeSincePlaced = Date.now() - placedAt;
                                    const hoursSincePlaced = timeSincePlaced / (1000 * 60 * 60);
                                    isPastTimeLimit = hoursSincePlaced > 24;
                                  } else if (orderDate) {
                                    // Fallback: use order date if placedAt not available
                                    try {
                                      let orderDateObj: Date;
                                      if (orderDate.includes('-')) {
                                        const [month, day, year] = orderDate.split('-').map(Number);
                                        orderDateObj = new Date(year, month - 1, day);
                                      } else {
                                        orderDateObj = new Date(orderDate);
                                      }
                                      const timeSincePlaced = Date.now() - orderDateObj.getTime();
                                      const hoursSincePlaced = timeSincePlaced / (1000 * 60 * 60);
                                      isPastTimeLimit = hoursSincePlaced > 24;
                                    } catch (e) {
                                      // If date parsing fails, assume not past limit
                                      isPastTimeLimit = false;
                                    }
                                  }
                                  
                                  // Special handling for confirmed stage progress - awaiting signature should be 50%
                                  if (!isFormSigned && !isPastTimeLimit) {
                                    progress = 50; // Awaiting signature: show 50% progress
                                  }
                                  
                                  if (isFormSigned) {
                                    durationText = '2 DAYS';
                                  } else if (isPastTimeLimit) {
                                    durationText = 'INCOMPLETE';
                                  } else {
                                    durationText = 'PENDING';
                                  }
                                } else if (index === 6) { // CUSTOMIZING stage
                                  // Check if there are any customizing options selected
                                  const orderProductName = selectedOrder?.productName || 'NOIR';
                                  const hasMultipleUnits = selectedOrder?.units && Array.isArray(selectedOrder.units) && selectedOrder.units.length > 1;
                                  let hasCustomizingOptions = false;
                                  
                                  // Helper to check if color is non-default
                                  const isNonDefaultColor = (color: string, prodName: string) => {
                                    const defaultColor = prodName === 'BLANCO' ? 'PLATINUM' : 'OFF BLACK';
                                    return color && color !== defaultColor;
                                  };
                                  
                                  if (hasMultipleUnits) {
                                    // Check if any unit has customizing options
                                    hasCustomizingOptions = selectedOrder.units.some((unit: any) => {
                                      const hasColor = unit.color && isNonDefaultColor(unit.color, orderProductName);
                                      const hasStyling = unit.styling && unit.styling !== 'NONE';
                                      const hasAddOns = unit.addOns && Array.isArray(unit.addOns) && unit.addOns.length > 0;
                                      return hasColor || hasStyling || hasAddOns;
                                    });
                                  } else {
                                    // Single unit - check for customizing options
                                    const hasColor = selectedOrder?.color && isNonDefaultColor(selectedOrder.color, orderProductName);
                                    const hasStyling = selectedOrder?.styling && selectedOrder.styling !== 'NONE';
                                    const hasAddOns = selectedOrder?.addOns && Array.isArray(selectedOrder.addOns) && selectedOrder.addOns.length > 0;
                                    hasCustomizingOptions = hasColor || hasStyling || hasAddOns;
                                  }
                                  
                                  // Show N/A if no customizing options, otherwise show duration
                                  if (!hasCustomizingOptions) {
                                    durationText = 'N/A';
                                  } else {
                                    durationText = stageDuration === 0 ? 'SAME DAY' : stageDuration === 1 ? '1 DAY' : stageDuration === 28 ? '4 WEEKS' : `${stageDuration} DAYS`;
                                  }
                                } else if (index === 8) { // PACKAGE SHIPPED stage
                                  const shippingLower = shippingMethod.toLowerCase();
                                  const isDomestic = shippingLower.includes('domestic');
                                  const isInternational = shippingLower.includes('international');
                                  const isExpress = shippingLower.includes('express');
                                  const isStandard = shippingLower.includes('standard');
                                  
                                  if (isDomestic && isExpress) {
                                    durationText = '2 DAYS';
                                  } else if (isDomestic && isStandard) {
                                    durationText = '5 DAYS';
                                  } else if (isInternational && isExpress) {
                                    durationText = '3 DAYS';
                                  } else if (isInternational && isStandard) {
                                    durationText = '2 WEEKS';
                                  } else if (isExpress) {
                                    // Express shipping without domestic/international specified
                                    durationText = '2 DAYS';
                                  } else {
                                    // Default to standard shipping when shipping method not specified or not recognized
                                    durationText = '5 DAYS';
                                  }
                                } else {
                                  durationText = stageDuration === 0 ? 'SAME DAY' : stageDuration === 1 ? '1 DAY' : stageDuration === 28 ? '4 WEEKS' : `${stageDuration} DAYS`;
                                }
                                
                                // previousStageComplete is already calculated above, reuse it here
                                
                                // Allow expansion for completed, current, or next stage when previous is 100% complete
                                const isExpandable = isCompleted || isCurrent || isDeliveredLastStage || previousStageComplete;

                              return (
                                <div key={index} style={{ position: 'relative', marginBottom: displayIndex < filteredStages.length - 1 ? '0' : '0' }}>
                                  {/* Connector Line (before each stage except first) */}
                                  {displayIndex > 0 && (
                                    <div
                                      style={{
                                        position: 'absolute',
                                        left: '12px',
                                        top: '-21px',
                                        width: '2px',
                                        height: '20px',
                                        backgroundColor: (isCompleted || index === 8) ? '#EB1C24' : '#E0E0E0',
                                        zIndex: 0
                                      }}
                                    />
                                  )}

                                  <div
                    style={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: '0',
                                      border: (isCurrent || isDeliveredLastStage) ? '1.3px solid #EB1C24' : '1.3px solid #000000',
                                      backgroundColor: 'transparent',
                                      marginTop: displayIndex > 0 ? '12px' : '0',
                                      marginBottom: '20px',
                                      position: 'relative',
                                      zIndex: 1,
                                      cursor: isExpandable ? 'pointer' : 'default'
                                    }}
                                    onClick={() => {
                                      if (isExpandable) {
                                        toggleStageExpansion(index);
                                      }
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px' }}>
                                    {/* Stage Indicator */}
                                    <div
                                      style={{
                                        width: '21.6px',
                                        height: '21.6px',
                                        borderRadius: '50%',
                                        backgroundColor: isCompleted || isCurrent || isDeliveredLastStage
                                          ? '#FFFFFF'
                                          : '#E0E0E0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        border: (isCompleted || isCurrent || isDeliveredLastStage) ? '1px solid #000000' : 'none'
                                      }}
                                    >
                                      {(isCompleted || isDeliveredLastStage) ? (
                                        <img
                                          src="/assets/premium-check.svg"
                                          alt="Completed"
                                          style={{ width: '10.5px', height: '10.5px' }}
                                        />
                                      ) : (isCurrent && !isCompleted && !isCanceled) ? (
                                        <span 
                                          style={{ 
                                            color: '#EB1C24', 
                                            fontSize: '10px', 
                                            fontWeight: 'bold',
                                            ...(ordersAnimationsEnabled ? { animation: 'pulsate 1s ease-in-out infinite' } : {}),
                                            display: 'block',
                                            width: '6px',
                                            height: '6px',
                                            borderRadius: '50%',
                                            backgroundColor: '#EB1C24'
                                          }}
                                        />
                                      ) : null}
                </div>

                                    {/* Stage Label */}
                                    <div style={{ flex: 1 }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <p
                                          style={{
                                            fontFamily: isCurrent ? '"Futura PT Medium"' : '"Futura PT Book"',
                                            color: isCompleted ? '#000000' : (isCurrent ? '#EB1C24' : '#808080'),
                      fontSize: '10px',
                                            margin: '0',
                                            textTransform: 'uppercase',
                                            fontWeight: isCurrent ? '500' : '400'
                                          }}
                                        >
                                          {stage.name}
                                        </p>
                                        {(isCurrent || isCompleted) && (() => {
                                          const selectedOrder = activeOrders.find((o: any) => o.id === selectedOrderId);
                                          const processingTime = selectedOrder?.processingTime || '6-8 WEEKS';
                                          const hasCustomization = !processingTime.includes('4'); // Rush (4-6 weeks) = no customization
                                          const timestamp = getStageTimestamp(index, selectedOrder?.date, hasCustomization, tShift);
                                          return timestamp ? (
                                            <p
                                              style={{
                      fontFamily: '"Futura PT Medium"',
                                                color: '#000000',
                                                fontSize: '9px',
                                                margin: '0',
                                                textTransform: 'uppercase',
                                                marginLeft: '12px'
                                              }}
                                            >
                                              {timestamp.date}
                                            </p>
                                          ) : null;
                                        })()}
                                      </div>
                                      {(isCurrent || isCompleted) && (
                                        <p
                                          style={{
                          fontFamily: '"Futura PT Medium"',
                                            color: '#000000',
                                            fontSize: '9px',
                                            margin: '4px 0 0 0',
                                            textTransform: 'uppercase',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start'
                                          }}
                                        >
                                          <span style={{ fontFamily: '"Futura PT Book"', color: '#808080' }}>{stage.description}</span>
                                          {(() => {
                                            const selectedOrder = activeOrders.find((o: any) => o.id === selectedOrderId);
                                            const processingTime = selectedOrder?.processingTime || '6-8 WEEKS';
                                            const hasCustomization = !processingTime.includes('4'); // Rush (4-6 weeks) = no customization
                                            const timestamp = getStageTimestamp(index, selectedOrder?.date, hasCustomization, tShift);
                                            return timestamp ? (
                                              <span
                                                style={{
                                                  fontFamily: '"Futura PT Medium"',
                                                  color: '#EB1C24',
                                                  marginLeft: '12px',
                                                  whiteSpace: 'nowrap'
                                                }}
                                              >
                                                {timestamp.time}
                                              </span>
                                            ) : null;
                                          })()}
                                        </p>
                                      )}
                                    </div>
                                    </div>
                                    
                                    {/* Expanded Content */}
                                    {isExpanded && isExpandable && (
                                      <div style={{ 
                                        padding: '0 12px 12px 12px', 
                                        marginTop: '0px',
                                        paddingTop: '6px'
                                      }}>
                                        {(() => {
                                          const so = activeOrders.find((o: any) => o.id === selectedOrderId);
                                          const adminNote = so?.trackingStageNotes?.[String(index)]?.trim();
                                          if (!adminNote) return null;
                                          return (
                                            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#EB1C24', margin: '0 0 10px 0', textTransform: 'uppercase', lineHeight: 1.45 }}>
                                              UPDATE: {adminNote}
                                            </p>
                                          );
                                        })()}
                                        {/* Selection Icons for specific statuses */}
                                        {(() => {
                                          const selectedOrder = activeOrders.find((o: any) => o.id === selectedOrderId);
                                          if (!selectedOrder) return null;
                                          const productName = selectedOrder.productName || 'NOIR';
                                          
                                          // Helper functions to check if a selection is non-default
                                          const isNonDefaultTexture = (texture: string) => {
                                            // Default is 'SILKY', so 'KINKY' and others are non-default
                                            return texture && texture !== 'SILKY';
                                          };
                                          
                                          const isNonDefaultHairline = (hairline: string) => {
                                            // Default is 'NATURAL'
                                            return hairline && hairline !== 'NATURAL';
                                          };
                                          
                                          const isNonDefaultColor = (color: string, productName: string) => {
                                            // Default is 'OFF BLACK' for most products, 'PLATINUM' for BLANCO
                                            const defaultColor = productName === 'BLANCO' ? 'PLATINUM' : 'OFF BLACK';
                                            return color && color !== defaultColor;
                                          };
                                          
                                          // Helper to render icon box
                                          const renderIconBox = (label: string, iconSrc: string, displayText: string, iconSize: string = '57px', iconTop: string = '55%') => (
                                            <div
                                              className="border relative text-center border-black bg-white"
                                              style={{
                                                borderWidth: '1.3px',
                                                width: '50px',
                                                height: '80px',
                                                boxSizing: 'border-box',
                                                padding: '0',
                                                overflow: 'visible',
                                                borderRadius: '0'
                                              }}
                                            >
                                              <p
                                                className="text-[10px] text-black absolute top-0 left-1/2 transform -translate-x-1/2 w-full"
                                                style={{ fontFamily: '"Covered By Your Grace", cursive' }}
                                              >
                                                {label}
                                              </p>
                                              <div
                                                className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center"
                                                style={{
                                                  width: iconSize,
                                                  height: iconSize,
                                                  overflow: 'visible',
                                                  top: iconTop,
                                                  transform: 'translateX(-50%) translateY(-50%)'
                                                }}
                                              >
                                                <img
                                                  alt={label}
                                                  src={iconSrc}
                                                  style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'contain',
                                                    display: 'block',
                                                    position: 'relative'
                                                  }}
                                                />
                                              </div>
                                              <p 
                                                className="absolute bottom-[-6.9px] left-1/2 transform -translate-x-1/2 text-[9px] w-full font-medium text-center" 
                                                style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium", Futura, Inter, sans-serif' }}
                                              >
                                                {displayText}
                                              </p>
                                            </div>
                                          );
                                          
                                          // SOURCING (index 1): length, density, texture (only non-defaults)
                                          if (index === 1) {
                                            // Check if order has multiple units
                                            const hasMultipleUnits = selectedOrder.units && Array.isArray(selectedOrder.units) && selectedOrder.units.length > 1;
                                            
                                            if (hasMultipleUnits) {
                                              // Render icons for all units side-by-side (show defaults except silky texture)
                                              const icons: JSX.Element[] = [];
                                              selectedOrder.units.forEach((unit: any) => {
                                                // Show length (including default)
                                                if (unit.length) {
                                                  const lengthSize = ['16"', '18"', '20"', '22"'].includes(unit.length) ? '72px' : '42px';
                                                  const lengthTop = ['16"', '18"', '20"', '22"'].includes(unit.length) ? '50%' : 'calc(58% - 1px)';
                                                  icons.push(
                                                    renderIconBox('LENGTH', getLengthIcon(unit.length), getLengthDisplayText(unit.length), lengthSize, lengthTop)
                                                  );
                                                }
                                                // Show density (including default)
                                                if (unit.density) {
                                                  const densitySize = productName === 'BLANCO' ? '80px' : '57px';
                                                  icons.push(
                                                    renderIconBox('DENSITY', getDensityIcon(productName), getDensityDisplayText(unit.density), densitySize)
                                                  );
                                                }
                                                // Only show texture if non-default (not SILKY)
                                                if (unit.texture && isNonDefaultTexture(unit.texture)) {
                                                  icons.push(
                                                    renderIconBox('TEXTURE', getTextureIcon(productName), getTextureDisplayText(unit.texture), productName === 'BLANCO' ? '35.48px' : '83px', productName === 'BLANCO' ? 'calc(50% + 5px)' : 'calc(50% + 2px)')
                                                  );
                                                }
                                              });
                                              
                                              if (icons.length > 0) {
                                                return (
                                                  <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap', justifyContent: 'flex-start', marginLeft: '2px' }}>
                                                    {icons}
                                                  </div>
                                                );
                                              }
                                            } else {
                                              // Single unit - show defaults except silky texture
                                              const icons: JSX.Element[] = [];
                                              
                                              // Show length (including default)
                                              if (selectedOrder.length) {
                                                const lengthSize = ['16"', '18"', '20"', '22"'].includes(selectedOrder.length) ? '72px' : '42px';
                                                const lengthTop = ['16"', '18"', '20"', '22"'].includes(selectedOrder.length) ? '50%' : 'calc(58% - 1px)';
                                                icons.push(
                                                  renderIconBox('LENGTH', getLengthIcon(selectedOrder.length), getLengthDisplayText(selectedOrder.length), lengthSize, lengthTop)
                                                );
                                              }
                                              
                                              // Show density (including default)
                                              if (selectedOrder.density) {
                                                const densitySize = productName === 'BLANCO' ? '80px' : '57px';
                                                icons.push(
                                                  renderIconBox('DENSITY', getDensityIcon(productName), getDensityDisplayText(selectedOrder.density), densitySize)
                                                );
                                              }
                                              
                                              // Only show texture if non-default (not SILKY)
                                              if (selectedOrder.texture && isNonDefaultTexture(selectedOrder.texture)) {
                                                icons.push(
                                                  renderIconBox('TEXTURE', getTextureIcon(productName), getTextureDisplayText(selectedOrder.texture), productName === 'BLANCO' ? '35.48px' : '83px', productName === 'BLANCO' ? 'calc(50% + 5px)' : 'calc(50% + 2px)')
                                                );
                                              }
                                              
                                              if (icons.length > 0) {
                                                return (
                                                  <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap', justifyContent: 'flex-start', marginLeft: '2px' }}>
                                                    {icons}
                                                  </div>
                                                );
                                              }
                                            }
                                          }
                                          
                                          // CONSTRUCTING UNIT (index 2): cap size, lace, hairline (only non-defaults)
                                          if (index === 2) {
                                            // Check if order has multiple units
                                            const hasMultipleUnits = selectedOrder.units && Array.isArray(selectedOrder.units) && selectedOrder.units.length > 1;
                                            
                                            if (hasMultipleUnits) {
                                              // Render icons for all units side-by-side (show defaults except natural hairline)
                                              const icons: JSX.Element[] = [];
                                              selectedOrder.units.forEach((unit: any) => {
                                                // Show cap size (including default)
                                                if (unit.capSize) {
                                                  icons.push(
                                                    renderIconBox('CAP SIZE', getCapSizeIcon(), getCapSizeDisplayText(unit.capSize), '78px', '53%')
                                                  );
                                                }
                                                // Show lace (including default)
                                                if (unit.lace) {
                                                  const laceSize = productName === 'BLANCO' ? '44px' : '74px';
                                                  icons.push(
                                                    renderIconBox('LACE', getLaceIcon(productName), getLaceDisplayText(unit.lace), laceSize, '52%')
                                                  );
                                                }
                                                // Only show hairline if non-default (not NATURAL)
                                                if (unit.hairline && isNonDefaultHairline(unit.hairline)) {
                                                  const hairlineSize = productName === 'BLANCO' ? '45px' : '75px';
                                                  icons.push(
                                                    renderIconBox('HAIRLINE', getHairlineIcon(unit.hairline), getHairlineDisplayText(unit.hairline), hairlineSize)
                                                  );
                                                }
                                              });
                                              
                                              if (icons.length > 0) {
                                                return (
                                                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
                                                    {icons}
                                                  </div>
                                                );
                                              }
                                            } else {
                                              // Single unit - show defaults except natural hairline
                                              const icons: JSX.Element[] = [];
                                              
                                              // Show cap size (including default)
                                              if (selectedOrder.capSize) {
                                                icons.push(
                                                  renderIconBox('CAP SIZE', getCapSizeIcon(), getCapSizeDisplayText(selectedOrder.capSize), '78px', '53%')
                                                );
                                              }
                                              
                                              // Show lace (including default)
                                              if (selectedOrder.lace) {
                                                const laceSize = productName === 'BLANCO' ? '44px' : '74px';
                                                icons.push(
                                                  renderIconBox('LACE', getLaceIcon(productName), getLaceDisplayText(selectedOrder.lace), laceSize, '52%')
                                                );
                                              }
                                              
                                              // Only show hairline if non-default (not NATURAL)
                                              if (selectedOrder.hairline && isNonDefaultHairline(selectedOrder.hairline)) {
                                                const hairlineSize = productName === 'BLANCO' ? '45px' : '75px';
                                                icons.push(
                                                  renderIconBox('HAIRLINE', getHairlineIcon(selectedOrder.hairline), getHairlineDisplayText(selectedOrder.hairline), hairlineSize)
                                                );
                                              }
                                              
                                              if (icons.length > 0) {
                                                return (
                                                  <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap', justifyContent: 'flex-start', marginLeft: '2px' }}>
                                                    {icons}
                                                  </div>
                                                );
                                              }
                                            }
                                          }
                                          
                                          // CUSTOMIZING (index 6): color, styling, add ons (only non-defaults)
                                          if (index === 6) {
                                            // Check if order has multiple units
                                            const hasMultipleUnits = selectedOrder.units && Array.isArray(selectedOrder.units) && selectedOrder.units.length > 1;
                                            
                                            // Color icon needs special handling - it's a color circle
                                            const renderColorIconBox = (unitColor: string) => {
                                              const colorCode = getColorCode(unitColor, productName);
                                              return (
                                                <div
                                                  className="border relative text-center border-black bg-white"
                                                  style={{
                                                    borderWidth: '1.3px',
                                                    width: '50px',
                                                    height: '80px',
                                                    boxSizing: 'border-box',
                                                    padding: '0',
                                                    overflow: 'visible'
                                                  }}
                                                >
                                                  <p
                                                    className="text-[10px] text-black absolute top-0 left-1/2 transform -translate-x-1/2 w-full"
                                                    style={{ fontFamily: '"Covered By Your Grace", cursive' }}
                                                  >
                                                    COLOR
                                                  </p>
                                                  <div
                                                    className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center"
                                                    style={{
                                                      width: '35px',
                                                      height: '35px',
                                                      overflow: 'visible',
                                                      top: '55%',
                                                      transform: 'translateX(-50%) translateY(-50%)'
                                                    }}
                                                  >
                                                    <div
                                                      style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        backgroundColor: '#808080',
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        position: 'relative'
                                                      }}
                                                    >
                                                      <div
                                                        style={{
                                                          width: '81%',
                                                          height: '81%',
                                                          backgroundColor: '#FFFFFF',
                                                          borderRadius: '50%',
                                                          display: 'flex',
                                                          alignItems: 'center',
                                                          justifyContent: 'center'
                                                        }}
                                                      >
                                                        <div
                                                          style={{
                                                            width: '76%',
                                                            height: '76%',
                                                            backgroundColor: colorCode,
                                                            borderRadius: '50%'
                                                          }}
                                                        />
                                                      </div>
                                                    </div>
                                                  </div>
                                                  <p 
                                                    className="absolute bottom-[-6.9px] left-1/2 transform -translate-x-1/2 text-[9px] w-full font-medium text-center" 
                                                    style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium", Futura, Inter, sans-serif' }}
                                                  >
                                                    {getColorDisplayText(unitColor)}
                                                  </p>
                                                </div>
                                              );
                                            };
                                            
                                            if (hasMultipleUnits) {
                                              // Render icons for all units side-by-side (only non-defaults)
                                              const icons: JSX.Element[] = [];
                                              selectedOrder.units.forEach((unit: any) => {
                                                // Only show color if non-default
                                                if (unit.color && isNonDefaultColor(unit.color, productName)) {
                                                  icons.push(renderColorIconBox(unit.color));
                                                }
                                                
                                                // Only add styling icon if it has a selection (not "NONE")
                                                const hasStyling = unit.styling && unit.styling !== 'NONE';
                                                if (hasStyling) {
                                                  icons.push(renderIconBox('STYLING', getStylingIcon(unit.styling), getStylingDisplayText(unit.styling), '80px', '52.5%'));
                                                }
                                                
                                                // Only add add-ons icon if it has selections
                                                const hasAddOns = unit.addOns && Array.isArray(unit.addOns) && unit.addOns.length > 0;
                                                if (hasAddOns) {
                                                  icons.push(renderIconBox('ADD-ONS', getAddOnsIcon(unit.addOns), getAddOnsDisplayText(unit.addOns), '80px', '52.5%'));
                                                }
                                              });
                                              
                                              if (icons.length > 0) {
                                                return (
                                                  <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap', justifyContent: 'flex-start', marginLeft: '2px' }}>
                                                    {icons}
                                                  </div>
                                                );
                                              }
                                            } else {
                                              // Single unit - only show non-default selections
                                              const icons: JSX.Element[] = [];
                                              
                                              // Only show color if non-default
                                              if (selectedOrder.color && isNonDefaultColor(selectedOrder.color, productName)) {
                                                icons.push(renderColorIconBox(selectedOrder.color));
                                              }
                                              
                                              // Only add styling icon if it has a selection (not "NONE")
                                              const hasStyling = selectedOrder.styling && selectedOrder.styling !== 'NONE';
                                              if (hasStyling) {
                                                icons.push(renderIconBox('STYLING', getStylingIcon(selectedOrder.styling), getStylingDisplayText(selectedOrder.styling), '80px', '52.5%'));
                                              }
                                              
                                              // Only add add-ons icon if it has selections
                                              const hasAddOns = selectedOrder.addOns && Array.isArray(selectedOrder.addOns) && selectedOrder.addOns.length > 0;
                                              if (hasAddOns) {
                                                icons.push(renderIconBox('ADD-ONS', getAddOnsIcon(selectedOrder.addOns), getAddOnsDisplayText(selectedOrder.addOns), '80px', '52.5%'));
                                              }
                                              
                                              if (icons.length > 0) {
                                                return (
                                                  <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap', justifyContent: 'flex-start', marginLeft: '2px' }}>
                                                    {icons}
                                                  </div>
                                                );
                                              }
                                            }
                                          }
                                          
                                          // For all other stages (0, 3, 4, 5), show silky texture icon as base design
                                          // Stages with icons: 1 (SOURCING), 2 (CONSTRUCTING), 6 (CUSTOMIZING), 7 (FINALIZING), 8 (PACKAGE SHIPPED)
                                          // Prepping stage (index 5), Arrived at Hub (index 4), Shipped to Hub (index 3) use line icons instead
                                          if (index !== 1 && index !== 2 && index !== 6 && index !== 7 && index !== 8) {
                                            // Confirmed stage (index 0) uses form icon with form and sign/signed text
                                            if (index === 0) {
                                              const isFormSigned = selectedOrder?.orderFormSigned === true;
                                              const orderDate = selectedOrder?.date;
                                              const placedAt = selectedOrder?.placedAt;
                                              
                                              // Check if 24 hours have passed since order was placed
                                              let isPastTimeLimit = false;
                                              if (placedAt) {
                                                const timeSincePlaced = Date.now() - placedAt;
                                                const hoursSincePlaced = timeSincePlaced / (1000 * 60 * 60);
                                                isPastTimeLimit = hoursSincePlaced > 24;
                                              } else if (orderDate) {
                                                // Fallback: use order date if placedAt not available
                                                try {
                                                  let orderDateObj: Date;
                                                  if (orderDate.includes('-')) {
                                                    const [month, day, year] = orderDate.split('-').map(Number);
                                                    orderDateObj = new Date(year, month - 1, day);
                                                  } else {
                                                    orderDateObj = new Date(orderDate);
                                                  }
                                                  const timeSincePlaced = Date.now() - orderDateObj.getTime();
                                                  const hoursSincePlaced = timeSincePlaced / (1000 * 60 * 60);
                                                  isPastTimeLimit = hoursSincePlaced > 24;
                                                } catch (e) {
                                                  isPastTimeLimit = false;
                                                }
                                              }
                                              
                                              // Determine form status text based on signature and time limit
                                              let formStatusText: string;
                                              if (isFormSigned) {
                                                formStatusText = 'SIGNED';
                                              } else if (isPastTimeLimit) {
                                                formStatusText = 'EXPIRED';
                                              } else {
                                                formStatusText = 'SIGN';
                                              }
                                              
                                              // Only clickable if form is not signed AND within 24 hours (not canceled)
                                              const isClickable = !isFormSigned && !isPastTimeLimit;
                                              
                                              return (
                                                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap', justifyContent: 'flex-start', marginLeft: '2px' }}>
                                                  <div style={{ position: 'relative' }}>
                                                    {(() => {
                                                      const renderFormIconBox = (label: string, iconSrc: string, displayText: string, iconSize: string = '57px', iconTop: string = '55%', isClickable: boolean = false): JSX.Element => {
                                                        const baseStyle: React.CSSProperties = {
                                                          borderWidth: '1.3px',
                                                          width: '50px',
                                                          height: '80px',
                                                          boxSizing: 'border-box',
                                                          padding: '0',
                                                          overflow: 'visible',
                                                          borderRadius: '0'
                                                        };
                                                        
                                                        if (isClickable) {
                                                          baseStyle.transition = 'background-color 0.2s ease';
                                                        }
                                                        
                                                        return (
                                                          <div
                                                            className={`border relative text-center border-black bg-white ${isClickable ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                                                            style={baseStyle}
                                                            onClick={isClickable ? () => {
                                                              // Get customer info from current user if signed in
                                                              let customerData: any = {};
                                                              // Strip "ORDER " prefix from order number if present
                                                              const orderNumber = selectedOrder?.orderNumber?.replace(/^ORDER\s+/i, '') || '';
                                                              
                                                              // Get current user data
                                                              try {
                                                                const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
                                                                if (currentUser && Object.keys(currentUser).length > 0) {
                                                                  customerData = {
                                                                    orderNumber: orderNumber,
                                                                    orderDate: selectedOrder?.date,
                                                                    orderId: selectedOrder?.id,
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
                                                                  customerData = {
                                                                    orderNumber: orderNumber,
                                                                    orderDate: selectedOrder?.date,
                                                                    orderId: selectedOrder?.id
                                                                  };
                                                                }
                                                              } catch (e) {
                                                                customerData = {
                                                                  orderNumber: orderNumber,
                                                                  orderDate: selectedOrder?.date,
                                                                  orderId: selectedOrder?.id
                                                                };
                                                              }
                                                              
                                                              navigate('/tools/order-form', { state: customerData });
                                                            } : undefined}
                                                          >
                                                          <p
                                                            className="text-[10px] text-black absolute top-0 left-1/2 transform -translate-x-1/2 w-full"
                                                            style={{ fontFamily: '"Covered By Your Grace", cursive' }}
                                                          >
                                                            {label}
                                                          </p>
                                                          <div
                                                            className="absolute flex items-center justify-center"
                                                            style={{
                                                              width: iconSize,
                                                              height: iconSize,
                                                              overflow: 'visible',
                                                              top: iconTop,
                                                              left: 'calc(50% + 3px)',
                                                              transform: 'translateX(-50%) translateY(-50%)'
                                                            }}
                                                          >
                                                            <img
                                                              alt={label}
                                                              src={iconSrc}
                                                              style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'contain',
                                                                display: 'block',
                                                                position: 'relative'
                                                              }}
                                                            />
                                                          </div>
                                                          <p 
                                                            className="absolute bottom-[-6.9px] left-1/2 transform -translate-x-1/2 text-[9px] w-full font-medium text-center" 
                                                            style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium", Futura, Inter, sans-serif' }}
                                                          >
                                                            {displayText}
                                                          </p>
                                                        </div>
                                                        );
                                                      };
                                                      return renderFormIconBox('FORM', '/assets/order-form.svg', formStatusText, '29.27px', 'calc(50% + 3px)', isClickable);
                                                    })()}
                                                  </div>
                                                </div>
                                              );
                                            }
                                            // Cleansing stage (index 5) uses shampoo icon
                                            if (index === 5) {
                                              return (
                                                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap', justifyContent: 'flex-start', marginLeft: '2px' }}>
                                                  {renderIconBox('SANITIZE', '/assets/Shampoo.svg', 'SOAK', '28px', '55%')}
                                                </div>
                                              );
                                            }
                                            // Arrived at Hub stage (index 4) uses arrived plane icon
                                            if (index === 4) {
                                              return (
                                                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap', justifyContent: 'flex-start', marginLeft: '2px' }}>
                                                  {renderIconBox('PARCEL', '/assets/Arrived Plane.svg', 'RECEIVED', '35px', '55%')}
                                                </div>
                                              );
                                            }
                                            // Shipped to Hub (index 3) uses shipped plane icon
                                            if (index === 3) {
                                              return (
                                                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap', justifyContent: 'flex-start', marginLeft: '2px' }}>
                                                  {renderIconBox('PARCEL', '/assets/Shipped Plane.svg', 'SENT', '26.6px', '55%')}
                                                </div>
                                              );
                                            }
                                            // Other stages use silky texture icon
                                            const textureIconSize = productName === 'BLANCO' ? '35.48px' : '83px';
                                            const textureIconTop = productName === 'BLANCO' ? 'calc(50% + 5px)' : 'calc(50% + 2px)';
                                            return (
                                              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap', justifyContent: 'flex-start', marginLeft: '2px' }}>
                                                {renderIconBox('TEXTURE', getTextureIcon(productName), 'SILKY', textureIconSize, textureIconTop)}
                                              </div>
                                            );
                                          }
                                          
                                          // Finalizing stage (index 7) uses package icon
                                          if (index === 7) {
                                            const textureIconSize = productName === 'BLANCO' ? '41.96px' : '98.19px';
                                            return (
                                              <div style={{ display: 'flex', gap: '12px', marginTop: '-1px', marginBottom: '11px', flexWrap: 'wrap', justifyContent: 'flex-start', marginLeft: '2px' }}>
                                                <img
                                                  alt="package icon"
                                                  src="/assets/final-package2.png"
                                                  style={{
                                                    width: textureIconSize,
                                                    height: textureIconSize,
                                                    objectFit: 'contain',
                                                    display: 'block'
                                                  }}
                                                />
                                              </div>
                                            );
                                          }
                                          
                                          // Package Shipped stage (index 8) uses shipped plane icon
                                          if (index === 8) {
                                            return (
                                              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap', justifyContent: 'flex-start', marginLeft: '2px' }}>
                                                {renderIconBox('PARCEL', '/assets/Shipped Plane.svg', 'SENT', '26.6px', '55%')}
                                              </div>
                                            );
                                          }
                                          
                                          return null;
                                        })()}
                                        
                                        {/* Gray line above estimated duration */}
                                        <div
                                          style={{
                                            width: 'calc(100% - 4px)',
                                            height: '1px',
                                            backgroundColor: '#E0E0E0',
                                            margin: '0 auto 8px auto'
                                          }}
                                        />
                                        {/* Timeframe */}
                                        <p
                                          style={{
                                            fontFamily: '"Futura PT Book"',
                                            color: '#808080',
                                            fontSize: '9px',
                                            margin: '0 0 5px 0',
                      textTransform: 'uppercase'
                                          }}
                                        >
                                          ESTIMATED DURATION: {durationText}
                                        </p>
                                        
                                        {/* Progress Bar - Always show for current, completed, or delivered stages */}
                                        {(isCurrent || isCompleted || isDeliveredLastStage) && (
                                          <div style={{ marginTop: '3px' }}>
                                            <div
                    style={{
                      width: '100%',
                                                height: '7px',
                                                backgroundColor: '#E0E0E0',
                                                borderRadius: (progress > 0 || (isCanceled && isCompleted)) ? '4px' : '0',
                                                overflow: 'hidden',
                                                position: 'relative',
                                                border: (progress === 0 && !isCanceled) ? '1px solid #808080' : 'none'
                                              }}
                                            >
                                              <div
                                                style={{
                                                  width: isCompleted || isDeliveredLastStage ? '100%' : `${progress}%`,
                                                  height: '100%',
                                                  backgroundColor: isCompleted || isDeliveredLastStage ? '#EB1C24' : '#EB1C24',
                                                  transition: 'width 0.3s ease',
                                                  borderRadius: (isCompleted || isDeliveredLastStage || progress > 0) ? '4px' : '0'
                    }}
                  />
                </div>
                                            {!(isDeliveredLastStage && index === 8) && (
                                              <p
                                                style={{
                          fontFamily: '"Futura PT Book"',
                                                    color: (() => {
                                                      // Special handling for confirmed stage (index 0) - all statuses should be red
                                                      if (index === 0) {
                                                        // All confirmed stage statuses should be red
                                                        return '#EB1C24';
                                                      }
                                                      // For other stages: red if completed OR if progress is 100%
                                                      return (isCompleted || progress >= 100) ? '#EB1C24' : '#000000';
                                                    })(),
                                                    fontSize: '9px',
                                                    margin: '4px 0 0 0',
                          textTransform: 'uppercase'
                                                }}
                                              >
                                                {(() => {
                                                  // Special handling for confirmed stage (index 0)
                                                  if (index === 0) {
                                                    const isFormSigned = selectedOrder?.orderFormSigned === true;
                                                    const orderDate = selectedOrder?.date;
                                                    const placedAt = selectedOrder?.placedAt;
                                                    
                                                    // Check if 24 hours have passed since order was placed
                                                    let isPastTimeLimit = false;
                                                    if (placedAt) {
                                                      const timeSincePlaced = Date.now() - placedAt;
                                                      const hoursSincePlaced = timeSincePlaced / (1000 * 60 * 60);
                                                      isPastTimeLimit = hoursSincePlaced > 24;
                                                    } else if (orderDate) {
                                                      // Fallback: use order date if placedAt not available
                                                      try {
                                                        let orderDateObj: Date;
                                                        if (orderDate.includes('-')) {
                                                          const [month, day, year] = orderDate.split('-').map(Number);
                                                          orderDateObj = new Date(year, month - 1, day);
                                                        } else {
                                                          orderDateObj = new Date(orderDate);
                                                        }
                                                        const timeSincePlaced = Date.now() - orderDateObj.getTime();
                                                        const hoursSincePlaced = timeSincePlaced / (1000 * 60 * 60);
                                                        isPastTimeLimit = hoursSincePlaced > 24;
                                                      } catch (e) {
                                                        isPastTimeLimit = false;
                                                      }
                                                    }
                                                    
                                                    if (isFormSigned) {
                                                      return 'STATUS: COMPLETE';
                                                    } else if (isPastTimeLimit) {
                                                      return 'STATUS: CANCELED';
                                                    } else {
                                                      return 'STATUS: AWAITING SIGNATURE';
                                                    }
                                                  }
                                                  
                                                  // For other stages, use existing logic
                                                  // Show "COMPLETE" if completed or progress is 100%, otherwise show percentage (1-99%)
                                                  if (isDeliveredLastStage) {
                                                    return 'STATUS: DELIVERED';
                                                  } else if (isCompleted || progress >= 100) {
                                                    return 'STATUS: COMPLETE';
                                                  } else if (progress > 0) {
                                                    return `STATUS: ${Math.round(progress)}% COMPLETE`;
                                                  } else {
                                                    return `STATUS: ${Math.round(progress)}% COMPLETE`;
                                                  }
                                                })()}
                                              </p>
                                            )}
                                          </div>
                                        )}
                                        
                                        {isUpcoming && index !== 0 && (
                                          <p
                                            style={{
                                              fontFamily: '"Futura PT Book"',
                                              color: '#808080',
                                              fontSize: '9px',
                                              margin: '8px 0 0 0',
                                              textTransform: 'uppercase'
                                            }}
                                          >
                                            PENDING
                                          </p>
                                        )}
                                        
                                        {/* Tracking Number and Shipping Status for ORDER SHIPPED */}
                                        {index === 8 && (isCurrent || isCompleted || isDeliveredLastStage) && (() => {
                                          const selectedOrder = activeOrders.find((o: any) => o.id === selectedOrderId);
                                          const subStatus = getOrderShippedSubStatus(selectedOrder);
                                          
                                          const isPreparing = subStatus === 'PREPARING LABEL';
                                          const isTrackingNumber = subStatus !== 'PREPARING LABEL' && subStatus !== 'DELIVERED';
                                          const isDelivered = subStatus === 'DELIVERED';
                                          
                                          return (
                                            <div style={{ marginTop: isDelivered ? '1px' : '6px' }}>
                                              {!isDelivered && (
                                                <div
                                                  style={{
                                                    width: 'calc(100% - 4px)',
                                                    height: '1px',
                                                    backgroundColor: '#E0E0E0',
                                                    margin: '0 auto 12px auto'
                                                  }}
                                                />
                                              )}
                                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                {/* Show only the current status */}
                                                {isPreparing && (
                                                  <p
                                                    style={{
                                                      fontFamily: '"Futura PT Book"',
                                                      color: isCurrent ? '#EB1C24' : '#808080',
                                                      fontSize: '9px',
                                                      margin: '4px 0 0 0',
                                                      textTransform: 'uppercase'
                                                    }}
                                                  >
                                                    STATUS: PREPARING LABEL
                                                  </p>
                                                )}
                                                {isTrackingNumber && (
                                                  <p
                                                    style={{
                                                      fontFamily: '"Futura PT Book"',
                                                      color: isCurrent ? '#EB1C24' : '#000000',
                                                      fontSize: '9px',
                                                      margin: '4px 0 0 0',
                                                      textTransform: 'uppercase'
                                                    }}
                                                  >
                                                    STATUS: {subStatus}
                                                  </p>
                                                )}
                                                {isDelivered && (
                                                  <p
                                                    style={{
                                                      fontFamily: '"Futura PT Book"',
                                                      color: '#EB1C24',
                                                      fontSize: '9px',
                                                      margin: '4px 0 0 0',
                                                      textTransform: 'uppercase'
                                                    }}
                                                  >
                                                    STATUS: DELIVERED
                                                  </p>
                                                )}
                                              </div>
                                            </div>
                                          );
                                        })()}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                              });
                            })()}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <p
                      style={{
                        fontFamily: '"Futura PT Book"',
                        color: '#808080',
                      fontSize: '11px',
                        margin: '0 0 16px 0',
                        textTransform: 'uppercase',
                        textAlign: 'center',
                        padding: '12px'
                      }}
                    >
                      NO ACTIVE ORDERS TO TRACK.
                    </p>
                  )}
                </div>
                <div className="px-0 md:px-0" style={{ marginTop: '2px', marginBottom: '20px', transform: 'translateY(-2px)' }}>
                  <button
                    onClick={() => {
                      navigate('/account/orders');
                    }}
                    className="border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
                    style={{
                      borderWidth: '1.3px',
                      color: '#EB1C24',
                      fontFamily: '"Futura PT Medium"',
                      backgroundColor: '#FFFFFF'
                    }}
                    type="button"
                  >
                    VIEW ORDERS
                  </button>
                </div>

                {/* Slay Challenge Section - 6 & 12 month premium only */}
                {showSlayAndSpecialOffer && (
                <>
                <div
                  className="border border-black bg-white/60 backdrop-blur-sm w-full mb-2 transition-all duration-300 ease-out"
                  style={{
                    borderWidth: '1.3px',
                    paddingTop: '20px',
                    paddingLeft: '20px',
                    paddingRight: '20px',
                    paddingBottom: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.6)'
                  }}
                >
                  <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '16px' }}>
                    <h2
                      style={{
                        fontFamily: '"Futura PT Medium"',
                        color: '#EB1C24',
                        fontSize: '12px',
                        fontWeight: '500',
                        margin: '0',
                        textTransform: 'uppercase'
                      }}
                    >
                      SLAY CHALLENGE
                    </h2>
                    <img
                      src="/assets/challenge-icon.svg"
                      alt="Slay Challenge"
                      style={{
                        width: '17.26px',
                        height: '17.26px',
                        objectFit: 'contain',
                        transform: 'translateY(-1.5px)',
                        filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%) drop-shadow(0 0 0.15px #EB1C24) drop-shadow(0 0 0.15px #EB1C24) drop-shadow(0 0 0.1px #EB1C24) drop-shadow(0 0 0.2px #EB1C24)'
                      }}
                    />
                  </div>
                  {isSlayChallengeAdmin && (
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#666', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Test stage (admin)</label>
                      <select
                        value={slayChallengeAdminStage || 'selection'}
                        onChange={(e) => setSlayChallengeAdminStageAndSave(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          border: '1px solid #9ca3af',
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          textTransform: 'uppercase',
                          background: '#fff',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="selection">Selection (choose rewards)</option>
                        <option value="selected_waiting">Selected — waiting for cycle</option>
                        <option value="active">Active challenge (progress)</option>
                        <option value="closed">Selection closed</option>
                      </select>
                    </div>
                  )}
                  <p style={{ fontFamily: '"Futura PT Book"', color: '#000', fontSize: '10px', margin: '0 0 12px 0', textTransform: 'uppercase' }}>
                    Complete tasks in 6 months. Choose your rewards for each tier; tier 2 unlocks after tier 1. You have 3 days before each cycle ends to select your challenge—or wait for the next cycle.
                  </p>
                  {effectiveInSelectionWindow && !effectiveHasSelectedForNext && (
                    <>
                      <p style={{ fontFamily: '"Futura PT Medium"', color: '#000', fontSize: '10px', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
                        Select rewards for the next cycle ({slayChallengeNextCycleLabel}):
                      </p>
                      <p style={{ fontFamily: '"Futura PT Book"', color: '#666', fontSize: '10px', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
                        Tier 1 — Complete: 1 purchase, 1 content review, 1 post. Reward:
                      </p>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                        <button
                          type="button"
                          onClick={() => setSlayChallengeTier1Reward(slayChallengeTier1Reward === 'voucher' ? '' : 'voucher')}
                          style={{
                            flex: 1,
                            height: '32px',
                            border: slayChallengeTier1Reward === 'voucher' ? '1.3px solid #EB1C24' : '1.3px solid #000',
                            background: '#FFF',
                            fontFamily: '"Futura PT Book"',
                            fontSize: '10px',
                            color: slayChallengeTier1Reward === 'voucher' ? '#EB1C24' : '#000',
                            textTransform: 'uppercase',
                            cursor: 'pointer'
                          }}
                        >
                          RANDOM VOUCHER
                        </button>
                        <button
                          type="button"
                          onClick={() => setSlayChallengeTier1Reward(slayChallengeTier1Reward === '200points' ? '' : '200points')}
                          style={{
                            flex: 1,
                            height: '32px',
                            border: slayChallengeTier1Reward === '200points' ? '1.3px solid #EB1C24' : '1.3px solid #000',
                            background: '#FFF',
                            fontFamily: '"Futura PT Book"',
                            fontSize: '10px',
                            color: slayChallengeTier1Reward === '200points' ? '#EB1C24' : '#000',
                            textTransform: 'uppercase',
                            cursor: 'pointer'
                          }}
                        >
                          200 LOYALTY PTS
                        </button>
                      </div>
                      <p style={{ fontFamily: '"Futura PT Book"', color: '#666', fontSize: '10px', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
                        Tier 2 — Complete: 1 purchase, 1 content review, 1 social tag. Reward:
                      </p>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                        <button
                          type="button"
                          onClick={() => setSlayChallengeTier2Reward(slayChallengeTier2Reward === '2xpoints' ? '' : '2xpoints')}
                          style={{
                            flex: 1,
                            height: '32px',
                            border: slayChallengeTier2Reward === '2xpoints' ? '1.3px solid #EB1C24' : '1.3px solid #000',
                            background: '#FFF',
                            fontFamily: '"Futura PT Book"',
                            fontSize: '10px',
                            color: slayChallengeTier2Reward === '2xpoints' ? '#EB1C24' : '#000',
                            textTransform: 'uppercase',
                            cursor: 'pointer'
                          }}
                        >
                          2X PTS NEXT PURCHASE
                        </button>
                        <button
                          type="button"
                          onClick={() => setSlayChallengeTier2Reward(slayChallengeTier2Reward === '1000points' ? '' : '1000points')}
                          style={{
                            flex: 1,
                            height: '32px',
                            border: slayChallengeTier2Reward === '1000points' ? '1.3px solid #EB1C24' : '1.3px solid #000',
                            background: '#FFF',
                            fontFamily: '"Futura PT Book"',
                            fontSize: '10px',
                            color: slayChallengeTier2Reward === '1000points' ? '#EB1C24' : '#000',
                            textTransform: 'uppercase',
                            cursor: 'pointer'
                          }}
                        >
                          1K LOYALTY PTS
                        </button>
                      </div>
                    </>
                  )}
                  {effectiveInSelectionWindow && effectiveHasSelectedForNext && (
                    <p style={{ fontFamily: '"Futura PT Book"', color: '#000', fontSize: '10px', margin: '0', textTransform: 'uppercase' }}>
                      You’re set for the next cycle. Your challenge begins when the new cycle starts.
                    </p>
                  )}
                  {!effectiveInSelectionWindow && effectiveActive && (
                    <>
                      <p style={{ fontFamily: '"Futura PT Medium"', color: '#000', fontSize: '10px', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
                        Tier 1 — Reward: {slayChallengeTier1Reward === 'voucher' ? 'Random voucher' : '200 loyalty points'}
                      </p>
                      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 12px 0', fontSize: '10px', fontFamily: '"Futura PT Book"', textTransform: 'uppercase' }}>
                        <li style={{ marginBottom: '4px' }}>{slayChallengeTier1Progress.purchase ? '✓' : '○'} Complete a purchase</li>
                        <li style={{ marginBottom: '4px' }}>{slayChallengeTier1Progress.review ? '✓' : '○'} Complete a content review</li>
                        <li style={{ marginBottom: '4px' }}>{slayChallengeTier1Progress.post ? '✓' : '○'} Make a post</li>
                      </ul>
                      {slayChallengeTier1Complete && (
                        <>
                          <p style={{ fontFamily: '"Futura PT Medium"', color: '#000', fontSize: '10px', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
                            Tier 2 — Reward: {slayChallengeTier2Reward === '2xpoints' ? '2x points on next purchase' : '1,000 loyalty points'}
                          </p>
                          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 12px 0', fontSize: '10px', fontFamily: '"Futura PT Book"', textTransform: 'uppercase' }}>
                            <li style={{ marginBottom: '4px' }}>{slayChallengeTier2Progress.purchase ? '✓' : '○'} Complete another purchase</li>
                            <li style={{ marginBottom: '4px' }}>{slayChallengeTier2Progress.review ? '✓' : '○'} Complete a content review</li>
                            <li style={{ marginBottom: '4px' }}>{slayChallengeTier2Progress.socialTag ? '✓' : '○'} Make a social tag</li>
                          </ul>
                        </>
                      )}
                      {!slayChallengeTier1Complete && (
                        <p style={{ fontFamily: '"Futura PT Book"', color: '#666', fontSize: '10px', margin: '0', textTransform: 'uppercase' }}>
                          Complete tier 1 to unlock tier 2.
                        </p>
                      )}
                    </>
                  )}
                  {!effectiveInSelectionWindow && !effectiveActive && effectiveHasSelectedCycle && (
                    <p style={{ fontFamily: '"Futura PT Book"', color: '#000', fontSize: '10px', margin: '0', textTransform: 'uppercase' }}>
                      Your next selection window is in the last 3 days of the current cycle. Complete your current challenge or wait for the next cycle.
                    </p>
                  )}
                  {!effectiveInSelectionWindow && !effectiveActive && !effectiveHasSelectedCycle && (
                    <p style={{ fontFamily: '"Futura PT Book"', color: '#666', fontSize: '10px', margin: '0', textTransform: 'uppercase' }}>
                      Selection window closed. You have 3 days before the next cycle ends to choose your challenge—or wait 6 months for the next window.
                    </p>
                  )}
                </div>
                {effectiveInSelectionWindow && !effectiveHasSelectedForNext && (
                  <div className="px-0 md:px-0" style={{ marginTop: '2px', marginBottom: '20px', transform: 'translateY(-2px)' }}>
                    <button
                      type="button"
                      onClick={handleSlayChallengeConfirmSelection}
                      disabled={!slayChallengeTier1Reward || !slayChallengeTier2Reward}
                      className="border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{
                        borderWidth: '1.3px',
                        color: '#EB1C24',
                        fontFamily: '"Futura PT Medium"',
                        backgroundColor: (!slayChallengeTier1Reward || !slayChallengeTier2Reward) ? '#e5e7eb' : '#FFFFFF'
                      }}
                    >
                      START CHALLENGE
                    </button>
                  </div>
                )}

                </>
                )}

                {/* Free Gift Section */}
                <div
                  className="border border-black bg-white/60 backdrop-blur-sm w-full mb-2 transition-all duration-300 ease-out"
                  style={{
                    borderWidth: '1.3px',
                    paddingTop: '20px',
                    paddingLeft: '10px',
                    paddingRight: '10px',
                    paddingBottom: '7px',
                    backgroundColor: 'rgba(255, 255, 255, 0.6)'
                  }}
                >
                  <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '22px' }}>
                    <h2
                      style={{
                        fontFamily: '"Futura PT Medium"',
                        color: '#EB1C24',
                        fontSize: '12px',
                        fontWeight: '500',
                        margin: '0',
                        textTransform: 'uppercase'
                      }}
                    >
                      FREE GIFT
                    </h2>
                    <img
                      src="/assets/Free Gift.svg"
                      alt="Free Gift"
                      style={{
                        width: '13.3px',
                        height: '13.3px',
                        objectFit: 'contain',
                        filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%) drop-shadow(0 0 0.15px #EB1C24) drop-shadow(0 0 0.15px #EB1C24)'
                      }}
                    />
                  </div>
                  
                  <p
                    style={{
                      fontFamily: '"Futura PT Medium"',
                      color: '#000000',
                      fontSize: '10px',
                      margin: '0 0 16px 0',
                      textAlign: 'center',
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                      marginLeft: '-10px',
                      marginRight: '-10px'
                    }}
                  >
                    choose which gift you'd like to be included in your next order:
                  </p>
                  
                  {/* Gift Selection Options */}
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    {/* Melt Band Option */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div
                        onClick={() => setSelectedFreeGift(selectedFreeGift === 'melt-band' ? '' : 'melt-band')}
                        style={{
                          border: selectedFreeGift === 'melt-band' ? '1.3px solid #EB1C24' : '1.3px solid #000000',
                          padding: '12px',
                          cursor: 'pointer',
                      backgroundColor: '#FFFFFF',
                          textAlign: 'center',
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 'calc(100% - 20px)',
                          height: '144px'
                        }}
                      >
                        <img
                          src="/assets/melt-band.png"
                          alt="Melt Band"
                          style={{
                            maxWidth: '78px',
                            maxHeight: '118px',
                            width: 'auto',
                            height: 'auto',
                            objectFit: 'contain'
                          }}
                        />
                      </div>
                      <p
                        style={{
                          fontFamily: selectedFreeGift === 'melt-band' ? '"Futura PT Medium"' : '"Futura PT Book"',
                          color: selectedFreeGift === 'melt-band' ? '#EB1C24' : '#000000',
                          fontSize: '10px',
                          margin: '0',
                          textAlign: 'center',
                      textTransform: 'uppercase'
                        }}
                      >
                        MELT BAND
                      </p>
                    </div>
                    
                    {/* Wig Brush Option */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div
                        onClick={() => setSelectedFreeGift(selectedFreeGift === 'wig-brush' ? '' : 'wig-brush')}
                        style={{
                          border: selectedFreeGift === 'wig-brush' ? '1.3px solid #EB1C24' : '1.3px solid #000000',
                          padding: '12px',
                          cursor: 'pointer',
                          backgroundColor: '#FFFFFF',
                          textAlign: 'center',
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 'calc(100% - 20px)',
                          height: '144px'
                        }}
                      >
                        <img
                          src="/assets/wig-brush.png"
                          alt="Wig Brush"
                          style={{
                            maxWidth: '42px',
                            maxHeight: '126px',
                            width: 'auto',
                            height: 'auto',
                            objectFit: 'contain'
                    }}
                  />
                </div>
                      <p
                    style={{
                          fontFamily: selectedFreeGift === 'wig-brush' ? '"Futura PT Medium"' : '"Futura PT Book"',
                          color: selectedFreeGift === 'wig-brush' ? '#EB1C24' : '#000000',
                          fontSize: '10px',
                          margin: '0',
                          textAlign: 'center',
                          textTransform: 'uppercase'
                        }}
                      >
                        WIG BRUSH
                      </p>
                    </div>
                  </div>
                </div>
                <div className="px-0 md:px-0" style={{ marginTop: '2px', marginBottom: '20px', transform: 'translateY(-2px)' }}>
                  <button
                    onClick={handleSubmitFreeGift}
                    className="border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
                    style={{
                      borderWidth: '1.3px',
                      color: '#EB1C24',
                      fontFamily: '"Futura PT Medium"',
                      backgroundColor: '#FFFFFF'
                    }}
                    type="button"
                  >
                    SAVE SELECTION
                  </button>
                </div>

                {/* Birthday Gift Section */}
                <div
                  className="border border-black bg-white/60 backdrop-blur-sm w-full mb-2 transition-all duration-300 ease-out"
                  style={{
                    borderWidth: '1.3px',
                    paddingTop: '20px',
                    paddingLeft: '20px',
                    paddingRight: '20px',
                    paddingBottom: '7px',
                    backgroundColor: 'rgba(255, 255, 255, 0.6)'
                  }}
                >
                  <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '22px' }}>
                    <h2
                      style={{
                        fontFamily: '"Futura PT Medium"',
                        color: '#EB1C24',
                        fontSize: '12px',
                        fontWeight: '500',
                        margin: '0',
                        textTransform: 'uppercase'
                      }}
                    >
                      BIRTHDAY GIFT
                    </h2>
                    <img
                      src="/assets/birthday1.svg"
                      alt="Birthday Gift"
                      style={{
                        width: '16px',
                        height: '16px',
                        objectFit: 'contain',
                        filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%) drop-shadow(0 0 0.15px #EB1C24) drop-shadow(0 0 0.15px #EB1C24)'
                      }}
                    />
                  </div>
                  
                  <p
                    style={{
                      fontFamily: '"Futura PT Medium"',
                      color: '#000000',
                      fontSize: '10px',
                      margin: '0 0 16px 0',
                      textAlign: 'center',
                      textTransform: 'uppercase'
                    }}
                  >
                    choose which gift you'd like to receive for your birthday:
                  </p>
                  
                  {/* Birthday Gift Selection Options */}
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', minWidth: 0 }}>
                    {/* $20 Gift Card Option */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }}>
                      <div
                        onClick={() => setSelectedBirthdayGift(selectedBirthdayGift === 'gift-card' ? '' : 'gift-card')}
                    style={{
                          border: selectedBirthdayGift === 'gift-card' ? '1.3px solid #EB1C24' : '1.3px solid #000000',
                      padding: '12px',
                          cursor: 'pointer',
                      backgroundColor: '#FFFFFF',
                          textAlign: 'center',
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 'calc(100% - 20px)',
                          height: '180px',
                          overflow: 'hidden',
                          boxSizing: 'border-box'
                        }}
                      >
                        <img
                          src="/assets/gift-card asset.png"
                          alt="$20 Gift Card"
                          style={{
                            maxWidth: '130px',
                            maxHeight: '194px',
                            width: 'auto',
                            height: 'auto',
                            objectFit: 'contain',
                            display: 'block'
                          }}
                        />
                      </div>
                      <p
                        style={{
                          fontFamily: selectedBirthdayGift === 'gift-card' ? '"Futura PT Medium"' : '"Futura PT Book"',
                          color: selectedBirthdayGift === 'gift-card' ? '#EB1C24' : '#000000',
                          fontSize: '10px',
                          margin: '0',
                          textAlign: 'center',
                      textTransform: 'uppercase'
                        }}
                      >
                        $20 GIFT CARD
                      </p>
                    </div>
                    
                    {/* 200 Loyalty Points Option */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }}>
                      <div
                        onClick={() => setSelectedBirthdayGift(selectedBirthdayGift === 'points' ? '' : 'points')}
                        style={{
                          border: selectedBirthdayGift === 'points' ? '1.3px solid #EB1C24' : '1.3px solid #000000',
                          padding: '12px',
                          cursor: 'pointer',
                          backgroundColor: '#FFFFFF',
                          textAlign: 'center',
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 'calc(100% - 20px)',
                          height: '180px',
                          overflow: 'hidden',
                          boxSizing: 'border-box'
                        }}
                      >
                        <img
                          src="/assets/points-loyalty.png"
                          alt="200 Loyalty Points"
                          style={{
                            maxWidth: '148.38px',
                            maxHeight: '215.71px',
                            width: 'auto',
                            height: 'auto',
                            objectFit: 'contain',
                            display: 'block',
                            transform: 'translate(19px, -3px)'
                          }}
                        />
                  </div>
                  <p
                    style={{
                          fontFamily: selectedBirthdayGift === 'points' ? '"Futura PT Medium"' : '"Futura PT Book"',
                          color: selectedBirthdayGift === 'points' ? '#EB1C24' : '#000000',
                      fontSize: '10px',
                          margin: '0',
                          textAlign: 'center',
                      textTransform: 'uppercase'
                        }}
                      >
                        200 LOYALTY POINTS
                      </p>
                    </div>
                  </div>
                </div>
                <div className="px-0 md:px-0" style={{ marginTop: '2px', transform: 'translateY(-2px)' }}>
                  <button
                    onClick={handleSubmitBirthdayGift}
                    className="border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
                    style={{
                      borderWidth: '1.3px',
                      color: '#EB1C24',
                      fontFamily: '"Futura PT Medium"',
                      backgroundColor: '#FFFFFF'
                    }}
                    type="button"
                  >
                    SAVE SELECTION
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <ConfirmationModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onConfirm={() => setShowSuccessModal(false)}
        title="SUCCESS"
        message={successMessage}
        confirmText="OK"
        cancelText=""
      />
      
      {/* Free Gift Confirmation Modal */}
      <ConfirmationModal
        isOpen={showFreeGiftModal}
        onClose={() => setShowFreeGiftModal(false)}
        onConfirm={() => setShowFreeGiftModal(false)}
        title="SELECTION SAVED"
        message={freeGiftModalMessage}
        confirmText="CLOSE"
        cancelText=""
      />
      
      {/* Birthday Gift Confirmation Modal */}
      <ConfirmationModal
        isOpen={showBirthdayGiftModal}
        onClose={() => setShowBirthdayGiftModal(false)}
        onConfirm={() => setShowBirthdayGiftModal(false)}
        title="SELECTION SAVED"
        message={birthdayGiftModalMessage}
        confirmText="CLOSE"
        cancelText=""
      />

    </div>
    </>
  );
}

export default ConciergePage;

