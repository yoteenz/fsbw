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
  LOUNGE_SALON_CHAIRS_HEIGHT_PX,
  LOUNGE_SALON_CHAIRS_LARGE_EXTRA_Y_PX,
  LOUNGE_SALON_CHAIRS_LARGE_MIN_WIDTH_PX,
  LOUNGE_SALON_CHAIRS_OFFSET_X_PX,
  LOUNGE_SALON_CHAIRS_OFFSET_Y_PX,
} from '../../utils/loungeSceneLayout';
import { LoungeTvOverlay } from '../../components/lounge/LoungeTvOverlay';
import {
  LOUNGE_LOBBY_TV_EXTRA_FRAME_WIDTH_PX,
  LOUNGE_TV_PLAY_BUTTON_COLOR,
  LoungeTvFrame,
  loungeTvDimensionsFromFrameHeight,
} from '../../components/lounge/loungeTvFrame';

// Lobby Component
const LobbyPage: React.FC = () => {
  const navigate = useNavigate();
  console.log('✅✅✅ LobbyPage component rendering - ROOT ROUTE');

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

  // Measure Products/Tools image size so debug overlay matches asset exactly
  const productsImgRef = useRef<HTMLImageElement>(null);
  const toolsImgRef = useRef<HTMLImageElement>(null);
  const [productsSize, setProductsSize] = useState<{ w: number; h: number } | null>(null);
  const [toolsSize, setToolsSize] = useState<{ w: number; h: number } | null>(null);
  const measureProducts = useCallback(() => {
    const el = productsImgRef.current;
    if (el) {
      const r = el.getBoundingClientRect();
      setProductsSize({ w: r.width, h: r.height });
    }
  }, []);
  const measureTools = useCallback(() => {
    const el = toolsImgRef.current;
    if (el) {
      const r = el.getBoundingClientRect();
      setToolsSize({ w: r.width, h: r.height });
    }
  }, []);

  const [bookingNeonSrc, setBookingNeonSrc] = useState('/assets/neon-booking.png');

  return (
    <div className="bg-red-900 relative" style={{ minHeight: '100vh', width: '100vw', flexShrink: 0, backgroundColor: 'white' }}>
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-contain bg-center bg-no-repeat"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'url(/assets/landing-background.png)',
          backgroundSize: '100% 100%',
          backgroundPosition: 'center center',
          backgroundColor: 'white',
          willChange: 'auto',
          contain: 'layout style paint'
        }}
      />
      
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
          <div style={{ display: 'inline-block', position: 'relative', width: 'fit-content' }}>
            <img 
              src="/assets/neon-logo.png" 
              alt="Frontal Slayer" 
              onClick={() => navigate('/home/shop')}
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
          {/* Products: overlay sized from measured image so debug square matches asset */}
          <span style={{ position: 'relative', display: 'inline-block', flexShrink: 0, pointerEvents: 'auto' }}>
            <img 
              ref={productsImgRef}
              src="/assets/neon-products.png" 
              alt="Products" 
              onLoad={measureProducts}
              style={{ margin: 0, padding: 0, display: 'block', transform: 'translateX(4px)', height: '41px', maxWidth: 'none', width: 'auto', pointerEvents: 'none', verticalAlign: 'top', position: 'relative', zIndex: 0 }}
              aria-hidden
            />
            {productsSize && (
              <span
                role="button"
                tabIndex={0}
                onClick={() => navigate('/home/shop')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/home/shop'); } }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: Math.max(0, productsSize.w - 40),
                  height: productsSize.h,
                  transform: 'translateX(24px)',
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                  zIndex: 1,
                  background: 'transparent'
                }}
                aria-label="Go to home shop"
              />
            )}
          </span>
          {/* Tools: overlay sized from measured image so debug square matches asset */}
          <span style={{ position: 'relative', display: 'inline-block', flexShrink: 0, pointerEvents: 'auto' }}>
            <img 
              ref={toolsImgRef}
              src="/assets/neon-tools.png" 
              alt="Tools" 
              onLoad={measureTools}
              style={{ margin: 0, padding: 0, display: 'block', transform: 'translateX(-50px)', height: '41px', maxWidth: 'none', width: 'auto', pointerEvents: 'none', verticalAlign: 'top', position: 'relative', zIndex: 0 }}
              aria-hidden
            />
            {toolsSize && (
              <span
                role="button"
                tabIndex={0}
                onClick={() => navigate('/home/tools')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/home/tools'); } }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: Math.max(0, toolsSize.w - 70),
                  height: toolsSize.h,
                  transform: 'translateX(-14px)',
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                  zIndex: 1,
                  background: 'transparent'
                }}
                aria-label="Go to tools"
              />
            )}
          </span>
          {/* Booking: to the right of tools (same kern as legacy PNG layout). PNG if present in public/assets; else SVG. */}
          <span
            style={{
              position: 'relative',
              display: 'inline-flex',
              flexShrink: 0,
              transform: 'translateX(-104px)',
              pointerEvents: 'auto',
              alignItems: 'center'
            }}
          >
            <img
              src={bookingNeonSrc}
              alt=""
              onError={() => {
                if (bookingNeonSrc.endsWith('.png')) setBookingNeonSrc('/assets/neon-booking.svg');
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
            <img 
              src="/assets/hd-group.png" 
              alt="HD Lace Collection" 
              className="w-auto md:h-20 lg:h-24"
              style={{ height: '56px' }}
            />
          </div>
          
          {/* TRANSPARENT LACE Shelf */}
          <div className="flex flex-col items-center">
            <img 
              src="/assets/transparent-group.png" 
              alt="Transparent Lace Collection" 
              className="w-auto md:h-20 lg:h-24"
              style={{ height: '56px' }}
            />
          </div>
          
          {/* CUSTOM UNITS Shelf */}
          <div className="flex flex-col items-center">
            <img 
              src="/assets/custom-group.png" 
              alt="Custom Units Collection" 
              className="w-auto md:h-20 lg:h-24"
              style={{ height: '56px' }}
            />
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
            <img 
              src="/assets/CASE.png" 
              alt="Display Case" 
              className="h-auto"
              style={{ display: 'block', width: '230px', maxWidth: '230px' }}
            />
            
            {/* Register - Left side of case */}
            <div className="absolute left-8" style={{ top: '-39px' }}>
            <img 
              src="/assets/REGISTER.png" 
              alt="Register" 
              className="md:w-10 md:h-8"
              style={{ width: '52px', height: '44px' }}
            />
            </div>
            
            {/* Phone - Right side of case */}
            <div className="absolute right-8" style={{ top: '-31px' }}>
              <img 
                src="/assets/PHONE.png" 
                alt="Phone" 
                className="md:w-10 md:h-8"
                style={{ width: '32px', height: '34px' }}
              />
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
  console.log('LoungePage component is rendering');

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

  const handlePrevious = useCallback(() => {
    // This will be handled by parent component
    window.dispatchEvent(new CustomEvent('lobby-navigate-previous'));
  }, []);
  
  return (
    <div className="bg-white relative lounge-page" style={{ minHeight: '105vh', width: '100vw', overflow: 'visible', display: 'block', margin: 0, padding: 0, flexShrink: 0, backgroundColor: 'white' }}>
      <style>{`
        .lounge-salon-chairs-anchor {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(calc(-50% + ${LOUNGE_SALON_CHAIRS_OFFSET_X_PX}px), calc(-50% + ${LOUNGE_SALON_CHAIRS_OFFSET_Y_PX}px));
          z-index: 10;
          width: fit-content;
        }
        .lounge-salon-chairs-anchor img.lounge-salon-chairs-img {
          width: auto;
          height: ${LOUNGE_SALON_CHAIRS_HEIGHT_PX}px;
          margin: 0;
          padding: 0;
          display: block;
        }
        @media (min-width: ${LOUNGE_SALON_CHAIRS_LARGE_MIN_WIDTH_PX}px) {
          .lounge-salon-chairs-anchor {
            transform: translate(calc(-50% + ${LOUNGE_SALON_CHAIRS_OFFSET_X_PX}px), calc(-50% + ${LOUNGE_SALON_CHAIRS_OFFSET_Y_PX + LOUNGE_SALON_CHAIRS_LARGE_EXTRA_Y_PX}px));
          }
        }
      `}</style>
      {/* Background Image - Using landing2-background */}
      <div 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'url(/assets/landing2-background.png)',
          backgroundSize: '100% auto',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
          backgroundColor: 'white',
          willChange: 'auto',
          contain: 'layout style paint'
        }}
      />
      
      {/* Neon Logo - Independent container with absolute positioning */}
      <div style={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(calc(-50% + 56px), calc(-50% - 160px))', 
        zIndex: 10, 
        width: 'fit-content'
      }}>
        <div style={{ display: 'inline-block', position: 'relative', width: 'fit-content' }}>
          <img 
            src="/assets/neon-logo.png" 
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
              cursor: 'pointer'
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
      
      {/* Salon Chairs — viewport-centered; large screens nudged down via .lounge-salon-chairs-anchor */}
      <div className="lounge-salon-chairs-anchor">
        <div style={{ display: 'inline-block', position: 'relative', width: 'fit-content' }}>
          <img
            src="/assets/salon-chairs.png"
            alt="Salon Chairs"
            className="lounge-salon-chairs-img"
            style={{ cursor: 'pointer' }}
          />
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
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [showLoading, setShowLoading] = useState<boolean>(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);

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

  const goToCarouselPage = useCallback(
    (pageIndex: number) => {
      if (isTransitioning || pageIndex === currentPage) return;
      const path = lobbyCarouselPathFromIndex(pageIndex);
      setIsTransitioning(true);
      if (location.pathname !== path) {
        navigate(path, { replace: true });
      }
      setTimeout(() => setIsTransitioning(false), 800);
    },
    [currentPage, isTransitioning, location.pathname, navigate]
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
      {showLoading && <LoadingScreen bleedPx={96} />}
      <div
        style={{
          width: '100vw',
          height: '100vh',
          overflowX: 'hidden',
          overflowY: showLoading ? 'hidden' : 'auto',
          position: 'relative',
          backgroundColor: 'transparent',
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'auto',
        }}
      >
        {/* Slide Container */}
        <div 
          style={{
            display: 'flex',
            width: `${pages.length * 100}vw`,
            minHeight: '105vh',
            transform: `translateX(-${currentPage * 100}vw)`,
            transition: isTransitioning ? 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
            willChange: isTransitioning ? 'transform' : 'auto'
          }}
        >
          {pages.map((page, index) => (
            <div
              key={index}
              style={{
                width: '100vw',
                flexShrink: 0,
                minHeight: index === 0 ? '100vh' : '105vh'
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
