import { useCallback, useEffect, useState, type RefObject } from 'react';
import {
  DESKTOP_LOUNGE_ART_HEIGHT,
  DESKTOP_LOUNGE_ART_WIDTH,
} from '../../constants/desktopLoungeTvLayout';
import {
  LOUNGE_TV_PRESS_PLAY_LABEL,
  LOUNGE_TV_PRESS_PLAY_LABEL_STYLE,
} from '../../constants/loungeTvPressPlay';
import { useSceneCoverHitRect } from '../../hooks/useSceneCoverHitRect';
import { sceneHitLayoutBoxStyle } from '../../utils/sceneHitLayout';
import { hydrateLoungeTvAdminConfig } from '../../utils/loungeTvAdminConfig';
import { getLoungeTvAdminConfig } from '../../utils/api';
import { LoungeTvContentProtection } from '../lounge/LoungeTvContentProtection';
import { LoungeTvScreen } from '../lounge/LoungeTvOverlay';
import { LoungeTvCloseButton } from '../lounge/loungeTvFrame';
import {
  LOUNGE_TV_GLASS_CLOSE_ICON_SIZE,
  LOUNGE_TV_GLASS_CLOSE_SIZE,
  LOUNGE_TV_GLASS_CONTAINER_STYLE,
} from '../lounge/loungeTvResponsive';
import type { LoungeTvMainTab } from '../lounge/loungeTvContent';
import { useDesktopLoungeTvDebugEnabled } from '../../utils/desktopLoungeTvFrameDebug';
import { useEffectiveDesktopLoungeTvFrameConfig } from './DesktopLoungeTvFrameEditorContext';
import { DesktopLoungeTvFrameDebugOverlay } from './DesktopLoungeTvFrameDebugOverlay';

type Props = {
  measureRef: RefObject<HTMLElement | null>;
  isSlayCinemaEnabled: boolean;
  onToggleSlayCinema: () => void;
  onCloseSlayCinema: () => void;
  active: boolean;
};

/**
 * Desktop TV Lounge — PRESS TO PLAY toggles Slay Cinema; when active, embeds mobile lounge TV content
 * inside the mapped TV frame with a close control to exit cinema mode.
 */
export function DesktopLoungeSlayCinemaPlay({
  measureRef,
  isSlayCinemaEnabled,
  onToggleSlayCinema,
  onCloseSlayCinema,
  active,
}: Props) {
  const frameConfig = useEffectiveDesktopLoungeTvFrameConfig();
  const tvDebug = useDesktopLoungeTvDebugEnabled();
  const [mainTab, setMainTab] = useState<LoungeTvMainTab>('brand');
  const [sidebarId, setSidebarId] = useState('new-drops');

  const frameMapped = useSceneCoverHitRect(
    frameConfig.rect,
    measureRef,
    { x: frameConfig.screenOffsetX, y: frameConfig.screenOffsetY },
    { width: DESKTOP_LOUNGE_ART_WIDTH, height: DESKTOP_LOUNGE_ART_HEIGHT },
  );

  useEffect(() => {
    if (!active || !isSlayCinemaEnabled) return;
    void hydrateLoungeTvAdminConfig(getLoungeTvAdminConfig);
  }, [active, isSlayCinemaEnabled]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onToggleSlayCinema();
      }
    },
    [onToggleSlayCinema],
  );

  if (!active || !frameMapped) return null;

  const frameStyle = {
    ...sceneHitLayoutBoxStyle(
      frameMapped,
      frameConfig.screenOffsetX,
      frameConfig.screenOffsetY,
      frameConfig.layout,
    ),
    position: 'absolute' as const,
    zIndex: 12,
    pointerEvents: 'auto' as const,
    overflow: 'hidden' as const,
    ...LOUNGE_TV_GLASS_CONTAINER_STYLE,
  };

  return (
    <>
      {tvDebug ? (
        <DesktopLoungeTvFrameDebugOverlay
          mappedRect={frameMapped}
          screenOffsetX={frameConfig.screenOffsetX}
          screenOffsetY={frameConfig.screenOffsetY}
          layout={frameConfig.layout}
        />
      ) : null}

      <div data-desktop-lounge-slay-cinema-tv style={frameStyle}>
        {isSlayCinemaEnabled ? (
          <>
            <LoungeTvCloseButton
              visible
              position={{ top: '2%', right: '2%' }}
              size={LOUNGE_TV_GLASS_CLOSE_SIZE}
              iconSize={LOUNGE_TV_GLASS_CLOSE_ICON_SIZE}
              onClick={(e) => {
                e.stopPropagation();
                onCloseSlayCinema();
              }}
            />
            <LoungeTvContentProtection
              active
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                boxSizing: 'border-box',
              }}
            >
              <LoungeTvScreen
                mainTab={mainTab}
                sidebarId={sidebarId}
                onMainTabChange={setMainTab}
                onSidebarChange={setSidebarId}
              />
            </LoungeTvContentProtection>
          </>
        ) : (
          <button
            type="button"
            data-desktop-lounge-slay-cinema-toggle
            onClick={onToggleSlayCinema}
            onKeyDown={onKeyDown}
            aria-label="Toggle Slay Cinema mode"
            aria-pressed={isSlayCinemaEnabled}
            style={{
              width: '100%',
              height: '100%',
              margin: 0,
              padding: 8,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxSizing: 'border-box',
            }}
          >
            <span aria-hidden style={LOUNGE_TV_PRESS_PLAY_LABEL_STYLE}>
              {LOUNGE_TV_PRESS_PLAY_LABEL}
            </span>
          </button>
        )}
      </div>
    </>
  );
}
