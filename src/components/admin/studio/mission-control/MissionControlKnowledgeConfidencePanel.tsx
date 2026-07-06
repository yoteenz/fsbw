import { useNavigate } from 'react-router-dom';
import { useKnowledgeConfidenceState } from '../../../../hooks/useKnowledgeConfidenceState';
import { confidenceColor } from '../../../../studio-os-core/knowledge-confidence';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';
import { adminStudioKnowledgeConfidencePath } from '../../../../utils/adminStudioRoutes';
import { MC_VISUAL } from '../mission-control/missionControlTheme';

function FuelGauge({ label, score }: { label: string; score: number }) {
  const color = confidenceColor(score);
  return (
    <div className="mb-2">
      <div className="flex justify-between items-center mb-0.5">
        <p style={{ ...eiaCaption, fontSize: '7px', color: MC_VISUAL.black }}>{label}</p>
        <p style={{ fontFamily: '"Covered By Your Grace"', fontSize: '13px', color }}>{score}%</p>
      </div>
      <div style={{ height: 6, background: 'rgba(0,0,0,0.06)', borderRadius: 3, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${score}%`,
            background: color,
            borderRadius: 3,
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
}

/** Mission Control — Knowledge Confidence™ fuel gauges per Profession Brain (M105). */
export function MissionControlKnowledgeConfidencePanel() {
  const navigate = useNavigate();
  const { profile } = useKnowledgeConfidenceState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="KNOWLEDGE CONFIDENCE™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>KNOWLEDGE CONFIDENCE™ LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  const topBrains = profile.brainProfiles
    .slice()
    .sort((a, b) => b.overallConfidenceScore - a.overallConfidenceScore)
    .slice(0, 5);

  const lowestBrain = profile.brainProfiles.slice().sort((a, b) => a.overallConfidenceScore - b.overallConfidenceScore)[0];
  const topRec = profile.learningRecommendations[0];

  return (
    <ExecutiveSecondaryCard title="KNOWLEDGE CONFIDENCE™ · PROFESSION BRAINS">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.overallConfidenceScore} size={52} label="CONFIDENCE" accent="#CA8A04" />
        <div>
          <p style={{ ...eiaCaption, color: MC_VISUAL.black, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.overallConfidenceScore}% · {profile.brainsAssessed} BRAINS ASSESSED
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>
            {profile.brainsNeedingTeaching > 0
              ? `${profile.brainsNeedingTeaching} brain(s) need additional teaching`
              : 'Institutional intelligence quality assured'}
          </p>
        </div>
      </div>
      {topBrains.map((b) => (
        <FuelGauge key={b.brainId} label={b.shortLabel.toUpperCase()} score={b.overallConfidenceScore} />
      ))}
      {lowestBrain && lowestBrain.overallConfidenceScore < 75 ? (
        <p style={{ ...eiaCaption, fontSize: '7px', color: MC_VISUAL.red, marginBottom: 8 }}>
          TEACH: {lowestBrain.shortLabel} ({lowestBrain.overallConfidenceScore}%) — {lowestBrain.weakestDimension}
        </p>
      ) : null}
      {topRec ? (
        <p style={{ ...eiaCaption, fontSize: '7px', color: '#CA8A04', marginBottom: 8 }}>
          {topRec.recommendation.slice(0, 80)}…
        </p>
      ) : null}
      <button type="button" onClick={() => navigate(adminStudioKnowledgeConfidencePath())} style={eiaActionBtn}>
        DRILL INTO KNOWLEDGE CONFIDENCE →
      </button>
    </ExecutiveSecondaryCard>
  );
}
