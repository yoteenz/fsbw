import type { CSSProperties } from 'react';
import type { ExperienceLabIndustryPackOption, ExperienceLabIndustryPackOptionId } from '../../../../studio-os-core/canonical-studio-world';

const btnStyle: CSSProperties = {
  padding: '8px 12px',
  margin: '4px 4px 4px 0',
  border: '1px solid #333',
  background: '#fff',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: '11px',
};

type Props = {
  packOptionId: ExperienceLabIndustryPackOptionId;
  options: ExperienceLabIndustryPackOption[];
  onSelect: (id: ExperienceLabIndustryPackOptionId) => void;
};

/** Studio World Registry — Industry Pack selection (replaces company switcher). */
export function IndustryPackSelector({ packOptionId, options, onSelect }: Props) {
  return (
    <section style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }} data-studio-world-registry>
      <p style={{ margin: '0 0 8px', fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em', color: '#eb1c24' }}>
        STUDIO WORLD REGISTRY™ — INDUSTRY PACK
      </p>
      <p style={{ margin: '0 0 12px', fontSize: '11px', color: '#555' }}>
        Select an Industry Pack template. Canonical departments are global — your company customizes the HQ layer only.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {options.map((opt) => (
          <button
            key={opt.optionId}
            type="button"
            style={{
              ...btnStyle,
              fontWeight: packOptionId === opt.optionId ? 800 : 400,
              borderColor: packOptionId === opt.optionId ? '#eb1c24' : '#333',
            }}
            onClick={() => onSelect(opt.optionId)}
          >
            {opt.displayName}
          </button>
        ))}
      </div>
    </section>
  );
}
