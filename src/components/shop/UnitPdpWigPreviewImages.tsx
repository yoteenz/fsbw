/** Shared 2D/3D hero + thumb grid (NOIR PDP layout): stretch-aligned columns, 4px gutters. */
export type UnitPdpWigPreviewImagesProps = {
  is3DView: boolean;
  currentImages: { hero: string; top: string; bottom: string };
  heroFrameBackgroundImage: string;
  topThumbBackgroundImage: string;
  bottomThumbBackgroundImage: string;
  onOpenHeroViewer: () => void;
  onTopThumbnailClick: () => void;
  onBottomThumbnailClick: () => void;
};

export function UnitPdpWigPreviewImages({
  is3DView,
  currentImages,
  heroFrameBackgroundImage,
  topThumbBackgroundImage,
  bottomThumbBackgroundImage,
  onOpenHeroViewer,
  onTopThumbnailClick,
  onBottomThumbnailClick,
}: UnitPdpWigPreviewImagesProps) {
  return (
    <div
      className="product-wig-preview-images"
      style={{
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'center',
        gap: '4px',
        marginBottom: 'clamp(12px, 1.5vw, 16px)',
        overflow: 'visible',
        transform: 'translateY(0)',
        minHeight: 'clamp(290px, 72.5vw, 464px)',
      }}
    >
      <div style={{ position: 'relative', overflow: 'visible', flexShrink: '0', display: 'flex', alignSelf: 'stretch' }}>
        <div
          style={{
            position: 'relative',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 'clamp(200px, 50vw, 320px)',
            height: '100%',
            minHeight: 'clamp(290px, 72.5vw, 464px)',
            backgroundImage: heroFrameBackgroundImage,
            backgroundRepeat: 'repeat',
            overflow: 'hidden',
            cursor: 'pointer',
          }}
          onClick={onOpenHeroViewer}
        >
          <img
            src={currentImages.hero}
            alt=""
            style={{
              position: 'absolute',
              left: '50%',
              top: 'calc(50% - 10.601px + 12px)',
              transform: 'translateX(-50%) translateY(-50%)',
              zIndex: '10',
              width: 'clamp(230px, 57.5vw, 368px)',
              height: 'auto',
              maxHeight: '100%',
              minWidth: 'clamp(230px, 57.5vw, 368px)',
              minHeight: 'auto',
              display: is3DView ? 'none' : 'block',
              cursor: 'pointer',
              pointerEvents: is3DView ? 'none' : 'auto',
            }}
            onClick={(e) => {
              e.stopPropagation();
              onOpenHeroViewer();
            }}
          />
        </div>
      </div>

      <div
        className="flex flex-col flex-shrink-0"
        style={{
          width: 'clamp(100px, 26vw, 175px)',
          alignSelf: 'stretch',
          gap: '4px',
          minHeight: 'clamp(290px, 72.5vw, 464px)',
        }}
      >
        <div className="relative" style={{ flex: '1 1 0', minHeight: 0 }}>
          <div
            className="relative bg-cover bg-center flex items-center justify-center cursor-pointer h-full w-full"
            style={{
              backgroundImage: topThumbBackgroundImage,
              backgroundSize: 'cover',
              backgroundPosition: is3DView ? 'center calc(50% + 5px)' : 'center',
              backgroundRepeat: 'no-repeat',
            }}
            onClick={onTopThumbnailClick}
          >
            <img
              src={currentImages.top}
              alt=""
              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
              style={{
                top: 'calc(50% - 6.1px + 7.2px + 10px - 3px - 6px - 0.6px - 1px - 0.5px - 0.5px)',
                width: 'clamp(112px, 29vw, 196px)',
                height: 'auto',
                maxWidth: '100%',
                maxHeight: '100%',
                minWidth: 'clamp(112px, 29vw, 196px)',
                display: is3DView ? 'none' : 'block',
              }}
            />
          </div>
        </div>
        <div className="relative" style={{ flex: '1 1 0', minHeight: 0 }}>
          <div
            className="relative bg-cover bg-center flex items-center justify-center cursor-pointer h-full w-full"
            style={{
              backgroundImage: bottomThumbBackgroundImage,
              backgroundSize: 'cover',
              backgroundPosition: is3DView ? 'center calc(50% + 5px)' : 'center',
              backgroundRepeat: 'no-repeat',
            }}
            onClick={onBottomThumbnailClick}
          >
            <img
              src={currentImages.bottom}
              alt=""
              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
              style={{
                top: 'calc(50% - 6.1px + 7.2px + 10px - 3px - 6px - 0.6px - 1px - 0.5px - 0.5px)',
                width: 'clamp(112px, 29vw, 196px)',
                height: 'auto',
                maxWidth: '100%',
                maxHeight: '100%',
                minWidth: 'clamp(112px, 29vw, 196px)',
                display: is3DView ? 'none' : 'block',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
