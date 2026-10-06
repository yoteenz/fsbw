/**
 * IFTA family modules — the authority's component stack (PAGE / COMPONENT / INTERACTION CONTRACT §04):
 * hero banner · metrics rail · tab bar · workflow status · task list · map panel · recent uploads · insights ·
 * recent activity · bottom CTA rail · footer lockup. Presentational only; every value arrives from the view model.
 */
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { formatDateTime } from '../iftaDates';
import { formatNumber } from '../iftaDerive';
import type { IftaAuditEvent } from '../iftaTypes';
import { IftaIcon, type IftaIconName } from './IftaIcon';
import { US_STATE_PATHS, US_STATE_VIEWBOX } from './usStatePaths';
import type { IftaChecklistRow, IftaFlagRow, IftaPhase, IftaShare, IftaTaskRow, IftaUploadRow } from './iftaViewModel';
import { STAGE_STATUS_LABEL } from './iftaViewModel';

/* ───────────────────────────── panel ───────────────────────────── */

export function IftaPanel({
  title,
  aside,
  className = '',
  children,
  id,
}: {
  title: string;
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section className={`ifta-panel ${className}`} aria-label={title} id={id}>
      <header className="ifta-panel__head">
        <h3 className="ifta-panel__title">{title}</h3>
        {aside ? <div className="ifta-panel__aside">{aside}</div> : null}
      </header>
      {children}
    </section>
  );
}

/** "VIEW ALL →" — only rendered where it does something real (switches to the tab that holds the full list). */
export function IftaViewAll({ onClick, label = 'View all' }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" className="ifta-viewall" onClick={onClick}>
      {label}
      <IftaIcon name="arrow" size={13} />
    </button>
  );
}

/* ───────────────────────────── metrics rail ───────────────────────────── */

export type IftaMetricCell = { icon: IftaIconName; value: string; label: string; note?: string; pending?: boolean };

export function IftaMetricsRail({ cells, tone = 'light', badge }: { cells: IftaMetricCell[]; tone?: 'light' | 'dark'; badge?: string }) {
  return (
    <div className={`ifta-metrics ifta-metrics--${tone}`} role="list" aria-label="Quarter metrics">
      {badge ? <span className="ifta-metrics__badge">{badge}</span> : null}
      {cells.map((c) => (
        <div key={c.label} className={`ifta-metric${c.pending ? ' ifta-metric--pending' : ''}`} role="listitem">
          <IftaIcon name={c.icon} size={28} strokeWidth={1.6} className="ifta-metric__icon" />
          <div className="ifta-metric__text">
            <span className="ifta-metric__value">{c.value}</span>
            <span className="ifta-metric__label">{c.label}</span>
            {c.note ? <span className="ifta-metric__note">{c.note}</span> : null}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ───────────────────────────── status pill + chips ───────────────────────────── */

export function IftaStatusPill({ label, tone = 'gold', icon = 'miles' }: { label: string; tone?: 'gold' | 'warn' | 'success' | 'progress' | 'alert' | 'muted'; icon?: IftaIconName }) {
  return (
    <span className={`ifta-pill ifta-pill--${tone}`}>
      <IftaIcon name={icon} size={16} strokeWidth={2.2} />
      {label}
    </span>
  );
}

export function IftaChip({ label, tone }: { label: string; tone: 'gold' | 'warn' | 'success' | 'progress' | 'alert' | 'muted' }) {
  return (
    <span className={`ifta-chip ifta-chip--${tone}`}>
      <span className="ifta-chip__dot" aria-hidden="true" />
      {label}
    </span>
  );
}

/* ───────────────────────────── workflow stepper ───────────────────────────── */

const PHASE_END: Record<IftaPhase['status'], IftaIconName> = { done: 'done', current: 'active', blocked: 'alert', upcoming: 'more' };

export function IftaPhaseStepper({ phases, showDetails = false }: { phases: IftaPhase[]; showDetails?: boolean }) {
  return (
    <ol className="ifta-stepper">
      {phases.map((p) => (
        <li key={p.index} className={`ifta-step ifta-step--${p.status}`}>
          <span className="ifta-step__badge">{String(p.index).padStart(2, '0')}</span>
          <div className="ifta-step__body">
            <span className="ifta-step__label">{p.label}</span>
            <span className="ifta-step__status">{p.statusLabel}</span>
            {showDetails && (p.status === 'current' || p.status === 'blocked') ? (
              <ul className="ifta-step__details">
                {p.details.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            ) : null}
          </div>
          {p.date ? <span className="ifta-step__date">{p.date}</span> : null}
          <span className="ifta-step__end" aria-hidden="true">
            <IftaIcon name={PHASE_END[p.status]} size={20} strokeWidth={2} />
          </span>
        </li>
      ))}
    </ol>
  );
}

/* ───────────────────────────── checklist rows ───────────────────────────── */

export function IftaChecklist({ rows, onSelect }: { rows: IftaChecklistRow[]; onSelect: (row: IftaChecklistRow) => void }) {
  return (
    <ul className="ifta-checklist">
      {rows.map((r) => (
        <li key={r.id}>
          <button type="button" className={`ifta-checkrow ifta-checkrow--${r.status}`} onClick={() => onSelect(r)}>
            <span className="ifta-checkrow__icon" aria-hidden="true">
              <IftaIcon name={r.icon} size={20} strokeWidth={1.9} />
            </span>
            <span className="ifta-checkrow__text">
              <span className="ifta-checkrow__title">{r.label}</span>
              <span className="ifta-checkrow__status">
                {STAGE_STATUS_LABEL[r.status]}
                <span className="ifta-checkrow__note"> · {r.note}</span>
              </span>
            </span>
            <IftaIcon name="chevron" size={18} className="ifta-checkrow__chev" />
          </button>
        </li>
      ))}
    </ul>
  );
}

/* ───────────────────────────── share colours ───────────────────────────── */

export const SHARE_COLORS = ['#8C6A2E', '#D4A853', '#E2C27E', '#EBD9B7', '#A7A9AC', '#1A1A1A'];
export const shareColor = (s: IftaShare, i: number) => (s.code === 'OTHER' ? SHARE_COLORS[5] : SHARE_COLORS[Math.min(i, 4)]);

function lerp(a: string, b: string, t: number) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * t)).join(',')})`;
}
const lightFill = (t: number) => (t < 0.5 ? lerp('#EBD9B7', '#D4A853', t * 2) : lerp('#D4A853', '#5E4720', (t - 0.5) * 2));

/* ───────────────────────────── jurisdiction map ───────────────────────────── */

export function IftaUsMap({ intensity, tone = 'light', label }: { intensity: Record<string, number>; tone?: 'light' | 'dark'; label: string }) {
  const codes = Object.keys(US_STATE_PATHS);
  return (
    <svg className={`ifta-map ifta-map--${tone}`} viewBox={US_STATE_VIEWBOX} role="img" aria-label={label}>
      {tone === 'dark' ? (
        <defs>
          <filter id="ifta-map-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      ) : null}
      {codes.map((code) => {
        const t = intensity[code];
        const active = t !== undefined;
        const fill = tone === 'light' ? (active ? lightFill(t) : '#ECEAE6') : active ? `rgba(212,168,83,${0.16 + 0.42 * t})` : '#141414';
        return <path key={code} d={US_STATE_PATHS[code].d} fill={fill} className={active ? 'is-active' : undefined} />;
      })}
      {tone === 'dark'
        ? codes
            .filter((c) => intensity[c] !== undefined)
            .map((c) => (
              <circle key={c} cx={US_STATE_PATHS[c].c[0]} cy={US_STATE_PATHS[c].c[1]} r={4 + 6 * intensity[c]} className="ifta-map__dot" filter="url(#ifta-map-glow)" />
            ))
        : null}
    </svg>
  );
}

export function IftaShareLegend({ shares }: { shares: IftaShare[] }) {
  return (
    <ul className="ifta-legend">
      {shares.map((s, i) => (
        <li key={s.code}>
          <span className="ifta-legend__dot" style={{ background: shareColor(s, i) }} aria-hidden="true" />
          <span className="ifta-legend__name">{s.name}</span>
          <span className="ifta-legend__pct">{s.pct}%</span>
        </li>
      ))}
    </ul>
  );
}

/* ───────────────────────────── bars + donut ───────────────────────────── */

export function IftaMileageBars({ shares }: { shares: IftaShare[] }) {
  const max = Math.max(1, ...shares.map((s) => s.value));
  return (
    <div className="ifta-bars" role="img" aria-label={`Miles by jurisdiction: ${shares.map((s) => `${s.name} ${formatNumber(s.value)}`).join(', ')}`}>
      {shares.map((s, i) => (
        <div key={s.code} className="ifta-bars__col">
          <span className="ifta-bars__value">{formatNumber(s.value)}</span>
          <span className="ifta-bars__track">
            <span className="ifta-bars__bar" style={{ height: `${Math.max(4, (s.value / max) * 100)}%`, background: s.code === 'OTHER' ? '#1A1A1A' : undefined, opacity: s.code === 'OTHER' ? 1 : 1 - i * 0.08 }} />
          </span>
          <span className="ifta-bars__code">{s.code === 'OTHER' ? 'Other' : s.code}</span>
        </div>
      ))}
    </div>
  );
}

export function IftaFuelDonut({ shares, total, unit = 'Total gallons' }: { shares: IftaShare[]; total: string; unit?: string }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="ifta-donut">
      <svg viewBox="0 0 120 120" role="img" aria-label={`${total} ${unit}`}>
        <circle cx="60" cy="60" r={r} className="ifta-donut__track" />
        {shares.map((s, i) => {
          const len = (s.pct / 100) * c;
          const el = (
            <circle
              key={s.code}
              cx="60"
              cy="60"
              r={r}
              className="ifta-donut__seg"
              stroke={shareColor(s, i)}
              strokeDasharray={`${Math.max(0, len - 1.2)} ${c}`}
              strokeDashoffset={-offset}
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="ifta-donut__center">
        <span className="ifta-donut__total">{total}</span>
        <span className="ifta-donut__unit">{unit}</span>
      </div>
    </div>
  );
}

/* ───────────────────────────── uploads · activity · tasks · flags ───────────────────────────── */

function fileBadge(label: string): { text: string; tone: string } {
  const ext = /\.([a-z0-9]+)$/i.exec(label)?.[1]?.toLowerCase();
  if (ext === 'csv') return { text: 'CSV', tone: 'csv' };
  if (ext === 'xls' || ext === 'xlsx') return { text: 'XLS', tone: 'xls' };
  if (ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'heic') return { text: 'IMG', tone: 'img' };
  return { text: 'PDF', tone: 'pdf' };
}

export function IftaUploadRows({ rows }: { rows: IftaUploadRow[] }) {
  if (!rows.length) return <p className="ifta-empty-line">Nothing uploaded yet this quarter.</p>;
  return (
    <ul className="ifta-uploads">
      {rows.map((u) => {
        const badge = u.kind === 'RECEIPTS' ? { text: 'IMG', tone: 'img' } : fileBadge(u.label);
        return (
          <li key={u.id}>
            <span className={`ifta-filebadge ifta-filebadge--${badge.tone}`}>{badge.text}</span>
            <span className="ifta-uploads__text">
              <span className="ifta-uploads__name">{u.label}</span>
              <span className="ifta-uploads__meta">{u.detail}</span>
            </span>
            <IftaIcon name="done" size={20} className="ifta-uploads__ok" />
          </li>
        );
      })}
    </ul>
  );
}

const ACTOR_LABEL: Record<IftaAuditEvent['actor'], string> = { CLIENT: 'Client', FOUNDER_STAFF: 'AIO', SYSTEM: 'System' };

export function IftaActivity({ events, showActor = false }: { events: IftaAuditEvent[]; showActor?: boolean }) {
  if (!events.length) return <p className="ifta-empty-line">No activity yet.</p>;
  return (
    <ol className="ifta-timeline">
      {events.map((e, i) => (
        <li key={e.id} className={i === 0 ? 'is-latest' : undefined}>
          <span className="ifta-timeline__dot" aria-hidden="true" />
          <div className="ifta-timeline__body">
            <span className="ifta-timeline__action">{e.action}</span>
            <span className="ifta-timeline__meta">
              {showActor ? (
                <span className={`ifta-actor ifta-actor--${e.actor.toLowerCase()}`}>{ACTOR_LABEL[e.actor]}</span>
              ) : null}
              {e.actorName} · {formatDateTime(e.at)}
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function IftaTaskList({ tasks, empty }: { tasks: IftaTaskRow[]; empty: string }) {
  if (!tasks.length) return <p className="ifta-empty-line">{empty}</p>;
  return (
    <ul className="ifta-tasks">
      {tasks.map((t) => (
        <li key={t.id} className={t.done ? 'is-done' : undefined}>
          <span className="ifta-tasks__box" aria-hidden="true">
            {t.done ? <IftaIcon name="check" size={13} strokeWidth={3} /> : null}
          </span>
          <span className="ifta-tasks__text">
            <span className="ifta-tasks__label">{t.label}</span>
            <span className="ifta-tasks__detail">{t.detail}</span>
          </span>
          <span className={`ifta-owner ifta-owner--${t.owner.toLowerCase()}`}>{t.owner === 'CLIENT' ? 'Client' : 'AIO'}</span>
        </li>
      ))}
    </ul>
  );
}

const FLAG_ICON: Record<IftaFlagRow['tone'], IftaIconName> = { ok: 'done', warn: 'warn', alert: 'flag' };

export function IftaFlags({ flags }: { flags: IftaFlagRow[] }) {
  return (
    <ul className="ifta-flags">
      {flags.map((f) => (
        <li key={f.id} className={`ifta-flags__row ifta-flags__row--${f.tone}`}>
          <IftaIcon name={FLAG_ICON[f.tone]} size={20} />
          <span className="ifta-flags__text">
            <span className="ifta-flags__label">{f.label}</span>
            <span className="ifta-flags__detail">{f.detail}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/* ───────────────────────────── insights ───────────────────────────── */

export function IftaInsights({ lines, media }: { lines: string[]; media?: string }) {
  return (
    <section className="ifta-panel ifta-insights" aria-label="AIO insights">
      <header className="ifta-panel__head">
        <span className="ifta-insights__bulb" aria-hidden="true">
          <IftaIcon name="bulb" size={20} />
        </span>
        <h3 className="ifta-panel__title">AIO insights</h3>
      </header>
      {lines.map((l) => (
        <p key={l} className="ifta-insights__line">
          {l}
        </p>
      ))}
      {media ? <img className="ifta-insights__media" src={media} alt="" loading="lazy" decoding="async" /> : null}
    </section>
  );
}

/* ───────────────────────────── bottom CTA rail ───────────────────────────── */

export function IftaCtaRail({
  eyebrow,
  label,
  icon = 'clipboard',
  to,
  onClick,
  actionLabel,
}: {
  eyebrow: string;
  label: string;
  icon?: IftaIconName;
  to?: string;
  onClick?: () => void;
  actionLabel: string;
}) {
  const inner = (
    <>
      <span className="ifta-cta-rail__tile" aria-hidden="true">
        <IftaIcon name={icon} size={24} strokeWidth={1.6} />
      </span>
      <span className="ifta-cta-rail__divider" aria-hidden="true" />
      <span className="ifta-cta-rail__text">
        <span className="ifta-cta-rail__eyebrow">{eyebrow}</span>
        <span className="ifta-cta-rail__label">{label}</span>
      </span>
      <span className="ifta-cta-rail__go" aria-hidden="true">
        <IftaIcon name="arrow" size={22} strokeWidth={2.2} />
      </span>
    </>
  );
  return to ? (
    <Link to={to} className="ifta-cta-rail" aria-label={actionLabel}>
      {inner}
    </Link>
  ) : (
    <button type="button" className="ifta-cta-rail" onClick={onClick} aria-label={actionLabel}>
      {inner}
    </button>
  );
}

/* ───────────────────────────── identity chips ───────────────────────────── */

export function IftaAvatar({ initials, name, role }: { initials: string; name: string; role: string }) {
  return (
    <span className="ifta-avatar">
      <span className="ifta-avatar__disc" aria-hidden="true">
        {initials}
      </span>
      <span className="ifta-avatar__text">
        <span className="ifta-avatar__name">{name}</span>
        <span className="ifta-avatar__role">{role}</span>
      </span>
    </span>
  );
}
