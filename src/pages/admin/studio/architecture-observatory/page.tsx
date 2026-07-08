import { useEffect } from 'react';
import { DepartmentGoldenBuildShell } from '../../../../components/admin/studio-os/department-vertical-slice/DepartmentGoldenBuildShell';
import { ArchitectureObservatoryRoom } from '../../../../components/admin/studio/architecture-observatory/ArchitectureObservatoryRoom';

/**
 * Architecture Observatory™ — Studio Command Center™ guardian room.
 * Architecture Auditor™ founder-facing mission control (not a dashboard).
 */
export default function AdminStudioArchitectureObservatoryPage() {
  useEffect(() => {
    document.body.classList.add('arch-observatory-active');
    return () => document.body.classList.remove('arch-observatory-active');
  }, []);

  return (
    <DepartmentGoldenBuildShell>
      <ArchitectureObservatoryRoom />
    </DepartmentGoldenBuildShell>
  );
}
