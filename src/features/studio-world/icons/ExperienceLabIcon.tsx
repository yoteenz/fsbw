import type { CSSProperties } from 'react';
import {
  EXPERIENCE_LAB_ICON_REGISTRY,
  isExperienceLabIconName,
  type ExperienceLabIconName,
} from './experience-lab-icon-registry';
import {
  EXPERIENCE_LAB_ICON_ATLAS_IMPORT,
  EXPERIENCE_LAB_ICON_RUNTIME_MAP,
} from './experience-lab-icon-runtime-map.generated';
import { EXPERIENCE_LAB_ICON_SPRITE_CONFIG } from './experience-lab-icon-sprite.config';
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

/** White-outline Experience Lab icon glyph from the runtime atlas (labels excluded). */
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

  const coord = EXPERIENCE_LAB_ICON_RUNTIME_MAP[name];
  const px = SIZE_PX[size];
  const scale = px / coord.w;
  const atlasW = EXPERIENCE_LAB_ICON_SPRITE_CONFIG.runtimeAtlasWidth;
  const atlasH = EXPERIENCE_LAB_ICON_SPRITE_CONFIG.runtimeAtlasHeight;

  const style: CSSProperties = {
    width: px,
    height: px,
    backgroundImage: `url(${EXPERIENCE_LAB_ICON_ATLAS_IMPORT})`,
    backgroundPosition: `${-coord.x * scale}px ${-coord.y * scale}px`,
    backgroundSize: `${atlasW * scale}px ${atlasH * scale}px`,
  };

  const classNames = [
    'elab-icon',
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
    <span
      className={classNames}
      style={style}
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : resolveAccessibleName(name, label, ariaLabel)}
      aria-disabled={disabled || undefined}
      aria-busy={loading || undefined}
      title={resolvedTitle}
      data-elab-icon={name}
    />
  );
}

export { EXPERIENCE_LAB_ICON_REGISTRY, isExperienceLabIconName };
export type { ExperienceLabIconName };
