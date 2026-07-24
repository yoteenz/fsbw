import type { CSSProperties, ReactNode } from 'react';
import { Children, useEffect, useState } from 'react';
import { useFsmsPreset } from '../hooks/useFsmsPreset';
import type { FsmsBaseProps } from '../tokens/types';

export type FadeSequenceProps = FsmsBaseProps & {
  children: ReactNode;
  staggerMs?: number;
  itemClassName?: string;
};

export function FadeSequence({
  children,
  preset = 'crystal-fade',
  duration,
  delay,
  staggerMs = 120,
  className = '',
  itemClassName = '',
  autoPlay = true,
}: FadeSequenceProps) {
  const { timing } = useFsmsPreset({ preset, duration, delay });
  const items = Children.toArray(children);
  const [shown, setShown] = useState(autoPlay ? 0 : items.length);

  useEffect(() => {
    if (!autoPlay) {
      setShown(items.length);
      return;
    }
    setShown(0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    items.forEach((_, i) => {
      timers.push(
        setTimeout(
          () => setShown((c) => Math.max(c, i + 1)),
          timing.delay + i * staggerMs,
        ),
      );
    });
    return () => timers.forEach(clearTimeout);
  }, [autoPlay, items.length, staggerMs, timing.delay]);

  const rootStyle: CSSProperties = {
    ['--fsms-fade-ms' as string]: `${Math.round(timing.sweep / Math.max(items.length, 1))}ms`,
  };

  return (
    <div className={`fsms-fade-sequence ${className}`.trim()} style={rootStyle}>
      {items.map((child, i) => (
        <div
          key={i}
          className={`fsms-fade-sequence__item ${shown > i ? 'fsms-fade-sequence__item--visible' : ''} ${itemClassName}`.trim()}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
