import { useEffect, useState, type CSSProperties } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DynamicCartIcon from '../../components/DynamicCartIcon';
import BrandMenuLinks from '../../components/BrandMenuLinks';
import { ShopMobileMenuShopTab } from '../../components/ShopMobileMenuShopTab';
import { ShopMobileMenuToolsTab } from '../../components/ShopMobileMenuToolsTab';
import { useShopNavSearchBar } from '../../components/shop/useShopNavSearchBar';
import { signInHrefWithReturnTo } from '../../utils/signInReturnTo';
import { shopTextureCategoryThumbSrc } from '../../utils/shopTextureCategoryThumb';
import { MarblePageShell } from '../../layouts/MarblePageShell';

type MobileMenuTab = 'SHOP' | 'TOOLS' | 'BRAND';

type SlayCamPost = {
  id: string;
  title: string;
  clientName: string;
  image: string;
  category: string;
  product: string;
  length: string;
  color: string;
  density: string;
  texture: string;
  saves: number;
  points: number;
  route: string;
  badge?: string;
  isVideo?: boolean;
  height?: number;
};

const SLAY_CAM_IMAGE_FRAME_BACKGROUND =
  'linear-gradient(135deg, rgba(255,255,255,0.98), rgba(247,247,247,0.9))';
const SLAY_CAM_IMAGE_PADDING_PX = 8;
const SLAY_CAM_IMAGE_PADDING = `${SLAY_CAM_IMAGE_PADDING_PX}px`;

const slayCamImageFrameStyle = (height: string | number, extraStyles: CSSProperties = {}): CSSProperties => ({
  position: 'relative',
  height,
  background: SLAY_CAM_IMAGE_FRAME_BACKGROUND,
  padding: SLAY_CAM_IMAGE_PADDING,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  ...extraStyles,
});

const slayCamProductImageStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'contain',
  display: 'block',
};

const SLAY_CAM_BCF_ASSETS = {
  wavyFrontal: shopTextureCategoryThumbSrc('wavy', 'frontals'),
  curlyClosure: shopTextureCategoryThumbSrc('curly', 'closures'),
};

const SLAY_CAM_CATEGORIES = [
  'ALL',
  'STRAIGHT',
  'WAVY',
  'CURLY',
  'BLONDE',
  'COLOR',
  'BEFORE & AFTER',
  'VIDEOS',
  'SLAY MVP',
];

const SLAY_CAM_POSTS: SlayCamPost[] = [
  {
    id: 'mvp-ocean-curl',
    title: 'FEATURED LOOK OF THE MONTH',
    clientName: 'MAYA R.',
    image: '/assets/ocean curl thumbnail.png',
    category: 'SLAY MVP',
    product: 'OCEAN CURL',
    length: '30"',
    color: 'CHESTNUT',
    density: '250%',
    texture: 'CURLY',
    saves: 482,
    points: 2500,
    route: '/curly/ocean-curl',
    badge: 'SLAY MVP',
    height: 310,
  },
  {
    id: 'trending-soft-wave',
    title: 'SOFT GLAM REVEAL',
    clientName: 'JANELLE K.',
    image: '/assets/NOIR/wave front.png',
    category: 'WAVY',
    product: 'SOFT WAVE',
    length: '26"',
    color: 'OFF BLACK',
    density: '200%',
    texture: 'WAVY',
    saves: 319,
    points: 500,
    route: '/wavy/soft-wave',
    isVideo: true,
    height: 246,
  },
  {
    id: 'blonde-blanco',
    title: 'BLONDE BOSS ENERGY',
    clientName: 'ARI S.',
    image: '/assets/NOIR/blanco front.png',
    category: 'BLONDE',
    product: 'BLANCO',
    length: '24"',
    color: 'BLONDE',
    density: '200%',
    texture: 'STRAIGHT',
    saves: 274,
    points: 1000,
    route: '/straight/blanco',
    badge: 'MOST SAVED',
    height: 270,
  },
  {
    id: 'beach-wave-color',
    title: 'VACATION SLAY',
    clientName: 'NIA T.',
    image: '/assets/beach wave thumbnail.png',
    category: 'COLOR',
    product: 'BEACH WAVE',
    length: '28"',
    color: 'CARAMEL RIBBON',
    density: '250%',
    texture: 'WAVY',
    saves: 238,
    points: 500,
    route: '/wavy/beach-wave',
    height: 225,
  },
  {
    id: 'soft-curl-video',
    title: 'CURL POP CHECK',
    clientName: 'LEAH M.',
    image: '/assets/soft curl thumbnail.png',
    category: 'VIDEOS',
    product: 'SOFT CURL',
    length: '22"',
    color: 'NATURAL BLACK',
    density: '200%',
    texture: 'CURLY',
    saves: 196,
    points: 750,
    route: '/curly/soft-curl',
    isVideo: true,
    height: 252,
  },
  {
    id: 'noir-straight',
    title: 'SLEEK INSTALL DIARY',
    clientName: 'KAY C.',
    image: '/assets/NOIR/noir front.png',
    category: 'STRAIGHT',
    product: 'NOIR',
    length: '30"',
    color: 'OFF BLACK',
    density: '250%',
    texture: 'STRAIGHT',
    saves: 421,
    points: 1000,
    route: '/straight/noir',
    badge: 'TRENDING',
    height: 295,
  },
  {
    id: 'before-after-frontal',
    title: 'BEFORE + AFTER MELT',
    clientName: 'TAYLOR B.',
    image: SLAY_CAM_BCF_ASSETS.wavyFrontal,
    category: 'BEFORE & AFTER',
    product: 'WAVY FRONTAL',
    length: '20"',
    color: 'OFF BLACK',
    density: '200%',
    texture: 'WAVY',
    saves: 187,
    points: 300,
    route: '/home/shop',
    height: 210,
  },
  {
    id: 'closure-curly',
    title: 'EVERYDAY CURL MOMENT',
    clientName: 'IMANI P.',
    image: SLAY_CAM_BCF_ASSETS.curlyClosure,
    category: 'CURLY',
    product: 'CURLY CLOSURE',
    length: '18"',
    color: 'NATURAL BLACK',
    density: '180%',
    texture: 'CURLY',
    saves: 143,
    points: 250,
    route: '/home/shop',
    height: 232,
  },
];

const SLAY_CAM_STATS = [
  { value: '128', label: 'FEATURED SLAYS' },
  { value: '42K', label: 'LOOK SAVES' },
  { value: '18', label: 'MVP WINNERS' },
];

const SUBMIT_REWARDS = [
  'LOYALTY POINTS',
  'SLAY CAM FEATURES',
  'MVP STATUS',
  'EXCLUSIVE REWARDS',
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
  const [selectedCategory, setSelectedCategory] = useState('ALL');
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

  const visiblePosts = selectedCategory === 'ALL'
    ? SLAY_CAM_POSTS
    : SLAY_CAM_POSTS.filter((post) => post.category === selectedCategory);
  const mvpPost = SLAY_CAM_POSTS[0];
  const shopThisSlayPosts = SLAY_CAM_POSTS.filter((post) =>
    ['mvp-ocean-curl', 'noir-straight', 'blonde-blanco'].includes(post.id)
  );
  const recentPosts = SLAY_CAM_POSTS.slice(4);

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
              <section
                className="border border-black bg-white/60 backdrop-blur-sm w-full"
                style={{ borderWidth: '1.3px', padding: '12px', backgroundColor: 'rgba(255, 255, 255, 0.6)' }}
              >
                <div
                  style={{
                    position: 'relative',
                    minHeight: '430px',
                    border: '1.3px solid #000',
                    overflow: 'hidden',
                    background: SLAY_CAM_IMAGE_FRAME_BACKGROUND,
                    display: 'flex',
                    alignItems: 'flex-end',
                  }}
                >
                  <img
                    src={mvpPost.image}
                    alt={mvpPost.title}
                    style={{
                      position: 'absolute',
                      top: SLAY_CAM_IMAGE_PADDING,
                      right: SLAY_CAM_IMAGE_PADDING,
                      bottom: SLAY_CAM_IMAGE_PADDING,
                      left: SLAY_CAM_IMAGE_PADDING,
                      width: `calc(100% - ${SLAY_CAM_IMAGE_PADDING_PX * 2}px)`,
                      height: `calc(100% - ${SLAY_CAM_IMAGE_PADDING_PX * 2}px)`,
                      objectFit: 'contain',
                      opacity: 0.92,
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.18) 40%, rgba(0,0,0,0.78) 100%)',
                    }}
                  />
                  <div style={{ position: 'relative', zIndex: 1, padding: '18px 14px', width: '100%' }}>
                    <p style={{ fontFamily: '"Futura PT Medium"', color: '#FFFFFF', fontSize: '10px', margin: '0 0 7px 0', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      OFFICIAL FRONTAL SLAYER SHOWCASE
                    </p>
                    <h1 style={{ fontFamily: '"Futura PT Medium"', color: '#FFFFFF', fontSize: '30px', margin: '0 0 5px 0', lineHeight: 0.94, textTransform: 'uppercase', fontWeight: 500 }}>
                      REAL CLIENTS. REAL SLAYS.
                    </h1>
                    <p style={{ fontFamily: '"Bohemy", cursive', color: '#FFFFFF', fontSize: '25px', margin: '0 0 12px 0', lineHeight: 1, textTransform: 'lowercase', fontWeight: 400 }}>
                      explore the luxury lookbook
                    </p>
                    <p style={{ fontFamily: '"Futura PT Book"', color: '#FFFFFF', fontSize: '10px', margin: '0 0 14px 0', lineHeight: 1.55, textTransform: 'uppercase' }}>
                      DISCOVER FEATURED TRANSFORMATIONS, VIDEO REVEALS, TRENDING LOOKS + COMMUNITY-POWERED SHOPPING INSPIRATION.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate(mvpPost.route)}
                      style={{
                        width: '100%',
                        height: '34px',
                        border: '1.3px solid #FFFFFF',
                        background: 'rgba(255,255,255,0.92)',
                        color: '#EB1C24',
                        fontFamily: '"Futura PT Medium"',
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                      }}
                    >
                      SHOP THE FEATURED SLAY
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginTop: '8px' }}>
                  {SLAY_CAM_STATS.map((stat) => (
                    <div key={stat.label} style={{ border: '1px solid #000', background: '#FFFFFF', padding: '8px 4px', textAlign: 'center' }}>
                      <p style={{ fontFamily: '"Covered By Your Grace", cursive', color: '#EB1C24', fontSize: '20px', margin: '0 0 1px 0', lineHeight: 1 }}>
                        {stat.value}
                      </p>
                      <p style={{ fontFamily: '"Futura PT Medium"', color: '#000000', fontSize: '8px', margin: 0, lineHeight: 1.2, textTransform: 'uppercase' }}>
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section
                className="border border-black bg-white/60 backdrop-blur-sm w-full"
                style={{ borderWidth: '1.3px', padding: '14px 12px', marginTop: '8px', backgroundColor: 'rgba(255, 255, 255, 0.6)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <p style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', margin: '0 0 3px 0', textTransform: 'uppercase', fontWeight: 500 }}>
                      SLAY MVP
                    </p>
                    <p style={{ fontFamily: '"Bohemy", cursive', color: '#000000', fontSize: '23px', margin: 0, lineHeight: 1, textTransform: 'lowercase', fontWeight: 400 }}>
                      featured look of the month
                    </p>
                  </div>
                  <div style={{ border: '1px solid #EB1C24', color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontSize: '8px', padding: '4px 6px', textTransform: 'uppercase', whiteSpace: 'nowrap', background: '#FFFFFF' }}>
                    {mvpPost.points.toLocaleString()} PTS EARNED
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '43% 1fr', gap: '10px', alignItems: 'stretch' }}>
                  <div style={{ border: '1.3px solid #000', minHeight: '190px', ...slayCamImageFrameStyle('100%') }}>
                    <img src={mvpPost.image} alt={mvpPost.clientName} style={slayCamProductImageStyle} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                    <div>
                      <p style={{ fontFamily: '"Futura PT Medium"', color: '#000000', fontSize: '12px', margin: '0 0 3px 0', textTransform: 'uppercase' }}>
                        {mvpPost.clientName}
                      </p>
                      <p style={{ fontFamily: '"Futura PT Book"', color: '#808080', fontSize: '9px', margin: '0 0 8px 0', textTransform: 'uppercase', lineHeight: 1.4 }}>
                        MOST SAVED CURL TRANSFORMATION THIS MONTH.
                      </p>
                      {[mvpPost.product, mvpPost.length, mvpPost.color, mvpPost.density].map((tag) => (
                        <div key={tag} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', marginBottom: '4px' }}>
                          <img src="/assets/rose-alert.svg" alt="" style={{ width: '10px', height: '10px', marginTop: '1px', flexShrink: 0 }} />
                          <p style={{ fontFamily: '"Futura PT Book"', color: '#000000', fontSize: '9px', margin: 0, lineHeight: 1.35, textTransform: 'uppercase' }}>
                            {tag}
                          </p>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(mvpPost.route)}
                      style={{ border: '1.3px solid #000', background: '#FFFFFF', color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontSize: '10px', height: '30px', textTransform: 'uppercase', cursor: 'pointer' }}
                    >
                      SHOP THIS SLAY
                    </button>
                  </div>
                </div>
              </section>

              <section
                className="border border-black bg-white/60 backdrop-blur-sm w-full"
                style={{ borderWidth: '1.3px', padding: '14px 0 12px 0', marginTop: '8px', backgroundColor: 'rgba(255, 255, 255, 0.6)' }}
              >
                <div style={{ padding: '0 12px' }}>
                  <p style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', margin: '0 0 4px 0', textTransform: 'uppercase', fontWeight: 500 }}>
                    EXPLORE SLAY CAM
                  </p>
                  <p style={{ fontFamily: '"Bohemy", cursive', color: '#000000', fontSize: '23px', margin: '0 0 10px 0', lineHeight: 1, textTransform: 'lowercase', fontWeight: 400 }}>
                    shop the community lookbook
                  </p>
                </div>
                <div style={{ overflowX: 'auto', display: 'flex', gap: '7px', padding: '0 12px 12px 12px', WebkitOverflowScrolling: 'touch' }}>
                  {SLAY_CAM_CATEGORIES.map((category) => {
                    const active = selectedCategory === category;
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setSelectedCategory(category)}
                        style={{
                          flex: '0 0 auto',
                          height: '28px',
                          border: active ? '1.3px solid #EB1C24' : '1.3px solid #000',
                          background: '#FFFFFF',
                          color: active ? '#EB1C24' : '#000000',
                          fontFamily: active ? '"Futura PT Medium"' : '"Futura PT Book"',
                          fontSize: '9px',
                          padding: '0 9px',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                        }}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px', padding: '0 12px' }}>
                  {visiblePosts.map((post) => (
                    <article key={post.id} style={{ border: '1.3px solid #000', background: '#FFFFFF', overflow: 'hidden', minWidth: 0 }}>
                      <div style={slayCamImageFrameStyle(`${post.height ?? 240}px`)}>
                        <img src={post.image} alt={post.title} style={slayCamProductImageStyle} />
                        {(post.badge || post.isVideo) && (
                          <div style={{ position: 'absolute', top: '7px', left: '7px', background: post.badge === 'SLAY MVP' ? '#EB1C24' : '#FFFFFF', color: post.badge === 'SLAY MVP' ? '#FFFFFF' : '#EB1C24', border: '1px solid #EB1C24', fontFamily: '"Futura PT Medium"', fontSize: '8px', padding: '3px 5px', textTransform: 'uppercase' }}>
                            {post.isVideo ? 'VIDEO' : post.badge}
                          </div>
                        )}
                        <div style={{ position: 'absolute', right: '7px', bottom: '7px', background: 'rgba(255,255,255,0.92)', border: '1px solid #000', padding: '3px 5px', fontFamily: '"Futura PT Medium"', fontSize: '8px', color: '#000000', textTransform: 'uppercase' }}>
                          {post.saves} SAVES
                        </div>
                      </div>
                      <div style={{ padding: '8px' }}>
                        <p style={{ fontFamily: '"Futura PT Medium"', color: '#000000', fontSize: '10px', margin: '0 0 2px 0', textTransform: 'uppercase', lineHeight: 1.25 }}>
                          {post.title}
                        </p>
                        <p style={{ fontFamily: '"Futura PT Book"', color: '#808080', fontSize: '8px', margin: '0 0 7px 0', textTransform: 'uppercase' }}>
                          BY {post.clientName}
                        </p>
                        {[post.product, post.length, post.color, post.density].map((tag) => (
                          <div key={`${post.id}-${tag}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '5px', marginBottom: '3px' }}>
                            <img src="/assets/rose-alert.svg" alt="" style={{ width: '9px', height: '9px', marginTop: '1px', flexShrink: 0 }} />
                            <p style={{ fontFamily: '"Futura PT Book"', color: '#000000', fontSize: '8px', margin: 0, lineHeight: 1.35, textTransform: 'uppercase' }}>
                              {tag}
                            </p>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => navigate(post.route)}
                          style={{ marginTop: '6px', width: '100%', height: '27px', border: '1px solid #000', background: '#FFFFFF', color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontSize: '9px', textTransform: 'uppercase', cursor: 'pointer' }}
                        >
                          SHOP THIS SLAY
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section
                className="border border-black bg-white/60 backdrop-blur-sm w-full"
                style={{ borderWidth: '1.3px', padding: '14px 12px', marginTop: '8px', backgroundColor: 'rgba(255, 255, 255, 0.6)' }}
              >
                <p style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', margin: '0 0 4px 0', textTransform: 'uppercase', fontWeight: 500 }}>
                  SHOP THIS SLAY
                </p>
                <p style={{ fontFamily: '"Bohemy", cursive', color: '#000000', fontSize: '23px', margin: '0 0 10px 0', lineHeight: 1, textTransform: 'lowercase', fontWeight: 400 }}>
                  most purchased community looks
                </p>
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px', WebkitOverflowScrolling: 'touch' }}>
                  {shopThisSlayPosts.map((post) => (
                    <button
                      key={`shop-${post.id}`}
                      type="button"
                      onClick={() => navigate(post.route)}
                      style={{ flex: '0 0 158px', border: '1.3px solid #000', background: '#FFFFFF', padding: 0, textAlign: 'left', cursor: 'pointer', overflow: 'hidden' }}
                    >
                      <div style={slayCamImageFrameStyle('156px')}>
                        <img src={post.image} alt={post.product} style={slayCamProductImageStyle} />
                      </div>
                      <div style={{ padding: '8px' }}>
                        <p style={{ fontFamily: '"Futura PT Medium"', color: '#000000', fontSize: '10px', margin: '0 0 3px 0', textTransform: 'uppercase' }}>
                          {post.product}
                        </p>
                        <p style={{ fontFamily: '"Futura PT Book"', color: '#808080', fontSize: '8px', margin: '0 0 7px 0', lineHeight: 1.35, textTransform: 'uppercase' }}>
                          {post.length} / {post.color} / {post.density}
                        </p>
                        <p style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '9px', margin: 0, textTransform: 'uppercase' }}>
                          SHOP THIS SLAY
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              <section
                className="border border-black bg-white/60 backdrop-blur-sm w-full"
                style={{ borderWidth: '1.3px', padding: '14px 12px', marginTop: '8px', backgroundColor: 'rgba(255, 255, 255, 0.6)' }}
              >
                <p style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', margin: '0 0 4px 0', textTransform: 'uppercase', fontWeight: 500 }}>
                  RECENTLY FEATURED
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {recentPosts.map((post) => (
                    <button
                      key={`recent-${post.id}`}
                      type="button"
                      onClick={() => navigate(post.route)}
                      style={{ display: 'grid', gridTemplateColumns: '76px 1fr auto', gap: '9px', alignItems: 'center', border: '1.3px solid #000', background: '#FFFFFF', padding: '6px', textAlign: 'left', cursor: 'pointer' }}
                    >
                      <div style={slayCamImageFrameStyle('76px', { width: '76px', flexShrink: 0 })}>
                        <img src={post.image} alt={post.title} style={slayCamProductImageStyle} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontFamily: '"Futura PT Medium"', color: '#000000', fontSize: '10px', margin: '0 0 3px 0', textTransform: 'uppercase', lineHeight: 1.25 }}>
                          {post.title}
                        </p>
                        <p style={{ fontFamily: '"Futura PT Book"', color: '#808080', fontSize: '8px', margin: 0, textTransform: 'uppercase', lineHeight: 1.35 }}>
                          {post.clientName} / {post.product} / {post.category}
                        </p>
                      </div>
                      <p style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '9px', margin: 0, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                        VIEW
                      </p>
                    </button>
                  ))}
                </div>
              </section>

              <section
                className="border border-black bg-white/60 backdrop-blur-sm w-full"
                style={{ borderWidth: '1.3px', padding: '16px 12px', marginTop: '8px', backgroundColor: 'rgba(255, 255, 255, 0.6)' }}
              >
                <p style={{ fontFamily: '"Bohemy", cursive', color: '#000000', fontSize: '26px', margin: '0 0 7px 0', lineHeight: 1, textTransform: 'lowercase', fontWeight: 400 }}>
                  submit your look
                </p>
                <p style={{ fontFamily: '"Futura PT Book"', color: '#000000', fontSize: '10px', margin: '0 0 11px 0', lineHeight: 1.5, textTransform: 'uppercase' }}>
                  SHARE YOUR FRONTAL SLAYER PHOTO OR VIDEO FOR A CHANCE TO EARN REWARDS, FEATURES + SLAY MVP STATUS.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '6px', marginBottom: '12px' }}>
                  {SUBMIT_REWARDS.map((reward) => (
                    <div key={reward} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', border: '1px solid #000', background: '#FFFFFF', padding: '7px 6px' }}>
                      <img src="/assets/rose-alert.svg" alt="" style={{ width: '10px', height: '10px', marginTop: '1px', flexShrink: 0 }} />
                      <p style={{ fontFamily: '"Futura PT Book"', color: '#000000', fontSize: '8px', margin: 0, lineHeight: 1.35, textTransform: 'uppercase' }}>
                        {reward}
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
                  {isSignedIn ? 'PREP YOUR SLAY CAM SUBMISSION' : 'SIGN IN TO SUBMIT YOUR LOOK'}
                </button>
              </section>
            </div>
          )}
        </div>
      </div>
    </MarblePageShell>
  );
}
