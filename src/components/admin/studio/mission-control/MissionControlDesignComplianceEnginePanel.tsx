import { useNavigate } from 'react-router-dom';
import { useDesignComplianceEngineState } from '../../../../hooks/useDesignComplianceEngineState';
import { DESIGN_COMPLIANCE_ENGINE_ACCENT } from '../../../../studio-os-core/design-compliance-engine';
import { adminStudioDesignComplianceEnginePath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — Design Compliance Engine™ preview (M154). */
export function MissionControlDesignComplianceEnginePanel() {
  const navigate = useNavigate();
  const { profile } = useDesignComplianceEngineState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="DESIGN COMPLIANCE ENGINE™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>CREATIVE DIRECTOR AUDIT LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  return (
    <ExecutiveSecondaryCard title="DESIGN COMPLIANCE ENGINE™ · CREATIVE DIRECTOR">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.creativeDirectorScore} size={52} label="DC" accent={DESIGN_COMPLIANCE_ENGINE_ACCENT} />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.pagesAudited} PAGES · {profile.findingsOpen} FINDINGS
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>
            Does it feel like Studio OS?
          </p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.dockComplianceLine.slice(0, 110)}…
      </p>
      <button type="button" onClick={() => navigate(adminStudioDesignComplianceEnginePath())} style={eiaActionBtn}>
        OPEN COMPLIANCE AUDIT →
      </button>
    </ExecutiveSecondaryCard>
  );
}
