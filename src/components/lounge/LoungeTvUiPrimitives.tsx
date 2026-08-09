import type { CSSProperties, ReactNode } from 'react';
import {
  LOUNGE_TV_BRAND_RED,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_GLASS_BG,
  LOUNGE_TV_GLASS_BORDER,
  LOUNGE_TV_TEXT_GRAY,
  LOUNGE_TV_TEXT_WHITE,
} from './loungeTvTheme';
import { loungeTvGlassCqw } from './loungeTvResponsive';

type LoungeTvBadgeProps = {
  label: string;
  accent?: boolean;
  style?: CSSProperties;
};

export function LoungeTvBadge({ label, accent, style }: LoungeTvBadgeProps) {
  return (
    <span
      style={{
        fontFamily: LOUNGE_TV_FONT_MEDIUM,
        fontSize: loungeTvGlassCqw(1.35, 3, 6),
        lineHeight: 1,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        padding: `${loungeTvGlassCqw(0.4, 1, 2)} ${loungeTvGlassCqw(0.7, 1.5, 3)}`,
        background: accent ? 'rgba(235, 28, 36, 0.88)' : 'rgba(0,0,0,0.72)',
        color: accent ? LOUNGE_TV_TEXT_WHITE : LOUNGE_TV_TEXT_GRAY,
        border: accent ? 'none' : '1px solid rgba(255,255,255,0.18)',
        borderRadius: '1px',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {label}
    </span>
  );
}

type LoungeTvCtaButtonProps = {
  label: string;
  onClick?: () => void;
  variant?: 'primary' | 'ghost';
  fullWidth?: boolean;
};

const ctaBase: CSSProperties = {
  fontFamily: LOUNGE_TV_FONT_MEDIUM,
  fontSize: loungeTvGlassCqw(1.5, 3.5, 7),
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  padding: `${loungeTvGlassCqw(1, 2.5, 5)} ${loungeTvGlassCqw(1.5, 4, 8)}`,
  cursor: 'pointer',
  borderRadius: '1px',
  lineHeight: 1.2,
  transition: 'background 0.15s ease, color 0.15s ease, border-color 0.15s ease',
};

export function LoungeTvCtaButton({
  label,
  onClick,
  variant = 'primary',
  fullWidth,
}: LoungeTvCtaButtonProps) {
  const isPrimary = variant === 'primary';
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...ctaBase,
        width: fullWidth ? '100%' : undefined,
        background: isPrimary ? LOUNGE_TV_BRAND_RED : 'transparent',
        color: LOUNGE_TV_TEXT_WHITE,
        border: isPrimary ? 'none' : `1px solid ${LOUNGE_TV_BRAND_RED}`,
      }}
    >
      {label}
    </button>
  );
}

type LoungeTvSectionTitleProps = {
  title: string;
  action?: ReactNode;
  /** Smaller muted rail headings (Featured tab). */
  compact?: boolean;
};

export function LoungeTvSectionTitle({ title, action, compact = false }: LoungeTvSectionTitleProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: loungeTvGlassCqw(1.5, 4, 8),
        marginBottom: loungeTvGlassCqw(compact ? 0.75 : 1, compact ? 1.8 : 2.5, compact ? 3.5 : 5),
      }}
    >
      <span
        style={{
          fontFamily: LOUNGE_TV_FONT_MEDIUM,
          fontSize: loungeTvGlassCqw(1.85, 4.2, 8.5),
          letterSpacing: '0.08em',
          color: LOUNGE_TV_TEXT_WHITE,
          textTransform: 'uppercase',
        }}
      >
        {title}
      </span>
      {action}
    </div>
  );
}

export const loungeTvGlassPanelStyle: CSSProperties = {
  background: LOUNGE_TV_GLASS_BG,
  border: LOUNGE_TV_GLASS_BORDER,
  backdropFilter: 'blur(6px)',
  WebkitBackdropFilter: 'blur(6px)',
};

export function LoungeTvBackButton({ onClick, label = '← BACK' }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        alignSelf: 'flex-start',
        margin: 0,
        padding: 0,
        border: 'none',
        background: 'none',
        fontFamily: LOUNGE_TV_FONT_MEDIUM,
        fontSize: loungeTvGlassCqw(1.5, 3.5, 7),
        letterSpacing: '0.06em',
        color: LOUNGE_TV_BRAND_RED,
        cursor: 'pointer',
        textTransform: 'uppercase',
      }}
    >
      {label}
    </button>
  );
}
