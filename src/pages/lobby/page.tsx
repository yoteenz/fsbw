import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  lobbyCarouselIndexFromPath,
  lobbyCarouselPathFromIndex,
} from '../../utils/lobbyCarouselRoutes';
import LoadingScreen from '../../components/base/LoadingScreen';
import ConfirmationModal from '../../components/ConfirmationModal';
import { onSignInSuccess } from '../../utils/adminAuth';
import { isPremiumMemberForGatedFeatures, prepareMembershipUpgradeNavigation } from '../../utils/premiumMemberAccess';
import { BOOKING_PATHS } from '../../utils/membershipRoutePolicy';
import { getSupabase, isSupabaseConfigured, signOutIfSessionEmailUnconfirmed } from '../../utils/supabase';
import {
  syncAllFromApi,
  buildMinimalUserFromSupabaseSession,
  applyMinimalUserToStorage,
  buildProfilePayloadForBackend,
  didLastProfileSyncError,
} from '../../utils/syncFromApi';
import { registerServerSessionCookie } from '../../utils/sessionRestore';
import {
  loungePageMinHeightCss,
  loungeSalonChairsAnchorStyle,
  loungeSalonChairsImageStyle,
  useLoungeLargeViewport,
} from '../../utils/loungeSceneLayout';
import {
  loungeSceneBackgroundPositionY,
  sceneCarouselBackgroundLayerStyle,
  sceneCarouselSlideMinHeightCss,
} from '../../utils/sceneCarouselBackground';
import { LobbyCasePropPopover } from '../../components/lobby/LobbyCasePropPopover';
import { LobbyLoungeTransitionVideo } from '../../components/lobby/LobbyLoungeTransitionVideo';
import { LoungeTvOverlay } from '../../components/lounge/LoungeTvOverlay';
import { isLobbyTransitionVideoEnabledFromSearch } from '../../constants/lobbyLoungeTransitionVideo';
import { LobbyAssetDownloadAnchor, LobbyAssetDownloadLink } from '../../components/lobby/LobbyAssetDownloadLink';
import { LOBBY_PHONE_SRC } from '../../constants/lobbyCaseAssets';
import { useLobbyAssetDownloadsVisible } from '../../hooks/useLobbyAssetDownloadsVisible';
import {
  LOBBY_CASE_PHONE_DOWNLOAD_SRC,
  LOBBY_CASE_REGISTER_SRC,
  LOBBY_CASE_SRC,
  LOBBY_NEON_BOOKING_FALLBACK_SRC,
  LOBBY_NEON_BOOKING_SRC,
  LOBBY_NEON_LOGO_SRC,
  LOBBY_NEON_PRODUCTS_SRC,
  LOBBY_NEON_TOOLS_SRC,
  LOBBY_ROSE_BACKGROUND_SRC,
  LOBBY_SCENE_FAL_PROMPTS,
  LOBBY_SHELF_CUSTOM_SRC,
  LOBBY_SHELF_HD_SRC,
  LOBBY_SHELF_TRANSPARENT_SRC,
} from '../../constants/lobbySceneAssets';
import {
  LOUNGE_CURTAIN_LEFT_SRC,
  LOUNGE_CURTAIN_RIGHT_SRC,
  LOUNGE_NEON_LOGO_SRC,
  LOUNGE_BACKGROUND_SRC,
  LOUNGE_SALON_CHAIRS_SRC,
  LOUNGE_SCENE_FAL_PROMPTS,
  LOUNGE_TV_REMOTE_HAND_SRC,
} from '../../constants/loungeSceneAssets';
import { LOBBY_PAYMENT_POPOVER_LAYOUT } from '../../constants/lobbyPaymentIcons';
import {
  LOBBY_PHONE_POPOVER_SECTIONS,
  LOBBY_PHONE_POPOVER_TITLE,
  LOBBY_REGISTER_POPOVER_TITLE,
} from '../../constants/lobbyPropPopoverCopy';
import {
  LOUNGE_LOBBY_TV_EXTRA_FRAME_WIDTH_PX,
  LOUNGE_TV_PLAY_BUTTON_COLOR,
  LoungeTvFrame,
  loungeTvDimensionsFromFrameHeight,
} from '../../components/lounge/loungeTvFrame';

// Lobby Component
const LobbyPage: React.FC = () => {
  const navigate = useNavigate();
  const showAssetDownloads = useLobbyAssetDownloadsVisible();

  // After email confirm Supabase redirects to Site URL (often /). Recover session here so user is signed in.
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = getSupabase();
    if (!supabase) return;
    let cancelled = false;
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (cancelled) return;
      if (await signOutIfSessionEmailUnconfirmed(supabase, session)) return;
      if (!session) return;
      // Already signed in locally with same user – no need to re-sync
      try {
        const cur = localStorage.getItem('currentUser');
        if (cur) {
          const parsed = JSON.parse(cur);
          if (parsed?.email && (session.user?.email || '').toLowerCase() === (parsed.email as string).toLowerCase()) return;
        }
      } catch (_) {}
      syncAllFromApi().then(async (profile) => {
        if (cancelled) return;
        if (profile) {
          localStorage.setItem('isSignedIn', 'true');
          onSignInSuccess('session_restore'); // Face ID / Supabase cookie from lobby
          registerServerSessionCookie(session.access_token, session.refresh_token);
          window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'true' }));
          navigate('/account', { replace: true });
          return;
        }
        const minimal = buildMinimalUserFromSupabaseSession(session.user);
        applyMinimalUserToStorage(minimal);
        onSignInSuccess('session_restore');
        registerServerSessionCookie(session.access_token, session.refresh_token);
        if (!didLastProfileSyncError()) {
          const { patchProfile } = await import('../../utils/api');
          await patchProfile(buildProfilePayloadForBackend(minimal)).catch(() => {});
        }
        window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'true' }));
        navigate('/account', { replace: true });
      });
    });
    return () => { cancelled = true; };
  }, [navigate]);
  
  // Ensure we're on the root route
  useEffect(() => {
    console.log('✅ LobbyPage useEffect - pathname:', window.location.pathname);
    if (window.location.pathname !== '/') {
      console.warn('⚠️ LobbyPage rendered but pathname is not /:', window.location.pathname);
    }
  }, []);

  const handleNext = useCallback(() => {
    // This will be handled by parent component
    window.dispatchEvent(new CustomEvent('lobby-navigate-next'));
  }, []);

  const goToHomeShop = useCallback(() => {
    navigate('/home/shop');
  }, [navigate]);

  const goToHomeTools = useCallback(() => {
    navigate('/home/tools');
  }, [navigate]);

  const [bookingNeonSrc, setBookingNeonSrc] = useState(LOBBY_NEON_BOOKING_SRC);
  const [lobbyCasePopover, setLobbyCasePopover] = useState<'register' | 'phone' | null>(null);

  return (
    <div
      className="relative"
      style={{
        minHeight: sceneCarouselSlideMinHeightCss(),
        width: '100vw',
        flexShrink: 0,
        backgroundColor: '#ffffff',
      }}
    >
      {/* Background Image — same cover/top anchor as lounge for carousel alignment */}
      <div style={sceneCarouselBackgroundLayerStyle(LOBBY_ROSE_BACKGROUND_SRC)} />

      {showAssetDownloads ? (
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            zIndex: 500,
            pointerEvents: 'none',
          }}
        >
          <LobbyAssetDownloadLink
            href={LOBBY_ROSE_BACKGROUND_SRC}
            downloadFilename="landing-background.png"
            falPrompt={LOBBY_SCENE_FAL_PROMPTS.roseBackground}
            style={{ pointerEvents: 'auto' }}
          />
        </div>
      ) : null}
      
      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen" style={{ overflow: 'visible' }}>
        {/* Placeholder for logo to maintain flex flow */}
        <div style={{ height: '288px', width: '1px', opacity: 0, flexShrink: 0 }}>
          {/* Invisible spacer to maintain layout */}
        </div>
        
        {/* Neon Logo - Center - Absolute positioned to escape container */}
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, calc(-50% - 240px))', 
          zIndex: 20,
          width: 'fit-content'
        }}>
          <div style={{ position: 'relative', display: 'inline-block', lineHeight: 0 }}>
            {showAssetDownloads ? (
              <LobbyAssetDownloadLink
                href={LOBBY_NEON_LOGO_SRC}
                downloadFilename="neon-logo.png"
                falPrompt={LOBBY_SCENE_FAL_PROMPTS.neonLogo}
                style={{ position: 'absolute', top: 4, left: 0, zIndex: 60 }}
              />
            ) : null}
            <img
              src={LOBBY_NEON_LOGO_SRC}
              alt="Frontal Slayer"
              onClick={goToHomeShop}
              style={{ width: 'auto', height: '263px', maxWidth: 'none', display: 'block', cursor: 'pointer' }}
            />
          </div>
        </div>
        
        {/* Navigation Links Container */}
        <div
          className="flex flex-row justify-center items-center"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(calc(-50% + 51px), calc(-50% - 131px))',
            zIndex: 35,
            margin: 0,
            padding: 0,
            pointerEvents: 'none'
          }}
        >
          {/* Products → /home/shop (full asset is the hit target) */}
          <span
            role="button"
            tabIndex={0}
            onClick={goToHomeShop}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                goToHomeShop();
              }
            }}
            style={{
              position: 'relative',
              display: 'inline-block',
              flexShrink: 0,
              pointerEvents: 'auto',
              cursor: 'pointer',
              transform: 'translateX(4px)',
            }}
            aria-label="Go to shop"
          >
            {showAssetDownloads ? (
              <LobbyAssetDownloadLink
                href={LOBBY_NEON_PRODUCTS_SRC}
                downloadFilename="neon-products.png"
                falPrompt={LOBBY_SCENE_FAL_PROMPTS.neonProducts}
                style={{ position: 'absolute', top: -14, left: 0, zIndex: 50 }}
              />
            ) : null}
            <img
              src={LOBBY_NEON_PRODUCTS_SRC}
              alt=""
              draggable={false}
              style={{
                margin: 0,
                padding: 0,
                display: 'block',
                height: '41px',
                maxWidth: 'none',
                width: 'auto',
                pointerEvents: 'none',
                verticalAlign: 'top',
              }}
              aria-hidden
            />
          </span>
          {/* Tools → /home/tools (full asset is the hit target) */}
          <span
            role="button"
            tabIndex={0}
            onClick={goToHomeTools}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                goToHomeTools();
              }
            }}
            style={{
              position: 'relative',
              display: 'inline-block',
              flexShrink: 0,
              pointerEvents: 'auto',
              cursor: 'pointer',
              transform: 'translateX(-50px)',
              zIndex: 2,
            }}
            aria-label="Go to tools"
          >
            {showAssetDownloads ? (
              <LobbyAssetDownloadLink
                href={LOBBY_NEON_TOOLS_SRC}
                downloadFilename="neon-tools.png"
                falPrompt={LOBBY_SCENE_FAL_PROMPTS.neonTools}
                style={{ position: 'absolute', top: -14, left: 0, zIndex: 50 }}
              />
            ) : null}
            <img
              src={LOBBY_NEON_TOOLS_SRC}
              alt=""
              draggable={false}
              style={{
                margin: 0,
                padding: 0,
                display: 'block',
                height: '41px',
                maxWidth: 'none',
                width: 'auto',
                pointerEvents: 'none',
                verticalAlign: 'top',
              }}
              aria-hidden
            />
          </span>
          {/* Booking: to the right of tools (same kern as legacy PNG layout). PNG if present in public/assets; else SVG. */}
          <span
            style={{
              position: 'relative',
              display: 'inline-flex',
              flexShrink: 0,
              transform: 'translateX(-104px)',
              pointerEvents: 'auto',
              alignItems: 'center',
            }}
          >
            {showAssetDownloads ? (
              <LobbyAssetDownloadLink
                href={bookingNeonSrc}
                downloadFilename={
                  bookingNeonSrc.endsWith('.svg') ? 'neon-booking.svg' : 'neon-booking.png'
                }
                falPrompt={LOBBY_SCENE_FAL_PROMPTS.neonBooking}
                style={{ position: 'absolute', top: -14, right: 0, zIndex: 50 }}
              />
            ) : null}
            <img
              src={bookingNeonSrc}
              alt=""
              onError={() => {
                if (bookingNeonSrc.endsWith('.png')) setBookingNeonSrc(LOBBY_NEON_BOOKING_FALLBACK_SRC);
              }}
              className="w-auto pointer-events-none select-none"
              style={{
                margin: 0,
                padding: 0,
                display: 'block',
                height: '41px',
                width: 'auto',
                maxWidth: 'none',
                verticalAlign: 'top'
              }}
              aria-hidden
              draggable={false}
            />
            <span
              role="button"
              tabIndex={0}
              onClick={() => navigate(BOOKING_PATHS.PREMIUM_APPOINTMENT)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(BOOKING_PATHS.PREMIUM_APPOINTMENT);
                }
              }}
              className="hover:opacity-90 transition-opacity"
              style={{
                position: 'absolute',
                inset: 0,
                cursor: 'pointer',
                zIndex: 1,
                background: 'transparent'
              }}
              aria-label="Premium booking — wig installation appointment"
            />
          </span>
        </div>
        
        {/* Product Display Shelves */}
        <div className="flex flex-col" style={{ 
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, calc(-50% + 2px))',
          zIndex: 20,
          gap: '16px'
        }}>
          {/* HD LACE Shelf */}
          <div className="flex flex-col items-center">
            <LobbyAssetDownloadAnchor
              visible={showAssetDownloads}
              href={LOBBY_SHELF_HD_SRC}
              downloadFilename="hd-group.png"
              falPrompt={LOBBY_SCENE_FAL_PROMPTS.shelfHdLace}
              placement="bottom-center"
            >
              <img 
                src={LOBBY_SHELF_HD_SRC}
                alt="HD Lace Collection" 
                className="w-auto md:h-20 lg:h-24"
                style={{ height: '56px' }}
              />
            </LobbyAssetDownloadAnchor>
          </div>
          
          {/* TRANSPARENT LACE Shelf */}
          <div className="flex flex-col items-center">
            <LobbyAssetDownloadAnchor
              visible={showAssetDownloads}
              href={LOBBY_SHELF_TRANSPARENT_SRC}
              downloadFilename="transparent-group.png"
              falPrompt={LOBBY_SCENE_FAL_PROMPTS.shelfTransparentLace}
              placement="bottom-center"
            >
              <img 
                src={LOBBY_SHELF_TRANSPARENT_SRC}
                alt="Transparent Lace Collection" 
                className="w-auto md:h-20 lg:h-24"
                style={{ height: '56px' }}
              />
            </LobbyAssetDownloadAnchor>
          </div>
          
          {/* CUSTOM UNITS Shelf */}
          <div className="flex flex-col items-center">
            <LobbyAssetDownloadAnchor
              visible={showAssetDownloads}
              href={LOBBY_SHELF_CUSTOM_SRC}
              downloadFilename="custom-group.png"
              falPrompt={LOBBY_SCENE_FAL_PROMPTS.shelfCustomUnits}
              placement="bottom-center"
            >
              <img 
                src={LOBBY_SHELF_CUSTOM_SRC}
                alt="Custom Units Collection" 
                className="w-auto md:h-20 lg:h-24"
                style={{ height: '56px' }}
              />
            </LobbyAssetDownloadAnchor>
          </div>
        </div>
        
        {/* Bottom Display Case and Accessories */}
        <div className="relative w-3/5" style={{ 
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(calc(-50% + 4px), calc(-50% + 255px))',
          zIndex: 20,
          maxWidth: '753px'
        }}>
          {/* Acrylic Case */}
          <div className="relative">
            <LobbyAssetDownloadAnchor
              visible={showAssetDownloads}
              href={LOBBY_CASE_SRC}
              downloadFilename="CASE.png"
              falPrompt={LOBBY_SCENE_FAL_PROMPTS.displayCase}
              placement="bottom-right"
            >
              <img 
                src={LOBBY_CASE_SRC}
                alt="Display Case" 
                className="h-auto"
                style={{ display: 'block', width: '230px', maxWidth: '230px' }}
              />
            </LobbyAssetDownloadAnchor>
            
            {/* Register — tap for payment methods popover */}
            <div className="absolute left-8" style={{ top: '-39px', zIndex: 25 }}>
              {showAssetDownloads ? (
                <LobbyAssetDownloadLink
                  href={LOBBY_CASE_REGISTER_SRC}
                  downloadFilename="REGISTER.png"
                  falPrompt={LOBBY_SCENE_FAL_PROMPTS.caseRegister}
                  style={{ position: 'absolute', top: -14, left: 0, zIndex: 30 }}
                />
              ) : null}
              <LobbyCasePropPopover
                popoverId="register"
                activeId={lobbyCasePopover}
                onActivate={(id) => {
                  if (id === 'register' || id === 'phone') setLobbyCasePopover(id);
                }}
                onClose={() => setLobbyCasePopover(null)}
                ariaLabel="View accepted payment methods"
                title={LOBBY_REGISTER_POPOVER_TITLE}
                paymentLayout={LOBBY_PAYMENT_POPOVER_LAYOUT}
                align="left"
              >
                <img
                  src={LOBBY_CASE_REGISTER_SRC}
                  alt=""
                  draggable={false}
                  className="md:w-10 md:h-8 pointer-events-none select-none"
                  style={{ width: '52px', height: '44px', display: 'block' }}
                />
              </LobbyCasePropPopover>
            </div>

            {/* Phone — tap for business contact popover */}
            <div
              className="absolute right-8"
              style={{ top: '-33px', zIndex: 25, transform: 'translateX(-6px)' }}
            >
              {showAssetDownloads ? (
                <LobbyAssetDownloadLink
                  href={LOBBY_CASE_PHONE_DOWNLOAD_SRC}
                  downloadFilename="lobby-phone.png"
                  falPrompt={LOBBY_SCENE_FAL_PROMPTS.casePhone}
                  style={{ position: 'absolute', top: -14, right: 0, zIndex: 30 }}
                />
              ) : null}
              <LobbyCasePropPopover
                popoverId="phone"
                activeId={lobbyCasePopover}
                onActivate={(id) => {
                  if (id === 'register' || id === 'phone') setLobbyCasePopover(id);
                }}
                onClose={() => setLobbyCasePopover(null)}
                ariaLabel="View business contact information"
                title={LOBBY_PHONE_POPOVER_TITLE}
                sections={LOBBY_PHONE_POPOVER_SECTIONS}
                align="right"
              >
                <img
                  src={LOBBY_PHONE_SRC}
                  alt=""
                  draggable={false}
                  className="pointer-events-none select-none"
                  style={{ width: 'auto', height: '34px', maxWidth: '46px', display: 'block', objectFit: 'contain' }}
                />
              </LobbyCasePropPopover>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Arrow Button - Part of page design, scrolls with content */}
      <div style={{
        position: 'absolute',
        right: '20px',
        top: 'calc(50vh - 5px)',
        transform: 'translate(19px, -50%)',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1px',
        pointerEvents: 'auto'
      }}>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleNext();
          }}
          disabled={false}
          aria-label="Next page"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px 10px 0px 10px',
            transition: 'all 0.3s ease',
            opacity: 0.6,
            pointerEvents: 'auto',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation'
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.8';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.6';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <svg 
            width="27" 
            height="19" 
            viewBox="0 0 32 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))' }}
          >
            <path 
              d="M14 18L20 12L14 6" 
              stroke="white" 
              strokeWidth="3.5" 
              strokeOpacity="0.9"
              strokeLinecap="square" 
              strokeLinejoin="miter"
            />
            <path 
              d="M6 18L12 12L6 6" 
              stroke="white" 
              strokeWidth="2.5" 
              strokeOpacity="0.9"
              strokeLinecap="square" 
              strokeLinejoin="miter"
            />
          </svg>
        </button>
        <div style={{
          fontFamily: '"Futura PT Medium"',
          fontSize: '8px',
          color: 'white',
          opacity: 0.6,
          letterSpacing: '1px',
          textAlign: 'center',
          width: '100%',
          transform: 'translateX(-2px)',
          textTransform: 'uppercase'
        }}>
          lounge
        </div>
      </div>
    </div>
  );
};

// Lounge Component
const LoungePage: React.FC = () => {
  const navigate = useNavigate();
  const showAssetDownloads = useLobbyAssetDownloadsVisible();

  const tvFrameRef = useRef<HTMLDivElement>(null);
  const [tvOpen, setTvOpen] = useState(false);
  const [tvOriginRect, setTvOriginRect] = useState<DOMRect | null>(null);

  const openLoungeTv = useCallback(() => {
    const rect = tvFrameRef.current?.getBoundingClientRect() ?? null;
    setTvOriginRect(rect);
    setTvOpen(true);
  }, []);

  const closeLoungeTv = useCallback(() => {
    setTvOpen(false);
  }, []);

  const loungeLobbyTvFrame = loungeTvDimensionsFromFrameHeight(146);
  const isLargeLoungeViewport = useLoungeLargeViewport();

  const handlePrevious = useCallback(() => {
    // This will be handled by parent component
    window.dispatchEvent(new CustomEvent('lobby-navigate-previous'));
  }, []);
  
  return (
    <div
      className="bg-white relative lounge-page"
      style={{
        minHeight: loungePageMinHeightCss(),
        width: '100vw',
        overflow: 'visible',
        display: 'block',
        margin: 0,
        padding: 0,
        flexShrink: 0,
        backgroundColor: 'white',
      }}
    >
      {/* Background Image - Using landing2-background */}
      <div
        style={sceneCarouselBackgroundLayerStyle(LOUNGE_BACKGROUND_SRC, {
          backgroundPosition: `center ${loungeSceneBackgroundPositionY()}`,
        })}
      />

      {showAssetDownloads ? (
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            zIndex: 500,
            pointerEvents: 'none',
          }}
        >
          <LobbyAssetDownloadLink
            href={LOUNGE_BACKGROUND_SRC}
            downloadFilename="landing2-background.png"
            falPrompt={LOUNGE_SCENE_FAL_PROMPTS.loungeBackground}
            style={{ pointerEvents: 'auto' }}
          />
        </div>
      ) : null}
      
      {/* Neon Logo - Independent container with absolute positioning */}
      <div style={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(calc(-50% + 56px), calc(-50% - 160px))', 
        zIndex: 10, 
        width: 'fit-content'
      }}>
        <div style={{ display: 'inline-block', position: 'relative', width: 'fit-content', lineHeight: 0 }}>
          {showAssetDownloads ? (
            <LobbyAssetDownloadLink
              href={LOUNGE_NEON_LOGO_SRC}
              downloadFilename="neon-logo.png"
              falPrompt={LOUNGE_SCENE_FAL_PROMPTS.neonLogo}
              style={{ position: 'absolute', top: 4, left: 0, zIndex: 60 }}
            />
          ) : null}
          <img
            src={LOUNGE_NEON_LOGO_SRC}
            alt="Frontal Slayer"
            onClick={() => navigate('/shop/units')}
            style={{
              width: 'auto',
              height: '265px',
              maxWidth: 'none',
              maxHeight: '265px',
              margin: 0,
              padding: 0,
              display: 'block',
              visibility: 'visible',
              opacity: 1,
              cursor: 'pointer',
            }}
          />
        </div>
      </div>
      
      {/* TV + play — play opens animated black screen + theater curtains */}
       <div
         ref={tvFrameRef}
         style={{
           position: 'absolute',
           top: '50%',
           left: '50%',
           transform: 'translate(calc(-50% + 58px), calc(-50% + 50px))',
           zIndex: tvOpen ? 8 : 10,
           width: 'fit-content',
         }}
       >
         <div
           style={{
             display: 'inline-block',
             position: 'relative',
             width: 'fit-content',
             opacity: tvOpen ? 0.35 : 1,
             transition: 'opacity 0.4s ease',
           }}
         >
           {showAssetDownloads ? (
             <div
               style={{
                 position: 'absolute',
                 top: -14,
                 right: 0,
                 zIndex: 60,
                 display: 'flex',
                 flexDirection: 'column',
                 alignItems: 'flex-end',
                 gap: 2,
               }}
             >
               <LobbyAssetDownloadLink
                 href={LOUNGE_CURTAIN_LEFT_SRC}
                 downloadFilename="lounge-curtain-left.jpeg"
                 falPrompt={LOUNGE_SCENE_FAL_PROMPTS.curtainLeft}
               />
               <LobbyAssetDownloadLink
                 href={LOUNGE_CURTAIN_RIGHT_SRC}
                 downloadFilename="lounge-curtain-right.jpeg"
                 falPrompt={LOUNGE_SCENE_FAL_PROMPTS.curtainRight}
               />
               <LobbyAssetDownloadLink
                 href={LOUNGE_TV_REMOTE_HAND_SRC}
                 downloadFilename="lounge-tv-remote-hand.png"
                 falPrompt={LOUNGE_SCENE_FAL_PROMPTS.tvRemoteHand}
               />
             </div>
           ) : null}
           <LoungeTvFrame
             frameWidth={loungeLobbyTvFrame.frameW + LOUNGE_LOBBY_TV_EXTRA_FRAME_WIDTH_PX}
             frameHeight={loungeLobbyTvFrame.frameH}
           >
             {!tvOpen && (
               <button
                 type="button"
                 onClick={openLoungeTv}
                 aria-label="Play lounge media"
                 style={{
                   position: 'absolute',
                   left: '50%',
                   top: '50%',
                   transform: 'translate(-50%, -50%)',
                   margin: 0,
                   padding: '12px',
                   border: 'none',
                   background: 'transparent',
                   cursor: 'pointer',
                   WebkitTapHighlightColor: 'transparent',
                   touchAction: 'manipulation',
                   zIndex: 2,
                 }}
               >
                 <span
                   aria-hidden
                   style={{
                     display: 'block',
                     height: '15px',
                     width: '18px',
                     pointerEvents: 'none',
                     backgroundColor: LOUNGE_TV_PLAY_BUTTON_COLOR,
                     WebkitMaskImage: 'url(/assets/play-button.png)',
                     maskImage: 'url(/assets/play-button.png)',
                     WebkitMaskSize: 'contain',
                     maskSize: 'contain',
                     WebkitMaskRepeat: 'no-repeat',
                     maskRepeat: 'no-repeat',
                     WebkitMaskPosition: 'center',
                     maskPosition: 'center',
                   }}
                 />
               </button>
             )}
           </LoungeTvFrame>
         </div>
       </div>

      <LoungeTvOverlay isOpen={tvOpen} originRect={tvOriginRect} onClose={closeLoungeTv} />
      
      {/* Salon Chairs — inline placement (large viewport uses larger Y offset from loungeSceneLayout) */}
      <div style={loungeSalonChairsAnchorStyle(isLargeLoungeViewport)}>
        <div style={{ display: 'inline-block', position: 'relative', width: 'fit-content', lineHeight: 0 }}>
          {showAssetDownloads ? (
            <LobbyAssetDownloadLink
              href={LOUNGE_SALON_CHAIRS_SRC}
              downloadFilename="salon-chairs.png"
              falPrompt={LOUNGE_SCENE_FAL_PROMPTS.salonChairs}
              style={{ position: 'absolute', top: -14, left: 0, zIndex: 60 }}
            />
          ) : null}
          <img src={LOUNGE_SALON_CHAIRS_SRC} alt="Salon Chairs" style={loungeSalonChairsImageStyle()} />
        </div>
      </div>
      
      {/* Left Arrow Button - Part of page design, scrolls with content */}
      <div style={{
        position: 'absolute',
        left: '20px',
        top: 'calc(50vh - 5px)',
        transform: 'translate(-17px, -50%)',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1px',
        pointerEvents: 'auto'
      }}>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handlePrevious();
          }}
          disabled={false}
          aria-label="Previous page"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px 10px 0px 10px',
            transition: 'all 0.3s ease',
            opacity: 0.6,
            pointerEvents: 'auto',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation'
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.8';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.6';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <svg 
            width="27" 
            height="19" 
            viewBox="0 0 32 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))' }}
          >
            <path 
              d="M18 18L12 12L18 6" 
              stroke="white" 
              strokeWidth="3.5" 
              strokeOpacity="0.9"
              strokeLinecap="square" 
              strokeLinejoin="miter"
            />
            <path 
              d="M26 18L20 12L26 6" 
              stroke="white" 
              strokeWidth="2.5" 
              strokeOpacity="0.9"
              strokeLinecap="square" 
              strokeLinejoin="miter"
            />
          </svg>
        </button>
        <div style={{
          fontFamily: '"Futura PT Medium"',
          fontSize: '8px',
          color: 'white',
          opacity: 0.6,
          letterSpacing: '1px',
          textAlign: 'center',
          width: '100%',
          transform: 'translateX(3px)',
          textTransform: 'uppercase'
        }}>
          lobby
        </div>
      </div>
    </div>
  );
};

// Main Lobby App Component with Slide Transition
const LobbyApp: React.FC = () => {
  console.log('🎯 LOBBY PAGE LOADING - This should show when visiting root path');
  const navigate = useNavigate();
  const location = useLocation();
  const currentPage = lobbyCarouselIndexFromPath(location.pathname);
  const transitionVideoEnabled = isLobbyTransitionVideoEnabledFromSearch(location.search);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [showLoading, setShowLoading] = useState<boolean>(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);
  const [showRoomTransitionVideo, setShowRoomTransitionVideo] = useState<boolean>(false);

  const applyCarouselPage = useCallback(
    (pageIndex: number, options?: { animate?: boolean }) => {
      const path = lobbyCarouselPathFromIndex(pageIndex);
      const animate = options?.animate !== false;
      if (animate) {
        setIsTransitioning(true);
        setTimeout(() => setIsTransitioning(false), 800);
      }
      if (location.pathname !== path) {
        navigate({ pathname: path, search: location.search }, { replace: true });
      }
    },
    [location.pathname, location.search, navigate]
  );

  // Confirm membership by syncing the authenticated client's profile from the backend
  // (same underlying profile data the rewards page + admin client details display).
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      // Always attempt a profile sync first when Supabase is available.
      // This prevents stale localStorage membership fields from triggering the modal incorrectly.
      if (isSupabaseConfigured() && localStorage.getItem('isSignedIn') === 'true') {
        try {
          await syncAllFromApi();
        } catch (_) {}
      }

      if (cancelled) return;
      setShowUpgradeModal(!isPremiumMemberForGatedFeatures());
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleUpgrade = () => {
    setShowUpgradeModal(false);
    prepareMembershipUpgradeNavigation();
    navigate('/account/rewards');
  };

  const handleCancel = () => {
    setShowUpgradeModal(false);
    // Go back to wherever the user came from before entering /lobby.
    // Fallback for direct-link cases (no meaningful history).
    if (typeof window !== 'undefined' && window.history.length > 1) navigate(-1);
    else navigate('/home/shop');
  };

  const pages = [<LobbyPage key="lobby" />, <LoungePage key="lounge" />];

  const completeRoomTransitionVideo = useCallback(() => {
    setShowRoomTransitionVideo(false);
    applyCarouselPage(1, { animate: false });
  }, [applyCarouselPage]);

  const goToCarouselPage = useCallback(
    (pageIndex: number) => {
      if (isTransitioning || showRoomTransitionVideo || pageIndex === currentPage) return;
      if (transitionVideoEnabled && currentPage === 0 && pageIndex === 1) {
        setShowRoomTransitionVideo(true);
        return;
      }
      applyCarouselPage(pageIndex);
    },
    [
      applyCarouselPage,
      currentPage,
      isTransitioning,
      showRoomTransitionVideo,
      transitionVideoEnabled,
    ]
  );

  const handlePrevious = useCallback(() => {
    if (currentPage > 0) goToCarouselPage(currentPage - 1);
  }, [currentPage, goToCarouselPage]);

  const handleNext = useCallback(() => {
    if (currentPage < pages.length - 1) goToCarouselPage(currentPage + 1);
  }, [currentPage, goToCarouselPage, pages.length]);

  // Handle keyboard arrow keys
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handlePrevious, handleNext]);

  // Listen for navigation events from page components
  useEffect(() => {
    const onNext = () => {
      if (currentPage < pages.length - 1) goToCarouselPage(currentPage + 1);
    };
    const onPrevious = () => {
      if (currentPage > 0) goToCarouselPage(currentPage - 1);
    };

    window.addEventListener('lobby-navigate-next', onNext);
    window.addEventListener('lobby-navigate-previous', onPrevious);

    return () => {
      window.removeEventListener('lobby-navigate-next', onNext);
      window.removeEventListener('lobby-navigate-previous', onPrevious);
    };
  }, [currentPage, goToCarouselPage, pages.length]);

  // Hide loading screen after assets have time to load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 3000); // 3 seconds to allow assets to fully render
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {showLoading && <LoadingScreen />}
      <LobbyLoungeTransitionVideo
        active={showRoomTransitionVideo}
        onComplete={completeRoomTransitionVideo}
        onSkip={completeRoomTransitionVideo}
      />
      <div
        style={{
          width: '100vw',
          height: '100dvh',
          overflowX: 'hidden',
          overflowY: 'auto',
          position: 'relative',
          backgroundColor: 'transparent',
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'auto',
          display: showLoading ? 'none' : 'block',
        }}
      >
        {/* Slide Container — not painted until loading screen hides (no peek-through) */}
        <div
          style={{
            display: 'flex',
            width: `${pages.length * 100}vw`,
            minHeight: sceneCarouselSlideMinHeightCss(),
            transform: `translateX(-${currentPage * 100}vw)`,
            transition: isTransitioning ? 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
            willChange: isTransitioning ? 'transform' : 'auto',
          }}
        >
          {pages.map((page, index) => (
            <div
              key={index}
              style={{
                width: '100vw',
                flexShrink: 0,
                minHeight: sceneCarouselSlideMinHeightCss(),
              }}
            >
              {page}
            </div>
          ))}
        </div>
      </div>
      
      {/* Upgrade Subscription Modal */}
      <ConfirmationModal
        isOpen={showUpgradeModal}
        onClose={handleCancel}
        onConfirm={handleUpgrade}
        title="UPGRADE YOUR SUBSCRIPTION"
        message="YOU MUST BE A PREMIUM MEMBER TO ACCESS THIS AREA."
        confirmText="UPGRADE"
        cancelText="CANCEL"
        dataAttribute="upgrade-subscription-modal"
      />
    </>
  );
};

export default LobbyApp;
