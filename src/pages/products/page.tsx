import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { MouseEvent } from 'react';
import DynamicCartIcon from '../../components/DynamicCartIcon';
import ConfirmationModal from '../../components/ConfirmationModal';
import BrandMenuLinks from '../../components/BrandMenuLinks';
import SocialMenuIcons from '../../components/SocialMenuIcons';
import { getPerUserKey, getCurrentUserEmailFromStorage, PER_USER_KEYS } from '../../utils/perUserStorage';
import { clearAppAuth } from '../../utils/adminAuth';
import { formatPriceRangeUsd, formatPriceUsd, type CurrencyRatesRecord } from '../../utils/currencyFormat';
import {
  shopTextureCategoryThumbDisplayScale,
  shopTextureCategoryThumbFallbackSrc,
  shopTextureCategoryThumbSrc,
  isShopTextureCurlyFrontals
} from '../../utils/shopTextureCategoryThumb';
import { ShopMobileMenuShopTab } from '../../components/ShopMobileMenuShopTab';
import { ShopMobileMenuToolsTab } from '../../components/ShopMobileMenuToolsTab';
import { signInHrefWithReturnTo } from '../../utils/signInReturnTo';

function ProductsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  /** TEMP: green outlines on home/shop product flex cells — set `false` to hide. */
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
      hairOrigin: 'INDIAN',
      inCart: false,
      selectedSize: 'M',
      route: '/wavy/soft-wave'
    },
    {
      id: 'beach-wave',
      name: 'BEACH WAVE',
      price: 760,
      image: '/assets/NOIR/wave-thumb.png',
      length: '24"',
      hairOrigin: 'INDONESIAN',
      inCart: false,
      selectedSize: 'M',
      route: '/wavy/beach-wave'
    },
    {
      id: 'soft-curl',
      name: 'SOFT CURL',
      price: 780,
      image: '/assets/NOIR/curl-thumb.png',
      length: '24"',
      hairOrigin: 'FILIPINO',
      inCart: false,
      selectedSize: 'M',
      route: '/curly/soft-curl'
    },
    {
      id: 'ocean-curl',
      name: 'OCEAN CURL',
      price: 780,
      image: '/assets/NOIR/curl-thumb.png',
      length: '24"',
      hairOrigin: 'VIETNAMESE',
      inCart: false,
      selectedSize: 'M',
      route: '/curly/ocean-curl'
    }
  ]);

  // Gift card products state
  const [_giftCardProducts, setGiftCardProducts] = useState([
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

  // UNITS strip: 2 products per “page”; row width = pairCount×100% of viewport; snap step after windowWidth (below)
  const [unitsHomePage, setUnitsHomePage] = useState(0);
  const unitsPairCount = Math.ceil(unitsProducts.length / 2);
  const unitsHomeMaxPage = Math.max(0, unitsPairCount - 1);

  const shopTextureStripItems = React.useMemo(
    () =>
      [
        { label: 'STRAIGHT', slug: 'straight' as const },
        { label: 'WAVY', slug: 'wavy' as const },
        { label: 'CURLY', slug: 'curly' as const }
      ] as const,
    []
  );

  type HomeShopCategorySlug = 'bundles' | 'closures' | 'frontals';
  type HomeShopTextureSlug = (typeof shopTextureStripItems)[number]['slug'];

  /** Home/shop BUNDLES / CLOSURES / FRONTALS — UNITS-style red line + range; USD → `formatPriceRangeUsd` */
  const shopCategoryTextureLines: Record<
    HomeShopCategorySlug,
    Record<HomeShopTextureSlug, { redLine: string; priceMinUsd: number; priceMaxUsd: number }>
  > = {
    bundles: {
      straight: { redLine: 'RAW HUMAN HAIR', priceMinUsd: 100, priceMaxUsd: 300 },
      wavy: { redLine: 'RAW HUMAN HAIR', priceMinUsd: 120, priceMaxUsd: 400 },
      curly: { redLine: 'RAW HUMAN HAIR', priceMinUsd: 160, priceMaxUsd: 500 }
    },
    closures: {
      straight: { redLine: 'RAW HUMAN HAIR', priceMinUsd: 100, priceMaxUsd: 300 },
      wavy: { redLine: 'RAW HUMAN HAIR', priceMinUsd: 120, priceMaxUsd: 400 },
      curly: { redLine: 'RAW HUMAN HAIR', priceMinUsd: 140, priceMaxUsd: 500 }
    },
    frontals: {
      straight: { redLine: 'RAW HUMAN HAIR', priceMinUsd: 200, priceMaxUsd: 600 },
      wavy: { redLine: 'RAW HUMAN HAIR', priceMinUsd: 220, priceMaxUsd: 700 },
      curly: { redLine: 'RAW HUMAN HAIR', priceMinUsd: 240, priceMaxUsd: 800 }
    }
  };

  const shopCategoryMarbleCards = React.useMemo(
    () =>
      [
        { title: 'BUNDLES', route: '/shop/bundles', categorySlug: 'bundles' as const },
        { title: 'CLOSURES', route: '/shop/closures', categorySlug: 'closures' as const },
        { title: 'FRONTALS', route: '/shop/frontals', categorySlug: 'frontals' as const }
      ] as const,
    []
  );

  // Scroll state for gift card container
  const [giftCardScroll, setGiftCardScroll] = useState(0);
  const [isGiftCardDragging, setIsGiftCardDragging] = useState(false);

  // Menu state
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

  /** Measured width of the UNITS overflow strip — must match scroll step or pages drift vs center line / icons. */
  const unitsHomeStripViewportRef = useRef<HTMLDivElement>(null);
  const [unitsStripViewportW, setUnitsStripViewportW] = useState(() =>
    typeof window !== 'undefined' ? Math.max(200, window.innerWidth - 32) : 320
  );

  useLayoutEffect(() => {
    if (showMobileMenu) return;
    const el = unitsHomeStripViewportRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      if (w > 0) setUnitsStripViewportW(w);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [showMobileMenu, windowWidth]);

  /** One “page” = exactly one measured viewport of the strip (not windowWidth heuristic). */
  const unitsSnapStepPx = Math.max(200, unitsStripViewportW);
  const unitsScrollPx = -unitsHomePage * unitsSnapStepPx;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const formatPrice = React.useCallback(
    (price: number) => formatPriceUsd(price, selectedCurrency, currencyRates as CurrencyRatesRecord),
    [currencyRates, selectedCurrency]
  );
  const formatShopTextureRange = React.useCallback(
    (minUsd: number, maxUsd: number) =>
      formatPriceRangeUsd(minUsd, maxUsd, selectedCurrency, currencyRates as CurrencyRatesRecord),
    [currencyRates, selectedCurrency]
  );

  const handleUnitsHomeLeftArrow = () => setUnitsHomePage((p) => Math.max(0, p - 1));
  const handleUnitsHomeRightArrow = () =>
    setUnitsHomePage((p) => Math.min(unitsHomeMaxPage, p + 1));

  useEffect(() => {
    setUnitsHomePage(0);
  }, [windowWidth]);

  useEffect(() => {
    setUnitsHomePage((p) => Math.min(p, unitsHomeMaxPage));
  }, [unitsHomeMaxPage]);

  // BUNDLES / CLOSURES / FRONTALS strips: 2 textures visible, overlapping window (page 0: 0+1, page 1: 1+2)
  const textureStripCount = shopTextureStripItems.length;
  const textureCategoryMaxPage = Math.max(0, textureStripCount - 2);
  const textureCategoryRowPct = textureStripCount * 50; // e.g. 3 → 150% row, each cell 50% viewport
  const [textureCategoryPage, setTextureCategoryPage] = useState<{
    bundles: number;
    closures: number;
    frontals: number;
  }>({ bundles: 0, closures: 0, frontals: 0 });
  /** Width of one texture cell: row is calc(150% − 20px) of viewport, 3 cells → advance one page by exactly one cell (WAVY+CURLY on step 2). */
  const textureCategoryViewportRef = useRef<HTMLDivElement>(null);
  const estimateCategoryViewportW =
    typeof window !== 'undefined' ? Math.max(200, window.innerWidth - 120) : 320;
  const [textureCategoryCellStepPx, setTextureCategoryCellStepPx] = useState(
    () => (estimateCategoryViewportW * 1.5) / 3
  );
  const measureTextureCategoryStep = useCallback(() => {
    const el = textureCategoryViewportRef.current;
    if (!el) return;
    const w = el.clientWidth;
    setTextureCategoryCellStepPx((w * 1.5) / 3);
  }, []);

  useLayoutEffect(() => {
    measureTextureCategoryStep();
    const el = textureCategoryViewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => measureTextureCategoryStep());
    ro.observe(el);
    return () => ro.disconnect();
  }, [measureTextureCategoryStep, windowWidth]);

  const handleTextureCategoryLeft = (slug: 'bundles' | 'closures' | 'frontals') =>
    setTextureCategoryPage((prev) => ({
      ...prev,
      [slug]: Math.max(0, prev[slug] - 1)
    }));
  const handleTextureCategoryRight = (slug: 'bundles' | 'closures' | 'frontals') =>
    setTextureCategoryPage((prev) => ({
      ...prev,
      [slug]: Math.min(textureCategoryMaxPage, prev[slug] + 1)
    }));

  useEffect(() => {
    setTextureCategoryPage({ bundles: 0, closures: 0, frontals: 0 });
  }, [windowWidth]);

  useEffect(() => {
    setTextureCategoryPage((prev) => ({
      bundles: Math.min(prev.bundles, textureCategoryMaxPage),
      closures: Math.min(prev.closures, textureCategoryMaxPage),
      frontals: Math.min(prev.frontals, textureCategoryMaxPage)
    }));
  }, [textureCategoryMaxPage]);

  // Gift card scroll handlers
  const handleGiftCardMouseMove = () => {
    if (!isGiftCardDragging) return;
    // Drag scrolling removed - this handler is kept for compatibility but never executes
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

  const handleSizeSelect = (productId: string, size: string) => {
    setUnitsProducts(prev => {
      const updated = prev.map(p => {
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

  const handleAddToCart = (product: any, e?: MouseEvent<HTMLDivElement>) => {
    if (e) {
      e.stopPropagation();
    }

    if (!product.route) {
      // Gift card product - handle separately if needed
      setGiftCardProducts(prevProducts => 
        prevProducts.map(p => 
          p.id === product.id ? { ...p, inCart: !p.inCart } : p
        )
      );
      return;
    }

    // Units product - handle localStorage and cart updates
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
        setUnitsProducts(prevProducts => 
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
          route: product.route
        };
        
        const updatedCartItems = [cartItem, ...cartItems];
        localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
        
        // Update cart count
        const currentCount = parseInt(localStorage.getItem('cartCount') || '0');
        const newCount = currentCount + 1;
        localStorage.setItem('cartCount', newCount.toString());
        setCartCount(newCount);
        
        // Update UI state
        setUnitsProducts(prevProducts => 
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
      console.error('Error handling add to cart:', error);
    }
  };

  const handleProductClick = (product: any) => {
    if (product.route) {
      navigate(product.route);
    }
  };

  // Menu handlers
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
      // Navigate to sign-in page
      navigate(signInHrefWithReturnTo(location));
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
    // Navigate to sign-in page
    navigate(signInHrefWithReturnTo(location));
  };

  // Sync isSignedIn state with localStorage and sign-in events
  useEffect(() => {
    const handleSignInStateChange = (event: CustomEvent) => {
      setIsSignedIn(event.detail === 'true');
    };

    window.addEventListener('signInStateChanged', handleSignInStateChange as EventListener);

    return () => {
      window.removeEventListener('signInStateChanged', handleSignInStateChange as EventListener);
    };
  }, []);

  // Update mobile menu active tab based on current pathname when menu opens
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

  useEffect(() => {
    if (isGiftCardDragging) {
      window.addEventListener('mousemove', handleGiftCardMouseMove as any);
      window.addEventListener('mouseup', handleGiftCardMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleGiftCardMouseMove as any);
        window.removeEventListener('mouseup', handleGiftCardMouseUp);
      };
    }
  }, [isGiftCardDragging]);

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
              {showMobileMenu ? (
                <>
                  <button 
                    onClick={() => navigate(isSignedIn ? '/account' : signInHrefWithReturnTo(location))}
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
                    onClick={() => navigate(isSignedIn ? '/wishlist' : signInHrefWithReturnTo(location))} 
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
                onClick={() => navigate('/lobby')}
              >
                HOME &gt;
              </span>{' '}
              <span
                style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}
              >
                SHOP
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

          {/* CONTENT */}
          <div
            className="flex flex-col pb-4 mb-2 w-full"
            style={{ 
              minWidth: '100%', 
              maxWidth: 'none', 
              overflow: 'visible',
              minHeight: showMobileMenu ? 'calc(100dvh - 80px)' : 'auto'
            }}
          >
            {showMobileMenu ? (
              /* MENU CONTENT */
              <div
                className="border border-black flex flex-col pt-6 pb-4 px-5 bg-white/60 backdrop-blur-sm w-full transition-all duration-300 ease-out"
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
                      <ShopMobileMenuToolsTab
                        navigate={navigate}
                        closeMenu={() => setShowMobileMenu(false)}
                        labelTranslateX="13px"
                      />
                    ) : mobileMenuActiveTab === 'BRAND' ? (
                      <BrandMenuLinks onClose={() => setShowMobileMenu(false)} />
                    ) : (
                      // SHOP tab with dropdown functionality
                                            <ShopMobileMenuShopTab
                                              navigate={navigate}
                                              mobileMenuExpandedItems={mobileMenuExpandedItems}
                                              handleMobileMenuItemToggle={handleMobileMenuItemToggle}
                                              closeSubItemMenu={() => setShowMobileMenu(false)}
                                              labelTranslateX="13px"
                                              duplicateRowClickForStaticLinks
                                            />
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
              /* SHOP CONTENT — UNITS + BUNDLES / CLOSURES / FRONTALS (spacing matches /shop/units stacked marbles) */
          <div className="transition-all duration-300 ease-out">
          <div className="px-0 md:px-0 transition-all duration-300 ease-out" style={{ marginTop: '0', marginBottom: '20px', overflow: 'visible' }}>
            <div className="transition-all duration-300 ease-out" style={{ 
              border: '1.3px solid black', 
              backgroundColor: '#f5f5f5',
              backgroundImage: `url('/assets/marble-container.png')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              padding: '0px',
              maxWidth: '100%',
              margin: '0 auto',
              overflow: 'visible',
              position: 'relative'
            }}>
              {/* Header — match /shop/units marble header spacing */}
              <div style={{ textAlign: 'center', marginBottom: '2px' }}>
                <div style={{ width: '1px', height: '15px', backgroundColor: 'black', margin: '0 auto 2px auto' }}></div>
                <h3 
                  onClick={() => navigate('/shop/units')}
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
                    height: 'auto',
                    transform: 'translateY(-1px)'
                  }}
                >
                  UNITS
                </h3>
              </div>
              
              {/* Full-width track; arrows are siblings, positioned to marble card for vertical center */}
              <div style={{ position: 'relative', width: '100%', overflow: 'visible', boxSizing: 'border-box' }}>
                <div style={{ width: '100%', position: 'relative', overflow: 'visible', minWidth: 0, boxSizing: 'border-box' }}>
                  <div style={{
                    position: 'absolute',
                    left: '50%',
                    top: '6px',
                    bottom: '0',
                    width: '1px',
                    backgroundColor: 'black',
                    zIndex: 20,
                    transform: 'translateX(-50%)'
                  }}></div>

                  <div style={{
                    position: 'absolute',
                    left: '50%',
                    top: '6px',
                    bottom: '0',
                    width: '10px',
                    backgroundColor: 'transparent',
                    zIndex: 15,
                    transform: 'translateX(-50%)',
                    pointerEvents: 'none'
                  }}></div>

                  <div
                    ref={unitsHomeStripViewportRef}
                    style={{
                      width: '100%',
                      position: 'relative',
                      maxWidth: '100%',
                      marginTop: 0,
                      paddingTop: '10px',
                      overflow: 'visible',
                      boxSizing: 'border-box'
                    }}
                  >
                    {/* One horizontal clip for products + bag row — avoids wide bag flex painting past the marble edge */}
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
                          transform: `translateX(${unitsScrollPx}px)`,
                          transition: 'none',
                          width: unitsProducts.length >= 4 ? `${unitsPairCount * 100}%` : '100%',
                          boxSizing: 'border-box'
                        }}
                      >
                      {unitsProducts.map((product) => {
                        const flexBasis =
                          unitsProducts.length >= 4
                            ? `calc(100% / ${unitsProducts.length})`
                            : '50%';
                        return (
                        <div
                          key={product.id}
                          style={{
                            padding: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'stretch',
                            flex: `0 0 ${flexBasis}`,
                            boxSizing: 'border-box',
                            position: 'relative',
                            overflow: 'visible',
                            minWidth: 0,
                            ...dbgProductCol
                          }}
                        >
                          <div
                            style={{
                              width: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              boxSizing: 'border-box',
                              padding: '5px 12px 4px 12px',
                              transform: 'translateY(-14px)',
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
                                  width: '79.2%',
                                  height: 'auto',
                                  maxWidth: '100%',
                                  display: 'block',
                                  margin: 0,
                                  cursor: 'pointer'
                                }}
                              />
                            </div>

                            <div style={{ width: '100%', textAlign: 'center', boxSizing: 'border-box' }}>
                              <p style={{
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
                              }}>
                                {product.name}
                              </p>

                              <p style={{
                                fontFamily: '"Futura PT Medium"',
                                fontSize: '10px',
                                color: '#EB1C24',
                                textTransform: 'uppercase',
                                margin: '2px 0 5px 0',
                                fontWeight: '500',
                                lineHeight: '0.84',
                                minHeight: '12px',
                                transform: 'translateY(1px)'
                              }}>
                                {product.length} RAW {product.hairOrigin}
                              </p>

                              <p style={{
                                fontFamily: '"Futura PT Medium"',
                                fontSize: '12px',
                                color: 'black',
                                textTransform: 'uppercase',
                                margin: '0 0 5px 0',
                                fontWeight: '500',
                                lineHeight: '0.84',
                                transform: 'translateY(1px)'
                              }}
                              dangerouslySetInnerHTML={formatPrice(product.price)}
                              />

                              <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginTop: '2px', transform: 'translateY(1px)' }}>
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
                        transform: `translateX(${unitsScrollPx}px)`,
                        transition: 'none',
                        width: unitsProducts.length >= 4 ? `${unitsPairCount * 100}%` : '100%',
                        boxSizing: 'border-box'
                      }}
                    >
                      {unitsProducts.map((product, index) => {
                        const flexBasis =
                          unitsProducts.length >= 4
                            ? `calc(100% / ${unitsProducts.length})`
                            : '50%';
                        const isLeftColumn = index % 2 === 0;
                        return (
                          <div
                            key={`bag-${product.id}`}
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
                                top: '-52px',
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
                                handleAddToCart(product, e);
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
              </div>
              {unitsProducts.length >= 4 && (
                <>
                  <button
                    type="button"
                    onClick={handleUnitsHomeLeftArrow}
                    aria-label="Previous units"
                    style={{
                      position: 'absolute',
                      left: 6,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 25,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '5px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <img src="/assets/NOIR/left-facing-arrow.svg" alt="" style={{ width: '14px', height: '14px', display: 'block' }} />
                  </button>
                  <button
                    type="button"
                    onClick={handleUnitsHomeRightArrow}
                    aria-label="Next units"
                    style={{
                      position: 'absolute',
                      right: 6,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 25,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '5px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <img src="/assets/NOIR/right-facing-arrow.svg" alt="" style={{ width: '14px', height: '14px', display: 'block' }} />
                  </button>
                </>
              )}
            </div>

          {shopCategoryMarbleCards.map(({ title, route, categorySlug }, cardIdx) => (
            <div
              key={route}
              className="px-0 md:px-0 transition-all duration-300 ease-out"
              style={{ marginTop: '20px', marginBottom: '20px', overflow: 'visible' }}
            >
              <div
                className="transition-all duration-300 ease-out"
                style={{
                  border: '1.3px solid black',
                  backgroundColor: '#f5f5f5',
                  backgroundImage: `url('/assets/marble-container.png')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  padding: '0px',
                  maxWidth: '100%',
                  margin: '0 auto',
                  overflow: 'visible',
                  position: 'relative'
                }}
              >
                <div style={{ textAlign: 'center', marginBottom: '2px' }}>
                  <div style={{ width: '1px', height: '15px', backgroundColor: 'black', margin: '0 auto 2px auto' }} />
                  <h3
                    onClick={() => navigate(route)}
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
                      height: 'auto',
                      transform: 'translateY(-1px)'
                    }}
                  >
                    {title}
                  </h3>
                </div>

                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    overflow: 'visible',
                    boxSizing: 'border-box'
                  }}
                >
                  <div style={{ width: '100%', position: 'relative', overflow: 'visible', minWidth: 0, boxSizing: 'border-box' }}>
                    {textureCategoryMaxPage > 0 && (
                      <>
                        <div
                          style={{
                            position: 'absolute',
                            left: '50%',
                            top: '6px',
                            bottom: '0',
                            width: '1px',
                            backgroundColor: 'black',
                            zIndex: 20,
                            transform: 'translateX(-50%)'
                          }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            left: '50%',
                            top: '6px',
                            bottom: '0',
                            width: '10px',
                            backgroundColor: 'transparent',
                            zIndex: 15,
                            transform: 'translateX(-50%)',
                            pointerEvents: 'none'
                          }}
                        />
                      </>
                    )}

                    <div
                      ref={cardIdx === 0 && textureCategoryMaxPage > 0 ? textureCategoryViewportRef : undefined}
                      style={{
                        overflowX: 'hidden',
                        overflowY: 'visible',
                        width: '100%',
                        position: 'relative',
                        maxWidth: '100%',
                        marginTop: 0,
                        paddingTop: 0,
                        paddingBottom: '10px',
                        boxSizing: 'border-box'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'nowrap',
                          alignItems: 'stretch',
                          gap: '0',
                          transform: `translateX(${-textureCategoryPage[categorySlug] * textureCategoryCellStepPx}px)`,
                          transition: 'none',
                          width:
                            textureStripCount >= 2 && textureCategoryMaxPage > 0
                              ? `${textureCategoryRowPct}%`
                              : '100%',
                          margin: 0,
                          boxSizing: 'border-box'
                        }}
                      >
                        {shopTextureStripItems.map((t) => (
                            <div
                              key={`${route}-${t.label}`}
                              role="button"
                              tabIndex={0}
                              onClick={() => navigate(`/shop/${categorySlug}?texture=${t.slug}`)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  navigate(`/shop/${categorySlug}?texture=${t.slug}`);
                                }
                              }}
                              style={{
                                flex:
                                  textureStripCount >= 2 && textureCategoryMaxPage > 0
                                    ? `0 0 calc(100% / ${textureStripCount})`
                                    : '0 0 33.333%',
                                padding: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'stretch',
                                boxSizing: 'border-box',
                                position: 'relative',
                                overflow: 'visible',
                                cursor: 'pointer',
                                minWidth: 0,
                                ...dbgProductCol
                              }}
                            >
                              <div
                                style={{
                                  width: '100%',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  boxSizing: 'border-box',
                                  padding: '5px 12px 4px 12px',
                                  transform: 'translateY(-2px)',
                                  ...dbgProductBand
                                }}
                              >
                                <div
                                  style={{
                                    width: '100%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginBottom: '5px',
                                    transform: 'translateY(3px)'
                                  }}
                                >
                                  <img
                                    src={shopTextureCategoryThumbSrc(t.slug, categorySlug)}
                                    alt={t.label}
                                    onError={(e) => {
                                      const img = e.currentTarget;
                                      if (img.getAttribute('data-fallback-tried') === '1') return;
                                      img.setAttribute('data-fallback-tried', '1');
                                      img.src = shopTextureCategoryThumbFallbackSrc[t.slug];
                                    }}
                                    style={{
                                      width: `${49.5 * shopTextureCategoryThumbDisplayScale(t.slug)}%`,
                                      height: 'auto',
                                      maxWidth: '100%',
                                      display: 'block',
                                      margin: 0,
                                      pointerEvents: 'none',
                                      ...(isShopTextureCurlyFrontals(t.slug, categorySlug)
                                        ? { transform: 'translateY(-2px)' }
                                        : {})
                                    }}
                                  />
                                </div>
                                <div
                                  className={t.slug === 'curly' ? 'shop-bcf-curly-product-copy-lift' : undefined}
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
                                      justifyContent: 'center',
                                      pointerEvents: 'none',
                                      width: '100%',
                                      textAlign: 'center',
                                      boxSizing: 'border-box'
                                    }}
                                  >
                                    {t.label}
                                  </p>
                                  {(categorySlug === 'bundles' ||
                                    categorySlug === 'closures' ||
                                    categorySlug === 'frontals') && (
                                    <>
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
                                          transform: 'translateY(1px)',
                                          pointerEvents: 'none',
                                          width: '100%',
                                          textAlign: 'center',
                                          boxSizing: 'border-box'
                                        }}
                                      >
                                        {shopCategoryTextureLines[categorySlug][t.slug].redLine}
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
                                          transform: 'translateY(1px)',
                                          pointerEvents: 'none',
                                          width: '100%',
                                          textAlign: 'center',
                                          boxSizing: 'border-box'
                                        }}
                                        dangerouslySetInnerHTML={formatShopTextureRange(
                                          shopCategoryTextureLines[categorySlug][t.slug].priceMinUsd,
                                          shopCategoryTextureLines[categorySlug][t.slug].priceMaxUsd
                                        )}
                                      />
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {textureCategoryMaxPage > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleTextureCategoryLeft(categorySlug)}
                      aria-label="Previous textures"
                      style={{
                        position: 'absolute',
                        left: 6,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 25,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '5px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <img src="/assets/NOIR/left-facing-arrow.svg" alt="" style={{ width: '14px', height: '14px', display: 'block' }} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTextureCategoryRight(categorySlug)}
                      aria-label="Next textures"
                      style={{
                        position: 'absolute',
                        right: 6,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 25,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '5px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <img src="/assets/NOIR/right-facing-arrow.svg" alt="" style={{ width: '14px', height: '14px', display: 'block' }} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}

          </div>
          </div>
            )}
        </div>
      </div>
      </div>

      {/* Sign Out Confirmation Modal */}
      <ConfirmationModal
        isOpen={showSignOutConfirm}
        onClose={() => setShowSignOutConfirm(false)}
        onConfirm={handleSignOut}
        title="SIGN OUT?"
        message="ARE YOU SURE YOU WANT TO SIGN OUT?"
        confirmText="SIGN OUT"
        cancelText="CANCEL"
      />
    </div>
  );
}

export default ProductsPage;

