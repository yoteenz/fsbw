import type { ReactNode } from 'react';

type Props = {
  active: boolean;
  children: ReactNode;
};

/** Small fixed label so QA knows hit-debug mode is on (does not block taps). */
export function SceneHitDebugBanner({ active, children }: Props) {
  if (!active) return null;

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        top: 8,
        left: 8,
        zIndex: 999998,
        maxWidth: 'min(92vw, 320px)',
        padding: '4px 8px',
        fontFamily: 'monospace',
        fontSize: 10,
        lineHeight: 1.35,
        color: '#000',
        background: 'rgba(255, 255, 255, 0.92)',
        border: '1px solid rgba(0, 0, 0, 0.35)',
        borderRadius: 4,
        pointerEvents: 'none',
        boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
      }}
    >
      {children}
    </div>
  );
}
