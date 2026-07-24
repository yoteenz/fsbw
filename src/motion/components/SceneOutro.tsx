import type { ReactNode } from 'react';
import type { FsmsBaseProps } from '../tokens/types';
import { CrystalTitle } from './CrystalTitle';
import { TransitionLayer } from './TransitionLayer';

export type SceneOutroProps = FsmsBaseProps & {
  title?: string;
  children?: ReactNode;
  onComplete?: () => void;
};

export function SceneOutro({
  title,
  children,
  preset = 'campaign-outro',
  align = 'center',
  duration,
  delay,
  className = '',
  onComplete,
}: SceneOutroProps) {
  return (
    <section className={`fsms-scene fsms-scene--outro ${className}`.trim()}>
      <TransitionLayer visible preset={preset} duration={duration ?? 1400} onComplete={onComplete} />
      {title ? (
        <CrystalTitle text={title} preset={preset} align={align} duration={duration} delay={delay} />
      ) : null}
      {children}
    </section>
  );
}
