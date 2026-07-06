import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnticipationEngineState } from '../../../../hooks/useAnticipationEngineState';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';
import {
  ANTICIPATION_CATEGORY_LABELS,
  ANTICIPATION_ENGINE_PHILOSOPHY,
  PREPARATION_TYPE_LABELS,
} from '../../../../studio-os-core/anticipation-engine';
import { adminStudioMissionControlPath } from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';

type AnticipationTab = 'overview' | 'anticipations' | 'preparations' | 'patterns';

const TABS: { id: AnticipationTab; label: string }[] = [
  { id: 'overview', label: 'ENGINE OVERVIEW' },
  { id: 'anticipations', label: 'ANTICIPATIONS' },
  { id: 'preparations', label: 'PROACTIVE PREPARATION' },
  { id: 'patterns', label: 'PATTERN RECOGNITION' },
];

const ACCENT = '#6366F1';

function urgencyColor(urgency: 'critical' | 'high' | 'medium' | 'low'): string {
  if (urgency === 'critical') return '#DC2626';
  if (urgency === 'high') return '#EA580C';
  if (urgency === 'medium') return ACCENT;
  return ADMIN_STUDIO_THEME.textSecondary;
}

export function AnticipationEngineWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<AnticipationTab>('overview');
  const { profile, refresh } = useAnticipationEngineState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        ANTICIPATION ENGINE™ LOADING — PREDICTING ORGANIZATIONAL NEEDS
      </p>
    );
  }

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 108 · ANTICIPATION ENGINE™"
        title={profile.companyName.toUpperCase()}
        subtitle="Predict needs before founders request them — remove work before work is requested."
        progressPct={profile.anticipationScore}
        stats={[
          { label: 'SCORE', value: `${profile.anticipationScore}%` },
          { label: 'NEEDS', value: String(profile.anticipationsIdentified) },
          { label: 'PREPARED', value: String(profile.preparationsReady) },
          { label: 'PATTERNS', value: String(profile.organizationalPatterns.length) },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.anticipationScore} size={56} label="PREP" accent={ACCENT} />
        <div>
          {ANTICIPATION_ENGINE_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="COMMAND DOCK HEADLINE">
        <p className="text-[6px] font-futura" style={{ color: ACCENT, fontWeight: 515 }}>
          {profile.dockHeadline}
        </p>
        <p className="text-[6px] font-futura mt-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          {profile.preparationsReady} preparation(s) awaiting approval — nothing executes without founder approval.
        </p>
      </ExecutiveSecondaryCard>
      {profile.proactivePreparations.slice(0, 3).map((prep) => (
        <ExecutiveSecondaryCard key={prep.id} title={PREPARATION_TYPE_LABELS[prep.type].toUpperCase()}>
          <p className="text-[6px] font-futura mb-1" style={{ color: ACCENT }}>
            {prep.title}
          </p>
          <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            {prep.description.slice(0, 120)}
          </p>
        </ExecutiveSecondaryCard>
      ))}
      <button
        type="button"
        onClick={() => navigate(adminStudioMissionControlPath())}
        className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border"
        style={{ borderColor: ACCENT, color: ACCENT }}
      >
        MISSION CONTROL →
      </button>
      <button
        type="button"
        onClick={refresh}
        className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border"
        style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}
      >
        REFRESH ANTICIPATIONS
      </button>
    </ExecutivePageShell>
  );

  const renderAnticipations = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title={`${profile.anticipationsIdentified} ORGANIZATIONAL NEEDS ANTICIPATED`}>
        {profile.anticipationItems.map((item) => (
          <ExecutiveSecondaryCard key={item.id} title={ANTICIPATION_CATEGORY_LABELS[item.category].toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: urgencyColor(item.urgency) }}>
              {item.urgency.toUpperCase()} · {item.predictedWindow} · {item.confidencePct}%
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {item.summary}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderPreparations = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title={`${profile.preparationsReady} PROACTIVE PREPARATIONS · AWAITING APPROVAL`}>
        {profile.proactivePreparations.map((prep) => (
          <ExecutiveSecondaryCard key={prep.id} title={PREPARATION_TYPE_LABELS[prep.type].toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: ACCENT }}>
              {prep.title} · AWAITING APPROVAL
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {prep.description}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderPatterns = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="PATTERN RECOGNITION · HISTORICAL ORGANIZATIONAL BEHAVIOR">
        {profile.organizationalPatterns.map((pattern) => (
          <ExecutiveSecondaryCard key={pattern.id} title={pattern.pattern.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {pattern.insight}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ACCENT }}>
              PREPARE: {pattern.preparationAction}
            </p>
            <p className="text-[6px] font-futura mt-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              Confidence {pattern.confidencePct}%
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  return (
    <div>
      <StudioOsBrandTagline systemId="anticipation-engine" className="mb-2" />
      <div className="flex flex-wrap gap-1 mb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? ACCENT : ADMIN_STUDIO_THEME.textSecondary,
              fontWeight: tab === t.id ? 515 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'overview' && renderOverview()}
      {tab === 'anticipations' && renderAnticipations()}
      {tab === 'preparations' && renderPreparations()}
      {tab === 'patterns' && renderPatterns()}
    </div>
  );
}
