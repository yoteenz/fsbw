import { DepartmentSelector } from './DepartmentSelector';
import { EnvironmentSelector } from './EnvironmentSelector';
import { IndustryPackSelector } from './IndustryPackSelector';

/** Scope selectors row — department/pack + environment (generation pipeline). */
export function PipelineSelectorRow() {
  return (
    <div className="elab-cmd__pipeline" data-elab-pipeline-selectors>
      <DepartmentSelector />
      <IndustryPackSelector />
      <EnvironmentSelector />
    </div>
  );
}
