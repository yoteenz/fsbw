import { useCallback } from 'react';
import type { DesktopViewportScreenHitRect } from '../../hooks/useDesktopRoomCoverHitRect';

type Props = {
  screenRect: DesktopViewportScreenHitRect;
  onActivate: () => void;
  disabled?: boolean;
};

export function ExtensionsBoutiqueHotspot({ screenRect, onActivate, disabled = false }: Props) {
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
        left: `${screenRect.left}px`,
        top: `${screenRect.top}px`,
        width: `${screenRect.width}px`,
        height: `${screenRect.height}px`,
      }}
    >
      <span className="extensions-boutique-hotspot__cue" aria-hidden>
        <span className="extensions-boutique-hotspot__cue-dot" />
        <span className="extensions-boutique-hotspot__cue-text">Shop Extensions</span>
      </span>
    </button>
  );
}
