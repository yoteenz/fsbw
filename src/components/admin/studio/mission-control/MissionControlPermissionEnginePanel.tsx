import { useNavigate } from 'react-router-dom';
import { usePermissionEngineState } from '../../../../hooks/usePermissionEngineState';
import { PERMISSION_ENGINE_ACCENT } from '../../../../studio-os-core/permission-engine';
import { adminStudioPermissionEnginePath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — Permission Engine™ preview (M135). */
export function MissionControlPermissionEnginePanel() {
  const navigate = useNavigate();
  const { profile } = usePermissionEngineState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="PERMISSION ENGINE™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>CAPABILITY ACCESS LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  return (
    <ExecutiveSecondaryCard title="PERMISSION ENGINE™ · CAPABILITIES">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.engineScore} size={52} label="PM" accent={PERMISSION_ENGINE_ACCENT} />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.totalCapabilities} CAPS · {profile.totalRoles} ROLES
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>{profile.activeDelegations} DELEGATIONS · TRUST EARNED</p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.dockPermissionLine.slice(0, 100)}…
      </p>
      <button type="button" onClick={() => navigate(adminStudioPermissionEnginePath())} style={eiaActionBtn}>
        OPEN PERMISSION ENGINE →
      </button>
    </ExecutiveSecondaryCard>
  );
}
