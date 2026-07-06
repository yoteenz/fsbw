import { useNavigate } from 'react-router-dom';
import { useAutomationRegistryState } from '../../../../hooks/useAutomationRegistryState';
import { AUTOMATION_REGISTRY_ACCENT } from '../../../../studio-os-core/automation-registry';
import { adminStudioAutomationRegistryPath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — Automation Registry™ preview (M132). */
export function MissionControlAutomationRegistryPanel() {
  const navigate = useNavigate();
  const { profile } = useAutomationRegistryState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="AUTOMATION REGISTRY™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>REGISTERED AUTOMATIONS LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  return (
    <ExecutiveSecondaryCard title="AUTOMATION REGISTRY™ · TRANSPARENT">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.registryScore} size={52} label="AR" accent={AUTOMATION_REGISTRY_ACCENT} />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.activeCount} ACTIVE · {profile.totalAutomations} REGISTERED
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>{profile.avgSuccessRatePct}% SUCCESS · NOTHING HIDDEN</p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.dockRegistryLine.slice(0, 100)}…
      </p>
      <button type="button" onClick={() => navigate(adminStudioAutomationRegistryPath())} style={eiaActionBtn}>
        OPEN AUTOMATION REGISTRY →
      </button>
    </ExecutiveSecondaryCard>
  );
}
