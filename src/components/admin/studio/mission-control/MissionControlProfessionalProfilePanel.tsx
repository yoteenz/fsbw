import { useNavigate } from 'react-router-dom';
import { useProfessionalProfileState } from '../../../../hooks/useProfessionalProfileState';
import { PROFESSIONAL_PROFILE_ACCENT } from '../../../../studio-os-core/professional-profile';
import { adminStudioProfessionalProfilePath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — Professional Profile™ preview (M164). */
export function MissionControlProfessionalProfilePanel() {
  const navigate = useNavigate();
  const { profile } = useProfessionalProfileState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="PROFESSIONAL PROFILE™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>LIVING CAREER PROFILES LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  return (
    <ExecutiveSecondaryCard title="PROFESSIONAL PROFILE™ · LIVING CAREERS">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.registryScore} size={52} label="PP" accent={PROFESSIONAL_PROFILE_ACCENT} />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.profilesCount} PROFILES · {profile.timelineEventsTotal} TIMELINE EVENTS
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>
            {profile.brainsLinked} Profession Brains™ · dynamic not frozen
          </p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.dockProfessionalLine.slice(0, 110)}…
      </p>
      <button type="button" onClick={() => navigate(adminStudioProfessionalProfilePath())} style={eiaActionBtn}>
        OPEN PROFESSIONAL PROFILES →
      </button>
    </ExecutiveSecondaryCard>
  );
}
