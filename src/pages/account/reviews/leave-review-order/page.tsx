import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import DynamicCartIcon from '../../../../components/DynamicCartIcon';
import BrandMenuLinks from '../../../../components/BrandMenuLinks';
import { getUserSubmittedReviewsKey, getReviewsNewApprovedKey } from '../../../../constants/reviews';

interface OrderLineItem {
  productName: string;
  options?: Record<string, string>;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: string;
  productName: string;
  productImage: string;
  total: number;
  items: number;
  deliveredAt?: number;
  lineItems?: OrderLineItem[];
}

function getProductImage(productName: string): string {
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
    default:
      return '/assets/natural front.png';
  }
}

/** Build list of items eligible for review: delivered orders only; unique by product + options (no duplicates). */
function getEligibleReviewItems(order: Order): OrderLineItem[] {
  if (order.status !== 'DELIVERED') return [];
  if (order.lineItems && order.lineItems.length > 0) {
    const seen = new Set<string>();
    return order.lineItems.filter((item) => {
      const key = `${item.productName}|${JSON.stringify(item.options || {})}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  return [{ productName: order.productName, options: {} }];
}

const BRAND_RED = '#EB1C24';
const BRAND_GRAY = '#808080';

function LeaveReviewOrderPage() {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();
  const [order, setOrder] = useState<Order | null>(location.state?.order ?? null);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [rating, setRating] = useState(0);
  const [subject, setSubject] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [submittedForIndex, setSubmittedForIndex] = useState<Set<number>>(new Set());
  const [photoUploadFile, setPhotoUploadFile] = useState<File | null>(null);
  const photoUploadInputRef = useRef<HTMLInputElement>(null);
  const [videoUploadFile, setVideoUploadFile] = useState<File | null>(null);
  const videoUploadInputRef = useRef<HTMLInputElement>(null);
  const [cartCount, setCartCount] = useState(() => {
    try {
      return parseInt(localStorage.getItem('cartCount') || '0', 10);
    } catch (e) {
      return 0;
    }
  });
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mobileMenuActiveTab, setMobileMenuActiveTab] = useState<'SHOP' | 'TOOLS' | 'BRAND'>('BRAND');
  const [mobileMenuExpandedItems, setMobileMenuExpandedItems] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const user = localStorage.getItem('currentUser');
      return user ? JSON.parse(user) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    if (order) return;
    if (!orderId || !currentUser?.email) return;
    try {
      const key = `userOrders_${currentUser.email}`;
      const stored = localStorage.getItem(key);
      if (!stored) return;
      const data = JSON.parse(stored);
      const all = [...(data.activeOrders || []), ...(data.pastOrders || [])];
      const found = all.find((o: Order) => o.id === orderId);
      if (found) setOrder(found);
    } catch (e) {
      console.error('Error loading order for review:', e);
    }
  }, [orderId, currentUser?.email, order]);

  useEffect(() => {
    const handleCartCountUpdate = (e: CustomEvent) => setCartCount(e.detail);
    const handleStorage = () => {
      try {
        setCartCount(parseInt(localStorage.getItem('cartCount') || '0', 10));
        const user = localStorage.getItem('currentUser');
        if (user) setCurrentUser(JSON.parse(user));
      } catch (e) {
        setCartCount(0);
      }
    };
    window.addEventListener('cartCountUpdated', handleCartCountUpdate as EventListener);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('cartCountUpdated', handleCartCountUpdate as EventListener);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const handleMobileMenuToggle = () => setShowMobileMenu(!showMobileMenu);
  const handleMobileMenuTabClick = (tab: 'SHOP' | 'TOOLS' | 'BRAND') => setMobileMenuActiveTab(tab);
  const handleMobileMenuItemToggle = (item: string) => {
    setMobileMenuExpandedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const eligibleItems = order ? getEligibleReviewItems(order) : [];
  const itemCount = eligibleItems.length;
  const currentItem = itemCount > 0 ? eligibleItems[currentItemIndex] : null;
  const isSubmittedForCurrent = currentItemIndex !== undefined && submittedForIndex.has(currentItemIndex);
  const isFirst = currentItemIndex === 0;
  const isLast = currentItemIndex === itemCount - 1;
  const isSingle = itemCount <= 1;
  const itemPrice = order && itemCount > 0 ? Math.round(order.total / itemCount) : 0;

  const handleSubmitReview = () => {
    setSubmittedForIndex((prev) => new Set(prev).add(currentItemIndex));

    // Persist as approved/posted so it appears on reviews page and account card updates
    const email = currentUser?.email;
    if (email && currentItem) {
      try {
        const key = getUserSubmittedReviewsKey(email);
        const raw = localStorage.getItem(key);
        const list = raw ? JSON.parse(raw) : [];
        const newReview = {
          id: `user-${Date.now()}`,
          date: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, '-'),
          productName: currentItem.productName,
          subtitle: subject || 'CUSTOMER REVIEW',
          body: reviewText || '',
          rating,
          reviewCount: 1,
          thumbnail: getProductImage(currentItem.productName)
        };
        list.push(newReview);
        localStorage.setItem(key, JSON.stringify(list));
        localStorage.setItem(getReviewsNewApprovedKey(email), 'true');
        if (order?.id) localStorage.setItem(`reviewSubmitted_${order.id}`, 'true');
        window.dispatchEvent(new CustomEvent('reviewsUpdated'));
      } catch (e) {
        console.error('Error saving review:', e);
      }
    }

    setRating(0);
    setSubject('');
    setReviewText('');
  };

  const goPrev = () => {
    if (currentItemIndex > 0) {
      setCurrentItemIndex((i) => i - 1);
      setRating(0);
      setSubject('');
      setReviewText('');
    }
  };

  const goNext = () => {
    if (currentItemIndex < itemCount - 1) {
      setCurrentItemIndex((i) => i + 1);
      setRating(0);
      setSubject('');
      setReviewText('');
    }
  };

  if (!order) {
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
          <div className="flex flex-col py-5 px-4">
            {/* Nav bar - same structure as orders page */}
            <div
              className="border-solid border-black flex justify-center items-center py-3 w-full mb-5 px-5 bg-white/60 backdrop-blur-sm relative"
              style={{ border: '1.3px solid black' }}
            >
              <div className="flex gap-5 absolute left-4">
                <button
                  onClick={() => navigate(-1)}
                  className="cursor-pointer"
                  style={{ height: '15px !important', width: '21px !important', padding: '0 !important', border: 'none !important', background: 'none !important' }}
                >
                  <img alt="Back" width="21" height="15" src="/assets/back-button.svg" />
                </button>
              </div>
              <p className="text-sm" style={{ fontFamily: '"Futura PT Book"', transform: 'translateY(1px)' }}>
                <span style={{ fontFamily: '"Futura PT Book"', fontWeight: '400', cursor: 'pointer' }} onClick={() => navigate('/account/orders')}>
                  ORDER &gt;
                </span>{' '}
                <span style={{ color: BRAND_RED, fontFamily: '"Futura PT Medium"', fontWeight: '400' }}>
                  REVIEW
                </span>
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
            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '12px', color: '#000000', margin: '0 0 12px 0' }}>
              Order not found.
            </p>
          </div>
        </div>
      </div>
    );
  }

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
          {/* Nav bar - same structure as orders page; always visible */}
          <div
            className="border-solid border-black flex justify-center items-center py-3 w-full mb-5 px-5 bg-white/60 backdrop-blur-sm relative"
            style={{ border: '1.3px solid black' }}
          >
            <div className="flex gap-5 absolute left-4">
              {showMobileMenu ? (
                <>
                  <button onClick={() => navigate('/account')} className="cursor-pointer" style={{ height: '15px !important', width: '21px !important', padding: '0 !important', border: 'none !important', background: 'none !important', transform: 'translateX(4px)' }}>
                    <img alt="Account" width="16" height="16" src="/assets/NOIR/account-icon.svg" />
                  </button>
                  <button onClick={() => navigate('/wishlist')} className="cursor-pointer" style={{ height: '21px !important', width: '21px !important', padding: '0 !important', border: 'none !important', background: 'none !important', transform: 'translateX(2px)' }}>
                    <img alt="Wishlist" width="18" height="18" src="/assets/wishlist-heart.svg" />
                  </button>
                </>
              ) : (
                <button onClick={() => navigate(-1)} className="cursor-pointer" style={{ height: '15px !important', width: '21px !important', padding: '0 !important', border: 'none !important', background: 'none !important' }}>
                  <img alt="Back" width="21" height="15" src="/assets/back-button.svg" />
                </button>
              )}
            </div>
            <p className="text-sm" style={{ fontFamily: '"Futura PT Book"', transform: 'translateY(1px)' }}>
              {showMobileMenu ? (
                <>
                  <span style={{ fontFamily: '"Futura PT Book"', fontWeight: '400', cursor: 'pointer' }} onClick={() => navigate('/home/shop')}>
                    HOME &gt;
                  </span>{' '}
                  <span style={{ color: BRAND_RED, fontFamily: '"Futura PT Medium"', fontWeight: '400' }}>
                    MENU
                  </span>
                </>
              ) : (
                <>
                  <span style={{ fontFamily: '"Futura PT Book"', fontWeight: '400', cursor: 'pointer' }} onClick={() => navigate('/account/orders')}>
                    ORDER &gt;
                  </span>{' '}
                  <span style={{ color: BRAND_RED, fontFamily: '"Futura PT Medium"', fontWeight: '400' }}>
                    REVIEW
                  </span>
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

          {showMobileMenu ? (
            <div
              className="border border-black flex flex-col pt-6 pb-4 px-5 bg-white/60 backdrop-blur-sm w-full"
              style={{
                borderWidth: '1.3px',
                minWidth: '100%',
                maxWidth: 'none',
                overflow: 'visible',
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                minHeight: '560px'
              }}
            >
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', paddingTop: '20px', height: '490px', position: 'relative' }}>
                <div className="flex justify-center gap-8" style={{ marginBottom: '30px' }}>
                  {(['SHOP', 'TOOLS', 'BRAND'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => handleMobileMenuTabClick(tab)}
                      style={{
                        fontFamily: mobileMenuActiveTab === tab ? '"Futura PT Medium"' : '"Futura PT Book"',
                        fontSize: '14px',
                        color: mobileMenuActiveTab === tab ? BRAND_RED : 'black',
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
                  {mobileMenuActiveTab === 'BRAND' && <BrandMenuLinks onClose={() => setShowMobileMenu(false)} />}
                </div>
              </div>
            </div>
          ) : (
            <>
            <div
              className="border border-black bg-white/60 backdrop-blur-sm p-4 w-full"
              style={{ borderWidth: '1.3px', boxShadow: 'none' }}
            >
              {/* RATE + REVIEW title */}
              <h1
                style={{
                  fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                  fontSize: '28px',
                  color: '#000000',
                  margin: '0 0 8px 0',
                  textAlign: 'center',
                  lineHeight: 1.2
                }}
              >
                RATE + REVIEW
              </h1>
              {/* ORDER #xxx (red) */}
              <p
                style={{
                  fontFamily: '"Futura PT Medium"',
                  fontSize: '12px',
                  color: BRAND_RED,
                  margin: '0 0 4px 0',
                  textAlign: 'center',
                  textTransform: 'uppercase'
                }}
              >
                ORDER #{(order.orderNumber || '').replace(/^#|\s*ORDER\s*#?/gi, '').trim() || order.id}
              </p>
              {/* N ITEM(S) (gray) */}
              <p
                style={{
                  fontFamily: '"Futura PT Book"',
                  fontSize: '11px',
                  color: BRAND_GRAY,
                  margin: '0 0 20px 0',
                  textAlign: 'center',
                  textTransform: 'uppercase'
                }}
              >
                {itemCount} {itemCount === 1 ? 'ITEM' : 'ITEMS'}
              </p>

              {currentItem && (
                <>
                  {/* Product image */}
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                    <img
                      src={getProductImage(currentItem.productName)}
                      alt={currentItem.productName}
                      style={{
                        width: '180px',
                        height: '180px',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                  {/* Product name */}
                  <p
                    style={{
                      fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                      fontSize: '20px',
                      color: '#000000',
                      margin: '0 0 4px 0',
                      textAlign: 'center',
                      textTransform: 'uppercase'
                    }}
                  >
                    {currentItem.productName}
                  </p>
                  {/* Price */}
                  <p
                    style={{
                      fontFamily: '"Futura PT Book"',
                      fontSize: '12px',
                      color: BRAND_GRAY,
                      margin: '0 0 16px 0',
                      textAlign: 'center'
                    }}
                  >
                    ${itemPrice.toLocaleString()} USD
                  </p>

                  {/* Star rating - same style as reviews account page (filled-star / star-symbol) */}
                  <div style={{ display: 'flex', gap: '2px', marginTop: '8px', marginBottom: '20px', justifyContent: 'center' }}>
                    {[0, 1, 2, 3, 4].map((index) => {
                      const filled = index < rating;
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setRating(index + 1)}
                          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                          aria-label={`${index + 1} star${index !== 0 ? 's' : ''}`}
                        >
                          <img
                            src={filled ? '/assets/NOIR/filled-star.png' : '/assets/NOIR/star-symbol.png'}
                            alt=""
                            style={{
                              width: '12.75px',
                              height: '12.75px',
                              filter: 'drop-shadow(0 0 0 1px black)'
                            }}
                          />
                        </button>
                      );
                    })}
                  </div>

                  {/* SUBJECT* */}
                  <label
                    style={{
                      display: 'block',
                      fontFamily: '"Futura PT Medium"',
                      fontSize: '10px',
                      color: '#000000',
                      marginBottom: '6px',
                      textTransform: 'uppercase'
                    }}
                  >
                    SUBJECT<span style={{ color: BRAND_RED }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="ENTER PRODUCT SUMMARY"
                    disabled={isSubmittedForCurrent}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontFamily: '"Futura PT Book"',
                      fontSize: '12px',
                      color: '#000',
                      border: '1px solid #000',
                      background: '#fff',
                      boxSizing: 'border-box',
                      marginBottom: '16px',
                      textTransform: 'uppercase',
                      borderRadius: 0
                    }}
                  />

                  {/* REVIEW* */}
                  <label
                    style={{
                      display: 'block',
                      fontFamily: '"Futura PT Medium"',
                      fontSize: '10px',
                      color: '#000000',
                      marginBottom: '6px',
                      textTransform: 'uppercase'
                    }}
                  >
                    REVIEW<span style={{ color: BRAND_RED }}>*</span>
                  </label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="LEAVE DETAILED REVIEW HERE."
                    disabled={isSubmittedForCurrent}
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontFamily: '"Futura PT Book"',
                      fontSize: '12px',
                      color: '#000',
                      border: '1px solid #000',
                      background: '#fff',
                      boxSizing: 'border-box',
                      marginBottom: '16px',
                      resize: 'vertical',
                      textTransform: 'uppercase',
                      borderRadius: 0
                    }}
                  />

                  {/* UPLOAD PHOTO - same as order form choose file */}
                  <label
                    style={{
                      display: 'block',
                      fontFamily: '"Futura PT Medium"',
                      fontSize: '10px',
                      color: '#000000',
                      marginBottom: '6px',
                      textTransform: 'uppercase'
                    }}
                  >
                    UPLOAD PHOTO
                  </label>
                  <div style={{ position: 'relative', marginBottom: '16px' }}>
                    <input
                      ref={photoUploadInputRef}
                      type="file"
                      accept="image/*"
                      disabled={isSubmittedForCurrent}
                      onChange={(e) => setPhotoUploadFile(e.target.files?.[0] ?? null)}
                      style={{
                        position: 'absolute',
                        width: '100%',
                        height: '36px',
                        opacity: 0,
                        cursor: isSubmittedForCurrent ? 'default' : 'pointer',
                        zIndex: 2
                      }}
                    />
                    <div
                      onClick={() => !isSubmittedForCurrent && photoUploadInputRef.current?.click()}
                      style={{
                        width: '100%',
                        minHeight: '36px',
                        padding: '8px',
                        border: '1.3px solid #000000',
                        fontFamily: '"Futura PT Book"',
                        fontSize: '11px',
                        backgroundColor: '#FFFFFF',
                        color: photoUploadFile ? '#808080' : BRAND_RED,
                        boxSizing: 'border-box',
                        borderRadius: 0,
                        cursor: isSubmittedForCurrent ? 'default' : 'pointer',
                        textTransform: 'uppercase',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <span style={{
                        padding: '4px 8px',
                        border: '1px solid #808080',
                        borderRadius: '4px',
                        backgroundColor: '#F5F5F5',
                        color: '#000000',
                        textTransform: 'uppercase',
                        fontSize: '11px',
                        fontFamily: '"Futura PT Book"'
                      }}>
                        CHOOSE FILE
                      </span>
                      <span style={{ marginLeft: '8px', color: '#808080', fontFamily: '"Futura PT Book"', fontSize: '10px' }}>
                        {photoUploadFile ? photoUploadFile.name : 'NO FILE SELECTED'}
                      </span>
                    </div>
                  </div>

                  {/* UPLOAD VIDEO - same as order form choose file */}
                  <label
                    style={{
                      display: 'block',
                      fontFamily: '"Futura PT Medium"',
                      fontSize: '10px',
                      color: '#000000',
                      marginBottom: '6px',
                      textTransform: 'uppercase'
                    }}
                  >
                    UPLOAD VIDEO
                  </label>
                  <div style={{ position: 'relative', marginBottom: '24px' }}>
                    <input
                      ref={videoUploadInputRef}
                      type="file"
                      accept="video/*"
                      disabled={isSubmittedForCurrent}
                      onChange={(e) => setVideoUploadFile(e.target.files?.[0] ?? null)}
                      style={{
                        position: 'absolute',
                        width: '100%',
                        height: '36px',
                        opacity: 0,
                        cursor: isSubmittedForCurrent ? 'default' : 'pointer',
                        zIndex: 2
                      }}
                    />
                    <div
                      onClick={() => !isSubmittedForCurrent && videoUploadInputRef.current?.click()}
                      style={{
                        width: '100%',
                        minHeight: '36px',
                        padding: '8px',
                        border: '1.3px solid #000000',
                        fontFamily: '"Futura PT Book"',
                        fontSize: '11px',
                        backgroundColor: '#FFFFFF',
                        color: videoUploadFile ? '#808080' : BRAND_RED,
                        boxSizing: 'border-box',
                        borderRadius: 0,
                        cursor: isSubmittedForCurrent ? 'default' : 'pointer',
                        textTransform: 'uppercase',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <span style={{
                        padding: '4px 8px',
                        border: '1px solid #808080',
                        borderRadius: '4px',
                        backgroundColor: '#F5F5F5',
                        color: '#000000',
                        textTransform: 'uppercase',
                        fontSize: '11px',
                        fontFamily: '"Futura PT Book"'
                      }}>
                        CHOOSE FILE
                      </span>
                      <span style={{ marginLeft: '8px', color: '#808080', fontFamily: '"Futura PT Book"', fontSize: '10px' }}>
                        {videoUploadFile ? videoUploadFile.name : 'NO FILE SELECTED'}
                      </span>
                    </div>
                  </div>

                  {/* Prev/Next item buttons - inside card */}
                  {!isSingle && (
                      <div className="flex gap-3">
                        {!isFirst && (
                          <button
                            type="button"
                            onClick={goPrev}
                            className="border border-black flex-1 text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
                            style={{
                              borderWidth: '1.3px',
                              color: BRAND_RED,
                              fontFamily: '"Futura PT Medium"',
                              backgroundColor: '#FFFFFF'
                            }}
                          >
                            PREVIOUS ITEM
                          </button>
                        )}
                        {!isLast && (
                          <button
                            type="button"
                            onClick={goNext}
                            className="border border-black flex-1 text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
                            style={{
                              borderWidth: '1.3px',
                              color: BRAND_RED,
                              fontFamily: '"Futura PT Medium"',
                              backgroundColor: '#FFFFFF'
                            }}
                          >
                            NEXT ITEM
                          </button>
                        )}
                      </div>
                    )}
                </>
              )}

              {itemCount === 0 && (
                <p style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: BRAND_GRAY, margin: 0, textAlign: 'center' }}>
                  No items eligible for review.
                </p>
              )}
            </div>

            {/* Submit Review - below card, same styling as "Leave a review" on orders page */}
            {currentItem && (
              <div className="px-0 w-full" style={{ marginTop: '11px', marginBottom: '20px' }}>
                {isSubmittedForCurrent ? (
                  <button
                    type="button"
                    disabled
                    className="relative z-10 border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-default uppercase"
                    style={{ borderWidth: '1.3px', color: BRAND_RED, fontFamily: '"Futura PT Medium"' }}
                  >
                    REVIEW SUBMITTED
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitReview}
                    className="relative z-10 border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50 uppercase"
                    style={{ borderWidth: '1.3px', color: BRAND_RED, fontFamily: '"Futura PT Medium"' }}
                  >
                    SUBMIT REVIEW
                  </button>
                )}
              </div>
            )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default LeaveReviewOrderPage;
