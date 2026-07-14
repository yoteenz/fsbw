import { useProgramContext } from '../ProgramContextProvider';

/** Industry Pack generation selector — registry-driven. */
export function IndustryPackSelector() {
  const { state, industryPacks, setIndustryPack } = useProgramContext();

  if (state.programId !== 'industry-packs') return null;

  return (
    <label className="elab-cmd__pipeline-field">
      <span className="elab-cmd__pipeline-label">INDUSTRY PACK</span>
      <select
        className="elab-cmd__pipeline-select"
        value={state.industryPackId ?? ''}
        aria-label="Industry pack"
        onChange={(e) => setIndustryPack(e.target.value)}
      >
        {industryPacks.map((pack) => (
          <option key={pack.id} value={pack.id}>
            {pack.label}
          </option>
        ))}
      </select>
    </label>
  );
}
