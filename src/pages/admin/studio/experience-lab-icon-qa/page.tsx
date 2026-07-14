import { useMemo, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useRequireStudioWorldAdmin } from '../../../../hooks/useRequireStudioWorldAdmin';
import {
  ExperienceLabIcon,
  EXPERIENCE_LAB_ICON_NAMES,
  EXPERIENCE_LAB_ICON_REGISTRY,
  EXPERIENCE_LAB_ICON_SPRITE_CONFIG,
} from '../../../../features/studio-world/icons';
import { resolveExperienceLabIconSourceLabeledUrl } from '../../../../features/studio-world/icons/experience-lab-icon-sprite.config';
import {
  EXPERIENCE_LAB_ICON_LOCKDOWN_CERTIFIED,
  EXPERIENCE_LAB_ICON_OPTICAL_LOCK_VERSION,
  EXPERIENCE_LAB_ICON_V2_PIPELINE_FROZEN,
} from '../../../../features/studio-world/icons/experience-lab-icon-assets.generated';
import {
  EXPERIENCE_LAB_ICON_OPTICAL_TUNING_PAUSED,
  resolveCropEntry,
  resolveQaExperienceLabIconAsset,
} from '../../../../features/studio-world/icons/experience-lab-icon-asset-resolver';
import { FOUNDER_OPTICAL_MODE_PAUSED } from '../../../../features/studio-world/icons/experience-lab-icon-presenter';
import {
  StudioWorldIconCropManifest,
  STUDIO_WORLD_ICON_CROP_MANIFEST_VERSION,
  STUDIO_WORLD_ICON_SOURCE,
  isCropInsideCell,
} from '../../../../features/studio-world/icons/studio-world-icon-crop-manifest';
import extractionMetadata from '../../../../features/studio-world/icons/experience-lab-icon-extraction-metadata.generated.json';
import contactSheetUrl from '../../../../assets/studio-world/experience-lab/icons/generated-v3/_contact-sheet.png';

type AuditFilter = 'all' | 'PENDING' | 'PASS' | 'FAIL' | 'founder' | 'unapproved';

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
  'blueprint',
  'construction',
  'lighting',
  'attachments',
  'team',
  'experienceLab',
  'share',
  'diagnostics',
]);

const SIZE_TOKENS = ['xs', 'sm', 'md', 'lg'] as const;

function sourceCellStyle(row: number, column: number): CSSProperties {
  const { sourceWidth, sourceHeight, rows, columns } = EXPERIENCE_LAB_ICON_SPRITE_CONFIG;
  const cellW = sourceWidth / columns;
  const cellH = sourceHeight / rows;
  return {
    width: 72,
    height: 58,
    backgroundImage: `url(${resolveExperienceLabIconSourceLabeledUrl()})`,
    backgroundSize: `${sourceWidth}px ${sourceHeight}px`,
    backgroundPosition: `-${column * cellW * (72 / cellW)}px -${row * cellH * (58 / cellH)}px`,
    backgroundRepeat: 'no-repeat',
    borderRadius: 4,
    border: '1px solid rgba(255,255,255,0.1)',
  };
}

function cropOverlayStyle(name: string): CSSProperties {
  const crop = resolveCropEntry(name as keyof typeof StudioWorldIconCropManifest);
  const cell = {
    left: Math.round((crop.column * STUDIO_WORLD_ICON_SOURCE.width) / 8),
    top: Math.round((crop.row * STUDIO_WORLD_ICON_SOURCE.height) / 8),
    width: Math.round(STUDIO_WORLD_ICON_SOURCE.width / 8),
    height: Math.round(STUDIO_WORLD_ICON_SOURCE.height / 8),
  };
  const scale = 72 / cell.width;
  return {
    position: 'absolute',
    left: (crop.cropX - cell.left) * scale,
    top: (crop.cropY - cell.top) * scale,
    width: crop.cropWidth * scale,
    height: crop.cropHeight * scale,
    border: '1px solid rgba(80,160,255,0.85)',
    pointerEvents: 'none',
    boxSizing: 'border-box',
  };
}

/** v3 deterministic crop QA — v2 pipeline frozen; optical tuning paused. */
export default function AdminExperienceLabIconQaPage() {
  useRequireStudioWorldAdmin();
  const [filter, setFilter] = useState<AuditFilter>('all');

  const auditSummary = useMemo(() => {
    let pass = 0;
    let pending = 0;
    let fail = 0;
    let approved = 0;
    for (const name of EXPERIENCE_LAB_ICON_NAMES) {
      const crop = StudioWorldIconCropManifest[name];
      const asset = resolveQaExperienceLabIconAsset(name);
      if (crop.approved) approved += 1;
      if (asset.auditStatus === 'PASS') pass += 1;
      else if (asset.auditStatus === 'FAIL') fail += 1;
      else pending += 1;
    }
    return { pass, pending, fail, approved };
  }, []);

  const filtered = useMemo(() => {
    return EXPERIENCE_LAB_ICON_NAMES.filter((name) => {
      const crop = StudioWorldIconCropManifest[name];
      const asset = resolveQaExperienceLabIconAsset(name);
      switch (filter) {
        case 'PASS':
          return asset.auditStatus === 'PASS';
        case 'FAIL':
          return asset.auditStatus === 'FAIL';
        case 'unapproved':
          return !crop.approved;
        case 'founder':
          return FOUNDER_REPORTED.has(name);
        case 'PENDING':
          return asset.auditStatus === 'PENDING';
        default:
          return true;
      }
    });
  }, [filter]);

  const sourceUrl = resolveExperienceLabIconSourceLabeledUrl();

  return (
    <div style={{ padding: 24, background: '#0a0c10', color: '#f0ebe3', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 18, letterSpacing: '0.08em', marginBottom: 8 }}>Experience Lab Icon QA (v3)</h1>
      <p style={{ fontSize: 12, color: '#9a958c', marginBottom: 12 }}>
        Crop manifest {STUDIO_WORLD_ICON_CROP_MANIFEST_VERSION} · pipeline {EXPERIENCE_LAB_ICON_OPTICAL_LOCK_VERSION} ·
        v2 frozen {EXPERIENCE_LAB_ICON_V2_PIPELINE_FROZEN ? 'YES' : 'NO'} · certified{' '}
        {EXPERIENCE_LAB_ICON_LOCKDOWN_CERTIFIED ? 'YES' : 'NO'} · optical paused{' '}
        {EXPERIENCE_LAB_ICON_OPTICAL_TUNING_PAUSED ? 'YES' : 'NO'}
      </p>

      <p style={{ fontSize: 11, color: '#f2c94c', marginBottom: 12 }}>
        v2 automated extraction is frozen. Runtime uses approved v3 crops only (fail-closed fallback until founder
        approval). Tune crops in{' '}
        <Link to="/admin/studio/experience-lab-icon-crop-editor" style={{ color: '#c9a962' }}>
          Icon Crop Editor
        </Link>
        .
      </p>

      {FOUNDER_OPTICAL_MODE_PAUSED ? (
        <p style={{ fontSize: 10, color: '#9a958c', marginBottom: 16 }}>
          Founder Optical Mode is paused until v3 source assets are approved.
        </p>
      ) : null}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(80px, 1fr))',
          gap: 8,
          marginBottom: 16,
          maxWidth: 520,
        }}
      >
        {[
          ['APPROVED', auditSummary.approved, '#c9a962'],
          ['PASS', auditSummary.pass, '#6fcf97'],
          ['PENDING', auditSummary.pending, '#f2c94c'],
          ['FAIL', auditSummary.fail, '#eb5757'],
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
            ['PENDING', 'Pending'],
            ['unapproved', 'Unapproved crops'],
            ['founder', 'Founder priority'],
            ['PASS', 'Pass'],
            ['FAIL', 'Fail'],
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
        <h2 style={{ fontSize: 13, marginBottom: 8 }}>Labeled source (canonical catalog — unchanged)</h2>
        <img
          src={sourceUrl}
          alt="Experience Lab labeled icon source sheet"
          style={{ maxWidth: '100%', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8 }}
        />
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 13, marginBottom: 8 }}>v3 generated contact sheet (preview glyphs)</h2>
        <img
          src={contactSheetUrl}
          alt="v3 crop preview contact sheet"
          style={{ maxWidth: '100%', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8 }}
        />
      </section>

      <section>
        <h2 style={{ fontSize: 13, marginBottom: 12 }}>
          Per-icon crop validation ({filtered.length}/{EXPERIENCE_LAB_ICON_NAMES.length})
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
            const crop = StudioWorldIconCropManifest[name];
            const asset = resolveQaExperienceLabIconAsset(name);
            const meta = extractionMetadata.icons.find((i) => i.key === name);
            const statusColor =
              asset.auditStatus === 'PASS'
                ? '#6fcf97'
                : asset.auditStatus === 'FAIL'
                  ? '#eb5757'
                  : '#f2c94c';

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
                  <div style={{ position: 'relative' }}>
                    <div style={sourceCellStyle(entry.row, entry.column)} title="Source cell" />
                    <div style={cropOverlayStyle(name)} />
                  </div>
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
                      <span style={{ fontSize: 8, color: '#666' }}>pending</span>
                    )}
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
                    title="Production runtime (fail-closed)"
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
                  {asset.auditStatus} · {asset.source} · approved {crop.approved ? 'yes' : 'no'}
                </div>
                <div style={{ fontSize: 8, color: '#6a958c' }}>
                  crop {crop.cropX},{crop.cropY} {crop.cropWidth}×{crop.cropHeight} · in cell{' '}
                  {isCropInsideCell(crop) ? 'yes' : 'NO'}
                </div>
                <div style={{ fontSize: 8, color: '#6a958c' }}>
                  pipeline: {String(extractionMetadata.pipeline ?? 'v3')} · generated:{' '}
                  {meta && 'generated' in meta && meta.generated ? 'yes' : 'preview'}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
