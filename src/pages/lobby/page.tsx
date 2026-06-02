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
import { getSupabase, isSupabaseConfigured, signOutIfSessionEmailUnconfirmed } from '../../utils/supabase';
import {
  syncAllFromApi,
  buildMinimalUserFromSupabaseSession,
  applyMinimalUserToStorage,
  buildProfilePayloadForBackend,
  didLastProfileSyncError,
} from '../../utils/syncFromApi';
import { registerServerSessionCookie } from '../../utils/sessionRestore';
import { sceneCarouselBackgroundLayerStyle, sceneCarouselSlideMinHeightCss } from '../../utils/sceneCarouselBackground';
import { LobbyLoungeTransitionOverlay } from '../../components/lobby/LobbyLoungeTransitionVideo';
import { LobbySceneHotspots } from '../../components/lobby/LobbySceneHotspots';
import { LoungeSceneTvHotspot } from '../../components/lounge/LoungeSceneTvHotspot';
import { FINAL_LOBBY_BACKGROUND_SRC, FINAL_LOUNGE_BACKGROUND_SRC } from '../../constants/finalLobbySceneAssets';
import {
  isLobbyTransitionVideoEnabledFromSearch,
  type LobbyLoungeTransitionDirection,
  LOBBY_LOUNGE_TRANSITION_VIDEO_SRC,
} from '../../constants/lobbyLoungeTransitionVideo';

// Lobby Component
const LobbyPage: React.FC = () => {
  const navigate = useNavigate();

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
      <div style={sceneCarouselBackgroundLayerStyle(FINAL_LOBBY_BACKGROUND_SRC)} />

      <div className="relative" style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
        <LobbySceneHotspots />
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
  const handlePrevious = useCallback(() => {
    window.dispatchEvent(new CustomEvent('lobby-navigate-previous'));
  }, []);

  return (
    <div
      className="bg-white relative lounge-page"
      style={{
        minHeight: sceneCarouselSlideMinHeightCss(),
        width: '100vw',
        overflow: 'visible',
        display: 'block',
        margin: 0,
        padding: 0,
        flexShrink: 0,
        backgroundColor: 'white',
      }}
    >
      <div style={sceneCarouselBackgroundLayerStyle(FINAL_LOUNGE_BACKGROUND_SRC)} />

      <LoungeSceneTvHotspot />

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
  const routePage = lobbyCarouselIndexFromPath(location.pathname);
  const transitionVideoEnabled = isLobbyTransitionVideoEnabledFromSearch(location.search);
  const carouselSlideCount = 2;
  const roomTransitionInProgressRef = useRef(false);

  const visualIndexFromRoute = routePage;

  const [visualIndex, setVisualIndex] = useState(visualIndexFromRoute);
  const [roomTransitionOverlay, setRoomTransitionOverlay] = useState<LobbyLoungeTransitionDirection | null>(
    null,
  );
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [showLoading, setShowLoading] = useState<boolean>(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);

  useEffect(() => {
    if (!transitionVideoEnabled) return;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'video';
    link.href = LOBBY_LOUNGE_TRANSITION_VIDEO_SRC;
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, [transitionVideoEnabled]);

  useEffect(() => {
    if (roomTransitionInProgressRef.current) return;
    setVisualIndex(visualIndexFromRoute);
  }, [visualIndexFromRoute]);

  const applyCarouselPage = useCallback(
    (pageIndex: number, options?: { animate?: boolean }) => {
      const path = lobbyCarouselPathFromIndex(pageIndex);
      const animate = options?.animate !== false;

      if (animate) {
        setIsTransitioning(true);
        setTimeout(() => setIsTransitioning(false), 800);
      }
      setVisualIndex(pageIndex);
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

  const completeRoomTransitionOverlay = useCallback(
    (direction: LobbyLoungeTransitionDirection) => {
      const targetPage = direction === 'forward' ? 1 : 0;
      setRoomTransitionOverlay(null);
      setVisualIndex(targetPage);
      const path = lobbyCarouselPathFromIndex(targetPage);
      if (location.pathname !== path) {
        navigate({ pathname: path, search: location.search }, { replace: true });
      }
      roomTransitionInProgressRef.current = false;
    },
    [location.pathname, location.search, navigate],
  );

  const goToCarouselPage = useCallback(
    (pageIndex: number) => {
      if (
        isTransitioning ||
        roomTransitionInProgressRef.current ||
        roomTransitionOverlay !== null ||
        pageIndex === routePage
      ) {
        return;
      }

      if (transitionVideoEnabled && routePage === 0 && pageIndex === 1) {
        roomTransitionInProgressRef.current = true;
        setRoomTransitionOverlay('forward');
        return;
      }

      if (transitionVideoEnabled && routePage === 1 && pageIndex === 0) {
        roomTransitionInProgressRef.current = true;
        setRoomTransitionOverlay('reverse');
        return;
      }

      applyCarouselPage(pageIndex);
    },
    [applyCarouselPage, isTransitioning, roomTransitionOverlay, routePage, transitionVideoEnabled]
  );

  const handlePrevious = useCallback(() => {
    if (routePage > 0) goToCarouselPage(routePage - 1);
  }, [routePage, goToCarouselPage]);

  const handleNext = useCallback(() => {
    if (routePage < 1) goToCarouselPage(routePage + 1);
  }, [routePage, goToCarouselPage]);

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
      if (routePage < 1) goToCarouselPage(routePage + 1);
    };
    const onPrevious = () => {
      if (routePage > 0) goToCarouselPage(routePage - 1);
    };

    window.addEventListener('lobby-navigate-next', onNext);
    window.addEventListener('lobby-navigate-previous', onPrevious);

    return () => {
      window.removeEventListener('lobby-navigate-next', onNext);
      window.removeEventListener('lobby-navigate-previous', onPrevious);
    };
  }, [routePage, goToCarouselPage]);

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
            width: `${carouselSlideCount * 100}vw`,
            minHeight: sceneCarouselSlideMinHeightCss(),
            transform: `translateX(-${visualIndex * 100}vw)`,
            transition: isTransitioning ? 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
            willChange: isTransitioning ? 'transform' : 'auto',
          }}
        >
          <div
            style={{
              width: '100vw',
              flexShrink: 0,
              minHeight: sceneCarouselSlideMinHeightCss(),
            }}
          >
            <LobbyPage />
          </div>
          <div
            style={{
              width: '100vw',
              flexShrink: 0,
              minHeight: sceneCarouselSlideMinHeightCss(),
            }}
          >
            <LoungePage />
          </div>
        </div>
        {transitionVideoEnabled && roomTransitionOverlay ? (
          <LobbyLoungeTransitionOverlay
            active
            direction={roomTransitionOverlay}
            onComplete={() => completeRoomTransitionOverlay(roomTransitionOverlay)}
          />
        ) : null}
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
