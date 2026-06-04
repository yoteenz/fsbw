import React, { useRef } from 'react';
import type { LobbyPaymentIcon, LobbyPaymentPopoverLayout } from '../../constants/lobbyPaymentIcons';
import {
  LOBBY_CASE_POPOVER_MIN_HEIGHT_PX,
  LOBBY_CASE_POPOVER_OPEN_Z_INDEX,
  LOBBY_CASE_POPOVER_SCALE,
  LOBBY_CASE_POPOVER_WIDTH_PX,
  LOBBY_KLARNA_PAYMENT_ICON_ROTATION_DEG,
  LOBBY_PAYMENT_ACCEPTED_CARDS_LABEL,
  LOBBY_PAYMENT_EXPRESS_LABEL,
  LOBBY_PAYMENT_PAY_OVER_TIME_LABEL,
} from '../../constants/lobbyPaymentIcons';
import {
  LOBBY_CASE_POPOVER_GAP_ABOVE_PROP,
  LOBBY_CASE_POPOVER_MIN_HEIGHT,
  LOBBY_CASE_POPOVER_PADDING,
  LOBBY_CASE_POPOVER_WIDTH,
  lobbyCaseCqw,
} from './lobbyCaseResponsive';

/** Scale base popover px values (35% reduction = 0.65 scale). */
function lobbyPopoverPx(px: number): number {
  return Math.round(px * LOBBY_CASE_POPOVER_SCALE);
}

const LOBBY_POPOVER_BOHEMY_FONT_PX = lobbyPopoverPx(15) + 3;
/** Payment popover section labels only — 2px smaller than contact Bohemy headers. */
const LOBBY_POPOVER_PAYMENT_BOHEMY_FONT_PX = LOBBY_POPOVER_BOHEMY_FONT_PX - 2;
const LOBBY_POPOVER_PAY_OVER_TIME_ICON_MAX_PX = lobbyPopoverPx(22) + 2;
/** Register popover — space above `accepted cards` label. */
const LOBBY_REGISTER_ACCEPTED_CARDS_LABEL_MARGIN_TOP_PX = 2;
/** Register popover — gap below `payment plans` label (default section label→icons is `lobbyPopoverPx(6)`). */
const LOBBY_REGISTER_PAYMENT_PLANS_LABEL_TO_ICONS_GAP_PX = lobbyPopoverPx(6) - 2;
/** Register popover — pull Afterpay/Klarna toward Affirm (−2px per side vs prior −4). */
const LOBBY_REGISTER_PAYMENT_PLANS_AFFIRM_GUTTER_NUDGE_PX = 6;
/** Close X — top/right inset; nudge may be negative (see LOBBY_POPOVER_CLOSE_NUDGE_UP_RIGHT_PX). */
const LOBBY_POPOVER_CLOSE_INSET_BASE_PX = lobbyPopoverPx(5);
/** +8px up/right from base (do not clamp — scaled base is only ~3px). */
const LOBBY_POPOVER_CLOSE_NUDGE_UP_RIGHT_PX = 8;
const LOBBY_POPOVER_CLOSE_TOP_PX =
  LOBBY_POPOVER_CLOSE_INSET_BASE_PX - LOBBY_POPOVER_CLOSE_NUDGE_UP_RIGHT_PX;
const LOBBY_POPOVER_CLOSE_RIGHT_PX =
  LOBBY_POPOVER_CLOSE_INSET_BASE_PX - LOBBY_POPOVER_CLOSE_NUDGE_UP_RIGHT_PX;
const LOBBY_POPOVER_CLOSE_BTN_PX = lobbyPopoverPx(18);

type ContactPopoverLine =
  | { text: string; emphasis?: 'futura-medium-gray' }
  | { parts: readonly { text: string; emphasis?: 'futura-medium-gray' }[] };

export type LobbyCasePropPopoverSection = {
  heading: string;
  lines: readonly ContactPopoverLine[];
};

type LobbyCasePropPopoverProps = {
  popoverId: string;
  activeId: string | null;
  onActivate: (id: string) => void;
  onClose: () => void;
  ariaLabel: string;
  title: string;
  /** Contact copy (phone). */
  sections?: readonly LobbyCasePropPopoverSection[];
  /** Payment logos (register) — grouped layout. */
  paymentLayout?: LobbyPaymentPopoverLayout;
  /** Nudge panel when anchored near viewport edge (register = left, phone = right). */
  align?: 'center' | 'left' | 'right';
  /** Extra px above the prop (legacy). Prefer `panelOffsetUp` when `responsive`. */
  panelOffsetUpPx?: number;
  /** Lift above prop (`calc` value, e.g. `-14px` or `-3.6cqw`). */
  panelOffsetUp?: string;
  /** Scale panel with {@link LobbyDisplayCaseShell} (`container-type: size`). */
  responsive?: boolean;
  children: React.ReactNode;
};

const popoverPanelGlassStyle: React.CSSProperties = {
  backgroundColor: 'rgba(255, 255, 255, 0.6)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
};

/** Brand red — matches account/affiliate close-icon filter. */
const LOBBY_POPOVER_CLOSE_ICON_FILTER =
  'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)';

function LobbyPopoverCloseButton({ onClose }: { onClose: () => void }) {
  const btnPx = LOBBY_POPOVER_CLOSE_BTN_PX;
  const iconPx = lobbyPopoverPx(10);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      aria-label="Close"
      style={{
        width: `${btnPx}px`,
        height: `${btnPx}px`,
        backgroundColor: '#FFFFFF',
        border: '0.97px solid #000000',
        borderRadius: '50%',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        flexShrink: 0,
        margin: 0,
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
      }}
    >
      <img
        src="/assets/close-icon.svg"
        alt=""
        draggable={false}
        style={{
          width: `${iconPx}px`,
          height: `${iconPx}px`,
          display: 'block',
          objectFit: 'contain',
          filter: LOBBY_POPOVER_CLOSE_ICON_FILTER,
        }}
      />
    </button>
  );
}

const titleStyle: React.CSSProperties = {
  fontFamily: '"Futura PT Medium", Futura, sans-serif',
  fontSize: `${lobbyPopoverPx(10)}px`,
  fontWeight: 500,
  color: '#000',
  textTransform: 'uppercase',
  margin: 0,
  letterSpacing: '0.02em',
};

const lobbyBohemyLabelStyle: React.CSSProperties = {
  margin: 0,
  lineHeight: 1.2,
  textTransform: 'none',
  fontFamily: '"Bohemy", cursive',
  fontSize: `${LOBBY_POPOVER_BOHEMY_FONT_PX}px`,
  color: '#EB1C24',
  fontWeight: 400,
};

const contactSectionHeadingStyle: React.CSSProperties = {
  ...lobbyBohemyLabelStyle,
  textAlign: 'center',
  margin: `0 0 ${lobbyPopoverPx(4)}px`,
};

const lineStyle: React.CSSProperties = {
  fontFamily: '"Futura PT Book", Futura, sans-serif',
  fontSize: `${lobbyPopoverPx(9)}px`,
  color: '#000',
  textTransform: 'uppercase',
  margin: 0,
  lineHeight: 1.45,
  letterSpacing: '0.02em',
  textAlign: 'center',
};

const contactLineMediumGrayStyle: React.CSSProperties = {
  ...lineStyle,
  fontFamily: '"Futura PT Medium", Futura, sans-serif',
  fontWeight: 500,
  color: '#808080',
};

function contactLineStyle(line: { emphasis?: 'futura-medium-gray' }): React.CSSProperties {
  return line.emphasis === 'futura-medium-gray' ? contactLineMediumGrayStyle : lineStyle;
}

function ContactPopoverLine({ line }: { line: ContactPopoverLine }) {
  const paragraphStyle = {
    ...lineStyle,
    marginBottom: `${lobbyPopoverPx(2)}px`,
  };

  if ('parts' in line) {
    return (
      <p style={paragraphStyle}>
        {line.parts.map((part, index) => (
          <span
            key={`${index}-${part.text}`}
            style={part.emphasis === 'futura-medium-gray' ? contactLineMediumGrayStyle : undefined}
          >
            {part.text}
          </span>
        ))}
      </p>
    );
  }

  return (
    <p style={{ ...contactLineStyle(line), marginBottom: `${lobbyPopoverPx(2)}px` }}>{line.text}</p>
  );
}

const lobbyPaymentBohemyLabelStyle: React.CSSProperties = {
  ...lobbyBohemyLabelStyle,
  textAlign: 'center',
  fontSize: `${LOBBY_POPOVER_PAYMENT_BOHEMY_FONT_PX}px`,
};

const paymentLogoImgStyle: React.CSSProperties = {
  display: 'block',
  width: 'auto',
  height: 'auto',
  objectFit: 'contain',
};

function panelPositionStyle(align: 'center' | 'left' | 'right'): React.CSSProperties {
  if (align === 'left') {
    return { left: 0, transform: 'none' };
  }
  if (align === 'right') {
    return { right: 0, left: 'auto', transform: 'none' };
  }
  return { left: '50%', transform: 'translateX(-50%)' };
}

function PaymentIconCell({
  icon,
  maxHeightPx,
  justifySelf,
  cellMarginAdjust,
}: {
  icon: LobbyPaymentIcon;
  maxHeightPx: number;
  justifySelf?: React.CSSProperties['justifySelf'];
  /** Payment-plans row — per-logo margin nudge (e.g. pull Afterpay/Klarna toward Affirm). */
  cellMarginAdjust?: Pick<React.CSSProperties, 'marginLeft' | 'marginRight'>;
}) {
  const tiltDeg =
    icon.rotationDeg ?? (icon.id === 'klarna' ? LOBBY_KLARNA_PAYMENT_ICON_ROTATION_DEG : 0);
  /** Extra room so rotated logos are not squeezed by maxWidth: 100% in a narrow grid cell. */
  const tiltPadPx = tiltDeg ? Math.max(3, Math.round(Math.abs(tiltDeg) * 0.75)) : 0;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 0,
        minHeight: `${maxHeightPx + lobbyPopoverPx(4) + tiltPadPx * 2}px`,
        padding: `${lobbyPopoverPx(2) + tiltPadPx}px ${tiltPadPx}px`,
        overflow: 'visible',
        justifySelf,
        ...cellMarginAdjust,
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          lineHeight: 0,
          transform: tiltDeg ? `rotate(${tiltDeg}deg)` : undefined,
          transformOrigin: 'center center',
        }}
      >
        <img
          src={icon.src}
          alt={icon.label}
          draggable={false}
          style={{
            ...paymentLogoImgStyle,
            width: 'auto',
            height: 'auto',
            maxHeight: `${maxHeightPx}px`,
            maxWidth: tiltDeg ? `${maxHeightPx * 2.2}px` : '100%',
          }}
        />
      </div>
    </div>
  );
}

function paymentPlansIconCellMarginAdjust(
  icon: LobbyPaymentIcon,
): Pick<React.CSSProperties, 'marginLeft' | 'marginRight'> | undefined {
  /** Outer logos already `justifySelf` toward center — nudge into Affirm gutters. */
  if (icon.id === 'afterpay') return { marginRight: -LOBBY_REGISTER_PAYMENT_PLANS_AFFIRM_GUTTER_NUDGE_PX };
  if (icon.id === 'klarna') return { marginLeft: -LOBBY_REGISTER_PAYMENT_PLANS_AFFIRM_GUTTER_NUDGE_PX };
  return undefined;
}

function LobbyPopoverSections({ sections }: { sections: readonly LobbyCasePropPopoverSection[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${lobbyPopoverPx(10)}px`, flex: 1 }}>
      {sections.map((section) => (
        <div key={section.heading}>
          <p style={contactSectionHeadingStyle}>{section.heading}</p>
          {section.lines.map((line, index) => (
            <ContactPopoverLine
              key={'parts' in line ? `parts-${index}` : line.text}
              line={line}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function payInFourIconJustifySelf(
  index: number,
  count: number
): React.CSSProperties['justifySelf'] | undefined {
  if (count !== 3) return undefined;
  if (index === 0) return 'end';
  if (index === count - 1) return 'start';
  return 'center';
}

function LobbyPaymentIconSection({
  label,
  icons,
  maxHeightPx,
  clusterOuterIconsToCenter,
  iconRowMarginBottomPx,
  labelToIconGapPx,
  iconCellMarginAdjust,
}: {
  label: string;
  icons: readonly LobbyPaymentIcon[];
  maxHeightPx: number;
  /** Pull first/third icons toward the middle (pay in four row). */
  clusterOuterIconsToCenter?: boolean;
  /** Extra space below the icon row (register: accepted cards + express). */
  iconRowMarginBottomPx?: number;
  /** Gap between section label and logo row (default `lobbyPopoverPx(6)`). */
  labelToIconGapPx?: number;
  iconCellMarginAdjust?: (icon: LobbyPaymentIcon) => Pick<
    React.CSSProperties,
    'marginLeft' | 'marginRight'
  > | undefined;
}) {
  if (icons.length === 0) return null;

  const labelIconGap = labelToIconGapPx ?? lobbyPopoverPx(6);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${labelIconGap}px` }}>
      <p style={lobbyPaymentBohemyLabelStyle}>{label}</p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${icons.length}, minmax(0, 1fr))`,
          gap: `${lobbyPopoverPx(4)}px`,
          alignItems: 'center',
          marginBottom: iconRowMarginBottomPx ? `${iconRowMarginBottomPx}px` : undefined,
        }}
      >
        {icons.map((icon, index) => (
          <PaymentIconCell
            key={icon.id}
            icon={icon}
            maxHeightPx={maxHeightPx}
            justifySelf={
              clusterOuterIconsToCenter ? payInFourIconJustifySelf(index, icons.length) : undefined
            }
            cellMarginAdjust={iconCellMarginAdjust?.(icon)}
          />
        ))}
      </div>
    </div>
  );
}

function LobbyPopoverPaymentLayout({ layout }: { layout: LobbyPaymentPopoverLayout }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: `${lobbyPopoverPx(8)}px`,
        flex: 1,
        marginTop: `${LOBBY_REGISTER_ACCEPTED_CARDS_LABEL_MARGIN_TOP_PX}px`,
      }}
    >
      <LobbyPaymentIconSection
        label={LOBBY_PAYMENT_ACCEPTED_CARDS_LABEL}
        icons={layout.cards}
        maxHeightPx={lobbyPopoverPx(26)}
        iconRowMarginBottomPx={4}
      />
      <LobbyPaymentIconSection
        label={LOBBY_PAYMENT_EXPRESS_LABEL}
        icons={layout.express}
        maxHeightPx={lobbyPopoverPx(24)}
        iconRowMarginBottomPx={4}
      />
      <LobbyPaymentIconSection
        label={LOBBY_PAYMENT_PAY_OVER_TIME_LABEL}
        icons={layout.payOverTime}
        maxHeightPx={LOBBY_POPOVER_PAY_OVER_TIME_ICON_MAX_PX}
        clusterOuterIconsToCenter
        labelToIconGapPx={LOBBY_REGISTER_PAYMENT_PLANS_LABEL_TO_ICONS_GAP_PX}
        iconCellMarginAdjust={paymentPlansIconCellMarginAdjust}
      />
    </div>
  );
}

/** Tap target + glass popover over lobby case props (phone, register). */
export function LobbyCasePropPopover({
  popoverId,
  activeId,
  onActivate,
  onClose,
  ariaLabel,
  title,
  sections,
  paymentLayout,
  align = 'center',
  panelOffsetUpPx = 0,
  panelOffsetUp,
  responsive = false,
  children,
}: LobbyCasePropPopoverProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const open = activeId === popoverId;
  const panelGap = responsive ? LOBBY_CASE_POPOVER_GAP_ABOVE_PROP : `${lobbyPopoverPx(10)}px`;
  const panelUp = panelOffsetUp ?? (responsive ? '0px' : `${panelOffsetUpPx}px`);
  const panelBottom = `calc(100% + ${panelGap} + ${panelUp})`;
  const panelWidth = responsive ? LOBBY_CASE_POPOVER_WIDTH : `${LOBBY_CASE_POPOVER_WIDTH_PX}px`;
  const panelMinHeight = responsive
    ? LOBBY_CASE_POPOVER_MIN_HEIGHT
    : `${LOBBY_CASE_POPOVER_MIN_HEIGHT_PX}px`;
  const panelPadding = responsive
    ? `${LOBBY_CASE_POPOVER_PADDING} ${lobbyCaseCqw(3.8, 10, 12)}`
    : `${lobbyPopoverPx(10)}px ${lobbyPopoverPx(12)}px`;

  const panelBody = paymentLayout ? (
    <LobbyPopoverPaymentLayout layout={paymentLayout} />
  ) : sections?.length ? (
    <LobbyPopoverSections sections={sections} />
  ) : null;

  return (
    <div
      ref={rootRef}
      style={{
        position: 'relative',
        display: 'block',
        width: '100%',
        height: '100%',
        zIndex: open ? LOBBY_CASE_POPOVER_OPEN_Z_INDEX : 24,
      }}
    >
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          if (open) {
            onClose();
            return;
          }
          onActivate(popoverId);
        }}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          minHeight: 44,
          margin: 0,
          padding: 0,
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          lineHeight: 0,
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation',
        }}
      >
        {children}
      </button>
      {open ? (
        <div
          role="dialog"
          aria-label={title}
          data-lobby-prop-popover
          style={{
            position: 'absolute',
            bottom: panelBottom,
            ...panelPositionStyle(align),
            ...popoverPanelGlassStyle,
            zIndex: LOBBY_CASE_POPOVER_OPEN_Z_INDEX,
            width: panelWidth,
            minHeight: panelMinHeight,
            maxWidth: responsive
              ? `min(${LOBBY_CASE_POPOVER_WIDTH}, calc(100vw - 40px))`
              : `min(${LOBBY_CASE_POPOVER_WIDTH_PX}px, calc(100vw - 40px))`,
            borderWidth: responsive ? lobbyCaseCqw(0.45, 1, 1.3) : `${lobbyPopoverPx(1.3)}px`,
            borderStyle: 'solid',
            borderColor: '#000',
            boxSizing: 'border-box',
            padding: panelPadding,
            pointerEvents: 'auto',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12)',
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div
            style={{
              position: 'absolute',
              top: `${LOBBY_POPOVER_CLOSE_TOP_PX}px`,
              right: `${LOBBY_POPOVER_CLOSE_RIGHT_PX}px`,
              zIndex: 2,
            }}
          >
            <LobbyPopoverCloseButton onClose={onClose} />
          </div>
          <div
            style={{
              marginBottom: `${lobbyPopoverPx(8)}px`,
              paddingBottom: `${lobbyPopoverPx(6)}px`,
              paddingRight: `${LOBBY_POPOVER_CLOSE_BTN_PX + lobbyPopoverPx(6)}px`,
              borderBottom: '1px solid rgba(0,0,0,0.12)',
              flexShrink: 0,
            }}
          >
            <p
              style={{
                ...titleStyle,
                minWidth: 0,
                textAlign: sections?.length ? 'left' : undefined,
              }}
            >
              {title}
            </p>
          </div>
          {panelBody}
        </div>
      ) : null}
    </div>
  );
}
