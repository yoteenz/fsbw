import { useEffect } from 'react';
import { DepartmentGoldenBuildShell } from '../../../../components/admin/studio-os/department-vertical-slice/DepartmentGoldenBuildShell';
import { StudioWorldAtlasRoom } from '../../../../components/admin/studio/world-atlas/StudioWorldAtlasRoom';

/**
 * Mission Control™ — living holographic civilization on the Atlas Table™.
 * Primary spatial nervous system for Studio World™ (Article-K20: The World Is The Interface™).
 */
export default function AdminStudioWorldAtlasPage() {
  useEffect(() => {
    document.body.classList.add('studio-world-atlas-active');
    return () => document.body.classList.remove('studio-world-atlas-active');
  }, []);

  return (
    <DepartmentGoldenBuildShell>
      <StudioWorldAtlasRoom />
    </DepartmentGoldenBuildShell>
  );
}
