import React, { useCallback } from 'react';
import type { FinalSceneHitRect } from '../../constants/finalLobbySceneAssets';

type SceneHitRegionProps = {
  rect: FinalSceneHitRect;
  ariaLabel: string;
  onActivate: () => void;
  zIndex?: number;
  /** QA: colored overlay so hit rect can be tuned against baked art. */
  debugOverlay?: boolean;
  debugLabel?: string;
};

const hitBaseStyle: React.CSSProperties = {
  position: 'absolute',
  margin: 0,
  padding: 0,
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
  touchAction: 'manipulation',
};

export function rectToPercentStyle(rect: FinalSceneHitRect): React.CSSProperties {
  return {
    left: `${rect.left * 100}%`,
    top: `${rect.top * 100}%`,
    width: `${rect.width * 100}%`,
    height: `${rect.height * 100}%`,
  };
}

const SCENE_HIT_DEBUG_OVERLAY_STYLE: React.CSSProperties = {
  backgroundColor: 'rgba(255, 193, 7, 0.42)',
  border: '2px solid rgba(255, 152, 0, 0.95)',
  boxSizing: 'border-box',
};

/** Transparent tap target aligned to baked-in art (percent of slide). */
export function SceneHitRegion({
  rect,
  ariaLabel,
  onActivate,
  zIndex = 20,
  debugOverlay = false,
  debugLabel,
}: SceneHitRegionProps) {
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onActivate();
      }
    },
    [onActivate],
  );

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onActivate}
      onKeyDown={onKeyDown}
      style={{
        ...hitBaseStyle,
        ...rectToPercentStyle(rect),
        zIndex,
        ...(debugOverlay ? SCENE_HIT_DEBUG_OVERLAY_STYLE : null),
      }}
    >
      {debugOverlay && debugLabel ? (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            left: 2,
            top: 2,
            fontFamily: 'monospace',
            fontSize: 9,
            lineHeight: 1.2,
            color: '#000',
            background: 'rgba(255, 255, 255, 0.75)',
            padding: '1px 3px',
            pointerEvents: 'none',
            textTransform: 'lowercase',
          }}
        >
          {debugLabel}
        </span>
      ) : null}
    </button>
  );
}
