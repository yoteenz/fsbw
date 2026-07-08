/**
 * Orb Icon Sculptures™ — delegates to Studio World Hero Icon Library™.
 * @deprecated Import from `studio-world-hero-icons` directly for new code.
 */

import type { ComponentType } from 'react';
import { StudioWorldHeroIconFromOrb } from '../studio-world-hero-icons';
import type { StudioOrbIconId } from './studioOrbTypes';

type IconProps = {
  size?: number;
  className?: string;
};

function orbIcon(orbIconId: StudioOrbIconId): ComponentType<IconProps> {
  return function OrbIconBridge({ size, className }: IconProps) {
    return <StudioWorldHeroIconFromOrb orbIconId={orbIconId} size={size} className={className} />;
  };
}

export const OrbIconAtlas = orbIcon('atlas');
export const OrbIconVoice = orbIcon('voice');
export const OrbIconDailyBrief = orbIcon('daily-brief');
export const OrbIconCommandDock = orbIcon('command-dock');
export const OrbIconPageGuide = orbIcon('page-guide');
export const OrbIconLifeCulture = orbIcon('life-culture');
export const OrbIconMuseum = orbIcon('museum');

export function OrbIconSculpture({
  iconId,
  size,
  className,
}: {
  iconId: StudioOrbIconId;
  size?: number;
  className?: string;
}) {
  return <StudioWorldHeroIconFromOrb orbIconId={iconId} size={size} className={className} />;
}
