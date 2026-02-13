import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DynamicCartIcon from '../../components/DynamicCartIcon';
import ConfirmationModal from '../../components/ConfirmationModal';
import { getWelcomeDiscountAmount } from '../../constants/tiers';

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
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showEnlargedImage, setShowEnlargedImage] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 });
  const [cropScale, setCropScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [pinchStart, setPinchStart] = useState<{ distance: number; scale: number } | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  
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

  // Initialize Kateena's admin account with proper gift card balance and unlocked discounts
  useEffect(() => {
    if (userData) {
      const isKateenaArmstrong = userData && (
        (userData.firstName?.toLowerCase() === 'kateena' && userData.lastName?.toLowerCase() === 'armstrong') ||
        userData.email?.toLowerCase().includes('kateena') ||
        userData.email?.toLowerCase().includes('armstrong')
      );

      if (isKateenaArmstrong) {
        try {
          const currentUser = localStorage.getItem('currentUser');
          if (currentUser) {
            const user = JSON.parse(currentUser);
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
          console.error('Error initializing Kateena account:', e);
        }
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
      const updatedUser = {
        ...currentUser,
        giftCardBalance: currentBalance + amount,
        welcomeDiscountTiersCreditedByPeriod: { ...byPeriod, [periodKey]: updatedCreditedThisPeriod }
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
    // Clear from localStorage
    try {
      localStorage.removeItem('profileImage');
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
        } else if (spending >= 500 && !highestTier) {
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

    // Check for mock users first
    const isKristinWatson = userData?.email?.toLowerCase() === 'bruno203@gmail.com' || !userData;
    const isKateenaArmstrong = userData && (
      (userData.firstName?.toLowerCase() === 'kateena' && userData.lastName?.toLowerCase() === 'armstrong') ||
      userData.email?.toLowerCase().includes('kateena') ||
      userData.email?.toLowerCase().includes('armstrong')
    );

    if (isKristinWatson || isKateenaArmstrong) {
      // For mock users, return null to show "MEMBER" text
      return null;
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
    } else if (totalSpending >= 500) {
      currentTier = 'SILVER';
    }

    // SILVER is the base tier - everyone gets it on signup
    // But benefits only unlock when spending thresholds are met
    
    // Tier retention logic:
    // - No tier (null): Base state until $500 spending - shows "MEMBER"
    // - Silver: Unlocks at $500+ spending
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
    // Only becomes SILVER tier once they reach $500 spending threshold
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
      // Check for unread notifications in localStorage
      const notificationsStr = localStorage.getItem('notifications');
      if (notificationsStr) {
        const notifications = JSON.parse(notificationsStr);
        // Check for unread notifications
        return notifications.some((n: any) => !n.isRead);
      }
      
      // If no stored notifications, check if there are default unread notifications
      // (This would be set when notifications are first created)
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
    
    // For admin account (Kateena), show notifications for testing
    const isKateenaArmstrong = userData && (
      (userData.firstName?.toLowerCase() === 'kateena' && userData.lastName?.toLowerCase() === 'armstrong') ||
      userData.email?.toLowerCase().includes('kateena') ||
      userData.email?.toLowerCase().includes('armstrong')
    );
    
    // Admin account always shows affiliate notifications for testing
    if (isKateenaArmstrong) {
      return true;
    }
    
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
        
        // Check for pending approvals
        const hasPending = [...photos, ...videos, ...socials].some((item: any) => item.status === 'pending');
        
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

  const hasReviewsNotifications = (): boolean => {
    if (!userData) return false;
    try {
      const userOrdersKey = `userOrders_${userData.email}`;
      const storedOrders = localStorage.getItem(userOrdersKey);
      if (!storedOrders) return false;
      
      const orders = JSON.parse(storedOrders);
      const allOrders = [...(orders.activeOrders || []), ...(orders.pastOrders || [])];
      
      // Check for delivered orders that are ready for review (delivered more than 24 hours ago, no review yet)
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      return allOrders.some((order: any) => {
        if (order.status !== 'DELIVERED') return false;
        if (!order.deliveredAt) return false;
        
        const timeSinceDelivered = now - order.deliveredAt;
        if (timeSinceDelivered < twentyFourHours) return false; // Not ready yet
        
        // Check if review has been submitted
        const reviewKey = `reviewSubmitted_${order.id}`;
        return !localStorage.getItem(reviewKey);
      });
    } catch (e) {
      return false;
    }
  };

  const hasPaymentMethodNotifications = (): boolean => {
    if (!userData) return false;
    try {
      const savedCardsStr = localStorage.getItem(`savedCards_${userData.email}`);
      if (!savedCardsStr) return false;
      
      const savedCards = JSON.parse(savedCardsStr);
      
      // Check for cards about to expire (within 30 days) or new cards added
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      return savedCards.some((card: any) => {
        // Check if card is about to expire
        if (card.expiryDate) {
          const expiryDate = new Date(card.expiryDate);
          if (expiryDate <= thirtyDaysFromNow && expiryDate > now) {
            return true; // Expiring soon
          }
        }
        
        // Check if card is new (added within last 7 days and not seen)
        if (card.addedAt) {
          const addedDate = new Date(card.addedAt);
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (addedDate > sevenDaysAgo) {
            const seenKey = `cardSeen_${card.id}`;
            return !localStorage.getItem(seenKey);
          }
        }
        
        return false;
      });
    } catch (e) {
      return false;
    }
  };

  // Helper function to get default card order
  const getDefaultCardOrder = (): Array<{ title: string; subtitle: string; route: string | null }> => {
    const userMembershipType = userData?.membershipType || membershipType;
    const isPremium = userMembershipType === 'PREMIUM' || userMembershipType === 'Premium';
    const showConcierge = isPremium; // Concierge is only for premium members, not standard
    const defaultCards: Array<{ title: string; subtitle: string; route: string | null }> = [];
    
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
      { title: 'REFERRALS', subtitle: 'SHARE YOUR DISCOUNT CODE', route: '/account/referrals' },
      { title: 'AFFILIATE', subtitle: 'SUBMIT CONTENT FOR POINTS', route: '/account/affiliate' },
      { 
        title: 'REVIEWS', 
        subtitle: userData && userData.email?.toLowerCase() !== 'bruno203@gmail.com' ? '0 TOTAL REVIEWS' : '4 TOTAL REVIEWS', 
        route: null 
      },
      { 
        title: 'SHIPPING ADDRESS', 
        subtitle: userData && userData.email?.toLowerCase() !== 'bruno203@gmail.com' ? '0 ADDRESSES ON FILE' : '2 ADDRESSES ON FILE', 
        route: null 
      },
      { 
        title: 'PAYMENT METHOD', 
        subtitle: userData && userData.email?.toLowerCase() !== 'bruno203@gmail.com' ? '0 CARDS ON FILE' : '2 CARDS ON FILE', 
        route: null 
      },
      { title: 'SETTINGS', subtitle: 'PASSWORD + CONTROLS', route: null }
    );
    
    return defaultCards;
  };

  // Get ordered cards (using default order)
  const getOrderedCards = (): Array<{ title: string; subtitle: string; route: string | null }> => {
    return getDefaultCardOrder();
  };


  // Helper function to check if a specific card has notifications
  const cardHasNotifications = (title: string): boolean => {
    // For admin account (Kateena), show notifications on all cards for testing
    const isKateenaArmstrong = userData && (
      (userData.firstName?.toLowerCase() === 'kateena' && userData.lastName?.toLowerCase() === 'armstrong') ||
      userData.email?.toLowerCase().includes('kateena') ||
      userData.email?.toLowerCase().includes('armstrong')
    );
    
    if (isKateenaArmstrong) {
      // Admin account shows notifications on all cards for testing
      switch (title) {
        case 'ORDERS':
        case 'ALERTS':
        case 'REWARDS':
        case 'REFERRALS':
        case 'AFFILIATE':
        case 'REVIEWS':
        case 'PAYMENT METHOD':
          return true;
        default:
          return false;
      }
    }
    
    // Regular users - check actual notifications
    switch (title) {
      case 'ORDERS':
        return hasOrdersNotifications();
      case 'ALERTS':
        return hasAlertsNotifications();
      case 'REWARDS':
        return hasMembershipNotifications();
      case 'REFERRALS':
        return false;
      case 'AFFILIATE':
        return hasAffiliateNotifications();
      case 'REVIEWS':
        return hasReviewsNotifications();
      case 'PAYMENT METHOD':
        return hasPaymentMethodNotifications();
      default:
        return false;
    }
  };

  // Helper function to get active orders count (excluding DELIVERED status)
  const getActiveOrdersCount = (): number => {
    // Check for mock users first
    const isKristinWatson = userData?.email?.toLowerCase() === 'bruno203@gmail.com' || !userData;
    const isKateenaArmstrong = userData && (
      (userData.firstName?.toLowerCase() === 'kateena' && userData.lastName?.toLowerCase() === 'armstrong') ||
      userData.email?.toLowerCase().includes('kateena') ||
      userData.email?.toLowerCase().includes('armstrong')
    );

    if (isKristinWatson) {
      // Mock data for Kristin Watson: 2 active orders (excluding delivered)
      // Based on mockActiveOrders in orders page, excluding DELIVERED status
      return 2;
    }

    if (isKateenaArmstrong) {
      // Mock data for Kateena Armstrong: 2 active orders (ORDER #345 SHIPPED, ORDER #346 PREPARING)
      // ORDER #344 is DELIVERED, so it's excluded
      return 2;
    }

    // For other users, get from localStorage
    if (userData?.email) {
      try {
        const userOrdersKey = `userOrders_${userData.email}`;
        const storedOrders = localStorage.getItem(userOrdersKey);
        if (storedOrders) {
          const orders = JSON.parse(storedOrders);
          const activeOrders = orders.activeOrders || [];
          // Filter out DELIVERED orders
          const nonDeliveredOrders = activeOrders.filter((order: any) => order.status !== 'DELIVERED');
          return nonDeliveredOrders.length;
        }
      } catch (e) {
        console.error('Error loading order count:', e);
      }
    }

    return 0;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Immediately open crop modal - no confirmation needed
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setImageToCrop(reader.result as string);
          setShowCropModal(true);
          setCropPosition({ x: 0, y: 0 });
          setCropScale(1);
        }
      };
      reader.readAsDataURL(file);
    }
    // Reset input so same file can be selected again
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
    if (imageToCrop && cropContainerRef.current && imageRef.current) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const outputSize = 200;
      canvas.width = outputSize;
      canvas.height = outputSize;

      // Create circular clipping path
      ctx.beginPath();
      ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
      ctx.clip();

      // Draw directly to output canvas - capture exactly what's visible in the crop circle
      const img = imageRef.current;
      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;
      const displayImageSize = 300;
      
      // Calculate cover scale
      const scaleX = displayImageSize / imgWidth;
      const scaleY = displayImageSize / imgHeight;
      const coverScale = Math.max(scaleX, scaleY);
      
      // The image transform: top: 50%, left: 50% then translate(calc(-50% + cropPosition.x), ...) scale(cropScale)
      // top: 50%, left: 50% positions image top-left at container center (100, 100) in 200px container
      // translate(-50% + cropPosition.x) = translate(-150px + cropPosition.x) for 300px element
      // So image center (150px from top-left) is at: (100 - 150 + cropPosition.x, 100 - 150 + cropPosition.y) = (cropPosition.x - 50, cropPosition.y - 50)
      // 
      // When cropPosition = (0, 0): image center = (-50, -50) - NOT centered!
      // This means the initial position is wrong, OR cropPosition needs to be (150, 150) to center
      // 
      // Actually, wait: the -50% translate centers the image. So:
      // - Image top-left starts at (100, 100) from top:50%, left:50%
      // - Image center is naturally at (100 + 150, 100 + 150) = (250, 250) from container top-left
      // - After translate(-150), image center moves to (250 - 150, 250 - 150) = (100, 100) ✓ CENTERED!
      // - Then translate(cropPosition.x) moves it to (100 + cropPosition.x, 100 + cropPosition.y)
      // 
      // So the FULL transform is: translate(-150 + cropPosition.x, -150 + cropPosition.y)
      // Image center: (100 + 150 - 150 + cropPosition.x, 100 + 150 - 150 + cropPosition.y) = (100 + cropPosition.x, 100 + cropPosition.y)
      // 
      // So when cropPosition = (0, 0), image center is at (100, 100) = container center ✓
      // The crop circle center is also at (100, 100)
      // So the offset from image center to crop center is: (100 - (100 + cropPosition.x), 100 - (100 + cropPosition.y)) = (-cropPosition.x, -cropPosition.y)
      
      ctx.save();
      
      // Start at crop circle center
      ctx.translate(outputSize / 2, outputSize / 2);
      
      // Apply inverse transforms (reverse order: inverse scale, then inverse translate)
      // 1. Inverse scale
      ctx.scale(1 / cropScale, 1 / cropScale);
      
      // 2. Image center in container: (100 + cropPosition.x, 100 + cropPosition.y)
      //    Crop center: (100, 100)
      //    Offset: (100 - (100 + cropPosition.x), 100 - (100 + cropPosition.y)) = (-cropPosition.x, -cropPosition.y)
      ctx.translate(-cropPosition.x, -cropPosition.y);
      
      // 3. Translate to image center (150px from image top-left)
      ctx.translate(-displayImageSize / 2, -displayImageSize / 2);
      
      // Draw the source image with cover scaling
      const displayedWidth = imgWidth * coverScale;
      const displayedHeight = imgHeight * coverScale;
      const coverOffsetX = (displayedWidth - displayImageSize) / 2;
      const coverOffsetY = (displayedHeight - displayImageSize) / 2;
      
      ctx.drawImage(
        img,
        -coverOffsetX,
        -coverOffsetY,
        displayedWidth,
        displayedHeight
      );
      
      ctx.restore();
      
      const croppedImage = canvas.toDataURL('image/png');
      setProfileImage(croppedImage);
      // Save to localStorage
      try {
        localStorage.setItem('profileImage', croppedImage);
      } catch (e) {
        // Ignore errors (e.g., if localStorage is full)
        console.warn('Failed to save profile image to localStorage:', e);
      }
      setShowCropModal(false);
      setImageToCrop(null);
      setCropPosition({ x: 0, y: 0 });
      setCropScale(1);
    }
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
                      ['ABOUT US', 'CONTACT', 'CARE & STORAGE', 'BECOME A MEMBER', 'FAQ', 'PAYMENT + SHIPPING', 'REVIEWS', 'TERMS OF SERVICE'].map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
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
                <div className="flex justify-center" style={{ marginBottom: '0' }}>
                  <div className="flex" style={{ gap: '19px' }}>
                    <img
                      src="/assets/instagram-icon.svg"
                      alt="Instagram"
                      style={{ width: '20px', height: '20px' }}
                    />
                    <img
                      src="/assets/twitter-icon.svg"
                      alt="Twitter"
                      style={{ width: '20px', height: '20px' }}
                    />
                    <img
                      src="/assets/facebook-icon.svg"
                      alt="Facebook"
                      style={{ width: '20px', height: '20px' }}
                    />
                  </div>
                </div>
                </div>
              </div>
            ) : (
              /* PROFILE CONTENT */
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Profile Information Section */}
                <div
                  className="border border-black bg-white/60 backdrop-blur-sm w-full transition-all duration-300 ease-out"
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
                  {/* Profile Picture */}
                  <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div 
                      style={{ width: '100px', height: '100px', position: 'relative', cursor: 'pointer' }}
                      onClick={() => setShowEnlargedImage(true)}
                    >
                      <img
                        src={profileImage}
                        alt="Profile"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: isImageChanged ? 'contain' : 'fill',
                          borderRadius: '50%',
                          border: '1.3px solid #000'
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
                      {userData ? `${userData.firstName.toUpperCase()} ${userData.lastName.toUpperCase()}` : 'KRISTIN WATSON'}
                    </p>

                    <p
                      style={{
                        fontFamily: '"Futura PT Medium"',
                        color: '#EB1C24',
                        fontSize: '10px',
                        margin: '0',
                        textTransform: 'uppercase',
                        fontWeight: '500',
                        transform: 'translateY(-2px)'
                      }}
                    >
                      {userData ? userData.email.toUpperCase() : 'BRUNO203@GMAIL.COM'}
                    </p>

                    {(() => {
                      const tier = calculateTier();
                      // Get membership type from userData, fallback to state
                      const userMembershipType = userData?.membershipType?.toUpperCase() || membershipType;
                      const displayMembershipType = userMembershipType === 'PREMIUM' ? 'PREMIUM' : 'BASIC';
                      // For BASIC: always use gray regardless of tier
                      // For PREMIUM: always use black
                      const membershipTextColor = displayMembershipType === 'PREMIUM' ? '#000000' : '#808080';
                      // Tier color is independent: silver = gray, red = red, black = black
                      const tierColor = tier === 'SILVER' ? '#808080' : tier === 'RED' ? '#EB1C24' : tier === 'BLACK' ? '#000000' : '#000000';
                      return (
                        <p
                          style={{
                            fontFamily: '"Futura PT Medium"',
                            fontSize: '10px',
                            margin: '0',
                            textTransform: 'uppercase',
                            fontWeight: '500',
                            transform: 'translateY(-8px)'
                          }}
                        >
                          {tier ? (
                            <>
                              <span style={{ color: membershipTextColor }}>
                                {displayMembershipType} REWARDS:
                              </span>{' '}
                              <span style={{ color: tierColor }}>
                                {tier} TIER
                              </span>
                            </>
                          ) : (
                            <span style={{ color: membershipTextColor }}>
                              {displayMembershipType} REWARDS MEMBER
                            </span>
                          )}
                        </p>
                      );
                    })()}

                    <p
                      style={{
                        fontFamily: '"Futura PT Medium"',
                        color: '#000000',
                        fontSize: '10px',
                        margin: '0',
                        textTransform: 'uppercase',
                        fontWeight: '500',
                        transform: 'translateY(9px)'
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
                      LOAD CASH BALANCE
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
                    className="border border-black bg-white/60 backdrop-blur-sm cursor-pointer w-full transition-all duration-300 ease-out"
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
                objectFit: 'contain',
                borderRadius: '50%',
                border: '1.3px solid #000'
              }}
            />
            <button
              onClick={() => setShowEnlargedImage(false)}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontFamily: '"Futura PT Medium"',
                color: '#000',
                textTransform: 'uppercase',
                padding: '8px'
              }}
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AccountPage;

