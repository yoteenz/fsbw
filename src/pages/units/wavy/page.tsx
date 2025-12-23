import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MouseEvent } from 'react';
import DynamicCartIcon from '../../../components/DynamicCartIcon';

function WavyUnitsPage() {
  const navigate = useNavigate();

  // Cart count state
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

  const [products, setProducts] = useState([
    {
      id: 'soft-wave-wavy',
      name: 'SOFT WAVE',
      price: 760,
      image: '/assets/NOIR/wave-thumb.png',
      length: '24"',
      hairOrigin: 'INDIAN',
      inCart: false,
      selectedSize: 'M'
    },
    {
      id: 'beach-wave-wavy',
      name: 'BEACH WAVE',
      price: 760,
      image: '/assets/NOIR/wave-thumb.png',
      length: '24"',
      hairOrigin: 'INDONESIAN',
      inCart: false,
      selectedSize: 'M'
    }
  ]);

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

  // Sync inCart state from localStorage on mount and when cart updates
  useEffect(() => {
    const syncCartState = () => {
      try {
        const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
        setProducts(prevProducts => 
          prevProducts.map(p => {
            const inCart = cartItems.some((item: any) => 
              item.name === p.name && item.capSize === (p.selectedSize || 'M')
            );
            return { ...p, inCart };
          })
        );
      } catch (e) {
        console.error('Error syncing cart state:', e);
      }
    };

    syncCartState();
    window.addEventListener('cartUpdated', syncCartState);
    return () => {
      window.removeEventListener('cartUpdated', syncCartState);
    };
  }, []);

  // Format price with currency
  const formatPrice = React.useCallback((price: number): { __html: string } => {
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

  const handleAddToCart = (product: any, e?: MouseEvent<HTMLDivElement>) => {
    if (e) {
      e.stopPropagation();
    }

    try {
      const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      const selectedCapSize = product.selectedSize || 'M';
      
      // Check if this exact product (name + capSize) is already in cart
      const existingItemIndex = cartItems.findIndex((item: any) => 
        item.name === product.name && item.capSize === selectedCapSize
      );

      if (existingItemIndex !== -1) {
        // Remove from cart
        const updatedCartItems = cartItems.filter((_: any, index: number) => index !== existingItemIndex);
        localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
        
        // Update cart count
        const currentCount = parseInt(localStorage.getItem('cartCount') || '0');
        const removedQuantity = cartItems[existingItemIndex].quantity || 1;
        const newCount = Math.max(0, currentCount - removedQuantity);
        localStorage.setItem('cartCount', newCount.toString());
        setCartCount(newCount);
        
        // Update UI state
        setProducts(prevProducts => 
          prevProducts.map(p => 
            p.id === product.id ? { ...p, inCart: false } : p
          )
        );
        
        // Dispatch cart count update event
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: newCount }));
          window.dispatchEvent(new Event('cartUpdated'));
        }, 100);
      } else {
        // Add to cart
        const capSizePrice = 0; // Standard cap sizes (XS, S, M, L) have no additional price
        
        // Create cart item with product details and selected cap size
        const cartItem = {
          id: `${product.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: product.name,
          price: product.price + capSizePrice,
          quantity: 1,
          image: product.image,
          capSize: selectedCapSize,
          capSizePrice: capSizePrice,
          length: product.length || '24"',
          density: '200%',
          color: 'OFF BLACK',
          texture: 'WAVY',
          lace: '13X6',
          hairline: 'NATURAL',
          styling: 'NONE',
          partSelection: 'MIDDLE',
          addOns: []
        };

        // Add new item at the beginning (newest first)
        const updatedCartItems = [cartItem, ...cartItems];
        localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));

        // Update cart count
        const currentCount = parseInt(localStorage.getItem('cartCount') || '0');
        const newCount = currentCount + 1;
        localStorage.setItem('cartCount', newCount.toString());
        setCartCount(newCount);
        
        // Update UI state
        setProducts(prevProducts => 
          prevProducts.map(p => 
            p.id === product.id ? { ...p, inCart: true } : p
          )
        );
        
        // Dispatch cart count update event
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: newCount }));
          window.dispatchEvent(new Event('cartUpdated'));
        }, 100);
      }
    } catch (error) {
      console.error('Error in handleAddToCart:', error);
    }
  };

  const handleSizeSelect = (productId: string, size: string) => {
    setProducts(prevProducts => {
      return prevProducts.map(p => {
        if (p.id === productId) {
          // Check if this product with the new size is in cart
          try {
            const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
            const inCart = cartItems.some((item: any) => 
              item.name === p.name && item.capSize === size
            );
            return { ...p, selectedSize: size, inCart };
          } catch (e) {
            return { ...p, selectedSize: size, inCart: false };
          }
        }
        return p;
      });
    });
  };

  const handleCardClick = (product: any) => {
    if (product.name === 'SOFT WAVE') {
      navigate('/wavy/soft-wave');
    } else if (product.name === 'BEACH WAVE') {
      navigate('/wavy/beach-wave');
    }
  };

  return (
    <div className="min-h-screen" style={{ position: 'relative' }}>
      {/* Roses Background */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url('/assets/roses.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
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
                onClick={() => navigate(-1)} 
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
                onClick={() => navigate('/products/units')}
              >
                UNITS &gt;
              </span>{' '}
              <span
                style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}
              >
                WAVY
              </span>
            </p>

            {/* Right side icons */}
            <div className="gap-5 flex absolute" style={{ right: '17px' }}>
              <div>
                <DynamicCartIcon count={cartCount} width={22} height={19} />
              </div>
              <svg
                width="17"
                height="18"
                viewBox="0 0 16 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="cursor-pointer"
                style={{ marginTop: '2px' }}
              >
                <path d="M0 0H15.75V0.7H7.875H0V0ZM5.25 6.7H10.5H15.375V7.4H10.5H5.25V6.7ZM0 13.1H15.75V13.8H0V13.1Z" fill="black"/>
              </svg>
            </div>
          </div>

          {/* PRODUCT CARDS GRID */}
          <div 
            style={{ 
              width: '100%', 
              display: 'flex',
              flexWrap: 'wrap',
              gap: '28px',
              paddingTop: '35px',
              justifyContent: 'center',
              position: 'relative'
            }}
          >
            {products && products.length > 0 ? products.map((product, index) => {
              if (!product || !product.id) {
                return null;
              }
              
              const isStaggered = index % 2 === 1; // Stagger every other card (1st, 3rd cards are staggered)
              
              return (
                <div
                  key={product.id}
                  style={{
                    position: 'relative',
                    width: 'calc(50% - 15px)',
                    minWidth: '160px',
                    maxWidth: '300px'
                  }}
                >
                  {/* Toggle icon above left card (index 0) */}
                  {index === 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        left: '5px',
                        top: '-18px',
                        zIndex: 5,
                        pointerEvents: 'none'
                      }}
                    >
                      <img
                        src="/assets/toggle.svg"
                        alt="Toggle"
                        style={{
                          width: 'auto',
                          height: 'auto',
                          maxWidth: '30px',
                          maxHeight: '30px'
                        }}
                      />
                    </div>
                  )}

                  {/* Product count text above right card (index 1) */}
                  {index === 1 && (
                    <div
                      style={{
                        position: 'absolute',
                        right: '5px',
                        top: '-21px',
                        transform: 'translateY(20px)',
                        zIndex: 5,
                        pointerEvents: 'none'
                      }}
                    >
                      <p
                        style={{
                          fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                          fontSize: '14px',
                          color: 'black',
                          margin: '0',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {products.length} UNITS
                      </p>
                    </div>
                  )}
                  <div
                    className="relative border border-black"
                    style={{
                      borderWidth: '1.3px',
                      padding: '10px 6px 14px 6px',
                      textAlign: 'center',
                      backgroundColor: '#f5f5f5',
                      backgroundImage: `url('/assets/marble bg.png')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      transform: isStaggered ? 'translateY(20px)' : 'translateY(0px)',
                      transition: 'transform 0.3s ease'
                    }}
                  >
                    {/* Shopping Bag Icon */}
                    <div 
                      style={{ 
                        position: 'absolute', 
                        top: '8px',
                        ...(index % 2 === 0 ? { left: '12px' } : { right: '12px' }),
                        cursor: 'pointer',
                        zIndex: 10,
                        width: '20px',
                        height: '23px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onClick={(e) => handleAddToCart(product, e)}
                    >
                      {product.inCart ? (
                        <img
                          src="/assets/card-added.svg"
                          alt="In cart"
                          width={20}
                          height={23}
                          style={{ width: '20px !important', height: '23px !important' }}
                        />
                      ) : (
                        <img
                          src="/assets/card-add.svg"
                          alt="Add to cart"
                          width={20}
                          height={23}
                          style={{ width: '20px !important', height: '23px !important' }}
                        />
                      )}
                    </div>

                    {/* Product Image */}
                    <div style={{ textAlign: 'center', marginTop: '2px', marginBottom: '0' }}>
                      <img
                        src={product.image}
                        alt={product.name}
                        onClick={() => handleCardClick(product)}
                        style={{
                          width: '100%',
                          height: 'auto',
                          marginBottom: '10px',
                          marginLeft: '5px',
                          marginTop: '0',
                          cursor: (product.name === 'SOFT WAVE' || product.name === 'BEACH WAVE') ? 'pointer' : 'default'
                        }}
                      />
                    </div>

                    {/* Product Name */}
                    <p
                      style={{
                        fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                        fontSize: product.name === 'NOIR' ? '19px' : '18px',
                        color: 'black',
                        textTransform: 'uppercase',
                        margin: '-10px 0 -3px 0',
                        fontWeight: '500',
                        transform: 'translateY(4px)'
                      }}
                    >
                      {product.name}
                    </p>

                    {/* Hair Details */}
                    <p
                      style={{
                        fontFamily: '"Futura PT Medium"',
                        fontSize: '10px',
                        color: '#EB1C24',
                        textTransform: 'uppercase',
                        margin: '0 0 5px 0',
                        fontWeight: '500',
                        lineHeight: '0.84',
                        transform: 'translateY(4px)'
                      }}
                    >
                      {product.length} RAW {product.hairOrigin}
                    </p>

                    {/* Price */}
                    <p
                      style={{
                        fontFamily: '"Futura PT Medium"',
                        fontSize: '12px',
                        color: 'black',
                        textTransform: 'uppercase',
                        margin: '0 0 5px 0',
                        fontWeight: '500',
                        lineHeight: '0.84',
                        transform: 'translateY(4px)'
                      }}
                      dangerouslySetInnerHTML={formatPrice(product.price)}
                    />

                    {/* Cap Size Options */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginTop: '2px', transform: 'translateY(3px)' }}>
                      {['XS', 'S', 'M', 'L'].map(size => (
                        <span
                          key={size}
                          onClick={(e) => { e.stopPropagation(); handleSizeSelect(product.id, size); }}
                          style={{
                            fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                            fontSize: '12px',
                            color: product.selectedSize === size ? '#EB1C24' : 'black',
                            cursor: 'pointer'
                          }}
                        >
                          {size}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }).filter(Boolean) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WavyUnitsPage;

