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
        const storedItems = localStorage.getItem('cartItems');
        console.log('CartDropdown - Loading cart items from localStorage:', storedItems);
        if (storedItems) {
          const items = JSON.parse(storedItems);
          console.log('CartDropdown - Parsed cart items:', items);
          
          // Recalculate prices for all cart items to ensure accuracy
          const recalculatedItems = items.map((item: any) => {
            if (item.name === 'NOIR') {
              // Calculate correct price based on ALL customization options
              let basePrice = 740; // Default for standard caps (XS, S, M, L)
              if (item.capSize === 'XXS/XS/S' || item.capSize === 'S/M/L') {
                basePrice = 780; // Flexible cap options cost $40 extra
              }
              
              // Calculate color price from color name
              let colorPrice = 0;
              if (item.color && item.color !== 'OFF BLACK') {
                colorPrice = getColorPrice(item.color);
                
                // Add extra $40 for lengths over 30" (excluding OFF BLACK)
                if (item.length && ['30"', '32"', '34"', '36"', '40"'].includes(item.length)) {
                  colorPrice += 40;
                }
              }
              
              // CRITICAL: Use the SAVED PRICES from localStorage instead of recalculating
              // This ensures cart prices match the customize page prices exactly
              const lengthPrice = parseFloat(localStorage.getItem('customizeSelectedLengthPrice') || '0');
              const densityPrice = parseFloat(localStorage.getItem('customizeSelectedDensityPrice') || '0');
              const lacePrice = parseFloat(localStorage.getItem('customizeSelectedLacePrice') || '0');
              const texturePrice = parseFloat(localStorage.getItem('customizeSelectedTexturePrice') || '0');
              const hairlinePrice = parseFloat(localStorage.getItem('customizeSelectedHairlinePrice') || '0');
              const stylingPrice = parseFloat(localStorage.getItem('customizeSelectedStylingPrice') || '0');
              const addOnsPrice = parseFloat(localStorage.getItem('customizeSelectedAddOnsPrice') || '0');
              
              const calculatedPrice = basePrice + colorPrice + lengthPrice + densityPrice + lacePrice + texturePrice + hairlinePrice + stylingPrice + addOnsPrice;
              
              console.log('CartDropdown - Recalculated price for item:', {
                itemId: item.id,
                capSize: item.capSize,
                color: item.color,
                lace: item.lace,
                addOns: item.addOns,
                storedPrice: item.price,
                calculatedPrice,
                breakdown: {
                  basePrice,
                  colorPrice,
                  lengthPrice,
                  densityPrice,
                  lacePrice,
                  texturePrice,
                  hairlinePrice,
                  stylingPrice,
                  addOnsPrice
                }
              });
              
              return { ...item, price: calculatedPrice };
            }
            return item;
          });
          
          console.log('CartDropdown - Loading cart items with recalculated prices:', recalculatedItems);
          setCartItems(recalculatedItems);
        } else {
          // Generate mock cart items based on cart count
          const actualPrice = calculateActualPrice();
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
              color: localStorage.getItem('selectedColor') || 'Silky Off Black',
              texture: localStorage.getItem('selectedTexture') || 'Straight',
              lace: localStorage.getItem('selectedLace') || 'Natural Hairline',
              styling: localStorage.getItem('selectedStyling') || 'None',
              addOns: []
            });
          }
          setCartItems(mockItems);
        }
      } catch (error) {
        console.error('Error loading cart items:', error);
        setCartItems([]);
      }
    };

    loadCartItems();
    
    // Listen for cart updates
    const handleCartUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('CartDropdown - Received cartUpdated event:', customEvent.detail);
      loadCartItems();
      setRefreshTrigger(prev => prev + 1); // Force re-render
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
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
  const getCapSizePrice = (_capSize: string) => {
    // All cap sizes (including flexible) have their extra cost included in base price
    // So capSizePrice should always be 0
    return 0;
  };

  // Helper function to get color price based on color name
  const getColorPrice = (color: string) => {
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
  const getLengthPrice = (length: string) => {
    if (!length) return 0;
    const lengthNum = parseInt(length.replace('"', ''));
    if (lengthNum >= 30) return 40;
    return 0;
  };

  // Helper function to get density price based on density
  const getDensityPrice = (density: string) => {
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
  const getLacePrice = (lace: string) => {
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
  const getTexturePrice = (texture: string) => {
    const texturePrices: { [key: string]: number } = {
      'SILKY': 0,
      'KINKY': 0,
      'YAKI': 0
    };
    return texturePrices[texture] || 0;
  };

  // Helper function to get hairline price based on hairline
  const getHairlinePrice = (hairline: string) => {
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
  const getStylingPrice = (styling: string) => {
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
  const getAddOnsPrice = (addOns: string[]) => {
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
          <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between" style={{ marginTop: '6px', paddingBottom: '9px' }}>
            <h3 
              className="font-bold text-black uppercase" 
              style={{ 
                fontSize: '10px',
                fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif'
              }}
            >
              SHOPPING BAG
            </h3>
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
                          
                          // Store individual customization options
                          localStorage.setItem('selectedCapSize', item.capSize || 'M');
                          localStorage.setItem('selectedLength', item.length || '24"');
                          localStorage.setItem('selectedDensity', item.density || '200%');
                          localStorage.setItem('selectedColor', item.color || 'OFF BLACK');
                          localStorage.setItem('selectedTexture', item.texture || 'SILKY');
                          localStorage.setItem('selectedLace', item.lace || '13X6');
                          localStorage.setItem('selectedHairline', item.hairline || 'NATURAL');
                          localStorage.setItem('selectedPartSelection', item.partSelection || 'MIDDLE');
                          localStorage.setItem('selectedStyling', item.styling || 'NONE');
                          localStorage.setItem('selectedAddOns', JSON.stringify(item.addOns || []));
                          
                          console.log('Stored localStorage values:', {
                            capSize: item.capSize,
                            length: item.length,
                            density: item.density,
                            color: item.color,
                            texture: item.texture,
                            lace: item.lace,
                            hairline: item.hairline,
                            partSelection: item.partSelection,
                            styling: item.styling,
                            addOns: item.addOns
                          });
                          
                          onClose(); // Close the dropdown first
                          navigate('/build-a-wig'); // Navigate to build-a-wig main page
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
                          if (item.styling && item.styling !== 'NONE' && item.partSelection) items.push({ type: 'styling', value: item.styling, partSelection: item.partSelection, fullName: item.styling });
                          if (item.addOns && item.addOns.length > 0) items.push({ type: 'addOns', value: item.addOns, fullName: item.addOns });
                          
                          // Use full names if only 1 customizable item (excluding density and lace)
                          const customizableItems = items.filter(item => item.type !== 'density' && item.type !== 'lace');
                          const useFullNames = customizableItems.length === 1;
                          
                          // Check if density/lace are alone (no other items)
                          const hasOtherItems = items.some(item => item.type !== 'density' && item.type !== 'lace');
                          
                          // Build text with proper comma placement
                          items.forEach((itemData, index) => {
                            const isLast = index === items.length - 1;
                            
                            if (itemData.type === 'density' || itemData.type === 'lace') {
                              // Density and lace: full name if alone, abbreviated if with other items
                              const displayValue = hasOtherItems ? itemData.value : itemData.fullName;
                              text += (text ? ' ' : '') + displayValue;
                            } else if (itemData.type === 'texture' || itemData.type === 'color') {
                              // Texture and color get commas unless they're last
                              const displayValue = useFullNames ? itemData.fullName : itemData.value;
                              text += (text ? ' ' : '') + displayValue + (isLast ? '' : ',');
                            } else if (itemData.type === 'hairline') {
                              const displayValue = useFullNames ? itemData.fullName : itemData.value;
                              text += (text ? ' ' : '') + displayValue;
                              // Add line break after lagos to prevent text from getting too close to close button
                              if (itemData.value.includes('LAGOS')) {
                                text += '<br/>';
                              } else {
                                text += (isLast ? '' : ',');
                              }
                            } else if (itemData.type === 'styling') {
                              if (useFullNames) {
                                // For single item, show full styling name
                                const displayValue = itemData.fullName;
                                text += (text ? ' ' : '') + displayValue;
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
                                const stylingText = Array.isArray(itemData.value) ? itemData.value.join(' ') : String(itemData.value);
                                const styledText = stylingText.replace(/ /g, '\u00A0');
                                text += '\u00A0' + styledText + (isLast ? '' : ',');
                              }
                            } else if (itemData.type === 'addOns') {
                              if (useFullNames) {
                                // For single item, show full add-on names
                                const addOnText = Array.isArray(itemData.value) ? itemData.value.join(', ') : String(itemData.value);
                                text += (text ? ' ' : '') + addOnText;
                              } else {
                                // For multiple items, show abbreviated add-ons
                                if (Array.isArray(itemData.value)) {
                                  itemData.value.forEach((addOn: string, addOnIndex: number) => {
                                    // Use non-breaking spaces within add-on section
                                    const addOnText = addOn.replace(/ /g, '\u00A0');
                                    const isLastAddOn = addOnIndex === itemData.value.length - 1;
                                    text += (text ? ' ' : '') + addOnText + (isLastAddOn ? '' : ',');
                                  });
                                } else {
                                  // Handle single string case
                                  const addOnText = String(itemData.value).replace(/ /g, '\u00A0');
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
