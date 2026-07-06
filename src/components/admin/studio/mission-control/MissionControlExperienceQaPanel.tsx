import { useNavigate } from 'react-router-dom';
import { useExperienceQaState } from '../../../../hooks/useExperienceQaState';
import { EXPERIENCE_QA_ACCENT } from '../../../../studio-os-core/experience-qa';
import { adminStudioExperienceQaPath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — Experience QA™ preview (M156). */
export function MissionControlExperienceQaPanel() {
  const navigate = useNavigate();
  const { profile } = useExperienceQaState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="EXPERIENCE QA™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>EMOTIONAL QUALITY AUDIT LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  return (
    <ExecutiveSecondaryCard title="EXPERIENCE QA™ · CONFIDENCE, NOT CLICKS">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.overallExperienceScore} size={52} label="EQ" accent={EXPERIENCE_QA_ACCENT} />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.pagesAudited} PAGES · {profile.findingsOpen} FINDINGS
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>
            How people feel · not just task completion
          </p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.dockExperienceLine.slice(0, 110)}…
      </p>
      <button type="button" onClick={() => navigate(adminStudioExperienceQaPath())} style={eiaActionBtn}>
        OPEN EXPERIENCE QA →
      </button>
    </ExecutiveSecondaryCard>
  );
}
