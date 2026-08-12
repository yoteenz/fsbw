import { useState, useEffect, useRef } from 'react';
import { useSyncMenuToggleOpenState } from '../../../utils/menuToggleOpenState';
import { useNavigate, useLocation } from 'react-router-dom';
import ThumbBox from '../../../components/ThumbBox';
import LoadingScreen from '../../../components/base/LoadingScreen';
import { usePageLoadGate } from '../../../hooks/usePageLoadGate';
import { BAW_MARBLE_BACKGROUND_SRC } from '../../../utils/pageLoadReadiness';
import ConfirmationModal from '../../../components/ConfirmationModal';
import BrandMenuLinks from '../../../components/BrandMenuLinks';
import SocialMenuIcons from '../../../components/SocialMenuIcons';
import { signOutAppAndSupabaseSession } from '../../../utils/adminAuth';
import { isBuildAWigCustomizePath } from '../../../utils/buildAWigRoutes';
import {
  markBawConfirmedReturnFromSubpage,
  persistBawJsonConfirmed,
  persistBawJsonDraftTap,
} from '../../../utils/bawSubpageSelectionPersist';
import { getBawSubpageStaticWigViews, isBawNoirLivePreviewStepPathname } from '../../../utils/bawSubpageWigViews';
import { ShopMobileMenuShopTab } from '../../../components/ShopMobileMenuShopTab';
import { ShopMobileMenuToolsTab } from '../../../components/ShopMobileMenuToolsTab';
import { useBuildWigPremiumMembershipStepGate } from '../../../hooks/useBuildWigPremiumMembershipStepGate';
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
import { isBawSalonStylingValueConfirmed } from '../../../utils/bawUnitStylingOptions';

function isStylingValueConfirmed(raw: string | null, pathname: string): boolean {
  return isBawSalonStylingValueConfirmed(raw, pathname);
}

export default function AddOnsSelectionPage() {
  const navigate = useNavigate();
  const location = useLocation();
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
            if (isStylingValueConfirmed(s, pathname)) return true;
            try {
              const item = JSON.parse(localStorage.getItem('editingCartItem') || '{}');
              return isStylingValueConfirmed(item.styling, pathname);
            } catch { return false; }
          })()
        : isStylingValueConfirmed(
            localStorage.getItem('customizeSelectedStyling') ||
            localStorage.getItem('selectedStyling') ||
            localStorage.getItem('selectedHairStyling'),
            pathname
          );
      if (styleConfirmed && (!initial.includes('BLEACH') || !initial.includes('PLUCK'))) {
        const merged = [...initial.filter(x => x !== 'BLEACH' && x !== 'PLUCK'), 'BLEACH', 'PLUCK'];
        initial = merged.sort((a, b) => ADDONS_CORRECT_ORDER.indexOf(a) - ADDONS_CORRECT_ORDER.indexOf(b));
      }
    }
    
    return initial;
  });
  const showLoading = usePageLoadGate({ imageUrls: [BAW_MARBLE_BACKGROUND_SRC] });

  // Mobile menu state
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  useSyncMenuToggleOpenState(showMobileMenu);
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

  // EDIT/CUSTOMIZE: Auto-select BLEACH + PLUCK only when a real styling option is confirmed (uses module-level isStylingValueConfirmed).
  useEffect(() => {
    const pathname = location.pathname;
    const isOnEditRoute = pathname.includes('/edit');
    const isOnCustomizeRoute = isBuildAWigCustomizePath(pathname);
    if (!isOnEditRoute && !isOnCustomizeRoute) return;

    const styleConfirmed = isOnEditRoute
      ? (() => {
          const s = localStorage.getItem('editSelectedStyling') || localStorage.getItem('selectedStyling');
          if (isStylingValueConfirmed(s, pathname)) return true;
          try {
            const item = JSON.parse(localStorage.getItem('editingCartItem') || '{}');
            return isStylingValueConfirmed(item.styling, pathname);
          } catch { return false; }
        })()
      : (() => {
          const s = localStorage.getItem('customizeSelectedStyling') ||
            localStorage.getItem('selectedStyling') ||
            localStorage.getItem('selectedHairStyling');
          return isStylingValueConfirmed(s, pathname);
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
          if (isStylingValueConfirmed(s, location.pathname)) return true;
          try {
            const item = JSON.parse(localStorage.getItem('editingCartItem') || '{}');
            return isStylingValueConfirmed(item.styling, location.pathname);
          } catch { return false; }
        })()
      : (() => {
          const s =
            localStorage.getItem('customizeSelectedStyling') ||
            localStorage.getItem('selectedStyling') ||
            localStorage.getItem('selectedHairStyling');
          return isStylingValueConfirmed(s, location.pathname);
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
    const addOnPrices: Record<string, number> = { BLEACH: 100, PLUCK: 120, 'BLUNT CUT': 40 };
    const price = selectedAddOns.reduce((total, addOnId) => {
      let p = addOnPrices[addOnId] ?? 0;
      if (hasLaceDiscount && (addOnId === 'BLEACH' || addOnId === 'PLUCK')) p -= 20;
      return total + p;
    }, 0);
    const priceStr = price.toString();
    persistBawJsonDraftTap(pathname, 'AddOns', JSON.stringify(selectedAddOns), priceStr);
  }, [location.pathname, selectedAddOns]);

  const baseWigViews = getBawSubpageStaticWigViews(
    location.pathname,
    localStorage.getItem('selectedHairline') || 'NATURAL',
  );

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

  const liveNoirCompositeWigViews = useBawSubpageLiveNoirCompositeWigViews();
  const wigViews =
    liveNoirCompositeWigViews && isBawNoirLivePreviewStepPathname(location.pathname)
      ? liveNoirCompositeWigViews
      : baseWigViews;

  // Add-ons options with local assets
  const addOnOptions = [
    {
      id: 'BLEACH',
      name: 'BLEACH',
      image: '/assets/Bleach-icon.svg',
      price: 100
    },
    {
      id: 'PLUCK',
      name: 'PLUCK',
      image: '/assets/Pluck-icon.svg',
      price: 120
    },
    {
      id: 'BLUNT CUT',
      name: 'BLUNT CUT',
      image: '/assets/clip ends-icon.svg',
      price: 40
    }
  ];

  const computeAddOnPrice = (addOnIds: string[]) => {
    const selectedLace = localStorage.getItem('selectedLace') || '';
    const discountedLaceSizes = ['2X6', '4X4', '5X5', '6X6', '7X7'];
    const hasLaceDiscount = discountedLaceSizes.includes(selectedLace);

    return addOnIds.reduce((total, addOnId) => {
      const addOn = addOnOptions.find(opt => opt.id === addOnId);
      let p = addOn?.price || 0;
      if (hasLaceDiscount && (addOnId === 'BLEACH' || addOnId === 'PLUCK')) p -= 20;
      return total + p;
    }, 0);
  };

  const handleAddOnToggle = (addOnId: string) => {
    // Block BLEACH/PLUCK deselect when styling is confirmed (check at call time, not in setState)
    if ((addOnId === 'BLEACH' || addOnId === 'PLUCK') && getIsStylingConfirmed()) {
      const current = selectedAddOns;
      if (current.includes(addOnId)) return; // do not allow remove
    }
    setSelectedAddOns(prev => {
      let next: string[];
      if (prev.includes(addOnId)) {
        if ((addOnId === 'BLEACH' || addOnId === 'PLUCK') && getIsStylingConfirmed()) return prev;
        next = prev.filter(id => id !== addOnId);
      } else {
        const correctOrder = ADDONS_CORRECT_ORDER;
        const newSelections = [...prev, addOnId];
        next = newSelections.sort((a, b) => {
          const indexA = correctOrder.indexOf(a);
          const indexB = correctOrder.indexOf(b);
          return indexA - indexB;
        });
      }
      const price = computeAddOnPrice(next);
      persistBawJsonDraftTap(location.pathname, 'AddOns', JSON.stringify(next), String(price));
      return next;
    });
  };

  const getTotalAddOnPrice = () => computeAddOnPrice(selectedAddOns);

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
    
    persistBawJsonConfirmed(pathname, 'AddOns', JSON.stringify(selectedAddOns), price, { isCustomizeMode, isEditMode });
    
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
    }
    
    console.log('Addons page - Navigating back to route:', returnRoute);
    
    markBawConfirmedReturnFromSubpage();
    
    window.dispatchEvent(new CustomEvent('customStorageChange'));
    
    navigate(returnRoute);
  };

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

            </BawSubscriptionMainCard>
            </>
          )}
        </BawBuildAreaOuter>

        <BawSubpageFooterAction
          onConfirm={handleConfirmSelection}
          hidden={showMobileMenu}
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
      {premiumMembershipStepModal}
    </>
    </BuildWigSubscriptionPageRoot>
  );
}
