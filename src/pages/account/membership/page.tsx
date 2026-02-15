import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DynamicCartIcon from '../../../components/DynamicCartIcon';
import ConfirmationModal from '../../../components/ConfirmationModal';
import { getWelcomeDiscountAmount } from '../../../constants/tiers';
import { SOCIAL_EARN_LINKS } from '../../../constants/socialLinks';
import { recordSocialClick } from '../../../utils/socialAnalytics';
import BrandMenuLinks from '../../../components/BrandMenuLinks';
import SocialMenuIcons from '../../../components/SocialMenuIcons';
import pointsHistoryIcon from '../../../assets/icons/points-history.svg?url';
import membershipIcon from '../../../assets/icons/membership-icon.svg?url';
import moreWaysIcon from '../../../assets/icons/more-ways.svg?url';
import additionalFeaturesIcon from '../../../assets/icons/additional-features.svg?url';
import { isAdminKateenaAccount } from '../../../utils/adminAuth';

const BRAND_GRAY = '#808080';
const CHART_BORDER = '0.8px solid #000';

const LOYALTY_REWARDS = [
  { type: 'free_gift' as const, label: 'FREE GIFT', detail: 'WITH PURCHASE', points: 5000 },
  { type: 'discount' as const, label: 'DISCOUNT CODE', detail: '10% OFF UNIT', points: 10000 },
  { type: 'voucher' as const, label: 'VOUCHER', detail: '1X HAIRLINE', points: 15000 },
  { type: 'digital_cash' as const, label: 'DIGITAL CASH', detail: '$100 USD', points: 20000 },
  { type: 'voucher' as const, label: 'VOUCHER', detail: '1X COLOR', points: 25000 },
  { type: 'discount' as const, label: 'DISCOUNT CODE', detail: '30% OFF UNIT', points: 30000 },
  { type: 'voucher' as const, label: 'VOUCHER', detail: '1X STYLING', points: 35000 },
  { type: 'digital_cash' as const, label: 'DIGITAL CASH', detail: '$200 USD', points: 40000 },
  { type: 'free_gift' as const, label: 'FREE GIFT', detail: 'WITH PURCHASE', points: 45000 },
  { type: 'discount' as const, label: 'DISCOUNT CODE', detail: '50% OFF UNIT', points: 50000 }
];

const EARN_TASKS = [
  { id: 'newsletter_signup', action: 'NEWSLETTER SIGN UP', points: 50 },
  { id: 'refer_friend', action: 'REFER A FRIEND', points: 100 },
  { id: 'content_review', action: 'LEAVE A CONTENT REVIEW', points: 150 },
  { id: 'photo_video_tags', action: 'TAG US ON SOCIALS', points: 200 },
  { id: 'facebook', action: 'LIKE OUR FACEBOOK', points: 250, link: SOCIAL_EARN_LINKS.facebook },
  { id: 'instagram', action: 'FOLLOW OUR INSTAGRAM', points: 250, link: SOCIAL_EARN_LINKS.instagram },
  { id: 'tiktok', action: 'FOLLOW OUR TIK TOK', points: 250, link: SOCIAL_EARN_LINKS.tiktok },
  { id: 'twitter', action: 'FOLLOW OUR TWITTER', points: 250, link: SOCIAL_EARN_LINKS.twitter }
] as const;

function MembershipPage() {
  const navigate = useNavigate();
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
  const [userData] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      try {
        const currentUser = localStorage.getItem('currentUser');
        return currentUser ? JSON.parse(currentUser) : null;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Earn-task completion: backend only. Set userData.earnedEarnTaskIds when verified: newsletter list, first referral; content_review = from reviews tab/page; photo_video_tags = from affiliate page (social tags); social tasks = tracked links + follow.
  const earnedTaskIds: string[] = Array.isArray(userData?.earnedEarnTaskIds) ? userData.earnedEarnTaskIds : [];

  // Calculate total approved affiliate points
  const calculateTotalAffiliatePoints = (): number => {
    try {
      // Get current period
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const currentPeriod = currentMonth < 6 
        ? `${currentYear}-Jan-Jun` 
        : `${currentYear}-Jul-Dec`;

      // Get user's email to find their orders
      if (!userData?.email) return 0;

      let deliveredOrders: any[] = [];

      if (isAdminKateenaAccount(userData)) {
        // Use mock data for Kateena (same as affiliate page)
        // Mock orders with approved content
        deliveredOrders = [
          {
            id: 'kateena-delivered-1',
            pointsEarned: 2000,
            pointsEarnedPeriod: currentPeriod,
            socialTags: 3,
            socialTagsPeriod: currentPeriod
          },
          {
            id: 'kateena-delivered-2',
            pointsEarned: 400,
            pointsEarnedPeriod: currentPeriod,
            socialTags: 1,
            socialTagsPeriod: currentPeriod
          },
          {
            id: 'kateena-delivered-4',
            pointsEarned: 2000,
            pointsEarnedPeriod: currentPeriod,
            socialTags: 5,
            socialTagsPeriod: currentPeriod
          },
          {
            id: 'kateena-delivered-6',
            pointsEarned: 2000,
            pointsEarnedPeriod: currentPeriod,
            socialTags: 5,
            socialTagsPeriod: currentPeriod
          }
        ];
      } else {
        // Get delivered orders from localStorage
        const userOrdersKey = `userOrders_${userData.email}`;
        const storedOrders = localStorage.getItem(userOrdersKey);
        
        if (!storedOrders) return 0;

        const orders = JSON.parse(storedOrders);
        const allOrders = [...(orders.activeOrders || []), ...(orders.pastOrders || [])];
        
        // Filter only delivered orders
        deliveredOrders = allOrders.filter((order: any) => order.status === 'DELIVERED');
      }
      
      let totalPoints = 0;
      
      deliveredOrders.forEach((order: any) => {
        // Check if points were earned in current period
        const pointsPeriod = order.pointsEarnedPeriod || order.socialTagsPeriod || '';
        if (pointsPeriod !== currentPeriod) {
          return; // Skip orders from different periods
        }

        // Calculate photo/video points (capped at 2,000)
        const photoVideoPoints = Math.min(2000, order.pointsEarned || 0);
        
        // Calculate social points (only if in current period)
        const socialTagsPeriod = order.socialTagsPeriod || '';
        const socialPoints = (socialTagsPeriod === currentPeriod) 
          ? (order.socialTags || 0) * 600 
          : 0;
        
        totalPoints += photoVideoPoints + socialPoints;
      });

      return totalPoints;
    } catch (e) {
      console.error('Error calculating affiliate points:', e);
      return 0;
    }
  };

  // Tier is based on money spent (order totals) in the current 6‑month period. Spend also earns loyalty PTS (1:1).
  const SPEND_TIER_THRESHOLDS = { SILVER: 1000, RED: 2000, BLACK: 4000 };
  // Welcome discount (digital cash) credited to account balance and used at checkout — see constants/tiers.ts

  const getCurrentPeriod = (): { start: Date; end: Date } => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    if (currentMonth < 6) {
      return { start: new Date(currentYear, 0, 1), end: new Date(currentYear, 5, 30) };
    }
    return { start: new Date(currentYear, 6, 1), end: new Date(currentYear, 11, 31) };
  };

  /** Sum of order.total in current 6‑month period (tier spend; also 1:1 loyalty PTS earned from spend). */
  const getCurrentPeriodSpending = (): number => {
    if (!userData?.email) return 0;
    try {
      const period = getCurrentPeriod();
      const userOrdersKey = `userOrders_${userData.email}`;
      const stored = localStorage.getItem(userOrdersKey);
      if (!stored) return 0;
      const orders = JSON.parse(stored);
      const allOrders = [...(orders.activeOrders || []), ...(orders.pastOrders || [])];
      let total = 0;
      allOrders.forEach((order: any) => {
        if (order.date) {
          const [month, day, year] = order.date.split('-').map(Number);
          const orderDate = new Date(year, month - 1, day);
          if (orderDate >= period.start && orderDate <= period.end) {
            total += order.total || 0;
          }
        }
      });
      return total;
    } catch {
      return 0;
    }
  };

  /** Loyalty PTS from spend (1:1 with $ in current period). Included in displayed balance so tier PTS = loyalty PTS from spend. */
  const getPointsFromSpend = (): number => getCurrentPeriodSpending();

  /** Displayed loyalty balance = stored balance + affiliate points + points earned from spend in period. */
  const getDisplayLoyaltyPoints = (): number =>
    (userData?.loyaltyPoints ?? 0) + calculateTotalAffiliatePoints() + getPointsFromSpend();

  /** Parse a date string (M-D-YYYY or YYYY-M-D) to timestamp for consistent sort. */
  const parsePointsHistoryDateToTime = (dateStr: string): number => {
    const parts = String(dateStr).split('-').map((s) => parseInt(s.trim(), 10)).filter((n) => !Number.isNaN(n));
    if (parts.length !== 3) return 0;
    const [p0, p1, p2] = parts;
    const yearFirst = p0 > 31;
    const year = yearFirst ? p0 : p2;
    const month = yearFirst ? p1 : p0;
    const day = yearFirst ? p2 : p1;
    const t = new Date(year, month - 1, day).getTime();
    return Number.isNaN(t) ? 0 : t;
  };

  /** From order.date string produce normalized M-D-YYYY for storage (so sort/display are consistent). */
  const normalizePointsHistoryDate = (dateStr: string): string => {
    const t = parsePointsHistoryDateToTime(dateStr);
    if (t === 0) return dateStr;
    const d = new Date(t);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const year = d.getFullYear();
    return `${month}-${day}-${year}`;
  };

  /** Format date for points history display: "Feb 14, 2026". */
  const formatPointsHistoryDateDisplay = (dateStr: string): string => {
    const t = parsePointsHistoryDateToTime(dateStr);
    if (t === 0) return dateStr;
    const d = new Date(t);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  /** Points history rows: PURCHASE + AFFILIATE (CONTENT + SOCIAL) from orders in current period. */
  const getPointsHistoryRows = (): { date: string; discount: string; points: string }[] => {
    if (!userData?.email) return [];
    try {
      const period = getCurrentPeriod();
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const currentPeriodStr = currentMonth < 6 ? `${currentYear}-Jan-Jun` : `${currentYear}-Jul-Dec`;
      const userOrdersKey = `userOrders_${userData.email}`;
      const stored = localStorage.getItem(userOrdersKey);
      if (!stored) return [];
      const orders = JSON.parse(stored);
      const allOrders = [...(orders.activeOrders || []), ...(orders.pastOrders || [])];
      const rows: { date: string; discount: string; points: string }[] = [];
      allOrders.forEach((order: any) => {
        if (!order.date) return;
        const orderDateMs = parsePointsHistoryDateToTime(order.date);
        if (orderDateMs === 0) return;
        const orderDate = new Date(orderDateMs);
        if (orderDate < period.start || orderDate > period.end) return;
        const dateFormatted = normalizePointsHistoryDate(order.date);
        if ((order.total || 0) > 0) {
          rows.push({
            date: dateFormatted,
            discount: 'PURCHASE',
            points: `+${Math.round(order.total).toLocaleString()} PTS`
          });
        }
        if (order.status === 'DELIVERED') {
          const pointsPeriod = order.pointsEarnedPeriod || order.socialTagsPeriod || '';
          if (pointsPeriod === currentPeriodStr) {
            const photoVideo = Math.min(2000, order.pointsEarned || 0);
            const social = (order.socialTagsPeriod === currentPeriodStr) ? (order.socialTags || 0) * 600 : 0;
            const affiliatePts = photoVideo + social;
            if (affiliatePts > 0) {
              rows.push({
                date: dateFormatted,
                discount: 'CONTENT + SOCIAL',
                points: `+${affiliatePts.toLocaleString()} PTS`
              });
            }
          }
        }
      });
      rows.sort((a, b) => parsePointsHistoryDateToTime(b.date) - parsePointsHistoryDateToTime(a.date));
      return rows;
    } catch {
      return [];
    }
  };

  // Progress toward next tier based on spend (Silver → Red → Black).
  const getNextTierProgress = () => {
    // When no one is signed in, show mock: Silver tier with 300 pts → "EARN 200 MORE TO REMAIN SILVER TIER!"
    if (!userData) {
      const mockCurrentSpend = 300;
      const mockNextTier = SPEND_TIER_THRESHOLDS.SILVER; // 1000 = remain Silver
      return {
        currentSpend: mockCurrentSpend,
        currentPoints: mockCurrentSpend,
        nextTier: mockNextTier,
        nextTierSpend: mockNextTier,
        spendRemaining: mockNextTier - mockCurrentSpend,
        progressPercent: Math.min(100, (mockCurrentSpend / mockNextTier) * 100),
        currentTierName: 'SILVER' as const,
        nextTierName: 'RED' as const
      };
    }
    if (isAdminKateenaAccount(userData)) {
      // Admin: show RED tier with 700 pts; threshold 2,000 to remain Red → "EARN 1,300 MORE TO REMAIN RED TIER!"
      const adminCurrentSpend = 700;
      const adminBarMax = SPEND_TIER_THRESHOLDS.RED; // 2000 = remain Red
      return {
        currentSpend: adminCurrentSpend,
        currentPoints: adminCurrentSpend,
        nextTier: adminBarMax,
        nextTierSpend: adminBarMax,
        spendRemaining: adminBarMax - adminCurrentSpend,
        progressPercent: (adminCurrentSpend / adminBarMax) * 100,
        currentTierName: 'RED' as const,
        nextTierName: 'BLACK' as const // still show NEXT TIER: BLACK since they're in Red
      };
    }
    const currentSpend = getCurrentPeriodSpending();
    const thresholds = [SPEND_TIER_THRESHOLDS.SILVER, SPEND_TIER_THRESHOLDS.RED, SPEND_TIER_THRESHOLDS.BLACK];
    const nextTierSpend = thresholds.find((t) => t > currentSpend) ?? null;
    const currentTierName = currentSpend >= SPEND_TIER_THRESHOLDS.BLACK ? 'BLACK' : currentSpend >= SPEND_TIER_THRESHOLDS.RED ? 'RED' : currentSpend >= SPEND_TIER_THRESHOLDS.SILVER ? 'SILVER' : null;
    if (!nextTierSpend) {
      return {
        currentSpend,
        currentPoints: currentSpend,
        nextTier: null,
        nextTierSpend: null,
        spendRemaining: 0,
        progressPercent: 100,
        currentTierName: currentTierName ?? 'BLACK',
        nextTierName: null
      };
    }
    const spendRemaining = nextTierSpend - currentSpend;
    const progressPercent = Math.min(100, (currentSpend / nextTierSpend) * 100); // pts earned count toward next tier (e.g. 1000/2000 = 50% for Silver→Red)
    const nextTierName = nextTierSpend === SPEND_TIER_THRESHOLDS.BLACK ? 'BLACK' : nextTierSpend === SPEND_TIER_THRESHOLDS.RED ? 'RED' : 'SILVER';
    return {
      currentSpend,
      currentPoints: currentSpend,
      nextTier: nextTierSpend,
      nextTierSpend,
      spendRemaining,
      pointsRemaining: spendRemaining,
      progressPercent,
      currentTierName: currentTierName ?? 'PENDING',
      nextTierName
    };
  };

  const [showPremiumView, setShowPremiumView] = useState(() => {
    // Only restore premium view state if we're coming back from checkout
    try {
      // Check if we have sessionStorage flag indicating we're returning from checkout
      const isReturningFromCheckout = sessionStorage.getItem('returningFromCheckout') === 'true';
      
      if (isReturningFromCheckout) {
        // Clear the flag after checking
        sessionStorage.removeItem('returningFromCheckout');
        return true;
      }
      
      // Default to false (rewards program card) - always start with rewards program
      return false;
    } catch (e) {
      return false;
    }
  });
  const [selectedTier, setSelectedTier] = useState<string | null>(() => {
    // Restore selected tier from localStorage if coming back from checkout
    try {
      const saved = localStorage.getItem('membershipSelectedTier');
      return saved || null;
    } catch (e) {
      return null;
    }
  });
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
  const [showLoyaltyRewards, setShowLoyaltyRewards] = useState(false);
  const [showBenefitsModal, setShowBenefitsModal] = useState(false);

  // Clear rewards card alerts when user visits rewards page (they've seen tier/subscription updates)
  useEffect(() => {
    try {
      if (!userData?.email) return;
      const { currentTierName } = getNextTierProgress();
      if (currentTierName && currentTierName !== 'PENDING') {
        localStorage.setItem(`lastKnownTier_${userData.email}`, currentTierName);
      }
      localStorage.removeItem(`subscriptionUpdate_${userData.email}`);
      window.dispatchEvent(new CustomEvent('accountCardAlertsViewed'));
    } catch (_) {}
  }, [userData?.email]);

  // Subscription tier data
  const subscriptionTiers = {
    '3months': { name: '3 MONTHS PREMIUM', price: 280 },
    '6months': { name: '6 MONTHS PREMIUM', price: 520 },
    '12months': { name: '12 MONTHS PREMIUM', price: 960 }
  };

  // Currency state - load from localStorage on mount (same as CartDropdown / shopping-bag)
  const [selectedCurrency, setSelectedCurrency] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCurrency = localStorage.getItem('selectedCurrency');
        return savedCurrency || 'USD';
      } catch (e) {
        return 'USD';
      }
    }
    return 'USD';
  });

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

  // Load selected currency from localStorage on mount
  useEffect(() => {
    const savedCurrency = localStorage.getItem('selectedCurrency');
    if (savedCurrency && currencyRates[savedCurrency as keyof typeof currencyRates]) {
      if (savedCurrency !== selectedCurrency) {
        setSelectedCurrency(savedCurrency);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save selected currency to localStorage
  useEffect(() => {
    localStorage.setItem('selectedCurrency', selectedCurrency);
  }, [selectedCurrency]);

  // Listen for currency changes from cart dropdown
  useEffect(() => {
    const handleCurrencyChange = () => {
      const savedCurrency = localStorage.getItem('selectedCurrency');
      if (savedCurrency && currencyRates[savedCurrency as keyof typeof currencyRates]) {
        setSelectedCurrency(savedCurrency);
      }
    };
    window.addEventListener('storage', handleCurrencyChange);
    const handleCustomCurrencyChange = (event: CustomEvent) => {
      const newCurrency = event.detail;
      if (newCurrency && currencyRates[newCurrency as keyof typeof currencyRates]) {
        setSelectedCurrency(newCurrency);
        localStorage.setItem('selectedCurrency', newCurrency);
      }
    };
    window.addEventListener('currencyChanged', handleCustomCurrencyChange as EventListener);
    const interval = setInterval(handleCurrencyChange, 500);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleCurrencyChange);
      window.removeEventListener('currencyChanged', handleCustomCurrencyChange as EventListener);
    };
  }, [currencyRates]);

  // Format price with currency for chart and total due
  const formatPrice = useCallback((price: number) => {
    if (price == null || isNaN(price)) {
      const currency = currencyRates[selectedCurrency as keyof typeof currencyRates] || currencyRates.USD;
      return { __html: currency.symbol + '0 ' + selectedCurrency };
    }
    const currency = currencyRates[selectedCurrency as keyof typeof currencyRates] || currencyRates.USD;
    const convertedPrice = price * currency.rate;
    return {
      __html: currency.symbol + convertedPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' ' + selectedCurrency
    };
  }, [currencyRates, selectedCurrency]);

  // Reset premium view when navigating away from membership page
  useEffect(() => {
    return () => {
      // Clear premium view state when component unmounts (navigating away)
      localStorage.removeItem('membershipShowPremiumView');
      sessionStorage.removeItem('returningFromCheckout');
    };
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
      localStorage.setItem('isSignedIn', 'false');
      localStorage.removeItem('currentUser');
      window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'false' }));
      setShowMobileMenu(false);
      navigate('/sign-in');
    } else {
      navigate('/sign-in');
    }
  };

  // Check if user has existing premium subscription
  // Includes users with subscriptionTier OR the one admin Kateena account (by email) with PREMIUM
  const hasPremiumSubscription = (userData?.subscriptionTier && userData?.membershipType === 'PREMIUM') || 
                                  (isAdminKateenaAccount(userData) && (userData?.membershipType === 'PREMIUM' || userData?.membershipType === 'Premium'));

  const handleUpgradeButtonClick = () => {
    if (showPremiumView) {
      // Check if tier is selected
      if (!selectedTier) {
        // Show validation modal
        setShowValidationModal(true);
        return;
      }
      
      // Navigate to checkout with subscription data
      const tier = subscriptionTiers[selectedTier as keyof typeof subscriptionTiers];
      const subscriptionItem = {
        id: `subscription-${selectedTier}`,
        name: tier.name, // e.g., "3 MONTHS PREMIUM", "6 MONTHS PREMIUM", "12 MONTHS PREMIUM"
        price: tier.price,
        quantity: 1,
        type: 'digital',
        subscriptionTier: selectedTier
      };

      // Store subscription item in localStorage for checkout
      localStorage.setItem('subscriptionUpgrade', JSON.stringify(subscriptionItem));
      localStorage.setItem('isSubscriptionUpgrade', 'true');
      
      // If changing subscription, mark it as a change (applies at end of current period)
      if (hasPremiumSubscription) {
        localStorage.setItem('isSubscriptionChange', 'true');
      }
      
      // Save membership page state to restore when coming back
      localStorage.setItem('membershipSelectedTier', selectedTier);
      localStorage.setItem('membershipShowPremiumView', 'true');
      sessionStorage.setItem('returningFromCheckout', 'true');
      
      navigate('/checkout/upgrade');
    } else {
      // Switch to premium view
      setShowPremiumView(true);
      setSelectedTier(null);
    }
  };

  const handleChangeSubscription = () => {
    // Show the premium chart for changing subscription
    setShowPremiumView(true);
    
    // Pre-select current subscription tier
    let currentTier = userData?.subscriptionTier;
    // For admin Kateena account only (by email), set to 12months
    if (isAdminKateenaAccount(userData) && !currentTier) {
      currentTier = '12months';
    }
    setSelectedTier(currentTier || null);
    
    // Save state to restore when coming back
    localStorage.setItem('membershipShowPremiumView', 'true');
    if (currentTier) {
      localStorage.setItem('membershipSelectedTier', currentTier);
    }
  };

  const handleCancelSubscription = () => {
    // Show confirmation modal first
    setShowCancelConfirmModal(true);
  };

  const confirmCancelSubscription = () => {
    // Cancel auto-renewal
    if (userData) {
      try {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
          const user = JSON.parse(currentUser);
          const updatedUser = {
            ...user,
            autoRenewMembership: false
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
        console.error('Error canceling subscription:', error);
      }
    }
    setShowCancelConfirmModal(false);
  };

  // Get subscription end date and format it
  const getSubscriptionEndDate = () => {
    // Check if this is the admin Kateena account (12 months from 1/4/2026)
    if (isAdminKateenaAccount(userData)) {
      const startDate = new Date('2026-01-04');
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 12);
      const month = endDate.getMonth() + 1;
      const day = endDate.getDate();
      const year = endDate.getFullYear();
      return `${month}/${day}/${year}`;
    }
    
    if (!userData?.subscriptionEndDate) return 'N/A';
    try {
      const endDate = new Date(userData.subscriptionEndDate);
      const month = endDate.getMonth() + 1; // getMonth() returns 0-11
      const day = endDate.getDate();
      return `${month}/${day}`;
    } catch (e) {
      return 'N/A';
    }
  };

  // Get subscription tier name (3, 6, or 12 MONTHS)
  const getSubscriptionTierName = () => {
    // Admin Kateena account is 12 months premium
    if (isAdminKateenaAccount(userData)) return '12 MONTH';
    
    if (!userData?.subscriptionTier) return '';
    const tier = userData.subscriptionTier;
    if (tier === '3months') return '3 MONTH';
    if (tier === '6months') return '6 MONTH';
    if (tier === '12months') return '12 MONTH';
    return '';
  };

  const handleClosePremiumView = () => {
    setShowPremiumView(false);
    setSelectedTier(null);
    // Clear saved state when user closes premium view
    localStorage.removeItem('membershipShowPremiumView');
    sessionStorage.removeItem('returningFromCheckout');
    localStorage.removeItem('membershipSelectedTier');
  };

  return (
    <div className="min-h-screen membership-page-rewards" style={{ position: 'relative' }} data-page="membership">
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
      
      {/* Scrollable Content - container has no border so rewards cards are not inside an "outer card" */}
      <div className="relative z-10" style={{ border: 'none', backgroundColor: 'transparent' }}>
        <div className="flex flex-col py-5 px-4" style={{ minWidth: '100%', maxWidth: 'none', overflow: 'visible', border: 'none', backgroundColor: 'transparent', boxShadow: 'none' }}>
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
                    onClick={() => navigate(isSignedIn ? '/account' : '/sign-in')}
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
                    onClick={() => navigate(isSignedIn ? '/wishlist' : '/sign-in')} 
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
                    onClick={() => navigate('/build-a-wig')}
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
                    REWARDS
                  </span>
                </>
              )}
            </p>

            {/* Right side icons */}
            <div className="gap-5 flex absolute" style={{ right: '17px' }}>
              <div style={{ transform: `translateX(${cartCount === 0 ? 7 : 5}px)` }}>
                <DynamicCartIcon count={cartCount} width={22} height={19} />
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

          {/* CONTENT - only wraps menu when open; rewards content is NOT inside this div (no main card) */}
            {showMobileMenu ? (
              <div
                className="flex flex-col pb-4 mb-2 w-full"
                style={{ minWidth: '100%', maxWidth: 'none', overflow: 'visible', minHeight: '560px' }}
              >
              {/* MENU CONTENT */}
              <div
                className="border border-black flex flex-col pt-6 pb-4 px-5 bg-white/60 backdrop-blur-sm w-full"
                style={{ 
                  borderWidth: '1.3px', 
                  minWidth: '100%', 
                  maxWidth: 'none', 
                  overflow: 'visible',
                  backgroundColor: 'rgba(255, 255, 255, 0.6)',
                  minHeight: '560px'
                }}
              >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', paddingTop: '20px', height: '490px', position: 'relative' }}>
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
                      ['GIFT CARD'].map((item, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => navigate('/tools/gift-card')}
                        >
                          <span style={{ 
                            fontFamily: '"Futura PT Book"',
                            fontSize: '14px',
                            color: 'black',
                            fontWeight: '500',
                            textTransform: 'uppercase',
                            transform: 'translateX(7px)'
                          }}>
                            {item}
                          </span>
                        </div>
                      ))
                    ) : mobileMenuActiveTab === 'BRAND' ? (
                      <BrandMenuLinks onClose={() => setShowMobileMenu(false)} />
                    ) : (
                      // SHOP tab with dropdown functionality
                      [
                        { label: 'UNITS', hasArrow: true, isExpandable: true, subItems: ['STRAIGHT', 'WAVY', 'CURLY'] },
                        { label: 'BOOKING', hasArrow: true, isExpandable: true, subItems: ['APPOINTMENT', 'CONSULTATION'] },
                        { label: 'BUILD-A-WIG', hasArrow: false },
                        { label: 'ORDER AUTHORIZATION FORM', hasArrow: false }
                      ].map((item, index) => (
                        <div key={index}>
                          <div 
                            className="flex items-center justify-between"
                            style={{ alignItems: 'center' }}
                          >
                            <span 
                              style={{ 
                                fontFamily: '"Futura PT Book"',
                                fontSize: '14px',
                                color: 'black',
                                fontWeight: '500',
                                textTransform: 'uppercase',
                                cursor: 'pointer',
                                transform: 'translateX(7px)'
                              }}
                              onClick={() => {
                                if (item.isExpandable) {
                                  // If UNITS is already expanded, navigate to shop/units page
                                  if (item.label === 'UNITS' && mobileMenuExpandedItems.includes(item.label)) {
                                    navigate('/shop/units');
                                  } else {
                                    // Otherwise, toggle expansion
                                    handleMobileMenuItemToggle(item.label);
                                  }
                                } else if (item.label === 'ORDER AUTHORIZATION FORM') {
                                  navigate('/shop/order-form');
                                }
                              }}
                            >
                              {item.label}
                            </span>
                            {item.hasArrow && (
                              <img
                                src="/assets/NOIR/closed-arrow.svg"
                                alt="Arrow"
                                style={{ 
                                  width: '16px', 
                                  height: '16px',
                                  transform: `${mobileMenuExpandedItems.includes(item.label) ? 'translateX(-5px) translateY(-4px) rotate(90deg)' : 'translateX(-5px) translateY(-4px) rotate(0deg)'}`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  cursor: 'pointer'
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (item.isExpandable) {
                                    handleMobileMenuItemToggle(item.label);
                                  }
                                }}
                              />
                            )}
                          </div>
                          {item.isExpandable && mobileMenuExpandedItems.includes(item.label) && item.subItems && (
                            <div className="ml-4 mt-2 space-y-2">
                              {item.subItems.map((subItem, subIndex) => (
                                <div 
                                  key={subIndex} 
                                  className="flex items-center cursor-pointer"
                                  onClick={() => {
                                    if (subItem === 'STRAIGHT') {
                                      navigate('/units/straight');
                                    } else if (subItem === 'WAVY') {
                                      navigate('/units/wavy');
                                    } else if (subItem === 'CURLY') {
                                      navigate('/units/curly');
                                    }
                                  }}
                                >
                                  <span style={{ 
                                    fontFamily: '"Futura PT Book"',
                                    fontSize: '14px',
                                    color: '#EB1C24',
                                    fontWeight: '500',
                                    textTransform: 'uppercase'
                                  }}>
                                    {subItem}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
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
                <SocialMenuIcons />
                </div>
              </div>
              </div>
            ) : (
              <>
                {/* MEMBERSHIP CONTENT - no outer wrapper; cards are direct siblings (removes extra outer div/card) */}
                {showLoyaltyRewards ? (
                  <>
                    {/* Inner card only: LOYALTY POINTS (header + points + discount codes) - no outer card wrapping this */}
                    <div className="border border-black bg-white/60 backdrop-blur-sm w-full mb-4 transition-all duration-300 ease-out" style={{ borderWidth: '1.3px', paddingTop: '20px', paddingLeft: '20px', paddingRight: '20px', paddingBottom: '16px', backgroundColor: 'rgba(255, 255, 255, 0.6)' }}>
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
                          LOYALTY POINTS
                    </h2>
                    <div className="flex items-center gap-2">
                        <img
                          src="/assets/rewards-icon.svg"
                          alt=""
                          style={{
                            width: '19.76px',
                            height: '19.76px',
                            objectFit: 'contain',
                            filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)'
                          }}
                        />
                        <img
                          src="/assets/close-icon.svg"
                          alt="Close"
                          onClick={() => setShowLoyaltyRewards(false)}
                          style={{
                            width: '16px',
                            height: '16px',
                            cursor: 'pointer',
                            filter: 'brightness(0) saturate(100%) invert(15%) sepia(95%) saturate(7404%) hue-rotate(353deg) brightness(92%) contrast(92%)'
                          }}
                        />
                    </div>
                      </div>
                      {/* LOYALTY POINTS Content - main card */}
                      <div>
                        {/* Current Points */}
                        <div style={{ textAlign: 'center', marginBottom: '12px', marginTop: '10px' }}>
                          <img src="/assets/points-icon.svg" alt="" style={{ width: '31.68px', height: '31.68px', marginTop: '20px', marginBottom: '6px', display: 'block', marginLeft: 'auto', marginRight: 'auto' }} />
                          <p
                            style={{
                              fontFamily: '"Futura PT Medium"',
                              color: BRAND_GRAY,
                              fontSize: '18px',
                              margin: '0 0 4px 0',
                              fontWeight: '500'
                            }}
                          >
                            {getDisplayLoyaltyPoints().toLocaleString()} PTS
                          </p>
                          <p
                            style={{
                              fontFamily: '"Futura PT Book"',
                              color: '#000000',
                              fontSize: '10px',
                              margin: '0 0 4px 0',
                              textTransform: 'uppercase'
                            }}
                          >
                            1 POINT FOR EVERY $1 SPENT
                          </p>
                          <p
                            style={{
                              fontFamily: '"Futura PT Book"',
                              color: '#EB1C24',
                              fontSize: '9.5px',
                              margin: '0 0 8px 0',
                              textTransform: 'uppercase'
                            }}
                          >
                            (EXCLUDES TAXES + SHIPPING FEES)
                          </p>
                          {(() => {
                              const totalPoints = getDisplayLoyaltyPoints();
                              const nextReward = LOYALTY_REWARDS.find((r) => totalPoints < r.points);
                              const progressPercent = nextReward
                                ? Math.min(100, Math.max(0, (totalPoints / nextReward.points) * 100))
                                : 100;
                              const nextLabelColor = nextReward && (nextReward.type === 'free_gift' || nextReward.type === 'voucher') ? '#EB1C24' : BRAND_GRAY;
                              return (
                                <div style={{ marginTop: '40px', paddingBottom: '20px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0' }}>
                                    <p style={{ fontFamily: '"Futura PT Book"', color: '#000000', fontSize: '10px', margin: 0, textTransform: 'uppercase' }}>
                                      NEXT REWARD: <span style={{ color: nextLabelColor, fontFamily: '"Futura PT Medium"', fontWeight: '500' }}>{nextReward ? nextReward.label : '—'}</span>
                                    </p>
                                    <p style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '10px', margin: 0, textTransform: 'uppercase' }}>
                                      {totalPoints.toLocaleString()}{nextReward ? ` / ${nextReward.points.toLocaleString()}` : ''} PTS
                                    </p>
                                  </div>
                                  <div style={{ marginTop: '8px', marginBottom: '8px' }}>
                                    <div style={{ width: '100%', height: '8px', backgroundColor: '#E5E5E5', borderRadius: '4px', overflow: 'hidden' }}>
                                      <div
                                        style={{
                                          width: `${progressPercent}%`,
                                          height: '100%',
                                          backgroundColor: '#EB1C24',
                                          borderRadius: '4px',
                                          transition: 'width 0.3s ease'
                                        }}
                                      />
                                    </div>
                                  </div>
                                  <p style={{ fontFamily: '"Futura PT Medium"', fontWeight: '500', color: BRAND_GRAY, fontSize: '10px', margin: '0', textTransform: 'uppercase' }}>
                                    {nextReward
                                      ? <>{((nextReward.points - totalPoints).toLocaleString())} MORE POINTS TO EARN {nextReward.type === 'digital_cash' ? <span style={{ color: nextLabelColor }}>{nextReward.label}</span> : <>A <span style={{ color: nextLabelColor }}>{nextReward.label}</span></>}</>
                                      : 'MAX REWARD REACHED'}
                                  </p>
                                </div>
                              );
                            })()}
                        </div>

                        {/* Rewards list */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: 0, paddingBottom: '5px' }}>
                          {LOYALTY_REWARDS.map((reward, index) => {
                            const currentPoints = getDisplayLoyaltyPoints();
                            const canRedeem = currentPoints >= reward.points;
                            const labelColor = (reward.type === 'free_gift' || reward.type === 'voucher') ? '#EB1C24' : BRAND_GRAY;
                            return (
                              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: index < LOYALTY_REWARDS.length - 1 ? '8px 0' : '8px 0 0 0', borderBottom: index < LOYALTY_REWARDS.length - 1 ? '1px solid #E5E5E5' : 'none' }}>
                                <div>
                                  <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: labelColor, margin: '0 0 2px 0', textTransform: 'uppercase', fontWeight: '500' }}>
                                    {reward.label}
                                  </p>
                                  <p style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000000', margin: '0' }}>
                                    {reward.detail} AT <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}>{reward.points.toLocaleString()} PTS</span>
                                  </p>
                                </div>
                                <button
                                  onClick={() => {
                                    if (canRedeem) {
                                      // Handle redemption logic here
                                      alert(`Redeeming ${reward.detail} for ${reward.points.toLocaleString()} points`);
                                    }
                                  }}
                                  disabled={!canRedeem}
                                  style={{
                                    fontFamily: '"Futura PT Medium"',
                                    fontSize: '10px',
                                    color: canRedeem ? '#EB1C24' : BRAND_GRAY,
                                    backgroundColor: 'transparent',
                                    border: '1.3px solid',
                                    borderColor: canRedeem ? '#EB1C24' : BRAND_GRAY,
                                    padding: '6px 12px',
                                    cursor: canRedeem ? 'pointer' : 'not-allowed',
                                    textTransform: 'uppercase',
                                    opacity: canRedeem ? 1 : 0.5
                                  }}
                                  type="button"
                                >
                                  REDEEM
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  showPremiumView ? (
                  <div
                    className="border border-black bg-white/60 backdrop-blur-sm w-full transition-all duration-300 ease-out"
                    style={{
                      borderWidth: '1.3px',
                      padding: '20px 20px 0 20px',
                      backgroundColor: 'rgba(255, 255, 255, 0.6)'
                    }}
                  >
                  {/* PREMIUM MEMBERSHIP VIEW */}
                  <>
                    {/* PREMIUM MEMBERSHIP Header */}
                    <div style={{ marginBottom: '32px' }}>
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
                          PREMIUM MEMBERSHIP
                        </h2>
                        <img
                          src="/assets/close-icon.svg"
                          alt="Close"
                          onClick={handleClosePremiumView}
                          style={{
                            width: '16px',
                            height: '16px',
                            cursor: 'pointer',
                            filter: 'brightness(0) saturate(100%) invert(15%) sepia(95%) saturate(7404%) hue-rotate(353deg) brightness(92%) contrast(92%)'
                          }}
                        />
                      </div>

                      {/* Comparison Table */}
                        <div style={{ overflowX: 'auto', marginTop: '40px', marginBottom: '38px', display: 'flex', justifyContent: 'center' }}>
                          <table style={{ width: 'max-content', borderCollapse: 'collapse', fontSize: '9px', transform: 'translateZ(0)' }}>
                            <thead>
                              <tr>
<th style={{ 
                                  fontFamily: '"Futura PT Medium"', 
                                  padding: '4px 4px 10px',
                                  textAlign: 'center',
                                  borderBottom: CHART_BORDER,
                                  borderRight: CHART_BORDER,
                                  fontWeight: '500',
                                  textTransform: 'uppercase',
                                  color: '#EB1C24',
                                  minWidth: '68px',
                                  maxWidth: '68px'
                                }}><span style={{ display: 'inline-block', marginLeft: '-12px' }}>BENEFITS</span></th>
                                <th style={{ 
                                  fontFamily: '"Futura PT Medium"', 
                                  padding: '4px 4px 10px', 
                                  textAlign: 'center', 
                                  borderBottom: CHART_BORDER,
                                  borderRight: CHART_BORDER,
                                  fontWeight: '500',
                                  textTransform: 'uppercase',
                                  minWidth: '58px',
                                  maxWidth: '58px'
                                }}>BASIC</th>
                                <th style={{ 
                                  fontFamily: '"Futura PT Medium"', 
                                  padding: '4px 4px 10px', 
                                  textAlign: 'center', 
                                  borderBottom: CHART_BORDER,
                                  borderRight: CHART_BORDER,
                                  fontWeight: '500',
                                  textTransform: 'uppercase',
                                  color: BRAND_GRAY,
                                  lineHeight: '1.25',
                                  minWidth: '58px',
                                  maxWidth: '58px'
                                }}>3 MONTHS PREMIUM</th>
                                <th style={{ 
                                  fontFamily: '"Futura PT Medium"', 
                                  padding: '4px 4px 10px', 
                                  textAlign: 'center', 
                                  borderBottom: CHART_BORDER,
                                  borderRight: CHART_BORDER,
                                  fontWeight: '500',
                                  textTransform: 'uppercase',
                                  color: BRAND_GRAY,
                                  lineHeight: '1.25',
                                  minWidth: '58px',
                                  maxWidth: '58px'
                                }}>6 MONTHS PREMIUM</th>
                                <th style={{ 
                                  fontFamily: '"Futura PT Medium"', 
                                  padding: '4px 4px 10px', 
                                  textAlign: 'center', 
                                  borderBottom: CHART_BORDER,
                                  fontWeight: '500',
                                  textTransform: 'uppercase',
                                  color: BRAND_GRAY,
                                  lineHeight: '1.25',
                                  minWidth: '62px',
                                  maxWidth: '62px'
                                }}>
                                  <span style={{ display: 'inline-block', marginLeft: '12px', textAlign: 'center' }}>
                                    <span style={{ display: 'block', whiteSpace: 'nowrap' }}>12 MONTHS</span>
                                    <span style={{ display: 'block', whiteSpace: 'nowrap' }}>PREMIUM</span>
                                  </span>
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Medium"', padding: '6px 4px', textTransform: 'uppercase', color: BRAND_GRAY, textAlign: 'center', minWidth: '68px', maxWidth: '68px', lineHeight: '1.25' }}><span style={{ display: 'inline-block', marginLeft: '-12px' }}>WELCOME DISCOUNT</span></td>
                                <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Medium"', fontSize: '10px', padding: '6px 4px', textAlign: 'center', whiteSpace: 'nowrap', lineHeight: '1.25' }}><span dangerouslySetInnerHTML={formatPrice(10)} /></td>
                                <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Medium"', fontSize: '10px', padding: '6px 4px', textAlign: 'center', whiteSpace: 'nowrap', lineHeight: '1.25' }}><span dangerouslySetInnerHTML={formatPrice(20)} /></td>
                                <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Medium"', fontSize: '10px', padding: '6px 4px', textAlign: 'center', whiteSpace: 'nowrap', lineHeight: '1.25' }}><span dangerouslySetInnerHTML={formatPrice(40)} /></td>
                                <td style={{ borderBottom: CHART_BORDER, fontFamily: '"Futura PT Medium"', fontSize: '10px', padding: '6px 4px', textAlign: 'center', whiteSpace: 'nowrap', lineHeight: '1.25' }}><span style={{ display: 'inline-block', marginLeft: '12px' }}><span dangerouslySetInnerHTML={formatPrice(60)} /></span></td>
                              </tr>
                              <tr>
                                <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Medium"', padding: '6px 4px', textTransform: 'uppercase', color: BRAND_GRAY, textAlign: 'center', minWidth: '68px', maxWidth: '68px', lineHeight: '1.25' }}><span style={{ display: 'inline-block', marginLeft: '-12px' }}>BIRTHDAY GIFT</span></td>
                                <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <img src="/assets/premium-x.svg" alt="Not included" style={{ width: '15.2px', height: '15.2px' }} />
                                  </div>
                                </td>
                                <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <img src="/assets/premium-check.svg" alt="Included" style={{ width: '10px', height: '10px' }} />
                                  </div>
                                </td>
                                <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <img src="/assets/premium-check.svg" alt="Included" style={{ width: '10px', height: '10px' }} />
                                  </div>
                                </td>
                                <td style={{ borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <span style={{ display: 'inline-block', marginLeft: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                      <img src="/assets/premium-check.svg" alt="Included" style={{ width: '10px', height: '10px' }} />
                                    </div>
                                  </span>
                                </td>
                              </tr>
                              <tr>
                                <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Medium"', padding: '6px 4px', textTransform: 'uppercase', color: BRAND_GRAY, textAlign: 'center', minWidth: '68px', maxWidth: '68px', lineHeight: '1.25' }}><span style={{ display: 'inline-block', marginLeft: '-12px' }}>REDUCED SHIPPING</span></td>
                                <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <img src="/assets/premium-x.svg" alt="Not included" style={{ width: '15.2px', height: '15.2px' }} />
                                  </div>
                                </td>
                                <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <img src="/assets/premium-check.svg" alt="Included" style={{ width: '10px', height: '10px' }} />
                                  </div>
                                </td>
                                <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <img src="/assets/premium-check.svg" alt="Included" style={{ width: '10px', height: '10px' }} />
                                  </div>
                                </td>
                                <td style={{ borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <span style={{ display: 'inline-block', marginLeft: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                      <img src="/assets/premium-check.svg" alt="Included" style={{ width: '10px', height: '10px' }} />
                                    </div>
                                  </span>
                                </td>
                              </tr>
                              <tr>
                                <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Medium"', padding: '6px 4px', textTransform: 'uppercase', color: BRAND_GRAY, textAlign: 'center', minWidth: '68px', maxWidth: '68px', lineHeight: '1.25' }}><span style={{ display: 'inline-block', marginLeft: '-12px' }}>PREMIUM<br />BUILD-A-WIG</span></td>
                                <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <img src="/assets/premium-x.svg" alt="Not included" style={{ width: '15.2px', height: '15.2px' }} />
                                  </div>
                                </td>
                                <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <img src="/assets/premium-check.svg" alt="Included" style={{ width: '10px', height: '10px' }} />
                                  </div>
                                </td>
                                <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <img src="/assets/premium-check.svg" alt="Included" style={{ width: '10px', height: '10px' }} />
                                  </div>
                                </td>
                                <td style={{ borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <span style={{ display: 'inline-block', marginLeft: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                      <img src="/assets/premium-check.svg" alt="Included" style={{ width: '10px', height: '10px' }} />
                                    </div>
                                  </span>
                                </td>
                              </tr>
                              <tr>
                                <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Medium"', padding: '6px 4px', textTransform: 'uppercase', color: BRAND_GRAY, textAlign: 'center', minWidth: '68px', maxWidth: '68px', lineHeight: '1.25' }}><span style={{ display: 'inline-block', marginLeft: '-12px' }}>LOUNGE ACCESS</span></td>
                                <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <img src="/assets/premium-x.svg" alt="Not included" style={{ width: '15.2px', height: '15.2px' }} />
                                  </div>
                                </td>
                                <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <img src="/assets/premium-check.svg" alt="Included" style={{ width: '10px', height: '10px' }} />
                                  </div>
                                </td>
                                <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <img src="/assets/premium-check.svg" alt="Included" style={{ width: '10px', height: '10px' }} />
                                  </div>
                                </td>
                                <td style={{ borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <span style={{ display: 'inline-block', marginLeft: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                      <img src="/assets/premium-check.svg" alt="Included" style={{ width: '10px', height: '10px' }} />
                                    </div>
                                  </span>
                                </td>
                              </tr>
                              <tr>
                                <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Medium"', padding: '6px 4px', textTransform: 'uppercase', color: BRAND_GRAY, textAlign: 'center', minWidth: '68px', maxWidth: '68px', lineHeight: '1.25' }}><span style={{ display: 'inline-block', marginLeft: '-12px' }}>VIP SUPPORT</span></td>
                                <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <img src="/assets/premium-x.svg" alt="Not included" style={{ width: '15.2px', height: '15.2px' }} />
                                  </div>
                                </td>
                                <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <img src="/assets/premium-check.svg" alt="Included" style={{ width: '10px', height: '10px' }} />
                                  </div>
                                </td>
                                <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <img src="/assets/premium-check.svg" alt="Included" style={{ width: '10px', height: '10px' }} />
                                  </div>
                                </td>
                                <td style={{ borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <span style={{ display: 'inline-block', marginLeft: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                      <img src="/assets/premium-check.svg" alt="Included" style={{ width: '10px', height: '10px' }} />
                                    </div>
                                  </span>
                                </td>
                              </tr>
                              <tr>
                                <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Medium"', padding: '6px 4px', textTransform: 'uppercase', color: BRAND_GRAY, textAlign: 'center', minWidth: '68px', maxWidth: '68px', lineHeight: '1.25' }}><span style={{ display: 'inline-block', marginLeft: '-12px' }}>PRIORITY BOOKING</span></td>
                                <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <img src="/assets/premium-x.svg" alt="Not included" style={{ width: '15.2px', height: '15.2px' }} />
                                  </div>
                                </td>
                                <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <img src="/assets/premium-check.svg" alt="Included" style={{ width: '10px', height: '10px' }} />
                                  </div>
                                </td>
                                <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <img src="/assets/premium-check.svg" alt="Included" style={{ width: '10px', height: '10px' }} />
                                  </div>
                                </td>
                                <td style={{ borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <span style={{ display: 'inline-block', marginLeft: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                      <img src="/assets/premium-check.svg" alt="Included" style={{ width: '10px', height: '10px' }} />
                                    </div>
                                  </span>
                                </td>
                              </tr>
                              <tr>
                                <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Medium"', padding: '6px 4px', textTransform: 'uppercase', color: BRAND_GRAY, textAlign: 'center', minWidth: '68px', maxWidth: '68px', lineHeight: '1.25' }}><span style={{ display: 'inline-block', marginLeft: '-12px' }}>REWARDS<br />+ PRIZES</span></td>
                                <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <img src="/assets/premium-x.svg" alt="Not included" style={{ width: '15.2px', height: '15.2px' }} />
                                  </div>
                                </td>
                                <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <img src="/assets/premium-x.svg" alt="Not included" style={{ width: '15.2px', height: '15.2px' }} />
                                  </div>
                                </td>
                                <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <img src="/assets/premium-x.svg" alt="Not included" style={{ width: '15.2px', height: '15.2px' }} />
                                  </div>
                                </td>
                                <td style={{ borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <span style={{ display: 'inline-block', marginLeft: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                      <img src="/assets/premium-check.svg" alt="Included" style={{ width: '10px', height: '10px' }} />
                                    </div>
                                  </span>
                                </td>
                              </tr>
                              <tr>
                                <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Medium"', padding: '6px 4px', textTransform: 'uppercase', color: BRAND_GRAY, textAlign: 'center', minWidth: '68px', maxWidth: '68px', lineHeight: '1.25' }}><span style={{ display: 'inline-block', marginLeft: '-12px' }}>2X LOYALTY POINTS</span></td>
                                <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <img src="/assets/premium-x.svg" alt="Not included" style={{ width: '15.2px', height: '15.2px' }} />
                                  </div>
                                </td>
                                <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <img src="/assets/premium-x.svg" alt="Not included" style={{ width: '15.2px', height: '15.2px' }} />
                                  </div>
                                </td>
                                <td style={{ borderRight: CHART_BORDER, borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <img src="/assets/premium-x.svg" alt="Not included" style={{ width: '15.2px', height: '15.2px' }} />
                                  </div>
                                </td>
                                <td style={{ borderBottom: CHART_BORDER, fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <span style={{ display: 'inline-block', marginLeft: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                      <img src="/assets/premium-check.svg" alt="Included" style={{ width: '10px', height: '10px' }} />
                                    </div>
                                  </span>
                                </td>
                              </tr>
                              <tr>
                                <td style={{ borderRight: CHART_BORDER, fontFamily: '"Futura PT Medium"', padding: '8px 4px 0', textTransform: 'uppercase', fontWeight: '500', verticalAlign: 'top', color: '#EB1C24', textAlign: 'center', minWidth: '68px', maxWidth: '68px', fontSize: '10px' }}><span style={{ display: 'inline-block', marginLeft: '-12px' }}>PRICE</span></td>
                                <td style={{ borderRight: CHART_BORDER, fontFamily: '"Futura PT Medium"', padding: '8px 4px 0', textAlign: 'center', verticalAlign: 'top', fontSize: '10px' }}>FREE</td>
                                <td style={{ borderRight: CHART_BORDER, fontFamily: '"Futura PT Medium"', padding: '8px 4px 0', textAlign: 'center', verticalAlign: 'top', fontSize: '10px' }}>
                                  <span dangerouslySetInnerHTML={formatPrice(280)} />
                                  <button
                                    onClick={() => {
                                      // If changing subscription, don't allow deselection of current tier
                                      if (hasPremiumSubscription && selectedTier === '3months') {
                                        return; // Can't deselect current subscription
                                      }
                                      setSelectedTier(selectedTier === '3months' ? null : '3months');
                                    }}
                                    className="font-futura w-full text-center py-1 text-[10px] font-semibold bg-transparent cursor-pointer"
                                    style={{ 
                                      border: 'none',
                                      color: selectedTier === '3months' ? '#EB1C24' : BRAND_GRAY,
                                      marginTop: '2px',
                                      fontFamily: '"Futura PT Medium"',
                                      backgroundColor: 'transparent',
                                      textTransform: 'uppercase',
                                      display: 'block',
                                      width: '100%',
                                      padding: '4px 0'
                                    }}
                                    type="button"
                                  >
                                    {selectedTier === '3months' ? (hasPremiumSubscription ? 'SELECTED' : 'DESELECT') : 'SELECT'}
                                  </button>
                                </td>
                                <td style={{ borderRight: CHART_BORDER, fontFamily: '"Futura PT Medium"', padding: '8px 4px 0', textAlign: 'center', verticalAlign: 'top', fontSize: '10px' }}>
                                  <span dangerouslySetInnerHTML={formatPrice(520)} />
                                  <button
                                    onClick={() => {
                                      // If changing subscription, don't allow deselection of current tier
                                      if (hasPremiumSubscription && selectedTier === '6months') {
                                        return; // Can't deselect current subscription
                                      }
                                      setSelectedTier(selectedTier === '6months' ? null : '6months');
                                    }}
                                    className="font-futura w-full text-center py-1 text-[10px] font-semibold bg-transparent cursor-pointer"
                                    style={{ 
                                      border: 'none',
                                      color: selectedTier === '6months' ? '#EB1C24' : BRAND_GRAY,
                                      marginTop: '2px',
                                      fontFamily: '"Futura PT Medium"',
                                      backgroundColor: 'transparent',
                                      textTransform: 'uppercase',
                                      display: 'block',
                                      width: '100%',
                                      padding: '4px 0'
                                    }}
                                    type="button"
                                  >
                                    {selectedTier === '6months' ? (hasPremiumSubscription ? 'SELECTED' : 'DESELECT') : 'SELECT'}
                                  </button>
                                </td>
                                <td style={{ fontFamily: '"Futura PT Medium"', padding: '8px 4px 0', textAlign: 'center', verticalAlign: 'top', fontSize: '10px' }}>
                                  <span style={{ display: 'inline-block', marginLeft: '12px' }}>
                                    <span dangerouslySetInnerHTML={formatPrice(960)} />
                                    <button
                                      onClick={() => {
                                        // If changing subscription, don't allow deselection of current tier
                                        if (hasPremiumSubscription && selectedTier === '12months') {
                                          return; // Can't deselect current subscription
                                        }
                                        setSelectedTier(selectedTier === '12months' ? null : '12months');
                                      }}
                                      className="font-futura w-full text-center py-1 text-[10px] font-semibold bg-transparent cursor-pointer"
                                      style={{ 
                                        border: 'none',
                                        color: selectedTier === '12months' ? '#EB1C24' : BRAND_GRAY,
                                        marginTop: '2px',
                                        fontFamily: '"Futura PT Medium"',
                                        backgroundColor: 'transparent',
                                        textTransform: 'uppercase',
                                        display: 'block',
                                        width: '100%',
                                        padding: '4px 0'
                                      }}
                                      type="button"
                                    >
                                      {selectedTier === '12months' ? (hasPremiumSubscription ? 'SELECTED' : 'DESELECT') : 'SELECT'}
                                    </button>
                                  </span>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {/* Total Due Today - negative margin pulls card bottom up without changing button distance (12px) from card */}
                        <div style={{ textAlign: 'center', marginBottom: '-10px', paddingBottom: '0' }}>
                          <p
                            style={{
                              fontFamily: '"Futura PT Medium"',
                              color: '#EB1C24',
                              fontSize: '11px',
                              margin: '0 0 4px 0',
                              textTransform: 'uppercase',
                              fontWeight: '500'
                            }}
                          >
                            TOTAL DUE TODAY
                          </p>
                          <p
                            style={{
                              fontFamily: '"Futura PT Medium"',
                              color: '#808080',
                              fontSize: '14px',
                              margin: '0',
                              paddingBottom: '0',
                              lineHeight: '1.2',
                              fontWeight: '500'
                            }}
                          >
                            <span dangerouslySetInnerHTML={formatPrice(selectedTier ? subscriptionTiers[selectedTier as keyof typeof subscriptionTiers].price : 0)} />
                          </p>
                        </div>
                      </div>
                    </>
                  </div>
                  ) : showBenefitsModal ? (
                  <div
                    className="border border-black bg-white/60 backdrop-blur-sm w-full transition-all duration-300 ease-out flex flex-col overflow-hidden"
                    style={{
                      borderWidth: '1.3px',
                      padding: '20px 20px 20px 20px',
                      backgroundColor: 'rgba(255, 255, 255, 0.6)',
                      minHeight: '560px',
                      height: '560px',
                      maxHeight: '560px'
                    }}
                  >
                    <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '12px', flexShrink: 0 }}>
                      <h2 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '12px', fontWeight: '500', margin: 0, textTransform: 'uppercase' }}>
                        TIER BENEFITS & HOW IT WORKS
                      </h2>
                      <img
                        src="/assets/close-icon.svg"
                        alt="Close"
                        onClick={() => setShowBenefitsModal(false)}
                        style={{
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer',
                          filter: 'brightness(0) saturate(100%) invert(15%) sepia(95%) saturate(7404%) hue-rotate(353deg) brightness(92%) contrast(92%)'
                        }}
                      />
                    </div>
                    <div style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', lineHeight: 1.5, flex: 1, overflowY: 'auto', minHeight: 0, textTransform: 'uppercase' }}>
                      <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', margin: '0 0 6px 0', textTransform: 'uppercase' }}>INTRO BENEFITS (ONE-TIME PER ACCOUNT)</p>
                      <p style={{ margin: '0 0 8px 0' }}>Once you reach a tier and collect its intro benefits, they do not repeat.</p>
                      <p style={{ margin: '4px 0 2px 0', paddingLeft: '8px', borderLeft: '3px solid #808080' }}><span style={{ fontFamily: '"Futura PT Medium"', color: BRAND_GRAY }}>SILVER:</span> Welcome discount, 50 loyalty points</p>
                      <p style={{ margin: '4px 0 2px 0', paddingLeft: '8px', borderLeft: '3px solid #EB1C24' }}><span style={{ fontFamily: '"Futura PT Book"', color: '#EB1C24' }}>RED:</span> Welcome discount, 1x Color Voucher, 1x Hairline Voucher, 500 loyalty points</p>
                      <p style={{ margin: '4px 0 8px 0', paddingLeft: '8px', borderLeft: '3px solid #000' }}><span style={{ fontFamily: '"Futura PT Medium"', color: '#000000' }}>BLACK:</span> Welcome discount, 1x Color Voucher, 1x Hairline Voucher, 1x Styling Voucher, 1,000 loyalty points</p>
                      <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', margin: '12px 0 6px 0', textTransform: 'uppercase' }}>RECURRING PERKS (EVERY 6-MONTH CYCLE)</p>
                      <p style={{ margin: '0 0 2px 0' }}><strong>All tiers:</strong> Member discount (Silver 5%, Red 10%, Black 15%); 1x complimentary consultation per year.</p>
                      <p style={{ margin: '6px 0 2px 0' }}><strong>Red:</strong> 1.25x loyalty points on purchases. <strong>Black:</strong> 1.5x loyalty points on purchases.</p>
                      <p style={{ margin: '6px 0 8px 0' }}><strong>Black only:</strong> Annual Black tier gift; status protection (stay Black when short on points, 1x per year).</p>
                      <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', margin: '12px 0 6px 0', textTransform: 'uppercase' }}>HOW IT WORKS</p>
                      <p style={{ margin: 0 }}>Tiers run in 6-month cycles. Earn points from purchases to unlock or keep a tier. Hit the threshold (1,000 Silver, 2,000 Red, 4,000 Black) by period end to keep that tier and its perks for the next cycle. Intro benefits unlock once per account; recurring perks apply each cycle you maintain or reach that tier.</p>
                      <p style={{ margin: '10px 0 0 0', fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#000000' }}><strong>Premium stacks with your tier.</strong> Tier perks are earned by spend (e.g. Red 1.25x and Black 1.5x points). A Premium subscription adds 2x points plus lounge access, fast-track support, and more—so Black + Premium gives you the most.</p>
                    </div>
                  </div>
                  ) : (
                    <>
                      {/* REGULAR MEMBERSHIP CONTENT - cards outside any main card (concierge style) */}
                      {/* Card 1: LOYALTY POINTS only */}
                <div className="border border-black bg-white/60 backdrop-blur-sm w-full mb-4 transition-all duration-300 ease-out" style={{ borderWidth: '1.3px', paddingTop: '20px', paddingLeft: '20px', paddingRight: '20px', paddingBottom: '16px', backgroundColor: 'rgba(255, 255, 255, 0.6)' }}>
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
                      LOYALTY POINTS
                    </h2>
                    <img
                      src="/assets/rewards-icon.svg"
                      alt=""
                      style={{
                        width: '19.76px',
                        height: '19.76px',
                        objectFit: 'contain',
                        filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)'
                      }}
                    />
                  </div>

                  {/* Balance + discount codes (no inner border) */}
                  <div>
                        {/* Current Points */}
                            <div style={{ textAlign: 'center', marginBottom: '12px', marginTop: '10px' }}>
                              <img src="/assets/points-icon.svg" alt="" style={{ width: '31.68px', height: '31.68px', marginTop: '20px', marginBottom: '6px', display: 'block', marginLeft: 'auto', marginRight: 'auto' }} />
                              <p
                                style={{
                                  fontFamily: '"Futura PT Medium"',
                                  color: BRAND_GRAY,
                                  fontSize: '18px',
                                  margin: '0 0 4px 0',
                                  fontWeight: '500'
                                }}
                              >
                                {(() => {
                                  return getDisplayLoyaltyPoints().toLocaleString();
                                })()} PTS
                              </p>
                              <p
                                style={{
fontFamily: '"Futura PT Book"',
                                color: '#000000',
                                fontSize: '10px',
                                margin: '0 0 4px 0',
                                textTransform: 'uppercase'
                              }}
                            >
                              1 POINT FOR EVERY $1 SPENT
                              </p>
                              <p
                                style={{
                                  fontFamily: '"Futura PT Book"',
                                  color: '#EB1C24',
                                  fontSize: '9.5px',
                                  margin: '0 0 8px 0',
                                  textTransform: 'uppercase'
                                }}
                              >
                                (EXCLUDES TAXES + SHIPPING FEES)
                              </p>
                              {(() => {
                                  const totalPoints = getDisplayLoyaltyPoints();
                                  const nextReward = LOYALTY_REWARDS.find((r) => totalPoints < r.points);
                                  const progressPercent = nextReward
                                    ? Math.min(100, Math.max(0, (totalPoints / nextReward.points) * 100))
                                    : 100;
                                  const nextLabelColor = nextReward && (nextReward.type === 'free_gift' || nextReward.type === 'voucher') ? '#EB1C24' : BRAND_GRAY;
                                  return (
                                    <div style={{ marginTop: '40px', paddingBottom: '20px' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0' }}>
                                        <p style={{ fontFamily: '"Futura PT Book"', color: '#000000', fontSize: '10px', margin: 0, textTransform: 'uppercase' }}>
                                          NEXT REWARD: <span style={{ color: nextLabelColor, fontFamily: '"Futura PT Medium"', fontWeight: '500' }}>{nextReward ? nextReward.label : '—'}</span>
                                        </p>
                                        <p style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '10px', margin: 0, textTransform: 'uppercase' }}>
                                          {totalPoints.toLocaleString()}{nextReward ? ` / ${nextReward.points.toLocaleString()}` : ''} PTS
                                        </p>
                                      </div>
                                      <div style={{ marginTop: '8px', marginBottom: '8px' }}>
                                        <div style={{ width: '100%', height: '8px', backgroundColor: '#E5E5E5', borderRadius: '4px', overflow: 'hidden' }}>
                                          <div
                                            style={{
                                              width: `${progressPercent}%`,
                                              height: '100%',
                                              backgroundColor: '#EB1C24',
                                              borderRadius: '4px',
                                              transition: 'width 0.3s ease'
                                            }}
                                          />
                                        </div>
                                      </div>
                                      <p style={{ fontFamily: '"Futura PT Medium"', fontWeight: '500', color: BRAND_GRAY, fontSize: '10px', margin: '0', textTransform: 'uppercase' }}>
                                        {nextReward
                                          ? <>{((nextReward.points - totalPoints).toLocaleString())} MORE POINTS TO EARN {nextReward.type === 'digital_cash' ? <span style={{ color: nextLabelColor }}>{nextReward.label}</span> : <>A <span style={{ color: nextLabelColor }}>{nextReward.label}</span></>}</>
                                          : 'MAX REWARD REACHED'}
                                      </p>
                                    </div>
                                  );
                                })()}
                            </div>

                            {/* Rewards list */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: 0, paddingBottom: '5px' }}>
                              {LOYALTY_REWARDS.map((reward, index) => {
                                const currentPoints = getDisplayLoyaltyPoints();
                                const canRedeem = currentPoints >= reward.points;
                                const labelColor = (reward.type === 'free_gift' || reward.type === 'voucher') ? '#EB1C24' : BRAND_GRAY;
                                return (
                                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: index < LOYALTY_REWARDS.length - 1 ? '8px 0' : '8px 0 0 0', borderBottom: index < LOYALTY_REWARDS.length - 1 ? '1px solid #E5E5E5' : 'none' }}>
                                    <div>
                                      <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: labelColor, margin: '0 0 2px 0', textTransform: 'uppercase', fontWeight: '500' }}>
                                        {reward.label}
                                      </p>
                                      <p style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000000', margin: '0' }}>
{reward.detail} AT <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}>{reward.points.toLocaleString()} PTS</span>
                                        </p>
                                    </div>
                                    <button
                                      onClick={() => {
                                        if (canRedeem) {
                                          // Handle redemption logic here
                                          alert(`Redeeming ${reward.detail} for ${reward.points.toLocaleString()} points`);
                                        }
                                      }}
                                      disabled={!canRedeem}
                                      style={{
                                        fontFamily: '"Futura PT Medium"',
                                        fontSize: '10px',
                                        color: canRedeem ? '#EB1C24' : BRAND_GRAY,
                                        backgroundColor: 'transparent',
                                        border: '1.3px solid',
                                        borderColor: canRedeem ? '#EB1C24' : BRAND_GRAY,
                                        padding: '6px 12px',
                                        cursor: canRedeem ? 'pointer' : 'not-allowed',
                                        textTransform: 'uppercase',
                                        opacity: canRedeem ? 1 : 0.5
                                      }}
                                      type="button"
                                    >
                                      REDEEM
                                    </button>
                                  </div>
                                );
                              })}
                        </div>
                  </div>
                </div>

                {/* Points History - Card */}
                        <div className="bg-white/60 backdrop-blur-sm border border-black mb-4" style={{ borderWidth: '1.3px', padding: '16px' }}>
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
                              POINTS HISTORY
                            </p>
                            <img src={pointsHistoryIcon} alt="" style={{ width: '16px', height: '16px', flexShrink: 0, objectFit: 'contain' }} />
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', width: '100%', fontSize: '10px', textTransform: 'uppercase', marginBottom: '8px', fontFamily: '"Futura PT Medium"', fontWeight: '500', color: '#000000' }}>
                            <span style={{ flex: '1 1 0', minWidth: 0, textAlign: 'left' }}>DATE</span>
                            <span style={{ flex: '1 1 0', minWidth: 0, textAlign: 'center' }}>REWARD</span>
                            <span style={{ flex: '1 1 0', minWidth: 0, textAlign: 'right' }}>POINTS</span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {(() => {
                              const pointsHistoryRows = getPointsHistoryRows();
                              return pointsHistoryRows.length === 0 ? (
                                <p style={{ fontFamily: '"Futura PT Medium"', fontWeight: '500', fontSize: '10px', color: BRAND_GRAY, margin: '6px 0', textTransform: 'uppercase', textAlign: 'center' }}>
                                  YOU HAVEN'T REDEEMED ANY POINTS YET.
                                </p>
                              ) : pointsHistoryRows.map((row, i) => (
                              <div key={i} style={{ display: 'flex', alignItems: 'center', width: '100%', fontSize: '10px', textTransform: 'uppercase' }}>
                                <span style={{ flex: '1 1 0', minWidth: 0, textAlign: 'left', color: '#000000', fontFamily: '"Futura PT Book"' }}>{formatPointsHistoryDateDisplay(row.date)}</span>
                                <span style={{ flex: '1 1 0', minWidth: 0, textAlign: 'center', color: '#808080', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}>{row.discount}</span>
                                <span style={{ flex: '1 1 0', minWidth: 0, textAlign: 'right', color: row.points.startsWith('+') ? '#16a34a' : '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}>{row.points}</span>
                              </div>
                            ));
                            })()}
                          </div>
                        </div>

                {/* Card 2: MEMBERSHIP STATUS */}
                <div className="bg-white/60 backdrop-blur-sm border border-black mb-4" style={{ borderWidth: '1.3px', padding: '16px' }}>
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
                      MEMBERSHIP STATUS
                    </p>
                    <img src={membershipIcon} alt="" style={{ width: '18px', height: '18px', flexShrink: 0, objectFit: 'contain' }} />
                  </div>
                  <div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                    <p
                                      style={{
                                        fontFamily: '"Futura PT Book"',
                                        color: '#000000',
                                        fontSize: '10px',
                                        margin: 0,
                                        textTransform: 'uppercase'
                                      }}
                                    >
                                      CURRENT TIER: <span style={{ color: (() => { const t = getNextTierProgress().currentTierName; return t === 'RED' ? '#EB1C24' : t === 'BLACK' ? '#000000' : BRAND_GRAY; })(), fontFamily: '"Futura PT Medium"' }}>{(() => getNextTierProgress().currentTierName)()}</span>
                                    </p>
                                    <p
                                      style={{
                                        fontFamily: '"Futura PT Medium"',
                                        color: BRAND_GRAY,
                                        fontSize: '9px',
                                        margin: 0,
                                        textTransform: 'uppercase'
                                      }}
                                    >
                                      {(() => {
                                        const { start, end } = getCurrentPeriod();
                                        const startStr = start.toLocaleString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
                                        const endStr = end.toLocaleString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
                                        return `${startStr} - ${endStr}`;
                                      })()}
                                    </p>
                                  </div>
                                  <p
                                    style={{
                                      fontFamily: '"Futura PT Book"',
                                      color: '#000000',
                                      fontSize: '10px',
                                      margin: '16px 0 4px 0',
                                      textTransform: 'uppercase'
                                    }}
                                  >
                                    {(() => {
                                      const t = getNextTierProgress().currentTierName;
                                      const welcomeAmount = getWelcomeDiscountAmount(t);
                                      if (t === 'PENDING') return <>REACH SILVER TO UNLOCK TIER BENEFITS!</>;
                                      if (t === 'BLACK') return <><span data-welcome-discount-amount={welcomeAmount} aria-hidden style={{ display: 'none' }} />BENEFITS INCLUDE: WELCOME DISCOUNT, 1X COLOR VOUCHER <br />1X HAIRLINE VOUCHER, 1X STYLING VOUCHER, 1,000 LOYALTY POINTS</>;
                                      if (t === 'RED') return <><span data-welcome-discount-amount={welcomeAmount} aria-hidden style={{ display: 'none' }} />BENEFITS INCLUDE: WELCOME DISCOUNT, 1X COLOR VOUCHER <br />1X HAIRLINE VOUCHER, 500 LOYALTY POINTS</>;
                                      return <><span data-welcome-discount-amount={welcomeAmount} aria-hidden style={{ display: 'none' }} />BENEFITS INCLUDE: WELCOME DISCOUNT, 50 LOYALTY POINTS</>;
                                    })()}
                                  </p>
                                  <div style={{ marginBottom: '24px' }}>
                                    <button
                                      type="button"
                                      onClick={() => setShowBenefitsModal((prev) => !prev)}
                                      style={{
                                        fontFamily: '"Futura PT Medium"',
                                        color: '#EB1C24',
                                        fontSize: '10px',
                                        margin: 0,
                                        textTransform: 'uppercase',
                                        textAlign: 'left',
                                        background: 'none',
                                        border: 'none',
                                        padding: 0,
                                        cursor: 'pointer',
                                        display: 'block'
                                      }}
                                    >
                                      EXPLORE ALL BENEFITS
                                    </button>
                                  </div>
                                  {(() => {
                                const { currentSpend, spendRemaining, progressPercent, nextTier, nextTierName, currentTierName } = getNextTierProgress();
                                const nextTierColor = nextTierName === 'BLACK' ? '#000000' : nextTierName === 'SILVER' ? BRAND_GRAY : '#EB1C24';
                                const tierLabel = (() => {
                                  // Black tier reached threshold for next cycle: no next tier to unlock
                                  if (nextTier == null && currentTierName === 'BLACK') {
                                    return <>YOU'VE EARNED ENOUGH POINTS TO REMAIN <span style={{ color: '#000000', fontFamily: '"Futura PT Medium"' }}>BLACK</span> TIER!</>;
                                  }
                                  if (nextTier == null) return null;
                                  // Have they reached the points needed to keep their current tier this cycle?
                                  const hasSecuredCurrentTier = currentTierName === 'SILVER' && currentSpend >= SPEND_TIER_THRESHOLDS.SILVER
                                    || currentTierName === 'RED' && currentSpend >= SPEND_TIER_THRESHOLDS.RED
                                    || currentTierName === 'BLACK' && currentSpend >= SPEND_TIER_THRESHOLDS.BLACK;
                                  if (hasSecuredCurrentTier) {
                                    return <>EARN <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"' }}>{spendRemaining.toLocaleString()}</span> MORE POINTS TO UNLOCK <span style={{ color: nextTierColor, fontFamily: '"Futura PT Medium"' }}>{nextTierName}</span> TIER!</>;
                                  }
                                  // Not yet secured: show remain for the tier they're working toward (Silver if PENDING)
                                  const remainTier = currentTierName === 'PENDING' ? 'SILVER' : currentTierName;
                                  const remainTierColor = remainTier === 'BLACK' ? '#000000' : remainTier === 'SILVER' ? BRAND_GRAY : '#EB1C24';
                                  const remainThreshold = remainTier === 'SILVER' ? SPEND_TIER_THRESHOLDS.SILVER : remainTier === 'RED' ? SPEND_TIER_THRESHOLDS.RED : SPEND_TIER_THRESHOLDS.BLACK;
                                  const remainPoints = Math.max(0, remainThreshold - currentSpend);
                                  return <>EARN <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"' }}>{remainPoints.toLocaleString()}</span> MORE POINTS TO REMAIN <span style={{ color: remainTierColor, fontFamily: '"Futura PT Medium"' }}>{remainTier}</span> TIER!</>;
                                })();
                                return (
                                  <>
                                    <div style={{ marginTop: '12px' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0' }}>
                                        {/* Only Black (top tier) has no next tier; Silver and Red always show NEXT TIER */}
                                        {currentTierName !== 'BLACK' && nextTierName != null ? (
                                          <p style={{ fontFamily: '"Futura PT Book"', color: '#000000', fontSize: '10px', margin: 0, textTransform: 'uppercase' }}>
                                            NEXT TIER: <span style={{ color: nextTierColor, fontFamily: '"Futura PT Medium"' }}>{nextTierName}</span>
                                          </p>
                                        ) : <span />}
                                        <p style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '10px', margin: 0, textTransform: 'uppercase' }}>
                                          {nextTier != null
                                            ? `${currentSpend.toLocaleString()}/${nextTier.toLocaleString()} PTS`
                                            : `${currentSpend.toLocaleString()} PTS`}
                                        </p>
                                      </div>
                                    </div>
                                    <div style={{ marginTop: '8px', marginBottom: '8px' }}>
                                      <div style={{ width: '100%', height: '8px', backgroundColor: '#E5E5E5', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div
                                          style={{
                                            width: `${progressPercent}%`,
                                            height: '100%',
                                            backgroundColor: '#EB1C24',
                                            borderRadius: '4px',
                                            transition: 'width 0.3s ease'
                                          }}
                                        />
                                      </div>
                                    </div>
                                    {tierLabel != null && (
                                    <p
                                      style={{
                                        fontFamily: '"Futura PT Book"',
                                        color: '#000000',
                                        fontSize: '10px',
                                        margin: '0',
                                        textTransform: 'uppercase'
                                      }}
                                    >
                                      {tierLabel}
                                    </p>
                                    )}
                                  </>
                                );
                              })()}
                              </div>
                            </div>

                        {/* MORE WAYS TO EARN - Card */}
                            <div className="bg-white/60 backdrop-blur-sm border border-black mb-4" style={{ borderWidth: '1.3px', padding: '16px' }}>
                              <div className="-mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3
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
                                  MORE WAYS TO EARN
                                </h3>
                                <img src={moreWaysIcon} alt="" style={{ width: '18px', height: '18px', flexShrink: 0, objectFit: 'contain' }} />
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {EARN_TASKS.map((item) => {
                                  const isEarned = earnedTaskIds.includes(item.id);
                                  return (
                                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', margin: '0', textTransform: 'uppercase' }}>
                                        {item.action === 'LIKE OUR FACEBOOK' ? <>LIKE OUR <a href={item.link} target="_blank" rel="noopener noreferrer" onClick={() => recordSocialClick('facebook', 'more_ways_to_earn')} style={{ color: BRAND_GRAY, fontFamily: '"Futura PT Medium"', fontWeight: '500', textDecoration: 'underline' }}>FACEBOOK</a></> : item.action === 'FOLLOW OUR INSTAGRAM' ? <>FOLLOW OUR <a href={item.link} target="_blank" rel="noopener noreferrer" onClick={() => recordSocialClick('instagram', 'more_ways_to_earn')} style={{ color: BRAND_GRAY, fontFamily: '"Futura PT Medium"', fontWeight: '500', textDecoration: 'underline' }}>INSTAGRAM</a></> : item.action === 'FOLLOW OUR TIK TOK' ? <>FOLLOW OUR <a href={item.link} target="_blank" rel="noopener noreferrer" onClick={() => recordSocialClick('tiktok', 'more_ways_to_earn')} style={{ color: BRAND_GRAY, fontFamily: '"Futura PT Medium"', fontWeight: '500', textDecoration: 'underline' }}>TIK TOK</a></> : item.action === 'FOLLOW OUR TWITTER' ? <>FOLLOW OUR <a href={item.link} target="_blank" rel="noopener noreferrer" onClick={() => recordSocialClick('twitter', 'more_ways_to_earn')} style={{ color: BRAND_GRAY, fontFamily: '"Futura PT Medium"', fontWeight: '500', textDecoration: 'underline' }}>TWITTER</a></> : item.action}
                                      </p>
                                      {isEarned ? (
                                        <img src="/assets/premium-check.svg" alt="Earned" style={{ width: '8.4px', height: '8.4px', flexShrink: 0 }} />
                                      ) : (
                                        <span style={{ fontFamily: '"Futura PT Medium"', fontWeight: '500', fontSize: '10px', color: '#EB1C24', marginLeft: '-2px' }}>+{item.points}</span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                        {hasPremiumSubscription && (
                          <div className="bg-white/60 backdrop-blur-sm border border-black mb-4" style={{ borderWidth: '1.3px', padding: '16px' }}>
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
                                ADDITIONAL FEATURES
                              </p>
                              <img src={additionalFeaturesIcon} alt="" style={{ width: '20px', height: '20px', flexShrink: 0, objectFit: 'contain', marginTop: '-2px' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {[
                                'PREMIUM 3D WIG CUSTOMIZATION OPTIONS',
                                'ENTRY TO VIP MEMBERS ONLY LOBBY + LOUNGE',
                                'FAST TRACK CUSTOMER SUPPORT',
                                'PRIORITY BOOKING',
                                'MEMBER REWARDS + PRIZES',
                                'DISCOUNTED SHIPPING'
                              ].map((label, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                  <img src="/assets/premium-check.svg" alt="Included" style={{ width: '8.4px', height: '8.4px', marginTop: '4px', flexShrink: 0 }} />
                                  <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', margin: '0', textTransform: 'uppercase' }}>
                                    {label}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* UPGRADE YOUR BASIC MEMBERSHIP - Only show when loyalty rewards is not active (premium members see additional features in loyalty view) */}
                      {!showLoyaltyRewards && (
                      <>
                        {!hasPremiumSubscription && (
                            <>
                <div className="bg-white/60 backdrop-blur-sm border border-black mb-4" style={{ borderWidth: '1.3px', padding: '16px' }}>
                  <div className="-mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p
                      style={{
                        fontFamily: '"Futura PT Medium"',
                        color: '#EB1C24',
                        fontSize: '11px',
                        margin: '0',
                        textTransform: 'uppercase',
                        fontWeight: '500',
                        textAlign: 'left'
                      }}
                    >
                      UNLOCK PREMIUM REWARDS
                    </p>
                    <img src={additionalFeaturesIcon} alt="" style={{ width: '20px', height: '20px', flexShrink: 0, objectFit: 'contain', marginTop: '-2px' }} />
                  </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                                  <p style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', fontSize: '14px', color: '#000000', margin: '0 0 4px 0', textTransform: 'uppercase' }}>
                        PREMIUM 3D WIG SELECTION OPTIONS
                                  </p>
                                  <p style={{ fontFamily: '"Futura PT Medium"', fontWeight: '500', fontSize: '10px', color: BRAND_GRAY, margin: '0', textTransform: 'uppercase' }}>
                        ADDITIONAL, MORE EXTENSIVE CUSTOMIZATION OPTIONS
                      </p>
                    </div>
                    <div>
                                  <p style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', fontSize: '14px', color: '#000000', margin: '0 0 4px 0', textTransform: 'uppercase' }}>
                        ENTRY TO MEMBERS ONLY LOBBY + LOUNGE
                                  </p>
                                  <p style={{ fontFamily: '"Futura PT Medium"', fontWeight: '500', fontSize: '10px', color: BRAND_GRAY, margin: '0', textTransform: 'uppercase' }}>
                        EARLY ACCESS TO SALES, NEW DROPS + RESTOCKS
                      </p>
                    </div>
                    <div>
                                  <p style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', fontSize: '14px', color: '#000000', margin: '0 0 4px 0', textTransform: 'uppercase' }}>
                        FAST TRACK CUSTOMER SUPPORT
                                  </p>
                                  <p style={{ fontFamily: '"Futura PT Medium"', fontWeight: '500', fontSize: '10px', color: BRAND_GRAY, margin: '0', textTransform: 'uppercase' }}>
                        PRIORITIZED SUPPORT WITH SIGNIFICANTLY REDUCED RESPONSE TIMES
                      </p>
                    </div>
                    <div>
                                  <p style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', fontSize: '14px', color: '#000000', margin: '0 0 4px 0', textTransform: 'uppercase' }}>
                        PRIORITY BOOKING + ORDER PROCESSING
                                  </p>
                                  <p style={{ fontFamily: '"Futura PT Medium"', fontWeight: '500', fontSize: '10px', color: BRAND_GRAY, margin: '0', textTransform: 'uppercase' }}>
                        OPTION TO SCHEDULE IN ADVANCE + PRIORITIZED CUSTOM ORDERS
                      </p>
                    </div>
                    <div>
                                  <p style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', fontSize: '14px', color: '#000000', margin: '0 0 4px 0', textTransform: 'uppercase' }}>
                        MEMBER REWARDS + PRIZES
                                  </p>
                                  <p style={{ fontFamily: '"Futura PT Medium"', fontWeight: '500', fontSize: '10px', color: BRAND_GRAY, margin: '0', textTransform: 'uppercase' }}>
                        ELIGIBLE FOR A CHANCE TO WIN RAFFLES, DISCOUNTS + VOUCHERS
                      </p>
                    </div>
                    <div>
                                  <p style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', fontSize: '14px', color: '#000000', margin: '0 0 4px 0', textTransform: 'uppercase' }}>
                        DOUBLE YOUR POINTS
                                  </p>
                                  <p style={{ fontFamily: '"Futura PT Medium"', fontWeight: '500', fontSize: '10px', color: BRAND_GRAY, margin: '0', textTransform: 'uppercase' }}>
                        EARN 2X LOYALTY POINTS UNLOCKING REWARDS FASTER
                      </p>
                    </div>
                  </div>
                            </div>
                            </>
                          )}
                        </>
                      )}
                    </>
                  )
                  )
                }

                {/* UPGRADE/CHANGE/CANCEL SUBSCRIPTION Buttons - Below main card; hidden when benefits view is open */}
              {!showLoyaltyRewards && !showBenefitsModal && (
                      <>
                        {hasPremiumSubscription ? (
                    <>
                      {/* CHANGE / CONFIRM SUBSCRIPTION Button - extra top spacing when chart is open (CONFIRM SUBSCRIPTION) */}
                      <div className="px-0 md:px-0" style={{ marginTop: showPremiumView ? '12px' : '-2px', marginBottom: '10px', transform: showPremiumView ? 'none' : 'translateY(-2px)' }}>
                <button
                          onClick={showPremiumView ? handleUpgradeButtonClick : handleChangeSubscription}
                  className="border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
                  style={{ 
                    borderWidth: '1.3px', 
                    color: '#EB1C24',
                    fontFamily: '"Futura PT Medium"',
                    backgroundColor: '#FFFFFF'
                  }}
                  type="button"
                >
                          {showPremiumView ? 'CONFIRM SUBSCRIPTION' : ((userData?.subscriptionTier === '12months' || (isAdminKateenaAccount(userData) && !userData?.subscriptionTier)) ? 'CHANGE SUBSCRIPTION' : 'UPGRADE SUBSCRIPTION')}
                        </button>
                      </div>
                      {/* CANCEL SUBSCRIPTION Button - Hidden when chart is open */}
                      {!showPremiumView && (
                        <div className="px-0 md:px-0" style={{ marginTop: '0px', marginBottom: '20px', transform: 'translateY(-2px)' }}>
                          <button
                            onClick={handleCancelSubscription}
                            className="border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
                            style={{ 
                              borderWidth: '1.3px', 
                              color: '#EB1C24',
                              fontFamily: '"Futura PT Medium"',
                              backgroundColor: '#FFFFFF'
                            }}
                            type="button"
                          >
                            CANCEL SUBSCRIPTION
                </button>
              </div>
            )}
                    </>
                  ) : (
                    <div className="px-0 md:px-0" style={{ marginTop: showPremiumView ? '12px' : '-2px', marginBottom: '20px', transform: showPremiumView ? 'none' : 'translateY(-2px)' }}>
                      <button
                        onClick={handleUpgradeButtonClick}
                        className="border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
                        style={{ 
                          borderWidth: '1.3px', 
                          color: '#EB1C24',
                          fontFamily: '"Futura PT Medium"',
                          backgroundColor: '#FFFFFF'
                        }}
                        type="button"
                      >
                        {showPremiumView ? 'CONFIRM SUBSCRIPTION' : 'UPGRADE SUBSCRIPTION'}
                      </button>
          </div>
                  )}
                      </>
              )}
              </>
            )}
        </div>
      </div>

      {/* Validation Modal */}
      <ConfirmationModal
        isOpen={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        onConfirm={() => setShowValidationModal(false)}
        title="SUBSCRIPTION REQUIRED"
        message="PLEASE SELECT A SUBSCRIPTION TIER TO CONTINUE."
        confirmText="OK"
        cancelText=""
        dataAttribute="subscription-validation"
      />

      {/* Cancel Subscription Confirmation Modal */}
      <ConfirmationModal
        isOpen={showCancelConfirmModal}
        onClose={() => setShowCancelConfirmModal(false)}
        onConfirm={confirmCancelSubscription}
        title="CANCEL SUBSCRIPTION?"
        message={`YOUR ${getSubscriptionTierName()} SUBSCRIPTION WILL END ON ${getSubscriptionEndDate()}.`}
        confirmText="CONFIRM"
        cancelText="CANCEL"
        dataAttribute="cancel-subscription"
      />

    </div>
  );
}

export default MembershipPage;
