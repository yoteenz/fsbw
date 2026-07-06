import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { PredictiveQaWorkspace } from '../../../../components/admin/studio/predictive-qa/PredictiveQaWorkspace';

const SUBTITLE =
  'Predictive QA™ — continuously analyze workflows, brains, automations, customers, and growth signals to identify future operational risks before they occur. Protect the future.';

export default function AdminStudioPredictiveQaPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="PREDICTIVE QA™"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/time-machine')}
      navGroupId="intelligence"
    >
      <PredictiveQaWorkspace />
      <AdminStudioDisclaimerFooter>
        PREDICTIVE QA™ V1.0 · M149 · FUTURE RISK PROTECTION · IDENTIFY TOMORROW&apos;S PROBLEMS TODAY
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
