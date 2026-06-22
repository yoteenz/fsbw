import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../ConfirmationModal';
import { BcfProductSelectionFields } from '../shop/BcfProductSelectionFields';
import { useBcfShopSelection } from '../../hooks/useBcfShopSelection';
import {
  EXTENSIONS_BOUTIQUE_SHOP_TABS,
  EXTENSIONS_BOUTIQUE_TAB_LABELS,
  type ExtensionsBoutiqueShopTab,
} from '../../constants/desktopExtensionsBoutique';
import { prepareMembershipUpgradeNavigation } from '../../utils/premiumMemberAccess';
import type { BcfPdpCategory } from '../../utils/bcfPdpHeroAssets';
import './extensionsBoutique.css';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const TAB_TO_CATEGORY: Record<ExtensionsBoutiqueShopTab, BcfPdpCategory> = {
  bundles: 'bundles',
  frontals: 'frontals',
  closures: 'closures',
};

function formatUsd(price: number): string {
  return `$${price.toLocaleString('en-US')}`;
}

export function ExtensionsBoutiqueShopPanel({ isOpen, onClose }: Props) {
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [heroChanging, setHeroChanging] = useState(false);

  const selection = useBcfShopSelection('bundles');
  const {
    category,
    texture,
    textureOrder,
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
  } = selection;

  const activeTab = EXTENSIONS_BOUTIQUE_SHOP_TABS.find((t) => TAB_TO_CATEGORY[t] === category) ?? 'bundles';

  const handleTabChange = useCallback(
    (tab: ExtensionsBoutiqueShopTab) => {
      setHeroChanging(true);
      switchCategory(TAB_TO_CATEGORY[tab]);
      window.setTimeout(() => setHeroChanging(false), 320);
    },
    [switchCategory],
  );

  useEffect(() => {
    if (!isOpen) return undefined;
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="extensions-boutique-overlay" role="presentation">
      <button
        type="button"
        className="extensions-boutique-overlay__backdrop"
        aria-label="Close shop panel"
        onClick={onClose}
      />

      <div
        ref={panelRef}
        className="extensions-boutique-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Extensions boutique shop display"
      >
        <header className="extensions-boutique-panel__header">
          <div className="extensions-boutique-panel__tabs" role="tablist" aria-label="Product categories">
            {EXTENSIONS_BOUTIQUE_SHOP_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                className={`extensions-boutique-panel__tab${
                  activeTab === tab ? ' extensions-boutique-panel__tab--active' : ''
                }`}
                onClick={() => handleTabChange(tab)}
              >
                {EXTENSIONS_BOUTIQUE_TAB_LABELS[tab]}
              </button>
            ))}
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="extensions-boutique-panel__close"
            aria-label="Close shop panel"
            onClick={onClose}
          >
            <span aria-hidden>×</span>
          </button>
        </header>

        <div className="extensions-boutique-panel__body">
          <div className="extensions-boutique-panel__image-col">
            <img
              key={`${category}-${texture}-${bcfColor}`}
              src={heroPhotoSrc}
              alt=""
              className={`extensions-boutique-panel__hero${
                heroChanging ? ' extensions-boutique-panel__hero--changing' : ''
              }`}
              draggable={false}
            />
          </div>

          <div className="extensions-boutique-panel__options-col">
            <div className="extensions-boutique-panel__options-scroll">
              <p className="extensions-boutique-panel__price">{formatUsd(displayPrice)}</p>
              <p className="extensions-boutique-panel__price-note">(excluding sales tax)</p>

              <BcfProductSelectionFields
                compact
                category={category}
                texture={texture}
                textureOrder={textureOrder}
                bcfOrigin={bcfOrigin}
                bcfLength={bcfLength}
                bcfColor={bcfColor}
                bcfLace={bcfLace}
                bcfLaceTreatment={bcfLaceTreatment}
                bcfColorsAvailable={bcfColorsAvailable}
                allowedBcfTextures={allowedBcfTextures}
                bcfLaceOptions={bcfLaceOptions}
                onSelectOrigin={selectOrigin}
                onSelectTexture={selectTexture}
                onSelectColor={selectColor}
                onSelectLength={setBcfLength}
                onSelectLace={setBcfLace}
                onToggleLaceTreatment={toggleLaceTreatment}
              />
            </div>

            <button
              type="button"
              className="extensions-boutique-panel__add"
              onClick={addToBag}
              disabled={soldOut || addToBagState === 'adding'}
            >
              {soldOut && 'SOLD OUT'}
              {!soldOut && addToBagState === 'idle' && 'ADD TO BAG'}
              {!soldOut && addToBagState === 'adding' && 'ADDING...'}
              {!soldOut && addToBagState === 'added' && 'IN THE BAG'}
            </button>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showPremiumGate}
        onClose={() => setShowPremiumGate(false)}
        onConfirm={() => {
          setShowPremiumGate(false);
          prepareMembershipUpgradeNavigation();
          navigate('/account/rewards');
        }}
        title="UPGRADE YOUR SUBSCRIPTION"
        message="THIS OPTION IS AVAILABLE TO PREMIUM MEMBERS ONLY."
        confirmText="UPGRADE"
        cancelText="CANCEL"
        dataAttribute="extensions-boutique-premium-modal"
      />
    </div>
  );
}
