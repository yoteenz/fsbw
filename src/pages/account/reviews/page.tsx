import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DynamicCartIcon from '../../../components/DynamicCartIcon';
import BrandMenuLinks from '../../../components/BrandMenuLinks';

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
    id: '1',
    date: '04-26-2023',
    productName: 'NOIR',
    subtitle: 'GREAT QUALITY',
    body: 'WIG SHIPPED QUICKER THAN I ANTICIPATED WHICH WAS GREAT! ALSO OBSESSED WITH THE QUALITY OF THIS HAIR. 10/10 WILL BE PURCHASING ANOTHER UNIT FROM HERE AGAIN.',
    rating: 5,
    reviewCount: 35,
    thumbnail: '/assets/profile-thumb.png'
  },
  {
    id: '2',
    date: '04-26-2023',
    productName: 'SOFT WAVE',
    subtitle: 'VERY VERSATILE',
    body: 'I AM IN LOVE WITH THIS UNIT! VERSATILE & MAKES IT EASY TO SWITCH UP MY STYLE.',
    rating: 5,
    reviewCount: 33,
    thumbnail: '/assets/profile-thumb.png'
  },
  {
    id: '3',
    date: '04-25-2023',
    productName: 'BLANCO',
    subtitle: 'EXACTLY AS DESCRIBED',
    body: 'BEAUTIFUL HAIR AND ARRIVED ON TIME. WILL ORDER AGAIN.',
    rating: 5,
    reviewCount: 28,
    thumbnail: '/assets/profile-thumb.png'
  },
  {
    id: '4',
    date: '04-24-2023',
    productName: 'BEACH WAVE',
    subtitle: 'LOVE THE TEXTURE',
    body: 'PERFECT FOR SUMMER. EASY TO STYLE AND HOLDS UP WELL.',
    rating: 4,
    reviewCount: 22,
    thumbnail: '/assets/profile-thumb.png'
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
    thumbnail: '/assets/profile-thumb.png'
  },
  {
    id: 't2',
    date: '04-18-2023',
    productName: 'TRAVEL FOAM',
    subtitle: 'CONVENIENT',
    body: 'PERFECT SIZE FOR TRAVEL. DOES THE JOB.',
    rating: 4,
    reviewCount: 8,
    thumbnail: '/assets/profile-thumb.png'
  }
];

const REVIEWS_PER_PAGE = 4;
const TOTAL_SHOP_REVIEWS = 9;
const TOTAL_TOOL_REVIEWS = 2;

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', gap: '2px', marginBottom: '4px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 1L7.5 4.5L11 5L8.5 8L9 11.5L6 9.5L3 11.5L3.5 8L1 5L4.5 4.5L6 1Z"
            fill={star <= rating ? '#EB1C24' : '#E5E5E5'}
          />
        </svg>
      ))}
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
  const [shopVisibleCount, setShopVisibleCount] = useState(REVIEWS_PER_PAGE);
  const [toolVisibleCount, setToolVisibleCount] = useState(REVIEWS_PER_PAGE);

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
  const handleLoadMoreShop = () => setShopVisibleCount(prev => Math.min(prev + REVIEWS_PER_PAGE, TOTAL_SHOP_REVIEWS));
  const handleLoadMoreTool = () => setToolVisibleCount(prev => Math.min(prev + REVIEWS_PER_PAGE, mockToolReviews.length));

  const displayedShopReviews = mockShopReviews.slice(0, shopVisibleCount);
  const displayedToolReviews = mockToolReviews.slice(0, toolVisibleCount);
  const hasMoreShop = shopVisibleCount < TOTAL_SHOP_REVIEWS;
  const hasMoreTool = toolVisibleCount < mockToolReviews.length;
  const totalShop = TOTAL_SHOP_REVIEWS;
  const totalTool = mockToolReviews.length;

  const renderReviewRow = (review: Review) => (
    <div
      key={review.id}
      className="flex items-start gap-3"
      style={{ marginBottom: '24px' }}
    >
      <div className="flex-shrink-0" style={{ width: '80px' }}>
        <div
          className="border border-black overflow-hidden bg-gray-100"
          style={{
            width: '80px',
            height: '80px',
            borderWidth: '1px'
          }}
        >
          <img
            src={review.thumbnail}
            alt={review.productName}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            onError={(e) => {
              e.currentTarget.src = '/assets/profile-thumb.png';
            }}
          />
        </div>
        <StarRating rating={review.rating} />
        <p
          style={{
            fontFamily: '"Futura PT Book"',
            fontSize: '9px',
            color: '#000000',
            margin: 0,
            textTransform: 'uppercase'
          }}
        >
          {review.reviewCount} REVIEWS
        </p>
      </div>
      <div className="flex-1 min-w-0" style={{ paddingTop: '2px' }}>
        <p
          style={{
            fontFamily: '"Futura PT Book"',
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
            fontSize: '16px',
            color: '#000000',
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
            margin: '0 0 6px 0',
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
                  <button className="cursor-pointer" style={{ transform: 'translateX(-2px)' }}>
                    <img alt="Search" width="16" height="15" src="/assets/search-icon.svg" />
                  </button>
                </>
              )}
            </div>
            <p className="text-sm" style={{ fontFamily: '"Futura PT Book"', transform: 'translateY(1px)' }}>
              {showMobileMenu ? (
                <>
                  <span style={{ fontFamily: '"Futura PT Book"', fontWeight: '400', cursor: 'pointer' }} onClick={() => navigate('/build-a-wig')}>HOME &gt;</span>{' '}
                  <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}>MENU</span>
                </>
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
                <div className="flex justify-center" style={{ marginBottom: '0' }}>
                  <div className="flex" style={{ gap: '19px' }}>
                    <img src="/assets/instagram-icon.svg" alt="Instagram" style={{ width: '20px', height: '20px' }} />
                    <img src="/assets/twitter-icon.svg" alt="Twitter" style={{ width: '20px', height: '20px' }} />
                    <img src="/assets/facebook-icon.svg" alt="Facebook" style={{ width: '20px', height: '20px' }} />
                  </div>
                </div>
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

                {/* Review list */}
                <div className="flex-1 flex flex-col overflow-y-auto mt-4" style={{ maxHeight: 'calc(560px - 120px)', scrollBehavior: 'smooth', width: '100%' }}>
                  {activeTab === 'SHOP' && (
                    <>
                      {displayedShopReviews.length === 0 ? (
                        <div className="flex flex-col justify-center items-center my-8">
                          <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '12px', color: '#808080', margin: 0, textTransform: 'uppercase', fontWeight: '500' }}>
                            NO SHOP REVIEWS
                          </p>
                        </div>
                      ) : (
                        <>
                          {displayedShopReviews.map(renderReviewRow)}
                          {hasMoreShop && (
                            <div style={{ marginTop: '8px' }}>
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
                              <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#808080', margin: '4px 0 0 0' }}>
                                {displayedShopReviews.length} OF {totalShop} REVIEWS
                              </p>
                            </div>
                          )}
                          {!hasMoreShop && displayedShopReviews.length > 0 && (
                            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#808080', margin: '8px 0 0 0' }}>
                              {displayedShopReviews.length} OF {totalShop} REVIEWS
                            </p>
                          )}
                        </>
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
                        <>
                          {displayedToolReviews.map(renderReviewRow)}
                          {hasMoreTool && (
                            <div style={{ marginTop: '8px' }}>
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
                              <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#808080', margin: '4px 0 0 0' }}>
                                {displayedToolReviews.length} OF {totalTool} REVIEWS
                              </p>
                            </div>
                          )}
                          {!hasMoreTool && displayedToolReviews.length > 0 && (
                            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#808080', margin: '8px 0 0 0' }}>
                              {displayedToolReviews.length} OF {totalTool} REVIEWS
                            </p>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* HOME footer bar */}
          {!showMobileMenu && (
            <div
              className="border border-black flex justify-center items-center py-3 w-full bg-white/60 backdrop-blur-sm"
              style={{ borderWidth: '1.3px' }}
            >
              <button
                onClick={() => navigate('/build-a-wig')}
                style={{
                  fontFamily: '"Futura PT Medium"',
                  fontSize: '12px',
                  color: '#EB1C24',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer'
                }}
              >
                HOME
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReviewsPage;
