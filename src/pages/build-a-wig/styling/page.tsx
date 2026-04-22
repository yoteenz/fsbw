
import { useState, useEffect, type Dispatch, type SetStateAction } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ThumbBox from '../../../components/ThumbBox';
import DynamicCartIcon from '../../../components/DynamicCartIcon';
import LoadingScreen from '../../../components/base/LoadingScreen';
import ConfirmationModal from '../../../components/ConfirmationModal';
import BrandMenuLinks from '../../../components/BrandMenuLinks';
import SocialMenuIcons from '../../../components/SocialMenuIcons';
import { signOutAppAndSupabaseSession } from '../../../utils/adminAuth';
import { getBuildAWigFlowBasePath, isBuildAWigCustomizePath } from '../../../utils/buildAWigRoutes';
import {
  postLiveWigAfterColorStyling,
  postLiveWigAfterColorStylingRegenerateAngle,
} from '../../../utils/api';
import { isFounderNoirFalRegenUiVisible } from '../../../utils/founderNoirFalTools';
import { isPremiumMemberForGatedFeatures } from '../../../utils/premiumMemberAccess';
import {
  readBuildWigLivePreviewSelections,
  readBuildWigLivePreviewColor,
} from '../../../utils/buildWigLivePreviewSelections';
import { wigPreviewLiveColorTriplePublicUrlsForSelections } from '../../../utils/wigPreviewLiveStoragePublicUrls';
import {
  BAW_NOIR_LIVE_COLOR_VIEWS_EVENT,
  persistBawNoirLiveBangsWigViews,
  persistBawNoirLiveStylingWigViews,
  readBawNoirLiveBangsWigViews,
  readBawNoirLiveStylingWigViewsForPart,
  type BawNoirLiveStylingSalonMode,
  type BawNoirLiveWigViewsTriple,
} from '../../../utils/bawNoirLivePreviewStorage';
import { ShopMobileMenuShopTab } from '../../../components/ShopMobileMenuShopTab';
import { ShopMobileMenuToolsTab } from '../../../components/ShopMobileMenuToolsTab';
import { useBuildWigPremiumMembershipStepGate } from '../../../hooks/useBuildWigPremiumMembershipStepGate';
import { signInHrefWithReturnTo } from '../../../utils/signInReturnTo';
import { useShopNavSearchBar } from '../../../components/shop/useShopNavSearchBar';
import { useBawSubpageLiveNoirCompositeWigViews } from '../../../hooks/useBawSubpageLiveNoirCompositeWigViews';
import { useSignedInFromStorage } from '../../../hooks/useSignedInFromStorage';
import { BawNoirWigPreviewHeroThumbs } from '../../../components/buildWig/BawNoirWigPreviewFrames';
import {
  markBawNavigateToCustomizeHubFromOtherStep,
  readBawCrossStepSummary,
  type BawCrossStepSummary,
} from '../../../utils/bawCrossStepSummary';

export default function StylingSelectionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { NavCenter, SearchTrigger } = useShopNavSearchBar();
  const premiumMembershipStepModal = useBuildWigPremiumMembershipStepGate();
  const [selectedView, setSelectedView] = useState(1);
  // We do NOT auto-select a style when BLEACH/PLUCK are selected — styling is optional; user may want bleach/pluck only.
  const [selectedHairStyling, setSelectedHairStyling] = useState<string[]>(() => {
    const pathname = window.location.pathname;
    const isOnEditRoute = pathname.includes('/edit');
    const isOnCustomizeRoute = isBuildAWigCustomizePath(pathname);
    
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
    const isOnCustomizeRoute = isBuildAWigCustomizePath(pathname);
    
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
    
    const storedPartSelection =
      (isOnCustomizeRoute
        ? localStorage.getItem('customizeSelectedPartSelection')
        : null) ||
      localStorage.getItem('selectedPartSelection') ||
      'MIDDLE';
    
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

  /** Founder only: Fal regen **buttons** (forceRegenerate). */
  const [founderNoirFalRegenUi, setFounderNoirFalRegenUi] = useState(false);
  /** Premium (or BLACK tier): live after-color Fal fetches + composite hero — same gate as BAW premium steps. */
  const [noirLiveFalEligible, setNoirLiveFalEligible] = useState(() => isPremiumMemberForGatedFeatures());
  const [liveStylingWigViews, setLiveStylingWigViews] = useState<[string, string, string] | null>(null);
  const [liveBangsWigViews, setLiveBangsWigViews] = useState<[string, string, string] | null>(null);
  const [liveStylingLoading, setLiveStylingLoading] = useState(false);
  const [liveBangsLoading, setLiveBangsLoading] = useState(false);
  const [liveStylingError, setLiveStylingError] = useState<string | null>(null);
  const [regenStylingAngle, setRegenStylingAngle] = useState<'left' | 'front' | 'right' | null>(null);
  const [crossStepSummary, setCrossStepSummary] = useState<BawCrossStepSummary>(() =>
    readBawCrossStepSummary(location.pathname)
  );

  useEffect(() => {
    const sync = () => setCrossStepSummary(readBawCrossStepSummary(location.pathname));
    sync();
    window.addEventListener('customStorageChange', sync);
    window.addEventListener('focus', sync);
    return () => {
      window.removeEventListener('customStorageChange', sync);
      window.removeEventListener('focus', sync);
    };
  }, [location.pathname]);

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

  useEffect(() => {
    const p = location.pathname;
    const noirStyling =
      p.includes('/build-a-wig/noir/edit/styling') || p.includes('/build-a-wig/noir/customize/styling');
    if (!noirStyling) {
      setFounderNoirFalRegenUi(false);
      setNoirLiveFalEligible(false);
      setLiveStylingWigViews(null);
      setLiveBangsWigViews(null);
      setLiveStylingError(null);
      return;
    }
    let cancelled = false;
    const refreshFounderTools = () => {
      const founder = isFounderNoirFalRegenUiVisible();
      const premium = isPremiumMemberForGatedFeatures();
      if (!cancelled) {
        setFounderNoirFalRegenUi(founder);
        setNoirLiveFalEligible(premium);
      }
      if (!premium) {
        setLiveStylingWigViews(null);
        setLiveBangsWigViews(null);
      } else {
        const rawPart = (localStorage.getItem('selectedPartSelection') || 'MIDDLE').toUpperCase();
        const part: 'MIDDLE' | 'LEFT' | 'RIGHT' =
          rawPart === 'LEFT' || rawPart === 'RIGHT' || rawPart === 'MIDDLE' ? rawPart : 'MIDDLE';
        const sm: BawNoirLiveStylingSalonMode | null = selectedHairStyling.some((s) => s === 'LAYERS')
          ? selectedHairStyling.includes('BANGS')
            ? 'LAYERS_BANGS'
            : 'LAYERS'
          : selectedHairStyling.some((s) => s === 'CRIMPS')
            ? selectedHairStyling.includes('BANGS')
              ? 'CRIMPS_BANGS'
              : 'CRIMPS'
            : selectedHairStyling.some((s) => s === 'FLAT IRON')
              ? selectedHairStyling.includes('BANGS')
                ? 'FLAT_IRON_BANGS'
                : 'FLAT_IRON'
              : null;
        const skipFlatIronMiddleCache =
          sm === 'FLAT_IRON' && part === 'MIDDLE' && !selectedHairStyling.includes('BANGS');
        if (skipFlatIronMiddleCache) {
          setLiveStylingWigViews(null);
        } else {
          const cachedSalon = sm !== null ? readBawNoirLiveStylingWigViewsForPart(part, sm) : null;
          if (cachedSalon) setLiveStylingWigViews(cachedSalon);
          else setLiveStylingWigViews((prev) => prev);
        }
        const cachedBangs = readBawNoirLiveBangsWigViews();
        if (cachedBangs) setLiveBangsWigViews(cachedBangs);
        else setLiveBangsWigViews((prev) => prev);
      }
    };
    refreshFounderTools();
    const onAuth = () => {
      void refreshFounderTools();
    };
    window.addEventListener('signInStateChanged', onAuth);
    window.addEventListener('customStorageChange', onAuth);
    window.addEventListener('focus', onAuth);
    return () => {
      cancelled = true;
      window.removeEventListener('signInStateChanged', onAuth);
      window.removeEventListener('customStorageChange', onAuth);
      window.removeEventListener('focus', onAuth);
    };
  }, [location.pathname, selectedPartSelection, selectedHairStyling]);

  // CRITICAL: Reset part selection to MIDDLE when no styling is selected
  useEffect(() => {
    // Check if styling is actually selected (not empty array and not 'NONE')
    const hasStylingSelected = selectedHairStyling.length > 0 && 
                               selectedHairStyling.some(s => s !== 'NONE' && s.trim() !== '');
    
    if (!hasStylingSelected && selectedPartSelection !== 'MIDDLE') {
      console.log('Resetting part selection to MIDDLE because no styling is selected. Current styling:', selectedHairStyling, 'Current part:', selectedPartSelection);
      setSelectedPartSelection('MIDDLE');
      const p = window.location.pathname;
      const isCustomizeDraft =
        p.includes('/build-a-wig/noir/customize/') ||
        p.includes('/build-a-wig/blanco/customize/') ||
        p.includes('/build-a-wig/soft-wave/customize/') ||
        p.includes('/build-a-wig/soft-curl/customize/') ||
        p.includes('/build-a-wig/ocean-curl/customize/') ||
        p.includes('/build-a-wig/beach-wave/customize/');
      if (isCustomizeDraft) {
        localStorage.setItem('customizeSelectedPartSelection', 'MIDDLE');
      } else {
        localStorage.setItem('selectedPartSelection', 'MIDDLE');
      }
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
    
    const selectedHairline = (() => {
      const p = pathname;
      const isEdit = p.includes('/edit');
      const isCust = isBuildAWigCustomizePath(p);
      if (isEdit) {
        return (
          localStorage.getItem('editSelectedHairline') ||
          localStorage.getItem('selectedHairline') ||
          'NATURAL'
        );
      }
      if (isCust) {
        const onHairline = p.replace(/\/$/, '').endsWith('/hairline');
        if (onHairline) {
          return localStorage.getItem('customizeSelectedHairline') || localStorage.getItem('selectedHairline') || 'NATURAL';
        }
        return localStorage.getItem('selectedHairline') || localStorage.getItem('customizeSelectedHairline') || 'NATURAL';
      }
      return localStorage.getItem('selectedHairline') || 'NATURAL';
    })();
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

  const baseWigViews = getWigViews();
  const liveNoirCompositeWigViews = useBawSubpageLiveNoirCompositeWigViews();
  const hasLayersLiveStyling =
    location.pathname.includes('/build-a-wig/noir/') &&
    selectedHairStyling.some((s) => s === 'LAYERS') &&
    !selectedHairStyling.some((s) => s === 'CRIMPS') &&
    !selectedHairStyling.some((s) => s === 'FLAT IRON') &&
    (selectedPartSelection === 'MIDDLE' ||
      selectedPartSelection === 'LEFT' ||
      selectedPartSelection === 'RIGHT');

  const hasCrimpsLiveStyling =
    location.pathname.includes('/build-a-wig/noir/') &&
    selectedHairStyling.some((s) => s === 'CRIMPS') &&
    !selectedHairStyling.some((s) => s === 'LAYERS') &&
    !selectedHairStyling.some((s) => s === 'FLAT IRON') &&
    (selectedPartSelection === 'MIDDLE' ||
      selectedPartSelection === 'LEFT' ||
      selectedPartSelection === 'RIGHT');

  const hasFlatIronLiveStyling =
    location.pathname.includes('/build-a-wig/noir/') &&
    selectedHairStyling.some((s) => s === 'FLAT IRON') &&
    !selectedHairStyling.some((s) => s === 'LAYERS') &&
    !selectedHairStyling.some((s) => s === 'CRIMPS') &&
    (selectedPartSelection === 'MIDDLE' ||
      selectedPartSelection === 'LEFT' ||
      selectedPartSelection === 'RIGHT');

  const hasSalonPartLiveStyling =
    hasLayersLiveStyling || hasCrimpsLiveStyling || hasFlatIronLiveStyling;

  const salonLivePreviewLabel = hasLayersLiveStyling
    ? 'layers'
    : hasCrimpsLiveStyling
      ? 'crimps'
      : hasFlatIronLiveStyling
        ? 'flat iron'
        : '';

  const hasBangsWithSalon =
    selectedHairStyling.includes('BANGS') &&
    (selectedHairStyling.includes('LAYERS') ||
      selectedHairStyling.includes('CRIMPS') ||
      selectedHairStyling.includes('FLAT IRON'));

  /** Any BANGS selection (alone or + salon): part UI is MIDDLE only — L/R disabled (API/prompts use middle for bangs combos). */
  const bangsLocksPartToMiddle = selectedHairStyling.includes('BANGS');

  const salonStorageMode: BawNoirLiveStylingSalonMode = hasLayersLiveStyling
    ? hasBangsWithSalon
      ? 'LAYERS_BANGS'
      : 'LAYERS'
    : hasCrimpsLiveStyling
      ? hasBangsWithSalon
        ? 'CRIMPS_BANGS'
        : 'CRIMPS'
      : hasFlatIronLiveStyling
        ? hasBangsWithSalon
          ? 'FLAT_IRON_BANGS'
          : 'FLAT_IRON'
        : 'LAYERS';

  const hasBangsOnlyLive =
    location.pathname.includes('/build-a-wig/noir/') &&
    selectedHairStyling.some((s) => s === 'BANGS') &&
    !selectedHairStyling.some((s) => s === 'LAYERS') &&
    !selectedHairStyling.some((s) => s === 'CRIMPS') &&
    !selectedHairStyling.some((s) => s === 'FLAT IRON');

  /** FLAT IRON + MIDDLE without BANGS: hero uses **color-tier** triple (same as NOIR color page), not Fal `flat-iron-middle-part` WebPs. */
  const flatIronMiddleColorTierOnly =
    hasFlatIronLiveStyling &&
    selectedPartSelection === 'MIDDLE' &&
    !selectedHairStyling.includes('BANGS');

  /**
   * Color-tier URLs for **current** `readBuildWigLivePreviewColor` + selections (same Storage hash as live color API).
   * `bawNoirLiveColorWigViews` alone can lag **selectedColor** (e.g. still OFF BLACK after picking a paid swatch) — that made flat-iron middle look wrong.
   */
  const [flatIronMiddleColorTierPreview, setFlatIronMiddleColorTierPreview] =
    useState<BawNoirLiveWigViewsTriple | null>(null);

  useEffect(() => {
    if (!flatIronMiddleColorTierOnly || !location.pathname.includes('/build-a-wig/noir/')) {
      setFlatIronMiddleColorTierPreview(null);
      return;
    }
    let cancelled = false;
    const load = async () => {
      const pathname = location.pathname;
      const sel = readBuildWigLivePreviewSelections(pathname);
      const color = readBuildWigLivePreviewColor(pathname);
      const triple = await wigPreviewLiveColorTriplePublicUrlsForSelections({
        unitKey: 'NOIR',
        color,
        ...sel,
      });
      if (!cancelled) setFlatIronMiddleColorTierPreview(triple);
    };
    void load();
    const onStorage = () => {
      void load();
    };
    window.addEventListener('customStorageChange', onStorage);
    window.addEventListener('storage', onStorage);
    window.addEventListener(BAW_NOIR_LIVE_COLOR_VIEWS_EVENT, onStorage);
    return () => {
      cancelled = true;
      window.removeEventListener('customStorageChange', onStorage);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(BAW_NOIR_LIVE_COLOR_VIEWS_EVENT, onStorage);
    };
  }, [flatIronMiddleColorTierOnly, location.pathname]);

  /** BANGS (alone or + salon): only MIDDLE part (L/R disabled in UI). */
  useEffect(() => {
    if (!bangsLocksPartToMiddle || selectedPartSelection === 'MIDDLE') return;
    setSelectedPartSelection('MIDDLE');
    try {
      const p = window.location.pathname;
      const isCustomizeDraft =
        p.includes('/build-a-wig/noir/customize/') ||
        p.includes('/build-a-wig/blanco/customize/') ||
        p.includes('/build-a-wig/soft-wave/customize/') ||
        p.includes('/build-a-wig/soft-curl/customize/') ||
        p.includes('/build-a-wig/ocean-curl/customize/') ||
        p.includes('/build-a-wig/beach-wave/customize/');
      if (isCustomizeDraft) {
        localStorage.setItem('customizeSelectedPartSelection', 'MIDDLE');
      } else {
        localStorage.setItem('selectedPartSelection', 'MIDDLE');
      }
      window.dispatchEvent(new CustomEvent('customStorageChange'));
    } catch {
      /* ignore */
    }
  }, [bangsLocksPartToMiddle, selectedPartSelection]);

  useEffect(() => {
    const pathname = location.pathname;
    const noir =
      noirLiveFalEligible &&
      (pathname.includes('/build-a-wig/noir/edit/styling') ||
        pathname.includes('/build-a-wig/noir/customize/styling'));
    if (!noir || !hasSalonPartLiveStyling) {
      if (!hasSalonPartLiveStyling) setLiveStylingWigViews(null);
      return;
    }
    const stylingForApi = selectedHairStyling
      .filter((s) => s && s !== 'NONE')
      .sort()
      .join(',');
    if (hasLayersLiveStyling && !stylingForApi.includes('LAYERS')) {
      setLiveStylingWigViews(null);
      return;
    }
    if (hasCrimpsLiveStyling && !stylingForApi.includes('CRIMPS')) {
      setLiveStylingWigViews(null);
      return;
    }
    if (hasFlatIronLiveStyling && !stylingForApi.includes('FLAT IRON')) {
      setLiveStylingWigViews(null);
      return;
    }
    if (
      hasFlatIronLiveStyling &&
      selectedPartSelection === 'MIDDLE' &&
      !selectedHairStyling.includes('BANGS')
    ) {
      setLiveStylingWigViews(null);
      setLiveStylingLoading(false);
      return;
    }
    setLiveStylingError(null);
    setLiveStylingLoading(true);
    const partKey = selectedPartSelection as 'MIDDLE' | 'LEFT' | 'RIGHT';
    const cachedForPart = readBawNoirLiveStylingWigViewsForPart(partKey, salonStorageMode);
    if (cachedForPart) setLiveStylingWigViews(cachedForPart);
    /** Stale-while-revalidate: keep showing the previous salon triple until this fetch returns. */
    const sel = readBuildWigLivePreviewSelections(pathname);
    const color = readBuildWigLivePreviewColor(pathname);
    /** No `forceRegenerate` on auto-fetch — server returns cached Storage WebPs when present (avoids re-running Fal on every part tap). Use **regenerate** buttons to force Fal. */
    void postLiveWigAfterColorStyling(
      {
        color,
        ...sel,
        styling: stylingForApi,
        partSelection: selectedPartSelection,
      }
    )
      .then((res) => {
        const u = res.publicUrls;
        if (u.front && u.left && u.right) {
          const bust = Date.now();
          const triple: [string, string, string] = [
            `${u.left}?t=${bust}`,
            `${u.front}?t=${bust}`,
            `${u.right}?t=${bust}`,
          ];
          setLiveStylingWigViews(triple);
          persistBawNoirLiveStylingWigViews(
            triple,
            selectedPartSelection as 'MIDDLE' | 'LEFT' | 'RIGHT',
            salonStorageMode
          );
        }
        /** Else: keep previous triple — do not flash to base/color. */
      })
      .catch((e: Error) => {
        setLiveStylingError(e?.message || 'Live styling preview failed');
      })
      .finally(() => setLiveStylingLoading(false));
  }, [
    noirLiveFalEligible,
    location.pathname,
    selectedHairStyling,
    selectedPartSelection,
    hasSalonPartLiveStyling,
    hasLayersLiveStyling,
    hasCrimpsLiveStyling,
    hasFlatIronLiveStyling,
    salonStorageMode,
  ]);

  useEffect(() => {
    const pathname = location.pathname;
    const noir =
      noirLiveFalEligible &&
      (pathname.includes('/build-a-wig/noir/edit/styling') ||
        pathname.includes('/build-a-wig/noir/customize/styling'));
    if (!noir || !hasBangsOnlyLive) {
      if (!hasBangsOnlyLive) setLiveBangsWigViews(null);
      return;
    }
    const stylingForApi = selectedHairStyling
      .filter((s) => s && s !== 'NONE')
      .sort()
      .join(',');
    if (
      stylingForApi !== 'BANGS' ||
      selectedHairStyling.some((s) => s === 'LAYERS' || s === 'CRIMPS' || s === 'FLAT IRON')
    ) {
      setLiveBangsWigViews(null);
      return;
    }
    setLiveStylingError(null);
    setLiveBangsLoading(true);
    const sel = readBuildWigLivePreviewSelections(pathname);
    const color = readBuildWigLivePreviewColor(pathname);
    void postLiveWigAfterColorStyling(
      {
        color,
        ...sel,
        styling: stylingForApi,
        partSelection: selectedPartSelection,
      }
    )
      .then((res) => {
        const u = res.publicUrls;
        if (u.front && u.left && u.right) {
          const bust = Date.now();
          const triple: [string, string, string] = [
            `${u.left}?t=${bust}`,
            `${u.front}?t=${bust}`,
            `${u.right}?t=${bust}`,
          ];
          setLiveBangsWigViews(triple);
          persistBawNoirLiveBangsWigViews(triple);
        }
        /** Else: keep previous triple — do not flash to base/color. */
      })
      .catch((e: Error) => {
        setLiveStylingError(e?.message || 'Live styling preview failed');
      })
      .finally(() => setLiveBangsLoading(false));
  }, [
    noirLiveFalEligible,
    location.pathname,
    selectedHairStyling,
    selectedPartSelection,
    hasBangsOnlyLive,
  ]);

  const wigViews =
    flatIronMiddleColorTierOnly &&
    (flatIronMiddleColorTierPreview ?? liveNoirCompositeWigViews)
      ? (flatIronMiddleColorTierPreview ?? liveNoirCompositeWigViews)!
      : noirLiveFalEligible && hasSalonPartLiveStyling && liveStylingWigViews
        ? liveStylingWigViews
        : noirLiveFalEligible && hasBangsOnlyLive && liveBangsWigViews
          ? liveBangsWigViews
          : liveNoirCompositeWigViews && location.pathname.includes('/build-a-wig/noir/')
            ? liveNoirCompositeWigViews
            : baseWigViews;

  const showNoirFalHintPremium =
    noirLiveFalEligible && location.pathname.includes('/build-a-wig/noir/');
  /** Show Fal / LIVE PREVIEW / regen copy on NOIR styling step only (not other BAW steps). */
  const showNoirStylingFalRegenText =
    location.pathname.includes('/build-a-wig/noir/edit/styling') ||
    location.pathname.includes('/build-a-wig/noir/customize/styling');
  /** Founder Fal regen links — include **FLAT IRON + MIDDLE** (no bangs): hero uses color-tier URLs but regen must still run to populate **`after-color/flat-iron-middle-part/`** in Storage. */
  const showNoirLiveStylingRegenControls =
    founderNoirFalRegenUi &&
    location.pathname.includes('/build-a-wig/noir/') &&
    (hasSalonPartLiveStyling || hasBangsOnlyLive);
  const liveStylingAnyLoading = liveStylingLoading || liveBangsLoading;

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
      price: 120
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
        setSelectedPartSelection('MIDDLE');
      } else {
        // If selecting non-bangs option
        if (currentSelections.includes('BANGS')) {
          // If bangs is already selected, replace the secondary option
          setSelectedHairStyling(['BANGS', stylingId]);
          setSelectedPartSelection('MIDDLE');
        } else {
          // If bangs is not selected, this replaces the current selection (no combination)
          setSelectedHairStyling([stylingId]);
        }
      }
    }
  };

  const handlePartSelectionSelect = (partId: string) => {
    if (selectedHairStyling.includes('BANGS') && partId !== 'MIDDLE') return;

    // CRITICAL: Check if styling is actually selected (not empty and not 'NONE')
    const hasStylingSelected = selectedHairStyling.length > 0 && 
                               selectedHairStyling.some(s => s !== 'NONE' && s.trim() !== '');
    
    // Only allow changing part selection if hair styling is selected
    // MIDDLE can always be selected, but LEFT and RIGHT require hair styling
    if (partId === 'MIDDLE' || hasStylingSelected) {
      setSelectedPartSelection(partId);
      try {
        const pathname = window.location.pathname;
        const isCustomizeDraft =
          pathname.includes('/build-a-wig/noir/customize/') ||
          pathname.includes('/build-a-wig/blanco/customize/') ||
          pathname.includes('/build-a-wig/soft-wave/customize/') ||
          pathname.includes('/build-a-wig/soft-curl/customize/') ||
          pathname.includes('/build-a-wig/ocean-curl/customize/') ||
          pathname.includes('/build-a-wig/beach-wave/customize/');
        if (isCustomizeDraft) {
          localStorage.setItem('customizeSelectedPartSelection', partId);
        } else {
          localStorage.setItem('selectedPartSelection', partId);
        }
        window.dispatchEvent(new CustomEvent('customStorageChange'));
      } catch {
        /* ignore */
      }
    } else {
      console.log('handlePartSelectionSelect: Blocked selection of', partId, '- no styling selected');
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

  const getTotalStylingPrice = () => {
    if (selectedHairStyling.length === 0) {
      return 0;
    }

    const priceForStylingId = (id: string) =>
      hairStylingOptions.find((opt) => opt.id === id)?.price || 0;
    
    const hasBangs = selectedHairStyling.includes('BANGS');
    const otherStyling = selectedHairStyling.find(id => id !== 'BANGS');
    
    // Get selected length from localStorage to check if it's 30" or above
    const selectedLength = localStorage.getItem('selectedLength') || '';
    const isLongLength = selectedLength.includes('30') || selectedLength.includes('32') || selectedLength.includes('34') || selectedLength.includes('36');
    
    if (hasBangs && otherStyling) {
      // Bangs + another styling: full price of secondary option + $20 for bangs (reduced from $40)
      let secondaryPrice = priceForStylingId(otherStyling);
      
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
      let basePrice = priceForStylingId(selectedHairStyling[0]);
      
      // Add $40 for lengths 30" and above for crimps, flat iron, and layers
      if (isLongLength && (selectedHairStyling[0] === 'CRIMPS' || selectedHairStyling[0] === 'FLAT IRON' || selectedHairStyling[0] === 'LAYERS')) {
        basePrice += 40;
      }
      
      return basePrice;
    }
  };

  const totalPrice = getTotalStylingPrice();

  // Sync add-ons with styling: when a style is confirmed, BLEACH+PLUCK are required (persist them);
  // when style is deselected, remove BLEACH+PLUCK if they were auto-added (tandem deselect).
  const getAddOnsAndPriceForStylingSync = (isEdit: boolean, isCustomize: boolean, styleConfirmed: boolean) => {
    const addOnsOrder = ['BLEACH', 'PLUCK', 'BLUNT CUT'];
    const addOnPrices: Record<string, number> = { BLEACH: 60, PLUCK: 80, 'BLUNT CUT': 20 };
    const discountedLaceSizes = ['2X6', '4X4', '5X5', '6X6', '7X7'];

    const laceKey = isEdit ? 'editSelectedLace' : (isCustomize ? 'customizeSelectedLace' : 'selectedLace');
    const addOnsKey = isEdit ? 'editSelectedAddOns' : (isCustomize ? 'customizeSelectedAddOns' : 'selectedAddOns');
    const selectedLace = localStorage.getItem(laceKey) || localStorage.getItem('selectedLace') || '';
    const hasLaceDiscount = discountedLaceSizes.includes(selectedLace);

    let raw: string | null = null;
    try {
      raw = localStorage.getItem(addOnsKey) || localStorage.getItem('selectedAddOns');
    } catch (_) {}
    let addOns: string[] = [];
    if (raw) try { addOns = JSON.parse(raw); } catch (_) {}

    if (styleConfirmed) {
      if (!addOns.includes('BLEACH') || !addOns.includes('PLUCK')) {
        sessionStorage.setItem('addOnsBeforeStylingSelection', JSON.stringify(addOns));
        const addOnsBeforeStyling = addOns.filter((x: string) => x !== 'BLEACH' && x !== 'PLUCK');
        const merged = [...addOnsBeforeStyling, 'BLEACH', 'PLUCK'];
        addOns = merged.sort((a: string, b: string) => addOnsOrder.indexOf(a) - addOnsOrder.indexOf(b));
        sessionStorage.setItem('bleachPluckAutoAddedForStyling', 'true');
      }
    } else {
      if (sessionStorage.getItem('bleachPluckAutoAddedForStyling') === 'true' && (addOns.includes('BLEACH') || addOns.includes('PLUCK'))) {
        const savedBefore = sessionStorage.getItem('addOnsBeforeStylingSelection');
        addOns = savedBefore ? (JSON.parse(savedBefore) as string[]) : addOns.filter((x: string) => x !== 'BLEACH' && x !== 'PLUCK');
        sessionStorage.removeItem('bleachPluckAutoAddedForStyling');
        sessionStorage.removeItem('addOnsBeforeStylingSelection');
      }
    }

    const price = addOns.reduce((total: number, id: string) => {
      let p = addOnPrices[id] ?? 0;
      if (hasLaceDiscount && (id === 'BLEACH' || id === 'PLUCK')) p -= 20;
      return total + p;
    }, 0);

    return { addOns, price };
  };

  // NOIR customize sub-routes: persist draft `customizeSelected*` on every tap so live preview + hub
  // resolution never fall back to stale `selected*` before Confirm.
  useEffect(() => {
    const p = location.pathname;
    if (!p.startsWith('/build-a-wig/noir/customize/')) return;

    const price = getTotalStylingPrice().toString();
    const stylingValue = selectedHairStyling.length > 0 ? selectedHairStyling[0] : 'NONE';
    const hairCsv = selectedHairStyling.length > 0 ? selectedHairStyling.join(',') : '';

    if (hairCsv) {
      localStorage.setItem('customizeSelectedHairStyling', hairCsv);
    } else {
      localStorage.removeItem('customizeSelectedHairStyling');
    }
    localStorage.setItem('customizeSelectedPartSelection', selectedPartSelection);
    localStorage.setItem('customizeSelectedStyling', stylingValue === 'NONE' ? 'NONE' : stylingValue);
    localStorage.setItem('customizeSelectedStylingPrice', price);

    const styleConfirmed = !!(stylingValue && stylingValue !== 'NONE' && stylingValue.trim() !== '');
    const { addOns: syncedAddOns, price: addOnsPrice } = getAddOnsAndPriceForStylingSync(
      false,
      true,
      styleConfirmed
    );
    localStorage.setItem('customizeSelectedAddOns', JSON.stringify(syncedAddOns));
    localStorage.setItem('customizeSelectedAddOnsPrice', addOnsPrice.toString());

    window.dispatchEvent(new CustomEvent('customStorageChange'));
  }, [location.pathname, selectedHairStyling, selectedPartSelection]);

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
      const hairCsv = selectedHairStyling.length > 0 ? selectedHairStyling.join(',') : '';

      // Customize draft: only `customizeSelected*` until Confirm — do not overwrite hub `selected*` on back.
      if (isOnProductSpecificCustomizeRoute) {
        if (hairCsv) {
          localStorage.setItem('customizeSelectedHairStyling', hairCsv);
        } else {
          localStorage.removeItem('customizeSelectedHairStyling');
        }
        localStorage.setItem('customizeSelectedPartSelection', selectedPartSelection);
        localStorage.setItem('customizeSelectedStyling', stylingValue === 'NONE' ? 'NONE' : stylingValue);
        localStorage.setItem('customizeSelectedStylingPrice', price);
        const styleConfirmed = !!(stylingValue && stylingValue !== 'NONE' && stylingValue.trim() !== '');
        const { addOns: syncedAddOns, price: addOnsPrice } = getAddOnsAndPriceForStylingSync(
          false,
          true,
          styleConfirmed
        );
        localStorage.setItem('customizeSelectedAddOns', JSON.stringify(syncedAddOns));
        localStorage.setItem('customizeSelectedAddOnsPrice', addOnsPrice.toString());
      }

      if (isOnProductSpecificEditRoute) {
        if (selectedHairStyling.length > 0) {
          localStorage.setItem('selectedHairStyling', selectedHairStyling.join(','));
        } else {
          localStorage.removeItem('selectedHairStyling');
        }
        localStorage.setItem('selectedPartSelection', selectedPartSelection);
        localStorage.setItem('selectedStylingPrice', price);
        if (stylingValue && stylingValue !== 'NONE') {
          localStorage.setItem('editSelectedStyling', stylingValue);
        } else {
          localStorage.removeItem('editSelectedStyling');
        }
        localStorage.setItem('editSelectedStylingPrice', price);
        const styleConfirmed = !!(stylingValue && stylingValue !== 'NONE' && stylingValue.trim() !== '');
        const { addOns: syncedAddOns, price: addOnsPrice } = getAddOnsAndPriceForStylingSync(
          true,
          false,
          styleConfirmed
        );
        localStorage.setItem('selectedAddOns', JSON.stringify(syncedAddOns));
        localStorage.setItem('selectedAddOnsPrice', addOnsPrice.toString());
        localStorage.setItem('editSelectedAddOns', JSON.stringify(syncedAddOns));
        localStorage.setItem('editSelectedAddOnsPrice', addOnsPrice.toString());
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
    
    markBawNavigateToCustomizeHubFromOtherStep(returnRoute);
    navigate(returnRoute);
  };

  const handleConfirmSelection = () => {
    const pathname = window.location.pathname;
    const isEditMode = localStorage.getItem('editingCartItem') !== null || 
                       pathname.includes('/noir/edit') ||
                       pathname.includes('/blanco/edit') ||
                       pathname.includes('/soft-wave/edit') ||
                       pathname.includes('/soft-curl/edit') ||
                       pathname.includes('/ocean-curl/edit') ||
                       pathname.includes('/beach-wave/edit');
    const isCustomizeMode = isBuildAWigCustomizePath(pathname);

    const hairCsv = selectedHairStyling.length > 0 ? selectedHairStyling.join(',') : '';
    // Save hair styling (can be empty array if none selected)
    if (selectedHairStyling.length > 0) {
      localStorage.setItem('selectedHairStyling', selectedHairStyling.join(','));
    } else {
      localStorage.removeItem('selectedHairStyling');
    }
    if (isCustomizeMode) {
      if (hairCsv) {
        localStorage.setItem('customizeSelectedHairStyling', hairCsv);
      } else {
        localStorage.removeItem('customizeSelectedHairStyling');
      }
    }

    // Save part selection (always has a value, defaults to MIDDLE)
    localStorage.setItem('selectedPartSelection', selectedPartSelection);
    if (isCustomizeMode) {
      localStorage.setItem('customizeSelectedPartSelection', selectedPartSelection);
    }
    if (isEditMode) {
      localStorage.setItem('editSelectedPartSelection', selectedPartSelection);
    }

    const price = getTotalStylingPrice().toString();
    
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
        console.log('Styling page - No sourceRoute found, detected edit mode from localStorage/pathname');
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

    // Sync add-ons with styling: confirm BLEACH+PLUCK when style is confirmed, deselect when style is NONE (tandem)
    const styleConfirmed = !!(stylingValue && stylingValue !== 'NONE' && stylingValue.trim() !== '');
    const { addOns: syncedAddOnsConfirm, price: addOnsPriceConfirm } = getAddOnsAndPriceForStylingSync(
      isEditMode,
      isCustomizeMode,
      styleConfirmed
    );
    localStorage.setItem('selectedAddOns', JSON.stringify(syncedAddOnsConfirm));
    localStorage.setItem('selectedAddOnsPrice', addOnsPriceConfirm.toString());
    if (isEditMode) {
      localStorage.setItem('editSelectedAddOns', JSON.stringify(syncedAddOnsConfirm));
      localStorage.setItem('editSelectedAddOnsPrice', addOnsPriceConfirm.toString());
    }
    if (isCustomizeMode) {
      localStorage.setItem('customizeSelectedAddOns', JSON.stringify(syncedAddOnsConfirm));
      localStorage.setItem('customizeSelectedAddOnsPrice', addOnsPriceConfirm.toString());
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
    
    markBawNavigateToCustomizeHubFromOtherStep(returnRoute);
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
                  onClick={() => navigate(getBuildAWigFlowBasePath(window.location.pathname))}
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
            {showNoirFalHintPremium && !showNoirLiveStylingRegenControls && (
              <p
                className="text-center mb-2 px-2"
                style={{
                  fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                  fontSize: '9px',
                  color: '#808080',
                  maxWidth: '280px',
                  ...(showNoirStylingFalRegenText ? {} : { display: 'none' }),
                }}
                aria-hidden={!showNoirStylingFalRegenText}
              >
                Fal regen (LAYERS / CRIMPS / FLAT IRON / BANGS): select a salon style + part or BANGS below, or use the NOIR color page for color WebPs.
              </p>
            )}
            {showNoirLiveStylingRegenControls && (
              <p
                className="text-center mb-2 px-2"
                style={{
                  fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                  fontSize: '9px',
                  color: liveStylingError ? '#EB1C24' : '#808080',
                  maxWidth: '280px',
                  ...(showNoirStylingFalRegenText ? {} : { display: 'none' }),
                }}
                aria-hidden={!showNoirStylingFalRegenText}
              >
                {liveStylingLoading
                  ? `LIVE PREVIEW: ${salonLivePreviewLabel}${hasBangsWithSalon ? ' + bangs' : ''} + ${selectedPartSelection} part (after color)…`
                  : liveBangsLoading
                    ? 'LIVE PREVIEW: curtain bangs (after color)…'
                    : liveStylingError
                      ? `LIVE PREVIEW: ${liveStylingError}`
                      : hasSalonPartLiveStyling
                        ? 'LIVE PREVIEW: uses your saved color WebPs (NOIR color page first). Regenerate below if the hair color still looks wrong (cached WebPs).'
                        : 'LIVE PREVIEW: BANGS only — uses your saved color WebPs (NOIR color page first). Regenerate below if the hair color still looks wrong.'}
              </p>
            )}
            {showNoirLiveStylingRegenControls && (
              <div
                className="flex flex-col items-center gap-y-2 mb-2 px-2"
                style={{
                  maxWidth: '280px',
                  ...(showNoirStylingFalRegenText ? {} : { display: 'none' }),
                }}
                aria-hidden={!showNoirStylingFalRegenText}
              >
                <button
                  type="button"
                  disabled={Boolean(regenStylingAngle) || liveStylingAnyLoading}
                  onClick={() => {
                    const pathname = location.pathname;
                    const stylingForApi = selectedHairStyling
                      .filter((s) => s && s !== 'NONE')
                      .sort()
                      .join(',');
                    const sel = readBuildWigLivePreviewSelections(pathname);
                    const color = readBuildWigLivePreviewColor(pathname);
                    setLiveStylingError(null);
                    if (hasSalonPartLiveStyling) {
                      setLiveStylingLoading(true);
                      void postLiveWigAfterColorStyling({
                        color,
                        ...sel,
                        styling: stylingForApi,
                        partSelection: selectedPartSelection,
                        forceRegenerate: true,
                      })
                        .then((res) => {
                          const u = res.publicUrls;
                          if (u.front && u.left && u.right) {
                            const bust = Date.now();
                            const triple: [string, string, string] = [
                              `${u.left}?t=${bust}`,
                              `${u.front}?t=${bust}`,
                              `${u.right}?t=${bust}`,
                            ];
                            setLiveStylingWigViews(triple);
                            persistBawNoirLiveStylingWigViews(
                              triple,
                              selectedPartSelection as 'MIDDLE' | 'LEFT' | 'RIGHT',
                              salonStorageMode
                            );
                          }
                        })
                        .catch((e: Error) => {
                          setLiveStylingError(e?.message || 'Regenerate all failed');
                        })
                        .finally(() => setLiveStylingLoading(false));
                    } else if (hasBangsOnlyLive) {
                      setLiveBangsLoading(true);
                      void postLiveWigAfterColorStyling({
                        color,
                        ...sel,
                        styling: stylingForApi,
                        partSelection: selectedPartSelection,
                        forceRegenerate: true,
                      })
                        .then((res) => {
                          const u = res.publicUrls;
                          if (u.front && u.left && u.right) {
                            const bust = Date.now();
                            const triple: [string, string, string] = [
                              `${u.left}?t=${bust}`,
                              `${u.front}?t=${bust}`,
                              `${u.right}?t=${bust}`,
                            ];
                            setLiveBangsWigViews(triple);
                            persistBawNoirLiveBangsWigViews(triple);
                          }
                        })
                        .catch((e: Error) => {
                          setLiveStylingError(e?.message || 'Regenerate all failed');
                        })
                        .finally(() => setLiveBangsLoading(false));
                    }
                  }}
                  style={{
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    fontSize: '9px',
                    color: liveStylingAnyLoading || regenStylingAngle ? '#808080' : '#EB1C24',
                    textDecoration: 'underline',
                    textUnderlineOffset: '2px',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: liveStylingAnyLoading || regenStylingAngle ? 'wait' : 'pointer',
                  }}
                >
                  {liveStylingAnyLoading ? 'regenerating all angles…' : 'regenerate all angles (fal)'}
                </button>
                <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
                {(['left', 'front', 'right'] as const).map((ang) => {
                  const label = ang === 'left' ? 'L' : ang === 'front' ? 'M' : 'R';
                  const busy = regenStylingAngle === ang;
                  return (
                    <button
                      key={ang}
                      type="button"
                      disabled={Boolean(regenStylingAngle) || liveStylingAnyLoading}
                      onClick={() => {
                        const pathname = location.pathname;
                        const sel = readBuildWigLivePreviewSelections(pathname);
                        const color = readBuildWigLivePreviewColor(pathname);
                        const stylingForApi = selectedHairStyling
                          .filter((s) => s && s !== 'NONE')
                          .sort()
                          .join(',');
                        setRegenStylingAngle(ang);
                        setLiveStylingError(null);
                        void postLiveWigAfterColorStylingRegenerateAngle(
                          {
                            color,
                            ...sel,
                            styling: stylingForApi,
                            partSelection: selectedPartSelection,
                          },
                          ang
                        )
                          .then((res) => {
                            const bust = Date.now();
                            const L = res.publicUrls.left;
                            const F = res.publicUrls.front;
                            const R = res.publicUrls.right;
                            const applyTriple = (
                              setter: Dispatch<SetStateAction<[string, string, string] | null>>,
                              persist: (t: [string, string, string]) => void
                            ) => {
                              setter((prev) => {
                                const pl = L ? `${L}?t=${bust}` : prev?.[0];
                                const pf = F ? `${F}?t=${bust}` : prev?.[1];
                                const pr = R ? `${R}?t=${bust}` : prev?.[2];
                                if (pl && pf && pr) {
                                  const t: [string, string, string] = [pl, pf, pr];
                                  persist(t);
                                  return t;
                                }
                                if (!prev) return prev;
                                const next: [string, string, string] = [...prev];
                                const idx = ang === 'left' ? 0 : ang === 'front' ? 1 : 2;
                                const u = ang === 'left' ? L : ang === 'front' ? F : R;
                                if (u) next[idx] = `${u}?t=${bust}`;
                                persist(next);
                                return next;
                              });
                            };
                            if (hasSalonPartLiveStyling) {
                              const part = selectedPartSelection as 'MIDDLE' | 'LEFT' | 'RIGHT';
                              applyTriple(setLiveStylingWigViews, (t) =>
                                persistBawNoirLiveStylingWigViews(t, part, salonStorageMode)
                              );
                            } else {
                              applyTriple(setLiveBangsWigViews, persistBawNoirLiveBangsWigViews);
                            }
                          })
                          .catch((e: Error) => {
                            setLiveStylingError(e?.message || 'Regenerate failed');
                          })
                          .finally(() => setRegenStylingAngle(null));
                      }}
                      style={{
                        fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                        fontSize: '9px',
                        color: busy ? '#808080' : '#EB1C24',
                        textDecoration: 'underline',
                        textUnderlineOffset: '2px',
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: regenStylingAngle ? 'wait' : 'pointer',
                      }}
                    >
                      {busy ? `regen ${label}…` : `regen style ${label}`}
                    </button>
                  );
                })}
                </div>
              </div>
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
                    ...(showNoirLiveStylingRegenControls && showNoirStylingFalRegenText
                      ? { pointerEvents: 'none' as const }
                      : {}),
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

          {/* HAIR STYLING SECTION */}
            <p 
              className="text-xs sm:text-sm text-center text-red-500 mb-4"
              style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', color: '#EB1C24', transform: 'translateY(18px)' }}
            >
              SALON TREATMENTS
            </p>
            <p
              className="text-center px-2 mb-3 w-full max-w-[320px] mx-auto"
              style={{
                fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                fontSize: '9px',
                color: '#808080',
                lineHeight: 1.35,
                transform: 'translateY(8px)',
              }}
            >
              CURRENT: COLOR {crossStepSummary.colorLabel} · HAIRLINE {crossStepSummary.hairlineLabel} · STYLING{' '}
              {crossStepSummary.stylingLabel}
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
                const isDisabled =
                  option.id !== 'MIDDLE' &&
                  (!hasStylingSelected || bangsLocksPartToMiddle);
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
                      if (option.id === 'MIDDLE') {
                        handlePartSelectionSelect(option.id);
                      } else if (hasStylingSelected && !bangsLocksPartToMiddle) {
                        handlePartSelectionSelect(option.id);
                      } else {
                        console.log('Selection blocked for:', option.id, '- no styling selected or BANGS locks MIDDLE');
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
              <p className="font-futura text-[12px] font-medium" style={{ color: '#808080' }}>
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
    </div>
    </>
  );
}
