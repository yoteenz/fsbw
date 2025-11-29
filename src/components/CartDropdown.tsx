import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { CartItem } from '../types/cart';

interface CartDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  cartCount: number;
}

export default function CartDropdown({ isOpen, onClose, cartCount }: CartDropdownProps) {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  
  console.log('CartDropdown render - isOpen:', isOpen, 'cartCount:', cartCount);
  
  // Currency state
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  // Currency exchange rates
  const currencyRates = useMemo(() => ({
    USD: { symbol: '$', rate: 1.0, name: 'US Dollar' },
    EUR: { symbol: '€', rate: 0.85, name: 'Euro' },
    GBP: { symbol: '£', rate: 0.73, name: 'British Pound' },
    CAD: { symbol: 'C$', rate: 1.25, name: 'Canadian Dollar' },
    AUD: { symbol: 'A$', rate: 1.35, name: 'Australian Dollar' },
    JPY: { symbol: '¥', rate: 110.0, name: 'Japanese Yen' },
    CNY: { symbol: '¥', rate: 6.45, name: 'Chinese Yuan' },
    INR: { symbol: '₹', rate: 75.0, name: 'Indian Rupee' },
    BRL: { symbol: 'R$', rate: 5.2, name: 'Brazilian Real' },
    MXN: { symbol: '$', rate: 20.0, name: 'Mexican Peso' },
    CHF: { symbol: 'CHF', rate: 0.92, name: 'Swiss Franc' },
    SEK: { symbol: 'kr', rate: 8.5, name: 'Swedish Krona' },
    NOK: { symbol: 'kr', rate: 8.8, name: 'Norwegian Krone' },
    DKK: { symbol: 'kr', rate: 6.3, name: 'Danish Krone' },
    PLN: { symbol: 'zł', rate: 3.9, name: 'Polish Zloty' },
    CZK: { symbol: 'Kč', rate: 21.5, name: 'Czech Koruna' },
    HUF: { symbol: 'Ft', rate: 310.0, name: 'Hungarian Forint' },
    RUB: { symbol: '₽', rate: 75.0, name: 'Russian Ruble' },
    TRY: { symbol: '₺', rate: 8.5, name: 'Turkish Lira' },
    ZAR: { symbol: 'R', rate: 15.2, name: 'South African Rand' },
    KRW: { symbol: '₩', rate: 1200.0, name: 'South Korean Won' },
    THB: { symbol: '฿', rate: 32.5, name: 'Thai Baht' },
    SGD: { symbol: 'S$', rate: 1.35, name: 'Singapore Dollar' },
    HKD: { symbol: 'HK$', rate: 7.8, name: 'Hong Kong Dollar' },
    NZD: { symbol: 'NZ$', rate: 1.45, name: 'New Zealand Dollar' },
    ILS: { symbol: '₪', rate: 3.2, name: 'Israeli Shekel' },
    AED: { symbol: 'د.إ', rate: 3.67, name: 'UAE Dirham' },
    SAR: { symbol: '﷼', rate: 3.75, name: 'Saudi Riyal' },
    QAR: { symbol: '﷼', rate: 3.64, name: 'Qatari Riyal' },
    KWD: { symbol: 'د.ك', rate: 0.30, name: 'Kuwaiti Dinar' },
    ARS: { symbol: '$', rate: 180.0, name: 'Argentine Peso' },
    IDR: { symbol: 'Rp', rate: 14500.0, name: 'Indonesian Rupiah' },
    EGP: { symbol: '£', rate: 30.8, name: 'Egyptian Pound' },
    NGN: { symbol: '₦', rate: 410.0, name: 'Nigerian Naira' },
    CLP: { symbol: '$', rate: 850.0, name: 'Chilean Peso' },
    MYR: { symbol: 'RM', rate: 4.2, name: 'Malaysian Ringgit' },
    PHP: { symbol: '₱', rate: 55.0, name: 'Philippine Peso' },
    VND: { symbol: '₫', rate: 24000.0, name: 'Vietnamese Dong' },
    RON: { symbol: 'lei', rate: 4.5, name: 'Romanian Leu' },
    COP: { symbol: '$', rate: 4200.0, name: 'Colombian Peso' },
    JOD: { symbol: 'د.ا', rate: 0.71, name: 'Jordanian Dinar' },
    GTQ: { symbol: 'Q', rate: 7.8, name: 'Guatemalan Quetzal' },
    BGN: { symbol: 'лв', rate: 1.66, name: 'Bulgarian Lev' }
  }), []);

  // Calculate actual price based on localStorage values
  const calculateActualPrice = () => {
    try {
      // Check if we're in edit mode
      const isEditMode = localStorage.getItem('editingCartItem') !== null;
      const prefix = isEditMode ? 'editSelected' : 'selected';
      
      // Get cap size to determine base price
      const capSize = localStorage.getItem(`${prefix}CapSize`) || 'M';
      
      // Calculate base price based on cap size
      let basePrice = 740; // Default for standard caps (XS, S, M, L)
      if (capSize === 'XXS/XS/S' || capSize === 'S/M/L') {
        basePrice = 780; // Flexible cap options cost $40 extra
      }
      
      // Get additional prices
      const capSizePrice = parseInt(localStorage.getItem(`${prefix}CapSizePrice`) || '0');
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
          const itemsWithCorrectPrices = items.map((item: any, index: number) => {
            if (item.name === 'NOIR') {
              const originalPrice = item.price;
              const finalPrice = item.price || 740; // Fallback to base price if missing
              
              // Log price comparison if price seems wrong
              if (isEditMode && index === 0) {
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
                capSize: item.capSize,
                color: item.color,
                storedPrice: originalPrice,
                finalPrice: finalPrice
              });
              
              return { ...item, price: finalPrice };
            }
            return item;
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
          
          setCartItems(itemsWithCorrectPrices);
        } else {
          // Generate mock cart items based on cart count
          const actualPrice = calculateActualPrice();
          console.log('[CART DROPDOWN] No stored items, generating mock items with calculated price:', actualPrice);
          const mockItems: CartItem[] = [];
          for (let i = 0; i < cartCount; i++) {
            mockItems.push({
              id: `item-${i + 1}`,
              name: 'NOIR',
              price: actualPrice,
              quantity: 1,
              image: '/assets/NOIR/noir-thumb.png',
              capSize: localStorage.getItem('selectedCapSize') || 'M',
              length: localStorage.getItem('selectedLength') || '24"',
              density: localStorage.getItem('selectedDensity') || '200%',
              color: localStorage.getItem('selectedColor') || 'OFF BLACK',
              texture: localStorage.getItem('selectedTexture') || 'SILKY',
              lace: localStorage.getItem('selectedLace') || '13X6',
              styling: localStorage.getItem('selectedStyling') || 'NONE',
              addOns: []
            });
          }
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
  }, [cartCount, refreshTrigger]); // Reload when cart count changes or refresh triggered

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

  // Listen for currency changes from other components
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

  // Helper function to get cap size price based on cap size name
  // Note: These helper functions are kept for potential future edit functionality
  // @ts-expect-error - Function kept for potential future use
  const _getCapSizePrice = (_capSize: string) => {
    // All cap sizes (including flexible) have their extra cost included in base price
    // So capSizePrice should always be 0
    return 0;
  };

  // Helper function to get color price based on color name
  // @ts-expect-error - Function kept for potential future use
  const _getColorPrice = (color: string) => {
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
    return colorPrices[color] || 0;
  };

  // Helper function to get length price based on length
  // @ts-expect-error - Function kept for potential future use
  const _getLengthPrice = (length: string) => {
    if (!length) return 0;
    const lengthNum = parseInt(length.replace('"', ''));
    if (lengthNum >= 30) return 40;
    return 0;
  };

  // Helper function to get density price based on density
  // @ts-expect-error - Function kept for potential future use
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

  // Helper function to get lace price based on lace type
  // @ts-expect-error - Function kept for potential future use
  const _getLacePrice = (lace: string) => {
    const lacePrices: { [key: string]: number } = {
      '13X6': 0,    // Default, no additional cost
      '13X4': -20,  // Less than default, discount
      '13X5': 0,
      '13X7': 0,
      '13X8': 0,
      '13X9': 0,
      '13X10': 0,
      '13X11': 0,
      '13X12': 0,
      '13X13': 0,
      '13X14': 0,
      '13X15': 0,
      '13X16': 0,
      '13X17': 0,
      '13X18': 0,
      '13X19': 0,
      '13X20': 0,
      '13X21': 0,
      '13X22': 0,
      '13X23': 0,
      '13X24': 0,
      '13X25': 0,
      '13X26': 0,
      '13X27': 0,
      '13X28': 0,
      '13X29': 0,
      '13X30': 0,
      '13X31': 0,
      '13X32': 0,
      '13X33': 0,
      '13X34': 0,
      '13X35': 0,
      '13X36': 0,
      '13X37': 0,
      '13X38': 0,
      '13X39': 0,
      '13X40': 0,
      '2X6': -40,   // Less than default, discount
      '4X4': -40,   // Less than default, discount
      '5X5': -20,   // Less than default, discount
      '6X6': 60,    // Additional cost for 6X6 lace
      '7X7': 100,   // Additional cost for 7X7 lace
      '9X6': 80     // Additional cost for 9X6 lace
    };
    return lacePrices[lace] || 0;
  };

  // Helper function to get texture price based on texture
  // @ts-expect-error - Function kept for potential future use
  const _getTexturePrice = (texture: string) => {
    const texturePrices: { [key: string]: number } = {
      'SILKY': 0,
      'KINKY': 0,
      'YAKI': 0
    };
    return texturePrices[texture] || 0;
  };

  // Helper function to get hairline price based on hairline
  // @ts-expect-error - Function kept for potential future use
  const _getHairlinePrice = (hairline: string) => {
    if (!hairline) return 0;
    const hairlineArray = hairline.split(',');
    let total = 0;
    
    hairlineArray.forEach(h => {
      const hairlinePrices: { [key: string]: number } = {
        'NATURAL': 0,
        'PEAK': 40,
        'LAGOS': 40,
        'BABY HAIR': 40
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
  // @ts-expect-error - Function kept for potential future use
  const _getStylingPrice = (styling: string) => {
    if (!styling || styling === 'NONE') return 0;
    
    const stylingPrices: { [key: string]: number } = {
      'BANGS': 40,
      'CRIMPS': 140,
      'FLAT IRON': 100,
      'LAYERS': 180
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

  // Helper function to get add-ons price based on add-ons array
  // @ts-expect-error - Function kept for potential future use
  const _getAddOnsPrice = (addOns: string[]) => {
    if (!addOns || addOns.length === 0) return 0;
    
    const addOnPrices: { [key: string]: number } = {
      'BLEACH': 40,
      'PLUCK': 40,
      'BLUNT CUT': 20
    };
    
    return addOns.reduce((total, addOn) => {
      return total + (addOnPrices[addOn] || 0);
    }, 0);
  };

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

  // No need to recalculate prices - use the actual prices stored when items were added

  const removeItem = (itemId: string) => {
    const updatedItems = cartItems.filter(item => item.id !== itemId);
    setCartItems(updatedItems);
    localStorage.setItem('cartItems', JSON.stringify(updatedItems));
    
    // Update cart count
    const newCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
    localStorage.setItem('cartCount', newCount.toString());
    
    // Dispatch both events to ensure all components are notified
    window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: newCount }));
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { items: updatedItems, count: newCount } }));
  };

  // updateQuantity function removed - not currently used

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Debug function to get all price-related localStorage data
  const getDebugInfo = () => {
    const isEditMode = localStorage.getItem('editingCartItem') !== null;
    const editingCartItem = localStorage.getItem('editingCartItem');
    const editingCartItemId = localStorage.getItem('editingCartItemId');
    
    const prefix = isEditMode ? 'editSelected' : 'selected';
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      isEditMode,
      editingCartItem: editingCartItem ? JSON.parse(editingCartItem) : null,
      editingCartItemId,
      currentPrefix: prefix,
      localStoragePrices: {
        basePrice: (() => {
          const capSize = localStorage.getItem(`${prefix}CapSize`) || 'M';
          return (capSize === 'XXS/XS/S' || capSize === 'S/M/L') ? 780 : 740;
        })(),
        capSizePrice: parseInt(localStorage.getItem(`${prefix}CapSizePrice`) || '0'),
        lengthPrice: parseInt(localStorage.getItem(`${prefix}LengthPrice`) || '0'),
        densityPrice: parseInt(localStorage.getItem(`${prefix}DensityPrice`) || '0'),
        colorPrice: parseInt(localStorage.getItem(`${prefix}ColorPrice`) || '0'),
        texturePrice: parseInt(localStorage.getItem(`${prefix}TexturePrice`) || '0'),
        lacePrice: parseInt(localStorage.getItem(`${prefix}LacePrice`) || '0'),
        hairlinePrice: parseInt(localStorage.getItem(`${prefix}HairlinePrice`) || '0'),
        stylingPrice: parseInt(localStorage.getItem(`${prefix}StylingPrice`) || '0'),
        addOnsPrice: parseInt(localStorage.getItem(`${prefix}AddOnsPrice`) || '0'),
      },
      calculatedPrice: calculateActualPrice(),
      cartItems: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        capSize: item.capSize,
        length: item.length,
        density: item.density,
        color: item.color,
        texture: item.texture,
        lace: item.lace,
        hairline: item.hairline,
        styling: item.styling,
        addOns: item.addOns,
      })),
      localStorageSelections: {
        selected: {
          capSize: localStorage.getItem('selectedCapSize'),
          length: localStorage.getItem('selectedLength'),
          density: localStorage.getItem('selectedDensity'),
          color: localStorage.getItem('selectedColor'),
          texture: localStorage.getItem('selectedTexture'),
          lace: localStorage.getItem('selectedLace'),
          hairline: localStorage.getItem('selectedHairline'),
          styling: localStorage.getItem('selectedStyling'),
        },
        editSelected: {
          capSize: localStorage.getItem('editSelectedCapSize'),
          length: localStorage.getItem('editSelectedLength'),
          density: localStorage.getItem('editSelectedDensity'),
          color: localStorage.getItem('editSelectedColor'),
          texture: localStorage.getItem('editSelectedTexture'),
          lace: localStorage.getItem('editSelectedLace'),
          hairline: localStorage.getItem('editSelectedHairline'),
          styling: localStorage.getItem('editSelectedStyling'),
        },
      },
      localStoragePriceKeys: {
        selected: {
          capSizePrice: localStorage.getItem('selectedCapSizePrice'),
          lengthPrice: localStorage.getItem('selectedLengthPrice'),
          densityPrice: localStorage.getItem('selectedDensityPrice'),
          colorPrice: localStorage.getItem('selectedColorPrice'),
          texturePrice: localStorage.getItem('selectedTexturePrice'),
          lacePrice: localStorage.getItem('selectedLacePrice'),
          hairlinePrice: localStorage.getItem('selectedHairlinePrice'),
          stylingPrice: localStorage.getItem('selectedStylingPrice'),
          addOnsPrice: localStorage.getItem('selectedAddOnsPrice'),
        },
        editSelected: {
          capSizePrice: localStorage.getItem('editSelectedCapSizePrice'),
          lengthPrice: localStorage.getItem('editSelectedLengthPrice'),
          densityPrice: localStorage.getItem('editSelectedDensityPrice'),
          colorPrice: localStorage.getItem('editSelectedColorPrice'),
          texturePrice: localStorage.getItem('editSelectedTexturePrice'),
          lacePrice: localStorage.getItem('editSelectedLacePrice'),
          hairlinePrice: localStorage.getItem('editSelectedHairlinePrice'),
          stylingPrice: localStorage.getItem('editSelectedStylingPrice'),
          addOnsPrice: localStorage.getItem('editSelectedAddOnsPrice'),
        },
      },
    };
    
    return debugInfo;
  };


  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  const handleViewCart = () => {
    onClose();
    navigate('/cart');
  };


  // Handle backdrop click to close dropdown
  useEffect(() => {
    const handleBackdropClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Don't close if clicking inside cart dropdown, currency modal, or cart icon
      if (!target.closest('[data-dropdown-content]') && 
          !target.closest('[data-currency-modal]') &&
          !target.closest('[data-cart-icon]')) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleBackdropClick);
      return () => document.removeEventListener('mousedown', handleBackdropClick);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const dropdownContent = (
    <div 
      className="fixed inset-0 pointer-events-none" 
      style={{ 
        zIndex: 999999999
      }}
    >
      <div className="absolute left-4 right-4 pointer-events-auto" style={{ top: '86px' }}>
        <div
          data-dropdown-content
          className="bg-white/60 backdrop-blur-md border border-black shadow-lg hover:shadow-xl transition-all duration-300 ease-out"
        style={{
          borderWidth: '1.3px',
            zIndex: 999999999,
            position: 'relative'
          }}
          onMouseDown={(e) => {
            // Prevent backdrop from closing dropdown when clicking inside
            e.stopPropagation();
        }}
      >
        {/* Header */}
          <div className="px-3 py-2 border-b border-gray-100" style={{ marginTop: '6px', paddingBottom: '9px' }}>
            <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '8px' }}>
              <h3 
                className="font-bold text-black uppercase" 
                style={{ 
                  fontSize: '10px',
                  fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif'
                }}
              >
                SHOPPING BAG
              </h3>
              <div className="flex items-center" style={{ gap: '6px', flexWrap: 'wrap' }}>
                <span
                  style={{ 
                    color: '#EB1C24', 
                    fontSize: '10px',
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif'
                  }}
                >
                  CURRENCY &gt; {selectedCurrency}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setShowDebugPanel(!showDebugPanel);
                  }}
                  onTouchEnd={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setShowDebugPanel(!showDebugPanel);
                  }}
                  style={{ 
                    fontSize: '9px',
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    cursor: 'pointer',
                    padding: '5px 10px',
                    minHeight: '26px',
                    minWidth: '60px',
                    border: '1.3px solid #EB1C24',
                    background: showDebugPanel ? '#EB1C24' : '#fff',
                    color: showDebugPanel ? 'white' : '#EB1C24',
                    WebkitTapHighlightColor: 'rgba(235, 28, 36, 0.2)',
                    touchAction: 'manipulation',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}
                >
                  {showDebugPanel ? 'HIDE DEBUG' : 'DEBUG'}
                </button>
              </div>
            </div>
        </div>

        {/* Debug Panel */}
        {showDebugPanel && (
          <div 
            className="px-3 py-2 border-b border-gray-200"
            style={{ 
              maxHeight: '50vh',
              overflowY: 'auto',
              overflowX: 'hidden',
              fontSize: '7px',
              fontFamily: 'monospace',
              background: '#fff9e6',
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-y'
            }}
          >
            <div 
              className="font-bold mb-2" 
              style={{ 
                fontSize: '10px',
                fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                color: '#000',
                textTransform: 'uppercase',
                position: 'sticky',
                top: 0,
                background: '#fff9e6',
                paddingBottom: '4px',
                zIndex: 1
              }}
            >
              DEBUG INFO
            </div>
            <div 
              style={{ 
                fontSize: '7px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                lineHeight: '1.4',
                color: '#000'
              }}
            >
              {JSON.stringify(getDebugInfo(), null, 2)}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const debugInfo = getDebugInfo();
                console.log('CartDropdown Debug Info:', debugInfo);
                try {
                  navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2));
                  alert('Debug info copied to clipboard and console!');
                } catch (err) {
                  console.error('Failed to copy to clipboard:', err);
                  alert('Debug info logged to console (clipboard not available)');
                }
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
              }}
              style={{
                marginTop: '12px',
                marginBottom: '8px',
                padding: '6px 12px',
                fontSize: '9px',
                fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                background: '#EB1C24',
                color: 'white',
                border: '1.3px solid #EB1C24',
                cursor: 'pointer',
                minHeight: '28px',
                minWidth: '120px',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',
                userSelect: 'none',
                textTransform: 'uppercase'
              }}
            >
              COPY TO CLIPBOARD
            </button>
          </div>
        )}

        {/* Cart Items */}
          <div className="px-3 py-2">
          {cartItems.length === 0 ? (
              <div className="text-center py-4">
              <p 
                style={{ 
                    fontSize: '11px',
                  fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    color: '#808080',
                    textTransform: 'uppercase'
                }}
              >
                  JUST DUST & LINT HERE.
              </p>
            </div>
          ) : (
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-start space-x-3 pt-1 pb-4 border-b border-gray-100 last:border-b-0 min-h-[80px]">
                    {/* Thumbnail Container */}
                    <div className="flex flex-col items-center">
                      {/* Item Image */}
                      <div 
                        className="flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ width: '88px', height: '88px' }}
                        onClick={() => {
                          onClose(); // Close the dropdown first
                          navigate('/units/noir'); // Navigate to NOIR unit page
                        }}
                      >
                        <img
                          src={item.image || "/assets/NOIR/noir-thumb.png"}
                          alt={item.name}
                          className="object-cover rounded"
                          style={{ width: '88px', height: '88px' }}
                        />
                      </div>
                      
                      {/* EDIT IN BUILD-A-WIG text */}
                      <p 
                        className="font-bold text-center cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ 
                          fontFamily: '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif',
                          color: '#EB1C24',
                          textTransform: 'uppercase',
                          fontSize: '8px',
                          marginTop: '6px',
                          lineHeight: '1.1'
                        }}
                        onClick={() => {
                          console.log('Cart item being edited:', item);
                          
                          // Store the current item details for editing
                          localStorage.setItem('editingCartItem', JSON.stringify(item));
                          localStorage.setItem('editingCartItemId', item.id);
                          
                          // CRITICAL: Store individual customization options with BOTH selected* and editSelected* prefixes
                          // This ensures consistency when loading edit mode
                          const capSize = item.capSize || 'M';
                          const length = item.length || '24"';
                          const density = item.density || '200%';
                          const color = item.color || 'OFF BLACK';
                          const texture = item.texture || 'SILKY';
                          const lace = item.lace || '13X6';
                          const hairline = item.hairline || 'NATURAL';
                          const partSelection = item.partSelection || 'MIDDLE';
                          const styling = item.styling || 'NONE';
                          const addOns = item.addOns || [];
                          
                          // Store with selected* prefix (for sub-pages)
                          localStorage.setItem('selectedCapSize', capSize);
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
                          
                          onClose(); // Close the dropdown first
                          navigate('/build-a-wig/edit'); // Navigate to build-a-wig edit page
                        }}
                      >
                        EDIT IN BUILD-A-WIG
                      </p>
                    </div>
                  
                    {/* Item Details */}
                   <div className="flex-1 min-w-0 flex flex-col justify-center" style={{ marginLeft: '18px', marginTop: '4px' }}>
                      <p 
                        className="font-medium truncate cart-product-name"
                        style={{ 
                          fontFamily: '"Covered By Your Grace", cursive',
                          color: '#000000',
                          textTransform: 'uppercase',
                          fontSize: '20px',
                          lineHeight: '1.1',
                          transform: 'translateY(-9px)'
                        }}
                      >
                        {item.name.replace(/WIG/gi, '').trim()}
                      </p>
                      <p 
                        className="font-bold"
                        style={{ 
                          fontFamily: '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif',
                          color: '#EB1C24',
                          textTransform: 'uppercase',
                          fontSize: '9px',
                          marginTop: '-5px',
                          transform: 'translateY(-2px)',
                          lineHeight: '1.1'
                        }}
                      >
                        {item.length || '24"'} RAW CAMBODIAN
                      </p>
                      <p 
                        className="font-bold"
                        style={{ 
                          fontFamily: '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif',
                          color: '#000000',
                          textTransform: 'uppercase',
                          fontSize: '9px',
                          marginTop: '1px',
                          marginRight: '20px',
                          lineHeight: '1.3',
                          wordBreak: 'break-word',
                          maxWidth: 'calc(100% - 20px)'
                        }}
                        dangerouslySetInnerHTML={{
                          __html: (() => {
                          // Build text with non-breaking spaces within comma sections
                          let text = '';
                          
                          // Build array of items to determine what comes after each
                          const items = [];
                          if (item.density && item.density !== '200%') items.push({ type: 'density', value: item.density, fullName: `${item.density} density` });
                          if (item.lace && item.lace !== '13X6') items.push({ type: 'lace', value: item.lace, fullName: `${item.lace} lace` });
                          if (item.texture && item.texture !== 'SILKY') items.push({ type: 'texture', value: item.texture, fullName: item.texture });
                          if (item.color && item.color !== 'OFF BLACK') items.push({ type: 'color', value: item.color, fullName: item.color });
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
                          
                          // Build text with proper comma placement
                          items.forEach((itemData, index) => {
                            const isLast = index === items.length - 1;
                            
                            if (itemData.type === 'density') {
                              // Density: show percentage value followed by "DENSITY" in all caps, add comma if there are more items after it
                              const displayValue = `${itemData.value} DENSITY`;
                              text += (text ? ' ' : '') + displayValue.toUpperCase() + (isLast ? '' : ',');
                            } else if (itemData.type === 'lace') {
                              // Lace: show value followed by "LACE" in all caps, add comma if there are more items after it
                              const displayValue = `${itemData.value} LACE`;
                              text += (text ? ' ' : '') + displayValue.toUpperCase() + (isLast ? '' : ',');
                            } else if (itemData.type === 'texture') {
                              // Texture: show value followed by "TEXTURE" in all caps, add comma if there are more items after it
                              const displayValue = `${itemData.value} TEXTURE`;
                              text += (text ? ' ' : '') + displayValue.toUpperCase() + (isLast ? '' : ',');
                            } else if (itemData.type === 'color') {
                              // Color: show value followed by "COLOR" in all caps, add comma if there are more items after it
                              const displayValue = `${itemData.value} COLOR`;
                              text += (text ? ' ' : '') + displayValue.toUpperCase() + (isLast ? '' : ',');
                            } else if (itemData.type === 'hairline') {
                              // Hairline: show value followed by "HAIRLINE" in all caps
                              let displayValue;
                              const hairlineValue = typeof itemData.value === 'string' ? itemData.value : String(itemData.value);
                              const hairlineUpper = hairlineValue.toUpperCase();
                              if (hairlineUpper.includes('LAGOS') && hairlineUpper.includes('PEAK')) {
                                displayValue = 'LAGOS + PEAK HAIRLINE';
                              } else {
                                displayValue = `${hairlineValue} HAIRLINE`;
                              }
                              text += (text ? ' ' : '') + displayValue.toUpperCase();
                              // Add line break after lagos to prevent text from getting too close to close button
                              if (hairlineValue.includes('LAGOS')) {
                                text += '<br/>';
                              } else {
                                text += (isLast ? '' : ',');
                              }
                            } else if (itemData.type === 'styling') {
                              if (useFullNames) {
                                // For single item, show full styling name
                                const displayValue = itemData.fullName;
                                const displayText = typeof displayValue === 'string' ? displayValue : String(displayValue);
                                text += (text ? ' ' : '') + displayText.toUpperCase();
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
                                text += (text ? ' ' : '') + partAbbrev;
                            
                            // Use non-breaking spaces within styling section and connect to part selection
                            if (typeof itemData.value === 'string') {
                              const stylingText = itemData.value.toUpperCase().replace(/ /g, '\u00A0');
                              text += '\u00A0' + stylingText + (isLast ? '' : ',');
                            }
                              }
                            } else if (itemData.type === 'addOns') {
                              if (useFullNames) {
                                // For single item, show full add-on names
                                const addOnText = Array.isArray(itemData.value) ? itemData.value.join(', ') : String(itemData.value);
                                text += (text ? ' ' : '') + addOnText.toUpperCase();
                              } else {
                                // For multiple items, show abbreviated add-ons
                                if (Array.isArray(itemData.value)) {
                                  itemData.value.forEach((addOn: string, addOnIndex: number) => {
                                    // Use non-breaking spaces within add-on section
                                    const addOnText = addOn.toUpperCase().replace(/ /g, '\u00A0');
                                    const isLastAddOn = addOnIndex === itemData.value.length - 1;
                                    text += (text ? ' ' : '') + addOnText + (isLastAddOn ? '' : ',');
                                  });
                                } else {
                                  // Handle single string case
                                  const addOnText = String(itemData.value).toUpperCase().replace(/ /g, '\u00A0');
                                  text += (text ? ' ' : '') + addOnText;
                                }
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
                        fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                            color: '#808080',
                            textTransform: 'uppercase',
                            fontSize: '10px',
                            marginTop: (() => {
                              // Check if there's black detail text (specifications)
                              const hasSpecs = (item.density && item.density !== '200%') || 
                                             (item.lace && item.lace !== '13X6') || 
                                             (item.texture && item.texture !== 'SILKY') || 
                                             (item.color && item.color !== 'OFF BLACK') || 
                                             (item.hairline && item.hairline !== 'NATURAL') || 
                                             (item.styling && item.styling !== 'NONE') || 
                                             (item.addOns && item.addOns.length > 0);
                              return hasSpecs ? '2px' : '0px';
                            })(),
                            lineHeight: '1.1'
                          }}
                        >
                          CAP SIZE: {item.capSize}
                        </p>
                      )}
                      <p 
                        className="font-bold"
                        style={{ 
                          fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                          color: '#000000',
                          textTransform: 'uppercase',
                          fontSize: '13px',
                          marginTop: (() => {
                            // Check if there's black detail text (specifications)
                            const hasSpecs = (item.density && item.density !== '200%') || 
                                           (item.lace && item.lace !== '13X6') || 
                                           (item.texture && item.texture !== 'SILKY') || 
                                           (item.color && item.color !== 'OFF BLACK') || 
                                           (item.hairline && item.hairline !== 'NATURAL') || 
                                           (item.styling && item.styling !== 'NONE') || 
                                           (item.addOns && item.addOns.length > 0);
                            return hasSpecs ? '2px' : '1px';
                          })()
                        }}
                        dangerouslySetInnerHTML={formatPrice(item.price)}
                      />
                  </div>
                  
                  {/* Remove Button */}
                    <div className="flex items-center flex-shrink-0">
                    <button
                        onClick={() => removeItem(item.id)}
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
                          justifyContent: 'center',
                          transform: 'translateX(-12px)'
                        }}
                      >
                        <span style={{ fontFamily: 'Cascadia Code, monospace', fontSize: '11px' }}>×</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

          {/* Footer with Total and Actions */}
        {cartItems.length > 0 && (
            <div className="px-3 py-2" style={{ paddingBottom: '16px' }}>
              {/* Separator line above footer */}
              <div className="border-t border-gray-200 mb-2"></div>
            <div className="flex items-center justify-center mb-3" style={{ paddingTop: '8px' }}>
              <span 
                  className="font-bold"
                style={{ 
                  fontSize: '12px',
                  fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    color: '#000000',
                    textTransform: 'uppercase'
                }}
                dangerouslySetInnerHTML={{
                  __html: `TOTAL DUE: ${formatPrice(getTotalPrice()).__html}`
                }}
              />
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <button
                  onClick={() => setShowCurrencyModal(true)}
                  className="py-2 px-3 border border-black bg-white font-medium hover:bg-gray-50 transition-colors"
                  style={{ 
                    borderWidth: '1.3px',
                    fontSize: '11px',
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    color: '#EB1C24',
                    textTransform: 'uppercase'
                  }}
                >
                  CHANGE CURRENCY
                </button>
                <button
                  onClick={handleViewCart}
                  className="flex-1 py-2 px-3 border border-black bg-white font-medium hover:bg-gray-50 transition-colors"
                  style={{ 
                    borderWidth: '1.3px',
                    fontSize: '11px',
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
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
                fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    backgroundColor: '#FFFFFF',
                    color: '#EB1C24',
                    textTransform: 'uppercase'
              }}
            >
              CHECKOUT
            </button>
              </div>
          </div>
        )}

        {/* Currency Modal */}
        {showCurrencyModal && (
    <div 
            data-currency-modal
      className="fixed z-50"
      style={{
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        zIndex: 999999999,
        pointerEvents: 'none'
      }}
            onClick={(e) => {
              e.stopPropagation();
              setShowCurrencyModal(false);
            }}
    >
      <div 
              className="absolute bg-white border border-black p-2 shadow-lg"
        style={{ 
          borderWidth: '1.3px',
                maxHeight: '50vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                top: '50px',
          left: '16px',
          right: '16px',
          pointerEvents: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
              {/* Header */}
              <div className="flex justify-between items-center mb-2 relative">
                <div className="flex-1"></div>
              <h3 
                  className="font-bold uppercase absolute left-1/2 transform -translate-x-1/2"
                style={{ 
                    fontSize: '15px',
                  fontFamily: '"Covered By Your Grace", cursive',
                    color: '#000000',
                    transform: 'translateX(-50%) translateY(1px)'
                }}
              >
                SELECT CURRENCY
              </h3>
              <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCurrencyModal(false);
                    }}
                    className="px-2 py-1 text-red-500 bg-white hover:bg-gray-50 flex items-center justify-center cursor-pointer"
                    style={{ 
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
                    <span style={{ fontFamily: 'Cascadia Code, monospace', fontSize: '13px' }}>×</span>
              </button>
            </div>
            
              {/* Scroll Indicator */}
              <div 
                className="text-center mb-1"
                style={{ 
                  fontSize: '8px',
                  color: '#909090',
              fontFamily: '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif'
                }}
              >
                SCROLL TO SEE MORE
            </div>
            
              {/* Currency Options */}
              <div 
                className="space-y-1 overflow-y-auto"
                  style={{ 
                    maxHeight: '35vh',
                    paddingBottom: '20px'
                  }}
            >
              {Object.entries(currencyRates).map(([code, currency]) => (
                <button
                  key={code}
                    onClick={(e) => {
                      e.stopPropagation();
                    setSelectedCurrency(code);
                    setShowCurrencyModal(false);
                  }}
                    className={`w-full p-2 text-left border border-black hover:bg-gray-50 transition-colors ${
                      selectedCurrency === code ? 'bg-gray-100' : 'bg-white'
                  }`}
                  style={{ 
                    borderWidth: '1.3px',
                      fontSize: '10px',
                      fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                      color: '#000000',
                    textTransform: 'uppercase'
                  }}
                >
                  <div className="flex justify-between items-center">
                      <span>{currency.name}</span>
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
        )}
          </div>
        </div>
    </div>
  );

  // Use portal to render outside normal DOM hierarchy
  return createPortal(dropdownContent, document.body);
}
