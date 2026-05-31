import React, { useEffect, useRef } from 'react';

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
  sections: readonly LobbyCasePropPopoverSection[];
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

/** Tap target + glass popover over lobby case props (phone, register). */
export function LobbyCasePropPopover({
  popoverId,
  activeId,
  onActivate,
  onClose,
  ariaLabel,
  title,
  sections,
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
            width: 'max-content',
            maxWidth: 'min(248px, calc(100vw - 40px))',
            borderWidth: '1.3px',
            boxSizing: 'border-box',
            padding: '10px 12px',
            pointerEvents: 'auto',
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <p style={{ ...titleStyle, marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px solid rgba(0,0,0,0.12)' }}>
            {title}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
        </div>
      ) : null}
    </div>
  );
}
