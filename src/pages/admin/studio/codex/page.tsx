import { useEffect } from 'react';
import { DepartmentGoldenBuildShell } from '../../../../components/admin/studio-os/department-vertical-slice/DepartmentGoldenBuildShell';
import { CodexWorkspace } from '../../../../components/admin/studio/codex/CodexWorkspace';

/**
 * Studio World Codex™ — living constitutional memory platform.
 */
export default function AdminStudioCodexPage() {
  useEffect(() => {
    document.body.classList.add('studio-world-codex-active');
    return () => document.body.classList.remove('studio-world-codex-active');
  }, []);

  return (
    <DepartmentGoldenBuildShell>
      <CodexWorkspace />
    </DepartmentGoldenBuildShell>
  );
}
