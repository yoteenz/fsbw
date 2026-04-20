import type { CSSProperties, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { hideDuplicateBrickForNoirWigViews } from '../../utils/bawNoirLiveWigViewDisplay';

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

  return (
    <>
      <div className="leaf-stack hero-thumb">
        {!hideBrick && <div className="leaf-bg" aria-hidden="true" />}
        <div
          className="relative bg-cover bg-center flex items-center justify-center"
          style={{
            width: hideBrick ? `${BAW_NOIR_HERO_FRAME_W}px` : '262px',
            height: hideBrick ? `${BAW_NOIR_HERO_FRAME_H}px` : '367px',
            overflow: 'visible',
            ...(hideBrick
              ? {
                  backgroundImage: 'none',
                  /* Transparent so `contain` on live hero does not show gray letterbox bands */
                  backgroundColor: 'transparent',
                }
              : {
                  backgroundImage: `url('/assets/leaf-brick-resize.png')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'repeat',
                }),
          }}
        >
          {heroChildren}
          {hideBrick ? (
            <div className="absolute left-0 top-0 z-[5] size-full overflow-hidden">
              <img
                src={triple[selectedView]}
                alt="Selected Wig"
                width={BAW_NOIR_HERO_FRAME_W}
                height={BAW_NOIR_HERO_FRAME_H}
                className="absolute z-10 hero-mannequin-img hero-mannequin-img--live-noir"
                style={
                  {
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    '--hero-width': `${BAW_NOIR_HERO_FRAME_W}px`,
                    '--hero-height': `${BAW_NOIR_HERO_FRAME_H}px`,
                  } as CSSProperties
                }
              />
            </div>
          ) : (
            <img
              src={triple[selectedView]}
              alt="Selected Wig"
              width={BAW_NOIR_HERO_FRAME_W}
              height={BAW_NOIR_HERO_FRAME_H}
              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hero-mannequin-img"
              style={
                {
                  top: 'calc(50% - 10.601px + 18px)',
                  '--hero-width': `${BAW_NOIR_HERO_FRAME_W}px`,
                  '--hero-height': `${BAW_NOIR_HERO_FRAME_H}px`,
                } as CSSProperties
              }
            />
          )}
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
        {triple.map((view, index) => (
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
                className={`relative bg-cover bg-center flex items-center justify-center baw-noir-thumb-frame${
                  subPageStaticSelectionOnFrame && !hideBrick ? ' baw-noir-thumb-frame--static-sub' : ''
                }${hideBrick ? ' baw-noir-thumb-frame--live-noir' : ''}`}
                data-baw-thumb-index={index}
                style={{
                  width: `${BAW_NOIR_THUMB_MANNEQUIN_W}px`,
                  height: `${BAW_NOIR_THUMB_MANNEQUIN_H}px`,
                  position: 'relative',
                  zIndex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...(hubThumbsOnlyOuter && !hideBrick
                    ? {
                        overflow: 'hidden',
                        backgroundImage: 'none',
                        /* Transparent so the outer `.leaf-bg` (hub thumb art) is visible — opaque gray hid it */
                        backgroundColor: 'transparent',
                        boxSizing: 'border-box',
                      }
                    : hideBrick
                      ? {
                          overflow: 'hidden',
                          /* Live WebPs already include brick — no second CSS brick; transparent frame avoids white side gutters with `contain` */
                          backgroundImage: 'none',
                          backgroundColor: 'transparent',
                          border: selectedView === index ? '3px solid #fff' : undefined,
                          boxShadow: selectedView === index ? '0 0 0 1.1px #000' : undefined,
                          boxSizing: 'border-box',
                        }
                      : {
                          overflow: 'visible',
                          backgroundImage: `url('/assets/leaf-brick-resize.png')`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                          boxSizing: 'border-box',
                          border: subPageStaticSelectionOnFrame && selectedView === index ? '3px solid #fff' : undefined,
                          boxShadow:
                            subPageStaticSelectionOnFrame && selectedView === index
                              ? '0 0 0 1.1px #000'
                              : undefined,
                        }),
                  ...(!hideBrick &&
                    !hubStaticThumbSpacingLikeSubLive &&
                    index === 1 && { transform: 'translateX(-2px)' }),
                  ...(!hideBrick &&
                    !hubStaticThumbSpacingLikeSubLive &&
                    index === 2 && { transform: 'translateX(-4px)' }),
                }}
              >
                <img
                  alt={`Thumbnail ${index + 1}`}
                  width={hideBrick ? BAW_NOIR_THUMB_MANNEQUIN_W : BAW_NOIR_THUMB_MANNEQUIN_W}
                  height={hideBrick ? BAW_NOIR_THUMB_MANNEQUIN_H : BAW_NOIR_THUMB_MANNEQUIN_H}
                  src={view}
                  className={
                    hideBrick
                      ? 'absolute z-10 thumbnail-mannequin-img thumbnail-mannequin-img--live-noir'
                      : `absolute left-1/2 -translate-x-1/2 thumbnail-mannequin-img baw-noir-thumb-static-img${
                          hubThumbsOnlyOuter ? ' baw-noir-thumb-static-img--hub' : ''
                        }`
                  }
                  style={
                    hideBrick
                      ? ({
                          left: '50%',
                          top: '50%',
                          transform: 'translate(-50%, -50%)',
                        } as CSSProperties)
                      : ({
                          /* Bottom alignment: see `.baw-noir-thumb-static-img` in index.css */
                        } as CSSProperties)
                  }
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
