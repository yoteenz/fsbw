import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DynamicCartIcon from '../../../components/DynamicCartIcon';
import ConfirmationModal from '../../../components/ConfirmationModal';

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

      // Check if this is Kateena Armstrong (uses mock data)
      const isKateenaArmstrong = (userData.firstName?.toLowerCase().includes('kateena') && 
                                  userData.lastName?.toLowerCase().includes('armstrong')) ||
                                  userData.email?.toLowerCase().includes('kateena') ||
                                  userData.email?.toLowerCase().includes('armstrong');

      let deliveredOrders: any[] = [];

      if (isKateenaArmstrong) {
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

  // Subscription tier data
  const subscriptionTiers = {
    '3months': { name: '3 MONTHS PREMIUM', price: 280 },
    '6months': { name: '6 MONTHS PREMIUM', price: 520 },
    '12months': { name: '12 MONTHS PREMIUM', price: 960 }
  };

  // Generate referral code from user data with conflict checking
  const generateReferralCode = (): string => {
    // If user already has a referral code stored, use it
    if (userData?.referralCode) {
      return userData.referralCode;
    }

    if (!userData) {
      return 'KA3047'; // Default/example code
    }

    // Get first initial of first name
    const firstInitial = userData.firstName && userData.firstName.length > 0 
      ? userData.firstName.charAt(0).toUpperCase() 
      : 'K';

    // Get first initial of last name
    const lastInitial = userData.lastName && userData.lastName.length > 0 
      ? userData.lastName.charAt(0).toUpperCase() 
      : 'A';

    // Extract day from birthday (format: MM/DD/YYYY)
    let day = '30'; // Default
    if (userData.birthday) {
      const birthdayParts = userData.birthday.split('/');
      if (birthdayParts.length >= 2) {
        day = birthdayParts[1].padStart(2, '0'); // Ensure 2 digits
      }
    }

    // Extract phone number digits
    let phoneDigits = '2647'; // Default
    if (userData.phoneNumber) {
      // Remove all non-digit characters
      phoneDigits = userData.phoneNumber.replace(/\D/g, '');
    }

    // Try primary code (last 2 digits)
    let lastTwoDigits = phoneDigits.length >= 2 ? phoneDigits.slice(-2) : '47';
    let primaryCode = `${firstInitial}${lastInitial}${day}${lastTwoDigits}`;

    // Check if code already exists in registeredUsers
    try {
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const codeExists = registeredUsers.some((user: any) => 
        user.referralCode === primaryCode && user.email !== userData.email
      );

      // If code is taken, use alternative (2 digits before last 2)
      if (codeExists && phoneDigits.length >= 4) {
        const alternativeDigits = phoneDigits.slice(-4, -2); // 2 digits before last 2
        return `${firstInitial}${lastInitial}${day}${alternativeDigits}`;
      }
    } catch (e) {
      // If error checking, just return primary code
    }

    return primaryCode;
  };

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
  // Includes users with subscriptionTier OR admin accounts with PREMIUM membership (like Kateena)
  const isKateenaArmstrong = userData && (
    (userData.firstName?.toLowerCase() === 'kateena' && userData.lastName?.toLowerCase() === 'armstrong') ||
    userData.email?.toLowerCase().includes('kateena') ||
    userData.email?.toLowerCase().includes('armstrong')
  );
  const hasPremiumSubscription = (userData?.subscriptionTier && userData?.membershipType === 'PREMIUM') || 
                                  (isKateenaArmstrong && (userData?.membershipType === 'PREMIUM' || userData?.membershipType === 'Premium'));

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
    // For Kateena's admin account, set to 12months
    if (isKateenaArmstrong && !currentTier) {
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
    // Check if this is Kateena's admin account (12 months from 1/4/2026)
    if (isKateenaArmstrong) {
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
    // Kateena's admin account is 12 months premium
    if (isKateenaArmstrong) return '12 MONTH';
    
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
              <div style={{ transform: 'translateX(5px)' }}>
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
                      borderBottom: mobileMenuActiveTab === 'SHOP' ? '2px solid #EB1C24' : 'none',
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
                      borderBottom: mobileMenuActiveTab === 'TOOLS' ? '2px solid #EB1C24' : 'none',
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
                      borderBottom: mobileMenuActiveTab === 'BRAND' ? '2px solid #EB1C24' : 'none',
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
              <>
                {/* MEMBERSHIP CONTENT */}
              <div
                className="border border-black bg-white/60 backdrop-blur-sm w-full transition-all duration-300 ease-out"
                style={{
                  borderWidth: '1.3px',
                  padding: '20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.6)'
                }}
              >
                {showLoyaltyRewards ? (
                  /* LOYALTY POINTS VIEW */
                  <>
                    {/* LOYALTY POINTS Header */}
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
                          LOYALTY POINTS
                    </h2>
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

                      {/* LOYALTY POINTS Content */}
                      <div>
                    <p
                      style={{
                            fontFamily: '"Futura PT Medium"',
                            color: '#EB1C24',
                            fontSize: '11px',
                            margin: '0 0 16px 0',
                            textTransform: 'uppercase',
                            textAlign: 'center',
                            fontWeight: '500'
                          }}
                        >
                          READY TO TURN THOSE POINTS INTO REWARDS?
                        </p>

                        {/* Current Points */}
                        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                          <p
                            style={{
                              fontFamily: '"Futura PT Medium"',
                              color: '#000000',
                              fontSize: '18px',
                              margin: '0 0 4px 0',
                              fontWeight: '500'
                            }}
                          >
                            {(() => {
                              const basePoints = userData?.loyaltyPoints || 200;
                              const affiliatePoints = calculateTotalAffiliatePoints();
                              return (basePoints + affiliatePoints).toLocaleString();
                            })()} PTS
                          </p>
                          <p
                            style={{
                              fontFamily: '"Futura PT Book"',
                              color: '#000000',
                              fontSize: '10px',
                              margin: '0 0 8px 0',
                              textTransform: 'uppercase'
                            }}
                          >
                            1 POINT FOR EVERY $1 SPENT*
                          </p>
                          <p
                            style={{
                              fontFamily: '"Futura PT Book"',
                              color: '#000000',
                              fontSize: '10px',
                              margin: '0',
                              textTransform: 'uppercase'
                            }}
                          >
                            {(() => {
                              const basePoints = userData?.loyaltyPoints || 200;
                              const affiliatePoints = calculateTotalAffiliatePoints();
                              const totalPoints = basePoints + affiliatePoints;
                              return Math.max(0, 10000 - totalPoints).toLocaleString();
                            })()} MORE PTS TO EARN 10% OFF
                          </p>
                        </div>

                        {/* Discount Codes */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                          {[
                            { discount: '10% OFF', points: 10000 },
                            { discount: '15% OFF', points: 15000 },
                            { discount: '25% OFF', points: 25000 },
                            { discount: '30% OFF', points: 30000 },
                            { discount: '50% OFF UNIT', points: 50000 }
                          ].map((reward, index) => {
                            const basePoints = userData?.loyaltyPoints || 200;
                            const affiliatePoints = calculateTotalAffiliatePoints();
                            const currentPoints = basePoints + affiliatePoints;
                            const canRedeem = currentPoints >= reward.points;
                            return (
                              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: index < 4 ? '1px solid #E5E5E5' : 'none' }}>
                                <div>
                                  <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', margin: '0 0 2px 0', textTransform: 'uppercase' }}>
                                    DISCOUNT CODE
                                  </p>
                                  <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#000000', margin: '0', fontWeight: '500' }}>
                                    {reward.discount} AT {reward.points.toLocaleString()} PTS
                                  </p>
                                </div>
                                <button
                                  onClick={() => {
                                    if (canRedeem) {
                                      // Handle redemption logic here
                                      alert(`Redeeming ${reward.discount} for ${reward.points.toLocaleString()} points`);
                                    }
                                  }}
                                  disabled={!canRedeem}
                                  style={{
                                    fontFamily: '"Futura PT Medium"',
                                    fontSize: '10px',
                                    color: canRedeem ? '#EB1C24' : '#909090',
                                    backgroundColor: 'transparent',
                                    border: '1.3px solid',
                                    borderColor: canRedeem ? '#EB1C24' : '#909090',
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

                        {/* Notes */}
                        <div style={{ marginBottom: '20px' }}>
                          <p
                            style={{
                              fontFamily: '"Futura PT Book"',
                              color: '#EB1C24',
                              fontSize: '9px',
                              margin: '0 0 4px 0',
                              textTransform: 'uppercase'
                            }}
                          >
                            * EXCLUDES TAXES + SHIPPING FEES
                          </p>
                          <p
                            style={{
                              fontFamily: '"Futura PT Book"',
                              color: '#EB1C24',
                              fontSize: '9px',
                              margin: '0',
                              textTransform: 'uppercase'
                            }}
                          >
                            REWARDS UPDATED ROUTINELY WITH NEW DROPS
                          </p>
                        </div>

                        {/* MORE WAYS TO EARN */}
                        <div>
                          <h3
                            style={{
                              fontFamily: '"Futura PT Medium"',
                        color: '#000000',
                        fontSize: '12px',
                              margin: '0 0 12px 0',
                              textTransform: 'uppercase',
                              fontWeight: '500'
                            }}
                          >
                            MORE WAYS TO EARN
                          </h3>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {[
                              { action: 'NEWSLETTER SIGN UP', points: 50 },
                              { action: 'REFER A FRIEND', points: 100 },
                              { action: 'LEAVE A CONTENT REVIEW', points: 150 },
                              { action: 'PHOTO + VIDEO TAGS', points: 200 },
                              { action: 'LIKE OUR FACEBOOK', points: 250 },
                              { action: 'FOLLOW OUR INSTAGRAM', points: 250 },
                              { action: 'FOLLOW OUR TIK TOK', points: 250 },
                              { action: 'FOLLOW OUR TWITTER', points: 250 }
                            ].map((item, index) => (
                              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', margin: '0', textTransform: 'uppercase' }}>
                                  {item.action}
                                </p>
                                <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#EB1C24', margin: '0', fontWeight: '500' }}>
                                  +{item.points}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : showPremiumView ? (
                  /* PREMIUM MEMBERSHIP VIEW */
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
                        <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px' }}>
                            <thead>
                              <tr>
                                <th style={{ 
                                  fontFamily: '"Futura PT Medium"', 
                                  padding: '8px 4px', 
                                  textAlign: 'left', 
                                  borderBottom: '1px solid #000',
                                  fontWeight: '500',
                                  textTransform: 'uppercase'
                                }}>BENEFITS</th>
                                <th style={{ 
                                  fontFamily: '"Futura PT Medium"', 
                                  padding: '8px 4px', 
                                  textAlign: 'center', 
                                  borderBottom: '1px solid #000',
                                  fontWeight: '500',
                                  textTransform: 'uppercase'
                                }}>BASIC</th>
                                <th style={{ 
                                  fontFamily: '"Futura PT Medium"', 
                                  padding: '8px 4px', 
                                  textAlign: 'center', 
                                  borderBottom: '1px solid #000',
                                  fontWeight: '500',
                                  textTransform: 'uppercase'
                                }}>3 MONTHS PREMIUM</th>
                                <th style={{ 
                                  fontFamily: '"Futura PT Medium"', 
                                  padding: '8px 4px', 
                                  textAlign: 'center', 
                                  borderBottom: '1px solid #000',
                                  fontWeight: '500',
                                  textTransform: 'uppercase'
                                }}>6 MONTHS PREMIUM</th>
                                <th style={{ 
                                  fontFamily: '"Futura PT Medium"', 
                                  padding: '8px 4px', 
                                  textAlign: 'center', 
                                  borderBottom: '1px solid #000',
                                  fontWeight: '500',
                                  textTransform: 'uppercase'
                                }}>12 MONTHS PREMIUM</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td style={{ fontFamily: '"Futura PT Book"', padding: '6px 4px', textTransform: 'uppercase' }}>WELCOME DISCOUNT</td>
                                <td style={{ fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>$10 OFF</td>
                                <td style={{ fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>$20 OFF</td>
                                <td style={{ fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>$40 OFF</td>
                                <td style={{ fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>$60 OFF</td>
                              </tr>
                              <tr>
                                <td style={{ fontFamily: '"Futura PT Book"', padding: '6px 4px', textTransform: 'uppercase' }}>BIRTHDAY GIFT</td>
                                <td style={{ fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <img src="/assets/premium-x.svg" alt="Not included" style={{ width: '16px', height: '16px' }} />
                                </td>
                                <td style={{ fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <img src="/assets/premium-check.svg" alt="Included" style={{ width: '8px', height: '8px' }} />
                                </td>
                                <td style={{ fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <img src="/assets/premium-check.svg" alt="Included" style={{ width: '8px', height: '8px' }} />
                                </td>
                                <td style={{ fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <img src="/assets/premium-check.svg" alt="Included" style={{ width: '8px', height: '8px' }} />
                                </td>
                              </tr>
                              <tr>
                                <td style={{ fontFamily: '"Futura PT Book"', padding: '6px 4px', textTransform: 'uppercase' }}>REDUCED SHIPPING</td>
                                <td style={{ fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <img src="/assets/premium-x.svg" alt="Not included" style={{ width: '16px', height: '16px' }} />
                                </td>
                                <td style={{ fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <img src="/assets/premium-check.svg" alt="Included" style={{ width: '8px', height: '8px' }} />
                                </td>
                                <td style={{ fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <img src="/assets/premium-check.svg" alt="Included" style={{ width: '8px', height: '8px' }} />
                                </td>
                                <td style={{ fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <img src="/assets/premium-check.svg" alt="Included" style={{ width: '8px', height: '8px' }} />
                                </td>
                              </tr>
                              <tr>
                                <td style={{ fontFamily: '"Futura PT Book"', padding: '6px 4px', textTransform: 'uppercase' }}>PREMIUM BUILD-A-WIG</td>
                                <td style={{ fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <img src="/assets/premium-x.svg" alt="Not included" style={{ width: '16px', height: '16px' }} />
                                </td>
                                <td style={{ fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <img src="/assets/premium-check.svg" alt="Included" style={{ width: '8px', height: '8px' }} />
                                </td>
                                <td style={{ fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <img src="/assets/premium-check.svg" alt="Included" style={{ width: '8px', height: '8px' }} />
                                </td>
                                <td style={{ fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <img src="/assets/premium-check.svg" alt="Included" style={{ width: '8px', height: '8px' }} />
                                </td>
                              </tr>
                              <tr>
                                <td style={{ fontFamily: '"Futura PT Book"', padding: '6px 4px', textTransform: 'uppercase' }}>LOUNGE ACCESS</td>
                                <td style={{ fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <img src="/assets/premium-x.svg" alt="Not included" style={{ width: '16px', height: '16px' }} />
                                </td>
                                <td style={{ fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <img src="/assets/premium-check.svg" alt="Included" style={{ width: '8px', height: '8px' }} />
                                </td>
                                <td style={{ fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <img src="/assets/premium-check.svg" alt="Included" style={{ width: '8px', height: '8px' }} />
                                </td>
                                <td style={{ fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <img src="/assets/premium-check.svg" alt="Included" style={{ width: '8px', height: '8px' }} />
                                </td>
                              </tr>
                              <tr>
                                <td style={{ fontFamily: '"Futura PT Book"', padding: '6px 4px', textTransform: 'uppercase' }}>VIP SUPPORT</td>
                                <td style={{ fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <img src="/assets/premium-x.svg" alt="Not included" style={{ width: '16px', height: '16px' }} />
                                </td>
                                <td style={{ fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <img src="/assets/premium-x.svg" alt="Not included" style={{ width: '16px', height: '16px' }} />
                                </td>
                                <td style={{ fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <img src="/assets/premium-check.svg" alt="Included" style={{ width: '8px', height: '8px' }} />
                                </td>
                                <td style={{ fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <img src="/assets/premium-check.svg" alt="Included" style={{ width: '8px', height: '8px' }} />
                                </td>
                              </tr>
                              <tr>
                                <td style={{ fontFamily: '"Futura PT Book"', padding: '6px 4px', textTransform: 'uppercase' }}>PRIORITY BOOKING</td>
                                <td style={{ fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <img src="/assets/premium-x.svg" alt="Not included" style={{ width: '16px', height: '16px' }} />
                                </td>
                                <td style={{ fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <img src="/assets/premium-x.svg" alt="Not included" style={{ width: '16px', height: '16px' }} />
                                </td>
                                <td style={{ fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <img src="/assets/premium-check.svg" alt="Included" style={{ width: '8px', height: '8px' }} />
                                </td>
                                <td style={{ fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <img src="/assets/premium-check.svg" alt="Included" style={{ width: '8px', height: '8px' }} />
                                </td>
                              </tr>
                              <tr>
                                <td style={{ fontFamily: '"Futura PT Book"', padding: '6px 4px', textTransform: 'uppercase' }}>FREE GIVEAWAYS</td>
                                <td style={{ fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <img src="/assets/premium-x.svg" alt="Not included" style={{ width: '16px', height: '16px' }} />
                                </td>
                                <td style={{ fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <img src="/assets/premium-x.svg" alt="Not included" style={{ width: '16px', height: '16px' }} />
                                </td>
                                <td style={{ fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <img src="/assets/premium-x.svg" alt="Not included" style={{ width: '16px', height: '16px' }} />
                                </td>
                                <td style={{ fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <img src="/assets/premium-check.svg" alt="Included" style={{ width: '8px', height: '8px' }} />
                                </td>
                              </tr>
                              <tr>
                                <td style={{ fontFamily: '"Futura PT Book"', padding: '6px 4px', textTransform: 'uppercase' }}>2X LOYALTY POINTS</td>
                                <td style={{ fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <img src="/assets/premium-x.svg" alt="Not included" style={{ width: '16px', height: '16px' }} />
                                </td>
                                <td style={{ fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <img src="/assets/premium-x.svg" alt="Not included" style={{ width: '16px', height: '16px' }} />
                                </td>
                                <td style={{ fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <img src="/assets/premium-check.svg" alt="Included" style={{ width: '8px', height: '8px' }} />
                                </td>
                                <td style={{ fontFamily: '"Futura PT Book"', padding: '6px 4px', textAlign: 'center' }}>
                                  <img src="/assets/premium-check.svg" alt="Included" style={{ width: '8px', height: '8px' }} />
                                </td>
                              </tr>
                              <tr style={{ borderTop: '1px solid #000' }}>
                                <td style={{ fontFamily: '"Futura PT Medium"', padding: '8px 4px', textTransform: 'uppercase', fontWeight: '500' }}>PRICE</td>
                                <td style={{ fontFamily: '"Futura PT Book"', padding: '8px 4px', textAlign: 'center' }}>FREE</td>
                                <td style={{ fontFamily: '"Futura PT Book"', padding: '8px 4px', textAlign: 'center' }}>
                                  $280 USD
                                  <button
                                    onClick={() => {
                                      // If changing subscription, don't allow deselection of current tier
                                      if (hasPremiumSubscription && selectedTier === '3months') {
                                        return; // Can't deselect current subscription
                                      }
                                      setSelectedTier(selectedTier === '3months' ? null : '3months');
                                    }}
                                    className="font-futura w-full text-center py-1 text-[9px] font-semibold bg-transparent cursor-pointer mt-2"
                                    style={{ 
                                      border: 'none',
                                      color: selectedTier === '3months' ? '#EB1C24' : '#000000',
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
                                <td style={{ fontFamily: '"Futura PT Book"', padding: '8px 4px', textAlign: 'center' }}>
                                  $520 USD
                                  <button
                                    onClick={() => {
                                      // If changing subscription, don't allow deselection of current tier
                                      if (hasPremiumSubscription && selectedTier === '6months') {
                                        return; // Can't deselect current subscription
                                      }
                                      setSelectedTier(selectedTier === '6months' ? null : '6months');
                                    }}
                                    className="font-futura w-full text-center py-1 text-[9px] font-semibold bg-transparent cursor-pointer mt-2"
                                    style={{ 
                                      border: 'none',
                                      color: selectedTier === '6months' ? '#EB1C24' : '#000000',
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
                                <td style={{ fontFamily: '"Futura PT Book"', padding: '8px 4px', textAlign: 'center' }}>
                                  $960 USD
                                  <button
                                    onClick={() => {
                                      // If changing subscription, don't allow deselection of current tier
                                      if (hasPremiumSubscription && selectedTier === '12months') {
                                        return; // Can't deselect current subscription
                                      }
                                      setSelectedTier(selectedTier === '12months' ? null : '12months');
                                    }}
                                    className="font-futura w-full text-center py-1 text-[9px] font-semibold bg-transparent cursor-pointer mt-2"
                                    style={{ 
                                      border: 'none',
                                      color: selectedTier === '12months' ? '#EB1C24' : '#000000',
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
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {/* Total Due Today */}
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                          <p
                            style={{
                              fontFamily: '"Futura PT Medium"',
                              color: '#000000',
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
                              color: '#000000',
                              fontSize: '14px',
                              margin: '0',
                              fontWeight: '500'
                            }}
                          >
                            {selectedTier ? `$${subscriptionTiers[selectedTier as keyof typeof subscriptionTiers].price} USD` : '$0 USD'}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* REGULAR MEMBERSHIP CONTENT */
                    <>
                      {/* REFERRAL CODE Section */}
                      <div style={{ marginBottom: '32px' }}>
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
                            REFERRAL CODE
                          </h2>
                          <p
                            style={{
                              fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                              color: '#000000',
                              fontSize: '13px',
                              margin: '0',
                              textTransform: 'uppercase'
                            }}
                          >
                            {generateReferralCode()}
                          </p>
                        </div>
                    
                        <div style={{ marginBottom: '12px' }}>
                          <p
                            style={{
                              fontFamily: '"Futura PT Book"',
                              color: '#000000',
                              fontSize: '10px',
                              margin: '0 0 12px 0',
                              textTransform: 'uppercase'
                            }}
                          >
                            ONCE YOU CREATE AN ACCOUNT, YOU'RE ASSIGNED A UNIQUE REFERRAL CODE. SHARE THIS CODE WITH FRIENDS & FAMILY TO EARN DIGITAL CASH EVERY TIME SOMEONE USES YOUR CODE AT CHECKOUT.
                          </p>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                          <p
                            style={{
                              fontFamily: '"Futura PT Medium"',
                              color: '#EB1C24',
                              fontSize: '10px',
                              margin: '0 0 8px 0',
                              textTransform: 'uppercase',
                              fontWeight: '500'
                            }}
                          >
                            HOW IT WORKS:
                          </p>
                          <p
                            style={{
                              fontFamily: '"Futura PT Book"',
                              color: '#000000',
                              fontSize: '10px',
                              margin: '0 0 12px 0',
                              textTransform: 'uppercase'
                            }}
                          >
                            WHEN SOMEONE MAKES A PURCHASE USING YOUR REFERRAL CODE, THEY RECEIVE <span style={{ color: '#EB1C24' }}>$20 OFF</span> THEIR ORDER AND YOU RECEIVE <span style={{ color: '#EB1C24' }}>$20</span> DEPOSITED INTO YOUR GIFT CARD BALANCE AFTER THEIR PURCHASE HAS BEEN CONFIRMED.
                          </p>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                          <p
                            style={{
                              fontFamily: '"Futura PT Medium"',
                              color: '#EB1C24',
                              fontSize: '10px',
                              margin: '0 0 8px 0',
                              textTransform: 'uppercase',
                              fontWeight: '500'
                            }}
                          >
                            IMPORTANT NOTES:
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
                            • REFERRAL CODES CAN ONLY BE APPLIED ONCE PER ACCOUNT
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
                            • YOU CANNOT USE YOUR OWN REFERRAL CODE UNDER YOUR ACCOUNT
                          </p>
                          <p
                            style={{
                              fontFamily: '"Futura PT Book"',
                              color: '#000000',
                              fontSize: '10px',
                              margin: '0 0 12px 0',
                              textTransform: 'uppercase'
                            }}
                          >
                            • YOU MUST CREATE AN ACCOUNT OR BE SIGNED IN TO CHECKOUT WITH A REFERRAL CODE (FOR TRACKING PURPOSES)
                          </p>
                        </div>
                      </div>

                      {/* REWARDS PROGRAM / LOYALTY POINTS Section */}
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
                      MEMBERSHIP STATUS
                    </h2>
                  </div>
                  
                  {/* BASIC MEMBERSHIP Content */}
                        {!showLoyaltyRewards && (
                  <div style={{ marginBottom: '20px' }}>
                    <p
                      style={{
                        fontFamily: '"Futura PT Medium"',
                        color: '#000000',
                        fontSize: '11px',
                        margin: '0 0 8px 0',
                        textTransform: 'uppercase',
                        fontWeight: '500'
                      }}
                    >
                      BASIC MEMBERSHIP
                    </p>
                            <div>
                        <p
                          style={{
                            fontFamily: '"Futura PT Book"',
                            color: '#000000',
                            fontSize: '10px',
                            margin: '0 0 4px 0',
                            textTransform: 'uppercase'
                          }}
                        >
                          CURRENT TIER: <span style={{ color: '#EB1C24' }}>SILVER</span>
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
                          BENEFITS INCLUDE: WELCOME DISCOUNT, BIRTHDAY GIFT
                        </p>
                        <p
                          style={{
                            fontFamily: '"Futura PT Book"',
                            color: '#000000',
                            fontSize: '10px',
                            margin: '0',
                            textTransform: 'uppercase'
                          }}
                        >
                          NEXT TIER: <span style={{ color: '#EB1C24' }}>RED</span>
                        </p>
                        <p
                          style={{
                            fontFamily: '"Futura PT Book"',
                            color: '#000000',
                            fontSize: '10px',
                            margin: '4px 0 0 0',
                            textTransform: 'uppercase'
                          }}
                        >
                          EARN 2,500 MORE POINTS TO REACH
                        </p>
                      </div>
                      </div>
                        )}
                </div>

                      {/* LOYALTY POINTS Section */}
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
                      LOYALTY POINTS
                    </h2>
                  </div>
                  
                  <div>
                            <p
                              style={{
                                fontFamily: '"Futura PT Medium"',
                                color: '#EB1C24',
                                fontSize: '11px',
                                margin: '0 0 16px 0',
                                textTransform: 'uppercase',
                                textAlign: 'center',
                                fontWeight: '500'
                              }}
                            >
                              READY TO TURN THOSE POINTS INTO REWARDS?
                            </p>

                            {/* Current Points */}
                            <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                              <p
                                style={{
                                  fontFamily: '"Futura PT Medium"',
                                  color: '#000000',
                                  fontSize: '18px',
                                  margin: '0 0 4px 0',
                                  fontWeight: '500'
                                }}
                              >
                                {(() => {
                                  const basePoints = userData?.loyaltyPoints || 200;
                                  const affiliatePoints = calculateTotalAffiliatePoints();
                                  return (basePoints + affiliatePoints).toLocaleString();
                                })()} PTS
                              </p>
                              <p
                                style={{
                                  fontFamily: '"Futura PT Book"',
                                  color: '#000000',
                                  fontSize: '10px',
                                  margin: '0 0 8px 0',
                                  textTransform: 'uppercase'
                                }}
                              >
                                1 POINT FOR EVERY $1 SPENT*
                              </p>
                              <p
                                style={{
                                  fontFamily: '"Futura PT Book"',
                                  color: '#000000',
                                  fontSize: '10px',
                                  margin: '0',
                                  textTransform: 'uppercase'
                                }}
                              >
                                {(() => {
                                  const basePoints = userData?.loyaltyPoints || 200;
                                  const affiliatePoints = calculateTotalAffiliatePoints();
                                  const totalPoints = basePoints + affiliatePoints;
                                  return Math.max(0, 10000 - totalPoints).toLocaleString();
                                })()} MORE PTS TO EARN 10% OFF
                              </p>
                            </div>

                            {/* Discount Codes */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                              {[
                                { discount: '10% OFF', points: 10000 },
                                { discount: '15% OFF', points: 15000 },
                                { discount: '25% OFF', points: 25000 },
                                { discount: '30% OFF', points: 30000 },
                                { discount: '50% OFF UNIT', points: 50000 }
                              ].map((reward, index) => {
                                const basePoints = userData?.loyaltyPoints || 200;
                                const affiliatePoints = calculateTotalAffiliatePoints();
                                const currentPoints = basePoints + affiliatePoints;
                                const canRedeem = currentPoints >= reward.points;
                                return (
                                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: index < 4 ? '1px solid #E5E5E5' : 'none' }}>
                                    <div>
                                      <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', margin: '0 0 2px 0', textTransform: 'uppercase' }}>
                                        DISCOUNT CODE
                                      </p>
                                      <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#000000', margin: '0', fontWeight: '500' }}>
                                        {reward.discount} AT {reward.points.toLocaleString()} PTS
                                      </p>
                                    </div>
                                    <button
                                      onClick={() => {
                                        if (canRedeem) {
                                          // Handle redemption logic here
                                          alert(`Redeeming ${reward.discount} for ${reward.points.toLocaleString()} points`);
                                        }
                                      }}
                                      disabled={!canRedeem}
                                      style={{
                                        fontFamily: '"Futura PT Medium"',
                                        fontSize: '10px',
                                        color: canRedeem ? '#EB1C24' : '#909090',
                                        backgroundColor: 'transparent',
                                        border: '1.3px solid',
                                        borderColor: canRedeem ? '#EB1C24' : '#909090',
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

                            {/* Notes */}
                            <div style={{ marginBottom: '20px' }}>
                              <p
                                style={{
                                  fontFamily: '"Futura PT Book"',
                                  color: '#EB1C24',
                                  fontSize: '9px',
                                  margin: '0 0 4px 0',
                                  textTransform: 'uppercase'
                                }}
                              >
                                * EXCLUDES TAXES + SHIPPING FEES
                              </p>
                              <p
                                style={{
                                  fontFamily: '"Futura PT Book"',
                                  color: '#EB1C24',
                                  fontSize: '9px',
                                  margin: '0',
                                  textTransform: 'uppercase'
                                }}
                              >
                                REWARDS UPDATED ROUTINELY WITH NEW DROPS
                              </p>
                            </div>

                            {/* MORE WAYS TO EARN */}
                            <div>
                              <h3
                                style={{
                                  fontFamily: '"Futura PT Medium"',
                                  color: '#000000',
                                  fontSize: '12px',
                                  margin: '0 0 12px 0',
                                  textTransform: 'uppercase',
                                  fontWeight: '500'
                                }}
                              >
                                MORE WAYS TO EARN
                              </h3>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {[
                                  { action: 'NEWSLETTER SIGN UP', points: 50 },
                                  { action: 'REFER A FRIEND', points: 100 },
                                  { action: 'LEAVE A CONTENT REVIEW', points: 150 },
                                  { action: 'PHOTO + VIDEO TAGS', points: 200 },
                                  { action: 'LIKE OUR FACEBOOK', points: 250 },
                                  { action: 'FOLLOW OUR INSTAGRAM', points: 250 },
                                  { action: 'FOLLOW OUR TIK TOK', points: 250 },
                                  { action: 'FOLLOW OUR TWITTER', points: 250 }
                                ].map((item, index) => (
                                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', margin: '0', textTransform: 'uppercase' }}>
                                      {item.action}
                                    </p>
                                    <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#EB1C24', margin: '0', fontWeight: '500' }}>
                                      +{item.points}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                </div>


                      {/* UPGRADE YOUR BASIC MEMBERSHIP / ADDITIONAL FEATURES Section - Only show when loyalty rewards is not active */}
                      {!showLoyaltyRewards && (
                      <>
                        {hasPremiumSubscription ? (
                            /* PREMIUM MEMBER - Additional Features */
                            <div style={{ marginBottom: '24px' }}>
                              <p
                                style={{
                                  fontFamily: '"Futura PT Medium"',
                                  color: '#EB1C24',
                                  fontSize: '10px',
                                  margin: '0 0 12px 0',
                                  textTransform: 'uppercase',
                                  fontWeight: '500'
                                }}
                              >
                                ADDITIONAL FEATURES INCLUDED WITH YOUR PREMIUM MEMBERSHIP
                              </p>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                  <img src="/assets/premium-check.svg" alt="Included" style={{ width: '12px', height: '12px', marginTop: '2px', flexShrink: 0 }} />
                                  <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', margin: '0', textTransform: 'uppercase' }}>
                                    EXCLUSIVE ACCESS TO PREMIUM 3D WIG GENERATOR
                                  </p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                  <img src="/assets/premium-check.svg" alt="Included" style={{ width: '12px', height: '12px', marginTop: '2px', flexShrink: 0 }} />
                                  <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', margin: '0', textTransform: 'uppercase' }}>
                                    ACCESS TO VIP LOUNGE + MEMBERS ONLY EVENTS
                                  </p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                  <img src="/assets/premium-check.svg" alt="Included" style={{ width: '12px', height: '12px', marginTop: '2px', flexShrink: 0 }} />
                                  <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', margin: '0', textTransform: 'uppercase' }}>
                                    FAST TRACK CUSTOMER SUPPORT
                                  </p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                  <img src="/assets/premium-check.svg" alt="Included" style={{ width: '12px', height: '12px', marginTop: '2px', flexShrink: 0 }} />
                                  <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', margin: '0', textTransform: 'uppercase' }}>
                                    PRIORITY BOOKING
                                  </p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                  <img src="/assets/premium-check.svg" alt="Included" style={{ width: '12px', height: '12px', marginTop: '2px', flexShrink: 0 }} />
                                  <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', margin: '0', textTransform: 'uppercase' }}>
                                    FREE GIVEAWAYS
                                  </p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                  <img src="/assets/premium-check.svg" alt="Included" style={{ width: '12px', height: '12px', marginTop: '2px', flexShrink: 0 }} />
                                  <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', margin: '0', textTransform: 'uppercase' }}>
                                    DISCOUNTED SHIPPING
                                  </p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* BASIC MEMBER - Upgrade Section */
                <div style={{ marginBottom: '24px' }}>
                  <p
                    style={{
                      fontFamily: '"Futura PT Medium"',
                      color: '#EB1C24',
                      fontSize: '10px',
                      margin: '0 0 8px 0',
                      textTransform: 'uppercase',
                      fontWeight: '500'
                    }}
                  >
                    UPGRADE YOUR BASIC MEMBERSHIP TO
                  </p>
                  <p
                    style={{
                      fontFamily: '"Futura PT Book"',
                      color: '#000000',
                      fontSize: '10px',
                      margin: '0 0 20px 0',
                      textTransform: 'uppercase'
                    }}
                  >
                    UNLOCK THE FOLLOWING FEATURES PLUS MORE:
                  </p>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                                  <p style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', fontSize: '12px', color: '#000000', margin: '0 0 4px 0', textTransform: 'uppercase' }}>
                        UNLIMITED ACCESS TO VIRTUAL 3D WIG GENERATOR
                                  </p>
                                  <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#000000', margin: '0', textTransform: 'uppercase' }}>
                        ADDITIONAL, MORE EXTENSIVE CUSTOMIZATION OPTIONS
                      </p>
                    </div>
                    <div>
                                  <p style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', fontSize: '12px', color: '#000000', margin: '0 0 4px 0', textTransform: 'uppercase' }}>
                        ENTRY PASS TO MEMBERS ONLY LOUNGE
                                  </p>
                                  <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#000000', margin: '0', textTransform: 'uppercase' }}>
                        EARLY ACCESS TO SALES, NEW DROPS, RESTOCKS + BRAND RELATED CONTENT
                      </p>
                    </div>
                    <div>
                                  <p style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', fontSize: '12px', color: '#000000', margin: '0 0 4px 0', textTransform: 'uppercase' }}>
                        FAST TRACK CUSTOMER SUPPORT
                                  </p>
                                  <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#000000', margin: '0', textTransform: 'uppercase' }}>
                        PRIORITIZED CUSTOMER SUPPORT WITH A SIGNIFICANTLY REDUCED RESPONSE TIME
                      </p>
                    </div>
                    <div>
                                  <p style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', fontSize: '12px', color: '#000000', margin: '0 0 4px 0', textTransform: 'uppercase' }}>
                        PRIORITY BOOKING + ORDER PROCESSING
                                  </p>
                                  <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#000000', margin: '0', textTransform: 'uppercase' }}>
                        OPTION TO BOOK APPOINTMENTS IN ADVANCE, YOUR CUSTOM ORDERS GET HANDLED FIRST
                      </p>
                    </div>
                    <div>
                                  <p style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', fontSize: '12px', color: '#000000', margin: '0 0 4px 0', textTransform: 'uppercase' }}>
                        SPECIAL GIFT WITH PURCHASE + FREE GIVEAWAYS
                                  </p>
                                  <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#000000', margin: '0', textTransform: 'uppercase' }}>
                        ELIGIBLE FOR A CHANCE TO WIN RANDOM DISCOUNTS, STYLING VOUCHERS + EXCLUSIVE ITEMS
                      </p>
                    </div>
                    <div>
                                  <p style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', fontSize: '12px', color: '#000000', margin: '0 0 4px 0', textTransform: 'uppercase' }}>
                        REDUCED SHIPPING FEE
                                  </p>
                                  <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#000000', margin: '0', textTransform: 'uppercase' }}>
                        DISCOUNT APPLIED AUTOMATICALLY TO DOMESTIC + INTERNATIONAL ORDERS
                      </p>
                    </div>
                    <div>
                                  <p style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', fontSize: '12px', color: '#000000', margin: '0 0 4px 0', textTransform: 'uppercase' }}>
                        DOUBLE YOUR POINTS
                                  </p>
                                  <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#000000', margin: '0', textTransform: 'uppercase' }}>
                        EARN 2X LOYALTY POINTS FOR EACH ORDER, UNLOCKING DISCOUNTS & REWARDS FASTER
                      </p>
                    </div>
                  </div>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>

              {/* UPGRADE/CHANGE/CANCEL SUBSCRIPTION Buttons - Below main card, only show when loyalty rewards is not active */}
              {!showLoyaltyRewards && (
                      <>
                        {hasPremiumSubscription ? (
                    <>
                      {/* CHANGE SUBSCRIPTION Button */}
                      <div className="px-0 md:px-0" style={{ marginTop: '12px', marginBottom: '10px', transform: 'translateY(-2px)' }}>
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
                          {showPremiumView ? 'CONFIRM SUBSCRIPTION' : ((userData?.subscriptionTier === '12months' || (isKateenaArmstrong && !userData?.subscriptionTier)) ? 'CHANGE SUBSCRIPTION' : 'UPGRADE SUBSCRIPTION')}
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
                    <div className="px-0 md:px-0" style={{ marginTop: '12px', marginBottom: '20px', transform: 'translateY(-2px)' }}>
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

