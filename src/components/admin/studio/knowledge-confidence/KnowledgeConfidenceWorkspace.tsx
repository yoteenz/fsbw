import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKnowledgeConfidenceState } from '../../../../hooks/useKnowledgeConfidenceState';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';
import {
  CONFIDENCE_DECREASE_TRIGGERS,
  CONFIDENCE_DIMENSION_LABELS,
  KNOWLEDGE_CONFIDENCE_PHILOSOPHY,
  confidenceColor,
} from '../../../../studio-os-core/knowledge-confidence';
import { adminStudioProfessionBrainPath, adminStudioStudioInstitutePath } from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';

type ConfidenceTab = 'overview' | 'brains' | 'dimensions' | 'recommendations';

const TABS: { id: ConfidenceTab; label: string }[] = [
  { id: 'overview', label: 'CONFIDENCE OVERVIEW' },
  { id: 'brains', label: 'BRAIN SCORES' },
  { id: 'dimensions', label: 'CONFIDENCE DIMENSIONS' },
  { id: 'recommendations', label: 'LEARNING RECOMMENDATIONS' },
];

const ACCENT = '#CA8A04';

function FuelBar({ label, score }: { label: string; score: number }) {
  const color = confidenceColor(score);
  return (
    <div className="mb-2">
      <div className="flex justify-between mb-0.5">
        <span className="text-[6px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          {label}
        </span>
        <span className="text-[7px] font-futura" style={{ color, fontWeight: 515 }}>
          {score}%
        </span>
      </div>
      <div className="h-1.5 rounded-sm overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
        <div className="h-full rounded-sm" style={{ width: `${score}%`, background: color }} />
      </div>
    </div>
  );
}

export function KnowledgeConfidenceWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<ConfidenceTab>('overview');
  const { profile, refresh } = useKnowledgeConfidenceState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        KNOWLEDGE CONFIDENCE™ LOADING — ASSESSING PROFESSION BRAIN QUALITY
      </p>
    );
  }

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 105 · KNOWLEDGE CONFIDENCE"
        title={profile.companyName.toUpperCase()}
        subtitle="Quality assurance for institutional intelligence — trust through transparency."
        progressPct={profile.overallConfidenceScore}
        stats={[
          { label: 'CONFIDENCE', value: `${profile.overallConfidenceScore}%` },
          { label: 'BRAINS', value: String(profile.brainsAssessed) },
          { label: 'TEACHING', value: String(profile.brainsNeedingTeaching) },
          { label: 'RECOMMENDATIONS', value: String(profile.learningRecommendations.length) },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.overallConfidenceScore} size={56} label="QA" accent={ACCENT} />
        <div>
          {KNOWLEDGE_CONFIDENCE_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveFocusPanel title="CONFIDENCE VISUALIZATION · FUEL GAUGES">
        {profile.brainProfiles.slice(0, 6).map((b) => (
          <FuelBar key={b.brainId} label={b.shortLabel} score={b.overallConfidenceScore} />
        ))}
      </ExecutiveFocusPanel>
      <button
        type="button"
        onClick={() => navigate(adminStudioProfessionBrainPath())}
        className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border"
        style={{ borderColor: ACCENT, color: ACCENT }}
      >
        PROFESSION BRAIN →
      </button>
      <button
        type="button"
        onClick={refresh}
        className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border"
        style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}
      >
        REFRESH CONFIDENCE
      </button>
    </ExecutivePageShell>
  );

  const renderBrains = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title={`${profile.brainsAssessed} PROFESSION BRAINS · OVERALL CONFIDENCE`}>
        {profile.brainProfiles.map((b) => (
          <ExecutiveSecondaryCard key={b.brainId} title={b.brainLabel.toUpperCase()}>
            <div className="flex items-center gap-2 mb-2">
              <ExecutiveHealthRing value={b.overallConfidenceScore} size={36} accent={confidenceColor(b.overallConfidenceScore)} />
              <div>
                <p className="text-[6px] font-futura" style={{ color: confidenceColor(b.overallConfidenceScore) }}>
                  {b.overallConfidenceScore}% overall
                </p>
                <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Strongest: {b.strongestDimension} · Weakest: {b.weakestDimension}
                </p>
              </div>
            </div>
            <FuelBar label={b.shortLabel} score={b.overallConfidenceScore} />
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderDimensions = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="10 CONFIDENCE DIMENSIONS · EVERY BRAIN">
        {Object.values(CONFIDENCE_DIMENSION_LABELS).map((label) => (
          <p key={label} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            · {label}
          </p>
        ))}
      </ExecutiveFocusPanel>
      {profile.brainProfiles.slice(0, 4).map((b) => (
        <ExecutiveSecondaryCard key={b.brainId} title={`${b.shortLabel.toUpperCase()} · DIMENSIONS`}>
          {b.dimensionScores.map((d) => (
            <FuelBar key={d.dimension} label={d.label.split(' ')[0]} score={d.scorePct} />
          ))}
        </ExecutiveSecondaryCard>
      ))}
    </ExecutivePageShell>
  );

  const renderRecommendations = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="CONTINUOUS IMPROVEMENT · CONFIDENCE DECREASE TRIGGERS">
        {CONFIDENCE_DECREASE_TRIGGERS.map((trigger) => (
          <p key={trigger} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            · {trigger} → update Profession Brain™ · Studio Institute™
          </p>
        ))}
      </ExecutiveFocusPanel>
      <ExecutiveFocusPanel title={`${profile.learningRecommendations.length} LEARNING RECOMMENDATIONS`}>
        {profile.learningRecommendations.length === 0 ? (
          <p className="text-[6px] font-futura" style={{ color: '#16A34A' }}>
            All Profession Brains above confidence threshold — institutional intelligence quality assured.
          </p>
        ) : (
          profile.learningRecommendations.map((rec) => (
            <ExecutiveSecondaryCard key={rec.id} title={`${rec.brainLabel.toUpperCase()} · ${rec.priority.toUpperCase()}`}>
              <p className="text-[6px] font-futura mb-1" style={{ color: ACCENT }}>
                Trigger: {rec.trigger}
              </p>
              <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                {rec.recommendation}
              </p>
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                Target: {rec.targetModule === 'both' ? 'Profession Brain™ + Studio Institute™' : rec.targetModule}
              </p>
            </ExecutiveSecondaryCard>
          ))
        )}
      </ExecutiveFocusPanel>
      <button
        type="button"
        onClick={() => navigate(adminStudioStudioInstitutePath())}
        className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border"
        style={{ borderColor: ACCENT, color: ACCENT }}
      >
        STUDIO INSTITUTE →
      </button>
    </ExecutivePageShell>
  );

  const renderTab = () => {
    switch (tab) {
      case 'brains':
        return renderBrains();
      case 'dimensions':
        return renderDimensions();
      case 'recommendations':
        return renderRecommendations();
      default:
        return renderOverview();
    }
  };

  return (
    <div>
      <StudioOsBrandTagline systemId="knowledge-confidence" className="mb-2" />
      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? ACCENT : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(202,138,4,0.06)' : 'white',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {renderTab()}
    </div>
  );
}
