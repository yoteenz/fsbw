import type { CSSProperties, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { hideDuplicateBrickForNoirWigViews } from '../../utils/bawNoirLiveWigViewDisplay';
import {
  isNoirNaturalFrontMannequinSrc,
  isNoirNaturalLeftMannequinSrc,
  isNoirNaturalRightMannequinSrc,
  NOIR_NATURAL_FRONT_MANNEQUIN_DISPLAY_SCALE,
  scaleNoirFrontMannequinDisplayPx,
} from '../../utils/bawStaticMannequinReferencePaths';

const BAW_PRODUCT_HUB_UNITS = [
  'noir',
  'blanco',
  'soft-wave',
  'beach-wave',
  'soft-curl',
  'ocean-curl',
] as const;

/**
 * Main BAW product hub routes — thumbnails use **outer** `.leaf-bg` (Readdy art) **plus** the static mannequin `<img>`
 * (`/assets/` naturals) so the figure stays visible even if `.leaf-bg` stacks incorrectly. Inner CSS brick stays off on hub.
 * Includes **`/build-a-wig/noir/customize`** and **`.../edit`** hub landing pages (not **`.../customize/color`** etc.).
 * Sub-routes: inner brick + `<img>`, no `.leaf-bg` (reverse).
 */
function isBawProductHubThumbPathname(pathname: string): boolean {
  const p = pathname.replace(/\/$/, '') || '/';
  if (p === '/build-a-wig') return true;
  for (const u of BAW_PRODUCT_HUB_UNITS) {
    const base = `/build-a-wig/${u}`;
    if (p === base || p === `${base}/customize` || p === `${base}/edit`) return true;
  }
  return false;
}

/** Live NOIR hero + thumb mannequins align with **static** hub framing (same CSS brick cell). */
const BAW_NOIR_HERO_FRAME_W = 282;
const BAW_NOIR_HERO_FRAME_H = 387;
/** Static leaf-brick hero cell (mannequin clip must match — see `.baw-noir-hero-brick-frame`). */
const BAW_NOIR_STATIC_HERO_BRICK_W = 262;
const BAW_NOIR_STATIC_HERO_BRICK_H = 367;
const BAW_NOIR_THUMB_MANNEQUIN_W = 72;
const BAW_NOIR_THUMB_MANNEQUIN_H = 95;

type Props = {
  wigViews: [string, string, string] | string[];
  selectedView: number;
  onSelectView: (index: number) => void;
  /** Optional content above the hero image (e.g. product title). */
  heroChildren?: ReactNode;
  /** Optional content rendered between the hero and the thumbnails. */
  belowHeroChildren?: ReactNode;
  /** Extra classes on the thumbnail row (e.g. hub uses flex center on inner thumb boxes). */
  thumbRowClassName?: string;
  /**
   * Use **12px** thumb gap + no per-frame nudges (same as NOIR customize sub-pages with live WebPs).
   * BAW **product hub** also gets this via pathname (`isBawProductHubThumbPathname`); pass explicitly only if a page needs hub spacing outside those routes.
   */
  thumbSpacingLikeSubLive?: boolean;
};

/**
 * Hero + three thumbnails for BAW hub + sub-pages.
 * - Shipped **`/assets/`** naturals: one brick layer (`leaf-brick-resize` + optional `.leaf-bg`).
 * - **Live** previews (anything not shipped `/assets/`): **no** extra brick — raster already has brick.
 * Live NOIR sub-pages: **12px** thumb gap, **72×95** thumb frames (same height as hub static thumbs), **`hero-mannequin-img--live-noir`** / **`thumbnail-mannequin-img--live-noir`** (see `index.css`).
 * BAW **product hub** static thumbs use the **same 12px** gap (and no per-frame translate nudge) so spacing matches customize sub-pages with live previews; deeper sub-pages with **static** `/assets/` naturals keep **2px** gap + **p-1** + nudges.
 */
export function BawNoirWigPreviewHeroThumbs({
  wigViews,
  selectedView,
  onSelectView,
  heroChildren,
  belowHeroChildren,
  thumbRowClassName,
  thumbSpacingLikeSubLive: thumbSpacingLikeSubLiveProp,
}: Props) {
  const { pathname } = useLocation();
  const triple = wigViews as string[];
  const hideBrick = hideDuplicateBrickForNoirWigViews(triple);
  const hubThumbsOnlyOuter = isBawProductHubThumbPathname(pathname);
  /** Hub static row: match **12px** gap used on NOIR customize sub-pages with live WebPs (not 2px + nudges used for static-only sub-pages). */
  const hubStaticThumbSpacingLikeSubLive =
    Boolean(thumbSpacingLikeSubLiveProp) || (hubThumbsOnlyOuter && !hideBrick);
  /** Hub + static: outer `.leaf-bg` + mannequin `<img>`. Sub-pages: inner brick + `<img>`, no `.leaf-bg`. */
  const thumbOuterLeafBg = !hideBrick && hubThumbsOnlyOuter;
  /** Sub-page + static: white/black selection ring on `.baw-noir-thumb-frame` (was on `.leaf-bg`). */
  const subPageStaticSelectionOnFrame = !hideBrick && !hubThumbsOnlyOuter;

  const heroSrc = triple[selectedView] ?? '';
  const heroFrontScaled = isNoirNaturalFrontMannequinSrc(heroSrc);
  const heroLrNudge =
    isNoirNaturalLeftMannequinSrc(heroSrc) || isNoirNaturalRightMannequinSrc(heroSrc);
  const heroW = heroFrontScaled
    ? scaleNoirFrontMannequinDisplayPx(BAW_NOIR_HERO_FRAME_W)
    : BAW_NOIR_HERO_FRAME_W;
  const heroH = heroFrontScaled
    ? scaleNoirFrontMannequinDisplayPx(BAW_NOIR_HERO_FRAME_H)
    : BAW_NOIR_HERO_FRAME_H;

  return (
    <>
      <div className="leaf-stack hero-thumb">
        {!hideBrick && <div className="leaf-bg" aria-hidden="true" />}
        {heroChildren ? <div className="baw-noir-hero-header-overlay">{heroChildren}</div> : null}
        <div
          className={`baw-noir-hero-brick-frame${hideBrick ? ' baw-noir-hero-brick-frame--live' : ''}`}
          style={{
            width: hideBrick ? `${BAW_NOIR_HERO_FRAME_W}px` : `${BAW_NOIR_STATIC_HERO_BRICK_W}px`,
            height: hideBrick ? `${BAW_NOIR_HERO_FRAME_H}px` : `${BAW_NOIR_STATIC_HERO_BRICK_H}px`,
          }}
        >
          {!hideBrick && <div className="baw-noir-hero-brick-bg" aria-hidden="true" />}
          <div className="baw-noir-hero-mannequin-slot">
            {hideBrick ? (
              <img
                src={triple[selectedView]}
                alt="Selected Wig"
                width={BAW_NOIR_HERO_FRAME_W}
                height={BAW_NOIR_HERO_FRAME_H}
                className="hero-mannequin-img hero-mannequin-img--live-noir baw-noir-hero-mannequin--live-centered"
                style={
                  {
                    '--hero-width': `${heroW}px`,
                    '--hero-height': `${heroH}px`,
                  } as CSSProperties
                }
              />
            ) : (
              <img
                src={triple[selectedView]}
                alt="Selected Wig"
                width={BAW_NOIR_STATIC_HERO_BRICK_W}
                height={BAW_NOIR_STATIC_HERO_BRICK_H}
                className={`hero-mannequin-img baw-noir-hero-mannequin--brick-aligned${
                  heroFrontScaled ? ' baw-noir-hero-mannequin--front-scaled' : ''
                }${heroLrNudge ? ' baw-noir-hero-mannequin--lr-nudge' : ''}`}
                style={
                  {
                    ...(heroFrontScaled
                      ? {
                          '--baw-noir-front-mannequin-scale': `${NOIR_NATURAL_FRONT_MANNEQUIN_DISPLAY_SCALE}`,
                        }
                      : {}),
                  } as CSSProperties
                }
              />
            )}
          </div>
        </div>
      </div>

      {belowHeroChildren}

      <div
        className={`flex justify-center mb-3 mt-2 baw-noir-thumb-row${hideBrick ? ' baw-noir-thumb-row--live-noir' : ''}${
          thumbRowClassName ? ` ${thumbRowClassName}` : ''
        }`}
        style={{
          transform: 'translateY(10px)',
          gap: hideBrick || hubStaticThumbSpacingLikeSubLive ? '12px' : '2px',
          ...(hideBrick || hubStaticThumbSpacingLikeSubLive ? { columnGap: '12px', rowGap: '12px' } : {}),
        }}
      >
        {triple.map((view, index) => {
          const thumbFrontScaled = isNoirNaturalFrontMannequinSrc(view);
          const thumbLrNudge =
            isNoirNaturalLeftMannequinSrc(view) || isNoirNaturalRightMannequinSrc(view);

          return (
          <div className="leaf-stack thumb" key={index}>
            {thumbOuterLeafBg && (
              <div
                className={`leaf-bg ${selectedView === index ? 'border-black' : 'border-transparent'}`}
                aria-hidden="true"
              />
            )}
            <div
              className={`border-transparent cursor-pointer ${
                hideBrick ? 'p-0' : hubThumbsOnlyOuter ? 'p-0' : 'p-1'
              }`}
              onClick={() => onSelectView(index)}
            >
              <div
                className={`baw-noir-thumb-brick-frame baw-noir-thumb-frame${
                  subPageStaticSelectionOnFrame && !hideBrick ? ' baw-noir-thumb-frame--static-sub' : ''
                }${hideBrick ? ' baw-noir-thumb-brick-frame--live baw-noir-thumb-frame--live-noir' : ''}${
                  hubThumbsOnlyOuter && !hideBrick ? ' baw-noir-thumb-brick-frame--hub' : ''
                }`}
                data-baw-thumb-index={index}
                style={{
                  width: `${BAW_NOIR_THUMB_MANNEQUIN_W}px`,
                  height: `${BAW_NOIR_THUMB_MANNEQUIN_H}px`,
                  ...(hideBrick
                    ? {
                        border: selectedView === index ? '3px solid #fff' : undefined,
                        boxShadow: selectedView === index ? '0 0 0 1.1px #000' : undefined,
                        boxSizing: 'border-box',
                      }
                    : {
                        border: subPageStaticSelectionOnFrame && selectedView === index ? '3px solid #fff' : undefined,
                        boxShadow:
                          subPageStaticSelectionOnFrame && selectedView === index
                            ? '0 0 0 1.1px #000'
                            : undefined,
                        boxSizing: 'border-box',
                      }),
                  ...(!hideBrick &&
                    !hubStaticThumbSpacingLikeSubLive &&
                    index === 1 && { transform: 'translateX(-2px)' }),
                  ...(!hideBrick &&
                    !hubStaticThumbSpacingLikeSubLive &&
                    index === 2 && { transform: 'translateX(-4px)' }),
                }}
              >
                {!hideBrick && !hubThumbsOnlyOuter && (
                  <div className="baw-noir-thumb-brick-bg" aria-hidden="true" />
                )}
                <div className="baw-noir-thumb-mannequin-slot">
                  <img
                    alt={`Thumbnail ${index + 1}`}
                    width={BAW_NOIR_THUMB_MANNEQUIN_W}
                    height={BAW_NOIR_THUMB_MANNEQUIN_H}
                    src={view}
                    className={
                      hideBrick
                        ? 'thumbnail-mannequin-img thumbnail-mannequin-img--live-noir baw-noir-thumb-mannequin--live-centered'
                        : `thumbnail-mannequin-img baw-noir-thumb-static-img baw-noir-thumb-mannequin--brick-aligned${
                            hubThumbsOnlyOuter ? ' baw-noir-thumb-static-img--hub' : ''
                          }${thumbFrontScaled ? ' baw-noir-front-mannequin--scaled' : ''}${
                            thumbLrNudge ? ' baw-noir-thumb-lr-nudge' : ''
                          }`
                    }
                    style={
                      hideBrick
                        ? undefined
                        : ({
                            ...(thumbFrontScaled
                              ? {
                                  '--baw-noir-front-mannequin-scale': `${NOIR_NATURAL_FRONT_MANNEQUIN_DISPLAY_SCALE}`,
                                }
                              : {}),
                          } as CSSProperties)
                    }
                  />
                </div>
              </div>
            </div>
          </div>
          );
        })}
      </div>
    </>
  );
}
