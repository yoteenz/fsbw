import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DynamicCartIcon from '../../components/DynamicCartIcon';

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: string;
  productName: string;
  productImage: string;
  total: number;
  items: number;
  reviewInfo?: string; // Optional review/points information
  trackingNumber?: string; // Optional tracking number
  trackingCarrier?: string; // Optional tracking carrier (e.g., "DHL", "FEDEX")
}

function OrdersPage() {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(() => {
    try {
      return parseInt(localStorage.getItem('cartCount') || '0', 10);
    } catch (e) {
      return 0;
    }
  });
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mobileMenuActiveTab, setMobileMenuActiveTab] = useState('SHOP');
  const [mobileMenuExpandedItems, setMobileMenuExpandedItems] = useState<string[]>([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Currency state - load from localStorage on mount
  const [selectedCurrency, setSelectedCurrency] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCurrency = localStorage.getItem('selectedCurrency');
        return savedCurrency || 'USD';
      } catch (e) {
        return 'USD';
      }
    }
    return 'USD';
  });
  
  // Currency exchange rates
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

  // Helper function to get 2D mannequin image based on product name
  const getProductImage = (productName: string): string => {
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
        // For NOIR, use natural front image (2D version without background)
        return '/assets/natural front.png';
    }
  };

  // Helper function to get unit page route based on product name
  const getProductRoute = (productName: string): string => {
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
  };

  // Sample order data
  const [activeOrders, setActiveOrders] = useState<Order[]>([
    {
      id: '1',
      orderNumber: 'ORDER #237',
      date: '04-26-2023',
      status: 'PROCESSING',
      productName: 'NOIR',
      productImage: getProductImage('NOIR'),
      total: 675,
      items: 1,
      trackingNumber: undefined,
      trackingCarrier: undefined
    },
    {
      id: '2',
      orderNumber: 'ORDER #239',
      date: '04-26-2023',
      status: 'SHIPPED',
      productName: 'BLANCO',
      productImage: getProductImage('BLANCO'),
      total: 1205,
      items: 2,
      trackingNumber: '9400136106023046913338',
      trackingCarrier: 'DHL'
    },
    {
      id: '3',
      orderNumber: 'ORDER #241',
      date: '04-26-2023',
      status: 'SHIPPED',
      productName: 'NOIR',
      productImage: getProductImage('NOIR'),
      total: 895,
      items: 3,
      trackingNumber: '9400136106023046913326',
      trackingCarrier: 'FEDEX'
    }
  ]);

  const [pastOrders, setPastOrders] = useState<Order[]>([
    {
      id: '4',
      orderNumber: 'ORDER #234',
      date: '04-26-2023',
      status: 'DELIVERED',
      productName: 'NOIR',
      productImage: getProductImage('NOIR'),
      total: 740,
      items: 2,
      reviewInfo: 'REVIEW NEEDED',
      trackingNumber: '9400136106023046913338',
      trackingCarrier: 'DHL'
    },
    {
      id: '5',
      orderNumber: 'ORDER #233',
      date: '04-26-2023',
      status: 'DELIVERED',
      productName: 'SOFT CURL',
      productImage: getProductImage('SOFT CURL'),
      total: 750,
      items: 1,
      reviewInfo: 'POINTS TO EARN',
      trackingNumber: '9400136106023046913326',
      trackingCarrier: 'FEDEX'
    },
    {
      id: '6',
      orderNumber: 'ORDER #232',
      date: '04-26-2023',
      status: 'DELIVERED',
      productName: 'BLANCO',
      productImage: getProductImage('BLANCO'),
      total: 680,
      items: 1,
      reviewInfo: 'REVIEW NEEDED',
      trackingNumber: '9400136106023046913338',
      trackingCarrier: 'DHL'
    },
    {
      id: '7',
      orderNumber: 'ORDER #231',
      date: '04-26-2023',
      status: 'DELIVERED',
      productName: 'NOIR',
      productImage: getProductImage('NOIR'),
      total: 740,
      items: 1,
      trackingNumber: '9400136106023046913326',
      trackingCarrier: 'FEDEX'
    }
  ]);

  // Refs for auto-scrolling
  const activeOrdersRef = useRef<HTMLDivElement>(null);
  const pastOrdersRef = useRef<HTMLDivElement>(null);
  const pastOrdersReviewRef = useRef<HTMLDivElement>(null);

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

  // Listen for currency changes
  useEffect(() => {
    const handleCurrencyChange = () => {
      try {
        const savedCurrency = localStorage.getItem('selectedCurrency');
        if (savedCurrency) {
          setSelectedCurrency(savedCurrency);
        }
      } catch (e) {
        // Ignore errors
      }
    };

    window.addEventListener('currencyChanged', handleCurrencyChange);
    window.addEventListener('storage', handleCurrencyChange);

    return () => {
      window.removeEventListener('currencyChanged', handleCurrencyChange);
      window.removeEventListener('storage', handleCurrencyChange);
    };
  }, []);

  // Auto-scroll effect for order lists (with manual scroll support)
  useEffect(() => {
    const scrollElements = [
      { ref: activeOrdersRef, content: activeOrders.length > 0 ? 'active' : null },
      { ref: pastOrdersRef, content: pastOrders.length > 0 ? 'past' : null },
      { ref: pastOrdersReviewRef, content: pastOrders.some(o => o.reviewInfo) ? 'pastReview' : null }
    ];

    const intervals: ReturnType<typeof setTimeout>[] = [];
    const manualScrollTimeouts: ReturnType<typeof setTimeout>[] = [];
    const isManuallyScrolling: { [key: string]: boolean } = {};

    scrollElements.forEach(({ ref, content }) => {
      if (ref.current && content) {
        const element = ref.current;
        const elementId = content;
        
        setTimeout(() => {
          const scrollWidth = element.scrollWidth;
          const clientWidth = element.clientWidth;

          if (scrollWidth > clientWidth) {
            let scrollPosition = 0;
            const scrollSpeed = 1;
            const pauseTime = 2000;
            const scrollInterval = 50;
            let isPaused = false;
            let pauseCounter = 0;
            let direction = 1;
            let lastScrollLeft = 0;

            isPaused = true;
            pauseCounter = pauseTime / scrollInterval;

            // Handle manual scrolling - pause auto-scroll when user scrolls
            const handleManualScroll = () => {
              const currentScrollLeft = element.scrollLeft;
              if (Math.abs(currentScrollLeft - lastScrollLeft) > 2) {
                // User is manually scrolling
                isManuallyScrolling[elementId] = true;
                scrollPosition = currentScrollLeft;
                
                // Resume auto-scroll after 3 seconds of no manual scrolling
                clearTimeout(manualScrollTimeouts.find(t => t) as any);
                const timeout = setTimeout(() => {
                  isManuallyScrolling[elementId] = false;
                  lastScrollLeft = element.scrollLeft;
                  scrollPosition = lastScrollLeft;
                }, 3000);
                manualScrollTimeouts.push(timeout);
              }
              lastScrollLeft = currentScrollLeft;
            };

            element.addEventListener('scroll', handleManualScroll);
            element.addEventListener('touchstart', handleManualScroll);
            element.addEventListener('mousedown', handleManualScroll);

            const interval = setInterval(() => {
              // Don't auto-scroll if user is manually scrolling
              if (isManuallyScrolling[elementId]) {
                return;
              }

              if (isPaused) {
                pauseCounter--;
                if (pauseCounter <= 0) {
                  isPaused = false;
                }
                return;
              }

              scrollPosition += scrollSpeed * direction;
              
              if (direction === 1 && scrollPosition >= scrollWidth - clientWidth) {
                scrollPosition = scrollWidth - clientWidth;
                direction = -1;
                isPaused = true;
                pauseCounter = pauseTime / scrollInterval;
              } else if (direction === -1 && scrollPosition <= 0) {
                scrollPosition = 0;
                direction = 1;
                isPaused = true;
                pauseCounter = pauseTime / scrollInterval;
              }
              
              element.scrollLeft = scrollPosition;
              lastScrollLeft = scrollPosition;
            }, scrollInterval);

            intervals.push(interval);
          }
        }, 100);
      }
    });

    return () => {
      intervals.forEach(interval => clearInterval(interval));
      manualScrollTimeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [activeOrders, pastOrders]);

  const formatPrice = (price: number) => {
    const currency = currencyRates[selectedCurrency as keyof typeof currencyRates];
    if (!currency) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    const convertedPrice = price * currency.rate;
    const formattedPrice = convertedPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `${currency.symbol.replace('&#36;', '$').replace('&euro;', '€').replace('&pound;', '£').replace('&yen;', '¥').replace('&#8377;', '₹')}${formattedPrice}`;
  };

  const handleMobileMenuToggle = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const handleCloseMobileMenu = () => {
    setShowMobileMenu(false);
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
    setIsSignedIn(!isSignedIn);
  };

  return (
    <div className="min-h-screen" style={{ position: 'relative' }}>
      {/* Marble Background */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url('/assets/Marble Floor.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center calc(50% + 25px)',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
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
                  <button className="cursor-pointer" style={{ transform: 'translateX(0px)' }}>
                    <img
                      alt="Account icon"
                      width="16"
                      height="16"
                      src="/assets/NOIR/account-icon.svg"
                    />
                  </button>
                  <button 
                    onClick={() => navigate('/wishlist')} 
                    className="cursor-pointer"
                    style={{ height: '21px !important', width: '21px !important', padding: '0 !important', border: 'none !important', background: 'none !important', transform: 'translateX(2px)' }}
                  >
                    <img
                      alt="Wishlist"
                      width="19"
                      height="19"
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
                </>
              )}
            </div>

            {/* Text in the middle */}
            <p className="text-sm" style={{ fontFamily: '"Futura PT Book"', transform: 'translateY(1px)' }}>
              {showMobileMenu ? (
                <>
                  <span 
                    style={{ fontFamily: '"Futura PT Book"', fontWeight: '400', cursor: 'pointer' }}
                    onClick={() => navigate('/build-a-wig')}
                  >
                    HOME &gt;
                  </span>{' '}
                  <span
                    style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}
                  >
                    MENU
                  </span>
                </>
              ) : (
                <>
                  <span 
                    style={{ fontFamily: '"Futura PT Book"', fontWeight: '400', cursor: 'pointer' }}
                    onClick={() => navigate('/account')}
                  >
                    ACCOUNT &gt;
                  </span>{' '}
                  <span
                    style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}
                  >
                    ORDERS
                  </span>
                </>
              )}
            </p>

            {/* Right side icons */}
            <div className="gap-5 flex absolute" style={{ right: showMobileMenu ? '14px' : '17px' }}>
              <div style={{ transform: showMobileMenu ? 'translateY(0.7px)' : 'none' }}>
                <DynamicCartIcon count={cartCount} width={22} height={19} />
              </div>
              {!showMobileMenu && (
                <img
                  alt="Menu"
                  width="21"
                  height="21"
                  className="cursor-pointer"
                  src="/assets/menu-icon.svg"
                  onClick={handleMobileMenuToggle}
                />
              )}
            </div>

            {/* Close button when menu is open */}
            {showMobileMenu && (
              <img
                alt="Close"
                width="21"
                height="21"
                className="cursor-pointer"
                src="/assets/close-icon.svg"
                onClick={handleCloseMobileMenu}
                style={{ position: 'absolute', right: '14px' }}
              />
            )}
          </div>

          {/* Orders Content */}
          <div className="flex flex-col gap-4 mb-5">
            {/* Active Orders Card */}
            <div className="bg-white/60 backdrop-blur-sm border border-black p-4 min-h-[340px] flex flex-col overflow-hidden shadow-lg transition-all duration-300 ease-out" style={{ borderWidth: '1.3px' }}>
                {/* Header */}
                <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200">
                  <button
                    className="text-red-500 font-bold text-lg tracking-wider truncate hover:text-red-600 transition-colors text-left uppercase"
                    style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '12px' }}
                  >
                    ACTIVE ORDERS
                  </button>
                  <span
                    className="text-black font-bold text-lg flex-shrink-0 ml-2 uppercase"
                    style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', fontSize: '17px' }}
                  >
                    {activeOrders.length}
                  </span>
                </div>

                 {/* Body */}
                 <div className="flex-1 flex flex-col overflow-hidden mt-2">
                   {/* Mannequin Thumbnails with order context - stacked vertically, left aligned */}
                   <div className="flex flex-col justify-start items-start gap-4 my-2 flex-shrink-0">
                     {activeOrders.slice(0, 2).map((order) => (
                       <div key={order.id} className="flex items-center gap-3" style={{ flexShrink: 0 }}>
                         {/* Thumbnail */}
                         <div className="flex flex-col items-center" style={{ flexShrink: 0 }}>
                           <button
                             onClick={() => navigate(getProductRoute(order.productName))}
                             style={{
                               background: 'none',
                               border: 'none',
                               padding: 0,
                               cursor: 'pointer'
                             }}
                           >
                             <img
                               src={order.productImage}
                               alt={order.productName}
                               style={{
                                 width: '102px',
                                 height: '102px',
                                 objectFit: 'contain'
                               }}
                             />
                           </button>
                           <p
                             style={{
                               fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                               color: '#EB1C24',
                               fontSize: '12px',
                               margin: '2px 0 0 0',
                               textTransform: 'uppercase'
                             }}
                           >
                             {order.items} {order.items === 1 ? 'ITEM' : 'ITEMS'}
                           </p>
                         </div>
                         
                         {/* Order Context Text */}
                         <div className="flex flex-col gap-1" style={{ flexShrink: 0, transform: 'translateY(-6px)' }}>
                           <p style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', fontSize: '13px', color: '#000000', margin: 0, lineHeight: '1.2' }}>
                             {order.date}
                           </p>
                           <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', color: '#EB1C24', margin: 0, lineHeight: '1.2' }}>
                             {order.orderNumber}
                           </p>
                           <p style={{ fontFamily: '"Futura PT Demi", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', color: '#909090', margin: 0, lineHeight: '1.2' }}>
                             {formatPrice(order.total)} {selectedCurrency}
                           </p>
                           <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', color: '#EB1C24', margin: 0, lineHeight: '1.2' }}>
                             STATUS: {order.status}
                           </p>
                           {order.trackingNumber ? (
                             <div>
                               <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', color: '#000000', margin: 0, lineHeight: '1.2', transform: 'translateY(-1px)' }}>
                                 {order.trackingNumber}
                               </p>
                               <p style={{ fontFamily: '"Futura PT Demi", futuristic-pt, Futura, Inter, sans-serif', fontSize: '9px', color: '#909090', margin: 0, lineHeight: '1.2', transform: 'translateY(3px)' }}>
                                 TRACK VIA {order.trackingCarrier}
                               </p>
                             </div>
                           ) : (
                             <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', color: '#000000', margin: 0, lineHeight: '1.2' }}>
                               TRACKING LOADING
                             </p>
                           )}
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>

                {/* Scrolling Order Information - Bottom of card */}
                <div className="overflow-hidden mt-auto pt-2">
                  {/* Gray line separator */}
                  <div className="border-t border-gray-200" style={{ paddingTop: '2px', marginTop: '1px' }}></div>
                  <div 
                    ref={activeOrdersRef}
                    className="overflow-x-auto scrollbar-hide whitespace-nowrap"
                    style={{ scrollBehavior: 'auto' }}
                  >
                    {activeOrders.map((order, index) => (
                      <span key={order.id} className="text-[9px] text-left font-futura uppercase" style={{ fontWeight: '500', marginRight: '10px' }}>
                        <span className="text-black" style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' }}>
                          {order.orderNumber}:{' '}
                        </span>
                        <span className="font-futura" style={{ fontWeight: '515', color: order.status === 'SHIPPED' ? '#EB1C24' : '#909090' }}>
                          {order.status}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Past Orders Card */}
              <div className="bg-white/60 backdrop-blur-sm border border-black p-4 min-h-[340px] flex flex-col overflow-hidden shadow-lg transition-all duration-300 ease-out" style={{ borderWidth: '1.3px' }}>
                {/* Header */}
                <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200">
                  <button
                    className="text-red-500 font-bold text-lg tracking-wider truncate hover:text-red-600 transition-colors text-left uppercase"
                    style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '12px' }}
                  >
                    ARCHIVED ORDERS
                  </button>
                  <span
                    className="text-black font-bold text-lg flex-shrink-0 ml-2 uppercase"
                    style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', fontSize: '17px' }}
                  >
                    {pastOrders.length}
                  </span>
                </div>

                 {/* Body */}
                 <div className="flex-1 flex flex-col overflow-hidden mt-2">
                   {/* Mannequin Thumbnails with order context - stacked vertically, left aligned */}
                   <div className="flex flex-col justify-start items-start gap-4 my-2 flex-shrink-0">
                     {pastOrders.slice(0, 2).map((order) => (
                       <div key={order.id} className="flex items-center gap-3" style={{ flexShrink: 0 }}>
                         {/* Thumbnail */}
                         <div className="flex flex-col items-center" style={{ flexShrink: 0 }}>
                           <button
                             onClick={() => navigate(getProductRoute(order.productName))}
                             style={{
                               background: 'none',
                               border: 'none',
                               padding: 0,
                               cursor: 'pointer'
                             }}
                           >
                             <img
                               src={order.productImage}
                               alt={order.productName}
                               style={{
                                 width: '102px',
                                 height: '102px',
                                 objectFit: 'contain'
                               }}
                             />
                           </button>
                           <p
                             style={{
                               fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                               color: '#EB1C24',
                               fontSize: '12px',
                               margin: '2px 0 0 0',
                               textTransform: 'uppercase'
                             }}
                           >
                             {order.items} {order.items === 1 ? 'ITEM' : 'ITEMS'}
                           </p>
                         </div>
                         
                         {/* Order Context Text */}
                         <div className="flex flex-col gap-1" style={{ flexShrink: 0, transform: 'translateY(-6px)' }}>
                           <p style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', fontSize: '13px', color: '#000000', margin: 0, lineHeight: '1.2' }}>
                             {order.date}
                           </p>
                           <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', color: '#EB1C24', margin: 0, lineHeight: '1.2' }}>
                             {order.orderNumber}
                           </p>
                           <p style={{ fontFamily: '"Futura PT Demi", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', color: '#909090', margin: 0, lineHeight: '1.2' }}>
                             {formatPrice(order.total)} {selectedCurrency}
                           </p>
                           <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', color: '#EB1C24', margin: 0, lineHeight: '1.2' }}>
                             STATUS: {order.status}
                           </p>
                           {order.trackingNumber ? (
                             <div>
                               <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', color: '#000000', margin: 0, lineHeight: '1.2', transform: 'translateY(-1px)' }}>
                                 {order.trackingNumber}
                               </p>
                               <p style={{ fontFamily: '"Futura PT Demi", futuristic-pt, Futura, Inter, sans-serif', fontSize: '9px', color: '#909090', margin: 0, lineHeight: '1.2', transform: 'translateY(3px)' }}>
                                 TRACK VIA {order.trackingCarrier}
                               </p>
                             </div>
                           ) : (
                             <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', color: '#000000', margin: 0, lineHeight: '1.2' }}>
                               TRACKING LOADING
                             </p>
                           )}
                         </div>
                       </div>
                     ))}
                   </div>
                </div>

                {/* Scrolling Order Information - Bottom of card */}
                <div className="overflow-hidden mt-auto pt-2 flex flex-col">
                  {/* Gray line separator */}
                  <div className="border-t border-gray-200" style={{ paddingTop: '2px' }}></div>
                  <div 
                    ref={pastOrdersRef}
                    className="overflow-x-auto scrollbar-hide whitespace-nowrap"
                    style={{ scrollBehavior: 'auto', transform: 'translateY(-1px)' }}
                  >
                      {pastOrders.map((order, index) => (
                        <span key={order.id} className="text-[9px] text-left font-futura uppercase" style={{ fontWeight: '500', marginRight: '10px' }}>
                          <span className="text-black" style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' }}>
                            {order.orderNumber}:{' '}
                          </span>
                          <span className="font-futura" style={{ fontWeight: '515', color: order.status === 'SHIPPED' ? '#EB1C24' : '#909090' }}>
                            {order.status}
                          </span>
                        </span>
                      ))}
                  </div>
                  
                  {/* Gray line separator */}
                  <div className="border-t border-gray-200" style={{ paddingTop: '2px', marginTop: '3px' }}></div>
                  
                  {/* Second scrolling line - Review/Points info in red */}
                  <div 
                    ref={pastOrdersReviewRef}
                    className="overflow-x-auto scrollbar-hide whitespace-nowrap"
                    style={{ scrollBehavior: 'auto' }}
                  >
                      {pastOrders.map((order, index) => (
                        order.reviewInfo && (
                          <span key={`${order.id}-review`} className="text-[9px] text-left font-futura uppercase" style={{ fontWeight: '500', marginRight: '10px' }}>
                            <span style={{ color: '#000000', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' }}>
                              {order.orderNumber}:{' '}
                            </span>
                            <span style={{ color: '#EB1C24' }}>
                              {order.reviewInfo}
                            </span>
                          </span>
                        )
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

export default OrdersPage;
