import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MouseEvent } from 'react';
import DynamicCartIcon from '../../../components/DynamicCartIcon';

function CurlyUnitsPage() {
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
      id: 'soft-curl-curly',
      name: 'SOFT CURL',
      price: 780,
      image: '/assets/NOIR/curl-thumb.png',
      length: '24"',
      hairOrigin: 'VIETNAMESE',
      inCart: false
    },
    {
      id: 'ocean-curl-curly',
      name: 'OCEAN CURL',
      price: 780,
      image: '/assets/NOIR/curl-thumb.png',
      length: '24"',
      hairOrigin: 'FILIPINO',
      inCart: false
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
      e.stopPropagation(); // Prevent card click when clicking cart icon
    }
    console.log('Add to cart clicked for:', product.name);
    // Toggle the inCart state
    setProducts(prevProducts => 
      prevProducts.map(p => 
        p.id === product.id ? { ...p, inCart: !p.inCart } : p
      )
    );
  };

  const handleCardClick = (product: any) => {
    if (product.name === 'SOFT CURL') {
      navigate('/curly/soft-curl');
    } else if (product.name === 'OCEAN CURL') {
      navigate('/curly/ocean-curl');
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
                CURLY
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

          {/* PRODUCT CARDS GRID */}
          <div 
            style={{ 
              width: '100%', 
              display: 'flex',
              flexWrap: 'wrap',
              gap: '28px',
              paddingTop: '50px',
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
                    <div style={{ textAlign: 'center', marginTop: '0', marginBottom: '0' }}>
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
                          cursor: (product.name === 'SOFT CURL' || product.name === 'OCEAN CURL') ? 'pointer' : 'default'
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
                        fontWeight: '500'
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
                        lineHeight: '0.84'
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
                        lineHeight: '0.84'
                      }}
                      dangerouslySetInnerHTML={formatPrice(product.price)}
                    />

                    {/* Star Ratings */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginTop: '2px', marginBottom: '0' }}>
                      {[...Array(5)].map((_, index) => (
                        <img
                          key={index}
                          src="/assets/NOIR/star-symbol.png"
                          alt="Star Rating"
                          style={{ 
                            width: '10px', 
                            height: '10px',
                            filter: 'drop-shadow(0 0 0 1px black)',
                            stroke: '1px black'
                          }}
                        />
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

export default CurlyUnitsPage;

