import { useMemo, useState, type CSSProperties } from 'react';
import { useRequireStudioWorldAdmin } from '../../../../hooks/useRequireStudioWorldAdmin';
import {
  ExperienceLabIcon,
  EXPERIENCE_LAB_ICON_NAMES,
  EXPERIENCE_LAB_ICON_REGISTRY,
  EXPERIENCE_LAB_ICON_SPRITE_CONFIG,
} from '../../../../features/studio-world/icons';
import {
  resolveExperienceLabIconSourceLabeledUrl,
  resolveExperienceLabIconSourceUnlabeledTwinUrl,
} from '../../../../features/studio-world/icons/experience-lab-icon-sprite.config';
import {
  EXPERIENCE_LAB_ICON_EXTRACTION_VERSION,
  EXPERIENCE_LAB_ICON_LOCKDOWN_CERTIFIED,
  EXPERIENCE_LAB_ICON_SOURCE_ROLE,
  EXPERIENCE_LAB_ICON_V2_PIPELINE_FROZEN,
  EXPERIENCE_LAB_ICON_V4_PIPELINE_RETIRED,
} from '../../../../features/studio-world/icons/experience-lab-icon-assets.generated';
import {
  EXPERIENCE_LAB_ICON_OPTICAL_TUNING_PAUSED,
  resolveQaExperienceLabIconAsset,
} from '../../../../features/studio-world/icons/experience-lab-icon-asset-resolver';
import { FOUNDER_OPTICAL_MODE_PAUSED } from '../../../../features/studio-world/icons/experience-lab-icon-presenter';
import { STUDIO_WORLD_ICON_SOURCES } from '../../../../features/studio-world/icons/studio-world-icon-source-manifest';
import twinParity from '../../../../features/studio-world/icons/studio-world-icon-source-twin-parity.generated.json';
import runtimeParity from '../../../../features/studio-world/icons/studio-world-icon-runtime-parity.generated.json';
import contactSheetUrl from '../../../../assets/studio-world/experience-lab/icons/generated-v5/_contact-sheet.png';
import pairSheetUrl from '../../../../assets/studio-world/experience-lab/icons/generated-v5/_source-twin-runtime-comparison.png';
import protectedDiffUrl from '../../../../assets/studio-world/experience-lab/icons/source-twin-qa/protected-region-diff.png';
import sourceTwinDiffUrl from '../../../../assets/studio-world/experience-lab/icons/source-twin-qa/source-twin-diff.png';

type AuditFilter =
  | 'all'
  | 'twin-pass'
  | 'twin-warn'
  | 'twin-fail'
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
    width: 64,
    height: 52,
    backgroundImage: `url(${imageUrl})`,
    backgroundSize: `${sourceWidth}px ${sourceHeight}px`,
    backgroundPosition: `-${column * cellW * (64 / cellW)}px -${row * cellH * (52 / cellH)}px`,
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

/** v5 pixel-preserving source twin QA */
export default function AdminExperienceLabIconQaPage() {
  useRequireStudioWorldAdmin();
  const defaultFilter: AuditFilter =
    twinParity.parityFail > 0 ? 'twin-fail' : 'founder';
  const [filter, setFilter] = useState<AuditFilter>(defaultFilter);
  const [showHistory, setShowHistory] = useState(false);

  const labeledUrl = resolveExperienceLabIconSourceLabeledUrl();
  const twinUrl = resolveExperienceLabIconSourceUnlabeledTwinUrl();

  const twinByKey = useMemo(() => {
    const map = new Map<string, (typeof twinParity.icons)[number]>();
    for (const icon of twinParity.icons) map.set(icon.key, icon);
    return map;
  }, []);

  const runtimeByKey = useMemo(() => {
    const map = new Map<string, (typeof runtimeParity.icons)[number]>();
    for (const icon of runtimeParity.icons) map.set(icon.key, icon);
    return map;
  }, []);

  const auditSummary = useMemo(() => {
    let twinPass = 0;
    let twinWarn = 0;
    let twinFail = 0;
    let runtimePass = 0;
    let runtimeWarn = 0;
    let runtimeFail = 0;
    for (const name of EXPERIENCE_LAB_ICON_NAMES) {
      const twin = twinByKey.get(name);
      const asset = resolveQaExperienceLabIconAsset(name);
      if (twin?.parityStatus === 'PASS') twinPass += 1;
      else if (twin?.parityStatus === 'WARN') twinWarn += 1;
      else twinFail += 1;
      if (asset.auditStatus === 'PASS') runtimePass += 1;
      else if (asset.auditStatus === 'WARN') runtimeWarn += 1;
      else runtimeFail += 1;
    }
    return { twinPass, twinWarn, twinFail, runtimePass, runtimeWarn, runtimeFail };
  }, [twinByKey]);

  const filtered = useMemo(() => {
    return EXPERIENCE_LAB_ICON_NAMES.filter((name) => {
      const twin = twinByKey.get(name);
      const asset = resolveQaExperienceLabIconAsset(name);
      switch (filter) {
        case 'twin-pass':
          return twin?.parityStatus === 'PASS';
        case 'twin-warn':
          return twin?.parityStatus === 'WARN';
        case 'twin-fail':
          return twin?.parityStatus === 'FAIL';
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
  }, [filter, twinByKey]);

  return (
    <div style={{ padding: 24, background: '#0a0c10', color: '#f0ebe3', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 18, letterSpacing: '0.08em', marginBottom: 8 }}>
        Experience Lab Icon QA (v5 source twin)
      </h1>
      <p style={{ fontSize: 12, color: '#9a958c', marginBottom: 12 }}>
        {EXPERIENCE_LAB_ICON_EXTRACTION_VERSION} · role {EXPERIENCE_LAB_ICON_SOURCE_ROLE} · v2 frozen{' '}
        {EXPERIENCE_LAB_ICON_V2_PIPELINE_FROZEN ? 'YES' : 'NO'} · v4 retired{' '}
        {EXPERIENCE_LAB_ICON_V4_PIPELINE_RETIRED ? 'YES' : 'NO'} · certified{' '}
        {EXPERIENCE_LAB_ICON_LOCKDOWN_CERTIFIED ? 'YES' : 'NO'} · optical paused{' '}
        {EXPERIENCE_LAB_ICON_OPTICAL_TUNING_PAUSED ? 'YES' : 'NO'}
      </p>

      <p style={{ fontSize: 11, color: '#f2c94c', marginBottom: 12 }}>
        Pixel-preserving unlabeled twin derived from labeled catalog only. Protected icon pixels changed:{' '}
        {twinParity.protectedPixelsChanged}. Deprecated generated unlabeled sheet is historical-only.
      </p>

      {FOUNDER_OPTICAL_MODE_PAUSED ? (
        <p style={{ fontSize: 10, color: '#9a958c', marginBottom: 16 }}>
          Founder Optical Mode is paused until v5 source twin passes founder visual QA.
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
          ['TWIN PASS', auditSummary.twinPass, '#6fcf97'],
          ['TWIN WARN', auditSummary.twinWarn, '#f2c94c'],
          ['TWIN FAIL', auditSummary.twinFail, '#eb5757'],
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
            ['twin-pass', 'Source Twin Pass'],
            ['twin-warn', 'Source Twin Warn'],
            ['twin-fail', 'Source Twin Fail'],
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
          {showHistory ? 'Hide' : 'Show'} v2/v3/v4 history
        </button>
      </div>

      <section style={{ marginBottom: 24, fontSize: 10, color: '#9a958c' }}>
        <div>Labeled catalog: {STUDIO_WORLD_ICON_SOURCES.labeledCatalog.path}</div>
        <div>Unlabeled twin: {STUDIO_WORLD_ICON_SOURCES.unlabeledTwin.path}</div>
        <div>Deprecated sheet: {STUDIO_WORLD_ICON_SOURCES.deprecatedGeneratedUnlabeled.path}</div>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 13, marginBottom: 8 }}>Protected-region diff (should be empty)</h2>
        <img
          src={protectedDiffUrl}
          alt="Protected region diff"
          style={{ maxWidth: '100%', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8 }}
        />
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 13, marginBottom: 8 }}>Source vs twin diff (labels only)</h2>
        <img
          src={sourceTwinDiffUrl}
          alt="Source twin diff"
          style={{ maxWidth: '100%', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8 }}
        />
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 13, marginBottom: 8 }}>v5 runtime comparison sheet</h2>
        <img
          src={pairSheetUrl}
          alt="Source twin runtime comparison"
          style={{ maxWidth: '100%', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8 }}
        />
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 13, marginBottom: 8 }}>v5 generated contact sheet</h2>
        <img
          src={contactSheetUrl}
          alt="v5 contact sheet"
          style={{ maxWidth: '100%', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8 }}
        />
      </section>

      {showHistory ? (
        <section style={{ marginBottom: 24, padding: 12, border: '1px dashed rgba(255,255,255,0.15)', borderRadius: 8 }}>
          <h2 style={{ fontSize: 12, marginBottom: 8, color: '#9a958c' }}>Historical v2/v3/v4 (archived)</h2>
          <p style={{ fontSize: 10, color: '#6a958c' }}>
            v4 used deprecated generated unlabeled sheet. v3 crop manifest and v2 extractor remain for investigation
            only.
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
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 12,
          }}
        >
          {filtered.map((name) => {
            const entry = EXPERIENCE_LAB_ICON_REGISTRY[name];
            const asset = resolveQaExperienceLabIconAsset(name);
            const twin = twinByKey.get(name);
            const runtime = runtimeByKey.get(name);

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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 64px) 1fr', gap: 6, marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 7, color: '#6a958c', marginBottom: 2 }}>A labeled</div>
                    <div style={sourceCellStyle(entry.row, entry.column, labeledUrl)} />
                  </div>
                  <div>
                    <div style={{ fontSize: 7, color: '#6a958c', marginBottom: 2 }}>B twin</div>
                    <div style={sourceCellStyle(entry.row, entry.column, twinUrl)} />
                  </div>
                  <div>
                    <div style={{ fontSize: 7, color: '#6a958c', marginBottom: 2 }}>C diff</div>
                    <div
                      style={{
                        width: 64,
                        height: 52,
                        background: '#111',
                        borderRadius: 4,
                        fontSize: 8,
                        color: twin?.protectedPixelsChanged ? '#eb5757' : '#6fcf97',
                        display: 'grid',
                        placeItems: 'center',
                      }}
                    >
                      {twin?.protectedPixelsChanged ?? 0}px
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 7, color: '#6a958c', marginBottom: 2 }}>D v5</div>
                    <div
                      style={{
                        width: 64,
                        height: 52,
                        display: 'grid',
                        placeItems: 'center',
                        background: '#111',
                        borderRadius: 4,
                      }}
                    >
                      {asset.src ? (
                        <img src={asset.src} alt="" style={{ maxWidth: 56, maxHeight: 48, objectFit: 'contain' }} />
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
                  {name} · r{entry.row} c{entry.column} · v5
                </div>
                <div style={{ fontSize: 8, color: statusColor(twin?.parityStatus ?? '—'), marginTop: 4 }}>
                  twin {twin?.parityStatus ?? '—'} · protected Δ {twin?.protectedPixelsChanged ?? '—'} · label Δ{' '}
                  {twin?.labelPixelsChanged ?? '—'}
                </div>
                <div style={{ fontSize: 8, color: statusColor(asset.auditStatus) }}>
                  runtime {asset.auditStatus} · {asset.source} · pos Δ {runtime?.positionDelta ?? '—'}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
