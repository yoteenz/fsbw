
import { useState, useEffect } from 'react';

export default function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-hide after 4 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 4000);

    // Cleanup
    return () => {
      clearTimeout(timer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <img
          src="/assets/load-screen.gif"
          alt="Loading..."
          width="405"
          height="405"
          style={{
            width: '405px',
            height: '405px',
            objectFit: 'contain',
          display: 'block',
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate3d(-50%, -50%, 0)',
          margin: 0,
          padding: 0,
          border: 'none',
          outline: 'none',
          backfaceVisibility: 'hidden',
          willChange: 'auto',
          // Lock size completely
          minWidth: '405px',
          maxWidth: '405px',
          minHeight: '405px',
          maxHeight: '405px',
          // Prevent any layout shifts
          contain: 'layout style paint',
          isolation: 'isolate',
          // Force stable rendering
          transformOrigin: '0 0',
          scale: 1,
          rotate: '0deg',
          translate: '0 0',
          // Prevent GIF animation from affecting layout
          imageRendering: 'pixelated',
          // Completely disable all transitions and animations
          transition: 'none',
          animation: 'none',
          transitionProperty: 'none',
          transitionDuration: '0s',
          transitionDelay: '0s',
          transitionTimingFunction: 'none',
          // Force immediate rendering
          animationDuration: '0s',
          animationDelay: '0s',
          animationIterationCount: '1',
          animationFillMode: 'none',
          animationPlayState: 'paused',
          // Prevent any browser optimizations
          transformStyle: 'flat',
          perspective: 'none',
          perspectiveOrigin: '50% 50%',
          // Lock all properties
          boxSizing: 'border-box',
          verticalAlign: 'baseline',
          textAlign: 'left',
          direction: 'ltr',
          unicodeBidi: 'normal',
          writingMode: 'horizontal-tb',
          textOrientation: 'mixed',
          textCombineUpright: 'none',
          textEmphasis: 'none',
          textIndent: '0',
          textShadow: 'none',
          textTransform: 'none',
          textDecoration: 'none',
          textUnderlinePosition: 'auto',
          textDecorationSkipInk: 'auto',
          textDecorationThickness: 'auto',
          textUnderlineOffset: 'auto',
          // Force stable layout
          float: 'none',
          clear: 'none',
          zIndex: 'auto',
          overflow: 'visible',
          clip: 'auto',
          clipPath: 'none',
          mask: 'none',
          filter: 'none',
          backdropFilter: 'none',
          mixBlendMode: 'normal',
          // Prevent any size changes
          resize: 'none',
          cursor: 'default',
          userSelect: 'none',
          pointerEvents: 'none',
          touchAction: 'none'
          }}
          onError={(e) => {
            console.error('Loading screen image failed to load:', e);
            console.error('Image src:', '/assets/load-screen.gif');
          }}
          onLoad={() => {
            console.log('Loading screen image loaded successfully');
          }}
        />
    </div>
  );
}