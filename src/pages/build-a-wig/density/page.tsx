
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
import { BawModeChrome } from '../../../components/buildWig/BawModeChrome';
import { BuildWigSubscriptionPageRoot } from '../../../components/buildWig/BawSubscriptionViewContext';
import { BawSubscriptionMainCard } from '../../../components/buildWig/BawSubscriptionMainCard';

interface DensityOption {
  id: string;
  name: string;
  percentage: string;
  description: string;
  price: number;
  image: string;
}

function DensitySelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedDensity, setSelectedDensity] = useState(() => {
    // Always start with default - useEffect will load from localStorage
    // This matches the customize pages pattern
    // Check if we're in blanco customize mode
    const isBlancoCustomizeMode = window.location.pathname.includes('/blanco/customize');
    return isBlancoCustomizeMode ? '250%' : '200%';
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

  // Density options with correct pricing structure
  // Use location.pathname from React Router to ensure updates on route changes
  const isBlancoRoute = location.pathname.includes('/blanco/customize') || location.pathname.includes('/blanco/edit');
  const densityImage = isBlancoRoute ? '/assets/density-blanco.png' : '/assets/density.png';
  
  // Define prices based on route - blanco edit/customize has different pricing
  const getDensityPrice = (densityId: string): number => {
    if (isBlancoRoute) {
      // Blanco edit/customize mode prices
      const blancoPrices: { [key: string]: number } = {
        '130%': -80,
        '150%': -60,
        '180%': -40,
        '200%': -20,
        '250%': 0,
        '300%': 160,
        '350%': 240,
        '400%': 320
      };
      return blancoPrices[densityId] || 0;
    } else {
      // Default prices for other routes
      const defaultPrices: { [key: string]: number } = {
        '130%': -60,
        '150%': -40,
        '180%': -20,
        '200%': 0,
        '250%': 80,
        '300%': 160,
        '350%': 240,
        '400%': 320
      };
      return defaultPrices[densityId] || 0;
    }
  };
  
  const densityOptions: DensityOption[] = [
    {
      id: '130%',
      name: '130%',
      percentage: '130%',
      description: '130% EQUIVALENT TO 1 BUNDLE FOR LENGTHS OVER 16"',
      price: getDensityPrice('130%'),
      image: densityImage
    },
    {
      id: '150%',
      name: '150%',
      percentage: '150%',
      description: '150% EQUIVALENT TO 1-2 BUNDLES FOR LENGTHS OVER 16"',
      price: getDensityPrice('150%'),
      image: densityImage
    },
    {
      id: '180%',
      name: '180%',
      percentage: '180%',
      description: '180% EQUIVALENT TO 2 BUNDLES FOR LENGTHS OVER 18"',
      price: getDensityPrice('180%'),
      image: densityImage
    },
    {
      id: '200%',
      name: '200%',
      percentage: '200%',
      description: '200% EQUIVALENT TO 2-3 BUNDLES FOR LENGTHS OVER 22"',
      price: getDensityPrice('200%'),
      image: densityImage
    },
    {
      id: '250%',
      name: '250%',
      percentage: '250%',
      description: '250% EQUIVALENT TO 3 BUNDLES FOR LENGTHS OVER 26"',
      price: getDensityPrice('250%'),
      image: densityImage
    },
    {
      id: '300%',
      name: '300%',
      percentage: '300%',
      description: '300% EQUIVALENT TO 3-4 BUNDLES FOR LENGTHS OVER 30"',
      price: getDensityPrice('300%'),
      image: densityImage
    },
    {
      id: '350%',
      name: '350%',
      percentage: '350%',
      description: '350% EQUIVALENT TO 4 BUNDLES FOR LENGTHS OVER 32"',
      price: getDensityPrice('350%'),
      image: densityImage
    },
    {
      id: '400%',
      name: '400%',
      percentage: '400%',
      description: '400% EQUIVALENT TO 4-5 BUNDLES FOR LENGTHS OVER 40"',
      price: getDensityPrice('400%'),
      image: densityImage
    }
  ];

  const persistDensityChoice = (densityId: string, priceUsd: number) => {
    persistBawScalarDraftTap(window.location.pathname, 'Density', densityId, String(priceUsd));
  };

  const handleDensitySelect = (densityId: string) => {
    setSelectedDensity(densityId);
    const priceUsd = densityOptions.find((o) => o.id === densityId)?.price ?? 0;
    persistDensityChoice(densityId, priceUsd);
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
        console.log('Density page - No sourceRoute found, detected edit mode from localStorage/pathname');
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
        console.log('Density page - No sourceRoute found, detected customize mode from localStorage/pathname:', sourceRoute);
      } else {
        sourceRoute = '/build-a-wig';
        console.log('Density page - No sourceRoute found, defaulting to main page');
      }
    }
    
    persistBawScalarConfirmed(pathname, 'Density', selectedDensity, price, { isCustomizeMode, isEditMode });
    
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
    
    console.log('Density page - Navigating back to route:', returnRoute);
    
    markBawConfirmedReturnFromSubpage();
    
    window.dispatchEvent(new CustomEvent('customStorageChange'));
    
    navigate(returnRoute);
  };

  const getSelectedPrice = () => {
    const selected = densityOptions.find(option => option.id === selectedDensity);
    return selected ? selected.price : 0;
  };

  // Get dynamic density note text based on selected length and density
  const getDensityNoteText = () => {
    const selectedLength = localStorage.getItem('selectedLength') || '24"';
    // Use local state instead of localStorage for live updates
    const currentDensity = selectedDensity;

    // For 130% density, show grams based on length
    if (currentDensity === '130%') {
      const lengthToGrams: { [key: string]: string } = {
        '16"': '98',
        '18"': '112',
        '20"': '122',
        '22"': '125',
        '24"': '135',
        '26"': '140',
        '28"': '145',
        '30"': '150',
        '32"': '155',
        '34"': '160',
        '36"': '165',
        '40"': '175'
      };
      
      const grams = lengthToGrams[selectedLength] || '135'; // Default to 24" if not found
      return (
        <>
          EQUIVALENT TO {grams} GRAMS.<br />
          100 GRAMS = 1 BUNDLE, EXCLUDING LACE.
        </>
      );
    }
    
    // For 150% density, show grams based on length
    if (currentDensity === '150%') {
      const lengthToGrams: { [key: string]: string } = {
        '16"': '113',
        '18"': '129',
        '20"': '142',
        '22"': '145',
        '24"': '155',
        '26"': '160',
        '28"': '165',
        '30"': '170',
        '32"': '175',
        '34"': '180',
        '36"': '185',
        '40"': '195'
      };
      
      const grams = lengthToGrams[selectedLength] || '155'; // Default to 24" if not found
      return (
        <>
          EQUIVALENT TO {grams} GRAMS.<br />
          100 GRAMS = 1 BUNDLE, EXCLUDING LACE.
        </>
      );
    }
    
    // For 180% density, show grams based on length
    if (currentDensity === '180%') {
      const lengthToGrams: { [key: string]: string } = {
        '16"': '130',
        '18"': '147',
        '20"': '162',
        '22"': '165',
        '24"': '175',
        '26"': '180',
        '28"': '185',
        '30"': '190',
        '32"': '195',
        '34"': '200',
        '36"': '205',
        '40"': '215'
      };
      
      const grams = lengthToGrams[selectedLength] || '175'; // Default to 24" if not found
      return (
        <>
          EQUIVALENT TO {grams} GRAMS.<br />
          100 GRAMS = 1 BUNDLE, EXCLUDING LACE.
        </>
      );
    }
    
    // For 250% density, show grams based on length
    if (currentDensity === '250%') {
      const lengthToGrams: { [key: string]: string } = {
        '16"': '190',
        '18"': '217',
        '20"': '232',
        '22"': '245',
        '24"': '255',
        '26"': '264',
        '28"': '269',
        '30"': '274',
        '32"': '279',
        '34"': '284',
        '36"': '289',
        '40"': '297'
      };
      
      const grams = lengthToGrams[selectedLength] || '255'; // Default to 24" if not found
      return (
        <>
          EQUIVALENT TO {grams} GRAMS.<br />
          100 GRAMS = 1 BUNDLE, EXCLUDING LACE.
        </>
      );
    }
    
    // For 300% density, show grams based on length
    if (currentDensity === '300%') {
      const lengthToGrams: { [key: string]: string } = {
        '16"': '220',
        '18"': '252',
        '20"': '267',
        '22"': '285',
        '24"': '295',
        '26"': '306',
        '28"': '311',
        '30"': '316',
        '32"': '321',
        '34"': '326',
        '36"': '331',
        '40"': '341'
      };
      
      const grams = lengthToGrams[selectedLength] || '295'; // Default to 24" if not found
      return (
        <>
          EQUIVALENT TO {grams} GRAMS.<br />
          100 GRAMS = 1 BUNDLE, EXCLUDING LACE.
        </>
      );
    }
    
    // For 350% density, show grams based on length
    if (currentDensity === '350%') {
      const lengthToGrams: { [key: string]: string } = {
        '16"': '250',
        '18"': '287',
        '20"': '302',
        '22"': '325',
        '24"': '335',
        '26"': '348',
        '28"': '353',
        '30"': '358',
        '32"': '363',
        '34"': '368',
        '36"': '373',
        '40"': '383'
      };
      
      const grams = lengthToGrams[selectedLength] || '335'; // Default to 24" if not found
      return (
        <>
          EQUIVALENT TO {grams} GRAMS.<br />
          100 GRAMS = 1 BUNDLE, EXCLUDING LACE.
        </>
      );
    }
    
    // For 400% density, show grams based on length
    if (currentDensity === '400%') {
      const lengthToGrams: { [key: string]: string } = {
        '16"': '280',
        '18"': '322',
        '20"': '337',
        '22"': '365',
        '24"': '375',
        '26"': '390',
        '28"': '395',
        '30"': '400',
        '32"': '400',
        '34"': '400',
        '36"': '400',
        '40"': '400'
      };
      
      const grams = lengthToGrams[selectedLength] || '375'; // Default to 24" if not found
      return (
        <>
          EQUIVALENT TO {grams} GRAMS.<br />
          100 GRAMS = 1 BUNDLE, EXCLUDING LACE.
        </>
      );
    }
    
    // For 200% density, show grams based on length
    if (currentDensity === '200%') {
      const lengthToGrams: { [key: string]: string } = {
        '16"': '160',
        '18"': '182',
        '20"': '197',
        '22"': '205',
        '24"': '215',
        '26"': '222',
        '28"': '227',
        '30"': '232',
        '32"': '237',
        '34"': '242',
        '36"': '247',
        '40"': '257'
      };
      
      const grams = lengthToGrams[selectedLength] || '215'; // Default to 24" if not found
      return (
        <>
          EQUIVALENT TO {grams} GRAMS.<br />
          100 GRAMS = 1 BUNDLE, EXCLUDING LACE.
        </>
      );
    }
    
    // For other densities, return default text
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

  // Initialize with current selection from localStorage
  useEffect(() => {
    // CRITICAL: Check if we're ACTUALLY editing (not just stale edit data)
    // Only load from editingCartItem if we're on the edit route
    const isOnEditRoute = window.location.pathname.includes('/edit');
    const editingCartItem = localStorage.getItem('editingCartItem');
    
    const isOnBlancoCustomizeRoute = window.location.pathname.includes('/blanco/customize');
    const isOnCustomizeRoute = isBuildAWigCustomizePath(window.location.pathname);
    
    // CRITICAL: Check editSelected* keys first when in edit mode
    if (isOnEditRoute) {
      const editSelectedDensity = localStorage.getItem('editSelectedDensity');
      if (editSelectedDensity) {
        console.log('Density page - loading edit mode density from editSelectedDensity:', editSelectedDensity);
        setSelectedDensity(editSelectedDensity);
        return;
      }
      
      // Fallback to editingCartItem
      if (editingCartItem) {
        try {
          const item = JSON.parse(editingCartItem);
          console.log('Density page - loading edit mode density from editingCartItem:', item.density);
          if (item.density) {
            setSelectedDensity(item.density);
            localStorage.setItem('editSelectedDensity', item.density);
            return;
          }
        } catch (error) {
          console.error('Density page - Error parsing editingCartItem:', error);
        }
      }
    }
    
    // CRITICAL: Check customizeSelected* keys when in customize mode
    if (isOnCustomizeRoute) {
      const customizeSelectedDensity = localStorage.getItem('customizeSelectedDensity');
      if (customizeSelectedDensity) {
        console.log('Density page - loading customize mode density from customizeSelectedDensity:', customizeSelectedDensity);
        setSelectedDensity(customizeSelectedDensity);
        return;
      }
    }
    
    // CRITICAL: For blanco customize mode, always use blanco defaults (don't read noir's localStorage)
    if (isOnBlancoCustomizeRoute) {
      const defaultDensity = '250%'; // Blanco always defaults to 250%
      console.log('Density page - Blanco customize mode, using default', defaultDensity);
      setSelectedDensity(defaultDensity);
      return;
    }
    
    // Main mode or noir customize mode - load from main page's selectedDensity
    const currentDensity = localStorage.getItem('selectedDensity');
    console.log('Density page - useEffect loading from localStorage:', currentDensity, 'isOnEditRoute:', isOnEditRoute);
    
    // Always use localStorage value if it exists (should match main page)
    if (currentDensity) {
      console.log('Density page - Setting density from localStorage:', currentDensity);
      setSelectedDensity(currentDensity);
    } else {
      // If not in localStorage, use default and save it
      const defaultDensity = '200%'; // Noir defaults to 200%
      console.log('Density page - No value in localStorage, using default', defaultDensity);
      setSelectedDensity(defaultDensity);
      localStorage.setItem('selectedDensity', defaultDensity);
    }
    
    // Also listen for customStorageChange event in case main page updates after mount
    const handleCustomStorageChange = () => {
      const pathname = window.location.pathname;
      const isOnEditRoute = pathname.includes('/edit');
      const isOnBlancoCustomizeRoute = pathname.includes('/blanco/customize');
      const isOnCustomizeRoute = isBuildAWigCustomizePath(pathname);
      
      // CRITICAL: For blanco customize mode, don't read from noir's localStorage
      if (isOnBlancoCustomizeRoute) {
        const customizeSelectedDensity = localStorage.getItem('customizeSelectedDensity');
        if (customizeSelectedDensity) {
          console.log('Density page - Updated from customStorageChange (blanco):', customizeSelectedDensity);
          setSelectedDensity(customizeSelectedDensity);
        } else {
          // Default to 250% for blanco
          console.log('Density page - Updated from customStorageChange (blanco default): 250%');
          setSelectedDensity('250%');
        }
        return; // Exit early - don't read from noir's localStorage
      }
      
      let currentDensity: string | null = null;
      if (isOnEditRoute) {
        currentDensity = localStorage.getItem('editSelectedDensity') || localStorage.getItem('selectedDensity');
      } else if (isOnCustomizeRoute) {
        currentDensity = localStorage.getItem('customizeSelectedDensity') || localStorage.getItem('selectedDensity');
      } else {
        currentDensity = localStorage.getItem('selectedDensity');
      }
      if (currentDensity) {
        console.log('Density page - Updated from customStorageChange:', currentDensity);
        setSelectedDensity(currentDensity);
      }
    };
    
    window.addEventListener('customStorageChange', handleCustomStorageChange);
    
    return () => {
      window.removeEventListener('customStorageChange', handleCustomStorageChange);
    };
  }, []);

  // Listen for changes in selected length and density to update note text
  useEffect(() => {
    const handleStorageChange = () => {
      // Update density from localStorage
      // CRITICAL: Check editSelected* keys first when in edit mode, then customizeSelected* for customize mode
      const pathname = window.location.pathname;
      const isOnEditRoute = pathname.includes('/edit');
      const isOnCustomizeRoute = isBuildAWigCustomizePath(pathname);
      
      let currentDensity: string | null = null;
      if (isOnEditRoute) {
        currentDensity = localStorage.getItem('editSelectedDensity') || localStorage.getItem('selectedDensity');
      } else if (isOnCustomizeRoute) {
        currentDensity = localStorage.getItem('customizeSelectedDensity') || localStorage.getItem('selectedDensity');
      } else {
        currentDensity = localStorage.getItem('selectedDensity');
      }
      if (currentDensity) {
        setSelectedDensity(currentDensity);
      }
      // Force re-render when length or density changes
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('customStorageChange', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('customStorageChange', handleStorageChange);
    };
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

          {/* Back Button - Moved outside centered preview area */}
            <div className="flex justify-start ml-[calc(50%-131px)]">
          </div>

          {/* DENSITY SELECTION HEADER */}
          <p 
            className="text-xs sm:text-sm text-center text-red-500 mb-4"
            style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', color: '#EB1C24', transform: 'translateY(18px)' }}
          >
            HAIR VOLUME
          </p>

          {/* DENSITY OPTIONS - Updated to fit 4 containers per row with centered layout */}
          <div className="grid grid-cols-4 gap-4 mx-auto justify-center mb-6 max-w-[320px]" style={{ marginTop: '15px' }}>
            {densityOptions.map((option) => {
              // For BLANCO, use larger image but keep container at 60px - image will overflow slightly
              const imgSize = isBlancoRoute ? 80 : 57;
              const containerSize = 60; // Always 60px for all routes
              return (
                <ThumbBox
                  key={option.id}
                  image={option.image}
                  title="DENSITY"
                  label={option.name}
                  isSelected={selectedDensity === option.id}
                  onClick={() => handleDensitySelect(option.id)}
                  imgSize={imgSize}
                  containerSize={containerSize}
                  topPosition="55%"
                />
              );
            })}
          </div>


          {/* DYNAMIC DENSITY NOTE */}
          <p
            className="font-futura text-[10px] md:text-xs text-center my-6 w-[95%] mx-auto uppercase"
            style={{ color: '#EB1C24', fontFamily: '"Futura PT Demi"', fontWeight: '500', transform: 'translateY(-7px)' }}
          >
            {getDensityNoteText()}
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
        </div>

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

export default DensitySelection;
