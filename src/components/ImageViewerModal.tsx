import { createPortal } from 'react-dom';
import { useEffect, useState, useCallback } from 'react';

interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  currentIndex: number;
  onNavigate: (index: number) => void;
}

function ImageViewerModal({ isOpen, onClose, images, currentIndex, onNavigate }: ImageViewerModalProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [mouseStart, setMouseStart] = useState<number | null>(null);
  const [mouseEnd, setMouseEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [touchStartedOnBackdrop, setTouchStartedOnBackdrop] = useState(false);

  // Minimum swipe distance (in pixels)
  const minSwipeDistance = 50;

  const handlePrevious = useCallback(() => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    onNavigate(newIndex);
  }, [currentIndex, images.length, onNavigate]);

  const handleNext = useCallback(() => {
    const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    onNavigate(newIndex);
  }, [currentIndex, images.length, onNavigate]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handlePrevious, handleNext, onClose]);

  // Touch handlers for mobile - content area
  const onTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation(); // Prevent backdrop from handling this
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setTouchStartedOnBackdrop(false);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation(); // Prevent backdrop from handling this
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = (e?: React.TouchEvent) => {
    if (e) {
      e.stopPropagation(); // Prevent backdrop from handling this
    }
    
    if (!touchStart || !touchEnd) {
      setTouchStart(null);
      setTouchEnd(null);
      setTouchStartedOnBackdrop(false);
      return;
    }
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && images.length > 1) {
      handleNext();
    }
    if (isRightSwipe && images.length > 1) {
      handlePrevious();
    }
    
    setTouchStart(null);
    setTouchEnd(null);
    setTouchStartedOnBackdrop(false);
  };

  // Handle backdrop touch to close
  const handleBackdropTouchStart = (e: React.TouchEvent) => {
    // Only track if touching directly on the backdrop
    if (e.target === e.currentTarget) {
      setTouchStartedOnBackdrop(true);
      setTouchStart(e.targetTouches[0].clientX);
      setTouchEnd(null);
    }
  };

  const handleBackdropTouchMove = (e: React.TouchEvent) => {
    if (e.target === e.currentTarget && touchStartedOnBackdrop) {
      setTouchEnd(e.targetTouches[0].clientX);
    }
  };

  const handleBackdropTouchEnd = (e: React.TouchEvent) => {
    if (e.target === e.currentTarget && touchStartedOnBackdrop) {
      // If touch ended on backdrop with minimal movement (tap), close
      const moved = touchStart && touchEnd ? Math.abs(touchStart - touchEnd) : 0;
      if (moved < 10) {
        onClose();
      }
      setTouchStart(null);
      setTouchEnd(null);
      setTouchStartedOnBackdrop(false);
    }
  };

  // Mouse handlers for desktop
  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setMouseEnd(null);
    setMouseStart(e.clientX);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setMouseEnd(e.clientX);
  };

  const onMouseUp = () => {
    if (!isDragging || !mouseStart || !mouseEnd) {
      setIsDragging(false);
      setMouseStart(null);
      setMouseEnd(null);
      return;
    }
    
    const distance = mouseStart - mouseEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && images.length > 1) {
      handleNext();
    }
    if (isRightSwipe && images.length > 1) {
      handlePrevious();
    }
    
    setIsDragging(false);
    setMouseStart(null);
    setMouseEnd(null);
  };

  // Check if current image is a 2D view image (contains "2D" in the path or is a Noir 2D view)
  // Must calculate before early return to maintain hook order
  const currentImage = isOpen && images.length > 0 && currentIndex >= 0 ? images[currentIndex] : null;
  const is2DView = currentImage && (
    currentImage.includes('2D') || 
    currentImage.includes('2d') ||
    currentImage.includes('natural front') ||
    currentImage.includes('natural left') ||
    currentImage.includes('natural right') ||
    currentImage.includes('peak front') ||
    currentImage.includes('peak left') ||
    currentImage.includes('peak right') ||
    currentImage.includes('lagos front') ||
    currentImage.includes('lagos left') ||
    currentImage.includes('lagos right')
  );
  
  // All images now use the same sizing to match Noir's behavior
  
  // Debug logging - must be before early return to maintain hook order
  useEffect(() => {
    if (isOpen && is2DView) {
      console.log('🔍 ImageViewerModal Debug:', {
        currentImage,
        is2DView,
        currentIndex,
        totalImages: images.length,
        imagePath: currentImage
      });
      
      // Check if background element exists
      setTimeout(() => {
        const bgElement = document.querySelector('.debug-leaf-brick-bg');
        if (bgElement) {
          const computedStyle = window.getComputedStyle(bgElement);
          console.log('🎨 Background element styles:', {
            backgroundImage: computedStyle.backgroundImage,
            backgroundRepeat: computedStyle.backgroundRepeat,
            backgroundSize: computedStyle.backgroundSize,
            zIndex: computedStyle.zIndex,
            width: computedStyle.width,
            height: computedStyle.height,
            display: computedStyle.display,
            position: computedStyle.position,
            opacity: computedStyle.opacity,
            visibility: computedStyle.visibility
          });
          
          // Test if background image URL is accessible
          const bgImg = new Image();
          bgImg.onload = () => console.log('✅ Background image URL is accessible: /assets/NOIR/leaf-brick.png');
          bgImg.onerror = () => console.error('❌ Background image URL failed to load: /assets/NOIR/leaf-brick.png');
          bgImg.src = '/assets/NOIR/leaf-brick.png';
        } else {
          console.warn('⚠️ Background element not found in DOM');
        }
      }, 100);
      
      // Check if container exists
      const container = document.querySelector('.debug-2d-container');
      if (container) {
        const computedStyle = window.getComputedStyle(container);
        console.log('📦 Container styles:', {
          width: computedStyle.width,
          height: computedStyle.height,
          position: computedStyle.position,
          zIndex: computedStyle.zIndex
        });
      }
    }
  }, [isOpen, is2DView, currentImage, currentIndex, images.length]);

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
      onTouchMove={handleBackdropTouchMove}
      onTouchEnd={handleBackdropTouchEnd}
    >
      <div 
        style={{
          position: 'relative',
          maxWidth: is2DView ? '90vw' : '90vw',
          maxHeight: is2DView ? '90vh' : '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 'auto',
          width: is2DView ? 'auto' : '100%',
          height: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={(e) => onTouchEnd(e)}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {/* Image Container - with leaf-brick background for 2D view */}
        {is2DView ? (
          <div
            className="debug-2d-container"
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              width: 'auto',
              height: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'visible'
            }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={(e) => onTouchEnd(e)}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            {/* Exact product page structure, then scale entire container */}
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
              {/* Leaf-brick background - exact product page structure */}
              <div
                className="debug-leaf-brick-bg"
                style={{
                  position: 'relative',
                  width: '200px',
                  height: '290px',
                  backgroundImage: `url('/assets/NOIR/leaf-brick.png')`,
                  backgroundRepeat: 'repeat',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  zIndex: 0,
                  pointerEvents: 'none'
                }}
              />
              {/* Mannequin - exact product page positioning */}
              <img
                src={images[currentIndex]}
                alt={`Image ${currentIndex + 1} of ${images.length}`}
                className="debug-mannequin-img"
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
                  minHeight: 'auto',
                  objectFit: 'contain',
                  borderRadius: '0',
                  userSelect: 'none',
                  pointerEvents: 'auto'
                }}
                onLoad={() => console.log('✅ Mannequin image loaded:', images[currentIndex])}
                onError={() => console.error('❌ Mannequin image failed to load:', images[currentIndex])}
              />
            </div>
          </div>
        ) : (
        <img
          src={images[currentIndex]}
          alt={`Image ${currentIndex + 1} of ${images.length}`}
          style={{ 
            maxWidth: '100%',
            maxHeight: '80vh',
              width: 'auto',
            height: 'auto',
            objectFit: 'contain',
            borderRadius: '0',
              transform: 'scale(1.05)',
              userSelect: 'none'
            }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={(e) => onTouchEnd(e)}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          />
        )}
      </div>
    </div>,
    document.body
  );
}

export default ImageViewerModal;
