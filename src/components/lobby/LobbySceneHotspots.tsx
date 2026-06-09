import { useCallback, useEffect, type RefObject } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LobbyCasePopoverId } from '../../constants/lobbyCasePopover';
import {
  FINAL_LOBBY_CASE_PROP_OPEN_OVERLAY_SRCS,
  FINAL_LOBBY_PHONE_OPEN_OVERLAY_SRC,
  FINAL_LOBBY_REGISTER_OPEN_OVERLAY_SRC,
  LOBBY_CASE_PROP_PHONE_OPEN_OVERLAY_SCALE,
  LOBBY_CASE_PROP_REGISTER_OPEN_OVERLAY_SCALE,
} from '../../constants/finalLobbyCasePropOverlays';
import {
  FINAL_LOBBY_HIT_REGIONS,
  LOBBY_SHELF_HIT_LAYOUT_BUNDLES_OFFSET_Y_PX,
  LOBBY_SHELF_HIT_LAYOUT_CUSTOM_UNITS_OFFSET_Y_PX,
  LOBBY_SHELF_HIT_LAYOUT_HD_LACE_OFFSET_Y_PX,
  LOBBY_SHELF_HIT_LAYOUT_HEIGHT_SCALE,
  LOBBY_SHELF_HIT_LAYOUT_HEIGHT_TRIM_PX,
  LOBBY_SHELF_HIT_LAYOUT_OFFSET_X_PX,
  LOBBY_SHELF_HIT_LAYOUT_WIDTH_SCALE,
} from '../../constants/finalLobbySceneAssets';
import { useSceneCoverHitRect } from '../../hooks/useSceneCoverHitRect';
import {
  LOBBY_CASE_POPOVER_OPEN_Z_INDEX,
  LOBBY_CASE_POPOVER_PHONE_ROOT_Z_INDEX,
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
import {
  LOBBY_CASE_POPOVER_PHONE_GAP_ABOVE_PROP,
  LOBBY_CASE_POPOVER_PHONE_OFFSET_UP,
  LOBBY_CASE_POPOVER_REGISTER_OFFSET_UP,
} from './lobbyCaseResponsive';
import { LobbyCasePropOpenArt } from './LobbyCasePropOpenArt';
import { LobbyCasePropPopover } from './LobbyCasePropPopover';
import { LobbyDisplayCaseShell } from './LobbyDisplayCaseShell';
import { SceneHitDebugBanner } from './SceneHitDebugBanner';
import { SceneHitRegion } from './SceneHitRegion';

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
  const shelfLayoutScale = {
    x: LOBBY_SHELF_HIT_LAYOUT_WIDTH_SCALE,
    y: LOBBY_SHELF_HIT_LAYOUT_HEIGHT_SCALE,
  };

  return (
    <>
      <SceneHitDebugBanner active={shelfHitDebug}>
        Hit debug ON — cyan/green/red shelves; orange display case (independent cyan register + yellow phone on top). Lounge
        TV: swipe to lounge slide.
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
          zIndex={shelfHitDebug ? 40 : 22}
          disabled={lobbyLinksLocked}
          debugOverlay={shelfHitDebug}
          debugLabel="hd lace → /shop/frontals"
          debugOverlayStyle={{
            backgroundColor: 'rgba(0, 174, 239, 0.48)',
            border: '2px solid rgba(0, 120, 200, 0.95)',
          }}
          layoutOffsetX={LOBBY_SHELF_HIT_LAYOUT_OFFSET_X_PX}
          layoutOffsetY={LOBBY_SHELF_HIT_LAYOUT_HD_LACE_OFFSET_Y_PX}
          layoutHeightTrimPx={LOBBY_SHELF_HIT_LAYOUT_HEIGHT_TRIM_PX}
          layoutScale={shelfLayoutScale}
        />
      ) : null}
      {shelfBundlesRect ? (
        <SceneHitRegion
          rect={shelfBundlesRect}
          ariaLabel="Shop bundles"
          onActivate={goToShopBundles}
          zIndex={shelfHitDebug ? 40 : 22}
          disabled={lobbyLinksLocked}
          debugOverlay={shelfHitDebug}
          debugLabel="bundles → /shop/bundles"
          debugOverlayStyle={{
            backgroundColor: 'rgba(76, 175, 80, 0.48)',
            border: '2px solid rgba(46, 125, 50, 0.95)',
          }}
          layoutOffsetX={LOBBY_SHELF_HIT_LAYOUT_OFFSET_X_PX}
          layoutOffsetY={LOBBY_SHELF_HIT_LAYOUT_BUNDLES_OFFSET_Y_PX}
          layoutHeightTrimPx={LOBBY_SHELF_HIT_LAYOUT_HEIGHT_TRIM_PX}
          layoutScale={shelfLayoutScale}
        />
      ) : null}
      {shelfCustomUnitsRect ? (
        <SceneHitRegion
          rect={shelfCustomUnitsRect}
          ariaLabel="Shop custom units"
          onActivate={goToShopUnits}
          zIndex={shelfHitDebug ? 40 : 22}
          disabled={lobbyLinksLocked}
          debugOverlay={shelfHitDebug}
          debugLabel="custom units → /shop/units"
          debugOverlayStyle={{
            backgroundColor: 'rgba(235, 28, 36, 0.42)',
            border: '2px solid rgba(180, 20, 30, 0.95)',
          }}
          layoutOffsetX={LOBBY_SHELF_HIT_LAYOUT_OFFSET_X_PX}
          layoutOffsetY={LOBBY_SHELF_HIT_LAYOUT_CUSTOM_UNITS_OFFSET_Y_PX}
          layoutHeightTrimPx={LOBBY_SHELF_HIT_LAYOUT_HEIGHT_TRIM_PX}
          layoutScale={shelfLayoutScale}
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

      <LobbyDisplayCaseShell
        viewportMeasureRef={viewportMeasureRef}
        registerZIndex={
          lobbyCasePopover === 'register' ? LOBBY_CASE_POPOVER_OPEN_Z_INDEX : 24
        }
        phoneZIndex={lobbyCasePopover === 'phone' ? LOBBY_CASE_POPOVER_OPEN_Z_INDEX : 24}
        registerOpenArt={
          <LobbyCasePropOpenArt
            visible={lobbyCasePopover === 'register'}
            src={FINAL_LOBBY_REGISTER_OPEN_OVERLAY_SRC}
            fillParent
            overlayScale={LOBBY_CASE_PROP_REGISTER_OPEN_OVERLAY_SCALE}
          />
        }
        phoneOpenArt={
          <LobbyCasePropOpenArt
            visible={lobbyCasePopover === 'phone'}
            src={FINAL_LOBBY_PHONE_OPEN_OVERLAY_SRC}
            fillParent
            overlayScale={LOBBY_CASE_PROP_PHONE_OPEN_OVERLAY_SCALE}
            paintAbovePopover
          />
        }
        register={
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
            responsive
            panelOffsetUp={LOBBY_CASE_POPOVER_REGISTER_OFFSET_UP}
          >
            <span
              style={{ display: 'block', width: '100%', height: '100%', minHeight: 44 }}
              aria-hidden
            />
          </LobbyCasePropPopover>
        }
        phone={
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
            responsive
            panelGapAboveProp={LOBBY_CASE_POPOVER_PHONE_GAP_ABOVE_PROP}
            panelOffsetUp={LOBBY_CASE_POPOVER_PHONE_OFFSET_UP}
            openRootZIndex={LOBBY_CASE_POPOVER_PHONE_ROOT_Z_INDEX}
          >
            <span
              style={{ display: 'block', width: '100%', height: '100%', minHeight: 44 }}
              aria-hidden
            />
          </LobbyCasePropPopover>
        }
      />

    </>
  );
}
