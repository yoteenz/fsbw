import type { CSSProperties, ReactNode } from 'react';
import { hideDuplicateBrickForNoirWigViews } from '../../utils/bawNoirLiveWigViewDisplay';

type Props = {
  wigViews: [string, string, string] | string[];
  selectedView: number;
  onSelectView: (index: number) => void;
  /** When true (e.g. `/build-a-wig/noir/...`), apply live-WebP framing. */
  isNoirRoute: boolean;
  /** Optional content above the hero image (e.g. product title). */
  heroChildren?: ReactNode;
  /** Extra classes on the thumbnail row (e.g. hub uses flex center on inner thumb boxes). */
  thumbRowClassName?: string;
};

/**
 * Hero + three thumbnails for BAW sub-pages. When `wigViews` are remote fal WebPs on a NOIR route,
 * drop the extra brick layer and use cover framing so the scene matches the WebP (no double brick).
 */
export function BawNoirWigPreviewHeroThumbs({
  wigViews,
  selectedView,
  onSelectView,
  isNoirRoute,
  heroChildren,
  thumbRowClassName,
}: Props) {
  const triple = wigViews as string[];
  const hideBrick = isNoirRoute && hideDuplicateBrickForNoirWigViews(triple);

  return (
    <>
      <div className="leaf-stack hero-thumb">
        {!hideBrick && <div className="leaf-bg" aria-hidden="true" />}
        <div
          className="relative bg-cover bg-center flex items-center justify-center"
          style={{
            width: '262px',
            height: '367px',
            ...(hideBrick
              ? {
                  backgroundImage: 'none',
                  backgroundColor: '#f5f5f5',
                  overflow: 'hidden',
                }
              : {
                  backgroundImage: `url('/assets/leaf-brick-resize.png')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'repeat',
                  overflow: 'visible',
                }),
          }}
        >
          {heroChildren}
          <img
            src={triple[selectedView]}
            alt="Selected Wig"
            width={hideBrick ? 262 : 282}
            height={hideBrick ? 367 : 387}
            className={
              hideBrick
                ? 'absolute z-10 hero-mannequin-img hero-mannequin-img--live-noir'
                : 'absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hero-mannequin-img'
            }
            style={
              hideBrick
                ? ({
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    '--hero-width': '262px',
                    '--hero-height': '367px',
                  } as CSSProperties)
                : ({
                    top: 'calc(50% - 10.601px + 18px)',
                    '--hero-width': '282px',
                    '--hero-height': '387px',
                  } as CSSProperties)
            }
          />
        </div>
      </div>

      <div
        className={`flex justify-center mb-3 mt-2 baw-noir-thumb-row${thumbRowClassName ? ` ${thumbRowClassName}` : ''}`}
        style={{ transform: 'translateY(10px)', gap: '2px' }}
      >
        {triple.map((view, index) => (
          <div className="leaf-stack thumb" key={index}>
            {!hideBrick && (
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
                className="relative bg-cover bg-center flex items-center justify-center"
                data-thumb-index={index}
                style={{
                  width: '72px',
                  height: '95px',
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
                  ...(index === 1 && { transform: 'translateX(-2px)' }),
                  ...(index === 2 && { transform: 'translateX(-4px)' }),
                }}
              >
                <img
                  alt={`Thumbnail ${index + 1}`}
                  width={hideBrick ? 72 : 63}
                  height={hideBrick ? 95 : 84}
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
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
