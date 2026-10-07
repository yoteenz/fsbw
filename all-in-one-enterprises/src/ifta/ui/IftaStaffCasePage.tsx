import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useDemoStore } from '../../demo/useDemoStore';
import { aioPaths } from '../../utils/paths';
import {
  MILEAGE_QUALITY_COPY,
  RECEIPT_CLASS_COPY,
  clientOpenItems,
  clientStatusLine,
  effectiveState,
  fleetReadiness,
  formatNumber,
  jurisdictionName,
  receiptTotals,
  staffNextAction,
  staffStatusLine,
  taxPositionLabel,
  templateVars,
} from '../iftaDerive';
import { primaryCta } from '../experience/iftaExperience';
import { iftaContactName } from '../iftaSeed';
import { companyName, findOrgQuarter, orgHasIftaWorkspace } from '../iftaRouteHelpers';
import { formatShortDate, quarterLabel } from '../iftaDates';
import type { IftaQuarterCase, IftaReceiptClass } from '../iftaTypes';
import { IftaIcon } from './IftaIcon';
import { IFTA_PLATES } from './iftaAssetManifest';
import {
  IftaActorActivity,
  IftaBars,
  IftaCard,
  IftaChip,
  IftaCtaRail,
  IftaDates,
  IftaDonut,
  IftaFooter,
  IftaHealth,
  IftaHero,
  IftaLegend,
  IftaRail,
  IftaRisks,
  IftaRows,
  IftaStaffTasks,
  IftaStatePill,
  IftaTabs,
  IftaUsMap,
  IftaVehicles,
  IftaWorkflow,
  type IftaTone,
} from './IftaModules';
import { RunFaqsPanel } from './RunFaqsPanel';
import { useIftaShellData } from './IftaWorkspaceShell';
import { useIftaBand, type IftaBand } from './iftaScale';
import {
  BUCKET_TONE,
  activityRows,
  caseHealth,
  caseRisk,
  filingPhases,
  fuelShares,
  healthRows,
  importantDates,
  metricDeltas,
  mileageShares,
  priorQuarterCase,
  quarterMetrics,
  recentActivity,
  riskRows,
  shortName,
  staffTaskRows,
} from './iftaViewModel';

const STAFF_TABS = ['OVERVIEW', 'FUEL PURCHASES', 'MILEAGE', 'VEHICLES', 'JURISDICTIONS', 'DOCUMENTS', 'NOTES'] as const;
type StaffTab = (typeof STAFF_TABS)[number];

const RECEIPT_TONE: Record<IftaReceiptClass, 'success' | 'warn' | 'progress' | 'alert' | 'muted'> = {
  READY: 'success',
  UNDER_AIO_REVIEW: 'progress',
  NEEDS_YOU: 'warn',
  UNREADABLE: 'alert',
  POSSIBLE_MISSING: 'warn',
  DUPLICATE: 'muted',
};
const QUALITY_TONE = { VERIFIED: 'green', AIO_CHECKING: 'amber', AIO_BUILDING: 'amber', ESTIMATE: 'amber', MISSING: 'red', NOT_OPERATED: 'grey' } as const;
const PILL_TONE: Record<string, IftaTone> = { alert: 'amber', progress: 'blue', gold: 'gold', warn: 'gold', success: 'green', muted: 'green' };

/** AIO OFFICE · IFTA · CLIENT-QUARTER CASE — the approved FOUNDER / STAFF screens over the same canonical case. */
export function IftaStaffCasePage() {
  const { clientId = '', quarterKey = '' } = useParams<{ clientId: string; quarterKey: string }>();
  const store = useDemoStore();
  const [tab, setTab] = useState<StaffTab>('OVERVIEW');
  const band = useIftaBand();
  const now = new Date();

  if (!orgHasIftaWorkspace(store, clientId)) return <Navigate to={aioPaths.officeWorkspaceIfta} replace />;
  const quarter = findOrgQuarter(store, clientId, quarterKey);
  if (!quarter) {
    return (
      <div className="ifta-frame">
        <div className="ifta-notice ifta-notice--block">
          <strong>Case not found</strong>
          <Link to={aioPaths.officeWorkspaceIfta} className="ifta-btn ifta-btn--ghost">
            ← Fuel tax queue
          </Link>
        </div>
      </div>
    );
  }
  const staffId = store.officeStaffId ?? store.staff[0]?.id;
  const staffName = store.staff.find((s) => s.id === quarter.assignedStaffId)?.name ?? store.staff.find((s) => s.id === staffId)?.name ?? 'AIO staff';
  const prior = priorQuarterCase(store.iftaQuarters ?? [], quarter);
  return (
    <StaffCase quarter={quarter} prior={prior} client={companyName(store, clientId)} contact={iftaContactName(clientId)} staffName={staffName} quarterKey={quarterKey} now={now} tab={tab} setTab={setTab} band={band} />
  );
}

function exportCase(q: IftaQuarterCase, client: string) {
  const lines = [
    ['Client', client],
    ['Quarter', quarterLabel(q)],
    ['Case', q.id],
    ['IFTA account', q.iftaAccount],
    [],
    ['Jurisdiction', 'Miles', 'Share %'],
    ...mileageShares(q, 99).map((s) => [s.code, String(s.value), String(s.pct)]),
    [],
    ['Purchase jurisdiction', 'Gallons', 'Share %'],
    ...fuelShares(q, 99).map((s) => [s.code, String(s.value), String(s.pct)]),
  ];
  const csv = lines.map((l) => l.map((c) => (/[",]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c)).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${q.id}-report.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function StaffCase({
  quarter,
  prior,
  client,
  contact,
  staffName,
  quarterKey,
  now,
  tab,
  setTab,
  band,
}: {
  quarter: IftaQuarterCase;
  prior: IftaQuarterCase | undefined;
  client: string;
  contact: string;
  staffName: string;
  quarterKey: string;
  now: Date;
  tab: StaffTab;
  setTab: (t: StaffTab) => void;
  band: IftaBand;
}) {
  const state = effectiveState(quarter, now);
  const vars = templateVars(quarter, now);
  const staffCta = primaryCta(state, 'FOUNDER_STAFF', vars) || staffNextAction(quarter, now);
  const health = caseHealth(quarter, now);
  const risk = caseRisk(quarter, now);
  const metrics = quarterMetrics(quarter);
  const deltas = band === 'desktop' ? metricDeltas(quarter, prior) : null;
  const shares = mileageShares(quarter);
  const fuel = fuelShares(quarter);
  const totals = receiptTotals(quarter);
  const fleet = fleetReadiness(quarter);
  const desktop = band === 'desktop';
  const gallonsOf = new Map(fuel.map((s) => [s.code, s.value]));

  useIftaShellData({
    search: [
      ...quarter.receipts.filter((r) => r.vendor).map((r) => ({ id: r.id, label: `${r.vendor} · ${r.jurisdiction}`, detail: RECEIPT_CLASS_COPY[r.receiptClass].staff, onSelect: () => setTab('FUEL PURCHASES') })),
      ...quarter.vehicles.map((v) => ({ id: v.id, label: v.unit, detail: v.description, onSelect: () => setTab('VEHICLES') })),
      ...quarter.audit.map((a) => ({ id: a.id, label: a.action, detail: `${a.actorName} · ${formatShortDate(a.at)}`, onSelect: () => setTab('NOTES') })),
    ],
    notices: [
      ...clientOpenItems(quarter, now).map((i) => ({ id: i.id, label: i.title, detail: 'Waiting on client', tone: 'warn' as const })),
      ...quarter.discrepancies.filter((d) => d.status === 'OPEN').map((d) => ({ id: d.id, label: d.detail, detail: 'Open discrepancy', tone: 'alert' as const })),
    ],
  });

  const workflow = (
    <IftaCard title="Filing workflow" className="ifta-a-workflow" action={desktop ? { onClick: () => setTab('NOTES') } : null}>
      <IftaWorkflow phases={filingPhases(quarter, now, 'STAFF')} />
    </IftaCard>
  );
  const tasks = (
    <IftaCard title="Quarter tasks" className="ifta-a-tasks" action={desktop ? { label: 'Due date', onClick: () => setTab('NOTES') } : { onClick: () => setTab('NOTES') }}>
      <IftaStaffTasks rows={staffTaskRows(quarter, now, staffName, contact).slice(0, 6)} compact={!desktop} />
    </IftaCard>
  );
  const barsCard = (
    <IftaCard title="Mileage by jurisdiction" className="ifta-a-bars" action={{ onClick: () => setTab('MILEAGE') }}>
      {shares.length ? (
        desktop ? (
          <IftaBars shares={shares} values />
        ) : (
          <div className="ifta-barswrap">
            <IftaBars shares={shares} axis={false} labels={false} />
            <IftaLegend shares={shares} value="value" />
          </div>
        )
      ) : (
        <p className="ifta-empty">No miles recorded yet.</p>
      )}
    </IftaCard>
  );
  const donutCard = (
    <IftaCard title="Fuel purchases" className="ifta-a-donut" action={desktop ? { onClick: () => setTab('FUEL PURCHASES') } : null}>
      {fuel.length ? (
        <div className="ifta-donutwrap">
          <IftaDonut shares={fuel} total={formatNumber(totals.gallons)} />
          <IftaLegend shares={fuel} show="code" extra={desktop ? (s) => formatNumber(gallonsOf.get(s.code) ?? 0) : undefined} />
        </div>
      ) : (
        <p className="ifta-empty">No fuel receipts counted yet.</p>
      )}
    </IftaCard>
  );
  const clientAct = (
    <IftaCard title="Recent client activity" className="ifta-a-clientact" action={{ onClick: () => setTab('NOTES') }}>
      <IftaActorActivity rows={activityRows(quarter, 4, 'CLIENT')} kind="client" table={desktop} />
    </IftaCard>
  );
  const teamAct = (
    <IftaCard title="AIO team activity" className="ifta-a-teamact" action={{ onClick: () => setTab('NOTES') }}>
      <IftaActorActivity rows={activityRows(quarter, 4, 'FOUNDER_STAFF')} kind="team" table={desktop} />
    </IftaCard>
  );
  const risks = (
    <IftaCard title="Risks / flags" className="ifta-a-risks" action={{ onClick: () => setTab('NOTES') }}>
      <IftaRisks rows={riskRows(quarter, now).slice(0, 4)} table={desktop} />
    </IftaCard>
  );

  const overview = desktop ? (
    <div className="ifta-grid ifta-grid--staff-desktop">
      {workflow}
      {tasks}
      <IftaCard title="Important dates" className="ifta-a-dates" action={{ onClick: () => setTab('NOTES') }}>
        <IftaDates rows={importantDates(quarter).slice(0, 4)} />
      </IftaCard>
      {barsCard}
      {donutCard}
      <IftaCard title="Vehicles" className="ifta-a-vehicles" action={{ onClick: () => setTab('VEHICLES') }}>
        <IftaVehicles rows={fleet.map((v) => ({ id: v.vehicle.id, unit: v.vehicle.unit, detail: '', value: `${formatNumber(v.miles)} mi`, tone: QUALITY_TONE[v.quality], status: MILEAGE_QUALITY_COPY[v.quality].badge }))} variant="staff" />
        <button type="button" className="ifta-viewall ifta-viewall--block" onClick={() => setTab('VEHICLES')}>
          View all vehicles ({quarter.vehicles.length})
          <IftaIcon name="arrow" size={12} strokeWidth={2} />
        </button>
      </IftaCard>
      {clientAct}
      {teamAct}
      {risks}
    </div>
  ) : (
    <div className={`ifta-grid ifta-grid--staff-${band}`}>
      {workflow}
      {tasks}
      {barsCard}
      {donutCard}
      {clientAct}
      {teamAct}
      {risks}
    </div>
  );

  const vehiclesList = (
    <IftaRows>
      {fleet.map((v) => (
        <li key={v.vehicle.id} className="ifta-row">
          <span className="ifta-row__main">
            <span className="ifta-row__title">
              {v.vehicle.unit} — {v.vehicle.description}
            </span>
            <span className="ifta-row__meta">
              {formatNumber(v.miles)} mi · {formatNumber(v.gallons, 0)} gal{v.mpg !== null ? ` · ${v.mpg} mpg` : ''}
              {v.mpgOutlier ? ' · MPG outside band' : ''}
            </span>
          </span>
          <IftaChip label={MILEAGE_QUALITY_COPY[v.quality].badge} tone={QUALITY_TONE[v.quality]} />
        </li>
      ))}
    </IftaRows>
  );

  const body: Record<StaffTab, JSX.Element> = {
    OVERVIEW: overview,
    'FUEL PURCHASES': (
      <div className="ifta-grid ifta-grid--split">
        <div className="ifta-a-side">{donutCard}</div>
        <IftaCard title={`Receipts · ${quarter.receipts.length}`} className="ifta-a-main">
          <IftaRows>
            {quarter.receipts.map((r) => (
              <li key={r.id} className="ifta-row">
                <span className="ifta-row__main">
                  <span className="ifta-row__title">{r.vendor ?? '—'}</span>
                  <span className="ifta-row__meta">{[r.location, r.purchaseDate ? formatShortDate(r.purchaseDate) : null, quarter.vehicles.find((v) => v.id === r.vehicleId)?.unit, r.flag?.reason].filter(Boolean).join(' · ')}</span>
                </span>
                <span className="ifta-row__state">{r.jurisdiction}</span>
                <span className="ifta-row__num">{r.gallons !== null ? `${formatNumber(r.gallons, 1)} gal` : '—'}</span>
                <IftaChip label={RECEIPT_CLASS_COPY[r.receiptClass].staff} tone={RECEIPT_TONE[r.receiptClass]} />
              </li>
            ))}
          </IftaRows>
        </IftaCard>
      </div>
    ),
    MILEAGE: (
      <div className="ifta-grid ifta-grid--split">
        <IftaCard title="Mileage by jurisdiction" className="ifta-a-main">
          {shares.length ? (
            <div className="ifta-barswrap">
              <IftaBars shares={mileageShares(quarter, 8)} values />
              <IftaLegend shares={mileageShares(quarter, 8)} value="value" />
            </div>
          ) : (
            <p className="ifta-empty">No miles recorded yet.</p>
          )}
        </IftaCard>
        <IftaCard title={`Vehicles · ${quarter.vehicles.length}`} className="ifta-a-side">
          {vehiclesList}
        </IftaCard>
      </div>
    ),
    VEHICLES: (
      <div className="ifta-grid ifta-grid--single">
        <IftaCard title={`Vehicles · ${quarter.vehicles.length}`}>{vehiclesList}</IftaCard>
      </div>
    ),
    JURISDICTIONS: (
      <div className="ifta-grid ifta-grid--split">
        <IftaCard title="Jurisdiction breakdown" className="ifta-a-main">
          {shares.length ? (
            <div className="ifta-mapwrap">
              <IftaUsMap shares={shares} label={`Miles by state, ${quarterLabel(quarter)}`} />
              <IftaLegend shares={shares} />
            </div>
          ) : (
            <p className="ifta-empty">No miles recorded yet.</p>
          )}
        </IftaCard>
        <IftaCard title="Return summary" className="ifta-a-side">
          {quarter.returnSummary ? (
            <IftaRows>
              {quarter.returnSummary.lines.map((l) => {
                const pos = taxPositionLabel(l.netTax);
                return (
                  <li key={l.jurisdiction} className="ifta-row">
                    <span className="ifta-row__main">
                      <span className="ifta-row__title">{jurisdictionName(l.jurisdiction)}</span>
                      <span className="ifta-row__meta">
                        {formatNumber(l.miles)} mi · {formatNumber(l.taxPaidGallons, 1)} gal
                      </span>
                    </span>
                    <span className="ifta-row__num">
                      {pos.label} {pos.amount}
                    </span>
                  </li>
                );
              })}
            </IftaRows>
          ) : (
            <p className="ifta-pending">Tax due / credit — pending AIO preparation (staff worksheet)</p>
          )}
        </IftaCard>
      </div>
    ),
    DOCUMENTS: (
      <div className="ifta-grid ifta-grid--single">
        <IftaCard title="Vault packet">
          {quarter.vault ? (
            <div className="ifta-vault">
              <IftaIcon name="vault" size={28} />
              <div>
                <p className="ifta-vault__path">{quarter.vault.path.join(' / ')}</p>
                <ul className="ifta-vault__contents">
                  {quarter.vault.contents.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="ifta-empty">No sealed packet yet — the Vault packet is sealed when the filing is recorded.</p>
          )}
        </IftaCard>
      </div>
    ),
    NOTES: (
      <div className="ifta-grid ifta-grid--notes">
        <IftaCard title="Staff notes · not visible to client" className="ifta-notes">
          <p className="ifta-notes__by">Jordan Lee · {formatShortDate(now.toISOString())}</p>
          <p>Reefer-lane receipt on Truck 02 — waiting on client confirmation. Unreadable GA photo needs retake.</p>
        </IftaCard>
        <IftaCard title="Client ⇄ AIO mirror" className="ifta-mirror-card">
          <div className="ifta-mirror" aria-label="Client staff mirror">
            <div className="ifta-mirror__side">
              <span className="ifta-mirror__label">
                <IftaIcon name="user" size={15} /> Client sees
              </span>
              <span className="ifta-mirror__line">{clientStatusLine(quarter, now)}</span>
            </div>
            <div className="ifta-mirror__side is-staff">
              <span className="ifta-mirror__label">
                <IftaIcon name="shield" size={15} /> AIO sees
              </span>
              <span className="ifta-mirror__line">{staffStatusLine(quarter, now)}</span>
            </div>
          </div>
          <Link to={aioPaths.portalWorkspaceIftaQuarter(quarterKey)} className="ifta-btn ifta-btn--outline">
            <IftaIcon name="user" size={16} />
            Open client filing room
          </Link>
          <div className="ifta-caserecord" aria-label="Case record">
            <span>
              <em>Case</em> <code>{quarter.id}</code>
            </span>
            <span>
              <em>Client</em> {quarter.organizationId}
            </span>
            <span>
              <em>Assigned</em> {quarter.assignedStaffId}
            </span>
            <span>
              <em>Packet</em> {health.packet}%
            </span>
          </div>
        </IftaCard>
        <RunFaqsPanel />
        <IftaCard title="Audit trail" className="ifta-audit">
          <ol className="ifta-auditlist">
            {recentActivity(quarter, 12).map((a) => (
              <li key={a.id}>
                <span className={`ifta-auditlist__who is-${a.actor === 'CLIENT' ? 'client' : a.actor === 'SYSTEM' ? 'system' : 'aio'}`}>{a.actor === 'CLIENT' ? 'Client' : a.actor === 'SYSTEM' ? 'System' : 'AIO'}</span>
                <span className="ifta-auditlist__what">
                  {a.action}
                  {a.note ? <small>{a.note}</small> : null}
                </span>
                <span className="ifta-auditlist__when">
                  {a.actorName} · {formatShortDate(a.at)}
                </span>
              </li>
            ))}
          </ol>
        </IftaCard>
      </div>
    ),
  };

  const healthPanel = <IftaHealth title="Client health" rows={healthRows(quarter, now)} risk={band === 'mobile' ? undefined : risk} />;

  return (
    <div className={`ifta-page ifta-page--staff is-${band}`}>
      <IftaHero
        actor="staff"
        plates={IFTA_PLATES.staff}
        label={`IFTA filing room ${quarterLabel(quarter)} · ${client}`}
        eyebrow="IFTA filing room"
        title={quarterLabel(quarter)}
        period={`${formatShortDate(quarter.periodStart)} – ${formatShortDate(quarter.periodEnd)}, ${quarter.year}`}
        lines={
          <p>
            <span title={client}>Client: {shortName(contact)}</span>
            <br />
            Account {quarter.iftaAccount}
          </p>
        }
        pill={<IftaStatePill label={health.bucketLabel} tone={PILL_TONE[BUCKET_TONE[health.bucket]] ?? 'gold'} />}
        aside={healthPanel}
      />
      <div className="ifta-frame ifta-frame--rail">
        <IftaRail
          cells={[
            { glyph: 'metric-miles', value: formatNumber(metrics.miles), label: 'Total miles', delta: deltas?.miles },
            { glyph: 'metric-fuel', value: formatNumber(metrics.gallons), label: 'Total fuel (gal)', delta: deltas?.gallons },
            { glyph: 'metric-pin', value: String(metrics.jurisdictions), label: 'Jurisdictions', delta: deltas?.jurisdictions },
            { glyph: 'metric-coins', value: metrics.tax.value, label: metrics.tax.kind === 'PENDING' ? 'Tax due / credit' : metrics.tax.label, muted: metrics.tax.kind === 'PENDING', delta: deltas?.tax.dir === 'none' ? null : deltas?.tax },
          ]}
          extra={band === 'mobile' ? <span className={`ifta-riskchip is-${risk.level.toLowerCase()}`}>{risk.label}</span> : undefined}
        />
      </div>

      <div className="ifta-frame">
        <IftaTabs
          tabs={STAFF_TABS}
          current={tab}
          onSelect={setTab}
          label="Staff case sections"
          secondary={['NOTES']}
          right={
            desktop ? (
              <button type="button" className="ifta-export" onClick={() => exportCase(quarter, client)}>
                <IftaIcon name="download" size={18} strokeWidth={2} />
                Export report
              </button>
            ) : null
          }
        />

        <div role="tabpanel" aria-label={tab}>
          {body[tab]}
        </div>

        <IftaCtaRail eyebrow="Open" label={quarter.staffWorksheet?.length ? 'Return draft' : staffCta} icon="clipboard" />
        <IftaFooter tagline={['Operations', 'Compliance', 'Client success']} />
      </div>
    </div>
  );
}
