
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ThumbBox from '../../../components/ThumbBox';
import DynamicCartIcon from '../../../components/DynamicCartIcon';
import LoadingScreen from '../../../components/base/LoadingScreen';
import ConfirmationModal from '../../../components/ConfirmationModal';

interface LaceOption {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

function LaceSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedLace, setSelectedLace] = useState(() => {
    const pathname = window.location.pathname;
    const isOnEditRoute = pathname.includes('/edit');
    const isOnCustomizeRoute = pathname.includes('/noir/customize') ||
                               pathname.includes('/blanco/customize') ||
                               pathname.includes('/soft-wave/customize') ||
                               pathname.includes('/soft-curl/customize') ||
                               pathname.includes('/ocean-curl/customize') ||
                               pathname.includes('/beach-wave/customize');
    
    // CRITICAL: Check editSelected* keys first when in edit mode
    if (isOnEditRoute) {
      const editSelectedLace = localStorage.getItem('editSelectedLace');
      if (editSelectedLace) {
        return editSelectedLace;
      }
      // Fallback to editingCartItem
      const editingCartItem = localStorage.getItem('editingCartItem');
      if (editingCartItem) {
        try {
          const item = JSON.parse(editingCartItem);
          if (item.lace) {
            return item.lace;
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
    
    // CRITICAL: Check customizeSelected* keys when in customize mode
    if (isOnCustomizeRoute) {
      const customizeSelectedLace = localStorage.getItem('customizeSelectedLace');
      if (customizeSelectedLace) {
        return customizeSelectedLace;
      }
    }
    
    // Main mode: use selected* keys
    return localStorage.getItem('selectedLace') || '13X6';
  });
  const [selectedView, setSelectedView] = useState(1); // Changed from 0 to 1 (middle image)
  const [showLoading, setShowLoading] = useState(true);
  
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
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  
  // Cart count state
  const [cartCount, setCartCount] = useState(() => {
    return parseInt(localStorage.getItem('cartCount') || '0');
  });

  // Listen for cart count changes
  useEffect(() => {
    const handleCartCountUpdate = (event: CustomEvent) => {
      setCartCount(event.detail);
    };

    const handleStorageChange = () => {
      const newCartCount = parseInt(localStorage.getItem('cartCount') || '0');
      setCartCount(newCartCount);
    };

    window.addEventListener('cartCountUpdated', handleCartCountUpdate as EventListener);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);

    return () => {
      window.removeEventListener('cartCountUpdated', handleCartCountUpdate as EventListener);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);

  // Get wig views based on selected hairline from localStorage
  const getWigViews = () => {
    const pathname = window.location.pathname;
    // Check if we're in product-specific customize modes
    if (pathname.includes('/blanco/customize') || pathname.includes('/blanco/edit')) {
      return [
        '/assets/2D BLANCO LEFT.png',
        '/assets/2D BLANCO FRONT.png',
        '/assets/2D BLANCO RIGHT.png'
      ];
    }
    if (pathname.includes('/soft-wave/customize') || pathname.includes('/soft-wave/edit') ||
        pathname.includes('/beach-wave/customize') || pathname.includes('/beach-wave/edit')) {
      return [
        '/assets/2D WAVY LEFT.png',
        '/assets/2D WAVY FRONT.png',
        '/assets/2D WAVY RIGHT.png'
      ];
    }
    if (pathname.includes('/soft-curl/customize') || pathname.includes('/soft-curl/edit') ||
        pathname.includes('/ocean-curl/customize') || pathname.includes('/ocean-curl/edit')) {
      return [
        '/assets/2D CURLY LEFT.png',
        '/assets/2D CURLY FRONT.png',
        '/assets/2D CURLY RIGHT.png'
      ];
    }
    
    const selectedHairline = localStorage.getItem('selectedHairline') || 'NATURAL';
    const hasPeak = selectedHairline.includes('PEAK');
    const hasLagos = selectedHairline.includes('LAGOS');
    
    if (hasPeak) {
      return [
        '/assets/peak left.png',
        '/assets/peak front.png', 
        '/assets/peak right.png'
      ];
    } else if (hasLagos) {
      return [
        '/assets/lagos left.png',
        '/assets/lagos front.png',
        '/assets/lagos right.png'
      ];
    } else {
      // Default to natural images
      return [
        '/assets/natural left.png',
        '/assets/natural front.png',
        '/assets/natural right.png'
      ];
    }
  };

  const wigViews = getWigViews();

  // Lace options - Updated with exact order and pricing (13X6 is default)
  const isBlancoRoute = window.location.pathname.includes('/blanco/customize') || window.location.pathname.includes('/blanco/edit');
  const laceImage = isBlancoRoute ? '/assets/lace-blanco.png' : 'https://hair-saloon-one.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fimage4.ea33a249.png&w=256&q=75';
  
  const laceOptions: LaceOption[] = [
    {
      id: '2X6',
      name: '2X6',
      description: 'Small lace area',
      price: -40, // Less than default, discount
      image: laceImage,
    },
    {
      id: '4X4',
      name: '4X4',
      description: 'Square closure',
      price: -40, // Less than default, discount
      image: laceImage,
    },
    {
      id: '5X5',
      name: '5X5',
      description: 'Medium closure',
      price: -20, // Less than default, discount
      image: laceImage,
    },
    {
      id: '6X6',
      name: '6X6',
      description: 'Large closure',
      price: 60, // Additional cost for 6X6 lace
      image: laceImage,
    },
    {
      id: '9X6',
      name: '9X6',
      description: 'Wide frontal',
      price: 80, // Additional cost for 9X6 lace
      image: laceImage,
    },
    {
      id: '7X7',
      name: '7X7',
      description: 'Extra large closure',
      price: 100, // Additional cost for 7X7 lace
      image: laceImage,
    },
    {
      id: '13X4',
      name: '13X4',
      description: 'Standard frontal',
      price: -20, // Less than default
      image: laceImage,
    },
    {
      id: '13X6',
      name: '13X6',
      description: 'Deep frontal',
      price: 0, // Default option - included in base price
      image: laceImage,
    },
    {
      id: '360',
      name: '360',
      description: '360 degree lace',
      price: 160, // Additional cost for 360 lace
      image: laceImage,
    },
    {
      id: 'FULL',
      name: 'FULL',
      description: 'Full lace wig',
      price: 240, // Additional cost for full lace
      image: laceImage,
    },
  ];

  const handleLaceSelect = (laceId: string) => {
    setSelectedLace(laceId);
  };

  const handleBack = () => {
    const pathname = location.pathname;
    
    // CRITICAL: Only save selections when on product-specific edit/customize sub-page routes
    // Check if we're on a product-specific edit or customize sub-page route
    const isOnProductSpecificEditRoute = pathname.startsWith('/build-a-wig/noir/edit/') ||
                                         pathname.startsWith('/build-a-wig/blanco/edit/') ||
                                         pathname.startsWith('/build-a-wig/soft-wave/edit/') ||
                                         pathname.startsWith('/build-a-wig/soft-curl/edit/') ||
                                         pathname.startsWith('/build-a-wig/ocean-curl/edit/') ||
                                         pathname.startsWith('/build-a-wig/beach-wave/edit/') ||
                                         pathname.startsWith('/build-a-wig/edit/');
    
    const isOnProductSpecificCustomizeRoute = pathname.startsWith('/build-a-wig/noir/customize/') ||
                                              pathname.startsWith('/build-a-wig/blanco/customize/') ||
                                              pathname.startsWith('/build-a-wig/soft-wave/customize/') ||
                                              pathname.startsWith('/build-a-wig/soft-curl/customize/') ||
                                              pathname.startsWith('/build-a-wig/ocean-curl/customize/') ||
                                              pathname.startsWith('/build-a-wig/beach-wave/customize/');
    
    // Only save if we're on a product-specific edit or customize sub-page route
    if (isOnProductSpecificEditRoute || isOnProductSpecificCustomizeRoute) {
      // Calculate and save price
      const price = getSelectedPrice().toString();
      
      // Always save with 'selected' prefix
      localStorage.setItem('selectedLace', selectedLace);
      localStorage.setItem('selectedLacePrice', price);
      
      // Also save with 'editSelected' prefix in edit mode
      if (isOnProductSpecificEditRoute) {
        localStorage.setItem('editSelectedLace', selectedLace);
        localStorage.setItem('editSelectedLacePrice', price);
      }
      
      // Also save with 'customizeSelected' prefix in customize mode
      if (isOnProductSpecificCustomizeRoute) {
        localStorage.setItem('customizeSelectedLace', selectedLace);
        localStorage.setItem('customizeSelectedLacePrice', price);
      }
      
      // Set flag to indicate we're returning from a sub-page
      sessionStorage.setItem('comingFromSubPage', 'true');
      
      // Dispatch custom event to notify main page of changes
      window.dispatchEvent(new CustomEvent('customStorageChange'));
    }
    
    // Determine return route
    let returnRoute = '/build-a-wig'; // Default
    
    // Check for edit routes first, then customize, then main
    if (pathname.includes('/blanco/edit/')) {
      returnRoute = '/build-a-wig/blanco/edit';
    } else if (pathname.includes('/blanco/customize/')) {
      returnRoute = '/build-a-wig/blanco/customize';
    } else if (pathname.includes('/blanco/')) {
      returnRoute = '/build-a-wig/blanco';
    } else if (pathname.includes('/soft-wave/edit/')) {
      returnRoute = '/build-a-wig/soft-wave/edit';
    } else if (pathname.includes('/soft-wave/customize/')) {
      returnRoute = '/build-a-wig/soft-wave/customize';
    } else if (pathname.includes('/soft-wave/')) {
      returnRoute = '/build-a-wig/soft-wave';
    } else if (pathname.includes('/soft-curl/edit/')) {
      returnRoute = '/build-a-wig/soft-curl/edit';
    } else if (pathname.includes('/soft-curl/customize/')) {
      returnRoute = '/build-a-wig/soft-curl/customize';
    } else if (pathname.includes('/soft-curl/')) {
      returnRoute = '/build-a-wig/soft-curl';
    } else if (pathname.includes('/beach-wave/edit/')) {
      returnRoute = '/build-a-wig/beach-wave/edit';
    } else if (pathname.includes('/beach-wave/customize/')) {
      returnRoute = '/build-a-wig/beach-wave/customize';
    } else if (pathname.includes('/beach-wave/')) {
      returnRoute = '/build-a-wig/beach-wave';
    } else if (pathname.includes('/ocean-curl/edit/')) {
      returnRoute = '/build-a-wig/ocean-curl/edit';
    } else if (pathname.includes('/ocean-curl/customize/')) {
      returnRoute = '/build-a-wig/ocean-curl/customize';
    } else if (pathname.includes('/ocean-curl/')) {
      returnRoute = '/build-a-wig/ocean-curl';
    } else if (pathname.includes('/noir/edit/')) {
      returnRoute = '/build-a-wig/noir/edit';
    } else if (pathname.includes('/noir/customize/')) {
      returnRoute = '/build-a-wig/noir/customize';
    } else if (pathname.includes('/noir/')) {
      returnRoute = '/build-a-wig/noir';
    }
    
    navigate(returnRoute);
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

  // Mobile menu handlers
  const handleMobileMenuToggle = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const handleCloseMobileMenu = () => {
    setShowMobileMenu(false);
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

  const handleConfirmSelection = () => {
    try {
      const price = getSelectedPrice().toString();
      
      // Check if we're in edit mode or customize mode for ALL products
      const pathname = window.location.pathname;
      const isEditMode = localStorage.getItem('editingCartItem') !== null || 
                         pathname.includes('/noir/edit') ||
                         pathname.includes('/blanco/edit') ||
                         pathname.includes('/soft-wave/edit') ||
                         pathname.includes('/soft-curl/edit') ||
                         pathname.includes('/ocean-curl/edit') ||
                         pathname.includes('/beach-wave/edit');
      
      // Check if we're in customize mode for ALL products
      const isCustomizeMode = pathname.includes('/noir/customize') ||
                              pathname.includes('/blanco/customize') ||
                              pathname.includes('/soft-wave/customize') ||
                              pathname.includes('/soft-curl/customize') ||
                              pathname.includes('/ocean-curl/customize') ||
                              pathname.includes('/beach-wave/customize');
      
      // Get the source route from sessionStorage (set by main page when navigating to sub-page)
      // Also check if we're in edit or customize mode as fallback
      let sourceRoute = sessionStorage.getItem('sourceRoute');
      
      // Fallback: check localStorage for edit mode or customize mode
      if (!sourceRoute) {
        const editingCartItem = localStorage.getItem('editingCartItem');
        const selectedCapSize = localStorage.getItem('selectedCapSize');
        
        if (editingCartItem || isEditMode) {
          // Determine product-specific edit route from pathname
          if (pathname.includes('/blanco/edit')) {
            sourceRoute = '/build-a-wig/blanco/edit';
          } else if (pathname.includes('/soft-wave/edit')) {
            sourceRoute = '/build-a-wig/soft-wave/edit';
          } else if (pathname.includes('/soft-curl/edit')) {
            sourceRoute = '/build-a-wig/soft-curl/edit';
          } else if (pathname.includes('/ocean-curl/edit')) {
            sourceRoute = '/build-a-wig/ocean-curl/edit';
          } else if (pathname.includes('/beach-wave/edit')) {
            sourceRoute = '/build-a-wig/beach-wave/edit';
          } else if (pathname.includes('/noir/edit')) {
            sourceRoute = '/build-a-wig/noir/edit';
          } else {
            sourceRoute = '/build-a-wig/edit'; // Fallback
          }
          console.log('Lace page - No sourceRoute found, detected edit mode from localStorage/pathname');
        } else if (selectedCapSize || isCustomizeMode) {
          // Determine product-specific customize route from pathname
          if (pathname.includes('/blanco/customize')) {
            sourceRoute = '/build-a-wig/blanco/customize';
          } else if (pathname.includes('/soft-wave/customize')) {
            sourceRoute = '/build-a-wig/soft-wave/customize';
          } else if (pathname.includes('/soft-curl/customize')) {
            sourceRoute = '/build-a-wig/soft-curl/customize';
          } else if (pathname.includes('/ocean-curl/customize')) {
            sourceRoute = '/build-a-wig/ocean-curl/customize';
          } else if (pathname.includes('/beach-wave/customize')) {
            sourceRoute = '/build-a-wig/beach-wave/customize';
          } else if (pathname.includes('/noir/customize')) {
            sourceRoute = '/build-a-wig/noir/customize';
          } else {
            sourceRoute = '/build-a-wig'; // Fallback
          }
          console.log('Lace page - No sourceRoute found, detected customize mode from localStorage/pathname:', sourceRoute);
        } else {
          sourceRoute = '/build-a-wig';
          console.log('Lace page - No sourceRoute found, defaulting to main page');
        }
      }
      
      // Always save with 'selected' prefix
      localStorage.setItem('selectedLace', selectedLace);
      localStorage.setItem('selectedLacePrice', price);
      
      // Also save with 'editSelected' prefix in edit mode
      if (isEditMode) {
        localStorage.setItem('editSelectedLace', selectedLace);
        localStorage.setItem('editSelectedLacePrice', price);
      }
      
      // Also save with 'customizeSelected' prefix in customize mode
      if (isCustomizeMode) {
        localStorage.setItem('customizeSelectedLace', selectedLace);
        localStorage.setItem('customizeSelectedLacePrice', price);
      }
      
      // Determine the correct route to navigate back to based on current pathname
      let returnRoute = '/build-a-wig'; // Default
      if (location.pathname.startsWith('/build-a-wig/noir/edit/')) {
        returnRoute = '/build-a-wig/noir/edit';
      } else if (location.pathname.startsWith('/build-a-wig/blanco/edit/')) {
        returnRoute = '/build-a-wig/blanco/edit';
      } else if (location.pathname.startsWith('/build-a-wig/soft-wave/edit/')) {
        returnRoute = '/build-a-wig/soft-wave/edit';
      } else if (location.pathname.startsWith('/build-a-wig/soft-curl/edit/')) {
        returnRoute = '/build-a-wig/soft-curl/edit';
      } else if (location.pathname.startsWith('/build-a-wig/edit/')) {
        returnRoute = '/build-a-wig/edit';
      } else if (location.pathname.startsWith('/build-a-wig/noir/customize/')) {
        returnRoute = '/build-a-wig/noir/customize';
      } else if (sourceRoute) {
        returnRoute = sourceRoute;
      }
      
      console.log('Lace page - Navigating back to route:', returnRoute);
      
      // Set flag to indicate we're returning from a sub-page
      sessionStorage.setItem('comingFromSubPage', 'true');
      
      // Dispatch custom event to notify main page of changes
      window.dispatchEvent(new CustomEvent('customStorageChange'));
      
      navigate(returnRoute);
    } catch (e) {
      console.error('Unable to save selected lace to localStorage', e);
    }
  };

  const getSelectedPrice = () => {
    const selected = laceOptions.find((option) => option.id === selectedLace);
    return selected ? selected.price : 0;
  };

  // Get dynamic lace note text based on selected lace option
  const getLaceNoteText = () => {
    const currentLace = selectedLace;
    
    // For 2x6 lace option
    if (currentLace === '2X6') {
      return (
        <>
          GLUELESS CLOSURE UNIT.<br />
          2" EAR TO EAR + 6" FRONT TO BACK.
        </>
      );
    }
    
    // For 4x4 lace option
    if (currentLace === '4X4') {
      return (
        <>
          GLUELESS CLOSURE UNIT.<br />
          4" EAR TO EAR + 4" FRONT TO BACK.
        </>
      );
    }
    
    // For 5x5 lace option
    if (currentLace === '5X5') {
      return (
        <>
          GLUELESS CLOSURE UNIT.<br />
          5" EAR TO EAR + 5" FRONT TO BACK.
        </>
      );
    }
    
    // For 6x6 lace option
    if (currentLace === '6X6') {
      return (
        <>
          GLUELESS CLOSURE UNIT.<br />
          6" EAR TO EAR + 6" FRONT TO BACK.
        </>
      );
    }
    
    // For 9x6 lace option
    if (currentLace === '9X6') {
      return (
        <>
          GLUELESS CLOSURE UNIT.<br />
          9" EAR TO EAR + 6" FRONT TO BACK.
        </>
      );
    }
    
    // For 7x7 lace option
    if (currentLace === '7X7') {
      return (
        <>
          GLUELESS CLOSURE UNIT.<br />
          7" EAR TO EAR + 7" FRONT TO BACK.
        </>
      );
    }
    
    // For 13x4 lace option
    if (currentLace === '13X4') {
      return (
        <>
          GLUELESS FRONTAL UNIT.<br />
          13" EAR TO EAR + 4" FRONT TO BACK.
        </>
      );
    }
    
    // For 13x6 lace option
    if (currentLace === '13X6') {
      return (
        <>
          GLUELESS FRONTAL UNIT.<br />
          13" EAR TO EAR + 6" FRONT TO BACK.
        </>
      );
    }
    
    // For 360 lace option
    if (currentLace === '360') {
      return (
        <>
          FRONTAL UNIT WITH LACE AROUND THE PERIMETER.<br />
          EXPECT AN ADDITIONAL WEEK OF PROCESSING TIME.
        </>
      );
    }
    
    // For full lace option
    if (currentLace === 'FULL') {
      return (
        <>
          HD LACE THROUGHOUT THE ENTIRE CAP.<br />
          EXPECT AN ADDITIONAL WEEK OF PROCESSING TIME.
        </>
      );
    }
    
    // For other lace options, return default text
    return 'PLEASE NOTE: EACH CUSTOM UNIT IS MADE TO ORDER. WE ENSURE ALL DETAILS ARE ACCURATE + PRECISE. EXPECT 6 - 8 WEEKS OF PROCESSING TIME FOR THIS UNIT.';
  };

  const totalPrice = getSelectedPrice();

  useEffect(() => {
    // Hide loading screen after 2 seconds
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
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
            backgroundImage: `url('/assets/marble-half.png')`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'repeat',
            backgroundAttachment: 'fixed'
          }}
        ></div>
        
        {/* Scrollable Content */}
        <div className="relative z-10">
          {/* MAIN CONTENT */}
          <div className="flex flex-col py-5 px-4">
        {/* HEADER */}
        <div
          className="border-solid border-black flex justify-center items-center py-3 w-full mb-5 px-5 bg-white/60 backdrop-blur-sm relative"
          style={{ border: '1.3px solid black' }}
        >
          <div className="flex gap-5 absolute left-4">
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
            <button className="cursor-pointer" style={{ transform: 'translateX(-2px)' }}>
              <img
                alt="Search icon"
                width="16"
                height="15"
                src="/assets/search-icon.svg"
              />
            </button>
          </div>
            <p className="text-sm" style={{ fontFamily: '"Futura PT Book"', transform: 'translateY(1px)' }}>
            <span 
                style={{ fontFamily: '"Futura PT Book"', fontWeight: '400', cursor: 'pointer' }}
              onClick={() => {
                const pathname = location.pathname;
                if (pathname.includes('/noir/')) navigate('/build-a-wig/noir');
                else if (pathname.includes('/blanco/')) navigate('/build-a-wig/blanco');
                else if (pathname.includes('/soft-wave/')) navigate('/build-a-wig/soft-wave');
                else if (pathname.includes('/soft-curl/')) navigate('/build-a-wig/soft-curl');
                else navigate('/build-a-wig');
              }}
            >
              BUILD-A-WIG &gt;
            </span>{' '}
              <span
                style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500', cursor: 'pointer' }}
                onClick={() => {
                  const pathname = location.pathname;
                  if (pathname.includes('/blanco/customize') || pathname.includes('/blanco/edit')) navigate('/straight/blanco');
                  else if (pathname.includes('/soft-wave/customize') || pathname.includes('/soft-wave/edit')) navigate('/wavy/soft-wave');
                  else if (pathname.includes('/soft-curl/customize') || pathname.includes('/soft-curl/edit')) navigate('/curly/soft-curl');
                  else if (pathname.includes('/beach-wave/customize') || pathname.includes('/beach-wave/edit')) navigate('/wavy/beach-wave');
                  else if (pathname.includes('/ocean-curl/customize') || pathname.includes('/ocean-curl/edit')) navigate('/curly/ocean-curl');
                  else navigate('/straight/noir');
                }}
              >
                {(() => {
                  const pathname = location.pathname;
                  if (pathname.includes('/blanco/customize') || pathname.includes('/blanco/edit')) return 'BLANCO';
                  if (pathname.includes('/soft-wave/customize') || pathname.includes('/soft-wave/edit')) return 'SOFT WAVE';
                  if (pathname.includes('/soft-curl/customize') || pathname.includes('/soft-curl/edit')) return 'SOFT CURL';
                  if (pathname.includes('/beach-wave/customize') || pathname.includes('/beach-wave/edit')) return 'BEACH WAVE';
                  if (pathname.includes('/ocean-curl/customize') || pathname.includes('/ocean-curl/edit')) return 'OCEAN CURL';
                  return 'NOIR';
                })()}
              </span>
          </p>
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
          className="border border-black flex flex-col pt-6 pb-4 mb-2 bg-white/60 backdrop-blur-sm transition-all duration-300 ease-out"
          style={{ 
            borderWidth: '1.3px',
            paddingLeft: (() => {
              const pathname = window.location.pathname;
              if (pathname.includes('/soft-wave') || pathname.includes('/soft-curl')) {
                return '10px'; // Reduced padding for SOFT WAVE/CURL
              }
              return '20px'; // Default padding (px-5 = 1.25rem = 20px)
            })(),
            paddingRight: (() => {
              const pathname = window.location.pathname;
              if (pathname.includes('/soft-wave') || pathname.includes('/soft-curl')) {
                return '10px'; // Reduced padding for SOFT WAVE/CURL
              }
              return '20px'; // Default padding (px-5 = 1.25rem = 20px)
            })(),
          }}
        >
          {/* WIG PREVIEW */}
          <div className="w-full flex items-center flex-col mb-6 md:mb-8" style={{ transform: 'translateY(20px)' }}>
            <div className="leaf-stack hero-thumb">
              <div className="leaf-bg" aria-hidden="true"></div>
              <div
                className="relative bg-cover bg-center flex items-center justify-center"
                style={{
                  width: '262px',
                  height: '367px',
                  backgroundImage: `url('/assets/leaf-brick.png')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'repeat',
                  overflow: 'visible'
                }}
              >
                  <p
                    className="absolute top-[-20px] left-1/2 transform -translate-x-1/2 text-5xl sm:text-6xl z-20 noir-text cursor-pointer"
                    style={{
                      color: '#EB1C24',
                      whiteSpace: 'nowrap',
                      overflow: 'visible',
                      width: 'max-content',
                      fontSize: (() => {
                        const pathname = window.location.pathname;
                        if (pathname.includes('/soft-wave/') || pathname.includes('/soft-curl/') || pathname.includes('/blanco/')) {
                          return 'calc(clamp(2rem, 4vw, 2.5rem) + 8px)'; // Same size for SOFT WAVE/CURL/BLANCO
                        }
                        return undefined; // Default size
                      })(),
                      transform: (() => {
                        const pathname = window.location.pathname;
                        if (pathname.includes('/blanco/')) {
                          return 'translate(-50%, 5px)'; // Move down 5px for BLANCO
                        }
                        if (pathname.includes('/soft-wave/') || pathname.includes('/soft-curl/')) {
                          return 'translate(-50%, 2px)'; // Move down 2px for SOFT WAVE/CURL
                        }
                        return 'translate(-50%, 0)'; // Default position
                      })(),
                    }}
                    onClick={() => {
                      const pathname = window.location.pathname;
                      if (pathname.includes('/blanco/customize') || pathname.includes('/blanco/edit')) navigate('/straight/blanco');
                      else if (pathname.includes('/soft-wave/customize') || pathname.includes('/soft-wave/edit')) navigate('/wavy/soft-wave');
                      else if (pathname.includes('/soft-curl/customize') || pathname.includes('/soft-curl/edit')) navigate('/curly/soft-curl');
                      else if (pathname.includes('/beach-wave/customize') || pathname.includes('/beach-wave/edit')) navigate('/wavy/beach-wave');
                      else if (pathname.includes('/ocean-curl/customize') || pathname.includes('/ocean-curl/edit')) navigate('/curly/ocean-curl');
                      else navigate('/straight/noir');
                    }}
                  >
                    {(() => {
                      const pathname = window.location.pathname;
                      if (pathname.includes('/blanco/customize') || pathname.includes('/blanco/edit')) return 'BLANCO';
                      if (pathname.includes('/soft-wave/customize') || pathname.includes('/soft-wave/edit')) return 'SOFT WAVE';
                      if (pathname.includes('/soft-curl/customize') || pathname.includes('/soft-curl/edit')) return 'SOFT CURL';
                      if (pathname.includes('/beach-wave/customize') || pathname.includes('/beach-wave/edit')) return 'BEACH WAVE';
                      if (pathname.includes('/ocean-curl/customize') || pathname.includes('/ocean-curl/edit')) return 'OCEAN CURL';
                      return 'NOIR';
                    })()}
                  </p>
                <img
                  src={wigViews[selectedView]}
                  alt="Selected Wig"
                  width="282"
                  height="387"
                  className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hero-mannequin-img"
                  style={{ 
                    top: 'calc(50% - 10.601px + 18px)',
                    '--hero-width': '282px',
                    '--hero-height': '387px'
                  } as React.CSSProperties}
                />
              </div>
            </div>

            {/* THUMBNAILS */}
            <div className="flex justify-center mb-3 mt-2" style={{ transform: 'translateY(10px)', gap: '2px' }}>
              {wigViews.map((view, index) => (
                <div className="leaf-stack thumb" key={index}>
                  <div 
                    className={`leaf-bg ${
                      selectedView === index ? 'border-black' : 'border-transparent'
                    }`} 
                    aria-hidden="true"
                  ></div>
                  <div
                    className="border-transparent p-1 cursor-pointer"
                    onClick={() => setSelectedView(index)}
                  >
                    <div
                      className="relative bg-cover bg-center"
                      data-thumb-index={index}
                      style={{
                        width: '72px',
                        height: '95px',
                        position: 'relative',
                        zIndex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <img
                        alt={`Thumbnail ${index + 1}`}
                        width="63"
                        height="84"
                        src={view}
                        className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 thumbnail-mannequin-img"
                        style={{ 
                          '--thumb-top': 'calc(50% - 6.1px + 7.2px)',
                          ...(index === 0 && { left: 'calc(50% - 6px)' })
                        } as React.CSSProperties}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Back Button */}
            <div className="flex justify-start ml-[calc(50%-131px)]">
          </div>

          {/* LACE SELECTION HEADER */}
          <p
            className="text-xs sm:text-sm text-center text-red-500"
            style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', color: '#EB1C24', transform: 'translateY(18px)', marginBottom: '31px' }}
          >
            HD TOPPER SIZE
          </p>

          {/* LACE OPTIONS - Updated to fit 4 containers per row with centered layout */}
          <div className="grid grid-cols-4 gap-3 mx-auto justify-center mb-6 max-w-[320px]">
            {laceOptions.map((option) => {
              const isBlancoRoute = window.location.pathname.includes('/blanco/customize') || window.location.pathname.includes('/blanco/edit');
              const imgSize = isBlancoRoute ? 44 : 74; // Match main page edit mode size (44px for BLANCO)
              const containerSize = 54; // Always 54px for all routes (restored to match main page)
              return (
                <ThumbBox
                  key={option.id}
                  image={option.image}
                  title="LACE"
                  label={option.name}
                  isSelected={selectedLace === option.id}
                  onClick={() => handleLaceSelect(option.id)}
                  imgSize={imgSize}
                  containerSize={containerSize}
                  topPosition="52%"
                  customTransform="translateX(calc(-50% - 3px)) translateY(-50%)"
                />
              );
            })}
          </div>

          {/* DYNAMIC LACE NOTE */}
          <p
            className="font-futura text-[10px] md:text-xs text-center w-[95%] mx-auto uppercase"
            style={{ color: '#EB1C24', fontFamily: '"Futura PT Demi"', fontWeight: '500', transform: 'translateY(-7px)', marginTop: '19px', marginBottom: '19px' }}
          >
            {getLaceNoteText()}
          </p>

          {/* TOTAL PRICE */}
          <div className="text-center">
            <p className="font-futura text-[12px] font-medium" style={{ color: '#909090' }}>
              TOTAL DUE
            </p>
            <p
              className="text-black font-medium text-base"
              style={{
                fontFamily:
                  '"Futura PT Medium"',
                fontWeight: '500',
              }}
            >
              {totalPrice < 0 ? '-' : totalPrice > 0 ? '+' : ''}${Math.abs(totalPrice)} USD
            </p>
          </div>

        </div>

        {/* CONFIRM SELECTION BUTTON */}
        <div className="px-0 md:px-0" style={{ marginTop: '2px' }}>
          <button
            onClick={handleConfirmSelection}
            className="border border-black font-futura w-full max-w-m text-center py-2 text-[12px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
            style={{ borderWidth: '1.3px', color: '#EB1C24' }}
          >
            CONFIRM SELECTION
          </button>
        </div>
      </div>
        </div>
      </div>
      {/* MOBILE MENU POP-UP */}
      {showMobileMenu && (
        <div 
          className="fixed inset-0 z-50"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(5px)'
          }}
          onClick={handleCloseMobileMenu}
        >
          <div 
            className="fixed inset-0 w-full h-full"
            style={{
              backgroundImage: 'url("/assets/marble-view.png")',
              backgroundSize: '500%',
              backgroundPosition: 'center 60%',
              backgroundRepeat: 'no-repeat'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Glassmorphism Container */}
            <div 
              className="border border-black bg-white/60 backdrop-blur-sm"
              style={{ 
                borderWidth: '1.3px',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '90%',
                height: 'calc(80% + 120px)',
                padding: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
              }}
            >
              {/* Close Button */}
              <button
                onClick={handleCloseMobileMenu}
                className="absolute z-10"
                style={{
                  top: '9px',
                  right: '9px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px'
                }}
              >
                <img
                  src="/assets/close-icon.svg"
                  alt="Close"
                  style={{ width: '21px', height: '21px' }}
                />
              </button>

              {/* Top Icons and Currency */}
              <div className="absolute top-16 left-6 right-6 flex justify-between items-center z-10">
                {/* Top Icons */}
                <div className="flex gap-4">
                <div className="flex items-center" style={{ transform: 'translateY(1px)' }}>
                  <DynamicCartIcon count={cartCount} width={28} height={23} />
                </div>
                <img
                  src="/assets/NOIR/account-icon.svg"
                  alt="Account"
                  onClick={() => navigate(localStorage.getItem('isSignedIn') === 'true' ? '/account' : '/sign-in')}
                  style={{ width: '21px', height: '21px', transform: 'translateY(4px)', cursor: 'pointer' }}
                />
                <img
                  src="/assets/wishlist-heart.svg"
                  alt="Wishlist"
                  onClick={() => navigate(typeof window !== 'undefined' && localStorage.getItem('isSignedIn') === 'true' ? '/wishlist' : '/sign-in')}
                  style={{ width: '21px', height: '21px', transform: 'translateY(4px) translateX(-1px)', cursor: 'pointer' }}
                />
                </div>
                
                {/* Currency Selector */}
                <div className="flex items-center gap-2">
                  <span style={{ 
                    fontFamily: '"Futura PT Medium"',
                    fontSize: '14px',
                    color: 'black',
                    fontWeight: '500'
                  }}>
                    $ USD
                  </span>
                  <img
                    src="/assets/NOIR/down-arrow.svg"
                    alt="Currency"
                    style={{ width: '14px', height: '14px' }}
                  />
                </div>
              </div>

              {/* Navigation Links */}
              <div className="absolute top-24 left-1/2 transform -translate-x-1/2 flex gap-8 z-10" style={{ marginTop: '30px' }}>
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

              {/* Menu Items */}
              <div className="absolute top-40 right-6 z-10" style={{ marginTop: '15px', left: '27px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
                  {mobileMenuActiveTab === 'TOOLS' ? (
                    ['GIFT CARD'].map((item, index) => (
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
                          style={{ alignItems: 'center' }}
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

              {/* Sign In/Out */}
              <div className="absolute left-1/2 transform -translate-x-1/2 z-10" style={{ bottom: '86px' }}>
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

                {/* Social Media Icons */}
                <div className="absolute left-1/2 transform -translate-x-1/2 z-10" style={{ bottom: '37px' }}>
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
            </div>
          </div>
        )}

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
    </>
  );
}

export default LaceSelection;
