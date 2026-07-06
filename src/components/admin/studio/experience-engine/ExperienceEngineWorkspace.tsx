import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExperienceEngineState } from '../../../../hooks/useExperienceEngineState';
import {
  EXPERIENCE_ENGINE_ACCENT,
  EXPERIENCE_ENGINE_PHILOSOPHY,
  queryExperienceEngine,
  setExperienceMode,
} from '../../../../studio-os-core/experience-engine';
import type { ExperienceModeId } from '../../../../studio-os-core/experience-engine';
import { adminStudioAssetRegistryPath, adminStudioExperienceQaPath, adminStudioMissionControlPath, adminStudioQaHeadquartersPath } from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';

type ExperienceTab = 'overview' | 'modes' | 'environment' | 'context' | 'transitions' | 'governance' | 'discovery';

const TABS: { id: ExperienceTab; label: string }[] = [
  { id: 'overview', label: 'EXPERIENCE OVERVIEW' },
  { id: 'modes', label: 'EXPERIENCE MODES' },
  { id: 'environment', label: 'ADAPTIVE ENVIRONMENT' },
  { id: 'context', label: 'CONTEXT AWARENESS' },
  { id: 'transitions', label: 'TRANSITIONS' },
  { id: 'governance', label: 'GOVERNANCE' },
  { id: 'discovery', label: 'DISCOVERY' },
];

export function ExperienceEngineWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<ExperienceTab>('overview');
  const [searchQuery, setSearchQuery] = useState('focus');
  const { profile, refresh } = useExperienceEngineState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        EXPERIENCE ENGINE™ LOADING — ADAPTIVE ATMOSPHERE
      </p>
    );
  }

  const searchHits = queryExperienceEngine(searchQuery, profile.activeMode, 8);

  const handleSetMode = (modeId: ExperienceModeId) => {
    setExperienceMode(profile.organizationId, modeId);
    refresh();
  };

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 141 · EXPERIENCE ENGINE™ V1.0 · INFRASTRUCTURE CHAPTER COMPLETE"
        title={profile.companyName.toUpperCase()}
        subtitle="Studio OS adapts its atmosphere to match your organization's current moment — calm, confident, intentional."
        progressPct={profile.atmosphereScore}
        stats={[
          { label: 'ATMOSPHERE', value: `${profile.atmosphereScore}%` },
          { label: 'ADAPTABILITY', value: `${profile.adaptabilityPct}%` },
          { label: 'CONTEXT', value: `${profile.contextAwarenessPct}%` },
          { label: 'ACTIVE', value: profile.activeModeLabel.toUpperCase() },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.atmosphereScore} size={56} label="EE" accent={EXPERIENCE_ENGINE_ACCENT} />
        <div>
          {EXPERIENCE_ENGINE_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="INFRASTRUCTURE CHAPTER COMPLETE · STUDIO OS FOUNDATION READY">
        <p className="text-[6px] font-futura mb-1" style={{ color: EXPERIENCE_ENGINE_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          {profile.dockExperienceLine}
        </p>
        <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
          Technology adapts to people. Not the other way around.
        </p>
      </ExecutiveSecondaryCard>
      <button type="button" onClick={() => navigate(adminStudioQaHeadquartersPath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: '#10B981', color: '#10B981' }}>
        QA HEADQUARTERS →
      </button>
      <button type="button" onClick={() => navigate(adminStudioAssetRegistryPath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        ASSET REGISTRY →
      </button>
      <button type="button" onClick={() => navigate(adminStudioMissionControlPath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: EXPERIENCE_ENGINE_ACCENT, color: EXPERIENCE_ENGINE_ACCENT }}>
        MISSION CONTROL →
      </button>
      <button type="button" onClick={() => navigate(adminStudioExperienceQaPath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        EXPERIENCE QA →
      </button>
      <button type="button" onClick={refresh} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        SYNC EXPERIENCE ENGINE
      </button>
    </ExecutivePageShell>
  );

  const renderModes = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="EXPERIENCE MODES — ATMOSPHERE FOR EVERY MOMENT">
        {profile.experienceModes.map((m) => (
          <ExecutiveSecondaryCard key={m.modeId} title={`${m.label.toUpperCase()} · ${m.status.toUpperCase()}`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: EXPERIENCE_ENGINE_ACCENT, fontWeight: 515 }}>
              {m.atmosphere}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {m.description}
            </p>
            {m.modeId !== profile.activeMode && m.status !== 'planned' ? (
              <button
                type="button"
                onClick={() => handleSetMode(m.modeId)}
                className="mt-1 px-2 py-1 text-[6px] font-futura uppercase border"
                style={{ borderColor: EXPERIENCE_ENGINE_ACCENT, color: EXPERIENCE_ENGINE_ACCENT }}
              >
                ACTIVATE {m.label.toUpperCase()}
              </button>
            ) : null}
            {m.modeId === profile.activeMode ? (
              <p className="text-[6px] font-futura mt-1" style={{ color: EXPERIENCE_ENGINE_ACCENT, fontWeight: 515 }}>
                Currently active
              </p>
            ) : null}
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderEnvironment = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="ADAPTIVE ENVIRONMENT — TASTEFUL · PROFESSIONAL">
        {profile.environmentSettings.map((e) => (
          <ExecutiveSecondaryCard key={e.control} title={e.label.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: EXPERIENCE_ENGINE_ACCENT, fontWeight: 515 }}>
              {e.currentValue}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {e.modeInfluence}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderContext = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="CONTEXT AWARENESS — RESPOND TO THE MOMENT">
        {profile.contextSignals.map((c) => (
          <ExecutiveSecondaryCard key={c.signal} title={`${c.label.toUpperCase()} · ${c.active ? 'ACTIVE' : 'MONITORING'}`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: EXPERIENCE_ENGINE_ACCENT, fontWeight: 515 }}>
              {c.currentReading}
            </p>
            {c.suggestedMode ? (
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                Suggested: {c.suggestedMode.replace(/-/g, ' ')}
              </p>
            ) : null}
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderTransitions = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="EXPERIENCE TRANSITIONS — SUBTLE · NEVER DISTRACTING">
        {profile.transitionRules.map((t) => (
          <ExecutiveSecondaryCard key={t.transitionId} title={t.trigger.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: EXPERIENCE_ENGINE_ACCENT, fontWeight: 515 }}>
              {t.fromContext} → {t.toMode.replace(/-/g, ' ')}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {t.description}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderGovernance = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="EXPERIENCE GOVERNANCE · ALIVE WITHOUT OVERWHELMING">
        {profile.governanceFindings.map((f) => (
          <ExecutiveSecondaryCard key={f.id} title={f.severity.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {f.message}
            </p>
            <p className="text-[6px] font-futura" style={{ color: EXPERIENCE_ENGINE_ACCENT, fontWeight: 515 }}>
              → {f.recommendation}
            </p>
          </ExecutiveSecondaryCard>
        ))}
        <ExecutiveSecondaryCard title="RECOMMENDATIONS">
          {profile.recommendations.slice(0, 4).map((r) => (
            <p key={r.id} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              <span style={{ color: EXPERIENCE_ENGINE_ACCENT, fontWeight: 515 }}>{r.priority.toUpperCase()}:</span> {r.title}
            </p>
          ))}
        </ExecutiveSecondaryCard>
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderDiscovery = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="EXPERIENCE DISCOVERY">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Try focus, presentation, celebration, emergency, night mode…"
          className="w-full mb-2 px-2 py-1 text-[7px] font-futura border"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        />
        {searchHits.map((hit) => (
          <ExecutiveSecondaryCard key={`${hit.type}-${hit.id}`} title={hit.label.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: EXPERIENCE_ENGINE_ACCENT, fontWeight: 515 }}>
              {hit.type} · {hit.matchReason}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderTab = () => {
    switch (tab) {
      case 'modes':
        return renderModes();
      case 'environment':
        return renderEnvironment();
      case 'context':
        return renderContext();
      case 'transitions':
        return renderTransitions();
      case 'governance':
        return renderGovernance();
      case 'discovery':
        return renderDiscovery();
      default:
        return renderOverview();
    }
  };

  return (
    <div>
      <StudioOsBrandTagline systemId="experience-engine" className="mb-2" />
      <div className="flex flex-wrap gap-1 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? EXPERIENCE_ENGINE_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? EXPERIENCE_ENGINE_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
              fontWeight: tab === t.id ? 515 : 400,
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
