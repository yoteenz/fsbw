import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRelationshipMemoryState } from '../../../../hooks/useRelationshipMemoryState';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';
import {
  FOUNDER_PREFERENCE_LABELS,
  RELATIONSHIP_ENTITY_LABELS,
  RELATIONSHIP_MEMORY_PHILOSOPHY,
} from '../../../../studio-os-core/relationship-memory';
import { adminStudioMissionControlPath } from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';

type RelationshipTab = 'overview' | 'founder' | 'organizational' | 'adaptation';

const TABS: { id: RelationshipTab; label: string }[] = [
  { id: 'overview', label: 'MEMORY OVERVIEW' },
  { id: 'founder', label: 'FOUNDER MEMORY' },
  { id: 'organizational', label: 'ORGANIZATIONAL RELATIONSHIPS' },
  { id: 'adaptation', label: 'INTELLIGENT ADAPTATION' },
];

const ACCENT = '#DB2777';

export function RelationshipMemoryWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<RelationshipTab>('overview');
  const { profile, refresh } = useRelationshipMemoryState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        RELATIONSHIP MEMORY™ LOADING — LEARNING HOW YOU WORK
      </p>
    );
  }

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 112 · RELATIONSHIP MEMORY™"
        title={profile.companyName.toUpperCase()}
        subtitle="Remember how you work. Naturally — familiarity, never intrusive personalization."
        progressPct={profile.familiarityScore}
        stats={[
          { label: 'FAMILIARITY', value: `${profile.familiarityScore}%` },
          { label: 'PREFERENCES', value: String(profile.preferencesLearned) },
          { label: 'RELATIONSHIPS', value: String(profile.relationshipsTracked) },
          { label: 'INSIGHTS', value: String(profile.adaptationInsights.length) },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.familiarityScore} size={56} label="FAMILIAR" accent={ACCENT} />
        <div>
          {RELATIONSHIP_MEMORY_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="COMMAND DOCK ADAPTATION">
        <p className="text-[6px] font-futura" style={{ color: ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          {profile.dockAdaptationLine}
        </p>
      </ExecutiveSecondaryCard>
      <ExecutiveSecondaryCard title="LEARNED THROUGH OBSERVATION">
        <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          No extensive manual setup — Studio OS learns professional preferences from how you naturally work together.
        </p>
      </ExecutiveSecondaryCard>
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
        REFRESH MEMORY
      </button>
    </ExecutivePageShell>
  );

  const renderFounder = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="FOUNDER MEMORY · LEARNED THROUGH OBSERVATION">
        {profile.founderPreferences.map((pref) => (
          <ExecutiveSecondaryCard key={pref.type} title={FOUNDER_PREFERENCE_LABELS[pref.type].toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: ACCENT }}>
              CONFIDENCE {pref.confidencePct}% · {pref.learnedThrough.toUpperCase()}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
              {pref.learnedPreference}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderOrganizational = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="ORGANIZATIONAL RELATIONSHIPS · CONTINUOUSLY STRENGTHENING">
        {profile.organizationalRelationships.map((rel) => (
          <ExecutiveSecondaryCard
            key={rel.id}
            title={`${rel.entityName.toUpperCase()} · ${RELATIONSHIP_ENTITY_LABELS[rel.entityType].toUpperCase()}`}
          >
            <p className="text-[6px] font-futura mb-1" style={{ color: ACCENT }}>
              {rel.interactionCount} INTERACTIONS TRACKED
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              Communication: {rel.preferredCommunication}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              Cadence: {rel.meetingCadence}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              Approval: {rel.approvalWorkflow}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ACCENT }}>
              Recurring: {rel.recurringRequests.join(' · ')}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderAdaptation = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="INTELLIGENT ADAPTATION · FAMILIAR, NEVER INTRUSIVE">
        {profile.adaptationInsights.map((insight) => (
          <ExecutiveSecondaryCard key={insight.id} title={insight.appliesTo.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
              {insight.insight}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ACCENT }}>
              Command Dock: {insight.dockApplication}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              Confidence {insight.confidencePct}%
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  return (
    <div>
      <StudioOsBrandTagline systemId="relationship-memory" className="mb-2" />
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
      {tab === 'founder' && renderFounder()}
      {tab === 'organizational' && renderOrganizational()}
      {tab === 'adaptation' && renderAdaptation()}
    </div>
  );
}
