import { useEffect } from 'react';
import { DepartmentGoldenBuildShell } from '../../../../components/admin/studio-os/department-vertical-slice/DepartmentGoldenBuildShell';
import { StudioWorldAtlasRoom } from '../../../../components/admin/studio/world-atlas/StudioWorldAtlasRoom';

/**
 * Studio World Atlas™ — living holographic blueprint in Executive Atrium™.
 * Primary spatial navigation for Studio World™ (not a sitemap or sidebar).
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
