import { useState } from 'react';
import { useLegacyVaultState } from '../../../../hooks/useLegacyVaultState';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';
import {
  LEGACY_VAULT_PHILOSOPHY,
  PRESERVE_CATEGORY_LABELS,
  TIME_CAPSULE_TRIGGER_LABELS,
} from '../../../../studio-os-core/legacy-vault';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';

type VaultTab = 'overview' | 'archive' | 'experiences' | 'founder';

const TABS: { id: VaultTab; label: string }[] = [
  { id: 'overview', label: 'VAULT OVERVIEW' },
  { id: 'archive', label: 'PERMANENT ARCHIVE' },
  { id: 'experiences', label: 'LEGACY EXPERIENCES' },
  { id: 'founder', label: 'FOUNDER & CAPSULES' },
];

const ACCENT = '#8B0000';

export function LegacyVaultWorkspace() {
  const [tab, setTab] = useState<VaultTab>('overview');
  const [reflection, setReflection] = useState('');
  const { profile, refresh, addFounderReflection, sealTimeCapsule } = useLegacyVaultState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        LEGACY VAULT™ LOADING — PRESERVING ORGANIZATIONAL HISTORY
      </p>
    );
  }

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 106 · LEGACY VAULT V2.0"
        title={profile.companyName.toUpperCase()}
        subtitle="Permanent historical archive — preserve the story of how you were built."
        progressPct={profile.legacyDepthScore}
        stats={[
          { label: 'DEPTH', value: `${profile.legacyDepthScore}%` },
          { label: 'ARCHIVE', value: String(profile.totalArchiveEntries) },
          { label: 'VERSIONS', value: String(profile.versionHistoryCount) },
          { label: 'CAPSULES', value: String(profile.timeCapsulesSealed) },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.legacyDepthScore} size={56} label="LEGACY" accent={ACCENT} />
        <div>
          {LEGACY_VAULT_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
          <p className="text-[6px] font-futura mt-1" style={{ color: ACCENT, fontWeight: 515 }}>
            PRESERVE EXPERTISE. BUILD LEGACY.
          </p>
        </div>
      </div>
      {profile.pendingPreserveSuggestions[0] && (
        <ExecutiveSecondaryCard title="PRESERVE MOMENT">
          <p className="text-[6px] font-futura" style={{ color: ACCENT }}>
            {profile.pendingPreserveSuggestions[0].message}
          </p>
        </ExecutiveSecondaryCard>
      )}
      <button type="button" onClick={refresh} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        REFRESH VAULT
      </button>
    </ExecutivePageShell>
  );

  const renderArchive = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title={`PERMANENT ARCHIVE · ${profile.totalArchiveEntries} ENTRIES · NEVER OVERWRITTEN`}>
        {profile.archiveEntries.map((entry) => (
          <ExecutiveSecondaryCard key={entry.id} title={entry.title.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: ACCENT }}>
              {PRESERVE_CATEGORY_LABELS[entry.category]} · v{entry.version}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {entry.summary.slice(0, 160)}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
      <ExecutiveFocusPanel title={`VERSION HISTORY · ${profile.versionHistoryCount} VERSIONS PRESERVED`}>
        {profile.versionHistory.map((v) => (
          <p key={v.id} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            · {v.label} (v{v.versionNumber}) — {v.summary.slice(0, 80)}
          </p>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderExperiences = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="IMMERSIVE LEGACY EXPERIENCES · EXPERIENCE THE JOURNEY">
        {profile.legacyExperiences.map((exp) => (
          <ExecutiveSecondaryCard key={exp.id} title={exp.title.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {exp.description}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ACCENT }}>
              {exp.entryCount} preserved moment(s)
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderFounder = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="FOUNDER ARCHIVE · HOW THEY THOUGHT">
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="Founder reflection — leadership lesson, decision story, vision update…"
          className="w-full min-h-[48px] p-2 text-[7px] font-futura border mb-2"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        />
        <button
          type="button"
          onClick={() => {
            if (reflection.trim()) {
              addFounderReflection('Founder Reflection', reflection.trim());
              setReflection('');
            }
          }}
          className="px-2 py-1 text-[6px] font-futura uppercase border mb-3"
          style={{ borderColor: ACCENT, color: ACCENT }}
        >
          ADD TO FOUNDER ARCHIVE →
        </button>
        {profile.founderArchive.map((f) => (
          <ExecutiveSecondaryCard key={f.id} title={f.title.toUpperCase()}>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {f.content.slice(0, 140)}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
      <ExecutiveFocusPanel title="ORGANIZATIONAL TIME CAPSULES">
        <button
          type="button"
          onClick={() =>
            sealTimeCapsule(
              '10th Anniversary Capsule',
              'open-10th-anniversary',
              ['Letters', 'Goals', 'Predictions', 'Company snapshot'],
              'A message to our future selves.'
            )
          }
          className="px-2 py-1 text-[6px] font-futura uppercase border mb-2"
          style={{ borderColor: ACCENT, color: ACCENT }}
        >
          SEAL TIME CAPSULE →
        </button>
        {profile.timeCapsules.map((c) => (
          <ExecutiveSecondaryCard key={c.id} title={c.title.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: ACCENT }}>
              {TIME_CAPSULE_TRIGGER_LABELS[c.trigger]} · {c.status.toUpperCase()}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              Contents: {c.contents.join(', ')}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
      {profile.familyLegacy.length > 0 && (
        <ExecutiveFocusPanel title="FAMILY & SUCCESSION LEGACY">
          {profile.familyLegacy.map((f) => (
            <p key={f.id} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              · {f.title}
            </p>
          ))}
        </ExecutiveFocusPanel>
      )}
    </ExecutivePageShell>
  );

  const renderTab = () => {
    switch (tab) {
      case 'archive':
        return renderArchive();
      case 'experiences':
        return renderExperiences();
      case 'founder':
        return renderFounder();
      default:
        return renderOverview();
    }
  };

  return (
    <div>
      <StudioOsBrandTagline systemId="legacy-vault" className="mb-2" />
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
              background: tab === t.id ? 'rgba(139,0,0,0.06)' : 'white',
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
