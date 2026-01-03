
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ThumbBox from '../../../components/ThumbBox';
import DynamicCartIcon from '../../../components/DynamicCartIcon';
import LoadingScreen from '../../../components/base/LoadingScreen';
import ConfirmationModal from '../../../components/ConfirmationModal';

interface ColorOption {
  id: string;
  name: string;
  description: string;
  price: number;
  colorCode: string;
  image: string;
}

function ColorSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedColor, setSelectedColor] = useState(() => {
    const pathname = window.location.pathname;
    const isOnEditRoute = pathname.includes('/edit');
    const isOnCustomizeRoute = pathname.includes('/customize');
    const isBlancoRoute = pathname.includes('/blanco/customize') || pathname.includes('/blanco/edit');
    
    // CRITICAL: Check editSelected* keys first when in edit mode
    if (isOnEditRoute) {
      const editSelectedColor = localStorage.getItem('editSelectedColor');
      if (editSelectedColor) {
        // For BLANCO routes, validate color is a valid BLANCO color
        if (isBlancoRoute) {
          const validBlancoColors = ['GOLDEN', 'PLATINUM', 'ASH'];
          if (validBlancoColors.includes(editSelectedColor)) {
            return editSelectedColor;
          } else {
            // Invalid color for BLANCO, default to PLATINUM
            return 'PLATINUM';
          }
        }
        // For non-BLANCO routes, validate that color is not a BLANCO-only color
        const blancoOnlyColors = ['GOLDEN', 'PLATINUM', 'ASH'];
        if (blancoOnlyColors.includes(editSelectedColor)) {
          // PLATINUM/GOLDEN/ASH is not valid for non-BLANCO products, default to OFF BLACK
          return 'OFF BLACK';
        }
        return editSelectedColor;
      }
      // Fallback to editingCartItem
      const editingCartItem = localStorage.getItem('editingCartItem');
      if (editingCartItem) {
        try {
          const item = JSON.parse(editingCartItem);
          if (item.color) {
            // For BLANCO items, validate color is a valid BLANCO color
            if (isBlancoRoute || item.name === 'BLANCO') {
              const validBlancoColors = ['GOLDEN', 'PLATINUM', 'ASH'];
              if (validBlancoColors.includes(item.color)) {
                return item.color;
              } else {
                // Invalid color for BLANCO, default to PLATINUM
                return 'PLATINUM';
              }
            }
            // For non-BLANCO items, validate that color is not a BLANCO-only color
            const blancoOnlyColors = ['GOLDEN', 'PLATINUM', 'ASH'];
            if (blancoOnlyColors.includes(item.color)) {
              // PLATINUM/GOLDEN/ASH is not valid for non-BLANCO products, default to OFF BLACK
              return 'OFF BLACK';
            }
            return item.color;
          }
          // No color in item - use default based on product
          if (isBlancoRoute || item.name === 'BLANCO') {
            return 'PLATINUM';
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
      // No editingCartItem or parse error - use default based on route
      if (isBlancoRoute) {
        return 'PLATINUM';
      }
      // For non-BLANCO routes in edit mode, default to OFF BLACK
      return 'OFF BLACK';
    }
    
    // CRITICAL: Check customizeSelected* keys when in customize mode
    if (isOnCustomizeRoute) {
      const customizeSelectedColor = localStorage.getItem('customizeSelectedColor');
      if (customizeSelectedColor) {
        // For BLANCO routes, validate color is a valid BLANCO color
        if (isBlancoRoute) {
          const validBlancoColors = ['GOLDEN', 'PLATINUM', 'ASH'];
          if (validBlancoColors.includes(customizeSelectedColor)) {
            return customizeSelectedColor;
          } else {
            // Invalid color for BLANCO, default to PLATINUM
            return 'PLATINUM';
          }
        }
        // For non-BLANCO routes, validate that color is not a BLANCO-only color
        const blancoOnlyColors = ['GOLDEN', 'PLATINUM', 'ASH'];
        if (blancoOnlyColors.includes(customizeSelectedColor)) {
          // PLATINUM/GOLDEN/ASH is not valid for non-BLANCO products, default to OFF BLACK
          return 'OFF BLACK';
        }
        return customizeSelectedColor;
      }
    }
    
    // Main mode: use selected* keys
    // For blanco routes (both customize and edit), default to PLATINUM
    if (isBlancoRoute) {
      const selectedColor = localStorage.getItem('selectedColor');
      if (selectedColor) {
        const validBlancoColors = ['GOLDEN', 'PLATINUM', 'ASH'];
        if (validBlancoColors.includes(selectedColor)) {
          return selectedColor;
        }
        // Invalid color for BLANCO, default to PLATINUM
        return 'PLATINUM';
      }
      return 'PLATINUM';
    }
    // For non-BLANCO routes, validate selectedColor is not a BLANCO-only color
    const selectedColor = localStorage.getItem('selectedColor');
    if (selectedColor) {
      const blancoOnlyColors = ['GOLDEN', 'PLATINUM', 'ASH'];
      if (blancoOnlyColors.includes(selectedColor)) {
        // PLATINUM/GOLDEN/ASH is not valid for non-BLANCO products, default to OFF BLACK
        return 'OFF BLACK';
      }
      return selectedColor;
    }
    return 'OFF BLACK';
  });
  
  // CRITICAL: Reload selection when navigating to this page
  useEffect(() => {
    const pathname = window.location.pathname;
    const isOnEditRoute = pathname.includes('/edit');
    const isOnCustomizeRoute = pathname.includes('/customize');
    const isBlancoRoute = pathname.includes('/blanco/customize') || pathname.includes('/blanco/edit');
    
    let storedColor: string | null = null;
    if (isOnEditRoute) {
      storedColor = localStorage.getItem('editSelectedColor') || localStorage.getItem('selectedColor');
      // For BLANCO routes, validate color is a valid BLANCO color
      if (storedColor && isBlancoRoute) {
        const validBlancoColors = ['GOLDEN', 'PLATINUM', 'ASH'];
        if (!validBlancoColors.includes(storedColor)) {
          // Invalid color for BLANCO, reset to PLATINUM
          storedColor = 'PLATINUM';
          localStorage.setItem('editSelectedColor', 'PLATINUM');
          localStorage.setItem('selectedColor', 'PLATINUM');
        }
      }
      // Fallback to editingCartItem if not found
      if (!storedColor) {
        const editingCartItem = localStorage.getItem('editingCartItem');
        if (editingCartItem) {
          try {
            const item = JSON.parse(editingCartItem);
            let itemColor = item.color;
            // For BLANCO items, validate color
            if (isBlancoRoute || item.name === 'BLANCO') {
              const validBlancoColors = ['GOLDEN', 'PLATINUM', 'ASH'];
              if (!itemColor || !validBlancoColors.includes(itemColor)) {
                itemColor = 'PLATINUM';
              }
            }
            storedColor = itemColor || (isBlancoRoute ? 'PLATINUM' : 'OFF BLACK');
          } catch (e) {
            storedColor = isBlancoRoute ? 'PLATINUM' : 'OFF BLACK';
          }
        }
      }
    } else if (isOnCustomizeRoute) {
      storedColor = localStorage.getItem('customizeSelectedColor') || localStorage.getItem('selectedColor');
      // For blanco routes, default to PLATINUM if no color is stored
      if (!storedColor && isBlancoRoute) {
        storedColor = 'PLATINUM';
        // Also save it to localStorage so it persists
        localStorage.setItem('selectedColor', 'PLATINUM');
        localStorage.setItem('customizeSelectedColor', 'PLATINUM');
      }
    } else {
      storedColor = localStorage.getItem('selectedColor');
      // For blanco routes, default to PLATINUM if no color is stored
      if (!storedColor && isBlancoRoute) {
        storedColor = 'PLATINUM';
        localStorage.setItem('selectedColor', 'PLATINUM');
      }
    }
    
    // Only update if we have a stored color and it's different
    // For blanco routes, validate and prioritize stored color
    if (storedColor && storedColor !== selectedColor) {
      // For BLANCO routes, validate color is valid
      if (isBlancoRoute) {
        const validBlancoColors = ['GOLDEN', 'PLATINUM', 'ASH'];
        if (validBlancoColors.includes(storedColor)) {
          setSelectedColor(storedColor);
        } else {
          // Invalid color for BLANCO, set to PLATINUM
          setSelectedColor('PLATINUM');
          if (isOnEditRoute) {
            localStorage.setItem('editSelectedColor', 'PLATINUM');
          } else if (isOnCustomizeRoute) {
            localStorage.setItem('customizeSelectedColor', 'PLATINUM');
          }
          localStorage.setItem('selectedColor', 'PLATINUM');
        }
      } else {
        setSelectedColor(storedColor);
      }
    } else if (!storedColor && isBlancoRoute) {
      // Set PLATINUM as default for blanco routes only if nothing is stored
      setSelectedColor('PLATINUM');
      if (isOnEditRoute) {
        localStorage.setItem('editSelectedColor', 'PLATINUM');
      } else if (isOnCustomizeRoute) {
        localStorage.setItem('customizeSelectedColor', 'PLATINUM');
      }
      localStorage.setItem('selectedColor', 'PLATINUM');
    }
  }, [location.pathname]); // Only reload when route changes, NOT when selectedColor changes
  const [selectedView, setSelectedView] = useState(1);
  const [showLoading, setShowLoading] = useState(true);
  
  // Cart count state
  const [cartCount, setCartCount] = useState(() => {
    return parseInt(localStorage.getItem('cartCount') || '0');
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
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  // Listen for cart count changes
  useEffect(() => {
    const handleCartCountUpdate = (event: CustomEvent) => {
      setCartCount(event.detail);
    };

    const handleStorageChange = () => {
      const newCartCount = parseInt(localStorage.getItem('cartCount') || '0');
      setCartCount(newCartCount);
      
      // Only update color from localStorage if we're NOT in blanco customize mode
      // (to prevent overwriting user selections)
      const pathname = window.location.pathname;
      const isOnEditRoute = pathname.includes('/edit');
      const isOnCustomizeRoute = pathname.includes('/customize');
      const isBlancoRoute = pathname.includes('/blanco/customize') || pathname.includes('/blanco/edit');
      
      // Skip color updates from storage events in blanco routes to prevent overwriting
      if (isBlancoRoute) {
        return;
      }
      
      let storedColor: string | null = null;
      if (isOnEditRoute) {
        storedColor = localStorage.getItem('editSelectedColor') || localStorage.getItem('selectedColor');
      } else if (isOnCustomizeRoute) {
        storedColor = localStorage.getItem('customizeSelectedColor') || localStorage.getItem('selectedColor');
      } else {
        storedColor = localStorage.getItem('selectedColor');
      }
      if (storedColor && storedColor !== selectedColor) {
        setSelectedColor(storedColor);
      }
    };

    // Listen for custom storage changes (same-tab)
    const handleCustomStorageChange = () => {
      handleStorageChange();
    };

    window.addEventListener('cartCountUpdated', handleCartCountUpdate as EventListener);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);
    window.addEventListener('customStorageChange', handleCustomStorageChange);

    return () => {
      window.removeEventListener('cartCountUpdated', handleCartCountUpdate as EventListener);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
      window.removeEventListener('customStorageChange', handleCustomStorageChange);
    };
  }, [selectedColor]); // Add selectedColor to dependencies to ensure updates

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
    const isOnCustomizeRoute = pathname.includes('/customize');
    const isBlancoRoute = pathname.includes('/blanco/customize') || pathname.includes('/blanco/edit');
    
    // CRITICAL: Check editSelected* keys first when in edit mode
    if (isOnEditRoute) {
      const editSelectedColor = localStorage.getItem('editSelectedColor');
      if (editSelectedColor) {
        setSelectedColor(editSelectedColor);
        return;
      }
      // Fallback to editingCartItem
      const editingCartItem = localStorage.getItem('editingCartItem');
      if (editingCartItem) {
        try {
          const item = JSON.parse(editingCartItem);
          console.log('Color page - loading edit mode color:', item.color);
          if (item.color) {
            setSelectedColor(item.color);
            // Also save to editSelected* for consistency
            localStorage.setItem('editSelectedColor', item.color);
          }
        } catch (e) {
          console.error('Color page - Error parsing editingCartItem:', e);
        }
      }
    }
    
    // CRITICAL: Check customizeSelected* keys when in customize mode
    if (isOnCustomizeRoute) {
      const customizeSelectedColor = localStorage.getItem('customizeSelectedColor');
      if (customizeSelectedColor) {
        setSelectedColor(customizeSelectedColor);
      } else if (isBlancoRoute) {
        // For blanco routes, set PLATINUM as default if nothing is stored
        setSelectedColor('PLATINUM');
        localStorage.setItem('selectedColor', 'PLATINUM');
        localStorage.setItem('customizeSelectedColor', 'PLATINUM');
      }
    }
  }, []);

  // Get wig views based on selected hairline from localStorage
  const getWigViews = () => {
    const pathname = window.location.pathname;
    // Check if we're in product-specific customize or edit modes
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
    localStorage.setItem('isSignedIn', 'false');
    localStorage.removeItem('currentUser');
    // Dispatch custom event to update other pages in same tab
    window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'false' }));
    setShowSignOutConfirm(false);
    // Close mobile menu
    setShowMobileMenu(false);
  };

  const wigViews = getWigViews();

  // Check if we're in blanco route (both customize and edit modes)
  const isBlancoRoute = location.pathname.includes('/blanco/customize') || location.pathname.includes('/blanco/edit');
  

  // Color options with accurate hex codes from reference
  // For blanco routes (both customize and edit), only show 3 colors: Golden, Platinum, Ash
  const colorOptions: ColorOption[] = isBlancoRoute ? [
    {
      id: 'GOLDEN',
      name: 'GOLDEN',
      description: 'Golden blonde',
      price: -20, // -$20 discount
      colorCode: '#FBF08B',
      image: ''
    },
    {
      id: 'PLATINUM',
      name: 'PLATINUM',
      description: 'Platinum blonde',
      price: 0, // Default, no additional cost
      colorCode: '#F6F3D2',
      image: ''
    },
    {
      id: 'ASH',
      name: 'ASH',
      description: 'Ash blonde',
      price: 20, // $20 additional cost
      colorCode: '#E5E3CB',
      image: ''
    }
  ] : [
    {
      id: 'JET BLACK',
      name: 'JET BLACK',
      description: 'Deep black',
      price: 100,
      colorCode: '#000000',
      image: ''
    },
    {
      id: 'OFF BLACK',
      name: 'OFF BLACK',
      description: 'Natural black',
      price: 0,
      colorCode: '#2A2424',
      image: ''
    },
    {
      id: 'ESPRESSO',
      name: 'ESPRESSO',
      description: 'Rich dark brown',
      price: 100,
      colorCode: '#3B1301',
      image: ''
    },
    {
      id: 'CHESTNUT',
      name: 'CHESTNUT',
      description: 'Medium brown',
      price: 100,
      colorCode: '#6C2D11',
      image: ''
    },
    {
      id: 'HONEY',
      name: 'HONEY',
      description: 'Golden brown',
      price: 100,
      colorCode: '#C58628',
      image: ''
    },
    {
      id: 'AUBURN',
      name: 'AUBURN',
      description: 'Reddish brown',
      price: 100,
      colorCode: '#9C5617',
      image: ''
    },
    {
      id: 'COPPER',
      name: 'COPPER',
      description: 'Copper red',
      price: 100,
      colorCode: '#802F02',
      image: ''
    },
    {
      id: 'GINGER',
      name: 'GINGER',
      description: 'Bright orange',
      price: 100,
      colorCode: '#F64F07',
      image: ''
    },
    {
      id: 'SANGRIA',
      name: 'SANGRIA',
      description: 'Deep red wine',
      price: 100,
      colorCode: '#7E0A1E',
      image: ''
    },
    {
      id: 'CHERRY',
      name: 'CHERRY',
      description: 'Bright cherry red',
      price: 100,
      colorCode: '#D70808',
      image: ''
    },
    {
      id: 'RASPBERRY',
      name: 'RASPBERRY',
      description: 'Raspberry pink',
      price: 100,
      colorCode: '#EF0461',
      image: ''
    },
    {
      id: 'PLUM',
      name: 'PLUM',
      description: 'Deep plum purple',
      price: 100,
      colorCode: '#640E82',
      image: ''
    },
    {
      id: 'COBALT',
      name: 'COBALT',
      description: 'Deep cobalt blue',
      price: 100,
      colorCode: '#290481',
      image: ''
    },
    {
      id: 'TEAL',
      name: 'TEAL',
      description: 'Teal green',
      price: 100,
      colorCode: '#46EBCA',
      image: ''
    },
    {
      id: 'SLIME',
      name: 'SLIME',
      description: 'Bright lime green',
      price: 100,
      colorCode: '#03D92A',
      image: ''
    },
    {
      id: 'CITRINE',
      name: 'CITRINE',
      description: 'Citrine yellow',
      price: 100,
      colorCode: '#E2E91C',
      image: ''
    }
  ];

  const handleColorSelect = (colorId: string) => {
    console.log('Color page - selecting color:', colorId);
    setSelectedColor(colorId);
    // Immediately save to localStorage to prevent overwriting
    const pathname = location.pathname;
    const isOnEditRoute = pathname.includes('/edit');
    const isOnCustomizeRoute = pathname.includes('/customize');
    
    if (isOnEditRoute) {
      localStorage.setItem('editSelectedColor', colorId);
    }
    if (isOnCustomizeRoute) {
      localStorage.setItem('customizeSelectedColor', colorId);
    }
    localStorage.setItem('selectedColor', colorId);
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
      localStorage.setItem('selectedColor', selectedColor);
      localStorage.setItem('selectedColorPrice', price);
      
      // Also save with 'editSelected' prefix in edit mode
      if (isOnProductSpecificEditRoute) {
        localStorage.setItem('editSelectedColor', selectedColor);
        localStorage.setItem('editSelectedColorPrice', price);
      }
      
      // Also save with 'customizeSelected' prefix in customize mode
      if (isOnProductSpecificCustomizeRoute) {
        localStorage.setItem('customizeSelectedColor', selectedColor);
        localStorage.setItem('customizeSelectedColorPrice', price);
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

  const handleConfirmSelection = () => {
    console.log('Color page - confirming selection:', selectedColor);
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
    
    let sourceRoute = sessionStorage.getItem('sourceRoute');
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
      }
    }
    
    // Always save with 'selected' prefix
    localStorage.setItem('selectedColor', selectedColor);
    localStorage.setItem('selectedColorPrice', price);
    
    // Also save with 'editSelected' prefix in edit mode
    if (isEditMode) {
      console.log('[COLOR PAGE] Saving editSelectedColor:', selectedColor, 'Price:', price);
      localStorage.setItem('editSelectedColor', selectedColor);
      localStorage.setItem('editSelectedColorPrice', price);
      // Verify it was saved
      const verify = localStorage.getItem('editSelectedColor');
      console.log('[COLOR PAGE] Verification - editSelectedColor in localStorage:', verify);
    }
    
    // Also save with 'customizeSelected' prefix in customize mode
    if (isCustomizeMode) {
      localStorage.setItem('customizeSelectedColor', selectedColor);
      localStorage.setItem('customizeSelectedColorPrice', price);
    }
    
    console.log('Color page - saved to localStorage:', {
      selectedColor,
      price: getSelectedPrice(),
      isEditMode,
      isCustomizeMode,
      editSelectedColor: localStorage.getItem('editSelectedColor'),
      selectedColorFromStorage: localStorage.getItem('selectedColor')
    });
    
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
    } else if (location.pathname.startsWith('/build-a-wig/noir/customize/')) {
      returnRoute = '/build-a-wig/noir/customize';
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
    } else if (sourceRoute) {
      returnRoute = sourceRoute;
    }
    
    console.log('Color page - Navigating back to route:', returnRoute);
    
    // Set flag to indicate we're returning from a sub-page
    sessionStorage.setItem('comingFromSubPage', 'true');
    
    // Dispatch custom event to notify main page of changes
    console.log('Color page - dispatching customStorageChange event');
    window.dispatchEvent(new CustomEvent('customStorageChange'));
    
    // Add a small delay to ensure the event is processed
    setTimeout(() => {
      navigate(returnRoute);
    }, 100);
  };

  const getSelectedPrice = () => {
    const pathname = location.pathname;
    const isOnEditRoute = pathname.includes('/edit');
    const isOnCustomizeRoute = pathname.includes('/customize');
    
    // For edit and customize modes (excluding blanco routes)
    if ((isOnEditRoute || isOnCustomizeRoute) && !isBlancoRoute) {
      // OFF BLACK and PLATINUM are $0
      if (selectedColor === 'OFF BLACK' || selectedColor === 'PLATINUM') {
        return 0;
      }
      // All other colors are $120
      return 120;
    }
    
    const selected = colorOptions.find(option => option.id === selectedColor);
    if (!selected) return 0;
    
    let price = selected.price;
    
    // For blanco colors, don't add length surcharge
    if (isBlancoRoute) {
      return price; // Golden is -20, Platinum and Ash are 0
    }
    
    // Add extra $40 for lengths over 30" (excluding OFF BLACK which stays $0)
    if (selected.id !== 'OFF BLACK') {
      const selectedLength = localStorage.getItem('selectedLength');
      const longLengths = ['30"', '32"', '34"', '36"', '40"'];
      if (selectedLength && longLengths.includes(selectedLength)) {
        price += 40;
      }
    }
    
    return price;
  };

  // Get dynamic color note text based on selected color option
  const getColorNoteText = () => {
    const currentColor = selectedColor;
    
    // For off black color option
    if (currentColor === 'OFF BLACK') {
      return (
        <>
          COLOR MATCH IS PROXIMATE, BUT NOT EXACT.<br />
          STANDARD PROCESSING TIME APPLIES.
        </>
      );
    }
    
    // For all other color options
    return (
      <>
        COLOR MATCH IS PROXIMATE, BUT NOT EXACT.<br />
        EXPECT AN ADDITIONAL WEEK OF PROCESSING TIME.
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
                  onClick={() => navigate(localStorage.getItem('isSignedIn') === 'true' ? '/account' : '/sign-in')}
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
                  onClick={() => navigate(localStorage.getItem('isSignedIn') === 'true' ? '/wishlist' : '/sign-in')} 
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
                onClick={() => {
                  const pathname = location.pathname;
                  if (pathname.includes('/noir/')) navigate('/build-a-wig/noir');
                  else if (pathname.includes('/blanco/')) navigate('/build-a-wig/blanco');
                  else if (pathname.includes('/soft-wave/')) navigate('/build-a-wig/soft-wave');
                  else if (pathname.includes('/soft-curl/')) navigate('/build-a-wig/soft-curl');
                  else if (pathname.includes('/ocean-curl/')) navigate('/build-a-wig/ocean-curl');
                  else if (pathname.includes('/beach-wave/')) navigate('/build-a-wig/beach-wave');
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
                </>
              )}
            </p>
            <div className="gap-5 flex absolute" style={{ right: '17px' }}>
              <div>
                <DynamicCartIcon count={cartCount} width={22} height={19} />
              </div>
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

          {/* MAIN BUILD AREA */}
          <div
            className="border border-black flex flex-col pt-6 pb-4 mb-2 bg-white/60 backdrop-blur-sm transition-all duration-300 ease-out"
            style={{ 
              borderWidth: '1.3px',
              paddingLeft: (() => {
                const pathname = location.pathname;
                if (pathname.includes('/soft-wave') || pathname.includes('/soft-curl')) {
                  return '10px'; // Reduced padding for SOFT WAVE/CURL
                }
                return '20px'; // Default padding (px-5 = 1.25rem = 20px)
              })(),
              paddingRight: (() => {
                const pathname = location.pathname;
                if (pathname.includes('/soft-wave') || pathname.includes('/soft-curl')) {
                  return '10px'; // Reduced padding for SOFT WAVE/CURL
                }
                return '20px'; // Default padding (px-5 = 1.25rem = 20px)
              })(),
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
                      borderBottom: mobileMenuActiveTab === 'SHOP' ? '2px solid #EB1C24' : 'none',
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
                      borderBottom: mobileMenuActiveTab === 'TOOLS' ? '2px solid #EB1C24' : 'none',
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
                      borderBottom: mobileMenuActiveTab === 'BRAND' ? '2px solid #EB1C24' : 'none',
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
                                  // If UNITS is already expanded, navigate to shop/units page
                                  if (item.label === 'UNITS' && mobileMenuExpandedItems.includes(item.label)) {
                                    navigate('/shop/units');
                                  } else {
                                    // Otherwise, toggle expansion
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
                        const pathname = location.pathname;
                        if (pathname.includes('/soft-wave/') || pathname.includes('/soft-curl/') || pathname.includes('/blanco/')) {
                          return 'calc(clamp(2rem, 4vw, 2.5rem) + 8px)'; // Same size for SOFT WAVE/CURL/BLANCO
                        }
                        return undefined; // Default size
                      })(),
                      transform: (() => {
                        const pathname = location.pathname;
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
                <img
                  src={wigViews[selectedView]}
                  alt="Selected Wig"
                  width="282"
                  height="387"
                  className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hero-mannequin-img"
                  style={{ 
                    top: 'calc(50% - 10.601px + 18px)',
                    '--hero-width': '282px',
                    '--hero-height': '387px',
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
                          top: 'calc(50% - 6.1px + 7.2px)',
                          ...(index === 0 && { left: 'calc(50% - 6px)' }),
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

            {/* SELECTION AREA */}
            <div className="w-full flex flex-col lg:mt-0 mt-0">
              {/* COLOR SELECTION HEADER */}
            <p 
              className="text-xs sm:text-sm text-center text-red-500 mb-4"
              style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', color: '#EB1C24', transform: 'translateY(18px)' }}
            >
              SINGLE COLOR DYE
            </p>

            {/* COLOR OPTIONS */}
            <div className={`grid ${isBlancoRoute ? 'grid-cols-3' : 'grid-cols-4'} gap-3 mx-auto justify-center mb-6 ${isBlancoRoute ? 'max-w-[240px]' : 'max-w-[320px]'}`} style={{ marginTop: '15px' }}>
              {colorOptions.map((option) => (
                <ThumbBox
                  key={option.id}
                  image={option.image}
                  title="COLOR"
                  label={option.name}
                  isSelected={selectedColor === option.id}
                  onClick={() => handleColorSelect(option.id)}
                  imgSize={35}
                  containerSize={60}
                  colorCode={option.colorCode}
                />
              ))}
            </div>

            {/* NOTE FOR PROCESSING TIME */}
            <p
              className="font-futura text-[10px] md:text-xs text-center my-6 w-[95%] mx-auto uppercase"
              style={{
                color: '#EB1C24',
                fontFamily: '"Futura PT Demi"',
                fontWeight: '500',
                transform: 'translateY(-7px)'
              }}
            >
              {getColorNoteText()}
            </p>

            {/* TOTAL PRICE */}
            <div className="text-center">
              <p className="font-futura text-[12px] font-medium" style={{ color: '#909090' }}>
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
        <div className="px-0 md:px-0 flex justify-center" style={{ marginTop: '2px', transform: 'translateY(0px)' }}>
          <button
            onClick={handleConfirmSelection}
            className="border border-black font-futura w-full max-w-m text-center py-2 text-[12px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
            style={{ borderWidth: '1.3px', color: '#EB1C24' }}
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

export default ColorSelection;
