import type React from 'react';
import {
  LOUNGE_TV_DESIGN_ASPECT,
  LOUNGE_TV_DESIGN_PLAY_ANCHOR,
  LOUNGE_TV_DESIGN_SCREEN_RECT,
  LOUNGE_TV_DESIGN_SRC,
} from './loungeTvAssets';

/** Charcoal plastic bezel (shared by lounge lobby TV + overlay animation). */
export const LOUNGE_TV_BEZEL = { top: 5, right: 5, bottom: 8, left: 5 };

/** Inner glass aspect (width × height). */
export const LOUNGE_TV_SCREEN_ASPECT = 0.72;

/** Lobby lounge slide static TV — extra outer width (px). */
export const LOUNGE_LOBBY_TV_EXTRA_FRAME_WIDTH_PX = 36;

/** Lobby lounge slide — TV anchor nudge from viewport center. */
export const LOUNGE_LOBBY_TV_OFFSET_X_PX = 53;
export const LOUNGE_LOBBY_TV_OFFSET_Y_PX = -10;

/** Expanded overlay TV size multiplier (1 = full computed size). */
export const LOUNGE_TV_OVERLAY_SIZE_SCALE = 0.896;

/** Lobby lounge TV play control tint (white PNG masked to this color). */
export const LOUNGE_TV_PLAY_BUTTON_COLOR = '#535453';

/** Matches affiliate photo delete control (`account/affiliate/page.tsx`). */
export const AFFILIATE_CLOSE_ICON_FILTER =
  'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)';

/** Lounge TV close chip — mid bezel gray (`loungeTvFrameShellStyle` gradient). */
export const LOUNGE_TV_CLOSE_BUTTON_BG = '#454545';

/** Light gray X on lounge TV close (not brand red). */
export const LOUNGE_TV_CLOSE_ICON_FILTER =
  'brightness(0) saturate(100%) invert(78%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(95%) contrast(90%)';

/** Above all in-screen layers (static z-index 4, power-off 8, content/capture up to 50). */
export const LOUNGE_TV_CLOSE_BUTTON_Z_INDEX = 100;

export function loungeTvDimensionsFromScreenWidth(screenW: number) {
  const screenH = screenW * LOUNGE_TV_SCREEN_ASPECT;
  return {
    screenW,
    screenH,
    frameW: screenW + LOUNGE_TV_BEZEL.left + LOUNGE_TV_BEZEL.right,
    frameH: screenH + LOUNGE_TV_BEZEL.top + LOUNGE_TV_BEZEL.bottom,
  };
}

export function loungeTvDimensionsFromFrameHeight(frameH: number) {
  const screenH = frameH - LOUNGE_TV_BEZEL.top - LOUNGE_TV_BEZEL.bottom;
  const screenW = screenH / LOUNGE_TV_SCREEN_ASPECT;
  return loungeTvDimensionsFromScreenWidth(screenW);
}

/** Overlay + animation sizing from `lounge-tv-design.png` glass width. */
export function loungeTvDesignDimensionsFromScreenWidth(screenW: number) {
  const frameW = screenW / LOUNGE_TV_DESIGN_SCREEN_RECT.width;
  const frameH = frameW / LOUNGE_TV_DESIGN_ASPECT;
  const screenH = frameH * LOUNGE_TV_DESIGN_SCREEN_RECT.height;
  return { frameW, frameH, screenW, screenH };
}

/** Overlay + animation sizing from full PNG frame height. */
export function loungeTvDesignDimensionsFromFrameHeight(frameH: number) {
  const frameW = frameH * LOUNGE_TV_DESIGN_ASPECT;
  const screenW = frameW * LOUNGE_TV_DESIGN_SCREEN_RECT.width;
  const screenH = frameH * LOUNGE_TV_DESIGN_SCREEN_RECT.height;
  return { frameW, frameH, screenW, screenH };
}

/** Absolute centering for the lobby static-TV play control on the design PNG. */
export function loungeLobbyTvDesignPlayButtonStyle(): React.CSSProperties {
  return {
    position: 'absolute',
    left: `${LOUNGE_TV_DESIGN_PLAY_ANCHOR.x * 100}%`,
    top: `${LOUNGE_TV_DESIGN_PLAY_ANCHOR.y * 100}%`,
    transform: 'translate(-50%, -50%)',
  };
}

export function loungeTvFrameShellStyle(overrides?: React.CSSProperties): React.CSSProperties {
  return {
    boxSizing: 'border-box',
    padding: `${LOUNGE_TV_BEZEL.top}px ${LOUNGE_TV_BEZEL.right}px ${LOUNGE_TV_BEZEL.bottom}px ${LOUNGE_TV_BEZEL.left}px`,
    background: 'linear-gradient(165deg, #454545 0%, #262626 38%, #121212 100%)',
    borderRadius: 0,
    border: '1px solid #0a0a0a',
    boxShadow:
      '0 10px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 2px rgba(0,0,0,0.35)',
    ...overrides,
  };
}

export function loungeTvScreenStyle(overrides?: React.CSSProperties): React.CSSProperties {
  return {
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
    boxSizing: 'border-box',
    overflow: 'hidden',
    borderRadius: 0,
    boxShadow: 'inset 0 0 16px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.05)',
    position: 'relative',
    zIndex: 0,
    ...overrides,
  };
}

type LoungeTvCloseButtonProps = {
  visible: boolean;
  onClick: (e: React.MouseEvent) => void;
};

export function LoungeTvCloseButton({ visible, onClick }: LoungeTvCloseButtonProps) {
  return (
    <button
      type="button"
      aria-label="Close lounge TV"
      onClick={onClick}
      style={{
        position: 'absolute',
        top: -8,
        right: -8,
        zIndex: LOUNGE_TV_CLOSE_BUTTON_Z_INDEX,
        width: 22,
        height: 22,
        margin: 0,
        padding: 0,
        border: '0.97px solid #0a0a0a',
        borderRadius: '50%',
        backgroundColor: LOUNGE_TV_CLOSE_BUTTON_BG,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 200ms ease',
      }}
    >
      <img
        src="/assets/close-icon.svg"
        alt=""
        width={12}
        height={12}
        draggable={false}
        style={{
          display: 'block',
          objectFit: 'contain',
          filter: LOUNGE_TV_CLOSE_ICON_FILTER,
        }}
      />
    </button>
  );
}

type LoungeTvFrameProps = {
  /** When true, fills the parent (overlay animation wrapper). */
  fill?: boolean;
  frameWidth?: number;
  frameHeight?: number;
  children?: React.ReactNode;
  shellStyle?: React.CSSProperties;
  screenStyle?: React.CSSProperties;
  closeVisible?: boolean;
  onClose?: (e: React.MouseEvent) => void;
};

function loungeTvDesignScreenInsetStyle(
  overrides?: React.CSSProperties
): React.CSSProperties {
  const { left, top, width, height } = LOUNGE_TV_DESIGN_SCREEN_RECT;
  const {
    position: _position,
    width: _width,
    height: _height,
    ...screenBase
  } = loungeTvScreenStyle(overrides);
  return {
    ...screenBase,
    position: 'absolute',
    left: `${left * 100}%`,
    top: `${top * 100}%`,
    width: `${width * 100}%`,
    height: `${height * 100}%`,
    boxSizing: 'border-box',
    overflow: 'hidden',
    zIndex: 1,
  };
}

type LoungeTvDesignFrameProps = {
  fill?: boolean;
  frameWidth?: number;
  frameHeight?: number;
  children?: React.ReactNode;
  screenStyle?: React.CSSProperties;
  closeVisible?: boolean;
  onClose?: (e: React.MouseEvent) => void;
};

/** Lounge TV shell using baked `lounge-tv-design.png` (lobby overlay animation). */
export function LoungeTvDesignFrame({
  fill = false,
  frameWidth,
  frameHeight,
  children,
  screenStyle,
  closeVisible = false,
  onClose,
}: LoungeTvDesignFrameProps) {
  return (
    <div
      style={{
        position: 'relative',
        width: fill ? '100%' : frameWidth,
        height: fill ? '100%' : frameHeight,
        overflow: 'visible',
        isolation: 'isolate',
        lineHeight: 0,
      }}
    >
      <img
        src={LOUNGE_TV_DESIGN_SRC}
        alt=""
        draggable={false}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />
      <div style={loungeTvDesignScreenInsetStyle(screenStyle)}>{children}</div>
      {onClose ? (
        <LoungeTvCloseButton
          visible={closeVisible ?? false}
          onClick={(e) => {
            e.stopPropagation();
            onClose(e);
          }}
        />
      ) : null}
    </div>
  );
}

/** @deprecated CSS gradient bezel — overlay uses {@link LoungeTvDesignFrame}. */
export function LoungeTvFrame({
  fill = false,
  frameWidth,
  frameHeight,
  children,
  shellStyle,
  screenStyle,
  closeVisible = false,
  onClose,
}: LoungeTvFrameProps) {
  return (
    <div
      style={{
        position: 'relative',
        width: fill ? '100%' : frameWidth,
        height: fill ? '100%' : frameHeight,
        overflow: 'visible',
        isolation: 'isolate',
        ...loungeTvFrameShellStyle(shellStyle),
      }}
    >
      <div style={loungeTvScreenStyle(screenStyle)}>{children}</div>
      {onClose ? (
        <LoungeTvCloseButton
          visible={closeVisible ?? false}
          onClick={(e) => {
            e.stopPropagation();
            onClose(e);
          }}
        />
      ) : null}
    </div>
  );
}
