import React, { useEffect, useRef } from 'react';
import type { LobbyPaymentIcon } from '../../constants/lobbyPaymentIcons';
import {
  LOBBY_CASE_POPOVER_MIN_HEIGHT_PX,
  LOBBY_CASE_POPOVER_WIDTH_PX,
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
  /** Payment logos (register). */
  paymentIcons?: readonly LobbyPaymentIcon[];
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

function panelPositionStyle(align: 'center' | 'left' | 'right'): React.CSSProperties {
  if (align === 'left') {
    return { left: 0, transform: 'none' };
  }
  if (align === 'right') {
    return { right: 0, left: 'auto', transform: 'none' };
  }
  return { left: '50%', transform: 'translateX(-50%)' };
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

function LobbyPopoverPaymentGrid({ icons }: { icons: readonly LobbyPaymentIcon[] }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: '10px 12px',
        flex: 1,
        alignContent: 'start',
      }}
    >
      {icons.map((icon) => (
        <div
          key={icon.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '36px',
            padding: '2px 0',
          }}
        >
          <img
            src={icon.src}
            alt={icon.label}
            draggable={false}
            style={{
              display: 'block',
              maxWidth: '100%',
              maxHeight: '32px',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
            }}
          />
        </div>
      ))}
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
  paymentIcons,
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

  const panelBody = paymentIcons?.length ? (
    <LobbyPopoverPaymentGrid icons={paymentIcons} />
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
