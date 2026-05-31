import React, { useEffect, useRef } from 'react';
import type { LobbyPaymentIcon, LobbyPaymentPopoverLayout } from '../../constants/lobbyPaymentIcons';
import {
  LOBBY_CASE_POPOVER_MIN_HEIGHT_PX,
  LOBBY_CASE_POPOVER_SCALE,
  LOBBY_CASE_POPOVER_WIDTH_PX,
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

const popoverShellClassName =
  'bg-white/60 backdrop-blur-md border border-black shadow-lg transition-all duration-300 ease-out';

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
}: {
  icon: LobbyPaymentIcon;
  maxHeightPx: number;
  justifySelf?: React.CSSProperties['justifySelf'];
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 0,
        minHeight: `${maxHeightPx + lobbyPopoverPx(4)}px`,
        padding: `${lobbyPopoverPx(2)}px 0`,
        overflow: 'visible',
        justifySelf,
      }}
    >
      <img
        src={icon.src}
        alt={icon.label}
        draggable={false}
        style={{
          ...paymentLogoImgStyle,
          maxWidth: '100%',
          maxHeight: `${maxHeightPx}px`,
          ...(icon.rotationDeg
            ? { transform: `rotate(${icon.rotationDeg}deg)`, transformOrigin: 'center center' }
            : null),
        }}
      />
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
  const open = activeId === popoverId;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (rootRef.current?.contains(target)) return;
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

  return (
    <div ref={rootRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          if (open) onClose();
          else onActivate(popoverId);
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
        }}
      >
        {children}
      </button>
      {open ? (
        <div
          role="dialog"
          aria-label={title}
          data-lobby-prop-popover
          className={popoverShellClassName}
          style={{
            position: 'absolute',
            bottom: `calc(100% + ${lobbyPopoverPx(10)}px)`,
            ...panelPositionStyle(align),
            zIndex: 60,
            width: `${LOBBY_CASE_POPOVER_WIDTH_PX}px`,
            minHeight: `${LOBBY_CASE_POPOVER_MIN_HEIGHT_PX}px`,
            maxWidth: `min(${LOBBY_CASE_POPOVER_WIDTH_PX}px, calc(100vw - 40px))`,
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
      ) : null}
    </div>
  );
}
