import { useEffect, useState } from 'react';
import { cn } from '../utilities/resolve';

export type LowerThirdProps = {
  primary: string;
  secondary?: string;
  visible?: boolean;
  delayMs?: number;
  durationMs?: number;
  className?: string;
};

export function LowerThird({
  primary,
  secondary,
  visible = true,
  delayMs = 0,
  durationMs = 900,
  className,
}: LowerThirdProps) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!visible) {
      setShown(false);
      return;
    }
    const t = setTimeout(() => setShown(true), delayMs);
    return () => clearTimeout(t);
  }, [visible, delayMs]);

  return (
    <div
      className={cn('fscs-lower-third', shown && 'fscs-lower-third--visible', className)}
      style={{ ['--fscs-overlay-ms' as string]: `${durationMs}ms` }}
    >
      <p className="fscs-lower-third__primary">{primary}</p>
      {secondary ? <p className="fscs-lower-third__secondary">{secondary}</p> : null}
    </div>
  );
}

export type CinematicOverlayProps = {
  variant?: 'scrim' | 'vignette';
  className?: string;
};

export function CinematicOverlay({ variant = 'scrim', className }: CinematicOverlayProps) {
  return <div className={cn('fscs-overlay', `fscs-overlay--${variant}`, className)} aria-hidden />;
}

export type CreditsOverlayProps = {
  lines: string[];
  className?: string;
};

export function CreditsOverlay({ lines, className }: CreditsOverlayProps) {
  return (
    <div className={cn('fscs-credits', className)}>
      {lines.map((line) => (
        <p key={line} className="fscs-credits__line">
          {line}
        </p>
      ))}
    </div>
  );
}
