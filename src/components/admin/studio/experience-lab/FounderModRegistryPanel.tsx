import type { CSSProperties } from 'react';
import {
  listFounderModsForOrganization,
  FRONTAL_SLAYER_ORG_ID,
} from '../../../../studio-os-core/founder-mods';

const sectionStyle: CSSProperties = {
  padding: '16px',
  borderBottom: '1px solid #e5e7eb',
  fontFamily: 'system-ui, sans-serif',
  fontSize: '12px',
};

const badgeStyle: CSSProperties = {
  fontSize: '9px',
  fontWeight: 800,
  letterSpacing: '0.06em',
  padding: '2px 6px',
  borderRadius: 4,
  background: '#111',
  color: '#fff',
  marginLeft: 8,
};

/** Frontal Slayer founder mods — separate from official Industry Pack defaults. */
export function FounderModRegistryPanel() {
  const mods = listFounderModsForOrganization(FRONTAL_SLAYER_ORG_ID);

  return (
    <section style={sectionStyle} data-founder-mod-registry>
      <p style={{ margin: '0 0 8px', fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em', color: '#eb1c24' }}>
        FRONTAL SLAYER HQ — FOUNDER MODS
      </p>
      <p style={{ margin: '0 0 12px', fontSize: '11px', color: '#555' }}>
        Founder-created scenes — not official Industry Pack defaults. Base pack lineage preserved.
      </p>
      <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.9 }}>
        {mods.map((mod) => (
          <li key={mod.customSceneId}>
            <strong>{mod.displayName}</strong>
            <span style={badgeStyle}>FOUNDER MOD</span>
            <span style={{ color: '#64748b', fontSize: '10px' }}>
              {' '}
              · Custom by Frontal Slayer · {mod.publicationStatus} · base {mod.sourceIndustryPackId}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
