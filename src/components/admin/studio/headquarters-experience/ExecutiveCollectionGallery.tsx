import type { ExecutiveArtifact } from '../../../../studio-os-core/living-headquarters';
import { ARTIFACT_ICONS } from './livingHeadquartersTheme';
import { HQ, hqBody, hqLabel } from './hqExperienceTheme';

type Props = {
  artifacts: ExecutiveArtifact[];
  accentHex?: string;
};

/** Executive Collection™ — earned physical artifacts displayed in Headquarters. */
export function ExecutiveCollectionGallery({ artifacts, accentHex = HQ.red }: Props) {
  if (artifacts.length === 0) return null;

  return (
    <div style={{ marginTop: 14 }}>
      <p style={{ ...hqLabel, color: accentHex, margin: 0 }}>THE EXECUTIVE COLLECTION™</p>
      <p style={{ ...hqBody, fontSize: '7px', color: HQ.gray, marginTop: 4 }}>
        Organizational history · not rewards
      </p>
      <div className="living-hq-collection mt-2">
        {artifacts.slice(0, 6).map((a) => (
          <div key={a.id} className="living-hq-artifact" title={a.description}>
            <div className="living-hq-artifact-icon" style={{ color: accentHex }} aria-hidden>
              {ARTIFACT_ICONS[a.kind] ?? '◆'}
            </div>
            <p
              style={{
                fontFamily: '"Futura PT Medium"',
                fontSize: '6px',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: HQ.black,
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {a.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
