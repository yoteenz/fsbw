import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePermissionEngineState } from '../../../../hooks/usePermissionEngineState';
import {
  PERMISSION_ENGINE_ACCENT,
  PERMISSION_ENGINE_PHILOSOPHY,
  queryPermissionEngine,
} from '../../../../studio-os-core/permission-engine';
import { adminStudioMissionControlPath, adminStudioPolicyEnginePath } from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';

type EngineTab = 'overview' | 'capabilities' | 'roles' | 'contextual' | 'approval' | 'audit' | 'discovery';

const TABS: { id: EngineTab; label: string }[] = [
  { id: 'overview', label: 'ENGINE OVERVIEW' },
  { id: 'capabilities', label: 'CAPABILITIES' },
  { id: 'roles', label: 'ROLE PROFILES' },
  { id: 'contextual', label: 'CONTEXTUAL' },
  { id: 'approval', label: 'APPROVAL CHAIN' },
  { id: 'audit', label: 'PERMISSION AUDIT' },
  { id: 'discovery', label: 'DISCOVERY' },
];

export function PermissionEngineWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<EngineTab>('overview');
  const [searchQuery, setSearchQuery] = useState('publish');
  const { profile, refresh } = usePermissionEngineState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        PERMISSION ENGINE™ LOADING — CAPABILITY-BASED ACCESS
      </p>
    );
  }

  const searchHits = queryPermissionEngine(searchQuery, 8);

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 135 · PERMISSION ENGINE™ V1.0"
        title={profile.companyName.toUpperCase()}
        subtitle="Permissions describe capabilities — compose access based on what people can do, not merely who they are."
        progressPct={profile.engineScore}
        stats={[
          { label: 'ENGINE', value: `${profile.engineScore}%` },
          { label: 'CAPS', value: `${profile.totalCapabilities}` },
          { label: 'ROLES', value: `${profile.totalRoles}` },
          { label: 'COVERAGE', value: `${profile.capabilityCoveragePct}%` },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.engineScore} size={56} label="PM" accent={PERMISSION_ENGINE_ACCENT} />
        <div>
          {PERMISSION_ENGINE_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="INTUITIVE SECURITY · TRUST EARNED">
        <p className="text-[6px] font-futura" style={{ color: PERMISSION_ENGINE_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          {profile.dockPermissionLine}
        </p>
      </ExecutiveSecondaryCard>
      <button type="button" onClick={() => navigate(adminStudioPolicyEnginePath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: PERMISSION_ENGINE_ACCENT, color: PERMISSION_ENGINE_ACCENT }}>
        POLICY ENGINE →
      </button>
      <button type="button" onClick={() => navigate(adminStudioMissionControlPath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        MISSION CONTROL →
      </button>
      <button type="button" onClick={refresh} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        SYNC PERMISSIONS
      </button>
    </ExecutivePageShell>
  );

  const renderCapabilities = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="MODULAR CAPABILITIES — WHAT PEOPLE CAN DO">
        {profile.capabilities.slice(0, 14).map((c) => (
          <ExecutiveSecondaryCard key={c.capabilityId} title={c.name.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: PERMISSION_ENGINE_ACCENT, fontWeight: 515 }}>
              {c.verb} · {c.resource} · modular
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {c.description}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderRoles = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="ROLE COMPOSITION — REUSABLE PROFILES">
        {profile.roles.map((r) => (
          <ExecutiveSecondaryCard key={r.roleId} title={`${r.label.toUpperCase()} · ${r.capabilityIds.length} CAPABILITIES`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {r.description}
            </p>
            <p className="text-[6px] font-futura" style={{ color: PERMISSION_ENGINE_ACCENT, fontWeight: 515 }}>
              {r.customizable ? 'Customizable' : 'Full access'} · {r.capabilityIds.slice(0, 4).join(' · ')}…
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderContextual = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="CONTEXTUAL PERMISSIONS — ADAPTIVE ACCESS">
        {profile.contextualRules.filter((r) => r.active).map((r) => (
          <ExecutiveSecondaryCard key={r.ruleId} title={r.label.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: PERMISSION_ENGINE_ACCENT, fontWeight: 515 }}>
              {r.dimension} · {r.grantedCapabilities.slice(0, 2).join(' · ')}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {r.description}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderApproval = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="APPROVAL CHAIN — DELEGATED AUTHORITY">
        {profile.approvalChains.map((c) => (
          <ExecutiveSecondaryCard key={c.chainId} title={c.action.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: PERMISSION_ENGINE_ACCENT, fontWeight: 515 }}>
              {c.status.toUpperCase()} · Step: {c.currentStep} · Requester: {c.requester}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {c.steps.map((s) => `${s.step}${s.decision ? ` (${s.decision})` : ''}`).join(' → ')}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderAudit = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="PERMISSION AUDIT — COMPLETE HISTORY">
        {profile.auditHistory.slice(0, 10).map((a) => (
          <ExecutiveSecondaryCard key={a.auditId} title={a.eventType.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: PERMISSION_ENGINE_ACCENT, fontWeight: 515 }}>
              {a.actor} → {a.targetUser ?? 'system'} · {a.occurredAt.slice(0, 16).replace('T', ' ')}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {a.reason}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {a.affectedSystems.join(' · ')}{a.department ? ` · ${a.department}` : ''}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderDiscovery = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="PERMISSION DISCOVERY">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Try publish, finance, approve, legacy vault…"
          className="w-full mb-2 px-2 py-1 text-[7px] font-futura border"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        />
        {searchHits.map((hit) => {
          const key = hit.type === 'capability' ? hit.entry.capabilityId : hit.entry.roleId;
          const title = hit.type === 'capability' ? hit.entry.name : hit.entry.label;
          return (
            <ExecutiveSecondaryCard key={key} title={title.toUpperCase()}>
              <p className="text-[6px] font-futura mb-1" style={{ color: PERMISSION_ENGINE_ACCENT, fontWeight: 515 }}>
                {hit.type} · {hit.matchReason}
              </p>
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                {hit.entry.description}
              </p>
            </ExecutiveSecondaryCard>
          );
        })}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderTab = () => {
    switch (tab) {
      case 'capabilities':
        return renderCapabilities();
      case 'roles':
        return renderRoles();
      case 'contextual':
        return renderContextual();
      case 'approval':
        return renderApproval();
      case 'audit':
        return renderAudit();
      case 'discovery':
        return renderDiscovery();
      default:
        return renderOverview();
    }
  };

  return (
    <div>
      <StudioOsBrandTagline systemId="permission-engine" className="mb-2" />
      <div className="flex flex-wrap gap-1 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? PERMISSION_ENGINE_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? PERMISSION_ENGINE_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
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
