import type React from 'react';

/** Charcoal plastic bezel (shared by lounge lobby TV + overlay animation). */
export const LOUNGE_TV_BEZEL = { top: 11, right: 11, bottom: 16, left: 11 };

/** Inner glass aspect (width × height). */
export const LOUNGE_TV_SCREEN_ASPECT = 0.72;

/** Lobby lounge slide static TV — extra outer width (px). */
export const LOUNGE_LOBBY_TV_EXTRA_FRAME_WIDTH_PX = 32;

/** Expanded overlay TV size multiplier (1 = full computed size). */
export const LOUNGE_TV_OVERLAY_SIZE_SCALE = 0.896;

/** Lobby lounge TV play control tint (white PNG masked to this color). */
export const LOUNGE_TV_PLAY_BUTTON_COLOR = '#535453';

/** Matches affiliate photo delete control (`account/affiliate/page.tsx`). */
export const AFFILIATE_CLOSE_ICON_FILTER =
  'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)';

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

export function loungeTvFrameShellStyle(overrides?: React.CSSProperties): React.CSSProperties {
  return {
    boxSizing: 'border-box',
    padding: `${LOUNGE_TV_BEZEL.top}px ${LOUNGE_TV_BEZEL.right}px ${LOUNGE_TV_BEZEL.bottom}px ${LOUNGE_TV_BEZEL.left}px`,
    background: 'linear-gradient(165deg, #454545 0%, #262626 38%, #121212 100%)',
    borderRadius: 0,
    border: '1px solid #0a0a0a',
    boxShadow:
      '0 14px 42px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -2px 4px rgba(0,0,0,0.45)',
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
    boxShadow: 'inset 0 0 28px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.06)',
    position: 'relative',
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
        zIndex: 3,
        width: 22,
        height: 22,
        margin: 0,
        padding: 0,
        border: '0.97px solid #000000',
        borderRadius: '50%',
        backgroundColor: '#FFFFFF',
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
          filter: AFFILIATE_CLOSE_ICON_FILTER,
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

/** Lounge TV hardware shell (bezel + black glass); same look on lobby and overlay. */
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
        ...loungeTvFrameShellStyle(shellStyle),
      }}
    >
      {onClose ? (
        <LoungeTvCloseButton
          visible={closeVisible ?? false}
          onClick={(e) => {
            e.stopPropagation();
            onClose(e);
          }}
        />
      ) : null}
      <div style={loungeTvScreenStyle(screenStyle)}>{children}</div>
    </div>
  );
}
