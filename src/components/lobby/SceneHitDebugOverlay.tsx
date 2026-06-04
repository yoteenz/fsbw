import type { CSSProperties } from 'react';
import type { FinalSceneHitRect } from '../../constants/finalLobbySceneAssets';
import { sceneHitLayoutBoxStyle, type SceneHitLayoutOptions } from '../../utils/sceneHitLayout';

const DEBUG_LABEL_STYLE: CSSProperties = {
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
};

type Props = {
  rect: FinalSceneHitRect;
  label: string;
  zIndex?: number;
  overlayStyle?: CSSProperties;
  screenOffsetX?: number;
  screenOffsetY?: number;
  layout?: SceneHitLayoutOptions;
  /** When false, no debug label (green play tap — keep PRESS TO PLAY visible). */
  showLabel?: boolean;
};

/** Non-interactive colored box for QA placement tuning (`?sceneHitDebug=1`). */
export function SceneHitDebugOverlay({
  rect,
  label,
  zIndex = 25,
  overlayStyle,
  screenOffsetX = 0,
  screenOffsetY = 0,
  layout,
  showLabel = true,
}: Props) {
  return (
    <div
      aria-hidden
      style={{
        ...sceneHitLayoutBoxStyle(rect, screenOffsetX, screenOffsetY, layout),
        zIndex,
        pointerEvents: 'none',
        backgroundColor: 'rgba(255, 193, 7, 0.42)',
        border: '2px solid rgba(255, 152, 0, 0.95)',
        ...overlayStyle,
      }}
    >
      {showLabel ? <span style={DEBUG_LABEL_STYLE}>{label}</span> : null}
    </div>
  );
}
