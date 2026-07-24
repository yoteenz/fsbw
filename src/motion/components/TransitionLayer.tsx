import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import type { FsmsBaseProps } from '../tokens/types';

export type TransitionLayerProps = FsmsBaseProps & {
  visible?: boolean;
  onComplete?: () => void;
};

export function TransitionLayer({
  visible = false,
  preset = 'elegant-dissolve',
  duration = 1200,
  className = '',
  style,
  onComplete,
}: TransitionLayerProps) {
  const [opacity, setOpacity] = useState(visible ? 1 : 0);

  useEffect(() => {
    setOpacity(visible ? 1 : 0);
    if (visible && onComplete) {
      const t = setTimeout(onComplete, duration);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [visible, duration, onComplete]);

  const rootStyle: CSSProperties = {
    ...style,
    ['--fsms-transition-ms' as string]: `${duration}ms`,
    ['--fsms-transition-opacity' as string]: opacity,
  };

  return (
    <div
      className={`fsms-transition-layer ${className}`.trim()}
      style={rootStyle}
      data-fsms-preset={preset}
      aria-hidden
    />
  );
}
