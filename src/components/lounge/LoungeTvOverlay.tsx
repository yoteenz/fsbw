import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  getLoungeTvTiles,
  LOUNGE_TV_MAIN_TABS,
  LOUNGE_TV_SIDEBAR,
  loungeTvAcademyMessage,
  type LoungeTvMainTab,
} from './loungeTvContent';
import { LOUNGE_CURTAIN_LEFT_SRC, LOUNGE_CURTAIN_RIGHT_SRC, LOUNGE_TV_REMOTE_HAND_SRC } from './loungeTvAssets';
import {
  LOUNGE_TV_BEZEL,
  LOUNGE_TV_SCREEN_ASPECT,
  LOUNGE_TV_OVERLAY_SIZE_SCALE,
  LoungeTvFrame,
  loungeTvDimensionsFromScreenWidth,
} from './loungeTvFrame';
import { LoungeTvRemoteHand } from './LoungeTvRemoteHand';
import { LoungeTvPowerOnStatic } from './LoungeTvPowerOnStatic';
import { LoungeTvPowerOffEffect, LOUNGE_TV_POWER_OFF_MS } from './LoungeTvPowerOffEffect';

const BRAND_RED = '#EB1C24';
/** TV frame grow + curtain close. */
const ANIM_MS = 1400;
/** Remote hand fade-in after TV has finished growing (slower than TV grow). */
const HAND_REVEAL_MS = 2200;
/** Hand fade-out after screen is blank on power-off. */
const HAND_HIDE_MS = 850;
/** Pause after hand is fully visible before CRT static (“hand pressed power”). */
const STATIC_DELAY_MS = 280;
/** CRT static on screen before menu content. */
const STATIC_PHASE_MS = 900;

type LoungeTvClosePhase = 'idle' | 'zap' | 'hand-out' | 'shrink';
/** Panels overlap at center so fabric meets (assets should have no inner black gap). */
const CURTAIN_PANEL_WIDTH = '54vw';
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
};

function curtainPanelStyle(side: 'left' | 'right', closed: boolean): React.CSSProperties {
  return {
    position: 'fixed',
    top: 0,
    bottom: `-${CURTAIN_PANEL_BOTTOM_BLEED_PX}px`,
    minHeight: `calc(100dvh + ${CURTAIN_PANEL_BOTTOM_BLEED_PX}px + env(safe-area-inset-bottom, 0px))`,
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

function LoungeTvScreen({
  mainTab,
  sidebarId,
  onMainTabChange,
  onSidebarChange,
}: {
  mainTab: LoungeTvMainTab;
  sidebarId: string;
  onMainTabChange: (tab: LoungeTvMainTab) => void;
  onSidebarChange: (id: string) => void;
}) {
  const sidebar = LOUNGE_TV_SIDEBAR[mainTab];
  const tiles = getLoungeTvTiles(mainTab, sidebarId);
  const academy = mainTab === 'academy';

  const navLinkStyle = (active: boolean, accent?: boolean): React.CSSProperties => ({
    fontFamily: '"Futura PT Medium", Futura, sans-serif',
    fontSize: '9px',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: active || accent ? BRAND_RED : '#ffffff',
    background: 'none',
    border: 'none',
    padding: '2px 0',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  });

  const mainTabNavStyle = (active: boolean): React.CSSProperties => ({
    fontFamily: '"Futura PT Medium", Futura, sans-serif',
    fontSize: '9px',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: active ? '#ffffff' : '#9a9a9a',
    background: 'none',
    border: 'none',
    padding: '2px 0',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '10px 10px 12px 18px',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <nav
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'flex-start',
          gap: '6px 10px',
          marginBottom: '10px',
          flexShrink: 0,
        }}
        aria-label="Lounge TV categories"
      >
        {LOUNGE_TV_MAIN_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            style={mainTabNavStyle(mainTab === tab.id)}
            onClick={() => onMainTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div style={{ display: 'flex', flex: 1, minHeight: 0, gap: '8px' }}>
        <aside
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '6px',
            flexShrink: 0,
            width: '72px',
            paddingTop: '2px',
          }}
          aria-label="Subcategories"
        >
          {sidebar.map((item) => (
            <button
              key={item.id}
              type="button"
              style={{
                ...navLinkStyle(sidebarId === item.id, item.id === 'new-drops' && sidebarId === item.id),
                width: '100%',
                textAlign: 'left',
              }}
              onClick={() => onSidebarChange(item.id)}
            >
              {item.label}
            </button>
          ))}
        </aside>

        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: academy || tiles?.length === 0 ? 'center' : 'flex-start',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {academy ? (
            <p
              style={{
                fontFamily: '"Futura PT Medium", Futura, sans-serif',
                fontSize: '11px',
                color: BRAND_RED,
                textTransform: 'uppercase',
                textAlign: 'center',
                margin: 0,
                letterSpacing: '0.06em',
              }}
            >
              {loungeTvAcademyMessage(sidebarId)}
            </p>
          ) : tiles && tiles.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                columnGap: '12px',
                rowGap: '6px',
                width: '100%',
              }}
            >
              {tiles.map((tile) => (
                <button
                  key={tile.id}
                  type="button"
                  style={{
                    position: 'relative',
                    aspectRatio: '1',
                    padding: 0,
                    border: 'none',
                    background: '#1a1a1a',
                    cursor: 'pointer',
                    overflow: 'hidden',
                  }}
                  aria-label={tile.title}
                >
                  {tile.thumbSrc ? (
                    <img
                      src={tile.thumbSrc}
                      alt=""
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: 0.85,
                        display: 'block',
                      }}
                    />
                  ) : null}
                  <span
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '4px',
                      textAlign: 'center',
                      fontFamily: '"Futura PT Medium", Futura, sans-serif',
                      fontSize: '6px',
                      lineHeight: 1.15,
                      color: '#fff',
                      textTransform: 'uppercase',
                      background: 'linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0.65))',
                    }}
                  >
                    {tile.isNew ? (
                      <>
                        <span style={{ color: BRAND_RED }}>*NEW* </span>
                        {tile.title}
                      </>
                    ) : (
                      tile.title
                    )}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p
              style={{
                fontFamily: '"Futura PT Medium", Futura, sans-serif',
                fontSize: '10px',
                color: '#888',
                textTransform: 'uppercase',
                textAlign: 'center',
                margin: 0,
              }}
            >
              COMING SOON
            </p>
          )}
        </div>
      </div>
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

export function LoungeTvOverlay({ isOpen, originRect, onClose }: LoungeTvOverlayProps) {
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
  const [mainTab, setMainTab] = useState<LoungeTvMainTab>('brand');
  const [sidebarId, setSidebarId] = useState('new-drops');

  const requestClose = useCallback(() => {
    if (closePhase !== 'idle' || isClosingRef.current) return;
    if (!animatedIn) {
      onClose();
      return;
    }
    isClosingRef.current = true;
    setShowContent(false);
    setShowStatic(false);
    setClosePhase('zap');
    setPoweringOff(true);
  }, [closePhase, animatedIn, onClose]);

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

  useEffect(() => {
    if (isOpen) setVisible(true);
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
  }, []);

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
    if (!isOpen || !curtainsReady || closePhase !== 'idle' || isClosingRef.current) return;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (closePhase === 'idle' && !isClosingRef.current) setAnimatedIn(true);
      });
    });
    return () => cancelAnimationFrame(id);
  }, [isOpen, curtainsReady, closePhase]);

  useEffect(() => {
    if (!isOpen || !animatedIn || closePhase !== 'idle' || isClosingRef.current) return;
    const timer = window.setTimeout(() => {
      if (closePhase === 'idle' && !isClosingRef.current) setTvGrowDone(true);
    }, ANIM_MS);
    return () => window.clearTimeout(timer);
  }, [isOpen, animatedIn, closePhase]);

  useEffect(() => {
    if (!tvGrowDone || !remoteHandReady || closePhase !== 'idle' || isClosingRef.current) return;
    const timer = window.setTimeout(() => {
      if (closePhase === 'idle' && !isClosingRef.current) setHandRevealDone(true);
    }, HAND_REVEAL_MS);
    return () => window.clearTimeout(timer);
  }, [tvGrowDone, remoteHandReady, closePhase]);

  useEffect(() => {
    if (!handRevealDone || closePhase !== 'idle' || showContent || isClosingRef.current) return;
    const timer = window.setTimeout(() => {
      if (closePhase === 'idle' && !isClosingRef.current) setShowStatic(true);
    }, STATIC_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [handRevealDone, closePhase, showContent]);

  useEffect(() => {
    if (!showStatic || closePhase !== 'idle' || isClosingRef.current) return;
    const timer = window.setTimeout(() => {
      if (closePhase === 'idle' && !isClosingRef.current) {
        setShowStatic(false);
        setShowContent(true);
      }
    }, STATIC_PHASE_MS);
    return () => window.clearTimeout(timer);
  }, [showStatic, closePhase]);

  const handleRemoteHandLoaded = useCallback(() => {
    setRemoteHandReady(true);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') requestClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible, requestClose]);

  const handleMainTab = useCallback((tab: LoungeTvMainTab) => {
    setMainTab(tab);
    setSidebarId(LOUNGE_TV_SIDEBAR[tab][0]?.id ?? '');
  }, []);

  if (!visible || typeof document === 'undefined') return null;

  const handMounted = tvGrowDone && remoteHandReady && closePhase !== 'shrink';
  const handVisible = handMounted && (closePhase === 'idle' || closePhase === 'zap');

  /** Black glass through static, power-off, hand exit, and shrink-back to lobby. */
  const showTvBlackScreen = animatedIn || !isOpen || closePhase !== 'idle';

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let targetScreenW = Math.min(vw * 0.92, 380) * LOUNGE_TV_OVERLAY_SIZE_SCALE;
  let { frameW: targetFrameW, frameH: targetFrameH } = loungeTvDimensionsFromScreenWidth(targetScreenW);
  const maxFrameH = vh * 0.62 * LOUNGE_TV_OVERLAY_SIZE_SCALE;
  if (targetFrameH > maxFrameH) {
    targetFrameH = maxFrameH;
    const targetScreenH = targetFrameH - LOUNGE_TV_BEZEL.top - LOUNGE_TV_BEZEL.bottom;
    targetScreenW = targetScreenH / LOUNGE_TV_SCREEN_ASPECT;
    ({ frameW: targetFrameW } = loungeTvDimensionsFromScreenWidth(targetScreenW));
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
    position: 'fixed',
    zIndex: 110,
    overflow: 'visible',
    transition: `left ${ANIM_MS}ms cubic-bezier(0.4, 0, 0.2, 1), top ${ANIM_MS}ms cubic-bezier(0.4, 0, 0.2, 1), width ${ANIM_MS}ms cubic-bezier(0.4, 0, 0.2, 1), height ${ANIM_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
    left: animatedIn ? frameLeft : startFrameLeft,
    top: animatedIn ? frameTop : startFrameTop,
    width: animatedIn ? targetFrameW : startFrameW,
    height: animatedIn ? targetFrameH : startFrameH,
  };

  return createPortal(
    <div role="presentation" aria-hidden={!isOpen}>
      <button
        type="button"
        aria-label="Close lounge TV"
        onClick={requestClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99,
          border: 'none',
          padding: 0,
          margin: 0,
          background: animatedIn && closePhase === 'idle' ? 'rgba(0,0,0,0.35)' : 'transparent',
          cursor: closePhase === 'idle' && isOpen ? 'pointer' : 'default',
          pointerEvents: closePhase === 'idle' && isOpen ? 'auto' : 'none',
          transition: `background ${ANIM_MS}ms ease`,
        }}
      />
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
      <div style={framePositionStyle} role="dialog" aria-modal="true" aria-label="Lounge media">
        <LoungeTvFrame
          fill
          closeVisible={animatedIn && closePhase === 'idle'}
          onClose={() => requestClose()}
          screenStyle={{
            opacity: showTvBlackScreen ? 1 : 0,
            transition: 'opacity 220ms ease',
          }}
        >
          <LoungeTvPowerOnStatic active={showStatic && !poweringOff} />
          <LoungeTvPowerOffEffect active={poweringOff} />
          {showContent && !poweringOff ? (
            <div
              style={{
                position: 'relative',
                zIndex: 6,
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
            </div>
          ) : null}
        </LoungeTvFrame>
      </div>
    </div>,
    document.body
  );
}
