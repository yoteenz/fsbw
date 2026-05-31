import React, { useEffect, useRef } from 'react';
import type { LobbyPaymentIcon, LobbyPaymentPopoverLayout } from '../../constants/lobbyPaymentIcons';
import {
  LOBBY_CASE_POPOVER_MIN_HEIGHT_PX,
  LOBBY_CASE_POPOVER_WIDTH_PX,
  LOBBY_PAYMENT_ACCEPTED_CARDS_LABEL,
  LOBBY_PAYMENT_EXPRESS_LABEL,
  LOBBY_PAYMENT_PAY_OVER_TIME_LABEL,
} from '../../constants/lobbyPaymentIcons';

export type LobbyCasePropPopoverSection = {
  heading: string;
  lines: readonly string[];
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
  fontSize: '10px',
  fontWeight: 500,
  color: '#000',
  textTransform: 'uppercase',
  margin: 0,
  letterSpacing: '0.02em',
};

const sectionHeadingStyle: React.CSSProperties = {
  fontFamily: '"Futura PT Medium", Futura, sans-serif',
  fontSize: '9px',
  fontWeight: 500,
  color: '#EB1C24',
  textTransform: 'uppercase',
  margin: '0 0 4px',
  letterSpacing: '0.02em',
};

const lineStyle: React.CSSProperties = {
  fontFamily: '"Futura PT Book", Futura, sans-serif',
  fontSize: '9px',
  color: '#000',
  textTransform: 'uppercase',
  margin: 0,
  lineHeight: 1.45,
  letterSpacing: '0.02em',
};

const lobbyPaymentBohemyLabelStyle: React.CSSProperties = {
  margin: 0,
  lineHeight: 1.2,
  textAlign: 'center',
  textTransform: 'none',
  fontFamily: '"Bohemy", cursive',
  fontSize: '15px',
  color: '#808080',
  fontWeight: 400,
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
}: {
  icon: LobbyPaymentIcon;
  maxHeightPx: number;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 0,
        minHeight: `${maxHeightPx + 4}px`,
        padding: '2px 0',
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
        }}
      />
    </div>
  );
}

function LobbyPopoverSections({ sections }: { sections: readonly LobbyCasePropPopoverSection[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
      {sections.map((section) => (
        <div key={section.heading}>
          <p style={sectionHeadingStyle}>{section.heading}</p>
          {section.lines.map((line) => (
            <p key={line} style={{ ...lineStyle, marginBottom: '2px' }}>
              {line}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}

function LobbyPaymentIconSection({
  label,
  icons,
  maxHeightPx,
}: {
  label: string;
  icons: readonly LobbyPaymentIcon[];
  maxHeightPx: number;
}) {
  if (icons.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <p style={lobbyPaymentBohemyLabelStyle}>{label}</p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${icons.length}, minmax(0, 1fr))`,
          gap: '4px',
          alignItems: 'center',
        }}
      >
        {icons.map((icon) => (
          <PaymentIconCell key={icon.id} icon={icon} maxHeightPx={maxHeightPx} />
        ))}
      </div>
    </div>
  );
}

function LobbyPopoverPaymentLayout({ layout }: { layout: LobbyPaymentPopoverLayout }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
      <LobbyPaymentIconSection
        label={LOBBY_PAYMENT_ACCEPTED_CARDS_LABEL}
        icons={layout.cards}
        maxHeightPx={26}
      />
      <LobbyPaymentIconSection
        label={LOBBY_PAYMENT_EXPRESS_LABEL}
        icons={layout.express}
        maxHeightPx={24}
      />
      <LobbyPaymentIconSection
        label={LOBBY_PAYMENT_PAY_OVER_TIME_LABEL}
        icons={layout.payOverTime}
        maxHeightPx={22}
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
            bottom: 'calc(100% + 10px)',
            ...panelPositionStyle(align),
            zIndex: 60,
            width: `${LOBBY_CASE_POPOVER_WIDTH_PX}px`,
            minHeight: `${LOBBY_CASE_POPOVER_MIN_HEIGHT_PX}px`,
            maxWidth: `min(${LOBBY_CASE_POPOVER_WIDTH_PX}px, calc(100vw - 40px))`,
            borderWidth: '1.3px',
            boxSizing: 'border-box',
            padding: '10px 12px',
            pointerEvents: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <p
            style={{
              ...titleStyle,
              marginBottom: '8px',
              paddingBottom: '6px',
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
