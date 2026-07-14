import { useMemo, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useRequireStudioWorldAdmin } from '../../../../hooks/useRequireStudioWorldAdmin';
import {
  ExperienceLabIcon,
  EXPERIENCE_LAB_ICON_NAMES,
  EXPERIENCE_LAB_ICON_REGISTRY,
  EXPERIENCE_LAB_ICON_SPRITE_CONFIG,
} from '../../../../features/studio-world/icons';
import {
  resolveExperienceLabIconSourceLabeledUrl,
  resolveExperienceLabIconSourceUnlabeledUrl,
} from '../../../../features/studio-world/icons/experience-lab-icon-sprite.config';
import {
  EXPERIENCE_LAB_ICON_EXTRACTION_VERSION,
  EXPERIENCE_LAB_ICON_LOCKDOWN_CERTIFIED,
  EXPERIENCE_LAB_ICON_SOURCE_ROLE,
  EXPERIENCE_LAB_ICON_V2_PIPELINE_FROZEN,
} from '../../../../features/studio-world/icons/experience-lab-icon-assets.generated';
import {
  EXPERIENCE_LAB_ICON_OPTICAL_TUNING_PAUSED,
  resolveQaExperienceLabIconAsset,
} from '../../../../features/studio-world/icons/experience-lab-icon-asset-resolver';
import { FOUNDER_OPTICAL_MODE_PAUSED } from '../../../../features/studio-world/icons/experience-lab-icon-presenter';
import { STUDIO_WORLD_ICON_SOURCES } from '../../../../features/studio-world/icons/studio-world-icon-source-manifest';
import parityData from '../../../../features/studio-world/icons/studio-world-icon-source-pair-parity.generated.json';
import extractionMetadata from '../../../../features/studio-world/icons/experience-lab-icon-extraction-metadata.generated.json';
import contactSheetUrl from '../../../../assets/studio-world/experience-lab/icons/generated-v4/_contact-sheet.png';
import pairSheetUrl from '../../../../assets/studio-world/experience-lab/icons/generated-v4/_source-pair-comparison.png';

type AuditFilter =
  | 'all'
  | 'parity-pass'
  | 'parity-warn'
  | 'parity-fail'
  | 'runtime-pass'
  | 'runtime-fail'
  | 'founder';

const FOUNDER_PRIORITY = new Set([
  'experienceLab',
  'blueprint',
  'construction',
  'materials',
  'lighting',
  'camera',
  'zoomIn',
  'analytics',
  'permissions',
  'playback',
  'perspective',
  'terminal',
  'dashboard',
  'attachments',
  'team',
  'share',
  'diagnostics',
]);

const SIZE_TOKENS = ['xs', 'sm', 'md', 'lg'] as const;

function sourceCellStyle(row: number, column: number, imageUrl: string): CSSProperties {
  const { sourceWidth, sourceHeight, rows, columns } = EXPERIENCE_LAB_ICON_SPRITE_CONFIG;
  const cellW = sourceWidth / columns;
  const cellH = sourceHeight / rows;
  return {
    width: 72,
    height: 58,
    backgroundImage: `url(${imageUrl})`,
    backgroundSize: `${sourceWidth}px ${sourceHeight}px`,
    backgroundPosition: `-${column * cellW * (72 / cellW)}px -${row * cellH * (58 / cellH)}px`,
    backgroundRepeat: 'no-repeat',
    borderRadius: 4,
    border: '1px solid rgba(255,255,255,0.1)',
    backgroundColor: '#000',
  };
}

function statusColor(status: string): string {
  if (status === 'PASS') return '#6fcf97';
  if (status === 'FAIL') return '#eb5757';
  if (status === 'WARN') return '#f2c94c';
  return '#9a958c';
}

/** v4 unlabeled grid QA — labeled catalog semantic reference; unlabeled source extraction only. */
export default function AdminExperienceLabIconQaPage() {
  useRequireStudioWorldAdmin();
  const [filter, setFilter] = useState<AuditFilter>('all');
  const [showHistory, setShowHistory] = useState(false);

  const labeledUrl = resolveExperienceLabIconSourceLabeledUrl();
  const unlabeledUrl = resolveExperienceLabIconSourceUnlabeledUrl();

  const parityByKey = useMemo(() => {
    const map = new Map<string, (typeof parityData.icons)[number]>();
    for (const icon of parityData.icons) map.set(icon.key, icon);
    return map;
  }, []);

  const auditSummary = useMemo(() => {
    let parityPass = 0;
    let parityWarn = 0;
    let parityFail = 0;
    let runtimePass = 0;
    let runtimeWarn = 0;
    let runtimeFail = 0;
    for (const name of EXPERIENCE_LAB_ICON_NAMES) {
      const parity = parityByKey.get(name);
      const asset = resolveQaExperienceLabIconAsset(name);
      if (parity?.parityStatus === 'PASS') parityPass += 1;
      else if (parity?.parityStatus === 'WARN') parityWarn += 1;
      else parityFail += 1;
      if (asset.auditStatus === 'PASS') runtimePass += 1;
      else if (asset.auditStatus === 'WARN') runtimeWarn += 1;
      else runtimeFail += 1;
    }
    return { parityPass, parityWarn, parityFail, runtimePass, runtimeWarn, runtimeFail };
  }, [parityByKey]);

  const filtered = useMemo(() => {
    return EXPERIENCE_LAB_ICON_NAMES.filter((name) => {
      const parity = parityByKey.get(name);
      const asset = resolveQaExperienceLabIconAsset(name);
      switch (filter) {
        case 'parity-pass':
          return parity?.parityStatus === 'PASS';
        case 'parity-warn':
          return parity?.parityStatus === 'WARN';
        case 'parity-fail':
          return parity?.parityStatus === 'FAIL';
        case 'runtime-pass':
          return asset.auditStatus === 'PASS';
        case 'runtime-fail':
          return asset.auditStatus === 'FAIL';
        case 'founder':
          return FOUNDER_PRIORITY.has(name);
        default:
          return true;
      }
    });
  }, [filter, parityByKey]);

  return (
    <div style={{ padding: 24, background: '#0a0c10', color: '#f0ebe3', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 18, letterSpacing: '0.08em', marginBottom: 8 }}>
        Experience Lab Icon QA (v4 unlabeled source)
      </h1>
      <p style={{ fontSize: 12, color: '#9a958c', marginBottom: 12 }}>
        {EXPERIENCE_LAB_ICON_EXTRACTION_VERSION} · role {EXPERIENCE_LAB_ICON_SOURCE_ROLE} · v2 frozen{' '}
        {EXPERIENCE_LAB_ICON_V2_PIPELINE_FROZEN ? 'YES' : 'NO'} · certified{' '}
        {EXPERIENCE_LAB_ICON_LOCKDOWN_CERTIFIED ? 'YES' : 'NO'} · optical paused{' '}
        {EXPERIENCE_LAB_ICON_OPTICAL_TUNING_PAUSED ? 'YES' : 'NO'}
      </p>

      <p style={{ fontSize: 11, color: '#f2c94c', marginBottom: 12 }}>
        Labeled catalog = semantic reference only. Unlabeled source = sole extraction input. Text-removal and v3
        crop pipelines are retired.
      </p>

      {FOUNDER_OPTICAL_MODE_PAUSED ? (
        <p style={{ fontSize: 10, color: '#9a958c', marginBottom: 16 }}>
          Founder Optical Mode is paused until v4 source assets pass visual QA.
        </p>
      ) : null}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, minmax(72px, 1fr))',
          gap: 8,
          marginBottom: 16,
          maxWidth: 640,
        }}
      >
        {[
          ['PAIR PASS', auditSummary.parityPass, '#6fcf97'],
          ['PAIR WARN', auditSummary.parityWarn, '#f2c94c'],
          ['PAIR FAIL', auditSummary.parityFail, '#eb5757'],
          ['RT PASS', auditSummary.runtimePass, '#6fcf97'],
          ['RT WARN', auditSummary.runtimeWarn, '#f2c94c'],
          ['RT FAIL', auditSummary.runtimeFail, '#eb5757'],
        ].map(([label, count, color]) => (
          <div
            key={String(label)}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8,
              padding: 10,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 700, color: String(color) }}>{count}</div>
            <div style={{ fontSize: 9, letterSpacing: '0.06em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
        {(
          [
            ['all', 'All'],
            ['parity-pass', 'Source Pair Pass'],
            ['parity-warn', 'Source Pair Warn'],
            ['parity-fail', 'Source Pair Fail'],
            ['runtime-pass', 'Runtime Pass'],
            ['runtime-fail', 'Runtime Fail'],
            ['founder', 'Founder Priority'],
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
        <button
          type="button"
          onClick={() => setShowHistory((v) => !v)}
          style={{
            fontSize: 10,
            padding: '6px 10px',
            borderRadius: 6,
            border: '1px solid rgba(255,255,255,0.14)',
            background: showHistory ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
            color: '#9a958c',
            cursor: 'pointer',
          }}
        >
          {showHistory ? 'Hide' : 'Show'} v2/v3 history
        </button>
      </div>

      <section style={{ marginBottom: 24, fontSize: 10, color: '#9a958c' }}>
        <div>Labeled catalog: {STUDIO_WORLD_ICON_SOURCES.labeledCatalog.path}</div>
        <div>Unlabeled source: {STUDIO_WORLD_ICON_SOURCES.unlabeledSource.path}</div>
        <div>
          Dimensions: {STUDIO_WORLD_ICON_SOURCES.labeledCatalog.width}×
          {STUDIO_WORLD_ICON_SOURCES.labeledCatalog.height} · grid{' '}
          {STUDIO_WORLD_ICON_SOURCES.labeledCatalog.rows}×{STUDIO_WORLD_ICON_SOURCES.labeledCatalog.columns}
        </div>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 13, marginBottom: 8 }}>Source pair comparison (labeled → unlabeled → v4)</h2>
        <img
          src={pairSheetUrl}
          alt="Source pair comparison sheet"
          style={{ maxWidth: '100%', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8 }}
        />
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 13, marginBottom: 8 }}>v4 generated contact sheet</h2>
        <img
          src={contactSheetUrl}
          alt="v4 generated contact sheet"
          style={{ maxWidth: '100%', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8 }}
        />
      </section>

      {showHistory ? (
        <section style={{ marginBottom: 24, padding: 12, border: '1px dashed rgba(255,255,255,0.15)', borderRadius: 8 }}>
          <h2 style={{ fontSize: 12, marginBottom: 8, color: '#9a958c' }}>Historical v2/v3 (archived)</h2>
          <p style={{ fontSize: 10, color: '#6a958c', marginBottom: 8 }}>
            v2 automated extraction and v3 deterministic labeled crops are frozen. See{' '}
            <Link to="/admin/studio/experience-lab-icon-crop-editor" style={{ color: '#c9a962' }}>
              Crop Editor
            </Link>{' '}
            for investigation only.
          </p>
        </section>
      ) : null}

      <section>
        <h2 style={{ fontSize: 13, marginBottom: 12 }}>
          Per-icon validation ({filtered.length}/{EXPERIENCE_LAB_ICON_NAMES.length})
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 12,
          }}
        >
          {filtered.map((name) => {
            const entry = EXPERIENCE_LAB_ICON_REGISTRY[name];
            const asset = resolveQaExperienceLabIconAsset(name);
            const parity = parityByKey.get(name);
            const meta = extractionMetadata.icons.find((i) => i.key === name);

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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 72px) 1fr', gap: 6, marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 7, color: '#6a958c', marginBottom: 2 }}>A labeled</div>
                    <div style={sourceCellStyle(entry.row, entry.column, labeledUrl)} title="Labeled catalog cell" />
                  </div>
                  <div>
                    <div style={{ fontSize: 7, color: '#6a958c', marginBottom: 2 }}>B unlabeled</div>
                    <div style={sourceCellStyle(entry.row, entry.column, unlabeledUrl)} title="Unlabeled source cell" />
                  </div>
                  <div>
                    <div style={{ fontSize: 7, color: '#6a958c', marginBottom: 2 }}>C v4</div>
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
                      {asset.src ? (
                        <img
                          src={asset.src}
                          alt=""
                          style={{ maxWidth: 56, maxHeight: 56, objectFit: 'contain' }}
                        />
                      ) : (
                        <span style={{ fontSize: 8, color: '#666' }}>missing</span>
                      )}
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(201,169,98,0.08)',
                      borderRadius: 4,
                      border: '1px solid rgba(201,169,98,0.2)',
                    }}
                    title="Runtime md preview"
                  >
                    <ExperienceLabIcon name={name} size="md" decorative active />
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
                <div style={{ fontSize: 9, color: '#9a958c' }}>
                  {name} · r{entry.row} c{entry.column}
                </div>
                <div style={{ fontSize: 8, color: statusColor(parity?.parityStatus ?? 'PENDING'), marginTop: 4 }}>
                  parity {parity?.parityStatus ?? '—'} · pos Δ {parity?.positionDelta ?? '—'} · scale Δ{' '}
                  {parity?.scaleDelta ?? '—'}
                </div>
                <div style={{ fontSize: 8, color: statusColor(asset.auditStatus) }}>
                  runtime {asset.auditStatus} · {asset.source} · generated {meta?.generated ? 'yes' : 'no'}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
