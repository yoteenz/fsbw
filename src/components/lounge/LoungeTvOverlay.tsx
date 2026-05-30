import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  getLoungeTvTiles,
  LOUNGE_TV_MAIN_TABS,
  LOUNGE_TV_SIDEBAR,
  loungeTvAcademyMessage,
  type LoungeTvMainTab,
} from './loungeTvContent';
import { LOUNGE_CURTAIN_LEFT_SRC, LOUNGE_CURTAIN_RIGHT_SRC, LOUNGE_TV_REMOTE_HAND_SRC } from './loungeTvAssets';
import { LoungeTvRemoteHand } from './LoungeTvRemoteHand';

const BRAND_RED = '#EB1C24';
const ANIM_MS = 1400;
/** Panels overlap at center so fabric meets (assets should have no inner black gap). */
const CURTAIN_PANEL_WIDTH = '54vw';
/** Bezel around the glass area so the overlay reads as a TV, not a floating black card. */
const TV_BEZEL = { top: 11, right: 11, bottom: 16, left: 11 };

type LoungeTvOverlayProps = {
  isOpen: boolean;
  originRect: DOMRect | null;
  onClose: () => void;
};

function curtainPanelStyle(side: 'left' | 'right', closed: boolean): React.CSSProperties {
  return {
    position: 'fixed',
    top: 0,
    bottom: 0,
    width: CURTAIN_PANEL_WIDTH,
    zIndex: 100,
    overflow: 'hidden',
    backgroundColor: '#3a3a3a',
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
          inset: 0,
          width: '100%',
          height: '100%',
          display: 'block',
          objectFit: 'cover',
          objectPosition: isLeft ? 'left center' : 'right center',
          transform: isLeft ? 'translateX(-3%)' : 'translateX(3%)',
          transformOrigin: isLeft ? 'left center' : 'right center',
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
  const [mainTab, setMainTab] = useState<LoungeTvMainTab>('brand');
  const [sidebarId, setSidebarId] = useState('new-drops');

  const requestClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) setVisible(true);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setShowContent(false);
      setAnimatedIn(false);
      return;
    }
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
    if (!isOpen || !curtainsReady) return;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setAnimatedIn(true));
    });
    return () => cancelAnimationFrame(id);
  }, [isOpen, curtainsReady]);

  useEffect(() => {
    if (!isOpen || !animatedIn || !curtainsReady) return;
    const timer = window.setTimeout(() => setShowContent(true), ANIM_MS);
    return () => window.clearTimeout(timer);
  }, [isOpen, animatedIn, curtainsReady]);

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
  const targetW = Math.min(vw * 0.92, 380);
  const targetH = Math.min(vh * 0.58, targetW * 0.72);
  const targetLeft = (vw - targetW) / 2;
  const targetTop = (vh - targetH) / 2;

  const startW = originRect ? Math.max(originRect.width, 40) : targetW * 0.28;
  const startH = originRect ? Math.max(originRect.height, 30) : targetH * 0.28;
  const startLeft = originRect ? originRect.left + originRect.width / 2 - startW / 2 : targetLeft;
  const startTop = originRect ? originRect.top + originRect.height / 2 - startH / 2 : targetTop;

  const frameW = targetW + TV_BEZEL.left + TV_BEZEL.right;
  const frameH = targetH + TV_BEZEL.top + TV_BEZEL.bottom;
  const frameLeft = (vw - frameW) / 2;
  const frameTop = (vh - frameH) / 2;
  const startFrameW = startW + TV_BEZEL.left + TV_BEZEL.right;
  const startFrameH = startH + TV_BEZEL.top + TV_BEZEL.bottom;
  const startFrameLeft = startLeft - TV_BEZEL.left;
  const startFrameTop = startTop - TV_BEZEL.top;

  const frameStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 110,
    boxSizing: 'border-box',
    padding: `${TV_BEZEL.top}px ${TV_BEZEL.right}px ${TV_BEZEL.bottom}px ${TV_BEZEL.left}px`,
    background: 'linear-gradient(165deg, #454545 0%, #262626 38%, #121212 100%)',
    borderRadius: 0,
    border: '1px solid #0a0a0a',
    boxShadow:
      '0 14px 42px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -2px 4px rgba(0,0,0,0.45)',
    transition: `left ${ANIM_MS}ms cubic-bezier(0.4, 0, 0.2, 1), top ${ANIM_MS}ms cubic-bezier(0.4, 0, 0.2, 1), width ${ANIM_MS}ms cubic-bezier(0.4, 0, 0.2, 1), height ${ANIM_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
    left: animatedIn ? frameLeft : startFrameLeft,
    top: animatedIn ? frameTop : startFrameTop,
    width: animatedIn ? frameW : startFrameW,
    height: animatedIn ? frameH : startFrameH,
  };

  const screenStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
    boxSizing: 'border-box',
    overflow: 'hidden',
    borderRadius: 0,
    boxShadow: 'inset 0 0 28px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.06)',
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
      <LoungeTvRemoteHand visible={showContent} />
      <div style={frameStyle} role="dialog" aria-modal="true" aria-label="Lounge media">
        <button
          type="button"
          aria-label="Close lounge TV"
          onClick={(e) => {
            e.stopPropagation();
            requestClose();
          }}
          style={{
            position: 'absolute',
            top: 6,
            right: 6,
            zIndex: 3,
            margin: 0,
            padding: 6,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            lineHeight: 0,
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
            opacity: animatedIn ? 1 : 0,
            pointerEvents: animatedIn ? 'auto' : 'none',
            transition: 'opacity 200ms ease',
          }}
        >
          <img src="/assets/close-icon.svg" alt="" width={16} height={16} draggable={false} />
        </button>
        <div
          style={{
            ...screenStyle,
            opacity: showContent ? 1 : 0,
            transition: showContent ? 'opacity 280ms ease' : 'none',
          }}
        >
          {showContent ? (
            <LoungeTvScreen
              mainTab={mainTab}
              sidebarId={sidebarId}
              onMainTabChange={handleMainTab}
              onSidebarChange={setSidebarId}
            />
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
}
