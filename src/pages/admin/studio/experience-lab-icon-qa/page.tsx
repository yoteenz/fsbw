import { useRequireStudioWorldAdmin } from '../../../../hooks/useRequireStudioWorldAdmin';
import {
  ExperienceLabIcon,
  EXPERIENCE_LAB_ICON_ASSETS,
  EXPERIENCE_LAB_ICON_NAMES,
  EXPERIENCE_LAB_ICON_REGISTRY,
  EXPERIENCE_LAB_ICON_SPRITE_CONFIG,
} from '../../../../features/studio-world/icons';
import { resolveExperienceLabIconSourceLabeledUrl } from '../../../../features/studio-world/icons/experience-lab-icon-sprite.config';
import contactSheetUrl from '../../../../assets/studio-world/experience-lab/icons/generated/_contact-sheet.png';

/** Dev/admin QA — compare extracted icons against labeled source catalog. */
export default function AdminExperienceLabIconQaPage() {
  useRequireStudioWorldAdmin();

  const sourceUrl = resolveExperienceLabIconSourceLabeledUrl();

  return (
    <div style={{ padding: 24, background: '#0a0c10', color: '#f0ebe3', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 18, letterSpacing: '0.08em', marginBottom: 8 }}>Experience Lab Icon QA</h1>
      <p style={{ fontSize: 12, color: '#9a958c', marginBottom: 16 }}>
        Extracted transparent PNGs vs labeled source · mode: {EXPERIENCE_LAB_ICON_SPRITE_CONFIG.mode}
      </p>

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
        <h2 style={{ fontSize: 13, marginBottom: 12 }}>Per-icon runtime preview</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: 12,
          }}
        >
          {EXPERIENCE_LAB_ICON_NAMES.map((name) => {
            const entry = EXPERIENCE_LAB_ICON_REGISTRY[name];
            const asset = EXPERIENCE_LAB_ICON_ASSETS[name];
            return (
              <div
                key={name}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  padding: 12,
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    placeItems: 'center',
                    height: 48,
                    marginBottom: 8,
                    background: '#111',
                    borderRadius: 6,
                  }}
                >
                  <ExperienceLabIcon name={name} size="lg" decorative />
                </div>
                <div style={{ fontSize: 10, fontWeight: 700 }}>{entry.sourceLabel}</div>
                <div style={{ fontSize: 9, color: '#9a958c' }}>{name}</div>
                <div style={{ fontSize: 8, color: '#6a958c' }}>
                  conf {(asset.confidence * 100).toFixed(0)}%
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
