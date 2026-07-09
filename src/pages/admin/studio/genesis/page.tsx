import { useEffect } from 'react';
import { DepartmentGoldenBuildShell } from '../../../../components/admin/studio-os/department-vertical-slice/DepartmentGoldenBuildShell';
import { GenesisWorkspace } from '../../../../components/admin/studio/genesis/GenesisWorkspace';

/** Genesis Foundation Framework™ — canonical source infrastructure. */
export default function AdminStudioGenesisPage() {
  useEffect(() => {
    document.body.classList.add('genesis-active');
    return () => document.body.classList.remove('genesis-active');
  }, []);

  return (
    <DepartmentGoldenBuildShell>
      <GenesisWorkspace />
    </DepartmentGoldenBuildShell>
  );
}
