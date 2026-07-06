import type { LegacyWallEntry } from '../../../../studio-os-core/living-headquarters';
import { HQ, hqBody, hqGrace, hqLabel } from './hqExperienceTheme';

type Props = {
  entries: LegacyWallEntry[];
  accentHex?: string;
  atmosphereLabel?: string;
};

/** Legacy Wall™ — permanent engraved organizational history inside Headquarters. */
export function LegacyWallFeature({ entries, accentHex = HQ.gold, atmosphereLabel }: Props) {
  if (entries.length === 0) return null;

  return (
    <div className="living-hq-legacy-wall">
      <p style={{ ...hqLabel, color: accentHex, margin: 0 }}>THE LEGACY WALL™</p>
      <p style={{ ...hqBody, fontSize: '7px', color: HQ.gray, marginTop: 4 }}>
        Permanent museum · every achievement engraved
        {atmosphereLabel ? ` · ${atmosphereLabel}` : ''}
      </p>

      <div className="mt-4 max-h-48 overflow-y-auto">
        {entries.slice(0, 12).map((entry, idx) => (
          <div key={entry.id} className="living-hq-legacy-engraving">
            <p style={{ ...hqGrace, fontSize: idx === 0 ? '13px' : '11px', margin: 0, color: HQ.black }}>
              {entry.label}
            </p>
            {entry.detail ? (
              <p style={{ ...hqBody, fontSize: '7px', marginTop: 3, color: HQ.gray }}>{entry.detail}</p>
            ) : null}
            <p style={{ ...hqLabel, fontSize: '5px', marginTop: 4, color: accentHex }}>
              {new Date(entry.engravedAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
              {' · '}
              {entry.category.replace('-', ' ').toUpperCase()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
