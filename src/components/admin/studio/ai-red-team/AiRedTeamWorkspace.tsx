import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAiRedTeamState } from '../../../../hooks/useAiRedTeamState';
import {
  AI_RED_TEAM_ACCENT,
  AI_RED_TEAM_PHILOSOPHY,
  RED_TEAM_CHALLENGE_QUERIES,
  queryAiRedTeam,
  runFullRedTeamStressTest,
  runRedTeamChallenge,
  updateRedTeamFindingStatus,
} from '../../../../studio-os-core/ai-red-team';
import type { RedTeamFindingStatus } from '../../../../studio-os-core/ai-red-team';
import { adminStudioOrganizationDigitalTwinPath, adminStudioExecutiveTrustDashboardPath, adminStudioQaSimulationEnginePath, adminStudioMissionControlPath } from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';

type RedTeamTab = 'overview' | 'findings' | 'challenges' | 'exposure';

const TABS: { id: RedTeamTab; label: string }[] = [
  { id: 'overview', label: 'RED TEAM OVERVIEW' },
  { id: 'findings', label: 'WEAKNESSES EXPOSED' },
  { id: 'challenges', label: 'RED TEAM CHALLENGES' },
  { id: 'exposure', label: 'EXPOSURE TARGETS' },
];

const SEVERITY_COLOR: Record<string, string> = {
  critical: '#EF4444',
  high: '#F97316',
  medium: '#F59E0B',
  low: '#6B7280',
  info: '#10B981',
};

export function AiRedTeamWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<RedTeamTab>('overview');
  const [searchQuery, setSearchQuery] = useState('automation');
  const [challengeQuery, setChallengeQuery] = useState('');
  const { profile, refresh } = useAiRedTeamState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        AI RED TEAM™ LOADING — ADVERSARIAL STRESS TEST
      </p>
    );
  }

  const searchHits = queryAiRedTeam(searchQuery, profile, 8);

  const handleStressTest = () => {
    runFullRedTeamStressTest(profile.organizationId);
    refresh();
  };

  const handleChallenge = (query: string) => {
    runRedTeamChallenge(profile.organizationId, query);
    refresh();
    setTab('findings');
  };

  const handleStatusChange = (findingId: string, status: RedTeamFindingStatus) => {
    updateRedTeamFindingStatus(profile.organizationId, findingId, status);
    refresh();
  };

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 146 · AI RED TEAM™ · ASSUME WRONG UNTIL PROVEN"
        title={profile.companyName.toUpperCase()}
        subtitle="Internal adversarial layer — challenge, stress test, and intentionally attempt to break Studio OS before users discover weaknesses."
        progressPct={profile.redTeamScore}
        stats={[
          { label: 'RESILIENCE', value: `${profile.redTeamScore}%` },
          { label: 'OPEN', value: `${profile.openFindings}` },
          { label: 'CRITICAL', value: `${profile.criticalFindings}` },
          { label: 'CHALLENGES', value: `${profile.challengesRun}` },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.redTeamScore} size={56} label="RT" accent={AI_RED_TEAM_ACCENT} />
        <div>
          {AI_RED_TEAM_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="QUESTION EVERYTHING · STRENGTHEN BEFORE USERS DISCOVER">
        <p className="text-[6px] font-futura mb-1" style={{ color: AI_RED_TEAM_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          {profile.dockRedTeamLine}
        </p>
        <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
          Purpose is not to criticize — it is to make every organization stronger.
        </p>
      </ExecutiveSecondaryCard>
      <button type="button" onClick={handleStressTest} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: AI_RED_TEAM_ACCENT, color: AI_RED_TEAM_ACCENT }}>
        RUN FULL STRESS TEST
      </button>
      <button type="button" onClick={() => navigate(adminStudioExecutiveTrustDashboardPath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: AI_RED_TEAM_ACCENT, color: AI_RED_TEAM_ACCENT }}>
        TRUST DASHBOARD →
      </button>
      <button type="button" onClick={() => navigate(adminStudioOrganizationDigitalTwinPath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        DIGITAL TWIN →
      </button>
      <button type="button" onClick={() => navigate(adminStudioQaSimulationEnginePath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        QA SIMULATION →
      </button>
      <button type="button" onClick={() => navigate(adminStudioMissionControlPath())} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        MISSION CONTROL →
      </button>
    </ExecutivePageShell>
  );

  const renderFindings = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="WEAKNESSES EXPOSED — ISSUE · SEVERITY · CONFIDENCE · ROOT CAUSE · RESOLUTION">
        {profile.findings.map((f) => (
          <ExecutiveSecondaryCard key={f.id} title={`${f.exposureLabel.toUpperCase()} · ${f.severity.toUpperCase()} · ${f.confidencePct}%`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: SEVERITY_COLOR[f.severity] ?? AI_RED_TEAM_ACCENT, fontWeight: 515 }}>
              {f.issue}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              <strong>Root cause:</strong> {f.rootCause}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: AI_RED_TEAM_ACCENT, fontWeight: 515, lineHeight: 1.45 }}>
              → {f.suggestedResolution}
            </p>
            <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              Affected: {f.affectedSystems.join(' · ')} · {f.status.toUpperCase()}
            </p>
            {f.status === 'open' ? (
              <div className="flex gap-1">
                <button type="button" onClick={() => handleStatusChange(f.id, 'acknowledged')} className="px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: AI_RED_TEAM_ACCENT, color: AI_RED_TEAM_ACCENT }}>
                  ACKNOWLEDGE
                </button>
                <button type="button" onClick={() => handleStatusChange(f.id, 'mitigated')} className="px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: '#10B981', color: '#10B981' }}>
                  MITIGATED
                </button>
                <button type="button" onClick={() => handleStatusChange(f.id, 'dismissed')} className="px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  DISMISS
                </button>
              </div>
            ) : null}
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderChallenges = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="RED TEAM CHALLENGES — INTENTIONALLY BREAK STUDIO OS">
        <textarea
          value={challengeQuery}
          onChange={(e) => setChallengeQuery(e.target.value)}
          placeholder='e.g. "What if two automations trigger simultaneously?"'
          className="w-full min-h-[40px] p-2 text-[7px] font-futura border mb-2"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        />
        <button type="button" onClick={() => { handleChallenge(challengeQuery); setChallengeQuery(''); }} className="px-2 py-1 text-[6px] font-futura uppercase border mb-3" style={{ borderColor: AI_RED_TEAM_ACCENT, color: AI_RED_TEAM_ACCENT }}>
          RUN CHALLENGE →
        </button>
        {RED_TEAM_CHALLENGE_QUERIES.map((q) => (
          <button key={q} type="button" onClick={() => handleChallenge(q)} className="block w-full text-left mb-1 px-2 py-1 text-[6px] font-futura border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
            {q}
          </button>
        ))}
      </ExecutiveFocusPanel>
      <ExecutiveFocusPanel title="RECENT CHALLENGE RUNS">
        {profile.recentChallenges.map((c) => (
          <ExecutiveSecondaryCard key={c.id} title={c.challengeLabel.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: AI_RED_TEAM_ACCENT, fontWeight: 515 }}>
              {c.findingsProduced} findings · {new Date(c.completedAt).toLocaleString()}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {c.summary}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderExposure = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="15 EXPOSURE TARGETS — CONTINUOUS ADVERSARIAL PROBING">
        {profile.exposureMetrics.map((m) => (
          <ExecutiveSecondaryCard key={m.target} title={`${m.label.toUpperCase()} · ${m.stressTestsRun} TESTS`}>
            <p className="text-[6px] font-futura" style={{ color: m.weaknessesFound > 0 ? AI_RED_TEAM_ACCENT : '#10B981', fontWeight: 515 }}>
              {m.weaknessesFound} weaknesses found · last probed {new Date(m.lastProbedAt).toLocaleDateString()}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  return (
    <div>
      <StudioOsBrandTagline systemId="ai-red-team" />
      <div className="flex flex-wrap gap-1 mb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? AI_RED_TEAM_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? AI_RED_TEAM_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
              fontWeight: tab === t.id ? 515 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'overview' ? renderOverview() : null}
      {tab === 'findings' ? renderFindings() : null}
      {tab === 'challenges' ? renderChallenges() : null}
      {tab === 'exposure' ? renderExposure() : null}
      <div className="mt-3">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search weaknesses, exposure targets…"
          className="w-full px-2 py-1 text-[7px] font-futura border mb-2"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'transparent', color: ADMIN_STUDIO_THEME.textPrimary }}
        />
        {searchHits.map((h) => (
          <p key={`${h.type}-${h.id}`} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            <span style={{ color: AI_RED_TEAM_ACCENT }}>{h.label}</span> · {h.matchReason}
          </p>
        ))}
      </div>
      <button type="button" onClick={refresh} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        SYNC AI RED TEAM
      </button>
    </div>
  );
}
