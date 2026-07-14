import { listV3DepartmentsForProgram, listV3Programs } from '../registry/v3-program-registry';
import { useExperienceLabV3Store } from '../store/ExperienceLabV3Store';
import type { ExperienceLabV3ProgramId } from '../experience-lab-v3.types';

/** OS-style program selector — top-level workspace switcher. */
export function V3ProgramSelector() {
  const { state, setProgram, setDepartment } = useExperienceLabV3Store();
  const programs = listV3Programs();
  const departments = listV3DepartmentsForProgram(state.workspace.programId);

  return (
    <div className="elab-v3-program" data-elab-v3-program-selector>
      <div className="elab-v3-program__tabs" role="tablist" aria-label="Programs">
        {programs.map((p) => (
          <button
            key={p.programId}
            type="button"
            role="tab"
            aria-selected={state.workspace.programId === p.programId}
            className={`elab-v3-program__tab${state.workspace.programId === p.programId ? ' is-active' : ''}`}
            onClick={() => setProgram(p.programId as ExperienceLabV3ProgramId)}
          >
            <span className="elab-v3-program__tab-title">{p.title}</span>
            <span className="elab-v3-program__tab-sub">{p.subtitle}</span>
          </button>
        ))}
      </div>
      <div className="elab-v3-program__departments" role="listbox" aria-label="Departments">
        {departments.map((d) => (
          <button
            key={d.id}
            type="button"
            role="option"
            aria-selected={state.workspace.departmentId === d.id}
            className={`elab-v3-program__dept${state.workspace.departmentId === d.id ? ' is-active' : ''}`}
            onClick={() => setDepartment(d.id)}
          >
            {d.label}
          </button>
        ))}
      </div>
    </div>
  );
}
