import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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

/** Scale base popover px values (35% reduction = 0.65 scale). */
function lobbyPopoverPx(px: number): number {
  return Math.round(px * LOBBY_CASE_POPOVER_SCALE);
}

const LOBBY_POPOVER_BOHEMY_FONT_PX = lobbyPopoverPx(15) + 2;
/** Payment popover section labels only — 2px smaller than contact Bohemy headers. */
const LOBBY_POPOVER_PAYMENT_BOHEMY_FONT_PX = LOBBY_POPOVER_BOHEMY_FONT_PX - 2;
const LOBBY_POPOVER_PAY_OVER_TIME_ICON_MAX_PX = lobbyPopoverPx(22) + 2;

type ContactPopoverLine =
  | { text: string; emphasis?: 'brand-red-medium' }
  | { parts: readonly { text: string; emphasis?: 'brand-red-medium' }[] };

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
  children: React.ReactNode;
};

const popoverShellClassName = 'baw-brand-modal-shell border border-black shadow-lg';

/** 25% white wash over marble so register/phone cards read brighter on the rose wall. */
const popoverShellStyle: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.25)), url(/assets/popup-marble.png)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundColor: '#ffffff',
};

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
  color: '#808080',
  fontWeight: 400,
};

const contactSectionHeadingStyle: React.CSSProperties = {
  ...lobbyBohemyLabelStyle,
  textAlign: 'left',
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
};

const contactLineRedMediumStyle: React.CSSProperties = {
  ...lineStyle,
  fontFamily: '"Futura PT Medium", Futura, sans-serif',
  fontWeight: 500,
  color: '#EB1C24',
};

function contactLineStyle(line: { emphasis?: 'brand-red-medium' }): React.CSSProperties {
  return line.emphasis === 'brand-red-medium' ? contactLineRedMediumStyle : lineStyle;
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
            style={part.emphasis === 'brand-red-medium' ? contactLineRedMediumStyle : undefined}
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

function panelFixedLeftPx(align: 'center' | 'left' | 'right', anchor: DOMRect, panelWidthPx: number): number {
  const margin = 12;
  if (align === 'left') {
    return Math.max(margin, Math.min(anchor.left, window.innerWidth - panelWidthPx - margin));
  }
  if (align === 'right') {
    return Math.max(margin, Math.min(anchor.right - panelWidthPx, window.innerWidth - panelWidthPx - margin));
  }
  return Math.max(
    margin,
    Math.min(anchor.left + anchor.width / 2 - panelWidthPx / 2, window.innerWidth - panelWidthPx - margin)
  );
}

function PaymentIconCell({
  icon,
  maxHeightPx,
  justifySelf,
}: {
  icon: LobbyPaymentIcon;
  maxHeightPx: number;
  justifySelf?: React.CSSProperties['justifySelf'];
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
}: {
  label: string;
  icons: readonly LobbyPaymentIcon[];
  maxHeightPx: number;
  /** Pull first/third icons toward the middle (pay in four row). */
  clusterOuterIconsToCenter?: boolean;
}) {
  if (icons.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${lobbyPopoverPx(6)}px` }}>
      <p style={lobbyPaymentBohemyLabelStyle}>{label}</p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${icons.length}, minmax(0, 1fr))`,
          gap: `${lobbyPopoverPx(4)}px`,
          alignItems: 'center',
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
          />
        ))}
      </div>
    </div>
  );
}

function LobbyPopoverPaymentLayout({ layout }: { layout: LobbyPaymentPopoverLayout }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${lobbyPopoverPx(8)}px`, flex: 1 }}>
      <LobbyPaymentIconSection
        label={LOBBY_PAYMENT_ACCEPTED_CARDS_LABEL}
        icons={layout.cards}
        maxHeightPx={lobbyPopoverPx(26)}
      />
      <LobbyPaymentIconSection
        label={LOBBY_PAYMENT_EXPRESS_LABEL}
        icons={layout.express}
        maxHeightPx={lobbyPopoverPx(24)}
      />
      <LobbyPaymentIconSection
        label={LOBBY_PAYMENT_PAY_OVER_TIME_LABEL}
        icons={layout.payOverTime}
        maxHeightPx={LOBBY_POPOVER_PAY_OVER_TIME_ICON_MAX_PX}
        clusterOuterIconsToCenter
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
  children,
}: LobbyCasePropPopoverProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const open = activeId === popoverId;

  const measureAnchor = useCallback(() => {
    if (!anchorRef.current) return;
    setAnchorRect(anchorRef.current.getBoundingClientRect());
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setAnchorRect(null);
      return;
    }
    measureAnchor();
    const raf = window.requestAnimationFrame(measureAnchor);
    window.addEventListener('resize', measureAnchor);
    window.addEventListener('scroll', measureAnchor, true);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', measureAnchor);
      window.removeEventListener('scroll', measureAnchor, true);
    };
  }, [open, measureAnchor]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (rootRef.current?.contains(target)) return;
      if (portalRef.current?.contains(target)) return;
      if ((target as HTMLElement).closest?.('[data-lobby-prop-popover-layer]')) return;
      onClose();
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open, onClose]);

  const panelBody = paymentLayout ? (
    <LobbyPopoverPaymentLayout layout={paymentLayout} />
  ) : sections?.length ? (
    <LobbyPopoverSections sections={sections} />
  ) : null;

  const panelWidthPx = LOBBY_CASE_POPOVER_WIDTH_PX;
  const panelGapPx = lobbyPopoverPx(10);

  const portaledAboveScrim = Boolean(open && anchorRect);
  const hideInlineAnchor = open && portaledAboveScrim;

  const portaledOpenLayer =
    portaledAboveScrim && anchorRect
      ? createPortal(
          <div
            ref={portalRef}
            data-lobby-prop-popover-layer
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: LOBBY_CASE_POPOVER_OPEN_Z_INDEX,
              pointerEvents: 'none',
              isolation: 'isolate',
              transform: 'translateZ(0)',
            }}
          >
            <div
              data-lobby-prop-popover-asset
              style={{
                position: 'fixed',
                left: `${anchorRect.left}px`,
                top: `${anchorRect.top}px`,
                width: `${Math.max(anchorRect.width, 1)}px`,
                height: `${Math.max(anchorRect.height, 1)}px`,
                margin: 0,
                padding: 0,
                pointerEvents: 'auto',
              }}
            >
              <button
                type="button"
                aria-label={ariaLabel}
                aria-expanded
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  height: '100%',
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
            </div>
            <div
              role="dialog"
              aria-label={title}
              data-lobby-prop-popover
              className={popoverShellClassName}
              style={{
                ...popoverShellStyle,
                position: 'fixed',
                left: `${panelFixedLeftPx(align, anchorRect, panelWidthPx)}px`,
                bottom: `${window.innerHeight - anchorRect.top + panelGapPx}px`,
                width: `${panelWidthPx}px`,
                minHeight: `${LOBBY_CASE_POPOVER_MIN_HEIGHT_PX}px`,
                maxWidth: `min(${panelWidthPx}px, calc(100vw - 24px))`,
                borderWidth: `${lobbyPopoverPx(1.3)}px`,
                boxSizing: 'border-box',
                padding: `${lobbyPopoverPx(10)}px ${lobbyPopoverPx(12)}px`,
                pointerEvents: 'auto',
                display: 'flex',
                flexDirection: 'column',
              }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <p
                style={{
                  ...titleStyle,
                  marginBottom: `${lobbyPopoverPx(8)}px`,
                  paddingBottom: `${lobbyPopoverPx(6)}px`,
                  borderBottom: '1px solid rgba(0,0,0,0.12)',
                  flexShrink: 0,
                }}
              >
                {title}
              </p>
              {panelBody}
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div ref={rootRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        ref={anchorRef}
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          if (open) {
            onClose();
            return;
          }
          if (anchorRef.current) {
            setAnchorRect(anchorRef.current.getBoundingClientRect());
          }
          onActivate(popoverId);
        }}
        style={{
          display: 'block',
          margin: 0,
          padding: 0,
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          lineHeight: 0,
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation',
          opacity: hideInlineAnchor ? 0 : 1,
          pointerEvents: hideInlineAnchor ? 'none' : 'auto',
        }}
      >
        {children}
      </button>
      {portaledOpenLayer}
    </div>
  );
}
