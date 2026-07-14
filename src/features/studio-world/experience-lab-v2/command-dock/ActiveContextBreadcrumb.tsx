import { useProgramContext } from '../ProgramContextProvider';

/** Informational active context — not navigation. */
export function ActiveContextBreadcrumb() {
  const { breadcrumb } = useProgramContext();

  return (
    <p className="elab-cmd__breadcrumb" aria-label="Active generation context">
      {breadcrumb.display}
    </p>
  );
}
