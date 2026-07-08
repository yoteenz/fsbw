import { useState, type ReactNode } from 'react';
import type { CostLabel } from '../../../../studio-os-core/studio-alpha-cost';
import type { StudioAlphaCostSnapshot } from '../../../../studio-os-core/studio-alpha-cost';
import { STUDIO_ALPHA_COST_HUD_STYLES } from './studioAlphaCostHudTheme';

type Props = {
  snapshot: StudioAlphaCostSnapshot;
};

function CostValue({ label }: { label: CostLabel }) {
  const cls =
    label.certainty === 'actual'
      ? 'is-actual'
      : label.certainty === 'unknown'
        ? 'is-unknown'
        : 'is-est';
  return <span className={`studio-alpha-cost-hud__value ${cls}`}>{label.display}</span>;
}

function Row({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div className="studio-alpha-cost-hud__row">
      <span className="studio-alpha-cost-hud__label">{k}</span>
      <span className="studio-alpha-cost-hud__value">{v}</span>
    </div>
  );
}

function statusClass(status: string): string {
  if (status === 'generating' || status === 'queued') return 'is-generating';
  if (status === 'complete' || status === 'reused') return 'is-complete';
  if (status === 'failed') return 'is-failed';
  return '';
}

/**
 * Persistent Studio Alpha™ internal production HUD — right-side collapsible glass drawer.
 * Mount inside immersive department rooms only (CDS, Warehouse, Scene Stack views).
 */
export function StudioAlphaCostHud({ snapshot }: Props) {
  const [open, setOpen] = useState(false);
  const gen = snapshot.currentGeneration;
  const scene = snapshot.currentScene;
  const dept = snapshot.currentDepartment;
  const totals = snapshot.studioAlphaTotals;
  const budget = snapshot.creativeBudget;
  const portfolio = snapshot.creativePortfolio;

  return (
    <>
      <style>{STUDIO_ALPHA_COST_HUD_STYLES}</style>
      <aside
        className={`studio-alpha-cost-hud${open ? ' is-open' : ''}`}
        aria-label="Studio Alpha Production Cost"
      >
        <button
          type="button"
          className="studio-alpha-cost-hud__tab"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          title="Studio Alpha™ Production Cost HUD"
        >
          Production Cost
        </button>

        <div className="studio-alpha-cost-hud__drawer" role="region" aria-hidden={!open}>
          <p className="studio-alpha-cost-hud__title">Studio Alpha™ · Production HUD</p>
          <p className="studio-alpha-cost-hud__subtitle">Internal · Not customer-facing</p>

          <section className="studio-alpha-cost-hud__section">
            <p className="studio-alpha-cost-hud__subtitle">Current Generation</p>
            <Row k="Provider" v={gen.provider} />
            <Row k="Model" v={gen.model.split('/').pop() ?? gen.model} />
            <Row k="Quality" v={gen.quality} />
            <Row k="Asset Type" v={gen.assetType} />
            <div className="studio-alpha-cost-hud__row">
              <span className="studio-alpha-cost-hud__label">Estimated Cost</span>
              <CostValue label={gen.estimatedCost} />
            </div>
            {gen.actualCost ? (
              <div className="studio-alpha-cost-hud__row">
                <span className="studio-alpha-cost-hud__label">Actual Cost</span>
                <CostValue label={gen.actualCost} />
              </div>
            ) : (
              <Row k="Actual Cost" v="—" />
            )}
            <Row
              k="Est. Time"
              v={gen.estimatedTimeSec != null ? `${gen.estimatedTimeSec} sec` : '—'}
            />
            <Row
              k="Status"
              v={
                <span className={`studio-alpha-cost-hud__status ${statusClass(gen.status)}`}>
                  {gen.status}
                </span>
              }
            />
          </section>

          <section className="studio-alpha-cost-hud__section">
            <p className="studio-alpha-cost-hud__subtitle">Current Scene</p>
            <Row k="Scene" v={scene.sceneName} />
            <Row k="Layers" v={`${scene.layersComplete} / ${scene.layersTotal} complete`} />
            <div className="studio-alpha-cost-hud__row">
              <span className="studio-alpha-cost-hud__label">Scene Cost So Far</span>
              <CostValue label={scene.sceneCostSoFar} />
            </div>
            <div className="studio-alpha-cost-hud__row">
              <span className="studio-alpha-cost-hud__label">Est. Remaining</span>
              <CostValue label={scene.estimatedRemaining} />
            </div>
            <div className="studio-alpha-cost-hud__row">
              <span className="studio-alpha-cost-hud__label">Est. Final Scene</span>
              <CostValue label={scene.estimatedFinalSceneCost} />
            </div>
            <Row k="Assets Generated" v={scene.assetsGenerated} />
            <Row k="Assets Reused" v={scene.assetsReused} />
            <div className="studio-alpha-cost-hud__row">
              <span className="studio-alpha-cost-hud__label">Reuse Savings</span>
              <CostValue label={scene.savingsFromReuse} />
            </div>
          </section>

          <section className="studio-alpha-cost-hud__section">
            <p className="studio-alpha-cost-hud__subtitle">Current Department</p>
            <Row k="Department" v={dept.departmentName} />
            <Row k="Scenes" v={`${dept.scenesComplete} / ${dept.scenesTotal}`} />
            <div className="studio-alpha-cost-hud__row">
              <span className="studio-alpha-cost-hud__label">Dept Cost So Far</span>
              <CostValue label={dept.departmentCostSoFar} />
            </div>
            <div className="studio-alpha-cost-hud__row">
              <span className="studio-alpha-cost-hud__label">Est. Remaining</span>
              <CostValue label={dept.estimatedRemaining} />
            </div>
            <div className="studio-alpha-cost-hud__row">
              <span className="studio-alpha-cost-hud__label">Est. Final Dept</span>
              <CostValue label={dept.estimatedFinalDepartmentCost} />
            </div>
            <Row k="Highest Cost Layer" v={dept.highestCostLayer ?? '—'} />
          </section>

          <section className="studio-alpha-cost-hud__section">
            <p className="studio-alpha-cost-hud__subtitle">Studio Alpha Totals</p>
            <div className="studio-alpha-cost-hud__row">
              <span className="studio-alpha-cost-hud__label">Total Spend</span>
              <CostValue label={totals.totalInternalSpend} />
            </div>
            <div className="studio-alpha-cost-hud__row">
              <span className="studio-alpha-cost-hud__label">This Month</span>
              <CostValue label={totals.thisMonth} />
            </div>
            <div className="studio-alpha-cost-hud__row">
              <span className="studio-alpha-cost-hud__label">Today</span>
              <CostValue label={totals.today} />
            </div>
            <Row k="Assets Generated" v={totals.totalAssetsGenerated} />
            <Row k="Assets Reused" v={totals.totalAssetsReused} />
            <div className="studio-alpha-cost-hud__row">
              <span className="studio-alpha-cost-hud__label">Reuse Savings</span>
              <CostValue label={totals.estimatedSavingsFromReuse} />
            </div>
            <div className="studio-alpha-cost-hud__row">
              <span className="studio-alpha-cost-hud__label">Avg / Asset</span>
              <CostValue label={totals.averageCostPerAsset} />
            </div>
            <div className="studio-alpha-cost-hud__row">
              <span className="studio-alpha-cost-hud__label">Avg / Scene</span>
              <CostValue label={totals.averageCostPerScene} />
            </div>
            <div className="studio-alpha-cost-hud__row">
              <span className="studio-alpha-cost-hud__label">Avg / Dept</span>
              <CostValue label={totals.averageCostPerDepartment} />
            </div>
          </section>

          <section className="studio-alpha-cost-hud__section">
            <p className="studio-alpha-cost-hud__subtitle">Creative Budget™</p>
            <div className="studio-alpha-cost-hud__row">
              <span className="studio-alpha-cost-hud__label">Monthly Budget</span>
              <CostValue label={budget.monthlyBudget} />
            </div>
            <div className="studio-alpha-cost-hud__row">
              <span className="studio-alpha-cost-hud__label">Spent</span>
              <CostValue label={budget.spent} />
            </div>
            <div className="studio-alpha-cost-hud__row">
              <span className="studio-alpha-cost-hud__label">Pending</span>
              <CostValue label={budget.pendingEstimate} />
            </div>
            <div className="studio-alpha-cost-hud__row">
              <span className="studio-alpha-cost-hud__label">Remaining</span>
              <CostValue label={budget.remaining} />
            </div>
            <div className="studio-alpha-cost-hud__row">
              <span className="studio-alpha-cost-hud__label">Projected Month-End</span>
              <CostValue label={budget.projectedMonthEndSpend} />
            </div>
            <Row
              k="Budget Risk"
              v={
                <span className={`studio-alpha-cost-hud__risk-${budget.budgetRisk}`}>
                  {budget.budgetRisk}
                </span>
              }
            />
            <div className="studio-alpha-cost-hud__row">
              <span className="studio-alpha-cost-hud__label">Registry Reuse Saved</span>
              <CostValue label={budget.savingsFromRegistryReuse} />
            </div>
            <div className="studio-alpha-cost-hud__row">
              <span className="studio-alpha-cost-hud__label">Blueprint Reuse Saved</span>
              <CostValue label={budget.savingsFromBlueprintReuse} />
            </div>
            <Row k="Efficiency Score" v={`${budget.efficiencyScore}%`} />
          </section>

          <section className="studio-alpha-cost-hud__section">
            <p className="studio-alpha-cost-hud__subtitle">Creative Portfolio™</p>
            <Row k="Equity Score" v={`${portfolio.creativeEquityScore} / 100`} />
            <div className="studio-alpha-cost-hud__row">
              <span className="studio-alpha-cost-hud__label">Portfolio Value</span>
              <CostValue label={portfolio.estimatedPortfolioValue} />
            </div>
            <Row k="Reusable Assets" v={portfolio.reusableAssets} />
            <Row k="Blueprint Systems" v={portfolio.blueprintSystems} />
            <Row k="Highest ROI" v={portfolio.highestRoiAsset ?? '—'} />
            <Row k="Most Reused" v={portfolio.mostReusedBlueprint ?? '—'} />
            <Row k="Asset Health" v={`${portfolio.assetHealth}%`} />
            <Row k="Design Consistency" v={`${portfolio.designConsistency}%`} />
            <Row k="Marketplace Eligible" v={portfolio.marketplaceEligibleAssets} />
            <Row k="Studio Certified" v={portfolio.studioCertifiedCandidates} />
          </section>

          {snapshot.topAssetRoi.length > 0 ? (
            <section className="studio-alpha-cost-hud__section">
              <p className="studio-alpha-cost-hud__subtitle">Asset ROI</p>
              {snapshot.topAssetRoi.map((roi) => (
                <div key={roi.assetId} style={{ marginBottom: 6 }}>
                  <p className="studio-alpha-cost-hud__roi-name">{roi.displayName}</p>
                  <div className="studio-alpha-cost-hud__row">
                    <span className="studio-alpha-cost-hud__label">Gen Cost</span>
                    <CostValue label={roi.generationCost} />
                  </div>
                  <Row k="Reuse Count" v={roi.reuseCount} />
                  <div className="studio-alpha-cost-hud__row">
                    <span className="studio-alpha-cost-hud__label">Cost / Use</span>
                    <CostValue label={roi.effectiveCostPerUse} />
                  </div>
                  <div className="studio-alpha-cost-hud__row">
                    <span className="studio-alpha-cost-hud__label">Savings</span>
                    <CostValue label={roi.savingsGenerated} />
                  </div>
                </div>
              ))}
            </section>
          ) : null}
        </div>
      </aside>
    </>
  );
}
