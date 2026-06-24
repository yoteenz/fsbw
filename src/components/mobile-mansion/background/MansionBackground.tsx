import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { mansionBlur } from '../../../constants/mobileMansionTokens';

export type MansionBackgroundProps = {
  backgroundImage?: string;
  backgroundVideo?: string;
  overlayOpacity?: number;
  blurAmount?: number;
  parallaxOffset?: number;
  children?: ReactNode;
};

/**
 * Full-screen background system with image, blur, gradient overlay,
 * parallax depth, and future video support.
 */
export function MansionBackground({
  backgroundImage,
  backgroundVideo,
  overlayOpacity = 0.35,
  blurAmount = mansionBlur.background,
  parallaxOffset = 0,
  children,
}: MansionBackgroundProps) {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      {/* Image layer */}
      {backgroundImage ? (
        <motion.div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            transform: `scale(1.08) translateY(${parallaxOffset}px)`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(160deg, #f8f6f4 0%, #ece8e4 40%, #e0dbd6 100%)',
          }}
        />
      )}

      {/* Video layer (future) */}
      {backgroundVideo ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={backgroundVideo}
          autoPlay
          muted
          loop
          playsInline
          style={{ transform: `translateY(${parallaxOffset}px)` }}
        />
      ) : null}

      {/* Blur layer */}
      {blurAmount > 0 ? (
        <div
          className="absolute inset-0"
          style={{
            backdropFilter: `blur(${blurAmount}px)`,
            WebkitBackdropFilter: `blur(${blurAmount}px)`,
          }}
        />
      ) : null}

      {/* Gradient overlay for legibility */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(180deg, rgba(255,255,255,${overlayOpacity * 0.6}) 0%, rgba(255,255,255,${overlayOpacity * 0.2}) 35%, rgba(255,255,255,${overlayOpacity * 0.15}) 65%, rgba(255,255,255,${overlayOpacity * 0.5}) 100%),
            radial-gradient(ellipse at 50% 0%, rgba(255,255,255,${overlayOpacity * 0.4}) 0%, transparent 70%)
          `,
        }}
      />

      {children}
    </div>
  );
}
