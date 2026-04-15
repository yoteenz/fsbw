import type { CSSProperties, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { hideDuplicateBrickForNoirWigViews } from '../../utils/bawNoirLiveWigViewDisplay';

/** Set `false` to remove colored debug outlines on NOIR thumb layers (leaf-stack / leaf-bg / frame / img). */
const DEBUG_NOIR_THUMB_LAYER_OUTLINES = true;

/** One color per thumbnail index (0–2) for the outer `leaf-stack.thumb` cell. */
const DEBUG_THUMB_STACK_OUTLINE: readonly [string, string, string] = ['#e11d48', '#16a34a', '#2563eb'];

/**
 * Main BAW product hubs only — show **outer cell** debug outlines, not violet/cyan on frame/img.
 * Sub-routes (`…/customize/length`, `…/edit/color`, etc.) get the **reverse** (violet + cyan only).
 */
function isBawMainHubPathnameForThumbDebug(pathname: string): boolean {
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

/**
 * Hero + three thumbnails for BAW hub + sub-pages.
 * - Shipped **`/assets/`** naturals: one brick layer (`leaf-brick-resize` + optional `.leaf-bg`).
 * - **Live** previews (anything not shipped `/assets/`): **no** extra brick — raster already has brick.
 * Matches **`d902e65`** layout: `hideBrick` when any angle is live → **12px** thumb gap, **82×72** live thumb frames, **`hero-mannequin-img--live-noir`** / **`thumbnail-mannequin-img--live-noir`** (see `index.css`).
 */
export function BawNoirWigPreviewHeroThumbs({
  wigViews,
  selectedView,
  onSelectView,
  heroChildren,
  belowHeroChildren,
  thumbRowClassName,
}: Props) {
  const { pathname: locationPathname } = useLocation();
  const triple = wigViews as string[];
  const hideBrick = hideDuplicateBrickForNoirWigViews(triple);
  const debug = DEBUG_NOIR_THUMB_LAYER_OUTLINES;
  const debugMainHubOnly = debug && isBawMainHubPathnameForThumbDebug(locationPathname);
  /** Sub-routes: violet frame + cyan `<img>` only (no outer / orange / slate). */
  const debugSubPageInner = debug && !debugMainHubOnly;

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
          gap: hideBrick ? '12px' : '2px',
          ...(hideBrick ? { columnGap: '12px', rowGap: '12px' } : {}),
        }}
      >
        {triple.map((view, index) => (
          <div
            className="leaf-stack thumb"
            key={index}
            title={
              debug
                ? debugMainHubOnly
                  ? `DEBUG thumb ${index} (hub): outer cell only — orange = .leaf-bg; slate = click wrap`
                  : `DEBUG thumb ${index} (sub): violet = frame; cyan = <img> — no outer cell`
                : undefined
            }
            style={
              debug && debugMainHubOnly
                ? {
                    outline: `3px solid ${DEBUG_THUMB_STACK_OUTLINE[index]}`,
                    outlineOffset: '0px',
                  }
                : undefined
            }
          >
            {!hideBrick && (
              <div
                className={`leaf-bg ${selectedView === index ? 'border-black' : 'border-transparent'}`}
                aria-hidden="true"
                style={
                  debugMainHubOnly ? { outline: '2px dashed #f97316', outlineOffset: '0px' } : undefined
                }
              />
            )}
            <div
              className={`border-transparent cursor-pointer ${hideBrick ? 'p-0' : 'p-1'}`}
              onClick={() => onSelectView(index)}
              style={
                debugMainHubOnly ? { outline: '2px dotted #64748b', outlineOffset: '0px' } : undefined
              }
            >
              <div
                className="relative bg-cover bg-center flex items-center justify-center baw-noir-thumb-frame"
                data-baw-thumb-index={index}
                style={{
                  width: '72px',
                  height: hideBrick ? '82px' : '95px',
                  position: 'relative',
                  zIndex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...(hideBrick
                    ? {
                        overflow: 'hidden',
                        backgroundImage: 'none',
                        backgroundColor: '#f5f5f5',
                        border: selectedView === index ? '3px solid #fff' : undefined,
                        boxShadow: selectedView === index ? '0 0 0 1.1px #000' : undefined,
                        boxSizing: 'border-box',
                      }
                    : {
                        backgroundImage: `url('/assets/leaf-brick-resize.png')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                      }),
                  ...(!hideBrick && index === 1 && { transform: 'translateX(-2px)' }),
                  ...(!hideBrick && index === 2 && { transform: 'translateX(-4px)' }),
                  ...(debugSubPageInner ? { outline: '2px solid #a855f7', outlineOffset: '0px' } : {}),
                }}
              >
                <img
                  alt={`Thumbnail ${index + 1}`}
                  width={hideBrick ? 72 : 63}
                  height={hideBrick ? 82 : 84}
                  src={view}
                  title={debug && debugSubPageInner ? `DEBUG: <img> asset thumb ${index}` : undefined}
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
                          ...(debugSubPageInner ? { outline: '2px solid #06b6d4', outlineOffset: '0px' } : {}),
                        } as CSSProperties)
                      : ({
                          '--thumb-top': 'calc(50% - 6.1px + 7.2px)',
                          top: 'calc(50% - 6.1px + 7.2px)',
                          ...(index === 0 && { left: 'calc(50% - 6px)' }),
                          ...(debugSubPageInner ? { outline: '2px solid #06b6d4', outlineOffset: '0px' } : {}),
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
