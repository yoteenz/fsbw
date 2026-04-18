import { createPortal } from 'react-dom';
import { useEffect, useState, useRef } from 'react';

export type ImageViewerDownloadLink = {
  /** Static asset URL (omit when using `onDownload` for generated files). */
  href?: string;
  label: string;
  /** Suggested filename for Save As (optional) */
  download?: string;
  /** Client-generated download (e.g. canvas composite). When set, footer uses a button instead of `<a href>`. */
  onDownload?: () => void | Promise<void>;
};

interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  currentIndex: number;
  onNavigate: (index: number) => void;
  /** Shown below the enlarged strip (e.g. 2D NOIR angle PNGs). Omit when not applicable (e.g. 3D view). */
  footerDownloads?: ImageViewerDownloadLink[];
}

// Same logic as product shots on product page: horizontal strip with scrollPosition + touch/mouse drag
function ImageViewerModal({ isOpen, onClose, images, currentIndex, onNavigate, footerDownloads }: ImageViewerModalProps) {
  const [touchStartedOnBackdrop, setTouchStartedOnBackdrop] = useState(false);

  // Strip scroll state (same as product shots: scrollPosition, isDragging, startX, startScrollPosition)
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startScrollPosition, setStartScrollPosition] = useState(0);

  const contentRef = useRef<HTMLDivElement>(null);

  // Native touchmove with passive: false so preventDefault() works and mobile doesn't scroll the page (same as product shots)
  useEffect(() => {
    const el = contentRef.current;
    if (!el || !isOpen) return;
    const onMove = (e: TouchEvent) => e.preventDefault();
    el.addEventListener('touchmove', onMove, { passive: false });
    return () => el.removeEventListener('touchmove', onMove);
  }, [isOpen]);

  // Slide width in pixels (one full "page" per image) — match viewport like product shots
  const slideWidthPx = typeof window !== 'undefined' ? window.innerWidth * 0.9 : 400;
  const maxScroll = 0;
  const minScroll = images.length <= 1 ? 0 : -(images.length - 1) * slideWidthPx;

  // Sync scroll position when modal opens or currentIndex changes (e.g. keyboard or parent)
  useEffect(() => {
    if (!isOpen || images.length === 0) return;
    const target = -currentIndex * slideWidthPx;
    setScrollPosition(Math.max(minScroll, Math.min(maxScroll, target)));
  }, [isOpen, currentIndex, images.length, slideWidthPx, minScroll, maxScroll]);

  // Mouse handlers — same as product shots (noir)
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setStartScrollPosition(scrollPosition);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const currentX = e.clientX;
    const diff = currentX - startX;
    const newPosition = startScrollPosition - diff;
    setScrollPosition(Math.max(minScroll, Math.min(maxScroll, newPosition)));
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    // Snap to nearest index and notify parent
    const nearestIndex = Math.round(-scrollPosition / slideWidthPx);
    const clamped = Math.max(0, Math.min(images.length - 1, nearestIndex));
    setScrollPosition(-clamped * slideWidthPx);
    onNavigate(clamped);
  };

  // Touch handlers — same as product shots (noir): preventDefault on move so browser doesn't scroll
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setStartScrollPosition(scrollPosition);
    setTouchStartedOnBackdrop(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    const newPosition = startScrollPosition + diff; // same direction as product shots
    setScrollPosition(Math.max(minScroll, Math.min(maxScroll, newPosition)));
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const nearestIndex = Math.round(-scrollPosition / slideWidthPx);
    const clamped = Math.max(0, Math.min(images.length - 1, nearestIndex));
    setScrollPosition(-clamped * slideWidthPx);
    onNavigate(clamped);
  };

  // Backdrop touch to close (tap on dimmed area)
  const handleBackdropTouchStart = (e: React.TouchEvent) => {
    if (e.target === e.currentTarget) {
      setTouchStartedOnBackdrop(true);
    }
  };

  const handleBackdropTouchEnd = (e: React.TouchEvent) => {
    if (e.target === e.currentTarget && touchStartedOnBackdrop) {
      setTouchStartedOnBackdrop(false);
      onClose();
    }
  };

  // Keyboard — same as before
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        const prev = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
        onNavigate(prev);
      } else if (e.key === 'ArrowRight') {
        const next = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
        onNavigate(next);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length, onClose, onNavigate]);

  // Check if an image path is 2D view (mannequin on leaf-brick) for special layout
  const is2DViewImage = (src: string) =>
    src.includes('2D') ||
    src.includes('2d') ||
    src.includes('natural front') ||
    src.includes('natural left') ||
    src.includes('natural right') ||
    src.includes('peak front') ||
    src.includes('peak left') ||
    src.includes('peak right') ||
    src.includes('lagos front') ||
    src.includes('lagos left') ||
    src.includes('lagos right');

  if (!isOpen || images.length === 0) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: '0',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        margin: '0',
        padding: '0'
      }}
      onClick={onClose}
      onTouchStart={handleBackdropTouchStart}
      onTouchEnd={handleBackdropTouchEnd}
    >
      {/* Same pattern as product shots: viewport with overflow hidden, inner strip with translateX(scrollPosition) */}
      <div
        ref={contentRef}
        style={{
          position: 'relative',
          width: '90vw',
          maxWidth: '90vw',
          height: '85vh',
          maxHeight: '85vh',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          touchAction: 'none'
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0,
          }}
        >
        <div
          className="flex"
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            flex: '1 1 auto',
            minHeight: 0,
            height: '100%',
            transform: `translateX(${scrollPosition}px)`,
            transition: isDragging ? 'none' : 'transform 0.3s ease-out',
            gap: 0
          }}
        >
          {images.map((src, index) => (
            <div
              key={index}
              style={{
                flex: '0 0 90vw',
                width: '90vw',
                maxWidth: '90vw',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 2px'
              }}
            >
              {is2DViewImage(src) && (
                <div
                  style={{
                    position: 'relative',
                    width: '200px',
                    height: '290px',
                    transform: 'scale(1.88)',
                    transformOrigin: 'center center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <div
                    style={{
                      position: 'relative',
                      width: '200px',
                      height: '290px',
                      backgroundImage: `url('/assets/leaf-brick-resize.png')`,
                      backgroundRepeat: 'repeat',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      zIndex: 0,
                      pointerEvents: 'none'
                    }}
                  />
                  <img
                    src={src}
                    alt={`Image ${index + 1} of ${images.length}`}
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: 'calc(50% - 10.601px + 12px + 0.1px)',
                      transform: 'translateX(-50%) translateY(-50%)',
                      zIndex: 10,
                      width: '230px',
                      height: 'auto',
                      maxHeight: '610px',
                      minWidth: '230px',
                      objectFit: 'contain',
                      userSelect: 'none',
                      pointerEvents: 'none'
                    }}
                  />
                </div>
              )}
              {!is2DViewImage(src) && (
                <img
                  src={src}
                  alt={`Image ${index + 1} of ${images.length}`}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    userSelect: 'none',
                    pointerEvents: 'none'
                  }}
                />
              )}
            </div>
          ))}
        </div>
        {footerDownloads && footerDownloads.length > 0 && (
          <div
            className="flex flex-col items-center gap-1 px-2 shrink-0"
            style={{ paddingBottom: '8px', paddingTop: '4px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <p
              style={{
                fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                fontSize: '9px',
                color: '#808080',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                margin: 0,
              }}
            >
              download 2d angles (png)
            </p>
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1" style={{ maxWidth: '100%' }}>
              {footerDownloads.map((d) =>
                d.onDownload ? (
                  <button
                    key={d.label}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      void d.onDownload?.();
                    }}
                    style={{
                      fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                      fontSize: '10px',
                      color: '#EB1C24',
                      textDecoration: 'underline',
                      textUnderlineOffset: '2px',
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                    }}
                  >
                    {d.label}
                  </button>
                ) : (
                  <a
                    key={(d.href || '') + d.label}
                    href={d.href}
                    download={d.download}
                    style={{
                      fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                      fontSize: '10px',
                      color: '#EB1C24',
                      textDecoration: 'underline',
                      textUnderlineOffset: '2px',
                    }}
                  >
                    {d.label}
                  </a>
                )
              )}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ImageViewerModal;
