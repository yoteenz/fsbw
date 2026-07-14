import { useRequireStudioWorldAdmin } from '../../../../hooks/useRequireStudioWorldAdmin';
import { IconStateMatrixShell } from '../../../../features/studio-world/icons/icon-state-engine';

/** QA — Icon State Matrix regression previews. */
export default function AdminIconStateMatrixPage() {
  useRequireStudioWorldAdmin();
  return <IconStateMatrixShell />;
}
