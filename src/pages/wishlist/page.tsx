import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DynamicCartIcon from '../../components/DynamicCartIcon';
import ConfirmationModal from '../../components/ConfirmationModal';

function WishlistSelection() {
  const navigate = useNavigate();
  const location = useLocation();
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
    localStorage.setItem('isSignedIn', 'false');
    localStorage.removeItem('currentUser');
    // Dispatch custom event to update other pages in same tab
    window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'false' }));
    setShowSignOutConfirm(false);
    // Close mobile menu
    setShowMobileMenu(false);
  };

  return (
    <div className="min-h-screen" style={{ position: 'relative' }}>
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
                </>
              )}
            </div>

            {/* Text in the middle */}
            <p className="text-sm" style={{ fontFamily: '"Futura PT Book"', transform: 'translateY(1px)' }}>
              {showMobileMenu ? (
                <>
                  <span 
                    style={{ fontFamily: '"Futura PT Book"', fontWeight: '400', cursor: 'pointer' }}
                    onClick={() => navigate('/build-a-wig')}
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
                    onClick={() => navigate('/build-a-wig')}
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
            className="border border-black flex flex-col pt-6 pb-4 px-5 mb-2 bg-white/60 backdrop-blur-sm transition-all duration-300 ease-out"
            style={{ 
              borderWidth: '1.3px', 
              minWidth: '100%', 
              maxWidth: 'none', 
              overflow: 'visible',
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              minHeight: showMobileMenu ? '560px' : 'auto'
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
                      ['ABOUT US', 'CONTACT', 'CARE & STORAGE', 'BECOME A MEMBER', 'FAQ', 'PAYMENT + SHIPPING', 'REVIEWS', 'TERMS OF SERVICE'].map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
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
                                  // If UNITS is already expanded, navigate to shop/units page
                                  if (item.label === 'UNITS' && mobileMenuExpandedItems.includes(item.label)) {
                                    navigate('/shop/units');
                                  } else {
                                    // Otherwise, toggle expansion
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
              /* WISHLIST PRODUCT CARDS */
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
            )}
          </div>

          {/* VIEW LISTS BUTTON - Only show when menu is closed */}
          {!showMobileMenu && (
            <>
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
    </div>
  );
}

export default WishlistSelection;
