import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { CartItem } from '../types/cart';
import ConfirmationModal from './ConfirmationModal';
import BuildAWigFeatureSignInModal from './BuildAWigFeatureSignInModal';
import { trackActivity } from '../utils/activity';
import { getPerUserKey, getCurrentUserEmailFromStorage, PER_USER_KEYS } from '../utils/perUserStorage';
import { getPointsMultiplier } from '../constants/tiers';
import { getEffectiveTierName, getEffectiveSubscriptionTier } from '../utils/adminAuth';
import {
  bookingCartItemThumbnailSrc,
  BOOKING_APPOINTMENT_CART_BADGE_IMG_PX,
  BOOKING_CART_BADGE_IMG_PX
} from '../utils/bookingBadges';
import { bookingAppointmentHrefForCartItem, bookingConsultationHrefForCartItem } from '../utils/bookingMemberRoutes';
import {
  shopBcfPdpHrefFromCartItem,
  shopBcfCartLineThumbnailSrc,
  bcfBundleDealResolvedListSubtotal
} from '../utils/bcfProductOptions';
import {
  CART_RED_LINE_BCF_BOOKING,
  bookingCartRedSubtitle,
  bookingCartViewDetailsHtml,
  bcfCartViewDetailsHtml
} from '../utils/cartLineRedAndDetails';
import { stripIneligibleBcfBundleDealLines } from '../utils/premiumMemberAccess';
import { DEFAULT_CURRENCY_RATES } from '../utils/defaultCurrencyRates';
import {
  beginEditAppointmentFromCart,
  bookingEditLinkClassName,
  bookingEditLinkStyle
} from '../utils/bookingAppointmentFormDraft';
import { checkoutPathForCartItems } from '../utils/checkoutNavigatePath';
import { giftCardLineTotalUsd, isGiftCardCartLine } from '../utils/giftCardCheckout';
import { maybeRestoreGiftCardCheckoutCartAfterAbandon } from '../utils/giftCardCheckoutSession';
import { CartLineProductTextStack, CartLineTextLayer } from './cart/CartLineProductTextStack';
import {
  cartLineCapSizeTextStyle,
  cartLineLayerInnerStyle,
  cartLineProductNameTextStyle,
  cartLineRedSubtitleTextStyle,
} from '../utils/cartLineProductLayers';
import { normalizeCartLineProductName } from '../utils/cartCapSizeLineMargin';
import { useProductInventorySnapshot } from '../hooks/useProductInventorySnapshot';
import { WigLineStockPrice } from './shop/WigStockPrice';
import { attachStockStatusToLineItem, isWigUnitProductName } from '../utils/productInventoryAvailability';
import { cartBillablePointsEligibleSubtotal, cartBillableSubtotal } from '../utils/cartBillableLines';

interface CartDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  cartCount: number;
}

const CART_DROPDOWN_DETAIL_EXTRA_SHIFT_ROW_THRESHOLD = 6;
/** Extra lift for product name/subtitle/details block when many VIEW DETAILS lines (not the toggle). */
const CART_DROPDOWN_PRODUCT_TEXT_EXTRA_SHIFT_PX = 10;

function countDetailHtmlRows(html: string): number {
  return html.split(/<br\s*\/?>/i).filter((line) => line.trim().length > 0).length;
}

function cartDropdownUnitDetailRowCount(item: CartItem): number {
  let rowCount = 0;

  if (item.length && item.length !== '24"') rowCount++;

  const defaultDensity = item.name === 'BLANCO' ? '250%' : '200%';
  if (item.density && item.density !== defaultDensity) rowCount++;

  if (item.lace && item.lace !== '13X6') rowCount++;

  let itemColor = item.color;
  if (item.name === 'BLANCO') {
    const validBlancoColors = ['GOLDEN', 'PLATINUM', 'ASH'];
    if (!itemColor || !validBlancoColors.includes(itemColor)) {
      itemColor = 'PLATINUM';
    }
  }
  const blancoDefaultColors = ['PLATINUM', 'OFF WHITE', 'OFF BLACK'];
  const isDefaultColor = item.name === 'BLANCO'
    ? blancoDefaultColors.includes(itemColor || '')
    : itemColor === 'OFF BLACK';
  if (itemColor && !isDefaultColor) rowCount++;

  if (item.hairline && item.hairline !== 'NATURAL') rowCount++;

  const hairStylingOptions = ['BANGS', 'CRIMPS', 'FLAT IRON', 'LAYERS'];
  if (item.styling && item.styling !== 'NONE' && hairStylingOptions.includes(item.styling) && item.partSelection) {
    rowCount++;
  }

  if (Array.isArray(item.addOns)) {
    rowCount += item.addOns.length;
  } else if (item.addOns) {
    rowCount++;
  }

  return rowCount;
}

function cartDropdownDetailTextRowCount(item: CartItem): number {
  if (item.type === 'booking-consult' || item.type === 'booking-appointment') {
    return countDetailHtmlRows(bookingCartViewDetailsHtml(item as CartItem & Record<string, unknown>));
  }
  if (item.type === 'shop-texture-category') {
    return countDetailHtmlRows(bcfCartViewDetailsHtml(item as CartItem & Record<string, unknown>));
  }
  return cartDropdownUnitDetailRowCount(item);
}

export default function CartDropdown({ isOpen, onClose, cartCount }: CartDropdownProps) {
  useProductInventorySnapshot();
  const navigate = useNavigate();
  const location = useLocation();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [viewingDetailsFor, setViewingDetailsFor] = useState<string | null>(null);
  const [bawEditFromCartSignInOpen, setBawEditFromCartSignInOpen] = useState(false);
  const [bawEditFromCartReturnTo, setBawEditFromCartReturnTo] = useState<{ pathname: string; search?: string }>({
    pathname: '/build-a-wig/noir/edit',
  });

  // Close cart dropdown immediately when route changes (before new page loads)
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close cart dropdown when any link is clicked (catches navigation before route change)
  useEffect(() => {
    if (!isOpen) return;

    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check if clicked element or its parent is a link
      const link = target.closest('a[href]');
      if (link && link.getAttribute('href')?.startsWith('/')) {
        // Only close for internal navigation links, not external links or special cases
        const href = link.getAttribute('href');
        if (href && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
          onClose();
        }
      }
    };

    // Use capture phase to catch clicks early
    document.addEventListener('click', handleLinkClick, true);
    return () => document.removeEventListener('click', handleLinkClick, true);
  }, [isOpen, onClose]);

  // Reset viewing details when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setViewingDetailsFor(null);
      // Close currency modal when cart closes
      setShowCurrencyModal(false);
    }
  }, [isOpen]);

  // Currency state - per user so it doesn't bleed between accounts
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
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);

  const currencyRates = DEFAULT_CURRENCY_RATES;

  // Calculate actual price based on localStorage values
  const calculateActualPrice = () => {
    try {
      // Check if we're in edit mode
      const isEditMode = localStorage.getItem('editingCartItem') !== null;
      const prefix = isEditMode ? 'editSelected' : 'selected';
      
      // Get product name to determine base price
      let productName = 'NOIR'; // Default
      if (isEditMode) {
        const editingCartItem = localStorage.getItem('editingCartItem');
        if (editingCartItem) {
          try {
            const item = JSON.parse(editingCartItem);
            productName = item.name || 'NOIR';
          } catch (e) {
            // Fallback to NOIR if parsing fails
          }
        }
      } else {
        // Try to get product name from current route or localStorage
        const pathname = window.location.pathname;
        if (pathname.includes('blanco')) productName = 'BLANCO';
        else if (pathname.includes('soft-wave')) productName = 'SOFT WAVE';
        else if (pathname.includes('beach-wave')) productName = 'BEACH WAVE';
        else if (pathname.includes('soft-curl')) productName = 'SOFT CURL';
        else if (pathname.includes('ocean-curl')) productName = 'OCEAN CURL';
        else productName = localStorage.getItem('selectedProductName') || 'NOIR';
      }
      
      // Get cap size to determine cap size price
      const capSize = localStorage.getItem(`${prefix}CapSize`) || 'M';
      
      // CRITICAL: Base price depends on product - flexible cap adds $40 via capSizePrice
      const getBasePrice = (productName: string) => {
        switch (productName) {
          case 'NOIR': return 740;
          case 'BLANCO': return 820;
          case 'SOFT CURL': return 780;
          case 'SOFT WAVE': return 760;
          case 'OCEAN CURL': return 780;
          case 'BEACH WAVE': return 760;
          default: return 740;
        }
      };
      const basePrice = getBasePrice(productName);
      
      // Get additional prices
      // CRITICAL: Read capSizePrice from localStorage FIRST, then calculate only if missing
      // This preserves the price even if capSize selection gets reset temporarily
      let capSizePrice = parseInt(localStorage.getItem(`${prefix}CapSizePrice`) || '0');
      
      // If localStorage has 0 or missing, calculate based on cap size
      if (capSizePrice === 0 || isNaN(capSizePrice)) {
        if (capSize === 'XXS/XS/S' || capSize === 'S/M/L') {
          capSizePrice = 40; // Flexible cap options cost $40 extra
          console.log('[FLEX_CAP_DEBUG] CartDropdown calculateActualPrice - Calculated 40 for flexible cap:', capSize);
        } else {
          capSizePrice = 0;
        }
      } else {
        console.log('[FLEX_CAP_DEBUG] CartDropdown calculateActualPrice - Using price from localStorage:', capSizePrice, 'for capSize:', capSize);
      }
      const lengthPrice = parseInt(localStorage.getItem(`${prefix}LengthPrice`) || '0');
      const densityPrice = parseInt(localStorage.getItem(`${prefix}DensityPrice`) || '0');
      const colorPrice = parseInt(localStorage.getItem(`${prefix}ColorPrice`) || '0');
      const texturePrice = parseInt(localStorage.getItem(`${prefix}TexturePrice`) || '0');
      const lacePrice = parseInt(localStorage.getItem(`${prefix}LacePrice`) || '0');
      const hairlinePrice = parseInt(localStorage.getItem(`${prefix}HairlinePrice`) || '0');
      const stylingPrice = parseInt(localStorage.getItem(`${prefix}StylingPrice`) || '0');
      const addOnsPrice = parseInt(localStorage.getItem(`${prefix}AddOnsPrice`) || '0');
      
      const total = basePrice + capSizePrice + lengthPrice + densityPrice + colorPrice + texturePrice + lacePrice + hairlinePrice + stylingPrice + addOnsPrice;
      
      console.log('CartDropdown - Price calculation:', {
        isEditMode,
        prefix,
        capSize,
        basePrice,
        capSizePrice,
        lengthPrice,
        densityPrice,
        colorPrice,
        texturePrice,
        lacePrice,
        hairlinePrice,
        stylingPrice,
        addOnsPrice,
        total
      });
      
      return total;
    } catch (error) {
      console.error('Error calculating price:', error);
      return 0;
    }
  };

  // Load cart items from localStorage or generate mock items
  useEffect(() => {
    const loadCartItems = () => {
      try {
        const isEditMode = localStorage.getItem('editingCartItem') !== null;
        console.log('[CART DROPDOWN] loadCartItems called', {
          timestamp: new Date().toISOString(),
          isEditMode,
          editingCartItem: localStorage.getItem('editingCartItem') ? 'exists' : 'null',
          refreshTrigger
        });

    const storedItems = localStorage.getItem('cartItems');
        console.log('[CART DROPDOWN] Loading cart items from localStorage:', storedItems);
        
    if (storedItems) {
          const items = JSON.parse(storedItems);
          console.log('[CART DROPDOWN] Parsed cart items:', items);
          
          // CRITICAL: Use the SAVED PRICE from each item, don't recalculate
          // Each item already has its correct price saved when it was added to cart
          // Recalculating would use current localStorage values, causing all items to show the same price
          // This applies to ALL product types (NOIR, BLANCO, SOFT CURL, SOFT WAVE)
          const itemsWithCorrectPrices = items.map((item: any, index: number) => {
            const withStock = attachStockStatusToLineItem(item);
            // Get base price fallback based on product name
            const getBasePrice = (productName: string) => {
              switch (productName) {
                case 'NOIR': return 740;
                case 'BLANCO': return 820;
                case 'SOFT CURL': return 780;
                case 'SOFT WAVE': return 760;
                case 'OCEAN CURL': return 780;
                case 'BEACH WAVE': return 760;
                default: return 740;
              }
            };
            
            const originalPrice = item.price;
            const finalPrice = item.price || getBasePrice(item.name || 'NOIR'); // Fallback to base price if missing
            
            // Log price comparison if price seems wrong (only for edit mode and first item)
            if (isEditMode && index === 0 && item.name === 'NOIR') {
              const calculatedPrice = calculateActualPrice();
              console.log('[CART DROPDOWN] Price comparison for first item:', {
                itemId: item.id,
                originalStoredPrice: originalPrice,
                finalPriceUsed: finalPrice,
                calculatedPriceFromLocalStorage: calculatedPrice,
                priceDifference: finalPrice - calculatedPrice,
                isEditMode,
                warning: originalPrice !== calculatedPrice ? 'PRICE MISMATCH DETECTED!' : 'Prices match'
              });
            }
            
            console.log('[CART DROPDOWN] Using saved price for item:', {
              itemId: item.id,
              name: item.name,
              capSize: item.capSize,
              color: item.color,
              storedPrice: originalPrice,
              finalPrice: finalPrice
            });
            
            return attachStockStatusToLineItem({ ...withStock, price: finalPrice });
          });
          
          console.log('[CART DROPDOWN] Loading cart items with saved prices:', itemsWithCorrectPrices);
          
          // Check if prices changed
          const pricesChanged = items.some((item: any, index: number) => {
            return item.price !== itemsWithCorrectPrices[index].price;
          });
          
          if (pricesChanged) {
            console.warn('[CART DROPDOWN] ⚠️ PRICE CHANGES DETECTED!', {
              originalItems: items.map((i: any) => ({ id: i.id, price: i.price })),
              updatedItems: itemsWithCorrectPrices.map((i: any) => ({ id: i.id, price: i.price }))
            });
          }
          const strip = stripIneligibleBcfBundleDealLines<CartItem>(itemsWithCorrectPrices);
          if (strip.removedUnitCount > 0) {
            localStorage.setItem('cartItems', JSON.stringify(strip.next));
            const newCount = strip.next.reduce((sum, ci) => sum + (ci.quantity || 1), 0);
            localStorage.setItem('cartCount', String(newCount));
            window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: newCount }));
            window.dispatchEvent(new CustomEvent('cartItemsChanged'));
            window.dispatchEvent(new Event('cartUpdated'));
          }
          setCartItems(strip.next);
        } else {
          // Generate mock cart items based on cart count
          const actualPrice = calculateActualPrice();
          console.log('[CART DROPDOWN] No stored items, generating mock items with calculated price:', actualPrice);
          const mockItems: CartItem[] = [];
          for (let i = 0; i < cartCount; i++) {
            const mockCapSize = localStorage.getItem('selectedCapSize') || 'M';
            const mockCapSizePrice = (mockCapSize === 'XXS/XS/S' || mockCapSize === 'S/M/L') ? 40 : 0;
            
            mockItems.push({
              id: `item-${i + 1}`,
              name: 'NOIR',
              price: actualPrice,
              quantity: 1,
              image: '/assets/NOIR/noir-thumb.png',
              capSize: mockCapSize,
              capSizePrice: mockCapSizePrice,
              length: localStorage.getItem('selectedLength') || '24"',
              density: localStorage.getItem('selectedDensity') || '200%',
              color: localStorage.getItem('selectedColor') || 'OFF BLACK',
              texture: localStorage.getItem('selectedTexture') || 'SILKY',
              lace: localStorage.getItem('selectedLace') || '13X6',
              styling: localStorage.getItem('selectedStyling') || 'NONE',
              addOns: []
            });
          }
          
          console.log('[FLEX_CAP_DEBUG] CartDropdown Mock Items - Generated with capSizePrice:', mockItems.map(i => ({ capSize: i.capSize, capSizePrice: (i as any).capSizePrice })));
          setCartItems(mockItems);
        }
      } catch (error) {
        console.error('[CART DROPDOWN] Error loading cart items:', error);
        setCartItems([]);
      }
    };

    loadCartItems();
    
    // Listen for cart updates
    const handleCartUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('[CART DROPDOWN] Received cartUpdated event:', customEvent.detail);
      loadCartItems();
      setRefreshTrigger(prev => prev + 1); // Force re-render
    };
    
    // Listen for localStorage changes that might affect prices
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && (
        e.key.includes('Price') || 
        e.key === 'editingCartItem' || 
        e.key === 'editingCartItemId' ||
        e.key === 'cartItems'
      )) {
        console.log('[CART DROPDOWN] Storage change detected:', {
          key: e.key,
          oldValue: e.oldValue,
          newValue: e.newValue,
          timestamp: new Date().toISOString()
        });
        
        // Reload cart items if cartItems changed
        if (e.key === 'cartItems') {
          loadCartItems();
        }
      }
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [cartCount, refreshTrigger, location.search]); // Reload when cart count changes or refresh triggered

  // When the item we're viewing details for is no longer in the cart, close details so we show full list or empty state
  useEffect(() => {
    if (viewingDetailsFor && !cartItems.some(item => item.id === viewingDetailsFor)) {
      setViewingDetailsFor(null);
    }
  }, [cartItems, viewingDetailsFor]);

  // Save selected currency to localStorage whenever it changes (per-user key)
  useEffect(() => {
    if (selectedCurrency) {
      const key = getPerUserKey(PER_USER_KEYS.selectedCurrency, getCurrentUserEmailFromStorage());
      localStorage.setItem(key, selectedCurrency);
    }
  }, [selectedCurrency]);

  // Load selected currency from localStorage on mount; validate so invalid/stale codes don't stick
  useEffect(() => {
    const key = getPerUserKey(PER_USER_KEYS.selectedCurrency, getCurrentUserEmailFromStorage());
    const savedCurrency = localStorage.getItem(key);
    const isValid = savedCurrency && currencyRates[savedCurrency as keyof typeof currencyRates];
    if (isValid && savedCurrency !== selectedCurrency) {
      setSelectedCurrency(savedCurrency);
    } else if (!isValid && savedCurrency) {
      // Stale or invalid saved code (e.g. from old build) – reset to USD and persist
      localStorage.setItem(key, 'USD');
      setSelectedCurrency('USD');
      window.dispatchEvent(new CustomEvent('currencyChanged', { detail: 'USD' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount, not when currencyRates changes

  // Listen for currency changes from other components
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

  // Helper function to get cap size price based on cap size name
  // Note: These helper functions are kept for potential future edit functionality
  // @ts-expect-error - Function kept for potential future use
  const _getCapSizePrice = (_capSize: string) => {
    // All cap sizes (including flexible) have their extra cost included in base price
    // So capSizePrice should always be 0
    return 0;
  };

  // Helper function to get color price based on color name, length, and product name
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
    
    // Other product colors — match BAW edit/customize: flat $120 per non-default dye (OFF BLACK free)
    const colorPrices: { [key: string]: number } = {
      'JET BLACK': 120,
      'OFF BLACK': 0,
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
    
    let basePrice = colorPrices[color] || 0;
    
    // Add extra $40 for lengths 30" and above (excluding OFF BLACK)
    if (basePrice > 0 && length && ['30"', '32"', '34"', '36"', '40"'].includes(length)) {
      basePrice += 40;
    }
    
    return basePrice;
  };

  // Helper function to get length price based on length
  // @ts-expect-error - Function kept for potential future use
  // Helper function to get length price based on length
  // CRITICAL: Include ALL length options with correct prices from length page
  const _getLengthPrice = (length: string) => {
    if (!length) return 0;
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

  // Helper function to get density price based on density and product (Blanco default is 250% = $0; others 200% = $0, 250% = $80).
  const _getDensityPrice = (density: string, productName?: string) => {
    const isBlanco = productName === 'BLANCO';
    const blancoPrices: { [key: string]: number } = {
      '130%': -80, '150%': -60, '180%': -40, '200%': -20, '250%': 0, '300%': 160, '350%': 240, '400%': 320
    };
    const defaultPrices: { [key: string]: number } = {
      '130%': -60, '150%': -40, '180%': -20, '200%': 0, '250%': 80, '300%': 160, '350%': 240, '400%': 320
    };
    const densityPrices = isBlanco ? blancoPrices : defaultPrices;
    return densityPrices[density] ?? 0;
  };

  // Helper function to get lace price based on lace type
  // CRITICAL: Include ALL lace options with correct prices from lace page
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

  // Helper function to get texture price based on texture
  const _getTexturePrice = (texture: string) => {
    const texturePrices: { [key: string]: number } = {
      'SILKY': 0,
      'KINKY': 40,
      'YAKI': 40
    };
    return texturePrices[texture] || 0;
  };

  // Helper function to get hairline price based on hairline
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

  // Helper function to get styling price based on styling
  const _getStylingPrice = (styling: string) => {
    if (!styling || styling === 'NONE') return 0;
    
    const stylingPrices: { [key: string]: number } = {
      'BANGS': 40,
      'CRIMPS': 80,
      'FLAT IRON': 80,
      'LAYERS': 120
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

  // Helper function to get add-ons price based on add-ons array and lace size
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

  // Format price with currency (for main cart prices, not detail prices in red)
  const formatPrice = useCallback((price: number) => {
    const currency = currencyRates[selectedCurrency as keyof typeof currencyRates] || currencyRates.USD;
    const convertedPrice = price * currency.rate;
    return {
      __html: currency.symbol + convertedPrice.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }) + ' ' + selectedCurrency
    };
  }, [currencyRates, selectedCurrency]);

  // No need to recalculate prices - use the actual prices stored when items were added

  const handleRemoveItemClick = (itemId: string) => {
    setItemToRemove(itemId);
    setShowRemoveConfirm(true);
  };

  const confirmRemoveItem = () => {
    if (!itemToRemove) return;

    const removedItem = cartItems.find((item) => item.id === itemToRemove);
    const productName = removedItem?.name ?? 'Unknown';
    
    if (itemToRemove === viewingDetailsFor) {
      setViewingDetailsFor(null);
    }
    const updatedItems = cartItems.filter(item => item.id !== itemToRemove);
    localStorage.setItem('cartItems', JSON.stringify(updatedItems));

    const restoredCount = maybeRestoreGiftCardCheckoutCartAfterAbandon(updatedItems);
    let finalItems = updatedItems;
    let newCount: number;
    if (restoredCount != null) {
      try {
        finalItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      } catch {
        finalItems = updatedItems;
      }
      newCount = restoredCount;
    } else {
      newCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      localStorage.setItem('cartCount', newCount.toString());
    }

    setCartItems(finalItems);
    
    // Dispatch both events to ensure all components are notified
    window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: newCount }));
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { items: finalItems, count: newCount } }));

    trackActivity('remove_from_cart', { source: 'cart_dropdown', productName });
    
    // Reset state
    setShowRemoveConfirm(false);
    setItemToRemove(null);
  };


  // updateQuantity function removed - not currently used

  const getTotalPrice = () => cartBillableSubtotal(cartItems);

  // Points-eligible amount (exclude gift cards, digital, sold-out wig units) for loyalty line
  const pointsEligibleAmount = cartBillablePointsEligibleSubtotal(cartItems);

  const isSignedIn = typeof window !== 'undefined' && localStorage.getItem('isSignedIn') === 'true';

  const getPointsMultiplierForUser = (): number => {
    if (!isSignedIn) return 1;
    try {
      const currentUser = localStorage.getItem('currentUser');
      if (!currentUser) return 1;
      const user = JSON.parse(currentUser);
      const tier = getEffectiveTierName(user) || (user.currentTierName || user.tier || (user.email ? localStorage.getItem(`lastKnownTier_${(user.email || '').trim().toLowerCase()}`) : null) || '').toString().toUpperCase() || null;
      const subscriptionTier = (() => {
        try {
          const u = JSON.parse(localStorage.getItem('currentUser') || '{}');
          return getEffectiveSubscriptionTier(u);
        } catch (_) { return null; }
      })();
      const { multiplier } = getPointsMultiplier(tier, subscriptionTier);
      return multiplier;
    } catch (_) {
      return 1;
    }
  };

  // Debug function to get all price-related localStorage data


  const handleCheckout = () => {
    trackActivity('cart_navigate', { destination: 'checkout' });
    onClose();
    navigate(checkoutPathForCartItems(cartItems as { type?: string; name?: string }[]));
  };

  const handleViewCart = () => {
    trackActivity('cart_navigate', { destination: 'bag' });
    onClose();
    navigate('/bag');
  };


  // Handle backdrop click to close dropdown
  useEffect(() => {
    const handleBackdropClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Don't close if clicking inside cart dropdown, currency modal, confirmation modals, or cart icon
      if (!target.closest('[data-dropdown-content]') && 
          !target.closest('[data-currency-modal]') &&
          !target.closest('[data-cart-icon]') &&
          !target.closest('[data-attribute="remove-confirm"]')) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleBackdropClick);
      return () => document.removeEventListener('mousedown', handleBackdropClick);
    }
  }, [isOpen, onClose]);

  /** When closed, still mount **BuildAWigFeatureSignInModal** (portaled) so it survives `onClose()` after EDIT IN BUILD-A-WIG. */
  if (!isOpen) {
    return createPortal(
      <BuildAWigFeatureSignInModal
        isOpen={bawEditFromCartSignInOpen}
        onClose={() => setBawEditFromCartSignInOpen(false)}
        returnTo={bawEditFromCartReturnTo}
      />,
      document.body
    );
  }

  /** 2+ compact rows: maxHeight balances row-2 border vs row-3 peek (284→312→298→296→294). */
  const multiItemCompactList = !viewingDetailsFor && cartItems.length > 1;
  const cartItemsScrollMaxHeight = multiItemCompactList
    ? 'min(294px, calc(100vh - 230px))'
    : viewingDetailsFor
      ? 'min(380px, calc(100vh - 230px))'
      : 'none';
  const cartItemsScrollOverflowY: 'auto' | 'visible' =
    multiItemCompactList || viewingDetailsFor ? 'auto' : 'visible';

  /** Same top offset on every route so the panel lines up with the shared nav bar (was 88px on e.g. `/sign-in`, read as lower than 86px routes). */
  const dropdownTop = '86px';

  const dropdownContent = (
    <div 
      className="fixed inset-0 pointer-events-auto" 
      style={{ 
        zIndex: 999999999
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="absolute left-4 right-4 pointer-events-auto" style={{ top: dropdownTop }}>
        <div
          data-dropdown-content
          className="bg-white/60 backdrop-blur-md border border-black shadow-lg hover:shadow-xl transition-all duration-300 ease-out flex flex-col"
        style={{
          borderWidth: '1.3px',
            zIndex: 999999999,
            position: 'relative',
            maxHeight: 'calc(100vh - 100px)',
            display: 'flex',
            flexDirection: 'column'
          }}
          onMouseDown={(e) => {
            // Prevent backdrop from closing dropdown when clicking inside
            e.stopPropagation();
        }}
      >
        {/* Header - reduced paddingBottom to cut excess space above loyalty line */}
          <div className="px-3 py-2 border-b border-gray-100" style={{ marginTop: '6px', paddingBottom: '5px' }}>
            <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '8px' }}>
            <h3 
              className="text-black uppercase" 
              style={{ 
                fontSize: '10px',
                fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                fontWeight: '500'
              }}
            >
              SHOPPING BAG
              <span>{' · '}</span>
              <span style={{ color: '#EB1C24' }}>{cartCount}</span>
            </h3>
              <div className="flex items-center" style={{ gap: '6px', flexWrap: 'wrap' }}>
            <span
              onClick={() => setShowCurrencyModal(true)}
              style={{ 
                fontSize: '10px',
                fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              <span style={{ color: '#000000' }}>CURRENCY &gt; </span>
              <span style={{ color: '#EB1C24' }}>{selectedCurrency}</span>
            </span>
              </div>
            </div>
        </div>

        {/* Loyalty points line - top, below header, above cart items (cart dropdown only); spacing reduced via padding not text shift */}
        {cartItems.length > 0 && (
          <p className="text-center w-full flex-shrink-0 px-3" style={{ marginTop: '10px', marginBottom: '6px', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>
            {isSignedIn ? (
              (() => {
                const basePoints = Math.round(pointsEligibleAmount);
                const multiplier = getPointsMultiplierForUser();
                const actualPoints = Math.round(basePoints * multiplier);
                return <>YOU'RE EARNING <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' }}>{actualPoints.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span> LOYALTY POINTS WITH THIS ORDER{actualPoints === 0 ? '.' : '!'}</>;
              })()
            ) : (
              <>SIGN IN TO EARN LOYALTY POINTS FOR THIS ORDER.</>
            )}
          </p>
        )}

        {/* Cart Items */}
          <div 
            className="px-3 overflow-y-auto flex-1"
            style={{
              maxHeight: cartItemsScrollMaxHeight,
              minHeight: '0',
              overflowY: cartItemsScrollOverflowY,
              marginTop: '4.8px',
              marginBottom: cartItems.length > 0 ? '4.8px' : '0'
            }}
          >
          {cartItems.length === 0 ? (
              <div className="text-center py-4 flex flex-col items-center">
              <p 
                style={{ 
                    fontSize: '11px',
                  fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    color: '#808080',
                    textTransform: 'uppercase',
                    margin: '0'
                }}
              >
                  JUST DUST & LINT HERE.
              </p>
            </div>
          ) : (
              <div className="space-y-3">
                {(() => {
                  const itemsToShow = viewingDetailsFor 
                    ? cartItems.filter(item => item.id === viewingDetailsFor) 
                    : cartItems;
                  
                  // If no items to show, return early
                  if (itemsToShow.length === 0) {
                    return null;
                  }
                  
                  return itemsToShow.map((item) => {
                    const isBookingCartThumb =
                      item.type === 'booking-consult' || item.type === 'booking-appointment';
                    const isBcfShopItem = item.type === 'shop-texture-category';
                    const isViewingDetails = viewingDetailsFor === item.id;
                    const detailTextRowCount = isViewingDetails ? cartDropdownDetailTextRowCount(item) : 0;
                    const productTextTransform = isViewingDetails
                      ? detailTextRowCount >= CART_DROPDOWN_DETAIL_EXTRA_SHIFT_ROW_THRESHOLD
                        ? `translateY(-${4 + CART_DROPDOWN_PRODUCT_TEXT_EXTRA_SHIFT_PX}px)`
                        : 'translateY(-4px)'
                      : undefined;
                    /** While viewing details for a unit or BCF line, hide its price + cap size rows. */
                    const hideMetaForDetails =
                      isViewingDetails &&
                      (isBcfShopItem || isWigUnitProductName(item.name));
                    /** Cart dropdown: booking badge ~66px (appointment +5%), centered in 88px column. BCF: 85% × 1.05 of unit thumb, +4px right nudge, object-contain. */
                    const unitThumbPx = 88;
                    const bcfCartThumbPx = Math.round(unitThumbPx * 0.85 * 1.05);
                    const bookingBadgeImgPx =
                      item.type === 'booking-appointment'
                        ? BOOKING_APPOINTMENT_CART_BADGE_IMG_PX
                        : BOOKING_CART_BADGE_IMG_PX;
                    const cartThumbBoxPx =
                      item.name === 'GIFT CARD' || item.type === 'gift-card'
                        ? 108
                        : isBookingCartThumb
                          ? BOOKING_CART_BADGE_IMG_PX
                          : isBcfShopItem
                            ? bcfCartThumbPx
                            : unitThumbPx;
                    return (
                    <div key={item.id} className="bg-transparent border border-gray-200 p-2 mb-2 w-full" style={{ boxSizing: 'border-box', ...(isViewingDetails ? { paddingBottom: '16px' } : {}) }}>
                    <div className="flex items-center justify-start space-x-3" style={{ minHeight: '120px', height: isViewingDetails ? 'auto' : '120px', paddingTop: '0', paddingBottom: '0' }}>
                    {/* Thumbnail Container */}
                    <div
                      className="flex flex-col items-center justify-center"
                      style={{
                        height: '120px',
                        minHeight: '120px',
                        alignSelf: isBcfShopItem || isBookingCartThumb ? 'center' : 'flex-start'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transform:
                            isBcfShopItem || isBookingCartThumb ? 'none' : 'translateY(-8px)',
                          position: 'relative'
                        }}
                      >
                        {/* Item Image */}
                        <div 
                          className="flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                          style={{ 
                            width: `${isBookingCartThumb ? unitThumbPx : cartThumbBoxPx}px`,
                            height: `${isBookingCartThumb ? unitThumbPx : cartThumbBoxPx}px`,
                            margin: '0'
                          }}
                        onClick={() => {
                          let productRoute = '/straight/noir';
                          if (item.name === 'GIFT CARD' || item.type === 'gift-card') {
                            productRoute = '/tools/gift-card';
                          } else if (item.type === 'booking-consult') {
                            productRoute = bookingConsultationHrefForCartItem(item as any);
                          } else if (item.type === 'booking-appointment') {
                            productRoute = bookingAppointmentHrefForCartItem(item as any);
                          } else {
                            const bcfHref = shopBcfPdpHrefFromCartItem(item as any);
                            if (bcfHref) productRoute = bcfHref;
                            else if (item.name === 'NOIR') productRoute = '/straight/noir';
                            else if (item.name === 'BLANCO') productRoute = '/straight/blanco';
                            else if (item.name === 'SOFT WAVE') productRoute = '/wavy/soft-wave';
                            else if (item.name === 'SOFT CURL') productRoute = '/curly/soft-curl';
                            else if (item.name === 'BEACH WAVE') productRoute = '/wavy/beach-wave';
                            else if (item.name === 'OCEAN CURL') productRoute = '/curly/ocean-curl';
                          }

                          onClose();
                          navigate(productRoute);
                        }}
                      >
                        {isBookingCartThumb ? (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transform: 'translateX(2px)'
                            }}
                          >
                            <img
                              src={bookingCartItemThumbnailSrc(item as any) || '/assets/appointment-standard.png'}
                              alt={item.name}
                              className="object-contain rounded"
                              style={{
                                width: `${bookingBadgeImgPx}px`,
                                height: `${bookingBadgeImgPx}px`
                              }}
                            />
                          </div>
                        ) : (() => {
                          const thumbSrc = (() => {
                            if (item.name === 'GIFT CARD' || item.type === 'gift-card') {
                              return '/assets/gift-card asset.png';
                            }
                            if (item.type === 'shop-texture-category') {
                              const bcf = shopBcfCartLineThumbnailSrc(item as CartItem);
                              if (bcf) return bcf;
                            }

                            const hairline = item.hairline || 'NATURAL';
                            const hairlineUpper = hairline.toUpperCase();
                            const hasPeak = hairlineUpper.includes('PEAK');
                            const hasLagos = hairlineUpper.includes('LAGOS');

                            if (item.name === 'NOIR') {
                              if (hasPeak) {
                                return '/assets/noir-peak-thumb.png';
                              }
                              if (hasLagos) {
                                return '/assets/noir-lagos-thumb.png';
                              }
                              return item.image || '/assets/NOIR/noir-thumb.png';
                            }

                            if (item.name === 'BLANCO') {
                              if (hasPeak) {
                                // return '/assets/blanco peak front.png';
                              } else if (hasLagos) {
                                // return '/assets/blanco lagos front.png';
                              }
                            } else if (item.name === 'SOFT WAVE') {
                              if (hasPeak) {
                                // return '/assets/soft-wave peak front.png';
                              } else if (hasLagos) {
                                // return '/assets/soft-wave lagos front.png';
                              }
                            } else if (item.name === 'SOFT CURL') {
                              if (hasPeak) {
                                // return '/assets/soft-curl peak front.png';
                              } else if (hasLagos) {
                                // return '/assets/soft-curl lagos front.png';
                              }
                            }

                            return item.image || '/assets/NOIR/noir-thumb.png';
                          })();

                          const imgEl = (
                            <img
                              src={thumbSrc}
                              alt={item.name}
                              className={
                                isBcfShopItem ? 'object-contain rounded' : 'object-cover rounded'
                              }
                              style={{
                                width: `${cartThumbBoxPx}px`,
                                height: `${cartThumbBoxPx}px`
                              }}
                            />
                          );

                          return isBcfShopItem ? (
                            <div style={{ transform: 'translateX(4px)' }}>{imgEl}</div>
                          ) : (
                            imgEl
                          );
                        })()}
                      </div>

                        {item.type === 'booking-appointment' ? (
                          <p
                            className={bookingEditLinkClassName}
                            style={bookingEditLinkStyle}
                            onClick={(e) => {
                              e.stopPropagation();
                              beginEditAppointmentFromCart(item as CartItem, navigate, onClose);
                            }}
                          >
                            EDIT APPOINTMENT
                          </p>
                        ) : null}
                      
                        {/* EDIT IN BUILD-A-WIG text - Only show for units, not gift cards */}
                        {!(
                          item.name === 'GIFT CARD' ||
                          item.type === 'gift-card' ||
                          item.type === 'booking-consult' ||
                          item.type === 'booking-appointment' ||
                          item.type === 'shop-texture-category'
                        ) && (
                          <p 
                            className="font-bold text-center cursor-pointer hover:opacity-80 transition-opacity"
                            style={{ 
                              fontFamily: '"Futura PT Book"',
                              color: '#EB1C24',
                              textTransform: 'uppercase',
                              fontSize: '8px',
                              marginTop: '4px',
                              marginBottom: '0',
                              lineHeight: '1.1'
                            }}
                          onClick={() => {
                            const signedIn =
                              typeof window !== 'undefined' &&
                              localStorage.getItem('isSignedIn') === 'true';
                            // Store the current item details for editing
                            localStorage.setItem('editingCartItem', JSON.stringify(item));
                            localStorage.setItem('editingCartItemId', item.id);
                            localStorage.removeItem('editingSource'); // edit opened from cart → save updates cart
                            
                            // CRITICAL: Store individual customization options with BOTH selected* and editSelected* prefixes
                            // This ensures consistency when loading edit mode
                            const capSize = item.capSize || 'M';
                            const length = item.length || '24"';
                            const density = item.density || '200%';
                            // CRITICAL: Validate BLANCO colors - if item.color is invalid for BLANCO, use PLATINUM
                            let color = item.color;
                            if (item.name === 'BLANCO') {
                              const validBlancoColors = ['GOLDEN', 'PLATINUM', 'ASH'];
                              if (!color || !validBlancoColors.includes(color)) {
                                color = 'PLATINUM'; // Default to PLATINUM for invalid/missing BLANCO colors
                              }
                            } else {
                              color = color || 'OFF BLACK';
                            }
                            const texture = item.texture || 'SILKY';
                            const lace = item.lace || '13X6';
                            const hairline = item.hairline || 'NATURAL';
                            const partSelection = item.partSelection || 'MIDDLE';
                            const styling = item.styling || 'NONE';
                            const addOns = item.addOns || [];
                            
                            // CRITICAL: Calculate capSizePrice based on capSize from cart item
                            const capSizePrice = (capSize === 'XXS/XS/S' || capSize === 'S/M/L') ? '40' : '0';
                            
                            console.log('[FLEX_CAP_DEBUG] CartDropdown Edit Button - Setting capSizePrice:', {
                              capSize,
                              capSizePrice,
                              isFlexible: capSize === 'XXS/XS/S' || capSize === 'S/M/L',
                              timestamp: new Date().toISOString()
                            });
                            
                            // Store with selected* prefix (for sub-pages)
                            localStorage.setItem('selectedCapSize', capSize);
                            localStorage.setItem('selectedCapSizePrice', capSizePrice);
                            localStorage.setItem('selectedLength', length);
                            localStorage.setItem('selectedDensity', density);
                            localStorage.setItem('selectedColor', color);
                            localStorage.setItem('selectedTexture', texture);
                            localStorage.setItem('selectedLace', lace);
                            localStorage.setItem('selectedHairline', hairline);
                            localStorage.setItem('selectedPartSelection', partSelection);
                            localStorage.setItem('selectedStyling', styling);
                            localStorage.setItem('selectedAddOns', JSON.stringify(addOns));
                            
                            // CRITICAL: Also store with editSelected* prefix (for edit mode sub-pages)
                            localStorage.setItem('editSelectedCapSize', capSize);
                            localStorage.setItem('editSelectedCapSizePrice', capSizePrice);
                            localStorage.setItem('editSelectedLength', length);
                            localStorage.setItem('editSelectedDensity', density);
                            localStorage.setItem('editSelectedColor', color);
                            localStorage.setItem('editSelectedTexture', texture);
                            localStorage.setItem('editSelectedLace', lace);
                            localStorage.setItem('editSelectedHairline', hairline);
                            localStorage.setItem('editSelectedStyling', styling);
                            localStorage.setItem('editSelectedAddOns', JSON.stringify(addOns));
                            
                            console.log('Stored localStorage values:', {
                              capSize,
                              length,
                              density,
                              color,
                              texture,
                              lace,
                              hairline,
                              partSelection,
                              styling,
                              addOns
                            });
                            
                            // Dispatch custom event to notify edit page of item change
                            window.dispatchEvent(new CustomEvent('editingCartItemChanged', { detail: { itemId: item.id } }));
                            
                            // Determine the correct edit route based on product name
                            let editRoute = '/build-a-wig/edit'; // Default fallback
                            if (item.name === 'NOIR') {
                              editRoute = '/build-a-wig/noir/edit';
                            } else if (item.name === 'BLANCO') {
                              editRoute = '/build-a-wig/blanco/edit';
                            } else if (item.name === 'SOFT WAVE') {
                              editRoute = '/build-a-wig/soft-wave/edit';
                            } else if (item.name === 'SOFT CURL') {
                              editRoute = '/build-a-wig/soft-curl/edit';
                            } else if (item.name === 'BEACH WAVE') {
                              editRoute = '/build-a-wig/beach-wave/edit';
                            } else if (item.name === 'OCEAN CURL') {
                              editRoute = '/build-a-wig/ocean-curl/edit';
                            }

                            onClose(); // Close the dropdown first
                            if (!signedIn) {
                              setBawEditFromCartReturnTo({ pathname: editRoute });
                              setBawEditFromCartSignInOpen(true);
                              return;
                            }
                            navigate(editRoute); // Navigate to product-specific edit page
                          }}
                        >
                          EDIT IN BUILD-A-WIG
                          </p>
                        )}
                      </div>
                    </div>
                  
                    {/* Item Details */}
                   <div className="flex-1 min-w-0 flex flex-col relative justify-center" style={{ marginLeft: '18px', height: isViewingDetails ? 'auto' : '100%', minHeight: isViewingDetails ? '120px' : '100%' }}>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: isViewingDetails ? 'flex-start' : 'center',
                          alignItems: 'flex-start',
                          margin: 0,
                          padding: 0,
                          transform: productTextTransform,
                          height: isViewingDetails ? 'auto' : '100%',
                          position: isViewingDetails ? 'relative' : 'static',
                          /* Do not set positive `top` here — it fought translateY lift when 6+ detail lines. */
                        }}
                      >
                        <CartLineProductTextStack>
                        <CartLineTextLayer slot="name">
                        <p 
                          className="font-medium truncate cart-product-name"
                          style={cartLineProductNameTextStyle(normalizeCartLineProductName(item))}
                        >
                          {(() => {
                            if (item.type === 'booking-appointment') {
                              return 'BOOKING';
                            }
                            if (item.type === 'booking-consult') {
                              return 'CONSULT';
                            }
                            if (item.type === 'shop-texture-category') {
                              const c = (item as CartItem & { category?: string }).category;
                              if (c === 'bundles') return 'BUNDLES';
                              if (c === 'closures') return 'CLOSURES';
                              if (c === 'frontals') return 'FRONTALS';
                              const head = item.name.split('·')[0]?.trim();
                              return head ? head.toUpperCase() : item.name.replace(/WIG/gi, '').trim();
                            }
                            return item.name.replace(/WIG/gi, '').trim();
                          })()}
                        </p>
                        </CartLineTextLayer>
                        <CartLineTextLayer slot="subtitle" productName={normalizeCartLineProductName(item)}>
                        <p 
                          className="font-bold"
                          style={cartLineRedSubtitleTextStyle()}
                        >
                        {(() => {
                          // Gift card shows "DIGITAL ONLY"
                          if (item.name === 'GIFT CARD' || item.type === 'gift-card') {
                            return 'DIGITAL ONLY';
                          }
                          if (item.type === 'booking-consult' || item.type === 'booking-appointment') {
                            return bookingCartRedSubtitle(item as CartItem);
                          }
                          if (item.type === 'shop-texture-category') {
                            return CART_RED_LINE_BCF_BOOKING;
                          }

                          // Get the correct hair origin based on product name
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
                          return `${item.length || '24"'} RAW ${getHairOrigin(item.name)}`;
                        })()}
                        </p>
                        </CartLineTextLayer>
                        {viewingDetailsFor === item.id && (
                          <CartLineTextLayer slot="details">
                          <p 
                            className="font-bold"
                            style={{ 
                              ...cartLineLayerInnerStyle(),
                              fontFamily: '"Futura PT Book"',
                              color: '#000000',
                              textTransform: 'uppercase',
                              marginBottom: '10px',
                              lineHeight: 1.44,
                              // BCF detail lines (e.g. TREATMENT: PLUCK + BLEACH/TINT) must stay on one row:
                              // drop the right cap + let it use the full (widened) column with no wrap.
                              ...(item.type === 'shop-texture-category'
                                ? { fontSize: '8px', whiteSpace: 'nowrap', marginRight: '0', maxWidth: 'none', wordBreak: 'normal' }
                                : { fontSize: '9px', marginRight: '20px', wordBreak: 'break-word', maxWidth: 'calc(100% - 20px)' })
                            }}
                          dangerouslySetInnerHTML={{
                          __html: (() => {
                          if (item.type === 'booking-consult' || item.type === 'booking-appointment') {
                            return bookingCartViewDetailsHtml(item as CartItem & Record<string, unknown>);
                          }
                          if (item.type === 'shop-texture-category') {
                            return bcfCartViewDetailsHtml(item as CartItem & Record<string, unknown>);
                          }
                          // Build text with non-breaking spaces within comma sections
                          let text = '';
                          
                          // Build array of items to determine what comes after each
                          const items = [];
                          // Cap size intentionally omitted from the unit VIEW DETAILS list.
                          // Add length if it's not the default 24"
                          if (item.length && item.length !== '24"') {
                            items.push({ type: 'length', value: item.length, fullName: item.length });
                          }
                          // Only list density when it's an upgrade (non-default). Blanco default = 250%, others = 200%.
                          const defaultDensityForDetail = item.name === 'BLANCO' ? '250%' : '200%';
                          if (item.density && item.density !== defaultDensityForDetail) items.push({ type: 'density', value: item.density, fullName: `${item.density} density` });
                          if (item.lace && item.lace !== '13X6') items.push({ type: 'lace', value: item.lace, fullName: `${item.lace} lace` });
                          // Texture detail removed - no longer showing curly/wavy texture in cart
                          // For BLANCO, default colors (no line in details): PLATINUM, OFF WHITE, OFF BLACK
                          let itemColor = item.color;
                          if (item.name === 'BLANCO') {
                            const validBlancoColors = ['GOLDEN', 'PLATINUM', 'ASH'];
                            if (!itemColor || !validBlancoColors.includes(itemColor)) {
                              itemColor = 'PLATINUM'; // Normalize invalid/missing to PLATINUM for display
                            }
                          }
                          const blancoDefaultColorsForDetail = ['PLATINUM', 'OFF WHITE', 'OFF BLACK'];
                          const isDefaultColor = item.name === 'BLANCO'
                            ? blancoDefaultColorsForDetail.includes(itemColor || '')
                            : (itemColor === 'OFF BLACK');
                          if (itemColor && !isDefaultColor) items.push({ type: 'color', value: itemColor, fullName: itemColor });
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
                          
                          // Unit VIEW DETAILS shows option labels only — no middle dot, no price delta.
                          const formatPriceDisplay = (_price: number): string => '';
                          
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
                              const price = _getDensityPrice(densityValue, item.name);
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
                              const price = _getTexturePrice(textureValue);
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
                                displayValue = `LAGOS + PEAK${priceDisplay}`;
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
                                  // Replace "BLEACH" with "BLEACH KNOTS" and "PLUCK" with "PLUCK HAIRLINE" for display
                                  const addOnText = addOn.toUpperCase().replace(/BLEACH/g, 'BLEACH KNOTS').replace(/PLUCK/g, 'PLUCK HAIRLINE').replace(/ /g, '\u00A0');
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
                                // Replace "BLEACH" with "BLEACH KNOTS" and "PLUCK" with "PLUCK HAIRLINE" for display
                                const addOnText = String(itemData.value).toUpperCase().replace(/BLEACH/g, 'BLEACH KNOTS').replace(/PLUCK/g, 'PLUCK HAIRLINE').replace(/ /g, '\u00A0');
                                text += addOnText + addOnPriceDisplay;
                              }
                            }
                          });
                          
                          return text;
                          })()
                        }}
                          />
                          </CartLineTextLayer>
                        )}
                        {item.capSize && !hideMetaForDetails && (
                          <CartLineTextLayer slot="cap">
                          <p className="font-semibold" style={cartLineCapSizeTextStyle()}>
                            CAP SIZE: {item.capSize}
                          </p>
                          </CartLineTextLayer>
                        )}
                        {!hideMetaForDetails && (
                        <CartLineTextLayer
                          slot="price"
                          style={
                            item.type === 'shop-texture-category' && !(item as CartItem).bcfBundleDeal
                              ? { paddingTop: 0 }
                              : undefined
                          }
                        >
                        {(item as CartItem).bcfBundleDeal ? (
                          <div
                            style={{
                              margin: 0,
                              width: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'flex-start',
                              gap: '2px',
                              lineHeight: '1.15'
                            }}
                          >
                            {(() => {
                              const listTot = bcfBundleDealResolvedListSubtotal(item as CartItem);
                              const lineTot = isGiftCardCartLine(item)
                                ? giftCardLineTotalUsd(item)
                                : (item.price || 0) * (item.quantity || 1);
                              return (
                                <>
                                  {listTot != null && listTot > lineTot && (
                                    <span
                                      style={{
                                        fontFamily: '"Futura PT Book"',
                                        color: '#808080',
                                        textTransform: 'uppercase',
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        textDecoration: 'line-through',
                                        whiteSpace: 'nowrap'
                                      }}
                                      dangerouslySetInnerHTML={formatPrice(listTot)}
                                    />
                                  )}
                                  <span
                                    style={{
                                      fontFamily: '"Futura PT Book"',
                                      color: '#000000',
                                      textTransform: 'uppercase',
                                      fontSize: '12px',
                                      fontWeight: '600',
                                      whiteSpace: 'nowrap'
                                    }}
                                    dangerouslySetInnerHTML={formatPrice(lineTot)}
                                  />
                                </>
                              );
                            })()}
                          </div>
                        ) : (() => {
                          const coLocked = (item as CartItem & { consultOfferQtyLocked?: boolean }).consultOfferQtyLocked === true;
                          const pre = (item as CartItem & { consultOfferLinePreDiscountUsd?: number }).consultOfferLinePreDiscountUsd;
                          const qty = item.quantity || 1;
                          const lineTot = (isGiftCardCartLine(item) ? giftCardLineTotalUsd(item) : (item.price || 0)) * qty;
                          const listTot =
                            coLocked && typeof pre === 'number' && !Number.isNaN(pre) ? Math.round(pre) * qty : null;
                          if (coLocked && listTot != null && listTot > lineTot) {
                            return (
                              <div
                                style={{
                                  fontFamily: '"Futura PT Book"',
                                  color: '#000000',
                                  textTransform: 'uppercase',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  margin: 0,
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'flex-start',
                                  gap: '2px',
                                  lineHeight: '1.15',
                                }}
                              >
                                <span
                                  style={{
                                    color: '#808080',
                                    textDecoration: 'line-through',
                                    fontSize: '11px',
                                    whiteSpace: 'nowrap',
                                  }}
                                  dangerouslySetInnerHTML={formatPrice(listTot)}
                                />
                                <span style={{ whiteSpace: 'nowrap' }} dangerouslySetInnerHTML={formatPrice(lineTot)} />
                              </div>
                            );
                          }
                          const linePrice = isGiftCardCartLine(item) ? giftCardLineTotalUsd(item) : item.price || 0;
                          return (
                            <WigLineStockPrice
                              item={item}
                              priceHtml={formatPrice(linePrice)}
                              priceStyle={{
                                fontFamily: '"Futura PT Book"',
                                color: '#000000',
                                textTransform: 'uppercase',
                                fontSize: '12px',
                                fontWeight: '600',
                                margin: 0,
                              }}
                            />
                          );
                        })()}
                        </CartLineTextLayer>
                        )}
                        </CartLineProductTextStack>
                      </div>
                    </div>
                  
                  {/* Remove Button */}
                    <div className="flex flex-col items-center flex-shrink-0" style={{ transform: 'translateX(-8px)', width: (item.type === 'shop-texture-category' && viewingDetailsFor === item.id) ? '60px' : '80px', alignItems: 'center' }}>
                      <span
                        style={{
                          fontFamily: '"Futura PT Medium"',
                          fontSize: '8px',
                          color: '#000000',
                          textTransform: 'uppercase',
                          marginBottom: '6px'
                        }}
                      >
                        QTY: {item.quantity ?? 1}
                      </span>
                      <button
                        onClick={() => handleRemoveItemClick(item.id)}
                        className="px-2 py-1 text-red-500 bg-white hover:bg-gray-50 flex items-center justify-center cursor-pointer"
                        style={{ 
                          border: '1.3px solid black',
                          height: '25px',
                          minHeight: '25px',
                          maxHeight: '25px',
                          boxSizing: 'border-box',
                          outline: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <span style={{ fontFamily: 'Cascadia Code, monospace', fontSize: '11px' }}>×</span>
                      </button>
                      {(() => {
                        if (
                          item.type === 'booking-consult' ||
                          item.type === 'booking-appointment' ||
                          item.type === 'shop-texture-category'
                        ) {
                          return (
                            <span
                              style={{
                                fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                                fontSize: '8px',
                                color: '#EB1C24',
                                textTransform: 'uppercase',
                                marginTop: '7px',
                                cursor: 'pointer'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (viewingDetailsFor === item.id) {
                                  setViewingDetailsFor(null);
                                } else {
                                  setViewingDetailsFor(item.id);
                                }
                              }}
                            >
                              {viewingDetailsFor === item.id ? 'CLOSE DETAILS' : 'VIEW DETAILS'}
                            </span>
                          );
                        }
                        // Check if item has specifications (sub page selections)
                        // Only show VIEW DETAILS if item has actual customizations beyond defaults
                        // For BLANCO, flex cap options (XXS/XS/S, S/M/L) are default options, not customizations
                        // For OCEAN CURL, custom cap sizes (XS, S, M, L) are default options, not customizations
                        const isBlanco = item.name === 'BLANCO';
                        const isOceanCurl = item.name === 'OCEAN CURL';
                        // Custom cap sizes (XS, S, M, L) are single-size caps, not flexible caps
                        const customCapSizes = ['XS', 'S', 'M', 'L'];
                        const _isCustomCapSize = item.capSize && customCapSizes.includes(item.capSize);
                        void _isCustomCapSize; // Intentionally unused, kept for future use
                        // For OCEAN CURL, custom cap sizes should not trigger view details (they're defaults)
                        // For other products, flexible caps (XXS/XS/S, S/M/L) trigger view details
                        const hasFlexCap = !isBlanco && item.capSize && (item.capSize === 'XXS/XS/S' || item.capSize === 'S/M/L');
                        // For OCEAN CURL, only flexible caps should trigger view details, not custom cap sizes
                        const hasFlexCapForOceanCurl = isOceanCurl && item.capSize && (item.capSize === 'XXS/XS/S' || item.capSize === 'S/M/L');
                        const hasCustomLength = item.length && item.length !== '24"';
                        // BLANCO default density is 250%, others default to 200%
                        const defaultDensity = item.name === 'BLANCO' ? '250%' : '200%';
                        const hasCustomDensity = item.density && item.density !== defaultDensity;
                        const hasCustomLace = item.lace && item.lace !== '13X6';
                        // Determine default texture based on product type
                        // Straight products (NOIR, BLANCO) default to 'SILKY'
                        // Wavy products (SOFT WAVE, BEACH WAVE) default to 'WAVY'
                        // Curly products (SOFT CURL, OCEAN CURL) default to 'CURLY'
                        const isWavyProduct = item.name === 'SOFT WAVE' || item.name === 'BEACH WAVE';
                        const isCurlyProduct = item.name === 'SOFT CURL' || item.name === 'OCEAN CURL';
                        const defaultTexture = isWavyProduct ? 'WAVY' : isCurlyProduct ? 'CURLY' : 'SILKY';
                        const hasCustomTexture = item.texture && item.texture !== defaultTexture;
                        // BLANCO default colors: PLATINUM (build-a-wig/product), OFF WHITE (units page), OFF BLACK (legacy)
                        const blancoDefaultColors = ['PLATINUM', 'OFF WHITE', 'OFF BLACK'];
                        const hasCustomColor = item.name === 'BLANCO'
                          ? (item.color && !blancoDefaultColors.includes(item.color))
                          : (item.color && item.color !== 'OFF BLACK');
                        const hasCustomHairline = item.hairline && item.hairline !== 'NATURAL';
                        // Styling is only valid if it's a valid styling option AND has partSelection
                        const hairStylingOptions = ['BANGS', 'CRIMPS', 'FLAT IRON', 'LAYERS'];
                        const hasCustomStyling = item.styling && item.styling !== 'NONE' && 
                                                 hairStylingOptions.includes(item.styling) && 
                                                 item.partSelection;
                        const hasAddOns = Array.isArray(item.addOns) && item.addOns.length > 0;
                        
                        // For OCEAN CURL, exclude custom cap sizes from triggering view details
                        // Custom cap sizes (XS, S, M, L) are defaults for OCEAN CURL, so they shouldn't show view details
                        const hasSpecs = (isOceanCurl ? hasFlexCapForOceanCurl : hasFlexCap) || hasCustomLength || hasCustomDensity || hasCustomLace || 
                                        hasCustomTexture || hasCustomColor || hasCustomHairline || 
                                        hasCustomStyling || hasAddOns;
                        
                        if (!hasSpecs) {
                          // Add spacer to maintain consistent height and alignment
                          return <div style={{ height: '20px', marginTop: '6px' }}></div>;
                        }

                        return (
                          <span
                            style={{
                              fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                              fontSize: '8px',
                              color: '#EB1C24',
                              textTransform: 'uppercase',
                              marginTop: '7px',
                              cursor: 'pointer',
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (viewingDetailsFor === item.id) {
                                setViewingDetailsFor(null);
                              } else {
                                setViewingDetailsFor(item.id);
                              }
                            }}
                          >
                            {viewingDetailsFor === item.id ? 'CLOSE DETAILS' : 'VIEW DETAILS'}
                          </span>
                        );
                      })()}
                    </div>
                </div>
                </div>
                  );
                  });
                })()}
            </div>
          )}
        </div>

          {/* Footer with Total and Actions - same padding so empty VIEW BAG matches filled state distance from border */}
          <div className="px-3 py-2" style={{ paddingBottom: '16px' }}>
            {/* Separator line above footer - only when cart has items (no line above empty VIEW BAG) */}
            {cartItems.length > 0 && <div className="border-t border-black mb-2"></div>}
            
            {/* Total Due - only show when cart has items */}
            {cartItems.length > 0 && (
              <div
                className="flex items-center justify-between mb-3 w-full"
                style={{ paddingTop: '8px' }}
              >
                <p
                  style={{
                    fontFamily: '"Futura PT Book"',
                    fontSize: '12px',
                    fontWeight: '600',
                    margin: '0',
                    color: '#000000',
                  }}
                >
                  SUBTOTAL:
                </p>
                <p
                  style={{
                    fontFamily: '"Futura PT Book"',
                    fontSize: '12px',
                    fontWeight: '600',
                    margin: '0',
                    color: '#000000',
                  }}
                  dangerouslySetInnerHTML={formatPrice(getTotalPrice())}
                />
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              {/* VIEW BAG and CHECKOUT when cart has items */}
              {cartItems.length > 0 && (
                <>
                  <button
                    onClick={handleViewCart}
                    className="flex-1 py-2 px-3 border border-black bg-white font-medium hover:bg-gray-50 transition-colors"
                    style={{ 
                      borderWidth: '1.3px',
                      fontSize: '11px',
                      fontFamily: '"Futura PT Medium"',
                      color: '#EB1C24',
                      textTransform: 'uppercase'
                    }}
                  >
                    VIEW BAG
                  </button>
                  <button
                    onClick={handleCheckout}
                    className="flex-1 py-2 px-3 border border-black font-medium hover:bg-gray-50 transition-colors"
                    style={{
                      borderWidth: '1.3px',
                      fontSize: '11px',
                      fontFamily: '"Futura PT Medium"',
                      backgroundColor: '#FFFFFF',
                      color: '#EB1C24',
                      textTransform: 'uppercase'
                    }}
                  >
                    CHECKOUT
                  </button>
                </>
              )}
              {/* VIEW BAG only when cart is empty - same footer position as above so same distance from dropdown border */}
              {cartItems.length === 0 && (
                <button
                  onClick={handleViewCart}
                  className="w-full py-2 px-3 border border-black bg-white font-medium hover:bg-gray-50 transition-colors"
                  style={{ 
                    borderWidth: '1.3px',
                    fontSize: '11px',
                    fontFamily: '"Futura PT Medium"',
                    color: '#EB1C24',
                    textTransform: 'uppercase'
                  }}
                >
                  VIEW BAG
                </button>
              )}
            </div>
          </div>

          </div>
        </div>
    </div>
  );

  // Currency modal in its own portal so it overlaps the cart dropdown and isn't clipped by scroll/overflow
  const currencyModalContent = showCurrencyModal && (
    <div
      data-currency-modal
      className="fixed z-50"
      style={{
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        zIndex: 1000000000,
        pointerEvents: 'none'
      }}
      onClick={(e) => {
        e.stopPropagation();
        setShowCurrencyModal(false);
      }}
    >
      <div
        className="absolute bg-white border border-black shadow-lg baw-brand-modal-shell"
        style={{
          borderWidth: '1.3px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
          top: '50px',
          bottom: '14px',
          left: '12px',
          right: '12px',
          pointerEvents: 'auto',
          paddingTop: '8px',
          paddingLeft: '8px',
          paddingRight: '8px',
          paddingBottom: '0px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-2 relative">
          <div className="flex-1"></div>
          <h3
            className="uppercase absolute left-1/2 transform -translate-x-1/2"
            style={{
              fontSize: '12px',
              fontWeight: 'normal',
              fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
              color: '#000000',
              transform: 'translateX(-50%) translateY(1px)',
              marginTop: '20px'
            }}
          >
            SELECT CURRENCY
          </h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowCurrencyModal(false);
            }}
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              padding: 0,
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transform: 'translate(-2px, 1px)'
            }}
          >
            <img
              src="/assets/close-icon.svg"
              alt="Close"
              style={{
                width: '12.32px',
                height: '12.32px',
                filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)'
              }}
            />
          </button>
        </div>
        <div
          className="text-center"
          style={{
            fontSize: '9px',
            color: '#808080',
            fontFamily: '"Futura PT Book"',
            transform: 'translateY(-1px)',
            marginTop: '10px',
            marginBottom: '6px'
          }}
        >
          SCROLL TO SEE MORE
        </div>
        <div
          className="space-y-1 overflow-y-auto flex-1"
          style={{
            flex: '1 1 auto',
            minHeight: '0',
            maxHeight: 'calc(100% - 6px)',
            marginBottom: '6px'
          }}
        >
          {Object.entries(currencyRates).map(([code, currency], index, array) => (
            <button
              key={code}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCurrency(code);
                const currencyKey = getPerUserKey(PER_USER_KEYS.selectedCurrency, getCurrentUserEmailFromStorage());
                localStorage.setItem(currencyKey, code);
                setShowCurrencyModal(false);
                window.dispatchEvent(new CustomEvent('currencyChanged', { detail: code }));
              }}
              className={`w-full p-2 text-left border-t border-l border-r hover:bg-gray-50 transition-colors ${
                selectedCurrency === code ? 'bg-gray-100' : 'bg-white'
              } ${index === array.length - 1 ? 'border-b' : ''}`}
              style={{
                borderWidth: '1.3px',
                borderColor: '#000000',
                borderStyle: 'solid',
                fontSize: '10px',
                fontFamily: '"Futura PT Medium"',
                color: '#000000',
                textTransform: 'uppercase',
                marginBottom: index < array.length - 1 ? '-1.3px' : '0'
              }}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center" style={{ gap: '8px' }}>
                  <span>{currency.name}</span>
                </div>
                <span style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' }}>{currency.symbol}</span>
              </div>
              <div
                className="text-xs mt-0.5"
                style={{ fontSize: '8px', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' }}
              >
                <span style={{ color: '#EB1C24' }}>1 USD</span>
                <span className="text-gray-500"> = {currency.symbol}{currency.rate.toFixed(2)}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {createPortal(dropdownContent, document.body)}
      {currencyModalContent && createPortal(currencyModalContent, document.body)}
      {createPortal(
        <BuildAWigFeatureSignInModal
          isOpen={bawEditFromCartSignInOpen}
          onClose={() => setBawEditFromCartSignInOpen(false)}
          returnTo={bawEditFromCartReturnTo}
        />,
        document.body
      )}
      {createPortal(
        <ConfirmationModal
          isOpen={showRemoveConfirm}
          onClose={() => {
            setShowRemoveConfirm(false);
            setItemToRemove(null);
          }}
          onConfirm={confirmRemoveItem}
          title="DISCARD ITEM"
          message="ARE YOU SURE YOU WANT TO REMOVE THIS ITEM?"
          confirmText="CONFIRM"
          cancelText="CANCEL"
          dataAttribute="remove-confirm"
        />,
        document.body
      )}
    </>
  );
}
