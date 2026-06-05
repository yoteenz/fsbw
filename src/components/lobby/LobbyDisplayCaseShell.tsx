import type { CSSProperties, ReactNode, RefObject } from 'react';
import { FINAL_LOBBY_DISPLAY_CASE_RECT, FINAL_LOBBY_HIT_REGIONS } from '../../constants/finalLobbySceneAssets';
import { useSceneCoverHitRect } from '../../hooks/useSceneCoverHitRect';
import { useLobbyDisplayCaseHitDebugEnabled } from '../../utils/sceneHitDebug';
import { sceneHitLayoutBoxStyle, type SceneHitLayoutOptions } from '../../utils/sceneHitLayout';
import { useSceneHitRegionConfig } from './SceneHitLayoutEditorContext';
import { LOBBY_CASE_CONTAINER_STYLE } from './lobbyCaseResponsive';
import { SceneHitDebugOverlay } from './SceneHitDebugOverlay';

type PropSlotProps = {
  mappedRect: { left: number; top: number; width: number; height: number };
  layout: SceneHitLayoutOptions;
  zIndex: number;
  children: ReactNode;
};

function LobbyDisplayCasePropSlot({ mappedRect, layout, zIndex, children }: PropSlotProps) {
  return (
    <div
      style={{
        ...sceneHitLayoutBoxStyle(mappedRect, 0, 0, layout),
        zIndex,
        ...LOBBY_CASE_CONTAINER_STYLE,
        pointerEvents: 'none',
        boxSizing: 'border-box',
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
 * Lobby acrylic display case on `final-lobby.png`.
 * Register and phone are scene-mapped independently (not nested in the orange case box).
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
  const displayCaseRegion = useSceneHitRegionConfig('lobby-display-case');
  const registerRegion = useSceneHitRegionConfig('lobby-display-case-register');
  const phoneRegion = useSceneHitRegionConfig('lobby-display-case-phone');

  const mappedCase = useSceneCoverHitRect(
    FINAL_LOBBY_DISPLAY_CASE_RECT,
    viewportMeasureRef,
    displayCaseRegion.coverOffset,
  );
  const mappedRegister = useSceneCoverHitRect(
    FINAL_LOBBY_HIT_REGIONS.caseRegister,
    viewportMeasureRef,
    registerRegion.coverOffset,
  );
  const mappedPhone = useSceneCoverHitRect(
    FINAL_LOBBY_HIT_REGIONS.casePhone,
    viewportMeasureRef,
    phoneRegion.coverOffset,
  );

  const showDebug = useLobbyDisplayCaseHitDebugEnabled();

  if (!mappedCase || !mappedRegister || !mappedPhone) return null;

  const topZ = Math.max(registerZIndex, phoneZIndex);
  const registerDebugStyle: CSSProperties = {
    backgroundColor: 'rgba(0, 174, 239, 0.48)',
    border: '2px solid rgba(0, 120, 200, 0.95)',
  };
  const phoneDebugStyle: CSSProperties = {
    backgroundColor: 'rgba(255, 235, 59, 0.48)',
    border: '2px solid rgba(245, 127, 23, 0.95)',
  };

  return (
    <>
      {showDebug ? (
        <SceneHitDebugOverlay
          regionId="lobby-display-case"
          rect={mappedCase}
          label="lobby display case"
          zIndex={topZ + 1}
          layout={displayCaseRegion.layout}
          overlayStyle={{
            backgroundColor: 'rgba(255, 152, 0, 0.42)',
            border: '2px solid rgba(230, 81, 0, 0.95)',
          }}
        />
      ) : null}

      {showDebug ? (
        <>
          <SceneHitDebugOverlay
            regionId="lobby-display-case-register"
            rect={mappedRegister}
            label="display case register"
            zIndex={topZ + 3}
            layout={registerRegion.layout}
            overlayStyle={registerDebugStyle}
          />
          <SceneHitDebugOverlay
            regionId="lobby-display-case-phone"
            rect={mappedPhone}
            label="display case phone"
            zIndex={topZ + 3}
            layout={phoneRegion.layout}
            overlayStyle={phoneDebugStyle}
          />
        </>
      ) : null}

      <LobbyDisplayCasePropSlot
        mappedRect={mappedRegister}
        layout={registerRegion.layout}
        zIndex={registerZIndex}
      >
        {registerOpenArt}
        {register}
      </LobbyDisplayCasePropSlot>

      <LobbyDisplayCasePropSlot mappedRect={mappedPhone} layout={phoneRegion.layout} zIndex={phoneZIndex}>
        {phoneOpenArt}
        {phone}
      </LobbyDisplayCasePropSlot>
    </>
  );
}
