import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCrossOrgIntelligenceState } from '../../../../hooks/useCrossOrgIntelligenceState';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';
import {
  CROSS_ORG_PHILOSOPHY,
  NETWORK_TYPE_LABELS,
  PRIVACY_CONTROL_LABELS,
  RESOURCE_TYPE_LABELS,
} from '../../../../studio-os-core/cross-organization-intelligence';
import { adminStudioMissionControlPath } from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';

type CrossOrgTab = 'overview' | 'connections' | 'resources' | 'network';

const TABS: { id: CrossOrgTab; label: string }[] = [
  { id: 'overview', label: 'INTELLIGENCE OVERVIEW' },
  { id: 'connections', label: 'INTELLIGENT CONNECTIONS' },
  { id: 'resources', label: 'RESOURCE AWARENESS' },
  { id: 'network', label: 'FOUNDER NETWORK & PRIVACY' },
];

const ACCENT = '#0284C7';

export function CrossOrganizationIntelligenceWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<CrossOrgTab>('overview');
  const { profile, refresh } = useCrossOrgIntelligenceState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        CROSS-ORGANIZATION INTELLIGENCE™ LOADING — PRESERVING PRIVACY BOUNDARIES
      </p>
    );
  }

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 111 · CROSS-ORGANIZATION INTELLIGENCE™"
        title={profile.companyName.toUpperCase()}
        subtitle="Collaboration, not surveillance — opportunities, not exposure."
        progressPct={profile.collaborationScore}
        stats={[
          { label: 'SCORE', value: `${profile.collaborationScore}%` },
          { label: 'CONNECTIONS', value: String(profile.connectionsSuggested) },
          { label: 'NETWORK', value: String(profile.networkMembers) },
          { label: 'RESOURCES', value: String(profile.discoverableResources.length) },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.collaborationScore} size={56} label="TRUST" accent={ACCENT} />
        <div>
          {CROSS_ORG_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="PRIVACY FIRST">
        <p className="text-[6px] font-futura mb-1" style={{ color: ACCENT, fontWeight: 515 }}>
          {profile.dockHeadline.slice(0, 160)}
        </p>
        <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          Private operational knowledge never shared automatically — every connection permission-based.
        </p>
      </ExecutiveSecondaryCard>
      {profile.connectionSuggestions.slice(0, 2).map((conn) => (
        <ExecutiveSecondaryCard key={conn.id} title={conn.title.toUpperCase()}>
          <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            {conn.needSummary.slice(0, 100)}
          </p>
        </ExecutiveSecondaryCard>
      ))}
      <button type="button" onClick={() => navigate(adminStudioMissionControlPath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ACCENT, color: ACCENT }}>
        MISSION CONTROL →
      </button>
      <button type="button" onClick={refresh} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        REFRESH INTELLIGENCE
      </button>
    </ExecutivePageShell>
  );

  const renderConnections = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title={`${profile.connectionsSuggested} PERMISSION-BASED COLLABORATION OPPORTUNITIES`}>
        {profile.connectionSuggestions.map((conn) => (
          <ExecutiveSecondaryCard key={conn.id} title={conn.title.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: ACCENT }}>
              {conn.partnerOrganization} · {conn.confidencePct}% · {conn.status.replace(/-/g, ' ').toUpperCase()}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              NEED: {conn.needSummary}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              OFFER: {conn.offerSummary}
            </p>
            <p className="text-[6px] font-futura mt-1" style={{ color: '#DC2626' }}>
              PERMISSION REQUIRED — NOT AUTOMATIC
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderResources = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="RESOURCE AWARENESS · DISCOVERABILITY CONTROLLED BY FOUNDER">
        {profile.discoverableResources.map((resource) => (
          <ExecutiveSecondaryCard key={resource.id} title={RESOURCE_TYPE_LABELS[resource.type].toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: resource.discoverable ? ACCENT : ADMIN_STUDIO_THEME.textSecondary }}>
              {resource.discoverable ? 'DISCOVERABLE (AUTHORIZED)' : 'PRIVATE'}
              {resource.capacityPct != null ? ` · ${resource.capacityPct}% capacity` : ''}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {resource.summary}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderNetwork = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title={`FOUNDER NETWORK · ${profile.networkMembers} TRUSTED ORGANIZATIONS`}>
        {profile.founderNetwork.map((member) => (
          <ExecutiveSecondaryCard key={member.id} title={member.organizationName.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: ACCENT }}>
              {NETWORK_TYPE_LABELS[member.networkType].toUpperCase()} · {member.trustLevel.toUpperCase()}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {member.relationship}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              SHARED: {member.sharedCapabilities.join(' · ')}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
      <ExecutiveFocusPanel title="PRIVACY CONTROLS · ORGANIZATIONAL BOUNDARIES RESPECTED">
        {profile.privacySettings.map((setting) => (
          <ExecutiveSecondaryCard key={setting.control} title={PRIVACY_CONTROL_LABELS[setting.control].toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: setting.level === 'private' ? '#DC2626' : ACCENT }}>
              {setting.level.replace(/-/g, ' ').toUpperCase()}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {setting.description}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  return (
    <div>
      <StudioOsBrandTagline systemId="cross-organization-intelligence" className="mb-2" />
      <div className="flex flex-wrap gap-1 mb-3">
        {TABS.map((t) => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)} className="px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: tab === t.id ? ACCENT : ADMIN_STUDIO_THEME.panelBorder, color: tab === t.id ? ACCENT : ADMIN_STUDIO_THEME.textSecondary, fontWeight: tab === t.id ? 515 : 400 }}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'overview' && renderOverview()}
      {tab === 'connections' && renderConnections()}
      {tab === 'resources' && renderResources()}
      {tab === 'network' && renderNetwork()}
    </div>
  );
}
