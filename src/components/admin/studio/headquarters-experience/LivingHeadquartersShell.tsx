import type { ReactNode } from 'react';
import type { LivingHeadquartersState } from '../../../../studio-os-core/living-headquarters';
import { LIVING_HQ_STYLES } from './livingHeadquartersTheme';

type Props = {
  living: LivingHeadquartersState;
  children: ReactNode;
  className?: string;
};

/** Applies Living Headquarters™ atmosphere via data attributes — no layout change. */
export function LivingHeadquartersShell({ living, children, className = '' }: Props) {
  return (
    <div
      className={`living-hq-root ${className}`.trim()}
      data-lhq-season={living.season}
      data-lhq-atmosphere={living.atmosphereMode}
      data-lhq-frost={living.frostAccent ? 'true' : 'false'}
      data-lhq-floral={living.floralAccent ? 'true' : 'false'}
      data-lhq-crystal={living.crystalIllumination ? 'true' : 'false'}
      data-lhq-golden={living.goldenHour ? 'true' : 'false'}
    >
      <style>{LIVING_HQ_STYLES}</style>
      {children}
    </div>
  );
}

export function LivingHeadquartersStyles() {
  return <style>{LIVING_HQ_STYLES}</style>;
}
