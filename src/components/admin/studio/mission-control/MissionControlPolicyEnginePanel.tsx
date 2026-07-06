import { useNavigate } from 'react-router-dom';
import { usePolicyEngineState } from '../../../../hooks/usePolicyEngineState';
import { POLICY_ENGINE_ACCENT } from '../../../../studio-os-core/policy-engine';
import { adminStudioPolicyEnginePath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — Policy Engine™ preview (M134). */
export function MissionControlPolicyEnginePanel() {
  const navigate = useNavigate();
  const { profile } = usePolicyEngineState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="POLICY ENGINE™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>ORGANIZATIONAL POLICIES LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  return (
    <ExecutiveSecondaryCard title="POLICY ENGINE™ · ORGANIZATIONAL LAW">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.engineScore} size={52} label="PE" accent={POLICY_ENGINE_ACCENT} />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.activeCount} ACTIVE · {profile.totalPolicies} POLICIES
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>{profile.complianceRatePct}% COMPLIANCE · DEFINE ONCE</p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.dockPolicyLine.slice(0, 100)}…
      </p>
      <button type="button" onClick={() => navigate(adminStudioPolicyEnginePath())} style={eiaActionBtn}>
        OPEN POLICY ENGINE →
      </button>
    </ExecutiveSecondaryCard>
  );
}
