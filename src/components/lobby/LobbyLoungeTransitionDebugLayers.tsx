import type { CSSProperties, ReactNode } from 'react';
import type { LobbyLoungeTransitionDebugState } from '../../utils/lobbyLoungeTransitionDebug';

const debugLabelStyle: CSSProperties = {
  position: 'absolute',
  left: 4,
  top: 4,
  fontFamily: 'monospace',
  fontSize: 10,
  lineHeight: 1.2,
  padding: '2px 5px',
  pointerEvents: 'none',
  zIndex: 3,
};

type LayerOutlineProps = {
  label: string;
  color: string;
  fill: string;
  opacity: number;
  children?: ReactNode;
};

/** Colored inset box — visible even when layer opacity is 0 (outline stays at 0.85). */
export function LobbyLoungeTransitionLayerOutline({
  label,
  color,
  fill,
  opacity,
  children,
}: LayerOutlineProps) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        boxSizing: 'border-box',
        border: `3px solid ${color}`,
        backgroundColor: fill,
        opacity: Math.max(opacity, opacity > 0 ? opacity : 0.15),
        outline: opacity <= 0 ? `2px dashed ${color}` : undefined,
        outlineOffset: -5,
      }}
    >
      <span
        aria-hidden
        style={{
          ...debugLabelStyle,
          color: '#000',
          background: 'rgba(255,255,255,0.9)',
        }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

type BannerProps = {
  debug: LobbyLoungeTransitionDebugState;
};

export function LobbyLoungeTransitionDebugBanner({ debug }: BannerProps) {
  if (!debug.showLayerOverlays) return null;

  const posterLine =
    debug.posterReveal === 'hidden'
      ? 'poster=hidden'
      : debug.posterReveal === 'videoOnPlayingOnly'
        ? 'poster until playing only'
        : 'poster until frame0';

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        top: 48,
        left: 8,
        zIndex: 999998,
        maxWidth: 'min(94vw, 360px)',
        padding: '6px 8px',
        fontFamily: 'monospace',
        fontSize: 9,
        lineHeight: 1.4,
        color: '#000',
        background: 'rgba(255, 255, 255, 0.94)',
        border: '1px solid rgba(0,0,0,0.4)',
        borderRadius: 4,
        pointerEvents: 'none',
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 4 }}>Transition debug ON</div>
      <div>■ magenta = POSTER (slide PNG)</div>
      <div>■ lime = VIDEO (Seedance)</div>
      <div>■ orange = shared frame · blue bands = letterbox</div>
      <div style={{ marginTop: 4 }}>
        offsetY={debug.mediaOffsetYPx}px · {posterLine}
      </div>
      <div style={{ marginTop: 4, opacity: 0.85 }}>
        ?lobbyTransitionOffset=0 · ?lobbyTransitionPoster=hidden|afterPlaying ·
        ?lobbyTransitionDebug=0
      </div>
    </div>
  );
}

export function lobbyLoungeTransitionFrameDebugStyle(enabled: boolean): CSSProperties | undefined {
  if (!enabled) return undefined;
  return {
    boxShadow: 'inset 0 0 0 3px rgba(255, 152, 0, 0.95)',
  };
}

export function lobbyLoungeTransitionLetterboxBandDebugStyle(enabled: boolean): CSSProperties {
  if (!enabled) return {};
  return { backgroundColor: 'rgba(0, 120, 255, 0.22)' };
}
