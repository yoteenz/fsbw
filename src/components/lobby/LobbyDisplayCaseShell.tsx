import type { ReactNode, RefObject } from 'react';
import {
  FINAL_LOBBY_DISPLAY_CASE_RECT,
  LOBBY_DISPLAY_CASE_LAYOUT_OFFSET,
  LOBBY_DISPLAY_CASE_PHONE_SLOT,
  LOBBY_DISPLAY_CASE_REGISTER_SLOT,
} from '../../constants/lobbyDisplayCaseLayout';
import { useSceneCoverHitRect } from '../../hooks/useSceneCoverHitRect';
import { useLobbyDisplayCaseHitDebugEnabled } from '../../utils/sceneHitDebug';
import { LOBBY_CASE_CONTAINER_STYLE } from './lobbyCaseResponsive';
import { rectToPercentStyle } from './SceneHitRegion';

type SlotProps = {
  slotRect: typeof LOBBY_DISPLAY_CASE_REGISTER_SLOT;
  zIndex: number;
  children: ReactNode;
};

function LobbyDisplayCaseSlot({ slotRect, zIndex, children }: SlotProps) {
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

/**
 * Transparent scene-locked box for the lobby acrylic display case on `final-lobby.png`.
 * Register and phone slots are positioned in % inside the case so they stay on the art.
 */
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
    <div
      data-lobby-display-case
      style={{
        position: 'absolute',
        ...rectToPercentStyle(mappedCase),
        zIndex: Math.max(registerZIndex, phoneZIndex),
        ...LOBBY_CASE_CONTAINER_STYLE,
        pointerEvents: 'none',
        background: showDebug ? 'rgba(235, 28, 36, 0.08)' : 'transparent',
        outline: showDebug ? '1px dashed rgba(235, 28, 36, 0.55)' : 'none',
      }}
    >
      <LobbyDisplayCaseSlot slotRect={LOBBY_DISPLAY_CASE_REGISTER_SLOT} zIndex={registerZIndex}>
        {registerOpenArt}
        {register}
      </LobbyDisplayCaseSlot>
      <LobbyDisplayCaseSlot slotRect={LOBBY_DISPLAY_CASE_PHONE_SLOT} zIndex={phoneZIndex}>
        {phoneOpenArt}
        {phone}
      </LobbyDisplayCaseSlot>
    </div>
  );
}
