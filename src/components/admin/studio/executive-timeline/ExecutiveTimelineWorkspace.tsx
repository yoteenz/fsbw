import { useState } from 'react';
import { useExecutiveTimelineState } from '../../../../hooks/useExecutiveTimelineState';
import {
  ConciergeCommandExamples,
  EventDetailPanel,
  ExecutiveTimelineAnimationStyles,
  ExecutiveTimelineConnectedSystems,
  ExecutiveTimelineShell,
  ExecutiveTimelineTitleBar,
  LayerToggleBar,
  MorningBriefingPanel,
  OrganizationSelector,
  ProactiveRecommendationsPanel,
  RoutingImpactPreviewPanel,
  RoutingTrustPanel,
  TimelineEventList,
  TimelineMemoryPanel,
  UniversalStudioCommandInput,
  ViewSelector,
} from './ExecutiveTimelinePanels';
import {
  ExecutiveTimelineHistoryWorkspace,
  type HistoryTab,
} from './ExecutiveTimelineHistoryWorkspace';
import { EXECUTIVE_HISTORY_ACCENT } from '../../../../studio-os-core/executive-timeline';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';

type TimelineMode = 'schedule' | 'history';

export function ExecutiveTimelineWorkspace() {
  const [mode, setMode] = useState<TimelineMode>('history');
  const [historyTab, setHistoryTab] = useState<HistoryTab>('overview');
  const {
    store,
    routingStore,
    visibleEvents,
    selectedEvent,
    pendingRoute,
    commandInput,
    askWhyAnswer,
    selectOrganization,
    selectView,
    toggleLayer,
    selectEvent,
    setInput,
    submitCommand,
    approveCommand,
    cancelCommand,
    adjustCommand,
    askWhy,
    dismissRecommendation,
  } = useExecutiveTimelineState();

  return (
    <>
      <ExecutiveTimelineAnimationStyles />
      <div className="flex flex-wrap gap-1 mb-3">
        {(
          [
            { id: 'history' as const, label: 'EXECUTIVE HISTORY · M116' },
            { id: 'schedule' as const, label: 'SCHEDULE · M81' },
          ] as const
        ).map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: mode === m.id ? EXECUTIVE_HISTORY_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: mode === m.id ? EXECUTIVE_HISTORY_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
              fontWeight: mode === m.id ? 515 : 400,
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === 'history' ? (
        <ExecutiveTimelineHistoryWorkspace tab={historyTab} onTabChange={setHistoryTab} />
      ) : (
        <ExecutiveTimelineShell>
          <ExecutiveTimelineTitleBar store={store} />
          <OrganizationSelector activeId={store.activeOrganizationId} onSelect={selectOrganization} />
          <ViewSelector activeView={store.activeView} onSelect={selectView} />
          <LayerToggleBar visibleLayerIds={store.visibleLayerIds} onToggle={toggleLayer} />

          <UniversalStudioCommandInput
            input={commandInput}
            onInputChange={setInput}
            onSubmit={() => submitCommand()}
            pendingRoute={pendingRoute}
            lastNote={routingStore.lastRoutingNote}
            onApprove={pendingRoute ? approveCommand : undefined}
            onCancel={pendingRoute ? cancelCommand : undefined}
            onAdjust={pendingRoute ? adjustCommand : undefined}
            onAskWhy={pendingRoute ? askWhy : undefined}
            askWhyAnswer={askWhyAnswer}
          />

          <MorningBriefingPanel briefing={store.morningBriefing} />

          <ProactiveRecommendationsPanel
            recommendations={store.proactiveRecommendations}
            onDismiss={dismissRecommendation}
          />

          <TimelineEventList
            events={visibleEvents}
            selectedId={store.selectedEventId}
            onSelect={selectEvent}
          />

          {selectedEvent && <EventDetailPanel event={selectedEvent} />}

          {pendingRoute && <RoutingImpactPreviewPanel route={pendingRoute} />}

          <RoutingTrustPanel routingStore={routingStore} />
          <ConciergeCommandExamples />
          <TimelineMemoryPanel
            preferences={store.timelineMemory}
            routingPreferences={routingStore.routingPreferences}
          />
          <ExecutiveTimelineConnectedSystems />
        </ExecutiveTimelineShell>
      )}
    </>
  );
}
