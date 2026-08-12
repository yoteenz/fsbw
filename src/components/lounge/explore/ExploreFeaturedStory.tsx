import { useCallback, useEffect, useState } from 'react';
import type { LoungeContentPack } from '../loungeTvContentPack';
import { contentPackPrimaryRuntimeForCard } from '../loungeTvContentPack';
import { AcrylicSaveBookmarkControl } from '../AcrylicSaveBookmarkControl';
import { loungeTvFocusGlowIn, loungeTvFocusGlowOut } from '../loungeTvFocusHandlers';
import { loungeTvGlassCqw } from '../loungeTvResponsive';
import {
  LOUNGE_TV_BRAND_RED,
  LOUNGE_TV_FONT_BOOK,
  LOUNGE_TV_FONT_DEMI,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_TEXT_GRAY,
  LOUNGE_TV_TEXT_WHITE,
} from '../loungeTvTheme';
import { LOUNGE_TV_TYPE } from '../loungeTvTypography';
import { isPackSaved, LOUNGE_TV_LIBRARY_UPDATED_EVENT } from '../../../utils/loungeTvLibrary';
import type { ExploreFeaturedStoryModel } from './exploreTypes';
import { explorePackImage } from './ExploreCardShell';

type ExploreFeaturedStoryProps = {
  story: ExploreFeaturedStoryModel;
  onWatch: (pack: LoungeContentPack) => void;
  onToggleSave?: (pack: LoungeContentPack) => void;
};

export function ExploreFeaturedStory({ story, onWatch, onToggleSave }: ExploreFeaturedStoryProps) {
  const { pack, eyebrow, headline, subheadline, description, runtimeLabel } = story;
  const [, setRevision] = useState(0);
  const saved = isPackSaved(pack.id);
  const runtime = runtimeLabel ?? contentPackPrimaryRuntimeForCard(pack) ?? undefined;
  const heroImage = explorePackImage(pack, 'hero');

  useEffect(() => {
    const onLibraryUpdated = () => setRevision((n) => n + 1);
    window.addEventListener(LOUNGE_TV_LIBRARY_UPDATED_EVENT, onLibraryUpdated);
    return () => window.removeEventListener(LOUNGE_TV_LIBRARY_UPDATED_EVENT, onLibraryUpdated);
  }, []);

  const watch = useCallback(() => onWatch(pack), [onWatch, pack]);

  return (
    <section className="lounge-tv-explore-featured" aria-label="Featured story">
      <div className="lounge-tv-explore-featured__grid">
        <div className="lounge-tv-explore-featured__copy">
          <p
            className="lounge-tv-explore-featured__eyebrow"
            style={{
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: LOUNGE_TV_TYPE.l4,
              color: LOUNGE_TV_BRAND_RED,
              letterSpacing: '0.1em',
              margin: 0,
            }}
          >
            {eyebrow}
          </p>
          <h2
            className="lounge-tv-explore-featured__headline"
            style={{
              fontFamily: LOUNGE_TV_FONT_DEMI,
              fontSize: LOUNGE_TV_TYPE.l1,
              color: LOUNGE_TV_TEXT_WHITE,
              letterSpacing: '0.05em',
              margin: `${loungeTvGlassCqw(0.35, 0.8, 1.6)} 0 0`,
              lineHeight: 1.05,
            }}
          >
            {headline}
          </h2>
          {subheadline ? (
            <p
              className="lounge-tv-explore-featured__subhead"
              style={{
                fontFamily: LOUNGE_TV_FONT_DEMI,
                fontSize: LOUNGE_TV_TYPE.l2,
                color: LOUNGE_TV_TEXT_WHITE,
                letterSpacing: '0.06em',
                margin: `${loungeTvGlassCqw(0.25, 0.55, 1.1)} 0 0`,
              }}
            >
              {subheadline}
            </p>
          ) : null}
          {description ? (
            <p
              className="lounge-tv-explore-featured__description"
              style={{
                fontFamily: LOUNGE_TV_FONT_BOOK,
                fontSize: LOUNGE_TV_TYPE.l3,
                color: 'rgba(255,255,255,0.82)',
                letterSpacing: '0.02em',
                margin: `${loungeTvGlassCqw(0.45, 1, 2)} 0 0`,
                lineHeight: 1.45,
                maxWidth: '36ch',
              }}
            >
              {description}
            </p>
          ) : null}
          <div className="lounge-tv-explore-featured__actions">
            <button
              type="button"
              className="lounge-tv-explore-featured__watch"
              data-lounge-tv-focusable
              data-lounge-tv-focus-id="explore-featured-watch"
              onClick={watch}
              onFocusCapture={loungeTvFocusGlowIn}
              onBlurCapture={loungeTvFocusGlowOut}
              style={{
                fontFamily: LOUNGE_TV_FONT_MEDIUM,
                fontSize: LOUNGE_TV_TYPE.l3,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              ▶ WATCH NOW
            </button>
            {runtime ? (
              <span
                className="lounge-tv-explore-featured__runtime"
                style={{
                  fontFamily: LOUNGE_TV_FONT_MEDIUM,
                  fontSize: LOUNGE_TV_TYPE.l4,
                  color: LOUNGE_TV_TEXT_GRAY,
                  letterSpacing: '0.06em',
                }}
              >
                {runtime}
              </span>
            ) : null}
          </div>
        </div>
        <div className="lounge-tv-explore-featured__visual">
          <button
            type="button"
            className="lounge-tv-explore-featured__visual-hit"
            data-lounge-tv-focusable
            data-lounge-tv-focus-id="explore-featured-visual"
            aria-label={`Watch ${headline}`}
            onClick={watch}
            onFocusCapture={loungeTvFocusGlowIn}
            onBlurCapture={loungeTvFocusGlowOut}
          >
            <img src={heroImage} alt="" className="lounge-tv-explore-featured__image" loading="eager" decoding="async" />
            <span className="lounge-tv-explore-featured__visual-veil" aria-hidden />
          </button>
          {onToggleSave ? (
            <AcrylicSaveBookmarkControl
              saved={saved}
              glyphSize="13px"
              hitSize={loungeTvGlassCqw(3.5, 8, 16)}
              data-lounge-tv-focusable
              className="lounge-tv-explore-featured__bookmark"
              onClick={(e) => {
                e.preventDefault();
                onToggleSave(pack);
              }}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
