import { useCallback, useState } from 'react';
import { buildConciergeRoutingSeed } from '../studio-os-core/concierge-routing/bootstrap';
import {
  adjustPendingRoute,
  approvePendingRoute,
  bootstrapConciergeRoutingStore,
  cancelPendingRoute,
  explainPendingRoute,
  readConciergeRoutingStore,
  recordRoutingCorrection,
  setUniversalCommandInput,
} from '../studio-os-core/concierge-routing/store';
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
  bootstrapConciergeRoutingStore(buildConciergeRoutingSeed());
  bootstrapExecutiveTimelineStore(buildExecutiveTimelineSeed());
}

export function useExecutiveTimelineState() {
  const [, setTick] = useState(0);
  const [askWhyAnswer, setAskWhyAnswer] = useState<string | undefined>();
  useState(() => {
    ensureBootstrap();
    return 0;
  });

  const refresh = useCallback(() => setTick((t) => t + 1), []);
  const store = readExecutiveTimelineStore();
  const routingStore = readConciergeRoutingStore();
  const visibleEvents = getVisibleEvents(store);
  const selectedEvent = getSelectedEvent(store);
  const pendingRoute = routingStore.pendingRoute;

  const commandInput = routingStore.universalCommandInput || store.conversationalInput;

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
      setUniversalCommandInput(text);
      setConversationalInput(text);
      refresh();
    },
    [refresh]
  );

  const submitCommand = useCallback(
    (text?: string) => {
      const cmd = text ?? commandInput;
      const correction = recordRoutingCorrection(cmd);
      if (correction) {
        refresh();
        return;
      }
      submitConciergeCommand(cmd);
      setAskWhyAnswer(undefined);
      refresh();
    },
    [commandInput, refresh]
  );

  const approveCommand = useCallback(() => {
    const routeId = pendingRoute?.id;
    if (routeId) approvePendingCommand(routeId);
    else approvePendingRoute();
    setAskWhyAnswer(undefined);
    refresh();
  }, [pendingRoute, refresh]);

  const cancelCommand = useCallback(() => {
    cancelPendingRoute();
    setAskWhyAnswer(undefined);
    refresh();
  }, [refresh]);

  const adjustCommand = useCallback(() => {
    adjustPendingRoute('Founder requested adjustment — concierge team will revise proposal.');
    refresh();
  }, [refresh]);

  const askWhy = useCallback(() => {
    setAskWhyAnswer(explainPendingRoute());
    refresh();
  }, [refresh]);

  const dismissRecommendation = useCallback(
    (id: string) => {
      dismissProactiveRecommendation(id);
      refresh();
    },
    [refresh]
  );

  return {
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
    refresh,
  };
}
