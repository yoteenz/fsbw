import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventBusState } from '../../../../hooks/useEventBusState';
import {
  EVENT_BUS_ACCENT,
  EVENT_BUS_PHILOSOPHY,
  inspectEvents,
  queryEventTypes,
  replayOrganizationEvent,
} from '../../../../studio-os-core/event-bus';
import { useWorkspace } from '../../../../studio-os-core/context/WorkspaceProvider';
import { adminStudioInteractionEnginePath, adminStudioMissionControlPath } from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';

type BusTab = 'overview' | 'catalog' | 'subscriptions' | 'inspector' | 'history' | 'chains' | 'governance' | 'discovery';

const TABS: { id: BusTab; label: string }[] = [
  { id: 'overview', label: 'BUS OVERVIEW' },
  { id: 'catalog', label: 'EVENT CATALOG' },
  { id: 'subscriptions', label: 'SUBSCRIPTIONS' },
  { id: 'inspector', label: 'EVENT INSPECTOR' },
  { id: 'history', label: 'EVENT HISTORY' },
  { id: 'chains', label: 'EVENT CHAINS' },
  { id: 'governance', label: 'GOVERNANCE' },
  { id: 'discovery', label: 'DISCOVERY' },
];

export function EventBusWorkspace() {
  const navigate = useNavigate();
  const { workspaceId } = useWorkspace();
  const [tab, setTab] = useState<BusTab>('overview');
  const [searchQuery, setSearchQuery] = useState('customer');
  const [historyFilter, setHistoryFilter] = useState('');
  const { profile, refresh } = useEventBusState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        EVENT BUS™ LOADING — COMMUNICATION BACKBONE
      </p>
    );
  }

  const searchHits = queryEventTypes(searchQuery, 8);
  const filteredHistory = inspectEvents(profile.eventHistory, { query: historyFilter || undefined });

  const handleReplay = (eventId: string) => {
    const entry = profile.eventHistory.find((e) => e.eventId === eventId);
    if (entry?.replayable) {
      replayOrganizationEvent(workspaceId, entry);
      refresh();
    }
  };

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 131 · EVENT BUS™ V1.0"
        title={profile.companyName.toUpperCase()}
        subtitle="Communication backbone — publish events, subscribe reactions. One event, many intelligent responses."
        progressPct={profile.busScore}
        stats={[
          { label: 'BUS', value: `${profile.busScore}%` },
          { label: 'TYPES', value: `${profile.totalEventTypes}` },
          { label: 'SUBS', value: `${profile.totalSubscriptions}` },
          { label: 'LATENCY', value: `${profile.avgLatencyMs}ms` },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.busScore} size={56} label="EB" accent={EVENT_BUS_ACCENT} />
        <div>
          {EVENT_BUS_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="NERVOUS SYSTEM · LOOSELY COUPLED">
        <p className="text-[6px] font-futura" style={{ color: EVENT_BUS_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          {profile.dockBusLine}
        </p>
      </ExecutiveSecondaryCard>
      <button type="button" onClick={() => navigate(adminStudioInteractionEnginePath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: EVENT_BUS_ACCENT, color: EVENT_BUS_ACCENT }}>
        INTERACTION ENGINE →
      </button>
      <button type="button" onClick={() => navigate(adminStudioMissionControlPath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        MISSION CONTROL →
      </button>
      <button type="button" onClick={refresh} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        SYNC EVENT BUS
      </button>
    </ExecutivePageShell>
  );

  const renderCatalog = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="EVENT CATALOG — STANDARDIZED EVENT TYPES">
        {profile.eventTypes.slice(0, 14).map((e) => (
          <ExecutiveSecondaryCard key={e.eventTypeId} title={`${e.name.toUpperCase()} · ${e.verb.toUpperCase()}`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: EVENT_BUS_ACCENT, fontWeight: 515 }}>
              {e.eventTypeId} · {e.domain}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {e.description}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderSubscriptions = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="SUBSCRIPTIONS — WHO REACTS TO WHAT">
        {profile.subscriptions.slice(0, 14).map((s) => (
          <ExecutiveSecondaryCard key={s.subscriptionId} title={s.subscriberSystem.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: EVENT_BUS_ACCENT, fontWeight: 515 }}>
              {s.eventTypeId} · {s.latencyMs}ms
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {s.reaction}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderInspector = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="EVENT INSPECTOR — MONITOR · REPLAY · DEBUG">
        <div className="flex flex-wrap gap-2 mb-2">
          {profile.inspectorMetrics.map((m) => (
            <ExecutiveSecondaryCard key={m.id} title={m.label.toUpperCase()}>
              <p className="text-[6px] font-futura" style={{ color: EVENT_BUS_ACCENT, fontWeight: 515 }}>
                {m.value} · {m.status.toUpperCase()}
              </p>
            </ExecutiveSecondaryCard>
          ))}
        </div>
        <input
          value={historyFilter}
          onChange={(e) => setHistoryFilter(e.target.value)}
          placeholder="Filter events for inspector…"
          className="w-full mb-2 px-2 py-1 text-[7px] font-futura border"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        />
        {filteredHistory.slice(0, 6).map((e) => (
          <ExecutiveSecondaryCard key={e.eventId} title={e.name.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: EVENT_BUS_ACCENT, fontWeight: 515 }}>
              {e.status.toUpperCase()} · {e.latencyMs}ms · {e.subscriberCount} subs
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {e.payloadSummary}
            </p>
            {e.replayable && (
              <button type="button" onClick={() => handleReplay(e.eventId)} className="px-2 py-0.5 text-[6px] font-futura uppercase border" style={{ borderColor: EVENT_BUS_ACCENT, color: EVENT_BUS_ACCENT }}>
                REPLAY →
              </button>
            )}
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderHistory = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="EVENT HISTORY — PERMANENT AUDIT TRAIL">
        {profile.eventHistory.slice(0, 12).map((e) => (
          <ExecutiveSecondaryCard key={e.eventId} title={`${e.publishedAt.slice(0, 16).replace('T', ' ')} · ${e.name.toUpperCase()}`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: EVENT_BUS_ACCENT, fontWeight: 515 }}>
              {e.publisher} · {e.eventTypeId}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {e.payloadSummary}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderChains = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="EVENT CHAINS — ONE EVENT · MANY REACTIONS">
        {profile.eventChains.map((chain) => (
          <ExecutiveSecondaryCard key={chain.chainId} title={chain.triggerEvent.toUpperCase()}>
            <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {chain.description}
            </p>
            {chain.links.map((link) => (
              <p key={link.order} className="text-[6px] font-futura mb-1" style={{ color: EVENT_BUS_ACCENT, fontWeight: 515 }}>
                {link.order}. {link.systemLabel} — {link.reaction} ({link.latencyMs}ms)
              </p>
            ))}
            <p className="text-[6px] font-futura mt-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              Total chain latency: {chain.totalLatencyMs}ms
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderGovernance = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="BUS GOVERNANCE — NO DIRECT COUPLING">
        {profile.governanceFindings.slice(0, 10).map((f) => (
          <ExecutiveSecondaryCard key={f.id} title={f.severity.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {f.message}
            </p>
            <p className="text-[6px] font-futura" style={{ color: EVENT_BUS_ACCENT, fontWeight: 515 }}>
              → {f.recommendation}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderDiscovery = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="EVENT DISCOVERY">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Try customer, approved, documentation, workflow…"
          className="w-full mb-2 px-2 py-1 text-[7px] font-futura border"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        />
        {searchHits.map((hit) => (
          <ExecutiveSecondaryCard key={hit.entry.eventTypeId} title={hit.entry.name.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: EVENT_BUS_ACCENT, fontWeight: 515 }}>
              {hit.entry.eventTypeId} · {hit.matchReason}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {hit.entry.subscribers.slice(0, 3).join(' · ') || 'no subscribers'}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderTab = () => {
    switch (tab) {
      case 'catalog':
        return renderCatalog();
      case 'subscriptions':
        return renderSubscriptions();
      case 'inspector':
        return renderInspector();
      case 'history':
        return renderHistory();
      case 'chains':
        return renderChains();
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
      <StudioOsBrandTagline systemId="event-bus" className="mb-2" />
      <div className="flex flex-wrap gap-1 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? EVENT_BUS_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? EVENT_BUS_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
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
