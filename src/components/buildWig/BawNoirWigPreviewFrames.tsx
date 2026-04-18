import type { CSSProperties, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { hideDuplicateBrickForNoirWigViews } from '../../utils/bawNoirLiveWigViewDisplay';

/**
 * Main BAW product hub routes only — thumbnails show **outer** `.leaf-bg` only (no inner brick bg + no mannequin `<img>`).
 * Sub-routes keep inner brick + `<img>` and drop `.leaf-bg` (reverse).
 */
function isBawProductHubThumbPathname(pathname: string): boolean {
  const p = pathname.replace(/\/$/, '') || '/';
  if (p === '/build-a-wig') return true;
  return (
    p === '/build-a-wig/noir' ||
    p === '/build-a-wig/blanco' ||
    p === '/build-a-wig/soft-wave' ||
    p === '/build-a-wig/beach-wave' ||
    p === '/build-a-wig/soft-curl' ||
    p === '/build-a-wig/ocean-curl'
  );
}

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
};

/** +15% vs base (72×95 static frame, 72×82 live frame, static img 63×84). */
const BAW_NOIR_THUMB_SCALE = 1.15;
const THUMB_FRAME_W = `${Math.round(72 * BAW_NOIR_THUMB_SCALE)}px`;
const THUMB_FRAME_H_STATIC = `${Math.round(95 * BAW_NOIR_THUMB_SCALE)}px`;
const THUMB_FRAME_H_LIVE = `${Math.round(82 * BAW_NOIR_THUMB_SCALE)}px`;
const THUMB_IMG_STATIC_W = Math.round(63 * BAW_NOIR_THUMB_SCALE);
const THUMB_IMG_STATIC_H = Math.round(84 * BAW_NOIR_THUMB_SCALE);
const THUMB_IMG_LIVE_W = Math.round(72 * BAW_NOIR_THUMB_SCALE);
const THUMB_IMG_LIVE_H = Math.round(82 * BAW_NOIR_THUMB_SCALE);
const THUMB_ROW_GAP_LIVE = `${Math.round(12 * BAW_NOIR_THUMB_SCALE)}px`;

/**
 * Hero + three thumbnails for BAW hub + sub-pages.
 * - Shipped **`/assets/`** naturals: one brick layer (`leaf-brick-resize` + optional `.leaf-bg`).
 * - **Live** previews (anything not shipped `/assets/`): **no** extra brick — raster already has brick.
 * Thumb sizes scaled together (`BAW_NOIR_THUMB_SCALE`); **`hero-mannequin-img--live-noir`** / **`thumbnail-mannequin-img--live-noir`** (see `index.css`).
 */
export function BawNoirWigPreviewHeroThumbs({
  wigViews,
  selectedView,
  onSelectView,
  heroChildren,
  belowHeroChildren,
  thumbRowClassName,
}: Props) {
  const { pathname } = useLocation();
  const triple = wigViews as string[];
  const hideBrick = hideDuplicateBrickForNoirWigViews(triple);
  const hubThumbsOnlyOuter = isBawProductHubThumbPathname(pathname);
  /** Hub + static mannequin: outer `.leaf-bg` (Readdy) only — no inner brick `<img>`. Sub-pages: inner brick + `<img>`, no `.leaf-bg`. */
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
            width: '262px',
            height: '367px',
            overflow: 'visible',
            ...(hideBrick
              ? {
                  backgroundImage: 'none',
                  backgroundColor: '#f5f5f5',
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
                width={262}
                height={367}
                className="absolute z-10 hero-mannequin-img hero-mannequin-img--live-noir"
                style={
                  {
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    '--hero-width': '262px',
                    '--hero-height': '367px',
                  } as CSSProperties
                }
              />
            </div>
          ) : (
            <img
              src={triple[selectedView]}
              alt="Selected Wig"
              width={282}
              height={387}
              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hero-mannequin-img"
              style={
                {
                  top: 'calc(50% - 10.601px + 18px)',
                  '--hero-width': '282px',
                  '--hero-height': '387px',
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
          gap: hideBrick ? THUMB_ROW_GAP_LIVE : '2px',
          ...(hideBrick ? { columnGap: THUMB_ROW_GAP_LIVE, rowGap: THUMB_ROW_GAP_LIVE } : {}),
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
              className={`border-transparent cursor-pointer ${hideBrick ? 'p-0' : 'p-1'}`}
              onClick={() => onSelectView(index)}
            >
              <div
                className={`relative bg-cover bg-center flex items-center justify-center baw-noir-thumb-frame${
                  subPageStaticSelectionOnFrame && !hideBrick ? ' baw-noir-thumb-frame--static-sub' : ''
                }`}
                data-baw-thumb-index={index}
                style={{
                  width: THUMB_FRAME_W,
                  height: hideBrick ? THUMB_FRAME_H_LIVE : THUMB_FRAME_H_STATIC,
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
                          /* Same brick as static hero: fills `contain` letterbox gutters so gaps aren’t flat gray */
                          backgroundImage: `url('/assets/leaf-brick-resize.png')`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
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
                  ...(!hideBrick && index === 1 && { transform: 'translateX(-2px)' }),
                  ...(!hideBrick && index === 2 && { transform: 'translateX(-4px)' }),
                }}
              >
                {!hubThumbsOnlyOuter && (
                  <img
                    alt={`Thumbnail ${index + 1}`}
                    width={hideBrick ? THUMB_IMG_LIVE_W : THUMB_IMG_STATIC_W}
                    height={hideBrick ? THUMB_IMG_LIVE_H : THUMB_IMG_STATIC_H}
                    src={view}
                    className={
                      hideBrick
                        ? 'absolute z-10 thumbnail-mannequin-img thumbnail-mannequin-img--live-noir'
                        : 'absolute left-1/2 -translate-x-1/2 -translate-y-1/2 thumbnail-mannequin-img'
                    }
                    style={
                      hideBrick
                        ? ({
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                          } as CSSProperties)
                        : ({
                            '--thumb-top': 'calc(50% - 6.1px + 7.2px)',
                            top: 'calc(50% - 6.1px + 7.2px)',
                            ...(index === 0 && { left: 'calc(50% - 6px)' }),
                          } as CSSProperties)
                    }
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
