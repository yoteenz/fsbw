import type { ReactNode } from 'react';
import './DesktopEmbeddedGlassPanel.css';

type GlassPanelProps = {
  ariaLabel: string;
  onActivate: () => void;
  debug?: boolean;
  variant?: 'default' | 'compact' | 'billboard';
  children: ReactNode;
};

export function DesktopEmbeddedGlassPanel({
  ariaLabel,
  onActivate,
  debug = false,
  variant = 'default',
  children,
}: GlassPanelProps) {
  return (
    <button
      type="button"
      className={[
        'desktop-embedded-glass',
        variant === 'compact' ? 'desktop-embedded-glass--compact' : '',
        variant === 'billboard' ? 'desktop-embedded-glass--billboard' : '',
        debug ? 'desktop-embedded-glass--debug' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={ariaLabel}
      onClick={onActivate}
    >
      <div className="desktop-embedded-glass__inner">{children}</div>
    </button>
  );
}

export type DiscoveryCardPanelProps = {
  title: string;
  metric: string;
  subtext?: string;
  cta: string;
  iconSrc: string;
  thumbSrc?: string;
  ariaLabel: string;
  onActivate: () => void;
  debug?: boolean;
};

export function DesktopEmbeddedDiscoveryCard({
  title,
  metric,
  subtext,
  cta,
  iconSrc,
  thumbSrc,
  ariaLabel,
  onActivate,
  debug,
}: DiscoveryCardPanelProps) {
  return (
    <DesktopEmbeddedGlassPanel
      ariaLabel={ariaLabel}
      onActivate={onActivate}
      debug={debug}
      variant="compact"
    >
      <div className="desktop-embedded-glass__row">
        {thumbSrc ? (
          <div className="desktop-embedded-glass__thumb" aria-hidden>
            <img src={thumbSrc} alt="" draggable={false} />
          </div>
        ) : null}
        <div className="desktop-embedded-glass__copy">
          <img src={iconSrc} alt="" className="desktop-embedded-glass__icon" draggable={false} />
          <p className="desktop-embedded-glass__title">{title}</p>
          <p className="desktop-embedded-glass__metric">{metric}</p>
          {subtext ? <p className="desktop-embedded-glass__subtext">{subtext}</p> : null}
          <div className="desktop-embedded-glass__cta">{cta}</div>
        </div>
      </div>
    </DesktopEmbeddedGlassPanel>
  );
}
