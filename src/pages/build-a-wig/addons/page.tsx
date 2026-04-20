import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ThumbBox from '../../../components/ThumbBox';
import DynamicCartIcon from '../../../components/DynamicCartIcon';
import LoadingScreen from '../../../components/base/LoadingScreen';
import ConfirmationModal from '../../../components/ConfirmationModal';
import BrandMenuLinks from '../../../components/BrandMenuLinks';
import SocialMenuIcons from '../../../components/SocialMenuIcons';
import { signOutAppAndSupabaseSession } from '../../../utils/adminAuth';
import { getBuildAWigFlowBasePath, isBuildAWigCustomizePath } from '../../../utils/buildAWigRoutes';
import { ShopMobileMenuShopTab } from '../../../components/ShopMobileMenuShopTab';
import { ShopMobileMenuToolsTab } from '../../../components/ShopMobileMenuToolsTab';
import { useBuildWigPremiumMembershipStepGate } from '../../../hooks/useBuildWigPremiumMembershipStepGate';
import { signInHrefWithReturnTo } from '../../../utils/signInReturnTo';
import { useShopNavSearchBar } from '../../../components/shop/useShopNavSearchBar';
import { useBawSubpageLiveNoirCompositeWigViews } from '../../../hooks/useBawSubpageLiveNoirCompositeWigViews';
import { useSignedInFromStorage } from '../../../hooks/useSignedInFromStorage';
import { BawNoirWigPreviewHeroThumbs } from '../../../components/buildWig/BawNoirWigPreviewFrames';

// Only these count as "styling confirmed" (BLEACH+PLUCK required). NONE or empty = user can select BLEACH+PLUCK alone.
const VALID_STYLING_OPTIONS = ['BANGS', 'CRIMPS', 'FLAT IRON', 'LAYERS'];
function isStylingValueConfirmed(raw: string | null): boolean {
  if (!raw || typeof raw !== 'string') return false;
  const v = raw.trim();
  if (!v || v === 'NONE') return false;
  const first = v.split(',')[0]?.trim();
  return !!first && VALID_STYLING_OPTIONS.includes(first);
}

export default function AddOnsSelectionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { NavCenter, SearchTrigger } = useShopNavSearchBar();
  const premiumMembershipStepModal = useBuildWigPremiumMembershipStepGate();
  const [selectedView, setSelectedView] = useState(1);
  const ADDONS_CORRECT_ORDER = ['BLEACH', 'PLUCK', 'BLUNT CUT'];

  const [selectedAddOns, setSelectedAddOns] = useState<string[]>(() => {
    const pathname = window.location.pathname;
    const isOnEditRoute = pathname.includes('/edit');
    const isOnCustomizeRoute = isBuildAWigCustomizePath(pathname);
    
    let initial: string[] = [];
    
    // CRITICAL: Check editSelected* keys first when in edit mode
    if (isOnEditRoute) {
      const editSelectedAddOns = localStorage.getItem('editSelectedAddOns');
      if (editSelectedAddOns) {
        try {
          initial = JSON.parse(editSelectedAddOns);
        } catch (e) {
          // Ignore parse errors
        }
      }
      if (initial.length === 0) {
        const editingCartItem = localStorage.getItem('editingCartItem');
        if (editingCartItem) {
          try {
            const item = JSON.parse(editingCartItem);
            if (item.addOns && Array.isArray(item.addOns)) {
              initial = item.addOns;
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    } else if (isOnCustomizeRoute) {
      const customizeSelectedAddOns = localStorage.getItem('customizeSelectedAddOns');
      if (customizeSelectedAddOns) {
        try {
          initial = JSON.parse(customizeSelectedAddOns);
        } catch (e) {
          // Ignore parse errors
        }
      }
    } else {
      const saved = localStorage.getItem('selectedAddOns');
      initial = saved ? JSON.parse(saved) : [];
    }
    
    // EDIT/CUSTOMIZE: Auto-select BLEACH + PLUCK only when a real styling option is confirmed (same whitelist as lock).
    if (isOnEditRoute || isOnCustomizeRoute) {
      const styleConfirmed = isOnEditRoute
        ? (() => {
            const s = localStorage.getItem('editSelectedStyling') || localStorage.getItem('selectedStyling');
            if (isStylingValueConfirmed(s)) return true;
            try {
              const item = JSON.parse(localStorage.getItem('editingCartItem') || '{}');
              return isStylingValueConfirmed(item.styling);
            } catch { return false; }
          })()
        : isStylingValueConfirmed(
            localStorage.getItem('customizeSelectedStyling') ||
            localStorage.getItem('selectedStyling') ||
            localStorage.getItem('selectedHairStyling')
          );
      if (styleConfirmed && (!initial.includes('BLEACH') || !initial.includes('PLUCK'))) {
        const merged = [...initial.filter(x => x !== 'BLEACH' && x !== 'PLUCK'), 'BLEACH', 'PLUCK'];
        initial = merged.sort((a, b) => ADDONS_CORRECT_ORDER.indexOf(a) - ADDONS_CORRECT_ORDER.indexOf(b));
      }
    }
    
    return initial;
  });
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
  const [isSignedIn, setIsSignedIn] = useSignedInFromStorage();
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

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

  // EDIT/CUSTOMIZE: Auto-select BLEACH + PLUCK only when a real styling option is confirmed (uses module-level isStylingValueConfirmed).
  useEffect(() => {
    const pathname = location.pathname;
    const isOnEditRoute = pathname.includes('/edit');
    const isOnCustomizeRoute = isBuildAWigCustomizePath(pathname);
    if (!isOnEditRoute && !isOnCustomizeRoute) return;

    const styleConfirmed = isOnEditRoute
      ? (() => {
          const s = localStorage.getItem('editSelectedStyling') || localStorage.getItem('selectedStyling');
          if (isStylingValueConfirmed(s)) return true;
          try {
            const item = JSON.parse(localStorage.getItem('editingCartItem') || '{}');
            return isStylingValueConfirmed(item.styling);
          } catch { return false; }
        })()
      : (() => {
          const s = localStorage.getItem('customizeSelectedStyling') ||
            localStorage.getItem('selectedStyling') ||
            localStorage.getItem('selectedHairStyling');
          return isStylingValueConfirmed(s);
        })();

    if (!styleConfirmed) return;

    setSelectedAddOns(prev => {
      const hasBleach = prev.includes('BLEACH');
      const hasPluck = prev.includes('PLUCK');
      if (hasBleach && hasPluck) return prev;
      return [...prev.filter(x => x !== 'BLEACH' && x !== 'PLUCK'), 'BLEACH', 'PLUCK']
        .sort((a, b) => ADDONS_CORRECT_ORDER.indexOf(a) - ADDONS_CORRECT_ORDER.indexOf(b));
    });
  }, [location.pathname]);

  // Lock BLEACH+PLUCK when we're on edit/customize AND styling is confirmed (derive every render — no effect timing).
  const isOnEditOrCustomize =
    location.pathname.includes('/edit') || isBuildAWigCustomizePath(location.pathname);
  // Lock BLEACH+PLUCK only when a real styling option is selected (uses same isStylingValueConfirmed as effect).
  const stylingConfirmedForLock =
    location.pathname.includes('/edit')
      ? (() => {
          const s = localStorage.getItem('editSelectedStyling') || localStorage.getItem('selectedStyling');
          if (isStylingValueConfirmed(s)) return true;
          try {
            const item = JSON.parse(localStorage.getItem('editingCartItem') || '{}');
            return isStylingValueConfirmed(item.styling);
          } catch { return false; }
        })()
      : (() => {
          const s =
            localStorage.getItem('customizeSelectedStyling') ||
            localStorage.getItem('selectedStyling') ||
            localStorage.getItem('selectedHairStyling');
          return isStylingValueConfirmed(s);
        })();
  const lockBleachPluck = isOnEditOrCustomize && stylingConfirmedForLock;
  const isStylingConfirmed = lockBleachPluck;
  const getIsStylingConfirmed = () => lockBleachPluck;

  // Persist addons when we auto-added BLEACH+PLUCK for styling (so main page sees the update).
  const hasAutoAppliedBleachPluck = useRef(false);
  useEffect(() => {
    const pathname = location.pathname;
    const isOnEditRoute = pathname.includes('/edit');
    const isOnCustomizeRoute = isBuildAWigCustomizePath(pathname);
    if (!isOnEditRoute && !isOnCustomizeRoute) return;
    if (!selectedAddOns.includes('BLEACH') || !selectedAddOns.includes('PLUCK')) return;
    if (hasAutoAppliedBleachPluck.current) return;
    hasAutoAppliedBleachPluck.current = true;
    const selectedLace = localStorage.getItem('selectedLace') || '';
    const discountedLaceSizes = ['2X6', '4X4', '5X5', '6X6', '7X7'];
    const hasLaceDiscount = discountedLaceSizes.includes(selectedLace);
    const addOnPrices: Record<string, number> = { BLEACH: 60, PLUCK: 80, 'BLUNT CUT': 20 };
    const price = selectedAddOns.reduce((total, addOnId) => {
      let p = addOnPrices[addOnId] ?? 0;
      if (hasLaceDiscount && (addOnId === 'BLEACH' || addOnId === 'PLUCK')) p -= 20;
      return total + p;
    }, 0);
    const priceStr = price.toString();
    localStorage.setItem('selectedAddOns', JSON.stringify(selectedAddOns));
    localStorage.setItem('selectedAddOnsPrice', priceStr);
    if (isOnEditRoute) {
      localStorage.setItem('editSelectedAddOns', JSON.stringify(selectedAddOns));
      localStorage.setItem('editSelectedAddOnsPrice', priceStr);
    }
    if (isOnCustomizeRoute) {
      localStorage.setItem('customizeSelectedAddOns', JSON.stringify(selectedAddOns));
      localStorage.setItem('customizeSelectedAddOnsPrice', priceStr);
    }
    window.dispatchEvent(new CustomEvent('customStorageChange'));
  }, [location.pathname, selectedAddOns]);

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

  // Add-ons options with local assets
  const addOnOptions = [
    {
      id: 'BLEACH',
      name: 'BLEACH',
      image: '/assets/Bleach-icon.svg',
      price: 60
    },
    {
      id: 'PLUCK',
      name: 'PLUCK',
      image: '/assets/Pluck-icon.svg',
      price: 80
    },
    {
      id: 'BLUNT CUT',
      name: 'BLUNT CUT',
      image: '/assets/clip ends-icon.svg',
      price: 20
    }
  ];

  const handleAddOnToggle = (addOnId: string) => {
    // Block BLEACH/PLUCK deselect when styling is confirmed (check at call time, not in setState)
    if ((addOnId === 'BLEACH' || addOnId === 'PLUCK') && getIsStylingConfirmed()) {
      const current = selectedAddOns;
      if (current.includes(addOnId)) return; // do not allow remove
    }
    setSelectedAddOns(prev => {
      if (prev.includes(addOnId)) {
        if ((addOnId === 'BLEACH' || addOnId === 'PLUCK') && getIsStylingConfirmed()) return prev;
        return prev.filter(id => id !== addOnId);
      } else {
        // Add the add-on in the correct order based on sub-page sequence
        const correctOrder = ADDONS_CORRECT_ORDER;
        const newSelections = [...prev, addOnId];
        
        // Sort the selections according to the correct order
        return newSelections.sort((a, b) => {
          const indexA = correctOrder.indexOf(a);
          const indexB = correctOrder.indexOf(b);
          return indexA - indexB;
        });
      }
    });
  };

  const getTotalAddOnPrice = () => {
    // Get selected lace size from localStorage
    const selectedLace = localStorage.getItem('selectedLace') || '';
    const discountedLaceSizes = ['2X6', '4X4', '5X5', '6X6', '7X7'];
    const hasLaceDiscount = discountedLaceSizes.includes(selectedLace);
    
    return selectedAddOns.reduce((total, addOnId) => {
      const addOn = addOnOptions.find(opt => opt.id === addOnId);
      let price = addOn?.price || 0;
      
      // Apply $20 discount for bleach and pluck when specific lace sizes are selected
      if (hasLaceDiscount && (addOnId === 'BLEACH' || addOnId === 'PLUCK')) {
        price -= 20;
      }
      
      return total + price;
    }, 0);
  };

  const totalPrice = getTotalAddOnPrice();

  // Get dynamic add-ons note text based on selected add-ons
  const getAddOnsNoteText = () => {
    const hasBleach = selectedAddOns.includes('BLEACH');
    const hasPluck = selectedAddOns.includes('PLUCK');
    const hasBluntCut = selectedAddOns.includes('BLUNT CUT');
    
    // When no add-ons are selected
    if (selectedAddOns.length === 0) {
      return (
        <>
          LACE IS PRE-PLUCKED WITH LIGHTLY BLEACHED KNOTS.<br />
          STANDARD PROCESSING TIME APPLIES.
        </>
      );
    }
    
    // For bleach only
    if (hasBleach && !hasPluck && !hasBluntCut) {
      return (
        <>
          KNOTS WILL BE LIFTED + TONED.<br />
          EXPECT AN ADDITIONAL WEEK OF PROCESSING TIME.
        </>
      );
    }
    
    // For pluck only
    if (hasPluck && !hasBleach && !hasBluntCut) {
      return (
        <>
          HAIRLINE WILL BE FULLY CUSTOMIZED.<br />
          EXPECT AN ADDITIONAL WEEK OF PROCESSING TIME.
        </>
      );
    }
    
    // For blunt cut only
    if (hasBluntCut && !hasBleach && !hasPluck) {
      return (
        <>
          ENDS WILL BE CUT BLUNT.<br />
          STANDARD PROCESSING TIME APPLIES.
        </>
      );
    }
    
    // For bleach + pluck combination
    if (hasBleach && hasPluck && !hasBluntCut) {
      return (
        <>
          FULLY CUSTOMIZED LACE.<br />
          EXPECT AN ADDITIONAL WEEK OF PROCESSING TIME.
        </>
      );
    }
    
    // For bleach + blunt cut combination
    if (hasBleach && hasBluntCut && !hasPluck) {
      return (
        <>
          KNOTS WILL BE LIFTED + TONED WITH BLUNT ENDS.<br />
          EXPECT AN ADDITIONAL WEEK OF PROCESSING TIME.
        </>
      );
    }
    
    // For pluck + blunt cut combination
    if (hasPluck && hasBluntCut && !hasBleach) {
      return (
        <>
          FULLY CUSTOMIZED HAIRLINE WITH BLUNT ENDS.<br />
          EXPECT AN ADDITIONAL WEEK OF PROCESSING TIME.
        </>
      );
    }
    
    // For bleach + pluck + blunt cut combination (all three)
    if (hasBleach && hasPluck && hasBluntCut) {
      return (
        <>
          FULLY CUSTOMIZED LACE WITH BLUNT ENDS.<br />
          EXPECT AN ADDITIONAL WEEK OF PROCESSING TIME.
        </>
      );
    }
    
    // For other add-ons combinations, return default text
    return 'LACE IS PRE-PLUCKED WITH LIGHTLY BLEACHED KNOTS. STANDARD PROCESSING TIME APPLIES.';
  };

  const getAddOnsThumbnailTopPosition = (addOnId: string) => {
    // Always move bleach thumbnail up by 2px (2.5% of 80px container) regardless of selection state
    if (addOnId === 'BLEACH') {
      return '52.5%'; // Moved up 2px
    }
    
    // If no add-ons are selected, return original position for none icon
    if (selectedAddOns.length === 0) {
      return '55%'; // Original position for none icon
    }
    
    // Return original position for other add-on icons
    return '55%';
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
      const price = getTotalAddOnPrice().toString();
      
      // Always save with 'selected' prefix
      localStorage.setItem('selectedAddOns', JSON.stringify(selectedAddOns));
      localStorage.setItem('selectedAddOnsPrice', price);
      
      // Also save with 'editSelected' prefix in edit mode
      if (isOnProductSpecificEditRoute) {
        localStorage.setItem('editSelectedAddOns', JSON.stringify(selectedAddOns));
        localStorage.setItem('editSelectedAddOnsPrice', price);
      }
      
      // Also save with 'customizeSelected' prefix in customize mode
      if (isOnProductSpecificCustomizeRoute) {
        localStorage.setItem('customizeSelectedAddOns', JSON.stringify(selectedAddOns));
        localStorage.setItem('customizeSelectedAddOnsPrice', price);
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
    // Dispatch again after navigation so the main page (now visible) can sync add-ons and price from localStorage
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('customStorageChange'));
    }, 0);
  };

  const handleConfirmSelection = () => {
    const price = getTotalAddOnPrice().toString();
    
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
        console.log('Addons page - No sourceRoute found, detected edit mode from localStorage/pathname');
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
        console.log('Addons page - No sourceRoute found, detected customize mode from localStorage/pathname');
      } else {
        sourceRoute = '/build-a-wig';
        console.log('Addons page - No sourceRoute found, defaulting to main page');
      }
    }
    
    // Always save with 'selected' prefix
    localStorage.setItem('selectedAddOns', JSON.stringify(selectedAddOns));
    localStorage.setItem('selectedAddOnsPrice', price);
    
    // Also save with 'editSelected' prefix in edit mode
    if (isEditMode) {
      localStorage.setItem('editSelectedAddOns', JSON.stringify(selectedAddOns));
      localStorage.setItem('editSelectedAddOnsPrice', price);
    }
    
    // Also save with 'customizeSelected' prefix in customize mode
    if (isCustomizeMode) {
      localStorage.setItem('customizeSelectedAddOns', JSON.stringify(selectedAddOns));
      localStorage.setItem('customizeSelectedAddOnsPrice', price);
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
    
    console.log('Addons page - Navigating back to route:', returnRoute);
    
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
              {/* ADD-ONS OPTIONS HEADER */}
            <p
              className="text-xs sm:text-sm text-center text-red-500 mb-4"
              style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', color: '#EB1C24', transform: 'translateY(18px)' }}
            >
              CUSTOMIZATION KIT
            </p>

            {/* ADDON OPTIONS */}
            <div className="grid grid-cols-3 gap-4 mx-auto justify-center mb-6 max-w-[240px]" style={{ marginTop: '13px' }}>
              {addOnOptions.map((option) => {
                const isLocked = isStylingConfirmed && (option.id === 'BLEACH' || option.id === 'PLUCK');
                const box = (
                  <ThumbBox
                    key={option.id}
                    image={option.image}
                    title="ADD-ONS"
                    label={option.name}
                    isSelected={selectedAddOns.includes(option.id)}
                    onClick={isLocked ? undefined : () => handleAddOnToggle(option.id)}
                    imgSize={75}
                    containerSize={60}
                    topPosition={getAddOnsThumbnailTopPosition(option.id)}
                    isDisabled={isLocked}
                  />
                );
                return isLocked ? (
                  <div key={option.id} style={{ pointerEvents: 'none' }} aria-disabled="true">
                    {box}
                  </div>
                ) : (
                  box
                );
              })}
            </div>

            {/* NOTE AND TOTAL PRICE SECTION */}
            <div style={{ transform: 'translateY(15px)' }}>
            {/* DYNAMIC ADD-ONS NOTE */}
            <p
              className="font-futura text-[10px] text-center w-[95%] mx-auto uppercase"
              style={{ color: '#EB1C24', fontFamily: '"Futura PT Demi"', fontWeight: '500', transform: 'translateY(-7px)', marginTop: '10px', marginBottom: '1.5rem' }}
            >
              {getAddOnsNoteText()}
            </p>

            {/* TOTAL PRICE */}
            <div className="text-center mb-4">
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

          </div>

            </>
          )}
        </div>

        {!showMobileMenu && (
        <>
        <div className="px-0 md:px-0 flex justify-center" style={{ marginTop: '2px', transform: 'translateY(0px)' }}>
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
        </>
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
      {premiumMembershipStepModal}
    </>
  );
}
