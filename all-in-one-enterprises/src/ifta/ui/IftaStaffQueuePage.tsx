import { Link } from 'react-router-dom';
import { useDemoStore } from '../../demo/useDemoStore';
import { aioPaths } from '../../utils/paths';
import { clientStatusLine, packetCompleteness, staffNextAction, staffStatusLine } from '../iftaDerive';
import { companyName } from '../iftaRouteHelpers';
import { daysUntil, formatShortDate, quarterLabel } from '../iftaDates';
import type { IftaQuarterCase } from '../iftaTypes';
import { IftaIcon } from './IftaIcon';
import { IftaFilingRoomHero } from './IftaHero';
import { IftaChip, IftaCtaRail, IftaMetricsRail, IftaPanel } from './IftaModules';
import { BUCKET_ICON, BUCKET_TONE, initials, queueDeadlines, queueLanes, queueSummary } from './iftaViewModel';

/**
 * AIO OFFICE · IFTA WORKSPACE · FUEL TAX QUEUE — the cross-client landing state, derived from the staff case authority
 * (D-STAFF-QUEUE-AUTHORITY): light body, dark accents, status lanes, risk language, metrics rail, next action.
 */
export function IftaStaffQueuePage() {
  const store = useDemoStore();
  const now = new Date();
  const cases = store.iftaQuarters ?? [];
  const lanes = queueLanes(cases, now);
  const summary = queueSummary(cases, now);
  const deadlines = queueDeadlines(cases, now);
  const active = lanes.filter((l) => l.bucket !== 'COMPLETE');
  const complete = lanes.find((l) => l.bucket === 'COMPLETE');
  const next = active[0]?.cases[0];
  const keyOf = (q: IftaQuarterCase) => `${q.year}-Q${q.quarter}`;

  return (
    <>
      <IftaFilingRoomHero
        compact
        eyebrow="IFTA workspace"
        title="Fuel tax queue"
        crumbs={<span>AIO Office · Workspaces · IFTA</span>}
        lines={
          <p>
            {summary.open} open quarter{summary.open === 1 ? '' : 's'} · {summary.total} enrolled
            {summary.filing.due ? (
              <>
                <br />
                {summary.filing.label} filing · due {summary.filing.due} · {summary.filing.days} days
              </>
            ) : null}
          </p>
        }
        aside={
          <div className="ifta-health" aria-label="Queue health">
            <p className="ifta-health__title">Queue health</p>
            <ul>
              <li>
                <span>Needs AIO now</span>
                <strong>{summary.counts.BLOCKED + summary.counts.NEEDS_REVIEW + summary.counts.READY_TO_FILE}</strong>
              </li>
              <li>
                <span>Waiting on clients</span>
                <strong>{summary.counts.AWAITING_CLIENT}</strong>
              </li>
              <li>
                <span>Open discrepancies</span>
                <strong>{summary.openDiscrepancies}</strong>
              </li>
              <li>
                <span>Open corrections</span>
                <strong>{summary.openCorrections}</strong>
              </li>
            </ul>
          </div>
        }
      />

      <div className="ifta-frame ifta-frame--lift">
        <IftaMetricsRail
          cells={(['NEEDS_REVIEW', 'BLOCKED', 'AWAITING_CLIENT', 'READY_TO_FILE', 'PAYMENT_PENDING', 'FILED'] as const).map((b) => ({
            icon: BUCKET_ICON[b],
            value: String(summary.counts[b]),
            label: lanes.find((l) => l.bucket === b)?.label ?? b.replace(/_/g, ' ').toLowerCase(),
          }))}
        />
      </div>

      <div className="ifta-frame">
        <div className="ifta-queue">
          <div className="ifta-queue__lanes">
            {active.map((lane) => (
              <section key={lane.bucket} className={`ifta-lane ifta-lane--${BUCKET_TONE[lane.bucket]}`} aria-label={lane.label}>
                <header className="ifta-lane__head">
                  <span className="ifta-lane__icon" aria-hidden="true">
                    <IftaIcon name={BUCKET_ICON[lane.bucket]} size={18} />
                  </span>
                  <h2 className="ifta-lane__title">{lane.label}</h2>
                  <span className="ifta-lane__count">{lane.cases.length}</span>
                </header>
                <ul className="ifta-lane__cases">
                  {lane.cases.map((q) => (
                    <QueueCase key={q.id} q={q} now={now} name={companyName(store, q.organizationId)} to={aioPaths.officeWorkspaceIftaCase(q.organizationId, keyOf(q))} tone={BUCKET_TONE[lane.bucket]} />
                  ))}
                </ul>
              </section>
            ))}
            {complete ? (
              <details className="ifta-lane ifta-lane--muted ifta-lane--archive">
                <summary className="ifta-lane__head">
                  <span className="ifta-lane__icon" aria-hidden="true">
                    <IftaIcon name={BUCKET_ICON.COMPLETE} size={18} />
                  </span>
                  <h2 className="ifta-lane__title">{complete.label} · filed and archived</h2>
                  <span className="ifta-lane__count">{complete.cases.length}</span>
                  <IftaIcon name="chevron" size={18} className="ifta-lane__toggle" />
                </summary>
                <ul className="ifta-lane__cases">
                  {complete.cases.map((q) => (
                    <QueueCase key={q.id} q={q} now={now} name={companyName(store, q.organizationId)} to={aioPaths.officeWorkspaceIftaCase(q.organizationId, keyOf(q))} tone="muted" />
                  ))}
                </ul>
              </details>
            ) : null}
          </div>

          <aside className="ifta-queue__rail">
            <IftaPanel title="Important dates">
              <ul className="ifta-dates">
                {deadlines.map((d) => (
                  <li key={d.due}>
                    <span className="ifta-dates__icon" aria-hidden="true">
                      <IftaIcon name="calendar" size={18} />
                    </span>
                    <span className="ifta-dates__text">
                      <span className="ifta-dates__label">{d.label}</span>
                      <span className="ifta-dates__value">
                        Due {d.due} · {d.days} days · {d.cases} case{d.cases === 1 ? '' : 's'}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </IftaPanel>
            <IftaPanel title="Risks / flags">
              <ul className="ifta-flags">
                <li className={`ifta-flags__row ifta-flags__row--${summary.counts.BLOCKED ? 'alert' : 'ok'}`}>
                  <IftaIcon name={summary.counts.BLOCKED ? 'flag' : 'done'} size={20} />
                  <span className="ifta-flags__text">
                    <span className="ifta-flags__label">{summary.counts.BLOCKED ? `${summary.counts.BLOCKED} blocked` : 'Nothing blocked'}</span>
                    <span className="ifta-flags__detail">Cases that cannot move without AIO</span>
                  </span>
                </li>
                <li className={`ifta-flags__row ifta-flags__row--${summary.openDiscrepancies ? 'warn' : 'ok'}`}>
                  <IftaIcon name={summary.openDiscrepancies ? 'warn' : 'done'} size={20} />
                  <span className="ifta-flags__text">
                    <span className="ifta-flags__label">
                      {summary.openDiscrepancies} open discrepanc{summary.openDiscrepancies === 1 ? 'y' : 'ies'}
                    </span>
                    <span className="ifta-flags__detail">Fuel ⇄ miles reconciliation</span>
                  </span>
                </li>
                <li className={`ifta-flags__row ifta-flags__row--${summary.openCorrections ? 'warn' : 'ok'}`}>
                  <IftaIcon name={summary.openCorrections ? 'warn' : 'done'} size={20} />
                  <span className="ifta-flags__text">
                    <span className="ifta-flags__label">
                      {summary.openCorrections} correction request{summary.openCorrections === 1 ? '' : 's'} open
                    </span>
                    <span className="ifta-flags__detail">Waiting on client answers</span>
                  </span>
                </li>
              </ul>
            </IftaPanel>
          </aside>
        </div>

        {next ? (
          <IftaCtaRail
            eyebrow={`Open next case · ${active[0].label}`}
            label={`${companyName(store, next.organizationId)} · ${quarterLabel(next)}`}
            icon="clipboard"
            to={aioPaths.officeWorkspaceIftaCase(next.organizationId, keyOf(next))}
            actionLabel={`Open ${companyName(store, next.organizationId)} ${quarterLabel(next)}`}
          />
        ) : null}
      </div>
    </>
  );
}

function QueueCase({ q, now, name, to, tone }: { q: IftaQuarterCase; now: Date; name: string; to: string; tone: 'alert' | 'progress' | 'gold' | 'warn' | 'success' | 'muted' }) {
  const pct = packetCompleteness(q, now).pct;
  const days = Math.max(0, daysUntil(q.dueDate, now));
  const urgency = days <= 10 ? 'alert' : days <= 30 ? 'warn' : 'muted';
  const next = staffNextAction(q, now);
  return (
    <li>
      <Link to={to} className="ifta-qcase" aria-label={`${name} ${quarterLabel(q)} — ${next}`}>
        <span className="ifta-qcase__who">
          <span className="ifta-qcase__avatar" aria-hidden="true">
            {initials(name)}
          </span>
          <span className="ifta-qcase__ident">
            <span className="ifta-qcase__name">{name}</span>
            <span className="ifta-qcase__quarter">
              {quarterLabel(q)} · {q.baseJurisdiction} base
            </span>
          </span>
        </span>
        <span className={`ifta-qcase__due ifta-qcase__due--${urgency}`}>
          <span className="ifta-qcase__due-date">{formatShortDate(q.dueDate)}</span>
          <span className="ifta-qcase__due-days">{days}d</span>
        </span>
        <span className="ifta-qcase__packet">
          <span className="ifta-qcase__bar">
            <span style={{ width: `${pct}%` }} />
          </span>
          <span className="ifta-qcase__pct">{pct}% packet</span>
        </span>
        <span className="ifta-qcase__mirror">
          <span>
            <em>Client sees</em> {clientStatusLine(q, now)}
          </span>
          <span>
            <em>AIO sees</em> {staffStatusLine(q, now)}
          </span>
        </span>
        <span className="ifta-qcase__next">
          <IftaChip label={next} tone={tone} />
          <IftaIcon name="chevron" size={18} />
        </span>
      </Link>
    </li>
  );
}
