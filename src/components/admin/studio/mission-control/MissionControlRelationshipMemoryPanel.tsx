import { useNavigate } from 'react-router-dom';
import { useRelationshipMemoryState } from '../../../../hooks/useRelationshipMemoryState';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';
import { adminStudioRelationshipMemoryPath } from '../../../../utils/adminStudioRoutes';
import { MC_VISUAL } from '../mission-control/missionControlTheme';

/** Mission Control — Relationship Memory™ familiarity preview (M112). */
export function MissionControlRelationshipMemoryPanel() {
  const navigate = useNavigate();
  const { profile } = useRelationshipMemoryState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="RELATIONSHIP MEMORY™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>RELATIONSHIP MEMORY™ LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  const topInsight = profile.adaptationInsights[0];

  return (
    <ExecutiveSecondaryCard title="RELATIONSHIP MEMORY™ · HOW YOU WORK">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.familiarityScore} size={52} label="FAMILIAR" accent="#DB2777" />
        <div>
          <p style={{ ...eiaCaption, color: MC_VISUAL.black, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.preferencesLearned} PREFERENCES · {profile.relationshipsTracked} RELATIONSHIPS
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>Familiar — never intrusive</p>
        </div>
      </div>
      {topInsight ? (
        <p style={{ ...eiaCaption, fontSize: '7px', color: '#DB2777', marginBottom: 8, lineHeight: 1.45 }}>
          {topInsight.insight.slice(0, 100)}…
        </p>
      ) : (
        <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 8, lineHeight: 1.45 }}>
          {profile.dockAdaptationLine.slice(0, 100)}…
        </p>
      )}
      <button type="button" onClick={() => navigate(adminStudioRelationshipMemoryPath())} style={eiaActionBtn}>
        OPEN RELATIONSHIP MEMORY →
      </button>
    </ExecutiveSecondaryCard>
  );
}
