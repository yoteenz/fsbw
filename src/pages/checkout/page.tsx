import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DynamicCartIcon from '../../components/DynamicCartIcon';
import ConfirmationModal from '../../components/ConfirmationModal';

function CheckoutPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<any[]>([]);
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

  // Form state
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showTermsRequiredModal, setShowTermsRequiredModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [selectedProcessing, setSelectedProcessing] = useState('standard');
  const [packageProtection, setPackageProtection] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [shippingCalculated, setShippingCalculated] = useState(false);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<{carrier: string, speed: string, cost: number} | null>(null);
  
  // Required form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [cardholder, setCardholder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [billingCity, setBillingCity] = useState('');
  const [billingState, setBillingState] = useState('');
  const [billingZip, setBillingZip] = useState('');
  
  // Validation modals
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

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

  // Check if any product has color, styling, or add-ons (non-default values)
  const hasColorStylingOrAddOns = React.useMemo(() => {
    return cartItems.some((item) => {
      // Skip gift cards
      if (item.name === 'GIFT CARD' || item.type === 'gift-card') {
        return false;
      }

      // Check for non-default color
      const defaultColor = item.name === 'BLANCO' ? 'PLATINUM' : 'OFF BLACK';
      const hasNonDefaultColor = item.color && item.color !== defaultColor;

      // Check for non-default styling
      const hasNonDefaultStyling = item.styling && item.styling !== 'NONE';

      // Check for add-ons
      const hasAddOns = item.addOns && Array.isArray(item.addOns) && item.addOns.length > 0;

      return hasNonDefaultColor || hasNonDefaultStyling || hasAddOns;
    });
  }, [cartItems]);
  
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

  // Helper functions for price calculations (matching CartDropdown)
  const _getColorPrice = (color: string, length?: string, productName?: string) => {
    // BLANCO colors
    if (productName === 'BLANCO') {
      const blancoColorPrices: { [key: string]: number } = {
        'GOLDEN': -20,  // -$20 discount
        'PLATINUM': 0,  // Default (free)
        'ASH': 20       // $20 additional cost
      };
      return blancoColorPrices[color] || 0;
    }
    
    // Other product colors
    const colorPrices: { [key: string]: number } = {
      'JET BLACK': 100,  // Fixed: JET BLACK should be $100, not $0
      'OFF BLACK': 0,    // Only OFF BLACK is free
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
    
    // Add extra $40 for lengths 30" and above (excluding OFF BLACK)
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
      '13X6': 0,      // Default - included in base price
      '13X4': -20,    // Less than default, discount
      '13X5': 0,
      '2X6': -40,     // Less than default, discount
      '4X4': -40,     // Less than default, discount
      '5X5': -20,     // Less than default, discount
      '6X6': 60,      // Additional cost
      '7X7': 100,     // Additional cost
      '9X6': 80,      // Additional cost
      '360': 160,     // Additional cost for 360 lace
      'FULL': 240,    // Additional cost for full lace
      'FULL LACE': 240 // Alias for FULL
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
    
    // Apply $20 discount to Lagos when combined with Peak
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
    
    // Handle multiple styling selections
    if (styling.includes(',')) {
      const stylingArray = styling.split(',');
      const hasBangs = stylingArray.includes('BANGS');
      const otherStyling = stylingArray.find(s => s !== 'BANGS');
      
      if (hasBangs && otherStyling) {
        return (stylingPrices[otherStyling.trim()] || 0) + 20; // $20 for bangs when combined
      } else if (hasBangs) {
        return 40; // Bangs only
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
    
    // Base prices from addons page
    const addOnBasePrices: { [key: string]: number } = {
      'BLEACH': 60,
      'PLUCK': 80,
      'BLUNT CUT': 20
    };
    
    // Lace sizes that get $20 discount for BLEACH and PLUCK
    const discountedLaceSizes = ['2X6', '4X4', '5X5', '6X6', '7X7'];
    const hasLaceDiscount = laceSize && discountedLaceSizes.includes(laceSize);
    
    return addOns.reduce((total, addOn) => {
      let price = addOnBasePrices[addOn] || 0;
      
      // Apply $20 discount for bleach and pluck when specific lace sizes are selected
      if (hasLaceDiscount && (addOn === 'BLEACH' || addOn === 'PLUCK')) {
        price -= 20;
      }
      
      return total + price;
    }, 0);
  };

  // Load cart items from localStorage
  const loadCartItems = () => {
    try {
      const stored = localStorage.getItem('cartItems');
      if (stored) {
        const items = JSON.parse(stored);
        if (Array.isArray(items)) {
          setCartItems(items);
        }
      }
    } catch (e) {
      console.error('Error loading cart items:', e);
      setCartItems([]);
    }
  };

  useEffect(() => {
    loadCartItems();
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
        loadCartItems();
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

  // Load selected currency
  useEffect(() => {
    const savedCurrency = localStorage.getItem('selectedCurrency');
    if (savedCurrency && currencyRates[savedCurrency as keyof typeof currencyRates]) {
      if (savedCurrency !== selectedCurrency) {
        setSelectedCurrency(savedCurrency);
      }
    }
  }, []);

  // Automatically switch to standard processing if rush becomes unavailable
  useEffect(() => {
    if (hasColorStylingOrAddOns && selectedProcessing === 'rush') {
      setSelectedProcessing('standard');
    }
  }, [hasColorStylingOrAddOns, selectedProcessing]);

  useEffect(() => {
    localStorage.setItem('selectedCurrency', selectedCurrency);
  }, [selectedCurrency]);

  useEffect(() => {
    const handleCurrencyChange = () => {
      const savedCurrency = localStorage.getItem('selectedCurrency');
      if (savedCurrency && currencyRates[savedCurrency as keyof typeof currencyRates]) {
        setSelectedCurrency(savedCurrency);
      }
    };

    window.addEventListener('storage', handleCurrencyChange);
    
    const handleCustomCurrencyChange = (event: CustomEvent) => {
      const newCurrency = event.detail;
      if (newCurrency && currencyRates[newCurrency as keyof typeof currencyRates]) {
        setSelectedCurrency(newCurrency);
        localStorage.setItem('selectedCurrency', newCurrency);
      }
    };
    
    window.addEventListener('currencyChanged', handleCustomCurrencyChange as EventListener);
    
    const interval = setInterval(() => {
      handleCurrencyChange();
    }, 500);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleCurrencyChange);
      window.removeEventListener('currencyChanged', handleCustomCurrencyChange as EventListener);
    };
  }, [currencyRates]);

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

  const formatPriceWithoutCurrency = React.useCallback((price: number) => {
    if (!price || isNaN(price)) {
      const currency = currencyRates[selectedCurrency as keyof typeof currencyRates];
      return { __html: currency.symbol + '0' };
    }
    const currency = currencyRates[selectedCurrency as keyof typeof currencyRates];
    const convertedPrice = price * currency.rate;
    return {
      __html: currency.symbol + convertedPrice.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      })
    };
  }, [currencyRates, selectedCurrency]);

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
    setIsSignedIn(!isSignedIn);
  };

  // Calculate available shipping options based on address
  const calculateShippingOptions = () => {
    if (!selectedCountry || !zipCode) return [];
    
    const isDomestic = selectedCountry === 'US';
    
    if (isDomestic) {
      // Domestic options: USPS, UPS, FedEx with standard or express
      return [
        { carrier: 'USPS', speed: 'standard', cost: 60, label: 'USPS DOMESTIC STANDARD $60' },
        { carrier: 'USPS', speed: 'express', cost: 80, label: 'USPS DOMESTIC EXPRESS $80' },
        { carrier: 'UPS', speed: 'standard', cost: 60, label: 'UPS DOMESTIC STANDARD $60' },
        { carrier: 'UPS', speed: 'express', cost: 80, label: 'UPS DOMESTIC EXPRESS $80' },
        { carrier: 'FedEx', speed: 'standard', cost: 60, label: 'FEDEX DOMESTIC STANDARD $60' },
        { carrier: 'FedEx', speed: 'express', cost: 80, label: 'FEDEX DOMESTIC EXPRESS $80' },
      ];
    } else {
      // International options: DHL only with standard
      return [
        { carrier: 'DHL', speed: 'standard', cost: 100, label: 'DHL INTERNATIONAL STANDARD $100' },
      ];
    }
  };

  const availableShippingOptions = calculateShippingOptions();

  // Calculate order totals
  const orderAmount = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  const taxesProcessing = orderAmount * 0.10; // 10% sales tax on order amount (excluding shipping & discounts)
  
  // Calculate shipping based on selected method
  const getShippingCost = () => {
    if (!selectedShippingMethod) return 0;
    return selectedShippingMethod.cost || 0;
  };
  const shippingHandling = getShippingCost();
  
  const discount = 0;
  const rushProcessing = selectedProcessing === 'rush' ? 100 : 0;
  const protectionFee = packageProtection ? 5 : 0;
  const subtotal = orderAmount + taxesProcessing + shippingHandling + rushProcessing + protectionFee - discount;

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
        }
        label span[style*="#EB1C24"] {
          color: #EB1C24 !important;
        }
        label span {
          color: #EB1C24 !important;
        }
      `}</style>
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
                    onClick={() => navigate('/bag')}
                  >
                    BAG &gt;
                  </span>{' '}
                  <span
                    style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}
                  >
                    CHECKOUT
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
            style={{ 
              borderWidth: '1.3px', 
              minWidth: '100%', 
              maxWidth: 'none', 
              overflow: 'visible',
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              willChange: 'backdrop-filter',
              minHeight: showMobileMenu ? '560px' : 'auto'
            }}
          >
            {showMobileMenu ? (
              /* MENU CONTENT */
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
                      paddingBottom: '4px',
                      background: 'none',
                      border: 'none',
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
                      paddingBottom: '4px',
                      background: 'none',
                      border: 'none',
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
                      paddingBottom: '4px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    BRAND
                  </button>
                </div>

                {/* Menu Items */}
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
                            textTransform: 'uppercase'
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
                            textTransform: 'uppercase'
                          }}>
                            {item}
                          </span>
                        </div>
                      ))
                    ) : (
                      [
                        { label: 'UNITS', hasArrow: true, isExpandable: true, subItems: ['STRAIGHT', 'WAVY', 'CURLY'] },
                        { label: 'BOOKING', hasArrow: true, isExpandable: true, subItems: ['APPOINTMENT', 'CONSULTATION'] },
                        { label: 'BUILD-A-WIG', hasArrow: false },
                        { label: 'ORDER AUTHORIZATION FORM', hasArrow: false }
                      ].map((item, index) => (
                        <div key={index}>
                          <div 
                            className="flex items-center justify-between cursor-pointer"
                            style={{ alignItems: 'center' }}
                            onClick={() => {
                              if (item.isExpandable) {
                                if (item.label === 'UNITS' && mobileMenuExpandedItems.includes(item.label)) {
                                  navigate('/products/units');
                                } else {
                                  handleMobileMenuItemToggle(item.label);
                                }
                              }
                            }}
                          >
                            <span style={{ 
                              fontFamily: '"Futura PT Book"',
                              fontSize: '14px',
                              color: 'black',
                              fontWeight: '500',
                              textTransform: 'uppercase'
                            }}>
                              {item.label}
                            </span>
                            {item.hasArrow && (
                              <img
                                src="/assets/NOIR/closed-arrow.svg"
                                alt="Arrow"
                                style={{ 
                                  width: '16px', 
                                  height: '16px',
                                  transform: `${mobileMenuExpandedItems.includes(item.label) ? 'rotate(90deg)' : 'rotate(0deg)'} translateY(-4px)`,
                                  display: 'flex',
                                  alignItems: 'center'
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

                {/* Sign In/Out */}
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

                {/* Social Media Icons */}
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
            ) : (
              /* CHECKOUT CONTENT */
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* ORDER SUMMARY HEADER */}
                <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '10px', marginTop: '-12px' }}>
                  <button
                    className="text-red-500 font-bold text-lg tracking-wider truncate hover:text-red-600 transition-colors text-left uppercase"
                    style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '12px', fontWeight: '500' }}
                  >
                    ORDER SUMMARY
                  </button>
                  <span
                    className="text-black font-bold text-lg flex-shrink-0 ml-2 uppercase"
                    style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', fontSize: '17px' }}
                    dangerouslySetInnerHTML={formatPriceWithoutCurrency(orderAmount)}
                  >
                  </span>
                </div>

                {/* SHOPPING BAG CARD */}
                {cartItems.length > 0 && (
                  <div
                    className="border border-black flex flex-col p-4 mb-2 bg-white/60 backdrop-blur-sm"
                    style={{ 
                      borderWidth: '1.3px', 
                      minWidth: '100%', 
                      maxWidth: 'none', 
                      backgroundColor: 'rgba(255, 255, 255, 0.6)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      willChange: 'backdrop-filter'
                    }}
                  >
                    {/* Shopping Bag Header */}
                    <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200">
                      <button
                        className="text-red-500 font-bold text-lg tracking-wider truncate hover:text-red-600 transition-colors text-left uppercase"
                        style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '12px', fontWeight: '500' }}
                      >
                        SHOPPING BAG
                      </button>
                    <span 
                        className="text-black font-bold text-lg flex-shrink-0 ml-2 uppercase"
                        style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', fontSize: '17px' }}
                      >
                        {cartItems.length}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="flex-1 flex flex-col overflow-hidden mt-2">
                      {/* Cart Items - scrollable */}
                      <div className="flex flex-col justify-start items-start gap-0 my-2 flex-shrink-0 overflow-y-auto" style={{ maxHeight: '265px', scrollBehavior: 'smooth', width: '100%' }}>
                        {cartItems.map((item, index) => {
                          const itemId = item.id || `cart-item-${index}`;
                          const itemName = item.name || 'NOIR';
                          
                          // Get the correct image based on product name and hairline
                          const getItemImage = () => {
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
                          const itemImage = getItemImage();
                          
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
                          
                          const itemLength = item.length || '24"';
                          const itemHairOrigin = getHairOrigin(item.name);
                          const itemPrice = item.price || 580;
                          const itemQuantity = item.quantity ?? 0;
                          const isLastItem = index === cartItems.length - 1;

                          return (
                            <div
                              key={itemId}
                              className="flex items-center justify-start space-x-3"
                              style={{
                                minHeight: '80px',
                                paddingTop: '8px',
                                paddingBottom: '8px',
                                borderBottom: isLastItem ? 'none' : '1px solid #e5e7eb',
                                width: '100%',
                                flexShrink: 0
                              }}
                            >
                              {/* Thumbnail Container */}
                              <div className="flex flex-col items-center" style={{ flexShrink: 0, width: '88px' }}>
                                <div 
                                  className="flex items-center justify-center"
                                  style={{ width: (item.name === 'GIFT CARD' || item.type === 'gift-card') ? '106px' : '88px', height: (item.name === 'GIFT CARD' || item.type === 'gift-card') ? '106px' : '88px' }}
                                >
                                  <img
                                    src={itemImage}
                                    alt={itemName}
                                    className="object-cover rounded"
                                    style={{ width: (item.name === 'GIFT CARD' || item.type === 'gift-card') ? '106px' : '88px', height: (item.name === 'GIFT CARD' || item.type === 'gift-card') ? '106px' : '88px' }}
                                  />
                                </div>
                                
                                {/* EDIT IN BUILD-A-WIG text - Only show for units, not gift cards */}
                                {!(item.name === 'GIFT CARD' || item.type === 'gift-card') && (
                                  <p 
                                    className="font-bold text-center"
                      style={{ 
                        fontFamily: '"Futura PT Book"',
                                      color: '#EB1C24',
                                      textTransform: 'uppercase',
                                      fontSize: '8px',
                                      marginTop: '6px',
                                      lineHeight: '1.1'
                                    }}
                                  >
                                    EDIT IN BUILD-A-WIG
                                  </p>
                                )}
                              </div>

                              {/* Item Details */}
                              <div className="flex-1 min-w-0 flex flex-col relative" style={{ marginLeft: '18px', paddingTop: '6px' }}>
                                <p 
                                  className="font-medium truncate cart-product-name"
                                  style={{ 
                                    fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                        color: '#000000',
                                    textTransform: 'uppercase',
                                    fontSize: (() => {
                                      if (item.name === 'SOFT CURL' || item.name === 'SOFT WAVE') {
                                        return '18px'; // Decreased by 2px for SOFT CURL, SOFT WAVE
                                      }
                                      return '23px'; // 23px for NOIR, BLANCO, GIFT CARD, OCEAN CURL, BEACH WAVE
                                    })(),
                                    lineHeight: '1.1',
                                    margin: '0'
                                  }}
                                >
                                  {itemName.replace(/WIG/gi, '').trim()}
                                </p>
                                <p 
                                  className="font-bold"
                                  style={{ 
                                    fontFamily: '"Futura PT Book"',
                                    color: '#EB1C24',
                                    textTransform: 'uppercase',
                                    fontSize: '9px',
                                    marginTop: (() => {
                                      // Check if there's detail text (specifications)
                                      const hasSpecs = (item.density && item.density !== '200%') || 
                                                     (item.lace && item.lace !== '13X6') || 
                                                     (item.texture && item.texture !== 'SILKY') || 
                                                     (item.color && item.color !== (item.name === 'BLANCO' ? 'PLATINUM' : 'OFF BLACK')) || 
                                                     (item.hairline && item.hairline !== 'NATURAL') || 
                                                     (item.styling && item.styling !== 'NONE') || 
                                                     (item.addOns && item.addOns.length > 0) ||
                                                     (item.capSize && (item.capSize === 'XXS/XS/S' || item.capSize === 'S/M/L')) ||
                                                     (item.length && item.length !== '24"');
                                      // Gift cards and BLANCO with no detail text should have reduced spacing
                                      const isGiftCard = item.name === 'GIFT CARD' || item.type === 'gift-card';
                                      const isBlancoNoSpecs = item.name === 'BLANCO' && !hasSpecs;
                                      if (isGiftCard) return '-3px'; // Gift cards moved down 1px
                                      if (isBlancoNoSpecs) return '-4px';
                                      return '-3px';
                                    })(),
                                    transform: 'translateY(6px)',
                                    lineHeight: '1.1',
                                    marginBottom: '0'
                                  }}
                                >
                                  {(() => {
                                    if (item.name === 'GIFT CARD' || item.type === 'gift-card') {
                                      return 'DIGITAL ONLY';
                                    }
                                    return `${itemLength} RAW ${itemHairOrigin}`;
                                  })()}
                                </p>
                                <p 
                                  className="font-bold"
                                  style={{ 
                                    fontFamily: '"Futura PT Book"',
                                    color: '#000000',
                                    textTransform: 'uppercase',
                                    fontSize: '9px',
                                    marginTop: '8px',
                                    marginRight: '20px',
                                    lineHeight: '1.44',
                                    wordBreak: 'break-word',
                                    maxWidth: 'calc(100% - 20px)'
                                  }}
                                  dangerouslySetInnerHTML={{
                                    __html: (() => {
                                      // Build text with non-breaking spaces within comma sections
                                      let text = '';
                                      
                                      // Build array of items to determine what comes after each
                                      const items = [];
                                      // Add cap size if it's a flexible cap (XXS/XS/S or S/M/L)
                                      if (item.capSize && (item.capSize === 'XXS/XS/S' || item.capSize === 'S/M/L')) {
                                        items.push({ type: 'capSize', value: item.capSize, fullName: 'FLEX CAP' });
                                      }
                                      // Add length if it's not the default 24"
                                      if (item.length && item.length !== '24"') {
                                        items.push({ type: 'length', value: item.length, fullName: item.length });
                                      }
                                      if (item.density && item.density !== '200%') items.push({ type: 'density', value: item.density, fullName: `${item.density} density` });
                                      if (item.lace && item.lace !== '13X6') items.push({ type: 'lace', value: item.lace, fullName: `${item.lace} lace` });
                                      // Texture detail removed - no longer showing curly/wavy texture in cart
                                      // For BLANCO, default color is PLATINUM; for others, default is OFF BLACK
                                      // CRITICAL: Validate BLANCO colors - if item.color is invalid for BLANCO, use PLATINUM
                                      let itemColor = item.color;
                                      if (item.name === 'BLANCO') {
                                        const validBlancoColors = ['GOLDEN', 'PLATINUM', 'ASH'];
                                        if (!itemColor || !validBlancoColors.includes(itemColor)) {
                                          itemColor = 'PLATINUM'; // Default to PLATINUM for invalid/missing BLANCO colors
                                        }
                                      }
                                      const defaultColor = item.name === 'BLANCO' ? 'PLATINUM' : 'OFF BLACK';
                                      if (itemColor && itemColor !== defaultColor) items.push({ type: 'color', value: itemColor, fullName: itemColor });
                                      if (item.hairline && item.hairline !== 'NATURAL') items.push({ type: 'hairline', value: item.hairline, fullName: `${item.hairline} hairline` });
                                      
                                      // Only show styling if it's a valid styling option (BANGS, CRIMPS, etc.), not a part selection (MIDDLE, LEFT, RIGHT)
                                      const hairStylingOptions = ['BANGS', 'CRIMPS', 'FLAT IRON', 'LAYERS'];
                                      // @ts-expect-error - Variable kept for code clarity/documentation
                                      const partSelectionOptions = ['MIDDLE', 'LEFT', 'RIGHT'];
                                      if (item.styling && item.styling !== 'NONE' && hairStylingOptions.includes(item.styling) && item.partSelection) {
                                        items.push({ type: 'styling', value: item.styling, partSelection: item.partSelection, fullName: item.styling });
                                      }
                                      
                                      if (item.addOns && item.addOns.length > 0) items.push({ type: 'addOns', value: item.addOns, fullName: item.addOns });
                                      
                                      // Use full names if only 1 customizable item (excluding density and lace)
                                      const customizableItems = items.filter(item => item.type !== 'density' && item.type !== 'lace');
                                      const useFullNames = customizableItems.length === 1;
                                      
                                      // Helper function to format price with red color and currency conversion
                                      // CRITICAL: This function must not be optimized away in production builds
                                      const formatPriceDisplay = (price: number): string => {
                                        // Explicitly check for zero to prevent optimization issues
                                        if (price === 0 || price === null || price === undefined || isNaN(price)) {
                                          return '';
                                        }
                                        // Get currency info
                                        const currency = currencyRates[selectedCurrency as keyof typeof currencyRates] || currencyRates.USD;
                                        // Convert price to selected currency
                                        const convertedPrice = price * currency.rate;
                                        // Show negative sign for negative prices, positive sign for positive prices
                                        const sign = price > 0 ? '+' : '-';
                                        // Format the converted price
                                        const priceStr = Math.abs(convertedPrice).toLocaleString('en-US', {
                                          minimumFractionDigits: 0,
                                          maximumFractionDigits: 0
                                        });
                                        // Explicitly construct the HTML string to prevent minification issues
                                        return ' <span style="color: #000000;">' + sign + currency.symbol + priceStr + '</span>';
                                      };
                                      
                                      // Build text with each item on its own line and prices in red
                                      items.forEach((itemData) => {
                                        // Add line break before each item except the first
                                        if (text) {
                                          text += '<br/>';
                                        }
                                        
                                        if (itemData.type === 'capSize') {
                                          // Cap Size: show "FLEX CAP" with price +$40
                                          const price = 40; // Flexible caps cost $40 extra
                                          const priceDisplay = formatPriceDisplay(price);
                                          text += `FLEX CAP${priceDisplay}`;
                                        } else if (itemData.type === 'length') {
                                          // Length: show difference from 24" base with ADDED/REMOVED and price
                                          const lengthValue = typeof itemData.value === 'string' ? itemData.value : String(itemData.value);
                                          const lengthNum = parseInt(lengthValue.replace('"', ''));
                                          const baseLength = 24;
                                          const difference = lengthNum - baseLength;
                                          
                                          // Get length price from item or calculate it
                                          const lengthPrices: { [key: string]: number } = {
                                            '16"': -50,
                                            '18"': -25,
                                            '20"': -10,
                                            '22"': -5,
                                            '24"': 0,
                                            '26"': 50,
                                            '28"': 100,
                                            '30"': 150,
                                            '32"': 200,
                                            '34"': 250,
                                            '36"': 300,
                                            '40"': 400
                                          };
                                          const price = lengthPrices[lengthValue] || 0;
                                          const priceDisplay = formatPriceDisplay(price);
                                          
                                          if (difference > 0) {
                                            // Longer than base: "-X" ADDED (+$Y)"
                                            text += `${Math.abs(difference)}" ADDED${priceDisplay}`;
                                          } else if (difference < 0) {
                                            // Shorter than base: "-X" REMOVED (-$Y)"
                                            text += `${Math.abs(difference)}" REMOVED${priceDisplay}`;
                                          }
                                        } else if (itemData.type === 'density') {
                                          // Density: show percentage value followed by "DENSITY" in all caps with price
                                          // formatPriceDisplay already includes the sign in the price part
                                          const densityValue = typeof itemData.value === 'string' ? itemData.value : String(itemData.value);
                                          const price = _getDensityPrice(densityValue);
                                          const priceDisplay = formatPriceDisplay(price);
                                          const displayValue = `${densityValue} DENSITY${priceDisplay}`;
                                          text += displayValue.toUpperCase();
                                        } else if (itemData.type === 'lace') {
                                          // Lace: show value followed by "LACE" in all caps with price
                                          // formatPriceDisplay already includes the sign in the price part
                                          const laceValue = typeof itemData.value === 'string' ? itemData.value : String(itemData.value);
                                          const price = _getLacePrice(laceValue);
                                          const priceDisplay = formatPriceDisplay(price);
                                          const displayValue = `${laceValue} LACE${priceDisplay}`;
                                          text += displayValue.toUpperCase();
                                        } else if (itemData.type === 'texture') {
                                          // Texture: show value followed by "TEXTURE" in all caps with price
                                          const textureValue = typeof itemData.value === 'string' ? itemData.value : String(itemData.value);
                                          const price = 0; // Texture prices not used in current implementation
                                          const priceDisplay = formatPriceDisplay(price);
                                          const displayValue = `${textureValue} TEXTURE${priceDisplay}`;
                                          text += displayValue.toUpperCase();
                                        } else if (itemData.type === 'color') {
                                          // Color: show value followed by "COLOR" in all caps with price
                                          // CRITICAL: Include length and product name to calculate correct price
                                          const colorValue = typeof itemData.value === 'string' ? itemData.value : String(itemData.value);
                                          const itemLength = item.length || '24"';
                                          const price = _getColorPrice(colorValue, itemLength, item.name);
                                          const priceDisplay = formatPriceDisplay(price);
                                          const displayValue = `${colorValue} COLOR${priceDisplay}`;
                                          text += displayValue.toUpperCase();
                                        } else if (itemData.type === 'hairline') {
                                          // Hairline: show value followed by "HAIRLINE" in all caps with price
                                          let displayValue;
                                          const hairlineValue = typeof itemData.value === 'string' ? itemData.value : String(itemData.value);
                                          const hairlineUpper = hairlineValue.toUpperCase();
                                          const price = _getHairlinePrice(hairlineValue);
                                          const priceDisplay = formatPriceDisplay(price);
                                          
                                          if (hairlineUpper.includes('LAGOS') && hairlineUpper.includes('PEAK')) {
                                            displayValue = `LAGOS + PEAK HAIRLINE${priceDisplay}`;
                                          } else {
                                            displayValue = `${hairlineValue} HAIRLINE${priceDisplay}`;
                                          }
                                          text += displayValue.toUpperCase();
                                        } else if (itemData.type === 'styling') {
                                          const stylingValue = typeof itemData.value === 'string' ? itemData.value : String(itemData.value);
                                          const price = _getStylingPrice(stylingValue);
                                          const priceDisplay = formatPriceDisplay(price);
                                          
                                          if (useFullNames) {
                                            // For single item, show full styling name with price
                                            const displayValue = itemData.fullName;
                                            const displayText = typeof displayValue === 'string' ? displayValue : String(displayValue);
                                            text += displayText.toUpperCase() + priceDisplay;
                                          } else {
                                            // For multiple items, show abbreviated with part selection
                                            let partAbbrev = '';
                                            switch (itemData.partSelection) {
                                              case 'LEFT':
                                                partAbbrev = '(L)';
                                                break;
                                              case 'RIGHT':
                                                partAbbrev = '(R)';
                                                break;
                                              case 'MIDDLE':
                                              default:
                                                partAbbrev = '(M)';
                                                break;
                                            }
                                            text += partAbbrev;
                                          
                                            // Use non-breaking spaces within styling section and connect to part selection
                                            if (typeof itemData.value === 'string') {
                                              const stylingText = itemData.value.toUpperCase().replace(/ /g, '\u00A0');
                                              text += '\u00A0' + stylingText + priceDisplay;
                                            }
                                          }
                                        } else if (itemData.type === 'addOns') {
                                          const itemLace = item.lace || '13X6';
                                          
                                          // Show each add-on on its own line with its price immediately after it
                                          if (Array.isArray(itemData.value)) {
                                            itemData.value.forEach((addOn: string, addOnIndex: number) => {
                                              // Use non-breaking spaces within add-on section
                                              const addOnPrice = _getAddOnsPrice([addOn], itemLace);
                                              const addOnPriceDisplay = formatPriceDisplay(addOnPrice);
                                              // Replace "BLEACH" with "BLEACH KNOTS" for display
                                              const addOnText = addOn.toUpperCase().replace(/BLEACH/g, 'BLEACH KNOTS').replace(/ /g, '\u00A0');
                                              // Add line break before each add-on except the first (each on its own line)
                                              if (addOnIndex > 0) {
                                                text += '<br/>';
                                              }
                                              text += addOnText + addOnPriceDisplay;
                                            });
                                          } else {
                                            // Handle single string case
                                            const addOnPrice = _getAddOnsPrice([String(itemData.value)], itemLace);
                                            const addOnPriceDisplay = formatPriceDisplay(addOnPrice);
                                            // Replace "BLEACH" with "BLEACH KNOTS" for display
                                            const addOnText = String(itemData.value).toUpperCase().replace(/BLEACH/g, 'BLEACH KNOTS').replace(/ /g, '\u00A0');
                                            text += addOnText + addOnPriceDisplay;
                                          }
                                        }
                                      });
                                      
                                      return text;
                                    })()
                                  }}
                                />
                                {item.capSize && (
                                  <p 
                                    className="font-semibold"
                                    style={{ 
                                      fontFamily: '"Futura PT Medium"',
                                      color: '#808080',
                                      textTransform: 'uppercase',
                                      fontSize: '10px',
                                      marginTop: (() => {
                                        const hasSpecs = (item.density && item.density !== '200%') || 
                                                       (item.lace && item.lace !== '13X6') || 
                                                       (item.texture && item.texture !== 'SILKY') || 
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
                                          return `${Math.max(0, numValue - 3)}px`;
                                        }
                                        return baseMargin;
                                      })(),
                                      lineHeight: '1.1',
                                      marginBottom: '0'
                                    }}
                                  >
                                    CAP SIZE: {item.capSize}
                                  </p>
                                )}
                                <p
                                  style={{
                                    fontFamily: '"Futura PT Book"',
                                    color: '#000000',
                                    fontSize: '12px',
                                    marginTop: item.name === 'BLANCO' ? '0px' : '2px',
                                    marginBottom: '12px',
                                    marginLeft: '0',
                                    marginRight: '0',
                                    fontWeight: '600'
                                  }}
                                  dangerouslySetInnerHTML={formatPrice(itemPrice)}
                                />
                                <div className="absolute" style={{ right: '8px', top: '0', bottom: '0', display: 'flex', alignItems: 'center' }}>
                                  <span
                                    style={{
                                      fontFamily: '"Futura PT Medium"',
                                      fontSize: '9px',
                                      color: '#000000',
                                      textTransform: 'uppercase'
                                    }}
                                  >
                                    QTY: {itemQuantity}
                    </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                  </div>
                </div>

                    {/* Subtotal */}
                    <div className="overflow-hidden mt-auto pt-2">
                      {/* Loyalty Points Text */}
                      <div style={{ 
                        marginTop: '20px', 
                        marginBottom: '12px',
                        textAlign: 'center'
                      }}>
                        <p style={{
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000000',
                          textTransform: 'uppercase',
                          margin: '0'
                        }}>
                          {isSignedIn ? (
                            <>
                              YOU'RE EARNING ${(orderAmount - taxesProcessing - shippingHandling - discount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} POINTS WITH THIS ORDER.
                            </>
                          ) : (
                            <>
                              <span 
                                onClick={() => navigate('/sign-in')}
                                style={{ 
                                  color: '#EB1C24', 
                                  cursor: 'pointer'
                                }}
                              >
                                SIGN IN
                              </span>
                              {' TO EARN LOYALTY POINTS FOR THIS ORDER.'}
                            </>
                          )}
                        </p>
                      </div>
                      <div style={{ 
                        paddingTop: '20px', 
                        borderTop: '1.3px solid #000',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <p style={{
                          fontFamily: '"Futura PT Book"',
                          fontSize: '12px',
                          fontWeight: '600',
                          margin: '0'
                        }}>
                          SUBTOTAL:
                        </p>
                        <p
                          style={{
                            fontFamily: '"Futura PT Book"',
                            fontSize: '12px',
                            fontWeight: '600',
                            margin: '0'
                          }}
                          dangerouslySetInnerHTML={formatPrice(orderAmount)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* SHIPPING ADDRESS SECTION */}
                <div>
                  <h2 
                    style={{ 
                      fontFamily: '"Futura PT Medium"',
                      fontSize: '12px',
                      color: '#EB1C24',
                      margin: '0 0 12px 0',
                      textTransform: 'uppercase',
                      fontWeight: '500'
                    }}
                  >
                    SHIPPING ADDRESS:
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label 
                        style={{ 
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000000',
                          display: 'block',
                          marginBottom: '4px',
                          textTransform: 'uppercase'
                        }}
                      >
                          FIRST NAME<span style={{ color: '#EB1C24', fontWeight: 'normal' }}>*</span>
                      </label>
                      <input
                        type="text"
                          placeholder="ENTER FIRST NAME"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                        style={{
                          width: '100%',
                            height: '36px',
                          padding: '8px',
                          border: '1.3px solid #000000',
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            boxSizing: 'border-box',
                            borderRadius: '0'
                        }}
                      />
                    </div>
                    <div>
                      <label 
                        style={{ 
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000000',
                          display: 'block',
                          marginBottom: '4px',
                          textTransform: 'uppercase'
                        }}
                      >
                          LAST NAME<span style={{ color: '#EB1C24', fontWeight: 'normal' }}>*</span>
                      </label>
                      <input
                        type="text"
                          placeholder="ENTER LAST NAME"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                        style={{
                          width: '100%',
                            height: '36px',
                          padding: '8px',
                          border: '1.3px solid #000000',
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            boxSizing: 'border-box',
                            borderRadius: '0'
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label 
                        style={{ 
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000000',
                          display: 'block',
                          marginBottom: '4px',
                          textTransform: 'uppercase'
                        }}
                      >
                        SHIPPING ADDRESS<span style={{ color: '#EB1C24' }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="ENTER SHIPPING ADDRESS"
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '8px',
                          border: '1.3px solid #000000',
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          boxSizing: 'border-box',
                          borderRadius: '0'
                        }}
                      />
                    </div>
                    <div>
                      <label 
                        style={{ 
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000000',
                          display: 'block',
                          marginBottom: '4px',
                          textTransform: 'uppercase'
                        }}
                      >
                        APT OR SUITE
                      </label>
                      <input
                        type="text"
                        placeholder="ENTER APARTMENT, SUITE OR UNIT NUMBER"
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '8px',
                          border: '1.3px solid #000000',
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          boxSizing: 'border-box',
                          borderRadius: '0'
                        }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div>
                      <label 
                        style={{ 
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000000',
                          display: 'block',
                          marginBottom: '4px',
                          textTransform: 'uppercase'
                        }}
                      >
                          CITY<span style={{ color: '#EB1C24' }}>*</span>
                      </label>
                      <input
                        type="text"
                          placeholder="ENTER CITY"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                        style={{
                          width: '100%',
                            height: '36px',
                          padding: '8px',
                          border: '1.3px solid #000000',
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            boxSizing: 'border-box',
                            borderRadius: '0'
                        }}
                      />
                    </div>
                    <div>
                      <label 
                        style={{ 
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000000',
                          display: 'block',
                          marginBottom: '4px',
                          textTransform: 'uppercase'
                        }}
                      >
                          STATE<span style={{ color: '#EB1C24' }}>*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="ENTER STATE"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          style={{
                            width: '100%',
                            height: '36px',
                            padding: '8px',
                            border: '1.3px solid #000000',
                            fontFamily: '"Futura PT Book"',
                            fontSize: '11px',
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            boxSizing: 'border-box',
                            borderRadius: '0'
                          }}
                        />
                      </div>
                      <div>
                        <label 
                          style={{ 
                            fontFamily: '"Futura PT Book"',
                            fontSize: '10px',
                            color: '#000000',
                            display: 'block',
                            marginBottom: '4px',
                            textTransform: 'uppercase'
                          }}
                        >
                          ZIP<span style={{ color: '#EB1C24' }}>*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="ENTER ZIP CODE"
                          value={zip}
                          onChange={(e) => setZip(e.target.value)}
                          style={{
                            width: '100%',
                            height: '36px',
                            padding: '8px',
                            border: '1.3px solid #000000',
                            fontFamily: '"Futura PT Book"',
                            fontSize: '11px',
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            boxSizing: 'border-box',
                            borderRadius: '0'
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label 
                        style={{ 
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000000',
                          display: 'block',
                          marginBottom: '4px',
                          textTransform: 'uppercase'
                        }}
                      >
                        PHONE NUMBER<span style={{ color: '#EB1C24' }}>*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="ENTER MOBILE NUMBER"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '8px',
                          border: '1.3px solid #000000',
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          boxSizing: 'border-box',
                          borderRadius: '0'
                        }}
                      />
                    </div>
                    <div>
                      <label 
                        style={{ 
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000000',
                          display: 'block',
                          marginBottom: '4px',
                          textTransform: 'uppercase'
                        }}
                      >
                        EMAIL<span style={{ color: '#EB1C24' }}>*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="ENTER EMAIL ADDRESS"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '8px',
                          border: '1.3px solid #000000',
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          boxSizing: 'border-box',
                          borderRadius: '0'
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <div
                        onClick={() => setSameAsBilling(!sameAsBilling)}
                        style={{
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1.3px solid #000000',
                          backgroundColor: 'transparent',
                          position: 'relative'
                        }}
                      >
                        {sameAsBilling && (
                          <img 
                            src="/assets/checkbox.svg" 
                            alt="checked" 
                            style={{ width: '16px', height: '16px', position: 'absolute' }}
                          />
                        )}
                      </div>
                      <label 
                        style={{ 
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000000',
                          cursor: 'pointer',
                          textTransform: 'uppercase'
                        }}
                      >
                        SAME AS BILLING ADDRESS
                      </label>
                    </div>
                  </div>
                </div>

                {/* PAYMENT SECTION */}
                <div>
                  <h2 
                    style={{ 
                      fontFamily: '"Futura PT Medium"',
                      fontSize: '12px',
                      color: '#EB1C24',
                      margin: '0 0 12px 0',
                      textTransform: 'uppercase',
                      fontWeight: '500'
                    }}
                  >
                    PAYMENT:
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label 
                        style={{ 
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000000',
                          display: 'block',
                          marginBottom: '4px',
                          textTransform: 'uppercase'
                        }}
                      >
                        CARDHOLDER<span style={{ color: '#EB1C24' }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="ENTER NAME ON CARD"
                        value={cardholder}
                        onChange={(e) => setCardholder(e.target.value)}
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '8px',
                          border: '1.3px solid #000000',
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          boxSizing: 'border-box',
                          borderRadius: '0'
                        }}
                      />
                    </div>
                    <div>
                      <label 
                        style={{ 
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000000',
                          display: 'block',
                          marginBottom: '4px',
                          textTransform: 'uppercase'
                        }}
                      >
                        CARD NUMBER<span style={{ color: '#EB1C24' }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="ENTER CREDIT OR DEBIT CARD NUMBER"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '8px',
                          border: '1.3px solid #000000',
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          boxSizing: 'border-box',
                          borderRadius: '0'
                        }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label 
                          style={{ 
                            fontFamily: '"Futura PT Book"',
                            fontSize: '10px',
                            color: '#000000',
                            display: 'block',
                            marginBottom: '4px',
                            textTransform: 'uppercase'
                          }}
                        >
                          EXPIRATION DATE<span style={{ color: '#EB1C24' }}>*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={expirationDate}
                          onChange={(e) => setExpirationDate(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1.3px solid #000000',
                            fontFamily: '"Futura PT Book"',
                            fontSize: '11px',
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            borderRadius: '0'
                          }}
                        />
                      </div>
                      <div>
                        <label 
                          style={{ 
                            fontFamily: '"Futura PT Book"',
                            fontSize: '10px',
                            color: '#000000',
                            display: 'block',
                            marginBottom: '4px',
                            textTransform: 'uppercase'
                          }}
                        >
                          CVV<span style={{ color: '#EB1C24' }}>*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1.3px solid #000000',
                            fontFamily: '"Futura PT Book"',
                            fontSize: '11px',
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            borderRadius: '0'
                          }}
                        />
                      </div>
                    </div>
                    {!sameAsBilling && (
                      <>
                        <div>
                          <label 
                            style={{ 
                              fontFamily: '"Futura PT Book"',
                              fontSize: '10px',
                              color: '#000000',
                              display: 'block',
                              marginBottom: '4px',
                              textTransform: 'uppercase'
                            }}
                          >
                            BILLING ADDRESS<span style={{ color: '#EB1C24' }}>*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="ENTER CARD'S BILLING ADDRESS"
                            value={billingAddress}
                            onChange={(e) => setBillingAddress(e.target.value)}
                            style={{
                              width: '100%',
                              height: '36px',
                              padding: '8px',
                              border: '1.3px solid #000000',
                              fontFamily: '"Futura PT Book"',
                              fontSize: '11px',
                              backgroundColor: 'rgba(255, 255, 255, 0.8)',
                              boxSizing: 'border-box',
                              borderRadius: '0'
                            }}
                          />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                        <div>
                          <label 
                            style={{ 
                              fontFamily: '"Futura PT Book"',
                              fontSize: '10px',
                              color: '#000000',
                              display: 'block',
                              marginBottom: '4px',
                              textTransform: 'uppercase'
                            }}
                          >
                              CITY<span style={{ color: '#EB1C24' }}>*</span>
                          </label>
                          <input
                            type="text"
                              placeholder="ENTER CITY"
                              value={billingCity}
                              onChange={(e) => setBillingCity(e.target.value)}
                            style={{
                              width: '100%',
                                height: '36px',
                              padding: '8px',
                              border: '1.3px solid #000000',
                              fontFamily: '"Futura PT Book"',
                              fontSize: '11px',
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                boxSizing: 'border-box',
                                borderRadius: '0'
                              }}
                            />
                          </div>
                          <div>
                            <label 
                              style={{ 
                                fontFamily: '"Futura PT Book"',
                                fontSize: '10px',
                                color: '#000000',
                                display: 'block',
                                marginBottom: '4px',
                                textTransform: 'uppercase'
                              }}
                            >
                              STATE<span style={{ color: '#EB1C24' }}>*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="ENTER STATE"
                              value={billingState}
                              onChange={(e) => setBillingState(e.target.value)}
                              style={{
                                width: '100%',
                                height: '36px',
                                padding: '8px',
                                border: '1.3px solid #000000',
                                fontFamily: '"Futura PT Book"',
                                fontSize: '11px',
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                boxSizing: 'border-box',
                                borderRadius: '0'
                              }}
                            />
                          </div>
                          <div>
                            <label 
                              style={{ 
                                fontFamily: '"Futura PT Book"',
                                fontSize: '10px',
                                color: '#000000',
                                display: 'block',
                                marginBottom: '4px',
                                textTransform: 'uppercase'
                              }}
                            >
                              ZIP<span style={{ color: '#EB1C24' }}>*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="ENTER ZIP CODE"
                              value={billingZip}
                              onChange={(e) => setBillingZip(e.target.value)}
                              style={{
                                width: '100%',
                                height: '36px',
                                padding: '8px',
                                border: '1.3px solid #000000',
                                fontFamily: '"Futura PT Book"',
                                fontSize: '11px',
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                boxSizing: 'border-box',
                                borderRadius: '0'
                              }}
                            />
                          </div>
                        </div>
                      </>
                    )}
                    <div style={{ marginTop: '8px' }}>
                      <p 
                        style={{ 
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000000',
                          margin: '0 0 8px 0',
                          textTransform: 'uppercase'
                        }}
                      >
                        OTHER PAYMENT OPTIONS:
                      </p>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button
                          style={{
                            padding: '10px 20px',
                            border: '1.3px solid #000000',
                            backgroundColor: '#FFFFFF',
                            fontFamily: '"Futura PT Book"',
                            fontSize: '11px',
                            cursor: 'pointer',
                            textTransform: 'uppercase'
                          }}
                        >
                          PAYPAL
                        </button>
                        <button
                          style={{
                            padding: '10px 20px',
                            border: '1.3px solid #000000',
                            backgroundColor: '#FFFFFF',
                            fontFamily: '"Futura PT Book"',
                            fontSize: '11px',
                            cursor: 'pointer',
                            textTransform: 'uppercase'
                          }}
                        >
                          EXPRESS CHECKOUT
                        </button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <input
                        type="text"
                        placeholder="REFERRAL CODE, GIFT CARD OR DISCOUNT CODE"
                        style={{
                          flex: 1,
                          height: '36px',
                          padding: '8px',
                          border: '1.3px solid #000000',
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          boxSizing: 'border-box',
                          borderRadius: '0'
                        }}
                      />
                      <button
                        style={{
                          width: '36px',
                          height: '36px',
                          border: '1.3px solid #000000',
                          backgroundColor: '#FFFFFF',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          flexShrink: 0
                        }}
                      >
                        <img 
                          src="/assets/discount-check.svg" 
                          alt="apply discount" 
                          style={{ width: '16px', height: '16px', position: 'absolute', objectFit: 'contain' }}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* DELIVERY METHOD SECTION */}
                <div>
                  <h2 
                    style={{ 
                      fontFamily: '"Futura PT Medium"',
                      fontSize: '12px',
                      color: '#EB1C24',
                      margin: '0 0 12px 0',
                      textTransform: 'uppercase',
                      fontWeight: '500'
                    }}
                  >
                    DELIVERY METHOD:
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        onClick={() => setSelectedProcessing('standard')}
                        style={{
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1.3px solid #000000',
                          backgroundColor: 'transparent',
                          position: 'relative'
                        }}
                      >
                        {selectedProcessing === 'standard' && (
                          <img 
                            src="/assets/checkbox.svg" 
                            alt="checked" 
                            style={{ width: '16px', height: '16px', position: 'absolute' }}
                          />
                        )}
                      </div>
                      <label 
                        style={{ 
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000000',
                          cursor: 'pointer',
                          textTransform: 'uppercase'
                        }}
                      >
                        6-8 WEEKS STANDARD PROCESSING
                      </label>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', opacity: hasColorStylingOrAddOns ? 0.5 : 1 }}>
                      <div
                        onClick={() => {
                          if (!hasColorStylingOrAddOns) {
                            setSelectedProcessing('rush');
                          }
                        }}
                        style={{
                          width: '16px',
                          height: '16px',
                          cursor: hasColorStylingOrAddOns ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1.3px solid #000000',
                          backgroundColor: 'transparent',
                          marginTop: '2px',
                          flexShrink: 0,
                          position: 'relative'
                        }}
                      >
                        {selectedProcessing === 'rush' && !hasColorStylingOrAddOns && (
                          <img 
                            src="/assets/checkbox.svg" 
                            alt="checked" 
                            style={{ width: '16px', height: '16px', position: 'absolute' }}
                          />
                        )}
                      </div>
                      <div 
                        style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          cursor: hasColorStylingOrAddOns ? 'not-allowed' : 'pointer' 
                        }} 
                        onClick={() => {
                          if (!hasColorStylingOrAddOns) {
                            setSelectedProcessing('rush');
                          }
                        }}
                      >
                      <label 
                        style={{ 
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000000',
                            cursor: hasColorStylingOrAddOns ? 'not-allowed' : 'pointer',
                          textTransform: 'uppercase'
                        }}
                      >
                          4-6 WEEKS RUSH PROCESSING $100
                        </label>
                        <label 
                          style={{ 
                            fontFamily: '"Futura PT Book"',
                            fontSize: '9px',
                            color: '#EB1C24',
                            cursor: hasColorStylingOrAddOns ? 'not-allowed' : 'pointer',
                            textTransform: 'uppercase',
                            marginTop: '2px'
                          }}
                        >
                          (EXCLUDING COLOR, STYLING & ADD-ONS)
                      </label>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        onClick={() => setPackageProtection(!packageProtection)}
                        style={{
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1.3px solid #000000',
                          backgroundColor: 'transparent',
                          position: 'relative'
                        }}
                      >
                        {packageProtection && (
                          <img 
                            src="/assets/checkbox.svg" 
                            alt="checked" 
                            style={{ width: '16px', height: '16px', position: 'absolute' }}
                          />
                        )}
                      </div>
                      <label 
                        style={{ 
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000000',
                          cursor: 'pointer',
                          textTransform: 'uppercase'
                        }}
                      >
                        PACKAGE PROTECTION +$5
                      </label>
                    </div>
                  </div>
                  <div style={{ marginTop: '16px', border: '1.3px solid #000000', padding: '12px' }}>
                    <p 
                      style={{ 
                        fontFamily: '"Futura PT Book"',
                        fontSize: '10px',
                        color: '#000000',
                        margin: '0 0 8px 0',
                        textTransform: 'uppercase',
                        fontWeight: '500'
                      }}
                    >
                      SHIPPING CALCULATOR
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <select
                        value={selectedCountry}
                        onChange={(e) => {
                          setSelectedCountry(e.target.value);
                          setSelectedState('');
                          setZipCode('');
                          setShippingCalculated(false);
                          setSelectedShippingMethod(null);
                        }}
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '8px',
                          border: '1.3px solid #000000',
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          boxSizing: 'border-box',
                          borderRadius: '0'
                        }}
                      >
                        <option value="">COUNTRY</option>
                        <option value="US">UNITED STATES</option>
                        <option value="CA">CANADA</option>
                        <option value="GB">UNITED KINGDOM</option>
                        <option value="AU">AUSTRALIA</option>
                        <option value="OTHER">OTHER</option>
                      </select>
                      {selectedCountry === 'US' && (
                      <select
                          value={selectedState}
                          onChange={(e) => {
                            setSelectedState(e.target.value);
                            setShippingCalculated(false);
                            setSelectedShippingMethod(null);
                          }}
                        style={{
                          width: '100%',
                            height: '36px',
                          padding: '8px',
                          border: '1.3px solid #000000',
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            boxSizing: 'border-box',
                            borderRadius: '0'
                          }}
                        >
                          <option value="">STATE</option>
                          <option value="AL">ALABAMA</option>
                          <option value="AK">ALASKA</option>
                          <option value="AZ">ARIZONA</option>
                          <option value="AR">ARKANSAS</option>
                          <option value="CA">CALIFORNIA</option>
                          <option value="CO">COLORADO</option>
                          <option value="CT">CONNECTICUT</option>
                          <option value="DE">DELAWARE</option>
                          <option value="FL">FLORIDA</option>
                          <option value="GA">GEORGIA</option>
                          <option value="HI">HAWAII</option>
                          <option value="ID">IDAHO</option>
                          <option value="IL">ILLINOIS</option>
                          <option value="IN">INDIANA</option>
                          <option value="IA">IOWA</option>
                          <option value="KS">KANSAS</option>
                          <option value="KY">KENTUCKY</option>
                          <option value="LA">LOUISIANA</option>
                          <option value="ME">MAINE</option>
                          <option value="MD">MARYLAND</option>
                          <option value="MA">MASSACHUSETTS</option>
                          <option value="MI">MICHIGAN</option>
                          <option value="MN">MINNESOTA</option>
                          <option value="MS">MISSISSIPPI</option>
                          <option value="MO">MISSOURI</option>
                          <option value="MT">MONTANA</option>
                          <option value="NE">NEBRASKA</option>
                          <option value="NV">NEVADA</option>
                          <option value="NH">NEW HAMPSHIRE</option>
                          <option value="NJ">NEW JERSEY</option>
                          <option value="NM">NEW MEXICO</option>
                          <option value="NY">NEW YORK</option>
                          <option value="NC">NORTH CAROLINA</option>
                          <option value="ND">NORTH DAKOTA</option>
                          <option value="OH">OHIO</option>
                          <option value="OK">OKLAHOMA</option>
                          <option value="OR">OREGON</option>
                          <option value="PA">PENNSYLVANIA</option>
                          <option value="RI">RHODE ISLAND</option>
                          <option value="SC">SOUTH CAROLINA</option>
                          <option value="SD">SOUTH DAKOTA</option>
                          <option value="TN">TENNESSEE</option>
                          <option value="TX">TEXAS</option>
                          <option value="UT">UTAH</option>
                          <option value="VT">VERMONT</option>
                          <option value="VA">VIRGINIA</option>
                          <option value="WA">WASHINGTON</option>
                          <option value="WV">WEST VIRGINIA</option>
                          <option value="WI">WISCONSIN</option>
                          <option value="WY">WYOMING</option>
                      </select>
                      )}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          placeholder="ZIP CODE"
                          value={zipCode}
                          onChange={(e) => {
                            setZipCode(e.target.value);
                            setShippingCalculated(false);
                            setSelectedShippingMethod(null);
                          }}
                          style={{
                            flex: 1,
                            padding: '8px',
                            border: '1.3px solid #000000',
                            fontFamily: '"Futura PT Book"',
                            fontSize: '11px',
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            borderRadius: '0'
                          }}
                        />
                        <button
                          onClick={() => {
                            if (selectedCountry && zipCode) {
                              setShippingCalculated(true);
                            }
                          }}
                          style={{
                            padding: '8px 20px',
                            border: '1.3px solid #000000',
                            backgroundColor: '#FFFFFF',
                            fontFamily: '"Futura PT Book"',
                            fontSize: '11px',
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                            color: '#EB1C24'
                          }}
                        >
                          CALCULATE
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* SHIPPING METHOD SELECTION */}
                  {shippingCalculated && availableShippingOptions.length > 0 && (
                    <div style={{ marginTop: '16px', border: '1.3px solid #000000', padding: '12px' }}>
                      <p 
                        style={{ 
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000000',
                          margin: '0 0 8px 0',
                          textTransform: 'uppercase',
                          fontWeight: '500'
                        }}
                      >
                        SHIPPING METHOD
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {availableShippingOptions.map((option, index) => {
                          const isSelected = selectedShippingMethod?.carrier === option.carrier && 
                                           selectedShippingMethod?.speed === option.speed;
                          return (
                            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div
                                onClick={() => setSelectedShippingMethod({
                                  carrier: option.carrier,
                                  speed: option.speed,
                                  cost: option.cost
                                })}
                                style={{
                                  width: '16px',
                                  height: '16px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: '1.3px solid #000000',
                                  backgroundColor: 'transparent',
                                  position: 'relative'
                                }}
                              >
                                {isSelected && (
                                  <img 
                                    src="/assets/checkbox.svg" 
                                    alt="checked" 
                                    style={{ width: '16px', height: '16px', position: 'absolute' }}
                                  />
                                )}
                              </div>
                              <label 
                                style={{ 
                                  fontFamily: '"Futura PT Book"',
                                  fontSize: '10px',
                                  color: '#000000',
                                  cursor: 'pointer',
                                  textTransform: 'uppercase'
                                }}
                              >
                                {option.label}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* ORDER SUMMARY (COST BREAKDOWN) */}
                <div>
                  <h2 
                    style={{ 
                      fontFamily: '"Futura PT Medium"',
                      fontSize: '12px',
                      color: '#EB1C24',
                      margin: '0 0 12px 0',
                      textTransform: 'uppercase',
                      fontWeight: '500'
                    }}
                  >
                    ORDER SUMMARY:
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000000' }}>
                        ORDER AMOUNT:
                      </span>
                      <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000000' }} dangerouslySetInnerHTML={formatPrice(orderAmount)}></span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000000' }}>
                        SALES TAX:
                      </span>
                      <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000000' }} dangerouslySetInnerHTML={formatPrice(taxesProcessing)}></span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000000' }}>
                        SHIPPING + HANDLING:
                      </span>
                      <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000000' }} dangerouslySetInnerHTML={formatPrice(shippingHandling)}></span>
                    </div>
                    {rushProcessing > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000000' }}>
                          RUSH PROCESSING:
                        </span>
                        <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000000' }} dangerouslySetInnerHTML={formatPrice(rushProcessing)}></span>
                      </div>
                    )}
                    {protectionFee > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000000' }}>
                          PACKAGE PROTECTION:
                        </span>
                        <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000000' }} dangerouslySetInnerHTML={formatPrice(protectionFee)}></span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000000' }}>
                        DISCOUNT:
                      </span>
                      <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000000' }} dangerouslySetInnerHTML={formatPrice(discount)}></span>
                    </div>
                    <div style={{ borderTop: '1.3px solid #000000', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '14px', color: '#000000', fontWeight: '500' }}>
                        TOTAL
                      </span>
                      <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '14px', color: '#000000', fontWeight: '500' }} dangerouslySetInnerHTML={formatPrice(subtotal)}></span>
                    </div>
                  </div>
                </div>

                {/* ORDER NOTES */}
                <div>
                  <h2 
                    style={{ 
                      fontFamily: '"Futura PT Medium"',
                      fontSize: '12px',
                      color: '#EB1C24',
                      margin: '0 0 12px 0',
                      textTransform: 'uppercase',
                      fontWeight: '500'
                    }}
                  >
                    ORDER NOTES:
                  </h2>
                  <textarea
                    placeholder="ENTER FRONT TO NAPE MEASUREMENT, STYLING PREFERENCES, SKIN TONE SHADE OR ANYTHING SPECIFIC YOU THINK WE SHOULD KNOW ABOUT THIS ORDER."
                    rows={6}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1.3px solid #000000',
                      fontFamily: '"Futura PT Book"',
                      fontSize: '11px',
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      resize: 'vertical',
                      borderRadius: '0'
                    }}
                  />
                </div>

                {/* CHECKBOXES AND SUBMIT BUTTON */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      onClick={() => setSubscribeNewsletter(!subscribeNewsletter)}
                      style={{
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1.3px solid #000000',
                        backgroundColor: 'transparent',
                        position: 'relative'
                      }}
                    >
                      {subscribeNewsletter && (
                        <img 
                          src="/assets/checkbox.svg" 
                          alt="checked" 
                          style={{ width: '16px', height: '16px', position: 'absolute' }}
                        />
                      )}
                    </div>
                    <label 
                      style={{ 
                        fontFamily: '"Futura PT Book"',
                        fontSize: '10px',
                        color: '#000000',
                        cursor: 'pointer',
                        textTransform: 'uppercase'
                      }}
                    >
                      SUBSCRIBE TO EMAIL NEWSLETTER
                    </label>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      onClick={() => setAgreeToTerms(!agreeToTerms)}
                      style={{
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1.3px solid #000000',
                        backgroundColor: 'transparent',
                        position: 'relative'
                      }}
                    >
                      {agreeToTerms && (
                        <img 
                          src="/assets/checkbox.svg" 
                          alt="checked" 
                          style={{ width: '16px', height: '16px', position: 'absolute' }}
                        />
                      )}
                    </div>
                    <label 
                      style={{ 
                        fontFamily: '"Futura PT Book"',
                        fontSize: '10px',
                        color: '#000000',
                        cursor: 'pointer',
                        textTransform: 'uppercase'
                      }}
                    >
                      I HAVE READ & AGREE TO THE <span 
                        style={{ color: '#EB1C24', cursor: 'pointer' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowTermsModal(true);
                        }}
                      >TERMS + CONDITIONS</span><span style={{ color: '#EB1C24' }}>*</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* CONFIRM ORDER BUTTON - Outside main card */}
          {!showMobileMenu && (
            <div className="px-0 md:px-0" style={{ marginTop: '2px', marginBottom: '20px' }}>
                  <button
                    onClick={() => {
                  // Check if terms are agreed to
                  if (!agreeToTerms) {
                    setShowTermsRequiredModal(true);
                    return;
                  }
                  
                  // Validate required fields
                  if (!firstName.trim()) {
                    setValidationMessage('FIRST NAME IS REQUIRED.');
                    setShowValidationModal(true);
                    return;
                  }
                  if (!lastName.trim()) {
                    setValidationMessage('LAST NAME IS REQUIRED.');
                    setShowValidationModal(true);
                    return;
                  }
                  if (!shippingAddress.trim()) {
                    setValidationMessage('SHIPPING ADDRESS IS REQUIRED.');
                    setShowValidationModal(true);
                    return;
                  }
                  if (!city.trim()) {
                    setValidationMessage('CITY IS REQUIRED.');
                    setShowValidationModal(true);
                    return;
                  }
                  if (!state.trim()) {
                    setValidationMessage('STATE IS REQUIRED.');
                    setShowValidationModal(true);
                    return;
                  }
                  if (!zip.trim()) {
                    setValidationMessage('ZIP CODE IS REQUIRED.');
                    setShowValidationModal(true);
                    return;
                  }
                  if (!phoneNumber.trim()) {
                    setValidationMessage('PHONE NUMBER IS REQUIRED.');
                    setShowValidationModal(true);
                    return;
                  }
                  if (!email.trim()) {
                    setValidationMessage('EMAIL IS REQUIRED.');
                    setShowValidationModal(true);
                    return;
                  }
                  if (!cardholder.trim()) {
                    setValidationMessage('CARDHOLDER NAME IS REQUIRED.');
                    setShowValidationModal(true);
                    return;
                  }
                  if (!cardNumber.trim()) {
                    setValidationMessage('CARD NUMBER IS REQUIRED.');
                    setShowValidationModal(true);
                    return;
                  }
                  if (!expirationDate.trim()) {
                    setValidationMessage('EXPIRATION DATE IS REQUIRED.');
                    setShowValidationModal(true);
                    return;
                  }
                  if (!cvv.trim()) {
                    setValidationMessage('CVV IS REQUIRED.');
                    setShowValidationModal(true);
                    return;
                  }
                  if (!sameAsBilling) {
                    if (!billingAddress.trim()) {
                      setValidationMessage('BILLING ADDRESS IS REQUIRED.');
                      setShowValidationModal(true);
                      return;
                    }
                    if (!billingCity.trim()) {
                      setValidationMessage('BILLING CITY IS REQUIRED.');
                      setShowValidationModal(true);
                      return;
                    }
                    if (!billingState.trim()) {
                      setValidationMessage('BILLING STATE IS REQUIRED.');
                      setShowValidationModal(true);
                      return;
                    }
                    if (!billingZip.trim()) {
                      setValidationMessage('BILLING ZIP CODE IS REQUIRED.');
                      setShowValidationModal(true);
                      return;
                    }
                  }
                  
                      // Handle checkout submission
                  console.log('Confirm order');
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
                CONFIRM ORDER
                  </button>
              </div>
            )}
          </div>
        </div>
      </div>
    
    {/* Terms & Conditions Modal */}
    {showTermsModal && (
      <div 
        className="fixed z-50 backdrop-blur-md"
        style={{
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          zIndex: 999999999,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowTermsModal(false);
          }
        }}
      >
        <div
          className="p-6"
          style={{
            maxWidth: '400px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            border: '1.3px solid black',
            borderRadius: '0',
            transform: 'translateY(-6px)',
            backgroundImage: 'url(/assets/marble-popup.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center 60%',
            backgroundRepeat: 'no-repeat'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Terms of Service Section */}
          <h3
            style={{
              fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '16px',
              textAlign: 'center',
              color: '#EB1C24',
              textTransform: 'uppercase'
            }}
          >
            TERMS OF SERVICE
          </h3>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <p
              style={{
                fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                fontSize: '10px',
                color: '#000000',
                textTransform: 'uppercase',
                textAlign: 'center',
                transform: 'translateY(-1px)',
                margin: 0
              }}
            >
              BY PURCHASING, YOU ARE IN AGREEMENT TO THE FOLLOWING TERMS AND CONDITIONS: YOU HAVE READ + UNDERSTAND THE PRODUCT DETAILS AND CONSENT TO RECEIVING THE PRODUCT. YOU UNDERSTAND AND AGREE TO OUR RETURNS + REFUND POLICY. YOU HAVE VERIFIED YOUR SHIPPING ADDRESS BEFORE SUBMITTING YOUR ORDER & COMPLETED THE ORDER AUTHORIZATION FORM WITHIN 24 HOURS, POST PAYMENT. YOU UNDERSTAND THAT FRONTAL SLAYER IS NOT LIABLE FOR ANY DAMAGES THAT MAY OCCUR DURING SHIPMENT AND WHILE YOUR PRODUCT IS IN TRANSIT. YOU UNDERSTAND THAT ONCE AN ORDER IS SUBMITTED & CONFIRMED, CHANGES OR CANCELLATIONS CAN NOT BE MADE. THIS INCLUDES ITEM & SHIPPING ADDRESS CHANGES.
            </p>
          </div>

          {/* Refund + Return Policy Section */}
          <h3
            style={{
              fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '16px',
              marginTop: '20px',
              textAlign: 'center',
              color: '#EB1C24',
              textTransform: 'uppercase'
            }}
          >
            REFUND + RETURN POLICY
          </h3>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <p
              style={{
                fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                fontSize: '10px',
                color: '#000000',
                textTransform: 'uppercase',
                textAlign: 'center',
                transform: 'translateY(-1px)',
                margin: 0
              }}
            >
              ALL SALES ARE FINAL. WE ARE UNABLE TO OFFER REFUNDS, RETURNS OR EXCHANGES DUE TO SANITARY REASONS & THE HIGH APPEAL OF OUR PRODUCTS. PLEASE NOTE: FRONTAL SLAYER RESERVES THE RIGHT TO REFUSE ALL REFUNDS, RETURNS AND EXCHANGES. IF THERE IS AN ISSUE WITH YOUR ORDER, PLEASE REACH OUT TO CONTACT@FRONTALSLAYER.COM IMMEDIATELY. ALL INQUIRIES SHOULD RECEIVE A RESPONSE WITHIN 72 HOURS. CONTACT US IF YOUR ITEM IS DEFECTIVE OR YOU RECEIVED THE WRONG ITEM. WE WILL INVESTIGATE THE ISSUE THOROUGHLY AND CORRECT YOUR SHIPMENT OR ISSUE STORE CREDIT IF THE ITEM IS NO LONGER IN STOCK.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={() => setShowTermsModal(false)}
              className="flex-1 py-2 px-4 border border-black bg-white font-medium hover:bg-gray-50 transition-colors"
              style={{
                borderWidth: '1.3px',
                fontSize: '11px',
                fontFamily: '"Futura PT Medium"',
                color: '#000000',
                textTransform: 'uppercase'
              }}
            >
              CLOSE
            </button>
            <button
              onClick={() => {
                setAgreeToTerms(true);
                setShowTermsModal(false);
              }}
              className="flex-1 py-2 px-4 border border-black font-medium hover:bg-gray-50 transition-colors"
              style={{
                borderWidth: '1.3px',
                fontSize: '11px',
                fontFamily: '"Futura PT Medium"',
                backgroundColor: '#FFFFFF',
                color: '#EB1C24',
                textTransform: 'uppercase'
              }}
            >
              ACCEPT
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Terms Required Modal */}
    <ConfirmationModal
      isOpen={showTermsRequiredModal}
      onClose={() => setShowTermsRequiredModal(false)}
      onConfirm={() => setShowTermsRequiredModal(false)}
      title="TERMS & CONDITIONS REQUIRED"
      message="you must agree to the terms & conditions to finalize purchase."
      confirmText="OK"
      cancelText="CLOSE"
      messageTextTransform="uppercase"
    />
    
    {/* Validation Modal */}
    <ConfirmationModal
      isOpen={showValidationModal}
      onClose={() => setShowValidationModal(false)}
      onConfirm={() => setShowValidationModal(false)}
      title="INPUT FIELD REQUIRED"
      message={validationMessage}
      confirmText="OK"
      cancelText="CLOSE"
      messageTextTransform="uppercase"
    />
    </>
  );
}

export default CheckoutPage;

