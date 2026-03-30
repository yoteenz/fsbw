import { useEffect, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DynamicCartIcon from './DynamicCartIcon';
import BrandMenuLinks from './BrandMenuLinks';
import SocialMenuIcons from './SocialMenuIcons';
import ConfirmationModal from './ConfirmationModal';
import { clearAppAuth } from '../utils/adminAuth';
import { ShopMobileMenuShopTab } from './ShopMobileMenuShopTab';
import { ShopMobileMenuToolsTab } from './ShopMobileMenuToolsTab';

type BookingCrumb = 'CONSULT' | 'APPOINTMENT';

type Props = {
  crumbHighlight: BookingCrumb;
  children: ReactNode;
  /** Renders below the frosted main card (e.g. product-style add to bag). Hidden when the mobile menu is open. */
  belowCard?: ReactNode;
};

export default function BookingFlowLayout({ crumbHighlight, children, belowCard }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartCount, setCartCount] = useState(() => parseInt(localStorage.getItem('cartCount') || '0', 10));
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mobileMenuActiveTab, setMobileMenuActiveTab] = useState('SHOP');
  const [mobileMenuExpandedItems, setMobileMenuExpandedItems] = useState<string[]>([]);
  const [isSignedIn, setIsSignedIn] = useState(() => localStorage.getItem('isSignedIn') === 'true');
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  useEffect(() => {
    const pathname = location.pathname;
    if (pathname.includes('/tools') || pathname === '/tools/gift-card') {
      setMobileMenuActiveTab('TOOLS');
    } else if (
      pathname.includes('/brand') ||
      pathname.includes('/about') ||
      pathname.includes('/contact') ||
      pathname.includes('/faq') ||
      pathname.includes('/reviews') ||
      pathname.includes('/terms')
    ) {
      setMobileMenuActiveTab('BRAND');
    } else {
      setMobileMenuActiveTab('SHOP');
    }
  }, [location.pathname]);

  useEffect(() => {
    if (showMobileMenu) {
      const pathname = location.pathname;
      if (pathname.includes('/tools') || pathname === '/tools/gift-card') {
        setMobileMenuActiveTab('TOOLS');
      } else if (
        pathname.includes('/brand') ||
        pathname.includes('/about') ||
        pathname.includes('/contact') ||
        pathname.includes('/faq') ||
        pathname.includes('/reviews') ||
        pathname.includes('/terms')
      ) {
        setMobileMenuActiveTab('BRAND');
      } else {
        setMobileMenuActiveTab('SHOP');
      }
    }
  }, [showMobileMenu, location.pathname]);

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
        setIsSignedIn(false);
      }
    };
    window.addEventListener('storage', checkSignInStatus);
    window.addEventListener('focus', checkSignInStatus);
    window.addEventListener('signInStateChanged', checkSignInStatus as EventListener);
    return () => {
      window.removeEventListener('storage', checkSignInStatus);
      window.removeEventListener('focus', checkSignInStatus);
      window.removeEventListener('signInStateChanged', checkSignInStatus as EventListener);
    };
  }, []);

  const handleBack = () => navigate(-1);

  const handleMobileMenuToggle = () => setShowMobileMenu(!showMobileMenu);

  const handleMobileMenuTabClick = (tab: string) => setMobileMenuActiveTab(tab);

  const handleMobileMenuItemToggle = (item: string) => {
    setMobileMenuExpandedItems((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]));
  };

  const handleMobileMenuSignInToggle = () => {
    if (isSignedIn) setShowSignOutConfirm(true);
    else navigate('/sign-in');
  };

  const handleSignOut = () => {
    setIsSignedIn(false);
    clearAppAuth();
    window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'false' }));
    setShowSignOutConfirm(false);
    setShowMobileMenu(false);
  };

  const closeMenu = () => setShowMobileMenu(false);

  const crumbRedText = crumbHighlight;

  return (
    <div className="min-h-screen" style={{ position: 'relative' }}>
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

      <div className="relative z-10">
        <div className="flex flex-col py-5 px-4" style={{ minWidth: '100%', maxWidth: 'none', overflow: 'visible' }}>
          <div
            className="border-solid border-black flex justify-center items-center py-3 w-full mb-5 px-5 bg-white/60 backdrop-blur-sm relative"
            style={{ border: '1.3px solid black' }}
          >
            <div className="flex gap-5 absolute left-4">
              {showMobileMenu ? (
                <>
                  <button
                    type="button"
                    onClick={() => navigate(isSignedIn ? '/account' : '/sign-in')}
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
                    onClick={() => navigate(isSignedIn ? '/wishlist' : '/sign-in')}
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
                    onClick={handleBack}
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
                  <button type="button" className="cursor-pointer" style={{ transform: 'translateX(-2px)' }}>
                    <img alt="Search icon" width={16} height={15} src="/assets/search-icon.svg" />
                  </button>
                </>
              )}
            </div>

            <p className="text-sm" style={{ fontFamily: '"Futura PT Book"', transform: 'translateY(1px)' }}>
              {showMobileMenu ? (
                <>
                  <span
                    role="link"
                    tabIndex={0}
                    style={{ fontFamily: '"Futura PT Book"', fontWeight: '400', cursor: 'pointer' }}
                    onClick={() => navigate('/lobby')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        navigate('/lobby');
                      }
                    }}
                  >
                    HOME &gt;
                  </span>{' '}
                  <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}>MENU</span>
                </>
              ) : (
                <>
                  <span
                    role="link"
                    tabIndex={0}
                    style={{ fontFamily: '"Futura PT Book"', fontWeight: '400', cursor: 'pointer' }}
                    onClick={() => navigate('/home/shop')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        navigate('/home/shop');
                      }
                    }}
                  >
                    BOOKING &gt;
                  </span>{' '}
                  <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}>{crumbRedText}</span>
                </>
              )}
            </p>

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
                  <path d="M0 0H15.75V0.7H7.875H0V0ZM5.25 6.7H10.5H15.375V7.4H10.5H5.25V6.7ZM0 13.1H15.75V13.8H0V13.1Z" fill="black" />
                </svg>
              </div>
            </div>
          </div>

          {showMobileMenu ? (
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
                <div className="flex justify-center gap-8" style={{ marginBottom: '30px' }}>
                  {(['SHOP', 'TOOLS', 'BRAND'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => handleMobileMenuTabClick(tab)}
                      style={{
                        fontFamily: mobileMenuActiveTab === tab ? '"Futura PT Medium"' : '"Futura PT Book"',
                        fontSize: '14px',
                        color: mobileMenuActiveTab === tab ? '#EB1C24' : 'black',
                        fontWeight: '500',
                        textTransform: 'uppercase',
                        borderBottom: mobileMenuActiveTab === tab ? '1px solid #EB1C24' : 'none',
                        borderTop: 'none',
                        borderLeft: 'none',
                        borderRight: 'none',
                        paddingBottom: '4px',
                        background: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div style={{ flex: '1', overflowY: 'auto', marginBottom: '20px', minHeight: '0' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
                    {mobileMenuActiveTab === 'TOOLS' ? (
                      <ShopMobileMenuToolsTab
                        navigate={navigate}
                        closeMenu={closeMenu}
                        labelTranslateX="7px"
                      />
                    ) : mobileMenuActiveTab === 'BRAND' ? (
                      <BrandMenuLinks onClose={closeMenu} />
                    ) : (
                      <ShopMobileMenuShopTab
                        navigate={navigate}
                        mobileMenuExpandedItems={mobileMenuExpandedItems}
                        handleMobileMenuItemToggle={handleMobileMenuItemToggle}
                        closeSubItemMenu={closeMenu}
                        closeAfterStaticNav={closeMenu}
                        buildAWigPath="/build-a-wig/noir"
                        labelTranslateX="7px"
                        arrowImgAlt=""
                      />
                    )}
                  </div>
                </div>

                <div className="flex justify-center" style={{ marginBottom: '20px', marginTop: 'auto' }}>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={handleMobileMenuSignInToggle}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleMobileMenuSignInToggle();
                      }
                    }}
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
            <>
              <div
                className="border border-black flex flex-col pt-6 px-5 pb-8 mb-2 bg-white/60 backdrop-blur-sm"
                style={{
                  borderWidth: '1.3px',
                  minWidth: '100%',
                  maxWidth: 'none',
                  overflow: 'visible',
                  backgroundColor: 'rgba(255, 255, 255, 0.6)'
                }}
              >
                {children}
              </div>
              {belowCard != null ? belowCard : null}
            </>
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
