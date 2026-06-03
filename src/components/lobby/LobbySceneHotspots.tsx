import { useCallback, useEffect, type RefObject } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LobbyCasePopoverId } from '../../constants/lobbyCasePopover';
import {
  FINAL_LOBBY_CASE_PROP_OPEN_OVERLAY_SRCS,
  FINAL_LOBBY_PHONE_OPEN_OVERLAY_RECT,
  FINAL_LOBBY_PHONE_OPEN_OVERLAY_SRC,
  FINAL_LOBBY_REGISTER_OPEN_OVERLAY_RECT,
  FINAL_LOBBY_REGISTER_OPEN_OVERLAY_SRC,
  LOBBY_CASE_PROP_PHONE_LAYOUT_OFFSET,
  LOBBY_CASE_PROP_PHONE_OPEN_OVERLAY_SCALE,
  LOBBY_CASE_PROP_REGISTER_LAYOUT_OFFSET,
  LOBBY_CASE_PROP_REGISTER_OPEN_OVERLAY_SCALE,
} from '../../constants/finalLobbyCasePropOverlays';
import { FINAL_LOBBY_HIT_REGIONS } from '../../constants/finalLobbySceneAssets';
import { useSceneCoverHitRect } from '../../hooks/useSceneCoverHitRect';
import {
  LOBBY_CASE_POPOVER_OPEN_Z_INDEX,
  LOBBY_CASE_POPOVER_PHONE_OFFSET_UP_PX,
  LOBBY_CASE_POPOVER_REGISTER_OFFSET_UP_PX,
  LOBBY_CASE_POPOVER_SCRIM_ALPHA,
  LOBBY_CASE_POPOVER_SCRIM_BACKDROP_BLUR,
  LOBBY_CASE_POPOVER_SCRIM_SLIDE_Z_INDEX,
} from '../../constants/lobbyPaymentIcons';
import {
  LOBBY_PHONE_POPOVER_SECTIONS,
  LOBBY_PHONE_POPOVER_TITLE,
  LOBBY_REGISTER_POPOVER_TITLE,
} from '../../constants/lobbyPropPopoverCopy';
import { LOBBY_PAYMENT_POPOVER_LAYOUT } from '../../constants/lobbyPaymentIcons';
import { BOOKING_PATHS } from '../../utils/membershipRoutePolicy';
import { useLobbyShelfHitDebugEnabled } from '../../utils/sceneHitDebug';
import { LobbyCasePropOpenArt } from './LobbyCasePropOpenArt';
import { LobbyCasePropPopover } from './LobbyCasePropPopover';
import { SceneHitDebugBanner } from './SceneHitDebugBanner';
import { rectToPercentStyle, SceneHitRegion } from './SceneHitRegion';

type Props = {
  onNavigateNext?: () => void;
  /** {@link SceneCarouselViewportStage} — cover-map open prop overlays. */
  viewportMeasureRef: RefObject<HTMLElement | null>;
  casePopover: LobbyCasePopoverId | null;
  onCasePopoverChange: (id: LobbyCasePopoverId | null) => void;
};

export function LobbySceneHotspots({
  onNavigateNext: _onNavigateNext,
  viewportMeasureRef,
  casePopover: lobbyCasePopover,
  onCasePopoverChange: setLobbyCasePopover,
}: Props) {
  const navigate = useNavigate();
  const closeLobbyCasePopover = useCallback(() => setLobbyCasePopover(null), [setLobbyCasePopover]);

  useEffect(() => {
    for (const src of FINAL_LOBBY_CASE_PROP_OPEN_OVERLAY_SRCS) {
      const img = new Image();
      img.src = src;
    }
  }, []);

  const goToHomeShop = useCallback(() => navigate('/home/shop'), [navigate]);
  const goToHomeTools = useCallback(() => navigate('/home/tools'), [navigate]);
  const goToShopFrontals = useCallback(() => navigate('/shop/frontals'), [navigate]);
  const goToShopBundles = useCallback(() => navigate('/shop/bundles'), [navigate]);
  const goToShopUnits = useCallback(() => navigate('/shop/units'), [navigate]);
  const goToBooking = useCallback(() => navigate(BOOKING_PATHS.PREMIUM_APPOINTMENT), [navigate]);

  const registerAnchorRect = useSceneCoverHitRect(
    FINAL_LOBBY_HIT_REGIONS.caseRegister,
    viewportMeasureRef,
    LOBBY_CASE_PROP_REGISTER_LAYOUT_OFFSET,
  );
  const phoneAnchorRect = useSceneCoverHitRect(
    FINAL_LOBBY_HIT_REGIONS.casePhone,
    viewportMeasureRef,
    LOBBY_CASE_PROP_PHONE_LAYOUT_OFFSET,
  );
  const shelfHdLaceRect = useSceneCoverHitRect(
    FINAL_LOBBY_HIT_REGIONS.shelfHdLace,
    viewportMeasureRef,
  );
  const shelfBundlesRect = useSceneCoverHitRect(
    FINAL_LOBBY_HIT_REGIONS.shelfBundles,
    viewportMeasureRef,
  );
  const shelfCustomUnitsRect = useSceneCoverHitRect(
    FINAL_LOBBY_HIT_REGIONS.shelfCustomUnits,
    viewportMeasureRef,
  );

  const lobbyLinksLocked = lobbyCasePopover !== null;
  const shelfHitDebug = useLobbyShelfHitDebugEnabled();

  return (
    <>
      <SceneHitDebugBanner active={shelfHitDebug}>
        Hit debug ON — colored boxes on lobby mannequin shelves (HD lace / bundles / custom units).
        Add <strong>?sceneHitDebug=0</strong> to turn off.
      </SceneHitDebugBanner>
      <SceneHitRegion
        rect={FINAL_LOBBY_HIT_REGIONS.logo}
        ariaLabel="Go to shop"
        onActivate={goToHomeShop}
        zIndex={25}
        disabled={lobbyLinksLocked}
      />
      <SceneHitRegion
        rect={FINAL_LOBBY_HIT_REGIONS.navShop}
        ariaLabel="Shop"
        onActivate={goToHomeShop}
        zIndex={30}
        disabled={lobbyLinksLocked}
      />
      <SceneHitRegion
        rect={FINAL_LOBBY_HIT_REGIONS.navTools}
        ariaLabel="Tools"
        onActivate={goToHomeTools}
        zIndex={30}
        disabled={lobbyLinksLocked}
      />
      <SceneHitRegion
        rect={FINAL_LOBBY_HIT_REGIONS.navBooking}
        ariaLabel="Premium booking"
        onActivate={goToBooking}
        zIndex={30}
        disabled={lobbyLinksLocked}
      />
      {shelfHdLaceRect ? (
        <SceneHitRegion
          rect={shelfHdLaceRect}
          ariaLabel="Shop HD lace frontals"
          onActivate={goToShopFrontals}
          zIndex={shelfHitDebug ? 26 : 22}
          disabled={lobbyLinksLocked}
          debugOverlay={shelfHitDebug}
          debugLabel="hd lace → /shop/frontals"
          debugOverlayStyle={{
            backgroundColor: 'rgba(0, 174, 239, 0.48)',
            border: '2px solid rgba(0, 120, 200, 0.95)',
          }}
        />
      ) : null}
      {shelfBundlesRect ? (
        <SceneHitRegion
          rect={shelfBundlesRect}
          ariaLabel="Shop bundles"
          onActivate={goToShopBundles}
          zIndex={shelfHitDebug ? 26 : 22}
          disabled={lobbyLinksLocked}
          debugOverlay={shelfHitDebug}
          debugLabel="bundles → /shop/bundles"
          debugOverlayStyle={{
            backgroundColor: 'rgba(76, 175, 80, 0.48)',
            border: '2px solid rgba(46, 125, 50, 0.95)',
          }}
        />
      ) : null}
      {shelfCustomUnitsRect ? (
        <SceneHitRegion
          rect={shelfCustomUnitsRect}
          ariaLabel="Shop custom units"
          onActivate={goToShopUnits}
          zIndex={shelfHitDebug ? 26 : 22}
          disabled={lobbyLinksLocked}
          debugOverlay={shelfHitDebug}
          debugLabel="custom units → /shop/units"
          debugOverlayStyle={{
            backgroundColor: 'rgba(235, 28, 36, 0.42)',
            border: '2px solid rgba(180, 20, 30, 0.95)',
          }}
        />
      ) : null}

      {lobbyLinksLocked ? (
        <div
          role="presentation"
          aria-hidden
          onClick={closeLobbyCasePopover}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: `rgba(0, 0, 0, ${LOBBY_CASE_POPOVER_SCRIM_ALPHA})`,
            backdropFilter: LOBBY_CASE_POPOVER_SCRIM_BACKDROP_BLUR,
            WebkitBackdropFilter: LOBBY_CASE_POPOVER_SCRIM_BACKDROP_BLUR,
            zIndex: LOBBY_CASE_POPOVER_SCRIM_SLIDE_Z_INDEX,
            pointerEvents: 'auto',
          }}
        />
      ) : null}

      <LobbyCasePropOpenArt
        visible={lobbyCasePopover === 'register'}
        src={FINAL_LOBBY_REGISTER_OPEN_OVERLAY_SRC}
        imageRect={FINAL_LOBBY_REGISTER_OPEN_OVERLAY_RECT}
        viewportMeasureRef={viewportMeasureRef}
        layoutOffset={LOBBY_CASE_PROP_REGISTER_LAYOUT_OFFSET}
        overlayScale={LOBBY_CASE_PROP_REGISTER_OPEN_OVERLAY_SCALE}
      />
      <LobbyCasePropOpenArt
        visible={lobbyCasePopover === 'phone'}
        src={FINAL_LOBBY_PHONE_OPEN_OVERLAY_SRC}
        imageRect={FINAL_LOBBY_PHONE_OPEN_OVERLAY_RECT}
        viewportMeasureRef={viewportMeasureRef}
        layoutOffset={LOBBY_CASE_PROP_PHONE_LAYOUT_OFFSET}
        overlayScale={LOBBY_CASE_PROP_PHONE_OPEN_OVERLAY_SCALE}
      />

      {registerAnchorRect ? (
      <div
        style={{
          ...rectToPercentStyle(registerAnchorRect),
          position: 'absolute',
          zIndex: lobbyCasePopover === 'register' ? LOBBY_CASE_POPOVER_OPEN_Z_INDEX : 24,
        }}
      >
        <LobbyCasePropPopover
          popoverId="register"
          activeId={lobbyCasePopover}
          onActivate={(id) => {
            if (id === 'register' || id === 'phone') setLobbyCasePopover(id);
          }}
          onClose={closeLobbyCasePopover}
          ariaLabel="View accepted payment methods"
          title={LOBBY_REGISTER_POPOVER_TITLE}
          paymentLayout={LOBBY_PAYMENT_POPOVER_LAYOUT}
          align="left"
          panelOffsetUpPx={LOBBY_CASE_POPOVER_REGISTER_OFFSET_UP_PX}
        >
          <span style={{ display: 'block', width: '100%', height: '100%', minHeight: 44 }} aria-hidden />
        </LobbyCasePropPopover>
      </div>
      ) : null}

      {phoneAnchorRect ? (
      <div
        style={{
          ...rectToPercentStyle(phoneAnchorRect),
          position: 'absolute',
          zIndex: lobbyCasePopover === 'phone' ? LOBBY_CASE_POPOVER_OPEN_Z_INDEX : 24,
        }}
      >
        <LobbyCasePropPopover
          popoverId="phone"
          activeId={lobbyCasePopover}
          onActivate={(id) => {
            if (id === 'register' || id === 'phone') setLobbyCasePopover(id);
          }}
          onClose={closeLobbyCasePopover}
          ariaLabel="View business contact information"
          title={LOBBY_PHONE_POPOVER_TITLE}
          sections={LOBBY_PHONE_POPOVER_SECTIONS}
          align="right"
          panelOffsetUpPx={LOBBY_CASE_POPOVER_PHONE_OFFSET_UP_PX}
        >
          <span style={{ display: 'block', width: '100%', height: '100%', minHeight: 44 }} aria-hidden />
        </LobbyCasePropPopover>
      </div>
      ) : null}

    </>
  );
}
