import React, { useState, useEffect } from 'react';
import { useMarbleStripSnapStep } from '../../../hooks/useMarbleStripSnapStep';
import { useNavigate, useLocation } from 'react-router-dom';
import DynamicCartIcon from '../../../components/DynamicCartIcon';
import ConfirmationModal from '../../../components/ConfirmationModal';
import BrandMenuLinks from '../../../components/BrandMenuLinks';
import SocialMenuIcons from '../../../components/SocialMenuIcons';
import { getPerUserKey, getCurrentUserEmailFromStorage, PER_USER_KEYS } from '../../../utils/perUserStorage';
import { signOutAppAndSupabaseSession } from '../../../utils/adminAuth';
import type { CurrencyRatesRecord } from '../../../utils/currencyFormat';
import { formatPriceUsd } from '../../../utils/currencyFormat';
import { ShopMobileMenuShopTab } from '../../../components/ShopMobileMenuShopTab';
import { ShopMobileMenuToolsTab } from '../../../components/ShopMobileMenuToolsTab';
import { signInHrefWithReturnTo } from '../../../utils/signInReturnTo';
import { useShopNavSearchBar } from '../../../components/shop/useShopNavSearchBar';
import { usePersistentQueryState } from '../../../hooks/usePersistentQueryState';
import { trackActivity } from '../../../utils/activity';
import { writeGiftCardSelectionForCheckoutSession } from '../../../utils/giftCardCheckoutSession';
import GiftCardProductDetailsTab from '../../../components/shop/GiftCardProductDetailsTab';
import GiftCardProductPolicyTab from '../../../components/shop/GiftCardProductPolicyTab';
import ThumbBox from '../../../components/ThumbBox';

const GIFT_CARD_PREVIEW_BASE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Stock%20Content';

/** Gift card PDP hero + thumbnail gallery (Supabase live-preview). */
const GIFT_CARD_PREVIEW_IMAGES = [
  `${GIFT_CARD_PREVIEW_BASE}/IMG_1799.png`,
  `${GIFT_CARD_PREVIEW_BASE}/IMG_1788.png`,
] as const;

/** Portrait thumb frames — 4px white mat on each side (matches BCF bundle ThumbBox). */
const GIFT_CARD_THUMB_MAT_PX = 4;
const GIFT_CARD_THUMB_INNER_W_PX = 48;
const GIFT_CARD_THUMB_INNER_H_PX = 84;
const GIFT_CARD_THUMB_OUTER_W_PX = GIFT_CARD_THUMB_INNER_W_PX + GIFT_CARD_THUMB_MAT_PX * 2;
const GIFT_CARD_THUMB_OUTER_H_PX = GIFT_CARD_THUMB_INNER_H_PX + GIFT_CARD_THUMB_MAT_PX * 2;

/** Set true to show SIMILAR PRODUCTS on gift card page again (strip stays mounted when false). */
const GIFT_CARD_SIMILAR_PRODUCTS_VISIBLE = false;

function withGiftCardSimilarProductsVisibility(
  style: React.CSSProperties
): React.CSSProperties {
  if (GIFT_CARD_SIMILAR_PRODUCTS_VISIBLE) return style;
  return { ...style, display: 'none' };
}

function GiftCardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { NavCenter, SearchTrigger } = useShopNavSearchBar();
  const [selectedBalance, setSelectedBalance] = useState(10);
  const [selectedGiftCardPreviewIndex, setSelectedGiftCardPreviewIndex] = useState(0);
  const [activeTab, setActiveTab] = usePersistentQueryState<'DETAILS' | 'POLICY' | 'REVIEWS'>({
    queryKey: 'tab',
    storageKey: 'giftCardActiveTab',
    defaultValue: 'DETAILS',
    allowedValues: ['DETAILS', 'POLICY', 'REVIEWS'] as const,
  });
  const [similarProductsScroll, setSimilarProductsScroll] = useState(0);
  const [recentlyViewedScroll, setRecentlyViewedScroll] = useState(0);
  const [similarSnapPx, setSimilarStripViewportRef] = useMarbleStripSnapStep();
  const [recentSnapPx, setRecentStripViewportRef] = useMarbleStripSnapStep();
  const [cartCount, setCartCount] = useState(() => {
    return parseInt(localStorage.getItem('cartCount') || '0');
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

  // Currency state (per user)
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

  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);

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

  // Load selected currency from localStorage (per-user key)
  useEffect(() => {
    const key = getPerUserKey(PER_USER_KEYS.selectedCurrency, getCurrentUserEmailFromStorage());
    const savedCurrency = localStorage.getItem(key);
    if (savedCurrency && currencyRates[savedCurrency as keyof typeof currencyRates]) {
      setSelectedCurrency(savedCurrency);
    }
  }, [currencyRates]);

  // Save selected currency to localStorage (per-user key)
  useEffect(() => {
    const key = getPerUserKey(PER_USER_KEYS.selectedCurrency, getCurrentUserEmailFromStorage());
    localStorage.setItem(key, selectedCurrency);
  }, [selectedCurrency]);

  // Listen for currency changes
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

  const formatPrice = React.useCallback(
    (price: number) => formatPriceUsd(price, selectedCurrency, currencyRates as CurrencyRatesRecord),
    [currencyRates, selectedCurrency]
  );

  const handleBack = () => {
    navigate(-1);
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

  const handleSignOut = async () => {
    setIsSignedIn(false);
    await signOutAppAndSupabaseSession();
    setShowSignOutConfirm(false);
    // Close mobile menu
    setShowMobileMenu(false);
  };

  const handleBalanceSelect = (balance: number) => {
    setSelectedBalance(balance);
  };

  const handleTabClick = (tab: 'DETAILS' | 'POLICY' | 'REVIEWS') => {
    setActiveTab(tab);
  };

  const getTotalPrice = () => {
    return selectedBalance;
  };

  const handleProceedToCheckout = () => {
    if (checkoutSubmitting) return;
    setCheckoutSubmitting(true);
    try {
      const newCartCount = writeGiftCardSelectionForCheckoutSession({
        balanceUsd: selectedBalance,
        image: '/assets/giftcard-product.png',
      });
      setCartCount(newCartCount);
      trackActivity('add_to_cart', { source: 'gift_card_pdp', productName: 'GIFT CARD' });
      trackActivity('cart_navigate', { destination: 'checkout_gift_card' });
      navigate('/checkout/gift-card');
    } catch (e) {
      console.error('Error proceeding to gift card checkout:', e);
    } finally {
      setCheckoutSubmitting(false);
    }
  };

  // Similar products scroll handlers
  const handleSimilarProductsLeftArrow = () => {
    // Move to previous 2 products (scroll right) - snap to 0 position
    setSimilarProductsScroll(0);
  };

  const handleSimilarProductsRightArrow = () => {
    setSimilarProductsScroll(-similarSnapPx);
  };

  const handleRecentlyViewedLeftArrow = () => {
    // Move to previous 2 products (scroll right) - snap to 0 position
    setRecentlyViewedScroll(0);
  };

  const handleRecentlyViewedRightArrow = () => {
    setRecentlyViewedScroll(-recentSnapPx);
  };

  const balanceOptions = [10, 15, 25, 50, 75, 100, 250, 500];

  return (
    <div className="min-h-screen" style={{ position: 'relative' }}>
      {/* Fixed Background Layer */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url('/assets/marble-half.png')`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat',
          backgroundAttachment: 'fixed'
        }}
      ></div>
      
      {/* Scrollable Content */}
      <div className="relative z-10">
        <div className="flex flex-col py-5 px-4" style={{ minWidth: '100%', maxWidth: 'none', overflow: 'visible' }}>
          {/* HEADER */}
          <div
            className="border-solid border-black flex justify-center items-center py-3 w-full mb-5 px-5 bg-white/60 backdrop-blur-sm relative"
            style={{ border: '1.3px solid black' }}
          >
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
                onClick={handleBack} 
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
                onClick={() => navigate('/home/tools')}
              >
                TOOLS &gt;
              </span>{' '}
              <span
                style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}
              >
                GIFT CARD
              </span>
                </>
              )}
            </p>
            </NavCenter>
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

          {showMobileMenu ? (
            /* MENU CONTENT */
            <div
              className="menu-toggle-card border border-black flex flex-col pt-6 pb-4 px-5 mb-2 bg-white/60 backdrop-blur-sm transition-all duration-300 ease-out"
              style={{ 
                borderWidth: '1.3px', 
                minWidth: '100%', 
                maxWidth: 'none', 
                overflow: 'visible',
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                minHeight: 'calc(100dvh - 80px)',
                height: 'calc(100dvh - 80px)'
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
                        labelTranslateX="7px"
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
            <>
          {/* MAIN BUILD AREA */}
          <div
            className="border border-black flex flex-col pt-6 px-5 mb-2 bg-white/60 backdrop-blur-sm transition-all duration-300 ease-out"
            style={{ 
              borderWidth: '1.3px', 
              minWidth: '100%', 
              maxWidth: 'none', 
              overflow: 'visible',
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              paddingBottom: '16px',
            }}
          >
            {/* GIFT CARD PREVIEW */}
            <div
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'column',
                marginBottom: '8px',
                overflow: 'visible',
                minWidth: '100%',
                maxWidth: 'none',
              }}
            >
              {/* Main Hero Image */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  marginBottom: '10px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <img
                  src={GIFT_CARD_PREVIEW_IMAGES[selectedGiftCardPreviewIndex]}
                  alt="Gift Card"
                  style={{
                    width: '100%',
                    maxWidth: '400px',
                    height: 'auto',
                    margin: '0 auto',
                    display: 'block',
                  }}
                />
              </div>

              <div
                className="flex flex-row flex-nowrap justify-center items-center"
                style={{
                  gap: '8px',
                  marginBottom: '14px',
                  width: '100%',
                }}
              >
                {GIFT_CARD_PREVIEW_IMAGES.map((src, index) => (
                  <ThumbBox
                    key={src}
                    image={src}
                    imageAlt={`Gift card preview ${index + 1}`}
                    title=""
                    label=""
                    isSelected={selectedGiftCardPreviewIndex === index}
                    onClick={() => setSelectedGiftCardPreviewIndex(index)}
                    containerWidth={GIFT_CARD_THUMB_OUTER_W_PX}
                    containerHeight={GIFT_CARD_THUMB_OUTER_H_PX}
                    imageWidth={GIFT_CARD_THUMB_INNER_W_PX}
                    imageHeight={GIFT_CARD_THUMB_INNER_H_PX}
                    topPosition="50%"
                  />
                ))}
              </div>

              {/* PRODUCT NAME */}
              <p
                className="text-center text-black mb-2 gift-card-product-name"
                style={{
                  fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                  fontSize: '38px',
                  fontWeight: 400,
                  lineHeight: 1.2,
                  margin: '0 0 6px 0',
                  padding: 0,
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                GIFT CARD
              </p>

              {/* DIGITAL ONLY */}
              <p
                className="text-center text-red-500 uppercase mb-2"
                style={{
                  fontFamily: '"Futura PT Medium"',
                  fontWeight: '500',
                  fontSize: '12px',
                  margin: '0 0 6px 0',
                }}
              >
                DIGITAL ONLY
              </p>

              {/* PRICE */}
              <p
                className="text-center text-black mb-1"
                style={{
                  fontFamily: '"Futura PT Medium"',
                  fontSize: '16px',
                  fontWeight: '500',
                  width: '100%',
                  margin: '0 0 6px 0',
                }}
                dangerouslySetInnerHTML={formatPrice(getTotalPrice())}
              />

              {/* STAR RATINGS */}
              <div className="flex justify-center mb-2 gap-1">
                {[...Array(5)].map((_, index) => (
                  <img
                    key={index}
                    src="/assets/NOIR/star-symbol.png"
                    alt="Star Rating"
                    className="w-auto h-auto"
                    style={{ 
                      width: '15px', 
                      height: '15px',
                      filter: 'drop-shadow(0 0 0 1px black)',
                      stroke: '1px black'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* SELECT CARD BALANCE */}
            <div>
              <p
                className="text-center text-black uppercase mb-4"
                style={{ 
                  fontFamily: '"Futura PT Demi"',
                  fontSize: '11px',
                  fontWeight: '500',
                  transform: 'translateY(0px)'
                }}
              >
                SELECT CARD BALANCE
              </p>

              {/* Balance Options */}
              <div className="flex justify-center gap-3 flex-wrap mb-6" style={{ transform: 'translateY(-7px)' }}>
                {balanceOptions.map((balance) => (
                  <button 
                    key={balance}
                    onClick={() => handleBalanceSelect(balance)}
                    className={`border border-black px-4 py-1 ${selectedBalance === balance ? 'text-red-500 bg-white' : 'text-black bg-white hover:bg-gray-50'}`}
                    style={{ 
                      borderWidth: '1.3px',
                      fontFamily: '"Futura PT Medium"',
                      fontWeight: '500',
                      minWidth: '60px',
                      fontSize: '11px'
                    }}
                  >
                    ${balance}
                  </button>
                ))}
              </div>
            </div>

            {/* Tabs Section */}
            <div className="mt-6" style={{ marginBottom: '8px' }}>
              {/* Tab Navigation */}
              <div className="flex justify-center">
                <button
                  onClick={() => handleTabClick('DETAILS')}
                  className={`px-2 py-1 text-xs font-medium ${activeTab === 'DETAILS' ? 'border-b border-red-500 text-red-500' : 'text-black hover:text-red-500'}`}
                  style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px' }}
                >
                  DETAILS
                </button>
                <button
                  onClick={() => handleTabClick('POLICY')}
                  className={`px-2 py-1 text-xs font-medium ${activeTab === 'POLICY' ? 'border-b border-red-500 text-red-500' : 'text-black hover:text-red-500'}`}
                  style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px' }}
                >
                  POLICY
                </button>
                <button
                  onClick={() => handleTabClick('REVIEWS')}
                  className={`px-2 py-1 text-xs font-medium ${activeTab === 'REVIEWS' ? 'border-b border-red-500 text-red-500' : 'text-black hover:text-red-500'}`}
                  style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px' }}
                >
                  REVIEWS
                </button>
              </div>

              {/* Tab Content */}
              <div className="mt-4 space-y-4" style={{ maxWidth: 'none', width: '100%', marginBottom: '0', paddingBottom: '8px' }}>
                {activeTab === 'DETAILS' && <GiftCardProductDetailsTab />}
                
                {activeTab === 'POLICY' && <GiftCardProductPolicyTab />}
                
                {activeTab === 'REVIEWS' && (
                  <>
                    <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '11px', color: '#808080', whiteSpace: 'nowrap', marginBottom: '-8px', paddingBottom: '0px', textAlign: 'center', textTransform: 'uppercase' }}>
                      NO REVIEWS YET. BE THE FIRST TO REVIEW THIS PRODUCT.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* PROCEED TO CHECKOUT — gift card PDP goes straight to isolated /checkout/gift-card (filtered view) */}
          <div className="px-0 md:px-0" style={{ marginTop: '16px' }}>
            <button
              type="button"
              onClick={handleProceedToCheckout}
              disabled={checkoutSubmitting}
              className={`border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold ${
                checkoutSubmitting ? 'bg-white cursor-not-allowed' : 'bg-white cursor-pointer hover:bg-gray-50'
              }`}
              style={{
                borderWidth: '1.3px',
                color: '#EB1C24',
                fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                backgroundColor: '#FFFFFF',
              }}
            >
              {checkoutSubmitting ? '…' : 'PROCEED TO CHECKOUT'}
            </button>
          </div>

          {/* SIMILAR PRODUCTS SECTION */}
          <div
            className="px-0 md:px-0"
            style={withGiftCardSimilarProductsVisibility({ marginTop: '20px', marginBottom: '20px' })}
          >
            <div 
              className="backdrop-blur-sm"
              style={{ 
              border: '1.3px solid black', 
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              padding: '0px',
              maxWidth: '100%',
              margin: '0 auto'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                <div style={{ 
                  width: '1px', 
                  height: '15px', 
                  backgroundColor: 'black',
                  margin: '0 auto 8px auto'
                }}></div>
                <h3 style={{ 
                  fontFamily: '"Futura PT Medium"',
                  fontSize: '12px',
                  color: '#EB1C24',
                  textTransform: 'uppercase',
                  margin: '0',
                  fontWeight: '500'
                }}>
                  SIMILAR PRODUCTS
                </h3>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                <button 
                  onClick={handleSimilarProductsLeftArrow}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer',
                    padding: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    minHeight: '50px',
                    transform: 'translateX(10px) translateY(-10px)'
                  }}>
                  <img
                    src="/assets/NOIR/left-facing-arrow.svg"
                    alt="Left Arrow"
                    style={{ width: '14px', height: '14px' }}
                  />
                </button>
                
                <div style={{ flex: '1', position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '50%',
                    top: '0',
                    bottom: '0',
                    width: '1px',
                    backgroundColor: 'black',
                    zIndex: 20,
                    transform: 'translateX(-50%)'
                  }}></div>
                  
                  <div style={{
                    position: 'absolute',
                    left: '50%',
                    top: '0',
                    bottom: '0',
                    width: '10px',
                    backgroundColor: 'transparent',
                    zIndex: 15,
                    transform: 'translateX(-50%)',
                    pointerEvents: 'none'
                  }}></div>
                  
                  <div
                    ref={setSimilarStripViewportRef}
                    style={{
                    overflowX: 'hidden',
                    width: '100%',
                    position: 'relative',
                    maxWidth: '100%'
                  }}
                  >
                    <div 
                      style={{ 
                        display: 'flex', 
                        gap: '0',
                        transform: `translateX(${similarProductsScroll}px) translateY(-15px)`,
                        transition: 'none',
                        width: '200%'
                      }}
                    >
                      {/* Product 1 - BLANCO */}
                      <div 
                        style={{ 
                          padding: '10px 10px 4px 0px',
                          textAlign: 'center',
                          transform: 'translateX(-2.5px)'
                        }}
                      >
                        <img
                          src="/assets/NOIR/blanco-thumb.png"
                          alt="BLANCO"
                          onClick={() => navigate('/straight/blanco')}
                          style={{ 
                            width: '100%', 
                            height: 'auto',
                            marginBottom: '10px',
                            marginLeft: '10px',
                            cursor: 'pointer'
                          }}
                        />
                        <p style={{ 
                          fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                          fontSize: '18px',
                          color: 'black',
                          textTransform: 'uppercase',
                          margin: '-10px 0 -3px 0',
                          fontWeight: '500',
                          transform: 'translateX(10px)'
                        }}>
                          BLANCO
                        </p>
                        <p style={{ 
                          fontFamily: '"Futura PT Medium"',
                          fontSize: '10px',
                          color: '#EB1C24',
                          textTransform: 'uppercase',
                          margin: '0 0 5px 0',
                          fontWeight: '500',
                          lineHeight: '0.84',
                          transform: 'translateX(10px)'
                        }}>
                          24" RAW RUSSIAN
                        </p>
                        <p style={{ 
                          fontFamily: '"Futura PT Medium"',
                          fontSize: '12px',
                          color: 'black',
                          textTransform: 'uppercase',
                          margin: '0 0 5px 0',
                          fontWeight: '500',
                          lineHeight: '0.84',
                          transform: 'translateX(10px)'
                        }}
                        dangerouslySetInnerHTML={formatPrice(820)}
                        />
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginTop: '2px', transform: 'translateX(10px)' }}>
                          {[...Array(5)].map((_, index) => (
                            <img
                              key={index}
                              src="/assets/NOIR/star-symbol.png"
                              alt="Star Rating"
                              style={{ 
                                width: '10px', 
                                height: '10px',
                                filter: 'drop-shadow(0 0 0 1px black)',
                                stroke: '1px black'
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      
                      {/* Product 2 - SOFT WAVE */}
                      <div 
                        style={{ 
                          padding: '10px 10px 4px 10px',
                          textAlign: 'center',
                          transform: 'translateX(13px)'
                        }}
                      >
                        <img
                          src="/assets/NOIR/wave-thumb.png"
                          alt="SOFT WAVE"
                          onClick={() => navigate('/wavy/soft-wave')}
                          style={{ 
                            width: '100%', 
                            height: 'auto',
                            marginBottom: '10px',
                            marginLeft: '10px',
                            cursor: 'pointer'
                          }}
                        />
                        <p style={{ 
                          fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                          fontSize: '18px',
                          color: 'black',
                          textTransform: 'uppercase',
                          margin: '-10px 0 -3px 0',
                          fontWeight: '500',
                          transform: 'translateX(10px)'
                        }}>
                          SOFT WAVE
                        </p>
                        <p style={{ 
                          fontFamily: '"Futura PT Medium"',
                          fontSize: '10px',
                          color: '#EB1C24',
                          textTransform: 'uppercase',
                          margin: '0 0 5px 0',
                          fontWeight: '500',
                          lineHeight: '0.84',
                          transform: 'translateX(10px)'
                        }}>
                          24" RAW INDONESIAN
                        </p>
                        <p style={{ 
                          fontFamily: '"Futura PT Medium"',
                          fontSize: '12px',
                          color: 'black',
                          textTransform: 'uppercase',
                          margin: '0 0 5px 0',
                          fontWeight: '500',
                          lineHeight: '0.84',
                          transform: 'translateX(10px)'
                        }}
                        dangerouslySetInnerHTML={formatPrice(760)}
                        />
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginTop: '2px', transform: 'translateX(10px)' }}>
                          {[...Array(5)].map((_, index) => (
                            <img
                              key={index}
                              src="/assets/NOIR/star-symbol.png"
                              alt="Star Rating"
                              style={{ 
                                width: '10px', 
                                height: '10px',
                                filter: 'drop-shadow(0 0 0 1px black)',
                                stroke: '1px black'
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      
                      {/* Product 3 - NOIR */}
                      <div 
                        style={{ 
                          padding: '10px 10px 4px 0px',
                          textAlign: 'center',
                          transform: 'translateX(-2.5px)'
                        }}
                      >
                        <img
                          src="/assets/NOIR/noir-thumb.png"
                          alt="NOIR"
                          onClick={() => navigate('/straight/noir')}
                          style={{ 
                            width: '100%', 
                            height: 'auto',
                            marginBottom: '10px',
                            marginLeft: '10px',
                            cursor: 'pointer'
                          }}
                        />
                        <p style={{ 
                          fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                          fontSize: '19px',
                          color: 'black',
                          textTransform: 'uppercase',
                          margin: '-10px 0 -3px 0',
                          fontWeight: '500',
                          transform: 'translateX(10px)'
                        }}>
                          NOIR
                        </p>
                        <p style={{ 
                          fontFamily: '"Futura PT Medium"',
                          fontSize: '10px',
                          color: '#EB1C24',
                          textTransform: 'uppercase',
                          margin: '0 0 5px 0',
                          fontWeight: '500',
                          lineHeight: '0.84',
                          transform: 'translateX(10px)'
                        }}>
                          24" RAW CAMBODIAN
                        </p>
                        <p style={{ 
                          fontFamily: '"Futura PT Medium"',
                          fontSize: '12px',
                          color: 'black',
                          textTransform: 'uppercase',
                          margin: '0 0 5px 0',
                          fontWeight: '500',
                          lineHeight: '0.84',
                          transform: 'translateX(10px)'
                        }}
                        dangerouslySetInnerHTML={formatPrice(740)}
                        />
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginTop: '2px', transform: 'translateX(10px)' }}>
                          {[...Array(5)].map((_, index) => (
                            <img
                              key={index}
                              src="/assets/NOIR/star-symbol.png"
                              alt="Star Rating"
                              style={{ 
                                width: '10px', 
                                height: '10px',
                                filter: 'drop-shadow(0 0 0 1px black)',
                                stroke: '1px black'
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      
                      {/* Product 4 - SOFT CURL */}
                      <div 
                        style={{ 
                          padding: '10px 10px 4px 10px',
                          textAlign: 'center',
                          transform: 'translateX(13px)'
                        }}
                      >
                        <img
                          src="/assets/NOIR/curl-thumb.png"
                          alt="SOFT CURL"
                          onClick={() => navigate('/curly/soft-curl')}
                          style={{ 
                            width: '100%', 
                            height: 'auto',
                            marginBottom: '10px',
                            marginLeft: '10px',
                            cursor: 'pointer'
                          }}
                        />
                        <p style={{ 
                          fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                          fontSize: '18px',
                          color: 'black',
                          textTransform: 'uppercase',
                          margin: '-10px 0 -3px 0',
                          fontWeight: '500',
                          transform: 'translateX(10px)'
                        }}>
                          SOFT CURL
                        </p>
                        <p style={{ 
                          fontFamily: '"Futura PT Medium"',
                          fontSize: '10px',
                          color: '#EB1C24',
                          textTransform: 'uppercase',
                          margin: '0 0 5px 0',
                          fontWeight: '500',
                          lineHeight: '0.84',
                          transform: 'translateX(10px)'
                        }}>
                          24" RAW FILIPINO
                        </p>
                        <p style={{ 
                          fontFamily: '"Futura PT Medium"',
                          fontSize: '12px',
                          color: 'black',
                          textTransform: 'uppercase',
                          margin: '0 0 5px 0',
                          fontWeight: '500',
                          lineHeight: '0.84',
                          transform: 'translateX(10px)'
                        }}
                        dangerouslySetInnerHTML={formatPrice(780)}
                        />
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginTop: '2px', transform: 'translateX(10px)' }}>
                          {[...Array(5)].map((_, index) => (
                            <img
                              key={index}
                              src="/assets/NOIR/star-symbol.png"
                              alt="Star Rating"
                              style={{ 
                                width: '10px', 
                                height: '10px',
                                filter: 'drop-shadow(0 0 0 1px black)',
                                stroke: '1px black'
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleSimilarProductsRightArrow}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer',
                    padding: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    minHeight: '50px',
                    transform: 'translateX(-10px) translateY(-10px)'
                  }}>
                  <img
                    src="/assets/NOIR/right-facing-arrow.svg"
                    alt="Right Arrow"
                    style={{ width: '14px', height: '14px' }}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* RECENTLY VIEWED SECTION */}
          <div className="px-0 md:px-0" style={{ marginTop: '20px', marginBottom: '20px' }}>
            <div 
              className="backdrop-blur-sm"
              style={{ 
              border: '1.3px solid black', 
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              padding: '0px',
              maxWidth: '100%',
              margin: '0 auto'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                <div style={{ 
                  width: '1px', 
                  height: '15px', 
                  backgroundColor: 'black',
                  margin: '0 auto 8px auto'
                }}></div>
                <h3 style={{ 
                  fontFamily: '"Futura PT Medium"',
                  fontSize: '12px',
                  color: '#EB1C24',
                  textTransform: 'uppercase',
                  margin: '0',
                  fontWeight: '500'
                }}>
                  RECENTLY VIEWED
                </h3>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                <button 
                  onClick={handleRecentlyViewedLeftArrow}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer',
                    padding: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    minHeight: '50px',
                    transform: 'translateX(10px) translateY(-10px)'
                  }}>
                  <img
                    src="/assets/NOIR/left-facing-arrow.svg"
                    alt="Left Arrow"
                    style={{ width: '14px', height: '14px' }}
                  />
                </button>
                
                <div style={{ flex: '1', position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '50%',
                    top: '0',
                    bottom: '0',
                    width: '1px',
                    backgroundColor: 'black',
                    zIndex: 20,
                    transform: 'translateX(-50%)'
                  }}></div>
                  
                  <div style={{
                    position: 'absolute',
                    left: '50%',
                    top: '0',
                    bottom: '0',
                    width: '10px',
                    backgroundColor: 'transparent',
                    zIndex: 15,
                    transform: 'translateX(-50%)',
                    pointerEvents: 'none'
                  }}></div>
                  
                  <div
                    ref={setRecentStripViewportRef}
                    style={{
                    overflowX: 'hidden',
                    width: '100%',
                    position: 'relative',
                    maxWidth: '100%'
                  }}
                  >
                    <div 
                      style={{ 
                        display: 'flex', 
                        gap: '0',
                        transform: `translateX(${recentlyViewedScroll}px) translateY(-15px)`,
                        transition: 'none',
                        width: '200%'
                      }}
                    >
                      {/* Product 1 - BEACH WAVE */}
                      <div style={{ 
                        padding: '10px 10px 4px 0px',
                        textAlign: 'center',
                        transform: 'translateX(-2.5px)'
                      }}>
                        <img
                          src="/assets/NOIR/wave-thumb.png"
                          alt="SOFT WAVE"
                          onClick={() => navigate('/wavy/soft-wave')}
                          style={{ 
                            width: '100%', 
                            height: 'auto',
                            marginBottom: '10px',
                            marginLeft: '10px',
                            cursor: 'pointer'
                          }}
                        />
                        <p style={{ 
                          fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                          fontSize: '18px',
                          color: 'black',
                          textTransform: 'uppercase',
                          margin: '-10px 0 -3px 0',
                          fontWeight: '500',
                          transform: 'translateX(10px)'
                        }}>
                          SOFT WAVE
                        </p>
                        <p style={{ 
                          fontFamily: '"Futura PT Medium"',
                          fontSize: '10px',
                          color: '#EB1C24',
                          textTransform: 'uppercase',
                          margin: '0 0 5px 0',
                          fontWeight: '500',
                          lineHeight: '0.84',
                          transform: 'translateX(10px)'
                        }}>
                          24" RAW INDONESIAN
                        </p>
                        <p style={{ 
                          fontFamily: '"Futura PT Medium"',
                          fontSize: '12px',
                          color: 'black',
                          textTransform: 'uppercase',
                          margin: '0 0 5px 0',
                          fontWeight: '500',
                          lineHeight: '0.84',
                          transform: 'translateX(10px)'
                        }}
                        dangerouslySetInnerHTML={formatPrice(760)}
                        />
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginTop: '2px', transform: 'translateX(10px)' }}>
                          {[...Array(5)].map((_, index) => (
                            <img
                              key={index}
                              src="/assets/NOIR/star-symbol.png"
                              alt="Star Rating"
                              style={{ 
                                width: '10px', 
                                height: '10px',
                                filter: 'drop-shadow(0 0 0 1px black)',
                                stroke: '1px black'
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      
                      {/* Product 2 - SOFT CURL */}
                      <div style={{ 
                        padding: '10px 10px 4px 10px',
                        textAlign: 'center',
                        transform: 'translateX(13px)'
                      }}>
                        <img
                          src="/assets/NOIR/curl-thumb.png"
                          alt="SOFT CURL"
                          onClick={() => navigate('/curly/soft-curl')}
                          style={{ 
                            width: '100%', 
                            height: 'auto',
                            marginBottom: '10px',
                            marginLeft: '10px',
                            cursor: 'pointer'
                          }}
                        />
                        <p style={{ 
                          fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                          fontSize: '18px',
                          color: 'black',
                          textTransform: 'uppercase',
                          margin: '-10px 0 -3px 0',
                          fontWeight: '500',
                          transform: 'translateX(10px)'
                        }}>
                          SOFT CURL
                        </p>
                        <p style={{ 
                          fontFamily: '"Futura PT Medium"',
                          fontSize: '10px',
                          color: '#EB1C24',
                          textTransform: 'uppercase',
                          margin: '0 0 5px 0',
                          fontWeight: '500',
                          lineHeight: '0.84',
                          transform: 'translateX(10px)'
                        }}>
                          24" RAW FILIPINO
                        </p>
                        <p style={{ 
                          fontFamily: '"Futura PT Medium"',
                          fontSize: '12px',
                          color: 'black',
                          textTransform: 'uppercase',
                          margin: '0 0 5px 0',
                          fontWeight: '500',
                          lineHeight: '0.84',
                          transform: 'translateX(10px)'
                        }}
                        dangerouslySetInnerHTML={formatPrice(780)}
                        />
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginTop: '2px', transform: 'translateX(10px)' }}>
                          {[...Array(5)].map((_, index) => (
                            <img
                              key={index}
                              src="/assets/NOIR/star-symbol.png"
                              alt="Star Rating"
                              style={{ 
                                width: '10px', 
                                height: '10px',
                                filter: 'drop-shadow(0 0 0 1px black)',
                                stroke: '1px black'
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      
                      {/* Product 3 - NOIR */}
                      <div style={{ 
                        padding: '10px 10px 4px 0px',
                        textAlign: 'center',
                        transform: 'translateX(-2.5px)'
                      }}>
                        <img
                          src="/assets/NOIR/noir-thumb.png"
                          alt="NOIR"
                          onClick={() => navigate('/straight/noir')}
                          style={{ 
                            width: '100%', 
                            height: 'auto',
                            marginBottom: '10px',
                            marginLeft: '10px',
                            cursor: 'pointer'
                          }}
                        />
                        <p style={{ 
                          fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                          fontSize: '19px',
                          color: 'black',
                          textTransform: 'uppercase',
                          margin: '-10px 0 -3px 0',
                          fontWeight: '500',
                          transform: 'translateX(10px)'
                        }}>
                          NOIR
                        </p>
                        <p style={{ 
                          fontFamily: '"Futura PT Medium"',
                          fontSize: '10px',
                          color: '#EB1C24',
                          textTransform: 'uppercase',
                          margin: '0 0 5px 0',
                          fontWeight: '500',
                          lineHeight: '0.84',
                          transform: 'translateX(10px)'
                        }}>
                          24" RAW CAMBODIAN
                        </p>
                        <p style={{ 
                          fontFamily: '"Futura PT Medium"',
                          fontSize: '12px',
                          color: 'black',
                          textTransform: 'uppercase',
                          margin: '0 0 5px 0',
                          fontWeight: '500',
                          lineHeight: '0.84',
                          transform: 'translateX(10px)'
                        }}
                        dangerouslySetInnerHTML={formatPrice(740)}
                        />
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginTop: '2px', transform: 'translateX(10px)' }}>
                          {[...Array(5)].map((_, index) => (
                            <img
                              key={index}
                              src="/assets/NOIR/star-symbol.png"
                              alt="Star Rating"
                              style={{ 
                                width: '10px', 
                                height: '10px',
                                filter: 'drop-shadow(0 0 0 1px black)',
                                stroke: '1px black'
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      
                      {/* Product 4 - BLANCO */}
                      <div style={{ 
                        padding: '10px 10px 4px 10px',
                        textAlign: 'center',
                        transform: 'translateX(13px)'
                      }}>
                        <img
                          src="/assets/NOIR/blanco-thumb.png"
                          alt="BLANCO"
                          onClick={() => navigate('/straight/blanco')}
                          style={{ 
                            width: '100%', 
                            height: 'auto',
                            marginBottom: '10px',
                            marginLeft: '10px',
                            cursor: 'pointer'
                          }}
                        />
                        <p style={{ 
                          fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                          fontSize: '18px',
                          color: 'black',
                          textTransform: 'uppercase',
                          margin: '-10px 0 -3px 0',
                          fontWeight: '500',
                          transform: 'translateX(10px)'
                        }}>
                          BLANCO
                        </p>
                        <p style={{ 
                          fontFamily: '"Futura PT Medium"',
                          fontSize: '10px',
                          color: '#EB1C24',
                          textTransform: 'uppercase',
                          margin: '0 0 5px 0',
                          fontWeight: '500',
                          lineHeight: '0.84',
                          transform: 'translateX(10px)'
                        }}>
                          24" RAW RUSSIAN
                        </p>
                        <p style={{ 
                          fontFamily: '"Futura PT Medium"',
                          fontSize: '12px',
                          color: 'black',
                          textTransform: 'uppercase',
                          margin: '0 0 5px 0',
                          fontWeight: '500',
                          lineHeight: '0.84',
                          transform: 'translateX(10px)'
                        }}
                        dangerouslySetInnerHTML={formatPrice(820)}
                        />
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginTop: '2px', transform: 'translateX(10px)' }}>
                          {[...Array(5)].map((_, index) => (
                            <img
                              key={index}
                              src="/assets/NOIR/star-symbol.png"
                              alt="Star Rating"
                              style={{ 
                                width: '10px', 
                                height: '10px',
                                filter: 'drop-shadow(0 0 0 1px black)',
                                stroke: '1px black'
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={handleRecentlyViewedRightArrow}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer',
                    padding: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    minHeight: '50px',
                    transform: 'translateX(-10px) translateY(-10px)'
                  }}>
                  <img
                    src="/assets/NOIR/right-facing-arrow.svg"
                    alt="Right Arrow"
                    style={{ width: '14px', height: '14px' }}
                  />
                </button>
              </div>
            </div>
          </div>
            </>
          )}
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
    </div>
  );
}

export default GiftCardPage;
