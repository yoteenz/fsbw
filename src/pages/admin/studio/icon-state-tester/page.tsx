import { useRequireStudioWorldAdmin } from '../../../../hooks/useRequireStudioWorldAdmin';
import { IconStateTesterShell } from '../../../../features/studio-world/icons/icon-state-engine';

/** QA — Live State Tester for Icon State Engine. */
export default function AdminIconStateTesterPage() {
  useRequireStudioWorldAdmin();
  return <IconStateTesterShell />;
}
