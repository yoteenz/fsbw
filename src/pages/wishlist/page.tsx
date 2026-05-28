import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DynamicCartIcon from '../../components/DynamicCartIcon';
import ConfirmationModal from '../../components/ConfirmationModal';
import AddToListModal from '../../components/AddToListModal';
import BrandMenuLinks from '../../components/BrandMenuLinks';
import SocialMenuIcons from '../../components/SocialMenuIcons';
import { isMockDataAccount, signOutAppAndSupabaseSession } from '../../utils/adminAuth';
import { getPerUserKey, getCurrentUserEmailFromStorage, PER_USER_KEYS } from '../../utils/perUserStorage';
import { trackActivity } from '../../utils/activity';
import { ShopMobileMenuShopTab } from '../../components/ShopMobileMenuShopTab';
import { ShopMobileMenuToolsTab } from '../../components/ShopMobileMenuToolsTab';
import { signInHrefWithReturnTo } from '../../utils/signInReturnTo';
import { useShopNavSearchBar } from '../../components/shop/useShopNavSearchBar';
import { WishlistItemCapSizeLine } from '../../components/wishlist/WishlistItemCapSizeLine';
import { CartLineTextLayer } from '../../components/cart/CartLineProductTextStack';
import { WishlistLineProductTextStack } from '../../components/wishlist/WishlistLineProductTextStack';
import {
  cartLineLayerInnerStyle,
  cartLineProductNameTextStyle,
  cartLineRedSubtitleTextStyle,
} from '../../utils/cartLineProductLayers';
import { normalizeCartLineProductName } from '../../utils/cartCapSizeLineMargin';
import { useProductInventorySnapshot } from '../../hooks/useProductInventorySnapshot';
import { WigLineStockPrice } from '../../components/shop/WigStockPrice';
import { attachStockStatusToLineItem, isLineItemOutOfStock } from '../../utils/productInventoryAvailability';

function WishlistSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const { NavCenter, SearchTrigger } = useShopNavSearchBar();
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [cartCount, setCartCount] = useState(() => {
    try {
      return parseInt(localStorage.getItem('cartCount') || '0', 10);
    } catch (e) {
      return 0;
    }
  });
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
  const [showEmptyWishlistConfirm, setShowEmptyWishlistConfirm] = useState(false);
  const [showRemoveItemConfirm, setShowRemoveItemConfirm] = useState(false);
  const [itemToRemoveId, setItemToRemoveId] = useState<string | null>(null);
  const [addToListModalOpen, setAddToListModalOpen] = useState(false);
  const [addToListModalItem, setAddToListModalItem] = useState<any>(null);
  useProductInventorySnapshot();

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

  // Load wishlist from localStorage; re-run when user changes so this page shows the signed-in user's wishlist
  const loadWishlist = () => {
    try {
      const stored = localStorage.getItem('wishlistItems');
      if (stored) {
        const items = JSON.parse(stored);
        if (Array.isArray(items) && items.length > 0) {
          setWishlistItems(items.map((row: any) => attachStockStatusToLineItem(row)));
          return;
        }
      }
      // Only add sample products for mock data (admin) accounts; new accounts start with empty wishlist
      let currentUser: { email?: string; role?: string } | null = null;
      try {
        const raw = localStorage.getItem('currentUser');
        if (raw) currentUser = JSON.parse(raw);
      } catch (_) {}
      if (isMockDataAccount(currentUser)) {
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
            styling: 'STRAIGHT',
            addedFrom: 'unit'
          },
          {
            id: 'wishlist-2',
            name: 'BLANCO',
            price: 780,
            quantity: 1,
            image: '/assets/NOIR/blanco-thumb.png',
            length: '24"',
            hairOrigin: 'RUSSIAN',
            capSize: 'M',
            density: '200%',
            lace: '13X6',
            texture: 'SILKY',
            color: 'PLATINUM',
            hairline: 'NATURAL',
            styling: 'STRAIGHT',
            addedFrom: 'unit'
          }
        ];
        setWishlistItems(sampleProducts);
        localStorage.setItem('wishlistItems', JSON.stringify(sampleProducts));
      } else {
        setWishlistItems([]);
      }
    } catch (e) {
      setWishlistItems([]);
    }
  };

  useEffect(() => {
    loadWishlist();
    window.addEventListener('wishlistUpdated', loadWishlist);
    window.addEventListener('userListsUpdated', loadWishlist);
    window.addEventListener('signInStateChanged', loadWishlist);
    window.addEventListener('storage', loadWishlist);
    window.addEventListener('focus', loadWishlist);
    return () => {
      window.removeEventListener('wishlistUpdated', loadWishlist);
      window.removeEventListener('userListsUpdated', loadWishlist);
      window.removeEventListener('signInStateChanged', loadWishlist);
      window.removeEventListener('storage', loadWishlist);
      window.removeEventListener('focus', loadWishlist);
    };
  }, []);

  // Load selected currency from localStorage on mount only (per-user key)
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
      const currency = currencyRates[selectedCurrency as keyof typeof currencyRates] || currencyRates.USD;
      return { __html: currency.symbol + '0 ' + selectedCurrency };
    }
    const currency = currencyRates[selectedCurrency as keyof typeof currencyRates] || currencyRates.USD;
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
      if (delta === -1) {
        const item = wishlistItems.find(i => i.id === itemId);
        const currentQty = item ? (item.quantity || 1) : 1;
        if (currentQty <= 1) {
          setItemToRemoveId(itemId);
          setShowRemoveItemConfirm(true);
          return;
        }
      }
      const newItems = wishlistItems.map(i => {
        if (i.id === itemId) {
          const newQty = Math.max(1, Math.min(10, (i.quantity || 1) + delta));
          return { ...i, quantity: newQty };
        }
        return i;
      });
      setWishlistItems(newItems);
      localStorage.setItem('wishlistItems', JSON.stringify(newItems));
      window.dispatchEvent(new CustomEvent('wishlistUpdated'));
    } catch (e) {
      console.error('Error updating quantity:', e);
    }
  };

  const handleConfirmRemoveItemFromWishlist = () => {
    if (!itemToRemoveId) return;
    const removed = wishlistItems.find((i) => i.id === itemToRemoveId);
    const newItems = wishlistItems.filter(i => i.id !== itemToRemoveId);
    setWishlistItems(newItems);
    localStorage.setItem('wishlistItems', JSON.stringify(newItems));
    window.dispatchEvent(new CustomEvent('wishlistUpdated'));
    const pname = (removed?.name || removed?.productName || '').toString();
    trackActivity('remove_from_wishlist', { productName: pname || undefined });
    setItemToRemoveId(null);
    setShowRemoveItemConfirm(false);
  };

  const handleAddToBag = (item: any) => {
    if (isLineItemOutOfStock(item)) return;
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
        updatedItems = [attachStockStatusToLineItem({ ...item, quantity: item.quantity || 1 }), ...cartItems];
      }
      localStorage.setItem('cartItems', JSON.stringify(updatedItems));
      const newCount = updatedItems.reduce((sum: number, ci: any) => sum + (ci.quantity || 1), 0);
      localStorage.setItem('cartCount', newCount.toString());
      setCartCount(newCount);
      window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: newCount }));
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      const pname = (item?.name || item?.productName || '').toString();
      trackActivity('add_to_cart', { source: 'wishlist', productName: pname || undefined });
    } catch (e) {
      console.error('Error adding to bag:', e);
    }
  };

  const handleRemoveFromBag = (item: any) => {
    try {
      const pname = (item?.name || item?.productName || '').toString().trim();
      const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      const updatedItems = cartItems.filter((ci: any) => ci.id !== item.id);
      localStorage.setItem('cartItems', JSON.stringify(updatedItems));
      const newCount = updatedItems.reduce((sum: number, ci: any) => sum + (ci.quantity || 1), 0);
      localStorage.setItem('cartCount', newCount.toString());
      setCartCount(newCount);
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      trackActivity('remove_from_cart', { source: 'wishlist_page', change: 'removed_line', productName: pname || undefined });
    } catch (e) {
      console.error('Error removing from bag:', e);
    }
  };

  /** Route to product/unit page for viewing (not edit). */
  const getProductRoute = (name: string): string => {
    const n = (name || 'NOIR').toString().toUpperCase();
    const routes: Record<string, string> = {
      NOIR: '/straight/noir',
      BLANCO: '/straight/blanco',
      'SOFT WAVE': '/wavy/soft-wave',
      'BEACH WAVE': '/wavy/beach-wave',
      'SOFT CURL': '/curly/soft-curl',
      'OCEAN CURL': '/curly/ocean-curl',
      'GIFT CARD': '/tools/gift-card'
    };
    return routes[n] || '/build-a-wig';
  };

  const handleEdit = (item: any) => {
    try {
      const name = (item.name || item.productName || 'NOIR').toString().toUpperCase();
      const fromUnit = item.addedFrom === 'unit';

      if (fromUnit) {
        // Added from product/unit page: go to unit page (default or unit cap selections)
        const unitRoutes: Record<string, string> = {
          NOIR: '/straight/noir',
          BLANCO: '/straight/blanco',
          'SOFT WAVE': '/wavy/soft-wave',
          'BEACH WAVE': '/wavy/beach-wave',
          'SOFT CURL': '/curly/soft-curl',
          'OCEAN CURL': '/curly/ocean-curl'
        };
        const route = unitRoutes[name] || '/build-a-wig/edit';
        navigate(route);
        return;
      }

      // Added from cart/bag or editing from wishlist: go to build-a-wig edit with item
      localStorage.setItem('editingCartItem', JSON.stringify(item));
      localStorage.setItem('editingCartItemId', String(item.id ?? ''));
      localStorage.setItem('editingSource', 'wishlist'); // so build-a-wig save updates wishlist, not cart
      let editRoute = '/build-a-wig/edit';
      if (name === 'NOIR') editRoute = '/build-a-wig/noir/edit';
      else if (name === 'BLANCO') editRoute = '/build-a-wig/blanco/edit';
      else if (name === 'SOFT WAVE') editRoute = '/build-a-wig/soft-wave/edit';
      else if (name === 'SOFT CURL') editRoute = '/build-a-wig/soft-curl/edit';
      else if (name === 'BEACH WAVE') editRoute = '/build-a-wig/beach-wave/edit';
      else if (name === 'OCEAN CURL') editRoute = '/build-a-wig/ocean-curl/edit';
      navigate(editRoute);
    } catch (e) {
      console.error('Error setting edit item:', e);
    }
  };

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
      navigate(signInHrefWithReturnTo(location));
    }
  };

  const handleSignOut = async () => {
    setIsSignedIn(false);
    await signOutAppAndSupabaseSession();
    setShowSignOutConfirm(false);
    setShowMobileMenu(false);
  };

  const handleEmptyWishlist = () => {
    setWishlistItems([]);
    localStorage.setItem('wishlistItems', JSON.stringify([]));
    setShowEmptyWishlistConfirm(false);
  };

  return (
    <div className="min-h-screen" style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Marble Background */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url('/assets/marble-half.png')`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat',
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
              {showMobileMenu ? (
                <>
                  <button 
                    onClick={() => navigate(isSignedIn ? '/account' : signInHrefWithReturnTo(location))}
                    className="cursor-pointer" 
                    style={{ height: '21px', width: '21px', padding: 0, border: 'none', background: 'none', transform: 'translateX(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <img
                      alt="Account icon"
                      width={16}
                      height={16}
                      src="/assets/NOIR/account-icon.svg"
                      style={{ display: 'block' }}
                    />
                  </button>
                  <button 
                    onClick={() => navigate(isSignedIn ? '/wishlist' : signInHrefWithReturnTo(location))} 
                    className="cursor-pointer"
                    style={{ height: '21px', width: '21px', padding: 0, border: 'none', background: 'none', transform: 'translateX(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <img
                      alt="Wishlist"
                      width={18}
                      height={18}
                      src="/assets/wishlist-heart.svg"
                      style={{ display: 'block' }}
                    />
                  </button>
                </>
              ) : (
                <>
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
                  <SearchTrigger className="cursor-pointer" style={{ transform: 'translateX(-2px)' }}>
                <img
                  alt=""
                      width="16"
                      height="15"
                      src="/assets/search-icon.svg"
                    />
                  </SearchTrigger>
                </>
              )}
            </div>

            {/* Text in the middle */}
            <NavCenter showMobileMenu={showMobileMenu}>
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
                    onClick={() => navigate(isSignedIn ? '/account' : signInHrefWithReturnTo(location))}
                  >
                    ACCOUNT &gt;
                  </span>{' '}
                  <span
                    style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}
                  >
                    WISHLIST
                  </span>
                </>
              )}
            </p>
            </NavCenter>

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

          {/* MAIN BUILD AREA - only apply menu-toggle-card when menu is open so main card height is not forced when showing wishlist; p-4 when wishlist to match Shopping Bag header topspacing */}
          <div
            className={showMobileMenu ? 'menu-toggle-card border border-black flex flex-col pt-6 pb-4 px-5 mb-2 bg-white/60 backdrop-blur-sm transition-all duration-300 ease-out' : 'border border-black flex flex-col p-4 mb-2 bg-white/60 backdrop-blur-sm transition-all duration-300 ease-out'}
            style={{ 
              borderWidth: '1.3px', 
              minWidth: '100%', 
              maxWidth: 'none', 
              overflow: showMobileMenu ? 'visible' : 'hidden',
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              ...(showMobileMenu
                ? {
                    minHeight: 'calc(100dvh - 80px)',
                    height: 'calc(100dvh - 80px)',
                  }
                : {
                    height: 'calc(100vh - 270px)',
                    minHeight: 'calc(100vh - 270px)',
                    maxHeight: 'calc(100vh - 270px)',
                  }),
            }}
          >
            {showMobileMenu ? (
              /* MENU CONTENT */
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
            ) : (
              /* WISHLIST HEADER + PRODUCT CARDS */
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0, flex: 1, minHeight: 0, overflow: 'hidden' }}>
                {/* Wishlist header - same styling as Shopping Bag header */}
                <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ flexShrink: 0 }}>
                  <span
                    className="text-red-500 font-bold text-lg tracking-wider truncate text-left uppercase"
                    style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '12px', fontWeight: '500' }}
                  >
                    WISHLIST
                  </span>
                  <span
                    className="text-black font-bold text-lg flex-shrink-0 ml-2 uppercase"
                    style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', fontSize: '17px' }}
                  >
                    {wishlistItems.length}
                  </span>
                </div>

                {/* Stock status line - same top spacing as cart dropdown "you're earning" (when items exist) */}
                {wishlistItems.length > 0 && (() => {
                  const outOfStockCount = wishlistItems.filter((i: any) => isLineItemOutOfStock(i)).length;
                  const lowStockCount = wishlistItems.filter(
                    (i: any) => !isLineItemOutOfStock(i) && (i.stockStatus || 'in_stock') === 'low_stock'
                  ).length;
                  const allInStock = outOfStockCount === 0 && lowStockCount === 0;
                  if (allInStock) {
                    return (
                      <p className="text-center w-full flex-shrink-0" style={{ marginTop: '10px', marginBottom: '6px', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>
                        ALL OF YOUR WISHLIST ITEMS ARE IN STOCK!
                      </p>
                    );
                  }
                  if (outOfStockCount > 0) {
                    const n = outOfStockCount;
                    const isOne = n === 1;
                    return (
                      <p className="text-center w-full flex-shrink-0" style={{ marginTop: '10px', marginBottom: '6px', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>
                        <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' }}>{n}</span>
                        {isOne ? ' ITEM ON YOUR WISHLIST IS OUT OF STOCK.' : ' ITEMS ON YOUR WISHLIST ARE OUT OF STOCK.'}
                      </p>
                    );
                  }
                  const n = lowStockCount;
                  const isOne = n === 1;
                  return (
                    <p className="text-center w-full flex-shrink-0" style={{ marginTop: '10px', marginBottom: '6px', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>
                      <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' }}>{n}</span>
                      {isOne ? ' ITEM ON YOUR WISHLIST IS LOW IN STOCK.' : ' ITEMS ON YOUR WISHLIST ARE LOW IN STOCK.'}
                    </p>
                  );
                })()}

                {/* WISHLIST PRODUCT CARDS - scrollable */}
                <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0, paddingTop: '4.8px' }}>
                {wishlistItems.length === 0 ? (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 20px', color: '#000' }}>
                    <p
                      style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '11px', color: '#808080', textTransform: 'uppercase', margin: '0' }}
                      dangerouslySetInnerHTML={{ __html: "YOUR WISHLIST IS EMPTY.<br>LET'S GO WINDOW SHOPPING!" }}
                    />
                  </div>
                ) : (
                  (() => {
                    const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
                    return wishlistItems.map((item, index) => {
                  const isInBag = cartItems.some((ci: any) => ci.id === item.id);
                  const itemId = item.id || `wishlist-item-${index}`;
                  const itemName = (item.name || item.productName || 'NOIR').toString().toUpperCase();

                  // Thumbnail by product name only (ignore item.image so wrong stored paths never override)
                  const getItemImage = () => {
                    if (itemName === 'GIFT CARD' || item.type === 'gift-card') {
                      return '/assets/gift-card asset.png';
                    }
                    const hairline = (item.hairline || 'NATURAL').toUpperCase();
                    const hasPeak = hairline.includes('PEAK');
                    const hasLagos = hairline.includes('LAGOS');
                    if (itemName === 'NOIR') {
                      if (hasPeak) return '/assets/noir-peak-thumb.png';
                      if (hasLagos) return '/assets/noir-lagos-thumb.png';
                      return '/assets/NOIR/noir-thumb.png';
                    }
                    if (itemName === 'BLANCO') return '/assets/NOIR/blanco-thumb.png';
                    if (itemName === 'SOFT WAVE') return '/assets/NOIR/wave-thumb.png';
                    if (itemName === 'BEACH WAVE') return '/assets/NOIR/wave-thumb.png';
                    if (itemName === 'SOFT CURL' || itemName === 'OCEAN CURL') return '/assets/NOIR/curl-thumb.png';
                    return '/assets/NOIR/noir-thumb.png';
                  };
                  const itemImage = getItemImage();

                  // Hair origin: use stored value from product page, else product default (matches product page defaults)
                  const getHairOrigin = (productName: string) => {
                    switch (productName) {
                      case 'NOIR': return 'CAMBODIAN';
                      case 'BLANCO': return 'RUSSIAN';
                      case 'SOFT WAVE': return 'INDIAN';
                      case 'BEACH WAVE': return 'INDONESIAN';
                      case 'SOFT CURL': return 'VIETNAMESE';
                      case 'OCEAN CURL': return 'FILIPINO';
                      default: return 'CAMBODIAN';
                    }
                  };
                  const itemLength = item.length || '24"';
                  // BLANCO must show RUSSIAN; never show NOIR's default (CAMBODIAN) for BLANCO
                  const itemHairOrigin = (itemName === 'BLANCO' && item.hairOrigin === 'CAMBODIAN') ? getHairOrigin('BLANCO') : (item.hairOrigin || getHairOrigin(itemName));
                  const getDefaultPrice = (productName: string) => {
                    switch (productName) {
                      case 'NOIR': return 740;
                      case 'BLANCO': return 820;
                      case 'SOFT WAVE': return 760;
                      case 'BEACH WAVE': return 780;
                      case 'SOFT CURL': return 780;
                      case 'OCEAN CURL': return 780;
                      case 'GIFT CARD': return 100;
                      default: return 580;
                    }
                  };
                  const itemPrice = item.price ?? getDefaultPrice(itemName);
                  const itemQuantity = item.quantity || 1;

                  return (
                    <div
                      key={itemId}
                      className="bg-white border border-gray-200 p-2 mb-2 w-full"
                      style={{ boxSizing: 'border-box' }}
                    >
                      <div
                        className="flex items-center justify-start space-x-3"
                        style={{
                          height: '130px',
                          paddingTop: '0',
                          paddingBottom: '0',
                          width: '100%',
                          flexShrink: 0
                        }}
                      >
                      {/* Thumbnail - matching cart: image (click -> product page) then EDIT IN BUILD-A-WIG below */}
                      <div className="flex flex-col items-center justify-center" style={{ flexShrink: 0, width: '88px', height: '100%' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: 'translateY(-4px)' }}>
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => navigate(getProductRoute(itemName))}
                            onKeyDown={(e) => { if (e.key === 'Enter') navigate(getProductRoute(itemName)); }}
                            className="flex items-center justify-center cursor-pointer"
                            style={{ width: '88px', height: '88px', margin: '0' }}
                          >
                            <img
                              src={itemImage}
                              alt={itemName}
                              className="object-cover rounded"
                              style={{ width: '88px', height: '88px' }}
                            />
                          </div>
                          {(itemName.toLowerCase().includes('noir') || itemName.toLowerCase().includes('blanco') || itemName.toLowerCase().includes('soft wave')) && (
                            <p
                              className="font-bold text-center cursor-pointer hover:opacity-80 transition-opacity"
                              style={{
                                fontFamily: '"Futura PT Book"',
                                color: '#EB1C24',
                                textTransform: 'uppercase',
                                fontSize: '8px',
                                marginTop: '4px',
                                marginBottom: '0',
                                lineHeight: '1.1'
                              }}
                              onClick={() => handleEdit(item)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => { if (e.key === 'Enter') handleEdit(item); }}
                            >
                              EDIT IN BUILD-A-WIG
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Item Details - matching cart */}
                      <div className="flex-1 min-w-0 flex flex-col relative justify-center" style={{ marginLeft: '18px', height: '100%' }}>
                        <WishlistLineProductTextStack>
                          <CartLineTextLayer slot="name">
                          <p
                            className="font-medium truncate"
                            style={cartLineProductNameTextStyle(normalizeCartLineProductName(item))}
                          >
                            {itemName.replace(/WIG/gi, '').trim()}
                          </p>
                          </CartLineTextLayer>
                          <CartLineTextLayer slot="subtitle" productName={normalizeCartLineProductName(item)}>
                          <p className="font-bold" style={cartLineRedSubtitleTextStyle()}>
                            {itemLength} RAW {itemHairOrigin}
                          </p>
                          </CartLineTextLayer>
                          <WishlistItemCapSizeLine item={item} />
                          <CartLineTextLayer slot="price">
                          <WigLineStockPrice
                            item={item}
                            priceHtml={formatPrice(itemPrice)}
                            priceStyle={{
                              ...cartLineLayerInnerStyle(),
                              fontFamily: '"Futura PT Book"',
                              color: '#000000',
                              fontSize: '12px',
                              fontWeight: '600',
                            }}
                          />
                          </CartLineTextLayer>
                        </WishlistLineProductTextStack>

                        {/* + LIST, counter, ADD TO BAG - right side like cart (+ LIST / counter / SAVE FOR LATER) */}
                        <div className="flex flex-col items-center justify-center absolute" style={{ right: '8px', top: '0', bottom: '0', marginLeft: 'auto' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setAddToListModalItem(item);
                              setAddToListModalOpen(true);
                            }}
                            style={{
                              fontFamily: '"Futura PT Medium"',
                              fontSize: '9px',
                              color: '#EB1C24',
                              textTransform: 'uppercase',
                              marginBottom: '6px',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: 0
                            }}
                          >
                            + LIST
                          </button>
                          <div className="flex items-center">
                            <button
                              onClick={() => handleQuantityChange(itemId, -1)}
                              className="px-2 py-0.5 text-red-500 bg-white hover:bg-gray-50 quantity-minus-btn flex items-center justify-center cursor-pointer"
                              style={{
                                borderTop: '1.3px solid black !important',
                                borderLeft: '1.3px solid black !important',
                                borderBottom: '1.3px solid black !important',
                                borderRight: 'none !important',
                                height: '20.25px',
                                minHeight: '20.25px',
                                maxHeight: '20.25px',
                                boxSizing: 'border-box',
                                outline: 'none',
                                border: 'none !important',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              type="button"
                            >
                              <span style={{ fontFamily: 'Cascadia Code, monospace', fontSize: '8.25px' }}>-</span>
                            </button>
                            <div
                              className="px-3 py-0.5 text-black bg-white flex items-center justify-center relative quantity-number"
                              style={{
                                borderTop: '1.3px solid black !important',
                                borderBottom: '1.3px solid black !important',
                                borderLeft: 'none !important',
                                borderRight: 'none !important',
                                fontFamily: '"Futura PT Medium"',
                                fontWeight: '500',
                                fontSize: '9px',
                                height: '20.25px',
                                minHeight: '20.25px',
                                maxHeight: '20.25px',
                                boxSizing: 'border-box',
                                border: 'none !important'
                              }}
                            >
                              <div className="absolute left-0 top-0 bottom-0 w-px bg-black"></div>
                              <div className="absolute right-0 top-0 bottom-0 w-px bg-black"></div>
                              {itemQuantity}
                            </div>
                            <button
                              onClick={() => handleQuantityChange(itemId, 1)}
                              disabled={itemQuantity >= 10}
                              className={`px-2 py-0.5 text-red-500 bg-white hover:bg-gray-50 quantity-plus-btn flex items-center justify-center ${itemQuantity >= 10 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                              style={{
                                borderTop: '1.3px solid black !important',
                                borderRight: '1.3px solid black !important',
                                borderBottom: '1.3px solid black !important',
                                borderLeft: 'none !important',
                                height: '20.25px',
                                minHeight: '20.25px',
                                maxHeight: '20.25px',
                                boxSizing: 'border-box',
                                outline: 'none',
                                border: 'none !important',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              type="button"
                            >
                              <span style={{ fontFamily: 'Cascadia Code, monospace', fontSize: '8.25px' }}>+</span>
                            </button>
                          </div>
                          {isInBag ? (
                            <button
                              type="button"
                              onClick={() => handleRemoveFromBag(item)}
                              className="flex items-center justify-center gap-1"
                              style={{
                                fontFamily: '"Futura PT Demi"',
                                fontSize: '9px',
                                color: '#808080',
                                textTransform: 'uppercase',
                                marginTop: '6px',
                                textAlign: 'center',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 0
                              }}
                            >
                              <img src="/assets/check.svg" alt="Check" width="9" height="9" />
                              <span>IN THE BAG</span>
                            </button>
                          ) : isLineItemOutOfStock(item) ? (
                            <span
                              style={{
                                fontFamily: '"Futura PT Demi"',
                                fontSize: '9px',
                                color: '#EB1C24',
                                textTransform: 'uppercase',
                                marginTop: '6px',
                                textAlign: 'center'
                              }}
                            >
                              OUT OF STOCK
                            </span>
                          ) : (
                            <button
                              onClick={() => handleAddToBag(item)}
                              style={{
                                fontFamily: '"Futura PT Demi"',
                                fontSize: '9px',
                                color: '#808080',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '0',
                                textTransform: 'uppercase',
                                marginTop: '6px',
                                textAlign: 'center'
                              }}
                              type="button"
                            >
                              ADD TO BAG
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    </div>
                  );
                  });
                  })()
                )}
                </div>
              </div>
            )}
          </div>

          {/* PAGE ACTIONS: below card only — do not put inside the card (see src/layouts/PAGE_LAYOUT.md) */}
          {!showMobileMenu && (
            <>
              <div className="px-0 md:px-0" style={{ marginTop: '2px' }}>
                <button
                  onClick={() => navigate('/wishlist/lists')}
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
                  onClick={() => setShowEmptyWishlistConfirm(true)}
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
            </>
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

      {/* Empty Wishlist Confirmation Modal */}
      <ConfirmationModal
        isOpen={showEmptyWishlistConfirm}
        onClose={() => setShowEmptyWishlistConfirm(false)}
        onConfirm={handleEmptyWishlist}
        title="EMPTY WISHLIST"
        message="ARE YOU SURE YOU WANT TO EMPTY YOUR WISHLIST?"
        confirmText="CONFIRM"
        cancelText="CANCEL"
        dataAttribute="empty-wishlist-confirm"
      />

      {/* Remove item from wishlist (quantity minus to 0) */}
      <ConfirmationModal
        isOpen={showRemoveItemConfirm}
        onClose={() => { setShowRemoveItemConfirm(false); setItemToRemoveId(null); }}
        onConfirm={handleConfirmRemoveItemFromWishlist}
        title="REMOVE FROM WISHLIST"
        message="REMOVE THIS ITEM FROM YOUR WISHLIST?"
        confirmText="REMOVE"
        cancelText="CANCEL"
        dataAttribute="remove-item-wishlist-confirm"
      />

      {/* Add to List modal - + LIST popup */}
      <AddToListModal
        isOpen={addToListModalOpen}
        onClose={() => {
          setAddToListModalOpen(false);
          setAddToListModalItem(null);
        }}
        item={addToListModalItem}
      />
    </div>
  );
}

export default WishlistSelection;
