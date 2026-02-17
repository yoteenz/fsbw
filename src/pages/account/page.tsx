import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DynamicCartIcon from '../../components/DynamicCartIcon';
import ConfirmationModal from '../../components/ConfirmationModal';
import { getWelcomeDiscountAmount } from '../../constants/tiers';
import { getTotalReviewCount, hasNewReviewApproved } from '../../constants/reviews';
import { isAyoteenzAdminAccount, isMockDataAccount } from '../../utils/adminAuth';
import BrandMenuLinks from '../../components/BrandMenuLinks';
import SocialMenuIcons from '../../components/SocialMenuIcons';

function AccountPage() {
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
  const [userData, setUserData] = useState<any>(() => {
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
  const [activeOrdersCount, setActiveOrdersCount] = useState(() => {
    // Will be calculated by getActiveOrdersCount
    return 0;
  });
  const [reviewCount, setReviewCount] = useState(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const currentUser = localStorage.getItem('currentUser');
      const user = currentUser ? JSON.parse(currentUser) : null;
      return getTotalReviewCount(user?.email);
    } catch {
      return 0;
    }
  });
  const [membershipType, _setMembershipType] = useState<'STANDARD' | 'PREMIUM'>('STANDARD'); // Will be set dynamically later
  const [profileImage, setProfileImage] = useState(() => {
    // Load from localStorage on mount
    if (typeof window !== 'undefined') {
      try {
        const savedImage = localStorage.getItem('profileImage');
        return savedImage || '/assets/profile-thumb.png';
      } catch (e) {
        return '/assets/profile-thumb.png';
      }
    }
    return '/assets/profile-thumb.png';
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cardAnimationsEnabled, setCardAnimationsEnabled] = useState(() => {
    try {
      if (typeof window === 'undefined') return true;
      return localStorage.getItem('ordersPageAnimationsEnabled') !== 'false';
    } catch {
      return true;
    }
  });
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [, setAlertsRefreshKey] = useState(0);
  const [showEnlargedImage, setShowEnlargedImage] = useState(false);
  const [showDigitalCashHistoryPopup, setShowDigitalCashHistoryPopup] = useState(false);
  const [showVoucherHistoryPopup, setShowVoucherHistoryPopup] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 });
  const [cropScale, setCropScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [pinchStart, setPinchStart] = useState<{ distance: number; scale: number } | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  
  // Mock digital cash history for testing labels UI – one row per transaction type
  const MOCK_DIGITAL_CASH_HISTORY: Array<{ date: string; transaction: string; amount: number }> = [
    { date: '2-14-2025', transaction: 'DEPOSIT', amount: 110 },
    { date: '2-10-2025', transaction: 'TIER POINTS', amount: 80 },
    { date: '1-28-2025', transaction: 'TIER POINTS', amount: 40 },
    { date: '1-15-2025', transaction: 'TIER POINTS', amount: 10 },
    { date: '2-8-2025', transaction: 'SUBSCRIPTION', amount: 40 },
    { date: '2-5-2025', transaction: 'CHECKOUT', amount: -25 },
    { date: '1-20-2025', transaction: 'REFERRAL', amount: 20 }
  ];

  // Current date in M-D-YYYY for history entries — always in sync with client (e.g. Feb 16, 2025)
  const getTodayDateStr = (): string => {
    const d = new Date();
    return `${d.getMonth() + 1}-${d.getDate()}-${d.getFullYear()}`;
  };

  // Mock voucher history – transaction: "1X FLEXIBLE CAP", "1X HAIRLINE", "1X COLOR", "1X STYLING", or "REDEEMED"; amount: +1 credited, -1 redeemed
  const MOCK_VOUCHER_HISTORY: Array<{ date: string; transaction: string; amount: number }> = [
    { date: '2-12-2025', transaction: '1X FLEXIBLE CAP', amount: 1 },
    { date: '2-10-2025', transaction: '1X HAIRLINE', amount: 1 },
    { date: '1-28-2025', transaction: 'REDEEMED', amount: -1 },
    { date: '1-15-2025', transaction: '1X COLOR', amount: 1 }
  ];

  /** Display order for voucher types in "VOUCHERS AVAILABLE": Color, Hairline first; Styling and Flexible Cap at bottom. */
  const VOUCHER_DISPLAY_ORDER = ['COLOR', 'HAIRLINE', 'STYLING', 'FLEXIBLE CAP', 'FLEX CAP'];

  // Get cards for display
  const getCardsForDisplay = (): Array<{ title: string; subtitle: string; route: string | null }> => {
    return getOrderedCards();
  };

  // Currency state - load from localStorage on mount
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

  // On production (e.g. Vercel): redirect to sign-in when not signed in. On localhost (vite preview) show mock account.
  useEffect(() => {
    if (isSignedIn) return;
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    if (!isLocalhost) {
      navigate('/sign-in');
    }
  }, [isSignedIn, navigate]);

  // Listen for animations toggle (settings) so card transitions can be turned off
  useEffect(() => {
    const handleAnimationsChanged = () => {
      setCardAnimationsEnabled(localStorage.getItem('ordersPageAnimationsEnabled') !== 'false');
    };
    handleAnimationsChanged();
    window.addEventListener('ordersAnimationsChanged', handleAnimationsChanged);
    window.addEventListener('storage', handleAnimationsChanged);
    return () => {
      window.removeEventListener('ordersAnimationsChanged', handleAnimationsChanged);
      window.removeEventListener('storage', handleAnimationsChanged);
    };
  }, []);

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
  const formatPrice = React.useCallback((price: number): string => {
    const currency = currencyRates[selectedCurrency as keyof typeof currencyRates] || currencyRates.USD;
    const convertedPrice = (price || 0) * currency.rate;
    
    // Convert HTML entities to actual symbols
    const symbolMap: { [key: string]: string } = {
      '&#36;': '$',
      '&euro;': '€',
      '&pound;': '£',
      '&yen;': '¥',
      '&#8377;': '₹'
    };
    let symbol = currency.symbol;
    Object.keys(symbolMap).forEach(entity => {
      symbol = symbol.replace(new RegExp(entity, 'g'), symbolMap[entity]);
    });
    
    return symbol + convertedPrice.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }) + ' ' + selectedCurrency;
  }, [currencyRates, selectedCurrency]);

  // Load user data on mount
  useEffect(() => {
    try {
      const currentUser = localStorage.getItem('currentUser');
      const signedIn = localStorage.getItem('isSignedIn') === 'true';
      
      if (currentUser && signedIn) {
        const user = JSON.parse(currentUser);
        let didUpdate = false;
        // Add test vouchers for checkout if none exist (so you can test voucher logic), and seed voucher history with traceable origin + date
        if (!user.voucherList || !Array.isArray(user.voucherList) || user.voucherList.length === 0) {
          const today = getTodayDateStr();
          user.voucherList = ['1X COLOR', '1X HAIRLINE', '1X STYLING', '1X FLEXIBLE CAP'];
          user.voucherCount = user.voucherList.length;
          user.voucherHistory = [
            { date: today, transaction: '1X COLOR', amount: 1 },
            { date: today, transaction: '1X HAIRLINE', amount: 1 },
            { date: today, transaction: '1X STYLING', amount: 1 },
            { date: today, transaction: '1X FLEXIBLE CAP', amount: 1 }
          ];
          didUpdate = true;
        } else {
          // Migration: add 1X STYLING and 1X FLEXIBLE CAP if missing; ensure Color and Hairline have voucher history dates too
          const list = user.voucherList as string[];
          const hasStyling = list.some((v: string) => /STYLING/i.test(v));
          const hasFlexCap = list.some((v: string) => /FLEXIBLE CAP|FLEX CAP/i.test(v));
          const today = getTodayDateStr();
          const history: Array<{ date: string; transaction: string; amount: number }> = Array.isArray(user.voucherHistory) ? [...user.voucherHistory] : [];
          const historyTransactions = new Set(history.map((h: { transaction: string }) => h.transaction.toUpperCase()));
          if (!hasStyling) {
            list.push('1X STYLING');
            history.push({ date: today, transaction: '1X STYLING', amount: 1 });
            didUpdate = true;
          }
          if (!hasFlexCap) {
            list.push('1X FLEXIBLE CAP');
            history.push({ date: today, transaction: '1X FLEXIBLE CAP', amount: 1 });
            didUpdate = true;
          }
          if (!historyTransactions.has('1X COLOR') && list.some((v: string) => /COLOR/i.test(v))) {
            history.push({ date: today, transaction: '1X COLOR', amount: 1 });
            didUpdate = true;
          }
          if (!historyTransactions.has('1X HAIRLINE') && list.some((v: string) => /HAIRLINE/i.test(v))) {
            history.push({ date: today, transaction: '1X HAIRLINE', amount: 1 });
            didUpdate = true;
          }
          if (didUpdate) {
            user.voucherList = list;
            user.voucherHistory = history;
            user.voucherCount = user.voucherList.length;
          }
        }
        if (didUpdate) {
          localStorage.setItem('currentUser', JSON.stringify(user));
          const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
          const idx = registeredUsers.findIndex((u: any) => u.email === user.email);
          if (idx !== -1) {
            registeredUsers[idx] = user;
            localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
          }
        }
        setUserData(user);
        setIsSignedIn(true);
        
        // Load profile image if available
        if (user.profileImage) {
          setProfileImage(user.profileImage);
        }
        
        // Update membership type from user data
        if (user.membershipType) {
          _setMembershipType(user.membershipType.toUpperCase() === 'PREMIUM' ? 'PREMIUM' : 'STANDARD');
        }
      }
    } catch (e) {
      console.error('Error loading user data:', e);
    }
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
        // Refresh user data so address/payment (and other) card counts stay accurate when returning from shipping/payment
        const currentUser = localStorage.getItem('currentUser');
        const signedIn = localStorage.getItem('isSignedIn') === 'true';
        if (currentUser && signedIn) {
          const user = JSON.parse(currentUser);
          setUserData(user);
          if (user.profileImage) setProfileImage(user.profileImage);
          if (user.membershipType) _setMembershipType(user.membershipType.toUpperCase() === 'PREMIUM' ? 'PREMIUM' : 'STANDARD');
        }
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

  // Initialize admin (mock-data) account only with proper gift card balance and unlocked discounts – no test data for non-admin accounts
  useEffect(() => {
    if (userData && isMockDataAccount(userData)) {
        try {
          const currentUser = localStorage.getItem('currentUser');
          if (currentUser) {
            const user = JSON.parse(currentUser);
            const isPremium = user.membershipType === 'PREMIUM' || (user.unlockedDiscounts || []).includes('12months');
            // Only top up to $70 for premium (12-month) members; standard members keep $10 welcome discount only
            if (!isPremium) return;

            let needsUpdate = false;
            const updatedUser = { ...user };

            // Ensure gift card balance is $70 ($10 signup + $60 for 12 months premium)
            const expectedBalance = 70;
            if (!user.giftCardBalance || user.giftCardBalance < expectedBalance) {
              updatedUser.giftCardBalance = expectedBalance;
              needsUpdate = true;
            }

            // Ensure unlocked discounts include signup and 12months
            const unlockedDiscounts = user.unlockedDiscounts || [];
            if (!unlockedDiscounts.includes('signup')) {
              updatedUser.unlockedDiscounts = [...unlockedDiscounts, 'signup'];
              needsUpdate = true;
            }
            if (!unlockedDiscounts.includes('12months')) {
              updatedUser.unlockedDiscounts = [...(updatedUser.unlockedDiscounts || unlockedDiscounts), '12months'];
              needsUpdate = true;
            }

            if (needsUpdate) {
              localStorage.setItem('currentUser', JSON.stringify(updatedUser));
              setUserData(updatedUser);

              // Also update in registered users list
              const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
              const userIndex = registeredUsers.findIndex((u: any) => u.email === user.email);
              if (userIndex !== -1) {
                registeredUsers[userIndex] = updatedUser;
                localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
              }
            }
          }
        } catch (e) {
          console.error('Error initializing admin mock-data account:', e);
        }
    }
  }, [userData]);

  // Update active orders count when user data or orders change
  useEffect(() => {
    const updateActiveOrdersCount = () => {
      const count = getActiveOrdersCount();
      setActiveOrdersCount(count);
    };

    updateActiveOrdersCount();

    // Listen for order updates
    const handleStorageChange = () => {
      updateActiveOrdersCount();
    };

    window.addEventListener('storage', handleStorageChange);
    // Also listen for custom events that might indicate order changes
    window.addEventListener('ordersUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('ordersUpdated', handleStorageChange);
    };
  }, [userData]);

  // Update review count when user data or stored reviews change (synced with reviews page); also re-run when landing on account so count is current
  useEffect(() => {
    const updateReviewCount = () => {
      const count = getTotalReviewCount(userData?.email);
      setReviewCount(count);
    };

    updateReviewCount();

    const handleStorageChange = () => updateReviewCount();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('reviewsUpdated', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('reviewsUpdated', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, [userData, location.pathname]);

  // REVIEWS card alert is derived from hasNewReviewApproved (user-submitted flag + shop/tool last-seen counts); no effect needed.

  // When any account child page (reviews, orders, alerts, payment, etc.) clears its card alert,
  // re-render so card notification badges update and alerts don't persist.
  useEffect(() => {
    const onAlertsViewed = () => setAlertsRefreshKey((k) => k + 1);
    window.addEventListener('accountCardAlertsViewed', onAlertsViewed);
    return () => window.removeEventListener('accountCardAlertsViewed', onAlertsViewed);
  }, []);

  // Credit tier welcome discount (digital cash) when user reaches each spend tier.
  // Once per tier per 6-month cycle; when tiers reset each period they can earn benefits again.
  // This balance is shown as DIGITAL CASH on account profile and applied at checkout.
  useEffect(() => {
    if (!userData?.email) return;
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (!currentUser.email || currentUser.email !== userData.email) return;
      const now = new Date();
      const periodKey = now.getMonth() < 6
        ? `${now.getFullYear()}-Jan-Jun`
        : `${now.getFullYear()}-Jul-Dec`;
      const byPeriod = currentUser.welcomeDiscountTiersCreditedByPeriod || {};
      const creditedThisPeriod: string[] = byPeriod[periodKey] || [];
      // Migrate old format: if they had a flat list, treat as already credited this period
      if (creditedThisPeriod.length === 0 && Array.isArray(currentUser.welcomeDiscountTiersCredited)) {
        byPeriod[periodKey] = currentUser.welcomeDiscountTiersCredited;
        const updatedForMigration = { ...currentUser, welcomeDiscountTiersCreditedByPeriod: byPeriod };
        delete (updatedForMigration as any).welcomeDiscountTiersCredited;
        localStorage.setItem('currentUser', JSON.stringify(updatedForMigration));
        setUserData(updatedForMigration);
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const idx = registeredUsers.findIndex((u: any) => u.email === currentUser.email);
        if (idx !== -1) {
          registeredUsers[idx] = updatedForMigration;
          localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        }
        return;
      }
      const currentTier = calculateTier();
      if (!currentTier || !['SILVER', 'RED', 'BLACK'].includes(currentTier)) return;
      if (creditedThisPeriod.includes(currentTier)) return;
      const amount = getWelcomeDiscountAmount(currentTier);
      const currentBalance = (currentUser.giftCardBalance ?? 0) as number;
      const updatedCreditedThisPeriod = [...(byPeriod[periodKey] || []), currentTier];
      const dateStr = `${now.getMonth() + 1}-${now.getDate()}-${now.getFullYear()}`;
      const historyEntry = { date: dateStr, transaction: 'TIER POINTS', amount };
      const updatedUser = {
        ...currentUser,
        giftCardBalance: currentBalance + amount,
        welcomeDiscountTiersCreditedByPeriod: { ...byPeriod, [periodKey]: updatedCreditedThisPeriod },
        digitalCashHistory: [...(currentUser.digitalCashHistory || []), historyEntry]
      };
      delete (updatedUser as any).welcomeDiscountTiersCredited;
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setUserData(updatedUser);
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const idx = registeredUsers.findIndex((u: any) => u.email === currentUser.email);
      if (idx !== -1) {
        registeredUsers[idx] = updatedUser;
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
      }
    } catch (e) {
      console.error('Error crediting tier welcome discount:', e);
    }
  }, [userData?.email]);

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
      // Navigate to sign-in page (will default to account page after sign-in)
      navigate('/sign-in');
    }
  };

  const handleSignOut = () => {
    setIsSignedIn(false);
    localStorage.setItem('isSignedIn', 'false');
    localStorage.removeItem('currentUser');
    // Dispatch custom event to update other pages in same tab
    window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'false' }));
    setShowSignOutConfirm(false);
    // Close mobile menu
    setShowMobileMenu(false);
    // Navigate to home or sign-in page
    navigate('/sign-in');
  };

  const handleChangePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleResetPhotoClick = () => {
    setShowResetConfirm(true);
  };

  const handleConfirmReset = () => {
    const defaultImage = '/assets/profile-thumb.png';
    setProfileImage(defaultImage);
    try {
      localStorage.removeItem('profileImage');
      // Persist reset to user record so it survives sign-out/sign-in
      const currentUserRaw = localStorage.getItem('currentUser');
      if (currentUserRaw) {
        const currentUser = JSON.parse(currentUserRaw);
        const email = (currentUser?.email || '').trim().toLowerCase();
        if (email) {
          currentUser.profileImage = defaultImage;
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
          const registered = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
          const idx = registered.findIndex((u: any) => (u.email || '').trim().toLowerCase() === email);
          if (idx !== -1) {
            registered[idx] = { ...registered[idx], profileImage: defaultImage };
            localStorage.setItem('registeredUsers', JSON.stringify(registered));
          }
        }
      }
    } catch (e) {
      // Ignore errors
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setShowResetConfirm(false);
  };

  // Helper function to get current 6-month period
  const getCurrentPeriod = (): { start: Date; end: Date; periodName: string } => {
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11 (Jan = 0, Dec = 11)
    const currentYear = now.getFullYear();
    
    // Jan-Jun (months 0-5) or Jul-Dec (months 6-11)
    if (currentMonth < 6) {
      // January to June
      return {
        start: new Date(currentYear, 0, 1), // Jan 1
        end: new Date(currentYear, 5, 30), // Jun 30
        periodName: 'Jan-Jun'
      };
    } else {
      // July to December
      return {
        start: new Date(currentYear, 6, 1), // Jul 1
        end: new Date(currentYear, 11, 31), // Dec 31
        periodName: 'Jul-Dec'
      };
    }
  };

  // Helper function to get highest tier ever achieved
  // Check if user is VIB (Very Important Buyer) - lifetime spending >= $10k
  const isVIB = (): boolean => {
    if (!userData?.email) return false;
    
    try {
      const userOrdersKey = `userOrders_${userData.email}`;
      const storedOrders = localStorage.getItem(userOrdersKey);
      if (!storedOrders) return false;
      
      const orders = JSON.parse(storedOrders);
      const allOrders = [...(orders.activeOrders || []), ...(orders.pastOrders || [])];
      
      // Calculate total lifetime spending
      let lifetimeSpending = 0;
      allOrders.forEach((order: any) => {
        if (order.total) {
          lifetimeSpending += order.total || 0;
        }
      });
      
      // VIB status: lifetime spending >= $10,000
      return lifetimeSpending >= 10000;
    } catch (e) {
      console.error('Error checking VIB status:', e);
      return false;
    }
  };

  const getHighestTierEver = (): string | null => {
    if (!userData?.email) return null;
    
    try {
      const userOrdersKey = `userOrders_${userData.email}`;
      const storedOrders = localStorage.getItem(userOrdersKey);
      if (!storedOrders) return null;
      
      const orders = JSON.parse(storedOrders);
      const allOrders = [...(orders.activeOrders || []), ...(orders.pastOrders || [])];
      
      let highestTier: string | null = null;
      const periods: { [key: string]: number } = {};
      
      // Calculate spending for all historical periods
      allOrders.forEach((order: any) => {
        if (order.date && order.total) {
          // Parse date (format: MM-DD-YYYY)
          const [month, day, year] = order.date.split('-').map(Number);
          const orderDate = new Date(year, month - 1, day);
          
          // Determine which 6-month period this order belongs to
          const orderMonth = orderDate.getMonth();
          const orderYear = orderDate.getFullYear();
          const periodKey = orderMonth < 6 
            ? `${orderYear}-Jan-Jun` 
            : `${orderYear}-Jul-Dec`;
          
          // Accumulate spending for this period
          if (!periods[periodKey]) {
            periods[periodKey] = 0;
          }
          periods[periodKey] += order.total || 0;
        }
      });
      
      // Check all periods to find highest tier ever achieved
      Object.values(periods).forEach(spending => {
        if (spending >= 4000 && (!highestTier || highestTier === 'SILVER' || highestTier === 'RED')) {
          highestTier = 'BLACK';
        } else if (spending >= 2000 && (!highestTier || highestTier === 'SILVER')) {
          highestTier = 'RED';
        } else if (spending >= 1000 && !highestTier) {
          highestTier = 'SILVER';
        }
      });
      
      return highestTier;
    } catch (e) {
      console.error('Error getting highest tier:', e);
      return null;
    }
  };

  // Helper function to calculate tier based on 6-month spending
  const calculateTier = (): string | null => {
    const period = getCurrentPeriod();
    let totalSpending = 0;
    const highestTierEver = getHighestTierEver();

    // OAuth users always use real data (no mock)
    if (userData?.authProvider) {
      // fall through to real calculation below
    } else {
      if (isMockDataAccount(userData)) {
        return null;
      }
    }

    // For real users, calculate from orders
    if (userData?.email) {
      try {
        const userOrdersKey = `userOrders_${userData.email}`;
        const storedOrders = localStorage.getItem(userOrdersKey);
        if (storedOrders) {
          const orders = JSON.parse(storedOrders);
          const allOrders = [...(orders.activeOrders || []), ...(orders.pastOrders || [])];
          
          // Calculate spending in current period
          allOrders.forEach((order: any) => {
            if (order.date) {
              // Parse date (format: MM-DD-YYYY)
              const [month, day, year] = order.date.split('-').map(Number);
              const orderDate = new Date(year, month - 1, day);
              
              // Check if order is within current period
              if (orderDate >= period.start && orderDate <= period.end) {
                totalSpending += order.total || 0;
              }
            }
          });
        }
      } catch (e) {
        console.error('Error calculating tier:', e);
        // If calculation fails, return null (base state - shows "MEMBER")
        // Only return SILVER if they've previously unlocked it
        return highestTierEver === 'SILVER' ? 'SILVER' : null;
      }
    }

    // VIB (Very Important Buyers) always remain BLACK tier regardless of current period spending
    if (isVIB()) {
      return 'BLACK';
    }

    // Determine tier based on current period spending
    let currentTier: string | null = null;
    if (totalSpending >= 4000) {
      currentTier = 'BLACK';
    } else if (totalSpending >= 2000) {
      currentTier = 'RED';
    } else if (totalSpending >= 1000) {
      currentTier = 'SILVER';
    }

    // SILVER is the base tier - everyone gets it on signup
    // But benefits only unlock when spending thresholds are met
    
    // Tier retention logic:
    // - No tier (null): Base state until $1k spending - shows "MEMBER"
    // - Silver: Unlocks at $1k+ spending
    // - Red: Unlocks at $2k+, can drop to Silver if current period < $2k
    // - Black: Unlocks at $4k+, can drop to Red (if current >= $2k) or Silver (if current < $2k)
    if (highestTierEver === 'SILVER') {
      // Once Silver is unlocked, always at least Silver tier
      return currentTier || 'SILVER';
    } else if (highestTierEver === 'RED') {
      // Red can drop to Silver if current period doesn't meet $2k
      return currentTier || 'SILVER';
    } else if (highestTierEver === 'BLACK') {
      // Black can drop to Red (if current >= $2k) or Silver (if current < $2k)
      if (currentTier) {
        return currentTier;
      } else {
        // Didn't meet $4k, check if they meet $2k for Red
        return totalSpending >= 2000 ? 'RED' : 'SILVER';
      }
    }

    // No tier unlocked yet - return null to show "BASIC/PREMIUM REWARDS MEMBER"
    // Only becomes SILVER tier once they reach $1k spending threshold
    return currentTier;
  };

  // Helper functions to check for notifications on each card
  const hasOrdersNotifications = (): boolean => {
    if (!userData) return false;
    try {
      const userOrdersKey = `userOrders_${userData.email}`;
      const storedOrders = localStorage.getItem(userOrdersKey);
      if (!storedOrders) return false;
      
      const orders = JSON.parse(storedOrders);
      const allOrders = [...(orders.activeOrders || []), ...(orders.pastOrders || [])];
      
      // Check for orders with status updates (SHIPPED, PREPARING, CONFIRMED, etc.)
      // that haven't been seen by the user
      return allOrders.some((order: any) => {
        if (!order.status) return false;
        
        // Status updates are: SHIPPED, PREPARING, CONFIRMED (not initial PLACED)
        const hasStatusUpdate = ['SHIPPED', 'PREPARING', 'CONFIRMED'].includes(order.status);
        
        if (hasStatusUpdate) {
          // Check if user has seen this status update
          const seenKey = `orderStatusSeen_${order.id}_${order.status}`;
          return !localStorage.getItem(seenKey);
        }
        
        return false;
      });
    } catch (e) {
      return false;
    }
  };

  const hasAlertsNotifications = (): boolean => {
    try {
      const email = (userData?.email || '').trim().toLowerCase();
      if (email && localStorage.getItem(`alertsPageViewed_${email}`) === 'true') {
        return false;
      }
      const key = userData?.authProvider && userData?.email ? `notifications_${userData.email}` : 'notifications';
      const notificationsStr = localStorage.getItem(key);
      if (notificationsStr) {
        const notifications = JSON.parse(notificationsStr);
        return Array.isArray(notifications) && notifications.some((n: any) => !n.isRead);
      }
      const hasUnreadNotifications = localStorage.getItem('hasUnreadNotifications') === 'true';
      return hasUnreadNotifications;
    } catch (e) {
      return false;
    }
  };

  const hasMembershipNotifications = (): boolean => {
    if (!userData) return false;
    try {
      // Check if tier has changed (compare current tier with last known tier)
      const lastKnownTier = localStorage.getItem(`lastKnownTier_${userData.email}`);
      const currentTier = calculateTier();
      
      if (currentTier && lastKnownTier !== currentTier) {
        return true; // Tier has changed
      }
      
      // Check for subscription updates
      const subscriptionUpdate = localStorage.getItem(`subscriptionUpdate_${userData.email}`);
      return subscriptionUpdate === 'true';
    } catch (e) {
      return false;
    }
  };

  const hasAffiliateNotifications = (): boolean => {
    if (!userData) return false;
    try {
      const submittedContentStr = localStorage.getItem('affiliateSubmittedContent');
      if (!submittedContentStr) return false;
      
      const submittedContent = JSON.parse(submittedContentStr);
      
      // Check for pending, approved, or rejected content that user hasn't seen
      for (const orderId in submittedContent) {
        const content = submittedContent[orderId];
        const photos = content.photos || [];
        const videos = content.videos || [];
        const socials = content.socials || [];
        
        // Check for pending approvals (not yet seen on affiliate page)
        const hasPending = [...photos, ...videos, ...socials].some((item: any) => {
          if (item.status !== 'pending') return false;
          const seenKey = item.id ? `affiliateSeen_${orderId}_${item.id}` : null;
          return !seenKey || !localStorage.getItem(seenKey);
        });
        // Check for new approvals (approved but not seen)
        const hasNewApprovals = [...photos, ...videos, ...socials].some((item: any) => {
          if (item.status === 'approved' && item.approvedDate) {
            const seenKey = `affiliateSeen_${orderId}_${item.id}`;
            return !localStorage.getItem(seenKey);
          }
          return false;
        });
        // Check for rejected content (rejected but not seen)
        const hasNewRejections = [...photos, ...videos, ...socials].some((item: any) => {
          if (item.status === 'rejected' && item.rejectedDate) {
            const seenKey = `affiliateSeen_${orderId}_${item.id}`;
            return !localStorage.getItem(seenKey);
          }
          return false;
        });
        
        if (hasPending || hasNewApprovals || hasNewRejections) return true;
      }
      
      return false;
    } catch (e) {
      return false;
    }
  };

  const hasReferralsNotifications = (): boolean => {
    if (!userData?.email) return false;
    try {
      const key = `referralNewActivity_${(userData.email || '').trim().toLowerCase()}`;
      if (localStorage.getItem(key) === 'true') return true;
      const log = JSON.parse(localStorage.getItem('referralEarnings') || '[]');
      const email = (userData.email || '').trim().toLowerCase();
      const lastSeenKey = `referralLastSeenCount_${email}`;
      const lastSeen = parseInt(localStorage.getItem(lastSeenKey) || '0', 10);
      const myCount = log.filter((e: { referrerEmail?: string }) => (e.referrerEmail || '').trim().toLowerCase() === email).length;
      return myCount > lastSeen;
    } catch {
      return false;
    }
  };

  // All order statuses that have a tracking stage on Concierge (badge for any unseen update)
  const CONCIERGE_TRACKING_STATUSES = [
    'PLACED', 'CONFIRMED', 'PREPARING', 'SHIPPED_TO_HUB', 'IN_TRANSIT',
    'PROCESSING', 'CUSTOMIZING', 'FINALIZING', 'SHIPPED', 'DELIVERED'
  ];

  const hasConciergeNotifications = (): boolean => {
    if (!userData?.email) return false;
    try {
      const userOrdersKey = `userOrders_${userData.email}`;
      const stored = localStorage.getItem(userOrdersKey);
      if (!stored) return false;
      const orders = JSON.parse(stored);
      const allOrders = [...(orders.activeOrders || []), ...(orders.pastOrders || [])];
      return allOrders.some((order: any) => {
        if (!order?.id || !order?.status) return false;
        if (!CONCIERGE_TRACKING_STATUSES.includes(order.status)) return false;
        return !localStorage.getItem(`conciergeOrderSeen_${order.id}_${order.status}`);
      });
    } catch {
      return false;
    }
  };

  const hasReviewsNotifications = (): boolean => {
    // Alert when user's review is posted or new shop/tool reviews; clears when they visit reviews page and view shop/tool tab
    return hasNewReviewApproved(userData?.email) ?? false;
  };

  const hasShippingAddressNotifications = (): boolean => {
    if (!userData?.email) return false;
    return localStorage.getItem(`shippingAddressAlert_${userData.email}`) === 'true';
  };

  const hasSettingsNotifications = (): boolean => {
    if (!userData?.email) return false;
    return localStorage.getItem(`settingsAlert_${userData.email}`) === 'true';
  };

  const hasPaymentMethodNotifications = (): boolean => {
    if (!userData) return false;
    try {
      const defaultPay = userData.defaultPaymentMethod;
      const saved = Array.isArray(userData.savedPaymentMethods) ? userData.savedPaymentMethods : [];
      const cards: Array<{ expirationDate?: string }> = defaultPay ? [defaultPay, ...saved] : [...saved];
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      return cards.some((card: any) => {
        const exp = card?.expirationDate;
        if (!exp || typeof exp !== 'string') return false;
        const parts = exp.trim().split(/[/-]/);
        if (parts.length < 2) return false;
        const month = parseInt(parts[0], 10) - 1;
        let year = parseInt(parts[1], 10);
        if (year < 100) year += 2000;
        const expiryDate = new Date(year, month + 1, 0);
        return expiryDate >= now && expiryDate <= thirtyDaysFromNow;
      });
    } catch (e) {
      return false;
    }
  };

  const getAddressCount = (): number => {
    const defaultAddr = userData?.defaultAddress || userData?.shippingAddress;
    const saved = Array.isArray(userData?.savedAddresses) ? userData.savedAddresses : [];
    if (!defaultAddr && saved.length === 0) return 0;
    const list: Array<{ address?: string; city?: string; zip?: string }> = [];
    if (defaultAddr && typeof defaultAddr === 'object' && (defaultAddr.address || defaultAddr.city)) list.push(defaultAddr);
    saved.forEach((a: any) => {
      if (!a?.address && !a?.city) return;
      const isDup = list.some((e) => e.address === a.address && e.city === a.city && e.zip === a.zip);
      if (!isDup) list.push(a);
    });
    return list.length;
  };

  const getPaymentCount = (): number => {
    const defaultPay = userData?.defaultPaymentMethod;
    const saved = Array.isArray(userData?.savedPaymentMethods) ? userData.savedPaymentMethods : [];
    const list: Array<{ cardNumber?: string; cardholder?: string }> = [];
    if (defaultPay && (defaultPay.cardholder || defaultPay.cardNumber)) list.push(defaultPay);
    saved.forEach((p: any) => {
      const hasInfo = p?.cardholder || p?.cardNumber;
      const isDup = list.some((e) => e.cardNumber === p.cardNumber && e.cardholder === p.cardholder);
      if (hasInfo && !isDup) list.push(p);
    });
    return list.length;
  };

  // Helper function to get default card order
  const getDefaultCardOrder = (): Array<{ title: string; subtitle: string; route: string | null }> => {
    const userMembershipType = userData?.membershipType || membershipType;
    const isPremium = userMembershipType === 'PREMIUM' || userMembershipType === 'Premium';
    const showConcierge = isPremium; // Concierge is only for premium members, not standard
    const defaultCards: Array<{ title: string; subtitle: string; route: string | null }> = [];

    let referralInvitesUsed = 0;
    if (userData?.email) {
      try {
        const log = JSON.parse(localStorage.getItem('referralEarnings') || '[]');
        const email = (userData.email || '').trim().toLowerCase();
        referralInvitesUsed = log.filter((e: { referrerEmail?: string }) => (e.referrerEmail || '').trim().toLowerCase() === email).length;
      } catch (_) {}
    }

    if (showConcierge) {
      defaultCards.push({
        title: 'CONCIERGE',
        subtitle: 'PRIORITY MESSAGES + TRACKING',
        route: '/account/concierge'
      });
    }
    
    defaultCards.push(
      { title: 'ALERTS', subtitle: 'NOTIFICATIONS + NEWSLETTER', route: '/account/alerts' },
      { 
        title: 'ORDERS', 
        subtitle: activeOrdersCount > 0 ? `${activeOrdersCount} ACTIVE ORDER${activeOrdersCount !== 1 ? 'S' : ''}` : '0 ACTIVE ORDERS', 
        route: '/account/orders' 
      },
      { title: 'REWARDS', subtitle: 'MEMBERSHIP + SUBSCRIPTION', route: '/account/rewards' },
      { 
        title: 'REVIEWS', 
        subtitle: reviewCount === 1 ? '1 TOTAL REVIEW' : `${reviewCount} TOTAL REVIEWS`, 
        route: '/account/reviews' 
      },
      { title: 'AFFILIATE', subtitle: 'SUBMIT CONTENT FOR POINTS', route: '/account/affiliate' },
      {
        title: 'REFERRALS',
        subtitle: referralInvitesUsed === 1 ? '1 INVITE USED' : `${referralInvitesUsed} INVITES USED`,
        route: '/account/referrals'
      },
      { 
        title: 'SHIPPING ADDRESS', 
        subtitle: (() => { const n = getAddressCount(); return n === 1 ? '1 ADDRESS ON FILE' : `${n} ADDRESSES ON FILE`; })(), 
        route: '/account/shipping' 
      },
      { 
        title: 'PAYMENT METHOD', 
        subtitle: (() => { const n = getPaymentCount(); return n === 1 ? '1 CARD ON FILE' : `${n} CARDS ON FILE`; })(), 
        route: '/account/payment' 
      },
      { title: 'SETTINGS', subtitle: 'PASSWORD + CONTROLS', route: '/account/settings' }
    );
    
    return defaultCards;
  };

  // Get ordered cards (using default order)
  const getOrderedCards = (): Array<{ title: string; subtitle: string; route: string | null }> => {
    return getDefaultCardOrder();
  };


  // Helper function to check if a specific card has notifications (admin uses same logic so badges clear on visit)
  const cardHasNotifications = (title: string): boolean => {
    switch (title) {
      case 'CONCIERGE':
        return hasConciergeNotifications();
      case 'ORDERS':
        return hasOrdersNotifications();
      case 'ALERTS':
        return hasAlertsNotifications();
      case 'REWARDS':
        return hasMembershipNotifications();
      case 'REFERRALS':
        return hasReferralsNotifications();
      case 'AFFILIATE':
        return hasAffiliateNotifications();
      case 'REVIEWS':
        return hasReviewsNotifications();
      case 'PAYMENT METHOD':
        return hasPaymentMethodNotifications();
      case 'SHIPPING ADDRESS':
        return hasShippingAddressNotifications();
      case 'SETTINGS':
        return hasSettingsNotifications();
      default:
        return false;
    }
  };

  // Helper function to get active orders count (matches orders page: length of activeOrders array)
  const getActiveOrdersCount = (): number => {
    if (!userData?.email) return 0;
    try {
      const userOrdersKey = `userOrders_${userData.email}`;
      const storedOrders = localStorage.getItem(userOrdersKey);
      if (storedOrders) {
        const orders = JSON.parse(storedOrders);
        const activeOrders = orders.activeOrders || [];
        return activeOrders.length;
      }
    } catch (e) {
      console.error('Error loading order count:', e);
    }
    return 0;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const blob: Blob = file;
    const openCropModal = (dataUrl: string) => {
      setImageToCrop(dataUrl);
      setShowCropModal(true);
      setCropPosition({ x: 0, y: 0 });
      setCropScale(1);
    };
    // Normalize orientation from EXIF (iOS photo picker) so crop modal and canvas capture match exactly
    if (typeof createImageBitmap !== 'undefined') {
      createImageBitmap(blob, { imageOrientation: 'from-image' })
        .then((bitmap) => {
          const w = bitmap.width;
          const h = bitmap.height;
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            bitmap.close();
            fallbackRead();
            return;
          }
          ctx.drawImage(bitmap, 0, 0);
          bitmap.close();
          openCropModal(canvas.toDataURL('image/png'));
        })
        .catch(() => fallbackRead());
    } else {
      fallbackRead();
    }
    function fallbackRead() {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) openCropModal(reader.result as string);
      };
      reader.readAsDataURL(blob);
    }
    event.target.value = '';
  };

  const cropContainerRef = useRef<HTMLDivElement>(null);

  const startDrag = (clientX: number, clientY: number) => {
    if (!cropContainerRef.current) return;
    
    setIsDragging(true);
    const rect = cropContainerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    setDragStart({ 
      x: clientX - centerX - cropPosition.x, 
      y: clientY - centerY - cropPosition.y 
    });
  };

  const handleCropMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startDrag(e.clientX, e.clientY);
  };

  const handleCropTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent default browser zoom behavior
    if (e.touches.length === 2) {
      e.preventDefault();
      // Pinch to zoom - only within the crop container
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      setPinchStart({ distance, scale: cropScale });
      setIsDragging(false);
    } else if (e.touches.length === 1) {
      // Single touch - drag
      const touch = e.touches[0];
      startDrag(touch.clientX, touch.clientY);
      setPinchStart(null); // Clear any existing pinch
    }
  };

  const handleCropWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Zoom in/out with wheel - more sensitive
    const zoomSpeed = 0.1;
    const delta = e.deltaY > 0 ? -zoomSpeed : zoomSpeed;
    const newScale = Math.max(1, Math.min(3, cropScale + delta));
    
    if (Math.abs(newScale - cropScale) > 0.01) {
      setCropScale(newScale);
      
      // Adjust position constraints when zoom changes
      const baseImageSize = 300;
      const cropSize = 200;
      const scaledImageSize = baseImageSize * newScale;
      const maxOffset = Math.max(0, (scaledImageSize - cropSize) / 2);
      
      // Clamp current position to new constraints
      setCropPosition(prev => ({
        x: Math.max(-maxOffset, Math.min(maxOffset, prev.x)),
        y: Math.max(-maxOffset, Math.min(maxOffset, prev.y))
      }));
    }
  };

  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      if (isDragging && cropContainerRef.current) {
        const rect = cropContainerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Calculate new position
        const newX = clientX - centerX - dragStart.x;
        const newY = clientY - centerY - dragStart.y;
        
        // Constrain to image edges based on current zoom level
        // Image display size is 300px, scaled by cropScale
        // Crop circle size is 200px
        const displayImageSize = 300;
        const cropSize = 200;
        
        // When scaled, the effective image size is displayImageSize * cropScale
        const scaledImageSize = displayImageSize * cropScale;
        
        // Max offset = (scaled image size - crop size) / 2
        // This ensures the image edges never go beyond the crop circle boundaries
        // For both X and Y axes independently
        const maxOffsetX = Math.max(0, (scaledImageSize - cropSize) / 2);
        const maxOffsetY = Math.max(0, (scaledImageSize - cropSize) / 2);
        
        // Clamp both x and y independently to prevent dragging beyond image edges
        // Use Math.round to ensure pixel-perfect positioning
        const clampedX = Math.round(Math.max(-maxOffsetX, Math.min(maxOffsetX, newX)));
        const clampedY = Math.round(Math.max(-maxOffsetY, Math.min(maxOffsetY, newY)));
        
        setCropPosition({
          x: clampedX,
          y: clampedY
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Only prevent default if we're handling the gesture
      if (e.touches.length === 2 && pinchStart) {
        e.preventDefault();
        e.stopPropagation();
      } else if (e.touches.length === 1 && isDragging) {
        e.preventDefault();
        e.stopPropagation();
      }
      
      if (e.touches.length === 2 && pinchStart) {
        // Pinch to zoom - only within the crop container
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        
        // Calculate scale change more smoothly
        const scaleChange = distance / pinchStart.distance;
        const newScale = Math.max(1, Math.min(3, pinchStart.scale * scaleChange));
        
        // Update scale immediately for fluid response
        setCropScale(newScale);
        
        // Adjust position constraints when zoom changes
        const displayImageSize = 300;
        const cropSize = 200;
        const scaledImageSize = displayImageSize * newScale;
        const maxOffset = Math.max(0, (scaledImageSize - cropSize) / 2);
        
        // Clamp current position to new constraints
        setCropPosition(prev => ({
          x: Math.max(-maxOffset, Math.min(maxOffset, prev.x)),
          y: Math.max(-maxOffset, Math.min(maxOffset, prev.y))
        }));
      } else if (e.touches.length === 1 && isDragging) {
        // Single touch - drag
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
      }
    };

    const handleEnd = () => {
      setIsDragging(false);
      setPinchStart(null);
    };

    if (isDragging || pinchStart) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleEnd);
      document.addEventListener('touchcancel', handleEnd);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleEnd);
        document.removeEventListener('touchcancel', handleEnd);
      };
    }
  }, [isDragging, dragStart, cropScale, cropPosition, pinchStart]);

  const handleApproveCrop = () => {
    const img = imageRef.current;
    if (!imageToCrop || !cropContainerRef.current || !img || !img.complete || img.naturalWidth === 0) return;

    const displayImageSize = 300;
    const outputSize = 200;
    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;
    const aspectRatio = imgHeight > 0 ? imgWidth / imgHeight : 1;
    const isSquare = aspectRatio >= 0.8 && aspectRatio <= 1.25;
    // On save: zoom out ~20%; square/near-square -20, rectangle 20 for Y alignment
    const saveZoomOut = 0.8;
    const effectiveScale = cropScale * saveZoomOut;
    const saveOffsetY = isSquare ? -5 : 20;
    const scaleX = displayImageSize / imgWidth;
    const scaleY = displayImageSize / imgHeight;
    const coverScale = Math.max(scaleX, scaleY);
    const displayedWidth = imgWidth * coverScale;
    const displayedHeight = imgHeight * coverScale;
    const coverOffsetX = (displayedWidth - displayImageSize) / 2;
    const coverOffsetY = (displayedHeight - displayImageSize) / 2;

    // 1) Draw into a buffer using zoomed-out scale and shifted-up position (modal transform adjusted for save)
    const bufferSize = Math.ceil(displayImageSize * effectiveScale);
    const buffer = document.createElement('canvas');
    buffer.width = bufferSize;
    buffer.height = bufferSize;
    const bCtx = buffer.getContext('2d');
    if (!bCtx) return;
    bCtx.translate(bufferSize / 2 + cropPosition.x, bufferSize / 2 + cropPosition.y + saveOffsetY);
    bCtx.scale(effectiveScale, effectiveScale);
    bCtx.translate(-displayImageSize / 2, -displayImageSize / 2);
    bCtx.drawImage(img, -coverOffsetX, -coverOffsetY, displayedWidth, displayedHeight);

    // 2) Output 200x200 circle = center 200x200 of the buffer (crop circle in modal is centered)
    const canvas = document.createElement('canvas');
    canvas.width = outputSize;
    canvas.height = outputSize;
    const outCtx = canvas.getContext('2d');
    if (!outCtx) return;
    outCtx.beginPath();
    outCtx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
    outCtx.clip();
    const srcX = Math.max(0, bufferSize / 2 - outputSize / 2);
    const srcY = Math.max(0, bufferSize / 2 - outputSize / 2);
    outCtx.drawImage(buffer, srcX, srcY, outputSize, outputSize, 0, 0, outputSize, outputSize);

    const croppedImage = canvas.toDataURL('image/png');
    setProfileImage(croppedImage);
    try {
      localStorage.setItem('profileImage', croppedImage);
      const currentUserRaw = localStorage.getItem('currentUser');
      if (currentUserRaw) {
        const currentUser = JSON.parse(currentUserRaw);
        const email = (currentUser?.email || '').trim().toLowerCase();
        if (email) {
          currentUser.profileImage = croppedImage;
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
          const registered = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
          const idx = registered.findIndex((u: any) => (u.email || '').trim().toLowerCase() === email);
          if (idx !== -1) {
            registered[idx] = { ...registered[idx], profileImage: croppedImage };
            localStorage.setItem('registeredUsers', JSON.stringify(registered));
          }
        }
      }
    } catch (e) {
      console.warn('Failed to save profile image:', e);
    }
    setShowCropModal(false);
    setImageToCrop(null);
    setCropPosition({ x: 0, y: 0 });
    setCropScale(1);
  };

  const handleCancelCrop = () => {
    setShowCropModal(false);
    setImageToCrop(null);
    setCropPosition({ x: 0, y: 0 });
    setCropScale(1);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isImageChanged = profileImage !== '/assets/profile-thumb.png';

  return (
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
                    onClick={() => {
                      // Check if user is premium member
                      try {
                        const isSignedIn = localStorage.getItem('isSignedIn') === 'true';
                        if (isSignedIn) {
                          const currentUser = localStorage.getItem('currentUser');
                          if (currentUser) {
                            const user = JSON.parse(currentUser);
                            const isPremium = user?.membershipType === 'PREMIUM' || user?.membershipType === 'Premium';
                            if (isPremium) {
                              navigate('/'); // Lobby for premium members
                            } else {
                              navigate('/home/shop'); // Shop for standard/non-members
                            }
                          } else {
                            navigate('/home/shop'); // Default to shop if not signed in
                          }
                        } else {
                          navigate('/home/shop'); // Default to shop if not signed in
                        }
                      } catch (e) {
                        navigate('/home/shop'); // Default to shop on error
                      }
                    }}
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
                    style={{ fontFamily: '"Futura PT Book"', fontWeight: '400' }}
                  >
                    ACCOUNT &gt;
                  </span>{' '}
                  <span
                    style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}
                  >
                    PROFILE
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
            ) : (
              /* PROFILE CONTENT */
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Profile Information Section */}
                <div
                  className={`border border-black bg-white/60 backdrop-blur-sm w-full ${cardAnimationsEnabled ? 'transition-all duration-300 ease-out' : ''}`}
                  style={{
                    borderWidth: '1.3px',
                    padding: '20px 20px',
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '16px',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    WebkitBackdropFilter: 'blur(10px)'
                  }}
                >
                  {/* Profile Picture - circle viewport matches crop modal framing (no extra scale/translate) */}
                  <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '100px',
                        height: '100px',
                        position: 'relative',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        borderRadius: '50%',
                        border: '1.3px solid #000',
                        flexShrink: 0
                      }}
                      onClick={() => setShowEnlargedImage(true)}
                    >
                      <img
                        src={profileImage}
                        alt="Profile"
                        style={{
                          display: 'block',
                          width: '100%',
                          height: '100%',
                          objectFit: isImageChanged ? 'cover' : 'fill',
                          objectPosition: 'center center',
                          margin: 0,
                          padding: 0,
                          verticalAlign: 'middle'
                        }}
                      />
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                    {isImageChanged ? (
                      <p
                        style={{
                          fontFamily: '"Futura PT Medium"',
                          fontSize: '9px',
                          color: '#000000',
                          margin: '0',
                          textTransform: 'uppercase',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}
                      >
                        <span onClick={handleChangePhotoClick}>CHANGE</span>
                        <span style={{ margin: '0 4px' }}>|</span>
                        <span onClick={handleResetPhotoClick}>RESET</span>
                      </p>
                    ) : (
                      <p
                        onClick={handleChangePhotoClick}
                        style={{
                          fontFamily: '"Futura PT Medium"',
                          fontSize: '9px',
                          color: '#000000',
                          margin: '0',
                          textTransform: 'uppercase',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}
                      >
                        CHANGE PHOTO
                      </p>
                    )}
                  </div>

                  {/* Profile Details */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'flex-start', transform: 'translateX(6px)' }}>
                    <p
                      style={{
                        fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                        color: '#000000',
                        fontSize: '18px',
                        lineHeight: '1.1',
                        margin: '0',
                        marginTop: '4px',
                        textTransform: 'uppercase',
                        transform: 'translateY(3px)'
                      }}
                      >
                      {userData ? `${(userData.firstName || '').toUpperCase()} ${(userData.lastName || '').toUpperCase()}`.trim() || 'ACCOUNT' : (isSignedIn ? '' : 'KRISTIN WATSON')}
                    </p>

                    <p
                      style={{
                        fontFamily: '"Futura PT Medium"',
                        color: '#EB1C24',
                        fontSize: '10px',
                        margin: '0',
                        textTransform: 'uppercase',
                        fontWeight: '500',
                        transform: 'translateY(-2px)',
                        textDecoration: 'none'
                      }}
                    >
                      {userData ? (userData.email || '').toUpperCase() : (isSignedIn ? '' : 'BRUNO203@GMAIL.COM')}
                    </p>

                    {(() => {
                      // Get membership type from userData, fallback to state
                      const userMembershipType = userData?.membershipType?.toUpperCase() || membershipType;
                      const displayMembershipType = userMembershipType === 'PREMIUM' ? 'PREMIUM' : 'BASIC';
                      // For BASIC: always use gray regardless of tier
                      // Premium = black, Standard = gray; rewards page explains tier levels
                      const membershipTextColor = displayMembershipType === 'PREMIUM' ? '#000000' : '#808080';
                      return (
                        <>
                          <p
                            style={{
                              fontFamily: '"Futura PT Medium"',
                              fontSize: '10px',
                              margin: '0',
                              textTransform: 'uppercase',
                              fontWeight: '500',
                              transform: 'translateY(-8px)',
                              color: membershipTextColor
                            }}
                          >
                            {displayMembershipType} REWARDS MEMBER
                          </p>
                          {isAyoteenzAdminAccount(userData) && (
                            <p
                              style={{
                                fontFamily: '"Futura PT Medium"',
                                fontSize: '10px',
                                margin: '-6px 0 0 0',
                                textTransform: 'uppercase',
                                fontWeight: '500',
                                transform: 'translateY(-8px)'
                              }}
                            >
                              <span style={{ color: '#EB1C24' }}>ADMIN: </span>
                              <span style={{ color: '#000000' }}>FOUNDER</span>
                            </p>
                          )}
                        </>
                      );
                    })()}

                    <p
                      role="button"
                      tabIndex={0}
                      onClick={() => setShowVoucherHistoryPopup(true)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowVoucherHistoryPopup(true); } }}
                      style={{
                        fontFamily: '"Futura PT Medium"',
                        color: '#808080',
                        fontSize: '10px',
                        margin: '0 0 -12px 0',
                        textTransform: 'uppercase',
                        fontWeight: '500',
                        transform: 'translateY(5px)',
                        cursor: 'pointer'
                      }}
                    >
                      VOUCHER: {(userData?.voucherList && Array.isArray(userData.voucherList) ? userData.voucherList.length : userData?.voucherCount) ?? 0} AVAILABLE
                    </p>

                    <p
                      role="button"
                      tabIndex={0}
                      onClick={() => setShowDigitalCashHistoryPopup(true)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowDigitalCashHistoryPopup(true); } }}
                      style={{
                        fontFamily: '"Futura PT Medium"',
                        color: '#000000',
                        fontSize: '10px',
                        margin: '0',
                        textTransform: 'uppercase',
                        fontWeight: '500',
                        transform: 'translateY(9px)',
                        cursor: 'pointer'
                      }}
                    >
                      DIGITAL CASH: {formatPrice(userData?.giftCardBalance || 0)}
                    </p>

                    <p
                      onClick={() => navigate('/account/load-card')}
                      style={{
                        fontFamily: '"Futura PT Medium"',
                        color: '#EB1C24',
                        fontSize: '9px',
                        margin: '0',
                        textTransform: 'uppercase',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transform: 'translateY(2px)'
                      }}
                    >
                      LOAD GIFT CARD
                    </p>
                  </div>
                </div>

                {/* Navigation Options */}
                {getCardsForDisplay().map((item) => {
                  const hasNotification = cardHasNotifications(item.title);
                  return (
                  <div
                    key={item.title}
                    onClick={() => {
                      if (item.route) {
                        navigate(item.route);
                      }
                    }}
                    className={`border border-black bg-white/60 backdrop-blur-sm cursor-pointer w-full ${cardAnimationsEnabled ? 'transition-all duration-300 ease-out' : ''}`}
                    style={{
                      borderWidth: '1.3px',
                      padding: '13px 20px',
                      backgroundColor: 'rgba(255, 255, 255, 0.6)',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      position: 'relative'
                    }}
                  >
                    {/* Rose alert notification icon */}
                    {hasNotification && (
                      <img
                        src="/assets/rose-alert.svg"
                        alt="Notification"
                        style={{
                          position: 'absolute',
                          top: '50%',
                          right: '22px',
                          transform: 'translateY(-50%)',
                          width: '14px',
                          height: '14px',
                          zIndex: 10
                        }}
                      />
                    )}
                    <p
                      style={{
                        fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                        color: '#000000',
                        fontSize: '20px',
                        lineHeight: '1.2',
                        margin: '0 0 4px 0',
                        textTransform: 'uppercase',
                        transform: 'translateX(5px)'
                      }}
                    >
                      {item.title}
                    </p>
                    <p
                      style={{
                        fontFamily: '"Futura PT Medium"',
                        color: '#EB1C24',
                        fontSize: '10px',
                        margin: '0',
                        textTransform: 'uppercase',
                        fontWeight: '500',
                        transform: 'translateX(5px)'
                      }}
                    >
                      {item.subtitle}
                    </p>
                  </div>
                  );
                })}
              </div>
            )}

            {/* SIGN OUT BUTTON - Only show when menu is closed */}
            {!showMobileMenu && (
              <div className="px-0 md:px-0" style={{ marginTop: '16px', marginBottom: '20px' }}>
                <button
                  onClick={() => setShowSignOutConfirm(true)}
                  className="border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
                  style={{ 
                    borderWidth: '1.3px', 
                    color: '#EB1C24',
                    fontFamily: '"Futura PT Medium"',
                    backgroundColor: '#FFFFFF'
                  }}
                  type="button"
                >
                  SIGN OUT
                </button>
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
        title="SIGN OUT"
        message="ARE YOU SURE YOU WANT TO SIGN OUT?"
        confirmText="CONFIRM"
        cancelText="CANCEL"
        dataAttribute="sign-out-confirm"
      />

      {/* Reset Photo Confirmation Modal */}
      {showResetConfirm && (
        <div 
          style={{
            position: 'fixed',
            inset: '0',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(3px)',
            WebkitBackdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            margin: '0',
            padding: '0'
          }}
          onClick={() => setShowResetConfirm(false)}
        >
          <div
            className="p-6"
            style={{
              maxWidth: '400px',
              width: '90%',
              border: '1.3px solid black',
              borderRadius: '0',
              transform: 'translateY(-6px)',
              backgroundImage: 'url(/assets/popup-marble.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundColor: 'white'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '16px',
                textTransform: 'uppercase',
                textAlign: 'center',
                color: '#EB1C24'
              }}
            >
              RESET PHOTO
            </h3>
            <p
              style={{
                fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                fontSize: '10px',
                marginBottom: '20px',
                color: '#000000',
                textTransform: 'uppercase',
                textAlign: 'center',
                transform: 'translateY(-1px)'
              }}
            >
              ARE YOU SURE YOU WANT TO RESET YOUR PROFILE PHOTO?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowResetConfirm(false)}
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
              <button
                onClick={handleConfirmReset}
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
                RESET
              </button>
            </div>
          </div>
        </div>
      )}

        {/* Photo Crop Modal */}
        {showCropModal && imageToCrop && (
          <div
            style={{
              position: 'fixed',
              inset: '0',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(3px)',
              WebkitBackdropFilter: 'blur(3px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10001,
              margin: '0',
              padding: '0',
              touchAction: 'none'
            }}
            onClick={handleCancelCrop}
            onTouchStart={(e) => {
              // Prevent page zoom when touching outside the crop area
              if (!cropContainerRef.current?.contains(e.target as Node)) {
                e.preventDefault();
              }
            }}
            onTouchMove={(e) => {
              // Prevent page zoom when moving outside the crop area
              if (!cropContainerRef.current?.contains(e.target as Node)) {
                e.preventDefault();
              }
            }}
          >
          <div
            className="p-6"
            style={{
              maxWidth: '400px',
              width: '90%',
              border: '1.3px solid black',
              borderRadius: '0',
              transform: 'translateY(-6px)',
              backgroundImage: 'url(/assets/popup-marble.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundColor: 'white'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                fontSize: '24px',
                fontWeight: '400',
                marginBottom: '16px',
                textTransform: 'uppercase',
                textAlign: 'center',
                color: '#EB1C24'
              }}
            >
              CROP THUMBNAIL
            </h3>
            <p
              style={{
                fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                fontSize: '10px',
                marginBottom: '20px',
                color: '#000000',
                textTransform: 'uppercase',
                textAlign: 'center',
                transform: 'translateY(-14px)'
              }}
            >
              DRAG TO POSITION YOUR ACCOUNT PHOTO.
            </p>
            
            {/* Crop Area */}
            <div
              ref={cropContainerRef}
              style={{
                width: '200px',
                height: '200px',
                margin: '0 auto 20px',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '50%',
                border: '1.3px solid #000',
                cursor: isDragging ? 'grabbing' : 'grab',
                touchAction: 'none',
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                userSelect: 'none',
                transform: 'translateY(-10px)',
                clipPath: 'circle(100px at 50% 50%)',
                WebkitClipPath: 'circle(100px at 50% 50%)'
              }}
              onMouseDown={handleCropMouseDown}
              onTouchStart={handleCropTouchStart}
              onWheel={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCropWheel(e);
              }}
            >
              <img
                ref={imageRef}
                src={imageToCrop}
                alt="Crop preview"
                style={{
                  width: '300px',
                  height: '300px',
                  objectFit: 'cover',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: `translate(calc(-50% + ${cropPosition.x}px), calc(-50% + ${cropPosition.y}px)) scale(${cropScale})`,
                  userSelect: 'none',
                  pointerEvents: 'none'
                }}
                draggable={false}
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleCancelCrop}
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
              <button
                onClick={handleApproveCrop}
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
                APPROVE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Digital Cash History Popup */}
      {showDigitalCashHistoryPopup && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            padding: '16px'
          }}
          onClick={() => setShowDigitalCashHistoryPopup(false)}
        >
          <div
            className="bg-white/60 backdrop-blur-sm border border-black"
            style={{
              borderWidth: '1.3px',
              padding: '16px',
              maxWidth: '400px',
              width: '100%',
              maxHeight: '85vh',
              overflow: 'auto',
              position: 'relative'
            }}
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
                DIGITAL CASH HISTORY
              </p>
              <img src="/assets/points-history.svg" alt="" style={{ width: '16px', height: '16px', flexShrink: 0, objectFit: 'contain', filter: 'invert(27%) sepia(98%) saturate(7151%) hue-rotate(349deg) brightness(92%) contrast(92%)' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', fontSize: '10px', textTransform: 'uppercase', marginBottom: '8px', fontFamily: '"Futura PT Medium"', fontWeight: '500', color: '#000000' }}>
              <span style={{ flex: '1 1 0', minWidth: 0, textAlign: 'left' }}>DATE</span>
              <span style={{ flex: '1 1 0', minWidth: 0, textAlign: 'center' }}>TRANSACTION</span>
              <span style={{ flex: '1 1 0', minWidth: 0, textAlign: 'right' }}>AMOUNT</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(() => {
                const history = (userData?.digitalCashHistory ?? []) as Array<{ date: string; transaction: string; amount: number }>;
                const formatDate = (dateStr: string): string => {
                  const parts = dateStr.split('-').map(Number);
                  if (parts.length === 3) {
                    const [month, day, year] = parts;
                    const d = new Date(year, month - 1, day);
                    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  }
                  const d = new Date(dateStr);
                  if (!isNaN(d.getTime())) return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  return dateStr;
                };
                const displayHistory = history.length === 0 && isMockDataAccount(userData)
                  ? MOCK_DIGITAL_CASH_HISTORY
                  : history;
                if (displayHistory.length === 0) {
                  return (
                    <p style={{ fontFamily: '"Futura PT Medium"', fontWeight: '500', fontSize: '10px', color: '#808080', margin: '6px 0', textTransform: 'uppercase', textAlign: 'center' }}>
                      YOU HAVEN'T HAD ANY DIGITAL CASH TRANSACTIONS YET.
                    </p>
                  );
                }
                const sorted = [...displayHistory].sort((a, b) => {
                  const parse = (s: string) => {
                    const parts = s.split('-').map(Number);
                    if (parts.length === 3) {
                      const [month, day, year] = parts;
                      return new Date(year, month - 1, day).getTime();
                    }
                    return new Date(s).getTime();
                  };
                  return parse(b.date) - parse(a.date);
                });
                return sorted.map((row, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', width: '100%', fontSize: '10px', textTransform: 'uppercase' }}>
                    <span style={{ flex: '1 1 0', minWidth: 0, textAlign: 'left', color: '#000000', fontFamily: '"Futura PT Book"' }}>{formatDate(row.date)}</span>
                    <span style={{ flex: '1 1 0', minWidth: 0, textAlign: 'center', color: '#808080', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}>{row.transaction}</span>
<span style={{ flex: '1 1 0', minWidth: 0, textAlign: 'right', color: row.amount >= 0 ? '#16a34a' : '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}>
                                      {row.amount >= 0 ? '+' : ''}{formatPrice(row.amount)}
                                    </span>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Voucher History Popup */}
      {showVoucherHistoryPopup && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            padding: '16px'
          }}
          onClick={() => setShowVoucherHistoryPopup(false)}
        >
          <div
            className="bg-white/60 backdrop-blur-sm border border-black"
            style={{
              borderWidth: '1.3px',
              padding: '16px',
              maxWidth: '400px',
              width: '100%',
              maxHeight: '85vh',
              overflow: 'auto',
              position: 'relative'
            }}
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
                VOUCHER HISTORY
              </p>
              <img src="/assets/points-history.svg" alt="" style={{ width: '16px', height: '16px', flexShrink: 0, objectFit: 'contain', filter: 'invert(27%) sepia(98%) saturate(7151%) hue-rotate(349deg) brightness(92%) contrast(92%)' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', fontSize: '10px', textTransform: 'uppercase', marginBottom: '8px', fontFamily: '"Futura PT Medium"', fontWeight: '500', color: '#000000' }}>
              <span style={{ flex: '1 1 0', minWidth: 0, textAlign: 'left' }}>DATE</span>
              <span style={{ flex: '1 1 0', minWidth: 0, textAlign: 'center' }}>TRANSACTION</span>
              <span style={{ flex: '1 1 0', minWidth: 0, textAlign: 'right' }}>AMOUNT</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(() => {
                const history = (userData?.voucherHistory ?? []) as Array<{ date: string; transaction: string; amount: number }>;
                const formatDate = (dateStr: string): string => {
                  const parts = dateStr.split('-').map(Number);
                  if (parts.length === 3) {
                    const [month, day, year] = parts;
                    const d = new Date(year, month - 1, day);
                    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  }
                  const d = new Date(dateStr);
                  if (!isNaN(d.getTime())) return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  return dateStr;
                };
                const displayHistory = history.length === 0 && isMockDataAccount(userData) ? MOCK_VOUCHER_HISTORY : history;
                if (displayHistory.length === 0) {
                  return (
                    <p style={{ fontFamily: '"Futura PT Medium"', fontWeight: '500', fontSize: '10px', color: '#808080', margin: '6px 0', textTransform: 'uppercase', textAlign: 'center' }}>
                      YOU HAVEN'T HAD ANY VOUCHER TRANSACTIONS YET.
                    </p>
                  );
                }
                const sorted = [...displayHistory].sort((a, b) => {
                  const parse = (s: string) => {
                    const parts = s.split('-').map(Number);
                    if (parts.length === 3) {
                      const [month, day, year] = parts;
                      return new Date(year, month - 1, day).getTime();
                    }
                    return new Date(s).getTime();
                  };
                  return parse(b.date) - parse(a.date);
                });
                const transactionDisplay = (tx: string) => tx.replace(/\bFLEXIBLE CAP\b/gi, 'FLEX CAP');
                return sorted.map((row, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', width: '100%', fontSize: '10px', textTransform: 'uppercase' }}>
                    <span style={{ flex: '1 1 0', minWidth: 0, textAlign: 'left', color: '#000000', fontFamily: '"Futura PT Book"' }}>{formatDate(row.date)}</span>
                    <span style={{ flex: '1 1 0', minWidth: 0, textAlign: 'center', color: '#808080', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}>{transactionDisplay(row.transaction)}</span>
                    <span style={{ flex: '1 1 0', minWidth: 0, textAlign: 'right', color: row.amount >= 0 ? '#16a34a' : '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}>
                      {row.amount >= 0 ? '+' : ''}{row.amount}
                    </span>
                  </div>
                ));
              })()}
            </div>
            <p style={{ fontFamily: '"Futura PT Medium"', fontWeight: '500', fontSize: '9px', color: '#000000', margin: '12px 0 0 0', paddingTop: '12px', borderTop: '1px solid #E5E5E5', textTransform: 'uppercase' }}>
              VOUCHERS AVAILABLE: {(() => {
                const list = userData?.voucherList && Array.isArray(userData.voucherList) ? userData.voucherList as string[] : [];
                if (list.length === 0) return <span style={{ color: '#808080' }}>NONE</span>;
                const byType: Record<string, number> = {};
                for (const v of list) {
                  const spaceIdx = v.indexOf(' ');
                  if (spaceIdx <= 0) continue;
                  const prefix = v.slice(0, spaceIdx).replace(/[xX]/g, '').trim();
                  const type = v.slice(spaceIdx + 1).trim().toUpperCase();
                  const num = parseInt(prefix, 10) || 1;
                  byType[type] = (byType[type] || 0) + num;
                }
                const aggregated = Object.entries(byType).map(([type, n]) => ({ type, n }));
                const order = VOUCHER_DISPLAY_ORDER;
                const sorted = [...aggregated].sort((a, b) => {
                  const ai = order.indexOf(a.type);
                  const bi = order.indexOf(b.type);
                  if (ai === -1 && bi === -1) return a.type.localeCompare(b.type);
                  if (ai === -1) return 1;
                  if (bi === -1) return -1;
                  return ai - bi;
                });
                const typeDisplay = (t: string) => t === 'FLEXIBLE CAP' ? 'FLEX CAP' : t;
                return sorted.map(({ type, n }, i) => (
                  <span key={i}>
                    {i > 0 && ', '}
                    <span style={{ color: '#EB1C24' }}>{n}X</span>
                    <span style={{ color: '#808080' }}> {typeDisplay(type)}</span>
                  </span>
                ));
              })()}
            </p>
          </div>
        </div>
      )}

      {/* Enlarged Profile Image Modal */}
      {showEnlargedImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)'
          }}
          onClick={() => setShowEnlargedImage(false)}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '90%',
              maxHeight: '90%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={profileImage}
              alt="Profile"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                borderRadius: '50%',
                border: '1.3px solid #000'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default AccountPage;

