import type { CSSProperties } from 'react';
import type { StudioAlphaCostSnapshot } from '../../../../studio-os-core/studio-alpha-cost';

type Hotspots = Record<string, { left: string; top: string; width: string; height: string }>;

type AtriumWarehouse = {
  snapshot: { totalAssets: number; totalReuseSavingsUsd: number };
  sceneRecipes: Array<{
    workspaceId: string;
    workspaceName: string;
    ingredients: Array<{ role: string; assetName: string }>;
  }>;
};

function hs(
  bounds: { left: string; top: string; width: string; height: string } | undefined,
  fallback: { left: string; top: string; width: string; height: string }
): CSSProperties {
  const b = bounds ?? fallback;
  return { left: b.left, top: b.top, width: b.width, height: b.height };
}

type Props = {
  wh: AtriumWarehouse;
  costSnapshot: StudioAlphaCostSnapshot;
  hotspots: Hotspots;
  onEnterWarehouse: () => void;
  onEnterMuseum: () => void;
};

/**
 * Orientation Atrium™ — monumental heart of Studio Archives™.
 */
export function OrientationAtriumInteractions({
  wh,
  costSnapshot,
  hotspots,
  onEnterWarehouse,
  onEnterMuseum,
}: Props) {
  const budget = costSnapshot.creativeBudget;
  const portfolio = costSnapshot.creativePortfolio;

  return (
    <>
      <div className="wh-world__hotspot" style={hs(hotspots.compass, { left: '28%', top: '32%', width: '44%', height: '24%' })}>
        <div className="wh-world__glass-embed" style={{ textAlign: 'center' }}>
          <p className="wh-world__label">Studio Archives™</p>
          <p className="wh-world__registry-count">{wh.snapshot.totalAssets}</p>
          <p className="wh-world__hint">Institutional memory · Asset Registry™</p>
        </div>
      </div>

      <div className="wh-world__hotspot" style={hs(hotspots.summary, { left: '4%', top: '58%', width: '44%', height: '28%' })}>
        <div className="wh-world__glass-embed">
          <p className="wh-world__label">Company Summary™</p>
          <p className="wh-world__hint">{wh.snapshot.totalAssets} assets · Saved ${wh.snapshot.totalReuseSavingsUsd.toFixed(0)} via reuse</p>
          <p className="wh-world__hint">Equity {portfolio.creativeEquityScore}/100 · {portfolio.reusableAssets} reusable</p>
          <button type="button" className="wh-world__btn" onClick={onEnterWarehouse}>
            Enter Warehouse Wing™ →
          </button>
        </div>
      </div>

      <div className="wh-world__hotspot" style={hs(hotspots.budget, { left: '52%', top: '58%', width: '44%', height: '28%' })}>
        <div className="wh-world__glass-embed">
          <p className="wh-world__label">Creative Budget™</p>
          <p className="wh-world__hint">Spent {budget.spent.display} · Remaining {budget.remaining.display}</p>
          <p className="wh-world__hint">Efficiency {budget.efficiencyScore}% · Saved {budget.savingsFromRegistryReuse.display}</p>
          <p className="wh-world__hint">Recent generations feed Studio Alpha™ HUD</p>
        </div>
      </div>

      <div className="wh-world__hotspot" style={hs(hotspots.registry, { left: '6%', top: '8%', width: '88%', height: '20%' })}>
        <div className="wh-world__glass-embed">
          <p className="wh-world__label">Latest Golden Builds™ · Scene Recipe™</p>
          {wh.sceneRecipes.slice(0, 2).map((recipe) => (
            <div key={recipe.workspaceId} style={{ marginBottom: 4 }}>
              <p style={{ fontSize: 5, color: '#c9a962' }}>{recipe.workspaceName}</p>
              {recipe.ingredients.slice(0, 2).map((ing) => (
                <p key={ing.role} className="wh-world__hint" style={{ margin: 0 }}>
                  {ing.role} · {ing.assetName}
                </p>
              ))}
            </div>
          ))}
          <button type="button" className="wh-world__walkway-btn" onClick={onEnterMuseum} style={{ marginTop: 6 }}>
            Walk to Museum Wing™ →
          </button>
        </div>
      </div>
    </>
  );
}
