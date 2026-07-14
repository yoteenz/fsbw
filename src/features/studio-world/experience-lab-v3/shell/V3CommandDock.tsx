import { useExperienceLabV3Store } from '../store/ExperienceLabV3Store';
import { ELAB_V3_COMPOSITION } from '../experience-lab-v3-composition';
import { listV3Programs, listV3DepartmentsForProgram } from '../registry/v3-program-registry';
import { ExperienceLabIcon } from '../../icons/ExperienceLabIcon';

/** V2-style command dock — persistent header above the swipeable viewport. */
export function V3CommandDock() {
  const { state, setProgram, setDepartment, dispatch } = useExperienceLabV3Store();
  const programs = listV3Programs();
  const departments = listV3DepartmentsForProgram(state.workspace.programId);
  const { workspace } = state;

  return (
    <header
      className="elab-v3-cmd"
      {...{ [ELAB_V3_COMPOSITION.commandDock]: '' }}
    >
      <div className="elab-v3-cmd__row elab-v3-cmd__row--identity">
        <ExperienceLabIcon name="experienceLab" size="md" decorative />
        <div className="elab-v3-cmd__title-block">
          <span className="elab-v3-cmd__title">EXPERIENCE LAB</span>
          <span className="elab-v3-cmd__subtitle">V3 OPERATING SYSTEM</span>
        </div>
        <div className="elab-v3-cmd__actions">
          <button
            type="button"
            className="elab-v3-cmd__icon-btn"
            aria-label="Search"
            onClick={() => dispatch({ type: 'SET_SPOTLIGHT', open: true })}
          >
            <ExperienceLabIcon name="zoomIn" size="sm" decorative />
          </button>
          <span className="elab-v3-cmd__badge">V3 EXPERIMENTAL</span>
        </div>
      </div>

      <div className="elab-v3-cmd__row elab-v3-cmd__row--programs">
        {programs.map((p) => (
          <button
            key={p.programId}
            type="button"
            className={`elab-v3-cmd__pill${workspace.programId === p.programId ? ' is-active' : ''}`}
            onClick={() => setProgram(p.programId)}
          >
            {p.title}
          </button>
        ))}
      </div>

      <div className="elab-v3-cmd__row elab-v3-cmd__row--pipeline">
        {departments.map((d) => (
          <button
            key={d.id}
            type="button"
            className={`elab-v3-cmd__dept${workspace.departmentId === d.id ? ' is-active' : ''}`}
            onClick={() => setDepartment(d.id)}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="elab-v3-cmd__row elab-v3-cmd__row--breadcrumb">
        <span>{workspace.programId.replace('-', ' ').toUpperCase()}</span>
        <span className="elab-v3-cmd__sep">›</span>
        <span>{workspace.environmentLabel}</span>
        <span className="elab-v3-cmd__sep">›</span>
        <span>{workspace.departmentLabel}</span>
        <span className="elab-v3-cmd__sep">›</span>
        <span>{workspace.variantLabel}</span>
        <span className="elab-v3-cmd__sep">›</span>
        <span>R{workspace.revision}</span>
      </div>

      <div className="elab-v3-cmd__row elab-v3-cmd__row--status">
        <span>STATUS: <strong>{workspace.lifecycleStatus}</strong></span>
        <span className="elab-v3-cmd__status-divider" />
        <span>PACKAGE: <strong>{state.activePackage?.packageId ?? '—'}</strong></span>
        <span className="elab-v3-cmd__status-divider" />
        <span>AI COST (EST.) <strong>${state.operations.todaySpendUsd.toFixed(2)}</strong></span>
      </div>
    </header>
  );
}
