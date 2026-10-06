import { Link } from 'react-router-dom';
import { aioPaths } from '../../utils/paths';
import { IFTA_BRAND } from './iftaAssetManifest';

type Props = {
  to?: string;
  label?: string;
  /** Surface the mark sits on: metallic emblem on dark, flat gold + charcoal on light. */
  surface?: 'light' | 'dark';
};

/** Top operational chrome — the simple approved AIO emblem only (asset sheet §1: icon mark in top nav). */
export function IftaMark({ to = aioPaths.home, label = 'All In One home', surface = 'light' }: Props) {
  return (
    <Link to={to} className={`ifta-mark ifta-mark--${surface}`} aria-label={label}>
      <img src={surface === 'dark' ? IFTA_BRAND.markOnDark : IFTA_BRAND.markOnLight} alt="" width={44} height={33} decoding="async" />
    </Link>
  );
}

/** Footer only — the full company lockup with its tagline line (asset sheet §1: footer full lockup only). */
export function IftaLockup({ surface, tagline }: { surface: 'light' | 'dark'; tagline: string }) {
  return (
    <div className={`ifta-lockup ifta-lockup--${surface}`}>
      <div className="ifta-lockup__row">
        <span className="ifta-lockup__rule" aria-hidden="true" />
        <img
          className="ifta-lockup__img"
          src={surface === 'dark' ? IFTA_BRAND.lockupOnDark : IFTA_BRAND.lockupOnLight}
          alt="All In One Enterprises Inc."
          width={242}
          height={58}
          decoding="async"
        />
        <span className="ifta-lockup__rule" aria-hidden="true" />
      </div>
      <p className="ifta-lockup__tagline">{tagline}</p>
    </div>
  );
}
