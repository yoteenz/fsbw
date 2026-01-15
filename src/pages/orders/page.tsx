import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DynamicCartIcon from '../../components/DynamicCartIcon';
import ConfirmationModal from '../../components/ConfirmationModal';

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
  orderFormSigned?: boolean; // Whether the order form has been signed
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
  const [isSignedIn, setIsSignedIn] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('isSignedIn') === 'true';
      } catch (e) {
        return false;
      }
    }
    return false;
  });
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  
  // Get current user data
  const [currentUser, setCurrentUser] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      try {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  
  // Helper function to check if current user is Kristin Watson (mock account)
  const isKristinWatson = () => {
    const user = currentUser;
    const signedIn = typeof window !== 'undefined' ? localStorage.getItem('isSignedIn') === 'true' : false;
    // Show mock orders only for Kristin Watson (bruno203@gmail.com) or when not signed in (default mock state)
    return user?.email?.toLowerCase() === 'bruno203@gmail.com' || (!user && !signedIn);
  };

  // Helper function to check if current user is Kateena Armstrong (mock account)
  const isKateenaArmstrong = () => {
    const user = currentUser;
    if (!user) return false;
    const firstName = user.firstName?.toLowerCase() || '';
    const lastName = user.lastName?.toLowerCase() || '';
    const email = user.email?.toLowerCase() || '';
    // Check if user is Kateena Armstrong by name or email
    return (firstName === 'kateena' && lastName === 'armstrong') || 
           email.includes('kateena') || 
           email.includes('armstrong');
  };

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

  // Mock order data (only for Kristin Watson)
  const mockActiveOrders: Order[] = [
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
      id: '10',
      orderNumber: 'ORDER #244',
      date: getDateDaysAgo(1), // 1 day ago
      status: 'PLACED',
      productName: 'SOFT WAVE',
      productImage: getProductImage('SOFT WAVE'),
      total: 980,
      items: 1,
      trackingNumber: undefined,
      trackingCarrier: undefined,
      placedAt: getTimestampHoursAgo(3), // Placed 3 hours ago
      orderFormSigned: true // Order form has been signed
    },
    {
      id: '3',
      orderNumber: 'ORDER #241',
      date: getDateDaysAgo(8), // 8 days ago
      status: 'PREPARING',
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
      id: '11',
      orderNumber: 'ORDER #245',
      date: getDateDaysAgo(6), // 6 days ago
      status: 'SHIPPED',
      productName: 'SOFT CURL',
      productImage: getProductImage('SOFT CURL'),
      total: 1200,
      items: 1,
      trackingNumber: undefined,
      trackingCarrier: undefined
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
  ];

  const mockPastOrders: Order[] = [
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
  ];

  // Helper function to get user's actual orders from localStorage
  const getUserOrders = (): { activeOrders: Order[], pastOrders: Order[] } => {
    if (typeof window === 'undefined' || !currentUser) {
      return { activeOrders: [], pastOrders: [] };
    }

    try {
      const userOrdersKey = `userOrders_${currentUser.email}`;
      const storedOrders = localStorage.getItem(userOrdersKey);
      if (storedOrders) {
        const orders = JSON.parse(storedOrders);
        return {
          activeOrders: orders.activeOrders || [],
          pastOrders: orders.pastOrders || []
        };
      }
    } catch (e) {
      console.error('Error loading user orders:', e);
    }

    return { activeOrders: [], pastOrders: [] };
  };

  // Mock order data for Kateena Armstrong (ORDER #344 tracking)
  // ORDER #344 progression: Confirmed (1 week ago) -> Shipped (2 days ago) -> Delivered (yesterday)
  const kateenaMockActiveOrders: Order[] = [
    {
      id: 'kateena-1',
      orderNumber: 'ORDER #344',
      date: getDateDaysAgo(7), // 1 week ago (confirmed)
      status: 'DELIVERED',
      productName: 'NOIR',
      productImage: getProductImage('NOIR'),
      total: 1640,
      items: 2,
      reviewInfo: 'REVIEW NEEDED',
      trackingNumber: '9400136106023046913440',
      trackingCarrier: 'DHL',
      deliveredAt: getTimestampHoursAgo(24), // Delivered yesterday (24 hours ago)
      placedAt: getTimestampHoursAgo(7 * 24) // Placed 1 week ago
    },
    {
      id: 'kateena-2',
      orderNumber: 'ORDER #345',
      date: getDateDaysAgo(3), // 3 days ago
      status: 'SHIPPED',
      productName: 'BLANCO',
      productImage: getProductImage('BLANCO'),
      total: 820,
      items: 1,
      trackingNumber: '9400136106023046913441',
      trackingCarrier: 'FEDEX',
      placedAt: getTimestampHoursAgo(3 * 24) // Placed 3 days ago
    },
    {
      id: 'kateena-3',
      orderNumber: 'ORDER #346',
      date: getDateDaysAgo(1), // 1 day ago
      status: 'PREPARING',
      productName: 'SOFT WAVE',
      productImage: getProductImage('SOFT WAVE'),
      total: 980,
      items: 1,
      trackingNumber: undefined,
      trackingCarrier: undefined,
      placedAt: getTimestampHoursAgo(24) // Placed 1 day ago
    }
  ];

  const kateenaMockPastOrders: Order[] = [
    // Past orders can be added here if needed
  ];

  // Get orders based on user - show mock orders for Kristin Watson or Kateena Armstrong, otherwise show user's actual orders
  const getUserOrdersData = () => {
    if (isKristinWatson()) {
      return {
        activeOrders: mockActiveOrders,
        pastOrders: mockPastOrders
      };
    } else if (isKateenaArmstrong()) {
      return {
        activeOrders: kateenaMockActiveOrders,
        pastOrders: kateenaMockPastOrders
      };
    } else {
      return getUserOrders();
    }
  };

  const [activeOrders, setActiveOrders] = useState<Order[]>(() => {
    return getUserOrdersData().activeOrders;
  });

  const [pastOrders, setPastOrders] = useState<Order[]>(() => {
    return getUserOrdersData().pastOrders;
  });

  // Refs for auto-scrolling
  const activeOrdersRef = useRef<HTMLDivElement>(null);
  const pastOrdersReviewRef = useRef<HTMLDivElement>(null);

  // Update orders when user changes
  useEffect(() => {
    const updateUser = () => {
      try {
        const user = localStorage.getItem('currentUser');
        const parsedUser = user ? JSON.parse(user) : null;
        setCurrentUser(parsedUser);
        
        // Update orders based on current user
        const ordersData = getUserOrdersData();
        setActiveOrders(ordersData.activeOrders);
        setPastOrders(ordersData.pastOrders);
      } catch (e) {
        console.error('Error updating user:', e);
      }
    };

    // Initial update
    updateUser();

    // Listen for sign in/out events
    window.addEventListener('signInStateChanged', updateUser);
    window.addEventListener('storage', updateUser);
    window.addEventListener('focus', updateUser);

    return () => {
      window.removeEventListener('signInStateChanged', updateUser);
      window.removeEventListener('storage', updateUser);
      window.removeEventListener('focus', updateUser);
    };
  }, []);

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
    // Only initialize scrolling when menu is closed and no order is expanded
    if (showMobileMenu || expandedOrderId) {
      return;
    }

    const scrollElements = [
      { ref: activeOrdersRef, content: activeOrders.length > 0 ? 'active' : null },
      { ref: pastOrdersReviewRef, content: pastOrders.some(o => o.reviewInfo) ? 'pastReview' : null }
    ];

    const intervals: ReturnType<typeof setTimeout>[] = [];
    const manualScrollTimeouts: ReturnType<typeof setTimeout>[] = [];
    const isManuallyScrolling: { [key: string]: boolean } = {};
    const eventListeners: Array<{ element: HTMLElement; event: string; handler: () => void }> = [];

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
            
            eventListeners.push(
              { element, event: 'scroll', handler: handleManualScroll },
              { element, event: 'touchstart', handler: handleManualScroll },
              { element, event: 'mousedown', handler: handleManualScroll }
            );

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
      eventListeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
      });
    };
  }, [activeOrders, pastOrders, showMobileMenu, expandedOrderId]);

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
          // Only auto-cancel PLACED orders that haven't been signed
          if (order.status === 'PLACED' && order.placedAt && !order.orderFormSigned) {
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
    if (isSignedIn) {
      // Show confirmation modal when signing out
      setShowSignOutConfirm(true);
    } else {
      // Navigate to sign-in page
      navigate('/sign-in');
    }
  };

  const handleSignOut = () => {
    setIsSignedIn(false);
    localStorage.setItem('isSignedIn', 'false');
    localStorage.removeItem('currentUser');
    // Dispatch custom event to update other pages in same tab
    window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'false' }));
    setShowSignOutConfirm(false);
    // Close mobile menu
    setShowMobileMenu(false);
    // Navigate to sign-in page
    navigate('/sign-in');
  };

  // Sync isSignedIn state with localStorage and sign-in events
  useEffect(() => {
    const handleSignInStateChange = (event: CustomEvent) => {
      setIsSignedIn(event.detail === 'true');
    };

    window.addEventListener('signInStateChanged', handleSignInStateChange as EventListener);

    return () => {
      window.removeEventListener('signInStateChanged', handleSignInStateChange as EventListener);
    };
  }, []);

  // Update mobile menu active tab based on current pathname when menu opens
  useEffect(() => {
    if (showMobileMenu) {
      const pathname = window.location.pathname;
      if (pathname.includes('/tools') || pathname === '/tools/gift-card') {
        setMobileMenuActiveTab('TOOLS');
      } else if (pathname.includes('/brand') || pathname.includes('/about') || pathname.includes('/contact') || pathname.includes('/faq') || pathname.includes('/reviews') || pathname.includes('/terms')) {
        setMobileMenuActiveTab('BRAND');
      } else {
        setMobileMenuActiveTab('SHOP');
      }
    }
  }, [showMobileMenu]);

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
                  <button 
                    onClick={() => navigate(isSignedIn ? '/account' : '/sign-in')}
                    className="cursor-pointer" 
                    style={{ height: '15px !important', width: '21px !important', padding: '0 !important', border: 'none !important', background: 'none !important', transform: 'translateX(4px)' }}
                  >
                    <img
                      alt="Account icon"
                      width="16"
                      height="16"
                      src="/assets/NOIR/account-icon.svg"
                    />
                  </button>
                  <button 
                    onClick={() => navigate(isSignedIn ? '/wishlist' : '/sign-in')} 
                    className="cursor-pointer"
                    style={{ height: '21px !important', width: '21px !important', padding: '0 !important', border: 'none !important', background: 'none !important', transform: 'translateX(2px)' }}
                  >
                    <img
                      alt="Wishlist"
                      width="18"
                      height="18"
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
            <div className="gap-5 flex absolute" style={{ right: '17px' }}>
              <div style={{ transform: 'translateX(5px)' }}>
                <DynamicCartIcon count={cartCount} width={22} height={19} />
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
                  <path d="M0 0H15.75V0.7H7.875H0V0ZM5.25 6.7H10.5H15.375V7.4H10.5H5.25V6.7ZM0 13.1H15.75V13.8H0V13.1Z" fill="black"/>
                </svg>
              </div>
            </div>
            </div>

          {/* CONTENT */}
          <div
            className="flex flex-col pb-4 mb-2 w-full"
            style={{ 
              minWidth: '100%', 
              maxWidth: 'none', 
              overflow: 'visible',
              minHeight: showMobileMenu ? '560px' : 'auto'
            }}
          >
            {showMobileMenu ? (
              /* MENU CONTENT */
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
                {/* Navigation Links */}
                <div className="flex justify-center gap-8" style={{ marginBottom: '30px' }}>
                  <button
                    onClick={() => handleMobileMenuTabClick('SHOP')}
                    style={{ 
                      fontFamily: mobileMenuActiveTab === 'SHOP' ? '"Futura PT Medium"' : '"Futura PT Book"',
                      fontSize: '14px',
                      color: mobileMenuActiveTab === 'SHOP' ? '#EB1C24' : 'black',
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      borderBottom: mobileMenuActiveTab === 'SHOP' ? '2px solid #EB1C24' : 'none',
                      borderTop: 'none',
                      borderLeft: 'none',
                      borderRight: 'none',
                      paddingBottom: '4px',
                      background: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    SHOP
                  </button>
                  <button
                    onClick={() => handleMobileMenuTabClick('TOOLS')}
                    style={{ 
                      fontFamily: mobileMenuActiveTab === 'TOOLS' ? '"Futura PT Medium"' : '"Futura PT Book"',
                      fontSize: '14px',
                      color: mobileMenuActiveTab === 'TOOLS' ? '#EB1C24' : 'black',
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      borderBottom: mobileMenuActiveTab === 'TOOLS' ? '2px solid #EB1C24' : 'none',
                      borderTop: 'none',
                      borderLeft: 'none',
                      borderRight: 'none',
                      paddingBottom: '4px',
                      background: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    TOOLS
                  </button>
                  <button
                    onClick={() => handleMobileMenuTabClick('BRAND')}
                    style={{ 
                      fontFamily: mobileMenuActiveTab === 'BRAND' ? '"Futura PT Medium"' : '"Futura PT Book"',
                      fontSize: '14px',
                      color: mobileMenuActiveTab === 'BRAND' ? '#EB1C24' : 'black',
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      borderBottom: mobileMenuActiveTab === 'BRAND' ? '2px solid #EB1C24' : 'none',
                      borderTop: 'none',
                      borderLeft: 'none',
                      borderRight: 'none',
                      paddingBottom: '4px',
                      background: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    BRAND
                  </button>
                </div>

                {/* Menu Items - Fixed height with scroll if needed */}
                <div style={{ flex: '1', overflowY: 'auto', marginBottom: '20px', minHeight: '0' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
                    {mobileMenuActiveTab === 'TOOLS' ? (
                      ['GIFT CARD'].map((item, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => navigate('/tools/gift-card')}
                        >
                          <span style={{ 
                            fontFamily: '"Futura PT Book"',
                            fontSize: '14px',
                            color: 'black',
                            fontWeight: '500',
                            textTransform: 'uppercase',
                            transform: 'translateX(7px)'
                          }}>
                            {item}
                          </span>
                        </div>
                      ))
                    ) : mobileMenuActiveTab === 'BRAND' ? (
                      ['ABOUT US', 'CONTACT', 'CARE & STORAGE', 'BECOME A MEMBER', 'FAQ', 'PAYMENT + SHIPPING', 'REVIEWS', 'TERMS OF SERVICE'].map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span style={{ 
                            fontFamily: '"Futura PT Book"',
                            fontSize: '14px',
                            color: 'black',
                            fontWeight: '500',
                            textTransform: 'uppercase',
                            transform: 'translateX(7px)'
                          }}>
                            {item}
                          </span>
                        </div>
                      ))
                    ) : (
                      // SHOP tab with dropdown functionality
                      [
                        { label: 'UNITS', hasArrow: true, isExpandable: true, subItems: ['STRAIGHT', 'WAVY', 'CURLY'] },
                        { label: 'BOOKING', hasArrow: true, isExpandable: true, subItems: ['APPOINTMENT', 'CONSULTATION'] },
                        { label: 'BUILD-A-WIG', hasArrow: false },
                        { label: 'ORDER AUTHORIZATION FORM', hasArrow: false }
                      ].map((item, index) => (
                        <div key={index}>
                          <div 
                            className="flex items-center justify-between"
                            style={{ alignItems: 'center' }}
                          >
                            <span 
                              style={{ 
                                fontFamily: '"Futura PT Book"',
                                fontSize: '14px',
                                color: 'black',
                                fontWeight: '500',
                                textTransform: 'uppercase',
                                cursor: 'pointer',
                                transform: 'translateX(7px)'
                              }}
                              onClick={() => {
                                if (item.isExpandable) {
                                  // If UNITS is already expanded, navigate to shop/units page
                                  if (item.label === 'UNITS' && mobileMenuExpandedItems.includes(item.label)) {
                                    navigate('/shop/units');
                                  } else {
                                    // Otherwise, toggle expansion
                                    handleMobileMenuItemToggle(item.label);
                                  }
                                } else if (item.label === 'ORDER AUTHORIZATION FORM') {
                                  navigate('/shop/order-form');
                                }
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
                                  if (item.isExpandable) {
                                    handleMobileMenuItemToggle(item.label);
                                  }
                                }}
                              />
                            )}
                          </div>
                          {item.isExpandable && mobileMenuExpandedItems.includes(item.label) && item.subItems && (
                            <div className="ml-4 mt-2 space-y-2">
                              {item.subItems.map((subItem, subIndex) => (
                                <div 
                                  key={subIndex} 
                                  className="flex items-center cursor-pointer"
                                  onClick={() => {
                                    if (subItem === 'STRAIGHT') {
                                      navigate('/units/straight');
                                    } else if (subItem === 'WAVY') {
                                      navigate('/units/wavy');
                                    } else if (subItem === 'CURLY') {
                                      navigate('/units/curly');
                                    }
                                  }}
                                >
                                  <span style={{ 
                                    fontFamily: '"Futura PT Book"',
                                    fontSize: '14px',
                                    color: '#EB1C24',
                                    fontWeight: '500',
                                    textTransform: 'uppercase'
                                  }}>
                                    {subItem}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
          </div>

                {/* Sign In/Out - Fixed at bottom */}
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

                {/* Social Media Icons - Fixed at bottom */}
                <div className="flex justify-center" style={{ marginBottom: '0' }}>
                  <div className="flex" style={{ gap: '19px' }}>
                    <img
                      src="/assets/instagram-icon.svg"
                      alt="Instagram"
                      style={{ width: '20px', height: '20px' }}
                    />
                    <img
                      src="/assets/twitter-icon.svg"
                      alt="Twitter"
                      style={{ width: '20px', height: '20px' }}
                    />
                    <img
                      src="/assets/facebook-icon.svg"
                      alt="Facebook"
                      style={{ width: '20px', height: '20px' }}
                    />
                  </div>
                </div>
                </div>
              </div>
            ) : (
              /* ORDERS CONTENT */
          <div className="flex flex-col gap-4 mb-5">
            {/* Active Orders Card - Hide when archived order is expanded */}
            {!(expandedOrderId && pastOrders.find(o => o.id === expandedOrderId)) && (
            <div className="bg-white/60 backdrop-blur-sm border border-black p-4 min-h-[360px] flex flex-col overflow-hidden shadow-lg transition-all duration-300 ease-out" style={{ borderWidth: '1.3px' }}>
                {/* Header */}
                <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200">
                  {expandedOrderId ? (
                    <>
                      <button
                        className="text-red-500 font-bold text-lg tracking-wider truncate hover:text-red-600 transition-colors text-left uppercase"
                        style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '12px', fontWeight: '500' }}
                      >
                        {(activeOrders.find(o => o.id === expandedOrderId) || pastOrders.find(o => o.id === expandedOrderId))?.orderNumber || 'ORDER'}
                      </button>
                      <button
                        onClick={() => setExpandedOrderId(null)}
                        style={{ 
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <img
                          src="/assets/close-icon.svg"
                          alt="Close"
                          style={{
                            width: '16px',
                            height: '16px',
                            filter: 'brightness(0) saturate(100%) invert(20%) sepia(93%) saturate(7151%) hue-rotate(349deg) brightness(92%) contrast(92%)'
                          }}
                        />
                      </button>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>

                 {/* Body */}
                 <div className="flex-1 flex flex-col overflow-hidden mt-2">
                   {expandedOrderId ? (
                     // Expanded Order View
                     (() => {
                       const expandedOrder = activeOrders.find(o => o.id === expandedOrderId) || pastOrders.find(o => o.id === expandedOrderId);
                       if (!expandedOrder) return null;
                       
                       // Create mock products array for horizontal scroll (based on order.items)
                       const orderProducts = Array.from({ length: expandedOrder.items }, (_, i) => ({
                         id: `${expandedOrder.id}-product-${i}`,
                         name: expandedOrder.productName,
                         image: expandedOrder.productImage,
                         price: expandedOrder.total / expandedOrder.items
                       }));
                       
                       return (
                         <div className="flex flex-col gap-6" style={{ marginTop: '10px' }}>
                           {/* Products Horizontal Scroll */}
                           <div 
                             className="relative overflow-x-auto"
                             style={{ 
                               height: '180px',
                               marginBottom: '20px'
                             }}
                           >
                             <div
                               className="flex"
                               style={{
                                 gap: '20px',
                                 height: '100%',
                                 alignItems: 'center',
                                 paddingRight: '10px'
                               }}
                             >
                              {orderProducts.map((product) => (
                                <div
                                  key={product.id}
                                  className="flex-shrink-0"
                                  style={{
                                     width: '150px',
                                     height: '150px',
                                     display: 'flex',
                                     flexDirection: 'column',
                                     alignItems: 'center',
                                     justifyContent: 'center',
                                     padding: '8px'
                                   }}
                                 >
                                   <img
                                     src={product.image}
                                     alt={product.name}
                                     onClick={() => navigate(getProductRoute(product.name))}
                                     style={{
                                       width: '120px',
                                       height: '120px',
                                       objectFit: 'contain',
                                       cursor: 'pointer'
                                     }}
                                   />
                                   <p
                                     style={{
                                       fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                                       fontSize: '16.8px',
                                       color: '#000000',
                                       marginTop: '4px',
                                       marginBottom: '0',
                                       textTransform: 'uppercase',
                                       textAlign: 'center',
                                       lineHeight: '1.2'
                                     }}
                                   >
                                     {product.name}
                                   </p>
                                 </div>
                               ))}
                             </div>
                           </div>
                           
                           {/* ORDER SUMMARY */}
                           <div style={{ marginBottom: '20px' }}>
                             <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '10px', marginTop: '-12px' }}>
                               <h2
                                 style={{
                                   fontFamily: '"Futura PT Medium"',
                                   fontSize: '12px',
                                   color: '#EB1C24',
                                   fontWeight: '500',
                                   textTransform: 'uppercase',
                                   margin: '0'
                                 }}
                               >
                                 ORDER SUMMARY
                               </h2>
                             </div>
                             <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                 <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>
                                   ORDER DATE
                                 </span>
                                 <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#909090', textTransform: 'uppercase' }}>
                                   {expandedOrder.date}
                                 </span>
                               </div>
                               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                 <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>
                                   ORDER TOTAL
                                 </span>
                                 <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#909090', textTransform: 'uppercase' }}>
                                   {formatPrice(expandedOrder.total)} {selectedCurrency}
                                 </span>
                               </div>
                               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                 <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>
                                   ORDER NUMBER
                                 </span>
                                 <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#909090', textTransform: 'uppercase' }}>
                                   {expandedOrder.orderNumber}
                                 </span>
                               </div>
                             </div>
                           </div>
                           
                           {/* SHIPPING */}
                           {currentUser && (
                             <div style={{ marginBottom: '20px' }}>
                               <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '10px', marginTop: '-12px' }}>
                                 <h2
                                   style={{
                                     fontFamily: '"Futura PT Medium"',
                                     fontSize: '12px',
                                     color: '#EB1C24',
                                     fontWeight: '500',
                                     textTransform: 'uppercase',
                                     margin: '0'
                                   }}
                                 >
                                   SHIPPING
                                 </h2>
                               </div>
                               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                 <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', margin: '0', textTransform: 'uppercase' }}>
                                   {currentUser.firstName || ''} {currentUser.lastName || ''}
                                 </p>
                                 <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', margin: '0', textTransform: 'uppercase' }}>
                                   {currentUser.defaultAddress?.address || currentUser.shippingAddress?.address || ''}
                                 </p>
                                 <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', margin: '0', textTransform: 'uppercase' }}>
                                   {currentUser.defaultAddress?.city || currentUser.shippingAddress?.city || ''}, {currentUser.defaultAddress?.state || currentUser.shippingAddress?.state || ''} {currentUser.defaultAddress?.zip || currentUser.shippingAddress?.zip || ''}
                                 </p>
                                 <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', margin: '0', textTransform: 'uppercase' }}>
                                   {currentUser.defaultAddress?.country || currentUser.shippingAddress?.country || 'UNITED STATES'}
                                 </p>
                                 {expandedOrder.trackingNumber && (
                                   <>
                                     <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                       <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>
                                         TRACKING NUMBER
                                       </span>
                                       <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#909090', textTransform: 'uppercase' }}>
                                         {expandedOrder.trackingNumber}
                                       </span>
                                     </div>
                                     <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                       <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>
                                         CARRIER
                                       </span>
                                       <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#909090', textTransform: 'uppercase' }}>
                                         {expandedOrder.trackingCarrier}
                                       </span>
                                     </div>
                                   </>
                                 )}
                               </div>
                             </div>
                           )}
                           
                           {/* PAYMENT */}
                           {currentUser && (
                             <div style={{ marginBottom: '20px' }}>
                               <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '10px', marginTop: '-12px' }}>
                                 <h2
                                   style={{
                                     fontFamily: '"Futura PT Medium"',
                                     fontSize: '12px',
                                     color: '#EB1C24',
                                     fontWeight: '500',
                                     textTransform: 'uppercase',
                                     margin: '0'
                                   }}
                                 >
                                   PAYMENT
                                 </h2>
                               </div>
                               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                   <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>
                                     CONFIRMATION EMAIL
                                   </span>
                                   <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#909090', textTransform: 'uppercase' }}>
                                     {currentUser.email || ''}
                                   </span>
                                 </div>
                               </div>
                             </div>
                           )}
                         </div>
                       );
                     })()
                   ) : activeOrders.length === 0 ? (
                     <div className="flex flex-col justify-center items-center my-2 flex-shrink-0" style={{ minHeight: '200px' }}>
                       <p
                         style={{
                           fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                           fontSize: '11px',
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
                             onClick={() => setExpandedOrderId(order.id === expandedOrderId ? null : order.id)}
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
                           <p 
                             onClick={() => setExpandedOrderId(order.id === expandedOrderId ? null : order.id)}
                             style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', color: '#EB1C24', margin: 0, lineHeight: '1.2', cursor: 'pointer' }}
                           >
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
                           {order.status === 'PLACED' && order.placedAt && !order.orderFormSigned && (
                             <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', margin: 0, lineHeight: '1.2', cursor: 'pointer' }} onClick={() => {
                              // Get customer info from current user if signed in
                              let customerData: any = {};
                              // Strip "ORDER " prefix from order number if present
                              const orderNumber = order.orderNumber.replace(/^ORDER\s+/i, '');
                              if (currentUser) {
                                customerData = {
                                  orderNumber: orderNumber,
                                  orderDate: order.date,
                                  firstName: currentUser.firstName || '',
                                  lastName: currentUser.lastName || '',
                                  email: currentUser.email || '',
                                  shippingAddress: currentUser.defaultAddress?.address || currentUser.shippingAddress?.address || '',
                                  city: currentUser.defaultAddress?.city || currentUser.shippingAddress?.city || '',
                                  state: currentUser.defaultAddress?.state || currentUser.shippingAddress?.state || '',
                                  zip: currentUser.defaultAddress?.zip || currentUser.shippingAddress?.zip || '',
                                  country: currentUser.defaultAddress?.country || currentUser.shippingAddress?.country || 'UNITED STATES'
                                };
                              } else {
                                customerData = {
                                  orderNumber: orderNumber,
                                  orderDate: order.date
                                };
                              }
                              navigate('/shop/order-form', { state: customerData });
                             }}>
                               <span style={{ color: '#000000' }}>CLICK </span>
                               <span style={{ color: '#EB1C24' }}>HERE</span>
                               <span style={{ color: '#000000' }}> TO SIGN ORDER FORM</span>
                             </p>
                           )}
                           {order.status === 'PLACED' && order.orderFormSigned && (
                             <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', color: '#000000', margin: 0, lineHeight: '1.2' }}>
                               ORDER FORM IN REVIEW
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
                           ) : order.status === 'CONFIRMED' ? (
                             <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', color: '#000000', margin: 0, lineHeight: '1.2' }}>
                               PROCESSING YOUR ORDER
                             </p>
                           ) : order.status === 'PREPARING' ? (
                             <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', margin: 0, lineHeight: '1.2' }}>
                               <span style={{ color: '#000000' }}>CLICK </span>
                               <span style={{ color: '#EB1C24' }}>HERE</span>
                               <span style={{ color: '#000000' }}> TO TRACK ORDER STATUS</span>
                             </p>
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
                {activeOrders.length > 0 && !expandedOrderId && (
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
                        // For PLACED orders with signed form, show "ORDER FORM IN REVIEW"
                        if (order.status === 'PLACED' && order.orderFormSigned) {
                          return (
                            <span key={order.id} className="text-[9px] text-left font-futura uppercase" style={{ fontWeight: '500', marginRight: '10px' }}>
                              <span className="text-black" style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' }}>
                                {order.orderNumber}:{' '}
                              </span>
                              <span style={{ color: '#000000', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' }}>
                                ORDER FORM IN REVIEW
                              </span>
                            </span>
                          );
                        }
                        // For PLACED orders without signed form, show countdown in scrolling text
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
                              {order.status === 'PLACED' && order.orderFormSigned ? 'ORDER FORM IN REVIEW' : order.status}
                            </span>
                          </span>
                        );
                      });
                    })()}
                  </div>
                </div>
                )}
              </div>
            )}

              {/* Past Orders Card - Only show when there are archived orders */}
              {pastOrders.length > 0 && (
              <div className={`bg-white/60 backdrop-blur-sm border border-black p-4 flex flex-col shadow-lg transition-all duration-300 ease-out ${pastOrders.length > 1 ? 'min-h-[360px] overflow-hidden' : ''}`} style={{ borderWidth: '1.3px', minHeight: pastOrders.length > 1 ? '360px' : 'auto' }}>
                {/* Header */}
                <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200">
                  {expandedOrderId && pastOrders.find(o => o.id === expandedOrderId) ? (
                    <>
                      <button
                        className="text-red-500 font-bold text-lg tracking-wider truncate hover:text-red-600 transition-colors text-left uppercase"
                        style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '12px', fontWeight: '500' }}
                      >
                        {pastOrders.find(o => o.id === expandedOrderId)?.orderNumber || 'ORDER'}
                      </button>
                      <button
                        onClick={() => setExpandedOrderId(null)}
                        style={{ 
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <img
                          src="/assets/close-icon.svg"
                          alt="Close"
                          style={{
                            width: '16px',
                            height: '16px',
                            filter: 'brightness(0) saturate(100%) invert(20%) sepia(93%) saturate(7151%) hue-rotate(349deg) brightness(92%) contrast(92%)'
                          }}
                        />
                      </button>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>

                 {/* Body */}
                 <div className={`${pastOrders.length > 1 ? 'flex-1' : ''} flex flex-col ${pastOrders.length > 1 ? 'overflow-hidden' : ''} mt-2`}>
                   {expandedOrderId && pastOrders.find(o => o.id === expandedOrderId) ? (
                     // Expanded Order View for Archived Orders
                     (() => {
                       const expandedOrder = pastOrders.find(o => o.id === expandedOrderId);
                       if (!expandedOrder) return null;
                       
                       // Create mock products array for horizontal scroll (based on order.items)
                       const orderProducts = Array.from({ length: expandedOrder.items }, (_, i) => ({
                         id: `${expandedOrder.id}-product-${i}`,
                         name: expandedOrder.productName,
                         image: expandedOrder.productImage,
                         price: expandedOrder.total / expandedOrder.items
                       }));
                       
                       return (
                         <div className="flex flex-col gap-6" style={{ marginTop: '10px' }}>
                           {/* Products Horizontal Scroll */}
                           <div 
                             className="relative overflow-x-auto"
                             style={{ 
                               height: '180px',
                               marginBottom: '20px'
                             }}
                           >
                             <div
                               className="flex"
                               style={{
                                 gap: '20px',
                                 height: '100%',
                                 alignItems: 'center',
                                 paddingRight: '10px'
                               }}
                             >
                              {orderProducts.map((product) => (
                                <div
                                  key={product.id}
                                  className="flex-shrink-0"
                                  style={{
                                     width: '150px',
                                     height: '150px',
                                     display: 'flex',
                                     flexDirection: 'column',
                                     alignItems: 'center',
                                     justifyContent: 'center',
                                     padding: '8px'
                                   }}
                                 >
                                   <img
                                     src={product.image}
                                     alt={product.name}
                                     onClick={() => navigate(getProductRoute(product.name))}
                                     style={{
                                       width: '120px',
                                       height: '120px',
                                       objectFit: 'contain',
                                       cursor: 'pointer'
                                     }}
                                   />
                                   <p
                                     style={{
                                       fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                                       fontSize: '16.8px',
                                       color: '#000000',
                                       marginTop: '4px',
                                       marginBottom: '0',
                                       textTransform: 'uppercase',
                                       textAlign: 'center',
                                       lineHeight: '1.2'
                                     }}
                                   >
                                     {product.name}
                                   </p>
                                 </div>
                               ))}
                             </div>
                           </div>
                           
                           {/* ORDER SUMMARY */}
                           <div style={{ marginBottom: '20px' }}>
                             <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '10px', marginTop: '-12px' }}>
                               <h2
                                 style={{
                                   fontFamily: '"Futura PT Medium"',
                                   fontSize: '12px',
                                   color: '#EB1C24',
                                   fontWeight: '500',
                                   textTransform: 'uppercase',
                                   margin: '0'
                                 }}
                               >
                                 ORDER SUMMARY
                               </h2>
                             </div>
                             <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                 <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>
                                   ORDER DATE
                                 </span>
                                 <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#909090', textTransform: 'uppercase' }}>
                                   {expandedOrder.date}
                                 </span>
                               </div>
                               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                 <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>
                                   ORDER TOTAL
                                 </span>
                                 <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#909090', textTransform: 'uppercase' }}>
                                   {formatPrice(expandedOrder.total)} {selectedCurrency}
                                 </span>
                               </div>
                               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                 <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>
                                   ORDER NUMBER
                                 </span>
                                 <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#909090', textTransform: 'uppercase' }}>
                                   {expandedOrder.orderNumber}
                                 </span>
                               </div>
                             </div>
                           </div>
                           
                           {/* SHIPPING */}
                           {currentUser && (
                             <div style={{ marginBottom: '20px' }}>
                               <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '10px', marginTop: '-12px' }}>
                                 <h2
                                   style={{
                                     fontFamily: '"Futura PT Medium"',
                                     fontSize: '12px',
                                     color: '#EB1C24',
                                     fontWeight: '500',
                                     textTransform: 'uppercase',
                                     margin: '0'
                                   }}
                                 >
                                   SHIPPING
                                 </h2>
                               </div>
                               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                 <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', margin: '0', textTransform: 'uppercase' }}>
                                   {currentUser.firstName || ''} {currentUser.lastName || ''}
                                 </p>
                                 <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', margin: '0', textTransform: 'uppercase' }}>
                                   {currentUser.defaultAddress?.address || currentUser.shippingAddress?.address || ''}
                                 </p>
                                 <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', margin: '0', textTransform: 'uppercase' }}>
                                   {currentUser.defaultAddress?.city || currentUser.shippingAddress?.city || ''}, {currentUser.defaultAddress?.state || currentUser.shippingAddress?.state || ''} {currentUser.defaultAddress?.zip || currentUser.shippingAddress?.zip || ''}
                                 </p>
                                 <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', margin: '0', textTransform: 'uppercase' }}>
                                   {currentUser.defaultAddress?.country || currentUser.shippingAddress?.country || 'UNITED STATES'}
                                 </p>
                                 {expandedOrder.trackingNumber && (
                                   <>
                                     <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                       <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>
                                         TRACKING NUMBER
                                       </span>
                                       <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#909090', textTransform: 'uppercase' }}>
                                         {expandedOrder.trackingNumber}
                                       </span>
                                     </div>
                                     <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                       <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>
                                         CARRIER
                                       </span>
                                       <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#909090', textTransform: 'uppercase' }}>
                                         {expandedOrder.trackingCarrier}
                                       </span>
                                     </div>
                                   </>
                                 )}
                               </div>
                             </div>
                           )}
                           
                           {/* PAYMENT */}
                           {currentUser && (
                             <div style={{ marginBottom: '20px' }}>
                               <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '10px', marginTop: '-12px' }}>
                                 <h2
                                   style={{
                                     fontFamily: '"Futura PT Medium"',
                                     fontSize: '12px',
                                     color: '#EB1C24',
                                     fontWeight: '500',
                                     textTransform: 'uppercase',
                                     margin: '0'
                                   }}
                                 >
                                   PAYMENT
                                 </h2>
                               </div>
                               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                   <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>
                                     CONFIRMATION EMAIL
                                   </span>
                                   <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#909090', textTransform: 'uppercase' }}>
                                     {currentUser.email || ''}
                                   </span>
                                 </div>
                               </div>
                             </div>
                           )}
                         </div>
                       );
                     })()
                   ) : (
                   <div className={`flex flex-col justify-start items-start gap-4 my-2 flex-shrink-0 ${pastOrders.length > 1 ? 'overflow-y-auto' : ''}`} style={{ maxHeight: pastOrders.length > 1 ? '265px' : 'auto', scrollBehavior: 'smooth' }}>
                     {pastOrders.map((order) => (
                       <div key={order.id} className="flex items-center gap-3" style={{ flexShrink: 0 }}>
                         {/* Thumbnail */}
                         <div className="flex flex-col items-center" style={{ flexShrink: 0 }}>
                           <button
                             onClick={() => setExpandedOrderId(order.id === expandedOrderId ? null : order.id)}
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
                           <p 
                             onClick={() => setExpandedOrderId(order.id === expandedOrderId ? null : order.id)}
                             style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', color: '#EB1C24', margin: 0, lineHeight: '1.2', cursor: 'pointer' }}
                           >
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
                           {order.status === 'PLACED' && order.orderFormSigned && (
                             <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', color: '#000000', margin: 0, lineHeight: '1.2' }}>
                               ORDER FORM IN REVIEW
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
                           ) : order.status === 'CONFIRMED' ? (
                             <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', color: '#000000', margin: 0, lineHeight: '1.2' }}>
                               PROCESSING YOUR ORDER
                             </p>
                           ) : order.status === 'PREPARING' ? (
                             <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', margin: 0, lineHeight: '1.2' }}>
                               <span style={{ color: '#000000' }}>CLICK </span>
                               <span style={{ color: '#EB1C24' }}>HERE</span>
                               <span style={{ color: '#000000' }}> TO TRACK ORDER STATUS</span>
                             </p>
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
                {pastOrders.length > 0 && !expandedOrderId && (
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
                )}
              </div>
              )}
            </div>
            )}
          </div>
        </div>
      </div>

      {/* Sign Out Confirmation Modal */}
      <ConfirmationModal
        isOpen={showSignOutConfirm}
        onClose={() => setShowSignOutConfirm(false)}
        onConfirm={handleSignOut}
        title="SIGN OUT?"
        message="ARE YOU SURE YOU WANT TO SIGN OUT?"
        confirmText="SIGN OUT"
        cancelText="CANCEL"
      />
      </div>
  );
}

export default OrdersPage;
