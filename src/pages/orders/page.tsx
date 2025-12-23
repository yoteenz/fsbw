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
  deliveredAt?: number; // Timestamp when order was delivered (for 48-hour archive logic)
  placedAt?: number; // Timestamp when order was placed (for 24-hour authorization countdown)
  canceledAt?: number; // Timestamp when order was canceled (for 24-hour archive logic)
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

  // Helper function to format date as MM-DD-YYYY
  const formatDate = (date: Date): string => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  };

  // Helper function to get a date X days ago
  const getDateDaysAgo = (daysAgo: number): string => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return formatDate(date);
  };

  // Helper function to get a timestamp X hours ago
  const getTimestampHoursAgo = (hoursAgo: number): number => {
    return Date.now() - (hoursAgo * 60 * 60 * 1000);
  };

  // Helper function to format countdown time
  const formatCountdown = (remainingMs: number): string => {
    if (remainingMs <= 0) return '0 HOURS REMAINING';
    
    const hours = Math.floor(remainingMs / (60 * 60 * 1000));
    
    return `${hours} HOUR${hours !== 1 ? 'S' : ''} REMAINING`;
  };

  // Helper function to get remaining time for authorization
  const getAuthorizationRemainingTime = (placedAt: number): number => {
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const elapsed = Date.now() - placedAt;
    return Math.max(0, twentyFourHours - elapsed);
  };

  // Sample order data
  const [activeOrders, setActiveOrders] = useState<Order[]>([
    {
      id: '1',
      orderNumber: 'ORDER #237',
      date: getDateDaysAgo(2), // 2 days ago
      status: 'PLACED',
      productName: 'NOIR',
      productImage: getProductImage('NOIR'),
      total: 740,
      items: 1,
      trackingNumber: undefined,
      trackingCarrier: undefined,
      placedAt: getTimestampHoursAgo(2) // Placed 2 hours ago
    },
    {
      id: '2',
      orderNumber: 'ORDER #239',
      date: getDateDaysAgo(5), // 5 days ago
      status: 'CONFIRMED',
      productName: 'BLANCO',
      productImage: getProductImage('BLANCO'),
      total: 1640,
      items: 2,
      trackingNumber: undefined,
      trackingCarrier: undefined
    },
    {
      id: '3',
      orderNumber: 'ORDER #241',
      date: getDateDaysAgo(8), // 8 days ago
      status: 'PROCESSING',
      productName: 'NOIR',
      productImage: getProductImage('NOIR'),
      total: 2220,
      items: 3,
      trackingNumber: undefined,
      trackingCarrier: undefined
    },
    {
      id: '4',
      orderNumber: 'ORDER #242',
      date: getDateDaysAgo(12), // 12 days ago
      status: 'SHIPPED',
      productName: 'BLANCO',
      productImage: getProductImage('BLANCO'),
      total: 1640,
      items: 2,
      trackingNumber: '9400136106023046913338',
      trackingCarrier: 'DHL'
    },
    {
      id: '8',
      orderNumber: 'ORDER #240',
      date: getDateDaysAgo(3), // 3 days ago
      status: 'CANCELED',
      productName: 'SOFT CURL',
      productImage: getProductImage('SOFT CURL'),
      total: 780,
      items: 1,
      trackingNumber: undefined,
      trackingCarrier: undefined,
      placedAt: getTimestampHoursAgo(50), // Placed 50 hours ago (expired)
      canceledAt: getTimestampHoursAgo(12) // Canceled 12 hours ago (still in active, not archived yet)
    },
    {
      id: '9',
      orderNumber: 'ORDER #238',
      date: getDateDaysAgo(4), // 4 days ago
      status: 'CANCELED',
      productName: 'BEACH WAVE',
      productImage: getProductImage('BEACH WAVE'),
      total: 1520,
      items: 2,
      trackingNumber: undefined,
      trackingCarrier: undefined,
      placedAt: getTimestampHoursAgo(52), // Placed 52 hours ago (expired)
      canceledAt: getTimestampHoursAgo(18) // Canceled 18 hours ago (still in active, not archived yet)
    }
  ]);

  const [pastOrders, setPastOrders] = useState<Order[]>([
    {
      id: '10',
      orderNumber: 'ORDER #236',
      date: getDateDaysAgo(3), // 3 days ago
      status: 'CANCELED',
      productName: 'OCEAN CURL',
      productImage: getProductImage('OCEAN CURL'),
      total: 1560,
      items: 2,
      trackingNumber: undefined,
      trackingCarrier: undefined,
      placedAt: getTimestampHoursAgo(72), // Placed 72 hours ago (expired)
      canceledAt: getTimestampHoursAgo(30) // Canceled 30 hours ago (archived after 24 hours)
    },
    {
      id: '5',
      orderNumber: 'ORDER #243',
      date: getDateDaysAgo(25), // 25 days ago
      status: 'DELIVERED',
      productName: 'NOIR',
      productImage: getProductImage('NOIR'),
      total: 2220,
      items: 3,
      reviewInfo: 'REVIEW NEEDED',
      trackingNumber: '9400136106023046913326',
      trackingCarrier: 'FEDEX',
      deliveredAt: Date.now() - (30 * 60 * 60 * 1000) // Delivered 30 hours ago (archived but still shows in active for 48 hours)
    },
    {
      id: '4',
      orderNumber: 'ORDER #234',
      date: getDateDaysAgo(42), // 42 days ago
      status: 'DELIVERED',
      productName: 'NOIR',
      productImage: getProductImage('NOIR'),
      total: 1480,
      items: 2,
      reviewInfo: 'REVIEW NEEDED',
      trackingNumber: '9400136106023046913338',
      trackingCarrier: 'DHL'
    },
    {
      id: '5',
      orderNumber: 'ORDER #233',
      date: getDateDaysAgo(58), // 58 days ago
      status: 'DELIVERED',
      productName: 'SOFT CURL',
      productImage: getProductImage('SOFT CURL'),
      total: 780,
      items: 1,
      reviewInfo: 'POINTS TO EARN',
      trackingNumber: '9400136106023046913326',
      trackingCarrier: 'FEDEX'
    },
    {
      id: '6',
      orderNumber: 'ORDER #232',
      date: getDateDaysAgo(75), // 75 days ago
      status: 'DELIVERED',
      productName: 'BLANCO',
      productImage: getProductImage('BLANCO'),
      total: 820,
      items: 1,
      reviewInfo: 'REVIEW NEEDED',
      trackingNumber: '9400136106023046913338',
      trackingCarrier: 'DHL'
    },
    {
      id: '7',
      orderNumber: 'ORDER #231',
      date: getDateDaysAgo(92), // 92 days ago
      status: 'DELIVERED',
      productName: 'NOIR',
      productImage: getProductImage('NOIR'),
      total: 740,
      items: 1,
      reviewInfo: 'POINTS TO EARN',
      trackingNumber: '9400136106023046913326',
      trackingCarrier: 'FEDEX'
    }
  ]);

  // Refs for auto-scrolling
  const activeOrdersRef = useRef<HTMLDivElement>(null);
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

  // State for forcing re-render to update countdown
  const [_countdownTick, setCountdownTick] = useState(0);

  // Update countdown display every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdownTick(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Auto-cancel PLACED orders after 24 hours if authorization form not signed
  useEffect(() => {
    const checkAndCancelExpired = () => {
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

      setActiveOrders(prevActive => {
        return prevActive.map(order => {
          if (order.status === 'PLACED' && order.placedAt) {
            const timeSincePlaced = now - order.placedAt;
            if (timeSincePlaced >= twentyFourHours) {
              // Cancel order and issue refund
              return {
                ...order,
                status: 'CANCELED',
                canceledAt: now // Set cancellation timestamp
              };
            }
          }
          return order;
        });
      });
    };

    // Check immediately
    checkAndCancelExpired();

    // Check every minute
    const interval = setInterval(checkAndCancelExpired, 60000);

    return () => clearInterval(interval);
  }, []);


  // Auto-archive delivered and canceled orders after 24 hours
  // If there are no active orders (excluding delivered), archive all delivered orders immediately
  useEffect(() => {
    const checkAndArchive = () => {
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

      setActiveOrders(prevActive => {
        const toArchive: Order[] = [];
        const toKeep: Order[] = [];

        // Check if there are any non-delivered active orders
        const hasNonDeliveredOrders = prevActive.some(order => order.status !== 'DELIVERED');

        prevActive.forEach(order => {
          // Archive DELIVERED orders after 24 hours OR immediately if no other active orders
          if (order.status === 'DELIVERED' && order.deliveredAt) {
            const timeSinceDelivered = now - order.deliveredAt;
            // Archive immediately if no other active orders, otherwise wait 24 hours
            if (!hasNonDeliveredOrders || timeSinceDelivered >= twentyFourHours) {
              // Move to archived
              toArchive.push(order);
            } else {
              toKeep.push(order);
            }
          }
          // Archive CANCELED orders after 24 hours
          else if (order.status === 'CANCELED' && order.canceledAt) {
            const timeSinceCanceled = now - order.canceledAt;
            if (timeSinceCanceled >= twentyFourHours) {
              // Move to archived after 24 hours
              toArchive.push(order);
            } else {
              toKeep.push(order);
            }
          } else {
            toKeep.push(order);
          }
        });

        if (toArchive.length > 0) {
          setPastOrders(prevPast => [...prevPast, ...toArchive]);
        }

        return toKeep;
      });
    };

    // Check immediately
    checkAndArchive();

    // Check every hour
    const interval = setInterval(checkAndArchive, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    const currency = currencyRates[selectedCurrency as keyof typeof currencyRates];
    if (!currency) {
      const formatted = price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
      return `$${formatted}`;
    }
    const convertedPrice = price * currency.rate;
    const formattedPrice = convertedPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    return `${currency.symbol.replace('&#36;', '$').replace('&euro;', '€').replace('&pound;', '£').replace('&yen;', '¥').replace('&#8377;', '₹')}${formattedPrice}`;
  };

  const handleMobileMenuToggle = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const handleCloseMobileMenu = () => {
    setShowMobileMenu(false);
  };

  return (
    <div className="min-h-screen" style={{ position: 'relative' }}>
      {/* Marble Background */}
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
                    style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '400' }}
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
                    style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '400' }}
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
                  <path d="M0 0H15.75V0.7H7.875H0V0ZM5.25 6.7H10.5H15.375V7.4H10.5H5.25V6.7ZM0 13.1H15.75V13.8H0V13.1Z" fill="black"/>
                </svg>
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
            <div className="bg-white/60 backdrop-blur-sm border border-black p-4 min-h-[360px] flex flex-col overflow-hidden shadow-lg transition-all duration-300 ease-out" style={{ borderWidth: '1.3px' }}>
                {/* Header */}
                <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200">
                  <button
                    className="text-red-500 font-bold text-lg tracking-wider truncate hover:text-red-600 transition-colors text-left uppercase"
                    style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '12px', fontWeight: '500' }}
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
                   {activeOrders.length === 0 ? (
                     <div className="flex flex-col justify-center items-center my-2 flex-shrink-0" style={{ minHeight: '200px' }}>
                       <p
                         style={{
                           fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                           fontSize: '12px',
                           color: '#909090',
                           margin: 0,
                           textTransform: 'uppercase',
                           textAlign: 'center',
                           lineHeight: '1.4'
                         }}
                       >
                         YOU HAVE NO ACTIVE ORDERS.<br />LET'S GO SHOPPING!
                       </p>
                     </div>
                   ) : (
                   <div className="flex flex-col justify-start items-start gap-4 my-2 flex-shrink-0 overflow-y-auto" style={{ maxHeight: '265px', scrollBehavior: 'smooth' }}>
                     {activeOrders.map((order) => (
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
                           <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', margin: 0, lineHeight: '1.2' }}>
                             <span style={{ color: '#EB1C24' }}>STATUS: </span>
                             <span style={{ 
                               color: (order.status === 'CONFIRMED' || order.status === 'SHIPPED' || order.status === 'DELIVERED' || order.status === 'CANCELED') ? '#EB1C24' : '#909090',
                               fontFamily: (order.status === 'CONFIRMED' || order.status === 'SHIPPED' || order.status === 'DELIVERED' || order.status === 'CANCELED') ? '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' : '"Futura PT Demi", futuristic-pt, Futura, Inter, sans-serif'
                             }}>{order.status}</span>
                           </p>
                           {order.status === 'PLACED' && order.placedAt && (
                             <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', margin: 0, lineHeight: '1.2' }}>
                               <span style={{ color: '#000000' }}>CLICK </span>
                               <span style={{ color: '#EB1C24' }}>HERE</span>
                               <span style={{ color: '#000000' }}> TO SIGN ORDER FORM</span>
                             </p>
                           )}
                           {order.trackingNumber ? (
                             <div>
                               <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10.5px', color: '#000000', margin: 0, lineHeight: '1.2', transform: 'translateY(-1px)' }}>
                                 {order.trackingNumber}
                               </p>
                               <p style={{ fontFamily: '"Futura PT Demi", futuristic-pt, Futura, Inter, sans-serif', fontSize: '9px', color: '#909090', margin: 0, lineHeight: '1.2', transform: 'translateY(3px)' }}>
                                 TRACK VIA {order.trackingCarrier}
                               </p>
                             </div>
                           ) : order.status !== 'PLACED' && order.status !== 'CANCELED' ? (
                             <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', color: '#000000', margin: 0, lineHeight: '1.2' }}>
                               TRACKING LOADING
                             </p>
                           ) : null}
                         </div>
                       </div>
                     ))}
                   </div>
                   )}
                 </div>

                {/* Scrolling Order Information - Bottom of card */}
                {activeOrders.length > 0 && (
                <div className="overflow-hidden mt-auto pt-2">
                  {/* Gray line separator */}
                  <div className="border-t border-gray-200" style={{ paddingTop: '2px', marginTop: '1px' }}></div>
                  <div 
                    ref={activeOrdersRef}
                    className="overflow-x-auto scrollbar-hide whitespace-nowrap"
                    style={{ scrollBehavior: 'auto' }}
                  >
                    {(() => {
                      const now = Date.now();
                      const fortyEightHours = 48 * 60 * 60 * 1000; // 48 hours in milliseconds
                      
                      // Get all orders to display: active orders + archived orders delivered within 48 hours
                      // Only show archived delivered orders if there are active orders
                      const ordersToDisplay: Order[] = [];
                      const hasNonDeliveredActiveOrders = activeOrders.some(order => order.status !== 'DELIVERED');
                      
                      // Add active orders
                      activeOrders.forEach(order => {
                        ordersToDisplay.push(order);
                      });
                      
                      // Add archived orders that were delivered within 48 hours (only if there are active orders)
                      if (hasNonDeliveredActiveOrders) {
                        pastOrders.forEach(order => {
                          if (order.status === 'DELIVERED' && order.deliveredAt) {
                            const timeSinceDelivered = now - order.deliveredAt;
                            if (timeSinceDelivered < fortyEightHours) {
                              ordersToDisplay.push(order);
                            }
                          }
                        });
                      }
                      
                      return ordersToDisplay.map((order, _index) => {
                        // For delivered orders, only show "DELIVERED" status, hide all other statuses
                        if (order.status === 'DELIVERED') {
                          return (
                            <span key={order.id} className="text-[9px] text-left font-futura uppercase" style={{ fontWeight: '500', marginRight: '10px' }}>
                              <span className="text-black" style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' }}>
                                {order.orderNumber}:{' '}
                              </span>
                              <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' }}>
                                DELIVERED
                              </span>
                            </span>
                          );
                        }
                        // For PLACED orders, show countdown in scrolling text
                        if (order.status === 'PLACED' && order.placedAt) {
                          return (
                            <span key={order.id} className="text-[9px] text-left font-futura uppercase" style={{ fontWeight: '500', marginRight: '10px' }}>
                              <span className="text-black" style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' }}>
                                {order.orderNumber}:{' '}
                              </span>
                              <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' }}>
                                {formatCountdown(getAuthorizationRemainingTime(order.placedAt))}
                              </span>
                            </span>
                          );
                        }
                        // For CANCELED orders, show in red Futura PT Medium
                        if (order.status === 'CANCELED') {
                          return (
                            <span key={order.id} className="text-[9px] text-left font-futura uppercase" style={{ fontWeight: '500', marginRight: '10px' }}>
                              <span className="text-black" style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' }}>
                                {order.orderNumber}:{' '}
                              </span>
                              <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' }}>
                                {order.status}
                              </span>
                            </span>
                          );
                        }
                        // For non-delivered orders, show their current status
                        return (
                          <span key={order.id} className="text-[9px] text-left font-futura uppercase" style={{ fontWeight: '500', marginRight: '10px' }}>
                            <span className="text-black" style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' }}>
                              {order.orderNumber}:{' '}
                            </span>
                            <span style={{ 
                              color: (order.status === 'CONFIRMED' || order.status === 'SHIPPED') ? '#EB1C24' : '#909090',
                              fontFamily: (order.status === 'CONFIRMED' || order.status === 'SHIPPED') ? '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' : '"Futura PT Demi", futuristic-pt, Futura, Inter, sans-serif'
                            }}>
                              {order.status}
                            </span>
                          </span>
                        );
                      });
                    })()}
                  </div>
                </div>
                )}
              </div>

              {/* Past Orders Card */}
              <div className="bg-white/60 backdrop-blur-sm border border-black p-4 min-h-[360px] flex flex-col overflow-hidden shadow-lg transition-all duration-300 ease-out" style={{ borderWidth: '1.3px' }}>
                {/* Header */}
                <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200">
                  <button
                    className="text-red-500 font-bold text-lg tracking-wider truncate hover:text-red-600 transition-colors text-left uppercase"
                    style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '12px', fontWeight: '500' }}
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
                   <div className="flex flex-col justify-start items-start gap-4 my-2 flex-shrink-0 overflow-y-auto" style={{ maxHeight: '265px', scrollBehavior: 'smooth' }}>
                     {pastOrders.map((order) => (
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
                           <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', margin: 0, lineHeight: '1.2' }}>
                             <span style={{ color: '#EB1C24' }}>STATUS: </span>
                             <span style={{ 
                               color: (order.status === 'CONFIRMED' || order.status === 'SHIPPED' || order.status === 'DELIVERED' || order.status === 'CANCELED') ? '#EB1C24' : '#909090',
                               fontFamily: (order.status === 'CONFIRMED' || order.status === 'SHIPPED' || order.status === 'DELIVERED' || order.status === 'CANCELED') ? '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' : '"Futura PT Demi", futuristic-pt, Futura, Inter, sans-serif'
                             }}>{order.status}</span>
                           </p>
                           {order.trackingNumber ? (
                             <div>
                               <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10.5px', color: '#000000', margin: 0, lineHeight: '1.2', transform: 'translateY(-1px)' }}>
                                 {order.trackingNumber}
                               </p>
                               <p style={{ fontFamily: '"Futura PT Demi", futuristic-pt, Futura, Inter, sans-serif', fontSize: '9px', color: '#909090', margin: 0, lineHeight: '1.2', transform: 'translateY(3px)' }}>
                                 TRACK VIA {order.trackingCarrier}
                               </p>
                             </div>
                           ) : order.status !== 'PLACED' && order.status !== 'CANCELED' ? (
                             <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', color: '#000000', margin: 0, lineHeight: '1.2' }}>
                               TRACKING LOADING
                             </p>
                           ) : null}
                         </div>
                       </div>
                     ))}
                   </div>
                </div>

                {/* Scrolling Order Information - Bottom of card */}
                <div className="overflow-hidden mt-auto pt-2">
                  {/* Gray line separator */}
                  <div className="border-t border-gray-200" style={{ paddingTop: '2px', marginTop: '1px' }}></div>
                  
                  {/* Review/Points info in red */}
                  <div 
                    ref={pastOrdersReviewRef}
                    className="overflow-x-auto scrollbar-hide whitespace-nowrap"
                    style={{ scrollBehavior: 'auto' }}
                  >
                      {pastOrders.map((order, _index) => (
                        order.reviewInfo && (
                          <span key={`${order.id}-review`} className="text-[9px] text-left font-futura uppercase" style={{ fontWeight: '500', marginRight: '10px' }}>
                            <span style={{ color: '#000000', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' }}>
                              {order.orderNumber}:{' '}
                            </span>
                            <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' }}>
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
