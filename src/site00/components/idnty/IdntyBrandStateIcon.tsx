import {
  site00IdntyBrandStateIconUrl,
  type IdntyBrandStateIconId,
} from '../../config/idnty-brand-state-icons';

type IdntyBrandStateIconProps = {
  id: IdntyBrandStateIconId;
  title: string;
  className?: string;
};

/** Approved production PNG — IDNTY brand state cards and investment guide on /idnty/state. */
export function IdntyBrandStateIcon({ id, title, className = '' }: IdntyBrandStateIconProps) {
  return (
    <img
      src={site00IdntyBrandStateIconUrl(id)}
      alt={`${title} icon`}
      className={`site00-idnty-brand-state-icon ${className}`.trim()}
      width={64}
      height={64}
      loading="lazy"
      decoding="async"
    />
  );
}
