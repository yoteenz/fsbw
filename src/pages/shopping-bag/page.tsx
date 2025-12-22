import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DynamicCartIcon from '../../components/DynamicCartIcon';
import ConfirmationModal from '../../components/ConfirmationModal';

function ShoppingBagPage() {
  const navigate = useNavigate();
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
  const [mobileMenuActiveTab, setMobileMenuActiveTab] = useState('SHOP');
  const [mobileMenuExpandedItems, setMobileMenuExpandedItems] = useState<string[]>([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [deleteItemConfirm, setDeleteItemConfirm] = useState<{ itemId: string; type: 'cart' | 'saved'; previousQuantity?: number } | null>(null);
  const deleteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        loadCartItems();
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
          setCartItems(items);
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
          setSavedForLater(items);
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
      const currentItem = cartItems.find(i => i.id === itemId);
      if (!currentItem) return;
      
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
          return { ...i, quantity: Math.max(0, Math.min(10, newQty)) };
        }
        return i;
      });
      setCartItems(newItems);
      localStorage.setItem('cartItems', JSON.stringify(newItems));
      
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
      
      // Add to saved for later
      const newSavedForLater = [item, ...savedForLater];
      setSavedForLater(newSavedForLater);
      localStorage.setItem('savedForLater', JSON.stringify(newSavedForLater));
      
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
      
      // Add to cart
      const newCartItems = [item, ...cartItems];
      setCartItems(newCartItems);
      localStorage.setItem('cartItems', JSON.stringify(newCartItems));
      
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
    } catch (e) {
      console.error('Error removing from saved:', e);
    }
  };

  const handleSavedQuantityChange = (itemId: string, delta: number) => {
    try {
      const currentItem = savedForLater.find(i => i.id === itemId);
      if (!currentItem) return;
      
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
          return { ...i, quantity: Math.max(0, Math.min(10, newQty)) };
        }
        return i;
      });
      setSavedForLater(newSavedForLater);
      localStorage.setItem('savedForLater', JSON.stringify(newSavedForLater));
      
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
      setShowClearConfirm(false);
    } catch (e) {
      console.error('Error clearing saved items:', e);
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
    setIsSignedIn(!isSignedIn);
  };

  // Calculate subtotal
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

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
              {showMobileMenu ? (
                <>
                  <button className="cursor-pointer" style={{ transform: 'translateX(0px)' }}>
                    <img
                      alt="Account icon"
                      width="16"
                      height="16"
                      src="/assets/NOIR/account-icon.svg"
                    />
                  </button>
                  <button 
                    onClick={() => navigate('/wishlist')} 
                    className="cursor-pointer"
                    style={{ height: '21px !important', width: '21px !important', padding: '0 !important', border: 'none !important', background: 'none !important', transform: 'translateX(2px)' }}
                  >
                    <img
                      alt="Wishlist"
                      width="19"
                      height="19"
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
            <div className="gap-5 flex absolute" style={{ right: showMobileMenu ? '14px' : '17px' }}>
              <div style={{ transform: showMobileMenu ? 'translateY(0.7px)' : 'none' }}>
                <DynamicCartIcon count={cartCount} width={22} height={19} />
              </div>
              <img
                alt="Menu"
                width="17"
                height="18"
                className="cursor-pointer"
                src="/assets/menu-icon.svg"
                onClick={handleMobileMenuToggle}
              />
            </div>
          </div>

          {/* MAIN BUILD AREA */}
          <div
            className="border border-black flex flex-col p-4 mb-2 bg-white/60 backdrop-blur-sm min-h-[360px] overflow-hidden"
            style={{ 
              borderWidth: '1.3px', 
              minWidth: '100%', 
              maxWidth: 'none', 
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              willChange: 'backdrop-filter',
              minHeight: showMobileMenu ? '560px' : '360px'
            }}
          >
            {showMobileMenu ? (
              /* MENU CONTENT */
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', paddingTop: '20px', height: '490px', position: 'relative' }}>
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
                      borderBottom: mobileMenuActiveTab === 'SHOP' ? '2px solid #EB1C24' : 'none',
                      paddingBottom: '4px',
                      background: 'none',
                      border: 'none',
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
                      borderBottom: mobileMenuActiveTab === 'TOOLS' ? '2px solid #EB1C24' : 'none',
                      paddingBottom: '4px',
                      background: 'none',
                      border: 'none',
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
                      borderBottom: mobileMenuActiveTab === 'BRAND' ? '2px solid #EB1C24' : 'none',
                      paddingBottom: '4px',
                      background: 'none',
                      border: 'none',
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
                            textTransform: 'uppercase'
                          }}>
                            {item}
                          </span>
                        </div>
                      ))
                    ) : mobileMenuActiveTab === 'BRAND' ? (
                      ['ABOUT US', 'CONTACT', 'CARE & STORAGE', 'BECOME A MEMBER', 'FAQ', 'PAYMENT + SHIPPING', 'REVIEWS', 'TERMS OF SERVICE'].map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span style={{ 
                            fontFamily: '"Futura PT Book"',
                            fontSize: '14px',
                            color: 'black',
                            fontWeight: '500',
                            textTransform: 'uppercase'
                          }}>
                            {item}
                          </span>
                        </div>
                      ))
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
                            className="flex items-center justify-between cursor-pointer"
                            style={{ alignItems: 'center' }}
                            onClick={() => {
                              if (item.isExpandable) {
                                if (item.label === 'UNITS' && mobileMenuExpandedItems.includes(item.label)) {
                                  navigate('/products/units');
                                } else {
                                  handleMobileMenuItemToggle(item.label);
                                }
                              }
                            }}
                          >
                            <span style={{ 
                              fontFamily: '"Futura PT Book"',
                              fontSize: '14px',
                              color: 'black',
                              fontWeight: '500',
                              textTransform: 'uppercase'
                            }}>
                              {item.label}
                            </span>
                            {item.hasArrow && (
                              <img
                                src="/assets/NOIR/closed-arrow.svg"
                                alt="Arrow"
                                style={{ 
                                  width: '16px', 
                                  height: '16px',
                                  transform: `${mobileMenuExpandedItems.includes(item.label) ? 'rotate(90deg)' : 'rotate(0deg)'} translateY(-4px)`,
                                  display: 'flex',
                                  alignItems: 'center'
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
                <div className="flex justify-center" style={{ marginBottom: '0' }}>
                  <div className="flex" style={{ gap: '19px' }}>
                    <img
                      src="/assets/instagram-icon.svg"
                      alt="Instagram"
                      style={{ width: '20px', height: '20px' }}
                    />
                    <img
                      src="/assets/twitter-icon.svg"
                      alt="Twitter"
                      style={{ width: '20px', height: '20px' }}
                    />
                    <img
                      src="/assets/facebook-icon.svg"
                      alt="Facebook"
                      style={{ width: '20px', height: '20px' }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* CART ITEMS */
              <>
                 {/* Shopping Bag Header */}
                 <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200">
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

                 {/* Body */}
                 <div className="flex-1 flex flex-col overflow-hidden mt-2">
                   {/* Cart Items - scrollable */}
                   <div className="flex flex-col justify-start items-start gap-0 my-2 flex-shrink-0 overflow-y-auto" style={{ maxHeight: '265px', scrollBehavior: 'smooth', width: '100%' }}>
                     {cartItems.length === 0 ? (
                       <div style={{ 
                         textAlign: 'center', 
                         padding: '40px 20px',
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         minHeight: '40px',
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
                         >
                           JUST DUST & LINT HERE.
                         </p>
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
                            return 'VIETNAMESE';
                          case 'OCEAN CURL':
                            return 'FILIPINO';
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

                       const isLastItem = index === cartItems.length - 1;
                       return (
                         <div
                           key={itemId}
                           className="flex items-start justify-start space-x-3"
                           style={{
                             minHeight: '80px',
                             paddingTop: '20px',
                             paddingBottom: '20px',
                             borderBottom: isLastItem ? 'none' : '1px solid #e5e7eb',
                             width: '100%',
                             flexShrink: 0
                           }}
                         >
                          {/* Thumbnail Container - Matching cart dropdown */}
                          <div className="flex flex-col items-center" style={{ flexShrink: 0, width: '88px', justifyContent: 'flex-start' }}>
                            {/* Item Image */}
                            <div 
                              className="flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                              style={{ width: (item.name === 'GIFT CARD' || item.type === 'gift-card') ? '106px' : '88px', height: (item.name === 'GIFT CARD' || item.type === 'gift-card') ? '106px' : '88px' }}
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
                                  marginTop: '6px',
                                  lineHeight: '1.1'
                                }}
                                onClick={() => handleEdit(item)}
                              >
                                EDIT IN BUILD-A-WIG
                              </p>
                            )}
                          </div>

                          {/* Item Details - Matching cart dropdown */}
                          <div className="flex-1 min-w-0 flex flex-col relative" style={{ marginLeft: '18px', paddingTop: '6px' }}>
                            <p 
                              className="font-medium truncate cart-product-name"
                              style={{ 
                                fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                                color: '#000000',
                                textTransform: 'uppercase',
                                fontSize: (() => {
                                  if (item.name === 'SOFT CURL' || item.name === 'SOFT WAVE') {
                                    return '18px'; // Decreased by 2px for SOFT CURL, SOFT WAVE
                                  }
                                  return '23px'; // 23px for NOIR, BLANCO, GIFT CARD, OCEAN CURL, BEACH WAVE
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
                                marginTop: (() => {
                                  // Check if there's detail text (specifications)
                                  const hasSpecs = (item.density && item.density !== '200%') || 
                                                 (item.lace && item.lace !== '13X6') || 
                                                 (item.texture && item.texture !== 'SILKY') || 
                                                 (item.color && item.color !== (item.name === 'BLANCO' ? 'PLATINUM' : 'OFF BLACK')) || 
                                                 (item.hairline && item.hairline !== 'NATURAL') || 
                                                 (item.styling && item.styling !== 'NONE') || 
                                                 (item.addOns && item.addOns.length > 0) ||
                                                 (item.capSize && (item.capSize === 'XXS/XS/S' || item.capSize === 'S/M/L')) ||
                                                 (item.length && item.length !== '24"');
                                  // Gift cards and BLANCO with no detail text should have reduced spacing
                                  const isGiftCard = item.name === 'GIFT CARD' || item.type === 'gift-card';
                                  const isBlancoNoSpecs = item.name === 'BLANCO' && !hasSpecs;
                                  if (isGiftCard) return '-3px'; // Gift cards moved down 1px
                                  if (isBlancoNoSpecs) return '-4px';
                                  return '-3px';
                                })(),
                                transform: 'translateY(6px)',
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
                            <p 
                              className="font-bold"
                              style={{ 
                                fontFamily: '"Futura PT Book"',
                                color: '#000000',
                                textTransform: 'uppercase',
                                fontSize: '9px',
                                marginTop: '8px',
                                marginRight: '20px',
                                lineHeight: '1.44',
                                wordBreak: 'break-word',
                                maxWidth: 'calc(100% - 20px)'
                              }}
                              dangerouslySetInnerHTML={{
                                __html: (() => {
                                  // Build text with customization details (same logic as cart dropdown)
                                  let text = '';
                                  
                                  const items = [];
                                  if (item.capSize && (item.capSize === 'XXS/XS/S' || item.capSize === 'S/M/L')) {
                                    items.push({ type: 'capSize', value: item.capSize, fullName: 'FLEX CAP' });
                                  }
                                  if (item.length && item.length !== '24"') {
                                    items.push({ type: 'length', value: item.length, fullName: item.length });
                                  }
                                  if (item.density && item.density !== '200%') items.push({ type: 'density', value: item.density, fullName: `${item.density} density` });
                                  if (item.lace && item.lace !== '13X6') items.push({ type: 'lace', value: item.lace, fullName: `${item.lace} lace` });
                                  
                                  let itemColor = item.color;
                                  if (item.name === 'BLANCO') {
                                    const validBlancoColors = ['GOLDEN', 'PLATINUM', 'ASH'];
                                    if (!itemColor || !validBlancoColors.includes(itemColor)) {
                                      itemColor = 'PLATINUM';
                                    }
                                  }
                                  const defaultColor = item.name === 'BLANCO' ? 'PLATINUM' : 'OFF BLACK';
                                  if (itemColor && itemColor !== defaultColor) items.push({ type: 'color', value: itemColor, fullName: itemColor });
                                  if (item.hairline && item.hairline !== 'NATURAL') items.push({ type: 'hairline', value: item.hairline, fullName: `${item.hairline} hairline` });
                                  
                                  const hairStylingOptions = ['BANGS', 'CRIMPS', 'FLAT IRON', 'LAYERS'];
                                  if (item.styling && item.styling !== 'NONE' && hairStylingOptions.includes(item.styling) && item.partSelection) {
                                    items.push({ type: 'styling', value: item.styling, partSelection: item.partSelection, fullName: item.styling });
                                  }
                                  
                                  if (item.addOns && item.addOns.length > 0) items.push({ type: 'addOns', value: item.addOns, fullName: item.addOns });
                                  
                                  // Build text with each item on its own line
                                  items.forEach((itemData, idx) => {
                                    if (idx > 0) {
                                      text += '<br/>';
                                    }
                                    
                                    // Handle addOns specially - each addOn on its own line
                                    if (itemData.type === 'addOns') {
                                      if (Array.isArray(itemData.value)) {
                                        itemData.value.forEach((addOn: string, addOnIndex: number) => {
                                          if (addOnIndex > 0) {
                                            text += '<br/>';
                                          }
                                          // Replace "BLEACH" with "BLEACH KNOTS" and "PLUCK" with "PLUCK KNOTS" for display
                                          const addOnText = addOn.toUpperCase().replace(/BLEACH/g, 'BLEACH KNOTS').replace(/PLUCK/g, 'PLUCK KNOTS');
                                          text += addOnText;
                                        });
                                      } else {
                                        // Handle single string case
                                        const addOnText = String(itemData.value).toUpperCase().replace(/BLEACH/g, 'BLEACH KNOTS').replace(/PLUCK/g, 'PLUCK KNOTS');
                                        text += addOnText;
                                      }
                                    } else {
                                      text += itemData.fullName;
                                    }
                                  });
                                  
                                  return text || '';
                                })()
                              }}
                            />
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
                                    const isBlanco = item.name === 'BLANCO';
                                    let baseMargin = hasSpecs ? '4px' : '2px';
                                    // Move BLANCO cap size up by 3px total (2px + 1px)
                                    if (isBlanco) {
                                      const numValue = parseInt(baseMargin);
                                      return `${Math.max(0, numValue - 3)}px`;
                                    }
                                    return baseMargin;
                                  })(),
                                  lineHeight: '1.1',
                                  marginBottom: '0'
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
                                marginBottom: '12px',
                                marginLeft: '0',
                                marginRight: '0',
                                fontWeight: '600'
                              }}
                              dangerouslySetInnerHTML={formatPrice(itemPrice)}
                            />

                            {/* Quantity Counter with Save For Later */}
                            <div className="flex flex-col items-center justify-center absolute" style={{ right: '8px', top: '0', bottom: '0', marginLeft: 'auto' }}>
                              <span
                                style={{
                                  fontFamily: '"Futura PT Medium"',
                                  fontSize: '9px',
                                  color: '#EB1C24',
                                  textTransform: 'uppercase',
                                  marginBottom: '6px'
                                }}
                              >
                                + LIST
                              </span>
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
                                >
                                  <span style={{ fontFamily: 'Cascadia Code, monospace', fontSize: '8.25px' }}>+</span>
                                </button>
                              </div>
                              <button
                                onClick={() => handleSaveForLater(item)}
                                style={{
                                  fontFamily: '"Futura PT Demi"',
                                  fontSize: '9px',
                                  color: '#909090',
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
                      );
                    })}
                       </>
                     )}
                   </div>
                 </div>

                 {/* Subtotal - Fixed at bottom */}
                 {cartItems.length > 0 && (
                   <div className="overflow-hidden mt-auto pt-2">
                     <div style={{ 
                       marginTop: '20px', 
                       paddingTop: '20px', 
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
              </>
            )}
          </div>

          {/* PROCEED TO CHECKOUT BUTTON - Only show when menu is closed and there are cart items */}
          {!showMobileMenu && cartItems.length > 0 && (
            <div className="px-0 md:px-0" style={{ marginTop: '2px', marginBottom: '20px' }}>
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
              className="border border-black flex flex-col p-4 mb-2 bg-white/60 backdrop-blur-sm min-h-[360px] overflow-hidden"
              style={{ 
                borderWidth: '1.3px', 
                minWidth: '100%', 
                maxWidth: 'none', 
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                willChange: 'backdrop-filter',
                marginTop: '10px'
              }}
            >
              {/* Saved For Later Header */}
              <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200">
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

              {/* Body */}
              <div className="flex-1 flex flex-col overflow-hidden mt-2">
                {/* Saved Items - scrollable */}
                <div className="flex flex-col justify-start items-start gap-0 my-2 flex-shrink-0 overflow-y-auto" style={{ maxHeight: '265px', scrollBehavior: 'smooth', width: '100%' }}>
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
                        return 'CAMBODIAN';
                      case 'SOFT CURL':
                        return 'VIETNAMESE';
                      case 'OCEAN CURL':
                        return 'FILIPINO';
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
                  const isLastItem = index === savedForLater.length - 1;

                  return (
                    <div
                      key={itemId}
                      className="flex items-start justify-start space-x-3"
                      style={{
                        minHeight: '80px',
                        paddingTop: '20px',
                        paddingBottom: '20px',
                        borderBottom: isLastItem ? 'none' : '1px solid #e5e7eb',
                        width: '100%',
                        flexShrink: 0
                      }}
                    >
                      {/* Thumbnail Container - Matching cart dropdown */}
                      <div className="flex flex-col items-center" style={{ flexShrink: 0, width: '88px', justifyContent: 'flex-start' }}>
                        {/* Item Image */}
                        <div 
                          className="flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                          style={{ width: (item.name === 'GIFT CARD' || item.type === 'gift-card') ? '106px' : '88px', height: (item.name === 'GIFT CARD' || item.type === 'gift-card') ? '106px' : '88px' }}
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
                              marginTop: '6px',
                              lineHeight: '1.1'
                            }}
                            onClick={() => handleEdit(item)}
                          >
                            EDIT IN BUILD-A-WIG
                          </p>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0 flex flex-col relative" style={{ marginLeft: '18px', paddingTop: '6px' }}>
                         <p 
                           className="font-medium truncate cart-product-name"
                           style={{ 
                             fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                             color: '#000000',
                             textTransform: 'uppercase',
                             fontSize: (() => {
                               if (item.name === 'SOFT CURL' || item.name === 'SOFT WAVE') {
                                 return '18px'; // Decreased by 2px for SOFT CURL, SOFT WAVE
                               }
                               return '23px'; // 23px for NOIR, BLANCO, GIFT CARD, OCEAN CURL, BEACH WAVE
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
                             marginTop: (() => {
                               // Check if there's detail text (specifications)
                               const hasSpecs = (item.density && item.density !== '200%') || 
                                              (item.lace && item.lace !== '13X6') || 
                                              (item.texture && item.texture !== 'SILKY') || 
                                              (item.color && item.color !== (item.name === 'BLANCO' ? 'PLATINUM' : 'OFF BLACK')) || 
                                              (item.hairline && item.hairline !== 'NATURAL') || 
                                              (item.styling && item.styling !== 'NONE') || 
                                              (item.addOns && item.addOns.length > 0) ||
                                              (item.capSize && (item.capSize === 'XXS/XS/S' || item.capSize === 'S/M/L')) ||
                                              (item.length && item.length !== '24"');
                               // Gift cards and BLANCO with no detail text should have reduced spacing
                               const isGiftCard = item.name === 'GIFT CARD' || item.type === 'gift-card';
                               const isBlancoNoSpecs = item.name === 'BLANCO' && !hasSpecs;
                               if (isGiftCard) return '-3px'; // Gift cards moved down 1px
                               if (isBlancoNoSpecs) return '-4px';
                               return '-3px';
                             })(),
                             transform: 'translateY(6px)',
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
                         <p 
                           className="font-bold"
                           style={{ 
                             fontFamily: '"Futura PT Book"',
                             color: '#000000',
                             textTransform: 'uppercase',
                             fontSize: '9px',
                             marginTop: '8px',
                             marginRight: '20px',
                             lineHeight: '1.44',
                             wordBreak: 'break-word',
                             maxWidth: 'calc(100% - 20px)'
                           }}
                           dangerouslySetInnerHTML={{
                             __html: (() => {
                               let text = '';
                               const items = [];
                               if (item.capSize && (item.capSize === 'XXS/XS/S' || item.capSize === 'S/M/L')) {
                                 items.push({ type: 'capSize', value: item.capSize, fullName: 'FLEX CAP' });
                               }
                               // Length is already shown in the red text above, so don't duplicate it here
                               if (item.density && item.density !== '200%') items.push({ type: 'density', value: item.density, fullName: `${item.density} density` });
                               if (item.lace && item.lace !== '13X6') items.push({ type: 'lace', value: item.lace, fullName: `${item.lace} lace` });
                               let itemColor = item.color;
                               if (item.name === 'BLANCO') {
                                 const validBlancoColors = ['GOLDEN', 'PLATINUM', 'ASH'];
                                 if (!itemColor || !validBlancoColors.includes(itemColor)) {
                                   itemColor = 'PLATINUM';
                                 }
                               }
                               const defaultColor = item.name === 'BLANCO' ? 'PLATINUM' : 'OFF BLACK';
                               if (itemColor && itemColor !== defaultColor) items.push({ type: 'color', value: itemColor, fullName: itemColor });
                               if (item.hairline && item.hairline !== 'NATURAL') items.push({ type: 'hairline', value: item.hairline, fullName: `${item.hairline} hairline` });
                               const hairStylingOptions = ['BANGS', 'CRIMPS', 'FLAT IRON', 'LAYERS'];
                               if (item.styling && item.styling !== 'NONE' && hairStylingOptions.includes(item.styling) && item.partSelection) {
                                 items.push({ type: 'styling', value: item.styling, partSelection: item.partSelection, fullName: item.styling });
                               }
                               if (item.addOns && item.addOns.length > 0) items.push({ type: 'addOns', value: item.addOns, fullName: item.addOns });
                               items.forEach((itemData, idx) => {
                                 if (idx > 0) {
                                   text += '<br/>';
                                 }
                                 
                                 // Handle addOns specially - each addOn on its own line
                                 if (itemData.type === 'addOns') {
                                   if (Array.isArray(itemData.value)) {
                                     itemData.value.forEach((addOn: string, addOnIndex: number) => {
                                       if (addOnIndex > 0) {
                                         text += '<br/>';
                                       }
                                       // Replace "BLEACH" with "BLEACH KNOTS" and "PLUCK" with "PLUCK KNOTS" for display
                                       const addOnText = addOn.toUpperCase().replace(/BLEACH/g, 'BLEACH KNOTS').replace(/PLUCK/g, 'PLUCK KNOTS');
                                       text += addOnText;
                                     });
                                   } else {
                                     // Handle single string case
                                     const addOnText = String(itemData.value).toUpperCase().replace(/BLEACH/g, 'BLEACH KNOTS').replace(/PLUCK/g, 'PLUCK KNOTS');
                                     text += addOnText;
                                   }
                                 } else {
                                   text += itemData.fullName;
                                 }
                               });
                               return text || '';
                             })()
                           }}
                         />
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
                                 const isBlanco = item.name === 'BLANCO';
                                 let baseMargin = hasSpecs ? '4px' : '2px';
                                 // Move BLANCO cap size up by 3px total (2px + 1px)
                                 if (isBlanco) {
                                   const numValue = parseInt(baseMargin);
                                   return `${Math.max(0, numValue - 3)}px`;
                                 }
                                 return baseMargin;
                               })(),
                               lineHeight: '1.1',
                               marginBottom: '0'
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
                             marginBottom: '12px',
                             marginLeft: '0',
                             marginRight: '0',
                             fontWeight: '600'
                           }}
                           dangerouslySetInnerHTML={formatPrice(itemPrice)}
                         />

                         {/* Quantity Counter */}
                         <div className="flex flex-col items-center justify-center absolute" style={{ right: '8px', top: '0', bottom: '0', marginLeft: 'auto' }}>
                           <span
                             style={{
                               fontFamily: '"Futura PT Medium"',
                               fontSize: '9px',
                               color: '#EB1C24',
                               textTransform: 'uppercase',
                               marginBottom: '6px'
                             }}
                           >
                             + LIST
                           </span>
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
                             >
                               <span style={{ fontFamily: 'Cascadia Code, monospace', fontSize: '8.25px' }}>+</span>
                             </button>
                           </div>
                           <button
                             onClick={() => handleMoveToCart(item)}
                             style={{
                               fontFamily: '"Futura PT Demi"',
                               fontSize: '9px',
                               color: '#909090',
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
                         </div>
                      </div>
                    </div>
                  );
                  })}
                </div>
              </div>

              {/* Subtotal - Fixed at bottom */}
              {savedForLater.length > 0 && (
                <div className="overflow-hidden mt-auto pt-2">
                  <div style={{ 
                    marginTop: '20px', 
                    paddingTop: '20px', 
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
        </div>
      </div>
    </div>
  );
}

export default ShoppingBagPage;

