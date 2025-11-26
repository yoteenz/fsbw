import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoadingScreen from '../../components/base/LoadingScreen';
import DynamicCartIcon from '../../components/DynamicCartIcon';

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
  const [selectedView, setSelectedView] = useState(1);
  const [showLoading, setShowLoading] = useState(true);
  
  // Track the current route to detect navigation changes
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [routeKey, setRouteKey] = useState(location.pathname);
  
  // Track current editing item ID to detect when switching between products
  const currentEditingItemIdRef = useRef<string | null>(null);
  
  const [customization, setCustomization] = useState<WigCustomization>(() => {
    // Use location.pathname from React Router
    // Check if we're in edit mode or customize mode
    const currentPath = location.pathname;
    const isEditMode = currentPath === '/build-a-wig/edit';
    const isCustomizeMode = currentPath === '/build-a-wig/noir/customize';
    
    // If in customize mode, load cap size with defaults
    if (isCustomizeMode) {
      const savedCapSize = localStorage.getItem('selectedCapSize');
      if (savedCapSize) {
        console.log('BuildAWigPage - Initialize customize mode with cap size:', savedCapSize);
        return {
          capSize: savedCapSize,
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
    }
    
    // If in edit mode, load from editingCartItem
    if (isEditMode) {
      const editingCartItem = localStorage.getItem('editingCartItem');
      if (editingCartItem) {
        try {
          const item = JSON.parse(editingCartItem);
          console.log('BuildAWigPage - Loading edit mode selections:', item);
          
          // Return the cart item's selections
          return {
            capSize: item.capSize || 'M',
            length: item.length || '24"',
            density: item.density || '200%',
            lace: item.lace || '13X6',
            texture: item.texture || 'SILKY',
            color: item.color || 'OFF BLACK',
            hairline: item.hairline || 'NATURAL',
            styling: item.styling || 'NONE',
            addOns: item.addOns || [],
          };
        } catch (error) {
          console.error('BuildAWigPage - Error parsing editingCartItem:', error);
        }
      }
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

  // Calculate base price - always use base price of 740 (cap size price is added separately)
  // This allows capSizePrice to be tracked separately in debugging
  const basePrice = useMemo(() => {
    return 740; // Base price is always 740, flexible caps add $40 via capSizePrice
  }, []);
  
  // Helper function to calculate prices from selections
  const calculatePricesFromSelections = useCallback((selections: WigCustomization) => {
    // Calculate cap size price: flexible caps (XXS/XS/S, S/M/L) cost $40 more than regular caps
    let capSizePrice = 0;
    if (selections.capSize === 'XXS/XS/S' || selections.capSize === 'S/M/L') {
      capSizePrice = 40; // Flexible caps cost $40 more
    }
    
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
    
    // Calculate color price
    if (selections.color && selections.color !== 'OFF BLACK') {
      prices.colorPrice = 100;
      
      // Add extra $40 for lengths over 30" (excluding OFF BLACK)
      if (selections.length && ['30"', '32"', '34"', '36"', '40"'].includes(selections.length)) {
        prices.colorPrice += 40;
      }
    }
    
    // Calculate density price
    const densityPrices: { [key: string]: number } = {
      '150%': 0,
      '200%': 0,
      '250%': 50,
      '300%': 100
    };
    prices.densityPrice = densityPrices[selections.density] || 0;
    
    // Calculate lace price
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
    prices.lacePrice = lacePrices[selections.lace] || 0;
    
    // Calculate texture price (all are 0)
    prices.texturePrice = 0;
    
    // Calculate hairline price
    const hairlinePrices: { [key: string]: number } = {
      'NATURAL': 0,
      'PREMIUM': 20
    };
    prices.hairlinePrice = hairlinePrices[selections.hairline] || 0;
    
    // Calculate styling price
    const stylingPrices: { [key: string]: number } = {
      'NONE': 0,
      'BANGS': 40,
      'CRIMPS': 60,
      'FLAT IRON': 60,
      'LAYERS': 60
    };
    prices.stylingPrice = stylingPrices[selections.styling] || 0;
    
    // Calculate add-ons price
    const addOnPrices: { [key: string]: number } = {
      'BLEACH': 40,
      'PLUCK': 40,
      'BLUNT CUT': 20
    };
    prices.addOnsPrice = (selections.addOns || []).reduce((total: number, addOn: string) => {
      return total + (addOnPrices[addOn] || 0);
    }, 0);
    
    return prices;
  }, []);
  
  // Helper function to save prices with correct prefix (editSelected in edit mode, customizeSelected in customize mode, selected otherwise)
  const savePricesToLocalStorage = useCallback((prices: { [key: string]: number }) => {
    const isEditMode = location.pathname === '/build-a-wig/edit' && localStorage.getItem('editingCartItem') !== null;
    const isCustomizeMode = location.pathname === '/build-a-wig/noir/customize';
    
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
  
  // Visual debugging state for mobile
  const [debugInfo, setDebugInfo] = useState<{
    mode: string;
    prefix: string;
    prices: { [key: string]: number };
    localStorageValues: { [key: string]: string };
    total: number;
  } | null>(null);
  
  // Ref to track if we're currently loading from localStorage (to prevent sync effect from overwriting)
  const isLoadingFromStorage = useRef(false);

  // REMOVED: isEditingMode, originalItem, hasChanges - editing is handled by noir/edit page, not this page

  // Load selections from localStorage when returning from sub-pages or in edit mode
  useEffect(() => {
    // Check if we're on the build-a-wig page, edit page, or customize page (not a sub-page)
    // NOTE: Removed check for '/' since root path now goes to lobby page
    const isMainPage = location.pathname === '/build-a-wig';
    const isEditPage = location.pathname === '/build-a-wig/edit';
    const isCustomizePage = location.pathname === '/build-a-wig/noir/customize';
    
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
      // DEBUGGING: Log that we're in customize mode
      console.log('[CUSTOMIZE MODE DETECTED]', {
        pathname: location.pathname,
        comingFromSubPage: sessionStorage.getItem('comingFromSubPage') === 'true',
        timestamp: new Date().toISOString()
      });
      
      // Set flag to prevent sync effect from overwriting
      isLoadingFromStorage.current = true;
      
      const comingFromSubPage = sessionStorage.getItem('comingFromSubPage') === 'true';
      // When NOT coming from sub-page (first load), prioritize selectedCapSize (set by customize button)
      // When coming from sub-page, prioritize customizeSelectedCapSize (set by sub-pages)
      const savedCapSize = comingFromSubPage 
        ? (localStorage.getItem('customizeSelectedCapSize') || localStorage.getItem('selectedCapSize'))
        : (localStorage.getItem('selectedCapSize') || localStorage.getItem('customizeSelectedCapSize'));
      
      // If coming from sub-page, load updated values from localStorage
      if (comingFromSubPage) {
        console.log('BuildAWigPage - Customize mode: Returning from sub-page, loading updated values from localStorage');
        
        // Load updated values from localStorage (set by sub-pages)
        // Prioritize customizeSelected* keys, fall back to selected* keys
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
        const savedLengthSelected = localStorage.getItem('selectedLength');
        const savedDensitySelected = localStorage.getItem('selectedDensity');
        const savedLaceSelected = localStorage.getItem('selectedLace');
        const savedTextureSelected = localStorage.getItem('selectedTexture');
        const savedColorSelected = localStorage.getItem('selectedColor');
        const savedHairlineSelected = localStorage.getItem('selectedHairline');
        const savedStylingSelected = localStorage.getItem('selectedStyling');
        const savedAddOnsSelected = localStorage.getItem('selectedAddOns');
        
        // Fall back to selected* keys if customizeSelected* keys don't exist
        // Use current customization state as fallback to preserve existing selections
        const savedCapSizeFinal = savedCapSizeCustomize || savedCapSize || customization.capSize || 'M';
        const savedLength = savedLengthCustomize || savedLengthSelected || customization.length || '24"';
        const savedDensity = savedDensityCustomize || savedDensitySelected || customization.density || '200%';
        const savedLace = savedLaceCustomize || savedLaceSelected || customization.lace || '13X6';
        const savedTexture = savedTextureCustomize || savedTextureSelected || customization.texture || 'SILKY';
        const savedColor = savedColorCustomize || savedColorSelected || customization.color || 'OFF BLACK';
        const savedHairline = savedHairlineCustomize || savedHairlineSelected || customization.hairline || 'NATURAL';
        const savedStyling = savedStylingCustomize || savedStylingSelected || customization.styling || 'NONE';
        const savedAddOns = savedAddOnsCustomize || savedAddOnsSelected || JSON.stringify(customization.addOns) || '[]';
        
        console.log('BuildAWigPage - Customize mode: Loaded values from localStorage:', {
          savedCapSize: savedCapSizeFinal,
          savedLength,
          savedDensity,
          savedLace,
          savedTexture,
          savedColor,
          savedHairline,
          savedStyling,
          savedAddOns,
          fromCustomizeSelected: {
            capSize: !!savedCapSizeCustomize,
            length: !!savedLengthCustomize,
            density: !!savedDensityCustomize,
            lace: !!savedLaceCustomize,
            texture: !!savedTextureCustomize,
            color: !!savedColorCustomize,
            hairline: !!savedHairlineCustomize,
            styling: !!savedStylingCustomize,
            addOns: !!savedAddOnsCustomize
          },
          fromSelected: {
            length: !!savedLengthSelected,
            density: !!savedDensitySelected,
            lace: !!savedLaceSelected,
            texture: !!savedTextureSelected,
            color: !!savedColorSelected,
            hairline: !!savedHairlineSelected,
            styling: !!savedStylingSelected,
            addOns: !!savedAddOnsSelected
          },
          currentCustomization: customization
        });
        
        // CRITICAL: Ensure styling is not a part selection (MIDDLE, LEFT, RIGHT) - it should be NONE or a valid styling option
        let validStyling = savedStyling !== null && savedStyling !== 'NONE' ? savedStyling : 'NONE';
        const partSelectionOptions = ['MIDDLE', 'LEFT', 'RIGHT'];
        if (partSelectionOptions.includes(validStyling)) {
          validStyling = 'NONE'; // If styling is a part selection, set to NONE
        }
        
        const updatedCustomization = {
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
        
        console.log('BuildAWigPage - Customize mode: Setting customization state with updated values:', updatedCustomization);
        
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
        
        // DEBUGGING: Log prices being loaded in customize mode
        console.log('[CUSTOMIZE MODE - PRICE LOADING]', {
          source: 'Returning from sub-page',
          loadedPrices: {
            capSizePrice: savedCapSizePrice,
            colorPrice: savedColorPrice,
            lengthPrice: savedLengthPrice,
            densityPrice: savedDensityPrice,
            lacePrice: savedLacePrice,
            texturePrice: savedTexturePrice,
            hairlinePrice: savedHairlinePrice,
            stylingPrice: savedStylingPrice,
            addOnsPrice: savedAddOnsPrice
          },
          customizeSelectedPrices: {
            capSizePrice: localStorage.getItem('customizeSelectedCapSizePrice'),
            colorPrice: localStorage.getItem('customizeSelectedColorPrice'),
            lengthPrice: localStorage.getItem('customizeSelectedLengthPrice'),
            densityPrice: localStorage.getItem('customizeSelectedDensityPrice'),
            lacePrice: localStorage.getItem('customizeSelectedLacePrice'),
            texturePrice: localStorage.getItem('customizeSelectedTexturePrice'),
            hairlinePrice: localStorage.getItem('customizeSelectedHairlinePrice'),
            stylingPrice: localStorage.getItem('customizeSelectedStylingPrice'),
            addOnsPrice: localStorage.getItem('customizeSelectedAddOnsPrice')
          },
          selectedPrices: {
            capSizePrice: localStorage.getItem('selectedCapSizePrice'),
            colorPrice: localStorage.getItem('selectedColorPrice'),
            lengthPrice: localStorage.getItem('selectedLengthPrice'),
            densityPrice: localStorage.getItem('selectedDensityPrice'),
            lacePrice: localStorage.getItem('selectedLacePrice'),
            texturePrice: localStorage.getItem('selectedTexturePrice'),
            hairlinePrice: localStorage.getItem('selectedHairlinePrice'),
            stylingPrice: localStorage.getItem('selectedStylingPrice'),
            addOnsPrice: localStorage.getItem('selectedAddOnsPrice')
          }
        });
        
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
        // CRITICAL: Always use calculated capSizePrice (it depends on current cap size selection)
        // For other prices, use saved prices if they exist, otherwise use calculated prices
        const pricesToSave = {
          capSizePrice: calculatedPrices.capSizePrice, // Always recalculate based on current cap size
          colorPrice: savedColorPrice ? parseFloat(savedColorPrice) : calculatedPrices.colorPrice,
          lengthPrice: savedLengthPrice ? parseFloat(savedLengthPrice) : calculatedPrices.lengthPrice,
          densityPrice: savedDensityPrice ? parseFloat(savedDensityPrice) : calculatedPrices.densityPrice,
          lacePrice: savedLacePrice ? parseFloat(savedLacePrice) : calculatedPrices.lacePrice,
          texturePrice: savedTexturePrice ? parseFloat(savedTexturePrice) : calculatedPrices.texturePrice,
          hairlinePrice: savedHairlinePrice ? parseFloat(savedHairlinePrice) : calculatedPrices.hairlinePrice,
          stylingPrice: savedStylingPrice ? parseFloat(savedStylingPrice) : calculatedPrices.stylingPrice,
          addOnsPrice: savedAddOnsPrice ? parseFloat(savedAddOnsPrice) : calculatedPrices.addOnsPrice,
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
          console.log('BuildAWigPage - Customize mode: Cleared loading flag, sync effect can now run');
        }, 300);
      } else if (savedCapSize) {
        // First load: Load cap size with defaults for other selections
        console.log('BuildAWigPage - Customize mode: Loading cap size with defaults:', savedCapSize);
        
        // Load existing selections from customizeSelected* keys if they exist, otherwise use defaults
        const existingLength = localStorage.getItem('customizeSelectedLength') || localStorage.getItem('selectedLength') || '24"';
        const existingDensity = localStorage.getItem('customizeSelectedDensity') || localStorage.getItem('selectedDensity') || '200%';
        const existingLace = localStorage.getItem('customizeSelectedLace') || localStorage.getItem('selectedLace') || '13X6';
        const existingTexture = localStorage.getItem('customizeSelectedTexture') || localStorage.getItem('selectedTexture') || 'SILKY';
        const existingColor = localStorage.getItem('customizeSelectedColor') || localStorage.getItem('selectedColor') || 'OFF BLACK';
        const existingHairline = localStorage.getItem('customizeSelectedHairline') || localStorage.getItem('selectedHairline') || 'NATURAL';
        const existingStyling = localStorage.getItem('customizeSelectedStyling') || localStorage.getItem('selectedStyling') || 'NONE';
        const existingAddOns = localStorage.getItem('customizeSelectedAddOns') || localStorage.getItem('selectedAddOns') || '[]';
        
        // Ensure styling is valid
        let validStyling = existingStyling !== null && existingStyling !== 'NONE' ? existingStyling : 'NONE';
        const partSelectionOptions = ['MIDDLE', 'LEFT', 'RIGHT'];
        if (partSelectionOptions.includes(validStyling)) {
          validStyling = 'NONE';
        }
        
        const initialCustomization = {
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
        
        console.log('BuildAWigPage - Customize mode: Setting initial customization:', initialCustomization);
        
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
        
        // Calculate prices - capSizePrice is always calculated based on current selection
        const calculatedPrices = calculatePricesFromSelections(initialCustomization);
        
        // Use existing prices if they exist, otherwise use calculated prices
        // CRITICAL: Always use calculated capSizePrice (it depends on current cap size selection)
        const pricesToSave = {
          capSizePrice: calculatedPrices.capSizePrice, // Always recalculate based on current cap size
          colorPrice: existingColorPrice ? parseFloat(existingColorPrice) : calculatedPrices.colorPrice,
          lengthPrice: existingLengthPrice ? parseFloat(existingLengthPrice) : calculatedPrices.lengthPrice,
          densityPrice: existingDensityPrice ? parseFloat(existingDensityPrice) : calculatedPrices.densityPrice,
          lacePrice: existingLacePrice ? parseFloat(existingLacePrice) : calculatedPrices.lacePrice,
          texturePrice: existingTexturePrice ? parseFloat(existingTexturePrice) : calculatedPrices.texturePrice,
          hairlinePrice: existingHairlinePrice ? parseFloat(existingHairlinePrice) : calculatedPrices.hairlinePrice,
          stylingPrice: existingStylingPrice ? parseFloat(existingStylingPrice) : calculatedPrices.stylingPrice,
          addOnsPrice: existingAddOnsPrice ? parseFloat(existingAddOnsPrice) : calculatedPrices.addOnsPrice,
        };
        
        // DEBUGGING: Log prices being calculated and saved in customize mode (first load)
        console.log('[CUSTOMIZE MODE - PRICE CALCULATION]', {
          source: 'First load',
          customization: initialCustomization,
          existingPrices: {
            capSizePrice: 'always recalculated',
            colorPrice: existingColorPrice,
            lengthPrice: existingLengthPrice,
            densityPrice: existingDensityPrice,
            lacePrice: existingLacePrice,
            texturePrice: existingTexturePrice,
            hairlinePrice: existingHairlinePrice,
            stylingPrice: existingStylingPrice,
            addOnsPrice: existingAddOnsPrice
          },
          calculatedPrices,
          pricesToSave,
          savingTo: {
            customizeSelected: true,
            selected: true
          }
        });
        
        savePricesToLocalStorage(pricesToSave);
        
        // Trigger price recalculation
        setRefreshTrigger(prev => prev + 1);
      }
      
      // Clear flag after a short delay to allow state update to complete
      setTimeout(() => {
        isLoadingFromStorage.current = false;
      }, 100);
    } else if (isEditPage) {
      // Set flag to prevent sync effect from overwriting
      isLoadingFromStorage.current = true;
      
      // Load from editingCartItem for edit mode
      const editingCartItem = localStorage.getItem('editingCartItem');
      const editingCartItemId = localStorage.getItem('editingCartItemId');
      const comingFromSubPage = sessionStorage.getItem('comingFromSubPage') === 'true';
      
      // Check if this is a different item - if so, we need to reload
      const isDifferentItem = editingCartItemId && editingCartItemId !== currentEditingItemIdRef.current;
      
      // If coming from sub-page, load updated values from localStorage
      // CRITICAL: Check if we're in edit mode AND either the item ID matches OR we don't have a current item ID yet
      if (comingFromSubPage && editingCartItemId && (editingCartItemId === currentEditingItemIdRef.current || !currentEditingItemIdRef.current)) {
        console.log('BuildAWigPage - Edit mode: Returning from sub-page, loading updated values from localStorage', {
          editingCartItemId,
          currentEditingItemIdRef: currentEditingItemIdRef.current,
          comingFromSubPage
        });
        
        // Set flag to prevent sync effect from overwriting
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
        
        // Fall back to selected* keys if editSelected* keys don't exist
        const savedCapSize = savedCapSizeEdit || localStorage.getItem('selectedCapSize');
        const savedLength = savedLengthEdit || localStorage.getItem('selectedLength');
        const savedDensity = savedDensityEdit || localStorage.getItem('selectedDensity');
        const savedLace = savedLaceEdit || localStorage.getItem('selectedLace');
        const savedTexture = savedTextureEdit || localStorage.getItem('selectedTexture');
        const savedColor = savedColorEdit || localStorage.getItem('selectedColor');
        const savedHairline = savedHairlineEdit || localStorage.getItem('selectedHairline');
        const savedStyling = savedStylingEdit || localStorage.getItem('selectedStyling');
        const savedAddOns = savedAddOnsEdit || localStorage.getItem('selectedAddOns');
        
        console.log('BuildAWigPage - Edit mode: Loaded values from localStorage:', {
          savedCapSize,
          savedLength,
          savedDensity,
          savedLace,
          savedTexture,
          savedColor,
          savedHairline,
          savedStyling,
          savedAddOns,
          fromEditSelected: {
            capSize: !!savedCapSizeEdit,
            length: !!savedLengthEdit,
            density: !!savedDensityEdit,
            lace: !!savedLaceEdit,
            texture: !!savedTextureEdit,
            color: !!savedColorEdit,
            hairline: !!savedHairlineEdit,
            styling: !!savedStylingEdit,
            addOns: !!savedAddOnsEdit
          }
        });
        
        // Always load from localStorage when coming from sub-page
      // CRITICAL: Ensure styling is not a part selection (MIDDLE, LEFT, RIGHT) - it should be NONE or a valid styling option
          let validStyling = savedStyling !== null ? savedStyling : 'NONE';
      const partSelectionOptions = ['MIDDLE', 'LEFT', 'RIGHT'];
      if (partSelectionOptions.includes(validStyling)) {
        validStyling = 'NONE'; // If styling is a part selection, set to NONE
      }
      
          const updatedCustomization = {
            capSize: savedCapSize || 'M',
            length: savedLength || '24"',
            density: savedDensity || '200%',
            lace: savedLace || '13X6',
            texture: savedTexture || 'SILKY',
            color: savedColor || 'OFF BLACK',
            hairline: savedHairline || 'NATURAL',
        styling: validStyling,
        addOns: savedAddOns ? JSON.parse(savedAddOns) : [],
          };
          
          console.log('BuildAWigPage - Edit mode: Setting customization state with updated values:', updatedCustomization);
        
        // CRITICAL: Also save to both selected* and editSelected* keys immediately to ensure they're available
        localStorage.setItem('selectedCapSize', updatedCustomization.capSize);
        localStorage.setItem('selectedLength', updatedCustomization.length);
        localStorage.setItem('selectedDensity', updatedCustomization.density);
        localStorage.setItem('selectedLace', updatedCustomization.lace);
        localStorage.setItem('selectedTexture', updatedCustomization.texture);
        localStorage.setItem('selectedColor', updatedCustomization.color);
        localStorage.setItem('selectedHairline', updatedCustomization.hairline);
        localStorage.setItem('selectedStyling', validStyling);
        localStorage.setItem('selectedAddOns', JSON.stringify(updatedCustomization.addOns));
        
        localStorage.setItem('editSelectedCapSize', updatedCustomization.capSize);
        localStorage.setItem('editSelectedLength', updatedCustomization.length);
        localStorage.setItem('editSelectedDensity', updatedCustomization.density);
        localStorage.setItem('editSelectedLace', updatedCustomization.lace);
        localStorage.setItem('editSelectedTexture', updatedCustomization.texture);
        localStorage.setItem('editSelectedColor', updatedCustomization.color);
        localStorage.setItem('editSelectedHairline', updatedCustomization.hairline);
        localStorage.setItem('editSelectedStyling', validStyling);
        localStorage.setItem('editSelectedAddOns', JSON.stringify(updatedCustomization.addOns));
          
          // Update customization state (originalItem stays the same for change detection)
          setCustomization(updatedCustomization);
          
        // CRITICAL: Read prices from localStorage (saved by sub-pages) to preserve exact prices
        // Prioritize editSelected* prices, fall back to selected* prices
        const savedCapSizePrice = localStorage.getItem('editSelectedCapSizePrice') || localStorage.getItem('selectedCapSizePrice') || '0';
        const savedColorPrice = localStorage.getItem('editSelectedColorPrice') || localStorage.getItem('selectedColorPrice') || '0';
        const savedLengthPrice = localStorage.getItem('editSelectedLengthPrice') || localStorage.getItem('selectedLengthPrice') || '0';
        const savedDensityPrice = localStorage.getItem('editSelectedDensityPrice') || localStorage.getItem('selectedDensityPrice') || '0';
        const savedLacePrice = localStorage.getItem('editSelectedLacePrice') || localStorage.getItem('selectedLacePrice') || '0';
        const savedTexturePrice = localStorage.getItem('editSelectedTexturePrice') || localStorage.getItem('selectedTexturePrice') || '0';
        const savedHairlinePrice = localStorage.getItem('editSelectedHairlinePrice') || localStorage.getItem('selectedHairlinePrice') || '0';
        const savedStylingPrice = localStorage.getItem('editSelectedStylingPrice') || localStorage.getItem('selectedStylingPrice') || '0';
        const savedAddOnsPrice = localStorage.getItem('editSelectedAddOnsPrice') || localStorage.getItem('selectedAddOnsPrice') || '0';
        
        // DEBUGGING: Log prices being loaded in edit mode
        console.log('[EDIT MODE - PRICE LOADING]', {
          source: 'Returning from sub-page',
          loadedPrices: {
            capSizePrice: savedCapSizePrice,
            colorPrice: savedColorPrice,
            lengthPrice: savedLengthPrice,
            densityPrice: savedDensityPrice,
            lacePrice: savedLacePrice,
            texturePrice: savedTexturePrice,
            hairlinePrice: savedHairlinePrice,
            stylingPrice: savedStylingPrice,
            addOnsPrice: savedAddOnsPrice
          },
          editSelectedPrices: {
            capSizePrice: localStorage.getItem('editSelectedCapSizePrice'),
            colorPrice: localStorage.getItem('editSelectedColorPrice'),
            lengthPrice: localStorage.getItem('editSelectedLengthPrice'),
            densityPrice: localStorage.getItem('editSelectedDensityPrice'),
            lacePrice: localStorage.getItem('editSelectedLacePrice'),
            texturePrice: localStorage.getItem('editSelectedTexturePrice'),
            hairlinePrice: localStorage.getItem('editSelectedHairlinePrice'),
            stylingPrice: localStorage.getItem('editSelectedStylingPrice'),
            addOnsPrice: localStorage.getItem('editSelectedAddOnsPrice')
          },
          selectedPrices: {
            capSizePrice: localStorage.getItem('selectedCapSizePrice'),
            colorPrice: localStorage.getItem('selectedColorPrice'),
            lengthPrice: localStorage.getItem('selectedLengthPrice'),
            densityPrice: localStorage.getItem('selectedDensityPrice'),
            lacePrice: localStorage.getItem('selectedLacePrice'),
            texturePrice: localStorage.getItem('selectedTexturePrice'),
            hairlinePrice: localStorage.getItem('selectedHairlinePrice'),
            stylingPrice: localStorage.getItem('selectedStylingPrice'),
            addOnsPrice: localStorage.getItem('selectedAddOnsPrice')
          }
        });
        
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
        
        localStorage.setItem('editSelectedCapSizePrice', savedCapSizePrice);
        localStorage.setItem('editSelectedColorPrice', savedColorPrice);
        localStorage.setItem('editSelectedLengthPrice', savedLengthPrice);
        localStorage.setItem('editSelectedDensityPrice', savedDensityPrice);
        localStorage.setItem('editSelectedLacePrice', savedLacePrice);
        localStorage.setItem('editSelectedTexturePrice', savedTexturePrice);
        localStorage.setItem('editSelectedHairlinePrice', savedHairlinePrice);
        localStorage.setItem('editSelectedStylingPrice', savedStylingPrice);
        localStorage.setItem('editSelectedAddOnsPrice', savedAddOnsPrice);
        
        // Recalculate prices as fallback if any prices are missing, but prioritize saved prices
        const calculatedPrices = calculatePricesFromSelections(updatedCustomization);
        // CRITICAL: Always use calculated capSizePrice (it depends on current cap size selection)
        // For other prices, use saved prices if they exist, otherwise use calculated prices
        const pricesToSave = {
          capSizePrice: calculatedPrices.capSizePrice, // Always recalculate based on current cap size
          colorPrice: savedColorPrice ? parseFloat(savedColorPrice) : calculatedPrices.colorPrice,
          lengthPrice: savedLengthPrice ? parseFloat(savedLengthPrice) : calculatedPrices.lengthPrice,
          densityPrice: savedDensityPrice ? parseFloat(savedDensityPrice) : calculatedPrices.densityPrice,
          lacePrice: savedLacePrice ? parseFloat(savedLacePrice) : calculatedPrices.lacePrice,
          texturePrice: savedTexturePrice ? parseFloat(savedTexturePrice) : calculatedPrices.texturePrice,
          hairlinePrice: savedHairlinePrice ? parseFloat(savedHairlinePrice) : calculatedPrices.hairlinePrice,
          stylingPrice: savedStylingPrice ? parseFloat(savedStylingPrice) : calculatedPrices.stylingPrice,
          addOnsPrice: savedAddOnsPrice ? parseFloat(savedAddOnsPrice) : calculatedPrices.addOnsPrice,
        };
        savePricesToLocalStorage(pricesToSave);
        
        // Trigger price recalculation
        setRefreshTrigger(prev => prev + 1);
        
        // Force change detection to run after state update
        // Compare updatedCustomization with originalItem immediately (originalItem is in closure)
        // The change detection useEffect will also run when customization state updates, but this ensures it happens
        // Note: originalItem and hasChanges are defined later in the component
        if (originalItem) {
          const hasChangesDetected = 
            updatedCustomization.capSize !== originalItem.capSize ||
            updatedCustomization.length !== originalItem.length ||
            updatedCustomization.density !== originalItem.density ||
            updatedCustomization.lace !== originalItem.lace ||
            updatedCustomization.texture !== originalItem.texture ||
            updatedCustomization.color !== originalItem.color ||
            updatedCustomization.hairline !== originalItem.hairline ||
            updatedCustomization.styling !== originalItem.styling ||
            JSON.stringify(updatedCustomization.addOns) !== JSON.stringify(originalItem.addOns);
          
          console.log('BuildAWigPage - Edit mode: Change detection after returning from sub-page:', {
            hasChangesDetected,
            updatedColor: updatedCustomization.color,
            originalColor: originalItem.color,
            updatedLength: updatedCustomization.length,
            originalLength: originalItem.length
          });
          
          // Set hasChanges immediately - the useEffect will also run but this ensures it's set
          setHasChanges(hasChangesDetected);
        }
        
        // Clear the flag
        sessionStorage.removeItem('comingFromSubPage');
        
        // Clear loading flag after a short delay
        setTimeout(() => {
          isLoadingFromStorage.current = false;
        }, 100);
      } else if (editingCartItem && (isDifferentItem || !currentEditingItemIdRef.current)) {
        // First load or different item: load from editingCartItem
        try {
          const item = JSON.parse(editingCartItem);
          console.log('BuildAWigPage - Edit mode: Loading selections from cart item:', item);
          
          // CRITICAL: Ensure styling is not a part selection (MIDDLE, LEFT, RIGHT) - it should be NONE or a valid styling option
          let validStyling = item.styling || 'NONE';
          const partSelectionOptions = ['MIDDLE', 'LEFT', 'RIGHT'];
          if (partSelectionOptions.includes(validStyling)) {
            validStyling = 'NONE'; // If styling is a part selection, set to NONE
          }
          
          const editCustomization = {
            capSize: item.capSize || 'M',
            length: item.length || '24"',
            density: item.density || '200%',
            lace: item.lace || '13X6',
            texture: item.texture || 'SILKY',
            color: item.color || 'OFF BLACK',
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
          
          setCustomization(editCustomization);
          
          // Also update localStorage so sub-pages can read the edit values
          localStorage.setItem('selectedCapSize', item.capSize || 'M');
          localStorage.setItem('selectedLength', item.length || '24"');
          localStorage.setItem('selectedDensity', item.density || '200%');
          localStorage.setItem('selectedColor', item.color || 'OFF BLACK');
          localStorage.setItem('selectedTexture', item.texture || 'SILKY');
          localStorage.setItem('selectedLace', item.lace || '13X6');
          localStorage.setItem('selectedHairline', item.hairline || 'NATURAL');
          localStorage.setItem('selectedStyling', validStyling);
          localStorage.setItem('selectedAddOns', JSON.stringify(item.addOns || []));
          
          // Also save with 'editSelected' prefix for CartDropdown
          localStorage.setItem('editSelectedCapSize', item.capSize || 'M');
          localStorage.setItem('editSelectedLength', item.length || '24"');
          localStorage.setItem('editSelectedDensity', item.density || '200%');
          localStorage.setItem('editSelectedColor', item.color || 'OFF BLACK');
          localStorage.setItem('editSelectedTexture', item.texture || 'SILKY');
          localStorage.setItem('editSelectedLace', item.lace || '13X6');
          localStorage.setItem('editSelectedHairline', item.hairline || 'NATURAL');
          localStorage.setItem('editSelectedStyling', validStyling);
          localStorage.setItem('editSelectedAddOns', JSON.stringify(item.addOns || []));
          
          // Calculate and set prices based on the cart item's selections
          const calculatedPrices = calculatePricesFromSelections(editCustomization);
          savePricesToLocalStorage(calculatedPrices);
          
          // Set initial total price from cart item
          const currentBasePrice = (editCustomization.capSize === 'XXS/XS/S' || editCustomization.capSize === 'S/M/L') ? 780 : 740;
          const initialTotalPrice = currentBasePrice + 
            calculatedPrices.capSizePrice + 
            calculatedPrices.colorPrice + 
            calculatedPrices.lengthPrice + 
            calculatedPrices.densityPrice + 
            calculatedPrices.lacePrice + 
            calculatedPrices.texturePrice + 
            calculatedPrices.hairlinePrice + 
            calculatedPrices.stylingPrice + 
            calculatedPrices.addOnsPrice;
          setTotalPrice(initialTotalPrice);
          
          // Trigger price recalculation
          setRefreshTrigger(prev => prev + 1);
        } catch (error) {
          console.error('BuildAWigPage - Error parsing editingCartItem:', error);
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
        console.log('BuildAWigPage - Main mode: Returning from sub-page, loading updated values from localStorage');
        
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

        console.log('BuildAWigPage - Main mode: Loaded values from localStorage:', {
          savedCapSize,
          savedLength,
          savedDensity,
          savedLace,
          savedTexture,
          savedColor,
          savedHairline,
          savedStyling,
          savedAddOns
        });

        // Always load from localStorage when coming from sub-page
        // Use current customization state as fallback to preserve existing selections (like customize mode)
        const savedCapSizeFinal = savedCapSize || customization.capSize || 'M';
        const savedLengthFinal = savedLength || customization.length || '24"';
        const savedDensityFinal = savedDensity || customization.density || '200%';
        const savedLaceFinal = savedLace || customization.lace || '13X6';
        const savedTextureFinal = savedTexture || customization.texture || 'SILKY';
        const savedColorFinal = savedColor || customization.color || 'OFF BLACK';
        const savedHairlineFinal = savedHairline || customization.hairline || 'NATURAL';
        const savedStylingFinal = savedStyling || customization.styling || 'NONE';
        const savedAddOnsFinal = savedAddOns || JSON.stringify(customization.addOns) || '[]';
        
        // CRITICAL: Ensure styling is not a part selection (MIDDLE, LEFT, RIGHT) - it should be NONE or a valid styling option
        let validStyling = savedStylingFinal !== null && savedStylingFinal !== 'NONE' ? savedStylingFinal : 'NONE';
        const partSelectionOptions = ['MIDDLE', 'LEFT', 'RIGHT'];
        if (partSelectionOptions.includes(validStyling)) {
          validStyling = 'NONE'; // If styling is a part selection, set to NONE
        }
        
        const updatedCustomization = {
          capSize: savedCapSizeFinal,
          length: savedLengthFinal,
          density: savedDensityFinal,
          lace: savedLaceFinal,
          texture: savedTextureFinal,
          color: savedColorFinal,
          hairline: savedHairlineFinal,
          styling: validStyling,
          addOns: savedAddOnsFinal ? JSON.parse(savedAddOnsFinal) : [],
        };
        
        console.log('BuildAWigPage - Main mode: Setting customization state with updated values:', updatedCustomization);
        
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
        
        // Update customization state - this will trigger wigViews to update via useMemo dependency
        setCustomization(updatedCustomization);
        
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
        
        // DEBUGGING: Log prices being loaded in main mode
        console.log('[MAIN MODE - PRICE LOADING]', {
          source: 'Returning from sub-page',
          loadedPrices: {
            capSizePrice: savedCapSizePrice,
            colorPrice: savedColorPrice,
            lengthPrice: savedLengthPrice,
            densityPrice: savedDensityPrice,
            lacePrice: savedLacePrice,
            texturePrice: savedTexturePrice,
            hairlinePrice: savedHairlinePrice,
            stylingPrice: savedStylingPrice,
            addOnsPrice: savedAddOnsPrice
          },
          selectedPrices: {
            capSizePrice: localStorage.getItem('selectedCapSizePrice'),
            colorPrice: localStorage.getItem('selectedColorPrice'),
            lengthPrice: localStorage.getItem('selectedLengthPrice'),
            densityPrice: localStorage.getItem('selectedDensityPrice'),
            lacePrice: localStorage.getItem('selectedLacePrice'),
            texturePrice: localStorage.getItem('selectedTexturePrice'),
            hairlinePrice: localStorage.getItem('selectedHairlinePrice'),
            stylingPrice: localStorage.getItem('selectedStylingPrice'),
            addOnsPrice: localStorage.getItem('selectedAddOnsPrice')
          }
        });
        
        // Recalculate prices as fallback if any prices are missing, but prioritize saved prices
        const calculatedPrices = calculatePricesFromSelections(updatedCustomization);
        // CRITICAL: Always use calculated capSizePrice (it depends on current cap size selection)
        // For other prices, use saved prices if they exist, otherwise use calculated prices
        const pricesToSave = {
          capSizePrice: calculatedPrices.capSizePrice, // Always recalculate based on current cap size
          colorPrice: savedColorPrice ? parseFloat(savedColorPrice) : calculatedPrices.colorPrice,
          lengthPrice: savedLengthPrice ? parseFloat(savedLengthPrice) : calculatedPrices.lengthPrice,
          densityPrice: savedDensityPrice ? parseFloat(savedDensityPrice) : calculatedPrices.densityPrice,
          lacePrice: savedLacePrice ? parseFloat(savedLacePrice) : calculatedPrices.lacePrice,
          texturePrice: savedTexturePrice ? parseFloat(savedTexturePrice) : calculatedPrices.texturePrice,
          hairlinePrice: savedHairlinePrice ? parseFloat(savedHairlinePrice) : calculatedPrices.hairlinePrice,
          stylingPrice: savedStylingPrice ? parseFloat(savedStylingPrice) : calculatedPrices.stylingPrice,
          addOnsPrice: savedAddOnsPrice ? parseFloat(savedAddOnsPrice) : calculatedPrices.addOnsPrice,
        };
        
        // Save prices to localStorage to ensure they're preserved
        savePricesToLocalStorage(pricesToSave);
        
        // Trigger price recalculation
        setRefreshTrigger(prev => prev + 1);
        
        // Clear the flag
        sessionStorage.removeItem('comingFromSubPage');
        
        // Clear loading flag after a short delay to allow state updates to propagate
        // Use a longer delay to ensure React state updates have propagated and sync effect won't overwrite
        setTimeout(() => {
          isLoadingFromStorage.current = false;
          console.log('BuildAWigPage - Main mode: Cleared loading flag, sync effect can now run');
        }, 300);
      }
    }
  }, [location.pathname, routeKey]); // Run when route changes
  
  // Listen for storage changes (when sub-pages update localStorage)
  // NOTE: This is disabled for main mode - main mode loads from localStorage in the route change effect instead
  // This prevents conflicts when returning from sub-pages
  useEffect(() => {
    const handleStorageChange = () => {
      // Skip if we're currently loading from localStorage to prevent conflicts
      if (isLoadingFromStorage.current) {
        return;
      }
      
      // Skip for main mode - main mode handles loading in the route change effect
      const isMainPage = location.pathname === '/build-a-wig';
      if (isMainPage) {
        return; // Don't handle storage changes for main mode - let route change effect handle it
      }
      
      // Only handle storage changes for edit and customize modes
      const isEditMode = location.pathname === '/build-a-wig/edit' && localStorage.getItem('editingCartItem') !== null;
      const isCustomizeMode = location.pathname === '/build-a-wig/noir/customize';
      
      if (isEditMode || isCustomizeMode) {
        const savedCapSize = localStorage.getItem('selectedCapSize');
        const savedLength = localStorage.getItem('selectedLength');
        const savedDensity = localStorage.getItem('selectedDensity');
        const savedLace = localStorage.getItem('selectedLace');
        const savedTexture = localStorage.getItem('selectedTexture');
        const savedColor = localStorage.getItem('selectedColor');
        const savedHairline = localStorage.getItem('selectedHairline');
        const savedStyling = localStorage.getItem('selectedStyling');
        const savedAddOns = localStorage.getItem('selectedAddOns');
        
        // CRITICAL: Ensure styling is not a part selection (MIDDLE, LEFT, RIGHT) - it should be NONE or a valid styling option
        let validStyling = savedStyling !== null ? savedStyling : 'NONE';
        const partSelectionOptions = ['MIDDLE', 'LEFT', 'RIGHT'];
        if (partSelectionOptions.includes(validStyling)) {
          validStyling = 'NONE'; // If styling is a part selection, set to NONE
          // Also update localStorage to fix the incorrect value
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
      const isEditPage = location.pathname === '/build-a-wig/edit';
      
      if (isEditPage) {
        const newItemId = event.detail?.itemId;
        
        // Check if this is a different item
        if (newItemId && newItemId !== currentEditingItemIdRef.current) {
          console.log('BuildAWigPage - Different item selected for editing, reloading:', {
            currentItemId: currentEditingItemIdRef.current,
            newItemId: newItemId
          });
          
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

  // CRITICAL: Sync customization state to localStorage whenever it changes
  // This ensures sub-pages see the current selections from the main page
  useEffect(() => {
    // Skip syncing if we're currently loading from localStorage (to avoid circular updates)
    if (isLoadingFromStorage.current) {
      console.log('Main page - Skipping sync (loading from storage)');
      return;
    }
    
    // Check if we're in edit mode or customize mode
    const isEditMode = location.pathname === '/build-a-wig/edit' && localStorage.getItem('editingCartItem') !== null;
    const isCustomizeMode = location.pathname === '/build-a-wig/noir/customize';
    const isMainPage = location.pathname === '/build-a-wig';
    
    // For main mode, skip syncing if we just came from a sub-page (let the route change effect handle it)
    if (isMainPage && sessionStorage.getItem('comingFromSubPage') === 'true') {
      console.log('Main page - Skipping sync (just returned from sub-page, route change effect will handle it)');
      return;
    }
    
    // CRITICAL: Ensure styling is not a part selection (MIDDLE, LEFT, RIGHT) - it should be NONE or a valid styling option
    const partSelectionOptions = ['MIDDLE', 'LEFT', 'RIGHT'];
    const validStyling = partSelectionOptions.includes(customization.styling) ? 'NONE' : customization.styling;
    
    // Save current customization to localStorage so sub-pages can read it
    localStorage.setItem('selectedCapSize', customization.capSize);
    localStorage.setItem('selectedLength', customization.length);
    localStorage.setItem('selectedDensity', customization.density);
    localStorage.setItem('selectedColor', customization.color);
    localStorage.setItem('selectedTexture', customization.texture);
    localStorage.setItem('selectedLace', customization.lace);
    localStorage.setItem('selectedHairline', customization.hairline);
    localStorage.setItem('selectedStyling', validStyling);
    localStorage.setItem('selectedAddOns', JSON.stringify(customization.addOns));
    
    // Also save with 'editSelected' prefix in edit mode for CartDropdown
    if (isEditMode) {
      localStorage.setItem('editSelectedCapSize', customization.capSize);
      localStorage.setItem('editSelectedLength', customization.length);
      localStorage.setItem('editSelectedDensity', customization.density);
      localStorage.setItem('editSelectedColor', customization.color);
      localStorage.setItem('editSelectedTexture', customization.texture);
      localStorage.setItem('editSelectedLace', customization.lace);
      localStorage.setItem('editSelectedHairline', customization.hairline);
      localStorage.setItem('editSelectedStyling', validStyling);
      localStorage.setItem('editSelectedAddOns', JSON.stringify(customization.addOns));
      
      // Also sync prices when selections change in edit mode
      const calculatedPrices = calculatePricesFromSelections(customization);
      savePricesToLocalStorage(calculatedPrices);
    }
    
    // Also save with 'customizeSelected' prefix in customize mode
    if (isCustomizeMode) {
      localStorage.setItem('customizeSelectedCapSize', customization.capSize);
      localStorage.setItem('customizeSelectedLength', customization.length);
      localStorage.setItem('customizeSelectedDensity', customization.density);
      localStorage.setItem('customizeSelectedColor', customization.color);
      localStorage.setItem('customizeSelectedTexture', customization.texture);
      localStorage.setItem('customizeSelectedLace', customization.lace);
      localStorage.setItem('customizeSelectedHairline', customization.hairline);
      localStorage.setItem('customizeSelectedStyling', validStyling);
      localStorage.setItem('customizeSelectedAddOns', JSON.stringify(customization.addOns));
      
      // CRITICAL: Do NOT recalculate prices here - preserve prices saved by sub-pages
      // Only sync selections, not prices. Prices are set by sub-pages when user confirms selection.
      // If prices don't exist yet, they'll be calculated when loading from sub-pages.
    }
    
    console.log('Main page - Synced customization to localStorage:', {
      length: customization.length,
      density: customization.density,
      color: customization.color,
      isEditMode,
      isCustomizeMode
    });
  }, [customization, location.pathname, calculatePricesFromSelections, savePricesToLocalStorage]);

  // REMOVED: Change detection logic - editing is handled by noir/edit page, not this page
  const [processingTimeText, setProcessingTimeText] = useState('EXPECT 6 - 8 WEEKS OF PROCESSING TIME FOR THIS UNIT.');
  
  // Add to bag button states: 'idle', 'adding', 'added'
  // Initialize button state based on route - edit mode should start as 'added'
  const [addToBagState, setAddToBagState] = useState<'idle' | 'adding' | 'added'>(() => {
    const isEditPage = location.pathname === '/build-a-wig/edit';
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

  // Currency state
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');

  // Mobile menu state
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mobileMenuActiveTab, setMobileMenuActiveTab] = useState('SHOP');
  const [mobileMenuExpandedItems, setMobileMenuExpandedItems] = useState<string[]>([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

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
    console.log('Main - RESET BUTTON CLICKED!');
    console.log('Main - Before reset:', {
      addToBagState,
      cartCount
    });
    console.log('Main - Stack trace:', new Error().stack);
    
    
    setAddToBagState('idle');
    // REMOVED: Editing state - editing handled by noir/edit page
    localStorage.removeItem('addToBagButtonState');
    localStorage.removeItem('lastAddedConfiguration');
    
    console.log('Main - After reset - state should be updated');
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
    return '/assets/density.png'; // All densities use the same icon
  };

  const getLaceIcon = () => {
    const selectedLace = customization.lace || '13X6';
    
    // Check for full lace options that use different icons
    if (selectedLace === 'FULL' || selectedLace === '360') {
      return '/assets/lace-icon.svg'; // Full lace uses standard icon
    }
    
    // All other lace types use the same icon
    return '/assets/lace-icon.svg';
  };

  const getTextureIcon = () => {
    return '/assets/Texture-icon.svg'; // All textures use the same icon
  };

  // @ts-expect-error - Function kept for potential future use
  const _getColorIcon = () => {
    return '/assets/none-icon.svg'; // Color uses a custom color circle, not an icon
  };

  const getHairlineIcon = () => {
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
    const selectedColor = customization.color || 'OFF BLACK';
    
    // Color mapping based on the color sub page
    const colorMap: { [key: string]: string } = {
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
    
    return colorMap[selectedColor] || '#2A2424'; // Default to OFF BLACK if not found
  };

  // Get wig views based on selected hairline from customization state
  // Use useMemo to recalculate when customization.hairline changes
  const wigViews = useMemo(() => {
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
  }, [customization.hairline]);

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
  useEffect(() => {
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
      // If prices don't exist, initialize them to 0
      // But first remove them to ensure clean state
      if (!localStorage.getItem('selectedCapSizePrice')) {
        localStorage.removeItem('selectedCapSizePrice');
        localStorage.setItem('selectedCapSizePrice', '0');
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
      let total = basePrice;
      
      // Check which mode we're in
      const isEditMode = location.pathname === '/build-a-wig/edit' && localStorage.getItem('editingCartItem') !== null;
      const isCustomizeMode = location.pathname === '/build-a-wig/noir/customize';
      const isMainMode = location.pathname === '/build-a-wig';
      
      // DEBUGGING: Log when price calculation runs
      console.log('[PRICE CALCULATION TRIGGERED]', {
        pathname: location.pathname,
        isEditMode,
        isCustomizeMode,
        isMainMode,
        basePrice,
        timestamp: new Date().toISOString()
      });
      
      // Determine the correct prefix based on mode
      let prefix = 'selected';
      if (isEditMode) {
        prefix = 'editSelected';
      } else if (isCustomizeMode) {
        prefix = 'customizeSelected';
      }
      
      // Get actual prices from localStorage with fallback to 'selected' prefix
      const getPrice = (key: string) => {
        const primaryKey = `${prefix}${key}Price`;
        const fallbackKey = `selected${key}Price`;
        const primaryValue = localStorage.getItem(primaryKey);
        const fallbackValue = localStorage.getItem(fallbackKey);
        const value = primaryValue || fallbackValue || '0';
        return parseFloat(value);
      };
      
      // CRITICAL: Always recalculate capSizePrice based on current cap size selection
      // Flexible caps (XXS/XS/S, S/M/L) cost $40, regular caps cost $0
      let capSizePrice = 0;
      const currentCapSize = customization.capSize || 'M';
      if (currentCapSize === 'XXS/XS/S' || currentCapSize === 'S/M/L') {
        capSizePrice = 40; // Flexible caps cost $40 more
      }
      
      const colorPrice = getPrice('Color');
      const lengthPrice = getPrice('Length');
      const densityPrice = getPrice('Density');
      const lacePrice = getPrice('Lace');
      const texturePrice = getPrice('Texture');
      const hairlinePrice = getPrice('Hairline');
      const stylingPrice = getPrice('Styling');
      const addOnsPrice = getPrice('AddOns');
      
      // DEBUGGING: Log all prices being factored in
      console.log(`[PRICE CALCULATION - ${isEditMode ? 'EDIT' : isCustomizeMode ? 'CUSTOMIZE' : 'MAIN'} MODE]`, {
        mode: isEditMode ? 'EDIT' : isCustomizeMode ? 'CUSTOMIZE' : 'MAIN',
        prefix,
        basePrice,
        prices: {
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
        localStorageValues: {
          capSizePrice: localStorage.getItem(`${prefix}CapSizePrice`) || localStorage.getItem('selectedCapSizePrice') || 'not found',
          colorPrice: localStorage.getItem(`${prefix}ColorPrice`) || localStorage.getItem('selectedColorPrice') || 'not found',
          lengthPrice: localStorage.getItem(`${prefix}LengthPrice`) || localStorage.getItem('selectedLengthPrice') || 'not found',
          densityPrice: localStorage.getItem(`${prefix}DensityPrice`) || localStorage.getItem('selectedDensityPrice') || 'not found',
          lacePrice: localStorage.getItem(`${prefix}LacePrice`) || localStorage.getItem('selectedLacePrice') || 'not found',
          texturePrice: localStorage.getItem(`${prefix}TexturePrice`) || localStorage.getItem('selectedTexturePrice') || 'not found',
          hairlinePrice: localStorage.getItem(`${prefix}HairlinePrice`) || localStorage.getItem('selectedHairlinePrice') || 'not found',
          stylingPrice: localStorage.getItem(`${prefix}StylingPrice`) || localStorage.getItem('selectedStylingPrice') || 'not found',
          addOnsPrice: localStorage.getItem(`${prefix}AddOnsPrice`) || localStorage.getItem('selectedAddOnsPrice') || 'not found'
        },
        totalBefore: total,
        totalAfter: total + capSizePrice + colorPrice + lengthPrice + densityPrice + lacePrice + texturePrice + hairlinePrice + stylingPrice + addOnsPrice
      });
      
      // Add all the actual prices
      total += capSizePrice + colorPrice + lengthPrice + densityPrice + lacePrice + texturePrice + hairlinePrice + stylingPrice + addOnsPrice;
      
      setTotalPrice(total);
      
      // Update visual debug info for mobile
      setDebugInfo({
        mode: isEditMode ? 'EDIT' : isCustomizeMode ? 'CUSTOMIZE' : 'MAIN',
        prefix,
        prices: {
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
        localStorageValues: {
          capSizePrice: `calculated: $${capSizePrice} (from cap: ${currentCapSize})`,
          capSizePriceStored: localStorage.getItem(`${prefix}CapSizePrice`) || localStorage.getItem('selectedCapSizePrice') || 'not found',
          colorPrice: localStorage.getItem(`${prefix}ColorPrice`) || localStorage.getItem('selectedColorPrice') || 'not found',
          lengthPrice: localStorage.getItem(`${prefix}LengthPrice`) || localStorage.getItem('selectedLengthPrice') || 'not found',
          densityPrice: localStorage.getItem(`${prefix}DensityPrice`) || localStorage.getItem('selectedDensityPrice') || 'not found',
          lacePrice: localStorage.getItem(`${prefix}LacePrice`) || localStorage.getItem('selectedLacePrice') || 'not found',
          texturePrice: localStorage.getItem(`${prefix}TexturePrice`) || localStorage.getItem('selectedTexturePrice') || 'not found',
          hairlinePrice: localStorage.getItem(`${prefix}HairlinePrice`) || localStorage.getItem('selectedHairlinePrice') || 'not found',
          stylingPrice: localStorage.getItem(`${prefix}StylingPrice`) || localStorage.getItem('selectedStylingPrice') || 'not found',
          addOnsPrice: localStorage.getItem(`${prefix}AddOnsPrice`) || localStorage.getItem('selectedAddOnsPrice') || 'not found'
        },
        total
      });
    };

    // Calculate price immediately and on changes
    calculatePrice();
    
    // Also listen for storage changes to recalculate price
    const handleStorageChange = () => {
      calculatePrice();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('customStorageChange', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('customStorageChange', handleStorageChange);
    };
  }, [customization, basePrice, refreshTrigger, location.pathname]);

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
  const formatPrice = useCallback((price: number) => {
    const currency = currencyRates[selectedCurrency as keyof typeof currencyRates];
    const convertedPrice = price * currency.rate;
    return {
      __html: currency.symbol + convertedPrice.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      })
    };
  }, [currencyRates, selectedCurrency]);

  const handleOptionSelect = (category: string, optionId: string) => {
    console.log(`Selected ${category}: ${optionId}`);
    
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
    
    console.log('Main page - Saved to localStorage before navigation:', {
      length: customization.length,
      density: customization.density,
      category
    });
    
    // Determine the base route based on current mode
    const isEditMode = location.pathname === '/build-a-wig/edit';
    const isCustomizeMode = location.pathname === '/build-a-wig/noir/customize';
    const baseRoute = isEditMode ? '/build-a-wig/edit' : isCustomizeMode ? '/build-a-wig/noir/customize' : '/build-a-wig';
    
    // Store the source route so sub-pages know where to navigate back to
    console.log('BuildAWigPage - Setting sourceRoute before navigating to sub-page:', baseRoute, 'category:', category);
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

  // Detect changes in edit mode by comparing with original item
  useEffect(() => {
    const isEditPage = location.pathname === '/build-a-wig/edit';
    
    if (isEditPage && originalItem) {
      // Compare current customization with original item
      const hasChangesDetected = 
        customization.capSize !== originalItem.capSize ||
        customization.length !== originalItem.length ||
        customization.density !== originalItem.density ||
        customization.lace !== originalItem.lace ||
        customization.texture !== originalItem.texture ||
        customization.color !== originalItem.color ||
        customization.hairline !== originalItem.hairline ||
        customization.styling !== originalItem.styling ||
        JSON.stringify(customization.addOns) !== JSON.stringify(originalItem.addOns);
      
      console.log('BuildAWigPage - Change detection:', {
        hasChangesDetected,
        customization: customization.color,
        originalItem: originalItem.color,
        buttonState: addToBagState
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
    }
  }, [customization, originalItem, location.pathname, addToBagState]);

  // Initialize button state from localStorage on page load
  useEffect(() => {
    const isEditPage = location.pathname === '/build-a-wig/edit';
    
    // In edit mode, button should always start as 'added' (IN THE BAG)
    if (isEditPage) {
      const editingCartItem = localStorage.getItem('editingCartItem');
      if (editingCartItem) {
        setAddToBagState('added');
        return; // Don't check normal button state in edit mode
      }
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

  const handleAddToBag = async () => {
    const isEditPage = location.pathname === '/build-a-wig/edit';
    
    // In edit mode: only allow if changes have been made
    if (isEditPage && !hasChanges) {
      return; // Button should be disabled, but this is a safety check
    }
    
    // Prevent double-clicks
    if (addToBagState === 'adding') return;
    
    // In normal mode, prevent if already added
    if (!isEditPage && addToBagState === 'added') {
      return;
    }
    
    setAddToBagState('adding');
    
    // Simulate adding to bag process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Check localStorage directly, not state
    const editingCartItem = localStorage.getItem('editingCartItem');
      const editingCartItemId = localStorage.getItem('editingCartItemId');
    
    if (editingCartItem && editingCartItemId) {
      // Update existing cart item
      const existingCartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      
      // CRITICAL: Ensure styling is not a part selection (MIDDLE, LEFT, RIGHT) - it should be NONE or a valid styling option
      let validStyling = customization.styling;
      const partSelectionOptions = ['MIDDLE', 'LEFT', 'RIGHT'];
      if (partSelectionOptions.includes(validStyling)) {
        validStyling = 'NONE'; // If styling is a part selection, set to NONE
      }
      
      const updatedCartItems = existingCartItems.map((item: any) => {
        if (item.id === editingCartItemId) {
          return {
            ...item,
            price: totalPrice,
            capSize: customization.capSize,
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
        }
        return item;
      });
      
      localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
      
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
      
      // Set button to 'added' state to show "IN THE BAG"
      setAddToBagState('added');
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } else {
      // Create new cart item
      // CRITICAL: Ensure styling is not a part selection (MIDDLE, LEFT, RIGHT) - it should be NONE or a valid styling option
      let validStyling = customization.styling;
      const partSelectionOptions = ['MIDDLE', 'LEFT', 'RIGHT'];
      if (partSelectionOptions.includes(validStyling)) {
        validStyling = 'NONE'; // If styling is a part selection, set to NONE
      }
      
      const cartItem = {
        id: `build-a-wig-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: 'NOIR',
        price: totalPrice, // Use the calculated total price
        quantity: 1,
        image: '/assets/NOIR/noir-thumb.png',
        capSize: customization.capSize,
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

      // Get existing cart items and add new item
      const existingCartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      const updatedCartItems = [...existingCartItems, cartItem];
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
    }, 100);
    }
    
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

  return (
    <>
      {showLoading && <LoadingScreen />}
      {/* Visual Debug Panel for Mobile */}
      {debugInfo && (
        <div style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          background: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: '10px',
          borderRadius: '8px',
          fontSize: '10px',
          maxWidth: '90vw',
          maxHeight: '80vh',
          overflow: 'auto',
          zIndex: 9999,
          fontFamily: 'monospace'
        }}>
          <div style={{ marginBottom: '8px', fontWeight: 'bold', fontSize: '12px' }}>
            DEBUG: {debugInfo.mode} MODE
          </div>
          <div style={{ marginBottom: '4px' }}>Prefix: {debugInfo.prefix}</div>
          <div style={{ marginBottom: '8px', borderTop: '1px solid #555', paddingTop: '8px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Prices Used:</div>
            {Object.entries(debugInfo.prices).map(([key, value]) => (
              <div key={key} style={{ marginLeft: '10px', color: value > 0 ? '#4ade80' : '#999' }}>
                {key}: ${value}
              </div>
            ))}
          </div>
          <div style={{ marginBottom: '8px', borderTop: '1px solid #555', paddingTop: '8px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>localStorage Values:</div>
            {Object.entries(debugInfo.localStorageValues).map(([key, value]) => (
              <div key={key} style={{ marginLeft: '10px', fontSize: '9px', color: value !== 'not found' && parseFloat(value || '0') > 0 ? '#4ade80' : '#999' }}>
                {key}: {value}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid #555', paddingTop: '8px', fontWeight: 'bold', fontSize: '14px', color: '#4ade80' }}>
            Total: ${debugInfo.total}
          </div>
          <button 
            onClick={() => setDebugInfo(null)}
            style={{
              marginTop: '8px',
              padding: '4px 8px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '10px'
            }}
          >
            Close
          </button>
        </div>
      )}
      <div className="min-h-screen" style={{
        position: 'relative'
      }}>
        {/* Fixed Background Layer */}
      <div
          className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url('/assets/Marble Floor.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center calc(50% + 25px)',
          backgroundRepeat: 'no-repeat',
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
                onClick={() => navigate('/build-a-wig')}
              >
                BUILD-A-WIG &gt;
              </span>{' '}
              <span
                style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontWeight: '500', cursor: 'pointer' }}
                onClick={() => navigate('/units/noir')}
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

        {/* BUILD AREA */}
        <div
          className="border border-black flex flex-col pt-6 pb-4 px-5 mb-2 bg-white/60 backdrop-blur-sm"
          style={{ borderWidth: '1.3px' }}
        >
            {/* WIG PREVIEW */}
            <div className="w-full flex items-center flex-col mb-6 md:mb-8" style={{ transform: 'translateY(20px)' }}>
              <div className="leaf-stack hero-thumb">
                <div className="leaf-bg" aria-hidden="true"></div>
                <div
                  className="relative bg-cover bg-center flex items-center justify-center"
                  style={{
                    width: '262px',
                    height: '367px',
                    backgroundImage: `url('/assets/leaf-brick.png')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                >
                  <p
                    className="absolute top-[-20px] left-1/2 transform -translate-x-1/2 text-5xl sm:text-6xl z-20 noir-text cursor-pointer"
                    style={{
                      color: '#EB1C24',
                    }}
                    onClick={() => {
                      console.log('🔵 CLICKED NOIR TEXT - Navigating to /units/noir');
                      console.log('🔵 navigate function:', typeof navigate);
                      try {
                        navigate('/units/noir');
                        console.log('🔵 Navigation called successfully');
                      } catch (error) {
                        console.error('🔵 Navigation error:', error);
                      }
                    }}
                  >
                    NOIR
                  </p>
                  <img
                    src={wigViews[selectedView]}
                    alt="Selected Wig"
                    width="282"
                    height="387"
                    className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hero-mannequin-img"
                    style={{ 
                      top: 'calc(50% - 10.601px + 18px)',
                      '--hero-width': '282px',
                      '--hero-height': '387px'
                    } as React.CSSProperties}
                  />
                </div>
              </div>

              {/* THUMBNAILS */}
              <div className="flex justify-center mb-3 mt-2" style={{ transform: 'translateY(10px)', gap: '2px' }}>
                {wigViews.map((view, index) => (
                  <div className="leaf-stack thumb" key={index}>
                    <div 
                      className={`leaf-bg ${
                        selectedView === index ? 'border-black' : 'border-transparent'
                      }`} 
                      aria-hidden="true"
                    ></div>
                    <div
                      className="border-transparent p-1 cursor-pointer"
                      onClick={() => setSelectedView(index)}
                    >
                      <div
                        className="relative bg-cover bg-center flex items-center justify-center"
                        style={{
                          width: '72px',
                          height: '95px',
                          position: 'relative',
                          zIndex: 1,
                          ...(index === 1 && { transform: 'translateX(-2px)' }),
                          ...(index === 2 && { transform: 'translateX(-4px)' })
                        }}
                      >
                        <img
                          alt={`Thumbnail ${index + 1}`}
                          width="63"
                          height="84"
                          src={view}
                          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 thumbnail-mannequin-img"
                          style={{ 
                          '--thumb-top': 'calc(50% - 6.1px + 7.2px)',
                          ...(index === 0 && { left: 'calc(50% - 6px)' })
                        } as React.CSSProperties}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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

              {/* BASIC MEMBERSHIP OPTIONS */}
            <div className="flex flex-col gap-3 mt-4 mx-auto" style={{ marginBottom: '18px', transform: 'translateY(6px)' }}>
                <p className="text-[9px] sm:text-sm md:text-base lg:text-lg font-medium text-black text-center" style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontWeight: '500' }}>
                BASIC MEMBERSHIP OPTIONS:
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
                      width: '57px',
                      height: '57px',
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

              {/* PREMIUM MEMBERSHIP OPTIONS */}
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
                      width: '74px',
                      height: '74px',
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
                      width: '83px',
                      height: '83px',
                      overflow: 'visible',
                      top: 'calc(50% + 2px)',
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
                  onClick={() => handleOptionSelect('color', 'OFF BLACK')}
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
                          backgroundColor: '#909090',
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
                      width: '75px',
                      height: '75px',
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
              <p className="font-futura text-[12px] md:text-sm lg:text-base font-medium" style={{ color: '#909090' }}>
                TOTAL DUE
              </p>
              <p
                className="text-black font-medium text-base md:text-xl lg:text-2xl"
                  style={{ fontFamily: '"Futura PT Medium", Futura, Inter, sans-serif', fontWeight: '500' }}
                  dangerouslySetInnerHTML={formatPrice(totalPrice)}
              />
            </div>
          </div>
        </div>

        {/* ADD TO BAG BUTTON */}
        <div className="px-0 md:px-0" style={{ marginTop: '2px' }}>
              <button
                onClick={handleAddToBag}
            disabled={addToBagState === 'adding' || (location.pathname === '/build-a-wig/edit' && !hasChanges)}
            className={`border border-black font-futura w-full md:max-w-sm lg:max-w-md text-center py-2 md:py-3 lg:py-4 text-[12px] md:text-sm lg:text-base font-semibold ${
              addToBagState === 'adding' ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer hover:bg-gray-50'
            }`}
            style={{ 
              borderWidth: '1.3px', 
              color: addToBagState === 'adding' ? '#EB1C24' : '#EB1C24', 
              fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' 
            }}
          >
            {(() => {
              const isEditPage = location.pathname === '/build-a-wig/edit';
              
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
                <span style={{ color: '#909090' }}>IN THE BAG</span>
              </span>
                  );
                }
              }
              
              // Normal mode: standard button states
              if (addToBagState === 'idle') return 'ADD TO BAG';
              if (addToBagState === 'adding') return 'ADDING...';
              if (addToBagState === 'added') {
                return (
                  <span className="flex items-center justify-center gap-1">
                    <img src="/assets/check.svg" alt="Check" width="9" height="9" />
                    <span style={{ color: '#909090' }}>IN THE BAG</span>
                  </span>
                );
              }
              return 'ADD TO BAG';
            })()}
              </button>
              
              
            </div>
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
      </div>
    </>
  );
}