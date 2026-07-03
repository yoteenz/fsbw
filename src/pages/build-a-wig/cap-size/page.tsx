
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ThumbBox from '../../../components/ThumbBox';
import LoadingScreen from '../../../components/base/LoadingScreen';
import ConfirmationModal from '../../../components/ConfirmationModal';
import BrandMenuLinks from '../../../components/BrandMenuLinks';
import SocialMenuIcons from '../../../components/SocialMenuIcons';
import { signOutAppAndSupabaseSession } from '../../../utils/adminAuth';
import { isBuildAWigCustomizePath } from '../../../utils/buildAWigRoutes';
import {
  markBawConfirmedReturnFromSubpage,
  persistBawScalarConfirmed,
  persistBawScalarDraftTap,
} from '../../../utils/bawSubpageSelectionPersist';
import { NOIR_NATURAL_MANNEQUIN_TRIPLE } from '../../../utils/bawStaticMannequinReferencePaths';
import { ShopMobileMenuShopTab } from '../../../components/ShopMobileMenuShopTab';
import { ShopMobileMenuToolsTab } from '../../../components/ShopMobileMenuToolsTab';
import { signInHrefWithReturnTo } from '../../../utils/signInReturnTo';
import { useBawSubpageLiveNoirCompositeWigViews } from '../../../hooks/useBawSubpageLiveNoirCompositeWigViews';
import { useSignedInFromStorage } from '../../../hooks/useSignedInFromStorage';
import { BawNoirWigPreviewHeroThumbs } from '../../../components/buildWig/BawNoirWigPreviewFrames';
import { BawSubpageFooterAction } from '../../../components/buildWig/BawViewSubscriptionsFooter';
import { resolveBawTrySubpageConfirmReturnPath } from '../../../utils/bawTrySubpageRoutes';
import { BawModeChrome } from '../../../components/buildWig/BawModeChrome';
import { BuildWigSubscriptionPageRoot } from '../../../components/buildWig/BawSubscriptionViewContext';
import { BawSubscriptionMainCard } from '../../../components/buildWig/BawSubscriptionMainCard';
import { BawBuildAreaOuter } from '../../../components/buildWig/BawBuildAreaOuter';

interface CapSizeOption {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

function CapSizeSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCapSize, setSelectedCapSize] = useState(() => {
    const pathname = window.location.pathname;
    const isOnEditRoute = pathname.includes('/edit');
    const isOnCustomizeRoute = isBuildAWigCustomizePath(pathname);
    
    // CRITICAL: Check editSelected* keys first when in edit mode
    if (isOnEditRoute) {
      const editSelectedCapSize = localStorage.getItem('editSelectedCapSize');
      if (editSelectedCapSize) {
        return editSelectedCapSize;
      }
      // Fallback to editingCartItem
      const editingCartItem = localStorage.getItem('editingCartItem');
      if (editingCartItem) {
        try {
          const item = JSON.parse(editingCartItem);
          if (item.capSize) {
            return item.capSize;
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
    
    // CRITICAL: Check customizeSelected* keys when in customize mode
    if (isOnCustomizeRoute) {
      const customizeSelectedCapSize = localStorage.getItem('customizeSelectedCapSize');
      if (customizeSelectedCapSize) {
        return customizeSelectedCapSize;
      }
    }
    
    // Main mode: use selected* keys
    return localStorage.getItem('selectedCapSize') || 'M';
  });
  
  // CRITICAL: Reload selection when navigating to this page
  // NOTE: Removed selectedCapSize from dependencies to prevent overwriting user selections
  useEffect(() => {
    const pathname = location.pathname;
    const isOnEditRoute = pathname.includes('/edit');
    const isOnCustomizeRoute = isBuildAWigCustomizePath(pathname);
    
    let storedCapSize: string | null = null;
    if (isOnEditRoute) {
      storedCapSize = localStorage.getItem('editSelectedCapSize') || localStorage.getItem('selectedCapSize');
      // Fallback to editingCartItem if not found
      if (!storedCapSize) {
        const editingCartItem = localStorage.getItem('editingCartItem');
        if (editingCartItem) {
          try {
            const item = JSON.parse(editingCartItem);
            storedCapSize = item.capSize || 'M';
          } catch (e) {
            storedCapSize = 'M';
          }
        }
      }
    } else if (isOnCustomizeRoute) {
      storedCapSize = localStorage.getItem('customizeSelectedCapSize') || localStorage.getItem('selectedCapSize');
    } else {
      storedCapSize = localStorage.getItem('selectedCapSize');
    }
    
    if (storedCapSize && storedCapSize !== selectedCapSize) {
      setSelectedCapSize(storedCapSize);
    }
  }, [location.pathname]); // Only reload when route changes, not when selectedCapSize changes
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
  const [isSignedIn, setIsSignedIn] = useSignedInFromStorage();
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  // Sync cap size from localStorage on cross-tab / focus events
  useEffect(() => {
    const handleStorageChange = () => {
      // Update selected cap size from localStorage
      // CRITICAL: Check editSelected* keys first when in edit mode, then customizeSelected* for customize mode
      // NOTE: Only update if the stored value is different to prevent overwriting user selections
      const pathname = window.location.pathname;
      const isOnEditRoute = pathname.includes('/edit');
      const isOnCustomizeRoute = isBuildAWigCustomizePath(pathname);
      
      let storedCapSize: string | null = null;
      if (isOnEditRoute) {
        storedCapSize = localStorage.getItem('editSelectedCapSize') || localStorage.getItem('selectedCapSize');
      } else if (isOnCustomizeRoute) {
        storedCapSize = localStorage.getItem('customizeSelectedCapSize') || localStorage.getItem('selectedCapSize');
      } else {
        storedCapSize = localStorage.getItem('selectedCapSize');
      }
      
      // Only update if stored value exists and is different from current state
      // This prevents overwriting when user is actively selecting
      if (storedCapSize && storedCapSize !== selectedCapSize) {
        setSelectedCapSize(storedCapSize);
      }
    };

    // Listen for custom storage changes (same-tab)
    const handleCustomStorageChange = () => {
      handleStorageChange();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);
    window.addEventListener('customStorageChange', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
      window.removeEventListener('customStorageChange', handleCustomStorageChange);
    };
  }, [selectedCapSize]); // Add selectedCapSize to dependencies to ensure updates

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
      return [...NOIR_NATURAL_MANNEQUIN_TRIPLE];
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

  const baseWigViews = getWigViews();
  const liveNoirCompositeWigViews = useBawSubpageLiveNoirCompositeWigViews();
  const wigViews =
    liveNoirCompositeWigViews && location.pathname.includes('/build-a-wig/noir/')
      ? liveNoirCompositeWigViews
      : baseWigViews;

  // Cap size options - UPDATED to match reference exactly
  const capSizeOptions: CapSizeOption[] = [
    {
      id: 'XS',
      name: 'XS',
      description: '20" circumference',
      price: 0,
      image: '/assets/cap size-icon.svg'
    },
    {
      id: 'S',
      name: 'S',
      description: '21" circumference',
      price: 0,
      image: '/assets/cap size-icon.svg'
    },
    {
      id: 'M',
      name: 'M',
      description: '22" circumference',
      price: 0, // Default option - included in base price
      image: '/assets/cap size-icon.svg'
    },
    {
      id: 'L',
      name: 'L',
      description: '23" circumference',
      price: 0,
      image: '/assets/cap size-icon.svg'
    }
  ];

  // Flexible sizing options - ADDED to match reference
  const flexibleSizeOptions: CapSizeOption[] = [
    {
      id: 'XXS/XS/S',
      name: 'XXS/XS/S',
      description: 'Flexible sizing',
      price: 40, // Additional cost for flexible sizing
      image: '/assets/cap size-icon.svg'
    },
    {
      id: 'S/M/L',
      name: 'S/M/L',
      description: 'Flexible sizing',
      price: 40, // Additional cost for flexible sizing
      image: '/assets/cap size-icon.svg'
    }
  ];

  const handleCapSizeSelect = (capSizeId: string) => {
    console.log('Cap-size page - selecting cap size:', capSizeId);
    setSelectedCapSize(capSizeId);

    const allOptions = [...capSizeOptions, ...flexibleSizeOptions];
    const selectedOption = allOptions.find(option => option.id === capSizeId);
    const priceUsd = selectedOption ? selectedOption.price : 0;
    persistBawScalarDraftTap(window.location.pathname, 'CapSize', capSizeId, String(priceUsd));
  };

  const handleConfirmSelection = () => {
    console.log('Cap-size page - confirming selection:', selectedCapSize);
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
    const isCustomizeMode = isBuildAWigCustomizePath(pathname);
    
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
        console.log('Cap-size page - No sourceRoute found, detected edit mode from localStorage/pathname');
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
        console.log('Cap-size page - No sourceRoute found, detected customize mode from localStorage/pathname:', sourceRoute);
      } else {
        sourceRoute = '/build-a-wig';
        console.log('Cap-size page - No sourceRoute found, defaulting to main page');
      }
    }
    
    persistBawScalarConfirmed(pathname, 'CapSize', selectedCapSize, price, { isCustomizeMode, isEditMode });
    
    console.log('Cap-size page - saved to localStorage:', {
      selectedCapSize,
      price: getSelectedPrice(),
      isEditMode,
      isCustomizeMode
    });
    
    // Determine the correct route to navigate back to based on current pathname
    const tryReturnRoute = resolveBawTrySubpageConfirmReturnPath(location.pathname);
    let returnRoute = tryReturnRoute ?? '/build-a-wig';
    if (!tryReturnRoute) {
    if (location.pathname.startsWith('/build-a-wig/noir/edit/')) {
      returnRoute = '/build-a-wig/noir/edit';
    } else if (location.pathname.startsWith('/build-a-wig/blanco/edit/')) {
      returnRoute = '/build-a-wig/blanco/edit';
    } else if (location.pathname.startsWith('/build-a-wig/soft-wave/edit/')) {
      returnRoute = '/build-a-wig/soft-wave/edit';
    } else if (location.pathname.startsWith('/build-a-wig/soft-curl/edit/')) {
      returnRoute = '/build-a-wig/soft-curl/edit';
    } else if (location.pathname.startsWith('/build-a-wig/ocean-curl/edit/')) {
      returnRoute = '/build-a-wig/ocean-curl/edit';
    } else if (location.pathname.startsWith('/build-a-wig/beach-wave/edit/')) {
      returnRoute = '/build-a-wig/beach-wave/edit';
    } else if (location.pathname.startsWith('/build-a-wig/edit/')) {
      returnRoute = '/build-a-wig/edit';
    } else if (location.pathname.startsWith('/build-a-wig/blanco/customize/')) {
      returnRoute = '/build-a-wig/blanco/customize';
    } else if (location.pathname.startsWith('/build-a-wig/soft-wave/customize/')) {
      returnRoute = '/build-a-wig/soft-wave/customize';
    } else if (location.pathname.startsWith('/build-a-wig/soft-curl/customize/')) {
      returnRoute = '/build-a-wig/soft-curl/customize';
    } else if (location.pathname.startsWith('/build-a-wig/ocean-curl/customize/')) {
      returnRoute = '/build-a-wig/ocean-curl/customize';
    } else if (location.pathname.startsWith('/build-a-wig/beach-wave/customize/')) {
      returnRoute = '/build-a-wig/beach-wave/customize';
    } else if (location.pathname.startsWith('/build-a-wig/noir/customize/')) {
      returnRoute = '/build-a-wig/noir/customize';
    } else if (sourceRoute) {
      returnRoute = sourceRoute;
    }
    }
    
    console.log('Cap-size page - Navigating back to route:', returnRoute);
    
    markBawConfirmedReturnFromSubpage();
    
    window.dispatchEvent(new CustomEvent('customStorageChange'));
    
    // Add a small delay to ensure the event is processed
    setTimeout(() => {
      navigate(returnRoute);
    }, 100);
  };

  const getSelectedPrice = () => {
    const allOptions = [...capSizeOptions, ...flexibleSizeOptions];
    const selected = allOptions.find(option => option.id === selectedCapSize);
    return selected ? selected.price : 0;
  };

  const totalPrice = getSelectedPrice();

  useEffect(() => {
    // Hide loading screen after 2 seconds
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Initialize with edit mode or customize mode data if available
  useEffect(() => {
    const pathname = window.location.pathname;
    const isOnEditRoute = pathname.includes('/edit');
    const isOnCustomizeRoute = isBuildAWigCustomizePath(pathname);
    
    // CRITICAL: Check editSelected* keys first when in edit mode
    if (isOnEditRoute) {
      const editSelectedCapSize = localStorage.getItem('editSelectedCapSize');
      if (editSelectedCapSize) {
        setSelectedCapSize(editSelectedCapSize);
        return;
      }
      // Fallback to editingCartItem
      const editingCartItem = localStorage.getItem('editingCartItem');
      if (editingCartItem) {
        try {
          const item = JSON.parse(editingCartItem);
          console.log('Cap-size page - loading edit mode cap size:', item.capSize);
          if (item.capSize) {
            setSelectedCapSize(item.capSize);
            // Also save to editSelected* for consistency
            localStorage.setItem('editSelectedCapSize', item.capSize);
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
    
    // CRITICAL: Check customizeSelected* keys when in customize mode
    if (isOnCustomizeRoute) {
      const customizeSelectedCapSize = localStorage.getItem('customizeSelectedCapSize');
      if (customizeSelectedCapSize) {
        setSelectedCapSize(customizeSelectedCapSize);
      }
    }
  }, []);

  return (
    <BuildWigSubscriptionPageRoot>
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
          <BawModeChrome />

        {/* MAIN BUILD AREA */}
        <BawBuildAreaOuter showMobileMenu={showMobileMenu} style={{ 
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
            minHeight: showMobileMenu ? 'calc(100dvh - 80px)' : 'auto',
            height: showMobileMenu ? 'calc(100dvh - 80px)' : 'auto'
          }}
        >
          {showMobileMenu ? (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', paddingTop: '20px', flex: 1, minHeight: 0, position: 'relative' }}>
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
              <div style={{ marginBottom: '20px' }}><SocialMenuIcons /></div>
            </div>
          ) : (
            <>
            <BawSubscriptionMainCard>
          {/* WIG PREVIEW */}
          <div className="w-full flex items-center flex-col mb-6 md:mb-8" style={{ transform: 'translateY(20px)' }}>
            <BawNoirWigPreviewHeroThumbs
              wigViews={wigViews}
              selectedView={selectedView}
              onSelectView={setSelectedView}
              heroChildren={
                <p
                  className="absolute top-[-20px] left-1/2 transform -translate-x-1/2 text-5xl sm:text-6xl z-20 noir-text cursor-pointer"
                  style={{
                    color: '#EB1C24',
                    whiteSpace: 'nowrap',
                    overflow: 'visible',
                    width: 'max-content',
                    fontSize: (() => {
                      const pathname = location.pathname;
                      if (pathname.includes('/soft-wave/') || pathname.includes('/soft-curl/') || pathname.includes('/blanco/')) {
                        return 'calc(clamp(2rem, 4vw, 2.5rem) + 8px)';
                      }
                      return undefined;
                    })(),
                    transform: (() => {
                      const pathname = location.pathname;
                      if (pathname.includes('/blanco/')) {
                        return 'translate(-50%, 5px)';
                      }
                      if (pathname.includes('/soft-wave/') || pathname.includes('/soft-curl/')) {
                        return 'translate(-50%, 2px)';
                      }
                      return 'translate(-50%, 0)';
                    })(),
                  }}
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
                </p>
              }
            />
          </div>

          {/* Back Button - Fixed positioning to match hairline page */}
            <div className="flex justify-start ml-[calc(50%-131px)]">
          </div>

          {/* RED NOTICE TEXT - Moved to match reference layout exactly */}

          {/* TOTAL DUE - Hidden on mobile to match reference */}
          <div className="text-center hidden md:block">
            <p className="text-sm font-medium" style={{ color: '#808080', fontFamily: '"Futura PT Medium"' }}>
              TOTAL DUE
            </p>
            <p 
              className="text-base font-medium"
              style={{ fontFamily: '"Futura PT Medium"', fontWeight: '500' }}
            >
              $400 USD
            </p>
          </div>

          {/* SELECTION AREA - Moved to right side to match reference */}
          <div className="w-full flex flex-col lg:mt-0 mt-0">
            {/* CUSTOM SIZING SECTION */}
            <p 
              className="text-xs sm:text-sm text-center mb-4"
              style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', color: '#EB1C24', transform: 'translateY(18px)' }}
            >
              CUSTOM SIZING
            </p>

            {/* CUSTOM SIZE OPTIONS - Updated to fit 4 containers per row with centered layout */}
            <div className="flex flex-col gap-3 mt-[12px] mx-auto mb-6">
              <div className="grid grid-cols-4 gap-4 mx-auto justify-center max-w-[320px]">
                {capSizeOptions.map((option) => (
                  <ThumbBox
                    key={option.id}
                    image={option.image}
                    title="CAP SIZE"
                    label={option.name}
                    isSelected={selectedCapSize === option.id}
                    onClick={() => handleCapSizeSelect(option.id)}
                    imgSize={78}
                    containerSize={60}
                    topPosition="53%"
                  />
                ))}
              </div>
            </div>

            {/* FLEXIBLE SIZING SECTION */}
            <div className="mt-5" style={{ transform: 'translateY(-9px) translateZ(0)', position: 'relative' }}>
              <p 
                className="text-xs sm:text-sm text-center mb-4"
                style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', color: '#EB1C24' }}
              >
                FLEXIBLE SIZING
              </p>

              <div className="flex flex-col mx-auto" style={{ marginTop: '-5px', marginBottom: '13px' }}>
                <div className="grid grid-cols-2 gap-4 justify-center max-w-[160px] mx-auto">
                  {flexibleSizeOptions.map((option) => (
                    <ThumbBox
                      key={option.id}
                      image={option.image}
                      title="CAP SIZE"
                      label={option.name}
                      isSelected={selectedCapSize === option.id}
                      onClick={() => handleCapSizeSelect(option.id)}
                      imgSize={78}
                      containerSize={60}
                      topPosition="55%"
                    />
                  ))}
                </div>
              </div>

              {/* SIZE MEASUREMENTS */}
              <div className="flex justify-center mx-auto gap-5" style={{ paddingTop: '1.5rem', paddingBottom: '1.5rem' }}>
                <p className="text-[10px] font-semibold text-[#EB1C24]" style={{ fontFamily: '"Futura PT Medium"' }}>XXS: 19"</p>
                <p className="text-[10px] font-semibold text-[#EB1C24]" style={{ fontFamily: '"Futura PT Medium"' }}>XS: 20"</p>
                <p className="text-[10px] font-semibold text-[#EB1C24]" style={{ fontFamily: '"Futura PT Medium"' }}>S: 21"</p>
                <p className="text-[10px] font-semibold text-[#EB1C24]" style={{ fontFamily: '"Futura PT Medium"' }}>M: 22"</p>
                <p className="text-[10px] font-semibold text-[#EB1C24]" style={{ fontFamily: '"Futura PT Medium"' }}>L: 23"</p>
              </div>
            </div>

            {/* TOTAL PRICE */}
            <div className="text-center">
              <p className="font-futura text-[12px] font-medium" style={{ color: '#808080' }}>
                TOTAL DUE
              </p>
              <p 
                className="text-black font-medium text-base"
                style={{ fontFamily: '"Futura PT Medium"', fontWeight: '500' }}
              >
                {totalPrice < 0 ? '-' : totalPrice > 0 ? '+' : ''}${Math.abs(totalPrice)} USD
              </p>
            </div>

          </div>
            </BawSubscriptionMainCard>
            </>
          )}
        </BawBuildAreaOuter>

        <BawSubpageFooterAction
          onConfirm={handleConfirmSelection}
          hidden={showMobileMenu}
          buttonWidth="100%"
          buttonClassName="w-full max-w-m"
          wrapperClassName="px-0 md:px-0 flex justify-center"
          wrapperStyle={{ marginTop: '2px', transform: 'translateY(0px)' }}
        />
      </div>
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
    </>
    </BuildWigSubscriptionPageRoot>
  );
}

export default CapSizeSelection;
