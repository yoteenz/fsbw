
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ThumbBox from '../../../components/ThumbBox';
import LoadingScreen from '../../../components/base/LoadingScreen';
import ConfirmationModal from '../../../components/ConfirmationModal';
import BrandMenuLinks from '../../../components/BrandMenuLinks';
import SocialMenuIcons from '../../../components/SocialMenuIcons';
import { signOutAppAndSupabaseSession } from '../../../utils/adminAuth';
import { isFounderNoirFalRegenUiVisible } from '../../../utils/founderNoirFalTools';
import { ShopMobileMenuShopTab } from '../../../components/ShopMobileMenuShopTab';
import { ShopMobileMenuToolsTab } from '../../../components/ShopMobileMenuToolsTab';
import { isBuildAWigCustomizePath } from '../../../utils/buildAWigRoutes';
import { getBawSubpageStaticWigViews, isBawNoirLivePreviewStepPathname } from '../../../utils/bawSubpageWigViews';
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
import { markBawNavigateToCustomizeHubFromOtherStep } from '../../../utils/bawCrossStepSummary';
import {
  isBawCustomizeSubPage,
  isBawEditSubPage,
  markBawConfirmedReturnFromSubpage,
  persistBawScalarConfirmed,
  persistBawScalarDraftTap,
} from '../../../utils/bawSubpageSelectionPersist';

interface HairlineOption {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  // Assuming a 'type' property may exist for filtering
  type?: number;
}

function HairlineSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const premiumMembershipStepModal = useBuildWigPremiumMembershipStepGate();
  const [showLoading, setShowLoading] = useState(true);
  const [selectedHairline, setSelectedHairline] = useState<string[]>(() => {
    const pathname = window.location.pathname;
    const isOnEditRoute = pathname.includes('/edit');
    const isOnCustomizeRoute = isBuildAWigCustomizePath(pathname);
    
    // CRITICAL: Check editSelected* keys first when in edit mode
    if (isOnEditRoute) {
      const editSelectedHairline = localStorage.getItem('editSelectedHairline');
      if (editSelectedHairline) {
        return [editSelectedHairline];
      }
      // Fallback to editingCartItem
      const editingCartItem = localStorage.getItem('editingCartItem');
      if (editingCartItem) {
        try {
          const item = JSON.parse(editingCartItem);
          if (item.hairline) {
            return [item.hairline];
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
    
    // CRITICAL: Check customizeSelected* keys when in customize mode
    if (isOnCustomizeRoute) {
      const customizeSelectedHairline = localStorage.getItem('customizeSelectedHairline');
      if (customizeSelectedHairline) {
        return [customizeSelectedHairline];
      }
    }
    
    // Main mode: use selected* keys
    const stored = localStorage.getItem('selectedHairline');
    return stored ? [stored] : ['NATURAL']; // Default to NATURAL as single selection
  });
  const [selectedView, setSelectedView] = useState(1); // Changed from 0 to 1 (middle image)

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

  const baseWigViews = getBawSubpageStaticWigViews(
    location.pathname,
    selectedHairline.length > 0 ? selectedHairline.join(',') : 'NATURAL',
  );
  const liveNoirCompositeWigViews = useBawSubpageLiveNoirCompositeWigViews();
  const wigViews =
    liveNoirCompositeWigViews && isBawNoirLivePreviewStepPathname(location.pathname)
      ? liveNoirCompositeWigViews
      : baseWigViews;

  // Debug logging
  console.log('Selected hairline:', selectedHairline);

  // Hairline options - Updated with pricing (NATURAL is default)
  const isBlancoRoute = window.location.pathname.includes('/blanco/customize') || window.location.pathname.includes('/blanco/edit');
  
  const hairlineOptions: HairlineOption[] = [
    {
      id: 'NATURAL',
      name: 'NATURAL',
      description: 'Natural hairline',
      price: 0, // Default option - included in base price
      image: isBlancoRoute ? '/assets/hairline-blanco.png' : '/assets/Natural Hairline-icon.svg'
    },
    {
      id: 'PEAK',
      name: 'PEAK',
      description: 'Peak hairline style',
      price: 40, // Additional cost for peak styling
      image: isBlancoRoute ? '/assets/hairline-blanco.png' : '/assets/Peak Hairline-icon.svg'
    },
    {
      id: 'LAGOS',
      name: 'LAGOS',
      description: 'Lagos hairline style',
      price: 60, // Additional cost for Lagos styling
      image: isBlancoRoute ? '/assets/hairline-blanco.png' : '/assets/Lagos Hairline-icon.svg'
    }
  ];

  const computeHairlinePrice = (selections: string[]) => {
    let total = selections.reduce((sum, hairlineId) => {
      const selected = hairlineOptions.find(option => option.id === hairlineId);
      return sum + (selected ? selected.price : 0);
    }, 0);
    if (selections.includes('LAGOS') && selections.includes('PEAK')) {
      total -= 20;
    }
    return total;
  };

  const persistHairlineDraft = (selections: string[]) => {
    const pathname = window.location.pathname;
    const hairlineValue = selections.length > 0 ? selections.join(',') : null;
    const price = computeHairlinePrice(selections).toString();
    if (hairlineValue) {
      persistBawScalarDraftTap(pathname, 'Hairline', hairlineValue, price);
    } else if (isBawCustomizeSubPage(pathname)) {
      localStorage.removeItem('customizeSelectedHairline');
      localStorage.setItem('customizeSelectedHairlinePrice', price);
      window.dispatchEvent(new CustomEvent('customStorageChange'));
    } else if (isBawEditSubPage(pathname)) {
      localStorage.removeItem('editSelectedHairline');
      localStorage.setItem('editSelectedHairlinePrice', price);
      window.dispatchEvent(new CustomEvent('customStorageChange'));
    }
  };

  const handleHairlineSelect = (hairlineId: string) => {
    const currentSelections = selectedHairline;
    let nextSelections: string[];

    if (currentSelections.includes(hairlineId)) {
      if (hairlineId === 'LAGOS') {
        const remainingSelections = currentSelections.filter(id => id !== 'LAGOS');
        nextSelections = remainingSelections.length === 0 ? ['NATURAL'] : remainingSelections;
      } else if (hairlineId === 'PEAK') {
        const remainingSelections = currentSelections.filter(id => id !== 'PEAK');
        nextSelections = remainingSelections.length === 0 ? ['NATURAL'] : remainingSelections;
      } else {
        nextSelections = ['NATURAL'];
      }
    } else if (hairlineId === 'LAGOS') {
      nextSelections = ['LAGOS'];
    } else if (hairlineId === 'PEAK') {
      nextSelections = currentSelections.includes('LAGOS') ? ['LAGOS', 'PEAK'] : ['PEAK'];
    } else {
      nextSelections = ['NATURAL'];
    }

    setSelectedHairline(nextSelections);
    persistHairlineDraft(nextSelections);
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
        console.log('Hairline page - No sourceRoute found, detected edit mode from localStorage/pathname');
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
        console.log('Hairline page - No sourceRoute found, detected customize mode from localStorage/pathname:', sourceRoute);
      } else {
        sourceRoute = '/build-a-wig';
        console.log('Hairline page - No sourceRoute found, defaulting to main page');
      }
    }
    
    const hairlineValue = selectedHairline.length > 0 ? selectedHairline.join(',') : null;

    if (hairlineValue) {
      persistBawScalarConfirmed(pathname, 'Hairline', hairlineValue, price, { isCustomizeMode, isEditMode });
    } else {
      localStorage.removeItem('selectedHairline');
      localStorage.removeItem('selectedHairlinePrice');
      if (isEditMode) {
        localStorage.removeItem('editSelectedHairline');
        localStorage.removeItem('editSelectedHairlinePrice');
      }
      if (isCustomizeMode) {
        localStorage.removeItem('customizeSelectedHairline');
        localStorage.removeItem('customizeSelectedHairlinePrice');
      }
    }
    
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
    }
    
    console.log('Hairline page - Navigating back to route:', returnRoute);
    
    markBawConfirmedReturnFromSubpage();
    
    window.dispatchEvent(new CustomEvent('customStorageChange'));
    
    markBawNavigateToCustomizeHubFromOtherStep(returnRoute);
    navigate(returnRoute);
  };

  const getSelectedPrice = () => computeHairlinePrice(selectedHairline);

  // Get dynamic hairline note text based on selected hairline option
  const getHairlineNoteText = () => {
    // Check for lagos + peak combination first (before individual checks)
    if (selectedHairline.includes('LAGOS') && selectedHairline.includes('PEAK')) {
      return 'HAIRLINE HAS A WIDOW\'S PEAK WITH LOW TEMPLES.';
    }
    
    const currentHairline = selectedHairline[0]; // Get the first selected hairline
    
    // For natural hairline option
    if (currentHairline === 'NATURAL') {
      return 'HAIRLINE IS ROUNDED WITH SOFT EDGES.';
    }
    
    // For peak hairline option
    if (currentHairline === 'PEAK') {
      return 'HAIRLINE HAS A WIDOW\'S PEAK WITH SOFT EDGES.';
    }
    
    // For lagos hairline option
    if (currentHairline === 'LAGOS') {
      return 'NATURAL HAIRLINE WITH LOW TEMPLES ON BOTH SIDES.';
    }
    
    // For other hairline options, return default text
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
            {isFounderNoirFalRegenUiVisible() &&
              (location.pathname.includes('/build-a-wig/noir/edit/hairline') ||
                location.pathname.includes('/build-a-wig/noir/customize/hairline')) && (
              <p
                className="text-center mb-2 px-2"
                style={{
                  fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                  fontSize: '9px',
                  color: '#808080',
                  maxWidth: '280px',
                }}
              >
                Hairline preview uses static angles here. Regenerate live NOIR WebPs on the NOIR color page (and LAYERS/BANGS on styling).
              </p>
            )}
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
                      const pathname = window.location.pathname;
                      if (pathname.includes('/soft-wave/') || pathname.includes('/soft-curl/') || pathname.includes('/blanco/')) {
                        return 'calc(clamp(2rem, 4vw, 2.5rem) + 8px)';
                      }
                      return undefined;
                    })(),
                    transform: (() => {
                      const pathname = window.location.pathname;
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
              }
            />
          </div>

          {/* Back Button */}
            <div className="flex justify-start ml-[calc(50%-131px)]">
          </div>

          {/* HAIRLINE SELECTION HEADER */}
          <p 
            className="text-xs sm:text-sm text-center text-red-500 mb-4"
            style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', color: '#EB1C24', transform: 'translateY(18px)' }}
          >
            VENTILLATION EFFECT
          </p>
          {/* HAIRLINE OPTIONS - Centered 3-column layout */}
          <div className="grid grid-cols-3 gap-4 mx-auto justify-center mb-6 max-w-[240px]" style={{ marginTop: '15px' }}>
            {hairlineOptions.map((option) => {
              const isBlancoRoute = window.location.pathname.includes('/blanco/customize') || window.location.pathname.includes('/blanco/edit');
              const imgSize = isBlancoRoute ? 45 : 75; // Match main page edit mode size (45px for BLANCO)
              return (
                <ThumbBox
                  key={option.id}
                  image={option.image}
                  title="HAIRLINE"
                  label={option.name}
                  isSelected={selectedHairline.includes(option.id)}
                  onClick={() => handleHairlineSelect(option.id)}
                  imgSize={imgSize}
                  containerSize={60}
                  topPosition="50%"
                />
              );
            })}
          </div>

          {/* DYNAMIC HAIRLINE NOTE */}
          <p
            className="font-futura text-[10px] md:text-xs text-center my-6 w-[95%] mx-auto uppercase"
            style={{ color: '#EB1C24', fontFamily: '"Futura PT Demi"', fontWeight: '500', transform: 'translateY(-7px)' }}
          >
            {getHairlineNoteText()}
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

            </BawSubscriptionMainCard>
            </>
          )}
        </BawBuildAreaOuter>

        <BawSubpageFooterAction
          onConfirm={handleConfirmSelection}
          hidden={showMobileMenu}
          buttonWidth="100%"
          buttonClassName="w-full max-w-m"
          wrapperClassName="px-0 md:px-0"
          wrapperStyle={{ marginTop: '2px' }}
        />
      </div>
    </div>
    </div>
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

export default HairlineSelection;
