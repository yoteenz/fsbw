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
const ANIM_MS = 1400;
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

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '10px 8px 12px',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <nav
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          gap: '6px 4px',
          marginBottom: '10px',
          flexShrink: 0,
        }}
        aria-label="Lounge TV categories"
      >
        {LOUNGE_TV_MAIN_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            style={navLinkStyle(mainTab === tab.id)}
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
              style={navLinkStyle(sidebarId === item.id, item.id === 'new-drops' && sidebarId === item.id)}
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
                gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                gap: '6px',
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
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}

export function LoungeTvOverlay({ isOpen, originRect, onClose }: LoungeTvOverlayProps) {
  const [visible, setVisible] = useState(false);
  const [animatedIn, setAnimatedIn] = useState(false);
  const [curtainsReady, setCurtainsReady] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [poweringOff, setPoweringOff] = useState(false);
  const isClosingRef = useRef(false);
  const [mainTab, setMainTab] = useState<LoungeTvMainTab>('brand');
  const [sidebarId, setSidebarId] = useState('new-drops');

  const requestClose = useCallback(() => {
    if (poweringOff || isClosingRef.current) return;
    if (!animatedIn) {
      onClose();
      return;
    }
    isClosingRef.current = true;
    setShowContent(false);
    setPoweringOff(true);
  }, [poweringOff, animatedIn, onClose]);

  useEffect(() => {
    if (!poweringOff) return;
    const timer = window.setTimeout(() => {
      setPoweringOff(false);
      onClose();
    }, LOUNGE_TV_POWER_OFF_MS);
    return () => window.clearTimeout(timer);
  }, [poweringOff, onClose]);

  useEffect(() => {
    if (isOpen) setVisible(true);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setShowContent(false);
      setPoweringOff(false);
      setAnimatedIn(false);
      isClosingRef.current = false;
      return;
    }
    isClosingRef.current = false;
    setPoweringOff(false);
    setCurtainsReady(false);
    let cancelled = false;
    Promise.all([
      preloadImage(LOUNGE_CURTAIN_LEFT_SRC),
      preloadImage(LOUNGE_CURTAIN_RIGHT_SRC),
      preloadImage(LOUNGE_TV_REMOTE_HAND_SRC),
    ]).then(() => {
      if (!cancelled) setCurtainsReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen || !visible) return;
    const timer = window.setTimeout(() => {
      setVisible(false);
      setCurtainsReady(false);
    }, ANIM_MS);
    return () => window.clearTimeout(timer);
  }, [isOpen, visible]);

  useEffect(() => {
    if (!isOpen || !curtainsReady || isClosingRef.current || poweringOff) return;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!isClosingRef.current && !poweringOff) setAnimatedIn(true);
      });
    });
    return () => cancelAnimationFrame(id);
  }, [isOpen, curtainsReady, poweringOff]);

  useEffect(() => {
    if (!isOpen || !animatedIn || !curtainsReady || isClosingRef.current || poweringOff) return;
    const timer = window.setTimeout(() => {
      if (!isClosingRef.current && !poweringOff) setShowContent(true);
    }, ANIM_MS);
    return () => window.clearTimeout(timer);
  }, [isOpen, animatedIn, curtainsReady, poweringOff]);

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
          background: animatedIn ? 'rgba(0,0,0,0.35)' : 'transparent',
          cursor: 'pointer',
          transition: `background ${ANIM_MS}ms ease`,
        }}
      />
      <LoungeCurtainPanel side="left" closed={animatedIn} />
      <LoungeCurtainPanel side="right" closed={animatedIn} />
      <LoungeTvRemoteHand visible={showContent && !poweringOff} />
      <div style={framePositionStyle} role="dialog" aria-modal="true" aria-label="Lounge media">
        <LoungeTvFrame
          fill
          closeVisible={animatedIn && !poweringOff}
          onClose={() => requestClose()}
          screenStyle={{
            opacity: animatedIn ? 1 : 0,
            transition: animatedIn ? 'opacity 220ms ease' : 'none',
          }}
        >
          <LoungeTvPowerOnStatic active={animatedIn && !showContent && !poweringOff} />
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
