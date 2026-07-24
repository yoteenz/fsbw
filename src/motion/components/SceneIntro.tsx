import type { ReactNode } from 'react';
import type { FsmsBaseProps } from '../tokens/types';
import { CrystalSubtitle } from './CrystalSubtitle';
import { CrystalTitle } from './CrystalTitle';
import { GlassOverlay } from './GlassOverlay';

export type SceneIntroProps = FsmsBaseProps & {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
};

export function SceneIntro({
  title,
  subtitle,
  children,
  preset = 'campaign-intro',
  align = 'center',
  duration,
  delay,
  className = '',
}: SceneIntroProps) {
  return (
    <section className={`fsms-scene fsms-scene--intro ${className}`.trim()}>
      <GlassOverlay preset={preset} duration={duration} delay={delay} />
      {title ? (
        <CrystalTitle text={title} preset={preset} align={align} duration={duration} delay={delay} />
      ) : null}
      {subtitle ? (
        <CrystalSubtitle
          text={subtitle}
          preset="elegant-dissolve"
          align={align}
          delay={(delay ?? 0) + 400}
        />
      ) : null}
      {children}
    </section>
  );
}
