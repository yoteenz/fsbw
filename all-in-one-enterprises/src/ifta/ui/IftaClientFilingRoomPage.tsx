import { useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useDemoStore } from '../../demo/useDemoStore';
import { resolvePortalContext } from '../../portal/organizationContext';
import { aioPaths } from '../../utils/paths';
import {
  MILEAGE_QUALITY_COPY,
  RECEIPT_CLASS_COPY,
  aioDoingLine,
  blockingItems,
  clientOpenItems,
  effectiveState,
  fleetReadiness,
  formatMoney,
  formatNumber,
  jurisdictionName,
  receiptTotals,
  taxPositionLabel,
  templateVars,
  type IftaCompartment,
} from '../iftaDerive';
import { daysUntil, formatShortDate, quarterKey, quarterLabel } from '../iftaDates';
import { experienceState, primaryCta, stateLabel } from '../experience/iftaExperience';
import { defaultQuarterKeyForOrg, findOrgQuarter, orgHasIftaWorkspace, quartersForOrg } from '../iftaRouteHelpers';
import type { IftaQuarterCase, IftaReceiptClass } from '../iftaTypes';
import { IftaIcon } from './IftaIcon';
import { IFTA_PLATES } from './iftaAssetManifest';
import {
  IftaActivity,
  IftaBars,
  IftaCard,
  IftaChip,
  IftaCtaRail,
  IftaDonut,
  IftaFooter,
  IftaHero,
  IftaInsights,
  IftaLegend,
  IftaQuickActions,
  IftaRail,
  IftaRows,
  IftaStatePill,
  IftaStageTasks,
  IftaTabs,
  IftaUploads,
  IftaUsMap,
  IftaVehicles,
  IftaWorkflow,
  type IftaVehicleRow,
} from './IftaModules';
import { useIftaShellData, type IftaShellItem } from './IftaWorkspaceShell';
import { useIftaBand, type IftaBand } from './iftaScale';
import {
  activityRows,
  checklistRows,
  filingPhases,
  formatMediumDate,
  fuelShares,
  mileageShares,
  quarterMetrics,
  stageTaskRows,
  uploadTableRows,
  type IftaClientTab,
} from './iftaViewModel';

const TABS: IftaClientTab[] = ['PROGRESS', 'FUEL PURCHASES', 'MILEAGE', 'VEHICLES', 'JURISDICTIONS', 'DOCUMENTS'];

const COMPARTMENT_TAB: Record<IftaCompartment, IftaClientTab> = {
  receipts: 'FUEL PURCHASES',
  mileage: 'MILEAGE',
  vehicles: 'VEHICLES',
  approval: 'JURISDICTIONS',
};

const RECEIPT_TONE: Record<IftaReceiptClass, 'success' | 'warn' | 'progress' | 'alert' | 'muted'> = {
  READY: 'success',
  UNDER_AIO_REVIEW: 'progress',
  NEEDS_YOU: 'warn',
  UNREADABLE: 'alert',
  POSSIBLE_MISSING: 'warn',
  DUPLICATE: 'muted',
};

const QUALITY_TONE = { VERIFIED: 'green', AIO_CHECKING: 'amber', AIO_BUILDING: 'amber', ESTIMATE: 'amber', MISSING: 'red', NOT_OPERATED: 'grey' } as const;

/** CLIENT OFFICE · IFTA FILING ROOM — the approved client screens (parent mobile + tablet / desktop authority). */
export function IftaClientFilingRoomPage() {
  const { quarterKey: quarterParam } = useParams<{ quarterKey?: string }>();
  const store = useDemoStore();
  const ctx = resolvePortalContext(store);
  const [tab, setTab] = useState<IftaClientTab>('PROGRESS');
  const tabsRef = useRef<HTMLDivElement>(null);
  const band = useIftaBand();
  const navigate = useNavigate();
  const now = new Date();

  if (!orgHasIftaWorkspace(store, ctx.organizationId)) return null;
  const defaultKey = defaultQuarterKeyForOrg(store, ctx.organizationId, now);
  if (!quarterParam && defaultKey) return <Navigate to={aioPaths.portalWorkspaceIftaQuarter(defaultKey)} replace />;

  const quarter = quarterParam ? findOrgQuarter(store, ctx.organizationId, quarterParam) : undefined;
  if (!quarter) {
    return (
      <div className="ifta-frame">
        <div className="ifta-notice ifta-notice--block">
          <strong>Quarter not found</strong>
          <p>Select a valid quarter for {ctx.companyName}.</p>
        </div>
      </div>
    );
  }

  const go = (t: IftaClientTab) => {
    setTab(t);
    tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const quarters = quartersForOrg(store, ctx.organizationId);
  return (
    <FilingRoom
      quarter={quarter}
      quarters={quarters}
      onQuarter={(key) => navigate(aioPaths.portalWorkspaceIftaQuarter(key))}
      now={now}
      tab={tab}
      go={go}
      setTab={setTab}
      tabsRef={tabsRef}
      band={band}
    />
  );
}

function FilingRoom({
  quarter,
  quarters,
  onQuarter,
  now,
  tab,
  go,
  setTab,
  tabsRef,
  band,
}: {
  quarter: IftaQuarterCase;
  quarters: IftaQuarterCase[];
  onQuarter: (key: string) => void;
  now: Date;
  tab: IftaClientTab;
  go: (t: IftaClientTab) => void;
  setTab: (t: IftaClientTab) => void;
  tabsRef: React.RefObject<HTMLDivElement>;
  band: IftaBand;
}) {
  const state = effectiveState(quarter, now);
  const metrics = quarterMetrics(quarter);
  const vars = templateVars(quarter, now);
  const openItems = clientOpenItems(quarter, now);
  const blocking = blockingItems(quarter, now);
  const days = Math.max(0, daysUntil(quarter.dueDate, now));
  const stateClass = experienceState(state).state_class;
  const desktop = band === 'desktop';

  // Bottom rail: the next thing that needs the client, else the contract's primary client action.
  const first = blocking[0] ?? openItems[0];
  const ctaTab: IftaClientTab = first ? COMPARTMENT_TAB[first.compartment] : quarter.vault ? 'DOCUMENTS' : 'PROGRESS';
  const ctaRaw = primaryCta(state, 'CLIENT', vars);
  const ctaLabel = blocking.length ? `Resolve ${blocking.length} item${blocking.length === 1 ? '' : 's'} · ${ctaTab}` : ctaRaw.replace(/\{[^}]+\}/g, '').trim() || `Open ${ctaTab}`;

  const shares = mileageShares(quarter);
  const fuel = fuelShares(quarter);
  const totals = receiptTotals(quarter);
  const fleet = fleetReadiness(quarter);
  const vehicles: IftaVehicleRow[] = fleet.map((v) => ({
    id: v.vehicle.id,
    unit: v.vehicle.unit,
    detail: `${formatNumber(v.miles)} miles  |  ${formatNumber(v.gallons, 0)} gal`,
    tone: QUALITY_TONE[v.quality],
    status: MILEAGE_QUALITY_COPY[v.quality].badge,
  }));

  const search: IftaShellItem[] = [
    ...openItems.map((i) => ({ id: i.id, label: i.title, detail: `Needs you · ${COMPARTMENT_TAB[i.compartment]}`, onSelect: () => go(COMPARTMENT_TAB[i.compartment]) })),
    ...quarter.receipts.filter((r) => r.vendor).map((r) => ({ id: r.id, label: `${r.vendor} · ${r.jurisdiction}`, detail: `Fuel receipt${r.purchaseDate ? ` · ${formatShortDate(r.purchaseDate)}` : ''}`, onSelect: () => go('FUEL PURCHASES') })),
    ...quarter.mileage.filter((m) => m.fileLabel).map((m) => ({ id: m.id, label: m.fileLabel!, detail: 'Mileage file', onSelect: () => go('MILEAGE') })),
    ...quarter.vehicles.map((v) => ({ id: v.id, label: v.unit, detail: v.description, onSelect: () => go('VEHICLES') })),
  ];
  useIftaShellData({
    search,
    notices: openItems.map((i) => ({ id: i.id, label: i.title, detail: i.action, tone: i.blocking ? 'warn' : 'info', onSelect: () => go(COMPARTMENT_TAB[i.compartment]) })),
  });

  const workflow = (
    <IftaCard title={desktop ? 'Filing progress workflow' : 'Filing progress'} className="ifta-a-workflow" action={desktop ? { onClick: () => go('PROGRESS') } : null}>
      <IftaWorkflow phases={filingPhases(quarter, now, 'CLIENT')} dates={desktop} />
    </IftaCard>
  );
  const mapCard = (
    <IftaCard title="Jurisdiction breakdown" className="ifta-a-map" action={{ onClick: () => go('JURISDICTIONS') }}>
      {shares.length ? (
        <div className="ifta-mapwrap">
          <IftaUsMap shares={shares} label={`Miles by state, ${quarterLabel(quarter)}`} />
          <IftaLegend shares={shares} />
        </div>
      ) : (
        <p className="ifta-empty">No miles recorded yet — the map fills as mileage arrives.</p>
      )}
    </IftaCard>
  );
  const uploadsCard = (
    <IftaCard title="Recent uploads" className="ifta-a-uploads" action={{ onClick: () => go('DOCUMENTS') }}>
      <IftaUploads rows={uploadTableRows(quarter, 3)} table={desktop} />
    </IftaCard>
  );
  const activityCard = (
    <IftaCard title="Recent activity" className="ifta-a-activity" action={{ onClick: () => go('DOCUMENTS') }}>
      <IftaActivity rows={activityRows(quarter, desktop ? 5 : 3)} table={desktop} />
    </IftaCard>
  );
  const insights = (
    <div className="ifta-a-insights">
      <IftaInsights lines={[aioDoingLine(quarter, now, 'Jordan Lee')]} media={desktop ? IFTA_PLATES.clientInsights : undefined} />
    </div>
  );

  const progress = desktop ? (
    <div className="ifta-grid ifta-grid--client-desktop">
      {workflow}
      <IftaCard title="Quarter tasks" className="ifta-a-tasks" action={{ onClick: () => go(ctaTab) }}>
        <IftaStageTasks rows={stageTaskRows(quarter, now)} onSelect={(r) => go(r.tab)} />
      </IftaCard>
      <IftaCard title="Mileage by jurisdiction" className="ifta-a-bars" action={{ onClick: () => go('MILEAGE') }}>
        {shares.length ? (
          <div className="ifta-barswrap">
            <IftaBars shares={shares} />
            <IftaLegend shares={shares} value="value" />
          </div>
        ) : (
          <p className="ifta-empty">No miles recorded yet.</p>
        )}
      </IftaCard>
      {mapCard}
      <IftaCard title="Fuel purchases" className="ifta-a-donut">
        {fuel.length ? (
          <div className="ifta-donutwrap">
            <IftaDonut shares={fuel} total={formatNumber(totals.gallons)} />
            <IftaLegend shares={fuel} show="code" />
          </div>
        ) : (
          <p className="ifta-empty">No fuel receipts counted yet.</p>
        )}
      </IftaCard>
      <IftaCard title="Vehicle & trip data" className="ifta-a-vehicles" icon={<IftaIcon name="truck" strokeWidth={2} />} action={{ onClick: () => go('VEHICLES') }}>
        <IftaVehicles rows={vehicles} variant="client" />
      </IftaCard>
      {uploadsCard}
      {activityCard}
      {insights}
    </div>
  ) : (
    <div className={`ifta-grid ifta-grid--client-${band}`}>
      {workflow}
      <IftaCard title="Quick actions" className="ifta-a-quick ifta-card--list">
        <IftaQuickActions rows={checklistRows(quarter, now)} onSelect={(r) => go(r.tab)} />
      </IftaCard>
      {mapCard}
      {uploadsCard}
      {insights}
      {activityCard}
    </div>
  );

  const fuelTab = (
    <div className="ifta-grid ifta-grid--split">
      <IftaCard title="Fuel by state" className="ifta-a-side">
        {fuel.length ? (
          <div className="ifta-donutwrap ifta-donutwrap--stack">
            <IftaDonut shares={fuel} total={formatNumber(totals.gallons)} />
            <IftaLegend shares={fuel} />
          </div>
        ) : (
          <p className="ifta-empty">No fuel receipts counted yet.</p>
        )}
        <p className="ifta-footnote">
          {totals.count} counted receipt{totals.count === 1 ? '' : 's'} · {formatMoney(totals.amount)}
        </p>
      </IftaCard>
      <IftaCard title={`Fuel purchases · ${quarter.receipts.length} records`} className="ifta-a-main">
        <IftaRows>
          {quarter.receipts.map((r) => (
            <li key={r.id} className="ifta-row">
              <span className="ifta-row__main">
                <span className="ifta-row__title">{r.vendor ?? (r.receiptClass === 'POSSIBLE_MISSING' ? `No ${jurisdictionName(r.jurisdiction)} receipt` : 'Receipt photo')}</span>
                <span className="ifta-row__meta">{[r.location, r.purchaseDate ? formatShortDate(r.purchaseDate) : null, quarter.vehicles.find((v) => v.id === r.vehicleId)?.unit].filter(Boolean).join(' · ')}</span>
              </span>
              <span className="ifta-row__state">{r.jurisdiction}</span>
              <span className="ifta-row__num">{r.gallons !== null ? `${formatNumber(r.gallons, 1)} gal` : '—'}</span>
              <IftaChip label={RECEIPT_CLASS_COPY[r.receiptClass].client} tone={RECEIPT_TONE[r.receiptClass]} />
            </li>
          ))}
        </IftaRows>
      </IftaCard>
    </div>
  );

  const mileageTab = (
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
      <IftaCard title="Miles by truck" className="ifta-a-side">
        <IftaRows>
          {fleet.map((v) => (
            <li key={v.vehicle.id} className="ifta-row">
              <span className="ifta-row__main">
                <span className="ifta-row__title">{v.vehicle.unit}</span>
                <span className="ifta-row__meta">{MILEAGE_QUALITY_COPY[v.quality].client}</span>
              </span>
              <span className="ifta-row__num">{formatNumber(v.miles)} mi</span>
              <IftaChip label={MILEAGE_QUALITY_COPY[v.quality].badge} tone={QUALITY_TONE[v.quality]} />
            </li>
          ))}
        </IftaRows>
      </IftaCard>
    </div>
  );

  const vehiclesTab = (
    <div className="ifta-grid ifta-grid--single">
      <IftaCard title={`Vehicles · ${quarter.vehicles.length}`}>
        <IftaRows>
          {fleet.map((v) => (
            <li key={v.vehicle.id} className="ifta-row">
              <span className="ifta-row__main">
                <span className="ifta-row__title">
                  {v.vehicle.unit} — {v.vehicle.description}
                </span>
                <span className="ifta-row__meta">
                  {v.vehicle.operated === false ? 'Not operated' : v.vehicle.operated ? 'Operated' : 'Not confirmed'} · {formatNumber(v.miles)} mi · {formatNumber(v.gallons, 0)} gal
                  {v.mpg !== null ? ` · ${v.mpg} mpg` : ''}
                </span>
              </span>
              <IftaChip label={MILEAGE_QUALITY_COPY[v.quality].badge} tone={QUALITY_TONE[v.quality]} />
            </li>
          ))}
        </IftaRows>
      </IftaCard>
    </div>
  );

  const jurisdictionsTab = (
    <div className="ifta-grid ifta-grid--split">
      <div className="ifta-a-main">{mapCard}</div>
      <IftaCard title="Return summary · read-only" className="ifta-a-side">
        {quarter.returnSummary ? (
          <IftaRows>
            {quarter.returnSummary.lines.map((l) => {
              const pos = taxPositionLabel(l.netTax);
              return (
                <li key={l.jurisdiction} className="ifta-row">
                  <span className="ifta-row__main">
                    <span className="ifta-row__title">{jurisdictionName(l.jurisdiction)}</span>
                    <span className="ifta-row__meta">
                      {formatNumber(l.miles)} mi · {formatNumber(l.taxPaidGallons, 1)} gal tax-paid
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
          <p className="ifta-pending">Tax due / credit — pending AIO preparation</p>
        )}
      </IftaCard>
    </div>
  );

  const documentsTab = (
    <div className="ifta-grid ifta-grid--split">
      <IftaCard title="Filed packet" className="ifta-a-main">
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
          <p className="ifta-empty">No filed packet yet — upload receipts and send the quarter to AIO when ready.</p>
        )}
      </IftaCard>
      <div className="ifta-a-side">
        <IftaCard title="Recent uploads">
          <IftaUploads rows={uploadTableRows(quarter, 12)} table={false} />
        </IftaCard>
        <IftaCard title="Recent activity">
          <IftaActivity rows={activityRows(quarter, 8)} table={false} />
        </IftaCard>
      </div>
    </div>
  );

  const body: Record<IftaClientTab, JSX.Element> = {
    PROGRESS: progress,
    'FUEL PURCHASES': fuelTab,
    MILEAGE: mileageTab,
    VEHICLES: vehiclesTab,
    JURISDICTIONS: jurisdictionsTab,
    DOCUMENTS: documentsTab,
  };

  const cta = <IftaCtaRail eyebrow="Go to" label={ctaLabel} icon={first ? 'clipboard' : 'doc'} onClick={() => go(ctaTab)} />;
  const footerWords = desktop ? ['Operations', 'Compliance', 'Client success'] : ['Data', 'Compliance', 'Real progress'];

  return (
    <div className={`ifta-page ifta-page--client is-${band}`}>
      <IftaHero
        actor="client"
        plates={IFTA_PLATES.client}
        label={`IFTA filing room ${quarterLabel(quarter)}`}
        eyebrow="IFTA filing room"
        title={quarterLabel(quarter)}
        period={`${formatShortDate(quarter.periodStart)} – ${formatShortDate(quarter.periodEnd)}, ${quarter.year}`}
        lines={
          <p>
            Real data. Real progress.
            <br />
            Every mile accounted for.
          </p>
        }
        pill={<IftaStatePill label={stateLabel(state, vars)} tone={stateClass === 'COMPLETE' || stateClass === 'ARCHIVED' ? 'green' : 'gold'} />}
        aside={
          desktop ? (
            <div className="ifta-qcard">
              <p>Due: {formatMediumDate(quarter.dueDate)}</p>
              <p>
                {days} day{days === 1 ? '' : 's'} · {quarter.baseJurisdiction} base
              </p>
              <button type="button" className="ifta-qcard__btn" onClick={() => go(ctaTab)}>
                Next step
                <IftaIcon name="arrow" size={16} strokeWidth={2.2} />
              </button>
            </div>
          ) : null
        }
        rail={
          <IftaRail
            cells={[
              { glyph: 'metric-miles', value: formatNumber(metrics.miles), label: 'Total miles' },
              { glyph: 'metric-fuel', value: formatNumber(metrics.gallons), label: 'Total fuel (gal)' },
              { glyph: 'metric-pin', value: String(metrics.jurisdictions), label: 'Jurisdictions' },
              { glyph: 'metric-coins', value: metrics.tax.value, label: metrics.tax.kind === 'PENDING' ? 'Tax due / credit' : metrics.tax.label, muted: metrics.tax.kind === 'PENDING' },
            ]}
          />
        }
      />

      <div className="ifta-frame">
        <IftaTabs
          tabs={TABS}
          current={tab}
          onSelect={setTab}
          label="Filing room sections"
          tabsRef={tabsRef}
          right={
            desktop ? (
              <label className="ifta-quarter">
                <IftaIcon name="calendar" size={18} strokeWidth={2} className="ifta-quarter__icon" />
                <select aria-label="Quarter" value={quarterKey(quarter)} onChange={(e) => onQuarter(e.target.value)}>
                  {quarters.map((q) => (
                    <option key={q.id} value={quarterKey(q)}>
                      {quarterLabel(q)}
                    </option>
                  ))}
                </select>
                <svg className="ifta-quarter__chev" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="m3.5 6 4.5 4.5L12.5 6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </label>
            ) : null
          }
        />

        <div role="tabpanel" aria-label={tab}>
          {body[tab]}
        </div>

        {desktop ? (
          <div className="ifta-ctarow">
            {cta}
            <IftaFooter tagline={footerWords} variant="inline" />
          </div>
        ) : (
          <>
            {cta}
            <IftaFooter tagline={footerWords} />
          </>
        )}
      </div>
    </div>
  );
}
