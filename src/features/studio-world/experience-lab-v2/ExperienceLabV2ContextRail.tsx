import type { ExperienceLabProgram } from '../../../studio-os-core/canonical-studio-world/experience-lab-program';

type Props = {
  program: ExperienceLabProgram;
  healthState: string;
  onProgramChange?: (p: ExperienceLabProgram) => void;
};

export function ExperienceLabV2ContextRail({ program, healthState, onProgramChange }: Props) {
  return (
    <nav className="elab-v2__mode-rail" aria-label="Experience Lab context" data-elab-context-rail>
      <button
        type="button"
        className="elab-v2__mode-btn"
        aria-pressed={program === 'studio-world'}
        onClick={() => onProgramChange?.('studio-world')}
      >
        BUILD STUDIO WORLD
      </button>
      <button
        type="button"
        className="elab-v2__mode-btn"
        aria-pressed={program === 'industry-packs'}
        onClick={() => onProgramChange?.('industry-packs')}
      >
        INDUSTRY PACKS
      </button>
      <span className="elab-v2__mode-btn" style={{ cursor: 'default', opacity: 0.85 }}>
        Health: {healthState}
      </span>
    </nav>
  );
}
