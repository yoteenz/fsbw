import { useProgramContext } from '../ProgramContextProvider';

/** Environment selector — feeds Design Variants downstream pipeline. */
export function EnvironmentSelector() {
  const { state, studioEnvironments, industryEnvironments, setEnvironment } = useProgramContext();

  const environments =
    state.programId === 'studio-world' ? studioEnvironments : industryEnvironments;

  if (environments.length === 0) return null;

  return (
    <label className="elab-cmd__pipeline-field">
      <span className="elab-cmd__pipeline-label">ENVIRONMENT</span>
      <select
        className="elab-cmd__pipeline-select"
        value={state.environmentId ?? ''}
        aria-label="Environment"
        onChange={(e) => setEnvironment(e.target.value)}
      >
        {environments.map((env) => (
          <option key={env.id} value={env.id}>
            {env.label}
          </option>
        ))}
      </select>
    </label>
  );
}
