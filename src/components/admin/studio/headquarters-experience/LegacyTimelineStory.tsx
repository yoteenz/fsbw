import { HQ, hqGrace, hqBody, hqLabel } from './hqExperienceTheme';
import { HqGlassSurface } from './HqWingZone';

export type LegacyMilestone = {
  id: string;
  label: string;
  description: string;
  recordedAt: string;
  detail?: string;
};

type Props = {
  milestones: LegacyMilestone[];
  accentHex?: string;
};

/** Legacy Timeline™ — permanent organizational story, not a changelog. */
export function LegacyTimelineStory({ milestones, accentHex = HQ.red }: Props) {
  if (milestones.length === 0) {
    return (
      <HqGlassSurface>
        <p style={{ ...hqLabel, color: accentHex, margin: 0 }}>LEGACY TIMELINE™</p>
        <p style={{ ...hqGrace, fontSize: '14px', marginTop: 12 }}>Your story begins today.</p>
        <p style={{ ...hqBody, color: HQ.gray, marginTop: 8 }}>Studio OS remembers every milestone — permanently.</p>
      </HqGlassSurface>
    );
  }

  return (
    <HqGlassSurface>
      <p style={{ ...hqLabel, color: accentHex, margin: 0 }}>LEGACY TIMELINE™</p>
      <p style={{ ...hqBody, fontSize: '7px', color: HQ.gray, marginTop: 4 }}>Permanent history · not a changelog</p>

      <div className="relative mt-6 pl-6">
        <div
          className="absolute left-[7px] top-2 bottom-2"
          style={{ width: 2, background: `linear-gradient(180deg, ${accentHex}, rgba(0,0,0,0.06))` }}
          aria-hidden
        />
        <div className="space-y-4">
          {milestones.map((m, idx) => (
            <div key={`${m.id}-${m.recordedAt}`} className="relative">
              <span
                className="absolute -left-6 top-1 w-3 h-3 rounded-full border-2"
                style={{ background: 'white', borderColor: idx === 0 ? accentHex : HQ.gray }}
                aria-hidden
              />
              <p style={{ ...hqGrace, fontSize: idx === 0 ? '14px' : '12px', margin: 0 }}>{m.label}</p>
              <p style={{ ...hqBody, fontSize: '7px', marginTop: 4 }}>{m.description}</p>
              <p style={{ ...hqLabel, fontSize: '5px', marginTop: 4 }}>
                {new Date(m.recordedAt).toLocaleDateString()}
                {m.detail ? ` · ${m.detail}` : ''}
              </p>
            </div>
          ))}
        </div>
      </div>
    </HqGlassSurface>
  );
}
