import type { CSSProperties } from 'react';
import type { ResolvedExperienceRuntime } from './types';

type Props = {
  resolved: ResolvedExperienceRuntime;
};

const sectionTitle: CSSProperties = {
  fontFamily: '"Futura PT Medium", sans-serif',
  fontSize: '9px',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: '#808080',
  margin: '0 0 6px',
};

const valueStyle: CSSProperties = {
  fontFamily: '"Futura PT Book", sans-serif',
  fontSize: '12px',
  color: '#1A1A1A',
  margin: '0 0 14px',
  lineHeight: 1.45,
};

const chipStyle: CSSProperties = {
  display: 'inline-block',
  fontFamily: '"Futura PT Medium", sans-serif',
  fontSize: '8px',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  padding: '3px 8px',
  borderRadius: 2,
  marginRight: 6,
  marginBottom: 6,
};

/**
 * RuntimeInspector™ — diagnostic panel for Experience Runtime™ playground resolution.
 */
export function RuntimeInspector({ resolved }: Props) {
  const { brand, department, scene, template, dnaProfile, input, activeLayers, missingLayers, warnings } =
    resolved;

  return (
    <aside
      className="experience-runtime-inspector"
      style={{
        background: 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(0,0,0,0.1)',
        borderRadius: 12,
        padding: '16px 18px',
        maxHeight: 'min(72vh, 720px)',
        overflowY: 'auto',
      }}
      aria-label="Experience Runtime Inspector"
    >
      <p style={{ ...sectionTitle, color: '#EB1C24', marginBottom: 10 }}>Runtime Inspector™</p>

      <InspectorRow label="Resolved brand" value={`${brand.displayName} (${brand.brandId})`} />
      <InspectorRow label="Resolved department" value={`${department.displayName} → ${department.departmentId}`} />
      <InspectorRow label="Resolved scene" value={`${scene.displayName} (${scene.sceneId})`} />
      <InspectorRow label="Resolved template" value={`${template.officialName} · ${template.templateId}`} />
      <InspectorRow
        label="Active DNA profile"
        value={`${brand.designDnaOfficialName} · designDNA ${input.designDnaVersion} · dept theme ${dnaProfile.departmentTheme.officialName}`}
      />

      <p style={sectionTitle}>Contract input</p>
      <p style={{ ...valueStyle, fontSize: '11px', fontFamily: 'monospace' }}>
        brand={input.brandId} · department={input.departmentSlug} · scene={input.sceneId} · template=
        {input.templateId} · designDNA={input.designDnaVersion}
      </p>

      <p style={sectionTitle}>Active layers ({activeLayers.length})</p>
      <div style={{ marginBottom: 14 }}>
        {activeLayers.map((layer) => (
          <span
            key={layer.slotId}
            style={{
              ...chipStyle,
              background: 'rgba(235,28,36,0.08)',
              color: '#1A1A1A',
              border: '1px solid rgba(235,28,36,0.2)',
            }}
          >
            {layer.label} · z{layer.zIndex}
          </span>
        ))}
      </div>

      <p style={sectionTitle}>Missing layers ({missingLayers.length})</p>
      {missingLayers.length === 0 ? (
        <p style={valueStyle}>None — all playground slots resolved from template metadata.</p>
      ) : (
        <div style={{ marginBottom: 14 }}>
          {missingLayers.map((layer) => (
            <span
              key={layer.slotId}
              style={{
                ...chipStyle,
                background: 'rgba(0,0,0,0.05)',
                color: '#808080',
                border: '1px dashed rgba(0,0,0,0.2)',
              }}
            >
              {layer.label}
            </span>
          ))}
        </div>
      )}

      <p style={sectionTitle}>Warnings ({warnings.length})</p>
      {warnings.length === 0 ? (
        <p style={valueStyle}>No resolution warnings.</p>
      ) : (
        <ul style={{ ...valueStyle, paddingLeft: 18, margin: '0 0 14px' }}>
          {warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      )}

      <p style={sectionTitle}>Template layers (full registry)</p>
      <p style={{ ...valueStyle, fontSize: '11px' }}>
        {template.layers.map((l) => `${l.layerId}@z${l.zIndex}`).join(' · ')}
      </p>
    </aside>
  );
}

function InspectorRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <p style={sectionTitle}>{label}</p>
      <p style={valueStyle}>{value}</p>
    </>
  );
}
