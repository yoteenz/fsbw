import type { ReactNode } from 'react';
import { useLoungeTvCaptureGuard } from '../../hooks/useLoungeTvCaptureGuard';

type LoungeTvContentProtectionProps = {
  active: boolean;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Wraps lounge TV screen content with capture heuristics + black shield overlay.
 * Web cannot guarantee DRM-level protection; this is best-effort for mobile Safari/Chrome.
 */
export function LoungeTvContentProtection({
  active,
  children,
  className,
  style,
}: LoungeTvContentProtectionProps) {
  const { shieldActive, blockContextMenu, blockDragStart } = useLoungeTvCaptureGuard(active);

  return (
    <div
      className={`lounge-tv-protected${className ? ` ${className}` : ''}`}
      style={{ position: 'relative', width: '100%', height: '100%', ...style }}
      onContextMenu={blockContextMenu}
      onDragStart={blockDragStart}
    >
      {children}
      <div
        aria-hidden
        className="lounge-tv-capture-shield"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 50,
          backgroundColor: '#000',
          pointerEvents: shieldActive ? 'auto' : 'none',
          opacity: shieldActive ? 1 : 0,
          transition: shieldActive ? 'none' : 'opacity 0.12s ease',
        }}
      />
    </div>
  );
}
