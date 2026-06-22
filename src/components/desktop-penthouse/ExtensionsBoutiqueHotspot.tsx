import { useCallback } from 'react';
import type { FinalSceneHitRect } from '../../constants/finalLobbySceneAssets';
import { rectToPercentStyle } from '../lobby/SceneHitRegion';

type Props = {
  rect: FinalSceneHitRect;
  onActivate: () => void;
  disabled?: boolean;
};

export function ExtensionsBoutiqueHotspot({ rect, onActivate, disabled = false }: Props) {
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
      className="extensions-boutique-hotspot"
      aria-label="Shop extensions"
      aria-disabled={disabled}
      disabled={disabled}
      onClick={disabled ? undefined : onActivate}
      onKeyDown={onKeyDown}
      style={{
        ...rectToPercentStyle(rect),
      }}
    >
      <span className="extensions-boutique-hotspot__cue" aria-hidden>
        <span className="extensions-boutique-hotspot__cue-dot" />
        <span className="extensions-boutique-hotspot__cue-text">Shop Extensions</span>
      </span>
    </button>
  );
}
