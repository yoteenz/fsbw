import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  LOUNGE_TV_MAIN_TABS,
  LOUNGE_TV_SIDEBAR,
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
import { LoungeTvWatchLearnPlayer } from './LoungeTvWatchLearnPlayer';
import { LoungeTvContentProtection } from './LoungeTvContentProtection';
import {
  hydrateLoungeTvAdminConfig,
  LOUNGE_TV_CONFIG_UPDATED_EVENT,
  resolveLoungeTvTiles,
} from '../../utils/loungeTvAdminConfig';
import { getLoungeTvAdminConfig } from '../../utils/api';
import {
  LOUNGE_TV_VIEWED_UPDATED_EVENT,
  loungeTvTileShowsAsNew,
  markLoungeTvTileViewed,
} from '../../utils/loungeTvViewedTiles';

const BRAND_RED = '#EB1C24';
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

const LOUNGE_TV_THUMB_GRID_COLUMN_GAP_PX = 12;
const LOUNGE_TV_BODY_SIDEBAR_GAP_PX = 8;

/** Default media insets until nav tabs are measured (sidebar + gap reserved). */
const LOUNGE_TV_MEDIA_INSET_DEFAULT = { left: 80, right: 0 };

const LOUNGE_TV_THUMB_LABEL_GRAY = '#9a9a9a';

const loungeTvThumbLabelBase: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 0,
  padding: '4px',
  textAlign: 'center',
  fontFamily: '"Futura PT Medium", Futura, sans-serif',
  fontSize: '8px',
  lineHeight: 1,
  textTransform: 'uppercase',
  background: 'linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0.65))',
  boxSizing: 'border-box',
};

const loungeTvThumbTitleBlockStyle: React.CSSProperties = {
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginTop: '8px',
};

const loungeTvNewBadgeOverlayStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: '100%',
  left: 0,
  right: 0,
  marginBottom: '1px',
  textAlign: 'center',
  fontFamily: '"Futura PT Medium", Futura, sans-serif',
  fontSize: '8px',
  lineHeight: 1,
  textTransform: 'uppercase',
  pointerEvents: 'none',
};

const loungeTvThumbTitleStackStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 0,
  textAlign: 'center',
};

/** "TINTING YOUR LACE" → { head: "TINTING", trail: "YOUR LACE" }. */
function loungeTvTitleSplit(title: string): { head: string; trail: string } | null {
  const marker = ' YOUR ';
  const i = title.indexOf(marker);
  if (i === -1) return null;
  return { head: title.slice(0, i), trail: title.slice(i + 1) };
}

function LoungeTvTileLabel({ title, showNew }: { title: string; showNew?: boolean }) {
  const split = loungeTvTitleSplit(title);
  const titleColor = showNew ? '#ffffff' : LOUNGE_TV_THUMB_LABEL_GRAY;

  return (
    <span style={loungeTvThumbLabelBase}>
      <span style={loungeTvThumbTitleBlockStyle}>
        {showNew ? (
          <span style={loungeTvNewBadgeOverlayStyle}>
            <span style={{ color: BRAND_RED }}>*NEW*</span>
          </span>
        ) : null}
        <span style={loungeTvThumbTitleStackStyle}>
          {split ? (
            <>
              <span style={{ color: titleColor }}>{split.head}</span>
              <span style={{ color: titleColor }}>{split.trail}</span>
            </>
          ) : (
            <span style={{ color: titleColor }}>{title}</span>
          )}
        </span>
      </span>
    </span>
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
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [tilesRevision, setTilesRevision] = useState(0);
  const [viewedRevision, setViewedRevision] = useState(0);
  const bodyRowRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const [mediaInsets, setMediaInsets] = useState(LOUNGE_TV_MEDIA_INSET_DEFAULT);
  const sidebar = LOUNGE_TV_SIDEBAR[mainTab];
  const tiles = useMemo(
    () => resolveLoungeTvTiles(mainTab, sidebarId),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh when admin saves TV content
    [mainTab, sidebarId, tilesRevision, viewedRevision]
  );

  useEffect(() => {
    const onConfigUpdated = () => setTilesRevision((n) => n + 1);
    window.addEventListener(LOUNGE_TV_CONFIG_UPDATED_EVENT, onConfigUpdated);
    return () => window.removeEventListener(LOUNGE_TV_CONFIG_UPDATED_EVENT, onConfigUpdated);
  }, []);

  useEffect(() => {
    const onViewedUpdated = () => setViewedRevision((n) => n + 1);
    window.addEventListener(LOUNGE_TV_VIEWED_UPDATED_EVENT, onViewedUpdated);
    return () => window.removeEventListener(LOUNGE_TV_VIEWED_UPDATED_EVENT, onViewedUpdated);
  }, []);

  useEffect(() => {
    if (!selectedVideoId) return;
    markLoungeTvTileViewed(selectedVideoId);
  }, [selectedVideoId]);
  const isWatchLearn = mainTab === 'watch-learn';
  const selectedTile =
    isWatchLearn && selectedVideoId && tiles
      ? tiles.find((t) => t.id === selectedVideoId && t.videoSrc) ?? null
      : null;

  useEffect(() => {
    if (!isWatchLearn) setSelectedVideoId(null);
  }, [isWatchLearn]);

  useEffect(() => {
    setSelectedVideoId(null);
  }, [sidebarId]);

  const measureMediaInsets = useCallback(() => {
    const bodyEl = bodyRowRef.current;
    const navEl = navRef.current;
    if (!bodyEl || !navEl) return;
    const slayBtn = navEl.querySelector<HTMLElement>('[data-lounge-tv-tab="slay-tips"]');
    const academyBtn = navEl.querySelector<HTMLElement>('[data-lounge-tv-tab="academy"]');
    if (!slayBtn || !academyBtn) return;
    const bodyRect = bodyEl.getBoundingClientRect();
    const slayRect = slayBtn.getBoundingClientRect();
    const academyRect = academyBtn.getBoundingClientRect();
    setMediaInsets({
      left: Math.max(0, Math.round(slayRect.left - bodyRect.left)),
      right: Math.max(0, Math.round(bodyRect.right - academyRect.right)),
    });
  }, []);

  useLayoutEffect(() => {
    measureMediaInsets();
    const raf = requestAnimationFrame(measureMediaInsets);
    window.addEventListener('resize', measureMediaInsets);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measureMediaInsets);
    };
  }, [measureMediaInsets, mainTab]);

  const handleMainTabClick = useCallback(
    (tab: LoungeTvMainTab) => {
      if (tab === 'watch-learn' && mainTab === 'watch-learn') {
        setSelectedVideoId(null);
        return;
      }
      setSelectedVideoId(null);
      onMainTabChange(tab);
    },
    [mainTab, onMainTabChange]
  );

  const handleSidebarClick = useCallback(
    (id: string) => {
      setSelectedVideoId(null);
      onSidebarChange(id);
    },
    [onSidebarChange]
  );

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
        textTransform: 'uppercase',
      }}
    >
      <nav
        ref={navRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          marginBottom: '10px',
          flexShrink: 0,
        }}
        aria-label="Lounge TV categories"
      >
        {LOUNGE_TV_MAIN_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            data-lounge-tv-tab={tab.id}
            style={mainTabNavStyle(mainTab === tab.id)}
            onClick={() => handleMainTabClick(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div
        ref={bodyRowRef}
        style={{
          position: 'relative',
          display: 'flex',
          flex: 1,
          minHeight: 0,
          gap: `${LOUNGE_TV_BODY_SIDEBAR_GAP_PX}px`,
        }}
      >
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
              onClick={() => handleSidebarClick(item.id)}
            >
              {item.label}
            </button>
          ))}
        </aside>

        <div
          style={{
            position: 'absolute',
            left: `${mediaInsets.left}px`,
            right: `${mediaInsets.right}px`,
            top: 0,
            bottom: 0,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {selectedTile ? (
            <LoungeTvWatchLearnPlayer tile={selectedTile} />
          ) : tiles && tiles.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                columnGap: `${LOUNGE_TV_THUMB_GRID_COLUMN_GAP_PX}px`,
                rowGap: '6px',
                width: '100%',
              }}
            >
              {tiles.map((tile) => {
                const showNew = loungeTvTileShowsAsNew(tile);
                return (
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
                  onClick={() => {
                    if (showNew) markLoungeTvTileViewed(tile.id);
                    if (isWatchLearn && tile.videoSrc) setSelectedVideoId(tile.id);
                  }}
                >
                  {tile.thumbSrc ? (
                    <img
                      src={tile.thumbSrc}
                      alt=""
                      draggable={false}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: 0.85,
                        display: 'block',
                        filter: showNew ? 'blur(4px)' : 'none',
                        transform: showNew ? 'scale(1.06)' : 'none',
                        transition: 'filter 0.25s ease',
                        WebkitUserDrag: 'none',
                      } as React.CSSProperties}
                    />
                  ) : null}
                  <LoungeTvTileLabel title={tile.title} showNew={showNew} />
                </button>
              );
              })}
            </div>
          ) : null}
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

  useEffect(() => {
    if (!isOpen) return;
    void hydrateLoungeTvAdminConfig(getLoungeTvAdminConfig);
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
    }, STATIC_ON_MS);
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
    isolation: 'isolate',
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
        </LoungeTvFrame>
      </div>
    </div>,
    document.body
  );
}
