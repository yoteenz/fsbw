import type { ExperienceLabProgram } from '../experience-lab-v2-program-registry';
import { listExperienceLabV2Programs } from '../experience-lab-v2-program-registry';
import { useProgramContext } from '../ProgramContextProvider';

/** Two-segment program control — BUILD STUDIO WORLD · BUILD INDUSTRY PACKS. */
export function ProgramSelector() {
  const { state, setProgram } = useProgramContext();
  const programs = listExperienceLabV2Programs();

  return (
    <nav className="elab-cmd__locations elab-cmd__locations--programs" aria-label="Studio World programs">
      {programs.map((program) => {
        const active = state.programId === program.programId;
        return (
          <button
            key={program.programId}
            type="button"
            className={`elab-cmd__location-tab elab-cmd__location-tab--program${active ? ' elab-cmd__location-tab--active' : ''}`}
            data-program={program.programId}
            aria-pressed={active}
            onClick={() => setProgram(program.programId as ExperienceLabProgram)}
          >
            <span className="elab-cmd__location-copy">
              <span className="elab-cmd__location-title">{program.title}</span>
            </span>
            {active ? <span className="elab-cmd__location-chev" aria-hidden>›</span> : null}
          </button>
        );
      })}
    </nav>
  );
}
