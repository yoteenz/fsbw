/**
 * AIO CLIENT MIGRATION — authority renderer.
 * L0 environment (photographic plate is the page) · L1 frosted shell · L2 hero lockup · L3 panels · L4 actions · L5 staff dock.
 * Geometry is authored in authority units: 1u = 1px of the 853×1536 authority frame (see aio-migration.css).
 */
import { createContext, useContext, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { aioPaths } from '../../utils/paths';
import { AIO_SHEET_URL, type AioSheetIcon } from './aioIconSheet';
import type { MigrationViewer } from './migrationViewer';
import { initialsOf } from './migrationViewer';
import { migrationPage, migrationPageAttributes } from './migrationResponsive';
import './aio-migration.css';
import './aio-migration-flow.css';
import './aio-migration-responsive.css';

export type MigrationFamily = 'root' | 'existing' | 'active';
export type MigrationActor = 'staff' | 'client';

/** Brand lockup crop as drawn in each authority family (the existing family draws a tighter mark). */
const LOCKUP: Record<MigrationFamily, string> = {
  root: '/migration/brand-lockup.png',
  existing: '/migration/brand-lockup-existing.png',
  active: '/migration/brand-lockup-existing.png',
};

const FamilyContext = createContext<MigrationFamily>('root');
const ActorContext = createContext<MigrationActor>('staff');

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
  const page = migrationPage(screen, actor === 'client' ? 'CLIENT' : 'STAFF');
  return (
    <FamilyContext.Provider value={family}>
      <ActorContext.Provider value={actor}>
        <div className={`amg amg--${family} amg--${actor}`} data-screen={screen} {...migrationPageAttributes(page)}>
          <div className="amg-env" aria-hidden="true">
            <img className="amg-env__plate" src={PLATE[family]} alt="" decoding="async" fetchPriority="high" />
          </div>
          {children}
        </div>
      </ActorContext.Provider>
    </FamilyContext.Provider>
  );
}

/**
 * The migration shell for one screen: environment, header, staff navigation (desktop sidebar + phone/tablet dock) and the
 * main column. The screen's responsive declaration (migrationResponsive.ts) is applied by the environment; client screens
 * never receive staff navigation.
 */
export function MigrationShell({
  family,
  actor,
  screen,
  viewer,
  tools = true,
  onBack,
  children,
}: {
  family: MigrationFamily;
  actor: MigrationActor;
  screen: string;
  viewer: MigrationViewer;
  tools?: boolean;
  /** The step before this one; omitted where there is nothing to go back to (intake root, first and last client steps). */
  onBack?: () => void;
  children: ReactNode;
}) {
  return (
    <AioMigrationEnvironment family={family} actor={actor} screen={screen}>
      <AioMigrationHeader viewer={viewer} tools={tools} onBack={onBack} />
      {actor === 'staff' ? <AioDesktopSidebar /> : null}
      <main className="amg-main amg-col">{children}</main>
      {actor === 'staff' ? <AioStaffDock /> : null}
    </AioMigrationEnvironment>
  );
}

/** Workspace context shown beside the lockup from tablet up (AIO OFFICE for staff, CLIENT OFFICE for clients). */
const CONTEXT: Record<MigrationActor, [string, string]> = {
  staff: ['AIO OFFICE', 'CLIENT MIGRATION'],
  client: ['CLIENT OFFICE', 'CLIENT ACTIVATION'],
};

/** Desktop staff search: opens the existing-client finder filtered by the query (clients are what intake searches). */
function HeaderSearch() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const term = q.trim();
    navigate(`${aioPaths.officeMigration('existing')}${term ? `?q=${encodeURIComponent(term)}` : ''}`);
  }
  return (
    <form className="amg-head__field" role="search" onSubmit={onSubmit}>
      <Ico name="search" />
      <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search clients, migrations, or help…" aria-label="Search clients" />
    </form>
  );
}

export function AioMigrationHeader({ viewer, tools = true, onBack }: { viewer: MigrationViewer; tools?: boolean; onBack?: () => void }) {
  const family = useContext(FamilyContext);
  const actor = useContext(ActorContext);
  const [office, area] = CONTEXT[actor];
  return (
    <header className={onBack ? 'amg-head amg-head--back' : 'amg-head'}>
      <div className="amg-col amg-head__in">
        {/* BACK is not drawn in the authority set: added at the founder's request (2026-10-08), left of the lockup */}
        {onBack ? (
          <button type="button" className="amg-head__back" onClick={onBack} aria-label="Back to the previous step">
            <Ico name="back" />
          </button>
        ) : null}
        <img className="amg-head__lockup" src={LOCKUP[family]} alt="All In One Enterprises Inc." />
        <span className="amg-head__ctx">
          <small>{office}</small>
          <b>{area}</b>
        </span>
        {tools && actor === 'staff' ? <HeaderSearch /> : null}
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
        <span className="amg-head__rule" aria-hidden="true" />
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
  accentBox,
  goldLines = [],
  thinLines = [],
  subtitle,
  style,
}: {
  kicker?: string;
  title: string[];
  accent?: string;
  /** PREBUILT draws the accent as a gold box with dark type. */
  accentBox?: boolean;
  /** Title lines drawn in gold (NEW · PREBUILT "NOT ACTIVE YET.") or light weight (BATCH · CLIENT "CLIENT"). */
  goldLines?: number[];
  thinLines?: number[];
  subtitle?: ReactNode;
  /** Per-screen authority metrics as custom properties (see heroMetrics in migrationHero.ts). */
  style?: CSSProperties;
}) {
  const family = useContext(FamilyContext);
  return (
    <section className="amg-hero" style={style}>
      {family !== 'active' ? <HeroPlate /> : null}
      {kicker ? <p className="amg-hero__kicker">{kicker}</p> : null}
      <h1 className="amg-hero__title">
        {title.map((line, i) => (
          <span key={line} className={goldLines.includes(i) ? 'is-gold' : thinLines.includes(i) ? 'is-thin' : undefined}>
            {line}
          </span>
        ))}
      </h1>
      {accent ? <p className={accentBox ? 'amg-hero__accent amg-hero__accent--box' : 'amg-hero__accent'}>{accent}</p> : null}
      {subtitle ? <p className="amg-hero__sub">{subtitle}</p> : null}
    </section>
  );
}

/**
 * Tablet / desktop hero band plate (art-directed per viewport from the approved masters). Mobile keeps the family plate
 * in .amg-env, so the picture renders nothing below the tablet breakpoint (hidden by CSS, not downloaded: no mobile source).
 */
function HeroPlate() {
  return (
    <picture className="amg-hero__plate" aria-hidden="true">
      <source media="(min-width: 1024px)" srcSet="/migration/env-wide-desktop.jpg" />
      <source media="(min-width: 700px)" srcSet="/migration/env-wide-tablet.jpg" />
      <img src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" alt="" decoding="async" />
    </picture>
  );
}

export function AioMigrationPanel({ className = '', children, as: Tag = 'section' }: { className?: string; children: ReactNode; as?: 'section' | 'article' | 'div' }) {
  return <Tag className={`amg-panel ${className}`}>{children}</Tag>;
}

export function AioMigrationCTA({ label, onClick, disabled, className = '', lead }: { label: string; onClick?: () => void; disabled?: boolean; className?: string; lead?: ReactNode }) {
  return (
    <button type="button" className={`amg-cta ${className}`} onClick={onClick} disabled={disabled}>
      {lead}
      <span>{label}</span>
      <Ico name="arrow" className="amg-cta__arrow" />
    </button>
  );
}

/** Staff navigation (one list, two presentations: phone/tablet dock and desktop sidebar). Never on client screens. */
const STAFF_NAV: Array<{ to: string; label: string; icon: IcoName; on?: boolean }> = [
  { to: aioPaths.office, label: 'HOME', icon: 'home' },
  { to: aioPaths.officeMigration(), label: 'INTAKE', icon: 'intake', on: true },
  { to: aioPaths.officeDocuments, label: 'FILING', icon: 'filing' },
  { to: aioPaths.officeArchiveMigration, label: 'REPORTS', icon: 'reports' },
  { to: aioPaths.office, label: 'MORE', icon: 'more' },
];

/** Desktop staff sidebar (≥ 1024px). The dock is not rendered on desktop. */
export function AioDesktopSidebar() {
  return (
    <nav className="amg-side" aria-label="AIO office">
      {STAFF_NAV.map((item) => (
        <Link key={item.label} to={item.to} className={item.on ? 'amg-side__item is-on' : 'amg-side__item'} aria-current={item.on ? 'page' : undefined}>
          <Ico name={item.icon} />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

/** Staff / founder intake dock (phone + tablet). Never rendered on client activation screens. */
export function AioStaffDock() {
  const items = STAFF_NAV;
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
export function AioSteps({ steps, className = '', checks = true }: { steps: Array<{ label: string; sub?: string; state: StepState }>; className?: string; checks?: boolean }) {
  return (
    <ol className={`amg-steps ${className}`} style={{ ['--n' as string]: steps.length }}>
      {steps.map((step, i) => (
        <li key={step.label} className={`amg-step is-${step.state}`}>
          <span className="amg-step__dot">{step.state === 'done' && checks ? <Ico name="check" /> : i + 1}</span>
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
 * Glyphs the sheet does not have (phone, building, people, truck, …) are drawn below in the sheet's outline weight.
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

/** Supplemental glyphs (24-grid outlines, the sheet's stroke weight) for subjects the sheet does not draw. */
const DRAWN = {
  company: (
    <path d="M4.5 21V4.8c0-.7.5-1.3 1.2-1.3h7.6c.7 0 1.2.6 1.2 1.3V21m0-11h3.8c.7 0 1.2.6 1.2 1.3V21M2.5 21h19M8 7.5h3M8 11h3M8 14.5h3M17.5 14v.01M17.5 17.5v.01" />
  ),
  people: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 19.5c.6-3.3 3-5.2 6-5.2s5.4 1.9 6 5.2M15.6 4.9a3.2 3.2 0 0 1 0 6.2M17.6 14.6c1.9.6 3.1 2.3 3.4 4.9" />
    </>
  ),
  truck: (
    <>
      <path d="M13.5 16.5H8.6M4.4 16.5H2.5v-10h11v10M13.5 9.5h4l3.5 3.8v3.2h-1.9M15.1 16.5h-1.6" />
      <circle cx="6.5" cy="16.8" r="2" />
      <circle cx="17.1" cy="16.8" r="2" />
    </>
  ),
  link: <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.2 1.2M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.2-1.2" />,
  letter: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="m3.8 7 8.2 6 8.2-6" />
    </>
  ),
  history: <path d="M3.6 12a8.4 8.4 0 1 0 2.5-6M3 3.8v4.6h4.6M12 7.5V12l3.1 2" />,
  'person-plus': (
    <>
      <circle cx="9.5" cy="8" r="3.5" />
      <path d="M3 20c.6-3.6 3.2-5.6 6.5-5.6 1.6 0 3 .4 4.1 1.2M18.5 13v6M15.5 16h6" />
    </>
  ),
  'person-minus': (
    <>
      <circle cx="9.5" cy="8" r="3.5" />
      <path d="M3 20c.6-3.6 3.2-5.6 6.5-5.6 1.6 0 3 .4 4.1 1.2M15.5 16h6" />
    </>
  ),
  'thumbs-up': <path d="M7 10.5v9.5H4.5a1 1 0 0 1-1-1v-7.5a1 1 0 0 1 1-1H7Zm0 0L10.6 4a2 2 0 0 1 2.9 2.2l-.8 3.3h5.5a2 2 0 0 1 2 2.4l-1.3 6.4a2 2 0 0 1-2 1.7H7" />,
  send: <path d="M21 3 10.5 13.5M21 3l-6.5 18-4-7.5L3 9.5 21 3Z" />,
  tag: (
    <>
      <path d="M3.5 12.6V4.5c0-.6.4-1 1-1h8.1l8 8c.6.6.6 1.5 0 2.1l-6.9 6.9c-.6.6-1.5.6-2.1 0l-8.1-7.9Z" />
      <circle cx="8" cy="8" r="1.4" />
    </>
  ),
  'id-card': (
    <>
      <rect x="2.5" y="4.5" width="19" height="15" rx="2" />
      <circle cx="8.5" cy="11" r="2.2" />
      <path d="M5.2 16.5c.5-1.6 1.8-2.5 3.3-2.5s2.8.9 3.3 2.5M14.5 9.5h4M14.5 13h4" />
    </>
  ),
  'folder-up': <path d="M3 7.5V18c0 .8.7 1.5 1.5 1.5h15c.8 0 1.5-.7 1.5-1.5V9c0-.8-.7-1.5-1.5-1.5H12L10 5H4.5C3.7 5 3 5.7 3 6.5Zm9 9v-6m-2.5 2L12 10l2.5 2.5" />,
  'shield-check': <path d="M12 3 4.5 6v5.5c0 4.6 3.1 8 7.5 9.5 4.4-1.5 7.5-4.9 7.5-9.5V6L12 3Zm-3.2 9 2.2 2.2 4.2-4.4" />,
  pin: (
    <>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
      <circle cx="12" cy="10" r="2.4" />
    </>
  ),
  phone: <path d="M6.5 3.5h3l1.5 4-2 1.3a10 10 0 0 0 6.2 6.2l1.3-2 4 1.5v3a1.5 1.5 0 0 1-1.6 1.5A16.5 16.5 0 0 1 5 5.1 1.5 1.5 0 0 1 6.5 3.5Z" />,
};

export type IcoName = keyof typeof ALIAS | AioSheetIcon | keyof typeof DRAWN;

export function Ico({ name, className = '' }: { name: IcoName; className?: string }) {
  const cls = `amg-ico amg-ico--${name} ${className}`;
  if (name === 'phone') {
    // filled, like the sheet's solid glyphs
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={cls}>
        {DRAWN.phone}
      </svg>
    );
  }
  if (name in DRAWN) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={`${cls} amg-ico--drawn`} fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
        {DRAWN[name as keyof typeof DRAWN]}
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
