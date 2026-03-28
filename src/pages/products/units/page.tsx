import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { MouseEvent } from 'react';
import DynamicCartIcon from '../../../components/DynamicCartIcon';
import ConfirmationModal from '../../../components/ConfirmationModal';
import BrandMenuLinks from '../../../components/BrandMenuLinks';
import SocialMenuIcons from '../../../components/SocialMenuIcons';
import { getPerUserKey, getCurrentUserEmailFromStorage, PER_USER_KEYS } from '../../../utils/perUserStorage';
import { clearAppAuth } from '../../../utils/adminAuth';
import type { CurrencyRatesRecord } from '../../../utils/currencyFormat';
import { formatPriceUsd } from '../../../utils/currencyFormat';

function ProductsUnitsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  /** TEMP: green outlines — outer = flex column (half-slot), inner = padded band. Set `false` to hide. */
  const DEBUG_PRODUCT_FLEX_BOUNDS = false;
  const dbgProductCol: React.CSSProperties = DEBUG_PRODUCT_FLEX_BOUNDS
    ? { outline: '2px solid #00ff00', outlineOffset: '0px' }
    : {};
  const dbgProductBand: React.CSSProperties = DEBUG_PRODUCT_FLEX_BOUNDS
    ? { outline: '2px dashed #00cc00', outlineOffset: '-2px' }
    : {};

  // Cart count state
  const [cartCount, setCartCount] = useState(() => {
    try {
      return parseInt(localStorage.getItem('cartCount') || '0', 10);
    } catch (e) {
      return 0;
    }
  });

  // Mobile menu state
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mobileMenuActiveTab, setMobileMenuActiveTab] = useState(() => {
    const pathname = window.location.pathname;
    if (pathname.includes('/tools') || pathname === '/tools/gift-card') {
      return 'TOOLS';
    } else if (pathname.includes('/brand') || pathname.includes('/about') || pathname.includes('/contact') || pathname.includes('/faq') || pathname.includes('/reviews') || pathname.includes('/terms')) {
      return 'BRAND';
    }
    return 'SHOP';
  });
  const [mobileMenuExpandedItems, setMobileMenuExpandedItems] = useState<string[]>([]);
  const [isSignedIn, setIsSignedIn] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('isSignedIn') === 'true';
      } catch (e) {
        return false;
      }
    }
    return false;
  });
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [windowWidth, setWindowWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth;
    }
    return 1024;
  });

  // Track window width for responsive layout
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /** Measured overflow strip width (STRAIGHT card) — scroll step must match or columns drift. */
  const productStripViewportRef = useRef<HTMLDivElement>(null);
  const [stripViewportW, setStripViewportW] = useState(() =>
    typeof window !== 'undefined' ? Math.max(200, window.innerWidth - 32) : 320
  );

  useLayoutEffect(() => {
    if (showMobileMenu) return;
    const el = productStripViewportRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      if (w > 0) setStripViewportW(w);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [showMobileMenu, windowWidth]);

  // Currency state - per user
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

  // Check sign-in status on mount and listen for changes
  useEffect(() => {
    const checkSignInStatus = () => {
      try {
        const signedIn = localStorage.getItem('isSignedIn') === 'true';
        setIsSignedIn(prev => {
          // Only update if value has changed to prevent unnecessary re-renders
          if (prev !== signedIn) {
            return signedIn;
          }
          return prev;
        });
      } catch (e) {
        setIsSignedIn(prev => {
          if (prev !== false) {
            return false;
          }
          return prev;
        });
      }
    };

    // Skip initial check since useState already reads from localStorage
    // Only set up listeners for future changes

    // Listen for storage changes (when user signs in/out in another tab)
    const handleStorageChange = () => {
      checkSignInStatus();
    };

    // Listen for sign-in state changes from sign-in page
    const handleSignInStateChange = () => {
      checkSignInStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);
    window.addEventListener('signInStateChanged', handleSignInStateChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
      window.removeEventListener('signInStateChanged', handleSignInStateChange as EventListener);
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
      { id: 'soft-curl', name: 'SOFT CURL', price: 780, image: '/assets/NOIR/curl-thumb.png', length: '24"', hairOrigin: 'FILIPINO', inCart: false, selectedSize: 'M', route: '/curly/soft-curl' },
      { id: 'ocean-curl', name: 'OCEAN CURL', price: 780, image: '/assets/NOIR/curl-thumb.png', length: '24"', hairOrigin: 'VIETNAMESE', inCart: false, selectedSize: 'M', route: '/curly/ocean-curl' },
    ],
  });

  // Scroll state for each texture container
  const [straightScroll, setStraightScroll] = useState(0);
  const [wavyScroll, setWavyScroll] = useState(0);
  const [curlyScroll, setCurlyScroll] = useState(0);

  // Load selected currency from localStorage on mount (per-user key)
  useEffect(() => {
    const key = getPerUserKey(PER_USER_KEYS.selectedCurrency, getCurrentUserEmailFromStorage());
    const savedCurrency = localStorage.getItem(key);
    if (savedCurrency && currencyRates[savedCurrency as keyof typeof currencyRates]) {
      if (savedCurrency !== selectedCurrency) setSelectedCurrency(savedCurrency);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save selected currency to localStorage (per-user key)
  useEffect(() => {
    const key = getPerUserKey(PER_USER_KEYS.selectedCurrency, getCurrentUserEmailFromStorage());
    localStorage.setItem(key, selectedCurrency);
  }, [selectedCurrency]);

  // Listen for currency changes from cart dropdown
  useEffect(() => {
    const handleCurrencyChange = () => {
      const key = getPerUserKey(PER_USER_KEYS.selectedCurrency, getCurrentUserEmailFromStorage());
      const savedCurrency = localStorage.getItem(key);
      if (savedCurrency && currencyRates[savedCurrency as keyof typeof currencyRates]) {
        setSelectedCurrency(savedCurrency);
      }
    };

    window.addEventListener('storage', handleCurrencyChange);
    
    const handleCustomCurrencyChange = (event: CustomEvent) => {
      const newCurrency = event.detail;
      if (newCurrency && currencyRates[newCurrency as keyof typeof currencyRates]) {
        setSelectedCurrency(newCurrency);
        const key = getPerUserKey(PER_USER_KEYS.selectedCurrency, getCurrentUserEmailFromStorage());
        localStorage.setItem(key, newCurrency);
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

  // Update active tab based on current route
  useEffect(() => {
    const pathname = location.pathname;
    if (pathname.includes('/tools') || pathname === '/tools/gift-card') {
      setMobileMenuActiveTab('TOOLS');
    } else if (pathname.includes('/brand') || pathname.includes('/about') || pathname.includes('/contact') || pathname.includes('/faq') || pathname.includes('/reviews') || pathname.includes('/terms')) {
      setMobileMenuActiveTab('BRAND');
    } else {
      setMobileMenuActiveTab('SHOP');
    }
  }, [location.pathname]);

  // Ensure active tab is set correctly when menu opens
  useEffect(() => {
    if (showMobileMenu) {
      const pathname = location.pathname;
      if (pathname.includes('/tools') || pathname === '/tools/gift-card') {
        setMobileMenuActiveTab('TOOLS');
      } else if (pathname.includes('/brand') || pathname.includes('/about') || pathname.includes('/contact') || pathname.includes('/faq') || pathname.includes('/reviews') || pathname.includes('/terms')) {
        setMobileMenuActiveTab('BRAND');
      } else {
        setMobileMenuActiveTab('SHOP');
      }
    }
  }, [showMobileMenu, location.pathname]);

  const handleMobileMenuToggle = () => {
    setShowMobileMenu(!showMobileMenu);
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
    if (isSignedIn) {
      // Show confirmation modal when signing out
      setShowSignOutConfirm(true);
    } else {
      navigate('/sign-in');
    }
  };

  const handleSignOut = () => {
    setIsSignedIn(false);
    clearAppAuth();
    // Dispatch custom event to update other pages in same tab
    window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'false' }));
    setShowSignOutConfirm(false);
    // Close mobile menu
    setShowMobileMenu(false);
  };

  const formatPrice = React.useCallback(
    (price: number) => formatPriceUsd(price, selectedCurrency, currencyRates as CurrencyRatesRecord),
    [currencyRates, selectedCurrency]
  );

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
    setStraightScroll(-Math.max(200, windowWidth - 32));
  };

  const handleWavyLeftArrow = () => {
    setWavyScroll(0);
  };

  const handleWavyRightArrow = () => {
    setWavyScroll(-Math.max(200, stripViewportW));
  };

  const handleCurlyLeftArrow = () => {
    setCurlyScroll(0);
  };

  const handleCurlyRightArrow = () => {
    setCurlyScroll(-Math.max(200, stripViewportW));
  };

  const renderProductContainer = (texture: string, textureLabel: string, isFirstMarble = false) => {
    const products = productsByTexture[texture as keyof typeof productsByTexture];
    const scrollState = texture === 'straight' ? straightScroll : texture === 'wavy' ? wavyScroll : curlyScroll;
    const handleLeftArrow = texture === 'straight' ? handleStraightLeftArrow : texture === 'wavy' ? handleWavyLeftArrow : handleCurlyLeftArrow;
    const handleRightArrow = texture === 'straight' ? handleStraightRightArrow : texture === 'wavy' ? handleWavyRightArrow : handleCurlyRightArrow;

    const isLargeScreen = windowWidth > 1024;
    const pairCount = Math.ceil(products.length / 2);
    const productRowWidthPct =
      products.length >= 4
        ? isLargeScreen
          ? products.length * 25
          : pairCount * 100
        : 100;
    
    return (
      <div className="px-0 md:px-0 transition-all duration-300 ease-out" style={{ marginTop: isFirstMarble ? '0' : '20px', marginBottom: '20px', overflow: 'visible' }}>
        <div className="transition-all duration-300 ease-out" style={{
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
          <div style={{ textAlign: 'center', marginBottom: '2px' }}>
            <div style={{ width: '1px', height: '15px', backgroundColor: 'black', margin: '0 auto 2px auto' }}></div>
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
          
          {/* Content area: full-width track; arrows absolutely positioned (not in flex) */}
          <div style={{ position: 'relative', width: '100%', overflow: 'visible', boxSizing: 'border-box' }}>
            {products.length >= 4 && (
              <button
                type="button"
                onClick={handleLeftArrow}
                aria-label="Previous products"
                style={{
                  position: 'absolute',
                  left: 6,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 25,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <img
                  src="/assets/NOIR/left-facing-arrow.svg"
                  alt=""
                  style={{ width: '14px', height: '14px', display: 'block' }}
                />
              </button>
            )}

            <div style={{ width: '100%', position: 'relative', overflow: 'visible', boxSizing: 'border-box' }}>
              {/* Single Center Line with Masking */}
              <div style={{
                position: 'absolute',
                left: '50%',
                top: '0',
                bottom: '6px',
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
                bottom: '6px',
                width: '10px',
                backgroundColor: 'transparent',
                zIndex: 15,
                transform: 'translateX(-50%)',
                pointerEvents: 'none'
              }}></div>
              
              {/* Strip: products row + bag overlay outside overflow-x clip (same pattern as home/shop UNITS) */}
              <div
                ref={texture === 'straight' ? productStripViewportRef : undefined}
                style={{
                  width: '100%',
                  position: 'relative',
                  maxWidth: '100%',
                  marginTop: 0,
                  paddingTop: '10px',
                  paddingBottom: 0,
                  overflow: 'visible',
                  boxSizing: 'border-box'
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    overflowX: 'clip',
                    overflowY: 'visible',
                    boxSizing: 'border-box'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'nowrap',
                      alignItems: 'stretch',
                      gap: '0',
                      transform: `translateX(${scrollState}px)`,
                      transition: 'none',
                      width: `${productRowWidthPct}%`,
                      boxSizing: 'border-box'
                    }}
                  >
                  {products.map((product, index) => {
                    const flexBasis =
                      isLargeScreen && products.length >= 4 ? '25%' : '50%';

                    return (
                    <div
                      key={product.id}
                      style={{
                        padding: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'stretch',
                        justifyContent: 'flex-start',
                        flex: `0 0 ${flexBasis}`,
                        boxSizing: 'border-box',
                        position: 'relative',
                        overflow: 'visible',
                        minWidth: 0,
                        ...dbgProductCol
                      }}
                    >
                      {/* Full width from card edge ↔ center line (left column) or center line ↔ edge (right column) */}
                      <div
                        style={{
                          width: '100%',
                          flex: '1 1 auto',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          boxSizing: 'border-box',
                          padding: '5px 12px 4px 12px',
                          ...dbgProductBand
                        }}
                      >
                      <div
                        style={{
                          width: '100%',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginBottom: '5px'
                        }}
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          onClick={() => handleProductClick(product)}
                          style={{
                            width: 'calc(90% * 0.88)',
                            height: 'auto',
                            maxWidth: '100%',
                            display: 'block',
                            margin: 0,
                            cursor: 'pointer'
                          }}
                        />
                      </div>

                      <div
                        style={{
                          width: '100%',
                          textAlign: 'center',
                          boxSizing: 'border-box'
                        }}
                      >
                        <p
                          style={{
                            fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                            fontSize: '18px',
                            color: 'black',
                            textTransform: 'uppercase',
                            margin: 0,
                            fontWeight: '500',
                            lineHeight: 1.05,
                            minHeight: '22px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {product.name}
                        </p>

                        <p
                          style={{
                            fontFamily: '"Futura PT Medium"',
                            fontSize: '10px',
                            color: '#EB1C24',
                            textTransform: 'uppercase',
                            margin: '2px 0 5px 0',
                            fontWeight: '500',
                            lineHeight: '0.84',
                            minHeight: '12px',
                            transform: 'translateY(1px)'
                          }}
                        >
                          {product.length} RAW {product.hairOrigin}
                        </p>

                        <p
                          style={{
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

                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '14px',
                            marginTop: '2px',
                            transform: 'translateY(1px)'
                          }}
                        >
                          {['XS', 'S', 'M', 'L'].map((size) => (
                            <span
                              key={size}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSizeSelect(product.id, texture, size);
                              }}
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
                    </div>
                    );
                  })}
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: '10px',
                      pointerEvents: 'none',
                      overflow: 'visible',
                      zIndex: 24
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'nowrap',
                        alignItems: 'flex-start',
                        gap: '0',
                        transform: `translateX(${scrollState}px)`,
                        transition: 'none',
                        width: `${productRowWidthPct}%`,
                        boxSizing: 'border-box'
                      }}
                    >
                      {products.map((product, index) => {
                        const flexBasis =
                          isLargeScreen && products.length >= 4 ? '25%' : '50%';
                        const isLeftColumn = index % 2 === 0;
                        return (
                          <div
                            key={`bag-${texture}-${product.id}`}
                            style={{
                              flex: `0 0 ${flexBasis}`,
                              minWidth: 0,
                              height: 0,
                              position: 'relative',
                              overflow: 'visible',
                              pointerEvents: 'auto'
                            }}
                          >
                            <div
                              style={{
                                position: 'absolute',
                                top: '-36px',
                                ...(isLeftColumn ? { left: 16 } : { right: 16 }),
                                zIndex: 1000,
                                pointerEvents: 'auto',
                                cursor: 'pointer',
                                width: '20px',
                                height: '23px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(product, texture, e);
                              }}
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
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {products.length >= 4 && (
              <button
                type="button"
                onClick={handleRightArrow}
                aria-label="Next products"
                style={{
                  position: 'absolute',
                  right: 6,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 25,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <img
                  src="/assets/NOIR/right-facing-arrow.svg"
                  alt=""
                  style={{ width: '14px', height: '14px', display: 'block' }}
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
              {showMobileMenu ? (
                <>
                  <button 
                    onClick={() => navigate(isSignedIn ? '/account' : '/sign-in')}
                    className="cursor-pointer" 
                    style={{ height: '15px !important', width: '21px !important', padding: '0 !important', border: 'none !important', background: 'none !important', transform: 'translateX(4px)' }}
                  >
                    <img
                      alt="Account icon"
                      width="16"
                      height="16"
                      src="/assets/NOIR/account-icon.svg"
                    />
                  </button>
                  <button 
                    onClick={() => navigate(isSignedIn ? '/wishlist' : '/sign-in')} 
                    className="cursor-pointer"
                    style={{ height: '21px !important', width: '21px !important', padding: '0 !important', border: 'none !important', background: 'none !important', transform: 'translateX(2px)' }}
                  >
                    <img
                      alt="Wishlist"
                      width="18"
                      height="18"
                      src="/assets/wishlist-heart.svg"
                    />
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => navigate('/home/shop')} 
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
                </>
              )}
            </div>

            {/* Text in the middle */}
            <p className="text-sm" style={{ fontFamily: '"Futura PT Book"', transform: 'translateY(1px)' }}>
              {showMobileMenu ? (
                <>
                  <span 
                    style={{ fontFamily: '"Futura PT Book"', fontWeight: '400', cursor: 'pointer' }}
                    onClick={() => navigate('/lobby')}
                  >
                    HOME &gt;
                  </span>{' '}
                  <span
                    style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}
                  >
                    MENU
                  </span>
                </>
              ) : (
                <>
                  <span 
                    style={{ fontFamily: '"Futura PT Book"', fontWeight: '400', cursor: 'pointer' }}
                    onClick={() => navigate('/home/shop')}
                  >
                    SHOP &gt;
                  </span>{' '}
                  <span
                    style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}
                  >
                    UNITS
                  </span>
                </>
              )}
            </p>

            {/* Right side icons */}
            <div className="gap-5 flex absolute" style={{ right: '17px' }}>
<div style={{ transform: `translateX(${cartCount === 0 ? 7 : 5}px)` }}>
              <DynamicCartIcon count={cartCount} width={22} height={19} variant="nav" />
              </div>
              <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg
                  width="17"
                  height="18"
                  viewBox="0 0 16 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="cursor-pointer"
                  onClick={handleMobileMenuToggle}
                  style={{ marginTop: '2px' }}
                >
                  <path d="M0 0H15.75V0.7H7.875H0V0ZM5.25 6.7H10.5H15.375V7.4H10.5H5.25V6.7ZM0 13.1H15.75V13.8H0V13.1Z" fill="black"/>
                </svg>
              </div>
            </div>
          </div>

          {showMobileMenu ? (
            /* MENU CONTENT */
            <div
              className="border border-black flex flex-col pt-6 pb-4 px-5 mb-2 bg-white/60 backdrop-blur-sm transition-all duration-300 ease-out"
              style={{ 
                borderWidth: '1.3px', 
                minWidth: '100%', 
                maxWidth: 'none', 
                overflow: 'visible',
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                minHeight: 'calc(100dvh - 80px)',
                height: 'calc(100dvh - 80px)'
              }}
            >
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', paddingTop: '20px', flex: 1, minHeight: 0, position: 'relative' }}>
                {/* Navigation Links */}
                <div className="flex justify-center gap-8" style={{ marginBottom: '30px' }}>
                  <button
                    onClick={() => handleMobileMenuTabClick('SHOP')}
                    style={{ 
                      fontFamily: mobileMenuActiveTab === 'SHOP' ? '"Futura PT Medium"' : '"Futura PT Book"',
                      fontSize: '14px',
                      color: mobileMenuActiveTab === 'SHOP' ? '#EB1C24' : 'black',
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      borderBottom: mobileMenuActiveTab === 'SHOP' ? '1px solid #EB1C24' : 'none',
                      borderTop: 'none',
                      borderLeft: 'none',
                      borderRight: 'none',
                      paddingBottom: '4px',
                      background: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    SHOP
                  </button>
                  <button
                    onClick={() => handleMobileMenuTabClick('TOOLS')}
                    style={{ 
                      fontFamily: mobileMenuActiveTab === 'TOOLS' ? '"Futura PT Medium"' : '"Futura PT Book"',
                      fontSize: '14px',
                      color: mobileMenuActiveTab === 'TOOLS' ? '#EB1C24' : 'black',
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      borderBottom: mobileMenuActiveTab === 'TOOLS' ? '1px solid #EB1C24' : 'none',
                      borderTop: 'none',
                      borderLeft: 'none',
                      borderRight: 'none',
                      paddingBottom: '4px',
                      background: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    TOOLS
                  </button>
                  <button
                    onClick={() => handleMobileMenuTabClick('BRAND')}
                    style={{ 
                      fontFamily: mobileMenuActiveTab === 'BRAND' ? '"Futura PT Medium"' : '"Futura PT Book"',
                      fontSize: '14px',
                      color: mobileMenuActiveTab === 'BRAND' ? '#EB1C24' : 'black',
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      borderBottom: mobileMenuActiveTab === 'BRAND' ? '1px solid #EB1C24' : 'none',
                      borderTop: 'none',
                      borderLeft: 'none',
                      borderRight: 'none',
                      paddingBottom: '4px',
                      background: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    BRAND
                  </button>
                </div>

                {/* Menu Items - Fixed height with scroll if needed */}
                <div style={{ flex: '1', overflowY: 'auto', marginBottom: '20px', minHeight: '0' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
                    {mobileMenuActiveTab === 'TOOLS' ? (
                      ['GIFT CARD'].map((item, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => navigate('/tools/gift-card')}
                        >
                          <span style={{ 
                            fontFamily: '"Futura PT Book"',
                            fontSize: '14px',
                            color: 'black',
                            fontWeight: '500',
                            textTransform: 'uppercase',
                            transform: 'translateX(13px)'
                          }}>
                            {item}
                          </span>
                        </div>
                      ))
                    ) : mobileMenuActiveTab === 'BRAND' ? (
                      <BrandMenuLinks onClose={() => setShowMobileMenu(false)} />
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
                            className="flex items-center justify-between"
                            style={{ alignItems: 'center', cursor: item.label === 'ORDER AUTHORIZATION FORM' ? 'pointer' : 'default' }}
                            onClick={() => {
                              if (!item.isExpandable && item.label === 'ORDER AUTHORIZATION FORM') {
                                navigate('/shop/order-form');
                              } else if (!item.isExpandable && item.label === 'BUILD-A-WIG') {
                                navigate('/build-a-wig');
                              }
                            }}
                          >
                            <span 
                              style={{ 
                                fontFamily: '"Futura PT Book"',
                                fontSize: '14px',
                                color: 'black',
                                fontWeight: '500',
                                textTransform: 'uppercase',
                                cursor: 'pointer',
                                transform: 'translateX(13px)'
                              }}
                              onClick={() => {
                                if (item.isExpandable) {
                                  if (item.label === 'UNITS' && mobileMenuExpandedItems.includes(item.label)) {
                                    navigate('/shop/units');
                                  } else {
                                    handleMobileMenuItemToggle(item.label);
                                  }
                                } else if (item.label === 'ORDER AUTHORIZATION FORM') {
                                  navigate('/shop/order-form');
                                } else if (item.label === 'BUILD-A-WIG') {
                                  navigate('/build-a-wig');
                                }
                              }}
                            >
                              {item.label}
                            </span>
                            {item.hasArrow && (
                              <img
                                src="/assets/NOIR/closed-arrow.svg"
                                alt="Arrow"
                                style={{ 
                                  width: '16px', 
                                  height: '16px',
                                  transform: `${mobileMenuExpandedItems.includes(item.label) ? 'translateX(-11px) translateY(-4px) rotate(90deg)' : 'translateX(-11px) translateY(-4px) rotate(0deg)'}`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  cursor: 'pointer'
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (item.isExpandable) {
                                    handleMobileMenuItemToggle(item.label);
                                  }
                                }}
                              />
                            )}
                          </div>
                          {item.isExpandable && mobileMenuExpandedItems.includes(item.label) && item.subItems && (
                            <div className="ml-4 mt-2 space-y-2">
                              {item.subItems.map((subItem, subIndex) => (
                                <div 
                                  key={subIndex} 
                                  className="flex items-center cursor-pointer"
                                  onClick={() => {
                                    if (subItem === 'STRAIGHT') {
                                      navigate('/units/straight');
                                    } else if (subItem === 'WAVY') {
                                      navigate('/units/wavy');
                                    } else if (subItem === 'CURLY') {
                                      navigate('/units/curly');
                                    }
                                  }}
                                >
                                  <span style={{ 
                                    fontFamily: '"Futura PT Book"',
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

                {/* Sign In/Out - Fixed at bottom */}
                <div className="flex justify-center" style={{ marginBottom: '20px', marginTop: 'auto' }}>
                  <span 
                    onClick={handleMobileMenuSignInToggle}
                    style={{ 
                      fontFamily: '"Futura PT Medium"',
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

                {/* Social Media Icons - Fixed at bottom */}
                <div style={{ marginBottom: '20px' }}><SocialMenuIcons /></div>
              </div>
            </div>
          ) : (
            <div className="transition-all duration-300 ease-out">
          {/* STRAIGHT CONTAINER */}
          {renderProductContainer('straight', 'STRAIGHT', true)}

          {/* WAVY CONTAINER */}
          {renderProductContainer('wavy', 'WAVY')}

          {/* CURLY CONTAINER */}
          {renderProductContainer('curly', 'CURLY')}
            </div>
          )}
        </div>
      </div>

      {/* Sign Out Confirmation Modal */}
      <ConfirmationModal
        isOpen={showSignOutConfirm}
        onClose={() => setShowSignOutConfirm(false)}
        onConfirm={handleSignOut}
        title="SIGN OUT"
        message="ARE YOU SURE YOU WANT TO SIGN OUT?"
        confirmText="CONFIRM"
        cancelText="CANCEL"
        dataAttribute="sign-out-confirm"
      />
    </div>
  );
}

export default ProductsUnitsPage;
