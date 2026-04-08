import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DynamicCartIcon from '../../../components/DynamicCartIcon';
import BrandMenuLinks from '../../../components/BrandMenuLinks';
import SocialMenuIcons from '../../../components/SocialMenuIcons';
import { clearNewReviewApproved, getUserSubmittedReviewsKey, getMockShopReviewCount, getMockToolReviewCount, setLastSeenShopCount, setLastSeenToolCount } from '../../../constants/reviews';
import { isMockDataAccount, clearAppAuth } from '../../../utils/adminAuth';
import { ShopMobileMenuShopTab } from '../../../components/ShopMobileMenuShopTab';
import { ShopMobileMenuToolsTab } from '../../../components/ShopMobileMenuToolsTab';
import { signInHrefWithReturnTo } from '../../../utils/signInReturnTo';
import { usePersistentQueryState } from '../../../hooks/usePersistentQueryState';
import { MENU_TOGGLE_PANEL_HEIGHT } from '../../../layouts/menuToggleHeights';
import {
  reviewSupplementalCanAddOrEdit,
  reviewSupplementalLinkLabel,
  type StoredReviewSupplementalFields,
} from '../../../utils/reviewSupplementalMedia';
import { ReviewSupplementalContentModal } from '../../../components/account/ReviewSupplementalContentModal';
import { mergeReviewWithSupplementalOverlay } from '../../../utils/accountReviewsSupplementalOverlay';

type ReviewWithSupplemental = ReviewRow & StoredReviewSupplementalFields;

interface ReviewRow {
  id: string;
  date: string;
  productName: string;
  subtitle: string;
  body: string;
  rating: number;
  reviewCount: number;
  thumbnail: string;
  /** Set on client-submitted rows from `userSubmittedReviews_*`. */
  moderationStatus?: string;
  supplementalPhotos?: string[];
  supplementalVideos?: string[];
  supplementalContentStatus?: string;
  supplementalPendingQueueId?: string;
}

// Mock shop reviews (wig units)
const mockShopReviews: ReviewRow[] = [
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
const mockToolReviews: ReviewRow[] = [
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
  const location = useLocation();
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
  const [activeTab, setActiveTab] = usePersistentQueryState<'SHOP' | 'TOOLS'>({
    queryKey: 'tab',
    storageKey: 'accountReviewsActiveTab',
    defaultValue: 'SHOP',
    allowedValues: ['SHOP', 'TOOLS'] as const,
  });
  const [shopVisibleCount, setShopVisibleCount] = useState(REVIEWS_INITIAL);
  const [toolVisibleCount, setToolVisibleCount] = useState(REVIEWS_INITIAL);
  const [userSubmittedReviews, setUserSubmittedReviews] = useState<ReviewRow[]>([]);
  const [currentUser, setCurrentUser] = useState<{
    email?: string;
    role?: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    profileImage?: string;
    avatar?: string;
    reviewSupplementalOverlay?: Record<string, StoredReviewSupplementalFields>;
  } | null>(null);
  const [supplementalModalReview, setSupplementalModalReview] = useState<ReviewRow | null>(null);

  const showMockReviews = isMockDataAccount(currentUser);

  const userReviewIds = useMemo(() => {
    const set = new Set(userSubmittedReviews.map((r) => r.id));
    if (showMockReviews) {
      mockShopReviews.forEach((r) => set.add(r.id));
      mockToolReviews.forEach((r) => set.add(r.id));
    }
    return set;
  }, [userSubmittedReviews, showMockReviews]);

  const clientNameUpper = useMemo(() => {
    const u = currentUser;
    if (!u) return 'CLIENT';
    const n = `${String(u.firstName || '').trim()} ${String(u.lastName || '').trim()}`.trim();
    if (n) return n.toUpperCase();
    if (String(u.name || '').trim()) return String(u.name).trim().toUpperCase();
    return String(u.email || 'CLIENT').trim().toUpperCase();
  }, [currentUser]);

  const clientProfilePhotoUrl = useMemo(() => {
    const u = currentUser;
    if (!u) return undefined;
    const a = String(u.profileImage || '').trim();
    const b = String(u.avatar || '').trim();
    return a || b || undefined;
  }, [currentUser]);

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

  // Load user-submitted reviews and current user (synced with account page count). Clear only the user-submitted alert on visit.
  useEffect(() => {
    const load = () => {
      try {
        const rawUser = localStorage.getItem('currentUser');
        const user = rawUser ? JSON.parse(rawUser) : null;
        setCurrentUser(user);
        if (!user?.email) {
          setUserSubmittedReviews([]);
          return;
        }
        const raw = localStorage.getItem(getUserSubmittedReviewsKey(user.email));
        const list = raw ? JSON.parse(raw) : [];
        const arr = Array.isArray(list) ? list : [];
        setUserSubmittedReviews(
          arr.filter(
            (row: { moderationStatus?: string }) => String(row?.moderationStatus || '').toLowerCase() !== 'pending'
          ) as ReviewRow[]
        );
        clearNewReviewApproved(user.email);
        window.dispatchEvent(new CustomEvent('accountCardAlertsViewed'));
      } catch (_) {
        setUserSubmittedReviews([]);
        setCurrentUser(null);
      }
    };
    load();
    window.addEventListener('storage', load);
    window.addEventListener('reviewsUpdated', load);
    window.addEventListener('signInStateChanged', load);
    window.addEventListener('focus', load);
    return () => {
      window.removeEventListener('storage', load);
      window.removeEventListener('reviewsUpdated', load);
      window.removeEventListener('signInStateChanged', load);
      window.removeEventListener('focus', load);
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
    if (isSignedIn) {
      clearAppAuth();
      window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'false' }));
      setShowMobileMenu(false);
    } else {
      navigate(signInHrefWithReturnTo(location));
    }
  };

  const handleBack = () => navigate('/account');
  const shopReviewsList = showMockReviews ? [...userSubmittedReviews, ...mockShopReviews] : [...userSubmittedReviews];
  const toolReviewsList = showMockReviews ? mockToolReviews : [];

  const emailForOverlay = String(currentUser?.email || '').trim();
  const serverReviewOverlay = currentUser?.reviewSupplementalOverlay;

  const shopReviewsEnriched = useMemo((): ReviewWithSupplemental[] => {
    return shopReviewsList.map((r) =>
      mergeReviewWithSupplementalOverlay(
        r as unknown as Record<string, unknown>,
        emailForOverlay,
        serverReviewOverlay
      ) as unknown as ReviewWithSupplemental
    );
  }, [shopReviewsList, emailForOverlay, serverReviewOverlay]);

  const toolReviewsEnriched = useMemo((): ReviewWithSupplemental[] => {
    return toolReviewsList.map((r) =>
      mergeReviewWithSupplementalOverlay(
        r as unknown as Record<string, unknown>,
        emailForOverlay,
        serverReviewOverlay
      ) as unknown as ReviewWithSupplemental
    );
  }, [toolReviewsList, emailForOverlay, serverReviewOverlay]);

  const totalShop = shopReviewsEnriched.length;
  const handleLoadMoreShop = () => setShopVisibleCount(totalShop);
  const handleLoadMoreTool = () => setToolVisibleCount(toolReviewsEnriched.length);
  const handleShowLessShop = () => setShopVisibleCount(REVIEWS_INITIAL);
  const handleShowLessTool = () => setToolVisibleCount(REVIEWS_INITIAL);

  const displayedShopReviews = shopReviewsEnriched.slice(0, shopVisibleCount);
  const displayedToolReviews = toolReviewsEnriched.slice(0, toolVisibleCount);
  const hasMoreShop = shopVisibleCount < totalShop;
  const hasMoreTool = toolVisibleCount < toolReviewsEnriched.length;
  const totalTool = toolReviewsEnriched.length;
  // Only show "SHOW LESS" when there are more than 3 products (so collapsing makes sense). For ≤3, all fit in viewport.
  const showShowLessShop = totalShop > REVIEWS_INITIAL && !hasMoreShop;
  const showShowLessTool = totalTool > REVIEWS_INITIAL && !hasMoreTool;

  const BRAND_GRAY = '#808080';

  const renderSupplementalLink = useCallback(
    (review: ReviewWithSupplemental) => {
      if (!userReviewIds.has(review.id)) return null;
      const supp = review;
      const label = reviewSupplementalLinkLabel(supp);
      if (label === 'CONTENT PENDING REVIEW') {
        return (
          <p
            style={{
              fontFamily: '"Futura PT Medium"',
              fontSize: '10px',
              color: '#EB1C24',
              margin: '8px 0 0',
              textTransform: 'uppercase',
              fontWeight: 500,
            }}
          >
            CONTENT PENDING REVIEW
          </p>
        );
      }
      if (!reviewSupplementalCanAddOrEdit(supp)) return null;
      return (
        <button
          type="button"
          onClick={() => setSupplementalModalReview(review)}
          style={{
            fontFamily: '"Futura PT Medium"',
            fontSize: '10px',
            color: '#EB1C24',
            margin: '8px 0 0',
            padding: 0,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            textTransform: 'uppercase',
            fontWeight: 500,
            display: 'block',
            textAlign: 'left',
          }}
        >
          {label}
        </button>
      );
    },
    [userReviewIds]
  );

  const renderReviewRow = (review: ReviewWithSupplemental) => (
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
        {renderSupplementalLink(review)}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ position: 'relative' }}>
      {currentUser?.email ? (
        <ReviewSupplementalContentModal
          open={Boolean(supplementalModalReview)}
          review={
            supplementalModalReview
              ? {
                  id: supplementalModalReview.id,
                  subtitle: supplementalModalReview.subtitle,
                  productName: supplementalModalReview.productName,
                  body: supplementalModalReview.body,
                  rating: supplementalModalReview.rating,
                  supplementalPhotos: supplementalModalReview.supplementalPhotos,
                  supplementalVideos: supplementalModalReview.supplementalVideos,
                  supplementalContentStatus: supplementalModalReview.supplementalContentStatus as
                    | 'none'
                    | 'pending'
                    | 'approved'
                    | 'rejected'
                    | undefined,
                  supplementalPendingQueueId: supplementalModalReview.supplementalPendingQueueId,
                }
              : null
          }
          clientEmail={currentUser.email}
          clientNameUpper={clientNameUpper}
          clientProfilePhotoUrl={clientProfilePhotoUrl}
          onClose={() => setSupplementalModalReview(null)}
          onSubmitted={() => {
            /* list refreshes via reviewsUpdated */
          }}
        />
      ) : null}
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
                    onClick={() => navigate(isSignedIn ? '/account' : signInHrefWithReturnTo(location))}
                    className="cursor-pointer"
                    style={{ height: '15px !important', width: '21px !important', padding: '0 !important', border: 'none !important', background: 'none !important', transform: 'translateX(4px)' }}
                  >
                    <img alt="Account" width="16" height="16" src="/assets/NOIR/account-icon.svg" />
                  </button>
                  <button
                    onClick={() => navigate(isSignedIn ? '/wishlist' : signInHrefWithReturnTo(location))}
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
                <DynamicCartIcon count={cartCount} width={22} height={19} variant="nav" />
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
              style={{ borderWidth: '1.3px', minWidth: '100%', maxWidth: 'none', overflow: 'visible', backgroundColor: 'rgba(255, 255, 255, 0.6)', minHeight: MENU_TOGGLE_PANEL_HEIGHT, height: MENU_TOGGLE_PANEL_HEIGHT }}
            >
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', paddingTop: '20px', flex: 1, minHeight: 0, position: 'relative' }}>
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
                <div className="flex justify-center" style={{ marginBottom: '20px', marginTop: 'auto' }}>
                  <span onClick={handleMobileMenuSignInToggle} style={{ fontFamily: '"Futura PT Medium"', fontSize: '14px', color: '#EB1C24', fontWeight: '500', textTransform: 'uppercase', cursor: 'pointer' }}>
                    {isSignedIn ? 'SIGN OUT' : 'SIGN IN'}
                  </span>
                </div>
                <div style={{ marginBottom: '20px' }}><SocialMenuIcons /></div>
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
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 20px', color: '#000' }}>
                          <p
                            style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '11px', color: '#808080', textTransform: 'uppercase', margin: '0' }}
                            dangerouslySetInnerHTML={{ __html: "YOU DON'T HAVE ANY SHOP REVIEWS YET.<br>CHECK BACK SOON!" }}
                          />
                        </div>
                      ) : (
                        displayedShopReviews.map(renderReviewRow)
                      )}
                    </>
                  )}
                  {activeTab === 'TOOLS' && (
                    <>
                      {displayedToolReviews.length === 0 ? (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 20px', color: '#000' }}>
                          <p
                            style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '11px', color: '#808080', textTransform: 'uppercase', margin: '0' }}
                            dangerouslySetInnerHTML={{ __html: "YOU DON'T HAVE ANY TOOL REVIEWS YET.<br>CHECK BACK SOON!" }}
                          />
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
