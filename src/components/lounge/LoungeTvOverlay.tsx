import React, { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import {
  LOUNGE_TV_SIDEBAR,
  type LoungeTvMainTab,
} from './loungeTvContent';
import { LOUNGE_CURTAIN_LEFT_SRC, LOUNGE_CURTAIN_RIGHT_SRC, LOUNGE_TV_REMOTE_HAND_SRC } from './loungeTvAssets';
import {
  LOUNGE_TV_OVERLAY_SIZE_SCALE,
  LoungeTvContentFrame,
  loungeTvContentFrameDimensionsFromFrameHeight,
  loungeTvContentFrameDimensionsFromScreenWidth,
} from './loungeTvFrame';
import { LOUNGE_TV_CONTENT_FRAME_SRC } from './loungeTvAssets';
import { LoungeTvFullscreenShell } from './LoungeTvFullscreenShell';
import { LoungeTvRemoteHand } from './LoungeTvRemoteHand';
import { LoungeTvPowerOnStatic } from './LoungeTvPowerOnStatic';
import { LoungeTvPowerOffEffect, LOUNGE_TV_POWER_OFF_MS } from './LoungeTvPowerOffEffect';
import { LoungeTvScreen } from './LoungeTvScreen';
export { LoungeTvScreen } from './LoungeTvScreen';
import { LoungeTvContentProtection } from './LoungeTvContentProtection';
import { hydrateLoungeTvAdminConfig } from '../../utils/loungeTvAdminConfig';
import { setLoungeTvTheaterMode } from '../../utils/loungeTvTheaterMode';
import { getLoungeTvAdminConfig } from '../../utils/api';
import { LOUNGE_TV_ANIMATION_VIDEO_ENABLED } from '../../constants/loungeTvAnimationVideo';
import { useSceneCarouselMeasureBox } from '../../hooks/useSceneCarouselMeasureBox';
import { LoungeTvAnimationVideo } from './LoungeTvAnimationVideo';

type SeedanceTvPhase = 'idle' | 'opening' | 'ready' | 'closing';
/** TV frame grow + curtain close. */
const ANIM_MS = 1400;
/** Remote hand fade-in after TV grow; with {@link STATIC_DELAY_MS} ≈1s until static. */
const HAND_REVEAL_MS = 960;
/** Hand fade-out after screen is blank on power-off. */
const HAND_HIDE_MS = 850;
/** Pause after hand is visible before CRT static. */
const STATIC_DELAY_MS = 1;
/** How long CRT static stays on screen before menu content. */
const STATIC_ON_MS = 500;

type LoungeTvClosePhase = 'idle' | 'zap' | 'hand-out' | 'shrink';
/** Panels overlap at center so fabric meets (assets should have no inner black gap). */
const CURTAIN_PANEL_WIDTH = '54%';
/** Velvet tone — must match curtain art so any sliver at the hem is invisible. */
const CURTAIN_PANEL_BG = '#4a4a4a';
/** Extra length below 100dvh for mobile browser chrome / safe-area gaps. */
const CURTAIN_PANEL_BOTTOM_BLEED_PX = 48;
/** Overscan curtain art so the hem covers the viewport bottom (no panel strip). */
const CURTAIN_IMAGE_WIDTH = '114%';
const CURTAIN_IMAGE_HEIGHT = '142%';
const CURTAIN_IMAGE_SCALE = 1.1;

type LoungeTvOverlayProps = {
  isOpen: boolean;
  originRect: DOMRect | null;
  onClose: () => void;
  /** {@link SceneCarouselViewportStage} on the lounge slide (scene-locked overlay). */
  viewportMeasureRef: RefObject<HTMLElement | null>;
  /** After refresh while TV was open — show menu without replaying open animation. */
  resumeSessionOpen?: boolean;
};

function curtainPanelStyle(side: 'left' | 'right', closed: boolean): React.CSSProperties {
  return {
    position: 'absolute',
    top: 0,
    bottom: `-${CURTAIN_PANEL_BOTTOM_BLEED_PX}px`,
    minHeight: `calc(100% + ${CURTAIN_PANEL_BOTTOM_BLEED_PX}px)`,
    width: CURTAIN_PANEL_WIDTH,
    zIndex: 100,
    overflow: 'hidden',
    backgroundColor: CURTAIN_PANEL_BG,
    boxShadow: side === 'left' ? '6px 0 28px rgba(0,0,0,0.35)' : '-6px 0 28px rgba(0,0,0,0.35)',
    transition: `transform ${ANIM_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
    transform:
      side === 'left'
        ? closed
          ? 'translateX(0)'
          : 'translateX(-105%)'
        : closed
          ? 'translateX(0)'
          : 'translateX(105%)',
    ...(side === 'left' ? { left: 0 } : { right: 0 }),
  };
}

function LoungeCurtainPanel({ side, closed }: { side: 'left' | 'right'; closed: boolean }) {
  const src = side === 'left' ? LOUNGE_CURTAIN_LEFT_SRC : LOUNGE_CURTAIN_RIGHT_SRC;
  const isLeft = side === 'left';
  return (
    <div style={curtainPanelStyle(side, closed)} aria-hidden>
      <img
        src={src}
        alt=""
        draggable={false}
        style={{
          position: 'absolute',
          bottom: `-${Math.round(CURTAIN_PANEL_BOTTOM_BLEED_PX * 0.35)}px`,
          left: isLeft ? 0 : undefined,
          right: isLeft ? undefined : 0,
          width: CURTAIN_IMAGE_WIDTH,
          height: CURTAIN_IMAGE_HEIGHT,
          maxWidth: 'none',
          display: 'block',
          objectFit: 'cover',
          objectPosition: isLeft ? 'left bottom' : 'right bottom',
          transform: isLeft
            ? `translateX(-3%) scale(${CURTAIN_IMAGE_SCALE})`
            : `translateX(3%) scale(${CURTAIN_IMAGE_SCALE})`,
          transformOrigin: isLeft ? 'left bottom' : 'right bottom',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />
    </div>
  );
}

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    const done = () => resolve();
    img.onload = () => {
      if (typeof img.decode === 'function') {
        img.decode().then(done).catch(done);
      } else {
        done();
      }
    };
    img.onerror = done;
    img.src = src;
  });
}

export function LoungeTvOverlay({
  isOpen,
  originRect,
  onClose,
  viewportMeasureRef,
  resumeSessionOpen = false,
}: LoungeTvOverlayProps) {
  const [visible, setVisible] = useState(false);
  const [animatedIn, setAnimatedIn] = useState(false);
  const [curtainsReady, setCurtainsReady] = useState(false);
  const [remoteHandReady, setRemoteHandReady] = useState(false);
  const [tvGrowDone, setTvGrowDone] = useState(false);
  const [handRevealDone, setHandRevealDone] = useState(false);
  const [showStatic, setShowStatic] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [poweringOff, setPoweringOff] = useState(false);
  const [closePhase, setClosePhase] = useState<LoungeTvClosePhase>('idle');
  const isClosingRef = useRef(false);
  const [mainTab, setMainTab] = useState<LoungeTvMainTab>('featured');
  const [sidebarId, setSidebarId] = useState('lace-mastery');
  const [seedancePhase, setSeedancePhase] = useState<SeedanceTvPhase>('idle');
  const consumedSessionResumeRef = useRef(false);

  const applyOpenReadyState = useCallback(() => {
    setSeedancePhase('ready');
    setAnimatedIn(true);
    setShowContent(true);
    setCurtainsReady(true);
    setTvGrowDone(true);
    setHandRevealDone(true);
    setRemoteHandReady(true);
    setShowStatic(false);
  }, []);

  useEffect(() => {
    setLoungeTvTheaterMode(isOpen || visible);
  }, [isOpen, visible]);

  useEffect(() => () => setLoungeTvTheaterMode(false), []);

  const useSeedanceClip = LOUNGE_TV_ANIMATION_VIDEO_ENABLED;

  const requestClose = useCallback(() => {
    if (seedancePhase === 'opening' || seedancePhase === 'closing') {
      return;
    }
    if (closePhase !== 'idle' || isClosingRef.current) return;

    if (useSeedanceClip && seedancePhase === 'ready') {
      isClosingRef.current = true;
      setShowContent(false);
      setShowStatic(false);
      setSeedancePhase('closing');
      return;
    }

    if (!animatedIn) {
      onClose();
      return;
    }
    isClosingRef.current = true;
    setShowContent(false);
    setShowStatic(false);
    setClosePhase('zap');
    setPoweringOff(true);
  }, [closePhase, animatedIn, onClose, seedancePhase, useSeedanceClip]);

  /** Close: zap → hand fades after black screen → TV shrinks + curtains open. */
  useEffect(() => {
    if (closePhase !== 'zap') return;
    const timer = window.setTimeout(() => {
      setPoweringOff(false);
      setClosePhase('hand-out');
    }, LOUNGE_TV_POWER_OFF_MS);
    return () => window.clearTimeout(timer);
  }, [closePhase]);

  useEffect(() => {
    if (closePhase !== 'hand-out') return;
    const timer = window.setTimeout(() => {
      setClosePhase('shrink');
      setAnimatedIn(false);
      onClose();
    }, HAND_HIDE_MS);
    return () => window.clearTimeout(timer);
  }, [closePhase, onClose]);

  useEffect(() => {
    if (closePhase !== 'shrink') return;
    const timer = window.setTimeout(() => {
      isClosingRef.current = false;
      setClosePhase('idle');
      setVisible(false);
    }, ANIM_MS);
    return () => window.clearTimeout(timer);
  }, [closePhase]);

  useLayoutEffect(() => {
    if (!isOpen) return;
    setVisible(true);
    if (
      resumeSessionOpen &&
      !consumedSessionResumeRef.current &&
      !isClosingRef.current
    ) {
      consumedSessionResumeRef.current = true;
      applyOpenReadyState();
      return;
    }
    if (useSeedanceClip) {
      setSeedancePhase((phase) => (phase === 'idle' ? 'opening' : phase));
    }
  }, [isOpen, useSeedanceClip, resumeSessionOpen, applyOpenReadyState]);

  useEffect(() => {
    if (!isOpen) return;
    void hydrateLoungeTvAdminConfig(getLoungeTvAdminConfig);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const img = new Image();
    img.src = LOUNGE_TV_CONTENT_FRAME_SRC;
  }, [isOpen]);

  const resetOverlayState = useCallback(() => {
    setShowContent(false);
    setShowStatic(false);
    setTvGrowDone(false);
    setHandRevealDone(false);
    setRemoteHandReady(false);
    setPoweringOff(false);
    setClosePhase('idle');
    setAnimatedIn(false);
    setCurtainsReady(false);
    isClosingRef.current = false;
    setSeedancePhase('idle');
  }, []);

  const handleOpenVideoComplete = useCallback(() => {
    applyOpenReadyState();
  }, [applyOpenReadyState]);

  const handleCloseVideoComplete = useCallback(() => {
    isClosingRef.current = false;
    setSeedancePhase('idle');
    resetOverlayState();
    setVisible(false);
    onClose();
  }, [onClose, resetOverlayState]);

  useEffect(() => {
    if (isOpen || seedancePhase === 'closing') return;
    if (seedancePhase !== 'idle') setSeedancePhase('idle');
  }, [isOpen, seedancePhase]);

  useEffect(() => {
    if (isOpen) {
      isClosingRef.current = false;
      setPoweringOff(false);
      setClosePhase('idle');
      setCurtainsReady(false);
      setRemoteHandReady(false);
      setTvGrowDone(false);
      setHandRevealDone(false);
      setShowStatic(false);
      let cancelled = false;
      Promise.all([preloadImage(LOUNGE_CURTAIN_LEFT_SRC), preloadImage(LOUNGE_CURTAIN_RIGHT_SRC)]).then(() => {
        if (!cancelled) setCurtainsReady(true);
      });
      preloadImage(LOUNGE_TV_REMOTE_HAND_SRC).then(() => {
        if (!cancelled) setRemoteHandReady(true);
      });
      return () => {
        cancelled = true;
      };
    }
    if (visible) return;
    resetOverlayState();
  }, [isOpen, visible, resetOverlayState]);

  /** Grow TV once curtains are ready (hand reveals after grow completes). */
  useEffect(() => {
    if (useSeedanceClip) return;
    if (!isOpen || !curtainsReady || closePhase !== 'idle' || isClosingRef.current) return;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (closePhase === 'idle' && !isClosingRef.current) setAnimatedIn(true);
      });
    });
    return () => cancelAnimationFrame(id);
  }, [isOpen, curtainsReady, closePhase, useSeedanceClip]);

  useEffect(() => {
    if (useSeedanceClip) return;
    if (!isOpen || !animatedIn || closePhase !== 'idle' || isClosingRef.current) return;
    const timer = window.setTimeout(() => {
      if (closePhase === 'idle' && !isClosingRef.current) setTvGrowDone(true);
    }, ANIM_MS);
    return () => window.clearTimeout(timer);
  }, [isOpen, animatedIn, closePhase, useSeedanceClip]);

  useEffect(() => {
    if (useSeedanceClip) return;
    if (!tvGrowDone || !remoteHandReady || closePhase !== 'idle' || isClosingRef.current) return;
    const timer = window.setTimeout(() => {
      if (closePhase === 'idle' && !isClosingRef.current) setHandRevealDone(true);
    }, HAND_REVEAL_MS);
    return () => window.clearTimeout(timer);
  }, [tvGrowDone, remoteHandReady, closePhase, useSeedanceClip]);

  useEffect(() => {
    if (useSeedanceClip) return;
    if (!handRevealDone || closePhase !== 'idle' || showContent || isClosingRef.current) return;
    const timer = window.setTimeout(() => {
      if (closePhase === 'idle' && !isClosingRef.current) setShowStatic(true);
    }, STATIC_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [handRevealDone, closePhase, showContent, useSeedanceClip]);

  useEffect(() => {
    if (useSeedanceClip) return;
    if (!showStatic || closePhase !== 'idle' || isClosingRef.current) return;
    const timer = window.setTimeout(() => {
      if (closePhase === 'idle' && !isClosingRef.current) {
        setShowStatic(false);
        setShowContent(true);
      }
    }, STATIC_ON_MS);
    return () => window.clearTimeout(timer);
  }, [showStatic, closePhase, useSeedanceClip]);

  const handleRemoteHandLoaded = useCallback(() => {
    setRemoteHandReady(true);
  }, []);

  const handleMainTab = useCallback((tab: LoungeTvMainTab) => {
    setMainTab(tab);
    setSidebarId(LOUNGE_TV_SIDEBAR[tab][0]?.id ?? '');
  }, []);

  const sceneBox = useSceneCarouselMeasureBox(viewportMeasureRef);

  if (!isOpen && !visible) return null;

  const resolvedSeedancePhase: SeedanceTvPhase =
    isOpen && useSeedanceClip && seedancePhase === 'idle' ? 'opening' : seedancePhase;
  const seedanceClosing = seedancePhase === 'closing';
  const seedanceOpening = resolvedSeedancePhase === 'opening';
  const seedancePlaybackActive = seedanceOpening || seedanceClosing;

  const frameExpanded = useSeedanceClip ? seedancePhase === 'ready' : animatedIn;
  const showLegacyChoreography = !useSeedanceClip;
  const showTvChrome = !useSeedanceClip || seedancePhase === 'ready';
  const showSeedanceMenuShell = useSeedanceClip && seedancePhase === 'ready';
  /** Stay mounted through `ready` (parked, hidden) so close does not remount and flash black. */
  const showSeedanceVideo =
    useSeedanceClip &&
    (seedanceOpening || seedanceClosing || seedancePhase === 'ready');
  const useFullscreenShell = useSeedanceClip && showTvChrome;

  const handMounted =
    showLegacyChoreography && tvGrowDone && remoteHandReady && closePhase !== 'shrink';
  const handVisible = handMounted && (closePhase === 'idle' || closePhase === 'zap');

  const vw = sceneBox.width;
  const vh = sceneBox.height;
  let targetScreenW = Math.min(vw * 0.92, 380) * LOUNGE_TV_OVERLAY_SIZE_SCALE;
  let { frameW: targetFrameW, frameH: targetFrameH } =
    loungeTvContentFrameDimensionsFromScreenWidth(targetScreenW);
  const maxFrameH = vh * 0.62 * LOUNGE_TV_OVERLAY_SIZE_SCALE;
  if (targetFrameH > maxFrameH) {
    ({ frameW: targetFrameW, frameH: targetFrameH } =
      loungeTvContentFrameDimensionsFromFrameHeight(maxFrameH));
  }
  const frameLeft = (vw - targetFrameW) / 2;
  const frameTop = (vh - targetFrameH) / 2;

  const startFrameW = originRect ? Math.max(originRect.width, 40) : targetFrameW * 0.28;
  const startFrameH = originRect ? Math.max(originRect.height, 30) : targetFrameH * 0.28;
  const startFrameLeft = originRect
    ? originRect.left + originRect.width / 2 - startFrameW / 2
    : frameLeft;
  const startFrameTop = originRect
    ? originRect.top + originRect.height / 2 - startFrameH / 2
    : frameTop;

  const framePositionStyle: React.CSSProperties = {
    position: 'absolute',
    zIndex: 110,
    overflow: 'visible',
    isolation: 'isolate',
    transition: `left ${ANIM_MS}ms cubic-bezier(0.4, 0, 0.2, 1), top ${ANIM_MS}ms cubic-bezier(0.4, 0, 0.2, 1), width ${ANIM_MS}ms cubic-bezier(0.4, 0, 0.2, 1), height ${ANIM_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
    left: frameExpanded ? frameLeft : startFrameLeft,
    top: frameExpanded ? frameTop : startFrameTop,
    width: frameExpanded ? targetFrameW : startFrameW,
    height: frameExpanded ? targetFrameH : startFrameH,
  };

  return (
    <div
      role="presentation"
      aria-hidden={!isOpen}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: isOpen || visible ? 'auto' : 'none',
      }}
    >
      {showSeedanceVideo ? (
        <LoungeTvAnimationVideo
          active={seedancePlaybackActive}
          direction={seedanceClosing ? 'reverse' : 'forward'}
          onComplete={() => {
            if (seedanceClosing) handleCloseVideoComplete();
            else if (seedanceOpening) handleOpenVideoComplete();
          }}
        />
      ) : null}
      <div
        role="presentation"
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 99,
          border: 'none',
          padding: 0,
          margin: 0,
          pointerEvents: 'none',
          background:
            useFullscreenShell
              ? seedanceOpening || seedanceClosing
                ? 'transparent'
                : '#000000'
              : frameExpanded && closePhase === 'idle' && seedancePhase === 'ready'
                ? 'rgba(0,0,0,0.35)'
                : 'transparent',
          backdropFilter:
            useFullscreenShell
              ? 'none'
              : frameExpanded && closePhase === 'idle' && seedancePhase === 'ready'
                ? 'blur(10px)'
                : 'none',
          WebkitBackdropFilter:
            useFullscreenShell
              ? 'none'
              : frameExpanded && closePhase === 'idle' && seedancePhase === 'ready'
                ? 'blur(10px)'
                : 'none',
          transition: useFullscreenShell ? 'none' : `background ${ANIM_MS}ms ease`,
        }}
      />
      {showLegacyChoreography ? (
        <>
          <LoungeCurtainPanel side="left" closed={animatedIn} />
          <LoungeCurtainPanel side="right" closed={animatedIn} />
          {handMounted ? (
            <LoungeTvRemoteHand
              visible={handVisible}
              revealDurationMs={HAND_REVEAL_MS}
              hideDurationMs={HAND_HIDE_MS}
              onLoaded={handleRemoteHandLoaded}
            />
          ) : null}
        </>
      ) : null}
      {showSeedanceMenuShell ? (
        <LoungeTvFullscreenShell
          zIndex={110}
          viewportMeasureRef={viewportMeasureRef}
          closeVisible={closePhase === 'idle' && seedancePhase === 'ready'}
          onClose={() => requestClose()}
          screenStyle={{
            backgroundColor: '#000000',
            opacity: showContent || showStatic ? 1 : 0,
            transition: 'opacity 120ms linear',
          }}
        >
          {showStatic && !showContent ? <LoungeTvPowerOnStatic active /> : null}
          {showContent && !poweringOff && !showStatic ? (
            <LoungeTvContentProtection
              active
              style={{
                width: '100%',
                height: '100%',
                opacity: 1,
                animation: 'lounge-tv-content-in 0.35s ease forwards',
              }}
            >
              <LoungeTvScreen
                mainTab={mainTab}
                sidebarId={sidebarId}
                onMainTabChange={handleMainTab}
                onSidebarChange={setSidebarId}
              />
            </LoungeTvContentProtection>
          ) : null}
        </LoungeTvFullscreenShell>
      ) : null}
      {showTvChrome && !useFullscreenShell ? (
        <div style={framePositionStyle} role="dialog" aria-modal="true" aria-label="Lounge media">
          <LoungeTvContentFrame
            fill
            closeVisible={frameExpanded && closePhase === 'idle'}
            onClose={() => requestClose()}
            screenStyle={{
              backgroundColor: 'transparent',
              boxShadow: 'none',
              opacity: showContent && frameExpanded ? 1 : 0,
              transition: 'opacity 220ms ease',
            }}
          >
            {showLegacyChoreography ? (
              <>
                <LoungeTvPowerOnStatic active={showStatic && !poweringOff} />
                <LoungeTvPowerOffEffect active={poweringOff} />
              </>
            ) : null}
            {showContent && !poweringOff ? (
              <LoungeTvContentProtection
                active
                style={{
                  zIndex: 6,
                  opacity: 1,
                  animation: 'lounge-tv-content-in 0.35s ease forwards',
                }}
              >
                <LoungeTvScreen
                  mainTab={mainTab}
                  sidebarId={sidebarId}
                  onMainTabChange={handleMainTab}
                  onSidebarChange={setSidebarId}
                />
              </LoungeTvContentProtection>
            ) : null}
          </LoungeTvContentFrame>
        </div>
      ) : null}
    </div>
  );
}
