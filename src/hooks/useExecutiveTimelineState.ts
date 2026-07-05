import { useCallback, useState } from 'react';
import { buildExecutiveTimelineSeed } from '../studio-os-core/executive-timeline/bootstrap';
import {
  approvePendingCommand,
  bootstrapExecutiveTimelineStore,
  dismissProactiveRecommendation,
  getSelectedEvent,
  getVisibleEvents,
  readExecutiveTimelineStore,
  selectTimelineEvent,
  selectTimelineOrganization,
  setConversationalInput,
  setTimelineView,
  submitConciergeCommand,
  toggleTimelineLayer,
} from '../studio-os-core/executive-timeline/store';
import type { TimelineLayerId, TimelineOrganizationId, TimelineViewId } from '../studio-os-core/executive-timeline/types';

function ensureBootstrap(): void {
  bootstrapExecutiveTimelineStore(buildExecutiveTimelineSeed());
}

export function useExecutiveTimelineState() {
  const [, setTick] = useState(0);
  useState(() => {
    ensureBootstrap();
    return 0;
  });

  const refresh = useCallback(() => setTick((t) => t + 1), []);
  const store = readExecutiveTimelineStore();
  const visibleEvents = getVisibleEvents(store);
  const selectedEvent = getSelectedEvent(store);

  const selectOrganization = useCallback(
    (orgId: TimelineOrganizationId) => {
      selectTimelineOrganization(orgId);
      refresh();
    },
    [refresh]
  );

  const selectView = useCallback(
    (viewId: TimelineViewId) => {
      setTimelineView(viewId);
      refresh();
    },
    [refresh]
  );

  const toggleLayer = useCallback(
    (layerId: TimelineLayerId) => {
      toggleTimelineLayer(layerId);
      refresh();
    },
    [refresh]
  );

  const selectEvent = useCallback(
    (eventId: string | null) => {
      selectTimelineEvent(eventId);
      refresh();
    },
    [refresh]
  );

  const setInput = useCallback(
    (text: string) => {
      setConversationalInput(text);
      refresh();
    },
    [refresh]
  );

  const submitCommand = useCallback(
    (text: string, concierge?: string) => {
      const cmd = submitConciergeCommand(text, concierge);
      refresh();
      return cmd;
    },
    [refresh]
  );

  const approveCommand = useCallback(
    (commandId: string) => {
      approvePendingCommand(commandId);
      refresh();
    },
    [refresh]
  );

  const dismissRecommendation = useCallback(
    (id: string) => {
      dismissProactiveRecommendation(id);
      refresh();
    },
    [refresh]
  );

  return {
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
    refresh,
  };
}
