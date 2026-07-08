import type { CSSProperties } from 'react';

type Hotspots = Record<string, { left: string; top: string; width: string; height: string }>;

function hs(
  bounds: { left: string; top: string; width: string; height: string } | undefined,
  fallback: { left: string; top: string; width: string; height: string }
): CSSProperties {
  const b = bounds ?? fallback;
  return { left: b.left, top: b.top, width: b.width, height: b.height };
}

const GENOME_TRAITS = [
  'Brand personality',
  'Visual language',
  'Creative preferences',
  'Design taste',
  'Typography',
  'Motion language',
  'Lighting preferences',
  'Material preferences',
  'Reuse patterns',
  'Approval behavior',
];

const DEMO_BLUEPRINTS = [
  { name: 'Creative Direction Pipeline™', version: 'v3.2', reuse: 48, creator: 'Studio Alpha' },
  { name: 'Golden Build Scene Stack™', version: 'v2.1', reuse: 124, creator: 'Studio Alpha' },
  { name: 'Editorial Luxury Lighting™', version: 'v1.8', reuse: 436, creator: 'Frontal Slayer' },
];

type GenomeProps = {
  hotspots: Hotspots;
  onEnterBlueprints: () => void;
};

export function GenomeVaultInteractions({ hotspots, onEnterBlueprints }: GenomeProps) {
  return (
    <>
      <div className="wh-world__hotspot" style={hs(hotspots.helix, { left: '28%', top: '30%', width: '44%', height: '36%' })}>
        <div className="wh-world__glass-embed wh-world__glass-embed--genome" style={{ textAlign: 'center' }}>
          <p className="wh-world__label">Company Genome Vault™</p>
          <p className="wh-world__registry-count" style={{ color: '#b8d4a8' }}>
            DNA
          </p>
          <p className="wh-world__hint">Evolving memory layer — powers recommendations across Studio OS</p>
        </div>
      </div>
      <div className="wh-world__hotspot" style={hs(hotspots.traits, { left: '6%', top: '68%', width: '88%', height: '24%' })}>
        <div className="wh-world__glass-embed wh-world__glass-embed--genome">
          <p className="wh-world__label">Genome Traits™</p>
          <div className="wh-world__trait-grid">
            {GENOME_TRAITS.map((t) => (
              <span key={t} className="wh-world__trait-chip">
                {t}
              </span>
            ))}
          </div>
          <button type="button" className="wh-world__btn" onClick={onEnterBlueprints} style={{ marginTop: 6 }}>
            Blueprint Archive™ →
          </button>
        </div>
      </div>
    </>
  );
}

type BlueprintProps = {
  hotspots: Hotspots;
  onEnterMarketplace: () => void;
};

export function BlueprintArchiveInteractions({ hotspots, onEnterMarketplace }: BlueprintProps) {
  return (
    <>
      <div className="wh-world__hotspot" style={hs(hotspots.catalog, { left: '8%', top: '8%', width: '84%', height: '24%' })}>
        <div className="wh-world__glass-embed wh-world__glass-embed--blueprint">
          <p className="wh-world__label">Blueprint Archive™</p>
          <p className="wh-world__hint">Versioned · Forkable · Shareable · Marketplace eligible</p>
        </div>
      </div>
      <div className="wh-world__hotspot" style={hs(hotspots.stacks, { left: '6%', top: '36%', width: '88%', height: '48%' })}>
        <div className="wh-world__glass-embed wh-world__glass-embed--blueprint">
          {DEMO_BLUEPRINTS.map((bp) => (
            <div key={bp.name} className="wh-world__blueprint-row">
              <p style={{ color: '#c9a962', fontSize: 5, margin: '0 0 2px' }}>{bp.name}</p>
              <p className="wh-world__hint" style={{ margin: 0 }}>
                {bp.creator} · {bp.version} · Reuse {bp.reuse} · Marketplace eligible
              </p>
            </div>
          ))}
          <button type="button" className="wh-world__walkway-btn" onClick={onEnterMarketplace} style={{ marginTop: 8 }}>
            Marketplace Pavilion™ →
          </button>
        </div>
      </div>
    </>
  );
}

type MarketplaceProps = {
  hotspots: Hotspots;
  importOptions: string[];
  onEnterMuseum: () => void;
};

export function MarketplacePavilionInteractions({
  hotspots,
  importOptions,
  onEnterMuseum,
}: MarketplaceProps) {
  return (
    <>
      <div
        className="wh-world__hotspot"
        style={hs(hotspots.pavilion, { left: '6%', top: '36%', width: '88%', height: '48%' })}
      >
        <div className="wh-world__glass-embed wh-world__glass-embed--marketplace">
          <p className="wh-world__label">Marketplace Pavilion™</p>
          <p className="wh-world__hint">Walk through displays — Headquarters™, Departments™, Blueprints™, Scene Packs™</p>
          <p className="wh-world__hint">Preview · Compare · Purchase · Import to Warehouse Wing™</p>
        </div>
      </div>
      <div className="wh-world__hotspot" style={hs(hotspots.dock, { left: '8%', top: '42%', width: '84%', height: '36%' })}>
        <div className="wh-world__glass-embed">
          <p className="wh-world__label">Import Selection™</p>
          {importOptions.map((opt) => (
            <button key={opt} type="button" className="wh-world__btn" style={{ marginRight: 4, marginBottom: 4 }}>
              {opt}
            </button>
          ))}
        </div>
      </div>
      <div className="wh-world__hotspot wh-world__hotspot--ghost" style={{ left: '12%', top: '78%', width: '76%', height: '12%' }}>
        <button type="button" className="wh-world__walkway-btn" onClick={onEnterMuseum}>
          Walk to Museum Wing™ →
        </button>
      </div>
    </>
  );
}

type ServiceBayProps = {
  label: string;
  hint: string;
  hotspot?: CSSProperties;
};

export function ArchivesServiceBayInteractions({ label, hint }: ServiceBayProps) {
  return (
    <div className="wh-wing-panel">
      <div className="wh-wing-panel__frame">
        <div className="wh-wing-panel__scroll">
          <p className="wh-world__label">{label}</p>
          <p className="wh-world__hint">{hint}</p>
          <p className="wh-world__hint">Scene Stack™ assembles this wing — assets register to Asset Registry™</p>
        </div>
      </div>
    </div>
  );
}

type WarehouseWingProps = {
  hotspots: Hotspots;
  onEnterGalleries: () => void;
};

export function WarehouseWingLobbyInteractions({ hotspots, onEnterGalleries }: WarehouseWingProps) {
  return (
    <div className="wh-world__hotspot" style={hs(hotspots.portal, { left: '20%', top: '44%', width: '60%', height: '28%' })}>
      <div className="wh-world__glass-embed">
        <p className="wh-world__label">Warehouse Wing™</p>
        <p className="wh-world__hint">Active reusable production assets — editable, mountable, never regenerate unnecessarily</p>
        <button type="button" className="wh-world__enter-btn" onClick={onEnterGalleries}>
          Enter Production Galleries™ →
        </button>
      </div>
    </div>
  );
}
