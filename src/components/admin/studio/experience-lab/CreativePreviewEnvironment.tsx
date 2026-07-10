import type { CSSProperties } from 'react';
import type {
  CreativePreviewCompanyId,
  PreviewArchitectureArchetype,
  PreviewSpecification,
} from '../../../../studio-os-core/creative-studio-preview';
import { resolveBrandDna } from '../../../../studio-os-core/creative-studio-preview';

type Props = {
  companyId: CreativePreviewCompanyId;
  archetype: PreviewArchitectureArchetype;
  specification: PreviewSpecification;
};

/** Structural environment preview — no logos, architecture-first differentiation. */
export function CreativePreviewEnvironment({ companyId, archetype, specification }: Props) {
  const brand = resolveBrandDna(companyId);
  const primary = brand?.colorSystem.primary ?? '#EB1C24';
  const bg = brand?.colorSystem.background ?? '#F8F6F3';
  const text = brand?.colorSystem.textPrimary ?? '#1A1A1A';
  const accent = brand?.colorSystem.accent ?? '#C9A962';

  return (
    <div
      data-creative-preview-environment
      data-company={companyId}
      data-archetype={archetype}
      style={{
        ...shellStyle,
        background: brand?.lighting.ambientGradient ?? bg,
        color: text,
        borderColor: `${primary}33`,
      }}
    >
      <div style={{ ...labelStrip, color: primary }}>ENVIRONMENT PROPOSAL — NO LOGOS</div>

      {archetype === 'institutional-crystal' ? (
        <InstitutionalCrystalLayout primary={primary} accent={accent} spec={specification} />
      ) : null}
      {archetype === 'luxury-mansion' ? (
        <LuxuryMansionLayout primary={primary} accent={accent} spec={specification} />
      ) : null}
      {archetype === 'broadcast-command' ? (
        <BroadcastCommandLayout primary={primary} accent={accent} spec={specification} />
      ) : null}

      <p style={{ margin: '12px 0 0', fontSize: '10px', opacity: 0.75, lineHeight: 1.5 }}>
        {specification.environmentalMood}
      </p>
    </div>
  );
}

function InstitutionalCrystalLayout({
  primary,
  accent,
  spec,
}: {
  primary: string;
  accent: string;
  spec: PreviewSpecification;
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 8, minHeight: 200 }}>
      <div style={wingCell(primary, '15%')}>
        <span style={cellLabel}>WING</span>
        <span style={cellTitle}>Knowledge</span>
      </div>
      <div style={{ ...centerCell, borderColor: `${accent}55` }}>
        <div style={{ ...crystalGrid, borderColor: accent }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ ...crystalTile, background: `${primary}${12 + i * 4}` }} />
          ))}
        </div>
        <span style={{ ...cellTitle, marginTop: 8 }}>GRAND ATRIUM</span>
        <span style={{ fontSize: '9px', opacity: 0.7 }}>{spec.spatialOrganization.split('→')[0]?.trim()}</span>
      </div>
      <div style={wingCell(primary, '15%')}>
        <span style={cellLabel}>WING</span>
        <span style={cellTitle}>Command</span>
      </div>
      <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 6, marginTop: 4 }}>
        {spec.materialSystem.slice(0, 4).map((m: string) => (
          <span key={m} style={{ ...materialChip, borderColor: `${primary}44` }}>
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}

function LuxuryMansionLayout({
  primary,
  accent,
  spec,
}: {
  primary: string;
  accent: string;
  spec: PreviewSpecification;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 200 }}>
      <div style={{ display: 'flex', gap: 8, flex: 1 }}>
        <div style={{ ...corridor, borderColor: `${primary}33`, flex: 2 }}>
          <span style={cellLabel}>CORRIDOR</span>
          <span style={cellTitle}>Concierge Arrival</span>
        </div>
        <div
          style={{
            ...mirrorWall,
            borderColor: accent,
            boxShadow: `inset 0 0 40px ${primary}22`,
          }}
        >
          <span style={cellLabel}>MIRROR WALL</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {['Salon', 'Lab', 'Gallery'].map((room) => (
          <div key={room} style={{ ...roomCell, borderColor: `${primary}28`, flex: 1 }}>
            <span style={{ fontSize: '9px', fontWeight: 700 }}>{room}</span>
          </div>
        ))}
      </div>
      <span style={{ fontSize: '9px', opacity: 0.7 }}>{spec.interiorArchitecture.slice(0, 90)}…</span>
    </div>
  );
}

function BroadcastCommandLayout({
  primary,
  accent,
  spec,
}: {
  primary: string;
  accent: string;
  spec: PreviewSpecification;
}) {
  return (
    <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr auto', gap: 8, minHeight: 200 }}>
      <div style={{ ...tickerBar, background: `${primary}33`, color: accent }}>
        SIGNAL TICKER — {spec.signatureExperiences[0]?.slice(0, 40)}…
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 8 }}>
        <div style={{ ...darkPanel, borderColor: `${primary}44` }}>
          <span style={cellLabel}>STORY MAP</span>
        </div>
        <div style={{ ...darkPanel, borderColor: accent }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, height: '100%' }}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ background: `${primary}${20 + i * 8}`, borderRadius: 4, minHeight: 28 }} />
            ))}
          </div>
          <span style={{ ...cellTitle, marginTop: 6, color: '#F8FAFC' }}>COMMAND DESK</span>
        </div>
        <div style={{ ...darkPanel, borderColor: `${primary}44` }}>
          <span style={cellLabel}>PRODUCER</span>
        </div>
      </div>
      <span style={{ fontSize: '9px', opacity: 0.65, color: '#94A3B8' }}>
        {spec.spatialOrganization}
      </span>
    </div>
  );
}

const shellStyle: CSSProperties = {
  borderRadius: 12,
  border: '1px solid',
  padding: 16,
  minHeight: 260,
};

const labelStrip: CSSProperties = {
  fontSize: '9px',
  fontWeight: 800,
  letterSpacing: '0.12em',
  marginBottom: 12,
};

const cellLabel: CSSProperties = {
  display: 'block',
  fontSize: '8px',
  letterSpacing: '0.1em',
  opacity: 0.6,
  marginBottom: 4,
};

const cellTitle: CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 700,
};

const wingCell = (primary: string, alpha: string): CSSProperties => ({
  borderRadius: 8,
  border: `1px solid ${primary}33`,
  background: `${primary}${alpha}`,
  padding: 10,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
});

const centerCell: CSSProperties = {
  borderRadius: 8,
  border: '2px solid',
  padding: 12,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(255,255,255,0.4)',
};

const crystalGrid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 6,
  padding: 8,
  border: '1px dashed',
  borderRadius: 8,
  width: '80%',
};

const crystalTile: CSSProperties = {
  height: 28,
  borderRadius: 4,
};

const materialChip: CSSProperties = {
  fontSize: '8px',
  padding: '4px 8px',
  borderRadius: 99,
  border: '1px solid',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
};

const corridor: CSSProperties = {
  borderRadius: 8,
  border: '1px solid',
  padding: 12,
  background: 'rgba(255,255,255,0.5)',
};

const mirrorWall: CSSProperties = {
  flex: 1,
  borderRadius: 8,
  border: '2px solid',
  minHeight: 80,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(245,230,211,0.4))',
};

const roomCell: CSSProperties = {
  borderRadius: 6,
  border: '1px solid',
  padding: 8,
  textAlign: 'center',
  background: 'rgba(255,255,255,0.55)',
};

const tickerBar: CSSProperties = {
  fontSize: '9px',
  fontWeight: 700,
  letterSpacing: '0.08em',
  padding: '6px 10px',
  borderRadius: 4,
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
};

const darkPanel: CSSProperties = {
  borderRadius: 8,
  border: '1px solid',
  padding: 10,
  background: 'rgba(15,23,42,0.85)',
  minHeight: 90,
};
