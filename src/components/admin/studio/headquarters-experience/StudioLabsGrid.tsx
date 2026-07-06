import type { ReactNode } from 'react';
import { HQ, hqBody, hqLabel } from './hqExperienceTheme';
import { HqGlassSurface } from './HqWingZone';

export type LabExperimentCard = {
  id: string;
  name: string;
  status: string;
  leader?: string;
  confidencePct?: number;
};

type Props = {
  experiments: LabExperimentCard[];
  emptyMessage?: string;
  footer?: ReactNode;
  accentHex?: string;
};

/** Studio Labs — floating glass experiment prototypes. */
export function StudioLabsGrid({ experiments, emptyMessage, footer, accentHex = HQ.red }: Props) {
  if (experiments.length === 0) {
    return (
      <HqGlassSurface>
        <p style={{ ...hqLabel, color: accentHex, margin: 0 }}>STUDIO LABS</p>
        <p style={{ ...hqBody, color: HQ.gray, marginTop: 12 }}>{emptyMessage ?? 'Premium innovation lab · experiments appear as you grow.'}</p>
        {footer}
      </HqGlassSurface>
    );
  }

  return (
    <HqGlassSurface>
      <p style={{ ...hqLabel, color: accentHex, margin: 0 }}>STUDIO LABS</p>
      <p style={{ ...hqBody, fontSize: '7px', color: HQ.gray, marginTop: 4 }}>Active research · floating prototypes</p>
      <div className="grid grid-cols-1 gap-3 mt-4 sm:grid-cols-2">
        {experiments.map((exp) => (
          <div
            key={exp.id}
            className="p-3 rounded-lg"
            style={{
              background: 'rgba(255,255,255,0.45)',
              border: exp.status === 'active' ? `1px solid ${accentHex}33` : '1px solid rgba(0,0,0,0.06)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
              transform: 'translateY(0)',
            }}
          >
            <p style={{ ...hqLabel, fontSize: '5px', color: accentHex }}>{exp.status.toUpperCase()}</p>
            <p style={{ ...hqBody, fontFamily: '"Futura PT Medium"', fontSize: '8px', marginTop: 6 }}>{exp.name}</p>
            {exp.leader ? <p style={{ ...hqBody, fontSize: '7px', color: HQ.gray, marginTop: 4 }}>LEADER · {exp.leader}</p> : null}
            {typeof exp.confidencePct === 'number' ? (
              <p style={{ ...hqLabel, fontSize: '5px', marginTop: 6 }}>{exp.confidencePct}% CONFIDENCE</p>
            ) : null}
          </div>
        ))}
      </div>
      {footer ? <div className="mt-4">{footer}</div> : null}
    </HqGlassSurface>
  );
}
