import { useNavigate } from 'react-router-dom';
import { useCompanyHealthIndexState } from '../../../../hooks/useCompanyHealthIndexState';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';
import { adminStudioCompanyHealthIndexPath } from '../../../../utils/adminStudioRoutes';
import { MC_VISUAL } from '../mission-control/missionControlTheme';

/** Mission Control — Executive Health Score from Company Health Index™ (M97). */
export function MissionControlExecutiveHealthPanel() {
  const navigate = useNavigate();
  const { profile } = useCompanyHealthIndexState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="EXECUTIVE HEALTH SCORE">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>COMPANY HEALTH INDEX™ LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  const topCategories = profile.categoryScores
    .slice()
    .sort((a, b) => a.scorePct - b.scorePct)
    .slice(0, 4);

  return (
    <ExecutiveSecondaryCard title="EXECUTIVE HEALTH SCORE · COMPANY HEALTH INDEX™">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.executiveHealthScore} size={52} label="EXECUTIVE" />
        <div>
          <p style={{ ...eiaCaption, color: MC_VISUAL.black, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.executiveHealthScore}% · {profile.executiveStatus.replace(/-/g, ' ').toUpperCase()}
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>
            {profile.weakAreas.length > 0
              ? `${profile.weakAreas.length} area(s) need proactive attention`
              : 'All major categories above threshold'}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        {topCategories.map((c) => (
          <div key={c.id} className="text-center py-1" style={{ background: 'rgba(0,0,0,0.03)' }}>
            <p style={{ ...eiaCaption, fontSize: '7px', color: MC_VISUAL.black }}>{c.label}</p>
            <p style={{ fontFamily: '"Covered By Your Grace"', fontSize: '14px', color: MC_VISUAL.red }}>{c.scorePct}%</p>
          </div>
        ))}
      </div>
      {profile.weakAreas[0] ? (
        <p style={{ ...eiaCaption, fontSize: '7px', color: MC_VISUAL.red, marginBottom: 8 }}>
          WATCH: {profile.weakAreas[0].label} ({profile.weakAreas[0].scorePct}%) — {profile.weakAreas[0].proactiveAction.slice(0, 60)}…
        </p>
      ) : null}
      <button type="button" onClick={() => navigate(adminStudioCompanyHealthIndexPath())} style={eiaActionBtn}>
        DRILL INTO ALL CATEGORIES →
      </button>
    </ExecutiveSecondaryCard>
  );
}
