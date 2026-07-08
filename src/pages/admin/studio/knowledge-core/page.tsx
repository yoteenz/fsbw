import { useEffect } from 'react';
import { DepartmentGoldenBuildShell } from '../../../../components/admin/studio-os/department-vertical-slice/DepartmentGoldenBuildShell';
import { KnowledgeCoreRoom } from '../../../../components/admin/studio/knowledge-core/KnowledgeCoreRoom';

/**
 * Knowledge Core Observatory™ — Studio World's canonical intelligence repository.
 * Not documentation. Institutional memory.
 */
export default function AdminStudioKnowledgeCorePage() {
  useEffect(() => {
    document.body.classList.add('knowledge-core-active');
    return () => document.body.classList.remove('knowledge-core-active');
  }, []);

  return (
    <DepartmentGoldenBuildShell>
      <KnowledgeCoreRoom />
    </DepartmentGoldenBuildShell>
  );
}
