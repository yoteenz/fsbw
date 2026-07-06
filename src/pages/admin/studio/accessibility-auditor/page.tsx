import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { AccessibilityAuditorWorkspace } from '../../../../components/admin/studio/accessibility-auditor/AccessibilityAuditorWorkspace';

const SUBTITLE =
  'Accessibility Auditor™ — continuously evaluates Studio OS to ensure every experience remains inclusive, understandable, and usable by the widest range of people possible.';

export default function AdminStudioAccessibilityAuditorPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="ACCESSIBILITY AUDITOR™"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/visual-diff-engine')}
      navGroupId="intelligence"
    >
      <AccessibilityAuditorWorkspace />
      <AdminStudioDisclaimerFooter>
        ACCESSIBILITY AUDITOR™ V1.0 · M158 · INCLUSIVE DESIGN IS PREMIUM DESIGN · ACCESSIBILITY FEELS INVISIBLE
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
