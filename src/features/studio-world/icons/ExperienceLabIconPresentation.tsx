import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import type { ExperienceLabIconName } from './experience-lab-icon-registry';
import {
  EXPERIENCE_LAB_ICON_OPTICAL_TUNING_PAUSED,
  resolveProductionExperienceLabIconAsset,
} from './experience-lab-icon-asset-resolver';
import {
  isFounderOpticalModeEnabled,
  presentExperienceLabIcon,
  resolveCanonicalIconPresentation,
  resolveIconPresentation,
  type ExperienceLabIconSize,
} from './experience-lab-icon-presenter';
import styles from './ExperienceLabIconPresentation.module.css';

export type ExperienceLabIconPresentationProps = {
  name: ExperienceLabIconName;
  size?: ExperienceLabIconSize;
  alt: string;
  title?: string;
  className?: string;
  imgClassName?: string;
  active?: boolean;
  disabled?: boolean;
  selected?: boolean;
  loading?: boolean;
  decorative?: boolean;
  compareCanonical?: boolean;
  compareOpacity?: number;
  showGuides?: boolean;
  onSelect?: (name: ExperienceLabIconName) => void;
  'aria-disabled'?: boolean;
  'aria-busy'?: boolean;
  'aria-hidden'?: boolean;
};

/**
 * Canonical icon presentation layer — sits between frozen PNG assets and UI buttons.
 * PNG → ExperienceLabIconPresentation → ExperienceLabIcon → Button
 */
export function ExperienceLabIconPresentation({
  name,
  size = 'md',
  alt,
  title,
  className = '',
  imgClassName = '',
  active = false,
  disabled = false,
  selected = false,
  loading = false,
  decorative = false,
  compareCanonical = false,
  compareOpacity = 0.45,
  showGuides = false,
  onSelect,
  'aria-disabled': ariaDisabled,
  'aria-busy': ariaBusy,
  'aria-hidden': ariaHidden,
}: ExperienceLabIconPresentationProps) {
  const [, bump] = useState(0);
  const [founderMode, setFounderMode] = useState(isFounderOpticalModeEnabled);

  useEffect(() => {
    const onStorage = () => {
      setFounderMode(isFounderOpticalModeEnabled());
      bump((n) => n + 1);
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('studio-world:icon-presentation-updated', onStorage);
    window.addEventListener('studio-world:founder-optical-mode', onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('studio-world:icon-presentation-updated', onStorage);
      window.removeEventListener('studio-world:founder-optical-mode', onStorage);
    };
  }, []);

  const asset = resolveProductionExperienceLabIconAsset(name);
  const presented = presentExperienceLabIcon(name, size);
  const canonicalPresented = compareCanonical && !EXPERIENCE_LAB_ICON_OPTICAL_TUNING_PAUSED
    ? presentExperienceLabIcon(name, size, { canonical: true })
    : null;
  const profile = resolveIconPresentation(name);
  const guides = (showGuides || founderMode) && !EXPERIENCE_LAB_ICON_OPTICAL_TUNING_PAUSED;

  if (!asset.src) {
    return (
      <span
        className={`${styles.wrap} ${styles.wrapMissing} ${className}`.trim()}
        style={presented.style}
        data-elab-icon-missing={name}
        data-elab-asset-pending="v3"
        aria-hidden={ariaHidden}
        aria-label={decorative ? undefined : alt}
        title={title ?? 'Icon pending v3 crop approval'}
      />
    );
  }

  const wrapClass = [
    styles.wrap,
    guides ? styles.wrapGuides : '',
    active ? styles.wrapActive : '',
    selected ? styles.wrapSelected : '',
    disabled ? styles.wrapDisabled : '',
    loading ? styles.wrapLoading : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const imgClass = ['elab-icon--img', imgClassName].filter(Boolean).join(' ');

  const handleClick = () => {
    if (founderMode && onSelect) onSelect(name);
  };

  const guideStyle = {
    '--elab-icon-scale': `${Math.round(profile.scale * 100)}%`,
    '--elab-icon-offset-x': `${profile.offsetX}px`,
    '--elab-icon-offset-y': `${profile.offsetY}px`,
  } as CSSProperties;

  return (
    <span
      className={wrapClass}
      style={{ ...presented.style, ...guideStyle }}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (founderMode && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onSelect?.(name);
        }
      }}
      role={founderMode ? 'button' : undefined}
      tabIndex={founderMode ? 0 : undefined}
      data-elab-presentation={name}
      data-elab-presentation-source={profile.source}
    >
      {compareCanonical && canonicalPresented ? (
        <img
          className={`${imgClass} ${styles.compareCanonical}`}
          style={{ ...canonicalPresented.imgStyle, opacity: compareOpacity }}
          src={asset.src!}
          alt=""
          aria-hidden
          draggable={false}
          decoding="async"
        />
      ) : null}
      <img
        className={imgClass}
        style={presented.imgStyle}
        src={asset.src!}
        alt={decorative ? '' : alt}
        aria-hidden={ariaHidden}
        aria-disabled={ariaDisabled}
        aria-busy={ariaBusy}
        title={title}
        data-elab-icon={name}
        draggable={false}
        loading="lazy"
        decoding="async"
      />
      {guides ? (
        <span className={styles.guides} aria-hidden>
          <span className={styles.guideBox} />
          <span className={styles.guideCenterH} />
          <span className={styles.guideCenterV} />
          <span className={styles.guideSafe} />
          <span className={styles.guideBaseline} />
          <span className={styles.guideLabel}>
            {Math.round(profile.scale * 100)}% · {profile.offsetX},{profile.offsetY}
          </span>
        </span>
      ) : null}
    </span>
  );
}

export { resolveCanonicalIconPresentation };
