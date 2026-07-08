import type { ReactNode } from 'react';
import type { WarehouseAsset } from '../../../../studio-os-core/studio-warehouse';
import {
  buildAssetRelationshipTree,
  buildReuseIntelligence,
  buildWorldGraphForAsset,
  computeQualityScore,
} from '../../../../studio-os-core/studio-warehouse/intelligence';
import { WAREHOUSE_SCENE_RECIPES } from '../../../../studio-os-core/studio-warehouse';

type Props = {
  open: boolean;
  asset: WarehouseAsset | null;
  catalog: WarehouseAsset[];
  recommendReuse: boolean;
  onClose: () => void;
  onFavorite: () => void;
  onArchive: () => void;
  onSelectRelated: (assetId: string) => void;
  onApply?: () => void;
  applyLabel?: string;
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="wh-campus__inspector-section" open>
      <summary className="wh-campus__inspector-section-title">{title}</summary>
      <div className="wh-campus__inspector-section-body">{children}</div>
    </details>
  );
}

/**
 * Collapsible Inspector Panel — complexity hidden until requested.
 * Asset Inspection Mode™ secondary information layer.
 */
export function WarehouseCollapsibleInspector({
  open,
  asset,
  catalog,
  recommendReuse,
  onClose,
  onFavorite,
  onArchive,
  onSelectRelated,
  onApply,
  applyLabel,
}: Props) {
  if (!open) return null;

  if (!asset) {
    return (
      <aside className="wh-campus__inspector wh-campus__inspector--open" aria-label="Asset Inspector">
        <header className="wh-campus__inspector-header">
          <p className="wh-campus__inspector-title">Inspector Panel™</p>
          <button type="button" className="wh-campus__inspector-close" onClick={onClose} aria-label="Close inspector">
            ×
          </button>
        </header>
        <p className="wh-campus__inspector-hint">Select an asset to inspect generation history, dependencies, and reuse intelligence.</p>
      </aside>
    );
  }

  const reuse = buildReuseIntelligence(asset);
  const quality = computeQualityScore(asset);
  const relationships = buildAssetRelationshipTree(asset, catalog);
  const worldGraph = buildWorldGraphForAsset(asset, catalog);
  const usedInRecipes = WAREHOUSE_SCENE_RECIPES.filter((r) =>
    r.ingredients.some((i) => i.assetId === asset.id)
  );

  return (
    <aside className="wh-campus__inspector wh-campus__inspector--open" aria-label="Asset Inspector">
      <header className="wh-campus__inspector-header">
        <div>
          <p className="wh-campus__inspector-title">{asset.name}</p>
          <p className="wh-campus__inspector-sub">
            {asset.version} · {asset.department}
          </p>
        </div>
        <button type="button" className="wh-campus__inspector-close" onClick={onClose} aria-label="Close inspector">
          ×
        </button>
      </header>

      <div className="wh-campus__inspector-scroll">
        {recommendReuse ? (
          <p className="wh-campus__reuse-banner">Reuse Intelligence™ — regenerate avoided · save ${reuse.savingsUsd.toFixed(2)}</p>
        ) : null}

        <Section title="Generation Cost™">
          <div className="wh-campus__meta-row">
            <span>Estimated generation</span>
            <span>${reuse.generationCostUsd.toFixed(2)}</span>
          </div>
          <div className="wh-campus__meta-row">
            <span>Reuse instead</span>
            <span className="wh-campus__meta-highlight">${reuse.reuseCostUsd.toFixed(2)}</span>
          </div>
          <div className="wh-campus__meta-row">
            <span>Per-use savings</span>
            <span>${reuse.savingsUsd.toFixed(2)}</span>
          </div>
          <div className="wh-campus__meta-row">
            <span>Total savings</span>
            <span>${reuse.totalSavingsUsd.toFixed(2)}</span>
          </div>
        </Section>

        <Section title="Reuse Savings™">
          <div className="wh-campus__meta-row">
            <span>Used in</span>
            <span>{reuse.usedInCount} workspaces</span>
          </div>
          <div className="wh-campus__meta-row">
            <span>Generation avoided</span>
            <span>{asset.reuseCount}</span>
          </div>
          <div className="wh-campus__meta-row">
            <span>Time saved</span>
            <span>{reuse.generationTimeAvoidedMinutes} min</span>
          </div>
          <div className="wh-campus__meta-row">
            <span>Reuse efficiency</span>
            <span>{reuse.reuseEfficiencyPct}%</span>
          </div>
          {reuse.usedInWorkspaces.length > 0 ? (
            <p className="wh-campus__workspace-list">{reuse.usedInWorkspaces.join(' · ')}</p>
          ) : null}
        </Section>

        <Section title="Quality Report™">
          <div className="wh-campus__quality-badge">
            <span className="wh-campus__quality-grade">{quality.grade}</span>
            <span>{quality.score}/100</span>
          </div>
          {quality.factors.map((f) => (
            <div key={f.label} className="wh-campus__meta-row">
              <span>{f.label}</span>
              <span>{f.value}</span>
            </div>
          ))}
        </Section>

        <Section title="Used In™">
          {usedInRecipes.length === 0 ? (
            <p className="wh-campus__inspector-hint">No scene recipes reference this asset yet.</p>
          ) : (
            usedInRecipes.map((r) => (
              <div key={r.workspaceId} className="wh-campus__meta-row">
                <span>{r.workspaceName}</span>
                <span>{r.department}</span>
              </div>
            ))
          )}
        </Section>

        <Section title="Asset Relationships™">
          <div className="wh-campus__relationship-tree">
            {relationships.map((rel, i) => (
              <div key={`${rel.assetId}-${i}`} className="wh-campus__relationship-node" style={{ paddingLeft: rel.depth * 12 }}>
                <span className="wh-campus__relationship-role">{rel.role}</span>
                <button
                  type="button"
                  className="wh-campus__relationship-link"
                  onClick={() => onSelectRelated(rel.assetId)}
                  disabled={rel.assetId === asset.id}
                >
                  {rel.assetName}
                  {rel.assetId !== asset.id ? ' →' : ' (current)'}
                </button>
              </div>
            ))}
          </div>
        </Section>

        <Section title="World Graph™">
          <div className="wh-campus__world-graph">
            {worldGraph.nodes.map((node) => (
              <div
                key={node.id}
                className={`wh-campus__graph-node wh-campus__graph-node--${node.kind}${node.id === asset.id ? ' is-current' : ''}`}
              >
                {node.label}
              </div>
            ))}
            {worldGraph.edges.slice(0, 8).map((edge, i) => (
              <p key={i} className="wh-campus__graph-edge">
                {edge.label}: {worldGraph.nodes.find((n) => n.id === edge.from)?.label ?? edge.from} →{' '}
                {worldGraph.nodes.find((n) => n.id === edge.to)?.label ?? edge.to}
              </p>
            ))}
          </div>
        </Section>

        <Section title="Version History™">
          <div className="wh-campus__meta-row">
            <span>Current</span>
            <span>{asset.version}</span>
          </div>
          <div className="wh-campus__meta-row">
            <span>Future Variants™</span>
            <span>{asset.goldenBuildCount >= 8 ? 'Parallel Future™ ready' : 'Pending golden builds'}</span>
          </div>
          <div className="wh-campus__meta-row">
            <span>Parallel Futures™</span>
            <span>{asset.reuseCount >= 5 ? 'Branch available' : '—'}</span>
          </div>
        </Section>

        <Section title="Scene Compatibility™">
          <div className="wh-campus__meta-row">
            <span>Genome match</span>
            <span>{asset.genomeCompatibilityPct}%</span>
          </div>
          <div className="wh-campus__meta-row">
            <span>Marketplace</span>
            <span>{asset.marketplaceStatus.replace('-', ' ')}</span>
          </div>
          {asset.compatibleScenePackIds.length > 0 ? (
            <p className="wh-campus__workspace-list">{asset.compatibleScenePackIds.join(' · ')}</p>
          ) : null}
        </Section>

        <Section title="Generation History™">
          <div className="wh-campus__meta-row">
            <span>Generated</span>
            <span>{asset.generationDate}</span>
          </div>
          <div className="wh-campus__meta-row">
            <span>Provider</span>
            <span>{asset.provider}</span>
          </div>
          <div className="wh-campus__meta-row">
            <span>Originating workspace</span>
            <span>{asset.workspace}</span>
          </div>
          <div className="wh-campus__meta-row">
            <span>Golden builds</span>
            <span>{asset.goldenBuildCount}</span>
          </div>
        </Section>
      </div>

      <footer className="wh-campus__inspector-actions">
        <button type="button" className="wh-world__btn" onClick={onFavorite}>
          {asset.favorite ? 'Unfavorite' : 'Favorite'}
        </button>
        <button type="button" className="wh-world__btn" onClick={onArchive}>
          Archive
        </button>
        {onApply ? (
          <button type="button" className="wh-world__btn wh-world__btn--gold" onClick={onApply}>
            {applyLabel ?? 'Apply to Workspace™'}
          </button>
        ) : null}
      </footer>
    </aside>
  );
}
