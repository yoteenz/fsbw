/**
 * Orb icon layer — Studio Foundry™ hero-icon product line.
 * Radial tiles consume registry assets by slug; no emoji or flat glyph fallbacks.
 */
import { FoundryHeroIconFromOrb } from '../foundry/FoundryHeroIcon';
import type { StudioOrbIconId } from './studioOrbTypes';

export type OrbIconSculptureProps = {
  iconId: StudioOrbIconId;
  size?: number;
  className?: string;
  /** Queue generation when asset is missing (default false for Orb). */
  autoQueue?: boolean;
  selected?: boolean;
};

export function OrbIconSculpture({
  iconId,
  size = 28,
  className,
  autoQueue = false,
  selected,
}: OrbIconSculptureProps) {
  return (
    <FoundryHeroIconFromOrb
      iconId={iconId}
      size={size}
      className={className}
      autoQueue={autoQueue}
      selected={selected}
    />
  );
}

export function OrbIconDailyBrief(props: Omit<OrbIconSculptureProps, 'iconId'>) {
  return <OrbIconSculpture iconId="daily-brief" {...props} />;
}

export function OrbIconVoice(props: Omit<OrbIconSculptureProps, 'iconId'>) {
  return <OrbIconSculpture iconId="voice" {...props} />;
}
