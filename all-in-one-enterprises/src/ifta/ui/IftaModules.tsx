/**
 * IFTA family modules — the approved screens' component stack (PAGE / COMPONENT / INTERACTION CONTRACT §04), drawn
 * to the authority geometry: hero banner · metrics rail · tab bar · workflow status · task lists · charts · map ·
 * uploads · insights · activity · CTA rail · footer lockup. Presentational only; every value comes from the view model.
 */
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { formatNumber } from '../iftaDerive';
import { IftaFileBadge, IftaGlyph, type IftaGlyphName } from './IftaGlyph';
import { IftaIcon, type IftaIconName } from './IftaIcon';
import { IFTA_BRAND } from './iftaAssetManifest';
import { US_STATE_PATHS, US_STATE_VIEWBOX } from './usStatePaths';
import type {
  IftaActivityRow,
  IftaChecklistRow,
  IftaDelta,
  IftaHealthRow,
  IftaPhase,
  IftaRiskLevel,
  IftaRiskRow,
  IftaShare,
  IftaStaffTaskRow,
  IftaStageTaskRow,
  IftaUploadTableRow,
} from './iftaViewModel';
import { STAGE_STATUS_LABEL } from './iftaViewModel';

/* ───────────────────────────── hero ───────────────────────────── */

export type IftaPlateSet = { desktop: string; tablet: string; mobile: string };

/** Hero banner over the authority plate for the band; the live headline, pill, aside and rail sit at the drawn geometry. */
export function IftaHero({
  actor,
  plates,
  label,
  eyebrow,
  title,
  period,
  lines,
  pill,
  aside,
  rail,
}: {
  actor: 'client' | 'staff' | 'queue';
  plates: IftaPlateSet;
  label: string;
  eyebrow: string;
  title: string;
  period?: string;
  lines?: ReactNode;
  pill?: ReactNode;
  aside?: ReactNode;
  rail?: ReactNode;
}) {
  return (
    <section className={`ifta-hero ifta-hero--${actor}`} aria-label={label}>
      <picture className="ifta-hero__plate" aria-hidden="true">
        <source media="(max-width: 699.98px)" srcSet={plates.mobile} />
        <source media="(max-width: 1199.98px)" srcSet={plates.tablet} />
        <img src={plates.desktop} alt="" fetchPriority="high" decoding="async" />
      </picture>
      <div className="ifta-hero__text">
        <p className="ifta-hero__eyebrow">{eyebrow}</p>
        <h1 className="ifta-hero__title">{title}</h1>
        {period ? <p className="ifta-hero__period">{period}</p> : null}
        {actor === 'client' ? <span className="ifta-hero__rule" aria-hidden="true" /> : null}
        {lines ? <div className="ifta-hero__lines">{lines}</div> : null}
      </div>
      {pill ? <div className="ifta-hero__pill">{pill}</div> : null}
      {aside ? <div className="ifta-hero__aside">{aside}</div> : null}
      {rail ? <div className="ifta-hero__rail">{rail}</div> : null}
    </section>
  );
}

export type IftaTone = 'gold' | 'green' | 'amber' | 'blue' | 'red' | 'grey';

/** Status pill (IN PROGRESS on the authority): bars glyph + state label. */
export function IftaStatePill({ label, tone = 'gold' }: { label: string; tone?: IftaTone }) {
  return (
    <span className={`ifta-pill ifta-pill--${tone}`}>
      <IftaGlyph name="pill-bars" className="ifta-pill__icon" />
      <span>{label}</span>
    </span>
  );
}

/* ───────────────────────────── metrics rail ───────────────────────────── */

export type IftaRailCell = { glyph?: IftaGlyphName; icon?: IftaIconName; value: string; label: string; note?: string; muted?: boolean; delta?: IftaDelta | null };

export function IftaRail({ cells, tone = 'light', extra, badge }: { cells: IftaRailCell[]; tone?: 'light' | 'dark'; extra?: ReactNode; badge?: string }) {
  return (
    <div className={`ifta-rail ifta-rail--${tone}${extra ? ' ifta-rail--extra' : ''}`} role="list" aria-label="Quarter metrics">
      {badge ? <span className="ifta-rail__badge">{badge}</span> : null}
      {cells.map((c) => (
        <div key={c.label} className={`ifta-rail__cell${c.muted ? ' is-muted' : ''}`} role="listitem">
          {c.glyph ? <IftaGlyph name={c.glyph} className="ifta-rail__icon" /> : <IftaIcon name={c.icon ?? 'tasks'} strokeWidth={2.1} className="ifta-rail__icon ifta-rail__icon--line" />}
          <span className="ifta-rail__text">
            <span className="ifta-rail__value">{c.value}</span>
            <span className="ifta-rail__label">{c.label}</span>
            {c.note ? <span className="ifta-rail__note">{c.note}</span> : null}
          </span>
          {c.delta ? (
            <span className={`ifta-rail__delta is-${c.delta.dir}`}>
              <span className="ifta-rail__delta-v">
                {c.delta.dir === 'up' ? '↑ ' : c.delta.dir === 'down' ? '↓ ' : c.delta.dir === 'flat' ? <IftaIcon name="clock" size={12} className="ifta-rail__flat" /> : null}
                {c.delta.text}
              </span>
              <span className="ifta-rail__delta-vs">{c.delta.vs}</span>
            </span>
          ) : null}
        </div>
      ))}
      {extra ? <div className="ifta-rail__extra">{extra}</div> : null}
    </div>
  );
}

/* ───────────────────────────── tabs ───────────────────────────── */

export function IftaTabs<T extends string>({
  tabs,
  current,
  onSelect,
  label,
  secondary = [],
  right,
  tabsRef,
}: {
  tabs: readonly T[];
  current: T;
  onSelect: (t: T) => void;
  label: string;
  secondary?: readonly T[];
  right?: ReactNode;
  tabsRef?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div className="ifta-tabrow" ref={tabsRef}>
      <div className="ifta-tabs" role="tablist" aria-label={label} data-count={tabs.length}>
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={current === t}
            className={`ifta-tab${current === t ? ' is-active' : ''}${secondary.includes(t) ? ' is-secondary' : ''}`}
            onClick={() => onSelect(t)}
          >
            {t}
          </button>
        ))}
      </div>
      {right ? <div className="ifta-tabrow__right">{right}</div> : null}
    </div>
  );
}

/* ───────────────────────────── card ───────────────────────────── */

export function IftaCard({
  title,
  action,
  className = '',
  children,
  icon,
}: {
  title: string;
  action?: { label?: string; onClick: () => void } | null;
  className?: string;
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <section className={`ifta-card ${className}`} aria-label={title}>
      <header className="ifta-card__head">
        {icon ? <span className="ifta-card__icon">{icon}</span> : null}
        <h2 className="ifta-card__title">{title}</h2>
        {action ? (
          <button type="button" className="ifta-viewall" onClick={action.onClick}>
            {action.label ?? 'View All'}
            <IftaIcon name="arrow" size={12} strokeWidth={2} />
          </button>
        ) : null}
      </header>
      <div className="ifta-card__body">{children}</div>
    </section>
  );
}

/* ───────────────────────────── workflow (four phases) ───────────────────────────── */

const PHASE_GLYPH: Record<IftaPhase['status'], IftaGlyphName> = { done: 'status-done', current: 'status-current', blocked: 'status-blocked', upcoming: 'status-upcoming' };

export function IftaWorkflow({ phases, dates = true }: { phases: IftaPhase[]; dates?: boolean }) {
  return (
    <ol className="ifta-flow">
      {phases.map((p) => (
        <li key={p.index} className={`ifta-flow__step is-${p.status}`}>
          <span className="ifta-flow__n" aria-hidden="true">
            {String(p.index).padStart(2, '0')}
          </span>
          <span className="ifta-flow__text">
            <span className="ifta-flow__label">{p.label}</span>
            <span className="ifta-flow__status">{p.statusLabel}</span>
          </span>
          {dates ? <span className="ifta-flow__date">{p.status === 'upcoming' && p.index !== 4 ? '—' : p.date ? p.date.toUpperCase() : '—'}</span> : null}
          <IftaGlyph name={PHASE_GLYPH[p.status]} className="ifta-flow__icon" aria-label={p.statusLabel} />
        </li>
      ))}
    </ol>
  );
}

/* ───────────────────────────── task lists ───────────────────────────── */

export function IftaCheck({ done, blocked = false }: { done: boolean; blocked?: boolean }) {
  return done ? <IftaGlyph name="status-done" className="ifta-check is-done" /> : <span className={`ifta-check is-open${blocked ? ' is-blocked' : ''}`} aria-hidden="true" />;
}

/** Client desktop QUARTER TASKS — the six quarter steps, client-safe (D-CLIENT-DESKTOP-STAFF-MODULES). */
export function IftaStageTasks({ rows, onSelect }: { rows: IftaStageTaskRow[]; onSelect: (r: IftaStageTaskRow) => void }) {
  return (
    <ul className="ifta-tasks">
      {rows.map((r) => (
        <li key={r.id}>
          <button type="button" className="ifta-tasks__row" onClick={() => onSelect(r)} title={r.blocked ? 'Needs you' : undefined}>
            <IftaCheck done={r.done} blocked={r.blocked} />
            <span className="ifta-tasks__label">{r.label}</span>
            <IftaIcon name="chevron" size={16} strokeWidth={2} className="ifta-tasks__chev" />
          </button>
        </li>
      ))}
    </ul>
  );
}

/** Staff QUARTER TASKS — check · task · assignee initials · date (desktop) or chevron (compact). */
export function IftaStaffTasks({ rows, compact = false }: { rows: IftaStaffTaskRow[]; compact?: boolean }) {
  return (
    <ul className={`ifta-tasks ifta-tasks--staff${compact ? ' is-compact' : ''}`}>
      {rows.map((r) => (
        <li key={r.id} className="ifta-tasks__row">
          <IftaCheck done={r.done} />
          <span className="ifta-tasks__label">{r.label}</span>
          {compact ? (
            <IftaIcon name="chevron" size={16} strokeWidth={2} className="ifta-tasks__chev" />
          ) : (
            <>
              <span className="ifta-tasks__who">{r.done && r.assignee ? <span className="ifta-initials">{r.assignee}</span> : '—'}</span>
              <span className="ifta-tasks__date">{r.date.toUpperCase()}</span>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}

const STAGE_TONE: Record<IftaChecklistRow['status'], string> = { done: 'green', current: 'blue', blocked: 'amber', upcoming: 'grey' };

/** Client compact QUICK ACTIONS — the six checklist lines (icon · step · status) → their tab. */
export function IftaQuickActions({ rows, onSelect }: { rows: IftaChecklistRow[]; onSelect: (r: IftaChecklistRow) => void }) {
  return (
    <ul className="ifta-quick">
      {rows.map((r) => (
        <li key={r.id}>
          <button type="button" className={`ifta-quick__row is-${STAGE_TONE[r.status]}`} onClick={() => onSelect(r)}>
            <span className="ifta-quick__icon" aria-hidden="true">
              <IftaIcon name={r.icon} strokeWidth={2} />
            </span>
            <span className="ifta-quick__text">
              <span className="ifta-quick__label">{r.label}</span>
              <span className="ifta-quick__note">{r.status === 'blocked' ? STAGE_STATUS_LABEL.blocked : r.status === 'upcoming' ? 'Pending' : r.note}</span>
            </span>
            <IftaIcon name="chevron" size={16} strokeWidth={2} className="ifta-quick__chev" />
          </button>
        </li>
      ))}
    </ul>
  );
}

/* ───────────────────────────── charts ───────────────────────────── */

export const SHARE_COLORS = ['#F2A93B', '#F5BE52', '#AA742B', '#6C4A20', '#A3A7AD'];
export function shareColor(s: IftaShare, i: number) {
  return s.code === 'OTHER' ? '#111111' : SHARE_COLORS[i % SHARE_COLORS.length];
}

function niceTicks(max: number): number[] {
  if (max <= 0) return [0];
  const raw = max / 4;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s * 4 >= max) ?? raw;
  return [0, 1, 2, 3, 4].map((i) => i * step);
}

function shortNum(n: number) {
  return n >= 1000 ? `${Math.round((n / 1000) * 10) / 10}K`.replace('.0K', 'K') : String(n);
}

/** MILEAGE BY JURISDICTION bars: axis + bars (+ values above on staff desktop). */
export function IftaBars({ shares, values = false, axis = true, labels = true }: { shares: IftaShare[]; values?: boolean; axis?: boolean; labels?: boolean }) {
  const ticks = niceTicks(Math.max(...shares.map((s) => s.value)));
  const top = ticks[ticks.length - 1] || 1;
  return (
    <div className={`ifta-bars${axis ? ' has-axis' : ''}${values ? ' has-values' : ''}`} role="img" aria-label={shares.map((s) => `${s.name} ${formatNumber(s.value)} miles`).join(', ')}>
      {axis ? (
        <div className="ifta-bars__axis" aria-hidden="true">
          {[...ticks].reverse().map((t) => (
            <span key={t}>{shortNum(t)}</span>
          ))}
        </div>
      ) : null}
      <div className="ifta-bars__plot" aria-hidden="true">
        {shares.map((s, i) => (
          <div key={s.code} className="ifta-bars__col">
            <div className="ifta-bars__track">
              <div className="ifta-bars__bar" style={{ height: `${(s.value / top) * 100}%`, background: shareColor(s, i) }}>
                {values ? <span className="ifta-bars__value">{formatNumber(s.value)}</span> : null}
              </div>
            </div>
            {labels ? <span className="ifta-bars__x">{s.code}</span> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Legend rows: dot · name/code · value (+ optional extra column, e.g. gallons). */
export function IftaLegend({ shares, show = 'name', value = 'pct', extra }: { shares: IftaShare[]; show?: 'name' | 'code'; value?: 'pct' | 'value'; extra?: (s: IftaShare) => string }) {
  return (
    <ul className={`ifta-legend${extra ? ' has-extra' : ''}`}>
      {shares.map((s, i) => (
        <li key={s.code}>
          <span className="ifta-legend__dot" style={{ background: shareColor(s, i) }} aria-hidden="true" />
          <span className="ifta-legend__name">{show === 'code' ? (s.code === 'OTHER' ? 'Other' : s.code) : s.name}</span>
          <span className="ifta-legend__val">{value === 'pct' ? `${s.pct}%` : formatNumber(s.value)}</span>
          {extra ? <span className="ifta-legend__extra">{extra(s)}</span> : null}
        </li>
      ))}
    </ul>
  );
}

/** Non-travelled states: a fixed muted mosaic (no data meaning); travelled states take the legend colours. */
const MOSAIC = ['#4B3F33', '#5F4F3F', '#3B322A', '#6E5B47', '#2E2722', '#7A6550', '#544638'];

export function IftaUsMap({ shares, label }: { shares: IftaShare[]; label: string }) {
  const color = new Map(shares.filter((s) => s.code !== 'OTHER').map((s, i) => [s.code, shareColor(s, i)]));
  const codes = Object.keys(US_STATE_PATHS);
  return (
    <svg className="ifta-map" viewBox={US_STATE_VIEWBOX} role="img" aria-label={label}>
      {codes.map((code, i) => (
        <path key={code} d={US_STATE_PATHS[code].d} fill={color.get(code) ?? MOSAIC[(i * 5 + code.charCodeAt(0)) % MOSAIC.length]} className={color.has(code) ? 'is-active' : undefined} />
      ))}
    </svg>
  );
}

/** FUEL PURCHASES donut with the total in the centre. */
export function IftaDonut({ shares, total, caption = 'Total Gallons' }: { shares: IftaShare[]; total: string; caption?: string }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="ifta-donut">
      <svg viewBox="0 0 100 100" role="img" aria-label={`${total} ${caption.toLowerCase()}: ${shares.map((s) => `${s.code} ${s.pct}%`).join(', ')}`}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="#EDEDED" strokeWidth="11" />
        {shares.map((s, i) => {
          const len = (s.pct / 100) * c;
          const seg = <circle key={s.code} cx="50" cy="50" r={r} fill="none" stroke={shareColor(s, i)} strokeWidth="11" strokeDasharray={`${Math.max(0, len - 0.6)} ${c}`} strokeDashoffset={-offset} transform="rotate(-90 50 50)" />;
          offset += len;
          return seg;
        })}
      </svg>
      <span className="ifta-donut__center">
        <span className="ifta-donut__total">{total}</span>
        <span className="ifta-donut__caption">{caption}</span>
      </span>
    </div>
  );
}

/* ───────────────────────────── vehicles · uploads · activity ───────────────────────────── */

export type IftaVehicleRow = { id: string; unit: string; detail: string; value?: string; tone: 'green' | 'amber' | 'grey' | 'red'; status: string };

export function IftaVehicles({ rows, variant }: { rows: IftaVehicleRow[]; variant: 'client' | 'staff' }) {
  return (
    <ul className={`ifta-vehicles ifta-vehicles--${variant}`}>
      {rows.map((v) => (
        <li key={v.id}>
          {variant === 'client' ? (
            <span className="ifta-vehicles__icon" aria-hidden="true">
              <IftaIcon name="truck" strokeWidth={1.9} />
            </span>
          ) : (
            <IftaGlyph name="truck-solid" className="ifta-vehicles__icon" />
          )}
          <span className="ifta-vehicles__text">
            <span className="ifta-vehicles__unit">{v.unit}</span>
            {variant === 'client' ? <span className="ifta-vehicles__meta">{v.detail}</span> : null}
          </span>
          {variant === 'staff' ? <span className="ifta-vehicles__value">{v.value}</span> : <span className={`ifta-dot is-${v.tone}`} role="img" aria-label={v.status} />}
        </li>
      ))}
    </ul>
  );
}

/** RECENT UPLOADS — table (desktop: FILE NAME · DATE · STATUS) or rows (compact: name · detail – date · status). */
export function IftaUploads({ rows, table }: { rows: IftaUploadTableRow[]; table: boolean }) {
  if (!rows.length) return <p className="ifta-empty">No uploads yet this quarter.</p>;
  return table ? (
    <table className="ifta-table ifta-table--uploads">
      <thead>
        <tr>
          <th scope="col">File name</th>
          <th scope="col">Date</th>
          <th scope="col">Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <td>
              <span className="ifta-table__file">
                <IftaFileBadge fileName={r.fileName} />
                <span>{r.name}</span>
              </span>
            </td>
            <td>{r.date}</td>
            <td>
              <UploadStatus done={r.done} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ) : (
    <ul className="ifta-uploads">
      {rows.map((r) => (
        <li key={r.id}>
          <span className="ifta-uploads__tile" aria-hidden="true">
            <IftaFileBadge fileName={r.fileName} />
          </span>
          <span className="ifta-uploads__text">
            <span className="ifta-uploads__name">{r.name}</span>
            <span className="ifta-uploads__meta">
              {r.detail} – {r.date}
            </span>
          </span>
          <UploadStatus done={r.done} />
        </li>
      ))}
    </ul>
  );
}

function UploadStatus({ done }: { done: boolean }) {
  return done ? <IftaGlyph name="ring-check" className="ifta-status is-done" aria-label="Verified" /> : <IftaIcon name="clock" className="ifta-status is-wait" aria-label="AIO checking" />;
}

/** RECENT ACTIVITY — table (EVENT · DATE) or timeline (compact). */
export function IftaActivity({ rows, table }: { rows: IftaActivityRow[]; table: boolean }) {
  if (!rows.length) return <p className="ifta-empty">No activity yet.</p>;
  return table ? (
    <table className="ifta-table ifta-table--activity">
      <thead>
        <tr>
          <th scope="col">Event</th>
          <th scope="col">Date</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <td>
              <span className="ifta-table__event">
                <span className={`ifta-dot is-${r.tone}`} aria-hidden="true" />
                <span>{r.text}</span>
              </span>
            </td>
            <td>
              <span className="ifta-table__when">
                <span>{r.date}</span>
                <span>{r.time}</span>
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ) : (
    <ol className="ifta-timeline">
      {rows.map((r) => (
        <li key={r.id} className={`is-${r.tone}`}>
          <span className="ifta-timeline__text">{r.text}</span>
          <span className="ifta-timeline__when">
            {r.date} &nbsp;{r.time}
          </span>
        </li>
      ))}
    </ol>
  );
}

/** Staff RECENT CLIENT ACTIVITY (TYPE · ACTIVITY · DATE · BY) / AIO TEAM ACTIVITY (USER · ACTIVITY · DATE). */
export function IftaActorActivity({ rows, kind, table }: { rows: IftaActivityRow[]; kind: 'client' | 'team'; table: boolean }) {
  if (!rows.length) return <p className="ifta-empty">{kind === 'client' ? 'No client activity yet.' : 'No AIO activity yet.'}</p>;
  const lead = (r: IftaActivityRow) =>
    kind === 'client' ? (
      <span className="ifta-actor__tile" aria-hidden="true">
        <IftaFileBadge fileName={/upload|receipt|eld|csv/i.test(r.text) ? 'file.pdf' : 'note.doc'} />
      </span>
    ) : (
      <span className="ifta-initials ifta-initials--lg">{initialsOf(r.actorName)}</span>
    );
  return table ? (
    <table className={`ifta-table ifta-table--${kind}`}>
      <thead>
        <tr>
          <th scope="col">{kind === 'client' ? 'Type' : 'User'}</th>
          <th scope="col">Activity</th>
          <th scope="col">Date</th>
          {kind === 'client' ? <th scope="col">By</th> : null}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <td>{lead(r)}</td>
            <td>{r.text}</td>
            <td>
              {r.date} {r.time}
            </td>
            {kind === 'client' ? <td>Client</td> : null}
          </tr>
        ))}
      </tbody>
    </table>
  ) : (
    <ul className={`ifta-actor ifta-actor--${kind}`}>
      {rows.map((r) => (
        <li key={r.id}>
          {lead(r)}
          <span className="ifta-actor__text">
            <span className="ifta-actor__title">{r.text}</span>
            <span className="ifta-actor__when">
              {r.date} {r.time}
            </span>
          </span>
          {kind === 'client' ? <IftaIcon name="chevron" size={14} strokeWidth={2} className="ifta-actor__chev" /> : null}
        </li>
      ))}
    </ul>
  );
}

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}

const RISK_GLYPH: Record<IftaRiskRow['icon'], IftaGlyphName> = { ok: 'status-done', check: 'ring-check', flag: 'flag', info: 'info' };

/** RISKS / FLAGS — STATUS · ITEM · DETAIL (desktop table) or icon + two lines (compact). */
export function IftaRisks({ rows, table }: { rows: IftaRiskRow[]; table: boolean }) {
  return table ? (
    <table className="ifta-table ifta-table--risks">
      <thead>
        <tr>
          <th scope="col">Status</th>
          <th scope="col">Item</th>
          <th scope="col">Detail</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <td>
              <IftaGlyph name={RISK_GLYPH[r.icon]} className={`ifta-risk is-${r.icon}`} />
            </td>
            <td>{r.item}</td>
            <td>{r.detail}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ) : (
    <ul className="ifta-risks">
      {rows.map((r) => (
        <li key={r.id}>
          <IftaGlyph name={RISK_GLYPH[r.icon]} className={`ifta-risk is-${r.icon}`} />
          <span className="ifta-risks__text">
            <span className="ifta-risks__item">{r.item}</span>
            <span className="ifta-risks__detail">{r.detail}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export type IftaDateItem = { label: string; value: string; icon: IftaIconName };

export function IftaDates({ rows }: { rows: IftaDateItem[] }) {
  return (
    <ul className="ifta-dates">
      {rows.map((d) => (
        <li key={d.label}>
          <span className="ifta-dates__icon" aria-hidden="true">
            <IftaIcon name={d.icon} strokeWidth={2.1} />
          </span>
          <span className="ifta-dates__text">
            <span className="ifta-dates__label">{d.label}</span>
            <span className="ifta-dates__value">{d.value}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/* ───────────────────────────── insights · health · CTA · footer ───────────────────────────── */

export function IftaInsights({ lines, media }: { lines: string[]; media?: string }) {
  return (
    <section className="ifta-card ifta-insights" aria-label="AIO insights">
      <span className="ifta-insights__bulb" aria-hidden="true">
        <IftaIcon name="bulb" strokeWidth={2} />
      </span>
      <div className="ifta-insights__body">
        <h2 className="ifta-card__title">AIO Insights</h2>
        {lines.map((l) => (
          <p key={l}>{l}</p>
        ))}
      </div>
      {media ? <img className="ifta-insights__media" src={media} alt="" loading="lazy" decoding="async" /> : null}
    </section>
  );
}

const RISK_CHIP: Record<IftaRiskLevel, string> = { LOW: 'green', MEDIUM: 'amber', HIGH: 'red' };

/** CLIENT HEALTH (staff) — dark glass panel over the hero: risk chip + four checks. */
export function IftaHealth({ title, rows, risk }: { title: string; rows: IftaHealthRow[]; risk?: { level: IftaRiskLevel; label: string } }) {
  return (
    <div className="ifta-health" aria-label={title}>
      <div className="ifta-health__head">
        <p className="ifta-health__title">{title}</p>
        {risk ? <span className={`ifta-health__chip is-${RISK_CHIP[risk.level]}`}>{risk.label}</span> : null}
      </div>
      <ul>
        {rows.map((r) => (
          <li key={r.label}>
            <IftaGlyph name={r.ok ? 'status-done' : 'status-blocked'} className={`ifta-health__check${r.ok ? '' : ' is-open'}`} />
            <span className="ifta-health__label">{r.label}</span>
            <strong className={r.accent ? (r.ok ? 'is-accent' : 'is-warn') : undefined}>{r.value}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Bottom CTA rail: icon tile · eyebrow + label · gold arrow button (the whole rail is the control). */
export function IftaCtaRail({ eyebrow, label, icon = 'clipboard', to, onClick }: { eyebrow: string; label: string; icon?: IftaIconName; to?: string; onClick?: () => void }) {
  const body = (
    <>
      <span className="ifta-cta__icon" aria-hidden="true">
        <IftaIcon name={icon} strokeWidth={1.8} />
      </span>
      <span className="ifta-cta__text">
        <span className="ifta-cta__eyebrow">{eyebrow}</span>
        <span className="ifta-cta__label">{label}</span>
      </span>
      <span className="ifta-cta__go" aria-hidden="true">
        <IftaIcon name="arrow" strokeWidth={2.2} />
      </span>
    </>
  );
  if (to)
    return (
      <Link to={to} className="ifta-cta" aria-label={`${eyebrow} ${label}`}>
        {body}
      </Link>
    );
  return (
    <button type="button" className="ifta-cta" onClick={onClick} aria-label={`${eyebrow} ${label}`} disabled={!onClick}>
      {body}
    </button>
  );
}

/** Footer lockup (asset sheet §1: full lockup in footers only) with its tagline line. */
export function IftaFooter({ tagline, variant = 'stack' }: { tagline: string[]; variant?: 'stack' | 'inline' }) {
  return (
    <footer className={`ifta-foot ifta-foot--${variant}`}>
      <span className="ifta-foot__rule" aria-hidden="true" />
      <img className="ifta-foot__lockup" src={IFTA_BRAND.lockupOnLight} alt="All In One Enterprises Inc." loading="lazy" decoding="async" />
      <span className="ifta-foot__rule" aria-hidden="true" />
      <p className="ifta-foot__tagline">
        {tagline.map((t, i) => (
          <span key={t}>
            {i ? <span className="ifta-foot__sep" aria-hidden="true">•</span> : null}
            {t}
          </span>
        ))}
      </p>
    </footer>
  );
}

/* ───────────────────────────── tab-body helpers (non-overview tabs) ───────────────────────────── */

export function IftaChip({ label, tone = 'grey' }: { label: string; tone?: IftaTone | 'success' | 'warn' | 'progress' | 'alert' | 'muted' }) {
  const map: Record<string, string> = { success: 'green', warn: 'amber', progress: 'blue', alert: 'red', muted: 'grey' };
  return <span className={`ifta-chip is-${map[tone] ?? tone}`}>{label}</span>;
}

export function IftaRows({ children }: { children: ReactNode }) {
  return <ul className="ifta-rows">{children}</ul>;
}
