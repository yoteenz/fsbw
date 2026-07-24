import { useEffect, useState } from 'react';
import type { FsmsBaseProps } from '../tokens/types';

export type SectionDividerProps = FsmsBaseProps & {
  visible?: boolean;
};

export function SectionDivider({
  visible = true,
  preset = 'sunlight-sweep',
  duration = 1200,
  delay = 0,
  className = '',
}: SectionDividerProps) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!visible) {
      setShown(false);
      return;
    }
    const t = setTimeout(() => setShown(true), delay);
    return () => clearTimeout(t);
  }, [visible, delay]);

  return (
    <hr
      className={`fsms-section-divider ${shown ? 'fsms-section-divider--visible' : ''} ${className}`.trim()}
      data-fsms-preset={preset}
      data-fsms-duration={duration}
      aria-hidden
    />
  );
}
