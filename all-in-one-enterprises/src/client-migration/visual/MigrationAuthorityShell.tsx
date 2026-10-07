import type { ReactNode } from 'react';

function DockIcon({ kind }: { kind: 'home' | 'intake' | 'filing' | 'reports' | 'more' }) {
  const paths: Record<typeof kind, string> = {
    home: 'M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z',
    intake: 'M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm7 1.5V9h4.5M9 13h6M9 17h6',
    filing: 'M4 7h6l2 2h8v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7Z',
    reports: 'M5 19V10M12 19V5M19 19v-7',
    more: 'M5 7h14M5 12h14M5 17h14',
  };
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={paths[kind]} />
    </svg>
  );
}
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
      <div className={dock === 'staff' ? 'mig-frame' : 'mig-frame mig-frame--open'}>
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
            <Link to={aioPaths.office}><DockIcon kind="home" />HOME</Link>
            <Link to={aioPaths.officeMigration()} className="is-on"><DockIcon kind="intake" />INTAKE</Link>
            <Link to={aioPaths.officeDocuments}><DockIcon kind="filing" />FILING</Link>
            <Link to={aioPaths.office}><DockIcon kind="reports" />REPORTS</Link>
            <Link to={aioPaths.office}><DockIcon kind="more" />MORE</Link>
          </nav>
        ) : null}
      </div>
    </div>
  );
}
