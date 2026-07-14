import { listStudioWorldDepartments } from '../experience-lab-v2-department-registry';
import type { StudioWorldDepartmentId } from '../experience-lab-v2-department-registry';
import { useProgramContext } from '../ProgramContextProvider';

/** Studio World department generation selector — data-driven registry. */
export function DepartmentSelector() {
  const { state, setStudioDepartment } = useProgramContext();
  const departments = listStudioWorldDepartments();

  if (state.programId !== 'studio-world') return null;

  return (
    <label className="elab-cmd__pipeline-field">
      <span className="elab-cmd__pipeline-label">DEPARTMENT</span>
      <select
        className="elab-cmd__pipeline-select"
        value={state.studioDepartmentId ?? ''}
        aria-label="Studio World department"
        onChange={(e) => setStudioDepartment(e.target.value as StudioWorldDepartmentId)}
      >
        {departments.map((dept) => (
          <option key={dept.id} value={dept.id}>
            {dept.label}
          </option>
        ))}
      </select>
    </label>
  );
}
