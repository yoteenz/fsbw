import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DynamicCartIcon from '../../../components/DynamicCartIcon';
import ConfirmationModal from '../../../components/ConfirmationModal';
import { getPointsMultiplier } from '../../../constants/tiers';
import BrandMenuLinks from '../../../components/BrandMenuLinks';
import SocialMenuIcons from '../../../components/SocialMenuIcons';
import summaryIcon from '../../../assets/icons/summary-icon.svg?url';

function CheckoutConfirmPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [cartCount] = useState(() => {
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
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
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
  
  // Order data - get from location state, payment return, or generate
  const [orderData, setOrderData] = useState(() => {
    // Check if returning from payment provider
    const urlParams = new URLSearchParams(window.location.search);
    const paymentReturn = urlParams.get('paymentReturn');
    const provider = urlParams.get('provider');
    
    if (paymentReturn && provider) {
      // Retrieve stored order data from payment redirect
      const storedOrderKey = `pendingOrder_${provider}`;
      const storedOrderData = localStorage.getItem(storedOrderKey);
      if (storedOrderData) {
        try {
          const orderData = JSON.parse(storedOrderData);
          // Clear the stored data after retrieving
          localStorage.removeItem(storedOrderKey);
          // Clean up URL parameters
          window.history.replaceState({}, '', '/checkout/summary');
          return orderData;
        } catch (e) {
          console.error('Error parsing stored order data:', e);
        }
      }
    }
    
    if (location.state) {
      return location.state;
    }
    // Fallback data if no state passed - include mock rewards data
    // Calculate a mock order total (base price + taxes + shipping)
    const mockBaseTotal = 1290; // Mock base order amount
    const mockTaxesProcessing = mockBaseTotal * 0.10;
    const mockShippingHandling = 60;
    const mockOrderTotal = mockBaseTotal + mockTaxesProcessing + mockShippingHandling;
    
    // Get and increment order number
    const lastOrderNumber = parseInt(localStorage.getItem('lastOrderNumber') || '0', 10);
    const nextOrderNumber = lastOrderNumber + 1;
    localStorage.setItem('lastOrderNumber', nextOrderNumber.toString());
    const orderNumber = `#${String(nextOrderNumber).padStart(3, '0')}`;
    
    // Generate random 6-character alphanumeric confirmation number and tie it to order number
    const generateConfirmationNumber = () => {
      const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let result = '';
      for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };
    const confirmationNumber = generateConfirmationNumber();
    const orderConfirmations = JSON.parse(localStorage.getItem('orderConfirmations') || '{}');
    orderConfirmations[orderNumber] = confirmationNumber;
    localStorage.setItem('orderConfirmations', JSON.stringify(orderConfirmations));
    
    return {
      orderNumber: orderNumber,
      confirmationNumber: confirmationNumber,
      orderDate: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, '-'),
      orderTotal: mockOrderTotal,
      shippingMethod: '',
      firstName: '',
      lastName: '',
      shippingAddress: '',
      city: '',
      state: '',
      zip: '',
      country: '',
      paymentMethod: '',
      email: '',
      pointsEarned: 1290, // Mock rewards data
      tier: 'RED' // Mock tier
    };
  });

  // Horizontal scroll state for products
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startScrollPosition, setStartScrollPosition] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Helper function to get ordinal suffix (ST, ND, RD, TH)
  const getOrdinalSuffix = (day: number): string => {
    if (day >= 11 && day <= 13) {
      return 'TH';
    }
    const lastDigit = day % 10;
    switch (lastDigit) {
      case 1: return 'ST';
      case 2: return 'ND';
      case 3: return 'RD';
      default: return 'TH';
    }
  };

  // Helper function to calculate processing timeline date range
  const calculateProcessingTimeline = (orderDateStr: string, processingTime: string): string => {
    try {
      // Parse order date (MM-DD-YYYY format)
      const [month, day, year] = orderDateStr.split('-').map(Number);
      const orderDate = new Date(year, month - 1, day);
      
      // Determine weeks based on processing time
      let minWeeks = 6;
      let maxWeeks = 8;
      
      if (processingTime && processingTime.includes('4')) {
        // Rush processing: 4-6 weeks
        minWeeks = 4;
        maxWeeks = 6;
      } else if (processingTime && processingTime.includes('10')) {
        // Customized units: up to 10 weeks
        minWeeks = 6;
        maxWeeks = 10;
      }
      
      // Calculate dates
      const minDate = new Date(orderDate);
      minDate.setDate(minDate.getDate() + (minWeeks * 7));
      
      const maxDate = new Date(orderDate);
      maxDate.setDate(maxDate.getDate() + (maxWeeks * 7));
      
      // Format month names
      const monthNames = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 
                          'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
      
      const minMonth = monthNames[minDate.getMonth()];
      const maxMonth = monthNames[maxDate.getMonth()];
      const minDay = minDate.getDate();
      const maxDay = maxDate.getDate();
      
      const minSuffix = getOrdinalSuffix(minDay);
      const maxSuffix = getOrdinalSuffix(maxDay);
      
      // If same month, format as "MONTH DAYTH - DAYTH", otherwise "MONTH DAYTH - MONTH DAYTH"
      if (minMonth === maxMonth) {
        return `${minMonth} ${minDay}${minSuffix} - ${maxDay}${maxSuffix}`;
      } else {
        return `${minMonth} ${minDay}${minSuffix} - ${maxMonth} ${maxDay}${maxSuffix}`;
      }
    } catch (e) {
      // Fallback to original format if parsing fails
      return processingTime || '6-8 WEEKS';
    }
  };

  // Currency state
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
  }), []);

  // Load cart items from location state or localStorage
  useEffect(() => {
    if (location.state && location.state.cartItems) {
      setCartItems(location.state.cartItems);
    } else {
      try {
        const savedCart = localStorage.getItem('cartItems');
        if (savedCart) {
          const items = JSON.parse(savedCart);
          setCartItems(items);
        }
      } catch (e) {
        console.error('Error loading cart items:', e);
      }
    }
  }, [location.state]);

  // Save selected currency to localStorage
  useEffect(() => {
    localStorage.setItem('selectedCurrency', selectedCurrency);
  }, [selectedCurrency]);

  // Listen for currency changes from cart dropdown
  useEffect(() => {
    const handleCurrencyChange = () => {
      const savedCurrency = localStorage.getItem('selectedCurrency');
      if (savedCurrency && currencyRates[savedCurrency as keyof typeof currencyRates]) {
        setSelectedCurrency(savedCurrency);
      }
    };

    // Listen for storage events (from other tabs/windows)
    window.addEventListener('storage', handleCurrencyChange);
    
    // Listen for custom currencyChanged event (from same window)
    const handleCustomCurrencyChange = (event: CustomEvent) => {
      const newCurrency = event.detail;
      if (newCurrency && currencyRates[newCurrency as keyof typeof currencyRates]) {
        setSelectedCurrency(newCurrency);
        localStorage.setItem('selectedCurrency', newCurrency);
      }
    };
    
    window.addEventListener('currencyChanged', handleCustomCurrencyChange as EventListener);
    
    // Poll localStorage periodically to catch any currency changes
    const interval = setInterval(() => {
      handleCurrencyChange();
    }, 500);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleCurrencyChange);
      window.removeEventListener('currencyChanged', handleCustomCurrencyChange as EventListener);
    };
  }, [currencyRates]);

  // Check if signed in and populate mock data if needed
  useEffect(() => {
    // Check localStorage or session for sign-in status
    const signedIn = localStorage.getItem('isSignedIn') === 'true';
    setIsSignedIn(signedIn);
    
    // Listen for sign-in state changes
    const handleSignInStateChange = (event: CustomEvent) => {
      setIsSignedIn(event.detail === 'true');
    };
    
    window.addEventListener('signInStateChanged', handleSignInStateChange as EventListener);
    
    return () => {
      window.removeEventListener('signInStateChanged', handleSignInStateChange as EventListener);
    };
    
    // If no order data from location state, populate with mock data
    if (!location.state) {
      // Calculate order total from cart items (use 1290 as default if cart is empty)
      const calculatedTotal = cartItems.length > 0 
        ? cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0)
        : 1290;
      
      // Calculate taxable amount (exclude gift cards and digital items)
      const taxableAmount = cartItems.length > 0
        ? cartItems.reduce((sum, item) => {
            // Skip gift cards and digital items
            const isGiftCard = item.name === 'GIFT CARD' || item.type === 'gift-card';
            const isDigital = item.type === 'digital';
            
            if (isGiftCard || isDigital) {
              return sum; // Don't add to taxable amount
            }
            
            return sum + (item.price || 0) * (item.quantity || 1);
          }, 0)
        : 1290; // Default taxable amount if cart is empty
      
      // Use pointsEarned from location.state (passed from checkout page) if available
      // Only recalculate as fallback if not provided
      const pointsEarnedFromState = location.state?.pointsEarned;
      let pointsEarned = pointsEarnedFromState;
      
      // Only recalculate if pointsEarned wasn't passed from checkout
      if (pointsEarned === undefined || pointsEarned === null) {
        // Calculate points-eligible amount (exclude gift cards and digital items like memberships)
        const pointsEligibleAmount = cartItems.length > 0
          ? cartItems.reduce((sum, item) => {
              // Skip gift cards and digital items (memberships)
              const isGiftCard = item.name === 'GIFT CARD' || item.type === 'gift-card';
              const isDigital = item.type === 'digital';
              
              if (isGiftCard || isDigital) {
                return sum; // Don't add to points-eligible amount
              }
              
              return sum + (item.price || 0) * (item.quantity || 1);
            }, 0)
          : 1290; // Default points-eligible amount if cart is empty
        
        let multiplier = 1;
        try {
          const currentUser = localStorage.getItem('currentUser');
          const isSignedIn = localStorage.getItem('isSignedIn') === 'true';
          if (isSignedIn && currentUser) {
            const user = JSON.parse(currentUser);
            const tier: string | null = (user.currentTierName || user.tier || (user.email ? localStorage.getItem(`lastKnownTier_${(user.email || '').trim().toLowerCase()}`) : null) || '').toString().toUpperCase() || null;
            const subTier: string | null = user.subscriptionTier || (user.membershipType === 'PREMIUM' || user.membershipType === 'Premium' ? '12months' : null) || null;
            const res = getPointsMultiplier(tier, subTier);
            multiplier = res.multiplier;
          }
        } catch (_) {}
        pointsEarned = Math.round(pointsEligibleAmount * multiplier);
      }
      
      const taxesProcessing = taxableAmount * 0.10;
      const shippingHandling = 60; // Standard shipping
      const subtotal = calculatedTotal + taxesProcessing + shippingHandling;
      
      // Determine tier based on points (note: actual tier system is based on spending, not points)
      // This is for display purposes only - actual tier is calculated from total spending
      let tier = 'SILVER'; // SILVER is base tier for everyone
      if (pointsEarned >= 5000) {
        tier = 'RED';
      }
      // Note: Tier benefits unlock at spending thresholds per 6 months: SILVER 1,000+, RED 2,000+ (remain), BLACK 4,000+ (unlock)
      
      // Determine processing time based on order (check if has customizations)
      const hasCustomizations = cartItems.length > 0 && cartItems.some(item => {
        return (item.color && item.color !== (item.name === 'BLANCO' ? 'PLATINUM' : 'OFF BLACK')) ||
               (item.styling && item.styling !== 'NONE') ||
               (item.addOns && item.addOns.length > 0) ||
               (item.length && item.length !== '24"') ||
               (item.density && item.density !== '200%') ||
               (item.lace && item.lace !== '13X6') ||
               (item.hairline && item.hairline !== 'NATURAL');
      });
      const processingTime = hasCustomizations 
        ? '6-8 WEEKS (UP TO 10 WEEKS FOR CUSTOMIZED UNITS)'
        : '6-8 WEEKS';
      
      setOrderData((prev: any) => {
        // Get and increment order number if not already set
        let orderNum = prev.orderNumber;
        let confirmNum = prev.confirmationNumber;
        if (!orderNum) {
          const lastOrderNumber = parseInt(localStorage.getItem('lastOrderNumber') || '0', 10);
          const nextOrderNumber = lastOrderNumber + 1;
          localStorage.setItem('lastOrderNumber', nextOrderNumber.toString());
          orderNum = `#${String(nextOrderNumber).padStart(3, '0')}`;
          
          // Generate random 6-character alphanumeric confirmation number and tie it to order number
          const generateConfirmationNumber = () => {
            const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            let result = '';
            for (let i = 0; i < 6; i++) {
              result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
          };
          confirmNum = generateConfirmationNumber();
          const orderConfirmations = JSON.parse(localStorage.getItem('orderConfirmations') || '{}');
          orderConfirmations[orderNum] = confirmNum;
          localStorage.setItem('orderConfirmations', JSON.stringify(orderConfirmations));
        } else if (!confirmNum) {
          // If order number exists but confirmation number doesn't, retrieve or generate it
          const orderConfirmations = JSON.parse(localStorage.getItem('orderConfirmations') || '{}');
          confirmNum = orderConfirmations[orderNum];
          if (!confirmNum) {
            // Generate if not found in storage
            const generateConfirmationNumber = () => {
              const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
              let result = '';
              for (let i = 0; i < 6; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
              }
              return result;
            };
            confirmNum = generateConfirmationNumber();
            orderConfirmations[orderNum] = confirmNum;
            localStorage.setItem('orderConfirmations', JSON.stringify(orderConfirmations));
          }
        }
        
        return {
          ...prev,
          orderNumber: orderNum,
          confirmationNumber: confirmNum,
          orderDate: prev.orderDate || new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, '-'),
          orderTotal: prev.orderTotal && prev.orderTotal > 0 ? prev.orderTotal : subtotal,
          shippingMethod: prev.shippingMethod || 'UPS DOMESTIC STANDARD +$60',
          processingTime: prev.processingTime || processingTime,
          firstName: prev.firstName || 'ASHLEY',
          lastName: prev.lastName || 'EVANS',
          shippingAddress: prev.shippingAddress || '3374 E SHELBY DR APT #106',
          city: prev.city || 'MEMPHIS',
          state: prev.state || 'TN',
          zip: prev.zip || '38035',
          country: prev.country || 'UNITED STATES',
          paymentMethod: prev.paymentMethod || 'CARD ENDING IN XXXX',
          email: prev.email || 'ASHLEYEVANS@GMAIL.COM',
          pointsEarned: prev.pointsEarned || pointsEarned || 0, // Use points from checkout page, fallback to calculated or 0
          tier: prev.tier || tier
        };
      });
    } else if (location.state && !location.state.processingTime) {
      // If signed in with location state but no processing time, add it
      const hasCustomizations = cartItems.length > 0 && cartItems.some(item => {
        return (item.color && item.color !== (item.name === 'BLANCO' ? 'PLATINUM' : 'OFF BLACK')) ||
               (item.styling && item.styling !== 'NONE') ||
               (item.addOns && item.addOns.length > 0) ||
               (item.length && item.length !== '24"') ||
               (item.density && item.density !== '200%') ||
               (item.lace && item.lace !== '13X6') ||
               (item.hairline && item.hairline !== 'NATURAL');
      });
      const processingTime = hasCustomizations 
        ? '6-8 WEEKS (UP TO 10 WEEKS FOR CUSTOMIZED UNITS)'
        : '6-8 WEEKS';
      
      setOrderData((prev: any) => ({
        ...prev,
        processingTime: processingTime
      }));
    }
  }, [location.state, cartItems]);

  // Horizontal scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setStartScrollPosition(scrollPosition);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const currentX = e.clientX;
    const diff = currentX - startX;
    const newPosition = startScrollPosition + diff;
    
    // Calculate scroll limits dynamically based on container and item widths
    const containerWidth = scrollContainerRef.current?.offsetWidth || 0;
    const itemWidth = 150; // Regular item width
    const giftCardWidth = 165; // Gift card width
    const gap = 20;
    const paddingRight = 10;
    
    // Calculate total content width
    const totalContentWidth = cartItems.reduce((sum, item) => {
      const width = (item.name === 'GIFT CARD' || item.type === 'gift-card') ? giftCardWidth : itemWidth;
      return sum + width + gap;
    }, 0) + paddingRight - gap; // Subtract last gap, add padding
    
    const maxScroll = 0;
    const minScroll = containerWidth - totalContentWidth;
    setScrollPosition(Math.max(minScroll, Math.min(maxScroll, newPosition)));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setStartScrollPosition(scrollPosition);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    const newPosition = startScrollPosition + diff;
    
    // Calculate scroll limits dynamically based on container and item widths
    const containerWidth = scrollContainerRef.current?.offsetWidth || 0;
    const itemWidth = 150; // Regular item width
    const giftCardWidth = 165; // Gift card width
    const gap = 20;
    const paddingRight = 10;
    
    // Calculate total content width
    const totalContentWidth = cartItems.reduce((sum, item) => {
      const width = (item.name === 'GIFT CARD' || item.type === 'gift-card') ? giftCardWidth : itemWidth;
      return sum + width + gap;
    }, 0) + paddingRight - gap; // Subtract last gap, add padding
    
    const maxScroll = 0;
    const minScroll = containerWidth - totalContentWidth;
    setScrollPosition(Math.max(minScroll, Math.min(maxScroll, newPosition)));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Format price with currency
  const formatPrice = React.useCallback((price: number) => {
    if (!price || isNaN(price)) {
      const currency = currencyRates[selectedCurrency as keyof typeof currencyRates] || currencyRates.USD;
      return { __html: currency.symbol + '0 ' + selectedCurrency };
    }
    const currency = currencyRates[selectedCurrency as keyof typeof currencyRates] || currencyRates.USD;
    const convertedPrice = price * currency.rate;
    return {
      __html: currency.symbol + convertedPrice.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }) + ' ' + selectedCurrency
    };
  }, [currencyRates, selectedCurrency]);

  // Get product image - same logic as checkout page
  const getProductImage = (item: any): string => {
    if (item.name === 'GIFT CARD' || item.type === 'gift-card') {
      return '/assets/gift-card asset.png';
    }
    
    const productName = item.name || 'NOIR';
    
    // For NOIR, check hairline to use appropriate front image
    if (productName.toUpperCase() === 'NOIR') {
    const hairline = item.hairline || 'NATURAL';
    const hairlineUpper = hairline.toUpperCase();
    const hasPeak = hairlineUpper.includes('PEAK');
    const hasLagos = hairlineUpper.includes('LAGOS');
    
      if (hasPeak) {
        return '/assets/peak front.png';
      } else if (hasLagos) {
        return '/assets/lagos front.png';
      }
      // Default to natural front image
      return '/assets/natural front.png';
    }
    
    switch (productName.toUpperCase()) {
      case 'BLANCO':
        return '/assets/2D BLANCO FRONT.png';
      case 'SOFT WAVE':
      case 'BEACH WAVE':
        return '/assets/2D WAVY FRONT.png';
      case 'SOFT CURL':
      case 'OCEAN CURL':
        return '/assets/2D CURLY FRONT.png';
      default:
        return '/assets/natural front.png';
    }
  };

  const getHairOrigin = (productName: string) => {
    switch (productName) {
      case 'NOIR':
        return 'CAMBODIAN';
      case 'BLANCO':
        return 'RUSSIAN';
      case 'SOFT CURL':
        return 'FILIPINO';
      case 'OCEAN CURL':
        return 'VIETNAMESE';
      case 'SOFT WAVE':
        return 'INDIAN';
      case 'BEACH WAVE':
        return 'INDONESIAN';
      default:
        return 'CAMBODIAN';
    }
  };



  // Update active tab based on current route
  useEffect(() => {
    const pathname = location.pathname;
    if (pathname.includes('/tools') || pathname === '/tools/gift-card') {
      setMobileMenuActiveTab('TOOLS');
    } else if (pathname.includes('/brand') || pathname.includes('/about') || pathname.includes('/contact') || pathname.includes('/faq') || pathname.includes('/reviews') || pathname.includes('/terms')) {
      setMobileMenuActiveTab('BRAND');
    } else {
      setMobileMenuActiveTab('SHOP');
    }
  }, [location.pathname]);

  // Ensure active tab is set correctly when menu opens
  useEffect(() => {
    if (showMobileMenu) {
      const pathname = location.pathname;
      if (pathname.includes('/tools') || pathname === '/tools/gift-card') {
        setMobileMenuActiveTab('TOOLS');
      } else if (pathname.includes('/brand') || pathname.includes('/about') || pathname.includes('/contact') || pathname.includes('/faq') || pathname.includes('/reviews') || pathname.includes('/terms')) {
        setMobileMenuActiveTab('BRAND');
      } else {
        setMobileMenuActiveTab('SHOP');
      }
    }
  }, [showMobileMenu, location.pathname]);

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
      navigate('/sign-in?returnTo=checkout/summary');
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
  };

  // Check if user is a premium member
  const isPremiumMember = (): boolean => {
    if (!isSignedIn) return false;
    try {
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        const user = JSON.parse(currentUser);
        // Check if user has subscriptionTier (premium subscription)
        if (user?.subscriptionTier) {
          return true;
        }
        // Check if user has premium tier (RED, GOLD, BLACK)
        if (user?.tier) {
          const tier = user.tier.toUpperCase();
          return tier === 'RED' || tier === 'GOLD' || tier === 'BLACK';
        }
      }
    } catch (e) {
      console.error('Error checking premium membership:', e);
    }
    return false;
  };

  const handleHomeClick = () => {
    if (isPremiumMember()) {
      navigate('/');
    } else {
      navigate('/home/shop');
    }
  };

  return (
    <>
      <style>{`
        input::placeholder,
        textarea::placeholder {
          font-family: "Futura PT Demi", "Futura PT Medium", "Futura PT Book", "Covered By Your Grace", "Covered By Your Grace Preload" !important;
          font-weight: 500;
          color: #808080 !important;
        }
        input,
        textarea {
          font-family: "Futura PT Demi", "Futura PT Medium", "Futura PT Book", "Covered By Your Grace", "Covered By Your Grace Preload" !important;
          font-weight: 500 !important;
          color: #808080 !important;
          text-transform: uppercase !important;
          background-color: #FFFFFF !important;
        }
      `}</style>
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
                      onClick={() => navigate('/bag')} 
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
                    <button className="cursor-pointer" style={{ transform: 'translateX(-2px)' }}>
                      <img
                        alt="Search icon"
                        width="16"
                        height="15"
                        src="/assets/search-icon.svg"
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
                      onClick={() => navigate('/checkout')}
                    >
                      CHECKOUT &gt;
                    </span>{' '}
                    <span
                      style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}
                    >
                      SUMMARY
                    </span>
                  </>
                )}
              </p>

              {/* Right side icons */}
              <div className="gap-5 flex absolute" style={{ right: '17px' }}>
                <div style={{ transform: `translateX(${cartCount === 0 ? 7 : 5}px)` }}>
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
              className="flex flex-col w-full"
              style={{ 
                minWidth: '100%', 
                maxWidth: 'none', 
                overflow: 'visible',
                minHeight: showMobileMenu ? 'calc(100dvh - 80px)' : 'auto',
                height: showMobileMenu ? 'calc(100dvh - 80px)' : 'auto',
                paddingBottom: showMobileMenu ? '1rem' : '0'
              }}
            >
            {showMobileMenu ? (
              /* MENU CONTENT */
              <div
                className="menu-toggle-card border border-black flex flex-col pt-6 pb-4 px-5 bg-white/60 backdrop-blur-sm w-full transition-all duration-300 ease-out"
                style={{ 
                  borderWidth: '1.3px', 
                  minWidth: '100%', 
                  maxWidth: 'none', 
                  overflow: 'visible',
                  backgroundColor: 'rgba(255, 255, 255, 0.6)',
                  minHeight: 'calc(100dvh - 80px)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', paddingTop: '20px', flex: 1, minHeight: 0, position: 'relative' }}>
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
                      borderBottom: mobileMenuActiveTab === 'SHOP' ? '1px solid #EB1C24' : 'none',
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
                      borderBottom: mobileMenuActiveTab === 'TOOLS' ? '1px solid #EB1C24' : 'none',
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
                      borderBottom: mobileMenuActiveTab === 'BRAND' ? '1px solid #EB1C24' : 'none',
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
                      <BrandMenuLinks onClose={() => setShowMobileMenu(false)} />
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
                <SocialMenuIcons />
                </div>
              </div>
            ) : (
              /* REGULAR CONTENT */
              <>
              {/* MAIN CARD */}
              <div
                className="border border-black flex flex-col pt-6 pb-4 px-5 mb-2 bg-white/60 backdrop-blur-sm transition-all duration-300 ease-out"
                style={{ 
                  borderWidth: '1.3px',
                  minWidth: '100%', 
                  maxWidth: 'none', 
                  overflow: 'visible',
                  backgroundColor: 'rgba(255, 255, 255, 0.6)'
                }}
              >
              {/* CONGRATS Header */}
              <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '10px', marginTop: '-10px' }}>
                <h1
                  style={{
                    fontFamily: '"Futura PT Medium"',
                    fontSize: '12px',
                    color: '#EB1C24',
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    margin: '0'
                  }}
                >
                  CONGRATS!
                </h1>
                <span
                  className="text-black font-bold text-lg flex-shrink-0 ml-2 uppercase"
                  style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', fontSize: '15px' }}
                >
                  {cartItems.length}
                </span>
              </div>

              {/* Products Horizontal Scroll */}
              <div 
                ref={scrollContainerRef}
                className="relative overflow-hidden mb-6"
                style={{ 
                  height: '180px',
                  cursor: isDragging ? 'grabbing' : 'grab',
                  userSelect: 'none',
                  display: 'flex',
                  justifyContent: cartItems.length === 1 ? 'center' : 'flex-start',
                  alignItems: 'center'
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div
                  className="flex"
                  style={{
                    transform: `translateX(${scrollPosition}px)`,
                    transition: 'none',
                    gap: '20px',
                    height: '100%',
                    alignItems: 'center',
                    willChange: 'transform',
                    paddingRight: '10px'
                  }}
                >
                  {cartItems.map((item, index) => {
                    const itemName = item.name || 'NOIR';
                    const itemImage = getProductImage(item);
                    const itemLength = item.length || '24"';
                    const itemHairOrigin = getHairOrigin(item.name);
                    const itemPrice = item.price || 580;
                    
                    return (
                      <div
                        key={index}
                        className="flex-shrink-0"
                        style={{
                          width: (item.name === 'GIFT CARD' || item.type === 'gift-card') ? '165px' : '150px',
                          height: '150px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          paddingTop: '8px',
                          paddingRight: '8px',
                          paddingBottom: '8px',
                          paddingLeft: '8px'
                        }}
                      >
                        <img
                          src={itemImage}
                          alt={itemName}
                          style={{
                            width: (item.name === 'GIFT CARD' || item.type === 'gift-card') ? '165px' : '120px',
                            height: (item.name === 'GIFT CARD' || item.type === 'gift-card') ? '165px' : '120px',
                            objectFit: 'contain'
                          }}
                          draggable={false}
                        />
                        <div
                          style={{
                            transform: (item.name === 'GIFT CARD' || item.type === 'gift-card') ? 'translateY(-25px)' : 'none'
                          }}
                        >
                        <p
                          style={{
                            fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                            fontSize: '16.8px',
                            color: '#000000',
                            marginTop: '4px',
                            marginBottom: '0',
                            textTransform: 'uppercase',
                            textAlign: 'center',
                            lineHeight: '1.2',
                            transform: (item.name === 'GIFT CARD' || item.type === 'gift-card') ? 'translateY(-1px)' : 'none'
                          }}
                        >
                          {itemName}
                        </p>
                        <p
                          style={{
                            fontFamily: '"Futura PT Medium"',
                            fontSize: '8px',
                            color: '#EB1C24',
                            marginTop: (() => {
                              const hasSpecs = (item.density && item.density !== '200%') || 
                                             (item.lace && item.lace !== '13X6') || 
                                             (item.color && item.color !== (item.name === 'BLANCO' ? 'PLATINUM' : 'OFF BLACK')) || 
                                             (item.hairline && item.hairline !== 'NATURAL') || 
                                             (item.styling && item.styling !== 'NONE') || 
                                             (item.addOns && item.addOns.length > 0) ||
                                             (item.capSize && (item.capSize === 'XXS/XS/S' || item.capSize === 'S/M/L')) ||
                                             (item.length && item.length !== '24"');
                              const isGiftCard = item.name === 'GIFT CARD' || item.type === 'gift-card';
                              const isBlancoNoSpecs = item.name === 'BLANCO' && !hasSpecs;
                              if (isGiftCard) return '-2px';
                              if (isBlancoNoSpecs) return '-2px';
                              return '-2px';
                            })(),
                            transform: 'translateY(3px)',
                            lineHeight: '1.1',
                            marginBottom: '0',
                            textTransform: 'uppercase',
                            textAlign: 'center'
                          }}
                        >
                          {(() => {
                            if (item.name === 'GIFT CARD' || item.type === 'gift-card') {
                              return 'DIGITAL ONLY';
                            }
                            return `${itemLength} RAW ${itemHairOrigin}`;
                          })()}
                        </p>
                        {!(item.name === 'GIFT CARD' || item.type === 'gift-card') && item.capSize && (
                          <p
                              style={{
                              fontFamily: '"Futura PT Demi"',
                              fontSize: '9px',
                              color: '#808080',
                              margin: '7px 0 0 0',
                                textTransform: 'uppercase',
                              lineHeight: '1.1',
                              textAlign: 'center'
                            }}
                          >
                            CAP SIZE: {item.capSize}
                          </p>
                        )}
                        <p
                          style={{
                            fontFamily: '"Futura PT Medium"',
                            fontSize: '10px',
                            fontWeight: '500',
                            color: '#000000',
                            margin: (item.name === 'GIFT CARD' || item.type === 'gift-card') ? '4px 0 0 0' : '1px 0 0 0',
                            textTransform: 'uppercase',
                            textAlign: 'center'
                          }}
                          dangerouslySetInnerHTML={formatPrice(itemPrice)}
                        />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Border line above Order Processing Message */}
              <div>
              <div style={{ 
                  paddingTop: '0',
                  paddingBottom: '1px',
                borderTop: '1.3px solid #000',
                  marginTop: '-6px'
              }}>
                </div>
              </div>

              {/* Order Processing Message */}
              <p
                style={{
                  fontFamily: '"Futura PT Book"',
                  fontSize: '10px',
                  color: '#000000',
                  margin: '13px 0 0 0',
                  textTransform: 'uppercase',
                  lineHeight: '1.4',
                  textAlign: 'center',
                  fontWeight: '600'
                }}
              >
                YOUR ORDER IS BEING PROCESSED BUT YOU'RE NOT FINISHED YET.<br/>YOU STILL NEED TO <span style={{ color: '#EB1C24' }}>COMPLETE + SIGN</span> AN ORDER FORM WITHIN 24 HOURS OR YOUR ORDER WILL BE <span style={{ color: '#EB1C24' }}>CANCELED + REFUNDED</span>.
              </p>
              </div>
              </>
            )}
            </div>

            {/* Sign Order Form Button - Outside main card */}
            {!showMobileMenu && (
              <div className="px-0 md:px-0" style={{ marginTop: '2px', marginBottom: '20px' }}>
                <button
                  onClick={() => {
                    navigate('/shop/order-form', {
                      state: {
                        orderNumber: orderData.orderNumber,
                        orderDate: orderData.orderDate,
                        firstName: orderData.firstName,
                        lastName: orderData.lastName,
                        email: orderData.email,
                        shippingAddress: orderData.shippingAddress,
                        city: orderData.city,
                        state: orderData.state,
                        zip: orderData.zip,
                        country: orderData.country
                      }
                    });
                  }}
                  className="border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
                  style={{
                    borderWidth: '1.3px',
                    color: '#EB1C24',
                    fontFamily: '"Futura PT Medium"',
                    backgroundColor: '#FFFFFF',
                    textTransform: 'uppercase'
                  }}
                  type="button"
                >
                  SIGN ORDER FORM
                </button>
              </div>
            )}

            {/* ORDER SUMMARY CARD - Only show when menu is closed */}
            {!showMobileMenu && (() => {
              const accountUser = (() => { try { const u = localStorage.getItem('currentUser'); return u ? JSON.parse(u) : null; } catch { return null; } })();
              const addr = accountUser?.defaultAddress || accountUser?.shippingAddress;
              return (
              <div
                className="border border-black flex flex-col pt-6 pb-4 px-5 mb-2 bg-white/60 backdrop-blur-sm transition-all duration-300 ease-out"
                style={{ borderWidth: '1.3px' }}
              >
              {/* ORDER SUMMARY */}
              <div style={{ marginBottom: '55px' }}>
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
                  <img src={summaryIcon} alt="" style={{ width: 12.75, height: 12.75, opacity: 1 }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>
                      ORDER DATE
                    </span>
                    <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>
                      {orderData.orderDate}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>
                      ORDER TOTAL
                    </span>
                    <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }} dangerouslySetInnerHTML={formatPrice(orderData.orderTotal || 0)} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>
                      ORDER NUMBER
                    </span>
                    <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>
                      {orderData.orderNumber}
                    </span>
                  </div>
                </div>
              </div>

              {/* SHIPPING */}
              <div style={{ marginBottom: '55px' }}>
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
                  <img src="/assets/ship-icon.svg" alt="" style={{ width: 12.83, height: 12.83, opacity: 1 }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', margin: '0', textTransform: 'uppercase' }}>
                    {orderData.firstName || accountUser?.firstName || ''} {orderData.lastName || accountUser?.lastName || ''}
                  </p>
                  <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', margin: '0', textTransform: 'uppercase' }}>
                    {orderData.shippingAddress || addr?.address || ''}
                  </p>
                  <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', margin: '0', textTransform: 'uppercase' }}>
                    {orderData.city || addr?.city || ''}, {orderData.state || addr?.state || ''} {orderData.zip || addr?.zip || ''}
                  </p>
                  <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', margin: '0', textTransform: 'uppercase' }}>
                    {orderData.country || addr?.country || 'UNITED STATES'}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>
                      COMPLETION TIMELINE
                    </span>
                    <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>
                      {orderData.orderDate ? calculateProcessingTimeline(orderData.orderDate, orderData.processingTime || '6-8 WEEKS') : (orderData.processingTime || '6-8 WEEKS')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>
                      CARRIER
                    </span>
                    <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>
                      {/^US$|^USA$|^UNITED\s*STATES$/i.test(String(orderData.country || addr?.country || 'UNITED STATES').trim()) ? 'DOMESTIC' : 'INTERNATIONAL'}
                    </span>
                  </div>
                  {(() => {
                    const shippingMethod = orderData.shippingMethod || 'UPS DOMESTIC STANDARD +$60';
                    // Remove price first
                    let methodName = shippingMethod.replace(/\s*\+?\$?\d+.*$/, '').trim();
                    // Remove common carrier names (UPS, DHL, FedEx, USPS, etc.) - case insensitive
                    methodName = methodName
                      .replace(/^(UPS|DHL|FEDEX|USPS|FEDEX\s+EXPRESS|FEDEX\s+GROUND)\s+/i, '')
                      .replace(/\s+(UPS|DHL|FEDEX|USPS)$/i, '')
                      .trim();
                    
                    // Ensure proper formatting (all caps, no extra spaces, replace underscores with spaces)
                    methodName = methodName.toUpperCase().replace(/_/g, ' ').replace(/\s+/g, ' ');
                    
                    // Determine shipping time based on method
                    const getShippingTime = (method: string): string => {
                      const methodUpper = method.toUpperCase();
                      if (methodUpper.includes('EXPRESS')) {
                        return '1-2 BUSINESS DAYS';
                      } else if (methodUpper.includes('STANDARD') || methodUpper.includes('DOMESTIC')) {
                        return '3-5 BUSINESS DAYS';
                      } else if (methodUpper.includes('INTERNATIONAL')) {
                        return '7-14 BUSINESS DAYS';
                      }
                      return '3-5 BUSINESS DAYS'; // Default
                    };
                    
                    const shippingTime = getShippingTime(methodName);
                    
                    return (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>
                          {methodName}
                        </span>
                        <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>
                          {shippingTime}
                        </span>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* PAYMENT */}
              <div style={{ marginBottom: '55px' }}>
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
                  <img src="/assets/payment-icon.svg" alt="" style={{ width: 14.25, height: 14.25, opacity: 1 }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(() => {
                    let methodName = ''; // Left: VISA, MASTERCARD, AMERICAN EXPRESS, etc.
                    let last4 = '';     // Right: last 4 digits only (no XXXX when we have data)
                    const fromOrder = orderData.paymentMethod;
                    if (fromOrder) {
                      const endingMatch = fromOrder.match(/ENDING IN (\d+)/i);
                      last4 = endingMatch ? endingMatch[1] : '';
                      let brandPart = fromOrder.replace(/\s*ENDING IN \d+.*$/i, '').trim().replace(/_/g, ' ');
                      methodName = (brandPart === 'EXPRESS' ? 'AMERICAN EXPRESS' : brandPart).toUpperCase();
                    }
                    if (!methodName || !last4) {
                      try {
                        const currentUser = localStorage.getItem('currentUser');
                        if (currentUser) {
                          const user = JSON.parse(currentUser);
                          const def = user.defaultPaymentMethod;
                          if (def && def.cardNumber) {
                            last4 = String(def.cardNumber).replace(/\D/g, '').slice(-4);
                            const b = (def.cardBrand || '').toUpperCase().replace(/_/g, ' ');
                            methodName = (b === 'EXPRESS' || b === 'AMEX') ? 'AMERICAN EXPRESS' : (b || 'CARD');
                          }
                        }
                      } catch (_e) {}
                    }
                    if (!methodName) methodName = 'CARD';
                    if (!last4) last4 = '****';
                    return (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>
                          {methodName}
                        </span>
                        <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>
                          ENDING IN {last4}
                        </span>
                      </div>
                    );
                  })()}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>
                      CONFIRMATION EMAIL
                    </span>
                    <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>
                      {orderData.email || accountUser?.email || ''}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>
                      CONFIRMATION NUMBER
                    </span>
                    <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>
                      #{orderData.confirmationNumber || (() => {
                        // Retrieve confirmation number from localStorage if order number exists
                        if (orderData.orderNumber) {
                          const orderConfirmations = JSON.parse(localStorage.getItem('orderConfirmations') || '{}');
                          const storedConfirmation = orderConfirmations[orderData.orderNumber];
                          if (storedConfirmation) {
                            return storedConfirmation;
                          }
                        }
                        // Generate new confirmation number if not found
                        const generateConfirmationNumber = () => {
                          const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                          let result = '';
                          for (let i = 0; i < 6; i++) {
                            result += chars.charAt(Math.floor(Math.random() * chars.length));
                          }
                          return result;
                        };
                        const confirmationNumber = generateConfirmationNumber();
                        if (orderData.orderNumber) {
                          const orderConfirmations = JSON.parse(localStorage.getItem('orderConfirmations') || '{}');
                          orderConfirmations[orderData.orderNumber] = confirmationNumber;
                          localStorage.setItem('orderConfirmations', JSON.stringify(orderConfirmations));
                        }
                        return confirmationNumber;
                      })()}
                    </span>
                  </div>
                </div>
              </div>

              {/* REWARDS */}
              {(
                <div>
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
                      REWARDS
                    </h2>
                    <img src="/assets/rewards-icon.svg" alt="" style={{ width: 14.55, height: 14.55, opacity: 1, filter: 'invert(27%) sepia(98%) saturate(7151%) hue-rotate(349deg) brightness(92%) contrast(92%)' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', margin: '0', textTransform: 'uppercase' }}>
                        YOU'RE EARNING <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"' }}>{(orderData.pointsEarned ?? accountUser?.loyaltyPoints ?? orderData.orderTotal ?? 1290).toLocaleString()}</span> POINTS{(orderData.pointsEarned ?? accountUser?.loyaltyPoints ?? orderData.orderTotal ?? 1290) === 0 ? '.' : '!'}
                      </p>
                      <span style={{ 
                        fontFamily: (() => {
                          const tier = (orderData.tier || accountUser?.tier || 'SILVER').toUpperCase();
                          if (tier === 'RED' || tier === 'GOLD') return '"Futura PT Medium"';
                          return '"Futura PT Demi"'; // SILVER and default
                        })(),
                        fontSize: '10px', 
                        color: (() => {
                          const tier = (orderData.tier || accountUser?.tier || 'SILVER').toUpperCase();
                          if (tier === 'RED') return '#EB1C24';
                          if (tier === 'SILVER') return '#808080';
                          if (tier === 'GOLD') return '#000000';
                          return '#808080'; // Default to gray
                        })(),
                        textTransform: 'uppercase' 
                      }}>
                        {(orderData.tier || accountUser?.tier || 'SILVER').toUpperCase()} TIER
                      </span>
                    </div>
                  </div>
                </div>
              )}
              </div>
            );
            })()}

            {/* Navigation Buttons */}
            {!showMobileMenu && (
              <>
                <div className="px-0 md:px-0" style={{ marginTop: '2px' }}>
                  <button
                    onClick={handleHomeClick}
                    className="border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
                    style={{
                      borderWidth: '1.3px',
                      color: '#EB1C24',
                      fontFamily: '"Futura PT Medium"',
                      backgroundColor: '#FFFFFF',
                      textTransform: 'uppercase'
                    }}
                    type="button"
                  >
                    HOME
                  </button>
                </div>
                <div className="px-0 md:px-0" style={{ marginTop: '10px' }}>
                  <button
                    onClick={() => {
                      if (isSignedIn) {
                        navigate('/account/orders');
                      } else {
                        navigate('/sign-in?returnTo=checkout/summary');
                      }
                    }}
                    className="border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
                    style={{
                      borderWidth: '1.3px',
                      color: '#EB1C24',
                      fontFamily: '"Futura PT Medium"',
                      backgroundColor: '#FFFFFF',
                      textTransform: 'uppercase'
                    }}
                    type="button"
                  >
                    TRACK YOUR ORDERS
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Sign Out Confirmation Modal */}
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
    </>
  );
}

export default CheckoutConfirmPage;

