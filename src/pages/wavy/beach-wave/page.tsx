import React, { useState, useEffect } from 'react';
import { useMarbleStripSnapStep } from '../../../hooks/useMarbleStripSnapStep';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import DynamicCartIcon from '../../../components/DynamicCartIcon';
import ConfirmationModal from '../../../components/ConfirmationModal';
import BuildAWigFeatureSignInModal from '../../../components/BuildAWigFeatureSignInModal';
import ImageViewerModal from '../../../components/ImageViewerModal';
import BrandMenuLinks from '../../../components/BrandMenuLinks';
import SocialMenuIcons from '../../../components/SocialMenuIcons';
import { trackActivity } from '../../../utils/activity';
import { persistProduct3dViewPreference, readProduct3dViewPreference } from '../../../utils/product3dViewPreference';
import { navigateUnitProductBack } from '../../../utils/navigateBack';
import { getPerUserKey, getCurrentUserEmailFromStorage, PER_USER_KEYS } from '../../../utils/perUserStorage';
import { signOutAppAndSupabaseSession } from '../../../utils/adminAuth';
import { signInHrefWithReturnTo } from '../../../utils/signInReturnTo';
import { useShopNavSearchBar } from '../../../components/shop/useShopNavSearchBar';
import { usePersistentQueryState } from '../../../hooks/usePersistentQueryState';
import {
  marbleStripScrollRowStyle,
  marbleStripCellOuter,
  marbleStripCellBand,
  marbleStripStarsRowStyle,
  marbleStripNavRowStyle,
  marbleStripNavMiddleColStyle,
  marbleStripNavArrowStyle,
  marbleStripViewportStyle,
  marbleStripThumbWrap,
  marbleStripThumbImg,
  marbleStripTextColStrip,
} from '../../../utils/marbleStripStyles';
import { ShopMobileMenuShopTab } from '../../../components/ShopMobileMenuShopTab';
import { ShopMobileMenuToolsTab } from '../../../components/ShopMobileMenuToolsTab';
import { bcfOptionSelectedChrome } from '../../../utils/bcfProductOptions';
import { useProductInventorySnapshot } from '../../../hooks/useProductInventorySnapshot';
import { WigProductPriceDisplay, WigStripPrice } from '../../../components/shop/WigStockPrice';
import { UnitPdpCartActions } from '../../../components/shop/UnitPdpCartActions';
import { UnitPdpWigPreviewImages } from '../../../components/shop/UnitPdpWigPreviewImages';
import {
  UNIT_PDP_CAP_CHART_IMG_STYLE,
  UNIT_PDP_CAP_CHART_ROW_STYLE,
  UNIT_PDP_CAP_SIZE_HEADER_STYLE,
  UNIT_PDP_MAIN_CARD_STYLE,
  UNIT_PDP_TAB_CONTENT_STYLE,
  UNIT_PDP_TABS_SECTION_STYLE,
  withUnitPdpRecentlyViewedVisibility,
} from '../../../components/shop/unitPdpLayoutConstants';
import UnitProductDetailsTab from '../../../components/shop/UnitProductDetailsTab';
import NoirProductShippingTab from '../../../components/shop/NoirProductShippingTab';
import NoirProductPolicyTab from '../../../components/shop/NoirProductPolicyTab';
import NoirProductCareStorageTab from '../../../components/shop/NoirProductCareStorageTab';
import { attachStockStatusToLineItem, isWigUnitSoldOut } from '../../../utils/productInventoryAvailability';

function BeachWaveSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const { NavCenter, SearchTrigger } = useShopNavSearchBar();
  const { isSoldOut: isUnitSoldOut } = useProductInventorySnapshot();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [selectedCustomCap, setSelectedCustomCap] = useState('M');
  const [selectedFlexibleCap, setSelectedFlexibleCap] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showChartModal, setShowChartModal] = useState(false);
  const [addToBagState, setAddToBagState] = useState<'idle' | 'adding' | 'added'>('idle');
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [viewerCurrentIndex, setViewerCurrentIndex] = useState(0);
  
  // Cart count state
  const [cartCount, setCartCount] = useState(() => {
    return parseInt(localStorage.getItem('cartCount') || '0');
  });
  
  // Currency state - per user
  const [selectedCurrency, setSelectedCurrency] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const key = getPerUserKey(PER_USER_KEYS.selectedCurrency, getCurrentUserEmailFromStorage());
        const savedCurrency = localStorage.getItem(key);
        return savedCurrency || 'USD';
      } catch (e) {
        return 'USD';
      }
    }
    return 'USD';
  });
  
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
  
  // Check if BEACH WAVE is in wishlist on mount and when wishlist changes
  useEffect(() => {
    const checkWishlist = () => {
      try {
        const wishlistItems = JSON.parse(localStorage.getItem('wishlistItems') || '[]');
        const isInList = wishlistItems.some((item: any) => (item.name || item.productName || '').toUpperCase() === 'BEACH WAVE');
        setIsInWishlist(isInList);
      } catch (e) {
        setIsInWishlist(false);
      }
    };
    
    checkWishlist();
    
    // Listen for wishlist updates
    const handleStorageChange = () => checkWishlist();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('wishlistUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('wishlistUpdated', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    trackActivity('view_product', { source: 'product_page', productName: 'BEACH WAVE', path: location.pathname });
  }, [location.pathname]);

  // Toggle wishlist handler
  const handleToggleWishlist = () => {
    try {
      const wishlistItems = JSON.parse(localStorage.getItem('wishlistItems') || '[]');
      const totalPrice = parseInt(localStorage.getItem('beachWaveTotalPrice') || '760');
      
      if (isInWishlist) {
        // Remove from wishlist
        const updatedItems = wishlistItems.filter((item: any) => (item.name || item.productName || '').toUpperCase() !== 'BEACH WAVE');
        localStorage.setItem('wishlistItems', JSON.stringify(updatedItems));
        setIsInWishlist(false);
        trackActivity('remove_from_wishlist', { productName: 'BEACH WAVE' });
      } else {
        // Add to wishlist
        const beachWaveItem = {
          id: `beach-wave-unit-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          name: 'BEACH WAVE',
          productName: 'BEACH WAVE',
          price: totalPrice,
          quantity: quantity,
          image: '/assets/NOIR/wave-thumb.png',
          length: localStorage.getItem('selectedLength') || '24"',
          hairOrigin: 'INDONESIAN',
          capSize: selectedCustomCap || selectedFlexibleCap || 'M',
          density: localStorage.getItem('selectedDensity') || '200%',
          lace: localStorage.getItem('selectedLace') || '13X6',
          texture: localStorage.getItem('selectedTexture') || 'SILKY',
          color: localStorage.getItem('selectedColor') || 'OFF BLACK',
          hairline: localStorage.getItem('selectedHairline') || 'NATURAL',
          styling: localStorage.getItem('selectedStyling') || 'MIDDLE',
          addedFrom: 'unit'
        };
        const updatedItems = [...wishlistItems, beachWaveItem];
        localStorage.setItem('wishlistItems', JSON.stringify(updatedItems));
        setIsInWishlist(true);
        trackActivity('add_to_wishlist', { productName: 'BEACH WAVE' });
      }
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('wishlistUpdated'));
    } catch (e) {
      console.error('Error toggling wishlist:', e);
    }
  };

  // CRITICAL: Clear any noir-specific localStorage values and set BEACH WAVE defaults on page load
  // This prevents noir page settings from interfering with beach-wave page
  // BUT: Don't overwrite if we're in customize mode (customizeSelected* keys exist) OR edit mode (editingCartItem exists)
  useEffect(() => {
    // Clear any edit mode flags that might be from other products
    if (localStorage.getItem('editingCartItem')) {
      const editingItem = JSON.parse(localStorage.getItem('editingCartItem') || '{}');
      // Only clear if it's not a BEACH WAVE item
      if (editingItem.name !== 'BEACH WAVE') {
        localStorage.removeItem('editingCartItem');
        localStorage.removeItem('editingCartItemId');
      }
    }
    
    // CRITICAL: Check if we're in edit mode - if editingCartItem exists for BEACH WAVE, don't overwrite
    // This preserves selections loaded from cart item in edit mode
    const editingCartItem = localStorage.getItem('editingCartItem');
    let isInEditMode = false;
    if (editingCartItem) {
      try {
        const editingItem = JSON.parse(editingCartItem);
        isInEditMode = editingItem.name === 'BEACH WAVE';
      } catch (e) {
        // Ignore parse errors
      }
    }
    
    // CRITICAL: Check if we're in customize mode - if customizeSelected* keys exist, don't overwrite
    // This preserves selections made in customize mode sub-pages
    const isInCustomizeMode = localStorage.getItem('customizeSelectedCapSize') || 
                              localStorage.getItem('customizeSelectedLength') ||
                              localStorage.getItem('customizeSelectedStyling') ||
                              localStorage.getItem('customizeSelectedAddOns');
    
    // CRITICAL: Check if editSelected* keys exist - if they do, we're in edit mode and shouldn't overwrite
    const hasEditSelectedKeys = localStorage.getItem('editSelectedCapSize') ||
                               localStorage.getItem('editSelectedLength') ||
                               localStorage.getItem('editSelectedStyling') ||
                               localStorage.getItem('editSelectedAddOns');
    
    // Only set defaults if NOT in customize mode AND NOT in edit mode
    if (!isInCustomizeMode && !isInEditMode && !hasEditSelectedKeys) {
      // Set BEACH WAVE-specific defaults (don't read from localStorage to avoid noir contamination)
      // These are only used if user goes to build-a-wig page from beach-wave
      localStorage.setItem('selectedLength', '24"');
      localStorage.setItem('selectedLengthPrice', '0');
      localStorage.setItem('selectedDensity', '200%');
      localStorage.setItem('selectedDensityPrice', '0');
      localStorage.setItem('selectedLace', '13X6');
      localStorage.setItem('selectedLacePrice', '0');
      localStorage.setItem('selectedTexture', 'WAVY'); // Default for beach-wave
      localStorage.setItem('selectedTexturePrice', '0');
      localStorage.setItem('selectedColor', 'OFF BLACK');
      localStorage.setItem('selectedColorPrice', '0');
      localStorage.setItem('selectedHairline', 'NATURAL');
      localStorage.setItem('selectedHairlinePrice', '0');
      localStorage.setItem('selectedStyling', 'NONE');
      localStorage.setItem('selectedStylingPrice', '0');
      localStorage.setItem('selectedAddOns', JSON.stringify([]));
      localStorage.setItem('selectedAddOnsPrice', '0');
    }
  }, []);

  // Helper function to check if a cart item matches the default configuration exactly
  // This does explicit field-by-field comparison to ensure no false matches
  const matchesDefaultConfiguration = (item: any): boolean => {
    // Ensure item is for BEACH WAVE product
    if (item.name !== 'BEACH WAVE') {
      return false;
    }
    
    // Ensure item has ALL required properties
    if (!item.capSize || !item.length || !item.density || !item.lace || !item.texture || !item.color || !item.hairline || !item.styling) {
      return false;
    }
    
    // Get current default configuration values
    const currentCapSize = selectedCustomCap || selectedFlexibleCap || 'M';
    const DEFAULT_LENGTH = '24"';
    const DEFAULT_DENSITY = '200%';
    const DEFAULT_LACE = '13X6';
    const DEFAULT_TEXTURE = 'SILKY';
    const DEFAULT_COLOR = 'OFF BLACK';
    const DEFAULT_HAIRLINE = 'NATURAL';
    const DEFAULT_STYLING = 'NONE';
    const DEFAULT_ADDONS = '';
    
    // Normalize values for comparison (remove all spaces and convert to string)
    const normalize = (value: any): string => {
      return (value || '').toString().replace(/\s+/g, '').toUpperCase();
    };
    
    // Handle addOns - convert array to comma-separated string or empty string
    const itemAddOns = item.addOns && Array.isArray(item.addOns) && item.addOns.length > 0 
      ? item.addOns.join(',').replace(/\s+/g, '').toUpperCase()
      : '';
    
    // Compare each field explicitly - ALL must match exactly
    const capSizeMatch = normalize(item.capSize) === normalize(currentCapSize);
    const lengthMatch = normalize(item.length) === normalize(DEFAULT_LENGTH);
    const densityMatch = normalize(item.density) === normalize(DEFAULT_DENSITY);
    const laceMatch = normalize(item.lace) === normalize(DEFAULT_LACE);
    const textureMatch = normalize(item.texture) === normalize(DEFAULT_TEXTURE);
    const colorMatch = normalize(item.color) === normalize(DEFAULT_COLOR);
    const hairlineMatch = normalize(item.hairline) === normalize(DEFAULT_HAIRLINE);
    const stylingMatch = normalize(item.styling) === normalize(DEFAULT_STYLING);
    const addOnsMatch = itemAddOns === normalize(DEFAULT_ADDONS);
    
    // ALL fields must match exactly
    return capSizeMatch && lengthMatch && densityMatch && laceMatch && textureMatch && colorMatch && hairlineMatch && stylingMatch && addOnsMatch;
  };

  // Listen for cart count changes and validate cart state
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
        
      // ALWAYS validate cart state - don't trust localStorage alone
      // If cart is completely empty, reset button state
      if (newCartCount === 0) {
        setAddToBagState('idle');
        localStorage.removeItem('addToBagButtonState');
        localStorage.removeItem('lastAddedItemId');
        return;
      }
        
      // ALWAYS re-validate that a cart item with default configuration exists
      // This ensures we only show "IN THE BAG" for items with ALL default specs
      const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      
      const matchingItem = cartItems.find((item: any) => {
        // Use explicit field-by-field comparison to ensure exact match
        return matchesDefaultConfiguration(item);
      });
        
      // Update state based on actual cart contents, not localStorage
      if (matchingItem) {
        // Item with default configuration exists - set to 'added'
        setAddToBagState('added');
        localStorage.setItem('addToBagButtonState', 'added');
        localStorage.setItem('lastAddedItemId', matchingItem.id);
      } else {
        // No matching item - reset to 'idle'
        setAddToBagState('idle');
        localStorage.removeItem('addToBagButtonState');
        localStorage.removeItem('lastAddedItemId');
      }
    };

    // @ts-expect-error - event parameter required by event listener signature but not used
    const handleCartCountUpdate = (event: CustomEvent) => {
      handleCartUpdate();
    };
    
    // @ts-expect-error - event parameter required by event listener signature but not used
    const handleCartUpdated = (event: CustomEvent) => {
      handleCartUpdate();
    };

    const handleStorageChange = () => {
      handleCartUpdate();
    };

    // CRITICAL: Validate cart state immediately on mount to clear any stale localStorage
    // This ensures button state is correct even if localStorage was set incorrectly
    handleCartUpdate();
    
    // Listen for custom events
    window.addEventListener('cartCountUpdated', handleCartCountUpdate as EventListener);
    window.addEventListener('cartUpdated', handleCartUpdated as EventListener);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);
    
    // Simple polling - always validate, not just when localStorage says 'added'
    // This catches cases where localStorage is wrong
    const interval = setInterval(() => {
      handleCartUpdate();
    }, 1000); // Check every 1 second
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('cartCountUpdated', handleCartCountUpdate as EventListener);
      window.removeEventListener('cartUpdated', handleCartUpdated as EventListener);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, [selectedCustomCap, selectedFlexibleCap]);

  // Initialize button state from localStorage on page load
  useEffect(() => {
    const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
    
    // Always check if current configuration matches any cart item
    // Only match items with ALL default selection options (M, 24", 200%, 13X6, etc.)
    const matchingItem = cartItems.find((item: any) => {
      // Use explicit field-by-field comparison to ensure exact match
      return matchesDefaultConfiguration(item);
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
  const [selectedMannequinView, setSelectedMannequinView] = useState(0);
  const [is3DView, setIs3DView] = useState(() => readProduct3dViewPreference());
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startScrollPosition, setStartScrollPosition] = useState(0);
  const [activeTab, setActiveTab] = usePersistentQueryState<
    'DETAILS' | 'SHIPPING' | 'POLICY' | 'CARE/STORAGE' | 'REVIEWS'
  >({
    queryKey: 'tab',
    storageKey: 'wavyBeachWaveActiveTab',
    defaultValue: 'DETAILS',
    allowedValues: ['DETAILS', 'SHIPPING', 'POLICY', 'CARE/STORAGE', 'REVIEWS'] as const,
  });
  const [similarProductsScroll, setSimilarProductsScroll] = useState(0);
  const [recentlyViewedScroll, setRecentlyViewedScroll] = useState(0);
  const [similarSnapPx, setSimilarStripViewportRef] = useMarbleStripSnapStep();
  const [recentSnapPx, setRecentStripViewportRef] = useMarbleStripSnapStep();
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
  const [showBawFeatureSignInModal, setShowBawFeatureSignInModal] = useState(false);
  const [bawSignInReturnTo, setBawSignInReturnTo] = useState(() => ({
    pathname: location.pathname,
    search: location.search || '',
  }));

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

  const handleBack = () => {
    navigateUnitProductBack(navigate, location.pathname);
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
      navigate(signInHrefWithReturnTo(location));
    }
  };

  const handleSignOut = async () => {
    setIsSignedIn(false);
    await signOutAppAndSupabaseSession();
    setShowSignOutConfirm(false);
    // Close mobile menu
    setShowMobileMenu(false);
  };

  const handleCustomCapSelect = (capSize: string) => {
    setSelectedCustomCap(capSize);
    setSelectedFlexibleCap('');
  };

  const handleFlexibleCapSelect = (capSize: string) => {
    setSelectedFlexibleCap(capSize);
    setSelectedCustomCap('');
  };

  const handleQuantityIncrease = () => {
    setQuantity(prev => Math.min(prev + 1, 10));
  };

  const handleQuantityDecrease = () => {
    setQuantity(prev => Math.max(prev - 1, 1));
  };

  const handleChartClick = () => {
    setShowChartModal(true);
  };

  const handleCloseChart = () => {
    setShowChartModal(false);
  };

  // Mannequin images for beach wave product (2D view) - use shared 2D wavy assets
  const mannequinImages = [
    '/assets/2D WAVY FRONT.png',  // View 1 (default)
    '/assets/2D WAVY LEFT.png',   // View 2 (top thumbnail)
    '/assets/2D WAVY RIGHT.png'  // View 3 (bottom thumbnail)
  ];

  // Get current mannequin images based on selected view
  const getCurrentImages = () => {
    if (selectedMannequinView === 0) {
      // Default state: 2D WAVY FRONT in hero
      return {
        hero: mannequinImages[0], // 2D WAVY FRONT
        top: mannequinImages[1],   // 2D WAVY LEFT
        bottom: mannequinImages[2] // 2D WAVY RIGHT
      };
    } else if (selectedMannequinView === 1) {
      // Top thumbnail clicked: 2D WAVY LEFT in hero, 2D WAVY FRONT in top
      return {
        hero: mannequinImages[1], // 2D WAVY LEFT
        top: mannequinImages[0],  // 2D WAVY FRONT
        bottom: mannequinImages[2] // 2D WAVY RIGHT (stays in bottom)
      };
    } else {
      // Bottom thumbnail clicked: 2D WAVY RIGHT in hero, 2D WAVY FRONT in bottom
      return {
        hero: mannequinImages[2], // 2D WAVY RIGHT
        top: mannequinImages[1],  // 2D WAVY LEFT (stays in top)
        bottom: mannequinImages[0] // 2D WAVY FRONT
      };
    }
  };

  const currentImages = getCurrentImages();

  // Get current 3D view images based on selected view
  const get3DViewImages = () => {
    if (selectedMannequinView === 0) {
      // Default state: BEACH WAVE FRONT in hero
      return {
        hero: 'BEACH WAVE FRONT.JPG',
        top: 'BEACH WAVE RIGHT.JPG',
        bottom: 'BEACH WAVE LEFT.JPG'
      };
    } else if (selectedMannequinView === 1) {
      // Top thumbnail clicked: BEACH WAVE RIGHT in hero, BEACH WAVE FRONT in top
      return {
        hero: 'BEACH WAVE RIGHT.JPG',
        top: 'BEACH WAVE FRONT.JPG',
        bottom: 'BEACH WAVE LEFT.JPG'
      };
    } else {
      // Bottom thumbnail clicked: BEACH WAVE LEFT in hero, BEACH WAVE FRONT in bottom
      return {
        hero: 'BEACH WAVE LEFT.JPG',
        top: 'BEACH WAVE RIGHT.JPG',
        bottom: 'BEACH WAVE FRONT.JPG'
      };
    }
  };

  const current3DImages = get3DViewImages();

  const handleTopThumbnailClick = () => {
    if (selectedMannequinView === 0) {
      setSelectedMannequinView(1);
    } else if (selectedMannequinView === 1) {
      setSelectedMannequinView(0);
    } else {
      setSelectedMannequinView(1);
    }
  };

  const handleBottomThumbnailClick = () => {
    if (selectedMannequinView === 0) {
      setSelectedMannequinView(2);
    } else if (selectedMannequinView === 1) {
      setSelectedMannequinView(2);
    } else {
      setSelectedMannequinView(0);
    }
  };

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
    const maxScroll = 0;
    const minScroll = -window.innerWidth * 0.6;
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
    const maxScroll = 0;
    const minScroll = -window.innerWidth * 0.6;
    setScrollPosition(Math.max(minScroll, Math.min(maxScroll, newPosition)));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleTabClick = (
    tabName: 'DETAILS' | 'SHIPPING' | 'POLICY' | 'CARE/STORAGE' | 'REVIEWS'
  ) => {
    setActiveTab(tabName);
  };

  const handleSimilarProductsLeftArrow = () => {
    setSimilarProductsScroll(0);
  };

  const handleSimilarProductsRightArrow = () => {
    setSimilarProductsScroll(-similarSnapPx);
  };

  const handleRecentlyViewedLeftArrow = () => {
    setRecentlyViewedScroll(0);
  };

  const handleRecentlyViewedRightArrow = () => {
    setRecentlyViewedScroll(-recentSnapPx);
  };

  const getTotalPrice = () => {
    const capSize = selectedCustomCap || selectedFlexibleCap || 'M';
    let basePrice = 760; // Default for standard caps (XS, S, M, L)
    if (capSize === 'XXS/XS/S' || capSize === 'S/M/L') {
      basePrice = 800; // Flexible cap options base price is $800
    }
    return basePrice;
  };

  // Load selected currency from localStorage on mount (per-user key)
  useEffect(() => {
    const key = getPerUserKey(PER_USER_KEYS.selectedCurrency, getCurrentUserEmailFromStorage());
    const savedCurrency = localStorage.getItem(key);
    if (savedCurrency && currencyRates[savedCurrency as keyof typeof currencyRates]) {
      if (savedCurrency !== selectedCurrency) setSelectedCurrency(savedCurrency);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save selected currency to localStorage (per-user key)
  useEffect(() => {
    const key = getPerUserKey(PER_USER_KEYS.selectedCurrency, getCurrentUserEmailFromStorage());
    localStorage.setItem(key, selectedCurrency);
  }, [selectedCurrency]);

  // Listen for currency changes from cart dropdown
  useEffect(() => {
    const handleCurrencyChange = () => {
      const key = getPerUserKey(PER_USER_KEYS.selectedCurrency, getCurrentUserEmailFromStorage());
      const savedCurrency = localStorage.getItem(key);
      if (savedCurrency && currencyRates[savedCurrency as keyof typeof currencyRates]) {
        setSelectedCurrency(savedCurrency);
      }
    };

    window.addEventListener('storage', handleCurrencyChange);
    
    const handleCustomCurrencyChange = (event: CustomEvent) => {
      const newCurrency = event.detail;
      if (newCurrency && currencyRates[newCurrency as keyof typeof currencyRates]) {
        setSelectedCurrency(newCurrency);
        const key = getPerUserKey(PER_USER_KEYS.selectedCurrency, getCurrentUserEmailFromStorage());
        localStorage.setItem(key, newCurrency);
      }
    };
    
    window.addEventListener('currencyChanged', handleCustomCurrencyChange as EventListener);
    
    // Poll localStorage periodically to catch any currency changes
    const interval = setInterval(() => {
      handleCurrencyChange();
    }, 500); // Check every 500ms
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleCurrencyChange);
      window.removeEventListener('currencyChanged', handleCustomCurrencyChange as EventListener);
    };
  }, [currencyRates]);

  // Format price with currency
  const formatPrice = React.useCallback((price: number) => {
    const currency = currencyRates[selectedCurrency as keyof typeof currencyRates] || currencyRates.USD;
    const convertedPrice = price * currency.rate;
    return {
      __html: currency.symbol + convertedPrice.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }) + ' ' + selectedCurrency
    };
  }, [currencyRates, selectedCurrency]);

  const handleAddToBag = async () => {
    if (addToBagState === 'adding' || addToBagState === 'added') return;
    if (isWigUnitSoldOut('BEACH WAVE') || isUnitSoldOut('BEACH WAVE')) return;
    
    setAddToBagState('adding');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // CRITICAL: Read customization values from localStorage (or use defaults)
      // This ensures that if user made selections in build-a-wig, they're included
      const defaultLength = localStorage.getItem('selectedLength') || '24"';
      const defaultDensity = localStorage.getItem('selectedDensity') || '200%';
      const defaultLace = localStorage.getItem('selectedLace') || '13X6';
      const defaultTexture = localStorage.getItem('selectedTexture') || 'SILKY';
      const defaultColor = localStorage.getItem('selectedColor') || 'OFF BLACK';
      const defaultHairline = localStorage.getItem('selectedHairline') || 'NATURAL';
      const defaultStyling = localStorage.getItem('selectedStyling') || 'NONE';
      const defaultAddOns: string[] = JSON.parse(localStorage.getItem('selectedAddOns') || '[]');
      
      // CRITICAL: Read customization prices from localStorage (or use 0 if not set)
      // This ensures add-ons and other customizations are included in the price
      const lengthPrice = parseInt(localStorage.getItem('selectedLengthPrice') || '0');
      const densityPrice = parseInt(localStorage.getItem('selectedDensityPrice') || '0');
      const lacePrice = parseInt(localStorage.getItem('selectedLacePrice') || '0');
      const texturePrice = parseInt(localStorage.getItem('selectedTexturePrice') || '0');
      const colorPrice = parseInt(localStorage.getItem('selectedColorPrice') || '0');
      const hairlinePrice = parseInt(localStorage.getItem('selectedHairlinePrice') || '0');
      const stylingPrice = parseInt(localStorage.getItem('selectedStylingPrice') || '0');
      const addOnsPrice = parseInt(localStorage.getItem('selectedAddOnsPrice') || '0');
      
      let capSize: string;
      let capSizePrice: number;
      if (selectedCustomCap) {
        capSize = selectedCustomCap;
        capSizePrice = 0;
      } else if (selectedFlexibleCap) {
        capSize = selectedFlexibleCap;
        capSizePrice = 40;
      } else {
        capSize = 'M';
        capSizePrice = 0;
      }
      
      const basePrice = 760;
      // CRITICAL: Include all customization prices in total calculation
      const totalPrice = basePrice + capSizePrice + lengthPrice + densityPrice + lacePrice + texturePrice + colorPrice + hairlinePrice + stylingPrice + addOnsPrice;
      
      const cartItem = {
        id: `beach-wave-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: 'BEACH WAVE',
        price: totalPrice,
        quantity: quantity,
        image: '/assets/NOIR/wave-thumb.png',
        capSize: capSize,
        capSizePrice: capSizePrice,
        length: defaultLength,
        density: defaultDensity,
        color: defaultColor,
        texture: defaultTexture,
        lace: defaultLace,
        hairline: defaultHairline,
        styling: defaultStyling,
        partSelection: localStorage.getItem('selectedPartSelection') || 'MIDDLE',
        addOns: defaultAddOns
      };
      
      // Add new item at the beginning (newest first)
      const existingCartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      const updatedCartItems = [attachStockStatusToLineItem(cartItem), ...existingCartItems];
      localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
      
      const currentCount = parseInt(localStorage.getItem('cartCount') || '0');
      const newCount = currentCount + quantity;
      localStorage.setItem('cartCount', newCount.toString());
      setCartCount(newCount);
      
      window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: newCount }));
      window.dispatchEvent(new CustomEvent('cartUpdated'));

      trackActivity('add_to_cart', { source: 'product_page', productName: 'BEACH WAVE', quantity });
      
      setAddToBagState('added');
    } catch (error) {
      console.error('Error adding to bag:', error);
      setAddToBagState('idle');
    }
  };

  const totalPrice = getTotalPrice();

  return (
    <div className="min-h-screen" style={{ position: 'relative' }}>
      {/* Marble Floor Background */}
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
          {/* HEADER - same height as concierge for cart dropdown alignment */}
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
                    <img
                      alt="Account icon"
                      width="16"
                      height="16"
                      src="/assets/NOIR/account-icon.svg"
                    />
                  </button>
                  <button 
                    onClick={() => navigate(isSignedIn ? '/wishlist' : signInHrefWithReturnTo(location))} 
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
                    onClick={handleBack} 
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
                  <SearchTrigger className="cursor-pointer" style={{ transform: 'translateX(-2px)' }}>
                <img
                  alt=""
                      width="16"
                      height="15"
                      src="/assets/search-icon.svg"
                    />
                  </SearchTrigger>
                </>
              )}
            </div>
            <NavCenter showMobileMenu={showMobileMenu}>
            <p className="text-sm" style={{ fontFamily: '"Futura PT Book"', transform: 'translateY(1px)' }}>
              {showMobileMenu ? (
                <>
                  <span 
                    style={{ fontFamily: '"Futura PT Book"', fontWeight: '400', cursor: 'pointer' }}
                    onClick={() => navigate('/lobby')}
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
                    onClick={() => navigate('/units/wavy')}
                  >
                    WAVY &gt;
                  </span>{' '}
                  <span
                    style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}
                  >
                    BEACH WAVE
                  </span>
                </>
              )}
            </p>
            </NavCenter>
            <div className="gap-5 flex absolute" style={{ right: '17px' }}>
<div style={{ transform: `translateX(${cartCount === 0 ? 7 : 5}px)` }}>
              <DynamicCartIcon count={cartCount} width={22} height={19} variant="nav" />
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

          {showMobileMenu ? (
            /* MENU CONTENT - responsive height */
            <div
              className="menu-toggle-card border border-black flex flex-col pt-6 pb-4 px-5 mb-2 bg-white/60 backdrop-blur-sm transition-all duration-300 ease-out"
              style={{ 
                borderWidth: '1.3px', 
                minWidth: '100%', 
                maxWidth: 'none', 
                overflow: 'visible',
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                minHeight: 'calc(100dvh - 80px)',
                height: 'calc(100dvh - 80px)'
              }}
            >
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', paddingTop: 'clamp(16px, 2.5vw, 24px)', minHeight: 0, position: 'relative', flex: 1 }}>
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
                      <ShopMobileMenuToolsTab
                        navigate={navigate}
                        closeMenu={() => setShowMobileMenu(false)}
                        labelTranslateX="13px"
                      />
                    ) : mobileMenuActiveTab === 'BRAND' ? (
                      <BrandMenuLinks onClose={() => setShowMobileMenu(false)} />
                    ) : (
                      // SHOP tab with dropdown functionality
                                            <ShopMobileMenuShopTab
                                              navigate={navigate}
                                              mobileMenuExpandedItems={mobileMenuExpandedItems}
                                              handleMobileMenuItemToggle={handleMobileMenuItemToggle}
                                              closeSubItemMenu={() => setShowMobileMenu(false)}
                                              labelTranslateX="13px"
                                              duplicateRowClickForStaticLinks
                                              isSignedInForBuildAWig={isSignedIn}
                                              onBuildAWigRequiresSignIn={() => {
                                                const p = new URLSearchParams(location.search);
                                                p.set('bawMenu', '1');
                                                setBawSignInReturnTo({
                                                  pathname: location.pathname,
                                                  search: `?${p.toString()}`,
                                                });
                                                setShowBawFeatureSignInModal(true);
                                              }}
                                            />
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
                <div style={{ marginBottom: '20px' }}><SocialMenuIcons /></div>
              </div>
            </div>
          ) : (
            <>
          {/* MAIN BUILD AREA */}
          <div
            className="border border-black flex flex-col pt-6 pb-4 px-5 mb-2 bg-white/60 backdrop-blur-sm transition-all duration-300 ease-out"
            style={{ 
              borderWidth: '1.3px', 
              minWidth: '100%', 
              maxWidth: 'none', 
              overflow: 'visible',
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              ...UNIT_PDP_MAIN_CARD_STYLE,
            }}
          >
            {/* WIG PREVIEW - wishlist/2D-3D text hamburgered with images; text near hero & thumbnail edges */}
            <div className="product-wig-preview" style={{ width: '100%', display: 'flex', alignItems: 'center', flexDirection: 'column', marginBottom: '24px', transform: 'translateY(20px)', overflow: 'visible', minWidth: '100%', maxWidth: 'none' }}>
              <div style={{ transform: 'translateY(-4px)', marginBottom: '12px' }}>
              <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'stretch' }}>
                <div style={{ position: 'relative', width: '100%', marginBottom: '4px', transform: 'translateY(0)', minHeight: 'clamp(18px, 2.2vw, 26px)' }}>
                  <p 
                    onClick={handleToggleWishlist}
                    style={{ position: 'absolute', left: 'clamp(4px, 1vw, 12px)', top: '0', color: '#808080', fontFamily: '"Futura PT Demi"', fontSize: '10px', fontWeight: '600', margin: '0', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
                  >
                    {isInWishlist ? '- REMOVE FROM WISHLIST' : '+ ADD TO WISHLIST'}
                  </p>
                  <div 
                    style={{ position: 'absolute', right: 'clamp(4px, 1vw, 12px)', top: '0', display: 'flex', alignItems: 'center', gap: 'clamp(2px, 0.4vw, 6px)', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    onClick={() => {
                      const new3DView = !is3DView;
                      setIs3DView(new3DView);
                      if (typeof window !== 'undefined') {
                        try {
                          persistProduct3dViewPreference(new3DView);
                        } catch (e) {
                          console.error('Error saving 3D view:', e);
                        }
                      }
                    }}
                  >
                    <span style={{ color: is3DView ? '#000000' : '#EB1C24', fontFamily: is3DView ? '"Futura PT Book"' : '"Futura PT Medium"', fontSize: '11px', fontWeight: is3DView ? '400' : '500', margin: '0' }}>2D VIEW</span>
                    <span style={{ color: '#000000', fontFamily: '"Futura PT Book"', fontSize: '11px', fontWeight: '400', margin: '0' }}>/</span>
                    <span style={{ color: is3DView ? '#EB1C24' : '#000000', fontFamily: is3DView ? '"Futura PT Medium"' : '"Futura PT Book"', fontSize: '11px', fontWeight: is3DView ? '500' : '400', margin: '0' }}>3D VIEW</span>
                  </div>
                </div>
                                <UnitPdpWigPreviewImages
                  is3DView={is3DView}
                  currentImages={currentImages}
                  heroFrameBackgroundImage={`url('/assets/${is3DView ? current3DImages.hero : 'leaf-brick-resize.png'}')`}
                  topThumbBackgroundImage={`url('/assets/${is3DView ? current3DImages.top : 'leaf-brick-resize.png'}')`}
                  bottomThumbBackgroundImage={`url('/assets/${is3DView ? current3DImages.bottom : 'leaf-brick-resize.png'}')`}
                  onOpenHeroViewer={() => {
                    const allImages = is3DView
                      ? [`/assets/${current3DImages.hero}`, `/assets/${current3DImages.top}`, `/assets/${current3DImages.bottom}`]
                      : [currentImages.hero, currentImages.top, currentImages.bottom];
                    setViewerImages(allImages);
                    setViewerCurrentIndex(0);
                    setShowImageViewer(true);
                  }}
                  onTopThumbnailClick={handleTopThumbnailClick}
                  onBottomThumbnailClick={handleBottomThumbnailClick}
                />
              </div>

              {/* DISCLAIMER TEXT */}
              <p
                className="text-center uppercase mb-2 product-wig-disclaimer"
                style={{ 
                  fontFamily: '"Futura PT Book"',
                  fontSize: '11px',
                  fontWeight: '400',
                  transform: 'translateY(0)',
                  color: 'black'
                }}
              >
                {is3DView ? (
                  <>
                    (3D MODEL IS WEARING A <span style={{ color: '#808080', fontFamily: '"Futura PT Demi"' }}>FULLY CUSTOMIZED & STYLED</span> UNIT)
                  </>
                ) : (
                  <>
                    (2D MODEL IS FOR <span style={{ color: '#808080', fontFamily: '"Futura PT Demi"' }}>VISUAL & AESTHETIC</span> PURPOSES ONLY)
                  </>
                )}
              </p>
            </div>
            </div>

            {/* PRODUCT NAME */}
            <p
              className="text-center text-black mb-2 beach-wave-product-name"
              style={{ 
                fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif !important',
                fontSize: '42px !important',
                fontWeight: '400 !important',
                lineHeight: '1.2',
                margin: '0 !important',
                padding: '0',
                transform: 'translateY(-8px) !important'
              }}
            >
              BEACH WAVE
            </p>

            {/* PRODUCT SPECIFICATION */}
            <p
              className="text-center text-red-500 uppercase mb-2"
              style={{ 
                fontFamily: '"Futura PT Medium"',
                fontSize: '11px',
                fontWeight: '500',
                transform: 'translateY(-8px)',
                marginTop: '-8px'
              }}
            >
              24" RAW INDONESIAN
            </p>

            {/* PRICE */}
            <div className="text-center mb-1" style={{ transform: 'translateY(-16px)' }}>
              <WigProductPriceDisplay
                productName="BEACH WAVE"
                soldOutPriceTreatment="normal"
                priceHtml={formatPrice(totalPrice)}
                priceStyle={{
                  fontFamily: '"Futura PT Medium"',
                  fontSize: '20px',
                  fontWeight: '500',
                  textAlign: 'center',
                }}
              />
            </div>

            {/* TAX DISCLAIMER */}
            <p
              className="text-center text-black mb-3"
              style={{ 
                fontFamily: '"Futura PT Medium"',
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
                fontFamily: '"Futura PT Demi"',
                fontSize: '10px',
                fontWeight: '600',
                color: '#808080',
                transform: 'translateY(-34px)'
              }}
            >
              OR 4 PAYMENTS OF <span dangerouslySetInnerHTML={formatPrice(Math.ceil(totalPrice / 4))} /> WITH <span style={{ fontWeight: '600', color: '#EB1C24' }}>KLARNA</span>
            </p>

            {/* CAP SIZE SELECTION HEADER */}
            <div style={UNIT_PDP_CAP_SIZE_HEADER_STYLE}>
              <p
                className="text-center text-black uppercase mb-4"
                style={{ 
                  fontFamily: '"Futura PT Demi"',
                  fontSize: '11px',
                  fontWeight: '500',
                  transform: 'translateY(0px)'
                }}
              >
                SELECT CAP SIZE
              </p>

              {/* CAP SIZE MEASUREMENTS */}
              <div className="flex justify-center gap-4 mb-6" style={{ transform: 'translateY(-7px)' }}>
                <span className="text-red-500 font-bold" style={{ fontSize: '10px', fontFamily: '"Futura PT Medium"' }}>XXS: 19"</span>
                <span className="text-red-500 font-bold" style={{ fontSize: '10px', fontFamily: '"Futura PT Medium"' }}>XS: 20"</span>
                <span className="text-red-500 font-bold" style={{ fontSize: '10px', fontFamily: '"Futura PT Medium"' }}>S: 21"</span>
                <span className="text-red-500 font-bold" style={{ fontSize: '10px', fontFamily: '"Futura PT Medium"' }}>M: 22"</span>
                <span className="text-red-500 font-bold" style={{ fontSize: '10px', fontFamily: '"Futura PT Medium"' }}>L: 23"</span>
              </div>

              {/* CUSTOM CAP SECTION */}
              <div className="mb-6">
                <p
                  className="text-center text-black mb-4"
                  style={{ 
                    fontFamily: '"Bohemy", sans-serif',
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
                      fontFamily: '"Futura PT Medium"',
                      fontWeight: '500',
                      minWidth: 'clamp(50px, 12vw, 75px)',
fontSize: '11px',
                  paddingLeft: 'clamp(12px, 1.5vw, 24px)',
                      paddingRight: 'clamp(12px, 1.5vw, 24px)'
                    }}
                  >
                    XS
                  </button>
                  <button 
                    onClick={() => handleCustomCapSelect('S')}
                    className={`border border-black px-6 py-1 ${selectedCustomCap === 'S' ? 'text-red-500 bg-white' : 'text-black bg-white hover:bg-gray-50'}`}
                    style={{ 
                      borderWidth: '1.3px',
                      fontFamily: '"Futura PT Medium"',
                      fontWeight: '500',
                      minWidth: 'clamp(50px, 12vw, 75px)',
fontSize: '11px',
                  paddingLeft: 'clamp(12px, 1.5vw, 24px)',
                      paddingRight: 'clamp(12px, 1.5vw, 24px)'
                    }}
                  >
                    S
                  </button>
                  <button 
                    onClick={() => handleCustomCapSelect('M')}
                    className={`border border-black px-6 py-1 ${selectedCustomCap === 'M' ? 'text-red-500 bg-white' : 'text-black bg-white hover:bg-gray-50'}`}
                    style={{ 
                      borderWidth: '1.3px',
                      fontFamily: '"Futura PT Medium"',
                      fontWeight: '500',
                      minWidth: 'clamp(50px, 12vw, 75px)',
fontSize: '11px',
                  paddingLeft: 'clamp(12px, 1.5vw, 24px)',
                      paddingRight: 'clamp(12px, 1.5vw, 24px)'
                    }}
                  >
                    M
                  </button>
                  <button 
                    onClick={() => handleCustomCapSelect('L')}
                    className={`border border-black px-6 py-1 ${selectedCustomCap === 'L' ? 'text-red-500 bg-white' : 'text-black bg-white hover:bg-gray-50'}`}
                    style={{ 
                      borderWidth: '1.3px',
                      fontFamily: '"Futura PT Medium"',
                      fontWeight: '500',
                      minWidth: 'clamp(50px, 12vw, 75px)',
fontSize: '11px',
                  paddingLeft: 'clamp(12px, 1.5vw, 24px)',
                      paddingRight: 'clamp(12px, 1.5vw, 24px)'
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
                    fontFamily: '"Bohemy", sans-serif',
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
                    style={{ 
                      ...bcfOptionSelectedChrome(selectedFlexibleCap === 'XXS/XS/S'),
                      paddingTop: 'clamp(4px, 0.5vw, 8px)',
                      paddingBottom: 'clamp(4px, 0.5vw, 8px)',
                      paddingLeft: 'clamp(8px, 1vw, 12px)',
                      paddingRight: 'clamp(8px, 1vw, 12px)',
                      fontFamily: '"Futura PT Medium"',
                      fontWeight: '500',
                      width: 'clamp(90px, 18vw, 130px)',
                      minWidth: 'clamp(90px, 18vw, 130px)',
                      fontSize: '11px',
                      boxSizing: 'border-box' as const,
                      backgroundColor: 'white',
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
                    style={{ 
                      ...bcfOptionSelectedChrome(selectedFlexibleCap === 'S/M/L'),
                      paddingTop: 'clamp(4px, 0.5vw, 8px)',
                      paddingBottom: 'clamp(4px, 0.5vw, 8px)',
                      paddingLeft: 'clamp(8px, 1vw, 12px)',
                      paddingRight: 'clamp(8px, 1vw, 12px)',
                      fontFamily: '"Futura PT Medium"',
                      fontWeight: '500',
                      width: 'clamp(90px, 18vw, 130px)',
                      minWidth: 'clamp(90px, 18vw, 130px)',
                      fontSize: '11px',
                      boxSizing: 'border-box' as const,
                      backgroundColor: 'white',
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
              <div className="flex justify-center" style={{ transform: 'translateY(-30px)', marginBottom: '0' }}>
                <button 
                  onClick={handleQuantityDecrease}
                  disabled={quantity <= 1}
                  className={`px-3 py-1 text-red-500 bg-white hover:bg-gray-50 flex items-center justify-center ${quantity <= 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  style={{ 
                    borderTop: '1.3px solid black',
                    borderLeft: '1.3px solid black', 
                    borderBottom: '1.3px solid black',
                    borderRight: 'none',
                    height: 'clamp(27px, 4vw, 36px)',
                    minHeight: 'clamp(27px, 4vw, 36px)',
                    boxSizing: 'border-box',
                    outline: 'none',
                    paddingLeft: 'clamp(8px, 1vw, 14px)',
                    paddingRight: 'clamp(8px, 1vw, 14px)'
                  }}
                >
                  <span style={{ fontFamily: 'Cascadia Code, monospace', fontSize: '11px' }}>-</span>
                </button>
                <div 
                  className="px-4 py-1 text-black bg-white flex items-center justify-center relative" 
                  style={{ 
                    borderTop: '1.3px solid black',
                    borderBottom: '1.3px solid black',
                    borderLeft: 'none',
                    borderRight: 'none',
                    fontFamily: '"Futura PT Medium"', 
                    fontWeight: '500', 
                    fontSize: '12px', 
                    height: 'clamp(27px, 4vw, 36px)',
                    minHeight: 'clamp(27px, 4vw, 36px)',
                    boxSizing: 'border-box',
                    paddingLeft: 'clamp(12px, 1.5vw, 18px)',
                    paddingRight: 'clamp(12px, 1.5vw, 18px)'
                  }}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-black"></div>
                  <div className="absolute right-0 top-0 bottom-0 w-px bg-black"></div>
                  {quantity}
                </div>
                <button 
                  onClick={handleQuantityIncrease}
                  disabled={quantity >= 10}
                  className={`px-3 py-1 text-red-500 bg-white hover:bg-gray-50 flex items-center justify-center ${quantity >= 10 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  style={{ 
                    borderTop: '1.3px solid black',
                    borderRight: '1.3px solid black',
                    borderBottom: '1.3px solid black',
                    borderLeft: 'none',
                    height: 'clamp(27px, 4vw, 36px)',
                    minHeight: 'clamp(27px, 4vw, 36px)',
                    boxSizing: 'border-box',
                    outline: 'none',
                    paddingLeft: 'clamp(8px, 1vw, 14px)',
                    paddingRight: 'clamp(8px, 1vw, 14px)'
                  }}
                >
                  <span style={{ fontFamily: 'Cascadia Code, monospace', fontSize: '11px' }}>+</span>
                </button>
              </div>

              {/* CAP SIZE CHART IMAGE - responsive: scales up on larger screens */}
              <div className="flex justify-center w-full" style={UNIT_PDP_CAP_CHART_ROW_STYLE}>
                <img
                  src="/assets/NOIR/cap-size-chart.png"
                  alt="Cap Size Chart"
                  className="max-w-full h-auto object-contain"
                  style={UNIT_PDP_CAP_CHART_IMG_STYLE}
                  onClick={handleChartClick}
                />
              </div>

              {/* CHART MODAL - Rendered via Portal */}
              {showChartModal && createPortal(
                <div 
                  style={{
                    position: 'fixed',
                    inset: '0',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(3px)',
                    WebkitBackdropFilter: 'blur(3px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10000,
                    margin: '0',
                    padding: '0'
                  }}
                  onClick={handleCloseChart}
                >
                  <div 
                    style={{
                      position: 'relative',
                      maxWidth: 'calc(90vw - 4px)',
                      maxHeight: '90vh',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: 'auto'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <img
                      src="/assets/wig-chart.png"
                      alt="Enlarged Cap Size Chart"
                      style={{ 
                        maxWidth: '100%',
                        maxHeight: '100%',
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        borderRadius: '0',
                        transform: 'scale(1.05)'
                      }}
                    />
                  </div>
                </div>,
                document.body
              )}
          </div>
        </div>
          <UnitPdpCartActions
            productName="BEACH WAVE"
            soldOut={isUnitSoldOut('BEACH WAVE')}
            addToBagState={addToBagState}
            onAddToBag={handleAddToBag}
            buttonFontFamily='"Futura PT Medium"'
            onCustomize={() => {
                if (!isSignedIn) {
                  setBawSignInReturnTo({ pathname: location.pathname, search: location.search || '' });
                  setShowBawFeatureSignInModal(true);
                  return;
                }
                // Check if item is in the bag (default configuration)
                if (addToBagState === 'added') {
                  // Item is in bag - enter edit mode
                  try {
                    const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
                    
                    // Find the matching cart item with default configuration
                    let matchingItem: any = null;
                    for (const item of cartItems) {
                      if (matchesDefaultConfiguration(item)) {
                        matchingItem = item;
                        break;
                      }
                    }
                    
                    if (matchingItem) {
                      // Set up edit mode
                      localStorage.setItem('editingCartItem', JSON.stringify(matchingItem));
                      localStorage.setItem('editingCartItemId', matchingItem.id);
                      
                      // Navigate to edit mode
                      navigate('/build-a-wig/beach-wave/edit');
                      return;
                    }
                  } catch (e) {
                    console.error('Error setting up edit mode:', e);
                  }
                }
                
                // Item is NOT in bag - enter customize mode
                // Store the selected cap size in localStorage for customize page
                // Save to both selectedCapSize and customizeSelectedCapSize for consistency
                const capSizeToSave = selectedCustomCap || selectedFlexibleCap;
                if (capSizeToSave) {
                  if (typeof window !== 'undefined') {
                    try {
                      localStorage.setItem('selectedCapSize', capSizeToSave);
                      localStorage.setItem('customizeSelectedCapSize', capSizeToSave);
                      const isFlexibleCap = capSizeToSave === 'XXS/XS/S' || capSizeToSave === 'S/M/L';
                      const capSizePrice = isFlexibleCap ? '40' : '0';
                      localStorage.setItem('selectedCapSizePrice', capSizePrice);
                      localStorage.setItem('customizeSelectedCapSizePrice', capSizePrice);
                    } catch (e) {
                      console.error('Error saving cap size:', e);
                    }
                  }
                }
                
                // Set defaults for other selections so customize page loads with defaults + selected cap
                const defaults = {
                  length: '24"',
                  density: '200%',
                  lace: '13X6',
                  texture: 'SILKY',
                  color: 'OFF BLACK',
                  hairline: 'NATURAL',
                  styling: 'NONE',
                  addOns: [],
                };
                
                // Save to both selected* and customizeSelected* keys
                localStorage.setItem('selectedLength', defaults.length);
                localStorage.setItem('selectedDensity', defaults.density);
                localStorage.setItem('selectedLace', defaults.lace);
                localStorage.setItem('selectedTexture', defaults.texture);
                localStorage.setItem('selectedColor', defaults.color);
                localStorage.setItem('selectedHairline', defaults.hairline);
                localStorage.setItem('selectedStyling', defaults.styling);
                localStorage.setItem('selectedAddOns', JSON.stringify(defaults.addOns));
                
                localStorage.setItem('customizeSelectedLength', defaults.length);
                localStorage.setItem('customizeSelectedDensity', defaults.density);
                localStorage.setItem('customizeSelectedLace', defaults.lace);
                localStorage.setItem('customizeSelectedTexture', defaults.texture);
                localStorage.setItem('customizeSelectedColor', defaults.color);
                localStorage.setItem('customizeSelectedHairline', defaults.hairline);
                localStorage.setItem('customizeSelectedStyling', defaults.styling);
                localStorage.setItem('customizeSelectedAddOns', JSON.stringify(defaults.addOns));
                
                // Set all default prices to 0
                localStorage.setItem('selectedLengthPrice', '0');
                localStorage.setItem('selectedDensityPrice', '0');
                localStorage.setItem('selectedLacePrice', '0');
                localStorage.setItem('selectedTexturePrice', '0');
                localStorage.setItem('selectedColorPrice', '0');
                localStorage.setItem('selectedHairlinePrice', '0');
                localStorage.setItem('selectedStylingPrice', '0');
                localStorage.setItem('selectedAddOnsPrice', '0');
                
                localStorage.setItem('customizeSelectedLengthPrice', '0');
                localStorage.setItem('customizeSelectedDensityPrice', '0');
                localStorage.setItem('customizeSelectedLacePrice', '0');
                localStorage.setItem('customizeSelectedTexturePrice', '0');
                localStorage.setItem('customizeSelectedColorPrice', '0');
                localStorage.setItem('customizeSelectedHairlinePrice', '0');
                localStorage.setItem('customizeSelectedStylingPrice', '0');
                localStorage.setItem('customizeSelectedAddOnsPrice', '0');
                
                // Clear any existing editing state
                localStorage.removeItem('editingCartItem');
                localStorage.removeItem('editingCartItemId');
                
                console.log('Customize page - Starting fresh customization with cap size:', capSizeToSave);
                
                navigate('/build-a-wig/beach-wave/customize');
            }}
          />

          <div
            className="border border-black flex flex-col pt-4 pb-4 px-5 mb-1 bg-white/60 backdrop-blur-sm transition-all duration-300 ease-out"
            style={{
              borderWidth: '1.3px',
              minWidth: '100%',
              maxWidth: 'none',
              overflow: 'hidden',
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              paddingBottom: '16px',
              marginTop: '24px',
            }}
          >
            {/* PRODUCT SHOTS SECTION */}
            <div className="mt-2 mb-4">
              {/* Product Images with Drag/Swipe Scroll */}
              <div className="relative overflow-hidden" style={{ height: '310px', minHeight: '310px', paddingTop: '70px' }}>
                <div 
                  className="flex transition-transform duration-300 ease-out"
                  style={{ 
                    width: '300%',
                    transform: `translateX(${scrollPosition}px)`,
                    gap: '11px',
                    alignItems: 'center',
                    height: '100%'
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
                    src="/assets/BEACH WAVE LEFT.JPG"
                    alt="BEACH WAVE Left View"
                    className="object-cover"
                    style={{ width: '18%', height: '290px', maxHeight: '290px', flexShrink: 0, transform: 'translateY(-55px)', cursor: 'pointer' }}
                    draggable={false}
                    onClick={() => {
                      const productShotImages = [
                        '/assets/BEACH WAVE LEFT.JPG',
                        '/assets/BEACH WAVE FRONT.JPG',
                        '/assets/BEACH WAVE RIGHT.JPG'
                      ];
                      setViewerImages(productShotImages);
                      setViewerCurrentIndex(0);
                      setShowImageViewer(true);
                    }}
                  />
                  <img
                    src="/assets/BEACH WAVE FRONT.JPG"
                    alt="BEACH WAVE Front View"
                    className="object-cover"
                    style={{ width: '18%', height: '290px', maxHeight: '290px', flexShrink: 0, transform: 'translateY(-55px)', cursor: 'pointer' }}
                    draggable={false}
                    onClick={() => {
                      const productShotImages = [
                        '/assets/BEACH WAVE LEFT.JPG',
                        '/assets/BEACH WAVE FRONT.JPG',
                        '/assets/BEACH WAVE RIGHT.JPG'
                      ];
                      setViewerImages(productShotImages);
                      setViewerCurrentIndex(1);
                      setShowImageViewer(true);
                    }}
                  />
                  <img
                    src="/assets/BEACH WAVE RIGHT.JPG"
                    alt="BEACH WAVE Right View"
                    className="object-cover"
                    style={{ width: '18%', height: '290px', maxHeight: '290px', flexShrink: 0, transform: 'translateY(-55px)', cursor: 'pointer' }}
                    draggable={false}
                    onClick={() => {
                      const productShotImages = [
                        '/assets/BEACH WAVE LEFT.JPG',
                        '/assets/BEACH WAVE FRONT.JPG',
                        '/assets/BEACH WAVE RIGHT.JPG'
                      ];
                      setViewerImages(productShotImages);
                      setViewerCurrentIndex(2);
                      setShowImageViewer(true);
                    }}
                  />
                </div>
                
                {/* Product Shots Text Overlay */}
                <div 
                  className="absolute left-1/2 transform -translate-x-1/2"
                  style={{
                    bottom: '-1px',
                    fontFamily: '"Bohemy", sans-serif',
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
              <div style={UNIT_PDP_TABS_SECTION_STYLE}>
                {/* Tab Navigation */}
                <div className="flex justify-center" style={{ gap: '16px' }}>
                  <button
                    onClick={() => handleTabClick('DETAILS')}
                    className={`py-1 text-xs font-medium ${activeTab === 'DETAILS' ? 'text-red-500' : 'text-black hover:text-red-500'}`}
                    style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', borderBottom: activeTab === 'DETAILS' ? '1px solid #EB1C24' : 'none', paddingLeft: 0, paddingRight: 0 }}
                  >
                    DETAILS
                  </button>
                  <button
                    onClick={() => handleTabClick('SHIPPING')}
                    className={`py-1 text-xs font-medium ${activeTab === 'SHIPPING' ? 'text-red-500' : 'text-black hover:text-red-500'}`}
                    style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', borderBottom: activeTab === 'SHIPPING' ? '1px solid #EB1C24' : 'none', paddingLeft: 0, paddingRight: 0 }}
                  >
                    SHIPPING
                  </button>
                  <button
                    onClick={() => handleTabClick('POLICY')}
                    className={`py-1 text-xs font-medium ${activeTab === 'POLICY' ? 'text-red-500' : 'text-black hover:text-red-500'}`}
                    style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', borderBottom: activeTab === 'POLICY' ? '1px solid #EB1C24' : 'none', paddingLeft: 0, paddingRight: 0 }}
                  >
                    POLICY
                  </button>
                  <button
                    onClick={() => handleTabClick('CARE/STORAGE')}
                    className={`py-1 text-xs font-medium ${activeTab === 'CARE/STORAGE' ? 'text-red-500' : 'text-black hover:text-red-500'}`}
                    style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', borderBottom: activeTab === 'CARE/STORAGE' ? '1px solid #EB1C24' : 'none', paddingLeft: 0, paddingRight: 0 }}
                  >
                    CARE/STORAGE
                  </button>
                  <button
                    onClick={() => handleTabClick('REVIEWS')}
                    className={`py-1 text-xs font-medium ${activeTab === 'REVIEWS' ? 'text-red-500' : 'text-black hover:text-red-500'}`}
                    style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', borderBottom: activeTab === 'REVIEWS' ? '1px solid #EB1C24' : 'none', paddingLeft: 0, paddingRight: 0 }}
                  >
                    REVIEWS
                  </button>
                </div>

                {/* Tab Content */}
                <div className="mt-4 space-y-4" style={UNIT_PDP_TAB_CONTENT_STYLE}>
                                    {activeTab === 'DETAILS' && <UnitProductDetailsTab unitKey="beach-wave" />}
                  {activeTab === 'SHIPPING' && <NoirProductShippingTab />}
                  {activeTab === 'POLICY' && <NoirProductPolicyTab />}
                  {activeTab === 'CARE/STORAGE' && <NoirProductCareStorageTab />}
                  
                  {activeTab === 'REVIEWS' && (
                    <div style={{ textAlign: 'center', padding: '20px 0 0px 0', transform: 'translateY(-12px)' }}>
                      <div style={{ marginBottom: '40px' }}>
                        <h3 style={{ 
                          fontFamily: '"Futura PT Medium"', 
                          fontSize: '11px', 
                          color: '#EB1C24', 
                          fontWeight: '500',
                          marginBottom: '15px',
                          textTransform: 'uppercase'
                        }}>
                          LEAVE A REVIEW!
                        </h3>
                        
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
                            fontFamily: '"Futura PT Medium"', 
                            fontSize: '11px', 
                            color: 'black',
                            textTransform: 'uppercase',
                            margin: '0'
                          }}>
                            4.97 OUT OF 5 STARS
                          </p>
                          <p style={{ 
                            fontFamily: '"Futura PT Demi"', 
                            fontSize: '9px', 
                            color: '#808080',
                            textTransform: 'uppercase',
                            margin: '0',
                            transform: 'translateY(3px)'
                          }}>
                            BASED ON 14 VERIFIED REVIEWS
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        {/* SIMILAR PRODUCTS SECTION */}
        <div className="px-0 md:px-0" style={{ marginTop: '20px', marginBottom: '20px' }}>
          <div 
            className="backdrop-blur-sm"
            style={{ 
            border: '1.3px solid black', 
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
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
                fontFamily: '"Futura PT Medium"',
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
            <div style={marbleStripNavRowStyle}>
              {/* Left Arrow */}
              <button 
                onClick={handleSimilarProductsLeftArrow}
                style={marbleStripNavArrowStyle('left', is3DView)}>
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
              <div style={marbleStripNavMiddleColStyle}>
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
                <div
                  ref={setSimilarStripViewportRef}
                  style={marbleStripViewportStyle}
                >
                  <div style={marbleStripScrollRowStyle(similarProductsScroll)}>
                {/* Product 1 - SOFT WAVE */}
                <div onClick={() => navigate('/wavy/soft-wave')} style={marbleStripCellOuter}>
                  <div style={marbleStripCellBand(is3DView)}>
                    <div style={marbleStripThumbWrap(is3DView)}>
                  <img
                    src={is3DView ? "/assets/NOIR/wave front.png" : "/assets/NOIR/wave-thumb.png"}
                    alt="SOFT WAVE"
                    style={marbleStripThumbImg(is3DView)}
                  />
                    </div>
                    <div style={marbleStripTextColStrip(is3DView)}>
                  <p style={{ 
                    fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                    fontSize: '18px',
                    color: 'black',
                    textTransform: 'uppercase',
                    margin: '0 0 2px 0',
                    fontWeight: '500',
                    lineHeight: 1.05,
                    minHeight: '22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    SOFT WAVE
                  </p>
                  <p style={{ 
                    fontFamily: '"Futura PT Medium"',
                    fontSize: '10px',
                    color: '#EB1C24',
                    textTransform: 'uppercase',
                    margin: '2px 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84',
                  }}>
                    24" RAW INDIAN
                  </p>
                  <WigStripPrice productName="SOFT WAVE" style={{ 
                    fontFamily: '"Futura PT Medium"',
                    fontSize: '12px',
                    color: 'black',
                    textTransform: 'uppercase',
                    margin: '0 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84',
                  }}
                  priceHtml={formatPrice(760)}
                  />
                  <div style={marbleStripStarsRowStyle(is3DView)}>
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
                
                {/* Product 2 - NOIR */}
                <div onClick={() => navigate('/straight/noir')} style={marbleStripCellOuter}>
                  <div style={marbleStripCellBand(is3DView)}>
                    <div style={marbleStripThumbWrap(is3DView)}>
                  <img
                    src={is3DView ? "/assets/NOIR/noir front.png" : "/assets/NOIR/noir-thumb.png"}
                    alt="NOIR"
                    style={marbleStripThumbImg(is3DView)}
                  />
                    </div>
                    <div style={marbleStripTextColStrip(is3DView)}>
                  <p style={{ 
                    fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                    fontSize: '18px',
                    color: 'black',
                    textTransform: 'uppercase',
                    margin: '0 0 2px 0',
                    fontWeight: '500',
                    lineHeight: 1.05,
                    minHeight: '22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    NOIR
                  </p>
                  <p style={{ 
                    fontFamily: '"Futura PT Medium"',
                    fontSize: '10px',
                    color: '#EB1C24',
                    textTransform: 'uppercase',
                    margin: '2px 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84',
                  }}>
                    24" RAW CAMBODIAN
                  </p>
                  <WigStripPrice productName="NOIR" style={{ 
                    fontFamily: '"Futura PT Medium"',
                    fontSize: '12px',
                    color: 'black',
                    textTransform: 'uppercase',
                    margin: '0 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84',
                  }}
                  priceHtml={formatPrice(740)}
                  />
                  <div style={marbleStripStarsRowStyle(is3DView)}>
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
                
                {/* Product 3 - SOFT CURL */}
                <div onClick={() => navigate('/curly/soft-curl')} style={marbleStripCellOuter}>
                  <div style={marbleStripCellBand(is3DView)}>
                    <div style={marbleStripThumbWrap(is3DView)}>
                  <img
                    src={is3DView ? "/assets/soft curl thumbnail.png" : "/assets/NOIR/curl-thumb.png"}
                    alt="SOFT CURL"
                    style={marbleStripThumbImg(is3DView)}
                  />
                    </div>
                    <div style={marbleStripTextColStrip(is3DView)}>
                  <p style={{ 
                    fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                    fontSize: '18px',
                    color: 'black',
                    textTransform: 'uppercase',
                    margin: '0 0 2px 0',
                    fontWeight: '500',
                    lineHeight: 1.05,
                    minHeight: '22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    SOFT CURL
                  </p>
                  <p style={{ 
                    fontFamily: '"Futura PT Medium"',
                    fontSize: '10px',
                    color: '#EB1C24',
                    textTransform: 'uppercase',
                    margin: '2px 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84',
                  }}>
                    24" RAW FILIPINO
                  </p>
                  <WigStripPrice productName="SOFT CURL" style={{ 
                    fontFamily: '"Futura PT Medium"',
                    fontSize: '12px',
                    color: 'black',
                    textTransform: 'uppercase',
                    margin: '0 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84',
                  }}
                  priceHtml={formatPrice(780)}
                  />
                  <div style={marbleStripStarsRowStyle(is3DView)}>
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
                
                {/* Product 4 - OCEAN CURL */}
                <div onClick={() => navigate('/curly/ocean-curl')} style={marbleStripCellOuter}>
                  <div style={marbleStripCellBand(is3DView)}>
                    <div style={marbleStripThumbWrap(is3DView)}>
                  <img
                    src={is3DView ? "/assets/ocean curl thumbnail.png" : "/assets/NOIR/curl-thumb.png"}
                    alt="OCEAN CURL"
                    style={marbleStripThumbImg(is3DView)}
                  />
                    </div>
                    <div style={marbleStripTextColStrip(is3DView)}>
                  <p style={{ 
                    fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                    fontSize: '18px',
                    color: 'black',
                    textTransform: 'uppercase',
                    margin: '0 0 2px 0',
                    fontWeight: '500',
                    lineHeight: 1.05,
                    minHeight: '22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    OCEAN CURL
                  </p>
                  <p style={{ 
                    fontFamily: '"Futura PT Medium"',
                    fontSize: '10px',
                    color: '#EB1C24',
                    textTransform: 'uppercase',
                    margin: '2px 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84',
                  }}>
                    24" RAW VIETNAMESE
                  </p>
                  <WigStripPrice productName="OCEAN CURL" style={{ 
                    fontFamily: '"Futura PT Medium"',
                    fontSize: '12px',
                    color: 'black',
                    textTransform: 'uppercase',
                    margin: '0 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84',
                  }}
                  priceHtml={formatPrice(780)}
                  />
                  <div style={marbleStripStarsRowStyle(is3DView)}>
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
                </div>
              </div>
              
              {/* Right Arrow */}
              <button 
                onClick={handleSimilarProductsRightArrow}
                style={marbleStripNavArrowStyle('right', is3DView)}>
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
        <div
          className="px-0 md:px-0"
          style={withUnitPdpRecentlyViewedVisibility({ marginTop: '3px', marginBottom: '20px' })}
        >
          <div 
            className="backdrop-blur-sm"
            style={{ 
            border: '1.3px solid black', 
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            padding: '0px',
            maxWidth: '100%',
            margin: '0 auto',
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
                fontFamily: '"Futura PT Medium"',
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
            <div style={marbleStripNavRowStyle}>
              {/* Left Arrow */}
              <button 
                onClick={handleRecentlyViewedLeftArrow}
                style={marbleStripNavArrowStyle('left', is3DView)}>
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
              <div style={marbleStripNavMiddleColStyle}>
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
                <div
                  ref={setRecentStripViewportRef}
                  style={marbleStripViewportStyle}
                >
                  <div style={marbleStripScrollRowStyle(recentlyViewedScroll)}>
                {/* Product 1 - BEACH WAVE */}
                <div onClick={() => navigate('/wavy/soft-wave')} style={marbleStripCellOuter}>
                  <div style={marbleStripCellBand(is3DView)}>
                    <div style={marbleStripThumbWrap(is3DView)}>
                  <img
                    src={is3DView ? "/assets/NOIR/wave front.png" : "/assets/NOIR/wave-thumb.png"}
                    alt="SOFT WAVE"
                    style={marbleStripThumbImg(is3DView)}
                  />
                    </div>
                    <div style={marbleStripTextColStrip(is3DView)}>
                  <p style={{ 
                    fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                    fontSize: '18px',
                    color: 'black',
                    textTransform: 'uppercase',
                    margin: '0 0 2px 0',
                    fontWeight: '500',
                    lineHeight: 1.05,
                    minHeight: '22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    SOFT WAVE
                  </p>
                  <p style={{ 
                    fontFamily: '"Futura PT Medium"',
                    fontSize: '10px',
                    color: '#EB1C24',
                    textTransform: 'uppercase',
                    margin: '2px 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84',
                  }}>
                    24" RAW INDIAN
                  </p>
                  <WigStripPrice productName="SOFT WAVE" style={{ 
                    fontFamily: '"Futura PT Medium"',
                    fontSize: '12px',
                    color: 'black',
                    textTransform: 'uppercase',
                    margin: '0 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84',
                  }}
                  priceHtml={formatPrice(760)}
                  />
                  <div style={marbleStripStarsRowStyle(is3DView)}>
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
                
                {/* Product 2 - OCEAN CURL */}
                <div onClick={() => navigate('/curly/ocean-curl')} style={marbleStripCellOuter}>
                  <div style={marbleStripCellBand(is3DView)}>
                    <div style={marbleStripThumbWrap(is3DView)}>
                  <img
                    src={is3DView ? "/assets/ocean curl thumbnail.png" : "/assets/NOIR/curl-thumb.png"}
                    alt="OCEAN CURL"
                    style={marbleStripThumbImg(is3DView)}
                  />
                    </div>
                    <div style={marbleStripTextColStrip(is3DView)}>
                  <p style={{ 
                    fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                    fontSize: '18px',
                    color: 'black',
                    textTransform: 'uppercase',
                    margin: '0 0 2px 0',
                    fontWeight: '500',
                    lineHeight: 1.05,
                    minHeight: '22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    OCEAN CURL
                  </p>
                  <p style={{ 
                    fontFamily: '"Futura PT Medium"',
                    fontSize: '10px',
                    color: '#EB1C24',
                    textTransform: 'uppercase',
                    margin: '2px 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84',
                  }}>
                    24" RAW VIETNAMESE
                  </p>
                  <WigStripPrice productName="OCEAN CURL" style={{ 
                    fontFamily: '"Futura PT Medium"',
                    fontSize: '12px',
                    color: 'black',
                    textTransform: 'uppercase',
                    margin: '0 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84',
                  }}
                  priceHtml={formatPrice(780)}
                  />
                  <div style={marbleStripStarsRowStyle(is3DView)}>
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
                
                {/* Product 3 - NOIR */}
                <div onClick={() => navigate('/straight/noir')} style={marbleStripCellOuter}>
                  <div style={marbleStripCellBand(is3DView)}>
                    <div style={marbleStripThumbWrap(is3DView)}>
                  <img
                    src={is3DView ? "/assets/NOIR/noir front.png" : "/assets/NOIR/noir-thumb.png"}
                    alt="NOIR"
                    style={marbleStripThumbImg(is3DView)}
                  />
                    </div>
                    <div style={marbleStripTextColStrip(is3DView)}>
                  <p style={{ 
                    fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                    fontSize: '18px',
                    color: 'black',
                    textTransform: 'uppercase',
                    margin: '0 0 2px 0',
                    fontWeight: '500',
                    lineHeight: 1.05,
                    minHeight: '22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    NOIR
                  </p>
                  <p style={{ 
                    fontFamily: '"Futura PT Medium"',
                    fontSize: '10px',
                    color: '#EB1C24',
                    textTransform: 'uppercase',
                    margin: '2px 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84',
                  }}>
                    24" RAW CAMBODIAN
                  </p>
                  <WigStripPrice productName="NOIR" style={{ 
                    fontFamily: '"Futura PT Medium"',
                    fontSize: '12px',
                    color: 'black',
                    textTransform: 'uppercase',
                    margin: '0 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84',
                  }}
                  priceHtml={formatPrice(740)}
                  />
                  <div style={marbleStripStarsRowStyle(is3DView)}>
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
                
                {/* Product 4 - BLANCO */}
                <div onClick={() => navigate('/straight/blanco')} style={marbleStripCellOuter}>
                  <div style={marbleStripCellBand(is3DView)}>
                    <div style={marbleStripThumbWrap(is3DView)}>
                  <img
                    src={is3DView ? "/assets/NOIR/blanco front.png" : "/assets/NOIR/blanco-thumb.png"}
                    alt="BLANCO"
                    style={marbleStripThumbImg(is3DView)}
                  />
                    </div>
                    <div style={marbleStripTextColStrip(is3DView)}>
                  <p style={{ 
                    fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                    fontSize: '18px',
                    color: 'black',
                    textTransform: 'uppercase',
                    margin: '0 0 2px 0',
                    fontWeight: '500',
                    lineHeight: 1.05,
                    minHeight: '22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    BLANCO
                  </p>
                  <p style={{ 
                    fontFamily: '"Futura PT Medium"',
                    fontSize: '10px',
                    color: '#EB1C24',
                    textTransform: 'uppercase',
                    margin: '2px 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84',
                  }}>
                    24" RAW RUSSIAN
                  </p>
                  <WigStripPrice productName="BLANCO" style={{ 
                    fontFamily: '"Futura PT Medium"',
                    fontSize: '12px',
                    color: 'black',
                    textTransform: 'uppercase',
                    margin: '0 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84',
                  }}
                  priceHtml={formatPrice(820)}
                  />
                  <div style={marbleStripStarsRowStyle(is3DView)}>
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
                </div>
              </div>
              
              {/* Right Arrow */}
              <button 
                onClick={handleRecentlyViewedRightArrow}
                style={marbleStripNavArrowStyle('right', is3DView)}>
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
            </>
          )}
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

      <BuildAWigFeatureSignInModal
        isOpen={showBawFeatureSignInModal}
        onClose={() => setShowBawFeatureSignInModal(false)}
        returnTo={bawSignInReturnTo}
      />

      {/* Image Viewer Modal */}
      <ImageViewerModal
        isOpen={showImageViewer}
        onClose={() => setShowImageViewer(false)}
        images={viewerImages}
        currentIndex={viewerCurrentIndex}
        onNavigate={setViewerCurrentIndex}
      />
    </div>
  );
}

export default BeachWaveSelection;
