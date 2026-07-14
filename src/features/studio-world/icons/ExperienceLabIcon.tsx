import {
  EXPERIENCE_LAB_ICON_REGISTRY,
  isExperienceLabIconName,
  type ExperienceLabIconName,
} from './experience-lab-icon-registry';
import { ExperienceLabIconPresentation } from './ExperienceLabIconPresentation';
import type { ExperienceLabIconSize } from './experience-lab-icon-presenter';
import './experience-lab-icon.css';

export type { ExperienceLabIconSize };

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

/** Studio World icon — PNG asset rendered through the canonical presentation system. */
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

  const resolvedTitle = title ?? (decorative ? undefined : label);
  const sizeClass = `elab-icon elab-icon--${size}`;

  return (
    <ExperienceLabIconPresentation
      name={name}
      size={size}
      alt={decorative ? '' : resolveAccessibleName(name, label, ariaLabel)}
      title={resolvedTitle}
      className={`${sizeClass} ${className}`.trim()}
      active={active}
      disabled={disabled}
      selected={selected}
      loading={loading}
      decorative={decorative}
      aria-disabled={disabled || undefined}
      aria-busy={loading || undefined}
      aria-hidden={decorative ? true : undefined}
    />
  );
}

export { EXPERIENCE_LAB_ICON_REGISTRY, isExperienceLabIconName };
export type { ExperienceLabIconName };
