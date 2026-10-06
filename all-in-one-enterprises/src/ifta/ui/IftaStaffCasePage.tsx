import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useDemoStore } from '../../demo/useDemoStore';
import { aioPaths } from '../../utils/paths';
import {
  MILEAGE_QUALITY_COPY,
  RECEIPT_CLASS_COPY,
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
import { companyName, findOrgQuarter, orgHasIftaWorkspace } from '../iftaRouteHelpers';
import { daysUntil, formatShortDate, quarterLabel } from '../iftaDates';
import type { IftaQuarterCase, IftaReceiptClass } from '../iftaTypes';
import { IftaIcon } from './IftaIcon';
import { IftaFilingRoomHero } from './IftaHero';
import {
  IftaActivity,
  IftaChip,
  IftaCtaRail,
  IftaFlags,
  IftaFuelDonut,
  IftaMetricsRail,
  IftaMileageBars,
  IftaPanel,
  IftaPhaseStepper,
  IftaShareLegend,
  IftaStatusPill,
  IftaTaskList,
  IftaUsMap,
} from './IftaModules';
import { RunFaqsPanel } from './RunFaqsPanel';
import {
  BUCKET_TONE,
  caseHealth,
  filingPhases,
  fuelShares,
  importantDates,
  mileageIntensity,
  mileageShares,
  quarterMetrics,
  recentActivity,
  riskFlags,
  staffTasks,
} from './iftaViewModel';

const STAFF_TABS = ['OVERVIEW', 'FUEL', 'MILEAGE', 'VEHICLES', 'JURISDICTIONS', 'DOCUMENTS', 'NOTES'] as const;
type StaffTab = (typeof STAFF_TABS)[number];

const RECEIPT_TONE: Record<IftaReceiptClass, 'success' | 'warn' | 'progress' | 'alert' | 'muted'> = {
  READY: 'success',
  UNDER_AIO_REVIEW: 'progress',
  NEEDS_YOU: 'warn',
  UNREADABLE: 'alert',
  POSSIBLE_MISSING: 'warn',
  DUPLICATE: 'muted',
};
const QUALITY_TONE = { VERIFIED: 'success', AIO_CHECKING: 'progress', AIO_BUILDING: 'progress', ESTIMATE: 'warn', MISSING: 'alert', NOT_OPERATED: 'muted' } as const;

/** AIO OFFICE · IFTA · CLIENT-QUARTER CASE — staff operational workspace over the same canonical case the client sees. */
export function IftaStaffCasePage() {
  const { clientId = '', quarterKey = '' } = useParams<{ clientId: string; quarterKey: string }>();
  const store = useDemoStore();
  const [tab, setTab] = useState<StaffTab>('OVERVIEW');
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
  return <StaffCase quarter={quarter} client={companyName(store, clientId)} quarterKey={quarterKey} now={now} tab={tab} setTab={setTab} />;
}

function StaffCase({ quarter, client, quarterKey, now, tab, setTab }: { quarter: IftaQuarterCase; client: string; quarterKey: string; now: Date; tab: StaffTab; setTab: (t: StaffTab) => void }) {
  const state = effectiveState(quarter, now);
  const vars = templateVars(quarter, now);
  const staffCta = primaryCta(state, 'FOUNDER_STAFF', vars) || staffNextAction(quarter, now);
  const health = caseHealth(quarter, now);
  const metrics = quarterMetrics(quarter);
  const shares = mileageShares(quarter);
  const fuel = fuelShares(quarter);
  const totals = receiptTotals(quarter);
  const fleet = fleetReadiness(quarter);
  const days = Math.max(0, daysUntil(quarter.dueDate, now));
  const clientActivity = recentActivity(quarter, 4, 'CLIENT');
  const teamActivity = recentActivity(quarter, 4, 'FOUNDER_STAFF');

  const vehiclesPanel = (
    <IftaPanel title={`Vehicles · ${quarter.vehicles.length}`} className="ifta-area-vehicles">
      <ul className="ifta-vehicles">
        {fleet.map((v) => (
          <li key={v.vehicle.id}>
            <span className="ifta-vehicles__icon" aria-hidden="true">
              <IftaIcon name="truck" size={20} />
            </span>
            <span className="ifta-vehicles__text">
              <span className="ifta-vehicles__unit">{v.vehicle.unit}</span>
              <span className="ifta-vehicles__meta">
                {formatNumber(v.miles)} mi · {formatNumber(v.gallons, 0)} gal{v.mpg !== null ? ` · ${v.mpg} mpg` : ''}
                {v.mpgOutlier ? ' · MPG outside band' : ''}
              </span>
            </span>
            <IftaChip label={MILEAGE_QUALITY_COPY[v.quality].badge} tone={QUALITY_TONE[v.quality]} />
          </li>
        ))}
      </ul>
    </IftaPanel>
  );

  const barsPanel = (
    <IftaPanel title="Mileage by jurisdiction" className="ifta-area-bars">
      {shares.length ? <IftaMileageBars shares={shares} /> : <p className="ifta-empty-line">No miles recorded yet.</p>}
    </IftaPanel>
  );

  const donutPanel = (
    <IftaPanel title="Fuel purchases" className="ifta-area-donut">
      {fuel.length ? (
        <div className="ifta-donutwrap">
          <IftaFuelDonut shares={fuel} total={formatNumber(totals.gallons)} />
          <IftaShareLegend shares={fuel.map((s) => ({ ...s, name: s.code === 'OTHER' ? 'Other' : s.code }))} />
        </div>
      ) : (
        <p className="ifta-empty-line">No fuel receipts counted yet.</p>
      )}
    </IftaPanel>
  );

  const overview = (
    <div className="ifta-grid ifta-grid--case">
      <IftaPanel title="Filing workflow" className="ifta-area-workflow">
        <IftaPhaseStepper phases={filingPhases(quarter, now, 'STAFF')} showDetails />
      </IftaPanel>
      <IftaPanel title="Quarter tasks" className="ifta-area-tasks">
        <IftaTaskList tasks={staffTasks(quarter, now)} empty="No open tasks on this case." />
      </IftaPanel>
      <IftaPanel title="Important dates" className="ifta-area-dates">
        <ul className="ifta-dates">
          {importantDates(quarter).map((d) => (
            <li key={d.label}>
              <span className="ifta-dates__icon" aria-hidden="true">
                <IftaIcon name={d.icon} size={18} />
              </span>
              <span className="ifta-dates__text">
                <span className="ifta-dates__label">{d.label}</span>
                <span className="ifta-dates__value">{d.value}</span>
              </span>
            </li>
          ))}
        </ul>
      </IftaPanel>
      {barsPanel}
      {donutPanel}
      {vehiclesPanel}
      <IftaPanel title="Recent client activity" className="ifta-area-clientact">
        <IftaActivity events={clientActivity} />
      </IftaPanel>
      <IftaPanel title="AIO team activity" className="ifta-area-teamact">
        <IftaActivity events={teamActivity} />
      </IftaPanel>
      <IftaPanel title="Risks / flags" className="ifta-area-flags">
        <IftaFlags flags={riskFlags(quarter, now)} />
      </IftaPanel>
      <div className="ifta-area-faqs">
        <RunFaqsPanel compact />
      </div>
      <IftaPanel title="Audit trail" className="ifta-area-audit">
        <IftaActivity events={recentActivity(quarter, 8)} showActor />
      </IftaPanel>
    </div>
  );

  const body: Record<StaffTab, JSX.Element> = {
    OVERVIEW: overview,
    FUEL: (
      <div className="ifta-grid ifta-grid--split">
        <div className="ifta-area-side">{donutPanel}</div>
        <IftaPanel title={`Receipts · ${quarter.receipts.length}`} className="ifta-area-main">
          <ul className="ifta-rows">
            {quarter.receipts.map((r) => (
              <li key={r.id} className="ifta-row">
                <span className="ifta-row__main">
                  <span className="ifta-row__title">{r.vendor ?? '—'}</span>
                  <span className="ifta-row__meta">
                    {[r.location, r.purchaseDate ? formatShortDate(r.purchaseDate) : null, quarter.vehicles.find((v) => v.id === r.vehicleId)?.unit, r.flag?.reason].filter(Boolean).join(' · ')}
                  </span>
                </span>
                <span className="ifta-row__state">{r.jurisdiction}</span>
                <span className="ifta-row__num">{r.gallons !== null ? `${formatNumber(r.gallons, 1)} gal` : '—'}</span>
                <IftaChip label={RECEIPT_CLASS_COPY[r.receiptClass].staff} tone={RECEIPT_TONE[r.receiptClass]} />
              </li>
            ))}
          </ul>
        </IftaPanel>
      </div>
    ),
    MILEAGE: <div className="ifta-grid ifta-grid--split"><div className="ifta-area-main">{barsPanel}</div><div className="ifta-area-side">{vehiclesPanel}</div></div>,
    VEHICLES: <div className="ifta-grid ifta-grid--single">{vehiclesPanel}</div>,
    JURISDICTIONS: (
      <div className="ifta-grid ifta-grid--split">
        <IftaPanel title="Jurisdiction breakdown" className="ifta-area-main">
          {shares.length ? (
            <div className="ifta-mapwrap">
              <IftaUsMap intensity={mileageIntensity(quarter)} label={`Miles by state, ${quarterLabel(quarter)}`} />
              <IftaShareLegend shares={shares} />
            </div>
          ) : (
            <p className="ifta-empty-line">No miles recorded yet.</p>
          )}
        </IftaPanel>
        <IftaPanel title="Return summary" className="ifta-area-side">
          {quarter.returnSummary ? (
            <ul className="ifta-rows">
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
            </ul>
          ) : (
            <p className="ifta-pending">Tax due / credit — pending AIO preparation (staff worksheet)</p>
          )}
        </IftaPanel>
      </div>
    ),
    DOCUMENTS: (
      <div className="ifta-grid ifta-grid--single">
        <IftaPanel title="Vault packet">
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
            <p className="ifta-empty-line">No sealed packet yet — the Vault packet is sealed when the filing is recorded.</p>
          )}
        </IftaPanel>
      </div>
    ),
    NOTES: (
      <div className="ifta-grid ifta-grid--single">
        <IftaPanel title="Staff notes · not visible to client" className="ifta-notes">
          <p className="ifta-notes__by">Jordan Lee · {formatShortDate(now.toISOString())}</p>
          <p>Reefer-lane receipt on Truck 02 — waiting on client confirmation. Unreadable GA photo needs retake.</p>
        </IftaPanel>
      </div>
    ),
  };

  return (
    <>
      <IftaFilingRoomHero
        eyebrow="IFTA filing room"
        title={quarterLabel(quarter)}
        period={`${formatShortDate(quarter.periodStart)} – ${formatShortDate(quarter.periodEnd)}, ${quarter.year}`}
        crumbs={
          <Link to={aioPaths.officeWorkspaceIfta} className="ifta-crumb">
            <IftaIcon name="arrow" size={14} className="ifta-crumb__back" />
            Fuel tax queue
          </Link>
        }
        lines={
          <p className="ifta-hero__client">
            Client: {client}
            <br />
            IFTA account {quarter.iftaAccount} · {quarter.baseJurisdictionName} base
          </p>
        }
        status={
          <>
            <IftaStatusPill label={health.bucketLabel} tone={BUCKET_TONE[health.bucket] === 'muted' ? 'success' : BUCKET_TONE[health.bucket]} />
            <span className="ifta-hero__due">
              Due {formatShortDate(quarter.dueDate)} · {days} day{days === 1 ? '' : 's'}
            </span>
          </>
        }
        aside={
          <div className="ifta-health" aria-label="Client health">
            <p className="ifta-health__title">
              Client health
              <span className={`ifta-health__chip ifta-health__chip--${BUCKET_TONE[health.bucket]}`}>{health.bucketLabel}</span>
            </p>
            <ul>
              <li>
                <span>
                  <IftaIcon name="done" size={16} /> Data completeness
                </span>
                <strong>{health.packet}%</strong>
              </li>
              <li>
                <span>
                  <IftaIcon name="done" size={16} /> Fuel receipts
                </span>
                <strong>{health.receipts}</strong>
              </li>
              <li>
                <span>
                  <IftaIcon name="done" size={16} /> Mileage (trucks)
                </span>
                <strong>{health.mileage}</strong>
              </li>
              <li>
                <span>
                  <IftaIcon name="done" size={16} /> Return readiness
                </span>
                <strong className="ifta-health__accent">{health.readiness}</strong>
              </li>
            </ul>
          </div>
        }
      />
      <div className="ifta-frame ifta-frame--lift">
        <IftaMetricsRail
          cells={[
            { icon: 'miles', value: formatNumber(metrics.miles), label: 'Total miles' },
            { icon: 'fuel', value: formatNumber(metrics.gallons), label: 'Total fuel (gal)' },
            { icon: 'pin', value: String(metrics.jurisdictions), label: 'Jurisdictions' },
            { icon: 'coins', value: metrics.tax.value, label: metrics.tax.label, note: metrics.tax.kind === 'PENDING' ? metrics.tax.note : undefined, pending: metrics.tax.kind === 'PENDING' },
          ]}
        />
      </div>

      <div className="ifta-frame">
        <div className="ifta-tabrow">
          <div className="ifta-tabbar" role="tablist" aria-label="Staff case sections">
            {STAFF_TABS.map((t) => (
              <button key={t} type="button" role="tab" aria-selected={tab === t} className={`ifta-tab${tab === t ? ' ifta-tab--active' : ''}${t === 'NOTES' ? ' ifta-tab--secondary' : ''}`} onClick={() => setTab(t)}>
                {t}
              </button>
            ))}
          </div>
          <Link to={aioPaths.portalWorkspaceIftaQuarter(quarterKey)} className="ifta-btn ifta-btn--outline">
            <IftaIcon name="user" size={16} />
            Open client filing room
          </Link>
        </div>

        <div className="ifta-mirror" aria-label="Client staff mirror">
          <div className="ifta-mirror__side ifta-mirror__side--client">
            <span className="ifta-mirror__label">
              <IftaIcon name="user" size={15} /> Client sees
            </span>
            <span className="ifta-mirror__line">{clientStatusLine(quarter, now)}</span>
          </div>
          <div className="ifta-mirror__side ifta-mirror__side--staff">
            <span className="ifta-mirror__label">
              <IftaIcon name="shield" size={15} /> AIO sees
            </span>
            <span className="ifta-mirror__line">{staffStatusLine(quarter, now)}</span>
          </div>
        </div>

        <div role="tabpanel" aria-label={tab}>
          {body[tab]}
        </div>

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

        <IftaCtaRail eyebrow={staffStatusLine(quarter, now)} label={staffCta} icon="draft" actionLabel={staffCta} />
      </div>
    </>
  );
}
