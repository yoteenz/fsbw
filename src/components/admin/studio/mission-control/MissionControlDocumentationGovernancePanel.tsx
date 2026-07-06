import { useNavigate } from 'react-router-dom';
import { useDocumentationGovernanceState } from '../../../../hooks/useDocumentationGovernanceState';
import { DOCUMENTATION_GOVERNANCE_ACCENT } from '../../../../studio-os-core/documentation-governance';
import { adminStudioDocumentationGovernancePath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — Documentation Governance™ preview (M126.5). */
export function MissionControlDocumentationGovernancePanel() {
  const navigate = useNavigate();
  const { profile } = useDocumentationGovernanceState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="DOCUMENTATION GOVERNANCE™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>GOVERNANCE LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  return (
    <ExecutiveSecondaryCard title="DOCUMENTATION GOVERNANCE™ · LIVING DOCS">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.governanceScore} size={52} label="DG" accent={DOCUMENTATION_GOVERNANCE_ACCENT} />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.auditFindings.length} AUDITS · {profile.featuresBelowStandard} BELOW STANDARD
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>
            {profile.preDeployValidation.ready ? 'RELEASE READY' : 'DEPLOYMENT FLAGGED FOR REVIEW'}
          </p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.dockGovernanceLine.slice(0, 100)}…
      </p>
      <button type="button" onClick={() => navigate(adminStudioDocumentationGovernancePath())} style={eiaActionBtn}>
        OPEN DOCUMENTATION GOVERNANCE →
      </button>
    </ExecutiveSecondaryCard>
  );
}
