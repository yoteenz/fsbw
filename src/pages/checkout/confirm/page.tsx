import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DynamicCartIcon from '../../../components/DynamicCartIcon';

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
  const [isSignedIn, setIsSignedIn] = useState(false);
  
  // Order data - get from location state or generate
  const [orderData, setOrderData] = useState(() => {
    if (location.state) {
      return location.state;
    }
    // Fallback data if no state passed - include mock rewards data
    // Calculate a mock order total (base price + taxes + shipping)
    const mockBaseTotal = 1290; // Mock base order amount
    const mockTaxesProcessing = mockBaseTotal * 0.10;
    const mockShippingHandling = 60;
    const mockOrderTotal = mockBaseTotal + mockTaxesProcessing + mockShippingHandling;
    
    return {
      orderNumber: `#${Math.floor(Math.random() * 1000)}`,
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
    
    // If no order data from location state, populate with mock data
    if (!location.state) {
      // Calculate order total from cart items (use 1290 as default if cart is empty)
      const calculatedTotal = cartItems.length > 0 
        ? cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0)
        : 1290;
      const taxesProcessing = calculatedTotal * 0.10;
      const shippingHandling = 60; // Standard shipping
      const subtotal = calculatedTotal + taxesProcessing + shippingHandling;
      const pointsEarned = Math.round(calculatedTotal);
      
      // Determine tier based on points
      let tier = 'SILVER';
      if (pointsEarned >= 5000) {
        tier = 'RED';
      } else if (pointsEarned >= 2000) {
        tier = 'GOLD';
      }
      
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
      
      setOrderData((prev: any) => ({
        ...prev,
        orderNumber: prev.orderNumber || `#${Math.floor(Math.random() * 1000)}`,
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
        paymentMethod: prev.paymentMethod || 'VISA MASTERCARD ENDING IN 8065',
        email: prev.email || 'ASHLEYEVANS@GMAIL.COM',
        pointsEarned: prev.pointsEarned || (pointsEarned > 0 ? pointsEarned : 1290), // Ensure points are shown
        tier: prev.tier || tier
      }));
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
    
    // Calculate max scroll based on actual item width (150px) + gap (20px)
    const itemWidth = 150;
    const gap = 20;
    const totalItemWidth = itemWidth + gap;
    const maxScroll = 0;
    const minScroll = -(cartItems.length - 1) * totalItemWidth;
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
    
    // Calculate max scroll based on actual item width (150px) + gap (20px)
    const itemWidth = 150;
    const gap = 20;
    const totalItemWidth = itemWidth + gap;
    const maxScroll = 0;
    const minScroll = -(cartItems.length - 1) * totalItemWidth;
    setScrollPosition(Math.max(minScroll, Math.min(maxScroll, newPosition)));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Format price with currency
  const formatPrice = React.useCallback((price: number) => {
    if (!price || isNaN(price)) {
      const currency = currencyRates[selectedCurrency as keyof typeof currencyRates];
      return { __html: currency.symbol + '0 ' + selectedCurrency };
    }
    const currency = currencyRates[selectedCurrency as keyof typeof currencyRates];
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
    
    const hairline = item.hairline || 'NATURAL';
    const hairlineUpper = hairline.toUpperCase();
    const hasPeak = hairlineUpper.includes('PEAK');
    const hasLagos = hairlineUpper.includes('LAGOS');
    
    if (item.name === 'NOIR') {
      if (hasPeak) {
        return '/assets/noir-peak-thumb.png';
      } else if (hasLagos) {
        return '/assets/noir-lagos-thumb.png';
      }
      return item.image || '/assets/NOIR/noir-thumb.png';
    }
    
    return item.image || '/assets/NOIR/noir-thumb.png';
  };

  const getHairOrigin = (productName: string) => {
    switch (productName) {
      case 'NOIR':
        return 'CAMBODIAN';
      case 'BLANCO':
        return 'CAMBODIAN';
      case 'SOFT CURL':
        return 'VIETNAMESE';
      case 'OCEAN CURL':
        return 'FILIPINO';
      case 'SOFT WAVE':
        return 'INDIAN';
      case 'BEACH WAVE':
        return 'INDONESIAN';
      default:
        return 'CAMBODIAN';
    }
  };

  // Helper functions for price calculations (matching checkout page)
  const _getColorPrice = (color: string, length?: string, productName?: string) => {
    if (productName === 'BLANCO') {
      const blancoColorPrices: { [key: string]: number } = {
        'GOLDEN': -20,
        'PLATINUM': 0,
        'ASH': 20
      };
      return blancoColorPrices[color] || 0;
    }
    
    const colorPrices: { [key: string]: number } = {
      'JET BLACK': 100,
      'OFF BLACK': 0,
      'ESPRESSO': 100,
      'CHESTNUT': 100,
      'HONEY': 100,
      'AUBURN': 100,
      'COPPER': 100,
      'GINGER': 100,
      'SANGRIA': 100,
      'CHERRY': 100,
      'RASPBERRY': 100,
      'PLUM': 100,
      'COBALT': 100,
      'TEAL': 100,
      'SLIME': 100,
      'CITRINE': 100
    };
    
    let basePrice = colorPrices[color] || 0;
    
    if (basePrice > 0 && length && ['30"', '32"', '34"', '36"', '40"'].includes(length)) {
      basePrice += 40;
    }
    
    return basePrice;
  };

  const _getDensityPrice = (density: string) => {
    const densityPrices: { [key: string]: number } = {
      '130%': -60,
      '150%': -40,
      '180%': -20,
      '200%': 0,
      '250%': 80,
      '300%': 160,
      '350%': 240,
      '400%': 320
    };
    return densityPrices[density] || 0;
  };

  const _getLacePrice = (lace: string) => {
    const lacePrices: { [key: string]: number } = {
      '13X6': 0,
      '13X4': -20,
      '13X5': 0,
      '2X6': -40,
      '4X4': -40,
      '5X5': -20,
      '6X6': 60,
      '7X7': 100,
      '9X6': 80,
      '360': 160,
      'FULL': 240,
      'FULL LACE': 240
    };
    return lacePrices[lace] || 0;
  };

  const _getHairlinePrice = (hairline: string) => {
    if (!hairline) return 0;
    const hairlineArray = hairline.split(',');
    let total = 0;
    
    hairlineArray.forEach(h => {
      const hairlinePrices: { [key: string]: number } = {
        'NATURAL': 0,
        'PEAK': 40,
        'LAGOS': 60
      };
      total += hairlinePrices[h.trim()] || 0;
    });
    
    if (hairlineArray.includes('LAGOS') && hairlineArray.includes('PEAK')) {
      total -= 20;
    }
    
    return total;
  };

  const _getStylingPrice = (styling: string) => {
    if (!styling || styling === 'NONE') return 0;
    
    const stylingPrices: { [key: string]: number } = {
      'BANGS': 40,
      'CRIMPS': 80,
      'FLAT IRON': 80,
      'LAYERS': 100
    };
    
    if (styling.includes(',')) {
      const stylingArray = styling.split(',');
      const hasBangs = stylingArray.includes('BANGS');
      const otherStyling = stylingArray.find(s => s !== 'BANGS');
      
      if (hasBangs && otherStyling) {
        return (stylingPrices[otherStyling.trim()] || 0) + 20;
      } else if (hasBangs) {
        return 40;
      } else if (otherStyling) {
        return stylingPrices[otherStyling.trim()] || 0;
      } else {
        return 0;
      }
    }
    
    return stylingPrices[styling] || 0;
  };

  const _getAddOnsPrice = (addOns: string[], laceSize?: string) => {
    if (!addOns || addOns.length === 0) return 0;
    
    const addOnBasePrices: { [key: string]: number } = {
      'BLEACH': 60,
      'PLUCK': 80,
      'BLUNT CUT': 20
    };
    
    const discountedLaceSizes = ['2X6', '4X4', '5X5', '6X6', '7X7'];
    const hasLaceDiscount = laceSize && discountedLaceSizes.includes(laceSize);
    
    return addOns.reduce((total, addOn) => {
      let price = addOnBasePrices[addOn] || 0;
      
      if (hasLaceDiscount && (addOn === 'BLEACH' || addOn === 'PLUCK')) {
        price -= 20;
      }
      
      return total + price;
    }, 0);
  };

  // Generate detail text (same logic as checkout page)
  const getDetailText = (item: any) => {
    let text = '';
    
    const items: any[] = [];
    if (item.capSize && (item.capSize === 'XXS/XS/S' || item.capSize === 'S/M/L')) {
      items.push({ type: 'capSize', value: item.capSize, fullName: 'FLEX CAP' });
    }
    if (item.length && item.length !== '24"') {
      items.push({ type: 'length', value: item.length, fullName: item.length });
    }
    if (item.density && item.density !== '200%') items.push({ type: 'density', value: item.density, fullName: `${item.density} density` });
    if (item.lace && item.lace !== '13X6') items.push({ type: 'lace', value: item.lace, fullName: `${item.lace} lace` });
    
    let itemColor = item.color;
    if (item.name === 'BLANCO') {
      const validBlancoColors = ['GOLDEN', 'PLATINUM', 'ASH'];
      if (!itemColor || !validBlancoColors.includes(itemColor)) {
        itemColor = 'PLATINUM';
      }
    }
    const defaultColor = item.name === 'BLANCO' ? 'PLATINUM' : 'OFF BLACK';
    if (itemColor && itemColor !== defaultColor) items.push({ type: 'color', value: itemColor, fullName: itemColor });
    if (item.hairline && item.hairline !== 'NATURAL') items.push({ type: 'hairline', value: item.hairline, fullName: `${item.hairline} hairline` });
    
    const hairStylingOptions = ['BANGS', 'CRIMPS', 'FLAT IRON', 'LAYERS'];
    if (item.styling && item.styling !== 'NONE' && hairStylingOptions.includes(item.styling) && item.partSelection) {
      items.push({ type: 'styling', value: item.styling, partSelection: item.partSelection, fullName: item.styling });
    }
    
    if (item.addOns && item.addOns.length > 0) items.push({ type: 'addOns', value: item.addOns, fullName: item.addOns });
    
    const customizableItems = items.filter(item => item.type !== 'density' && item.type !== 'lace');
    const useFullNames = customizableItems.length === 1;
    
    const formatPriceDisplay = (price: number): string => {
      if (price === 0 || price === null || price === undefined || isNaN(price)) {
        return '';
      }
      const currency = currencyRates[selectedCurrency as keyof typeof currencyRates] || currencyRates.USD;
      const convertedPrice = price * currency.rate;
      const sign = price > 0 ? '+' : '-';
      const priceStr = Math.abs(convertedPrice).toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
      return ' <span style="color: #000000;">' + sign + currency.symbol + priceStr + '</span>';
    };
    
    items.forEach((itemData) => {
      if (text) {
        text += '<br/>';
      }
      
      if (itemData.type === 'capSize') {
        const price = 40;
        const priceDisplay = formatPriceDisplay(price);
        text += `FLEX CAP${priceDisplay}`;
      } else if (itemData.type === 'length') {
        const lengthValue = typeof itemData.value === 'string' ? itemData.value : String(itemData.value);
        const lengthNum = parseInt(lengthValue.replace('"', ''));
        const baseLength = 24;
        const difference = lengthNum - baseLength;
        
        const lengthPrices: { [key: string]: number } = {
          '16"': -50, '18"': -25, '20"': -10, '22"': -5, '24"': 0,
          '26"': 50, '28"': 100, '30"': 150, '32"': 200, '34"': 250, '36"': 300, '40"': 400
        };
        const price = lengthPrices[lengthValue] || 0;
        const priceDisplay = formatPriceDisplay(price);
        
        if (difference > 0) {
          text += `${Math.abs(difference)}" ADDED${priceDisplay}`;
        } else if (difference < 0) {
          text += `${Math.abs(difference)}" REMOVED${priceDisplay}`;
        }
      } else if (itemData.type === 'density') {
        const densityValue = typeof itemData.value === 'string' ? itemData.value : String(itemData.value);
        const price = _getDensityPrice(densityValue);
        const priceDisplay = formatPriceDisplay(price);
        text += `${densityValue} DENSITY${priceDisplay}`.toUpperCase();
      } else if (itemData.type === 'lace') {
        const laceValue = typeof itemData.value === 'string' ? itemData.value : String(itemData.value);
        const price = _getLacePrice(laceValue);
        const priceDisplay = formatPriceDisplay(price);
        text += `${laceValue} LACE${priceDisplay}`.toUpperCase();
      } else if (itemData.type === 'color') {
        const colorValue = typeof itemData.value === 'string' ? itemData.value : String(itemData.value);
        const itemLength = item.length || '24"';
        const price = _getColorPrice(colorValue, itemLength, item.name);
        const priceDisplay = formatPriceDisplay(price);
        text += `${colorValue} COLOR${priceDisplay}`.toUpperCase();
      } else if (itemData.type === 'hairline') {
        const hairlineValue = typeof itemData.value === 'string' ? itemData.value : String(itemData.value);
        const hairlineUpper = hairlineValue.toUpperCase();
        const price = _getHairlinePrice(hairlineValue);
        const priceDisplay = formatPriceDisplay(price);
        
        if (hairlineUpper.includes('LAGOS') && hairlineUpper.includes('PEAK')) {
          text += `LAGOS + PEAK HAIRLINE${priceDisplay}`;
        } else {
          text += `${hairlineValue} HAIRLINE${priceDisplay}`.toUpperCase();
        }
      } else if (itemData.type === 'styling') {
        const stylingValue = typeof itemData.value === 'string' ? itemData.value : String(itemData.value);
        const price = _getStylingPrice(stylingValue);
        const priceDisplay = formatPriceDisplay(price);
        
        if (useFullNames) {
          const displayValue = itemData.fullName;
          const displayText = typeof displayValue === 'string' ? displayValue : String(displayValue);
          text += displayText.toUpperCase() + priceDisplay;
        } else {
          let partAbbrev = '';
          switch (itemData.partSelection) {
            case 'LEFT': partAbbrev = '(L)'; break;
            case 'RIGHT': partAbbrev = '(R)'; break;
            case 'MIDDLE':
            default: partAbbrev = '(M)'; break;
          }
          text += partAbbrev;
          
          if (typeof itemData.value === 'string') {
            const stylingText = itemData.value.toUpperCase().replace(/ /g, '\u00A0');
            text += '\u00A0' + stylingText + priceDisplay;
          }
        }
      } else if (itemData.type === 'addOns') {
        const itemLace = item.lace || '13X6';
        
        if (Array.isArray(itemData.value)) {
          itemData.value.forEach((addOn: string) => {
            const addOnPrice = _getAddOnsPrice([addOn], itemLace);
            const addOnPriceDisplay = formatPriceDisplay(addOnPrice);
            const addOnText = addOn.toUpperCase().replace(/BLEACH/g, 'BLEACH KNOTS').replace(/ /g, '\u00A0');
            if (text && !text.endsWith('<br/>')) text += '<br/>';
            text += addOnText + addOnPriceDisplay;
          });
        } else {
          const addOnPrice = _getAddOnsPrice([String(itemData.value)], itemLace);
          const addOnPriceDisplay = formatPriceDisplay(addOnPrice);
          const addOnText = String(itemData.value).toUpperCase().replace(/BLEACH/g, 'BLEACH KNOTS').replace(/ /g, '\u00A0');
          text += addOnText + addOnPriceDisplay;
        }
      }
    });
    
    return text;
  };

  const handleMobileMenuToggle = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <>
      <style>{`
        input::placeholder,
        textarea::placeholder {
          font-family: "Futura PT Demi", "Futura PT", Futura, Inter, sans-serif !important;
          font-weight: 500;
          color: #909090 !important;
        }
        input,
        textarea {
          font-family: "Futura PT Demi", "Futura PT", Futura, Inter, sans-serif !important;
          font-weight: 500 !important;
          color: #909090 !important;
          text-transform: uppercase !important;
          background-color: #FFFFFF !important;
        }
      `}</style>
      <div className="min-h-screen" style={{ position: 'relative' }}>
        {/* Marble Background */}
        <div 
          className="fixed inset-0 -z-10"
          style={{
            backgroundImage: `url('/assets/Marble Floor.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
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
                      PLACED
                    </span>
                  </>
                )}
              </p>

              {/* Right side icons */}
              <div className="gap-5 flex absolute" style={{ right: showMobileMenu ? '14px' : '17px' }}>
                <div style={{ transform: showMobileMenu ? 'translateY(0.7px)' : 'none' }}>
                  <DynamicCartIcon count={cartCount} width={22} height={19} />
                </div>
                <img
                  alt="Menu"
                  width="17"
                  height="18"
                  className="cursor-pointer"
                  src="/assets/menu-icon.svg"
                  onClick={handleMobileMenuToggle}
                />
              </div>
            </div>

            {/* MAIN CARD */}
            <div
              className="border border-black flex flex-col pt-6 pb-4 px-5 mb-2 bg-white/60 backdrop-blur-sm"
              style={{ borderWidth: '1.3px' }}
            >
              {/* CONGRATS Header */}
              <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '10px', marginTop: '-12px' }}>
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
                  style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', fontSize: '17px' }}
                >
                  {cartItems.length}
                </span>
              </div>

              {/* Products Horizontal Scroll */}
              <div 
                className="relative overflow-hidden mb-6"
                style={{ 
                  height: '180px',
                  cursor: isDragging ? 'grabbing' : 'grab',
                  userSelect: 'none'
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
                    willChange: 'transform'
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
                          src={itemImage}
                          alt={itemName}
                          style={{
                            width: (item.name === 'GIFT CARD' || item.type === 'gift-card') ? '53px' : '100px',
                            height: (item.name === 'GIFT CARD' || item.type === 'gift-card') ? '53px' : '100px',
                            objectFit: 'contain'
                          }}
                          draggable={false}
                        />
                        <p
                          style={{
                            fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                            fontSize: (() => {
                              if (item.name === 'SOFT CURL' || item.name === 'SOFT WAVE') {
                                return '12px';
                              }
                              return '15px';
                            })(),
                            fontWeight: '400',
                            color: '#000000',
                            margin: '4px 0 0 0',
                            lineHeight: '1.1',
                            textTransform: 'uppercase'
                          }}
                        >
                          {itemName.replace(/WIG/gi, '').trim()}
                        </p>
                        <p
                          style={{
                            fontFamily: '"Futura PT Book"',
                            fontSize: '7px',
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
                            textTransform: 'uppercase'
                          }}
                        >
                          {(() => {
                            if (item.name === 'GIFT CARD' || item.type === 'gift-card') {
                              return 'DIGITAL ONLY';
                            }
                            return `${itemLength} RAW ${itemHairOrigin}`;
                          })()}
                        </p>
                        {(() => {
                          const detailText = getDetailText(item);
                          if (!detailText) return null;
                          
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
                          const isBlanco = item.name === 'BLANCO';
                          let baseMargin = hasSpecs && !isGiftCard && !isBlancoNoSpecs ? '4px' : '1px';
                          if (isBlanco) {
                            const numValue = parseInt(baseMargin);
                            baseMargin = `${Math.max(0, numValue - 3)}px`;
                          }
                          
                          return (
                            <p
                              className="font-bold"
                              style={{
                                fontFamily: '"Futura PT Book"',
                                color: '#000000',
                                textTransform: 'uppercase',
                                fontSize: '7px',
                                marginTop: '1px',
                                marginRight: '10px',
                                lineHeight: '1.44',
                                marginBottom: '0',
                                wordBreak: 'break-word',
                                maxWidth: 'calc(100% - 10px)'
                              }}
                              dangerouslySetInnerHTML={{ __html: detailText }}
                            />
                          );
                        })()}
                        <p
                          style={{
                            fontFamily: '"Futura PT Book"',
                            fontSize: '7px',
                            color: '#909090',
                            margin: '4px 0 0 0',
                            textTransform: 'uppercase'
                          }}
                          dangerouslySetInnerHTML={formatPrice(itemPrice)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Processing Message */}
              <p
                style={{
                  fontFamily: '"Futura PT Book"',
                  fontSize: '10px',
                  color: '#000000',
                  margin: '16px 0 0 0',
                  textTransform: 'uppercase',
                  lineHeight: '1.4',
                  textAlign: 'center',
                  fontWeight: '600'
                }}
              >
                YOUR ORDER IS BEING PROCESSED BUT YOU'RE NOT FINISHED YET.<br/>YOU STILL NEED TO COMPLETE & SIGN AN ORDER AUTHORIZATION FORM WITHIN 24 HOURS TO COMPLETE THIS PURCHASE OR YOUR ORDER WILL BE AUTOMATICALLY CANCELED & REFUNDED.
              </p>
            </div>

            {/* Sign Order Form Button - Outside main card */}
            {!showMobileMenu && (
              <div className="px-0 md:px-0" style={{ marginTop: '2px', marginBottom: '20px' }}>
                <button
                  onClick={() => {
                    // Handle sign order form
                    console.log('Sign order form');
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

            {/* ORDER SUMMARY CARD */}
            <div
              className="border border-black flex flex-col pt-6 pb-4 px-5 mb-2 bg-white/60 backdrop-blur-sm"
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
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>
                      ORDER NUMBER
                    </span>
                    <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#909090', textTransform: 'uppercase' }}>
                      {orderData.orderNumber}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>
                      ORDER DATE
                    </span>
                    <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#909090', textTransform: 'uppercase' }}>
                      {orderData.orderDate}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>
                      ORDER TOTAL
                    </span>
                    <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#909090', textTransform: 'uppercase' }} dangerouslySetInnerHTML={formatPrice(orderData.orderTotal || 0)} />
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
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>
                      PROCESSING TIME
                    </span>
                    <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#909090', textTransform: 'uppercase' }}>
                      {orderData.processingTime || '6-8 WEEKS'}
                    </span>
                  </div>
                  {(() => {
                    const shippingMethod = orderData.shippingMethod || 'UPS DOMESTIC STANDARD +$60';
                    const methodName = shippingMethod.replace(/\s*\+?\$?\d+.*$/, '').trim();
                    
                    // Determine shipping time based on method
                    const getShippingTime = (method: string): string => {
                      const methodUpper = method.toUpperCase();
                      if (methodUpper.includes('EXPRESS')) {
                        return '1-2 BUSINESS DAYS';
                      } else if (methodUpper.includes('STANDARD') || methodUpper.includes('DOMESTIC')) {
                        return '3-5 BUSINESS DAYS';
                      } else if (methodUpper.includes('DHL') && methodUpper.includes('INTERNATIONAL')) {
                        return '5-10 BUSINESS DAYS';
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
                        <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#909090', textTransform: 'uppercase' }}>
                          {shippingTime}
                        </span>
                      </div>
                    );
                  })()}
                  <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', margin: '0', textTransform: 'uppercase' }}>
                    {orderData.firstName || 'ASHLEY'} {orderData.lastName || 'EVANS'}
                  </p>
                  <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', margin: '0', textTransform: 'uppercase' }}>
                    {orderData.shippingAddress || '3374 E SHELBY DR APT #106'}
                  </p>
                  <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', margin: '0', textTransform: 'uppercase' }}>
                    {orderData.city || 'MEMPHIS'}, {orderData.state || 'TN'} {orderData.zip || '38035'}
                  </p>
                  <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', margin: '0', textTransform: 'uppercase' }}>
                    {orderData.country || 'UNITED STATES'}
                  </p>
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
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(() => {
                    const paymentMethod = orderData.paymentMethod || 'VISA MASTERCARD ENDING IN 8065';
                    const endingMatch = paymentMethod.match(/ENDING IN (\d+)/i);
                    const endingNumber = endingMatch ? endingMatch[1] : '8065';
                    const methodName = paymentMethod.replace(/\s*ENDING IN \d+.*$/i, '').trim();
                    return (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>
                          {methodName}
                        </span>
                        <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#909090', textTransform: 'uppercase' }}>
                          ENDING IN {endingNumber}
                        </span>
                      </div>
                    );
                  })()}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', textTransform: 'uppercase' }}>
                      EMAIL ADDRESS
                    </span>
                    <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#909090', textTransform: 'uppercase' }}>
                      {orderData.email || 'ASHLEYEVANS@GMAIL.COM'}
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
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000000', margin: '0', textTransform: 'uppercase' }}>
                        YOU EARNED {(orderData.pointsEarned || 1290).toLocaleString()} LOYALTY POINTS!
                      </p>
                      <span style={{ 
                        fontFamily: (() => {
                          const tier = (orderData.tier || 'SILVER').toUpperCase();
                          if (tier === 'RED' || tier === 'GOLD') return '"Futura PT Medium"';
                          return '"Futura PT Demi"'; // SILVER and default
                        })(),
                        fontSize: '10px', 
                        color: (() => {
                          const tier = (orderData.tier || 'SILVER').toUpperCase();
                          if (tier === 'RED') return '#EB1C24';
                          if (tier === 'SILVER') return '#909090';
                          if (tier === 'GOLD') return '#000000';
                          return '#909090'; // Default to gray
                        })(),
                        textTransform: 'uppercase' 
                      }}>
                        {(orderData.tier || 'SILVER').toUpperCase()} TIER
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            {!showMobileMenu && (
              <>
                <div className="px-0 md:px-0" style={{ marginTop: '2px' }}>
                  <button
                    onClick={() => navigate('/lobby')}
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
                        navigate('/sign-in');
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
    </>
  );
}

export default CheckoutConfirmPage;

