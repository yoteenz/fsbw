import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { aioPaths } from '../../utils/paths';
import './migration-authority.css';

type Plate = 'root' | 'existing';

export function MigrationAuthorityShell({
  plate,
  kicker = 'CLIENT MIGRATION INTAKE',
  title,
  subtitle,
  children,
  cta,
  onCta,
  ctaDisabled,
  dock = 'staff',
}: {
  plate: Plate;
  kicker?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  cta?: string;
  onCta?: () => void;
  ctaDisabled?: boolean;
  /** Staff migration keeps the intake dock. Client activation must not. */
  dock?: 'staff' | 'none';
}) {
  return (
    <div className="mig-app">
      <div className="mig-frame">
        <header className="mig-header">
          <div className="mig-brand">
            <span className="mig-mark" aria-hidden />
            <span className="mig-brand-name">
              <strong>ALL IN ONE</strong>
              <span>ENTERPRISES INC.</span>
            </span>
          </div>
          <div className="mig-header-tools">
            <button className="mig-icon-btn" type="button" aria-label="Search">⌕</button>
            <button className="mig-icon-btn" type="button" aria-label="Notifications">◔</button>
            <span className="mig-avatar" aria-hidden>A</span>
            <span className="mig-who">
              <b>ALEX R.</b>
              CLIENT
            </span>
          </div>
        </header>
        <section className={`mig-hero mig-hero--${plate}`}>
          <p className="mig-kicker">{kicker}</p>
          <h1>{title}</h1>
          {subtitle ? <p>{subtitle}</p> : null}
        </section>
        <div className="mig-body">
          {children}
          {cta ? (
            <button className="mig-cta" type="button" onClick={onCta} disabled={ctaDisabled}>
              {cta} →
            </button>
          ) : null}
        </div>
        {dock === 'staff' ? (
          <nav className="mig-dock" aria-label="Primary">
            <Link to={aioPaths.office}>HOME</Link>
            <Link to={aioPaths.officeMigration()} className="is-on">INTAKE</Link>
            <Link to={aioPaths.officeDocuments}>FILING</Link>
            <Link to={aioPaths.office}>REPORTS</Link>
            <Link to={aioPaths.office}>MORE</Link>
          </nav>
        ) : null}
      </div>
    </div>
  );
}
