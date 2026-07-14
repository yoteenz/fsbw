import type { CSSProperties } from 'react';
import {
  EXPERIENCE_LAB_ICON_REGISTRY,
  isExperienceLabIconName,
  type ExperienceLabIconName,
} from './experience-lab-icon-registry';
import { EXPERIENCE_LAB_ICON_ASSETS } from './experience-lab-icon-assets.generated';
import { resolveExperienceLabIconOpticalProfile } from './experience-lab-icon-optical-profile';
import './experience-lab-icon.css';

export type ExperienceLabIconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZE_PX: Record<ExperienceLabIconSize, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

export type ExperienceLabIconProps = {
  name: ExperienceLabIconName | string;
  size?: ExperienceLabIconSize;
  label?: string;
  'aria-label'?: string;
  decorative?: boolean;
  title?: string;
  className?: string;
  active?: boolean;
  disabled?: boolean;
  selected?: boolean;
  loading?: boolean;
};

function resolveAccessibleName(
  name: ExperienceLabIconName,
  label?: string,
  ariaLabel?: string,
): string {
  if (ariaLabel?.trim()) return ariaLabel.trim();
  if (label?.trim()) return label.trim();
  return EXPERIENCE_LAB_ICON_REGISTRY[name].accessibleLabel;
}

/** White-outline Experience Lab icon from extracted transparent PNG assets. */
export function ExperienceLabIcon({
  name,
  size = 'md',
  label,
  'aria-label': ariaLabel,
  decorative = false,
  title,
  className = '',
  active = false,
  disabled = false,
  selected = false,
  loading = false,
}: ExperienceLabIconProps) {
  if (!isExperienceLabIconName(name)) {
    if (import.meta.env.DEV) {
      console.warn(`[ExperienceLabIcon] Unknown icon name: ${String(name)}`);
    }
    return (
      <span
        className={`elab-icon elab-icon--missing elab-icon--${size} ${className}`.trim()}
        aria-hidden={decorative ? true : undefined}
        aria-label={decorative ? undefined : ariaLabel ?? label ?? 'Unknown icon'}
        data-elab-icon-missing={String(name)}
      />
    );
  }

  const asset = EXPERIENCE_LAB_ICON_ASSETS[name];
  const optical = resolveExperienceLabIconOpticalProfile(name);
  const opticalScale = optical.scale;
  const px = Math.round(SIZE_PX[size] * opticalScale);
  const offsetScale = SIZE_PX[size] / SIZE_PX.md;

  const style: CSSProperties = {
    width: px,
    height: px,
    objectPosition: `calc(50% + ${Math.round(optical.translateX * offsetScale)}px) calc(50% + ${Math.round(optical.translateY * offsetScale)}px)`,
  };

  const classNames = [
    'elab-icon',
    'elab-icon--img',
    `elab-icon--${size}`,
    active ? 'elab-icon--active' : '',
    selected ? 'elab-icon--selected' : '',
    disabled ? 'elab-icon--disabled' : '',
    loading ? 'elab-icon--loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const resolvedTitle = title ?? (decorative ? undefined : label);

  return (
    <img
      className={classNames}
      style={style}
      src={asset.src}
      alt={decorative ? '' : resolveAccessibleName(name, label, ariaLabel)}
      aria-hidden={decorative ? true : undefined}
      aria-disabled={disabled || undefined}
      aria-busy={loading || undefined}
      title={resolvedTitle}
      data-elab-icon={name}
      draggable={false}
      loading="lazy"
      decoding="async"
    />
  );
}

export { EXPERIENCE_LAB_ICON_REGISTRY, isExperienceLabIconName };
export type { ExperienceLabIconName };
