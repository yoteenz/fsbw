import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DynamicCartIcon from '../../components/DynamicCartIcon';
import ConfirmationModal from '../../components/ConfirmationModal';
import { handlePaymentOption, PaymentProvider, PaymentData } from '../../utils/paymentHandlers';
import { createRouteProtection, prepareRouteProtectionData } from '../../utils/routeProtection';
import BrandMenuLinks from '../../components/BrandMenuLinks';
import SocialMenuIcons from '../../components/SocialMenuIcons';

function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartItems, setCartItems] = useState<any[]>([]);
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

  // Form state
  const [sameAsBilling, setSameAsBilling] = useState(false);
  const [useDefaultMethod, setUseDefaultMethod] = useState(false);
  const [savePaymentMethod, setSavePaymentMethod] = useState(false);
  const [useDefaultPaymentMethod, setUseDefaultPaymentMethod] = useState(false);
  const [savePaymentMethodCard, setSavePaymentMethodCard] = useState(false);
  const [autoRenewMembership, setAutoRenewMembership] = useState(false);
  // Initialize newsletter subscription based on mailing list status
  // Auto-select if NOT on mailing list, auto-deselect if ON mailing list
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const isSignedIn = localStorage.getItem('isSignedIn') === 'true';
        if (isSignedIn) {
          const currentUser = localStorage.getItem('currentUser');
          if (currentUser) {
            const user = JSON.parse(currentUser);
            // If user is on mailing list, auto-deselect (false)
            // If user is NOT on mailing list, auto-select (true)
            const onMailingList = user.onMailingList === true;
            return !onMailingList; // Invert: not on list = subscribe (true), on list = don't subscribe (false)
          }
        }
      } catch (e) {
        // If error, default to true (subscribe) for new users
      }
    }
    // Default to true (auto-select) if not signed in or user not found
    return true;
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [addressConfirmed, setAddressConfirmed] = useState(false);
  const [showTermsRequiredModal, setShowTermsRequiredModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [selectedProcessing, setSelectedProcessing] = useState('standard');
  const [packageProtection, setPackageProtection] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [zipCodeError, setZipCodeError] = useState('');
  const [shippingCalculated, setShippingCalculated] = useState(false);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<{carrier: string, speed: string, cost: number, originalCost?: number} | null>(null);
  
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
  const [billingFirstName, setBillingFirstName] = useState('');
  const [billingLastName, setBillingLastName] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [billingAptSuite, setBillingAptSuite] = useState('');
  const [billingCity, setBillingCity] = useState('');
  const [billingState, setBillingState] = useState('');
  const [billingZip, setBillingZip] = useState('');
  
  // Discount code state
  const [discountCode, setDiscountCode] = useState('');
  const [discountCodeDisplay, setDiscountCodeDisplay] = useState('');
  const [discountCodeError, setDiscountCodeError] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [isDiscountCodeFocused, setIsDiscountCodeFocused] = useState(false);
  
  // Referral code state
  const [appliedReferralCode, setAppliedReferralCode] = useState('');
  const [referralDiscount, setReferralDiscount] = useState(0);
  
  // Gift card balance state
  const [giftCardBalance, setGiftCardBalance] = useState(0);
  const [appliedGiftCardBalance, setAppliedGiftCardBalance] = useState(0);
  const userSelectedDigitalCashRef = useRef<number | null>(null);
  const [showDigitalCashModal, setShowDigitalCashModal] = useState(false);
  const [digitalCashModalAmount, setDigitalCashModalAmount] = useState(0);
  
  // Tip state - store percentage (0-100) or custom dollar amount (negative values indicate custom dollar amount)
  const [tipPercentage, setTipPercentage] = useState<number | null>(null);
  const [customTipAmount, setCustomTipAmount] = useState(0);
  const [customTipApplied, setCustomTipApplied] = useState(false);
  const [customTipDisplay, setCustomTipDisplay] = useState('');
  
  // Validation modals
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [fieldToFocus, setFieldToFocus] = useState<string | null>(null);
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());
  
  // Refs for input fields
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const shippingAddressRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const stateRef = useRef<HTMLInputElement>(null);
  const zipRef = useRef<HTMLInputElement>(null);
  const phoneNumberRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const cardholderRef = useRef<HTMLInputElement>(null);
  const cardNumberRef = useRef<HTMLInputElement>(null);
  const expirationDateRef = useRef<HTMLInputElement>(null);
  const cvvRef = useRef<HTMLInputElement>(null);
  const billingAddressRef = useRef<HTMLInputElement>(null);
  const billingCityRef = useRef<HTMLInputElement>(null);
  const billingStateRef = useRef<HTMLInputElement>(null);
  const billingZipRef = useRef<HTMLInputElement>(null);

  // Payment processing state
  const [processingPayment, setProcessingPayment] = useState(false);

  // Horizontal scroll state for products
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startScrollPosition, setStartScrollPosition] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
  const hasColorStylingOrAddOns = useMemo(() => {
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
  
  const currencyRates = useMemo(() => ({
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


  // Check if this is a subscription upgrade
  const [isSubscriptionUpgrade, setIsSubscriptionUpgrade] = useState(false);

  // Load cart items from localStorage
  const loadCartItems = () => {
    try {
      // Check the route pathname to determine checkout type
      const isUpgradeRoute = location.pathname === '/checkout/upgrade';
      
      if (isUpgradeRoute) {
        // This is a subscription upgrade checkout
        const subscriptionItem = localStorage.getItem('subscriptionUpgrade');
        if (subscriptionItem) {
          const item = JSON.parse(subscriptionItem);
          // Clean up name if it has old format "PREMIUM MEMBERSHIP -"
          if (item.name && item.name.includes('PREMIUM MEMBERSHIP -')) {
            item.name = item.name.replace('PREMIUM MEMBERSHIP - ', '').trim();
          }
          setIsSubscriptionUpgrade(true);
          setCartItems([item]);
          return;
        } else {
          // No subscription item found, redirect to regular checkout
          setIsSubscriptionUpgrade(false);
          setCartItems([]);
          return;
        }
      } else {
        // This is a regular checkout
        const stored = localStorage.getItem('cartItems');
        let regularCartItems: any[] = [];
        if (stored) {
          const items = JSON.parse(stored);
          if (Array.isArray(items) && items.length > 0) {
            regularCartItems = items;
          }
        }
        
        setIsSubscriptionUpgrade(false);
        setCartItems(regularCartItems);
        return;
      }
    } catch (e) {
      console.error('Error loading cart items:', e);
      setCartItems([]);
      setIsSubscriptionUpgrade(false);
    }
  };

  useEffect(() => {
    loadCartItems();
  }, [location.pathname]);

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

  // Check sign-in status on mount and listen for changes
  useEffect(() => {
    const checkSignInStatus = () => {
      try {
        const signedIn = localStorage.getItem('isSignedIn') === 'true';
        setIsSignedIn(prev => {
          // Only update if value has changed to prevent unnecessary re-renders
          if (prev !== signedIn) {
            return signedIn;
          }
          return prev;
        });
      } catch (e) {
        setIsSignedIn(prev => {
          if (prev !== false) {
            return false;
          }
          return prev;
        });
      }
    };

    // Skip initial check since useState already reads from localStorage
    // Only set up listeners for future changes

    // Listen for storage changes (when user signs in/out in another tab)
    const handleStorageChange = () => {
      checkSignInStatus();
    };

    // Listen for sign-in state changes from sign-in page
    const handleSignInStateChange = () => {
      checkSignInStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);
    window.addEventListener('signInStateChanged', handleSignInStateChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
      window.removeEventListener('signInStateChanged', handleSignInStateChange as EventListener);
    };
  }, []);

  // Auto-populate billing address from shipping address when checkbox is checked
  useEffect(() => {
    if (sameAsBilling) {
      setBillingFirstName(firstName);
      setBillingLastName(lastName);
      setBillingAddress(shippingAddress);
      setBillingCity(city);
      setBillingState(state);
      setBillingZip(zip);
    } else {
      // Clear billing fields when unchecked
      setBillingFirstName('');
      setBillingLastName('');
      setBillingAddress('');
      setBillingCity('');
      setBillingState('');
      setBillingZip('');
      setBillingAptSuite('');
    }
  }, [sameAsBilling, firstName, lastName, shippingAddress, city, state, zip]);

  // Load and apply gift card balance (NOT for subscription upgrades)
  useEffect(() => {
    // Don't apply gift card to subscription upgrades
    if (isSubscriptionUpgrade) {
      setGiftCardBalance(0);
      setAppliedGiftCardBalance(0);
      return;
    }
    
    if (isSignedIn) {
      try {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
          const user = JSON.parse(currentUser);
          const balance = user.giftCardBalance || 0;
          setGiftCardBalance(balance);
          // Automatically apply gift card balance (will be capped at order total in calculation)
          setAppliedGiftCardBalance(balance);
        }
      } catch (e) {
        setGiftCardBalance(0);
        setAppliedGiftCardBalance(0);
      }
    } else {
      setGiftCardBalance(0);
      setAppliedGiftCardBalance(0);
    }
  }, [isSignedIn, isSubscriptionUpgrade]);

  // Auto-populate email from signed-in user's account
  useEffect(() => {
    if (isSignedIn && !email) {
      try {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
          const user = JSON.parse(currentUser);
          if (user.email) {
            setEmail(user.email);
          }
        }
      } catch (error) {
        console.error('Error loading user email:', error);
      }
    }
  }, [isSignedIn]);

  // Auto-select/deselect newsletter subscription based on mailing list status
  useEffect(() => {
    if (isSignedIn) {
      try {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
          const user = JSON.parse(currentUser);
          // If user is on mailing list, auto-deselect (false)
          // If user is NOT on mailing list, auto-select (true)
          const onMailingList = user.onMailingList === true;
          setSubscribeNewsletter(!onMailingList);
        }
      } catch (error) {
        console.error('Error checking mailing list status:', error);
        // Default to true (subscribe) if error
        setSubscribeNewsletter(true);
      }
    } else {
      // If not signed in, default to true (auto-select)
      setSubscribeNewsletter(true);
    }
  }, [isSignedIn]);

  // Auto-populate shipping address from default method when checkbox is checked
  useEffect(() => {
    if (useDefaultMethod && isSignedIn) {
      try {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
          const user = JSON.parse(currentUser);
          // Check if user has a default address saved
          const defaultAddress = user.defaultAddress || user.shippingAddress;
          if (defaultAddress) {
            setFirstName(defaultAddress.firstName || '');
            setLastName(defaultAddress.lastName || '');
            setShippingAddress(defaultAddress.address || '');
            setCity(defaultAddress.city || '');
            setState(defaultAddress.state || '');
            setZip(defaultAddress.zip || '');
            setPhoneNumber(defaultAddress.phoneNumber || user.phoneNumber || '');
            setEmail(defaultAddress.email || user.email || email);
          } else if (user.firstName && user.lastName) {
            // Fallback to user's basic info if no default address
            setFirstName(user.firstName || '');
            setLastName(user.lastName || '');
            setEmail(user.email || email);
            setPhoneNumber(user.phoneNumber || '');
          }
        }
      } catch (error) {
        console.error('Error loading default address:', error);
      }
    } else if (!useDefaultMethod) {
      // Clear fields when checkbox is unchecked (but keep email if user is signed in)
      setFirstName('');
      setLastName('');
      setShippingAddress('');
      setCity('');
      setState('');
      setZip('');
      setPhoneNumber('');
      // Don't clear email - it should remain from signed-in user
    }
  }, [useDefaultMethod, isSignedIn, email]);

  // Save payment method when checkbox is checked and form is submitted
  useEffect(() => {
    if (savePaymentMethod && isSignedIn && firstName && lastName && shippingAddress && city && state && zip) {
      // This will be saved when the order is placed
      // For now, we just track the state
    }
  }, [savePaymentMethod, isSignedIn, firstName, lastName, shippingAddress, city, state, zip]);

  // Auto-populate payment fields from default payment method when checkbox is checked
  useEffect(() => {
    if (useDefaultPaymentMethod && isSignedIn) {
      try {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
          const user = JSON.parse(currentUser);
          // Check if user has a default payment method saved
          const defaultPayment = user.defaultPaymentMethod;
          if (defaultPayment) {
            setCardholder(defaultPayment.cardholder || '');
            // Only show last 4 digits, but we'll need to handle this differently
            // For now, we'll just set the cardholder name
            setExpirationDate(defaultPayment.expirationDate || '');
            setBillingZip(defaultPayment.billingZip || '');
          }
        }
      } catch (error) {
        console.error('Error loading default payment method:', error);
      }
    } else if (!useDefaultPaymentMethod) {
      // Clear payment fields when checkbox is unchecked
      setCardholder('');
      setCardNumber('');
      setExpirationDate('');
      setCvv('');
      setBillingZip('');
    }
  }, [useDefaultPaymentMethod, isSignedIn]);

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

  const formatPrice = useCallback((price: number) => {
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


  // Format expiration date as MM/YY
  const formatExpirationDate = (value: string) => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '');
    
    // Limit to 4 digits (MMYY)
    const limited = numbers.slice(0, 4);
    
    // Add slash after 2 digits
    if (limited.length >= 2) {
      return limited.slice(0, 2) + '/' + limited.slice(2);
    }
    
    return limited;
  };

  // Format CVV to max 3 digits
  const formatCVV = (value: string) => {
    // Remove all non-numeric characters and limit to 3 digits
    return value.replace(/\D/g, '').slice(0, 3);
  };

  // Check if country uses alphanumeric postal codes
  const usesAlphanumericPostalCode = (country: string): boolean => {
    // Countries that use alphanumeric postal codes
    const alphanumericCountries = ['GB', 'CA', 'OTHER'];
    return alphanumericCountries.includes(country);
  };

  // Validate zip code against state (for US)
  const validateZipCodeForState = (zip: string, state: string, country: string): boolean => {
    if (country !== 'US' || !state || !zip) return true; // Skip validation for non-US or missing data
    
    const zipNum = parseInt(zip, 10);
    if (isNaN(zipNum)) return false;
    
    // Basic zip code range validation for US states
    // This is a simplified validation - in production, you'd use a comprehensive zip code database
    const stateZipRanges: { [key: string]: { min: number, max: number } } = {
      'AL': { min: 35000, max: 36999 },
      'AK': { min: 99500, max: 99999 },
      'AZ': { min: 85000, max: 86999 },
      'AR': { min: 71600, max: 72999 },
      'CA': { min: 90000, max: 96999 },
      'CO': { min: 80000, max: 81999 },
      'CT': { min: 6000, max: 6999 },
      'DE': { min: 19700, max: 19999 },
      'FL': { min: 32000, max: 34999 },
      'GA': { min: 30000, max: 31999 },
      'HI': { min: 96700, max: 96999 },
      'ID': { min: 83200, max: 83999 },
      'IL': { min: 60000, max: 62999 },
      'IN': { min: 46000, max: 47999 },
      'IA': { min: 50000, max: 52999 },
      'KS': { min: 66000, max: 67999 },
      'KY': { min: 40000, max: 42999 },
      'LA': { min: 70000, max: 71999 },
      'ME': { min: 3900, max: 4999 },
      'MD': { min: 20600, max: 21999 },
      'MA': { min: 1000, max: 2799 },
      'MI': { min: 48000, max: 49999 },
      'MN': { min: 55000, max: 56999 },
      'MS': { min: 38600, max: 39999 },
      'MO': { min: 63000, max: 65999 },
      'MT': { min: 59000, max: 59999 },
      'NE': { min: 68000, max: 69999 },
      'NV': { min: 88900, max: 89999 },
      'NH': { min: 3000, max: 3899 },
      'NJ': { min: 7000, max: 8999 },
      'NM': { min: 87000, max: 88999 },
      'NY': { min: 10000, max: 14999 },
      'NC': { min: 27000, max: 28999 },
      'ND': { min: 58000, max: 58999 },
      'OH': { min: 43000, max: 45999 },
      'OK': { min: 73000, max: 74999 },
      'OR': { min: 97000, max: 97999 },
      'PA': { min: 15000, max: 19999 },
      'RI': { min: 2800, max: 2999 },
      'SC': { min: 29000, max: 29999 },
      'SD': { min: 57000, max: 57999 },
      'TN': { min: 37000, max: 38999 },
      'TX': { min: 75000, max: 79999 },
      'UT': { min: 84000, max: 84999 },
      'VT': { min: 5000, max: 5999 },
      'VA': { min: 22000, max: 24699 },
      'WA': { min: 98000, max: 99999 },
      'WV': { min: 24700, max: 26999 },
      'WI': { min: 53000, max: 54999 },
      'WY': { min: 82000, max: 83999 },
    };
    
    const range = stateZipRanges[state];
    if (!range) return true; // If state not in list, assume valid
    
    return zipNum >= range.min && zipNum <= range.max;
  };

  // Format zip code based on country
  const formatZipCode = (value: string, country: string) => {
    if (usesAlphanumericPostalCode(country)) {
      // Allow alphanumeric characters, remove spaces and convert to uppercase
      // UK format: SW1A 1AA, M1 1AA, etc. (up to 8 characters)
      // Canada format: A1A 1A1 (6 characters)
      const alphanumeric = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      if (country === 'GB') {
        return alphanumeric.slice(0, 8); // UK postal codes can be up to 7-8 characters
      } else if (country === 'CA') {
        return alphanumeric.slice(0, 6); // Canada postal codes are 6 characters
      } else {
        return alphanumeric.slice(0, 10); // Other countries, allow up to 10
      }
    } else {
      // Numeric-only postal codes
      const numbers = value.replace(/\D/g, '');
      
      // US zip codes are 5 digits
      if (country === 'US') {
        return numbers.slice(0, 5);
      }
      // Australia uses 4 digits
      else if (country === 'AU') {
        return numbers.slice(0, 4);
      }
      // For other numeric countries, allow up to 10 digits
      return numbers.slice(0, 10);
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
      // Navigate to sign-in page with returnTo parameter
      navigate('/sign-in?returnTo=checkout');
    }
  };

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
    
    // Calculate scroll limits
    const gap = 20;
    const paddingRight = 10;
    const containerWidth = scrollContainerRef.current?.offsetWidth || window.innerWidth - 32; // Account for page padding
    
    // Calculate total content width
    let totalContentWidth = paddingRight; // Start with padding
    cartItems.forEach((item, index) => {
      const itemWidth = (item.name === 'GIFT CARD' || item.type === 'gift-card') ? 165 : 150;
      totalContentWidth += itemWidth;
      if (index < cartItems.length - 1) {
        totalContentWidth += gap;
      }
    });
    
    const maxScroll = 0;
    const minScroll = -(totalContentWidth - containerWidth);
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
    
    // Calculate scroll limits
    const gap = 20;
    const paddingRight = 10;
    const containerWidth = scrollContainerRef.current?.offsetWidth || window.innerWidth - 32; // Account for page padding
    
    // Calculate total content width
    let totalContentWidth = paddingRight; // Start with padding
    cartItems.forEach((item, index) => {
      const itemWidth = (item.name === 'GIFT CARD' || item.type === 'gift-card') ? 165 : 150;
      totalContentWidth += itemWidth;
      if (index < cartItems.length - 1) {
        totalContentWidth += gap;
      }
    });
    
    const maxScroll = 0;
    const minScroll = -(totalContentWidth - containerWidth);
    setScrollPosition(Math.max(minScroll, Math.min(maxScroll, newPosition)));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
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

  // Get user's premium membership tier

  const getPremiumTier = (): string | null => {
    if (!isSignedIn) return null;
    try {
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        const user = JSON.parse(currentUser);
        // Check for subscriptionTier (3months, 6months, 12months) - for paid subscriptions
        if (user.subscriptionTier) {
          return user.subscriptionTier; // '3months', '6months', or '12months'
        }
        
        // Check if user has PREMIUM membership but no subscriptionTier (admin accounts)
        // Admin accounts with PREMIUM membership get 12months tier for shipping discounts
        if (user.membershipType === 'PREMIUM' || user.membershipType === 'Premium') {
          return '12months'; // Admin/premium accounts get 12 months premium benefits
        }
        
        return null;
      }
    } catch (e) {
      console.error('Error getting premium tier:', e);
    }
    return null;
  };

  // Calculate available shipping options based on address (shows original prices, discounts applied in order summary)
  const calculateShippingOptions = () => {
    if (!selectedCountry || !zipCode) return [];
    
    const isDomestic = selectedCountry === 'US';
    
    if (isDomestic) {
      // Domestic options: standard or express (original prices)
      return [
        { carrier: 'DOMESTIC', speed: 'standard', cost: 60, label: 'DOMESTIC STANDARD +$60', originalCost: 60 },
        { carrier: 'DOMESTIC', speed: 'express', cost: 100, label: 'DOMESTIC EXPRESS +$100', originalCost: 100 },
      ];
    } else {
      // International options: standard and express (original prices)
      return [
        { carrier: 'INTERNATIONAL', speed: 'standard', cost: 100, label: 'INTERNATIONAL STANDARD +$100', originalCost: 100 },
        { carrier: 'INTERNATIONAL', speed: 'express', cost: 160, label: 'INTERNATIONAL EXPRESS +$160', originalCost: 160 },
      ];
    }
  };

  // Calculate premium shipping discount based on selected method and tier
  const calculatePremiumShippingDiscount = (): { discount: number; originalCost: number; finalCost: number } => {
    if (!selectedShippingMethod || isSubscriptionUpgrade || isOnlyDigitalProducts) {
      return { discount: 0, originalCost: 0, finalCost: 0 };
    }

    const originalCost = selectedShippingMethod.originalCost || selectedShippingMethod.cost || 0;
    const isDomestic = selectedCountry === 'US';
    let discount = 0;
    let finalCost = originalCost;

    // Premium tier shipping discounts
    const premiumTier = getPremiumTier();
    if (!premiumTier) {
      return { discount: 0, originalCost, finalCost: originalCost };
    }

    if (isDomestic) {
      if (selectedShippingMethod.speed === 'standard') {
        if (premiumTier === '3months') {
          discount = 20;
        } else if (premiumTier === '6months') {
          discount = 40;
        } else if (premiumTier === '12months') {
          discount = 60; // Free
        }
      } else if (selectedShippingMethod.speed === 'express') {
        if (premiumTier === '6months') {
          discount = 40;
        } else if (premiumTier === '12months') {
          discount = 40;
        }
      }
    } else {
      // International
      if (selectedShippingMethod.speed === 'standard' && premiumTier === '12months') {
        discount = 40;
      } else if (selectedShippingMethod.speed === 'express' && premiumTier === '12months') {
        discount = 40;
      }
    }

    finalCost = Math.max(0, originalCost - discount);
    return { discount, originalCost, finalCost };
  };

  const availableShippingOptions = calculateShippingOptions();

  // Check if cart only contains digital products (gift cards or digital items)
  const isOnlyDigitalProducts = cartItems.length > 0 && cartItems.every((item) => {
    const isGiftCard = item.name === 'GIFT CARD' || item.type === 'gift-card';
    const isDigital = item.type === 'digital';
    return isGiftCard || isDigital;
  });

  // Check if cart only contains gift cards
  const isOnlyGiftCards = cartItems.length > 0 && cartItems.every((item) => {
    return item.name === 'GIFT CARD' || item.type === 'gift-card';
  });

  // Calculate Route protection fee based on order value (scales with cart total)
  // Structure: Flat $20 for orders up to $1,000, then percentage-based for larger orders
  // This aligns with Route's typical 2.5% rate for high-value orders
  // Always rounds UP to nearest $10 increment
  const calculateProtectionFee = (orderTotal: number): number => {
    if (orderTotal <= 1000) {
      return 20; // Flat $20 for orders up to $1,000 (covers typical $740-$820 orders)
    } else {
      let calculatedFee = 0;
      if (orderTotal <= 2500) {
        calculatedFee = orderTotal * 0.02; // 2% for orders $1,000-$2,500
      } else if (orderTotal <= 5000) {
        calculatedFee = orderTotal * 0.0225; // 2.25% for orders $2,500-$5,000
      } else {
        calculatedFee = orderTotal * 0.025; // 2.5% for orders $5,000+
      }
      // Round up to nearest $10 increment
      return Math.ceil(calculatedFee / 10) * 10;
    }
  };

  // Calculate order totals
  const orderAmount = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  
  // Calculate taxable amount (exclude gift cards and digital items)
  const taxableAmount = cartItems.reduce((sum, item) => {
    // Skip gift cards and digital items
    const isGiftCard = item.name === 'GIFT CARD' || item.type === 'gift-card';
    const isDigital = item.type === 'digital';
    
    if (isGiftCard || isDigital) {
      return sum; // Don't add to taxable amount
    }
    
    return sum + (item.price || 0) * (item.quantity || 1);
  }, 0);
  
  // Calculate points-eligible amount (exclude gift cards and digital items like memberships)
  const pointsEligibleAmount = cartItems.reduce((sum, item) => {
    // Skip gift cards and digital items (memberships)
    const isGiftCard = item.name === 'GIFT CARD' || item.type === 'gift-card';
    const isDigital = item.type === 'digital';
    
    if (isGiftCard || isDigital) {
      return sum; // Don't add to points-eligible amount
    }
    
    return sum + (item.price || 0) * (item.quantity || 1);
  }, 0);
  
  const taxesProcessing = taxableAmount * 0.10; // 10% sales tax on taxable amount only (excluding gift cards, digital items, shipping & discounts)
  
  // Calculate shipping based on selected method (applies premium discount)
  const getShippingCost = () => {
    if (isSubscriptionUpgrade || isOnlyDigitalProducts) return 0; // No shipping for digital subscription upgrades or digital-only carts
    if (!selectedShippingMethod) return 0;
    
    // Get premium discount
    const premiumDiscount = calculatePremiumShippingDiscount();
    return premiumDiscount.finalCost;
  };
  const shippingHandling = getShippingCost();
  
  // Get premium shipping discount info for display
  const premiumShippingDiscount = calculatePremiumShippingDiscount();

  // Update applied gift card balance when order amount changes (cap at order total)
  // NOT applied to subscription upgrades
  // Cannot be combined with referral codes or discount codes
  // Note: Adding a gift card (code) at checkout replaces the digital cash line; digital cash (account balance) and gift card code cannot be applied together.
  // When user has chosen an amount in the digital cash modal, we cap that choice by the new max but do not reset to full cap.
  useEffect(() => {
    if (isSubscriptionUpgrade) {
      setAppliedGiftCardBalance(0);
      userSelectedDigitalCashRef.current = null;
      return;
    }
    if (appliedReferralCode || appliedDiscount > 0) {
      setAppliedGiftCardBalance(0);
      userSelectedDigitalCashRef.current = null;
      return;
    }
    if (giftCardBalance <= 0) {
      setAppliedGiftCardBalance(0);
      userSelectedDigitalCashRef.current = null;
      return;
    }
    const protectionFeeForDiscount = packageProtection ? calculateProtectionFee(orderAmount) : 0;
    const maxDiscountable = orderAmount + taxesProcessing + shippingHandling + (selectedProcessing === 'rush' ? 100 : 0) + protectionFeeForDiscount;
    const cappedBalance = Math.min(giftCardBalance, maxDiscountable);
    if (userSelectedDigitalCashRef.current !== null) {
      setAppliedGiftCardBalance(Math.min(userSelectedDigitalCashRef.current, cappedBalance));
    } else {
      setAppliedGiftCardBalance(cappedBalance);
    }
  }, [giftCardBalance, orderAmount, taxesProcessing, shippingHandling, selectedProcessing, packageProtection, isSubscriptionUpgrade, appliedReferralCode, appliedDiscount]);
  
  // Check if code is a referral code
  const isReferralCode = (code: string): boolean => {
    try {
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const upperCode = code.trim().toUpperCase();
      return registeredUsers.some((user: any) =>
        user.referralCode && user.referralCode.toUpperCase() === upperCode
      );
    } catch (e) {
      return false;
    }
  };

  // Referral codes are inactive until the owner has an order marked complete & delivered. Existing users with orders but no hasMadeFirstPurchase flag are treated as active.
  const getReferralCodeOwner = (code: string): { user: any; isActive: boolean } | null => {
    try {
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const upperCode = code.trim().toUpperCase();
      const owner = registeredUsers.find((user: any) =>
        user.referralCode && user.referralCode.toUpperCase() === upperCode
      );
      if (!owner) return null;
      let isActive = false;
      if (owner.email) {
        const key = `userOrders_${String(owner.email).trim().toLowerCase()}`;
        const raw = localStorage.getItem(key);
        if (raw) {
          const data = JSON.parse(raw);
          const activeOrders = data.activeOrders || [];
          const pastOrders = data.pastOrders || [];
          const allOrders = [...activeOrders, ...pastOrders];
          const hasDelivered = allOrders.some((o: any) => o.status === 'DELIVERED');
          if (hasDelivered) isActive = true;
          if (!isActive && owner.hasMadeFirstPurchase !== true && allOrders.length > 0) isActive = true;
        }
      }
      return { user: owner, isActive };
    } catch (e) {
      return null;
    }
  };

  // Check if current user has ever completed a purchase (referral codes only valid on first purchase)
  const currentUserHasExistingOrders = (): boolean => {
    if (!isSignedIn || !email) return false;
    try {
      const key = `userOrders_${email.trim().toLowerCase()}`;
      const raw = localStorage.getItem(key);
      if (!raw) return false;
      const data = JSON.parse(raw);
      const active = (data.activeOrders || []).length;
      const past = (data.pastOrders || []).length;
      return active + past > 0;
    } catch (e) {
      return false;
    }
  };
  
  // Check if code is a gift card (numeric)
  const isGiftCardCode = (code: string): boolean => {
    const numericValue = code.replace(/[$€£¥₹,.\s]/g, '');
    return /^\d+$/.test(numericValue) && numericValue.length > 0;
  };
  
  // Discount code validation function
  const validateDiscountCode = (code: string): number => {
    // Define valid discount codes and their discount amounts
    // You can expand this list with actual discount codes
    const validCodes: { [key: string]: number } = {
      'WELCOME10': 10,
      'SAVE20': 20,
      'FIRST25': 25,
      // Add more valid codes here
    };
    
    const upperCode = code.trim().toUpperCase();
    return validCodes[upperCode] || 0;
  };
  
  const handleApplyDiscountCode = () => {
    if (!discountCode.trim()) {
      setDiscountCodeError('');
      setAppliedDiscount(0);
      setAppliedReferralCode('');
      setReferralDiscount(0);
      return;
    }
    
    // Show error for digital products (subscription upgrades or gift cards)
    if (isSubscriptionUpgrade || isOnlyGiftCards) {
      setDiscountCodeError('SORRY, THIS CODE IS NOT VALID.');
      setAppliedDiscount(0);
      setAppliedReferralCode('');
      setReferralDiscount(0);
      return;
    }
    
    const code = discountCode.trim();
    
    // Check if it's a referral code
    if (isReferralCode(code)) {
      if (!isSignedIn) {
        setDiscountCodeError('SIGN IN OR CREATE AN ACCOUNT TO USE A REFERRAL CODE.');
        return;
      }
      if (appliedDiscount > 0) {
        setDiscountCodeError('REFERRAL CODES CANNOT BE COMBINED WITH DISCOUNT CODES.');
        setAppliedReferralCode('');
        setReferralDiscount(0);
        return;
      }
      if (appliedGiftCardBalance > 0) {
        setDiscountCodeError('REFERRAL CODES CANNOT BE COMBINED WITH GIFT CARDS.');
        setAppliedReferralCode('');
        setReferralDiscount(0);
        return;
      }
      // Referral code is only valid (shareable/redeemable) once the code owner has made their first purchase
      const ownerResult = getReferralCodeOwner(code);
      if (!ownerResult) {
        setDiscountCodeError('THIS REFERRAL CODE IS NOT VALID.');
        return;
      }
      if (!ownerResult.isActive) {
        setDiscountCodeError('THIS REFERRAL CODE IS NOT YET ACTIVE.');
        return;
      }
      // Referrer cannot use their own code
      const buyerEmail = (email || '').trim().toLowerCase();
      const ownerEmail = (ownerResult.user?.email || '').trim().toLowerCase();
      if (buyerEmail && ownerEmail && buyerEmail === ownerEmail) {
        setDiscountCodeError('YOU CANNOT USE YOUR OWN REFERRAL CODE.');
        return;
      }
      // Referral codes can only be used on the referred customer's first purchase
      if (currentUserHasExistingOrders()) {
        setDiscountCodeError('REFERRAL CODES CAN ONLY BE USED ON YOUR FIRST PURCHASE.');
        return;
      }
      if (appliedGiftCardBalance > 0) {
        setAppliedGiftCardBalance(0);
      }
      setAppliedReferralCode(code.toUpperCase());
      setReferralDiscount(20);
      setDiscountCodeError('');
      setAppliedDiscount(0);
      return;
    }
    
    // Check if it's a gift card (numeric)
    if (isGiftCardCode(code)) {
      // Check if referral code or discount code is already applied
      if (appliedReferralCode) {
        setDiscountCodeError('GIFT CARDS CANNOT BE COMBINED WITH REFERRAL CODES.');
        return;
      }
      if (appliedDiscount > 0) {
        setDiscountCodeError('GIFT CARDS CANNOT BE COMBINED WITH DISCOUNT CODES.');
        return;
      }
      // Gift card is handled separately via giftCardBalance
      setDiscountCodeError('PLEASE USE YOUR GIFT CARD BALANCE FROM YOUR ACCOUNT.');
      setAppliedDiscount(0);
      setAppliedReferralCode('');
      setReferralDiscount(0);
      return;
    }
    
    // Check if referral code or gift card is already applied before applying discount code
    if (appliedReferralCode) {
      setDiscountCodeError('DISCOUNT CODES CANNOT BE COMBINED WITH REFERRAL CODES.');
      setAppliedDiscount(0);
      return;
    }
    if (appliedGiftCardBalance > 0) {
      setDiscountCodeError('DISCOUNT CODES CANNOT BE COMBINED WITH GIFT CARDS.');
      setAppliedDiscount(0);
      return;
    }
    
    // Try to validate as discount code
    const discountAmount = validateDiscountCode(code);
    
    if (discountAmount > 0) {
      // Clear gift card balance if applied
      if (appliedGiftCardBalance > 0) {
        setAppliedGiftCardBalance(0);
      }
      setAppliedDiscount(discountAmount);
      setDiscountCodeError('');
      setAppliedReferralCode('');
      setReferralDiscount(0);
    } else {
      setAppliedDiscount(0);
      setDiscountCodeError('SORRY, THIS CODE IS NOT VALID.');
      setAppliedReferralCode('');
      setReferralDiscount(0);
    }
  };
  
  const discount = appliedDiscount;
  // Gift card discount should NOT be applied to subscription upgrades. When applied, this is shown as "DIGITAL CASH" (account balance). This balance includes tier welcome discount (Silver $10, Red $40, Black $80) credited when the user reaches each spend tier. If a gift card code is applied instead, that replaces this line (label "GIFT CARD"); both cannot be applied together.
  const giftCardDiscount = isSubscriptionUpgrade ? 0 : appliedGiftCardBalance; // Automatically applied gift card balance (digital cash)
  const totalDiscount = discount + referralDiscount + giftCardDiscount; // Combined discount from codes, referral codes, and gift card / digital cash
  const rushProcessing = selectedProcessing === 'rush' ? 120 : 0;
  // Always calculate the protection fee amount (for display), but only add to total if selected
  const protectionFeeAmount = calculateProtectionFee(orderAmount);
  const protectionFee = packageProtection ? protectionFeeAmount : 0;
  // Calculate tip amount: if percentage is set, use that; otherwise use custom dollar amount (only if applied)
  const tipAmount = tipPercentage !== null ? Math.round(orderAmount * (tipPercentage / 100)) : (customTipApplied ? customTipAmount : 0);
  const subtotal = orderAmount + taxesProcessing + shippingHandling + rushProcessing + protectionFee - totalDiscount + tipAmount;

  // Prepare payment data for payment handlers
  const preparePaymentData = (): PaymentData => {
    const currency = currencyRates[selectedCurrency as keyof typeof currencyRates] || currencyRates.USD;
    const convertedOrderAmount = orderAmount * currency.rate;
    const convertedTaxes = taxesProcessing * currency.rate;
    const convertedShipping = shippingHandling * currency.rate;
    const convertedDiscount = totalDiscount * currency.rate; // Use totalDiscount (includes gift card)
    const convertedTip = tipAmount * currency.rate;
    const convertedRush = rushProcessing * currency.rate;
    const convertedProtection = protectionFee * currency.rate;
    
    const totalAmount = convertedOrderAmount + convertedTaxes + convertedShipping - convertedDiscount + convertedTip + convertedRush + convertedProtection;
    
    return {
      amount: totalAmount,
      currency: selectedCurrency,
      items: cartItems.map(item => ({
        name: item.name || 'Product',
        quantity: item.quantity || 1,
        price: (item.price || 0) * currency.rate
      })),
      customer: {
        email: email || undefined,
        firstName: firstName || undefined,
        lastName: lastName || undefined
      }
    };
  };

  // Handle payment option click
  const handlePaymentClick = async (provider: PaymentProvider) => {
    if (processingPayment) return; // Prevent multiple clicks
    
    // Validate shipping method is selected (skip for subscription upgrades)
    if (!isSubscriptionUpgrade && !selectedShippingMethod) {
      setValidationMessage('SHIPPING METHOD IS REQUIRED.');
      setShowValidationModal(true);
      return;
    }
    
    setProcessingPayment(true);
    
    try {
      const paymentData = preparePaymentData();
      const result = await handlePaymentOption(provider, paymentData);
      
      if (result.success) {
        if (result.redirectUrl) {
          // Prepare order data before redirecting (for return after payment completion)
          const lastOrderNumber = parseInt(localStorage.getItem('lastOrderNumber') || '0', 10);
          const nextOrderNumber = lastOrderNumber + 1;
          localStorage.setItem('lastOrderNumber', nextOrderNumber.toString());
          const orderNumber = `#${String(nextOrderNumber).padStart(3, '0')}`;
          
          // Generate random 6-character alphanumeric confirmation number
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
          
          // Calculate points earned
          const basePoints = isSignedIn ? Math.round(pointsEligibleAmount) : 0;
          const multiplier = 1;
          const pointsEarned = Math.round(basePoints * multiplier);
          
          // Store order data for return from payment provider
          const orderDataForReturn = {
            orderNumber: orderNumber,
            confirmationNumber: confirmationNumber,
            orderDate: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, '-'),
            orderTotal: paymentData.amount,
            paymentMethod: provider,
            cartItems: cartItems,
            pointsEarned: pointsEarned,
            firstName: firstName,
            lastName: lastName,
            shippingAddress: shippingAddress,
            city: city,
            state: state,
            zip: zip,
            country: selectedCountry || 'US',
            email: email,
            shippingMethod: selectedShippingMethod ? (() => {
              const options = calculateShippingOptions();
              const option = options.find(opt => 
                opt.carrier === selectedShippingMethod.carrier && 
                opt.speed === selectedShippingMethod.speed &&
                opt.cost === selectedShippingMethod.cost
              );
              return option?.label || `${selectedShippingMethod.carrier} ${selectedShippingMethod.speed.toUpperCase()}`;
            })() : 'STANDARD SHIPPING',
            processingTime: selectedProcessing === 'rush' ? '4 TO 6 WEEKS' : (hasColorStylingOrAddOns ? '6 TO 8 WEEKS (UP TO 10 WEEKS FOR CUSTOMIZED UNITS)' : '6 TO 8 WEEKS'),
          };
          
          // Store order data with a key that includes the provider for retrieval after redirect
          localStorage.setItem(`pendingOrder_${provider}`, JSON.stringify(orderDataForReturn));
          
          // Redirect to payment provider's checkout page
          // For placeholder implementations, this will route directly to order summary
          // For real implementations, payment provider will redirect back to the returnUrl in the redirect URL
          window.location.href = result.redirectUrl;
        } else if (result.transactionId) {
          // Payment completed successfully (e.g., Apple Pay)
          // Navigate to confirmation page
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
          
          // Calculate points earned (if signed in) - exclude gift cards and digital items
          const basePoints = isSignedIn ? Math.round(pointsEligibleAmount) : 0;
          const multiplier = 1;
          const pointsEarned = Math.round(basePoints * multiplier);
          
          // Create Route protection if package protection is selected (non-blocking)
          if (packageProtection && !isSubscriptionUpgrade && !isOnlyDigitalProducts) {
            try {
              const routeProtectionData = prepareRouteProtectionData(
                `order-${nextOrderNumber}`,
                orderNumber,
                paymentData.amount,
                selectedCurrency,
                cartItems,
                email,
                firstName,
                lastName,
                phoneNumber,
                shippingAddress,
                city,
                state,
                zip,
                selectedCountry || 'US',
                protectionFee
              );
              
              // Call Route API asynchronously (don't block navigation)
              createRouteProtection(routeProtectionData).then((routeResult) => {
                if (routeResult.success && routeResult.protectionId) {
                  console.log('Route protection created successfully:', routeResult.protectionId);
                } else {
                  console.warn('Route protection creation failed:', routeResult.error);
                }
              }).catch((error) => {
                console.error('Error creating Route protection:', error);
              });
            } catch (error) {
              console.error('Error preparing Route protection data:', error);
            }
          }
          
          navigate('/checkout/summary', {
            state: {
              orderNumber: orderNumber,
              confirmationNumber: confirmationNumber,
              orderDate: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, '-'),
              orderTotal: paymentData.amount,
              transactionId: result.transactionId,
              paymentMethod: provider,
              cartItems: cartItems,
              pointsEarned: pointsEarned,
            }
          });
        }
      } else {
        setShowValidationModal(true);
        setValidationMessage(result.error || 'Payment initialization failed. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setShowValidationModal(true);
      setValidationMessage(error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.');
    } finally {
      setProcessingPayment(false);
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
        input:focus,
        textarea:focus {
          outline: none !important;
          box-shadow: none !important;
        }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px #FFFFFF inset !important;
          -webkit-text-fill-color: #808080 !important;
          box-shadow: 0 0 0 30px #FFFFFF inset !important;
          background-color: #FFFFFF !important;
        }
        label span[style*="#EB1C24"] {
          color: #EB1C24 !important;
        }
        label span {
          color: #EB1C24 !important;
        }
        .delivery-price {
          color: #000000 !important;
        }
        .discount-code-input {
          font-family: "Futura PT Medium", "Futura PT Book", "Covered By Your Grace", "Covered By Your Grace Preload" !important;
          font-weight: 500 !important;
          color: #EB1C24 !important;
        }
        .custom-tip-input {
          font-family: "Futura PT Medium", "Futura PT Book", "Covered By Your Grace", "Covered By Your Grace Preload" !important;
          font-weight: 500 !important;
          color: #EB1C24 !important;
          font-size: 11px !important;
        }
        .custom-tip-input::placeholder {
          font-size: 10px !important;
        }
        .shipping-calculator-input,
        .shipping-calculator-select {
          font-family: "Futura PT Demi", "Futura PT Medium", "Futura PT Book", "Covered By Your Grace", "Covered By Your Grace Preload" !important;
          font-weight: 500 !important;
          color: #808080 !important;
        }
        .shipping-calculator-input::placeholder {
          font-family: "Futura PT Demi", "Futura PT Medium", "Futura PT Book", "Covered By Your Grace", "Covered By Your Grace Preload" !important;
          font-weight: 500 !important;
          color: #808080 !important;
        }
        .shipping-calculator-select {
          appearance: none !important;
          -webkit-appearance: none !important;
          -moz-appearance: none !important;
          background-image: url('/assets/dropdown.svg') !important;
          background-repeat: no-repeat !important;
          background-position: right 8px center !important;
          background-size: 7.2px !important;
          padding-right: 28px !important;
        }
        .shipping-calculator-select option {
          font-family: "Futura PT Demi", "Futura PT Medium", "Futura PT Book", "Covered By Your Grace", "Covered By Your Grace Preload" !important;
          font-weight: 500 !important;
          color: #808080 !important;
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
                    onClick={() => isSubscriptionUpgrade ? navigate('/account/rewards') : navigate('/bag')} 
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
                    onClick={() => isSubscriptionUpgrade ? navigate('/account/rewards') : navigate('/bag')}
                  >
                    {isSubscriptionUpgrade ? 'UPGRADE >' : 'BAG >'}
                  </span>{' '}
                  <span
                    style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}
                  >
                    {isSubscriptionUpgrade ? 'CHECKOUT' : 'CHECKOUT'}
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

          {/* MAIN CARD - only apply menu-toggle-card when menu is open so main card height is not forced when showing checkout form. Inset box-shadow used for even border on all sides (avoids subpixel unevenness with flex + % width). */}
          <div
            className={showMobileMenu ? 'menu-toggle-card flex flex-col pt-6 pb-4 px-5 mb-2 bg-white/60 backdrop-blur-sm transition-all duration-300 ease-out' : 'flex flex-col pt-6 pb-4 px-5 mb-2 bg-white/60 backdrop-blur-sm transition-all duration-300 ease-out'}
            style={{ 
              boxShadow: 'inset 0 0 0 1px #000000',
              minWidth: '100%', 
              maxWidth: 'none', 
              overflow: 'visible',
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              minHeight: showMobileMenu ? 'calc(100dvh - 80px)' : 'auto',
              height: showMobileMenu ? 'calc(100dvh - 80px)' : 'auto',
              boxSizing: 'border-box'
            }}
          >
            {showMobileMenu ? (
              /* MENU CONTENT */
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
                      [
                        { label: 'UNITS', hasArrow: true, isExpandable: true, subItems: ['STRAIGHT', 'WAVY', 'CURLY'] },
                        { label: 'BOOKING', hasArrow: true, isExpandable: true, subItems: ['APPOINTMENT', 'CONSULTATION'] },
                        { label: 'BUILD-A-WIG', hasArrow: false },
                        { label: 'ORDER AUTHORIZATION FORM', hasArrow: false }
                      ].map((item, index) => (
                        <div key={index}>
                          <div 
                            className="flex items-center justify-between"
                            style={{ alignItems: 'center', cursor: item.label === 'ORDER AUTHORIZATION FORM' ? 'pointer' : 'default' }}
                            onClick={() => {
                              if (!item.isExpandable && item.label === 'ORDER AUTHORIZATION FORM') {
                                navigate('/shop/order-form');
                              } else if (!item.isExpandable && item.label === 'BUILD-A-WIG') {
                                navigate('/build-a-wig');
                              }
                            }}
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
                                  if (item.label === 'UNITS' && mobileMenuExpandedItems.includes(item.label)) {
                                    navigate('/shop/units');
                                  } else {
                                    handleMobileMenuItemToggle(item.label);
                                  }
                                } else if (item.label === 'ORDER AUTHORIZATION FORM') {
                                  navigate('/shop/order-form');
                                } else if (item.label === 'BUILD-A-WIG') {
                                  navigate('/build-a-wig');
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
                <SocialMenuIcons />
              </div>
            ) : (
              /* CHECKOUT CONTENT */
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '24px', rowGap: '24px' }}>
                {/* ORDER SUMMARY HEADER */}
                <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '-1px', marginTop: '-12px' }}>
                  <button
                    className="text-red-500 font-bold text-lg tracking-wider truncate hover:text-red-600 transition-colors text-left uppercase"
                    style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '12px', fontWeight: '500' }}
                  >
                    ORDER SUMMARY
                  </button>
                  <span
                    className="text-black font-bold text-lg flex-shrink-0 ml-2 uppercase"
                    style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', fontSize: '15px' }}
                  >
                    {cartItems.length}
                  </span>
                </div>

                {/* SHOPPING BAG CARD */}
                {cartItems.length > 0 && (
                  <div
                    className="flex flex-col"
                    style={{ 
                      minWidth: '100%', 
                      maxWidth: 'none', 
                      marginTop: '-10px'
                    }}
                  >
                    {/* Body */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                      {/* Cart Items - horizontal scrollable */}
                      <div 
                        ref={scrollContainerRef}
                        className="relative overflow-hidden"
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
                            transform: cartItems.length === 1 ? 'none' : `translateX(${scrollPosition}px)`,
                            transition: 'none',
                            gap: '20px',
                            height: '100%',
                            alignItems: 'center',
                            justifyContent: cartItems.length === 1 ? 'center' : undefined,
                            willChange: 'transform',
                            paddingRight: cartItems.length === 1 ? 0 : '10px'
                          }}
                        >
                          {cartItems.map((item, index) => {
                          const itemId = item.id || `cart-item-${index}`;
                          const itemName = item.name || 'NOIR';
                          
                          // Get the correct thumbnail based on product name and hairline (same logic as account/orders page)
                          const getItemImage = () => {
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
                          const itemImage = getItemImage();
                          
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
                          
                          const itemLength = item.length || '24"';
                          const itemHairOrigin = getHairOrigin(item.name);
                          const itemPrice = item.price || 580;

                          return (
                            <div
                              key={itemId}
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
                                  fontSize: itemName === '6 MONTHS PREMIUM' ? '14.8px' : '16.8px',
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
                                  if (item.type === 'digital' || isSubscriptionUpgrade) {
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
                                    margin: (item.name === 'GIFT CARD' || item.type === 'gift-card' || item.type === 'digital' || isSubscriptionUpgrade) ? '4px 0 0 0' : '1px 0 0 0',
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
                    </div>

                    {/* Subtotal */}
                    <div className="overflow-hidden mt-auto pt-2">
                      {/* Loyalty Points Text */}
                      <div style={{ 
                        marginTop: '10px', 
                        marginBottom: '0',
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
                              {(() => {
                                const basePoints = (isSubscriptionUpgrade || isOnlyDigitalProducts ? 0 : Math.round(pointsEligibleAmount));
                                const multiplier = 1;
                                const multiplierText = '';
                                
                                const actualPoints = Math.round(basePoints * multiplier);
                                const pointsText = multiplier > 1 
                                  ? `${basePoints.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} × ${multiplier} = ${actualPoints.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                                  : actualPoints.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
                                
                                return <>YOU'RE EARNING <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' }}>{pointsText}</span> LOYALTY POINTS WITH THIS ORDER{multiplierText}!</>;
                              })()}
                            </>
                          ) : (
                            <>
                              <span 
                                onClick={() => navigate('/sign-in?returnTo=checkout')}
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
                    </div>
                  </div>
                )}

                {/* BLACK LINE SEPARATOR */}
                <div>
                      <div style={{ 
                    paddingTop: '0', 
                    paddingBottom: '1px',
                        borderTop: '1.3px solid #000',
                    marginTop: '-8px'
                  }}>
                  </div>
                </div>

                {/* DISCOUNT CODE SECTION */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0' }}>
                    <input
                      type="text"
                      className="discount-code-input"
                      placeholder="REFERRAL, DISCOUNT CODE OR GIFT CARD"
                      value={isDiscountCodeFocused ? discountCode : discountCodeDisplay || discountCode}
                      onChange={(e) => {
                        let rawValue = e.target.value;
                        
                        // Check if input is purely numeric (for gift card amounts)
                        const numericValue = rawValue.replace(/[$€£¥₹,.\s]/g, '');
                        const isNumeric = /^\d+$/.test(numericValue) && numericValue.length > 0;
                        
                        if (isNumeric) {
                          // Format as dollar amount
                          const currency = currencyRates[selectedCurrency as keyof typeof currencyRates] || currencyRates.USD;
                          const symbol = currency ? currency.symbol.replace('&#36;', '$').replace('&euro;', '€').replace('&pound;', '£').replace('&yen;', '¥').replace('&#8377;', '₹') : '$';
                          const formatted = symbol + numericValue + '.00';
                          setDiscountCodeDisplay(formatted);
                          setDiscountCode(numericValue);
                        } else {
                          // Text code - no formatting
                          setDiscountCode(rawValue);
                          setDiscountCodeDisplay(rawValue);
                        }
                        
                        setDiscountCodeError('');
                        setAppliedDiscount(0);
                        setAppliedReferralCode('');
                        setReferralDiscount(0);
                      }}
                      onFocus={() => {
                        setIsDiscountCodeFocused(true);
                        // Show raw value when focused for easier editing
                        if (discountCode && /^\d+$/.test(discountCode)) {
                          setDiscountCodeDisplay(discountCode);
                        }
                      }}
                      onBlur={() => {
                        setIsDiscountCodeFocused(false);
                        // Format numeric values on blur
                        if (discountCode && /^\d+$/.test(discountCode)) {
                          const currency = currencyRates[selectedCurrency as keyof typeof currencyRates] || currencyRates.USD;
                          const symbol = currency ? currency.symbol.replace('&#36;', '$').replace('&euro;', '€').replace('&pound;', '£').replace('&yen;', '¥').replace('&#8377;', '₹') : '$';
                          setDiscountCodeDisplay(symbol + discountCode + '.00');
                        } else {
                          setDiscountCodeDisplay(discountCode);
                        }
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleApplyDiscountCode();
                        }
                      }}
                          style={{
                        flex: 1,
                        height: '36px',
                        padding: '8px',
                        border: '1.3px solid #000000',
                        fontFamily: '"Futura PT Medium"',
                        fontSize: '10px',
                        color: '#EB1C24',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        boxSizing: 'border-box',
                        borderRadius: '0'
                      }}
                    />
                    <button
                      onClick={handleApplyDiscountCode}
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
                        style={{ width: '10.4px', height: '10.4px', position: 'absolute', objectFit: 'contain' }}
                      />
                    </button>
                      </div>
                  {discountCodeError && (
                        <p
                          style={{
                        fontFamily: '"Futura PT Medium"',
                        fontSize: '9px',
                        color: '#EB1C24',
                        margin: '4px 0 0 3px',
                        textTransform: 'uppercase'
                      }}
                    >
                      {discountCodeError}
                    </p>
                  )}
                    </div>

                {/* OTHER PAYMENT OPTIONS SECTION */}
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
                    EXPRESS PAYMENT OPTIONS:
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                    <button
                      onClick={() => handlePaymentClick('APPLE_PAY')}
                      disabled={processingPayment}
                      style={{
                        width: '100%',
                        height: '36px',
                        padding: '10px 20px',
                        border: '1.3px solid #000000',
                        backgroundColor: processingPayment ? '#f0f0f0' : '#FFFFFF',
                        fontFamily: '"Futura PT Book"',
                        fontSize: '11px',
                        cursor: processingPayment ? 'not-allowed' : 'pointer',
                        textTransform: 'uppercase',
                        boxSizing: 'border-box',
                        opacity: processingPayment ? 0.6 : 1
                      }}
                    >
                      {processingPayment ? 'PROCESSING...' : 'APPLE PAY'}
                    </button>
                    <button
                      onClick={() => handlePaymentClick('SHOP_PAY')}
                      disabled={processingPayment}
                      style={{
                        width: '100%',
                        height: '36px',
                        padding: '10px 20px',
                        border: '1.3px solid #000000',
                        backgroundColor: processingPayment ? '#f0f0f0' : '#FFFFFF',
                        fontFamily: '"Futura PT Book"',
                        fontSize: '11px',
                        cursor: processingPayment ? 'not-allowed' : 'pointer',
                        textTransform: 'uppercase',
                        boxSizing: 'border-box',
                        opacity: processingPayment ? 0.6 : 1
                      }}
                    >
                      {processingPayment ? 'PROCESSING...' : 'SHOP PAY'}
                    </button>
                    <button
                      onClick={() => handlePaymentClick('PAYPAL')}
                      disabled={processingPayment}
                      style={{
                        width: '100%',
                        height: '36px',
                        padding: '10px 20px',
                        border: '1.3px solid #000000',
                        backgroundColor: processingPayment ? '#f0f0f0' : '#FFFFFF',
                        fontFamily: '"Futura PT Book"',
                        fontSize: '11px',
                        cursor: processingPayment ? 'not-allowed' : 'pointer',
                        textTransform: 'uppercase',
                        boxSizing: 'border-box',
                        opacity: processingPayment ? 0.6 : 1
                      }}
                    >
                      {processingPayment ? 'PROCESSING...' : 'PAYPAL'}
                    </button>
                      </div>
                    </div>

                {/* PAYMENT PLANS SECTION */}
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
                    PAYMENT PLAN OPTIONS:
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                    <button
                      onClick={() => handlePaymentClick('AFFIRM')}
                      disabled={processingPayment}
                      style={{
                        width: '100%',
                        height: '36px',
                        padding: '10px 20px',
                        border: '1.3px solid #000000',
                        backgroundColor: processingPayment ? '#f0f0f0' : '#FFFFFF',
                        fontFamily: '"Futura PT Book"',
                        fontSize: '11px',
                        cursor: processingPayment ? 'not-allowed' : 'pointer',
                        textTransform: 'uppercase',
                        boxSizing: 'border-box',
                        opacity: processingPayment ? 0.6 : 1
                      }}
                    >
                      {processingPayment ? 'PROCESSING...' : 'AFFIRM'}
                    </button>
                    <button
                      onClick={() => handlePaymentClick('AFTERPAY')}
                      disabled={processingPayment}
                      style={{
                        width: '100%',
                        height: '36px',
                        padding: '10px 20px',
                        border: '1.3px solid #000000',
                        backgroundColor: processingPayment ? '#f0f0f0' : '#FFFFFF',
                        fontFamily: '"Futura PT Book"',
                        fontSize: '11px',
                        cursor: processingPayment ? 'not-allowed' : 'pointer',
                        textTransform: 'uppercase',
                        boxSizing: 'border-box',
                        opacity: processingPayment ? 0.6 : 1
                      }}
                    >
                      {processingPayment ? 'PROCESSING...' : 'AFTERPAY'}
                    </button>
                    <button
                      onClick={() => handlePaymentClick('KLARNA')}
                      disabled={processingPayment}
                      style={{
                        width: '100%',
                        height: '36px',
                        padding: '10px 20px',
                        border: '1.3px solid #000000',
                        backgroundColor: processingPayment ? '#f0f0f0' : '#FFFFFF',
                        fontFamily: '"Futura PT Book"',
                        fontSize: '11px',
                        cursor: processingPayment ? 'not-allowed' : 'pointer',
                        textTransform: 'uppercase',
                        boxSizing: 'border-box',
                        opacity: processingPayment ? 0.6 : 1
                      }}
                    >
                      {processingPayment ? 'PROCESSING...' : 'KLARNA'}
                    </button>
                  </div>
                    </div>

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
                        ref={firstNameRef}
                        type="text"
                          value={firstName}
                          onChange={(e) => {
                            setFirstName(e.target.value);
                            if (e.target.value.trim()) {
                              setInvalidFields(prev => {
                                const next = new Set(prev);
                                next.delete('firstName');
                                return next;
                              });
                            }
                          }}
                        style={{
                          width: '100%',
                            height: '36px',
                          padding: '8px',
                          border: `1.3px solid ${invalidFields.has('firstName') ? '#EB1C24' : '#000000'}`,
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                          backgroundColor: '#FFFFFF',
                          color: '#808080',
                            boxSizing: 'border-box',
                            borderRadius: '0',
                          outline: 'none'
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
                        ref={lastNameRef}
                        type="text"
                          value={lastName}
                          onChange={(e) => {
                            setLastName(e.target.value);
                            if (e.target.value.trim()) {
                              setInvalidFields(prev => {
                                const next = new Set(prev);
                                next.delete('lastName');
                                return next;
                              });
                            }
                          }}
                        style={{
                          width: '100%',
                            height: '36px',
                          padding: '8px',
                          border: `1.3px solid ${invalidFields.has('lastName') ? '#EB1C24' : '#000000'}`,
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                          backgroundColor: '#FFFFFF',
                          color: '#808080',
                            boxSizing: 'border-box',
                            borderRadius: '0',
                          outline: 'none'
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
                        ref={shippingAddressRef}
                        type="text"
                        value={shippingAddress}
                        onChange={(e) => {
                          setShippingAddress(e.target.value);
                          if (e.target.value.trim()) {
                            setInvalidFields(prev => {
                              const next = new Set(prev);
                              next.delete('shippingAddress');
                              return next;
                            });
                          }
                        }}
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '8px',
                          border: `1.3px solid ${invalidFields.has('shippingAddress') ? '#EB1C24' : '#000000'}`,
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                          backgroundColor: '#FFFFFF',
                          color: '#808080',
                          boxSizing: 'border-box',
                          borderRadius: '0',
                          outline: 'none'
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
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '8px',
                          border: '1.3px solid #000000',
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                          backgroundColor: '#FFFFFF',
                          color: '#808080',
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
                        ref={cityRef}
                        type="text"
                          value={city}
                          onChange={(e) => {
                            setCity(e.target.value);
                            if (e.target.value.trim()) {
                              setInvalidFields(prev => {
                                const next = new Set(prev);
                                next.delete('city');
                                return next;
                              });
                            }
                          }}
                        style={{
                          width: '100%',
                            height: '36px',
                          padding: '8px',
                          border: `1.3px solid ${invalidFields.has('city') ? '#EB1C24' : '#000000'}`,
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                          backgroundColor: '#FFFFFF',
                          color: '#808080',
                            boxSizing: 'border-box',
                            borderRadius: '0',
                          outline: 'none'
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
                          ref={stateRef}
                          type="text"
                          value={state}
                          onChange={(e) => {
                            setState(e.target.value);
                            if (e.target.value.trim()) {
                              setInvalidFields(prev => {
                                const next = new Set(prev);
                                next.delete('state');
                                return next;
                              });
                            }
                          }}
                          style={{
                            width: '100%',
                            height: '36px',
                            padding: '8px',
                            border: `1.3px solid ${invalidFields.has('state') ? '#EB1C24' : '#000000'}`,
                            fontFamily: '"Futura PT Book"',
                            fontSize: '11px',
                            backgroundColor: '#FFFFFF',
                            color: '#808080',
                            boxSizing: 'border-box',
                            borderRadius: '0',
                            outline: 'none'
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
                          ref={zipRef}
                          type="text"
                          value={zip}
                          onChange={(e) => {
                            setZip(e.target.value);
                            if (e.target.value.trim()) {
                              setInvalidFields(prev => {
                                const next = new Set(prev);
                                next.delete('zip');
                                return next;
                              });
                            }
                          }}
                          style={{
                            width: '100%',
                            height: '36px',
                            padding: '8px',
                            border: `1.3px solid ${invalidFields.has('zip') ? '#EB1C24' : '#000000'}`,
                            fontFamily: '"Futura PT Book"',
                            fontSize: '11px',
                            backgroundColor: '#FFFFFF',
                            color: '#808080',
                            boxSizing: 'border-box',
                            borderRadius: '0',
                            outline: 'none'
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
                        ref={phoneNumberRef}
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => {
                          setPhoneNumber(e.target.value);
                          if (e.target.value.trim()) {
                            setInvalidFields(prev => {
                              const next = new Set(prev);
                              next.delete('phoneNumber');
                              return next;
                            });
                          }
                        }}
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '8px',
                          border: `1.3px solid ${invalidFields.has('phoneNumber') ? '#EB1C24' : '#000000'}`,
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                          backgroundColor: '#FFFFFF',
                          color: '#808080',
                          boxSizing: 'border-box',
                          borderRadius: '0',
                          outline: 'none'
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
                        ref={emailRef}
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (e.target.value.trim()) {
                            setInvalidFields(prev => {
                              const next = new Set(prev);
                              next.delete('email');
                              return next;
                            });
                          }
                        }}
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '8px',
                          border: `1.3px solid ${invalidFields.has('email') ? '#EB1C24' : '#000000'}`,
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                          backgroundColor: '#FFFFFF',
                          color: '#808080',
                          boxSizing: 'border-box',
                          borderRadius: '0',
                          outline: 'none'
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '1px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          onClick={() => setUseDefaultMethod(!useDefaultMethod)}
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
                          {useDefaultMethod && (
                            <img 
                              src="/assets/checkbox.svg" 
                              alt="checked" 
                              style={{ width: '16px', height: '16px', position: 'absolute' }}
                            />
                          )}
                        </div>
                        <label 
                          onClick={() => setUseDefaultMethod(!useDefaultMethod)}
                          style={{ 
                            fontFamily: '"Futura PT Book"',
                            fontSize: '10px',
                            color: '#000000',
                            cursor: 'pointer',
                            textTransform: 'uppercase'
                          }}
                        >
                          USE DEFAULT ADDRESS
                        </label>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          onClick={() => setSavePaymentMethod(!savePaymentMethod)}
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
                          {savePaymentMethod && (
                            <img 
                              src="/assets/checkbox.svg" 
                              alt="checked" 
                              style={{ width: '16px', height: '16px', position: 'absolute' }}
                            />
                          )}
                        </div>
                        <label 
                          onClick={() => setSavePaymentMethod(!savePaymentMethod)}
                          style={{ 
                            fontFamily: '"Futura PT Book"',
                            fontSize: '10px',
                            color: '#000000',
                            cursor: 'pointer',
                            textTransform: 'uppercase'
                          }}
                        >
                          SAVE SHIPPING ADDRESS
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* BILLING ADDRESS SECTION */}
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
                    BILLING ADDRESS:
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
                          value={billingFirstName}
                          onChange={(e) => setBillingFirstName(e.target.value)}
                          disabled={sameAsBilling}
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '8px',
                          border: '1.3px solid #000000',
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                            backgroundColor: sameAsBilling ? 'rgba(240, 240, 240, 0.8)' : '#FFFFFF',
                            color: '#808080',
                          boxSizing: 'border-box',
                            borderRadius: '0',
                            cursor: sameAsBilling ? 'not-allowed' : 'text'
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
                          value={billingLastName}
                          onChange={(e) => setBillingLastName(e.target.value)}
                          disabled={sameAsBilling}
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '8px',
                          border: '1.3px solid #000000',
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                            backgroundColor: sameAsBilling ? 'rgba(240, 240, 240, 0.8)' : '#FFFFFF',
                            color: '#808080',
                          boxSizing: 'border-box',
                            borderRadius: '0',
                            cursor: sameAsBilling ? 'not-allowed' : 'text'
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
                        BILLING ADDRESS<span style={{ color: '#EB1C24' }}>*</span>
                        </label>
                        <input
                          ref={billingAddressRef}
                          type="text"
                        value={billingAddress}
                        onChange={(e) => {
                          setBillingAddress(e.target.value);
                          if (e.target.value.trim()) {
                            setInvalidFields(prev => {
                              const next = new Set(prev);
                              next.delete('billingAddress');
                              return next;
                            });
                          }
                        }}
                        disabled={sameAsBilling}
                          style={{
                            width: '100%',
                          height: '36px',
                            padding: '8px',
                            border: `1.3px solid ${invalidFields.has('billingAddress') ? '#EB1C24' : '#000000'}`,
                            fontFamily: '"Futura PT Book"',
                            fontSize: '11px',
                          backgroundColor: sameAsBilling ? 'rgba(240, 240, 240, 0.8)' : '#FFFFFF',
                          color: '#808080',
                          boxSizing: 'border-box',
                          borderRadius: '0',
                          cursor: sameAsBilling ? 'not-allowed' : 'text',
                          outline: 'none'
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
                        value={billingAptSuite}
                        onChange={(e) => setBillingAptSuite(e.target.value)}
                        disabled={sameAsBilling}
                          style={{
                            width: '100%',
                          height: '36px',
                            padding: '8px',
                            border: '1.3px solid #000000',
                            fontFamily: '"Futura PT Book"',
                            fontSize: '11px',
                          backgroundColor: sameAsBilling ? 'rgba(240, 240, 240, 0.8)' : '#FFFFFF',
                          color: '#808080',
                          boxSizing: 'border-box',
                          borderRadius: '0',
                          cursor: sameAsBilling ? 'not-allowed' : 'text'
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
                            ref={billingCityRef}
                            type="text"
                          value={billingCity}
                          onChange={(e) => {
                            setBillingCity(e.target.value);
                            if (e.target.value.trim()) {
                              setInvalidFields(prev => {
                                const next = new Set(prev);
                                next.delete('billingCity');
                                return next;
                              });
                            }
                          }}
                          disabled={sameAsBilling}
                            style={{
                              width: '100%',
                              height: '36px',
                              padding: '8px',
                              border: `1.3px solid ${invalidFields.has('billingCity') ? '#EB1C24' : '#000000'}`,
                              fontFamily: '"Futura PT Book"',
                              fontSize: '11px',
                            backgroundColor: sameAsBilling ? 'rgba(240, 240, 240, 0.8)' : '#FFFFFF',
                            color: '#808080',
                              boxSizing: 'border-box',
                            borderRadius: '0',
                            cursor: sameAsBilling ? 'not-allowed' : 'text',
                            outline: 'none'
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
                            ref={billingStateRef}
                            type="text"
                              value={billingState}
                              onChange={(e) => {
                                setBillingState(e.target.value);
                                if (e.target.value.trim()) {
                                  setInvalidFields(prev => {
                                    const next = new Set(prev);
                                    next.delete('billingState');
                                    return next;
                                  });
                                }
                              }}
                              disabled={sameAsBilling}
                            style={{
                              width: '100%',
                              height: '36px',
                              padding: '8px',
                              border: `1.3px solid ${invalidFields.has('billingState') ? '#EB1C24' : '#000000'}`,
                              fontFamily: '"Futura PT Book"',
                              fontSize: '11px',
                                backgroundColor: sameAsBilling ? 'rgba(240, 240, 240, 0.8)' : '#FFFFFF',
                                color: '#808080',
                              boxSizing: 'border-box',
                                borderRadius: '0',
                                cursor: sameAsBilling ? 'not-allowed' : 'text',
                                outline: 'none'
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
                            ref={billingZipRef}
                            type="text"
                            value={billingZip}
                            onChange={(e) => {
                              setBillingZip(e.target.value);
                              if (e.target.value.trim()) {
                                setInvalidFields(prev => {
                                  const next = new Set(prev);
                                  next.delete('billingZip');
                                  return next;
                                });
                              }
                            }}
                            disabled={sameAsBilling}
                            style={{
                              width: '100%',
                                height: '36px',
                              padding: '8px',
                              border: `1.3px solid ${invalidFields.has('billingZip') ? '#EB1C24' : '#000000'}`,
                              fontFamily: '"Futura PT Book"',
                              fontSize: '11px',
                              backgroundColor: sameAsBilling ? 'rgba(240, 240, 240, 0.8)' : '#FFFFFF',
                              color: '#808080',
                                boxSizing: 'border-box',
                              borderRadius: '0',
                              cursor: sameAsBilling ? 'not-allowed' : 'text',
                              outline: 'none'
                          }}
                        />
                    </div>
                  </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
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
                      onClick={() => setSameAsBilling(!sameAsBilling)}
                      style={{ 
                        fontFamily: '"Futura PT Book"',
                        fontSize: '10px',
                        color: '#000000',
                        cursor: 'pointer',
                        textTransform: 'uppercase'
                      }}
                    >
                      SAME AS SHIPPING ADDRESS
                    </label>
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
                              ref={cardholderRef}
                              type="text"
                        value={cardholder}
                        onChange={(e) => {
                          setCardholder(e.target.value);
                          if (e.target.value.trim()) {
                            setInvalidFields(prev => {
                              const next = new Set(prev);
                              next.delete('cardholder');
                              return next;
                            });
                          }
                        }}
                              style={{
                                width: '100%',
                                height: '36px',
                                padding: '8px',
                                border: `1.3px solid ${invalidFields.has('cardholder') ? '#EB1C24' : '#000000'}`,
                                fontFamily: '"Futura PT Book"',
                                fontSize: '11px',
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                boxSizing: 'border-box',
                                borderRadius: '0',
                                outline: 'none'
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
                              ref={cardNumberRef}
                              type="text"
                        value={cardNumber}
                        onChange={(e) => {
                          setCardNumber(e.target.value);
                          if (e.target.value.trim()) {
                            setInvalidFields(prev => {
                              const next = new Set(prev);
                              next.delete('cardNumber');
                              return next;
                            });
                          }
                        }}
                              style={{
                                width: '100%',
                                height: '36px',
                                padding: '8px',
                                border: `1.3px solid ${invalidFields.has('cardNumber') ? '#EB1C24' : '#000000'}`,
                                fontFamily: '"Futura PT Book"',
                                fontSize: '11px',
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                boxSizing: 'border-box',
                                borderRadius: '0',
                                outline: 'none'
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
                          EXPIRATION DATE<span style={{ color: '#EB1C24' }}>*</span>
                      </label>
                      <input
                          ref={expirationDateRef}
                          type="tel"
                          value={expirationDate}
                          onChange={(e) => {
                            setExpirationDate(formatExpirationDate(e.target.value));
                            if (formatExpirationDate(e.target.value).trim()) {
                              setInvalidFields(prev => {
                                const next = new Set(prev);
                                next.delete('expirationDate');
                                return next;
                              });
                            }
                          }}
                          style={{
                            width: '100%',
                          height: '36px',
                          padding: '8px',
                            border: `1.3px solid ${invalidFields.has('expirationDate') ? '#EB1C24' : '#000000'}`,
                            fontFamily: '"Futura PT Book"',
                            fontSize: '11px',
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          boxSizing: 'border-box',
                          borderRadius: '0',
                          outline: 'none'
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
                          ref={cvvRef}
                          type="tel"
                          value={cvv}
                          onChange={(e) => {
                            setCvv(formatCVV(e.target.value));
                            if (formatCVV(e.target.value).trim()) {
                              setInvalidFields(prev => {
                                const next = new Set(prev);
                                next.delete('cvv');
                                return next;
                              });
                            }
                          }}
                          style={{
                            width: '100%',
                            height: '36px',
                            padding: '8px',
                            border: `1.3px solid ${invalidFields.has('cvv') ? '#EB1C24' : '#000000'}`,
                            fontFamily: '"Futura PT Book"',
                            fontSize: '11px',
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            boxSizing: 'border-box',
                            borderRadius: '0',
                            outline: 'none'
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
                          BILLING ZIP<span style={{ color: '#EB1C24' }}>*</span>
                      </label>
                      <input
                        ref={billingZipRef}
                        type="text"
                          value={billingZip}
                          onChange={(e) => setBillingZip(e.target.value)}
                          disabled={sameAsBilling}
                        style={{
                            width: '100%',
                          height: '36px',
                          padding: '8px',
                          border: '1.3px solid #000000',
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                            backgroundColor: sameAsBilling ? 'rgba(240, 240, 240, 0.8)' : '#FFFFFF',
                            color: '#808080',
                            boxSizing: 'border-box',
                            borderRadius: '0',
                            cursor: sameAsBilling ? 'not-allowed' : 'text'
                          }}
                        />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        onClick={() => setUseDefaultPaymentMethod(!useDefaultPaymentMethod)}
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
                        {useDefaultPaymentMethod && (
                          <img 
                            src="/assets/checkbox.svg" 
                            alt="checked" 
                            style={{ width: '16px', height: '16px', position: 'absolute' }}
                          />
                        )}
                      </div>
                      <label 
                        onClick={() => setUseDefaultPaymentMethod(!useDefaultPaymentMethod)}
                        style={{ 
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000000',
                          cursor: 'pointer',
                          textTransform: 'uppercase'
                        }}
                      >
                        USE DEFAULT PAYMENT
                      </label>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        onClick={() => setSavePaymentMethodCard(!savePaymentMethodCard)}
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
                        {savePaymentMethodCard && (
                          <img 
                            src="/assets/checkbox.svg" 
                            alt="checked" 
                            style={{ width: '16px', height: '16px', position: 'absolute' }}
                          />
                        )}
                      </div>
                      <label 
                        onClick={() => setSavePaymentMethodCard(!savePaymentMethodCard)}
                        style={{ 
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000000',
                          cursor: 'pointer',
                          textTransform: 'uppercase'
                        }}
                      >
                        SAVE PAYMENT METHOD
                      </label>
                    </div>
                  </div>
                </div>

                {/* SHIPPING CALCULATOR SECTION - Hidden for subscription upgrades and digital-only carts */}
                {!isSubscriptionUpgrade && !isOnlyDigitalProducts && (
                  <div style={{ marginTop: '24px', marginBottom: '24px' }}>
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
                    SHIPPING CALCULATOR:
                  </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {/* First line: Country, State, Zip */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: selectedCountry === 'US' ? '1.5' : '1.8', minWidth: 0 }}>
                      <select
                        className="shipping-calculator-select"
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
                          fontFamily: '"Futura PT Demi"',
                          fontSize: '11px',
                          color: '#808080',
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
                      </div>
                      {selectedCountry === 'US' && (
                        <div style={{ flex: '0.8', minWidth: 0 }}>
                      <select
                        className="shipping-calculator-select"
                          value={selectedState}
                          onChange={(e) => {
                            setSelectedState(e.target.value);
                            setShippingCalculated(false);
                            setSelectedShippingMethod(null);
                            setZipCodeError(''); // Clear error when state changes (validation happens on submit)
                          }}
                        style={{
                          width: '100%',
                            height: '36px',
                          padding: '8px',
                          border: '1.3px solid #000000',
                          fontFamily: '"Futura PT Demi"',
                          fontSize: '11px',
                          color: '#808080',
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            boxSizing: 'border-box',
                            borderRadius: '0'
                          }}
                        >
                          <option value="">STATE</option>
                          <option value="AL">AL</option>
                          <option value="AK">AK</option>
                          <option value="AZ">AZ</option>
                          <option value="AR">AR</option>
                          <option value="CA">CA</option>
                          <option value="CO">CO</option>
                          <option value="CT">CT</option>
                          <option value="DE">DE</option>
                          <option value="FL">FL</option>
                          <option value="GA">GA</option>
                          <option value="HI">HI</option>
                          <option value="ID">ID</option>
                          <option value="IL">IL</option>
                          <option value="IN">IN</option>
                          <option value="IA">IA</option>
                          <option value="KS">KS</option>
                          <option value="KY">KY</option>
                          <option value="LA">LA</option>
                          <option value="ME">ME</option>
                          <option value="MD">MD</option>
                          <option value="MA">MA</option>
                          <option value="MI">MI</option>
                          <option value="MN">MN</option>
                          <option value="MS">MS</option>
                          <option value="MO">MO</option>
                          <option value="MT">MT</option>
                          <option value="NE">NE</option>
                          <option value="NV">NV</option>
                          <option value="NH">NH</option>
                          <option value="NJ">NJ</option>
                          <option value="NM">NM</option>
                          <option value="NY">NY</option>
                          <option value="NC">NC</option>
                          <option value="ND">ND</option>
                          <option value="OH">OH</option>
                          <option value="OK">OK</option>
                          <option value="OR">OR</option>
                          <option value="PA">PA</option>
                          <option value="RI">RI</option>
                          <option value="SC">SC</option>
                          <option value="SD">SD</option>
                          <option value="TN">TN</option>
                          <option value="TX">TX</option>
                          <option value="UT">UT</option>
                          <option value="VT">VT</option>
                          <option value="VA">VA</option>
                          <option value="WA">WA</option>
                          <option value="WV">WV</option>
                          <option value="WI">WI</option>
                          <option value="WY">WY</option>
                      </select>
                        </div>
                      )}
                      <div style={{ flex: '0.8', minWidth: 0 }}>
                        <input
                          type={usesAlphanumericPostalCode(selectedCountry) ? "text" : "tel"}
                          className="shipping-calculator-input"
                          placeholder="ZIP"
                          value={zipCode}
                          onChange={(e) => {
                            const formatted = formatZipCode(e.target.value, selectedCountry);
                            setZipCode(formatted);
                            setShippingCalculated(false);
                            setSelectedShippingMethod(null);
                            setZipCodeError(''); // Clear error while typing
                          }}
                          style={{
                            width: '100%',
                            height: '36px',
                            padding: '8px',
                            border: '1.3px solid #000000',
                            fontFamily: '"Futura PT Demi"',
                            fontSize: '11px',
                            color: '#808080',
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          boxSizing: 'border-box',
                          borderRadius: '0'
                        }}
                      />
                      </div>
                      <button
                        onClick={() => {
                          if (selectedCountry && zipCode) {
                            // Validate zip code when checkmark is clicked
                            if (selectedCountry === 'US' && selectedState) {
                              if (!validateZipCodeForState(zipCode, selectedState, selectedCountry)) {
                                setZipCodeError('SORRY, THIS ZIP CODE DOES NOT MATCH.');
                                setShippingCalculated(false);
                                setSelectedShippingMethod(null);
                                return;
                              } else {
                                setZipCodeError('');
                              }
                            }
                            
                            // Only toggle if no error
                            if (!zipCodeError) {
                              setShippingCalculated(!shippingCalculated);
                            }
                          }
                        }}
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
                            alt="calculate shipping" 
                            style={{ 
                              width: '10.4px', 
                              height: '10.4px', 
                              position: 'absolute', 
                              objectFit: 'contain',
                              filter: 'brightness(0) saturate(100%) invert(15%) sepia(95%) saturate(7404%) hue-rotate(353deg) brightness(92%) contrast(92%)'
                            }}
                        />
                      </button>
                    </div>
                    {zipCodeError && (
                      <p
                        style={{
                          fontFamily: '"Futura PT Medium"',
                          fontSize: '9px',
                          color: '#EB1C24',
                          margin: '-3px 0 0 3px',
                          textTransform: 'uppercase'
                        }}
                      >
                        {zipCodeError}
                      </p>
                    )}
                  </div>
                  
                  {/* SHIPPING METHOD SELECTION - Hidden for subscription upgrades and digital-only carts */}
                  {!isSubscriptionUpgrade && !isOnlyDigitalProducts && shippingCalculated && availableShippingOptions.length > 0 && !zipCodeError && (
                    <div style={{ marginTop: '26px', marginBottom: '5px' }}>
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
                        CHOOSE SHIPPING METHOD:
                      </h2>
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
                                  cost: option.cost,
                                  originalCost: option.originalCost || option.cost
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
                )}

                {/* DELIVERY METHOD SECTION */}
                {!isSubscriptionUpgrade && !isOnlyDigitalProducts && (
                <div style={{ marginBottom: '24px' }}>
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
                          4-6 WEEKS RUSH PROCESSING <span className="delivery-price" dangerouslySetInnerHTML={formatPrice(120)}></span>
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
                        PACKAGE PROTECTION +<span className="delivery-price" dangerouslySetInnerHTML={formatPrice(protectionFeeAmount)}></span>
                      </label>
                    </div>
                  </div>
                </div>
                )}

                {/* TIPPING SECTION */}
                <div style={{ marginTop: isSubscriptionUpgrade ? '24px' : '4px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'nowrap', width: '100%' }}>
                      {[10, 15, 20, 25, 30].map((percentage) => (
                        <button
                          key={percentage}
                          onClick={() => {
                            if (tipPercentage === percentage) {
                              setTipPercentage(null);
                            } else {
                              setTipPercentage(percentage);
                              setCustomTipAmount(0);
                            }
                        }}
                        style={{
                            flex: '1 1 0',
                            minWidth: 0,
                            padding: '8px 0',
                          border: '1.3px solid #000000',
                            backgroundColor: '#FFFFFF',
                            color: tipPercentage === percentage ? '#EB1C24' : '#000000',
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                            fontWeight: tipPercentage === percentage ? '600' : '400',
                            textAlign: 'center'
                          }}
                        >
                          {percentage}%
                        </button>
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative', marginTop: '3px' }}>
                      <input
                        type="tel"
                        className="custom-tip-input"
                        placeholder="CUSTOM TIP AMOUNT (OPTIONAL)"
                        value={customTipDisplay}
                          onChange={(e) => {
                          let rawValue = e.target.value;
                          
                          // Remove currency symbol (handle all possible symbols)
                          rawValue = rawValue.replace(/[$€£¥₹]/g, '');
                          
                          // Remove commas for processing
                          rawValue = rawValue.replace(/,/g, '');
                          
                          // Remove any decimal point and everything after it
                          if (rawValue.includes('.')) {
                            rawValue = rawValue.split('.')[0];
                          }
                          
                          // Extract only digits
                          const numericValue = rawValue.replace(/[^0-9]/g, '');
                          
                          // Set the numeric value (without commas for calculations)
                          const newAmount = numericValue === '' ? 0 : parseInt(numericValue, 10);
                          setCustomTipAmount(newAmount);
                          
                          // Format display value with commas
                          if (numericValue === '') {
                            setCustomTipDisplay('');
                          } else {
                            const formattedValue = parseInt(numericValue, 10).toLocaleString('en-US');
                            setCustomTipDisplay(formattedValue);
                          }
                          
                          if (numericValue) {
                            setTipPercentage(null);
                            setCustomTipApplied(false);
                          } else {
                            setCustomTipApplied(false);
                          }
                        }}
                        onBlur={() => {
                          // Format the display value when user leaves the field (keep commas)
                          if (customTipAmount > 0) {
                            const formattedAmount = customTipAmount.toLocaleString('en-US');
                            const currency = currencyRates[selectedCurrency as keyof typeof currencyRates] || currencyRates.USD;
                            if (!currency) {
                              setCustomTipDisplay('$' + formattedAmount + '.00');
                            } else {
                              const symbol = currency.symbol.replace('&#36;', '$').replace('&euro;', '€').replace('&pound;', '£').replace('&yen;', '¥').replace('&#8377;', '₹');
                              setCustomTipDisplay(symbol + formattedAmount + '.00');
                            }
                          } else {
                            setCustomTipDisplay('');
                          }
                        }}
                        onFocus={() => {
                          // Show formatted numeric value with commas when focused
                          if (customTipAmount > 0) {
                            setCustomTipDisplay(customTipAmount.toLocaleString('en-US'));
                          }
                          }}
                          style={{
                            flex: 1,
                          height: '36px',
                            padding: '8px',
                            border: '1.3px solid #000000',
                          fontFamily: '"Futura PT Medium"',
                            fontSize: '11px',
                          color: '#EB1C24',
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          boxSizing: 'border-box',
                            borderRadius: '0'
                          }}
                        />
                      {customTipAmount > 0 && (
                        <button
                          onClick={() => {
                            if (customTipApplied) {
                              // Remove tip: clear amount and reset applied state
                              setCustomTipAmount(0);
                              setCustomTipDisplay('');
                              setCustomTipApplied(false);
                            } else {
                              // Apply tip: set applied state to true and format display
                              setCustomTipApplied(true);
                              setTipPercentage(null);
                              // Format the display value with currency symbol, commas, and .00
                              const formattedAmount = customTipAmount.toLocaleString('en-US');
                              const currency = currencyRates[selectedCurrency as keyof typeof currencyRates] || currencyRates.USD;
                              if (!currency) {
                                setCustomTipDisplay('$' + formattedAmount + '.00');
                              } else {
                                const symbol = currency.symbol.replace('&#36;', '$').replace('&euro;', '€').replace('&pound;', '£').replace('&yen;', '¥').replace('&#8377;', '₹');
                                setCustomTipDisplay(symbol + formattedAmount + '.00');
                              }
                            }
                          }}
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
                          {customTipApplied ? (
                            <img 
                              src="/assets/close-icon.svg" 
                              alt="remove tip" 
                              style={{ width: '16px', height: '16px', position: 'absolute', objectFit: 'contain', filter: 'brightness(0) saturate(100%) invert(15%) sepia(95%) saturate(7404%) hue-rotate(353deg) brightness(92%) contrast(92%)' }}
                            />
                          ) : (
                            <img 
                              src="/assets/discount-check.svg" 
                              alt="apply tip" 
                              style={{ width: '10.4px', height: '10.4px', position: 'absolute', objectFit: 'contain', filter: 'brightness(0) saturate(100%) invert(15%) sepia(95%) saturate(7404%) hue-rotate(353deg) brightness(92%) contrast(92%)' }}
                            />
                          )}
                        </button>
                                )}
                              </div>
                            </div>
                </div>

                {/* ORDER SUMMARY (COST BREAKDOWN) */}
                <div style={{ marginBottom: '24px' }}>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000000' }}>
                        SHIPPING + HANDLING:{premiumShippingDiscount.discount > 0 && <span style={{ fontFamily: '"Futura PT Demi"', color: '#808080' }}> PREMIUM</span>}
                      </span>
                      <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000000', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {premiumShippingDiscount.discount > 0 ? (
                          <>
                            {premiumShippingDiscount.finalCost === 0 ? (
                              <>
                                <span style={{ color: '#EB1C24' }}>FREE</span>
                                <span style={{ textDecoration: 'line-through' }} dangerouslySetInnerHTML={formatPrice(premiumShippingDiscount.originalCost)}></span>
                              </>
                            ) : (
                              <>
                                <span style={{ color: '#EB1C24' }}>(-${premiumShippingDiscount.discount})</span>
                                <span dangerouslySetInnerHTML={formatPrice(premiumShippingDiscount.finalCost)}></span>
                              </>
                            )}
                          </>
                        ) : (
                          <span dangerouslySetInnerHTML={formatPrice(shippingHandling)}></span>
                        )}
                      </span>
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
                    {tipAmount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000000' }}>
                          {tipPercentage !== null ? `${tipPercentage}% TIP:` : customTipApplied ? 'CUSTOM TIP:' : 'TIP AMOUNT:'}
                        </span>
                        <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000000' }} dangerouslySetInnerHTML={formatPrice(tipAmount)}></span>
                      </div>
                    )}
                    {/* Digital cash (account balance; includes tier welcome discount). Or gift card code—only one can apply; adding a gift card replaces this line. Edit opens modal to choose amount (0 = line still shows with ($0)). */}
                    {giftCardBalance > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000000', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        DISCOUNT: <span
                          role="button"
                          tabIndex={0}
                          onClick={() => {
                            const protectionFeeForOpen = packageProtection ? calculateProtectionFee(orderAmount) : 0;
                            const maxDisc = orderAmount + taxesProcessing + shippingHandling + (selectedProcessing === 'rush' ? 100 : 0) + protectionFeeForOpen;
                            const maxA = Math.min(giftCardBalance, Math.round(maxDisc));
                            setDigitalCashModalAmount(Math.min(appliedGiftCardBalance, maxA));
                            setShowDigitalCashModal(true);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              const protectionFeeForOpen = packageProtection ? calculateProtectionFee(orderAmount) : 0;
                              const maxDisc = orderAmount + taxesProcessing + shippingHandling + (selectedProcessing === 'rush' ? 100 : 0) + protectionFeeForOpen;
                              const maxA = Math.min(giftCardBalance, Math.round(maxDisc));
                              setDigitalCashModalAmount(Math.min(appliedGiftCardBalance, maxA));
                              setShowDigitalCashModal(true);
                            }
                          }}
                          style={{ fontFamily: '"Futura PT Demi"', color: '#808080', cursor: 'pointer' }}
                        >DIGITAL CASH</span>
                        <button
                          type="button"
                          onClick={() => {
                          const protectionFeeForOpen = packageProtection ? calculateProtectionFee(orderAmount) : 0;
                          const maxDisc = orderAmount + taxesProcessing + shippingHandling + (selectedProcessing === 'rush' ? 100 : 0) + protectionFeeForOpen;
                          const maxA = Math.min(giftCardBalance, Math.round(maxDisc));
                          setDigitalCashModalAmount(Math.min(appliedGiftCardBalance, maxA));
                          setShowDigitalCashModal(true);
                        }}
                          style={{ padding: 0, border: 'none', background: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                          aria-label="Edit digital cash amount"
                        >
                          <img src="/assets/edit-icon.svg" alt="" width={9} height={9} style={{ display: 'block', filter: 'brightness(0) saturate(0%)', opacity: 0.6, transform: 'translateY(-1px)' }} />
                        </button>
                      </span>
                      <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>
                        {(() => {
                          const currency = currencyRates[selectedCurrency as keyof typeof currencyRates] || currencyRates.USD;
                          const symbol = currency.symbol.replace(/&#36;/g, '$').replace(/&euro;/g, '€').replace(/&pound;/g, '£').replace(/&yen;/g, '¥').replace(/&#8377;/g, '₹');
                          if (appliedGiftCardBalance <= 0) {
                            return `(${symbol}0)`;
                          }
                          const convertedAmount = appliedGiftCardBalance * currency.rate;
                          const wholeAmount = Math.round(convertedAmount);
                          return `(-${symbol}${wholeAmount.toLocaleString('en-US')})`;
                        })()}
                      </span>
                    </div>
                    )}
                    {referralDiscount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '11px', color: '#808080' }}>
                        DISCOUNT: REFERRAL CODE {appliedReferralCode}
                      </span>
                      <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000000' }} dangerouslySetInnerHTML={formatPrice(referralDiscount)}></span>
                    </div>
                    )}
                    {discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000000' }}>
                        DISCOUNT: <span style={{ fontFamily: '"Futura PT Demi"', color: '#808080' }}>{discountCode.toUpperCase()}</span>
                      </span>
                      <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000000' }} dangerouslySetInnerHTML={formatPrice(discount)}></span>
                    </div>
                    )}
                    <div style={{ borderTop: '1.3px solid #000000', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#000000', fontWeight: '500' }}>
                        SUBTOTAL
                      </span>
                      <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#000000', fontWeight: '500' }} dangerouslySetInnerHTML={formatPrice(subtotal)}></span>
                    </div>
                  </div>
                </div>

                {/* ORDER NOTES */}
                <div style={{ marginBottom: '24px' }}>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '-4px' }}>
                  {/* AUTO RENEW MEMBERSHIP - Only for subscription upgrades */}
                  {isSubscriptionUpgrade && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        onClick={() => setAutoRenewMembership(!autoRenewMembership)}
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
                        {autoRenewMembership && (
                          <img 
                            src="/assets/checkbox.svg" 
                            alt="checked" 
                            style={{ width: '16px', height: '16px', position: 'absolute' }}
                          />
                        )}
                      </div>
                      <label 
                        onClick={() => setAutoRenewMembership(!autoRenewMembership)}
                        style={{ 
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000000',
                          cursor: 'pointer',
                          textTransform: 'uppercase'
                        }}
                      >
                        AUTO RENEW MEMBERSHIP
                      </label>
                    </div>
                  )}
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
                      onClick={() => setAddressConfirmed(!addressConfirmed)}
                      style={{
                        width: '16px',
                        height: '16px',
                        minWidth: '16px',
                        minHeight: '16px',
                        flexShrink: 0,
                        boxSizing: 'border-box',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1.3px solid #000000',
                        backgroundColor: 'transparent',
                        position: 'relative'
                      }}
                    >
                      {addressConfirmed && (
                        <img 
                          src="/assets/checkbox.svg" 
                          alt="checked" 
                          style={{ width: '16px', height: '16px', position: 'absolute' }}
                        />
                      )}
                    </div>
                    <label 
                      onClick={() => setAddressConfirmed(!addressConfirmed)}
                      style={{ 
                        fontFamily: '"Futura PT Book"',
                        fontSize: '10px',
                        color: '#000000',
                        cursor: 'pointer',
                        textTransform: 'uppercase'
                      }}
                    >
                      I ACKNOWLEDGE MY <span style={{ color: '#EB1C24' }}>SHIPPING ADDRESS</span> IS CORRECT & CAN NOT BE CHANGED BEYOND THIS POINT.<span style={{ color: '#EB1C24' }}>*</span>
                    </label>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
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
              </div>
            )}
          </div>
          
          {/* CONFIRM ORDER BUTTON - Outside main card */}
          {!showMobileMenu && (
            <div className="px-0 md:px-0" style={{ marginTop: '2px', marginBottom: '20px' }}>
                  <button
                    onClick={() => {
                  // Validate required fields
                  if (!firstName.trim()) {
                    setValidationMessage('FIRST NAME IS REQUIRED.');
                    setFieldToFocus('firstName');
                    setInvalidFields(prev => new Set(prev).add('firstName'));
                    setShowValidationModal(true);
                    return;
                  }
                  if (!lastName.trim()) {
                    setValidationMessage('LAST NAME IS REQUIRED.');
                    setFieldToFocus('lastName');
                    setInvalidFields(prev => new Set(prev).add('lastName'));
                    setShowValidationModal(true);
                    return;
                  }
                  if (!shippingAddress.trim()) {
                    setValidationMessage('SHIPPING ADDRESS IS REQUIRED.');
                    setFieldToFocus('shippingAddress');
                    setInvalidFields(prev => new Set(prev).add('shippingAddress'));
                    setShowValidationModal(true);
                    return;
                  }
                  if (!city.trim()) {
                    setValidationMessage('CITY IS REQUIRED.');
                    setFieldToFocus('city');
                    setInvalidFields(prev => new Set(prev).add('city'));
                    setShowValidationModal(true);
                    return;
                  }
                  if (!state.trim()) {
                    setValidationMessage('STATE IS REQUIRED.');
                    setFieldToFocus('state');
                    setInvalidFields(prev => new Set(prev).add('state'));
                    setShowValidationModal(true);
                    return;
                  }
                  if (!zip.trim()) {
                    setValidationMessage('ZIP CODE IS REQUIRED.');
                    setFieldToFocus('zip');
                    setInvalidFields(prev => new Set(prev).add('zip'));
                    setShowValidationModal(true);
                    return;
                  }
                  if (!phoneNumber.trim()) {
                    setValidationMessage('PHONE NUMBER IS REQUIRED.');
                    setFieldToFocus('phoneNumber');
                    setInvalidFields(prev => new Set(prev).add('phoneNumber'));
                    setShowValidationModal(true);
                    return;
                  }
                  if (!email.trim()) {
                    setValidationMessage('EMAIL IS REQUIRED.');
                    setFieldToFocus('email');
                    setInvalidFields(prev => new Set(prev).add('email'));
                    setShowValidationModal(true);
                    return;
                  }
                  if (!cardholder.trim()) {
                    setValidationMessage('CARDHOLDER NAME IS REQUIRED.');
                    setFieldToFocus('cardholder');
                    setInvalidFields(prev => new Set(prev).add('cardholder'));
                    setShowValidationModal(true);
                    return;
                  }
                  if (!cardNumber.trim()) {
                    setValidationMessage('CARD NUMBER IS REQUIRED.');
                    setFieldToFocus('cardNumber');
                    setInvalidFields(prev => new Set(prev).add('cardNumber'));
                    setShowValidationModal(true);
                    return;
                  }
                  if (!expirationDate.trim()) {
                    setValidationMessage('EXPIRATION DATE IS REQUIRED.');
                    setFieldToFocus('expirationDate');
                    setInvalidFields(prev => new Set(prev).add('expirationDate'));
                    setShowValidationModal(true);
                    return;
                  }
                  if (!cvv.trim()) {
                    setValidationMessage('CVV IS REQUIRED.');
                    setFieldToFocus('cvv');
                    setInvalidFields(prev => new Set(prev).add('cvv'));
                    setShowValidationModal(true);
                    return;
                  }
                  if (!sameAsBilling) {
                    if (!billingAddress.trim()) {
                      setValidationMessage('BILLING ADDRESS IS REQUIRED.');
                      setFieldToFocus('billingAddress');
                      setInvalidFields(prev => new Set(prev).add('billingAddress'));
                      setShowValidationModal(true);
                      return;
                    }
                    if (!billingCity.trim()) {
                      setValidationMessage('BILLING CITY IS REQUIRED.');
                      setFieldToFocus('billingCity');
                      setInvalidFields(prev => new Set(prev).add('billingCity'));
                      setShowValidationModal(true);
                      return;
                    }
                    if (!billingState.trim()) {
                      setValidationMessage('BILLING STATE IS REQUIRED.');
                      setFieldToFocus('billingState');
                      setInvalidFields(prev => new Set(prev).add('billingState'));
                      setShowValidationModal(true);
                      return;
                    }
                    if (!billingZip.trim()) {
                      setValidationMessage('BILLING ZIP CODE IS REQUIRED.');
                      setFieldToFocus('billingZip');
                      setInvalidFields(prev => new Set(prev).add('billingZip'));
                      setShowValidationModal(true);
                      return;
                    }
                  }
                  
                  // Check if shipping method is selected (skip for subscription upgrades and digital-only carts)
                  if (!isSubscriptionUpgrade && !isOnlyDigitalProducts && !selectedShippingMethod) {
                    setValidationMessage('SHIPPING METHOD IS REQUIRED.');
                    setShowValidationModal(true);
                    return;
                  }
                  
                  // Check if address is confirmed (required before checkout)
                  if (!addressConfirmed) {
                    setValidationMessage('PLEASE CONFIRM THAT YOUR ADDRESS IS ACCURATE.');
                    setShowValidationModal(true);
                    return;
                  }
                  
                  // Check if terms are agreed to (check last, after all other validations)
                  if (!agreeToTerms) {
                    setShowTermsRequiredModal(true);
                    return;
                  }
                  
                  // Calculate points earned (if signed in) - exclude gift cards and digital items
                  const basePoints = isSignedIn ? Math.round(pointsEligibleAmount) : 0;
                  const multiplier = 1;
                  
                  const pointsEarned = Math.round(basePoints * multiplier);
                  
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
                  
                  // Format order date
                  const orderDate = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, '-');
                  
                  // Get payment method display
                  const paymentMethodDisplay = cardNumber.length >= 4 
                    ? `${cardNumber.slice(0, 4).replace(/\d/g, 'X')} ENDING IN ${cardNumber.slice(-4)}`
                    : 'CARD ENDING IN XXXX';
                  
                  // Get shipping method display
                  const shippingMethodDisplay = selectedShippingMethod 
                    ? (() => {
                        const options = calculateShippingOptions();
                        const option = options.find(opt => 
                          opt.carrier === selectedShippingMethod.carrier && 
                          opt.speed === selectedShippingMethod.speed &&
                          opt.cost === selectedShippingMethod.cost
                        );
                        return option?.label || `${selectedShippingMethod.carrier} ${selectedShippingMethod.speed.toUpperCase()}`;
                      })()
                    : 'STANDARD SHIPPING';
                  
                  // Calculate processing time based on selected processing and customizations
                  let processingTimeText = '';
                  if (selectedProcessing === 'rush') {
                    processingTimeText = '4 TO 6 WEEKS';
                  } else {
                    const hasCustomizations = hasColorStylingOrAddOns;
                    processingTimeText = hasCustomizations 
                      ? '6 TO 8 WEEKS (UP TO 10 WEEKS FOR CUSTOMIZED UNITS)'
                      : '6 TO 8 WEEKS';
                  }
                  
                  // Save payment method/address if checkbox is checked
                  if (savePaymentMethod && isSignedIn) {
                    try {
                      const currentUser = localStorage.getItem('currentUser');
                      if (currentUser) {
                        const user = JSON.parse(currentUser);
                        const addressToSave = {
                          firstName: firstName.trim(),
                          lastName: lastName.trim(),
                          address: shippingAddress.trim(),
                          city: city.trim(),
                          state: state.trim(),
                          zip: zip.trim(),
                          phoneNumber: phoneNumber.trim(),
                          email: email.trim(),
                          country: selectedCountry || 'US',
                          isDefault: !user.defaultAddress, // Set as default if no default exists
                          savedAt: new Date().toISOString()
                        };
                        
                        // Update user with saved address
                        const updatedUser = {
                          ...user,
                          defaultAddress: !user.defaultAddress ? addressToSave : user.defaultAddress,
                          savedAddresses: user.savedAddresses ? [...user.savedAddresses, addressToSave] : [addressToSave]
                        };
                        
                        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                        
                        // Also update in registered users list
                        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                        const userIndex = registeredUsers.findIndex((u: any) => u.email === user.email);
                        if (userIndex !== -1) {
                          registeredUsers[userIndex] = updatedUser;
                          localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
                        }
                      }
                    } catch (error) {
                      console.error('Error saving address:', error);
                    }
                  }
                  
                  // Save payment method if checkbox is checked
                  if (savePaymentMethodCard && isSignedIn) {
                    try {
                      const currentUser = localStorage.getItem('currentUser');
                      if (currentUser) {
                        const user = JSON.parse(currentUser);
                        const paymentMethodToSave = {
                          cardholder: cardholder.trim(),
                          cardNumber: cardNumber.slice(-4), // Only save last 4 digits for security
                          expirationDate: expirationDate.trim(),
                          billingZip: billingZip.trim(),
                          isDefault: !user.defaultPaymentMethod, // Set as default if no default exists
                          savedAt: new Date().toISOString()
                        };
                        
                        // Update user with saved payment method
                        const updatedUser = {
                          ...user,
                          defaultPaymentMethod: !user.defaultPaymentMethod ? paymentMethodToSave : user.defaultPaymentMethod,
                          savedPaymentMethods: user.savedPaymentMethods ? [...user.savedPaymentMethods, paymentMethodToSave] : [paymentMethodToSave]
                        };
                        
                        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                        
                        // Also update in registered users list
                        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                        const userIndex = registeredUsers.findIndex((u: any) => u.email === user.email);
                        if (userIndex !== -1) {
                          registeredUsers[userIndex] = updatedUser;
                          localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
                        }
                      }
                    } catch (error) {
                      console.error('Error saving payment method:', error);
                    }
                  }
                  
                  // Save subscription tier if this is a subscription upgrade
                  if (isSubscriptionUpgrade && isSignedIn) {
                    try {
                      const subscriptionItem = localStorage.getItem('subscriptionUpgrade');
                      if (subscriptionItem) {
                        const item = JSON.parse(subscriptionItem);
                        const subscriptionTier = item.subscriptionTier; // '3months', '6months', or '12months'
                        
                        if (subscriptionTier) {
                          const currentUser = localStorage.getItem('currentUser');
                          if (currentUser) {
                            const user = JSON.parse(currentUser);
                            
                            // Calculate subscription end date based on tier
                            const subscriptionEndDate = new Date();
                            const monthsToAdd = subscriptionTier === '3months' ? 3 : subscriptionTier === '6months' ? 6 : 12;
                            subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + monthsToAdd);
                            
                            // Check which discounts have been unlocked
                            // If user doesn't have unlockedDiscounts field, initialize it
                            // If they already have a subscriptionTier, mark that as already unlocked (migration for existing users)
                            let unlockedDiscounts = user.unlockedDiscounts || [];
                            if (!user.unlockedDiscounts && user.subscriptionTier) {
                              // Existing user with subscription but no unlockedDiscounts - mark their current tier as unlocked
                              unlockedDiscounts = [user.subscriptionTier];
                            }
                            
                            // Calculate welcome gift card balance based on subscription tier
                            // Only apply welcome discount if this tier hasn't been unlocked before
                            let welcomeGiftCardAmount = 0;
                            if (!unlockedDiscounts.includes(subscriptionTier)) {
                              welcomeGiftCardAmount = subscriptionTier === '3months' ? 10 : subscriptionTier === '6months' ? 20 : 40;
                            }
                            
                            const currentGiftCardBalance = user.giftCardBalance || 0;
                            
                            // Track this tier as unlocked if we're applying the discount
                            const updatedUnlockedDiscounts = welcomeGiftCardAmount > 0 
                              ? [...unlockedDiscounts, subscriptionTier]
                              : unlockedDiscounts;
                            
                            const updatedUser = {
                              ...user,
                              membershipType: 'PREMIUM',
                              subscriptionTier: subscriptionTier,
                              subscriptionPurchasedAt: new Date().toISOString(),
                              subscriptionEndDate: subscriptionEndDate.toISOString(),
                              autoRenewMembership: autoRenewMembership,
                              giftCardBalance: currentGiftCardBalance + welcomeGiftCardAmount,
                              unlockedDiscounts: updatedUnlockedDiscounts
                            };
                            
                            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                            
                            // Also update in registered users list
                            const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                            const userIndex = registeredUsers.findIndex((u: any) => u.email === user.email);
                            if (userIndex !== -1) {
                              registeredUsers[userIndex] = updatedUser;
                              localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
                            }
                            
                            // Clear subscription upgrade flags
                            localStorage.removeItem('subscriptionUpgrade');
                            localStorage.removeItem('isSubscriptionUpgrade');
                          }
                        }
                      }
                    } catch (error) {
                      console.error('Error saving subscription tier:', error);
                    }
                  }
                  
                  // Deduct gift card balance from user account after successful order
                  if (isSignedIn && appliedGiftCardBalance > 0) {
                    try {
                      const currentUser = localStorage.getItem('currentUser');
                      if (currentUser) {
                        const user = JSON.parse(currentUser);
                        const currentBalance = user.giftCardBalance || 0;
                        const newBalance = Math.max(0, currentBalance - appliedGiftCardBalance);
                        
                        const updatedUser = {
                          ...user,
                          giftCardBalance: newBalance
                        };
                        
                        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                        
                        // Also update in registered users list
                        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                        const userIndex = registeredUsers.findIndex((u: any) => u.email === user.email);
                        if (userIndex !== -1) {
                          registeredUsers[userIndex] = updatedUser;
                          localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
                        }
                      }
                    } catch (error) {
                      console.error('Error deducting gift card balance:', error);
                    }
                  }
                  
                  // Referral: credit code owner $20 digital cash when order is confirmed (only when buyer is signed in; if order is canceled later, that would need separate handling)
                  if (appliedReferralCode && appliedReferralCode.trim() && isSignedIn && email) {
                    try {
                      const ownerResult = getReferralCodeOwner(appliedReferralCode);
                      const buyerEmailNorm = (email || '').trim().toLowerCase();
                      const referrerEmailNorm = (ownerResult?.user?.email || '').trim().toLowerCase();
                      if (ownerResult && ownerResult.user?.email && buyerEmailNorm !== referrerEmailNorm) {
                        const referrer = ownerResult.user;
                        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                        const refIndex = registeredUsers.findIndex((u: any) => u.email === referrer.email);
                        if (refIndex !== -1) {
                          const currentBalance = referrer.giftCardBalance || 0;
                          const updatedReferrer = { ...referrer, giftCardBalance: currentBalance + 20 };
                          registeredUsers[refIndex] = updatedReferrer;
                          localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
                          if (isSignedIn) {
                            const cur = localStorage.getItem('currentUser');
                            if (cur) {
                              const parsed = JSON.parse(cur);
                              if (parsed.email === referrer.email) {
                                localStorage.setItem('currentUser', JSON.stringify(updatedReferrer));
                              }
                            }
                          }
                          const referralLog = JSON.parse(localStorage.getItem('referralEarnings') || '[]');
                          referralLog.push({
                            referrerEmail: referrer.email,
                            referredEmail: email || '',
                            orderId: `order-${nextOrderNumber}`,
                            orderNumber,
                            amount: 20,
                            status: 'confirmed',
                            date: new Date().toISOString()
                          });
                          localStorage.setItem('referralEarnings', JSON.stringify(referralLog));
                        }
                      }
                    } catch (error) {
                      console.error('Error crediting referrer:', error);
                    }
                  }
                  
                  // Persist order to user's order history and mark first purchase (so their referral code becomes active)
                  if (isSignedIn && email) {
                    try {
                      const userOrdersKey = `userOrders_${email.trim().toLowerCase()}`;
                      const existing = localStorage.getItem(userOrdersKey);
                      const ordersData = existing ? JSON.parse(existing) : { activeOrders: [], pastOrders: [] };
                      const activeOrders = ordersData.activeOrders || [];
                      const wasFirstOrder = activeOrders.length === 0 && (ordersData.pastOrders || []).length === 0;
                      const firstItem = cartItems[0];
                      const productName = firstItem?.name || 'Order';
                      const newOrder = {
                        id: `order-${nextOrderNumber}`,
                        orderNumber: `ORDER ${orderNumber}`,
                        date: orderDate,
                        status: 'PREPARING',
                        productName,
                        productImage: '/assets/natural front.png',
                        total: subtotal,
                        items: cartItems.reduce((sum: number, i: any) => sum + (i.quantity || 1), 0),
                        placedAt: Date.now()
                      };
                      activeOrders.push(newOrder);
                      localStorage.setItem(userOrdersKey, JSON.stringify({ ...ordersData, activeOrders }));
                      if (wasFirstOrder) {
                        const currentUser = localStorage.getItem('currentUser');
                        if (currentUser) {
                          const user = JSON.parse(currentUser);
                          const updatedUser = { ...user, hasMadeFirstPurchase: true };
                          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                          const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                          const uIndex = registeredUsers.findIndex((u: any) => u.email === user.email);
                          if (uIndex !== -1) {
                            registeredUsers[uIndex] = updatedUser;
                            localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
                          }
                        }
                      }
                    } catch (error) {
                      console.error('Error saving order / first purchase:', error);
                    }
                  }
                  
                  // Create Route protection if package protection is selected (non-blocking)
                  if (packageProtection && !isSubscriptionUpgrade && !isOnlyDigitalProducts) {
                    try {
                      const orderId = `order-${nextOrderNumber}`;
                      const routeProtectionData = prepareRouteProtectionData(
                        orderId,
                        orderNumber,
                        subtotal,
                        selectedCurrency,
                        cartItems,
                        email,
                        firstName,
                        lastName,
                        phoneNumber,
                        shippingAddress,
                        city,
                        state,
                        zip,
                        selectedCountry || 'US',
                        protectionFee
                      );
                      
                      // Call Route API asynchronously (don't block navigation)
                      createRouteProtection(routeProtectionData).then((routeResult) => {
                        if (routeResult.success && routeResult.protectionId) {
                          console.log('Route protection created successfully:', routeResult.protectionId);
                        } else {
                          console.warn('Route protection creation failed:', routeResult.error);
                        }
                      }).catch((error) => {
                        console.error('Error creating Route protection:', error);
                      });
                    } catch (error) {
                      console.error('Error preparing Route protection data:', error);
                    }
                  }
                  
                  // Navigate to confirmation page with order data
                  navigate('/checkout/summary', {
                    state: {
                      orderNumber,
                      orderDate,
                      orderTotal: subtotal,
                      shippingMethod: shippingMethodDisplay,
                      processingTime: processingTimeText,
                      firstName,
                      lastName,
                      shippingAddress,
                      city,
                      state,
                      zip,
                      country: selectedCountry || 'US',
                      paymentMethod: paymentMethodDisplay,
                      email,
                      pointsEarned,
                      cartItems: cartItems
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
                CONFIRM ORDER
                  </button>
              </div>
            )}
          </div>
        </div>
      </div>
    
      {/* Digital Cash amount modal */}
      {showDigitalCashModal && (() => {
        const protectionFeeForDiscount = packageProtection ? calculateProtectionFee(orderAmount) : 0;
        const maxDiscountable = orderAmount + taxesProcessing + shippingHandling + (selectedProcessing === 'rush' ? 100 : 0) + protectionFeeForDiscount;
        const maxApplicable = Math.min(giftCardBalance, Math.round(maxDiscountable));
        return (
        <div
          className="fixed z-50 backdrop-blur-md"
          style={{
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 999999999,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(3px)',
            WebkitBackdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDigitalCashModal(false);
          }}
        >
          <div
            className="p-6 bg-white border border-black"
            style={{ width: 'calc(100vw - 32px)', maxWidth: 'none', borderWidth: '1.3px', boxSizing: 'border-box' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontFamily: '"Futura PT Medium"', fontSize: '12px', fontWeight: 500, marginBottom: '16px', color: '#EB1C24', textTransform: 'uppercase', textAlign: 'center' }}>
              DIGITAL CASH
            </h3>
            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', marginBottom: '16px', textTransform: 'uppercase' }}>
              Select the amount of digital cash to apply to your order.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', textTransform: 'uppercase' }}>Remaining balance</span>
                <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#EB1C24', fontWeight: 500 }}>${Math.max(0, giftCardBalance - digitalCashModalAmount)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={maxApplicable}
                step={1}
                value={digitalCashModalAmount}
                onChange={(e) => setDigitalCashModalAmount(Math.max(0, Math.min(maxApplicable, parseInt(e.target.value, 10) || 0)))}
                style={{
                  width: '100%',
                  height: '6px',
                  accentColor: '#EB1C24',
                  cursor: 'pointer'
                }}
              />
            </div>
            {/* Buttons inside container - APPLY left, CANCEL right */}
            <div className="flex space-x-3" style={{ marginTop: '24px' }}>
              <button
                type="button"
                onClick={() => {
                  const amount = Math.max(0, Math.min(maxApplicable, digitalCashModalAmount));
                  setAppliedGiftCardBalance(amount);
                  userSelectedDigitalCashRef.current = amount;
                  setShowDigitalCashModal(false);
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
                APPLY
              </button>
              <button
                type="button"
                onClick={() => setShowDigitalCashModal(false)}
                className="flex-1 py-2 px-4 border border-black bg-white font-medium hover:bg-gray-50 transition-colors"
                style={{
                  borderWidth: '1.3px',
                  fontSize: '11px',
                  fontFamily: '"Futura PT Medium"',
                  color: '#000000',
                  textTransform: 'uppercase'
                }}
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
        );
      })()}

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
            overflowX: 'hidden',
            border: '1.3px solid black',
            borderRadius: '0',
            transform: 'translateY(-6px)',
            backgroundImage: 'url(/assets/marble-tc.png)',
            backgroundSize: '100% auto',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            boxSizing: 'border-box'
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
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', maxWidth: 'calc(100% - 6px)' }}>
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
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', maxWidth: 'calc(100% - 8px)' }}>
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
              ALL SALES ARE FINAL. WE ARE UNABLE TO OFFER REFUNDS, RETURNS OR EXCHANGES DUE TO THE BESPOKE NATURE OF OUR PRODUCTS & FOR SANITARY REASONS. FRONTAL SLAYER RESERVES THE RIGHT TO REFUSE ALL REFUNDS, RETURNS AND EXCHANGES. IF THERE IS AN ISSUE WITH YOUR ORDER, PLEASE REACH OUT TO <span style={{ color: '#EB1C24' }}>CONTACT@FRONTALSLAYER.COM</span><br />
              ALL INQUIRIES SHOULD RECEIVE A RESPONSE WITHIN 72 HOURS. CONTACT US IF YOUR ITEM IS DEFECTIVE OR YOU RECEIVED THE WRONG ITEM. WE WILL INVESTIGATE ALL CONCERNS THOROUGHLY AND CORRECT YOUR SHIPMENT OR ISSUE STORE CREDIT IF THE ITEM IS NO LONGER IN STOCK.
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
      title="AGREE TO TERMS + CONDITIONS"
      message=" YOU MUST AGREE TO THE TERMS TO FINALIZE THIS PURCHASE."
      confirmText="OK"
      cancelText="CLOSE"
      messageTextTransform="uppercase"
    />

      {/* Validation Modal */}
      <ConfirmationModal
      isOpen={showValidationModal}
      onClose={() => {
        setShowValidationModal(false);
        // Focus the field after modal closes
        setTimeout(() => {
          if (fieldToFocus) {
            const refMap: { [key: string]: React.RefObject<HTMLInputElement> } = {
              firstName: firstNameRef,
              lastName: lastNameRef,
              shippingAddress: shippingAddressRef,
              city: cityRef,
              state: stateRef,
              zip: zipRef,
              phoneNumber: phoneNumberRef,
              email: emailRef,
              cardholder: cardholderRef,
              cardNumber: cardNumberRef,
              expirationDate: expirationDateRef,
              cvv: cvvRef,
              billingAddress: billingAddressRef,
              billingCity: billingCityRef,
              billingState: billingStateRef,
              billingZip: billingZipRef
            };
            const ref = refMap[fieldToFocus];
            if (ref?.current) {
              ref.current.focus();
            }
            setFieldToFocus(null);
          }
        }, 100);
      }}
      onConfirm={() => {
        setShowValidationModal(false);
        // Focus the field after modal closes
        setTimeout(() => {
          if (fieldToFocus) {
            const refMap: { [key: string]: React.RefObject<HTMLInputElement> } = {
              firstName: firstNameRef,
              lastName: lastNameRef,
              shippingAddress: shippingAddressRef,
              city: cityRef,
              state: stateRef,
              zip: zipRef,
              phoneNumber: phoneNumberRef,
              email: emailRef,
              cardholder: cardholderRef,
              cardNumber: cardNumberRef,
              expirationDate: expirationDateRef,
              cvv: cvvRef,
              billingAddress: billingAddressRef,
              billingCity: billingCityRef,
              billingState: billingStateRef,
              billingZip: billingZipRef
            };
            const ref = refMap[fieldToFocus];
            if (ref?.current) {
              ref.current.focus();
            }
            setFieldToFocus(null);
          }
        }, 100);
      }}
      title="MISSING INPUT FIELD"
      message={validationMessage}
      confirmText="OK"
      cancelText="CLOSE"
      messageTextTransform="uppercase"
    />
    
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

export default CheckoutPage;

