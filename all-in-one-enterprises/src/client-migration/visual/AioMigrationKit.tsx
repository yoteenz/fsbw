/**
 * AIO CLIENT MIGRATION — authority renderer.
 * L0 environment (photographic plate is the page) · L1 frosted shell · L2 hero lockup · L3 panels · L4 actions · L5 staff dock.
 * Geometry is authored in authority units: 1u = 1px of the 853×1536 authority frame (see aio-migration.css).
 */
import { createContext, useContext, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { aioPaths } from '../../utils/paths';
import type { MigrationViewer } from './migrationViewer';
import { initialsOf } from './migrationViewer';
import './aio-migration.css';

export type MigrationFamily = 'root' | 'existing' | 'active';
export type MigrationActor = 'staff' | 'client';

/** Brand lockup crop as drawn in each authority family (the existing family draws a tighter mark). */
const LOCKUP: Record<MigrationFamily, string> = {
  root: '/migration/brand-lockup.png',
  existing: '/migration/brand-lockup-existing.png',
  active: '/migration/brand-lockup-existing.png',
};

const FamilyContext = createContext<MigrationFamily>('root');

const PLATE: Record<MigrationFamily, string> = {
  root: '/migration/env-root.jpg',
  existing: '/migration/env-existing.jpg',
  active: '/migration/env-active.jpg',
};

export function AioMigrationEnvironment({
  family,
  actor,
  screen,
  children,
}: {
  family: MigrationFamily;
  actor: MigrationActor;
  screen: string;
  children: ReactNode;
}) {
  return (
    <FamilyContext.Provider value={family}>
      <div className={`amg amg--${family} amg--${actor}`} data-screen={screen}>
        <div className="amg-env" aria-hidden="true">
          <img className="amg-env__plate" src={PLATE[family]} alt="" decoding="async" fetchPriority="high" />
        </div>
        {children}
      </div>
    </FamilyContext.Provider>
  );
}

export function AioMigrationHeader({ viewer, tools = true }: { viewer: MigrationViewer; tools?: boolean }) {
  const family = useContext(FamilyContext);
  return (
    <header className="amg-head">
      <div className="amg-col amg-head__in">
        <img className="amg-head__lockup" src={LOCKUP[family]} alt="All In One Enterprises Inc." />
        {tools ? (
          <>
            <button type="button" className="amg-head__tool amg-head__search" aria-label="Search">
              <Ico name="search" />
            </button>
            <button type="button" className="amg-head__tool amg-head__bell" aria-label="Notifications">
              <Ico name="bell" />
              <span className="amg-head__dot" aria-hidden="true" />
            </button>
          </>
        ) : null}
        <span className="amg-head__avatar" aria-hidden="true">
          <span>{viewer.initials}</span>
        </span>
        <span className="amg-head__who">
          <b>{viewer.name}</b>
          <span>{viewer.role}</span>
        </span>
        <Ico name="chevron-down" className="amg-head__chev" />
      </div>
    </header>
  );
}

export function AioMigrationHero({
  kicker,
  title,
  accent,
  subtitle,
}: {
  kicker: string;
  title: string[];
  accent?: string;
  subtitle?: ReactNode;
}) {
  return (
    <section className="amg-hero">
      <p className="amg-hero__kicker">{kicker}</p>
      <h1 className="amg-hero__title">
        {title.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </h1>
      {accent ? <p className="amg-hero__accent">{accent}</p> : null}
      {subtitle ? <p className="amg-hero__sub">{subtitle}</p> : null}
    </section>
  );
}

export function AioMigrationPanel({ className = '', children, as: Tag = 'section' }: { className?: string; children: ReactNode; as?: 'section' | 'article' | 'div' }) {
  return <Tag className={`amg-panel ${className}`}>{children}</Tag>;
}

export function AioMigrationCTA({ label, onClick, disabled, className = '' }: { label: string; onClick?: () => void; disabled?: boolean; className?: string }) {
  return (
    <button type="button" className={`amg-cta ${className}`} onClick={onClick} disabled={disabled}>
      <span>{label}</span>
      <Ico name="arrow" className="amg-cta__arrow" />
    </button>
  );
}

/** Staff / founder intake dock. Never rendered on client activation screens. */
export function AioStaffDock() {
  const items: Array<{ to: string; label: string; icon: IcoName; on?: boolean }> = [
    { to: aioPaths.office, label: 'HOME', icon: 'home' },
    { to: aioPaths.officeMigration(), label: 'INTAKE', icon: 'intake', on: true },
    { to: aioPaths.officeDocuments, label: 'FILING', icon: 'filing' },
    { to: aioPaths.officeArchiveMigration, label: 'REPORTS', icon: 'reports' },
    { to: aioPaths.office, label: 'MORE', icon: 'more' },
  ];
  return (
    <nav className="amg-dock" aria-label="Staff intake">
      <div className="amg-col amg-dock__in">
        {items.map((item) => (
          <Link key={item.label} to={item.to} className={item.on ? 'amg-dock__item is-on' : 'amg-dock__item'} aria-current={item.on ? 'page' : undefined}>
            <Ico name={item.icon} />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

export type StepState = 'done' | 'current' | 'todo';
export function AioSteps({ steps, className = '' }: { steps: Array<{ label: string; sub?: string; state: StepState }>; className?: string }) {
  return (
    <ol className={`amg-steps ${className}`} style={{ ['--n' as string]: steps.length }}>
      {steps.map((step, i) => (
        <li key={step.label} className={`amg-step is-${step.state}`}>
          <span className="amg-step__dot">{step.state === 'done' ? <Ico name="check" /> : i + 1}</span>
          <b className="amg-step__label">{step.label}</b>
          {step.sub ? <span className="amg-step__sub">{step.sub}</span> : null}
        </li>
      ))}
    </ol>
  );
}

export function AioMonogram({ name, className = '' }: { name: string; className?: string }) {
  return (
    <span className={`amg-mono ${className}`} aria-hidden="true">
      {initialsOf(name)}
    </span>
  );
}

export function AioStatusPill({ tone, children, icon }: { tone: 'gold' | 'red' | 'green' | 'amber' | 'gray'; children: ReactNode; icon?: IcoName }) {
  return (
    <span className={`amg-pill amg-pill--${tone}`}>
      {icon ? <Ico name={icon} className="amg-pill__icon" /> : null}
      <span>{children}</span>
    </span>
  );
}

export function AioWhatNext({ title = 'WHAT HAPPENS NEXT?', children }: { title?: string; children: ReactNode }) {
  return (
    <section className="amg-next">
      <span className="amg-next__icon" aria-hidden="true">
        <Ico name="doc" />
      </span>
      <div className="amg-next__text">
        <b>{title}</b>
        <p>{children}</p>
      </div>
    </section>
  );
}

export type IcoName =
  | 'search' | 'bell' | 'chevron-down' | 'chevron' | 'arrow' | 'check' | 'home' | 'intake' | 'filing' | 'reports' | 'more'
  | 'doc' | 'user-plus' | 'database' | 'shield' | 'plus' | 'info' | 'clock' | 'file' | 'refresh' | 'trash' | 'alert' | 'x'
  | 'phone' | 'mail' | 'person' | 'pencil' | 'question' | 'building' | 'gear' | 'bars' | 'envelope';

const PATHS: Record<IcoName, ReactNode> = {
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5" /></>,
  bell: <path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 2h-15l1.5-2ZM10 20.5a2 2 0 0 0 4 0" className="is-fill" />,
  'chevron-down': <path d="m6 9 6 6 6-6" />,
  chevron: <path d="m9 5 7 7-7 7" />,
  arrow: <path d="M4 12h15m-6-6 6 6-6 6" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  home: <path d="M3.5 11 12 4l8.5 7v9a1 1 0 0 1-1 1h-5v-6h-5v6h-5a1 1 0 0 1-1-1v-9Z" className="is-fill" />,
  intake: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M8.5 8h7M8.5 12h7M8.5 16h4" /></>,
  filing: <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4M9 12h6M9 16h6" /></>,
  reports: <><rect x="3.6" y="12" width="4.2" height="8.6" rx="2.1" /><rect x="9.9" y="8" width="4.2" height="12.6" rx="2.1" /><rect x="16.2" y="3.6" width="4.2" height="17" rx="2.1" /></>,
  more: <path d="M4 7h16M4 12h16M4 17h16" />,
  doc: <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4M9 11h6M9 14.5h6M9 18h4" /></>,
  'user-plus': <><circle cx="10" cy="8" r="3.5" /><path d="M3.5 19.5a6.5 6.5 0 0 1 13 0M18.5 8v6M15.5 11h6" /></>,
  database: <><ellipse cx="12" cy="6" rx="7" ry="2.8" /><path d="M5 6v12c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8V6M5 12c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8" /></>,
  shield: <><path d="M12 3 4.5 6v5.5c0 4.6 3.2 8 7.5 9.5 4.3-1.5 7.5-4.9 7.5-9.5V6L12 3Z" /><path d="m8.5 12 2.5 2.5 4.5-5" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  info: <><path d="M12 10.5v6" /><circle cx="12" cy="7.2" r=".6" className="is-fill" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  file: <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4" /></>,
  refresh: <path d="M19 8a7.5 7.5 0 0 0-13.2-1.8M5 4v3.5h3.5M5 16a7.5 7.5 0 0 0 13.2 1.8M19 20v-3.5h-3.5" />,
  trash: <path d="M5 7h14M10 4h4M7 7l1 13h8l1-13M10.5 11v6M13.5 11v6" />,
  alert: <><path d="M12 7.5v5.5" /><circle cx="12" cy="16.5" r=".6" className="is-fill" /></>,
  x: <path d="m8 8 8 8M16 8l-8 8" />,
  phone: <path d="M6.5 3.5h3l1.5 4-2 1.3a10 10 0 0 0 6.2 6.2l1.3-2 4 1.5v3a1.5 1.5 0 0 1-1.6 1.5A16.5 16.5 0 0 1 5 5.1 1.5 1.5 0 0 1 6.5 3.5Z" className="is-fill" />,
  mail: <><rect x="3.5" y="6" width="17" height="12" rx="1.5" /><path d="m4 7 8 6 8-6" /></>,
  person: <><circle cx="12" cy="8" r="3.8" className="is-fill" /><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0Z" className="is-fill" /></>,
  pencil: <path d="M15.5 4.5 19.5 8.5 9 19l-5 1 1-5L15.5 4.5ZM13.5 6.5l4 4" />,
  question: <><path d="M9.2 9.3a2.9 2.9 0 1 1 4.2 2.6c-.9.5-1.4 1.2-1.4 2.1v.5" /><circle cx="12" cy="17.6" r=".7" className="is-fill" /></>,
  building: <><path d="M5 21V5l7-2v18M12 7l7 2.5V21M3.5 21h17" /><path d="M8 8h1.5M8 11.5h1.5M8 15h1.5M15 12h1.5M15 15.5h1.5" /></>,
  gear: <><path d="M12.2 2.5h-.4a1.9 1.9 0 0 0-1.9 1.9v.2a1.9 1.9 0 0 1-.9 1.6l-.4.2a1.9 1.9 0 0 1-1.9 0l-.1-.1a1.9 1.9 0 0 0-2.6.7l-.2.4a1.9 1.9 0 0 0 .7 2.6l.1.1a1.9 1.9 0 0 1 .9 1.6v.5a1.9 1.9 0 0 1-.9 1.6l-.1.1a1.9 1.9 0 0 0-.7 2.6l.2.4a1.9 1.9 0 0 0 2.6.7l.1-.1a1.9 1.9 0 0 1 1.9 0l.4.2a1.9 1.9 0 0 1 .9 1.6v.2a1.9 1.9 0 0 0 1.9 1.9h.4a1.9 1.9 0 0 0 1.9-1.9v-.2a1.9 1.9 0 0 1 .9-1.6l.4-.2a1.9 1.9 0 0 1 1.9 0l.1.1a1.9 1.9 0 0 0 2.6-.7l.2-.4a1.9 1.9 0 0 0-.7-2.6l-.1-.1a1.9 1.9 0 0 1-.9-1.6v-.5a1.9 1.9 0 0 1 .9-1.6l.1-.1a1.9 1.9 0 0 0 .7-2.6l-.2-.4a1.9 1.9 0 0 0-2.6-.7l-.1.1a1.9 1.9 0 0 1-1.9 0l-.4-.2a1.9 1.9 0 0 1-.9-1.6v-.2a1.9 1.9 0 0 0-1.9-1.9Z" /><circle cx="12" cy="12" r="3" /></>,
  bars: <><rect x="4.5" y="13" width="3.5" height="7" rx=".5" /><rect x="10.25" y="9" width="3.5" height="11" rx=".5" /><rect x="16" y="5" width="3.5" height="15" rx=".5" /></>,
  envelope: <><rect x="3.5" y="6" width="17" height="12.5" rx="2" /><path d="m4.5 7.5 7.5 5.5 7.5-5.5" /></>,
};

export function Ico({ name, className = '' }: { name: IcoName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`amg-ico amg-ico--${name} ${className}`}>
      {PATHS[name]}
    </svg>
  );
}
