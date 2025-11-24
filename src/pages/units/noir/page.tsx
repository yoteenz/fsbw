import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ThumbBox from '../../../components/ThumbBox';
import DynamicCartIcon from '../../../components/DynamicCartIcon';
import LoadingScreen from '../../../components/base/LoadingScreen';

interface DensityOption {
  id: string;
  name: string;
  percentage: string;
  description: string;
  price: number;
  image: string;
}

function NoirSelection() {
  console.log('NoirSelection component rendering');
  const navigate = useNavigate();
  const [selectedDensity, setSelectedDensity] = useState(() => {
    return localStorage.getItem('selectedDensity') || '200%';
  });
  const [selectedCustomCap, setSelectedCustomCap] = useState('M');
  const [selectedFlexibleCap, setSelectedFlexibleCap] = useState('');
  const [showLoading, setShowLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showChartModal, setShowChartModal] = useState(false);
  const [selectedMannequinView, setSelectedMannequinView] = useState(0);
  const [is3DView, setIs3DView] = useState(() => {
    // Check localStorage for saved 3D view preference, default to false (2D view)
    const saved3DView = localStorage.getItem('noir-3d-view');
    return saved3DView === 'true';
  });
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startScrollPosition, setStartScrollPosition] = useState(0);
  const [activeTab, setActiveTab] = useState('DETAILS');
  const [similarProductsScroll, setSimilarProductsScroll] = useState(0);
  const [recentlyViewedScroll, setRecentlyViewedScroll] = useState(0);
  const [isSimilarProductsDragging, setIsSimilarProductsDragging] = useState(false);
  const [isRecentlyViewedDragging, setIsRecentlyViewedDragging] = useState(false);
  const [similarProductsStartX, setSimilarProductsStartX] = useState(0);
  const [recentlyViewedStartX, setRecentlyViewedStartX] = useState(0);
  const [similarProductsStartScroll, setSimilarProductsStartScroll] = useState(0);
  const [recentlyViewedStartScroll, setRecentlyViewedStartScroll] = useState(0);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mobileMenuActiveTab, setMobileMenuActiveTab] = useState('SHOP');
  const [mobileMenuExpandedItems, setMobileMenuExpandedItems] = useState<string[]>([]);
  const [isSignedIn, setIsSignedIn] = useState(false); // Track sign-in status
  
  // Cart count state
  const [cartCount, setCartCount] = useState(() => {
    return parseInt(localStorage.getItem('cartCount') || '0');
  });

  // Currency state
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');

  // Currency exchange rates (same as CartDropdown)
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

  // Add to bag button states: 'idle', 'adding', 'added'
  const [addToBagState, setAddToBagState] = useState<'idle' | 'adding' | 'added'>('idle');
  const [currentConfiguration, setCurrentConfiguration] = useState<string>('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);


  const generateConfigurationString = () => {
    const selectedCapSize = localStorage.getItem('selectedCapSize') || 'M';
    const selectedLength = localStorage.getItem('selectedLength') || '24"';
    const selectedDensity = localStorage.getItem('selectedDensity') || '200%';
    const selectedLace = localStorage.getItem('selectedLace') || '13X6';
    const selectedTexture = localStorage.getItem('selectedTexture') || 'SILKY';
    const selectedColor = localStorage.getItem('selectedColor') || 'OFF BLACK';
    const selectedHairline = localStorage.getItem('selectedHairline') || 'NATURAL';
    const selectedStyling = localStorage.getItem('selectedStyling') || 'MIDDLE';
    const selectedAddOns = localStorage.getItem('selectedAddOns') || '';
    
    // Include current component state for cap size and quantity
    const currentCapSize = selectedCustomCap || selectedFlexibleCap || selectedCapSize;
    const currentQuantity = quantity.toString();
    
    return `${currentCapSize}-${selectedLength}-${selectedDensity}-${selectedLace}-${selectedTexture}-${selectedColor}-${selectedHairline}-${selectedStyling}-${selectedAddOns}-${currentQuantity}`;
  };

  // Generate configuration string for change detection (without quantity)
  const generateConfigurationStringForChangeDetection = () => {
    const selectedCapSize = localStorage.getItem('selectedCapSize') || 'M';
    const selectedLength = localStorage.getItem('selectedLength') || '24"';
    const selectedDensity = localStorage.getItem('selectedDensity') || '200%';
    const selectedLace = localStorage.getItem('selectedLace') || '13X6';
    const selectedTexture = localStorage.getItem('selectedTexture') || 'SILKY';
    const selectedColor = localStorage.getItem('selectedColor') || 'OFF BLACK';
    const selectedHairline = localStorage.getItem('selectedHairline') || 'NATURAL';
    const selectedStyling = localStorage.getItem('selectedStyling') || 'NONE';
    const selectedAddOns = localStorage.getItem('selectedAddOns') || '';
    
    // Include current component state for cap size only (not quantity)
    const currentCapSize = selectedCustomCap || selectedFlexibleCap || selectedCapSize;
    
    // Normalize values to ensure consistent formatting - remove ALL spaces
    const normalizedCapSize = currentCapSize.replace(/\s+/g, '');
    const normalizedLength = selectedLength.replace(/\s+/g, '');
    const normalizedDensity = selectedDensity.replace(/\s+/g, '');
    const normalizedLace = selectedLace.replace(/\s+/g, '');
    const normalizedTexture = selectedTexture.replace(/\s+/g, '');
    const normalizedColor = selectedColor.replace(/\s+/g, '');
    const normalizedHairline = selectedHairline.replace(/\s+/g, '');
    const normalizedStyling = selectedStyling.replace(/\s+/g, '');
    // Handle empty addOns consistently - convert "[]" to empty string
    const normalizedAddOns = selectedAddOns.replace(/\s+/g, '').replace(/^\[\]$/, '');
    
    return `${normalizedCapSize}-${normalizedLength}-${normalizedDensity}-${normalizedLace}-${normalizedTexture}-${normalizedColor}-${normalizedHairline}-${normalizedStyling}-${normalizedAddOns}`;
  };


  // Update existing noir cart items to use new pricing
  useEffect(() => {
    const updateExistingCartItems = () => {
      // Helper functions to calculate prices from cart item data
      const getLengthPriceFromItem = (item: any) => {
        const length = item.length || '24"';
        if (length === '30"' || length === '32"' || length === '34"' || length === '36"' || length === '40"') {
          return 0; // Length surcharge is included in color price for colored items
        }
        return 0;
      };

      const getDensityPriceFromItem = (item: any) => {
        const density = item.density || '200%';
        const densityPrices: { [key: string]: number } = {
          '150%': 0,
          '200%': 0,
          '250%': 50,
          '300%': 100
        };
        return densityPrices[density] || 0;
      };

      const getLacePriceFromItem = (item: any) => {
        const lace = item.lace || '13X6';
        const lacePrices: { [key: string]: number } = {
          '13X6': 0,
          '13X4': 0,
          '13X5': 0,
          '2X6': 0,
          '4X4': 0,
          '5X5': 0,
          '6X6': 0,
          '7X7': 0,
          'FULL LACE': 240
        };
        return lacePrices[lace] || 0;
      };

      const getTexturePriceFromItem = (item: any) => {
        const texture = item.texture || 'SILKY';
        const texturePrices: { [key: string]: number } = {
          'SILKY': 0,
          'WAVY': 0,
          'CURLY': 0
        };
        return texturePrices[texture] || 0;
      };

      const getHairlinePriceFromItem = (item: any) => {
        const hairline = item.hairline || 'NATURAL';
        const hairlinePrices: { [key: string]: number } = {
          'NATURAL': 0,
          'PREMIUM': 20
        };
        return hairlinePrices[hairline] || 0;
      };

      const getStylingPriceFromItem = (item: any) => {
        const styling = item.styling || 'NONE';
        const stylingPrices: { [key: string]: number } = {
          'NONE': 0,
          'BANGS': 40,
          'CRIMPS': 60,
          'FLAT IRON': 60,
          'LAYERS': 60
        };
        return stylingPrices[styling] || 0;
      };

      const getAddOnsPriceFromItem = (item: any) => {
        const addOns = item.addOns || [];
        const addOnPrices: { [key: string]: number } = {
          'BLEACH': 40,
          'PLUCK': 40,
          'BLUNT CUT': 20
        };
        return addOns.reduce((total: number, addOn: string) => {
          return total + (addOnPrices[addOn] || 0);
        }, 0);
      };
      const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      let updated = false;
      
      const updatedCartItems = cartItems.map((item: any) => {
        if (item.name === 'NOIR') {
          // Calculate correct price based on ALL customization options
          let basePrice = 740; // Default for standard caps (XS, S, M, L)
          if (item.capSize === 'XXS/XS/S' || item.capSize === 'S/M/L') {
            basePrice = 780; // Flexible cap options cost $40 extra
          }
          
          // Calculate color price from color name
          let colorPrice = 0;
          if (item.color && item.color !== 'OFF BLACK') {
            const colorPrices: { [key: string]: number } = {
              'JET BLACK': 100,
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
            colorPrice = colorPrices[item.color] || 0;
            
            // Add extra $40 for lengths over 30" (excluding OFF BLACK)
            if (item.length && ['30"', '32"', '34"', '36"', '40"'].includes(item.length)) {
              colorPrice += 40;
            }
          }
          
          // Calculate other customization prices from the cart item's stored data
          // Don't use localStorage values as they represent the current page state, not the cart item's state
          const lengthPrice = getLengthPriceFromItem(item);
          const densityPrice = getDensityPriceFromItem(item);
          const lacePrice = getLacePriceFromItem(item);
          const texturePrice = getTexturePriceFromItem(item);
          const hairlinePrice = getHairlinePriceFromItem(item);
          const stylingPrice = getStylingPriceFromItem(item);
          const addOnsPrice = getAddOnsPriceFromItem(item);
          
          const newPrice = basePrice + colorPrice + lengthPrice + densityPrice + lacePrice + texturePrice + hairlinePrice + stylingPrice + addOnsPrice;
          
          if (item.price !== newPrice) {
            updated = true;
            return { ...item, price: newPrice };
          }
        }
        return item;
      });
      
      if (updated) {
        localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
        // Dispatch event to update cart display
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        console.log('Updated existing NOIR cart items with correct pricing including all customizations');
      }
      
      // Also fix localStorage capSizePrice values for flexible caps
      const selectedCapSize = localStorage.getItem('selectedCapSize');
      const selectedCapSizePrice = localStorage.getItem('selectedCapSizePrice');
      if ((selectedCapSize === 'XXS/XS/S' || selectedCapSize === 'S/M/L') && selectedCapSizePrice === '40') {
        localStorage.setItem('selectedCapSizePrice', '0');
        console.log('Fixed selectedCapSizePrice for flexible cap');
      }
      
      const customizeSelectedCapSize = localStorage.getItem('customizeSelectedCapSize');
      const customizeSelectedCapSizePrice = localStorage.getItem('customizeSelectedCapSizePrice');
      if ((customizeSelectedCapSize === 'XXS/XS/S' || customizeSelectedCapSize === 'S/M/L') && customizeSelectedCapSizePrice === '40') {
        localStorage.setItem('customizeSelectedCapSizePrice', '0');
        console.log('Fixed customizeSelectedCapSizePrice for flexible cap');
      }
      
      const editSelectedCapSize = localStorage.getItem('editSelectedCapSize');
      const editSelectedCapSizePrice = localStorage.getItem('editSelectedCapSizePrice');
      if ((editSelectedCapSize === 'XXS/XS/S' || editSelectedCapSize === 'S/M/L') && editSelectedCapSizePrice === '40') {
        localStorage.setItem('editSelectedCapSizePrice', '0');
        console.log('Fixed editSelectedCapSizePrice for flexible cap');
      }
    };
    
    updateExistingCartItems();
  }, []);

  // Listen for cart count changes and update button state
  useEffect(() => {
    const handleCartUpdate = () => {
        const newCartCount = parseInt(localStorage.getItem('cartCount') || '0');
        setCartCount(newCartCount);
      
      // Check button state from localStorage to avoid stale closure
      const currentButtonState = localStorage.getItem('addToBagButtonState');
        
        // If button is currently 'adding', don't reset it
      if (currentButtonState === 'adding') {
          return;
        }
        
        // Only check for reset if button is currently 'added'
      if (currentButtonState === 'added') {
          // If cart is completely empty, reset button state
          if (newCartCount === 0) {
            setAddToBagState('idle');
            localStorage.removeItem('addToBagButtonState');
          localStorage.removeItem('lastAddedItemId');
            return;
          }
          
        // Check if the specific item that was added is still in cart
        const lastAddedItemId = localStorage.getItem('lastAddedItemId');
          const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
          
        // Check if the specific item ID exists in cart items
        const itemStillInCart = cartItems.some((item: any) => item.id === lastAddedItemId);
        
        // Only reset if the specific item is not in cart
        if (!itemStillInCart) {
            setAddToBagState('idle');
            localStorage.removeItem('addToBagButtonState');
          localStorage.removeItem('lastAddedItemId');
          }
        }
    };

    const handleCartCountUpdate = (event: CustomEvent) => {
      handleCartUpdate();
    };
    
    const handleCartUpdated = (event: CustomEvent) => {
      handleCartUpdate();
      // Trigger button state check when cart is updated
      setRefreshTrigger(prev => prev + 1);
    };

    const handleStorageChange = () => {
      handleCartUpdate();
      // Trigger button state check when localStorage values change
      setRefreshTrigger(prev => prev + 1);
    };

    // Listen for custom events
    window.addEventListener('cartCountUpdated', handleCartCountUpdate as EventListener);
    window.addEventListener('cartUpdated', handleCartUpdated as EventListener);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);
    
    // Simple polling that only runs when button is in 'added' state
    const interval = setInterval(() => {
      // Check current button state from localStorage to avoid stale closure
      const currentButtonState = localStorage.getItem('addToBagButtonState');
      if (currentButtonState === 'added') {
        handleCartUpdate();
      }
    }, 1000); // Check every 1 second, only when needed
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('cartCountUpdated', handleCartCountUpdate as EventListener);
      window.removeEventListener('cartUpdated', handleCartUpdated as EventListener);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);

  // Load selected currency from localStorage
  useEffect(() => {
    const savedCurrency = localStorage.getItem('selectedCurrency');
    if (savedCurrency && currencyRates[savedCurrency as keyof typeof currencyRates]) {
      setSelectedCurrency(savedCurrency);
    }
  }, [currencyRates]);

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

    window.addEventListener('storage', handleCurrencyChange);
    return () => window.removeEventListener('storage', handleCurrencyChange);
  }, [currencyRates]);

  // Format price with currency
  const formatPrice = React.useCallback((price: number) => {
    const currency = currencyRates[selectedCurrency as keyof typeof currencyRates];
    const convertedPrice = price * currency.rate;
    return {
      __html: currency.symbol + convertedPrice.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      })
    };
  }, [currencyRates, selectedCurrency]);

  // Mannequin images for noir product
  const mannequinImages = [
    '/assets/natural front.png',  // View 1 (default)
    '/assets/natural left.png',  // View 2 (top thumbnail)
    '/assets/natural right.png'  // View 3 (bottom thumbnail)
  ];

  // Get current mannequin images based on selected view
  const getCurrentImages = () => {
    try {
      if (selectedMannequinView === 0) {
        // Default state: natural front in hero
        return {
          hero: mannequinImages[0] || '/assets/natural front.png', // natural front
          top: mannequinImages[1] || '/assets/natural left.png', // natural left
          bottom: mannequinImages[2] || '/assets/natural right.png' // natural right
        };
      } else if (selectedMannequinView === 1) {
        // Top thumbnail clicked: natural left in hero, natural front in top
        return {
          hero: mannequinImages[1] || '/assets/natural left.png', // natural left
          top: mannequinImages[0] || '/assets/natural front.png', // natural front
          bottom: mannequinImages[2] || '/assets/natural right.png' // natural right (stays in bottom)
        };
      } else {
        // Bottom thumbnail clicked: natural right in hero, natural front in bottom
        return {
          hero: mannequinImages[2] || '/assets/natural right.png', // natural right
          top: mannequinImages[1] || '/assets/natural left.png', // natural left (stays in top)
          bottom: mannequinImages[0] || '/assets/natural front.png' // natural front
        };
      }
    } catch (error) {
      console.error('Error in getCurrentImages:', error);
      return {
        hero: '/assets/natural front.png',
        top: '/assets/natural left.png',
        bottom: '/assets/natural right.png'
      };
    }
  };

  const currentImages = getCurrentImages();

  // Get current 3D view images based on selected view
  const get3DViewImages = () => {
    try {
      if (selectedMannequinView === 0) {
        // Default state: noir front in hero
        return {
          hero: 'noir front.png',
          top: 'noir right.png',
          bottom: 'noir left.png'
        };
      } else if (selectedMannequinView === 1) {
        // Top thumbnail clicked: noir right in hero, noir front in top
        return {
          hero: 'noir right.png',
          top: 'noir front.png',
          bottom: 'noir left.png'
        };
      } else {
        // Bottom thumbnail clicked: noir left in hero, noir front in bottom
        return {
          hero: 'noir left.png',
          top: 'noir right.png',
          bottom: 'noir front.png'
        };
      }
    } catch (error) {
      console.error('Error in get3DViewImages:', error);
      return {
        hero: 'noir front.png',
        top: 'noir right.png',
        bottom: 'noir left.png'
      };
    }
  };

  const current3DImages = get3DViewImages();

  // Density options with correct pricing structure
  const densityOptions: DensityOption[] = [
    {
      id: '130%',
      name: '130%',
      percentage: '130%',
      description: '130% EQUIVALENT TO 1 BUNDLE FOR LENGTHS OVER 16"',
      price: -60, // $60 cheaper than default
      image: '/assets/density.png'
    },
    {
      id: '150%',
      name: '150%',
      percentage: '150%',
      description: '150% EQUIVALENT TO 1-2 BUNDLES FOR LENGTHS OVER 16"',
      price: -40, // $40 cheaper than default
      image: '/assets/density.png'
    },
    {
      id: '180%',
      name: '180%',
      percentage: '180%',
      description: '180% EQUIVALENT TO 2 BUNDLES FOR LENGTHS OVER 18"',
      price: -20, // $20 cheaper than default
      image: '/assets/density.png'
    },
    {
      id: '200%',
      name: '200%',
      percentage: '200%',
      description: '200% EQUIVALENT TO 2-3 BUNDLES FOR LENGTHS OVER 22"',
      price: 0, // Default option - included in base price
      image: '/assets/density.png'
    },
    {
      id: '250%',
      name: '250%',
      percentage: '250%',
      description: '250% EQUIVALENT TO 3 BUNDLES FOR LENGTHS OVER 26"',
      price: 80, // $80 more than default
      image: '/assets/density.png'
    },
    {
      id: '300%',
      name: '300%',
      percentage: '300%',
      description: '300% EQUIVALENT TO 3-4 BUNDLES FOR LENGTHS OVER 30"',
      price: 160, // $160 more than default
      image: '/assets/density.png'
    },
    {
      id: '350%',
      name: '350%',
      percentage: '350%',
      description: '350% EQUIVALENT TO 4 BUNDLES FOR LENGTHS OVER 32"',
      price: 240, // $240 more than default
      image: '/assets/density.png'
    },
    {
      id: '400%',
      name: '400%',
      percentage: '400%',
      description: '400% EQUIVALENT TO 4-5 BUNDLES FOR LENGTHS OVER 40"',
      price: 320, // $320 more than default
      image: '/assets/density.png'
    }
  ];

  const handleDensitySelect = (densityId: string) => {
    setSelectedDensity(densityId);
  };

  const handleCustomCapSelect = (capSize: string) => {
    setSelectedCustomCap(capSize);
    setSelectedFlexibleCap(''); // Clear flexible cap selection
    // Clear flexible cap price when custom cap is selected
    localStorage.removeItem('selectedFlexibleCapPrice');
  };

  const handleFlexibleCapSelect = (capSize: string) => {
    setSelectedFlexibleCap(capSize);
    setSelectedCustomCap(''); // Clear custom cap selection
    // Store flexible cap price in localStorage
    localStorage.setItem('selectedFlexibleCapPrice', '60');
  };

  const handleQuantityIncrease = () => {
    setQuantity(prev => Math.min(prev + 1, 10));
  };

  const handleQuantityDecrease = () => {
    setQuantity(prev => Math.max(prev - 1, 1));
  };

  const handleBack = () => {
    // Store the selected cap size in localStorage for build-a-wig page
    if (selectedCustomCap) {
      localStorage.setItem('selectedCapSize', selectedCustomCap);
      localStorage.setItem('selectedCapSizePrice', '0'); // Custom cap has no additional price
    } else if (selectedFlexibleCap) {
      localStorage.setItem('selectedCapSize', selectedFlexibleCap);
      localStorage.setItem('selectedCapSizePrice', '60'); // Flexible cap has $60 additional price
    }
    navigate('/build-a-wig');
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


  // Check if configuration has changed
  useEffect(() => {
    const newConfig = generateConfigurationStringForChangeDetection();
    if (currentConfiguration && newConfig !== currentConfiguration) {
      // Check if the new configuration is already in the cart
      const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      const matchingItem = cartItems.find((item: any) => {
        // Normalize cart item values to ensure consistent formatting - remove ALL spaces
        // Handle empty addOns consistently - convert empty array to empty string
        const itemAddOns = item.addOns && item.addOns.length > 0 ? item.addOns.join(',') : '';
        const normalizedItemConfig = `${(item.capSize || '').toString().replace(/\s+/g, '')}-${(item.length || '24"').toString().replace(/\s+/g, '')}-${(item.density || '').toString().replace(/\s+/g, '')}-${(item.lace || '').toString().replace(/\s+/g, '')}-${(item.texture || '').toString().replace(/\s+/g, '')}-${(item.color || '').toString().replace(/\s+/g, '')}-${(item.hairline || '').toString().replace(/\s+/g, '')}-${(item.styling || '').toString().replace(/\s+/g, '')}-${itemAddOns.replace(/\s+/g, '')}`;
        return normalizedItemConfig === newConfig;
      });
      
      if (matchingItem) {
        // If the new configuration is in cart, set button to 'added'
        setAddToBagState('added');
        localStorage.setItem('addToBagButtonState', 'added');
        localStorage.setItem('lastAddedItemId', matchingItem.id);
      } else {
        // If not in cart, reset to idle
        setAddToBagState('idle');
        localStorage.removeItem('addToBagButtonState');
        localStorage.removeItem('lastAddedItemId');
      }
    }
    setCurrentConfiguration(newConfig);
  }, [selectedCustomCap, selectedFlexibleCap, refreshTrigger]);

  // Initialize button state from localStorage on page load
  useEffect(() => {
    const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
    const currentConfig = generateConfigurationStringForChangeDetection();
    
    // Always check if current configuration matches any cart item
    const matchingItem = cartItems.find((item: any) => {
      // Normalize cart item values to ensure consistent formatting - remove ALL spaces
      // Handle empty addOns consistently - convert empty array to empty string
      const itemAddOns = item.addOns && item.addOns.length > 0 ? item.addOns.join(',') : '';
      const normalizedItemConfig = `${(item.capSize || '').toString().replace(/\s+/g, '')}-${(item.length || '24"').toString().replace(/\s+/g, '')}-${(item.density || '').toString().replace(/\s+/g, '')}-${(item.lace || '').toString().replace(/\s+/g, '')}-${(item.texture || '').toString().replace(/\s+/g, '')}-${(item.color || '').toString().replace(/\s+/g, '')}-${(item.hairline || '').toString().replace(/\s+/g, '')}-${(item.styling || '').toString().replace(/\s+/g, '')}-${itemAddOns.replace(/\s+/g, '')}`;
      return normalizedItemConfig === currentConfig;
    });
    
    if (matchingItem) {
      setAddToBagState('added');
      localStorage.setItem('addToBagButtonState', 'added');
      localStorage.setItem('lastAddedItemId', matchingItem.id);
    } else {
      setAddToBagState('idle');
      localStorage.removeItem('addToBagButtonState');
      localStorage.removeItem('lastAddedItemId');
    }
  }, []);

  // Check button state when page gains focus (user returns from other pages)
  useEffect(() => {
    const handleFocus = () => {
      const currentConfig = generateConfigurationStringForChangeDetection();
      const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      
      const matchingItem = cartItems.find((item: any) => {
        const itemAddOns = item.addOns && item.addOns.length > 0 ? item.addOns.join(',') : '';
        const normalizedItemConfig = `${(item.capSize || '').toString().replace(/\s+/g, '')}-${(item.length || '24"').toString().replace(/\s+/g, '')}-${(item.density || '').toString().replace(/\s+/g, '')}-${(item.lace || '').toString().replace(/\s+/g, '')}-${(item.texture || '').toString().replace(/\s+/g, '')}-${(item.color || '').toString().replace(/\s+/g, '')}-${(item.hairline || '').toString().replace(/\s+/g, '')}-${(item.styling || '').toString().replace(/\s+/g, '')}-${itemAddOns.replace(/\s+/g, '')}`;
        return normalizedItemConfig === currentConfig;
      });
      
      if (matchingItem) {
        setAddToBagState('added');
        localStorage.setItem('addToBagButtonState', 'added');
        localStorage.setItem('lastAddedItemId', matchingItem.id);
      } else {
        setAddToBagState('idle');
        localStorage.removeItem('addToBagButtonState');
        localStorage.removeItem('lastAddedItemId');
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleChartClick = () => {
    setShowChartModal(true);
  };

  const handleCloseChart = () => {
    setShowChartModal(false);
  };

  // Drag handlers for product images (mouse only)

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
    const newPosition = startScrollPosition - diff;
    
    // Constrain scrolling within bounds - allow scrolling to show all 3 images
    const maxScroll = 0;
    const minScroll = -window.innerWidth * 0.6; // Allow scrolling to show the 3rd image
    setScrollPosition(Math.max(minScroll, Math.min(maxScroll, newPosition)));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile devices
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
    const newPosition = startScrollPosition + diff; // Fixed: add instead of subtract for correct direction
    
    // Constrain scrolling within bounds - allow scrolling to show all 3 images
    const maxScroll = 0;
    const minScroll = -window.innerWidth * 0.6; // Allow scrolling to show the 3rd image
    setScrollPosition(Math.max(minScroll, Math.min(maxScroll, newPosition)));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
  };

  // Similar Products scroll handlers
  const handleSimilarProductsMouseDown = (e: React.MouseEvent) => {
    setIsSimilarProductsDragging(true);
    setSimilarProductsStartX(e.clientX);
    setSimilarProductsStartScroll(similarProductsScroll);
  };

  const handleSimilarProductsMouseMove = (e: React.MouseEvent) => {
    if (!isSimilarProductsDragging) return;
    e.preventDefault();
    const currentX = e.clientX;
    const diff = currentX - similarProductsStartX;
    const newPosition = similarProductsStartScroll - diff;
    
    const maxScroll = 0;
      const minScroll = -window.innerWidth * (is3DView ? 0.500 : 0.713); // Scroll by 50.0% (3D) or 71.3% (2D) of viewport width for optimal positioning
    setSimilarProductsScroll(Math.max(minScroll, Math.min(maxScroll, newPosition)));
  };

  const handleSimilarProductsMouseUp = () => {
    setIsSimilarProductsDragging(false);
    // Snap to nearest position
    if (similarProductsScroll > -window.innerWidth * (is3DView ? 0.250 : 0.3565)) { // 50.0% (3D) or 71.3% (2D) / 2
      setSimilarProductsScroll(0);
    } else {
      setSimilarProductsScroll(-window.innerWidth * (is3DView ? 0.500 : 0.713)); // Scroll by 50.0% (3D) or 71.3% (2D) of viewport width
    }
  };

  const handleSimilarProductsTouchStart = (e: React.TouchEvent) => {
    setIsSimilarProductsDragging(true);
    setSimilarProductsStartX(e.touches[0].clientX);
    setSimilarProductsStartScroll(similarProductsScroll);
  };

  const handleSimilarProductsTouchMove = (e: React.TouchEvent) => {
    if (!isSimilarProductsDragging) return;
    e.preventDefault();
    const currentX = e.touches[0].clientX;
    const diff = currentX - similarProductsStartX;
    const newPosition = similarProductsStartScroll + diff;
    
    const maxScroll = 0;
      const minScroll = -window.innerWidth * (is3DView ? 0.500 : 0.713); // Scroll by 50.0% (3D) or 71.3% (2D) of viewport width for optimal positioning
    setSimilarProductsScroll(Math.max(minScroll, Math.min(maxScroll, newPosition)));
  };

  const handleSimilarProductsTouchEnd = () => {
    setIsSimilarProductsDragging(false);
    // Snap to nearest position
    if (similarProductsScroll > -window.innerWidth * (is3DView ? 0.250 : 0.3565)) { // 50.0% (3D) or 71.3% (2D) / 2
      setSimilarProductsScroll(0);
    } else {
      setSimilarProductsScroll(-window.innerWidth * (is3DView ? 0.500 : 0.713)); // Scroll by 50.0% (3D) or 71.3% (2D) of viewport width
    }
  };

  // Recently Viewed scroll handlers
  const handleRecentlyViewedMouseDown = (e: React.MouseEvent) => {
    setIsRecentlyViewedDragging(true);
    setRecentlyViewedStartX(e.clientX);
    setRecentlyViewedStartScroll(recentlyViewedScroll);
  };

  const handleRecentlyViewedMouseMove = (e: React.MouseEvent) => {
    if (!isRecentlyViewedDragging) return;
    e.preventDefault();
    const currentX = e.clientX;
    const diff = currentX - recentlyViewedStartX;
    const newPosition = recentlyViewedStartScroll - diff;
    
    const maxScroll = 0;
      const minScroll = -window.innerWidth * (is3DView ? 0.530 : 0.730); // Scroll by 53.0% (3D) or 73.0% (2D) of viewport width for optimal positioning
      setRecentlyViewedScroll(Math.max(minScroll, Math.min(maxScroll, newPosition)));
  };

  const handleRecentlyViewedMouseUp = () => {
    setIsRecentlyViewedDragging(false);
    // Snap to nearest position
    if (recentlyViewedScroll > -window.innerWidth * (is3DView ? 0.265 : 0.365)) { // 53.0% (3D) or 73.0% (2D) / 2
      setRecentlyViewedScroll(0);
    } else {
      setRecentlyViewedScroll(-window.innerWidth * (is3DView ? 0.530 : 0.730)); // Scroll by 53.0% (3D) or 73.0% (2D) of viewport width
    }
  };

  const handleRecentlyViewedTouchStart = (e: React.TouchEvent) => {
    setIsRecentlyViewedDragging(true);
    setRecentlyViewedStartX(e.touches[0].clientX);
    setRecentlyViewedStartScroll(recentlyViewedScroll);
  };

  const handleRecentlyViewedTouchMove = (e: React.TouchEvent) => {
    if (!isRecentlyViewedDragging) return;
    e.preventDefault();
    const currentX = e.touches[0].clientX;
    const diff = currentX - recentlyViewedStartX;
    const newPosition = recentlyViewedStartScroll + diff;
    
    const maxScroll = 0;
      const minScroll = -window.innerWidth * (is3DView ? 0.530 : 0.730); // Scroll by 53.0% (3D) or 73.0% (2D) of viewport width for optimal positioning
      setRecentlyViewedScroll(Math.max(minScroll, Math.min(maxScroll, newPosition)));
  };

  const handleRecentlyViewedTouchEnd = () => {
    setIsRecentlyViewedDragging(false);
    // Snap to nearest position
    if (recentlyViewedScroll > -window.innerWidth * (is3DView ? 0.265 : 0.365)) { // 53.0% (3D) or 73.0% (2D) / 2
      setRecentlyViewedScroll(0);
    } else {
      setRecentlyViewedScroll(-window.innerWidth * (is3DView ? 0.530 : 0.730)); // Scroll by 53.0% (3D) or 73.0% (2D) of viewport width
    }
  };

  // Arrow click handlers
  const handleSimilarProductsLeftArrow = () => {
    // Move to previous 2 products (scroll right) - snap to 0 position
    setSimilarProductsScroll(0);
  };

  const handleSimilarProductsRightArrow = () => {
    // Move to next 2 products (scroll left) - snap to 71.3% of viewport width
    setSimilarProductsScroll(-window.innerWidth * 0.713);
  };

  const handleRecentlyViewedLeftArrow = () => {
    // Move to previous 2 products (scroll right) - snap to 0 position
    setRecentlyViewedScroll(0);
  };

  const handleRecentlyViewedRightArrow = () => {
    // Move to next 2 products (scroll left) - snap to 71.3% of viewport width
    setRecentlyViewedScroll(-window.innerWidth * 0.713);
  };

  const handleMannequinClick = (viewIndex: number) => {
    setSelectedMannequinView(viewIndex);
  };

  const handleTopThumbnailClick = () => {
    if (selectedMannequinView === 0) {
      // Default state: swap hero (natural front) with top thumbnail (natural left)
      setSelectedMannequinView(1);
    } else if (selectedMannequinView === 1) {
      // Top view: return to default (natural front back to hero)
      setSelectedMannequinView(0);
    } else {
      // Bottom view: swap hero (natural right) with top thumbnail (natural left)
      setSelectedMannequinView(1);
    }
  };

  const handleBottomThumbnailClick = () => {
    if (selectedMannequinView === 0) {
      // Default state: swap hero (natural front) with bottom thumbnail (natural right)
      setSelectedMannequinView(2);
    } else if (selectedMannequinView === 1) {
      // Top view: swap hero (natural left) with bottom thumbnail (natural right)
      setSelectedMannequinView(2);
    } else {
      // Bottom view: return to default (natural front back to hero)
      setSelectedMannequinView(0);
    }
  };

  const handleAddToBag = async () => {
    if (addToBagState === 'adding' || addToBagState === 'added') return;
    
    setAddToBagState('adding');
    
    try {
      // Simulate adding to bag process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Set default product settings
      localStorage.setItem('selectedLength', '24"');
      localStorage.setItem('selectedLengthPrice', '0');
      localStorage.setItem('selectedDensity', '200%');
      localStorage.setItem('selectedDensityPrice', '0');
      localStorage.setItem('selectedLace', '13X6');
      localStorage.setItem('selectedLacePrice', '0');
      localStorage.setItem('selectedTexture', 'SILKY');
      localStorage.setItem('selectedTexturePrice', '0');
      localStorage.setItem('selectedColor', 'OFF BLACK');
      localStorage.setItem('selectedColorPrice', '0');
      localStorage.setItem('selectedHairline', 'NATURAL');
      localStorage.setItem('selectedHairlinePrice', '0');
      localStorage.setItem('selectedStyling', 'NONE');
      localStorage.setItem('selectedStylingPrice', '0');
      localStorage.setItem('selectedAddOns', '[]');
      localStorage.setItem('selectedAddOnsPrice', '0');
      
      // Use the currently selected cap size
      if (selectedCustomCap) {
        localStorage.setItem('selectedCapSize', selectedCustomCap);
        localStorage.setItem('selectedCapSizePrice', '0'); // Custom cap has no additional price
      } else if (selectedFlexibleCap) {
        localStorage.setItem('selectedCapSize', selectedFlexibleCap);
        localStorage.setItem('selectedCapSizePrice', '60'); // Flexible cap has $60 additional price
      } else {
        // Default to M if no cap size is selected
        localStorage.setItem('selectedCapSize', 'M');
        localStorage.setItem('selectedCapSizePrice', '0');
      }
      
      // Calculate full price including all customizations
      const calculateFullPrice = () => {
        // Get cap size to determine base price
        const capSize = localStorage.getItem('selectedCapSize') || 'M';
        
        // Calculate base price based on cap size
        let basePrice = 740; // Default for standard caps (XS, S, M, L)
        if (capSize === 'XXS/XS/S' || capSize === 'S/M/L') {
          basePrice = 780; // Flexible cap options cost $40 extra
        }
        
        // Add color price - use stored price or calculate from color name
        let colorPrice = parseInt(localStorage.getItem('selectedColorPrice') || '0');
        
        // If no stored price, calculate it from the color name
        if (colorPrice === 0) {
          const selectedColor = localStorage.getItem('selectedColor') || 'OFF BLACK';
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
          colorPrice = colorPrices[selectedColor] || 0;
          
          // Add extra $40 for lengths over 30" (excluding OFF BLACK)
          if (selectedColor !== 'OFF BLACK') {
            const selectedLength = localStorage.getItem('selectedLength') || '24"';
            const longLengths = ['30"', '32"', '34"', '36"', '40"'];
            if (longLengths.includes(selectedLength)) {
              colorPrice += 40;
            }
          }
        }
        
        // Add length price
        const lengthPrice = parseInt(localStorage.getItem('selectedLengthPrice') || '0');
        
        // Add density price
        const densityPrice = parseInt(localStorage.getItem('selectedDensityPrice') || '0');
        
        // Add lace price
        const lacePrice = parseInt(localStorage.getItem('selectedLacePrice') || '0');
        
        // Add texture price
        const texturePrice = parseInt(localStorage.getItem('selectedTexturePrice') || '0');
        
        // Add hairline price
        const hairlinePrice = parseInt(localStorage.getItem('selectedHairlinePrice') || '0');
        
        // Add styling price
        const stylingPrice = parseInt(localStorage.getItem('selectedStylingPrice') || '0');
        
        // Add add-ons price
        const addOnsPrice = parseInt(localStorage.getItem('selectedAddOnsPrice') || '0');
        
        return basePrice + colorPrice + lengthPrice + densityPrice + lacePrice + texturePrice + hairlinePrice + stylingPrice + addOnsPrice;
      };
      
      // Create cart item with actual product details and full calculated price
      const cartItem = {
        id: `noir-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: 'NOIR',
        price: calculateFullPrice(), // Use full calculated price
        quantity: quantity,
        image: '/assets/NOIR/noir-thumb.png',
        capSize: localStorage.getItem('selectedCapSize') || 'M',
        length: localStorage.getItem('selectedLength') || '24"',
        density: localStorage.getItem('selectedDensity') || '200%',
        color: localStorage.getItem('selectedColor') || 'OFF BLACK',
        texture: localStorage.getItem('selectedTexture') || 'SILKY',
        lace: localStorage.getItem('selectedLace') || '13X6',
        hairline: localStorage.getItem('selectedHairline') || 'NATURAL',
        styling: localStorage.getItem('selectedStyling') || 'NONE',
        partSelection: localStorage.getItem('selectedPartSelection') || 'MIDDLE',
        addOns: JSON.parse(localStorage.getItem('selectedAddOns') || '[]')
      };

      // Get existing cart items and add new item
      const existingCartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      const updatedCartItems = [...existingCartItems, cartItem];
      localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));

      // Update cart count
      const currentCount = parseInt(localStorage.getItem('cartCount') || '0');
      const newCount = currentCount + quantity; // Add quantity instead of just 1
      localStorage.setItem('cartCount', newCount.toString());
      setCartCount(newCount);
      
      // Save button state and the specific item ID that was added
      setAddToBagState('added');
      localStorage.setItem('addToBagButtonState', 'added');
      localStorage.setItem('lastAddedItemId', cartItem.id); // Track the specific item ID
      
      // Dispatch cart count update event
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: newCount }));
      }, 100);
      
    } catch (error) {
      console.error('Error in handleAddToBag:', error);
      setAddToBagState('idle'); // Reset to idle on error
    }
  };

  const handleConfirmSelection = () => {
    localStorage.setItem('selectedDensity', selectedDensity);
    localStorage.setItem('selectedDensityPrice', getSelectedPrice().toString());
    
    // Store the selected cap size in localStorage for build-a-wig page
    if (selectedCustomCap) {
      localStorage.setItem('selectedCapSize', selectedCustomCap);
      localStorage.setItem('selectedCapSizePrice', '0'); // Custom cap has no additional price
    } else if (selectedFlexibleCap) {
      localStorage.setItem('selectedCapSize', selectedFlexibleCap);
      localStorage.setItem('selectedCapSizePrice', '0'); // Flexible cap extra cost is included in base price
    }
    
    navigate('/build-a-wig');
  };

  const getSelectedPrice = () => {
    const selected = densityOptions.find(option => option.id === selectedDensity);
    return selected ? selected.price : 0;
  };

  // Get dynamic density note text based on selected length and density
  const getDensityNoteText = () => {
    const selectedLength = localStorage.getItem('selectedLength') || '24"';
    // Use local state instead of localStorage for live updates
    const currentDensity = selectedDensity;
    
    // For 130% density, show grams based on length
    if (currentDensity === '130%') {
      const lengthToGrams: { [key: string]: string } = {
        '16"': '98',
        '18"': '112',
        '20"': '122',
        '22"': '125',
        '24"': '135',
        '26"': '140',
        '28"': '145',
        '30"': '150',
        '32"': '155',
        '34"': '160',
        '36"': '165',
        '40"': '175'
      };
      
      const grams = lengthToGrams[selectedLength] || '135'; // Default to 24" if not found
      return (
        <>
          EQUIVALENT TO {grams} GRAMS.<br />
          100 GRAMS = 1 BUNDLE, EXCLUDING LACE.
        </>
      );
    }
    
    // For 150% density, show grams based on length
    if (currentDensity === '150%') {
      const lengthToGrams: { [key: string]: string } = {
        '16"': '113',
        '18"': '129',
        '20"': '142',
        '22"': '145',
        '24"': '155',
        '26"': '160',
        '28"': '165',
        '30"': '170',
        '32"': '175',
        '34"': '180',
        '36"': '185',
        '40"': '195'
      };
      
      const grams = lengthToGrams[selectedLength] || '155'; // Default to 24" if not found
      return (
        <>
          EQUIVALENT TO {grams} GRAMS.<br />
          100 GRAMS = 1 BUNDLE, EXCLUDING LACE.
        </>
      );
    }
    
    // For 180% density, show grams based on length
    if (currentDensity === '180%') {
      const lengthToGrams: { [key: string]: string } = {
        '16"': '130',
        '18"': '147',
        '20"': '162',
        '22"': '165',
        '24"': '175',
        '26"': '180',
        '28"': '185',
        '30"': '190',
        '32"': '195',
        '34"': '200',
        '36"': '205',
        '40"': '215'
      };
      
      const grams = lengthToGrams[selectedLength] || '175'; // Default to 24" if not found
      return (
        <>
          EQUIVALENT TO {grams} GRAMS.<br />
          100 GRAMS = 1 BUNDLE, EXCLUDING LACE.
        </>
      );
    }
    
    // For 250% density, show grams based on length
    if (currentDensity === '250%') {
      const lengthToGrams: { [key: string]: string } = {
        '16"': '190',
        '18"': '217',
        '20"': '232',
        '22"': '245',
        '24"': '255',
        '26"': '264',
        '28"': '269',
        '30"': '274',
        '32"': '279',
        '34"': '284',
        '36"': '289',
        '40"': '297'
      };
      
      const grams = lengthToGrams[selectedLength] || '255'; // Default to 24" if not found
      return (
        <>
          EQUIVALENT TO {grams} GRAMS.<br />
          100 GRAMS = 1 BUNDLE, EXCLUDING LACE.
        </>
      );
    }
    
    // For 300% density, show grams based on length
    if (currentDensity === '300%') {
      const lengthToGrams: { [key: string]: string } = {
        '16"': '220',
        '18"': '252',
        '20"': '267',
        '22"': '285',
        '24"': '295',
        '26"': '306',
        '28"': '311',
        '30"': '316',
        '32"': '321',
        '34"': '326',
        '36"': '331',
        '40"': '341'
      };
      
      const grams = lengthToGrams[selectedLength] || '295'; // Default to 24" if not found
      return (
        <>
          EQUIVALENT TO {grams} GRAMS.<br />
          100 GRAMS = 1 BUNDLE, EXCLUDING LACE.
        </>
      );
    }
    
    // For 350% density, show grams based on length
    if (currentDensity === '350%') {
      const lengthToGrams: { [key: string]: string } = {
        '16"': '250',
        '18"': '287',
        '20"': '302',
        '22"': '325',
        '24"': '335',
        '26"': '348',
        '28"': '353',
        '30"': '358',
        '32"': '363',
        '34"': '368',
        '36"': '373',
        '40"': '383'
      };
      
      const grams = lengthToGrams[selectedLength] || '335'; // Default to 24" if not found
      return (
        <>
          EQUIVALENT TO {grams} GRAMS.<br />
          100 GRAMS = 1 BUNDLE, EXCLUDING LACE.
        </>
      );
    }
    
    // For 400% density, show grams based on length
    if (currentDensity === '400%') {
      const lengthToGrams: { [key: string]: string } = {
        '16"': '280',
        '18"': '322',
        '20"': '337',
        '22"': '365',
        '24"': '375',
        '26"': '390',
        '28"': '395',
        '30"': '400',
        '32"': '400',
        '34"': '400',
        '36"': '400',
        '40"': '400'
      };
      
      const grams = lengthToGrams[selectedLength] || '375'; // Default to 24" if not found
      return (
        <>
          EQUIVALENT TO {grams} GRAMS.<br />
          100 GRAMS = 1 BUNDLE, EXCLUDING LACE.
        </>
      );
    }
    
    // For 200% density, show grams based on length
    if (currentDensity === '200%') {
      const lengthToGrams: { [key: string]: string } = {
        '16"': '160',
        '18"': '182',
        '20"': '197',
        '22"': '205',
        '24"': '215',
        '26"': '222',
        '28"': '227',
        '30"': '232',
        '32"': '237',
        '34"': '242',
        '36"': '247',
        '40"': '257'
      };
      
      const grams = lengthToGrams[selectedLength] || '215'; // Default to 24" if not found
      return (
        <>
          EQUIVALENT TO {grams} GRAMS.<br />
          100 GRAMS = 1 BUNDLE, EXCLUDING LACE.
        </>
      );
    }
    
    // For other densities, return default text
    return 'PLEASE NOTE: EACH CUSTOM UNIT IS MADE TO ORDER. WE ENSURE ALL DETAILS ARE ACCURATE + PRECISE. EXPECT 6 - 8 WEEKS OF PROCESSING TIME FOR THIS UNIT.';
  };

  const getTotalPrice = () => {
    const basePrice = 740;
    const densityPrice = getSelectedPrice();
    const flexibleCapPrice = selectedFlexibleCap ? 40 : 0;
    
    // If flexible cap is selected, use base price + flexible cap price
    if (selectedFlexibleCap) {
      return basePrice + flexibleCapPrice;
    }
    
    // If custom cap is selected, use base price only (no density surcharge)
    if (selectedCustomCap) {
      return basePrice;
    }
    
    // Default: base price + density price
    return basePrice + densityPrice;
  };

  const totalPrice = getTotalPrice();

  useEffect(() => {
    // Hide loading screen after 2 seconds
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Listen for changes in selected length and density to update note text
  useEffect(() => {
    const handleStorageChange = () => {
      // Force re-render when length or density changes
      setSelectedDensity(localStorage.getItem('selectedDensity') || '200%');
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // DEBUG: Add visible debugging colors
  console.log('NoirSelection render - showLoading:', showLoading);
  console.log('NoirSelection render - currentImages:', currentImages);
  console.log('NoirSelection render - current3DImages:', current3DImages);

  return (
    <>
      {/* DEBUG: Bright red banner at top to see if component renders */}
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        height: '120px',
        backgroundColor: 'red', 
        zIndex: 99999,
        padding: '20px',
        color: 'white',
        fontSize: '32px',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        border: '5px solid yellow',
        boxShadow: '0 0 20px black'
      }}>
        🔴 DEBUG: NoirSelection Component IS RENDERING! 🔴
        <br />
        <span style={{ fontSize: '18px' }}>
          showLoading: {String(showLoading)} | Images: {String(!!currentImages)} | 3D: {String(!!current3DImages)}
        </span>
      </div>
      
      {showLoading && <LoadingScreen />}
      
      
      <div className="min-h-screen" style={{
        position: 'relative',
        backgroundColor: 'yellow', // DEBUG: Yellow background
        marginTop: '120px' // Space for debug banner
      }}>
        {/* Fixed Background Layer */}
        <div 
          className="fixed inset-0 -z-10"
          style={{
            backgroundImage: `url('/assets/Marble Floor.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center calc(50% + 25px)',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
            backgroundColor: 'blue' // DEBUG: Blue fallback
          }}
        ></div>
        
        {/* Scrollable Content */}
        <div className="relative z-10" style={{ backgroundColor: 'green' }}> {/* DEBUG: Green background */}
          {/* MAIN CONTENT */}
          <div className="flex flex-col py-5 px-4" style={{ minWidth: '100%', maxWidth: 'none', overflow: 'visible', backgroundColor: 'orange' }}> {/* DEBUG: Orange background */}
        {/* HEADER */}
        <div
          className="border-solid border-black flex justify-center items-center py-3 w-full mb-5 px-5 bg-white/60 backdrop-blur-sm relative"
          style={{ border: '1.3px solid black', backgroundColor: 'purple' }} // DEBUG: Purple background
        >
          {/* DEBUG: Cyan background for button area */}
          <div className="flex gap-5 absolute left-4" style={{ backgroundColor: 'cyan' }}>
            <button 
              onClick={handleBack} 
              className="cursor-pointer"
              style={{ height: '15px !important', width: '21px !important', padding: '0 !important', border: 'none !important', background: 'magenta !important' }}
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
          </div>
          <p className="text-sm" style={{ fontFamily: '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif' }}>
            <span 
                style={{ fontFamily: '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif', fontWeight: '400', cursor: 'pointer' }}
              onClick={() => {
                // Store the selected cap size in localStorage for build-a-wig page
                if (selectedCustomCap) {
                  localStorage.setItem('selectedCapSize', selectedCustomCap);
                  localStorage.setItem('selectedCapSizePrice', '0'); // Custom cap has no additional price
                } else if (selectedFlexibleCap) {
                  localStorage.setItem('selectedCapSize', selectedFlexibleCap);
                  localStorage.setItem('selectedCapSizePrice', '60'); // Flexible cap has $60 additional price
                }
                navigate('/build-a-wig');
              }}
            >
              STRAIGHT &gt;
            </span>{' '}
            <span
              style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontWeight: '500' }}
            >
              NOIR
            </span>
          </p>
          <div className="gap-5 flex absolute" style={{ right: '17px' }}>
            <div>
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

        {/* MOBILE MENU POP-UP */}
        {showMobileMenu && (
          <div 
            className="fixed inset-0 z-50"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(5px)'
            }}
            onClick={handleCloseMobileMenu}
          >
            <div 
              className="fixed inset-0 w-full h-full"
              style={{
                backgroundImage: 'url("/assets/Marble Floor.jpg")',
                backgroundSize: '500%',
                backgroundPosition: 'center 60%',
                backgroundRepeat: 'no-repeat'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glassmorphism Container */}
              <div 
                className="border border-black bg-white/60 backdrop-blur-sm"
                style={{ 
                  borderWidth: '1.3px',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '90%',
                  height: 'calc(80% + 120px)',
                padding: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                willChange: 'backdrop-filter'
                }}
              >
                {/* Close Button */}
                <button
                  onClick={handleCloseMobileMenu}
                  className="absolute z-10"
                  style={{
                    top: '9px',
                    right: '9px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px'
                  }}
                >
                  <img
                    src="/assets/close-icon.svg"
                    alt="Close"
                    style={{ width: '21px', height: '21px' }}
                  />
                </button>

              {/* Top Icons and Currency */}
              <div className="absolute top-16 left-6 right-6 flex justify-between items-center z-10">
                {/* Top Icons */}
                <div className="flex gap-4">
                <div className="flex items-center" style={{ transform: 'translateY(1px)' }}>
                  <DynamicCartIcon count={cartCount} width={28} height={23} />
                </div>
                {isSignedIn ? (
                <img
                  src="/assets/NOIR/account-wishlist.svg"
                  alt="Wishlist"
                  style={{ width: '21px', height: '21px', transform: 'translateY(4px) translateX(-1px)' }}
                />
                ) : (
                  <img
                    src="/assets/wishlist-heart.svg"
                    alt="Wishlist"
                    style={{ width: '21px', height: '21px', transform: 'translateY(4px) translateX(-1px)' }}
                  />
                )}
                <img
                  src="/assets/NOIR/account-icon.svg"
                  alt="Account"
                  style={{ width: '21px', height: '21px', transform: 'translateY(4px)' }}
                />
                </div>
                
                {/* Currency Selector */}
                <div className="flex items-center gap-2">
                  <span style={{ 
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    fontSize: '14px',
                    color: 'black',
                    fontWeight: '500'
                  }}>
                    $ USD
                  </span>
                  <img
                    src="/assets/NOIR/down-arrow.svg"
                    alt="Currency"
                    style={{ width: '14px', height: '14px' }}
                  />
                </div>
              </div>

              {/* Navigation Links */}
              <div className="absolute top-24 left-1/2 transform -translate-x-1/2 flex gap-8 z-10" style={{ marginTop: '30px' }}>
                <button
                  onClick={() => handleMobileMenuTabClick('SHOP')}
                  style={{ 
                    fontFamily: mobileMenuActiveTab === 'SHOP' ? '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' : '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif',
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
                    fontFamily: mobileMenuActiveTab === 'TOOLS' ? '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' : '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif',
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
                    fontFamily: mobileMenuActiveTab === 'BRAND' ? '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' : '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif',
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
              <div className="absolute top-40 right-6 z-10" style={{ marginTop: '15px', left: '27px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
                  {mobileMenuActiveTab === 'TOOLS' ? (
                    ['GIFT CARD'].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                <span style={{ 
                          fontFamily: '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif',
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
                          fontFamily: '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif',
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
                    // SHOP tab with dropdown functionality
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
                          onClick={() => item.isExpandable ? handleMobileMenuItemToggle(item.label) : null}
                        >
                      <span style={{ 
                            fontFamily: '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif',
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
                              <div key={subIndex} className="flex items-center">
                                <span style={{ 
                                  fontFamily: '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif',
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
              <div className="absolute left-1/2 transform -translate-x-1/2 z-10" style={{ bottom: '86px' }}>
                <span 
                  onClick={handleMobileMenuSignInToggle}
                  style={{ 
                  fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
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
                <div className="absolute left-1/2 transform -translate-x-1/2 z-10" style={{ bottom: '37px' }}>
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
          </div>
        )}

        {/* MAIN BUILD AREA */}
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
            willChange: 'backdrop-filter'
          }}
        >
          {/* WIG PREVIEW */}
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', flexDirection: 'column', marginBottom: '24px', transform: 'translateY(20px)', overflow: 'visible', minWidth: '100%', maxWidth: 'none' }}>
            {/* ADD TO WISHLIST & PHOTO COUNT */}
            <div style={{ position: 'relative', width: '100%', marginBottom: '10px', transform: 'translateY(-31px)' }}>
              {/* ADD TO WISHLIST - Top Left */}
              <p 
                style={{ 
                  position: 'absolute', 
                  left: '8px', 
                  top: '2px', 
                  color: '#909090', 
                  fontFamily: '"Futura PT Demi", futuristic-pt, Futura, Inter, sans-serif',
                  fontSize: '10px',
                  fontWeight: '600',
                  margin: '0'
                }}
              >
                + ADD TO WISHLIST
              </p>
              
              {/* 2D VIEW/3D VIEW TOGGLE - Top Right */}
              <div 
                style={{ 
                  position: 'absolute', 
                  right: '8px', 
                  top: '1px', 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  const new3DView = !is3DView;
                  setIs3DView(new3DView);
                  localStorage.setItem('noir-3d-view', new3DView.toString());
                }}
              >
                <span 
                  style={{ 
                    color: is3DView ? '#000000' : '#EB1C24', 
                    fontFamily: is3DView ? '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif' : '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    fontSize: '11px',
                    fontWeight: is3DView ? '400' : '500',
                    margin: '0'
                  }}
                >
                  2D VIEW
                </span>
                <span 
                  style={{ 
                    color: '#000000', 
                    fontFamily: '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif',
                    fontSize: '11px',
                    fontWeight: '400',
                    margin: '0'
                  }}
                >
                  /
                </span>
                <span 
                  style={{ 
                    color: is3DView ? '#EB1C24' : '#000000', 
                    fontFamily: is3DView ? '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' : '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif',
                    fontSize: '11px',
                    fontWeight: is3DView ? '500' : '400',
                    margin: '0'
                  }}
                >
                  3D VIEW
                </span>
              </div>
            </div>
            
            {/* MANNEQUIN LAYOUT - Hero on left, Top + Bottom stacked on right */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: is3DView ? '10px' : '5px', marginBottom: '16px', overflow: 'visible', margin: '0 auto', transform: 'translateY(-19px)' }}>
              {/* Hero Mannequin - Left Side with leaf-brick background */}
              <div style={{ position: 'relative', overflow: 'visible', flexShrink: '0' }}>
                <div
                  style={{
                    position: 'relative',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '200px',
                    height: '290px',
                    backgroundImage: `url('/assets/NOIR/${is3DView ? current3DImages.hero : 'leaf-brick.png'}')`,
                    backgroundRepeat: 'no-repeat',
                    overflow: 'visible'
                  }}
                >
                  <img
                    src={currentImages.hero}
                    alt=""
                    style={{ 
                      position: 'absolute',
                      left: '50%',
                      top: 'calc(50% - 10.601px + 12px)',
                      transform: 'translateX(-50%) translateY(-50%)',
                      zIndex: '10',
                      width: '230px',
                      height: 'auto',
                      maxHeight: '610px',
                      minWidth: '230px',
                      minHeight: 'auto',
                      display: is3DView ? 'none' : 'block'
                    }}
                  />
                </div>
              </div>
              
              {/* Top and Bottom Mannequins - Right Side */}
              <div className="flex flex-col" style={{ height: '290px', justifyContent: 'space-between', gap: '10px' }}>
                {/* Top Mannequin */}
                <div className="flex-shrink-0 relative">
                  <div
                    className="relative bg-cover bg-center flex items-center justify-center cursor-pointer"
                    style={{
                      width: '100px',
                      height: '140px',
                      backgroundImage: `url('/assets/NOIR/${is3DView ? current3DImages.top : 'leaf-brick.png'}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                    onClick={handleTopThumbnailClick}
                  >
                    <img
                      src={currentImages.top}
                      alt=""
                      className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
                      style={{ 
                        top: 'calc(50% - 6.1px + 7.2px + 10px - 3px - 6px - 0.6px)',
                        width: '112px',
                        height: '137px',
                        maxWidth: 'none',
                        maxHeight: 'none',
                        minWidth: '112px',
                        minHeight: '137px',
                        display: is3DView ? 'none' : 'block'
                      }}
                    />
                  </div>
                </div>
                
                {/* Bottom Mannequin */}
                <div className="flex-shrink-0 relative">
                  <div
                    className="relative bg-cover bg-center flex items-center justify-center cursor-pointer"
                    style={{
                      width: '100px',
                      height: '140px',
                      backgroundImage: `url('/assets/NOIR/${is3DView ? current3DImages.bottom : 'leaf-brick.png'}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                    onClick={handleBottomThumbnailClick}
                  >
                    <img
                      src={currentImages.bottom}
                      alt=""
                      className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
                      style={{ 
                        top: 'calc(50% - 6.1px + 7.2px + 10px - 3px - 6px - 0.6px)',
                        width: '112px',
                        height: '137px',
                        maxWidth: 'none',
                        maxHeight: 'none',
                        minWidth: '112px',
                        minHeight: '137px',
                        display: is3DView ? 'none' : 'block'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* CHART MODAL OVERLAY */}
            {showChartModal && (
              <div 
                style={{
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  right: '0',
                  bottom: '0',
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: '1000',
                  borderRadius: '8px'
                }}
                onClick={handleCloseChart}
              >
                <div 
                  style={{
                    position: 'relative',
                    maxWidth: '90%',
                    maxHeight: '90%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <img
                    src="/assets/NOIR/chart.png"
                    alt="Enlarged Cap Size Chart"
                    style={{ 
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      borderRadius: '4px'
                    }}
                  />
                  <button
                    onClick={handleCloseChart}
                    style={{
                      position: 'absolute',
                      top: '-10px',
                      right: '-10px',
                      backgroundColor: 'white',
                      border: '2px solid black',
                      borderRadius: '50%',
                      width: '30px',
                      height: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* DISCLAIMER TEXT */}
            <p
              className="text-center uppercase mb-2"
              style={{ 
                fontFamily: '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif',
                fontSize: '11px',
                fontWeight: '400',
                transform: 'translateY(-13px)',
                color: 'black'
              }}
            >
              (3D MODEL IS FOR <span style={{ color: '#909090', fontFamily: '"Futura PT Demi", futuristic-pt, Futura, Inter, sans-serif' }}>VISUAL & AESTHETIC</span> PURPOSES ONLY)
            </p>

            {/* PRODUCT NAME */}
            <p
              className="text-center text-black mb-2 noir-product-name"
              style={{ 
                fontFamily: '"Covered By Your Grace", cursive !important',
                fontSize: '50px !important',
                fontWeight: '400 !important',
                lineHeight: '1.2 !important',
                margin: '0 !important',
                padding: '0 !important',
                display: 'block !important',
                textAlign: 'center !important',
                height: 'auto !important',
                maxHeight: 'none !important',
                width: '100% !important',
                minWidth: 'auto !important',
                maxWidth: 'none !important',
                overflow: 'visible !important',
                whiteSpace: 'nowrap !important',
                position: 'relative !important',
                zIndex: '999 !important',
                transform: 'translateY(-8px) !important',
                scale: '1 !important',
                zoom: '1 !important'
              }}
            >
              NOIR
            </p>

            {/* PRODUCT SPECIFICATION */}
            <p
              className="text-center text-red-500 uppercase mb-2"
              style={{ 
                fontFamily: '"Futura PT", futuristic-pt, Futura, Inter, sans-serif',
                fontSize: '10px',
                fontWeight: '500',
                transform: 'translateY(-8px)'
              }}
            >
              24" RAW CAMBODIAN
            </p>

            {/* PRICE */}
            <p
              className="text-center text-black mb-1"
              style={{ 
                fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                fontSize: '21px',
                fontWeight: '500',
                transform: 'translateY(-16px)'
              }}
              dangerouslySetInnerHTML={formatPrice(totalPrice)}
            />

            {/* TAX DISCLAIMER */}
            <p
              className="text-center text-black mb-3"
              style={{ 
                fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                fontSize: '10px',
                fontWeight: '500',
                transform: 'translateY(-21px)'
              }}
            >
              (EXCLUDING SALES TAX)
            </p>

            {/* STAR RATINGS */}
            <div className="flex justify-center mb-4 gap-1" style={{ transform: 'translateY(-27px)' }}>
              {[...Array(5)].map((_, index) => (
              <img
                  key={index}
                  src="/assets/NOIR/star-symbol.png"
                  alt="Star Rating"
                className="w-auto h-auto"
                  style={{ 
                    width: '15px', 
                    height: '15px',
                    filter: 'drop-shadow(0 0 0 1px black)',
                    stroke: '1px black'
                  }}
                />
              ))}
            </div>

            {/* PAYMENT PLAN */}
            <p
              className="text-center uppercase"
              style={{ 
                fontFamily: '"Futura PT Demi", futuristic-pt, Futura, Inter, sans-serif',
                fontSize: '10px',
                fontWeight: '600',
                color: '#909090',
                transform: 'translateY(-34px)'
              }}
            >
              OR 4 PAYMENTS OF <span dangerouslySetInnerHTML={formatPrice(selectedFlexibleCap ? 195 : selectedCustomCap ? Math.ceil(getTotalPrice() / 4) : 185)} /> WITH <span style={{ fontWeight: '600', color: '#EB1C24' }}>KLARNA</span>
            </p>
          </div>

          {/* Back Button - Moved outside centered preview area */}
            <div className="flex justify-start ml-[calc(50%-131px)]">
          </div>

          {/* CAP SIZE SELECTION HEADER */}
          <div style={{ transform: 'translateY(-10px)' }}>
            <p
              className="text-center text-black uppercase mb-4"
              style={{ 
                fontFamily: '"Futura PT Demi", futuristic-pt, Futura, Inter, sans-serif',
                fontSize: '11px',
                fontWeight: '500',
                transform: 'translateY(0px)'
              }}
            >
              SELECT CAP SIZE
            </p>

          {/* CAP SIZE MEASUREMENTS */}
          <div className="flex justify-center gap-4 mb-6" style={{ transform: 'translateY(-7px)' }}>
            <span className="text-red-500 font-bold" style={{ fontSize: '10px', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' }}>XXS: 19"</span>
            <span className="text-red-500 font-bold" style={{ fontSize: '10px', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' }}>XS: 20"</span>
            <span className="text-red-500 font-bold" style={{ fontSize: '10px', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' }}>S: 21"</span>
            <span className="text-red-500 font-bold" style={{ fontSize: '10px', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' }}>M: 22"</span>
            <span className="text-red-500 font-bold" style={{ fontSize: '10px', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' }}>L: 23"</span>
          </div>

          {/* CUSTOM CAP SECTION */}
          <div className="mb-6">
            <p
              className="text-center text-black mb-4"
              style={{ 
                fontFamily: '"Bohemy", cursive',
                fontSize: '20px',
                fontWeight: '400',
                transform: 'translateY(-16px)'
              }}
            >
              custom cap
            </p>
            <div className="flex justify-center gap-3" style={{ transform: 'translateY(-24px)' }}>
              <button 
                onClick={() => handleCustomCapSelect('XS')}
                className={`border border-black px-6 py-1 ${selectedCustomCap === 'XS' ? 'text-red-500 bg-white' : 'text-black bg-white hover:bg-gray-50'}`}
                style={{ 
                  borderWidth: '1.3px',
                  fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                  fontWeight: '500',
                  minWidth: '60px',
                  fontSize: '11px'
                }}
              >
                XS
              </button>
              <button 
                onClick={() => handleCustomCapSelect('S')}
                className={`border border-black px-6 py-1 ${selectedCustomCap === 'S' ? 'text-red-500 bg-white' : 'text-black bg-white hover:bg-gray-50'}`}
                style={{ 
                  borderWidth: '1.3px',
                  fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                  fontWeight: '500',
                  minWidth: '60px',
                  fontSize: '11px'
                }}
              >
                S
              </button>
              <button 
                onClick={() => handleCustomCapSelect('M')}
                className={`border border-black px-6 py-1 ${selectedCustomCap === 'M' ? 'text-red-500 bg-white' : 'text-black bg-white hover:bg-gray-50'}`}
                style={{ 
                  borderWidth: '1.3px',
                  fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                  fontWeight: '500',
                  minWidth: '60px',
                  fontSize: '11px'
                }}
              >
                M
              </button>
              <button 
                onClick={() => handleCustomCapSelect('L')}
                className={`border border-black px-6 py-1 ${selectedCustomCap === 'L' ? 'text-red-500 bg-white' : 'text-black bg-white hover:bg-gray-50'}`}
                style={{ 
                  borderWidth: '1.3px',
                  fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                  fontWeight: '500',
                  minWidth: '60px',
                  fontSize: '11px'
                }}
              >
                L
              </button>
            </div>
          </div>

          {/* FLEXIBLE CAP SECTION */}
          <div className="mb-6">
            <p
              className="text-center text-black mb-4"
              style={{ 
                fontFamily: '"Bohemy", cursive',
                fontSize: '20px',
                fontWeight: '400',
                transform: 'translateY(-24px)'
              }}
            >
              flexible cap
            </p>
            <div className="flex justify-center gap-3" style={{ transform: 'translateY(-32px)' }}>
              <button 
                onClick={() => handleFlexibleCapSelect('XXS/XS/S')}
                className="flexible-cap-button"
                style={{ 
                  border: '1.3px solid black',
                  paddingTop: '4px',
                  paddingBottom: '4px',
                  paddingLeft: '8px',
                  paddingRight: '8px',
                  fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                  fontWeight: '500',
                  width: '108px !important',
                  minWidth: '108px !important',
                  maxWidth: '108px !important',
                  fontSize: '11px',
                  boxSizing: 'border-box !important',
                  backgroundColor: selectedFlexibleCap === 'XXS/XS/S' ? 'white' : 'white',
                  color: selectedFlexibleCap === 'XXS/XS/S' ? '#EB1C24' : 'black',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center'
                }}
              >
                XXS/XS/S
              </button>
              <button 
                onClick={() => handleFlexibleCapSelect('S/M/L')}
                className="flexible-cap-button"
                style={{ 
                  border: '1.3px solid black',
                  paddingTop: '4px',
                  paddingBottom: '4px',
                  paddingLeft: '8px',
                  paddingRight: '8px',
                  fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                  fontWeight: '500',
                  width: '108px !important',
                  minWidth: '108px !important',
                  maxWidth: '108px !important',
                  fontSize: '11px',
                  boxSizing: 'border-box !important',
                  backgroundColor: selectedFlexibleCap === 'S/M/L' ? 'white' : 'white',
                  color: selectedFlexibleCap === 'S/M/L' ? '#EB1C24' : 'black',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center'
                }}
              >
                S/M/L
              </button>
            </div>
          </div>

          {/* QUANTITY SELECTOR */}
          <div className="flex justify-center mb-6" style={{ transform: 'translateY(-30px)' }}>
            <button 
              onClick={handleQuantityDecrease}
              disabled={quantity <= 1}
              className={`px-3 py-1 text-red-500 bg-white hover:bg-gray-50 quantity-minus-btn flex items-center justify-center ${quantity <= 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              style={{ 
                borderTop: '1.3px solid black !important',
                borderLeft: '1.3px solid black !important', 
                borderBottom: '1.3px solid black !important',
                borderRight: 'none !important',
                height: '27px',
                minHeight: '27px',
                maxHeight: '27px',
                boxSizing: 'border-box',
                outline: 'none',
                border: 'none !important',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <span style={{ fontFamily: 'Cascadia Code, monospace', fontSize: '11px' }}>-</span>
            </button>
            <div 
              className="px-4 py-1 text-black bg-white flex items-center justify-center relative quantity-number" 
              style={{ 
                borderTop: '1.3px solid black !important',
                borderBottom: '1.3px solid black !important',
                borderLeft: 'none !important',
                borderRight: 'none !important',
                fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', 
                fontWeight: '500', 
                fontSize: '12px', 
                height: '27px',
                minHeight: '27px',
                maxHeight: '27px',
                boxSizing: 'border-box',
                border: 'none !important'
              }}
            >
              <div className="absolute left-0 top-0 bottom-0 w-px bg-black"></div>
              <div className="absolute right-0 top-0 bottom-0 w-px bg-black"></div>
              {quantity}
            </div>
            <button 
              onClick={handleQuantityIncrease}
              disabled={quantity >= 10}
              className={`px-3 py-1 text-red-500 bg-white hover:bg-gray-50 quantity-plus-btn flex items-center justify-center ${quantity >= 10 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              style={{ 
                borderTop: '1.3px solid black !important',
                borderRight: '1.3px solid black !important',
                borderBottom: '1.3px solid black !important',
                borderLeft: 'none !important',
                height: '27px',
                minHeight: '27px',
                maxHeight: '27px',
                boxSizing: 'border-box',
                outline: 'none',
                border: 'none !important',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <span style={{ fontFamily: 'Cascadia Code, monospace', fontSize: '11px' }}>+</span>
            </button>
        </div>

          {/* CAP SIZE CHART IMAGE - Centered below quantity selector */}
          <div className="flex justify-center mt-4" style={{ transform: 'translateX(4px) translateY(-27px)' }}>
            <img
              src="/assets/NOIR/cap-size-chart.png"
              alt="Cap Size Chart"
              style={{ maxWidth: '194px', maxHeight: '154px', cursor: 'pointer' }}
              onClick={handleChartClick}
            />
          </div>

          {/* PRODUCT SHOTS SECTION */}
          <div className="mt-8 mb-6" style={{ transform: 'translateY(-34px)' }}>
            {/* Product Images with Drag/Swipe Scroll */}
            <div className="relative overflow-hidden" style={{ height: '300px' }}>
              <div 
                className="flex transition-transform duration-300 ease-out"
                style={{ 
                  width: '300%',
                  transform: `translateX(${scrollPosition}px)`,
                  gap: '11px'
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <img
                  src="/assets/NOIR/noir front.png"
                  alt="NOIR Front View"
                  className="h-full object-cover"
                  style={{ width: '18%' }}
                  draggable={false}
                />
                <img
                  src="/assets/NOIR/noir left.png"
                  alt="NOIR Left View"
                  className="h-full object-cover"
                  style={{ width: '18%' }}
                  draggable={false}
                />
                <img
                  src="/assets/NOIR/noir right.png"
                  alt="NOIR Right View"
                  className="h-full object-cover"
                  style={{ width: '18%' }}
                  draggable={false}
                />
              </div>
              
              {/* Product Shots Text Overlay */}
              <div 
                className="absolute left-1/2 transform -translate-x-1/2"
                style={{
                  bottom: '14px',
                  fontFamily: '"Bohemy", cursive',
                  fontSize: '43px',
                  color: 'white',
                  textShadow: '1px 1px 0px black, -1px 1px 0px black, 1px -1px 0px black, -1px -1px 0px black, 1px 0px 0px black, -1px 0px 0px black, 0px 1px 0px black, 0px -1px 0px black',
                  fontWeight: '400',
                  textAlign: 'center',
                  zIndex: 10,
                  width: '200px',
                  whiteSpace: 'nowrap'
                }}
              >
                product shots
              </div>
            </div>

            {/* Tabs Section */}
            <div className="mt-6" style={{ transform: 'translateY(-35px)' }}>
              {/* Tab Navigation */}
              <div className="flex justify-center">
                <button
                  onClick={() => handleTabClick('DETAILS')}
                  className={`px-2 py-1 text-xs font-medium ${activeTab === 'DETAILS' ? 'border-b border-red-500 text-red-500' : 'text-black hover:text-red-500'}`}
                  style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px' }}
                >
                  DETAILS
                </button>
                <button
                  onClick={() => handleTabClick('SHIPPING')}
                  className={`px-2 py-1 text-xs font-medium ${activeTab === 'SHIPPING' ? 'border-b border-red-500 text-red-500' : 'text-black hover:text-red-500'}`}
                  style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px' }}
                >
                  SHIPPING
                </button>
                <button
                  onClick={() => handleTabClick('POLICY')}
                  className={`px-2 py-1 text-xs font-medium ${activeTab === 'POLICY' ? 'border-b border-red-500 text-red-500' : 'text-black hover:text-red-500'}`}
                  style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px' }}
                >
                  POLICY
                </button>
                <button
                  onClick={() => handleTabClick('CARE & STORAGE')}
                  className={`px-2 py-1 text-xs font-medium ${activeTab === 'CARE & STORAGE' ? 'border-b border-red-500 text-red-500' : 'text-black hover:text-red-500'}`}
                  style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px' }}
                >
                  CARE & STORAGE
                </button>
                <button
                  onClick={() => handleTabClick('REVIEWS')}
                  className={`px-2 py-1 text-xs font-medium ${activeTab === 'REVIEWS' ? 'border-b border-red-500 text-red-500' : 'text-black hover:text-red-500'}`}
                  style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px' }}
                >
                  REVIEWS
                </button>
              </div>

              {/* Tab Content */}
              <div className="mt-4 space-y-4" style={{ maxWidth: 'none', width: '100%', marginBottom: '-93px' }}>
                {activeTab === 'DETAILS' && (
                  <>
                    <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap' }}>
                      13X6 ULTRA THIN HD FILM LACE, RAW CAMBODIAN STRAIGHT 250% DENSITY.
                    </p>
                    <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap' }}>
                      HANDMADE UNIT MEASURING 24 INCHES IN LENGTH, OFF BLACK HAIR COLOR.
                    </p>
                    <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap' }}>
                      100% DOUBLE DRAWN HUMAN HAIR EXTENSIONS USING SINGLE DONOR BUNDLES.
                    </p>
                    <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap' }}>
                      STRETCHY, BREATHABLE CAP WITH REMOVABLE COMBS + ELASTIC BAND FOR A SNUG FIT.
                    </p>
                    <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap' }}>
                      SINGLE STRAND KNOTS ARE LIGHTLY BLEACHED FOR A SEAMLESS, READY TO WEAR APPLICATION.
                    </p>
                    <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap' }}>
                      UNIT COMES CO-WASHED IN ITS NATURAL STATE. CAN BE BLEACHED, DYED OR COLORED.
                    </p>
                    <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap' }}>
                      USE 3D WIG GENERATOR TO CUSTOMIZE UNIT TO YOUR DESIRABILITY, FOR MEMBERS ONLY.
                    </p>
                    <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap', marginBottom: '-8px' }}>
                      PROPER VERIFICATION IS REQUIRED TO FINALIZE THE PURCHASE OF ALL UNITS.
                    </p>
                  </>
                )}
                
                {activeTab === 'SHIPPING' && (
                  <>
                    <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap' }}>
                      STANDARD PROCESSING IS 6 TO 8 WEEKS AND UP TO 10 WEEKS FOR CUSTOMIZED UNITS.
                    </p>
                    <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap' }}>
                      EXPRESS PROCESSING IS 4 TO 6 WEEKS WITH RUSH SHIPPING FOR AN ADDITIONAL $120 USD.
                    </p>
                    <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap' }}>
                      CUSTOM COLOR, STYLING & ADD-ONS ARE NOT APPLICABLE FOR RUSH PROCESSING.
                    </p>
                    <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap', marginBottom: '-8px' }}>
                      PROCESSING TIME DOES NOT INCLUDE WEEKENDS AND MAJOR US HOLIDAYS.
                    </p>
                  </>
                )}
                
                {activeTab === 'POLICY' && (
                  <>
                    <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap' }}>
                      WE ARE UNABLE TO ACCEPT RETURNS OR REFUNDS AT THIS TIME. ALL SALES ARE FINAL.
                    </p>
                    <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap' }}>
                      WHEN APPLICABLE, WE DO OFFER STORE CREDIT TO GO TOWARDS A FUTURE PURCHASE.
                    </p>
                    <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap', marginBottom: '-8px' }}>
                      IF THERE IS AN ISSUE WITH YOUR ORDER, REACH OUT TO CONTACT@FRONTALSLAYER.COM
                    </p>
                  </>
                )}
                
                {activeTab === 'CARE & STORAGE' && (
                  <>
                    <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap' }}>
                      WASH WITH MILD SHAMPOO, AVOID GETTING CONDITIONER DIRECTLY ON THE LACE.
                    </p>
                    <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap' }}>
                      ROUTINELY BRUSH HAIR WITH A PADDLE BRUSH TO AVOID MATTING & SHEDDING.
                    </p>
                    <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap', marginBottom: '-8px' }}>
                      CAREFULLY STORE UNIT INSIDE SATIN LINED DUST BAG TO MINIMIZE DAMAGE, FRIZZ + DEBRIS.
                    </p>
                  </>
                )}
                
                {activeTab === 'REVIEWS' && (
                  <div style={{ textAlign: 'center', padding: '20px 0 0px 0', transform: 'translateY(-12px)' }}>
                    {/* Leave a Review Section */}
                    <div style={{ marginBottom: '40px' }}>
                      <h3 style={{ 
                        fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', 
                        fontSize: '11px', 
                        color: '#EB1C24', 
                        fontWeight: '500',
                        marginBottom: '15px',
                        textTransform: 'uppercase'
                      }}>
                        LEAVE A REVIEW!
                      </h3>
                      
                      {/* Star Rating */}
                      <div className="flex justify-center mb-4 gap-1">
                        {[...Array(5)].map((_, index) => (
                          <img
                            key={index}
                            src="/assets/NOIR/filled-star.png"
                            alt="Star Rating"
                            className="w-auto h-auto cursor-pointer"
                            style={{ 
                              width: '14px', 
                              height: '14px',
                              filter: 'drop-shadow(0 0 0 1px black)',
                              stroke: '1px black'
                            }}
                          />
                        ))}
                      </div>
                      
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ 
                          fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', 
                          fontSize: '11px', 
                          color: 'black',
                          textTransform: 'uppercase',
                          margin: '0'
                        }}>
                          4.97 OUT OF 5 STARS
                        </p>
                        <p style={{ 
                          fontFamily: '"Futura PT Demi", futuristic-pt, Futura, Inter, sans-serif', 
                          fontSize: '9px', 
                          color: '#909090',
                          textTransform: 'uppercase',
                          margin: '0',
                          transform: 'translateY(3px)'
                        }}>
                          BASED ON 14 VERIFIED REVIEWS
                        </p>
                      </div>
                    </div>
                    
                    {/* Ask a Question Section */}
                    <div style={{ textAlign: 'left' }}>
                      
                      <div style={{ maxWidth: '300px', margin: '0 auto' }}>
                        {/* Name Input */}
                        <div style={{ marginBottom: '15px' }}>
                          <label style={{ 
                            fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', 
                            fontSize: '9px', 
                            color: 'black',
                            textTransform: 'uppercase',
                            display: 'block',
                            marginBottom: '5px',
                            transform: 'translateX(4px)'
                          }}>
                            NAME:
                          </label>
                          <input 
                            type="text" 
                            placeholder="ENTER YOUR NAME"
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: '1px solid black',
                              borderRadius: '0',
                              fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                              fontSize: '9px',
                              outline: 'none',
                              textIndent: '-1px',
                              color: '#909090',
                              textTransform: 'uppercase'
                            }}
                          />
                        </div>
                        
                        {/* Email Input */}
                        <div style={{ marginBottom: '15px' }}>
                          <label style={{ 
                            fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', 
                            fontSize: '9px', 
                            color: 'black',
                            textTransform: 'uppercase',
                            display: 'block',
                            marginBottom: '5px',
                            transform: 'translateX(4px)'
                          }}>
                            EMAIL:
                          </label>
                          <input 
                            type="email" 
                            placeholder="ENTER YOUR EMAIL"
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: '1px solid black',
                              borderRadius: '0',
                              fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                              fontSize: '9px',
                              outline: 'none',
                              textIndent: '-1px',
                              color: '#909090',
                              textTransform: 'uppercase'
                            }}
                          />
                        </div>
                        
                        {/* Question Text Area */}
                        <div style={{ marginBottom: '20px' }}>
                          <label style={{ 
                            fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', 
                            fontSize: '9px', 
                            color: 'black',
                            textTransform: 'uppercase',
                            display: 'block',
                            marginBottom: '5px',
                            transform: 'translateX(4px)'
                          }}>
                            QUESTION:
                          </label>
                          <textarea 
                            placeholder="WRITE YOUR QUESTION HERE."
                            rows={4}
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: '1px solid black',
                              borderRadius: '0',
                              fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                              fontSize: '9px',
                              outline: 'none',
                              textIndent: '-1px',
                              color: '#909090',
                              textTransform: 'uppercase',
                              resize: 'vertical'
                            }}
                          />
                        </div>
                        
                        {/* Submit Button */}
                        <button style={{
                          fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                          fontSize: '9px',
                          color: '#EB1C24',
                          textTransform: 'uppercase',
                          fontWeight: '500',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '8px 16px',
                          display: 'block',
                          margin: '0 auto -70px auto',
                          transform: 'translateY(-20px)'
                        }}>
                          SUBMIT INQUIRY
                        </button>
                      </div>
                    </div>
                    
                    {/* Reviews Section */}
                    <div style={{ marginTop: '40px', textAlign: 'left', transform: 'translateY(25px)' }}>
                      {/* Sort Option */}
                      <div style={{ marginBottom: '20px' }}>
                        <p style={{ 
                          fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', 
                          fontSize: '8px', 
                          color: 'black',
                          textTransform: 'uppercase',
                          margin: '0',
                          display: 'inline-block'
                        }}>
                          MOST RECENT ↓
                        </p>
                      </div>
                      
                      {/* Individual Reviews */}
                      <div style={{ marginBottom: '30px' }}>
                        {/* Review 1 - Amy */}
                        <div style={{ marginBottom: '25px', paddingBottom: '20px', borderBottom: '1px solid #e0e0e0' }}>
                          <div style={{ marginBottom: '5px' }}>
                            <img
                              src="/assets/NOIR/client-photo.png"
                              alt="Client Photo"
                              style={{ 
                                width: '20px', 
                                height: '20px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                marginBottom: '5px'
                              }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <p style={{ 
                                  fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', 
                                  fontSize: '8px', 
                                  color: 'black',
                                  textTransform: 'uppercase',
                                  margin: '0',
                                  fontWeight: '500'
                                }}>
                                  AMY - NJ
                                </p>
                                <span style={{ 
                                  fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', 
                                  fontSize: '7px', 
                                  color: '#EB1C24',
                                  textTransform: 'uppercase'
                                }}>
                                  (VERIFIED)
                                </span>
                              </div>
                              <p style={{ 
                                fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', 
                                fontSize: '8px', 
                                color: 'black',
                                margin: '0'
                              }}>
                                01/24/23
                              </p>
                            </div>
                          </div>
                          
                          {/* Stars */}
                          <div className="flex gap-1 mb-2">
                            {[...Array(5)].map((_, index) => (
                              <img
                                key={index}
                                src="/assets/NOIR/filled-star.png"
                                alt="Star Rating"
                                style={{ 
                                  width: '12px', 
                                  height: '12px',
                                  filter: 'drop-shadow(0 0 0 1px black)',
                                  stroke: '1px black'
                                }}
                              />
                            ))}
                          </div>
                          
                          <h4 style={{ 
                            fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', 
                            fontSize: '8px', 
                            color: '#EB1C24',
                            textTransform: 'uppercase',
                            margin: '0 0 8px 0',
                            fontWeight: '500'
                          }}>
                            GREAT QUALITY
                          </h4>
                          
                          <p style={{ 
                            fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', 
                            fontSize: '7px', 
                            color: 'black',
                            margin: '0',
                            lineHeight: '1.4'
                          }}>
                            WIG SHIPPED QUICKER THAN I ANTICIPATED WHICH WAS GREAT! ALSO OBSESSED WITH THE QUALITY OF THIS HAIR. 10/10 WILL BE PURCHASING ANOTHER UNIT FROM HERE AGAIN.
                          </p>
                        </div>
                        
                        {/* Review 2 - Greta */}
                        <div style={{ marginBottom: '25px' }}>
                          <div style={{ marginBottom: '5px' }}>
                            <img
                              src="/assets/NOIR/client-photo.png"
                              alt="Client Photo"
                              style={{ 
                                width: '20px', 
                                height: '20px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                marginBottom: '5px'
                              }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <p style={{ 
                                  fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', 
                                  fontSize: '8px', 
                                  color: 'black',
                                  textTransform: 'uppercase',
                                  margin: '0',
                                  fontWeight: '500'
                                }}>
                                  GRETA - TX
                                </p>
                                <span style={{ 
                                  fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', 
                                  fontSize: '7px', 
                                  color: '#EB1C24',
                                  textTransform: 'uppercase'
                                }}>
                                  (VERIFIED)
                                </span>
                              </div>
                              <p style={{ 
                                fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', 
                                fontSize: '8px', 
                                color: 'black',
                                margin: '0'
                              }}>
                                01/21/23
                              </p>
                            </div>
                          </div>
                          
                          {/* Stars */}
                          <div className="flex gap-1 mb-2">
                            {[...Array(5)].map((_, index) => (
                              <img
                                key={index}
                                src="/assets/NOIR/filled-star.png"
                                alt="Star Rating"
                                style={{ 
                                  width: '12px', 
                                  height: '12px',
                                  filter: 'drop-shadow(0 0 0 1px black)',
                                  stroke: '1px black'
                                }}
                              />
                            ))}
                          </div>
                          
                          <h4 style={{ 
                            fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', 
                            fontSize: '8px', 
                            color: '#EB1C24',
                            textTransform: 'uppercase',
                            margin: '0 0 8px 0',
                            fontWeight: '500'
                          }}>
                            VERY VERSATILE
                          </h4>
                          
                          <p style={{ 
                            fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', 
                            fontSize: '7px', 
                            color: 'black',
                            margin: '0',
                            lineHeight: '1.4'
                          }}>
                            I AM IN LOVE WITH THIS UNIT! VERSATILE & MAKES IT EASY TO SWITCH UP MY STYLE.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          </div>

        </div>

        {/* ADD TO BAG BUTTON */}
        <div className="px-0 md:px-0" style={{ marginTop: '2px' }}>
          <button
            onClick={handleAddToBag}
            disabled={addToBagState === 'adding'}
            className={`border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold ${
              addToBagState === 'adding' ? 'bg-white cursor-not-allowed' : 
              addToBagState === 'added' ? 'bg-white cursor-pointer' : 'bg-white cursor-pointer hover:bg-gray-50'
            }`}
            style={{ 
              borderWidth: '1.3px', 
              color: '#EB1C24',
              fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
              backgroundColor: '#FFFFFF'
            }}
          >
            {addToBagState === 'idle' && 'ADD TO BAG'}
            {addToBagState === 'adding' && 'ADDING...'}
            {addToBagState === 'added' && (
              <span className="flex items-center justify-center gap-1">
                <img src="/assets/check.svg" alt="Check" width="9" height="9" />
                <span style={{ color: '#909090' }}>IN THE BAG</span>
              </span>
            )}
          </button>
        </div>

        {/* CUSTOMIZE IN BUILD-A-WIG BUTTON */}
        <div className="px-0 md:px-0" style={{ marginTop: '10px' }}>
          <button
            onClick={() => {
              // Store ONLY the selected cap size in localStorage for customize page
              if (selectedCustomCap) {
                localStorage.setItem('customizeSelectedCapSize', selectedCustomCap);
                localStorage.setItem('customizeSelectedCapSizePrice', '0'); // Custom cap has no additional price
              } else if (selectedFlexibleCap) {
                localStorage.setItem('customizeSelectedCapSize', selectedFlexibleCap);
                localStorage.setItem('customizeSelectedCapSizePrice', '0'); // Flexible cap extra cost is included in base price
              }
              
              // Clear any existing editing state and sub-page selections - customize button always starts fresh
              localStorage.removeItem('customizeEditingCartItem');
              localStorage.removeItem('customizeEditingCartItemId');
              
              // Clear all sub-page selections to ensure fresh start with defaults
              localStorage.removeItem('customizeSelectedLength');
              localStorage.removeItem('customizeSelectedDensity');
              localStorage.removeItem('customizeSelectedLace');
              localStorage.removeItem('customizeSelectedTexture');
              localStorage.removeItem('customizeSelectedColor');
              localStorage.removeItem('customizeSelectedHairline');
              localStorage.removeItem('customizeSelectedStyling');
              localStorage.removeItem('customizeSelectedAddOns');
              localStorage.removeItem('customizeSelectedHairStyling');
              localStorage.removeItem('customizeSelectedPartSelection');
              
              // Clear all sub-page prices
              localStorage.removeItem('customizeSelectedLengthPrice');
              localStorage.removeItem('customizeSelectedDensityPrice');
              localStorage.removeItem('customizeSelectedLacePrice');
              localStorage.removeItem('customizeSelectedTexturePrice');
              localStorage.removeItem('customizeSelectedColorPrice');
              localStorage.removeItem('customizeSelectedHairlinePrice');
              localStorage.removeItem('customizeSelectedStylingPrice');
              localStorage.removeItem('customizeSelectedAddOnsPrice');
              console.log('Customize page - Starting fresh customization');
              
              navigate('/build-a-wig');
            }}
            className="border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
            style={{ 
              borderWidth: '1.3px', 
              color: '#EB1C24',
              fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif'
            }}
          >
            CUSTOMIZE IN BUILD-A-WIG
          </button>
      </div>

        {/* SIMILAR PRODUCTS SECTION */}
        <div className="px-0 md:px-0" style={{ marginTop: '20px', marginBottom: '20px' }}>
          <div style={{ 
            border: '1.3px solid black', 
            backgroundColor: 'rgba(255, 255, 255, 0.6)', 
            backdropFilter: 'blur(10px)',
            padding: '0px',
            maxWidth: '100%',
            margin: '0 auto'
          }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '15px' }}>
              <div style={{ 
                width: '1px', 
                height: '15px', 
                backgroundColor: 'black',
                margin: '0 auto 8px auto'
              }}></div>
              <h3 style={{ 
                fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                fontSize: '12px',
                color: '#EB1C24',
                textTransform: 'uppercase',
                margin: '0',
                fontWeight: '500'
              }}>
                SIMILAR PRODUCTS
              </h3>
            </div>
            
            {/* Content Area */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
              {/* Left Arrow */}
              <button 
                onClick={handleSimilarProductsLeftArrow}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  padding: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  minHeight: '50px',
                  transform: `translateX(10px) translateY(${is3DView ? '-26px' : '-10px'})`
                }}>
                <img
                  src="/assets/NOIR/left-facing-arrow.svg"
                  alt="Left Arrow"
                  style={{ 
                    width: '14px', 
                    height: '14px'
                  }}
                />
              </button>
              
              {/* Product Thumbnails Container with Static Vertical Line */}
              <div style={{ flex: '1', position: 'relative' }}>
                {/* Single Center Line with Masking */}
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  top: '0',
                  bottom: '0',
                  width: '1px',
                  backgroundColor: 'black',
                  zIndex: 20,
                  transform: 'translateX(-50%)'
                }}></div>
                
                {/* Masking Overlay for Tunnel Effect */}
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  top: '0',
                  bottom: '0',
                  width: '10px',
                  backgroundColor: 'transparent',
                  zIndex: 15,
                  transform: 'translateX(-50%)',
                  pointerEvents: 'none'
                }}></div>
                
                {/* Scrolling Product Thumbnails Container */}
                <div style={{ 
                  overflowX: 'hidden',
                  width: '100%',
                  position: 'relative',
                  maxWidth: '100%'
                }}>
                  <div 
                    style={{ 
                      display: 'flex', 
                      gap: '0',
                      transform: `translateX(${similarProductsScroll}px) translateY(-15px)`,
                      transition: 'none',
                      width: 'calc(200% - 20px)'
                    }}
                  >
                {/* Product 1 - BLANCO */}
                <div style={{ 
                  padding: '10px 10px 4px 10px',
                  textAlign: 'center',
                  transform: 'translateX(0px)'
                }}>
                  <img
                    src={is3DView ? "/assets/NOIR/blanco front.png" : "/assets/NOIR/blanco-thumb.png"}
                    alt="BLANCO"
                    style={{ 
                        width: is3DView ? 'calc(100% - 20px)' : '100%', 
                        height: is3DView ? 'calc(auto - 20px)' : 'auto',
                      marginBottom: '10px',
                      marginLeft: '10px'
                    }}
                  />
                  <p style={{ 
                    fontFamily: '"Covered By Your Grace", cursive',
                    fontSize: '18px',
                    color: 'black',
                    textTransform: 'uppercase',
                    margin: '-10px 0 -3px 0',
                    fontWeight: '500'
                  }}>
                    BLANCO
                  </p>
                  <p style={{ 
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    fontSize: '10px',
                    color: '#EB1C24',
                    textTransform: 'uppercase',
                    margin: '0 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84'
                  }}>
                    24" RAW RUSSIAN
                  </p>
                  <p style={{ 
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    fontSize: '12px',
                    color: 'black',
                    textTransform: 'uppercase',
                    margin: '0 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84'
                  }}>
                    $820 USD
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginTop: '2px' }}>
                    {[...Array(5)].map((_, index) => (
                      <img
                        key={index}
                        src="/assets/NOIR/star-symbol.png"
                        alt="Star Rating"
                        style={{ 
                          width: '10px', 
                          height: '10px',
                          filter: 'drop-shadow(0 0 0 1px black)',
                          stroke: '1px black'
                        }}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Product 2 - SOFT WAVE */}
                <div style={{ 
                  padding: '10px 10px 4px 10px',
                  textAlign: 'center',
                  transform: 'translateX(10px)'
                }}>
                  <img
                    src={is3DView ? "/assets/NOIR/wave front.png" : "/assets/NOIR/wave-thumb.png"}
                    alt="SOFT WAVE"
                    style={{ 
                        width: is3DView ? 'calc(100% - 20px)' : '100%', 
                        height: is3DView ? 'calc(auto - 20px)' : 'auto',
                      marginBottom: '10px',
                      marginLeft: '10px'
                    }}
                  />
                  <p style={{ 
                    fontFamily: '"Covered By Your Grace", cursive',
                    fontSize: '18px',
                    color: 'black',
                    textTransform: 'uppercase',
                    margin: '-10px 0 -3px 0',
                    fontWeight: '500'
                  }}>
                    SOFT WAVE
                  </p>
                  <p style={{ 
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    fontSize: '10px',
                    color: '#EB1C24',
                    textTransform: 'uppercase',
                    margin: '0 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84'
                  }}>
                    24" RAW INDONESIAN
                  </p>
                  <p style={{ 
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    fontSize: '12px',
                    color: 'black',
                    textTransform: 'uppercase',
                    margin: '0 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84'
                  }}>
                    $760 USD
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginTop: '2px' }}>
                    {[...Array(5)].map((_, index) => (
                      <img
                        key={index}
                        src="/assets/NOIR/star-symbol.png"
                        alt="Star Rating"
                        style={{ 
                          width: '10px', 
                          height: '10px',
                          filter: 'drop-shadow(0 0 0 1px black)',
                          stroke: '1px black'
                        }}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Product 3 - NOIR */}
                <div style={{ 
                  padding: '10px 10px 4px 10px',
                  textAlign: 'center',
                  transform: 'translateX(0px)'
                }}>
                  <img
                    src={is3DView ? "/assets/NOIR/noir front.png" : "/assets/NOIR/noir-thumb.png"}
                    alt="NOIR"
                    style={{ 
                        width: is3DView ? 'calc(100% - 20px)' : '100%', 
                        height: is3DView ? 'calc(auto - 20px)' : 'auto',
                      marginBottom: '10px',
                      marginLeft: '10px'
                    }}
                  />
                  <p style={{ 
                    fontFamily: '"Covered By Your Grace", cursive',
                    fontSize: '18px',
                    color: 'black',
                    textTransform: 'uppercase',
                    margin: '-10px 0 -3px 0',
                    fontWeight: '500'
                  }}>
                    NOIR
                  </p>
                  <p style={{ 
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    fontSize: '10px',
                    color: '#EB1C24',
                    textTransform: 'uppercase',
                    margin: '0 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84'
                  }}>
                    24" RAW CAMBODIAN
                  </p>
                  <p style={{ 
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    fontSize: '12px',
                    color: 'black',
                    textTransform: 'uppercase',
                    margin: '0 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84'
                  }}>
                    $740 USD
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginTop: '2px' }}>
                    {[...Array(5)].map((_, index) => (
                      <img
                        key={index}
                        src="/assets/NOIR/star-symbol.png"
                        alt="Star Rating"
                        style={{ 
                          width: '10px', 
                          height: '10px',
                          filter: 'drop-shadow(0 0 0 1px black)',
                          stroke: '1px black'
                        }}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Product 4 - SOFT CURL */}
                <div style={{ 
                  padding: '10px 10px 4px 10px',
                  textAlign: 'center',
                  transform: 'translateX(10px)'
                }}>
                  <img
                    src={is3DView ? "/assets/NOIR/wave front.png" : "/assets/NOIR/curl-thumb.png"}
                    alt="SOFT CURL"
                    style={{ 
                        width: is3DView ? 'calc(100% - 20px)' : '100%', 
                        height: is3DView ? 'calc(auto - 20px)' : 'auto',
                      marginBottom: '10px',
                      marginLeft: '10px'
                    }}
                  />
                  <p style={{ 
                    fontFamily: '"Covered By Your Grace", cursive',
                    fontSize: '18px',
                    color: 'black',
                    textTransform: 'uppercase',
                    margin: '-10px 0 -3px 0',
                    fontWeight: '500'
                  }}>
                    SOFT CURL
                  </p>
                  <p style={{ 
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    fontSize: '10px',
                    color: '#EB1C24',
                    textTransform: 'uppercase',
                    margin: '0 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84'
                  }}>
                    24" RAW VIETNAMESE
                  </p>
                  <p style={{ 
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    fontSize: '12px',
                    color: 'black',
                    textTransform: 'uppercase',
                    margin: '0 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84'
                  }}>
                    $780 USD
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginTop: '2px' }}>
                    {[...Array(5)].map((_, index) => (
                      <img
                        key={index}
                        src="/assets/NOIR/star-symbol.png"
                        alt="Star Rating"
                        style={{ 
                          width: '10px', 
                          height: '10px',
                          filter: 'drop-shadow(0 0 0 1px black)',
                          stroke: '1px black'
                        }}
                      />
                    ))}
                  </div>
                </div>
                  </div>
                </div>
              </div>
              
              {/* Right Arrow */}
              <button 
                onClick={handleSimilarProductsRightArrow}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  padding: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  minHeight: '50px',
                  transform: `translateX(-10px) translateY(${is3DView ? '-26px' : '-10px'})`
                }}>
                <img
                  src="/assets/NOIR/right-facing-arrow.svg"
                  alt="Right Arrow"
                  style={{ 
                    width: '14px', 
                    height: '14px'
                  }}
                />
              </button>
            </div>
          </div>
        </div>

        {/* RECENTLY VIEWED SECTION */}
        <div className="px-0 md:px-0" style={{ marginTop: '20px', marginBottom: '20px', transform: 'translateY(-17px)' }}>
          <div style={{ 
            border: '1.3px solid black', 
            backgroundColor: 'rgba(255, 255, 255, 0.6)', 
            backdropFilter: 'blur(10px)',
            padding: '0px',
            maxWidth: '100%',
            margin: '0 auto'
          }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '15px' }}>
              <div style={{ 
                width: '1px', 
                height: '15px', 
                backgroundColor: 'black',
                margin: '0 auto 8px auto'
              }}></div>
              <h3 style={{ 
                fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                fontSize: '12px',
                color: '#EB1C24',
                textTransform: 'uppercase',
                margin: '0',
                fontWeight: '500'
              }}>
                RECENTLY VIEWED
              </h3>
            </div>
            
            {/* Content Area */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
              {/* Left Arrow */}
              <button 
                onClick={handleRecentlyViewedLeftArrow}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  padding: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  minHeight: '50px',
                  transform: `translateX(10px) translateY(${is3DView ? '-26px' : '-10px'})`
                }}>
                <img
                  src="/assets/NOIR/left-facing-arrow.svg"
                  alt="Left Arrow"
                  style={{ 
                    width: '14px', 
                    height: '14px'
                  }}
                />
              </button>
              
              {/* Product Thumbnails Container with Static Vertical Line */}
              <div style={{ flex: '1', position: 'relative' }}>
                {/* Single Center Line with Masking */}
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  top: '0',
                  bottom: '0',
                  width: '1px',
                  backgroundColor: 'black',
                  zIndex: 20,
                  transform: 'translateX(-50%)'
                }}></div>
                
                {/* Masking Overlay for Tunnel Effect */}
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  top: '0',
                  bottom: '0',
                  width: '10px',
                  backgroundColor: 'transparent',
                  zIndex: 15,
                  transform: 'translateX(-50%)',
                  pointerEvents: 'none'
                }}></div>
                
                {/* Scrolling Product Thumbnails Container */}
                <div style={{ 
                  overflowX: 'hidden',
                  width: '100%',
                  position: 'relative',
                  maxWidth: '100%'
                }}>
                  <div 
                    style={{ 
                      display: 'flex', 
                      gap: '0',
                      transform: `translateX(${recentlyViewedScroll}px) translateY(-15px)`,
                      transition: 'none',
                      width: 'calc(200% - 20px)'
                    }}
                  >
                {/* Product 1 - BEACH WAVE */}
                <div style={{ 
                  padding: '10px 10px 4px 10px',
                  textAlign: 'center',
                  transform: 'translateX(0px)'
                }}>
                  <img
                    src={is3DView ? "/assets/NOIR/wave front.png" : "/assets/NOIR/wave-thumb.png"}
                    alt="SOFT WAVE"
                    style={{ 
                        width: is3DView ? 'calc(100% - 20px)' : '100%', 
                        height: is3DView ? 'calc(auto - 20px)' : 'auto',
                      marginBottom: '10px',
                      marginLeft: '10px'
                    }}
                  />
                  <p style={{ 
                    fontFamily: '"Covered By Your Grace", cursive',
                    fontSize: '18px',
                    color: 'black',
                    textTransform: 'uppercase',
                    margin: '-10px 0 -3px 0',
                    fontWeight: '500'
                  }}>
                    SOFT WAVE
                  </p>
                  <p style={{ 
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    fontSize: '10px',
                    color: '#EB1C24',
                    textTransform: 'uppercase',
                    margin: '0 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84'
                  }}>
                    24" RAW INDONESIAN
                  </p>
                  <p style={{ 
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    fontSize: '12px',
                    color: 'black',
                    textTransform: 'uppercase',
                    margin: '0 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84'
                  }}>
                    $760 USD
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginTop: '2px' }}>
                    {[...Array(5)].map((_, index) => (
                      <img
                        key={index}
                        src="/assets/NOIR/star-symbol.png"
                        alt="Star Rating"
                        style={{ 
                          width: '10px', 
                          height: '10px',
                          filter: 'drop-shadow(0 0 0 1px black)',
                          stroke: '1px black'
                        }}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Product 2 - SOFT CURL */}
                <div style={{ 
                  padding: '10px 10px 4px 10px',
                  textAlign: 'center',
                  transform: 'translateX(10px)'
                }}>
                  <img
                    src={is3DView ? "/assets/NOIR/wave front.png" : "/assets/NOIR/curl-thumb.png"}
                    alt="SOFT CURL"
                    style={{ 
                        width: is3DView ? 'calc(100% - 20px)' : '100%', 
                        height: is3DView ? 'calc(auto - 20px)' : 'auto',
                      marginBottom: '10px',
                      marginLeft: '10px'
                    }}
                  />
                  <p style={{ 
                    fontFamily: '"Covered By Your Grace", cursive',
                    fontSize: '18px',
                    color: 'black',
                    textTransform: 'uppercase',
                    margin: '-10px 0 -3px 0',
                    fontWeight: '500'
                  }}>
                    SOFT CURL
                  </p>
                  <p style={{ 
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    fontSize: '10px',
                    color: '#EB1C24',
                    textTransform: 'uppercase',
                    margin: '0 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84'
                  }}>
                    24" RAW VIETNAMESE
                  </p>
                  <p style={{ 
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    fontSize: '12px',
                    color: 'black',
                    textTransform: 'uppercase',
                    margin: '0 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84'
                  }}>
                    $780 USD
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginTop: '2px' }}>
                    {[...Array(5)].map((_, index) => (
                      <img
                        key={index}
                        src="/assets/NOIR/star-symbol.png"
                        alt="Star Rating"
                        style={{ 
                          width: '10px', 
                          height: '10px',
                          filter: 'drop-shadow(0 0 0 1px black)',
                          stroke: '1px black'
                        }}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Product 3 - NOIR */}
                <div style={{ 
                  padding: '10px 10px 4px 10px',
                  textAlign: 'center',
                  transform: 'translateX(0px)'
                }}>
                  <img
                    src={is3DView ? "/assets/NOIR/noir front.png" : "/assets/NOIR/noir-thumb.png"}
                    alt="NOIR"
                    style={{ 
                        width: is3DView ? 'calc(100% - 20px)' : '100%', 
                        height: is3DView ? 'calc(auto - 20px)' : 'auto',
                      marginBottom: '10px',
                      marginLeft: '10px'
                    }}
                  />
                  <p style={{ 
                    fontFamily: '"Covered By Your Grace", cursive',
                    fontSize: '18px',
                    color: 'black',
                    textTransform: 'uppercase',
                    margin: '-10px 0 -3px 0',
                    fontWeight: '500'
                  }}>
                    NOIR
                  </p>
                  <p style={{ 
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    fontSize: '10px',
                    color: '#EB1C24',
                    textTransform: 'uppercase',
                    margin: '0 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84'
                  }}>
                    24" RAW CAMBODIAN
                  </p>
                  <p style={{ 
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    fontSize: '12px',
                    color: 'black',
                    textTransform: 'uppercase',
                    margin: '0 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84'
                  }}>
                    $740 USD
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginTop: '2px' }}>
                    {[...Array(5)].map((_, index) => (
                      <img
                        key={index}
                        src="/assets/NOIR/star-symbol.png"
                        alt="Star Rating"
                        style={{ 
                          width: '10px', 
                          height: '10px',
                          filter: 'drop-shadow(0 0 0 1px black)',
                          stroke: '1px black'
                        }}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Product 4 - BLANCO */}
                <div style={{ 
                  padding: '10px 10px 4px 10px',
                  textAlign: 'center',
                  transform: 'translateX(-10px)'
                }}>
                  <img
                    src={is3DView ? "/assets/NOIR/blanco front.png" : "/assets/NOIR/blanco-thumb.png"}
                    alt="BLANCO"
                    style={{ 
                        width: is3DView ? 'calc(100% - 20px)' : '100%', 
                        height: is3DView ? 'calc(auto - 20px)' : 'auto',
                      marginBottom: '10px',
                      marginLeft: '10px'
                    }}
                  />
                  <p style={{ 
                    fontFamily: '"Covered By Your Grace", cursive',
                    fontSize: '18px',
                    color: 'black',
                    textTransform: 'uppercase',
                    margin: '-10px 0 -3px 0',
                    fontWeight: '500'
                  }}>
                    BLANCO
                  </p>
                  <p style={{ 
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    fontSize: '10px',
                    color: '#EB1C24',
                    textTransform: 'uppercase',
                    margin: '0 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84'
                  }}>
                    24" RAW RUSSIAN
                  </p>
                  <p style={{ 
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    fontSize: '12px',
                    color: 'black',
                    textTransform: 'uppercase',
                    margin: '0 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84'
                  }}>
                    $820 USD
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginTop: '2px' }}>
                    {[...Array(5)].map((_, index) => (
                      <img
                        key={index}
                        src="/assets/NOIR/star-symbol.png"
                        alt="Star Rating"
                        style={{ 
                          width: '10px', 
                          height: '10px',
                          filter: 'drop-shadow(0 0 0 1px black)',
                          stroke: '1px black'
                        }}
                      />
                    ))}
                  </div>
                </div>
                  </div>
                </div>
              </div>
              
              {/* Right Arrow */}
              <button 
                onClick={handleRecentlyViewedRightArrow}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  padding: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  minHeight: '50px',
                  transform: `translateX(-10px) translateY(${is3DView ? '-26px' : '-10px'})`
                }}>
                <img
                  src="/assets/NOIR/right-facing-arrow.svg"
                  alt="Right Arrow"
                  style={{ 
                    width: '14px', 
                    height: '14px'
                  }}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
        </div>
      </div>
    </>
  );
}

export default NoirSelection;
















