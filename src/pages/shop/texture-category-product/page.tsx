import React, { useState, useEffect, useRef } from 'react';
import { useMarbleStripSnapStep } from '../../../hooks/useMarbleStripSnapStep';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import DynamicCartIcon from '../../../components/DynamicCartIcon';
import ConfirmationModal from '../../../components/ConfirmationModal';
import BrandMenuLinks from '../../../components/BrandMenuLinks';
import SocialMenuIcons from '../../../components/SocialMenuIcons';
import { getPerUserKey, getCurrentUserEmailFromStorage, PER_USER_KEYS } from '../../../utils/perUserStorage';
import { clearAppAuth } from '../../../utils/adminAuth';
import type { CurrencyRatesRecord } from '../../../utils/currencyFormat';
import { formatPriceUsd } from '../../../utils/currencyFormat';
import {
  shopTextureCategoryProductPageDisplayScale,
  shopTextureCategoryCurlyThumbTranslateYPx,
  shopTextureCategoryThumbFallbackSrc,
  shopTextureCategoryThumbSrc,
  isShopTextureCurlyFrontals
} from '../../../utils/shopTextureCategoryThumb';
import {
  BCF_LENGTH_OPTIONS,
  BCF_ORIGIN_OPTIONS,
  BCF_TEXTURE_LABELS,
  bcfColorOptionsForOrigin,
  bcfDefaultColorIdForOrigin,
  bcfDefaultOriginForRouteTexture,
  bcfInitialOriginFromPathname,
  bcfLaceOptionsForCategory,
  bcfPriceAdjustments,
  bcfTexturesForOrigin,
  type BcfOriginId
} from '../../../utils/bcfProductOptions';
import { isPremiumMemberForGatedFeatures, prepareMembershipUpgradeNavigation } from '../../../utils/premiumMemberAccess';
import { ShopMobileMenuShopTab } from '../../../components/ShopMobileMenuShopTab';
import { ShopMobileMenuToolsTab } from '../../../components/ShopMobileMenuToolsTab';
import {
  marbleStripCellOuter,
  marbleStripNavArrowStyle,
  marbleStripNavMiddleColStyle,
  marbleStripNavRowStyle,
  marbleStripScrollRowStyle,
  marbleStripViewportStyle
} from '../../../utils/marbleStripStyles';

type Texture = 'straight' | 'wavy' | 'curly';
type Category = 'bundles' | 'closures' | 'frontals';

const TEXTURE_META: Record<Texture, { label: string; subline: string }> = {
  straight: { label: 'STRAIGHT', subline: 'RAW HAIR' },
  wavy: { label: 'WAVY', subline: 'RAW HAIR' },
  curly: { label: 'CURLY', subline: 'RAW HAIR' }
};

const CATEGORY_TITLE: Record<Category, string> = {
  bundles: 'BUNDLES',
  closures: 'CLOSURES',
  frontals: 'FRONTALS'
};

const PRICE_BY_CATEGORY: Record<Category, number> = {
  bundles: 680,
  closures: 445,
  frontals: 565
};

function parseShopBcfCategory(pathname: string): Category | null {
  const m = pathname.match(/^\/shop\/(bundles|closures|frontals)$/);
  if (!m) return null;
  return m[1] as Category;
}

function parseTextureSearch(search: string): Texture | null {
  const q = search.startsWith('?') ? search.slice(1) : search;
  const t = new URLSearchParams(q).get('texture');
  if (t === 'straight' || t === 'wavy' || t === 'curly') return t;
  return null;
}

function shopBcfUrl(category: Category, texture: Texture): string {
  return `/shop/${category}?texture=${texture}`;
}

const TEXTURE_ORDER: Texture[] = ['straight', 'wavy', 'curly'];

type BcfProductTab = 'DETAILS' | 'SHIPPING' | 'POLICY' | 'CARE + STORAGE' | 'REVIEWS';

const BCF_PRODUCT_TAB_ORDER: BcfProductTab[] = ['DETAILS', 'SHIPPING', 'POLICY', 'CARE + STORAGE', 'REVIEWS'];

const bcfBohemySubLabelStyle: React.CSSProperties = {
  fontFamily: '"Bohemy", cursive',
  fontSize: '19px',
  fontWeight: 400,
  textAlign: 'center',
  margin: '6px 0 8px',
  color: '#000'
};

/** Match Noir unit PDP option chips (e.g. cap size): 11px Futura Medium + clamp padding. */
const BCF_OPTION_RED = '#EB1C24';
const bcfOptionBtnTypography: React.CSSProperties = {
  fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
  fontSize: '11px',
  fontWeight: 500,
  paddingTop: 'clamp(4px, 0.5vw, 8px)',
  paddingBottom: 'clamp(4px, 0.5vw, 8px)',
  paddingLeft: 'clamp(10px, 1.5vw, 20px)',
  paddingRight: 'clamp(10px, 1.5vw, 20px)',
  minWidth: 'clamp(50px, 12vw, 75px)',
  boxSizing: 'border-box',
  backgroundColor: '#ffffff',
  cursor: 'pointer'
};

function bcfOptionSelectedChrome(selected: boolean): Pick<React.CSSProperties, 'border' | 'color'> {
  return {
    border: selected ? `1.3px solid ${BCF_OPTION_RED}` : '1.3px solid #000000',
    color: selected ? BCF_OPTION_RED : '#000000'
  };
}

/** Same gray/white/color rings as build-a-wig `ThumbBox` color swatches. */
function BcfColorSwatchDonut({ colorCode }: { colorCode: string }) {
  return (
    <div
      style={{
        width: '35px',
        height: '35px',
        backgroundColor: '#808080',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
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
  );
}

/** Gift-card–style PDP for `/shop/bundles` (+ optional `?texture=straight|wavy|curly`). */
export default function ShopTextureCategoryProductPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const category = parseShopBcfCategory(location.pathname);
  const texture: Texture = parseTextureSearch(location.search) ?? 'straight';

  const [activeTab, setActiveTab] = useState<BcfProductTab>('DETAILS');
  const [similarProductsScroll, setSimilarProductsScroll] = useState(0);
  const [recentlyViewedScroll, setRecentlyViewedScroll] = useState(0);
  const [similarSnapPx, setSimilarStripViewportRef] = useMarbleStripSnapStep();
  const [recentSnapPx, setRecentStripViewportRef] = useMarbleStripSnapStep();
  const [addToBagState, setAddToBagState] = useState<'idle' | 'adding' | 'added'>('idle');
  const [cartCount, setCartCount] = useState(() => parseInt(localStorage.getItem('cartCount') || '0', 10));
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mobileMenuActiveTab, setMobileMenuActiveTab] = useState('SHOP');
  const [mobileMenuExpandedItems, setMobileMenuExpandedItems] = useState<string[]>([]);
  const [isSignedIn, setIsSignedIn] = useState(() => localStorage.getItem('isSignedIn') === 'true');
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showBcfColorUpgradeModal, setShowBcfColorUpgradeModal] = useState(false);

  const [bcfOrigin, setBcfOrigin] = useState<BcfOriginId>(() =>
    typeof window !== 'undefined'
      ? bcfInitialOriginFromPathname(window.location.pathname, window.location.search)
      : 'CAMBODIAN'
  );
  const [bcfLength, setBcfLength] = useState('24"');
  const [bcfColor, setBcfColor] = useState('OFF BLACK');
  const [bcfLace, setBcfLace] = useState(() => {
    if (typeof window === 'undefined') return '13X6';
    const cat = parseShopBcfCategory(window.location.pathname);
    if (!cat || cat === 'bundles') return '13X6';
    const opts = bcfLaceOptionsForCategory(cat);
    return opts[0]?.id ?? '5X5';
  });

  const skipBcfOriginDefaultOnNextPathRef = useRef(false);

  const bcfColorsAvailable = React.useMemo(() => bcfColorOptionsForOrigin(bcfOrigin), [bcfOrigin]);

  const [selectedCurrency, setSelectedCurrency] = useState<string>(() => {
    try {
      const key = getPerUserKey(PER_USER_KEYS.selectedCurrency, getCurrentUserEmailFromStorage());
      return localStorage.getItem(key) || 'USD';
    } catch {
      return 'USD';
    }
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
    setSimilarProductsScroll(0);
    setRecentlyViewedScroll(0);
  }, [location.pathname, location.search]);

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
    const check = () => setIsSignedIn(localStorage.getItem('isSignedIn') === 'true');
    window.addEventListener('storage', check);
    window.addEventListener('focus', check);
    window.addEventListener('signInStateChanged', check as EventListener);
    return () => {
      window.removeEventListener('storage', check);
      window.removeEventListener('focus', check);
      window.removeEventListener('signInStateChanged', check as EventListener);
    };
  }, []);

  useEffect(() => {
    const key = getPerUserKey(PER_USER_KEYS.selectedCurrency, getCurrentUserEmailFromStorage());
    const saved = localStorage.getItem(key);
    if (saved && currencyRates[saved as keyof typeof currencyRates]) setSelectedCurrency(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const key = getPerUserKey(PER_USER_KEYS.selectedCurrency, getCurrentUserEmailFromStorage());
    localStorage.setItem(key, selectedCurrency);
  }, [selectedCurrency]);

  useEffect(() => {
    if (!category) return;
    if (skipBcfOriginDefaultOnNextPathRef.current) {
      skipBcfOriginDefaultOnNextPathRef.current = false;
      return;
    }
    const t = parseTextureSearch(location.search) ?? 'straight';
    setBcfOrigin(bcfDefaultOriginForRouteTexture(t));
  }, [location.pathname, location.search, category]);

  useEffect(() => {
    if (!category) return;
    const t = parseTextureSearch(location.search) ?? 'straight';
    const allowed = bcfTexturesForOrigin(bcfOrigin);
    if (!allowed.includes(t)) {
      skipBcfOriginDefaultOnNextPathRef.current = true;
      navigate(shopBcfUrl(category, allowed[0] as Texture), { replace: true });
    }
  }, [bcfOrigin, navigate, category, location.search]);

  useEffect(() => {
    const allowedIds = new Set(bcfColorsAvailable.map((o) => o.id));
    if (!allowedIds.has(bcfColor)) {
      const fallback = bcfDefaultColorIdForOrigin(bcfOrigin);
      const next = allowedIds.has(fallback) ? fallback : (bcfColorsAvailable[0]?.id ?? 'OFF BLACK');
      setBcfColor(next);
    }
  }, [bcfOrigin, bcfColorsAvailable, bcfColor]);

  const bcfLaceOptions = React.useMemo(() => {
    if (!category || category === 'bundles') return [];
    return bcfLaceOptionsForCategory(category);
  }, [category]);

  useEffect(() => {
    if (!category || category === 'bundles') return;
    const opts = bcfLaceOptionsForCategory(category);
    const allowed = new Set(opts.map((l) => l.id));
    if (!allowed.has(bcfLace)) {
      setBcfLace(opts[0]?.id ?? '5X5');
    }
  }, [category, bcfLace]);

  useEffect(() => {
    const p = location.pathname;
    if (p.includes('/tools') || p === '/tools/gift-card') setMobileMenuActiveTab('TOOLS');
    else if (p.includes('/brand')) setMobileMenuActiveTab('BRAND');
    else setMobileMenuActiveTab('SHOP');
  }, [location.pathname]);

  useEffect(() => {
    if (!showMobileMenu) return;
    const p = location.pathname;
    if (p.includes('/tools') || p === '/tools/gift-card') setMobileMenuActiveTab('TOOLS');
    else if (p.includes('/brand')) setMobileMenuActiveTab('BRAND');
    else setMobileMenuActiveTab('SHOP');
  }, [showMobileMenu, location.pathname]);

  const formatPrice = React.useCallback(
    (price: number) => formatPriceUsd(price, selectedCurrency, currencyRates as CurrencyRatesRecord),
    [currencyRates, selectedCurrency]
  );

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

  const handleBcfColorSelect = React.useCallback((colorId: string) => {
    const defaultId = bcfDefaultColorIdForOrigin(bcfOrigin);
    if (colorId === defaultId) {
      setBcfColor(colorId);
      return;
    }
    if (!isPremiumMemberForGatedFeatures()) {
      setShowBcfColorUpgradeModal(true);
      return;
    }
    setBcfColor(colorId);
  }, [bcfOrigin]);

  const handleBcfColorUpgradeConfirm = () => {
    setShowBcfColorUpgradeModal(false);
    prepareMembershipUpgradeNavigation();
    navigate('/account/rewards');
  };

  const handleBcfColorUpgradeClose = () => setShowBcfColorUpgradeModal(false);

  const handleSimilarProductsLeftArrow = () => setSimilarProductsScroll(0);
  const handleSimilarProductsRightArrow = () => setSimilarProductsScroll(-similarSnapPx);
  const handleRecentlyViewedLeftArrow = () => setRecentlyViewedScroll(0);
  const handleRecentlyViewedRightArrow = () => setRecentlyViewedScroll(-recentSnapPx);

  if (!category) {
    return <Navigate to="/home/shop" replace />;
  }

  const meta = TEXTURE_META[texture];
  const categoryTitle = CATEGORY_TITLE[category];
  /** Nav + hero: SHOP > BUNDLES | CLOSURES | FRONTALS (no STRAIGHT/WAVY/CURLY prefix). */
  const displayProductName = categoryTitle;
  const navCrumb = displayProductName;
  /** Cart / receipts: category first, texture after · for disambiguation. */
  const cartLineName = `${categoryTitle} · ${meta.label}`;
  const basePrice = PRICE_BY_CATEGORY[category];
  const displayPrice = React.useMemo(
    () =>
      basePrice +
      bcfPriceAdjustments(bcfLength, bcfColor, category === 'bundles' ? null : bcfLace),
    [basePrice, bcfLength, bcfColor, bcfLace, category]
  );
  const otherTextures = TEXTURE_ORDER.filter((t) => t !== texture);
  const heroThumbSrc = shopTextureCategoryThumbSrc(texture, category);
  const allowedBcfTextures = bcfTexturesForOrigin(bcfOrigin);

  const handleAddToBag = () => {
    setAddToBagState('adding');
    setTimeout(() => {
      try {
        const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
        const newItem = {
          id: `shop-${texture}-${category}-${Date.now()}`,
          name: cartLineName,
          price: displayPrice,
          quantity: 1,
          image: heroThumbSrc,
          type: 'shop-texture-category',
          texture,
          category,
          hairOrigin: bcfOrigin,
          length: bcfLength,
          color: bcfColor,
          ...(category === 'bundles' ? {} : { lace: bcfLace })
        };
        const updated = [newItem, ...cartItems];
        localStorage.setItem('cartItems', JSON.stringify(updated));
        const newCartCount = updated.length;
        localStorage.setItem('cartCount', String(newCartCount));
        setCartCount(newCartCount);
        window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: newCartCount }));
        window.dispatchEvent(new Event('cartUpdated'));
        setAddToBagState('added');
        setTimeout(() => setAddToBagState('idle'), 2000);
      } catch (e) {
        console.error(e);
        setAddToBagState('idle');
      }
    }, 500);
  };

  const detailsCopy =
    category === 'bundles'
      ? [
          'PREMIUM RAW HAIR BUNDLES MATCHING YOUR SELECTED TEXTURE.',
          'AVAILABLE LENGTHS AND ORIGINS VARY — SEE CHECKOUT OPTIONS.',
          'PROFESSIONAL INSTALLATION RECOMMENDED FOR BEST RESULTS.'
        ]
      : category === 'closures'
        ? [
            'LACE CLOSURES CRAFTED TO BLEND WITH YOUR TEXTURE SELECTION.',
            'VERSATILE PARTING AND NATURAL HAIRLINE APPEARANCE.',
            'PAIR WITH BUNDLES OR YOUR STYLIST’S RECOMMENDATION.'
          ]
        : [
            'EAR-TO-EAR FRONTALS FOR MAXIMUM STYLING FLEXIBILITY.',
            'DESIGNED TO COMPLEMENT STRAIGHT, WAVY, OR CURLY BUNDLES.',
            'CONSULT YOUR STYLIST FOR CUSTOMIZATION AND INSTALL.'
          ];

  const policyCopy = [
    'ALL SALES FOLLOW SITE TERMS; CONTACT SUPPORT FOR PRODUCT QUESTIONS.',
    'FINAL PROCESSING TIMES MAY VARY — YOU WILL RECEIVE ORDER UPDATES BY EMAIL.',
    'FOR SUPPORT, REACH OUT TO CONTACT@FRONTALSLAYER.COM.'
  ];

  /** Same as unit PDPs (e.g. Noir) — shipping & care for BCF bundles / closures / frontals. */
  const shippingCopy = [
    'STANDARD PROCESSING IS 6 TO 8 WEEKS AND UP TO 10 WEEKS FOR CUSTOMIZED ORDERS.',
    'EXPRESS PROCESSING IS 4 TO 6 WEEKS WITH RUSH SHIPPING FOR AN ADDITIONAL $120 USD.',
    'CUSTOM COLOR, STYLING & ADD-ONS ARE NOT APPLICABLE FOR RUSH PROCESSING.',
    'PROCESSING TIME DOES NOT INCLUDE WEEKENDS AND MAJOR US HOLIDAYS.'
  ];

  const careStorageCopy = [
    'WASH WITH MILD SHAMPOO, AVOID GETTING CONDITIONER DIRECTLY ON THE LACE.',
    'ROUTINELY BRUSH HAIR WITH A PADDLE BRUSH TO AVOID MATTING & SHEDDING.',
    'CAREFULLY STORE UNIT INSIDE SATIN LINED DUST BAG TO MINIMIZE DAMAGE, FRIZZ + DEBRIS.'
  ];

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
                    onClick={() => navigate(-1)}
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
                    SHOP &gt;
                  </span>{' '}
                  <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}>{navCrumb}</span>
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
                        closeMenu={() => setShowMobileMenu(false)}
                        labelTranslateX="7px"
                      />
                    ) : mobileMenuActiveTab === 'BRAND' ? (
                      <BrandMenuLinks onClose={() => setShowMobileMenu(false)} />
                    ) : (
                                            <ShopMobileMenuShopTab
                                              navigate={navigate}
                                              mobileMenuExpandedItems={mobileMenuExpandedItems}
                                              handleMobileMenuItemToggle={handleMobileMenuItemToggle}
                                              closeSubItemMenu={() => setShowMobileMenu(false)}
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
            <>
              <div
                className="border border-black flex flex-col pt-6 px-5 mb-2 bg-white/60 backdrop-blur-sm transition-all duration-300 ease-out"
                style={{
                  borderWidth: '1.3px',
                  minWidth: '100%',
                  maxWidth: 'none',
                  overflow: 'visible',
                  backgroundColor: 'rgba(255, 255, 255, 0.6)',
                  paddingBottom: '0px'
                }}
              >
                <div
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'column',
                    marginBottom: '24px',
                    transform: 'translateY(20px)',
                    overflow: 'visible',
                    minWidth: '100%',
                    maxWidth: 'none'
                  }}
                >
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      marginBottom: '20px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      transform: 'translateY(-74px)'
                    }}
                  >
                    <img
                      src={heroThumbSrc}
                      alt={displayProductName}
                      onError={(e) => {
                        const img = e.currentTarget;
                        if (img.getAttribute('data-fallback-tried') === '1') return;
                        img.setAttribute('data-fallback-tried', '1');
                        img.src = shopTextureCategoryThumbFallbackSrc[texture];
                      }}
                      style={{
                        width: '100%',
                        maxWidth: `${400 * shopTextureCategoryProductPageDisplayScale(texture)}px`,
                        height: 'auto',
                        margin: '0 auto',
                        ...((): { transform?: string } => {
                          const y = shopTextureCategoryCurlyThumbTranslateYPx(texture, category);
                          return y != null ? { transform: `translateY(${y}px)` } : {};
                        })()
                      }}
                    />
                  </div>

                  <div
                    className={texture === 'curly' ? 'shop-bcf-curly-product-copy-lift' : undefined}
                  >
                    <p
                      className="text-center text-black mb-2 gift-card-product-name"
                      style={{
                        fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif !important',
                        fontSize: '32px !important',
                        fontWeight: '400 !important',
                        lineHeight: '1.15 !important',
                        margin: '0 !important',
                        padding: '0 8px !important',
                        display: 'block !important',
                        textAlign: 'center' as const,
                        whiteSpace: 'normal !important',
                        width: '100% !important',
                        transform: 'translateY(-128px) !important',
                        position: 'relative' as const,
                        zIndex: '999 !important'
                      }}
                    >
                      {displayProductName}
                    </p>

                    <p
                      className="text-center text-red-500 uppercase mb-2"
                      style={{
                        fontFamily: '"Futura PT Medium"',
                        fontWeight: '500',
                        transform: 'translateY(-128px)',
                        fontSize: '12px',
                        padding: '0 12px'
                      }}
                    >
                      {meta.subline}
                    </p>

                    <p
                      className="text-center text-black mb-1"
                      style={{
                        fontFamily: '"Futura PT Medium"',
                        fontSize: '16px',
                        fontWeight: '500',
                        transform: 'translateY(-137px)',
                        width: '100%'
                      }}
                      dangerouslySetInnerHTML={formatPrice(displayPrice)}
                    />

                    <p
                      className="text-center text-black mb-1"
                      style={{
                        fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                        fontSize: '10px',
                        fontWeight: '500',
                        transform: 'translateY(-137px)'
                      }}
                    >
                      (EXCLUDING SALES TAX)
                    </p>

                    <div className="flex justify-center mb-2 gap-1" style={{ transform: 'translateY(-137px)' }}>
                      {[...Array(5)].map((_, index) => (
                        <img
                          key={index}
                          src="/assets/NOIR/star-symbol.png"
                          alt=""
                          style={{
                            width: '15px',
                            height: '15px',
                            filter: 'drop-shadow(0 0 0 1px black)',
                            stroke: '1px black'
                          }}
                        />
                      ))}
                    </div>

                    <p
                      className="text-center uppercase mb-1"
                      style={{
                        fontFamily: '"Futura PT Demi", futuristic-pt, Futura, Inter, sans-serif',
                        fontSize: '10px',
                        fontWeight: '600',
                        color: '#808080',
                        transform: 'translateY(-137px)'
                      }}
                    >
                      OR 4 PAYMENTS OF{' '}
                      <span dangerouslySetInnerHTML={formatPrice(Math.ceil(displayPrice / 4))} /> WITH{' '}
                      <span style={{ fontWeight: '600', color: '#EB1C24' }}>KLARNA</span>
                    </p>

                    {/* BCF: hair profile (Bohemy) + length/color (Bohemy sublabels); lace size on closures/frontals */}
                    <div
                      style={{
                        transform: 'translateY(-102px)',
                        width: '100%',
                        padding: '0 8px 12px',
                        boxSizing: 'border-box'
                      }}
                    >
                      <p
                        style={{
                          fontFamily: '"Bohemy", cursive',
                          fontSize: '19px',
                          fontWeight: 400,
                          textAlign: 'center',
                          margin: '0 0 8px',
                          color: '#000'
                        }}
                      >
                        hair profile
                      </p>
                      <div className="flex flex-wrap justify-center gap-3 mb-3">
                        {BCF_ORIGIN_OPTIONS.map((o) => {
                          const sel = bcfOrigin === o.id;
                          return (
                            <button
                              key={o.id}
                              type="button"
                              onClick={() => setBcfOrigin(o.id)}
                              style={{
                                ...bcfOptionBtnTypography,
                                ...bcfOptionSelectedChrome(sel)
                              }}
                            >
                              {o.label}
                            </button>
                          );
                        })}
                      </div>
                      <p style={bcfBohemySubLabelStyle}>hair texture</p>
                      <div className="flex flex-wrap justify-center gap-3 mb-3">
                        {TEXTURE_ORDER.map((tid) => {
                          const allowed = allowedBcfTextures.includes(tid);
                          const active = texture === tid;
                          return (
                            <button
                              key={tid}
                              type="button"
                              disabled={!allowed}
                              onClick={() => {
                                if (!allowed) return;
                                if (tid !== texture) navigate(shopBcfUrl(category, tid));
                              }}
                              style={{
                                ...bcfOptionBtnTypography,
                                ...bcfOptionSelectedChrome(active),
                                cursor: allowed ? 'pointer' : 'not-allowed',
                                opacity: allowed ? 1 : 0.35
                              }}
                            >
                              {BCF_TEXTURE_LABELS[tid]}
                            </button>
                          );
                        })}
                      </div>
                      {(category === 'closures' || category === 'frontals') && (
                        <>
                          <p
                            style={{
                              fontFamily: '"Bohemy", cursive',
                              fontSize: '19px',
                              fontWeight: 400,
                              textAlign: 'center',
                              margin: '16px 0 8px',
                              color: '#000'
                            }}
                          >
                            lace size
                          </p>
                          <div
                            className="flex flex-wrap justify-center gap-3 mb-3"
                            style={{ maxHeight: '100px', overflowY: 'auto' }}
                          >
                            {bcfLaceOptions.map((l) => {
                              const sel = bcfLace === l.id;
                              return (
                                <button
                                  key={l.id}
                                  type="button"
                                  onClick={() => setBcfLace(l.id)}
                                  style={{
                                    ...bcfOptionBtnTypography,
                                    ...bcfOptionSelectedChrome(sel),
                                    minWidth: 'clamp(72px, 18vw, 130px)'
                                  }}
                                >
                                  {l.label}
                                </button>
                              );
                            })}
                          </div>
                        </>
                      )}

                      <p style={{ ...bcfBohemySubLabelStyle, margin: '22px 0 8px' }}>hair length</p>
                      <div className="grid grid-cols-4 gap-3 mb-3 justify-items-center max-w-[320px] mx-auto">
                        {BCF_LENGTH_OPTIONS.map((len) => {
                          const sel = bcfLength === len.id;
                          return (
                            <button
                              key={len.id}
                              type="button"
                              onClick={() => setBcfLength(len.id)}
                              style={{
                                ...bcfOptionBtnTypography,
                                ...bcfOptionSelectedChrome(sel),
                                width: '100%',
                                maxWidth: 'clamp(52px, 14vw, 76px)',
                                minWidth: 0,
                                paddingLeft: 'clamp(4px, 1vw, 10px)',
                                paddingRight: 'clamp(4px, 1vw, 10px)'
                              }}
                            >
                              {len.label}
                            </button>
                          );
                        })}
                      </div>
                      <p style={bcfBohemySubLabelStyle}>hair color</p>
                      <div className="flex flex-wrap justify-center gap-x-3 gap-y-3">
                        {bcfColorsAvailable.map((c) => {
                          const sel = bcfColor === c.id;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => handleBcfColorSelect(c.id)}
                              className="flex flex-col items-center bg-white"
                              style={{
                                borderWidth: '1.3px',
                                borderStyle: 'solid',
                                ...bcfOptionSelectedChrome(sel),
                                padding: '4px 4px 6px',
                                width: '60px',
                                boxSizing: 'border-box',
                                cursor: 'pointer'
                              }}
                            >
                              <div className="flex items-center justify-center" style={{ height: '38px' }}>
                                <BcfColorSwatchDonut colorCode={c.swatch} />
                              </div>
                              <span
                                style={{
                                  fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                                  fontSize: '9px',
                                  fontWeight: 500,
                                  textAlign: 'center',
                                  lineHeight: 1.05,
                                  textTransform: 'uppercase',
                                  marginTop: '2px',
                                  color: sel ? BCF_OPTION_RED : '#000000'
                                }}
                              >
                                {c.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="mt-6"
                  style={{
                    transform: 'translateY(-155px)',
                    marginBottom: '-65px',
                    paddingTop: '30px'
                  }}
                >
                  <div className="flex justify-center flex-wrap" style={{ gap: '16px' }}>
                    {BCF_PRODUCT_TAB_ORDER.map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={`py-1 text-xs font-medium ${
                          activeTab === tab ? 'text-red-500' : 'text-black hover:text-red-500'
                        }`}
                        style={{
                          fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                          fontSize: '10px',
                          borderBottom: activeTab === tab ? '1px solid #EB1C24' : 'none',
                          paddingLeft: 0,
                          paddingRight: 0
                        }}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 space-y-4" style={{ maxWidth: 'none', width: '100%', marginBottom: '-65px', paddingBottom: '0px' }}>
                    {activeTab === 'DETAILS' &&
                      detailsCopy.map((line, i) => (
                        <p
                          key={i}
                          style={{
                            fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                            fontSize: '7.7px',
                            color: 'black',
                            marginBottom: i === detailsCopy.length - 1 ? '-8px' : '0px',
                            padding: '0 4px',
                            textAlign: 'center'
                          }}
                        >
                          {line}
                        </p>
                      ))}
                    {activeTab === 'SHIPPING' &&
                      shippingCopy.map((line, i) => (
                        <p
                          key={i}
                          style={{
                            fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                            fontSize: '7.7px',
                            color: 'black',
                            marginBottom: i === shippingCopy.length - 1 ? '-8px' : '0px',
                            padding: '0 4px',
                            textAlign: 'center'
                          }}
                        >
                          {line}
                        </p>
                      ))}
                    {activeTab === 'POLICY' &&
                      policyCopy.map((line, i) => (
                        <p
                          key={i}
                          style={{
                            fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                            fontSize: '7.7px',
                            color: 'black',
                            marginBottom: i === policyCopy.length - 1 ? '-8px' : '0px',
                            padding: '0 4px',
                            textAlign: 'center'
                          }}
                        >
                          {line}
                        </p>
                      ))}
                    {activeTab === 'CARE + STORAGE' &&
                      careStorageCopy.map((line, i) => (
                        <p
                          key={i}
                          style={{
                            fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                            fontSize: '7.7px',
                            color: 'black',
                            marginBottom: i === careStorageCopy.length - 1 ? '-8px' : '0px',
                            padding: '0 4px',
                            textAlign: 'center'
                          }}
                        >
                          {line}
                        </p>
                      ))}
                    {activeTab === 'REVIEWS' && (
                      <p
                        style={{
                          fontFamily: '"Futura PT Medium", Futura, Inter, sans-serif',
                          fontSize: '11px',
                          color: '#808080',
                          marginBottom: '-8px',
                          textAlign: 'center',
                          textTransform: 'uppercase'
                        }}
                      >
                        NO REVIEWS YET. BE THE FIRST TO REVIEW THIS PRODUCT.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-0 md:px-0" style={{ marginTop: '2px' }}>
                <button
                  type="button"
                  onClick={handleAddToBag}
                  disabled={addToBagState === 'adding'}
                  className={`border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold ${
                    addToBagState === 'adding'
                      ? 'bg-white cursor-not-allowed'
                      : addToBagState === 'added'
                        ? 'bg-white cursor-pointer'
                        : 'bg-white cursor-pointer hover:bg-gray-50'
                  }`}
                  style={{
                    borderWidth: '1.3px',
                    color: '#EB1C24',
                    fontFamily: '"Futura PT Medium", Futura, Inter, sans-serif',
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  {addToBagState === 'idle' && 'ADD TO BAG'}
                  {addToBagState === 'adding' && 'ADDING...'}
                  {addToBagState === 'added' && (
                    <span className="flex items-center justify-center gap-1">
                      <img src="/assets/check.svg" alt="" width={9} height={9} />
                      <span style={{ color: '#808080' }}>IN THE BAG</span>
                    </span>
                  )}
                </button>
              </div>

              {/* SIMILAR — other textures, same category (gift card carousel pattern) */}
              <div className="px-0 md:px-0" style={{ marginTop: '0', marginBottom: '20px' }}>
                <div
                  className="backdrop-blur-sm"
                  style={{
                    border: '1.3px solid black',
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    padding: '0px',
                    maxWidth: '100%',
                    margin: '0 auto'
                  }}
                >
                  <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                    <div
                      style={{
                        width: '1px',
                        height: '15px',
                        backgroundColor: 'black',
                        margin: '0 auto 8px auto'
                      }}
                    />
                    <h3
                      style={{
                        fontFamily: '"Futura PT Medium"',
                        fontSize: '12px',
                        color: '#EB1C24',
                        textTransform: 'uppercase',
                        margin: '0',
                        fontWeight: '500'
                      }}
                    >
                      SIMILAR PRODUCTS
                    </h3>
                  </div>

                  <div style={marbleStripNavRowStyle}>
                    <button
                      type="button"
                      onClick={handleSimilarProductsLeftArrow}
                      style={marbleStripNavArrowStyle('left', false)}
                    >
                      <img src="/assets/NOIR/left-facing-arrow.svg" alt="" style={{ width: '14px', height: '14px' }} />
                    </button>

                    <div style={marbleStripNavMiddleColStyle}>
                      <div
                        style={{
                          position: 'absolute',
                          left: '50%',
                          top: '0',
                          bottom: '0',
                          width: '1px',
                          backgroundColor: 'black',
                          zIndex: 20,
                          transform: 'translateX(-50%)'
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          left: '50%',
                          top: '0',
                          bottom: '0',
                          width: '10px',
                          backgroundColor: 'transparent',
                          zIndex: 15,
                          transform: 'translateX(-50%)',
                          pointerEvents: 'none'
                        }}
                      />
                      <div ref={setSimilarStripViewportRef} style={marbleStripViewportStyle}>
                        <div style={marbleStripScrollRowStyle(similarProductsScroll)}>
                          {otherTextures.map((ot) => {
                            const om = TEXTURE_META[ot];
                            const simTitle = `${om.label} ${categoryTitle}`;
                            const simThumbSrc = shopTextureCategoryThumbSrc(ot, category);
                            return (
                              <div
                                key={ot}
                                role="button"
                                tabIndex={0}
                                onClick={() => navigate(shopBcfUrl(category, ot))}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    navigate(shopBcfUrl(category, ot));
                                  }
                                }}
                                style={marbleStripCellOuter}
                              >
                                <div
                                  style={{
                                    padding: '10px 10px 4px 10px',
                                    textAlign: 'center',
                                    width: '100%',
                                    boxSizing: 'border-box'
                                  }}
                                >
                                  <img
                                    src={simThumbSrc}
                                    alt={simTitle}
                                    onError={(e) => {
                                      const img = e.currentTarget;
                                      if (img.getAttribute('data-fallback-tried') === '1') return;
                                      img.setAttribute('data-fallback-tried', '1');
                                      img.src = shopTextureCategoryThumbFallbackSrc[ot];
                                    }}
                                    style={{
                                      width: '100%',
                                      height: 'auto',
                                      marginBottom: '10px',
                                      marginLeft: '10px',
                                      cursor: 'pointer',
                                      pointerEvents: 'none',
                                      ...(() => {
                                        const scale = shopTextureCategoryProductPageDisplayScale(ot);
                                        const nudge = isShopTextureCurlyFrontals(ot, category);
                                        const parts: string[] = [];
                                        if (scale !== 1) parts.push(`scale(${scale})`);
                                        if (nudge) parts.push('translateY(-2px)');
                                        if (parts.length === 0) return {};
                                        return {
                                          transform: parts.join(' '),
                                          ...(scale !== 1 ? { transformOrigin: 'center top' as const } : {})
                                        };
                                      })()
                                    }}
                                  />
                                  <div
                                    className={ot === 'curly' ? 'shop-bcf-curly-product-copy-lift' : undefined}
                                  >
                                    <p
                                      style={{
                                        fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                                        fontSize: '18px',
                                        color: 'black',
                                        textTransform: 'uppercase',
                                        margin: '-10px 0 -3px 0',
                                        fontWeight: '500',
                                        transform: 'translateX(10px)'
                                      }}
                                    >
                                      {simTitle}
                                    </p>
                                    <p
                                      style={{
                                        fontFamily: '"Futura PT Medium"',
                                        fontSize: '10px',
                                        color: '#EB1C24',
                                        textTransform: 'uppercase',
                                        margin: '0 0 5px 0',
                                        fontWeight: '500',
                                        lineHeight: '0.84',
                                        transform: 'translateX(10px) translateY(1px)'
                                      }}
                                    >
                                      {categoryTitle} · RAW HAIR
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
                                        transform: 'translateX(10px) translateY(-1px)'
                                      }}
                                      dangerouslySetInnerHTML={formatPrice(PRICE_BY_CATEGORY[category])}
                                    />
                                    <div
                                      style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        gap: '2px',
                                        marginTop: '2px',
                                        transform: 'translateX(10px)'
                                      }}
                                    >
                                      {[...Array(5)].map((_, si) => (
                                        <img
                                          key={si}
                                          src="/assets/NOIR/star-symbol.png"
                                          alt=""
                                          style={{
                                            width: '10px',
                                            height: '10px',
                                            filter: 'drop-shadow(0 0 0 1px black)'
                                          }}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSimilarProductsRightArrow}
                      style={marbleStripNavArrowStyle('right', false)}
                    >
                      <img src="/assets/NOIR/right-facing-arrow.svg" alt="" style={{ width: '14px', height: '14px' }} />
                    </button>
                  </div>
                </div>
              </div>

              {/* RECENTLY VIEWED — same strip as gift card */}
              <div className="px-0 md:px-0" style={{ marginTop: '20px', marginBottom: '20px' }}>
                <div
                  className="backdrop-blur-sm"
                  style={{
                    border: '1.3px solid black',
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    padding: '0px',
                    maxWidth: '100%',
                    margin: '0 auto'
                  }}
                >
                  <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                    <div
                      style={{
                        width: '1px',
                        height: '15px',
                        backgroundColor: 'black',
                        margin: '0 auto 8px auto'
                      }}
                    />
                    <h3
                      style={{
                        fontFamily: '"Futura PT Medium"',
                        fontSize: '12px',
                        color: '#EB1C24',
                        textTransform: 'uppercase',
                        margin: '0',
                        fontWeight: '500'
                      }}
                    >
                      RECENTLY VIEWED
                    </h3>
                  </div>

                  <div style={marbleStripNavRowStyle}>
                    <button
                      type="button"
                      onClick={handleRecentlyViewedLeftArrow}
                      style={marbleStripNavArrowStyle('left', false)}
                    >
                      <img src="/assets/NOIR/left-facing-arrow.svg" alt="" style={{ width: '14px', height: '14px' }} />
                    </button>

                    <div style={marbleStripNavMiddleColStyle}>
                      <div
                        style={{
                          position: 'absolute',
                          left: '50%',
                          top: '0',
                          bottom: '0',
                          width: '1px',
                          backgroundColor: 'black',
                          zIndex: 20,
                          transform: 'translateX(-50%)'
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          left: '50%',
                          top: '0',
                          bottom: '0',
                          width: '10px',
                          backgroundColor: 'transparent',
                          zIndex: 15,
                          transform: 'translateX(-50%)',
                          pointerEvents: 'none'
                        }}
                      />
                      <div ref={setRecentStripViewportRef} style={marbleStripViewportStyle}>
                        <div style={marbleStripScrollRowStyle(recentlyViewedScroll)}>
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => navigate('/wavy/soft-wave')}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                navigate('/wavy/soft-wave');
                              }
                            }}
                            style={marbleStripCellOuter}
                          >
                            <div
                              style={{
                                padding: '10px 10px 4px 10px',
                                textAlign: 'center',
                                width: '100%',
                                boxSizing: 'border-box'
                              }}
                            >
                            <img
                              src="/assets/NOIR/wave-thumb.png"
                              alt="SOFT WAVE"
                              style={{
                                width: '50%',
                                height: 'auto',
                                marginBottom: '10px',
                                marginLeft: 'auto',
                                marginRight: 'auto',
                                display: 'block',
                                cursor: 'pointer',
                                pointerEvents: 'none'
                              }}
                            />
                            <p
                              style={{
                                fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                                fontSize: '18px',
                                color: 'black',
                                textTransform: 'uppercase',
                                margin: '-10px 0 -3px 0',
                                fontWeight: '500',
                                transform: 'translateX(10px)'
                              }}
                            >
                              SOFT WAVE
                            </p>
                            <p
                              style={{
                                fontFamily: '"Futura PT Medium"',
                                fontSize: '10px',
                                color: '#EB1C24',
                                textTransform: 'uppercase',
                                margin: '0 0 5px 0',
                                fontWeight: '500',
                                lineHeight: '0.84',
                                transform: 'translateX(10px) translateY(1px)'
                              }}
                            >
                              24&quot; RAW INDONESIAN
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
                                transform: 'translateX(10px) translateY(-1px)'
                              }}
                              dangerouslySetInnerHTML={formatPrice(760)}
                            />
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '2px',
                                marginTop: '2px',
                                transform: 'translateX(10px)'
                              }}
                            >
                              {[...Array(5)].map((_, ri) => (
                                <img
                                  key={ri}
                                  src="/assets/NOIR/star-symbol.png"
                                  alt=""
                                  style={{ width: '10px', height: '10px', filter: 'drop-shadow(0 0 0 1px black)' }}
                                />
                              ))}
                            </div>
                          </div>
                          </div>

                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => navigate('/curly/soft-curl')}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                navigate('/curly/soft-curl');
                              }
                            }}
                            style={marbleStripCellOuter}
                          >
                            <div
                              style={{
                                padding: '10px 10px 4px 10px',
                                textAlign: 'center',
                                width: '100%',
                                boxSizing: 'border-box'
                              }}
                            >
                            <img
                              src="/assets/NOIR/curl-thumb.png"
                              alt="SOFT CURL"
                              style={{
                                width: '50%',
                                height: 'auto',
                                marginBottom: '10px',
                                marginLeft: 'auto',
                                marginRight: 'auto',
                                display: 'block',
                                cursor: 'pointer',
                                pointerEvents: 'none'
                              }}
                            />
                            <p
                              style={{
                                fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                                fontSize: '18px',
                                color: 'black',
                                textTransform: 'uppercase',
                                margin: '-10px 0 -3px 0',
                                fontWeight: '500',
                                transform: 'translateX(10px)'
                              }}
                            >
                              SOFT CURL
                            </p>
                            <p
                              style={{
                                fontFamily: '"Futura PT Medium"',
                                fontSize: '10px',
                                color: '#EB1C24',
                                textTransform: 'uppercase',
                                margin: '0 0 5px 0',
                                fontWeight: '500',
                                lineHeight: '0.84',
                                transform: 'translateX(10px) translateY(1px)'
                              }}
                            >
                              24&quot; RAW FILIPINO
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
                                transform: 'translateX(10px) translateY(-1px)'
                              }}
                              dangerouslySetInnerHTML={formatPrice(780)}
                            />
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '2px',
                                marginTop: '2px',
                                transform: 'translateX(10px)'
                              }}
                            >
                              {[...Array(5)].map((_, ri) => (
                                <img
                                  key={ri}
                                  src="/assets/NOIR/star-symbol.png"
                                  alt=""
                                  style={{ width: '10px', height: '10px', filter: 'drop-shadow(0 0 0 1px black)' }}
                                />
                              ))}
                            </div>
                          </div>
                          </div>

                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => navigate('/straight/noir')}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                navigate('/straight/noir');
                              }
                            }}
                            style={marbleStripCellOuter}
                          >
                            <div
                              style={{
                                padding: '10px 10px 4px 10px',
                                textAlign: 'center',
                                width: '100%',
                                boxSizing: 'border-box'
                              }}
                            >
                            <img
                              src="/assets/NOIR/noir-thumb.png"
                              alt="NOIR"
                              style={{
                                width: '50%',
                                height: 'auto',
                                marginBottom: '10px',
                                marginLeft: 'auto',
                                marginRight: 'auto',
                                display: 'block',
                                cursor: 'pointer',
                                pointerEvents: 'none'
                              }}
                            />
                            <p
                              style={{
                                fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                                fontSize: '19px',
                                color: 'black',
                                textTransform: 'uppercase',
                                margin: '-10px 0 -3px 0',
                                fontWeight: '500',
                                transform: 'translateX(10px)'
                              }}
                            >
                              NOIR
                            </p>
                            <p
                              style={{
                                fontFamily: '"Futura PT Medium"',
                                fontSize: '10px',
                                color: '#EB1C24',
                                textTransform: 'uppercase',
                                margin: '0 0 5px 0',
                                fontWeight: '500',
                                lineHeight: '0.84',
                                transform: 'translateX(10px) translateY(1px)'
                              }}
                            >
                              24&quot; RAW CAMBODIAN
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
                                transform: 'translateX(10px) translateY(-1px)'
                              }}
                              dangerouslySetInnerHTML={formatPrice(740)}
                            />
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '2px',
                                marginTop: '2px',
                                transform: 'translateX(10px)'
                              }}
                            >
                              {[...Array(5)].map((_, ri) => (
                                <img
                                  key={ri}
                                  src="/assets/NOIR/star-symbol.png"
                                  alt=""
                                  style={{ width: '10px', height: '10px', filter: 'drop-shadow(0 0 0 1px black)' }}
                                />
                              ))}
                            </div>
                          </div>
                          </div>

                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => navigate('/straight/blanco')}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                navigate('/straight/blanco');
                              }
                            }}
                            style={marbleStripCellOuter}
                          >
                            <div
                              style={{
                                padding: '10px 10px 4px 10px',
                                textAlign: 'center',
                                width: '100%',
                                boxSizing: 'border-box'
                              }}
                            >
                            <img
                              src="/assets/NOIR/blanco-thumb.png"
                              alt="BLANCO"
                              style={{
                                width: '50%',
                                height: 'auto',
                                marginBottom: '10px',
                                marginLeft: 'auto',
                                marginRight: 'auto',
                                display: 'block',
                                cursor: 'pointer',
                                pointerEvents: 'none'
                              }}
                            />
                            <p
                              style={{
                                fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                                fontSize: '18px',
                                color: 'black',
                                textTransform: 'uppercase',
                                margin: '-10px 0 -3px 0',
                                fontWeight: '500',
                                transform: 'translateX(10px)'
                              }}
                            >
                              BLANCO
                            </p>
                            <p
                              style={{
                                fontFamily: '"Futura PT Medium"',
                                fontSize: '10px',
                                color: '#EB1C24',
                                textTransform: 'uppercase',
                                margin: '0 0 5px 0',
                                fontWeight: '500',
                                lineHeight: '0.84',
                                transform: 'translateX(10px) translateY(1px)'
                              }}
                            >
                              24&quot; RAW RUSSIAN
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
                                transform: 'translateX(10px) translateY(-1px)'
                              }}
                              dangerouslySetInnerHTML={formatPrice(820)}
                            />
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '2px',
                                marginTop: '2px',
                                transform: 'translateX(10px)'
                              }}
                            >
                              {[...Array(5)].map((_, ri) => (
                                <img
                                  key={ri}
                                  src="/assets/NOIR/star-symbol.png"
                                  alt=""
                                  style={{ width: '10px', height: '10px', filter: 'drop-shadow(0 0 0 1px black)' }}
                                />
                              ))}
                            </div>
                          </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleRecentlyViewedRightArrow}
                      style={marbleStripNavArrowStyle('right', false)}
                    >
                      <img src="/assets/NOIR/right-facing-arrow.svg" alt="" style={{ width: '14px', height: '14px' }} />
                    </button>
                  </div>
                </div>
              </div>
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

      <ConfirmationModal
        isOpen={showBcfColorUpgradeModal}
        onClose={handleBcfColorUpgradeClose}
        onConfirm={handleBcfColorUpgradeConfirm}
        title="UPGRADE YOUR SUBSCRIPTION?"
        message="YOU MUST BE A PREMIUM MEMBER TO USE THIS FEATURE."
        confirmText="UPGRADE"
        cancelText="CANCEL"
        dataAttribute="upgrade-subscription-modal-bcf-color"
      />
    </div>
  );
}
