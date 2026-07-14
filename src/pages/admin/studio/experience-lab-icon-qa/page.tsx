import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useRequireStudioWorldAdmin } from '../../../../hooks/useRequireStudioWorldAdmin';
import {
  ExperienceLabIcon,
  EXPERIENCE_LAB_ICON_ASSETS,
  EXPERIENCE_LAB_ICON_NAMES,
  EXPERIENCE_LAB_ICON_REGISTRY,
  EXPERIENCE_LAB_ICON_SPRITE_CONFIG,
  STUDIO_WORLD_ICON_PRESENTATION_VERSION,
  resolveStudioWorldIconPresentation,
} from '../../../../features/studio-world/icons';
import { resolveExperienceLabIconSourceLabeledUrl } from '../../../../features/studio-world/icons/experience-lab-icon-sprite.config';
import { FounderOpticalTuner, useFounderOpticalSelection } from '../../../../features/studio-world/icons/FounderOpticalTuner';
import { isFounderOpticalModeEnabled } from '../../../../features/studio-world/icons/experience-lab-icon-presenter';
import {
  EXPERIENCE_LAB_ICON_LOCKDOWN_CERTIFIED,
  EXPERIENCE_LAB_ICON_OPTICAL_LOCK_VERSION,
} from '../../../../features/studio-world/icons/experience-lab-icon-assets.generated';
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

/** Dev/admin QA — lockdown certification dashboard for Experience Lab icons. */
export default function AdminExperienceLabIconQaPage() {
  useRequireStudioWorldAdmin();
  const [filter, setFilter] = useState<AuditFilter>('all');
  const { selected, setSelected } = useFounderOpticalSelection();
  const [founderMode, setFounderMode] = useState(false);

  useEffect(() => {
    setFounderMode(isFounderOpticalModeEnabled());
    const handler = () => setFounderMode(isFounderOpticalModeEnabled());
    window.addEventListener('studio-world:founder-optical-mode', handler);
    return () => window.removeEventListener('studio-world:founder-optical-mode', handler);
  }, []);

  const metaByKey = useMemo(() => {
    const map = new Map<string, IconMeta>();
    for (const item of extractionMetadata.icons) map.set(item.key, item);
    return map;
  }, []);

  const auditSummary = useMemo(() => {
    let pass = 0;
    let warn = 0;
    let fail = 0;
    for (const name of EXPERIENCE_LAB_ICON_NAMES) {
      const status = EXPERIENCE_LAB_ICON_ASSETS[name].auditStatus;
      if (status === 'PASS') pass += 1;
      else if (status === 'WARN') warn += 1;
      else fail += 1;
    }
    return { pass, warn, fail };
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
        Lock {EXPERIENCE_LAB_ICON_OPTICAL_LOCK_VERSION} · presentation {STUDIO_WORLD_ICON_PRESENTATION_VERSION} ·
        certified {EXPERIENCE_LAB_ICON_LOCKDOWN_CERTIFIED ? 'YES' : 'NO'} · bundle{' '}
        {EXPERIENCE_LAB_ICON_SPRITE_CONFIG.bundleSha256?.slice(0, 12)}…
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(80px, 1fr))',
          gap: 8,
          marginBottom: 16,
          maxWidth: 480,
        }}
      >
        {[
          ['PASS', auditSummary.pass, '#6fcf97'],
          ['WARN', auditSummary.warn, '#f2c94c'],
          ['FAIL', auditSummary.fail, '#eb5757'],
          ['LOCKED', EXPERIENCE_LAB_ICON_LOCKDOWN_CERTIFIED ? 1 : 0, '#c9a962'],
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

      <FounderOpticalTuner selected={selected} onSelect={setSelected} />

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
          Per-icon certification ({filtered.length}/{EXPERIENCE_LAB_ICON_NAMES.length})
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 12,
          }}
        >
          {filtered.map((name) => {
            const entry = EXPERIENCE_LAB_ICON_REGISTRY[name];
            const asset = EXPERIENCE_LAB_ICON_ASSETS[name];
            const meta = metaByKey.get(name);
            const presentation = resolveStudioWorldIconPresentation(name);
            const statusColor =
              asset.auditStatus === 'PASS'
                ? '#6fcf97'
                : asset.auditStatus === 'WARN'
                  ? '#f2c94c'
                  : '#eb5757';

            return (
              <div
                key={name}
                role="button"
                tabIndex={0}
                onClick={() => setSelected(name)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setSelected(name);
                }}
                style={{
                  background:
                    selected === name ? 'rgba(201,169,98,0.12)' : 'rgba(255,255,255,0.04)',
                  border:
                    selected === name
                      ? '1px solid rgba(201,169,98,0.35)'
                      : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  padding: 12,
                  cursor: founderMode ? 'pointer' : 'default',
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
                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(201,169,98,0.08)',
                      borderRadius: 4,
                      border: '1px solid rgba(201,169,98,0.2)',
                    }}
                    title="Runtime button preview"
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
                <div style={{ fontSize: 9, color: '#9a958c' }}>{name}</div>
                <div style={{ fontSize: 8, color: statusColor, marginTop: 4 }}>
                  {asset.auditStatus} · conf {(asset.confidence * 100).toFixed(0)}% · overall{' '}
                  {presentation.scores.overall}%
                </div>
                <div style={{ fontSize: 8, color: '#6a958c' }}>
                  center {presentation.scores.centering}% · pad {presentation.scores.padding}% · scale{' '}
                  {presentation.scale.toFixed(2)} · offset {presentation.offsetX},{presentation.offsetY}
                </div>
                <div style={{ fontSize: 8, color: '#6a958c' }}>
                  text: {meta?.textContamination?.contaminated ? 'CONTAMINATED' : 'clean'} · stroke 1.00 · family OK
                </div>
                <div style={{ fontSize: 8, color: '#6a958c' }}>
                  override: {meta?.overrideApplied ? 'yes' : 'no'} · runtime:{' '}
                  {meta?.runtimeValidated ? 'validated' : 'pending'}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
