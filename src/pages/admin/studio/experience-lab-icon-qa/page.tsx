import { useMemo, useState, type CSSProperties } from 'react';
import { useRequireStudioWorldAdmin } from '../../../../hooks/useRequireStudioWorldAdmin';
import {
  ExperienceLabIcon,
  EXPERIENCE_LAB_ICON_ASSETS,
  EXPERIENCE_LAB_ICON_NAMES,
  EXPERIENCE_LAB_ICON_REGISTRY,
  EXPERIENCE_LAB_ICON_SPRITE_CONFIG,
} from '../../../../features/studio-world/icons';
import { resolveExperienceLabIconSourceLabeledUrl } from '../../../../features/studio-world/icons/experience-lab-icon-sprite.config';
import { resolveExperienceLabIconOpticalScale } from '../../../../features/studio-world/icons/experience-lab-icon-optical-scale';
import { EXPERIENCE_LAB_ICON_EXTRACTION_VERSION } from '../../../../features/studio-world/icons/experience-lab-icon-assets.generated';
import extractionMetadata from '../../../../features/studio-world/icons/experience-lab-icon-extraction-metadata.generated.json';
import contactSheetUrl from '../../../../assets/studio-world/experience-lab/icons/generated/_contact-sheet.png';

type AuditFilter = 'all' | 'PASS' | 'WARN' | 'FAIL' | 'overrides' | 'contamination' | 'founder';

const FOUNDER_REPORTED = new Set([
  'zoomIn',
  'materials',
  'analytics',
  'permissions',
  'camera',
  'playback',
  'perspective',
  'terminal',
  'dashboard',
]);

const SIZE_TOKENS = ['xs', 'sm', 'md', 'lg'] as const;

type IconMeta = (typeof extractionMetadata.icons)[number];

function sourceCellStyle(row: number, column: number): CSSProperties {
  const { sourceWidth, sourceHeight, rows, columns } = EXPERIENCE_LAB_ICON_SPRITE_CONFIG;
  const cellW = sourceWidth / columns;
  const cellH = sourceHeight / rows;
  const bgW = sourceWidth;
  const bgH = sourceHeight;
  return {
    width: 72,
    height: 58,
    backgroundImage: `url(${resolveExperienceLabIconSourceLabeledUrl()})`,
    backgroundSize: `${bgW}px ${bgH}px`,
    backgroundPosition: `-${column * cellW * (72 / cellW)}px -${row * cellH * (58 / cellH)}px`,
    backgroundRepeat: 'no-repeat',
    borderRadius: 4,
    border: '1px solid rgba(255,255,255,0.1)',
  };
}

/** Dev/admin QA — compare extracted icons against labeled source catalog. */
export default function AdminExperienceLabIconQaPage() {
  useRequireStudioWorldAdmin();
  const [filter, setFilter] = useState<AuditFilter>('all');

  const metaByKey = useMemo(() => {
    const map = new Map<string, IconMeta>();
    for (const item of extractionMetadata.icons) map.set(item.key, item);
    return map;
  }, []);

  const filtered = useMemo(() => {
    return EXPERIENCE_LAB_ICON_NAMES.filter((name) => {
      const meta = metaByKey.get(name);
      const asset = EXPERIENCE_LAB_ICON_ASSETS[name];
      if (!meta || !asset) return false;
      switch (filter) {
        case 'PASS':
          return asset.auditStatus === 'PASS';
        case 'WARN':
          return asset.auditStatus === 'WARN';
        case 'FAIL':
          return asset.auditStatus === 'FAIL';
        case 'overrides':
          return meta.overrideApplied;
        case 'contamination':
          return meta.textContamination?.contaminated === true;
        case 'founder':
          return FOUNDER_REPORTED.has(name);
        default:
          return true;
      }
    });
  }, [filter, metaByKey]);

  const sourceUrl = resolveExperienceLabIconSourceLabeledUrl();

  return (
    <div style={{ padding: 24, background: '#0a0c10', color: '#f0ebe3', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 18, letterSpacing: '0.08em', marginBottom: 8 }}>Experience Lab Icon QA</h1>
      <p style={{ fontSize: 12, color: '#9a958c', marginBottom: 12 }}>
        Pipeline {EXPERIENCE_LAB_ICON_EXTRACTION_VERSION} · bundle{' '}
        {EXPERIENCE_LAB_ICON_SPRITE_CONFIG.bundleSha256?.slice(0, 12)}… · mode:{' '}
        {EXPERIENCE_LAB_ICON_SPRITE_CONFIG.mode}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
        {(
          [
            ['all', 'All'],
            ['PASS', 'Pass'],
            ['WARN', 'Warn'],
            ['FAIL', 'Fail'],
            ['overrides', 'Overrides'],
            ['contamination', 'Text Contamination'],
            ['founder', 'Founder Reported'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            style={{
              fontSize: 10,
              padding: '6px 10px',
              borderRadius: 6,
              border: '1px solid rgba(255,255,255,0.14)',
              background: filter === id ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
              color: '#f0ebe3',
              cursor: 'pointer',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 13, marginBottom: 8 }}>Labeled source (canonical catalog)</h2>
        <img
          src={sourceUrl}
          alt="Experience Lab labeled icon source sheet"
          style={{ maxWidth: '100%', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8 }}
        />
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 13, marginBottom: 8 }}>Generated contact sheet</h2>
        <img
          src={contactSheetUrl}
          alt="Extracted icon contact sheet"
          style={{ maxWidth: '100%', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8 }}
        />
      </section>

      <section>
        <h2 style={{ fontSize: 13, marginBottom: 12 }}>
          Per-icon forensic preview ({filtered.length}/{EXPERIENCE_LAB_ICON_NAMES.length})
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 12,
          }}
        >
          {filtered.map((name) => {
            const entry = EXPERIENCE_LAB_ICON_REGISTRY[name];
            const asset = EXPERIENCE_LAB_ICON_ASSETS[name];
            const meta = metaByKey.get(name);
            const optical = resolveExperienceLabIconOpticalScale(name);
            const statusColor =
              asset.auditStatus === 'PASS'
                ? '#6fcf97'
                : asset.auditStatus === 'WARN'
                  ? '#f2c94c'
                  : '#eb5757';

            return (
              <div
                key={name}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  padding: 12,
                }}
              >
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <div style={sourceCellStyle(entry.row, entry.column)} title="Source cell" />
                  <div
                    style={{
                      width: 72,
                      height: 58,
                      display: 'grid',
                      placeItems: 'center',
                      background: '#111',
                      borderRadius: 4,
                    }}
                  >
                    <img
                      src={asset.src}
                      alt=""
                      style={{ maxWidth: 56, maxHeight: 56, objectFit: 'contain' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                  {SIZE_TOKENS.map((size) => (
                    <div key={size} style={{ textAlign: 'center' }}>
                      <ExperienceLabIcon name={name} size={size} decorative />
                      <div style={{ fontSize: 7, color: '#6a958c' }}>{size}</div>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: 10, fontWeight: 700 }}>{entry.sourceLabel}</div>
                <div style={{ fontSize: 9, color: '#9a958c' }}>{name}</div>
                <div style={{ fontSize: 8, color: statusColor, marginTop: 4 }}>
                  {asset.auditStatus} · conf {(asset.confidence * 100).toFixed(0)}% · optical {optical.toFixed(2)}
                </div>
                <div style={{ fontSize: 8, color: '#6a958c' }}>
                  text: {meta?.textContamination?.contaminated ? 'CONTAMINATED' : 'clean'} · bottom{' '}
                  {((meta?.textContamination?.bottomRatio ?? 0) * 100).toFixed(0)}%
                </div>
                <div style={{ fontSize: 8, color: '#6a958c' }}>
                  override: {meta?.overrideApplied ? 'yes' : 'no'}
                  {meta?.overrideReason ? ` — ${meta.overrideReason}` : ''}
                </div>
                <div style={{ fontSize: 8, color: '#6a958c' }}>
                  bounds: {meta?.sourceBounds.minX},{meta?.sourceBounds.minY}→{meta?.sourceBounds.maxX},
                  {meta?.sourceBounds.maxY} · label y={meta?.labelStartInCell}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
