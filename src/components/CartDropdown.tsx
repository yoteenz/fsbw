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
      
      // Get cap size to determine cap size price
      const capSize = localStorage.getItem(`${prefix}CapSize`) || 'M';
      
      // CRITICAL: Base price is ALWAYS 740 for NOIR - flexible cap adds $40 via capSizePrice
      const basePrice = 740;
      
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

  // Helper function to get color price based on color name and length
  const _getColorPrice = (color: string, length?: string) => {
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

  // Helper function to get density price based on density
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
              </div>
            </div>
        </div>


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
                          navigate('/straight/noir'); // Navigate to NOIR unit page
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
                          
                          // Helper function to format price with red color
                          // CRITICAL: This function must not be optimized away in production builds
                          const formatPriceDisplay = (price: number): string => {
                            // Explicitly check for zero to prevent optimization issues
                            if (price === 0 || price === null || price === undefined || isNaN(price)) {
                              return '';
                            }
                            // Show negative sign for negative prices, positive sign for positive prices
                            const sign = price > 0 ? '+' : '-';
                            const priceStr = Math.abs(price).toString();
                            // Explicitly construct the HTML string to prevent minification issues
                            return ' (<span style="color: #EB1C24;">' + sign + '$' + priceStr + '</span>)';
                          };
                          
                          // Build text with each item on its own line and prices in red
                          items.forEach((itemData) => {
                            // Add line break before each item except the first
                            if (text) {
                              text += '<br/>';
                            }
                            
                            // Add hyphen before each line
                            text += '-';
                            
                            if (itemData.type === 'capSize') {
                              // Cap Size: show "FLEX CAP" with price (+$40)
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
                              const price = _getTexturePrice(textureValue);
                              const priceDisplay = formatPriceDisplay(price);
                              const displayValue = `${textureValue} TEXTURE${priceDisplay}`;
                              text += displayValue.toUpperCase();
                            } else if (itemData.type === 'color') {
                              // Color: show value followed by "COLOR" in all caps with price
                              // CRITICAL: Include length to calculate correct price (30"+ adds $40)
                              const colorValue = typeof itemData.value === 'string' ? itemData.value : String(itemData.value);
                              const itemLength = item.length || '24"';
                              const price = _getColorPrice(colorValue, itemLength);
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
                              const addOnsArray = Array.isArray(itemData.value) ? itemData.value : [];
                              const itemLace = item.lace || '13X6';
                              const totalAddOnPrice = _getAddOnsPrice(addOnsArray, itemLace);
                              const priceDisplay = formatPriceDisplay(totalAddOnPrice);
                              
                              if (useFullNames) {
                                // For single item, show full add-on names with price
                                const addOnText = Array.isArray(itemData.value) ? itemData.value.join(', ') : String(itemData.value);
                                text += addOnText.toUpperCase() + priceDisplay;
                              } else {
                                // For multiple items, show abbreviated add-ons with price
                                if (Array.isArray(itemData.value)) {
                                  itemData.value.forEach((addOn: string, addOnIndex: number) => {
                                    // Use non-breaking spaces within add-on section
                                    const addOnPrice = _getAddOnsPrice([addOn], itemLace);
                                    const addOnPriceDisplay = formatPriceDisplay(addOnPrice);
                                    const addOnText = addOn.toUpperCase().replace(/ /g, '\u00A0');
                                    if (addOnIndex > 0) {
                                      text += '<br/>-';
                                    }
                                    text += addOnText + addOnPriceDisplay;
                                  });
                                } else {
                                  // Handle single string case
                                  const addOnText = String(itemData.value).toUpperCase().replace(/ /g, '\u00A0');
                                  text += addOnText + priceDisplay;
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
