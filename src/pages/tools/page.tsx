import React, { useState, useEffect } from 'react';
import { useMarbleStripSnapStep } from '../../hooks/useMarbleStripSnapStep';
import { useNavigate, useLocation } from 'react-router-dom';
import DynamicCartIcon from '../../components/DynamicCartIcon';
import ConfirmationModal from '../../components/ConfirmationModal';
import BrandMenuLinks from '../../components/BrandMenuLinks';
import SocialMenuIcons from '../../components/SocialMenuIcons';
import { getPerUserKey, getCurrentUserEmailFromStorage, PER_USER_KEYS } from '../../utils/perUserStorage';
import { signOutAppAndSupabaseSession } from '../../utils/adminAuth';
import type { CurrencyRatesRecord } from '../../utils/currencyFormat';
import { formatPriceUsd } from '../../utils/currencyFormat';
import { ShopMobileMenuShopTab } from '../../components/ShopMobileMenuShopTab';
import { ShopMobileMenuToolsTab } from '../../components/ShopMobileMenuToolsTab';
import { signInHrefWithReturnTo } from '../../utils/signInReturnTo';
import { useShopNavSearchBar } from '../../components/shop/useShopNavSearchBar';
import { marbleStripViewportStyle } from '../../utils/marbleStripStyles';

function ToolsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { NavCenter, SearchTrigger } = useShopNavSearchBar();

  // Cart count state
  const [cartCount, setCartCount] = useState(() => {
    try {
      return parseInt(localStorage.getItem('cartCount') || '0', 10);
    } catch (e) {
      return 0;
    }
  });

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

  // Gift card products state
  const [giftCardProducts] = useState([
    { id: 'gift-card-10', name: 'GIFT CARD', price: 10 },
    { id: 'gift-card-15', name: 'GIFT CARD', price: 15 },
    { id: 'gift-card-25', name: 'GIFT CARD', price: 25 },
    { id: 'gift-card-50', name: 'GIFT CARD', price: 50 },
    { id: 'gift-card-75', name: 'GIFT CARD', price: 75 },
    { id: 'gift-card-100', name: 'GIFT CARD', price: 100 },
    { id: 'gift-card-250', name: 'GIFT CARD', price: 250 },
    { id: 'gift-card-500', name: 'GIFT CARD', price: 500 },
  ]);

  // Gift card marble strip: measured snap (same as PDP similar / shop UNITS)
  const [giftCardPage, setGiftCardPage] = useState(0);
  const [giftCardSnapPx, setGiftCardStripViewportRef] = useMarbleStripSnapStep();
  const giftCardPairCount = Math.ceil(giftCardProducts.length / 2);
  const giftCardMaxPage = Math.max(0, giftCardPairCount - 1);
  const giftCardScrollPx = -giftCardPage * giftCardSnapPx;
  const giftCardStripUsesSnap = giftCardProducts.length >= 4;
  const giftCardCellFlexBasis = giftCardStripUsesSnap
    ? `calc(100% / ${giftCardProducts.length})`
    : '50%';

  useEffect(() => {
    setGiftCardPage((p) => Math.min(p, giftCardMaxPage));
  }, [giftCardMaxPage]);

  useEffect(() => {
    const handleResize = () => setGiftCardPage(0);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mobile menu state
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

  const formatPrice = React.useCallback(
    (price: number) => formatPriceUsd(price, selectedCurrency, currencyRates as CurrencyRatesRecord),
    [currencyRates, selectedCurrency]
  );

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

  const handleSignOut = async () => {
    setIsSignedIn(false);
    await signOutAppAndSupabaseSession();
    setShowSignOutConfirm(false);
    // Close mobile menu
    setShowMobileMenu(false);
  };

  const handleGiftCardLeftArrow = () => setGiftCardPage((p) => Math.max(0, p - 1));
  const handleGiftCardRightArrow = () =>
    setGiftCardPage((p) => Math.min(giftCardMaxPage, p + 1));

  return (
    <div className="min-h-screen" style={{ position: 'relative' }}>
      {/* Roses Background - Fixed to viewport */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundImage: `url('/assets/roses.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: -10,
          pointerEvents: 'none'
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
              <p className="text-sm" style={{ fontFamily: '"Futura PT Book"' }}>
              <span 
                style={{ fontFamily: '"Futura PT Book"', fontWeight: '400', cursor: 'pointer' }}
                onClick={() => navigate('/lobby')}
              >
                HOME &gt;
              </span>{' '}
              <span
                style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}
              >
                TOOLS
              </span>
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

          {showMobileMenu ? (
            /* MENU CONTENT */
            <div
              className="border border-black flex flex-col pt-6 pb-4 px-5 mb-2 bg-white/60 backdrop-blur-sm transition-all duration-300 ease-out"
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
          ) : null}

          {!showMobileMenu && (
            /* GIFT CARD CONTAINER */
            <div className="px-0 md:px-0" style={{ marginTop: '20px', marginBottom: '20px', transform: 'translateY(-17px)' }}>
            <div style={{ 
              border: '1.3px solid black', 
              backgroundColor: '#f5f5f5',
              backgroundImage: `url('/assets/marble-container.png')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              padding: '0px',
              maxWidth: '100%',
              margin: '0 auto'
            }}>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '5px' }}>
                <div style={{ 
                  width: '1px', 
                  height: '15px', 
                  backgroundColor: 'black',
                  margin: '0 auto 8px auto'
                }}></div>
                <h3 
                  onClick={() => navigate('/tools/gift-card')}
                  style={{ 
                  fontFamily: '"Futura PT Medium"',
                  fontSize: '12px',
                  color: '#EB1C24',
                  textTransform: 'uppercase',
                  margin: '0',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'inline-block',
                    width: 'auto',
                    height: 'auto'
                  }}
                >
                  GIFT CARD
                </h3>
              </div>
              
              {/* Strip — same measured snap + 2-up layout as home/shop UNITS */}
              <div style={{ position: 'relative', width: '100%', overflow: 'visible', boxSizing: 'border-box' }}>
                <div style={{ width: '100%', position: 'relative', overflow: 'visible', minWidth: 0, boxSizing: 'border-box' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '6px',
                      bottom: '0',
                      width: '1px',
                      backgroundColor: 'black',
                      zIndex: 20,
                      transform: 'translateX(-50%)',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '6px',
                      bottom: '0',
                      width: '10px',
                      backgroundColor: 'transparent',
                      zIndex: 15,
                      transform: 'translateX(-50%)',
                      pointerEvents: 'none',
                    }}
                  />

                  <div
                    ref={setGiftCardStripViewportRef}
                    style={{
                      width: '100%',
                      position: 'relative',
                      maxWidth: '100%',
                      marginTop: 0,
                      paddingTop: '10px',
                      overflow: 'visible',
                      boxSizing: 'border-box',
                    }}
                  >
                    <div
                      style={{
                        position: 'relative',
                        boxSizing: 'border-box',
                        ...marbleStripViewportStyle,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'nowrap',
                          alignItems: 'stretch',
                          gap: '0',
                          transform: `translateX(${giftCardScrollPx}px)`,
                          transition: 'none',
                          width: giftCardStripUsesSnap ? `${giftCardPairCount * 100}%` : '100%',
                          boxSizing: 'border-box',
                        }}
                      >
                        {giftCardProducts.map((product) => (
                          <div
                            key={product.id}
                            style={{
                              padding: 0,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'stretch',
                              flex: `0 0 ${giftCardCellFlexBasis}`,
                              boxSizing: 'border-box',
                              position: 'relative',
                              overflow: 'visible',
                              minWidth: 0,
                            }}
                          >
                            <div
                              style={{
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                boxSizing: 'border-box',
                                padding: '5px 12px 4px 12px',
                                transform: 'translateY(-10px)',
                              }}
                            >
                              <div
                                style={{
                                  width: '100%',
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  marginBottom: '8px',
                                }}
                              >
                                <img
                                  src={GIFT_CARD_CART_THUMBNAIL_SRC}
                                  alt="Gift Card"
                                  onClick={() => navigate('/tools/gift-card')}
                                  style={{
                                    width: '79.2%',
                                    height: 'auto',
                                    maxWidth: '100%',
                                    display: 'block',
                                    margin: 0,
                                    cursor: 'pointer',
                                  }}
                                />
                              </div>

                              <div style={{ width: '100%', textAlign: 'center', boxSizing: 'border-box' }}>
                                <p
                                  style={{
                                    fontFamily:
                                      '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                                    fontSize: '18px',
                                    color: 'black',
                                    textTransform: 'uppercase',
                                    margin: 0,
                                    fontWeight: '500',
                                    lineHeight: 1.05,
                                    minHeight: '22px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  {product.name}
                                </p>

                                <p
                                  style={{
                                    fontFamily: '"Futura PT Medium"',
                                    fontSize: '10px',
                                    color: '#EB1C24',
                                    textTransform: 'uppercase',
                                    margin: '2px 0 5px 0',
                                    fontWeight: '500',
                                    lineHeight: '0.84',
                                    minHeight: '12px',
                                  }}
                                >
                                  DIGITAL ONLY
                                </p>

                                <p
                                  style={{
                                    fontFamily: '"Futura PT Medium"',
                                    fontSize: '12px',
                                    color: 'black',
                                    textTransform: 'uppercase',
                                    margin: '0 0 5px 0',
                                    fontWeight: '500',
                                    lineHeight: '0.84',
                                    textAlign: 'center',
                                  }}
                                  dangerouslySetInnerHTML={formatPrice(product.price)}
                                />

                                <div
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: '2px',
                                    marginTop: '2px',
                                    marginBottom: '5px',
                                  }}
                                >
                                  {[...Array(5)].map((_, starIndex) => (
                                    <img
                                      key={starIndex}
                                      src="/assets/NOIR/star-symbol.png"
                                      alt="Star Rating"
                                      style={{
                                        width: '10px',
                                        height: '10px',
                                        filter: 'drop-shadow(0 0 0 1px black)',
                                        stroke: '1px black',
                                      }}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {giftCardMaxPage > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={handleGiftCardLeftArrow}
                      aria-label="Previous gift cards"
                      style={{
                        position: 'absolute',
                        left: 6,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 25,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '5px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <img
                        src="/assets/NOIR/left-facing-arrow.svg"
                        alt=""
                        style={{ width: '14px', height: '14px', display: 'block' }}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={handleGiftCardRightArrow}
                      aria-label="Next gift cards"
                      style={{
                        position: 'absolute',
                        right: 6,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 25,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '5px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <img
                        src="/assets/NOIR/right-facing-arrow.svg"
                        alt=""
                        style={{ width: '14px', height: '14px', display: 'block' }}
                      />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
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

export default ToolsPage;

