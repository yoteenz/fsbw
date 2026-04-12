import React, { useState, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import DynamicCartIcon from '../../../components/DynamicCartIcon';
import ConfirmationModal from '../../../components/ConfirmationModal';
import BrandMenuLinks from '../../../components/BrandMenuLinks';
import SocialMenuIcons from '../../../components/SocialMenuIcons';
import { getPerUserKey, getCurrentUserEmailFromStorage, PER_USER_KEYS } from '../../../utils/perUserStorage';
import { clearAppAuth } from '../../../utils/adminAuth';
import { ShopMobileMenuShopTab } from '../../../components/ShopMobileMenuShopTab';
import { ShopMobileMenuToolsTab } from '../../../components/ShopMobileMenuToolsTab';
import { signInHrefWithReturnTo } from '../../../utils/signInReturnTo';
import { useShopNavSearchBar } from '../../../components/shop/useShopNavSearchBar';

const TITLES: Record<string, string> = {
  '/shop/bundles': 'BUNDLES',
  '/shop/closures': 'CLOSURES',
  '/shop/frontals': 'FRONTALS'
};

/** /shop/bundles, /shop/closures, /shop/frontals — same shell + nav as /shop/units (expand product UI later). */
export default function ShopCategoryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { NavCenter, SearchTrigger } = useShopNavSearchBar();
  const pathname = location.pathname;
  const title = TITLES[pathname];

  const [cartCount, setCartCount] = useState(() => {
    try {
      return parseInt(localStorage.getItem('cartCount') || '0', 10);
    } catch {
      return 0;
    }
  });

  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mobileMenuActiveTab, setMobileMenuActiveTab] = useState(() => {
    const p = window.location.pathname;
    if (p.includes('/tools') || p === '/tools/gift-card') return 'TOOLS';
    if (p.includes('/brand') || p.includes('/about') || p.includes('/contact') || p.includes('/faq') || p.includes('/reviews') || p.includes('/terms')) return 'BRAND';
    return 'SHOP';
  });
  const [mobileMenuExpandedItems, setMobileMenuExpandedItems] = useState<string[]>([]);
  const [isSignedIn, setIsSignedIn] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('isSignedIn') === 'true';
      } catch {
        return false;
      }
    }
    return false;
  });
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  const [selectedCurrency, setSelectedCurrency] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const key = getPerUserKey(PER_USER_KEYS.selectedCurrency, getCurrentUserEmailFromStorage());
        return localStorage.getItem(key) || 'USD';
      } catch {
        return 'USD';
      }
    }
    return 'USD';
  });

  const currencyRates = React.useMemo(
    () => ({
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
    }),
    []
  );

  useEffect(() => {
    const handleCartCountUpdate = (event: CustomEvent) => setCartCount(event.detail);
    const handleStorageChange = () => {
      try {
        setCartCount(parseInt(localStorage.getItem('cartCount') || '0', 10));
      } catch {
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

  useEffect(() => {
    const checkSignInStatus = () => {
      try {
        const signedIn = localStorage.getItem('isSignedIn') === 'true';
        setIsSignedIn((prev) => (prev !== signedIn ? signedIn : prev));
      } catch {
        setIsSignedIn((prev) => (prev !== false ? false : prev));
      }
    };
    const handleStorageChange = () => checkSignInStatus();
    const handleSignInStateChange = () => checkSignInStatus();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);
    window.addEventListener('signInStateChanged', handleSignInStateChange as EventListener);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
      window.removeEventListener('signInStateChanged', handleSignInStateChange as EventListener);
    };
  }, []);

  useEffect(() => {
    const key = getPerUserKey(PER_USER_KEYS.selectedCurrency, getCurrentUserEmailFromStorage());
    const savedCurrency = localStorage.getItem(key);
    if (savedCurrency && currencyRates[savedCurrency as keyof typeof currencyRates]) {
      if (savedCurrency !== selectedCurrency) setSelectedCurrency(savedCurrency);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const key = getPerUserKey(PER_USER_KEYS.selectedCurrency, getCurrentUserEmailFromStorage());
    localStorage.setItem(key, selectedCurrency);
  }, [selectedCurrency]);

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
    const interval = setInterval(handleCurrencyChange, 500);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleCurrencyChange);
      window.removeEventListener('currencyChanged', handleCustomCurrencyChange as EventListener);
    };
  }, [currencyRates]);

  useEffect(() => {
    const p = location.pathname;
    if (p.includes('/tools') || p === '/tools/gift-card') setMobileMenuActiveTab('TOOLS');
    else if (p.includes('/brand') || p.includes('/about') || p.includes('/contact') || p.includes('/faq') || p.includes('/reviews') || p.includes('/terms')) setMobileMenuActiveTab('BRAND');
    else setMobileMenuActiveTab('SHOP');
  }, [location.pathname]);

  useEffect(() => {
    if (!showMobileMenu) return;
    const p = location.pathname;
    if (p.includes('/tools') || p === '/tools/gift-card') setMobileMenuActiveTab('TOOLS');
    else if (p.includes('/brand') || p.includes('/about') || p.includes('/contact') || p.includes('/faq') || p.includes('/reviews') || p.includes('/terms')) setMobileMenuActiveTab('BRAND');
    else setMobileMenuActiveTab('SHOP');
  }, [showMobileMenu, location.pathname]);

  const handleMobileMenuToggle = () => setShowMobileMenu(!showMobileMenu);
  const handleMobileMenuTabClick = (tab: string) => setMobileMenuActiveTab(tab);
  const handleMobileMenuItemToggle = (item: string) => {
    setMobileMenuExpandedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleMobileMenuSignInToggle = () => {
    if (isSignedIn) setShowSignOutConfirm(true);
    else navigate(signInHrefWithReturnTo(location));
  };

  const handleSignOut = () => {
    setIsSignedIn(false);
    clearAppAuth();
    window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'false' }));
    setShowSignOutConfirm(false);
    setShowMobileMenu(false);
  };

  if (!title) {
    return <Navigate to="/home/shop" replace />;
  }

  return (
    <div className="min-h-screen" style={{ position: 'relative' }}>
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

      <div className="relative z-10" style={{ position: 'relative' }}>
        <div className="flex flex-col py-5 px-4" style={{ minWidth: '100%', maxWidth: 'none', overflow: 'visible', position: 'relative' }}>
          <div
            className="border-solid border-black flex justify-center items-center py-3 w-full mb-5 px-5 bg-white/60 backdrop-blur-sm relative"
            style={{ border: '1.3px solid black' }}
          >
            <div className="flex gap-5 absolute left-4">
              {showMobileMenu ? (
                <>
                  <button
                    type="button"
                    onClick={() => navigate(isSignedIn ? '/account' : signInHrefWithReturnTo(location))}
                    className="cursor-pointer"
                    style={{
                      height: '15px !important',
                      width: '21px !important',
                      padding: '0 !important',
                      border: 'none !important',
                      background: 'none !important',
                      transform: 'translateX(4px)'
                    }}
                  >
                    <img alt="Account icon" width={16} height={16} src="/assets/NOIR/account-icon.svg" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(isSignedIn ? '/wishlist' : signInHrefWithReturnTo(location))}
                    className="cursor-pointer"
                    style={{
                      height: '21px !important',
                      width: '21px !important',
                      padding: '0 !important',
                      border: 'none !important',
                      background: 'none !important',
                      transform: 'translateX(2px)'
                    }}
                  >
                    <img alt="Wishlist" width={18} height={18} src="/assets/wishlist-heart.svg" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => navigate('/home/shop')}
                    className="cursor-pointer"
                    style={{
                      height: '15px !important',
                      width: '21px !important',
                      padding: '0 !important',
                      border: 'none !important',
                      background: 'none !important'
                    }}
                  >
                    <img alt="Back" width={21} height={15} src="/assets/back-button.svg" />
                  </button>
                  <SearchTrigger type="button" className="cursor-pointer" style={{ transform: 'translateX(-2px)' }}>
                    <img alt="" width={16} height={15} src="/assets/search-icon.svg" />
                  </SearchTrigger>
                </>
              )}
            </div>

            <NavCenter showMobileMenu={showMobileMenu}>
              <p className="text-sm" style={{ fontFamily: '"Futura PT Book"', transform: 'translateY(1px)', margin: 0 }}>
                {showMobileMenu ? (
                  <>
                    <span
                      style={{ fontFamily: '"Futura PT Book"', fontWeight: '400', cursor: 'pointer' }}
                      onClick={() => navigate('/lobby')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          navigate('/lobby');
                        }
                      }}
                      role="link"
                      tabIndex={0}
                    >
                      HOME &gt;
                    </span>{' '}
                    <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}>MENU</span>
                  </>
                ) : (
                  <>
                    <span
                      style={{ fontFamily: '"Futura PT Book"', fontWeight: '400', cursor: 'pointer' }}
                      onClick={() => navigate('/home/shop')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          navigate('/home/shop');
                        }
                      }}
                      role="link"
                      tabIndex={0}
                    >
                      SHOP &gt;
                    </span>{' '}
                    <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}>{title}</span>
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
                  <path
                    d="M0 0H15.75V0.7H7.875H0V0ZM5.25 6.7H10.5H15.375V7.4H10.5H5.25V6.7ZM0 13.1H15.75V13.8H0V13.1Z"
                    fill="black"
                  />
                </svg>
              </div>
            </div>
          </div>

          {showMobileMenu ? (
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
                <div className="flex justify-center gap-8" style={{ marginBottom: '30px' }}>
                  <button
                    type="button"
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
                    type="button"
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
                    type="button"
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

                <div style={{ marginBottom: '20px' }}>
                  <SocialMenuIcons />
                </div>
              </div>
            </div>
          ) : (
            <div className="transition-all duration-300 ease-out" style={{ marginTop: '0', marginBottom: '20px', overflow: 'visible' }}>
              <div
                className="transition-all duration-300 ease-out"
                style={{
                  border: '1.3px solid black',
                  backgroundColor: '#f5f5f5',
                  backgroundImage: `url('/assets/marble-container.png')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  padding: '24px 16px',
                  maxWidth: '100%',
                  margin: '0 auto',
                  overflow: 'visible',
                  position: 'relative'
                }}
              >
                <div style={{ textAlign: 'center', marginBottom: '2px' }}>
                  <div style={{ width: '1px', height: '15px', backgroundColor: 'black', margin: '0 auto 2px auto' }} />
                  <h1
                    style={{
                      fontFamily: '"Futura PT Medium"',
                      fontSize: '13px',
                      color: '#EB1C24',
                      textTransform: 'uppercase',
                      margin: '0',
                      fontWeight: '500'
                    }}
                  >
                    {title}
                  </h1>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

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
