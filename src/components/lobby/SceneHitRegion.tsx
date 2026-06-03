import React, { useCallback } from 'react';
import type { FinalSceneHitRect } from '../../constants/finalLobbySceneAssets';

type SceneHitRegionProps = {
  rect: FinalSceneHitRect;
  ariaLabel: string;
  onActivate: () => void;
  zIndex?: number;
  /** When true, no navigation (e.g. register/phone popover open on lobby). */
  disabled?: boolean;
  /** QA: colored overlay so hit rect can be tuned against baked art. */
  debugOverlay?: boolean;
  debugLabel?: string;
  /** Overrides default amber debug fill/border (per-shelf colors on lobby). */
  debugOverlayStyle?: React.CSSProperties;
  /** QA only — shifts colored debug box (and its tap target while debug is on). */
  debugOffsetX?: number;
  debugOffsetY?: number;
  /** QA only — scale debug box (e.g. shelf tuning); anchor {@link debugScaleOrigin}. */
  debugScale?: { x: number; y: number };
  debugScaleOrigin?: React.CSSProperties['transformOrigin'];
  /** QA only — shortens debug box height (px) from mapped percent rect. */
  debugHeightTrimPx?: number;
};

const hitBaseStyle: React.CSSProperties = {
  position: 'absolute',
  margin: 0,
  padding: 0,
  border: 'none',
  backgroundColor: 'transparent',
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
  disabled = false,
  debugOverlay = false,
  debugLabel,
  debugOverlayStyle,
  debugOffsetX = 0,
  debugOffsetY = 0,
  debugScale,
  debugScaleOrigin = 'center top',
  debugHeightTrimPx = 0,
}: SceneHitRegionProps) {
  const debugTransform = (() => {
    if (!debugOverlay) return undefined;
    const parts: string[] = [];
    if (debugOffsetX) parts.push(`translateX(${debugOffsetX}px)`);
    if (debugOffsetY) parts.push(`translateY(${debugOffsetY}px)`);
    if (debugScale) parts.push(`scale(${debugScale.x}, ${debugScale.y})`);
    return parts.length ? parts.join(' ') : undefined;
  })();

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onActivate();
      }
    },
    [disabled, onActivate],
  );

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={disabled ? undefined : onActivate}
      onKeyDown={onKeyDown}
      tabIndex={disabled ? -1 : 0}
      style={{
        ...hitBaseStyle,
        ...rectToPercentStyle(rect),
        ...(debugOverlay && debugHeightTrimPx > 0
          ? { height: `calc(${rect.height * 100}% - ${debugHeightTrimPx}px)`, boxSizing: 'border-box' }
          : null),
        zIndex,
        pointerEvents: disabled ? 'none' : 'auto',
        cursor: disabled ? 'default' : 'pointer',
        ...(debugOverlay ? { ...SCENE_HIT_DEBUG_OVERLAY_STYLE, ...debugOverlayStyle } : null),
        ...(debugTransform
          ? { transform: debugTransform, transformOrigin: debugScale ? debugScaleOrigin : undefined }
          : null),
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
            fontSize: 11,
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

