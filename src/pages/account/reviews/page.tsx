import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DynamicCartIcon from '../../../components/DynamicCartIcon';
import BrandMenuLinks from '../../../components/BrandMenuLinks';
import SocialMenuIcons from '../../../components/SocialMenuIcons';
import { clearNewReviewApproved, getUserSubmittedReviewsKey, getMockShopReviewCount, getMockToolReviewCount, setLastSeenShopCount, setLastSeenToolCount } from '../../../constants/reviews';

interface Review {
  id: string;
  date: string;
  productName: string;
  subtitle: string;
  body: string;
  rating: number;
  reviewCount: number;
  thumbnail: string;
}

// Mock shop reviews (wig units)
const mockShopReviews: Review[] = [
  {
    id: '2',
    date: '04-26-2023',
    productName: 'SOFT WAVE',
    subtitle: 'VERY VERSATILE',
    body: 'I AM IN LOVE WITH THIS UNIT! VERSATILE & MAKES IT EASY TO SWITCH UP MY STYLE.',
    rating: 5,
    reviewCount: 33,
    thumbnail: '/assets/2D WAVY FRONT.png'
  },
  {
    id: '3',
    date: '04-25-2023',
    productName: 'BLANCO',
    subtitle: 'EXACTLY AS DESCRIBED',
    body: 'BEAUTIFUL HAIR AND ARRIVED ON TIME. WILL ORDER AGAIN.',
    rating: 3,
    reviewCount: 28,
    thumbnail: '/assets/2D BLANCO FRONT.png'
  },
  {
    id: '4',
    date: '04-24-2023',
    productName: 'BEACH WAVE',
    subtitle: 'LOVE THE TEXTURE',
    body: 'PERFECT FOR SUMMER. EASY TO STYLE AND HOLDS UP WELL.',
    rating: 4,
    reviewCount: 22,
    thumbnail: '/assets/2D WAVY FRONT.png'
  },
  {
    id: '5',
    date: '02-10-2024',
    productName: 'NOIR',
    subtitle: 'GOOD BUT NOT PERFECT',
    body: 'NICE UNIT OVERALL. QUALITY IS FINE, SHIPPING WAS SLOW. WOULD CONSIDER ORDERING AGAIN.',
    rating: 3,
    reviewCount: 18,
    thumbnail: '/assets/natural front.png'
  },
  {
    id: '6',
    date: '02-12-2024',
    productName: 'SOFT WAVE',
    subtitle: 'VERY PLEASED',
    body: 'GREAT WAVE PATTERN AND EASY TO MAINTAIN. MINOR FRIZZ AFTER A FEW WEEKS BUT STILL RECOMMEND.',
    rating: 4,
    reviewCount: 14,
    thumbnail: '/assets/2D WAVY FRONT.png'
  },
  {
    id: '7',
    date: '02-13-2025',
    productName: 'BLANCO',
    subtitle: 'NEW REVIEW FOR ALERTS TEST',
    body: 'ADDED SO YOU CAN VERIFY THE REVIEWS CARD ALERT CLEARS WHEN YOU VISIT THE REVIEWS PAGE.',
    rating: 5,
    reviewCount: 7,
    thumbnail: '/assets/2D BLANCO FRONT.png'
  },
  {
    id: '8',
    date: '02-13-2025',
    productName: 'NOIR',
    subtitle: 'LATEST REVIEW FOR ALERTS CHECK',
    body: 'SECOND NEW REVIEW SO YOU CAN CATCH THE REVIEWS CARD ALERT WHEN YOU NAVIGATE TO ACCOUNT THEN OPEN REVIEWS.',
    rating: 4,
    reviewCount: 9,
    thumbnail: '/assets/natural front.png'
  },
  {
    id: '9',
    date: '02-14-2025',
    productName: 'BEACH WAVE',
    subtitle: 'NINTH MOCK FOR ALERT + COUNT',
    body: 'ADDED SO MOCK COUNT BECOMES 11; ACCOUNT PAGE SHOWS ALERT UNTIL YOU VISIT REVIEWS, THEN CARD COUNT UPDATES TO 11.',
    rating: 5,
    reviewCount: 11,
    thumbnail: '/assets/2D WAVY FRONT.png'
  }
];

// Mock tool reviews (e.g. satin bonnet, foam, etc.)
const mockToolReviews: Review[] = [
  {
    id: 't1',
    date: '04-20-2023',
    productName: 'SATIN BONNET',
    subtitle: 'GAME CHANGER',
    body: 'KEEPS MY WIG IN PLACE OVERNIGHT. GREAT QUALITY.',
    rating: 5,
    reviewCount: 12,
    thumbnail: '/assets/natural front.png'
  },
  {
    id: 't2',
    date: '04-18-2023',
    productName: 'TRAVEL FOAM',
    subtitle: 'CONVENIENT',
    body: 'PERFECT SIZE FOR TRAVEL. DOES THE JOB.',
    rating: 4,
    reviewCount: 8,
    thumbnail: '/assets/natural front.png'
  },
  {
    id: 't3',
    date: '02-14-2025',
    productName: 'WIG STAND',
    subtitle: 'NEW TOOL REVIEW FOR ALERT TEST',
    body: 'ADDED SO MOCK COUNT GOES TO 12; ACCOUNT REVIEWS CARD SHOULD SHOW ALERT UNTIL YOU VISIT THE REVIEWS PAGE.',
    rating: 5,
    reviewCount: 5,
    thumbnail: '/assets/natural front.png'
  }
];

const REVIEWS_INITIAL = 3; // max products shown on scroll; "load more" shows all, "show less" reverts to 3

/** Product thumbnails matching affiliate/orders (2D mannequin / unit images). Tools use generic product fallback; profile photo is only used on alerts page. */
function getProductThumbnail(productName: string): string {
  switch (productName.toUpperCase()) {
    case 'BLANCO':
      return '/assets/2D BLANCO FRONT.png';
    case 'SOFT WAVE':
    case 'BEACH WAVE':
      return '/assets/2D WAVY FRONT.png';
    case 'SOFT CURL':
    case 'OCEAN CURL':
      return '/assets/2D CURLY FRONT.png';
    case 'NOIR':
      return '/assets/natural front.png';
    default:
      return '/assets/natural front.png';
  }
}

/** Route to unit page for shop products; tools/default go to straight/noir. */
function getProductRoute(productName: string): string {
  switch (productName.toUpperCase()) {
    case 'NOIR':
      return '/straight/noir';
    case 'BLANCO':
      return '/straight/blanco';
    case 'SOFT WAVE':
      return '/wavy/soft-wave';
    case 'BEACH WAVE':
      return '/wavy/beach-wave';
    case 'SOFT CURL':
      return '/curly/soft-curl';
    case 'OCEAN CURL':
      return '/curly/ocean-curl';
    default:
      return '/straight/noir';
  }
}

/** Product-page style: all 5 stars; filled = red with black stroke (filled-star), unfilled = white with black stroke (star-symbol). Reviews require at least 1 star, so treat 0/missing as 1. */
function StarRating({ rating }: { rating: number }) {
  const starSizePx = 9.11;
  const strokeFilter = 'drop-shadow(0 0 0 1px black)';
  const effectiveRating = Math.min(5, Math.max(1, Number(rating) || 1));
  return (
    <div style={{ display: 'flex', gap: '2px', marginTop: '8px', marginBottom: '4px', justifyContent: 'center' }}>
      {[0, 1, 2, 3, 4].map((index) => {
        const filled = index < effectiveRating;
        return (
          <img
            key={index}
            src={filled ? '/assets/NOIR/filled-star.png' : '/assets/NOIR/star-symbol.png'}
            alt=""
            style={{
              width: `${starSizePx}px`,
              height: `${starSizePx}px`,
              filter: strokeFilter
            }}
          />
        );
      })}
    </div>
  );
}

function ReviewsPage() {
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
  const [activeTab, setActiveTab] = useState<'SHOP' | 'TOOLS'>('SHOP');
  const [shopVisibleCount, setShopVisibleCount] = useState(REVIEWS_INITIAL);
  const [toolVisibleCount, setToolVisibleCount] = useState(REVIEWS_INITIAL);
  const [userSubmittedReviews, setUserSubmittedReviews] = useState<Review[]>([]);

  useEffect(() => {
    const handleCartCountUpdate = (event: CustomEvent) => {
      setCartCount(event.detail);
    };
    const handleStorageChange = () => {
      try {
        setCartCount(parseInt(localStorage.getItem('cartCount') || '0', 10));
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

  // Load user-submitted reviews (synced with account page count). Clear only the user-submitted alert on visit.
  useEffect(() => {
    const load = () => {
      try {
        const currentUser = localStorage.getItem('currentUser');
        const user = currentUser ? JSON.parse(currentUser) : null;
        if (!user?.email) {
          setUserSubmittedReviews([]);
          return;
        }
        const raw = localStorage.getItem(getUserSubmittedReviewsKey(user.email));
        const list = raw ? JSON.parse(raw) : [];
        setUserSubmittedReviews(Array.isArray(list) ? list : []);
        clearNewReviewApproved(user.email);
        window.dispatchEvent(new CustomEvent('accountCardAlertsViewed'));
      } catch (_) {
        setUserSubmittedReviews([]);
      }
    };
    load();
    window.addEventListener('storage', load);
    window.addEventListener('reviewsUpdated', load);
    return () => {
      window.removeEventListener('storage', load);
      window.removeEventListener('reviewsUpdated', load);
    };
  }, []);

  // Clear shop/tool alert only when that tab is viewed.
  useEffect(() => {
    try {
      const currentUser = localStorage.getItem('currentUser');
      const user = currentUser ? JSON.parse(currentUser) : null;
      if (!user?.email) return;
      if (activeTab === 'SHOP') {
        setLastSeenShopCount(user.email, getMockShopReviewCount());
      } else if (activeTab === 'TOOLS') {
        setLastSeenToolCount(user.email, getMockToolReviewCount());
      }
      window.dispatchEvent(new CustomEvent('accountCardAlertsViewed'));
    } catch (_) {
      // ignore
    }
  }, [activeTab]);

  const handleMobileMenuToggle = () => setShowMobileMenu(!showMobileMenu);
  const handleMobileMenuTabClick = (tab: string) => setMobileMenuActiveTab(tab);
  const handleMobileMenuItemToggle = (item: string) => {
    setMobileMenuExpandedItems(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };
  const handleMobileMenuSignInToggle = () => {
    navigate(isSignedIn ? '/sign-in' : '/sign-in');
    if (isSignedIn) {
      localStorage.setItem('isSignedIn', 'false');
      localStorage.removeItem('currentUser');
      window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'false' }));
      setShowMobileMenu(false);
    }
  };

  const handleBack = () => navigate('/account');
  const shopReviewsList = [...userSubmittedReviews, ...mockShopReviews];
  const toolReviewsList = mockToolReviews;
  const totalShop = shopReviewsList.length;
  const handleLoadMoreShop = () => setShopVisibleCount(totalShop);
  const handleLoadMoreTool = () => setToolVisibleCount(toolReviewsList.length);
  const handleShowLessShop = () => setShopVisibleCount(REVIEWS_INITIAL);
  const handleShowLessTool = () => setToolVisibleCount(REVIEWS_INITIAL);

  const displayedShopReviews = shopReviewsList.slice(0, shopVisibleCount);
  const displayedToolReviews = toolReviewsList.slice(0, toolVisibleCount);
  const hasMoreShop = shopVisibleCount < totalShop;
  const hasMoreTool = toolVisibleCount < toolReviewsList.length;
  const totalTool = toolReviewsList.length;
  // Only show "SHOW LESS" when there are more than 3 products (so collapsing makes sense). For ≤3, all fit in viewport.
  const showShowLessShop = totalShop > REVIEWS_INITIAL && !hasMoreShop;
  const showShowLessTool = totalTool > REVIEWS_INITIAL && !hasMoreTool;

  const BRAND_GRAY = '#808080';

  const renderReviewRow = (review: Review) => (
    <div
      key={review.id}
      className="flex items-start gap-3"
      style={{ marginBottom: '24px' }}
    >
      <div
        className="flex-shrink-0"
        style={{
          width: '102px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: '-6px'
        }}
      >
        <button
          type="button"
          onClick={() => navigate(getProductRoute(review.productName))}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer'
          }}
        >
          <img
            src={getProductThumbnail(review.productName)}
            alt={review.productName}
            style={{
              width: '102px',
              height: '102px',
              objectFit: 'contain'
            }}
            onError={(e) => {
              e.currentTarget.src = '/assets/natural front.png';
            }}
          />
        </button>
        <StarRating rating={review.rating} />
        <p
          style={{
            fontFamily: '"Futura PT Book"',
            fontSize: '9px',
            color: '#000000',
            margin: '2px 0 0 0',
            textTransform: 'uppercase',
            textAlign: 'center'
          }}
        >
          {review.reviewCount} {review.reviewCount === 1 ? 'REVIEW' : 'REVIEWS'}
        </p>
      </div>
      <div className="flex-1 min-w-0" style={{ paddingTop: '2px' }}>
        <p
          style={{
            fontFamily: '"Futura PT Medium"',
            fontSize: '10px',
            color: '#000000',
            margin: '0 0 4px 0'
          }}
        >
          {review.date}
        </p>
        <p
          style={{
            fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
            fontSize: review.productName.toUpperCase() === 'NOIR' ? '17px' : '16px',
            color: BRAND_GRAY,
            margin: '0 0 4px 0',
            lineHeight: '1.2'
          }}
        >
          {review.productName}
        </p>
        <p
          style={{
            fontFamily: '"Futura PT Medium"',
            fontSize: '10px',
            color: '#EB1C24',
            margin: '0 0 3px 0',
            textTransform: 'uppercase',
            fontWeight: '500'
          }}
        >
          {review.subtitle}
        </p>
        <p
          style={{
            fontFamily: '"Futura PT Book"',
            fontSize: '10px',
            color: '#000000',
            margin: 0,
            lineHeight: '1.4'
          }}
        >
          {review.body}
        </p>
      </div>
    </div>
  );

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
          {/* HEADER */}
          <div
            className="border-solid border-black flex justify-center items-center py-3 w-full mb-5 px-5 bg-white/60 backdrop-blur-sm relative"
            style={{ border: '1.3px solid black' }}
          >
            <div className="flex gap-5 absolute left-4">
              {showMobileMenu ? (
                <>
                  <button
                    onClick={() => navigate(isSignedIn ? '/account' : '/sign-in')}
                    className="cursor-pointer"
                    style={{ height: '15px !important', width: '21px !important', padding: '0 !important', border: 'none !important', background: 'none !important', transform: 'translateX(4px)' }}
                  >
                    <img alt="Account" width="16" height="16" src="/assets/NOIR/account-icon.svg" />
                  </button>
                  <button
                    onClick={() => navigate(isSignedIn ? '/wishlist' : '/sign-in')}
                    className="cursor-pointer"
                    style={{ height: '21px !important', width: '21px !important', padding: '0 !important', border: 'none !important', background: 'none !important', transform: 'translateX(2px)' }}
                  >
                    <img alt="Wishlist" width="18" height="18" src="/assets/wishlist-heart.svg" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleBack}
                    className="cursor-pointer"
                    style={{ height: '15px !important', width: '21px !important', padding: '0 !important', border: 'none !important', background: 'none !important' }}
                  >
                    <img alt="Back" width="21" height="15" src="/assets/back-button.svg" />
                  </button>
                </>
              )}
            </div>
            <p className="text-sm" style={{ fontFamily: '"Futura PT Book"', transform: 'translateY(1px)' }}>
              {showMobileMenu ? (
                <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}>MENU</span>
              ) : (
                <>
                  <span style={{ fontFamily: '"Futura PT Book"', fontWeight: '400', cursor: 'pointer' }} onClick={() => navigate('/account')}>ACCOUNT &gt;</span>{' '}
                  <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}>REVIEWS</span>
                </>
              )}
            </p>
            <div className="gap-5 flex absolute" style={{ right: '17px' }}>
              <div style={{ transform: `translateX(${cartCount === 0 ? 7 : 5}px)` }}>
                <DynamicCartIcon count={cartCount} width={22} height={19} />
              </div>
              <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="17" height="18" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="cursor-pointer" onClick={handleMobileMenuToggle} style={{ marginTop: '2px' }}>
                  <path d="M0 0H15.75V0.7H7.875H0V0ZM5.25 6.7H10.5H15.375V7.4H10.5H5.25V6.7ZM0 13.1H15.75V13.8H0V13.1Z" fill="black" />
                </svg>
              </div>
            </div>
          </div>

          {/* MAIN CONTENT */}
          {showMobileMenu ? (
            <div
              className="border border-black flex flex-col pt-6 pb-4 px-5 bg-white/60 backdrop-blur-sm w-full"
              style={{ borderWidth: '1.3px', minWidth: '100%', maxWidth: 'none', overflow: 'visible', backgroundColor: 'rgba(255, 255, 255, 0.6)', minHeight: '560px' }}
            >
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', paddingTop: '20px', height: '490px', position: 'relative' }}>
                <div className="flex justify-center gap-8" style={{ marginBottom: '30px' }}>
                  {['SHOP', 'TOOLS', 'BRAND'].map((tab) => (
                    <button
                      key={tab}
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
                      <div className="flex items-center justify-between cursor-pointer" onClick={() => navigate('/tools/gift-card')}>
                        <span style={{ fontFamily: '"Futura PT Book"', fontSize: '14px', color: 'black', fontWeight: '500', textTransform: 'uppercase', transform: 'translateX(7px)' }}>GIFT CARD</span>
                      </div>
                    ) : mobileMenuActiveTab === 'BRAND' ? (
                      <BrandMenuLinks onClose={() => setShowMobileMenu(false)} />
                    ) : (
                      [
                        { label: 'UNITS', hasArrow: true, isExpandable: true, subItems: ['STRAIGHT', 'WAVY', 'CURLY'] },
                        { label: 'BOOKING', hasArrow: true, isExpandable: true, subItems: ['APPOINTMENT', 'CONSULTATION'] },
                        { label: 'BUILD-A-WIG', hasArrow: false },
                        { label: 'ORDER AUTHORIZATION FORM', hasArrow: false }
                      ].map((item, index) => (
                        <div key={index}>
                          <div className="flex items-center justify-between" style={{ alignItems: 'center' }}>
                            <span
                              style={{ fontFamily: '"Futura PT Book"', fontSize: '14px', color: 'black', fontWeight: '500', textTransform: 'uppercase', cursor: 'pointer', transform: 'translateX(7px)' }}
                              onClick={() => {
                                if (item.isExpandable) {
                                  if (item.label === 'UNITS' && mobileMenuExpandedItems.includes(item.label)) navigate('/shop/units');
                                  else handleMobileMenuItemToggle(item.label);
                                } else if (item.label === 'BUILD-A-WIG') navigate('/build-a-wig');
                                else if (item.label === 'ORDER AUTHORIZATION FORM') navigate('/shop/order-form');
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
                                  if (item.isExpandable) handleMobileMenuItemToggle(item.label);
                                }}
                              />
                            )}
                          </div>
                          {item.isExpandable && mobileMenuExpandedItems.includes(item.label) && item.subItems && (
                            <div style={{ marginLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {item.subItems.map((subItem, subIndex) => (
                                <span
                                  key={subIndex}
                                  style={{ fontFamily: '"Futura PT Book"', fontSize: '14px', color: '#EB1C24', fontWeight: '500', textTransform: 'uppercase', cursor: 'pointer' }}
                                  onClick={() => {
                                    if (item.label === 'UNITS') {
                                      if (subItem === 'STRAIGHT') navigate('/units/straight');
                                      else if (subItem === 'WAVY') navigate('/units/wavy');
                                      else if (subItem === 'CURLY') navigate('/units/curly');
                                    }
                                  }}
                                >
                                  {subItem}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="flex justify-center" style={{ marginBottom: '20px', marginTop: 'auto' }}>
                  <span onClick={handleMobileMenuSignInToggle} style={{ fontFamily: '"Futura PT Medium"', fontSize: '14px', color: '#EB1C24', fontWeight: '500', textTransform: 'uppercase', cursor: 'pointer' }}>
                    {isSignedIn ? 'SIGN OUT' : 'SIGN IN'}
                  </span>
                </div>
                <SocialMenuIcons />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 mb-5">
              <div className="bg-white/60 backdrop-blur-sm border border-black p-4 flex flex-col overflow-hidden" style={{ borderWidth: '1.3px', minHeight: '560px' }}>
                {/* Tabs: SHOP REVIEWS | TOOL REVIEWS */}
                <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab('SHOP')}
                    className={activeTab === 'SHOP' ? 'opacity-100' : 'opacity-50'}
                    style={{
                      fontFamily: '"Futura PT Medium"',
                      color: activeTab === 'SHOP' ? '#EB1C24' : '#808080',
                      fontSize: '12px',
                      fontWeight: '500',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      transform: 'translateX(2px)',
                      textTransform: 'uppercase'
                    }}
                  >
                    SHOP REVIEWS
                  </button>
                  <button
                    onClick={() => setActiveTab('TOOLS')}
                    className={activeTab === 'TOOLS' ? 'opacity-100' : 'opacity-50'}
                    style={{
                      fontFamily: '"Futura PT Medium"',
                      color: activeTab === 'TOOLS' ? '#EB1C24' : '#808080',
                      fontSize: '12px',
                      fontWeight: '500',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      transform: 'translateX(-2px)',
                      textTransform: 'uppercase'
                    }}
                  >
                    TOOL REVIEWS
                  </button>
                </div>

                {/* Review list - scrollable; LOAD MORE + count live below */}
                <div className="flex-1 flex flex-col overflow-y-auto mt-4 min-h-0" style={{ maxHeight: 'calc(566px - 120px)', scrollBehavior: 'smooth', width: '100%' }}>
                  {activeTab === 'SHOP' && (
                    <>
                      {displayedShopReviews.length === 0 ? (
                        <div className="flex flex-col justify-center items-center my-8">
                          <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '12px', color: '#808080', margin: 0, textTransform: 'uppercase', fontWeight: '500' }}>
                            NO SHOP REVIEWS
                          </p>
                        </div>
                      ) : (
                        displayedShopReviews.map(renderReviewRow)
                      )}
                    </>
                  )}
                  {activeTab === 'TOOLS' && (
                    <>
                      {displayedToolReviews.length === 0 ? (
                        <div className="flex flex-col justify-center items-center my-8">
                          <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '12px', color: '#808080', margin: 0, textTransform: 'uppercase', fontWeight: '500' }}>
                            NO TOOL REVIEWS
                          </p>
                        </div>
                      ) : (
                        displayedToolReviews.map(renderReviewRow)
                      )}
                    </>
                  )}
                </div>

                {/* Below scroll - always visible */}
                {activeTab === 'SHOP' && displayedShopReviews.length > 0 && (
                  <div style={{ marginTop: '14px', marginBottom: '-4px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ minHeight: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {hasMoreShop ? (
                        <button
                          onClick={handleLoadMoreShop}
                          style={{
                            fontFamily: '"Futura PT Medium"',
                            fontSize: '11px',
                            color: '#EB1C24',
                            fontWeight: '500',
                            textTransform: 'uppercase',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          LOAD MORE
                        </button>
                      ) : showShowLessShop ? (
                        <button
                          onClick={handleShowLessShop}
                          style={{
                            fontFamily: '"Futura PT Medium"',
                            fontSize: '11px',
                            color: '#EB1C24',
                            fontWeight: '500',
                            textTransform: 'uppercase',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          SHOW LESS
                        </button>
                      ) : null}
                    </div>
                    <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#808080', margin: '4px 0 -3px 0', textAlign: 'center' }}>
                      {displayedShopReviews.length} OF {totalShop} {totalShop === 1 ? 'REVIEW' : 'REVIEWS'}
                    </p>
                  </div>
                )}
                {activeTab === 'TOOLS' && displayedToolReviews.length > 0 && (
                  <div style={{ marginTop: '14px', marginBottom: '-4px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ minHeight: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {hasMoreTool ? (
                        <button
                          onClick={handleLoadMoreTool}
                          style={{
                            fontFamily: '"Futura PT Medium"',
                            fontSize: '11px',
                            color: '#EB1C24',
                            fontWeight: '500',
                            textTransform: 'uppercase',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          LOAD MORE
                        </button>
                      ) : showShowLessTool ? (
                        <button
                          onClick={handleShowLessTool}
                          style={{
                            fontFamily: '"Futura PT Medium"',
                            fontSize: '11px',
                            color: '#EB1C24',
                            fontWeight: '500',
                            textTransform: 'uppercase',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          SHOW LESS
                        </button>
                      ) : null}
                    </div>
                    <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#808080', margin: '4px 0 -3px 0', textAlign: 'center' }}>
                      {displayedToolReviews.length} OF {totalTool} {totalTool === 1 ? 'REVIEW' : 'REVIEWS'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReviewsPage;
