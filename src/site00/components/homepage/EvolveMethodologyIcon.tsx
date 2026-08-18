import {
  site00EvolveMethodologyIconUrl,
  type EvolveMethodologyIconId,
} from '../../config/evolve-methodology-icons';
import { SITE00_ORIGIN_DESKTOP_COMPOSITION } from '../../config/origin-home-composition';

type EvolveMethodologyIconProps = {
  id: EvolveMethodologyIconId;
  title: string;
  className?: string;
};

const FRAMEWORK_ICON_PX = Math.round(SITE00_ORIGIN_DESKTOP_COMPOSITION.frameworkIconSizePx);

/** Methodology pillar icon — empty slot until custom geometric assets are supplied. */
export function EvolveMethodologyIcon({ id, title, className = '' }: EvolveMethodologyIconProps) {
  const src = site00EvolveMethodologyIconUrl(id);

  if (!src) {
    return (
      <span
        className={`site00-evolve-methodology-icon-slot ${className}`.trim()}
        role="img"
        aria-label={`${title} icon — asset pending`}
        style={{ width: FRAMEWORK_ICON_PX, height: FRAMEWORK_ICON_PX }}
      />
    );
  }

  return (
    <img
      src={src}
      alt={`${title} icon`}
      className={`site00-evolve-methodology-icon ${className}`.trim()}
      width={FRAMEWORK_ICON_PX}
      height={FRAMEWORK_ICON_PX}
      loading="lazy"
      decoding="async"
    />
  );
}
