import React, { useState, useEffect } from 'react';
import { useMarbleStripSnapStep } from '../../../hooks/useMarbleStripSnapStep';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
// @ts-expect-error - Import kept for potential future use
import ThumbBox from '../../../components/ThumbBox';
import DynamicCartIcon from '../../../components/DynamicCartIcon';
import LoadingScreen from '../../../components/base/LoadingScreen';
import ConfirmationModal from '../../../components/ConfirmationModal';
import BuildAWigFeatureSignInModal from '../../../components/BuildAWigFeatureSignInModal';
import ImageViewerModal, { type ImageViewerDownloadLink } from '../../../components/ImageViewerModal';
import BrandMenuLinks from '../../../components/BrandMenuLinks';
import SocialMenuIcons from '../../../components/SocialMenuIcons';
import { trackActivity } from '../../../utils/activity';
import { persistProduct3dViewPreference, readProduct3dViewPreference } from '../../../utils/product3dViewPreference';
import { navigateUnitProductBack } from '../../../utils/navigateBack';
import { getPerUserKey, getCurrentUserEmailFromStorage, PER_USER_KEYS } from '../../../utils/perUserStorage';
import { isAdminFounderAccount, signOutAppAndSupabaseSession } from '../../../utils/adminAuth';
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
import { downloadCompositeLeafBrickPng } from '../../../utils/compositeLeafBrickMannequinPng';
import { bcfOptionSelectedChrome } from '../../../utils/bcfProductOptions';
import { MENU_TOGGLE_PANEL_HEIGHT } from '../../../layouts/menuToggleHeights';
import {
  clearBawNoirLiveBangsWigViews,
  clearBawNoirLiveColorWigViews,
  clearBawNoirLiveStylingWigViews,
  clearPendingBawNoirLiveColorWigViews,
  SESSION_BAW_NOIR_RESET_LIVE_ON_CUSTOMIZE,
} from '../../../utils/bawNoirLivePreviewStorage';

interface DensityOption {
  id: string;
  name: string;
  percentage: string;
  description: string;
  price: number;
  image: string;
}

/**
 * 2D downloads: composite **natural** mannequin + leaf brick (same stack as hero 2D), not `/assets/NOIR/noir *.png` (3D product shots).
 */
const NOIR_2D_COMPOSITE_DOWNLOAD_SPECS: { mannequinSrc: string; label: string; download: string }[] = [
  { mannequinSrc: '/assets/natural left.png', label: 'LEFT (L)', download: 'noir-2d-left-leaf-brick.png' },
  { mannequinSrc: '/assets/natural front.png', label: 'FRONT (M)', download: 'noir-2d-front-leaf-brick.png' },
  { mannequinSrc: '/assets/natural right.png', label: 'RIGHT (R)', download: 'noir-2d-right-leaf-brick.png' },
];

const NOIR_2D_VIEWER_DOWNLOADS: ImageViewerDownloadLink[] = NOIR_2D_COMPOSITE_DOWNLOAD_SPECS.map((s) => ({
  label: s.label,
  download: s.download,
  onDownload: () => downloadCompositeLeafBrickPng(s.mannequinSrc, s.download),
}));

function NoirSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { NavCenter, SearchTrigger } = useShopNavSearchBar();
  // Fix for window.REACT_APP_NAVIGATE - use navigate hook instead
  const [selectedDensity, setSelectedDensity] = useState(() => {
    return localStorage.getItem('selectedDensity') || '200%';
  });
  const [selectedCustomCap, setSelectedCustomCap] = useState('M');
  const [selectedFlexibleCap, setSelectedFlexibleCap] = useState('');
  const [showLoading, setShowLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showChartModal, setShowChartModal] = useState(false);
  const [selectedMannequinView, setSelectedMannequinView] = useState(0);
  const [is3DView, setIs3DView] = useState(() => readProduct3dViewPreference());
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [viewerCurrentIndex, setViewerCurrentIndex] = useState(0);
  /** When set, enlarged `ImageViewerModal` shows the same 2D NOIR PNG download row as under product shots. */
  const [viewerModalDownloads, setViewerModalDownloads] = useState<ImageViewerDownloadLink[] | null>(null);
  const [showAdminFounder2dDownloads, setShowAdminFounder2dDownloads] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startScrollPosition, setStartScrollPosition] = useState(0);
  const [activeTab, setActiveTab] = usePersistentQueryState<
    'DETAILS' | 'SHIPPING' | 'POLICY' | 'CARE/STORAGE' | 'REVIEWS'
  >({
    queryKey: 'tab',
    storageKey: 'shopNoirActiveTab',
    defaultValue: 'DETAILS',
    allowedValues: ['DETAILS', 'SHIPPING', 'POLICY', 'CARE/STORAGE', 'REVIEWS'] as const,
  });
  const [similarProductsScroll, setSimilarProductsScroll] = useState(0);
  const [recentlyViewedScroll, setRecentlyViewedScroll] = useState(0);
  const [isSimilarProductsDragging, setIsSimilarProductsDragging] = useState(false);
  const [isRecentlyViewedDragging, setIsRecentlyViewedDragging] = useState(false);
  const [similarProductsStartX, setSimilarProductsStartX] = useState(0);
  const [recentlyViewedStartX, setRecentlyViewedStartX] = useState(0);
  const [similarProductsStartScroll, setSimilarProductsStartScroll] = useState(0);
  const [recentlyViewedStartScroll, setRecentlyViewedStartScroll] = useState(0);
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
  }); // Track sign-in status
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showBawFeatureSignInModal, setShowBawFeatureSignInModal] = useState(false);
  const [bawSignInReturnTo, setBawSignInReturnTo] = useState(() => ({
    pathname: location.pathname,
    search: location.search || '',
  }));
  
  // Wishlist state
  const [isInWishlist, setIsInWishlist] = useState(false);
  
  // Cart count state
  const [cartCount, setCartCount] = useState(() => {
    return parseInt(localStorage.getItem('cartCount') || '0');
  });

  // Currency state (per user)
  const [selectedCurrency, setSelectedCurrency] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const key = getPerUserKey(PER_USER_KEYS.selectedCurrency, getCurrentUserEmailFromStorage());
        return localStorage.getItem(key) || 'USD';
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

  // Add to bag button states: 'idle', 'adding', 'added'
  const [addToBagState, setAddToBagState] = useState<'idle' | 'adding' | 'added'>('idle');
  const [currentConfiguration, setCurrentConfiguration] = useState<string>('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);


  // @ts-expect-error - Function kept for potential future use
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
    // For units/noir page, ALWAYS use DEFAULT selections (not localStorage)
    // This ensures we only match items in cart that have the exact default configuration
    const DEFAULT_LENGTH = '24"';
    const DEFAULT_DENSITY = '200%';
    const DEFAULT_LACE = '13X6';
    const DEFAULT_TEXTURE = 'SILKY';
    const DEFAULT_COLOR = 'OFF BLACK';
    const DEFAULT_HAIRLINE = 'NATURAL';
    const DEFAULT_STYLING = 'NONE';
    const DEFAULT_ADDONS = '';
    
    // Include current component state for cap size only (not quantity)
    const currentCapSize = selectedCustomCap || selectedFlexibleCap || 'M';
    
    // Normalize values to ensure consistent formatting - remove ALL spaces
    const normalizedCapSize = currentCapSize.replace(/\s+/g, '');
    const normalizedLength = DEFAULT_LENGTH.replace(/\s+/g, '');
    const normalizedDensity = DEFAULT_DENSITY.replace(/\s+/g, '');
    const normalizedLace = DEFAULT_LACE.replace(/\s+/g, '');
    const normalizedTexture = DEFAULT_TEXTURE.replace(/\s+/g, '');
    const normalizedColor = DEFAULT_COLOR.replace(/\s+/g, '');
    const normalizedHairline = DEFAULT_HAIRLINE.replace(/\s+/g, '');
    const normalizedStyling = DEFAULT_STYLING.replace(/\s+/g, '');
    const normalizedAddOns = DEFAULT_ADDONS.replace(/\s+/g, '');
    
    return `${normalizedCapSize}-${normalizedLength}-${normalizedDensity}-${normalizedLace}-${normalizedTexture}-${normalizedColor}-${normalizedHairline}-${normalizedStyling}-${normalizedAddOns}`;
  };

  // Helper function to check if a cart item matches the CURRENTLY SELECTED cap size AND all default specs
  // Must match: current cap size selection (selectedCustomCap or selectedFlexibleCap) + all default specs
  const matchesDefaultConfiguration = (item: any): boolean => {
    // Get the CURRENTLY SELECTED cap size on the page (what the user has selected)
    // CRITICAL: Use actual selection, don't default to 'M' - if neither is set, return false
    const currentCapSize = selectedCustomCap || selectedFlexibleCap;
    
    // If no cap size is explicitly selected, cannot match
    if (!currentCapSize) {
      return false;
    }
    
    // Default configuration values that must match
    const DEFAULT_LENGTH = '24"';
    const DEFAULT_DENSITY = '200%';
    const DEFAULT_LACE = '13X6';
    const DEFAULT_TEXTURE = 'SILKY';
    const DEFAULT_COLOR = 'OFF BLACK';
    const DEFAULT_HAIRLINE = 'NATURAL';
    const DEFAULT_STYLING = 'NONE';
    const DEFAULT_ADDONS = '';
    
    // Ensure item has ALL required properties
    if (!item.capSize || !item.length || !item.density || !item.lace || !item.texture || !item.color || !item.hairline || !item.styling) {
      return false;
    }
    
    // Normalize values for comparison (remove all spaces and convert to string)
    const normalize = (value: any): string => {
      return (value || '').toString().replace(/\s+/g, '').toUpperCase();
    };
    
    // Handle addOns - convert array to comma-separated string or empty string
    const itemAddOns = item.addOns && Array.isArray(item.addOns) && item.addOns.length > 0 
      ? item.addOns.join(',').replace(/\s+/g, '').toUpperCase()
      : '';
    
    // CRITICAL: Cap size MUST match the currently selected cap size EXACTLY
    // Normalize both for comparison (remove spaces, convert to uppercase)
    const itemCapSizeNormalized = normalize(item.capSize);
    const currentCapSizeNormalized = normalize(currentCapSize);
    const capSizeMatch = itemCapSizeNormalized === currentCapSizeNormalized;
    
    // If cap size doesn't match, return false immediately
    if (!capSizeMatch) {
      return false;
    }
    
    // Also check that ALL OTHER default specs match exactly
    const lengthMatch = normalize(item.length) === normalize(DEFAULT_LENGTH);
    const densityMatch = normalize(item.density) === normalize(DEFAULT_DENSITY);
    const laceMatch = normalize(item.lace) === normalize(DEFAULT_LACE);
    const textureMatch = normalize(item.texture) === normalize(DEFAULT_TEXTURE);
    const colorMatch = normalize(item.color) === normalize(DEFAULT_COLOR);
    const hairlineMatch = normalize(item.hairline) === normalize(DEFAULT_HAIRLINE);
    const stylingMatch = normalize(item.styling) === normalize(DEFAULT_STYLING);
    const addOnsMatch = itemAddOns === normalize(DEFAULT_ADDONS);
    
    // Return true only if all fields match
    return lengthMatch && densityMatch && laceMatch && textureMatch && colorMatch && hairlineMatch && stylingMatch && addOnsMatch;
  };

  // Check if NOIR is in wishlist on mount and when wishlist changes
  useEffect(() => {
    const checkWishlist = () => {
      try {
        const wishlistItems = JSON.parse(localStorage.getItem('wishlistItems') || '[]');
        const isInList = wishlistItems.some((item: any) => (item.name || item.productName || '').toUpperCase() === 'NOIR');
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

  // Founder-only: 2D angle download links (page + enlarge modal)
  useEffect(() => {
    const refresh = () => {
      try {
        const raw = localStorage.getItem('currentUser');
        const email = raw ? (JSON.parse(raw) as { email?: string })?.email : undefined;
        setShowAdminFounder2dDownloads(isAdminFounderAccount({ email }));
      } catch {
        setShowAdminFounder2dDownloads(false);
      }
    };
    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);
    window.addEventListener('signInStateChanged', refresh as EventListener);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('signInStateChanged', refresh as EventListener);
    };
  }, []);

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

  useEffect(() => {
    trackActivity('view_product', { source: 'product_page', productName: 'NOIR', path: location.pathname });
  }, [location.pathname]);

  // Toggle wishlist handler
  const handleToggleWishlist = () => {
    try {
      const wishlistItems = JSON.parse(localStorage.getItem('wishlistItems') || '[]');
      
      // Calculate price based on cap size (same logic as getTotalPrice but inline)
      const capSize = selectedCustomCap || selectedFlexibleCap || 'M';
      const basePrice = (capSize === 'XXS/XS/S' || capSize === 'S/M/L') ? 780 : 740;
      const totalPrice = basePrice;
      
      if (isInWishlist) {
        // Remove from wishlist
        const updatedItems = wishlistItems.filter((item: any) => (item.name || item.productName || '').toUpperCase() !== 'NOIR');
        localStorage.setItem('wishlistItems', JSON.stringify(updatedItems));
        setIsInWishlist(false);
        trackActivity('remove_from_wishlist', { productName: 'NOIR' });
      } else {
        // Add to wishlist
        const noirItem = {
          id: `noir-unit-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          name: 'NOIR',
          productName: 'NOIR',
          price: totalPrice,
          quantity: quantity,
          image: '/assets/NOIR/noir-thumb.png',
          length: localStorage.getItem('selectedLength') || '24"',
          hairOrigin: 'CAMBODIAN',
          capSize: selectedCustomCap || selectedFlexibleCap || 'M',
          density: localStorage.getItem('selectedDensity') || '200%',
          lace: localStorage.getItem('selectedLace') || '13X6',
          texture: localStorage.getItem('selectedTexture') || 'SILKY',
          color: localStorage.getItem('selectedColor') || 'OFF BLACK',
          hairline: localStorage.getItem('selectedHairline') || 'NATURAL',
          styling: localStorage.getItem('selectedStyling') || 'MIDDLE',
          addedFrom: 'unit'
        };
        const updatedItems = [...wishlistItems, noirItem];
        localStorage.setItem('wishlistItems', JSON.stringify(updatedItems));
        setIsInWishlist(true);
        trackActivity('add_to_wishlist', { source: 'product_page', productName: 'NOIR' });
      }
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('wishlistUpdated'));
    } catch (e) {
      console.error('Error toggling wishlist:', e);
    }
  };

  // Update existing noir cart items to use new pricing
  useEffect(() => {
    const updateExistingCartItems = () => {
      // Helper functions to calculate prices from cart item data
      const getLengthPriceFromItem = (item: any) => {
        const length = item.length || '24"';
        // CRITICAL: Include ALL length options with correct prices from length page
        // Length price is separate from color price surcharge
        const lengthPrices: { [key: string]: number } = {
          '16"': -50,
          '18"': -25,
          '20"': -10,
          '22"': -5,
          '24"': 0,      // Default - included in base price
          '26"': 50,
          '28"': 100,
          '30"': 150,
          '32"': 200,
          '34"': 250,
          '36"': 300,
          '40"': 400
        };
        return lengthPrices[length] || 0;
      };

      const getDensityPriceFromItem = (item: any) => {
        const density = item.density || '200%';
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

      const getLacePriceFromItem = (item: any) => {
        const lace = item.lace || '13X6';
        // CRITICAL: Include ALL lace options with correct prices from lace page
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
        
        // CRITICAL: Handle NATURAL, PEAK, LAGOS, and LAGOS+PEAK combination
        if (!hairline || hairline === 'NATURAL') {
          return 0;
        }
        
        const hairlineArray = hairline.split(',').map((h: string) => h.trim());
        let total = 0;
        
        hairlineArray.forEach((h: string) => {
          const hairlinePrices: { [key: string]: number } = {
            'NATURAL': 0,
            'PEAK': 40,
            'LAGOS': 60
          };
          total += hairlinePrices[h] || 0;
        });
        
        // Apply $20 discount to Lagos when combined with Peak
        if (hairlineArray.includes('LAGOS') && hairlineArray.includes('PEAK')) {
          total -= 20;
        }
        
        return total;
      };

      const getStylingPriceFromItem = (item: any) => {
        const styling = item.styling || 'NONE';
        const stylingPrices: { [key: string]: number } = {
          'NONE': 0,
          'BANGS': 40,
          'CRIMPS': 140,
          'FLAT IRON': 100,
          'LAYERS': 180
        };
        return stylingPrices[styling] || 0;
      };

      const getAddOnsPriceFromItem = (item: any) => {
        const addOns = item.addOns || [];
        // Base prices from addons page
        const addOnBasePrices: { [key: string]: number } = {
          'BLEACH': 80,
          'PLUCK': 120,
          'BLUNT CUT': 20
        };
        
        // Lace sizes that get $20 discount for BLEACH and PLUCK
        const discountedLaceSizes = ['2X6', '4X4', '5X5', '6X6', '7X7'];
        const itemLace = item.lace || '13X6';
        const hasLaceDiscount = discountedLaceSizes.includes(itemLace);
        
        return addOns.reduce((total: number, addOn: string) => {
          let price = addOnBasePrices[addOn] || 0;
          
          // Apply $20 discount for bleach and pluck when specific lace sizes are selected
          if (hasLaceDiscount && (addOn === 'BLEACH' || addOn === 'PLUCK')) {
            price -= 20;
          }
          
          return total + price;
        }, 0);
      };
      const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      let updated = false;
      
      const updatedCartItems = cartItems.map((item: any) => {
        if (item.name === 'NOIR') {
          // Calculate correct price based on ALL customization options
          // CRITICAL: Base price is ALWAYS 740 for NOIR - flexible cap adds $40 via capSizePrice
          const basePrice = 740;
          
          // CRITICAL: Preserve capSizePrice from cart item if it exists, otherwise calculate
          // This prevents losing flexible cap price after multiple edits
          let capSizePrice = 0;
          const isFlexibleCap = item.capSize === 'XXS/XS/S' || item.capSize === 'S/M/L';
          
          if (item.capSizePrice !== undefined && item.capSizePrice !== null && !isNaN(item.capSizePrice)) {
            // Use existing capSizePrice from cart item
            capSizePrice = item.capSizePrice;
            
            // CRITICAL: If cart item has flexible cap size but capSizePrice is 0, fix it
            if (isFlexibleCap && capSizePrice === 0) {
              capSizePrice = 40;
              console.log('[FLEX_CAP_DEBUG] units/noir updateExistingCartItems - FIXED: Flexible cap had price 0, setting to 40');
            } else {
              console.log('[FLEX_CAP_DEBUG] units/noir updateExistingCartItems - Preserved capSizePrice from cart item:', capSizePrice);
            }
          } else if (isFlexibleCap) {
            // Calculate based on cap size if price not stored - flexible caps are always $40
            capSizePrice = 40; // Flexible cap options cost $40 extra
            console.log('[FLEX_CAP_DEBUG] units/noir updateExistingCartItems - Calculated capSizePrice:', capSizePrice, 'for flexible capSize:', item.capSize);
          } else {
            // Regular cap - price is 0
            capSizePrice = 0;
          }
          
          // Calculate color price from color name
          let colorPrice = 0;
          if (item.color && item.color !== 'OFF BLACK') {
            const colorPrices: { [key: string]: number } = {
              'JET BLACK': 120,
              'ESPRESSO': 120,
              'CHESTNUT': 120,
              'HONEY': 120,
              'AUBURN': 120,
              'COPPER': 120,
              'GINGER': 120,
              'SANGRIA': 120,
              'CHERRY': 120,
              'RASPBERRY': 120,
              'PLUM': 120,
              'COBALT': 120,
              'TEAL': 120,
              'SLIME': 120,
              'CITRINE': 120
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
          
          const newPrice = basePrice + capSizePrice + colorPrice + lengthPrice + densityPrice + lacePrice + texturePrice + hairlinePrice + stylingPrice + addOnsPrice;
          
          console.log('[FLEX_CAP_DEBUG] units/noir updateExistingCartItems - Price comparison:', {
            itemId: item.id,
            itemCapSize: item.capSize,
            itemCapSizePrice: item.capSizePrice,
            calculatedCapSizePrice: capSizePrice,
            storedPrice: item.price,
            calculatedPrice: newPrice,
            priceDifference: item.price - newPrice,
            willUpdate: item.price !== newPrice,
            timestamp: new Date().toISOString()
          });
          
          // CRITICAL: Don't overwrite price if cart item already has correct capSizePrice stored
          // Only update if capSizePrice is missing from cart item OR if price is significantly wrong
          const priceDifference = Math.abs(item.price - newPrice);
          const hasCapSizePrice = item.capSizePrice !== undefined && item.capSizePrice !== null && !isNaN(item.capSizePrice);
          
          // CRITICAL: If cart item has capSizePrice = 40 (flexible cap), NEVER recalculate or overwrite the price
          // The cart stores the actual price - we should trust it, not recalculate
          if (hasCapSizePrice && item.capSizePrice === 40) {
            // Cart item has flexible cap price stored - preserve it completely, don't recalculate
            console.log('[FLEX_CAP_DEBUG] units/noir updateExistingCartItems - PRESERVING flexible cap item, using stored price (no recalculation):', {
              itemId: item.id,
              storedPrice: item.price,
              calculatedPrice: newPrice,
              itemCapSizePrice: item.capSizePrice,
              itemCapSize: item.capSize,
              reason: 'flexible_cap_price_preserved_trust_stored_price'
            });
            // Return item as-is without any changes - trust the stored price
            return item;
          }
          
          // If cart item has capSizePrice stored and it matches what we calculated, DON'T update price
          // This prevents overwriting correct prices when navigating to the page
          if (hasCapSizePrice && item.capSizePrice === capSizePrice && priceDifference <= 1) {
            // Price is correct and capSizePrice matches - don't update anything
            console.log('[FLEX_CAP_DEBUG] units/noir updateExistingCartItems - Skipping update, price and capSizePrice are correct');
            return item;
          }
          
          // Only update if price is significantly different OR capSizePrice is missing
          if (priceDifference > 1 || !hasCapSizePrice) {
            updated = true;
            console.log('[FLEX_CAP_DEBUG] units/noir updateExistingCartItems - Updating cart item:', {
              reason: priceDifference > 1 ? 'price_different' : 'missing_capSizePrice',
              oldPrice: item.price,
              newPrice: newPrice,
              oldCapSizePrice: item.capSizePrice,
              newCapSizePrice: capSizePrice
            });
            // CRITICAL: Store capSizePrice in cart item so it's preserved for future visits
            return { ...item, price: newPrice, capSizePrice: capSizePrice };
          }
          
          // If price matches but capSizePrice is missing, just add it without changing price
          if (!hasCapSizePrice && priceDifference <= 1) {
            updated = true;
            console.log('[FLEX_CAP_DEBUG] units/noir updateExistingCartItems - Adding capSizePrice to cart item without changing price');
            return { ...item, capSizePrice: capSizePrice };
          }
        }
        return item;
      });
      
      if (updated) {
        localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
        // Dispatch event to update cart display
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        console.log('[FLEX_CAP_DEBUG] units/noir updateExistingCartItems - Updated cart items:', {
          updatedCount: updatedCartItems.filter((item: any) => item.name === 'NOIR').length,
          items: updatedCartItems.filter((item: any) => item.name === 'NOIR').map((item: any) => ({
            id: item.id,
            capSize: item.capSize,
            capSizePrice: item.capSizePrice,
            price: item.price
          }))
        });
        console.log('Updated existing NOIR cart items with correct pricing including all customizations');
      } else {
        console.log('[FLEX_CAP_DEBUG] units/noir updateExistingCartItems - No updates needed, all prices are correct');
      }
      
      // REMOVED: Old code that was incorrectly resetting flexible cap prices to '0'
      // Flexible caps (XXS/XS/S, S/M/L) correctly cost $40 extra, and this price should be preserved
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
        
        // CRITICAL: Read current state values directly from localStorage or use a ref
        // Don't use closure values which may be stale
        // Get current cap size selection - read from state by accessing it through a function
        // Actually, we need to use the current state values, so we'll read them fresh each time
        
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
        
        // CRITICAL: Use a function that reads current state, not closure values
        // We'll pass the current values to matchesDefaultConfiguration
        // But first, let's get the current cap size - we need to read it fresh
        // Since we can't access state directly in the closure, we'll use a workaround:
        // Read from the DOM or use a ref, OR better: pass current values to the matching function
        
        // For now, let's use the state values but add a note that they might be stale
        // The real fix is to ensure matchesDefaultConfiguration reads current state
        const currentCapSize = selectedCustomCap || selectedFlexibleCap;
        if (!currentCapSize) {
          setAddToBagState('idle');
          localStorage.removeItem('addToBagButtonState');
          localStorage.removeItem('lastAddedItemId');
          return;
        }
        let matchingItem: any = null;
        let matchFound = false;
        
        // Check each item for matches
        for (const item of cartItems) {
          const matches = matchesDefaultConfiguration(item);
          if (matches) {
            matchingItem = item;
            matchFound = true;
            break; // Stop at first match
          }
        }
        
        // Update state based on actual cart contents, not localStorage
        // CRITICAL: Always reset state first, then set to 'added' only if match found
        if (matchFound && matchingItem) {
          // Item with default configuration exists - set to 'added'
          setAddToBagState('added');
          localStorage.setItem('addToBagButtonState', 'added');
          localStorage.setItem('lastAddedItemId', matchingItem.id);
        } else {
          // No matching item - FORCE reset to 'idle'
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
    
    // CRITICAL: Validate cart state immediately on mount to clear any stale localStorage
    // This ensures button state is correct even if localStorage was set incorrectly
    handleCartUpdate();
    
    // Simple polling - validate periodically but less frequently to avoid overriding correct state
    // Only check if state might be wrong (not immediately after setting to 'added')
    const interval = setInterval(() => {
      // Only validate if we're not currently in 'adding' state
      const currentState = localStorage.getItem('addToBagButtonState');
      if (currentState !== 'adding') {
        handleCartUpdate();
      }
    }, 2000); // Check every 2 seconds (reduced frequency)
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('cartCountUpdated', handleCartCountUpdate as EventListener);
      window.removeEventListener('cartUpdated', handleCartUpdated as EventListener);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, [selectedCustomCap, selectedFlexibleCap]); // CRITICAL: Recreate handleCartUpdate when cap size changes to avoid stale closures

  // Load selected currency from localStorage (per-user key)
  useEffect(() => {
    const key = getPerUserKey(PER_USER_KEYS.selectedCurrency, getCurrentUserEmailFromStorage());
    const savedCurrency = localStorage.getItem(key);
    if (savedCurrency && currencyRates[savedCurrency as keyof typeof currencyRates]) {
      setSelectedCurrency(savedCurrency);
    }
  }, [currencyRates]);

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
    return () => window.removeEventListener('storage', handleCurrencyChange);
  }, [currencyRates]);

  // Format price with currency
  const formatPrice = React.useCallback((price: number) => {
    const currency = currencyRates[selectedCurrency as keyof typeof currencyRates] || currencyRates.USD;
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
    if (selectedMannequinView === 0) {
      // Default state: natural front in hero
      return {
        hero: mannequinImages[0], // natural front
        top: mannequinImages[1], // natural left
        bottom: mannequinImages[2] // natural right
      };
    } else if (selectedMannequinView === 1) {
      // Top thumbnail clicked: natural left in hero, natural front in top
      return {
        hero: mannequinImages[1], // natural left
        top: mannequinImages[0], // natural front
        bottom: mannequinImages[2] // natural right (stays in bottom)
      };
    } else {
      // Bottom thumbnail clicked: natural right in hero, natural front in bottom
      return {
        hero: mannequinImages[2], // natural right
        top: mannequinImages[1], // natural left (stays in top)
        bottom: mannequinImages[0] // natural front
      };
    }
  };

  const currentImages = getCurrentImages();

  // Get current 3D view images based on selected view
  const get3DViewImages = () => {
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

  // @ts-expect-error - Function kept for potential future use
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

  const handleBack = () => {
    // Store the selected cap size in localStorage for build-a-wig page
    if (selectedCustomCap) {
      localStorage.setItem('selectedCapSize', selectedCustomCap);
      localStorage.setItem('selectedCapSizePrice', '0'); // Custom cap has no additional price
    } else if (selectedFlexibleCap) {
      localStorage.setItem('selectedCapSize', selectedFlexibleCap);
      localStorage.setItem('selectedCapSizePrice', '60'); // Flexible cap has $60 additional price
    }
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
      // Navigate to sign-in page (will default to account page after sign-in)
      navigate(signInHrefWithReturnTo(location));
    }
  };

  const handleSignOut = async () => {
    trackActivity('sign_out');
    setIsSignedIn(false);
    await signOutAppAndSupabaseSession();
    setShowSignOutConfirm(false);
    // Close mobile menu
    setShowMobileMenu(false);
  };


  // Check if configuration has changed (especially cap size changes)
  useEffect(() => {
    const newConfig = generateConfigurationStringForChangeDetection();
    if (currentConfiguration && newConfig !== currentConfiguration) {
      
      // CRITICAL: Always reset to idle FIRST when config changes
      // This prevents stale "IN THE BAG" state from persisting
      setAddToBagState('idle');
      localStorage.removeItem('addToBagButtonState');
      localStorage.removeItem('lastAddedItemId');
      
      // Then check if the new configuration is already in the cart
      // Only match items with ALL default selection options (M, 24", 200%, 13X6, etc.)
      const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      
      if (cartItems.length === 0) {
        setCurrentConfiguration(newConfig);
        return;
      }
      
      let matchingItem: any = null;
      let matchFound = false;
      
      for (const item of cartItems) {
        const matches = matchesDefaultConfiguration(item);
        if (matches) {
          matchingItem = item;
          matchFound = true;
          break;
        }
      }
      
      if (matchFound && matchingItem) {
        // If the new configuration is in cart, set button to 'added'
        setAddToBagState('added');
        localStorage.setItem('addToBagButtonState', 'added');
        localStorage.setItem('lastAddedItemId', matchingItem.id);
      } else {
        // If not in cart, stay idle (already reset above)
      }
    }
    setCurrentConfiguration(newConfig);
  }, [selectedCustomCap, selectedFlexibleCap, refreshTrigger]);

  // Initialize button state from localStorage on page load
  // CRITICAL: Always start with 'idle' and validate, don't trust localStorage
  useEffect(() => {
    // ALWAYS start with idle state, then validate
    setAddToBagState('idle');
    localStorage.removeItem('addToBagButtonState');
    localStorage.removeItem('lastAddedItemId');
    
    // Now validate cart
    const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
    
    if (cartItems.length === 0) {
      return;
    }
    
    // Always check if current configuration matches any cart item
    // Only match items with ALL default selection options (M, 24", 200%, 13X6, etc.)
    let matchingItem: any = null;
    let matchFound = false;
    
    for (const item of cartItems) {
      const matches = matchesDefaultConfiguration(item);
      if (matches) {
        matchingItem = item;
        matchFound = true;
        break;
      }
    }
    
    if (matchFound && matchingItem) {
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
      const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      
      if (cartItems.length === 0) {
        setAddToBagState('idle');
        localStorage.removeItem('addToBagButtonState');
        localStorage.removeItem('lastAddedItemId');
        return;
      }
      
      // Only match items with ALL default selection options (M, 24", 200%, 13X6, etc.)
      let matchingItem: any = null;
      let matchFound = false;
      
      for (const item of cartItems) {
        const matches = matchesDefaultConfiguration(item);
        if (matches) {
          matchingItem = item;
          matchFound = true;
          break;
        }
      }
      
      if (matchFound && matchingItem) {
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

  const handleTabClick = (tabName: 'DETAILS' | 'SHIPPING' | 'POLICY' | 'CARE/STORAGE' | 'REVIEWS') => {
    setActiveTab(tabName);
  };

  // Similar Products scroll handlers
  // @ts-expect-error - Function kept for potential future use
  const handleSimilarProductsMouseDown = (e: React.MouseEvent) => {
    setIsSimilarProductsDragging(true);
    setSimilarProductsStartX(e.clientX);
    setSimilarProductsStartScroll(similarProductsScroll);
  };

  // @ts-expect-error - Function kept for potential future use
  const handleSimilarProductsMouseMove = (e: React.MouseEvent) => {
    if (!isSimilarProductsDragging) return;
    e.preventDefault();
    const currentX = e.clientX;
    const diff = currentX - similarProductsStartX;
    const newPosition = similarProductsStartScroll - diff;
    
    const maxScroll = 0;
    const similarFull = similarSnapPx;
    const minScroll = -similarFull;
    setSimilarProductsScroll(Math.max(minScroll, Math.min(maxScroll, newPosition)));
  };

  // @ts-expect-error - Function kept for potential future use
  const handleSimilarProductsMouseUp = () => {
    setIsSimilarProductsDragging(false);
    const similarFull = similarSnapPx;
    const similarHalf = similarFull / 2;
    if (similarProductsScroll > -similarHalf) {
      setSimilarProductsScroll(0);
    } else {
      setSimilarProductsScroll(-similarFull);
    }
  };

  // @ts-expect-error - Function kept for potential future use
  const handleSimilarProductsTouchStart = (e: React.TouchEvent) => {
    setIsSimilarProductsDragging(true);
    setSimilarProductsStartX(e.touches[0].clientX);
    setSimilarProductsStartScroll(similarProductsScroll);
  };

  // @ts-expect-error - Function kept for potential future use
  const handleSimilarProductsTouchMove = (e: React.TouchEvent) => {
    if (!isSimilarProductsDragging) return;
    e.preventDefault();
    const currentX = e.touches[0].clientX;
    const diff = currentX - similarProductsStartX;
    const newPosition = similarProductsStartScroll + diff;
    
    const maxScroll = 0;
    const similarFull = similarSnapPx;
    const minScroll = -similarFull;
    setSimilarProductsScroll(Math.max(minScroll, Math.min(maxScroll, newPosition)));
  };

  // @ts-expect-error - Function kept for potential future use
  const handleSimilarProductsTouchEnd = () => {
    setIsSimilarProductsDragging(false);
    const similarFull = similarSnapPx;
    const similarHalf = similarFull / 2;
    if (similarProductsScroll > -similarHalf) {
      setSimilarProductsScroll(0);
    } else {
      setSimilarProductsScroll(-similarFull);
    }
  };

  // Recently Viewed scroll handlers
  // @ts-expect-error - Function kept for potential future use
  const handleRecentlyViewedMouseDown = (e: React.MouseEvent) => {
    setIsRecentlyViewedDragging(true);
    setRecentlyViewedStartX(e.clientX);
    setRecentlyViewedStartScroll(recentlyViewedScroll);
  };

  // @ts-expect-error - Function kept for potential future use
  const handleRecentlyViewedMouseMove = (e: React.MouseEvent) => {
    if (!isRecentlyViewedDragging) return;
    e.preventDefault();
    const currentX = e.clientX;
    const diff = currentX - recentlyViewedStartX;
    const newPosition = recentlyViewedStartScroll - diff;
    
    const maxScroll = 0;
    const recentFull = recentSnapPx;
    const minScroll = -recentFull;
    setRecentlyViewedScroll(Math.max(minScroll, Math.min(maxScroll, newPosition)));
  };

  // @ts-expect-error - Function kept for potential future use
  const handleRecentlyViewedMouseUp = () => {
    setIsRecentlyViewedDragging(false);
    const recentFull = recentSnapPx;
    const recentHalf = recentFull / 2;
    if (recentlyViewedScroll > -recentHalf) {
      setRecentlyViewedScroll(0);
    } else {
      setRecentlyViewedScroll(-recentFull);
    }
  };

  // @ts-expect-error - Function kept for potential future use
  const handleRecentlyViewedTouchStart = (e: React.TouchEvent) => {
    setIsRecentlyViewedDragging(true);
    setRecentlyViewedStartX(e.touches[0].clientX);
    setRecentlyViewedStartScroll(recentlyViewedScroll);
  };

  // @ts-expect-error - Function kept for potential future use
  const handleRecentlyViewedTouchMove = (e: React.TouchEvent) => {
    if (!isRecentlyViewedDragging) return;
    e.preventDefault();
    const currentX = e.touches[0].clientX;
    const diff = currentX - recentlyViewedStartX;
    const newPosition = recentlyViewedStartScroll + diff;
    
    const maxScroll = 0;
    const recentFull = recentSnapPx;
    const minScroll = -recentFull;
    setRecentlyViewedScroll(Math.max(minScroll, Math.min(maxScroll, newPosition)));
  };

  // @ts-expect-error - Function kept for potential future use
  const handleRecentlyViewedTouchEnd = () => {
    setIsRecentlyViewedDragging(false);
    const recentFull = recentSnapPx;
    const recentHalf = recentFull / 2;
    if (recentlyViewedScroll > -recentHalf) {
      setRecentlyViewedScroll(0);
    } else {
      setRecentlyViewedScroll(-recentFull);
    }
  };

  // Arrow click handlers
  const handleSimilarProductsLeftArrow = () => {
    // Move to previous 2 products (scroll right) - snap to 0 position
    setSimilarProductsScroll(0);
  };

  const handleSimilarProductsRightArrow = () => {
    const similarFull = similarSnapPx;
    setSimilarProductsScroll(-similarFull);
  };

  const handleRecentlyViewedLeftArrow = () => {
    // Move to previous 2 products (scroll right) - snap to 0 position
    setRecentlyViewedScroll(0);
  };

  const handleRecentlyViewedRightArrow = () => {
    const recentFull = recentSnapPx;
    setRecentlyViewedScroll(-recentFull);
  };

  // @ts-expect-error - Function kept for potential future use
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
      
      // CRITICAL: Clear any edit/customize mode selections to prevent stale values
      // This ensures we only use defaults when adding from the noir page
      localStorage.removeItem('editingCartItem');
      localStorage.removeItem('editingCartItemId');
      localStorage.removeItem('comingFromSubPage');
      
      // Set default product settings (ALWAYS use defaults, never stale values)
      const defaultLength = '24"';
      const defaultLengthPrice = 0;
      const defaultDensity = '200%';
      const defaultDensityPrice = 0;
      const defaultLace = '13X6';
      const defaultLacePrice = 0;
      const defaultTexture = 'SILKY';
      const defaultTexturePrice = 0;
      const defaultColor = 'OFF BLACK';
      const defaultColorPrice = 0;
      const defaultHairline = 'NATURAL';
      const defaultHairlinePrice = 0;
      const defaultStyling = 'NONE';
      const defaultStylingPrice = 0;
      const defaultAddOns: string[] = [];
      const defaultAddOnsPrice = 0;
      
      // Save defaults to localStorage
      localStorage.setItem('selectedLength', defaultLength);
      localStorage.setItem('selectedLengthPrice', defaultLengthPrice.toString());
      localStorage.setItem('selectedDensity', defaultDensity);
      localStorage.setItem('selectedDensityPrice', defaultDensityPrice.toString());
      localStorage.setItem('selectedLace', defaultLace);
      localStorage.setItem('selectedLacePrice', defaultLacePrice.toString());
      localStorage.setItem('selectedTexture', defaultTexture);
      localStorage.setItem('selectedTexturePrice', defaultTexturePrice.toString());
      localStorage.setItem('selectedColor', defaultColor);
      localStorage.setItem('selectedColorPrice', defaultColorPrice.toString());
      localStorage.setItem('selectedHairline', defaultHairline);
      localStorage.setItem('selectedHairlinePrice', defaultHairlinePrice.toString());
      localStorage.setItem('selectedStyling', defaultStyling);
      localStorage.setItem('selectedStylingPrice', defaultStylingPrice.toString());
      localStorage.setItem('selectedAddOns', JSON.stringify(defaultAddOns));
      localStorage.setItem('selectedAddOnsPrice', defaultAddOnsPrice.toString());
      
      // Use the currently selected cap size
      let capSize: string;
      let capSizePrice: number;
      if (selectedCustomCap) {
        capSize = selectedCustomCap;
        capSizePrice = 0; // Custom cap has no additional price
      } else if (selectedFlexibleCap) {
        capSize = selectedFlexibleCap;
        capSizePrice = 40; // CRITICAL: Flexible cap has $40 additional price
      } else {
        // Default to M if no cap size is selected
        capSize = 'M';
        capSizePrice = 0;
      }
      
      // Save cap size to localStorage
      localStorage.setItem('selectedCapSize', capSize);
      localStorage.setItem('selectedCapSizePrice', capSizePrice.toString());
      
      // Calculate full price using ONLY defaults (never read from localStorage)
      const basePrice = 740;
      const totalPrice = basePrice + capSizePrice + defaultColorPrice + defaultLengthPrice + defaultDensityPrice + defaultLacePrice + defaultTexturePrice + defaultHairlinePrice + defaultStylingPrice + defaultAddOnsPrice;
      
      // Create cart item with DEFAULT selections only (never read from localStorage)
      const cartItem = {
        id: `noir-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: 'NOIR',
        price: totalPrice, // Use calculated price with defaults only
        quantity: quantity,
        image: '/assets/NOIR/noir-thumb.png',
        capSize: capSize,
        capSizePrice: capSizePrice, // CRITICAL: Store capSizePrice in cart item
        length: defaultLength,
        density: defaultDensity,
        color: defaultColor,
        texture: defaultTexture,
        lace: defaultLace,
        hairline: defaultHairline,
        styling: defaultStyling,
        partSelection: 'MIDDLE',
        addOns: defaultAddOns
      };
      
      console.log('[FLEX_CAP_DEBUG] units/noir handleAddToBag - Created cart item with capSizePrice:', {
        capSize,
        capSizePrice,
        fullPrice: cartItem.price
      });

      // Get existing cart items and add new item
      const existingCartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      const updatedCartItems = [...existingCartItems, cartItem];
      localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));

      // Update cart count
      const currentCount = parseInt(localStorage.getItem('cartCount') || '0');
      const newCount = currentCount + quantity; // Add quantity instead of just 1
      localStorage.setItem('cartCount', newCount.toString());
      setCartCount(newCount);
      
      // Validate that the item we just added matches the default configuration
      // Only set to 'added' if it actually matches defaults
      const matchesDefaults = matchesDefaultConfiguration(cartItem);
      
      if (matchesDefaults) {
        setAddToBagState('added');
        localStorage.setItem('addToBagButtonState', 'added');
        localStorage.setItem('lastAddedItemId', cartItem.id);
      } else {
        setAddToBagState('idle');
        localStorage.removeItem('addToBagButtonState');
        localStorage.removeItem('lastAddedItemId');
      }
      
      // Dispatch cart count update event (this will trigger handleCartUpdate to validate)
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: newCount }));
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      }, 100);

      trackActivity('add_to_cart', { source: 'product_page', productName: 'NOIR', quantity });
      
    } catch (error) {
      console.error('Error in handleAddToBag:', error);
      setAddToBagState('idle'); // Reset to idle on error
    }
  };

  // @ts-expect-error - Function kept for potential future use
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
  // @ts-expect-error - Function kept for potential future use
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
    // CRITICAL: For units/noir page, price should ONLY be based on cap size selection
    // This page should NOT be affected by edit/customize cart items or their localStorage values
    // The price should ALWAYS be $740 (standard caps) or $780 (flexible caps)
    
    // Check if we're in edit or customize mode - if so, ignore all localStorage prices
    const isEditMode = localStorage.getItem('editingCartItem') !== null;
    const isCustomizeMode = localStorage.getItem('customizeSelectedCapSize') !== null;
    
    // Get cap size to determine base price
    const capSize = selectedCustomCap || selectedFlexibleCap || localStorage.getItem('selectedCapSize') || 'M';
    
    // Calculate base price based on cap size ONLY
    let basePrice = 740; // Default for standard caps (XS, S, M, L)
    if (capSize === 'XXS/XS/S' || capSize === 'S/M/L') {
      basePrice = 780; // Flexible cap options base price is $780
    }
    
    // If in edit or customize mode, ONLY return base price (ignore all localStorage prices)
    if (isEditMode || isCustomizeMode) {
      console.log('Units/Noir - Edit/Customize mode detected, using base price only:', {
        capSize,
        basePrice,
        isEditMode,
        isCustomizeMode,
        note: 'Ignoring localStorage prices to prevent cart item interference'
      });
      return basePrice;
    }
    
    // For normal mode, calculate prices from current selections (not from localStorage prices)
    // Default selections on this page: 24", 200%, 13X6, SILKY, OFF BLACK, NATURAL, NONE, []
    // All these defaults have $0 price, so we only need base price
    
    // All other prices are ALWAYS 0 for units/noir page defaults
    const colorPrice = 0; // OFF BLACK is default
    const lengthPrice = 0; // 24" is default
    const densityPrice = 0; // 200% is default (calculated from selectedDensity state if needed)
    const lacePrice = 0; // 13X6 is default
    const texturePrice = 0; // SILKY is default
    const hairlinePrice = 0; // NATURAL is default
    const stylingPrice = 0; // NONE is default
    const addOnsPrice = 0; // No add-ons by default
    
    const total = basePrice + colorPrice + lengthPrice + densityPrice + lacePrice + texturePrice + hairlinePrice + stylingPrice + addOnsPrice;
    
    // Verify price is correct (should only be 740 or 780)
    if (total !== 740 && total !== 780) {
      console.warn('Units/Noir - Price calculation warning:', {
        total,
        basePrice,
        capSize,
        note: 'Price should be 740 or 780 only. Forcing correct price.'
      });
      return basePrice; // Force correct price
    }
    
    return total;
  };

  const totalPrice = getTotalPrice();

  useEffect(() => {
    // Hide loading screen immediately for testing
    setShowLoading(false);
    
    // Hide loading screen after 2 seconds (original behavior)
    // const timer = setTimeout(() => {
    //   setShowLoading(false);
    // }, 2000);

    // return () => clearTimeout(timer);
  }, []);

  // CRITICAL: Clear edit/customize localStorage price values on page load
  // This ensures the units/noir page price is NOT affected by cart items in edit/customize mode
  // NOTE: We NO LONGER clear editSelected* price values when in edit mode because they need to persist
  // when navigating back to the edit page. Only clear customizeSelected* prices.
  useEffect(() => {
    // Check if we're in customize mode
    const isCustomizeMode = localStorage.getItem('customizeSelectedCapSize') !== null;
    
    // Only clear customizeSelected price values (not editSelected - those need to persist)
    if (isCustomizeMode) {
      // Clear customizeSelected price values
      localStorage.removeItem('customizeSelectedCapSizePrice');
      localStorage.removeItem('customizeSelectedColorPrice');
      localStorage.removeItem('customizeSelectedLengthPrice');
      localStorage.removeItem('customizeSelectedDensityPrice');
      localStorage.removeItem('customizeSelectedLacePrice');
      localStorage.removeItem('customizeSelectedTexturePrice');
      localStorage.removeItem('customizeSelectedHairlinePrice');
      localStorage.removeItem('customizeSelectedStylingPrice');
      localStorage.removeItem('customizeSelectedAddOnsPrice');
      
      console.log('Units/Noir - Cleared customizeSelected price values to prevent interference');
    }
  }, []);

  // Initialize density price correctly when component loads or density changes
  useEffect(() => {
    // Check if we're in edit or customize mode - if so, skip updating localStorage prices
    const isEditMode = localStorage.getItem('editingCartItem') !== null;
    const isCustomizeMode = localStorage.getItem('customizeSelectedCapSize') !== null;
    
    // Only update localStorage prices if NOT in edit/customize mode
    if (!isEditMode && !isCustomizeMode) {
      // Ensure density price matches the selected density
      const expectedPrice = getSelectedPrice();
      const currentDensityPrice = localStorage.getItem('selectedDensityPrice');
      
      // If density price doesn't match current density selection, update it
      if (!currentDensityPrice || parseInt(currentDensityPrice) !== expectedPrice) {
        localStorage.setItem('selectedDensityPrice', expectedPrice.toString());
      }
    }
  }, [selectedDensity]);

  // Listen for changes in selected length and density to update note text
  useEffect(() => {
    const handleStorageChange = () => {
      // Force re-render when length or density changes
      setSelectedDensity(localStorage.getItem('selectedDensity') || '200%');
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <div className="min-h-screen" style={{ position: 'relative' }}>
      {showLoading && <LoadingScreen />}
      
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
        <div className="flex flex-col py-5 px-4 mx-auto" style={{ minWidth: '100%', maxWidth: '1200px', overflow: 'visible' }}>
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
            <p className="text-sm" style={{ fontFamily: '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif', transform: 'translateY(1px)' }}>
            {showMobileMenu ? (
              <>
                <span 
                  style={{ fontFamily: '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif', fontWeight: '400', cursor: 'pointer' }}
                  onClick={() => navigate('/lobby')}
                >
                  HOME &gt;
                </span>{' '}
                <span
                  style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontWeight: '500' }}
                >
                  MENU
                </span>
              </>
            ) : (
              <>
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
                    navigate('/units/straight');
                  }}
                >
                  STRAIGHT &gt;
                </span>{' '}
                <span
                  style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontWeight: '500' }}
                >
                  NOIR
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
            /* MENU CONTENT */
            <div
              className="menu-toggle-card border border-black flex flex-col pt-6 pb-4 px-5 mb-2 bg-white/60 backdrop-blur-sm transition-all duration-300 ease-out"
              style={{ 
                borderWidth: '1.3px', 
                minWidth: '100%', 
                maxWidth: 'none', 
                overflow: 'visible',
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                minHeight: MENU_TOGGLE_PANEL_HEIGHT,
                height: MENU_TOGGLE_PANEL_HEIGHT
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
                      cursor: 'pointer',
                      marginLeft: mobileMenuActiveTab === 'SHOP' ? '0' : '-4px'
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
            paddingBottom: '34px'
          }}
        >
          {/* WIG PREVIEW - wishlist/2D-3D text hamburgered with images; text near hero & thumbnail edges */}
          <div className="product-wig-preview" style={{ width: '100%', display: 'flex', alignItems: 'center', flexDirection: 'column', marginBottom: '24px', transform: 'translateY(20px)', overflow: 'visible', minWidth: '100%', maxWidth: 'none' }}>
            <div style={{ transform: 'translateY(-4px)', marginBottom: '8px' }}>
            <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'stretch' }}>
              {/* ADD TO WISHLIST & 2D/3D - same width as image block; text near edges of hero and top-right thumbnail */}
              <div style={{ position: 'relative', width: '100%', marginBottom: '4px', transform: 'translateY(0)', minHeight: 'clamp(18px, 2.2vw, 26px)' }}>
                <p 
                  onClick={handleToggleWishlist}
                  className="product-wishlist-text" style={{ position: 'absolute', left: 'clamp(4px, 1vw, 12px)', top: '0', color: '#808080', fontFamily: '"Futura PT Demi", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', fontWeight: '600', margin: '0', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
                >
                  {isInWishlist ? '- REMOVE FROM WISHLIST' : '+ ADD TO WISHLIST'}
                </p>
                <div 
                  style={{ position: 'absolute', right: 'clamp(4px, 1vw, 12px)', top: '0', display: 'flex', alignItems: 'center', gap: 'clamp(2px, 0.4vw, 6px)', cursor: 'pointer', whiteSpace: 'nowrap' }}
                  onClick={() => {
                    const new3DView = !is3DView;
                    setIs3DView(new3DView);
                    persistProduct3dViewPreference(new3DView);
                  }}
                >
                  <span className="product-view-toggle-text" style={{ color: is3DView ? '#000000' : '#EB1C24', fontFamily: is3DView ? '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif' : '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '11px', fontWeight: is3DView ? '400' : '500', margin: '0' }}>2D VIEW</span>
                  <span className="product-view-toggle-text" style={{ color: '#000000', fontFamily: '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif', fontSize: '11px', fontWeight: '400', margin: '0' }}>/</span>
                  <span className="product-view-toggle-text" style={{ color: is3DView ? '#EB1C24' : '#000000', fontFamily: is3DView ? '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' : '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif', fontSize: '11px', fontWeight: is3DView ? '500' : '400', margin: '0' }}>3D VIEW</span>
                </div>
              </div>
              <div className="product-wig-preview-images" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: is3DView ? 'clamp(6px, 1.2vw, 12px)' : 'clamp(4px, 0.8vw, 8px)', marginBottom: 'clamp(12px, 1.5vw, 16px)', overflow: 'visible', transform: 'translateY(0)' }}>
                <div style={{ position: 'relative', overflow: 'visible', flexShrink: '0' }}>
                  <div
                    style={{
                      position: 'relative',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
width: 'clamp(200px, 50vw, 320px)',
                    height: 'clamp(290px, 72.5vw, 464px)',
                    backgroundImage: `url('${is3DView ? '/assets/NOIR/' + current3DImages.hero : '/assets/leaf-brick-resize.png'}')`,
                      backgroundRepeat: 'repeat',
                      overflow: 'visible',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      const allImages = is3DView 
                        ? [`/assets/NOIR/${current3DImages.hero}`, `/assets/NOIR/${current3DImages.top}`, `/assets/NOIR/${current3DImages.bottom}`]
                        : [currentImages.hero, currentImages.top, currentImages.bottom];
                      setViewerImages(allImages);
                      setViewerCurrentIndex(0);
                      setViewerModalDownloads(!is3DView && showAdminFounder2dDownloads ? NOIR_2D_VIEWER_DOWNLOADS : null);
                      setShowImageViewer(true);
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
width: 'clamp(230px, 57.5vw, 368px)',
                      height: 'auto',
                      maxHeight: 'min(610px, 85vh)',
                      minWidth: 'clamp(230px, 57.5vw, 368px)',
                        minHeight: 'auto',
                        display: is3DView ? 'none' : 'block',
                        cursor: 'pointer',
                        pointerEvents: is3DView ? 'none' : 'auto'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        const allImages = is3DView 
                          ? [`/assets/NOIR/${current3DImages.hero}`, `/assets/NOIR/${current3DImages.top}`, `/assets/NOIR/${current3DImages.bottom}`]
                          : [currentImages.hero, currentImages.top, currentImages.bottom];
                        setViewerImages(allImages);
                        setViewerCurrentIndex(0);
                        setViewerModalDownloads(!is3DView && showAdminFounder2dDownloads ? NOIR_2D_VIEWER_DOWNLOADS : null);
                        setShowImageViewer(true);
                      }}
                    />
                  </div>
                </div>
                
                {/* Top and Bottom Mannequins - Right Side */}
                <div className="flex flex-col" style={{ height: 'clamp(290px, 72.5vw, 464px)', justifyContent: 'space-between', gap: 'clamp(6px, 1.2vw, 12px)' }}>
                  <div className="flex-shrink-0 relative">
                    <div
                      className="relative bg-cover bg-center flex items-center justify-center cursor-pointer"
                      style={{ width: 'clamp(100px, 26vw, 175px)', height: 'clamp(140px, 36vw, 245px)', backgroundImage: `url('${is3DView ? '/assets/NOIR/' + current3DImages.top : '/assets/leaf-brick-resize.png'}')`, backgroundSize: 'cover', backgroundPosition: is3DView ? 'center calc(50% + 5px)' : 'center', backgroundRepeat: 'no-repeat' }}
                      onClick={handleTopThumbnailClick}
                    >
                      <img src={currentImages.top} alt="" className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10" style={{ top: 'calc(50% - 6.1px + 7.2px + 10px - 3px - 6px - 0.6px - 1px - 0.5px - 0.5px)', width: 'clamp(112px, 29vw, 196px)', height: 'auto', maxWidth: 'none', maxHeight: 'none', minWidth: 'clamp(112px, 29vw, 196px)', display: is3DView ? 'none' : 'block' }} />
                    </div>
                  </div>
                  <div className="flex-shrink-0 relative">
                    <div
                      className="relative bg-cover bg-center flex items-center justify-center cursor-pointer"
                      style={{ width: 'clamp(100px, 26vw, 175px)', height: 'clamp(140px, 36vw, 245px)', backgroundImage: `url('${is3DView ? '/assets/NOIR/' + current3DImages.bottom : '/assets/leaf-brick-resize.png'}')`, backgroundSize: 'cover', backgroundPosition: is3DView ? 'center calc(50% + 5px)' : 'center', backgroundRepeat: 'no-repeat' }}
                      onClick={handleBottomThumbnailClick}
                    >
                      <img src={currentImages.bottom} alt="" className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10" style={{ top: 'calc(50% - 6.1px + 7.2px + 10px - 3px - 6px - 0.6px - 1px - 0.5px - 0.5px)', width: 'clamp(112px, 29vw, 196px)', height: 'auto', maxWidth: 'none', maxHeight: 'none', minWidth: 'clamp(112px, 29vw, 196px)', display: is3DView ? 'none' : 'block' }} />
                    </div>
                  </div>
                </div>
              </div>
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

            {/* DISCLAIMER TEXT */}
            <p
              className="text-center uppercase mb-2 product-wig-disclaimer"
              style={{ 
                fontFamily: '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif',
                fontSize: '11px',
                fontWeight: '400',
                transform: 'translateY(0)',
                color: 'black'
              }}
            >
              (2D MODEL IS FOR <span style={{ color: '#808080', fontFamily: '"Futura PT Demi", futuristic-pt, Futura, Inter, sans-serif' }}>VISUAL & AESTHETIC</span> PURPOSES ONLY)
            </p>
            </div>

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
                textAlign: 'center' as const,
                height: 'auto !important',
                maxHeight: 'none !important',
                width: '100% !important',
                minWidth: 'auto !important',
                maxWidth: 'none !important',
                overflow: 'visible !important',
                whiteSpace: 'nowrap !important',
                position: 'relative' as const,
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
                color: '#808080',
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
                className={`product-cap-btn px-6 py-1 bg-white ${selectedCustomCap === 'XS' ? '' : 'hover:bg-gray-50'}`}
                style={{ 
                  ...bcfOptionSelectedChrome(selectedCustomCap === 'XS'),
                  fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
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
                className={`product-cap-btn px-6 py-1 bg-white ${selectedCustomCap === 'S' ? '' : 'hover:bg-gray-50'}`}
                style={{ 
                  ...bcfOptionSelectedChrome(selectedCustomCap === 'S'),
                  fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
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
                className={`product-cap-btn px-6 py-1 bg-white ${selectedCustomCap === 'M' ? '' : 'hover:bg-gray-50'}`}
                style={{ 
                  ...bcfOptionSelectedChrome(selectedCustomCap === 'M'),
                  fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
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
                className={`product-cap-btn px-6 py-1 bg-white ${selectedCustomCap === 'L' ? '' : 'hover:bg-gray-50'}`}
                style={{ 
                  ...bcfOptionSelectedChrome(selectedCustomCap === 'L'),
                  fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
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
                style={{ 
                  ...bcfOptionSelectedChrome(selectedFlexibleCap === 'XXS/XS/S'),
                  paddingTop: 'clamp(4px, 0.5vw, 8px)',
                  paddingBottom: 'clamp(4px, 0.5vw, 8px)',
                  paddingLeft: 'clamp(8px, 1vw, 12px)',
                  paddingRight: 'clamp(8px, 1vw, 12px)',
                  fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
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
                  fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
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
                height: 'clamp(27px, 4vw, 36px)',
                minHeight: 'clamp(27px, 4vw, 36px)',
                boxSizing: 'border-box',
                outline: 'none',
                border: 'none !important',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                paddingLeft: 'clamp(8px, 1vw, 14px)',
                paddingRight: 'clamp(8px, 1vw, 14px)'
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
                height: 'clamp(27px, 4vw, 36px)',
                minHeight: 'clamp(27px, 4vw, 36px)',
                boxSizing: 'border-box',
                border: 'none !important',
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
              className={`px-3 py-1 text-red-500 bg-white hover:bg-gray-50 quantity-plus-btn flex items-center justify-center ${quantity >= 10 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              style={{ 
                borderTop: '1.3px solid black !important',
                borderRight: '1.3px solid black !important',
                borderBottom: '1.3px solid black !important',
                borderLeft: 'none !important',
                height: 'clamp(27px, 4vw, 36px)',
                minHeight: 'clamp(27px, 4vw, 36px)',
                boxSizing: 'border-box',
                outline: 'none',
                border: 'none !important',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                paddingLeft: 'clamp(8px, 1vw, 14px)',
                paddingRight: 'clamp(8px, 1vw, 14px)'
              }}
            >
              <span style={{ fontFamily: 'Cascadia Code, monospace', fontSize: '11px' }}>+</span>
            </button>
        </div>

          {/* CAP SIZE CHART IMAGE - responsive: scales up on larger screens */}
          <div className="flex justify-center mt-4 w-full" style={{ transform: 'translateX(4px) translateY(-27px)' }}>
            <img
              src="/assets/NOIR/cap-size-chart.png"
              alt="Cap Size Chart"
              className="max-w-full h-auto object-contain"
              style={{ maxWidth: 'clamp(136px, 14.85vw, 180px)', maxHeight: 'clamp(106px, 11.8vw, 140px)', width: '100%', cursor: 'pointer' }}
              onClick={handleChartClick}
            />
          </div>

          {/* PRODUCT SHOTS SECTION — same viewport / row / image metrics as Blanco, Beach Wave, etc. */}
          <div className="mt-8 mb-6" style={{ transform: 'translateY(-34px)' }}>
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
                  src="/assets/NOIR/noir left.png"
                  alt="NOIR Left View"
                  className="object-cover"
                  style={{ width: '18%', height: '290px', maxHeight: '290px', flexShrink: 0, transform: 'translateY(-55px)', cursor: 'pointer' }}
                  draggable={false}
                  onClick={() => {
                    const productShotImages = [
                      '/assets/NOIR/noir left.png',
                      '/assets/NOIR/noir front.png',
                      '/assets/NOIR/noir right.png'
                    ];
                    setViewerImages(productShotImages);
                    setViewerCurrentIndex(0);
                    setViewerModalDownloads(showAdminFounder2dDownloads ? NOIR_2D_VIEWER_DOWNLOADS : null);
                    setShowImageViewer(true);
                  }}
                />
                <img
                  src="/assets/NOIR/noir front.png"
                  alt="NOIR Front View"
                  className="object-cover"
                  style={{ width: '18%', height: '290px', maxHeight: '290px', flexShrink: 0, transform: 'translateY(-55px)', cursor: 'pointer' }}
                  draggable={false}
                  onClick={() => {
                    const productShotImages = [
                      '/assets/NOIR/noir left.png',
                      '/assets/NOIR/noir front.png',
                      '/assets/NOIR/noir right.png'
                    ];
                    setViewerImages(productShotImages);
                    setViewerCurrentIndex(1);
                    setViewerModalDownloads(showAdminFounder2dDownloads ? NOIR_2D_VIEWER_DOWNLOADS : null);
                    setShowImageViewer(true);
                  }}
                />
                <img
                  src="/assets/NOIR/noir right.png"
                  alt="NOIR Right View"
                  className="object-cover"
                  style={{ width: '18%', height: '290px', maxHeight: '290px', flexShrink: 0, transform: 'translateY(-55px)', cursor: 'pointer' }}
                  draggable={false}
                  onClick={() => {
                    const productShotImages = [
                      '/assets/NOIR/noir left.png',
                      '/assets/NOIR/noir front.png',
                      '/assets/NOIR/noir right.png'
                    ];
                    setViewerImages(productShotImages);
                    setViewerCurrentIndex(2);
                    setViewerModalDownloads(showAdminFounder2dDownloads ? NOIR_2D_VIEWER_DOWNLOADS : null);
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

            {/* 2D mannequin angles — founder admin only; same brick-background PNGs as hero 2D view */}
            {showAdminFounder2dDownloads ? (
            <div
              className="flex flex-col items-center gap-1 px-2"
              style={{ transform: 'translateY(-26px)', marginTop: '4px' }}
            >
              <p
                style={{
                  fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                  fontSize: '9px',
                  color: '#808080',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  margin: 0,
                }}
              >
                download 2d angles (png)
              </p>
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-1" style={{ maxWidth: '100%' }}>
                {NOIR_2D_COMPOSITE_DOWNLOAD_SPECS.map(({ mannequinSrc, label, download }) => (
                  <button
                    key={mannequinSrc}
                    type="button"
                    onClick={() => void downloadCompositeLeafBrickPng(mannequinSrc, download)}
                    style={{
                      fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                      fontSize: '10px',
                      color: '#EB1C24',
                      textDecoration: 'underline',
                      textUnderlineOffset: '2px',
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            ) : null}

              {/* Tabs Section — inside mt-8 mb-6 so translateY(-34px) matches Blanco / Beach Wave */}
              <div className="mt-6" style={{ transform: 'translateY(-20px)', paddingTop: '10px' }}>
                {/* Tab Navigation */}
                <div className="flex justify-center" style={{ gap: '16px' }}>
                <button
                  onClick={() => handleTabClick('DETAILS')}
                  className={`py-1 text-xs font-medium ${activeTab === 'DETAILS' ? 'text-red-500' : 'text-black hover:text-red-500'}`}
                  style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', borderBottom: activeTab === 'DETAILS' ? '1px solid #EB1C24' : 'none', paddingLeft: 0, paddingRight: 0 }}
                >
                  DETAILS
                </button>
                <button
                  onClick={() => handleTabClick('SHIPPING')}
                  className={`py-1 text-xs font-medium ${activeTab === 'SHIPPING' ? 'text-red-500' : 'text-black hover:text-red-500'}`}
                  style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', borderBottom: activeTab === 'SHIPPING' ? '1px solid #EB1C24' : 'none', paddingLeft: 0, paddingRight: 0 }}
                >
                  SHIPPING
                </button>
                <button
                  onClick={() => handleTabClick('POLICY')}
                  className={`py-1 text-xs font-medium ${activeTab === 'POLICY' ? 'text-red-500' : 'text-black hover:text-red-500'}`}
                  style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', borderBottom: activeTab === 'POLICY' ? '1px solid #EB1C24' : 'none', paddingLeft: 0, paddingRight: 0 }}
                >
                  POLICY
                </button>
                <button
                  onClick={() => handleTabClick('CARE/STORAGE')}
                  className={`py-1 text-xs font-medium ${activeTab === 'CARE/STORAGE' ? 'text-red-500' : 'text-black hover:text-red-500'}`}
                  style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', borderBottom: activeTab === 'CARE/STORAGE' ? '1px solid #EB1C24' : 'none', paddingLeft: 0, paddingRight: 0 }}
                >
                  CARE/STORAGE
                </button>
                <button
                  onClick={() => handleTabClick('REVIEWS')}
                  className={`py-1 text-xs font-medium ${activeTab === 'REVIEWS' ? 'text-red-500' : 'text-black hover:text-red-500'}`}
                  style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', borderBottom: activeTab === 'REVIEWS' ? '1px solid #EB1C24' : 'none', paddingLeft: 0, paddingRight: 0 }}
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
                      100% RAW HUMAN HAIR EXTENSIONS USING SINGLE DONOR BUNDLES.
                    </p>
                    <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap' }}>
                      STRETCHY, BREATHABLE CAP WITH REMOVABLE COMBS + ELASTIC BAND FOR A SNUG FIT.
                    </p>
                    <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap' }}>
                      SINGLE STRAND KNOTS ARE LIGHTLY BLEACHED FOR A SEAMLESS, READY TO WEAR APPLICATION.
                    </p>
                    <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap' }}>
                      UNIT COMES UNCUSTOMIZED IN ITS NATURAL STATE. CAN BE BLEACHED, DYED OR COLORED.
                    </p>
                    <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap' }}>
                      USE 3D WIG GENERATOR TO CUSTOMIZE UNIT AS PICTURED, FOR MEMBERS ONLY.
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
                
                {activeTab === 'CARE/STORAGE' && (
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
                          color: '#808080',
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
                              color: '#808080',
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
                              color: '#808080',
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
                              color: '#808080',
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
                <span style={{ color: '#808080' }}>IN THE BAG</span>
              </span>
            )}
          </button>
        </div>

        {/* CUSTOMIZE IN BUILD-A-WIG BUTTON */}
        <div className="px-0 md:px-0" style={{ marginTop: '10px' }}>
            <button
            onClick={() => {
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
                    navigate('/build-a-wig/noir/edit');
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
                localStorage.setItem('selectedCapSize', capSizeToSave);
                localStorage.setItem('customizeSelectedCapSize', capSizeToSave);
                localStorage.setItem('selectedCapSizePrice', '0'); // Custom cap has no additional price
                localStorage.setItem('customizeSelectedCapSizePrice', '0');
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

              // Fresh customize from shop: drop stale fal/WebP triples so hero shows default mannequin, not last session color
              clearPendingBawNoirLiveColorWigViews();
              clearBawNoirLiveColorWigViews();
              clearBawNoirLiveStylingWigViews();
              clearBawNoirLiveBangsWigViews();
              try {
                sessionStorage.setItem(SESSION_BAW_NOIR_RESET_LIVE_ON_CUSTOMIZE, '1');
              } catch {
                /* ignore */
              }
              
              console.log('Customize page - Starting fresh customization with cap size:', capSizeToSave);
              
              navigate('/build-a-wig/noir/customize');
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

        <div className="flex flex-col py-5 px-4" style={{ minWidth: '100%', maxWidth: 'none', overflow: 'visible', paddingTop: '0px' }}>
        {/* SIMILAR PRODUCTS SECTION */}
        <div className="px-0 md:px-0" style={{ marginTop: '20px', marginBottom: '20px', minWidth: '100%', maxWidth: 'none', marginLeft: '-16px', marginRight: '-16px', width: 'calc(100% + 32px)' }}>
          <div 
            className="backdrop-blur-sm"
            style={{ 
            border: '1.3px solid black', 
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            padding: '0px',
            minWidth: '100%',
            maxWidth: 'none',
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
                {/* Product 1 - BLANCO */}
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
                    fontFamily: '"Covered By Your Grace", cursive',
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
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    fontSize: '10px',
                    color: '#EB1C24',
                    textTransform: 'uppercase',
                    margin: '2px 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84',
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
                    lineHeight: '0.84',
                  }}>
                    $820 USD
                  </p>
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
                
                {/* Product 2 - SOFT WAVE */}
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
                    fontFamily: '"Covered By Your Grace", cursive',
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
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    fontSize: '10px',
                    color: '#EB1C24',
                    textTransform: 'uppercase',
                    margin: '2px 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84',
                  }}>
                    24" RAW INDIAN
                  </p>
                  <p style={{ 
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    fontSize: '12px',
                    color: 'black',
                    textTransform: 'uppercase',
                    margin: '0 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84',
                  }}>
                    $760 USD
                  </p>
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
                
                {/* Product 3 - BEACH WAVE */}
                <div onClick={() => navigate('/wavy/beach-wave')} style={marbleStripCellOuter}>
                  <div style={marbleStripCellBand(is3DView)}>
                    <div style={marbleStripThumbWrap(is3DView)}>
                  <img
                    src={is3DView ? "/assets/BEACH WAVE FRONT.JPG" : "/assets/NOIR/wave-thumb.png"}
                    alt="BEACH WAVE"
                    style={marbleStripThumbImg(is3DView)}
                  />
                    </div>
                    <div style={marbleStripTextColStrip(is3DView)}>
                  <p style={{ 
                    fontFamily: '"Covered By Your Grace", cursive',
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
                    BEACH WAVE
                  </p>
                  <p style={{ 
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    fontSize: '10px',
                    color: '#EB1C24',
                    textTransform: 'uppercase',
                    margin: '2px 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84',
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
                    lineHeight: '0.84',
                  }}>
                    $760 USD
                  </p>
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
                
                {/* Product 4 - SOFT CURL */}
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
                    fontFamily: '"Covered By Your Grace", cursive',
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
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    fontSize: '10px',
                    color: '#EB1C24',
                    textTransform: 'uppercase',
                    margin: '2px 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84',
                  }}>
                    24" RAW FILIPINO
                  </p>
                  <p style={{ 
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    fontSize: '12px',
                    color: 'black',
                    textTransform: 'uppercase',
                    margin: '0 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84',
                  }}>
                    $780 USD
                  </p>
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
        <div className="px-0 md:px-0" style={{ marginTop: '3px', marginBottom: '20px', minWidth: '100%', maxWidth: 'none', marginLeft: '-16px', marginRight: '-16px', width: 'calc(100% + 32px)' }}>
          <div 
            className="backdrop-blur-sm"
            style={{ 
            border: '1.3px solid black', 
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            padding: '0px',
            minWidth: '100%',
            maxWidth: 'none',
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
                {/* Product 1 — navigates to Soft wave PDP */}
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
                    fontFamily: '"Covered By Your Grace", cursive',
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
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    fontSize: '10px',
                    color: '#EB1C24',
                    textTransform: 'uppercase',
                    margin: '2px 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84',
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
                    lineHeight: '0.84',
                  }}>
                    $760 USD
                  </p>
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
                    fontFamily: '"Covered By Your Grace", cursive',
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
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    fontSize: '10px',
                    color: '#EB1C24',
                    textTransform: 'uppercase',
                    margin: '2px 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84',
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
                    lineHeight: '0.84',
                  }}>
                    $780 USD
                  </p>
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
                    fontFamily: '"Covered By Your Grace", cursive',
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
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    fontSize: '10px',
                    color: '#EB1C24',
                    textTransform: 'uppercase',
                    margin: '2px 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84',
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
                    lineHeight: '0.84',
                  }}>
                    $740 USD
                  </p>
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
                    fontFamily: '"Covered By Your Grace", cursive',
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
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    fontSize: '10px',
                    color: '#EB1C24',
                    textTransform: 'uppercase',
                    margin: '2px 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84',
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
                    lineHeight: '0.84',
                  }}>
                    $820 USD
                  </p>
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
        onClose={() => {
          setShowImageViewer(false);
          setViewerModalDownloads(null);
        }}
        images={viewerImages}
        currentIndex={viewerCurrentIndex}
        onNavigate={setViewerCurrentIndex}
        footerDownloads={viewerModalDownloads ?? undefined}
      />
    </div>
  );
}

export default NoirSelection;
















