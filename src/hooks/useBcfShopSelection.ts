import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BCF_DEFAULT_LENGTH_ID,
  BCF_TEXTURE_LABELS,
  BCF_CATEGORY_LABELS,
  BCF_LACE_TREATMENT_OPTIONS,
  bcfBasePriceUsd,
  bcfColorOptionsForOrigin,
  bcfDefaultColorIdForOrigin,
  bcfDefaultOriginForRouteTexture,
  bcfLaceOptionsForCategory,
  bcfLaceTreatmentPrice,
  bcfPriceAdjustments,
  bcfTexturesForOrigin,
  BCF_RUSSIAN_ONLY_COLOR_IDS,
  type BcfOriginId,
} from '../utils/bcfProductOptions';
import { bcfPdpHeroPhotoSrc, type BcfPdpCategory, type BcfPdpTexture } from '../utils/bcfPdpHeroAssets';
import { shopTextureCategoryThumbSrc } from '../utils/shopTextureCategoryThumb';
import { isPremiumMemberForGatedFeatures } from '../utils/premiumMemberAccess';
import { useProductInventorySnapshot } from './useProductInventorySnapshot';

const TEXTURE_ORDER: BcfPdpTexture[] = ['straight', 'wavy', 'curly'];

export type BcfAddToBagState = 'idle' | 'adding' | 'added';

export function useBcfShopSelection(initialCategory: BcfPdpCategory = 'bundles') {
  const inventory = useProductInventorySnapshot();
  const soldOut = inventory.isBcfSoldOut();

  const [category, setCategory] = useState<BcfPdpCategory>(initialCategory);
  const [texture, setTexture] = useState<BcfPdpTexture>('straight');
  const [bcfOrigin, setBcfOrigin] = useState<BcfOriginId>(() => bcfDefaultOriginForRouteTexture('straight'));
  const [bcfLength, setBcfLength] = useState(BCF_DEFAULT_LENGTH_ID);
  const [bcfColor, setBcfColor] = useState(() => bcfDefaultColorIdForOrigin(bcfDefaultOriginForRouteTexture('straight')));
  const [bcfLaceTreatment, setBcfLaceTreatment] = useState<string[]>([]);
  const [bcfLace, setBcfLace] = useState(() => {
    const opts = bcfLaceOptionsForCategory('closures');
    return opts[0]?.id ?? '5X5';
  });
  const [addToBagState, setAddToBagState] = useState<BcfAddToBagState>('idle');
  const [showPremiumGate, setShowPremiumGate] = useState(false);

  const bcfColorsAvailable = useMemo(() => bcfColorOptionsForOrigin(bcfOrigin), [bcfOrigin]);
  const allowedBcfTextures = useMemo(() => bcfTexturesForOrigin(bcfOrigin), [bcfOrigin]);
  const bcfLaceOptions = useMemo(
    () => (category === 'bundles' ? [] : bcfLaceOptionsForCategory(category)),
    [category],
  );

  const displayPrice = useMemo(() => {
    const basePrice = bcfBasePriceUsd(category, texture);
    return (
      basePrice +
      bcfPriceAdjustments(bcfLength, bcfColor, category === 'bundles' ? null : bcfLace) +
      (category === 'bundles' ? 0 : bcfLaceTreatmentPrice(bcfLaceTreatment))
    );
  }, [category, texture, bcfLength, bcfColor, bcfLace, bcfLaceTreatment]);

  const heroPhotoSrc = useMemo(
    () => bcfPdpHeroPhotoSrc(category, texture, bcfColor),
    [category, texture, bcfColor],
  );

  const cartLineName = `${BCF_CATEGORY_LABELS[category]} · ${BCF_TEXTURE_LABELS[texture]}`;
  const cartThumbSrc = shopTextureCategoryThumbSrc(texture, category);
  const isPremiumMember = isPremiumMemberForGatedFeatures();

  useEffect(() => {
    if (category === 'bundles') return;
    const opts = bcfLaceOptionsForCategory(category);
    setBcfLace((prev) => (opts.some((o) => o.id === prev) ? prev : (opts[0]?.id ?? prev)));
  }, [category]);

  useEffect(() => {
    if (!allowedBcfTextures.includes(texture)) {
      setTexture(allowedBcfTextures[0] ?? 'straight');
    }
  }, [allowedBcfTextures, texture]);

  useEffect(() => {
    const allowedColorIds = new Set(bcfColorsAvailable.map((c) => c.id));
    if (!allowedColorIds.has(bcfColor)) {
      setBcfColor(bcfDefaultColorIdForOrigin(bcfOrigin));
    }
  }, [bcfColorsAvailable, bcfColor, bcfOrigin]);

  const selectOrigin = useCallback(
    (nextOrigin: BcfOriginId) => {
      setBcfOrigin(nextOrigin);
      const allowed = bcfTexturesForOrigin(nextOrigin);
      const nextTexture = allowed.includes(texture) ? texture : (allowed[0] as BcfPdpTexture);
      setTexture(nextTexture);
      if (nextOrigin !== 'RUSSIAN' && BCF_RUSSIAN_ONLY_COLOR_IDS.has(bcfColor)) {
        setBcfColor(bcfDefaultColorIdForOrigin(nextOrigin));
      }
    },
    [bcfColor, texture],
  );

  const selectTexture = useCallback(
    (nextTexture: BcfPdpTexture) => {
      if (!allowedBcfTextures.includes(nextTexture)) return;
      setTexture(nextTexture);
    },
    [allowedBcfTextures],
  );

  const selectColor = useCallback(
    (colorId: string) => {
      const defaultId = bcfDefaultColorIdForOrigin(bcfOrigin);
      if (colorId !== defaultId && !isPremiumMember) {
        setShowPremiumGate(true);
        return;
      }
      setBcfColor(colorId);
      if (BCF_RUSSIAN_ONLY_COLOR_IDS.has(colorId)) {
        setBcfOrigin('RUSSIAN');
      }
    },
    [bcfOrigin, isPremiumMember],
  );

  const toggleLaceTreatment = useCallback(
    (id: string) => {
      const opt = BCF_LACE_TREATMENT_OPTIONS.find((o) => o.id === id);
      if (!opt) return;
      if (opt.premium && !isPremiumMember) {
        setShowPremiumGate(true);
        return;
      }
      setBcfLaceTreatment((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      );
    },
    [isPremiumMember],
  );

  const switchCategory = useCallback((next: BcfPdpCategory) => {
    setCategory(next);
    setBcfLaceTreatment([]);
    setAddToBagState('idle');
  }, []);

  const addToBag = useCallback(() => {
    if (soldOut) return;
    setAddToBagState('adding');
    window.setTimeout(() => {
      try {
        const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
        const currentCount = parseInt(localStorage.getItem('cartCount') || '0', 10);
        const newItem = {
          id: `shop-${texture}-${category}-${Date.now()}`,
          name: cartLineName,
          price: displayPrice,
          quantity: 1,
          image: cartThumbSrc,
          type: 'shop-texture-category',
          texture,
          category,
          hairOrigin: bcfOrigin,
          length: bcfLength,
          color: bcfColor,
          ...(category === 'bundles'
            ? {}
            : {
                lace: bcfLace,
                ...(bcfLaceTreatment.length ? { laceTreatment: bcfLaceTreatment } : {}),
              }),
        };
        const updated = [newItem, ...cartItems];
        localStorage.setItem('cartItems', JSON.stringify(updated));
        const newCartCount = currentCount + 1;
        localStorage.setItem('cartCount', String(newCartCount));
        window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: newCartCount }));
        window.dispatchEvent(new Event('cartUpdated'));
        setAddToBagState('added');
        window.setTimeout(() => setAddToBagState('idle'), 2000);
      } catch {
        setAddToBagState('idle');
      }
    }, 500);
  }, [
    bcfColor,
    bcfLace,
    bcfLaceTreatment,
    bcfLength,
    bcfOrigin,
    cartLineName,
    cartThumbSrc,
    category,
    displayPrice,
    soldOut,
    texture,
  ]);

  return {
    category,
    texture,
    textureOrder: TEXTURE_ORDER,
    bcfOrigin,
    bcfLength,
    bcfColor,
    bcfLace,
    bcfLaceTreatment,
    bcfColorsAvailable,
    allowedBcfTextures,
    bcfLaceOptions,
    displayPrice,
    heroPhotoSrc,
    soldOut,
    addToBagState,
    showPremiumGate,
    setShowPremiumGate,
    switchCategory,
    selectOrigin,
    selectTexture,
    selectColor,
    setBcfLength,
    setBcfLace,
    toggleLaceTreatment,
    addToBag,
  };
}
