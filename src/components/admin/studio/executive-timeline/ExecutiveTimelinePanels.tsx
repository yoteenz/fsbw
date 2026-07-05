import { Link } from 'react-router-dom';
import {
  UniversalStudioCommandInput,
  RoutingImpactPreviewPanel,
} from '../concierge-routing/UniversalStudioCommandInput';
import {
  CONCIERGE_COMMAND_EXAMPLES,
  TIMELINE_CONNECTED_SYSTEMS,
  TIMELINE_LAYERS,
  TIMELINE_ORGANIZATIONS,
  TIMELINE_VIEWS,
} from '../../../../studio-os-core/executive-timeline/constants';
import type {
  ExecutiveTimelineStore,
  MorningBriefing,
  ProactiveRecommendation,
  TimelineEvent,
  TimelineLayerId,
  TimelineOrganizationId,
  TimelineViewId,
} from '../../../../studio-os-core/executive-timeline/types';
import type { ConciergeRoutingStore, FounderCommandRoute } from '../../../../studio-os-core/concierge-routing/types';
import {
  adminStudioChiefOfStaffPath,
  adminStudioConciergeLayerPath,
  adminStudioExecutiveCouncilPath,
  adminStudioExecutiveTimelinePath,
  adminStudioMissionControlPath,
  adminStudioProductionStudioPath,
  adminStudioPublishingQueuePath,
  adminStudioRenderQueuePath,
} from '../../../../utils/adminStudioRoutes';
import {
  ET_ANIMATION_CSS,
  ET_VISUAL,
  etGrace,
  etLabel,
  etPanelStyle,
  etSectionTitle,
  etValue,
  priorityColor,
  statusColor,
} from './executiveTimelineTheme';

export { RoutingImpactPreviewPanel, UniversalStudioCommandInput };

export function ExecutiveTimelineAnimationStyles() {
  return <style>{ET_ANIMATION_CSS}</style>;
}

export function ExecutiveTimelineShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="executive-timeline relative overflow-hidden rounded-sm studio-glass-sheen"
      style={{
        background: `${ET_VISUAL.marble} center/cover, linear-gradient(180deg, #faf8f5 0%, #f5f0ea 100%)`,
        minHeight: 'min(85vh, 820px)',
        color: ET_VISUAL.text,
      }}
    >
      <div className="absolute inset-0 pointer-events-none et-ambient" style={{ background: ET_VISUAL.ambient }} />
      <div className="relative z-10 p-3">{children}</div>
    </div>
  );
}

export function ExecutiveTimelineTitleBar({ store }: { store: ExecutiveTimelineStore }) {
  const org = TIMELINE_ORGANIZATIONS.find((o) => o.id === store.activeOrganizationId);
  return (
    <header className="mb-4 text-center">
      <p style={{ ...etLabel, color: ET_VISUAL.textDim }}>EXECUTIVE TIMELINE · TEMPORAL INTELLIGENCE · V1.0</p>
      <p style={{ ...etGrace, fontSize: '22px', marginTop: 4 }}>{org?.label ?? 'PORTFOLIO TIMELINE'}</p>
      <p style={{ ...etValue, color: ET_VISUAL.textMuted, fontSize: '7px', marginTop: 6, maxWidth: 520, marginInline: 'auto' }}>
        {store.philosophy[0]}
      </p>
    </header>
  );
}

export function OrganizationSelector({
  activeId,
  onSelect,
}: {
  activeId: TimelineOrganizationId;
  onSelect: (id: TimelineOrganizationId) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 mb-3 justify-center">
      {TIMELINE_ORGANIZATIONS.map((org) => {
        const active = org.id === activeId;
        return (
          <button
            key={org.id}
            type="button"
            onClick={() => onSelect(org.id)}
            className="whitespace-nowrap px-3 py-1.5 transition-all duration-300"
            style={{
              ...etPanelStyle,
              background: active ? ET_VISUAL.champagneSoft : ET_VISUAL.glass,
              borderColor: active ? 'rgba(201,169,98,0.4)' : 'rgba(0,0,0,0.08)',
            }}
          >
            <span style={{ ...etLabel, color: active ? ET_VISUAL.gold : ET_VISUAL.textDim }}>{org.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function ViewSelector({
  activeView,
  onSelect,
}: {
  activeView: TimelineViewId;
  onSelect: (view: TimelineViewId) => void;
}) {
  return (
    <div className="mb-3">
      <p style={{ ...etSectionTitle, textAlign: 'center', marginBottom: 8 }}>TIMELINE VIEWS · SYNCHRONIZED</p>
      <div className="flex flex-wrap gap-1 justify-center max-w-3xl mx-auto">
        {TIMELINE_VIEWS.map((view) => {
          const active = view.id === activeView;
          return (
            <button
              key={view.id}
              type="button"
              onClick={() => onSelect(view.id)}
              className="px-2 py-1 transition-all"
              style={{
                ...etPanelStyle,
                background: active ? 'rgba(99,102,241,0.12)' : ET_VISUAL.glass,
                borderColor: active ? 'rgba(99,102,241,0.3)' : 'rgba(0,0,0,0.06)',
              }}
            >
              <span style={{ ...etLabel, fontSize: '5px', color: active ? ET_VISUAL.portfolio : ET_VISUAL.textDim }}>
                {view.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function LayerToggleBar({
  visibleLayerIds,
  onToggle,
}: {
  visibleLayerIds: TimelineLayerId[];
  onToggle: (layerId: TimelineLayerId) => void;
}) {
  return (
    <div className="mb-4">
      <p style={{ ...etSectionTitle, textAlign: 'center', marginBottom: 8 }}>TIMELINE LAYERS</p>
      <div className="flex flex-wrap gap-1 justify-center max-w-4xl mx-auto">
        {TIMELINE_LAYERS.map((layer) => {
          const visible = visibleLayerIds.includes(layer.id);
          return (
            <button
              key={layer.id}
              type="button"
              onClick={() => onToggle(layer.id)}
              className="px-1.5 py-0.5 transition-all"
              style={{
                border: ET_VISUAL.glassBorder,
                background: visible ? `${layer.accent}18` : 'rgba(255,255,255,0.5)',
                opacity: visible ? 1 : 0.45,
              }}
            >
              <span style={{ ...etLabel, fontSize: '5px', color: visible ? layer.accent : ET_VISUAL.textDim }}>
                {layer.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function MorningBriefingPanel({ briefing }: { briefing: MorningBriefing }) {
  const sections = [
    { label: 'TODAY\'S PRIORITIES', items: briefing.todaysPriorities },
    { label: 'UPCOMING DEADLINES', items: briefing.upcomingDeadlines },
    { label: 'EXECUTIVE MEETINGS', items: briefing.executiveMeetings },
    { label: 'PUBLISHING SCHEDULE', items: briefing.publishingSchedule },
    { label: 'POTENTIAL CONFLICTS', items: briefing.potentialConflicts },
    { label: 'RECOMMENDED ADJUSTMENTS', items: briefing.recommendedAdjustments },
  ];

  return (
    <div className="mb-4 p-3 rounded-sm max-w-3xl mx-auto" style={etPanelStyle}>
      <p style={{ ...etLabel, color: ET_VISUAL.gold, textAlign: 'center', marginBottom: 4 }}>
        MORNING BRIEFING · CHIEF CONCIERGE
      </p>
      <p style={{ ...etValue, fontSize: '7px', textAlign: 'center', marginBottom: 12, color: ET_VISUAL.textMuted }}>
        {briefing.chiefConciergeSummary}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sections.map((s) => (
          <div key={s.label}>
            <p style={{ ...etLabel, marginBottom: 4 }}>{s.label}</p>
            <ul className="space-y-1">
              {s.items.map((item, i) => (
                <li key={i} style={{ ...etValue, fontSize: '6px', color: ET_VISUAL.textMuted }}>
                  · {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p style={{ ...etLabel, textAlign: 'center', marginTop: 12, color: ET_VISUAL.portfolio }}>
        ORG HEALTH · {briefing.organizationalHealth}
      </p>
    </div>
  );
}

export function TimelineEventCard({
  event,
  selected,
  onSelect,
}: {
  event: TimelineEvent;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const org = TIMELINE_ORGANIZATIONS.find((o) => o.id === event.organizationId);
  const layer = TIMELINE_LAYERS.find((l) => l.id === event.layerId);
  const start = new Date(event.startAt);

  return (
    <button
      type="button"
      onClick={() => onSelect(event.id)}
      className={`text-left w-full px-3 py-2 mb-2 transition-all ${selected ? 'et-event-active' : ''}`}
      style={{
        ...etPanelStyle,
        borderColor: selected ? 'rgba(99,102,241,0.35)' : 'rgba(0,0,0,0.08)',
        background: selected ? 'rgba(99,102,241,0.08)' : ET_VISUAL.glass,
      }}
    >
      <div className="flex flex-wrap gap-2 items-start justify-between">
        <div className="flex-1 min-w-0">
          <p style={{ ...etLabel, color: layer?.accent ?? ET_VISUAL.textDim }}>{layer?.label ?? event.layerId}</p>
          <p style={{ ...etValue, fontSize: '7px', marginTop: 2 }}>{event.title}</p>
          <p style={{ ...etValue, fontSize: '6px', color: ET_VISUAL.textMuted, marginTop: 2 }}>
            {start.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            {' · '}
            {start.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
            {' · '}
            {org?.label}
          </p>
        </div>
        <div className="text-right shrink-0">
          <span style={{ ...etLabel, color: priorityColor(event.priority), display: 'block' }}>{event.priority.toUpperCase()}</span>
          <span style={{ ...etLabel, color: statusColor(event.status), display: 'block', marginTop: 2 }}>
            {event.status.replace(/-/g, ' ').toUpperCase()}
          </span>
          <span style={{ ...etLabel, display: 'block', marginTop: 2 }}>{event.confidencePct}% CONF</span>
        </div>
      </div>
      {event.dependencies.length > 0 && (
        <p style={{ ...etLabel, fontSize: '5px', marginTop: 6, color: ET_VISUAL.atRisk }}>
          {event.dependencies.length} DEPENDENC{event.dependencies.length === 1 ? 'Y' : 'IES'} · {event.blocks.length} DOWNSTREAM
        </p>
      )}
    </button>
  );
}

export function TimelineEventList({
  events,
  selectedId,
  onSelect,
}: {
  events: TimelineEvent[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const sorted = [...events].sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());

  return (
    <div className="max-w-2xl mx-auto mb-4">
      <p style={{ ...etSectionTitle, textAlign: 'center', marginBottom: 8 }}>
        {sorted.length} EVENT{sorted.length === 1 ? '' : 'S'} · LIVING TIMELINE
      </p>
      {sorted.length === 0 ? (
        <p style={{ ...etValue, textAlign: 'center', color: ET_VISUAL.textMuted }}>No events visible — adjust layers or organization.</p>
      ) : (
        sorted.map((event) => (
          <TimelineEventCard
            key={event.id}
            event={event}
            selected={event.id === selectedId}
            onSelect={onSelect}
          />
        ))
      )}
    </div>
  );
}

export function EventDetailPanel({ event }: { event: TimelineEvent }) {
  const org = TIMELINE_ORGANIZATIONS.find((o) => o.id === event.organizationId);

  return (
    <div className="mb-4 p-3 rounded-sm max-w-2xl mx-auto" style={etPanelStyle}>
      <p style={{ ...etSectionTitle, color: ET_VISUAL.portfolio }}>EVENT CONTEXT</p>
      <p style={{ ...etValue, fontSize: '8px', marginBottom: 8 }}>{event.title}</p>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <DetailRow label="ORGANIZATION" value={org?.label ?? event.organizationId} />
        <DetailRow label="PRIORITY" value={event.priority.toUpperCase()} color={priorityColor(event.priority)} />
        <DetailRow label="STATUS" value={event.status.replace(/-/g, ' ').toUpperCase()} color={statusColor(event.status)} />
        <DetailRow label="CONFIDENCE" value={`${event.confidencePct}%`} />
        <DetailRow label="EFFORT" value={`${event.estimatedEffortMins} min`} />
        <DetailRow label="CONCIERGE" value={event.assignedConcierge ?? '—'} />
        <DetailRow label="EXECUTIVE" value={event.assignedExecutive ?? '—'} />
        {event.personalLifeTag && <DetailRow label="PERSONAL" value={event.personalLifeTag} color={ET_VISUAL.personal} />}
      </div>

      {event.relatedProjects.length > 0 && <DetailList label="RELATED PROJECTS" items={event.relatedProjects} />}
      {event.relatedContent.length > 0 && <DetailList label="RELATED CONTENT" items={event.relatedContent} />}
      {event.dependencies.length > 0 && (
        <div className="mt-2">
          <p style={{ ...etLabel, marginBottom: 4 }}>LIVING DEPENDENCIES</p>
          {event.dependencies.map((dep) => (
            <p key={dep.id} style={{ ...etValue, fontSize: '6px', color: ET_VISUAL.textMuted }}>
              · [{dep.category.toUpperCase()}] {dep.label} · {dep.impactLevel} impact
            </p>
          ))}
        </div>
      )}
      {event.notes && (
        <p style={{ ...etValue, fontSize: '6px', color: ET_VISUAL.textMuted, marginTop: 8, fontStyle: 'italic' }}>
          {event.notes}
        </p>
      )}
    </div>
  );
}

function DetailRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <p style={etLabel}>{label}</p>
      <p style={{ ...etValue, fontSize: '6px', color: color ?? ET_VISUAL.text }}>{value}</p>
    </div>
  );
}

function DetailList({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="mt-2">
      <p style={{ ...etLabel, marginBottom: 2 }}>{label}</p>
      {items.map((item) => (
        <p key={item} style={{ ...etValue, fontSize: '6px', color: ET_VISUAL.textMuted }}>
          · {item}
        </p>
      ))}
    </div>
  );
}

export function ProactiveRecommendationsPanel({
  recommendations,
  onDismiss,
}: {
  recommendations: ProactiveRecommendation[];
  onDismiss: (id: string) => void;
}) {
  const active = recommendations.filter((r) => !r.dismissed);
  if (active.length === 0) return null;

  return (
    <div className="mb-4 max-w-2xl mx-auto">
      <p style={{ ...etSectionTitle, textAlign: 'center', marginBottom: 8 }}>PROACTIVE INTELLIGENCE</p>
      {active.map((rec) => (
        <div key={rec.id} className="p-3 mb-2 rounded-sm" style={etPanelStyle}>
          <p style={{ ...etValue, fontSize: '7px' }}>{rec.insight}</p>
          <p style={{ ...etValue, fontSize: '6px', color: ET_VISUAL.textMuted, marginTop: 4 }}>{rec.reasoning}</p>
          <p style={{ ...etLabel, color: ET_VISUAL.portfolio, marginTop: 6 }}>SUGGESTED · {rec.suggestedAction}</p>
          {rec.requiresApproval && (
            <div className="flex gap-2 mt-2 justify-center">
              <button type="button" style={{ ...etLabel, color: ET_VISUAL.scheduled, cursor: 'pointer' }}>
                APPROVE
              </button>
              <button
                type="button"
                onClick={() => onDismiss(rec.id)}
                style={{ ...etLabel, color: ET_VISUAL.textDim, cursor: 'pointer' }}
              >
                DISMISS
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function ConciergeCommandExamples() {
  return (
    <div className="mb-4 max-w-2xl mx-auto text-center">
      <p style={{ ...etSectionTitle, marginBottom: 8 }}>INTELLIGENT ROUTING EXAMPLES</p>
      <div className="space-y-2">
        {CONCIERGE_COMMAND_EXAMPLES.map((ex) => (
          <p key={ex.command} style={{ ...etValue, fontSize: '6px', color: ET_VISUAL.textMuted }}>
            &ldquo;{ex.command}&rdquo;
          </p>
        ))}
      </div>
    </div>
  );
}

export function TimelineMemoryPanel({
  preferences,
  routingPreferences,
}: {
  preferences: ExecutiveTimelineStore['timelineMemory'];
  routingPreferences?: ConciergeRoutingStore['routingPreferences'];
}) {
  return (
    <div className="mb-4 p-3 rounded-sm max-w-2xl mx-auto" style={etPanelStyle}>
      <p style={{ ...etSectionTitle, textAlign: 'center', marginBottom: 8 }}>TIMELINE & ROUTING MEMORY</p>
      {preferences.map((pref) => (
        <div key={pref.id} className="mb-2">
          <p style={{ ...etLabel, color: ET_VISUAL.gold }}>{pref.category.toUpperCase()}</p>
          <p style={{ ...etValue, fontSize: '6px' }}>{pref.preference}</p>
          <p style={{ ...etLabel, fontSize: '5px' }}>
            Learned from {pref.learnedFrom} · {pref.confidencePct}% confidence
          </p>
        </div>
      ))}
      {routingPreferences?.map((pref) => (
        <div key={pref.id} className="mb-2">
          <p style={{ ...etLabel, color: ET_VISUAL.portfolio }}>ROUTING · {pref.intent.replace(/-/g, ' ').toUpperCase()}</p>
          <p style={{ ...etValue, fontSize: '6px' }}>Prefer {pref.preferredConciergeId.replace(/-/g, ' ')}</p>
          <p style={{ ...etLabel, fontSize: '5px' }}>Learned: {pref.learnedFrom}</p>
        </div>
      ))}
    </div>
  );
}

export function ExecutiveTimelineConnectedSystems() {
  return (
    <div className="mt-4 pt-3 border-t text-center" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
      <div className="flex flex-wrap gap-1 justify-center mb-2">
        {TIMELINE_CONNECTED_SYSTEMS.map((s) => (
          <span key={s} className="text-[5px] font-futura px-1 py-0.5" style={{ ...etLabel, border: ET_VISUAL.glassBorder }}>
            {s}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link to={adminStudioMissionControlPath()} style={{ ...etLabel, fontSize: '6px', color: ET_VISUAL.textMuted }}>
          ← MISSION CONTROL
        </Link>
        <Link to={adminStudioChiefOfStaffPath()} style={{ ...etLabel, fontSize: '6px' }}>
          → CHIEF OF STAFF
        </Link>
        <Link to={adminStudioExecutiveCouncilPath()} style={{ ...etLabel, fontSize: '6px', color: ET_VISUAL.gold }}>
          → EXECUTIVE COUNCIL
        </Link>
        <Link to={adminStudioConciergeLayerPath()} style={{ ...etLabel, fontSize: '6px' }}>
          → CONCIERGE TEAM
        </Link>
        <Link to={adminStudioProductionStudioPath()} style={{ ...etLabel, fontSize: '6px' }}>
          → PRODUCTION STUDIO
        </Link>
        <Link to={adminStudioRenderQueuePath()} style={{ ...etLabel, fontSize: '6px' }}>
          → RENDER QUEUE
        </Link>
        <Link to={adminStudioPublishingQueuePath()} style={{ ...etLabel, fontSize: '6px', color: ET_VISUAL.founder }}>
          → PUBLISHING
        </Link>
        <Link to={adminStudioExecutiveTimelinePath()} style={{ ...etLabel, fontSize: '6px' }}>
          → EXECUTIVE TIMELINE
        </Link>
      </div>
    </div>
  );
}

export function RoutingTrustPanel({ routingStore }: { routingStore: ConciergeRoutingStore }) {
  const top = [...routingStore.conciergeTrust].sort((a, b) => b.trustPct - a.trustPct).slice(0, 4);
  return (
    <div className="mb-4 p-2 rounded-sm max-w-xl mx-auto text-center" style={etPanelStyle}>
      <p style={{ ...etLabel, marginBottom: 6 }}>CONCIERGE ROUTING TRUST</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {top.map((t) => (
          <span key={t.conciergeId} style={{ ...etLabel, fontSize: '5px', border: ET_VISUAL.glassBorder, padding: '2px 6px' }}>
            {t.conciergeId.replace(/-/g, ' ').toUpperCase()} · {t.trustPct}%
          </span>
        ))}
      </div>
    </div>
  );
}

export type { FounderCommandRoute };
