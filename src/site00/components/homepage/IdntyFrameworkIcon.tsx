import {
  site00IdntyFrameworkIconUrl,
  type IdntyFrameworkIconId,
} from '../../config/idnty-framework-icons';

type IdntyFrameworkIconProps = {
  id: IdntyFrameworkIconId;
  title: string;
  className?: string;
};

/** Approved production PNG — IDNTY framework pillars on Origin expanded panel (desktop). */
export function IdntyFrameworkIcon({ id, title, className = '' }: IdntyFrameworkIconProps) {
  return (
    <img
      src={site00IdntyFrameworkIconUrl(id)}
      alt={`${title} icon`}
      className={`site00-idnty-framework-icon ${className}`.trim()}
      width={32}
      height={32}
      loading="lazy"
      decoding="async"
    />
  );
}
