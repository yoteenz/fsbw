import { useNavigate } from 'react-router-dom';
import { useDecisionAuditState } from '../../../../hooks/useDecisionAuditState';
import { DECISION_AUDIT_ACCENT } from '../../../../studio-os-core/decision-audit';
import { adminStudioDecisionAuditPath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — Decision Audit™ preview (M151). */
export function MissionControlDecisionAuditPanel() {
  const navigate = useNavigate();
  const { profile } = useDecisionAuditState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="DECISION AUDIT™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>DECISION RECORDS LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  return (
    <ExecutiveSecondaryCard title="DECISION AUDIT™ · PERMANENT ACCOUNTABILITY">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.accountabilityScore} size={52} label="DA" accent={DECISION_AUDIT_ACCENT} />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.totalDecisions} DECISIONS · {profile.explainableDecisions} EXPLAINABLE
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>
            Never a black box · every decision accountable
          </p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.dockDecisionAuditLine.slice(0, 110)}…
      </p>
      <button type="button" onClick={() => navigate(adminStudioDecisionAuditPath())} style={eiaActionBtn}>
        OPEN DECISION AUDIT →
      </button>
    </ExecutiveSecondaryCard>
  );
}
