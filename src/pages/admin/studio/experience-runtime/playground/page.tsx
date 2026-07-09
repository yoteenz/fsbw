import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { ExperienceRuntime } from '../../../../../studio-os-core/experience-runtime';
import { useRequireAdminPageAccess } from '../../../../../hooks/useRequireAdminPageAccess';

const SUBTITLE =
  'Experience Runtime™ Phase 1 playground — assembles scenes from BrandRegistry™, SceneRegistry™, and Design DNA template metadata. Does not modify live Executive Headquarters.';

/**
 * `/admin/studio/experience-runtime/playground`
 */
export default function AdminStudioExperienceRuntimePlaygroundPage() {
  useRequireAdminPageAccess();
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="EXPERIENCE RUNTIME™"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/design-dna')}
      navGroupId="intelligence"
    >
      <ExperienceRuntime />
      <AdminStudioDisclaimerFooter>
        EXPERIENCE RUNTIME™ PHASE 1 · PLAYGROUND ONLY · LIVE EXECUTIVE HQ UNCHANGED
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
