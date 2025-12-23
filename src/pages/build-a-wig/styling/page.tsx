
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ThumbBox from '../../../components/ThumbBox';
import DynamicCartIcon from '../../../components/DynamicCartIcon';
import LoadingScreen from '../../../components/base/LoadingScreen';

export default function StylingSelectionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedView, setSelectedView] = useState(1);
  const [selectedHairStyling, setSelectedHairStyling] = useState<string[]>(() => {
    const pathname = window.location.pathname;
    const isOnEditRoute = pathname.includes('/edit');
    const isOnCustomizeRoute = pathname.includes('/noir/customize') ||
                               pathname.includes('/blanco/customize') ||
                               pathname.includes('/soft-wave/customize') ||
                               pathname.includes('/soft-curl/customize');
    
    // CRITICAL: Check editSelected* keys first when in edit mode
    if (isOnEditRoute) {
      const editSelectedStyling = localStorage.getItem('editSelectedStyling');
      if (editSelectedStyling) {
        return [editSelectedStyling];
      }
      // Fallback to editingCartItem
      const editingCartItem = localStorage.getItem('editingCartItem');
      if (editingCartItem) {
        try {
          const item = JSON.parse(editingCartItem);
          if (item.styling) {
            return [item.styling];
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
    
    // CRITICAL: Check customizeSelected* keys when in customize mode
    if (isOnCustomizeRoute) {
      const customizeSelectedStyling = localStorage.getItem('customizeSelectedStyling');
      if (customizeSelectedStyling) {
        return [customizeSelectedStyling];
      }
    }
    
    // Main mode: use selected* keys
    const stored = localStorage.getItem('selectedHairStyling');
    return stored ? [stored] : []; // empty array means no hair styling selected
  });
  const [selectedPartSelection, setSelectedPartSelection] = useState(() => {
    const pathname = window.location.pathname;
    const isOnEditRoute = pathname.includes('/edit');
    const isOnCustomizeRoute = pathname.includes('/noir/customize') ||
                               pathname.includes('/blanco/customize') ||
                               pathname.includes('/soft-wave/customize') ||
                               pathname.includes('/soft-curl/customize');
    
    // CRITICAL: Check if styling is actually selected (not NONE or empty)
    let hasStyling = false;
    
    if (isOnEditRoute) {
      // Check editSelectedStyling first
      const editSelectedStyling = localStorage.getItem('editSelectedStyling');
      if (editSelectedStyling && editSelectedStyling !== 'NONE' && editSelectedStyling.trim() !== '') {
        hasStyling = true;
      } else {
        // Fallback to editingCartItem
        const editingCartItem = localStorage.getItem('editingCartItem');
        if (editingCartItem) {
          try {
            const item = JSON.parse(editingCartItem);
            if (item.styling && item.styling !== 'NONE' && item.styling.trim() !== '') {
              hasStyling = true;
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    } else if (isOnCustomizeRoute) {
      const customizeSelectedStyling = localStorage.getItem('customizeSelectedStyling');
      if (customizeSelectedStyling && customizeSelectedStyling !== 'NONE' && customizeSelectedStyling.trim() !== '') {
        hasStyling = true;
      }
    } else {
      const storedStyling = localStorage.getItem('selectedHairStyling');
      if (storedStyling && storedStyling !== 'NONE' && storedStyling.trim() !== '') {
        hasStyling = true;
      }
    }
    
    const storedPartSelection = localStorage.getItem('selectedPartSelection') || 'MIDDLE';
    
    // CRITICAL: If no styling is selected (or styling is NONE), force MIDDLE regardless of what's stored
    if (!hasStyling && storedPartSelection !== 'MIDDLE') {
      console.log('Part selection initialization: No styling selected, forcing MIDDLE (was:', storedPartSelection, ')');
      return 'MIDDLE';
    }
    
    return storedPartSelection;
  });
  const [showLoading, setShowLoading] = useState(true);
  
  // Mobile menu state
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mobileMenuActiveTab, setMobileMenuActiveTab] = useState('SHOP');
  const [mobileMenuExpandedItems, setMobileMenuExpandedItems] = useState<string[]>([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  
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

  // CRITICAL: Reset part selection to MIDDLE when no styling is selected
  useEffect(() => {
    // Check if styling is actually selected (not empty array and not 'NONE')
    const hasStylingSelected = selectedHairStyling.length > 0 && 
                               selectedHairStyling.some(s => s !== 'NONE' && s.trim() !== '');
    
    if (!hasStylingSelected && selectedPartSelection !== 'MIDDLE') {
      console.log('Resetting part selection to MIDDLE because no styling is selected. Current styling:', selectedHairStyling, 'Current part:', selectedPartSelection);
      setSelectedPartSelection('MIDDLE');
      localStorage.setItem('selectedPartSelection', 'MIDDLE');
    }
  }, [selectedHairStyling, selectedPartSelection]);

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

  // Hair styling options with local assets
  const hairStylingOptions = [
    {
      id: 'BANGS',
      name: 'BANGS',
      image: '/assets/Bangs-icon.svg',
      price: 40
    },
    {
      id: 'CRIMPS',
      name: 'CRIMPS',
      image: '/assets/Crimps-icon.svg',
      price: 80
    },
    {
      id: 'FLAT IRON',
      name: 'FLAT IRON',
      image: '/assets/Flat iron-icon.svg',
      price: 80
    },
    {
      id: 'LAYERS',
      name: 'LAYERS',
      image: '/assets/Layers-icon.svg',
      price: 100
    }
  ];

  // Part selection options
  const partSelectionOptions = [
    {
      id: 'LEFT',
      name: 'LEFT',
      image: '/assets/left angle-icon.svg',
      price: 0,
      textDisplay: 'L'
    },
    {
      id: 'MIDDLE',
      name: 'MIDDLE',
      image: '/assets/front angle-icon.svg',
      price: 0,
      textDisplay: 'M'
    },
    {
      id: 'RIGHT',
      name: 'RIGHT',
      image: '/assets/right angle-icon.svg',
      price: 0,
      textDisplay: 'R'
    }
  ];

  const handleHairStylingSelect = (stylingId: string) => {
    const currentSelections = selectedHairStyling;
    
    if (currentSelections.includes(stylingId)) {
      // Deselect the styling option
      if (stylingId === 'BANGS') {
        // If deselecting bangs, keep the secondary option if it exists
        if (currentSelections.length > 1) {
          // Keep the secondary option (non-bangs option)
          const secondaryOption = currentSelections.find(id => id !== 'BANGS');
          setSelectedHairStyling([secondaryOption!]);
        } else {
          // If only bangs was selected, clear all selections
          setSelectedHairStyling([]);
          setSelectedPartSelection('MIDDLE'); // Default to MIDDLE when no hair styling is selected
        }
      } else {
        // If deselecting secondary option, remove it and keep only bangs if it exists
        const remainingSelections = currentSelections.filter(id => id !== stylingId);
        setSelectedHairStyling(remainingSelections);
        
        // If no selections remain, reset part selection to MIDDLE
        if (remainingSelections.length === 0) {
          setSelectedPartSelection('MIDDLE');
        }
      }
    } else {
      // Add new styling option with combination logic
      if (stylingId === 'BANGS') {
        // If selecting bangs, it becomes the primary selection (replaces current selection)
        setSelectedHairStyling(['BANGS']);
      } else {
        // If selecting non-bangs option
        if (currentSelections.includes('BANGS')) {
          // If bangs is already selected, replace the secondary option
          setSelectedHairStyling(['BANGS', stylingId]);
        } else {
          // If bangs is not selected, this replaces the current selection (no combination)
          setSelectedHairStyling([stylingId]);
        }
      }
    }
  };

  const handlePartSelectionSelect = (partId: string) => {
    // CRITICAL: Check if styling is actually selected (not empty and not 'NONE')
    const hasStylingSelected = selectedHairStyling.length > 0 && 
                               selectedHairStyling.some(s => s !== 'NONE' && s.trim() !== '');
    
    // Only allow changing part selection if hair styling is selected
    // MIDDLE can always be selected, but LEFT and RIGHT require hair styling
    if (partId === 'MIDDLE' || hasStylingSelected) {
      setSelectedPartSelection(partId);
    } else {
      console.log('handlePartSelectionSelect: Blocked selection of', partId, '- no styling selected');
    }
  };

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
    setIsSignedIn(!isSignedIn);
  };

  const getTotalStylingPrice = () => {
    if (selectedHairStyling.length === 0) {
      return 0;
    }
    
    const hasBangs = selectedHairStyling.includes('BANGS');
    const otherStyling = selectedHairStyling.find(id => id !== 'BANGS');
    
    // Get selected length from localStorage to check if it's 30" or above
    const selectedLength = localStorage.getItem('selectedLength') || '';
    const isLongLength = selectedLength.includes('30') || selectedLength.includes('32') || selectedLength.includes('34') || selectedLength.includes('36');
    
    if (hasBangs && otherStyling) {
      // Bangs + another styling: full price of secondary option + $20 for bangs (reduced from $40)
      const secondaryStyling = hairStylingOptions.find(opt => opt.id === otherStyling);
      let secondaryPrice = secondaryStyling?.price || 0;
      
      // Add $40 for lengths 30" and above for crimps, flat iron, and layers
      if (isLongLength && (otherStyling === 'CRIMPS' || otherStyling === 'FLAT IRON' || otherStyling === 'LAYERS')) {
        secondaryPrice += 40;
      }
      
      return secondaryPrice + 20; // $20 for bangs when combined
    } else if (hasBangs) {
      // Bangs only: $40 (base price)
      return 40;
    } else {
      // Other styling only: use original price + length surcharge
      const styling = hairStylingOptions.find(opt => opt.id === selectedHairStyling[0]);
      let basePrice = styling?.price || 0;
      
      // Add $40 for lengths 30" and above for crimps, flat iron, and layers
      if (isLongLength && (selectedHairStyling[0] === 'CRIMPS' || selectedHairStyling[0] === 'FLAT IRON' || selectedHairStyling[0] === 'LAYERS')) {
        basePrice += 40;
      }
      
      return basePrice;
    }
  };

  const totalPrice = getTotalStylingPrice();

  // Get dynamic styling note text based on selected styling option
  const getStylingNoteText = () => {
    const hasBangs = selectedHairStyling.includes('BANGS');
    const otherStyling = selectedHairStyling.find(styling => styling !== 'BANGS');
    
    // When no styling is selected
    if (selectedHairStyling.length === 0) {
      return (
        <>
          UNIT COMES CO-WASHED IN ITS NATURAL STATE.<br />
          STANDARD PROCESSING TIME APPLIES.
        </>
      );
    }
    
    // For bangs only
    if (hasBangs && !otherStyling) {
      return (
        <>
          CURTAIN BANGS WITH FACE FRAMING LAYERS.<br />
          STANDARD PROCESSING TIME APPLIES.
        </>
      );
    }
    
    // For crimps only
    if (otherStyling === 'CRIMPS' && !hasBangs) {
      return (
        <>
          TEXTURED WAVES USING HOT TOOLS.<br />
          EXPECT AN ADDITIONAL WEEK OF PROCESSING TIME.
        </>
      );
    }
    
    // For flat iron only
    if (otherStyling === 'FLAT IRON' && !hasBangs) {
      return (
        <>
          HAIR IS PRESSED BONE STRAIGHT USING HOT TOOLS.<br />
          EXPECT AN ADDITIONAL WEEK OF PROCESSING TIME.
        </>
      );
    }
    
    // For layers only
    if (otherStyling === 'LAYERS' && !hasBangs) {
      return (
        <>
          BOUNCY, LAYERED CURLS USING HOT TOOLS.<br />
          EXPECT AN ADDITIONAL WEEK OF PROCESSING TIME.
        </>
      );
    }
    
    // For bangs + crimps combination
    if (hasBangs && otherStyling === 'CRIMPS') {
      return (
        <>
          CURTAIN BANGS WITH TEXTURED WAVES.<br />
          EXPECT AN ADDITIONAL WEEK OF PROCESSING TIME.
        </>
      );
    }
    
    // For bangs + flat iron combination
    if (hasBangs && otherStyling === 'FLAT IRON') {
      return (
        <>
          CURTAIN BANGS WITH BONE STRAIGHT HAIR.<br />
          EXPECT AN ADDITIONAL WEEK OF PROCESSING TIME.
        </>
      );
    }
    
    // For bangs + layers combination
    if (hasBangs && otherStyling === 'LAYERS') {
      return (
        <>
          CURTAIN BANGS WITH LAYERED CURLS.<br />
          EXPECT AN ADDITIONAL WEEK OF PROCESSING TIME.
        </>
      );
    }
    
    // For other styling options, return default text
    return 'PLEASE NOTE: EACH CUSTOM UNIT IS MADE TO ORDER. WE ENSURE ALL DETAILS ARE ACCURATE + PRECISE. EXPECT 6 - 8 WEEKS OF PROCESSING TIME FOR THIS UNIT.';
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
      const price = getTotalStylingPrice().toString();
      const stylingValue = selectedHairStyling.length > 0 ? selectedHairStyling[0] : 'NONE';
      
      // Save hair styling (can be empty array if none selected)
      if (selectedHairStyling.length > 0) {
        localStorage.setItem('selectedHairStyling', selectedHairStyling.join(','));
      } else {
        localStorage.removeItem('selectedHairStyling');
      }
      
      // Save part selection (always has a value, defaults to MIDDLE)
      localStorage.setItem('selectedPartSelection', selectedPartSelection);
      localStorage.setItem('selectedStylingPrice', price);
      
      // Also save with 'editSelected' prefix in edit mode
      if (isOnProductSpecificEditRoute) {
        if (stylingValue && stylingValue !== 'NONE') {
          localStorage.setItem('editSelectedStyling', stylingValue);
        } else {
          localStorage.removeItem('editSelectedStyling');
        }
        localStorage.setItem('editSelectedStylingPrice', price);
      }
      
      // Also save with 'customizeSelected' prefix in customize mode
      if (isOnProductSpecificCustomizeRoute) {
        if (stylingValue && stylingValue !== 'NONE') {
          localStorage.setItem('customizeSelectedStyling', stylingValue);
        } else {
          localStorage.removeItem('customizeSelectedStyling');
        }
        localStorage.setItem('customizeSelectedStylingPrice', price);
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
    // Save hair styling (can be empty array if none selected)
    if (selectedHairStyling.length > 0) {
      localStorage.setItem('selectedHairStyling', selectedHairStyling.join(','));
    } else {
      localStorage.removeItem('selectedHairStyling');
    }
    
    // Save part selection (always has a value, defaults to MIDDLE)
    localStorage.setItem('selectedPartSelection', selectedPartSelection);
    
    const price = getTotalStylingPrice().toString();
    
    // Check if we're in edit mode or customize mode for ALL products
    const pathname = window.location.pathname;
    const isEditMode = localStorage.getItem('editingCartItem') !== null || 
                       pathname.includes('/noir/edit') ||
                       pathname.includes('/blanco/edit') ||
                       pathname.includes('/soft-wave/edit') ||
                       pathname.includes('/soft-curl/edit');
    
    // Check if we're in customize mode for ALL products
    const isCustomizeMode = pathname.includes('/noir/customize') ||
                            pathname.includes('/blanco/customize') ||
                            pathname.includes('/soft-wave/customize') ||
                            pathname.includes('/soft-curl/customize');
    
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
        } else if (pathname.includes('/noir/edit')) {
          sourceRoute = '/build-a-wig/noir/edit';
        } else {
          sourceRoute = '/build-a-wig/edit'; // Fallback
        }
        console.log('Styling page - No sourceRoute found, detected edit mode from localStorage/pathname');
      } else if (selectedCapSize || isCustomizeMode) {
        // Determine product-specific customize route from pathname
        if (pathname.includes('/blanco/customize')) {
          sourceRoute = '/build-a-wig/blanco/customize';
        } else if (pathname.includes('/soft-wave/customize')) {
          sourceRoute = '/build-a-wig/soft-wave/customize';
        } else if (pathname.includes('/soft-curl/customize')) {
          sourceRoute = '/build-a-wig/soft-curl/customize';
        } else if (pathname.includes('/noir/customize')) {
          sourceRoute = '/build-a-wig/noir/customize';
        } else {
          sourceRoute = '/build-a-wig'; // Fallback
        }
        console.log('Styling page - No sourceRoute found, detected customize mode from localStorage/pathname:', sourceRoute);
      } else {
        sourceRoute = '/build-a-wig';
        console.log('Styling page - No sourceRoute found, defaulting to main page');
      }
    }
    
    // Save styling - only save actual styling selections, not part selection when no styling is selected
    const stylingValue = selectedHairStyling.length > 0 ? selectedHairStyling[0] : 'NONE';
    
    // Always save with 'selected' prefix
    localStorage.setItem('selectedStyling', stylingValue);
    localStorage.setItem('selectedStylingPrice', price);
    
    // Also save with 'editSelected' prefix in edit mode
    if (isEditMode) {
      localStorage.setItem('editSelectedStyling', stylingValue);
      localStorage.setItem('editSelectedStylingPrice', price);
    }
    
    // Also save with 'customizeSelected' prefix in customize mode
    if (isCustomizeMode) {
      localStorage.setItem('customizeSelectedStyling', stylingValue);
      localStorage.setItem('customizeSelectedStylingPrice', price);
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
    } else if (location.pathname.startsWith('/build-a-wig/beach-wave/edit/')) {
      returnRoute = '/build-a-wig/beach-wave/edit';
    } else if (location.pathname.startsWith('/build-a-wig/ocean-curl/edit/')) {
      returnRoute = '/build-a-wig/ocean-curl/edit';
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
    } else if (location.pathname.startsWith('/build-a-wig/beach-wave/customize/')) {
      returnRoute = '/build-a-wig/beach-wave/customize';
    } else if (location.pathname.startsWith('/build-a-wig/ocean-curl/customize/')) {
      returnRoute = '/build-a-wig/ocean-curl/customize';
    } else if (sourceRoute) {
      returnRoute = sourceRoute;
    }
    
    console.log('Styling page - Navigating back to route:', returnRoute);
    
    // Set flag to indicate we're returning from a sub-page
    sessionStorage.setItem('comingFromSubPage', 'true');
    
    // Dispatch custom event to notify main page of changes
    window.dispatchEvent(new CustomEvent('customStorageChange'));
    
    navigate(returnRoute);
  };

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
          </div>
            <p className="text-sm" style={{ fontFamily: '"Futura PT Book"', transform: 'translateY(1px)' }}>
              <span 
                style={{ fontFamily: '"Futura PT Book"', fontWeight: '400', cursor: 'pointer' }}
                onClick={() => {
                  const pathname = window.location.pathname;
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
              </span>
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
          className="border border-black flex flex-col pt-6 pb-4 mb-2 bg-white/60 backdrop-blur-sm"
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
                  backgroundRepeat: 'no-repeat',
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

          {/* HAIR STYLING SECTION */}
            <p 
              className="text-xs sm:text-sm text-center text-red-500 mb-4"
              style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', color: '#EB1C24', transform: 'translateY(18px)' }}
            >
              SALON TREATMENTS
            </p>

            {/* HAIR STYLING OPTIONS */}
            <div className="grid grid-cols-4 gap-3 mx-auto justify-center mb-6 max-w-[320px]" style={{ marginTop: '13px' }}>
              {hairStylingOptions.map((option) => (
                <ThumbBox
                  key={option.id}
                  image={option.image}
                  title="STYLING"
                  label={option.name}
                  isSelected={selectedHairStyling.includes(option.id)}
                  onClick={() => handleHairStylingSelect(option.id)}
                  imgSize={75}
                  containerSize={60}
                  topPosition="53%"
                />
              ))}
            </div>

          {/* PART SELECTION SECTION */}
          <div style={{ transform: 'translateY(15px)' }}>
            <p 
              className="text-xs sm:text-sm text-center text-red-500 mb-4"
              style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', color: '#EB1C24', transform: 'translateY(2px)' }}
            >
              PART SELECTION
            </p>

            {/* PART SELECTION OPTIONS */}
            <div className="flex justify-center items-center mb-6" style={{ marginTop: '15px' }}>
              <div className="grid grid-cols-3 gap-3">
              {partSelectionOptions.map((option) => {
                // CRITICAL: Check if styling is actually selected (not empty and not 'NONE')
                const hasStylingSelected = selectedHairStyling.length > 0 && 
                                           selectedHairStyling.some(s => s !== 'NONE' && s.trim() !== '');
                const isDisabled = option.id !== 'MIDDLE' && !hasStylingSelected;
                console.log(`Part selection ${option.id}: isDisabled=${isDisabled}, selectedHairStyling:`, selectedHairStyling, 'hasStylingSelected:', hasStylingSelected);
                return (
                  <ThumbBox
                    key={option.id}
                    image={option.image}
                    title="STYLING"
                    label={option.name}
                    isSelected={selectedPartSelection === option.id}
                    onClick={() => {
                      console.log('Part selection clicked:', option.id, 'selectedHairStyling:', selectedHairStyling, 'hasStylingSelected:', hasStylingSelected);
                      if (option.id === 'MIDDLE' || hasStylingSelected) {
                        handlePartSelectionSelect(option.id);
                      } else {
                        console.log('Selection blocked for:', option.id, '- no styling selected');
                      }
                    }}
                    imgSize={75}
                    containerSize={60}
                    topPosition="53%"
                    textDisplay={option.textDisplay}
                    isDisabled={isDisabled}
                  />
                );
              })}
              </div>
            </div>
          </div>

            {/* NOTE AND TOTAL PRICE SECTION */}
            <div style={{ transform: 'translateY(15px)' }}>
            {/* DYNAMIC STYLING NOTE */}
            <p
                className="font-futura text-[10px] md:text-xs text-center my-6 w-[95%] mx-auto uppercase"
                style={{ color: '#EB1C24', fontFamily: '"Futura PT Demi"', fontWeight: '500', transform: 'translateY(-7px)' }}
            >
              {getStylingNoteText()}
            </p>

            {/* TOTAL PRICE */}
            <div className="text-center mb-4">
              <p className="font-futura text-[12px] font-medium" style={{ color: '#909090' }}>
                TOTAL DUE
              </p>
              <p 
                className="text-black font-medium text-base"
                style={{ fontFamily: '"Futura PT Medium"', fontWeight: '5' }}
              >
                {totalPrice < 0 ? '-' : totalPrice > 0 ? '+' : ''}${Math.abs(totalPrice)} USD
              </p>
            </div>

          </div>
            </div>

            {/* CONFIRM SELECTION BUTTON */}
        <div className="px-0 md:px-0 flex justify-center" style={{ marginTop: '2px', transform: 'translateY(0px)' }}>
            <button
              onClick={handleConfirmSelection}
            className="border border-black font-futura text-center py-2 text-[12px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
            style={{ borderWidth: '1.3px', color: '#EB1C24', width: '358px' }}
            >
              CONFIRM SELECTION
            </button>
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
              backgroundImage: 'url("/assets/Marble Floor.jpg")',
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
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                willChange: 'backdrop-filter'
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
                  style={{ width: '21px', height: '21px', transform: 'translateY(4px)' }}
                />
                {isSignedIn ? (
                  <img
                    src="/assets/NOIR/account-wishlist.svg"
                    alt="Wishlist"
                    style={{ width: '21px', height: '21px', transform: 'translateY(4px) translateX(-1px)' }}
                  />
                ) : (
                  <img
                    src="/assets/wishlist-heart.svg"
                    alt="Wishlist"
                    style={{ width: '21px', height: '21px', transform: 'translateY(4px) translateX(-1px)' }}
                  />
                )}
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
                          onClick={() => item.isExpandable ? handleMobileMenuItemToggle(item.label) : null}
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
                              <div key={subIndex} className="flex items-center">
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
    </div>
    </>
  );
}
