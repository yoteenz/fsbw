import { useNavigate } from 'react-router-dom';
import { useOrganizationDigitalTwinState } from '../../../../hooks/useOrganizationDigitalTwinState';
import { DIGITAL_TWIN_ACCENT } from '../../../../studio-os-core/organization-digital-twin';
import { adminStudioOrganizationDigitalTwinPath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — Digital Twin™ preview (M145). */
export function MissionControlDigitalTwinPanel() {
  const navigate = useNavigate();
  const { profile } = useOrganizationDigitalTwinState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="DIGITAL TWIN™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>SANDBOX REPLICA LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  return (
    <ExecutiveSecondaryCard title="DIGITAL TWIN™ · PRACTICE BEFORE PERFORM">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.twinFidelityScore} size={52} label="DT" accent={DIGITAL_TWIN_ACCENT} />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.sandboxReplicas.length} REPLICAS · {profile.simulationHistory.length} SIMS
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>
            {profile.twinFidelityScore}% fidelity · Studio Intelligence tests safely
          </p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.dockTwinLine.slice(0, 100)}…
      </p>
      <button type="button" onClick={() => navigate(adminStudioOrganizationDigitalTwinPath())} style={eiaActionBtn}>
        OPEN DIGITAL TWIN →
      </button>
    </ExecutiveSecondaryCard>
  );
}
