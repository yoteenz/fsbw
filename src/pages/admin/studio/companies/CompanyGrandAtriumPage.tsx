import { DepartmentGoldenBuildShell } from '../../../../components/admin/studio-os/department-vertical-slice/DepartmentGoldenBuildShell';
import { ExecutiveHeadquartersWorkspace } from '../../../../components/admin/studio/executive-headquarters';
import { useRequireAdminPageAccess } from '../../../../hooks/useRequireAdminPageAccess';

/**
 * Company-scoped Grand Atrium™ — mounts Executive Headquarters™ at
 * `/admin/studio/companies/:companySlug/grand-atrium` without importing
 * the standalone executive-headquarters page (avoids circular chunk deps).
 */
export default function CompanyGrandAtriumPage() {
  useRequireAdminPageAccess();

  return (
    <DepartmentGoldenBuildShell>
      <ExecutiveHeadquartersWorkspace />
    </DepartmentGoldenBuildShell>
  );
}
