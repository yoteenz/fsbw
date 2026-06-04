import type { CSSProperties, ReactNode, RefObject } from 'react';
import {
  FINAL_LOBBY_DISPLAY_CASE_RECT,
  LOBBY_DISPLAY_CASE_HIT_LAYOUT,
  LOBBY_DISPLAY_CASE_LAYOUT_OFFSET,
  LOBBY_DISPLAY_CASE_PHONE_SLOT,
  LOBBY_DISPLAY_CASE_REGISTER_SLOT,
} from '../../constants/lobbyDisplayCaseLayout';
import { useSceneCoverHitRect } from '../../hooks/useSceneCoverHitRect';
import { sceneHitLayoutBoxStyle } from '../../utils/sceneHitLayout';
import { useLobbyDisplayCaseHitDebugEnabled } from '../../utils/sceneHitDebug';
import { LOBBY_CASE_CONTAINER_STYLE } from './lobbyCaseResponsive';
import { SceneHitDebugOverlay } from './SceneHitDebugOverlay';
import { rectToPercentStyle } from './SceneHitRegion';

type SlotProps = {
  slotRect: typeof LOBBY_DISPLAY_CASE_REGISTER_SLOT;
  zIndex: number;
  children: ReactNode;
};

type SlotDebugProps = SlotProps & {
  showDebug: boolean;
  debugLabel: string;
  debugOverlayStyle: CSSProperties;
};

function LobbyDisplayCaseSlot({
  slotRect,
  zIndex,
  children,
  showDebug,
  debugLabel,
  debugOverlayStyle,
}: SlotDebugProps) {
  return (
    <div
      style={{
        position: 'absolute',
        ...rectToPercentStyle(slotRect),
        zIndex,
        boxSizing: 'border-box',
        pointerEvents: 'none',
      }}
    >
      {showDebug ? (
        <SceneHitDebugOverlay
          rect={{ left: 0, top: 0, width: 1, height: 1 }}
          label={debugLabel}
          zIndex={0}
          overlayStyle={debugOverlayStyle}
        />
      ) : null}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          pointerEvents: 'auto',
        }}
      >
        {children}
      </div>
    </div>
  );
}

type Props = {
  viewportMeasureRef: RefObject<HTMLElement | null>;
  registerZIndex: number;
  phoneZIndex: number;
  register: ReactNode;
  phone: ReactNode;
  registerOpenArt?: ReactNode;
  phoneOpenArt?: ReactNode;
};

export function LobbyDisplayCaseShell({
  viewportMeasureRef,
  registerZIndex,
  phoneZIndex,
  register,
  phone,
  registerOpenArt,
  phoneOpenArt,
}: Props) {
  const mappedCase = useSceneCoverHitRect(
    FINAL_LOBBY_DISPLAY_CASE_RECT,
    viewportMeasureRef,
    LOBBY_DISPLAY_CASE_LAYOUT_OFFSET,
  );
  const showDebug = useLobbyDisplayCaseHitDebugEnabled();

  if (!mappedCase) return null;

  return (
    <>
      {showDebug ? (
        <SceneHitDebugOverlay
          rect={mappedCase}
          label="lobby display case"
          zIndex={Math.max(registerZIndex, phoneZIndex) + 1}
          layout={LOBBY_DISPLAY_CASE_HIT_LAYOUT}
          overlayStyle={{
            backgroundColor: 'rgba(255, 152, 0, 0.42)',
            border: '2px solid rgba(230, 81, 0, 0.95)',
          }}
        />
      ) : null}
      <div
        data-lobby-display-case
        style={{
          position: 'absolute',
          ...sceneHitLayoutBoxStyle(mappedCase, LOBBY_DISPLAY_CASE_HIT_LAYOUT),
          zIndex: Math.max(registerZIndex, phoneZIndex),
          ...LOBBY_CASE_CONTAINER_STYLE,
          pointerEvents: 'none',
        }}
      >
        <LobbyDisplayCaseSlot
          slotRect={LOBBY_DISPLAY_CASE_REGISTER_SLOT}
          zIndex={registerZIndex}
          showDebug={showDebug}
          debugLabel="display case register"
          debugOverlayStyle={{
            backgroundColor: 'rgba(0, 174, 239, 0.48)',
            border: '2px solid rgba(0, 120, 200, 0.95)',
          }}
        >
          {registerOpenArt}
          {register}
        </LobbyDisplayCaseSlot>
        <LobbyDisplayCaseSlot
          slotRect={LOBBY_DISPLAY_CASE_PHONE_SLOT}
          zIndex={phoneZIndex}
          showDebug={showDebug}
          debugLabel="display case phone"
          debugOverlayStyle={{
            backgroundColor: 'rgba(255, 235, 59, 0.48)',
            border: '2px solid rgba(245, 127, 23, 0.95)',
          }}
        >
          {phoneOpenArt}
          {phone}
        </LobbyDisplayCaseSlot>
      </div>
    </>
  );
}
