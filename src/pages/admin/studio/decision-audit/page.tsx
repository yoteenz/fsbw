import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { DecisionAuditWorkspace } from '../../../../components/admin/studio/decision-audit/DecisionAuditWorkspace';

const SUBTITLE =
  'Decision Audit™ — permanent record of every significant recommendation, approval, rejection, automation, and AI decision. Never wonder why something happened.';

export default function AdminStudioDecisionAuditPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="DECISION AUDIT™"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/self-healing-engine')}
      navGroupId="intelligence"
    >
      <DecisionAuditWorkspace />
      <AdminStudioDisclaimerFooter>
        DECISION AUDIT™ V1.0 · M151 · PERMANENT ACCOUNTABILITY · NEVER A BLACK BOX
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
