import { useCallback, useEffect, useState, type RefObject } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FINAL_LOBBY_CASE_PROP_OPEN_OVERLAY_SRCS,
  FINAL_LOBBY_PHONE_OPEN_OVERLAY_RECT,
  FINAL_LOBBY_PHONE_OPEN_OVERLAY_SRC,
  FINAL_LOBBY_REGISTER_OPEN_OVERLAY_RECT,
  FINAL_LOBBY_REGISTER_OPEN_OVERLAY_SRC,
} from '../../constants/finalLobbyCasePropOverlays';
import { FINAL_LOBBY_HIT_REGIONS } from '../../constants/finalLobbySceneAssets';
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
import { LobbyCasePropOpenArt } from './LobbyCasePropOpenArt';
import { LobbyCasePropPopover } from './LobbyCasePropPopover';
import { rectToPercentStyle, SceneHitRegion } from './SceneHitRegion';

type Props = {
  onNavigateNext?: () => void;
  /** {@link SceneCarouselViewportStage} — cover-map open prop overlays. */
  viewportMeasureRef: RefObject<HTMLElement | null>;
};

export function LobbySceneHotspots({ onNavigateNext: _onNavigateNext, viewportMeasureRef }: Props) {
  const navigate = useNavigate();
  const [lobbyCasePopover, setLobbyCasePopover] = useState<'register' | 'phone' | null>(null);
  const closeLobbyCasePopover = useCallback(() => setLobbyCasePopover(null), []);

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

  return (
    <>
      <SceneHitRegion rect={FINAL_LOBBY_HIT_REGIONS.logo} ariaLabel="Go to shop" onActivate={goToHomeShop} zIndex={25} />
      <SceneHitRegion rect={FINAL_LOBBY_HIT_REGIONS.navShop} ariaLabel="Shop" onActivate={goToHomeShop} zIndex={30} />
      <SceneHitRegion rect={FINAL_LOBBY_HIT_REGIONS.navTools} ariaLabel="Tools" onActivate={goToHomeTools} zIndex={30} />
      <SceneHitRegion
        rect={FINAL_LOBBY_HIT_REGIONS.navBooking}
        ariaLabel="Premium booking"
        onActivate={goToBooking}
        zIndex={30}
      />
      <SceneHitRegion
        rect={FINAL_LOBBY_HIT_REGIONS.shelfHdLace}
        ariaLabel="Shop HD lace frontals"
        onActivate={goToShopFrontals}
        zIndex={22}
      />
      <SceneHitRegion
        rect={FINAL_LOBBY_HIT_REGIONS.shelfBundles}
        ariaLabel="Shop bundles"
        onActivate={goToShopBundles}
        zIndex={22}
      />
      <SceneHitRegion
        rect={FINAL_LOBBY_HIT_REGIONS.shelfCustomUnits}
        ariaLabel="Shop custom units"
        onActivate={goToShopUnits}
        zIndex={22}
      />

      {lobbyCasePopover !== null ? (
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
          }}
        />
      ) : null}

      <LobbyCasePropOpenArt
        visible={lobbyCasePopover === 'register'}
        src={FINAL_LOBBY_REGISTER_OPEN_OVERLAY_SRC}
        imageRect={FINAL_LOBBY_REGISTER_OPEN_OVERLAY_RECT}
        viewportMeasureRef={viewportMeasureRef}
      />
      <LobbyCasePropOpenArt
        visible={lobbyCasePopover === 'phone'}
        src={FINAL_LOBBY_PHONE_OPEN_OVERLAY_SRC}
        imageRect={FINAL_LOBBY_PHONE_OPEN_OVERLAY_RECT}
        viewportMeasureRef={viewportMeasureRef}
      />

      <div
        style={{
          ...rectToPercentStyle(FINAL_LOBBY_HIT_REGIONS.caseRegister),
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

      <div
        style={{
          ...rectToPercentStyle(FINAL_LOBBY_HIT_REGIONS.casePhone),
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

    </>
  );
}
