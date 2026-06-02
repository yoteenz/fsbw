import React, { useCallback } from 'react';
import type { FinalSceneHitRect } from '../../constants/finalLobbySceneAssets';

type SceneHitRegionProps = {
  rect: FinalSceneHitRect;
  ariaLabel: string;
  onActivate: () => void;
  zIndex?: number;
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

/** Transparent tap target aligned to baked-in art (percent of slide). */
export function SceneHitRegion({ rect, ariaLabel, onActivate, zIndex = 20 }: SceneHitRegionProps) {
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
      }}
    />
  );
}
