/**
 * AIO CLIENT MIGRATION — authority renderer.
 * L0 environment (photographic plate is the page) · L1 frosted shell · L2 hero lockup · L3 panels · L4 actions · L5 staff dock.
 * Geometry is authored in authority units: 1u = 1px of the 853×1536 authority frame (see aio-migration.css).
 */
import { createContext, useContext, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { aioPaths } from '../../utils/paths';
import { AIO_SHEET_URL, type AioSheetIcon } from './aioIconSheet';
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

/**
 * UI icon names → glyphs from the founder icon sheet (aioIconSheet.ts). Any sheet name can also be used directly.
 * The sheet has no phone glyph; `phone` is the one icon drawn here.
 */
const ALIAS = {
  search: 'search',
  bell: 'notification',
  'chevron-down': 'dropdown',
  chevron: 'forward',
  arrow: 'arrow-right',
  check: 'pass',
  home: 'home',
  intake: 'inbox',
  filing: 'folder',
  reports: 'signal',
  more: 'menu',
  doc: 'summary',
  'user-plus': 'profile',
  shield: 'security',
  plus: 'add',
  info: 'info-mark',
  clock: 'time-log',
  file: 'artifact',
  refresh: 'running',
  trash: 'delete',
  alert: 'alert-mark',
  x: 'close',
  mail: 'inbox',
  person: 'profile',
  pencil: 'edit',
  question: 'help',
  building: 'profile',
  gear: 'settings',
  bars: 'signal',
  envelope: 'inbox',
} as const satisfies Record<string, AioSheetIcon>;

export type IcoName = keyof typeof ALIAS | AioSheetIcon | 'phone';

const PHONE = (
  <path d="M6.5 3.5h3l1.5 4-2 1.3a10 10 0 0 0 6.2 6.2l1.3-2 4 1.5v3a1.5 1.5 0 0 1-1.6 1.5A16.5 16.5 0 0 1 5 5.1 1.5 1.5 0 0 1 6.5 3.5Z" />
);

export function Ico({ name, className = '' }: { name: IcoName; className?: string }) {
  const cls = `amg-ico amg-ico--${name} ${className}`;
  if (name === 'phone') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={cls}>
        {PHONE}
      </svg>
    );
  }
  const id = name in ALIAS ? ALIAS[name as keyof typeof ALIAS] : (name as AioSheetIcon);
  return (
    <svg viewBox="0 0 56 56" aria-hidden="true" className={cls}>
      <use href={`${AIO_SHEET_URL}#${id}`} />
    </svg>
  );
}
