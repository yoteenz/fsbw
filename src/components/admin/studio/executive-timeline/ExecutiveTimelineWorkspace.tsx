import { useExecutiveTimelineState } from '../../../../hooks/useExecutiveTimelineState';
import {
  ConciergeCommandExamples,
  ConversationalTimelinePanel,
  EventDetailPanel,
  ExecutiveTimelineAnimationStyles,
  ExecutiveTimelineConnectedSystems,
  ExecutiveTimelineShell,
  ExecutiveTimelineTitleBar,
  ImpactPreviewPanel,
  LayerToggleBar,
  MorningBriefingPanel,
  OrganizationSelector,
  ProactiveRecommendationsPanel,
  TimelineEventList,
  TimelineMemoryPanel,
  ViewSelector,
} from './ExecutiveTimelinePanels';

export function ExecutiveTimelineWorkspace() {
  const {
    store,
    visibleEvents,
    selectedEvent,
    selectOrganization,
    selectView,
    toggleLayer,
    selectEvent,
    setInput,
    submitCommand,
    approveCommand,
    dismissRecommendation,
  } = useExecutiveTimelineState();

  const pendingCommand = store.conciergeCommands.find((c) => c.status === 'pending-approval') ?? null;

  return (
    <>
      <ExecutiveTimelineAnimationStyles />
      <ExecutiveTimelineShell>
        <ExecutiveTimelineTitleBar store={store} />
        <OrganizationSelector activeId={store.activeOrganizationId} onSelect={selectOrganization} />
        <ViewSelector activeView={store.activeView} onSelect={selectView} />
        <LayerToggleBar visibleLayerIds={store.visibleLayerIds} onToggle={toggleLayer} />

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

        {store.pendingImpact && <ImpactPreviewPanel impact={store.pendingImpact} />}

        <ConversationalTimelinePanel
          input={store.conversationalInput}
          onInputChange={setInput}
          onSubmit={() => submitCommand(store.conversationalInput, 'Chief Concierge')}
          lastResponse={store.lastConciergeResponse}
          pendingCommand={pendingCommand}
          onApprove={approveCommand}
        />

        <ConciergeCommandExamples />
        <TimelineMemoryPanel preferences={store.timelineMemory} />
        <ExecutiveTimelineConnectedSystems />
      </ExecutiveTimelineShell>
    </>
  );
}
