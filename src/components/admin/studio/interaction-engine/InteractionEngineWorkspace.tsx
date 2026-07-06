import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInteractionEngineState } from '../../../../hooks/useInteractionEngineState';
import {
  INTERACTION_ENGINE_ACCENT,
  INTERACTION_ENGINE_PHILOSOPHY,
  queryInteractionPatterns,
} from '../../../../studio-os-core/interaction-engine';
import { adminStudioDesignTokenEnginePath, adminStudioMissionControlPath } from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';

type EngineTab = 'overview' | 'patterns' | 'states' | 'motion' | 'accessibility' | 'governance' | 'discovery';

const TABS: { id: EngineTab; label: string }[] = [
  { id: 'overview', label: 'ENGINE OVERVIEW' },
  { id: 'patterns', label: 'PATTERN CATALOG' },
  { id: 'states', label: 'INTERACTION STATES' },
  { id: 'motion', label: 'MOTION STANDARDS' },
  { id: 'accessibility', label: 'ACCESSIBILITY' },
  { id: 'governance', label: 'BEHAVIOR GOVERNANCE' },
  { id: 'discovery', label: 'DISCOVERY' },
];

export function InteractionEngineWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<EngineTab>('overview');
  const [searchQuery, setSearchQuery] = useState('hover');
  const { profile, refresh } = useInteractionEngineState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        INTERACTION ENGINE™ LOADING — BEHAVIORAL SOURCE OF TRUTH
      </p>
    );
  }

  const searchHits = queryInteractionPatterns(searchQuery, 8);

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 130 · INTERACTION ENGINE™ V1.0"
        title={profile.companyName.toUpperCase()}
        subtitle="Behavioral source of truth — hover, focus, click, feedback, navigation, and accessibility standardized for every Studio OS surface."
        progressPct={profile.engineScore}
        stats={[
          { label: 'ENGINE', value: `${profile.engineScore}%` },
          { label: 'PATTERNS', value: `${profile.totalPatterns}` },
          { label: 'STATES', value: `${profile.totalStates}` },
          { label: 'COMPLY', value: `${profile.componentCompliancePct}%` },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.engineScore} size={56} label="IE" accent={INTERACTION_ENGINE_ACCENT} />
        <div>
          {INTERACTION_ENGINE_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="PLATFORM COHESION · PROTECTED">
        <p className="text-[6px] font-futura" style={{ color: INTERACTION_ENGINE_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          {profile.dockEngineLine}
        </p>
      </ExecutiveSecondaryCard>
      <button type="button" onClick={() => navigate(adminStudioDesignTokenEnginePath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: INTERACTION_ENGINE_ACCENT, color: INTERACTION_ENGINE_ACCENT }}>
        DESIGN TOKEN ENGINE →
      </button>
      <button type="button" onClick={() => navigate(adminStudioMissionControlPath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        MISSION CONTROL →
      </button>
      <button type="button" onClick={refresh} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        SYNC PATTERNS
      </button>
    </ExecutivePageShell>
  );

  const renderPatterns = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="PATTERN CATALOG — STANDARDIZED BEHAVIORS">
        {profile.patterns.slice(0, 14).map((p) => (
          <ExecutiveSecondaryCard key={p.patternId} title={`${p.name.toUpperCase()} · ${p.type.toUpperCase()}`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: INTERACTION_ENGINE_ACCENT, fontWeight: 515 }}>
              {p.trigger} · {p.patternId}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {p.behavior}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderStates = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="INTERACTION STATES — CONSISTENT ACROSS COMPONENTS">
        {profile.states.map((s) => (
          <ExecutiveSecondaryCard key={s.stateId} title={s.label}>
            <p className="text-[6px] font-futura mb-1" style={{ color: s.required ? INTERACTION_ENGINE_ACCENT : ADMIN_STUDIO_THEME.textSecondary, fontWeight: 515 }}>
              {s.required ? 'REQUIRED' : 'OPTIONAL'} · {s.visualCue}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {s.description}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderMotion = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="MOTION STANDARDS — COHESIVE ANIMATION">
        {profile.motionStandards.map((m) => (
          <ExecutiveSecondaryCard key={m.motionId} title={`${m.name.toUpperCase()} · ${m.type.toUpperCase()}`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: INTERACTION_ENGINE_ACCENT, fontWeight: 515 }}>
              {m.value}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {m.description}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderAccessibility = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="ACCESSIBILITY — EVERY INTERACTION INCLUSIVE">
        {profile.accessibilitySpecs.map((a) => (
          <ExecutiveSecondaryCard key={a.requirementId} title={a.label.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: a.mandatory ? INTERACTION_ENGINE_ACCENT : ADMIN_STUDIO_THEME.textSecondary, fontWeight: 515 }}>
              {a.mandatory ? 'MANDATORY' : 'RECOMMENDED'}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {a.description}
            </p>
            <p className="text-[6px] font-futura" style={{ color: INTERACTION_ENGINE_ACCENT, fontWeight: 515 }}>
              → {a.implementation}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderGovernance = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="BEHAVIOR GOVERNANCE — COMPONENTS INHERIT PATTERNS">
        {profile.governanceFindings.slice(0, 10).map((f) => (
          <ExecutiveSecondaryCard key={f.id} title={f.severity.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {f.message}
            </p>
            <p className="text-[6px] font-futura" style={{ color: INTERACTION_ENGINE_ACCENT, fontWeight: 515 }}>
              → {f.recommendation}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderDiscovery = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="PATTERN DISCOVERY">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Try hover, modal, loading, approve…"
          className="w-full mb-2 px-2 py-1 text-[7px] font-futura border"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        />
        {searchHits.map((hit) => (
          <ExecutiveSecondaryCard key={hit.entry.patternId} title={hit.entry.name.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: INTERACTION_ENGINE_ACCENT, fontWeight: 515 }}>
              {hit.entry.type} · {hit.matchReason}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {hit.entry.feedback}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderTab = () => {
    switch (tab) {
      case 'patterns':
        return renderPatterns();
      case 'states':
        return renderStates();
      case 'motion':
        return renderMotion();
      case 'accessibility':
        return renderAccessibility();
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
      <StudioOsBrandTagline systemId="interaction-engine" className="mb-2" />
      <div className="flex flex-wrap gap-1 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? INTERACTION_ENGINE_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? INTERACTION_ENGINE_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
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
