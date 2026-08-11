import { useCallback, useEffect, useState, type MouseEvent } from 'react';
import type { LoungeContentPack } from '../loungeTvContentPack';
import { resolvePackArtwork } from '../loungeTvArtwork';
import { loungeTvGlassCqw } from '../loungeTvResponsive';
import { LOUNGE_TV_TYPE } from '../loungeTvTypography';
import {
  LOUNGE_TV_BRAND_RED,
  LOUNGE_TV_FONT_BOOK,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_TEXT_GRAY,
  LOUNGE_TV_TEXT_WHITE,
} from '../loungeTvTheme';
import { loungeTvFocusGlowIn, loungeTvFocusGlowOut } from '../loungeTvFocusHandlers';
import { AcrylicSaveBookmarkControl } from '../AcrylicSaveBookmarkControl';
import { isPackSaved, LOUNGE_TV_LIBRARY_UPDATED_EVENT } from '../../../utils/loungeTvLibrary';
import type { ProductEducationGuideEntry } from './productEducationPresentation';
import { resolveProductEducationGuideArtworkPack } from './productEducationPresentation';

function isProductGuideBookmarkTarget(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    Boolean(target.closest('.lounge-tv-product-guide-bookmark'))
  );
}

type ProductEducationGuideCardProps = {
  guide: ProductEducationGuideEntry;
  variant?: 'hero' | 'support' | 'compact';
  onExplore: (guide: ProductEducationGuideEntry) => void;
  onToggleSave?: (pack: LoungeContentPack) => void;
  savePack?: LoungeContentPack;
};

export function ProductEducationGuideCard({
  guide,
  variant = 'support',
  onExplore,
  onToggleSave,
  savePack,
}: ProductEducationGuideCardProps) {
  const artworkPack = resolveProductEducationGuideArtworkPack(guide);
  const poster = artworkPack ? resolvePackArtwork(artworkPack, variant === 'hero' ? 'hero' : 'card') : undefined;
  const [, setRevision] = useState(0);
  const isHero = variant === 'hero';

  useEffect(() => {
    const onLibraryUpdated = () => setRevision((n) => n + 1);
    window.addEventListener(LOUNGE_TV_LIBRARY_UPDATED_EVENT, onLibraryUpdated);
    return () => window.removeEventListener(LOUNGE_TV_LIBRARY_UPDATED_EVENT, onLibraryUpdated);
  }, []);

  const handleActivate = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (isProductGuideBookmarkTarget(e.target)) return;
      onExplore(guide);
    },
    [guide, onExplore],
  );

  return (
    <div
      className={
        isHero
          ? 'lounge-tv-product-guide-card-wrap lounge-tv-product-guide-card-wrap--hero'
          : 'lounge-tv-product-guide-card-wrap'
      }
    >
      <div
        role="button"
        tabIndex={0}
        data-lounge-tv-focusable
        data-lounge-tv-focus-id={`product-guide-${guide.id}`}
        className={
          isHero
            ? 'lounge-tv-product-guide-card lounge-tv-product-guide-card--hero'
            : 'lounge-tv-product-guide-card lounge-tv-product-guide-card--support'
        }
        aria-label={`Explore ${guide.title}`}
        onClick={handleActivate}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onExplore(guide);
          }
        }}
        onFocusCapture={loungeTvFocusGlowIn}
        onBlurCapture={loungeTvFocusGlowOut}
      >
        <span className="lounge-tv-product-guide-card__media" aria-hidden>
          {poster ? (
            <img src={poster} alt="" draggable={false} className="lounge-tv-product-guide-card__image" />
          ) : null}
          <span className="lounge-tv-product-guide-card__scrim" />
        </span>

        <span className="lounge-tv-product-guide-card__copy">
          <span
            style={{
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: isHero ? loungeTvGlassCqw(1.45, 3.2, 5.8) : loungeTvGlassCqw(1.15, 2.5, 4.5),
              lineHeight: 1.12,
              color: LOUNGE_TV_TEXT_WHITE,
              letterSpacing: '0.05em',
            }}
          >
            {guide.title}
          </span>
          <span
            style={{
              marginTop: loungeTvGlassCqw(0.35, 0.8, 1.6),
              fontFamily: LOUNGE_TV_FONT_BOOK,
              fontSize: isHero ? loungeTvGlassCqw(1, 2.2, 4) : loungeTvGlassCqw(0.95, 2, 3.6),
              lineHeight: 1.35,
              color: LOUNGE_TV_TEXT_GRAY,
              whiteSpace: 'normal',
            }}
          >
            {guide.descriptor}
          </span>
          <span
            className="lounge-tv-product-guide-card__cta"
            style={{
              marginTop: loungeTvGlassCqw(0.55, 1.2, 2.4),
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: LOUNGE_TV_TYPE.l4,
              color: LOUNGE_TV_BRAND_RED,
              letterSpacing: '0.05em',
            }}
          >
            EXPLORE {'>'}
          </span>
        </span>
      </div>

      {onToggleSave && savePack ? (
        <AcrylicSaveBookmarkControl
          saved={isPackSaved(savePack.id)}
          glyphSize={loungeTvGlassCqw(1.2, 2.8, 5.6)}
          hitSize={loungeTvGlassCqw(3.2, 7.5, 15)}
          data-lounge-tv-focusable
          className="lounge-tv-product-guide-bookmark"
          onClick={(e) => {
            e.preventDefault();
            onToggleSave(savePack);
          }}
          style={{
            position: 'absolute',
            top: loungeTvGlassCqw(0.65, 1.5, 3),
            right: loungeTvGlassCqw(0.65, 1.5, 3),
            zIndex: 4,
            pointerEvents: 'auto',
          }}
        />
      ) : null}
    </div>
  );
}
