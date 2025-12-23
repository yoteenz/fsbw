import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MouseEvent } from 'react';
import DynamicCartIcon from '../../../components/DynamicCartIcon';

function ProductsUnitsPage() {
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

  const [productsByTexture, setProductsByTexture] = useState({
    straight: [
      { id: 'noir', name: 'NOIR', price: 740, image: '/assets/NOIR/noir-thumb.png', length: '24"', hairOrigin: 'CAMBODIAN', inCart: false, selectedSize: 'M', route: '/straight/noir' },
      { id: 'blanco', name: 'BLANCO', price: 820, image: '/assets/NOIR/blanco-thumb.png', length: '24"', hairOrigin: 'RUSSIAN', inCart: false, selectedSize: 'M', route: '/straight/blanco' },
    ],
    wavy: [
      { id: 'soft-wave', name: 'SOFT WAVE', price: 760, image: '/assets/NOIR/wave-thumb.png', length: '24"', hairOrigin: 'INDIAN', inCart: false, selectedSize: 'M', route: '/wavy/soft-wave' },
      { id: 'beach-wave', name: 'BEACH WAVE', price: 760, image: '/assets/NOIR/wave-thumb.png', length: '24"', hairOrigin: 'INDONESIAN', inCart: false, selectedSize: 'M', route: '/wavy/beach-wave' },
    ],
    curly: [
      { id: 'soft-curl', name: 'SOFT CURL', price: 780, image: '/assets/NOIR/curl-thumb.png', length: '24"', hairOrigin: 'VIETNAMESE', inCart: false, selectedSize: 'M', route: '/curly/soft-curl' },
      { id: 'ocean-curl', name: 'OCEAN CURL', price: 780, image: '/assets/NOIR/curl-thumb.png', length: '24"', hairOrigin: 'FILIPINO', inCart: false, selectedSize: 'M', route: '/curly/ocean-curl' },
    ],
  });

  // Scroll state for each texture container
  const [straightScroll, setStraightScroll] = useState(0);
  const [wavyScroll, setWavyScroll] = useState(0);
  const [curlyScroll, setCurlyScroll] = useState(0);

  // Load selected currency from localStorage on mount only
  useEffect(() => {
    const savedCurrency = localStorage.getItem('selectedCurrency');
    if (savedCurrency && currencyRates[savedCurrency as keyof typeof currencyRates]) {
      if (savedCurrency !== selectedCurrency) {
        setSelectedCurrency(savedCurrency);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    
    const handleCustomCurrencyChange = (event: CustomEvent) => {
      const newCurrency = event.detail;
      if (newCurrency && currencyRates[newCurrency as keyof typeof currencyRates]) {
        setSelectedCurrency(newCurrency);
        localStorage.setItem('selectedCurrency', newCurrency);
      }
    };
    
    window.addEventListener('currencyChanged', handleCustomCurrencyChange as EventListener);
    
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

  // Check if product is in cart on mount and when cart changes
  useEffect(() => {
    const checkCartItems = () => {
      try {
        const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
        setProductsByTexture(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach(textureKey => {
            updated[textureKey as keyof typeof updated] = updated[textureKey as keyof typeof updated].map(p => {
              // Check if product is in cart (match by name and capSize)
              const inCart = cartItems.some((item: any) => 
                item.name === p.name && item.capSize === p.selectedSize
              );
              return { ...p, inCart };
            });
          });
          return updated;
        });
      } catch (e) {
        console.error('Error checking cart items:', e);
      }
    };

    checkCartItems();
    
    // Listen for cart updates
    const handleCartUpdate = () => checkCartItems();
    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('storage', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('storage', handleCartUpdate);
    };
  }, []);

  const handleAddToCart = (product: any, texture: string, e?: MouseEvent<HTMLDivElement>) => {
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
        setProductsByTexture(prev => ({
          ...prev,
          [texture]: prev[texture as keyof typeof prev].map(p => 
            p.id === product.id ? { ...p, inCart: false } : p
          )
        }));
        
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
          color: product.name === 'NOIR' ? 'OFF BLACK' : product.name === 'BLANCO' ? 'OFF WHITE' : 'OFF BLACK',
          texture: texture === 'straight' ? 'SILKY' : texture === 'wavy' ? 'WAVY' : 'CURLY',
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
        setProductsByTexture(prev => ({
          ...prev,
          [texture]: prev[texture as keyof typeof prev].map(p => 
            p.id === product.id ? { ...p, inCart: true } : p
          )
        }));
        
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

  const handleSizeSelect = (productId: string, texture: string, size: string) => {
    setProductsByTexture(prev => {
      const updated = { ...prev };
      updated[texture as keyof typeof updated] = updated[texture as keyof typeof updated].map(p => {
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
      return updated;
    });
  };

  const handleProductClick = (product: any) => {
    navigate(product.route);
  };

  // Arrow handlers for each texture
  const handleStraightLeftArrow = () => {
    setStraightScroll(0);
  };

  const handleStraightRightArrow = () => {
    setStraightScroll(-window.innerWidth * 0.713);
  };

  const handleWavyLeftArrow = () => {
    setWavyScroll(0);
  };

  const handleWavyRightArrow = () => {
    setWavyScroll(-window.innerWidth * 0.713);
  };

  const handleCurlyLeftArrow = () => {
    setCurlyScroll(0);
  };

  const handleCurlyRightArrow = () => {
    setCurlyScroll(-window.innerWidth * 0.713);
  };

  const renderProductContainer = (texture: string, textureLabel: string) => {
    const products = productsByTexture[texture as keyof typeof productsByTexture];
    const scrollState = texture === 'straight' ? straightScroll : texture === 'wavy' ? wavyScroll : curlyScroll;
    const handleLeftArrow = texture === 'straight' ? handleStraightLeftArrow : texture === 'wavy' ? handleWavyLeftArrow : handleCurlyLeftArrow;
    const handleRightArrow = texture === 'straight' ? handleStraightRightArrow : texture === 'wavy' ? handleWavyRightArrow : handleCurlyRightArrow;
    
    return (
      <div className="px-0 md:px-0" style={{ marginTop: '20px', marginBottom: '20px', overflow: 'visible' }}>
        <div style={{
          border: '1.3px solid black',
          backgroundColor: '#f5f5f5',
          backgroundImage: `url('/assets/marble-container.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          padding: '0px 0px 0px 0px',
          maxWidth: '100%',
          margin: '0 auto',
          overflow: 'visible',
          position: 'relative'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1px' }}>
            <div style={{ width: '1px', height: '15px', backgroundColor: 'black', margin: '0 auto 8px auto' }}></div>
            <h3 
              onClick={() => {
                if (texture === 'straight') navigate('/units/straight');
                else if (texture === 'wavy') navigate('/units/wavy');
                else if (texture === 'curly') navigate('/units/curly');
              }}
              style={{
                fontFamily: '"Futura PT Medium"',
                fontSize: '13px',
                color: '#EB1C24',
                textTransform: 'uppercase',
                margin: '0',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'inline-block',
                width: 'auto',
                height: 'auto'
              }}
            >
              {textureLabel}
            </h3>
          </div>
          
          {/* Content Area */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: products.length >= 4 ? 'space-between' : 'center', gap: '10px', overflow: 'visible' }}>
            {/* Left Arrow - Only show if 4+ products */}
            {products.length >= 4 && (
              <button 
                onClick={handleLeftArrow}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  padding: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  minHeight: '50px',
                  transform: 'translateX(10px) translateY(-10px)'
                }}>
                <img
                  src="/assets/NOIR/left-facing-arrow.svg"
                  alt="Left Arrow"
                  style={{ width: '14px', height: '14px' }}
                />
              </button>
            )}
            
            {/* Product Thumbnails Container with Static Vertical Line */}
            <div style={{ flex: '1', position: 'relative', overflow: 'visible' }}>
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
              
              {/* Shopping Bag Icons Container */}
              <div style={{ 
                position: 'absolute',
                top: '0',
                left: '0',
                right: '0',
                bottom: '0',
                zIndex: 1000,
                pointerEvents: 'none',
                overflow: 'visible'
              }}>
                {products.map((product, index) => {
                  // Position icons relative to their products
                  // Left products (even index): left edge + 16px + scroll offset
                  // Right products (odd index): right edge of product - 34px + scroll offset (-30px - 4px)
                  const isLeft = index % 2 === 0;
                  
                  return (
                    <div
                      key={`icon-${product.id}`}
                      style={{
                        position: 'absolute',
                        top: '-38px',
                        ...(isLeft 
                          ? { left: `calc(${index * 50}% + ${scrollState}px + 16px)` }
                          : { left: `calc(${index * 50}% + 50% + ${scrollState}px - 34px)` }
                        ),
                        pointerEvents: 'auto',
                        cursor: 'pointer',
                        width: '20px',
                        height: '23px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onClick={(e) => { e.stopPropagation(); handleAddToCart(product, texture, e); }}
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
                  );
                })}
              </div>
              
              {/* Scrolling Product Thumbnails Container */}
              <div style={{ 
                overflowX: 'hidden',
                overflowY: 'visible',
                width: '100%',
                position: 'relative',
                maxWidth: '100%',
                marginTop: '-4px',
                paddingTop: '0px'
              }}>
                <div 
                  style={{ 
                    display: 'flex', 
                    flexWrap: 'nowrap',
                    gap: '0',
                    transform: `translateX(${scrollState}px)`,
                    transition: 'none',
                    width: products.length >= 4 ? 'calc(200% - 20px)' : 'calc(100% - 20px)'
                  }}
                >
                  {products.map((product, index) => (
                    <div
                      key={product.id}
                      style={{ 
                        padding: '5px 10px 4px 10px',
                        textAlign: 'center',
                        transform: index % 2 === 0 ? 'translateX(0px) translateY(-4px)' : 'translateX(10px) translateY(-4px)',
                        flex: '0 0 50%',
                        boxSizing: 'border-box',
                        position: 'relative',
                        overflow: 'visible'
                      }}
                    >
                      {/* Product Image */}
                      <img
                        src={product.image}
                        alt={product.name}
                        onClick={() => handleProductClick(product)}
                        style={{ 
                          width: '90%', 
                          height: 'auto',
                          marginBottom: '5px',
                          marginLeft: '10px',
                          maxWidth: '100%',
                          cursor: 'pointer'
                        }}
                      />
                      
                      {/* Product Name */}
                      <p style={{ 
                        fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                        fontSize: product.name === 'NOIR' ? '19px' : '18px',
                        color: 'black',
                        textTransform: 'uppercase',
                        margin: '-10px 0 -3px 0',
                        fontWeight: '500'
                      }}>
                        {product.name}
                      </p>
                      
                      {/* Hair Details */}
                      <p style={{ 
                        fontFamily: '"Futura PT Medium"',
                        fontSize: '10px',
                        color: '#EB1C24',
                        textTransform: 'uppercase',
                        margin: '0 0 5px 0',
                        fontWeight: '500',
                        lineHeight: '0.84'
                      }}>
                        {product.length} RAW {product.hairOrigin}
                      </p>
                      
                      {/* Price */}
                      <p style={{ 
                        fontFamily: '"Futura PT Medium"',
                        fontSize: '12px',
                        color: 'black',
                        textTransform: 'uppercase',
                        margin: '0 0 5px 0',
                        fontWeight: '500',
                        lineHeight: '0.84',
                        transform: 'translateY(2px)'
                      }}
                      dangerouslySetInnerHTML={formatPrice(product.price)}
                      />
                      
                      {/* Cap Size Options */}
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginTop: '2px', transform: 'translateY(1px)' }}>
                        {['XS', 'S', 'M', 'L'].map(size => (
                          <span
                            key={size}
                            onClick={(e) => { e.stopPropagation(); handleSizeSelect(product.id, texture, size); }}
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
                  ))}
                </div>
              </div>
            </div>
            
            {/* Right Arrow - Only show if 4+ products */}
            {products.length >= 4 && (
              <button 
                onClick={handleRightArrow}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  padding: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  minHeight: '50px',
                  transform: 'translateX(-10px) translateY(-10px)'
                }}>
                <img
                  src="/assets/NOIR/right-facing-arrow.svg"
                  alt="Right Arrow"
                  style={{ width: '14px', height: '14px' }}
                />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen" style={{ position: 'relative' }}>
      {/* Roses Background - Fixed to viewport */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundImage: `url('/assets/roses.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: -10,
          pointerEvents: 'none'
        }}
      />
      
      {/* Scrollable Content */}
      <div className="relative z-10" style={{ position: 'relative' }}>
        <div className="flex flex-col py-5 px-4" style={{ minWidth: '100%', maxWidth: 'none', overflow: 'visible', position: 'relative' }}>
          {/* NAV BAR CONTAINER */}
          <div
            className="border-solid border-black flex justify-center items-center py-3 w-full mb-5 px-5 bg-white/60 backdrop-blur-sm relative"
            style={{ border: '1.3px solid black' }}
          >
            {/* Left side buttons */}
            <div className="flex gap-5 absolute left-4">
              <button 
                onClick={() => navigate('/home/products')} 
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
            <p className="text-sm" style={{ fontFamily: '"Futura PT Book"' }}>
              <span 
                style={{ fontFamily: '"Futura PT Book"', fontWeight: '400', cursor: 'pointer' }}
                onClick={() => navigate('/home/products')}
              >
                PRODUCTS &gt;
              </span>{' '}
              <span
                style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}
              >
                UNITS
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

          {/* STRAIGHT CONTAINER */}
          {renderProductContainer('straight', 'STRAIGHT')}

          {/* WAVY CONTAINER */}
          {renderProductContainer('wavy', 'WAVY')}

          {/* CURLY CONTAINER */}
          {renderProductContainer('curly', 'CURLY')}
        </div>
      </div>
    </div>
  );
}

export default ProductsUnitsPage;
