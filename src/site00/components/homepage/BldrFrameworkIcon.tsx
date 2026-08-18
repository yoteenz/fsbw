import {
  site00BldrFrameworkIconUrl,
  type BldrFrameworkIconId,
} from '../../config/bldr-framework-icons';

type BldrFrameworkIconProps = {
  id: BldrFrameworkIconId;
  title: string;
  className?: string;
};

/** Approved production PNG — BLDR framework pillars on Origin expanded panel (desktop). */
export function BldrFrameworkIcon({ id, title, className = '' }: BldrFrameworkIconProps) {
  return (
    <img
      src={site00BldrFrameworkIconUrl(id)}
      alt={`${title} icon`}
      className={`site00-bldr-framework-icon ${className}`.trim()}
      width={32}
      height={32}
      loading="lazy"
      decoding="async"
    />
  );
}
