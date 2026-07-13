import type { CSSProperties } from 'react';
import type { ExperienceLabProgram } from '../../../../studio-os-core/canonical-studio-world/experience-lab-program';
import { EXPERIENCE_LAB_PROGRAMS } from '../../../../studio-os-core/canonical-studio-world/experience-lab-program';

const btnStyle = (active: boolean): CSSProperties => ({
  padding: '12px 16px',
  margin: '0 8px 0 0',
  border: active ? '2px solid #eb1c24' : '1px solid #333',
  background: active ? '#fff' : '#f9fafb',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: '11px',
  fontWeight: active ? 800 : 500,
  textAlign: 'left' as const,
  flex: 1,
  minWidth: 140,
});

type Props = {
  program: ExperienceLabProgram;
  onSelect: (program: ExperienceLabProgram) => void;
};

/** Program A vs Program B — canonical infrastructure vs Industry Packs. */
export function ExperienceLabProgramSelector({ program, onSelect }: Props) {
  return (
    <section style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }} data-experience-lab-program-selector>
      <p style={{ margin: '0 0 8px', fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em', color: '#eb1c24' }}>
        PROGRAM SELECTOR
      </p>
      <p style={{ margin: '0 0 12px', fontSize: '11px', color: '#555' }}>
        Two separate administrative creation programs. Canonical main departments are not Industry Packs.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {EXPERIENCE_LAB_PROGRAMS.map((def) => (
          <button
            key={def.programId}
            type="button"
            style={btnStyle(program === def.programId)}
            onClick={() => onSelect(def.programId)}
          >
            <span style={{ display: 'block', fontWeight: 800, marginBottom: 4 }}>{def.title}</span>
            <span style={{ display: 'block', color: '#666', fontSize: '10px' }}>{def.subtitle}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
