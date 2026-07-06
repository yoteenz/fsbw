import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWisdomCaptureState } from '../../../../hooks/useWisdomCaptureState';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';
import {
  WISDOM_CAPTURE_PHILOSOPHY,
  WISDOM_LIBRARY_CATEGORIES,
  WISDOM_LEARNING_TARGETS,
} from '../../../../studio-os-core/wisdom-capture';
import { adminStudioMemoryEnginePath } from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';

type WisdomTab = 'overview' | 'library' | 'detection' | 'learning';

const TABS: { id: WisdomTab; label: string }[] = [
  { id: 'overview', label: 'WISDOM OVERVIEW' },
  { id: 'library', label: 'WISDOM LIBRARY' },
  { id: 'detection', label: 'WISDOM DETECTION' },
  { id: 'learning', label: 'ORGANIZATIONAL LEARNING' },
];

export function WisdomCaptureWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<WisdomTab>('overview');
  const {
    profile,
    refresh,
    detectionInput,
    setDetectionInput,
    runDetection,
    preservePending,
    dismissPending,
    searchQuery,
    setSearchQuery,
    filteredLibrary,
  } = useWisdomCaptureState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        WISDOM CAPTURE™ LOADING — PRESERVING ORGANIZATIONAL INSIGHTS
      </p>
    );
  }

  const pending = profile.pendingDetections.filter((p) => p.status === 'pending');

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 101 · WISDOM CAPTURE"
        title={profile.companyName.toUpperCase()}
        subtitle="Processes explain what happened. Wisdom explains why."
        progressPct={profile.wisdomDepthScore}
        stats={[
          { label: 'WISDOM', value: String(profile.totalWisdomCaptured) },
          { label: 'DEPTH', value: `${profile.wisdomDepthScore}%` },
          { label: 'PENDING', value: String(pending.length) },
          { label: 'TARGETS', value: String(WISDOM_LEARNING_TARGETS.length) },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.wisdomDepthScore} size={56} label="WISDOM" accent="#D97706" />
        <div>
          {WISDOM_CAPTURE_PHILOSOPHY.slice(0, 3).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="PERMANENT WISDOM LIBRARY">
        <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          {profile.totalWisdomCaptured} lessons searchable forever across {WISDOM_LIBRARY_CATEGORIES.length} categories.
        </p>
      </ExecutiveSecondaryCard>
      <button
        type="button"
        onClick={refresh}
        className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border"
        style={{ borderColor: '#D97706', color: '#D97706' }}
      >
        REFRESH WISDOM
      </button>
      <button
        type="button"
        onClick={() => navigate(adminStudioMemoryEnginePath())}
        className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border"
        style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}
      >
        MEMORY ENGINE →
      </button>
    </ExecutivePageShell>
  );

  const renderLibrary = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title={`WISDOM LIBRARY · ${filteredLibrary.length} ENTRIES · SEARCHABLE FOREVER`}>
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search wisdom by keyword, category, department…"
          className="w-full mb-2 p-2 text-[7px] font-futura border"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        />
        {filteredLibrary.map((e) => (
          <ExecutiveSecondaryCard key={e.id} title={`${e.category.replace(/-/g, ' ').toUpperCase()} · ${e.capturedBy.toUpperCase()}`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: '#D97706', fontWeight: 515 }}>
              {e.wisdom}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {e.whyItMatters.slice(0, 100)} · Synced: {e.syncedTo.slice(0, 3).join(', ')}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderDetection = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="WISDOM DETECTION · NON-INTERRUPTING CAPTURE">
        <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          Phrases like "I learned…" · "Next time…" · "We should always…" · "We'll never do that again" trigger gentle preservation prompts.
        </p>
        <textarea
          value={detectionInput}
          onChange={(e) => setDetectionInput(e.target.value)}
          rows={3}
          className="w-full mb-2 p-2 text-[7px] font-futura border"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        />
        <button
          type="button"
          onClick={runDetection}
          className="px-2 py-1 text-[6px] font-futura uppercase border mb-3"
          style={{ borderColor: '#D97706', color: '#D97706' }}
        >
          TEST WISDOM DETECTION
        </button>
        {pending.map((p) => (
          <ExecutiveSecondaryCard key={p.id} title="PENDING · WOULD YOU LIKE TO PRESERVE?">
            <p className="text-[6px] font-futura mb-1" style={{ color: '#D97706' }}>
              {p.prompt}
            </p>
            <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              "{p.extractedWisdom}"
            </p>
            <button
              type="button"
              onClick={() => preservePending(p.id)}
              className="mr-2 px-2 py-1 text-[5px] font-futura uppercase border"
              style={{ borderColor: '#D97706', color: '#D97706' }}
            >
              PRESERVE WISDOM
            </button>
            <button
              type="button"
              onClick={() => dismissPending(p.id)}
              className="px-2 py-1 text-[5px] font-futura uppercase border"
              style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}
            >
              DISMISS
            </button>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderLearning = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="ORGANIZATIONAL LEARNING · EVERY LESSON COMPOUNDS">
        {profile.learningImpacts.map((impact) => (
          <ExecutiveSecondaryCard key={impact.target} title={`${impact.label.toUpperCase()} · ${impact.impactCount} WISDOM ENTRIES`}>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {impact.description}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderTab = () => {
    switch (tab) {
      case 'library':
        return renderLibrary();
      case 'detection':
        return renderDetection();
      case 'learning':
        return renderLearning();
      default:
        return renderOverview();
    }
  };

  return (
    <div>
      <StudioOsBrandTagline systemId="wisdom-capture" className="mb-2" />
      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? '#D97706' : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? '#D97706' : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(217,119,6,0.06)' : 'white',
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
