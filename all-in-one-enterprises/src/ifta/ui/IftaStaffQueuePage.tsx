import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDemoStore } from '../../demo/useDemoStore';
import { aioPaths } from '../../utils/paths';
import { packetCompleteness, staffNextAction, staffStatusLine } from '../iftaDerive';
import { companyName } from '../iftaRouteHelpers';
import { daysUntil, formatShortDate, quarterLabel } from '../iftaDates';
import type { IftaQuarterCase } from '../iftaTypes';
import type { StaffBucket } from '../iftaDerive';
import { IftaIcon } from './IftaIcon';
import { IFTA_PLATES } from './iftaAssetManifest';
import { IftaActorActivity, IftaCard, IftaCtaRail, IftaDates, IftaFooter, IftaHealth, IftaHero, IftaRail, IftaRisks, IftaStatePill, IftaTabs } from './IftaModules';
import { useIftaShellData } from './IftaWorkspaceShell';
import { useIftaBand } from './iftaScale';
import { BUCKET_TONE, activityRows, initials, queueDeadlines, queueLanes, queueSummary, formatMediumDate, type IftaActivityRow } from './iftaViewModel';

const QUEUE_TABS = ['ALL CASES', 'NEEDS AIO', 'AWAITING CLIENT', 'READY TO FILE', 'FILED', 'COMPLETE'] as const;
type QueueTab = (typeof QUEUE_TABS)[number];
const TAB_BUCKETS: Record<QueueTab, StaffBucket[] | null> = {
  'ALL CASES': null,
  'NEEDS AIO': ['BLOCKED', 'NEEDS_REVIEW'],
  'AWAITING CLIENT': ['AWAITING_CLIENT'],
  'READY TO FILE': ['READY_TO_FILE', 'PAYMENT_PENDING'],
  FILED: ['FILED'],
  COMPLETE: ['COMPLETE'],
};

/**
 * AIO OFFICE · IFTA WORKSPACE · FUEL TAX QUEUE — the cross-client landing state, derived from the approved staff case
 * screens (D-STAFF-QUEUE-AUTHORITY): same chrome, hero + QUEUE HEALTH panel, metrics rail, tab bar, cards, CTA rail.
 */
export function IftaStaffQueuePage() {
  const store = useDemoStore();
  const band = useIftaBand();
  const [tab, setTab] = useState<QueueTab>('ALL CASES');
  const now = new Date();
  const cases = store.iftaQuarters ?? [];
  const lanes = queueLanes(cases, now);
  const summary = queueSummary(cases, now);
  const deadlines = queueDeadlines(cases, now);
  const active = lanes.filter((l) => l.bucket !== 'COMPLETE');
  const next = active[0]?.cases[0];
  const keyOf = (q: IftaQuarterCase) => `${q.year}-Q${q.quarter}`;
  const caseTo = (q: IftaQuarterCase) => aioPaths.officeWorkspaceIftaCase(q.organizationId, keyOf(q));
  const ordered = lanes.flatMap((l) => l.cases.map((q) => ({ q, bucket: l.bucket, label: l.label })));
  const shown = TAB_BUCKETS[tab] ? ordered.filter((c) => TAB_BUCKETS[tab]!.includes(c.bucket)) : ordered;
  const needsAio = summary.counts.BLOCKED + summary.counts.NEEDS_REVIEW + summary.counts.READY_TO_FILE;
  const filingDue = cases.find((q) => quarterLabel(q) === summary.filing.label)?.dueDate;

  const team: IftaActivityRow[] = cases
    .flatMap((q) => activityRows(q, 3, 'FOUNDER_STAFF').map((r) => ({ ...r, text: `${r.text} · ${companyName(store, q.organizationId)}`, sort: q.audit.find((a) => a.id === r.id)?.at ?? '' })))
    .sort((a, b) => b.sort.localeCompare(a.sort))
    .slice(0, 4);

  useIftaShellData({
    search: cases.map((q) => ({ id: q.id, label: `${companyName(store, q.organizationId)} · ${quarterLabel(q)}`, detail: staffStatusLine(q, now), to: caseTo(q) })),
    notices: active
      .filter((l) => l.bucket === 'BLOCKED' || l.bucket === 'NEEDS_REVIEW' || l.bucket === 'READY_TO_FILE')
      .flatMap((l) => l.cases.map((q) => ({ id: q.id, label: `${companyName(store, q.organizationId)} · ${quarterLabel(q)}`, detail: l.label, to: caseTo(q), tone: 'warn' as const }))),
  });

  const casesCard = (
    <IftaCard title={`Client quarters · ${shown.length}`} className="ifta-a-cases">
      <ul className="ifta-cases">
        {shown.map(({ q, bucket, label }) => {
          const name = companyName(store, q.organizationId);
          const pct = packetCompleteness(q, now).pct;
          const days = daysUntil(q.dueDate, now);
          return (
            <li key={q.id}>
              <Link to={caseTo(q)} className="ifta-cases__row" aria-label={`${name} ${quarterLabel(q)} — ${staffNextAction(q, now)}`}>
                <span className="ifta-initials ifta-initials--lg" aria-hidden="true">
                  {initials(name)}
                </span>
                <span className="ifta-cases__who">
                  <span className="ifta-cases__name">{name}</span>
                  <span className="ifta-cases__meta">
                    {quarterLabel(q)} · {q.baseJurisdiction} base · {pct}% packet
                  </span>
                </span>
                <span className={`ifta-cases__state is-${BUCKET_TONE[bucket]}`}>{label}</span>
                <span className={`ifta-cases__due${days >= 0 && days <= 10 ? ' is-urgent' : ''}`}>{days >= 0 ? `${formatShortDate(q.dueDate).toUpperCase()} · ${days}d` : formatShortDate(q.dueDate).toUpperCase()}</span>
                <IftaIcon name="chevron" size={16} strokeWidth={2} className="ifta-cases__chev" />
              </Link>
            </li>
          );
        })}
      </ul>
    </IftaCard>
  );
  const datesCard = (
    <IftaCard title="Important dates" className="ifta-a-dates">
      <IftaDates rows={deadlines.slice(0, 4).map((d) => ({ label: d.label, value: `Due ${d.due} · ${d.days} days · ${d.cases} case${d.cases === 1 ? '' : 's'}`, icon: 'calendar' as const }))} />
    </IftaCard>
  );
  const risksCard = (
    <IftaCard title="Risks / flags" className="ifta-a-risks">
      <IftaRisks
        table={band === 'desktop'}
        rows={[
          { id: 'blocked', icon: summary.counts.BLOCKED ? 'flag' : 'ok', item: summary.counts.BLOCKED ? `${summary.counts.BLOCKED} blocked` : 'Nothing blocked', detail: 'Cases that cannot move without AIO' },
          { id: 'disc', icon: summary.openDiscrepancies ? 'flag' : 'ok', item: `${summary.openDiscrepancies} open discrepanc${summary.openDiscrepancies === 1 ? 'y' : 'ies'}`, detail: 'Fuel ⇄ miles reconciliation' },
          { id: 'corr', icon: summary.openCorrections ? 'check' : 'ok', item: `${summary.openCorrections} correction request${summary.openCorrections === 1 ? '' : 's'}`, detail: 'Waiting on client answers' },
          { id: 'due', icon: 'info', item: `${summary.filing.label} returns`, detail: summary.filing.due ? `Due ${summary.filing.due} · ${summary.filing.days} days` : 'No open filing' },
        ]}
      />
    </IftaCard>
  );
  const teamCard = (
    <IftaCard title="AIO team activity" className="ifta-a-teamact">
      <IftaActorActivity rows={team} kind="team" table={false} />
    </IftaCard>
  );

  return (
    <div className={`ifta-page ifta-page--staff ifta-page--queue is-${band}`}>
      <IftaHero
        actor="queue"
        plates={IFTA_PLATES.staff}
        label="Fuel tax queue"
        eyebrow="Fuel tax queue"
        title={summary.filing.label}
        period={filingDue ? `Returns due ${formatMediumDate(filingDue)}` : undefined}
        lines={
          <p>
            {summary.open} open quarter{summary.open === 1 ? '' : 's'}
            <br />
            {summary.total} on file
          </p>
        }
        pill={<IftaStatePill label={`${needsAio} need AIO`} tone={needsAio ? 'gold' : 'green'} />}
        aside={
          <IftaHealth
            title="Queue health"
            rows={[
              { label: 'Needs AIO now', value: String(needsAio), ok: needsAio === 0 },
              { label: 'Waiting on clients', value: String(summary.counts.AWAITING_CLIENT), ok: summary.counts.AWAITING_CLIENT === 0 },
              { label: 'Open discrepancies', value: String(summary.openDiscrepancies), ok: summary.openDiscrepancies === 0 },
              { label: 'Days to deadline', value: summary.filing.days !== null ? String(summary.filing.days) : '—', ok: (summary.filing.days ?? 99) > 10, accent: true },
            ]}
          />
        }
      />
      <div className="ifta-frame ifta-frame--rail">
        <IftaRail
          cells={[
            { icon: 'tasks', value: String(summary.open), label: 'Open quarters' },
            { icon: 'clipboard', value: String(summary.counts.NEEDS_REVIEW + summary.counts.BLOCKED), label: 'Needs review' },
            { icon: 'clock', value: String(summary.counts.AWAITING_CLIENT), label: 'Awaiting client' },
            { icon: 'send', value: String(summary.counts.READY_TO_FILE + summary.counts.PAYMENT_PENDING), label: 'Ready to file' },
          ]}
        />
      </div>
      <div className="ifta-frame">
        <IftaTabs tabs={QUEUE_TABS} current={tab} onSelect={setTab} label="Queue filter" />
        <div role="tabpanel" aria-label={tab} className={`ifta-grid ifta-grid--queue-${band === 'desktop' ? 'desktop' : 'compact'}`}>
          {casesCard}
          {datesCard}
          {risksCard}
          {teamCard}
        </div>
        {next ? <IftaCtaRail eyebrow={`Open next case · ${active[0].label}`} label={`${companyName(store, next.organizationId)} · ${quarterLabel(next)}`} icon="clipboard" to={caseTo(next)} /> : null}
        <IftaFooter tagline={['Operations', 'Compliance', 'Client success']} />
      </div>
    </div>
  );
}
