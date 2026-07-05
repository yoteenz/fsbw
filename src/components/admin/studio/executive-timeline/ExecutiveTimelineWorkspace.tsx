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

export function ExecutiveTimelineWorkspace() {
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
    </>
  );
}
