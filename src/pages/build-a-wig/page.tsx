import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoadingScreen from '../../components/base/LoadingScreen';
import DynamicCartIcon from '../../components/DynamicCartIcon';
import ConfirmationModal from '../../components/ConfirmationModal';
import BrandMenuLinks from '../../components/BrandMenuLinks';
import SocialMenuIcons from '../../components/SocialMenuIcons';
import { getPerUserKey, getCurrentUserEmailFromStorage, PER_USER_KEYS } from '../../utils/perUserStorage';
import { clearAppAuth, isAdminEmail } from '../../utils/adminAuth';
import { trackActivity } from '../../utils/activity';
import { ShopMobileMenuShopTab } from '../../components/ShopMobileMenuShopTab';
import { ShopMobileMenuToolsTab } from '../../components/ShopMobileMenuToolsTab';
import { signInHrefWithReturnTo } from '../../utils/signInReturnTo';
import { useShopNavSearchBar } from '../../components/shop/useShopNavSearchBar';
import { isBuildWigPremiumMembershipOptionCategory } from '../../utils/buildWigPremiumOptions';
import { isPremiumMemberForGatedFeatures, prepareMembershipUpgradeNavigation } from '../../utils/premiumMemberAccess';
import {
  BOOKING_NEW_INSTALL_ATTACHED_UNIT_KEY,
  BUILD_WIG_APPOINTMENT_MODE_KEY,
  BUILD_WIG_APPOINTMENT_RETURN_KEY,
  clearBuildWigAppointmentMode,
  isActiveBuildWigAppointmentMode
} from '../../utils/bookingNewInstallUnit';
import {
  BAW_NOIR_LIVE_BANGS_VIEWS_EVENT,
  BAW_NOIR_LIVE_COLOR_VIEWS_EVENT,
  BAW_NOIR_LIVE_STYLING_VIEWS_EVENT,
  resolveAdminNoirHubLiveWigViewsFromStorage,
} from '../../utils/bawNoirLivePreviewStorage';
import { BawNoirWigPreviewHeroThumbs } from '../../components/buildWig/BawNoirWigPreviewFrames';

/** Global BAW hub (`/build-a-wig` only): always static default NOIR mannequin — no live color/styling. */
const DEFAULT_GLOBAL_BAW_HUB_WIG_VIEWS: [string, string, string] = [
  '/assets/natural left.png',
  '/assets/natural front.png',
  '/assets/natural right.png',
];

interface WigCustomization {
  capSize: string;
  length: string;
  density: string;
  lace: string;
  texture: string;
  color: string;
  hairline: string;
  styling: string;
  addOns: string[];
}

export default function BuildAWigPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { NavCenter, SearchTrigger } = useShopNavSearchBar();
  const [selectedView, setSelectedView] = useState(1);
  const [showLoading, setShowLoading] = useState(true);
  const [showPremiumMembershipHubModal, setShowPremiumMembershipHubModal] = useState(false);

  // Track the current route to detect navigation changes
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [routeKey, setRouteKey] = useState(location.pathname);

  /** Live NOIR WebPs on product hub only — not used on exact `/build-a-wig` (static default hero there). */
  const [liveNoirHubWigViews, setLiveNoirHubWigViews] = useState<[string, string, string] | null>(null);
  
  // Track current editing item ID to detect when switching between products
  const currentEditingItemIdRef = useRef<string | null>(null);
  
  const [customization, setCustomization] = useState<WigCustomization>(() => {
    // Use location.pathname from React Router
    // Check if we're in edit mode or customize mode
    const currentPath = location.pathname;
    const isEditMode = currentPath === '/build-a-wig/edit' ||
                       currentPath === '/build-a-wig/noir/edit' ||
                       currentPath === '/build-a-wig/blanco/edit' ||
                       currentPath === '/build-a-wig/soft-wave/edit' ||
                       currentPath === '/build-a-wig/soft-curl/edit' ||
                       currentPath === '/build-a-wig/ocean-curl/edit' ||
                       currentPath === '/build-a-wig/beach-wave/edit';
    const isCustomizeMode = currentPath === '/build-a-wig/noir/customize' || 
                            currentPath === '/build-a-wig/blanco/customize' ||
                            currentPath === '/build-a-wig/soft-wave/customize' ||
                            currentPath === '/build-a-wig/soft-curl/customize' ||
                            currentPath === '/build-a-wig/ocean-curl/customize' ||
                            currentPath === '/build-a-wig/beach-wave/customize';
    const isBlancoRoute = currentPath.startsWith('/build-a-wig/blanco');
    const isProductMainRoute = currentPath === '/build-a-wig/blanco' ||
                               currentPath === '/build-a-wig/soft-wave' ||
                               currentPath === '/build-a-wig/soft-curl' ||
                               currentPath === '/build-a-wig/ocean-curl' ||
                               currentPath === '/build-a-wig/beach-wave' ||
                               currentPath === '/build-a-wig/noir';
    
    // If in customize mode or product-specific main route, load cap size with defaults
    if (isCustomizeMode || isProductMainRoute) {
      const savedCapSize = localStorage.getItem('selectedCapSize');
      if (savedCapSize || isCustomizeMode) {
        // Determine default texture based on product route
        const isOceanCurlRoute = currentPath.startsWith('/build-a-wig/ocean-curl');
        const isBeachWaveRoute = currentPath.startsWith('/build-a-wig/beach-wave');
        const isSoftCurlRoute = currentPath.startsWith('/build-a-wig/soft-curl');
        const isSoftWaveRoute = currentPath.startsWith('/build-a-wig/soft-wave');
        let defaultTexture = 'SILKY';
        if (isOceanCurlRoute || isSoftCurlRoute) {
          defaultTexture = 'CURLY';
        } else if (isBeachWaveRoute || isSoftWaveRoute) {
          defaultTexture = 'WAVY';
        }
        
        return {
          capSize: savedCapSize || 'M',
          length: '24"',
          density: isBlancoRoute ? '250%' : '200%',
          lace: '13X6',
          texture: defaultTexture,
          color: isBlancoRoute ? 'PLATINUM' : 'OFF BLACK',
          hairline: 'NATURAL',
          styling: 'NONE',
          addOns: [],
        };
      }
    }
    
    // If in edit mode, load from editingCartItem
    if (isEditMode) {
      const editingCartItem = localStorage.getItem('editingCartItem');
      if (editingCartItem) {
        try {
          const item = JSON.parse(editingCartItem);
          
          // CRITICAL: Only set editSelected* keys if they don't already exist
          // This prevents overwriting selections made by sub-pages when component re-mounts
          // Sub-pages set these values, and we should preserve them
          if (!localStorage.getItem('editSelectedCapSize')) {
            localStorage.setItem('editSelectedCapSize', item.capSize || 'M');
          }
          if (!localStorage.getItem('editSelectedLength')) {
            localStorage.setItem('editSelectedLength', item.length || '24"');
          }
          if (!localStorage.getItem('editSelectedDensity')) {
            localStorage.setItem('editSelectedDensity', item.density || '200%');
          }
          if (!localStorage.getItem('editSelectedLace')) {
            localStorage.setItem('editSelectedLace', item.lace || '13X6');
          }
          if (!localStorage.getItem('editSelectedTexture')) {
            localStorage.setItem('editSelectedTexture', item.texture || 'SILKY');
          }
          if (!localStorage.getItem('editSelectedColor')) {
            // For BLANCO items, default to PLATINUM; for others, default to OFF BLACK
            const isBlancoRouteForColor = currentPath.startsWith('/build-a-wig/blanco');
            // If item.color exists and is valid, use it; otherwise use default
            // For BLANCO, if color is not a valid BLANCO color (GOLDEN, PLATINUM, ASH), use PLATINUM
            let colorToSet = item.color;
            if (isBlancoRouteForColor || item.name === 'BLANCO') {
              const validBlancoColors = ['GOLDEN', 'PLATINUM', 'ASH'];
              if (!colorToSet || !validBlancoColors.includes(colorToSet)) {
                colorToSet = 'PLATINUM';
              }
            } else {
              colorToSet = colorToSet || 'OFF BLACK';
            }
            localStorage.setItem('editSelectedColor', colorToSet);
          }
          if (!localStorage.getItem('editSelectedHairline')) {
            localStorage.setItem('editSelectedHairline', item.hairline || 'NATURAL');
          }
          if (!localStorage.getItem('editSelectedStyling')) {
            localStorage.setItem('editSelectedStyling', item.styling || 'NONE');
          }
          if (!localStorage.getItem('editSelectedAddOns')) {
            localStorage.setItem('editSelectedAddOns', JSON.stringify(item.addOns || []));
          }
          
          // CRITICAL: Set cap size price from cart item to ensure flexible cap (+$40) is recognized
          // Other prices will be calculated in useEffect when calculatePricesFromSelections is available
          if (!localStorage.getItem('editSelectedCapSizePrice')) {
            const capSizePrice = (item.capSize === 'XXS/XS/S' || item.capSize === 'S/M/L') ? '40' : '0';
            console.log('[FLEX_CAP_DEBUG] INITIAL_LOAD - Setting cap size price:', {
              itemCapSize: item.capSize,
              calculatedPrice: capSizePrice,
              isFlexible: item.capSize === 'XXS/XS/S' || item.capSize === 'S/M/L',
              timestamp: new Date().toISOString()
            });
            localStorage.setItem('editSelectedCapSizePrice', capSizePrice);
            localStorage.setItem('selectedCapSizePrice', capSizePrice);
          }
          
          // CRITICAL: Only set default prices to 0 if they don't already exist
          // This preserves prices set by sub-pages when user navigates back to main page
          // Sub-pages set editSelected*Price keys when user confirms selections
          // We should NOT recalculate from cart item as that would overwrite sub-page prices
          if (!localStorage.getItem('editSelectedColorPrice')) {
            localStorage.setItem('editSelectedColorPrice', '0'); // Default, will be updated by sub-pages
          }
          if (!localStorage.getItem('editSelectedLengthPrice')) {
            localStorage.setItem('editSelectedLengthPrice', '0'); // Default, will be updated by sub-pages
          }
          if (!localStorage.getItem('editSelectedDensityPrice')) {
            localStorage.setItem('editSelectedDensityPrice', '0'); // Default, will be updated by sub-pages
          }
          if (!localStorage.getItem('editSelectedLacePrice')) {
            localStorage.setItem('editSelectedLacePrice', '0'); // Default, will be updated by sub-pages
          }
          if (!localStorage.getItem('editSelectedTexturePrice')) {
            localStorage.setItem('editSelectedTexturePrice', '0'); // Default, will be updated by sub-pages
          }
          if (!localStorage.getItem('editSelectedHairlinePrice')) {
            localStorage.setItem('editSelectedHairlinePrice', '0'); // Default, will be updated by sub-pages
          }
          if (!localStorage.getItem('editSelectedStylingPrice')) {
            localStorage.setItem('editSelectedStylingPrice', '0'); // Default, will be updated by sub-pages
          }
          if (!localStorage.getItem('editSelectedAddOnsPrice')) {
            localStorage.setItem('editSelectedAddOnsPrice', '0'); // Default, will be updated by sub-pages
          }
          
          // Also set selected* keys for consistency
          localStorage.setItem('selectedCapSize', item.capSize || 'M');
          localStorage.setItem('selectedLength', item.length || '24"');
          localStorage.setItem('selectedDensity', item.density || '200%');
          localStorage.setItem('selectedLace', item.lace || '13X6');
          localStorage.setItem('selectedTexture', item.texture || 'SILKY');
          // For BLANCO items, default to PLATINUM; for others, default to OFF BLACK
          const defaultColorForReturn = (isBlancoRoute || item.name === 'BLANCO') ? 'PLATINUM' : 'OFF BLACK';
          localStorage.setItem('selectedColor', item.color || defaultColorForReturn);
          localStorage.setItem('selectedHairline', item.hairline || 'NATURAL');
          localStorage.setItem('selectedStyling', item.styling || 'NONE');
          localStorage.setItem('selectedAddOns', JSON.stringify(item.addOns || []));
          
          // Return the cart item's selections
          // CRITICAL: Validate BLANCO colors - if item.color is invalid for BLANCO, use PLATINUM
          let returnColor = item.color;
          if (isBlancoRoute || item.name === 'BLANCO') {
            const validBlancoColors = ['GOLDEN', 'PLATINUM', 'ASH'];
            if (!returnColor || !validBlancoColors.includes(returnColor)) {
              returnColor = 'PLATINUM'; // Default to PLATINUM for invalid/missing BLANCO colors
              // Also update localStorage to fix the stored value
              localStorage.setItem('editSelectedColor', 'PLATINUM');
              localStorage.setItem('selectedColor', 'PLATINUM');
            }
          } else {
            returnColor = returnColor || defaultColorForReturn;
          }
          
          return {
            capSize: item.capSize || 'M',
            length: item.length || '24"',
            density: item.density || '200%',
            lace: item.lace || '13X6',
            texture: item.texture || 'SILKY',
            color: returnColor,
            hairline: item.hairline || 'NATURAL',
            styling: item.styling || 'NONE',
            addOns: item.addOns || [],
          };
        } catch (error) {
        }
      }
      
      // CRITICAL: In edit mode, return early to prevent clearing localStorage
      // The editSelected* keys are already set above, and useEffect will load from editingCartItem
      return {
        capSize: 'M',
        length: '24"',
        density: '200%',
        lace: '13X6',
        texture: 'SILKY',
        color: 'OFF BLACK',
        hairline: 'NATURAL',
        styling: 'NONE',
        addOns: [],
      };
    }
    
    // Check if there are saved values (coming back from sub-page)
    // If not, clear localStorage and set defaults (first visit)
    const hasSavedValues = localStorage.getItem('selectedCapSize') || 
                           localStorage.getItem('selectedLength') || 
                           localStorage.getItem('selectedDensity') ||
                           localStorage.getItem('selectedColor');
    
    if (!hasSavedValues) {
      // Clear localStorage synchronously BEFORE setting initial state
      // This ensures defaults are always shown on first visit
    localStorage.removeItem('selectedCapSize');
    localStorage.removeItem('selectedLength');
    localStorage.removeItem('selectedDensity');
    localStorage.removeItem('selectedColor');
    localStorage.removeItem('selectedTexture');
    localStorage.removeItem('selectedLace');
    localStorage.removeItem('selectedHairline');
    localStorage.removeItem('selectedPartSelection');
    localStorage.removeItem('selectedStyling');
    localStorage.removeItem('selectedAddOns');
    localStorage.removeItem('selectedHairStyling');
    
    // CRITICAL: Remove ALL price items FIRST to clear any stale values
    localStorage.removeItem('selectedCapSizePrice');
    localStorage.removeItem('selectedColorPrice');
    localStorage.removeItem('selectedLengthPrice');
    localStorage.removeItem('selectedDensityPrice');
    localStorage.removeItem('selectedLacePrice');
    localStorage.removeItem('selectedTexturePrice');
    localStorage.removeItem('selectedHairlinePrice');
    localStorage.removeItem('selectedStylingPrice');
    localStorage.removeItem('selectedAddOnsPrice');
    }
    
    // Set defaults in localStorage so sub-pages can read them
    // CRITICAL: Check product-specific routes to set correct defaults
    const isBlancoRouteForDefaults = currentPath.startsWith('/build-a-wig/blanco');
    const defaults = {
      capSize: 'M',
      length: '24"',
      density: isBlancoRouteForDefaults ? '250%' : '200%',
      lace: '13X6',
      texture: 'SILKY',
      color: isBlancoRouteForDefaults ? 'PLATINUM' : 'OFF BLACK',
      hairline: 'NATURAL',
      styling: 'NONE',
      addOns: [],
    };
    
    // Only set defaults if we cleared localStorage (first visit)
    if (!hasSavedValues) {
    localStorage.setItem('selectedCapSize', defaults.capSize);
    localStorage.setItem('selectedLength', defaults.length);
    localStorage.setItem('selectedDensity', defaults.density);
    localStorage.setItem('selectedColor', defaults.color);
    localStorage.setItem('selectedTexture', defaults.texture);
    localStorage.setItem('selectedLace', defaults.lace);
    localStorage.setItem('selectedHairline', defaults.hairline);
    localStorage.setItem('selectedStyling', defaults.styling);
    localStorage.setItem('selectedAddOns', JSON.stringify(defaults.addOns));
    
    // Set all default prices to 0 synchronously AFTER removing old values
    localStorage.setItem('selectedCapSizePrice', '0');
    localStorage.setItem('selectedColorPrice', '0');
    localStorage.setItem('selectedLengthPrice', '0');
    localStorage.setItem('selectedDensityPrice', '0');
    localStorage.setItem('selectedLacePrice', '0');
    localStorage.setItem('selectedTexturePrice', '0');
    localStorage.setItem('selectedHairlinePrice', '0');
    localStorage.setItem('selectedStylingPrice', '0');
    localStorage.setItem('selectedAddOnsPrice', '0');
    }
    
    // Return defaults for normal mode
    // The route change effect will load from localStorage when returning from sub-pages
    return defaults;
  });

  // Calculate base price - use correct base price for each product (cap size price is added separately)
  const basePrice = useMemo(() => {
    const pathname = location.pathname;
    // Check for product-specific routes (main, customize, edit)
    if (pathname.startsWith('/build-a-wig/blanco')) return 820; // Blanco base price is 820
    if (pathname.startsWith('/build-a-wig/soft-wave') || pathname.startsWith('/build-a-wig/beach-wave')) return 760; // Soft Wave/Beach Wave base price is 760
    if (pathname.startsWith('/build-a-wig/soft-curl') || pathname.startsWith('/build-a-wig/ocean-curl')) return 780; // Soft Curl/Ocean Curl base price is 780
    if (pathname.startsWith('/build-a-wig/noir')) return 740; // Noir base price is 740
    return 740; // Default noir base price, flexible caps add $40 via capSizePrice
  }, [location.pathname]);

  useEffect(() => {
    const refreshPremiumHubModal = () => {
      if (isPremiumMemberForGatedFeatures()) setShowPremiumMembershipHubModal(false);
    };
    window.addEventListener('signInStateChanged', refreshPremiumHubModal);
    window.addEventListener('focus', refreshPremiumHubModal);
    return () => {
      window.removeEventListener('signInStateChanged', refreshPremiumHubModal);
      window.removeEventListener('focus', refreshPremiumHubModal);
    };
  }, []);

  // Helper function to calculate prices from selections
  const calculatePricesFromSelections = useCallback((selections: WigCustomization) => {
    // Calculate cap size price: flexible caps (XXS/XS/S, S/M/L) cost $40 more than regular caps
    // Custom caps (XS, S, M, L) have price 0 (included in base price)
    let capSizePrice = 0;
    if (selections.capSize === 'XXS/XS/S' || selections.capSize === 'S/M/L') {
      capSizePrice = 40; // Flexible caps cost $40 more
    }
    // Note: Custom caps (XS, S, M, L) have price 0 by default - they're included in base price
    
    const prices: { [key: string]: number } = {
      capSizePrice: capSizePrice,
      colorPrice: 0,
      lengthPrice: 0,
      densityPrice: 0,
      lacePrice: 0,
      texturePrice: 0,
      hairlinePrice: 0,
      stylingPrice: 0,
      addOnsPrice: 0
    };
    
    // Calculate length price
    // CRITICAL: Include ALL length options with correct prices from length page
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
    prices.lengthPrice = lengthPrices[selections.length] || 0;
    
    // Calculate color price
    // PLATINUM is the default color for blanco (free), OFF BLACK is default for noir (free)
    const isBlancoRoute = location.pathname.startsWith('/build-a-wig/blanco');
    const defaultColor = isBlancoRoute ? 'PLATINUM' : 'OFF BLACK';
    
    if (selections.color && selections.color !== defaultColor) {
      // For blanco colors: GOLDEN is -$20, ASH is $20, PLATINUM is $0 (default)
      if (isBlancoRoute) {
        if (selections.color === 'GOLDEN') {
          prices.colorPrice = -20; // -$20 discount
        } else if (selections.color === 'ASH') {
          prices.colorPrice = 20; // $20 additional cost
        } else {
          prices.colorPrice = 0; // PLATINUM is default (free)
        }
      } else {
        // For noir and other products: match color sub-page customize/edit (`getSelectedPrice`) — flat $120 for any non-default color
        prices.colorPrice = 120;
      }
    }
    
    // Calculate density price
    // CRITICAL: Include negative prices for discounts (130%, 150%, 180%) to match sub-page prices
    // These negative prices must be stored correctly so they persist when navigating away
    // Blanco edit/customize mode has different pricing
    const densityPrices: { [key: string]: number } = isBlancoRoute ? {
      '130%': -80, // $80 discount
      '150%': -60, // $60 discount
      '180%': -40, // $40 discount
      '200%': -20, // $20 discount
      '250%': 0,   // Default - included in base price
      '300%': 160, // $160 more than default
      '350%': 240, // $240 more than default
      '400%': 320  // $320 more than default
    } : {
      '130%': -60, // $60 discount
      '150%': -40, // $40 discount
      '180%': -20, // $20 discount
      '200%': 0,   // Default - included in base price
      '250%': 80,  // $80 more than default
      '300%': 160, // $160 more than default
      '350%': 240, // $240 more than default
      '400%': 320  // $320 more than default
    };
    prices.densityPrice = densityPrices[selections.density] || 0;
    
    // Calculate lace price
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
    prices.lacePrice = lacePrices[selections.lace] || 0;
    
    // Calculate texture price
    // CRITICAL: Some textures have prices (KINKY, YAKI cost $40)
    const texturePrices: { [key: string]: number } = {
      'SILKY': 0,
      'KINKY': 40,
      'YAKI': 40,
      'WAVY': 0,
      'CURLY': 0
    };
    prices.texturePrice = texturePrices[selections.texture] || 0;
    
    // Calculate hairline price
    // CRITICAL: Handle NATURAL, PEAK, LAGOS, and LAGOS+PEAK combination
    // Options: NATURAL ($0), PEAK ($40), LAGOS ($60), LAGOS+PEAK ($80 with $20 discount)
    if (!selections.hairline || selections.hairline === 'NATURAL') {
      prices.hairlinePrice = 0;
    } else {
      const hairlineArray = selections.hairline.split(',').map(h => h.trim());
      let total = 0;
      
      hairlineArray.forEach(h => {
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
      
      prices.hairlinePrice = total;
    }
    
    // Calculate styling price
    // CRITICAL: Match styling page logic exactly - handle combinations and long length surcharges
    if (!selections.styling || selections.styling === 'NONE') {
      prices.stylingPrice = 0;
    } else {
      // Handle comma-separated styling values (combinations like "BANGS,CRIMPS")
      const stylingArray = selections.styling.split(',').map(s => s.trim());
      const hasBangs = stylingArray.includes('BANGS');
      const otherStyling = stylingArray.find(id => id !== 'BANGS');
      
      // Get selected length to check for long length surcharge
      const selectedLength = selections.length || '';
      const isLongLength = selectedLength.includes('30') || selectedLength.includes('32') || selectedLength.includes('34') || selectedLength.includes('36');
      
    const stylingPrices: { [key: string]: number } = {
      'BANGS': 40,
        'CRIMPS': 80,
        'FLAT IRON': 80,
        'LAYERS': 120
      };
      
      if (hasBangs && otherStyling) {
        // Bangs + another styling: full price of secondary option + $20 for bangs (reduced from $40)
        let secondaryPrice = stylingPrices[otherStyling] || 0;
        
        // Add $40 for lengths 30" and above for crimps, flat iron, and layers
        if (isLongLength && (otherStyling === 'CRIMPS' || otherStyling === 'FLAT IRON' || otherStyling === 'LAYERS')) {
          secondaryPrice += 40;
        }
        
        prices.stylingPrice = secondaryPrice + 20; // $20 for bangs when combined
      } else if (hasBangs) {
        // Bangs only: $40 (base price)
        prices.stylingPrice = 40;
      } else {
        // Other styling only: use original price + length surcharge
        const stylingId = stylingArray[0];
        let basePrice = stylingPrices[stylingId] || 0;
        
        // Add $40 for lengths 30" and above for crimps, flat iron, and layers
        if (isLongLength && (stylingId === 'CRIMPS' || stylingId === 'FLAT IRON' || stylingId === 'LAYERS')) {
          basePrice += 40;
        }
        
        prices.stylingPrice = basePrice;
      }
    }
    
    // Calculate add-ons price
    // Base prices from addons page
    const addOnBasePrices: { [key: string]: number } = {
      'BLEACH': 60,
      'PLUCK': 80,
      'BLUNT CUT': 20
    };
    
    // Lace sizes that get $20 discount for BLEACH and PLUCK
    const discountedLaceSizes = ['2X6', '4X4', '5X5', '6X6', '7X7'];
    const hasLaceDiscount = selections.lace && discountedLaceSizes.includes(selections.lace);
    
    prices.addOnsPrice = (selections.addOns || []).reduce((total: number, addOn: string) => {
      let price = addOnBasePrices[addOn] || 0;
      
      // Apply $20 discount for bleach and pluck when specific lace sizes are selected
      if (hasLaceDiscount && (addOn === 'BLEACH' || addOn === 'PLUCK')) {
        price -= 20;
      }
      
      return total + price;
    }, 0);
    
    return prices;
  }, [location.pathname]);
  
  // Helper function to save prices with correct prefix (editSelected in edit mode, customizeSelected in customize mode, selected otherwise)
  const savePricesToLocalStorage = useCallback((prices: { [key: string]: number }) => {
    const isEditMode = (location.pathname === '/build-a-wig/edit' ||
                       location.pathname === '/build-a-wig/noir/edit' ||
                       location.pathname === '/build-a-wig/blanco/edit' ||
                       location.pathname === '/build-a-wig/soft-wave/edit' ||
                       location.pathname === '/build-a-wig/soft-curl/edit' ||
                       location.pathname === '/build-a-wig/ocean-curl/edit' ||
                       location.pathname === '/build-a-wig/beach-wave/edit') && localStorage.getItem('editingCartItem') !== null;
    const isCustomizeMode = location.pathname.startsWith('/build-a-wig/noir/customize') || 
                            location.pathname.startsWith('/build-a-wig/blanco/customize') ||
                            location.pathname.startsWith('/build-a-wig/soft-wave/customize') ||
                            location.pathname.startsWith('/build-a-wig/soft-curl/customize') ||
                            location.pathname.startsWith('/build-a-wig/ocean-curl/customize') ||
                            location.pathname.startsWith('/build-a-wig/beach-wave/customize');
    
    // CRITICAL: Validate cap size price - if cap size is flexible but price is 0, don't save (preserve existing)
    const currentCapSize = localStorage.getItem('editSelectedCapSize') || localStorage.getItem('selectedCapSize') || 'M';
    const isFlexibleCap = currentCapSize === 'XXS/XS/S' || currentCapSize === 'S/M/L';
    const existingCapSizePrice = localStorage.getItem('editSelectedCapSizePrice') || localStorage.getItem('selectedCapSizePrice');
    
    console.log('[FLEX_CAP_DEBUG] SAVE_PRICES - Before validation:', {
      currentCapSize,
      isFlexibleCap,
      priceToSave: prices.capSizePrice,
      existingCapSizePrice,
      timestamp: new Date().toISOString()
    });
    
    // If flexible cap but price being saved is 0, check if we should preserve existing price
    if (isFlexibleCap && prices.capSizePrice === 0) {
      if (existingCapSizePrice && existingCapSizePrice !== '0' && !isNaN(parseFloat(existingCapSizePrice))) {
        console.log('[FLEX_CAP_DEBUG] SAVE_PRICES - Preserving existing capSizePrice', existingCapSizePrice, 'instead of saving 0 for flexible cap');
        prices.capSizePrice = parseFloat(existingCapSizePrice);
      } else {
        // No existing price or it's also 0, use calculated value (40)
        console.log('[FLEX_CAP_DEBUG] SAVE_PRICES - Setting capSizePrice to 40 for flexible cap (was 0)');
        prices.capSizePrice = 40;
      }
    }
    
    console.log('[FLEX_CAP_DEBUG] SAVE_PRICES - After validation:', {
      finalPrice: prices.capSizePrice,
      currentCapSize,
      isFlexibleCap,
      timestamp: new Date().toISOString()
    });
    
    // Always save with 'selected' prefix for sub-pages
    localStorage.setItem('selectedCapSizePrice', prices.capSizePrice.toString());
    localStorage.setItem('selectedColorPrice', prices.colorPrice.toString());
    localStorage.setItem('selectedLengthPrice', prices.lengthPrice.toString());
    localStorage.setItem('selectedDensityPrice', prices.densityPrice.toString());
    localStorage.setItem('selectedLacePrice', prices.lacePrice.toString());
    localStorage.setItem('selectedTexturePrice', prices.texturePrice.toString());
    localStorage.setItem('selectedHairlinePrice', prices.hairlinePrice.toString());
    localStorage.setItem('selectedStylingPrice', prices.stylingPrice.toString());
    localStorage.setItem('selectedAddOnsPrice', prices.addOnsPrice.toString());
    
    // Also save with 'editSelected' prefix in edit mode for CartDropdown
    if (isEditMode) {
      localStorage.setItem('editSelectedCapSizePrice', prices.capSizePrice.toString());
      localStorage.setItem('editSelectedColorPrice', prices.colorPrice.toString());
      localStorage.setItem('editSelectedLengthPrice', prices.lengthPrice.toString());
      localStorage.setItem('editSelectedDensityPrice', prices.densityPrice.toString());
      localStorage.setItem('editSelectedLacePrice', prices.lacePrice.toString());
      localStorage.setItem('editSelectedTexturePrice', prices.texturePrice.toString());
      localStorage.setItem('editSelectedHairlinePrice', prices.hairlinePrice.toString());
      localStorage.setItem('editSelectedStylingPrice', prices.stylingPrice.toString());
      localStorage.setItem('editSelectedAddOnsPrice', prices.addOnsPrice.toString());
    }
    
    // Also save with 'customizeSelected' prefix in customize mode
    if (isCustomizeMode) {
      localStorage.setItem('customizeSelectedCapSizePrice', prices.capSizePrice.toString());
      localStorage.setItem('customizeSelectedColorPrice', prices.colorPrice.toString());
      localStorage.setItem('customizeSelectedLengthPrice', prices.lengthPrice.toString());
      localStorage.setItem('customizeSelectedDensityPrice', prices.densityPrice.toString());
      localStorage.setItem('customizeSelectedLacePrice', prices.lacePrice.toString());
      localStorage.setItem('customizeSelectedTexturePrice', prices.texturePrice.toString());
      localStorage.setItem('customizeSelectedHairlinePrice', prices.hairlinePrice.toString());
      localStorage.setItem('customizeSelectedStylingPrice', prices.stylingPrice.toString());
      localStorage.setItem('customizeSelectedAddOnsPrice', prices.addOnsPrice.toString());
    }
  }, [location.pathname]);
  
  const [totalPrice, setTotalPrice] = useState(740);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Ref to track if we're currently loading from localStorage (to prevent sync effect from overwriting)
  const isLoadingFromStorage = useRef(false);

  // REMOVED: isEditingMode, originalItem, hasChanges - editing is handled by noir/edit page, not this page

  // Load selections from localStorage when returning from sub-pages or in edit mode
  useEffect(() => {
    // Check if we're on the build-a-wig page, edit page, or customize page (not a sub-page)
    // NOTE: Removed check for '/' since root path now goes to lobby page
    // CRITICAL: Include product-specific main routes (blanco, soft-wave, soft-curl, noir)
    const isMainPage = location.pathname === '/build-a-wig' ||
                       location.pathname === '/build-a-wig/noir' ||
                       location.pathname === '/build-a-wig/blanco' ||
                       location.pathname === '/build-a-wig/soft-wave' ||
                       location.pathname === '/build-a-wig/soft-curl' ||
                       location.pathname === '/build-a-wig/beach-wave' ||
                       location.pathname === '/build-a-wig/ocean-curl';
    const isEditPage = location.pathname === '/build-a-wig/edit' ||
                       location.pathname === '/build-a-wig/noir/edit' ||
                       location.pathname === '/build-a-wig/blanco/edit' ||
                       location.pathname === '/build-a-wig/soft-wave/edit' ||
                       location.pathname === '/build-a-wig/soft-curl/edit' ||
                       location.pathname === '/build-a-wig/beach-wave/edit' ||
                       location.pathname === '/build-a-wig/ocean-curl/edit';
    const isCustomizePage = location.pathname.startsWith('/build-a-wig/noir/customize') || 
                            location.pathname.startsWith('/build-a-wig/blanco/customize') ||
                            location.pathname.startsWith('/build-a-wig/soft-wave/customize') ||
                            location.pathname.startsWith('/build-a-wig/soft-curl/customize') ||
                            location.pathname.startsWith('/build-a-wig/ocean-curl/customize') ||
                            location.pathname.startsWith('/build-a-wig/beach-wave/customize');
    
    // Check if coming from sub-page early to set loading flag immediately
    const comingFromSubPage = sessionStorage.getItem('comingFromSubPage') === 'true';
    
    // Set loading flag early to prevent sync effect from interfering
    if (comingFromSubPage && (isMainPage || isEditPage || isCustomizePage)) {
      isLoadingFromStorage.current = true;
    }
    
    // Update route key to track navigation (but allow routeKey to be updated by other effects)
    // Only reset if routeKey doesn't match pathname AND routeKey doesn't contain a reload marker
    if (location.pathname !== routeKey && !routeKey.includes('_reload') && !routeKey.includes('_')) {
      setRouteKey(location.pathname);
    }
    
    if (isCustomizePage) {
      // Set flag to prevent sync effect from overwriting
      isLoadingFromStorage.current = true;
      
      const comingFromSubPage = sessionStorage.getItem('comingFromSubPage') === 'true';
      
      // If coming from sub-page, load updated values from localStorage
      if (comingFromSubPage) {
        
        // Load updated values from localStorage (set by sub-pages)
        // CRITICAL: Always prioritize customizeSelected* keys first (set by sub-pages), then selected* keys
        const savedCapSizeCustomize = localStorage.getItem('customizeSelectedCapSize');
        const savedLengthCustomize = localStorage.getItem('customizeSelectedLength');
        const savedDensityCustomize = localStorage.getItem('customizeSelectedDensity');
        const savedLaceCustomize = localStorage.getItem('customizeSelectedLace');
        const savedTextureCustomize = localStorage.getItem('customizeSelectedTexture');
        const savedColorCustomize = localStorage.getItem('customizeSelectedColor');
        const savedHairlineCustomize = localStorage.getItem('customizeSelectedHairline');
        const savedStylingCustomize = localStorage.getItem('customizeSelectedStyling');
        const savedAddOnsCustomize = localStorage.getItem('customizeSelectedAddOns');
        
        // Also check selected* keys as fallback
        const savedCapSizeSelected = localStorage.getItem('selectedCapSize');
        const savedLengthSelected = localStorage.getItem('selectedLength');
        const savedDensitySelected = localStorage.getItem('selectedDensity');
        const savedLaceSelected = localStorage.getItem('selectedLace');
        const savedTextureSelected = localStorage.getItem('selectedTexture');
        const savedColorSelected = localStorage.getItem('selectedColor');
        const savedHairlineSelected = localStorage.getItem('selectedHairline');
        const savedStylingSelected = localStorage.getItem('selectedStyling');
        const savedAddOnsSelected = localStorage.getItem('selectedAddOns');
        
        // CRITICAL: Prioritize customizeSelected* keys (set by sub-pages), then selected* keys, then current state
        // This ensures we always use the NEW value from the sub-page, not stale values
        const isBlancoCustomizeRoute = location.pathname.startsWith('/build-a-wig/blanco');
        const isOceanCurlCustomizeRoute = location.pathname.startsWith('/build-a-wig/ocean-curl');
        const isBeachWaveCustomizeRoute = location.pathname.startsWith('/build-a-wig/beach-wave');
        const isSoftCurlCustomizeRoute = location.pathname.startsWith('/build-a-wig/soft-curl');
        const isSoftWaveCustomizeRoute = location.pathname.startsWith('/build-a-wig/soft-wave');
        const defaultColor = isBlancoCustomizeRoute ? 'PLATINUM' : 'OFF BLACK';
        
        // Determine product-specific default texture
        let defaultTexture = 'SILKY';
        if (isOceanCurlCustomizeRoute || isSoftCurlCustomizeRoute) {
          defaultTexture = 'CURLY';
        } else if (isBeachWaveCustomizeRoute || isSoftWaveCustomizeRoute) {
          defaultTexture = 'WAVY';
        }
        
        const savedCapSizeFinal = savedCapSizeCustomize || savedCapSizeSelected || customization.capSize || 'M';
        const savedLength = savedLengthCustomize || savedLengthSelected || customization.length || '24"';
        const savedDensity = savedDensityCustomize || savedDensitySelected || customization.density || '200%';
        const savedLace = savedLaceCustomize || savedLaceSelected || customization.lace || '13X6';
        const savedTexture = savedTextureCustomize || savedTextureSelected || customization.texture || defaultTexture;
        const savedColor = savedColorCustomize || savedColorSelected || customization.color || defaultColor;
        const savedHairline = savedHairlineCustomize || savedHairlineSelected || customization.hairline || 'NATURAL';
        const savedStyling = savedStylingCustomize || savedStylingSelected || customization.styling || 'NONE';
        const savedAddOns = savedAddOnsCustomize || savedAddOnsSelected || JSON.stringify(customization.addOns) || '[]';
        
        // CRITICAL: Ensure styling is not a part selection (MIDDLE, LEFT, RIGHT) - it should be NONE or a valid styling option
        let validStyling = savedStyling !== null && savedStyling !== 'NONE' ? savedStyling : 'NONE';
        const partSelectionOptions = ['MIDDLE', 'LEFT', 'RIGHT'];
        if (partSelectionOptions.includes(validStyling)) {
          validStyling = 'NONE'; // If styling is a part selection, set to NONE
        }
        
        let updatedCustomization = {
          capSize: savedCapSizeFinal,
          length: savedLength,
          density: savedDensity,
          lace: savedLace,
          texture: savedTexture,
          color: savedColor,
          hairline: savedHairline,
          styling: validStyling,
          addOns: savedAddOns ? JSON.parse(savedAddOns) : [],
        };
        
        // When style is removed (NONE): restore add-ons to what they were before styling auto-added BLEACH+PLUCK
        if ((validStyling === 'NONE' || !validStyling.trim()) && sessionStorage.getItem('bleachPluckAutoAddedForStyling') === 'true' && (updatedCustomization.addOns.includes('BLEACH') || updatedCustomization.addOns.includes('PLUCK'))) {
          const savedBeforeStyling = sessionStorage.getItem('addOnsBeforeStylingSelection');
          const restoredAddOns = savedBeforeStyling ? (JSON.parse(savedBeforeStyling) as string[]) : updatedCustomization.addOns.filter((x: string) => x !== 'BLEACH' && x !== 'PLUCK');
          updatedCustomization = { ...updatedCustomization, addOns: restoredAddOns };
          const discountedLaceSizesRm = ['2X6', '4X4', '5X5', '6X6', '7X7'];
          const hasLaceDiscountRm = discountedLaceSizesRm.includes(updatedCustomization.lace || '');
          const addOnPricesRm: Record<string, number> = { BLEACH: 60, PLUCK: 80, 'BLUNT CUT': 20 };
          const addOnsPriceAfterRm = updatedCustomization.addOns.reduce((sum: number, id: string) => {
            let p = addOnPricesRm[id] ?? 0;
            if (hasLaceDiscountRm && (id === 'BLEACH' || id === 'PLUCK')) p -= 20;
            return sum + p;
          }, 0);
          localStorage.setItem('customizeSelectedAddOns', JSON.stringify(updatedCustomization.addOns));
          localStorage.setItem('selectedAddOns', JSON.stringify(updatedCustomization.addOns));
          localStorage.setItem('customizeSelectedAddOnsPrice', addOnsPriceAfterRm.toString());
          localStorage.setItem('selectedAddOnsPrice', addOnsPriceAfterRm.toString());
          sessionStorage.removeItem('bleachPluckAutoAddedForStyling');
          sessionStorage.removeItem('addOnsBeforeStylingSelection');
        }
        
        // When a style is confirmed, BLEACH + PLUCK are required — auto-add and save price so main page shows correct total
        if (validStyling !== 'NONE' && validStyling.trim() !== '' && (!updatedCustomization.addOns.includes('BLEACH') || !updatedCustomization.addOns.includes('PLUCK'))) {
          sessionStorage.setItem('addOnsBeforeStylingSelection', JSON.stringify(updatedCustomization.addOns));
          const addOnsBeforeStyling = updatedCustomization.addOns.filter((x: string) => x !== 'BLEACH' && x !== 'PLUCK');
          const addOnsOrder = ['BLEACH', 'PLUCK', 'BLUNT CUT'];
          const merged = [...addOnsBeforeStyling, 'BLEACH', 'PLUCK'];
          updatedCustomization = { ...updatedCustomization, addOns: merged.sort((a: string, b: string) => addOnsOrder.indexOf(a) - addOnsOrder.indexOf(b)) };
          sessionStorage.setItem('bleachPluckAutoAddedForStyling', 'true');
          localStorage.setItem('customizeSelectedAddOns', JSON.stringify(updatedCustomization.addOns));
          localStorage.setItem('selectedAddOns', JSON.stringify(updatedCustomization.addOns));
          const discountedLaceSizes = ['2X6', '4X4', '5X5', '6X6', '7X7'];
          const hasLaceDiscount = discountedLaceSizes.includes(updatedCustomization.lace || '');
          const addOnPrices: Record<string, number> = { BLEACH: 60, PLUCK: 80, 'BLUNT CUT': 20 };
          const addOnsPriceValue = updatedCustomization.addOns.reduce((sum: number, id: string) => {
            let p = addOnPrices[id] ?? 0;
            if (hasLaceDiscount && (id === 'BLEACH' || id === 'PLUCK')) p -= 20;
            return sum + p;
          }, 0);
          localStorage.setItem('customizeSelectedAddOnsPrice', addOnsPriceValue.toString());
          localStorage.setItem('selectedAddOnsPrice', addOnsPriceValue.toString());
        }
        
        // CRITICAL: Also save to customizeSelected* keys immediately to ensure they're available
        localStorage.setItem('customizeSelectedCapSize', updatedCustomization.capSize);
        localStorage.setItem('customizeSelectedLength', updatedCustomization.length);
        localStorage.setItem('customizeSelectedDensity', updatedCustomization.density);
        localStorage.setItem('customizeSelectedLace', updatedCustomization.lace);
        localStorage.setItem('customizeSelectedTexture', updatedCustomization.texture);
        localStorage.setItem('customizeSelectedColor', updatedCustomization.color);
        localStorage.setItem('customizeSelectedHairline', updatedCustomization.hairline);
        localStorage.setItem('customizeSelectedStyling', validStyling);
        localStorage.setItem('customizeSelectedAddOns', JSON.stringify(updatedCustomization.addOns));
        
        setCustomization(updatedCustomization);
        
        // CRITICAL: Read prices from localStorage (saved by sub-pages) to preserve exact prices
        // Prioritize customizeSelected* prices, fall back to selected* prices
        const savedCapSizePrice = localStorage.getItem('customizeSelectedCapSizePrice') || localStorage.getItem('selectedCapSizePrice') || '0';
        const savedColorPrice = localStorage.getItem('customizeSelectedColorPrice') || localStorage.getItem('selectedColorPrice') || '0';
        const savedLengthPrice = localStorage.getItem('customizeSelectedLengthPrice') || localStorage.getItem('selectedLengthPrice') || '0';
        const savedDensityPrice = localStorage.getItem('customizeSelectedDensityPrice') || localStorage.getItem('selectedDensityPrice') || '0';
        const savedLacePrice = localStorage.getItem('customizeSelectedLacePrice') || localStorage.getItem('selectedLacePrice') || '0';
        const savedTexturePrice = localStorage.getItem('customizeSelectedTexturePrice') || localStorage.getItem('selectedTexturePrice') || '0';
        const savedHairlinePrice = localStorage.getItem('customizeSelectedHairlinePrice') || localStorage.getItem('selectedHairlinePrice') || '0';
        const savedStylingPrice = localStorage.getItem('customizeSelectedStylingPrice') || localStorage.getItem('selectedStylingPrice') || '0';
        const savedAddOnsPrice = localStorage.getItem('customizeSelectedAddOnsPrice') || localStorage.getItem('selectedAddOnsPrice') || '0';
        
        // Save prices to localStorage with correct prefixes
        localStorage.setItem('selectedCapSizePrice', savedCapSizePrice);
        localStorage.setItem('selectedColorPrice', savedColorPrice);
        localStorage.setItem('selectedLengthPrice', savedLengthPrice);
        localStorage.setItem('selectedDensityPrice', savedDensityPrice);
        localStorage.setItem('selectedLacePrice', savedLacePrice);
        localStorage.setItem('selectedTexturePrice', savedTexturePrice);
        localStorage.setItem('selectedHairlinePrice', savedHairlinePrice);
        localStorage.setItem('selectedStylingPrice', savedStylingPrice);
        localStorage.setItem('selectedAddOnsPrice', savedAddOnsPrice);
        
        localStorage.setItem('customizeSelectedCapSizePrice', savedCapSizePrice);
        localStorage.setItem('customizeSelectedColorPrice', savedColorPrice);
        localStorage.setItem('customizeSelectedLengthPrice', savedLengthPrice);
        localStorage.setItem('customizeSelectedDensityPrice', savedDensityPrice);
        localStorage.setItem('customizeSelectedLacePrice', savedLacePrice);
        localStorage.setItem('customizeSelectedTexturePrice', savedTexturePrice);
        localStorage.setItem('customizeSelectedHairlinePrice', savedHairlinePrice);
        localStorage.setItem('customizeSelectedStylingPrice', savedStylingPrice);
        localStorage.setItem('customizeSelectedAddOnsPrice', savedAddOnsPrice);
        
        // Recalculate prices as fallback if any prices are missing, but prioritize saved prices
        const calculatedPrices = calculatePricesFromSelections(updatedCustomization);
        // CRITICAL: Preserve cap size price from localStorage if it exists (may have been set from cart item or sub-pages)
        // Only recalculate if localStorage doesn't have a value
        const savedCapSizePriceForCustomize = localStorage.getItem('customizeSelectedCapSizePrice') || localStorage.getItem('selectedCapSizePrice');
        const capSizePriceToUseForCustomize = (savedCapSizePriceForCustomize && savedCapSizePriceForCustomize !== '' && !isNaN(parseFloat(savedCapSizePriceForCustomize))) 
          ? parseFloat(savedCapSizePriceForCustomize) 
          : calculatedPrices.capSizePrice;
        // For other prices, use saved prices if they exist, otherwise use calculated prices
        // CRITICAL: Blanco default density is 250% (included in base = $0). Never use stored $80 from Noir.
        const densityPriceForCustomize = (isBlancoCustomizeRoute && updatedCustomization.density === '250%')
          ? calculatedPrices.densityPrice
          : ((savedDensityPrice && savedDensityPrice !== '' && !isNaN(parseFloat(savedDensityPrice))) ? parseFloat(savedDensityPrice) : calculatedPrices.densityPrice);
        const pricesToSave = {
          capSizePrice: capSizePriceToUseForCustomize, // Preserve from localStorage if exists, otherwise use calculated
          colorPrice: (savedColorPrice && savedColorPrice !== '' && !isNaN(parseFloat(savedColorPrice))) ? parseFloat(savedColorPrice) : calculatedPrices.colorPrice,
          lengthPrice: (savedLengthPrice && savedLengthPrice !== '' && !isNaN(parseFloat(savedLengthPrice))) ? parseFloat(savedLengthPrice) : calculatedPrices.lengthPrice,
          densityPrice: densityPriceForCustomize,
          lacePrice: (savedLacePrice && savedLacePrice !== '' && !isNaN(parseFloat(savedLacePrice))) ? parseFloat(savedLacePrice) : calculatedPrices.lacePrice,
          texturePrice: (savedTexturePrice && savedTexturePrice !== '' && !isNaN(parseFloat(savedTexturePrice))) ? parseFloat(savedTexturePrice) : calculatedPrices.texturePrice,
          hairlinePrice: (savedHairlinePrice && savedHairlinePrice !== '' && !isNaN(parseFloat(savedHairlinePrice))) ? parseFloat(savedHairlinePrice) : calculatedPrices.hairlinePrice,
          stylingPrice: (savedStylingPrice && savedStylingPrice !== '' && !isNaN(parseFloat(savedStylingPrice))) ? parseFloat(savedStylingPrice) : calculatedPrices.stylingPrice,
          addOnsPrice: (savedAddOnsPrice && savedAddOnsPrice !== '' && !isNaN(parseFloat(savedAddOnsPrice))) ? parseFloat(savedAddOnsPrice) : calculatedPrices.addOnsPrice,
        };
        savePricesToLocalStorage(pricesToSave);
        
        // Clear the flag
        sessionStorage.removeItem('comingFromSubPage');
        
        // Trigger price recalculation
        setRefreshTrigger(prev => prev + 1);
        
        // Clear loading flag after state update completes
        // Use a longer delay to ensure React state updates have propagated and sync effect won't overwrite
        setTimeout(() => {
          isLoadingFromStorage.current = false;
        }, 300);
      } else {
        // First load: Load cap size with defaults for other selections
        // When NOT coming from sub-page (first load), prioritize selectedCapSize (set by customize button)
        const savedCapSize = localStorage.getItem('selectedCapSize') || localStorage.getItem('customizeSelectedCapSize');
        
        if (savedCapSize) {
          // Load existing selections from customizeSelected* keys if they exist, otherwise use defaults
          const isBlancoCustomizeRouteForDefaults = location.pathname.startsWith('/build-a-wig/blanco');
          const isOceanCurlCustomizeRouteForDefaults = location.pathname.startsWith('/build-a-wig/ocean-curl');
          const isBeachWaveCustomizeRouteForDefaults = location.pathname.startsWith('/build-a-wig/beach-wave');
          const isSoftCurlCustomizeRouteForDefaults = location.pathname.startsWith('/build-a-wig/soft-curl');
          const isSoftWaveCustomizeRouteForDefaults = location.pathname.startsWith('/build-a-wig/soft-wave');
          const defaultColorForFirstLoad = isBlancoCustomizeRouteForDefaults ? 'PLATINUM' : 'OFF BLACK';
          
          // Determine product-specific default texture
          let defaultTextureForFirstLoad = 'SILKY';
          if (isOceanCurlCustomizeRouteForDefaults || isSoftCurlCustomizeRouteForDefaults) {
            defaultTextureForFirstLoad = 'CURLY';
          } else if (isBeachWaveCustomizeRouteForDefaults || isSoftWaveCustomizeRouteForDefaults) {
            defaultTextureForFirstLoad = 'WAVY';
          }
          
          const existingLength = localStorage.getItem('customizeSelectedLength') || localStorage.getItem('selectedLength') || '24"';
          const existingDensity = localStorage.getItem('customizeSelectedDensity') || localStorage.getItem('selectedDensity') || '200%';
          const existingLace = localStorage.getItem('customizeSelectedLace') || localStorage.getItem('selectedLace') || '13X6';
          const existingTexture = localStorage.getItem('customizeSelectedTexture') || localStorage.getItem('selectedTexture') || defaultTextureForFirstLoad;
          const existingColor = localStorage.getItem('customizeSelectedColor') || localStorage.getItem('selectedColor') || defaultColorForFirstLoad;
          const existingHairline = localStorage.getItem('customizeSelectedHairline') || localStorage.getItem('selectedHairline') || 'NATURAL';
          const existingStyling = localStorage.getItem('customizeSelectedStyling') || localStorage.getItem('selectedStyling') || 'NONE';
          const existingAddOns = localStorage.getItem('customizeSelectedAddOns') || localStorage.getItem('selectedAddOns') || '[]';
          
          // Ensure styling is valid
          let validStyling = existingStyling !== null && existingStyling !== 'NONE' ? existingStyling : 'NONE';
          const partSelectionOptions = ['MIDDLE', 'LEFT', 'RIGHT'];
          if (partSelectionOptions.includes(validStyling)) {
            validStyling = 'NONE';
          }
          
          let initialCustomization = {
            capSize: savedCapSize,
          length: existingLength,
          density: existingDensity,
          lace: existingLace,
          texture: existingTexture,
          color: existingColor,
          hairline: existingHairline,
          styling: validStyling,
          addOns: existingAddOns ? JSON.parse(existingAddOns) : [],
        };

          // When a style is confirmed on first load, BLEACH + PLUCK are required — auto-add so main page shows confirmed without visiting add-ons
          if (validStyling !== 'NONE' && validStyling.trim() !== '' && (!initialCustomization.addOns.includes('BLEACH') || !initialCustomization.addOns.includes('PLUCK'))) {
            sessionStorage.setItem('addOnsBeforeStylingSelection', JSON.stringify(initialCustomization.addOns));
            const addOnsBeforeFirstLoad = initialCustomization.addOns.filter((x: string) => x !== 'BLEACH' && x !== 'PLUCK');
            const addOnsOrder = ['BLEACH', 'PLUCK', 'BLUNT CUT'];
            const merged = [...addOnsBeforeFirstLoad, 'BLEACH', 'PLUCK'];
            initialCustomization = { ...initialCustomization, addOns: merged.sort((a: string, b: string) => addOnsOrder.indexOf(a) - addOnsOrder.indexOf(b)) };
            sessionStorage.setItem('bleachPluckAutoAddedForStyling', 'true');
          }
        
        
        setCustomization(initialCustomization);
        
        // Save to both selected* and customizeSelected* keys
        localStorage.setItem('selectedCapSize', savedCapSize);
        localStorage.setItem('selectedLength', initialCustomization.length);
        localStorage.setItem('selectedDensity', initialCustomization.density);
        localStorage.setItem('selectedLace', initialCustomization.lace);
        localStorage.setItem('selectedTexture', initialCustomization.texture);
        localStorage.setItem('selectedColor', initialCustomization.color);
        localStorage.setItem('selectedHairline', initialCustomization.hairline);
        localStorage.setItem('selectedStyling', validStyling);
        localStorage.setItem('selectedAddOns', JSON.stringify(initialCustomization.addOns));
        
        localStorage.setItem('customizeSelectedCapSize', savedCapSize);
        localStorage.setItem('customizeSelectedLength', initialCustomization.length);
        localStorage.setItem('customizeSelectedDensity', initialCustomization.density);
        localStorage.setItem('customizeSelectedLace', initialCustomization.lace);
        localStorage.setItem('customizeSelectedTexture', initialCustomization.texture);
        localStorage.setItem('customizeSelectedColor', initialCustomization.color);
        localStorage.setItem('customizeSelectedHairline', initialCustomization.hairline);
        localStorage.setItem('customizeSelectedStyling', validStyling);
        localStorage.setItem('customizeSelectedAddOns', JSON.stringify(initialCustomization.addOns));
        
        // CRITICAL: Load existing prices from localStorage BEFORE calculating new ones
        // This preserves prices saved by sub-pages
        // NOTE: capSizePrice is ALWAYS recalculated based on current selection (flexible caps = $40, regular = $0)
        const existingColorPrice = localStorage.getItem('customizeSelectedColorPrice') || localStorage.getItem('selectedColorPrice');
        const existingLengthPrice = localStorage.getItem('customizeSelectedLengthPrice') || localStorage.getItem('selectedLengthPrice');
        const existingDensityPrice = localStorage.getItem('customizeSelectedDensityPrice') || localStorage.getItem('selectedDensityPrice');
        const existingLacePrice = localStorage.getItem('customizeSelectedLacePrice') || localStorage.getItem('selectedLacePrice');
        const existingTexturePrice = localStorage.getItem('customizeSelectedTexturePrice') || localStorage.getItem('selectedTexturePrice');
        const existingHairlinePrice = localStorage.getItem('customizeSelectedHairlinePrice') || localStorage.getItem('selectedHairlinePrice');
        const existingStylingPrice = localStorage.getItem('customizeSelectedStylingPrice') || localStorage.getItem('selectedStylingPrice');
        const existingAddOnsPrice = localStorage.getItem('customizeSelectedAddOnsPrice') || localStorage.getItem('selectedAddOnsPrice');
        
        // Calculate prices - capSizePrice should be preserved from localStorage if it exists
        const calculatedPrices = calculatePricesFromSelections(initialCustomization);
        
        // Use existing prices if they exist, otherwise use calculated prices
        // CRITICAL: Preserve cap size price from localStorage if it exists (may have been set from cart item or sub-pages)
        const existingCapSizePrice = localStorage.getItem('customizeSelectedCapSizePrice') || localStorage.getItem('selectedCapSizePrice');
        const capSizePriceToUse = (existingCapSizePrice && existingCapSizePrice !== '' && !isNaN(parseFloat(existingCapSizePrice))) 
          ? parseFloat(existingCapSizePrice) 
          : calculatedPrices.capSizePrice;
        // Blanco default density is 250% (included in base = $0). Never use stored $80 from Noir.
        const isBlancoCustomizeFirstLoad = location.pathname.startsWith('/build-a-wig/blanco');
        const densityPriceToUse = (isBlancoCustomizeFirstLoad && initialCustomization.density === '250%')
          ? calculatedPrices.densityPrice
          : ((existingDensityPrice && existingDensityPrice !== '' && !isNaN(parseFloat(existingDensityPrice))) ? parseFloat(existingDensityPrice) : calculatedPrices.densityPrice);
        const pricesToSave = {
          capSizePrice: capSizePriceToUse, // Preserve from localStorage if exists, otherwise use calculated
          colorPrice: (existingColorPrice && existingColorPrice !== '' && !isNaN(parseFloat(existingColorPrice))) ? parseFloat(existingColorPrice) : calculatedPrices.colorPrice,
          lengthPrice: (existingLengthPrice && existingLengthPrice !== '' && !isNaN(parseFloat(existingLengthPrice))) ? parseFloat(existingLengthPrice) : calculatedPrices.lengthPrice,
          densityPrice: densityPriceToUse,
          lacePrice: (existingLacePrice && existingLacePrice !== '' && !isNaN(parseFloat(existingLacePrice))) ? parseFloat(existingLacePrice) : calculatedPrices.lacePrice,
          texturePrice: (existingTexturePrice && existingTexturePrice !== '' && !isNaN(parseFloat(existingTexturePrice))) ? parseFloat(existingTexturePrice) : calculatedPrices.texturePrice,
          hairlinePrice: (existingHairlinePrice && existingHairlinePrice !== '' && !isNaN(parseFloat(existingHairlinePrice))) ? parseFloat(existingHairlinePrice) : calculatedPrices.hairlinePrice,
          stylingPrice: (existingStylingPrice && existingStylingPrice !== '' && !isNaN(parseFloat(existingStylingPrice))) ? parseFloat(existingStylingPrice) : calculatedPrices.stylingPrice,
          addOnsPrice: (existingAddOnsPrice && existingAddOnsPrice !== '' && !isNaN(parseFloat(existingAddOnsPrice))) ? parseFloat(existingAddOnsPrice) : calculatedPrices.addOnsPrice,
        };
        
        savePricesToLocalStorage(pricesToSave);
        
        // Trigger price recalculation
        setRefreshTrigger(prev => prev + 1);
        }
      }
      
      // Clear flag after a short delay to allow state update to complete
      setTimeout(() => {
        isLoadingFromStorage.current = false;
      }, 100);
    } else if (isEditPage) {
      // Load from editingCartItem for edit mode
      const editingCartItem = localStorage.getItem('editingCartItem');
      const editingCartItemId = localStorage.getItem('editingCartItemId');
      const comingFromSubPage = sessionStorage.getItem('comingFromSubPage') === 'true';
      
      // Check if this is a different item - if so, we need to reload
      const isDifferentItem = editingCartItemId && editingCartItemId !== currentEditingItemIdRef.current;
      
      // If coming from sub-page, load updated values from localStorage
      // CRITICAL: Match customize mode logic - just check comingFromSubPage flag, no other conditions
      if (comingFromSubPage) {
        console.log('[EDIT MODE ROUTE CHANGE] Coming from sub-page, loading from localStorage');
        
        // Set flag to prevent sync effect from overwriting (match customize mode - set AFTER checking comingFromSubPage)
        isLoadingFromStorage.current = true;
        
        // Load updated values from localStorage (set by sub-pages)
        // Prioritize editSelected* keys, fall back to selected* keys
        const savedCapSizeEdit = localStorage.getItem('editSelectedCapSize');
        const savedLengthEdit = localStorage.getItem('editSelectedLength');
        const savedDensityEdit = localStorage.getItem('editSelectedDensity');
        const savedLaceEdit = localStorage.getItem('editSelectedLace');
        const savedTextureEdit = localStorage.getItem('editSelectedTexture');
        const savedColorEdit = localStorage.getItem('editSelectedColor');
        const savedHairlineEdit = localStorage.getItem('editSelectedHairline');
        const savedStylingEdit = localStorage.getItem('editSelectedStyling');
        const savedAddOnsEdit = localStorage.getItem('editSelectedAddOns');
        
        console.log('[EDIT MODE ROUTE CHANGE] Loaded from localStorage:', {
          capSize: savedCapSizeEdit,
          length: savedLengthEdit,
          density: savedDensityEdit,
          lace: savedLaceEdit,
          texture: savedTextureEdit,
          color: savedColorEdit,
          hairline: savedHairlineEdit,
          styling: savedStylingEdit,
          addOns: savedAddOnsEdit
        });
        
        // Also check selected* keys as fallback
        const savedCapSizeSelected = localStorage.getItem('selectedCapSize');
        const savedLengthSelected = localStorage.getItem('selectedLength');
        const savedDensitySelected = localStorage.getItem('selectedDensity');
        const savedLaceSelected = localStorage.getItem('selectedLace');
        const savedTextureSelected = localStorage.getItem('selectedTexture');
        const savedColorSelected = localStorage.getItem('selectedColor');
        const savedHairlineSelected = localStorage.getItem('selectedHairline');
        const savedStylingSelected = localStorage.getItem('selectedStyling');
        const savedAddOnsSelected = localStorage.getItem('selectedAddOns');
        
        // Fall back to selected* keys if editSelected* keys don't exist
        // CRITICAL: Match customize mode - prioritize editSelected* keys, then selected* keys, then defaults (NOT current state)
        // This ensures we always use the saved values from sub-pages, not stale state
        const savedCapSizeFinal = savedCapSizeEdit || savedCapSizeSelected || 'M';
        const savedLength = savedLengthEdit || savedLengthSelected || '24"';
        const savedDensity = savedDensityEdit || savedDensitySelected || '200%';
        const savedLace = savedLaceEdit || savedLaceSelected || '13X6';
        const savedTexture = savedTextureEdit || savedTextureSelected || 'SILKY';
        // For BLANCO routes, default to PLATINUM; for others, default to OFF BLACK
        const isBlancoRouteForSaved = location.pathname.startsWith('/build-a-wig/blanco');
        const defaultColorForSaved = isBlancoRouteForSaved ? 'PLATINUM' : 'OFF BLACK';
        // CRITICAL: Validate color for BLANCO routes - if invalid, default to PLATINUM
        let savedColor = savedColorEdit || savedColorSelected || defaultColorForSaved;
        if (isBlancoRouteForSaved) {
          const validBlancoColors = ['GOLDEN', 'PLATINUM', 'ASH'];
          if (!validBlancoColors.includes(savedColor)) {
            savedColor = 'PLATINUM'; // Invalid color for BLANCO, default to PLATINUM
          }
        }
        const savedHairline = savedHairlineEdit || savedHairlineSelected || 'NATURAL';
        const savedStyling = savedStylingEdit || savedStylingSelected || 'NONE';
        const savedAddOns = savedAddOnsEdit || savedAddOnsSelected || '[]';
        
        // CRITICAL: Ensure styling is not a part selection (MIDDLE, LEFT, RIGHT) - it should be NONE or a valid styling option
        let validStyling = savedStyling !== null && savedStyling !== 'NONE' ? savedStyling : 'NONE';
        const partSelectionOptions = ['MIDDLE', 'LEFT', 'RIGHT'];
        if (partSelectionOptions.includes(validStyling)) {
          validStyling = 'NONE'; // If styling is a part selection, set to NONE
        }
        
        let updatedCustomization = {
          capSize: savedCapSizeFinal,
          length: savedLength,
          density: savedDensity,
          lace: savedLace,
          texture: savedTexture,
          color: savedColor,
          hairline: savedHairline,
          styling: validStyling,
          addOns: savedAddOns ? JSON.parse(savedAddOns) : [],
        };
        
        // When style is removed (NONE): restore add-ons to what they were before styling auto-added BLEACH+PLUCK
        if ((validStyling === 'NONE' || !validStyling.trim()) && sessionStorage.getItem('bleachPluckAutoAddedForStyling') === 'true' && (updatedCustomization.addOns.includes('BLEACH') || updatedCustomization.addOns.includes('PLUCK'))) {
          const savedBeforeStylingE = sessionStorage.getItem('addOnsBeforeStylingSelection');
          const restoredAddOnsE = savedBeforeStylingE ? (JSON.parse(savedBeforeStylingE) as string[]) : updatedCustomization.addOns.filter((x: string) => x !== 'BLEACH' && x !== 'PLUCK');
          updatedCustomization = { ...updatedCustomization, addOns: restoredAddOnsE };
          const discountedLaceSizesRmE = ['2X6', '4X4', '5X5', '6X6', '7X7'];
          const hasLaceDiscountRmE = discountedLaceSizesRmE.includes(updatedCustomization.lace || '');
          const addOnPricesRmE: Record<string, number> = { BLEACH: 60, PLUCK: 80, 'BLUNT CUT': 20 };
          const addOnsPriceAfterRmE = updatedCustomization.addOns.reduce((sum: number, id: string) => {
            let p = addOnPricesRmE[id] ?? 0;
            if (hasLaceDiscountRmE && (id === 'BLEACH' || id === 'PLUCK')) p -= 20;
            return sum + p;
          }, 0);
          localStorage.setItem('editSelectedAddOns', JSON.stringify(updatedCustomization.addOns));
          localStorage.setItem('selectedAddOns', JSON.stringify(updatedCustomization.addOns));
          localStorage.setItem('editSelectedAddOnsPrice', addOnsPriceAfterRmE.toString());
          localStorage.setItem('selectedAddOnsPrice', addOnsPriceAfterRmE.toString());
          sessionStorage.removeItem('bleachPluckAutoAddedForStyling');
          sessionStorage.removeItem('addOnsBeforeStylingSelection');
        }
        
        // When a style is confirmed, BLEACH + PLUCK are required — auto-add and save price so main page shows correct total
        if (validStyling !== 'NONE' && validStyling.trim() !== '' && (!updatedCustomization.addOns.includes('BLEACH') || !updatedCustomization.addOns.includes('PLUCK'))) {
          sessionStorage.setItem('addOnsBeforeStylingSelection', JSON.stringify(updatedCustomization.addOns));
          const addOnsBeforeStylingE = updatedCustomization.addOns.filter((x: string) => x !== 'BLEACH' && x !== 'PLUCK');
          const addOnsOrderEdit = ['BLEACH', 'PLUCK', 'BLUNT CUT'];
          const mergedEdit = [...addOnsBeforeStylingE, 'BLEACH', 'PLUCK'];
          updatedCustomization = { ...updatedCustomization, addOns: mergedEdit.sort((a: string, b: string) => addOnsOrderEdit.indexOf(a) - addOnsOrderEdit.indexOf(b)) };
          sessionStorage.setItem('bleachPluckAutoAddedForStyling', 'true');
          localStorage.setItem('editSelectedAddOns', JSON.stringify(updatedCustomization.addOns));
          localStorage.setItem('selectedAddOns', JSON.stringify(updatedCustomization.addOns));
          const discountedLaceSizesEdit = ['2X6', '4X4', '5X5', '6X6', '7X7'];
          const hasLaceDiscountEdit = discountedLaceSizesEdit.includes(updatedCustomization.lace || '');
          const addOnPricesEdit: Record<string, number> = { BLEACH: 60, PLUCK: 80, 'BLUNT CUT': 20 };
          const addOnsPriceValueEdit = updatedCustomization.addOns.reduce((sum: number, id: string) => {
            let p = addOnPricesEdit[id] ?? 0;
            if (hasLaceDiscountEdit && (id === 'BLEACH' || id === 'PLUCK')) p -= 20;
            return sum + p;
          }, 0);
          localStorage.setItem('editSelectedAddOnsPrice', addOnsPriceValueEdit.toString());
          localStorage.setItem('selectedAddOnsPrice', addOnsPriceValueEdit.toString());
        }
          
        
        // CRITICAL: Read prices from localStorage (saved by sub-pages) to preserve exact prices BEFORE updating state
        // Prioritize editSelected* prices, fall back to selected* prices
        const savedColorPrice = localStorage.getItem('editSelectedColorPrice') || localStorage.getItem('selectedColorPrice');
        const savedLengthPrice = localStorage.getItem('editSelectedLengthPrice') || localStorage.getItem('selectedLengthPrice');
        const savedDensityPrice = localStorage.getItem('editSelectedDensityPrice') || localStorage.getItem('selectedDensityPrice');
        const savedLacePrice = localStorage.getItem('editSelectedLacePrice') || localStorage.getItem('selectedLacePrice');
        const savedTexturePrice = localStorage.getItem('editSelectedTexturePrice') || localStorage.getItem('selectedTexturePrice');
        const savedHairlinePrice = localStorage.getItem('editSelectedHairlinePrice') || localStorage.getItem('selectedHairlinePrice');
        const savedStylingPrice = localStorage.getItem('editSelectedStylingPrice') || localStorage.getItem('selectedStylingPrice');
        const savedAddOnsPrice = localStorage.getItem('editSelectedAddOnsPrice') || localStorage.getItem('selectedAddOnsPrice');
        
        // Recalculate prices as fallback if any prices are missing, but prioritize saved prices
        const calculatedPrices = calculatePricesFromSelections(updatedCustomization);
        // CRITICAL: Preserve cap size price from localStorage if it exists (may have been set from cart item or sub-pages)
        // Only recalculate if localStorage doesn't have a value
        const savedCapSizePrice = localStorage.getItem('editSelectedCapSizePrice') || localStorage.getItem('selectedCapSizePrice');
        const capSizePriceToUse = (savedCapSizePrice && savedCapSizePrice !== '' && !isNaN(parseFloat(savedCapSizePrice))) 
          ? parseFloat(savedCapSizePrice) 
          : calculatedPrices.capSizePrice;
        // CRITICAL: Blanco default density is 250% (included in base = $0). Never use stored $80 from Noir.
        const isBlancoEditRoute = location.pathname.startsWith('/build-a-wig/blanco');
        const densityPriceForEdit = (isBlancoEditRoute && updatedCustomization.density === '250%')
          ? calculatedPrices.densityPrice
          : ((savedDensityPrice && savedDensityPrice !== '' && !isNaN(parseFloat(savedDensityPrice))) ? parseFloat(savedDensityPrice) : calculatedPrices.densityPrice);
        // For other prices, use saved prices if they exist, otherwise use calculated prices
        const pricesToSave = {
          capSizePrice: capSizePriceToUse, // Preserve from localStorage if exists, otherwise use calculated
          colorPrice: (savedColorPrice && savedColorPrice !== '' && !isNaN(parseFloat(savedColorPrice))) ? parseFloat(savedColorPrice) : calculatedPrices.colorPrice,
          lengthPrice: (savedLengthPrice && savedLengthPrice !== '' && !isNaN(parseFloat(savedLengthPrice))) ? parseFloat(savedLengthPrice) : calculatedPrices.lengthPrice,
          densityPrice: densityPriceForEdit,
          lacePrice: (savedLacePrice && savedLacePrice !== '' && !isNaN(parseFloat(savedLacePrice))) ? parseFloat(savedLacePrice) : calculatedPrices.lacePrice,
          texturePrice: (savedTexturePrice && savedTexturePrice !== '' && !isNaN(parseFloat(savedTexturePrice))) ? parseFloat(savedTexturePrice) : calculatedPrices.texturePrice,
          hairlinePrice: (savedHairlinePrice && savedHairlinePrice !== '' && !isNaN(parseFloat(savedHairlinePrice))) ? parseFloat(savedHairlinePrice) : calculatedPrices.hairlinePrice,
          stylingPrice: (savedStylingPrice && savedStylingPrice !== '' && !isNaN(parseFloat(savedStylingPrice))) ? parseFloat(savedStylingPrice) : calculatedPrices.stylingPrice,
          addOnsPrice: (savedAddOnsPrice && savedAddOnsPrice !== '' && !isNaN(parseFloat(savedAddOnsPrice))) ? parseFloat(savedAddOnsPrice) : calculatedPrices.addOnsPrice,
        };
        
        // CRITICAL: Explicitly save prices to localStorage BEFORE updating state (like main/customize mode)
        // This ensures prices are available for calculatePrice to read when it runs after state update
        localStorage.setItem('selectedCapSizePrice', pricesToSave.capSizePrice.toString());
        localStorage.setItem('selectedColorPrice', pricesToSave.colorPrice.toString());
        localStorage.setItem('selectedLengthPrice', pricesToSave.lengthPrice.toString());
        localStorage.setItem('selectedDensityPrice', pricesToSave.densityPrice.toString());
        localStorage.setItem('selectedLacePrice', pricesToSave.lacePrice.toString());
        localStorage.setItem('selectedTexturePrice', pricesToSave.texturePrice.toString());
        localStorage.setItem('selectedHairlinePrice', pricesToSave.hairlinePrice.toString());
        localStorage.setItem('selectedStylingPrice', pricesToSave.stylingPrice.toString());
        localStorage.setItem('selectedAddOnsPrice', pricesToSave.addOnsPrice.toString());
        
        localStorage.setItem('editSelectedCapSizePrice', pricesToSave.capSizePrice.toString());
        localStorage.setItem('editSelectedColorPrice', pricesToSave.colorPrice.toString());
        localStorage.setItem('editSelectedLengthPrice', pricesToSave.lengthPrice.toString());
        localStorage.setItem('editSelectedDensityPrice', pricesToSave.densityPrice.toString());
        localStorage.setItem('editSelectedLacePrice', pricesToSave.lacePrice.toString());
        localStorage.setItem('editSelectedTexturePrice', pricesToSave.texturePrice.toString());
        localStorage.setItem('editSelectedHairlinePrice', pricesToSave.hairlinePrice.toString());
        localStorage.setItem('editSelectedStylingPrice', pricesToSave.stylingPrice.toString());
        localStorage.setItem('editSelectedAddOnsPrice', pricesToSave.addOnsPrice.toString());
        
        // Also call savePricesToLocalStorage for consistency
        savePricesToLocalStorage(pricesToSave);
        
        // CRITICAL: Also save to editSelected* keys immediately to ensure they're available (like customize mode)
        localStorage.setItem('editSelectedCapSize', updatedCustomization.capSize);
        localStorage.setItem('editSelectedLength', updatedCustomization.length);
        localStorage.setItem('editSelectedDensity', updatedCustomization.density);
        localStorage.setItem('editSelectedLace', updatedCustomization.lace);
        localStorage.setItem('editSelectedTexture', updatedCustomization.texture);
        localStorage.setItem('editSelectedColor', updatedCustomization.color);
        localStorage.setItem('editSelectedHairline', updatedCustomization.hairline);
        localStorage.setItem('editSelectedStyling', validStyling);
        localStorage.setItem('editSelectedAddOns', JSON.stringify(updatedCustomization.addOns));
        
        // Also save to selected* keys for sub-pages to read
        localStorage.setItem('selectedCapSize', updatedCustomization.capSize);
        localStorage.setItem('selectedLength', updatedCustomization.length);
        localStorage.setItem('selectedDensity', updatedCustomization.density);
        localStorage.setItem('selectedLace', updatedCustomization.lace);
        localStorage.setItem('selectedTexture', updatedCustomization.texture);
        localStorage.setItem('selectedColor', updatedCustomization.color);
        localStorage.setItem('selectedHairline', updatedCustomization.hairline);
        localStorage.setItem('selectedStyling', validStyling);
        localStorage.setItem('selectedAddOns', JSON.stringify(updatedCustomization.addOns));
        
        // Update customization state (originalItem stays the same for change detection)
        // This will trigger wigViews to update via useMemo dependency AND trigger calculatePrice via useEffect dependency
        console.log('[EDIT MODE ROUTE CHANGE] Updating customization state:', updatedCustomization);
        setCustomization(updatedCustomization);
        
        // CRITICAL: Delay clearing the flag to give other effects time to check it
        // This prevents race conditions where other effects overwrite the sub-page selections
        setTimeout(() => {
          sessionStorage.removeItem('comingFromSubPage');
          console.log('[EDIT MODE ROUTE CHANGE] Cleared comingFromSubPage flag after delay');
        }, 500);
        
        // Trigger price recalculation
        setRefreshTrigger(prev => prev + 1);
        
        // Force change detection to run after state update
        // Compare updatedCustomization with originalItem immediately (originalItem is in closure)
        // The change detection useEffect will also run when customization state updates, but this ensures it happens
        // Note: originalItem and hasChanges are defined later in the component
        // CRITICAL: originalItem should be set from initial load, but if it's not, we need to ensure it's set
        if (!originalItem) {
          // Try to get originalItem from the editingCartItem
          const editingCartItem = localStorage.getItem('editingCartItem');
          if (editingCartItem) {
            try {
              const item = JSON.parse(editingCartItem);
              const partSelectionOptions = ['MIDDLE', 'LEFT', 'RIGHT'];
              let validStyling = item.styling || 'NONE';
              if (partSelectionOptions.includes(validStyling)) {
                validStyling = 'NONE';
              }
              // For BLANCO items, default to PLATINUM; for others, default to OFF BLACK
              const isBlancoRouteForOriginal = location.pathname.startsWith('/build-a-wig/blanco');
              const defaultColorForOriginal = (isBlancoRouteForOriginal || item.name === 'BLANCO') ? 'PLATINUM' : 'OFF BLACK';
              const restoredOriginalItem = {
                capSize: item.capSize || 'M',
                length: item.length || '24"',
                density: item.density || '200%',
                lace: item.lace || '13X6',
                texture: item.texture || 'SILKY',
                color: item.color || defaultColorForOriginal,
                hairline: item.hairline || 'NATURAL',
                styling: validStyling,
                addOns: item.addOns || [],
              };
              setOriginalItem(restoredOriginalItem);
            } catch (e) {
            }
          }
        }
        
        // Now check for changes (originalItem should be set now)
        const currentOriginalItem = originalItem || (() => {
          // Fallback: try to get from state or localStorage
          const editingCartItem = localStorage.getItem('editingCartItem');
          if (editingCartItem) {
            try {
              const item = JSON.parse(editingCartItem);
              const partSelectionOptions = ['MIDDLE', 'LEFT', 'RIGHT'];
              let validStyling = item.styling || 'NONE';
              if (partSelectionOptions.includes(validStyling)) {
                validStyling = 'NONE';
              }
              // For BLANCO items, default to PLATINUM; for others, default to OFF BLACK
              const isBlancoRouteForOriginal2 = location.pathname.startsWith('/build-a-wig/blanco');
              const defaultColorForOriginal2 = (isBlancoRouteForOriginal2 || item.name === 'BLANCO') ? 'PLATINUM' : 'OFF BLACK';
              return {
                capSize: item.capSize || 'M',
                length: item.length || '24"',
                density: item.density || '200%',
                lace: item.lace || '13X6',
                texture: item.texture || 'SILKY',
                color: item.color || defaultColorForOriginal2,
                hairline: item.hairline || 'NATURAL',
                styling: validStyling,
                addOns: item.addOns || [],
              };
            } catch (e) {
              return null;
            }
          }
          return null;
        })();
        
        if (currentOriginalItem) {
          const hasChangesDetected = 
            updatedCustomization.capSize !== currentOriginalItem.capSize ||
            updatedCustomization.length !== currentOriginalItem.length ||
            updatedCustomization.density !== currentOriginalItem.density ||
            updatedCustomization.lace !== currentOriginalItem.lace ||
            updatedCustomization.texture !== currentOriginalItem.texture ||
            updatedCustomization.color !== currentOriginalItem.color ||
            updatedCustomization.hairline !== currentOriginalItem.hairline ||
            updatedCustomization.styling !== currentOriginalItem.styling ||
            JSON.stringify(updatedCustomization.addOns) !== JSON.stringify(currentOriginalItem.addOns);
          
          // Set hasChanges immediately - the useEffect will also run but this ensures it's set
          setHasChanges(hasChangesDetected);
        } else {
          // If we can't compare, assume there are changes if we're returning from sub-page
          setHasChanges(true);
        }
        
        // Clear loading flag after state update completes (like customize mode)
        // Use a longer delay to ensure React state updates have propagated and sync effect won't overwrite
        setTimeout(() => {
          isLoadingFromStorage.current = false;
          
          // CRITICAL: Trigger change detection after loading is complete in edit mode
          // This ensures hasChanges is set correctly after returning from sub-page
          if (isEditPage && originalItem) {
            // Use a small delay to ensure state has updated
            setTimeout(() => {
              // Read current selections from localStorage and compare with originalItem
              const currentCapSize = localStorage.getItem('editSelectedCapSize') || localStorage.getItem('selectedCapSize') || 'M';
              const currentLength = localStorage.getItem('editSelectedLength') || localStorage.getItem('selectedLength') || '24"';
              const currentDensity = localStorage.getItem('editSelectedDensity') || localStorage.getItem('selectedDensity') || '200%';
              // For BLANCO routes, default to PLATINUM; for others, default to OFF BLACK
              const isBlancoRouteForCheck = location.pathname.startsWith('/build-a-wig/blanco');
              const defaultColorForCheck = isBlancoRouteForCheck ? 'PLATINUM' : 'OFF BLACK';
              const currentColor = localStorage.getItem('editSelectedColor') || localStorage.getItem('selectedColor') || defaultColorForCheck;
              const currentTexture = localStorage.getItem('editSelectedTexture') || localStorage.getItem('selectedTexture') || 'SILKY';
              const currentLace = localStorage.getItem('editSelectedLace') || localStorage.getItem('selectedLace') || '13X6';
              const currentHairline = localStorage.getItem('editSelectedHairline') || localStorage.getItem('selectedHairline') || 'NATURAL';
              const currentStyling = localStorage.getItem('editSelectedStyling') || localStorage.getItem('selectedStyling') || 'NONE';
              const currentAddOns = JSON.parse(localStorage.getItem('editSelectedAddOns') || localStorage.getItem('selectedAddOns') || '[]');
              
              const hasChangesDetected = 
                currentCapSize !== originalItem.capSize ||
                currentLength !== originalItem.length ||
                currentDensity !== originalItem.density ||
                currentLace !== originalItem.lace ||
                currentTexture !== originalItem.texture ||
                currentColor !== originalItem.color ||
                currentHairline !== originalItem.hairline ||
                currentStyling !== originalItem.styling ||
                JSON.stringify(currentAddOns) !== JSON.stringify(originalItem.addOns);
              
              console.log('[CHANGE DETECTION AFTER SUB-PAGE]', {
                hasChangesDetected,
                currentTexture,
                originalTexture: originalItem.texture,
                currentStyling,
                originalStyling: originalItem.styling
              });
              
              setHasChanges(hasChangesDetected);
            }, 100);
          }
        }, 300);
      } else if (editingCartItem && (isDifferentItem || !currentEditingItemIdRef.current) && !comingFromSubPage) {
        // CRITICAL: Check if editSelected* keys exist - if they do, don't overwrite them with defaults
        // This prevents overwriting selections made on sub-pages when the effect runs multiple times
        const editSelectedColor = localStorage.getItem('editSelectedColor');
        const editSelectedTexture = localStorage.getItem('editSelectedTexture');
        const hasEditSelectedKeys = localStorage.getItem('editSelectedCapSize') || 
                                    localStorage.getItem('editSelectedLength') || 
                                    editSelectedTexture ||
                                    editSelectedColor;
        
        console.log('[EDIT MODE ROUTE CHANGE] Checking if should preserve editSelected* keys:', {
          comingFromSubPage,
          isDifferentItem,
          hasEditSelectedKeys,
          editSelectedColor,
          editSelectedTexture,
          currentEditingItemIdRef: currentEditingItemIdRef.current,
          editingCartItemId
        });
        
        // CRITICAL: Preserve editSelected* keys if they exist and we're not switching items
        // This prevents overwriting sub-page selections even if currentEditingItemIdRef is null
        // The key insight: if editSelected* keys exist, sub-pages have set them, so preserve them
        if (!isDifferentItem && hasEditSelectedKeys) {
          console.log('[EDIT MODE ROUTE CHANGE] Skipping initial load - editSelected* keys exist, preserving sub-page selections');
          // Still need to set the ref and originalItem if not set yet
          if (!currentEditingItemIdRef.current && editingCartItemId) {
            currentEditingItemIdRef.current = editingCartItemId;
          }
          // Load from editSelected* keys instead of overwriting
          const savedCapSizeEdit = localStorage.getItem('editSelectedCapSize');
          const savedLengthEdit = localStorage.getItem('editSelectedLength');
          const savedDensityEdit = localStorage.getItem('editSelectedDensity');
          const savedLaceEdit = localStorage.getItem('editSelectedLace');
          const savedTextureEdit = localStorage.getItem('editSelectedTexture');
          const savedColorEdit = localStorage.getItem('editSelectedColor');
          const savedHairlineEdit = localStorage.getItem('editSelectedHairline');
          const savedStylingEdit = localStorage.getItem('editSelectedStyling');
          const savedAddOnsEdit = localStorage.getItem('editSelectedAddOns');
          
          // Fall back to selected* keys if editSelected* don't exist
          const savedCapSizeFinal = savedCapSizeEdit || localStorage.getItem('selectedCapSize') || 'M';
          const savedLength = savedLengthEdit || localStorage.getItem('selectedLength') || '24"';
          const savedDensity = savedDensityEdit || localStorage.getItem('selectedDensity') || '200%';
          const savedLace = savedLaceEdit || localStorage.getItem('selectedLace') || '13X6';
          const savedTexture = savedTextureEdit || localStorage.getItem('selectedTexture') || 'SILKY';
          // For BLANCO routes, default to PLATINUM; for others, default to OFF BLACK
          const isBlancoRouteForSaved2 = location.pathname.startsWith('/build-a-wig/blanco');
          const defaultColorForSaved2 = isBlancoRouteForSaved2 ? 'PLATINUM' : 'OFF BLACK';
          const savedColor = savedColorEdit || localStorage.getItem('selectedColor') || defaultColorForSaved2;
          const savedHairline = savedHairlineEdit || localStorage.getItem('selectedHairline') || 'NATURAL';
          const savedStyling = savedStylingEdit || localStorage.getItem('selectedStyling') || 'NONE';
          const savedAddOns = savedAddOnsEdit || localStorage.getItem('selectedAddOns') || '[]';
          
          // CRITICAL: Ensure styling is not a part selection
          let validStyling = savedStyling !== null && savedStyling !== 'NONE' ? savedStyling : 'NONE';
          const partSelectionOptions = ['MIDDLE', 'LEFT', 'RIGHT'];
          if (partSelectionOptions.includes(validStyling)) {
            validStyling = 'NONE';
          }
          
          const preservedCustomization = {
            capSize: savedCapSizeFinal,
            length: savedLength,
            density: savedDensity,
            lace: savedLace,
            texture: savedTexture,
            color: savedColor,
            hairline: savedHairline,
            styling: validStyling,
            addOns: savedAddOns ? JSON.parse(savedAddOns) : [],
          };
          
          // Set originalItem from editingCartItem for change detection
          if (editingCartItem && !originalItem) {
            try {
              const item = JSON.parse(editingCartItem);
              let originalStyling = item.styling || 'NONE';
              if (partSelectionOptions.includes(originalStyling)) {
                originalStyling = 'NONE';
              }
              // For BLANCO items, default to PLATINUM; for others, default to OFF BLACK
              const isBlancoRouteForOriginal3 = location.pathname.startsWith('/build-a-wig/blanco');
              const defaultColorForOriginal3 = (isBlancoRouteForOriginal3 || item.name === 'BLANCO') ? 'PLATINUM' : 'OFF BLACK';
              setOriginalItem({
                capSize: item.capSize || 'M',
                length: item.length || '24"',
                density: item.density || '200%',
                lace: item.lace || '13X6',
                texture: item.texture || 'SILKY',
                color: item.color || defaultColorForOriginal3,
                hairline: item.hairline || 'NATURAL',
                styling: originalStyling,
                addOns: item.addOns || [],
              });
            } catch (e) {
              // Ignore parse errors
            }
          }
          
          setCustomization(preservedCustomization);
          setAddToBagState('added');
          
          // Trigger price recalculation
          setRefreshTrigger(prev => prev + 1);
          
          return; // Exit early to prevent overwriting editSelected* keys
        }
        
        // First load or different item: load from editingCartItem
        try {
          const item = JSON.parse(editingCartItem);
          
          // CRITICAL: Ensure styling is not a part selection (MIDDLE, LEFT, RIGHT) - it should be NONE or a valid styling option
          let validStyling = item.styling || 'NONE';
          const partSelectionOptions = ['MIDDLE', 'LEFT', 'RIGHT'];
          if (partSelectionOptions.includes(validStyling)) {
            validStyling = 'NONE'; // If styling is a part selection, set to NONE
          }
          
          // For BLANCO items, default to PLATINUM; for others, default to OFF BLACK
          const isBlancoRouteForEditCustom = location.pathname.startsWith('/build-a-wig/blanco');
          const defaultColorForEditCustom = (isBlancoRouteForEditCustom || item.name === 'BLANCO') ? 'PLATINUM' : 'OFF BLACK';
          const editCustomization = {
            capSize: item.capSize || 'M',
            length: item.length || '24"',
            density: item.density || '200%',
            lace: item.lace || '13X6',
            texture: item.texture || 'SILKY',
            color: item.color || defaultColorForEditCustom,
            hairline: item.hairline || 'NATURAL',
            styling: validStyling,
            addOns: item.addOns || [],
          };
          
          // Store original item for change detection
          setOriginalItem(editCustomization);
          setHasChanges(false);
          
          // Update current editing item ID
          if (editingCartItemId) {
            currentEditingItemIdRef.current = editingCartItemId;
          }
          
          // Set button to 'added' (IN THE BAG) since item is already in cart
          setAddToBagState('added');
          
          // CRITICAL: Calculate capSizeToUse BEFORE setting customization state
          // This ensures flex cap selections from cart are properly loaded
          const existingCapSize = localStorage.getItem('editSelectedCapSize') || localStorage.getItem('selectedCapSize');
          const cartItemCapSize = item.capSize || 'M';
          const isFlexibleCap = existingCapSize === 'XXS/XS/S' || existingCapSize === 'S/M/L';
          const cartItemIsFlexCap = cartItemCapSize === 'XXS/XS/S' || cartItemCapSize === 'S/M/L';
          let capSizeToUseForState = cartItemCapSize;
          
          // If cart item has flex cap, always use it (it's the source of truth)
          // If localStorage has a flex cap and cart item doesn't, preserve localStorage (user changed it)
          // Otherwise, use cart item's cap size
          if (cartItemIsFlexCap) {
            capSizeToUseForState = cartItemCapSize;
          } else if (existingCapSize && isFlexibleCap) {
            // localStorage has flex cap but cart item doesn't - user changed it, preserve localStorage
            capSizeToUseForState = existingCapSize;
          } else {
            // Default to cart item's cap size
            capSizeToUseForState = cartItemCapSize;
          }
          
          // Update editCustomization with the correct cap size
          const editCustomizationWithCorrectCapSize = {
            ...editCustomization,
            capSize: capSizeToUseForState
          };
          
          setCustomization(editCustomizationWithCorrectCapSize);
          
          // Also update localStorage so sub-pages can read the edit values
          // Use capSizeToUseForState which was calculated above to ensure flex cap is properly loaded
          localStorage.setItem('selectedCapSize', capSizeToUseForState);
          localStorage.setItem('editSelectedCapSize', capSizeToUseForState);
          localStorage.setItem('selectedLength', item.length || '24"');
          localStorage.setItem('selectedDensity', item.density || '200%');
          // For BLANCO items, default to PLATINUM; for others, default to OFF BLACK
          const isBlancoRouteForSave = location.pathname.startsWith('/build-a-wig/blanco');
          const defaultColorForSave = (isBlancoRouteForSave || item.name === 'BLANCO') ? 'PLATINUM' : 'OFF BLACK';
          // CRITICAL: Validate color for BLANCO - if invalid, use PLATINUM
          let colorToSave = item.color || defaultColorForSave;
          if (isBlancoRouteForSave || item.name === 'BLANCO') {
            const validBlancoColors = ['GOLDEN', 'PLATINUM', 'ASH'];
            if (!validBlancoColors.includes(colorToSave)) {
              colorToSave = 'PLATINUM'; // Invalid color for BLANCO, default to PLATINUM
            }
          }
          localStorage.setItem('selectedColor', colorToSave);
          localStorage.setItem('selectedTexture', item.texture || 'SILKY');
          localStorage.setItem('selectedLace', item.lace || '13X6');
          localStorage.setItem('selectedHairline', item.hairline || 'NATURAL');
          localStorage.setItem('selectedStyling', validStyling);
          localStorage.setItem('selectedAddOns', JSON.stringify(item.addOns || []));
          
          // Also save with 'editSelected' prefix for CartDropdown
          console.log('[FLEX_CAP_DEBUG] ROUTE_CHANGE - Initial load cap size:', {
            capSizeToUseForState,
            cartItemCapSize,
            cartItemIsFlexCap,
            existingCapSize,
            isFlexibleCap,
            reason: cartItemIsFlexCap ? 'from_cart_item_flex_cap' : 
                   (existingCapSize && isFlexibleCap) ? 'preserved_from_localStorage' : 'from_cart_item',
            timestamp: new Date().toISOString()
          });
          
          localStorage.setItem('editSelectedLength', item.length || '24"');
          console.log('[FLEX_CAP_DEBUG] ROUTE_CHANGE - Saved cap size to localStorage:', {
            editSelectedCapSize: localStorage.getItem('editSelectedCapSize'),
            selectedCapSize: localStorage.getItem('selectedCapSize'),
            timestamp: new Date().toISOString()
          });
          localStorage.setItem('editSelectedLength', item.length || '24"');
          localStorage.setItem('selectedLength', item.length || '24"');
          localStorage.setItem('editSelectedDensity', item.density || '200%');
          localStorage.setItem('selectedDensity', item.density || '200%');
          // For BLANCO items, default to PLATINUM; for others, default to OFF BLACK
          const isBlancoRouteForEdit = location.pathname.startsWith('/build-a-wig/blanco');
          const defaultColorForEdit = (isBlancoRouteForEdit || item.name === 'BLANCO') ? 'PLATINUM' : 'OFF BLACK';
          // CRITICAL: Validate color for BLANCO - if invalid, use PLATINUM
          let colorToEdit = item.color || defaultColorForEdit;
          if (isBlancoRouteForEdit || item.name === 'BLANCO') {
            const validBlancoColors = ['GOLDEN', 'PLATINUM', 'ASH'];
            if (!validBlancoColors.includes(colorToEdit)) {
              colorToEdit = 'PLATINUM'; // Invalid color for BLANCO, default to PLATINUM
            }
          }
          localStorage.setItem('editSelectedColor', colorToEdit);
          localStorage.setItem('selectedColor', colorToEdit);
          localStorage.setItem('editSelectedTexture', item.texture || 'SILKY');
          localStorage.setItem('selectedTexture', item.texture || 'SILKY');
          localStorage.setItem('editSelectedLace', item.lace || '13X6');
          localStorage.setItem('selectedLace', item.lace || '13X6');
          localStorage.setItem('editSelectedHairline', item.hairline || 'NATURAL');
          localStorage.setItem('selectedHairline', item.hairline || 'NATURAL');
          localStorage.setItem('editSelectedStyling', validStyling);
          localStorage.setItem('selectedStyling', validStyling);
          localStorage.setItem('editSelectedAddOns', JSON.stringify(item.addOns || []));
          localStorage.setItem('selectedAddOns', JSON.stringify(item.addOns || []));
          // CRITICAL: Calculate prices based on the preserved cap size selection (not cart item's potentially stale cap size)
          // Use the cap size we just preserved from localStorage, not the cart item's cap size
          const capSizeToUse = capSizeToUseForState;
          const editCustomizationWithPreservedCapSize = {
            ...editCustomization,
            capSize: capSizeToUse // Use preserved cap size, not cart item's cap size
          };
          const calculatedPrices = calculatePricesFromSelections(editCustomizationWithPreservedCapSize);
          
          console.log('[FLEX_CAP_DEBUG] ROUTE_CHANGE - Price calculation:', {
            capSizeUsed: editCustomizationWithPreservedCapSize.capSize,
            calculatedCapSizePrice: calculatedPrices.capSizePrice,
            existingPrice: localStorage.getItem('editSelectedCapSizePrice') || localStorage.getItem('selectedCapSizePrice'),
            timestamp: new Date().toISOString()
          });
          
          // CRITICAL: Preserve prices from localStorage when coming from sub-pages
          // This ensures negative prices (discounts) are preserved correctly
          const comingFromSubPage = sessionStorage.getItem('comingFromSubPage') === 'true';
          
          // Declare price variables in outer scope so they're accessible after if/else
          let capSizePrice: number;
          let colorPrice: number;
          let lengthPrice: number;
          let densityPrice: number;
          let lacePrice: number;
          let texturePrice: number;
          let hairlinePrice: number;
          let stylingPrice: number;
          let addOnsPrice: number;
          
          if (comingFromSubPage) {
            // Coming from sub-page: preserve prices from localStorage (may include negative values)
            // Only use calculated prices as fallback if localStorage doesn't have the price
            const getPreservedPrice = (key: string, calculatedValue: number) => {
              const editKey = `editSelected${key}Price`;
              const selectedKey = `selected${key}Price`;
              const editValue = localStorage.getItem(editKey);
              const selectedValue = localStorage.getItem(selectedKey);
              
              // Prefer editSelected* key, then selected* key, then calculated value
              // CRITICAL: Check that value exists, is not empty, and is a valid number (including negative)
              let result;
              if (editValue !== null && editValue !== undefined && editValue !== '' && !isNaN(parseFloat(editValue))) {
                result = parseFloat(editValue);
              } else if (selectedValue !== null && selectedValue !== undefined && selectedValue !== '' && !isNaN(parseFloat(selectedValue))) {
                result = parseFloat(selectedValue);
              } else {
                result = calculatedValue;
              }
              
              // Debug logging for cap size price
              if (key === 'CapSize') {
                console.log('[FLEX_CAP_DEBUG] GET_PRESERVED_PRICE (from sub-page):', {
                  key,
                  editKey,
                  editValue,
                  selectedKey,
                  selectedValue,
                  calculatedValue,
                  result,
                  capSize: capSizeToUse,
                  isFlexibleCap: capSizeToUse === 'XXS/XS/S' || capSizeToUse === 'S/M/L',
                  timestamp: new Date().toISOString()
                });
              }
              
              return result;
            };
            
            capSizePrice = getPreservedPrice('CapSize', calculatedPrices.capSizePrice);
            colorPrice = getPreservedPrice('Color', calculatedPrices.colorPrice);
            lengthPrice = getPreservedPrice('Length', calculatedPrices.lengthPrice);
            // Blanco default density is 250% (included in base = $0). Never use preserved $80 from Noir.
            const isBlancoEditRoute = location.pathname.startsWith('/build-a-wig/blanco');
            densityPrice = (isBlancoEditRoute && editCustomizationWithPreservedCapSize.density === '250%')
              ? calculatedPrices.densityPrice
              : getPreservedPrice('Density', calculatedPrices.densityPrice);
            lacePrice = getPreservedPrice('Lace', calculatedPrices.lacePrice);
            texturePrice = getPreservedPrice('Texture', calculatedPrices.texturePrice);
            hairlinePrice = getPreservedPrice('Hairline', calculatedPrices.hairlinePrice);
            stylingPrice = getPreservedPrice('Styling', calculatedPrices.stylingPrice);
            addOnsPrice = getPreservedPrice('AddOns', calculatedPrices.addOnsPrice);
            
            const pricesToSave = {
              capSizePrice,
              colorPrice,
              lengthPrice,
              densityPrice,
              lacePrice,
              texturePrice,
              hairlinePrice,
              stylingPrice,
              addOnsPrice
            };
            
            console.log('[FLEX_CAP_DEBUG] ROUTE_CHANGE - Final pricesToSave (from sub-page):', {
              capSizePrice: pricesToSave.capSizePrice,
              capSizeToUse,
              calculatedCapSizePrice: calculatedPrices.capSizePrice,
              timestamp: new Date().toISOString()
            });
            
            savePricesToLocalStorage(pricesToSave);
          } else {
            // Not coming from sub-page (initial load from cart): use CALCULATED prices only.
            // Do NOT read from localStorage here — stale editSelected*Price/selected*Price from another
            // product or session can be non-zero for "default" options (24", 200%, 13X6, etc.) that are
            // already included in base price, which doubles or miscalculates the total.
            capSizePrice = calculatedPrices.capSizePrice;
            colorPrice = calculatedPrices.colorPrice;
            lengthPrice = calculatedPrices.lengthPrice;
            densityPrice = calculatedPrices.densityPrice;
            lacePrice = calculatedPrices.lacePrice;
            texturePrice = calculatedPrices.texturePrice;
            hairlinePrice = calculatedPrices.hairlinePrice;
            stylingPrice = calculatedPrices.stylingPrice;
            addOnsPrice = calculatedPrices.addOnsPrice;
            
            // Save these calculated prices to localStorage so sub-pages and price effect see correct values
            localStorage.setItem('editSelectedCapSizePrice', capSizePrice.toString());
            localStorage.setItem('selectedCapSizePrice', capSizePrice.toString());
            localStorage.setItem('editSelectedColorPrice', colorPrice.toString());
            localStorage.setItem('selectedColorPrice', colorPrice.toString());
            localStorage.setItem('editSelectedLengthPrice', lengthPrice.toString());
            localStorage.setItem('selectedLengthPrice', lengthPrice.toString());
            localStorage.setItem('editSelectedDensityPrice', densityPrice.toString());
            localStorage.setItem('selectedDensityPrice', densityPrice.toString());
            localStorage.setItem('editSelectedLacePrice', lacePrice.toString());
            localStorage.setItem('selectedLacePrice', lacePrice.toString());
            localStorage.setItem('editSelectedTexturePrice', texturePrice.toString());
            localStorage.setItem('selectedTexturePrice', texturePrice.toString());
            localStorage.setItem('editSelectedHairlinePrice', hairlinePrice.toString());
            localStorage.setItem('selectedHairlinePrice', hairlinePrice.toString());
            localStorage.setItem('editSelectedStylingPrice', stylingPrice.toString());
            localStorage.setItem('selectedStylingPrice', stylingPrice.toString());
            localStorage.setItem('editSelectedAddOnsPrice', addOnsPrice.toString());
            localStorage.setItem('selectedAddOnsPrice', addOnsPrice.toString());
            
            // Save prices using savePricesToLocalStorage helper
            const pricesToSave = {
              capSizePrice,
              colorPrice,
              lengthPrice,
              densityPrice,
              lacePrice,
              texturePrice,
              hairlinePrice,
              stylingPrice,
              addOnsPrice
            };
            
            savePricesToLocalStorage(pricesToSave);
            
            console.log('[EDIT MODE INITIAL LOAD] Loaded and saved prices from cart item:', {
              editCustomizationWithPreservedCapSize,
              calculatedPrices,
              pricesToSave,
              cartItemCapSizePrice: item.capSizePrice,
              timestamp: new Date().toISOString()
            });
          }
          
          // Set initial total price using the same prices we just loaded/saved
          // CRITICAL: Use the prices we loaded from cart item or calculated above to ensure consistency
          const pathname = location.pathname;
          let currentBasePrice = 740; // Default noir
          if (pathname.startsWith('/build-a-wig/blanco')) currentBasePrice = 820;
          else if (pathname.startsWith('/build-a-wig/soft-wave') || pathname.startsWith('/build-a-wig/beach-wave')) currentBasePrice = 760;
          else if (pathname.startsWith('/build-a-wig/soft-curl') || pathname.startsWith('/build-a-wig/ocean-curl')) currentBasePrice = 780;
          else if (pathname.startsWith('/build-a-wig/noir')) currentBasePrice = 740;
          
          // Use the prices we just saved (from cart item or calculated)
          // These are the same prices that will be used when saving, ensuring consistency
          const initialTotalPrice = currentBasePrice + 
            capSizePrice + 
            colorPrice + 
            lengthPrice + 
            densityPrice + 
            lacePrice + 
            texturePrice + 
            hairlinePrice + 
            stylingPrice + 
            addOnsPrice;
          
          setTotalPrice(initialTotalPrice);
          
          // Trigger price recalculation
          setRefreshTrigger(prev => prev + 1);
        } catch (error) {
        }
      }
        
        // Clear flag after a short delay to allow state update to complete
        setTimeout(() => {
          isLoadingFromStorage.current = false;
        }, 100);
    } else if (isMainPage) {
      // Set flag to prevent sync effect from overwriting
      isLoadingFromStorage.current = true;
      
      // MAIN PAGE: Always use DEFAULT selections
      // Check if we're coming from a sub-page or if this is a fresh visit
      const comingFromSubPage = sessionStorage.getItem('comingFromSubPage') === 'true';
      const isEditMode = sessionStorage.getItem('isEditMode') === 'true';
      
      // If coming from edit mode, clear the flag and reset to defaults
      if (isEditMode) {
        sessionStorage.removeItem('isEditMode');
        // Clear localStorage to ensure defaults
        localStorage.removeItem('selectedCapSize');
        localStorage.removeItem('selectedLength');
        localStorage.removeItem('selectedDensity');
        localStorage.removeItem('selectedColor');
        localStorage.removeItem('selectedTexture');
        localStorage.removeItem('selectedLace');
        localStorage.removeItem('selectedHairline');
        localStorage.removeItem('selectedStyling');
        localStorage.removeItem('selectedAddOns');
        localStorage.removeItem('selectedCapSizePrice');
        localStorage.removeItem('selectedColorPrice');
        localStorage.removeItem('selectedLengthPrice');
        localStorage.removeItem('selectedDensityPrice');
        localStorage.removeItem('selectedLacePrice');
        localStorage.removeItem('selectedTexturePrice');
        localStorage.removeItem('selectedHairlinePrice');
        localStorage.removeItem('selectedStylingPrice');
        localStorage.removeItem('selectedAddOnsPrice');
      }
      
      // If NOT coming from sub-page AND not in edit mode, clear localStorage and set defaults
      // CRITICAL: Only clear if truly NOT coming from sub-page (comingFromSubPage must be explicitly false/undefined)
      if (!comingFromSubPage && !isEditMode) {
        // Clear localStorage to ensure defaults
        localStorage.removeItem('selectedCapSize');
        localStorage.removeItem('selectedLength');
        localStorage.removeItem('selectedDensity');
        localStorage.removeItem('selectedColor');
        localStorage.removeItem('selectedTexture');
        localStorage.removeItem('selectedLace');
        localStorage.removeItem('selectedHairline');
        localStorage.removeItem('selectedStyling');
        localStorage.removeItem('selectedAddOns');
        localStorage.removeItem('selectedCapSizePrice');
        localStorage.removeItem('selectedColorPrice');
        localStorage.removeItem('selectedLengthPrice');
        localStorage.removeItem('selectedDensityPrice');
        localStorage.removeItem('selectedLacePrice');
        localStorage.removeItem('selectedTexturePrice');
        localStorage.removeItem('selectedHairlinePrice');
        localStorage.removeItem('selectedStylingPrice');
        localStorage.removeItem('selectedAddOnsPrice');
        
        // Set defaults
        // CRITICAL: Check product-specific routes to set correct defaults
        const pathnameForDefaults = location.pathname;
        const isBlancoRouteForDefaults = pathnameForDefaults.startsWith('/build-a-wig/blanco');
        const defaults = {
          capSize: 'M',
          length: '24"',
          density: isBlancoRouteForDefaults ? '250%' : '200%',
          lace: '13X6',
          texture: 'SILKY',
          color: isBlancoRouteForDefaults ? 'PLATINUM' : 'OFF BLACK',
          hairline: 'NATURAL',
          styling: 'NONE',
          addOns: [],
        };
        
        localStorage.setItem('selectedCapSize', defaults.capSize);
        localStorage.setItem('selectedLength', defaults.length);
        localStorage.setItem('selectedDensity', defaults.density);
        localStorage.setItem('selectedColor', defaults.color);
        localStorage.setItem('selectedTexture', defaults.texture);
        localStorage.setItem('selectedLace', defaults.lace);
        localStorage.setItem('selectedHairline', defaults.hairline);
        localStorage.setItem('selectedStyling', defaults.styling);
        localStorage.setItem('selectedAddOns', JSON.stringify(defaults.addOns));
        
        // CRITICAL: Only set prices to 0 if they don't exist - preserve prices saved by sub-pages
        // This ensures that when returning from sub-pages, prices are not overwritten
        if (!localStorage.getItem('selectedCapSizePrice')) localStorage.setItem('selectedCapSizePrice', '0');
        if (!localStorage.getItem('selectedColorPrice')) localStorage.setItem('selectedColorPrice', '0');
        if (!localStorage.getItem('selectedLengthPrice')) localStorage.setItem('selectedLengthPrice', '0');
        if (!localStorage.getItem('selectedDensityPrice')) localStorage.setItem('selectedDensityPrice', '0');
        if (!localStorage.getItem('selectedLacePrice')) localStorage.setItem('selectedLacePrice', '0');
        if (!localStorage.getItem('selectedTexturePrice')) localStorage.setItem('selectedTexturePrice', '0');
        if (!localStorage.getItem('selectedHairlinePrice')) localStorage.setItem('selectedHairlinePrice', '0');
        if (!localStorage.getItem('selectedStylingPrice')) localStorage.setItem('selectedStylingPrice', '0');
        if (!localStorage.getItem('selectedAddOnsPrice')) localStorage.setItem('selectedAddOnsPrice', '0');
        
        // Set customization state to defaults
        setCustomization(defaults);
        
        // Clear the flag
        sessionStorage.removeItem('comingFromSubPage');
        
        // Clear loading flag after a short delay
        setTimeout(() => {
          isLoadingFromStorage.current = false;
        }, 100);
      } else {
        // Coming from sub-page: load from localStorage
        
        // Set flag to prevent sync effect from overwriting
        isLoadingFromStorage.current = true;
        
        const savedCapSize = localStorage.getItem('selectedCapSize');
        const savedLength = localStorage.getItem('selectedLength');
        const savedDensity = localStorage.getItem('selectedDensity');
        const savedLace = localStorage.getItem('selectedLace');
        const savedTexture = localStorage.getItem('selectedTexture');
        const savedColor = localStorage.getItem('selectedColor');
        const savedHairline = localStorage.getItem('selectedHairline');
        const savedStyling = localStorage.getItem('selectedStyling');
        const savedAddOns = localStorage.getItem('selectedAddOns');

        // Always load from localStorage when coming from sub-page
        // CRITICAL: Check current route to use product-specific defaults
        const pathnameForDefaults = location.pathname;
        const isBlancoRouteForDefaults = pathnameForDefaults.startsWith('/build-a-wig/blanco');
        const defaultDensity = isBlancoRouteForDefaults ? '250%' : '200%';
        const defaultColor = isBlancoRouteForDefaults ? 'PLATINUM' : 'OFF BLACK';
        
        // Use current customization state as fallback to preserve existing selections (like customize mode)
        // But use product-specific defaults if no value exists
        const savedCapSizeFinal = savedCapSize || customization.capSize || 'M';
        const savedLengthFinal = savedLength || customization.length || '24"';
        const savedDensityFinal = savedDensity || customization.density || defaultDensity;
        const savedLaceFinal = savedLace || customization.lace || '13X6';
        const savedTextureFinal = savedTexture || customization.texture || 'SILKY';
        const savedColorFinal = savedColor || customization.color || defaultColor;
        const savedHairlineFinal = savedHairline || customization.hairline || 'NATURAL';
        const savedStylingFinal = savedStyling || customization.styling || 'NONE';
        const savedAddOnsFinal = savedAddOns || JSON.stringify(customization.addOns) || '[]';
        
        // CRITICAL: If we're on a blanco route but localStorage has noir defaults, override them BEFORE creating updatedCustomization
        let correctedDensity = savedDensityFinal;
        let correctedColor = savedColorFinal;
        
        if (isBlancoRouteForDefaults) {
          // If density is noir's default (200%) and wasn't explicitly saved, replace with blanco's default (250%)
          if (correctedDensity === '200%' && !savedDensity) {
            correctedDensity = '250%';
            localStorage.setItem('selectedDensity', '250%');
          }
          // If color is noir's default (OFF BLACK) and wasn't explicitly saved, replace with blanco's default (PLATINUM)
          if (correctedColor === 'OFF BLACK' && !savedColor) {
            correctedColor = 'PLATINUM';
            localStorage.setItem('selectedColor', 'PLATINUM');
          }
        }
        
        // CRITICAL: Ensure styling is not a part selection (MIDDLE, LEFT, RIGHT) - it should be NONE or a valid styling option
        let validStyling = savedStylingFinal !== null && savedStylingFinal !== 'NONE' ? savedStylingFinal : 'NONE';
        const partSelectionOptions = ['MIDDLE', 'LEFT', 'RIGHT'];
        if (partSelectionOptions.includes(validStyling)) {
          validStyling = 'NONE'; // If styling is a part selection, set to NONE
        }
        
        const updatedCustomization = {
          capSize: savedCapSizeFinal,
          length: savedLengthFinal,
          density: correctedDensity,
          lace: savedLaceFinal,
          texture: savedTextureFinal,
          color: correctedColor,
          hairline: savedHairlineFinal,
          styling: validStyling,
          addOns: savedAddOnsFinal ? JSON.parse(savedAddOnsFinal) : [],
        };
        
        
        // CRITICAL: Immediately save loaded values back to localStorage to ensure they're available
        localStorage.setItem('selectedCapSize', updatedCustomization.capSize);
        localStorage.setItem('selectedLength', updatedCustomization.length);
        localStorage.setItem('selectedDensity', updatedCustomization.density);
        localStorage.setItem('selectedLace', updatedCustomization.lace);
        localStorage.setItem('selectedTexture', updatedCustomization.texture);
        localStorage.setItem('selectedColor', updatedCustomization.color);
        localStorage.setItem('selectedHairline', updatedCustomization.hairline);
        localStorage.setItem('selectedStyling', validStyling);
        localStorage.setItem('selectedAddOns', JSON.stringify(updatedCustomization.addOns));
        
        // CRITICAL: Read prices from localStorage (saved by sub-pages) to preserve exact prices
        // Read directly from localStorage - don't default to '0' as that would overwrite existing prices
        const savedCapSizePrice = localStorage.getItem('selectedCapSizePrice');
        const savedColorPrice = localStorage.getItem('selectedColorPrice');
        const savedLengthPrice = localStorage.getItem('selectedLengthPrice');
        const savedDensityPrice = localStorage.getItem('selectedDensityPrice');
        const savedLacePrice = localStorage.getItem('selectedLacePrice');
        const savedTexturePrice = localStorage.getItem('selectedTexturePrice');
        const savedHairlinePrice = localStorage.getItem('selectedHairlinePrice');
        const savedStylingPrice = localStorage.getItem('selectedStylingPrice');
        const savedAddOnsPrice = localStorage.getItem('selectedAddOnsPrice');
        
        // Recalculate prices as fallback if any prices are missing, but prioritize saved prices
        const calculatedPrices = calculatePricesFromSelections(updatedCustomization);
        // CRITICAL: Preserve cap size price from localStorage if it exists (may have been set from cart item or sub-pages)
        // Only recalculate if localStorage doesn't have a value
        const capSizePriceToUse = (savedCapSizePrice && savedCapSizePrice !== '' && !isNaN(parseFloat(savedCapSizePrice))) 
          ? parseFloat(savedCapSizePrice) 
          : calculatedPrices.capSizePrice;
        // CRITICAL: Blanco default density is 250% (included in base = $0). Never use stored $80 from Noir.
        const isBlancoStorage = location.pathname.startsWith('/build-a-wig/blanco');
        const densityPriceToUse = (isBlancoStorage && updatedCustomization.density === '250%')
          ? calculatedPrices.densityPrice
          : ((savedDensityPrice && savedDensityPrice !== '' && !isNaN(parseFloat(savedDensityPrice))) ? parseFloat(savedDensityPrice) : calculatedPrices.densityPrice);
        // For other prices, use saved prices if they exist, otherwise use calculated prices
        const pricesToSave = {
          capSizePrice: capSizePriceToUse, // Preserve from localStorage if exists, otherwise use calculated
          colorPrice: (savedColorPrice && savedColorPrice !== '' && !isNaN(parseFloat(savedColorPrice))) ? parseFloat(savedColorPrice) : calculatedPrices.colorPrice,
          lengthPrice: (savedLengthPrice && savedLengthPrice !== '' && !isNaN(parseFloat(savedLengthPrice))) ? parseFloat(savedLengthPrice) : calculatedPrices.lengthPrice,
          densityPrice: densityPriceToUse,
          lacePrice: (savedLacePrice && savedLacePrice !== '' && !isNaN(parseFloat(savedLacePrice))) ? parseFloat(savedLacePrice) : calculatedPrices.lacePrice,
          texturePrice: (savedTexturePrice && savedTexturePrice !== '' && !isNaN(parseFloat(savedTexturePrice))) ? parseFloat(savedTexturePrice) : calculatedPrices.texturePrice,
          hairlinePrice: (savedHairlinePrice && savedHairlinePrice !== '' && !isNaN(parseFloat(savedHairlinePrice))) ? parseFloat(savedHairlinePrice) : calculatedPrices.hairlinePrice,
          stylingPrice: (savedStylingPrice && savedStylingPrice !== '' && !isNaN(parseFloat(savedStylingPrice))) ? parseFloat(savedStylingPrice) : calculatedPrices.stylingPrice,
          addOnsPrice: (savedAddOnsPrice && savedAddOnsPrice !== '' && !isNaN(parseFloat(savedAddOnsPrice))) ? parseFloat(savedAddOnsPrice) : calculatedPrices.addOnsPrice,
        };
        
        // CRITICAL: Explicitly save prices to localStorage BEFORE updating state (like customize mode does)
        // This ensures prices are available for calculatePrice to read when it runs after state update
        localStorage.setItem('selectedCapSizePrice', pricesToSave.capSizePrice.toString());
        localStorage.setItem('selectedColorPrice', pricesToSave.colorPrice.toString());
        localStorage.setItem('selectedLengthPrice', pricesToSave.lengthPrice.toString());
        localStorage.setItem('selectedDensityPrice', pricesToSave.densityPrice.toString());
        localStorage.setItem('selectedLacePrice', pricesToSave.lacePrice.toString());
        localStorage.setItem('selectedTexturePrice', pricesToSave.texturePrice.toString());
        localStorage.setItem('selectedHairlinePrice', pricesToSave.hairlinePrice.toString());
        localStorage.setItem('selectedStylingPrice', pricesToSave.stylingPrice.toString());
        localStorage.setItem('selectedAddOnsPrice', pricesToSave.addOnsPrice.toString());
        
        // Also call savePricesToLocalStorage for consistency
        savePricesToLocalStorage(pricesToSave);
        
        // Update customization state - this will trigger wigViews to update via useMemo dependency
        // AND trigger calculatePrice via useEffect dependency
        setCustomization(updatedCustomization);
        
        setRefreshTrigger(prev => prev + 1);
        
        // Clear loading flag after a short delay to allow state updates to propagate
        // Use a longer delay to ensure React state updates have propagated and sync effect won't overwrite
        // CRITICAL: Keep comingFromSubPage flag until AFTER loading flag is cleared, so sync effect can skip
        setTimeout(() => {
          isLoadingFromStorage.current = false;
          // Clear the flag AFTER loading flag is cleared, so sync effect has had time to skip
          sessionStorage.removeItem('comingFromSubPage');
        }, 300);
      }
    }
  }, [location.pathname, routeKey]); // Run when route changes

  // Ensure BLEACH+PLUCK are auto-confirmed on main customize/edit when a style is selected,
  // so the main page shows the correct total without requiring a visit to the add-ons sub-page.
  useEffect(() => {
    if (isLoadingFromStorage.current) return;
    const pathname = location.pathname;
    const isMainCustomizePage = pathname.endsWith('/customize') && !pathname.includes('/customize/');
    const isMainEditPage = pathname.endsWith('/edit') && !pathname.includes('/edit/') && localStorage.getItem('editingCartItem') !== null;
    if (!isMainCustomizePage && !isMainEditPage) return;

    const styling = customization.styling || 'NONE';
    const partSelectionOptions = ['MIDDLE', 'LEFT', 'RIGHT'];
    const validStyling = styling && styling !== 'NONE' && !partSelectionOptions.includes(styling) ? styling : 'NONE';
    if (validStyling === 'NONE') return;

    const addOns = customization.addOns || [];
    if (addOns.includes('BLEACH') && addOns.includes('PLUCK')) return;

    const addOnsOrder = ['BLEACH', 'PLUCK', 'BLUNT CUT'];
    const merged = [...addOns.filter((x: string) => x !== 'BLEACH' && x !== 'PLUCK'), 'BLEACH', 'PLUCK'];
    const updatedCustomization = { ...customization, addOns: merged.sort((a: string, b: string) => addOnsOrder.indexOf(a) - addOnsOrder.indexOf(b)) };
    const calculatedPrices = calculatePricesFromSelections(updatedCustomization);

    setCustomization(updatedCustomization);
    sessionStorage.setItem('bleachPluckAutoAddedForStyling', 'true');

    if (isMainCustomizePage) {
      localStorage.setItem('customizeSelectedAddOns', JSON.stringify(updatedCustomization.addOns));
      localStorage.setItem('selectedAddOns', JSON.stringify(updatedCustomization.addOns));
      localStorage.setItem('customizeSelectedAddOnsPrice', calculatedPrices.addOnsPrice.toString());
      localStorage.setItem('selectedAddOnsPrice', calculatedPrices.addOnsPrice.toString());
    } else {
      localStorage.setItem('editSelectedAddOns', JSON.stringify(updatedCustomization.addOns));
      localStorage.setItem('selectedAddOns', JSON.stringify(updatedCustomization.addOns));
      localStorage.setItem('editSelectedAddOnsPrice', calculatedPrices.addOnsPrice.toString());
      localStorage.setItem('selectedAddOnsPrice', calculatedPrices.addOnsPrice.toString());
    }
    setRefreshTrigger(prev => prev + 1);
  }, [customization.styling, customization.addOns, location.pathname]);

  // Listen for storage changes (when sub-pages update localStorage)
  // NOTE: This is disabled for main mode - main mode loads from localStorage in the route change effect instead
  // This prevents conflicts when returning from sub-pages
  useEffect(() => {
    const handleStorageChange = () => {
      // Skip if we're currently loading from localStorage to prevent conflicts
      if (isLoadingFromStorage.current) {
        return;
      }
      
      // Do not skip when coming from sub-page: merge from localStorage so auto-selected add-ons (e.g. BLEACH+PLUCK)
      // and their price are reflected on the main page as soon as we receive the event (after add-ons Back or persist).

      // Skip for main mode - main mode handles loading in the route change effect
      const isMainPage = location.pathname === '/build-a-wig';
      if (isMainPage) {
        return; // Don't handle storage changes for main mode - let route change effect handle it
      }
      
      // Only handle storage changes for edit and customize modes
      const isEditMode = (location.pathname === '/build-a-wig/edit' ||
                         location.pathname === '/build-a-wig/noir/edit' ||
                         location.pathname === '/build-a-wig/blanco/edit' ||
                         location.pathname === '/build-a-wig/soft-wave/edit' ||
                         location.pathname === '/build-a-wig/soft-curl/edit' ||
                         location.pathname === '/build-a-wig/beach-wave/edit' ||
                         location.pathname === '/build-a-wig/ocean-curl/edit') && localStorage.getItem('editingCartItem') !== null;
      const isCustomizeMode = location.pathname === '/build-a-wig/noir/customize' || 
                              location.pathname === '/build-a-wig/blanco/customize' ||
                              location.pathname === '/build-a-wig/soft-wave/customize' ||
                              location.pathname === '/build-a-wig/soft-curl/customize' ||
                              location.pathname === '/build-a-wig/beach-wave/customize' ||
                              location.pathname === '/build-a-wig/ocean-curl/customize';
      
      if (isEditMode || isCustomizeMode) {
        // CRITICAL: In edit mode, read from editSelected* keys (set by sub-pages)
        // In customize mode, read from customizeSelected* keys (set by sub-pages)
        // Fall back to selected* keys if the mode-specific keys don't exist
        let savedCapSize: string | null = null;
        let savedLength: string | null = null;
        let savedDensity: string | null = null;
        let savedLace: string | null = null;
        let savedTexture: string | null = null;
        let savedColor: string | null = null;
        let savedHairline: string | null = null;
        let savedStyling: string | null = null;
        let savedAddOns: string | null = null;
        
        if (isEditMode) {
          // Edit mode: prioritize editSelected* keys, fall back to selected* keys
          savedCapSize = localStorage.getItem('editSelectedCapSize') || localStorage.getItem('selectedCapSize');
          savedLength = localStorage.getItem('editSelectedLength') || localStorage.getItem('selectedLength');
          savedDensity = localStorage.getItem('editSelectedDensity') || localStorage.getItem('selectedDensity');
          savedLace = localStorage.getItem('editSelectedLace') || localStorage.getItem('selectedLace');
          savedTexture = localStorage.getItem('editSelectedTexture') || localStorage.getItem('selectedTexture');
          savedColor = localStorage.getItem('editSelectedColor') || localStorage.getItem('selectedColor');
          savedHairline = localStorage.getItem('editSelectedHairline') || localStorage.getItem('selectedHairline');
          savedStyling = localStorage.getItem('editSelectedStyling') || localStorage.getItem('selectedStyling');
          savedAddOns = localStorage.getItem('editSelectedAddOns') || localStorage.getItem('selectedAddOns');
        } else if (isCustomizeMode) {
          // Customize mode: prioritize customizeSelected* keys, fall back to selected* keys
          savedCapSize = localStorage.getItem('customizeSelectedCapSize') || localStorage.getItem('selectedCapSize');
          savedLength = localStorage.getItem('customizeSelectedLength') || localStorage.getItem('selectedLength');
          savedDensity = localStorage.getItem('customizeSelectedDensity') || localStorage.getItem('selectedDensity');
          savedLace = localStorage.getItem('customizeSelectedLace') || localStorage.getItem('selectedLace');
          savedTexture = localStorage.getItem('customizeSelectedTexture') || localStorage.getItem('selectedTexture');
          savedColor = localStorage.getItem('customizeSelectedColor') || localStorage.getItem('selectedColor');
          savedHairline = localStorage.getItem('customizeSelectedHairline') || localStorage.getItem('selectedHairline');
          savedStyling = localStorage.getItem('customizeSelectedStyling') || localStorage.getItem('selectedStyling');
          savedAddOns = localStorage.getItem('customizeSelectedAddOns') || localStorage.getItem('selectedAddOns');
        }
        
        // CRITICAL: Ensure styling is not a part selection (MIDDLE, LEFT, RIGHT) - it should be NONE or a valid styling option
        let validStyling: string = savedStyling !== null ? savedStyling : 'NONE';
        const partSelectionOptions = ['MIDDLE', 'LEFT', 'RIGHT'];
        if (partSelectionOptions.includes(validStyling)) {
          validStyling = 'NONE'; // If styling is a part selection, set to NONE
          // Also update localStorage to fix the incorrect value
          if (isEditMode) {
            localStorage.setItem('editSelectedStyling', 'NONE');
          } else if (isCustomizeMode) {
            localStorage.setItem('customizeSelectedStyling', 'NONE');
          }
          localStorage.setItem('selectedStyling', 'NONE');
        }
        
        setCustomization(prev => ({
          ...prev,
          capSize: savedCapSize || prev.capSize,
          length: savedLength || prev.length,
          density: savedDensity || prev.density,
          lace: savedLace || prev.lace,
          texture: savedTexture || prev.texture,
          color: savedColor || prev.color,
          hairline: savedHairline || prev.hairline,
          styling: validStyling,
          addOns: savedAddOns ? JSON.parse(savedAddOns) : prev.addOns,
        }));
        
        // Trigger price recalculation by updating refreshTrigger
        setRefreshTrigger(prev => prev + 1);
      }
    };
    
    const handleCustomStorageChange = () => {
      handleStorageChange();
    };
    
    // Listen for both storage events and custom events
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('customStorageChange', handleCustomStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('customStorageChange', handleCustomStorageChange);
    };
  }, [location.pathname]);

  // Listen for editingCartItemChanged event to reload when switching items while on edit page
  useEffect(() => {
    const handleEditingCartItemChanged = (event: CustomEvent) => {
      const isEditPage = location.pathname === '/build-a-wig/edit' ||
                       location.pathname === '/build-a-wig/noir/edit' ||
                       location.pathname === '/build-a-wig/blanco/edit' ||
                       location.pathname === '/build-a-wig/soft-wave/edit' ||
                       location.pathname === '/build-a-wig/soft-curl/edit' ||
                       location.pathname === '/build-a-wig/beach-wave/edit' ||
                       location.pathname === '/build-a-wig/ocean-curl/edit';
      
      if (isEditPage) {
        const newItemId = event.detail?.itemId;
        
        // Check if this is a different item
        if (newItemId && newItemId !== currentEditingItemIdRef.current) {
          
          // Force reload by triggering the route change effect
          // Clear the comingFromSubPage flag so it loads from editingCartItem, not localStorage
          sessionStorage.removeItem('comingFromSubPage');
          
          // Trigger a route key change to force useEffect to run
          setRouteKey(prev => prev + '_reload_' + Date.now());
        }
      }
    };

    window.addEventListener('editingCartItemChanged', handleEditingCartItemChanged as EventListener);
    
    return () => {
      window.removeEventListener('editingCartItemChanged', handleEditingCartItemChanged as EventListener);
    };
  }, [location.pathname]);

  // REMOVED: Continuously enforce defaults - this was clearing localStorage and preventing sub-pages from showing correct selections
  // The customize page doesn't have this logic - it trusts localStorage and loads from it
  // Sub-pages should always show what's in localStorage, which matches the main page

  // Track customization state changes for debugging
  useEffect(() => {
    const isEditPage = location.pathname === '/build-a-wig/edit' ||
                       location.pathname === '/build-a-wig/noir/edit' ||
                       location.pathname === '/build-a-wig/blanco/edit' ||
                       location.pathname === '/build-a-wig/soft-wave/edit' ||
                       location.pathname === '/build-a-wig/soft-curl/edit' ||
                       location.pathname === '/build-a-wig/beach-wave/edit' ||
                       location.pathname === '/build-a-wig/ocean-curl/edit';
    if (isEditPage) {
    }
  }, [customization, location.pathname]);

  // CRITICAL: Sync customization state to localStorage whenever it changes
  // This ensures sub-pages see the current selections from the main page
  // BUT: In edit mode, DO NOT overwrite editSelected* keys that were just set by sub-pages
  useEffect(() => {
    // Skip syncing if we're currently loading from localStorage (to avoid circular updates)
    if (isLoadingFromStorage.current) {
      console.log('[SYNC TO STORAGE] Skipping sync - isLoadingFromStorage is true');
      return;
    }
    
    // Check if we're in edit mode or customize mode
    const isEditMode = (location.pathname === '/build-a-wig/edit' ||
                       location.pathname === '/build-a-wig/noir/edit' ||
                       location.pathname === '/build-a-wig/blanco/edit' ||
                       location.pathname === '/build-a-wig/soft-wave/edit' ||
                       location.pathname === '/build-a-wig/soft-curl/edit' ||
                       location.pathname === '/build-a-wig/beach-wave/edit' ||
                       location.pathname === '/build-a-wig/ocean-curl/edit') && localStorage.getItem('editingCartItem') !== null;
    const isCustomizeMode = location.pathname === '/build-a-wig/noir/customize' ||
                            location.pathname === '/build-a-wig/blanco/customize' ||
                            location.pathname === '/build-a-wig/soft-wave/customize' ||
                            location.pathname === '/build-a-wig/soft-curl/customize' ||
                            location.pathname === '/build-a-wig/beach-wave/customize' ||
                            location.pathname === '/build-a-wig/ocean-curl/customize';
    
    // CRITICAL: For all modes, skip syncing if we just came from a sub-page (let the route change effect handle it)
    // Check this BEFORE any other logic to prevent race conditions
    const comingFromSubPage = sessionStorage.getItem('comingFromSubPage') === 'true';
    if (comingFromSubPage) {
      console.log('[SYNC TO STORAGE] Skipping sync - comingFromSubPage is true, route change effect will handle it');
      return;
    }
    
    console.log('[SYNC TO STORAGE] Running sync to localStorage', { isEditMode, isCustomizeMode });
    
    // CRITICAL: In edit mode, DO NOT sync editSelected* keys back to localStorage
    // Sub-pages set these values, and we should NOT overwrite them
    // Only sync selected* keys for sub-pages to read, but don't overwrite editSelected* keys
    if (isEditMode) {
      // CRITICAL: Match customize mode - sync selected* keys from editSelected* keys if they exist
      // This ensures sub-pages always see the latest selections when navigating between sub-pages
      // Check editSelected* keys first, then fall back to customization state
      // This prevents overwriting with stale state while preserving change detection
      const editSelectedColor = localStorage.getItem('editSelectedColor');
      const editSelectedLength = localStorage.getItem('editSelectedLength');
      const editSelectedDensity = localStorage.getItem('editSelectedDensity');
      const editSelectedTexture = localStorage.getItem('editSelectedTexture');
      const editSelectedLace = localStorage.getItem('editSelectedLace');
      const editSelectedHairline = localStorage.getItem('editSelectedHairline');
      const editSelectedStyling = localStorage.getItem('editSelectedStyling');
      const editSelectedCapSize = localStorage.getItem('editSelectedCapSize');
      const editSelectedAddOns = localStorage.getItem('editSelectedAddOns');
      
      // Use editSelected* values for selected* keys if they exist, otherwise use customization state
      // This matches customize mode where customizeSelected* takes priority for selected* keys
      const colorToSync = editSelectedColor !== null ? editSelectedColor : customization.color;
      const lengthToSync = editSelectedLength !== null ? editSelectedLength : customization.length;
      const densityToSync = editSelectedDensity !== null ? editSelectedDensity : customization.density;
      const textureToSync = editSelectedTexture !== null ? editSelectedTexture : customization.texture;
      const laceToSync = editSelectedLace !== null ? editSelectedLace : customization.lace;
      const hairlineToSync = editSelectedHairline !== null ? editSelectedHairline : customization.hairline;
      const capSizeToSync = editSelectedCapSize !== null ? editSelectedCapSize : customization.capSize;
      const addOnsToSync = editSelectedAddOns !== null ? editSelectedAddOns : JSON.stringify(customization.addOns);
      
      // Only sync selected* keys (for sub-pages), NOT editSelected* keys (set by sub-pages)
      const partSelectionOptions = ['MIDDLE', 'LEFT', 'RIGHT'];
      let stylingToSync = editSelectedStyling !== null ? editSelectedStyling : customization.styling;
      const validStyling = partSelectionOptions.includes(stylingToSync) ? 'NONE' : stylingToSync;
      
      localStorage.setItem('selectedCapSize', capSizeToSync);
      localStorage.setItem('selectedLength', lengthToSync);
      localStorage.setItem('selectedDensity', densityToSync);
      localStorage.setItem('selectedColor', colorToSync);
      localStorage.setItem('selectedTexture', textureToSync);
      localStorage.setItem('selectedLace', laceToSync);
      localStorage.setItem('selectedHairline', hairlineToSync);
      localStorage.setItem('selectedStyling', validStyling);
      localStorage.setItem('selectedAddOns', addOnsToSync);
      
      // DO NOT sync editSelected* keys here - they are set by sub-pages and route change effect
      // DO NOT update customization state here - that would break change detection
      // DO NOT recalculate prices here - prices are set by sub-pages
      return; // Exit early to prevent overwriting editSelected* keys
    }
    
    // CRITICAL: In customize mode, DO NOT sync customizeSelected* keys back to localStorage
    // Sub-pages set these values, and we should NOT overwrite them
    // Only sync selected* keys for sub-pages to read, but don't overwrite customizeSelected* keys
    if (isCustomizeMode) {
      // Only sync selected* keys (for sub-pages), NOT customizeSelected* keys (set by sub-pages)
      const partSelectionOptions = ['MIDDLE', 'LEFT', 'RIGHT'];
      const validStyling = partSelectionOptions.includes(customization.styling) ? 'NONE' : customization.styling;
      
      console.log('[SYNC TO STORAGE] Customize mode - syncing selected* keys (NOT customizeSelected*)', customization);
      localStorage.setItem('selectedCapSize', customization.capSize);
      localStorage.setItem('selectedLength', customization.length);
      localStorage.setItem('selectedDensity', customization.density);
      localStorage.setItem('selectedColor', customization.color);
      localStorage.setItem('selectedTexture', customization.texture);
      localStorage.setItem('selectedLace', customization.lace);
      localStorage.setItem('selectedHairline', customization.hairline);
      localStorage.setItem('selectedStyling', validStyling);
      localStorage.setItem('selectedAddOns', JSON.stringify(customization.addOns));
      
      // DO NOT sync customizeSelected* keys here - they are set by sub-pages and route change effect
      // DO NOT recalculate prices here - prices are set by sub-pages
      return; // Exit early to prevent overwriting customizeSelected* keys
    }
    
    // CRITICAL: Ensure styling is not a part selection (MIDDLE, LEFT, RIGHT) - it should be NONE or a valid styling option
    const partSelectionOptions = ['MIDDLE', 'LEFT', 'RIGHT'];
    const validStyling = partSelectionOptions.includes(customization.styling) ? 'NONE' : customization.styling;
    
    // Save current customization to localStorage so sub-pages can read it (main mode only)
    // NOTE: Edit mode and customize mode return early above, so this only runs for main mode
    localStorage.setItem('selectedCapSize', customization.capSize);
    localStorage.setItem('selectedLength', customization.length);
    localStorage.setItem('selectedDensity', customization.density);
    localStorage.setItem('selectedColor', customization.color);
    localStorage.setItem('selectedTexture', customization.texture);
    localStorage.setItem('selectedLace', customization.lace);
    localStorage.setItem('selectedHairline', customization.hairline);
    localStorage.setItem('selectedStyling', validStyling);
    localStorage.setItem('selectedAddOns', JSON.stringify(customization.addOns));
  }, [customization, location.pathname]);
  
  // CRITICAL: In edit mode, sync customization state FROM localStorage when customStorageChange events fire
  // This ensures thumbnails update when returning from sub-pages
  useEffect(() => {
    const isEditPage = location.pathname === '/build-a-wig/edit' ||
                       location.pathname === '/build-a-wig/noir/edit' ||
                       location.pathname === '/build-a-wig/blanco/edit' ||
                       location.pathname === '/build-a-wig/soft-wave/edit' ||
                       location.pathname === '/build-a-wig/soft-curl/edit' ||
                       location.pathname === '/build-a-wig/beach-wave/edit' ||
                       location.pathname === '/build-a-wig/ocean-curl/edit';
    
    if (!isEditPage) {
      return;
    }
    
    const handleSyncFromStorage = () => {
      // CRITICAL: Skip if we're currently loading from localStorage (route change effect is handling it)
      if (isLoadingFromStorage.current) {
        console.log('[SYNC EFFECT] Skipping sync - isLoadingFromStorage is true');
        return;
      }
      
      const comingFromSubPage = sessionStorage.getItem('comingFromSubPage') === 'true';
      
      // CRITICAL: If coming from sub-page, use a longer delay to ensure route change effect runs first
      // But still handle it here as a fallback to ensure thumbnails update
      const delay = comingFromSubPage ? 300 : 150;
      
      if (comingFromSubPage) {
        console.log('[SYNC EFFECT] Coming from sub-page, will sync after delay to ensure route change effect runs first');
      } else {
        console.log('[SYNC EFFECT] Running sync from localStorage');
      }
      
      // Delay to ensure localStorage is fully updated (longer delay if coming from sub-page)
      setTimeout(() => {
        if (isLoadingFromStorage.current) {
          return;
        }
        
        // CRITICAL: Read latest selections from localStorage (editSelected* keys take priority)
        const editSelectedTexture = localStorage.getItem('editSelectedTexture');
        const editSelectedColor = localStorage.getItem('editSelectedColor');
        const editSelectedLength = localStorage.getItem('editSelectedLength');
        const editSelectedDensity = localStorage.getItem('editSelectedDensity');
        const editSelectedLace = localStorage.getItem('editSelectedLace');
        const editSelectedHairline = localStorage.getItem('editSelectedHairline');
        const editSelectedStyling = localStorage.getItem('editSelectedStyling');
        const editSelectedCapSize = localStorage.getItem('editSelectedCapSize');
        const editSelectedAddOns = localStorage.getItem('editSelectedAddOns');
        
        // Fallback to selected* keys if editSelected* don't exist
        // For BLANCO routes, default to PLATINUM; for others, default to OFF BLACK
        const isBlancoRouteForCurrent = location.pathname.startsWith('/build-a-wig/blanco');
        const defaultColorForCurrent = isBlancoRouteForCurrent ? 'PLATINUM' : 'OFF BLACK';
        const currentTexture = editSelectedTexture || localStorage.getItem('selectedTexture') || 'SILKY';
        const currentColor = editSelectedColor || localStorage.getItem('selectedColor') || defaultColorForCurrent;
        const currentLength = editSelectedLength || localStorage.getItem('selectedLength') || '24"';
        const currentDensity = editSelectedDensity || localStorage.getItem('selectedDensity') || '200%';
        const currentLace = editSelectedLace || localStorage.getItem('selectedLace') || '13X6';
        const currentHairline = editSelectedHairline || localStorage.getItem('selectedHairline') || 'NATURAL';
        const currentStyling = editSelectedStyling || localStorage.getItem('selectedStyling') || 'NONE';
        const currentCapSize = editSelectedCapSize || localStorage.getItem('selectedCapSize') || 'M';
        const currentAddOns = editSelectedAddOns || localStorage.getItem('selectedAddOns') || '[]';
        
        // Always update state from localStorage (use functional update to avoid dependency issues)
        setCustomization(prev => {
          // Parse addOns once
          let parsedAddOns: string[] = [];
          try {
            parsedAddOns = currentAddOns ? JSON.parse(currentAddOns) : [];
          } catch (e) {
            parsedAddOns = [];
          }
          
          // Check if any values differ from current state
          const needsUpdate = 
            currentTexture !== prev.texture ||
            currentColor !== prev.color ||
            currentLength !== prev.length ||
            currentDensity !== prev.density ||
            currentLace !== prev.lace ||
            currentHairline !== prev.hairline ||
            currentStyling !== prev.styling ||
            currentCapSize !== prev.capSize ||
            JSON.stringify(parsedAddOns) !== JSON.stringify(prev.addOns);
          
          if (needsUpdate) {
            console.log('[SYNC FROM STORAGE] Updating customization state from localStorage:', {
              texture: { from: prev.texture, to: currentTexture },
              color: { from: prev.color, to: currentColor },
              length: { from: prev.length, to: currentLength },
              density: { from: prev.density, to: currentDensity },
              lace: { from: prev.lace, to: currentLace },
              hairline: { from: prev.hairline, to: currentHairline },
              styling: { from: prev.styling, to: currentStyling },
              capSize: { from: prev.capSize, to: currentCapSize }
            });
            
            // Update customization state to match localStorage
            // This ensures thumbnails update correctly
            return {
              ...prev,
              texture: currentTexture,
              color: currentColor,
              length: currentLength,
              density: currentDensity,
              lace: currentLace,
              hairline: currentHairline,
              styling: currentStyling,
              capSize: currentCapSize,
              addOns: parsedAddOns
            };
          }
          
          return prev;
        });
      }, delay);
    };
    
    // Listen for customStorageChange events
    window.addEventListener('customStorageChange', handleSyncFromStorage);
    
    // Also trigger sync when component mounts/route changes (in case we missed an event)
    handleSyncFromStorage();
    
    return () => {
      window.removeEventListener('customStorageChange', handleSyncFromStorage);
    };
  }, [location.pathname]); // Removed customization from dependencies to prevent listener re-registration

  // REMOVED: Change detection logic - editing is handled by noir/edit page, not this page
  const [processingTimeText, setProcessingTimeText] = useState('EXPECT 6 - 8 WEEKS OF PROCESSING TIME FOR THIS UNIT.');
  
  // Add to bag button states: 'idle', 'adding', 'added'
  // Initialize button state based on route - edit mode should start as 'added'
  const [addToBagState, setAddToBagState] = useState<'idle' | 'adding' | 'added'>(() => {
    const isEditPage = location.pathname === '/build-a-wig/edit' ||
                       location.pathname === '/build-a-wig/noir/edit' ||
                       location.pathname === '/build-a-wig/blanco/edit' ||
                       location.pathname === '/build-a-wig/soft-wave/edit' ||
                       location.pathname === '/build-a-wig/soft-curl/edit' ||
                       location.pathname === '/build-a-wig/beach-wave/edit' ||
                       location.pathname === '/build-a-wig/ocean-curl/edit';
    if (isEditPage) {
      const editingCartItem = localStorage.getItem('editingCartItem');
      if (editingCartItem) {
        return 'added'; // Edit mode: item is already in cart, show "IN THE BAG"
      }
    }
    return 'idle';
  });
  const [currentConfiguration, setCurrentConfiguration] = useState<string>('');
  
  // Edit mode state: track original item and detect changes
  const [originalItem, setOriginalItem] = useState<WigCustomization | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Cart count state
  const [cartCount, setCartCount] = useState(() => {
    return parseInt(localStorage.getItem('cartCount') || '0');
  });

  // Listen for cart updates to sync cart count and button state
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
        
        // If no lastAddedItemId, don't reset (item was just added)
        if (!lastAddedItemId) {
          return;
        }
        
        // Check if the specific item ID exists in cart items
        const itemStillInCart = cartItems.some((item: any) => item.id === lastAddedItemId);
        
        // Only reset if the specific item is not in cart AND we have a valid lastAddedItemId
        if (!itemStillInCart && lastAddedItemId) {
          setAddToBagState('idle');
          localStorage.removeItem('addToBagButtonState');
          localStorage.removeItem('lastAddedItemId');
        }
      }
    };

    // Listen for custom events
    window.addEventListener('cartCountUpdated', handleCartUpdate);
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    // Also listen for localStorage changes as backup
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cartCount' || e.key === 'cartItems') {
        handleCartUpdate();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    // Simple polling that only runs when button is in 'added' state
    const interval = setInterval(() => {
      // Check current button state from localStorage to avoid stale closure
      const currentButtonState = localStorage.getItem('addToBagButtonState');
      if (currentButtonState === 'added') {
        handleCartUpdate();
      }
    }, 1000); // Check every 1 second, only when needed
    
    return () => {
      window.removeEventListener('cartCountUpdated', handleCartUpdate);
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

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

  // Mobile menu state
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

  // Currency exchange rates (same as CartDropdown)
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

  const generateConfigurationString = () => {
    return `${customization.capSize}-${customization.length}-${customization.density}-${customization.color}-${customization.texture}-${customization.lace}-${customization.hairline}-${customization.styling}-${JSON.stringify(customization.addOns || [])}`;
  };

  // @ts-expect-error - Function kept for potential future use
  const _forceResetButtonState = () => {
    
    
    setAddToBagState('idle');
    // REMOVED: Editing state - editing handled by noir/edit page
    localStorage.removeItem('addToBagButtonState');
    localStorage.removeItem('lastAddedConfiguration');
    
  };

  // Helper functions to get correct icons based on selections
  const getCapSizeIcon = () => {
    // @ts-expect-error - Variable kept for potential future use
    const _selectedCapSize = customization.capSize || 'M';
    return '/assets/cap size-icon.svg'; // All cap sizes use the same icon
  };

  const getLengthIcon = () => {
    const selectedLength = customization.length || '24"';
    if (['16"', '18"', '20"', '22"'].includes(selectedLength)) {
      return '/assets/back length-icon.svg';
    } else if (['24"', '26"', '28"', '30"'].includes(selectedLength)) {
      return '/assets/b length thumb.png';
    } else {
      return '/assets/thigh length thumb.png';
    }
  };

  const getLengthThumbnailSize = () => {
    const selectedLength = customization.length || '24"';
    // First row (16", 18", 20", 22") uses 72px, others use 42px (reduced by 5px)
    if (['16"', '18"', '20"', '22"'].includes(selectedLength)) {
      return '72px';
    } else {
      return '42px';
    }
  };

  const getLengthThumbnailTopPosition = () => {
    const selectedLength = customization.length || '24"';
    // First row (16", 18", 20", 22") uses 50%, others use calc(58% - 1px)
    if (['16"', '18"', '20"', '22"'].includes(selectedLength)) {
      return '50%';
    } else {
      return 'calc(58% - 1px)';
    }
  };

  const getDensityIcon = () => {
    // Check if we're in blanco route (main, customize, edit)
    const isBlancoRoute = location.pathname.startsWith('/build-a-wig/blanco') || 
                         location.pathname.includes('/blanco/customize') || 
                         location.pathname.includes('/blanco/edit');
    if (isBlancoRoute) {
      return '/assets/density-blanco.png';
    }
    return '/assets/density.png'; // All densities use the same icon
  };

  const getLaceIcon = () => {
    // Check if we're in blanco route (main, customize, edit)
    const isBlancoRoute = location.pathname.startsWith('/build-a-wig/blanco') || 
                         location.pathname.includes('/blanco/customize') || 
                         location.pathname.includes('/blanco/edit');
    if (isBlancoRoute) {
      return '/assets/lace-blanco.png';
    }
    
    const selectedLace = customization.lace || '13X6';
    
    // Check for full lace options that use different icons
    if (selectedLace === 'FULL' || selectedLace === '360') {
      return '/assets/lace-icon.svg'; // Full lace uses standard icon
    }
    
    // All other lace types use the same icon
    return '/assets/lace-icon.svg';
  };

  const getTextureIcon = () => {
    // Use blanco texture SVG for blanco customize mode
    const pathname = location.pathname;
    if (pathname.startsWith('/build-a-wig/blanco')) {
      return '/assets/blanco texture.svg';
    }
    return '/assets/Texture-icon.svg'; // Default texture icon for other products
  };

  // @ts-expect-error - Function kept for potential future use
  const _getColorIcon = () => {
    return '/assets/none-icon.svg'; // Color uses a custom color circle, not an icon
  };

  const getHairlineIcon = () => {
    // Check if we're in blanco route (main, customize, edit)
    const isBlancoRoute = location.pathname.startsWith('/build-a-wig/blanco') || 
                         location.pathname.includes('/blanco/customize') || 
                         location.pathname.includes('/blanco/edit');
    if (isBlancoRoute) {
      return '/assets/hairline-blanco.png';
    }
    
    const selectedHairline = customization.hairline || 'NATURAL';
    
    // Handle comma-separated values (multiple selections)
    const hairlineArray = selectedHairline.split(',');
    const correctOrder = ['NATURAL', 'LAGOS', 'PEAK'];
    
    // Sort selections according to the correct order and get the first one
    const sortedSelections = hairlineArray.sort((a, b) => {
      const indexA = correctOrder.indexOf(a);
      const indexB = correctOrder.indexOf(b);
      return indexA - indexB;
    });
    
    const firstHairline = sortedSelections[0];
    
    switch (firstHairline) {
      case 'NATURAL':
        return '/assets/Natural Hairline-icon.svg';
      case 'LAGOS':
        return '/assets/Lagos Hairline-icon.svg';
      case 'PEAK':
        return '/assets/Peak Hairline-icon.svg';
      default:
        return '/assets/Natural Hairline-icon.svg';
    }
  };

  const getHairlineDisplayText = () => {
    const selectedHairline = customization.hairline || 'NATURAL';
    
    // Handle comma-separated values (multiple selections)
    const hairlineArray = selectedHairline.split(',');
    const correctOrder = ['NATURAL', 'LAGOS', 'PEAK'];
    
    // Sort selections according to the correct order
    const sortedSelections = hairlineArray.sort((a, b) => {
      const indexA = correctOrder.indexOf(a);
      const indexB = correctOrder.indexOf(b);
      return indexA - indexB;
    });
    
    const firstHairline = sortedSelections[0];
    const additionalCount = sortedSelections.length - 1;
    
    if (additionalCount > 0) {
      return `${firstHairline} +${additionalCount}`;
    } else {
      return firstHairline;
    }
  };

  const getStylingIcon = () => {
    const selectedHairStyling = customization.styling || 'NONE';
    
    // If hair styling is selected, show the first one's icon
    if (selectedHairStyling && selectedHairStyling !== 'NONE') {
      const hairStylingIconMap: { [key: string]: string } = {
        'BANGS': '/assets/Bangs-icon.svg',
        'CRIMPS': '/assets/Crimps-icon.svg',
        'FLAT IRON': '/assets/Flat iron-icon.svg',
        'LAYERS': '/assets/Layers-icon.svg'
      };
      
      // Handle comma-separated values (multiple selections)
      const stylingArray = selectedHairStyling.split(',');
      const correctOrder = ['BANGS', 'CRIMPS', 'FLAT IRON', 'LAYERS'];
      
      // Sort selections according to the correct order and get the first one
      const sortedSelections = stylingArray.sort((a, b) => {
        const indexA = correctOrder.indexOf(a);
        const indexB = correctOrder.indexOf(b);
        return indexA - indexB;
      });
      
      const firstStyling = sortedSelections[0];
      return firstStyling ? hairStylingIconMap[firstStyling] || '/assets/none-icon.svg' : '/assets/none-icon.svg';
    }
    
    // If no hair styling is selected, show none icon
    return '/assets/none-icon.svg';
  };

  const getStylingIconSize = () => {
    const selectedHairStyling = customization.styling || 'NONE';
    
    // If no hair styling is selected, return smaller size for none icon
    if (!selectedHairStyling || selectedHairStyling === 'NONE') {
      return '35px'; // Reduced by 45px from default 80px
    }
    
    // Return default size for selected styling icons
    return '80px';
  };

  const getStylingIconTopPosition = () => {
    const selectedHairStyling = customization.styling || 'NONE';
    
    // If no hair styling is selected, return original position for none icon
    if (!selectedHairStyling || selectedHairStyling === 'NONE') {
      return '55%'; // Original position for none icon
    }
    
    // Return moved-up position for selected styling icons
    return '52.5%'; // Moved up 2px (2.5% of 80px container)
  };

  const getStylingDisplayText = () => {
    const selectedHairStyling = customization.styling || 'NONE';
    
    // If hair styling is selected, show the first one + count
    if (selectedHairStyling && selectedHairStyling !== 'NONE') {
      const stylingArray = selectedHairStyling.split(',');
      const correctOrder = ['BANGS', 'CRIMPS', 'FLAT IRON', 'LAYERS'];
      
      // Sort selections according to the correct order
      const sortedSelections = stylingArray.sort((a, b) => {
        const indexA = correctOrder.indexOf(a);
        const indexB = correctOrder.indexOf(b);
        return indexA - indexB;
      });
      
      const firstStyling = sortedSelections[0];
      const additionalCount = sortedSelections.length - 1;
      
      if (additionalCount > 0) {
        return `${firstStyling} +${additionalCount}`;
      } else {
        return firstStyling;
      }
    }
    
    // If no hair styling is selected, show NONE
    return 'NONE';
  };

  const getAddOnsIcon = () => {
    const selectedAddOns = customization.addOns || [];
    if (selectedAddOns && selectedAddOns.length > 0) {
      // Addon icon mapping based on the addon sub page
      const addOnIconMap: { [key: string]: string } = {
        'BLEACH': '/assets/Bleach-icon.svg',
        'PLUCK': '/assets/Pluck-icon.svg',
        'BLUNT CUT': '/assets/clip ends-icon.svg'
      };
      
      // Show the first selected addon icon
      const firstAddOn = selectedAddOns[0];
      return firstAddOn ? (addOnIconMap[firstAddOn] || '/assets/none-icon.svg') : '/assets/none-icon.svg';
    } else {
      return '/assets/none-icon.svg';
    }
  };

  const getAddOnsIconSize = () => {
    const selectedAddOns = customization.addOns || [];
    
    // If no add-ons are selected, return smaller size for none icon
    if (!selectedAddOns || selectedAddOns.length === 0) {
      return '35px'; // Reduced by 45px from default 80px
    }
    
    // Return default size for selected add-on icons
    return '80px';
  };

  const getAddOnsThumbnailTopPosition = () => {
    const selectedAddOns = customization.addOns || [];
    
    // If no add-ons are selected, return original position for none icon
    if (!selectedAddOns || selectedAddOns.length === 0) {
      return '55%'; // Original position for none icon
    }
    
    const hasBleach = selectedAddOns.includes('BLEACH');
    const hasOnlyBleach = selectedAddOns.length === 1 && hasBleach;
    
    // Only move up if ONLY bleach is selected (not in combination with other add-ons)
    if (hasOnlyBleach) {
      return '52.5%'; // Moved up 2px for bleach only
    }
    
    // Return original position for all other cases (none, other add-ons, combinations)
    return '55%';
  };

  const getAddOnsDisplayText = () => {
    const selectedAddOns = customization.addOns || [];
    if (selectedAddOns && selectedAddOns.length > 0) {
      const firstAddOn = selectedAddOns[0];
      const additionalCount = selectedAddOns.length - 1;
      
      if (additionalCount > 0) {
        return `${firstAddOn} +${additionalCount}`;
      } else {
        return firstAddOn;
      }
    } else {
      return 'NONE';
    }
  };

  const getSelectedColorCode = () => {
    const pathname = location.pathname;
    const isBlancoRoute = pathname.startsWith('/build-a-wig/blanco');
    const selectedColor = customization.color || (isBlancoRoute ? 'PLATINUM' : 'OFF BLACK');
    
    // Color mapping based on the color sub page
    const colorMap: { [key: string]: string } = {
      // Blanco colors
      'GOLDEN': '#FBF08B',
      'PLATINUM': '#F6F3D2',
      'ASH': '#E5E3CB',
      // Noir/other colors
      'JET BLACK': '#000000',
      'OFF BLACK': '#2A2424',
      'ESPRESSO': '#3B1301',
      'CHESTNUT': '#6C2D11',
      'HONEY': '#C58628',
      'AUBURN': '#9C5617',
      'COPPER': '#802F02',
      'GINGER': '#F64F07',
      'SANGRIA': '#7E0A1E',
      'CHERRY': '#D70808',
      'RASPBERRY': '#EF0461',
      'PLUM': '#640E82',
      'COBALT': '#290481',
      'TEAL': '#46EBCA',
      'SLIME': '#03D92A',
      'CITRINE': '#E2E91C'
    };
    
    // Default to PLATINUM for blanco routes, OFF BLACK for others
    return colorMap[selectedColor] || (isBlancoRoute ? '#F6F3D2' : '#2A2424');
  };

  // Get wig views based on selected hairline from customization state
  // Use useMemo to recalculate when customization.hairline changes or route changes
  const baseWigViewsForHub = useMemo(() => {
    const pathname = location.pathname;
    
    // Check if we're in product-specific routes (main, customize, edit)
    if (pathname.startsWith('/build-a-wig/blanco')) {
      return [
        '/assets/2D BLANCO LEFT.png',
        '/assets/2D BLANCO FRONT.png',
        '/assets/2D BLANCO RIGHT.png'
      ];
    }
    
    if (pathname.startsWith('/build-a-wig/soft-wave')) {
      return [
        '/assets/2D WAVY LEFT.png',
        '/assets/2D WAVY FRONT.png',
        '/assets/2D WAVY RIGHT.png'
      ];
    }
    
    if (pathname.startsWith('/build-a-wig/soft-curl') || pathname.startsWith('/build-a-wig/ocean-curl')) {
      return [
        '/assets/2D CURLY LEFT.png',
        '/assets/2D CURLY FRONT.png',
        '/assets/2D CURLY RIGHT.png'
      ];
    }
    
    if (pathname.startsWith('/build-a-wig/beach-wave')) {
      return [
        '/assets/2D WAVY LEFT.png',
        '/assets/2D WAVY FRONT.png',
        '/assets/2D WAVY RIGHT.png'
      ];
    }
    
    if (pathname.startsWith('/build-a-wig/noir')) {
      // Noir uses hairline-based views, handled below
    }
    
    // Use the hairline from customization state instead of localStorage
    const selectedHairline = customization.hairline || 'NATURAL';
    const hasPeak = selectedHairline.includes('PEAK');
    const hasLagos = selectedHairline.includes('LAGOS');
    
    if (hasPeak) {
      return [
        '/assets/peak left.png',
        '/assets/peak front.png', 
        '/assets/peak right.png'
      ];
    } else if (hasLagos) {
      return [
        '/assets/lagos left.png',
        '/assets/lagos front.png',
        '/assets/lagos right.png'
      ];
    } else {
      // Default to natural images
      return [
        '/assets/natural left.png',
        '/assets/natural front.png',
        '/assets/natural right.png'
      ];
    }
  }, [customization.hairline, location.pathname]);

  const hubLiveNoirWigViews = useMemo(() => {
    const pathname = location.pathname;
    if (pathname === '/build-a-wig') return null;
    if (!pathname.startsWith('/build-a-wig/noir')) return null;
    try {
      if (!isAdminEmail(getCurrentUserEmailFromStorage() || '')) return null;
    } catch {
      return null;
    }
    return liveNoirHubWigViews;
  }, [location.pathname, liveNoirHubWigViews]);

  const wigViews =
    location.pathname === '/build-a-wig' ? DEFAULT_GLOBAL_BAW_HUB_WIG_VIEWS : hubLiveNoirWigViews ?? baseWigViewsForHub;

  useEffect(() => {
    if (location.pathname === '/build-a-wig') {
      setLiveNoirHubWigViews(null);
    }
  }, [location.pathname]);

  useEffect(() => {
    const refresh = () => {
      if (typeof window !== 'undefined' && window.location.pathname === '/build-a-wig') {
        setLiveNoirHubWigViews(null);
        return;
      }
      try {
        if (!isAdminEmail(getCurrentUserEmailFromStorage() || '')) {
          setLiveNoirHubWigViews(null);
          return;
        }
        setLiveNoirHubWigViews(resolveAdminNoirHubLiveWigViewsFromStorage(location.pathname));
      } catch {
        setLiveNoirHubWigViews(null);
      }
    };
    refresh();
    window.addEventListener(BAW_NOIR_LIVE_COLOR_VIEWS_EVENT, refresh);
    window.addEventListener(BAW_NOIR_LIVE_STYLING_VIEWS_EVENT, refresh);
    window.addEventListener(BAW_NOIR_LIVE_BANGS_VIEWS_EVENT, refresh);
    window.addEventListener('customStorageChange', refresh);
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);
    window.addEventListener('signInStateChanged', refresh as EventListener);
    return () => {
      window.removeEventListener(BAW_NOIR_LIVE_COLOR_VIEWS_EVENT, refresh);
      window.removeEventListener(BAW_NOIR_LIVE_STYLING_VIEWS_EVENT, refresh);
      window.removeEventListener(BAW_NOIR_LIVE_BANGS_VIEWS_EVENT, refresh);
      window.removeEventListener('customStorageChange', refresh);
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('signInStateChanged', refresh as EventListener);
    };
  }, [customization.styling, location.pathname]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // REMOVED: Load saved selections - this page never loads from localStorage
  // Editing is handled by noir/edit page, not this page
  // This page ALWAYS shows defaults

  // REMOVED: Storage change listener - this page never syncs from localStorage
  // Editing is handled by noir/edit page, not this page

  // Initialize default price values and reset them if defaults are selected
  // CRITICAL: Skip this effect when loading from storage or returning from sub-pages to avoid overwriting saved prices
  useEffect(() => {
    // Skip if we're currently loading from localStorage (to avoid overwriting prices saved by sub-pages)
    if (isLoadingFromStorage.current) {
      return;
    }
    
    // CRITICAL: Skip in edit mode - prices are managed by route change effect and sub-pages
    const isEditMode = (location.pathname === '/build-a-wig/edit' ||
                       location.pathname === '/build-a-wig/noir/edit' ||
                       location.pathname === '/build-a-wig/blanco/edit' ||
                       location.pathname === '/build-a-wig/soft-wave/edit' ||
                       location.pathname === '/build-a-wig/soft-curl/edit' ||
                       location.pathname === '/build-a-wig/beach-wave/edit' ||
                       location.pathname === '/build-a-wig/ocean-curl/edit') && localStorage.getItem('editingCartItem') !== null;
    if (isEditMode) {
      return; // Don't overwrite prices in edit mode
    }
    
    // Skip if we just came from a sub-page (prices were already saved by route change effect)
    const comingFromSubPage = sessionStorage.getItem('comingFromSubPage') === 'true';
    if (comingFromSubPage) {
      return;
    }
    
    // Check if current selections match defaults
    const defaults = {
      capSize: 'M',
      length: '24"',
      density: '200%',
      lace: '13X6',
      texture: 'SILKY',
      color: 'OFF BLACK',
      hairline: 'NATURAL',
      styling: 'NONE',
      addOns: [],
    };
    
    const savedCapSize = localStorage.getItem('selectedCapSize');
    const savedLength = localStorage.getItem('selectedLength');
    const savedDensity = localStorage.getItem('selectedDensity');
    const savedLace = localStorage.getItem('selectedLace');
    const savedTexture = localStorage.getItem('selectedTexture');
    const savedColor = localStorage.getItem('selectedColor');
    const savedHairline = localStorage.getItem('selectedHairline');
    const savedStyling = localStorage.getItem('selectedStyling');
    const savedAddOns = localStorage.getItem('selectedAddOns');
    
    const isDefaultSelection = 
      (!savedCapSize || savedCapSize === defaults.capSize) &&
      (!savedLength || savedLength === defaults.length) &&
      (!savedDensity || savedDensity === defaults.density) &&
      (!savedLace || savedLace === defaults.lace) &&
      (!savedTexture || savedTexture === defaults.texture) &&
      (!savedColor || savedColor === defaults.color) &&
      (!savedHairline || savedHairline === defaults.hairline) &&
      (!savedStyling || savedStyling === defaults.styling) &&
      (!savedAddOns || JSON.parse(savedAddOns || '[]').length === 0);
    
    // If defaults are selected, ALWAYS reset all prices to 0
    // Remove items first to clear any stale values, then set to 0
    if (isDefaultSelection) {
      localStorage.removeItem('selectedCapSizePrice');
      localStorage.removeItem('selectedColorPrice');
      localStorage.removeItem('selectedLengthPrice');
      localStorage.removeItem('selectedDensityPrice');
      localStorage.removeItem('selectedLacePrice');
      localStorage.removeItem('selectedTexturePrice');
      localStorage.removeItem('selectedHairlinePrice');
      localStorage.removeItem('selectedStylingPrice');
      localStorage.removeItem('selectedAddOnsPrice');
      
      localStorage.setItem('selectedCapSizePrice', '0');
      localStorage.setItem('selectedColorPrice', '0');
      localStorage.setItem('selectedLengthPrice', '0');
      localStorage.setItem('selectedDensityPrice', '0');
      localStorage.setItem('selectedLacePrice', '0');
      localStorage.setItem('selectedTexturePrice', '0');
      localStorage.setItem('selectedHairlinePrice', '0');
      localStorage.setItem('selectedStylingPrice', '0');
      localStorage.setItem('selectedAddOnsPrice', '0');
    } else {
      // CRITICAL: Only initialize prices to 0 if they don't exist AND cap size is NOT a flexible cap
      // Flexible caps (XXS/XS/S, S/M/L) should preserve their $40 price
      const currentCapSize = savedCapSize || defaults.capSize;
      const isFlexibleCap = currentCapSize === 'XXS/XS/S' || currentCapSize === 'S/M/L';
      
      // CRITICAL: Check both selectedCapSizePrice and editSelectedCapSizePrice (for edit mode)
      // Only initialize if NEITHER exists
      const selectedCapSizePrice = localStorage.getItem('selectedCapSizePrice');
      const editSelectedCapSizePrice = localStorage.getItem('editSelectedCapSizePrice');
      
      if (!selectedCapSizePrice && !editSelectedCapSizePrice) {
        // Neither exists - initialize based on cap size
        localStorage.setItem('selectedCapSizePrice', isFlexibleCap ? '40' : '0');
        // Also set editSelectedCapSizePrice if in edit mode (though we already skipped edit mode above)
      } else if (selectedCapSizePrice && isFlexibleCap && selectedCapSizePrice === '0') {
        // Price exists but is wrong (0 instead of 40 for flexible cap) - fix it
        localStorage.setItem('selectedCapSizePrice', '40');
      } else if (editSelectedCapSizePrice && isFlexibleCap && editSelectedCapSizePrice === '0') {
        // Edit price exists but is wrong (0 instead of 40 for flexible cap) - fix it
        localStorage.setItem('editSelectedCapSizePrice', '40');
      }
      
      if (!localStorage.getItem('selectedColorPrice')) {
        localStorage.removeItem('selectedColorPrice');
        localStorage.setItem('selectedColorPrice', '0');
      }
      if (!localStorage.getItem('selectedLengthPrice')) {
        localStorage.removeItem('selectedLengthPrice');
        localStorage.setItem('selectedLengthPrice', '0');
      }
      if (!localStorage.getItem('selectedDensityPrice')) {
        localStorage.removeItem('selectedDensityPrice');
        localStorage.setItem('selectedDensityPrice', '0');
      }
      if (!localStorage.getItem('selectedLacePrice')) {
        localStorage.removeItem('selectedLacePrice');
        localStorage.setItem('selectedLacePrice', '0');
      }
      if (!localStorage.getItem('selectedTexturePrice')) {
        localStorage.removeItem('selectedTexturePrice');
        localStorage.setItem('selectedTexturePrice', '0');
      }
      if (!localStorage.getItem('selectedHairlinePrice')) {
        localStorage.removeItem('selectedHairlinePrice');
        localStorage.setItem('selectedHairlinePrice', '0');
      }
      if (!localStorage.getItem('selectedStylingPrice')) {
        localStorage.removeItem('selectedStylingPrice');
        localStorage.setItem('selectedStylingPrice', '0');
      }
      if (!localStorage.getItem('selectedAddOnsPrice')) {
        localStorage.removeItem('selectedAddOnsPrice');
        localStorage.setItem('selectedAddOnsPrice', '0');
      }
    }
  }, [customization]);
  
  useEffect(() => {
    const calculatePrice = () => {
      // DEBUGGING: ALWAYS log to verify function is running
      console.log('[PRICE CALCULATION] Function called', {
        pathname: location.pathname,
        timestamp: new Date().toISOString()
      });
      
      let total = basePrice;
      
      // Check which mode we're in for ALL products
      const editingCartItem = localStorage.getItem('editingCartItem');
      const isEditMode = (location.pathname === '/build-a-wig/edit' ||
                         location.pathname === '/build-a-wig/noir/edit' ||
                         location.pathname === '/build-a-wig/blanco/edit' ||
                         location.pathname === '/build-a-wig/soft-wave/edit' ||
                         location.pathname === '/build-a-wig/soft-curl/edit' ||
                         location.pathname === '/build-a-wig/beach-wave/edit' ||
                         location.pathname === '/build-a-wig/ocean-curl/edit') && editingCartItem !== null;
      const isCustomizeMode = location.pathname.startsWith('/build-a-wig/noir/customize') || 
                              location.pathname.startsWith('/build-a-wig/blanco/customize') ||
                              location.pathname.startsWith('/build-a-wig/soft-wave/customize') ||
                              location.pathname.startsWith('/build-a-wig/soft-curl/customize') ||
                              location.pathname.startsWith('/build-a-wig/beach-wave/customize') ||
                              location.pathname.startsWith('/build-a-wig/ocean-curl/customize');
      
      // CRITICAL: In edit mode with no changes, use the cart item's price so edit page matches cart.
      // This avoids the $560 (or similar) miscalculation caused by stale editSelected*Price from a
      // previous product or effect order (price effect running before route change populates from item).
      let editModeCartPrice: number | null = null;
      if (isEditMode && editingCartItem) {
        try {
          const item = JSON.parse(editingCartItem);
          editModeCartPrice = typeof item.price === 'number' ? item.price : null;
          if (!hasChanges && editModeCartPrice !== null && editModeCartPrice > 0) {
            setTotalPrice(editModeCartPrice);
            return;
          }
        } catch (e) {
          // Fall through to calculated total
        }
      }
      
      // DEBUGGING: Always log when on edit route to verify detection
      console.log('[EDIT MODE DETECTION]', {
        pathname: location.pathname,
        editingCartItem: editingCartItem !== null ? 'exists' : 'null',
        editingCartItemValue: editingCartItem ? 'has value' : 'null',
        isEditMode,
        customization,
        timestamp: new Date().toISOString()
      });
      
      // Determine the correct prefix based on mode
      let prefix = 'selected';
      if (isEditMode) {
        prefix = 'editSelected';
      } else if (isCustomizeMode) {
        prefix = 'customizeSelected';
      }
      
      // CRITICAL: In edit mode or customize mode, read current selections directly from localStorage
      // This ensures we always use the latest values, not stale state
      let currentCustomization = customization;
      if (isEditMode) {
        // Read latest selections from localStorage to avoid stale state
        // CRITICAL: Also check editingCartItem as fallback to ensure we have the original values
        const editingCartItem = localStorage.getItem('editingCartItem');
        let editingItemData = null;
        if (editingCartItem) {
          try {
            editingItemData = JSON.parse(editingCartItem);
          } catch (e) {
            // Ignore parse errors
          }
        }
        
        currentCustomization = {
          capSize: localStorage.getItem('editSelectedCapSize') || localStorage.getItem('selectedCapSize') || editingItemData?.capSize || 'M',
          length: localStorage.getItem('editSelectedLength') || localStorage.getItem('selectedLength') || editingItemData?.length || '24"',
          density: localStorage.getItem('editSelectedDensity') || localStorage.getItem('selectedDensity') || editingItemData?.density || '200%',
          color: (() => {
            const savedColor = localStorage.getItem('editSelectedColor') || localStorage.getItem('selectedColor') || editingItemData?.color;
            // For BLANCO routes, validate color is valid BLANCO color
            const isBlancoRouteForDefault = location.pathname.startsWith('/build-a-wig/blanco');
            if (savedColor) {
              // If it's a BLANCO route and color is invalid, default to PLATINUM
              if (isBlancoRouteForDefault || editingItemData?.name === 'BLANCO') {
                const validBlancoColors = ['GOLDEN', 'PLATINUM', 'ASH'];
                if (validBlancoColors.includes(savedColor)) {
                  return savedColor;
                } else {
                  // Invalid color for BLANCO, default to PLATINUM
                  return 'PLATINUM';
                }
              }
              return savedColor;
            }
            // For BLANCO routes, default to PLATINUM; for others, default to OFF BLACK
            return isBlancoRouteForDefault ? 'PLATINUM' : 'OFF BLACK';
          })(),
          texture: localStorage.getItem('editSelectedTexture') || localStorage.getItem('selectedTexture') || editingItemData?.texture || 'SILKY',
          lace: localStorage.getItem('editSelectedLace') || localStorage.getItem('selectedLace') || editingItemData?.lace || '13X6',
          hairline: localStorage.getItem('editSelectedHairline') || localStorage.getItem('selectedHairline') || editingItemData?.hairline || 'NATURAL',
          styling: localStorage.getItem('editSelectedStyling') || localStorage.getItem('selectedStyling') || editingItemData?.styling || 'NONE',
          addOns: JSON.parse(localStorage.getItem('editSelectedAddOns') || localStorage.getItem('selectedAddOns') || JSON.stringify(editingItemData?.addOns || []))
        };
        
        // DEBUGGING: Log currentCustomization in edit mode with detailed localStorage values
        console.log('[EDIT MODE] currentCustomization built from localStorage:', {
          ...currentCustomization,
          localStorageValues: {
            editSelectedTexture: localStorage.getItem('editSelectedTexture'),
            selectedTexture: localStorage.getItem('selectedTexture'),
            editSelectedTexturePrice: localStorage.getItem('editSelectedTexturePrice'),
            selectedTexturePrice: localStorage.getItem('selectedTexturePrice')
          }
        });
      } else if (isCustomizeMode) {
        // CRITICAL: In customize mode, read current selections from customizeSelected* keys
        // This ensures we use the selections made in customize mode sub-pages
        currentCustomization = {
          capSize: localStorage.getItem('customizeSelectedCapSize') || localStorage.getItem('selectedCapSize') || 'M',
          length: localStorage.getItem('customizeSelectedLength') || localStorage.getItem('selectedLength') || '24"',
          density: localStorage.getItem('customizeSelectedDensity') || localStorage.getItem('selectedDensity') || '200%',
          color: (() => {
            const savedColor = localStorage.getItem('customizeSelectedColor') || localStorage.getItem('selectedColor');
            if (savedColor) return savedColor;
            // For BLANCO routes, default to PLATINUM; for others, default to OFF BLACK
            const isBlancoRouteForDefault = location.pathname.startsWith('/build-a-wig/blanco');
            return isBlancoRouteForDefault ? 'PLATINUM' : 'OFF BLACK';
          })(),
          texture: localStorage.getItem('customizeSelectedTexture') || localStorage.getItem('selectedTexture') || 'SILKY',
          lace: localStorage.getItem('customizeSelectedLace') || localStorage.getItem('selectedLace') || '13X6',
          hairline: localStorage.getItem('customizeSelectedHairline') || localStorage.getItem('selectedHairline') || 'NATURAL',
          styling: localStorage.getItem('customizeSelectedStyling') || localStorage.getItem('selectedStyling') || 'NONE',
          addOns: JSON.parse(localStorage.getItem('customizeSelectedAddOns') || localStorage.getItem('selectedAddOns') || '[]')
        };
        
        // DEBUGGING: Log currentCustomization in customize mode
        console.log('[CUSTOMIZE MODE] currentCustomization built from localStorage:', {
          ...currentCustomization,
          localStorageValues: {
            customizeSelectedTexture: localStorage.getItem('customizeSelectedTexture'),
            selectedTexture: localStorage.getItem('selectedTexture'),
            customizeSelectedTexturePrice: localStorage.getItem('customizeSelectedTexturePrice'),
            selectedTexturePrice: localStorage.getItem('selectedTexturePrice')
          }
        });
      }
      
      // DEBUGGING: Log edit mode price calculation
      if (isEditMode) {
        console.log('[EDIT MODE PRICE CALCULATION]', {
          mode: 'EDIT',
          prefix,
          customization: currentCustomization,
          basePrice,
          editingCartItem: editingCartItem ? 'exists' : 'null',
          timestamp: new Date().toISOString()
        });
      }
      
      // DEBUGGING: Log customize mode price calculation
      if (isCustomizeMode) {
        console.log('[CUSTOMIZE MODE PRICE CALCULATION]', {
          mode: 'CUSTOMIZE',
          prefix,
          customization: currentCustomization,
          basePrice,
          timestamp: new Date().toISOString()
        });
      }
      
      // CRITICAL: Always recalculate prices from current selections (from localStorage in edit/customize mode)
      // This ensures prices are always correct even after many edits
      const calculatedPrices = calculatePricesFromSelections(currentCustomization);
      
      // DEBUGGING: Log calculated prices
      if (isEditMode) {
        console.log('[EDIT MODE] Calculated prices from selections:', calculatedPrices);
        console.log('[EDIT MODE] Input to calculatePricesFromSelections:', {
          capSize: currentCustomization.capSize,
          length: currentCustomization.length,
          density: currentCustomization.density,
          color: currentCustomization.color,
          texture: currentCustomization.texture,
          lace: currentCustomization.lace,
          hairline: currentCustomization.hairline,
          styling: currentCustomization.styling,
          addOns: currentCustomization.addOns
        });
      }
      
      // DEBUGGING: Log calculated prices for customize mode
      if (isCustomizeMode) {
        console.log('[CUSTOMIZE MODE] Calculated prices from selections:', calculatedPrices);
        console.log('[CUSTOMIZE MODE] Input to calculatePricesFromSelections:', {
          capSize: currentCustomization.capSize,
          length: currentCustomization.length,
          density: currentCustomization.density,
          color: currentCustomization.color,
          texture: currentCustomization.texture,
          lace: currentCustomization.lace,
          hairline: currentCustomization.hairline,
          styling: currentCustomization.styling,
          addOns: currentCustomization.addOns
        });
      }
      
      // Get prices from localStorage with fallback to calculated prices
      // This ensures we use saved prices when available, but always have correct fallback
      const getPrice = (key: string, calculatedValue: number) => {
        const primaryKey = `${prefix}${key}Price`;
        const fallbackKey = `selected${key}Price`;
        const primaryValue = localStorage.getItem(primaryKey);
        const fallbackValue = localStorage.getItem(fallbackKey);
        
        // DEBUGGING: Log price lookup for edit mode and customize mode
        if (isEditMode || isCustomizeMode) {
          console.log(`[EDIT MODE] ${key} price lookup:`, {
            primaryKey,
            primaryValue,
            fallbackKey,
            fallbackValue,
            calculatedValue,
            using: primaryValue && !isNaN(parseFloat(primaryValue)) ? 'primary' : 
                   fallbackValue && !isNaN(parseFloat(fallbackValue)) ? 'fallback' : 'calculated'
          });
        }
        
        // CRITICAL: For cap size price, use current selection — never apply stored price from another product/session.
        // Non-flexible cap (e.g. M) = $0; flexible (XXS/XS/S, S/M/L) = $40.
        if (key === 'CapSize') {
          const currentCapSize = currentCustomization.capSize || 'M';
          const isFlexibleCap = currentCapSize === 'XXS/XS/S' || currentCapSize === 'S/M/L';
          
          console.log('[FLEX_CAP_DEBUG] GET_PRICE - CapSize price lookup:', {
            currentCapSize,
            isFlexibleCap,
            primaryKey,
            primaryValue,
            fallbackKey,
            fallbackValue,
            calculatedValue,
            timestamp: new Date().toISOString()
          });
          
          // For default cap (non-flexible), always use calculated value (0). Stored 40 from a previous flex selection must not apply.
          if (!isFlexibleCap) {
            console.log('[FLEX_CAP_DEBUG] GET_PRICE - Non-flexible cap, using calculated:', calculatedValue);
            return calculatedValue;
          }
          // Flexible cap: use stored value if valid, else calculated (40)
          if (primaryValue !== null && primaryValue !== undefined && primaryValue !== '' && !isNaN(parseFloat(primaryValue))) {
            const parsedValue = parseFloat(primaryValue);
            if (parsedValue === 0 && calculatedValue === 40) return calculatedValue;
            return parsedValue;
          }
          if (fallbackValue !== null && fallbackValue !== undefined && fallbackValue !== '' && !isNaN(parseFloat(fallbackValue))) {
            const parsedValue = parseFloat(fallbackValue);
            if (parsedValue === 0 && calculatedValue === 40) return calculatedValue;
            return parsedValue;
          }
          return calculatedValue;
        }

        // CRITICAL: Blanco default density is 250% (included in base price = $0). Do not use a stored $80 from Noir/other products.
        if (key === 'Density') {
          const isBlancoRoute = location.pathname.startsWith('/build-a-wig/blanco');
          const density = currentCustomization.density || '';
          if (isBlancoRoute && density === '250%') {
            return calculatedValue; // Always 0 for Blanco 250%
          }
        }
        
        // Use localStorage value if it exists and is valid (including negative values), otherwise use calculated value
        // CRITICAL: Check that value exists, is not empty, and is a valid number (including negative)
        if (primaryValue !== null && primaryValue !== undefined && primaryValue !== '' && !isNaN(parseFloat(primaryValue))) {
          const parsedValue = parseFloat(primaryValue);
          // Return the parsed value (can be negative)
          return parsedValue;
        } else if (fallbackValue !== null && fallbackValue !== undefined && fallbackValue !== '' && !isNaN(parseFloat(fallbackValue))) {
          const parsedValue = parseFloat(fallbackValue);
          // Return the parsed value (can be negative)
          return parsedValue;
        } else {
          // Fallback to calculated price to ensure accuracy
          return calculatedValue;
        }
      };
      
      // CRITICAL: In edit mode, use CALCULATED prices only (from current selections). Do NOT read from localStorage
      // for the total. Stale editSelected*Price from another product or session can contain full total or wrong sum,
      // causing the displayed/saved price to double or be wrong.
      const capSizePrice = isEditMode ? calculatedPrices.capSizePrice : getPrice('CapSize', calculatedPrices.capSizePrice);
      
      console.log('[FLEX_CAP_DEBUG] CALCULATE_PRICE - After getPrice:', {
        capSizePrice,
        calculatedCapSizePrice: calculatedPrices.capSizePrice,
        currentCapSize: currentCustomization.capSize,
        isFlexibleCap: currentCustomization.capSize === 'XXS/XS/S' || currentCustomization.capSize === 'S/M/L',
        prefix,
        primaryKey: `${prefix}CapSizePrice`,
        primaryValue: localStorage.getItem(`${prefix}CapSizePrice`),
        fallbackValue: localStorage.getItem('selectedCapSizePrice'),
        timestamp: new Date().toISOString()
      });
      
      // Customize mode: same bug as edit — stale `customizeSelectedColorPrice` (e.g. "0") must not override
      // the correct amount when the user picks a paid color on the color sub-page.
      const colorPrice =
        isEditMode || isCustomizeMode ? calculatedPrices.colorPrice : getPrice('Color', calculatedPrices.colorPrice);
      const lengthPrice = isEditMode ? calculatedPrices.lengthPrice : getPrice('Length', calculatedPrices.lengthPrice);
      const densityPrice = isEditMode ? calculatedPrices.densityPrice : getPrice('Density', calculatedPrices.densityPrice);
      const lacePrice = isEditMode ? calculatedPrices.lacePrice : getPrice('Lace', calculatedPrices.lacePrice);
      const texturePrice = isEditMode ? calculatedPrices.texturePrice : getPrice('Texture', calculatedPrices.texturePrice);
      const hairlinePrice = isEditMode ? calculatedPrices.hairlinePrice : getPrice('Hairline', calculatedPrices.hairlinePrice);
      const stylingPrice = isEditMode ? calculatedPrices.stylingPrice : getPrice('Styling', calculatedPrices.stylingPrice);
      const addOnsPrice = isEditMode ? calculatedPrices.addOnsPrice : getPrice('AddOns', calculatedPrices.addOnsPrice);
      
      // Per-addon breakdown for debug (edit/customize)
      const addOnBasePricesForLog: Record<string, number> = { BLEACH: 60, PLUCK: 80, 'BLUNT CUT': 20 };
      const discountedLaceForLog = ['2X6', '4X4', '5X5', '6X6', '7X7'];
      const laceForLog = currentCustomization.lace || '';
      const hasLaceDiscForLog = discountedLaceForLog.includes(laceForLog);
      const addOnsBreakdownForLog: Record<string, number> = {};
      (currentCustomization.addOns || []).forEach((id: string) => {
        let p = addOnBasePricesForLog[id] ?? 0;
        if (hasLaceDiscForLog && (id === 'BLEACH' || id === 'PLUCK')) p -= 20;
        addOnsBreakdownForLog[id] = p;
      });
      const addOnsBreakdownSumForLog = Object.values(addOnsBreakdownForLog).reduce((a, b) => a + b, 0);
      // DEBUGGING: Log all prices being used
      const modeLabel = isEditMode ? 'EDIT MODE' : isCustomizeMode ? 'CUSTOMIZE MODE' : 'NON-EDIT MODE';
      console.log(`[${modeLabel}] All prices:`, {
        basePrice,
        capSizePrice,
        colorPrice,
        lengthPrice,
        densityPrice,
        lacePrice,
        texturePrice,
        hairlinePrice,
        stylingPrice,
        addOnsPrice,
        addOnsDetail: { selected: currentCustomization.addOns || [], lace: laceForLog, laceDiscount: hasLaceDiscForLog, perAddon: addOnsBreakdownForLog, perAddonSum: addOnsBreakdownSumForLog },
        sum: capSizePrice + colorPrice + lengthPrice + densityPrice + lacePrice + texturePrice + hairlinePrice + stylingPrice + addOnsPrice,
        prefix
      });
      
      // Add all the actual prices
      total += capSizePrice + colorPrice + lengthPrice + densityPrice + lacePrice + texturePrice + hairlinePrice + stylingPrice + addOnsPrice;
      
      // DEBUGGING: Log final total
      console.log(`[${modeLabel}] Final total:`, {
        basePrice,
        additions: capSizePrice + colorPrice + lengthPrice + densityPrice + lacePrice + texturePrice + hairlinePrice + stylingPrice + addOnsPrice,
        total,
        prefix
      });
      
      // CRITICAL: Trigger change detection after price calculation (for both edit and non-edit modes)
      // This ensures hasChanges is updated when prices change
      if (isEditMode) {
        setTimeout(() => {
          detectChanges();
        }, 150);
      }
      
      setTotalPrice(total);
      
      // CRITICAL: In edit mode, ensure prices are saved to localStorage after calculation
      // BUT: Skip if we just came from a sub-page (prices were already saved by sub-page and route change effect)
      if (isEditMode) {
        const comingFromSubPage = sessionStorage.getItem('comingFromSubPage') === 'true';
        if (comingFromSubPage) {
          console.log('[EDIT MODE CALCULATE PRICE] Skipping price save - comingFromSubPage is true, prices already saved by sub-page');
          return; // Exit early to avoid overwriting prices saved by sub-pages
        }
        
        // Also skip if we're currently loading from storage (route change effect is handling it)
        if (isLoadingFromStorage.current) {
          console.log('[EDIT MODE CALCULATE PRICE] Skipping price save - isLoadingFromStorage is true');
          return;
        }
        
        // CRITICAL: If capSizePrice is 0 but cap size is flexible, use calculated price instead
        // This prevents overwriting correct price (40) with incorrect value (0) from stale localStorage
        const currentCapSize = currentCustomization.capSize || 'M';
        const isFlexibleCap = currentCapSize === 'XXS/XS/S' || currentCapSize === 'S/M/L';
        const finalCapSizePrice = (capSizePrice === 0 && isFlexibleCap) ? calculatedPrices.capSizePrice : capSizePrice;
        
        console.log('[FLEX_CAP_DEBUG] CALCULATE_PRICE - Before saving:', {
          capSizePrice,
          finalCapSizePrice,
          currentCapSize,
          isFlexibleCap,
          calculatedCapSizePrice: calculatedPrices.capSizePrice,
          wasFixed: capSizePrice === 0 && isFlexibleCap,
          timestamp: new Date().toISOString()
        });
        
        const pricesToSave = {
          capSizePrice: finalCapSizePrice,
          colorPrice,
          lengthPrice,
          densityPrice,
          lacePrice,
          texturePrice,
          hairlinePrice,
          stylingPrice,
          addOnsPrice
        };
        
        // DEBUGGING: Log prices being saved
        console.log('[EDIT MODE] Saving prices to localStorage:', pricesToSave);
        console.log('[FLEX_CAP_DEBUG] CALCULATE_PRICE - Saving prices:', {
          pricesToSaveCapSizePrice: pricesToSave.capSizePrice,
          currentCapSize,
          isFlexibleCap,
          localStorageBefore: {
            editSelectedCapSizePrice: localStorage.getItem('editSelectedCapSizePrice'),
            selectedCapSizePrice: localStorage.getItem('selectedCapSizePrice'),
            editSelectedCapSize: localStorage.getItem('editSelectedCapSize'),
            selectedCapSize: localStorage.getItem('selectedCapSize')
          },
          timestamp: new Date().toISOString()
        });
        if (isFlexibleCap && capSizePrice === 0) {
          console.log('[FLEX_CAP_DEBUG] CALCULATE_PRICE - Fixed capSizePrice: was 0, using calculated', calculatedPrices.capSizePrice);
        }
        
        savePricesToLocalStorage(pricesToSave);
      }

      // Keep customize* color price in sync with selections (was stuck at "0" and broke cart/other readers).
      if (isCustomizeMode) {
        const comingFromSubPage = sessionStorage.getItem('comingFromSubPage') === 'true';
        if (!comingFromSubPage && !isLoadingFromStorage.current) {
          savePricesToLocalStorage({
            capSizePrice,
            colorPrice,
            lengthPrice,
            densityPrice,
            lacePrice,
            texturePrice,
            hairlinePrice,
            stylingPrice,
            addOnsPrice,
          });
        }
      }
    };

    // Calculate price immediately and on changes
    calculatePrice();
    
    // Also listen for storage changes to recalculate price
    // CRITICAL: In edit mode, we need to recalculate when localStorage changes
    const handleStorageChange = () => {
      // Use requestAnimationFrame to debounce rapid changes
      requestAnimationFrame(() => {
        calculatePrice();
      });
    };
    
    // CRITICAL: Also listen for customStorageChange to ensure price updates immediately after sub-page edits
    const handleCustomStorageChange = () => {
      // Small delay to ensure localStorage is fully updated
      setTimeout(() => {
        calculatePrice();
      }, 50);
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('customStorageChange', handleCustomStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('customStorageChange', handleCustomStorageChange);
    };
  }, [customization, basePrice, refreshTrigger, location, calculatePricesFromSelections, savePricesToLocalStorage, hasChanges]);

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
  const formatPrice = useCallback((price: number) => {
    const currency = currencyRates[selectedCurrency as keyof typeof currencyRates] || currencyRates.USD;
    const convertedPrice = price * currency.rate;
    return {
      __html: currency.symbol + convertedPrice.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      })
    };
  }, [currencyRates, selectedCurrency]);

  const handleOptionSelect = (category: string, optionId: string) => {
    if (isBuildWigPremiumMembershipOptionCategory(category) && !isPremiumMemberForGatedFeatures()) {
      setShowPremiumMembershipHubModal(true);
      return;
    }

    // CRITICAL: Save current customization to localStorage BEFORE navigating
    // This ensures sub-pages see the correct current selections
    localStorage.setItem('selectedCapSize', customization.capSize);
    localStorage.setItem('selectedLength', customization.length);
    localStorage.setItem('selectedDensity', customization.density);
    localStorage.setItem('selectedColor', customization.color);
    localStorage.setItem('selectedTexture', customization.texture);
    localStorage.setItem('selectedLace', customization.lace);
    localStorage.setItem('selectedHairline', customization.hairline);
    
    // CRITICAL: Ensure styling is not a part selection (MIDDLE, LEFT, RIGHT) - it should be NONE or a valid styling option
    const partSelectionOptions = ['MIDDLE', 'LEFT', 'RIGHT'];
    const validStyling = partSelectionOptions.includes(customization.styling) ? 'NONE' : customization.styling;
    localStorage.setItem('selectedStyling', validStyling);
    
    localStorage.setItem('selectedAddOns', JSON.stringify(customization.addOns));
    
    // Determine the base route based on current mode
    const pathname = location.pathname;
    const isEditMode = pathname === '/build-a-wig/edit' ||
                       pathname.startsWith('/build-a-wig/noir/edit') ||
                       pathname.startsWith('/build-a-wig/blanco/edit') ||
                       pathname.startsWith('/build-a-wig/soft-wave/edit') ||
                       pathname.startsWith('/build-a-wig/soft-curl/edit') ||
                       pathname.startsWith('/build-a-wig/ocean-curl/edit') ||
                       pathname.startsWith('/build-a-wig/beach-wave/edit');
    
    // Determine base route based on current pathname
    // CRITICAL: Check for customize/edit modes FIRST before checking product routes
    let baseRoute = '/build-a-wig'; // Default
    if (isEditMode) {
      if (pathname.startsWith('/build-a-wig/blanco/edit')) baseRoute = '/build-a-wig/blanco/edit';
      else if (pathname.startsWith('/build-a-wig/soft-wave/edit')) baseRoute = '/build-a-wig/soft-wave/edit';
      else if (pathname.startsWith('/build-a-wig/soft-curl/edit')) baseRoute = '/build-a-wig/soft-curl/edit';
      else if (pathname.startsWith('/build-a-wig/ocean-curl/edit')) baseRoute = '/build-a-wig/ocean-curl/edit';
      else if (pathname.startsWith('/build-a-wig/beach-wave/edit')) baseRoute = '/build-a-wig/beach-wave/edit';
      else if (pathname.startsWith('/build-a-wig/noir/edit')) baseRoute = '/build-a-wig/noir/edit';
      else baseRoute = '/build-a-wig/edit';
    } else if (pathname.startsWith('/build-a-wig/blanco/customize')) {
      baseRoute = '/build-a-wig/blanco/customize';
    } else if (pathname.startsWith('/build-a-wig/soft-wave/customize')) {
      baseRoute = '/build-a-wig/soft-wave/customize';
    } else if (pathname.startsWith('/build-a-wig/soft-curl/customize')) {
      baseRoute = '/build-a-wig/soft-curl/customize';
    } else if (pathname.startsWith('/build-a-wig/ocean-curl/customize')) {
      baseRoute = '/build-a-wig/ocean-curl/customize';
    } else if (pathname.startsWith('/build-a-wig/beach-wave/customize')) {
      baseRoute = '/build-a-wig/beach-wave/customize';
    } else if (pathname.startsWith('/build-a-wig/noir/customize')) {
      baseRoute = '/build-a-wig/noir/customize';
    } else if (pathname.startsWith('/build-a-wig/blanco')) {
      baseRoute = '/build-a-wig/blanco';
    } else if (pathname.startsWith('/build-a-wig/soft-wave')) {
      baseRoute = '/build-a-wig/soft-wave';
    } else if (pathname.startsWith('/build-a-wig/soft-curl')) {
      baseRoute = '/build-a-wig/soft-curl';
    } else if (pathname.startsWith('/build-a-wig/ocean-curl')) {
      baseRoute = '/build-a-wig/ocean-curl';
    } else if (pathname.startsWith('/build-a-wig/beach-wave')) {
      baseRoute = '/build-a-wig/beach-wave';
    } else if (pathname.startsWith('/build-a-wig/noir')) {
      baseRoute = '/build-a-wig/noir';
    }
    
    // Store the source route so sub-pages know where to navigate back to
    sessionStorage.setItem('sourceRoute', baseRoute);
    // Don't set comingFromSubPage here - that should only be set when RETURNING from sub-page
    
    if (category === 'capSize') {
      navigate(`${baseRoute}/cap`);
      return;
    }
    if (category === 'texture') {
      navigate(`${baseRoute}/texture`);
      return;
    }
    if (category === 'length') {
      navigate(`${baseRoute}/length`);
      return;
    }
    if (category === 'density') {
      navigate(`${baseRoute}/density`);
      return;
    }
    if (category === 'lace') {
      navigate(`${baseRoute}/lace`);
      return;
    }
    if (category === 'color') {
      navigate(`${baseRoute}/color`);
      return;
    }
    if (category === 'hairline') {
      navigate(`${baseRoute}/hairline`);
      return;
    }
    if (category === 'styling') {
      navigate(`${baseRoute}/styling`);
      return;
    }
    if (category === 'addOns') {
      navigate(`${baseRoute}/addons`);
      return;
    }
    setCustomization((prev) => ({
      ...prev,
      [category]: optionId,
    }));
  };

  const handleBack = () => {
    navigate(-1);
  };


  // Check if configuration has changed (for normal mode)
  useEffect(() => {
    const newConfig = generateConfigurationString();
    if (currentConfiguration && newConfig !== currentConfiguration) {
      // Only reset button if it's not in 'added' state
      const currentButtonState = localStorage.getItem('addToBagButtonState');
      if (currentButtonState !== 'added') {
        setAddToBagState('idle'); // Reset to idle when configuration changes
        localStorage.removeItem('addToBagButtonState'); // Clear saved button state
        localStorage.removeItem('lastAddedItemId'); // Clear saved item ID
      }
    }
    setCurrentConfiguration(newConfig);
  }, [refreshTrigger]); // Removed selectedView dependency to reduce re-renders

  // Helper function to detect changes in edit mode
  const detectChanges = useCallback(() => {
    const isEditPage = location.pathname === '/build-a-wig/edit' ||
                       location.pathname === '/build-a-wig/noir/edit' ||
                       location.pathname === '/build-a-wig/blanco/edit' ||
                       location.pathname === '/build-a-wig/soft-wave/edit' ||
                       location.pathname === '/build-a-wig/soft-curl/edit' ||
                       location.pathname === '/build-a-wig/beach-wave/edit' ||
                       location.pathname === '/build-a-wig/ocean-curl/edit';
    
    // Skip change detection if we're currently loading from localStorage (to avoid overwriting hasChanges set by route change effect)
    if (isLoadingFromStorage.current) {
      console.log('[CHANGE DETECTION] Skipped - loading from storage');
      return;
    }
    
    // CRITICAL: Get originalItem from state or localStorage to avoid stale closures
    const currentOriginalItem = originalItem || (() => {
      const editingCartItem = localStorage.getItem('editingCartItem');
      if (editingCartItem) {
        try {
          const item = JSON.parse(editingCartItem);
          const partSelectionOptions = ['MIDDLE', 'LEFT', 'RIGHT'];
          let validStyling = item.styling || 'NONE';
          if (partSelectionOptions.includes(validStyling)) {
            validStyling = 'NONE';
          }
          return {
            capSize: item.capSize || 'M',
            length: item.length || '24"',
            density: item.density || '200%',
            lace: item.lace || '13X6',
            texture: item.texture || 'SILKY',
            // For BLANCO items, default to PLATINUM; for others, default to OFF BLACK
            color: item.color || ((location.pathname.startsWith('/build-a-wig/blanco') || item.name === 'BLANCO') ? 'PLATINUM' : 'OFF BLACK'),
            hairline: item.hairline || 'NATURAL',
            styling: validStyling,
            addOns: item.addOns || []
          };
        } catch (e) {
          return null;
        }
      }
      return null;
    })();
    
    if (isEditPage && currentOriginalItem) {
      // CRITICAL: Read current selections directly from localStorage to avoid stale state
      // This ensures we detect changes immediately after sub-page edits
      const currentCapSize = localStorage.getItem('editSelectedCapSize') || localStorage.getItem('selectedCapSize') || 'M';
      const currentLength = localStorage.getItem('editSelectedLength') || localStorage.getItem('selectedLength') || '24"';
      const currentDensity = localStorage.getItem('editSelectedDensity') || localStorage.getItem('selectedDensity') || '200%';
      // For BLANCO routes, default to PLATINUM; for others, default to OFF BLACK
      const isBlancoRouteForCurrent2 = location.pathname.startsWith('/build-a-wig/blanco');
      const defaultColorForCurrent2 = isBlancoRouteForCurrent2 ? 'PLATINUM' : 'OFF BLACK';
      const currentColor = localStorage.getItem('editSelectedColor') || localStorage.getItem('selectedColor') || defaultColorForCurrent2;
      const currentTexture = localStorage.getItem('editSelectedTexture') || localStorage.getItem('selectedTexture') || 'SILKY';
      const currentLace = localStorage.getItem('editSelectedLace') || localStorage.getItem('selectedLace') || '13X6';
      const currentHairline = localStorage.getItem('editSelectedHairline') || localStorage.getItem('selectedHairline') || 'NATURAL';
      const currentStyling = localStorage.getItem('editSelectedStyling') || localStorage.getItem('selectedStyling') || 'NONE';
      const currentAddOns = JSON.parse(localStorage.getItem('editSelectedAddOns') || localStorage.getItem('selectedAddOns') || '[]');
      
      // Compare current selections (from localStorage) with original item
      const hasChangesDetected = 
        currentCapSize !== currentOriginalItem.capSize ||
        currentLength !== currentOriginalItem.length ||
        currentDensity !== currentOriginalItem.density ||
        currentLace !== currentOriginalItem.lace ||
        currentTexture !== currentOriginalItem.texture ||
        currentColor !== currentOriginalItem.color ||
        currentHairline !== currentOriginalItem.hairline ||
        currentStyling !== currentOriginalItem.styling ||
        JSON.stringify(currentAddOns) !== JSON.stringify(currentOriginalItem.addOns);
      
      console.log('[CHANGE DETECTION]', {
        hasChangesDetected,
        currentCapSize,
        originalCapSize: currentOriginalItem.capSize,
        currentStyling,
        originalStyling: currentOriginalItem.styling,
        currentColor,
        originalColor: currentOriginalItem.color
      });
      
      setHasChanges(hasChangesDetected);
      
      // Keep button in 'added' state (for IN THE BAG text) - changes will show SAVE CHANGES
      // Don't change button state here - let it stay as 'added' and use hasChanges for text
      if (!addToBagState || addToBagState === 'idle') {
        setAddToBagState('added');
      }
    } else if (!isEditPage) {
      // Clear edit mode state when not on edit page
      setOriginalItem(null);
      setHasChanges(false);
    } else if (isEditPage && !currentOriginalItem) {
      // In edit mode but no originalItem - set hasChanges to false
      console.log('[CHANGE DETECTION] No originalItem found');
      setHasChanges(false);
    }
  }, [location.pathname, originalItem, addToBagState]);
  
  // Detect changes in edit mode by comparing with original item
  useEffect(() => {
    detectChanges();
  }, [customization, originalItem, location.pathname, addToBagState, detectChanges]);
  
  // Also listen for customStorageChange events to trigger change detection immediately
  useEffect(() => {
    const isEditPage = location.pathname === '/build-a-wig/edit' ||
                       location.pathname === '/build-a-wig/noir/edit' ||
                       location.pathname === '/build-a-wig/blanco/edit' ||
                       location.pathname === '/build-a-wig/soft-wave/edit' ||
                       location.pathname === '/build-a-wig/soft-curl/edit' ||
                       location.pathname === '/build-a-wig/beach-wave/edit' ||
                       location.pathname === '/build-a-wig/ocean-curl/edit';
    
    if (!isEditPage) {
      return;
    }
    
    const handleChangeDetection = () => {
      console.log('[CUSTOM STORAGE CHANGE EVENT] Triggered');
      // Use requestAnimationFrame to ensure localStorage has been updated
      requestAnimationFrame(() => {
        // Small delay to ensure localStorage is fully updated
        setTimeout(() => {
          detectChanges();
        }, 100);
      });
    };
    
    // Listen for customStorageChange events (dispatched by sub-pages)
    window.addEventListener('customStorageChange', handleChangeDetection);
    
    return () => {
      window.removeEventListener('customStorageChange', handleChangeDetection);
    };
  }, [location.pathname, detectChanges]);

  // Initialize button state from localStorage on page load
  useEffect(() => {
    const isEditPage = location.pathname === '/build-a-wig/edit' ||
                       location.pathname === '/build-a-wig/noir/edit' ||
                       location.pathname === '/build-a-wig/blanco/edit' ||
                       location.pathname === '/build-a-wig/soft-wave/edit' ||
                       location.pathname === '/build-a-wig/soft-curl/edit' ||
                       location.pathname === '/build-a-wig/beach-wave/edit' ||
                       location.pathname === '/build-a-wig/ocean-curl/edit';
    
    // In edit mode, button should always start as 'added' (IN THE BAG)
    if (isEditPage) {
      const editingCartItem = localStorage.getItem('editingCartItem');
      if (editingCartItem) {
        setAddToBagState('added');
        return; // Don't check normal button state in edit mode
      }
    }

    if (isActiveBuildWigAppointmentMode()) {
      setAddToBagState('idle');
      return;
    }
    
    // Normal mode: check localStorage for button state
    const savedButtonState = localStorage.getItem('addToBagButtonState');
    const lastAddedItemId = localStorage.getItem('lastAddedItemId');
    const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
    
    if (savedButtonState === 'added' && lastAddedItemId) {
      // Check if the item is still in cart
      const itemStillInCart = cartItems.some((item: any) => item.id === lastAddedItemId);
      if (itemStillInCart) {
        setAddToBagState('added');
      } else {
        // Item was removed, clean up
        localStorage.removeItem('addToBagButtonState');
        localStorage.removeItem('lastAddedItemId');
      }
    }
  }, [location.pathname]);

  useEffect(() => {
    if (typeof localStorage === 'undefined') return;
    const mode = localStorage.getItem(BUILD_WIG_APPOINTMENT_MODE_KEY);
    const ret = localStorage.getItem(BUILD_WIG_APPOINTMENT_RETURN_KEY);
    if (mode === '1' && (!ret || !ret.startsWith('/booking'))) {
      clearBuildWigAppointmentMode();
    }
  }, [location.pathname]);

  const handleAddToBag = async () => {
    const isEditPage = location.pathname === '/build-a-wig/edit' ||
                       location.pathname === '/build-a-wig/noir/edit' ||
                       location.pathname === '/build-a-wig/blanco/edit' ||
                       location.pathname === '/build-a-wig/soft-wave/edit' ||
                       location.pathname === '/build-a-wig/soft-curl/edit' ||
                       location.pathname === '/build-a-wig/beach-wave/edit' ||
                       location.pathname === '/build-a-wig/ocean-curl/edit';
    
    // In edit mode: only allow if changes have been made
    if (isEditPage && !hasChanges) {
      return; // Button should be disabled, but this is a safety check
    }
    
    // Prevent double-clicks
    if (addToBagState === 'adding') return;
    
    const apptReturnEarly =
      typeof localStorage !== 'undefined' ? localStorage.getItem(BUILD_WIG_APPOINTMENT_RETURN_KEY) : null;
    const apptModeEarly =
      typeof localStorage !== 'undefined' && localStorage.getItem(BUILD_WIG_APPOINTMENT_MODE_KEY) === '1';
    const inApptAttachFlowEarly =
      !isEditPage && apptModeEarly && !!apptReturnEarly && apptReturnEarly.startsWith('/booking');

    // In normal mode, prevent if already added (appointment attach flow uses bag separately)
    if (!isEditPage && addToBagState === 'added' && !inApptAttachFlowEarly) {
      return;
    }
    
    setAddToBagState('adding');
    
    // Simulate adding to bag process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Check localStorage directly, not state
    // CRITICAL: Only use edit mode logic if we're actually on the edit page
    const editingCartItem = localStorage.getItem('editingCartItem');
    const editingCartItemId = localStorage.getItem('editingCartItemId');

    const apptReturn = localStorage.getItem(BUILD_WIG_APPOINTMENT_RETURN_KEY);
    const inApptAttachFlow =
      !isEditPage &&
      localStorage.getItem(BUILD_WIG_APPOINTMENT_MODE_KEY) === '1' &&
      !!apptReturn &&
      apptReturn.startsWith('/booking');

    if (inApptAttachFlow) {
      let validStyling = customization.styling;
      const partSelectionOptions = ['MIDDLE', 'LEFT', 'RIGHT'];
      if (partSelectionOptions.includes(validStyling)) {
        validStyling = 'NONE';
      }

      const pathname = location.pathname;
      let productName = 'NOIR';
      let productImage = '/assets/NOIR/noir-thumb.png';

      if (pathname.startsWith('/build-a-wig/blanco')) {
        productName = 'BLANCO';
        productImage = '/assets/NOIR/blanco-thumb.png';
      } else if (pathname.startsWith('/build-a-wig/soft-wave')) {
        productName = 'SOFT WAVE';
        productImage = '/assets/NOIR/wave-thumb.png';
      } else if (pathname.startsWith('/build-a-wig/soft-curl')) {
        productName = 'SOFT CURL';
        productImage = '/assets/NOIR/curl-thumb.png';
      } else if (pathname.startsWith('/build-a-wig/beach-wave')) {
        productName = 'BEACH WAVE';
        productImage = '/assets/NOIR/wave-thumb.png';
      } else if (pathname.startsWith('/build-a-wig/ocean-curl')) {
        productName = 'OCEAN CURL';
        productImage = '/assets/NOIR/curl-thumb.png';
      }

      const hairOriginByProduct: Record<string, string> = {
        NOIR: 'CAMBODIAN',
        BLANCO: 'RUSSIAN',
        'SOFT WAVE': 'INDIAN',
        'BEACH WAVE': 'INDONESIAN',
        'SOFT CURL': 'VIETNAMESE',
        'OCEAN CURL': 'FILIPINO'
      };
      const appointmentCartItem = {
        id: `build-a-wig-appt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        name: productName,
        productName,
        price: totalPrice,
        quantity: 1,
        image: productImage,
        capSize: customization.capSize,
        length: customization.length,
        density: customization.density,
        color: customization.color,
        texture: customization.texture,
        lace: customization.lace,
        hairline: customization.hairline,
        hairOrigin: hairOriginByProduct[productName] || 'CAMBODIAN',
        styling: validStyling,
        partSelection: localStorage.getItem('selectedPartSelection') || 'MIDDLE',
        addOns: customization.addOns
      };

      try {
        localStorage.setItem(BOOKING_NEW_INSTALL_ATTACHED_UNIT_KEY, JSON.stringify(appointmentCartItem));
      } catch {
        /* quota */
      }
      clearBuildWigAppointmentMode();
      setAddToBagState('idle');
      window.dispatchEvent(new CustomEvent('bookingNewInstallUnitAttached'));
      navigate(apptReturn!);
      return;
    }
    
    if (isEditPage && editingCartItem && editingCartItemId) {
      // CRITICAL: Recalculate price RIGHT BEFORE saving to ensure it's always correct
      // Don't rely on totalPrice state which might be stale after many edits
      // CRITICAL: Base price varies by product - flexible cap adds $40 via capSizePrice
      const pathname = location.pathname;
      let basePrice = 740; // Default noir
      if (pathname.startsWith('/build-a-wig/blanco')) basePrice = 820;
      else if (pathname.startsWith('/build-a-wig/soft-wave') || pathname.startsWith('/build-a-wig/beach-wave')) basePrice = 760;
      else if (pathname.startsWith('/build-a-wig/soft-curl') || pathname.startsWith('/build-a-wig/ocean-curl')) basePrice = 780;
      else if (pathname.startsWith('/build-a-wig/noir')) basePrice = 740;
      
      // Calculate prices from current selections first
      const calculatedPrices = calculatePricesFromSelections(customization);
      
      // CRITICAL (edit save): Use CALCULATED prices only. Do NOT read from localStorage for finalPrice.
      // Stale editSelected*Price / selected*Price can hold a full total or wrong sum from another product/session,
      // which doubles or corrupts the saved price.
      const capSizePrice = calculatedPrices.capSizePrice;
      const colorPrice = calculatedPrices.colorPrice;
      const lengthPrice = calculatedPrices.lengthPrice;
      const densityPrice = calculatedPrices.densityPrice;
      const lacePrice = calculatedPrices.lacePrice;
      const texturePrice = calculatedPrices.texturePrice;
      const hairlinePrice = calculatedPrices.hairlinePrice;
      const stylingPrice = calculatedPrices.stylingPrice;
      const addOnsPrice = calculatedPrices.addOnsPrice;
      
      // Calculate final price (always base + calculated options in edit mode)
      const finalPrice = basePrice + capSizePrice + colorPrice + lengthPrice + densityPrice + lacePrice + texturePrice + hairlinePrice + stylingPrice + addOnsPrice;
      
      // DEBUGGING: Log save operation
      console.log('[EDIT MODE SAVE] Saving cart item:', {
        editingCartItemId,
        customization,
        prices: {
          basePrice,
          capSizePrice,
          colorPrice,
          lengthPrice,
          densityPrice,
          lacePrice,
          texturePrice,
          hairlinePrice,
          stylingPrice,
          addOnsPrice
        },
        finalPrice,
        totalPriceState: totalPrice,
        timestamp: new Date().toISOString()
      });
      
      // CRITICAL: Ensure styling is not a part selection (MIDDLE, LEFT, RIGHT) - it should be NONE or a valid styling option
      let validStyling = customization.styling;
      const partSelectionOptions = ['MIDDLE', 'LEFT', 'RIGHT'];
      if (partSelectionOptions.includes(validStyling)) {
        validStyling = 'NONE'; // If styling is a part selection, set to NONE
      }
      
      // Use calculated capSizePrice for the cart item (same as finalPrice calculation)
      console.log('[FLEX_CAP_DEBUG] handleAddToBag Save - Using calculated capSizePrice:', {
        capSizePrice,
        customizationCapSize: customization.capSize,
        isFlexible: customization.capSize === 'XXS/XS/S' || customization.capSize === 'S/M/L',
        timestamp: new Date().toISOString()
      });
      
      const updatedItem = {
        ...JSON.parse(editingCartItem),
        id: editingCartItemId, // Keep the same ID
        price: finalPrice, // Use recalculated price, not state
        capSize: customization.capSize,
        capSizePrice: capSizePrice,
        length: customization.length,
        density: customization.density,
        color: customization.color,
        texture: customization.texture,
        lace: customization.lace,
        hairline: customization.hairline,
        styling: validStyling,
        partSelection: localStorage.getItem('selectedPartSelection') || 'MIDDLE',
        addOns: customization.addOns
      };
      
      console.log('[EDIT MODE SAVE] Updated item (for cart, wishlist, or saved for later):', updatedItem);
      
      const editingSource = localStorage.getItem('editingSource');
      const idStr = String(editingCartItemId);
      
      if (editingSource === 'wishlist') {
        // Opened edit from wishlist page: update that item in wishlist only
        const wishlistRaw = localStorage.getItem('wishlistItems');
        let wishlistItems: any[] = [];
        try {
          wishlistItems = wishlistRaw ? (JSON.parse(wishlistRaw) || []) : [];
        } catch (_) {
          wishlistItems = [];
        }
        const newWishlist = wishlistItems.map((i: any) => (String(i.id) === idStr ? updatedItem : i));
        localStorage.setItem('wishlistItems', JSON.stringify(newWishlist));
        localStorage.removeItem('editingSource');
        window.dispatchEvent(new CustomEvent('wishlistUpdated'));
        console.log('[EDIT MODE SAVE] Updated item in wishlist');
        {
          const pn = (updatedItem.name || updatedItem.productName || '').toString().trim();
          trackActivity('cart_item_updated', { source: 'build_a_wig', context: 'wishlist', productName: pn || undefined });
        }
      } else {
        // CRITICAL: If the item was in SAVED FOR LATER, update it there in place. Do NOT add to cart.
        const savedForLaterRaw = localStorage.getItem('savedForLater');
        let savedForLaterList: any[] = [];
        try {
          savedForLaterList = savedForLaterRaw ? (JSON.parse(savedForLaterRaw) || []) : [];
        } catch (_) {
          savedForLaterList = [];
        }
        const isFromSavedForLater = Array.isArray(savedForLaterList) && savedForLaterList.some((i: any) => String(i.id) === idStr);
        
        if (isFromSavedForLater) {
          // Update the item in saved for later in place; do not touch the cart
          const newSavedForLater = savedForLaterList.map((i: any) =>
            String(i.id) === idStr ? updatedItem : i
          );
          localStorage.setItem('savedForLater', JSON.stringify(newSavedForLater));
          window.dispatchEvent(new CustomEvent('savedItemsChanged'));
          console.log('[EDIT MODE SAVE] Updated item in Saved for Later (in place), did not add to cart');
          {
            const pn = (updatedItem.name || updatedItem.productName || '').toString().trim();
            trackActivity('cart_item_updated', { source: 'build_a_wig', context: 'saved_for_later', productName: pn || undefined });
          }
        } else {
          // Item was in the cart: update cart only
          const existingCartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
          const filteredCartItems = existingCartItems.filter((item: any) => item.id !== editingCartItemId);
          const updatedCartItems = [updatedItem, ...filteredCartItems];
          localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
          const newCartCount = updatedCartItems.reduce((sum: number, ci: any) => sum + (ci.quantity || 1), 0);
          localStorage.setItem('cartCount', newCartCount.toString());
          console.log('[EDIT MODE SAVE] Updated item in cart');
          {
            const pn = (updatedItem.name || updatedItem.productName || '').toString().trim();
            trackActivity('cart_item_updated', { source: 'build_a_wig', context: 'cart', productName: pn || undefined });
          }
        }
      }
      
      // CRITICAL: Update editingCartItem in localStorage to reflect saved changes
      // This ensures subsequent edits start from the latest saved state, not the initial edit
      const updatedEditingCartItem = {
        ...JSON.parse(editingCartItem),
        price: finalPrice,
        capSize: customization.capSize,
        // CRITICAL: Include capSizePrice in editingCartItem
        capSizePrice: capSizePrice,
        length: customization.length,
        density: customization.density,
        color: customization.color,
        texture: customization.texture,
        lace: customization.lace,
        hairline: customization.hairline,
        styling: validStyling,
        partSelection: localStorage.getItem('selectedPartSelection') || 'MIDDLE',
        addOns: customization.addOns
      };
      
      console.log('[FLEX_CAP_DEBUG] handleAddToBag Save - Updated editingCartItem capSizePrice:', capSizePrice);
      localStorage.setItem('editingCartItem', JSON.stringify(updatedEditingCartItem));
      
      // CRITICAL: Also update editSelected* keys to match saved state
      // This ensures that when clicking "EDIT IN BUILD-A-WIG" again, it loads the latest saved selections
      localStorage.setItem('editSelectedCapSize', customization.capSize);
      localStorage.setItem('editSelectedLength', customization.length);
      localStorage.setItem('editSelectedDensity', customization.density);
      localStorage.setItem('editSelectedColor', customization.color);
      localStorage.setItem('editSelectedTexture', customization.texture);
      localStorage.setItem('editSelectedLace', customization.lace);
      localStorage.setItem('editSelectedHairline', customization.hairline);
      localStorage.setItem('editSelectedStyling', validStyling);
      localStorage.setItem('editSelectedAddOns', JSON.stringify(customization.addOns));
      
      // CRITICAL: Also save prices to editSelected*Price keys to preserve them
      // This ensures prices persist when navigating away and coming back
      localStorage.setItem('editSelectedCapSizePrice', capSizePrice.toString());
      localStorage.setItem('editSelectedColorPrice', colorPrice.toString());
      localStorage.setItem('editSelectedLengthPrice', lengthPrice.toString());
      localStorage.setItem('editSelectedDensityPrice', densityPrice.toString());
      localStorage.setItem('editSelectedLacePrice', lacePrice.toString());
      localStorage.setItem('editSelectedTexturePrice', texturePrice.toString());
      localStorage.setItem('editSelectedHairlinePrice', hairlinePrice.toString());
      localStorage.setItem('editSelectedStylingPrice', stylingPrice.toString());
      localStorage.setItem('editSelectedAddOnsPrice', addOnsPrice.toString());
      
      // Also update selected* keys for consistency
      localStorage.setItem('selectedCapSize', customization.capSize);
      localStorage.setItem('selectedLength', customization.length);
      localStorage.setItem('selectedDensity', customization.density);
      localStorage.setItem('selectedColor', customization.color);
      localStorage.setItem('selectedTexture', customization.texture);
      localStorage.setItem('selectedLace', customization.lace);
      localStorage.setItem('selectedHairline', customization.hairline);
      localStorage.setItem('selectedStyling', validStyling);
      localStorage.setItem('selectedAddOns', JSON.stringify(customization.addOns));
      
      // DEBUGGING: Log updated editingCartItem
      console.log('[EDIT MODE SAVE] Updated editingCartItem in localStorage:', updatedEditingCartItem);
      console.log('[EDIT MODE SAVE] Updated editSelected* keys with latest selections');
      
      // [CART PRICE TRIANGULATION] Mobile-friendly: so cart dropdown can show what was saved when ?debug=1
      const isEditSaveDebug = typeof window !== 'undefined' && (
        new URLSearchParams(location.search).get('debug') === '1' || localStorage.getItem('editPriceDebug') === '1'
      );
      if (isEditSaveDebug) {
        try {
          const addOnBasePricesSave: Record<string, number> = { BLEACH: 60, PLUCK: 80, 'BLUNT CUT': 20 };
          const discountedLaceSave = ['2X6', '4X4', '5X5', '6X6', '7X7'];
          const laceSave = customization.lace || '';
          const hasLaceDiscSave = discountedLaceSave.includes(laceSave);
          const perAddonSave: Record<string, number> = {};
          (customization.addOns || []).forEach((id: string) => {
            let p = addOnBasePricesSave[id] ?? 0;
            if (hasLaceDiscSave && (id === 'BLEACH' || id === 'PLUCK')) p -= 20;
            perAddonSave[id] = p;
          });
          sessionStorage.setItem('lastAddToBagPayload', JSON.stringify({
            source: 'Edit mode save',
            finalPrice,
            customization: { ...customization },
            updatedItem: { ...updatedItem },
            addOnsDetail: {
              selected: customization.addOns || [],
              lace: laceSave,
              laceDiscountApplied: hasLaceDiscSave,
              perAddon: perAddonSave,
              perAddonSum: Object.values(perAddonSave).reduce((a, b) => a + b, 0),
              addOnsPriceInFinal: addOnsPrice
            }
          }));
        } catch (_) {}
      }
      
      // Update totalPrice state to match saved price
      setTotalPrice(finalPrice);
      
      // Update originalItem to reflect saved changes
      const updatedOriginalItem = {
        capSize: customization.capSize,
        length: customization.length,
        density: customization.density,
        lace: customization.lace,
        texture: customization.texture,
        color: customization.color,
        hairline: customization.hairline,
        styling: validStyling,
        addOns: customization.addOns,
      };
      setOriginalItem(updatedOriginalItem);
      setHasChanges(false); // Reset changes flag after saving
      
      // DEBUGGING: Log state updates
      console.log('[EDIT MODE SAVE] State updated - originalItem:', updatedOriginalItem, 'hasChanges: false');
      
      // Set button to 'added' state to show "IN THE BAG"
      setAddToBagState('added');
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: parseInt(localStorage.getItem('cartCount') || '0') }));
    } else {
      // Create new cart item
      // CRITICAL: Ensure styling is not a part selection (MIDDLE, LEFT, RIGHT) - it should be NONE or a valid styling option
      let validStyling = customization.styling;
      const partSelectionOptions = ['MIDDLE', 'LEFT', 'RIGHT'];
      if (partSelectionOptions.includes(validStyling)) {
        validStyling = 'NONE'; // If styling is a part selection, set to NONE
      }
      
      // Determine product name and image based on current route
      const pathname = location.pathname;
      let productName = 'NOIR';
      let productImage = '/assets/NOIR/noir-thumb.png';
      
      if (pathname.startsWith('/build-a-wig/blanco')) {
        productName = 'BLANCO';
        productImage = '/assets/NOIR/blanco-thumb.png';
      } else if (pathname.startsWith('/build-a-wig/soft-wave')) {
        productName = 'SOFT WAVE';
        productImage = '/assets/NOIR/wave-thumb.png';
      } else if (pathname.startsWith('/build-a-wig/soft-curl')) {
        productName = 'SOFT CURL';
        productImage = '/assets/NOIR/curl-thumb.png';
      } else if (pathname.startsWith('/build-a-wig/beach-wave')) {
        productName = 'BEACH WAVE';
        productImage = '/assets/NOIR/wave-thumb.png';
      } else if (pathname.startsWith('/build-a-wig/ocean-curl')) {
        productName = 'OCEAN CURL';
        productImage = '/assets/NOIR/curl-thumb.png';
      }
      
      const hairOriginByProduct: Record<string, string> = {
        NOIR: 'CAMBODIAN',
        BLANCO: 'RUSSIAN',
        'SOFT WAVE': 'INDIAN',
        'BEACH WAVE': 'INDONESIAN',
        'SOFT CURL': 'VIETNAMESE',
        'OCEAN CURL': 'FILIPINO'
      };
      const cartItem = {
        id: `build-a-wig-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: productName,
        productName: productName,
        price: totalPrice, // Use the calculated total price
        quantity: 1,
        image: productImage,
        capSize: customization.capSize,
        length: customization.length,
        density: customization.density,
        color: customization.color,
        texture: customization.texture,
        lace: customization.lace,
        hairline: customization.hairline,
        hairOrigin: hairOriginByProduct[productName] || 'CAMBODIAN',
        styling: validStyling,
        partSelection: localStorage.getItem('selectedPartSelection') || 'MIDDLE',
        addOns: customization.addOns
      };

      // [CART PRICE TRIANGULATION] Mobile-friendly: so cart dropdown can show what was added when ?debug=1
      const isAddToBagDebug = typeof window !== 'undefined' && (
        new URLSearchParams(location.search).get('debug') === '1' || localStorage.getItem('editPriceDebug') === '1'
      );
      if (isAddToBagDebug) {
        try {
          const addOnBasePricesPayload: Record<string, number> = { BLEACH: 60, PLUCK: 80, 'BLUNT CUT': 20 };
          const discountedLacePayload = ['2X6', '4X4', '5X5', '6X6', '7X7'];
          const lacePayload = customization.lace || '';
          const hasLaceDiscPayload = discountedLacePayload.includes(lacePayload);
          const perAddonPayload: Record<string, number> = {};
          (customization.addOns || []).forEach((id: string) => {
            let p = addOnBasePricesPayload[id] ?? 0;
            if (hasLaceDiscPayload && (id === 'BLEACH' || id === 'PLUCK')) p -= 20;
            perAddonPayload[id] = p;
          });
          sessionStorage.setItem('lastAddToBagPayload', JSON.stringify({
            source: 'Add to bag (new item)',
            totalPrice,
            pathname: location.pathname,
            productName,
            customization: { ...customization },
            cartItem: { ...cartItem },
            addOnsDetail: {
              selected: customization.addOns || [],
              lace: lacePayload,
              laceDiscountApplied: hasLaceDiscPayload,
              perAddon: perAddonPayload,
              perAddonSum: Object.values(perAddonPayload).reduce((a, b) => a + b, 0)
            }
          }));
        } catch (_) {}
      }

      // Get existing cart items and add new item at the beginning (newest first)
      const existingCartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      const updatedCartItems = [cartItem, ...existingCartItems];
      localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));

      // Increment cart count when item is successfully added
      const newCartCount = cartCount + 1;
      setCartCount(newCartCount);
      localStorage.setItem('cartCount', newCartCount.toString());
      
      // Track the specific item ID
      localStorage.setItem('lastAddedItemId', cartItem.id);
    
      // Save button state
    setAddToBagState('added');
    localStorage.setItem('addToBagButtonState', 'added');
    
    // Small delay to ensure cart item is fully saved before any cart update events
    setTimeout(() => {
      // Dispatch both events after a small delay
      window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: newCartCount }));
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { items: JSON.parse(localStorage.getItem('cartItems') || '[]'), count: newCartCount } }));
      trackActivity('add_to_cart', { source: 'build_a_wig', productName, quantity: 1 });
    }, 100);
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

  const handleSignOut = () => {
    setIsSignedIn(false);
    clearAppAuth();
    window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'false' }));
    setShowSignOutConfirm(false);
    setShowMobileMenu(false);
  };

  // Update processing time text when localStorage changes (debounced for performance)
  useEffect(() => {
    // Update processing time when refreshTrigger changes
    setProcessingTimeText(getProcessingTimeText());
  }, [refreshTrigger]);

  // Get dynamic processing time text based on selected options
  const getProcessingTimeText = () => {
    let additionalWeekCount = 0;
    
    // Check length options (30" and above have additional week)
    const selectedLength = localStorage.getItem('selectedLength');
    const longLengths = ['30"', '32"', '34"', '36"', '40"'];
    if (selectedLength && longLengths.includes(selectedLength)) {
      additionalWeekCount++;
    }
    
    // Check density options (all densities except 130% and 150% have additional week)
    const selectedDensity = localStorage.getItem('selectedDensity');
    const additionalWeekDensities = ['180%', '200%', '250%', '300%', '350%', '400%'];
    if (selectedDensity && additionalWeekDensities.includes(selectedDensity)) {
      additionalWeekCount++;
    }
    
    // Check lace options (360 and FULL LACE have additional week)
    const selectedLace = localStorage.getItem('selectedLace');
    const additionalWeekLaces = ['360', 'FULL'];
    if (selectedLace && additionalWeekLaces.includes(selectedLace)) {
      additionalWeekCount++;
    }
    
    // Check texture options (KINKY and YAKI have additional week)
    const selectedTexture = localStorage.getItem('selectedTexture');
    const additionalWeekTextures = ['KINKY', 'YAKI'];
    if (selectedTexture && additionalWeekTextures.includes(selectedTexture)) {
      additionalWeekCount++;
    }
    
    // Check color options (all colors except OFF BLACK have additional week)
    const selectedColor = localStorage.getItem('selectedColor');
    if (selectedColor && selectedColor !== 'OFF BLACK') {
      additionalWeekCount++;
    }
    
    // Check hairline options (PEAK and LAGOS have additional week, but not when combined)
    const selectedHairline = localStorage.getItem('selectedHairline');
    if (selectedHairline) {
      const hairlineArray = selectedHairline.split(',');
      if (hairlineArray.includes('PEAK') && hairlineArray.includes('LAGOS')) {
        // Lagos + Peak combination counts as 1 additional week
        additionalWeekCount++;
      } else if (hairlineArray.includes('PEAK') || hairlineArray.includes('LAGOS')) {
        // Individual Peak or Lagos counts as 1 additional week
        additionalWeekCount++;
      }
    }
    
    // Check styling options (CRIMPS, FLAT IRON, LAYERS, and all bangs combinations have additional week)
    const selectedStyling = localStorage.getItem('selectedHairStyling');
    if (selectedStyling) {
      const stylingArray = selectedStyling.split(',');
      const hasBangs = stylingArray.includes('BANGS');
      const hasOtherStyling = stylingArray.some(styling => styling !== 'BANGS');
      
      if (hasBangs && hasOtherStyling) {
        // Bangs + other styling combination has additional week
        additionalWeekCount++;
      } else if (stylingArray.includes('CRIMPS') || stylingArray.includes('FLAT IRON') || stylingArray.includes('LAYERS')) {
        // Individual crimps, flat iron, or layers have additional week
        additionalWeekCount++;
      }
    }
    
    // Check add-ons options (BLEACH, PLUCK, and combinations have additional week)
    const selectedAddOns = localStorage.getItem('selectedAddOns');
    if (selectedAddOns) {
      const addOnsArray = JSON.parse(selectedAddOns);
      const hasBleach = addOnsArray.includes('BLEACH');
      const hasPluck = addOnsArray.includes('PLUCK');
      
      if (hasBleach || hasPluck) {
        // Any combination with bleach or pluck has additional week
        additionalWeekCount++;
      }
    }
    
    // Return appropriate processing time text
    if (additionalWeekCount >= 5) {
      return 'EXPECT 8 - 10 WEEKS OF PROCESSING TIME FOR THIS UNIT.';
    } else {
      return 'EXPECT 6 - 8 WEEKS OF PROCESSING TIME FOR THIS UNIT.';
    }
  };

  // Get current localStorage values for debug panel

  return (
    <>
      {showLoading && <LoadingScreen />}
      <div className="min-h-screen" style={{
        position: 'relative'
      }}>
        {/* Fixed Background Layer */}
      <div
          className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url('/assets/marble-half.png')`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat',
          backgroundAttachment: 'fixed'
        }}
        ></div>
      <div
          className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url('/assets/marble-half.png')`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat',
          backgroundAttachment: 'fixed'
        }}
        ></div>
        
        {/* Scrollable Content */}
        <div className="relative z-10">
          {/* MAIN CONTENT */}
          <div className="flex flex-col py-5 px-4">
          {/* HEADER */}
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
                  const pathname = location.pathname;
                  // Check for product-specific routes first (main, customize, edit)
                  if (pathname.startsWith('/build-a-wig/blanco')) navigate('/build-a-wig/blanco');
                  else if (pathname.startsWith('/build-a-wig/soft-wave')) navigate('/build-a-wig/soft-wave');
                  else if (pathname.startsWith('/build-a-wig/soft-curl')) navigate('/build-a-wig/soft-curl');
                  else if (pathname.startsWith('/build-a-wig/beach-wave')) navigate('/build-a-wig/beach-wave');
                  else if (pathname.startsWith('/build-a-wig/ocean-curl')) navigate('/build-a-wig/ocean-curl');
                  else if (pathname.startsWith('/build-a-wig/noir')) navigate('/build-a-wig/noir');
                  else navigate('/build-a-wig');
                }}
              >
                BUILD-A-WIG &gt;
              </span>{' '}
              <span
                style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontWeight: '500', cursor: 'pointer' }}
                onClick={() => {
                  const pathname = location.pathname;
                  // Check for product-specific routes (main, customize, edit) - order matters!
                  if (pathname.startsWith('/build-a-wig/blanco')) {
                    navigate('/straight/blanco');
                  } else if (pathname.startsWith('/build-a-wig/soft-wave')) {
                    navigate('/wavy/soft-wave');
                  } else if (pathname.startsWith('/build-a-wig/soft-curl')) {
                    navigate('/curly/soft-curl');
                  } else if (pathname.startsWith('/build-a-wig/beach-wave')) {
                    navigate('/wavy/beach-wave');
                  } else if (pathname.startsWith('/build-a-wig/ocean-curl')) {
                    navigate('/curly/ocean-curl');
                  } else if (pathname.startsWith('/build-a-wig/noir')) {
                    navigate('/straight/noir');
                  } else {
                    navigate('/straight/noir');
                  }
                }}
              >
                {(() => {
                  const pathname = location.pathname;
                  // Check for product-specific routes - order matters! Check specific products before noir
                  if (pathname.startsWith('/build-a-wig/blanco')) {
                    return 'BLANCO';
                  }
                  if (pathname.startsWith('/build-a-wig/soft-wave')) {
                    return 'SOFT WAVE';
                  }
                  if (pathname.startsWith('/build-a-wig/soft-curl')) {
                    return 'SOFT CURL';
                  }
                  if (pathname.startsWith('/build-a-wig/beach-wave')) {
                    return 'BEACH WAVE';
                  }
                  if (pathname.startsWith('/build-a-wig/ocean-curl')) {
                    return 'OCEAN CURL';
                  }
                  if (pathname.startsWith('/build-a-wig/noir')) {
                    return 'NOIR';
                  }
                  // Default fallback
                  return 'NOIR';
                })()}
              </span>
                </>
              )}
            </p>
            </NavCenter>
            <div className="gap-5 flex absolute" style={{ right: '17px', zIndex: 10 }}>
              <div style={{ transform: `translateX(${cartCount === 0 ? 7 : 5}px)` }}>
                  <DynamicCartIcon count={cartCount} width={22} height={19} variant="nav" />
                </div>
                <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto', zIndex: 11 }}>
                  <svg
                    width="17"
                    height="18"
                    viewBox="0 0 16 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleMobileMenuToggle();
                    }}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleMobileMenuToggle();
                    }}
                    style={{ marginTop: '2px', pointerEvents: 'auto' }}
                  >
                    <path d="M0 0H15.75V0.7H7.875H0V0ZM5.25 6.7H10.5H15.375V7.4H10.5H5.25V6.7ZM0 13.1H15.75V13.8H0V13.1Z" fill="black" pointerEvents="none"/>
                  </svg>
                </div>
            </div>
        </div>

        {/* BUILD AREA */}
        <div
          className={showMobileMenu ? 'menu-toggle-card border border-black flex flex-col pt-6 pb-4 mb-2 bg-white/60 backdrop-blur-sm transition-all duration-300 ease-out' : 'border border-black flex flex-col pt-6 pb-4 mb-2 bg-white/60 backdrop-blur-sm transition-all duration-300 ease-out'}
          style={{ 
            borderWidth: '1.3px',
            paddingLeft: (() => {
              const pathname = location.pathname;
              if (pathname.startsWith('/build-a-wig/soft-wave') || pathname.startsWith('/build-a-wig/soft-curl')) {
                return '10px'; // Reduced padding for SOFT WAVE/CURL
              }
              return '20px'; // Default padding (px-5 = 1.25rem = 20px)
            })(),
            paddingRight: (() => {
              const pathname = location.pathname;
              if (pathname.startsWith('/build-a-wig/soft-wave') || pathname.startsWith('/build-a-wig/soft-curl')) {
                return '10px'; // Reduced padding for SOFT WAVE/CURL
              }
              return '20px'; // Default padding (px-5 = 1.25rem = 20px)
            })(),
            minHeight: showMobileMenu ? 'calc(100dvh - 80px)' : 'auto',
            height: showMobileMenu ? 'calc(100dvh - 80px)' : 'auto'
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
          ) : (
            <>
            {/* WIG PREVIEW */}
            <div className="w-full flex items-center flex-col mb-6 md:mb-8" style={{ transform: 'translateY(20px)' }}>
              <BawNoirWigPreviewHeroThumbs
                wigViews={wigViews}
                selectedView={selectedView}
                onSelectView={setSelectedView}
                thumbRowClassName="items-center"
                heroChildren={
                  <p
                    className="absolute top-[-20px] left-1/2 transform -translate-x-1/2 text-5xl sm:text-6xl z-20 noir-text cursor-pointer"
                    style={{
                      color: '#EB1C24',
                      whiteSpace: 'nowrap',
                      overflow: 'visible',
                      width: 'max-content',
                      fontSize: (() => {
                        const pathname = location.pathname;
                        if (
                          pathname.startsWith('/build-a-wig/soft-wave') ||
                          pathname.startsWith('/build-a-wig/soft-curl') ||
                          pathname.startsWith('/build-a-wig/blanco') ||
                          pathname.startsWith('/build-a-wig/beach-wave') ||
                          pathname.startsWith('/build-a-wig/ocean-curl')
                        ) {
                          return 'calc(clamp(2rem, 4vw, 2.5rem) + 8px)';
                        }
                        return undefined;
                      })(),
                      transform: (() => {
                        const pathname = location.pathname;
                        if (pathname.startsWith('/build-a-wig/blanco')) {
                          return 'translate(-50%, 5px)';
                        }
                        if (
                          pathname.startsWith('/build-a-wig/soft-wave') ||
                          pathname.startsWith('/build-a-wig/soft-curl') ||
                          pathname.startsWith('/build-a-wig/beach-wave') ||
                          pathname.startsWith('/build-a-wig/ocean-curl')
                        ) {
                          return 'translate(-50%, 2px)';
                        }
                        return 'translate(-50%, 0)';
                      })(),
                    }}
                    onClick={() => {
                      const pathname = location.pathname;
                      if (pathname.startsWith('/build-a-wig/blanco')) {
                        navigate('/straight/blanco');
                      } else if (pathname.startsWith('/build-a-wig/soft-wave')) {
                        navigate('/wavy/soft-wave');
                      } else if (pathname.startsWith('/build-a-wig/soft-curl')) {
                        navigate('/curly/soft-curl');
                      } else if (pathname.startsWith('/build-a-wig/beach-wave')) {
                        navigate('/wavy/beach-wave');
                      } else if (pathname.startsWith('/build-a-wig/ocean-curl')) {
                        navigate('/curly/ocean-curl');
                      } else if (pathname.startsWith('/build-a-wig/noir')) {
                        navigate('/straight/noir');
                      } else {
                        navigate('/straight/noir');
                      }
                    }}
                  >
                    {(() => {
                      const pathname = location.pathname;
                      if (pathname.startsWith('/build-a-wig/blanco')) {
                        return 'BLANCO';
                      }
                      if (pathname.startsWith('/build-a-wig/soft-wave')) {
                        return 'SOFT WAVE';
                      }
                      if (pathname.startsWith('/build-a-wig/soft-curl')) {
                        return 'SOFT CURL';
                      }
                      if (pathname.startsWith('/build-a-wig/beach-wave')) {
                        return 'BEACH WAVE';
                      }
                      if (pathname.startsWith('/build-a-wig/ocean-curl')) {
                        return 'OCEAN CURL';
                      }
                      if (pathname.startsWith('/build-a-wig/noir')) {
                        return 'NOIR';
                      }
                      return 'NOIR';
                    })()}
                  </p>
                }
              />
            </div>

            {/* CUSTOMIZATION OPTIONS */}
            <div className="w-full flex flex-col">
              {/* SELECT ICONS BELOW Header */}
            <p
              className="text-xs sm:text-sm md:text-base lg:text-lg text-center text-red-500 mb-4"
              style={{ fontFamily: '"Covered By Your Grace", cursive', color: '#EB1C24', transform: 'translateY(18px)' }}
            >
              SELECT ICONS BELOW
            </p>

              {/* STANDARD OPTIONS */}
            <div className="flex flex-col gap-3 mt-4 mx-auto" style={{ marginBottom: '18px', transform: 'translateY(6px)' }}>
                <p className="text-[9px] sm:text-sm md:text-base lg:text-lg font-medium text-black text-center" style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontWeight: '500' }}>
                STANDARD MEMBERSHIP OPTIONS:
              </p>
                <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6 mx-auto justify-evenly">
                {/* CAP SIZE */}
                <div
                  className="border relative text-center cursor-pointer border-black bg-white"
                  style={{
                    borderWidth: '1.3px',
                    width: '60px',
                    height: '80px',
                    boxSizing: 'border-box',
                    padding: '0',
                    overflow: 'visible'
                  }}
                  onClick={() => handleOptionSelect('capSize', 'M')}
                >
                  <p
                    className="text-[12px] md:text-base text-black absolute top-0 left-1/2 transform -translate-x-1/2 w-full"
                    style={{ fontFamily: '"Covered By Your Grace", cursive' }}
                  >
                    CAP SIZE
                  </p>
                  <div
                    className="absolute left-1/2 transform -translate-x-1/2 z-[99999] flex items-center justify-center"
                    style={{
                      width: '78px',
                      height: '78px',
                      overflow: 'visible',
                        top: '53%',
                      transform: 'translateX(-50%) translateY(-50%)'
                    }}
                  >
                    <img
                      alt="Card image"
                        src={getCapSizeIcon()}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        display: 'block',
                        position: 'relative'
                      }}
                    />
                  </div>
                    <p className="absolute bottom-[-6.9px] md:bottom-[-10px] left-1/2 transform -translate-x-1/2 text-[9px] w-full md:text-xs font-medium text-center" style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium", Futura, Inter, sans-serif' }}>
                    {customization.capSize}
                  </p>
                </div>

                {/* LENGTH */}
                <div
                  className="border relative text-center cursor-pointer border-black bg-white"
                  style={{
                    borderWidth: '1.3px',
                    width: '60px',
                    height: '80px',
                    boxSizing: 'border-box',
                    padding: '0',
                    overflow: 'visible'
                  }}
                    onClick={() => handleOptionSelect('length', customization.length)}
                >
                  <p
                    className="text-[12px] md:text-base text-black absolute top-0 left-1/2 transform -translate-x-1/2 w-full"
                    style={{ fontFamily: '"Covered By Your Grace", cursive' }}
                  >
                    LENGTH
                  </p>
                  <div
                    className="absolute left-1/2 transform -translate-x-1/2 z-[99999] flex items-center justify-center"
                    style={{
                      width: getLengthThumbnailSize(),
                      height: getLengthThumbnailSize(),
                      overflow: 'visible',
                      top: getLengthThumbnailTopPosition(),
                      transform: 'translateX(-50%) translateY(-50%)'
                    }}
                  >
                    <img
                      alt="Card image"
                        src={getLengthIcon()}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        display: 'block',
                        position: 'relative'
                      }}
                    />
                  </div>
                    <p className="absolute bottom-[-6.9px] md:bottom-[-10px] left-1/2 transform -translate-x-1/2 text-[9px] w-full md:text-xs font-medium text-center" style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium", Futura, Inter, sans-serif' }}>
                      {customization.length}
                  </p>
                </div>

                {/* DENSITY */}
                <div
                  className="border relative text-center cursor-pointer border-black bg-white"
                  style={{
                    borderWidth: '1.3px',
                    width: '60px',
                    height: '80px',
                    boxSizing: 'border-box',
                    padding: '0',
                    overflow: 'visible'
                  }}
                  onClick={() => handleOptionSelect('density', '200%')}
                >
                  <p
                    className="text-[12px] md:text-base text-black absolute top-0 left-1/2 transform -translate-x-1/2 w-full"
                    style={{ fontFamily: '"Covered By Your Grace", cursive' }}
                  >
                    DENSITY
                  </p>
                  <div
                    className="absolute left-1/2 transform -translate-x-1/2 z-[99999] flex items-center justify-center"
                    style={{
                      width: (() => {
                        const pathname = location.pathname;
                        const isBlancoRoute = pathname.startsWith('/build-a-wig/blanco') || 
                                             pathname.includes('/blanco/customize') || 
                                             pathname.includes('/blanco/edit');
                        return isBlancoRoute ? '80px' : '57px';
                      })(),
                      height: (() => {
                        const pathname = location.pathname;
                        const isBlancoRoute = pathname.startsWith('/build-a-wig/blanco') || 
                                             pathname.includes('/blanco/customize') || 
                                             pathname.includes('/blanco/edit');
                        return isBlancoRoute ? '80px' : '57px';
                      })(),
                      overflow: 'visible',
                      top: '55%',
                      transform: 'translateX(-50%) translateY(-50%)'
                    }}
                  >
                    <img
                      alt="Card image"
                      src={getDensityIcon()}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        display: 'block',
                        position: 'relative'
                      }}
                    />
                  </div>
                    <p className="absolute bottom-[-6.9px] md:bottom-[-10px] left-1/2 transform -translate-x-1/2 text-[9px] w-full md:text-xs font-medium text-center" style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium", Futura, Inter, sans-serif' }}>
                    {customization.density}
                  </p>
                </div>
              </div>
            </div>

              {/* PREMIUM OPTIONS */}
            <div className="flex flex-col gap-3 mx-auto mb-6" style={{ marginTop: '18px', transform: 'translateY(3px)' }}>
                <p className="text-[9px] sm:text-sm md:text-base lg:text-lg font-medium text-black text-center" style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontWeight: '500' }}>
                PREMIUM MEMBERSHIP OPTIONS:
              </p>
                <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6 mx-auto justify-evenly">
                {/* LACE */}
                <div
                  className="border relative text-center cursor-pointer border-black bg-white"
                  style={{
                    borderWidth: '1.3px',
                    width: '60px',
                    height: '80px',
                    boxSizing: 'border-box',
                    padding: '0',
                    overflow: 'visible'
                  }}
                  onClick={() => handleOptionSelect('lace', '13X6')}
                >
                  <p
                    className="text-[12px] md:text-base text-black absolute top-0 left-1/2 transform -translate-x-1/2 w-full"
                    style={{ fontFamily: '"Covered By Your Grace", cursive' }}
                  >
                    LACE
                  </p>
                  <div
                    className="absolute left-1/2 transform -translate-x-1/2 z-[99999] flex items-center justify-center"
                    style={{
                      width: (() => {
                        const pathname = location.pathname;
                        const isBlancoRoute = pathname.startsWith('/build-a-wig/blanco') || 
                                             pathname.includes('/blanco/customize') || 
                                             pathname.includes('/blanco/edit');
                        return isBlancoRoute ? '44px' : '74px';
                      })(),
                      height: (() => {
                        const pathname = location.pathname;
                        const isBlancoRoute = pathname.startsWith('/build-a-wig/blanco') || 
                                             pathname.includes('/blanco/customize') || 
                                             pathname.includes('/blanco/edit');
                        return isBlancoRoute ? '44px' : '74px';
                      })(),
                      overflow: 'visible',
                      top: '52%',
                      transform: 'translateX(calc(-50% - 3px)) translateY(-50%)'
                    }}
                  >
                    <img
                      alt="Card image"
                        src={getLaceIcon()}
                      style={{
                        width: '100%',
                        height: '100%',
                          objectFit: 'contain',
                        display: 'block',
                        position: 'relative'
                      }}
                    />
                  </div>
                    <p className="absolute bottom-[-6.9px] md:bottom-[-10px] left-1/2 transform -translate-x-1/2 text-[9px] w-full md:text-xs font-medium text-center" style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium", Futura, Inter, sans-serif' }}>
                    {customization.lace}
                  </p>
                </div>

                {/* TEXTURE */}
                <div
                  className="border relative text-center cursor-pointer border-black bg-white"
                  style={{
                    borderWidth: '1.3px',
                    width: '60px',
                    height: '80px',
                    boxSizing: 'border-box',
                    padding: '0',
                    overflow: 'visible'
                  }}
                  onClick={() => handleOptionSelect('texture', 'SILKY')}
                >
                  <p
                    className="text-[12px] md:text-base text-black absolute top-0 left-1/2 transform -translate-x-1/2 w-full"
                    style={{ fontFamily: '"Covered By Your Grace", cursive' }}
                  >
                    TEXTURE
                  </p>
                  <div
                    className="absolute left-1/2 transform -translate-x-1/2 z-[99999] flex items-center justify-center"
                    style={{
                      width: (() => {
                        const isBlancoRoute = location.pathname.startsWith('/build-a-wig/blanco');
                        return isBlancoRoute ? '35.48px' : '83px';
                      })(),
                      height: (() => {
                        const isBlancoRoute = location.pathname.startsWith('/build-a-wig/blanco');
                        return isBlancoRoute ? '35.48px' : '83px';
                      })(),
                      overflow: 'visible',
                      top: (() => {
                        const isBlancoRoute = location.pathname.startsWith('/build-a-wig/blanco');
                        return isBlancoRoute ? 'calc(50% + 5px)' : 'calc(50% + 2px)';
                      })(),
                      transform: 'translateX(-50%) translateY(-50%)'
                    }}
                  >
                    <img
                      alt="Card image"
                        src={getTextureIcon()}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        display: 'block',
                        position: 'relative'
                      }}
                    />
                  </div>
                    <p className="absolute bottom-[-6.9px] md:bottom-[-10px] left-1/2 transform -translate-x-1/2 text-[9px] w-full md:text-xs font-medium text-center" style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium", Futura, Inter, sans-serif' }}>
                    {customization.texture}
                  </p>
                </div>

                {/* COLOR */}
                <div
                  className="border relative text-center cursor-pointer border-black bg-white"
                  style={{
                    borderWidth: '1.3px',
                    width: '60px',
                    height: '80px',
                    boxSizing: 'border-box',
                    padding: '0',
                    overflow: 'visible'
                  }}
                  onClick={() => {
                    const pathname = location.pathname;
                    const isBlancoRoute = pathname.startsWith('/build-a-wig/blanco');
                    const defaultColor = isBlancoRoute ? 'PLATINUM' : 'OFF BLACK';
                    handleOptionSelect('color', customization.color || defaultColor);
                  }}
                >
                  <p
                    className="text-[12px] md:text-base text-black absolute top-0 left-1/2 transform -translate-x-1/2 w-full"
                    style={{ fontFamily: '"Covered By Your Grace", cursive' }}
                  >
                    COLOR
                  </p>
                  <div
                    className="absolute left-1/2 transform -translate-x-1/2 z-[99999] flex items-center justify-center"
                    style={{
                        width: '35px',
                        height: '35px',
                      overflow: 'visible',
                      top: '55%',
                      transform: 'translateX(-50%) translateY(-50%)'
                    }}
                  >
                      <div
                      style={{
                        width: '100%',
                        height: '100%',
                          backgroundColor: '#808080',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        position: 'relative'
                        }}
                      >
                        <div
                          style={{
                            width: '81%',
                            height: '81%',
                            backgroundColor: '#FFFFFF',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <div
                            style={{
                              width: '76%',
                              height: '76%',
                              backgroundColor: getSelectedColorCode(),
                              borderRadius: '50%'
                      }}
                    />
                  </div>
                      </div>
                    </div>
                    <p className="absolute bottom-[-6.9px] md:bottom-[-10px] left-1/2 transform -translate-x-1/2 text-[9px] w-full md:text-xs font-medium text-center" style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium", Futura, Inter, sans-serif' }}>
                    {customization.color}
                  </p>
                </div>

                {/* HAIRLINE */}
                <div
                  className="border relative text-center cursor-pointer border-black bg-white"
                  style={{
                    borderWidth: '1.3px',
                    width: '60px',
                    height: '80px',
                    boxSizing: 'border-box',
                    padding: '0',
                    overflow: 'visible'
                  }}
                  onClick={() => handleOptionSelect('hairline', 'NATURAL')}
                >
                  <p
                    className="text-[12px] md:text-base text-black absolute top-0 left-1/2 transform -translate-x-1/2 w-full"
                    style={{ fontFamily: '"Covered By Your Grace", cursive' }}
                  >
                    HAIRLINE
                  </p>
                  <div
                    className="absolute left-1/2 transform -translate-x-1/2 z-[99999] flex items-center justify-center"
                    style={{
                      width: (() => {
                        const pathname = location.pathname;
                        const isBlancoRoute = pathname.startsWith('/build-a-wig/blanco') || 
                                             pathname.includes('/blanco/customize') || 
                                             pathname.includes('/blanco/edit');
                        return isBlancoRoute ? '45px' : '75px';
                      })(),
                      height: (() => {
                        const pathname = location.pathname;
                        const isBlancoRoute = pathname.startsWith('/build-a-wig/blanco') || 
                                             pathname.includes('/blanco/customize') || 
                                             pathname.includes('/blanco/edit');
                        return isBlancoRoute ? '45px' : '75px';
                      })(),
                      overflow: 'visible',
                        top: '50%',
                      transform: 'translateX(-50%) translateY(-50%)'
                    }}
                  >
                    <img
                      alt="Card image"
                        src={getHairlineIcon()}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        display: 'block',
                        position: 'relative'
                      }}
                    />
                  </div>
                    <p className="absolute bottom-[-6.9px] md:bottom-[-10px] left-1/2 transform -translate-x-1/2 text-[9px] w-full md:text-xs font-medium text-center" style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium", Futura, Inter, sans-serif' }}>
                    {getHairlineDisplayText()}
                  </p>
                </div>

                {/* STYLING */}
                <div
                    className="border relative text-center cursor-pointer border-black bg-white"
                  style={{
                    borderWidth: '1.3px',
                    width: '60px',
                    height: '80px',
                    boxSizing: 'border-box',
                    padding: '0',
                    overflow: 'visible'
                  }}
                  onClick={() => handleOptionSelect('styling', 'NONE')}
                >
                  <p
                      className="text-[12px] md:text-base text-black absolute top-0 left-1/2 transform -translate-x-1/2 w-full"
                    style={{ fontFamily: '"Covered By Your Grace", cursive' }}
                  >
                    STYLING
                  </p>
                  <div
                    className="absolute left-1/2 transform -translate-x-1/2 z-[99999] flex items-center justify-center"
                    style={{
                        width: getStylingIconSize(),
                        height: getStylingIconSize(),
                      overflow: 'visible',
                      top: getStylingIconTopPosition(),
                      transform: 'translateX(-50%) translateY(-50%)'
                    }}
                  >
                    <img
                      alt="None icon"
                      src={getStylingIcon()}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        display: 'block',
                        position: 'relative'
                      }}
                    />
                    </div>
                    <p className="absolute bottom-[-6.9px] md:bottom-[-10px] left-1/2 transform -translate-x-1/2 text-[9px] w-full md:text-xs font-medium text-center" style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium", Futura, Inter, sans-serif' }}>
                    {getStylingDisplayText()}
                  </p>
                </div>

                {/* ADD-ONS */}
                <div
                  className="border relative text-center cursor-pointer border-black bg-white"
                  style={{
                    borderWidth: '1.3px',
                    width: '60px',
                    height: '80px',
                    boxSizing: 'border-box',
                    padding: '0',
                    overflow: 'visible'
                  }}
                  onClick={() => handleOptionSelect('addOns', 'NONE')}
                >
                  <p
                    className="text-[12px] md:text-base text-black absolute top-0 left-1/2 transform -translate-x-1/2 w-full"
                    style={{ fontFamily: '"Covered By Your Grace", cursive' }}
                  >
                    ADD-ONS
                  </p>
                  <div
                    className="absolute left-1/2 transform -translate-x-1/2 z-[99999] flex items-center justify-center"
                    style={{
                        width: getAddOnsIconSize(),
                        height: getAddOnsIconSize(),
                      overflow: 'visible',
                      top: getAddOnsThumbnailTopPosition(),
                      transform: 'translateX(-50%) translateY(-50%)'
                    }}
                  >
                    <img
                      alt="None icon"
                      src={getAddOnsIcon()}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        display: 'block',
                        position: 'relative'
                      }}
                    />
                    </div>
                    <p className="absolute bottom-[-6.9px] md:bottom-[-10px] left-1/2 transform -translate-x-1/2 text-[9px] w-full md:text-xs font-medium text-center" style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium", Futura, Inter, sans-serif' }}>
                    {getAddOnsDisplayText()}
                  </p>
                </div>
              </div>
            </div>
            </div>

            {/* DYNAMIC PROCESSING TIME NOTE */}
            <p
              className="font-futura text-[10px] md:text-xs text-center my-6 w-[95%] mx-auto uppercase"
              style={{ color: '#EB1C24', fontFamily: '"Futura PT Demi", futuristic-pt, Futura, Inter, sans-serif', fontWeight: '500', transform: 'translateY(-7px)' }}
            >
        PLEASE NOTE: EACH CUSTOM UNIT IS MADE TO ORDER.<br />
        WE ENSURE ALL DETAILS ARE ACCURATE + PRECISE.<br />
        {processingTimeText}
            </p>

            {/* TOTAL PRICE */}
            <div className="text-center">
              <p className="font-futura text-[12px] md:text-sm lg:text-base font-medium" style={{ color: '#808080' }}>
                TOTAL DUE
              </p>
              <p
                className="text-black font-medium text-base md:text-xl lg:text-2xl"
                  style={{ fontFamily: '"Futura PT Medium", Futura, Inter, sans-serif', fontWeight: '500' }}
                  dangerouslySetInnerHTML={formatPrice(totalPrice)}
              />
            </div>
            </>
          )}
        </div>

        {!showMobileMenu && (
          <>
            {/* ADD TO BAG BUTTON */}
            <div className="px-0 md:px-0" style={{ marginTop: '2px' }}>
              <button
                onClick={handleAddToBag}
                disabled={addToBagState === 'adding' || (location.pathname === '/build-a-wig/edit' && !hasChanges)}
                className={`border border-black font-futura w-full md:max-w-sm lg:max-w-md text-center py-2 md:py-3 lg:py-4 text-[12px] md:text-sm lg:text-base font-semibold whitespace-nowrap ${
                  addToBagState === 'adding' ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer hover:bg-gray-50'
                }`}
                style={{ 
                  borderWidth: '1.3px', 
                  color: addToBagState === 'adding' ? '#EB1C24' : '#EB1C24', 
                  fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' 
                }}
              >
                {(() => {
                  const isEditPage = location.pathname === '/build-a-wig/edit' ||
                           location.pathname === '/build-a-wig/noir/edit' ||
                           location.pathname === '/build-a-wig/blanco/edit' ||
                           location.pathname === '/build-a-wig/soft-wave/edit' ||
                           location.pathname === '/build-a-wig/soft-curl/edit' ||
                           location.pathname === '/build-a-wig/beach-wave/edit' ||
                           location.pathname === '/build-a-wig/ocean-curl/edit';
                  
                  // Edit mode: show "SAVE CHANGES" > "SAVING..." > "IN THE BAG"
                  if (isEditPage) {
                    if (addToBagState === 'adding') {
                      return 'SAVING...';
                    }
                    if (hasChanges) {
                      return 'SAVE CHANGES';
                    } else {
                      return (
                        <span className="flex items-center justify-center gap-1">
                          <img src="/assets/check.svg" alt="Check" width="9" height="9" />
                          <span style={{ color: '#808080' }}>IN THE BAG</span>
                        </span>
                      );
                    }
                  }

                  if (isActiveBuildWigAppointmentMode()) {
                    if (addToBagState === 'adding') return 'ADDING...';
                    if (addToBagState === 'added') {
                      return (
                        <span className="flex items-center justify-center gap-1">
                          <img src="/assets/check.svg" alt="Check" width="9" height="9" />
                          <span style={{ color: '#808080' }}>ADDED TO APPOINTMENT</span>
                        </span>
                      );
                    }
                    return 'ADD TO APPOINTMENT';
                  }
                  
                  // Normal mode: standard button states
                  if (addToBagState === 'idle') return 'ADD TO BAG';
                  if (addToBagState === 'adding') return 'ADDING...';
                  if (addToBagState === 'added') {
                    return (
                      <span className="flex items-center justify-center gap-1">
                        <img src="/assets/check.svg" alt="Check" width="9" height="9" />
                        <span style={{ color: '#808080' }}>IN THE BAG</span>
                      </span>
                    );
                  }
                  return 'ADD TO BAG';
                })()}
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

      <ConfirmationModal
        isOpen={showPremiumMembershipHubModal}
        onClose={() => setShowPremiumMembershipHubModal(false)}
        onConfirm={() => {
          setShowPremiumMembershipHubModal(false);
          prepareMembershipUpgradeNavigation();
          navigate('/account/rewards');
        }}
        title="UPGRADE YOUR SUBSCRIPTION?"
        message="YOU MUST BE A PREMIUM MEMBER TO USE THIS FEATURE."
        confirmText="UPGRADE"
        cancelText="CANCEL"
        dataAttribute="upgrade-subscription-modal-build-a-wig-hub-premium-options"
      />
    </>
  );
}