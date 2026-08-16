import { Navigate } from 'react-router-dom';
import { AIOIcon } from '../../components/AIOIcon';
import {
  aioComplianceIcons,
  aioFreightIcons,
  aioPlatformIcons,
  aioServiceDiscoveryIcons,
  aioExpandedIconCatalog,
  getAioIconSrc,
  type AioIconKey,
} from '../../config/aioIconRegistry';
import { isProductionDeployment } from '../../infrastructure/environmentModel';

const PREVIEW_SIZES = [32, 48, 64] as const;

type GroupDef = {
  title: string;
  keys: AioIconKey[];
};

const EXPANDED_GROUPS: GroupDef[] = [
  { title: 'Compliance + Business', keys: Object.keys(aioComplianceIcons) as AioIconKey[] },
  { title: 'Fleet + Freight', keys: Object.keys(aioFreightIcons) as AioIconKey[] },
  { title: 'Finance + Platform', keys: Object.keys(aioPlatformIcons) as AioIconKey[] },
];

const HOMEPAGE_KEYS = Object.keys(aioServiceDiscoveryIcons) as AioIconKey[];

function IconPreviewRow({ iconKey }: { iconKey: AioIconKey }) {
  const meta = aioExpandedIconCatalog.find((e) => e.key === iconKey);
  const src = getAioIconSrc(iconKey);

  return (
    <article className="aio-icon-debug-card">
      <div className="aio-icon-debug-card__previews">
        {PREVIEW_SIZES.map((size) => (
          <div key={size} className="aio-icon-debug-card__cell aio-icon-debug-card__cell--light">
            <AIOIcon icon={iconKey} size={size} alt="" />
            <span className="aio-icon-debug-card__size">{size}px</span>
          </div>
        ))}
        <div className="aio-icon-debug-card__cell aio-icon-debug-card__cell--dark">
          <AIOIcon icon={iconKey} size={48} alt="" />
          <span className="aio-icon-debug-card__size">48px dark</span>
        </div>
      </div>
      <div className="aio-icon-debug-card__meta">
        <h3 className="aio-icon-debug-card__title">{meta?.label ?? iconKey}</h3>
        <p className="aio-icon-debug-card__key">
          <code>{iconKey}</code>
        </p>
        <p className="aio-icon-debug-card__path">
          <code>{src}</code>
        </p>
        {meta ? (
          <p className="aio-icon-debug-card__spec">
            Canvas {meta.canvas}px · occupancy ~{meta.occupancyPct}% · min display {meta.minRecommendedSize}px
          </p>
        ) : null}
      </div>
    </article>
  );
}

export function IconLibraryDebugPage() {
  if (isProductionDeployment()) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="aio-page aio-icon-debug">
      <header className="aio-icon-debug__header">
        <p className="aio-icon-debug__eyebrow">Debug QA only — not linked in public navigation</p>
        <h1 className="aio-display-md">AIO Custom Icon Library</h1>
        <p className="aio-body">
          Production inventory for semantic registry keys. Black artwork on transparent 512×512 source canvases.
        </p>
      </header>

      <section className="aio-icon-debug__section">
        <h2 className="aio-icon-debug__group-title">Homepage service icons (03E / 03E.1 — protected)</h2>
        <div className="aio-icon-debug-grid">
          {HOMEPAGE_KEYS.map((key) => (
            <IconPreviewRow key={key} iconKey={key} />
          ))}
        </div>
      </section>

      {EXPANDED_GROUPS.map((group) => (
        <section key={group.title} className="aio-icon-debug__section">
          <h2 className="aio-icon-debug__group-title">{group.title}</h2>
          <div className="aio-icon-debug-grid">
            {group.keys.map((key) => (
              <IconPreviewRow key={key} iconKey={key} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
