import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorldKnowledgeEngineState } from '../../../../hooks/useWorldKnowledgeEngineState';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';
import {
  BRIEFING_TYPE_LABELS,
  MONITORING_CATEGORY_LABELS,
  WORLD_KNOWLEDGE_ACCENT,
  WORLD_KNOWLEDGE_PHILOSOPHY,
} from '../../../../studio-os-core/world-knowledge-engine';
import { adminStudioMissionControlPath } from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';

type WorldKnowledgeTab = 'overview' | 'monitoring' | 'briefings' | 'filtering';

const TABS: { id: WorldKnowledgeTab; label: string }[] = [
  { id: 'overview', label: 'WORLD OVERVIEW' },
  { id: 'monitoring', label: 'CONTINUOUS MONITORING' },
  { id: 'briefings', label: 'EXECUTIVE BRIEFINGS' },
  { id: 'filtering', label: 'ORGANIZATION FILTER' },
];

export function WorldKnowledgeEngineWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<WorldKnowledgeTab>('overview');
  const { profile, refresh } = useWorldKnowledgeEngineState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        WORLD KNOWLEDGE ENGINE™ LOADING — MONITORING THE OUTSIDE WORLD
      </p>
    );
  }

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 117 · WORLD KNOWLEDGE ENGINE™"
        title={profile.companyName.toUpperCase()}
        subtitle="Information finds you — Studio OS is your intelligent research partner and window into the outside world."
        progressPct={profile.worldKnowledgeScore}
        stats={[
          { label: 'WORLD KNOWLEDGE', value: `${profile.worldKnowledgeScore}%` },
          { label: 'MONITORED', value: String(profile.signalsMonitored) },
          { label: 'SURFACED', value: String(profile.signalsSurfaced) },
          { label: 'BRIEFINGS', value: String(profile.briefings.length) },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.worldKnowledgeScore} size={56} label="FILTERED" accent={WORLD_KNOWLEDGE_ACCENT} />
        <div>
          {WORLD_KNOWLEDGE_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="TRUSTED WINDOW INTO THE OUTSIDE WORLD">
        <p className="text-[6px] font-futura" style={{ color: WORLD_KNOWLEDGE_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          {profile.dockWorldLine}
        </p>
      </ExecutiveSecondaryCard>
      <ExecutiveSecondaryCard title="ORGANIZATION CONTEXT">
        <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
          {profile.industryFilterSummary}
        </p>
      </ExecutiveSecondaryCard>
      <button
        type="button"
        onClick={() => navigate(adminStudioMissionControlPath())}
        className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border"
        style={{ borderColor: WORLD_KNOWLEDGE_ACCENT, color: WORLD_KNOWLEDGE_ACCENT }}
      >
        MISSION CONTROL →
      </button>
      <button
        type="button"
        onClick={refresh}
        className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border"
        style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}
      >
        REFRESH INTELLIGENCE
      </button>
    </ExecutivePageShell>
  );

  const renderMonitoring = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="CONTINUOUS MONITORING · ONLY WHAT MATTERS TO YOUR ORGANIZATION">
        {profile.filteredSignals.map((signal) => (
          <ExecutiveSecondaryCard key={signal.id} title={MONITORING_CATEGORY_LABELS[signal.category].toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: WORLD_KNOWLEDGE_ACCENT, fontWeight: 515 }}>
              {signal.headline}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
              {signal.summary}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: WORLD_KNOWLEDGE_ACCENT }}>
              WHY IT MATTERS: {signal.whyItMatters}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {signal.relevancePct}% relevance · {signal.impact.toUpperCase()}
              {signal.industrySpecific ? ' · INDUSTRY-SPECIFIC' : ''}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderBriefings = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="EXECUTIVE BRIEFINGS · EVERY REPORT EXPLAINS WHY IT MATTERS">
        {profile.briefings.map((briefing) => (
          <ExecutiveSecondaryCard key={briefing.id} title={BRIEFING_TYPE_LABELS[briefing.type].toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: WORLD_KNOWLEDGE_ACCENT, fontWeight: 515 }}>
              {briefing.title}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
              {briefing.summary}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: WORLD_KNOWLEDGE_ACCENT }}>
              {briefing.whyItMatters}
            </p>
            {briefing.highlights.slice(0, 3).map((h) => (
              <p key={h} className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                · {h}
              </p>
            ))}
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderFiltering = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="ORGANIZATION FILTERING · EVERY ORGANIZATION RECEIVES DIFFERENT INTELLIGENCE">
        <ExecutiveSecondaryCard title={`${profile.industryId.replace(/-/g, ' ').toUpperCase()} FILTER`}>
          <p className="text-[6px] font-futura mb-2" style={{ color: WORLD_KNOWLEDGE_ACCENT, lineHeight: 1.5 }}>
            {profile.industryFilterSummary}
          </p>
          <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            Studio OS understands organizational context — law firms receive court rulings and legislative updates;
            contractors receive material pricing and regulations; beauty brands receive trends, manufacturing, and social signals.
          </p>
        </ExecutiveSecondaryCard>
        <ExecutiveSecondaryCard title="FILTERED VS MONITORED">
          <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            Monitoring {profile.signalsMonitored} global categories · surfacing {profile.signalsSurfaced} organization-relevant signals.
            Founders dramatically reduce time spent searching for information.
          </p>
        </ExecutiveSecondaryCard>
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  return (
    <div>
      <StudioOsBrandTagline systemId="world-knowledge-engine" className="mb-2" />
      <div className="flex flex-wrap gap-1 mb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? WORLD_KNOWLEDGE_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? WORLD_KNOWLEDGE_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
              fontWeight: tab === t.id ? 515 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'overview' && renderOverview()}
      {tab === 'monitoring' && renderMonitoring()}
      {tab === 'briefings' && renderBriefings()}
      {tab === 'filtering' && renderFiltering()}
    </div>
  );
}
