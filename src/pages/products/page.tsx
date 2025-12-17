import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MouseEvent } from 'react';
import DynamicCartIcon from '../../components/DynamicCartIcon';

function ProductsPage() {
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

  // Units products state
  const [unitsProducts, setUnitsProducts] = useState([
    {
      id: 'noir',
      name: 'NOIR',
      price: 740,
      image: '/assets/NOIR/noir-thumb.png',
      length: '24"',
      hairOrigin: 'CAMBODIAN',
      inCart: false,
      selectedSize: 'M',
      route: '/straight/noir'
    },
    {
      id: 'blanco',
      name: 'BLANCO',
      price: 820,
      image: '/assets/NOIR/blanco-thumb.png',
      length: '24"',
      hairOrigin: 'RUSSIAN',
      inCart: false,
      selectedSize: 'M',
      route: '/straight/blanco'
    },
    {
      id: 'soft-wave',
      name: 'SOFT WAVE',
      price: 760,
      image: '/assets/NOIR/wave-thumb.png',
      length: '24"',
      hairOrigin: 'INDONESIAN',
      inCart: false,
      selectedSize: 'M',
      route: '/wavy/soft-wave'
    },
    {
      id: 'soft-curl',
      name: 'SOFT CURL',
      price: 780,
      image: '/assets/NOIR/curl-thumb.png',
      length: '24"',
      hairOrigin: 'VIETNAMESE',
      inCart: false,
      selectedSize: 'M',
      route: '/curly/soft-curl'
    }
  ]);

  // Gift card products state
  const [giftCardProducts, setGiftCardProducts] = useState([
    {
      id: 'gift-card-10',
      name: 'GIFT CARD',
      price: 10,
      inCart: false
    },
    {
      id: 'gift-card-15',
      name: 'GIFT CARD',
      price: 15,
      inCart: false
    },
    {
      id: 'gift-card-25',
      name: 'GIFT CARD',
      price: 25,
      inCart: false
    },
    {
      id: 'gift-card-50',
      name: 'GIFT CARD',
      price: 50,
      inCart: false
    },
    {
      id: 'gift-card-75',
      name: 'GIFT CARD',
      price: 75,
      inCart: false
    },
    {
      id: 'gift-card-100',
      name: 'GIFT CARD',
      price: 100,
      inCart: false
    },
    {
      id: 'gift-card-250',
      name: 'GIFT CARD',
      price: 250,
      inCart: false
    },
    {
      id: 'gift-card-500',
      name: 'GIFT CARD',
      price: 500,
      inCart: false
    }
  ]);

  // Scroll state for units container
  const [unitsScroll, setUnitsScroll] = useState(0);
  const [isUnitsDragging, setIsUnitsDragging] = useState(false);
  const [unitsStartX, setUnitsStartX] = useState(0);
  const [unitsStartScroll, setUnitsStartScroll] = useState(0);

  // Scroll state for gift card container
  const [giftCardScroll, setGiftCardScroll] = useState(0);
  const [isGiftCardDragging, setIsGiftCardDragging] = useState(false);
  const [giftCardStartX, setGiftCardStartX] = useState(0);
  const [giftCardStartScroll, setGiftCardStartScroll] = useState(0);

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

  // Units scroll handlers
  const handleUnitsMouseDown = (e: React.MouseEvent) => {
    setIsUnitsDragging(true);
    setUnitsStartX(e.clientX);
    setUnitsStartScroll(unitsScroll);
  };

  const handleUnitsMouseMove = (e: React.MouseEvent) => {
    if (!isUnitsDragging) return;
    const currentX = e.clientX;
    const diff = currentX - unitsStartX;
    const newPosition = unitsStartScroll - diff;
    const minScroll = -window.innerWidth * 0.713;
    const maxScroll = 0;
    setUnitsScroll(Math.max(minScroll, Math.min(maxScroll, newPosition)));
  };

  const handleUnitsMouseUp = () => {
    setIsUnitsDragging(false);
    if (unitsScroll > -window.innerWidth * 0.3565) {
      setUnitsScroll(0);
    } else {
      setUnitsScroll(-window.innerWidth * 0.713);
    }
  };

  const handleUnitsTouchStart = (e: React.TouchEvent) => {
    setIsUnitsDragging(true);
    setUnitsStartX(e.touches[0].clientX);
    setUnitsStartScroll(unitsScroll);
  };

  const handleUnitsTouchMove = (e: React.TouchEvent) => {
    if (!isUnitsDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - unitsStartX;
    const newPosition = unitsStartScroll - diff;
    const minScroll = -window.innerWidth * 0.713;
    const maxScroll = 0;
    setUnitsScroll(Math.max(minScroll, Math.min(maxScroll, newPosition)));
  };

  const handleUnitsTouchEnd = () => {
    setIsUnitsDragging(false);
    if (unitsScroll > -window.innerWidth * 0.3565) {
      setUnitsScroll(0);
    } else {
      setUnitsScroll(-window.innerWidth * 0.713);
    }
  };

  const handleUnitsLeftArrow = () => {
    setUnitsScroll(0);
  };

  const handleUnitsRightArrow = () => {
    setUnitsScroll(-window.innerWidth * 0.713);
  };

  // Gift card scroll handlers
  const handleGiftCardMouseDown = (e: React.MouseEvent) => {
    setIsGiftCardDragging(true);
    setGiftCardStartX(e.clientX);
    setGiftCardStartScroll(giftCardScroll);
  };

  const handleGiftCardMouseMove = (e: React.MouseEvent) => {
    if (!isGiftCardDragging) return;
    const currentX = e.clientX;
    const diff = currentX - giftCardStartX;
    const newPosition = giftCardStartScroll - diff;
    const minScroll = -window.innerWidth * 2.139; // 3 scroll positions (71.3% * 3)
    const maxScroll = 0;
    setGiftCardScroll(Math.max(minScroll, Math.min(maxScroll, newPosition)));
  };

  const handleGiftCardMouseUp = () => {
    setIsGiftCardDragging(false);
    // Snap to nearest position (0, -71.3%, -142.6%, -213.9%)
    const scrollPercent = Math.abs(giftCardScroll) / window.innerWidth;
    if (scrollPercent < 0.3565) {
      setGiftCardScroll(0);
    } else if (scrollPercent < 1.0695) {
      setGiftCardScroll(-window.innerWidth * 0.713);
    } else if (scrollPercent < 1.7825) {
      setGiftCardScroll(-window.innerWidth * 1.426);
    } else {
      setGiftCardScroll(-window.innerWidth * 2.139);
    }
  };

  const handleGiftCardTouchStart = (e: React.TouchEvent) => {
    setIsGiftCardDragging(true);
    setGiftCardStartX(e.touches[0].clientX);
    setGiftCardStartScroll(giftCardScroll);
  };

  const handleGiftCardTouchMove = (e: React.TouchEvent) => {
    if (!isGiftCardDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - giftCardStartX;
    const newPosition = giftCardStartScroll - diff;
    const minScroll = -window.innerWidth * 2.139; // 3 scroll positions (71.3% * 3)
    const maxScroll = 0;
    setGiftCardScroll(Math.max(minScroll, Math.min(maxScroll, newPosition)));
  };

  const handleGiftCardTouchEnd = () => {
    setIsGiftCardDragging(false);
    // Snap to nearest position (0, -71.3%, -142.6%, -213.9%)
    const scrollPercent = Math.abs(giftCardScroll) / window.innerWidth;
    if (scrollPercent < 0.3565) {
      setGiftCardScroll(0);
    } else if (scrollPercent < 1.0695) {
      setGiftCardScroll(-window.innerWidth * 0.713);
    } else if (scrollPercent < 1.7825) {
      setGiftCardScroll(-window.innerWidth * 1.426);
    } else {
      setGiftCardScroll(-window.innerWidth * 2.139);
    }
  };

  const handleGiftCardLeftArrow = () => {
    setGiftCardScroll(0);
  };

  const handleGiftCardRightArrow = () => {
    // Cycle through positions: 0 -> -71.3% -> -142.6% -> -213.9% -> 0
    const scrollPercent = Math.abs(giftCardScroll) / window.innerWidth;
    if (scrollPercent < 0.3565) {
      setGiftCardScroll(-window.innerWidth * 0.713);
    } else if (scrollPercent < 1.0695) {
      setGiftCardScroll(-window.innerWidth * 1.426);
    } else if (scrollPercent < 1.7825) {
      setGiftCardScroll(-window.innerWidth * 2.139);
    } else {
      setGiftCardScroll(0);
    }
  };

  const handleSizeSelect = (productId: string, size: string) => {
    setUnitsProducts(prev => 
      prev.map(p => 
        p.id === productId ? { ...p, selectedSize: size } : p
      )
    );
  };

  const handleAddToCart = (product: any, e?: MouseEvent<HTMLDivElement>) => {
    if (e) {
      e.stopPropagation();
    }
    console.log('Add to cart clicked for:', product.name);
    if (product.route) {
      // Units product
      setUnitsProducts(prevProducts => 
        prevProducts.map(p => 
          p.id === product.id ? { ...p, inCart: !p.inCart } : p
        )
      );
    } else {
      // Gift card product
      setGiftCardProducts(prevProducts => 
        prevProducts.map(p => 
          p.id === product.id ? { ...p, inCart: !p.inCart } : p
        )
      );
    }
  };

  const handleProductClick = (product: any) => {
    if (product.route) {
      navigate(product.route);
    }
  };

  useEffect(() => {
    if (isUnitsDragging) {
      window.addEventListener('mousemove', handleUnitsMouseMove as any);
      window.addEventListener('mouseup', handleUnitsMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleUnitsMouseMove as any);
        window.removeEventListener('mouseup', handleUnitsMouseUp);
      };
    }
  }, [isUnitsDragging, unitsStartX, unitsStartScroll]);

  useEffect(() => {
    if (isGiftCardDragging) {
      window.addEventListener('mousemove', handleGiftCardMouseMove as any);
      window.addEventListener('mouseup', handleGiftCardMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleGiftCardMouseMove as any);
        window.removeEventListener('mouseup', handleGiftCardMouseUp);
      };
    }
  }, [isGiftCardDragging, giftCardStartX, giftCardStartScroll]);

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
            <p className="text-sm" style={{ fontFamily: '"Futura PT Book"' }}>
              <span 
                style={{ fontFamily: '"Futura PT Book"', fontWeight: '400', cursor: 'pointer' }}
                onClick={() => navigate('/')}
              >
                HOME &gt;
              </span>{' '}
              <span
                style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}
              >
                PRODUCTS
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

          {/* UNITS CONTAINER */}
          <div className="px-0 md:px-0" style={{ marginTop: '20px', marginBottom: '20px', transform: 'translateY(-17px)' }}>
            <div style={{ 
              border: '1.3px solid black', 
              backgroundColor: 'rgba(255, 255, 255, 0.6)', 
              backdropFilter: 'blur(10px)',
              padding: '0px',
              maxWidth: '100%',
              margin: '0 auto'
            }}>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                <div style={{ 
                  width: '1px', 
                  height: '15px', 
                  backgroundColor: 'black',
                  margin: '0 auto 8px auto'
                }}></div>
                <h3 
                  onClick={() => navigate('/products/units')}
                  style={{ 
                    fontFamily: '"Futura PT Medium"',
                    fontSize: '12px',
                    color: '#EB1C24',
                    textTransform: 'uppercase',
                    margin: '0',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  UNITS
                </h3>
              </div>
              <div 
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}
              >
                <button 
                  onClick={handleUnitsLeftArrow}
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
                
                {/* Product Thumbnails Container with Static Vertical Line */}
                <div style={{ flex: '1', position: 'relative' }}>
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
                  <div style={{ 
                    overflowX: 'hidden',
                    width: '100%',
                    position: 'relative',
                    maxWidth: '100%'
                  }}>
                    <div 
                      style={{ 
                        display: 'flex', 
                        gap: '0',
                        transform: `translateX(${unitsScroll}px) translateY(-15px)`,
                        transition: 'none',
                        width: 'calc(200% - 20px)'
                      }}
                    >
                      {unitsProducts.map((product, index) => (
                        <div 
                          key={product.id}
                          onClick={() => handleProductClick(product)}
                          style={{ 
                            padding: index === 0 ? '10px 10px 4px 0px' : '10px 10px 4px 10px',
                            textAlign: 'center',
                            transform: index === 0 ? 'translateX(-2.5px)' : 'translateX(13px)',
                            cursor: 'pointer'
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
                          <img
                            src={product.image}
                            alt={product.name}
                            style={{ 
                              width: '90%', 
                              height: 'auto',
                              marginBottom: '10px',
                              marginLeft: '10px'
                            }}
                          />
                          
                          {/* Product Name */}
                          <p style={{ 
                            fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                            fontSize: '18px',
                            color: 'black',
                            textTransform: 'uppercase',
                            margin: '-10px 0 -3px 0',
                            fontWeight: '500',
                            transform: 'translateX(10px)'
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
                            lineHeight: '0.84',
                            transform: 'translateX(10px)'
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
                            transform: 'translateX(10px)'
                          }}
                          dangerouslySetInnerHTML={formatPrice(product.price)}
                          />
                          
                          {/* Cap Size Options */}
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            gap: '14px', 
                            marginTop: '2px',
                            transform: 'translateX(10px)'
                          }}>
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
                      ))}
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={handleUnitsRightArrow}
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductsPage;

