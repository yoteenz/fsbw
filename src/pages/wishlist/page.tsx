import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DynamicCartIcon from '../../components/DynamicCartIcon';

function WishlistSelection() {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [cartCount, setCartCount] = useState(() => {
    try {
      return parseInt(localStorage.getItem('cartCount') || '0', 10);
    } catch (e) {
      return 0;
    }
  });

  // Currency state - load from localStorage on mount
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

  // Listen for cart count changes
  useEffect(() => {
    const handleCartCountUpdate = (event: CustomEvent) => {
      setCartCount(event.detail);
    };

    const handleStorageChange = () => {
      try {
        const newCartCount = parseInt(localStorage.getItem('cartCount') || '0', 10);
        setCartCount(newCartCount);
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

  useEffect(() => {
    try {
      const stored = localStorage.getItem('wishlistItems');
      if (stored) {
        const items = JSON.parse(stored);
        if (Array.isArray(items) && items.length > 0) {
          setWishlistItems(items);
          return;
        }
      }
      // Add sample products if wishlist is empty
      const sampleProducts = [
        {
          id: 'wishlist-1',
          name: 'NOIR',
          price: 740,
          quantity: 1,
          image: '/assets/NOIR/noir-thumb.png',
          length: '24"',
          hairOrigin: 'CAMBODIAN',
          capSize: 'M',
          density: '200%',
          lace: '13X6',
          texture: 'SILKY',
          color: 'OFF BLACK',
          hairline: 'NATURAL',
          styling: 'STRAIGHT'
        },
        {
          id: 'wishlist-2',
          name: 'BLANCO',
          price: 780,
          quantity: 1,
          image: '/assets/NOIR/noir-thumb.png',
          length: '26"',
          hairOrigin: 'CAMBODIAN',
          capSize: 'L',
          density: '250%',
          lace: '13X6',
          texture: 'SILKY',
          color: 'OFF BLACK',
          hairline: 'NATURAL',
          styling: 'STRAIGHT'
        }
      ];
      setWishlistItems(sampleProducts);
      localStorage.setItem('wishlistItems', JSON.stringify(sampleProducts));
    } catch (e) {
      setWishlistItems([]);
    }
  }, []);

  // Load selected currency from localStorage on mount only
  // Initial state already loads from localStorage, this is a safety check
  useEffect(() => {
    const savedCurrency = localStorage.getItem('selectedCurrency');
    if (savedCurrency && currencyRates[savedCurrency as keyof typeof currencyRates]) {
      // Only update if different to avoid unnecessary re-renders
      if (savedCurrency !== selectedCurrency) {
      setSelectedCurrency(savedCurrency);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount, not when currencyRates changes

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

    // Listen for storage events (from other tabs/windows)
    window.addEventListener('storage', handleCurrencyChange);
    
    // Listen for custom currencyChanged event (from same window)
    const handleCustomCurrencyChange = (event: CustomEvent) => {
      const newCurrency = event.detail;
      if (newCurrency && currencyRates[newCurrency as keyof typeof currencyRates]) {
        setSelectedCurrency(newCurrency);
        localStorage.setItem('selectedCurrency', newCurrency);
      }
    };
    
    window.addEventListener('currencyChanged', handleCustomCurrencyChange as EventListener);
    
    // Poll localStorage periodically to catch any currency changes
    const interval = setInterval(() => {
      handleCurrencyChange();
    }, 500);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleCurrencyChange);
      window.removeEventListener('currencyChanged', handleCustomCurrencyChange as EventListener);
    };
  }, [currencyRates]);

  // Format price with currency
  const formatPrice = React.useCallback((price: number) => {
    if (!price || isNaN(price)) {
      const currency = currencyRates[selectedCurrency as keyof typeof currencyRates];
      return { __html: currency.symbol + '0 ' + selectedCurrency };
    }
    const currency = currencyRates[selectedCurrency as keyof typeof currencyRates];
    const convertedPrice = price * currency.rate;
    return {
      __html: currency.symbol + convertedPrice.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }) + ' ' + selectedCurrency
    };
  }, [currencyRates, selectedCurrency]);

  const handleQuantityChange = (itemId: string, delta: number) => {
    try {
      const newItems = wishlistItems.map(i => {
        if (i.id === itemId) {
          const newQty = Math.max(1, Math.min(10, (i.quantity || 1) + delta));
          return { ...i, quantity: newQty };
        }
        return i;
      });
      setWishlistItems(newItems);
      localStorage.setItem('wishlistItems', JSON.stringify(newItems));
    } catch (e) {
      console.error('Error updating quantity:', e);
    }
  };

  const handleAddToBag = (item: any) => {
    try {
      const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      const existingItem = cartItems.find((ci: any) => ci.id === item.id);
      let updatedItems;
      if (existingItem) {
        updatedItems = cartItems.map((ci: any) =>
          ci.id === item.id ? { ...ci, quantity: (ci.quantity || 1) + (item.quantity || 1) } : ci
        );
      } else {
        // Add new item at the beginning (newest first)
        updatedItems = [{ ...item, quantity: item.quantity || 1 }, ...cartItems];
      }
      localStorage.setItem('cartItems', JSON.stringify(updatedItems));
      const newCount = updatedItems.reduce((sum: number, ci: any) => sum + (ci.quantity || 1), 0);
      localStorage.setItem('cartCount', newCount.toString());
      setCartCount(newCount);
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (e) {
      console.error('Error adding to bag:', e);
    }
  };

  const handleEdit = (item: any) => {
    try {
      localStorage.setItem('editingCartItem', JSON.stringify(item));
      
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
      
      navigate(editRoute);
    } catch (e) {
      console.error('Error setting edit item:', e);
    }
  };

  return (
    <div className="min-h-screen" style={{ position: 'relative' }}>
      {/* Marble Background */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url('/assets/Marble Floor.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center calc(50% + 25px)',
          backgroundRepeat: 'no-repeat',
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
              <button 
                onClick={() => navigate('/build-a-wig')} 
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

            {/* Text in the middle */}
            <p className="text-sm" style={{ fontFamily: '"Futura PT Book"', transform: 'translateY(1px)' }}>
              <span 
                style={{ fontFamily: '"Futura PT Book"', fontWeight: '400', cursor: 'pointer' }}
                onClick={() => navigate('/build-a-wig')}
              >
                ACCOUNT &gt;
              </span>{' '}
              <span
                style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}
              >
                WISHLIST
              </span>
            </p>

            {/* Right side icons */}
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
              />
            </div>
          </div>

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
            {/* WISHLIST PRODUCT CARDS */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '20px' }}>
              {wishlistItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#909090' }}>
                  <p style={{ fontFamily: '"Futura PT Book"', fontSize: '14px' }}>
                    Your wishlist is empty
                  </p>
                </div>
              ) : (
                wishlistItems.map((item, index) => {
                  const itemId = item.id || `wishlist-item-${index}`;
                  const itemName = item.name || 'NOIR';
                  const itemImage = item.image || '/assets/NOIR/noir-thumb.png';
                  const itemLength = item.length || '24"';
                  const itemHairOrigin = item.hairOrigin || 'CAMBODIAN';
                  const itemPrice = item.price || 580;
                  const itemQuantity = item.quantity || 1;

                  return (
                    <div
                      key={itemId}
                      className="border border-black bg-white/60 backdrop-blur-sm"
                      style={{
                        borderWidth: '1.3px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'row',
                        gap: '16px',
                        backgroundColor: 'rgba(255, 255, 255, 0.6)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)'
                      }}
                    >
                      {/* Product Image */}
                      <div style={{ flexShrink: 0, width: '120px', height: '120px', position: 'relative' }}>
                        <img
                          src={itemImage}
                          alt={itemName}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            border: '1.3px solid #000'
                          }}
                        />
                        <p
                          style={{
                            position: 'absolute',
                            top: '4px',
                            left: '4px',
                            color: '#EB1C24',
                            fontFamily: '"Futura PT Demi"',
                            fontSize: '10px',
                            fontWeight: '600',
                            margin: '0',
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            padding: '2px 4px'
                          }}
                        >
                          + LIST
                        </p>
                      </div>

                      {/* Product Details */}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                        <p
                          style={{
                            fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                            color: '#000000',
                            fontSize: '28px',
                            lineHeight: '1.1',
                            margin: '0 0 4px 0',
                            textTransform: 'uppercase'
                          }}
                        >
                          {itemName.replace(/WIG/gi, '').trim()}
                        </p>

                        <p
                          style={{
                            fontFamily: '"Futura PT Book"',
                            color: '#EB1C24',
                            fontSize: '10px',
                            margin: '0 0 4px 0',
                            textTransform: 'uppercase',
                            fontWeight: '500'
                          }}
                        >
                          {itemLength} RAW {itemHairOrigin}
                        </p>

                        {item.capSize && (
                          <p
                            style={{
                              fontFamily: '"Futura PT Book"',
                              color: '#000000',
                              fontSize: '9px',
                              margin: '0 0 8px 0',
                              textTransform: 'uppercase'
                            }}
                          >
                            CAP SIZE: {item.capSize}
                          </p>
                        )}

                        <p
                          style={{
                            fontFamily: '"Futura PT Book"',
                            color: '#000000',
                            fontSize: '14px',
                            margin: '0 0 12px 0',
                            fontWeight: '500'
                          }}
                          dangerouslySetInnerHTML={formatPrice(itemPrice)}
                        />

                        {/* Quantity Controls and Add to Bag */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', border: '1.3px solid #000' }}>
                            <button
                              onClick={() => handleQuantityChange(itemId, -1)}
                              style={{
                                width: '28px',
                                height: '28px',
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontFamily: '"Futura PT Book"',
                                fontSize: '16px',
                                padding: '0'
                              }}
                              type="button"
                            >
                              −
                            </button>
                            <span
                              style={{
                                width: '40px',
                                textAlign: 'center',
                                fontFamily: '"Futura PT Book"',
                                fontSize: '14px',
                                borderLeft: '1.3px solid #000',
                                borderRight: '1.3px solid #000',
                                padding: '4px 0'
                              }}
                            >
                              {itemQuantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(itemId, 1)}
                              style={{
                                width: '28px',
                                height: '28px',
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontFamily: '"Futura PT Book"',
                                fontSize: '16px',
                                padding: '0'
                              }}
                              type="button"
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => handleAddToBag(item)}
                            style={{
                              fontFamily: '"Futura PT Book"',
                              fontSize: '12px',
                              color: '#909090',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '0',
                              textTransform: 'uppercase'
                            }}
                            type="button"
                          >
                            ADD TO BAG
                          </button>
                        </div>

                        {/* Edit Link */}
                        {(itemName.toLowerCase().includes('noir') || itemName.toLowerCase().includes('blanco') || itemName.toLowerCase().includes('soft wave')) && (
                          <p
                            onClick={() => handleEdit(item)}
                            style={{
                              fontFamily: '"Futura PT Book"',
                              color: '#EB1C24',
                              fontSize: '9px',
                              margin: '8px 0 0 0',
                              cursor: 'pointer',
                              textTransform: 'uppercase',
                              textDecoration: 'underline'
                            }}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleEdit(item); }}
                          >
                            EDIT IN BUILD-A-WIG
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* VIEW LISTS BUTTON */}
          <div className="px-0 md:px-0" style={{ marginTop: '2px' }}>
            <button
              onClick={() => {
                console.log('View lists clicked');
              }}
              className="border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
              style={{ 
                borderWidth: '1.3px', 
                color: '#EB1C24',
                fontFamily: '"Futura PT Medium"',
                backgroundColor: '#FFFFFF'
              }}
              type="button"
            >
              VIEW LISTS
            </button>
          </div>

          {/* EMPTY WISHLIST BUTTON */}
          <div className="px-0 md:px-0" style={{ marginTop: '10px' }}>
            <button
              onClick={() => {
                setWishlistItems([]);
                localStorage.setItem('wishlistItems', JSON.stringify([]));
              }}
              className="border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
              style={{ 
                borderWidth: '1.3px', 
                color: '#EB1C24',
                fontFamily: '"Futura PT Medium"'
              }}
              type="button"
            >
              EMPTY WISHLIST
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WishlistSelection;
