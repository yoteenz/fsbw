import { useMemo } from 'react';
import type { ProductionDepartmentId, ProductionDepartmentStatus } from '../studio-os-core/content-pipeline/departments';
import type { NdxbookPage } from '../studio-os-core/ndxbook/types';
import { resolveProject001Dashboard } from '../studio-os-core/studio-project';

export function useStudioProjectDashboard(
  page: NdxbookPage | null,
  activeDepartment: ProductionDepartmentId,
  departmentStatuses: Record<ProductionDepartmentId, ProductionDepartmentStatus>
) {
  return useMemo(
    () => resolveProject001Dashboard({ page, activeDepartment, departmentStatuses }),
    [page, activeDepartment, departmentStatuses]
  );
}
