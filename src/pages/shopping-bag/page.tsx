import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DynamicCartIcon from '../../components/DynamicCartIcon';
import ConfirmationModal from '../../components/ConfirmationModal';
import AddToListModal from '../../components/AddToListModal';
import BrandMenuLinks from '../../components/BrandMenuLinks';
import SocialMenuIcons from '../../components/SocialMenuIcons';
import { getPerUserKey, getCurrentUserEmailFromStorage, PER_USER_KEYS } from '../../utils/perUserStorage';
import { getPointsMultiplier } from '../../constants/tiers';
import { getEffectiveTierName, getEffectiveSubscriptionTier, clearAppAuth } from '../../utils/adminAuth';

function ShoppingBagPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [savedForLater, setSavedForLater] = useState<any[]>([]);
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
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showEmptyBagConfirm, setShowEmptyBagConfirm] = useState(false);
  const [deleteItemConfirm, setDeleteItemConfirm] = useState<{ itemId: string; type: 'cart' | 'saved'; previousQuantity?: number } | null>(null);
  const deleteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [addToListModalOpen, setAddToListModalOpen] = useState(false);
  const [addToListModalItem, setAddToListModalItem] = useState<any>(null);

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

  // Listen for cart count changes and reload items
  useEffect(() => {
    const handleCartCountUpdate = (event: CustomEvent) => {
      setCartCount(event.detail);
      loadCartItems();
      loadSavedForLater();
    };

    const handleStorageChange = () => {
      try {
        const newCartCount = parseInt(localStorage.getItem('cartCount') || '0', 10);
        setCartCount(newCartCount);
        loadCartItems();
        loadSavedForLater();
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

  const loadCartItems = () => {
    try {
      const stored = localStorage.getItem('cartItems');
      if (stored) {
        const items = JSON.parse(stored);
        if (Array.isArray(items)) {
          const clamped = items.map((i: any) =>
            i.isSpecialOffer && (i.quantity ?? 1) > 2 ? { ...i, quantity: 2 } : i
          );
          const cartChanged = items.some((i: any, idx: number) => (i.quantity ?? 1) !== (clamped[idx].quantity ?? 1));
          if (cartChanged) {
            localStorage.setItem('cartItems', JSON.stringify(clamped));
            const newCount = clamped.reduce((sum: number, ci: any) => sum + (ci.quantity || 1), 0);
            localStorage.setItem('cartCount', String(newCount));
            window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: newCount }));
          }
          setCartItems(clamped);
        }
      }
    } catch (e) {
      console.error('Error loading cart items:', e);
      setCartItems([]);
    }
  };

  const loadSavedForLater = () => {
    try {
      const stored = localStorage.getItem('savedForLater');
      if (stored) {
        const items = JSON.parse(stored);
        if (Array.isArray(items)) {
          const clamped = items.map((i: any) =>
            i.isSpecialOffer && (i.quantity ?? 1) > 2 ? { ...i, quantity: 2 } : i
          );
          const savedChanged = items.some((i: any, idx: number) => (i.quantity ?? 1) !== (clamped[idx].quantity ?? 1));
          if (savedChanged) {
            localStorage.setItem('savedForLater', JSON.stringify(clamped));
          }
          setSavedForLater(clamped);
        }
      }
    } catch (e) {
      console.error('Error loading saved for later:', e);
      setSavedForLater([]);
    }
  };

  useEffect(() => {
    loadCartItems();
    loadSavedForLater();
  }, []);

  // When user lands on or returns to /bag, always refresh from localStorage so edits from build-a-wig are shown
  useEffect(() => {
    if (location.pathname === '/bag') {
      loadSavedForLater();
      loadCartItems();
    }
  }, [location.pathname]);

  // Sync cart items and saved items when localStorage changes (for real-time updates)
  useEffect(() => {
    const handleCartItemsChange = () => {
      loadCartItems();
    };

    const handleSavedItemsChange = () => {
      loadSavedForLater();
    };

    // Listen for custom events
    window.addEventListener('cartItemsChanged', handleCartItemsChange);
    window.addEventListener('savedItemsChanged', handleSavedItemsChange);

    return () => {
      window.removeEventListener('cartItemsChanged', handleCartItemsChange);
      window.removeEventListener('savedItemsChanged', handleSavedItemsChange);
    };
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

  // Points-eligible amount (exclude gift cards and digital) for loyalty line
  const pointsEligibleAmount = cartItems.reduce((sum, item) => {
    const isGiftCard = item.name === 'GIFT CARD' || item.type === 'gift-card';
    const isDigital = item.type === 'digital';
    if (isGiftCard || isDigital) return sum;
    return sum + (item.price || 0) * (item.quantity || 1);
  }, 0);

  const getPointsMultiplierForUser = (): number => {
    if (!isSignedIn) return 1;
    try {
      const currentUser = localStorage.getItem('currentUser');
      if (!currentUser) return 1;
      const user = JSON.parse(currentUser);
      const tier = getEffectiveTierName(user) || (user.currentTierName || user.tier || (user.email ? localStorage.getItem(`lastKnownTier_${(user.email || '').trim().toLowerCase()}`) : null) || '').toString().toUpperCase() || null;
      const subscriptionTier = (() => {
        try {
          const u = JSON.parse(localStorage.getItem('currentUser') || '{}');
          return getEffectiveSubscriptionTier(u);
        } catch (_) { return null; }
      })();
      const { multiplier } = getPointsMultiplier(tier, subscriptionTier);
      return multiplier;
    } catch (_) {
      return 1;
    }
  };

  const handleQuantityChange = (itemId: string, delta: number) => {
    try {
      const currentItem = cartItems.find(i => i.id === itemId);
      if (!currentItem) return;
      const maxQty = currentItem.isSpecialOffer ? 2 : 10;
      const currentQty = currentItem.quantity ?? 0;
      const newQty = currentQty + delta;
      
      // If trying to go below 0, show confirmation to delete immediately
      if (newQty < 0) {
        // Clear any existing timeout
        if (deleteTimeoutRef.current) {
          clearTimeout(deleteTimeoutRef.current);
          deleteTimeoutRef.current = null;
        }
        setDeleteItemConfirm({ itemId, type: 'cart' });
        return;
      }
      
      const newItems = cartItems.map(i => {
        if (i.id === itemId) {
          return { ...i, quantity: Math.max(0, Math.min(maxQty, newQty)) };
        }
        return i;
      });
      setCartItems(newItems);
      localStorage.setItem('cartItems', JSON.stringify(newItems));
      window.dispatchEvent(new CustomEvent('cartItemsChanged'));
      
      // Update cart count (treat 0 as 0, not 1)
      const newCount = newItems.reduce((sum: number, ci: any) => sum + (ci.quantity || 0), 0);
      localStorage.setItem('cartCount', newCount.toString());
      setCartCount(newCount);
      window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: newCount }));
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      // If quantity becomes 0, set timeout to show popup after 400ms
      if (newQty === 0) {
        // Clear any existing timeout
        if (deleteTimeoutRef.current) {
          clearTimeout(deleteTimeoutRef.current);
        }
        deleteTimeoutRef.current = setTimeout(() => {
          setDeleteItemConfirm({ itemId, type: 'cart', previousQuantity: currentQty });
          deleteTimeoutRef.current = null;
        }, 400);
      } else {
        // If quantity is not 0, clear any pending timeout
        if (deleteTimeoutRef.current) {
          clearTimeout(deleteTimeoutRef.current);
          deleteTimeoutRef.current = null;
        }
      }
    } catch (e) {
      console.error('Error updating quantity:', e);
    }
  };

  const confirmDeleteItem = () => {
    if (!deleteItemConfirm) return;
    
    // Clear any pending timeout
    if (deleteTimeoutRef.current) {
      clearTimeout(deleteTimeoutRef.current);
      deleteTimeoutRef.current = null;
    }
    
    if (deleteItemConfirm.type === 'cart') {
      handleRemoveItem(deleteItemConfirm.itemId);
    } else {
      handleRemoveFromSaved(deleteItemConfirm.itemId);
    }
    
    setDeleteItemConfirm(null);
  };

  const handleRemoveItem = (itemId: string) => {
    try {
      const newItems = cartItems.filter(i => i.id !== itemId);
      setCartItems(newItems);
      localStorage.setItem('cartItems', JSON.stringify(newItems));
      window.dispatchEvent(new CustomEvent('cartItemsChanged'));
      
      // Update cart count
      const newCount = newItems.reduce((sum: number, ci: any) => sum + (ci.quantity || 1), 0);
      localStorage.setItem('cartCount', newCount.toString());
      setCartCount(newCount);
      window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: newCount }));
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (e) {
      console.error('Error removing item:', e);
    }
  };

  const handleSaveForLater = (item: any) => {
    try {
      // Remove from cart
      const newCartItems = cartItems.filter(i => i.id !== item.id);
      setCartItems(newCartItems);
      localStorage.setItem('cartItems', JSON.stringify(newCartItems));
      window.dispatchEvent(new CustomEvent('cartItemsChanged'));
      
      // Add to saved for later
      const newSavedForLater = [item, ...savedForLater];
      setSavedForLater(newSavedForLater);
      localStorage.setItem('savedForLater', JSON.stringify(newSavedForLater));
      window.dispatchEvent(new CustomEvent('savedItemsChanged'));
      
      // Update cart count
      const newCount = newCartItems.reduce((sum: number, ci: any) => sum + (ci.quantity || 1), 0);
      localStorage.setItem('cartCount', newCount.toString());
      setCartCount(newCount);
      window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: newCount }));
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (e) {
      console.error('Error saving for later:', e);
    }
  };

  const handleMoveToCart = (item: any) => {
    try {
      // Remove from saved for later
      const newSavedForLater = savedForLater.filter(i => i.id !== item.id);
      setSavedForLater(newSavedForLater);
      localStorage.setItem('savedForLater', JSON.stringify(newSavedForLater));
      window.dispatchEvent(new CustomEvent('savedItemsChanged'));
      
      // Add to cart
      const newCartItems = [item, ...cartItems];
      setCartItems(newCartItems);
      localStorage.setItem('cartItems', JSON.stringify(newCartItems));
      window.dispatchEvent(new CustomEvent('cartItemsChanged'));
      
      // Update cart count
      const newCount = newCartItems.reduce((sum: number, ci: any) => sum + (ci.quantity || 1), 0);
      localStorage.setItem('cartCount', newCount.toString());
      setCartCount(newCount);
      window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: newCount }));
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (e) {
      console.error('Error moving to cart:', e);
    }
  };

  const handleRemoveFromSaved = (itemId: string) => {
    try {
      const newSavedForLater = savedForLater.filter(i => i.id !== itemId);
      setSavedForLater(newSavedForLater);
      localStorage.setItem('savedForLater', JSON.stringify(newSavedForLater));
      window.dispatchEvent(new CustomEvent('savedItemsChanged'));
    } catch (e) {
      console.error('Error removing from saved:', e);
    }
  };

  const handleSavedQuantityChange = (itemId: string, delta: number) => {
    try {
      const currentItem = savedForLater.find(i => i.id === itemId);
      if (!currentItem) return;
      const maxQty = currentItem.isSpecialOffer ? 2 : 10;
      const currentQty = currentItem.quantity ?? 0;
      const newQty = currentQty + delta;
      
      // If trying to go below 0, show confirmation to delete immediately
      if (newQty < 0) {
        // Clear any existing timeout
        if (deleteTimeoutRef.current) {
          clearTimeout(deleteTimeoutRef.current);
          deleteTimeoutRef.current = null;
        }
        setDeleteItemConfirm({ itemId, type: 'saved', previousQuantity: currentQty });
        return;
      }
      
      const newSavedForLater = savedForLater.map(i => {
        if (i.id === itemId) {
          return { ...i, quantity: Math.max(0, Math.min(maxQty, newQty)) };
        }
        return i;
      });
      setSavedForLater(newSavedForLater);
      localStorage.setItem('savedForLater', JSON.stringify(newSavedForLater));
      window.dispatchEvent(new CustomEvent('savedItemsChanged'));
      
      // If quantity becomes 0, set timeout to show popup after 400ms
      if (newQty === 0) {
        // Clear any existing timeout
        if (deleteTimeoutRef.current) {
          clearTimeout(deleteTimeoutRef.current);
        }
        deleteTimeoutRef.current = setTimeout(() => {
          setDeleteItemConfirm({ itemId, type: 'saved', previousQuantity: currentQty });
          deleteTimeoutRef.current = null;
        }, 400);
      } else {
        // If quantity is not 0, clear any pending timeout
        if (deleteTimeoutRef.current) {
          clearTimeout(deleteTimeoutRef.current);
          deleteTimeoutRef.current = null;
        }
      }
    } catch (e) {
      console.error('Error updating saved item quantity:', e);
    }
  };

  const handleClearSavedItems = () => {
    setShowClearConfirm(true);
  };

  const confirmClearSavedItems = () => {
    try {
      setSavedForLater([]);
      localStorage.setItem('savedForLater', JSON.stringify([]));
      window.dispatchEvent(new CustomEvent('savedItemsChanged'));
      setShowClearConfirm(false);
    } catch (e) {
      console.error('Error clearing saved items:', e);
    }
  };

  const confirmEmptyBag = () => {
    try {
      setCartItems([]);
      setCartCount(0);
      localStorage.setItem('cartItems', JSON.stringify([]));
      localStorage.setItem('cartCount', '0');
      window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: 0 }));
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      setShowEmptyBagConfirm(false);
    } catch (e) {
      console.error('Error emptying bag:', e);
    }
  };

  const handleEdit = (item: any) => {
    try {
      // Match CartDropdown: set both editingCartItem and editingCartItemId so build-a-wig loads correct item
      localStorage.setItem('editingCartItem', JSON.stringify(item));
      localStorage.setItem('editingCartItemId', item.id);
      localStorage.removeItem('editingSource'); // edit opened from bag → save updates cart/saved for later

      // Store individual customization options (same as CartDropdown) so edit mode loads correct selections
      const capSize = item.capSize || 'M';
      const length = item.length || '24"';
      const density = item.density || '200%';
      let color = item.color;
      if (item.name === 'BLANCO') {
        const validBlancoColors = ['GOLDEN', 'PLATINUM', 'ASH'];
        if (!color || !validBlancoColors.includes(color)) color = 'PLATINUM';
      } else {
        color = color || 'OFF BLACK';
      }
      const texture = item.texture || 'SILKY';
      const lace = item.lace || '13X6';
      const hairline = item.hairline || 'NATURAL';
      const partSelection = item.partSelection || 'MIDDLE';
      const styling = item.styling || 'NONE';
      const addOns = item.addOns || [];
      const capSizePrice = (capSize === 'XXS/XS/S' || capSize === 'S/M/L') ? '40' : '0';

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

      window.dispatchEvent(new CustomEvent('editingCartItemChanged', { detail: { itemId: item.id } }));

      let editRoute = '/build-a-wig/edit';
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
      navigate('/sign-in');
    }
  };

  const handleSignOut = () => {
    setIsSignedIn(false);
    clearAppAuth();
    window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'false' }));
    setShowSignOutConfirm(false);
    setShowMobileMenu(false);
  };

  // Calculate subtotal
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

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
                    onClick={() => navigate('/')} 
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
                    onClick={() => navigate('/')}
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
                    onClick={() => navigate('/')}
                  >
                    HOME &gt;
                  </span>{' '}
                  <span
                    style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}
                  >
                    BAG
                  </span>
                </>
              )}
            </p>

            {/* Right side icons */}
            <div className="gap-5 flex absolute" style={{ right: '17px' }}>
<div style={{ transform: `translateX(${cartCount === 0 ? 7 : 5}px)` }}>
              <DynamicCartIcon count={cartCount} width={22} height={19} />
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

          {/* MAIN BUILD AREA */}
          <div
            className={`${showMobileMenu ? 'menu-toggle-card ' : ''}border border-black flex flex-col p-4 mb-2 bg-white/60 backdrop-blur-sm overflow-hidden transition-all duration-300 ease-out`}
            style={{ 
              borderWidth: '1.3px', 
              minWidth: '100%', 
              maxWidth: 'none', 
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              height: 'calc(100vh - 270px)',
              minHeight: 'calc(100vh - 270px)',
              maxHeight: 'calc(100vh - 270px)'
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
                            transform: 'translateX(7px)'
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
                                transform: 'translateX(7px)'
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
                                  transform: `${mobileMenuExpandedItems.includes(item.label) ? 'translateX(-5px) translateY(-4px) rotate(90deg)' : 'translateX(-5px) translateY(-4px) rotate(0deg)'}`,
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
                <SocialMenuIcons />
              </div>
            ) : (
              /* CART ITEMS - match wishlist: flex column with flex-1 + minHeight:0 so scroll fills space, paddingBottom inside scroll */
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0, flex: 1, minHeight: 0, overflow: 'hidden' }}>
                 {/* Shopping Bag Header */}
                 <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ flexShrink: 0 }}>
                   <button
                     className="text-red-500 font-bold text-lg tracking-wider truncate hover:text-red-600 transition-colors text-left uppercase"
                     style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '12px', fontWeight: '500' }}
                   >
                     SHOPPING BAG
                   </button>
                   <span
                     className="text-black font-bold text-lg flex-shrink-0 ml-2 uppercase"
                     style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', fontSize: '17px' }}
                   >
                     {cartItems.length}
                   </span>
                 </div>

                 {/* Loyalty points line - same position and styling as Saved for Later stock line (top, below header) */}
                 {cartItems.length > 0 && (
                   <p className="text-center w-full flex-shrink-0" style={{ marginTop: '10px', marginBottom: '6px', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>
                     {isSignedIn ? (
                       (() => {
                         const basePoints = Math.round(pointsEligibleAmount);
                         const multiplier = getPointsMultiplierForUser();
                         const actualPoints = Math.round(basePoints * multiplier);
                         const punctuation = actualPoints === 0 ? '.' : '!';
                         return <>YOU&apos;RE EARNING <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' }}>{actualPoints.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span> LOYALTY POINTS WITH THIS ORDER{punctuation}</>;
                       })()
                     ) : (
                       <>SIGN IN TO EARN LOYALTY POINTS FOR THIS ORDER.</>
                     )}
                   </p>
                 )}

                 {/* Body - flex-1 minHeight:0; single 4.8px below loyalty line to match saved-for-later spacing */}
                 <div className="flex flex-col" style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                   {/* Cart Items - scrollable; paddingTop 4.8px matches saved card spacing below status line */}
                   <div className={`flex flex-col justify-start items-start gap-0 ${cartItems.length > 1 ? 'overflow-y-auto' : ''}`} style={{ flex: 1, minHeight: 0, scrollBehavior: 'smooth', width: '100%', paddingTop: '4.8px', paddingBottom: cartItems.length > 1 ? '16px' : '0' }}>
                     {cartItems.length === 0 ? (
                       <div style={{ 
                         flex: 1,
                         textAlign: 'center', 
                         padding: '40px 20px',
                         display: 'flex',
                         flexDirection: 'column',
                         alignItems: 'center',
                         justifyContent: 'center',
                         width: '100%'
                       }}>
                         <p 
                           style={{ 
                             fontSize: '11px',
                             fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                             color: '#808080',
                             textTransform: 'uppercase',
                             margin: '0'
                           }}
                           dangerouslySetInnerHTML={{ __html: "YOUR BAG IS CURRENTLY EMPTY.<br>LET'S GO SHOPPING!" }}
                         />
                       </div>
                     ) : (
                       <>
                         {cartItems.map((item, index) => {
                      const itemId = item.id || `cart-item-${index}`;
                      const itemName = item.name || 'NOIR';
                      
                      // Get the correct image based on product name and hairline (same logic as cart dropdown)
                      const getItemImage = () => {
                        // Gift card uses specific thumbnail
                        if (item.name === 'GIFT CARD' || item.type === 'gift-card') {
                          return '/assets/gift-card asset.png';
                        }
                        
                        // Determine thumbnail based on product name and hairline selection
                        const hairline = item.hairline || 'NATURAL';
                        const hairlineUpper = hairline.toUpperCase();
                        const hasPeak = hairlineUpper.includes('PEAK');
                        const hasLagos = hairlineUpper.includes('LAGOS');
                        
                        // For NOIR product: use peak/lagos thumbnails if selected
                        if (item.name === 'NOIR') {
                          if (hasPeak) {
                            return '/assets/noir-peak-thumb.png';
                          } else if (hasLagos) {
                            return '/assets/noir-lagos-thumb.png';
                          }
                          return item.image || '/assets/NOIR/noir-thumb.png';
                        }
                        
                        // Default: use the product's default thumbnail
                        return item.image || '/assets/NOIR/noir-thumb.png';
                      };
                      const itemImage = getItemImage();
                      
                      // Get the correct hair origin based on product name (same logic as cart dropdown)
                      const getHairOrigin = (productName: string) => {
                        switch (productName) {
                          case 'NOIR':
                            return 'CAMBODIAN';
                          case 'BLANCO':
                            return 'CAMBODIAN';
                          case 'SOFT CURL':
                            return 'FILIPINO';
                          case 'OCEAN CURL':
                            return 'VIETNAMESE';
                          case 'SOFT WAVE':
                            return 'INDIAN';
                          case 'BEACH WAVE':
                            return 'INDONESIAN';
                          default:
                            return 'CAMBODIAN';
                        }
                      };
                      
                      const itemLength = item.length || '24"';
                      const itemHairOrigin = getHairOrigin(itemName);
                      const itemPrice = item.price || 580;
                      const itemQuantity = item.quantity ?? 1;

                       return (
                         <div key={itemId} className="bg-white border border-gray-200 p-2 mb-2 w-full" style={{ boxSizing: 'border-box' }}>
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
                          {/* Thumbnail Container - Matching cart dropdown */}
                          <div className="flex flex-col items-center justify-center" style={{ flexShrink: 0, width: '88px', height: '100%' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: !(item.name === 'GIFT CARD' || item.type === 'gift-card') ? 'translateY(-4px)' : 'none' }}>
                              {/* Item Image */}
                              <div 
                                className="flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                                style={{ 
                                  width: (item.name === 'GIFT CARD' || item.type === 'gift-card') ? '106px' : '88px', 
                                  height: (item.name === 'GIFT CARD' || item.type === 'gift-card') ? '106px' : '88px',
                                  margin: '0'
                                }}
                                onClick={() => {
                                  // Determine the correct product page route based on item name
                                  let productRoute = '/straight/noir';
                                  if (item.name === 'GIFT CARD' || item.type === 'gift-card') {
                                    productRoute = '/tools/gift-card';
                                  } else if (item.name === 'NOIR') {
                                    productRoute = '/straight/noir';
                                  } else if (item.name === 'BLANCO') {
                                    productRoute = '/straight/blanco';
                                  } else if (item.name === 'SOFT WAVE') {
                                    productRoute = '/wavy/soft-wave';
                                  } else if (item.name === 'SOFT CURL') {
                                    productRoute = '/curly/soft-curl';
                                  } else if (item.name === 'BEACH WAVE') {
                                    productRoute = '/wavy/beach-wave';
                                  } else if (item.name === 'OCEAN CURL') {
                                    productRoute = '/curly/ocean-curl';
                                  }
                                  navigate(productRoute);
                                }}
                              >
                                <img
                                  src={itemImage}
                                  alt={itemName}
                                  className="object-cover rounded"
                                  style={{ width: (item.name === 'GIFT CARD' || item.type === 'gift-card') ? '106px' : '88px', height: (item.name === 'GIFT CARD' || item.type === 'gift-card') ? '106px' : '88px' }}
                                />
                              </div>
                              
                              {/* EDIT IN BUILD-A-WIG text - Only show for units, not gift cards */}
                              {!(item.name === 'GIFT CARD' || item.type === 'gift-card') && (
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
                                >
                                  EDIT IN BUILD-A-WIG
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Item Details - Matching cart dropdown */}
                          <div className="flex-1 min-w-0 flex flex-col relative justify-center" style={{ marginLeft: '18px', height: '100%' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                              <p 
                                className="font-medium truncate cart-product-name"
                                style={{ 
                                  fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                                  color: '#000000',
                                  textTransform: 'uppercase',
                                  fontSize: (() => {
                                    if (item.name === 'NOIR') {
                                      return '22px';
                                    }
                                    return '21px';
                                  })(),
                                  lineHeight: '1.1',
                                  margin: '0'
                                }}
                              >
                                {itemName.replace(/WIG/gi, '').trim()}
                              </p>
                              <p 
                                className="font-bold"
                                style={{ 
                                  fontFamily: '"Futura PT Book"',
                                  color: '#EB1C24',
                                  textTransform: 'uppercase',
                                  fontSize: '9px',
                                  marginTop: '2px',
                                  marginBottom: '0',
                                  lineHeight: '1.1'
                                }}
                              >
                                {(() => {
                                  if (item.name === 'GIFT CARD' || item.type === 'gift-card') {
                                    return 'DIGITAL ONLY';
                                  }
                                  return `${itemLength} RAW ${itemHairOrigin}`;
                                })()}
                              </p>
                              {item.capSize && (
                                <p 
                                  className="font-semibold"
                                  style={{ 
                                    fontFamily: '"Futura PT Medium"',
                                    color: '#808080',
                                    textTransform: 'uppercase',
                                    fontSize: '10px',
                                    marginTop: (() => {
                                      // Check if there's black detail text (specifications)
                                      const hasSpecs = (item.density && item.density !== '200%') || 
                                                     (item.lace && item.lace !== '13X6') || 
                                                     (item.texture && item.texture !== 'SILKY') || 
                                                     (item.color && item.color !== (item.name === 'BLANCO' ? 'PLATINUM' : 'OFF BLACK')) || 
                                                     (item.hairline && item.hairline !== 'NATURAL') || 
                                                     (item.styling && item.styling !== 'NONE') || 
                                                     (item.addOns && item.addOns.length > 0);
                                      const baseMargin = hasSpecs ? '2px' : '0px';
                                      // Add 2px for SOFT WAVE and SOFT CURL only
                                      if (item.name === 'SOFT WAVE' || item.name === 'SOFT CURL') {
                                        const numValue = parseInt(baseMargin);
                                        return `${numValue + 2}px`;
                                      }
                                      // Add 2px for OCEAN CURL only
                                      if (item.name === 'OCEAN CURL') {
                                        const numValue = parseInt(baseMargin);
                                        return `${numValue + 2}px`;
                                      }
                                      return baseMargin;
                                    })(),
                                    marginBottom: '0',
                                    lineHeight: '1.1'
                                  }}
                                >
                                  CAP SIZE: {item.capSize}
                                </p>
                              )}
                              <p
                                style={{
                                  fontFamily: '"Futura PT Book"',
                                  color: '#000000',
                                  fontSize: '12px',
                                  marginTop: item.name === 'BLANCO' ? '0px' : '2px',
                                  marginBottom: '0',
                                  marginLeft: '0',
                                  marginRight: '0',
                                  fontWeight: '600'
                                }}
                                dangerouslySetInnerHTML={formatPrice(itemPrice)}
                              />
                            </div>

                            {/* Quantity Counter with Save For Later */}
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
                                  disabled={itemQuantity >= (item.isSpecialOffer ? 2 : 10)}
                                  className={`px-2 py-0.5 text-red-500 bg-white hover:bg-gray-50 quantity-plus-btn flex items-center justify-center ${itemQuantity >= (item.isSpecialOffer ? 2 : 10) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
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
                                >
                                  <span style={{ fontFamily: 'Cascadia Code, monospace', fontSize: '8.25px' }}>+</span>
                                </button>
                              </div>
                              <button
                                onClick={() => handleSaveForLater(item)}
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
                                SAVE FOR LATER
                              </button>
                            </div>
                            </div>
                          </div>
                         </div>
                      );
                    })}
                       </>
                     )}
                   </div>
                 </div>

                 {/* Subtotal - Fixed at bottom; match Saved for Later spacing above (pt-1 when 2+, same inner margin/padding) */}
                 {cartItems.length > 0 && (
                   <div className={`overflow-hidden mt-auto flex-shrink-0 ${cartItems.length === 1 ? '' : 'pt-1'}`}>
                     <div style={{ 
                       marginTop: cartItems.length === 1 ? '2px' : '5px', 
                       paddingTop: cartItems.length === 1 ? '4px' : '7px',
                       borderTop: '1.3px solid #000',
                       display: 'flex',
                       justifyContent: 'space-between',
                       alignItems: 'center'
                     }}>
                       <p style={{
                         fontFamily: '"Futura PT Book"',
                         fontSize: '12px',
                         fontWeight: '600',
                         margin: '0'
                       }}>
                         SUBTOTAL:
                       </p>
                       <p
                         style={{
                           fontFamily: '"Futura PT Book"',
                           fontSize: '12px',
                           fontWeight: '600',
                           margin: '0'
                         }}
                         dangerouslySetInnerHTML={formatPrice(subtotal)}
                       />
                     </div>
                   </div>
                 )}
              </div>
            )}
          </div>

          {/* EMPTY BAG & PROCEED TO CHECKOUT - Only show when menu is closed and there are cart items */}
          {!showMobileMenu && cartItems.length > 0 && (
            <div className="px-0 md:px-0" style={{ marginTop: '2px', marginBottom: '20px' }}>
              <button
                onClick={() => setShowEmptyBagConfirm(true)}
                className="border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50 mb-2"
                style={{ 
                  borderWidth: '1.3px', 
                  color: '#EB1C24',
                  fontFamily: '"Futura PT Medium"',
                  backgroundColor: '#FFFFFF'
                }}
                type="button"
              >
                EMPTY BAG
              </button>
              <button
                onClick={() => navigate('/checkout')}
                className="border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
                style={{ 
                  borderWidth: '1.3px', 
                  color: '#EB1C24',
                  fontFamily: '"Futura PT Medium"',
                  backgroundColor: '#FFFFFF'
                }}
                type="button"
              >
                PROCEED TO CHECKOUT
              </button>
            </div>
          )}

          {/* SAVED FOR LATER SECTION - Only show when menu is closed and there are saved items */}
          {!showMobileMenu && savedForLater.length > 0 && (
            <div
              className="border border-black flex flex-col p-4 mb-2 bg-white/60 backdrop-blur-sm overflow-hidden transition-all duration-300 ease-out"
              style={{ 
                borderWidth: '1.3px', 
                minWidth: '100%', 
                maxWidth: 'none', 
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                WebkitBackdropFilter: 'blur(10px)',
                willChange: 'backdrop-filter',
                marginTop: '10px',
                ...(savedForLater.length > 1 ? { height: 'calc(100vh - 270px)', minHeight: 'calc(100vh - 270px)', maxHeight: 'calc(100vh - 270px)' } : {})
              }}
            >
              {/* Saved For Later - match wishlist: flex column with flex-1 + minHeight:0, scroll fills space, paddingBottom inside scroll */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0, flex: 1, minHeight: 0, overflow: 'hidden' }}>
              {/* Saved For Later Header */}
              <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ flexShrink: 0 }}>
                <button
                  className="text-red-500 font-bold text-lg tracking-wider truncate hover:text-red-600 transition-colors text-left uppercase"
                  style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '12px', fontWeight: '500' }}
                >
                  SAVED FOR LATER
                </button>
                <span
                  className="text-black font-bold text-lg flex-shrink-0 ml-2 uppercase"
                  style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', fontSize: '17px' }}
                >
                  {savedForLater.length}
                </span>
              </div>

              {/* Stock status line - same spacing as cart dropdown "you're earning" (when saved items exist) */}
              {savedForLater.length > 0 && (() => {
                const outOfStockCount = savedForLater.filter((i: any) => (i.stockStatus || 'in_stock') === 'out_of_stock').length;
                const lowStockCount = savedForLater.filter((i: any) => (i.stockStatus || 'in_stock') === 'low_stock').length;
                const allInStock = outOfStockCount === 0 && lowStockCount === 0;
                if (allInStock) {
                  return (
                    <p className="text-center w-full flex-shrink-0" style={{ marginTop: '10px', marginBottom: '6px', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>
                      ALL OF YOUR SAVED ITEMS ARE IN STOCK!
                    </p>
                  );
                }
                if (outOfStockCount > 0) {
                  const n = outOfStockCount;
                  const isOne = n === 1;
                  return (
                    <p className="text-center w-full flex-shrink-0" style={{ marginTop: '10px', marginBottom: '6px', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>
                      <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' }}>{n}</span>
                      {isOne ? ' ITEM IN YOUR SAVED ITEMS IS OUT OF STOCK.' : ' ITEMS IN YOUR SAVED ITEMS ARE OUT OF STOCK.'}
                    </p>
                  );
                }
                const n = lowStockCount;
                const isOne = n === 1;
                return (
                  <p className="text-center w-full flex-shrink-0" style={{ marginTop: '10px', marginBottom: '6px', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>
                    <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' }}>{n}</span>
                    {isOne ? ' ITEM IN YOUR SAVED ITEMS IS LOW IN STOCK.' : ' ITEMS IN YOUR SAVED ITEMS ARE LOW IN STOCK.'}
                  </p>
                );
              })()}

              {/* Body - flex-1 minHeight:0 so scroll area gets remaining height; single 4.8px below stock line to match wishlist */}
              <div className="flex flex-col" style={{ flex: savedForLater.length > 1 ? 1 : undefined, minHeight: savedForLater.length > 1 ? 0 : undefined, overflow: 'hidden' }}>
                {/* Saved Items - scrollable; paddingTop 4.8px matches wishlist spacing below stock line */}
                <div className={`flex flex-col justify-start items-start gap-0 ${savedForLater.length > 1 ? 'overflow-y-auto' : ''}`} style={{ flex: savedForLater.length > 1 ? 1 : undefined, minHeight: savedForLater.length > 1 ? 0 : undefined, scrollBehavior: 'smooth', width: '100%', paddingTop: '4.8px', paddingBottom: savedForLater.length > 1 ? '16px' : '0' }}>
                  {savedForLater.map((item, index) => {
                  const itemId = item.id || `saved-item-${index}`;
                  const itemName = item.name || 'NOIR';
                  
                  // Get the correct image based on product name and hairline (same logic as cart dropdown)
                  const getItemImage = () => {
                    if (item.name === 'GIFT CARD' || item.type === 'gift-card') {
                      return '/assets/gift-card asset.png';
                    }
                    const hairline = item.hairline || 'NATURAL';
                    const hairlineUpper = hairline.toUpperCase();
                    const hasPeak = hairlineUpper.includes('PEAK');
                    const hasLagos = hairlineUpper.includes('LAGOS');
                    if (item.name === 'NOIR') {
                      if (hasPeak) {
                        return '/assets/noir-peak-thumb.png';
                      } else if (hasLagos) {
                        return '/assets/noir-lagos-thumb.png';
                      }
                      return item.image || '/assets/NOIR/noir-thumb.png';
                    }
                    return item.image || '/assets/NOIR/noir-thumb.png';
                  };
                  const itemImage = getItemImage();
                  
                  // Get the correct hair origin based on product name
                  const getHairOrigin = (productName: string) => {
                    switch (productName) {
                      case 'NOIR':
                        return 'CAMBODIAN';
                      case 'BLANCO':
                        return 'RUSSIAN';
                      case 'SOFT CURL':
                        return 'FILIPINO';
                      case 'OCEAN CURL':
                        return 'VIETNAMESE';
                      case 'SOFT WAVE':
                        return 'INDIAN';
                      case 'BEACH WAVE':
                        return 'INDONESIAN';
                      default:
                        return 'CAMBODIAN';
                    }
                  };
                  
                  const itemLength = item.length || '24"';
                  const itemHairOrigin = getHairOrigin(itemName);
                  const itemPrice = item.price || 580;
                  const itemQuantity = item.quantity ?? 0;

                  return (
                    <div key={itemId} className="bg-white border border-gray-200 p-2 mb-2 w-full" style={{ boxSizing: 'border-box' }}>
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
                      {/* Thumbnail Container - Matching cart dropdown */}
                      <div className="flex flex-col items-center justify-center" style={{ flexShrink: 0, width: '88px', height: '100%' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: !(item.name === 'GIFT CARD' || item.type === 'gift-card') ? 'translateY(-4px)' : 'none' }}>
                          {/* Item Image */}
                          <div 
                            className="flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                            style={{ 
                              width: (item.name === 'GIFT CARD' || item.type === 'gift-card') ? '106px' : '88px', 
                              height: (item.name === 'GIFT CARD' || item.type === 'gift-card') ? '106px' : '88px',
                              margin: '0'
                            }}
                            onClick={() => {
                              // Determine the correct product page route based on item name
                              let productRoute = '/straight/noir';
                              if (item.name === 'GIFT CARD' || item.type === 'gift-card') {
                                productRoute = '/tools/gift-card';
                              } else if (item.name === 'NOIR') {
                                productRoute = '/straight/noir';
                              } else if (item.name === 'BLANCO') {
                                productRoute = '/straight/blanco';
                              } else if (item.name === 'SOFT WAVE') {
                                productRoute = '/wavy/soft-wave';
                              } else if (item.name === 'SOFT CURL') {
                                productRoute = '/curly/soft-curl';
                              } else if (item.name === 'BEACH WAVE') {
                                productRoute = '/wavy/beach-wave';
                              } else if (item.name === 'OCEAN CURL') {
                                productRoute = '/curly/ocean-curl';
                              }
                              navigate(productRoute);
                            }}
                          >
                            <img
                              src={itemImage}
                              alt={itemName}
                              className="object-cover rounded"
                              style={{ width: (item.name === 'GIFT CARD' || item.type === 'gift-card') ? '106px' : '88px', height: (item.name === 'GIFT CARD' || item.type === 'gift-card') ? '106px' : '88px' }}
                            />
                          </div>
                          
                          {/* EDIT IN BUILD-A-WIG text - Only show for units, not gift cards */}
                          {!(item.name === 'GIFT CARD' || item.type === 'gift-card') && (
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
                            >
                              EDIT IN BUILD-A-WIG
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center" style={{ marginLeft: '18px', position: 'relative', height: '100%' }}>
                         <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                           <p 
                             className="font-medium truncate cart-product-name"
                             style={{ 
                               fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                               color: '#000000',
                               textTransform: 'uppercase',
                               fontSize: (() => {
                                 if (item.name === 'NOIR') {
                                   return '22px';
                                 }
                                 return '21px';
                               })(),
                               lineHeight: '1.1',
                               margin: '0'
                             }}
                           >
                             {itemName.replace(/WIG/gi, '').trim()}
                           </p>
                           <p 
                             className="font-bold"
                             style={{ 
                               fontFamily: '"Futura PT Book"',
                               color: '#EB1C24',
                               textTransform: 'uppercase',
                               fontSize: '9px',
                               marginTop: '2px',
                               marginBottom: '0',
                               lineHeight: '1.1'
                             }}
                           >
                             {(() => {
                               if (item.name === 'GIFT CARD' || item.type === 'gift-card') {
                                 return 'DIGITAL ONLY';
                               }
                               return `${itemLength} RAW ${itemHairOrigin}`;
                             })()}
                           </p>
                           {/* Removed black detail text for symmetry */}
                           {item.capSize && (
                             <p 
                               className="font-semibold"
                               style={{ 
                                 fontFamily: '"Futura PT Medium"',
                                 color: '#808080',
                                 textTransform: 'uppercase',
                                 fontSize: '10px',
                                 marginTop: (() => {
                                   // Check if there's black detail text (specifications)
                                   const hasSpecs = (item.density && item.density !== '200%') || 
                                                  (item.lace && item.lace !== '13X6') || 
                                                  (item.texture && item.texture !== 'SILKY') || 
                                                  (item.color && item.color !== (item.name === 'BLANCO' ? 'PLATINUM' : 'OFF BLACK')) || 
                                                  (item.hairline && item.hairline !== 'NATURAL') || 
                                                  (item.styling && item.styling !== 'NONE') || 
                                                  (item.addOns && item.addOns.length > 0);
                                   const baseMargin = hasSpecs ? '2px' : '0px';
                                   // Add 2px for SOFT WAVE and SOFT CURL only
                                   if (item.name === 'SOFT WAVE' || item.name === 'SOFT CURL') {
                                     const numValue = parseInt(baseMargin);
                                     return `${numValue + 2}px`;
                                   }
                                   // Add 2px for OCEAN CURL only
                                   if (item.name === 'OCEAN CURL') {
                                     const numValue = parseInt(baseMargin);
                                     return `${numValue + 2}px`;
                                   }
                                   return baseMargin;
                                 })(),
                                 marginBottom: '0',
                                 lineHeight: '1.1'
                               }}
                             >
                               CAP SIZE: {item.capSize}
                             </p>
                           )}
                           <p
                             style={{
                               fontFamily: '"Futura PT Book"',
                               color: '#000000',
                               fontSize: '12px',
                               marginTop: item.name === 'BLANCO' ? '0px' : '2px',
                               marginBottom: '0',
                               marginLeft: '0',
                               marginRight: '0',
                               fontWeight: '600'
                             }}
                             dangerouslySetInnerHTML={formatPrice(itemPrice)}
                           />
                         </div>

                         {/* Quantity Counter */}
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
                               onClick={() => handleSavedQuantityChange(itemId, -1)}
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
                               onClick={() => handleSavedQuantityChange(itemId, 1)}
                               disabled={itemQuantity >= (item.isSpecialOffer ? 2 : 10)}
                               className={`px-2 py-0.5 text-red-500 bg-white hover:bg-gray-50 quantity-plus-btn flex items-center justify-center ${itemQuantity >= (item.isSpecialOffer ? 2 : 10) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
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
                             >
                               <span style={{ fontFamily: 'Cascadia Code, monospace', fontSize: '8.25px' }}>+</span>
                             </button>
                           </div>
                           {(item.stockStatus || 'in_stock') === 'out_of_stock' ? (
                             <span
                               style={{
                                 fontFamily: '"Futura PT Demi"',
                                 fontSize: '9px',
                                 color: '#808080',
                                 textTransform: 'uppercase',
                                 marginTop: '6px',
                                 textAlign: 'center'
                               }}
                             >
                               OUT OF STOCK
                             </span>
                           ) : (
                             <button
                               onClick={() => handleMoveToCart(item)}
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
                              MOVE TO BAG
                             </button>
                           )}
                         </div>
                      </div>
                    </div>
                    </div>
                  );
                  })}
                </div>
              </div>

              {/* Subtotal - Fixed at bottom (match Vercel/original: pt-1 wrapper, conditional inner spacing) */}
              {savedForLater.length > 0 && (
                <div className={`overflow-hidden mt-auto flex-shrink-0 ${savedForLater.length === 1 ? '' : 'pt-1'}`}>
                  <div style={{ 
                    marginTop: savedForLater.length === 1 ? '2px' : '5px', 
                    paddingTop: savedForLater.length === 1 ? '4px' : '7px',
                    borderTop: '1.3px solid #000',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <p style={{
                      fontFamily: '"Futura PT Book"',
                      fontSize: '12px',
                      fontWeight: '600',
                      margin: '0'
                    }}>
                      SUBTOTAL:
                    </p>
                    <p
                      style={{
                        fontFamily: '"Futura PT Book"',
                        fontSize: '12px',
                        fontWeight: '600',
                        margin: '0'
                      }}
                      dangerouslySetInnerHTML={formatPrice(savedForLater.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0))}
                    />
                  </div>
                </div>
              )}
              </div>
            </div>
          )}

          {/* CLEAR SAVED ITEMS BUTTON - Only show when menu is closed and there are saved items */}
          {!showMobileMenu && savedForLater.length > 0 && (
            <div className="px-0 md:px-0" style={{ marginTop: '2px', marginBottom: '20px' }}>
              <button
                onClick={handleClearSavedItems}
                className="border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
                style={{ 
                  borderWidth: '1.3px', 
                  color: '#EB1C24',
                  fontFamily: '"Futura PT Medium"',
                  backgroundColor: '#FFFFFF'
                }}
                type="button"
              >
                DELETE SAVED ITEMS
              </button>
            </div>
          )}

          {/* Clear Saved Items Confirmation Modal */}
          <ConfirmationModal
            isOpen={showClearConfirm}
            onClose={() => setShowClearConfirm(false)}
            onConfirm={confirmClearSavedItems}
            title="DELETE SAVED ITEMS?"
            message="ARE YOU SURE YOU WANT TO REMOVE ALL SAVED ITEMS?"
            confirmText="CONFIRM"
            cancelText="CANCEL"
            dataAttribute="clear-saved-items-confirm"
          />

          {/* Empty Bag Confirmation Modal */}
          <ConfirmationModal
            isOpen={showEmptyBagConfirm}
            onClose={() => setShowEmptyBagConfirm(false)}
            onConfirm={confirmEmptyBag}
            title="EMPTY BAG?"
            message="ARE YOU SURE YOU WANT TO REMOVE ALL ITEMS FROM YOUR BAG?"
            confirmText="CONFIRM"
            cancelText="CANCEL"
            dataAttribute="empty-bag-confirm"
          />

          {/* Delete Item Confirmation Modal */}
          <ConfirmationModal
            isOpen={deleteItemConfirm !== null}
            onClose={() => {
              // Clear any pending timeout when closing
              if (deleteTimeoutRef.current) {
                clearTimeout(deleteTimeoutRef.current);
                deleteTimeoutRef.current = null;
              }
              
              // Restore previous quantity if it exists
              if (deleteItemConfirm?.previousQuantity !== undefined) {
                if (deleteItemConfirm.type === 'cart') {
                  const newItems = cartItems.map(i => {
                    if (i.id === deleteItemConfirm.itemId) {
                      return { ...i, quantity: deleteItemConfirm.previousQuantity };
                    }
                    return i;
                  });
                  setCartItems(newItems);
                  localStorage.setItem('cartItems', JSON.stringify(newItems));
                  window.dispatchEvent(new CustomEvent('cartItemsChanged'));
                  
                  // Update cart count
                  const newCount = newItems.reduce((sum: number, ci: any) => sum + (ci.quantity || 0), 0);
                  localStorage.setItem('cartCount', newCount.toString());
                  setCartCount(newCount);
                  window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: newCount }));
                  window.dispatchEvent(new CustomEvent('cartUpdated'));
                } else {
                  const newSavedForLater = savedForLater.map(i => {
                    if (i.id === deleteItemConfirm.itemId) {
                      return { ...i, quantity: deleteItemConfirm.previousQuantity };
                    }
                    return i;
                  });
                  setSavedForLater(newSavedForLater);
                  localStorage.setItem('savedForLater', JSON.stringify(newSavedForLater));
                  window.dispatchEvent(new CustomEvent('savedItemsChanged'));
                }
              }
              
              setDeleteItemConfirm(null);
            }}
            onConfirm={confirmDeleteItem}
            title="REMOVE ITEM?"
            message={deleteItemConfirm?.type === 'cart' ? "ARE YOU SURE YOU WANT TO REMOVE THIS ITEM FROM YOUR BAG?" : "ARE YOU SURE YOU WANT TO REMOVE THIS ITEM FROM SAVED?"}
            confirmText="CONFIRM"
            cancelText="CANCEL"
            dataAttribute="delete-item-confirm"
          />

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
      </div>
    </div>
  );
}

export default ShoppingBagPage;

