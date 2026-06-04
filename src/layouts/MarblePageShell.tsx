import type { CSSProperties, ReactNode } from 'react';

/** Space for fixed PSA FAB (avatar + CTA + nudge) — not document flow. */
export const PSA_WIDGET_PAGE_PADDING_BOTTOM =
  'calc(128px + env(safe-area-inset-bottom, 0px))';

const MARBLE_BG_STYLE: CSSProperties = {
  backgroundImage: `url('/assets/marble-half.png')`,
  backgroundSize: 'contain',
  backgroundPosition: 'center',
  backgroundRepeat: 'repeat',
};

type Props = {
  children: ReactNode;
  /**
   * Legacy full-viewport marble (empty area below short cards).
   * Default false — shell height follows content + optional PSA padding.
   */
  fillViewport?: boolean;
  /** Reserve bottom space so the fixed PSA chip does not cover page actions. Default true. */
  psaClearance?: boolean;
  className?: string;
  style?: CSSProperties;
};

/**
 * Marble backdrop sized to page content (not forced `100vh`).
 * PSA widget stays `position: fixed`; use `psaClearance` for scroll/paint padding only.
 */
export function MarblePageShell({
  children,
  fillViewport = false,
  psaClearance = true,
  className = '',
  style,
}: Props) {
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        ...(fillViewport ? { minHeight: '100dvh' } : null),
        ...(psaClearance ? { paddingBottom: PSA_WIDGET_PAGE_PADDING_BOTTOM } : null),
        ...style,
      }}
    >
      <div
        aria-hidden
        className="-z-10"
        style={{
          position: 'absolute',
          inset: 0,
          ...MARBLE_BG_STYLE,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
