import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
// @ts-expect-error - Import kept for potential future use
import ThumbBox from '../../../../components/ThumbBox';
import DynamicCartIcon from '../../../../components/DynamicCartIcon';
import LoadingScreen from '../../../../components/base/LoadingScreen';

interface DensityOption {
  id: string;
  name: string;
  percentage: string;
  description: string;
  price: number;
  image: string;
}

function NoirSelection() {
  const navigate = useNavigate();
  
  // Fix for window.REACT_APP_NAVIGATE - use navigate hook instead
  const [selectedDensity, setSelectedDensity] = useState(() => {
    return localStorage.getItem('selectedDensity') || '200%';
  });
  const [selectedCustomCap, setSelectedCustomCap] = useState('M');
  const [selectedFlexibleCap, setSelectedFlexibleCap] = useState('');
  const [showLoading, setShowLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showChartModal, setShowChartModal] = useState(false);
  const [selectedMannequinView, setSelectedMannequinView] = useState(0);
  const [is3DView, setIs3DView] = useState(() => {
    // Check localStorage for saved 3D view preference, default to false (2D view)
    // Use shared key so 3D/2D view preference persists across all product pages
    const saved3DView = localStorage.getItem('product-3d-view');
    return saved3DView === 'true';
  });
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startScrollPosition, setStartScrollPosition] = useState(0);
  const [activeTab, setActiveTab] = useState('DETAILS');
  const [similarProductsScroll, setSimilarProductsScroll] = useState(0);
  const [recentlyViewedScroll, setRecentlyViewedScroll] = useState(0);
  const [isSimilarProductsDragging, setIsSimilarProductsDragging] = useState(false);
  const [isRecentlyViewedDragging, setIsRecentlyViewedDragging] = useState(false);
  const [similarProductsStartX, setSimilarProductsStartX] = useState(0);
  const [recentlyViewedStartX, setRecentlyViewedStartX] = useState(0);
  const [similarProductsStartScroll, setSimilarProductsStartScroll] = useState(0);
  const [recentlyViewedStartScroll, setRecentlyViewedStartScroll] = useState(0);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mobileMenuActiveTab, setMobileMenuActiveTab] = useState('SHOP');
  const [mobileMenuExpandedItems, setMobileMenuExpandedItems] = useState<string[]>([]);
  const [isSignedIn, setIsSignedIn] = useState(false); // Track sign-in status
  
  // Cart count state
  const [cartCount, setCartCount] = useState(() => {
    return parseInt(localStorage.getItem('cartCount') || '0');
  });

  // Add to bag button states
  const [addToBagState, setAddToBagState] = useState<'idle' | 'adding' | 'added'>('idle');

  // Wishlist state
  const [isInWishlist, setIsInWishlist] = useState(false);

  // Mannequin images for noir product
  const mannequinImages = [
    '/assets/natural front.png',  // View 1 (default)
    '/assets/natural left.png',  // View 2 (top thumbnail)
    '/assets/natural right.png'  // View 3 (bottom thumbnail)
  ];

  // Get current mannequin images based on selected view
  const getCurrentImages = () => {
    if (selectedMannequinView === 0) {
      // Default state: natural front in hero
      return {
        hero: mannequinImages[0], // natural front
        top: mannequinImages[1], // natural left
        bottom: mannequinImages[2] // natural right
      };
    } else if (selectedMannequinView === 1) {
      // Top thumbnail clicked: natural left in hero, natural front in top
      return {
        hero: mannequinImages[1], // natural left
        top: mannequinImages[0], // natural front
        bottom: mannequinImages[2] // natural right (stays in bottom)
      };
    } else {
      // Bottom thumbnail clicked: natural right in hero, natural front in bottom
      return {
        hero: mannequinImages[2], // natural right
        top: mannequinImages[1], // natural left (stays in top)
        bottom: mannequinImages[0] // natural front
      };
    }
  };

  const currentImages = getCurrentImages();

  // Get current 3D view images based on selected view
  const get3DViewImages = () => {
    if (selectedMannequinView === 0) {
      // Default state: noir front in hero
      return {
        hero: 'noir front.png',
        top: 'noir right.png',
        bottom: 'noir left.png'
      };
    } else if (selectedMannequinView === 1) {
      // Top thumbnail clicked: noir right in hero, noir front in top
      return {
        hero: 'noir right.png',
        top: 'noir front.png',
        bottom: 'noir left.png'
      };
    } else {
      // Bottom thumbnail clicked: noir left in hero, noir front in bottom
      return {
        hero: 'noir left.png',
        top: 'noir right.png',
        bottom: 'noir front.png'
      };
    }
  };

  const current3DImages = get3DViewImages();

  // Format price with currency
  const formatPrice = (price: number) => {
    return {
      __html: '$' + price.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }) + ' USD'
    };
  };

  // Get total price
  const getTotalPrice = () => {
    const capSize = selectedCustomCap || selectedFlexibleCap || 'M';
    let basePrice = 740; // Default for standard caps (XS, S, M, L)
    if (capSize === 'XXS/XS/S' || capSize === 'S/M/L') {
      basePrice = 780; // Flexible cap options base price is $780
    }
    return basePrice;
  };

  const handleBack = () => {
    navigate('/build-a-wig');
  };

  const handleCustomCapSelect = (capSize: string) => {
    setSelectedCustomCap(capSize);
    setSelectedFlexibleCap(''); // Clear flexible cap selection
  };

  const handleFlexibleCapSelect = (capSize: string) => {
    setSelectedFlexibleCap(capSize);
    setSelectedCustomCap(''); // Clear custom cap selection
  };

  const handleQuantityIncrease = () => {
    setQuantity(prev => Math.min(prev + 1, 10));
  };

  const handleQuantityDecrease = () => {
    setQuantity(prev => Math.max(prev - 1, 1));
  };

  const handleChartClick = () => {
    setShowChartModal(true);
  };

  const handleCloseChart = () => {
    setShowChartModal(false);
  };

  const handleTopThumbnailClick = () => {
    if (selectedMannequinView === 0) {
      setSelectedMannequinView(1);
    } else if (selectedMannequinView === 1) {
      setSelectedMannequinView(0);
    } else {
      setSelectedMannequinView(1);
    }
  };

  const handleBottomThumbnailClick = () => {
    if (selectedMannequinView === 0) {
      setSelectedMannequinView(2);
    } else if (selectedMannequinView === 1) {
      setSelectedMannequinView(2);
    } else {
      setSelectedMannequinView(0);
    }
  };

  const handleToggleWishlist = () => {
    setIsInWishlist(!isInWishlist);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setStartScrollPosition(scrollPosition);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const currentX = e.clientX;
    const diff = currentX - startX;
    const newPosition = startScrollPosition - diff;
    const maxScroll = 0;
    const minScroll = -window.innerWidth * 0.6;
    setScrollPosition(Math.max(minScroll, Math.min(maxScroll, newPosition)));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setStartScrollPosition(scrollPosition);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    const newPosition = startScrollPosition + diff;
    const maxScroll = 0;
    const minScroll = -window.innerWidth * 0.6;
    setScrollPosition(Math.max(minScroll, Math.min(maxScroll, newPosition)));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
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

  const handleAddToBag = async () => {
    if (addToBagState === 'adding' || addToBagState === 'added') return;
    
    setAddToBagState('adding');
    
    try {
      // Simulate adding to bag process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Set default product settings
      localStorage.setItem('selectedLength', '24"');
      localStorage.setItem('selectedLengthPrice', '0');
      localStorage.setItem('selectedDensity', '200%');
      localStorage.setItem('selectedDensityPrice', '0');
      localStorage.setItem('selectedLace', '13X6');
      localStorage.setItem('selectedLacePrice', '0');
      localStorage.setItem('selectedTexture', 'SILKY');
      localStorage.setItem('selectedTexturePrice', '0');
      localStorage.setItem('selectedColor', 'OFF BLACK');
      localStorage.setItem('selectedColorPrice', '0');
      localStorage.setItem('selectedHairline', 'NATURAL');
      localStorage.setItem('selectedHairlinePrice', '0');
      localStorage.setItem('selectedStyling', 'NONE');
      localStorage.setItem('selectedStylingPrice', '0');
      localStorage.setItem('selectedAddOns', '[]');
      localStorage.setItem('selectedAddOnsPrice', '0');
      
      // Use the currently selected cap size
      if (selectedCustomCap) {
        localStorage.setItem('selectedCapSize', selectedCustomCap);
        localStorage.setItem('selectedCapSizePrice', '0'); // Custom cap has no additional price
      } else if (selectedFlexibleCap) {
        localStorage.setItem('selectedCapSize', selectedFlexibleCap);
        localStorage.setItem('selectedCapSizePrice', '60'); // Flexible cap has $60 additional price
      } else {
        // Default to M if no cap size is selected
        localStorage.setItem('selectedCapSize', 'M');
        localStorage.setItem('selectedCapSizePrice', '0');
      }
      
      // Calculate full price based on cap size
      const calculateFullPrice = () => {
        const capSize = selectedCustomCap || selectedFlexibleCap || 'M';
        
        // Calculate base price based on cap size ONLY
        let basePrice = 740; // Default for standard caps (XS, S, M, L)
        if (capSize === 'XXS/XS/S' || capSize === 'S/M/L') {
          basePrice = 780; // Flexible cap options base price is $780
        }
        
        // All other prices are 0 for default selections
        return basePrice;
      };
      
      // Create cart item with actual product details and full calculated price
      const cartItem = {
        id: `noir-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: 'NOIR',
        price: calculateFullPrice(), // Use full calculated price
        quantity: quantity,
        image: '/assets/NOIR/noir-thumb.png',
        capSize: localStorage.getItem('selectedCapSize') || 'M',
        length: localStorage.getItem('selectedLength') || '24"',
        density: localStorage.getItem('selectedDensity') || '200%',
        color: localStorage.getItem('selectedColor') || 'OFF BLACK',
        texture: localStorage.getItem('selectedTexture') || 'SILKY',
        lace: localStorage.getItem('selectedLace') || '13X6',
        hairline: localStorage.getItem('selectedHairline') || 'NATURAL',
        styling: localStorage.getItem('selectedStyling') || 'NONE',
        partSelection: localStorage.getItem('selectedPartSelection') || 'MIDDLE',
        addOns: JSON.parse(localStorage.getItem('selectedAddOns') || '[]')
      };

      // Get existing cart items and add new item at the beginning (newest first)
      const existingCartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      const updatedCartItems = [cartItem, ...existingCartItems];
      localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));

      // Update cart count
      const currentCount = parseInt(localStorage.getItem('cartCount') || '0');
      const newCount = currentCount + quantity; // Add quantity instead of just 1
      localStorage.setItem('cartCount', newCount.toString());
      setCartCount(newCount);
      
      // Save button state and the specific item ID that was added
      setAddToBagState('added');
      localStorage.setItem('addToBagButtonState', 'added');
      localStorage.setItem('lastAddedItemId', cartItem.id); // Track the specific item ID
      
      // Dispatch cart count update event
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: newCount }));
        window.dispatchEvent(new Event('cartUpdated'));
      }, 100);
      
      // Reset button state after 2 seconds
      setTimeout(() => {
        setAddToBagState('idle');
      }, 2000);
      
    } catch (error) {
      console.error('Error in handleAddToBag:', error);
      setAddToBagState('idle'); // Reset to idle on error
    }
  };

  useEffect(() => {
    setShowLoading(false);
  }, []);

  return (
    <>
      {showLoading && <LoadingScreen />}
      
      <div className="min-h-screen" style={{
        position: 'relative'
      }}>
        {/* Fixed Background Layer */}
        <div 
          className="fixed inset-0 -z-10"
          style={{
            backgroundImage: `url('/assets/Marble Floor.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center calc(50% + 25px)',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed'
          }}
        ></div>
        
        {/* Scrollable Content */}
        <div className="relative z-10">
          {/* MAIN CONTENT */}
          <div className="flex flex-col py-5 px-4" style={{ minWidth: '100%', maxWidth: 'none', overflow: 'visible' }}>
            {/* HEADER */}
            <div
              className="border-solid border-black flex justify-center items-center py-3 w-full mb-5 px-5 bg-white/60 backdrop-blur-sm relative"
              style={{ border: '1.3px solid black' }}
            >
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
                      onClick={handleBack} 
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
                )}
              </div>
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
                      onClick={() => navigate('/units/straight')}
                    >
                      STRAIGHT &gt;
                    </span>{' '}
                    <span
                      style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}
                    >
                      NOIR
                    </span>
                  </>
                )}
              </p>
              <div className="gap-5 flex absolute" style={{ right: showMobileMenu ? '14px' : '17px' }}>
                <div style={{ transform: showMobileMenu ? 'translateY(2.7px)' : 'none' }}>
                  <DynamicCartIcon count={cartCount} width={22} height={19} />
                </div>
                <img
                  alt="Menu"
                  width="21"
                  height="21"
                  className="cursor-pointer"
                  src="/assets/menu-icon.svg"
                  onClick={handleMobileMenuToggle}
                />
              </div>
            </div>

            {/* MAIN BUILD AREA */}
            <div
              className="border border-black flex flex-col pt-6 pb-4 px-5 mb-2 bg-white/60 backdrop-blur-sm"
              style={{ 
                borderWidth: '1.3px', 
                minWidth: '100%', 
                maxWidth: 'none', 
                overflow: 'visible',
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                willChange: 'backdrop-filter',
                minHeight: showMobileMenu ? '560px' : 'auto',
                paddingBottom: showMobileMenu ? '16px' : '34px'
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
                                  // If UNITS is already expanded, navigate to products/units page
                                  if (item.label === 'UNITS' && mobileMenuExpandedItems.includes(item.label)) {
                                    navigate('/products/units');
                                  } else {
                                    // Otherwise, toggle expansion
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
                <>
                  {/* WIG PREVIEW */}
                  <div style={{ width: '100%', display: 'flex', alignItems: 'center', flexDirection: 'column', marginBottom: '24px', transform: 'translateY(20px)', overflow: 'visible', minWidth: '100%', maxWidth: 'none' }}>
                    {/* ADD TO WISHLIST & PHOTO COUNT */}
                    <div style={{ position: 'relative', width: '100%', marginBottom: '10px', transform: 'translateY(-31px)', zIndex: 100 }}>
                      {/* ADD TO WISHLIST - Top Left */}
                      <p 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleToggleWishlist();
                        }}
                        style={{ 
                          position: 'absolute', 
                          left: '8px', 
                          top: '2px', 
                          color: '#909090', 
                          fontFamily: '"Futura PT Demi"',
                          fontSize: '10px',
                          fontWeight: '600',
                          margin: '0',
                          cursor: 'pointer',
                          userSelect: 'none',
                          zIndex: 1000,
                          pointerEvents: 'auto'
                        }}
                      >
                        {isInWishlist ? '- REMOVE FROM WISHLIST' : '+ ADD TO WISHLIST'}
                      </p>
                      
                      {/* 2D VIEW/3D VIEW TOGGLE - Top Right */}
                      <div 
                        style={{ 
                          position: 'absolute', 
                          right: '8px', 
                          top: '1px', 
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px',
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          const new3DView = !is3DView;
                          setIs3DView(new3DView);
                          localStorage.setItem('product-3d-view', new3DView.toString());
                        }}
                      >
                        <span 
                          style={{ 
                            color: is3DView ? '#000000' : '#EB1C24', 
                            fontFamily: is3DView ? '"Futura PT Book"' : '"Futura PT Medium"',
                            fontSize: '11px',
                            fontWeight: is3DView ? '400' : '500',
                            margin: '0'
                          }}
                        >
                          2D VIEW
                        </span>
                        <span 
                          style={{ 
                            color: '#000000', 
                            fontFamily: '"Futura PT Book"',
                            fontSize: '11px',
                            fontWeight: '400',
                            margin: '0'
                          }}
                        >
                          /
                        </span>
                        <span 
                          style={{ 
                            color: is3DView ? '#EB1C24' : '#000000', 
                            fontFamily: is3DView ? '"Futura PT Medium"' : '"Futura PT Book"',
                            fontSize: '11px',
                            fontWeight: is3DView ? '500' : '400',
                            margin: '0'
                          }}
                        >
                          3D VIEW
                        </span>
                      </div>
                    </div>
                    
                    {/* MANNEQUIN LAYOUT - Hero on left, Top + Bottom stacked on right */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: is3DView ? '10px' : '5px', marginBottom: '16px', overflow: 'visible', margin: '0 auto', transform: 'translateY(-19px)' }}>
                      {/* Hero Mannequin - Left Side with leaf-brick background */}
                      <div style={{ position: 'relative', overflow: 'visible', flexShrink: '0' }}>
                        <div
                          style={{
                            position: 'relative',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '200px',
                            height: '290px',
                            backgroundImage: `url('/assets/NOIR/${is3DView ? current3DImages.hero : 'leaf-brick.png'}')`,
                            backgroundRepeat: 'no-repeat',
                            overflow: 'visible'
                          }}
                        >
                          <img
                            src={currentImages.hero}
                            alt=""
                            style={{ 
                              position: 'absolute',
                              left: '50%',
                              top: 'calc(50% - 10.601px + 12px)',
                              transform: 'translateX(-50%) translateY(-50%)',
                              zIndex: '10',
                              width: '230px',
                              height: 'auto',
                              maxHeight: '610px',
                              minWidth: '230px',
                              minHeight: 'auto',
                              display: is3DView ? 'none' : 'block'
                            }}
                          />
                        </div>
                      </div>
                      
                      {/* Top and Bottom Mannequins - Right Side */}
                      <div className="flex flex-col" style={{ height: '290px', justifyContent: 'space-between', gap: '10px' }}>
                        {/* Top Mannequin */}
                        <div className="flex-shrink-0 relative">
                          <div
                            className="relative bg-cover bg-center flex items-center justify-center cursor-pointer"
                            style={{
                              width: '100px',
                              height: '140px',
                              backgroundImage: `url('/assets/NOIR/${is3DView ? current3DImages.top : 'leaf-brick.png'}')`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              backgroundRepeat: 'no-repeat'
                            }}
                            onClick={handleTopThumbnailClick}
                          >
                            <img
                              src={currentImages.top}
                              alt=""
                              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
                              style={{ 
                                top: 'calc(50% - 6.1px + 7.2px + 10px - 3px - 6px - 0.6px)',
                                width: '112px',
                                height: '137px',
                                maxWidth: 'none',
                                maxHeight: 'none',
                                minWidth: '112px',
                                minHeight: '137px',
                                display: is3DView ? 'none' : 'block'
                              }}
                            />
                          </div>
                        </div>
                        
                        {/* Bottom Mannequin */}
                        <div className="flex-shrink-0 relative">
                          <div
                            className="relative bg-cover bg-center flex items-center justify-center cursor-pointer"
                            style={{
                              width: '100px',
                              height: '140px',
                              backgroundImage: `url('/assets/NOIR/${is3DView ? current3DImages.bottom : 'leaf-brick.png'}')`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              backgroundRepeat: 'no-repeat'
                            }}
                            onClick={handleBottomThumbnailClick}
                          >
                            <img
                              src={currentImages.bottom}
                              alt=""
                              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
                              style={{ 
                                top: 'calc(50% - 6.1px + 7.2px + 10px - 3px - 6px - 0.6px)',
                                width: '112px',
                                height: '137px',
                                maxWidth: 'none',
                                maxHeight: 'none',
                                minWidth: '112px',
                                minHeight: '137px',
                                display: is3DView ? 'none' : 'block'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                  {/* CHART MODAL - Rendered via Portal */}
                  {showChartModal && createPortal(
                    <div 
                      style={{
                        position: 'fixed',
                        inset: '0',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        backdropFilter: 'blur(3px)',
                        WebkitBackdropFilter: 'blur(3px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10000,
                        margin: '0',
                        padding: '0'
                      }}
                      onClick={handleCloseChart}
                    >
                      <div 
                        style={{
                          position: 'relative',
                          maxWidth: '90vw',
                          maxHeight: '90vh',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: 'auto'
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <img
                          src="/assets/cap-chart.svg"
                          alt="Enlarged Cap Size Chart"
                          style={{ 
                            maxWidth: '100%',
                            maxHeight: '100%',
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            borderRadius: '0',
                            transform: 'scale(1.05)'
                          }}
                        />
                      </div>
                    </div>,
                    document.body
                  )}

                    {/* DISCLAIMER TEXT */}
                    <p
                      className="text-center uppercase mb-2"
                      style={{ 
                        fontFamily: '"Futura PT Book"',
                        fontSize: '11px',
                        fontWeight: '400',
                        transform: 'translateY(-13px)',
                        color: 'black'
                      }}
                    >
                      (2D MODEL IS FOR <span style={{ color: '#909090', fontFamily: '"Futura PT Demi"' }}>VISUAL & AESTHETIC</span> PURPOSES ONLY)
                    </p>

                    {/* PRODUCT NAME */}
                    <p
                      className="text-center text-black mb-2 noir-product-name"
                      style={{ 
                        fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif !important',
                        fontSize: '50px !important',
                        fontWeight: '400 !important',
                        lineHeight: '1.2 !important',
                        margin: '0 !important',
                        padding: '0 !important',
                        display: 'block !important',
                        textAlign: 'center' as const,
                        height: 'auto !important',
                        maxHeight: 'none !important',
                        width: '100% !important',
                        minWidth: 'auto !important',
                        maxWidth: 'none !important',
                        overflow: 'visible !important',
                        whiteSpace: 'nowrap !important',
                        position: 'relative' as const,
                        zIndex: '999 !important',
                        transform: 'translateY(-8px) !important',
                        scale: '1 !important',
                        zoom: '1 !important'
                      }}
                    >
                      NOIR
                    </p>

                    {/* PRODUCT SPECIFICATION */}
                    <p
                      className="text-center text-red-500 uppercase mb-2"
                      style={{ 
                        fontFamily: '"Futura PT Medium"',
                        fontSize: '11px',
                        fontWeight: '500',
                        transform: 'translateY(-8px)'
                      }}
                    >
                      24" RAW CAMBODIAN
                    </p>

                    {/* PRICE */}
                    <p
                      className="text-center text-black mb-1"
                      style={{ 
                        fontFamily: '"Futura PT Medium"',
                        fontSize: '20px',
                        fontWeight: '500',
                        transform: 'translateY(-16px)'
                      }}
                      dangerouslySetInnerHTML={formatPrice(getTotalPrice())}
                    />

                    {/* TAX DISCLAIMER */}
                    <p
                      className="text-center text-black mb-3"
                      style={{ 
                        fontFamily: '"Futura PT Medium"',
                        fontSize: '10px',
                        fontWeight: '500',
                        transform: 'translateY(-21px)'
                      }}
                    >
                      (EXCLUDING SALES TAX)
                    </p>

                    {/* STAR RATINGS */}
                    <div className="flex justify-center mb-4 gap-1" style={{ transform: 'translateY(-27px)' }}>
                      {[...Array(5)].map((_, index) => (
                      <img
                          key={index}
                          src="/assets/NOIR/star-symbol.png"
                          alt="Star Rating"
                        className="w-auto h-auto"
                          style={{ 
                            width: '15px', 
                            height: '15px',
                            filter: 'drop-shadow(0 0 0 1px black)',
                            stroke: '1px black'
                          }}
                        />
                      ))}
                    </div>

                    {/* PAYMENT PLAN */}
                    <p
                      className="text-center uppercase"
                      style={{ 
                        fontFamily: '"Futura PT Demi"',
                        fontSize: '10px',
                        fontWeight: '600',
                        color: '#909090',
                        transform: 'translateY(-34px)'
                      }}
                    >
                      OR 4 PAYMENTS OF <span dangerouslySetInnerHTML={formatPrice(selectedFlexibleCap ? 195 : selectedCustomCap ? Math.ceil(getTotalPrice() / 4) : 185)} /> WITH <span style={{ fontWeight: '600', color: '#EB1C24' }}>KLARNA</span>
                    </p>
                  </div>

                  {/* Back Button - Moved outside centered preview area */}
                    <div className="flex justify-start ml-[calc(50%-131px)]">
                  </div>

                  {/* CAP SIZE SELECTION HEADER */}
                  <div style={{ transform: 'translateY(-10px)' }}>
                    <p
                      className="text-center text-black uppercase mb-4"
                      style={{ 
                        fontFamily: '"Futura PT Demi"',
                        fontSize: '11px',
                        fontWeight: '500',
                        transform: 'translateY(0px)'
                      }}
                    >
                      SELECT CAP SIZE
                    </p>

                  {/* CAP SIZE MEASUREMENTS */}
                  <div className="flex justify-center gap-4 mb-6" style={{ transform: 'translateY(-7px)' }}>
                    <span className="text-red-500 font-bold" style={{ fontSize: '10px', fontFamily: '"Futura PT Medium"' }}>XXS: 19"</span>
                    <span className="text-red-500 font-bold" style={{ fontSize: '10px', fontFamily: '"Futura PT Medium"' }}>XS: 20"</span>
                    <span className="text-red-500 font-bold" style={{ fontSize: '10px', fontFamily: '"Futura PT Medium"' }}>S: 21"</span>
                    <span className="text-red-500 font-bold" style={{ fontSize: '10px', fontFamily: '"Futura PT Medium"' }}>M: 22"</span>
                    <span className="text-red-500 font-bold" style={{ fontSize: '10px', fontFamily: '"Futura PT Medium"' }}>L: 23"</span>
                  </div>

                  {/* CUSTOM CAP SECTION */}
                  <div className="mb-6">
                    <p
                      className="text-center text-black mb-4"
                      style={{ 
                        fontFamily: '"Bohemy", sans-serif',
                        fontSize: '20px',
                        fontWeight: '400',
                        transform: 'translateY(-16px)'
                      }}
                    >
                      custom cap
                    </p>
                    <div className="flex justify-center gap-3" style={{ transform: 'translateY(-24px)' }}>
                      <button 
                        onClick={() => handleCustomCapSelect('XS')}
                        className={`border border-black px-6 py-1 ${selectedCustomCap === 'XS' ? 'text-red-500 bg-white' : 'text-black bg-white hover:bg-gray-50'}`}
                        style={{ 
                          borderWidth: '1.3px',
                          fontFamily: '"Futura PT Medium"',
                          fontWeight: '500',
                          minWidth: '60px',
                          fontSize: '11px'
                        }}
                      >
                        XS
                      </button>
                      <button 
                        onClick={() => handleCustomCapSelect('S')}
                        className={`border border-black px-6 py-1 ${selectedCustomCap === 'S' ? 'text-red-500 bg-white' : 'text-black bg-white hover:bg-gray-50'}`}
                        style={{ 
                          borderWidth: '1.3px',
                          fontFamily: '"Futura PT Medium"',
                          fontWeight: '500',
                          minWidth: '60px',
                          fontSize: '11px'
                        }}
                      >
                        S
                      </button>
                      <button 
                        onClick={() => handleCustomCapSelect('M')}
                        className={`border border-black px-6 py-1 ${selectedCustomCap === 'M' ? 'text-red-500 bg-white' : 'text-black bg-white hover:bg-gray-50'}`}
                        style={{ 
                          borderWidth: '1.3px',
                          fontFamily: '"Futura PT Medium"',
                          fontWeight: '500',
                          minWidth: '60px',
                          fontSize: '11px'
                        }}
                      >
                        M
                      </button>
                      <button 
                        onClick={() => handleCustomCapSelect('L')}
                        className={`border border-black px-6 py-1 ${selectedCustomCap === 'L' ? 'text-red-500 bg-white' : 'text-black bg-white hover:bg-gray-50'}`}
                        style={{ 
                          borderWidth: '1.3px',
                          fontFamily: '"Futura PT Medium"',
                          fontWeight: '500',
                          minWidth: '60px',
                          fontSize: '11px'
                        }}
                      >
                        L
                      </button>
                    </div>
                  </div>

                  {/* FLEXIBLE CAP SECTION */}
                  <div className="mb-6">
                    <p
                      className="text-center text-black mb-4"
                      style={{ 
                        fontFamily: '"Bohemy", sans-serif',
                        fontSize: '20px',
                        fontWeight: '400',
                        transform: 'translateY(-24px)'
                      }}
                    >
                      flexible cap
                    </p>
                    <div className="flex justify-center gap-3" style={{ transform: 'translateY(-32px)' }}>
                      <button 
                        onClick={() => handleFlexibleCapSelect('XXS/XS/S')}
                        className="flexible-cap-button"
                        style={{ 
                          border: '1.3px solid black',
                          paddingTop: '4px',
                          paddingBottom: '4px',
                          paddingLeft: '8px',
                          paddingRight: '8px',
                          fontFamily: '"Futura PT Medium"',
                          fontWeight: '500',
                          width: '108px !important',
                          minWidth: '108px !important',
                          maxWidth: '108px !important',
                          fontSize: '11px',
                          boxSizing: 'border-box' as const,
                          backgroundColor: selectedFlexibleCap === 'XXS/XS/S' ? 'white' : 'white',
                          color: selectedFlexibleCap === 'XXS/XS/S' ? '#EB1C24' : 'black',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textAlign: 'center'
                        }}
                      >
                        XXS/XS/S
                      </button>
                      <button 
                        onClick={() => handleFlexibleCapSelect('S/M/L')}
                        className="flexible-cap-button"
                        style={{ 
                          border: '1.3px solid black',
                          paddingTop: '4px',
                          paddingBottom: '4px',
                          paddingLeft: '8px',
                          paddingRight: '8px',
                          fontFamily: '"Futura PT Medium"',
                          fontWeight: '500',
                          width: '108px !important',
                          minWidth: '108px !important',
                          maxWidth: '108px !important',
                          fontSize: '11px',
                          boxSizing: 'border-box' as const,
                          backgroundColor: selectedFlexibleCap === 'S/M/L' ? 'white' : 'white',
                          color: selectedFlexibleCap === 'S/M/L' ? '#EB1C24' : 'black',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textAlign: 'center'
                        }}
                      >
                        S/M/L
                      </button>
                    </div>
                  </div>

                  {/* QUANTITY SELECTOR */}
                  <div className="flex justify-center mb-6" style={{ transform: 'translateY(-30px)' }}>
                    <button 
                      onClick={handleQuantityDecrease}
                      disabled={quantity <= 1}
                      className={`px-3 py-1 text-red-500 bg-white hover:bg-gray-50 quantity-minus-btn flex items-center justify-center ${quantity <= 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      style={{ 
                        borderTop: '1.3px solid black !important',
                        borderLeft: '1.3px solid black !important', 
                        borderBottom: '1.3px solid black !important',
                        borderRight: 'none !important',
                        height: '27px',
                        minHeight: '27px',
                        maxHeight: '27px',
                        boxSizing: 'border-box',
                        outline: 'none',
                        border: 'none !important',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <span style={{ fontFamily: 'Cascadia Code, monospace', fontSize: '11px' }}>-</span>
                    </button>
                    <div 
                      className="px-4 py-1 text-black bg-white flex items-center justify-center relative quantity-number" 
                      style={{ 
                        borderTop: '1.3px solid black !important',
                        borderBottom: '1.3px solid black !important',
                        borderLeft: 'none !important',
                        borderRight: 'none !important',
                        fontFamily: '"Futura PT Medium"', 
                        fontWeight: '500', 
                        fontSize: '12px', 
                        height: '27px',
                        minHeight: '27px',
                        maxHeight: '27px',
                        boxSizing: 'border-box',
                        border: 'none !important'
                      }}
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-px bg-black"></div>
                      <div className="absolute right-0 top-0 bottom-0 w-px bg-black"></div>
                      {quantity}
                    </div>
                    <button 
                      onClick={handleQuantityIncrease}
                      disabled={quantity >= 10}
                      className={`px-3 py-1 text-red-500 bg-white hover:bg-gray-50 quantity-plus-btn flex items-center justify-center ${quantity >= 10 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      style={{ 
                        borderTop: '1.3px solid black !important',
                        borderRight: '1.3px solid black !important',
                        borderBottom: '1.3px solid black !important',
                        borderLeft: 'none !important',
                        height: '27px',
                        minHeight: '27px',
                        maxHeight: '27px',
                        boxSizing: 'border-box',
                        outline: 'none',
                        border: 'none !important',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <span style={{ fontFamily: 'Cascadia Code, monospace', fontSize: '11px' }}>+</span>
                    </button>
                </div>

                  {/* CAP SIZE CHART IMAGE - Centered below quantity selector */}
                  <div className="flex justify-center mt-4" style={{ transform: 'translateX(4px) translateY(-21px)' }}>
                    <img
                      src="/assets/NOIR/cap-size-chart.png"
                      alt="Cap Size Chart"
                      style={{ maxWidth: '194px', maxHeight: '154px', cursor: 'pointer' }}
                      onClick={handleChartClick}
                    />
                  </div>

                  {/* PRODUCT SHOTS SECTION */}
                  <div className="mt-8 mb-6" style={{ transform: 'translateY(-34px)' }}>
                    {/* Product Images with Drag/Swipe Scroll */}
                    <div className="relative overflow-hidden" style={{ height: '310px', minHeight: '310px', paddingTop: '70px' }}>
                      <div 
                        className="flex transition-transform duration-300 ease-out"
                        style={{ 
                          width: '300%',
                          transform: `translateX(${scrollPosition}px)`,
                          gap: '11px',
                          alignItems: 'center',
                          height: '100%'
                        }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                      >
                        <img
                          src="/assets/NOIR/noir front.png"
                          alt="NOIR Front View"
                          className="object-cover"
                          style={{ width: '18%', height: '290px', maxHeight: '290px', flexShrink: 0, transform: 'translateY(-50px)' }}
                          draggable={false}
                        />
                        <img
                          src="/assets/NOIR/noir left.png"
                          alt="NOIR Left View"
                          className="object-cover"
                          style={{ width: '18%', height: '290px', maxHeight: '290px', flexShrink: 0, transform: 'translateY(-50px)' }}
                          draggable={false}
                        />
                        <img
                          src="/assets/NOIR/noir right.png"
                          alt="NOIR Right View"
                          className="object-cover"
                          style={{ width: '18%', height: '290px', maxHeight: '290px', flexShrink: 0, transform: 'translateY(-50px)' }}
                          draggable={false}
                        />
                      </div>
                      
                      {/* Product Shots Text Overlay */}
                      <div 
                        className="absolute left-1/2 transform -translate-x-1/2"
                        style={{
                          bottom: '-6px',
                          fontFamily: '"Bohemy", sans-serif',
                          fontSize: '43px',
                          color: 'white',
                          textShadow: '1px 1px 0px black, -1px 1px 0px black, 1px -1px 0px black, -1px -1px 0px black, 1px 0px 0px black, -1px 0px 0px black, 0px 1px 0px black, 0px -1px 0px black',
                          fontWeight: '400',
                          textAlign: 'center',
                          zIndex: 10,
                          width: '200px',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        product shots
                      </div>
                    </div>

                    {/* Tabs Section */}
                    <div className="mt-6" style={{ transform: 'translateY(-10px)' }}>
                      {/* Tab Navigation */}
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleTabClick('DETAILS')}
                          className={`px-2 py-1 text-xs font-medium ${activeTab === 'DETAILS' ? 'border-b border-red-500 text-red-500' : 'text-black hover:text-red-500'}`}
                          style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px' }}
                        >
                          DETAILS
                        </button>
                        <button
                          onClick={() => handleTabClick('SHIPPING')}
                          className={`px-2 py-1 text-xs font-medium ${activeTab === 'SHIPPING' ? 'border-b border-red-500 text-red-500' : 'text-black hover:text-red-500'}`}
                          style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px' }}
                        >
                          SHIPPING
                        </button>
                        <button
                          onClick={() => handleTabClick('POLICY')}
                          className={`px-2 py-1 text-xs font-medium ${activeTab === 'POLICY' ? 'border-b border-red-500 text-red-500' : 'text-black hover:text-red-500'}`}
                          style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px' }}
                        >
                          POLICY
                        </button>
                        <button
                          onClick={() => handleTabClick('CARE & STORAGE')}
                          className={`px-2 py-1 text-xs font-medium ${activeTab === 'CARE & STORAGE' ? 'border-b border-red-500 text-red-500' : 'text-black hover:text-red-500'}`}
                          style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px' }}
                        >
                          CARE & STORAGE
                        </button>
                        <button
                          onClick={() => handleTabClick('REVIEWS')}
                          className={`px-2 py-1 text-xs font-medium ${activeTab === 'REVIEWS' ? 'border-b border-red-500 text-red-500' : 'text-black hover:text-red-500'}`}
                          style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px' }}
                        >
                          REVIEWS
                        </button>
                      </div>

                      {/* Tab Content */}
                      <div className="mt-4 space-y-4" style={{ maxWidth: 'none', width: '100%', marginBottom: '-93px' }}>
                        {activeTab === 'DETAILS' && (
                          <>
                            <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap' }}>
                              13X6 ULTRA THIN HD FILM LACE, RAW CAMBODIAN STRAIGHT 200% DENSITY.
                            </p>
                            <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap' }}>
                              HANDMADE UNIT MEASURING 24 INCHES IN LENGTH, OFF BLACK HAIR COLOR.
                            </p>
                            <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap' }}>
                              100% RAW HUMAN HAIR EXTENSIONS USING SINGLE DONOR BUNDLES.
                            </p>
                            <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap' }}>
                              STRETCHY, BREATHABLE CAP WITH REMOVABLE COMBS + ELASTIC BAND FOR A SNUG FIT.
                            </p>
                            <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap' }}>
                              SINGLE STRAND KNOTS ARE LIGHTLY BLEACHED FOR A SEAMLESS, READY TO WEAR APPLICATION.
                            </p>
                            <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap' }}>
                              UNIT COMES CO-WASHED IN ITS NATURAL STATE. CAN BE BLEACHED, DYED OR COLORED.
                            </p>
                            <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap' }}>
                              USE 3D WIG GENERATOR TO CUSTOMIZE UNIT AS PICTURED, FOR MEMBERS ONLY.
                            </p>
                            <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap', marginBottom: '-8px' }}>
                              PROPER VERIFICATION IS REQUIRED TO FINALIZE THE PURCHASE OF ALL UNITS.
                            </p>
                          </>
                        )}
                        
                        {activeTab === 'SHIPPING' && (
                          <>
                            <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap' }}>
                              STANDARD PROCESSING IS 6 TO 8 WEEKS AND UP TO 10 WEEKS FOR CUSTOMIZED UNITS.
                            </p>
                            <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap' }}>
                              EXPRESS PROCESSING IS 4 TO 6 WEEKS WITH RUSH SHIPPING FOR AN ADDITIONAL $120 USD.
                            </p>
                            <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap' }}>
                              CUSTOM COLOR, STYLING & ADD-ONS ARE NOT APPLICABLE FOR EXPRESS PROCESSING.
                            </p>
                            <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap', marginBottom: '-8px' }}>
                              PROCESSING TIME DOES NOT INCLUDE WEEKENDS AND MAJOR US HOLIDAYS.
                            </p>
                          </>
                        )}
                        
                        {activeTab === 'POLICY' && (
                          <>
                            <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap' }}>
                              WE ARE UNABLE TO ACCEPT RETURNS OR REFUNDS AT THIS TIME. ALL SALES ARE FINAL.
                            </p>
                            <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap' }}>
                              WHEN APPLICABLE, WE DO OFFER STORE CREDIT TO GO TOWARDS A FUTURE PURCHASE.
                            </p>
                            <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap', marginBottom: '-8px' }}>
                              IF THERE IS AN ISSUE WITH YOUR ORDER, REACH OUT TO CONTACT@FRONTALSLAYER.COM
                            </p>
                          </>
                        )}
                        
                        {activeTab === 'CARE & STORAGE' && (
                          <>
                            <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap' }}>
                              WASH WITH MILD SHAMPOO, AVOID GETTING CONDITIONER DIRECTLY ON THE LACE.
                            </p>
                            <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap' }}>
                              APPLY LIGHT OILS & SERUMS ONLY TO YOUR RAW HAIR EXTENSIONS WHEN STYLING.
                            </p>
                            <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap' }}>
                              ROUTINELY BRUSH HAIR WITH A PADDLE BRUSH TO AVOID MATTING & SHEDDING.
                            </p>
                            <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap', marginBottom: '-8px' }}>
                              CAREFULLY STORE UNIT INSIDE SATIN LINED DUST BAG TO MINIMIZE DAMAGE, FRIZZ + DEBRIS.
                            </p>
                          </>
                        )}
                        
                        {activeTab === 'REVIEWS' && (
                          <div style={{ textAlign: 'center', padding: '20px 0 0px 0', transform: 'translateY(-12px)' }}>
                            {/* Leave a Review Section */}
                            <div style={{ marginBottom: '40px' }}>
                              <h3 style={{ 
                                fontFamily: '"Futura PT Medium"', 
                                fontSize: '11px', 
                                color: '#EB1C24', 
                                fontWeight: '500',
                                marginBottom: '15px',
                                textTransform: 'uppercase'
                              }}>
                                LEAVE A REVIEW!
                              </h3>
                              
                              {/* Star Rating */}
                              <div className="flex justify-center mb-4 gap-1">
                                {[...Array(5)].map((_, index) => (
                                  <img
                                    key={index}
                                    src="/assets/NOIR/filled-star.png"
                                    alt="Star Rating"
                                    className="w-auto h-auto cursor-pointer"
                                    style={{ 
                                      width: '14px', 
                                      height: '14px',
                                      filter: 'drop-shadow(0 0 0 1px black)',
                                      stroke: '1px black'
                                    }}
                                  />
                                ))}
                              </div>
                              
                              <div style={{ textAlign: 'center' }}>
                                <p style={{ 
                                  fontFamily: '"Futura PT Medium"', 
                                  fontSize: '11px', 
                                  color: 'black',
                                  textTransform: 'uppercase',
                                  margin: '0'
                                }}>
                                  4.97 OUT OF 5 STARS
                                </p>
                                <p style={{ 
                                  fontFamily: '"Futura PT Demi"', 
                                  fontSize: '9px', 
                                  color: '#909090',
                                  textTransform: 'uppercase',
                                  margin: '0',
                                  transform: 'translateY(3px)'
                                }}>
                                  BASED ON 14 VERIFIED REVIEWS
                                </p>
                              </div>
                            </div>
                            
                            {/* Ask a Question Section */}
                            <div style={{ textAlign: 'left' }}>
                              
                              <div style={{ maxWidth: '300px', margin: '0 auto' }}>
                                {/* Name Input */}
                                <div style={{ marginBottom: '15px' }}>
                                  <label style={{ 
                                    fontFamily: '"Futura PT Medium"', 
                                    fontSize: '9px', 
                                    color: 'black',
                                    textTransform: 'uppercase',
                                    display: 'block',
                                    marginBottom: '5px',
                                    transform: 'translateX(4px)'
                                  }}>
                                    NAME:
                                  </label>
                                  <input 
                                    type="text" 
                                    placeholder="ENTER YOUR NAME"
                                    style={{
                                      width: '100%',
                                      padding: '8px',
                                      border: '1px solid black',
                                      borderRadius: '0',
                                      fontFamily: '"Futura PT Medium"',
                                      fontSize: '9px',
                                      outline: 'none',
                                      textIndent: '-1px',
                                      color: '#909090',
                                      textTransform: 'uppercase'
                                    }}
                                  />
                                </div>
                                
                                {/* Email Input */}
                                <div style={{ marginBottom: '15px' }}>
                                  <label style={{ 
                                    fontFamily: '"Futura PT Medium"', 
                                    fontSize: '9px', 
                                    color: 'black',
                                    textTransform: 'uppercase',
                                    display: 'block',
                                    marginBottom: '5px',
                                    transform: 'translateX(4px)'
                                  }}>
                                    EMAIL:
                                  </label>
                                  <input 
                                    type="email" 
                                    placeholder="ENTER YOUR EMAIL"
                                    style={{
                                      width: '100%',
                                      padding: '8px',
                                      border: '1px solid black',
                                      borderRadius: '0',
                                      fontFamily: '"Futura PT Medium"',
                                      fontSize: '9px',
                                      outline: 'none',
                                      textIndent: '-1px',
                                      color: '#909090',
                                      textTransform: 'uppercase'
                                    }}
                                  />
                                </div>
                                
                                {/* Question Text Area */}
                                <div style={{ marginBottom: '20px' }}>
                                  <label style={{ 
                                    fontFamily: '"Futura PT Medium"', 
                                    fontSize: '9px', 
                                    color: 'black',
                                    textTransform: 'uppercase',
                                    display: 'block',
                                    marginBottom: '5px',
                                    transform: 'translateX(4px)'
                                  }}>
                                    QUESTION:
                                  </label>
                                  <textarea 
                                    placeholder="WRITE YOUR QUESTION HERE."
                                    rows={4}
                                    style={{
                                      width: '100%',
                                      padding: '8px',
                                      border: '1px solid black',
                                      borderRadius: '0',
                                      fontFamily: '"Futura PT Medium"',
                                      fontSize: '9px',
                                      outline: 'none',
                                      textIndent: '-1px',
                                      color: '#909090',
                                      textTransform: 'uppercase',
                                      resize: 'vertical'
                                    }}
                                  />
                                </div>
                                
                                {/* Submit Button */}
                                <button style={{
                                  fontFamily: '"Futura PT Medium"',
                                  fontSize: '9px',
                                  color: '#EB1C24',
                                  textTransform: 'uppercase',
                                  fontWeight: '500',
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: '8px 16px',
                                  display: 'block',
                                  margin: '0 auto -70px auto',
                                  transform: 'translateY(-20px)'
                                }}>
                                  SUBMIT INQUIRY
                                </button>
                              </div>
                            </div>
                            
                            {/* Reviews Section */}
                            <div style={{ marginTop: '40px', textAlign: 'left', transform: 'translateY(25px)' }}>
                              {/* Sort Option */}
                              <div style={{ marginBottom: '20px' }}>
                                <p style={{ 
                                  fontFamily: '"Futura PT Medium"', 
                                  fontSize: '8px', 
                                  color: 'black',
                                  textTransform: 'uppercase',
                                  margin: '0',
                                  display: 'inline-block'
                                }}>
                                  MOST RECENT ↓
                                </p>
                              </div>
                              
                              {/* Individual Reviews */}
                              <div style={{ marginBottom: '30px' }}>
                                {/* Review 1 - Amy */}
                                <div style={{ marginBottom: '25px', paddingBottom: '20px', borderBottom: '1px solid #e0e0e0' }}>
                                  <div style={{ marginBottom: '5px' }}>
                                    <img
                                      src="/assets/NOIR/client-photo.png"
                                      alt="Client Photo"
                                      style={{ 
                                        width: '20px', 
                                        height: '20px',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        marginBottom: '5px'
                                      }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <p style={{ 
                                          fontFamily: '"Futura PT Medium"', 
                                          fontSize: '8px', 
                                          color: 'black',
                                          textTransform: 'uppercase',
                                          margin: '0',
                                          fontWeight: '500'
                                        }}>
                                          AMY - NJ
                                        </p>
                                        <span style={{ 
                                          fontFamily: '"Futura PT Medium"', 
                                          fontSize: '7px', 
                                          color: '#EB1C24',
                                          textTransform: 'uppercase'
                                        }}>
                                          (VERIFIED)
                                        </span>
                                      </div>
                                      <p style={{ 
                                        fontFamily: '"Futura PT Medium"', 
                                        fontSize: '8px', 
                                        color: 'black',
                                        margin: '0'
                                      }}>
                                        01/24/23
                                      </p>
                                    </div>
                                  </div>
                                  
                                  {/* Stars */}
                                  <div className="flex gap-1 mb-2">
                                    {[...Array(5)].map((_, index) => (
                                      <img
                                        key={index}
                                        src="/assets/NOIR/filled-star.png"
                                        alt="Star Rating"
                                        style={{ 
                                          width: '12px', 
                                          height: '12px',
                                          filter: 'drop-shadow(0 0 0 1px black)',
                                          stroke: '1px black'
                                        }}
                                      />
                                    ))}
                                  </div>
                                  
                                  <h4 style={{ 
                                    fontFamily: '"Futura PT Medium"', 
                                    fontSize: '8px', 
                                    color: '#EB1C24',
                                    textTransform: 'uppercase',
                                    margin: '0 0 8px 0',
                                    fontWeight: '500'
                                  }}>
                                    GREAT QUALITY
                                  </h4>
                                  
                                  <p style={{ 
                                    fontFamily: '"Futura PT Medium"', 
                                    fontSize: '7px', 
                                    color: 'black',
                                    margin: '0',
                                    lineHeight: '1.4'
                                  }}>
                                    WIG SHIPPED QUICKER THAN I ANTICIPATED WHICH WAS GREAT! ALSO OBSESSED WITH THE QUALITY OF THIS HAIR. 10/10 WILL BE PURCHASING ANOTHER UNIT FROM HERE AGAIN.
                                  </p>
                                </div>
                                
                                {/* Review 2 - Greta */}
                                <div style={{ marginBottom: '25px' }}>
                                  <div style={{ marginBottom: '5px' }}>
                                    <img
                                      src="/assets/NOIR/client-photo.png"
                                      alt="Client Photo"
                                      style={{ 
                                        width: '20px', 
                                        height: '20px',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        marginBottom: '5px'
                                      }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <p style={{ 
                                          fontFamily: '"Futura PT Medium"', 
                                          fontSize: '8px', 
                                          color: 'black',
                                          textTransform: 'uppercase',
                                          margin: '0',
                                          fontWeight: '500'
                                        }}>
                                          GRETA - TX
                                        </p>
                                        <span style={{ 
                                          fontFamily: '"Futura PT Medium"', 
                                          fontSize: '7px', 
                                          color: '#EB1C24',
                                          textTransform: 'uppercase'
                                        }}>
                                          (VERIFIED)
                                        </span>
                                      </div>
                                      <p style={{ 
                                        fontFamily: '"Futura PT Medium"', 
                                        fontSize: '8px', 
                                        color: 'black',
                                        margin: '0'
                                      }}>
                                        01/21/23
                                      </p>
                                    </div>
                                  </div>
                                  
                                  {/* Stars */}
                                  <div className="flex gap-1 mb-2">
                                    {[...Array(5)].map((_, index) => (
                                      <img
                                        key={index}
                                        src="/assets/NOIR/filled-star.png"
                                        alt="Star Rating"
                                        style={{ 
                                          width: '12px', 
                                          height: '12px',
                                          filter: 'drop-shadow(0 0 0 1px black)',
                                          stroke: '1px black'
                                        }}
                                      />
                                    ))}
                                  </div>
                                  
                                  <h4 style={{ 
                                    fontFamily: '"Futura PT Medium"', 
                                    fontSize: '8px', 
                                    color: '#EB1C24',
                                    textTransform: 'uppercase',
                                    margin: '0 0 8px 0',
                                    fontWeight: '500'
                                  }}>
                                    VERY VERSATILE
                                  </h4>
                                  
                                  <p style={{ 
                                    fontFamily: '"Futura PT Medium"', 
                                    fontSize: '7px', 
                                    color: 'black',
                                    margin: '0',
                                    lineHeight: '1.4'
                                  }}>
                                    I AM IN LOVE WITH THIS UNIT! VERSATILE & MAKES IT EASY TO SWITCH UP MY STYLE.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  </div>
                </>
              )}
            </div>
          </div>

          {/* ADD TO BAG BUTTON */}
          <div className="px-0 md:px-0" style={{ marginTop: '2px' }}>
            <button
              onClick={handleAddToBag}
              disabled={addToBagState === 'adding'}
              className={`border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold ${
                addToBagState === 'adding' ? 'bg-white cursor-not-allowed' : 
                addToBagState === 'added' ? 'bg-white cursor-pointer' : 'bg-white cursor-pointer hover:bg-gray-50'
              }`}
              style={{ 
                borderWidth: '1.3px', 
                color: '#EB1C24',
                fontFamily: '"Futura PT Medium"',
                backgroundColor: '#FFFFFF',
                boxSizing: 'border-box'
              }}
            >
              {addToBagState === 'idle' && 'ADD TO BAG'}
              {addToBagState === 'adding' && 'ADDING...'}
              {addToBagState === 'added' && (
                <span className="flex items-center justify-center gap-1">
                  <img src="/assets/check.svg" alt="Check" width="9" height="9" />
                  <span style={{ color: '#909090' }}>IN THE BAG</span>
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default NoirSelection;
