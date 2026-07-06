import { useNavigate } from 'react-router-dom';
import { useOrganizationOperatingManualState } from '../../../../hooks/useOrganizationOperatingManualState';
import { OPERATING_MANUAL_ACCENT } from '../../../../studio-os-core/organization-operating-manual';
import { adminStudioOrganizationOperatingManualPath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — Organization Operating Manual™ preview (M120). */
export function MissionControlOrganizationOperatingManualPanel() {
  const navigate = useNavigate();
  const { profile } = useOrganizationOperatingManualState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="ORGANIZATION OPERATING MANUAL™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>OPERATING MANUAL™ LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  return (
    <ExecutiveSecondaryCard title="ORGANIZATION OPERATING MANUAL™ · ONE HANDBOOK · ALWAYS CURRENT">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.manualCompletenessScore} size={52} label="MANUAL" accent={OPERATING_MANUAL_ACCENT} />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.documentsGenerated} SECTIONS · {profile.documentsCurrent} CURRENT · {profile.searchableAnswers} Q&A
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>SINGLE SOURCE OF TRUTH</p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.dockManualLine.slice(0, 100)}…
      </p>
      <button type="button" onClick={() => navigate(adminStudioOrganizationOperatingManualPath())} style={eiaActionBtn}>
        OPEN OPERATING MANUAL →
      </button>
    </ExecutiveSecondaryCard>
  );
}
