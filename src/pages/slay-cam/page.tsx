import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DynamicCartIcon from '../../components/DynamicCartIcon';
import BrandMenuLinks from '../../components/BrandMenuLinks';
import { ShopMobileMenuShopTab } from '../../components/ShopMobileMenuShopTab';
import { ShopMobileMenuToolsTab } from '../../components/ShopMobileMenuToolsTab';
import { useShopNavSearchBar } from '../../components/shop/useShopNavSearchBar';
import { signInHrefWithReturnTo } from '../../utils/signInReturnTo';
import { MarblePageShell } from '../../layouts/MarblePageShell';

type MobileMenuTab = 'SHOP' | 'TOOLS' | 'BRAND';

const SLAY_CAM_FEATURES = [
  'REAL FRONTAL SLAYER CLIENT PHOTOS + VIDEOS',
  'SHOP THIS SLAY PRODUCT TAGS',
  'MONTHLY SLAY MVP RECOGNITION',
  'LOYALTY POINTS + REWARD OPPORTUNITIES',
];

export default function SlayCamPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { NavCenter, SearchTrigger } = useShopNavSearchBar();
  const [cartCount, setCartCount] = useState(() => {
    try {
      return parseInt(localStorage.getItem('cartCount') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mobileMenuActiveTab, setMobileMenuActiveTab] = useState<MobileMenuTab>('SHOP');
  const [mobileMenuExpandedItems, setMobileMenuExpandedItems] = useState<string[]>([]);
  const [isSignedIn, setIsSignedIn] = useState(() => {
    try {
      return typeof window !== 'undefined' && localStorage.getItem('isSignedIn') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handleCartCountUpdate = (event: CustomEvent) => setCartCount(event.detail);
    const handleStorageChange = () => {
      try {
        setCartCount(parseInt(localStorage.getItem('cartCount') || '0', 10));
        setIsSignedIn(localStorage.getItem('isSignedIn') === 'true');
      } catch {
        setCartCount(0);
      }
    };
    window.addEventListener('cartCountUpdated', handleCartCountUpdate as EventListener);
    window.addEventListener('cartUpdated', handleStorageChange);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);
    window.addEventListener('signInStateChanged', handleStorageChange);
    return () => {
      window.removeEventListener('cartCountUpdated', handleCartCountUpdate as EventListener);
      window.removeEventListener('cartUpdated', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
      window.removeEventListener('signInStateChanged', handleStorageChange);
    };
  }, []);

  const handleMobileMenuItemToggle = (item: string) => {
    setMobileMenuExpandedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const navButtonStyle = (tab: MobileMenuTab) => ({
    fontFamily: mobileMenuActiveTab === tab ? '"Futura PT Medium"' : '"Futura PT Book"',
    fontSize: '14px',
    color: mobileMenuActiveTab === tab ? '#EB1C24' : 'black',
    fontWeight: '500',
    textTransform: 'uppercase' as const,
    borderBottom: mobileMenuActiveTab === tab ? '1px solid #EB1C24' : 'none',
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    paddingBottom: '4px',
    background: 'none',
    cursor: 'pointer',
  });

  return (
    <MarblePageShell>
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
                    onClick={() => navigate(isSignedIn ? '/account' : signInHrefWithReturnTo(location))}
                    className="cursor-pointer"
                    style={{ height: '15px', width: '21px', padding: 0, border: 'none', background: 'none', transform: 'translateX(4px)' }}
                    type="button"
                  >
                    <img alt="Account icon" width="16" height="16" src="/assets/NOIR/account-icon.svg" />
                  </button>
                  <button
                    onClick={() => navigate(isSignedIn ? '/wishlist' : signInHrefWithReturnTo(location))}
                    className="cursor-pointer"
                    style={{ height: '21px', width: '21px', padding: 0, border: 'none', background: 'none', transform: 'translateX(2px)' }}
                    type="button"
                  >
                    <img alt="Wishlist" width="18" height="18" src="/assets/wishlist-heart.svg" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate(-1)}
                    className="cursor-pointer"
                    style={{ height: '15px', width: '21px', padding: 0, border: 'none', background: 'none' }}
                    type="button"
                  >
                    <img alt="Back" width="21" height="15" src="/assets/back-button.svg" />
                  </button>
                  <SearchTrigger className="cursor-pointer" style={{ transform: 'translateX(-2px)' }}>
                    <img alt="" width="16" height="15" src="/assets/search-icon.svg" />
                  </SearchTrigger>
                </>
              )}
            </div>

            <NavCenter showMobileMenu={showMobileMenu}>
              <p className="text-sm" style={{ fontFamily: '"Futura PT Book"' }}>
                <span
                  style={{ fontFamily: '"Futura PT Book"', fontWeight: 400, cursor: 'pointer' }}
                  onClick={() => navigate('/lobby')}
                >
                  HOME &gt;
                </span>{' '}
                <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: 500 }}>
                  SLAY CAM
                </span>
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
                  onClick={() => setShowMobileMenu((v) => !v)}
                  style={{ marginTop: '2px' }}
                >
                  <path d="M0 0H15.75V0.7H7.875H0V0ZM5.25 6.7H10.5H15.375V7.4H10.5H5.25V6.7ZM0 13.1H15.75V13.8H0V13.1Z" fill="black" />
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
                height: 'calc(100dvh - 80px)',
              }}
            >
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', paddingTop: '20px', flex: 1, minHeight: 0, position: 'relative' }}>
                <div className="flex justify-center gap-8" style={{ marginBottom: '30px' }}>
                  {(['SHOP', 'TOOLS', 'BRAND'] as const).map((tab) => (
                    <button key={tab} onClick={() => setMobileMenuActiveTab(tab)} style={navButtonStyle(tab)} type="button">
                      {tab}
                    </button>
                  ))}
                </div>

                <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px', minHeight: 0 }}>
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
                      />
                    )}
                  </div>
                </div>

                <div style={{ marginTop: 'auto', paddingBottom: '20px' }}>
                  <button
                    onClick={() => navigate(isSignedIn ? '/account' : signInHrefWithReturnTo(location))}
                    className="border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
                    style={{ borderWidth: '1.3px', color: '#EB1C24', fontFamily: '"Futura PT Medium"', backgroundColor: '#FFFFFF' }}
                    type="button"
                  >
                    {isSignedIn ? 'ACCOUNT' : 'SIGN IN'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="px-0 md:px-0" style={{ marginTop: '20px', marginBottom: '20px' }}>
              <div
                className="border border-black bg-white/60 backdrop-blur-sm w-full"
                style={{ borderWidth: '1.3px', padding: '20px', backgroundColor: 'rgba(255, 255, 255, 0.6)' }}
              >
                <div className="-mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '16px' }}>
                  <h1 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '12px', fontWeight: 500, margin: 0, textTransform: 'uppercase' }}>
                    SLAY CAM
                  </h1>
                </div>

                <p style={{ fontFamily: '"Bohemy", cursive', fontSize: '24px', color: '#000000', margin: '0 0 8px 0', lineHeight: 1.05, textTransform: 'lowercase', fontWeight: 400 }}>
                  official frontal slayer showcase
                </p>
                <p style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000000', margin: '0 0 16px 0', lineHeight: 1.5, textTransform: 'uppercase' }}>
                  SHARE YOUR LOOKS, INSPIRE THE COMMUNITY + GET RECOGNIZED THROUGH SLAY MVP.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
                  {SLAY_CAM_FEATURES.map((feature) => (
                    <div key={feature} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <img src="/assets/rose-alert.svg" alt="" style={{ width: '12px', height: '12px', marginTop: '2px', flexShrink: 0 }} />
                      <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', margin: 0, lineHeight: 1.5, textTransform: 'uppercase' }}>
                        {feature}
                      </p>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => navigate(isSignedIn ? '/account' : signInHrefWithReturnTo(location))}
                  className="border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
                  style={{ borderWidth: '1.3px', color: '#EB1C24', fontFamily: '"Futura PT Medium"', backgroundColor: '#FFFFFF' }}
                >
                  {isSignedIn ? 'OPEN ACCOUNT' : 'SIGN IN TO PREP YOUR SLAY'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MarblePageShell>
  );
}
