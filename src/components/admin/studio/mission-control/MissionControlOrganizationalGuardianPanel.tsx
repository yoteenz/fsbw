import { useNavigate } from 'react-router-dom';
import { useOrganizationalGuardianState } from '../../../../hooks/useOrganizationalGuardianState';
import { ORGANIZATIONAL_GUARDIAN_ACCENT } from '../../../../studio-os-core/organizational-guardian';
import { adminStudioOrganizationalGuardianPath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — Organizational Guardian™ preview (M153). */
export function MissionControlOrganizationalGuardianPanel() {
  const navigate = useNavigate();
  const { profile } = useOrganizationalGuardianState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="ORGANIZATIONAL GUARDIAN™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>GUARDIAN OVERSIGHT LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  return (
    <ExecutiveSecondaryCard title="ORGANIZATIONAL GUARDIAN™ · SILENT PROTECTOR">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.guardianScore} size={52} label="OG" accent={ORGANIZATIONAL_GUARDIAN_ACCENT} />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.domainsMonitored} DOMAINS · {profile.activeAlerts} ALERTS
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>
            Trusted advisor · protect before reacting
          </p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.dockGuardianLine.slice(0, 110)}…
      </p>
      <button type="button" onClick={() => navigate(adminStudioOrganizationalGuardianPath())} style={eiaActionBtn}>
        OPEN GUARDIAN DASHBOARD →
      </button>
    </ExecutiveSecondaryCard>
  );
}
