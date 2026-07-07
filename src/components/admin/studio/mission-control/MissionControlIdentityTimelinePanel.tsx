import { useNavigate } from 'react-router-dom';
import { useIdentityTimelineState } from '../../../../hooks/useIdentityTimelineState';
import { IDENTITY_TIMELINE_ACCENT } from '../../../../studio-os-core/identity-timeline';
import { adminStudioIdentityTimelinePath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — Identity Timeline™ preview (M168). */
export function MissionControlIdentityTimelinePanel() {
  const navigate = useNavigate();
  const { profile } = useIdentityTimelineState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="IDENTITY TIMELINE™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>TIMELINE PRESERVATION LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  return (
    <ExecutiveSecondaryCard title="IDENTITY TIMELINE™ · PERMANENT JOURNEYS">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.timelineScore} size={52} label="IT" accent={IDENTITY_TIMELINE_ACCENT} />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.peopleWithTimelines} TIMELINES · {profile.totalEvents} EVENTS
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>
            {profile.knowledgeAssetsTotal} knowledge · {profile.mentorshipTotal} mentorships
          </p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.insights[0]?.insight.slice(0, 100) ?? profile.dockTimelineLine.slice(0, 100)}…
      </p>
      <button type="button" onClick={() => navigate(adminStudioIdentityTimelinePath())} style={eiaActionBtn}>
        OPEN IDENTITY TIMELINE →
      </button>
    </ExecutiveSecondaryCard>
  );
}
