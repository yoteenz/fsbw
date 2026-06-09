
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ThumbBox from '../../../components/ThumbBox';
import DynamicCartIcon from '../../../components/DynamicCartIcon';
import LoadingScreen from '../../../components/base/LoadingScreen';
import ConfirmationModal from '../../../components/ConfirmationModal';
import BrandMenuLinks from '../../../components/BrandMenuLinks';
import SocialMenuIcons from '../../../components/SocialMenuIcons';
import { signOutAppAndSupabaseSession } from '../../../utils/adminAuth';
import { getBuildAWigFlowBasePath, isBuildAWigCustomizePath } from '../../../utils/buildAWigRoutes';
import { NOIR_NATURAL_MANNEQUIN_TRIPLE } from '../../../utils/bawStaticMannequinReferencePaths';
import { ShopMobileMenuShopTab } from '../../../components/ShopMobileMenuShopTab';
import { ShopMobileMenuToolsTab } from '../../../components/ShopMobileMenuToolsTab';
import { signInHrefWithReturnTo } from '../../../utils/signInReturnTo';
import { useShopNavSearchBar } from '../../../components/shop/useShopNavSearchBar';
import { useBawSubpageLiveNoirCompositeWigViews } from '../../../hooks/useBawSubpageLiveNoirCompositeWigViews';
import { useSignedInFromStorage } from '../../../hooks/useSignedInFromStorage';
import { BawNoirWigPreviewHeroThumbs } from '../../../components/buildWig/BawNoirWigPreviewFrames';

interface LengthOption {
  id: string;
  name: string;
  inches: string;
  description: string;
  price: number;
  image: string;
}

function LengthSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const { NavCenter, SearchTrigger } = useShopNavSearchBar();
  const [selectedLength, setSelectedLength] = useState(() => {
    // Always start with default - useEffect will load from localStorage
    // This matches the customize pages pattern
    return '24"';
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
  const [isSignedIn, setIsSignedIn] = useSignedInFromStorage();
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

  useEffect(() => {
    // Hide loading screen after 2 seconds
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Initialize with current selection from localStorage
  useEffect(() => {
    const pathname = window.location.pathname;
    const isOnEditRoute = pathname.includes('/edit');
    const isOnCustomizeRoute = isBuildAWigCustomizePath(pathname);
    
    // CRITICAL: Check editSelected* keys first when in edit mode
    if (isOnEditRoute) {
      const editSelectedLength = localStorage.getItem('editSelectedLength');
      if (editSelectedLength) {
        console.log('Length page - loading edit mode length from editSelectedLength:', editSelectedLength);
        setSelectedLength(editSelectedLength);
        // Also save to selected* for consistency
        localStorage.setItem('selectedLength', editSelectedLength);
        return; // Exit early - we're done
      }
      
      // Fallback to editingCartItem
      const editingCartItem = localStorage.getItem('editingCartItem');
      if (editingCartItem) {
        try {
          const item = JSON.parse(editingCartItem);
          console.log('Length page - loading edit mode length from editingCartItem:', item.length);
          if (item.length) {
            setSelectedLength(item.length);
            localStorage.setItem('selectedLength', item.length);
            // Also save to editSelected* for consistency
            localStorage.setItem('editSelectedLength', item.length);
            return; // Exit early - we're done
          }
        } catch (error) {
          console.error('Length page - Error parsing editingCartItem:', error);
        }
      }
    }
    
    // CRITICAL: Check customizeSelected* keys when in customize mode
    if (isOnCustomizeRoute) {
      const customizeSelectedLength = localStorage.getItem('customizeSelectedLength');
      if (customizeSelectedLength) {
        console.log('Length page - loading customize mode length from customizeSelectedLength:', customizeSelectedLength);
        setSelectedLength(customizeSelectedLength);
        // Also save to selected* for consistency
        localStorage.setItem('selectedLength', customizeSelectedLength);
        return; // Exit early - we're done
      }
    }
    
    // Main mode - load from main page's selectedLength
    const currentLength = localStorage.getItem('selectedLength');
    console.log('Length page - useEffect loading from localStorage:', currentLength, 'isOnEditRoute:', isOnEditRoute);
    
    // Always use localStorage value if it exists (should match main page)
    if (currentLength) {
      console.log('Length page - Setting length from localStorage:', currentLength);
      setSelectedLength(currentLength);
    } else {
      // If not in localStorage, use default and save it
      console.log('Length page - No value in localStorage, using default 24"');
      const defaultLength = '24"';
      setSelectedLength(defaultLength);
      localStorage.setItem('selectedLength', defaultLength);
    }
    
    // Also listen for customStorageChange event in case main page updates after mount
    const handleCustomStorageChange = () => {
      const pathname = window.location.pathname;
      const isOnEditRoute = pathname.includes('/edit');
      const isOnCustomizeRoute = isBuildAWigCustomizePath(pathname);
      
      let currentLength: string | null = null;
      if (isOnEditRoute) {
        currentLength = localStorage.getItem('editSelectedLength') || localStorage.getItem('selectedLength');
      } else if (isOnCustomizeRoute) {
        currentLength = localStorage.getItem('customizeSelectedLength') || localStorage.getItem('selectedLength');
      } else {
        currentLength = localStorage.getItem('selectedLength');
      }
      
      if (currentLength) {
        console.log('Length page - Updated from customStorageChange:', currentLength);
        setSelectedLength(currentLength);
      }
    };
    
    window.addEventListener('customStorageChange', handleCustomStorageChange);
    
    return () => {
      window.removeEventListener('customStorageChange', handleCustomStorageChange);
    };
  }, []);

  // Listen for storage changes to update selection
  useEffect(() => {
    const handleStorageChange = () => {
      // Update length from localStorage
      const currentLength = localStorage.getItem('selectedLength');
      if (currentLength) {
        setSelectedLength(currentLength);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('customStorageChange', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('customStorageChange', handleStorageChange);
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
      return [...NOIR_NATURAL_MANNEQUIN_TRIPLE];
    }
  };

  const baseWigViews = getWigViews();
  const liveNoirCompositeWigViews = useBawSubpageLiveNoirCompositeWigViews();
  const wigViews =
    liveNoirCompositeWigViews && location.pathname.includes('/build-a-wig/noir/')
      ? liveNoirCompositeWigViews
      : baseWigViews;

  // Length options - Updated with proper pricing (24" is default, included in base price)
  const lengthOptions: LengthOption[] = [
    {
      id: '16"',
      name: '16"',
      inches: '16"',
      description: 'Shoulder length',
      price: -50, // Less than default, discount
      image: '/assets/back length-icon.svg'
    },
    {
      id: '18"',
      name: '18"',
      inches: '18"',
      description: 'Mid-back length',
      price: -25, // Less than default, discount
      image: '/assets/back length-icon.svg'
    },
    {
      id: '20"',
      name: '20"',
      inches: '20"',
      description: 'Mid-back length',
      price: -10, // Slightly less than default
      image: '/assets/back length-icon.svg'
    },
    {
      id: '22"',
      name: '22"',
      inches: '22"',
      description: 'Long length',
      price: -5, // Slightly less than default
      image: '/assets/back length-icon.svg'
    },
    {
      id: '24"',
      name: '24"',
      inches: '24"',
      description: 'Long length',
      price: 0, // Default option - included in base price
      image: '/assets/butt length-icon.png'
    },
    {
      id: '26"',
      name: '26"',
      inches: '26"',
      description: 'Very long length',
      price: 50, // Additional cost for longer than default
      image: '/assets/butt length-icon.png'
    },
    {
      id: '28"',
      name: '28"',
      inches: '28"',
      description: 'Extra long length',
      price: 100, // Additional cost for longer than default
      image: '/assets/butt length-icon.png'
    },
    {
      id: '30"',
      name: '30"',
      inches: '30"',
      description: 'Super long length',
      price: 150, // Additional cost for longer than default
      image: '/assets/butt length-icon.png'
    },
    {
      id: '32"',
      name: '32"',
      inches: '32"',
      description: 'Super long length',
      price: 200, // Additional cost for longer than default
      image: '/assets/thigh length-icon.svg'
    },
    {
      id: '34"',
      name: '34"',
      inches: '34"',
      description: 'Ultra long length',
      price: 250, // Additional cost for longer than default
      image: '/assets/thigh length-icon.svg'
    },
    {
      id: '36"',
      name: '36"',
      inches: '36"',
      description: 'Ultra long length',
      price: 300, // Additional cost for longer than default
      image: '/assets/thigh length-icon.svg'
    },
    {
      id: '40"',
      name: '40"',
      inches: '40"',
      description: 'Maximum length',
      price: 400, // Additional cost for longest option
      image: '/assets/thigh length-icon.svg'
    }
  ];

  const persistLengthChoice = (lengthId: string, priceUsd: number) => {
    const pathname = window.location.pathname;
    const isOnEditRoute = pathname.includes('/edit');
    const isOnCustomizeRoute = isBuildAWigCustomizePath(pathname);
    const priceStr = String(priceUsd);
    localStorage.setItem('selectedLength', lengthId);
    localStorage.setItem('selectedLengthPrice', priceStr);
    if (isOnEditRoute) {
      localStorage.setItem('editSelectedLength', lengthId);
      localStorage.setItem('editSelectedLengthPrice', priceStr);
    }
    if (isOnCustomizeRoute) {
      localStorage.setItem('customizeSelectedLength', lengthId);
      localStorage.setItem('customizeSelectedLengthPrice', priceStr);
    }
    window.dispatchEvent(new CustomEvent('customStorageChange'));
  };

  const handleLengthSelect = (lengthId: string) => {
    setSelectedLength(lengthId);
    const priceUsd = lengthOptions.find((o) => o.id === lengthId)?.price ?? 0;
    persistLengthChoice(lengthId, priceUsd);
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
      localStorage.setItem('selectedLength', selectedLength);
      localStorage.setItem('selectedLengthPrice', price);
      
      // Also save with 'editSelected' prefix in edit mode
      if (isOnProductSpecificEditRoute) {
        localStorage.setItem('editSelectedLength', selectedLength);
        localStorage.setItem('editSelectedLengthPrice', price);
      }
      
      // Also save with 'customizeSelected' prefix in customize mode
      if (isOnProductSpecificCustomizeRoute) {
        localStorage.setItem('customizeSelectedLength', selectedLength);
        localStorage.setItem('customizeSelectedLengthPrice', price);
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

  const handleConfirmSelection = () => {
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
        console.log('Length page - No sourceRoute found, detected edit mode from localStorage/pathname');
      } else if (selectedCapSize || isCustomizeMode) {
        // Check if we're in product-specific customize mode
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
        console.log('Length page - No sourceRoute found, detected customize mode from localStorage/pathname');
      } else {
        sourceRoute = '/build-a-wig';
        console.log('Length page - No sourceRoute found, defaulting to main page');
      }
    }
    
    // Always save with 'selected' prefix
    localStorage.setItem('selectedLength', selectedLength);
    localStorage.setItem('selectedLengthPrice', price);
    
    // Also save with 'editSelected' prefix in edit mode (for ALL products)
    if (isEditMode) {
      localStorage.setItem('editSelectedLength', selectedLength);
      localStorage.setItem('editSelectedLengthPrice', price);
    }
    
    // Also save with 'customizeSelected' prefix in customize mode (for ALL products)
    if (isCustomizeMode) {
      localStorage.setItem('customizeSelectedLength', selectedLength);
      localStorage.setItem('customizeSelectedLengthPrice', price);
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
    
    console.log('Length page - Navigating back to route:', returnRoute);
    
    // Set flag to indicate we're returning from a sub-page
    sessionStorage.setItem('comingFromSubPage', 'true');
    
    // Dispatch custom event to notify main page of changes
    window.dispatchEvent(new CustomEvent('customStorageChange'));
    
    navigate(returnRoute);
  };

  const getSelectedPrice = () => {
    const selected = lengthOptions.find(option => option.id === selectedLength);
    return selected ? selected.price : 0;
  };

  // Get dynamic length note text based on selected length
  const getLengthNoteText = () => {
    const currentLength = selectedLength;

    // For lengths 30" and above, show additional processing time message
    if (['30"', '32"', '34"', '36"', '40"'].includes(currentLength)) {
      return (
        <>
          3D MODEL IS FOR VISUAL PURPOSES ONLY.<br />
          EXPECT AN ADDITIONAL WEEK OF PROCESSING TIME.
        </>
      );
    }
    
    // For lengths 16" to 28", show standard processing time message
    return (
      <>
        3D MODEL IS FOR VISUAL PURPOSES ONLY.<br />
        STANDARD PROCESSING TIME APPLIES.
      </>
    );
  };

  const totalPrice = getSelectedPrice();

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
            {showMobileMenu ? (
              <>
                <button 
                  onClick={() => navigate(localStorage.getItem('isSignedIn') === 'true' ? '/account' : signInHrefWithReturnTo(location))}
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
                  onClick={() => navigate(localStorage.getItem('isSignedIn') === 'true' ? '/wishlist' : signInHrefWithReturnTo(location))} 
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
                onClick={() => navigate(getBuildAWigFlowBasePath(location.pathname))}
              >
                BUILD-A-WIG {'>'}{' '}
              </span>
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
                </>
              )}
            </p>
            </NavCenter>
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

          {/* MAIN BUILD AREA */}
          <div
            className={
              showMobileMenu
                ? 'menu-toggle-card border border-black flex flex-col pt-6 pb-4 mb-2 bg-white/60 backdrop-blur-sm transition-all duration-300 ease-out'
                : 'border border-black flex flex-col pt-6 pb-4 mb-2 bg-white/60 backdrop-blur-sm transition-all duration-300 ease-out'
            }
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
              minHeight: showMobileMenu ? 'calc(100dvh - 80px)' : 'auto',
              height: showMobileMenu ? 'calc(100dvh - 80px)' : 'auto'
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
              <>
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

            {/* Back Button */}
            <div className="flex justify-start ml-[calc(50%-131px)]">
            </div>

            {/* SELECTION AREA */}
            <div className="w-full flex flex-col lg:mt-0 mt-0">
              {/* LENGTH SELECTION HEADER */}
            <p
              className="text-xs sm:text-sm text-center text-red-500 mb-4"
              style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', color: '#EB1C24', transform: 'translateY(18px)' }}
            >
              HAIR MEASUREMENTS
            </p>

            <div className="grid grid-cols-4 gap-3 mx-auto justify-center mb-6 max-w-[320px]" style={{ marginTop: '15px' }}>
              {/* Row 1: 16", 18", 20" - 50% top position */}
              {lengthOptions.slice(0, 3).map((option) => (
                <ThumbBox
                  key={option.id}
                  image={option.image}
                  title="LENGTH"
                  label={option.name}
                  isSelected={selectedLength === option.id}
                  onClick={() => handleLengthSelect(option.id)}
                  imgSize={72}
                  containerSize={60}
                  topPosition="50%"
                />
              ))}
              {/* Row 2: 22", 24", 26", 28" - mixed thumb assets */}
              {lengthOptions.slice(3, 4).map((option) => (
                <ThumbBox
                  key={option.id}
                  image={option.image}
                  title="LENGTH"
                  label={option.name}
                  isSelected={selectedLength === option.id}
                  onClick={() => handleLengthSelect(option.id)}
                  imgSize={72}
                  containerSize={60}
                  topPosition="50%"
                />
              ))}
              {lengthOptions.slice(4, 8).map((option) => (
                <ThumbBox
                  key={option.id}
                  image="/assets/b length thumb.png"
                  title="LENGTH"
                  label={option.name}
                  isSelected={selectedLength === option.id}
                  onClick={() => handleLengthSelect(option.id)}
                  imgSize={42}
                  containerSize={60}
                  topPosition="calc(58% - 1px)"
                />
              ))}
              {/* Row 3: 32", 34", 36", 40" - 58% top position */}
              {lengthOptions.slice(8, 12).map((option) => (
                <ThumbBox
                  key={option.id}
                  image="/assets/thigh length thumb.png"
                  title="LENGTH"
                  label={option.name}
                  isSelected={selectedLength === option.id}
                  onClick={() => handleLengthSelect(option.id)}
                  imgSize={42}
                  containerSize={60}
                  topPosition="calc(58% - 1px)"
                />
              ))}
            </div>

            {/* DYNAMIC LENGTH NOTE */}
            <p
              className="font-futura text-[10px] md:text-xs text-center my-6 w-[95%] mx-auto uppercase"
              style={{ color: '#EB1C24', fontFamily: '"Futura PT Demi"', fontWeight: '500', transform: 'translateY(-7px)' }}
            >
              {getLengthNoteText()}
            </p>

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
            </>
          )}
        </div>

        {!showMobileMenu && (
          /* CONFIRM SELECTION BUTTON */
        <div className="px-0 md:px-0 flex justify-center" style={{ marginTop: '2px', transform: 'translateY(8px)' }}>
          <button
            onClick={handleConfirmSelection}
            className="border border-black font-futura text-center py-2 text-[12px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
            style={{
              borderWidth: '1.3px',
              color: '#EB1C24',
              width: '358px',
              fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
            }}
          >
            CONFIRM SELECTION
          </button>
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
        title="SIGN OUT"
        message="ARE YOU SURE YOU WANT TO SIGN OUT?"
        confirmText="CONFIRM"
        cancelText="CANCEL"
        dataAttribute="sign-out-confirm"
      />
    </>
  );
}

export default LengthSelection;
