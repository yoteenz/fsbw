import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useState } from 'react';

export type RevealMaskProps = {
  children: ReactNode;
  active?: boolean;
  durationMs?: number;
  className?: string;
  style?: CSSProperties;
};

export function RevealMask({
  children,
  active = true,
  durationMs = 900,
  className = '',
  style,
}: RevealMaskProps) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!active) {
      setRevealed(false);
      return;
    }
    const id = requestAnimationFrame(() => setRevealed(true));
    return () => cancelAnimationFrame(id);
  }, [active]);

  const rootStyle: CSSProperties = {
    ...style,
    ['--fsms-mask-ms' as string]: `${durationMs}ms`,
  };

  return (
    <div
      className={`fsms-reveal-mask ${revealed ? 'fsms-reveal-mask--active' : ''} ${className}`.trim()}
      style={rootStyle}
    >
      <div className="fsms-reveal-mask__clip">{children}</div>
    </div>
  );
}
