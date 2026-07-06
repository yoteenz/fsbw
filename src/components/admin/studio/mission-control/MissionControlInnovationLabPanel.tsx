import { useNavigate } from 'react-router-dom';
import { useInnovationLabState } from '../../../../hooks/useInnovationLabState';
import { INNOVATION_LAB_ACCENT } from '../../../../studio-os-core/innovation-lab';
import { adminStudioInnovationLabPath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — Innovation Lab™ preview (M119). */
export function MissionControlInnovationLabPanel() {
  const navigate = useNavigate();
  const { profile } = useInnovationLabState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="INNOVATION LAB™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>INNOVATION LAB™ LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  const topIdea = profile.ideas.find((i) => !i.archived && i.revenuePotentialScore >= 70) ?? profile.ideas[0];

  return (
    <ExecutiveSecondaryCard title="INNOVATION LAB™ · INVENT WHAT COMES NEXT">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.innovationCapabilityScore} size={52} label="INNOVATE" accent={INNOVATION_LAB_ACCENT} />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.ideasGenerated} IDEAS · {profile.revenueOpportunitiesDiscovered} REVENUE OPS · {profile.ideasInPipeline} IN PIPELINE
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>PERMANENT INNOVATION CAPABILITY</p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.dockInnovationLine.slice(0, 100)}…
      </p>
      {topIdea ? (
        <p style={{ ...eiaCaption, fontSize: '7px', color: INNOVATION_LAB_ACCENT, marginBottom: 8 }}>
          {topIdea.title.slice(0, 90)}…
        </p>
      ) : null}
      <button type="button" onClick={() => navigate(adminStudioInnovationLabPath())} style={eiaActionBtn}>
        OPEN INNOVATION LAB →
      </button>
    </ExecutiveSecondaryCard>
  );
}
