import type React from 'react';
import type { FinalSceneHitRect } from '../../constants/finalLobbySceneAssets';
import { sceneCarouselBackgroundLayerStyle } from '../../utils/sceneCarouselBackground';

/** z-index above slide scrim, below open case popover wrapper. */
export const LOBBY_CASE_PROP_PEEL_Z_INDEX = 28;

/**
 * Undimmed slice of the lobby composite at a case prop rect — sits above the popover scrim
 * so baked register/phone art stays visible while the rest of the slide is dimmed.
 */
export function casePropPeelClipStyle(rect: FinalSceneHitRect): React.CSSProperties {
  return {
    position: 'absolute',
    left: `${rect.left * 100}%`,
    top: `${rect.top * 100}%`,
    width: `${rect.width * 100}%`,
    height: `${rect.height * 100}%`,
    overflow: 'hidden',
    pointerEvents: 'none',
    zIndex: LOBBY_CASE_PROP_PEEL_Z_INDEX,
  };
}

/** Full-slide background positioned so the clip window shows the correct art region. */
export function casePropPeelBackgroundStyle(
  rect: FinalSceneHitRect,
  backgroundSrc: string,
): React.CSSProperties {
  const layer = sceneCarouselBackgroundLayerStyle(backgroundSrc);
  const widthPct = rect.width > 0 ? (1 / rect.width) * 100 : 100;
  const heightPct = rect.height > 0 ? (1 / rect.height) * 100 : 100;
  const leftPct = rect.width > 0 ? (-rect.left / rect.width) * 100 : 0;
  const topPct = rect.height > 0 ? (-rect.top / rect.height) * 100 : 0;

  return {
    ...layer,
    position: 'absolute',
    left: `${leftPct}%`,
    top: `${topPct}%`,
    width: `${widthPct}%`,
    height: `${heightPct}%`,
    minHeight: 'unset',
    right: 'auto',
  };
}

type Props = {
  backgroundSrc: string;
  rect: FinalSceneHitRect;
};

export function LobbyCasePropPeel({ backgroundSrc, rect }: Props) {
  return (
    <div aria-hidden style={casePropPeelClipStyle(rect)}>
      <div style={casePropPeelBackgroundStyle(rect, backgroundSrc)} />
    </div>
  );
}
